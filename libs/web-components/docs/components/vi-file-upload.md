# `vi-file-upload` — File Upload

**Package:** `@vialiq/web-components/file-upload`  
**Element:** `<vi-file-upload>`  
**Status:** 🔲 Planned — Phase 3  
**Flux UI base:** `libs/flux-ui/components/_file-upload.scss`

---

## Purpose

A feature-rich file attachment component for clinical documents. Supports:
- Drag-and-drop + file browser + clipboard paste
- Multi-file with per-file progress, status, and preview
- Client-side validation (type, size, count)
- Host-controlled async upload via a provided `uploadFn`
- Camera capture on mobile/tablet

**Clinical EDC use cases:**
- Informed consent form (ICF) scanned PDF
- Source document upload for SDV
- Lab report attachment
- Protocol amendment document
- Regulatory correspondence (IND, CTA)
- Subject photo documentation (dermatology trials)

---

## Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `accept` | `accept` | `string` | `'*'` | — | MIME types or extensions (e.g. `'.pdf,.doc,image/*'`) |
| `multiple` | `multiple` | `boolean` | `false` | ✅ | Allow multiple files |
| `maxSize` | `max-size` | `number` | `10485760` | — | Max file size in bytes (default 10 MB) |
| `maxFiles` | `max-files` | `number` | `undefined` | — | Max number of files |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables all interactions |
| `required` | `required` | `boolean` | `false` | ✅ | Required field |
| `name` | `name` | `string` | `''` | — | Form field name |
| `capture` | `capture` | `CaptureMode` | `undefined` | — | Mobile camera hint |
| `autoUpload` | `auto-upload` | `boolean` | `false` | — | Upload immediately on file selection |
| `showPreview` | `show-preview` | `boolean` | `true` | — | Show image thumbnails |
| `dropLabel` | `drop-label` | `string` | `'Drop files here or click to browse'` | — | Drop zone label |
| `status` | `status` | `ControlStatus` | `'default'` | ✅ | Field-level validation state |
| `validityMessage` | `validity-message` | `string` | `''` | — | Field-level error message |

```typescript
type CaptureMode = 'user' | 'environment';  // front / rear camera
type ControlStatus = 'default' | 'valid' | 'invalid';

// Caller provides this to enable uploading
type UploadFn = (
  file: File,
  onProgress: (percent: number) => void,
  signal: AbortSignal
) => Promise<UploadResult>;

interface UploadResult {
  id: string;         // server-assigned file id
  url?: string;       // download URL (optional, for preview)
  metadata?: unknown; // passthrough from server
}

interface UploadedFile {
  id: string;              // local id (UUID)
  file: File;
  status: FileStatus;
  progress: number;        // 0–100
  error?: string;
  result?: UploadResult;   // set on success
  abortController: AbortController;
}

type FileStatus = 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
```

---

## The `uploadFn` Prop

The component does not know your API. You provide the upload function:

```typescript
// Angular
this.fileUpload.uploadFn = async (file, onProgress, signal) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('trialId', this.trialId);

  const xhr = new XMLHttpRequest();
  xhr.upload.onprogress = (e) => onProgress(Math.round(e.loaded / e.total * 100));
  signal.addEventListener('abort', () => xhr.abort());

  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.open('POST', '/api/documents/upload');
    xhr.send(formData);
  });
};
```

Each file gets its own `AbortController`. Cancelled files call `abortController.abort()`.

---

## Slots

| Slot | Description |
|------|-------------|
| `drop-icon` | Override the default upload icon in drop zone |
| `drop-label` | Override the drop zone label (richer than `drop-label` attr) |
| `empty` | Custom empty state content |
| `file-item` | Custom file list row (receives file data via `slottable-data` pattern) |
| `helper` | Persistent helper text |

---

## Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vialiq-files-selected` | `CustomEvent<{files: File[]}>` | ✅ | Files added (before upload) |
| `vialiq-upload-start` | `CustomEvent<{fileId: string; file: File}>` | ✅ | Individual file upload starts |
| `vialiq-upload-progress` | `CustomEvent<{fileId: string; percent: number}>` | ✅ | Upload progress update |
| `vialiq-upload-success` | `CustomEvent<{fileId: string; result: UploadResult}>` | ✅ | File uploaded successfully |
| `vialiq-upload-error` | `CustomEvent<{fileId: string; error: string}>` | ✅ | File upload failed |
| `vialiq-upload-cancel` | `CustomEvent<{fileId: string}>` | ✅ | File cancelled by user |
| `vialiq-remove` | `CustomEvent<{fileId: string}>` | ✅ | File removed from list |
| `invalid` | `Event` (cancelable) | ❌ | `checkValidity()` fails |

