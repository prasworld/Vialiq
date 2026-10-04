import { r as r$1, i, b } from './iframe-hzqOaETw.js';
import { o } from './if-defined-WAi_GbIg.js';
import { V as ViElement, t, n } from './vi-element-B3cR7BW5.js';
import { r } from './state-jUdfvlB0.js';
import { e as e$1 } from './query-CHb9Ft_d.js';
import { e } from './class-map-bFpI-exh.js';
import './vi-icon-KKP0VEmY.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import { d as documentIcon } from './document-Ga13OJpQ.js';
import { u as uploadIcon } from './upload-wMOkv4pn.js';
import { x as xIcon } from './x-3JmBhc9n.js';
import './preload-helper-D5QYaGzd.js';
import './base-Cl6v8-BZ.js';
import './directive-BKuZRRPO.js';

const uploadStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.dropzone{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--vi-upload-dropzone-gap, var(--vi-spacing-sm, .75rem));padding:var(--vi-upload-dropzone-padding, var(--vi-spacing-2xl, 3rem));border:2px dashed var(--vi-upload-border-color, var(--vi-border-04, #bdbdbd));border-radius:var(--vi-upload-border-radius, var(--vi-border-radius-lg, 8px));background-color:var(--vi-upload-bg, var(--vi-layer-01, #ffffff));cursor:pointer;transition:all .2s ease-in-out;outline:none}.dropzone:hover,.dropzone.drag-active{border-color:var(--vi-upload-border-color-active, var(--vi-color-primary, #3676d0));background-color:var(--vi-upload-bg-active, var(--vi-layer-hover-01, #f3f4f6))}.dropzone:focus-visible{border-style:solid;border-color:var(--vi-upload-focus-color, var(--vi-focus, #3676d0));box-shadow:var(--vi-focus-ring-shadow, 0 0 0 3px var(--vi-focus-ring-color, var(--vi-color-blue-200, #cee6ff)))}.icon-container{color:var(--vi-upload-icon-color, var(--vi-text-secondary, #4b5563));display:flex}.icon-container ::slotted([slot=icon]),.icon-container ::slotted(svg),.icon-container svg{width:2rem;height:2rem}.text{color:var(--vi-upload-text-color, var(--vi-text-primary, #111827));font-weight:var(--vi-upload-font-weight, var(--vi-font-weight-medium, 500));text-align:center}.file-list{margin:var(--vi-upload-list-margin-top, var(--vi-spacing-md, 1rem)) 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:var(--vi-upload-list-gap, var(--vi-spacing-sm, .75rem))}.file-item{display:flex;align-items:center;gap:var(--vi-upload-item-content-gap, var(--vi-spacing-sm, .75rem));padding:var(--vi-upload-item-padding, var(--vi-spacing-xs, .5rem) var(--vi-spacing-sm, .75rem));border:1px solid var(--vi-upload-item-border, var(--vi-border-02, #eeeeee));border-radius:var(--vi-upload-item-radius, var(--vi-border-radius-md, 6px));background-color:var(--vi-upload-item-bg, var(--vi-layer-01, #ffffff))}.file-item.error{border-color:var(--vi-upload-error-color, var(--vi-color-error, #ef4444));background-color:var(--vi-upload-error-bg, var(--vi-bg-error, #ffebee))}.file-item.success{border-color:var(--vi-upload-success-color, var(--vi-color-green-500, #489167));background-color:var(--vi-upload-success-bg, var(--vi-color-green-100, #e6f0eb))}.file-info-container{display:flex;flex-direction:column;flex:1;gap:var(--vi-upload-item-gap, var(--vi-spacing-xs, .5rem));min-width:0}.file-info{display:flex;align-items:center;gap:var(--vi-spacing-sm, .75rem);overflow:hidden}.file-name{font-size:var(--vi-upload-item-name-size, var(--vi-font-size-sm, .8125rem));color:var(--vi-upload-item-name-color, var(--vi-text-primary, #111827));font-weight:var(--vi-upload-item-name-weight, var(--vi-font-weight-medium, 500));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.file-size{font-size:var(--vi-upload-item-size-size, var(--vi-font-size-xs, .75rem));color:var(--vi-upload-item-size-color, var(--vi-text-secondary, #4b5563))}.file-error-message{font-size:var(--vi-upload-item-size-size, var(--vi-font-size-xs, .75rem));color:var(--vi-upload-error-color, var(--vi-color-error, #ef4444))}.remove-btn{display:flex;align-items:center;justify-content:center;width:24px;height:24px;border:none;background:transparent;color:var(--vi-upload-icon-color, var(--vi-text-secondary, #4b5563));cursor:pointer;border-radius:var(--vi-upload-item-radius, var(--vi-border-radius-sm, 4px));transition:all .2s}.remove-btn:hover{background-color:var(--vi-upload-remove-hover-bg, var(--vi-layer-hover-01, #f3f4f6));color:var(--vi-upload-remove-hover-color, var(--vi-text-primary, #111827))}.remove-btn:focus-visible{outline:2px solid var(--vi-upload-focus-color, var(--vi-focus, #3676d0));outline-offset:-2px}.remove-btn svg{width:16px;height:16px}.progress-bar{width:100%;height:4px;background-color:var(--vi-upload-progress-bg, var(--vi-border-02, #eeeeee));border-radius:2px;overflow:hidden}.progress-fill{height:100%;background-color:var(--vi-upload-progress-color, var(--vi-color-primary, #3676d0));transition:width .3s ease}.file-thumbnail{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:var(--vi-upload-thumbnail-radius, 4px);background-color:var(--vi-upload-thumbnail-bg, var(--vi-layer-02, #f3f4f6));border:1px solid var(--vi-upload-thumbnail-border, var(--vi-border-02, #eeeeee));box-shadow:var(--vi-upload-thumbnail-shadow, var(--vi-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, .03)));overflow:hidden;flex-shrink:0}.file-thumbnail img{width:100%;height:100%;object-fit:cover}.file-thumbnail vi-icon{width:16px;height:16px;color:var(--vi-upload-thumbnail-icon-color, var(--vi-text-secondary, #4b5563))}}:host{display:block;font-family:var(--vi-font-family, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif))}:host([disabled]) .dropzone{cursor:not-allowed;opacity:.5;border-color:var(--vi-upload-border-color, var(--vi-border-02, #eeeeee));background-color:var(--vi-upload-bg, var(--vi-layer-01, #ffffff))}:host([size=sm]) .dropzone{flex-direction:row;justify-content:flex-start;padding:var(--vi-upload-dropzone-padding-sm, var(--vi-spacing-sm, .75rem) var(--vi-spacing-md, 1rem));gap:var(--vi-upload-dropzone-gap-sm, var(--vi-spacing-xs, .5rem));min-height:auto}:host([size=sm]) .dropzone .icon-container ::slotted([slot=icon]),:host([size=sm]) .dropzone .icon-container ::slotted(svg),:host([size=sm]) .dropzone .icon-container svg{width:16px;height:16px}:host([size=sm]) .dropzone .text{font-size:var(--vi-upload-font-size-sm, var(--vi-font-size-sm, .8125rem))}";

function applyDecs2203RFactory() {
    function createAddInitializerMethod(initializers, decoratorFinishedRef) {
        return function addInitializer(initializer) {
            assertNotFinished(decoratorFinishedRef, "addInitializer");
            assertCallable(initializer, "An initializer");
            initializers.push(initializer);
        };
    }
    function memberDec(dec, name, desc, initializers, kind, isStatic, isPrivate, metadata, value) {
        var kindStr;
        switch(kind){
            case 1:
                kindStr = "accessor";
                break;
            case 2:
                kindStr = "method";
                break;
            case 3:
                kindStr = "getter";
                break;
            case 4:
                kindStr = "setter";
                break;
            default:
                kindStr = "field";
        }
        var ctx = {
            kind: kindStr,
            name: isPrivate ? "#" + name : name,
            static: isStatic,
            private: isPrivate,
            metadata: metadata
        };
        var decoratorFinishedRef = {
            v: false
        };
        ctx.addInitializer = createAddInitializerMethod(initializers, decoratorFinishedRef);
        var get, set;
        if (kind === 0) {
            if (isPrivate) {
                get = desc.get;
                set = desc.set;
            } else {
                get = function() {
                    return this[name];
                };
                set = function(v) {
                    this[name] = v;
                };
            }
        } else if (kind === 2) {
            get = function() {
                return desc.value;
            };
        } else {
            if (kind === 1 || kind === 3) {
                get = function() {
                    return desc.get.call(this);
                };
            }
            if (kind === 1 || kind === 4) {
                set = function(v) {
                    desc.set.call(this, v);
                };
            }
        }
        ctx.access = get && set ? {
            get: get,
            set: set
        } : get ? {
            get: get
        } : {
            set: set
        };
        try {
            return dec(value, ctx);
        } finally{
            decoratorFinishedRef.v = true;
        }
    }
    function assertNotFinished(decoratorFinishedRef, fnName) {
        if (decoratorFinishedRef.v) {
            throw new Error("attempted to call " + fnName + " after decoration was finished");
        }
    }
    function assertCallable(fn, hint) {
        if (typeof fn !== "function") {
            throw new TypeError(hint + " must be a function");
        }
    }
    function assertValidReturnValue(kind, value) {
        var type = typeof value;
        if (kind === 1) {
            if (type !== "object" || value === null) {
                throw new TypeError("accessor decorators must return an object with get, set, or init properties or void 0");
            }
            if (value.get !== undefined) {
                assertCallable(value.get, "accessor.get");
            }
            if (value.set !== undefined) {
                assertCallable(value.set, "accessor.set");
            }
            if (value.init !== undefined) {
                assertCallable(value.init, "accessor.init");
            }
        } else if (type !== "function") {
            var hint;
            if (kind === 0) {
                hint = "field";
            } else if (kind === 10) {
                hint = "class";
            } else {
                hint = "method";
            }
            throw new TypeError(hint + " decorators must return a function or void 0");
        }
    }
    function applyMemberDec(ret, base, decInfo, name, kind, isStatic, isPrivate, initializers, metadata) {
        var decs = decInfo[0];
        var desc, init, value;
        if (isPrivate) {
            if (kind === 0 || kind === 1) {
                desc = {
                    get: decInfo[3],
                    set: decInfo[4]
                };
            } else if (kind === 3) {
                desc = {
                    get: decInfo[3]
                };
            } else if (kind === 4) {
                desc = {
                    set: decInfo[3]
                };
            } else {
                desc = {
                    value: decInfo[3]
                };
            }
        } else if (kind !== 0) {
            desc = Object.getOwnPropertyDescriptor(base, name);
        }
        if (kind === 1) {
            value = {
                get: desc.get,
                set: desc.set
            };
        } else if (kind === 2) {
            value = desc.value;
        } else if (kind === 3) {
            value = desc.get;
        } else if (kind === 4) {
            value = desc.set;
        }
        var newValue, get, set;
        if (typeof decs === "function") {
            newValue = memberDec(decs, name, desc, initializers, kind, isStatic, isPrivate, metadata, value);
            if (newValue !== void 0) {
                assertValidReturnValue(kind, newValue);
                if (kind === 0) {
                    init = newValue;
                } else if (kind === 1) {
                    init = newValue.init;
                    get = newValue.get || value.get;
                    set = newValue.set || value.set;
                    value = {
                        get: get,
                        set: set
                    };
                } else {
                    value = newValue;
                }
            }
        } else {
            for(var i = decs.length - 1; i >= 0; i--){
                var dec = decs[i];
                newValue = memberDec(dec, name, desc, initializers, kind, isStatic, isPrivate, metadata, value);
                if (newValue !== void 0) {
                    assertValidReturnValue(kind, newValue);
                    var newInit;
                    if (kind === 0) {
                        newInit = newValue;
                    } else if (kind === 1) {
                        newInit = newValue.init;
                        get = newValue.get || value.get;
                        set = newValue.set || value.set;
                        value = {
                            get: get,
                            set: set
                        };
                    } else {
                        value = newValue;
                    }
                    if (newInit !== void 0) {
                        if (init === void 0) {
                            init = newInit;
                        } else if (typeof init === "function") {
                            init = [
                                init,
                                newInit
                            ];
                        } else {
                            init.push(newInit);
                        }
                    }
                }
            }
        }
        if (kind === 0 || kind === 1) {
            if (init === void 0) {
                init = function(instance, init) {
                    return init;
                };
            } else if (typeof init !== "function") {
                var ownInitializers = init;
                init = function(instance, init) {
                    var value = init;
                    for(var i = 0; i < ownInitializers.length; i++){
                        value = ownInitializers[i].call(instance, value);
                    }
                    return value;
                };
            } else {
                var originalInitializer = init;
                init = function(instance, init) {
                    return originalInitializer.call(instance, init);
                };
            }
            ret.push(init);
        }
        if (kind !== 0) {
            if (kind === 1) {
                desc.get = value.get;
                desc.set = value.set;
            } else if (kind === 2) {
                desc.value = value;
            } else if (kind === 3) {
                desc.get = value;
            } else if (kind === 4) {
                desc.set = value;
            }
            if (isPrivate) {
                if (kind === 1) {
                    ret.push(function(instance, args) {
                        return value.get.call(instance, args);
                    });
                    ret.push(function(instance, args) {
                        return value.set.call(instance, args);
                    });
                } else if (kind === 2) {
                    ret.push(value);
                } else {
                    ret.push(function(instance, args) {
                        return value.call(instance, args);
                    });
                }
            } else {
                Object.defineProperty(base, name, desc);
            }
        }
    }
    function applyMemberDecs(Class, decInfos, metadata) {
        var ret = [];
        var protoInitializers;
        var staticInitializers;
        var existingProtoNonFields = new Map();
        var existingStaticNonFields = new Map();
        for(var i = 0; i < decInfos.length; i++){
            var decInfo = decInfos[i];
            if (!Array.isArray(decInfo)) continue;
            var kind = decInfo[1];
            var name = decInfo[2];
            var isPrivate = decInfo.length > 3;
            var isStatic = kind >= 5;
            var base;
            var initializers;
            if (isStatic) {
                base = Class;
                kind = kind - 5;
                staticInitializers = staticInitializers || [];
                initializers = staticInitializers;
            } else {
                base = Class.prototype;
                protoInitializers = protoInitializers || [];
                initializers = protoInitializers;
            }
            if (kind !== 0 && !isPrivate) {
                var existingNonFields = isStatic ? existingStaticNonFields : existingProtoNonFields;
                var existingKind = existingNonFields.get(name) || 0;
                if (existingKind === true || existingKind === 3 && kind !== 4 || existingKind === 4 && kind !== 3) {
                    throw new Error("Attempted to decorate a public method/accessor that has the same name as a previously decorated public method/accessor. This is not currently supported by the decorators plugin. Property name was: " + name);
                } else if (!existingKind && kind > 2) {
                    existingNonFields.set(name, kind);
                } else {
                    existingNonFields.set(name, true);
                }
            }
            applyMemberDec(ret, base, decInfo, name, kind, isStatic, isPrivate, initializers, metadata);
        }
        pushInitializers(ret, protoInitializers);
        pushInitializers(ret, staticInitializers);
        return ret;
    }
    function pushInitializers(ret, initializers) {
        if (initializers) {
            ret.push(function(instance) {
                for(var i = 0; i < initializers.length; i++){
                    initializers[i].call(instance);
                }
                return instance;
            });
        }
    }
    function applyClassDecs(targetClass, classDecs, metadata) {
        if (classDecs.length > 0) {
            var initializers = [];
            var newClass = targetClass;
            var name = targetClass.name;
            for(var i = classDecs.length - 1; i >= 0; i--){
                var decoratorFinishedRef = {
                    v: false
                };
                try {
                    var nextNewClass = classDecs[i](newClass, {
                        kind: "class",
                        name: name,
                        addInitializer: createAddInitializerMethod(initializers, decoratorFinishedRef),
                        metadata
                    });
                } finally{
                    decoratorFinishedRef.v = true;
                }
                if (nextNewClass !== undefined) {
                    assertValidReturnValue(10, nextNewClass);
                    newClass = nextNewClass;
                }
            }
            return [
                defineMetadata(newClass, metadata),
                function() {
                    for(var i = 0; i < initializers.length; i++){
                        initializers[i].call(newClass);
                    }
                }
            ];
        }
    }
    function defineMetadata(Class, metadata) {
        return Object.defineProperty(Class, Symbol.metadata || Symbol.for("Symbol.metadata"), {
            configurable: true,
            enumerable: true,
            value: metadata
        });
    }
    return function applyDecs2203R(targetClass, memberDecs, classDecs, parentClass) {
        if (parentClass !== void 0) {
            var parentMetadata = parentClass[Symbol.metadata || Symbol.for("Symbol.metadata")];
        }
        var metadata = Object.create(parentMetadata === void 0 ? null : parentMetadata);
        var e = applyMemberDecs(targetClass, memberDecs, metadata);
        if (!classDecs.length) defineMetadata(targetClass, metadata);
        return {
            e: e,
            get c () {
                return applyClassDecs(targetClass, classDecs, metadata);
            }
        };
    };
}
function _apply_decs_2203_r(targetClass, memberDecs, classDecs, parentClass) {
    return (_apply_decs_2203_r = applyDecs2203RFactory())(targetClass, memberDecs, classDecs, parentClass);
}
function _identity(x) {
    return x;
}
var _dec, _initClass, _ViElement, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, /** Form name for ElementInternals */ _init_name, /** Comma-separated list of allowed file types */ _init_accept, /** Allows multiple files */ _init_multiple, /** Disables the component */ _init_disabled, /** Maximum file size in bytes */ _init_maxSize, /** Maximum number of files allowed (when multiple is true) */ _init_maxFiles, /** Size variant of the component */ _init_size, /** Hides the thumbnail preview and icon in the file list */ _init_hideThumbnail, /** Translation strings for component text (i18n) */ _init_i18n, _init__files, _init__isDragActive, _init__inputEl, _init__dropzoneEl, _initProto;
registerIcons([
    uploadIcon,
    xIcon,
    documentIcon
]);
const defaultUploadI18n = {
    dropzoneText: 'Drag and drop files here, or click to browse',
    invalidType: 'Invalid file type',
    sizeLimit: 'File size exceeds limit',
    maxFilesLimit: 'Maximum files limit exceeded',
    removeFile: 'Remove file'
};
let _ViUpload;
_dec = t('vi-upload'), _dec1 = n({
    type: String,
    reflect: true
}), _dec2 = n({
    type: String,
    reflect: true
}), _dec3 = n({
    type: Boolean,
    reflect: true
}), _dec4 = n({
    type: Boolean,
    reflect: true
}), _dec5 = n({
    type: Number
}), _dec6 = n({
    type: Number
}), _dec7 = n({
    type: String,
    reflect: true
}), _dec8 = n({
    type: Boolean,
    attribute: 'hide-thumbnail'
}), _dec9 = n({
    type: Object
}), _dec10 = r(), _dec11 = r(), _dec12 = e$1('input[type="file"]'), _dec13 = e$1('.dropzone');
new class extends _identity {
    constructor(){
        super(_ViUpload), _initClass();
    }
    static{
        class ViUpload extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_name, _init_accept, _init_multiple, _init_disabled, _init_maxSize, _init_maxFiles, _init_size, _init_hideThumbnail, _init_i18n, _init__files, _init__isDragActive, _init__inputEl, _init__dropzoneEl, _initProto], c: [_ViUpload, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "name"
                    ],
                    [
                        _dec2,
                        1,
                        "accept"
                    ],
                    [
                        _dec3,
                        1,
                        "multiple"
                    ],
                    [
                        _dec4,
                        1,
                        "disabled"
                    ],
                    [
                        _dec5,
                        1,
                        "maxSize"
                    ],
                    [
                        _dec6,
                        1,
                        "maxFiles"
                    ],
                    [
                        _dec7,
                        1,
                        "size"
                    ],
                    [
                        _dec8,
                        1,
                        "hideThumbnail"
                    ],
                    [
                        _dec9,
                        1,
                        "i18n"
                    ],
                    [
                        _dec10,
                        1,
                        "_files"
                    ],
                    [
                        _dec11,
                        1,
                        "_isDragActive"
                    ],
                    [
                        _dec12,
                        1,
                        "_inputEl"
                    ],
                    [
                        _dec13,
                        1,
                        "_dropzoneEl"
                    ]
                ], [
                    _dec
                ], _ViElement));
            }
            static formAssociated = true;
            static styles = i`
    ${r$1(uploadStyles)}
  `;
            #___private_name_1 = (_initProto(this), _init_name(this, ''));
            get name() {
                return this.#___private_name_1;
            }
            set name(_v) {
                this.#___private_name_1 = _v;
            }
            #___private_accept_2 = _init_accept(this, '');
            get accept() {
                return this.#___private_accept_2;
            }
            set accept(_v) {
                this.#___private_accept_2 = _v;
            }
            #___private_multiple_3 = _init_multiple(this, false);
            get multiple() {
                return this.#___private_multiple_3;
            }
            set multiple(_v) {
                this.#___private_multiple_3 = _v;
            }
            #___private_disabled_4 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_4;
            }
            set disabled(_v) {
                this.#___private_disabled_4 = _v;
            }
            #___private_maxSize_5 = _init_maxSize(this, 0);
            get maxSize() {
                return this.#___private_maxSize_5;
            }
            set maxSize(_v) {
                this.#___private_maxSize_5 = _v;
            }
            #___private_maxFiles_6 = _init_maxFiles(this, 0);
            get maxFiles() {
                return this.#___private_maxFiles_6;
            }
            set maxFiles(_v) {
                this.#___private_maxFiles_6 = _v;
            }
            #___private_size_7 = _init_size(this, 'md');
            get size() {
                return this.#___private_size_7;
            }
            set size(_v) {
                this.#___private_size_7 = _v;
            }
            #___private_hideThumbnail_8 = _init_hideThumbnail(this, false);
            get hideThumbnail() {
                return this.#___private_hideThumbnail_8;
            }
            set hideThumbnail(_v) {
                this.#___private_hideThumbnail_8 = _v;
            }
            #___private_i18n_9 = _init_i18n(this, {});
            get i18n() {
                return this.#___private_i18n_9;
            }
            set i18n(_v) {
                this.#___private_i18n_9 = _v;
            }
            get _i18n() {
                return {
                    ...defaultUploadI18n,
                    ...this.i18n
                };
            }
            // ── Private State ────────────────────────────────────────────────────────────
            _internals;
            #___private__files_10 = _init__files(this, []);
            get _files() {
                return this.#___private__files_10;
            }
            set _files(_v) {
                this.#___private__files_10 = _v;
            }
            #___private__isDragActive_11 = _init__isDragActive(this, false);
            get _isDragActive() {
                return this.#___private__isDragActive_11;
            }
            set _isDragActive(_v) {
                this.#___private__isDragActive_11 = _v;
            }
            #___private__inputEl_12 = _init__inputEl(this);
            get _inputEl() {
                return this.#___private__inputEl_12;
            }
            set _inputEl(_v) {
                this.#___private__inputEl_12 = _v;
            }
            #___private__dropzoneEl_13 = _init__dropzoneEl(this);
            get _dropzoneEl() {
                return this.#___private__dropzoneEl_13;
            }
            set _dropzoneEl(_v) {
                this.#___private__dropzoneEl_13 = _v;
            }
            constructor(){
                super();
                this._internals = this.attachInternals();
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                // Cleanup object URLs to avoid memory leaks
                this._files.forEach((f)=>{
                    if (f.thumbnailUrl) URL.revokeObjectURL(f.thumbnailUrl);
                });
            }
            // ── Public API (Controlled Components) ───────────────────────────────────────
            /** Updates the visual progress and status of a specific file */ updateFileStatus(fileIdOrFile, updates) {
                const index = this._files.findIndex((f)=>f.id === fileIdOrFile || f.file === fileIdOrFile);
                if (index === -1) return;
                this._files[index] = {
                    ...this._files[index],
                    ...updates
                };
                this._files = [
                    ...this._files
                ]; // Trigger re-render
            }
            // ── Form Integration ─────────────────────────────────────────────────────────
            updated(changedProperties) {
                super.updated(changedProperties);
            // We only need to update the form value when files change, but since files
            // is a state property, we handle form updates directly in _updateFormValue.
            }
            formResetCallback() {
                this._files = [];
                if (this._inputEl) this._inputEl.value = '';
                this._updateFormValue();
            }
            formDisabledCallback(disabled) {
                this.disabled = disabled;
            }
            _updateFormValue() {
                const validFiles = this._files.filter((f)=>!f.error).map((f)=>f.file);
                if (validFiles.length === 0) {
                    this._internals.setFormValue(null);
                } else if (!this.multiple) {
                    this._internals.setFormValue(validFiles[0]);
                } else {
                    const formData = new FormData();
                    if (this.name) {
                        validFiles.forEach((file)=>formData.append(this.name, file));
                        this._internals.setFormValue(formData);
                    } else {
                        // Form data is irrelevant if there's no name, but we still clear/set it.
                        this._internals.setFormValue(null);
                    }
                }
                this.dispatchEvent(new CustomEvent('vi-upload-change', {
                    detail: validFiles,
                    bubbles: true,
                    composed: true
                }));
            }
            // ── File Handling ────────────────────────────────────────────────────────────
            _handleFiles(files) {
                if (this.disabled) return;
                const newFiles = Array.from(files);
                if (newFiles.length === 0) return;
                let filesToAdd = newFiles;
                if (!this.multiple) {
                    // If multiple is false, we only process the first file and replace the existing list
                    filesToAdd = [
                        newFiles[0]
                    ];
                    // Cleanup existing thumbnails before replacing
                    this._files.forEach((f)=>{
                        if (f.thumbnailUrl) URL.revokeObjectURL(f.thumbnailUrl);
                    });
                    this._files = [];
                } else if (this.maxFiles > 0) {
                    const availableSlots = this.maxFiles - this._files.length;
                    if (availableSlots <= 0) {
                        this.dispatchEvent(new CustomEvent('vi-upload-error', {
                            detail: {
                                error: this._i18n.maxFilesLimit
                            },
                            bubbles: true,
                            composed: true
                        }));
                        return;
                    }
                    if (filesToAdd.length > availableSlots) {
                        const discardedFiles = filesToAdd.slice(availableSlots);
                        discardedFiles.forEach((f)=>{
                            this.dispatchEvent(new CustomEvent('vi-upload-error', {
                                detail: {
                                    file: f,
                                    error: this._i18n.maxFilesLimit
                                },
                                bubbles: true,
                                composed: true
                            }));
                        });
                        filesToAdd = filesToAdd.slice(0, availableSlots);
                    }
                }
                const processedFiles = filesToAdd.map((file)=>{
                    let error = '';
                    let status = 'pending';
                    const id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                    if (!this._isValidFileType(file)) {
                        error = this._i18n.invalidType;
                        status = 'error';
                    } else if (this.maxSize && file.size > this.maxSize) {
                        error = `${this._i18n.sizeLimit} (${this._formatBytes(this.maxSize)})`;
                        status = 'error';
                    }
                    if (error) {
                        this.dispatchEvent(new CustomEvent('vi-upload-error', {
                            detail: {
                                file,
                                error
                            },
                            bubbles: true,
                            composed: true
                        }));
                    }
                    let thumbnailUrl;
                    if (file.type.startsWith('image/')) {
                        thumbnailUrl = URL.createObjectURL(file);
                    }
                    return {
                        id,
                        file,
                        status,
                        progress: 0,
                        error,
                        thumbnailUrl
                    };
                });
                this._files = [
                    ...this._files,
                    ...processedFiles
                ];
                this._updateFormValue();
            }
            _removeFile(index) {
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
            _onInputChange(e) {
                const target = e.target;
                if (target.files) {
                    this._handleFiles(target.files);
                }
            }
            _onDropzoneClick() {
                if (!this.disabled) {
                    this._inputEl.click();
                }
            }
            _onKeyDown(e) {
                if (this.disabled) return;
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this._inputEl.click();
                }
            }
            _onDragOver(e) {
                e.preventDefault();
                if (!this.disabled) this._isDragActive = true;
            }
            _onDragLeave(e) {
                e.preventDefault();
                this._isDragActive = false;
            }
            _onDrop(e) {
                e.preventDefault();
                this._isDragActive = false;
                if (!this.disabled && e.dataTransfer?.files) {
                    this._handleFiles(e.dataTransfer.files);
                }
            }
            // ── Utils ────────────────────────────────────────────────────────────────────
            _formatBytes(bytes, decimals = 2) {
                if (!+bytes) return '0 Bytes';
                const k = 1024;
                const dm = decimals < 0 ? 0 : decimals;
                const sizes = [
                    'Bytes',
                    'KB',
                    'MB',
                    'GB',
                    'TB'
                ];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
            }
            _isValidFileType(file) {
                if (!this.accept) return true;
                const acceptedTypes = this.accept.split(',').map((type)=>type.trim().toLowerCase()).filter((type)=>type.length > 0);
                if (acceptedTypes.length === 0) return true;
                const fileType = file.type.toLowerCase();
                const fileName = file.name.toLowerCase();
                return acceptedTypes.some((type)=>{
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
            render() {
                const dropzoneClasses = {
                    dropzone: true,
                    'drag-active': this._isDragActive,
                    [`size-${this.size}`]: true
                };
                return b`
      <div
        part="dropzone"
        role="button"
        class="${e(dropzoneClasses)}"
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

      ${this._files.length > 0 ? b`
            <ul part="file-list" class="file-list" aria-live="polite">
              ${this._files.map((fileData, index)=>b`
                  <li class="file-item ${fileData.status}">
                    ${!this.hideThumbnail ? b`
                          <div class="file-thumbnail">
                            ${fileData.thumbnailUrl ? b`<img
                                  src="${fileData.thumbnailUrl}"
                                  alt="${fileData.file.name} preview"
                                />` : b`<vi-icon name="document"></vi-icon>`}
                          </div>
                        ` : ''}
                    <div class="file-info-container">
                      <div class="file-info">
                        <span class="file-name" title="${fileData.file.name}"
                          >${fileData.file.name}</span
                        >
                        ${fileData.status === 'error' && fileData.error ? b`<span class="file-error-message"
                              >${fileData.error}</span
                            >` : b`<span class="file-size"
                              >${this._formatBytes(fileData.file.size)}</span
                            >`}
                      </div>
                      ${fileData.status === 'uploading' ? b`
                            <div class="progress-bar">
                              <div
                                class="progress-fill"
                                style="width: ${fileData.progress}%"
                              ></div>
                            </div>
                          ` : ''}
                    </div>
                    <button
                      class="remove-btn"
                      aria-label="${this._i18n.removeFile}"
                      title="${this._i18n.removeFile}"
                      @click="${()=>this._removeFile(index)}"
                    >
                      <vi-icon name="x"></vi-icon>
                    </button>
                  </li>
                `)}
            </ul>
          ` : ''}
    `;
            }
        }
    }
}();

