import { css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ViElement } from '../base/vi-element.js';
import uploadStyles from './vi-upload.scss?inline';

import '../icons/vi-icon.js';
import { registerIcons } from '../icons/registry.js';
import { uploadIcon, xIcon, documentIcon } from '@vialiq/icons';

registerIcons([uploadIcon, xIcon, documentIcon]);

export interface ViUploadI18n {
  dropzoneText: string;
  invalidType: string;
  sizeLimit: string;
  maxFilesLimit: string;
  removeFile: string;
}

export const defaultUploadI18n: ViUploadI18n = {
  dropzoneText: 'Drag and drop files here, or click to browse',
  invalidType: 'Invalid file type',
  sizeLimit: 'File size exceeds limit',
  maxFilesLimit: 'Maximum files limit exceeded',
  removeFile: 'Remove file',
};

export type ViUploadStatus = 'pending' | 'uploading' | 'success' | 'error';
export type ViUploadSize = 'md' | 'sm';

export interface ViUploadFile {
  id: string;
  file: File;
  status: ViUploadStatus;
  progress: number;
  error?: string;
  thumbnailUrl?: string;
}

/**
 * vi-upload
 *
 * A file upload component with drag-and-drop support and native form integration.
 *
 * @element vi-upload
 *
 * @attr {string}  name     - The form name for submission.
 * @attr {string}  accept   - Comma-separated list of allowed file types (e.g. '.pdf, image/*').
 * @attr {boolean} multiple - Allows selecting multiple files.
 * @attr {boolean} disabled - Disables the dropzone.
 * @attr {number}  maxSize  - Maximum file size allowed in bytes.
 *
 * @fires {CustomEvent<File[]>} vi-upload-change - Fired when files are added or removed.
 * @fires {CustomEvent<{file: File, error: string}>} vi-upload-error - Fired when a file fails validation.
 *
 * @slot icon - Icon inside the dropzone (defaults to an upload icon).
 * @slot text - Text inside the dropzone (defaults to 'Drag & drop files here, or click to browse').
 */
@customElement('vi-upload')
export class ViUpload extends ViElement {
  static formAssociated = true;

  static override styles = css`
    ${unsafeCSS(uploadStyles)}
  `;

  // ── Public API ──────────────────────────────────────────────────────────────

  /** Form name for ElementInternals */
  @property({ type: String, reflect: true }) accessor name = '';

  /** Comma-separated list of allowed file types */
  @property({ type: String, reflect: true }) accessor accept = '';

  /** Allows multiple files */
  @property({ type: Boolean, reflect: true }) accessor multiple = false;

  /** Disables the component */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Maximum file size in bytes */
  @property({ type: Number }) accessor maxSize = 0;

  /** Maximum number of files allowed (when multiple is true) */
  @property({ type: Number }) accessor maxFiles = 0;

  /** Size variant of the component */
  @property({ type: String, reflect: true }) accessor size: ViUploadSize = 'md';

  /** Hides the thumbnail preview and icon in the file list */
  @property({ type: Boolean, attribute: 'hide-thumbnail' })
  accessor hideThumbnail = false;

  /** Translation strings for component text (i18n) */
  @property({ type: Object }) accessor i18n: Partial<ViUploadI18n> = {};

  private get _i18n(): ViUploadI18n {
    return { ...defaultUploadI18n, ...this.i18n };
  }

  // ── Private State ────────────────────────────────────────────────────────────

  private _internals: ElementInternals;

  @state() private accessor _files: ViUploadFile[] = [];
  @state() private accessor _isDragActive = false;

