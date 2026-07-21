import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './vi-chip.js';
import './vi-chip-group.js';
import '../button/vi-button.js';
import '../icons/vi-icon.js';
import type { ViChipGroup } from './vi-chip-group.js';

const meta: Meta = {
  title: 'Components/Chip',
  component: 'vi-chip',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    removable: { control: 'boolean' },
    removeLabel: { control: 'text' },
  },
};
export default meta;

export const Default: StoryObj = {
  render: (args) => html`
    <vi-chip
      variant=${ifDefined(args.variant)}
      size=${ifDefined(args.size)}
      ?selected=${args.selected}
      ?disabled=${args.disabled}
      ?removable=${args.removable}
      remove-label=${ifDefined(args.removeLabel)}
    >
      Status Chip
    </vi-chip>
  `,
  args: {
    variant: 'neutral',
    size: 'md',
    selected: false,
    disabled: false,
    removable: false,
    removeLabel: 'Remove',
  },
};

export const GroupMulti: StoryObj = {
  render: () => html`
    <vi-chip-group multi>
      <vi-chip value="grade-1">Grade 1</vi-chip>
      <vi-chip value="grade-2">Grade 2</vi-chip>
      <vi-chip value="grade-3" variant="warning">Grade 3</vi-chip>
      <vi-chip value="grade-4" variant="danger">Grade 4</vi-chip>
      <vi-chip value="grade-5" variant="danger">Grade 5</vi-chip>
    </vi-chip-group>
  `,
};

export const GroupSingle: StoryObj = {
  render: () => html`
    <vi-chip-group .multi=${false}>
      <vi-chip value="1" variant="primary">
        <vi-icon slot="icon" name="calendar" size="12"></vi-icon>
        Visit 1
      </vi-chip>
      <vi-chip value="2" variant="primary">
        <vi-icon slot="icon" name="calendar" size="12"></vi-icon>
        Visit 2
      </vi-chip>
    </vi-chip-group>
  `,
};

export const WithAvatar: StoryObj = {
  render: () => html`
    <vi-chip removable>
      <img slot="avatar" src="https://i.pravatar.cc/150?u=1" alt="Avatar" />
      John Doe
    </vi-chip>
  `,
};

export const LocalizedRemoveLabel: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
      <vi-chip removable remove-label="Supprimer cet élément">
        French Label (Supprimer)
      </vi-chip>
      <vi-chip removable remove-label="Entfernen">
        German Label (Entfernen)
      </vi-chip>
      <vi-chip removable remove-label="Eliminar filtro">
        Spanish Label (Eliminar)
      </vi-chip>
    </div>
  `,
};

export const DisabledStatePropagation: StoryObj = {
  args: {
    disabled: false,
  },

  render: () => html`
    <div
      style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;"
    >
      <vi-chip removable disabled remove-label="Remove item">
        Disabled Removable Chip
      </vi-chip>
      <vi-chip disabled variant="primary"> Disabled Primary Chip </vi-chip>
      <vi-chip disabled variant="warning" selected>
        Disabled Selected Chip
      </vi-chip>
    </div>
  `,
};

export const GroupDisabledToggle: StoryObj = {
  render: () => {
    const toggleDisabled = () => {
      const group = document.querySelector('#toggle-group') as ViChipGroup;
      if (group) {
        group.disabled = !group.disabled;
        const btn = document.querySelector('#toggle-btn') as HTMLElement;
        if (btn)
          btn.textContent = group.disabled ? 'Enable Group' : 'Disable Group';
      }
    };

    return html`
      <div
        style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;"
      >
        <button
          id="toggle-btn"
          style="padding: 8px 16px; cursor: pointer; border-radius: 4px; border: 1px solid #ccc; background: #f0f0f0;"
          @click=${toggleDisabled}
        >
          Disable Group
        </button>
        <vi-chip-group id="toggle-group" multi>
          <vi-chip value="opt1">Option 1 (Normal)</vi-chip>
          <vi-chip value="opt2" disabled>Option 2 (Initially Disabled)</vi-chip>
          <vi-chip value="opt3" variant="primary">Option 3 (Normal)</vi-chip>
        </vi-chip-group>
      </div>
    `;
  },
};

export const ProgrammaticSelectAndClear: StoryObj = {
  render: () => {
    const handleSelectAll = () => {
      const group = document.querySelector('#action-group') as ViChipGroup;
      group?.selectAll();
    };
    const handleClearAll = () => {
      const group = document.querySelector('#action-group') as ViChipGroup;
      group?.clearAll();
    };

    return html`
      <div
        style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;"
      >
        <div style="display: flex; gap: 8px;">
          <button
            style="padding: 6px 12px; cursor: pointer;"
            @click=${handleSelectAll}
          >
            Select All
          </button>
          <button
            style="padding: 6px 12px; cursor: pointer;"
            @click=${handleClearAll}
          >
            Clear All
          </button>
        </div>
        <vi-chip-group id="action-group" multi>
          <vi-chip value="react">React</vi-chip>
          <vi-chip value="vue">Vue</vi-chip>
          <vi-chip value="angular">Angular</vi-chip>
          <vi-chip value="lit">Lit</vi-chip>
        </vi-chip-group>
      </div>
    `;
  },
};

export const DynamicNameFormSync: StoryObj = {
  render: () => {
    const changeName = (newName: string) => {
      const group = document.querySelector('#form-group') as ViChipGroup;
      if (group) {
        group.name = newName;
        const nameLabel = document.querySelector(
          '#current-name',
        ) as HTMLElement;
        if (nameLabel) nameLabel.textContent = newName || '(Unnamed)';
      }
    };

    return html`
      <div
        style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;"
      >
        <div>
          Current field name: <strong id="current-name">categories</strong>
        </div>
        <div style="display: flex; gap: 8px;">
          <button
            style="padding: 6px 12px; cursor: pointer;"
            @click=${() => changeName('categories')}
          >
            Set name="categories"
          </button>
          <button
            style="padding: 6px 12px; cursor: pointer;"
            @click=${() => changeName('tags')}
          >
            Set name="tags"
          </button>
          <button
            style="padding: 6px 12px; cursor: pointer;"
            @click=${() => changeName('')}
          >
            Set name="" (Unnamed)
          </button>
        </div>
        <vi-chip-group id="form-group" name="categories" multi>
          <vi-chip value="design">Design</vi-chip>
          <vi-chip value="dev">Development</vi-chip>
          <vi-chip value="ops">DevOps</vi-chip>
        </vi-chip-group>
      </div>
    `;
  },
};
