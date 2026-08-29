import { r as r$1, i, A, b } from './iframe-DecssaRk.js';
import { V as ViElement, t, n } from './vi-element-CZpFtKKU.js';
import { r } from './state-CqHxxi7B.js';
import { F as FocusableMixin } from './focusable-mixin-CmxOyPX5.js';

const buttonStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.button{display:inline-flex;align-items:center;justify-content:center;gap:var(--vi-spacing-xs, .5rem);border:var(--vi-border-width-thin, 1px) solid transparent;border-radius:var(--vi-button-shape-border-radius, var(--vi-border-radius-md, 6px));padding:var(--vi-button-spacing-padding-block, var(--vi-spacing-sm, .75rem)) var(--vi-button-spacing-padding-inline, var(--vi-spacing-md, 1rem));font-size:var(--vi-button-typography-font-size, var(--vi-font-size-base, .875rem));font-weight:var(--vi-button-typography-font-weight, var(--vi-font-weight-semibold, 600));line-height:var(--vi-line-height-tight, 1.2);cursor:pointer;-webkit-user-select:none;user-select:none;transition:opacity var(--vi-button-effect-transition-duration, .16s) ease,box-shadow var(--vi-button-effect-transition-duration, .16s) ease,transform var(--vi-button-effect-transition-duration, .16s) ease}}:host{display:inline-block}.button{padding-block:var(--vi-button-spacing-padding-block, var(--vi-spacing-unit, .25rem));height:var(--vi-button-sizing-min-height, 2rem)}:host([size=xs]) .button{padding-block:var(--vi-button-spacing-padding-block, 0);padding-inline:var(--vi-button-spacing-padding-inline, var(--vi-spacing-unit, .25rem));font-size:var(--vi-button-typography-font-size, var(--vi-font-size-xs, .75rem));border-radius:var(--vi-button-shape-border-radius, var(--vi-border-radius-sm, 4px));height:var(--vi-button-sizing-min-height, 1.25rem)}:host([size=sm]) .button{padding-block:var(--vi-button-spacing-padding-block, 0);padding-inline:var(--vi-button-spacing-padding-inline, var(--vi-spacing-xs, .5rem));font-size:var(--vi-button-typography-font-size, var(--vi-font-size-base, .875rem));border-radius:var(--vi-button-shape-border-radius, var(--vi-border-radius-sm, 4px));height:var(--vi-button-sizing-min-height, 1.5rem)}:host([size=lg]) .button{padding-block:var(--vi-button-spacing-padding-block, var(--vi-spacing-xs, .5rem));padding-inline:var(--vi-button-spacing-padding-inline, var(--vi-spacing-md, 1rem));font-size:var(--vi-button-typography-font-size, var(--vi-font-size-lg, 1rem));border-radius:var(--vi-button-shape-border-radius, var(--vi-border-radius-lg, 8px));height:var(--vi-button-sizing-min-height, 2.5rem)}:host([full-width]){display:block}:host([full-width]) .button{width:100%}:host([icon-only]) .button{aspect-ratio:1/1;padding:0;justify-content:center}:host([icon-only]) .label{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}:host([variant=primary]) .button{background-color:var(--vi-button-surface-primary-background-color, var(--vi-color-primary, #3676d0));color:var(--vi-button-surface-primary-text-color, var(--vi-color-grey-100, #f5f5f5))}:host([variant=secondary]) .button{background-color:var(--vi-button-surface-secondary-background-color, var(--vi-color-secondary, #f0f4f8));color:var(--vi-button-surface-secondary-text-color, var(--vi-color-foreground, #111827));border-color:var(--vi-color-border, #e5e7eb)}:host([variant=danger]) .button{background-color:var(--vi-button-surface-danger-background-color, var(--vi-color-error, #ef4444));color:var(--vi-button-surface-danger-text-color, var(--vi-color-grey-100, #f5f5f5))}:host([variant=success]) .button{background-color:var(--vi-button-surface-success-background-color, var(--vi-color-success, #489167));color:var(--vi-button-surface-success-text-color, var(--vi-color-grey-100, #f5f5f5))}:host([variant=info]) .button{background-color:var(--vi-button-surface-info-background-color, var(--vi-color-info, #3676d0));color:var(--vi-button-surface-info-text-color, var(--vi-color-grey-100, #f5f5f5))}:host([variant=ghost]) .button{background-color:var(--vi-button-surface-ghost-background-color, transparent);color:var(--vi-button-surface-ghost-text-color, var(--vi-color-primary, #3676d0))}:host([disabled]) .button,.button:disabled{opacity:.6;cursor:not-allowed}.button:not(:disabled){box-shadow:var(--vi-button-effect-shadow-raised, inset 0 1px 0 rgba(255, 255, 255, .14), 0 2px 4px rgba(0, 0, 0, .18), 0 1px 2px rgba(0, 0, 0, .08))}.button:hover:not(:disabled){opacity:.92;box-shadow:var(--vi-button-effect-shadow-hover, inset 0 1px 0 rgba(255, 255, 255, .18), 0 4px 8px rgba(0, 0, 0, .22), 0 2px 4px rgba(0, 0, 0, .1));transform:translateY(-1px)}.button:active:not(:disabled){box-shadow:var(--vi-button-effect-shadow-pressed, inset 0 2px 4px rgba(0, 0, 0, .22), 0 1px 1px rgba(0, 0, 0, .06));transform:translateY(1px);opacity:1}:host([variant=ghost]) .button:hover:not(:disabled){background-color:#0000000a;text-decoration:underline;opacity:1}:host([variant=ghost]) .button:not(:disabled){box-shadow:none}:host([variant=ghost]) .button:active:not(:disabled){box-shadow:inset 0 1px 3px #00000024;transform:translateY(0)}.button:focus-visible:not(:disabled){outline:var(--vi-border-width-base, 2px) solid var(--vi-button-focus-ring-color, var(--vi-color-primary, #3676d0));outline-offset:0;box-shadow:var(--vi-button-effect-shadow-raised, inset 0 1px 0 rgba(255, 255, 255, .14), 0 2px 4px rgba(0, 0, 0, .18), 0 1px 2px rgba(0, 0, 0, .08))}@media(prefers-reduced-motion:reduce){.button{transform:none!important;transition-property:color,background-color,border-color,box-shadow,opacity!important}}.icon{order:-1;display:inline-flex;flex-shrink:0}.icon[hidden]{display:none}:host([icon-placement=end]) .icon{order:1}::slotted(vi-icon),::slotted(svg){--vi-icon-size: 1em;width:1em;height:1em}.label{flex:1 1 auto;min-width:0}";

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
var _dec, _initClass, _FocusableMixin, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, /** Visual variant. */ _init_variant, /** Size scale — controls padding and font-size. */ _init_size, /** Icon placement: 'start' (before label) or 'end' (after label). CSS order handles it — no DOM changes on toggle. */ _init_iconPlacement, /** When true, stretches the button to fill the width of its container. */ _init_fullWidth, /** When true, styles the button for an icon-only layout (typically square with equal padding). */ _init_iconOnly, /** Disables the button. */ _init_disabled, /** The button type — 'button', 'submit', or 'reset'. Forwarded to the inner native button. */ _init_type, /** Accessible label forwarded to the inner native button. */ _init_ariaLabel, _init__hasIcon, _initProto;
let _ViButton;
_dec = t('vi-button'), _dec1 = n({
    type: String,
    reflect: true
}), _dec2 = n({
    type: String,
    reflect: true
}), _dec3 = n({
    type: String,
    reflect: true,
    attribute: 'icon-placement'
}), _dec4 = n({
    type: Boolean,
    reflect: true,
    attribute: 'full-width'
}), _dec5 = n({
    type: Boolean,
    reflect: true,
    attribute: 'icon-only'
}), _dec6 = n({
    type: Boolean,
    reflect: true
}), _dec7 = n({
    type: String,
    reflect: true
}), _dec8 = n({
    attribute: 'aria-label'
}), _dec9 = r();
new class extends _identity {
    constructor(){
        super(_ViButton), _initClass();
    }
    static{
        class ViButton extends (_FocusableMixin = FocusableMixin(ViElement)) {
            static{
                ({ e: [_init_variant, _init_size, _init_iconPlacement, _init_fullWidth, _init_iconOnly, _init_disabled, _init_type, _init_ariaLabel, _init__hasIcon, _initProto], c: [_ViButton, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "variant"
                    ],
                    [
                        _dec2,
                        1,
                        "size"
                    ],
                    [
                        _dec3,
                        1,
                        "iconPlacement"
                    ],
                    [
                        _dec4,
                        1,
                        "fullWidth"
                    ],
                    [
                        _dec5,
                        1,
                        "iconOnly"
                    ],
                    [
                        _dec6,
                        1,
                        "disabled"
                    ],
                    [
                        _dec7,
                        1,
                        "type"
                    ],
                    [
                        _dec8,
                        1,
                        "ariaLabel"
                    ],
                    [
                        _dec9,
                        1,
                        "_hasIcon"
                    ]
                ], [
                    _dec
                ], _FocusableMixin));
            }
            static styles = i`${r$1(buttonStyles)}`;
            get _focusableElement() {
                return this.shadowRoot?.querySelector('button') ?? null;
            }
            #___private_variant_1 = (_initProto(this), _init_variant(this, 'primary'));
            get variant() {
                return this.#___private_variant_1;
            }
            set variant(_v) {
                this.#___private_variant_1 = _v;
            }
            #___private_size_2 = _init_size(this, 'md');
            get size() {
                return this.#___private_size_2;
            }
            set size(_v) {
                this.#___private_size_2 = _v;
            }
            #___private_iconPlacement_3 = _init_iconPlacement(this, 'start');
            get iconPlacement() {
                return this.#___private_iconPlacement_3;
            }
            set iconPlacement(_v) {
                this.#___private_iconPlacement_3 = _v;
            }
            #___private_fullWidth_4 = _init_fullWidth(this, false);
            get fullWidth() {
                return this.#___private_fullWidth_4;
            }
            set fullWidth(_v) {
                this.#___private_fullWidth_4 = _v;
            }
            #___private_iconOnly_5 = _init_iconOnly(this, false);
            get iconOnly() {
                return this.#___private_iconOnly_5;
            }
            set iconOnly(_v) {
                this.#___private_iconOnly_5 = _v;
            }
            #___private_disabled_6 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_6;
            }
            set disabled(_v) {
                this.#___private_disabled_6 = _v;
            }
            #___private_type_7 = _init_type(this, 'button');
            get type() {
                return this.#___private_type_7;
            }
            set type(_v) {
                this.#___private_type_7 = _v;
            }
            #___private_ariaLabel_8 = _init_ariaLabel(this, null);
            get ariaLabel() {
                return this.#___private_ariaLabel_8;
            }
            set ariaLabel(_v) {
                this.#___private_ariaLabel_8 = _v;
            }
            #___private__hasIcon_9 = _init__hasIcon(this, false);
            get _hasIcon() {
                return this.#___private__hasIcon_9;
            }
            set _hasIcon(_v) {
                this.#___private__hasIcon_9 = _v;
            }
            updated(changed) {
                super.updated(changed);
                if (changed.has('disabled')) {
                    if (this.disabled) {
                        // Becoming disabled — always remove from tab order.
                        this._setHostFocusable(false);
                    } else if (changed.get('disabled') !== undefined) {
                        // Transitioning from a real disabled state back to enabled.
                        // Skip when old value is `undefined` (first render) — connectedCallback
                        // already set the correct tabIndex, respecting any consumer tabindex attr.
                        this._setHostFocusable(true);
                    }
                }
            }
            onIconSlotChange(e) {
                const slot = e.target;
                this._hasIcon = slot.assignedElements({
                    flatten: true
                }).length > 0;
            }
            onClick(event) {
                if (this.disabled) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return;
                }
                // Shadow DOM isolation: a <button type="reset|submit"> inside a shadow root
                // cannot natively interact with the parent form. We must do it manually.
                if (this.type === 'reset' || this.type === 'submit') {
                    const form = event.composedPath().find((n)=>n instanceof HTMLFormElement);
                    if (form) {
                        if (this.type === 'reset') {
                            form.reset();
                        } else {
                            const submitter = event.currentTarget instanceof HTMLButtonElement ? event.currentTarget : undefined;
                            form.requestSubmit(submitter);
                        }
                    }
                }
            }
            render() {
                const { _hasIcon, disabled, onClick, onIconSlotChange } = this;
                return b`
      <button
        class="button"
        part="button"
        type=${this.type}
        tabindex="0"
        ?disabled=${disabled}
        aria-label=${this.ariaLabel ?? A}
        @click=${onClick}
      >
        <slot
          name="icon"
          class="icon"
          part="icon"
          ?hidden=${!_hasIcon}
          @slotchange=${onIconSlotChange}
        ></slot>
        <span part="label" class="label"><slot></slot></span>
      </button>
    `;
            }
        }
    }
}();
