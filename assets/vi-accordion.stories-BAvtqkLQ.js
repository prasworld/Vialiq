import { r, i, b } from './iframe-DPjVeIYZ.js';
import { V as ViElement, t, n } from './vi-element-CFl5z9YB.js';
import { e } from './class-map-LM2mFU0t.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import './preload-helper-D5QYaGzd.js';
import './directive-BKuZRRPO.js';

const accordionStyles = "@charset \"UTF-8\";@layer reset,components,utilities;.accordion{display:flex;flex-direction:column;gap:var(--vi-accordion-gap, 0px);width:100%}.accordion-item{display:flex;flex-direction:column;width:100%;box-sizing:border-box}.accordion-item:not(:last-child){border-bottom:1px solid var(--vi-accordion-border-color, var(--vi-outline, #e5e7eb))}.accordion-header{display:flex;align-items:center;justify-content:space-between;width:100%;padding:var(--vi-accordion-item-header-padding, 14px 16px);background-color:var(--vi-accordion-item-header-bg, transparent);color:var(--vi-accordion-item-label-color, var(--vi-text-primary, #111827));font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-accordion-item-header-font-size, var(--vi-font-size-base, 16px));font-weight:var(--vi-accordion-item-label-font-weight, var(--vi-font-weight-medium, 500));text-align:left;border:none;outline:none;cursor:pointer;box-sizing:border-box;transition:background-color var(--vi-accordion-animation-duration, .2s) ease,color var(--vi-accordion-animation-duration, .2s) ease;-webkit-user-select:none;user-select:none}.accordion-header:hover:not(:disabled){background-color:var(--vi-accordion-item-header-bg-hover, var(--vi-layer-hover-01, #f3f4f6))}.accordion-header:disabled{cursor:not-allowed;opacity:.5}.accordion-header:focus-visible{outline:2px solid var(--vi-focus, #3676d0);outline-offset:-2px}.accordion-header-content{display:flex;align-items:center;gap:var(--vi-spacing-xs, 8px);flex:1}.accordion-label{flex:1}.accordion-chevron{display:inline-flex;align-items:center;justify-content:center;color:var(--vi-accordion-item-chevron-color, var(--vi-text-disabled, #9e9e9e));transition:transform var(--vi-accordion-animation-duration, .2s) ease;margin-inline-start:var(--vi-spacing-xs, 8px)}.accordion-chevron svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.accordion-panel{display:block;overflow:hidden;max-height:0;opacity:0;transition:max-height var(--vi-accordion-animation-duration, .2s) ease-out,opacity var(--vi-accordion-animation-duration, .2s) ease-out}.accordion-panel-inner{padding:var(--vi-accordion-item-body-padding, 0 16px 16px);font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-font-size-sm, 14px);color:var(--vi-text-secondary, #4b5563);box-sizing:border-box}.accordion--bordered{border:1px solid var(--vi-accordion-border-color, var(--vi-outline, #e5e7eb));border-radius:var(--vi-accordion-border-radius, var(--vi-border-radius-md, 4px));overflow:hidden}.accordion--bordered .accordion-item:last-child{border-bottom:none}.accordion--flush,.accordion-item--flush{border:none;border-radius:0}.accordion--flush .accordion-item,.accordion-item--flush .accordion-item,.accordion--flush,.accordion-item--flush{border-inline:none}.accordion--card{--vi-accordion-gap: 8px}.accordion-item--card{border:1px solid var(--vi-accordion-border-color, var(--vi-outline, #e5e7eb));border-radius:var(--vi-accordion-border-radius, var(--vi-border-radius-md, 4px));background-color:var(--vi-card-bg, var(--vi-layer-01, #ffffff));box-shadow:var(--vi-shadow-sm, var(--vi-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, .05)));overflow:hidden}.accordion-item--card:not(:last-child){border-bottom:1px solid var(--vi-accordion-border-color, var(--vi-outline, #e5e7eb))}.accordion--sm,.accordion-item--sm{--vi-accordion-item-header-padding: 10px 12px;--vi-accordion-item-body-padding: 0 12px 12px;--vi-accordion-item-header-font-size: var(--vi-font-size-sm, 14px)}.accordion--md,.accordion-item--md{--vi-accordion-item-header-padding: 14px 16px;--vi-accordion-item-body-padding: 0 16px 16px;--vi-accordion-item-header-font-size: var(--vi-font-size-base, 16px)}.accordion--lg,.accordion-item--lg{--vi-accordion-item-header-padding: 18px 20px;--vi-accordion-item-body-padding: 0 20px 20px;--vi-accordion-item-header-font-size: var(--vi-font-size-lg, 18px)}.accordion-item--open .accordion-header{background-color:var(--vi-accordion-item-header-bg-open, transparent)}.accordion-item--open .accordion-chevron{transform:rotate(90deg)}.accordion-item--open .accordion-panel{max-height:var(--vi-accordion-panel-height, none);opacity:1}@media(prefers-reduced-motion:reduce){.accordion-panel,.accordion-chevron,.accordion-header{transition:none!important}}:host{display:block;width:100%}";

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
var _dec$1, _initClass$1, _ViElement$1, _dec1$1, _dec2$1, _dec3$1, /** Allow multiple items open simultaneously. */ _init_multi, /** Visual style variant: 'default' | 'bordered' | 'flush' | 'card' */ _init_variant$1, /** Sizing of the headers and panels: 'sm' | 'md' | 'lg' */ _init_size$1, _initProto$1;
let _ViAccordion;
_dec$1 = t('vi-accordion'), _dec1$1 = n({
    type: Boolean,
    reflect: true
}), _dec2$1 = n({
    reflect: true
}), _dec3$1 = n({
    reflect: true
});
new class extends _identity$1 {
    constructor(){
        super(_ViAccordion), _initClass$1();
    }
    static{
        class ViAccordion extends (_ViElement$1 = ViElement) {
            static{
                ({ e: [_init_multi, _init_variant$1, _init_size$1, _initProto$1], c: [_ViAccordion, _initClass$1] } = _apply_decs_2203_r$1(this, [
                    [
                        _dec1$1,
                        1,
                        "multi"
                    ],
                    [
                        _dec2$1,
                        1,
                        "variant"
                    ],
                    [
                        _dec3$1,
                        1,
                        "size"
                    ]
                ], [
                    _dec$1
                ], _ViElement$1));
            }
            static styles = i`
    ${r(accordionStyles)}
  `;
            #___private_multi_1 = (_initProto$1(this), _init_multi(this, false));
            get multi() {
                return this.#___private_multi_1;
            }
            set multi(_v) {
                this.#___private_multi_1 = _v;
            }
            #___private_variant_2 = _init_variant$1(this, 'default');
            get variant() {
                return this.#___private_variant_2;
            }
            set variant(_v) {
                this.#___private_variant_2 = _v;
            }
            #___private_size_3 = _init_size$1(this, 'md');
            get size() {
                return this.#___private_size_3;
            }
            set size(_v) {
                this.#___private_size_3 = _v;
            }
            constructor(){
                super();
                this.addEventListener('vi-accordion-before-open', this._handleBeforeItemOpen);
                this.addEventListener('vi-accordion-open', this._handleItemOpen);
                this.addEventListener('vi-accordion-close', this._handleItemClose);
            }
            updated(changed) {
                super.updated(changed);
                if (changed.has('size') || changed.has('variant')) {
                    this._propagateProps();
                }
            }
            _handleSlotChange() {
                this._propagateProps();
            }
            _getAccordionItems() {
                return Array.from(this.querySelectorAll('vi-accordion-item'));
            }
            _propagateProps() {
                const items = this._getAccordionItems();
                items.forEach((item)=>{
                    item.size = this.size;
                    item.variant = this.variant;
                });
            }
            _handleBeforeItemOpen(e) {
                if (this.multi) return;
                const target = e.target;
                if (target.tagName.toLowerCase() !== 'vi-accordion-item') return;
                const targetId = target.itemId;
                const items = this._getAccordionItems();
                const openItems = items.filter((item)=>item.open && item.itemId !== targetId);
                for (const openItem of openItems){
                    const beforeCloseEvent = new CustomEvent('vi-accordion-before-close', {
                        detail: {
                            itemId: targetId
                        },
                        bubbles: true,
                        composed: true,
                        cancelable: true
                    });
                    const isAllowed = openItem.dispatchEvent(beforeCloseEvent);
                    if (!isAllowed) {
                        e.preventDefault();
                        break;
                    }
                }
            }
            _handleItemOpen(e) {
                const target = e.target;
                if (target.tagName.toLowerCase() !== 'vi-accordion-item') return;
                const targetId = target.itemId;
                if (!this.multi) {
                    const items = this._getAccordionItems();
                    items.forEach((item)=>{
                        if (item.itemId !== targetId && item.open) {
                            item.open = false;
                            item.dispatchEvent(new CustomEvent('vi-accordion-close', {
                                detail: {
                                    itemId: item.itemId
                                },
                                bubbles: true,
                                composed: true
                            }));
                        }
                    });
                }
                this._dispatchChangeEvent(targetId, true);
            }
            _handleItemClose(e) {
                const target = e.target;
                if (target.tagName.toLowerCase() !== 'vi-accordion-item') return;
                this._dispatchChangeEvent(target.itemId, false);
            }
            _dispatchChangeEvent(itemId, open) {
                this.dispatchEvent(new CustomEvent('vi-accordion-change', {
                    detail: {
                        itemId,
                        open
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            _onKeyDown(e) {
                const items = this._getAccordionItems().filter((item)=>!item.disabled);
                if (items.length === 0) return;
                const activeElement = document.activeElement;
                // Roving focus matching: check button inside shadow root of accordion items, or host element
                const focusedIndex = items.findIndex((item)=>item === activeElement || item.shadowRoot?.activeElement === activeElement || item === activeElement?.host);
                if (focusedIndex === -1) return;
                let nextIndex = focusedIndex;
                switch(e.key){
                    case 'ArrowDown':
                        nextIndex = (focusedIndex + 1) % items.length;
                        e.preventDefault();
                        break;
                    case 'ArrowUp':
                        nextIndex = (focusedIndex - 1 + items.length) % items.length;
                        e.preventDefault();
                        break;
                    case 'Home':
                        nextIndex = 0;
                        e.preventDefault();
                        break;
                    case 'End':
                        nextIndex = items.length - 1;
                        e.preventDefault();
                        break;
                    default:
                        return;
                }
                const nextItem = items[nextIndex];
                if (nextItem) {
                    const button = nextItem.shadowRoot?.querySelector('button');
                    if (button) {
                        button.focus();
                    }
                }
            }
            render() {
                const containerClasses = e({
                    'accordion': true,
                    'accordion--bordered': this.variant === 'bordered',
                    'accordion--flush': this.variant === 'flush',
                    'accordion--card': this.variant === 'card',
                    'accordion--sm': this.size === 'sm',
                    'accordion--md': this.size === 'md',
                    'accordion--lg': this.size === 'lg'
                });
                return b`
      <div
        class=${containerClasses}
        part="accordion"
        @keydown=${this._onKeyDown}
      >
        <slot @slotchange=${this._handleSlotChange}></slot>
      </div>
    `;
            }
        }
    }
}();

const accordionItemStyles = "@charset \"UTF-8\";@layer reset,components,utilities;.accordion{display:flex;flex-direction:column;gap:var(--vi-accordion-gap, 0px);width:100%}.accordion-item{display:flex;flex-direction:column;width:100%;box-sizing:border-box}.accordion-item:not(:last-child){border-bottom:1px solid var(--vi-accordion-border-color, var(--vi-outline, #e5e7eb))}.accordion-header{display:flex;align-items:center;justify-content:space-between;width:100%;padding:var(--vi-accordion-item-header-padding, 14px 16px);background-color:var(--vi-accordion-item-header-bg, transparent);color:var(--vi-accordion-item-label-color, var(--vi-text-primary, #111827));font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-accordion-item-header-font-size, var(--vi-font-size-base, 16px));font-weight:var(--vi-accordion-item-label-font-weight, var(--vi-font-weight-medium, 500));text-align:left;border:none;outline:none;cursor:pointer;box-sizing:border-box;transition:background-color var(--vi-accordion-animation-duration, .2s) ease,color var(--vi-accordion-animation-duration, .2s) ease;-webkit-user-select:none;user-select:none}.accordion-header:hover:not(:disabled){background-color:var(--vi-accordion-item-header-bg-hover, var(--vi-layer-hover-01, #f3f4f6))}.accordion-header:disabled{cursor:not-allowed;opacity:.5}.accordion-header:focus-visible{outline:2px solid var(--vi-focus, #3676d0);outline-offset:-2px}.accordion-header-content{display:flex;align-items:center;gap:var(--vi-spacing-xs, 8px);flex:1}.accordion-label{flex:1}.accordion-chevron{display:inline-flex;align-items:center;justify-content:center;color:var(--vi-accordion-item-chevron-color, var(--vi-text-disabled, #9e9e9e));transition:transform var(--vi-accordion-animation-duration, .2s) ease;margin-inline-start:var(--vi-spacing-xs, 8px)}.accordion-chevron svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.accordion-panel{display:block;overflow:hidden;max-height:0;opacity:0;transition:max-height var(--vi-accordion-animation-duration, .2s) ease-out,opacity var(--vi-accordion-animation-duration, .2s) ease-out}.accordion-panel-inner{padding:var(--vi-accordion-item-body-padding, 0 16px 16px);font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-font-size-sm, 14px);color:var(--vi-text-secondary, #4b5563);box-sizing:border-box}.accordion--bordered{border:1px solid var(--vi-accordion-border-color, var(--vi-outline, #e5e7eb));border-radius:var(--vi-accordion-border-radius, var(--vi-border-radius-md, 4px));overflow:hidden}.accordion--bordered .accordion-item:last-child{border-bottom:none}.accordion--flush,.accordion-item--flush{border:none;border-radius:0}.accordion--flush .accordion-item,.accordion-item--flush .accordion-item,.accordion--flush,.accordion-item--flush{border-inline:none}.accordion--card{--vi-accordion-gap: 8px}.accordion-item--card{border:1px solid var(--vi-accordion-border-color, var(--vi-outline, #e5e7eb));border-radius:var(--vi-accordion-border-radius, var(--vi-border-radius-md, 4px));background-color:var(--vi-card-bg, var(--vi-layer-01, #ffffff));box-shadow:var(--vi-shadow-sm, var(--vi-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, .05)));overflow:hidden}.accordion-item--card:not(:last-child){border-bottom:1px solid var(--vi-accordion-border-color, var(--vi-outline, #e5e7eb))}.accordion--sm,.accordion-item--sm{--vi-accordion-item-header-padding: 10px 12px;--vi-accordion-item-body-padding: 0 12px 12px;--vi-accordion-item-header-font-size: var(--vi-font-size-sm, 14px)}.accordion--md,.accordion-item--md{--vi-accordion-item-header-padding: 14px 16px;--vi-accordion-item-body-padding: 0 16px 16px;--vi-accordion-item-header-font-size: var(--vi-font-size-base, 16px)}.accordion--lg,.accordion-item--lg{--vi-accordion-item-header-padding: 18px 20px;--vi-accordion-item-body-padding: 0 20px 20px;--vi-accordion-item-header-font-size: var(--vi-font-size-lg, 18px)}.accordion-item--open .accordion-header{background-color:var(--vi-accordion-item-header-bg-open, transparent)}.accordion-item--open .accordion-chevron{transform:rotate(90deg)}.accordion-item--open .accordion-panel{max-height:var(--vi-accordion-panel-height, none);opacity:1}@media(prefers-reduced-motion:reduce){.accordion-panel,.accordion-chevron,.accordion-header{transition:none!important}}:host{display:block;width:100%}";

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
var _dec, _initClass, _ViElement, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, /** Unique ID for the item. */ _init_itemId, /** Expanded state. */ _init_open, /** Disabled state. */ _init_disabled, /** Plain text header label. */ _init_label, /** Sizing of the item (propagated by parent accordion). */ _init_size, /** Visual variant (propagated by parent accordion). */ _init_variant, _initProto;
// Self-register chevron-right icon to support out-of-the-box rendering
const chevronRightIcon = {
    name: 'chevron-right',
    data: '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>'
};
registerIcons([
    chevronRightIcon
]);
let _ViAccordionItem;
_dec = t('vi-accordion-item'), _dec1 = n({
    reflect: true,
    attribute: 'item-id'
}), _dec2 = n({
    type: Boolean,
    reflect: true
}), _dec3 = n({
    type: Boolean,
    reflect: true
}), _dec4 = n(), _dec5 = n({
    reflect: true
}), _dec6 = n({
    reflect: true
});
new class extends _identity {
    constructor(){
        super(_ViAccordionItem), _initClass();
    }
    static{
        class ViAccordionItem extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_itemId, _init_open, _init_disabled, _init_label, _init_size, _init_variant, _initProto], c: [_ViAccordionItem, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "itemId"
                    ],
                    [
                        _dec2,
                        1,
                        "open"
                    ],
                    [
                        _dec3,
                        1,
                        "disabled"
                    ],
                    [
                        _dec4,
                        1,
                        "label"
                    ],
                    [
                        _dec5,
                        1,
                        "size"
                    ],
                    [
                        _dec6,
                        1,
                        "variant"
                    ]
                ], [
                    _dec
                ], _ViElement));
            }
            static styles = i`
    ${r(accordionItemStyles)}
  `;
            #___private_itemId_1 = (_initProto(this), _init_itemId(this, `vi-accordion-item-${Math.random().toString(36).substring(2, 9)}`));
            get itemId() {
                return this.#___private_itemId_1;
            }
            set itemId(_v) {
                this.#___private_itemId_1 = _v;
            }
            #___private_open_2 = _init_open(this, false);
            get open() {
                return this.#___private_open_2;
            }
            set open(_v) {
                this.#___private_open_2 = _v;
            }
            #___private_disabled_3 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_3;
            }
            set disabled(_v) {
                this.#___private_disabled_3 = _v;
            }
            #___private_label_4 = _init_label(this, '');
            get label() {
                return this.#___private_label_4;
            }
            set label(_v) {
                this.#___private_label_4 = _v;
            }
            #___private_size_5 = _init_size(this, 'md');
            get size() {
                return this.#___private_size_5;
            }
            set size(_v) {
                this.#___private_size_5 = _v;
            }
            #___private_variant_6 = _init_variant(this, 'default');
            get variant() {
                return this.#___private_variant_6;
            }
            set variant(_v) {
                this.#___private_variant_6 = _v;
            }
            _resizeObserver;
            firstUpdated(changedProperties) {
                super.firstUpdated(changedProperties);
                const inner = this.shadowRoot?.querySelector('.accordion-panel-inner');
                if (inner) {
                    this._resizeObserver = new ResizeObserver((entries)=>{
                        const entry = entries[0];
                        if (entry) {
                            const height = entry.contentRect.height;
                            this.style.setProperty('--vi-accordion-panel-height', `${height}px`);
                        }
                    });
                    this._resizeObserver.observe(inner);
                }
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                if (this._resizeObserver) {
                    this._resizeObserver.disconnect();
                }
            }
            _handleHeaderClick() {
                if (this.disabled) return;
                const targetState = !this.open;
                const beforeEventName = targetState ? 'vi-accordion-before-open' : 'vi-accordion-before-close';
                const beforeEvent = new CustomEvent(beforeEventName, {
                    detail: {
                        itemId: this.itemId
                    },
                    bubbles: true,
                    composed: true,
                    cancelable: true
                });
                const isAllowed = this.dispatchEvent(beforeEvent);
                if (!isAllowed) {
                    return;
                }
                this.open = targetState;
                const finalEventName = this.open ? 'vi-accordion-open' : 'vi-accordion-close';
                this.dispatchEvent(new CustomEvent(finalEventName, {
                    detail: {
                        itemId: this.itemId
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            render() {
                const itemClasses = e({
                    'accordion-item': true,
                    'accordion-item--open': this.open,
                    'accordion-item--disabled': this.disabled,
                    'accordion-item--sm': this.size === 'sm',
                    'accordion-item--md': this.size === 'md',
                    'accordion-item--lg': this.size === 'lg',
                    'accordion-item--bordered': this.variant === 'bordered',
                    'accordion-item--flush': this.variant === 'flush',
                    'accordion-item--card': this.variant === 'card'
                });
                return b`
      <div class=${itemClasses} part="item">
        <button
          type="button"
          class="accordion-header"
          part="header"
          ?disabled=${this.disabled}
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-controls="panel-${this.itemId}"
          id="header-${this.itemId}"
          @click=${this._handleHeaderClick}
        >
          <div class="accordion-header-content">
            <slot name="header-icon" part="header-icon"></slot>
            <slot name="header" part="label">
              <span class="accordion-label-text">${this.label}</span>
            </slot>
            <slot name="header-actions" part="header-actions"></slot>
          </div>
          <vi-icon
            name="chevron-right"
            part="chevron"
            class="accordion-chevron"
          ></vi-icon>
        </button>
        <div
          id="panel-${this.itemId}"
          class="accordion-panel"
          part="panel"
          role="region"
          aria-labelledby="header-${this.itemId}"
        >
          <div class="accordion-panel-inner" part="panel-inner">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
            }
        }
    }
}();

const meta = {
    title: 'Components/Accordion',
    tags: [
        'autodocs'
    ],
    argTypes: {
        multi: {
            control: 'boolean',
            description: 'Allows multiple items to be expanded at the same time'
        },
        variant: {
            control: 'select',
            options: [
                'default',
                'bordered',
                'flush',
                'card'
            ],
            description: 'The visual variant of the accordion'
        },
        size: {
            control: 'select',
            options: [
                'sm',
                'md',
                'lg'
            ],
            description: 'The size/padding scaling of the accordion'
        }
    }
};
const Accordion = {
    args: {
        multi: false,
        variant: 'default',
        size: 'md'
    },
    render: (args)=>b`
    <div style="width: 100%; padding: 2rem; box-sizing: border-box;">
      <vi-accordion
        ?multi=${args.multi}
        variant=${args.variant}
        size=${args.size}
      >
        <vi-accordion-item label="Personal Information">
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            This section contains personal user details. You can configure your profile details, edit your contact number, and update home addresses inside this accordion region.
          </p>
        </vi-accordion-item>
        <vi-accordion-item label="Security &amp; Privacy">
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            Configure your account authentication methods, review active sessions, manage trusted devices, and edit security preference settings here.
          </p>
        </vi-accordion-item>
        <vi-accordion-item label="Billing Preferences (Disabled)" disabled>
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            This content is non-interactive because the accordion item itself has the disabled property set.
          </p>
        </vi-accordion-item>
        <vi-accordion-item label="Notification Settings">
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            Toggle email notifications, specify mobile SMS alert options, select real-time desktop push preferences, and configure automated weekly digests.
          </p>
        </vi-accordion-item>
      </vi-accordion>
    </div>
  `
};
const CardVariant = {
    name: 'Card Variant',
    args: {
        multi: true,
        variant: 'card',
        size: 'md'
    },
    render: (args)=>b`
    <div style="width: 100%; padding: 2rem; box-sizing: border-box; background-color: #f9fafb; border-radius: 8px;">
      <vi-accordion
        ?multi=${args.multi}
        variant=${args.variant}
        size=${args.size}
      >
        <vi-accordion-item label="Section 1: Overview">
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            The card variant applies a distinct border, shadow, background, and visual gap layout configuration. It works exceptionally well in settings where each section represents an isolated topic card.
          </p>
        </vi-accordion-item>
        <vi-accordion-item label="Section 2: Benefits">
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            Provides clear spacing and separation between items, visual elevation shadows, clean borders, and modular structure.
          </p>
        </vi-accordion-item>
      </vi-accordion>
    </div>
  `
};
const SlottedContent = {
    name: 'Slotted Header & Actions',
    render: ()=>b`
    <div style="width: 100%; padding: 2rem; box-sizing: border-box;">
      <vi-accordion>
        <vi-accordion-item>
          <span slot="header" style="font-weight: 600; color: #1e3a8a;">
            🔥 Advanced Custom Header
          </span>
          <span slot="header-actions" style="background-color: #ef4444; color: white; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 9999px; font-weight: bold;">
            HOT
          </span>
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            You can slot custom HTML elements directly into the header by targeting the <code>slot="header"</code> and <code>slot="header-actions"</code> parameters on the accordion item.
          </p>
        </vi-accordion-item>
        <vi-accordion-item label="Standard Header">
          <span slot="header-actions" style="background-color: #3b82f6; color: white; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 4px;">
            New Info
          </span>
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            This item uses the standard plain-text label attribute but includes a slotted trailing action badge.
          </p>
        </vi-accordion-item>
      </vi-accordion>
    </div>
  `
};
const EventCancellation = {
    name: 'Event Cancellation (Conditional Toggle)',
    render: ()=>{
        const handleBeforeOpen = (e)=>{
            const checkbox = document.getElementById('lock-open-checkbox');
            if (checkbox && checkbox.checked) {
                e.preventDefault();
                alert('Opening prevented because "Lock Open" is checked!');
            }
        };
        const handleBeforeClose = (e)=>{
            const checkbox = document.getElementById('lock-close-checkbox');
            if (checkbox && checkbox.checked) {
                e.preventDefault();
                alert('Closing prevented because "Lock Close" is checked!');
            }
        };
        return b`
      <div style="width: 100%; padding: 2rem; box-sizing: border-box; font-family: sans-serif;">
        <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem; padding: 1rem; background-color: #f3f4f6; border-radius: 6px; font-size: 0.875rem; max-width: 600px; box-sizing: border-box;">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none;">
            <input type="checkbox" id="lock-open-checkbox" checked />
            <strong>Lock Open</strong> (Prevents expansion)
          </label>
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none;">
            <input type="checkbox" id="lock-close-checkbox" />
            <strong>Lock Close</strong> (Prevents collapse)
          </label>
        </div>
        <vi-accordion style="max-width: 600px;">
          <vi-accordion-item
            label="Conditional Accordion Section"
            @vi-accordion-before-open=${handleBeforeOpen}
            @vi-accordion-before-close=${handleBeforeClose}
          >
            <p style="margin: 0; line-height: 1.5; color: #4b5563; font-size: 0.875rem;">
              Try toggling this section with the checkboxes enabled. This demonstrates how parent applications can dynamically inspect conditions (such as unsaved forms or missing validation states) and intercept the <code>vi-accordion-before-open</code> and <code>vi-accordion-before-close</code> events.
            </p>
          </vi-accordion-item>
        </vi-accordion>
      </div>
    `;
    }
};
const CoordinatedCancellation = {
    name: 'Multi-Item Coordinated Cancellation',
    args: {
        multi: false
    },
    render: (args)=>{
        const handleBeforeCloseSection1 = (e)=>{
            const checkbox = document.getElementById('lock-sec1-close');
            if (checkbox && checkbox.checked) {
                const isDirectClose = document.activeElement && document.activeElement.closest('vi-accordion-item') === e.currentTarget;
                // Find if accordion is currently in multi-open mode
                const accordion = document.querySelector('vi-accordion');
                const isMulti = accordion ? accordion.multi : false;
                console.log(e.detail);
                if (isDirectClose) {
                    e.preventDefault();
                    alert('Section 1 close prevented!');
                } else if (!isMulti) {
                    e.preventDefault();
                    alert('Section 1 close prevented! Opening other sections is blocked in single-open mode.');
                }
            }
        };
        return b`
      <div style="width: 100%; padding: 2rem; box-sizing: border-box; font-family: sans-serif;">
        <div style="margin-bottom: 1.5rem; padding: 1rem; background-color: #f3f4f6; border-radius: 6px; font-size: 0.875rem; max-width: 600px; box-sizing: border-box;">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none;">
            <input type="checkbox" id="lock-sec1-close" checked />
            <strong>Lock Section 1 Close</strong> (When checked, Section 1 cannot close, blocking other sections from opening in single-open mode)
          </label>
        </div>
        <vi-accordion style="max-width: 600px;" ?multi=${args.multi}>
          <vi-accordion-item
            item-id="sec-1"
            label="Section 1: Required Form Inputs (Open by default)"
            open
            @vi-accordion-before-close=${handleBeforeCloseSection1}
          >
            <p style="margin: 0; line-height: 1.5; color: #4b5563; font-size: 0.875rem;">
              This section is configured to prevent closure when the checkbox above is checked. In single-open mode (multi=false), attempting to open any other section will trigger a close check on Section 1. Since Section 1 prevents closing, the other sections will remain closed. In multi-open mode (multi=true), you can open other sections freely alongside Section 1.
            </p>
          </vi-accordion-item>
          <vi-accordion-item
            item-id="sec-2"
            label="Section 2: Next Step"
          >
            <p style="margin: 0; line-height: 1.5; color: #4b5563; font-size: 0.875rem;">
              You can only view this section once Section 1 is allowed to close (uncheck the checkbox above) or when multi-open is enabled.
            </p>
          </vi-accordion-item>
          <vi-accordion-item
            item-id="sec-3"
            label="Section 3: Final Step"
          >
            <p style="margin: 0; line-height: 1.5; color: #4b5563; font-size: 0.875rem;">
              This is the final accordion section.
            </p>
          </vi-accordion-item>
        </vi-accordion>
      </div>
    `;
    }
};
Accordion.parameters = {
    ...Accordion.parameters,
    docs: {
        ...Accordion.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    multi: false,\n    variant: 'default',\n    size: 'md'\n  },\n  render: args => html`\n    <div style=\"width: 100%; padding: 2rem; box-sizing: border-box;\">\n      <vi-accordion\n        ?multi=${args.multi}\n        variant=${args.variant}\n        size=${args.size}\n      >\n        <vi-accordion-item label=\"Personal Information\">\n          <p style=\"margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;\">\n            This section contains personal user details. You can configure your profile details, edit your contact number, and update home addresses inside this accordion region.\n          </p>\n        </vi-accordion-item>\n        <vi-accordion-item label=\"Security &amp; Privacy\">\n          <p style=\"margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;\">\n            Configure your account authentication methods, review active sessions, manage trusted devices, and edit security preference settings here.\n          </p>\n        </vi-accordion-item>\n        <vi-accordion-item label=\"Billing Preferences (Disabled)\" disabled>\n          <p style=\"margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;\">\n            This content is non-interactive because the accordion item itself has the disabled property set.\n          </p>\n        </vi-accordion-item>\n        <vi-accordion-item label=\"Notification Settings\">\n          <p style=\"margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;\">\n            Toggle email notifications, specify mobile SMS alert options, select real-time desktop push preferences, and configure automated weekly digests.\n          </p>\n        </vi-accordion-item>\n      </vi-accordion>\n    </div>\n  `\n}",
            ...Accordion.parameters?.docs?.source
        }
    }
};
CardVariant.parameters = {
    ...CardVariant.parameters,
    docs: {
        ...CardVariant.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Card Variant',\n  args: {\n    multi: true,\n    variant: 'card',\n    size: 'md'\n  },\n  render: args => html`\n    <div style=\"width: 100%; padding: 2rem; box-sizing: border-box; background-color: #f9fafb; border-radius: 8px;\">\n      <vi-accordion\n        ?multi=${args.multi}\n        variant=${args.variant}\n        size=${args.size}\n      >\n        <vi-accordion-item label=\"Section 1: Overview\">\n          <p style=\"margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;\">\n            The card variant applies a distinct border, shadow, background, and visual gap layout configuration. It works exceptionally well in settings where each section represents an isolated topic card.\n          </p>\n        </vi-accordion-item>\n        <vi-accordion-item label=\"Section 2: Benefits\">\n          <p style=\"margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;\">\n            Provides clear spacing and separation between items, visual elevation shadows, clean borders, and modular structure.\n          </p>\n        </vi-accordion-item>\n      </vi-accordion>\n    </div>\n  `\n}",
            ...CardVariant.parameters?.docs?.source
        }
    }
};
SlottedContent.parameters = {
    ...SlottedContent.parameters,
    docs: {
        ...SlottedContent.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Slotted Header & Actions',\n  render: () => html`\n    <div style=\"width: 100%; padding: 2rem; box-sizing: border-box;\">\n      <vi-accordion>\n        <vi-accordion-item>\n          <span slot=\"header\" style=\"font-weight: 600; color: #1e3a8a;\">\n            \uD83D\uDD25 Advanced Custom Header\n          </span>\n          <span slot=\"header-actions\" style=\"background-color: #ef4444; color: white; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 9999px; font-weight: bold;\">\n            HOT\n          </span>\n          <p style=\"margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;\">\n            You can slot custom HTML elements directly into the header by targeting the <code>slot=\"header\"</code> and <code>slot=\"header-actions\"</code> parameters on the accordion item.\n          </p>\n        </vi-accordion-item>\n        <vi-accordion-item label=\"Standard Header\">\n          <span slot=\"header-actions\" style=\"background-color: #3b82f6; color: white; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 4px;\">\n            New Info\n          </span>\n          <p style=\"margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;\">\n            This item uses the standard plain-text label attribute but includes a slotted trailing action badge.\n          </p>\n        </vi-accordion-item>\n      </vi-accordion>\n    </div>\n  `\n}",
            ...SlottedContent.parameters?.docs?.source
        }
    }
};
EventCancellation.parameters = {
    ...EventCancellation.parameters,
    docs: {
        ...EventCancellation.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Event Cancellation (Conditional Toggle)',\n  render: () => {\n    const handleBeforeOpen = (e: Event) => {\n      const checkbox = document.getElementById('lock-open-checkbox') as HTMLInputElement;\n      if (checkbox && checkbox.checked) {\n        e.preventDefault();\n        alert('Opening prevented because \"Lock Open\" is checked!');\n      }\n    };\n    const handleBeforeClose = (e: Event) => {\n      const checkbox = document.getElementById('lock-close-checkbox') as HTMLInputElement;\n      if (checkbox && checkbox.checked) {\n        e.preventDefault();\n        alert('Closing prevented because \"Lock Close\" is checked!');\n      }\n    };\n    return html`\n      <div style=\"width: 100%; padding: 2rem; box-sizing: border-box; font-family: sans-serif;\">\n        <div style=\"display: flex; gap: 1.5rem; margin-bottom: 1.5rem; padding: 1rem; background-color: #f3f4f6; border-radius: 6px; font-size: 0.875rem; max-width: 600px; box-sizing: border-box;\">\n          <label style=\"display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none;\">\n            <input type=\"checkbox\" id=\"lock-open-checkbox\" checked />\n            <strong>Lock Open</strong> (Prevents expansion)\n          </label>\n          <label style=\"display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none;\">\n            <input type=\"checkbox\" id=\"lock-close-checkbox\" />\n            <strong>Lock Close</strong> (Prevents collapse)\n          </label>\n        </div>\n        <vi-accordion style=\"max-width: 600px;\">\n          <vi-accordion-item\n            label=\"Conditional Accordion Section\"\n            @vi-accordion-before-open=${handleBeforeOpen}\n            @vi-accordion-before-close=${handleBeforeClose}\n          >\n            <p style=\"margin: 0; line-height: 1.5; color: #4b5563; font-size: 0.875rem;\">\n              Try toggling this section with the checkboxes enabled. This demonstrates how parent applications can dynamically inspect conditions (such as unsaved forms or missing validation states) and intercept the <code>vi-accordion-before-open</code> and <code>vi-accordion-before-close</code> events.\n            </p>\n          </vi-accordion-item>\n        </vi-accordion>\n      </div>\n    `;\n  }\n}",
            ...EventCancellation.parameters?.docs?.source
        }
    }
};
CoordinatedCancellation.parameters = {
    ...CoordinatedCancellation.parameters,
    docs: {
        ...CoordinatedCancellation.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Multi-Item Coordinated Cancellation',\n  args: {\n    multi: false\n  },\n  render: args => {\n    const handleBeforeCloseSection1 = (e: CustomEvent) => {\n      const checkbox = document.getElementById('lock-sec1-close') as HTMLInputElement;\n      if (checkbox && checkbox.checked) {\n        const isDirectClose = document.activeElement && document.activeElement.closest('vi-accordion-item') === e.currentTarget;\n\n        // Find if accordion is currently in multi-open mode\n        const accordion = document.querySelector('vi-accordion') as ViAccordion | null;\n        const isMulti = accordion ? accordion.multi : false;\n        console.log(e.detail);\n        if (isDirectClose) {\n          e.preventDefault();\n          alert('Section 1 close prevented!');\n        } else if (!isMulti) {\n          e.preventDefault();\n          alert('Section 1 close prevented! Opening other sections is blocked in single-open mode.');\n        }\n      }\n    };\n    return html`\n      <div style=\"width: 100%; padding: 2rem; box-sizing: border-box; font-family: sans-serif;\">\n        <div style=\"margin-bottom: 1.5rem; padding: 1rem; background-color: #f3f4f6; border-radius: 6px; font-size: 0.875rem; max-width: 600px; box-sizing: border-box;\">\n          <label style=\"display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none;\">\n            <input type=\"checkbox\" id=\"lock-sec1-close\" checked />\n            <strong>Lock Section 1 Close</strong> (When checked, Section 1 cannot close, blocking other sections from opening in single-open mode)\n          </label>\n        </div>\n        <vi-accordion style=\"max-width: 600px;\" ?multi=${args.multi}>\n          <vi-accordion-item\n            item-id=\"sec-1\"\n            label=\"Section 1: Required Form Inputs (Open by default)\"\n            open\n            @vi-accordion-before-close=${handleBeforeCloseSection1}\n          >\n            <p style=\"margin: 0; line-height: 1.5; color: #4b5563; font-size: 0.875rem;\">\n              This section is configured to prevent closure when the checkbox above is checked. In single-open mode (multi=false), attempting to open any other section will trigger a close check on Section 1. Since Section 1 prevents closing, the other sections will remain closed. In multi-open mode (multi=true), you can open other sections freely alongside Section 1.\n            </p>\n          </vi-accordion-item>\n          <vi-accordion-item\n            item-id=\"sec-2\"\n            label=\"Section 2: Next Step\"\n          >\n            <p style=\"margin: 0; line-height: 1.5; color: #4b5563; font-size: 0.875rem;\">\n              You can only view this section once Section 1 is allowed to close (uncheck the checkbox above) or when multi-open is enabled.\n            </p>\n          </vi-accordion-item>\n          <vi-accordion-item\n            item-id=\"sec-3\"\n            label=\"Section 3: Final Step\"\n          >\n            <p style=\"margin: 0; line-height: 1.5; color: #4b5563; font-size: 0.875rem;\">\n              This is the final accordion section.\n            </p>\n          </vi-accordion-item>\n        </vi-accordion>\n      </div>\n    `;\n  }\n}",
            ...CoordinatedCancellation.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Accordion","CardVariant","SlottedContent","EventCancellation","CoordinatedCancellation"];

export { Accordion, CardVariant, CoordinatedCancellation, EventCancellation, SlottedContent, __namedExportsOrder, meta as default };
