import { TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export interface ViUploadI18n {
    dropzoneText: string;
    invalidType: string;
    sizeLimit: string;
    maxFilesLimit: string;
    removeFile: string;
}
export declare const defaultUploadI18n: ViUploadI18n;
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
export declare class ViUpload extends ViElement {
    static formAssociated: boolean;
    static styles: import('lit').CSSResult;
    /** Form name for ElementInternals */
    accessor name: string;
    /** Comma-separated list of allowed file types */
    accessor accept: string;
    /** Allows multiple files */
    accessor multiple: boolean;
    /** Disables the component */
    accessor disabled: boolean;
    /** Maximum file size in bytes */
    accessor maxSize: number;
    /** Maximum number of files allowed (when multiple is true) */
    accessor maxFiles: number;
    /** Size variant of the component */
    accessor size: ViUploadSize;
    /** Hides the thumbnail preview and icon in the file list */
    accessor hideThumbnail: boolean;
    /** Translation strings for component text (i18n) */
    accessor i18n: Partial<ViUploadI18n>;
    private get _i18n();
    private _internals;
    private accessor _files;
    private accessor _isDragActive;
    private accessor _inputEl;
    private accessor _dropzoneEl;
    constructor();
    disconnectedCallback(): void;
    /** Updates the visual progress and status of a specific file */
    updateFileStatus(fileIdOrFile: string | File, updates: Partial<Pick<ViUploadFile, 'status' | 'progress' | 'error'>>): void;
    updated(changedProperties: Map<string, unknown>): void;
    formResetCallback(): void;
    formDisabledCallback(disabled: boolean): void;
    private _updateFormValue;
    private _handleFiles;
    private _removeFile;
    private _onInputChange;
    private _onDropzoneClick;
    private _onKeyDown;
    private _onDragOver;
    private _onDragLeave;
    private _onDrop;
    private _formatBytes;
    private _isValidFileType;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-upload': ViUpload;
    }
}
//# sourceMappingURL=vi-upload.d.ts.map