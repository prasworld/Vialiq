import { r as r$1, i, A, b } from './iframe-BG-vSsO8.js';
import { V as ViElement, t, n } from './vi-element-CY2w5JM9.js';
import { r } from './state-Cf8058cA.js';
import { O as OverlayManager, e } from './overlay-manager-B43cq-OI.js';
import { a as autoUpdate, o as offset, f as flip, b as shift, d as arrow, c as computePosition } from './floating-ui.dom-DwUTpXgb.js';
import './vi-button-DtBMAqJm.js';
import './vi-icon-B-0J1W5J.js';
import './preload-helper-D5QYaGzd.js';
import './base-Cl6v8-BZ.js';
import './focusable-mixin-CmxOyPX5.js';
import './directive-BKuZRRPO.js';
import './registry-CeXOZkT9.js';

const tooltipStyles = "@charset \"UTF-8\";@layer reset,components,utilities;.tooltip-panel{position:fixed;z-index:var(--vi-tooltip-z-index, var(--vi-tooltip-z-index, 1070));pointer-events:none;opacity:0;transform:scale(.95);transition:opacity .15s ease-out,transform .15s ease-out;margin:0;border:none;background:transparent;padding:0;overflow:visible;font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif)}.tooltip-panel[popover]:popover-open{display:block;pointer-events:auto;opacity:1;transform:scale(1)}.tooltip-panel{transition-property:opacity,transform,display,overlay;transition-behavior:allow-discrete}@media(prefers-reduced-motion:reduce){.tooltip-panel{transition:none;transform:none}}.tooltip-content{background-color:var(--vi-tooltip-background, var(--vi-layer-inverse, #111827));color:var(--vi-tooltip-color, var(--vi-text-primary-inverse, #ffffff));font-size:var(--vi-tooltip-font-size, 12px);line-height:1.4;padding:var(--vi-tooltip-padding, 6px 10px);border-radius:var(--vi-tooltip-border-radius, 4px);box-shadow:var(--vi-tooltip-shadow, var(--vi-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, .1)));max-width:var(--vi-tooltip-max-width, 240px);word-wrap:break-word;white-space:normal;position:relative}.tooltip-arrow{position:absolute;width:0;height:0;border-style:solid;border-color:transparent;pointer-events:none}.tooltip-panel[placement^=top] .tooltip-arrow,.tooltip-panel[data-placement^=top] .tooltip-arrow{bottom:calc(-1 * var(--vi-tooltip-arrow-size, 6px));left:50%;transform:translate(-50%);border-width:var(--vi-tooltip-arrow-size, 6px) var(--vi-tooltip-arrow-size, 6px) 0;border-top-color:var(--vi-tooltip-background, var(--vi-layer-inverse, #111827))}.tooltip-panel[placement^=bottom] .tooltip-arrow,.tooltip-panel[data-placement^=bottom] .tooltip-arrow{top:calc(-1 * var(--vi-tooltip-arrow-size, 6px));left:50%;transform:translate(-50%);border-width:0 var(--vi-tooltip-arrow-size, 6px) var(--vi-tooltip-arrow-size, 6px);border-bottom-color:var(--vi-tooltip-background, var(--vi-layer-inverse, #111827))}.tooltip-panel[placement=left] .tooltip-arrow,.tooltip-panel[data-placement=left] .tooltip-arrow{right:calc(-1 * var(--vi-tooltip-arrow-size, 6px));top:50%;transform:translateY(-50%);border-width:var(--vi-tooltip-arrow-size, 6px) 0 var(--vi-tooltip-arrow-size, 6px) var(--vi-tooltip-arrow-size, 6px);border-left-color:var(--vi-tooltip-background, var(--vi-layer-inverse, #111827))}.tooltip-panel[placement=right] .tooltip-arrow,.tooltip-panel[data-placement=right] .tooltip-arrow{left:calc(-1 * var(--vi-tooltip-arrow-size, 6px));top:50%;transform:translateY(-50%);border-width:var(--vi-tooltip-arrow-size, 6px) var(--vi-tooltip-arrow-size, 6px) var(--vi-tooltip-arrow-size, 6px) 0;border-right-color:var(--vi-tooltip-background, var(--vi-layer-inverse, #111827))}.tooltip-panel[placement$=-start] .tooltip-arrow,.tooltip-panel[data-placement$=-start] .tooltip-arrow{left:12px;transform:none}.tooltip-panel[placement$=-end] .tooltip-arrow,.tooltip-panel[data-placement$=-end] .tooltip-arrow{left:auto;right:12px;transform:none}:host{display:inline-block}";

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
var _dec, _initClass, _ViElement, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _init_content, _init_placement, _init_trigger, _init_delay, _init_hideDelay, _init_maxWidth, _init_disabled, /**
   * Custom options passed directly to Floating UI's computePosition.
   * Note: the `popper-options` attribute only supports JSON-serializable values;
   * middleware functions must be set via the `popperOptions` property.        
  */ _init_popperOptions, _init__open, _init__isInteractive, _init__tooltipPanel, _init__defaultSlot, _init__contentSlot, _initProto;
