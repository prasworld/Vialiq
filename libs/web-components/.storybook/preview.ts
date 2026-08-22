import type { Preview } from '@storybook/web-components';
// Load the workspace source flux-ui global stylesheet so the story canvas
// gets CSS custom properties (colour / spacing tokens), the CSS reset, and
// the default-applied typography rules — without needing a build/publish step.
import '@vialiq/flux-ui/styles/_index.scss';


const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
      },
    },
    layout: 'centered',
  },
};

export default preview;
