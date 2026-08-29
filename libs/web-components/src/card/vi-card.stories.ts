import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vi-card.js';
import '../button/vi-button.js';
import '../badge/vi-badge.js';

const meta: Meta = {
  title: 'Components / Card',
  component: 'vi-card',
  tags: ['autodocs'],
  argTypes: {
    bordered: { control: 'boolean' },
    hoverable: { control: 'boolean' },
  },
};

export default meta;

export const Default: StoryObj = {
  args: {
    bordered: true,
    hoverable: false,
  },
  render: (args) => html`
    <div style="max-width: 400px; width: 100%;">
      <vi-card ?bordered=${args.bordered} ?hoverable=${args.hoverable}>
        <span slot="title">Card Title</span>
        <vi-button slot="extra" variant="text" size="sm">Action</vi-button>
        <p style="margin: 0;">This is a basic card component. It acts as a container for related information and actions.</p>
        <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end; width: 100%;">
          <vi-button variant="outline">Cancel</vi-button>
          <vi-button>Submit</vi-button>
        </div>
      </vi-card>
    </div>
  `,
};

export const FluidContainerQueries: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: flex-start; padding: 24px; background: #f5f5f5;">
      
      <!-- NARROW CONTAINER (300px) -->
      <div style="width: 300px;">
        <h3 style="font-family: sans-serif; font-size: 14px; color: #666; margin-bottom: 8px;">Narrow Container (300px)</h3>
        <vi-card bordered hoverable>
          <span slot="title">Fluid Title Shrinks</span>
          <vi-badge slot="extra" variant="primary" dot></vi-badge>
          <p style="margin: 0; color: #666;">
            Notice how the padding and the title font-size dynamically scale down when this card is placed inside a tight column. This is powered by <code>cqi</code> math.
          </p>
          <div slot="footer">
            <vi-button size="sm" variant="outline" style="width: 100%;">Read More</vi-button>
          </div>
        </vi-card>
      </div>

      <!-- WIDE CONTAINER (800px) -->
      <div style="flex: 1; max-width: 800px;">
        <h3 style="font-family: sans-serif; font-size: 14px; color: #666; margin-bottom: 8px;">Wide Container (800px)</h3>
        <vi-card bordered hoverable>
          <span slot="title">Fluid Title Grows</span>
          <vi-badge slot="extra" variant="primary" dot></vi-badge>
          <p style="margin: 0; color: #666;">
            Notice how the padding expands and the title font-size increases when this exact same component is placed inside a wider main content column. There are no @media queries here!
          </p>
          <div slot="footer" style="display: flex; gap: 8px;">
            <vi-button size="sm" variant="outline">Share</vi-button>
            <vi-button size="sm">Read More</vi-button>
          </div>
        </vi-card>
      </div>

    </div>
  `,
};

export const CoverImageAndActions: StoryObj = {
  render: () => html`
    <div style="max-width: 350px; width: 100%;">
      <vi-card bordered hoverable>
        <!-- Cover Image Slot -->
        <img 
          slot="cover" 
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80" 
          alt="Developer coding" 
          style="height: 200px;" 
        />
        
        <span slot="title">Web Components API</span>
        <p style="margin: 0; color: #666; font-size: 14px;">
          Build encapsulation into your UI with Shadow DOM. Compatible everywhere.
        </p>

        <!-- Actions Slot (Bottom Bar) -->
        <div slot="actions">
          <span>Settings</span>
          <span>Edit</span>
          <span>Share</span>
        </div>
      </vi-card>
    </div>
  `,
};

export const LoadingState: StoryObj = {
  render: () => html`
    <div style="max-width: 350px; width: 100%;">
      <vi-card bordered loading>
        <span slot="title">Dashboard Stats</span>
        <vi-button slot="extra" variant="text" size="sm">Refresh</vi-button>
        <p style="margin: 0;">This content is hidden behind a loading spinner.</p>
        <div style="height: 100px;"></div>
      </vi-card>
    </div>
  `,
};

export const StaticSizes: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <vi-card bordered size="sm">
        <span slot="title">Small Padding (12px)</span>
        <p style="margin: 0;">Fixed size override. Ignores container width.</p>
      </vi-card>

      <vi-card bordered size="md">
        <span slot="title">Medium Padding (16px)</span>
        <p style="margin: 0;">Fixed size override. Ignores container width.</p>
      </vi-card>

      <vi-card bordered size="lg">
        <span slot="title">Large Padding (24px)</span>
        <p style="margin: 0;">Fixed size override. Ignores container width.</p>
      </vi-card>
    </div>
  `,
};
