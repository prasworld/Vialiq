import { html } from 'lit';
import './vi-link';
import '../icons/vi-icon'; // ensure icons are registered

export default {
  title: 'Components/vi-link',
  component: 'vi-link',
  argTypes: {
    variant: {
      control: { type: 'select', options: ['primary', 'secondary', 'muted'] },
    },
    size: {
      control: { type: 'select', options: ['inherit', 'sm', 'md', 'lg'] },
    },
    underline: {
      control: { type: 'select', options: ['always', 'hover', 'none'] },
    },
  },
};

const Template = (args: any) => html`
  <vi-link
    href=${args.href}
    target=${args.target}
    rel=${args.rel}
    download=${args.download}
    variant=${args.variant}
    size=${args.size}
    underline=${args.underline}
    ?disabled=${args.disabled}
    ?external=${args.external}
  >
    ${args.label}
  </vi-link>
`;

export const Default = Template.bind({});
Default.args = {
  label: 'Navigation Link',
  href: '#',
  variant: 'primary',
  size: 'inherit',
  underline: 'hover',
  disabled: false,
  external: false,
};

export const External = Template.bind({});
External.args = {
  label: 'External Link',
  href: 'https://example.com',
  external: true,
  variant: 'primary',
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: 'Disabled Link',
  href: '#',
  disabled: true,
};

export const WithIcon = () => html`
  <vi-link href="#" download="file.pdf">
    <vi-icon slot="icon" name="download" size="14"></vi-icon>
    Download (PDF)
  </vi-link>
`;

export const Variants = () => html`
  <div style="display: flex; gap: 1rem; flex-direction: column;">
    <vi-link href="#" variant="primary">Primary Link</vi-link>
    <vi-link href="#" variant="secondary">Secondary Link</vi-link>
    <vi-link href="#" variant="muted">Muted Link</vi-link>
  </div>
`;
