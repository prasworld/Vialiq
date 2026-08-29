import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import { ifDefined } from 'lit/directives/if-defined.js';
import './vi-spin';
import '../alert/vi-alert';

const meta: Meta = {
  title: 'Components/Spin',
  component: 'vi-spin',
  tags: ['autodocs'],
  argTypes: {
    spinning: {
      control: 'boolean',
      description: 'Whether the spin is active',
    },
    variant: {
      control: 'select',
      options: ['arc', 'dots'],
      description: 'The visual variant of the spinner',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the spin',
    },
    percent: {
      control: 'number',
      description: 'Determinate progress percent (only applies to arc variant)',
    },
    fullscreen: {
      control: 'boolean',
      description: 'Whether the spin covers the entire screen',
    },
    tip: {
      control: 'text',
      description: 'Custom text to display underneath the spinner',
    },
    delay: {
      control: 'number',
      description: 'Delay in milliseconds before showing the spinner',
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    spinning: true,
  },
  render: (args) => html`
    <vi-spin 
      ?spinning=${args.spinning}
      size=${ifDefined(args.size)}
      variant=${ifDefined(args.variant)}
      percent=${ifDefined(args.percent)}
      ?fullscreen=${args.fullscreen}
      tip=${ifDefined(args.tip)}
      delay=${ifDefined(args.delay)}
    ></vi-spin>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <vi-spin size="sm"></vi-spin>
      <vi-spin size="md"></vi-spin>
      <vi-spin size="lg"></vi-spin>
    </div>
  `,
};

export const InsideContainer: Story = {
  args: {
    spinning: true,
    tip: 'Loading...',
  },
  render: (args) => html`
    <div style="width: 100%; max-width: 500px;">
      <vi-spin 
        ?spinning=${args.spinning}
        size=${ifDefined(args.size)}
        tip=${ifDefined(args.tip)}
        delay=${ifDefined(args.delay)}
      >
        <vi-alert 
          variant="info" 
          title="Alert message title"
          message="Further details about the context of this alert. This is an example of spinning overlaying content."
        ></vi-alert>
      </vi-spin>
      
      <div style="margin-top: 24px; font-size: 14px;">
        <label>
          <input 
            type="checkbox" 
            ?checked=${args.spinning} 
            @change=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const spinEl = document.querySelector('vi-spin');
              if (spinEl) spinEl.spinning = target.checked;
            }} 
          /> Toggle Spinning
        </label>
      </div>
    </div>
  `,
};

export const CustomTip: Story = {
  args: {
    spinning: true,
    tip: 'Preparing data...',
  },
  render: (args) => html`
    <vi-spin 
      ?spinning=${args.spinning}
      size=${ifDefined(args.size)}
      tip=${ifDefined(args.tip)}
    ></vi-spin>
  `,
};

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <vi-spin variant="arc" tip="Arc"></vi-spin>
      <vi-spin variant="dots" tip="Dots"></vi-spin>
    </div>
  `,
};

export const CustomIndicator: Story = {
  render: () => html`
    <vi-spin tip="Loading...">
      <div slot="indicator" style="font-size: 24px; animation: viSpinRotate 2s linear infinite; display: inline-block;">
        🌀
      </div>
    </vi-spin>
  `,
};

export const DeterminateProgress: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <vi-spin variant="arc" percent="25" tip="25%"></vi-spin>
      <vi-spin variant="arc" percent="50" tip="50%"></vi-spin>
      <vi-spin variant="arc" percent="75" tip="75%"></vi-spin>
      <vi-spin variant="arc" percent="100" tip="100%"></vi-spin>
    </div>
  `,
};

export const Fullscreen: Story = {
  args: {
    fullscreen: true,
    tip: 'Loading full screen...',
  },
  render: (args) => html`
    <div style="height: 200px; padding: 20px; border: 1px solid #ccc;">
      <p>This is a container.</p>
      <button @click=${() => {
        const spin = document.createElement('vi-spin');
        spin.fullscreen = true;
        spin.tip = 'Loading full screen... closing in 3s';
        document.body.appendChild(spin);
        setTimeout(() => spin.remove(), 3000);
      }}>
        Show Fullscreen Spinner
      </button>
      ${args.fullscreen ? html`
        <vi-spin ?fullscreen=${args.fullscreen} tip=${args.tip}></vi-spin>
      ` : ''}
    </div>
  `,
};

export const LottieAnimation: Story = {
  render: () => {
    // Inject the Lottie Player script if it doesn't exist
    if (!document.querySelector('script[src*="lottie-player"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
      document.head.appendChild(script);
    }
    
    return html`
      <vi-spin tip="Loading Lottie...">
        <!-- Replace 'src' with your own Lottie JSON URL -->
        <lottie-player 
          slot="indicator"
          src="https://assets2.lottiefiles.com/packages/lf20_usmfx6bp.json"
          background="transparent" 
          speed="1" 
          style="width: 60px; height: 60px;" 
          loop 
          autoplay
        ></lottie-player>
      </vi-spin>
    `;
  },
};
