import { html, type TemplateResult } from 'lit';
import './vi-tag.js';

export default {
  title: 'Components/Tag',
  component: 'vi-tag',
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    removable: { control: 'boolean' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    variant: 'neutral',
    size: 'md',
    removable: false,
    selected: false,
    disabled: false,
  },
};

import type { TagVariant, TagSize } from './vi-tag.js';

interface StoryArgs {
  variant: TagVariant;
  size: TagSize;
  removable: boolean;
  selected: boolean;
  disabled: boolean;
}

export const Default = (args: StoryArgs): TemplateResult => html`
  <vi-tag
    variant="${args.variant}"
    size="${args.size}"
    ?removable="${args.removable}"
    ?selected="${args.selected}"
    ?disabled="${args.disabled}"
  >
    Sample Tag
  </vi-tag>
`;

export const Removable = (): TemplateResult => html`
  <div style="display: flex; gap: 8px;">
    <vi-tag removable variant="neutral">Neutral</vi-tag>
    <vi-tag removable variant="primary">Primary</vi-tag>
    <vi-tag removable variant="success">Success</vi-tag>
    <vi-tag removable variant="warning">Warning</vi-tag>
    <vi-tag removable variant="danger">Danger</vi-tag>
  </div>
`;

export const Selectable = (): TemplateResult => html`
  <div style="display: flex; gap: 8px;">
    <vi-tag selected>Selected Tag</vi-tag>
    <vi-tag>Unselected Tag</vi-tag>
  </div>
`;

export const Sizes = (): TemplateResult => html`
  <div style="display: flex; gap: 8px; align-items: center;">
    <vi-tag size="sm" removable>Small</vi-tag>
    <vi-tag size="md" removable>Medium</vi-tag>
    <vi-tag size="lg" removable>Large</vi-tag>
  </div>
`;
