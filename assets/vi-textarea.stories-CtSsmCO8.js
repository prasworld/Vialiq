import { r, i, b, A } from './iframe-DPjVeIYZ.js';
import { V as ViElement, t, n } from './vi-element-CFl5z9YB.js';
import { F as FocusableMixin } from './focusable-mixin-CmxOyPX5.js';
import { V as ValidityMixin } from './validity-mixin-CVzyI8PI.js';
import { i as ifNonEmpty } from './if-non-empty-DqUW0tnw.js';
import './preload-helper-D5QYaGzd.js';
import './if-defined-92Chhblw.js';

const textareaStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.input-field{display:flex;flex-direction:column;gap:var(--vi-input-spacing-field-gap, var(--vi-spacing-xs, 8px));width:100%}.input-control{appearance:none;-webkit-appearance:none;display:block;width:100%;box-sizing:border-box;min-height:var(--vi-input-sizing-min-height, 40px);border:var(--vi-border-width-thin, 1px) solid var(--vi-input-border-color, var(--vi-outline, #e5e7eb));border-radius:var(--vi-input-shape-border-radius, var(--vi-border-radius-lg, 8px));padding:var(--vi-input-spacing-padding-block, var(--vi-spacing-xs, 8px)) var(--vi-input-spacing-padding-inline, var(--vi-spacing-sm, 16px));font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-input-typography-font-size, var(--vi-font-size-base, 16px));font-weight:var(--vi-font-weight-normal, 400);line-height:var(--vi-input-typography-line-height, var(--vi-line-height-normal, 1.5));color:var(--vi-input-text-color, var(--vi-text-primary, #111827));background-color:var(--vi-input-background-color, var(--vi-color-background, #ffffff));transition:border-color .15s ease,box-shadow .15s ease}.input-control:hover:not(:focus-visible){border-color:var(--vi-input-border-color-hover, var(--vi-text-secondary, #4b5563))}.input-control:focus-visible,.input-control:focus{outline:var(--vi-border-width-base, 2px) solid var(--vi-input-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:0;box-shadow:0 0 0 3px var(--vi-input-focus-ring-glow, var(--vi-color-blue-200, #cee6ff))}.input-control::placeholder{color:var(--vi-input-placeholder-color, var(--vi-text-secondary, #4b5563))}.input-control:disabled{cursor:not-allowed;background-color:var(--vi-input-bg-disabled, var(--vi-layer-disabled, #f3f4f6));color:var(--vi-input-text-disabled, var(--vi-text-disabled, #9e9e9e));border-color:var(--vi-input-border-disabled, var(--vi-border-02, #eeeeee))}.input-helper{font-size:var(--vi-input-helper-size, var(--vi-font-size-xs, 12px));line-height:var(--vi-input-helper-leading, var(--vi-line-height-normal, 1.5));color:var(--vi-input-helper-color, var(--vi-text-helper, #9e9e9e))}.input-error{font-size:var(--vi-input-error-size, var(--vi-font-size-xs, 12px));line-height:var(--vi-input-error-leading, var(--vi-line-height-normal, 1.5));color:var(--vi-input-error-color, var(--vi-color-error, #ef4444))}@media(prefers-reduced-motion:reduce){.input-control{transition:none}}}:host{display:block;outline:none}:host([disabled]){cursor:not-allowed}:host([status=invalid]){--vi-input-border-color: var(--vi-color-error, #ef4444);--vi-input-border-color-hover: var(--vi-color-error, #ef4444);--vi-input-focus-ring-color: var(--vi-color-error, #ef4444);--vi-input-focus-ring-glow: var(--vi-color-red-100, #ffccce);--vi-input-label-color: var(--vi-color-error, #ef4444)}:host([status=valid]){--vi-input-border-color: var(--vi-color-success, #489167);--vi-input-border-color-hover: var(--vi-color-success, #489167);--vi-input-focus-ring-color: var(--vi-color-success, #489167);--vi-input-focus-ring-glow: var(--vi-color-green-100, #e6f0eb)}:host([resize=none]){--vi-textarea-resize: none}:host([resize=both]){--vi-textarea-resize: both}:host([resize=vertical]){--vi-textarea-resize: vertical}.input-control{resize:var(--vi-textarea-resize, vertical);min-height:var(--vi-textarea-min-height, 96px);max-height:var(--vi-textarea-max-height, none);height:auto;overflow-y:auto}.input-validation{font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-font-size-xs, 12px);line-height:var(--vi-line-height-normal, 1.5);letter-spacing:var(--vi-letter-spacing-wider, .05em);color:var(--vi-input-helper-color, var(--vi-text-helper, #9e9e9e))}.input-validation--invalid{color:var(--vi-input-error-color, var(--vi-color-error, #ef4444))}.input-validation--valid{color:var(--vi-input-success-color, var(--vi-color-success, #489167))}::slotted([slot=helper]){font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-font-size-xs, 12px);line-height:var(--vi-line-height-normal, 1.5);letter-spacing:var(--vi-letter-spacing-wider, .05em);color:var(--vi-input-helper-color, var(--vi-text-helper, #9e9e9e))}.char-counter{display:block;font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-textarea-char-counter-font-size, var(--vi-font-size-xs, 12px));text-align:right;margin-top:var(--vi-textarea-char-counter-margin-top, 4px);color:var(--vi-textarea-char-counter-color, var(--vi-text-helper, #9e9e9e))}.char-counter.char-counter--warning{color:var(--vi-textarea-char-counter-warning-color, var(--vi-color-warning, #ffba00))}.char-counter.char-counter--error{color:var(--vi-textarea-char-counter-error-color, var(--vi-color-error, #ef4444))}";

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
var _dec, _initClass, _ValidityMixin, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _init_status, _init_required, _init_validityMessage, /** Native textarea placeholder text. */ _init_placeholder, /** Form field name. Submitted with form data when set. */ _init_name, /** Current text value. */ _init_value, /** Initial visible lines of text. */ _init_rows, /** Maximum character length. */ _init_maxlength, /** Controls textarea resize handle orientation. */ _init_resize, /** When true, disables the textarea and removes it from the tab order. */ _init_disabled, /** When true, the value cannot be modified by the user. */ _init_readonly, /** Enables displaying a character counter (requires maxlength to be set). */ _init_charCount, /** The accessibility label. */ _init_ariaLabel, /** Reference to an element ID containing the label. */ _init_ariaLabelledby, _initProto;
let _ViTextarea;
_dec = t('vi-textarea'), _dec1 = n({
    reflect: true
}), _dec2 = n({
    type: Boolean,
    reflect: true
}), _dec3 = n({
    attribute: 'validity-message'
}), _dec4 = n(), _dec5 = n(), _dec6 = n(), _dec7 = n({
    type: Number
}), _dec8 = n({
    type: Number
}), _dec9 = n({
    reflect: true
}), _dec10 = n({
    type: Boolean,
    reflect: true
}), _dec11 = n({
    type: Boolean,
    reflect: true
}), _dec12 = n({
    type: Boolean,
    attribute: 'char-count'
}), _dec13 = n({
    attribute: 'aria-label'
}), _dec14 = n({
    attribute: 'aria-labelledby'
});
new class extends _identity {
    constructor(){
        super(_ViTextarea), _initClass();
    }
    static{
        class ViTextarea extends (_ValidityMixin = ValidityMixin(FocusableMixin(ViElement))) {
            static{
                ({ e: [_init_status, _init_required, _init_validityMessage, _init_placeholder, _init_name, _init_value, _init_rows, _init_maxlength, _init_resize, _init_disabled, _init_readonly, _init_charCount, _init_ariaLabel, _init_ariaLabelledby, _initProto], c: [_ViTextarea, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "status"
                    ],
                    [
                        _dec2,
                        1,
                        "required"
                    ],
                    [
                        _dec3,
                        1,
                        "validityMessage"
                    ],
                    [
                        _dec4,
                        1,
                        "placeholder"
                    ],
                    [
                        _dec5,
                        1,
                        "name"
                    ],
                    [
                        _dec6,
                        1,
                        "value"
                    ],
                    [
                        _dec7,
                        1,
                        "rows"
                    ],
                    [
                        _dec8,
                        1,
                        "maxlength"
                    ],
                    [
                        _dec9,
                        1,
                        "resize"
                    ],
                    [
                        _dec10,
                        1,
                        "disabled"
                    ],
                    [
                        _dec11,
                        1,
                        "readonly"
                    ],
                    [
                        _dec12,
                        1,
                        "charCount"
                    ],
                    [
                        _dec13,
                        1,
                        "ariaLabel"
                    ],
                    [
                        _dec14,
                        1,
                        "ariaLabelledby"
                    ]
                ], [
                    _dec
                ], _ValidityMixin));
            }
            static styles = i`
    ${r(textareaStyles)}
  `;
            get _focusableElement() {
                return this.shadowRoot?.querySelector('textarea') ?? null;
            }
            #___private_status_1 = (_initProto(this), _init_status(this, 'default'));
            get status() {
                return this.#___private_status_1;
            }
            set status(_v) {
                this.#___private_status_1 = _v;
            }
            #___private_required_2 = _init_required(this, false);
            get required() {
                return this.#___private_required_2;
            }
            set required(_v) {
                this.#___private_required_2 = _v;
            }
            #___private_validityMessage_3 = _init_validityMessage(this, '');
            get validityMessage() {
                return this.#___private_validityMessage_3;
            }
            set validityMessage(_v) {
                this.#___private_validityMessage_3 = _v;
            }
            #___private_placeholder_4 = _init_placeholder(this, '');
            get placeholder() {
                return this.#___private_placeholder_4;
            }
            set placeholder(_v) {
                this.#___private_placeholder_4 = _v;
            }
            #___private_name_5 = _init_name(this, '');
            get name() {
                return this.#___private_name_5;
            }
            set name(_v) {
                this.#___private_name_5 = _v;
            }
            #___private_value_6 = _init_value(this, '');
            get value() {
                return this.#___private_value_6;
            }
            set value(_v) {
                this.#___private_value_6 = _v;
            }
            #___private_rows_7 = _init_rows(this, 3);
            get rows() {
                return this.#___private_rows_7;
            }
            set rows(_v) {
                this.#___private_rows_7 = _v;
            }
            #___private_maxlength_8 = _init_maxlength(this, null);
            get maxlength() {
                return this.#___private_maxlength_8;
            }
            set maxlength(_v) {
                this.#___private_maxlength_8 = _v;
            }
            #___private_resize_9 = _init_resize(this, 'vertical');
            get resize() {
                return this.#___private_resize_9;
            }
            set resize(_v) {
                this.#___private_resize_9 = _v;
            }
            #___private_disabled_10 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_10;
            }
            set disabled(_v) {
                this.#___private_disabled_10 = _v;
            }
            #___private_readonly_11 = _init_readonly(this, false);
            get readonly() {
                return this.#___private_readonly_11;
            }
            set readonly(_v) {
                this.#___private_readonly_11 = _v;
            }
            #___private_charCount_12 = _init_charCount(this, false);
            get charCount() {
                return this.#___private_charCount_12;
            }
            set charCount(_v) {
                this.#___private_charCount_12 = _v;
            }
            #___private_ariaLabel_13 = _init_ariaLabel(this, '');
            get ariaLabel() {
                return this.#___private_ariaLabel_13;
            }
            set ariaLabel(_v) {
                this.#___private_ariaLabel_13 = _v;
            }
            #___private_ariaLabelledby_14 = _init_ariaLabelledby(this, '');
            get ariaLabelledby() {
                return this.#___private_ariaLabelledby_14;
            }
            set ariaLabelledby(_v) {
                this.#___private_ariaLabelledby_14 = _v;
            }
            // ── ValidityMixin implementation ───────────────────────────────────────────
            _testValidity() {
                if (this._internals.validity.customError) {
                    return {
                        customError: true
                    };
                }
                const textarea = this._focusableElement;
                if (textarea) {
                    if (textarea.value !== this.value) {
                        textarea.value = this.value;
                    }
                    const validity = textarea.validity;
                    if (!validity.valid) {
                        this.validityMessage = textarea.validationMessage;
                        return {
                            badInput: validity.badInput,
                            customError: validity.customError,
                            patternMismatch: validity.patternMismatch,
                            rangeOverflow: validity.rangeOverflow,
                            rangeUnderflow: validity.rangeUnderflow,
                            stepMismatch: validity.stepMismatch,
                            tooLong: validity.tooLong,
                            tooShort: validity.tooShort,
                            typeMismatch: validity.typeMismatch,
                            valueMissing: validity.valueMissing
                        };
                    }
                } else if (this.required && !this.value) {
                    const temp = document.createElement('textarea');
                    temp.required = true;
                    this.validityMessage = temp.validationMessage;
                    return {
                        valueMissing: true
                    };
                }
                return {};
            }
            // ── Lifecycle ──────────────────────────────────────────────────────────────
            updated(changed) {
                super.updated(changed);
                if (changed.has('value')) {
                    this._internals.setFormValue(this.value);
                }
                if (changed.has('disabled')) {
                    this._setHostFocusable(!this.disabled);
                }
            }
            /** Resets value and validation state when the parent form resets. */ formResetCallback() {
                this.value = this.getAttribute('value') ?? '';
                this.status = 'default';
                this.validityMessage = '';
            }
            /** Keeps disabled in sync when containing fieldset/form state changes. */ formDisabledCallback(disabled) {
                this.disabled = disabled;
            }
            // ── Event Handlers ─────────────────────────────────────────────────────────
            _onInput(e) {
                e.stopPropagation();
                const textarea = e.target;
                this.value = textarea.value;
                this.dispatchEvent(new CustomEvent('vi-textarea-input', {
                    detail: {
                        value: this.value
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            _onChange(e) {
                e.stopPropagation();
                const textarea = e.target;
                this.value = textarea.value;
                this.dispatchEvent(new CustomEvent('vi-textarea-change', {
                    detail: {
                        value: this.value
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            // ── Render ─────────────────────────────────────────────────────────────────
            get _helperContent() {
                return b`
      <span id="helper-text" class="input-helper" part="helper">
        <slot name="helper"></slot>
      </span>
    `;
            }
            get _validationMessage() {
                if (!this.validityMessage) return b``;
                const cls = this.status === 'invalid' ? 'input-validation--invalid' : this.status === 'valid' ? 'input-validation--valid' : '';
                return b`
      <span
        id="validation-message"
        class="input-validation ${cls}"
        part="validation"
        role="alert"
        aria-live="polite"
      >
        ${this.validityMessage}
      </span>
    `;
            }
            get _charCounter() {
                if (!this.charCount || this.maxlength == null || this.maxlength < 0) return b``;
                const length = this.value.length;
                const limit = this.maxlength;
                const ratio = length / limit;
                const stateClass = ratio >= 1 ? 'char-counter--error' : ratio >= 0.9 ? 'char-counter--warning' : '';
                return b`
      <span
        id="char-counter"
        class="char-counter ${stateClass}"
        part="char-counter"
      >
        ${length} / ${limit}
      </span>
    `;
            }
            render() {
                const { placeholder, name, value, disabled, required, readonly, rows, maxlength } = this;
                const hasCharCounter = this.charCount && maxlength != null && maxlength >= 0;
                const describedBy = [
                    'helper-text',
                    this.validityMessage ? 'validation-message' : '',
                    hasCharCounter ? 'char-counter' : ''
                ].filter(Boolean).join(' ');
                return b`
      <div class="input-field" part="field">
        <textarea
          class="input-control"
          part="textarea"
          tabindex="0"
          .value=${value}
          ?disabled=${disabled}
          ?readonly=${readonly}
          ?required=${required}
          rows=${rows}
          maxlength=${maxlength !== null && maxlength >= 0 ? maxlength : A}
          aria-required=${required ? 'true' : 'false'}
          aria-invalid=${this.status === 'invalid' ? 'true' : 'false'}
          aria-label=${ifNonEmpty(this.ariaLabel)}
          aria-labelledby=${ifNonEmpty(this.ariaLabelledby)}
          aria-describedby=${describedBy}
          aria-errormessage=${ifNonEmpty(this.status === 'invalid' && this.validityMessage ? 'validation-message' : '')}
          placeholder=${ifNonEmpty(placeholder)}
          name=${ifNonEmpty(name)}
          @input=${this._onInput}
          @change=${this._onChange}
        ></textarea>
        ${this._helperContent} ${this._validationMessage} ${this._charCounter}
      </div>
    `;
            }
        }
    }
}();

const meta = {
    title: 'Components/Textarea',
    tags: [
        'autodocs'
    ],
    argTypes: {
        placeholder: {
            control: 'text',
            description: 'Placeholder text'
        },
        value: {
            control: 'text',
            description: 'Current text value'
        },
        rows: {
            control: 'number',
            description: 'Initial visible rows'
        },
        maxlength: {
            control: 'number',
            description: 'Maximum characters allowed'
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the textarea'
        },
        required: {
            control: 'boolean',
            description: 'Marks field as required'
        },
        readonly: {
            control: 'boolean',
            description: 'Marks input as read-only'
        },
        resize: {
            control: 'select',
            options: [
                'none',
                'vertical',
                'both'
            ],
            description: 'Resize orientation axis'
        },
        status: {
            control: 'select',
            options: [
                'default',
                'valid',
                'invalid'
            ],
            description: 'Validation state'
        },
        validityMessage: {
            control: 'text',
            description: 'Validation message shown below input'
        },
        charCount: {
            control: 'boolean',
            description: 'Show character counter (requires maxlength)'
        }
    }
};
const renderTextarea = ({ placeholder, value, rows, maxlength, disabled, required, readonly, resize, status, validityMessage, charCount })=>b`
  <vi-textarea
    placeholder=${placeholder}
    .value=${value}
    .rows=${rows}
    .maxlength=${maxlength}
    ?disabled=${disabled}
    ?required=${required}
    ?readonly=${readonly}
    resize=${resize}
    status=${status}
    validity-message=${validityMessage}
    ?char-count=${charCount}
  >
    <span slot="helper">Please enter detailed notes</span>
  </vi-textarea>
`;
const Default = {
    name: 'Default Textarea',
    args: {
        placeholder: 'Enter notes here…',
        value: '',
        rows: 3,
        maxlength: null,
        disabled: false,
        required: false,
        readonly: false,
        resize: 'vertical',
        status: 'default',
        validityMessage: '',
        charCount: false
    },
    render: renderTextarea
};
const CharacterCounter = {
    name: 'With Character Counter',
    args: {
        placeholder: 'Limit to 100 characters…',
        value: 'Some default text',
        rows: 4,
        maxlength: 100,
        disabled: false,
        required: false,
        readonly: false,
        resize: 'vertical',
        status: 'default',
        validityMessage: '',
        charCount: true
    },
    render: renderTextarea
};
const ValidationInvalid = {
    name: 'Invalid Validation State',
    args: {
        placeholder: 'Required field…',
        value: '',
        rows: 3,
        maxlength: null,
        disabled: false,
        required: true,
        readonly: false,
        resize: 'vertical',
        status: 'invalid',
        validityMessage: 'Explanation text is required.',
        charCount: false
    },
    render: renderTextarea
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Default Textarea',\n  args: {\n    placeholder: 'Enter notes here\u2026',\n    value: '',\n    rows: 3,\n    maxlength: null,\n    disabled: false,\n    required: false,\n    readonly: false,\n    resize: 'vertical',\n    status: 'default',\n    validityMessage: '',\n    charCount: false\n  },\n  render: renderTextarea\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
CharacterCounter.parameters = {
    ...CharacterCounter.parameters,
    docs: {
        ...CharacterCounter.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'With Character Counter',\n  args: {\n    placeholder: 'Limit to 100 characters\u2026',\n    value: 'Some default text',\n    rows: 4,\n    maxlength: 100,\n    disabled: false,\n    required: false,\n    readonly: false,\n    resize: 'vertical',\n    status: 'default',\n    validityMessage: '',\n    charCount: true\n  },\n  render: renderTextarea\n}",
            ...CharacterCounter.parameters?.docs?.source
        }
    }
};
ValidationInvalid.parameters = {
    ...ValidationInvalid.parameters,
    docs: {
        ...ValidationInvalid.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Invalid Validation State',\n  args: {\n    placeholder: 'Required field\u2026',\n    value: '',\n    rows: 3,\n    maxlength: null,\n    disabled: false,\n    required: true,\n    readonly: false,\n    resize: 'vertical',\n    status: 'invalid',\n    validityMessage: 'Explanation text is required.',\n    charCount: false\n  },\n  render: renderTextarea\n}",
            ...ValidationInvalid.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","CharacterCounter","ValidationInvalid"];

export { CharacterCounter, Default, ValidationInvalid, __namedExportsOrder, meta as default };
