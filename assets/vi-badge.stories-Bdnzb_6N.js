import { b } from './iframe-DecssaRk.js';
import './vi-badge-2Af-7M9-.js';
import './preload-helper-D5QYaGzd.js';
import './vi-element-CZpFtKKU.js';
import './state-CqHxxi7B.js';

const meta = {
    title: 'Components/Badge',
    component: 'vi-badge',
    tags: [
        'autodocs'
    ],
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'neutral',
                'primary',
                'success',
                'warning',
                'danger',
                'info'
            ],
            description: 'Colour semantic'
        },
        size: {
            control: 'radio',
            options: [
                'sm',
                'md',
                'lg'
            ],
            description: 'Size of the badge'
        },
        dot: {
            control: 'boolean',
            description: 'Show coloured dot instead of text'
        },
        pill: {
            control: 'boolean',
            description: 'Fully rounded (pill shape) vs. square'
        },
        count: {
            control: 'number',
            description: 'Numeric count to display'
        },
        max: {
            control: 'number',
            description: 'Max count before showing {max}+'
        },
        outline: {
            control: 'boolean',
            description: 'Outlined/ghost style'
        }
    },
    args: {
        variant: 'neutral',
        size: 'md',
        pill: true,
        dot: false,
        outline: false,
        max: 99
    }
};
const Default = {
    render: (args)=>b`
    <vi-badge
      variant=${args.variant}
      size=${args.size}
      ?dot=${args.dot}
      ?pill=${args.pill}
      ?outline=${args.outline}
      count=${args.count}
      max=${args.max}
    >
      ${!args.dot && args.count === undefined ? 'Badge' : ''}
    </vi-badge>
  `
};
const Variants = {
    render: ()=>b`
    <div style="display: flex; gap: 8px;">
      <vi-badge variant="neutral">Draft</vi-badge>
      <vi-badge variant="primary">Submitted</vi-badge>
      <vi-badge variant="success">Locked</vi-badge>
      <vi-badge variant="warning">In Review</vi-badge>
      <vi-badge variant="danger">Query Open</vi-badge>
      <vi-badge variant="info">Info</vi-badge>
    </div>
  `
};
const Outline = {
    render: ()=>b`
    <div style="display: flex; gap: 8px;">
      <vi-badge variant="neutral" outline>Draft</vi-badge>
      <vi-badge variant="primary" outline>Submitted</vi-badge>
      <vi-badge variant="success" outline>Locked</vi-badge>
      <vi-badge variant="warning" outline>In Review</vi-badge>
      <vi-badge variant="danger" outline>Query Open</vi-badge>
      <vi-badge variant="info" outline>Info</vi-badge>
    </div>
  `
};
const Sizes = {
    render: ()=>b`
    <div style="display: flex; gap: 8px; align-items: center;">
      <vi-badge size="sm" variant="neutral">Small</vi-badge>
      <vi-badge size="md" variant="neutral">Medium</vi-badge>
      <vi-badge size="lg" variant="neutral">Large</vi-badge>
    </div>
  `
};
const PillVsSquare = {
    render: ()=>b`
    <div style="display: flex; gap: 8px;">
      <vi-badge pill variant="primary">Pill (Default)</vi-badge>
      <vi-badge ?pill=${false} variant="primary">Square</vi-badge>
    </div>
  `
};
const Dots = {
    render: ()=>b`
    <div style="display: flex; gap: 8px;">
      <vi-badge dot variant="neutral"></vi-badge>
      <vi-badge dot variant="primary"></vi-badge>
      <vi-badge dot variant="success"></vi-badge>
      <vi-badge dot variant="warning"></vi-badge>
      <vi-badge dot variant="danger"></vi-badge>
      <vi-badge dot variant="info"></vi-badge>
    </div>
  `
};
const Counts = {
    render: ()=>b`
    <div style="display: flex; gap: 8px;">
      <vi-badge count="5" variant="danger"></vi-badge>
      <vi-badge count="120" max="99" variant="danger"></vi-badge>
      <vi-badge count="0" variant="neutral"></vi-badge>
    </div>
  `
};
const WithIcon = {
    render: ()=>b`
    <div style="display: flex; gap: 8px;">
      <vi-badge variant="success">
        <span slot="icon" style="font-size: 14px;">✓</span>
        Complete
      </vi-badge>
    </div>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <vi-badge\n      variant=${args.variant}\n      size=${args.size}\n      ?dot=${args.dot}\n      ?pill=${args.pill}\n      ?outline=${args.outline}\n      count=${args.count}\n      max=${args.max}\n    >\n      ${!args.dot && args.count === undefined ? 'Badge' : ''}\n    </vi-badge>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
Variants.parameters = {
    ...Variants.parameters,
    docs: {
        ...Variants.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px;\">\n      <vi-badge variant=\"neutral\">Draft</vi-badge>\n      <vi-badge variant=\"primary\">Submitted</vi-badge>\n      <vi-badge variant=\"success\">Locked</vi-badge>\n      <vi-badge variant=\"warning\">In Review</vi-badge>\n      <vi-badge variant=\"danger\">Query Open</vi-badge>\n      <vi-badge variant=\"info\">Info</vi-badge>\n    </div>\n  `\n}",
            ...Variants.parameters?.docs?.source
        }
    }
};
Outline.parameters = {
    ...Outline.parameters,
    docs: {
        ...Outline.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px;\">\n      <vi-badge variant=\"neutral\" outline>Draft</vi-badge>\n      <vi-badge variant=\"primary\" outline>Submitted</vi-badge>\n      <vi-badge variant=\"success\" outline>Locked</vi-badge>\n      <vi-badge variant=\"warning\" outline>In Review</vi-badge>\n      <vi-badge variant=\"danger\" outline>Query Open</vi-badge>\n      <vi-badge variant=\"info\" outline>Info</vi-badge>\n    </div>\n  `\n}",
            ...Outline.parameters?.docs?.source
        }
    }
};
Sizes.parameters = {
    ...Sizes.parameters,
    docs: {
        ...Sizes.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px; align-items: center;\">\n      <vi-badge size=\"sm\" variant=\"neutral\">Small</vi-badge>\n      <vi-badge size=\"md\" variant=\"neutral\">Medium</vi-badge>\n      <vi-badge size=\"lg\" variant=\"neutral\">Large</vi-badge>\n    </div>\n  `\n}",
            ...Sizes.parameters?.docs?.source
        }
    }
};
PillVsSquare.parameters = {
    ...PillVsSquare.parameters,
    docs: {
        ...PillVsSquare.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px;\">\n      <vi-badge pill variant=\"primary\">Pill (Default)</vi-badge>\n      <vi-badge ?pill=${false} variant=\"primary\">Square</vi-badge>\n    </div>\n  `\n}",
            ...PillVsSquare.parameters?.docs?.source
        }
    }
};
Dots.parameters = {
    ...Dots.parameters,
    docs: {
        ...Dots.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px;\">\n      <vi-badge dot variant=\"neutral\"></vi-badge>\n      <vi-badge dot variant=\"primary\"></vi-badge>\n      <vi-badge dot variant=\"success\"></vi-badge>\n      <vi-badge dot variant=\"warning\"></vi-badge>\n      <vi-badge dot variant=\"danger\"></vi-badge>\n      <vi-badge dot variant=\"info\"></vi-badge>\n    </div>\n  `\n}",
            ...Dots.parameters?.docs?.source
        }
    }
};
Counts.parameters = {
    ...Counts.parameters,
    docs: {
        ...Counts.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px;\">\n      <vi-badge count=\"5\" variant=\"danger\"></vi-badge>\n      <vi-badge count=\"120\" max=\"99\" variant=\"danger\"></vi-badge>\n      <vi-badge count=\"0\" variant=\"neutral\"></vi-badge>\n    </div>\n  `\n}",
            ...Counts.parameters?.docs?.source
        }
    }
};
WithIcon.parameters = {
    ...WithIcon.parameters,
    docs: {
        ...WithIcon.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px;\">\n      <vi-badge variant=\"success\">\n        <span slot=\"icon\" style=\"font-size: 14px;\">\u2713</span>\n        Complete\n      </vi-badge>\n    </div>\n  `\n}",
            ...WithIcon.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","Variants","Outline","Sizes","PillVsSquare","Dots","Counts","WithIcon"];

export { Counts, Default, Dots, Outline, PillVsSquare, Sizes, Variants, WithIcon, __namedExportsOrder, meta as default };
