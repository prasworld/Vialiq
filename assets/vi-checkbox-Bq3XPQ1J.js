import { r, i, b } from './iframe-DLZvjPtb.js';
import { V as ViElement, t, n } from './vi-element-Dvl4DFHz.js';
import { F as FocusableMixin } from './focusable-mixin-CmxOyPX5.js';
import { V as ValidityMixin } from './validity-mixin-CIusymNJ.js';
import { e } from './class-map-D6lDJLIq.js';

const checkboxStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.checkbox-wrapper{display:inline-flex;align-items:flex-start;gap:var(--vi-checkbox-label-gap, 8px);cursor:pointer;font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-checkbox-label-font-size, var(--vi-font-size-base, 16px));line-height:var(--vi-line-height-normal, 1.5);color:var(--vi-checkbox-label-color, var(--vi-text-primary, #111827));position:relative;-webkit-user-select:none;user-select:none;align-items:center}.checkbox-input{position:absolute!important;clip-path:inset(50%)!important;overflow:hidden!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;border:0!important;white-space:nowrap!important}.checkbox-box{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;width:var(--vi-checkbox-size, 18px);height:var(--vi-checkbox-size, 18px);border:var(--vi-border-width-base, 2px) solid var(--vi-checkbox-border-color, var(--vi-outline, #e5e7eb));border-radius:var(--vi-checkbox-border-radius, 3px);background-color:var(--vi-checkbox-background-color, var(--vi-color-background, #ffffff));transition:border-color .15s ease,background-color .15s ease,box-shadow .15s ease;flex-shrink:0}.checkbox-check{width:100%;height:100%;fill:none;stroke:var(--vi-checkbox-check-color, var(--vi-text-primary-inverse, #ffffff));stroke-width:2px;stroke-linecap:round;stroke-linejoin:round}.check-mark,.check-dash{opacity:0;transform:scale(0);transform-origin:center;transition:transform .15s cubic-bezier(.4,0,.2,1),opacity .15s ease}.checkbox-input:checked:not(:indeterminate)~.checkbox-box{border-color:var(--vi-checkbox-border-color-checked, var(--vi-color-primary, #3676d0));background-color:var(--vi-checkbox-background-checked, var(--vi-color-primary, #3676d0))}.checkbox-input:checked:not(:indeterminate)~.checkbox-box .check-mark{opacity:1;transform:scale(1)}.checkbox-input:indeterminate~.checkbox-box,.checkbox-input.checkbox-input--indeterminate~.checkbox-box{border-color:var(--vi-checkbox-border-color-checked, var(--vi-color-primary, #3676d0));background-color:var(--vi-checkbox-background-checked, var(--vi-color-primary, #3676d0))}.checkbox-input:indeterminate~.checkbox-box .check-dash,.checkbox-input.checkbox-input--indeterminate~.checkbox-box .check-dash{opacity:1;transform:scale(1)}.checkbox-input:focus-visible~.checkbox-box{outline:var(--vi-border-width-base, 2px) solid var(--vi-checkbox-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:2px;box-shadow:0 0 0 3px var(--vi-checkbox-focus-ring-glow, var(--vi-color-blue-200, #cee6ff))}.checkbox-wrapper:hover:not(.checkbox-wrapper--disabled) .checkbox-box{border-color:var(--vi-checkbox-border-color-hover, var(--vi-border-inverse-03, #757575))}.checkbox-wrapper:hover:not(.checkbox-wrapper--disabled) .checkbox-input:checked:not(:indeterminate)~.checkbox-box{border-color:var(--vi-checkbox-border-color-checked-hover, var(--vi-color-primary, #3676d0))}.checkbox-wrapper:hover:not(.checkbox-wrapper--disabled) .checkbox-input:indeterminate~.checkbox-box,.checkbox-wrapper:hover:not(.checkbox-wrapper--disabled) .checkbox-input.checkbox-input--indeterminate~.checkbox-box{border-color:var(--vi-checkbox-border-color-checked-hover, var(--vi-color-primary, #3676d0))}.checkbox-wrapper--disabled{cursor:not-allowed;opacity:var(--vi-checkbox-disabled-opacity, .5)}.checkbox-wrapper--disabled .checkbox-box{background-color:var(--vi-layer-disabled, #f3f4f6);border-color:var(--vi-border-03, #e0e0e0)}.checkbox-wrapper--disabled .checkbox-check{stroke:var(--vi-text-primary-inverse, #ffffff)}.checkbox-wrapper--disabled .checkbox-input:checked~.checkbox-box,.checkbox-wrapper--disabled .checkbox-input:indeterminate~.checkbox-box,.checkbox-wrapper--disabled .checkbox-input.checkbox-input--indeterminate~.checkbox-box{background-color:var(--vi-text-disabled, #9e9e9e);border-color:var(--vi-text-disabled, #9e9e9e)}@media(prefers-reduced-motion:reduce){.checkbox-box,.check-mark,.check-dash{transition:none}}}:host{display:inline-block;outline:none}:host([disabled]){cursor:not-allowed;pointer-events:none}::slotted(*){font-family:inherit;font-size:inherit;color:inherit}:host([status=invalid]){--vi-checkbox-border-color: var(--vi-color-error, #ef4444);--vi-checkbox-border-color-hover: var(--vi-color-error, #ef4444);--vi-checkbox-border-color-checked: var(--vi-color-error, #ef4444);--vi-checkbox-border-color-checked-hover: var(--vi-color-error, #ef4444);--vi-checkbox-background-checked: var(--vi-color-error, #ef4444);--vi-checkbox-focus-ring-color: var(--vi-color-error, #ef4444);--vi-checkbox-focus-ring-glow: var(--vi-color-red-100, #ffccce);--vi-checkbox-label-color: var(--vi-color-error, #ef4444)}:host([status=valid]){--vi-checkbox-border-color: var(--vi-color-success, #489167);--vi-checkbox-border-color-hover: var(--vi-color-success, #489167);--vi-checkbox-border-color-checked: var(--vi-color-success, #489167);--vi-checkbox-border-color-checked-hover: var(--vi-color-success, #489167);--vi-checkbox-background-checked: var(--vi-color-success, #489167);--vi-checkbox-focus-ring-color: var(--vi-color-success, #489167);--vi-checkbox-focus-ring-glow: var(--vi-color-green-100, #e6f0eb)}:host([size=xs]){--vi-checkbox-size: 12px;--vi-checkbox-border-radius: 2px;--vi-checkbox-label-gap: 4px;--vi-checkbox-label-font-size: var(--vi-font-size-xs, 12px)}:host([size=sm]){--vi-checkbox-size: 14px;--vi-checkbox-border-radius: 2px;--vi-checkbox-label-gap: 6px;--vi-checkbox-label-font-size: var(--vi-font-size-sm, 14px)}:host([size=lg]){--vi-checkbox-size: 22px;--vi-checkbox-border-radius: 4px;--vi-checkbox-label-gap: 10px;--vi-checkbox-label-font-size: var(--vi-font-size-lg, 18px)}";

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
var _dec, _initClass, _ValidityMixin, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _init_status, _init_required, _init_validityMessage, /** Checked state. */ _init_checked, /** Indeterminate (partial) state. */ _init_indeterminate, /** Size scale — controls size, padding, and font-size. */ _init_size, /** Form submission value when checked. */ _init_value, /** Form field name. */ _init_name, /** Disables the checkbox. */ _init_disabled, _initProto;
let _ViCheckbox;
_dec = t('vi-checkbox'), _dec1 = n({
    reflect: true
}), _dec2 = n({
    type: Boolean,
    reflect: true
}), _dec3 = n(), _dec4 = n({
    type: Boolean,
    reflect: true
}), _dec5 = n({
    type: Boolean,
    reflect: true
}), _dec6 = n({
    type: String,
    reflect: true
}), _dec7 = n(), _dec8 = n(), _dec9 = n({
    type: Boolean,
    reflect: true
});
new class extends _identity {
    constructor(){
        super(_ViCheckbox), _initClass();
    }
    static{
        class ViCheckbox extends (_ValidityMixin = ValidityMixin(FocusableMixin(ViElement))) {
            static{
                ({ e: [_init_status, _init_required, _init_validityMessage, _init_checked, _init_indeterminate, _init_size, _init_value, _init_name, _init_disabled, _initProto], c: [_ViCheckbox, _initClass] } = _apply_decs_2203_r(this, [
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
                        "checked"
                    ],
                    [
                        _dec5,
                        1,
                        "indeterminate"
                    ],
                    [
                        _dec6,
                        1,
                        "size"
                    ],
                    [
                        _dec7,
                        1,
                        "value"
                    ],
                    [
                        _dec8,
                        1,
                        "name"
                    ],
                    [
                        _dec9,
                        1,
                        "disabled"
                    ]
                ], [
                    _dec
                ], _ValidityMixin));
            }
            static styles = i`
    ${r(checkboxStyles)}
  `;
            _initialChecked = (_initProto(this), false);
            get _focusableElement() {
                return this.shadowRoot?.querySelector('input') ?? null;
            }
            #___private_status_1 = _init_status(this, 'default');
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
            #___private_checked_4 = _init_checked(this, false);
            get checked() {
                return this.#___private_checked_4;
            }
            set checked(_v) {
                this.#___private_checked_4 = _v;
            }
            #___private_indeterminate_5 = _init_indeterminate(this, false);
            get indeterminate() {
                return this.#___private_indeterminate_5;
            }
            set indeterminate(_v) {
                this.#___private_indeterminate_5 = _v;
            }
            #___private_size_6 = _init_size(this, 'md');
            get size() {
                return this.#___private_size_6;
            }
            set size(_v) {
                this.#___private_size_6 = _v;
            }
            #___private_value_7 = _init_value(this, 'on');
            get value() {
                return this.#___private_value_7;
            }
            set value(_v) {
                this.#___private_value_7 = _v;
            }
            #___private_name_8 = _init_name(this, '');
            get name() {
                return this.#___private_name_8;
            }
            set name(_v) {
                this.#___private_name_8 = _v;
            }
            #___private_disabled_9 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_9;
            }
            set disabled(_v) {
                this.#___private_disabled_9 = _v;
            }
            // ── ValidityMixin hook ───────────────────────────────────────────────────
            _testValidity() {
                const input = this._focusableElement;
                if (input) {
                    if (input.checked !== this.checked) {
                        input.checked = this.checked;
                    }
                    const validity = input.validity;
                    if (!validity.valid) {
                        this.validityMessage = input.validationMessage;
                        return {
                            valueMissing: validity.valueMissing,
                            customError: validity.customError
                        };
                    }
                } else if (this.required && !this.checked) {
                    const temp = document.createElement('input');
                    temp.type = 'checkbox';
                    temp.required = true;
                    this.validityMessage = temp.validationMessage;
                    return {
                        valueMissing: true
                    };
                }
                return {};
            }
            // ── Lifecycle ──────────────────────────────────────────────────────────────
            connectedCallback() {
                super.connectedCallback();
                this._initialChecked = this.hasAttribute('checked');
            }
            updated(changed) {
                super.updated(changed);
                // Sync form value for form submission participation
                if (changed.has('checked') || changed.has('value')) {
                    this._internals.setFormValue(this.checked ? this.value : null);
                }
                // Centralize host focusability via FocusableMixin
                if (changed.has('disabled')) {
                    this._setHostFocusable(!this.disabled);
                }
            }
            /** Resets value and validation state when the associated form resets. */ formResetCallback() {
                this.checked = this._initialChecked;
                this.indeterminate = false;
                this.status = 'default';
                this.validityMessage = '';
            }
            /** Keeps disabled in sync when a containing fieldset or form is disabled. */ formDisabledCallback(disabled) {
                this.disabled = disabled;
            }
            // ── Event Handlers ─────────────────────────────────────────────────────────
            _onChange(e) {
                e.stopPropagation();
                if (this.disabled) return;
                const input = e.target;
                this.checked = input.checked;
                this.indeterminate = input.indeterminate;
                this.dispatchEvent(new CustomEvent('vi-checkbox-change', {
                    detail: {
                        checked: this.checked,
                        value: this.value
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            // ── Render ─────────────────────────────────────────────────────────────────
            render() {
                const isValDisabled = this.disabled;
                const inputClasses = e({
                    'checkbox-input': true,
                    'sr-only': true,
                    'checkbox-input--indeterminate': this.indeterminate
                });
                const wrapperClasses = e({
                    'checkbox-wrapper': true,
                    'checkbox-wrapper--disabled': isValDisabled
                });
                return b`
      <label class=${wrapperClasses}>
        <input
          type="checkbox"
          class=${inputClasses}
          .name=${this.name}
          .value=${this.value}
          ?checked=${this.checked}
          .indeterminate=${this.indeterminate}
          ?disabled=${isValDisabled}
          ?required=${this.required}
          aria-required=${this.required ? 'true' : 'false'}
          aria-checked=${this.indeterminate ? 'mixed' : this.checked ? 'true' : 'false'}
          @change=${this._onChange}
        />
        <span part="box" class="checkbox-box" aria-hidden="true">
          <svg part="check" class="checkbox-check" viewBox="0 0 12 12">
            <!-- Checkmark path shown when checked -->
            <polyline class="check-mark" points="2,6 5,9 10,3"/>
            <!-- Dash shown when indeterminate -->
            <line class="check-dash" x1="2" y1="6" x2="10" y2="6"/>
          </svg>
        </span>
        <span part="label" class="checkbox-label">
          <slot></slot>
        </span>
      </label>
    `;
            }
        }
    }
}();
