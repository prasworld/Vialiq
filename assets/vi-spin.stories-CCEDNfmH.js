import { E, c as i$2, r as r$1, i as i$3, b } from './iframe-DecssaRk.js';
import { o as o$1 } from './if-defined-DacuyPfn.js';
import { t as t$1, n as n$1 } from './vi-element-CZpFtKKU.js';
import { r } from './state-CqHxxi7B.js';
import { e as e$1 } from './class-map-Dpe_MPwk.js';
import { e, i as i$1, t } from './directive-BKuZRRPO.js';
import './vi-alert-DHTSYden.js';
import './preload-helper-D5QYaGzd.js';
import './vi-icon-CzcwJ736.js';
import './registry-CeXOZkT9.js';
import './vi-button-HuDxYdEy.js';
import './focusable-mixin-CmxOyPX5.js';
import './triangle-warning-BY6LbiCU.js';
import './lock-CCJyCMJ1.js';
import './x-3JmBhc9n.js';

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const n="important",i=" !"+n,o=e(class extends i$1{constructor(t$1){if(super(t$1),t$1.type!==t.ATTRIBUTE||"style"!==t$1.name||t$1.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce((e,r)=>{const s=t[r];return null==s?e:e+`${r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(e,[r]){const{style:s}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(r)),this.render(r);for(const t of this.ft)null==r[t]&&(this.ft.delete(t),t.includes("-")?s.removeProperty(t):s[t]=null);for(const t in r){const e=r[t];if(null!=e){this.ft.add(t);const r="string"==typeof e&&e.endsWith(i);t.includes("-")||r?s.setProperty(t,r?e.slice(0,-11):e,r?n:""):s[t]=e;}}return E}});

const spinStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{@keyframes viSpinRotate{to{transform:rotate(360deg)}}@keyframes viSpinMove{to{opacity:1}}.spin-wrapper{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;color:var(--vi-spin-color, var(--vi-color-primary, var(--vi-color-primary, #3676d0)));vertical-align:middle;text-align:center;opacity:0;transition:transform .3s cubic-bezier(.78,.14,.15,.86)}.spin-wrapper.spinning{opacity:1}.spin-wrapper.spin-fullscreen{position:fixed;inset:0;z-index:9999;background-color:var(--vi-spin-fullscreen-bg, rgba(255, 255, 255, .8))}.spin-circle{display:inline-block;font-size:var(--vi-spin-size-md, 1.25rem);width:1em;height:1em;animation:viSpinRotate 1s infinite linear}.spin-circle.spin-circle-determinate{animation:none;transform:rotate(-90deg)}.spin-dot{position:relative;display:inline-block;font-size:var(--vi-spin-size-md, 1.25rem);width:1em;height:1em;transform:rotate(45deg);animation:viSpinRotate 1.2s infinite linear}.spin-dot-item{position:absolute;display:block;width:var(--vi-spin-item-size-md, 9px);height:var(--vi-spin-item-size-md, 9px);background-color:currentColor;border-radius:100%;transform:scale(.75);transform-origin:50% 50%;opacity:.3;animation:viSpinMove 1s infinite linear alternate}.spin-dot-item:nth-child(1){top:0;left:0}.spin-dot-item:nth-child(2){top:0;right:0;animation-delay:.4s}.spin-dot-item:nth-child(3){right:0;bottom:0;animation-delay:.8s}.spin-dot-item:nth-child(4){bottom:0;left:0;animation-delay:1.2s}.spin-text{margin-top:var(--vi-spacing-xs, .5rem);font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-spin-text-font-size, var(--vi-font-size-sm, .8125rem));color:var(--vi-spin-color, var(--vi-color-primary, var(--vi-color-primary, #3676d0)))}.spin-sm .spin-circle,.spin-sm .spin-dot{font-size:var(--vi-spin-size-sm, var(--vi-font-size-base, .875rem))}.spin-sm .spin-dot-item{width:var(--vi-spin-item-size-sm, var(--vi-spacing-unit, .25rem));height:var(--vi-spin-item-size-sm, var(--vi-spacing-unit, .25rem))}.spin-lg .spin-circle,.spin-lg .spin-dot{font-size:var(--vi-spin-size-lg, var(--vi-spacing-xl, 2rem))}.spin-lg .spin-dot-item{width:var(--vi-spin-item-size-lg, var(--vi-font-size-base, .875rem));height:var(--vi-spin-item-size-lg, var(--vi-font-size-base, .875rem))}.spin-nested-loading{position:relative}.spin-nested-loading .spin-container{position:relative;transition:opacity .3s}.spin-nested-loading .spin-container.spin-blur{clear:both;opacity:.5;-webkit-user-select:none;user-select:none;pointer-events:none}.spin-nested-loading>.spin-wrapper{position:absolute;top:0;left:0;z-index:4;display:flex;width:100%;height:100%;max-height:400px}}:host{display:block}:host(:not([hidden])){display:inline-block}:host(:not([hidden])) .spin-nested-loading{display:block}";

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
var _dec, _initClass, _LitElement, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, /**
   * Whether the spinner is active.
   */ _init_spinning, /**
   * The size of the spinner.
   */ _init_size, /**
   * The variant of the spinner.
   */ _init_variant, /**
   * Whether the spinner overlays the entire viewport.
   */ _init_fullscreen, /**
   * Determinate progress percent (0-100). Only applies to arc variant.
   */ _init_percent, /**
   * A text label to display underneath the spinner.
   */ _init_tip, /**
   * Delay in milliseconds before showing the spinner (prevents flashing for fast loads).
   */ _init_delay, _init_shouldRenderSpinning, _initProto;
let _ViSpin;
_dec = t$1('vi-spin'), _dec1 = n$1({
    type: Boolean
}), _dec2 = n$1({
    type: String
}), _dec3 = n$1({
    type: String
}), _dec4 = n$1({
    type: Boolean
}), _dec5 = n$1({
    type: Number
}), _dec6 = n$1({
    type: String
}), _dec7 = n$1({
    type: Number
}), _dec8 = r();
new class extends _identity {
    constructor(){
        super(_ViSpin), _initClass();
    }
    static{
        class ViSpin extends (_LitElement = i$2) {
            static{
                ({ e: [_init_spinning, _init_size, _init_variant, _init_fullscreen, _init_percent, _init_tip, _init_delay, _init_shouldRenderSpinning, _initProto], c: [_ViSpin, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "spinning"
                    ],
                    [
                        _dec2,
                        1,
                        "size"
                    ],
                    [
                        _dec3,
                        1,
                        "variant"
                    ],
                    [
                        _dec4,
                        1,
                        "fullscreen"
                    ],
                    [
                        _dec5,
                        1,
                        "percent"
                    ],
                    [
                        _dec6,
                        1,
                        "tip"
                    ],
                    [
                        _dec7,
                        1,
                        "delay"
                    ],
                    [
                        _dec8,
                        1,
                        "shouldRenderSpinning"
                    ]
                ], [
                    _dec
                ], _LitElement));
            }
            static styles = i$3`
    ${r$1(spinStyles)}
  `;
            #___private_spinning_1 = (_initProto(this), _init_spinning(this, true));
            get spinning() {
                return this.#___private_spinning_1;
            }
            set spinning(_v) {
                this.#___private_spinning_1 = _v;
            }
            #___private_size_2 = _init_size(this, 'md');
            get size() {
                return this.#___private_size_2;
            }
            set size(_v) {
                this.#___private_size_2 = _v;
            }
            #___private_variant_3 = _init_variant(this, 'arc');
            get variant() {
                return this.#___private_variant_3;
            }
            set variant(_v) {
                this.#___private_variant_3 = _v;
            }
            #___private_fullscreen_4 = _init_fullscreen(this, false);
            get fullscreen() {
                return this.#___private_fullscreen_4;
            }
            set fullscreen(_v) {
                this.#___private_fullscreen_4 = _v;
            }
            #___private_percent_5 = _init_percent(this);
            get percent() {
                return this.#___private_percent_5;
            }
            set percent(_v) {
                this.#___private_percent_5 = _v;
            }
            #___private_tip_6 = _init_tip(this);
            get tip() {
                return this.#___private_tip_6;
            }
            set tip(_v) {
                this.#___private_tip_6 = _v;
            }
            #___private_delay_7 = _init_delay(this);
            get delay() {
                return this.#___private_delay_7;
            }
            set delay(_v) {
                this.#___private_delay_7 = _v;
            }
            #___private_shouldRenderSpinning_8 = _init_shouldRenderSpinning(this, false);
            get shouldRenderSpinning() {
                return this.#___private_shouldRenderSpinning_8;
            }
            set shouldRenderSpinning(_v) {
                this.#___private_shouldRenderSpinning_8 = _v;
            }
            delayTimeout;
            willUpdate(changedProperties) {
                if (changedProperties.has('spinning') || changedProperties.has('delay')) {
                    if (this.delayTimeout) {
                        clearTimeout(this.delayTimeout);
                        this.delayTimeout = undefined;
                    }
                    if (this.spinning && this.delay && this.delay > 0) {
                        this.shouldRenderSpinning = false;
                        this.delayTimeout = setTimeout(()=>{
                            this.shouldRenderSpinning = true;
                        }, this.delay);
                    } else {
                        this.shouldRenderSpinning = this.spinning;
                    }
                }
            }
            get hasChildren() {
                return Array.from(this.childNodes).some((node)=>node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '');
            }
            render() {
                const isSpinning = this.shouldRenderSpinning;
                const hasChildren = this.hasChildren;
                const spinWrapperClasses = {
                    'spin-wrapper': true,
                    'spinning': isSpinning,
                    [`spin-${this.size}`]: true,
                    'spin-fullscreen': this.fullscreen
                };
                const containerClasses = {
                    'spin-container': true,
                    'spin-blur': isSpinning
                };
                const renderIndicator = ()=>{
                    if (this.variant === 'dots') {
                        return b`
          <span class="spin-dot">
            <i class="spin-dot-item"></i>
            <i class="spin-dot-item"></i>
            <i class="spin-dot-item"></i>
            <i class="spin-dot-item"></i>
          </span>
        `;
                    }
                    const arcPercent = this.percent !== undefined ? Math.max(0, Math.min(100, this.percent)) : undefined;
                    const isDeterminate = arcPercent !== undefined;
                    const circumference = 62.83; // 2 * pi * r (10)
                    const dashOffset = isDeterminate ? circumference - arcPercent / 100 * circumference : 0;
                    const circleStyle = isDeterminate ? {
                        strokeDasharray: `${circumference}`,
                        strokeDashoffset: `${dashOffset}`,
                        transition: 'stroke-dashoffset 0.3s ease 0s'
                    } : {
                        strokeDasharray: '20 42',
                        strokeDashoffset: '0'
                    };
                    const svgClasses = {
                        'spin-circle': true,
                        'spin-circle-determinate': isDeterminate
                    };
                    return b`
        <svg viewBox="0 0 24 24" class=${e$1(svgClasses)} xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" style=${o(circleStyle)}></circle>
        </svg>
      `;
                };
                const spinElement = isSpinning ? b`
          <div class=${e$1(spinWrapperClasses)} part="wrapper">
            <slot name="indicator">
              ${renderIndicator()}
            </slot>
            ${this.tip ? b`<div class="spin-text" part="tip">${this.tip}</div>` : ''}
          </div>
        ` : '';
                if (hasChildren) {
                    return b`
        <div class="spin-nested-loading" part="nested">
          ${spinElement}
          <div class=${e$1(containerClasses)} part="container">
            <slot></slot>
          </div>
        </div>
      `;
                }
                return spinElement;
            }
        }
    }
}();

const meta = {
    title: 'Components/Spin',
    component: 'vi-spin',
    tags: [
        'autodocs'
    ],
    argTypes: {
        spinning: {
            control: 'boolean',
            description: 'Whether the spin is active'
        },
        variant: {
            control: 'select',
            options: [
                'arc',
                'dots'
            ],
            description: 'The visual variant of the spinner'
        },
        size: {
            control: 'select',
            options: [
                'sm',
                'md',
                'lg'
            ],
            description: 'The size of the spin'
        },
        percent: {
            control: 'number',
            description: 'Determinate progress percent (only applies to arc variant)'
        },
        fullscreen: {
            control: 'boolean',
            description: 'Whether the spin covers the entire screen'
        },
        tip: {
            control: 'text',
            description: 'Custom text to display underneath the spinner'
        },
        delay: {
            control: 'number',
            description: 'Delay in milliseconds before showing the spinner'
        }
    }
};
const Default = {
    args: {
        spinning: true
    },
    render: (args)=>b`
    <vi-spin 
      ?spinning=${args.spinning}
      size=${o$1(args.size)}
      variant=${o$1(args.variant)}
      percent=${o$1(args.percent)}
      ?fullscreen=${args.fullscreen}
      tip=${o$1(args.tip)}
      delay=${o$1(args.delay)}
    ></vi-spin>
  `
};
const Sizes = {
    render: ()=>b`
    <div style="display: flex; gap: 24px; align-items: center;">
      <vi-spin size="sm"></vi-spin>
      <vi-spin size="md"></vi-spin>
      <vi-spin size="lg"></vi-spin>
    </div>
  `
};
const InsideContainer = {
    args: {
        spinning: true,
        tip: 'Loading...'
    },
    render: (args)=>b`
    <div style="width: 100%; max-width: 500px;">
      <vi-spin 
        ?spinning=${args.spinning}
        size=${o$1(args.size)}
        tip=${o$1(args.tip)}
        delay=${o$1(args.delay)}
      >
        <vi-alert 
          variant="info" 
          title="Alert message title"
          message="Further details about the context of this alert. This is an example of spinning overlaying content."
        ></vi-alert>
      </vi-spin>
      
      <div style="margin-top: 24px; font-size: 14px;">
        <label>
          <input 
            type="checkbox" 
            ?checked=${args.spinning} 
            @change=${(e)=>{
            const target = e.target;
            const spinEl = document.querySelector('vi-spin');
            if (spinEl) spinEl.spinning = target.checked;
        }} 
          /> Toggle Spinning
        </label>
      </div>
    </div>
  `
};
const CustomTip = {
    args: {
        spinning: true,
        tip: 'Preparing data...'
    },
    render: (args)=>b`
    <vi-spin 
      ?spinning=${args.spinning}
      size=${o$1(args.size)}
      tip=${o$1(args.tip)}
    ></vi-spin>
  `
};
const Variants = {
    render: ()=>b`
    <div style="display: flex; gap: 24px; align-items: center;">
      <vi-spin variant="arc" tip="Arc"></vi-spin>
      <vi-spin variant="dots" tip="Dots"></vi-spin>
    </div>
  `
};
const CustomIndicator = {
    render: ()=>b`
    <vi-spin tip="Loading...">
      <div slot="indicator" style="font-size: 24px; animation: viSpinRotate 2s linear infinite; display: inline-block;">
        🌀
      </div>
    </vi-spin>
  `
};
const DeterminateProgress = {
    render: ()=>b`
    <div style="display: flex; gap: 24px; align-items: center;">
      <vi-spin variant="arc" percent="25" tip="25%"></vi-spin>
      <vi-spin variant="arc" percent="50" tip="50%"></vi-spin>
      <vi-spin variant="arc" percent="75" tip="75%"></vi-spin>
      <vi-spin variant="arc" percent="100" tip="100%"></vi-spin>
    </div>
  `
};
const Fullscreen = {
    args: {
        fullscreen: true,
        tip: 'Loading full screen...'
    },
    render: (args)=>b`
    <div style="height: 200px; padding: 20px; border: 1px solid #ccc;">
      <p>This is a container.</p>
      <button @click=${()=>{
            const spin = document.createElement('vi-spin');
            spin.fullscreen = true;
            spin.tip = 'Loading full screen... closing in 3s';
            document.body.appendChild(spin);
            setTimeout(()=>spin.remove(), 3000);
        }}>
        Show Fullscreen Spinner
      </button>
      ${args.fullscreen ? b`
        <vi-spin ?fullscreen=${args.fullscreen} tip=${args.tip}></vi-spin>
      ` : ''}
    </div>
  `
};
const LottieAnimation = {
    render: ()=>{
        // Inject the Lottie Player script if it doesn't exist
        if (!document.querySelector('script[src*="lottie-player"]')) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
            document.head.appendChild(script);
        }
        return b`
      <vi-spin tip="Loading Lottie...">
        <!-- Replace 'src' with your own Lottie JSON URL -->
        <lottie-player 
          slot="indicator"
          src="https://assets2.lottiefiles.com/packages/lf20_usmfx6bp.json"
          background="transparent" 
          speed="1" 
          style="width: 60px; height: 60px;" 
          loop 
          autoplay
        ></lottie-player>
      </vi-spin>
    `;
    }
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    spinning: true\n  },\n  render: args => html`\n    <vi-spin \n      ?spinning=${args.spinning}\n      size=${ifDefined(args.size)}\n      variant=${ifDefined(args.variant)}\n      percent=${ifDefined(args.percent)}\n      ?fullscreen=${args.fullscreen}\n      tip=${ifDefined(args.tip)}\n      delay=${ifDefined(args.delay)}\n    ></vi-spin>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
Sizes.parameters = {
    ...Sizes.parameters,
    docs: {
        ...Sizes.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 24px; align-items: center;\">\n      <vi-spin size=\"sm\"></vi-spin>\n      <vi-spin size=\"md\"></vi-spin>\n      <vi-spin size=\"lg\"></vi-spin>\n    </div>\n  `\n}",
            ...Sizes.parameters?.docs?.source
        }
    }
};
InsideContainer.parameters = {
    ...InsideContainer.parameters,
    docs: {
        ...InsideContainer.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    spinning: true,\n    tip: 'Loading...'\n  },\n  render: args => html`\n    <div style=\"width: 100%; max-width: 500px;\">\n      <vi-spin \n        ?spinning=${args.spinning}\n        size=${ifDefined(args.size)}\n        tip=${ifDefined(args.tip)}\n        delay=${ifDefined(args.delay)}\n      >\n        <vi-alert \n          variant=\"info\" \n          title=\"Alert message title\"\n          message=\"Further details about the context of this alert. This is an example of spinning overlaying content.\"\n        ></vi-alert>\n      </vi-spin>\n      \n      <div style=\"margin-top: 24px; font-size: 14px;\">\n        <label>\n          <input \n            type=\"checkbox\" \n            ?checked=${args.spinning} \n            @change=${(e: Event) => {\n    const target = e.target as HTMLInputElement;\n    const spinEl = document.querySelector('vi-spin');\n    if (spinEl) spinEl.spinning = target.checked;\n  }} \n          /> Toggle Spinning\n        </label>\n      </div>\n    </div>\n  `\n}",
            ...InsideContainer.parameters?.docs?.source
        }
    }
};
CustomTip.parameters = {
    ...CustomTip.parameters,
    docs: {
        ...CustomTip.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    spinning: true,\n    tip: 'Preparing data...'\n  },\n  render: args => html`\n    <vi-spin \n      ?spinning=${args.spinning}\n      size=${ifDefined(args.size)}\n      tip=${ifDefined(args.tip)}\n    ></vi-spin>\n  `\n}",
            ...CustomTip.parameters?.docs?.source
        }
    }
};
Variants.parameters = {
    ...Variants.parameters,
    docs: {
        ...Variants.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 24px; align-items: center;\">\n      <vi-spin variant=\"arc\" tip=\"Arc\"></vi-spin>\n      <vi-spin variant=\"dots\" tip=\"Dots\"></vi-spin>\n    </div>\n  `\n}",
            ...Variants.parameters?.docs?.source
        }
    }
};
CustomIndicator.parameters = {
    ...CustomIndicator.parameters,
    docs: {
        ...CustomIndicator.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <vi-spin tip=\"Loading...\">\n      <div slot=\"indicator\" style=\"font-size: 24px; animation: viSpinRotate 2s linear infinite; display: inline-block;\">\n        \uD83C\uDF00\n      </div>\n    </vi-spin>\n  `\n}",
            ...CustomIndicator.parameters?.docs?.source
        }
    }
};
DeterminateProgress.parameters = {
    ...DeterminateProgress.parameters,
    docs: {
        ...DeterminateProgress.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 24px; align-items: center;\">\n      <vi-spin variant=\"arc\" percent=\"25\" tip=\"25%\"></vi-spin>\n      <vi-spin variant=\"arc\" percent=\"50\" tip=\"50%\"></vi-spin>\n      <vi-spin variant=\"arc\" percent=\"75\" tip=\"75%\"></vi-spin>\n      <vi-spin variant=\"arc\" percent=\"100\" tip=\"100%\"></vi-spin>\n    </div>\n  `\n}",
            ...DeterminateProgress.parameters?.docs?.source
        }
    }
};
Fullscreen.parameters = {
    ...Fullscreen.parameters,
    docs: {
        ...Fullscreen.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    fullscreen: true,\n    tip: 'Loading full screen...'\n  },\n  render: args => html`\n    <div style=\"height: 200px; padding: 20px; border: 1px solid #ccc;\">\n      <p>This is a container.</p>\n      <button @click=${() => {\n    const spin = document.createElement('vi-spin');\n    spin.fullscreen = true;\n    spin.tip = 'Loading full screen... closing in 3s';\n    document.body.appendChild(spin);\n    setTimeout(() => spin.remove(), 3000);\n  }}>\n        Show Fullscreen Spinner\n      </button>\n      ${args.fullscreen ? html`\n        <vi-spin ?fullscreen=${args.fullscreen} tip=${args.tip}></vi-spin>\n      ` : ''}\n    </div>\n  `\n}",
            ...Fullscreen.parameters?.docs?.source
        }
    }
};
LottieAnimation.parameters = {
    ...LottieAnimation.parameters,
    docs: {
        ...LottieAnimation.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => {\n    // Inject the Lottie Player script if it doesn't exist\n    if (!document.querySelector('script[src*=\"lottie-player\"]')) {\n      const script = document.createElement('script');\n      script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';\n      document.head.appendChild(script);\n    }\n    return html`\n      <vi-spin tip=\"Loading Lottie...\">\n        <!-- Replace 'src' with your own Lottie JSON URL -->\n        <lottie-player \n          slot=\"indicator\"\n          src=\"https://assets2.lottiefiles.com/packages/lf20_usmfx6bp.json\"\n          background=\"transparent\" \n          speed=\"1\" \n          style=\"width: 60px; height: 60px;\" \n          loop \n          autoplay\n        ></lottie-player>\n      </vi-spin>\n    `;\n  }\n}",
            ...LottieAnimation.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","Sizes","InsideContainer","CustomTip","Variants","CustomIndicator","DeterminateProgress","Fullscreen","LottieAnimation"];

export { CustomIndicator, CustomTip, Default, DeterminateProgress, Fullscreen, InsideContainer, LottieAnimation, Sizes, Variants, __namedExportsOrder, meta as default };
