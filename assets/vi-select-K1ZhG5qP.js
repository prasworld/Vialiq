import { r as r$1, i, b, c as i$1 } from './iframe-BWFd5gnq.js';
import { V as ViElement, t, n } from './vi-element-BiIvwBjw.js';
import { r } from './state-BbKxyFqT.js';
import { e } from './overlay-manager-B43cq-OI.js';
import { F as FocusableMixin } from './focusable-mixin-CmxOyPX5.js';
import { V as ValidityMixin } from './validity-mixin-APc_yZnc.js';
import { i as ifNonEmpty } from './if-non-empty-B8ECI6U0.js';
import './vi-icon-nPc8sIIY.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import { c as chevronDownIcon } from './chevron-down-BU8Kh4z3.js';
import { x as xIcon } from './x-3JmBhc9n.js';
import { F as FloatingController, L as ListboxKeyboardController } from './keyboard-controller-DbV1C_E6.js';
import { c as checkIcon } from './check-D9SDO18H.js';

const selectStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.select-field{display:flex;flex-direction:column;gap:var(--vi-select-spacing-field-gap, var(--vi-spacing-xs, .5rem));width:var(--vi-select-width, 100%);position:relative}.select-wrapper{position:relative;display:flex;flex-direction:column;width:100%}.select-trigger{display:flex;align-items:center;justify-content:space-between;box-sizing:border-box;width:100%;min-height:var(--vi-select-sizing-min-height, var(--vi-spacing-xl, 2rem));padding:var(--vi-select-spacing-padding-block, var(--vi-spacing-unit, .25rem)) var(--vi-select-spacing-padding-inline, .6875rem);background-color:var(--vi-select-background-color, var(--vi-color-background, #ffffff));border:var(--vi-select-border-width, var(--vi-border-width-thin, 1px)) solid var(--vi-select-border-color, var(--vi-border-03, #e0e0e0));border-radius:var(--vi-select-shape-border-radius, .375rem);font-family:inherit;font-size:var(--vi-font-size-base, .875rem);color:var(--vi-select-text-color, var(--vi-color-foreground, #111827));transition:border-color .15s ease,box-shadow .15s ease;cursor:pointer;text-align:left;white-space:nowrap}.select-trigger:hover:not(.is-disabled){border-color:var(--vi-select-border-color-hover, var(--vi-border-04, #bdbdbd))}.select-trigger.is-placeholder{color:var(--vi-select-placeholder-color, var(--vi-text-secondary, #4b5563))}.select-trigger.is-disabled{background-color:var(--vi-layer-disabled, var(--vi-layer-disabled, #f3f4f6))}.select-trigger:focus-visible{border-color:var(--vi-select-focus-ring-color, var(--vi-focus, #3676d0));outline:var(--vi-border-width-base, 2px) solid var(--vi-select-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:-1px;box-shadow:0 0 0 3px var(--vi-select-focus-ring-glow, var(--vi-color-blue-200, #cee6ff))}.select-label-container{display:grid;flex:1 1 0%;min-width:0;align-items:center}.select-label{grid-area:1/1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.select-label.is-wrapped{white-space:normal;overflow:visible;text-overflow:clip;word-break:break-word}.select-measurer{grid-area:1/1;visibility:hidden;height:0;overflow:hidden;pointer-events:none;-webkit-user-select:none;user-select:none}.select-measurer>span{display:block;white-space:nowrap}.select-icons{display:flex;align-items:center;gap:var(--vi-spacing-xs, .5rem);flex-shrink:0;z-index:2;position:relative;color:var(--vi-select-arrow-color, var(--vi-text-secondary, #4b5563))}.select-chevron{width:18px;height:18px;pointer-events:none}.select-clear-btn{appearance:none;-webkit-appearance:none;background:transparent;border:none;padding:2px;margin:0;display:inline-flex;align-items:center;justify-content:center;color:var(--vi-select-arrow-color, var(--vi-text-secondary, #4b5563));cursor:pointer;border-radius:var(--vi-border-radius-sm, 4px);transition:color .15s ease,background-color .15s ease;width:20px;height:20px;flex-shrink:0}.select-clear-btn:hover{color:var(--vi-text-primary, #111827);background-color:var(--vi-layer-hover-01, #f3f4f6)}.select-clear-btn[hidden]{display:none}.select-listbox{margin:0;padding:var(--vi-select-listbox-padding, var(--vi-spacing-xs, .5rem) 0);list-style:none;background-color:var(--vi-select-listbox-background, var(--vi-layer-01, #ffffff));border:var(--vi-border-width-base, 1px) solid var(--vi-select-listbox-border-color, var(--vi-border-02, #eeeeee));border-radius:var(--vi-select-shape-border-radius, var(--vi-border-radius-lg, 8px));box-shadow:var(--vi-select-listbox-shadow, var(--vi-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, .1)));max-height:var(--vi-select-listbox-max-height, 300px);overflow-y:auto;z-index:1000;box-sizing:border-box;width:100%}.select-listbox:focus{outline:none}.select-listbox[hidden]{display:none!important}.select-option{display:flex;align-items:center;gap:var(--vi-spacing-sm, .75rem);padding:var(--vi-select-option-padding-block, 10px) var(--vi-select-option-padding-inline, var(--vi-spacing-md, 1rem));cursor:pointer;font-family:inherit;font-size:var(--vi-font-size-base, var(--vi-font-size-base, .875rem));color:var(--vi-select-option-text-color, var(--vi-text-primary, #111827));background-color:transparent;transition:background-color .15s ease,color .15s ease;width:100%;box-sizing:border-box}.select-option:hover:not(.is-disabled){background-color:var(--vi-select-option-hover-bg, var(--vi-layer-hover-01, #f3f4f6))}.select-option.is-active:not(.is-disabled){background-color:var(--vi-select-option-active-bg, var(--vi-layer-02, #f3f4f6))}.select-option.is-selected{font-weight:var(--vi-font-weight-medium, 500);background-color:var(--vi-select-option-selected-bg, var(--vi-layer-02, #f3f4f6))}.select-option.is-disabled{color:var(--vi-select-option-disabled-color, var(--vi-text-disabled, #9e9e9e));cursor:not-allowed;opacity:.6}.select-option-icon{flex-shrink:0;color:var(--vi-select-option-icon-color, var(--vi-text-secondary, #4b5563));width:18px;height:18px}.select-option-check{flex-shrink:0;color:var(--vi-select-option-check-color, var(--vi-color-primary, #3676d0));width:16px;height:16px;margin-left:auto}.select-option-content{display:flex;flex-direction:column;flex-grow:1;overflow:hidden}.select-option-label{flex:1 1 0%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block}.select-option-label.is-wrapped{white-space:normal;overflow:visible;text-overflow:clip;word-break:break-word}.select-option-description{font-size:var(--vi-font-size-sm, var(--vi-font-size-xs, .75rem));color:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block}.select-native{position:absolute;inset:0;width:100%;height:100%;opacity:0;appearance:none;-webkit-appearance:none;cursor:pointer;z-index:1}.select-native:disabled{cursor:not-allowed}.select-native:focus-visible+.select-trigger{border-color:var(--vi-select-focus-ring-color, var(--vi-focus, #3676d0));outline:var(--vi-border-width-base, 2px) solid var(--vi-select-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:-1px;box-shadow:0 0 0 3px var(--vi-select-focus-ring-glow, var(--vi-color-blue-200, #cee6ff))}.select-wrapper.is-invalid .select-trigger{border-color:var(--vi-color-error, var(--vi-color-error, #ef4444))}.select-wrapper.is-invalid .select-trigger .select-native:focus-visible+.select-trigger{outline-color:var(--vi-color-error, var(--vi-color-error, #ef4444));box-shadow:none}.select-wrapper.is-valid .select-trigger{border-color:var(--vi-color-success, var(--vi-color-success, #489167))}.select-helper{font-size:var(--vi-font-size-sm, var(--vi-font-size-xs, .75rem));color:var(--vi-text-helper, var(--vi-text-helper, #9e9e9e))}.select-validation{font-size:var(--vi-font-size-sm, var(--vi-font-size-xs, .75rem));color:var(--vi-color-error, var(--vi-color-error, #ef4444))}.select-validation.is-valid{color:var(--vi-color-success, var(--vi-color-success, #489167))}.select-validation[hidden]{display:none}}:host{display:block}:host([hidden]){display:none!important}:host([disabled]){pointer-events:none}:host([disabled]) .select-wrapper{opacity:var(--vi-select-disabled-opacity, .6)}";

const optionStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.select-field{display:flex;flex-direction:column;gap:var(--vi-select-spacing-field-gap, var(--vi-spacing-xs, .5rem));width:var(--vi-select-width, 100%);position:relative}.select-wrapper{position:relative;display:flex;flex-direction:column;width:100%}.select-trigger{display:flex;align-items:center;justify-content:space-between;box-sizing:border-box;width:100%;min-height:var(--vi-select-sizing-min-height, var(--vi-spacing-xl, 2rem));padding:var(--vi-select-spacing-padding-block, var(--vi-spacing-unit, .25rem)) var(--vi-select-spacing-padding-inline, .6875rem);background-color:var(--vi-select-background-color, var(--vi-color-background, #ffffff));border:var(--vi-select-border-width, var(--vi-border-width-thin, 1px)) solid var(--vi-select-border-color, var(--vi-border-03, #e0e0e0));border-radius:var(--vi-select-shape-border-radius, .375rem);font-family:inherit;font-size:var(--vi-font-size-base, .875rem);color:var(--vi-select-text-color, var(--vi-color-foreground, #111827));transition:border-color .15s ease,box-shadow .15s ease;cursor:pointer;text-align:left;white-space:nowrap}.select-trigger:hover:not(.is-disabled){border-color:var(--vi-select-border-color-hover, var(--vi-border-04, #bdbdbd))}.select-trigger.is-placeholder{color:var(--vi-select-placeholder-color, var(--vi-text-secondary, #4b5563))}.select-trigger.is-disabled{background-color:var(--vi-layer-disabled, var(--vi-layer-disabled, #f3f4f6))}.select-trigger:focus-visible{border-color:var(--vi-select-focus-ring-color, var(--vi-focus, #3676d0));outline:var(--vi-border-width-base, 2px) solid var(--vi-select-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:-1px;box-shadow:0 0 0 3px var(--vi-select-focus-ring-glow, var(--vi-color-blue-200, #cee6ff))}.select-label-container{display:grid;flex:1 1 0%;min-width:0;align-items:center}.select-label{grid-area:1/1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.select-label.is-wrapped{white-space:normal;overflow:visible;text-overflow:clip;word-break:break-word}.select-measurer{grid-area:1/1;visibility:hidden;height:0;overflow:hidden;pointer-events:none;-webkit-user-select:none;user-select:none}.select-measurer>span{display:block;white-space:nowrap}.select-icons{display:flex;align-items:center;gap:var(--vi-spacing-xs, .5rem);flex-shrink:0;z-index:2;position:relative;color:var(--vi-select-arrow-color, var(--vi-text-secondary, #4b5563))}.select-chevron{width:18px;height:18px;pointer-events:none}.select-clear-btn{appearance:none;-webkit-appearance:none;background:transparent;border:none;padding:2px;margin:0;display:inline-flex;align-items:center;justify-content:center;color:var(--vi-select-arrow-color, var(--vi-text-secondary, #4b5563));cursor:pointer;border-radius:var(--vi-border-radius-sm, 4px);transition:color .15s ease,background-color .15s ease;width:20px;height:20px;flex-shrink:0}.select-clear-btn:hover{color:var(--vi-text-primary, #111827);background-color:var(--vi-layer-hover-01, #f3f4f6)}.select-clear-btn[hidden]{display:none}.select-listbox{margin:0;padding:var(--vi-select-listbox-padding, var(--vi-spacing-xs, .5rem) 0);list-style:none;background-color:var(--vi-select-listbox-background, var(--vi-layer-01, #ffffff));border:var(--vi-border-width-base, 1px) solid var(--vi-select-listbox-border-color, var(--vi-border-02, #eeeeee));border-radius:var(--vi-select-shape-border-radius, var(--vi-border-radius-lg, 8px));box-shadow:var(--vi-select-listbox-shadow, var(--vi-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, .1)));max-height:var(--vi-select-listbox-max-height, 300px);overflow-y:auto;z-index:1000;box-sizing:border-box;width:100%}.select-listbox:focus{outline:none}.select-listbox[hidden]{display:none!important}.select-option{display:flex;align-items:center;gap:var(--vi-spacing-sm, .75rem);padding:var(--vi-select-option-padding-block, 10px) var(--vi-select-option-padding-inline, var(--vi-spacing-md, 1rem));cursor:pointer;font-family:inherit;font-size:var(--vi-font-size-base, var(--vi-font-size-base, .875rem));color:var(--vi-select-option-text-color, var(--vi-text-primary, #111827));background-color:transparent;transition:background-color .15s ease,color .15s ease;width:100%;box-sizing:border-box}.select-option:hover:not(.is-disabled){background-color:var(--vi-select-option-hover-bg, var(--vi-layer-hover-01, #f3f4f6))}.select-option.is-active:not(.is-disabled){background-color:var(--vi-select-option-active-bg, var(--vi-layer-02, #f3f4f6))}.select-option.is-selected{font-weight:var(--vi-font-weight-medium, 500);background-color:var(--vi-select-option-selected-bg, var(--vi-layer-02, #f3f4f6))}.select-option.is-disabled{color:var(--vi-select-option-disabled-color, var(--vi-text-disabled, #9e9e9e));cursor:not-allowed;opacity:.6}.select-option-icon{flex-shrink:0;color:var(--vi-select-option-icon-color, var(--vi-text-secondary, #4b5563));width:18px;height:18px}.select-option-check{flex-shrink:0;color:var(--vi-select-option-check-color, var(--vi-color-primary, #3676d0));width:16px;height:16px;margin-left:auto}.select-option-content{display:flex;flex-direction:column;flex-grow:1;overflow:hidden}.select-option-label{flex:1 1 0%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block}.select-option-label.is-wrapped{white-space:normal;overflow:visible;text-overflow:clip;word-break:break-word}.select-option-description{font-size:var(--vi-font-size-sm, var(--vi-font-size-xs, .75rem));color:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block}.select-native{position:absolute;inset:0;width:100%;height:100%;opacity:0;appearance:none;-webkit-appearance:none;cursor:pointer;z-index:1}.select-native:disabled{cursor:not-allowed}.select-native:focus-visible+.select-trigger{border-color:var(--vi-select-focus-ring-color, var(--vi-focus, #3676d0));outline:var(--vi-border-width-base, 2px) solid var(--vi-select-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:-1px;box-shadow:0 0 0 3px var(--vi-select-focus-ring-glow, var(--vi-color-blue-200, #cee6ff))}.select-wrapper.is-invalid .select-trigger{border-color:var(--vi-color-error, var(--vi-color-error, #ef4444))}.select-wrapper.is-invalid .select-trigger .select-native:focus-visible+.select-trigger{outline-color:var(--vi-color-error, var(--vi-color-error, #ef4444));box-shadow:none}.select-wrapper.is-valid .select-trigger{border-color:var(--vi-color-success, var(--vi-color-success, #489167))}.select-helper{font-size:var(--vi-font-size-sm, var(--vi-font-size-xs, .75rem));color:var(--vi-text-helper, var(--vi-text-helper, #9e9e9e))}.select-validation{font-size:var(--vi-font-size-sm, var(--vi-font-size-xs, .75rem));color:var(--vi-color-error, var(--vi-color-error, #ef4444))}.select-validation.is-valid{color:var(--vi-color-success, var(--vi-color-success, #489167))}.select-validation[hidden]{display:none}}:host{display:block}:host([hidden]){display:none!important}mark{background-color:transparent;color:inherit}mark.highlight{background-color:var(--vi-typeahead-highlight-bg, #ebf5ff);color:var(--vi-typeahead-highlight-color, #3676d0);font-weight:600;border-radius:.125rem;padding:0 1px}";

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
function _identity$1(x) {
    return x;
}
var _dec$2, _initClass$2, _ViElement, _dec1$2, _dec2$1, _dec3$1, _dec4$1, _dec5$1, _dec6$1, _dec7$1, _dec8$1, _dec9$1, _dec10$1, _dec11$1, _dec12$1, _dec13$1, _init_value$1, _init_label$1, _init_data, _init_group, _init_disabled$1, _init_icon, _init_description, _init_searchText, _init_selected, _init_active, _init_wrapText$1, _init_highlightText, _init__hasSlotContent, _initProto$2;
registerIcons([
    checkIcon
]);
let _ViSelectOption;
_dec$2 = t('vi-select-option'), _dec1$2 = n({
    type: String,
    reflect: true
}), _dec2$1 = n({
    type: String,
    reflect: true
}), _dec3$1 = n({
    attribute: false
}), _dec4$1 = n({
    type: String,
    reflect: true
}), _dec5$1 = n({
    type: Boolean,
    reflect: true
}), _dec6$1 = n({
    type: String,
    reflect: true
}), _dec7$1 = n({
    type: String,
    reflect: true
}), _dec8$1 = n({
    attribute: 'search-text',
    reflect: false,
    converter: {
        fromAttribute: (v)=>v ? v.split(/\s+/).filter(Boolean) : []
    }
}), _dec9$1 = n({
    type: Boolean,
    reflect: true
}), _dec10$1 = n({
    type: Boolean,
    reflect: true
}), _dec11$1 = n({
    type: Boolean,
    attribute: 'wrap-text'
}), _dec12$1 = n({
    type: String,
    attribute: 'highlight-text'
}), _dec13$1 = r();
new class extends _identity$1 {
    constructor(){
        super(_ViSelectOption), _initClass$2();
    }
    static{
        class ViSelectOption extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_value$1, _init_label$1, _init_data, _init_group, _init_disabled$1, _init_icon, _init_description, _init_searchText, _init_selected, _init_active, _init_wrapText$1, _init_highlightText, _init__hasSlotContent, _initProto$2], c: [_ViSelectOption, _initClass$2] } = _apply_decs_2203_r$2(this, [
                    [
                        _dec1$2,
                        1,
                        "value"
                    ],
                    [
                        _dec2$1,
                        1,
                        "label"
                    ],
                    [
                        _dec3$1,
                        1,
                        "data"
                    ],
                    [
                        _dec4$1,
                        1,
                        "group"
                    ],
                    [
                        _dec5$1,
                        1,
                        "disabled"
                    ],
                    [
                        _dec6$1,
                        1,
                        "icon"
                    ],
                    [
                        _dec7$1,
                        1,
                        "description"
                    ],
                    [
                        _dec8$1,
                        1,
                        "searchText"
                    ],
                    [
                        _dec9$1,
                        1,
                        "selected"
                    ],
                    [
                        _dec10$1,
                        1,
                        "active"
                    ],
                    [
                        _dec11$1,
                        1,
                        "wrapText"
                    ],
                    [
                        _dec12$1,
                        1,
                        "highlightText"
                    ],
                    [
                        _dec13$1,
                        1,
                        "_hasSlotContent"
                    ]
                ], [
                    _dec$2
                ], _ViElement));
            }
            static styles = i`
    ${r$1(optionStyles)}
  `;
            #___private_value_1 = (_initProto$2(this), _init_value$1(this, ''));
            get value() {
                return this.#___private_value_1;
            }
            set value(_v) {
                this.#___private_value_1 = _v;
            }
            #___private_label_2 = _init_label$1(this, '');
            get label() {
                return this.#___private_label_2;
            }
            set label(_v) {
                this.#___private_label_2 = _v;
            }
            #___private_data_3 = _init_data(this, undefined);
            get data() {
                return this.#___private_data_3;
            }
            set data(_v) {
                this.#___private_data_3 = _v;
            }
            #___private_group_4 = _init_group(this, '');
            get group() {
                return this.#___private_group_4;
            }
            set group(_v) {
                this.#___private_group_4 = _v;
            }
            #___private_disabled_5 = _init_disabled$1(this, false);
            get disabled() {
                return this.#___private_disabled_5;
            }
            set disabled(_v) {
                this.#___private_disabled_5 = _v;
            }
            #___private_icon_6 = _init_icon(this, '');
            get icon() {
                return this.#___private_icon_6;
            }
            set icon(_v) {
                this.#___private_icon_6 = _v;
            }
            #___private_description_7 = _init_description(this, '');
            get description() {
                return this.#___private_description_7;
            }
            set description(_v) {
                this.#___private_description_7 = _v;
            }
            #___private_searchText_8 = _init_searchText(this, []);
            get searchText() {
                return this.#___private_searchText_8;
            }
            set searchText(_v) {
                this.#___private_searchText_8 = _v;
            }
            #___private_selected_9 = _init_selected(this, false);
            get selected() {
                return this.#___private_selected_9;
            }
            set selected(_v) {
                this.#___private_selected_9 = _v;
            }
            #___private_active_10 = _init_active(this, false);
            get active() {
                return this.#___private_active_10;
            }
            set active(_v) {
                this.#___private_active_10 = _v;
            }
            #___private_wrapText_11 = _init_wrapText$1(this, false);
            get wrapText() {
                return this.#___private_wrapText_11;
            }
            set wrapText(_v) {
                this.#___private_wrapText_11 = _v;
            }
            #___private_highlightText_12 = _init_highlightText(this, '');
            get highlightText() {
                return this.#___private_highlightText_12;
            }
            set highlightText(_v) {
                this.#___private_highlightText_12 = _v;
            }
            #___private__hasSlotContent_13 = _init__hasSlotContent(this, false);
            get _hasSlotContent() {
                return this.#___private__hasSlotContent_13;
            }
            set _hasSlotContent(_v) {
                this.#___private__hasSlotContent_13 = _v;
            }
            connectedCallback() {
                super.connectedCallback();
                this.addEventListener('click', this._handleClick);
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this.removeEventListener('click', this._handleClick);
            }
            firstUpdated(changedProperties) {
                super.firstUpdated(changedProperties);
                this.setAttribute('role', 'option');
                this.setAttribute('aria-selected', this.selected ? 'true' : 'false');
                this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
            }
            updated(changedProperties) {
                super.updated(changedProperties);
                if (changedProperties.has('selected') || changedProperties.has('disabled')) {
                    this.setAttribute('aria-selected', this.selected ? 'true' : 'false');
                    this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
                }
            }
            _handleClick = (e)=>{
                if (this.disabled) {
                    e.stopPropagation();
                    return;
                }
                this.dispatchEvent(new CustomEvent('vi-select-item-select', {
                    detail: {
                        item: this
                    },
                    bubbles: true,
                    composed: true
                }));
            };
            _handleSlotChange(e) {
                const slot = e.target;
                const nodes = slot.assignedNodes({
                    flatten: true
                }).filter((n)=>n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
                const hasContent = nodes.length > 0;
                if (this._hasSlotContent !== hasContent) {
                    this._hasSlotContent = hasContent;
                }
            }
            _renderHighlightedLabel() {
                if (!this.highlightText || !this.label) {
                    return this.label;
                }
                const regex = new RegExp(`(${this.highlightText})`, 'gi');
                const parts = this.label.split(regex);
                return b`${parts.map((part)=>part.toLowerCase() === this.highlightText.toLowerCase() ? b`<mark class="highlight">${part}</mark>` : part)}`;
            }
            render() {
                return b`
      <li
        part="item"
        role="presentation"
        class="select-option ${this.selected ? 'is-selected' : ''} ${this.active ? 'is-active' : ''} ${this.disabled ? 'is-disabled' : ''}"
        title=${this.label}
      >
        ${this.icon ? b`<vi-icon part="icon" name="${this.icon}" class="select-option-icon"></vi-icon>` : ''}

        <div part="content" class="select-option-content">
          <slot @slotchange=${this._handleSlotChange}></slot>
          ${!this._hasSlotContent ? b`
                <span part="label" class="select-option-label ${this.wrapText ? 'is-wrapped' : ''}">${this._renderHighlightedLabel()}</span>
                ${this.description ? b`<span part="description" class="select-option-description">${this.description}</span>` : ''}
              ` : ''}
        </div>

        ${this.selected ? b`<vi-icon part="check" name="check" class="select-option-check"></vi-icon>` : ''}
      </li>
    `;
            }
        }
    }
}();

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
var _dec$1, _initClass$1, _LitElement, _dec1$1, /** The label text for the group header. */ _init_label, _initProto$1;
let _ViSelectGroup;
_dec$1 = t('vi-select-group'), _dec1$1 = n({
    type: String
});
class ViSelectGroup extends (_LitElement = i$1) {
    static{
        ({ e: [_init_label, _initProto$1], c: [_ViSelectGroup, _initClass$1] } = _apply_decs_2203_r$1(this, [
            [
                _dec1$1,
                1,
                "label"
            ]
        ], [
            _dec$1
        ], _LitElement));
    }
    #___private_label_1 = (_initProto$1(this), _init_label(this, ''));
    get label() {
        return this.#___private_label_1;
    }
    set label(_v) {
        this.#___private_label_1 = _v;
    }
    render() {
        return b`
      <style>
        :host {
          display: block;
        }
        .select-group-header {
          padding: 8px 16px;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--vi-color-text-secondary, #6b7280);
          font-weight: 600;
          letter-spacing: 0.05em;
        }
      </style>
      <div class="select-group">
        ${this.label ? b`<div class="select-group-header" part="header">
              ${this.label}
            </div>` : ''}
        <slot></slot>
      </div>
    `;
    }
    static{
        _initClass$1();
    }
}

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
var _dec, _initClass, _ValidityMixin, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _init_matchWidth, _init_value, _init_name, _init_placeholder, _init_disabled, _init_clearable, _init_ariaLabel, _init_wrapText, _init_open, _init_placement, _init_hoist, _init_flipBoundary, _init_flipBoundaryElement, _init__selectedLabel, _init__activeIndex, _init__slottedItems, _init__triggerEl, _init__listboxEl, _init__typeAheadString, _initProto;
// Register internally used icons so consumers do not need to do this explicitly.
registerIcons([
    chevronDownIcon,
    xIcon
]);
let _ViSelect;
_dec = t('vi-select'), _dec1 = n({
    attribute: 'match-width',
    converter: {
        fromAttribute: (v)=>v !== null && v !== 'false'
    }
}), _dec2 = n({
    type: String,
    reflect: true
}), _dec3 = n(), _dec4 = n(), _dec5 = n({
    type: Boolean,
    reflect: true
}), _dec6 = n({
    type: Boolean
}), _dec7 = n({
    attribute: 'aria-label'
}), _dec8 = n({
    type: Boolean,
    attribute: 'wrap-text'
}), _dec9 = n({
    type: Boolean,
    reflect: true
}), _dec10 = n({
    type: String
}), _dec11 = n({
    type: Boolean
}), _dec12 = n({
    type: String,
    attribute: 'flip-boundary'
}), _dec13 = n({
    attribute: false
}), _dec14 = r(), _dec15 = r(), _dec16 = r(), _dec17 = e('.select-trigger'), _dec18 = e('.select-listbox'), _dec19 = r();
new class extends _identity {
    constructor(){
        super(_ViSelect), _initClass();
    }
    static{
        class ViSelect extends (_ValidityMixin = ValidityMixin(FocusableMixin(ViElement))) {
            static{
                ({ e: [_init_matchWidth, _init_value, _init_name, _init_placeholder, _init_disabled, _init_clearable, _init_ariaLabel, _init_wrapText, _init_open, _init_placement, _init_hoist, _init_flipBoundary, _init_flipBoundaryElement, _init__selectedLabel, _init__activeIndex, _init__slottedItems, _init__triggerEl, _init__listboxEl, _init__typeAheadString, _initProto], c: [_ViSelect, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "matchWidth"
                    ],
                    [
                        _dec2,
                        1,
                        "value"
                    ],
                    [
                        _dec3,
                        1,
                        "name"
                    ],
                    [
                        _dec4,
                        1,
                        "placeholder"
                    ],
                    [
                        _dec5,
                        1,
                        "disabled"
                    ],
                    [
                        _dec6,
                        1,
                        "clearable"
                    ],
                    [
                        _dec7,
                        1,
                        "ariaLabel"
                    ],
                    [
                        _dec8,
                        1,
                        "wrapText"
                    ],
                    [
                        _dec9,
                        1,
                        "open"
                    ],
                    [
                        _dec10,
                        1,
                        "placement"
                    ],
                    [
                        _dec11,
                        1,
                        "hoist"
                    ],
                    [
                        _dec12,
                        1,
                        "flipBoundary"
                    ],
                    [
                        _dec13,
                        1,
                        "flipBoundaryElement"
                    ],
                    [
                        _dec14,
                        1,
                        "_selectedLabel"
                    ],
                    [
                        _dec15,
                        1,
                        "_activeIndex"
                    ],
                    [
                        _dec16,
                        1,
                        "_slottedItems"
                    ],
                    [
                        _dec17,
                        1,
                        "_triggerEl"
                    ],
                    [
                        _dec18,
                        1,
                        "_listboxEl"
                    ],
                    [
                        _dec19,
                        1,
                        "_typeAheadString"
                    ]
                ], [
                    _dec
                ], _ValidityMixin));
            }
            static styles = i`
    ${r$1(selectStyles)}
  `;
            #___private_matchWidth_1 = (_initProto(this), _init_matchWidth(this, true));
            get matchWidth() {
                return this.#___private_matchWidth_1;
            }
            set matchWidth(_v) {
                this.#___private_matchWidth_1 = _v;
            }
            #___private_value_2 = _init_value(this, '');
            get value() {
                return this.#___private_value_2;
            }
            set value(_v) {
                this.#___private_value_2 = _v;
            }
            #___private_name_3 = _init_name(this, '');
            get name() {
                return this.#___private_name_3;
            }
            set name(_v) {
                this.#___private_name_3 = _v;
            }
            #___private_placeholder_4 = _init_placeholder(this, 'Select...');
            get placeholder() {
                return this.#___private_placeholder_4;
            }
            set placeholder(_v) {
                this.#___private_placeholder_4 = _v;
            }
            #___private_disabled_5 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_5;
            }
            set disabled(_v) {
                this.#___private_disabled_5 = _v;
            }
            #___private_clearable_6 = _init_clearable(this, false);
            get clearable() {
                return this.#___private_clearable_6;
            }
            set clearable(_v) {
                this.#___private_clearable_6 = _v;
            }
            #___private_ariaLabel_7 = _init_ariaLabel(this, '');
            get ariaLabel() {
                return this.#___private_ariaLabel_7;
            }
            set ariaLabel(_v) {
                this.#___private_ariaLabel_7 = _v;
            }
            #___private_wrapText_8 = _init_wrapText(this, false);
            get wrapText() {
                return this.#___private_wrapText_8;
            }
            set wrapText(_v) {
                this.#___private_wrapText_8 = _v;
            }
            #___private_open_9 = _init_open(this, false);
            get open() {
                return this.#___private_open_9;
            }
            set open(_v) {
                this.#___private_open_9 = _v;
            }
            #___private_placement_10 = _init_placement(this, 'bottom-start');
            get placement() {
                return this.#___private_placement_10;
            }
            set placement(_v) {
                this.#___private_placement_10 = _v;
            }
            #___private_hoist_11 = _init_hoist(this, true);
            get hoist() {
                return this.#___private_hoist_11;
            }
            set hoist(_v) {
                this.#___private_hoist_11 = _v;
            }
            #___private_flipBoundary_12 = _init_flipBoundary(this, '');
            get flipBoundary() {
                return this.#___private_flipBoundary_12;
            }
            set flipBoundary(_v) {
                this.#___private_flipBoundary_12 = _v;
            }
            #___private_flipBoundaryElement_13 = _init_flipBoundaryElement(this, null);
            get flipBoundaryElement() {
                return this.#___private_flipBoundaryElement_13;
            }
            set flipBoundaryElement(_v) {
                this.#___private_flipBoundaryElement_13 = _v;
            }
            // ── Internal State ─────────────────────────────────────────────────────────
            _listboxId = `listbox-${Math.random().toString(36).substring(2, 11)}`;
            _optionIdMap = new Map();
            _getOptionId(value) {
                if (!this._optionIdMap.has(value)) {
                    this._optionIdMap.set(value, `opt-${Math.random().toString(36).substring(2, 11)}`);
                }
                return this._optionIdMap.get(value) ?? '';
            }
            #___private__selectedLabel_14 = _init__selectedLabel(this, '');
            get _selectedLabel() {
                return this.#___private__selectedLabel_14;
            }
            set _selectedLabel(_v) {
                this.#___private__selectedLabel_14 = _v;
            }
            #___private__activeIndex_15 = _init__activeIndex(this, -1);
            get _activeIndex() {
                return this.#___private__activeIndex_15;
            }
            set _activeIndex(_v) {
                this.#___private__activeIndex_15 = _v;
            }
            #___private__slottedItems_16 = _init__slottedItems(this, []);
            get _slottedItems() {
                return this.#___private__slottedItems_16;
            }
            set _slottedItems(_v) {
                this.#___private__slottedItems_16 = _v;
            }
            #___private__triggerEl_17 = _init__triggerEl(this);
            get _triggerEl() {
                return this.#___private__triggerEl_17;
            }
            set _triggerEl(_v) {
                this.#___private__triggerEl_17 = _v;
            }
            #___private__listboxEl_18 = _init__listboxEl(this);
            get _listboxEl() {
                return this.#___private__listboxEl_18;
            }
            set _listboxEl(_v) {
                this.#___private__listboxEl_18 = _v;
            }
            _slotMutationObserver = null;
            #___private__typeAheadString_19 = _init__typeAheadString(this, '');
            get _typeAheadString() {
                return this.#___private__typeAheadString_19;
            }
            set _typeAheadString(_v) {
                this.#___private__typeAheadString_19 = _v;
            }
            get _focusableElement() {
                return this._triggerEl;
            }
            // ── Controllers ────────────────────────────────────────────────────────────
            _floatingController = new FloatingController(this, {
                reference: ()=>this._triggerEl,
                floating: ()=>this._listboxEl,
                placement: ()=>this.placement,
                offset: 4,
                hoist: ()=>this.hoist,
                boundary: ()=>this.flipBoundaryElement || this.flipBoundary || null,
                matchWidth: ()=>this.matchWidth
            });
            _keyboardController = new ListboxKeyboardController(this, {
                getActiveIndex: ()=>this._activeIndex,
                setActiveIndex: (index)=>{
                    this._activeIndex = index;
                },
                getFilteredOptions: ()=>[],
                getSlottedItems: ()=>this._slottedItems,
                getVisibleSlottedItems: ()=>this._slottedItems.filter((i)=>!i.hidden),
                getSelectedValues: ()=>this.value ? [
                        this.value
                    ] : [],
                updateSlottedActiveState: (index)=>this._updateSlottedActiveState(index),
                scrollToActiveIndex: ()=>this._scrollToActiveIndex(),
                selectOption: (opt)=>this._selectOption(opt),
                handleCreate: ()=>{
                /* no-op */ },
                removeTag: ()=>{
                /* no-op */ },
                close: ()=>{
                    this.open = false;
                },
                openDropdown: ()=>{
                    this.open = true;
                },
                getQuery: ()=>'',
                onTypeAheadChange: (str)=>{
                    this._typeAheadString = str;
                    this._syncHighlightToOptions();
                }
            });
            _syncHighlightToOptions() {
                this._slottedItems.forEach((item)=>{
                    item.highlightText = this._typeAheadString;
                });
            }
            // Provide properties required by ListboxKeyboardControllerHost
            get isSearchable() {
                return false;
            }
            get mode() {
                return 'single';
            }
            // ── ValidityMixin hook ─────────────────────────────────────────────────────
            _testValidity() {
                if (this._internals.validity.customError) {
                    return {
                        customError: true
                    };
                }
                if (this.required && !this.value) {
                    const temp = document.createElement('select');
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
                this.addEventListener('keydown', this._handleKeyDown);
                this.addEventListener('vi-select-item-select', this._handleSlottedItemSelect);
                document.addEventListener('click', this._handleOutsideClick);
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this.removeEventListener('keydown', this._handleKeyDown);
                this.removeEventListener('vi-select-item-select', this._handleSlottedItemSelect);
                document.removeEventListener('click', this._handleOutsideClick);
                if (this._slotMutationObserver) this._slotMutationObserver.disconnect();
                this._floatingController.stop();
            }
            _defaultValue = '';
            firstUpdated(changedProperties) {
                super.firstUpdated(changedProperties);
                this._defaultValue = this.getAttribute('value') ?? '';
                this._observeSlottedItems();
            }
            formResetCallback() {
                this.value = this._defaultValue;
                super.formResetCallback();
            }
            updated(changedProperties) {
                super.updated(changedProperties);
                if (changedProperties.has('wrapText')) {
                    for (const item of this._slottedItems){
                        if ('wrapText' in item) {
                            item.wrapText = this.wrapText;
                        }
                    }
                }
                if (changedProperties.has('value')) {
                    this._internals.setFormValue(this.value || null);
                    this._syncSlottedSelectedState();
                    this._syncSelectedLabel();
                }
                if (changedProperties.has('disabled')) {
                    this._setHostFocusable(!this.disabled);
                }
                if (changedProperties.has('open')) {
                    if (this.open) {
                        if (this.disabled) {
                            this.open = false;
                            return;
                        }
                        this._floatingController.start();
                        // Focus selected item
                        if (this.value) {
                            const idx = this._slottedItems.filter((i)=>!i.hidden).findIndex((i)=>i.value === this.value);
                            this._activeIndex = idx;
                            if (idx >= 0) this._updateSlottedActiveState(idx);
                            this._scrollToActiveIndex();
                        } else {
                            this._activeIndex = -1;
                        }
                    } else {
                        this._activeIndex = -1;
                        this._floatingController.stop();
                        this._triggerEl?.focus();
                        // Clear typeahead state when dropdown closes
                        window.clearTimeout(this._typeaheadTimeout);
                        this._typeaheadBuffer = '';
                        this._typeAheadString = '';
                        this._syncHighlightToOptions();
                    }
                }
            }
            formDisabledCallback(disabled) {
                this.disabled = disabled;
            }
            // ── Internal Methods ───────────────────────────────────────────────────────
            _observeSlottedItems() {
                const slot = this.shadowRoot?.querySelector('slot:not([name])');
                if (!slot) return;
                const updateItems = ()=>{
                    const assigned = slot.assignedElements({
                        flatten: true
                    });
                    const items = [];
                    const collectOptions = (elements)=>{
                        for (const el of elements){
                            if (el.tagName.toLowerCase() === 'vi-select-option') {
                                items.push(el);
                            } else if (el.tagName.toLowerCase() === 'vi-select-group') {
                                collectOptions(Array.from(el.children));
                            }
                        }
                    };
                    collectOptions(assigned);
                    this._slottedItems = items;
                    // Sync initial properties to children
                    for (const item of this._slottedItems){
                        if (item.value) {
                            if (item.id) {
                                this._optionIdMap.set(item.value, item.id);
                            } else {
                                item.id = this._getOptionId(item.value);
                            }
                        }
                        item.wrapText = this.wrapText;
                        item.highlightText = this._typeAheadString;
                    }
                    this._syncSlottedSelectedState();
                    this._syncSelectedLabel();
                };
                updateItems();
                this._slotMutationObserver = new MutationObserver(()=>updateItems());
                this._slotMutationObserver.observe(this, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: [
                        'value',
                        'label',
                        'disabled'
                    ]
                });
            }
            _syncSlottedSelectedState() {
                for (const item of this._slottedItems){
                    item.selected = item.value === this.value;
                }
            }
            _syncSelectedLabel() {
                const selectedItem = this._slottedItems.find((item)=>item.value === this.value);
                if (selectedItem) {
                    this._selectedLabel = selectedItem.label || selectedItem.textContent?.trim() || '';
                } else {
                    this._selectedLabel = '';
                }
            }
            _updateSlottedActiveState(activeIndex) {
                const visible = this._slottedItems.filter((i)=>!i.hidden);
                visible.forEach((item, i)=>{
                    item.active = i === activeIndex;
                });
            }
            async _scrollToActiveIndex() {
                await this.updateComplete;
                if (this._activeIndex < 0) return;
                const activeItem = this._slottedItems[this._activeIndex];
                if (activeItem && typeof activeItem.scrollIntoView === 'function') {
                    activeItem.scrollIntoView({
                        block: 'nearest'
                    });
                }
            }
            // ── Event handlers ─────────────────────────────────────────────────────────
            _handleSlottedItemSelect = (e)=>{
                e.stopPropagation();
                const item = e.detail.item;
                this._selectOption({
                    value: item.value,
                    label: item.label || item.value,
                    disabled: item.disabled,
                    data: item.data
                });
            };
            _selectOption(opt) {
                if (opt.disabled) return;
                this.value = opt.value;
                this.close();
                this.dispatchEvent(new CustomEvent('vialiq-change', {
                    detail: {
                        value: this.value,
                        label: opt.label
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            _typeaheadBuffer = '';
            _typeaheadTimeout = -1;
            _handleKeyDown = (e)=>{
                if (this.disabled) return;
                if (this.open && e.key !== ' ' && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    this._typeaheadBuffer += e.key.toLowerCase();
                    window.clearTimeout(this._typeaheadTimeout);
                    this._typeaheadTimeout = window.setTimeout(()=>{
                        // Only clear the navigation buffer — do NOT clear the highlight here.
                        // Highlight persists while dropdown is open and is cleared on close.
                        this._typeaheadBuffer = '';
                    }, 1000);
                    // Sync highlight text so options visually highlight the typed query
                    this._typeAheadString = this._typeaheadBuffer;
                    this._syncHighlightToOptions();
                    const visible = this._slottedItems.filter((i)=>!i.hidden && !i.disabled);
                    // Start searching from next index if repeating the same char, or current index if not
                    const startIndex = this._activeIndex >= 0 ? this._activeIndex : 0;
                    let matchIdx = -1;
                    // Look forward
                    for(let i = 1; i <= visible.length; i++){
                        const checkIdx = (startIndex + i) % visible.length;
                        const itemLabel = (visible[checkIdx].label || visible[checkIdx].textContent || '').trim().toLowerCase();
                        if (itemLabel.startsWith(this._typeaheadBuffer)) {
                            matchIdx = checkIdx;
                            break;
                        }
                    }
                    if (matchIdx >= 0) {
                        this._activeIndex = matchIdx;
                        this._updateSlottedActiveState(matchIdx);
                        this._scrollToActiveIndex();
                    }
                    return;
                }
                this._keyboardController.handleKeyDown(e);
            };
            _handleOutsideClick = (e)=>{
                if (this.open && !e.composedPath().includes(this)) {
                    this.close();
                }
            };
            _onClear(e) {
                e.stopPropagation();
                e.preventDefault();
                if (this.disabled) return;
                this.clear();
            }
            _toggleOpen(e) {
                if (this.disabled) return;
                // Prevent toggle if clicking clear button
                const path = e.composedPath();
                const isClearBtn = path.some((el)=>el.part?.contains('clear-btn'));
                if (isClearBtn) return;
                this.open = !this.open;
            }
            // ── Public Imperative Methods ──────────────────────────────────────────────
            toggle() {
                if (this.disabled) return;
                this.open = !this.open;
            }
            show() {
                if (this.disabled || this.open) return;
                this.open = true;
            }
            close() {
                if (!this.open) return;
                this.open = false;
            }
            clear() {
                if (!this.value) return;
                this.value = '';
                this._selectedLabel = '';
                this.dispatchEvent(new CustomEvent('vialiq-clear', {
                    bubbles: true,
                    composed: true
                }));
                this.dispatchEvent(new CustomEvent('vialiq-change', {
                    detail: {
                        value: '',
                        label: ''
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            // ── Render ─────────────────────────────────────────────────────────────────
            render() {
                const hasSelection = !!this.value;
                return b`
      <div class="select-field">
        <div
          class="select-wrapper ${this.status === 'invalid' ? 'is-invalid' : this.status === 'valid' ? 'is-valid' : ''}"
          part="wrapper"
        >
          <!-- Visual trigger element -->
          <div
            part="trigger"
            class="select-trigger ${hasSelection ? '' : 'is-placeholder'} ${this.disabled ? 'is-disabled' : ''}"
            tabindex=${this.disabled ? '-1' : '0'}
            aria-haspopup="listbox"
            aria-expanded=${this.open ? 'true' : 'false'}
            aria-controls=${this._listboxId}
            aria-activedescendant=${this.open && this._activeIndex >= 0 && this._slottedItems[this._activeIndex] ? this._getOptionId(this._slottedItems[this._activeIndex].value) : ''}
            aria-label=${ifNonEmpty(this.ariaLabel || this.placeholder)}
            aria-invalid=${this.status === 'invalid' ? 'true' : 'false'}
            aria-describedby=${this.validityMessage ? 'helper-text validation-message' : 'helper-text'}
            aria-errormessage=${ifNonEmpty(this.status === 'invalid' && this.validityMessage ? 'validation-message' : '')}
            @click=${this._toggleOpen}
            title=${hasSelection ? this._selectedLabel : ''}
          >
            <div class="select-label-container">
              <span part="label" class="select-label">
                ${hasSelection ? this._selectedLabel : this.placeholder}
              </span>
              <div class="select-measurer" aria-hidden="true">
                <span>${this.placeholder}</span>
                ${this._slottedItems.map((item)=>b`<span
                      >${item.label || item.textContent?.trim() || ''}</span
                    >`)}
              </div>
            </div>
            <div class="select-icons">
              <button
                part="clear-btn"
                class="select-clear-btn"
                type="button"
                tabindex="-1"
                ?hidden=${!this.clearable || !hasSelection}
                @click=${this._onClear}
                aria-label="Clear selection"
              >
                <vi-icon name="x" size="14"></vi-icon>
              </button>
              <vi-icon
                name="chevron-down"
                class="select-chevron"
                part="chevron"
                size="16"
              ></vi-icon>
            </div>
          </div>

          <!-- Floating Listbox Dropdown -->
          <div
            id=${this._listboxId}
            part="listbox"
            class="select-listbox"
            role="listbox"
            ?hidden=${!this.open}
          >
            <slot></slot>
          </div>
        </div>

        <span id="helper-text" class="select-helper" part="helper">
          <slot name="helper"></slot>
        </span>
        <span
          id="validation-message"
          class="select-validation ${this.status === 'invalid' ? 'is-invalid' : this.status === 'valid' ? 'is-valid' : ''}"
          part="validation"
          role="alert"
          aria-live="polite"
          ?hidden=${!this.validityMessage}
        >
          ${this.validityMessage}
        </span>
      </div>
    `;
            }
        }
    }
}();