const meta = {
    title: 'Components/Upload',
    component: 'vi-upload',
    argTypes: {
        name: {
            control: 'text',
            description: 'Form name for ElementInternals submission'
        },
        accept: {
            control: 'text',
            description: 'Comma-separated list of allowed file types'
        },
        multiple: {
            control: 'boolean',
            description: 'Allows selecting multiple files'
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the dropzone'
        },
        maxSize: {
            control: 'number',
            description: 'Maximum file size in bytes'
        },
        maxFiles: {
            control: 'number',
            description: 'Maximum number of files allowed'
        },
        hideThumbnail: {
            control: 'boolean',
            description: 'Hides the thumbnail preview and icon in the file list'
        }
    },
    parameters: {
        actions: {
            handles: [
                'vi-upload-change',
                'vi-upload-error'
            ]
        }
    }
};
const Default = {
    args: {
        name: 'file',
        accept: 'image/*,.pdf',
        multiple: true,
        disabled: false,
        hideThumbnail: false,
        maxSize: 5000000,
        maxFiles: 5
    },
    render: (args)=>b`
    <div style="max-width: 500px; font-family: sans-serif;">
      <vi-upload
        name=${o(args.name)}
        accept=${o(args.accept)}
        ?multiple=${args.multiple}
        ?disabled=${args.disabled}
        ?hide-thumbnail=${args.hideThumbnail}
        maxSize=${o(args.maxSize)}
        maxFiles=${o(args.maxFiles)}
      ></vi-upload>
    </div>
  `
};
const SingleFile = {
    render: ()=>b`
    <div style="max-width: 500px; font-family: sans-serif;">
      <p style="margin-top: 0; font-size: 14px; color: #666;">
        This upload component only accepts a single file. Selecting a new file
        replaces the existing one.
      </p>
      <vi-upload accept=".pdf"></vi-upload>
    </div>
  `
};
const CustomTextAndIcon = {
    render: ()=>b`
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
  `
};
const FormIntegration = {
    render: ()=>b`
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
        @submit=${(e)=>{
            e.preventDefault();
            const fd = new FormData(e.target);
            const attachments = fd.getAll('attachments');
            const fileNames = attachments.map((f)=>f.name).join(', ');
            alert('Form Submitted!\\n\\nNumber of files attached: ' + attachments.length + '\\nFilenames: ' + fileNames);
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
  `
};
const ControlledUpload = {
    render: ()=>{
        const handleUploadChange = (e)=>{
            const uploadEl = e.target;
            const files = e.detail;
            // Simulate an async upload for each file
            files.forEach((file)=>{
                uploadEl.updateFileStatus(file, {
                    status: 'uploading',
                    progress: 0
                });
                let progress = 0;
                const interval = setInterval(()=>{
                    progress += Math.random() * 20;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        // Simulate random error chance
                        const hasError = Math.random() > 0.8;
                        uploadEl.updateFileStatus(file, {
                            status: hasError ? 'error' : 'success',
                            progress: 100,
                            error: hasError ? 'Network failed' : undefined
                        });
                    } else {
                        uploadEl.updateFileStatus(file, {
                            progress
                        });
                    }
                }, 300);
            });
        };
        return b`
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
    }
};
const SlimVariant = {
    render: (args)=>b`
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
        .i18n=${{
            dropzoneText: 'Attach images (Max 5MB)'
        }}
      ></vi-upload>
    </div>
  `
};
const WithThumbnailsAndLimits = {
    args: {
        hideThumbnail: false
    },
    render: (args)=>b`
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
        .i18n=${{
            dropzoneText: 'Drop up to 3 images here'
        }}
      ></vi-upload>
    </div>
  `
};
const ErrorValidation = {
    render: ()=>b`
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
        .i18n=${{
            dropzoneText: 'Drop tiny PDFs here (< 50KB)'
        }}
      ></vi-upload>
    </div>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    name: 'file',\n    accept: 'image/*,.pdf',\n    multiple: true,\n    disabled: false,\n    hideThumbnail: false,\n    maxSize: 5000000,\n    maxFiles: 5\n  },\n  render: args => html`\n    <div style=\"max-width: 500px; font-family: sans-serif;\">\n      <vi-upload\n        name=${ifDefined(args.name)}\n        accept=${ifDefined(args.accept)}\n        ?multiple=${args.multiple}\n        ?disabled=${args.disabled}\n        ?hide-thumbnail=${args.hideThumbnail}\n        maxSize=${ifDefined(args.maxSize)}\n        maxFiles=${ifDefined(args.maxFiles)}\n      ></vi-upload>\n    </div>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
SingleFile.parameters = {
    ...SingleFile.parameters,
    docs: {
        ...SingleFile.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"max-width: 500px; font-family: sans-serif;\">\n      <p style=\"margin-top: 0; font-size: 14px; color: #666;\">\n        This upload component only accepts a single file. Selecting a new file\n        replaces the existing one.\n      </p>\n      <vi-upload accept=\".pdf\"></vi-upload>\n    </div>\n  `\n}",
            ...SingleFile.parameters?.docs?.source
        }
    }
};
CustomTextAndIcon.parameters = {
    ...CustomTextAndIcon.parameters,
    docs: {
        ...CustomTextAndIcon.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"max-width: 500px; font-family: sans-serif;\">\n      <vi-upload multiple>\n        <svg\n          slot=\"icon\"\n          viewBox=\"0 0 24 24\"\n          fill=\"none\"\n          stroke=\"currentColor\"\n          stroke-width=\"2\"\n          stroke-linecap=\"round\"\n          stroke-linejoin=\"round\"\n        >\n          <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect>\n          <circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"></circle>\n          <polyline points=\"21 15 16 10 5 21\"></polyline>\n        </svg>\n        <span slot=\"text\">Click to upload your favorite images</span>\n      </vi-upload>\n    </div>\n  `\n}",
            ...CustomTextAndIcon.parameters?.docs?.source
        }
    }
};
FormIntegration.parameters = {
    ...FormIntegration.parameters,
    docs: {
        ...FormIntegration.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div\n      style=\"font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; align-items: flex-start; max-width: 500px;\"\n    >\n      <p style=\"margin: 0; font-size: 14px; color: #666;\">\n        The upload component uses <code>ElementInternals</code> to seamlessly\n        integrate with native HTML forms. It automatically handles appending\n        files to <code>FormData</code>.\n      </p>\n      <form\n        style=\"padding: 24px; border: 1px solid #eee; border-radius: 8px; display: flex; flex-direction: column; gap: 24px; background: #fff; width: 100%; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);\"\n        @submit=${(e: Event) => {\n    e.preventDefault();\n    const fd = new FormData(e.target as HTMLFormElement);\n    const attachments = fd.getAll('attachments');\n    const fileNames = attachments.map(f => (f as File).name).join(', ');\n    alert('Form Submitted!\\\\n\\\\nNumber of files attached: ' + attachments.length + '\\\\nFilenames: ' + fileNames);\n  }}\n      >\n        <div style=\"display: flex; flex-direction: column; gap: 8px;\">\n          <label style=\"font-size: 14px; font-weight: 500;\"\n            >Attach relevant documents (Max 5MB)</label\n          >\n          <vi-upload name=\"attachments\" multiple maxSize=\"5000000\"></vi-upload>\n        </div>\n\n        <div style=\"display: flex; gap: 8px; justify-content: flex-end;\">\n          <button\n            type=\"reset\"\n            style=\"padding: 8px 16px; cursor: pointer; border: 1px solid #ccc; background: white; border-radius: 4px;\"\n          >\n            Reset Form\n          </button>\n          <button\n            type=\"submit\"\n            style=\"padding: 8px 16px; cursor: pointer; border: none; background: #0f62fe; color: white; border-radius: 4px; font-weight: bold;\"\n          >\n            Submit Form\n          </button>\n        </div>\n      </form>\n    </div>\n  `\n}",
            ...FormIntegration.parameters?.docs?.source
        }
    }
};
ControlledUpload.parameters = {
    ...ControlledUpload.parameters,
    docs: {
        ...ControlledUpload.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => {\n    const handleUploadChange = (e: Event) => {\n      const uploadEl = e.target as any;\n      const files = (e as CustomEvent).detail as File[];\n\n      // Simulate an async upload for each file\n      files.forEach(file => {\n        uploadEl.updateFileStatus(file, {\n          status: 'uploading',\n          progress: 0\n        });\n        let progress = 0;\n        const interval = setInterval(() => {\n          progress += Math.random() * 20;\n          if (progress >= 100) {\n            progress = 100;\n            clearInterval(interval);\n            // Simulate random error chance\n            const hasError = Math.random() > 0.8;\n            uploadEl.updateFileStatus(file, {\n              status: hasError ? 'error' : 'success',\n              progress: 100,\n              error: hasError ? 'Network failed' : undefined\n            });\n          } else {\n            uploadEl.updateFileStatus(file, {\n              progress\n            });\n          }\n        }, 300);\n      });\n    };\n    return html`\n      <div\n        style=\"font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; max-width: 500px;\"\n      >\n        <p style=\"margin: 0; font-size: 14px; color: #666;\">\n          This dropzone acts as a \"Controlled Component\". When you drop files,\n          the parent application listens to the event and manually updates the\n          progress bars via the <code>updateFileStatus()</code> API.\n        </p>\n        <vi-upload multiple @vi-upload-change=${handleUploadChange}></vi-upload>\n      </div>\n    `;\n  }\n}",
            ...ControlledUpload.parameters?.docs?.source
        }
    }
};
SlimVariant.parameters = {
    ...SlimVariant.parameters,
    docs: {
        ...SlimVariant.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <div\n      style=\"font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; max-width: 500px;\"\n    >\n      <p style=\"margin: 0; font-size: 14px; color: #666;\">\n        The <code>size=\"sm\"</code> variant creates an inline, compact dropzone\n        that occupies less vertical space. It aligns the icon and text\n        horizontally.\n      </p>\n      <vi-upload\n        size=\"sm\"\n        multiple\n        accept=\"image/*\"\n        ?hide-thumbnail=${args?.hideThumbnail}\n        .i18n=${{\n    dropzoneText: 'Attach images (Max 5MB)'\n  }}\n      ></vi-upload>\n    </div>\n  `\n}",
            ...SlimVariant.parameters?.docs?.source
        }
    }
};
WithThumbnailsAndLimits.parameters = {
    ...WithThumbnailsAndLimits.parameters,
    docs: {
        ...WithThumbnailsAndLimits.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    hideThumbnail: false\n  },\n  render: args => html`\n    <div\n      style=\"font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; max-width: 500px;\"\n    >\n      <p style=\"margin: 0; font-size: 14px; color: #666;\">\n        Images will display beautiful thumbnail previews. Also, try dropping\n        more than 3 files to see the <code>maxFiles</code> constraint in action!\n      </p>\n      <vi-upload\n        multiple\n        maxFiles=\"3\"\n        accept=\"image/*\"\n        ?hide-thumbnail=${args?.hideThumbnail}\n        .i18n=${{\n    dropzoneText: 'Drop up to 3 images here'\n  }}\n      ></vi-upload>\n    </div>\n  `\n}",
            ...WithThumbnailsAndLimits.parameters?.docs?.source
        }
    }
};
ErrorValidation.parameters = {
    ...ErrorValidation.parameters,
    docs: {
        ...ErrorValidation.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div\n      style=\"font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; max-width: 500px;\"\n    >\n      <p style=\"margin: 0; font-size: 14px; color: #666;\">\n        This instance only accepts <code>.pdf</code> and has a ridiculously\n        small <code>maxSize</code> of 50KB to demonstrate built-in error states.\n      </p>\n      <vi-upload\n        multiple\n        maxSize=\"50000\"\n        accept=\".pdf\"\n        .i18n=${{\n    dropzoneText: 'Drop tiny PDFs here (< 50KB)'\n  }}\n      ></vi-upload>\n    </div>\n  `\n}",
            ...ErrorValidation.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","SingleFile","CustomTextAndIcon","FormIntegration","ControlledUpload","SlimVariant","WithThumbnailsAndLimits","ErrorValidation"];

export { ControlledUpload, CustomTextAndIcon, Default, ErrorValidation, FormIntegration, SingleFile, SlimVariant, WithThumbnailsAndLimits, __namedExportsOrder, meta as default };