let _ViTooltip;
_dec = t('vi-tooltip'), _dec1 = n({
    type: String
}), _dec2 = n({
    type: String,
    reflect: true
}), _dec3 = n({
    type: String
}), _dec4 = n({
    type: Number
}), _dec5 = n({
    type: Number,
    attribute: 'hide-delay'
}), _dec6 = n({
    type: Number,
    attribute: 'max-width'
}), _dec7 = n({
    type: Boolean,
    reflect: true
}), _dec8 = n({
    type: Object,
    attribute: 'popper-options',
    converter: {
        fromAttribute: (value)=>{
            if (value == null || value === '') return {};
            try {
                return JSON.parse(value);
            } catch  {
                return {};
            }
        }
    }
}), _dec9 = r(), _dec10 = r(), _dec11 = e('.tooltip-panel'), _dec12 = e('slot:not([name])'), _dec13 = e('slot[name="content"]');
new class extends _identity {
    constructor(){
        super(_ViTooltip), _initClass();
    }
    static{
        class ViTooltip extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_content, _init_placement, _init_trigger, _init_delay, _init_hideDelay, _init_maxWidth, _init_disabled, _init_popperOptions, _init__open, _init__isInteractive, _init__tooltipPanel, _init__defaultSlot, _init__contentSlot, _initProto], c: [_ViTooltip, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "content"
                    ],
                    [
                        _dec2,
                        1,
                        "placement"
                    ],
                    [
                        _dec3,
                        1,
                        "trigger"
                    ],
                    [
                        _dec4,
                        1,
                        "delay"
                    ],
                    [
                        _dec5,
                        1,
                        "hideDelay"
                    ],
                    [
                        _dec6,
                        1,
                        "maxWidth"
                    ],
                    [
                        _dec7,
                        1,
                        "disabled"
                    ],
                    [
                        _dec8,
                        1,
                        "popperOptions"
                    ],
                    [
                        _dec9,
                        1,
                        "_open"
                    ],
                    [
                        _dec10,
                        1,
                        "_isInteractive"
                    ],
                    [
                        _dec11,
                        1,
                        "_tooltipPanel"
                    ],
                    [
                        _dec12,
                        1,
                        "_defaultSlot"
                    ],
                    [
                        _dec13,
                        1,
                        "_contentSlot"
                    ]
                ], [
                    _dec
                ], _ViElement));
            }
            static styles = i`${r$1(tooltipStyles)}`;
            #___private_content_1 = (_initProto(this), _init_content(this, ''));
            get content() {
                return this.#___private_content_1;
            }
            set content(_v) {
                this.#___private_content_1 = _v;
            }
            #___private_placement_2 = _init_placement(this, 'top');
            get placement() {
                return this.#___private_placement_2;
            }
            set placement(_v) {
                this.#___private_placement_2 = _v;
            }
            #___private_trigger_3 = _init_trigger(this, 'hover focus');
            get trigger() {
                return this.#___private_trigger_3;
            }
            set trigger(_v) {
                this.#___private_trigger_3 = _v;
            }
            #___private_delay_4 = _init_delay(this, 500);
            get delay() {
                return this.#___private_delay_4;
            }
            set delay(_v) {
                this.#___private_delay_4 = _v;
            }
            #___private_hideDelay_5 = _init_hideDelay(this, 100);
            get hideDelay() {
                return this.#___private_hideDelay_5;
            }
            set hideDelay(_v) {
                this.#___private_hideDelay_5 = _v;
            }
            #___private_maxWidth_6 = _init_maxWidth(this, 240);
            get maxWidth() {
                return this.#___private_maxWidth_6;
            }
            set maxWidth(_v) {
                this.#___private_maxWidth_6 = _v;
            }
            #___private_disabled_7 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_7;
            }
            set disabled(_v) {
                this.#___private_disabled_7 = _v;
            }
            #___private_popperOptions_8 = _init_popperOptions(this, {});
            get popperOptions() {
                return this.#___private_popperOptions_8;
            }
            set popperOptions(_v) {
                this.#___private_popperOptions_8 = _v;
            }
            #___private__open_9 = _init__open(this, false);
            get _open() {
                return this.#___private__open_9;
            }
            set _open(_v) {
                this.#___private__open_9 = _v;
            }
            #___private__isInteractive_10 = _init__isInteractive(this, false);
            get _isInteractive() {
                return this.#___private__isInteractive_10;
            }
            set _isInteractive(_v) {
                this.#___private__isInteractive_10 = _v;
            }
            #___private__tooltipPanel_11 = _init__tooltipPanel(this);
            get _tooltipPanel() {
                return this.#___private__tooltipPanel_11;
            }
            set _tooltipPanel(_v) {
                this.#___private__tooltipPanel_11 = _v;
            }
            #___private__defaultSlot_12 = _init__defaultSlot(this);
            get _defaultSlot() {
                return this.#___private__defaultSlot_12;
            }
            set _defaultSlot(_v) {
                this.#___private__defaultSlot_12 = _v;
            }
            #___private__contentSlot_13 = _init__contentSlot(this);
            get _contentSlot() {
                return this.#___private__contentSlot_13;
            }
            set _contentSlot(_v) {
                this.#___private__contentSlot_13 = _v;
            }
            _showTimeout;
            _hideTimeout;
            _triggerElement = null;
            _cleanupAutoUpdate;
            _overlayZIndex = null;
            _panelId = `vi-tooltip-panel-${Math.random().toString(36).substring(2, 9)}`;
            constructor(){
                super();
                this._handleDocumentClick = this._handleDocumentClick.bind(this);
            }
            connectedCallback() {
                super.connectedCallback();
            }
            disconnectedCallback() {
                this._clearTimeouts();
                document.removeEventListener('pointerdown', this._handleDocumentClick);
                if (this._cleanupAutoUpdate) {
                    this._cleanupAutoUpdate();
                    this._cleanupAutoUpdate = undefined;
                }
                if (this._tooltipPanel && this._overlayZIndex !== null) {
                    OverlayManager.unregister(this._tooltipPanel);
                    this._overlayZIndex = null;
                }
                this._removeTriggerAria();
                super.disconnectedCallback();
            }
            firstUpdated() {
                // Defer initialization to avoid Lit's "change in update" warning
                Promise.resolve().then(()=>{
                    this._updateTriggerElement();
                });
            }
            updated(changed) {
                super.updated(changed);
                if (changed.has('disabled') && this.disabled && this._open) {
                    Promise.resolve().then(()=>{
                        this._closeTooltip();
                    });
                }
                if (changed.has('maxWidth') && this._tooltipPanel) {
                    this._tooltipPanel.style.setProperty('--vi-tooltip-max-width', `${this.maxWidth}px`);
                }
                if ((changed.has('placement') || changed.has('popperOptions')) && this._open) {
                    this._positionTooltip();
                }
            }
            /** Force show the tooltip */ show() {
                if (this.disabled) return;
                window.clearTimeout(this._hideTimeout);
                if (this._open) return;
                if (this.delay > 0) {
                    window.clearTimeout(this._showTimeout);
                    this._showTimeout = window.setTimeout(()=>{
                        this._openTooltip();
                    }, this.delay);
                } else {
                    this._openTooltip();
                }
            }
            /** Force hide the tooltip */ hide(immediate = false) {
                window.clearTimeout(this._showTimeout);
                window.clearTimeout(this._hideTimeout);
                if (!this._open) return;
                if (this.hideDelay > 0 && !immediate) {
                    this._hideTimeout = window.setTimeout(()=>{
                        this._closeTooltip();
                    }, this.hideDelay);
                } else {
                    this._closeTooltip();
                }
            }
            _openTooltip() {
                this._open = true;
                const panel = this._tooltipPanel;
                const trigger = this._triggerElement || this.shadowRoot?.querySelector('.trigger-wrapper');
                if (panel && trigger) {
                    try {
                        if (!panel.matches(':popover-open')) {
                            panel.showPopover();
                        }
                    } catch  {
                        panel.style.display = 'block';
                    }
                    // Register with OverlayManager
                    this._overlayZIndex = OverlayManager.register(panel, 'tooltip');
                    panel.style.zIndex = this._overlayZIndex.toString();
                    this._positionTooltip();
                    // Start autoUpdate monitoring for bounds changes
                    this._cleanupAutoUpdate = autoUpdate(trigger, panel, ()=>{
                        this._positionTooltip();
                    });
                    if (this.trigger.includes('click')) {
                        document.addEventListener('pointerdown', this._handleDocumentClick);
                    }
                }
                this.dispatchEvent(new CustomEvent('vi-tooltip-show', {
                    bubbles: true,
                    composed: true
                }));
            }
            _closeTooltip() {
                this._open = false;
                const panel = this._tooltipPanel;
                if (panel) {
                    try {
                        if (panel.matches(':popover-open')) {
                            panel.hidePopover();
                        }
                    } catch  {
                        panel.style.display = 'none';
                    }
                    OverlayManager.unregister(panel);
                    panel.style.removeProperty('z-index');
                    this._overlayZIndex = null;
                    if (this._cleanupAutoUpdate) {
                        this._cleanupAutoUpdate();
                        this._cleanupAutoUpdate = undefined;
                    }
                    document.removeEventListener('pointerdown', this._handleDocumentClick);
                }
                this.dispatchEvent(new CustomEvent('vi-tooltip-hide', {
                    bubbles: true,
                    composed: true
                }));
            }
            _clearTimeouts() {
                window.clearTimeout(this._showTimeout);
                window.clearTimeout(this._hideTimeout);
            }
            _handleSlotChange() {
                this._removeTriggerAria();
                this._updateTriggerElement();
            }
            _updateTriggerElement() {
                if (!this._defaultSlot) return;
                const assigned = this._defaultSlot.assignedElements({
                    flatten: true
                });
                const newTrigger = assigned[0] || null;
                if (newTrigger !== this._triggerElement) {
                    this._triggerElement = newTrigger;
                }
                this._updateTriggerAria();
            }
            _hasInteractiveContent() {
                if (!this._contentSlot) return false;
                const assigned = this._contentSlot.assignedElements({
                    flatten: true
                });
                if (assigned.length === 0) return false;
                const focusableSelectors = [
                    'a[href]',
                    'button:not([disabled])',
                    'input:not([disabled])',
                    'select:not([disabled])',
                    'textarea:not([disabled])',
                    'vi-button:not([disabled])',
                    'vi-link',
                    '[tabindex]:not([tabindex="-1"])'
                ];
                const hasFocusable = (el)=>{
                    if (focusableSelectors.some((selector)=>el.matches(selector))) return true;
                    return Array.from(el.children).some((child)=>hasFocusable(child));
                };
                return assigned.some((el)=>hasFocusable(el));
            }
            _updateTriggerAria() {
                const trigger = this._triggerElement;
                const isInteractive = this._hasInteractiveContent();
                this._isInteractive = isInteractive;
                if (!trigger) return;
                if (isInteractive) {
                    trigger.setAttribute('aria-details', this._panelId);
                    trigger.removeAttribute('aria-describedby');
                } else {
                    trigger.setAttribute('aria-describedby', this._panelId);
                    trigger.removeAttribute('aria-details');
                }
            }
            _removeTriggerAria() {
                const trigger = this._triggerElement;
                if (trigger) {
                    trigger.removeAttribute('aria-describedby');
                    trigger.removeAttribute('aria-details');
                }
            }
            // ----------------------------------------------------------------------------
            // Pointer/Focus Events
            // ----------------------------------------------------------------------------
            _onPointerEnter = ()=>{
                if (this.trigger.includes('hover')) {
                    this.show();
                }
            };
            _onPointerLeave = ()=>{
                if (this.trigger.includes('hover')) {
                    this.hide();
                }
            };
            _onFocusIn = ()=>{
                if (this.trigger.includes('focus')) {
                    this.show();
                }
            };
            _onFocusOut = ()=>{
                if (this.trigger.includes('focus')) {
                    this.hide();
                }
            };
            _onClick = ()=>{
                if (this.trigger.includes('click')) {
                    if (this._open) {
                        this.hide(true);
                    } else {
                        this.show();
                    }
                }
            };
            _onKeyDown(event) {
                if (event.key === 'Escape') {
                    event.stopPropagation();
                    this.hide(true);
                }
            }
            _handleDocumentClick(event) {
                const target = event.target;
                const panel = this._tooltipPanel;
                if (this._open && panel && !panel.contains(target) && !this.contains(target)) {
                    this.hide(true);
                }
            }
            // ----------------------------------------------------------------------------
            // Positioning Math using Floating UI
            // ----------------------------------------------------------------------------
            _positionTooltip() {
                const panel = this._tooltipPanel;
                if (!panel) return;
                panel.style.setProperty('--vi-tooltip-max-width', `${this.maxWidth}px`);
                const trigger = this._triggerElement || this.shadowRoot?.querySelector('.trigger-wrapper');
                if (!trigger) return;
                const arrowEl = panel.querySelector('.tooltip-arrow');
                // Build default middleware list
                const defaultMiddleware = [
                    offset(10),
                    flip(),
                    shift({
                        padding: 8
                    }),
                    arrowEl ? arrow({
                        element: arrowEl
                    }) : null
                ].filter(Boolean);
                // Merge consumer popperOptions, allowing overrides for middleware, strategy, etc.
                // (but keep `placement` controlled by the `placement` prop to avoid two sources of truth)
                const { placement: _ignoredPlacement, ...popperOptions } = this.popperOptions ?? {};
                const config = {
                    placement: this.placement,
                    strategy: popperOptions.strategy ?? 'absolute',
                    middleware: popperOptions.middleware ?? defaultMiddleware,
                    ...popperOptions
                };
                computePosition(trigger, panel, config).then(({ x, y, placement, strategy, middlewareData })=>{
                    Object.assign(panel.style, {
                        position: strategy,
                        left: `${x}px`,
                        top: `${y}px`,
                        right: 'auto',
                        bottom: 'auto',
                        margin: '0'
                    });
                    // Update data-placement attribute to trigger arrow CSS styles
                    panel.setAttribute('data-placement', placement);
                    // Position the arrow if arrow middleware data exists
                    if (arrowEl && middlewareData.arrow) {
                        const { x: arrowX, y: arrowY } = middlewareData.arrow;
                        // Find which side the arrow is on depending on placement
                        const side = placement.split('-')[0];
                        const staticSide = {
                            top: 'bottom',
                            right: 'left',
                            bottom: 'top',
                            left: 'right'
                        }[side];
                        if (staticSide) {
                            Object.assign(arrowEl.style, {
                                left: arrowX != null ? `${arrowX}px` : '',
                                top: arrowY != null ? `${arrowY}px` : '',
                                right: '',
                                bottom: '',
                                [staticSide]: `${-arrowEl.offsetWidth / 2 || -6}px`
                            });
                        }
                    }
                });
            }
            render() {
                const { _panelId, content, placement, _onPointerEnter, _onPointerLeave, _onFocusIn, _onFocusOut, _onClick, _onKeyDown } = this;
                return b`
      <span
        class="trigger-wrapper"
        @pointerenter=${_onPointerEnter}
        @pointerleave=${_onPointerLeave}
        @focusin=${_onFocusIn}
        @focusout=${_onFocusOut}
        @click=${_onClick}
        @keydown=${_onKeyDown}
      >
        <slot @slotchange=${this._handleSlotChange}></slot>
      </span>

      <div
        id=${_panelId}
        class="tooltip-panel"
        part="tooltip"
        role=${this._isInteractive ? 'dialog' : 'tooltip'}
        popover="manual"
        aria-modal=${this._isInteractive ? 'false' : A}
        aria-label=${this._isInteractive ? content || 'Tooltip' : A}
        placement=${placement}
        @pointerenter=${_onPointerEnter}
        @pointerleave=${_onPointerLeave}
        @focusin=${_onFocusIn}
        @focusout=${_onFocusOut}
        @keydown=${_onKeyDown}
      >
        <div class="tooltip-content" part="content">
          <slot name="content" @slotchange=${this._updateTriggerAria}>${content}</slot>
          <div class="tooltip-arrow" part="arrow"></div>
        </div>
      </div>
    `;
            }
        }
    }
}();

