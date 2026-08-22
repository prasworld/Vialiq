import { r as r$1, i, b } from './iframe-zB6pr_f6.js';
import { V as ViElement, t, n } from './vi-element-a2kLkRVs.js';
import { r } from './state-d7gzgjQG.js';
import { F as FocusableMixin } from './focusable-mixin-CmxOyPX5.js';
import './vi-icon-DR7br-ZW.js';
import './vi-button-BH89mbRB.js';

const chipStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.chip,button{display:inline-flex;align-items:center;box-sizing:border-box;cursor:pointer;-webkit-user-select:none;user-select:none;vertical-align:middle;outline:none;border-style:solid;height:var(--vi-chip-height, var(--vi-chip-height-md, 32px));padding:var(--vi-chip-padding, 0 10px);border-radius:var(--vi-chip-border-radius, 999px);border-width:var(--vi-chip-border-width, 1px);gap:var(--vi-chip-gap, 6px);font-size:var(--vi-chip-font-size, var(--vi-font-size-sm));font-weight:var(--vi-chip-font-weight, var(--vi-font-weight-medium));transition:all var(--vi-chip-transition, .1s ease);background-color:var(--vi-chip-bg-color, var(--vi-layer-02, #f3f4f6));border-color:var(--vi-chip-border-color, var(--vi-border-03, #e0e0e0));color:var(--vi-chip-text-color, var(--vi-color-foreground, #111827))}.chip:focus-visible,button:focus-visible{outline:var(--vi-border-width-base, 2px) solid var(--vi-chip-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:0;box-shadow:0 0 0 3px var(--vi-chip-focus-ring-glow, var(--vi-color-blue-200, #cee6ff))}.chip[aria-disabled=true],button[aria-disabled=true]{cursor:not-allowed}.chip-avatar{display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:50%;width:calc(100% - 8px);height:calc(100% - 8px);margin-inline-start:-4px}.chip-icon{display:inline-flex;align-items:center}.chip-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.chip-group{display:flex;align-items:center}}:host{display:inline-block;vertical-align:middle}:host([hidden]){display:none!important}:host([size=sm]) button{--vi-chip-height: var(--vi-chip-height-sm);--vi-chip-font-size: var(--vi-font-size-xs);--vi-chip-padding: 0 8px}:host([size=md]) button{--vi-chip-height: var(--vi-chip-height-md);--vi-chip-font-size: var(--vi-font-size-sm);--vi-chip-padding: 0 10px}:host([size=lg]) button{--vi-chip-height: var(--vi-chip-height-lg);--vi-chip-font-size: var(--vi-font-size-base);--vi-chip-padding: 0 12px}:host([variant=neutral]) button{--vi-chip-bg-color: var(--vi-color-grey-100, #f5f5f5);--vi-chip-border-color: var(--vi-color-grey-300, #e0e0e0);--vi-chip-text-color: var(--vi-color-grey-700, #616161)}:host([variant=neutral]:not([disabled])) button:hover{--vi-chip-bg-color: var(--vi-color-grey-200, #eeeeee);--vi-chip-border-color: var(--vi-color-grey-400, #bdbdbd);--vi-chip-text-color: var(--vi-color-grey-900, #212121)}:host([variant=neutral][selected]) button{--vi-chip-bg-color: var(--vi-color-primary, #3676d0);--vi-chip-border-color: var(--vi-color-primary, #3676d0);--vi-chip-text-color: var(--vi-text-primary-inverse, #ffffff)}:host([variant=neutral][selected]:not([disabled])) button:hover{--vi-chip-bg-color: var(--vi-color-blue-800, #2d5fa8);--vi-chip-border-color: var(--vi-color-blue-800, #2d5fa8)}:host([variant=primary]) button{--vi-chip-bg-color: var(--vi-bg-info, #e3f2fd);--vi-chip-border-color: var(--vi-bg-info, #e3f2fd);--vi-chip-text-color: var(--vi-text-info, #3676d0)}:host([variant=primary]:not([disabled])) button:hover{--vi-chip-bg-color: var(--vi-color-blue-100, #ebf5ff);--vi-chip-border-color: var(--vi-color-blue-200, #cee6ff)}:host([variant=primary][selected]) button{--vi-chip-bg-color: var(--vi-color-info, #3676d0);--vi-chip-border-color: var(--vi-color-info, #3676d0);--vi-chip-text-color: var(--vi-text-primary-inverse, #ffffff)}:host([variant=success]) button{--vi-chip-bg-color: var(--vi-bg-success, #e6f9f0);--vi-chip-border-color: var(--vi-bg-success, #e6f9f0);--vi-chip-text-color: var(--vi-text-success, #265a3d)}:host([variant=success]:not([disabled])) button:hover{--vi-chip-bg-color: var(--vi-color-green-100, #e6f0eb);--vi-chip-border-color: var(--vi-color-green-200, #c0dbcd)}:host([variant=success][selected]) button{--vi-chip-bg-color: var(--vi-color-success, #489167);--vi-chip-border-color: var(--vi-color-success, #489167);--vi-chip-text-color: var(--vi-text-primary-inverse, #ffffff)}:host([variant=warning]) button{--vi-chip-bg-color: var(--vi-bg-warning, #fff8e1);--vi-chip-border-color: var(--vi-bg-warning, #fff8e1);--vi-chip-text-color: var(--vi-text-warning, #e68300)}:host([variant=warning]:not([disabled])) button:hover{--vi-chip-bg-color: var(--vi-color-yellow-100, #ffeab1);--vi-chip-border-color: var(--vi-color-yellow-200, #ffde85)}:host([variant=warning][selected]) button{--vi-chip-bg-color: var(--vi-color-warning, #ffba00);--vi-chip-border-color: var(--vi-color-warning, #ffba00);--vi-chip-text-color: var(--vi-text-primary-inverse, #ffffff)}:host([variant=danger]) button{--vi-chip-bg-color: var(--vi-bg-error, #ffebee);--vi-chip-border-color: var(--vi-bg-error, #ffebee);--vi-chip-text-color: var(--vi-text-error, #db231b)}:host([variant=danger]:not([disabled])) button:hover{--vi-chip-bg-color: var(--vi-color-red-100, #ffccce);--vi-chip-border-color: var(--vi-color-red-200, #f69892)}:host([variant=danger][selected]) button{--vi-chip-bg-color: var(--vi-color-error, #ef4444);--vi-chip-border-color: var(--vi-color-error, #ef4444);--vi-chip-text-color: var(--vi-text-primary-inverse, #ffffff)}:host([variant=info]) button{--vi-chip-bg-color: var(--vi-bg-info, #e3f2fd);--vi-chip-border-color: var(--vi-bg-info, #e3f2fd);--vi-chip-text-color: var(--vi-text-info, #3676d0)}:host([variant=info]:not([disabled])) button:hover{--vi-chip-bg-color: var(--vi-color-blue-100, #ebf5ff);--vi-chip-border-color: var(--vi-color-blue-200, #cee6ff)}:host([variant=info][selected]) button{--vi-chip-bg-color: var(--vi-color-info, #3676d0);--vi-chip-border-color: var(--vi-color-info, #3676d0);--vi-chip-text-color: var(--vi-text-primary-inverse, #ffffff)}:host([disabled]) button{--vi-chip-bg-color: var(--vi-color-grey-50, #fafafa);--vi-chip-border-color: var(--vi-color-grey-200, #eeeeee);--vi-chip-text-color: var(--vi-color-grey-300, #e0e0e0)}.chip-avatar[hidden],.chip-icon[hidden],::slotted([slot=trailing-icon][hidden]){display:none!important}vi-button[part=remove-btn]{margin-inline-start:4px;margin-inline-end:-6px;border-radius:50%;color:inherit}";

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
var _dec, _initClass, _FocusableMixin, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, /** Value for group selection tracking. */ _init_value, /** Selected / active state. */ _init_selected, /** Disables the chip. */ _init_disabled, /** Show × remove button. */ _init_removable, /** Screen reader text for the remove button (default: 'Remove') */ _init_removeAriaLabel, /** Base colour. */ _init_variant, /** Chip size. */ _init_size, _init__inGroup, _init__hasAvatar, _init__hasIcon, _init__hasTrailingIcon, _initProto;
let _ViChip;
_dec = t('vi-chip'), _dec1 = n({
    type: String,
    reflect: true
}), _dec2 = n({
    type: Boolean,
    reflect: true
}), _dec3 = n({
    type: Boolean,
    reflect: true
}), _dec4 = n({
    type: Boolean,
    reflect: true
}), _dec5 = n({
    type: String,
    attribute: 'remove-aria-label'
}), _dec6 = n({
    type: String,
    reflect: true
}), _dec7 = n({
    type: String,
    reflect: true
}), _dec8 = r(), _dec9 = r(), _dec10 = r(), _dec11 = r();
new class extends _identity {
    constructor(){
        super(_ViChip), _initClass();
    }
    static{
        class ViChip extends (_FocusableMixin = FocusableMixin(ViElement)) {
            static{
                ({ e: [_init_value, _init_selected, _init_disabled, _init_removable, _init_removeAriaLabel, _init_variant, _init_size, _init__inGroup, _init__hasAvatar, _init__hasIcon, _init__hasTrailingIcon, _initProto], c: [_ViChip, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "value"
                    ],
                    [
                        _dec2,
                        1,
                        "selected"
                    ],
                    [
                        _dec3,
                        1,
                        "disabled"
                    ],
                    [
                        _dec4,
                        1,
                        "removable"
                    ],
                    [
                        _dec5,
                        1,
                        "removeAriaLabel"
                    ],
                    [
                        _dec6,
                        1,
                        "variant"
                    ],
                    [
                        _dec7,
                        1,
                        "size"
                    ],
                    [
                        _dec8,
                        1,
                        "_inGroup"
                    ],
                    [
                        _dec9,
                        1,
                        "_hasAvatar"
                    ],
                    [
                        _dec10,
                        1,
                        "_hasIcon"
                    ],
                    [
                        _dec11,
                        1,
                        "_hasTrailingIcon"
                    ]
                ], [
                    _dec
                ], _FocusableMixin));
            }
            static styles = i`${r$1(chipStyles)}`;
            get _focusableElement() {
                return this.shadowRoot?.querySelector('button') ?? null;
            }
            #___private_value_1 = (_initProto(this), _init_value(this, ''));
            get value() {
                return this.#___private_value_1;
            }
            set value(_v) {
                this.#___private_value_1 = _v;
            }
            #___private_selected_2 = _init_selected(this, false);
            get selected() {
                return this.#___private_selected_2;
            }
            set selected(_v) {
                this.#___private_selected_2 = _v;
            }
            #___private_disabled_3 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_3;
            }
            set disabled(_v) {
                this.#___private_disabled_3 = _v;
            }
            #___private_removable_4 = _init_removable(this, false);
            get removable() {
                return this.#___private_removable_4;
            }
            set removable(_v) {
                this.#___private_removable_4 = _v;
            }
            #___private_removeAriaLabel_5 = _init_removeAriaLabel(this, 'Remove');
            get removeAriaLabel() {
                return this.#___private_removeAriaLabel_5;
            }
            set removeAriaLabel(_v) {
                this.#___private_removeAriaLabel_5 = _v;
            }
            #___private_variant_6 = _init_variant(this, 'neutral');
            get variant() {
                return this.#___private_variant_6;
            }
            set variant(_v) {
                this.#___private_variant_6 = _v;
            }
            #___private_size_7 = _init_size(this, 'md');
            get size() {
                return this.#___private_size_7;
            }
            set size(_v) {
                this.#___private_size_7 = _v;
            }
            #___private__inGroup_8 = _init__inGroup(this, false);
            get _inGroup() {
                return this.#___private__inGroup_8;
            }
            set _inGroup(_v) {
                this.#___private__inGroup_8 = _v;
            }
            #___private__hasAvatar_9 = _init__hasAvatar(this, false);
            get _hasAvatar() {
                return this.#___private__hasAvatar_9;
            }
            set _hasAvatar(_v) {
                this.#___private__hasAvatar_9 = _v;
            }
            #___private__hasIcon_10 = _init__hasIcon(this, false);
            get _hasIcon() {
                return this.#___private__hasIcon_10;
            }
            set _hasIcon(_v) {
                this.#___private__hasIcon_10 = _v;
            }
            #___private__hasTrailingIcon_11 = _init__hasTrailingIcon(this, false);
            get _hasTrailingIcon() {
                return this.#___private__hasTrailingIcon_11;
            }
            set _hasTrailingIcon(_v) {
                this.#___private__hasTrailingIcon_11 = _v;
            }
            connectedCallback() {
                super.connectedCallback();
                this._inGroup = this.closest('vi-chip-group') !== null;
                this._syncSlotsFromLightDom();
            }
            firstUpdated(changed) {
                super.firstUpdated(changed);
                this._syncSlots();
            }
            updated(changed) {
                super.updated(changed);
                if (changed.has('disabled')) {
                    if (this.disabled) {
                        this._setHostFocusable(false);
                    } else if (changed.get('disabled') !== undefined) {
                        this._setHostFocusable(true);
                    }
                }
            }
            _syncSlotsFromLightDom() {
                if (this.querySelector('[slot="avatar"]')) this._hasAvatar = true;
                if (this.querySelector('[slot="icon"]')) this._hasIcon = true;
                if (this.querySelector('[slot="trailing-icon"]')) this._hasTrailingIcon = true;
            }
            _syncSlots() {
                const avatarSlot = this.shadowRoot?.querySelector('slot[name="avatar"]');
                const iconSlot = this.shadowRoot?.querySelector('slot[name="icon"]');
                const trailingSlot = this.shadowRoot?.querySelector('slot[name="trailing-icon"]');
                if (avatarSlot) {
                    this._hasAvatar = avatarSlot.assignedElements({
                        flatten: true
                    }).length > 0;
                }
                if (iconSlot) {
                    this._hasIcon = iconSlot.assignedElements({
                        flatten: true
                    }).length > 0;
                }
                if (trailingSlot) {
                    this._hasTrailingIcon = trailingSlot.assignedElements({
                        flatten: true
                    }).length > 0;
                }
            }
            onAvatarSlotChange(e) {
                const slot = e.target;
                this._hasAvatar = slot.assignedElements({
                    flatten: true
                }).length > 0;
            }
            onIconSlotChange(e) {
                const slot = e.target;
                this._hasIcon = slot.assignedElements({
                    flatten: true
                }).length > 0;
            }
            onTrailingIconSlotChange(e) {
                const slot = e.target;
                this._hasTrailingIcon = slot.assignedElements({
                    flatten: true
                }).length > 0;
            }
            _handleSelect(e) {
                if (this.disabled) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }
                this.dispatchEvent(new CustomEvent('vi-chip-select', {
                    detail: {
                        value: this.value,
                        selected: !this.selected
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            _handleRemove(e) {
                if (this.disabled) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }
                e.stopPropagation();
                this.dispatchEvent(new CustomEvent('vi-chip-remove', {
                    detail: {
                        value: this.value
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            _handleKeyDown(e) {
                if (this.disabled) return;
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this._handleSelect(e);
                } else if (this.removable && (e.key === 'Backspace' || e.key === 'Delete')) {
                    e.preventDefault();
                    this._handleRemove(e);
                }
            }
            render() {
                const role = this._inGroup ? 'option' : 'button';
                const ariaSelected = this._inGroup ? this.selected ? 'true' : 'false' : null;
                const ariaPressed = !this._inGroup ? this.selected ? 'true' : 'false' : null;
                return b`
      <button
        part="chip"
        type="button"
        role=${role}
        aria-selected=${ariaSelected ?? undefined}
        aria-pressed=${ariaPressed ?? undefined}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        tabindex=${this.disabled ? -1 : 0}
        @click=${this._handleSelect}
        @keydown=${this._handleKeyDown}
      >
        <slot name="avatar" class="chip-avatar" @slotchange=${this.onAvatarSlotChange} ?hidden=${!this._hasAvatar}></slot>
        <slot name="icon" class="chip-icon" @slotchange=${this.onIconSlotChange} ?hidden=${this._hasAvatar || !this._hasIcon}></slot>

        ${this.selected ? b`<vi-icon part="check-icon" name="check" size="12"></vi-icon>` : ''}

        <span part="label" class="chip-label">
          <slot></slot>
        </span>

        <slot name="trailing-icon" @slotchange=${this.onTrailingIconSlotChange} ?hidden=${!this._hasTrailingIcon}></slot>

        ${this.removable ? b`
          <vi-button
            part="remove-btn"
            variant="ghost"
            size="xs"
            icon-only
            aria-label=${this.removeAriaLabel || 'Remove'}
            @click=${this._handleRemove}
            tabindex=${this.disabled ? -1 : 0}
          >
            <vi-icon name="x" size="12" slot="icon"></vi-icon>
          </vi-button>
        ` : ''}
      </button>
    `;
            }
        }
    }
}();