---

## Imperative Methods

| Method | Description |
|--------|-------------|
| `addFiles(files: File[])` | Programmatically add files (same as drag/browse) |
| `removeFile(fileId: string)` | Remove a file from the list |
| `upload()` | Trigger upload for all `pending` files (when `auto-upload` is false) |
| `cancelUpload(fileId)` | Abort a specific file's upload |
| `cancelAll()` | Cancel all in-progress uploads |
| `clearFiles()` | Remove all files from list |
| `checkValidity()` | Validate required + min-files constraints |
| `reportValidity()` | Validate and show message |
| `setCustomValidity(msg)` | Custom error message |
| `getFiles()` | Returns current `UploadedFile[]` |

---

## CSS Parts

| Part | Element |
|------|---------|
| `drop-zone` | The drag-and-drop target area |
| `drop-icon` | Upload icon in drop zone |
| `drop-label` | Drop zone text |
| `browse-btn` | "Browse" button |
| `file-list` | Container for file rows |
| `file-item` | Individual file row |
| `file-icon` | File type icon |
| `file-thumbnail` | Image thumbnail |
| `file-name` | File name text |
| `file-size` | File size text |
| `file-status` | Status icon/text |
| `file-progress` | Progress bar container |
| `file-progress-bar` | Animated fill |
| `file-error` | Error message text |
| `file-remove-btn` | × remove button |
| `file-retry-btn` | Retry button (on error) |
| `file-cancel-btn` | Cancel button (while uploading) |
| `helper` | Helper text |
| `validation` | Field-level validation message |

---

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-file-upload-drop-zone-padding` | `32px 24px` | Drop zone padding |
| `--vi-file-upload-drop-zone-border` | `2px dashed var(--vi-color-grey-300)` | Default border |
| `--vi-file-upload-drop-zone-border-active` | `2px dashed var(--vi-color-primary)` | Drag-over border |
| `--vi-file-upload-drop-zone-bg` | `var(--vi-color-grey-50)` | Drop zone background |
| `--vi-file-upload-drop-zone-bg-active` | `var(--vi-color-blue-50)` | Drag-over background |
| `--vi-file-upload-drop-zone-border-radius` | `8px` | Drop zone radius |
| `--vi-file-upload-file-item-padding` | `10px 12px` | File row padding |
| `--vi-file-upload-file-item-border-radius` | `4px` | File row radius |
| `--vi-file-upload-progress-height` | `4px` | Progress bar height |
| `--vi-file-upload-progress-color` | `var(--vi-color-primary)` | Progress fill |
| `--vi-file-upload-progress-error-color` | `var(--vi-color-error)` | Error progress fill |
| `--vi-file-upload-thumbnail-size` | `48px` | Image thumbnail size |

---

## Shadow DOM Structure

```
vi-file-upload
├── div[part="drop-zone"] .upload-zone
│   [role="button"] [tabindex="0"]
│   [aria-label="Upload files"] [aria-disabled?]
│   ├── slot[name="drop-icon"] → vi-icon name="upload-cloud" (default)
│   ├── slot[name="drop-label"] → p (default text)
│   └── vi-button[part="browse-btn"] variant="ghost" size="sm"
│       Browse files
│       └── input[type="file"] hidden (triggers file picker)
│
├── ul[part="file-list"] .upload-file-list [role="list"]
│   └── li[part="file-item"] × N (per file)
│       ├── div.file-preview
│       │   ├── img[part="file-thumbnail"] (image files)
│       │   └── vi-icon[part="file-icon"] (other file types)
│       ├── div.file-info
│       │   ├── span[part="file-name"]
│       │   ├── span[part="file-size"]
│       │   └── div[part="file-progress"] (when uploading)
│       │       └── div[part="file-progress-bar"]
│       ├── span[part="file-status"]
│       │   ├── vi-icon name="check-circle" (success)
│       │   ├── vi-icon name="x-circle"    (error)
│       │   └── vi-spinner               (uploading)
│       ├── span[part="file-error"]         (when error)
│       ├── vi-button[part="file-retry-btn"] (when error)
│       ├── vi-button[part="file-cancel-btn"] (when uploading)
│       └── vi-button[part="file-remove-btn"] (when pending/success)
│
├── input[type="hidden"] name=${name}  (form submission)
├── slot[name="helper"]
└── span[part="validation"]
```

---

## Validation

**Client-side (before upload):**
- File type: checked against `accept` (MIME type prefix or extension match)
- File size: checked against `max-size`
- File count: checked against `max-files`
- Errors reported per-file in `file-error` part; field-level in `validation`

**Required:**
- `checkValidity()` fails if `required` and no files in `success` state
- For `auto-upload = false`: fails if no files at all (any status)

---

## Keyboard Interactions

| Key | Context | Behaviour |
|-----|---------|-----------|
| `Enter` / `Space` | Drop zone focused | Open file picker |
| `Tab` | After file list | Move to next element |
| `Delete` / `Backspace` | File item focused | Prompt remove (or remove if no confirm needed) |
| `Escape` | During drag | Cancel drag highlight |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Drop zone | `role="button"` + `aria-label="Upload files"` + `tabindex="0"` |
| Disabled | `aria-disabled="true"` + `tabindex="-1"` |
| File list | `role="list"` + `role="listitem"` per file |
| Progress | `role="progressbar"` + `aria-valuenow` + `aria-valuemin="0"` + `aria-valuemax="100"` |
| Status | Live region announces upload success/error: `aria-live="polite"` on status container |
| Remove | `aria-label="Remove {filename}"` on remove button |
| Cancel | `aria-label="Cancel upload of {filename}"` |
| Retry | `aria-label="Retry upload of {filename}"` |

---

## Usage Examples

### Basic single file (ICF scan)

```html
<vi-form-field label="Informed Consent Form (signed scan)" required>
  <vi-file-upload
    #icfUpload
    name="icfDocument"
    accept=".pdf,image/*"
    max-size="20971520"
    required
    [uploadFn]="uploadDocument"
    (vialiq-upload-success)="onIcfUploaded($event.detail)"
    (vialiq-upload-error)="onUploadError($event.detail)"
  >
    <span slot="helper">PDF or image, max 20 MB. File must be signed by subject.</span>
  </vi-file-upload>
