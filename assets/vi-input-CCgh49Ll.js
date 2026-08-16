import { r, i, b } from './iframe-DnETEnWs.js';
import { V as ViElement, t, n } from './vi-element-BZnLtp_v.js';
import { F as FocusableMixin } from './focusable-mixin-CmxOyPX5.js';
import { V as ValidityMixin } from './validity-mixin-DhtnJ9lw.js';
import { i as ifNonEmpty } from './if-non-empty-Bj_AeigV.js';

const inputStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.input-field{display:flex;flex-direction:column;gap:var(--vi-input-spacing-field-gap, var(--vi-spacing-xs, 8px));width:100%}.input-control{appearance:none;-webkit-appearance:none;display:block;width:100%;box-sizing:border-box;min-height:var(--vi-input-sizing-min-height, 40px);border:var(--vi-border-width-thin, 1px) solid var(--vi-input-border-color, var(--vi-outline, #e5e7eb));border-radius:var(--vi-input-shape-border-radius, var(--vi-border-radius-lg, 8px));padding:var(--vi-input-spacing-padding-block, var(--vi-spacing-xs, 8px)) var(--vi-input-spacing-padding-inline, var(--vi-spacing-sm, 16px));font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-input-typography-font-size, var(--vi-font-size-base, 16px));font-weight:var(--vi-font-weight-normal, 400);line-height:var(--vi-input-typography-line-height, var(--vi-line-height-normal, 1.5));color:var(--vi-input-text-color, var(--vi-text-primary, #111827));background-color:var(--vi-input-background-color, var(--vi-color-background, #ffffff));transition:border-color .15s ease,box-shadow .15s ease}.input-control:hover:not(:focus-visible){border-color:var(--vi-input-border-color-hover, var(--vi-text-secondary, #4b5563))}.input-control:focus-visible,.input-control:focus{outline:var(--vi-border-width-base, 2px) solid var(--vi-input-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:0;box-shadow:0 0 0 3px var(--vi-input-focus-ring-glow, var(--vi-color-blue-200, #cee6ff))}.input-control::placeholder{color:var(--vi-input-placeholder-color, var(--vi-text-secondary, #4b5563))}.input-helper{font-size:var(--vi-input-helper-size, var(--vi-font-size-xs, 12px));line-height:var(--vi-input-helper-leading, var(--vi-line-height-normal, 1.5));color:var(--vi-input-helper-color, var(--vi-text-helper, #9e9e9e))}.input-error{font-size:var(--vi-input-error-size, var(--vi-font-size-xs, 12px));line-height:var(--vi-input-error-leading, var(--vi-line-height-normal, 1.5));color:var(--vi-input-error-color, var(--vi-color-error, #ef4444))}@media(prefers-reduced-motion:reduce){.input-control{transition:none}}}:host{display:block;outline:none}:host([disabled]){opacity:.6;cursor:not-allowed;pointer-events:none}:host([status=invalid]){--vi-input-border-color: var(--vi-color-error, #ef4444);--vi-input-border-color-hover: var(--vi-color-error, #ef4444);--vi-input-focus-ring-color: var(--vi-color-error, #ef4444);--vi-input-focus-ring-glow: var(--vi-color-red-100, #ffccce);--vi-input-label-color: var(--vi-color-error, #ef4444)}:host([status=valid]){--vi-input-border-color: var(--vi-color-success, #489167);--vi-input-border-color-hover: var(--vi-color-success, #489167);--vi-input-focus-ring-color: var(--vi-color-success, #489167);--vi-input-focus-ring-glow: var(--vi-color-green-100, #e6f0eb)}.input-validation{font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-font-size-xs, 12px);line-height:var(--vi-line-height-normal, 1.5);letter-spacing:var(--vi-letter-spacing-wider, .05em);color:var(--vi-input-helper-color, var(--vi-text-helper, #9e9e9e))}.input-validation--invalid{color:var(--vi-input-error-color, var(--vi-color-error, #ef4444))}.input-validation--valid{color:var(--vi-input-success-color, var(--vi-color-success, #489167))}::slotted([slot=helper]){font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-font-size-xs, 12px);line-height:var(--vi-line-height-normal, 1.5);letter-spacing:var(--vi-letter-spacing-wider, .05em);color:var(--vi-input-helper-color, var(--vi-text-helper, #9e9e9e))}:host([size=xs]){--vi-input-spacing-padding-block: 2px;--vi-input-spacing-padding-inline: 8px;--vi-input-typography-font-size: var(--vi-font-size-xs, 12px)}:host([size=sm]){--vi-input-spacing-padding-block: 4px;--vi-input-spacing-padding-inline: 12px;--vi-input-typography-font-size: var(--vi-font-size-sm, 14px)}:host([size=lg]){--vi-input-spacing-padding-block: 12px;--vi-input-spacing-padding-inline: 20px;--vi-input-typography-font-size: var(--vi-font-size-lg, 18px)}";

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
var _dec, _initClass, _ValidityMixin, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _init_status, _init_required, _init_validityMessage, /** Input type. Controls the keyboard/picker on mobile and browser validation hints. */ _init_type, /** Native input placeholder text. */ _init_placeholder, /** Form field name. Submitted with the form when set. */ _init_name, /** Current value. Synced to ElementInternals for form participation. */ _init_value, /** When true, disables the input and removes it from the tab order. */ _init_disabled, /** Size scale — controls padding and font-size. */ _init_size, /** When true, the value cannot be edited but is still submitted. */ _init_readonly, /** The accessibility label. */ _init_ariaLabel, /** Reference to an element id containing the label. */ _init_ariaLabelledby, _initProto;
let _ViInput;
_dec = t('vi-input'), _dec1 = n({
    reflect: true
}), _dec2 = n({
    type: Boolean,
    reflect: true
}), _dec3 = n(), _dec4 = n({
    type: String,
    reflect: true
}), _dec5 = n(), _dec6 = n(), _dec7 = n(), _dec8 = n({
    type: Boolean,
    reflect: true
}), _dec9 = n({
    type: String,
    reflect: true
}), _dec10 = n({
    type: Boolean,
    reflect: true
}), _dec11 = n({
    attribute: 'aria-label'
}), _dec12 = n({
    attribute: 'aria-labelledby'
});
new class extends _identity {
    constructor(){
        super(_ViInput), _initClass();
    }
    static{
        class ViInput extends (_ValidityMixin = ValidityMixin(FocusableMixin(ViElement))) {
            static{
                ({ e: [_init_status, _init_required, _init_validityMessage, _init_type, _init_placeholder, _init_name, _init_value, _init_disabled, _init_size, _init_readonly, _init_ariaLabel, _init_ariaLabelledby, _initProto], c: [_ViInput, _initClass] } = _apply_decs_2203_r(this, [
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
                        "type"
                    ],
                    [
                        _dec5,
                        1,
                        "placeholder"
                    ],
                    [
                        _dec6,
                        1,
                        "name"
                    ],
                    [
                        _dec7,
                        1,
                        "value"
                    ],
                    [
                        _dec8,
                        1,
                        "disabled"
                    ],
                    [
                        _dec9,
                        1,
                        "size"
                    ],
                    [
                        _dec10,
                        1,
                        "readonly"
                    ],
                    [
                        _dec11,
                        1,
                        "ariaLabel"
                    ],
                    [
                        _dec12,
                        1,
                        "ariaLabelledby"
                    ]
                ], [
                    _dec
                ], _ValidityMixin));
            }
            static styles = i`
    ${r(inputStyles)}
  `;
            get _focusableElement() {
                return this.shadowRoot?.querySelector('input') ?? null;
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
            #___private_type_4 = _init_type(this, 'text');
            get type() {
                return this.#___private_type_4;
            }
            set type(_v) {
                this.#___private_type_4 = _v;
            }
            #___private_placeholder_5 = _init_placeholder(this, '');
            get placeholder() {
                return this.#___private_placeholder_5;
            }
            set placeholder(_v) {
                this.#___private_placeholder_5 = _v;
            }
            #___private_name_6 = _init_name(this, '');
            get name() {
                return this.#___private_name_6;
            }
            set name(_v) {
                this.#___private_name_6 = _v;
            }
            #___private_value_7 = _init_value(this, '');
            get value() {
                return this.#___private_value_7;
            }
            set value(_v) {
                this.#___private_value_7 = _v;
            }
            #___private_disabled_8 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_8;
            }
            set disabled(_v) {
                this.#___private_disabled_8 = _v;
            }
            #___private_size_9 = _init_size(this, 'md');
            get size() {
                return this.#___private_size_9;
            }
            set size(_v) {
                this.#___private_size_9 = _v;
            }
            #___private_readonly_10 = _init_readonly(this, false);
            get readonly() {
                return this.#___private_readonly_10;
            }
            set readonly(_v) {
                this.#___private_readonly_10 = _v;
            }
            #___private_ariaLabel_11 = _init_ariaLabel(this, '');
            get ariaLabel() {
                return this.#___private_ariaLabel_11;
            }
            set ariaLabel(_v) {
                this.#___private_ariaLabel_11 = _v;
            }
            #___private_ariaLabelledby_12 = _init_ariaLabelledby(this, '');
            get ariaLabelledby() {
                return this.#___private_ariaLabelledby_12;
            }
            set ariaLabelledby(_v) {
                this.#___private_ariaLabelledby_12 = _v;
            }
            // ── ValidityMixin hook ─────────────────────────────────────────────────────
            // _testValidity is declared protected in ValidityInterface, but TypeScript's
            // mixin intersection type does not always surface protected members for
            // `override` checking. The method is still an override at runtime.
            _testValidity() {
                if (this._internals.validity.customError) {
                    return {
                        customError: true
                    };
                }
                const input = this._focusableElement;
                if (input) {
                    if (input.value !== this.value) {
                        input.value = this.value;
                    }
                    const validity = input.validity;
                    if (!validity.valid) {
                        this.validityMessage = input.validationMessage;
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
                    const temp = document.createElement('input');
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
            /** Resets value and validation state when the associated form resets. */ formResetCallback() {
                this.value = this.getAttribute('value') ?? '';
                this.status = 'default';
                this.validityMessage = '';
            }
            /** Keeps disabled in sync when a containing fieldset or form is disabled. */ formDisabledCallback(disabled) {
                this.disabled = disabled;
            }
            // ── Event handlers ─────────────────────────────────────────────────────────
            _onInput(e) {
                e.stopPropagation();
                const input = e.target;
                this.value = input.value;
                this.dispatchEvent(new CustomEvent('vi-input-input', {
                    detail: {
                        value: this.value
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            _onChange(e) {
                e.stopPropagation();
                const input = e.target;
                this.value = input.value;
                this.dispatchEvent(new CustomEvent('vi-input-change', {
                    detail: {
                        value: this.value
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            // ── Render ─────────────────────────────────────────────────────────────────
            get _helperContent() {
                return b`<span id="helper-text" class="input-helper" part="helper"
      ><slot name="helper"></slot
    ></span>`;
            }
            get _validationMessage() {
                if (!this.validityMessage) return b``;
                const cls = this.status === 'invalid' ? 'input-validation--invalid' : this.status === 'valid' ? 'input-validation--valid' : '';
                return b`<span
      id="validation-message"
      class="input-validation ${cls}"
      part="validation"
      role="alert"
      aria-live="polite"
      >${this.validityMessage}</span
    >`;
            }
            render() {
                const { type, placeholder, name, value, disabled, required, readonly } = this;
                return b`
      <div class="input-field" part="field">
        <input
          class="input-control"
          part="input"
          tabindex="0"
          type=${type}
          .value=${value}
          ?disabled=${disabled}
          ?readonly=${readonly}
          ?required=${required}
          aria-required=${ifNonEmpty(required ? 'true' : '')}
          aria-invalid=${this.status === 'invalid' ? 'true' : 'false'}
          aria-label=${ifNonEmpty(this.ariaLabel)}
          aria-labelledby=${ifNonEmpty(this.ariaLabelledby)}
          aria-describedby=${this.validityMessage ? 'helper-text validation-message' : 'helper-text'}
          aria-errormessage=${ifNonEmpty(this.status === 'invalid' && this.validityMessage ? 'validation-message' : '')}
          placeholder=${ifNonEmpty(placeholder)}
          name=${ifNonEmpty(name)}
          @input=${this._onInput}
          @change=${this._onChange}
        />
        ${this._helperContent} ${this._validationMessage}
      </div>
    `;
            }
        }
    }
}();
