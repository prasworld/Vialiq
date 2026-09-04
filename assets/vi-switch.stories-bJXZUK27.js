import { r, i, A, b } from './iframe-9yd_z6c6.js';
import { V as ViElement, t, n } from './vi-element-D7bP2wsn.js';
import { F as FocusableMixin } from './focusable-mixin-CmxOyPX5.js';
import { V as ValidityMixin } from './validity-mixin-BGbFxpv9.js';
import { e } from './class-map-BnH_mZac.js';
import './preload-helper-D5QYaGzd.js';
import './directive-BKuZRRPO.js';

const switchStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.switch-wrapper{display:inline-flex;align-items:flex-start;gap:var(--vi-switch-label-gap, var(--vi-spacing-xs, .5rem));cursor:pointer;font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-switch-label-font-size, var(--vi-font-size-base, .875rem));line-height:var(--vi-line-height-normal, 1.5715);color:var(--vi-switch-label-color, var(--vi-text-primary, #111827));-webkit-user-select:none;user-select:none}.switch-label{flex:1 1 auto;min-width:0;word-break:break-word;overflow-wrap:break-word}.switch-input{position:absolute!important;clip-path:inset(50%)!important;overflow:hidden!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;border:0!important;white-space:nowrap!important}.switch-track{box-sizing:border-box;position:relative;width:var(--vi-switch-track-width, 2.75rem);height:var(--vi-switch-track-height, 1.375rem);background-color:var(--vi-switch-track-color-off, var(--vi-border-03, #e0e0e0));border-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px));transition:background-color var(--vi-switch-transition-duration, .15s) ease;flex-shrink:0;margin-top:calc((1em * var(--vi-line-height-normal, 1.5715) - var(--vi-switch-track-height, 1.5rem)) / 2)}.switch-thumb{position:absolute;top:50%;left:var(--vi-switch-thumb-offset, .125rem);transform:translateY(-50%);width:var(--vi-switch-thumb-size, 1.125rem);height:var(--vi-switch-thumb-size, 1.125rem);background-color:var(--vi-switch-thumb-color, var(--vi-text-primary-inverse, #ffffff));border-radius:50%;box-shadow:var(--vi-switch-thumb-shadow, var(--vi-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, .05), 0 10px 15px -3px rgba(0, 0, 0, .1)));transition:left var(--vi-switch-transition-duration, .15s) ease}.switch-input:checked~.switch-track{background-color:var(--vi-switch-track-color-on, var(--vi-color-primary, #3676d0))}.switch-input:checked~.switch-track .switch-thumb{left:calc(100% - var(--vi-switch-thumb-size, 1.125rem) - var(--vi-switch-thumb-offset, .125rem))}.switch-input:focus-visible~.switch-track{outline:var(--vi-border-width-base, 2px) solid var(--vi-switch-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:2px;box-shadow:var(--vi-focus-ring-shadow, 0 0 0 3px var(--vi-focus-ring-color, var(--vi-color-blue-200, #cee6ff)))}.switch-wrapper--disabled{cursor:not-allowed;opacity:var(--vi-switch-disabled-opacity, .5)}.switch-wrapper--disabled .switch-track{background-color:var(--vi-switch-track-color-disabled, var(--vi-border-03, #e0e0e0))}.switch-wrapper--disabled .switch-input:checked~.switch-track{background-color:var(--vi-switch-track-color-on-disabled, var(--vi-text-disabled, #9e9e9e))}@media(prefers-reduced-motion:reduce){.switch-track,.switch-thumb{transition:none}}}:host{display:inline-block;outline:none}:host([disabled]){cursor:not-allowed;pointer-events:none}::slotted(*){font-family:inherit;font-size:inherit;color:inherit}:host([size=sm]){--vi-switch-track-width: 1.75rem;--vi-switch-track-height: var(--vi-spacing-md, 1rem);--vi-switch-thumb-size: var(--vi-spacing-sm, .75rem)}:host([size=md]){--vi-switch-track-width: 2.75rem;--vi-switch-track-height: var(--vi-spacing-lg, 1.5rem);--vi-switch-thumb-size: var(--vi-spacing-md, 1rem)}:host([size=lg]){--vi-switch-track-width: 3.25rem;--vi-switch-track-height: var(--vi-spacing-xl, 2rem);--vi-switch-thumb-size: var(--vi-spacing-lg, 1.5rem)}";

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
var _dec, _initClass, _ValidityMixin, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _init_status, _init_required, _init_validityMessage, /** Checked state. */ _init_checked, /** Size scale — controls size, padding, and font-size. */ _init_size, /** Label position relative to switch. */ _init_labelPlacement, /** Form submission value when checked. */ _init_value, /** Form field name. */ _init_name, /** Disables the switch. */ _init_disabled, _initProto;
let _ViSwitch;
_dec = t('vi-switch'), _dec1 = n({
    reflect: true
}), _dec2 = n({
    type: Boolean,
    reflect: true
}), _dec3 = n(), _dec4 = n({
    type: Boolean,
    reflect: true
}), _dec5 = n({
    type: String,
    reflect: true
}), _dec6 = n({
    type: String,
    reflect: true,
    attribute: 'label-placement'
}), _dec7 = n(), _dec8 = n(), _dec9 = n({
    type: Boolean,
    reflect: true
});
new class extends _identity {
    constructor(){
        super(_ViSwitch), _initClass();
    }
    static{
        class ViSwitch extends (_ValidityMixin = ValidityMixin(FocusableMixin(ViElement))) {
            static{
                ({ e: [_init_status, _init_required, _init_validityMessage, _init_checked, _init_size, _init_labelPlacement, _init_value, _init_name, _init_disabled, _initProto], c: [_ViSwitch, _initClass] } = _apply_decs_2203_r(this, [
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
                        "size"
                    ],
                    [
                        _dec6,
                        1,
                        "labelPlacement"
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
    ${r(switchStyles)}
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
            #___private_size_5 = _init_size(this, 'md');
            get size() {
                return this.#___private_size_5;
            }
            set size(_v) {
                this.#___private_size_5 = _v;
            }
            #___private_labelPlacement_6 = _init_labelPlacement(this, 'end');
            get labelPlacement() {
                return this.#___private_labelPlacement_6;
            }
            set labelPlacement(_v) {
                this.#___private_labelPlacement_6 = _v;
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
                            customError: validity.customError
                        };
                    }
                }
                this.validityMessage = '';
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
                this.dispatchEvent(new CustomEvent('vi-switch-change', {
                    detail: {
                        checked: this.checked
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            // ── Render ─────────────────────────────────────────────────────────────────
            render() {
                const isValDisabled = this.disabled;
                const inputClasses = e({
                    'switch-input': true,
                    'sr-only': true
                });
                const wrapperClasses = e({
                    'switch-wrapper': true,
                    'switch-wrapper--disabled': isValDisabled
                });
                return b`
      <label class=${wrapperClasses} data-placement=${this.labelPlacement}>
        ${this.labelPlacement === 'start' ? b`<span part="label" class="switch-label"><slot></slot></span>` : A}

        <input
          type="checkbox"
          role="switch"
          class=${inputClasses}
          .name=${this.name}
          .value=${this.value}
          ?checked=${this.checked}
          ?disabled=${isValDisabled}
          aria-checked=${this.checked ? 'true' : 'false'}
          @change=${this._onChange}
        />
        <span part="track" class="switch-track" aria-hidden="true">
          <span part="thumb" class="switch-thumb"></span>
        </span>

        ${this.labelPlacement === 'end' ? b`<span part="label" class="switch-label"><slot></slot></span>` : A}
      </label>
    `;
            }
        }
    }
}();

const meta = {
    title: 'Components/Switch',
    component: 'vi-switch',
    argTypes: {
        checked: {
            control: 'boolean'
        },
        disabled: {
            control: 'boolean'
        },
        size: {
            control: 'select',
            options: [
                'sm',
                'md',
                'lg'
            ]
        },
        labelPlacement: {
            control: 'select',
            options: [
                'start',
                'end'
            ]
        }
    }
};
const Default = {
    args: {
        checked: false,
        disabled: false,
        size: 'md',
        labelPlacement: 'end'
    },
    render: (args)=>b`
    <vi-switch
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      size=${args.size}
      label-placement=${args.labelPlacement}
    >
      Enable email notifications
    </vi-switch>
  `
};
const Sizes = {
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <vi-switch size="sm">Small (sm)</vi-switch>
      <vi-switch size="md">Medium (md)</vi-switch>
      <vi-switch size="lg">Large (lg)</vi-switch>
    </div>
  `
};
const Disabled = {
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <vi-switch disabled>Disabled unchecked</vi-switch>
      <vi-switch disabled checked>Disabled checked</vi-switch>
    </div>
  `
};
const Placement = {
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <vi-switch label-placement="end">Label at end (default)</vi-switch>
      <vi-switch label-placement="start">Label at start</vi-switch>
    </div>
  `
};
const WithLabels = {
    render: ()=>b`
    <vi-switch size="lg">
      <span slot="on-label">ON</span>
      <span slot="off-label">OFF</span>
      Dual Data Entry Required
    </vi-switch>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    checked: false,\n    disabled: false,\n    size: 'md',\n    labelPlacement: 'end'\n  },\n  render: args => html`\n    <vi-switch\n      ?checked=${args.checked}\n      ?disabled=${args.disabled}\n      size=${args.size}\n      label-placement=${args.labelPlacement}\n    >\n      Enable email notifications\n    </vi-switch>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
Sizes.parameters = {
    ...Sizes.parameters,
    docs: {
        ...Sizes.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 1rem;\">\n      <vi-switch size=\"sm\">Small (sm)</vi-switch>\n      <vi-switch size=\"md\">Medium (md)</vi-switch>\n      <vi-switch size=\"lg\">Large (lg)</vi-switch>\n    </div>\n  `\n}",
            ...Sizes.parameters?.docs?.source
        }
    }
};
Disabled.parameters = {
    ...Disabled.parameters,
    docs: {
        ...Disabled.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 1rem;\">\n      <vi-switch disabled>Disabled unchecked</vi-switch>\n      <vi-switch disabled checked>Disabled checked</vi-switch>\n    </div>\n  `\n}",
            ...Disabled.parameters?.docs?.source
        }
    }
};
Placement.parameters = {
    ...Placement.parameters,
    docs: {
        ...Placement.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 1rem;\">\n      <vi-switch label-placement=\"end\">Label at end (default)</vi-switch>\n      <vi-switch label-placement=\"start\">Label at start</vi-switch>\n    </div>\n  `\n}",
            ...Placement.parameters?.docs?.source
        }
    }
};
WithLabels.parameters = {
    ...WithLabels.parameters,
    docs: {
        ...WithLabels.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <vi-switch size=\"lg\">\n      <span slot=\"on-label\">ON</span>\n      <span slot=\"off-label\">OFF</span>\n      Dual Data Entry Required\n    </vi-switch>\n  `\n}",
            ...WithLabels.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","Sizes","Disabled","Placement","WithLabels"];

export { Default, Disabled, Placement, Sizes, WithLabels, __namedExportsOrder, meta as default };
