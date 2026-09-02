import { r, i, b } from './iframe-D4zu5Ix9.js';
import { V as ViElement, t, n } from './vi-element-BRb8_cc9.js';
import { F as FocusableMixin } from './focusable-mixin-CmxOyPX5.js';
import { V as ValidityMixin } from './validity-mixin-BhpPuITw.js';
import './preload-helper-D5QYaGzd.js';

const radioStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.radio-group{border:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--vi-radio-group-spacing-field-gap, var(--vi-spacing-xs, .5rem));width:100%}.radio-group-legend{font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-radio-group-label-font-size, var(--vi-font-size-base, .875rem));font-weight:var(--vi-font-weight-semibold, 600);color:var(--vi-radio-group-label-color, var(--vi-text-primary, #111827));padding:0;margin:0;margin-block-end:var(--vi-radio-group-legend-margin-bottom, var(--vi-spacing-xs, .5rem))}.radio-group-items{display:flex;gap:var(--vi-radio-group-gap, var(--vi-spacing-xs, .5rem))}.radio-group-items[orientation=vertical]{flex-direction:column}.radio-group-items[orientation=horizontal]{flex-direction:row;flex-wrap:wrap;gap:var(--vi-radio-group-gap-horizontal, 24px)}.radio-group-helper{display:block;font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-radio-group-helper-font-size, var(--vi-font-size-xs, .75rem));color:var(--vi-radio-group-helper-color, var(--vi-text-helper, #9e9e9e))}.radio-group-validation{display:block;font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-radio-group-validation-font-size, var(--vi-font-size-xs, .75rem));color:var(--vi-radio-group-validation-color, var(--vi-text-helper, #9e9e9e));margin-block-start:var(--vi-radio-group-validation-margin-top, var(--vi-spacing-xs, .5rem))}.radio-group-validation.radio-group-validation--invalid{color:var(--vi-radio-group-error-color, var(--vi-color-error, #ef4444))}.radio-group-validation.radio-group-validation--valid{color:var(--vi-radio-group-success-color, var(--vi-color-success, #489167))}.radio-wrapper{display:inline-flex;align-items:center;gap:var(--vi-radio-label-gap, var(--vi-spacing-xs, .5rem));cursor:pointer;font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-radio-label-font-size, var(--vi-font-size-base, .875rem));line-height:var(--vi-line-height-normal, 1.5715);color:var(--vi-radio-label-color, var(--vi-text-primary, #111827));position:relative;-webkit-user-select:none;user-select:none}.radio-input{position:absolute!important;clip-path:inset(50%)!important;overflow:hidden!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;border:0!important;white-space:nowrap!important}.radio-circle{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;width:var(--vi-radio-size, var(--vi-spacing-md, 1rem));height:var(--vi-radio-size, var(--vi-spacing-md, 1rem));border:var(--vi-border-width-base, 2px) solid var(--vi-radio-border-color, var(--vi-outline, #e5e7eb));border-radius:50%;background-color:var(--vi-radio-background-color, var(--vi-color-background, #ffffff));transition:border-color .15s ease,box-shadow .15s ease;flex-shrink:0}.radio-dot{box-sizing:border-box;width:var(--vi-radio-dot-size, calc(var(--vi-spacing-md, 1rem) / 2));height:var(--vi-radio-dot-size, calc(var(--vi-spacing-md, 1rem) / 2));border-radius:50%;background-color:var(--vi-radio-dot-color, var(--vi-color-primary, #3676d0));transform:scale(0);opacity:0;transition:transform .15s cubic-bezier(.4,0,.2,1),opacity .15s ease}.radio-input:checked+.radio-circle{border-color:var(--vi-radio-border-color-checked, var(--vi-color-primary, #3676d0))}.radio-input:checked+.radio-circle .radio-dot{transform:scale(1);opacity:1}.radio-input:focus-visible+.radio-circle{outline:var(--vi-border-width-base, 2px) solid var(--vi-radio-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:2px;box-shadow:var(--vi-focus-ring-shadow, 0 0 0 3px var(--vi-focus-ring-color, var(--vi-color-blue-200, #cee6ff)))}.radio-wrapper:hover:not(.radio-wrapper--disabled) .radio-circle{border-color:var(--vi-radio-border-color-hover, var(--vi-border-inverse-03, #757575))}.radio-wrapper:hover:not(.radio-wrapper--disabled) .radio-input:checked+.radio-circle{border-color:var(--vi-radio-border-color-checked-hover, var(--vi-color-primary, #3676d0))}.radio-wrapper--disabled{cursor:not-allowed;opacity:var(--vi-radio-disabled-opacity, .5)}.radio-wrapper--disabled .radio-circle{background-color:var(--vi-layer-disabled, #f3f4f6);border-color:var(--vi-border-02, #eeeeee)}.radio-wrapper--disabled .radio-dot{background-color:var(--vi-text-disabled, #9e9e9e)}@media(prefers-reduced-motion:reduce){.radio-circle,.radio-dot{transition:none}}}:host{display:inline-block;outline:none}:host([disabled]){cursor:not-allowed;pointer-events:none}::slotted(*){font-family:inherit;font-size:inherit;color:inherit}:host([size=xs]){--vi-radio-size: 12px;--vi-radio-dot-size: 5px;--vi-radio-label-gap: 4px;--vi-radio-label-font-size: var(--vi-font-size-xs, .75rem)}:host([size=sm]){--vi-radio-size: 14px;--vi-radio-dot-size: 6px;--vi-radio-label-gap: 6px;--vi-radio-label-font-size: var(--vi-font-size-sm, .8125rem)}:host([size=lg]){--vi-radio-size: 22px;--vi-radio-dot-size: 10px;--vi-radio-label-gap: 10px;--vi-radio-label-font-size: var(--vi-font-size-lg, 1rem)}";

function applyDecs2203RFactory$1() {
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
function _apply_decs_2203_r$1(targetClass, memberDecs, classDecs, parentClass) {
    return (_apply_decs_2203_r$1 = applyDecs2203RFactory$1())(targetClass, memberDecs, classDecs, parentClass);
}
function _identity$1(x) {
    return x;
}
var _dec$1, _initClass$1, _FocusableMixin, _dec1$1, _dec2$1, _dec3$1, _dec4$1, _dec5$1, /** The value this radio represents. */ _init_value$1, /** Selected state (managed by vi-radio-group). */ _init_checked, /** Disabled state. */ _init_disabled$1, /** Shared name for the radio group (synced by parent). */ _init_name$1, /** Size scale. */ _init_size$1, _initProto$1;
let _ViRadio;
_dec$1 = t('vi-radio'), _dec1$1 = n({
    type: String
}), _dec2$1 = n({
    type: Boolean,
    reflect: true
}), _dec3$1 = n({
    type: Boolean,
    reflect: true
}), _dec4$1 = n({
    type: String
}), _dec5$1 = n({
    type: String,
    reflect: true
});
new class extends _identity$1 {
    constructor(){
        super(_ViRadio), _initClass$1();
    }
    static{
        class ViRadio extends (_FocusableMixin = FocusableMixin(ViElement)) {
            static{
                ({ e: [_init_value$1, _init_checked, _init_disabled$1, _init_name$1, _init_size$1, _initProto$1], c: [_ViRadio, _initClass$1] } = _apply_decs_2203_r$1(this, [
                    [
                        _dec1$1,
                        1,
                        "value"
                    ],
                    [
                        _dec2$1,
                        1,
                        "checked"
                    ],
                    [
                        _dec3$1,
                        1,
                        "disabled"
                    ],
                    [
                        _dec4$1,
                        1,
                        "name"
                    ],
                    [
                        _dec5$1,
                        1,
                        "size"
                    ]
                ], [
                    _dec$1
                ], _FocusableMixin));
            }
            static styles = i`
    ${r(radioStyles)}
  `;
            get _focusableElement() {
                return this.shadowRoot?.querySelector('input') ?? null;
            }
            #___private_value_1 = (_initProto$1(this), _init_value$1(this, ''));
            get value() {
                return this.#___private_value_1;
            }
            set value(_v) {
                this.#___private_value_1 = _v;
            }
            #___private_checked_2 = _init_checked(this, false);
            get checked() {
                return this.#___private_checked_2;
            }
            set checked(_v) {
                this.#___private_checked_2 = _v;
            }
            #___private_disabled_3 = _init_disabled$1(this, false);
            get disabled() {
                return this.#___private_disabled_3;
            }
            set disabled(_v) {
                this.#___private_disabled_3 = _v;
            }
            #___private_name_4 = _init_name$1(this, '');
            get name() {
                return this.#___private_name_4;
            }
            set name(_v) {
                this.#___private_name_4 = _v;
            }
            #___private_size_5 = _init_size$1(this, 'md');
            get size() {
                return this.#___private_size_5;
            }
            set size(_v) {
                this.#___private_size_5 = _v;
            }
            get _group() {
                return this.closest('vi-radio-group');
            }
            /** Computes the effective disabled state based on local state and parent group state. */ get _isEffectiveDisabled() {
                return this.disabled || (this._group?.disabled ?? false);
            }
            updated(changed) {
                super.updated(changed);
                // If standalone, sync the host focusability with disabled state changes
                if (!this._group && changed.has('disabled')) {
                    this._setHostFocusable(!this.disabled);
                }
            }
            _setHostFocusable(enabled) {
                if (this._group) {
                    // No-op: parent vi-radio-group manages host's tabIndex for roving tabindex compliance
                    return;
                }
                super._setHostFocusable(enabled);
            }
            _onChange(e) {
                e.stopPropagation();
                if (this._isEffectiveDisabled) return;
                this.checked = true;
                this.dispatchEvent(new CustomEvent('vi-radio-checked', {
                    bubbles: true,
                    composed: true
                }));
            }
            render() {
                const isValDisabled = this._isEffectiveDisabled;
                return b`
      <label class="radio-wrapper ${isValDisabled ? 'radio-wrapper--disabled' : ''}">
        <input
          type="radio"
          class="radio-input"
          .name=${this.name}
          .value=${this.value}
          .checked=${this.checked}
          ?disabled=${isValDisabled}
          @change=${this._onChange}
        />
        <span part="circle" class="radio-circle" aria-hidden="true">
          <span part="dot" class="radio-dot"></span>
        </span>
        <span part="label" class="radio-label">
          <slot></slot>
        </span>
      </label>
    `;
            }
        }
    }
}();

const radioGroupStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.radio-group{border:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--vi-radio-group-spacing-field-gap, var(--vi-spacing-xs, .5rem));width:100%}.radio-group-legend{font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-radio-group-label-font-size, var(--vi-font-size-base, .875rem));font-weight:var(--vi-font-weight-semibold, 600);color:var(--vi-radio-group-label-color, var(--vi-text-primary, #111827));padding:0;margin:0;margin-block-end:var(--vi-radio-group-legend-margin-bottom, var(--vi-spacing-xs, .5rem))}.radio-group-items{display:flex;gap:var(--vi-radio-group-gap, var(--vi-spacing-xs, .5rem))}.radio-group-items[orientation=vertical]{flex-direction:column}.radio-group-items[orientation=horizontal]{flex-direction:row;flex-wrap:wrap;gap:var(--vi-radio-group-gap-horizontal, 24px)}.radio-group-helper{display:block;font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-radio-group-helper-font-size, var(--vi-font-size-xs, .75rem));color:var(--vi-radio-group-helper-color, var(--vi-text-helper, #9e9e9e))}.radio-group-validation{display:block;font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-radio-group-validation-font-size, var(--vi-font-size-xs, .75rem));color:var(--vi-radio-group-validation-color, var(--vi-text-helper, #9e9e9e));margin-block-start:var(--vi-radio-group-validation-margin-top, var(--vi-spacing-xs, .5rem))}.radio-group-validation.radio-group-validation--invalid{color:var(--vi-radio-group-error-color, var(--vi-color-error, #ef4444))}.radio-group-validation.radio-group-validation--valid{color:var(--vi-radio-group-success-color, var(--vi-color-success, #489167))}.radio-wrapper{display:inline-flex;align-items:center;gap:var(--vi-radio-label-gap, var(--vi-spacing-xs, .5rem));cursor:pointer;font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-radio-label-font-size, var(--vi-font-size-base, .875rem));line-height:var(--vi-line-height-normal, 1.5715);color:var(--vi-radio-label-color, var(--vi-text-primary, #111827));position:relative;-webkit-user-select:none;user-select:none}.radio-input{position:absolute!important;clip-path:inset(50%)!important;overflow:hidden!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;border:0!important;white-space:nowrap!important}.radio-circle{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;width:var(--vi-radio-size, var(--vi-spacing-md, 1rem));height:var(--vi-radio-size, var(--vi-spacing-md, 1rem));border:var(--vi-border-width-base, 2px) solid var(--vi-radio-border-color, var(--vi-outline, #e5e7eb));border-radius:50%;background-color:var(--vi-radio-background-color, var(--vi-color-background, #ffffff));transition:border-color .15s ease,box-shadow .15s ease;flex-shrink:0}.radio-dot{box-sizing:border-box;width:var(--vi-radio-dot-size, calc(var(--vi-spacing-md, 1rem) / 2));height:var(--vi-radio-dot-size, calc(var(--vi-spacing-md, 1rem) / 2));border-radius:50%;background-color:var(--vi-radio-dot-color, var(--vi-color-primary, #3676d0));transform:scale(0);opacity:0;transition:transform .15s cubic-bezier(.4,0,.2,1),opacity .15s ease}.radio-input:checked+.radio-circle{border-color:var(--vi-radio-border-color-checked, var(--vi-color-primary, #3676d0))}.radio-input:checked+.radio-circle .radio-dot{transform:scale(1);opacity:1}.radio-input:focus-visible+.radio-circle{outline:var(--vi-border-width-base, 2px) solid var(--vi-radio-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:2px;box-shadow:var(--vi-focus-ring-shadow, 0 0 0 3px var(--vi-focus-ring-color, var(--vi-color-blue-200, #cee6ff)))}.radio-wrapper:hover:not(.radio-wrapper--disabled) .radio-circle{border-color:var(--vi-radio-border-color-hover, var(--vi-border-inverse-03, #757575))}.radio-wrapper:hover:not(.radio-wrapper--disabled) .radio-input:checked+.radio-circle{border-color:var(--vi-radio-border-color-checked-hover, var(--vi-color-primary, #3676d0))}.radio-wrapper--disabled{cursor:not-allowed;opacity:var(--vi-radio-disabled-opacity, .5)}.radio-wrapper--disabled .radio-circle{background-color:var(--vi-layer-disabled, #f3f4f6);border-color:var(--vi-border-02, #eeeeee)}.radio-wrapper--disabled .radio-dot{background-color:var(--vi-text-disabled, #9e9e9e)}@media(prefers-reduced-motion:reduce){.radio-circle,.radio-dot{transition:none}}}:host{display:block;outline:none}:host([disabled]){cursor:not-allowed;pointer-events:none}:host([status=invalid]){--vi-radio-group-label-color: var(--vi-color-error, #ef4444)}::slotted(*){font-family:inherit;font-size:inherit;color:inherit}:host([size=xs]){--vi-radio-group-label-font-size: var(--vi-font-size-xs, .75rem);--vi-radio-group-legend-margin-bottom: 4px}:host([size=sm]){--vi-radio-group-label-font-size: var(--vi-font-size-sm, .8125rem);--vi-radio-group-legend-margin-bottom: 6px}:host([size=lg]){--vi-radio-group-label-font-size: var(--vi-font-size-lg, 1rem);--vi-radio-group-legend-margin-bottom: 10px}";

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
var _dec, _initClass, _ValidityMixin, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _init_status, _init_required, _init_validityMessage, /** Currently selected radio's value. */ _init_value, /** Shared name for all child radios. */ _init_name, /** Disables the entire group. */ _init_disabled, /** Layout direction of the radio group. */ _init_orientation, /** Size scale — controls spacing and propagates to child radios. */ _init_size, /** Allows clearing the selected radio button on double click. */ _init_allowDblclickClear, _initProto;
let _ViRadioGroup;
_dec = t('vi-radio-group'), _dec1 = n({
    reflect: true
}), _dec2 = n({
    type: Boolean,
    reflect: true
}), _dec3 = n({
    attribute: 'validity-message'
}), _dec4 = n({
    reflect: true
}), _dec5 = n(), _dec6 = n({
    type: Boolean,
    reflect: true
}), _dec7 = n({
    reflect: true
}), _dec8 = n({
    type: String,
    reflect: true
}), _dec9 = n({
    type: Boolean,
    attribute: 'allow-dblclick-clear',
    reflect: true
});
new class extends _identity {
    constructor(){
        super(_ViRadioGroup), _initClass();
    }
    static{
        class ViRadioGroup extends (_ValidityMixin = ValidityMixin(ViElement)) {
            static{
                ({ e: [_init_status, _init_required, _init_validityMessage, _init_value, _init_name, _init_disabled, _init_orientation, _init_size, _init_allowDblclickClear, _initProto], c: [_ViRadioGroup, _initClass] } = _apply_decs_2203_r(this, [
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
                        "value"
                    ],
                    [
                        _dec5,
                        1,
                        "name"
                    ],
                    [
                        _dec6,
                        1,
                        "disabled"
                    ],
                    [
                        _dec7,
                        1,
                        "orientation"
                    ],
                    [
                        _dec8,
                        1,
                        "size"
                    ],
                    [
                        _dec9,
                        1,
                        "allowDblclickClear"
                    ]
                ], [
                    _dec
                ], _ValidityMixin));
            }
            static styles = i`
    ${r(radioGroupStyles)}
  `;
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
            #___private_value_4 = _init_value(this, '');
            get value() {
                return this.#___private_value_4;
            }
            set value(_v) {
                this.#___private_value_4 = _v;
            }
            #___private_name_5 = _init_name(this, '');
            get name() {
                return this.#___private_name_5;
            }
            set name(_v) {
                this.#___private_name_5 = _v;
            }
            #___private_disabled_6 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_6;
            }
            set disabled(_v) {
                this.#___private_disabled_6 = _v;
            }
            #___private_orientation_7 = _init_orientation(this, 'vertical');
            get orientation() {
                return this.#___private_orientation_7;
            }
            set orientation(_v) {
                this.#___private_orientation_7 = _v;
            }
            #___private_size_8 = _init_size(this, 'md');
            get size() {
                return this.#___private_size_8;
            }
            set size(_v) {
                this.#___private_size_8 = _v;
            }
            #___private_allowDblclickClear_9 = _init_allowDblclickClear(this, false);
            get allowDblclickClear() {
                return this.#___private_allowDblclickClear_9;
            }
            set allowDblclickClear(_v) {
                this.#___private_allowDblclickClear_9 = _v;
            }
            _observer;
            _initialValue = '';
            connectedCallback() {
                super.connectedCallback();
                this._initialValue = this.getAttribute('value') ?? '';
                // Set up MutationObserver to react to child vi-radio nodes added/removed dynamically
                this._observer = new MutationObserver(()=>{
                    this._updateRadios();
                });
                this._observer.observe(this, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: [
                        'disabled'
                    ]
                });
                // Sync initial state of child radios
                this._updateRadios();
                // Listen for double-clicks on the host to support clearing
                this.addEventListener('dblclick', this._onDblclick);
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                if (this._observer) {
                    this._observer.disconnect();
                }
                this.removeEventListener('dblclick', this._onDblclick);
            }
            updated(changed) {
                super.updated(changed);
                if (changed.has('value')) {
                    this._internals.setFormValue(this.value);
                }
                if (changed.has('value') || changed.has('name') || changed.has('disabled') || changed.has('required') || changed.has('size')) {
                    this._updateRadios();
                }
            }
            /** Resets the value and validation state when the parent form resets. */ formResetCallback() {
                this.value = this._initialValue;
                this.status = 'default';
                this.validityMessage = '';
                this._updateRadios();
            }
            /** Keeps disabled in sync when a containing fieldset/form is disabled. */ formDisabledCallback(disabled) {
                this.disabled = disabled;
            }
            _testValidity() {
                if (this.required && !this.value) {
                    const radios = this._getRadios();
                    if (radios.length > 0) {
                        const firstInput = radios[0].shadowRoot?.querySelector('input');
                        if (firstInput) {
                            const wasRequired = firstInput.required;
                            firstInput.required = true;
                            this.validityMessage = firstInput.validationMessage;
                            firstInput.required = wasRequired;
                            return {
                                valueMissing: true
                            };
                        }
                    }
                    const temp = document.createElement('input');
                    temp.type = 'radio';
                    temp.name = 'temp-radio-group';
                    temp.required = true;
                    this.appendChild(temp);
                    this.validityMessage = temp.validationMessage;
                    this.removeChild(temp);
                    return {
                        valueMissing: true
                    };
                }
                return {};
            }
            // ── Helper methods ─────────────────────────────────────────────────────────
            _getRadios() {
                return Array.from(this.querySelectorAll('vi-radio'));
            }
            _updateRadios() {
                const radios = this._getRadios();
                // 1. Propagate name, checked, and size attributes to children
                radios.forEach((radio)=>{
                    if (this.name && radio.name !== this.name) {
                        radio.name = this.name;
                    }
                    if (this.size && radio.size !== this.size) {
                        radio.size = this.size;
                    }
                    const shouldBeChecked = this.value !== '' && radio.value === this.value;
                    if (radio.checked !== shouldBeChecked) {
                        radio.checked = shouldBeChecked;
                    }
                    // Let children recalculate their disabled states
                    radio.requestUpdate();
                });
                // 2. Roving tabindex active node determination:
                // - The checked radio (if enabled)
                // - The first enabled radio
                // - Fallback to the first radio
                let activeRadio = radios.find((r)=>r.checked && !r.disabled && !this.disabled);
                if (!activeRadio) {
                    activeRadio = radios.find((r)=>!r.disabled && !this.disabled);
                }
                if (!activeRadio && radios.length > 0) {
                    activeRadio = radios[0];
                }
                radios.forEach((radio)=>{
                    const isRadioActive = radio === activeRadio;
                    radio.tabIndex = isRadioActive && !this.disabled && !radio.disabled ? 0 : -1;
                });
            }
            // ── Event Handlers ─────────────────────────────────────────────────────────
            _handleRadioChecked(e) {
                const targetRadio = e.target;
                if (this.disabled) return;
                const oldValue = this.value;
                this.value = targetRadio.value;
                this._updateRadios();
                if (this.value !== oldValue) {
                    this.dispatchEvent(new CustomEvent('vi-radio-group-change', {
                        detail: {
                            value: this.value
                        },
                        bubbles: true,
                        composed: true
                    }));
                }
            }
            _onKeydown(e) {
                if (this.disabled) return;
                const radios = this._getRadios().filter((r)=>!r.disabled);
                if (radios.length === 0) return;
                const eventTarget = e.target;
                // Find index of the child radio that received the keydown event
                const currentIndex = radios.findIndex((r)=>r === eventTarget || r.contains(eventTarget));
                if (currentIndex === -1) return;
                let nextIndex = currentIndex;
                let shouldPreventDefault = false;
                switch(e.key){
                    case 'ArrowDown':
                    case 'ArrowRight':
                        nextIndex = (currentIndex + 1) % radios.length;
                        shouldPreventDefault = true;
                        break;
                    case 'ArrowUp':
                    case 'ArrowLeft':
                        nextIndex = (currentIndex - 1 + radios.length) % radios.length;
                        shouldPreventDefault = true;
                        break;
                    case ' ':
                        nextIndex = currentIndex;
                        shouldPreventDefault = true;
                        break;
                    default:
                        return;
                }
                if (shouldPreventDefault) {
                    e.preventDefault();
                }
                const targetRadio = radios[nextIndex];
                if (targetRadio) {
                    const oldValue = this.value;
                    this.value = targetRadio.value;
                    this._updateRadios();
                    targetRadio.focus();
                    if (this.value !== oldValue) {
                        this.dispatchEvent(new CustomEvent('vi-radio-group-change', {
                            detail: {
                                value: this.value
                            },
                            bubbles: true,
                            composed: true
                        }));
                    }
                }
            }
            _onDblclick = (e)=>{
                if (this.disabled || !this.allowDblclickClear) return;
                const targetRadio = e.target.closest('vi-radio');
                if (!targetRadio || targetRadio.disabled) return;
                if (targetRadio.checked && this.value === targetRadio.value) {
                    const oldValue = this.value;
                    this.value = '';
                    this._updateRadios();
                    if (this.value !== oldValue) {
                        this.dispatchEvent(new CustomEvent('vi-radio-group-change', {
                            detail: {
                                value: this.value
                            },
                            bubbles: true,
                            composed: true
                        }));
                    }
                }
            };
            // ── Render ─────────────────────────────────────────────────────────────────
            get _validationMessage() {
                if (!this.validityMessage) return b``;
                const cls = this.status === 'invalid' ? 'radio-group-validation--invalid' : this.status === 'valid' ? 'radio-group-validation--valid' : '';
                return b`
      <span
        id="validation-message"
        class="radio-group-validation ${cls}"
        part="validation"
        role="alert"
        aria-live="polite"
      >
        ${this.validityMessage}
      </span>
    `;
            }
            render() {
                const { required, status, orientation } = this;
                return b`
      <fieldset
        class="radio-group"
        role="radiogroup"
        aria-required=${required ? 'true' : 'false'}
        aria-invalid=${status === 'invalid' ? 'true' : 'false'}
        aria-describedby=${this.validityMessage ? 'validation-message' : undefined}
        aria-errormessage=${status === 'invalid' && this.validityMessage ? 'validation-message' : undefined}
        @vi-radio-checked=${this._handleRadioChecked}
        @keydown=${this._onKeydown}
      >
        <legend class="radio-group-legend" part="legend">
          <slot name="label"></slot>
        </legend>
        <div
          class="radio-group-items"
          part="items"
          orientation=${orientation}
        >
          <slot></slot>
        </div>
        <div class="radio-group-helper" part="helper">
          <slot name="helper"></slot>
        </div>
        ${this._validationMessage}
      </fieldset>
    `;
            }
        }
    }
}();

const meta = {
    title: 'Components/Radio',
    tags: [
        'autodocs'
    ],
    argTypes: {
        name: {
            control: 'text',
            description: 'Shared name attribute for form submission'
        },
        value: {
            control: 'text',
            description: 'The selected radio button value'
        },
        orientation: {
            control: 'select',
            options: [
                'vertical',
                'horizontal'
            ],
            description: 'Layout direction of the group items'
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the entire group'
        },
        required: {
            control: 'boolean',
            description: 'Whether a selection is required'
        },
        status: {
            control: 'select',
            options: [
                'default',
                'valid',
                'invalid'
            ],
            description: 'Visual validation status of the group'
        },
        validityMessage: {
            name: 'validity-message',
            control: 'text',
            description: 'Error or success message shown below the group'
        },
        allowDblclickClear: {
            name: 'allow-dblclick-clear',
            control: 'boolean',
            description: 'Allows clearing the selected radio button on double click'
        },
        size: {
            control: 'select',
            options: [
                'xs',
                'sm',
                'md',
                'lg'
            ],
            description: 'Size scale of the radio group'
        }
    },
    args: {
        name: 'adverseEvent',
        value: 'no',
        orientation: 'vertical',
        disabled: false,
        required: false,
        status: 'default',
        validityMessage: '',
        allowDblclickClear: true,
        size: 'md'
    },
    render: (args)=>{
        // Storybook sets arguments using the custom name key if provided (kebab-case)
        const validityMessage = args['validity-message'] ?? args.validityMessage;
        const allowDblclickClear = args['allow-dblclick-clear'] ?? args.allowDblclickClear;
        return b`
      <vi-radio-group
        name=${args.name}
        .value=${args.value}
        orientation=${args.orientation}
        ?disabled=${args.disabled}
        ?required=${args.required}
        status=${args.status}
        validity-message=${validityMessage}
        ?allow-dblclick-clear=${allowDblclickClear}
        size=${args.size}
      >
        <span slot="label">${args.label ?? 'Was there an adverse event?'}</span>
        ${args.content ?? b`
          <vi-radio value="yes">Yes</vi-radio>
          <vi-radio value="no">No</vi-radio>
          <vi-radio value="unknown">Unknown</vi-radio>
        `}
      </vi-radio-group>
    `;
    }
};
const RadioGroup = {
    name: 'Standard Radio Group'
};
const Horizontal = {
    name: 'Horizontal Layout',
    args: {
        name: 'severity',
        value: '2',
        orientation: 'horizontal',
        disabled: false,
        label: 'Select Severity Grade:',
        content: b`
      <vi-radio value="1">Mild</vi-radio>
      <vi-radio value="2">Moderate</vi-radio>
      <vi-radio value="3">Severe</vi-radio>
    `
    },
    argTypes: {
        orientation: {
            table: {
                disable: true
            }
        }
    }
};
const Disabled = {
    name: 'Disabled Group',
    args: {
        name: 'gender',
        value: 'female',
        disabled: true,
        label: 'Sex at Birth (Locked):',
        content: b`
      <vi-radio value="male">Male</vi-radio>
      <vi-radio value="female">Female</vi-radio>
      <vi-radio value="unknown">Unknown</vi-radio>
    `
    },
    argTypes: {
        disabled: {
            table: {
                disable: true
            }
        }
    }
};
const InvalidState = {
    name: 'Invalid with Validity Message',
    args: {
        name: 'visitType',
        value: '',
        status: 'invalid',
        validityMessage: 'Selection is required.',
        label: 'Visit Type:',
        content: b`
      <vi-radio value="screening">Screening</vi-radio>
      <vi-radio value="baseline">Baseline</vi-radio>
      <vi-radio value="followup">Follow-up</vi-radio>
    `
    },
    argTypes: {
        status: {
            table: {
                disable: true
            }
        },
        validityMessage: {
            table: {
                disable: true
            }
        }
    }
};
const DisabledOptions = {
    name: 'Individual Disabled Options',
    args: {
        name: 'paymentMethod',
        value: 'credit-card',
        content: b`
      <vi-radio value="credit-card">Credit Card</vi-radio>
      <vi-radio value="paypal" disabled>PayPal (Under Maintenance)</vi-radio>
      <vi-radio value="apple-pay">Apple Pay</vi-radio>
    `
    }
};
const Sizes = {
    name: 'Radio Group Sizes',
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <vi-radio-group name="size-xs" size="xs">
        <span slot="label">Extra Small (xs)</span>
        <vi-radio value="1">Yes</vi-radio>
        <vi-radio value="2">No</vi-radio>
      </vi-radio-group>
      
      <vi-radio-group name="size-sm" size="sm">
        <span slot="label">Small (sm)</span>
        <vi-radio value="1">Yes</vi-radio>
        <vi-radio value="2">No</vi-radio>
      </vi-radio-group>

      <vi-radio-group name="size-md" size="md">
        <span slot="label">Medium (md)</span>
        <vi-radio value="1">Yes</vi-radio>
        <vi-radio value="2">No</vi-radio>
      </vi-radio-group>

      <vi-radio-group name="size-lg" size="lg">
        <span slot="label">Large (lg)</span>
        <vi-radio value="1">Yes</vi-radio>
        <vi-radio value="2">No</vi-radio>
      </vi-radio-group>
    </div>
  `
};
RadioGroup.parameters = {
    ...RadioGroup.parameters,
    docs: {
        ...RadioGroup.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Standard Radio Group'\n}",
            ...RadioGroup.parameters?.docs?.source
        }
    }
};
Horizontal.parameters = {
    ...Horizontal.parameters,
    docs: {
        ...Horizontal.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Horizontal Layout',\n  args: {\n    name: 'severity',\n    value: '2',\n    orientation: 'horizontal',\n    disabled: false,\n    label: 'Select Severity Grade:',\n    content: html`\n      <vi-radio value=\"1\">Mild</vi-radio>\n      <vi-radio value=\"2\">Moderate</vi-radio>\n      <vi-radio value=\"3\">Severe</vi-radio>\n    `\n  },\n  argTypes: {\n    orientation: {\n      table: {\n        disable: true\n      }\n    }\n  }\n}",
            ...Horizontal.parameters?.docs?.source
        }
    }
};
Disabled.parameters = {
    ...Disabled.parameters,
    docs: {
        ...Disabled.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Disabled Group',\n  args: {\n    name: 'gender',\n    value: 'female',\n    disabled: true,\n    label: 'Sex at Birth (Locked):',\n    content: html`\n      <vi-radio value=\"male\">Male</vi-radio>\n      <vi-radio value=\"female\">Female</vi-radio>\n      <vi-radio value=\"unknown\">Unknown</vi-radio>\n    `\n  },\n  argTypes: {\n    disabled: {\n      table: {\n        disable: true\n      }\n    }\n  }\n}",
            ...Disabled.parameters?.docs?.source
        }
    }
};
InvalidState.parameters = {
    ...InvalidState.parameters,
    docs: {
        ...InvalidState.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Invalid with Validity Message',\n  args: {\n    name: 'visitType',\n    value: '',\n    status: 'invalid',\n    validityMessage: 'Selection is required.',\n    label: 'Visit Type:',\n    content: html`\n      <vi-radio value=\"screening\">Screening</vi-radio>\n      <vi-radio value=\"baseline\">Baseline</vi-radio>\n      <vi-radio value=\"followup\">Follow-up</vi-radio>\n    `\n  },\n  argTypes: {\n    status: {\n      table: {\n        disable: true\n      }\n    },\n    validityMessage: {\n      table: {\n        disable: true\n      }\n    }\n  }\n}",
            ...InvalidState.parameters?.docs?.source
        }
    }
};
DisabledOptions.parameters = {
    ...DisabledOptions.parameters,
    docs: {
        ...DisabledOptions.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Individual Disabled Options',\n  args: {\n    name: 'paymentMethod',\n    value: 'credit-card',\n    content: html`\n      <vi-radio value=\"credit-card\">Credit Card</vi-radio>\n      <vi-radio value=\"paypal\" disabled>PayPal (Under Maintenance)</vi-radio>\n      <vi-radio value=\"apple-pay\">Apple Pay</vi-radio>\n    `\n  }\n}",
            ...DisabledOptions.parameters?.docs?.source
        }
    }
};
Sizes.parameters = {
    ...Sizes.parameters,
    docs: {
        ...Sizes.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Radio Group Sizes',\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 24px;\">\n      <vi-radio-group name=\"size-xs\" size=\"xs\">\n        <span slot=\"label\">Extra Small (xs)</span>\n        <vi-radio value=\"1\">Yes</vi-radio>\n        <vi-radio value=\"2\">No</vi-radio>\n      </vi-radio-group>\n      \n      <vi-radio-group name=\"size-sm\" size=\"sm\">\n        <span slot=\"label\">Small (sm)</span>\n        <vi-radio value=\"1\">Yes</vi-radio>\n        <vi-radio value=\"2\">No</vi-radio>\n      </vi-radio-group>\n\n      <vi-radio-group name=\"size-md\" size=\"md\">\n        <span slot=\"label\">Medium (md)</span>\n        <vi-radio value=\"1\">Yes</vi-radio>\n        <vi-radio value=\"2\">No</vi-radio>\n      </vi-radio-group>\n\n      <vi-radio-group name=\"size-lg\" size=\"lg\">\n        <span slot=\"label\">Large (lg)</span>\n        <vi-radio value=\"1\">Yes</vi-radio>\n        <vi-radio value=\"2\">No</vi-radio>\n      </vi-radio-group>\n    </div>\n  `\n}",
            ...Sizes.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["RadioGroup","Horizontal","Disabled","InvalidState","DisabledOptions","Sizes"];

export { Disabled, DisabledOptions, Horizontal, InvalidState, RadioGroup, Sizes, __namedExportsOrder, meta as default };
