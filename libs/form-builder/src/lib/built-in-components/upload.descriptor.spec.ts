import { UPLOAD_DESCRIPTOR } from './upload.descriptor';

describe('UPLOAD_DESCRIPTOR', () => {
  it('should be defined', () => {
    expect(UPLOAD_DESCRIPTOR).toBeDefined();
    expect(UPLOAD_DESCRIPTOR.type).toBe('upload');
    expect(UPLOAD_DESCRIPTOR.label).toBe('File Upload');
    expect(UPLOAD_DESCRIPTOR.category).toBe('advanced');
    expect(UPLOAD_DESCRIPTOR.supportsRepeating).toBe(true);
    expect(UPLOAD_DESCRIPTOR.rendererRef).toBe('vi-renderer-upload');
  });

  it('should have correct default schema', () => {
    expect(UPLOAD_DESCRIPTOR.defaultSchema).toEqual({
      type: 'upload',
      label: 'Upload Files',
    });
  });

  it('should have correct settings schema', () => {
    // Assert settings schema has expected structure and new properties
    expect(UPLOAD_DESCRIPTOR.settingsSchema.tabs).toBeDefined();
    const displayTab = UPLOAD_DESCRIPTOR.settingsSchema.tabs.find(t => t.id === 'display');
    expect(displayTab).toBeDefined();
    const fields = displayTab!.fields.map(f => f.key);
    expect(fields).toContain('accept');
    expect(fields).toContain('multiple');
    expect(fields).toContain('maxSize');
    expect(fields).toContain('maxFiles');
    expect(fields).toContain('hideThumbnail');
    expect(fields).toContain('size');
  });

  it('should generate canvas props correctly', () => {
    const mockSchema = {
      label: 'My Upload',
      description: 'Upload files here',
      accept: '.jpg,.png',
      multiple: true,
      maxSize: 5000000,
      maxFiles: 5,
      size: 'sm' as const,
      hideThumbnail: true,
    };

    const props = UPLOAD_DESCRIPTOR.canvasProps(mockSchema);

    expect(props).toEqual({
      label: 'My Upload',
      description: 'Upload files here',
      accept: '.jpg,.png',
      multiple: true,
      maxSize: 5000000,
      maxFiles: 5,
      size: 'sm',
      'hide-thumbnail': true,
      disabled: null,
    });
  });

  it('should map null to missing props', () => {
    const props = UPLOAD_DESCRIPTOR.canvasProps({} as any);

    expect(props).toEqual({
      label: null,
      description: null,
      accept: null,
      multiple: null,
      maxSize: null,
      maxFiles: null,
      size: null,
      'hide-thumbnail': null,
      disabled: null,
    });
  });
});
