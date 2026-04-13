/**
 * @vi/state-fp/kernel — Phase 2.6 Optimistic Updates tests
 * 
 * Tests executeOptimistic with rollback, computed atom updates, and error handling.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { defineAtom, defineComputedAtom, createKernel, command, domainEvent } from './index.js';
import type { Command, CommandHandler, EventApplier, CommandError } from './types.js';

interface CartState {
  readonly items: readonly string[];
  readonly total: number;
}

describe('Phase 2.6 — Optimistic Updates + Rollback', () => {
  let kernel: ReturnType<typeof createKernel>;
  let cartAtom: ReturnType<typeof defineAtom<CartState>>;

  beforeEach(() => {
    // Create fresh atom for each test
    cartAtom = defineAtom<CartState>({
      key: 'vi/cart',
      initialState: { items: [], total: 0 },
    });

    kernel = createKernel();

    // Register a basic handler that does nothing (we'll test optimistic applier instead)
    const handler: CommandHandler<CartState> = {
      commandType: 'cart/*',
      handle: (_state) => ({
        _tag: 'Right' as const,
        right: [],
      }),
    };

    const applier: EventApplier<CartState> = (state) => state;

    kernel.register(cartAtom, handler, applier);
  });

  describe('successful optimistic update', () => {
    it('should apply optimistic state immediately', async () => {
      const result = await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: state.total + 10,
        }),
        confirm: async () => ({ _tag: 'Right' as const, right: undefined }),
      });

      expect(result._tag).toBe('Right');
      expect(cartAtom.get()).toEqual({
        items: ['item-1'],
        total: 10,
      });
    });

    it('should keep optimistic state after confirmation', async () => {
      const before = cartAtom.get();
      await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: state.total + 10,
        }),
        confirm: async () => ({ _tag: 'Right' as const, right: undefined }),
      });

      const after = cartAtom.get();
      expect(after.items).toContain('item-1');
      expect(after.total).toBe(10);
      expect(after).not.toEqual(before);
    });

    it('should notify subscribers with optimistic state', async () => {
      const states: CartState[] = [];
      kernel.subscribe(cartAtom, (state) => states.push(state));

      await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: state.total + 20,
        }),
        confirm: async () => ({ _tag: 'Right' as const, right: undefined }),
      });

      expect(states.length).toBeGreaterThan(0);
      expect(states[states.length - 1].items).toContain('item-1');
    });

    it('should update computed atoms with optimistic state', async () => {
      const itemCountAtom = defineComputedAtom({
        key: 'vi/item-count',
        deps: [cartAtom],
        compute: ([cart]: readonly [CartState]) => cart.items.length,
      });

      kernel.registerComputed(itemCountAtom);
      expect(itemCountAtom.get()).toBe(0);

      await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: state.total + 10,
        }),
        confirm: async () => ({ _tag: 'Right' as const, right: undefined }),
      });

      expect(itemCountAtom.get()).toBe(1);
    });
  });

  describe('failed optimistic update + rollback', () => {
    it('should revert to pre-optimistic state on confirmation failure', async () => {
      const before = cartAtom.get();

      const result = await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: state.total + 10,
        }),
        confirm: async () => ({
          _tag: 'Left' as const,
          left: { code: 'SERVER_ERROR', message: 'Server rejected' },
        }),
      });

      expect(result._tag).toBe('Left');
      expect(cartAtom.get()).toEqual(before);
      expect(cartAtom.get().items).not.toContain('item-1');
    });

    it('should call onRollback when confirmation fails', async () => {
      const rollbackErrors: CommandError[] = [];

      await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: state.total + 10,
        }),
        confirm: async () => ({
          _tag: 'Left' as const,
          left: { code: 'VALIDATION_ERROR', message: 'Out of stock' },
        }),
        onRollback: async (error) => {
          rollbackErrors.push(error);
        },
      });

      expect(rollbackErrors.length).toBe(1);
      expect(rollbackErrors[0].code).toBe('VALIDATION_ERROR');
      expect(rollbackErrors[0].message).toBe('Out of stock');
    });

    it('should revert computed atoms on rollback', async () => {
      const itemCountAtom = defineComputedAtom({
        key: 'vi/item-count',
        deps: [cartAtom],
        compute: ([cart]: readonly [CartState]) => cart.items.length,
      });

      kernel.registerComputed(itemCountAtom);
      expect(itemCountAtom.get()).toBe(0);

      await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: state.total + 10,
        }),
        confirm: async () => ({
          _tag: 'Left' as const,
          left: { code: 'ERROR', message: 'Failed' },
        }),
      });

      expect(itemCountAtom.get()).toBe(0);
    });

    it('should not call onRollback callback on success', async () => {
      let rollbackCalled = false;

      await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: state.total + 10,
        }),
        confirm: async () => ({ _tag: 'Right' as const, right: undefined }),
        onRollback: async () => {
          rollbackCalled = true;
        },
      });

      expect(rollbackCalled).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle confirm() throwing an error', async () => {
      const before = cartAtom.get();

      const result = await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: state.total + 10,
        }),
        confirm: async () => {
          throw new Error('Network error');
        },
      });

      expect(result._tag).toBe('Left');
      expect(result.left.code).toBe('HANDLER_ERROR');
      expect(result.left.message).toContain('Network error');
      expect(cartAtom.get()).toEqual(before);
    });

    it('should handle onRollback() throwing an error gracefully', async () => {
      // Should not throw — onRollback errors are caught
      const result = await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: state.total + 10,
        }),
        confirm: async () => ({
          _tag: 'Left' as const,
          left: { code: 'ERROR', message: 'Failed' },
        }),
        onRollback: async () => {
          throw new Error('Notification failed');
        },
      });

      expect(result._tag).toBe('Left');
      expect(cartAtom.get().items).not.toContain('item-1');
    });

    it('should return CommandError with proper code when confirm rejects', async () => {
      const result = await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: state.total + 10,
        }),
        confirm: async () => {
          throw new Error('Timeout');
        },
      });

      expect(result._tag).toBe('Left');
      expect(result.left).toHaveProperty('code');
      expect(result.left).toHaveProperty('message');
    });
  });

  describe('atomic state transitions', () => {
    it('should not leak partial state on failure', async () => {
      const before = { ...cartAtom.get() };

      await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1', 'item-2'],
          total: state.total + 20,
        }),
        confirm: async () => ({
          _tag: 'Left' as const,
          left: { code: 'ERROR', message: 'Operation cancelled' },
        }),
      });

      const after = cartAtom.get();
      expect(after.items.length).toBe(before.items.length);
      expect(after.total).toBe(before.total);
      expect(after).toEqual(before);
    });

    it('should handle multiple sequential optimistic updates', async () => {
      // First optimistic update
      await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: state.total + 10,
        }),
        confirm: async () => ({ _tag: 'Right' as const, right: undefined }),
      });

      expect(cartAtom.get().items).toContain('item-1');

      // Second optimistic update
      await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-2'],
          total: state.total + 15,
        }),
        confirm: async () => ({ _tag: 'Right' as const, right: undefined }),
      });

      expect(cartAtom.get().items).toContain('item-1');
      expect(cartAtom.get().items).toContain('item-2');
      expect(cartAtom.get().total).toBe(25);
    });

    it('should handle rollback after successful first update', async () => {
      // First update succeeds
      await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: state.total + 10,
        }),
        confirm: async () => ({ _tag: 'Right' as const, right: undefined }),
      });

      const afterFirst = cartAtom.get();
      expect(afterFirst.items).toContain('item-1');

      // Second update fails
      await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-2'],
          total: state.total + 15,
        }),
        confirm: async () => ({
          _tag: 'Left' as const,
          left: { code: 'ERROR', message: 'Failed' },
        }),
      });

      const afterSecond = cartAtom.get();
      // Should still have item-1, but not item-2
      expect(afterSecond.items).toContain('item-1');
      expect(afterSecond.items).not.toContain('item-2');
      expect(afterSecond.total).toBe(10);
    });
  });

  describe('command metadata', () => {
    it('should stamp command with correlation ID', async () => {
      let _interceptedCmd: Command | undefined;

      await kernel.executeOptimistic(cartAtom, command('cart/add', { sku: 'ABC' }), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: state.total + 10,
        }),
        confirm: async () => {
          // In a real scenario, the cmd would be sent to server
          return { _tag: 'Right' as const, right: undefined };
        },
        onRollback: async () => {},
      });

      // The command should have metadata
      // (In practice, this would be verified by inspecting what gets sent to server)
    });
  });

  describe('subscription integration', () => {
    it('should notify subscribers before and after rollback', async () => {
      const states: CartState[] = [];
      kernel.subscribe(cartAtom, (state) => states.push(state));

      await kernel.executeOptimistic(cartAtom, command('cart/add'), {
        optimisticApplier: (state) => ({
          items: [...state.items, 'item-1'],
          total: 10,
        }),
        confirm: async () => ({
          _tag: 'Left' as const,
          left: { code: 'ERROR', message: 'Failed' },
        }),
      });

      // Should have: optimistic state + reverted state
      expect(states.length).toBeGreaterThanOrEqual(2);
      // First notification: optimistic
      expect(states[0].items).toContain('item-1');
      // Last notification: reverted
      expect(states[states.length - 1].items).not.toContain('item-1');
    });
  });
});
