import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './vi-upload.js';

const meta: Meta = {
  title: 'Components/Upload',
  component: 'vi-upload',
  argTypes: {
    name: {
      control: 'text',
      description: 'Form name for ElementInternals submission',
    },
    accept: {
      control: 'text',
      description: 'Comma-separated list of allowed file types',
    },
    multiple: {
      control: 'boolean',
      description: 'Allows selecting multiple files',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the dropzone',
    },
    maxSize: {
      control: 'number',
      description: 'Maximum file size in bytes',
    },
    maxFiles: {
      control: 'number',
      description: 'Maximum number of files allowed',
    },
    hideThumbnail: {
      control: 'boolean',
      description: 'Hides the thumbnail preview and icon in the file list',
    },
  },
  parameters: {
    actions: {
      handles: ['vi-upload-change', 'vi-upload-error'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    name: 'file',
    accept: 'image/*,.pdf',
    multiple: true,
    disabled: false,
    hideThumbnail: false,
    maxSize: 5000000,
    maxFiles: 5,
  },
  render: (args) => html`
    <div style="max-width: 500px; font-family: sans-serif;">
      <vi-upload
        name=${ifDefined(args.name)}
        accept=${ifDefined(args.accept)}
        ?multiple=${args.multiple}
        ?disabled=${args.disabled}
        ?hide-thumbnail=${args.hideThumbnail}
        maxSize=${ifDefined(args.maxSize)}
        maxFiles=${ifDefined(args.maxFiles)}
      ></vi-upload>
    </div>
  `,
};

export const SingleFile: Story = {
  render: () => html`
    <div style="max-width: 500px; font-family: sans-serif;">
      <p style="margin-top: 0; font-size: 14px; color: #666;">
        This upload component only accepts a single file. Selecting a new file
        replaces the existing one.
      </p>
      <vi-upload accept=".pdf"></vi-upload>
    </div>
  `,
};

export const CustomTextAndIcon: Story = {
  render: () => html`
    <div style="max-width: 500px; font-family: sans-serif;">
      <vi-upload multiple>
        <svg
          slot="icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <span slot="text">Click to upload your favorite images</span>
      </vi-upload>
    </div>
  `,
};

export const FormIntegration: Story = {
  render: () => html`
    <div
      style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; align-items: flex-start; max-width: 500px;"
    >
      <p style="margin: 0; font-size: 14px; color: #666;">
        The upload component uses <code>ElementInternals</code> to seamlessly
        integrate with native HTML forms. It automatically handles appending
        files to <code>FormData</code>.
      </p>
      <form
        style="padding: 24px; border: 1px solid #eee; border-radius: 8px; display: flex; flex-direction: column; gap: 24px; background: #fff; width: 100%; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"
        @submit=${(e: Event) => {
          e.preventDefault();
          const fd = new FormData(e.target as HTMLFormElement);
          const attachments = fd.getAll('attachments');
          const fileNames = attachments.map((f) => (f as File).name).join(', ');
          alert(
            'Form Submitted!\\n\\nNumber of files attached: ' +
              attachments.length +
              '\\nFilenames: ' +
              fileNames,
          );
        }}
      >
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="font-size: 14px; font-weight: 500;"
            >Attach relevant documents (Max 5MB)</label
          >
          <vi-upload name="attachments" multiple maxSize="5000000"></vi-upload>
        </div>

        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button
            type="reset"
            style="padding: 8px 16px; cursor: pointer; border: 1px solid #ccc; background: white; border-radius: 4px;"
          >
            Reset Form
          </button>
          <button
            type="submit"
            style="padding: 8px 16px; cursor: pointer; border: none; background: #0f62fe; color: white; border-radius: 4px; font-weight: bold;"
          >
            Submit Form
          </button>
        </div>
      </form>
    </div>
  `,
};

export const ControlledUpload: Story = {
  render: () => {
    const handleUploadChange = (e: Event) => {
      const uploadEl = e.target as any;
      const files = (e as CustomEvent).detail as File[];

      // Simulate an async upload for each file
      files.forEach((file) => {
        uploadEl.updateFileStatus(file, { status: 'uploading', progress: 0 });

        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            // Simulate random error chance
            const hasError = Math.random() > 0.8;
            uploadEl.updateFileStatus(file, {
              status: hasError ? 'error' : 'success',
              progress: 100,
              error: hasError ? 'Network failed' : undefined,
            });
          } else {
            uploadEl.updateFileStatus(file, { progress });
          }
        }, 300);
      });
    };

    return html`
      <div
        style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; max-width: 500px;"
      >
        <p style="margin: 0; font-size: 14px; color: #666;">
          This dropzone acts as a "Controlled Component". When you drop files,
          the parent application listens to the event and manually updates the
          progress bars via the <code>updateFileStatus()</code> API.
        </p>
        <vi-upload multiple @vi-upload-change=${handleUploadChange}></vi-upload>
      </div>
    `;
  },
};

export const SlimVariant: Story = {
  render: (args) => html`
    <div
      style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; max-width: 500px;"
    >
      <p style="margin: 0; font-size: 14px; color: #666;">
        The <code>size="sm"</code> variant creates an inline, compact dropzone
        that occupies less vertical space. It aligns the icon and text
        horizontally.
      </p>
      <vi-upload
        size="sm"
        multiple
        accept="image/*"
        ?hide-thumbnail=${args?.hideThumbnail}
        .i18n=${{ dropzoneText: 'Attach images (Max 5MB)' }}
      ></vi-upload>
    </div>
  `,
};

export const WithThumbnailsAndLimits: Story = {
  args: {
    hideThumbnail: false,
  },

  render: (args) => html`
    <div
      style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; max-width: 500px;"
    >
      <p style="margin: 0; font-size: 14px; color: #666;">
        Images will display beautiful thumbnail previews. Also, try dropping
        more than 3 files to see the <code>maxFiles</code> constraint in action!
      </p>
      <vi-upload
        multiple
        maxFiles="3"
        accept="image/*"
        ?hide-thumbnail=${args?.hideThumbnail}
        .i18n=${{ dropzoneText: 'Drop up to 3 images here' }}
      ></vi-upload>
    </div>
  `,
};

export const ErrorValidation: Story = {
  render: () => html`
    <div
      style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; max-width: 500px;"
    >
      <p style="margin: 0; font-size: 14px; color: #666;">
        This instance only accepts <code>.pdf</code> and has a ridiculously
        small <code>maxSize</code> of 50KB to demonstrate built-in error states.
      </p>
      <vi-upload
        multiple
        maxSize="50000"
        accept=".pdf"
        .i18n=${{ dropzoneText: 'Drop tiny PDFs here (< 50KB)' }}
      ></vi-upload>
    </div>
  `,
};