  @query('input[type="file"]') private accessor _inputEl!: HTMLInputElement;
  @query('.dropzone') private accessor _dropzoneEl!: HTMLElement;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    // Cleanup object URLs to avoid memory leaks
    this._files.forEach((f) => {
      if (f.thumbnailUrl) URL.revokeObjectURL(f.thumbnailUrl);
    });
  }

  // ── Public API (Controlled Components) ───────────────────────────────────────

  /** Updates the visual progress and status of a specific file */
  updateFileStatus(
    fileIdOrFile: string | File,
    updates: Partial<Pick<ViUploadFile, 'status' | 'progress' | 'error'>>,
  ): void {
    const index = this._files.findIndex(
      (f) => f.id === fileIdOrFile || f.file === fileIdOrFile,
    );
    if (index === -1) return;

    this._files[index] = { ...this._files[index], ...updates };
    this._files = [...this._files]; // Trigger re-render
  }

  // ── Form Integration ─────────────────────────────────────────────────────────

  override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);

    // We only need to update the form value when files change, but since files
    // is a state property, we handle form updates directly in _updateFormValue.
  }

  formResetCallback(): void {
    this._files = [];
    if (this._inputEl) this._inputEl.value = '';
    this._updateFormValue();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  private _updateFormValue(): void {
    const validFiles = this._files.filter((f) => !f.error).map((f) => f.file);

    if (validFiles.length === 0) {
      this._internals.setFormValue(null);
    } else if (!this.multiple) {
      this._internals.setFormValue(validFiles[0]);
    } else {
      const formData = new FormData();
      if (this.name) {
        validFiles.forEach((file) => formData.append(this.name, file));
        this._internals.setFormValue(formData);
      } else {
        // Form data is irrelevant if there's no name, but we still clear/set it.
        this._internals.setFormValue(null);
      }
    }

    this.dispatchEvent(
      new CustomEvent('vi-upload-change', {
        detail: validFiles,
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── File Handling ────────────────────────────────────────────────────────────

  private _handleFiles(files: FileList | File[]): void {
    if (this.disabled) return;

    const newFiles = Array.from(files);
    if (newFiles.length === 0) return;

    let filesToAdd: File[] = newFiles;

    if (!this.multiple) {
      // If multiple is false, we only process the first file and replace the existing list
      filesToAdd = [newFiles[0]];

      // Cleanup existing thumbnails before replacing
      this._files.forEach((f) => {
        if (f.thumbnailUrl) URL.revokeObjectURL(f.thumbnailUrl);
      });
      this._files = [];
    } else if (this.maxFiles > 0) {
      const availableSlots = this.maxFiles - this._files.length;
      if (availableSlots <= 0) {
        this.dispatchEvent(
          new CustomEvent('vi-upload-error', {
            detail: { error: this._i18n.maxFilesLimit },
            bubbles: true,
            composed: true,
          }),
        );
        return;
      }
      if (filesToAdd.length > availableSlots) {
        const discardedFiles = filesToAdd.slice(availableSlots);
        discardedFiles.forEach((f) => {
          this.dispatchEvent(
            new CustomEvent('vi-upload-error', {
              detail: { file: f, error: this._i18n.maxFilesLimit },
              bubbles: true,
              composed: true,
            }),
          );
        });
        filesToAdd = filesToAdd.slice(0, availableSlots);
      }
    }

    const processedFiles: ViUploadFile[] = filesToAdd.map((file) => {
      let error = '';
      let status: ViUploadStatus = 'pending';
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      if (!this._isValidFileType(file)) {
        error = this._i18n.invalidType;
        status = 'error';
      } else if (this.maxSize && file.size > this.maxSize) {
        error = `${this._i18n.sizeLimit} (${this._formatBytes(this.maxSize)})`;
        status = 'error';
      }

      if (error) {
        this.dispatchEvent(
          new CustomEvent('vi-upload-error', {
            detail: { file, error },
            bubbles: true,
            composed: true,
          }),
        );
      }

      let thumbnailUrl: string | undefined;
      if (file.type.startsWith('image/')) {
        thumbnailUrl = URL.createObjectURL(file);
      }

      return { id, file, status, progress: 0, error, thumbnailUrl };
    });

    this._files = [...this._files, ...processedFiles];
    this._updateFormValue();
  }

  private _removeFile(index: number): void {
    if (this.disabled) return;
    const fileData = this._files[index];
    if (fileData.thumbnailUrl) {
      URL.revokeObjectURL(fileData.thumbnailUrl);
    }

    this._files.splice(index, 1);
    this.requestUpdate('_files'); // Force Lit to rerender since we mutated array
    if (this._inputEl) this._inputEl.value = ''; // Reset input so same file can be re-added
    this._updateFormValue();
  }

  // ── Event Listeners ──────────────────────────────────────────────────────────

  private _onInputChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      this._handleFiles(target.files);
    }
  }

  private _onDropzoneClick(): void {
    if (!this.disabled) {
      this._inputEl.click();
    }
  }

  private _onKeyDown(e: KeyboardEvent): void {
    if (this.disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._inputEl.click();
    }
  }

  private _onDragOver(e: DragEvent): void {
    e.preventDefault();
    if (!this.disabled) this._isDragActive = true;
  }

  private _onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this._isDragActive = false;
  }

  private _onDrop(e: DragEvent): void {
    e.preventDefault();
    this._isDragActive = false;
    if (!this.disabled && e.dataTransfer?.files) {
      this._handleFiles(e.dataTransfer.files);
    }
  }

  // ── Utils ────────────────────────────────────────────────────────────────────

  private _formatBytes(bytes: number, decimals = 2): string {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  private _isValidFileType(file: File): boolean {
    if (!this.accept) return true;

    const acceptedTypes = this.accept
      .split(',')
      .map((type) => type.trim().toLowerCase())
      .filter((type) => type.length > 0);

    if (acceptedTypes.length === 0) return true;

    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    return acceptedTypes.some((type) => {
      if (type.startsWith('.')) {
        return fileName.endsWith(type);
      }
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', '/'));
      }
      return fileType === type;
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  override render(): TemplateResult {
    const dropzoneClasses = {
      dropzone: true,
      'drag-active': this._isDragActive,
      [`size-${this.size}`]: true,
    };

    return html`
      <div
        part="dropzone"
        role="button"
        class="${classMap(dropzoneClasses)}"
        tabindex="${this.disabled ? -1 : 0}"
        @click="${this._onDropzoneClick}"
        @keydown="${this._onKeyDown}"
        @dragover="${this._onDragOver}"
        @dragleave="${this._onDragLeave}"
        @drop="${this._onDrop}"
        aria-disabled="${this.disabled}"
        aria-label="${this._i18n.dropzoneText}"
      >
        <div class="icon-container">
          <slot name="icon">
            <vi-icon name="upload"></vi-icon>
          </slot>
        </div>
        <div class="text">
          <slot name="text">${this._i18n.dropzoneText}</slot>
        </div>
        <input
          type="file"
          hidden
          ?multiple="${this.multiple}"
          accept="${this.accept}"
          @change="${this._onInputChange}"
        />
      </div>

      ${this._files.length > 0
        ? html`
            <ul part="file-list" class="file-list" aria-live="polite">
              ${this._files.map(
                (fileData, index) => html`
                  <li class="file-item ${fileData.status}">
                    ${!this.hideThumbnail
                      ? html`
                          <div class="file-thumbnail">
                            ${fileData.thumbnailUrl
                              ? html`<img
                                  src="${fileData.thumbnailUrl}"
                                  alt="${fileData.file.name} preview"
                                />`
                              : html`<vi-icon name="document"></vi-icon>`}
                          </div>
                        `
                      : ''}
                    <div class="file-info-container">
                      <div class="file-info">
                        <span class="file-name" title="${fileData.file.name}"
                          >${fileData.file.name}</span
                        >
                        ${fileData.status === 'error' && fileData.error
                          ? html`<span class="file-error-message"
                              >${fileData.error}</span
                            >`
                          : html`<span class="file-size"
                              >${this._formatBytes(fileData.file.size)}</span
                            >`}
                      </div>
                      ${fileData.status === 'uploading'
                        ? html`
                            <div class="progress-bar">
                              <div
                                class="progress-fill"
                                style="width: ${fileData.progress}%"
                              ></div>
                            </div>
                          `
                        : ''}
                    </div>
                    <button
                      class="remove-btn"
                      aria-label="${this._i18n.removeFile}"
                      title="${this._i18n.removeFile}"
                      @click="${() => this._removeFile(index)}"
                    >
                      <vi-icon name="x"></vi-icon>
                    </button>
                  </li>
                `,
              )}
            </ul>
          `
        : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-upload': ViUpload;
  }
}
