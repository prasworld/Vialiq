import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { HistoryService } from './history.service';
import { FormSchemaService } from './form-schema.service';
import { KeyGeneratorService } from './key-generator.service';
import { BUILDER_CONFIG } from '../tokens';

describe('HistoryService', () => {
  let service: HistoryService;
  let schemaService: FormSchemaService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        HistoryService,
        FormSchemaService,
        KeyGeneratorService,
        {
          provide: BUILDER_CONFIG,
          useValue: { historyDebounceMs: 100, maxHistorySize: 3, allowCustomJs: false }
        }
      ]
    });
    
    service = TestBed.inject(HistoryService);
    schemaService = TestBed.inject(FormSchemaService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.canUndo()).toBe(false);
    expect(service.canRedo()).toBe(false);
  });

  it('should record history when schema changes after debounce', () => {
    // Initial flush for the effect to capture the initial state
    TestBed.flushEffects();

    schemaService.addComponent(null, 0, { id: 'test', type: 'text', label: 'Test' });
    TestBed.flushEffects();
    
    // Before debounce, cannot undo
    expect(service.canUndo()).toBe(false);
    
    // Fast forward debounce time
    vi.advanceTimersByTime(100);
    
    expect(service.canUndo()).toBe(true);
  });

  it('should perform undo and redo correctly', () => {
    TestBed.flushEffects();

    schemaService.addComponent(null, 0, { id: 'test1', type: 'text', label: 'Test 1' });
    TestBed.flushEffects();
    vi.advanceTimersByTime(100);
    
    schemaService.addComponent(null, 1, { id: 'test2', type: 'text', label: 'Test 2' });
    TestBed.flushEffects();
    vi.advanceTimersByTime(100);

    expect(schemaService.schema().components.length).toBe(2);
    expect(service.canUndo()).toBe(true);

    service.undo();
    TestBed.flushEffects();
    vi.advanceTimersByTime(100); // Navigation shouldn't record history, but let's clear timers

    expect(schemaService.schema().components.length).toBe(1);
    expect(schemaService.schema().components[0].id).toBe('test1');
    expect(service.canRedo()).toBe(true);

    service.redo();
    TestBed.flushEffects();
    vi.advanceTimersByTime(100);

    expect(schemaService.schema().components.length).toBe(2);
    expect(service.canUndo()).toBe(true);
  });

  it('should not undo if history is empty', () => {
    TestBed.flushEffects();
    
    const schemaBefore = schemaService.schema();
    service.undo();
    expect(schemaService.schema()).toEqual(schemaBefore);
  });

  it('should not redo if future is empty', () => {
    TestBed.flushEffects();

    const schemaBefore = schemaService.schema();
    service.redo();
    expect(schemaService.schema()).toEqual(schemaBefore);
  });

  it('should cap history at maxHistorySize', () => {
    TestBed.flushEffects();

    schemaService.addComponent(null, 0, { id: 'test1', type: 'text', label: '1' });
    TestBed.flushEffects();
    vi.advanceTimersByTime(100);

    schemaService.addComponent(null, 0, { id: 'test2', type: 'text', label: '2' });
    TestBed.flushEffects();
    vi.advanceTimersByTime(100);

    schemaService.addComponent(null, 0, { id: 'test3', type: 'text', label: '3' });
    TestBed.flushEffects();
    vi.advanceTimersByTime(100);

    schemaService.addComponent(null, 0, { id: 'test4', type: 'text', label: '4' });
    TestBed.flushEffects();
    vi.advanceTimersByTime(100);

    // Max size is 3. We made 4 changes. We should be able to undo exactly 3 times.
    service.undo();
    service.undo();
    service.undo();
    expect(service.canUndo()).toBe(false);
  });

  it('should clear future when a new change is made', () => {
    TestBed.flushEffects();

    schemaService.addComponent(null, 0, { id: 'test1', type: 'text', label: '1' });
    TestBed.flushEffects();
    vi.advanceTimersByTime(100);

    service.undo();
    TestBed.flushEffects();
    vi.advanceTimersByTime(100);

    expect(service.canRedo()).toBe(true);

    schemaService.addComponent(null, 0, { id: 'test2', type: 'text', label: '2' });
    TestBed.flushEffects();
    vi.advanceTimersByTime(100);

    expect(service.canRedo()).toBe(false);
  });
});