const meta = {
    title: 'Components/Tooltip',
    tags: [
        'autodocs'
    ],
    argTypes: {
        content: {
            control: 'text',
            description: 'Tooltip text (alternative to content slot)'
        },
        placement: {
            control: 'select',
            options: [
                'top',
                'top-start',
                'top-end',
                'bottom',
                'bottom-start',
                'bottom-end',
                'left',
                'right'
            ],
            description: 'Preferred position of the tooltip relative to its trigger'
        },
        trigger: {
            control: 'select',
            options: [
                'hover focus',
                'hover',
                'focus',
                'click'
            ],
            description: 'Events that show the tooltip'
        },
        delay: {
            control: 'number',
            description: 'Show delay in milliseconds'
        },
        hideDelay: {
            control: 'number',
            name: 'hide-delay',
            description: 'Hide delay in milliseconds'
        },
        maxWidth: {
            control: 'number',
            name: 'max-width',
            description: 'Max width of the tooltip in pixels'
        },
        disabled: {
            control: 'boolean',
            description: 'Suppresses display of the tooltip'
        }
    },
    args: {
        content: 'Informed Consent Form — signed before first visit.',
        placement: 'top',
        trigger: 'hover focus',
        delay: 300,
        hideDelay: 100,
        maxWidth: 240,
        disabled: false
    },
    render: (args)=>{
        return b`
      <div style="padding: 100px; display: flex; justify-content: center; align-items: center;">
        <vi-tooltip
          .content=${args.content}
          .placement=${args.placement}
          .trigger=${args.trigger}
          .delay=${args.delay}
          .hideDelay=${args.hideDelay}
          .maxWidth=${args.maxWidth}
          ?disabled=${args.disabled}
        >
          <vi-button>Hover or Focus Me</vi-button>
        </vi-tooltip>
      </div>
    `;
    }
};
const Default = {};
const RichContent = {
    render: (args)=>b`
    <div style="padding: 100px; display: flex; justify-content: center; align-items: center;">
      <vi-tooltip
        .placement=${args.placement}
        .trigger=${args.trigger}
        .delay=${args.delay}
        .hideDelay=${args.hideDelay}
        .maxWidth=${args.maxWidth}
        ?disabled=${args.disabled}
      >
        <vi-button variant="ghost" size="sm">
          Grade Info
        </vi-button>
        <div slot="content">
          Grade per NCI CTCAE v5.0.
          <a href="https://ctep.cancer.gov/protocoldevelopment/electronic_applications/ctc.htm" target="_blank" style="color: #64b5f6; text-decoration: underline;">
            View criteria
          </a>
        </div>
      </vi-tooltip>
    </div>
  `
};
const Placements = {
    render: (args)=>b`
    <div style="padding: 120px; display: grid; grid-template-columns: repeat(3, 160px); gap: 40px; justify-content: center; justify-items: center; align-items: center;">
      <div></div>
      <vi-tooltip content="Top placement" placement="top" .delay=${args.delay}>
        <vi-button size="sm">Top</vi-button>
      </vi-tooltip>
      <div></div>

      <vi-tooltip content="Left placement" placement="left" .delay=${args.delay}>
        <vi-button size="sm">Left</vi-button>
      </vi-tooltip>
      <div style="font-size: 11px; color: #888; text-align: center;">Placements Grid</div>
      <vi-tooltip content="Right placement" placement="right" .delay=${args.delay}>
        <vi-button size="sm">Right</vi-button>
      </vi-tooltip>

      <div></div>
      <vi-tooltip content="Bottom placement" placement="bottom" .delay=${args.delay}>
        <vi-button size="sm">Bottom</vi-button>
      </vi-tooltip>
      <div></div>
    </div>
  `
};
const ClickTrigger = {
    args: {
        trigger: 'click',
        content: 'This tooltip is shown only when you click the button.'
    }
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{}",
            ...Default.parameters?.docs?.source
        }
    }
};
RichContent.parameters = {
    ...RichContent.parameters,
    docs: {
        ...RichContent.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <div style=\"padding: 100px; display: flex; justify-content: center; align-items: center;\">\n      <vi-tooltip\n        .placement=${args.placement}\n        .trigger=${args.trigger}\n        .delay=${args.delay}\n        .hideDelay=${args.hideDelay}\n        .maxWidth=${args.maxWidth}\n        ?disabled=${args.disabled}\n      >\n        <vi-button variant=\"ghost\" size=\"sm\">\n          Grade Info\n        </vi-button>\n        <div slot=\"content\">\n          Grade per NCI CTCAE v5.0.\n          <a href=\"https://ctep.cancer.gov/protocoldevelopment/electronic_applications/ctc.htm\" target=\"_blank\" style=\"color: #64b5f6; text-decoration: underline;\">\n            View criteria\n          </a>\n        </div>\n      </vi-tooltip>\n    </div>\n  `\n}",
            ...RichContent.parameters?.docs?.source
        }
    }
};
Placements.parameters = {
    ...Placements.parameters,
    docs: {
        ...Placements.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <div style=\"padding: 120px; display: grid; grid-template-columns: repeat(3, 160px); gap: 40px; justify-content: center; justify-items: center; align-items: center;\">\n      <div></div>\n      <vi-tooltip content=\"Top placement\" placement=\"top\" .delay=${args.delay}>\n        <vi-button size=\"sm\">Top</vi-button>\n      </vi-tooltip>\n      <div></div>\n\n      <vi-tooltip content=\"Left placement\" placement=\"left\" .delay=${args.delay}>\n        <vi-button size=\"sm\">Left</vi-button>\n      </vi-tooltip>\n      <div style=\"font-size: 11px; color: #888; text-align: center;\">Placements Grid</div>\n      <vi-tooltip content=\"Right placement\" placement=\"right\" .delay=${args.delay}>\n        <vi-button size=\"sm\">Right</vi-button>\n      </vi-tooltip>\n\n      <div></div>\n      <vi-tooltip content=\"Bottom placement\" placement=\"bottom\" .delay=${args.delay}>\n        <vi-button size=\"sm\">Bottom</vi-button>\n      </vi-tooltip>\n      <div></div>\n    </div>\n  `\n}",
            ...Placements.parameters?.docs?.source
        }
    }
};
ClickTrigger.parameters = {
    ...ClickTrigger.parameters,
    docs: {
        ...ClickTrigger.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    trigger: 'click',\n    content: 'This tooltip is shown only when you click the button.'\n  }\n}",
            ...ClickTrigger.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","RichContent","Placements","ClickTrigger"];

export { ClickTrigger, Default, Placements, RichContent, __namedExportsOrder, meta as default };
