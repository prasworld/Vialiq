import { r as r$1, i, b } from './iframe-DnETEnWs.js';
import { V as ViElement, t, n } from './vi-element-BZnLtp_v.js';
import { r } from './state-gKBTU9MN.js';
import './vi-icon-CMuoIGIF.js';
import './vi-button-CfSvKrzB.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import { c as checkCircleIcon, t as triangleWarningIcon, i as infoIcon } from './triangle-warning-BY6LbiCU.js';
import { l as lockIcon } from './lock-CCJyCMJ1.js';
import { x as xIcon } from './x-3JmBhc9n.js';

const alertStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.alert-root{display:flex;align-items:flex-start;box-sizing:border-box;width:100%;border-radius:var(--vi-alert-border-radius, 6px);padding:var(--vi-alert-padding, 12px 16px);gap:var(--vi-alert-gap, 12px);border-width:var(--vi-alert-border-width, 1px);border-style:solid;font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-font-size-sm, 14px);line-height:var(--vi-line-height-normal, 1.5)}.alert-icon{display:flex;align-items:center;justify-content:center;flex-shrink:0;padding-top:2px}.alert-content{display:flex;flex-direction:column;flex-grow:1;min-width:0}.alert-title{font-weight:var(--vi-font-weight-semibold, 600);margin-bottom:4px;display:block}.alert-actions{display:flex;align-items:center;gap:var(--vi-spacing-xs, 8px);margin-top:var(--vi-spacing-sm, 16px)}}:host{display:block;width:100%}:host([floating]){position:absolute;top:0;left:0;right:0;z-index:var(--vi-alert-floating-z-index, var(--vi-alert-floating-z-index, 1080));box-shadow:var(--vi-alert-floating-shadow, 0 4px 12px rgba(0, 0, 0, .12))}:host([hidden]){display:none!important}.alert-root{overflow:hidden}.alert-root[data-variant=neutral]{background-color:var(--vi-alert-neutral-bg, var(--vi-layer-02, #f3f4f6));border-color:var(--vi-alert-neutral-border, var(--vi-border-04, #bdbdbd));color:var(--vi-alert-neutral-text-color, var(--vi-text-primary, #111827))}.alert-root[data-variant=neutral] .alert-title{color:var(--vi-alert-neutral-title-color, var(--vi-text-primary, #111827))}.alert-root[data-variant=neutral] .alert-icon{color:var(--vi-alert-neutral-icon-color, var(--vi-text-secondary, #4b5563))}.alert-root[data-variant=info]{background-color:var(--vi-alert-info-bg, var(--vi-bg-info, #e3f2fd));border-color:var(--vi-alert-info-border, var(--vi-color-info, #3676d0));color:var(--vi-alert-info-text-color, var(--vi-text-info, #3676d0))}.alert-root[data-variant=info] .alert-title{color:var(--vi-alert-info-title-color, var(--vi-text-info, #3676d0))}.alert-root[data-variant=info] .alert-icon{color:var(--vi-alert-info-icon-color, var(--vi-color-info, #3676d0))}.alert-root[data-variant=success]{background-color:var(--vi-alert-success-bg, var(--vi-bg-success, #e6f9f0));border-color:var(--vi-alert-success-border, var(--vi-color-success, #489167));color:var(--vi-alert-success-text-color, var(--vi-text-success, #265a3d))}.alert-root[data-variant=success] .alert-title{color:var(--vi-alert-success-title-color, var(--vi-text-success, #265a3d))}.alert-root[data-variant=success] .alert-icon{color:var(--vi-alert-success-icon-color, var(--vi-color-success, #489167))}.alert-root[data-variant=warning]{background-color:var(--vi-alert-warning-bg, var(--vi-bg-warning, #fff8e1));border-color:var(--vi-alert-warning-border, var(--vi-color-warning, #ffba00));color:var(--vi-alert-warning-text-color, var(--vi-text-warning, #e68300))}.alert-root[data-variant=warning] .alert-title{color:var(--vi-alert-warning-title-color, var(--vi-text-warning, #e68300))}.alert-root[data-variant=warning] .alert-icon{color:var(--vi-alert-warning-icon-color, var(--vi-color-warning, #ffba00))}.alert-root[data-variant=danger]{background-color:var(--vi-alert-danger-bg, var(--vi-bg-error, #ffebee));border-color:var(--vi-alert-danger-border, var(--vi-color-error, #ef4444));color:var(--vi-alert-danger-text-color, var(--vi-text-error, #db231b))}.alert-root[data-variant=danger] .alert-title{color:var(--vi-alert-danger-title-color, var(--vi-text-error, #db231b))}.alert-root[data-variant=danger] .alert-icon{color:var(--vi-alert-danger-icon-color, var(--vi-color-error, #ef4444))}vi-icon,::slotted(vi-icon),::slotted(svg){--vi-icon-size: 1.25em;width:1.25em;height:1.25em}vi-button[part=close-btn]{margin-top:-4px;margin-right:-4px;margin-left:4px}";

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
var _dec, _initClass, _ViElement, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, /** Colour, icon, ARIA role */ _init_variant, /** Bold headline (optional) */ _init_title, /** Show × dismiss button */ _init_dismissible, /** Accessible label for the dismiss button */ _init_dismissLabel, /**
   * Enables auto-hiding after a duration (default: 5000ms).
   * Note: Setting a positive `duration` or `auto-hide-duration` also implicitly enables auto-hiding.
   */ _init_autoHide, /** Auto hide duration in milliseconds (default: 5000ms) */ _init_autoHideDuration, /**
   * Alias for auto-hide-duration in milliseconds.
   * Setting a positive duration enables auto-hiding automatically.
   */ _init_duration, /** Override the default status icon name */ _init_icon, /** Controls whether the alert is displayed */ _init_open, /** Position alert absolutely over parent container without pushing layout */ _init_floating, /** Hide the icon */ _init_noIcon, _init__hasTitleSlot, _init__hasActionsSlot, _initProto;
registerIcons([
    checkCircleIcon,
    triangleWarningIcon,
    infoIcon,
    xIcon,
    lockIcon
]);
let _ViAlert;
_dec = t('vi-alert'), _dec1 = n({
    type: String,
    reflect: true
}), _dec2 = n({
    type: String
}), _dec3 = n({
    type: Boolean,
    reflect: true
}), _dec4 = n({
    type: String,
    attribute: 'dismiss-label'
}), _dec5 = n({
    type: Boolean,
    attribute: 'auto-hide',
    reflect: true
}), _dec6 = n({
    type: Number,
    attribute: 'auto-hide-duration'
}), _dec7 = n({
    type: Number
}), _dec8 = n({
    type: String
}), _dec9 = n({
    type: Boolean,
    reflect: true
}), _dec10 = n({
    type: Boolean,
    reflect: true
}), _dec11 = n({
    type: Boolean,
    attribute: 'no-icon',
    reflect: true
}), _dec12 = r(), _dec13 = r();
new class extends _identity {
    constructor(){
        super(_ViAlert), _initClass();
    }
    static{
        class ViAlert extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_variant, _init_title, _init_dismissible, _init_dismissLabel, _init_autoHide, _init_autoHideDuration, _init_duration, _init_icon, _init_open, _init_floating, _init_noIcon, _init__hasTitleSlot, _init__hasActionsSlot, _initProto], c: [_ViAlert, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "variant"
                    ],
                    [
                        _dec2,
                        1,
                        "title"
                    ],
                    [
                        _dec3,
                        1,
                        "dismissible"
                    ],
                    [
                        _dec4,
                        1,
                        "dismissLabel"
                    ],
                    [
                        _dec5,
                        1,
                        "autoHide"
                    ],
                    [
                        _dec6,
                        1,
                        "autoHideDuration"
                    ],
                    [
                        _dec7,
                        1,
                        "duration"
                    ],
                    [
                        _dec8,
                        1,
                        "icon"
                    ],
                    [
                        _dec9,
                        1,
                        "open"
                    ],
                    [
                        _dec10,
                        1,
                        "floating"
                    ],
                    [
                        _dec11,
                        1,
                        "noIcon"
                    ],
                    [
                        _dec12,
                        1,
                        "_hasTitleSlot"
                    ],
                    [
                        _dec13,
                        1,
                        "_hasActionsSlot"
                    ]
                ], [
                    _dec
                ], _ViElement));
            }
            static styles = i`
    ${r$1(alertStyles)}
  `;
            #___private_variant_1 = (_initProto(this), _init_variant(this, 'info'));
            get variant() {
                return this.#___private_variant_1;
            }
            set variant(_v) {
                this.#___private_variant_1 = _v;
            }
            #___private_title_2 = _init_title(this, '');
            get title() {
                return this.#___private_title_2;
            }
            set title(_v) {
                this.#___private_title_2 = _v;
            }
            #___private_dismissible_3 = _init_dismissible(this, false);
            get dismissible() {
                return this.#___private_dismissible_3;
            }
            set dismissible(_v) {
                this.#___private_dismissible_3 = _v;
            }
            #___private_dismissLabel_4 = _init_dismissLabel(this, 'Dismiss alert');
            get dismissLabel() {
                return this.#___private_dismissLabel_4;
            }
            set dismissLabel(_v) {
                this.#___private_dismissLabel_4 = _v;
            }
            #___private_autoHide_5 = _init_autoHide(this, false);
            get autoHide() {
                return this.#___private_autoHide_5;
            }
            set autoHide(_v) {
                this.#___private_autoHide_5 = _v;
            }
            #___private_autoHideDuration_6 = _init_autoHideDuration(this, 5000);
            get autoHideDuration() {
                return this.#___private_autoHideDuration_6;
            }
            set autoHideDuration(_v) {
                this.#___private_autoHideDuration_6 = _v;
            }
            #___private_duration_7 = _init_duration(this, undefined);
            get duration() {
                return this.#___private_duration_7;
            }
            set duration(_v) {
                this.#___private_duration_7 = _v;
            }
            #___private_icon_8 = _init_icon(this, undefined);
            get icon() {
                return this.#___private_icon_8;
            }
            set icon(_v) {
                this.#___private_icon_8 = _v;
            }
            #___private_open_9 = _init_open(this, true);
            get open() {
                return this.#___private_open_9;
            }
            set open(_v) {
                this.#___private_open_9 = _v;
            }
            #___private_floating_10 = _init_floating(this, false);
            get floating() {
                return this.#___private_floating_10;
            }
            set floating(_v) {
                this.#___private_floating_10 = _v;
            }
            #___private_noIcon_11 = _init_noIcon(this, false);
            get noIcon() {
                return this.#___private_noIcon_11;
            }
            set noIcon(_v) {
                this.#___private_noIcon_11 = _v;
            }
            #___private__hasTitleSlot_12 = _init__hasTitleSlot(this, false);
            get _hasTitleSlot() {
                return this.#___private__hasTitleSlot_12;
            }
            set _hasTitleSlot(_v) {
                this.#___private__hasTitleSlot_12 = _v;
            }
            #___private__hasActionsSlot_13 = _init__hasActionsSlot(this, false);
            get _hasActionsSlot() {
                return this.#___private__hasActionsSlot_13;
            }
            set _hasActionsSlot(_v) {
                this.#___private__hasActionsSlot_13 = _v;
            }
            _autoHideTimer = null;
            /** Helper to check whether auto-hide is enabled via boolean toggle or duration setting */ get _shouldAutoHide() {
                return this.autoHide || this.duration !== undefined && this.duration > 0;
            }
            connectedCallback() {
                super.connectedCallback();
                this.updateRole();
                if (!this.open) {
                    this.hidden = true;
                } else if (this._shouldAutoHide) {
                    this._startAutoHideTimer();
                }
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this._clearAutoHideTimer();
            }
            updated(changedProperties) {
                super.updated(changedProperties);
                if (changedProperties.has('variant')) {
                    this.updateRole();
                }
                if (changedProperties.has('open') && changedProperties.get('open') !== undefined) {
                    if (this.open) {
                        this._handleOpen();
                    } else if (!this.hidden) {
                        this.handleDismiss();
                    }
                }
                if (changedProperties.has('autoHide') || changedProperties.has('autoHideDuration') || changedProperties.has('duration')) {
                    if (this.open && this._shouldAutoHide) {
                        this._startAutoHideTimer();
                    } else {
                        this._clearAutoHideTimer();
                    }
                }
            }
            updateRole() {
                switch(this.variant){
                    case 'warning':
                    case 'danger':
                        this.setAttribute('role', 'alert');
                        break;
                    case 'info':
                    case 'success':
                        this.setAttribute('role', 'status');
                        break;
                    case 'neutral':
                    default:
                        this.removeAttribute('role');
                        break;
                }
            }
            get defaultIcon() {
                switch(this.variant){
                    case 'success':
                        return 'check-circle';
                    case 'warning':
                    case 'danger':
                        return 'triangle-warning';
                    case 'info':
                    default:
                        return 'info';
                }
            }
            onTitleSlotChange(e) {
                const slot = e.target;
                this._hasTitleSlot = slot.assignedNodes({
                    flatten: true
                }).length > 0;
            }
            onActionsSlotChange(e) {
                const slot = e.target;
                this._hasActionsSlot = slot.assignedNodes({
                    flatten: true
                }).length > 0;
            }
            _startAutoHideTimer() {
                this._clearAutoHideTimer();
                const timeout = this.duration ?? this.autoHideDuration;
                if (timeout > 0) {
                    this._autoHideTimer = setTimeout(()=>{
                        this.hide();
                    }, timeout);
                }
            }
            _clearAutoHideTimer() {
                if (this._autoHideTimer !== null) {
                    clearTimeout(this._autoHideTimer);
                    this._autoHideTimer = null;
                }
            }
            _handleOpen() {
                this.hidden = false;
                if (this.shadowRoot) {
                    const root = this.shadowRoot.querySelector('.alert-root');
                    if (root && typeof root.getAnimations === 'function') {
                        root.getAnimations().forEach((anim)=>anim.cancel());
                    }
                }
                if (this._shouldAutoHide) {
                    this._startAutoHideTimer();
                }
                this.dispatchEvent(new CustomEvent('vi-alert-show', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        id: this.id
                    }
                }));
            }
            _dismissPromise = null;
            async handleDismiss() {
                this._clearAutoHideTimer();
                if (this._dismissPromise) {
                    return this._dismissPromise;
                }
                this._dismissPromise = (async ()=>{
                    if (this.shadowRoot) {
                        const root = this.shadowRoot.querySelector('.alert-root');
                        if (root && typeof root.animate === 'function') {
                            try {
                                const computed = getComputedStyle(root);
                                const currentHeight = root.offsetHeight;
                                const currentPadding = computed.padding;
                                const currentMargin = computed.margin;
                                const animation = root.animate([
                                    {
                                        height: `${currentHeight}px`,
                                        opacity: 1,
                                        margin: currentMargin,
                                        padding: currentPadding
                                    },
                                    {
                                        height: '0px',
                                        opacity: 0,
                                        margin: '0px',
                                        padding: '0px'
                                    }
                                ], {
                                    duration: 200,
                                    easing: 'ease-out',
                                    fill: 'forwards'
                                });
                                await animation.finished;
                            } catch  {
                            // Animation was cancelled or failed; swallow rejection and proceed
                            }
                        }
                    }
                    this.hidden = true;
                    this.open = false;
                    this.dispatchEvent(new CustomEvent('vi-alert-close', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            id: this.id
                        }
                    }));
                })();
                try {
                    await this._dismissPromise;
                } finally{
                    this._dismissPromise = null;
                }
            }
            /** Programmatically shows the alert */ async show() {
                this.open = true;
                await this.updateComplete;
            }
            /** Programmatically hides/dismisses the alert */ async hide() {
                if (this.open) {
                    this.open = false;
                    await this.updateComplete;
                    if (this._dismissPromise) {
                        await this._dismissPromise;
                    }
                }
            }
            render() {
                return b`
      <div part="alert" class="alert-root" data-variant=${this.variant}>
        ${!this.noIcon ? b`
              <div part="icon" class="alert-icon">
                <slot name="icon">
                  <vi-icon
                    name=${this.icon || this.defaultIcon}
                    aria-hidden="true"
                  ></vi-icon>
                </slot>
              </div>
            ` : ''}

        <div part="content" class="alert-content">
          <div
            part="title"
            class="alert-title"
            ?hidden=${!(this.title || this._hasTitleSlot)}
          >
            <slot name="title" @slotchange=${this.onTitleSlotChange}>
              ${this.title}
            </slot>
          </div>

          <div part="body" class="alert-body">
            <slot></slot>
          </div>

          <div
            part="actions"
            class="alert-actions"
            ?hidden=${!this._hasActionsSlot}
          >
            <slot name="actions" @slotchange=${this.onActionsSlotChange}></slot>
          </div>
        </div>

        ${this.dismissible ? b`
              <vi-button
                part="close-btn"
                variant="ghost"
                size="sm"
                icon-only
                aria-label=${this.dismissLabel}
                @click=${this.handleDismiss}
              >
                <vi-icon name="x" slot="icon"></vi-icon>
              </vi-button>
            ` : ''}
      </div>
    `;
            }
        }
    }
}();
