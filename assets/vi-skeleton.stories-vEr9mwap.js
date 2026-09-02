import { b } from './iframe-D4zu5Ix9.js';
import './vi-skeleton-CTPI75VV.js';
import './preload-helper-D5QYaGzd.js';
import './vi-element-BRb8_cc9.js';
import './class-map-BrS1GRSy.js';
import './directive-BKuZRRPO.js';

const meta = {
    title: 'Components / Skeleton',
    component: 'vi-skeleton',
    tags: [
        'autodocs'
    ],
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'text',
                'circle',
                'rect'
            ]
        },
        animation: {
            control: 'select',
            options: [
                'shimmer',
                'pulse',
                'none'
            ]
        }
    }
};
const Default = {
    args: {
        variant: 'text',
        animation: 'shimmer'
    },
    render: (args)=>b`
    <div style="width: 400px; max-width: 100%;">
      <vi-skeleton
        variant=${args.variant}
        animation=${args.animation}
      ></vi-skeleton>
    </div>
  `
};
const AtomicVariants = {
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 16px; width: 400px; max-width: 100%;">
      <div>
        <p style="margin-bottom: 8px;">Text (Default 100% width, 16px height)</p>
        <vi-skeleton variant="text"></vi-skeleton>
      </div>
      <div>
        <p style="margin-bottom: 8px;">Circle (Default 40x40)</p>
        <vi-skeleton variant="circle"></vi-skeleton>
      </div>
      <div>
        <p style="margin-bottom: 8px;">Rect (Default 100% width, 150px height)</p>
        <vi-skeleton variant="rect"></vi-skeleton>
      </div>
    </div>
  `
};
const Animations = {
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 16px; width: 400px; max-width: 100%;">
      <div>
        <p style="margin-bottom: 8px;">Shimmer (Default)</p>
        <vi-skeleton animation="shimmer"></vi-skeleton>
      </div>
      <div>
        <p style="margin-bottom: 8px;">Pulse</p>
        <vi-skeleton animation="pulse"></vi-skeleton>
      </div>
      <div>
        <p style="margin-bottom: 8px;">None</p>
        <vi-skeleton animation="none"></vi-skeleton>
      </div>
    </div>
  `
};
const CustomDimensions = {
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 16px; width: 400px; max-width: 100%;">
      <p style="margin-bottom: 0;">Inline styles can override CSS variables easily.</p>
      <vi-skeleton 
        variant="rect" 
        style="width: 250px; height: 80px; border-radius: 20px;">
      </vi-skeleton>
      <vi-skeleton 
        variant="circle" 
        style="width: 80px; height: 80px;">
      </vi-skeleton>
    </div>
  `
};
const CompositionExample = {
    render: ()=>b`
    <div style="display: flex; gap: 16px; width: 400px; max-width: 100%; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <vi-skeleton variant="circle"></vi-skeleton>
      <div style="display: flex; flex-direction: column; gap: 16px; flex: 1;">
        <vi-skeleton variant="text" style="width: 38%;"></vi-skeleton>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <vi-skeleton variant="text"></vi-skeleton>
          <vi-skeleton variant="text"></vi-skeleton>
          <vi-skeleton variant="text" style="width: 61%;"></vi-skeleton>
        </div>
      </div>
    </div>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    variant: 'text',\n    animation: 'shimmer'\n  },\n  render: args => html`\n    <div style=\"width: 400px; max-width: 100%;\">\n      <vi-skeleton\n        variant=${args.variant}\n        animation=${args.animation}\n      ></vi-skeleton>\n    </div>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
AtomicVariants.parameters = {
    ...AtomicVariants.parameters,
    docs: {
        ...AtomicVariants.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 16px; width: 400px; max-width: 100%;\">\n      <div>\n        <p style=\"margin-bottom: 8px;\">Text (Default 100% width, 16px height)</p>\n        <vi-skeleton variant=\"text\"></vi-skeleton>\n      </div>\n      <div>\n        <p style=\"margin-bottom: 8px;\">Circle (Default 40x40)</p>\n        <vi-skeleton variant=\"circle\"></vi-skeleton>\n      </div>\n      <div>\n        <p style=\"margin-bottom: 8px;\">Rect (Default 100% width, 150px height)</p>\n        <vi-skeleton variant=\"rect\"></vi-skeleton>\n      </div>\n    </div>\n  `\n}",
            ...AtomicVariants.parameters?.docs?.source
        }
    }
};
Animations.parameters = {
    ...Animations.parameters,
    docs: {
        ...Animations.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 16px; width: 400px; max-width: 100%;\">\n      <div>\n        <p style=\"margin-bottom: 8px;\">Shimmer (Default)</p>\n        <vi-skeleton animation=\"shimmer\"></vi-skeleton>\n      </div>\n      <div>\n        <p style=\"margin-bottom: 8px;\">Pulse</p>\n        <vi-skeleton animation=\"pulse\"></vi-skeleton>\n      </div>\n      <div>\n        <p style=\"margin-bottom: 8px;\">None</p>\n        <vi-skeleton animation=\"none\"></vi-skeleton>\n      </div>\n    </div>\n  `\n}",
            ...Animations.parameters?.docs?.source
        }
    }
};
CustomDimensions.parameters = {
    ...CustomDimensions.parameters,
    docs: {
        ...CustomDimensions.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 16px; width: 400px; max-width: 100%;\">\n      <p style=\"margin-bottom: 0;\">Inline styles can override CSS variables easily.</p>\n      <vi-skeleton \n        variant=\"rect\" \n        style=\"width: 250px; height: 80px; border-radius: 20px;\">\n      </vi-skeleton>\n      <vi-skeleton \n        variant=\"circle\" \n        style=\"width: 80px; height: 80px;\">\n      </vi-skeleton>\n    </div>\n  `\n}",
            ...CustomDimensions.parameters?.docs?.source
        }
    }
};
CompositionExample.parameters = {
    ...CompositionExample.parameters,
    docs: {
        ...CompositionExample.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 16px; width: 400px; max-width: 100%; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;\">\n      <vi-skeleton variant=\"circle\"></vi-skeleton>\n      <div style=\"display: flex; flex-direction: column; gap: 16px; flex: 1;\">\n        <vi-skeleton variant=\"text\" style=\"width: 38%;\"></vi-skeleton>\n        <div style=\"display: flex; flex-direction: column; gap: 8px;\">\n          <vi-skeleton variant=\"text\"></vi-skeleton>\n          <vi-skeleton variant=\"text\"></vi-skeleton>\n          <vi-skeleton variant=\"text\" style=\"width: 61%;\"></vi-skeleton>\n        </div>\n      </div>\n    </div>\n  `\n}",
            ...CompositionExample.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","AtomicVariants","Animations","CustomDimensions","CompositionExample"];

export { Animations, AtomicVariants, CompositionExample, CustomDimensions, Default, __namedExportsOrder, meta as default };
