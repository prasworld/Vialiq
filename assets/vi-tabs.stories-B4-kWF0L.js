import { r as r$1, i, A, b, D } from './iframe-D4zu5Ix9.js';
import { V as ViElement, t, n } from './vi-element-BRb8_cc9.js';
import { r } from './state-CLgu7NT9.js';
import { e } from './class-map-BrS1GRSy.js';
import { c } from './repeat-D3JR502n.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import { c as chevronDownIcon } from './chevron-down-BU8Kh4z3.js';
import { c as chevronLeftIcon, p as plusIcon } from './plus-CDg69l9Y.js';
import { c as chevronRightIcon } from './chevron-right-C38rqkF2.js';
import './preload-helper-D5QYaGzd.js';
import './directive-BKuZRRPO.js';

const tabsStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.vi-tabs{display:grid;grid-template-columns:minmax(0,1fr);position:relative}.vi-tabs__scroll-btn{grid-area:1/1;align-self:stretch;display:flex;align-items:center;justify-content:center;width:48px;z-index:10;border:none;color:var(--vi-tabs-text-color, var(--vi-text-primary, #111827));cursor:pointer;transition:opacity .2s}.vi-tabs__scroll-btn[disabled]{opacity:0;pointer-events:none}.vi-tabs__scroll-btn:hover,.vi-tabs__scroll-btn:focus-visible{color:var(--vi-tabs-primary-color, var(--vi-color-primary, #3676d0));outline:none}.vi-tabs__scroll-btn--left{justify-self:start;background:linear-gradient(to right,var(--vi-tabs-surface-primary, var(--vi-layer-01, #ffffff)) 50%,transparent 100%);padding-right:12px}.vi-tabs__scroll-btn--right{justify-self:end;background:linear-gradient(to left,var(--vi-tabs-surface-primary, var(--vi-layer-01, #ffffff)) 50%,transparent 100%);padding-left:12px}.vi-tabs__add-btn{display:flex;align-items:center;justify-content:center;width:48px;height:48px;flex-shrink:0;background:transparent;border:none;border-radius:50%;color:var(--vi-tabs-add-btn-color, var(--vi-text-secondary, #4b5563));cursor:pointer;margin-left:4px;outline:none;position:relative;transition:background-color .2s,color .2s;order:9998}.vi-tabs__add-btn:before{content:\"\";position:absolute;inset:4px;border-radius:50%;background-color:currentColor;opacity:0;transition:opacity .2s}.vi-tabs__add-btn:hover:before,.vi-tabs__add-btn:focus-visible:before{opacity:.08}.vi-tabs__add-btn:active:before{opacity:.12}.vi-tabs__add-btn:focus-visible{border-radius:.25rem;outline:2px solid var(--vi-tabs-focus-ring, var(--vi-color-primary, #3676d0));outline-offset:2px}.vi-tabs__add-btn svg{position:relative}.vi-tabs__tablist{grid-area:1/1;position:relative;display:flex;flex-direction:row;align-items:stretch;gap:0;overflow:visible;min-width:0}.vi-tabs__cursor{position:absolute;top:0;left:0;pointer-events:none;opacity:0;z-index:0;transition:left .22s cubic-bezier(.4,0,.2,1),top .22s cubic-bezier(.4,0,.2,1),width .22s cubic-bezier(.4,0,.2,1),height .22s cubic-bezier(.4,0,.2,1),opacity .12s ease}.vi-tabs__indicator{position:absolute;bottom:0;left:0;height:var(--vi-tabs-indicator-thickness, 2px);width:0;background:var(--vi-tabs-indicator-color, var(--vi-color-primary, #3676d0));border-radius:.125rem .125rem 0 0;opacity:0;pointer-events:none;z-index:2;transition:left .22s cubic-bezier(.4,0,.2,1),width .22s cubic-bezier(.4,0,.2,1),top .22s cubic-bezier(.4,0,.2,1),height .22s cubic-bezier(.4,0,.2,1),opacity .12s ease}.vi-tabs--line .vi-tabs__tablist{border-bottom:1px solid var(--vi-tabs-border-color, var(--vi-color-grey-200, #eeeeee));background:transparent;padding:0;gap:0}.vi-tabs--line .vi-tabs__cursor{display:none}.vi-tabs--line .vi-tabs__indicator{bottom:-1px;height:2px;background:var(--vi-tabs-primary-color, var(--vi-color-primary, #3676d0));border-radius:.125rem .125rem 0 0;box-shadow:0 0 0 0 transparent}.vi-tabs--pill .vi-tabs__tablist{background:var(--vi-tabs-pill-bg, var(--vi-color-grey-100, #f5f5f5));border:1px solid var(--vi-tabs-border-color, var(--vi-color-border, #e5e7eb));border-radius:.625rem;padding:var(--vi-tabs-spacing-xs, 4px);gap:var(--vi-tabs-gap-xs, 2px);box-shadow:var(--vi-shadow-inner-deep, inset 0 1px 3px rgba(0, 0, 0, .07), inset 0 1px 2px rgba(0, 0, 0, .04))}.vi-tabs--pill .vi-tabs__cursor{display:block;inset:4px auto;border-radius:.4375rem;background:var(--vi-tabs-surface-primary, var(--vi-layer-01, #ffffff));box-shadow:var(--vi-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, .03))}.vi-tabs--pill .vi-tabs__indicator{display:none}.vi-tabs--secondary .vi-tabs__tablist{border-bottom:1px solid var(--vi-tabs-border-color, var(--vi-color-border, #e5e7eb));background:transparent;padding:0}.vi-tabs--secondary .vi-tabs__cursor{display:none}.vi-tabs--secondary .vi-tabs__indicator{bottom:-1px;height:2px;background:var(--vi-tabs-primary-color, var(--vi-color-primary, #3676d0));border-radius:.125rem .125rem 0 0}.vi-tabs--card .vi-tabs__tablist{background:var(--vi-tabs-surface-secondary, var(--vi-layer-02, #f3f4f6));border-bottom:1px solid var(--vi-tabs-border-color, var(--vi-color-border, #e5e7eb));padding:var(--vi-tabs-spacing-md-md-none, 8px 8px 0);gap:var(--vi-tabs-gap-sm, 4px);align-items:flex-end}.vi-tabs--card .vi-tabs__cursor{display:block;border-radius:.5rem .5rem 0 0;background:var(--vi-tabs-surface-primary, var(--vi-layer-01, #ffffff));border:1px solid var(--vi-tabs-border-color, var(--vi-color-border, #e5e7eb));border-bottom-color:var(--vi-tabs-surface-primary, var(--vi-layer-01, #ffffff));margin-top:8px;box-shadow:var(--vi-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, .03))}.vi-tabs--card .vi-tabs__indicator{display:none}.vi-tabs--enclosed{border:1px solid var(--vi-tabs-border-color, var(--vi-color-border, #e5e7eb));border-radius:.625rem;overflow:clip;box-shadow:var(--vi-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, .03))}.vi-tabs--enclosed .vi-tabs__tablist{background:var(--vi-tabs-surface-secondary, var(--vi-layer-02, #f3f4f6));border-bottom:1px solid var(--vi-tabs-border-color, var(--vi-color-border, #e5e7eb));padding:0;gap:0}.vi-tabs--enclosed .vi-tabs__cursor{display:block;top:0;border-radius:0;background:rgba(var(--vi-color-primary, #3676d0),.06);border-right:1px solid var(--vi-tabs-border-color, var(--vi-color-border, #e5e7eb));border-left:1px solid var(--vi-tabs-border-color, var(--vi-color-border, #e5e7eb))}.vi-tabs--enclosed .vi-tabs__indicator{bottom:0;height:3px;background:var(--vi-tabs-primary-color, var(--vi-color-primary, #3676d0));box-shadow:0 0 8px color-mix(in srgb,var(--vi-color-primary, #3676d0) 50%,transparent);border-radius:0}.vi-tabs--enclosed ::slotted(vi-tab){border-right:1px solid var(--vi-tabs-border-color, var(--vi-color-border, #e5e7eb))!important;min-height:44px!important}.vi-tabs--vertical{grid-template-columns:auto minmax(0,1fr);align-items:stretch}.vi-tabs--vertical .vi-tabs__tablist{flex-direction:column;align-items:stretch;background:var(--vi-tabs-surface-secondary, var(--vi-layer-02, #f3f4f6));border-right:1px solid var(--vi-tabs-border-color, var(--vi-color-border, #e5e7eb));border-bottom:none;padding:var(--vi-tabs-spacing-sm-xs, 6px 4px);min-width:168px;gap:var(--vi-tabs-gap-xs, 2px)}.vi-tabs--vertical .vi-tabs__cursor{display:block;left:4px!important;right:4px;width:calc(100% - 8px)!important;border-radius:.5rem;background:var(--vi-tabs-surface-primary, var(--vi-layer-01, #ffffff));box-shadow:var(--vi-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, .03))}.vi-tabs--vertical .vi-tabs__indicator{inset:0 0 auto auto;width:3px!important;height:0;border-radius:.1875rem 0 0 .1875rem;background:var(--vi-tabs-primary-color, var(--vi-color-primary, #3676d0));box-shadow:0 0 6px color-mix(in srgb,var(--vi-color-primary, #3676d0) 40%,transparent)}.vi-tabs--vertical ::slotted(vi-tab){justify-content:flex-start!important;min-height:40px!important;text-align:left!important}.vi-tabs--vertical.vi-tabs--line ::slotted(vi-tab[active]){background:var(--vi-tabs-surface-primary, var(--vi-layer-01, #ffffff));border-radius:.5rem}@media(prefers-reduced-motion:reduce){.vi-tabs__cursor,.vi-tabs__indicator{transition:opacity .1s ease}}.vi-tabs--overflow-scroll .vi-tabs__tablist{overflow-x:auto;overflow-y:hidden;scrollbar-width:none}.vi-tabs--overflow-scroll .vi-tabs__tablist::-webkit-scrollbar{display:none}.vi-tabs--overflow-scroll .vi-tabs__tablist{mask-image:linear-gradient(to right,transparent 0%,black 24px,black calc(100% - 24px),transparent 100%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 24px,black calc(100% - 24px),transparent 100%)}.vi-tabs--overflow-scroll .vi-tabs__tablist[data-scroll-start]{mask-image:linear-gradient(to right,black 0%,black calc(100% - 24px),transparent 100%);-webkit-mask-image:linear-gradient(to right,black 0%,black calc(100% - 24px),transparent 100%)}.vi-tabs--overflow-scroll .vi-tabs__tablist[data-scroll-end]{mask-image:linear-gradient(to right,transparent 0%,black 24px,black 100%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 24px,black 100%)}.vi-tabs--overflow-scroll .vi-tabs__tablist[data-scroll-none]{mask-image:none;-webkit-mask-image:none}.vi-tabs--overflow-wrap .vi-tabs__tablist{flex-wrap:wrap;overflow:visible;height:auto}.vi-tabs__more-wrapper{position:relative;display:inline-flex;align-items:stretch;flex-shrink:0;margin-left:auto;order:9999}.vi-tabs__more-btn{display:inline-flex;align-items:center;gap:var(--vi-tabs-gap-sm, 4px);padding:var(--vi-tabs-spacing-none-lg, 0 14px);min-height:44px;border:none;background:transparent;cursor:pointer;font-family:inherit;font-size:.8125rem;font-weight:500;color:var(--vi-tabs-text-secondary, var(--vi-text-secondary, #4b5563));border-radius:.375rem .375rem 0 0;transition:color .15s ease,background-color .15s ease}.vi-tabs__more-btn:hover{color:var(--vi-tabs-text-primary, var(--vi-text-primary, #111827));background:#0000000a}.vi-tabs__more-btn--open{color:var(--vi-tabs-primary-color, var(--vi-color-primary, #3676d0))}.vi-tabs__more-chevron{flex-shrink:0;transition:transform .2s ease}.vi-tabs__more-btn--open .vi-tabs__more-chevron{transform:rotate(180deg)}.vi-tabs__more-menu{position:absolute;top:calc(100% + 4px);right:0;z-index:100;min-width:180px;background:var(--vi-tabs-surface-primary, var(--vi-layer-01, #ffffff));border:1px solid var(--vi-tabs-border-color, var(--vi-color-border, #e5e7eb));border-radius:.5rem;box-shadow:var(--vi-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, .05), 0 10px 15px -3px rgba(0, 0, 0, .1));padding:var(--vi-tabs-spacing-xs, 4px);animation:vi-menu-appear .15s cubic-bezier(.4,0,.2,1);transform-origin:top right}@keyframes vi-menu-appear{0%{opacity:0;transform:scale(.95) translateY(-4px)}to{opacity:1;transform:scale(1) translateY(0)}}.vi-tabs__more-item{display:flex;align-items:center;width:100%;padding:var(--vi-tabs-spacing-md-lg, 8px 12px);border:none;border-radius:.375rem;background:transparent;font-family:inherit;font-size:.84375rem;font-weight:500;color:var(--vi-tabs-text-secondary, var(--vi-text-secondary, #4b5563));cursor:pointer;text-align:left;transition:background-color .1s ease,color .1s ease}.vi-tabs__more-item:hover:not(:disabled){background:var(--vi-tabs-surface-secondary, var(--vi-layer-02, #f3f4f6));color:var(--vi-tabs-text-primary, var(--vi-text-primary, #111827))}.vi-tabs__more-item:disabled{color:var(--vi-tabs-text-disabled, var(--vi-text-disabled, #9e9e9e));cursor:not-allowed}.vi-tabs__more-item--active{color:var(--vi-tabs-primary-color, var(--vi-color-primary, #3676d0));font-weight:600;background:color-mix(in srgb,var(--vi-color-primary, #3676d0) 6%,transparent)}.vi-tabs__more-item--active:hover{background:color-mix(in srgb,var(--vi-color-primary, #3676d0) 10%,transparent)}}:host{display:block;width:100%;min-width:0}";

function applyDecs2203RFactory$2() {
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
function _apply_decs_2203_r$2(targetClass, memberDecs, classDecs, parentClass) {
    return (_apply_decs_2203_r$2 = applyDecs2203RFactory$2())(targetClass, memberDecs, classDecs, parentClass);
}
function _identity$2(x) {
    return x;
}
var _dec$2, _initClass$2, _ViElement$2, _dec1$2, _dec2$2, _dec3$2, _dec4$1, _dec5$1, _dec6$1, _dec7$1, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, /** tab-id of the currently active tab. */ _init_active$2, /** Layout direction. */ _init_orientation, /** Visual style. */ _init_variant, /**
   * Activation mode.
   * - `'manual'` (default): Arrow keys move focus only; Enter/Space activates.
   * - `'automatic'`: Focus immediately activates the tab.
   */ _init_activation, /**
   * Overflow behavior when tabs exceed tablist width.
   * - `'scroll'` (default): Tablist scrolls horizontally.
   * - `'menu'`:  Extra tabs appear in a "More" dropdown. Selected tab swaps into visible area.
   * - `'wrap'`:  Tabs wrap to additional lines.
   */ _init_overflow, /**
   * When true, closable tabs are visually sorted to the end of the tablist
   * (using CSS `order`). DOM order — and therefore ARIA reading order — is unchanged.
   */ _init_anchorClosable, /**
   * When true, closing a tab automatically removes the vi-tab and its associated
   * vi-tab-panel from the DOM. When false (default), the host application must
   * handle the removal upon receiving the vi-tabs-tab-close event.
   */ _init_destroyOnClose, /**
   * When true, renders an "Add tab" button at the end of the tablist.
   * Dispatches the `vialiq-add` event when clicked.
   */ _init_addable, /** tab-ids currently hidden in the "More" overflow menu. */ _init__overflowTabIds, /** Whether the "More" dropdown is open. */ _init__moreMenuOpen, _init__isScrollable, _init__isScrollStart, _init__isScrollEnd, _initProto$2;
let _ViTabs;
_dec$2 = t('vi-tabs'), _dec1$2 = n({
    type: String,
    reflect: true
}), _dec2$2 = n({
    type: String,
    reflect: true
}), _dec3$2 = n({
    type: String,
    reflect: true
}), _dec4$1 = n({
    type: String
}), _dec5$1 = n({
    type: String,
    reflect: true
}), _dec6$1 = n({
    type: Boolean,
    attribute: 'anchor-closable'
}), _dec7$1 = n({
    type: Boolean,
    attribute: 'destroy-on-close'
}), _dec8 = n({
    type: Boolean
}), _dec9 = r(), _dec10 = r(), _dec11 = r(), _dec12 = r(), _dec13 = r();
new class extends _identity$2 {
    constructor(){
        super(_ViTabs), _initClass$2();
    }
    static{
        class ViTabs extends (_ViElement$2 = ViElement) {
            static{
                ({ e: [_init_active$2, _init_orientation, _init_variant, _init_activation, _init_overflow, _init_anchorClosable, _init_destroyOnClose, _init_addable, _init__overflowTabIds, _init__moreMenuOpen, _init__isScrollable, _init__isScrollStart, _init__isScrollEnd, _initProto$2], c: [_ViTabs, _initClass$2] } = _apply_decs_2203_r$2(this, [
                    [
                        _dec1$2,
                        1,
                        "active"
                    ],
                    [
                        _dec2$2,
                        1,
                        "orientation"
                    ],
                    [
                        _dec3$2,
                        1,
                        "variant"
                    ],
                    [
                        _dec4$1,
                        1,
                        "activation"
                    ],
                    [
                        _dec5$1,
                        1,
                        "overflow"
                    ],
                    [
                        _dec6$1,
                        1,
                        "anchorClosable"
                    ],
                    [
                        _dec7$1,
                        1,
                        "destroyOnClose"
                    ],
                    [
                        _dec8,
                        1,
                        "addable"
                    ],
                    [
                        _dec9,
                        1,
                        "_overflowTabIds"
                    ],
                    [
                        _dec10,
                        1,
                        "_moreMenuOpen"
                    ],
                    [
                        _dec11,
                        1,
                        "_isScrollable"
                    ],
                    [
                        _dec12,
                        1,
                        "_isScrollStart"
                    ],
                    [
                        _dec13,
                        1,
                        "_isScrollEnd"
                    ]
                ], [
                    _dec$2
                ], _ViElement$2));
            }
            static styles = i`
    ${r$1(tabsStyles)}
  `;
            #___private_active_1 = (_initProto$2(this), _init_active$2(this, ''));
            get active() {
                return this.#___private_active_1;
            }
            set active(_v) {
                this.#___private_active_1 = _v;
            }
            #___private_orientation_2 = _init_orientation(this, 'horizontal');
            get orientation() {
                return this.#___private_orientation_2;
            }
            set orientation(_v) {
                this.#___private_orientation_2 = _v;
            }
            #___private_variant_3 = _init_variant(this, 'line');
            get variant() {
                return this.#___private_variant_3;
            }
            set variant(_v) {
                this.#___private_variant_3 = _v;
            }
            #___private_activation_4 = _init_activation(this, 'manual');
            get activation() {
                return this.#___private_activation_4;
            }
            set activation(_v) {
                this.#___private_activation_4 = _v;
            }
            #___private_overflow_5 = _init_overflow(this, 'scroll');
            get overflow() {
                return this.#___private_overflow_5;
            }
            set overflow(_v) {
                this.#___private_overflow_5 = _v;
            }
            #___private_anchorClosable_6 = _init_anchorClosable(this, false);
            get anchorClosable() {
                return this.#___private_anchorClosable_6;
            }
            set anchorClosable(_v) {
                this.#___private_anchorClosable_6 = _v;
            }
            #___private_destroyOnClose_7 = _init_destroyOnClose(this, false);
            get destroyOnClose() {
                return this.#___private_destroyOnClose_7;
            }
            set destroyOnClose(_v) {
                this.#___private_destroyOnClose_7 = _v;
            }
            #___private_addable_8 = _init_addable(this, false);
            get addable() {
                return this.#___private_addable_8;
            }
            set addable(_v) {
                this.#___private_addable_8 = _v;
            }
            #___private__overflowTabIds_9 = _init__overflowTabIds(this, []);
            get _overflowTabIds() {
                return this.#___private__overflowTabIds_9;
            }
            set _overflowTabIds(_v) {
                this.#___private__overflowTabIds_9 = _v;
            }
            #___private__moreMenuOpen_10 = _init__moreMenuOpen(this, false);
            get _moreMenuOpen() {
                return this.#___private__moreMenuOpen_10;
            }
            set _moreMenuOpen(_v) {
                this.#___private__moreMenuOpen_10 = _v;
            }
            /** The physical order of tabs, updated on swap to persist positions. */ _visualOrder = [];
            // ── Internal refs ───────────────────────────────────────────────────────────
            _tablistEl = null;
            _indicatorEl = null;
            _cursorEl = null;
            _resizeObserver;
            #___private__isScrollable_11 = _init__isScrollable(this, false);
            get _isScrollable() {
                return this.#___private__isScrollable_11;
            }
            set _isScrollable(_v) {
                this.#___private__isScrollable_11 = _v;
            }
            #___private__isScrollStart_12 = _init__isScrollStart(this, true);
            get _isScrollStart() {
                return this.#___private__isScrollStart_12;
            }
            set _isScrollStart(_v) {
                this.#___private__isScrollStart_12 = _v;
            }
            #___private__isScrollEnd_13 = _init__isScrollEnd(this, false);
            get _isScrollEnd() {
                return this.#___private__isScrollEnd_13;
            }
            set _isScrollEnd(_v) {
                this.#___private__isScrollEnd_13 = _v;
            }
            // ── Lifecycle ───────────────────────────────────────────────────────────────
            static _iconsRegistered = false;
            connectedCallback() {
                super.connectedCallback();
                if (!ViTabs._iconsRegistered) {
                    registerIcons([
                        chevronLeftIcon,
                        chevronRightIcon,
                        plusIcon,
                        chevronDownIcon
                    ]);
                    ViTabs._iconsRegistered = true;
                }
                this.addEventListener('vi-tab-select', this._onTabSelect);
                this.addEventListener('vi-tab-before-close', this._onTabBeforeClose);
                // keydown is handled via @keydown on [part="tablist"]
                document.addEventListener('click', this._onDocClick);
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this.removeEventListener('vi-tab-select', this._onTabSelect);
                this.removeEventListener('vi-tab-before-close', this._onTabBeforeClose);
                document.removeEventListener('click', this._onDocClick);
                this._resizeObserver?.disconnect();
            }
            firstUpdated() {
                this._tablistEl = this.shadowRoot?.querySelector('[part="tablist"]') ?? null;
                this._indicatorEl = this.shadowRoot?.querySelector('[part="tab-indicator"]') ?? null;
                this._cursorEl = this.shadowRoot?.querySelector('[part="tab-cursor"]') ?? null;
                if (this._tablistEl) {
                    this._tablistEl.addEventListener('scroll', ()=>this._updateScrollState());
                }
                this._resizeObserver = new ResizeObserver(()=>{
                    this._updateIndicator();
                    if (this.overflow === 'menu') this._computeMenuOverflow();
                    if (this.overflow === 'scroll') this._updateScrollState();
                });
                this._resizeObserver.observe(this);
                this._syncState();
            }
            updated(changed) {
                super.updated(changed);
                // If anchorClosable is toggled on, instantly sort the current visual order
                if (changed.has('anchorClosable') && this.anchorClosable) {
                    const tabs = this._getTabs();
                    this._visualOrder.sort((a, b)=>{
                        const tabA = tabs.find((t)=>t.tabId === a);
                        const tabB = tabs.find((t)=>t.tabId === b);
                        const aVal = tabA?.closable ? 1 : 0;
                        const bVal = tabB?.closable ? 1 : 0;
                        return aVal - bVal;
                    });
                }
                if (changed.has('active') || changed.has('orientation') || changed.has('variant') || changed.has('overflow') || changed.has('anchorClosable')) {
                    this._syncState();
                }
            }
            // ── Private helpers ─────────────────────────────────────────────────────────
            _getTabs() {
                return Array.from(this.querySelectorAll('vi-tab'));
            }
            _getPanels() {
                return Array.from(this.querySelectorAll('vi-tab-panel'));
            }
            _getEnabledTabs() {
                return this._getTabs().filter((t)=>!t.disabled);
            }
            /** Sync all state: slot assignment, active/ARIA attrs, tabindex, overflow order, indicator. */ _syncState() {
                const tabs = this._getTabs();
                const panels = this._getPanels();
                const total = tabs.length;
                // ── Auto-assign named slots ─────────────────────────────────────────────
                tabs.forEach((t)=>{
                    if (t.getAttribute('slot') !== 'tab') t.setAttribute('slot', 'tab');
                });
                panels.forEach((p)=>{
                    if (p.getAttribute('slot') !== 'panel') p.setAttribute('slot', 'panel');
                });
                // ── Maintain persistent visual order ────────────────────────────────────
                const currentIds = tabs.map((t)=>t.tabId);
                this._visualOrder = this._visualOrder.filter((id)=>currentIds.includes(id));
                const newTabs = tabs.filter((t)=>!this._visualOrder.includes(t.tabId));
                if (newTabs.length > 0) {
                    if (this.anchorClosable) {
                        const newPinned = newTabs.filter((t)=>!t.closable).map((t)=>t.tabId);
                        const newClosable = newTabs.filter((t)=>t.closable).map((t)=>t.tabId);
                        let firstClosableIdx = this._visualOrder.findIndex((id)=>tabs.find((t)=>t.tabId === id)?.closable);
                        if (firstClosableIdx === -1) firstClosableIdx = this._visualOrder.length;
                        this._visualOrder.splice(firstClosableIdx, 0, ...newPinned);
                        this._visualOrder.push(...newClosable);
                    } else {
                        this._visualOrder.push(...newTabs.map((t)=>t.tabId));
                    }
                }
                // Apply CSS order so the DOM visually matches our array
                tabs.forEach((t)=>{
                    t.style.order = String(this._visualOrder.indexOf(t.tabId));
                });
                // ── Ensure a valid active tab ───────────────────────────────────────────
                if (!this.active && tabs.length > 0) {
                    const first = tabs.find((t)=>!t.disabled);
                    if (first) this.active = first.tabId;
                }
                // ── Per-tab ARIA + tabindex ─────────────────────────────────────────────
                tabs.forEach((tab, i)=>{
                    const isActive = tab.tabId === this.active;
                    tab.active = isActive;
                    tab.posinset = i + 1;
                    tab.setsize = total;
                    tab.tabIndex = isActive && !tab.disabled ? 0 : -1;
                    tab.setAttribute('role', 'tab');
                    tab.setAttribute('id', tab.tabId);
                    tab.setAttribute('aria-controls', `panel-${tab.tabId}`);
                });
                // ── Panel visibility ────────────────────────────────────────────────────
                panels.forEach((p)=>{
                    p.active = p.for === this.active;
                    p.setAttribute('role', 'tabpanel');
                    p.setAttribute('id', `panel-${p.for}`);
                    p.setAttribute('aria-labelledby', p.for);
                    p.tabIndex = 0;
                });
                // ── Overflow ────────────────────────────────────────────────────────────
                if (this.overflow === 'menu') {
                    requestAnimationFrame(()=>this._computeMenuOverflow());
                } else if (this.overflow === 'scroll') {
                    requestAnimationFrame(()=>this._updateScrollState());
                }
                requestAnimationFrame(()=>this._updateIndicator());
            }
            // ── Overflow: scroll ─────────────────────────────────────────────────────
            /** Updates the data-scroll-* attributes on the tablist based on current scroll position. */ _updateScrollState() {
                if (!this._tablistEl || this.overflow !== 'scroll') return;
                const { scrollWidth, clientWidth, scrollLeft } = this._tablistEl;
                // No scroll possible
                if (scrollWidth <= clientWidth) {
                    this._tablistEl.setAttribute('data-scroll-none', '');
                    this._tablistEl.removeAttribute('data-scroll-start');
                    this._tablistEl.removeAttribute('data-scroll-end');
                    this._isScrollable = false;
                    return;
                }
                this._isScrollable = true;
                this._tablistEl.removeAttribute('data-scroll-none');
                // Scrolled to very start (allow 1px rounding)
                this._isScrollStart = scrollLeft <= 1;
                if (this._isScrollStart) {
                    this._tablistEl.setAttribute('data-scroll-start', '');
                } else {
                    this._tablistEl.removeAttribute('data-scroll-start');
                }
                // Scrolled to very end (allow 1px rounding)
                this._isScrollEnd = scrollLeft + clientWidth >= scrollWidth - 1;
                if (this._isScrollEnd) {
                    this._tablistEl.setAttribute('data-scroll-end', '');
                } else {
                    this._tablistEl.removeAttribute('data-scroll-end');
                }
            }
            // ── Overflow: menu (swap) ────────────────────────────────────────────────
            /**
   * Measure which tabs fit in the tablist width and partition them into
   * visible vs overflow arrays. Uses the persistent _visualOrder to decide.
   */ _computeMenuOverflow() {
                if (!this._tablistEl) return;
                const tabs = this._getTabs();
                // 1. Measure available width BEFORE modifying DOM (to avoid unhidden tabs stretching it)
                const listWidth = this.offsetWidth;
                const MORE_WIDTH = 68; // Reserve px for the "More" button
                // 2. Temporarily clear overflow to measure natural widths of the tabs
                tabs.forEach((t)=>t.removeAttribute('data-overflow'));
                let totalTabsWidth = 0;
                const tabWidths = new Map();
                for (const t of tabs){
                    const w = t.offsetWidth;
                    tabWidths.set(t.tabId, w);
                    totalTabsWidth += w;
                }
                // 3. If everything fits natively, clear overflow and return
                if (totalTabsWidth <= listWidth) {
                    this._overflowTabIds = [];
                    return;
                }
                // 3. Evaluate tabs strictly in their persistent _visualOrder
                const orderedTabs = this._visualOrder.map((id)=>tabs.find((t)=>t.tabId === id));
                const activeTabWidth = this.active ? tabWidths.get(this.active) || 0 : 0;
                const budgetedWidth = listWidth - MORE_WIDTH;
                const overflow = [];
                // Pre-allocate the active tab's width so it is mathematically guaranteed to fit
                let used = activeTabWidth;
                orderedTabs.forEach((tab)=>{
                    // The active tab is exempt from the budget check because it was pre-allocated
                    if (tab.tabId === this.active) {
                        return;
                    }
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const tw = tabWidths.get(tab.tabId);
                    // Keep adding to visible until we bust the budget
                    if (used + tw <= budgetedWidth) {
                        used += tw;
                    } else {
                        overflow.push(tab.tabId);
                        tab.setAttribute('data-overflow', '');
                    }
                });
                this._overflowTabIds = overflow;
            }
            /**
   * When a tab from the overflow menu is selected, swap its position
   * in the persistent _visualOrder array with the last visible tab.
   */ _swapFromOverflow(tabId) {
                const tabs = this._getTabs();
                const overflowTab = tabs.find((t)=>t.tabId === tabId);
                if (!overflowTab) return;
                // Find the last visible tab using our persistent order
                const visibleIds = this._visualOrder.filter((id)=>!this._overflowTabIds.includes(id));
                const lastVisibleId = visibleIds[visibleIds.length - 1];
                if (lastVisibleId && lastVisibleId !== tabId) {
                    const idxA = this._visualOrder.indexOf(lastVisibleId);
                    const idxB = this._visualOrder.indexOf(tabId);
                    if (idxA !== -1 && idxB !== -1) {
                        // Swap their physical positions in the array
                        this._visualOrder[idxA] = tabId;
                        this._visualOrder[idxB] = lastVisibleId;
                        // Update CSS order for ALL tabs to guarantee correct flex visual rendering
                        this._updateVisualOrder();
                    }
                }
                this._moreMenuOpen = false;
                this._activateTab(tabId);
                // Explicitly recalculate overflow to apply the new visual order immediately,
                // even if the active tab didn't change
                requestAnimationFrame(()=>this._computeMenuOverflow());
            }
            /**
   * Applies the persistent visual order to the physical DOM via CSS order.
   * Flexbox defaults to order: 0, so we must explicitly number every tab.
   */ _updateVisualOrder() {
                const tabs = this._getTabs();
                tabs.forEach((tab)=>{
                    const idx = this._visualOrder.indexOf(tab.tabId);
                    if (idx !== -1) {
                        tab.style.order = String(idx);
                    }
                });
            }
            // ── Indicator + cursor positioning ───────────────────────────────────────
            _updateIndicator() {
                if (!this._tablistEl) return;
                const activeTabEl = this._getTabs().find((t)=>t.tabId === this.active);
                if (!activeTabEl) {
                    if (this._indicatorEl) this._indicatorEl.style.opacity = '0';
                    if (this._cursorEl) this._cursorEl.style.opacity = '0';
                    return;
                }
                const listRect = this._tablistEl.getBoundingClientRect();
                const tabRect = activeTabEl.getBoundingClientRect();
                const btnEl = activeTabEl.shadowRoot?.querySelector('[part="tab"]');
                const btnRect = btnEl ? btnEl.getBoundingClientRect() : tabRect;
                if (this.orientation === 'vertical') {
                    if (this._indicatorEl) {
                        this._indicatorEl.style.top = `${tabRect.top - listRect.top + this._tablistEl.scrollTop}px`;
                        this._indicatorEl.style.height = `${tabRect.height}px`;
                        this._indicatorEl.style.left = '';
                        this._indicatorEl.style.width = '';
                        this._indicatorEl.style.opacity = '1';
                    }
                    if (this._cursorEl) {
                        this._cursorEl.style.top = `${tabRect.top - listRect.top + this._tablistEl.scrollTop}px`;
                        this._cursorEl.style.height = `${tabRect.height}px`;
                        this._cursorEl.style.left = '0';
                        this._cursorEl.style.width = '100%';
                        this._cursorEl.style.opacity = '1';
                    }
                } else {
                    if (this._indicatorEl) {
                        this._indicatorEl.style.left = `${btnRect.left - listRect.left + this._tablistEl.scrollLeft}px`;
                        this._indicatorEl.style.width = `${btnRect.width}px`;
                        this._indicatorEl.style.top = '';
                        this._indicatorEl.style.height = '';
                        this._indicatorEl.style.opacity = '1';
                    }
                    if (this._cursorEl) {
                        this._cursorEl.style.left = `${tabRect.left - listRect.left + this._tablistEl.scrollLeft}px`;
                        this._cursorEl.style.width = `${tabRect.width}px`;
                        this._cursorEl.style.top = '';
                        this._cursorEl.style.height = '';
                        this._cursorEl.style.opacity = '1';
                    }
                }
            }
            // ── Event handlers ───────────────────────────────────────────────────────
            _onTabSelect(e) {
                this._activateTab(e.detail.tabId);
            }
            _onTabBeforeClose = (e)=>{
                // vi-tab has already fired vi-tab-before-close; if it was not cancelled by
                // the host app, vi-tab also fires vi-tab-close. We catch vi-tab-before-close
                // here so vi-tabs can handle focus BEFORE the element is removed from DOM.
                const tabId = e.detail.tabId;
                if (e.defaultPrevented) return;
                const tabs = this._getTabs();
                const closingIdx = tabs.findIndex((t)=>t.tabId === tabId);
                // Move active to a neighbour if we're closing the active tab
                if (this.active === tabId) {
                    const enabledBefore = tabs.slice(0, closingIdx).filter((t)=>!t.disabled);
                    const enabledAfter = tabs.slice(closingIdx + 1).filter((t)=>!t.disabled);
                    // Prefer tab just before; fall back to tab just after; else nothing
                    const prevTab = enabledBefore[enabledBefore.length - 1] ?? enabledAfter[0] ?? null;
                    if (prevTab) {
                        this._activateTab(prevTab.tabId);
                        prevTab.focus();
                    }
                }
                if (this.destroyOnClose) {
                    const tabToRemove = tabs[closingIdx];
                    const panelToRemove = this.querySelector(`vi-tab-panel[for="${tabId}"]`);
                    tabToRemove?.remove();
                    panelToRemove?.remove();
                }
                // Notify host app — it must remove the vi-tab (and its panel) from the DOM
                // if destroyOnClose is false.
                this.dispatchEvent(new CustomEvent('vi-tabs-tab-close', {
                    detail: {
                        tabId
                    },
                    bubbles: true,
                    composed: true
                }));
            };
            _activateTab(toTabId) {
                const tab = this._getTabs().find((t)=>t.tabId === toTabId);
                if (!tab || tab.disabled || toTabId === this.active) return;
                const fromTabId = this.active;
                const beforeEvent = new CustomEvent('vi-tabs-before-change', {
                    detail: {
                        fromTabId,
                        toTabId
                    },
                    bubbles: true,
                    composed: true,
                    cancelable: true
                });
                if (!this.dispatchEvent(beforeEvent)) return;
                this.active = toTabId;
                this.dispatchEvent(new CustomEvent('vi-tabs-change', {
                    detail: {
                        fromTabId,
                        toTabId
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            _onKeydown = (e)=>{
                const target = e.target;
                if (!target.closest('vi-tab')) return;
                const enabled = this._getEnabledTabs().filter((t)=>!t.hasAttribute('data-overflow'));
                if (enabled.length === 0) return;
                const currentTabEl = e.target.closest('vi-tab');
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const currentIndex = enabled.indexOf(currentTabEl);
                if (currentIndex === -1) return;
                const isHorizontal = this.orientation === 'horizontal';
                let nextIndex = currentIndex;
                switch(e.key){
                    case 'ArrowRight':
                        if (!isHorizontal) return;
                        nextIndex = (currentIndex + 1) % enabled.length;
                        break;
                    case 'ArrowLeft':
                        if (!isHorizontal) return;
                        nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
                        break;
                    case 'ArrowDown':
                        if (isHorizontal) return;
                        nextIndex = (currentIndex + 1) % enabled.length;
                        break;
                    case 'ArrowUp':
                        if (isHorizontal) return;
                        nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
                        break;
                    case 'Home':
                        nextIndex = 0;
                        break;
                    case 'End':
                        nextIndex = enabled.length - 1;
                        break;
                    case 'Enter':
                    case ' ':
                        if (this.activation === 'manual') {
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            this._activateTab(enabled[currentIndex].tabId);
                        }
                        e.preventDefault();
                        return;
                    default:
                        return;
                }
                e.preventDefault();
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const targetTab = enabled[nextIndex];
                enabled.forEach((t, i)=>{
                    t.tabIndex = i === nextIndex ? 0 : -1;
                });
                targetTab.focus();
                if (this.activation === 'automatic') this._activateTab(targetTab.tabId);
            };
            _onAddClick() {
                this.dispatchEvent(new CustomEvent('vi-tabs-add', {
                    bubbles: true,
                    composed: true
                }));
            }
            _onDocClick = (e)=>{
                if (this._moreMenuOpen && !this.contains(e.target)) {
                    this._moreMenuOpen = false;
                }
            };
            _onSlotChange() {
                this._syncState();
            }
            // ── Render helpers ───────────────────────────────────────────────────────
            _renderAddButton() {
                if (!this.addable) return A;
                return b`
      <button
        part="add-button"
        class="vi-tabs__add-btn"
        aria-label="Add tab"
        title="Add tab"
        @click=${this._onAddClick}
      >
        <vi-icon name="plus" size="20" aria-hidden="true"></vi-icon>
      </button>
    `;
            }
            _renderMoreMenu() {
                if (this.overflow !== 'menu' || this._overflowTabIds.length === 0) return A;
                const overflowTabs = this._getTabs().filter((t)=>this._overflowTabIds.includes(t.tabId));
                return b`
      <div class="vi-tabs__more-wrapper">
        <button
          part="more-button"
          class="vi-tabs__more-btn ${this._moreMenuOpen ? 'vi-tabs__more-btn--open' : ''}"
          aria-haspopup="true"
          aria-expanded=${this._moreMenuOpen ? 'true' : 'false'}
          aria-label="More tabs"
          @click=${()=>{
                    this._moreMenuOpen = !this._moreMenuOpen;
                }}
        >
          More
          <vi-icon
            class="vi-tabs__more-chevron"
            name="chevron-down"
            size="12"
            aria-hidden="true"
          ></vi-icon>
        </button>

        ${this._moreMenuOpen ? b` <div
              part="more-menu"
              class="vi-tabs__more-menu"
              role="menu"
              aria-label="Overflow tabs"
            >
              ${c(overflowTabs, (t)=>t.tabId, (t)=>b`
                  <button
                    class="vi-tabs__more-item ${t.tabId === this.active ? 'vi-tabs__more-item--active' : ''}"
                    role="menuitem"
                    ?disabled=${t.disabled}
                    @click=${()=>this._swapFromOverflow(t.tabId)}
                  >
                    ${t.textContent?.trim()}
                  </button>
                `)}
            </div>` : A}
      </div>
    `;
            }
            _renderScrollArrow(dir) {
                if (this.overflow !== 'scroll' || !this._isScrollable) return A;
                const isLeft = dir === 'left';
                const disabled = isLeft ? this._isScrollStart : this._isScrollEnd;
                return b`
      <button
        class="vi-tabs__scroll-btn vi-tabs__scroll-btn--${dir}"
        aria-hidden="true"
        tabindex="-1"
        ?disabled=${disabled}
        @click=${()=>this._tablistEl?.scrollBy({
                        left: isLeft ? -150 : 150,
                        behavior: 'smooth'
                    })}
      >
        <vi-icon name="chevron-${dir}" size="16" aria-hidden="true"></vi-icon>
      </button>
    `;
            }
            // ── Render ───────────────────────────────────────────────────────────────
            render() {
                const hostClasses = {
                    'vi-tabs': true,
                    [`vi-tabs--${this.variant}`]: true,
                    [`vi-tabs--${this.orientation}`]: true,
                    [`vi-tabs--overflow-${this.overflow}`]: true
                };
                return b`
      <div class=${e(hostClasses)}>
        ${this._renderScrollArrow('left')}
        <div
          part="tablist"
          class="vi-tabs__tablist"
          @keydown=${this._onKeydown}
        >
          <span
            part="tab-cursor"
            class="vi-tabs__cursor"
            aria-hidden="true"
          ></span>

          <div
            role="tablist"
            aria-orientation=${this.orientation}
            style="display: contents;"
          >
            <slot name="tab" @slotchange=${this._onSlotChange}></slot>
          </div>

          <span
            part="tab-indicator"
            class="vi-tabs__indicator"
            aria-hidden="true"
          ></span>

          ${this._renderAddButton()} ${this._renderMoreMenu()}
        </div>
        ${this._renderScrollArrow('right')}
        <slot name="panel"></slot>
      </div>
    `;
            }
        }
    }
}();

const tabStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.vi-tab{display:inline-flex;align-items:center;justify-content:center;gap:var(--vi-tab-icon-gap, var(--vi-spacing-xs, .5rem));padding:var(--vi-tab-padding, 0 20px);min-width:var(--vi-tab-min-width, 90px);max-width:var(--vi-tab-max-width, 240px);min-height:var(--vi-tab-height, 40px);width:100%;height:100%;position:relative;z-index:1;border:none;background:transparent;cursor:pointer;white-space:nowrap;user-select:none;-webkit-user-select:none;font-family:inherit;font-size:var(--vi-tab-font-size, var(--vi-font-size-base, .875rem));font-weight:var(--vi-tab-font-weight, 500);letter-spacing:.015em;color:var(--vi-tab-color, var(--vi-text-secondary, #4b5563));transition:color .18s cubic-bezier(.4,0,.2,1),transform .18s cubic-bezier(.4,0,.2,1)}.vi-tab:before{content:\"\";position:absolute;inset:4px;border-radius:.5rem;background:currentColor;opacity:0;transform:scale(.85);transition:opacity .15s cubic-bezier(.4,0,.2,1),transform .15s cubic-bezier(.4,0,.2,1);pointer-events:none}.vi-tab:not(.vi-tab--disabled):not(.vi-tab--active):hover{color:var(--vi-tab-color-hover, var(--vi-text-primary, #111827))}.vi-tab:not(.vi-tab--disabled):not(.vi-tab--active):hover:before{opacity:.06;transform:scale(1)}.vi-tab.vi-tab--active{color:var(--vi-tab-color-active, var(--vi-color-primary, #3676d0));font-weight:var(--vi-tab-font-weight-active, 600);letter-spacing:.01em}.vi-tab:focus-visible{outline:none}.vi-tab:focus-visible:before{outline:2px solid var(--vi-color-primary, #3676d0);outline-offset:0;opacity:.12;transform:scale(1)}.vi-tab.vi-tab--disabled{color:var(--vi-tab-color-disabled, var(--vi-text-disabled, #9e9e9e));cursor:not-allowed;pointer-events:none}.vi-tab.vi-tab--disabled:before{display:none}.vi-tab__icon{display:inline-flex;align-items:center;flex-shrink:0;font-size:var(--vi-tab-icon-size, .9375rem);opacity:.6;position:relative;z-index:1;transition:opacity .18s ease,transform .18s ease}.vi-tab--active .vi-tab__icon{opacity:1;transform:scale(1.04)}.vi-tab__label{position:relative;z-index:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.vi-tab__badge{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;min-width:var(--vi-tab-close-size, 18px);height:var(--vi-tab-close-size, 18px);padding:var(--vi-tab-badge-padding, 0 5px);border-radius:.5625rem;font-size:.625rem;font-weight:700;line-height:1;letter-spacing:0;background:var(--vi-tab-badge-bg, var(--vi-color-primary, #3676d0));color:var(--vi-tab-badge-color, var(--vi-layer-01, #ffffff));flex-shrink:0;box-shadow:var(--vi-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, .03));animation:vi-badge-pop .32s cubic-bezier(.34,1.56,.64,1) both}@keyframes vi-badge-pop{0%{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}.vi-tab__close{position:relative;z-index:2;display:inline-flex;align-items:center;justify-content:center;width:var(--vi-tab-close-size, 18px);height:var(--vi-tab-close-size, 18px);border:none;border-radius:50%;background:transparent;color:currentColor;cursor:pointer;padding:0;margin-left:var(--vi-tab-close-margin-left, 2px);flex-shrink:0;opacity:0;transform:scale(.7);transition:opacity .15s ease,transform .15s ease,background-color .12s ease}.vi-tab__close svg{display:block}.vi-tab:hover .vi-tab__close,.vi-tab--active .vi-tab__close{opacity:.6;transform:scale(1)}.vi-tab__close:hover{opacity:1!important;background:color-mix(in srgb,var(--vi-text-primary, #111827) 8%,transparent);transform:scale(1)!important}}:host{display:inline-flex;align-items:stretch;flex-shrink:0;position:relative;z-index:0}:host([data-overflow]){visibility:hidden;width:0!important;min-width:0!important;overflow:hidden;padding:0;margin:0;flex-shrink:0}:host(:focus-visible){outline:none}:host(:focus-visible) .vi-tab:before{outline:2px solid var(--vi-tab-focus-ring, var(--vi-color-primary, #3676d0));outline-offset:0;opacity:.12;transform:scale(1)}";

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
var _dec$1, _initClass$1, _ViElement$1, _dec1$1, _dec2$1, _dec3$1, _dec4, _dec5, _dec6, _dec7, /** Unique ID linking to vi-tab-panel[for]. Auto-generated if not set. */ _init_tabId, /** Tab is not selectable. */ _init_disabled, /**
   * Tab shows a close (×) button. Fires `vi-tab-before-close` (cancelable)
   * and `vi-tab-close` (host app should remove the element on this event).
   */ _init_closable, /** Notification badge count. Rendered when > 0. */ _init_badgeCount, /**
   * Whether this tab is currently active.
   * Managed by vi-tabs — do not set manually.
   */ _init_active$1, /**
   * Tab's position in the tablist (1-indexed). Used for aria-posinset.
   * Managed by vi-tabs.
   */ _init_posinset, /**
   * Total tab count in the tablist. Used for aria-setsize.
   * Managed by vi-tabs.
   */ _init_setsize, _initProto$1;
let _ViTab;
_dec$1 = t('vi-tab'), _dec1$1 = n({
    type: String,
    attribute: 'tab-id',
    reflect: true
}), _dec2$1 = n({
    type: Boolean,
    reflect: true
}), _dec3$1 = n({
    type: Boolean,
    reflect: true
}), _dec4 = n({
    type: Number,
    attribute: 'badge-count'
}), _dec5 = n({
    type: Boolean,
    reflect: true
}), _dec6 = n({
    type: Number,
    attribute: false
}), _dec7 = n({
    type: Number,
    attribute: false
});
new class extends _identity$1 {
    constructor(){
        super(_ViTab), _initClass$1();
    }
    static{
        class ViTab extends (_ViElement$1 = ViElement) {
            static{
                ({ e: [_init_tabId, _init_disabled, _init_closable, _init_badgeCount, _init_active$1, _init_posinset, _init_setsize, _initProto$1], c: [_ViTab, _initClass$1] } = _apply_decs_2203_r$1(this, [
                    [
                        _dec1$1,
                        1,
                        "tabId"
                    ],
                    [
                        _dec2$1,
                        1,
                        "disabled"
                    ],
                    [
                        _dec3$1,
                        1,
                        "closable"
                    ],
                    [
                        _dec4,
                        1,
                        "badgeCount"
                    ],
                    [
                        _dec5,
                        1,
                        "active"
                    ],
                    [
                        _dec6,
                        1,
                        "posinset"
                    ],
                    [
                        _dec7,
                        1,
                        "setsize"
                    ]
                ], [
                    _dec$1
                ], _ViElement$1));
            }
            static styles = i`
    ${r$1(tabStyles)}
  `;
            #___private_tabId_1 = (_initProto$1(this), _init_tabId(this, ''));
            get tabId() {
                return this.#___private_tabId_1;
            }
            set tabId(_v) {
                this.#___private_tabId_1 = _v;
            }
            #___private_disabled_2 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_2;
            }
            set disabled(_v) {
                this.#___private_disabled_2 = _v;
            }
            #___private_closable_3 = _init_closable(this, false);
            get closable() {
                return this.#___private_closable_3;
            }
            set closable(_v) {
                this.#___private_closable_3 = _v;
            }
            #___private_badgeCount_4 = _init_badgeCount(this, undefined);
            get badgeCount() {
                return this.#___private_badgeCount_4;
            }
            set badgeCount(_v) {
                this.#___private_badgeCount_4 = _v;
            }
            #___private_active_5 = _init_active$1(this, false);
            get active() {
                return this.#___private_active_5;
            }
            set active(_v) {
                this.#___private_active_5 = _v;
            }
            #___private_posinset_6 = _init_posinset(this, 1);
            get posinset() {
                return this.#___private_posinset_6;
            }
            set posinset(_v) {
                this.#___private_posinset_6 = _v;
            }
            #___private_setsize_7 = _init_setsize(this, 1);
            get setsize() {
                return this.#___private_setsize_7;
            }
            set setsize(_v) {
                this.#___private_setsize_7 = _v;
            }
            /** Whether the tab's inner button participates in tab order. Managed by vi-tabs. */ set tabIndex(val) {
                if (this._tabIndex !== val) {
                    this._tabIndex = val;
                    this.setAttribute('tabindex', String(val));
                }
            }
            get tabIndex() {
                return this._tabIndex;
            }
            _tabIndex = -1;
            _hasIcon = false;
            connectedCallback() {
                super.connectedCallback();
                if (!this.tabId) {
                    this.tabId = `vi-tab-${Math.random().toString(36).substring(2, 9)}`;
                }
            }
            _onIconSlotChange(e) {
                const slot = e.target;
                this._hasIcon = slot.assignedNodes({
                    flatten: true
                }).length > 0;
                this.requestUpdate();
            }
            updated(changedProperties) {
                super.updated(changedProperties);
                if (changedProperties.has('active')) {
                    this.setAttribute('aria-selected', this.active ? 'true' : 'false');
                }
                if (changedProperties.has('disabled')) {
                    this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
                }
                if (changedProperties.has('setsize')) {
                    this.setAttribute('aria-setsize', String(this.setsize));
                }
                if (changedProperties.has('posinset')) {
                    this.setAttribute('aria-posinset', String(this.posinset));
                }
            }
            _onClick() {
                if (this.disabled) return;
                this.focus();
                this.dispatchEvent(new CustomEvent('vi-tab-select', {
                    detail: {
                        tabId: this.tabId
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            _onCloseClick(e) {
                e.stopPropagation(); // Don't also trigger tab selection
                const beforeEvent = new CustomEvent('vi-tab-before-close', {
                    detail: {
                        tabId: this.tabId
                    },
                    bubbles: true,
                    composed: true,
                    cancelable: true
                });
                if (!this.dispatchEvent(beforeEvent)) return; // Host cancelled
                this.dispatchEvent(new CustomEvent('vi-tab-close', {
                    detail: {
                        tabId: this.tabId
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            render() {
                const classes = {
                    'vi-tab': true,
                    'vi-tab--active': this.active,
                    'vi-tab--disabled': this.disabled,
                    'vi-tab--closable': this.closable
                };
                return b`
      <div
        part="tab"
        class=${e(classes)}
        tabindex="-1"
        @click=${this._onClick}
      >
        <span
          part="icon"
          class="vi-tab__icon"
          style=${!this._hasIcon ? 'display: none' : A}
        >
          <slot name="icon" @slotchange=${this._onIconSlotChange}></slot>
        </span>

        <span part="label" class="vi-tab__label">
          <slot></slot>
        </span>

        ${this.badgeCount !== undefined && this.badgeCount > 0 ? b`<span
              part="badge"
              class="vi-tab__badge"
              aria-label="${this.badgeCount} notifications"
            >
              ${this.badgeCount}
            </span>` : A}
        ${this.closable ? b`<button
              part="close-button"
              class="vi-tab__close"
              aria-label="Close tab"
              tabindex="-1"
              @click=${this._onCloseClick}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 1L9 9M9 1L1 9"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>` : A}
      </div>
    `;
            }
        }
    }
}();

const tabPanelStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{[part=panel]{padding:var(--vi-tab-panel-padding, 16px 0);outline:none}[part=panel]:focus-visible{outline:2px solid var(--vi-tabs-indicator-color, var(--vi-color-primary, #3676d0));outline-offset:2px;border-radius:.125rem}}:host{display:block}:host(:not([active])){display:none}";

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
var _dec, _initClass, _ViElement, _dec1, _dec2, _dec3, /** The `tab-id` of the corresponding `vi-tab`. */ _init_for, /**
   * When true, slot content is only stamped on first activation.
   * Subsequent tab switches keep the content alive but hidden.
   */ _init_lazy, /**
   * Whether this panel is currently visible.
   * Managed by vi-tabs — do not set manually.
   */ _init_active, _initProto;
let _ViTabPanel;
_dec = t('vi-tab-panel'), _dec1 = n({
    type: String
}), _dec2 = n({
    type: Boolean
}), _dec3 = n({
    type: Boolean,
    reflect: true
});
new class extends _identity {
    constructor(){
        super(_ViTabPanel), _initClass();
    }
    static{
        class ViTabPanel extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_for, _init_lazy, _init_active, _initProto], c: [_ViTabPanel, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "for"
                    ],
                    [
                        _dec2,
                        1,
                        "lazy"
                    ],
                    [
                        _dec3,
                        1,
                        "active"
                    ]
                ], [
                    _dec
                ], _ViElement));
            }
            static shadowRootOptions = {
                ...ViElement.shadowRootOptions,
                delegatesFocus: true
            };
            static styles = i`
    ${r$1(tabPanelStyles)}
  `;
            #___private_for_1 = (_initProto(this), _init_for(this, ''));
            get for() {
                return this.#___private_for_1;
            }
            set for(_v) {
                this.#___private_for_1 = _v;
            }
            #___private_lazy_2 = _init_lazy(this, false);
            get lazy() {
                return this.#___private_lazy_2;
            }
            set lazy(_v) {
                this.#___private_lazy_2 = _v;
            }
            #___private_active_3 = _init_active(this, false);
            get active() {
                return this.#___private_active_3;
            }
            set active(_v) {
                this.#___private_active_3 = _v;
            }
            /**
   * Internal flag: once the panel has been activated, lazy content is stamped.
   */ _hasBeenActivated = false;
            updated() {
                if (this.active) {
                    this._hasBeenActivated = true;
                }
            }
            render() {
                const shouldRender = !this.lazy || this._hasBeenActivated;
                return b`
      <div part="panel" tabindex="0">
        ${shouldRender ? b`<slot></slot>` : ''}
      </div>
    `;
            }
        }
    }
}();

// ── Common styles ─────────────────────────────────────────────────────────────
const label = (text)=>b`
  <p
    style="font-size: 11px; font-weight: 600; letter-spacing: 0.06em; color: #9ca3af;
             margin: 0 0 6px; text-transform: uppercase;"
  >
    ${text}
  </p>
`;
const note = (text)=>b`
  <p
    style="font-size: 13px; color: #6b7280; margin: 0 0 16px; line-height: 1.5;"
  >
    ${text}
  </p>
`;
const panelContent = (title, description = '')=>b`
  <div style="padding: 20px 4px 8px;">
    <h3
      style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #111827;"
    >
      ${title}
    </h3>
    ${description ? b`<p
          style="margin: 0; font-size: 13.5px; color: #6b7280; line-height: 1.6;"
        >
          ${description}
        </p>` : A}
  </div>
`;
// ─────────────────────────────────────────────────────────────────────────────
const meta = {
    title: 'Components/Tabs',
    component: 'vi-tabs',
    tags: [
        'autodocs'
    ],
    argTypes: {
        active: {
            control: 'text',
            description: 'tab-id of the active tab'
        },
        orientation: {
            control: 'select',
            options: [
                'horizontal',
                'vertical'
            ],
            description: 'Layout direction'
        },
        variant: {
            control: 'select',
            options: [
                'line',
                'pill',
                'card',
                'enclosed',
                'secondary'
            ],
            description: 'Visual style variant'
        },
        activation: {
            control: 'select',
            options: [
                'manual',
                'automatic'
            ],
            description: 'manual: Enter/Space to activate | automatic: focus activates'
        },
        overflow: {
            control: 'select',
            options: [
                'scroll',
                'menu',
                'wrap'
            ],
            description: 'Overflow strategy when tabs exceed available width'
        },
        anchorClosable: {
            control: 'boolean',
            description: 'Sort closable tabs to the end of the tablist'
        }
    },
    args: {
        active: 'tab-1',
        orientation: 'horizontal',
        variant: 'line',
        activation: 'manual',
        overflow: 'scroll',
        anchorClosable: false
    }
};
// ── Default ───────────────────────────────────────────────────────────────────
const Default = {
    name: 'Default',
    render: (args)=>b`
    <vi-tabs
      active=${args.active}
      orientation=${args.orientation}
      variant=${args.variant}
      activation=${args.activation}
      overflow=${args.overflow}
      ?anchor-closable=${args.anchorClosable}
    >
      <vi-tab tab-id="tab-1">Demographics</vi-tab>
      <vi-tab tab-id="tab-2">Vital Signs</vi-tab>
      <vi-tab tab-id="tab-3">Laboratory</vi-tab>
      <vi-tab tab-id="tab-4">Medications</vi-tab>

      <vi-tab-panel for="tab-1"
        >${panelContent('Demographics', 'Patient demographics and baseline information.')}</vi-tab-panel
      >
      <vi-tab-panel for="tab-2"
        >${panelContent('Vital Signs', 'Blood pressure, heart rate, temperature, and weight records.')}</vi-tab-panel
      >
      <vi-tab-panel for="tab-3"
        >${panelContent('Laboratory', 'Lab results, haematology, biochemistry, and urinalysis.')}</vi-tab-panel
      >
      <vi-tab-panel for="tab-4"
        >${panelContent('Medications', 'Concomitant medications and dosing history.')}</vi-tab-panel
      >
    </vi-tabs>
  `
};
// ── All Variants ──────────────────────────────────────────────────────────────
const AllVariants = {
    name: 'All Variants',
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 2.5rem;">
      ${[
            'line',
            'pill',
            'card',
            'enclosed',
            'secondary'
        ].map((variant)=>b`
          <div>
            ${label(`variant="${variant}"`)}
            <vi-tabs active="a" variant=${variant}>
              <vi-tab tab-id="a">Overview</vi-tab>
              <vi-tab tab-id="b">Subjects</vi-tab>
              <vi-tab tab-id="c" badge-count="4">Queries</vi-tab>
              <vi-tab-panel for="a">${panelContent('Overview')}</vi-tab-panel>
              <vi-tab-panel for="b">${panelContent('Subjects')}</vi-tab-panel>
              <vi-tab-panel for="c">${panelContent('Queries')}</vi-tab-panel>
            </vi-tabs>
          </div>
        `)}
    </div>
  `
};
// ── Disabled Tab ──────────────────────────────────────────────────────────────
const WithDisabledTab = {
    name: 'Disabled Tab',
    render: ()=>b`
    <vi-tabs active="visit-1">
      <vi-tab tab-id="visit-1">Screening</vi-tab>
      <vi-tab tab-id="visit-2">Visit 1</vi-tab>
      <vi-tab tab-id="visit-3" disabled>Visit 2 (Locked)</vi-tab>
      <vi-tab tab-id="visit-4">EOS</vi-tab>

      <vi-tab-panel for="visit-1"
        >${panelContent('Screening', 'Initial screening forms and consent documentation.')}</vi-tab-panel
      >
      <vi-tab-panel for="visit-2"
        >${panelContent('Visit 1', 'Day 1 assessments and lab samples.')}</vi-tab-panel
      >
      <vi-tab-panel for="visit-3"
        >${panelContent('Visit 2', 'Locked by data manager — no edit access.')}</vi-tab-panel
      >
      <vi-tab-panel for="visit-4"
        >${panelContent('EOS', 'End of study evaluations and follow-up.')}</vi-tab-panel
      >
    </vi-tabs>
  `
};
// ── Badge Counts ──────────────────────────────────────────────────────────────
const WithBadgeCounts = {
    name: 'Badge Counts',
    render: ()=>b`
    <vi-tabs active="overview">
      <vi-tab tab-id="overview">Overview</vi-tab>
      <vi-tab tab-id="queries" badge-count="7">Open Queries</vi-tab>
      <vi-tab tab-id="sdv" badge-count="3">SDV</vi-tab>
      <vi-tab tab-id="documents">Documents</vi-tab>

      <vi-tab-panel for="overview"
        >${panelContent('Overview', 'Subject-level summary and study status.')}</vi-tab-panel
      >
      <vi-tab-panel for="queries"
        >${panelContent('Open Queries', '7 queries require investigator response.')}</vi-tab-panel
      >
      <vi-tab-panel for="sdv"
        >${panelContent('SDV', '3 pages pending source data verification.')}</vi-tab-panel
      >
      <vi-tab-panel for="documents"
        >${panelContent('Documents', 'Subject-level document repository.')}</vi-tab-panel
      >
    </vi-tabs>
  `
};
// ── Vertical ──────────────────────────────────────────────────────────────────
const VerticalOrientation = {
    name: 'Vertical (Sidebar)',
    render: ()=>b`
    <div style="display: flex; height: 280px;">
      <vi-tabs
        orientation="vertical"
        variant="line"
        active="general"
        style="width: 100%;"
      >
        <vi-tab tab-id="general">General</vi-tab>
        <vi-tab tab-id="users">Users</vi-tab>
        <vi-tab tab-id="roles">Roles & Permissions</vi-tab>
        <vi-tab tab-id="audit">Audit Log</vi-tab>

        <vi-tab-panel for="general"
          >${panelContent('General Settings', 'Study name, protocol version, and basic configuration.')}</vi-tab-panel
        >
        <vi-tab-panel for="users"
          >${panelContent('Users', 'Manage investigator and coordinator access.')}</vi-tab-panel
        >
        <vi-tab-panel for="roles"
          >${panelContent('Roles & Permissions', 'Define what each role can view, edit, and approve.')}</vi-tab-panel
        >
        <vi-tab-panel for="audit"
          >${panelContent('Audit Log', 'Full system audit trail for 21 CFR Part 11 compliance.')}</vi-tab-panel
        >
      </vi-tabs>
    </div>
  `
};
// ── Manual Activation ─────────────────────────────────────────────────────────
const ManualActivation = {
    name: 'Manual Activation (Keyboard)',
    render: ()=>b`
    ${note("Arrow keys move focus only. Press Enter or Space to activate. Useful for heavy panels that shouldn't reload on every keypress.")}
    <vi-tabs activation="manual" active="reports">
      <vi-tab tab-id="reports">Reports</vi-tab>
      <vi-tab tab-id="exports">Data Exports</vi-tab>
      <vi-tab tab-id="analytics">Analytics</vi-tab>

      <vi-tab-panel for="reports"
        >${panelContent('Reports', 'Report panel — only loaded when explicitly activated.')}</vi-tab-panel
      >
      <vi-tab-panel for="exports"
        >${panelContent('Data Exports', 'Export configuration and history.')}</vi-tab-panel
      >
      <vi-tab-panel for="analytics"
        >${panelContent('Analytics', 'Usage analytics dashboard.')}</vi-tab-panel
      >
    </vi-tabs>
  `
};
// ── Before-change Guard ───────────────────────────────────────────────────────
const BeforeChangeGuard = {
    name: 'Before-change Guard',
    render: ()=>{
        const onBeforeChange = (e)=>{
            const proceed = confirm(`You have unsaved changes on "${e.detail.fromTabId}".\nDiscard and navigate to "${e.detail.toTabId}"?`);
            if (!proceed) e.preventDefault();
        };
        return b`
      ${note('Clicking a tab fires a confirmation dialog. Dismiss it to cancel the tab switch (e.preventDefault on vi-tabs-before-change).')}
      <vi-tabs active="form-a" @vi-tabs-before-change=${onBeforeChange}>
        <vi-tab tab-id="form-a">Demographics</vi-tab>
        <vi-tab tab-id="form-b">Vital Signs</vi-tab>
        <vi-tab tab-id="form-c">Laboratory</vi-tab>

        <vi-tab-panel for="form-a"
          >${panelContent('Demographics', 'Unsaved changes present — switching tabs will prompt.')}</vi-tab-panel
        >
        <vi-tab-panel for="form-b">${panelContent('Vital Signs')}</vi-tab-panel>
        <vi-tab-panel for="form-c">${panelContent('Laboratory')}</vi-tab-panel>
      </vi-tabs>
    `;
    }
};
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — Overflow Stories
// ─────────────────────────────────────────────────────────────────────────────
// ── Overflow: Scroll ──────────────────────────────────────────────────────────
const OverflowScroll = {
    name: 'Overflow → Scroll',
    render: ()=>b`
    ${note('When tabs exceed the available width, the tablist scrolls horizontally. Fade gradients at the edges hint at hidden content. Drag or use a trackpad to scroll.')}
    <div
      style="width: 100%; border: 1px dashed #e5e7eb; border-radius: 8px; padding: 16px;"
    >
      <vi-tabs active="tab-1" overflow="scroll">
        <vi-tab tab-id="tab-1">Demographics</vi-tab>
        <vi-tab tab-id="tab-2">Vital Signs</vi-tab>
        <vi-tab tab-id="tab-3">Laboratory</vi-tab>
        <vi-tab tab-id="tab-4">Medications</vi-tab>
        <vi-tab tab-id="tab-5">Adverse Events</vi-tab>
        <vi-tab tab-id="tab-6">Concomitant Meds</vi-tab>
        <vi-tab tab-id="tab-7">Medical History</vi-tab>

        <vi-tab-panel for="tab-1">${panelContent('Demographics')}</vi-tab-panel>
        <vi-tab-panel for="tab-2">${panelContent('Vital Signs')}</vi-tab-panel>
        <vi-tab-panel for="tab-3">${panelContent('Laboratory')}</vi-tab-panel>
        <vi-tab-panel for="tab-4">${panelContent('Medications')}</vi-tab-panel>
        <vi-tab-panel for="tab-5"
          >${panelContent('Adverse Events')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-6"
          >${panelContent('Concomitant Meds')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-7"
          >${panelContent('Medical History')}</vi-tab-panel
        >
      </vi-tabs>
    </div>
  `
};
// ── Overflow: Menu (Swap) ─────────────────────────────────────────────────────
const OverflowMenu = {
    name: 'Overflow → More Menu (Swap)',
    render: ()=>b`
    ${note('Tabs that don\'t fit appear in a "More" dropdown. Selecting one swaps it into the visible area — the last visible tab moves into the menu.')}
    <div
      style="width: 100%; border: 1px dashed #e5e7eb; border-radius: 8px; padding: 16px;"
    >
      <vi-tabs active="tab-1" overflow="menu">
        <vi-tab tab-id="tab-1">Demographics</vi-tab>
        <vi-tab tab-id="tab-2">Vital Signs</vi-tab>
        <vi-tab tab-id="tab-3">Laboratory</vi-tab>
        <vi-tab tab-id="tab-4">Medications</vi-tab>
        <vi-tab tab-id="tab-5">Adverse Events</vi-tab>
        <vi-tab tab-id="tab-6">Concomitant Meds</vi-tab>
        <vi-tab tab-id="tab-7">Medical History</vi-tab>
        <vi-tab tab-id="tab-8" badge-count="2">Queries</vi-tab>

        <vi-tab-panel for="tab-1"
          >${panelContent('Demographics', 'Selected from visible area.')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-2">${panelContent('Vital Signs')}</vi-tab-panel>
        <vi-tab-panel for="tab-3">${panelContent('Laboratory')}</vi-tab-panel>
        <vi-tab-panel for="tab-4">${panelContent('Medications')}</vi-tab-panel>
        <vi-tab-panel for="tab-5"
          >${panelContent('Adverse Events', 'Selected from "More" menu — swapped into visible area.')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-6"
          >${panelContent('Concomitant Meds')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-7"
          >${panelContent('Medical History')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-8"
          >${panelContent('Queries', '2 open queries.')}</vi-tab-panel
        >
      </vi-tabs>
    </div>
  `
};
// ── Overflow: Wrap ────────────────────────────────────────────────────────────
const OverflowWrap = {
    name: 'Overflow → Wrap',
    render: ()=>b`
    ${note("Tabs that don't fit wrap to additional lines. Best for constrained widths with a small number of tabs.")}
    <div
      style="width: 100%; border: 1px dashed #e5e7eb; border-radius: 8px; padding: 16px;"
    >
      <vi-tabs active="tab-1" overflow="wrap" variant="pill">
        <vi-tab tab-id="tab-1">Demographics</vi-tab>
        <vi-tab tab-id="tab-2">Vital Signs</vi-tab>
        <vi-tab tab-id="tab-3">Laboratory</vi-tab>
        <vi-tab tab-id="tab-4">Medications</vi-tab>
        <vi-tab tab-id="tab-5">Adverse Events</vi-tab>

        <vi-tab-panel for="tab-1">${panelContent('Demographics')}</vi-tab-panel>
        <vi-tab-panel for="tab-2">${panelContent('Vital Signs')}</vi-tab-panel>
        <vi-tab-panel for="tab-3">${panelContent('Laboratory')}</vi-tab-panel>
        <vi-tab-panel for="tab-4">${panelContent('Medications')}</vi-tab-panel>
        <vi-tab-panel for="tab-5"
          >${panelContent('Adverse Events')}</vi-tab-panel
        >
      </vi-tabs>
    </div>
  `
};
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — Closable Tabs Stories
// ─────────────────────────────────────────────────────────────────────────────
// ── Closable Tabs ─────────────────────────────────────────────────────────────
const ClosableTabs = {
    name: 'Closable Tabs',
    render: ()=>{
        // Track open tabs in a reactive way using a simple array
        const tabs = [
            {
                id: 'demographics',
                label: 'Demographics',
                content: 'Patient demographics and baseline information.'
            },
            {
                id: 'vitals',
                label: 'Vital Signs',
                content: 'Blood pressure, heart rate, temperature.'
            },
            {
                id: 'lab',
                label: 'Laboratory',
                content: 'Lab results, haematology, biochemistry.'
            },
            {
                id: 'meds',
                label: 'Medications',
                content: 'Concomitant medications and dosing.'
            },
            {
                id: 'adverse',
                label: 'Adverse Events',
                content: 'AE recording and severity assessment.'
            }
        ];
        let openTabIds = tabs.map((t)=>t.id);
        let activeTabId = tabs[0].id;
        const rerender = ()=>{
            container.replaceChildren();
            container.appendChild(buildUI());
        };
        const buildUI = ()=>{
            const el = document.createElement('div');
            const tabsEl = document.createElement('vi-tabs');
            tabsEl.setAttribute('active', activeTabId);
            tabsEl.setAttribute('variant', 'card');
            tabsEl.addEventListener('vi-tabs-tab-close', (e)=>{
                openTabIds = openTabIds.filter((id)=>id !== e.detail.tabId);
                if (openTabIds.length === 0) activeTabId = '';
                rerender();
            });
            tabsEl.addEventListener('vi-tabs-change', (e)=>{
                activeTabId = e.detail.toTabId;
            });
            for (const tab of tabs.filter((t)=>openTabIds.includes(t.id))){
                const tabEl = document.createElement('vi-tab');
                tabEl.setAttribute('tab-id', tab.id);
                tabEl.setAttribute('closable', '');
                tabEl.textContent = tab.label;
                tabsEl.appendChild(tabEl);
                const panelEl = document.createElement('vi-tab-panel');
                panelEl.setAttribute('for', tab.id);
                D(b`<div style="padding: 20px 4px 8px;">
            <h3 style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #111827;">${tab.label}</h3>
            <p style="margin: 0; font-size: 13.5px; color: #6b7280;">${tab.content}</p>
            ${openTabIds.length === 0 ? b`<p style="color:#9ca3af;font-style:italic">All tabs closed.</p>` : A}
          </div>`, panelEl);
                tabsEl.appendChild(panelEl);
            }
            if (openTabIds.length === 0) {
                D(b`<p style="font-size:13px;color:#9ca3af;font-style:italic;margin:16px 4px;">All tabs have been closed.</p>`, el);
            } else {
                el.appendChild(tabsEl);
            }
            return el;
        };
        const container = document.createElement('div');
        container.appendChild(buildUI());
        return b`
      ${note('Hover a tab to reveal the × button. Close button fires vi-tab-before-close (cancelable) then vi-tab-close. Focus moves to the previous tab automatically.')}
      ${container}
    `;
    }
};
// ── Closable + anchor-closable ────────────────────────────────────────────────
const ClosableAnchoredToEnd = {
    name: 'Closable + anchor-closable',
    render: ()=>b`
    ${note('anchor-closable sorts closable tabs to the end using CSS order. Non-closable "pinned" tabs stay at the front. DOM order and ARIA reading order are unchanged.')}
    <vi-tabs active="overview" anchor-closable>
      <vi-tab tab-id="overview">Overview</vi-tab>
      <vi-tab tab-id="summary">Summary</vi-tab>
      <vi-tab tab-id="demographics" closable>Demographics</vi-tab>
      <vi-tab tab-id="vitals" closable>Vital Signs</vi-tab>
      <vi-tab tab-id="lab" closable badge-count="3">Laboratory</vi-tab>

      <vi-tab-panel for="overview">
        ${panelContent('Overview', 'Pinned — cannot be closed. Always first.')}
      </vi-tab-panel>
      <vi-tab-panel for="summary">
        ${panelContent('Summary', 'Pinned — cannot be closed. Always second.')}
      </vi-tab-panel>
      <vi-tab-panel for="demographics">
        ${panelContent('Demographics', 'Closable — anchored to end by anchor-closable.')}
      </vi-tab-panel>
      <vi-tab-panel for="vitals">
        ${panelContent('Vital Signs', 'Closable — hover to see the × button.')}
      </vi-tab-panel>
      <vi-tab-panel for="lab">
        ${panelContent('Laboratory', '3 pending results. Closable tab with badge.')}
      </vi-tab-panel>
    </vi-tabs>
  `
};
// ── Before-close Guard ────────────────────────────────────────────────────────
const BeforeCloseGuard = {
    name: 'Before-close Guard',
    render: ()=>{
        const onBeforeClose = (e)=>{
            const confirm_ = confirm(`Close tab "${e.detail.tabId}"? Unsaved changes will be lost.`);
            if (!confirm_) e.preventDefault();
        };
        return b`
      ${note('vi-tab-before-close is cancelable. The host app calls e.preventDefault() to block the close — e.g. when a form has unsaved changes.')}
      <vi-tabs active="form-a" @vi-tab-before-close=${onBeforeClose}>
        <vi-tab tab-id="form-a" closable>Demographics (dirty)</vi-tab>
        <vi-tab tab-id="form-b" closable>Vital Signs</vi-tab>
        <vi-tab tab-id="form-c">Laboratory (non-closable)</vi-tab>

        <vi-tab-panel for="form-a"
          >${panelContent('Demographics', 'Has unsaved changes — closing will prompt.')}</vi-tab-panel
        >
        <vi-tab-panel for="form-b"
          >${panelContent('Vital Signs', 'Clean — closes immediately.')}</vi-tab-panel
        >
        <vi-tab-panel for="form-c"
          >${panelContent('Laboratory', 'No close button — always visible.')}</vi-tab-panel
        >
      </vi-tabs>
    `;
    }
};
const DestroyOnClose = {
    render: ()=>{
        return b`
      ${note('When destroy-on-close is true, the vi-tabs component automatically removes the tab and its panel from the DOM when the tab is closed.')}
      <vi-tabs active="tab-1" destroy-on-close>
        <vi-tab tab-id="tab-1">Permanent Tab</vi-tab>
        <vi-tab tab-id="tab-2" closable>Self-Destroying Tab 1</vi-tab>
        <vi-tab tab-id="tab-3" closable>Self-Destroying Tab 2</vi-tab>
        
        <vi-tab-panel for="tab-1">${panelContent('Permanent', 'I cannot be closed.')}</vi-tab-panel>
        <vi-tab-panel for="tab-2">${panelContent('Self-Destroying Tab 1', 'When you close me, I will be automatically removed from the DOM.')}</vi-tab-panel>
        <vi-tab-panel for="tab-3">${panelContent('Self-Destroying Tab 2', 'When you close me, I will be automatically removed from the DOM.')}</vi-tab-panel>
      </vi-tabs>
    `;
    }
};
// ── Full Feature Demo ─────────────────────────────────────────────────────────
const LazyPanels = {
    name: 'Lazy Panels',
    render: ()=>b`
    ${note('Panels with lazy only render content on first activation. Check the DOM to confirm inactive panels are empty until visited.')}
    <vi-tabs active="eager">
      <vi-tab tab-id="eager">Eager Panel</vi-tab>
      <vi-tab tab-id="lazy-1">Lazy Panel 1</vi-tab>
      <vi-tab tab-id="lazy-2">Lazy Panel 2</vi-tab>

      <vi-tab-panel for="eager">
        ${panelContent('Eager Panel', 'This panel is always rendered in the DOM.')}
      </vi-tab-panel>
      <vi-tab-panel for="lazy-1" lazy>
        ${panelContent('Lazy Panel 1', 'Rendered on first activation only — inspect DOM before visiting.')}
      </vi-tab-panel>
      <vi-tab-panel for="lazy-2" lazy>
        ${panelContent('Lazy Panel 2', 'Rendered on first activation only.')}
      </vi-tab-panel>
    </vi-tabs>
  `
};
const KitchenSink = {
    name: '🧪 Kitchen Sink',
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 3rem;">
      <div>
        ${label('Line + overflow scroll + badge + disabled')}
        <div style="width: 100%;">
          <vi-tabs active="demo" variant="line" overflow="scroll">
            <vi-tab tab-id="demo">Demographics</vi-tab>
            <vi-tab tab-id="vitals">Vital Signs</vi-tab>
            <vi-tab tab-id="lab" badge-count="5">Laboratory</vi-tab>
            <vi-tab tab-id="meds" disabled>Medications (Locked)</vi-tab>
            <vi-tab tab-id="ae">Adverse Events</vi-tab>
            <vi-tab tab-id="cm">Concomitant Meds</vi-tab>
            <vi-tab tab-id="mh">Medical History</vi-tab>
            <vi-tab-panel for="demo"
              >${panelContent('Demographics')}</vi-tab-panel
            >
            <vi-tab-panel for="vitals"
              >${panelContent('Vital Signs')}</vi-tab-panel
            >
            <vi-tab-panel for="lab"
              >${panelContent('Laboratory', '5 pending results.')}</vi-tab-panel
            >
            <vi-tab-panel for="meds"
              >${panelContent('Medications (Locked)')}</vi-tab-panel
            >
            <vi-tab-panel for="ae"
              >${panelContent('Adverse Events')}</vi-tab-panel
            >
            <vi-tab-panel for="cm"
              >${panelContent('Concomitant Meds')}</vi-tab-panel
            >
            <vi-tab-panel for="mh"
              >${panelContent('Medical History')}</vi-tab-panel
            >
          </vi-tabs>
        </div>
      </div>

      <div>
        ${label('Pill + closable + anchor-closable')}
        <vi-tabs active="overview" variant="pill" anchor-closable>
          <vi-tab tab-id="overview">Overview</vi-tab>
          <vi-tab tab-id="visits" closable>Visits</vi-tab>
          <vi-tab tab-id="lab2" closable badge-count="3">Lab</vi-tab>
          <vi-tab tab-id="ae2" closable>Adverse Events</vi-tab>
          <vi-tab-panel for="overview"
            >${panelContent('Overview', 'Pinned tab — always first.')}</vi-tab-panel
          >
          <vi-tab-panel for="visits"
            >${panelContent('Visits', 'Closable — anchored to end.')}</vi-tab-panel
          >
          <vi-tab-panel for="lab2"
            >${panelContent('Lab', '3 pending results.')}</vi-tab-panel
          >
          <vi-tab-panel for="ae2"
            >${panelContent('Adverse Events')}</vi-tab-panel
          >
        </vi-tabs>
      </div>

      <div>
        ${label('Card + overflow menu (swap)')}
        <div style="width: 100%;">
          <vi-tabs active="tab-1" variant="card" overflow="menu">
            <vi-tab tab-id="tab-1">Demographics</vi-tab>
            <vi-tab tab-id="tab-2">Vital Signs</vi-tab>
            <vi-tab tab-id="tab-3">Laboratory</vi-tab>
            <vi-tab tab-id="tab-4">Medications</vi-tab>
            <vi-tab tab-id="tab-5">Adverse Events</vi-tab>
            <vi-tab tab-id="tab-6">Concomitant Meds</vi-tab>
            <vi-tab-panel for="tab-1"
              >${panelContent('Demographics')}</vi-tab-panel
            >
            <vi-tab-panel for="tab-2"
              >${panelContent('Vital Signs')}</vi-tab-panel
            >
            <vi-tab-panel for="tab-3"
              >${panelContent('Laboratory')}</vi-tab-panel
            >
            <vi-tab-panel for="tab-4"
              >${panelContent('Medications')}</vi-tab-panel
            >
            <vi-tab-panel for="tab-5"
              >${panelContent('Adverse Events', 'Swap into view from More menu.')}</vi-tab-panel
            >
            <vi-tab-panel for="tab-6"
              >${panelContent('Concomitant Meds')}</vi-tab-panel
            >
          </vi-tabs>
        </div>
      </div>

      <div>
        ${label('Vertical sidebar — settings pattern')}
        <div style="display: flex; height: 240px;">
          <vi-tabs
            orientation="vertical"
            variant="line"
            active="general"
            style="width: 100%;"
          >
            <vi-tab tab-id="general">General</vi-tab>
            <vi-tab tab-id="users">Users</vi-tab>
            <vi-tab tab-id="roles">Roles</vi-tab>
            <vi-tab tab-id="audit" badge-count="12">Audit Log</vi-tab>
            <vi-tab-panel for="general"
              >${panelContent('General Settings')}</vi-tab-panel
            >
            <vi-tab-panel for="users">${panelContent('Users')}</vi-tab-panel>
            <vi-tab-panel for="roles">${panelContent('Roles')}</vi-tab-panel>
            <vi-tab-panel for="audit"
              >${panelContent('Audit Log', '12 entries since last review.')}</vi-tab-panel
            >
          </vi-tabs>
        </div>
      </div>
    </div>
  `
};
const ResponsiveOverflowMenu = {
    name: 'Responsive Overflow Menu',
    render: ()=>b`
    <div style="padding: 24px; width: 100%; max-width: 100%;">
      ${note('Resize the browser window itself to see the overflow menu dynamically push tabs in and out.')}

      <vi-tabs active="tab-1" variant="line" overflow="menu">
        <vi-tab tab-id="tab-1">Demographics</vi-tab>
        <vi-tab tab-id="tab-2">Vital Signs</vi-tab>
        <vi-tab tab-id="tab-3">Laboratory</vi-tab>
        <vi-tab tab-id="tab-4">Medications</vi-tab>
        <vi-tab tab-id="tab-5">Adverse Events</vi-tab>
        <vi-tab tab-id="tab-6">Medical History</vi-tab>
        <vi-tab tab-id="tab-7">Concomitant Meds</vi-tab>

        <vi-tab-panel for="tab-1"
          >${panelContent('Demographics', 'Resize the browser window to see the overflow menu update in real-time.')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-2">${panelContent('Vital Signs')}</vi-tab-panel>
        <vi-tab-panel for="tab-3">${panelContent('Laboratory')}</vi-tab-panel>
        <vi-tab-panel for="tab-4">${panelContent('Medications')}</vi-tab-panel>
        <vi-tab-panel for="tab-5"
          >${panelContent('Adverse Events')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-6"
          >${panelContent('Medical History')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-7"
          >${panelContent('Concomitant Meds')}</vi-tab-panel
        >
      </vi-tabs>
    </div>
  `
};
// ── Addable / Dynamic Tabs ────────────────────────────────────────────────────
const AddableTabs = {
    name: 'Dynamic Tabs (Addable)',
    render: ()=>{
        let count = 4;
        let activeTabId = 'tab-1';
        const buildUI = ()=>{
            const el = document.createElement('div');
            const tabsEl = document.createElement('vi-tabs');
            tabsEl.setAttribute('active', activeTabId);
            tabsEl.setAttribute('overflow', 'scroll');
            tabsEl.setAttribute('addable', '');
            tabsEl.setAttribute('anchor-closable', '');
            const rerender = ()=>{
                el.replaceChildren();
                el.appendChild(buildUI());
            };
            tabsEl.addEventListener('vi-tabs-change', (e)=>{
                activeTabId = e.detail.toTabId;
            });
            tabsEl.addEventListener('vi-tabs-add', ()=>{
                count++;
                activeTabId = `tab-${count}`;
                rerender();
            });
            // Render the tabs dynamically
            for(let i = 1; i <= count; i++){
                const id = `tab-${i}`;
                const tabEl = document.createElement('vi-tab');
                tabEl.setAttribute('tab-id', id);
                tabEl.setAttribute('closable', '');
                tabEl.textContent = `Document ${i}`;
                tabsEl.appendChild(tabEl);
                const panelEl = document.createElement('vi-tab-panel');
                panelEl.setAttribute('for', id);
                D(b`<div style="padding: 20px 4px 8px;">
            <h3 style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #111827;">Document ${i}</h3>
            <p style="margin: 0; font-size: 13.5px; color: #6b7280;">Content for dynamically added document ${i}.</p>
          </div>`, panelEl);
                tabsEl.appendChild(panelEl);
            }
            return tabsEl;
        };
        const container = document.createElement('div');
        container.style.width = '100%';
        container.appendChild(buildUI());
        return b`
      ${note('Click the + button to dynamically add new tabs to the DOM. The vi-tabs component automatically registers them.')}
      ${container}
    `;
    }
};
const FocusDelegation = {
    render: ()=>{
        return b`
      ${label('Focus Delegation Test')}
      ${note('Click the active tab (or Tab into it) and press Tab. Focus should immediately land on the first input field inside the panel.')}

      <div
        style="max-width: 600px; padding: 24px; background: #f9fafb; border-radius: 8px;"
      >
        <vi-tabs active="profile">
          <vi-tab slot="tab" tab-id="profile">User Profile</vi-tab>
          <vi-tab slot="tab" tab-id="settings">Settings</vi-tab>

          <vi-tab-panel slot="panel" for="profile">
            <div
              style="padding: 24px; background: white; border-radius: 8px; margin-top: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
            >
              <h3 style="margin-top: 0;">Edit Profile</h3>
              <form style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label for="fname" style="font-size: 14px; font-weight: 500;"
                    >First Name</label
                  >
                  <input
                    id="fname"
                    type="text"
                    placeholder="Jane"
                    style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;"
                  />
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label for="lname" style="font-size: 14px; font-weight: 500;"
                    >Last Name</label
                  >
                  <input
                    id="lname"
                    type="text"
                    placeholder="Doe"
                    style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;"
                  />
                </div>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                  <button
                    type="submit"
                    style="padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    style="padding: 8px 16px; background: white; color: #374151; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer;"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </vi-tab-panel>

          <vi-tab-panel slot="panel" for="settings">
            <div
              style="padding: 24px; background: white; border-radius: 8px; margin-top: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
            >
              <h3 style="margin-top: 0;">Account Settings</h3>
              <form style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input id="notif" type="checkbox" />
                  <label for="notif" style="font-size: 14px;"
                    >Enable Email Notifications</label
                  >
                </div>
              </form>
            </div>
          </vi-tab-panel>
        </vi-tabs>
      </div>
    `;
    }
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Default',\n  render: args => html`\n    <vi-tabs\n      active=${args.active}\n      orientation=${args.orientation}\n      variant=${args.variant}\n      activation=${args.activation}\n      overflow=${args.overflow}\n      ?anchor-closable=${args.anchorClosable}\n    >\n      <vi-tab tab-id=\"tab-1\">Demographics</vi-tab>\n      <vi-tab tab-id=\"tab-2\">Vital Signs</vi-tab>\n      <vi-tab tab-id=\"tab-3\">Laboratory</vi-tab>\n      <vi-tab tab-id=\"tab-4\">Medications</vi-tab>\n\n      <vi-tab-panel for=\"tab-1\"\n        >${panelContent('Demographics', 'Patient demographics and baseline information.')}</vi-tab-panel\n      >\n      <vi-tab-panel for=\"tab-2\"\n        >${panelContent('Vital Signs', 'Blood pressure, heart rate, temperature, and weight records.')}</vi-tab-panel\n      >\n      <vi-tab-panel for=\"tab-3\"\n        >${panelContent('Laboratory', 'Lab results, haematology, biochemistry, and urinalysis.')}</vi-tab-panel\n      >\n      <vi-tab-panel for=\"tab-4\"\n        >${panelContent('Medications', 'Concomitant medications and dosing history.')}</vi-tab-panel\n      >\n    </vi-tabs>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
AllVariants.parameters = {
    ...AllVariants.parameters,
    docs: {
        ...AllVariants.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'All Variants',\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 2.5rem;\">\n      ${(['line', 'pill', 'card', 'enclosed', 'secondary'] as const).map(variant => html`\n          <div>\n            ${label(`variant=\"${variant}\"`)}\n            <vi-tabs active=\"a\" variant=${variant}>\n              <vi-tab tab-id=\"a\">Overview</vi-tab>\n              <vi-tab tab-id=\"b\">Subjects</vi-tab>\n              <vi-tab tab-id=\"c\" badge-count=\"4\">Queries</vi-tab>\n              <vi-tab-panel for=\"a\">${panelContent('Overview')}</vi-tab-panel>\n              <vi-tab-panel for=\"b\">${panelContent('Subjects')}</vi-tab-panel>\n              <vi-tab-panel for=\"c\">${panelContent('Queries')}</vi-tab-panel>\n            </vi-tabs>\n          </div>\n        `)}\n    </div>\n  `\n}",
            ...AllVariants.parameters?.docs?.source
        }
    }
};
WithDisabledTab.parameters = {
    ...WithDisabledTab.parameters,
    docs: {
        ...WithDisabledTab.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Disabled Tab',\n  render: () => html`\n    <vi-tabs active=\"visit-1\">\n      <vi-tab tab-id=\"visit-1\">Screening</vi-tab>\n      <vi-tab tab-id=\"visit-2\">Visit 1</vi-tab>\n      <vi-tab tab-id=\"visit-3\" disabled>Visit 2 (Locked)</vi-tab>\n      <vi-tab tab-id=\"visit-4\">EOS</vi-tab>\n\n      <vi-tab-panel for=\"visit-1\"\n        >${panelContent('Screening', 'Initial screening forms and consent documentation.')}</vi-tab-panel\n      >\n      <vi-tab-panel for=\"visit-2\"\n        >${panelContent('Visit 1', 'Day 1 assessments and lab samples.')}</vi-tab-panel\n      >\n      <vi-tab-panel for=\"visit-3\"\n        >${panelContent('Visit 2', 'Locked by data manager \u2014 no edit access.')}</vi-tab-panel\n      >\n      <vi-tab-panel for=\"visit-4\"\n        >${panelContent('EOS', 'End of study evaluations and follow-up.')}</vi-tab-panel\n      >\n    </vi-tabs>\n  `\n}",
            ...WithDisabledTab.parameters?.docs?.source
        }
    }
};
WithBadgeCounts.parameters = {
    ...WithBadgeCounts.parameters,
    docs: {
        ...WithBadgeCounts.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Badge Counts',\n  render: () => html`\n    <vi-tabs active=\"overview\">\n      <vi-tab tab-id=\"overview\">Overview</vi-tab>\n      <vi-tab tab-id=\"queries\" badge-count=\"7\">Open Queries</vi-tab>\n      <vi-tab tab-id=\"sdv\" badge-count=\"3\">SDV</vi-tab>\n      <vi-tab tab-id=\"documents\">Documents</vi-tab>\n\n      <vi-tab-panel for=\"overview\"\n        >${panelContent('Overview', 'Subject-level summary and study status.')}</vi-tab-panel\n      >\n      <vi-tab-panel for=\"queries\"\n        >${panelContent('Open Queries', '7 queries require investigator response.')}</vi-tab-panel\n      >\n      <vi-tab-panel for=\"sdv\"\n        >${panelContent('SDV', '3 pages pending source data verification.')}</vi-tab-panel\n      >\n      <vi-tab-panel for=\"documents\"\n        >${panelContent('Documents', 'Subject-level document repository.')}</vi-tab-panel\n      >\n    </vi-tabs>\n  `\n}",
            ...WithBadgeCounts.parameters?.docs?.source
        }
    }
};
VerticalOrientation.parameters = {
    ...VerticalOrientation.parameters,
    docs: {
        ...VerticalOrientation.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Vertical (Sidebar)',\n  render: () => html`\n    <div style=\"display: flex; height: 280px;\">\n      <vi-tabs\n        orientation=\"vertical\"\n        variant=\"line\"\n        active=\"general\"\n        style=\"width: 100%;\"\n      >\n        <vi-tab tab-id=\"general\">General</vi-tab>\n        <vi-tab tab-id=\"users\">Users</vi-tab>\n        <vi-tab tab-id=\"roles\">Roles & Permissions</vi-tab>\n        <vi-tab tab-id=\"audit\">Audit Log</vi-tab>\n\n        <vi-tab-panel for=\"general\"\n          >${panelContent('General Settings', 'Study name, protocol version, and basic configuration.')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"users\"\n          >${panelContent('Users', 'Manage investigator and coordinator access.')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"roles\"\n          >${panelContent('Roles & Permissions', 'Define what each role can view, edit, and approve.')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"audit\"\n          >${panelContent('Audit Log', 'Full system audit trail for 21 CFR Part 11 compliance.')}</vi-tab-panel\n        >\n      </vi-tabs>\n    </div>\n  `\n}",
            ...VerticalOrientation.parameters?.docs?.source
        }
    }
};
ManualActivation.parameters = {
    ...ManualActivation.parameters,
    docs: {
        ...ManualActivation.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Manual Activation (Keyboard)',\n  render: () => html`\n    ${note(\"Arrow keys move focus only. Press Enter or Space to activate. Useful for heavy panels that shouldn't reload on every keypress.\")}\n    <vi-tabs activation=\"manual\" active=\"reports\">\n      <vi-tab tab-id=\"reports\">Reports</vi-tab>\n      <vi-tab tab-id=\"exports\">Data Exports</vi-tab>\n      <vi-tab tab-id=\"analytics\">Analytics</vi-tab>\n\n      <vi-tab-panel for=\"reports\"\n        >${panelContent('Reports', 'Report panel \u2014 only loaded when explicitly activated.')}</vi-tab-panel\n      >\n      <vi-tab-panel for=\"exports\"\n        >${panelContent('Data Exports', 'Export configuration and history.')}</vi-tab-panel\n      >\n      <vi-tab-panel for=\"analytics\"\n        >${panelContent('Analytics', 'Usage analytics dashboard.')}</vi-tab-panel\n      >\n    </vi-tabs>\n  `\n}",
            ...ManualActivation.parameters?.docs?.source
        }
    }
};
BeforeChangeGuard.parameters = {
    ...BeforeChangeGuard.parameters,
    docs: {
        ...BeforeChangeGuard.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Before-change Guard',\n  render: () => {\n    const onBeforeChange = (e: CustomEvent<{\n      fromTabId: string;\n      toTabId: string;\n    }>) => {\n      const proceed = confirm(`You have unsaved changes on \"${e.detail.fromTabId}\".\\nDiscard and navigate to \"${e.detail.toTabId}\"?`);\n      if (!proceed) e.preventDefault();\n    };\n    return html`\n      ${note('Clicking a tab fires a confirmation dialog. Dismiss it to cancel the tab switch (e.preventDefault on vi-tabs-before-change).')}\n      <vi-tabs active=\"form-a\" @vi-tabs-before-change=${onBeforeChange}>\n        <vi-tab tab-id=\"form-a\">Demographics</vi-tab>\n        <vi-tab tab-id=\"form-b\">Vital Signs</vi-tab>\n        <vi-tab tab-id=\"form-c\">Laboratory</vi-tab>\n\n        <vi-tab-panel for=\"form-a\"\n          >${panelContent('Demographics', 'Unsaved changes present \u2014 switching tabs will prompt.')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"form-b\">${panelContent('Vital Signs')}</vi-tab-panel>\n        <vi-tab-panel for=\"form-c\">${panelContent('Laboratory')}</vi-tab-panel>\n      </vi-tabs>\n    `;\n  }\n}",
            ...BeforeChangeGuard.parameters?.docs?.source
        }
    }
};
OverflowScroll.parameters = {
    ...OverflowScroll.parameters,
    docs: {
        ...OverflowScroll.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Overflow \u2192 Scroll',\n  render: () => html`\n    ${note('When tabs exceed the available width, the tablist scrolls horizontally. Fade gradients at the edges hint at hidden content. Drag or use a trackpad to scroll.')}\n    <div\n      style=\"width: 100%; border: 1px dashed #e5e7eb; border-radius: 8px; padding: 16px;\"\n    >\n      <vi-tabs active=\"tab-1\" overflow=\"scroll\">\n        <vi-tab tab-id=\"tab-1\">Demographics</vi-tab>\n        <vi-tab tab-id=\"tab-2\">Vital Signs</vi-tab>\n        <vi-tab tab-id=\"tab-3\">Laboratory</vi-tab>\n        <vi-tab tab-id=\"tab-4\">Medications</vi-tab>\n        <vi-tab tab-id=\"tab-5\">Adverse Events</vi-tab>\n        <vi-tab tab-id=\"tab-6\">Concomitant Meds</vi-tab>\n        <vi-tab tab-id=\"tab-7\">Medical History</vi-tab>\n\n        <vi-tab-panel for=\"tab-1\">${panelContent('Demographics')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-2\">${panelContent('Vital Signs')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-3\">${panelContent('Laboratory')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-4\">${panelContent('Medications')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-5\"\n          >${panelContent('Adverse Events')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"tab-6\"\n          >${panelContent('Concomitant Meds')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"tab-7\"\n          >${panelContent('Medical History')}</vi-tab-panel\n        >\n      </vi-tabs>\n    </div>\n  `\n}",
            ...OverflowScroll.parameters?.docs?.source
        }
    }
};
OverflowMenu.parameters = {
    ...OverflowMenu.parameters,
    docs: {
        ...OverflowMenu.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Overflow \u2192 More Menu (Swap)',\n  render: () => html`\n    ${note('Tabs that don\\'t fit appear in a \"More\" dropdown. Selecting one swaps it into the visible area \u2014 the last visible tab moves into the menu.')}\n    <div\n      style=\"width: 100%; border: 1px dashed #e5e7eb; border-radius: 8px; padding: 16px;\"\n    >\n      <vi-tabs active=\"tab-1\" overflow=\"menu\">\n        <vi-tab tab-id=\"tab-1\">Demographics</vi-tab>\n        <vi-tab tab-id=\"tab-2\">Vital Signs</vi-tab>\n        <vi-tab tab-id=\"tab-3\">Laboratory</vi-tab>\n        <vi-tab tab-id=\"tab-4\">Medications</vi-tab>\n        <vi-tab tab-id=\"tab-5\">Adverse Events</vi-tab>\n        <vi-tab tab-id=\"tab-6\">Concomitant Meds</vi-tab>\n        <vi-tab tab-id=\"tab-7\">Medical History</vi-tab>\n        <vi-tab tab-id=\"tab-8\" badge-count=\"2\">Queries</vi-tab>\n\n        <vi-tab-panel for=\"tab-1\"\n          >${panelContent('Demographics', 'Selected from visible area.')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"tab-2\">${panelContent('Vital Signs')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-3\">${panelContent('Laboratory')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-4\">${panelContent('Medications')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-5\"\n          >${panelContent('Adverse Events', 'Selected from \"More\" menu \u2014 swapped into visible area.')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"tab-6\"\n          >${panelContent('Concomitant Meds')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"tab-7\"\n          >${panelContent('Medical History')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"tab-8\"\n          >${panelContent('Queries', '2 open queries.')}</vi-tab-panel\n        >\n      </vi-tabs>\n    </div>\n  `\n}",
            ...OverflowMenu.parameters?.docs?.source
        }
    }
};
OverflowWrap.parameters = {
    ...OverflowWrap.parameters,
    docs: {
        ...OverflowWrap.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Overflow \u2192 Wrap',\n  render: () => html`\n    ${note(\"Tabs that don't fit wrap to additional lines. Best for constrained widths with a small number of tabs.\")}\n    <div\n      style=\"width: 100%; border: 1px dashed #e5e7eb; border-radius: 8px; padding: 16px;\"\n    >\n      <vi-tabs active=\"tab-1\" overflow=\"wrap\" variant=\"pill\">\n        <vi-tab tab-id=\"tab-1\">Demographics</vi-tab>\n        <vi-tab tab-id=\"tab-2\">Vital Signs</vi-tab>\n        <vi-tab tab-id=\"tab-3\">Laboratory</vi-tab>\n        <vi-tab tab-id=\"tab-4\">Medications</vi-tab>\n        <vi-tab tab-id=\"tab-5\">Adverse Events</vi-tab>\n\n        <vi-tab-panel for=\"tab-1\">${panelContent('Demographics')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-2\">${panelContent('Vital Signs')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-3\">${panelContent('Laboratory')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-4\">${panelContent('Medications')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-5\"\n          >${panelContent('Adverse Events')}</vi-tab-panel\n        >\n      </vi-tabs>\n    </div>\n  `\n}",
            ...OverflowWrap.parameters?.docs?.source
        }
    }
};
ClosableTabs.parameters = {
    ...ClosableTabs.parameters,
    docs: {
        ...ClosableTabs.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Closable Tabs',\n  render: () => {\n    // Track open tabs in a reactive way using a simple array\n    const tabs = [{\n      id: 'demographics',\n      label: 'Demographics',\n      content: 'Patient demographics and baseline information.'\n    }, {\n      id: 'vitals',\n      label: 'Vital Signs',\n      content: 'Blood pressure, heart rate, temperature.'\n    }, {\n      id: 'lab',\n      label: 'Laboratory',\n      content: 'Lab results, haematology, biochemistry.'\n    }, {\n      id: 'meds',\n      label: 'Medications',\n      content: 'Concomitant medications and dosing.'\n    }, {\n      id: 'adverse',\n      label: 'Adverse Events',\n      content: 'AE recording and severity assessment.'\n    }];\n    let openTabIds = tabs.map(t => t.id);\n    let activeTabId = tabs[0].id;\n    const rerender = () => {\n      container.replaceChildren();\n      container.appendChild(buildUI());\n    };\n    const buildUI = () => {\n      const el = document.createElement('div');\n      const tabsEl = document.createElement('vi-tabs') as HTMLElement;\n      tabsEl.setAttribute('active', activeTabId);\n      tabsEl.setAttribute('variant', 'card');\n      tabsEl.addEventListener('vi-tabs-tab-close', (e: CustomEvent<{\n        tabId: string;\n      }>) => {\n        openTabIds = openTabIds.filter(id => id !== e.detail.tabId);\n        if (openTabIds.length === 0) activeTabId = '';\n        rerender();\n      });\n      tabsEl.addEventListener('vi-tabs-change', (e: CustomEvent<{\n        toTabId: string;\n      }>) => {\n        activeTabId = e.detail.toTabId;\n      });\n      for (const tab of tabs.filter(t => openTabIds.includes(t.id))) {\n        const tabEl = document.createElement('vi-tab') as HTMLElement;\n        tabEl.setAttribute('tab-id', tab.id);\n        tabEl.setAttribute('closable', '');\n        tabEl.textContent = tab.label;\n        tabsEl.appendChild(tabEl);\n        const panelEl = document.createElement('vi-tab-panel') as HTMLElement;\n        panelEl.setAttribute('for', tab.id);\n        render(html`<div style=\"padding: 20px 4px 8px;\">\n            <h3 style=\"margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #111827;\">${tab.label}</h3>\n            <p style=\"margin: 0; font-size: 13.5px; color: #6b7280;\">${tab.content}</p>\n            ${openTabIds.length === 0 ? html`<p style=\"color:#9ca3af;font-style:italic\">All tabs closed.</p>` : nothing}\n          </div>`, panelEl);\n        tabsEl.appendChild(panelEl);\n      }\n      if (openTabIds.length === 0) {\n        render(html`<p style=\"font-size:13px;color:#9ca3af;font-style:italic;margin:16px 4px;\">All tabs have been closed.</p>`, el);\n      } else {\n        el.appendChild(tabsEl);\n      }\n      return el;\n    };\n    const container = document.createElement('div');\n    container.appendChild(buildUI());\n    return html`\n      ${note('Hover a tab to reveal the \xD7 button. Close button fires vi-tab-before-close (cancelable) then vi-tab-close. Focus moves to the previous tab automatically.')}\n      ${container}\n    `;\n  }\n}",
            ...ClosableTabs.parameters?.docs?.source
        }
    }
};
ClosableAnchoredToEnd.parameters = {
    ...ClosableAnchoredToEnd.parameters,
    docs: {
        ...ClosableAnchoredToEnd.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Closable + anchor-closable',\n  render: () => html`\n    ${note('anchor-closable sorts closable tabs to the end using CSS order. Non-closable \"pinned\" tabs stay at the front. DOM order and ARIA reading order are unchanged.')}\n    <vi-tabs active=\"overview\" anchor-closable>\n      <vi-tab tab-id=\"overview\">Overview</vi-tab>\n      <vi-tab tab-id=\"summary\">Summary</vi-tab>\n      <vi-tab tab-id=\"demographics\" closable>Demographics</vi-tab>\n      <vi-tab tab-id=\"vitals\" closable>Vital Signs</vi-tab>\n      <vi-tab tab-id=\"lab\" closable badge-count=\"3\">Laboratory</vi-tab>\n\n      <vi-tab-panel for=\"overview\">\n        ${panelContent('Overview', 'Pinned \u2014 cannot be closed. Always first.')}\n      </vi-tab-panel>\n      <vi-tab-panel for=\"summary\">\n        ${panelContent('Summary', 'Pinned \u2014 cannot be closed. Always second.')}\n      </vi-tab-panel>\n      <vi-tab-panel for=\"demographics\">\n        ${panelContent('Demographics', 'Closable \u2014 anchored to end by anchor-closable.')}\n      </vi-tab-panel>\n      <vi-tab-panel for=\"vitals\">\n        ${panelContent('Vital Signs', 'Closable \u2014 hover to see the \xD7 button.')}\n      </vi-tab-panel>\n      <vi-tab-panel for=\"lab\">\n        ${panelContent('Laboratory', '3 pending results. Closable tab with badge.')}\n      </vi-tab-panel>\n    </vi-tabs>\n  `\n}",
            ...ClosableAnchoredToEnd.parameters?.docs?.source
        }
    }
};
BeforeCloseGuard.parameters = {
    ...BeforeCloseGuard.parameters,
    docs: {
        ...BeforeCloseGuard.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Before-close Guard',\n  render: () => {\n    const onBeforeClose = (e: CustomEvent<{\n      tabId: string;\n    }>) => {\n      const confirm_ = confirm(`Close tab \"${e.detail.tabId}\"? Unsaved changes will be lost.`);\n      if (!confirm_) e.preventDefault();\n    };\n    return html`\n      ${note('vi-tab-before-close is cancelable. The host app calls e.preventDefault() to block the close \u2014 e.g. when a form has unsaved changes.')}\n      <vi-tabs active=\"form-a\" @vi-tab-before-close=${onBeforeClose}>\n        <vi-tab tab-id=\"form-a\" closable>Demographics (dirty)</vi-tab>\n        <vi-tab tab-id=\"form-b\" closable>Vital Signs</vi-tab>\n        <vi-tab tab-id=\"form-c\">Laboratory (non-closable)</vi-tab>\n\n        <vi-tab-panel for=\"form-a\"\n          >${panelContent('Demographics', 'Has unsaved changes \u2014 closing will prompt.')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"form-b\"\n          >${panelContent('Vital Signs', 'Clean \u2014 closes immediately.')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"form-c\"\n          >${panelContent('Laboratory', 'No close button \u2014 always visible.')}</vi-tab-panel\n        >\n      </vi-tabs>\n    `;\n  }\n}",
            ...BeforeCloseGuard.parameters?.docs?.source
        }
    }
};
DestroyOnClose.parameters = {
    ...DestroyOnClose.parameters,
    docs: {
        ...DestroyOnClose.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => {\n    return html`\n      ${note('When destroy-on-close is true, the vi-tabs component automatically removes the tab and its panel from the DOM when the tab is closed.')}\n      <vi-tabs active=\"tab-1\" destroy-on-close>\n        <vi-tab tab-id=\"tab-1\">Permanent Tab</vi-tab>\n        <vi-tab tab-id=\"tab-2\" closable>Self-Destroying Tab 1</vi-tab>\n        <vi-tab tab-id=\"tab-3\" closable>Self-Destroying Tab 2</vi-tab>\n        \n        <vi-tab-panel for=\"tab-1\">${panelContent('Permanent', 'I cannot be closed.')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-2\">${panelContent('Self-Destroying Tab 1', 'When you close me, I will be automatically removed from the DOM.')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-3\">${panelContent('Self-Destroying Tab 2', 'When you close me, I will be automatically removed from the DOM.')}</vi-tab-panel>\n      </vi-tabs>\n    `;\n  }\n}",
            ...DestroyOnClose.parameters?.docs?.source
        }
    }
};
LazyPanels.parameters = {
    ...LazyPanels.parameters,
    docs: {
        ...LazyPanels.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Lazy Panels',\n  render: () => html`\n    ${note('Panels with lazy only render content on first activation. Check the DOM to confirm inactive panels are empty until visited.')}\n    <vi-tabs active=\"eager\">\n      <vi-tab tab-id=\"eager\">Eager Panel</vi-tab>\n      <vi-tab tab-id=\"lazy-1\">Lazy Panel 1</vi-tab>\n      <vi-tab tab-id=\"lazy-2\">Lazy Panel 2</vi-tab>\n\n      <vi-tab-panel for=\"eager\">\n        ${panelContent('Eager Panel', 'This panel is always rendered in the DOM.')}\n      </vi-tab-panel>\n      <vi-tab-panel for=\"lazy-1\" lazy>\n        ${panelContent('Lazy Panel 1', 'Rendered on first activation only \u2014 inspect DOM before visiting.')}\n      </vi-tab-panel>\n      <vi-tab-panel for=\"lazy-2\" lazy>\n        ${panelContent('Lazy Panel 2', 'Rendered on first activation only.')}\n      </vi-tab-panel>\n    </vi-tabs>\n  `\n}",
            ...LazyPanels.parameters?.docs?.source
        }
    }
};
KitchenSink.parameters = {
    ...KitchenSink.parameters,
    docs: {
        ...KitchenSink.parameters?.docs,
        source: {
            originalSource: "{\n  name: '\uD83E\uDDEA Kitchen Sink',\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 3rem;\">\n      <div>\n        ${label('Line + overflow scroll + badge + disabled')}\n        <div style=\"width: 100%;\">\n          <vi-tabs active=\"demo\" variant=\"line\" overflow=\"scroll\">\n            <vi-tab tab-id=\"demo\">Demographics</vi-tab>\n            <vi-tab tab-id=\"vitals\">Vital Signs</vi-tab>\n            <vi-tab tab-id=\"lab\" badge-count=\"5\">Laboratory</vi-tab>\n            <vi-tab tab-id=\"meds\" disabled>Medications (Locked)</vi-tab>\n            <vi-tab tab-id=\"ae\">Adverse Events</vi-tab>\n            <vi-tab tab-id=\"cm\">Concomitant Meds</vi-tab>\n            <vi-tab tab-id=\"mh\">Medical History</vi-tab>\n            <vi-tab-panel for=\"demo\"\n              >${panelContent('Demographics')}</vi-tab-panel\n            >\n            <vi-tab-panel for=\"vitals\"\n              >${panelContent('Vital Signs')}</vi-tab-panel\n            >\n            <vi-tab-panel for=\"lab\"\n              >${panelContent('Laboratory', '5 pending results.')}</vi-tab-panel\n            >\n            <vi-tab-panel for=\"meds\"\n              >${panelContent('Medications (Locked)')}</vi-tab-panel\n            >\n            <vi-tab-panel for=\"ae\"\n              >${panelContent('Adverse Events')}</vi-tab-panel\n            >\n            <vi-tab-panel for=\"cm\"\n              >${panelContent('Concomitant Meds')}</vi-tab-panel\n            >\n            <vi-tab-panel for=\"mh\"\n              >${panelContent('Medical History')}</vi-tab-panel\n            >\n          </vi-tabs>\n        </div>\n      </div>\n\n      <div>\n        ${label('Pill + closable + anchor-closable')}\n        <vi-tabs active=\"overview\" variant=\"pill\" anchor-closable>\n          <vi-tab tab-id=\"overview\">Overview</vi-tab>\n          <vi-tab tab-id=\"visits\" closable>Visits</vi-tab>\n          <vi-tab tab-id=\"lab2\" closable badge-count=\"3\">Lab</vi-tab>\n          <vi-tab tab-id=\"ae2\" closable>Adverse Events</vi-tab>\n          <vi-tab-panel for=\"overview\"\n            >${panelContent('Overview', 'Pinned tab \u2014 always first.')}</vi-tab-panel\n          >\n          <vi-tab-panel for=\"visits\"\n            >${panelContent('Visits', 'Closable \u2014 anchored to end.')}</vi-tab-panel\n          >\n          <vi-tab-panel for=\"lab2\"\n            >${panelContent('Lab', '3 pending results.')}</vi-tab-panel\n          >\n          <vi-tab-panel for=\"ae2\"\n            >${panelContent('Adverse Events')}</vi-tab-panel\n          >\n        </vi-tabs>\n      </div>\n\n      <div>\n        ${label('Card + overflow menu (swap)')}\n        <div style=\"width: 100%;\">\n          <vi-tabs active=\"tab-1\" variant=\"card\" overflow=\"menu\">\n            <vi-tab tab-id=\"tab-1\">Demographics</vi-tab>\n            <vi-tab tab-id=\"tab-2\">Vital Signs</vi-tab>\n            <vi-tab tab-id=\"tab-3\">Laboratory</vi-tab>\n            <vi-tab tab-id=\"tab-4\">Medications</vi-tab>\n            <vi-tab tab-id=\"tab-5\">Adverse Events</vi-tab>\n            <vi-tab tab-id=\"tab-6\">Concomitant Meds</vi-tab>\n            <vi-tab-panel for=\"tab-1\"\n              >${panelContent('Demographics')}</vi-tab-panel\n            >\n            <vi-tab-panel for=\"tab-2\"\n              >${panelContent('Vital Signs')}</vi-tab-panel\n            >\n            <vi-tab-panel for=\"tab-3\"\n              >${panelContent('Laboratory')}</vi-tab-panel\n            >\n            <vi-tab-panel for=\"tab-4\"\n              >${panelContent('Medications')}</vi-tab-panel\n            >\n            <vi-tab-panel for=\"tab-5\"\n              >${panelContent('Adverse Events', 'Swap into view from More menu.')}</vi-tab-panel\n            >\n            <vi-tab-panel for=\"tab-6\"\n              >${panelContent('Concomitant Meds')}</vi-tab-panel\n            >\n          </vi-tabs>\n        </div>\n      </div>\n\n      <div>\n        ${label('Vertical sidebar \u2014 settings pattern')}\n        <div style=\"display: flex; height: 240px;\">\n          <vi-tabs\n            orientation=\"vertical\"\n            variant=\"line\"\n            active=\"general\"\n            style=\"width: 100%;\"\n          >\n            <vi-tab tab-id=\"general\">General</vi-tab>\n            <vi-tab tab-id=\"users\">Users</vi-tab>\n            <vi-tab tab-id=\"roles\">Roles</vi-tab>\n            <vi-tab tab-id=\"audit\" badge-count=\"12\">Audit Log</vi-tab>\n            <vi-tab-panel for=\"general\"\n              >${panelContent('General Settings')}</vi-tab-panel\n            >\n            <vi-tab-panel for=\"users\">${panelContent('Users')}</vi-tab-panel>\n            <vi-tab-panel for=\"roles\">${panelContent('Roles')}</vi-tab-panel>\n            <vi-tab-panel for=\"audit\"\n              >${panelContent('Audit Log', '12 entries since last review.')}</vi-tab-panel\n            >\n          </vi-tabs>\n        </div>\n      </div>\n    </div>\n  `\n}",
            ...KitchenSink.parameters?.docs?.source
        }
    }
};
ResponsiveOverflowMenu.parameters = {
    ...ResponsiveOverflowMenu.parameters,
    docs: {
        ...ResponsiveOverflowMenu.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Responsive Overflow Menu',\n  render: () => html`\n    <div style=\"padding: 24px; width: 100%; max-width: 100%;\">\n      ${note('Resize the browser window itself to see the overflow menu dynamically push tabs in and out.')}\n\n      <vi-tabs active=\"tab-1\" variant=\"line\" overflow=\"menu\">\n        <vi-tab tab-id=\"tab-1\">Demographics</vi-tab>\n        <vi-tab tab-id=\"tab-2\">Vital Signs</vi-tab>\n        <vi-tab tab-id=\"tab-3\">Laboratory</vi-tab>\n        <vi-tab tab-id=\"tab-4\">Medications</vi-tab>\n        <vi-tab tab-id=\"tab-5\">Adverse Events</vi-tab>\n        <vi-tab tab-id=\"tab-6\">Medical History</vi-tab>\n        <vi-tab tab-id=\"tab-7\">Concomitant Meds</vi-tab>\n\n        <vi-tab-panel for=\"tab-1\"\n          >${panelContent('Demographics', 'Resize the browser window to see the overflow menu update in real-time.')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"tab-2\">${panelContent('Vital Signs')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-3\">${panelContent('Laboratory')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-4\">${panelContent('Medications')}</vi-tab-panel>\n        <vi-tab-panel for=\"tab-5\"\n          >${panelContent('Adverse Events')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"tab-6\"\n          >${panelContent('Medical History')}</vi-tab-panel\n        >\n        <vi-tab-panel for=\"tab-7\"\n          >${panelContent('Concomitant Meds')}</vi-tab-panel\n        >\n      </vi-tabs>\n    </div>\n  `\n}",
            ...ResponsiveOverflowMenu.parameters?.docs?.source
        }
    }
};
AddableTabs.parameters = {
    ...AddableTabs.parameters,
    docs: {
        ...AddableTabs.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Dynamic Tabs (Addable)',\n  render: () => {\n    let count = 4;\n    let activeTabId = 'tab-1';\n    const buildUI = () => {\n      const el = document.createElement('div');\n      const tabsEl = document.createElement('vi-tabs') as HTMLElement;\n      tabsEl.setAttribute('active', activeTabId);\n      tabsEl.setAttribute('overflow', 'scroll');\n      tabsEl.setAttribute('addable', '');\n      tabsEl.setAttribute('anchor-closable', '');\n      const rerender = () => {\n        el.replaceChildren();\n        el.appendChild(buildUI());\n      };\n      tabsEl.addEventListener('vi-tabs-change', (e: CustomEvent<{\n        toTabId: string;\n      }>) => {\n        activeTabId = e.detail.toTabId;\n      });\n      tabsEl.addEventListener('vi-tabs-add', () => {\n        count++;\n        activeTabId = `tab-${count}`;\n        rerender();\n      });\n\n      // Render the tabs dynamically\n      for (let i = 1; i <= count; i++) {\n        const id = `tab-${i}`;\n        const tabEl = document.createElement('vi-tab') as HTMLElement;\n        tabEl.setAttribute('tab-id', id);\n        tabEl.setAttribute('closable', '');\n        tabEl.textContent = `Document ${i}`;\n        tabsEl.appendChild(tabEl);\n        const panelEl = document.createElement('vi-tab-panel') as HTMLElement;\n        panelEl.setAttribute('for', id);\n        render(html`<div style=\"padding: 20px 4px 8px;\">\n            <h3 style=\"margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #111827;\">Document ${i}</h3>\n            <p style=\"margin: 0; font-size: 13.5px; color: #6b7280;\">Content for dynamically added document ${i}.</p>\n          </div>`, panelEl);\n        tabsEl.appendChild(panelEl);\n      }\n      return tabsEl;\n    };\n    const container = document.createElement('div');\n    container.style.width = '100%';\n    container.appendChild(buildUI());\n    return html`\n      ${note('Click the + button to dynamically add new tabs to the DOM. The vi-tabs component automatically registers them.')}\n      ${container}\n    `;\n  }\n}",
            ...AddableTabs.parameters?.docs?.source
        }
    }
};
FocusDelegation.parameters = {
    ...FocusDelegation.parameters,
    docs: {
        ...FocusDelegation.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => {\n    return html`\n      ${label('Focus Delegation Test')}\n      ${note('Click the active tab (or Tab into it) and press Tab. Focus should immediately land on the first input field inside the panel.')}\n\n      <div\n        style=\"max-width: 600px; padding: 24px; background: #f9fafb; border-radius: 8px;\"\n      >\n        <vi-tabs active=\"profile\">\n          <vi-tab slot=\"tab\" tab-id=\"profile\">User Profile</vi-tab>\n          <vi-tab slot=\"tab\" tab-id=\"settings\">Settings</vi-tab>\n\n          <vi-tab-panel slot=\"panel\" for=\"profile\">\n            <div\n              style=\"padding: 24px; background: white; border-radius: 8px; margin-top: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);\"\n            >\n              <h3 style=\"margin-top: 0;\">Edit Profile</h3>\n              <form style=\"display: flex; flex-direction: column; gap: 16px;\">\n                <div style=\"display: flex; flex-direction: column; gap: 4px;\">\n                  <label for=\"fname\" style=\"font-size: 14px; font-weight: 500;\"\n                    >First Name</label\n                  >\n                  <input\n                    id=\"fname\"\n                    type=\"text\"\n                    placeholder=\"Jane\"\n                    style=\"padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;\"\n                  />\n                </div>\n                <div style=\"display: flex; flex-direction: column; gap: 4px;\">\n                  <label for=\"lname\" style=\"font-size: 14px; font-weight: 500;\"\n                    >Last Name</label\n                  >\n                  <input\n                    id=\"lname\"\n                    type=\"text\"\n                    placeholder=\"Doe\"\n                    style=\"padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;\"\n                  />\n                </div>\n                <div style=\"display: flex; gap: 8px; margin-top: 8px;\">\n                  <button\n                    type=\"submit\"\n                    style=\"padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;\"\n                  >\n                    Save Changes\n                  </button>\n                  <button\n                    type=\"button\"\n                    style=\"padding: 8px 16px; background: white; color: #374151; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer;\"\n                  >\n                    Cancel\n                  </button>\n                </div>\n              </form>\n            </div>\n          </vi-tab-panel>\n\n          <vi-tab-panel slot=\"panel\" for=\"settings\">\n            <div\n              style=\"padding: 24px; background: white; border-radius: 8px; margin-top: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);\"\n            >\n              <h3 style=\"margin-top: 0;\">Account Settings</h3>\n              <form style=\"display: flex; flex-direction: column; gap: 16px;\">\n                <div style=\"display: flex; align-items: center; gap: 8px;\">\n                  <input id=\"notif\" type=\"checkbox\" />\n                  <label for=\"notif\" style=\"font-size: 14px;\"\n                    >Enable Email Notifications</label\n                  >\n                </div>\n              </form>\n            </div>\n          </vi-tab-panel>\n        </vi-tabs>\n      </div>\n    `;\n  }\n}",
            ...FocusDelegation.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","AllVariants","WithDisabledTab","WithBadgeCounts","VerticalOrientation","ManualActivation","BeforeChangeGuard","OverflowScroll","OverflowMenu","OverflowWrap","ClosableTabs","ClosableAnchoredToEnd","BeforeCloseGuard","DestroyOnClose","LazyPanels","KitchenSink","ResponsiveOverflowMenu","AddableTabs","FocusDelegation"];

export { AddableTabs, AllVariants, BeforeChangeGuard, BeforeCloseGuard, ClosableAnchoredToEnd, ClosableTabs, Default, DestroyOnClose, FocusDelegation, KitchenSink, LazyPanels, ManualActivation, OverflowMenu, OverflowScroll, OverflowWrap, ResponsiveOverflowMenu, VerticalOrientation, WithBadgeCounts, WithDisabledTab, __namedExportsOrder, meta as default };