</vi-form-field>
```

### Multi-file, manual upload

```html
<vi-file-upload
  #docUpload
  name="supportingDocs"
  accept=".pdf,.doc,.docx,.xls,.xlsx"
  multiple
  max-files="10"
  max-size="52428800"
  [uploadFn]="uploadSupportingDoc"
  drop-label="Drop protocol documents here"
>
  <span slot="helper">Up to 10 files, 50 MB each. Accepted: PDF, Word, Excel.</span>
</vi-file-upload>

<vi-button variant="primary" (click)="docUpload.upload()">
  Upload All Documents
</vi-button>
```

### Auto-upload with progress tracking

```typescript
onUploadProgress(e: CustomEvent) {
  const { fileId, percent } = e.detail;
  this.uploadProgress[fileId] = percent;
}

onAllUploaded() {
  const files = this.fileUpload.getFiles();
  const allSuccess = files.every(f => f.status === 'success');
  if (allSuccess) {
    this.form.markAsUploaded(files.map(f => f.result!.id));
  }
}
```

```html
<vi-file-upload
  auto-upload
  multiple
  accept="image/*"
  capture="environment"
  [uploadFn]="uploadPhoto"
  (vialiq-upload-progress)="onUploadProgress($event)"
  (vialiq-upload-success)="onPhotoUploaded($event.detail)"
>
  <span slot="drop-label">Take photo or upload image</span>
</vi-file-upload>
```

---

## Form Participation

Form-associated (`static formAssociated = true`).

- `auto-upload = false`: `setFormValue()` serialises pending file metadata as JSON
- `auto-upload = true`: `setFormValue()` serialises server-returned file IDs as comma-separated string

For `multiple`, submitted as `name=id1&name=id2` using `FormData.append()` loop.

---

## i18n — Internal Labels

All internal text uses `translateDirective`. See [I18N.md](../I18N.md) for setup.

| Key | Default (en) |
|-----|-------------|
| `fileUpload.dropZone` | `"Drag files here, or"` |
| `fileUpload.browse` | `"Browse files"` |
| `fileUpload.remove` | `"Remove {filename}"` |
| `fileUpload.retry` | `"Retry"` |
| `fileUpload.cancel` | `"Cancel upload"` |
| `fileUpload.maxSize` | `"Maximum file size: {size}"` |
| `fileUpload.maxFiles` | `"Maximum {count} files"` |
| `fileUpload.invalidType` | `"{filename} is not an accepted file type"` |

---

## Related Components

- [`vi-modal`](./vi-modal.md) — file upload inside a modal dialog
- [`vi-progress-bar`](./vi-progress-bar.md) — used internally for file progress
- [`vi-button`](./vi-button.md) — browse button and upload trigger
- [`vi-spinner`](./vi-spinner.md) — per-file uploading indicator
- [`vi-alert`](./vi-alert.md) — show upload quota warnings above the component
