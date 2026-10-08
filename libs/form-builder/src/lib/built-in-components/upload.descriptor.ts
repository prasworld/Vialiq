import type { ComponentDescriptor } from '../types/component-descriptor';
import type { UploadComponentSchema } from '../types/component-schemas';
import { standardSettings } from './settings-helpers';

export const UPLOAD_DESCRIPTOR: ComponentDescriptor = {
  type: 'upload',
  label: 'File Upload',
  category: 'advanced',
  group: 'Basic Info',
  icon: 'upload',
  traits: { isInput: true },
  weight: 60,
  canvasElement: 'vi-upload',
  canvasProps: (s) => {
    const schema = s as UploadComponentSchema;
    return {
      label: schema.label ?? null,
      description: schema.description ?? null,
      accept: schema.accept ?? null,
      multiple: schema.multiple ?? null,
      maxSize: schema.maxSize ?? null,
      maxFiles: schema.maxFiles ?? null,
      size: schema.size ?? null,
      'hide-thumbnail': schema.hideThumbnail ?? null,
      disabled: null, // disabled during drag
    };
  },
  defaultSchema: {
    type: 'upload',
    label: 'Upload Files',
  },
  settingsSchema: standardSettings([
    {
      key: 'accept',
      label: 'Allowed File Types',
      type: 'text',
      hint: 'e.g. .pdf, image/*, .docx (comma separated)',
    },
    {
      key: 'multiple',
      label: 'Allow multiple files',
      type: 'boolean',
    },
    {
      key: 'maxSize',
      label: 'Max file size (bytes)',
      type: 'number',
    },
    {
      key: 'maxFiles',
      label: 'Max files limit',
      type: 'number',
      hint: 'Requires "Allow multiple files" to be enabled',
    },
    {
      key: 'hideThumbnail',
      label: 'Hide thumbnails (Slim Mode)',
      type: 'boolean',
      hint: 'Hides image previews and icons to save space',
    },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      options: [
        { label: 'Small (Slim)', value: 'sm' },
        { label: 'Medium (Default)', value: 'md' },
      ],
      defaultValue: 'md',
    },
  ]),
  supportsRepeating: true,
  rendererRef: 'vi-renderer-upload',
};
