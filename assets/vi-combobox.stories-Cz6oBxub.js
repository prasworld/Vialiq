import { r as r$2, i, b, a as r$3, E, c as i$2, A } from './iframe-9yd_z6c6.js';
import { V as ViElement, t, n as n$1 } from './vi-element-D7bP2wsn.js';
import { r as r$1 } from './state-FW5tp7Om.js';
import { e as e$1 } from './overlay-manager-B43cq-OI.js';
import { F as FocusableMixin } from './focusable-mixin-CmxOyPX5.js';
import { V as ValidityMixin } from './validity-mixin-BGbFxpv9.js';
import './vi-icon-C_atHq7t.js';
import './vi-chip-lB1Dct6_.js';
import './vi-button-D54BGZG7.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import { c as checkIcon } from './check-D9SDO18H.js';
import { L as ListboxKeyboardController, F as FloatingController } from './keyboard-controller-DbV1C_E6.js';
import { i as i$1, t as t$1, e } from './directive-BKuZRRPO.js';
import { c as c$1 } from './repeat-CQoE-EUW.js';
import { _ as __vitePreload } from './preload-helper-D5QYaGzd.js';
import { c as chevronDownIcon } from './chevron-down-BU8Kh4z3.js';
import { m as minusIcon } from './minus-ClYqs843.js';
import { x as xIcon } from './x-3JmBhc9n.js';
import './base-Cl6v8-BZ.js';
import './floating-ui.dom-DwUTpXgb.js';

const itemStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.combobox-field{display:flex;flex-direction:column;gap:var(--vi-combobox-spacing-field-gap, var(--vi-spacing-xs, .5rem));width:100%;position:relative}.combobox-control{display:flex;align-items:center;flex-wrap:wrap;gap:var(--vi-combobox-tag-gap, var(--vi-spacing-xs, .5rem));box-sizing:border-box;width:100%;min-height:var(--vi-combobox-min-height, 40px);padding:var(--vi-combobox-padding-block, var(--vi-spacing-xs, .5rem)) var(--vi-combobox-padding-inline, var(--vi-spacing-sm, .75rem));background-color:var(--vi-combobox-background, var(--vi-color-background, #ffffff));border:var(--vi-combobox-border-width, var(--vi-border-width-thin, 1px)) solid var(--vi-combobox-border-color, var(--vi-border-03, #e0e0e0));border-radius:var(--vi-combobox-border-radius, var(--vi-border-radius-lg, 8px));font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-combobox-font-size, var(--vi-font-size-base, .875rem));color:var(--vi-combobox-text-color, var(--vi-text-primary, #111827));transition:border-color .15s ease,box-shadow .15s ease;cursor:text;position:relative}.combobox-control:hover:not(.is-disabled):not(.is-focused){border-color:var(--vi-combobox-border-color-hover, var(--vi-border-04, #bdbdbd))}.combobox-control.is-focused,.combobox-control:focus-within{border-color:var(--vi-combobox-border-color-focus, var(--vi-focus, #3676d0));outline:var(--vi-combobox-border-width-focus, var(--vi-border-width-base, 2px)) solid var(--vi-combobox-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:0;box-shadow:var(--vi-focus-ring-shadow, 0 0 0 3px var(--vi-focus-ring-color, var(--vi-color-blue-200, #cee6ff)))}.combobox-control.is-disabled{opacity:var(--vi-combobox-disabled-opacity, .6);pointer-events:none;cursor:not-allowed}.combobox-control.is-invalid{border-color:var(--vi-combobox-error-color, var(--vi-color-error, #ef4444))}.combobox-control.is-invalid.is-focused,.combobox-control.is-invalid:focus-within{outline-color:var(--vi-combobox-error-color, var(--vi-color-error, #ef4444))}.combobox-control.is-valid{border-color:var(--vi-combobox-success-color, var(--vi-color-success, #489167))}.combobox-input{appearance:none;-webkit-appearance:none;flex:1 1 60px;min-width:60px;border:none;outline:none;background:transparent;padding:0;margin:0;font-family:inherit;font-size:inherit;color:inherit;line-height:var(--vi-line-height-normal, 1.5715)}.combobox-input::placeholder{color:var(--vi-combobox-placeholder-color, var(--vi-text-secondary, #4b5563))}.combobox-chevron{margin-left:auto;color:var(--vi-combobox-chevron-color, var(--vi-text-secondary, #4b5563));flex-shrink:0;transition:transform .2s cubic-bezier(.2,0,0,1);transform-origin:center center;pointer-events:auto;cursor:pointer;width:18px;height:18px}.combobox-control.is-open .combobox-chevron{transform:rotate(180deg)}.combobox-clear-btn{appearance:none;-webkit-appearance:none;background:transparent;border:none;padding:2px;margin:0;display:inline-flex;align-items:center;justify-content:center;color:var(--vi-combobox-clear-color, var(--vi-text-secondary, #4b5563));cursor:pointer;border-radius:var(--vi-border-radius-sm, 4px);transition:color .15s ease,background-color .15s ease;width:20px;height:20px;flex-shrink:0}.combobox-clear-btn:hover{color:var(--vi-combobox-clear-hover-color, var(--vi-text-primary, #111827));background-color:var(--vi-combobox-clear-hover-bg, var(--vi-layer-hover-01, #f3f4f6))}.combobox-trigger{appearance:none;-webkit-appearance:none;flex:1 1 0px;min-width:0;display:inline-flex;align-items:center;border:none;outline:none;background:transparent;padding:0;margin:0;font-family:inherit;font-size:inherit;color:inherit;line-height:inherit;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}.combobox-trigger.is-placeholder{color:var(--vi-combobox-placeholder-color, var(--vi-text-secondary, #4b5563))}.combobox-tags{display:flex;flex-wrap:wrap;align-items:center;gap:var(--vi-combobox-tag-gap, var(--vi-spacing-xs, .5rem))}.combobox-listbox{box-sizing:border-box;position:absolute;top:0;left:0;z-index:var(--vi-combobox-listbox-z-index, 1000);height:var(--vi-combobox-listbox-height, auto);max-height:var(--vi-combobox-listbox-max-height, 280px);overflow-y:auto;background-color:var(--vi-combobox-listbox-background, var(--vi-layer-01, #ffffff));border:1px solid var(--vi-combobox-listbox-border-color, var(--vi-border-02, #eeeeee));border-radius:var(--vi-combobox-listbox-border-radius, var(--vi-border-radius-lg, 8px));box-shadow:var(--vi-combobox-listbox-shadow, var(--vi-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, .05), 0 10px 15px -3px rgba(0, 0, 0, .1)));padding:4px 0;margin:0;opacity:0;visibility:hidden;transform:translateY(-6px) scale(.98);transform-origin:top center;transition:opacity .16s cubic-bezier(.2,0,0,1),transform .16s cubic-bezier(.2,0,0,1),visibility .16s cubic-bezier(.2,0,0,1);pointer-events:none}.combobox-listbox[data-placement^=top]{transform-origin:bottom center;transform:translateY(6px) scale(.98)}.combobox-listbox[open],.combobox-listbox.is-open{opacity:1;visibility:visible;transform:translateY(0) scale(1);pointer-events:auto}.combobox-list{list-style:none;margin:0;padding:0}.combobox-option{display:flex;align-items:center;justify-content:space-between;gap:var(--vi-combobox-option-gap, var(--vi-spacing-xs, .5rem));min-height:var(--vi-combobox-option-height, 40px);padding:var(--vi-combobox-option-padding-block, var(--vi-spacing-xs, .5rem)) var(--vi-combobox-option-padding-inline, var(--vi-spacing-sm, .75rem));font-size:var(--vi-combobox-option-font-size, var(--vi-font-size-base, .875rem));color:var(--vi-combobox-option-color, var(--vi-text-primary, #111827));cursor:pointer;-webkit-user-select:none;user-select:none}.combobox-option:hover,.combobox-option.is-active{background-color:var(--vi-combobox-option-hover-bg, var(--vi-layer-hover-01, #f3f4f6))}.combobox-option.is-selected{background-color:var(--vi-combobox-option-selected-bg, var(--vi-layer-02, #f3f4f6));color:var(--vi-combobox-option-selected-color, var(--vi-color-primary, #3676d0));font-weight:var(--vi-font-weight-semibold, 600)}.combobox-option.is-disabled{color:var(--vi-combobox-option-disabled-color, var(--vi-text-disabled, #9e9e9e));cursor:not-allowed;pointer-events:none;opacity:.6}.combobox-option-content{display:flex;flex-direction:column;flex:1 1 auto;overflow:hidden}.combobox-option-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.combobox-option-description{font-size:var(--vi-combobox-option-description-font-size, var(--vi-font-size-sm, .8125rem));color:var(--vi-combobox-option-description-color, var(--vi-text-secondary, #4b5563));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.combobox-option-action{display:flex;align-items:center;margin-left:auto;z-index:1}.combobox-mark{background-color:var(--vi-combobox-mark-background, var(--vi-typeahead-highlight-bg, #ebf5ff));color:var(--vi-combobox-mark-color, var(--vi-typeahead-highlight-color, #3676d0));border-radius:var(--vi-border-radius-sm, 4px);padding:0 1px}.combobox-group-header{padding:8px var(--vi-combobox-group-padding-inline, var(--vi-spacing-sm, .75rem)) 4px;font-size:var(--vi-combobox-group-font-size, var(--vi-font-size-xs, .75rem));font-weight:var(--vi-combobox-group-font-weight, var(--vi-font-weight-semibold, 600));color:var(--vi-combobox-group-color, var(--vi-text-secondary, #4b5563));text-transform:uppercase;letter-spacing:var(--vi-letter-spacing-wide, .025em);-webkit-user-select:none;user-select:none}.combobox-empty,.combobox-loading{padding:var(--vi-spacing-sm, .75rem);text-align:center;font-size:var(--vi-font-size-sm, .8125rem);color:var(--vi-text-secondary, #4b5563)}.combobox-helper{font-size:var(--vi-combobox-validation-font-size, var(--vi-font-size-xs, .75rem));color:var(--vi-combobox-helper-color, var(--vi-text-helper, #9e9e9e))}.combobox-validation{font-size:var(--vi-combobox-validation-font-size, var(--vi-font-size-xs, .75rem));color:var(--vi-combobox-error-color, var(--vi-color-error, #ef4444))}.combobox-validation.is-valid{color:var(--vi-combobox-success-color, var(--vi-color-success, #489167))}@media(prefers-reduced-motion:reduce){.combobox-control,.combobox-option{transition:none}}}:host{display:block}:host([hidden]){display:none!important}mark{background-color:transparent;color:inherit}mark.highlight{background-color:var(--vi-typeahead-highlight-bg, #ebf5ff);color:var(--vi-typeahead-highlight-color, #3676d0);font-weight:600;border-radius:.125rem;padding:0 1px}";

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
var _dec$1, _initClass$1, _ViElement, _dec1$1, _dec2$1, _dec3$1, _dec4$1, _dec5$1, _dec6$1, _dec7$1, _dec8$1, _dec9$1, _dec10$1, _dec11$1, _dec12$1, _init_value$1, _init_label, _init_data, _init_group, _init_disabled$1, _init_icon, _init_description, /**
   * Search corpus override for slotted mode. Accepts an array of search terms; joined with a
   * space internally. Falls back to `label` when empty.
   * HTML attribute: space-separated string — `search-text="Alice PI alice@acme.com"`
   * JS property: string array  — `.searchText=${['Alice', 'PI', 'alice@acme.com']}`
   */ _init_searchText, _init_selected, _init_active, _init_highlightText, _init__hasSlotContent, _initProto$1;
registerIcons([
    checkIcon
]);
let _ViComboboxItem;
_dec$1 = t('vi-combobox-item'), _dec1$1 = n$1({
    type: String,
    reflect: true
}), _dec2$1 = n$1({
    type: String,
    reflect: true
}), _dec3$1 = n$1({
    attribute: false
}), _dec4$1 = n$1({
    type: String,
    reflect: true
}), _dec5$1 = n$1({
    type: Boolean,
    reflect: true
}), _dec6$1 = n$1({
    type: String,
    reflect: true
}), _dec7$1 = n$1({
    type: String,
    reflect: true
}), _dec8$1 = n$1({
    attribute: 'search-text',
    reflect: false,
    converter: {
        fromAttribute: (v)=>v ? v.split(/\s+/).filter(Boolean) : []
    }
}), _dec9$1 = n$1({
    type: Boolean,
    reflect: true
}), _dec10$1 = n$1({
    type: Boolean,
    reflect: true
}), _dec11$1 = n$1({
    type: String,
    attribute: 'highlight-text'
}), _dec12$1 = r$1();
new class extends _identity$1 {
    constructor(){
        super(_ViComboboxItem), _initClass$1();
    }
    static{
        class ViComboboxItem extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_value$1, _init_label, _init_data, _init_group, _init_disabled$1, _init_icon, _init_description, _init_searchText, _init_selected, _init_active, _init_highlightText, _init__hasSlotContent, _initProto$1], c: [_ViComboboxItem, _initClass$1] } = _apply_decs_2203_r$1(this, [
                    [
                        _dec1$1,
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
                        "highlightText"
                    ],
                    [
                        _dec12$1,
                        1,
                        "_hasSlotContent"
                    ]
                ], [
                    _dec$1
                ], _ViElement));
            }
            static styles = i`
    ${r$2(itemStyles)}
  `;
            #___private_value_1 = (_initProto$1(this), _init_value$1(this, ''));
            get value() {
                return this.#___private_value_1;
            }
            set value(_v) {
                this.#___private_value_1 = _v;
            }
            #___private_label_2 = _init_label(this, '');
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
            #___private_highlightText_11 = _init_highlightText(this, '');
            get highlightText() {
                return this.#___private_highlightText_11;
            }
            set highlightText(_v) {
                this.#___private_highlightText_11 = _v;
            }
            #___private__hasSlotContent_12 = _init__hasSlotContent(this, false);
            get _hasSlotContent() {
                return this.#___private__hasSlotContent_12;
            }
            set _hasSlotContent(_v) {
                this.#___private__hasSlotContent_12 = _v;
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
                // Keep host-level ARIA attributes in sync with reactive properties so they
                // always reflect the current selected/disabled state for AT.
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
                this.dispatchEvent(new CustomEvent('vi-combobox-item-select', {
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
                const escaped = this.highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escaped})`, 'gi');
                const parts = this.label.split(regex);
                return b`${parts.map((part)=>part.toLowerCase() === this.highlightText.toLowerCase() ? b`<mark class="highlight">${part}</mark>` : part)}`;
            }
            render() {
                return b`
      <li
        part="item"
        role="presentation"
        class="combobox-option ${this.selected ? 'is-selected' : ''} ${this.active ? 'is-active' : ''} ${this.disabled ? 'is-disabled' : ''}"
      >
        ${this.icon ? b`<vi-icon
              part="icon"
              name="${this.icon}"
              class="combobox-option-icon"
            ></vi-icon>` : ''}

        <div part="content" class="combobox-option-content">
          <slot @slotchange=${this._handleSlotChange}></slot>
          ${!this._hasSlotContent ? b`
                <span part="label" class="combobox-option-label"
                  >${this._renderHighlightedLabel()}</span
                >
                ${this.description ? b`<span
                      part="description"
                      class="combobox-option-description"
                      >${this.description}</span
                    >` : ''}
              ` : ''}
        </div>

        ${this.selected ? b`<vi-icon
              part="check"
              name="check"
              class="combobox-option-check"
            ></vi-icon>` : ''}
      </li>
    `;
            }
        }
    }
}();

class InfiniteScrollController {
    host;
    options;
    _observer = null;
    constructor(host, options){
        this.host = host;
        this.options = options;
        this.host.addController(this);
    }
    hostUpdated() {
        if (this.options.enabled && !this.options.enabled()) {
            this._disconnectObserver();
        } else {
            this._connectObserver();
        }
    }
    hostDisconnected() {
        this._disconnectObserver();
    }
    _connectObserver() {
        const listbox = this.options.listbox();
        const top = this.options.sentinelTop();
        const bottom = this.options.sentinelBottom();
        if ((top || bottom) && !this._observer) {
            this._observer = new IntersectionObserver((entries)=>{
                for (const entry of entries){
                    if (entry.isIntersecting) {
                        // Usually the sentinels might have a class to distinguish, but object identity works best
                        const direction = entry.target === top ? 'up' : 'down';
                        this.host.dispatchEvent(new CustomEvent('vi-combobox-load-more', {
                            bubbles: true,
                            composed: true,
                            detail: {
                                id: this.host.id || '',
                                direction
                            }
                        }));
                    }
                }
            }, {
                root: listbox,
                rootMargin: this.options.rootMargin ?? '100px',
                threshold: 0
            });
            if (top) this._observer.observe(top);
            if (bottom) this._observer.observe(bottom);
        }
    }
    _disconnectObserver() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    }
}

class FilterController {
    host;
    config;
    query = '';
    _debounceTimer = null;
    _loadId = 0;
    constructor(host, config){
        this.host = host;
        this.config = config;
        this.host.addController(this);
    }
    hostDisconnected() {
        if (this._debounceTimer) clearTimeout(this._debounceTimer);
    }
    handleInput(e) {
        if (!this.host.isSearchable) return;
        const input = e.target;
        this.query = input.value;
        this.config.resetActiveIndex();
        this.host.requestUpdate();
        if (!this.config.isOpen()) {
            this.config.open();
        }
        if (this._debounceTimer) clearTimeout(this._debounceTimer);
        const slottedItems = this.config.getSlottedItems();
        if (slottedItems.length > 0) {
            if (this.query.length === 0 || this.query.length >= this.host.minChars) {
                this.applySlottedFilter(this.query, slottedItems);
            } else {
                // Query exists but is below the minChars threshold – show all items without
                // filtering so users can see their options before the search kicks in.
                this.resetSlottedVisibility(slottedItems);
            }
        }
        if (this.query.length >= this.host.minChars) {
            this._debounceTimer = setTimeout(()=>{
                this.host.dispatchEvent(new CustomEvent('vi-combobox-search', {
                    detail: {
                        query: this.query
                    },
                    bubbles: true,
                    composed: true
                }));
                const loader = typeof this.host.options === 'function' ? this.host.options : null;
                if (loader) {
                    this.config.setLoading(true);
                    const currentLoadId = ++this._loadId;
                    loader(this.query).then((opts)=>{
                        if (this._loadId !== currentLoadId) return;
                        this.config.setOptionsList(opts);
                        this.config.rebuildOptionDataMap();
                        this.host.requestUpdate();
                    }).catch(()=>{
                        if (this._loadId !== currentLoadId) return;
                        this.config.setOptionsList([]);
                        this.config.rebuildOptionDataMap();
                        this.host.requestUpdate();
                    }).finally(()=>{
                        if (this._loadId !== currentLoadId) return;
                        this.config.setLoading(false);
                    });
                }
            }, this.host.debounce);
        }
    }
    applySlottedFilter(query, slottedItems) {
        if (slottedItems.length === 0 || !this.host.isSearchable) return;
        if (!query) {
            this.config.resetActiveIndex();
            this.resetSlottedVisibility(slottedItems);
            return;
        }
        const q = query.toLowerCase().trim();
        const results = [];
        const matchedValues = new Set();
        const filterFn = this.host.filterFn;
        for (const item of slottedItems){
            let isMatch = false;
            const optData = {
                value: item.value,
                label: item.label || item.value,
                group: item.group,
                disabled: item.disabled,
                icon: item.icon,
                description: item.description,
                searchText: item.searchText?.join(' '),
                data: item.data
            };
            if (filterFn) {
                isMatch = filterFn(optData, query);
            } else {
                const searchText = item.searchText?.join(' ');
                const corpus = searchText ? searchText.toLowerCase() : [
                    item.label || item.value,
                    item.description
                ].filter(Boolean).join(' ').toLowerCase();
                isMatch = this.host.matchFrom === 'start' ? corpus.startsWith(q) : corpus.includes(q);
            }
            item.hidden = !isMatch;
            if (isMatch) {
                results.push(optData);
                matchedValues.add(item.value);
            }
        }
        const visibleItems = this.config.getVisibleSlottedItems();
        const firstVisibleIdx = visibleItems.findIndex((i)=>!i.disabled);
        if (firstVisibleIdx >= 0) {
            this.config.setSlottedActiveIndex(firstVisibleIdx);
        } else {
            this.config.resetActiveIndex();
        }
        this.host.requestUpdate();
        this.host.dispatchEvent(new CustomEvent('vi-combobox-filter', {
            detail: {
                query: query,
                results,
                matchedValues: Array.from(matchedValues)
            },
            bubbles: true,
            composed: true
        }));
    }
    resetSlottedVisibility(slottedItems) {
        for (const item of slottedItems){
            item.hidden = false;
            item.active = false;
        }
        this.host.requestUpdate();
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=(i,t)=>{const e=i._$AN;if(void 0===e)return  false;for(const i of e)i._$AO?.(t,false),s(i,t);return  true},o=i=>{let t,e;do{if(void 0===(t=i._$AM))break;e=t._$AN,e.delete(i),i=t;}while(0===e?.size)},r=i=>{for(let t;t=i._$AM;i=t){let e=t._$AN;if(void 0===e)t._$AN=e=new Set;else if(e.has(i))break;e.add(i),c(t);}};function h(i){ void 0!==this._$AN?(o(this),this._$AM=i,r(this)):this._$AM=i;}function n(i,t=false,e=0){const r=this._$AH,h=this._$AN;if(void 0!==h&&0!==h.size)if(t)if(Array.isArray(r))for(let i=e;i<r.length;i++)s(r[i],false),o(r[i]);else null!=r&&(s(r,false),o(r));else s(this,i);}const c=i=>{i.type==t$1.CHILD&&(i._$AP??=n,i._$AQ??=h);};class f extends i$1{constructor(){super(...arguments),this._$AN=void 0;}_$AT(i,t,e){super._$AT(i,t,e),r(this),this.isConnected=i._$AU;}_$AO(i,t=true){i!==this.isConnected&&(this.isConnected=i,i?this.reconnected?.():this.disconnected?.()),t&&(s(this,i),o(this));}setValue(t){if(r$3(this._$Ct))this._$Ct._$AI(t,this);else {const i=[...this._$Ct._$AH];i[this._$Ci]=t,this._$Ct._$AI(i,this,0);}}disconnected(){}reconnected(){}}

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class RangeChangedEvent extends Event {
    constructor(range) {
        super(RangeChangedEvent.eventName, { bubbles: false });
        this.first = range.first;
        this.last = range.last;
    }
}
RangeChangedEvent.eventName = 'rangeChanged';
class VisibilityChangedEvent extends Event {
    constructor(range) {
        super(VisibilityChangedEvent.eventName, { bubbles: false });
        this.first = range.first;
        this.last = range.last;
    }
}
VisibilityChangedEvent.eventName = 'visibilityChanged';
class UnpinnedEvent extends Event {
    constructor() {
        super(UnpinnedEvent.eventName, { bubbles: false });
    }
}
UnpinnedEvent.eventName = 'unpinned';

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class ScrollerShim {
    constructor(element) {
        this._element = null;
        const node = element ?? window;
        this._node = node;
        if (element) {
            this._element = element;
        }
    }
    get element() {
        return (this._element || document.scrollingElement || document.documentElement);
    }
    get scrollTop() {
        return this.element.scrollTop || window.scrollY;
    }
    get scrollLeft() {
        return this.element.scrollLeft || window.scrollX;
    }
    get scrollHeight() {
        return this.element.scrollHeight;
    }
    get scrollWidth() {
        return this.element.scrollWidth;
    }
    get viewportHeight() {
        return this._element
            ? this._element.getBoundingClientRect().height
            : window.innerHeight;
    }
    get viewportWidth() {
        return this._element
            ? this._element.getBoundingClientRect().width
            : window.innerWidth;
    }
    get maxScrollTop() {
        return this.scrollHeight - this.viewportHeight;
    }
    get maxScrollLeft() {
        return this.scrollWidth - this.viewportWidth;
    }
}
class ScrollerController extends ScrollerShim {
    constructor(client, element) {
        super(element);
        this._clients = new Set();
        this._retarget = null;
        this._end = null;
        this.__destination = null;
        this.correctingScrollError = false;
        this._checkForArrival = this._checkForArrival.bind(this);
        this._updateManagedScrollTo = this._updateManagedScrollTo.bind(this);
        this.scrollTo = this.scrollTo.bind(this);
        this.scrollBy = this.scrollBy.bind(this);
        const node = this._node;
        this._originalScrollTo = node.scrollTo;
        this._originalScrollBy = node.scrollBy;
        this._originalScroll = node.scroll;
        this._attach(client);
    }
    get _destination() {
        return this.__destination;
    }
    get scrolling() {
        return this._destination !== null;
    }
    scrollTo(p1, p2) {
        const options = typeof p1 === 'number' && typeof p2 === 'number'
            ? { left: p1, top: p2 }
            : p1;
        this._scrollTo(options);
    }
    scrollBy(p1, p2) {
        const options = typeof p1 === 'number' && typeof p2 === 'number'
            ? { left: p1, top: p2 }
            : p1;
        if (options.top !== undefined) {
            options.top += this.scrollTop;
        }
        if (options.left !== undefined) {
            options.left += this.scrollLeft;
        }
        this._scrollTo(options);
    }
    _nativeScrollTo(options) {
        this._originalScrollTo.bind(this._element || window)(options);
    }
    _scrollTo(options, retarget = null, end = null) {
        if (this._end !== null) {
            this._end();
        }
        if (options.behavior === 'smooth') {
            this._setDestination(options);
            this._retarget = retarget;
            this._end = end;
        }
        else {
            this._resetScrollState();
        }
        this._nativeScrollTo(options);
    }
    _setDestination(options) {
        let { top, left } = options;
        top =
            top === undefined
                ? undefined
                : Math.max(0, Math.min(top, this.maxScrollTop));
        left =
            left === undefined
                ? undefined
                : Math.max(0, Math.min(left, this.maxScrollLeft));
        if (this._destination !== null &&
            left === this._destination.left &&
            top === this._destination.top) {
            return false;
        }
        this.__destination = { top, left, behavior: 'smooth' };
        return true;
    }
    _resetScrollState() {
        this.__destination = null;
        this._retarget = null;
        this._end = null;
    }
    _updateManagedScrollTo(coordinates) {
        if (this._destination) {
            if (this._setDestination(coordinates)) {
                this._nativeScrollTo(this._destination);
            }
        }
    }
    managedScrollTo(options, retarget, end) {
        this._scrollTo(options, retarget, end);
        return this._updateManagedScrollTo;
    }
    correctScrollError(coordinates) {
        this.correctingScrollError = true;
        requestAnimationFrame(() => requestAnimationFrame(() => (this.correctingScrollError = false)));
        // Correct the error
        this._nativeScrollTo(coordinates);
        // Then, if we were headed for a specific destination, we continue scrolling:
        // First, we update our target destination, if applicable...
        if (this._retarget) {
            this._setDestination(this._retarget());
        }
        // Then we go ahead and resume scrolling
        if (this._destination) {
            this._nativeScrollTo(this._destination);
        }
    }
    _checkForArrival() {
        if (this._destination !== null) {
            const { scrollTop, scrollLeft } = this;
            let { top, left } = this._destination;
            top = Math.min(top || 0, this.maxScrollTop);
            left = Math.min(left || 0, this.maxScrollLeft);
            const topDiff = Math.abs(top - scrollTop);
            const leftDiff = Math.abs(left - scrollLeft);
            // We check to see if we've arrived at our destination.
            if (topDiff < 1 && leftDiff < 1) {
                if (this._end) {
                    this._end();
                }
                this._resetScrollState();
            }
        }
    }
    detach(client) {
        this._clients.delete(client);
        /**
         * If there aren't any more clients, then return the node's default
         * scrolling methods
         */
        if (this._clients.size === 0) {
            this._node.scrollTo = this._originalScrollTo;
            this._node.scrollBy = this._originalScrollBy;
            this._node.scroll = this._originalScroll;
            this._node.removeEventListener('scroll', this._checkForArrival);
        }
        return null;
    }
    _attach(client) {
        this._clients.add(client);
        /**
         * The node should only have the methods shimmed when adding the first
         * client – otherwise it's redundant
         */
        if (this._clients.size === 1) {
            this._node.scrollTo = this.scrollTo;
            this._node.scrollBy = this.scrollBy;
            this._node.scroll = this.scrollTo;
            this._node.addEventListener('scroll', this._checkForArrival);
        }
    }
}

// Virtualizer depends on `ResizeObserver`, which is supported in
// all modern browsers. For developers whose browser support
// matrix includes older browsers, we include a compatible
// polyfill in the package; this bit of module state facilitates
// a simple mechanism (see ./polyfillLoaders/ResizeObserver.js.)
// for loading the polyfill.
let _ResizeObserver = typeof window !== 'undefined' ? window.ResizeObserver : undefined;
const virtualizerRef = Symbol('virtualizerRef');
const SIZER_ATTRIBUTE = 'virtualizer-sizer';
let DefaultLayoutConstructor;
/**
 * Provides virtual scrolling boilerplate.
 *
 * Extensions of this class must set hostElement and layout.
 *
 * Extensions of this class must also override VirtualRepeater's DOM
 * manipulation methods.
 */
class Virtualizer {
    constructor(config) {
        this._benchmarkStart = null;
        this._layout = null;
        this._clippingAncestors = [];
        /**
         * Layout provides these values, we set them on _render().
         * TODO @straversi: Can we find an XOR type, usable for the key here?
         */
        this._scrollSize = null;
        /**
         * Difference between scroll target's current and required scroll offsets.
         * Provided by layout.
         */
        this._scrollError = null;
        /**
         * A list of the positions (top, left) of the children in the current range.
         */
        this._childrenPos = null;
        // TODO: (graynorton): type
        this._childMeasurements = null;
        this._toBeMeasured = new Map();
        this._rangeChanged = true;
        this._itemsChanged = true;
        this._visibilityChanged = true;
        this._scrollerController = null;
        this._isScroller = false;
        this._sizer = null;
        /**
         * Resize observer attached to hostElement.
         */
        this._hostElementRO = null;
        /**
         * Resize observer attached to children.
         */
        this._childrenRO = null;
        this._mutationObserver = null;
        this._scrollEventListeners = [];
        this._scrollEventListenerOptions = {
            passive: true,
        };
        // TODO (graynorton): Rethink, per longer comment below
        this._loadListener = this._childLoaded.bind(this);
        /**
         * Index of element to scroll into view, plus scroll
         * behavior options, as imperatively specified via
         * `element(index).scrollIntoView()`
         */
        this._scrollIntoViewTarget = null;
        this._updateScrollIntoViewCoordinates = null;
        /**
         * Items to render. Set by items.
         */
        this._items = [];
        /**
         * Index of the first child in the range, not necessarily the first visible child.
         * TODO @straversi: Consider renaming these.
         */
        this._first = -1;
        /**
         * Index of the last child in the range.
         */
        this._last = -1;
        /**
         * Index of the first item intersecting the viewport.
         */
        this._firstVisible = -1;
        /**
         * Index of the last item intersecting the viewport.
         */
        this._lastVisible = -1;
        this._scheduled = new WeakSet();
        /**
         * Invoked at the end of each render cycle: children in the range are
         * measured, and their dimensions passed to this callback. Use it to layout
         * children as needed.
         */
        this._measureCallback = null;
        this._measureChildOverride = null;
        /**
         * State for `layoutComplete` promise
         */
        this._layoutCompletePromise = null;
        this._layoutCompleteResolver = null;
        this._layoutCompleteRejecter = null;
        this._pendingLayoutComplete = null;
        /**
         * Layout initialization is async because we dynamically load
         * the default layout if none is specified. This state is to track
         * whether init is complete.
         */
        this._layoutInitialized = null;
        /**
         * Track connection state to guard against errors / unnecessary work
         */
        this._connected = false;
        if (!config) {
            throw new Error('Virtualizer constructor requires a configuration object');
        }
        if (config.hostElement) {
            this._init(config);
        }
        else {
            throw new Error('Virtualizer configuration requires the "hostElement" property');
        }
    }
    set items(items) {
        if (Array.isArray(items) && items !== this._items) {
            this._itemsChanged = true;
            this._items = items;
            this._schedule(this._updateLayout);
        }
    }
    _init(config) {
        this._isScroller = !!config.scroller;
        this._initHostElement(config);
        // If no layout is specified, we make an empty
        // layout config, which will result in the default
        // layout with default parameters
        const layoutConfig = config.layout || {};
        // Save the promise returned by `_initLayout` as a state
        // variable we can check before updating layout config
        this._layoutInitialized = this._initLayout(layoutConfig);
    }
    _initObservers() {
        this._mutationObserver = new MutationObserver(this._finishDOMUpdate.bind(this));
        this._hostElementRO = new _ResizeObserver(() => this._hostElementSizeChanged());
        this._childrenRO = new _ResizeObserver(this._childrenSizeChanged.bind(this));
    }
    _initHostElement(config) {
        const hostElement = (this._hostElement = config.hostElement);
        this._applyVirtualizerStyles();
        hostElement[virtualizerRef] = this;
    }
    connected() {
        this._initObservers();
        const includeSelf = this._isScroller;
        this._clippingAncestors = getClippingAncestors(this._hostElement, includeSelf);
        this._scrollerController = new ScrollerController(this, this._clippingAncestors[0]);
        this._schedule(this._updateLayout);
        this._observeAndListen();
        this._connected = true;
    }
    _observeAndListen() {
        this._mutationObserver.observe(this._hostElement, { childList: true });
        this._hostElementRO.observe(this._hostElement);
        this._scrollEventListeners.push(window);
        window.addEventListener('scroll', this, this._scrollEventListenerOptions);
        this._clippingAncestors.forEach((ancestor) => {
            ancestor.addEventListener('scroll', this, this._scrollEventListenerOptions);
            this._scrollEventListeners.push(ancestor);
            this._hostElementRO.observe(ancestor);
        });
        this._hostElementRO.observe(this._scrollerController.element);
        this._children.forEach((child) => this._childrenRO.observe(child));
        this._scrollEventListeners.forEach((target) => target.addEventListener('scroll', this, this._scrollEventListenerOptions));
    }
    disconnected() {
        this._scrollEventListeners.forEach((target) => target.removeEventListener('scroll', this, this._scrollEventListenerOptions));
        this._scrollEventListeners = [];
        this._clippingAncestors = [];
        this._scrollerController?.detach(this);
        this._scrollerController = null;
        this._mutationObserver?.disconnect();
        this._mutationObserver = null;
        this._hostElementRO?.disconnect();
        this._hostElementRO = null;
        this._childrenRO?.disconnect();
        this._childrenRO = null;
        this._rejectLayoutCompletePromise('disconnected');
        this._connected = false;
    }
    _applyVirtualizerStyles() {
        const hostElement = this._hostElement;
        // Would rather set these CSS properties on the host using Shadow Root
        // style scoping (and falling back to a global stylesheet where native
        // Shadow DOM is not available), but this Mobile Safari bug is preventing
        // that from working: https://bugs.webkit.org/show_bug.cgi?id=226195
        const style = hostElement.style;
        style.display = style.display || 'block';
        style.position = style.position || 'relative';
        style.contain = style.contain || 'size layout';
        if (this._isScroller) {
            style.overflow = style.overflow || 'auto';
            style.minHeight = style.minHeight || '150px';
        }
    }
    _getSizer() {
        const hostElement = this._hostElement;
        if (!this._sizer) {
            // Use a preexisting sizer element if provided (for better integration
            // with vDOM renderers)
            let sizer = hostElement.querySelector(`[${SIZER_ATTRIBUTE}]`);
            if (!sizer) {
                sizer = document.createElement('div');
                sizer.setAttribute(SIZER_ATTRIBUTE, '');
                hostElement.appendChild(sizer);
            }
            // When the scrollHeight is large, the height of this element might be
            // ignored. Setting content and font-size ensures the element has a size.
            Object.assign(sizer.style, {
                position: 'absolute',
                margin: '-2px 0 0 0',
                padding: 0,
                visibility: 'hidden',
                fontSize: '2px',
            });
            sizer.textContent = '&nbsp;';
            sizer.setAttribute(SIZER_ATTRIBUTE, '');
            this._sizer = sizer;
        }
        return this._sizer;
    }
    async updateLayoutConfig(layoutConfig) {
        // If layout initialization hasn't finished yet, we wait
        // for it to finish so we can check whether the new config
        // is compatible with the existing layout before proceeding.
        await this._layoutInitialized;
        const Ctor = layoutConfig.type ||
            // The new config is compatible with the current layout,
            // so we update the config and return true to indicate
            // a successful update
            DefaultLayoutConstructor;
        if (typeof Ctor === 'function' && this._layout instanceof Ctor) {
            const config = { ...layoutConfig };
            delete config.type;
            this._layout.config = config;
            // The new config requires a different layout altogether, but
            // to limit implementation complexity we don't support dynamically
            // changing the layout of an existing virtualizer instance.
            // Returning false here lets the caller know that they should
            // instead make a new virtualizer instance with the desired layout.
            return true;
        }
        return false;
    }
    async _initLayout(layoutConfig) {
        let config;
        let Ctor;
        if (typeof layoutConfig.type === 'function') {
            // If we have a full LayoutSpecifier, the `type` property
            // gives us our constructor...
            Ctor = layoutConfig.type;
            // ...while the rest of the specifier is our layout config
            const copy = { ...layoutConfig };
            delete copy.type;
            config = copy;
        }
        else {
            // If we don't have a full LayoutSpecifier, we just
            // have a config for the default layout
            config = layoutConfig;
        }
        if (Ctor === undefined) {
            // If we don't have a constructor yet, load the default
            DefaultLayoutConstructor = Ctor = (await __vitePreload(() => import('./flow-BrYaR8e-.js'),true              ?[]:void 0,import.meta.url))
                .FlowLayout;
        }
        this._layout = new Ctor((message) => this._handleLayoutMessage(message), config);
        if (this._layout.measureChildren &&
            typeof this._layout.updateItemSizes === 'function') {
            if (typeof this._layout.measureChildren === 'function') {
                this._measureChildOverride = this._layout.measureChildren;
            }
            this._measureCallback = this._layout.updateItemSizes.bind(this._layout);
        }
        if (this._layout.listenForChildLoadEvents) {
            this._hostElement.addEventListener('load', this._loadListener, true);
        }
        this._schedule(this._updateLayout);
    }
    // TODO (graynorton): Rework benchmarking so that it has no API and
    // instead is always on except in production builds
    startBenchmarking() {
        if (this._benchmarkStart === null) {
            this._benchmarkStart = window.performance.now();
        }
    }
    stopBenchmarking() {
        if (this._benchmarkStart !== null) {
            const now = window.performance.now();
            const timeElapsed = now - this._benchmarkStart;
            const entries = performance.getEntriesByName('uv-virtualizing', 'measure');
            const virtualizationTime = entries
                .filter((e) => e.startTime >= this._benchmarkStart && e.startTime < now)
                .reduce((t, m) => t + m.duration, 0);
            this._benchmarkStart = null;
            return { timeElapsed, virtualizationTime };
        }
        return null;
    }
    _measureChildren() {
        const mm = {};
        const children = this._children;
        const fn = this._measureChildOverride || this._measureChild;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const idx = this._first + i;
            if (this._itemsChanged || this._toBeMeasured.has(child)) {
                mm[idx] = fn.call(this, child, this._items[idx]);
            }
        }
        this._childMeasurements = mm;
        this._schedule(this._updateLayout);
        this._toBeMeasured.clear();
    }
    /**
     * Returns the width, height, and margins of the given child.
     */
    _measureChild(element) {
        // offsetWidth doesn't take transforms in consideration, so we use
        // getBoundingClientRect which does.
        const { width, height } = element.getBoundingClientRect();
        return Object.assign({ width, height }, getMargins(element));
    }
    async _schedule(method) {
        if (!this._scheduled.has(method)) {
            this._scheduled.add(method);
            await Promise.resolve();
            this._scheduled.delete(method);
            method.call(this);
        }
    }
    async _updateDOM(state) {
        this._scrollSize = state.scrollSize;
        this._adjustRange(state.range);
        this._childrenPos = state.childPositions;
        this._scrollError = state.scrollError || null;
        const { _rangeChanged, _itemsChanged } = this;
        if (this._visibilityChanged) {
            this._notifyVisibility();
            this._visibilityChanged = false;
        }
        if (_rangeChanged || _itemsChanged) {
            this._notifyRange();
            this._rangeChanged = false;
        }
        this._finishDOMUpdate();
    }
    _finishDOMUpdate() {
        if (this._connected) {
            // _childrenRO should be non-null if we're connected
            this._children.forEach((child) => this._childrenRO.observe(child));
            this._checkScrollIntoViewTarget(this._childrenPos);
            this._positionChildren(this._childrenPos);
            this._sizeHostElement(this._scrollSize);
            this._correctScrollError();
            if (this._benchmarkStart && 'mark' in window.performance) {
                window.performance.mark('uv-end');
            }
        }
    }
    _updateLayout() {
        if (this._layout && this._connected) {
            this._layout.items = this._items;
            this._updateView();
            if (this._childMeasurements !== null) {
                // If the layout has been changed, we may have measurements but no callback
                if (this._measureCallback) {
                    this._measureCallback(this._childMeasurements);
                }
                this._childMeasurements = null;
            }
            this._layout.reflowIfNeeded();
            if (this._benchmarkStart && 'mark' in window.performance) {
                window.performance.mark('uv-end');
            }
        }
    }
    _handleScrollEvent() {
        if (this._benchmarkStart && 'mark' in window.performance) {
            try {
                window.performance.measure('uv-virtualizing', 'uv-start', 'uv-end');
            }
            catch (e) {
                console.warn('Error measuring performance data: ', e);
            }
            window.performance.mark('uv-start');
        }
        if (this._scrollerController.correctingScrollError === false) {
            // This is a user-initiated scroll, so we unpin the layout
            this._layout?.unpin();
        }
        this._schedule(this._updateLayout);
    }
    handleEvent(event) {
        switch (event.type) {
            case 'scroll':
                if (event.currentTarget === window ||
                    this._clippingAncestors.includes(event.currentTarget)) {
                    this._handleScrollEvent();
                }
                break;
            default:
                console.warn('event not handled', event);
        }
    }
    _handleLayoutMessage(message) {
        if (message.type === 'stateChanged') {
            this._updateDOM(message);
        }
        else if (message.type === 'visibilityChanged') {
            this._firstVisible = message.firstVisible;
            this._lastVisible = message.lastVisible;
            this._notifyVisibility();
        }
        else if (message.type === 'unpinned') {
            this._hostElement.dispatchEvent(new UnpinnedEvent());
        }
    }
    get _children() {
        const arr = [];
        let next = this._hostElement.firstElementChild;
        while (next) {
            if (!next.hasAttribute(SIZER_ATTRIBUTE)) {
                arr.push(next);
            }
            next = next.nextElementSibling;
        }
        return arr;
    }
    _updateView() {
        const hostElement = this._hostElement;
        const scrollingElement = this._scrollerController?.element;
        const layout = this._layout;
        if (hostElement && scrollingElement && layout) {
            let top, left, bottom, right;
            const hostElementBounds = hostElement.getBoundingClientRect();
            top = 0;
            left = 0;
            bottom = window.innerHeight;
            right = window.innerWidth;
            const ancestorBounds = this._clippingAncestors.map((ancestor) => ancestor.getBoundingClientRect());
            ancestorBounds.unshift(hostElementBounds);
            for (const bounds of ancestorBounds) {
                top = Math.max(top, bounds.top);
                left = Math.max(left, bounds.left);
                bottom = Math.min(bottom, bounds.bottom);
                right = Math.min(right, bounds.right);
            }
            const scrollingElementBounds = scrollingElement.getBoundingClientRect();
            const offsetWithinScroller = {
                left: hostElementBounds.left - scrollingElementBounds.left,
                top: hostElementBounds.top - scrollingElementBounds.top,
            };
            const totalScrollSize = {
                width: scrollingElement.scrollWidth,
                height: scrollingElement.scrollHeight,
            };
            const scrollTop = top - hostElementBounds.top + hostElement.scrollTop;
            const scrollLeft = left - hostElementBounds.left + hostElement.scrollLeft;
            const height = Math.max(0, bottom - top);
            const width = Math.max(0, right - left);
            layout.viewportSize = { width, height };
            layout.viewportScroll = { top: scrollTop, left: scrollLeft };
            layout.totalScrollSize = totalScrollSize;
            layout.offsetWithinScroller = offsetWithinScroller;
        }
    }
    /**
     * Styles the host element so that its size reflects the
     * total size of all items.
     */
    _sizeHostElement(size) {
        // Some browsers seem to crap out if the host element gets larger than
        // a certain size, so we clamp it here (this value based on ad hoc
        // testing in Chrome / Safari / Firefox Mac)
        const max = 8200000;
        const h = size && size.width !== null ? Math.min(max, size.width) : 0;
        const v = size && size.height !== null ? Math.min(max, size.height) : 0;
        if (this._isScroller) {
            this._getSizer().style.transform = `translate(${h}px, ${v}px)`;
        }
        else {
            const style = this._hostElement.style;
            style.minWidth = h ? `${h}px` : '100%';
            style.minHeight = v ? `${v}px` : '100%';
        }
    }
    /**
     * Sets the top and left transform style of the children from the values in
     * pos.
     */
    _positionChildren(pos) {
        if (pos) {
            pos.forEach(({ top, left, width, height, xOffset, yOffset }, index) => {
                const child = this._children[index - this._first];
                if (child) {
                    child.style.position = 'absolute';
                    child.style.boxSizing = 'border-box';
                    child.style.transform = `translate(${left}px, ${top}px)`;
                    if (width !== undefined) {
                        child.style.width = width + 'px';
                    }
                    if (height !== undefined) {
                        child.style.height = height + 'px';
                    }
                    child.style.left =
                        xOffset === undefined ? null : xOffset + 'px';
                    child.style.top =
                        yOffset === undefined ? null : yOffset + 'px';
                }
            });
        }
    }
    async _adjustRange(range) {
        const { _first, _last, _firstVisible, _lastVisible } = this;
        this._first = range.first;
        this._last = range.last;
        this._firstVisible = range.firstVisible;
        this._lastVisible = range.lastVisible;
        this._rangeChanged =
            this._rangeChanged || this._first !== _first || this._last !== _last;
        this._visibilityChanged =
            this._visibilityChanged ||
                this._firstVisible !== _firstVisible ||
                this._lastVisible !== _lastVisible;
    }
    _correctScrollError() {
        if (this._scrollError) {
            const { scrollTop, scrollLeft } = this._scrollerController;
            const { top, left } = this._scrollError;
            this._scrollError = null;
            this._scrollerController.correctScrollError({
                top: scrollTop - top,
                left: scrollLeft - left,
            });
        }
    }
    element(index) {
        if (index === Infinity) {
            index = this._items.length - 1;
        }
        return this._items?.[index] === undefined
            ? undefined
            : {
                scrollIntoView: (options = {}) => this._scrollElementIntoView({ ...options, index }),
            };
    }
    _scrollElementIntoView(options) {
        if (options.index >= this._first && options.index <= this._last) {
            this._children[options.index - this._first].scrollIntoView(options);
        }
        else {
            options.index = Math.min(options.index, this._items.length - 1);
            if (options.behavior === 'smooth') {
                const coordinates = this._layout.getScrollIntoViewCoordinates(options);
                const { behavior } = options;
                this._updateScrollIntoViewCoordinates =
                    this._scrollerController.managedScrollTo(Object.assign(coordinates, { behavior }), () => this._layout.getScrollIntoViewCoordinates(options), () => (this._scrollIntoViewTarget = null));
                this._scrollIntoViewTarget = options;
            }
            else {
                this._layout.pin = options;
            }
        }
    }
    /**
     * If we are smoothly scrolling to an element and the target element
     * is in the DOM, we update our target coordinates as needed
     */
    _checkScrollIntoViewTarget(pos) {
        const { index } = this._scrollIntoViewTarget || {};
        if (index && pos?.has(index)) {
            this._updateScrollIntoViewCoordinates(this._layout.getScrollIntoViewCoordinates(this._scrollIntoViewTarget));
        }
    }
    /**
     * Emits a rangechange event with the current first, last, firstVisible, and
     * lastVisible.
     */
    _notifyRange() {
        this._hostElement.dispatchEvent(new RangeChangedEvent({ first: this._first, last: this._last }));
    }
    _notifyVisibility() {
        this._hostElement.dispatchEvent(new VisibilityChangedEvent({
            first: this._firstVisible,
            last: this._lastVisible,
        }));
    }
    get layoutComplete() {
        // Lazily create promise
        if (!this._layoutCompletePromise) {
            this._layoutCompletePromise = new Promise((resolve, reject) => {
                this._layoutCompleteResolver = resolve;
                this._layoutCompleteRejecter = reject;
            });
        }
        return this._layoutCompletePromise;
    }
    _rejectLayoutCompletePromise(reason) {
        if (this._layoutCompleteRejecter !== null) {
            this._layoutCompleteRejecter(reason);
        }
        this._resetLayoutCompleteState();
    }
    _scheduleLayoutComplete() {
        // Don't do anything unless we have a pending promise
        // And only request a frame if we haven't already done so
        if (this._layoutCompletePromise && this._pendingLayoutComplete === null) {
            // Wait one additional frame to be sure the layout is stable
            this._pendingLayoutComplete = requestAnimationFrame(() => requestAnimationFrame(() => this._resolveLayoutCompletePromise()));
        }
    }
    _resolveLayoutCompletePromise() {
        if (this._layoutCompleteResolver !== null) {
            this._layoutCompleteResolver();
        }
        this._resetLayoutCompleteState();
    }
    _resetLayoutCompleteState() {
        this._layoutCompletePromise = null;
        this._layoutCompleteResolver = null;
        this._layoutCompleteRejecter = null;
        this._pendingLayoutComplete = null;
    }
    /**
     * Render and update the view at the next opportunity with the given
     * hostElement size.
     */
    _hostElementSizeChanged() {
        this._schedule(this._updateLayout);
    }
    // TODO (graynorton): Rethink how this works. Probably child loading is too specific
    // to have dedicated support for; might want some more generic lifecycle hooks for
    // layouts to use. Possibly handle measurement this way, too, or maybe that remains
    // a first-class feature?
    _childLoaded() { }
    // This is the callback for the ResizeObserver that watches the
    // virtualizer's children. We land here at the end of every virtualizer
    // update cycle that results in changes to physical items, and we also
    // end up here if one or more children change size independently of
    // the virtualizer update cycle.
    _childrenSizeChanged(changes) {
        // Only measure if the layout requires it
        if (this._layout?.measureChildren) {
            for (const change of changes) {
                this._toBeMeasured.set(change.target, change.contentRect);
            }
            this._measureChildren();
        }
        // If this is the end of an update cycle, we need to reset some
        // internal state. This should be a harmless no-op if we're handling
        // an out-of-cycle ResizeObserver callback, so we don't need to
        // distinguish between the two cases.
        this._scheduleLayoutComplete();
        this._itemsChanged = false;
        this._rangeChanged = false;
    }
}
function getMargins(el) {
    const style = window.getComputedStyle(el);
    return {
        marginTop: getMarginValue(style.marginTop),
        marginRight: getMarginValue(style.marginRight),
        marginBottom: getMarginValue(style.marginBottom),
        marginLeft: getMarginValue(style.marginLeft),
    };
}
function getMarginValue(value) {
    const float = value ? parseFloat(value) : NaN;
    return Number.isNaN(float) ? 0 : float;
}
// TODO (graynorton): Deal with iframes?
function getParentElement(el) {
    if (el.assignedSlot !== null) {
        return el.assignedSlot;
    }
    if (el.parentElement !== null) {
        return el.parentElement;
    }
    const parentNode = el.parentNode;
    if (parentNode && parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        return parentNode.host || null;
    }
    return null;
}
///
function getElementAncestors(el, includeSelf = false) {
    const ancestors = [];
    let parent = includeSelf ? el : getParentElement(el);
    while (parent !== null) {
        ancestors.push(parent);
        parent = getParentElement(parent);
    }
    return ancestors;
}
function getClippingAncestors(el, includeSelf = false) {
    let foundFixed = false;
    return getElementAncestors(el, includeSelf).filter((a) => {
        if (foundFixed) {
            return false;
        }
        const style = getComputedStyle(a);
        foundFixed = style.position === 'fixed';
        return style.overflow !== 'visible';
    });
}

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const defaultKeyFunction = (item) => item;
const defaultRenderItem = (item, idx) => b `${idx}: ${JSON.stringify(item, null, 2)}`;
class VirtualizeDirective extends f {
    constructor(part) {
        super(part);
        this._virtualizer = null;
        this._first = 0;
        this._last = -1;
        this._renderItem = (item, idx) => defaultRenderItem(item, idx + this._first);
        this._keyFunction = (item, idx) => defaultKeyFunction(item, idx + this._first);
        this._items = [];
        if (part.type !== t$1.CHILD) {
            throw new Error('The virtualize directive can only be used in child expressions');
        }
    }
    render(config) {
        if (config) {
            this._setFunctions(config);
        }
        const itemsToRender = [];
        if (this._first >= 0 && this._last >= this._first) {
            for (let i = this._first; i <= this._last; i++) {
                itemsToRender.push(this._items[i]);
            }
        }
        return c$1(itemsToRender, this._keyFunction, this._renderItem);
    }
    update(part, [config]) {
        this._setFunctions(config);
        const itemsChanged = this._items !== config.items;
        this._items = config.items || [];
        if (this._virtualizer) {
            this._updateVirtualizerConfig(part, config);
        }
        else {
            this._initialize(part, config);
        }
        return itemsChanged ? E : this.render();
    }
    async _updateVirtualizerConfig(part, config) {
        const compatible = await this._virtualizer.updateLayoutConfig(config.layout || {});
        if (!compatible) {
            const hostElement = part.parentNode;
            this._makeVirtualizer(hostElement, config);
        }
        this._virtualizer.items = this._items;
    }
    _setFunctions(config) {
        const { renderItem, keyFunction } = config;
        if (renderItem) {
            this._renderItem = (item, idx) => renderItem(item, idx + this._first);
        }
        if (keyFunction) {
            this._keyFunction = (item, idx) => keyFunction(item, idx + this._first);
        }
    }
    _makeVirtualizer(hostElement, config) {
        if (this._virtualizer) {
            this._virtualizer.disconnected();
        }
        const { layout, scroller, items } = config;
        this._virtualizer = new Virtualizer({ hostElement, layout, scroller });
        this._virtualizer.items = items;
        this._virtualizer.connected();
    }
    _initialize(part, config) {
        const hostElement = part.parentNode;
        if (hostElement && hostElement.nodeType === 1) {
            hostElement.addEventListener('rangeChanged', (e) => {
                this._first = e.first;
                this._last = e.last;
                this.setValue(this.render());
            });
            this._makeVirtualizer(hostElement, config);
        }
    }
    disconnected() {
        this._virtualizer?.disconnected();
    }
    reconnected() {
        this._virtualizer?.connected();
    }
}
const virtualize = e(VirtualizeDirective);

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class LitVirtualizer extends i$2 {
    constructor() {
        super(...arguments);
        this.items = [];
        this.renderItem = defaultRenderItem;
        this.keyFunction = defaultKeyFunction;
        this.layout = {};
        this.scroller = false;
    }
    createRenderRoot() {
        return this;
    }
    render() {
        const { items, renderItem, keyFunction, layout, scroller } = this;
        return b `${virtualize({
            items,
            renderItem,
            keyFunction,
            layout,
            scroller,
        })}`;
    }
    element(index) {
        return this[virtualizerRef]?.element(index);
    }
    get layoutComplete() {
        return this[virtualizerRef]?.layoutComplete;
    }
    /**
     * This scrollToIndex() shim is here to provide backwards compatibility with other 0.x versions of
     * lit-virtualizer. It is deprecated and will likely be removed in the 1.0.0 release.
     */
    scrollToIndex(index, position = 'start') {
        this.element(index)?.scrollIntoView({ block: position });
    }
}
__decorate([
    n$1({ attribute: false })
], LitVirtualizer.prototype, "items", void 0);
__decorate([
    n$1()
], LitVirtualizer.prototype, "renderItem", void 0);
__decorate([
    n$1()
], LitVirtualizer.prototype, "keyFunction", void 0);
__decorate([
    n$1({ attribute: false })
], LitVirtualizer.prototype, "layout", void 0);
__decorate([
    n$1({ reflect: true, type: Boolean })
], LitVirtualizer.prototype, "scroller", void 0);

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * Import this module to declare the lit-virtualizer custom element.
 */
customElements.define('lit-virtualizer', LitVirtualizer);

const comboboxStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.combobox-field{display:flex;flex-direction:column;gap:var(--vi-combobox-spacing-field-gap, var(--vi-spacing-xs, .5rem));width:100%;position:relative}.combobox-control{display:flex;align-items:center;flex-wrap:wrap;gap:var(--vi-combobox-tag-gap, var(--vi-spacing-xs, .5rem));box-sizing:border-box;width:100%;min-height:var(--vi-combobox-min-height, 40px);padding:var(--vi-combobox-padding-block, var(--vi-spacing-xs, .5rem)) var(--vi-combobox-padding-inline, var(--vi-spacing-sm, .75rem));background-color:var(--vi-combobox-background, var(--vi-color-background, #ffffff));border:var(--vi-combobox-border-width, var(--vi-border-width-thin, 1px)) solid var(--vi-combobox-border-color, var(--vi-border-03, #e0e0e0));border-radius:var(--vi-combobox-border-radius, var(--vi-border-radius-lg, 8px));font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-size:var(--vi-combobox-font-size, var(--vi-font-size-base, .875rem));color:var(--vi-combobox-text-color, var(--vi-text-primary, #111827));transition:border-color .15s ease,box-shadow .15s ease;cursor:text;position:relative}.combobox-control:hover:not(.is-disabled):not(.is-focused){border-color:var(--vi-combobox-border-color-hover, var(--vi-border-04, #bdbdbd))}.combobox-control.is-focused,.combobox-control:focus-within{border-color:var(--vi-combobox-border-color-focus, var(--vi-focus, #3676d0));outline:var(--vi-combobox-border-width-focus, var(--vi-border-width-base, 2px)) solid var(--vi-combobox-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:0;box-shadow:var(--vi-focus-ring-shadow, 0 0 0 3px var(--vi-focus-ring-color, var(--vi-color-blue-200, #cee6ff)))}.combobox-control.is-disabled{opacity:var(--vi-combobox-disabled-opacity, .6);pointer-events:none;cursor:not-allowed}.combobox-control.is-invalid{border-color:var(--vi-combobox-error-color, var(--vi-color-error, #ef4444))}.combobox-control.is-invalid.is-focused,.combobox-control.is-invalid:focus-within{outline-color:var(--vi-combobox-error-color, var(--vi-color-error, #ef4444))}.combobox-control.is-valid{border-color:var(--vi-combobox-success-color, var(--vi-color-success, #489167))}.combobox-input{appearance:none;-webkit-appearance:none;flex:1 1 60px;min-width:60px;border:none;outline:none;background:transparent;padding:0;margin:0;font-family:inherit;font-size:inherit;color:inherit;line-height:var(--vi-line-height-normal, 1.5715)}.combobox-input::placeholder{color:var(--vi-combobox-placeholder-color, var(--vi-text-secondary, #4b5563))}.combobox-chevron{margin-left:auto;color:var(--vi-combobox-chevron-color, var(--vi-text-secondary, #4b5563));flex-shrink:0;transition:transform .2s cubic-bezier(.2,0,0,1);transform-origin:center center;pointer-events:auto;cursor:pointer;width:18px;height:18px}.combobox-control.is-open .combobox-chevron{transform:rotate(180deg)}.combobox-clear-btn{appearance:none;-webkit-appearance:none;background:transparent;border:none;padding:2px;margin:0;display:inline-flex;align-items:center;justify-content:center;color:var(--vi-combobox-clear-color, var(--vi-text-secondary, #4b5563));cursor:pointer;border-radius:var(--vi-border-radius-sm, 4px);transition:color .15s ease,background-color .15s ease;width:20px;height:20px;flex-shrink:0}.combobox-clear-btn:hover{color:var(--vi-combobox-clear-hover-color, var(--vi-text-primary, #111827));background-color:var(--vi-combobox-clear-hover-bg, var(--vi-layer-hover-01, #f3f4f6))}.combobox-trigger{appearance:none;-webkit-appearance:none;flex:1 1 0px;min-width:0;display:inline-flex;align-items:center;border:none;outline:none;background:transparent;padding:0;margin:0;font-family:inherit;font-size:inherit;color:inherit;line-height:inherit;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}.combobox-trigger.is-placeholder{color:var(--vi-combobox-placeholder-color, var(--vi-text-secondary, #4b5563))}.combobox-tags{display:flex;flex-wrap:wrap;align-items:center;gap:var(--vi-combobox-tag-gap, var(--vi-spacing-xs, .5rem))}.combobox-listbox{box-sizing:border-box;position:absolute;top:0;left:0;z-index:var(--vi-combobox-listbox-z-index, 1000);height:var(--vi-combobox-listbox-height, auto);max-height:var(--vi-combobox-listbox-max-height, 280px);overflow-y:auto;background-color:var(--vi-combobox-listbox-background, var(--vi-layer-01, #ffffff));border:1px solid var(--vi-combobox-listbox-border-color, var(--vi-border-02, #eeeeee));border-radius:var(--vi-combobox-listbox-border-radius, var(--vi-border-radius-lg, 8px));box-shadow:var(--vi-combobox-listbox-shadow, var(--vi-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, .05), 0 10px 15px -3px rgba(0, 0, 0, .1)));padding:4px 0;margin:0;opacity:0;visibility:hidden;transform:translateY(-6px) scale(.98);transform-origin:top center;transition:opacity .16s cubic-bezier(.2,0,0,1),transform .16s cubic-bezier(.2,0,0,1),visibility .16s cubic-bezier(.2,0,0,1);pointer-events:none}.combobox-listbox[data-placement^=top]{transform-origin:bottom center;transform:translateY(6px) scale(.98)}.combobox-listbox[open],.combobox-listbox.is-open{opacity:1;visibility:visible;transform:translateY(0) scale(1);pointer-events:auto}.combobox-list{list-style:none;margin:0;padding:0}.combobox-option{display:flex;align-items:center;justify-content:space-between;gap:var(--vi-combobox-option-gap, var(--vi-spacing-xs, .5rem));min-height:var(--vi-combobox-option-height, 40px);padding:var(--vi-combobox-option-padding-block, var(--vi-spacing-xs, .5rem)) var(--vi-combobox-option-padding-inline, var(--vi-spacing-sm, .75rem));font-size:var(--vi-combobox-option-font-size, var(--vi-font-size-base, .875rem));color:var(--vi-combobox-option-color, var(--vi-text-primary, #111827));cursor:pointer;-webkit-user-select:none;user-select:none}.combobox-option:hover,.combobox-option.is-active{background-color:var(--vi-combobox-option-hover-bg, var(--vi-layer-hover-01, #f3f4f6))}.combobox-option.is-selected{background-color:var(--vi-combobox-option-selected-bg, var(--vi-layer-02, #f3f4f6));color:var(--vi-combobox-option-selected-color, var(--vi-color-primary, #3676d0));font-weight:var(--vi-font-weight-semibold, 600)}.combobox-option.is-disabled{color:var(--vi-combobox-option-disabled-color, var(--vi-text-disabled, #9e9e9e));cursor:not-allowed;pointer-events:none;opacity:.6}.combobox-option-content{display:flex;flex-direction:column;flex:1 1 auto;overflow:hidden}.combobox-option-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.combobox-option-description{font-size:var(--vi-combobox-option-description-font-size, var(--vi-font-size-sm, .8125rem));color:var(--vi-combobox-option-description-color, var(--vi-text-secondary, #4b5563));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.combobox-option-action{display:flex;align-items:center;margin-left:auto;z-index:1}.combobox-mark{background-color:var(--vi-combobox-mark-background, var(--vi-typeahead-highlight-bg, #ebf5ff));color:var(--vi-combobox-mark-color, var(--vi-typeahead-highlight-color, #3676d0));border-radius:var(--vi-border-radius-sm, 4px);padding:0 1px}.combobox-group-header{padding:8px var(--vi-combobox-group-padding-inline, var(--vi-spacing-sm, .75rem)) 4px;font-size:var(--vi-combobox-group-font-size, var(--vi-font-size-xs, .75rem));font-weight:var(--vi-combobox-group-font-weight, var(--vi-font-weight-semibold, 600));color:var(--vi-combobox-group-color, var(--vi-text-secondary, #4b5563));text-transform:uppercase;letter-spacing:var(--vi-letter-spacing-wide, .025em);-webkit-user-select:none;user-select:none}.combobox-empty,.combobox-loading{padding:var(--vi-spacing-sm, .75rem);text-align:center;font-size:var(--vi-font-size-sm, .8125rem);color:var(--vi-text-secondary, #4b5563)}.combobox-helper{font-size:var(--vi-combobox-validation-font-size, var(--vi-font-size-xs, .75rem));color:var(--vi-combobox-helper-color, var(--vi-text-helper, #9e9e9e))}.combobox-validation{font-size:var(--vi-combobox-validation-font-size, var(--vi-font-size-xs, .75rem));color:var(--vi-combobox-error-color, var(--vi-color-error, #ef4444))}.combobox-validation.is-valid{color:var(--vi-combobox-success-color, var(--vi-color-success, #489167))}@media(prefers-reduced-motion:reduce){.combobox-control,.combobox-option{transition:none}}}:host{display:block}:host([hidden]){display:none!important}:host([searchable=false]) .combobox-control{cursor:pointer}.combobox-listbox{overflow-y:auto;max-height:var(--vi-combobox-listbox-max-height, 18.75rem)}.combobox-option{width:100%;box-sizing:border-box;border-bottom:1px solid var(--vi-border-02, #eeeeee)}.combobox-option:last-child{border-bottom:none}";

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
var _dec, _initClass, _ValidityMixin, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _init_value, _init_mode, _init_disabled, _init_placeholder, _init_name, _init_loading, _init_maxTags, _init_debounce, _init_minChars, _init_clearable, _init_searchable, _init_noOptionsText, _init_createText, _init_removeCustomItemText, _init_virtualize, _init_groupSort, _init_matchFrom, _init_highlightMatch, _init_placement, _init_openOnFocus, _init_open, _init_hoist, _init_flipBoundary, _init_flipBoundaryElement, _init_filterFn, _init_renderOption, _init_renderCreateOption, _init__sentinelTopEl, _init__sentinelBottomEl, _init__activeIndex, _init__slottedItems, _init__inputEl, _init__triggerEl, _init__listboxEl, _init__controlEl, _initProto;
registerIcons([
    chevronDownIcon,
    checkIcon,
    xIcon,
    minusIcon
]);
let _ViCombobox;
_dec = t('vi-combobox'), _dec1 = n$1({
    reflect: true
}), _dec2 = n$1({
    type: String,
    reflect: true
}), _dec3 = n$1({
    type: Boolean,
    reflect: true
}), _dec4 = n$1({
    type: String,
    reflect: true
}), _dec5 = n$1({
    type: String,
    reflect: true
}), _dec6 = n$1({
    type: Boolean,
    reflect: true
}), _dec7 = n$1({
    type: Number,
    attribute: 'max-tags'
}), _dec8 = n$1({
    type: Number
}), _dec9 = n$1({
    type: Number,
    attribute: 'min-chars'
}), _dec10 = n$1({
    type: Boolean
}), _dec11 = n$1({
    type: Boolean,
    reflect: true,
    converter: {
        fromAttribute: (val)=>val !== 'false' && val !== null
    }
}), _dec12 = n$1({
    type: String,
    attribute: 'no-options-text'
}), _dec13 = n$1({
    type: String,
    attribute: 'create-text'
}), _dec14 = n$1({
    type: String,
    attribute: 'remove-custom-item-text'
}), _dec15 = n$1({
    type: Boolean
}), _dec16 = n$1({
    type: String,
    attribute: 'group-sort'
}), _dec17 = n$1({
    type: String,
    attribute: 'match-from'
}), _dec18 = n$1({
    type: Boolean,
    attribute: 'highlight-match'
}), _dec19 = n$1({
    type: String
}), _dec20 = n$1({
    type: Boolean,
    attribute: 'open-on-focus'
}), _dec21 = n$1({
    type: Boolean,
    reflect: true
}), _dec22 = n$1({
    type: Boolean
}), _dec23 = n$1({
    type: String,
    attribute: 'flip-boundary'
}), _dec24 = n$1({
    attribute: false
}), _dec25 = n$1({
    attribute: false
}), _dec26 = n$1({
    attribute: false
}), _dec27 = n$1({
    attribute: false
}), _dec28 = e$1('.combobox-sentinel-top'), _dec29 = e$1('.combobox-sentinel-bottom'), _dec30 = n$1({
    attribute: false
}), _dec31 = r$1(), _dec32 = r$1(), _dec33 = e$1('.combobox-input'), _dec34 = e$1('.combobox-trigger'), _dec35 = e$1('.combobox-listbox'), _dec36 = e$1('.combobox-control');
new class extends _identity {
    constructor(){
        super(_ViCombobox), _initClass();
    }
    static{
        class ViCombobox extends (_ValidityMixin = ValidityMixin(FocusableMixin(ViElement))) {
            static{
                ({ e: [_init_value, _init_mode, _init_disabled, _init_placeholder, _init_name, _init_loading, _init_maxTags, _init_debounce, _init_minChars, _init_clearable, _init_searchable, _init_noOptionsText, _init_createText, _init_removeCustomItemText, _init_virtualize, _init_groupSort, _init_matchFrom, _init_highlightMatch, _init_placement, _init_openOnFocus, _init_open, _init_hoist, _init_flipBoundary, _init_flipBoundaryElement, _init_filterFn, _init_renderOption, _init_renderCreateOption, _init__sentinelTopEl, _init__sentinelBottomEl, _init__activeIndex, _init__slottedItems, _init__inputEl, _init__triggerEl, _init__listboxEl, _init__controlEl, _initProto], c: [_ViCombobox, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "value"
                    ],
                    [
                        _dec2,
                        1,
                        "mode"
                    ],
                    [
                        _dec3,
                        1,
                        "disabled"
                    ],
                    [
                        _dec4,
                        1,
                        "placeholder"
                    ],
                    [
                        _dec5,
                        1,
                        "name"
                    ],
                    [
                        _dec6,
                        1,
                        "loading"
                    ],
                    [
                        _dec7,
                        1,
                        "maxTags"
                    ],
                    [
                        _dec8,
                        1,
                        "debounce"
                    ],
                    [
                        _dec9,
                        1,
                        "minChars"
                    ],
                    [
                        _dec10,
                        1,
                        "clearable"
                    ],
                    [
                        _dec11,
                        1,
                        "searchable"
                    ],
                    [
                        _dec12,
                        1,
                        "noOptionsText"
                    ],
                    [
                        _dec13,
                        1,
                        "createText"
                    ],
                    [
                        _dec14,
                        1,
                        "removeCustomItemText"
                    ],
                    [
                        _dec15,
                        1,
                        "virtualize"
                    ],
                    [
                        _dec16,
                        1,
                        "groupSort"
                    ],
                    [
                        _dec17,
                        1,
                        "matchFrom"
                    ],
                    [
                        _dec18,
                        1,
                        "highlightMatch"
                    ],
                    [
                        _dec19,
                        1,
                        "placement"
                    ],
                    [
                        _dec20,
                        1,
                        "openOnFocus"
                    ],
                    [
                        _dec21,
                        1,
                        "open"
                    ],
                    [
                        _dec22,
                        1,
                        "hoist"
                    ],
                    [
                        _dec23,
                        1,
                        "flipBoundary"
                    ],
                    [
                        _dec24,
                        1,
                        "flipBoundaryElement"
                    ],
                    [
                        _dec25,
                        1,
                        "filterFn"
                    ],
                    [
                        _dec26,
                        1,
                        "renderOption"
                    ],
                    [
                        _dec27,
                        1,
                        "renderCreateOption"
                    ],
                    [
                        _dec28,
                        1,
                        "_sentinelTopEl"
                    ],
                    [
                        _dec29,
                        1,
                        "_sentinelBottomEl"
                    ],
                    [
                        _dec30,
                        4,
                        "options"
                    ],
                    [
                        _dec31,
                        1,
                        "_activeIndex"
                    ],
                    [
                        _dec32,
                        1,
                        "_slottedItems"
                    ],
                    [
                        _dec33,
                        1,
                        "_inputEl"
                    ],
                    [
                        _dec34,
                        1,
                        "_triggerEl"
                    ],
                    [
                        _dec35,
                        1,
                        "_listboxEl"
                    ],
                    [
                        _dec36,
                        1,
                        "_controlEl"
                    ]
                ], [
                    _dec
                ], _ValidityMixin));
            }
            static styles = i`${r$2(comboboxStyles)}`;
            #___private_value_1 = (_initProto(this), _init_value(this, ''));
            get value() {
                return this.#___private_value_1;
            }
            set value(_v) {
                this.#___private_value_1 = _v;
            }
            #___private_mode_2 = _init_mode(this, 'single');
            get mode() {
                return this.#___private_mode_2;
            }
            set mode(_v) {
                this.#___private_mode_2 = _v;
            }
            #___private_disabled_3 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_3;
            }
            set disabled(_v) {
                this.#___private_disabled_3 = _v;
            }
            _testValidity() {
                const selected = this._getSelectedValues();
                return {
                    valueMissing: this.required && selected.length === 0
                };
            }
            connectedCallback() {
                super.connectedCallback();
                this.addEventListener('keydown', this._handleKeyDown);
                this.addEventListener('vi-combobox-item-select', this._handleSlottedItemSelect);
                document.addEventListener('click', this._handleOutsideClick);
            }
            _handleSlottedItemSelect = (e)=>{
                e.stopPropagation();
                const item = e.detail.item;
                this._selectOption({
                    value: item.value,
                    label: item.label || item.value,
                    group: item.group || undefined,
                    disabled: item.disabled,
                    icon: item.icon || undefined,
                    description: item.description || undefined,
                    data: item.data
                });
            };
            #___private_placeholder_4 = _init_placeholder(this, 'Search...');
            get placeholder() {
                return this.#___private_placeholder_4;
            }
            set placeholder(_v) {
                this.#___private_placeholder_4 = _v;
            }
            #___private_name_5 = _init_name(this, '');
            get name() {
                return this.#___private_name_5;
            }
            set name(_v) {
                this.#___private_name_5 = _v;
            }
            #___private_loading_6 = _init_loading(this, false);
            get loading() {
                return this.#___private_loading_6;
            }
            set loading(_v) {
                this.#___private_loading_6 = _v;
            }
            #___private_maxTags_7 = _init_maxTags(this, undefined);
            get maxTags() {
                return this.#___private_maxTags_7;
            }
            set maxTags(_v) {
                this.#___private_maxTags_7 = _v;
            }
            #___private_debounce_8 = _init_debounce(this, 300);
            get debounce() {
                return this.#___private_debounce_8;
            }
            set debounce(_v) {
                this.#___private_debounce_8 = _v;
            }
            #___private_minChars_9 = _init_minChars(this, 1);
            get minChars() {
                return this.#___private_minChars_9;
            }
            set minChars(_v) {
                this.#___private_minChars_9 = _v;
            }
            #___private_clearable_10 = _init_clearable(this, false);
            get clearable() {
                return this.#___private_clearable_10;
            }
            set clearable(_v) {
                this.#___private_clearable_10 = _v;
            }
            #___private_searchable_11 = _init_searchable(this, true);
            get searchable() {
                return this.#___private_searchable_11;
            }
            set searchable(_v) {
                this.#___private_searchable_11 = _v;
            }
            #___private_noOptionsText_12 = _init_noOptionsText(this, 'No results found');
            get noOptionsText() {
                return this.#___private_noOptionsText_12;
            }
            set noOptionsText(_v) {
                this.#___private_noOptionsText_12 = _v;
            }
            #___private_createText_13 = _init_createText(this, 'Create "{query}"');
            get createText() {
                return this.#___private_createText_13;
            }
            set createText(_v) {
                this.#___private_createText_13 = _v;
            }
            #___private_removeCustomItemText_14 = _init_removeCustomItemText(this, 'Remove custom item');
            get removeCustomItemText() {
                return this.#___private_removeCustomItemText_14;
            }
            set removeCustomItemText(_v) {
                this.#___private_removeCustomItemText_14 = _v;
            }
            #___private_virtualize_15 = _init_virtualize(this, false);
            get virtualize() {
                return this.#___private_virtualize_15;
            }
            set virtualize(_v) {
                this.#___private_virtualize_15 = _v;
            }
            #___private_groupSort_16 = _init_groupSort(this, 'none');
            get groupSort() {
                return this.#___private_groupSort_16;
            }
            set groupSort(_v) {
                this.#___private_groupSort_16 = _v;
            }
            #___private_matchFrom_17 = _init_matchFrom(this, 'any');
            get matchFrom() {
                return this.#___private_matchFrom_17;
            }
            set matchFrom(_v) {
                this.#___private_matchFrom_17 = _v;
            }
            #___private_highlightMatch_18 = _init_highlightMatch(this, true);
            get highlightMatch() {
                return this.#___private_highlightMatch_18;
            }
            set highlightMatch(_v) {
                this.#___private_highlightMatch_18 = _v;
            }
            #___private_placement_19 = _init_placement(this, 'bottom-start');
            get placement() {
                return this.#___private_placement_19;
            }
            set placement(_v) {
                this.#___private_placement_19 = _v;
            }
            #___private_openOnFocus_20 = _init_openOnFocus(this, false);
            get openOnFocus() {
                return this.#___private_openOnFocus_20;
            }
            set openOnFocus(_v) {
                this.#___private_openOnFocus_20 = _v;
            }
            #___private_open_21 = _init_open(this, false);
            get open() {
                return this.#___private_open_21;
            }
            set open(_v) {
                this.#___private_open_21 = _v;
            }
            #___private_hoist_22 = _init_hoist(this, false);
            get hoist() {
                return this.#___private_hoist_22;
            }
            set hoist(_v) {
                this.#___private_hoist_22 = _v;
            }
            #___private_flipBoundary_23 = _init_flipBoundary(this, '');
            get flipBoundary() {
                return this.#___private_flipBoundary_23;
            }
            set flipBoundary(_v) {
                this.#___private_flipBoundary_23 = _v;
            }
            #___private_flipBoundaryElement_24 = _init_flipBoundaryElement(this, null);
            get flipBoundaryElement() {
                return this.#___private_flipBoundaryElement_24;
            }
            set flipBoundaryElement(_v) {
                this.#___private_flipBoundaryElement_24 = _v;
            }
            #___private_filterFn_25 = _init_filterFn(this, null);
            get filterFn() {
                return this.#___private_filterFn_25;
            }
            set filterFn(_v) {
                this.#___private_filterFn_25 = _v;
            }
            #___private_renderOption_26 = _init_renderOption(this, null);
            get renderOption() {
                return this.#___private_renderOption_26;
            }
            set renderOption(_v) {
                this.#___private_renderOption_26 = _v;
            }
            #___private_renderCreateOption_27 = _init_renderCreateOption(this, null);
            get renderCreateOption() {
                return this.#___private_renderCreateOption_27;
            }
            set renderCreateOption(_v) {
                this.#___private_renderCreateOption_27 = _v;
            }
            _optionsList = [];
            #___private__sentinelTopEl_28 = _init__sentinelTopEl(this);
            get _sentinelTopEl() {
                return this.#___private__sentinelTopEl_28;
            }
            set _sentinelTopEl(_v) {
                this.#___private__sentinelTopEl_28 = _v;
            }
            #___private__sentinelBottomEl_29 = _init__sentinelBottomEl(this);
            get _sentinelBottomEl() {
                return this.#___private__sentinelBottomEl_29;
            }
            set _sentinelBottomEl(_v) {
                this.#___private__sentinelBottomEl_29 = _v;
            }
            /**
   * Manages intersection observers for infinite scrolling.
   * Registers itself via Lit's ReactiveController lifecycle.
   */ _infiniteScrollController = new InfiniteScrollController(this, {
                enabled: ()=>this.open,
                listbox: ()=>this._listboxEl,
                sentinelTop: ()=>this._sentinelTopEl,
                sentinelBottom: ()=>this._sentinelBottomEl
            });
            _filterController = new FilterController(this, {
                getSlottedItems: ()=>this._slottedItems,
                getVisibleSlottedItems: ()=>this._visibleSlottedItems,
                setSlottedActiveIndex: (index)=>this._updateSlottedActiveState(index),
                setLoading: (loading)=>{
                    this.loading = loading;
                },
                resetActiveIndex: ()=>{
                    this._activeIndex = -1;
                },
                setOptionsList: (opts)=>{
                    this._optionsList = opts;
                },
                rebuildOptionDataMap: ()=>this._rebuildOptionDataMap(),
                open: ()=>{
                    this.open = true;
                },
                isOpen: ()=>this.open
            });
            _keyboardController = new ListboxKeyboardController(this, {
                getActiveIndex: ()=>this._activeIndex,
                setActiveIndex: (index)=>{
                    this._activeIndex = index;
                },
                getFilteredOptions: ()=>this.filteredOptions,
                getSlottedItems: ()=>this._slottedItems,
                getVisibleSlottedItems: ()=>this._visibleSlottedItems,
                getSelectedValues: ()=>this._getSelectedValues(),
                updateSlottedActiveState: (index)=>this._updateSlottedActiveState(index),
                scrollToActiveIndex: ()=>this._scrollToActiveIndex(),
                selectOption: (opt)=>this._selectOption(opt),
                handleCreate: ()=>this._handleCreate(),
                removeTag: (val)=>this._removeTag(val),
                close: ()=>this.close(),
                openDropdown: ()=>{
                    this.open = true;
                },
                getQuery: ()=>this._query
            });
            get _query() {
                return this._filterController.query;
            }
            set _query(val) {
                if (this._filterController.query !== val) {
                    this._filterController.query = val;
                    if (this._slottedItems?.length > 0) {
                        this._filterController.applySlottedFilter(val, this._slottedItems);
                        this._slottedItems.forEach((item)=>{
                            item.highlightText = this.highlightMatch ? val : '';
                        });
                    }
                    this.requestUpdate();
                }
            }
            _floatingController = new FloatingController(this, {
                reference: ()=>this._controlEl,
                floating: ()=>this._listboxEl,
                placement: ()=>this.placement,
                offset: 4,
                hoist: ()=>this.hoist,
                boundary: ()=>this.flipBoundaryElement || this.flipBoundary || null,
                matchWidth: true
            });
            set options(val) {
                if (typeof val === 'function') {
                    this._optionsLoader = val;
                } else {
                    this._optionsLoader = null;
                    this._optionsList = Array.isArray(val) ? [
                        ...val
                    ] : [];
                    this._rebuildOptionDataMap();
                }
                this.requestUpdate('options');
            }
            get options() {
                return this._optionsLoader || this._optionsList;
            }
            _optionsLoader = null;
            // Custom data payload mapping: value -> data
            _optionDataMap = new Map();
            // Maps option value to a unique ID for aria-activedescendant
            _optionIdMap = new Map();
            _getOptionId(value) {
                if (!this._optionIdMap.has(value)) {
                    this._optionIdMap.set(value, `opt-${Math.random().toString(36).substring(2, 11)}`);
                }
                return this._optionIdMap.get(value) ?? '';
            }
            #___private__activeIndex_30 = _init__activeIndex(this, -1);
            get _activeIndex() {
                return this.#___private__activeIndex_30;
            }
            set _activeIndex(_v) {
                this.#___private__activeIndex_30 = _v;
            }
            #___private__slottedItems_31 = _init__slottedItems(this, []);
            get _slottedItems() {
                return this.#___private__slottedItems_31;
            }
            set _slottedItems(_v) {
                this.#___private__slottedItems_31 = _v;
            }
            #___private__inputEl_32 = _init__inputEl(this);
            get _inputEl() {
                return this.#___private__inputEl_32;
            }
            set _inputEl(_v) {
                this.#___private__inputEl_32 = _v;
            }
            #___private__triggerEl_33 = _init__triggerEl(this);
            get _triggerEl() {
                return this.#___private__triggerEl_33;
            }
            set _triggerEl(_v) {
                this.#___private__triggerEl_33 = _v;
            }
            #___private__listboxEl_34 = _init__listboxEl(this);
            get _listboxEl() {
                return this.#___private__listboxEl_34;
            }
            set _listboxEl(_v) {
                this.#___private__listboxEl_34 = _v;
            }
            #___private__controlEl_35 = _init__controlEl(this);
            get _controlEl() {
                return this.#___private__controlEl_35;
            }
            set _controlEl(_v) {
                this.#___private__controlEl_35 = _v;
            }
            _slotMutationObserver = null;
            get _focusableElement() {
                return (this.isSearchable ? this._inputEl : this._triggerEl) ?? null;
            }
            get isSearchable() {
                if (this.mode === 'tags' || this.mode === 'creatable') return true;
                return this.searchable;
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this.removeEventListener('keydown', this._handleKeyDown);
                this.removeEventListener('vi-combobox-item-select', this._handleSlottedItemSelect);
                document.removeEventListener('click', this._handleOutsideClick);
                if (this._slotMutationObserver) {
                    this._slotMutationObserver.disconnect();
                }
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
                if (changedProperties.has('value')) {
                    this._updateFormValue();
                    this._syncSlottedSelectedState();
                }
                if (changedProperties.has('open')) {
                    if (this.open) {
                        if (this.disabled) {
                            this.open = false;
                            return;
                        }
                        this._floatingController.start();
                        this._dispatch('vi-combobox-open');
                        // Set active index to first selected item if it exists
                        const selected = this._getSelectedValues();
                        if (selected.length > 0) {
                            if (this._slottedItems.length > 0) {
                                const idx = this._visibleSlottedItems.findIndex((i)=>i.value === selected[0]);
                                this._activeIndex = idx;
                                if (idx >= 0) this._updateSlottedActiveState(idx);
                            } else {
                                this._activeIndex = this.filteredOptions.findIndex((opt)=>opt.value === selected[0]);
                            }
                            this._scrollToActiveIndex();
                        } else {
                            this._activeIndex = -1;
                        }
                    } else {
                        this._activeIndex = -1;
                        this._query = '';
                        if (this._slottedItems.length > 0) {
                            this._filterController.resetSlottedVisibility(this._slottedItems);
                        }
                        this._floatingController.stop();
                        this._dispatch('vi-combobox-close');
                    }
                }
            }
            _observeSlottedItems() {
                const slot = this.shadowRoot?.querySelector('slot:not([name])');
                if (!slot) return;
                const updateItems = ()=>{
                    if (this._slotMutationObserver) {
                        this._slotMutationObserver.disconnect();
                    }
                    const assigned = slot.assignedElements({
                        flatten: true
                    });
                    const items = assigned.filter((el)=>el.tagName.toLowerCase() === 'vi-combobox-item');
                    this._slottedItems = items;
                    if (items.length > 0) {
                        // Assign stable IDs for aria-activedescendant cross-shadow reference
                        items.forEach((item)=>{
                            if (item.value) {
                                if (item.id) {
                                    this._optionIdMap.set(item.value, item.id);
                                } else {
                                    item.id = this._getOptionId(item.value);
                                }
                            }
                        });
                        this._optionsList = items.map((item)=>({
                                value: item.value,
                                label: item.label || item.value,
                                // Join searchText[] to a single corpus string; undefined = fall back to label+description
                                searchText: item.searchText.length > 0 ? item.searchText.join(' ') : undefined,
                                group: item.group || undefined,
                                disabled: item.disabled,
                                icon: item.icon || undefined,
                                description: item.description || undefined,
                                data: item.data
                            }));
                        this._rebuildOptionDataMap();
                        this._syncSlottedSelectedState();
                        // Re-apply filter if the dropdown is open with an active query
                        if (this._query && this.open) {
                            this._filterController.applySlottedFilter(this._query, this._slottedItems);
                        }
                        for (const item of this._slottedItems){
                            item.highlightText = this.highlightMatch ? this._query : '';
                        }
                    }
                    if (this._slotMutationObserver) {
                        this._slotMutationObserver.observe(this, {
                            childList: true,
                            subtree: true,
                            attributes: true,
                            attributeFilter: [
                                'value',
                                'label',
                                'search-text',
                                'group',
                                'disabled',
                                'icon',
                                'description'
                            ]
                        });
                    }
                };
                updateItems();
                if (!this._slotMutationObserver) {
                    this._slotMutationObserver = new MutationObserver(()=>updateItems());
                    this._slotMutationObserver.observe(this, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: [
                            'value',
                            'label',
                            'search-text',
                            'group',
                            'disabled',
                            'icon',
                            'description'
                        ]
                    });
                }
            }
            _rebuildOptionDataMap() {
                this._optionDataMap.clear();
                for (const opt of this._optionsList){
                    if (opt.data !== undefined) {
                        this._optionDataMap.set(opt.value, opt.data);
                    }
                }
            }
            _syncSlottedSelectedState() {
                const selectedValues = this._getSelectedValues();
                for (const item of this._slottedItems){
                    item.selected = selectedValues.includes(item.value);
                }
            }
            _getSelectedValues() {
                if (Array.isArray(this.value)) return this.value;
                if (typeof this.value === 'string' && this.value) {
                    return this.mode === 'multi' || this.mode === 'tags' ? this.value.split(',').map((v)=>v.trim()).filter(Boolean) : [
                        this.value
                    ];
                }
                return [];
            }
            _updateFormValue() {
                const selected = this._getSelectedValues();
                if (this.mode === 'multi' || this.mode === 'tags') {
                    const formData = new FormData();
                    for (const val of selected){
                        formData.append(this.name || 'value', val);
                    }
                    this._internals.setFormValue(formData);
                } else {
                    this._internals.setFormValue(selected[0] || '');
                }
            }
            // --- Filter & Search Logic ---
            get filteredOptions() {
                // Return the full list when:
                //   – not searchable
                //   – query is empty
                //   – query is shorter than minChars (avoids premature filtering)
                //   – an async loader is driving results (loader handles its own filtering)
                let results;
                if (!this.isSearchable || !this._query || this._query.length < this.minChars || this._optionsLoader) {
                    results = this._optionsList;
                } else if (this._slottedItems.length > 0) {
                    results = this._optionsList;
                } else {
                    const q = this._query.toLowerCase();
                    const filterFn = this.filterFn;
                    if (filterFn) {
                        results = this._optionsList.filter((opt)=>filterFn(opt, this._query));
                    } else {
                        results = this._optionsList.filter((opt)=>{
                            const corpus = opt.searchText ? opt.searchText.toLowerCase() : [
                                opt.label,
                                opt.description
                            ].filter(Boolean).join(' ').toLowerCase();
                            return this.matchFrom === 'start' ? corpus.startsWith(q) : corpus.includes(q);
                        });
                    }
                }
                if (this.groupSort !== 'none') {
                    const groupsMap = new Map();
                    for (const opt of results){
                        const g = opt.group || '';
                        let groupArr = groupsMap.get(g);
                        if (!groupArr) {
                            groupArr = [];
                            groupsMap.set(g, groupArr);
                        }
                        groupArr.push(opt);
                    }
                    const groupEntries = Array.from(groupsMap.entries());
                    if (this.groupSort === 'asc') {
                        groupEntries.sort(([a], [b])=>a.localeCompare(b));
                    } else if (this.groupSort === 'desc') {
                        groupEntries.sort(([a], [b])=>b.localeCompare(a));
                    }
                    results = groupEntries.flatMap(([, opts])=>opts);
                }
                return results;
            }
            _handleInput(e) {
                this._filterController.handleInput(e);
            }
            // --- Selection Logic ---
            _selectOption(opt) {
                if (opt.disabled) return;
                const current = this._getSelectedValues();
                let nextValue;
                if (this.mode === 'multi' || this.mode === 'tags') {
                    if (this.maxTags && current.length >= this.maxTags && !current.includes(opt.value)) {
                        return;
                    }
                    const updated = current.includes(opt.value) ? current.filter((v)=>v !== opt.value) : [
                        ...current,
                        opt.value
                    ];
                    nextValue = updated;
                } else {
                    nextValue = opt.value;
                    this.close();
                }
                this.value = nextValue;
                this._query = '';
                const payloadData = opt.data !== undefined ? opt.data : this._optionDataMap.get(opt.value);
                this._dispatch('vi-combobox-change', {
                    value: nextValue,
                    label: opt.label,
                    option: opt,
                    data: payloadData
                });
            }
            _removeTag(val, e) {
                e?.stopPropagation();
                const current = this._getSelectedValues();
                const updated = current.filter((v)=>v !== val);
                this.value = updated;
                const tagData = this._optionDataMap.get(val);
                this._dispatch('vi-combobox-remove', {
                    value: val,
                    data: tagData
                });
                this._dispatch('vi-combobox-change', {
                    value: updated
                });
            }
            _handleCreate() {
                if (!this._query.trim()) return;
                const val = this._query.trim();
                // Persist the created item in the main list locally
                if (!this._optionsList.some((o)=>o.value === val)) {
                    this._optionsList = [
                        ...this._optionsList,
                        {
                            value: val,
                            label: val,
                            data: {
                                isTemporary: true
                            }
                        }
                    ];
                    this._rebuildOptionDataMap();
                }
                if (this.mode === 'tags') {
                    const current = this._getSelectedValues();
                    if (!current.includes(val)) {
                        const next = [
                            ...current,
                            val
                        ];
                        this.value = next;
                        this._dispatch('vi-combobox-create', {
                            value: val
                        });
                        this._dispatch('vi-combobox-change', {
                            value: next
                        });
                    }
                    this._query = '';
                } else if (this.mode === 'creatable') {
                    this.value = val;
                    this._dispatch('vi-combobox-create', {
                        value: val
                    });
                    this._dispatch('vi-combobox-change', {
                        value: val,
                        label: val
                    });
                    this.close();
                    this._query = '';
                }
            }
            _handleDeleteTempItem(opt, e) {
                e.stopPropagation();
                // 1. Remove from options list
                this.removeItem(opt.value);
                // 2. Unselect if currently selected
                const currentValues = this._getSelectedValues();
                if (currentValues.includes(opt.value)) {
                    if (this.mode === 'multi' || this.mode === 'tags') {
                        const next = currentValues.filter((v)=>v !== opt.value);
                        this.value = next;
                        this._dispatch('vi-combobox-change', {
                            value: next
                        });
                    } else {
                        this.value = '';
                        this._dispatch('vi-combobox-change', {
                            value: ''
                        });
                    }
                }
            }
            async _scrollToActiveIndex() {
                await this.updateComplete;
                if (this._activeIndex < 0) return;
                if (this.virtualize && this._slottedItems.length === 0) {
                    const virtualizer = this.shadowRoot?.querySelector('lit-virtualizer');
                    if (virtualizer && typeof virtualizer.scrollToIndex === 'function') {
                        virtualizer.scrollToIndex(this._activeIndex, 'nearest');
                    }
                } else {
                    const activeEl = this.shadowRoot?.querySelector('.combobox-option.is-active');
                    if (activeEl) {
                        activeEl.scrollIntoView({
                            block: 'nearest'
                        });
                    }
                }
            }
            // --- Keyboard & Focus ---
            _handleKeyDown(e) {
                this._keyboardController.handleKeyDown(e);
            }
            _handleOutsideClick = (e)=>{
                if (this.open && !e.composedPath().includes(this)) {
                    this.close();
                }
            };
            _focusTime = 0;
            _handleInputFocus() {
                if (this.openOnFocus && !this.open) {
                    this.open = true;
                    this._focusTime = Date.now();
                }
            }
            _handleControlClick(e) {
                const path = e.composedPath();
                const isClearBtn = path.some((el)=>el.part?.contains('clear-btn'));
                const isTag = path.some((el)=>el.tagName?.toLowerCase() === 'vi-chip');
                if (isClearBtn || isTag) return;
                if (!this.isSearchable) {
                    if (this.openOnFocus && Date.now() - this._focusTime < 100) {
                        return; // Prevents closing immediately after focus opens it
                    }
                    this.toggle();
                } else if (!this.open) {
                    this.open = true;
                }
            }
            // --- Public Imperative Methods ---
            get _visibleSlottedItems() {
                return this._slottedItems.filter((i)=>!i.hidden);
            }
            /**
   * Sets `active` property on visible slotted items by index.
   * Drives `.is-active` CSS class inside vi-combobox-item render.
   */ _updateSlottedActiveState(activeIndex) {
                const visible = this._visibleSlottedItems;
                visible.forEach((item, i)=>{
                    item.active = i === activeIndex;
                });
            }
            // --- Public Imperative Methods ---
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
            clearValue() {
                const prev = this.value;
                this.value = this.mode === 'multi' || this.mode === 'tags' ? [] : '';
                this._query = '';
                this._dispatch('vi-combobox-clear', {
                    previousValue: prev
                });
                this._dispatch('vi-combobox-change', {
                    value: this.value
                });
            }
            focus(options) {
                if (this.isSearchable) {
                    this._inputEl?.focus(options);
                } else {
                    this._triggerEl?.focus(options);
                }
            }
            getSelectedOptions() {
                const selectedValues = this._getSelectedValues();
                return this._optionsList.filter((opt)=>selectedValues.includes(opt.value));
            }
            setOptions(opts) {
                this.options = opts;
            }
            addItem(opt) {
                this._optionsList = [
                    ...this._optionsList,
                    opt
                ];
                this._rebuildOptionDataMap();
                this.requestUpdate();
            }
            removeItem(value) {
                this._optionsList = this._optionsList.filter((o)=>o.value !== value);
                this._rebuildOptionDataMap();
                this.requestUpdate();
            }
            _dispatch(eventName, detail) {
                this.dispatchEvent(new CustomEvent(eventName, {
                    detail,
                    bubbles: true,
                    composed: true
                }));
            }
            // --- Render Helpers ---
            _renderHighlightedText(text) {
                if (!this.isSearchable || !this.highlightMatch || !this._query) return text;
                const q = this._query;
                const idx = text.toLowerCase().indexOf(q.toLowerCase());
                if (idx === -1) return text;
                const before = text.slice(0, idx);
                const match = text.slice(idx, idx + q.length);
                const after = text.slice(idx + q.length);
                return b`${before}<mark class="combobox-mark">${match}</mark>${after}`;
            }
            _renderSingleOption(opt, idx, selectedValues) {
                const isSelected = selectedValues.includes(opt.value);
                const isActive = idx === this._activeIndex;
                return b`
      <li
        id="${this._getOptionId(opt.value)}"
        part="option"
        role="option"
        aria-selected="${isSelected ? 'true' : 'false'}"
        aria-disabled="${opt.disabled ? 'true' : 'false'}"
        class="combobox-option ${isSelected ? 'is-selected' : ''} ${isActive ? 'is-active' : ''} ${opt.disabled ? 'is-disabled' : ''}"
        @click=${(e)=>{
                    e.stopPropagation();
                    this._selectOption(opt);
                }}
      >
        ${this.renderOption ? this.renderOption({
                    option: opt,
                    query: this._query,
                    selected: isSelected
                }) : b`
              ${opt.icon ? b`<vi-icon part="icon" name="${opt.icon}"></vi-icon>` : ''}
              <div part="option-content" class="combobox-option-content">
                <span part="option-label" class="combobox-option-label">
                  ${this._renderHighlightedText(opt.label)}
                </span>
                ${opt.description ? b`<span part="option-description" class="combobox-option-description">${opt.description}</span>` : ''}
              </div>
              
              ${opt.data?.isTemporary ? b`
                    <button type="button" class="combobox-option-action" aria-label="${this.removeCustomItemText}" title="${this.removeCustomItemText}" @click=${(e)=>this._handleDeleteTempItem(opt, e)}>
                      <vi-icon name="minus" style="color: var(--vi-color-error, #ef4444);"></vi-icon>
                    </button>
                  ` : ''}

              ${isSelected ? b`<vi-icon part="check" name="check"></vi-icon>` : ''}
            `}
      </li>
    `;
            }
            _renderOptionsList(filtered, selectedValues) {
                const hasGroups = filtered.some((opt)=>opt.group);
                if (this.virtualize && !hasGroups) {
                    if (this._slottedItems.length === 0) {
                        return b`
          <lit-virtualizer
            part="list"
            class="combobox-list"
            .items=${filtered}
            .keyFunction=${(opt)=>opt.value}
            .renderItem=${(opt, idx)=>this._renderSingleOption(opt, idx, selectedValues)}
          ></lit-virtualizer>
        `;
                    }
                }
                if (!hasGroups) {
                    return b`
        <ul part="list" class="combobox-list">
          ${filtered.map((opt, idx)=>this._renderSingleOption(opt, idx, selectedValues))}
        </ul>
      `;
                }
                const groupsMap = new Map();
                for (const opt of filtered){
                    const g = opt.group || '';
                    let groupArr = groupsMap.get(g);
                    if (!groupArr) {
                        groupArr = [];
                        groupsMap.set(g, groupArr);
                    }
                    groupArr.push(opt);
                }
                const groupEntries = Array.from(groupsMap.entries());
                let globalIndex = 0;
                return b`
      <div part="list" class="combobox-list">
        ${groupEntries.map(([groupName, opts])=>{
                    const groupId = `group-${groupName.replace(/\s+/g, '-').toLowerCase()}`;
                    return b`
            <div role="group" aria-labelledby=${groupName ? groupId : undefined}>
              ${groupName ? b`<div id=${groupId} part="group-header" class="combobox-group-header" role="presentation">${groupName}</div>` : ''}
              <ul class="combobox-list">
                ${opts.map((opt)=>{
                        const idx = globalIndex++;
                        return this._renderSingleOption(opt, idx, selectedValues);
                    })}
              </ul>
            </div>
          `;
                })}
      </div>
    `;
            }
            _getDisplayLabel() {
                const selected = this._getSelectedValues();
                if (selected.length === 0) return this.placeholder;
                const opt = this._optionsList.find((o)=>o.value === selected[0]);
                return opt ? opt.label : selected[0];
            }
            render() {
                const selectedValues = this._getSelectedValues();
                const filtered = this.filteredOptions;
                const showClear = this.clearable && selectedValues.length > 0 && !this.disabled;
                // True when a query is active in slotted mode but all items are hidden (empty state)
                const allSlottedHidden = this._slottedItems.length > 0 && this._query.length > 0 && this._slottedItems.every((i)=>i.hidden);
                const showCreateOption = this._slottedItems.length === 0 && (this.mode === 'creatable' || this.mode === 'tags') && this._query.trim() && !this._optionsList.some((o)=>o.label.toLowerCase() === this._query.trim().toLowerCase() || o.value.toLowerCase() === this._query.trim().toLowerCase());
                return b`
      <div part="field" class="combobox-field">
        <div
          part="control"
          class="combobox-control ${this.open ? 'is-open is-focused' : ''} ${this.disabled ? 'is-disabled' : ''} ${this.status !== 'default' ? `is-${this.status}` : ''}"
          @click=${(e)=>this._handleControlClick(e)}
        >
          <slot name="prefix" part="prefix"></slot>

          ${(this.mode === 'multi' || this.mode === 'tags') && selectedValues.length > 0 ? b`
                <div part="tags" class="combobox-tags">
                  ${selectedValues.map((val)=>{
                    const opt = this._optionsList.find((o)=>o.value === val);
                    const label = opt ? opt.label : val;
                    return b`
                      <vi-chip
                        size="sm"
                        removable
                        ?disabled=${this.disabled}
                        @vialiq-remove=${(e)=>this._removeTag(val, e)}
                      >
                        ${label}
                      </vi-chip>
                    `;
                })}
                </div>
              ` : ''}

          ${this.isSearchable ? b`
                <input
                  id="input"
                  part="input"
                  class="combobox-input"
                  type="text"
                  autocomplete="off"
                  .value=${this._query}
                  placeholder=${selectedValues.length === 0 || this.mode === 'multi' || this.mode === 'tags' ? this.placeholder : this._getDisplayLabel()}
                  ?disabled=${this.disabled}
                  role="combobox"
                  aria-expanded="${this.open ? 'true' : 'false'}"
                  aria-autocomplete="list"
                  aria-haspopup="listbox"
                  aria-controls="listbox"
                  aria-activedescendant="${this._slottedItems.length > 0 ? this._activeIndex >= 0 && this._visibleSlottedItems[this._activeIndex] ? this._getOptionId(this._visibleSlottedItems[this._activeIndex].value) : '' : this._activeIndex >= 0 && filtered[this._activeIndex] ? this._getOptionId(filtered[this._activeIndex].value) : showCreateOption && this._activeIndex === -1 ? 'create-option' : ''}"
                  @input=${this._handleInput}
                  @focus=${this._handleInputFocus}
                />
              ` : b`
                <button
                  id="trigger"
                  part="trigger"
                  type="button"
                  class="combobox-trigger ${selectedValues.length === 0 ? 'is-placeholder' : ''}"
                  ?disabled=${this.disabled}
                  role="combobox"
                  aria-expanded="${this.open ? 'true' : 'false'}"
                  aria-haspopup="listbox"
                  aria-controls="listbox"
                  @focus=${this._handleInputFocus}
                >
                  ${this._getDisplayLabel()}
                </button>
              `}

          ${this.loading ? b`<span part="loading-indicator" class="combobox-loading">...</span>` : ''}

          ${showClear ? b`
                <button
                  type="button"
                  part="clear-btn"
                  class="combobox-clear-btn"
                  aria-label="Clear selection"
                  @click=${(e)=>{
                    e.stopPropagation();
                    this.clearValue();
                }}
                >
                  <vi-icon name="x"></vi-icon>
                </button>
              ` : ''}

          <vi-icon
            part="chevron"
            name="chevron-down"
            class="combobox-chevron"
            @click=${(e)=>{
                    e.stopPropagation();
                    this.toggle();
                }}
          ></vi-icon>
        </div>

        <!-- Listbox Dropdown -->
        <div
          id="listbox"
          part="listbox"
          class="combobox-listbox ${this.open ? 'is-open' : ''}"
          ?open=${this.open}
          role="listbox"
          aria-multiselectable="${this.mode === 'multi' || this.mode === 'tags' ? 'true' : 'false'}"
          aria-busy="${this.loading ? 'true' : 'false'}"
          aria-label="${this.placeholder}"
          aria-owns=${this._slottedItems.length > 0 ? this._visibleSlottedItems.map((i)=>this._getOptionId(i.value)).join(' ') : A}
        >
          <div class="combobox-sentinel-top" style="height: 1px; width: 100%;"></div>
          <slot></slot>
          ${this._slottedItems.length === 0 && filtered.length > 0 ? this._renderOptionsList(filtered, selectedValues) : ''}
          ${this._slottedItems.length === 0 && this.loading ? b`<div part="loading-indicator" class="combobox-loading"><slot name="loading">Loading...</slot></div>` : ''}
          ${showCreateOption ? b`
                <div
                  id="create-option"
                  role="option"
                  aria-selected="false"
                  aria-disabled="false"
                  part="option"
                  class="combobox-option ${this._activeIndex === -1 ? 'is-active' : ''}"
                  @click=${this._handleCreate}
                >
                  ${this.renderCreateOption ? this.renderCreateOption(this._query) : b`<span>${this.createText.replace('{query}', this._query)}</span>`}
                </div>
              ` : ''}
          ${this._slottedItems.length === 0 && filtered.length === 0 && !this.loading && !((this.mode === 'creatable' || this.mode === 'tags') && this._query.trim()) ? b`<div part="empty" class="combobox-empty"><slot name="empty">${this.noOptionsText}</slot></div>` : ''}
          ${this._slottedItems.length > 0 && allSlottedHidden ? b`<div part="empty" class="combobox-empty"><slot name="empty">${this.noOptionsText}</slot></div>` : ''}
          <div class="combobox-sentinel-bottom" style="height: 1px; width: 100%;"></div>
        </div>

        <slot name="helper" part="helper"></slot>
        ${this.validityMessage ? b`<span part="validation" class="combobox-validation ${this.status !== 'default' ? `is-${this.status}` : ''}">${this.validityMessage}</span>` : ''}
      </div>
    `;
            }
        }
    }
}();

const sampleOptions = [
    {
        value: 'US',
        label: 'United States',
        description: 'UTC-5 to UTC-8',
        icon: 'globe'
    },
    {
        value: 'GB',
        label: 'United Kingdom',
        description: 'UTC+0',
        icon: 'globe'
    },
    {
        value: 'DE',
        label: 'Germany',
        description: 'UTC+1',
        icon: 'globe'
    },
    {
        value: 'JP',
        label: 'Japan',
        description: 'UTC+9',
        icon: 'globe'
    },
    {
        value: 'AU',
        label: 'Australia',
        description: 'UTC+10',
        icon: 'globe'
    }
];
const meta = {
    title: 'Components/Combobox',
    component: 'vi-combobox',
    parameters: {
        docs: {
            description: {
                component: 'Searchable, filterable combobox with support for data-driven options and slotted <vi-combobox-item> custom templates.'
            }
        }
    },
    argTypes: {
        mode: {
            control: 'select',
            options: [
                'single',
                'multi',
                'tags',
                'creatable'
            ]
        },
        searchable: {
            control: 'boolean'
        },
        clearable: {
            control: 'boolean'
        },
        disabled: {
            control: 'boolean'
        },
        required: {
            control: 'boolean'
        },
        loading: {
            control: 'boolean'
        },
        status: {
            control: 'select',
            options: [
                'default',
                'valid',
                'invalid'
            ]
        },
        validityMessage: {
            control: 'text'
        }
    }
};
const Default = {
    render: (args)=>b`
    <div style="max-width: 400px; padding: 20px;">
      <vi-combobox
        mode=${args.mode || 'single'}
        ?searchable=${args.searchable ?? true}
        ?clearable=${args.clearable ?? true}
        ?disabled=${args.disabled ?? false}
        ?required=${args.required ?? false}
        ?loading=${args.loading ?? false}
        status=${args.status || 'default'}
        validity-message=${args.validityMessage || ''}
        .options=${sampleOptions}
        placeholder="Select a country..."
      ></vi-combobox>
    </div>
  `
};
const MultiSelectWithTags = {
    render: ()=>b`
    <div style="max-width: 400px; padding: 20px;">
      <vi-combobox
        mode="multi"
        clearable
        .options=${sampleOptions}
        placeholder="Select countries..."
      ></vi-combobox>
    </div>
  `
};
const SlottedCustomItemsWithDataPayload = {
    render: ()=>b`
    <div style="max-width: 450px; padding: 20px;">
      <vi-combobox
        mode="single"
        placeholder="Select team member..."
        @vi-combobox-change=${(e)=>{
            console.log('Selected value:', e.detail.value);
            console.log('Payload data:', e.detail.data);
        }}
      >
        <vi-combobox-item
          value="usr-1"
          label="Alice Johnson"
          .data=${{
            id: 101,
            role: 'Principal Investigator',
            email: 'alice@vialiq.com'
        }}
        >
          <div style="display: flex; flex-direction: column;">
            <strong style="font-size: 14px; color: var(--vi-text-primary);"
              >Alice Johnson</strong
            >
            <span style="font-size: 12px; color: var(--vi-text-secondary);"
              >PI · alice@vialiq.com</span
            >
          </div>
        </vi-combobox-item>

        <vi-combobox-item
          value="usr-2"
          label="Bob Smith"
          .data=${{
            id: 102,
            role: 'Clinical Research Associate',
            email: 'bob@vialiq.com'
        }}
        >
          <div style="display: flex; flex-direction: column;">
            <strong style="font-size: 14px; color: var(--vi-text-primary);"
              >Bob Smith</strong
            >
            <span style="font-size: 12px; color: var(--vi-text-secondary);"
              >CRA · bob@vialiq.com</span
            >
          </div>
        </vi-combobox-item>
      </vi-combobox>
    </div>
  `
};
const NonSearchableDropdown = {
    render: ()=>b`
    <div style="max-width: 400px; padding: 20px;">
      <vi-combobox
        mode="single"
        searchable="false"
        clearable
        .options=${sampleOptions}
        placeholder="Select country (no text search)..."
      ></vi-combobox>
    </div>
  `
};
const CreatableMode = {
    render: ()=>b`
    <div style="max-width: 400px; padding: 20px;">
      <vi-combobox
        mode="creatable"
        .options=${[
            {
                value: 'mg',
                label: 'mg (Milligrams)'
            },
            {
                value: 'ml',
                label: 'mL (Milliliters)'
            }
        ]}
        placeholder="Select or type custom unit..."
        create-text='Use "{query}" as custom unit'
      ></vi-combobox>
    </div>
  `
};
const CreatableModeWithCustomTemplate = {
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates how to use `renderCreateOption` to provide a custom HTML template for the "Create" option.'
            }
        }
    },
    render: ()=>b`
    <div style="max-width: 400px; padding: 20px;">
      <vi-combobox
        mode="creatable"
        .options=${[
            {
                value: 'mg',
                label: 'mg (Milligrams)'
            },
            {
                value: 'ml',
                label: 'mL (Milliliters)'
            }
        ]}
        placeholder="Type a new unit to see custom template..."
        .renderCreateOption=${(query)=>b`
          <div
            style="display: flex; align-items: center; gap: 8px; color: #4f46e5; padding: 4px;"
          >
            <div
              style="background: #e0e7ff; border-radius: 4px; padding: 2px 4px; font-weight: bold; font-size: 10px;"
            >
              NEW
            </div>
            <span>Create custom unit: <strong>${query}</strong></span>
          </div>
        `}
      ></vi-combobox>
    </div>
  `
};
/**
 * Demonstrates slotted mode with `searchText` for full-corpus search.
 *
 * Each `<vi-combobox-item>` has a rich custom template showing role + email.
 * The `searchText` array exposes all searchable terms (name, abbreviation, email).
 *
 * Try typing:
 * - "alice"  → matches Alice (via label)
 * - "PI"     → matches Alice (via abbreviation in searchText)
 * - "cra"    → matches Bob (via role abbreviation)
 * - "bob@"   → matches Bob (via email)
 * - "zzz"    → shows "No results found" empty state
 *
 * The `vi-filter` event is used to drive a data-attr highlight — open the console
 * to see `{ query, results, matchedValues }` logged on every keypress.
 */ const SlottedItemsWithSearch = {
    parameters: {
        docs: {
            description: {
                story: '`searchText` lets each slotted item declare its full search corpus independently ' + 'of its display label. The combobox hides non-matching items via `element.hidden`. ' + 'Listen to `vi-filter` for `matchedValues` to apply app-side highlighting.'
            }
        }
    },
    render: ()=>{
        const teamMembers = [
            {
                value: 'usr-1',
                label: 'Alice Johnson',
                role: 'Principal Investigator',
                abbr: 'PI',
                email: 'alice@vialiq.com',
                data: {
                    id: 101
                }
            },
            {
                value: 'usr-2',
                label: 'Bob Smith',
                role: 'Clinical Research Associate',
                abbr: 'CRA',
                email: 'bob@vialiq.com',
                data: {
                    id: 102
                }
            },
            {
                value: 'usr-3',
                label: 'Carol Davies',
                role: 'Data Manager',
                abbr: 'DM',
                email: 'carol@vialiq.com',
                data: {
                    id: 103
                }
            }
        ];
        return b`
      <div style="max-width: 480px; padding: 24px; font-family: sans-serif;">
        <p style="font-size: 12px; color: #666; margin: 0 0 12px;">
          Try searching: <code>alice</code>, <code>PI</code>, <code>cra</code>,
          <code>bob@</code>, <code>data manager</code>
        </p>

        <vi-combobox
          mode="single"
          placeholder="Search team members..."
          @vi-combobox-change=${(e)=>{
            console.log('[vi-combobox-change]', e.detail);
        }}
          @vi-combobox-filter=${(e)=>{
            console.log('[vi-combobox-filter] query:', e.detail.query, '| matched:', e.detail.matchedValues);
        }}
        >
          ${teamMembers.map((m)=>b`
              <vi-combobox-item
                value=${m.value}
                label=${m.label}
                .searchText=${[
                m.label,
                m.role,
                m.abbr,
                m.email
            ]}
                .data=${m.data}
              >
                <div
                  style="display: flex; align-items: center; gap: 10px; padding: 2px 0;"
                >
                  <div
                    style="
                      width: 32px; height: 32px; border-radius: 50%;
                      background: linear-gradient(135deg, #4f46e5, #7c3aed);
                      display: flex; align-items: center; justify-content: center;
                      color: #fff; font-weight: 600; font-size: 13px; flex-shrink: 0;
                    "
                  >
                    ${m.label.split(' ').map((n)=>n[0]).join('')}
                  </div>
                  <div
                    style="display: flex; flex-direction: column; min-width: 0;"
                  >
                    <strong
                      style="font-size: 14px; color: var(--vi-text-primary, #111); white-space: nowrap;"
                    >
                      ${m.label}
                    </strong>
                    <span
                      style="font-size: 11px; color: var(--vi-text-secondary, #666); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                    >
                      ${m.abbr} · ${m.email}
                    </span>
                  </div>
                </div>
              </vi-combobox-item>
            `)}
        </vi-combobox>
      </div>
    `;
    }
};
/**
 * Data-driven mode with `ComboboxOption.searchText` — extends the filter corpus beyond the
 * label. Description is also automatically included by default, but `searchText` provides
 * total control (e.g. include codes, abbreviations, translated terms).
 */ const DataDrivenWithSearchText = {
    parameters: {
        docs: {
            description: {
                story: 'In data-driven mode `ComboboxOption.searchText` overrides the filter corpus. ' + 'Without it, `label + description` is the default corpus. ' + 'Try: <code>ICD</code>, <code>E11</code>, <code>diabetes</code>, <code>sugar</code>.'
            }
        }
    },
    render: ()=>b`
    <div style="max-width: 440px; padding: 24px; font-family: sans-serif;">
      <p style="font-size: 12px; color: #666; margin: 0 0 12px;">
        Try: <code>diabetes</code>, <code>E11</code>, <code>sugar</code>,
        <code>ICD</code>
      </p>
      <vi-combobox
        mode="single"
        placeholder="Search diagnoses..."
        .options=${[
            {
                value: 'E10',
                label: 'E10 — Type 1 Diabetes Mellitus',
                description: 'Insulin-dependent diabetes',
                searchText: 'E10 Type 1 Diabetes Mellitus insulin dependent sugar T1DM'
            },
            {
                value: 'E11',
                label: 'E11 — Type 2 Diabetes Mellitus',
                description: 'Non-insulin-dependent diabetes',
                searchText: 'E11 Type 2 Diabetes Mellitus non-insulin T2DM sugar'
            },
            {
                value: 'I10',
                label: 'I10 — Essential Hypertension',
                description: 'Primary high blood pressure',
                searchText: 'I10 Essential Hypertension high blood pressure HTN BP'
            }
        ]}
      ></vi-combobox>
    </div>
  `
};
const DynamicFlipping = {
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates dynamic flipping using Floating UI. Scroll the container up and down to see the listbox flip from bottom to top to avoid clipping.'
            }
        }
    },
    render: ()=>b`
    <div
      style="height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 20px; position: relative;"
      id="scroll-boundary"
    >
      <div style="height: 400px; padding-top: 150px;">
        <vi-combobox
          mode="single"
          placeholder="Scroll to see me flip..."
          flip-boundary="#scroll-boundary"
          .options=${[
            {
                value: '1',
                label: 'Option 1'
            },
            {
                value: '2',
                label: 'Option 2'
            },
            {
                value: '3',
                label: 'Option 3'
            },
            {
                value: '4',
                label: 'Option 4'
            },
            {
                value: '5',
                label: 'Option 5'
            }
        ]}
        ></vi-combobox>
      </div>
    </div>
  `
};
const Hoisting = {
    parameters: {
        docs: {
            description: {
                story: 'When `hoist="true"`, the listbox uses `position: fixed` via Floating UI. This helps it escape tight `overflow: hidden` containers without needing to move the DOM node.'
            }
        }
    },
    render: ()=>b`
    <div style="display: flex; gap: 40px; font-family: sans-serif;">
      <div
        style="width: 250px; height: 120px; overflow: hidden; border: 2px dashed #f87171; padding: 10px; box-sizing: border-box;"
      >
        <p style="margin-top: 0; font-size: 12px; color: #b91c1c;">
          Clipped (Default)
        </p>
        <vi-combobox
          mode="single"
          placeholder="I will get clipped..."
          .options=${[
            {
                value: '1',
                label: 'Option 1'
            },
            {
                value: '2',
                label: 'Option 2'
            },
            {
                value: '3',
                label: 'Option 3'
            }
        ]}
        ></vi-combobox>
      </div>

      <div
        style="width: 250px; height: 120px; overflow: hidden; border: 2px dashed #10b981; padding: 10px; box-sizing: border-box;"
      >
        <p style="margin-top: 0; font-size: 12px; color: #047857;">
          Escaped (hoist="true")
        </p>
        <vi-combobox
          mode="single"
          hoist
          placeholder="I will escape!"
          .options=${[
            {
                value: '1',
                label: 'Option 1'
            },
            {
                value: '2',
                label: 'Option 2'
            },
            {
                value: '3',
                label: 'Option 3'
            }
        ]}
        ></vi-combobox>
      </div>
    </div>
  `
};
const VirtualizationAndInfiniteScroll = {
    parameters: {
        docs: {
            description: {
                story: 'Virtualization renders massive lists efficiently. It requires `virtualize="true"` and an array of `options`. You can optionally supply `renderOption` for custom templates instead of using slotted items. The `vi-load-more` event fires when scrolling near the bottom to support infinite loading.'
            }
        }
    },
    render: ()=>{
        const massiveData = Array.from({
            length: 5000
        }).map((_, i)=>({
                value: `item-${i}`,
                label: `Virtual Item ${i}`,
                description: `Description for item ${i}`,
                data: {
                    id: i
                }
            }));
        return b`
      <div style="max-width: 400px; padding: 20px; font-family: sans-serif;">
        <vi-combobox
          mode="single"
          placeholder="Scroll through 5000 items..."
          virtualize
          .options=${massiveData}
          .renderOption=${(params)=>b`
            <div
              style="display: flex; gap: 12px; align-items: center; padding: 4px; width: 100%; box-sizing: border-box;"
            >
              <div
                style="background: #eef2ff; color: #4f46e5; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 11px; font-weight: bold; flex-shrink: 0;"
              >
                #${params.option.data.id}
              </div>
              <div style="display: flex; flex-direction: column; min-width: 0;">
                <strong
                  style="font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ${params.selected ? '#4f46e5' : 'inherit'};"
                >
                  ${params.option.label}
                </strong>
                <span
                  style="font-size: 12px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                >
                  ${params.option.description}
                </span>
              </div>
            </div>
          `}
          @vi-combobox-load-more=${(e)=>{
            console.log('[vi-combobox-load-more] Reached the bottom! Event payload:', e.detail);
        }}
        ></vi-combobox>
      </div>
    `;
    }
};
class InfiniteScrollDemo extends i$2 {
    static get properties() {
        return {
            _items: {
                state: true
            },
            _loading: {
                state: true
            }
        };
    }
    _page = 0;
    constructor(){
        super();
        this._items = [];
        this._loading = false;
    }
    connectedCallback() {
        super.connectedCallback();
        this._loadMore();
    }
    async _loadMore() {
        if (this._loading || this._page >= 5) return; // limit to 5 pages for demo
        this._loading = true;
        // Simulate network delay
        await new Promise((resolve)=>setTimeout(resolve, 1500));
        const newItems = Array.from({
            length: 30
        }).map((_, i)=>{
            const id = this._page * 30 + i;
            return {
                value: `api-item-${id}`,
                label: `API Item ${id}`,
                description: `Loaded from page ${this._page + 1}`,
                data: {
                    id
                }
            };
        });
        this._items = [
            ...this._items,
            ...newItems
        ];
        this._page++;
        this._loading = false;
    }
    render() {
        return b`
      <div style="font-family: sans-serif;">
        <p style="font-size: 14px; margin-bottom: 8px;">
          Scroll to the bottom to load more items. Loaded ${this._items.length}
          items so far.
          ${this._page >= 5 ? b`<span style="color: #ea580c; font-weight: bold;"
                >(All data loaded)</span
              >` : ''}
        </p>
        <vi-combobox
          mode="single"
          placeholder="Search items..."
          virtualize
          ?loading=${this._loading}
          .options=${this._items}
          .renderOption=${(params)=>b`
            <div
              style="display: flex; gap: 12px; align-items: center; padding: 4px; width: 100%; box-sizing: border-box;"
            >
              <div
                style="background: #f0fdf4; color: #16a34a; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 11px; font-weight: bold; flex-shrink: 0;"
              >
                #${params.option.data?.id}
              </div>
              <div style="display: flex; flex-direction: column; min-width: 0;">
                <strong
                  style="font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ${params.selected ? '#16a34a' : 'inherit'};"
                >
                  ${params.option.label}
                </strong>
                <span
                  style="font-size: 12px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                >
                  ${params.option.description}
                </span>
              </div>
            </div>
          `}
          @vi-combobox-load-more=${(e)=>{
            if (e.detail.direction === 'down') this._loadMore();
        }}
        ></vi-combobox>
      </div>
    `;
    }
}
customElements.define('vi-infinite-scroll-demo', InfiniteScrollDemo);
const InfiniteScrollWithMockApi = {
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates infinite scrolling with a mocked API. When the user scrolls to the bottom of the list, the `vi-load-more` event triggers a network request. The combobox displays a loading indicator while data is fetched, and seamlessly appends new items to the virtualized list.'
            }
        }
    },
    render: ()=>{
        return b`
      <div style="max-width: 400px; padding: 20px;">
        <vi-infinite-scroll-demo></vi-infinite-scroll-demo>
      </div>
    `;
    }
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <div style=\"max-width: 400px; padding: 20px;\">\n      <vi-combobox\n        mode=${args.mode || 'single'}\n        ?searchable=${args.searchable ?? true}\n        ?clearable=${args.clearable ?? true}\n        ?disabled=${args.disabled ?? false}\n        ?required=${args.required ?? false}\n        ?loading=${args.loading ?? false}\n        status=${args.status || 'default'}\n        validity-message=${args.validityMessage || ''}\n        .options=${sampleOptions}\n        placeholder=\"Select a country...\"\n      ></vi-combobox>\n    </div>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
MultiSelectWithTags.parameters = {
    ...MultiSelectWithTags.parameters,
    docs: {
        ...MultiSelectWithTags.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"max-width: 400px; padding: 20px;\">\n      <vi-combobox\n        mode=\"multi\"\n        clearable\n        .options=${sampleOptions}\n        placeholder=\"Select countries...\"\n      ></vi-combobox>\n    </div>\n  `\n}",
            ...MultiSelectWithTags.parameters?.docs?.source
        }
    }
};
SlottedCustomItemsWithDataPayload.parameters = {
    ...SlottedCustomItemsWithDataPayload.parameters,
    docs: {
        ...SlottedCustomItemsWithDataPayload.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"max-width: 450px; padding: 20px;\">\n      <vi-combobox\n        mode=\"single\"\n        placeholder=\"Select team member...\"\n        @vi-combobox-change=${(e: CustomEvent) => {\n    console.log('Selected value:', e.detail.value);\n    console.log('Payload data:', e.detail.data);\n  }}\n      >\n        <vi-combobox-item\n          value=\"usr-1\"\n          label=\"Alice Johnson\"\n          .data=${{\n    id: 101,\n    role: 'Principal Investigator',\n    email: 'alice@vialiq.com'\n  }}\n        >\n          <div style=\"display: flex; flex-direction: column;\">\n            <strong style=\"font-size: 14px; color: var(--vi-text-primary);\"\n              >Alice Johnson</strong\n            >\n            <span style=\"font-size: 12px; color: var(--vi-text-secondary);\"\n              >PI \xB7 alice@vialiq.com</span\n            >\n          </div>\n        </vi-combobox-item>\n\n        <vi-combobox-item\n          value=\"usr-2\"\n          label=\"Bob Smith\"\n          .data=${{\n    id: 102,\n    role: 'Clinical Research Associate',\n    email: 'bob@vialiq.com'\n  }}\n        >\n          <div style=\"display: flex; flex-direction: column;\">\n            <strong style=\"font-size: 14px; color: var(--vi-text-primary);\"\n              >Bob Smith</strong\n            >\n            <span style=\"font-size: 12px; color: var(--vi-text-secondary);\"\n              >CRA \xB7 bob@vialiq.com</span\n            >\n          </div>\n        </vi-combobox-item>\n      </vi-combobox>\n    </div>\n  `\n}",
            ...SlottedCustomItemsWithDataPayload.parameters?.docs?.source
        }
    }
};
NonSearchableDropdown.parameters = {
    ...NonSearchableDropdown.parameters,
    docs: {
        ...NonSearchableDropdown.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"max-width: 400px; padding: 20px;\">\n      <vi-combobox\n        mode=\"single\"\n        searchable=\"false\"\n        clearable\n        .options=${sampleOptions}\n        placeholder=\"Select country (no text search)...\"\n      ></vi-combobox>\n    </div>\n  `\n}",
            ...NonSearchableDropdown.parameters?.docs?.source
        }
    }
};
CreatableMode.parameters = {
    ...CreatableMode.parameters,
    docs: {
        ...CreatableMode.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"max-width: 400px; padding: 20px;\">\n      <vi-combobox\n        mode=\"creatable\"\n        .options=${[{\n    value: 'mg',\n    label: 'mg (Milligrams)'\n  }, {\n    value: 'ml',\n    label: 'mL (Milliliters)'\n  }]}\n        placeholder=\"Select or type custom unit...\"\n        create-text='Use \"{query}\" as custom unit'\n      ></vi-combobox>\n    </div>\n  `\n}",
            ...CreatableMode.parameters?.docs?.source
        }
    }
};
CreatableModeWithCustomTemplate.parameters = {
    ...CreatableModeWithCustomTemplate.parameters,
    docs: {
        ...CreatableModeWithCustomTemplate.parameters?.docs,
        source: {
            originalSource: "{\n  parameters: {\n    docs: {\n      description: {\n        story: 'Demonstrates how to use `renderCreateOption` to provide a custom HTML template for the \"Create\" option.'\n      }\n    }\n  },\n  render: () => html`\n    <div style=\"max-width: 400px; padding: 20px;\">\n      <vi-combobox\n        mode=\"creatable\"\n        .options=${[{\n    value: 'mg',\n    label: 'mg (Milligrams)'\n  }, {\n    value: 'ml',\n    label: 'mL (Milliliters)'\n  }]}\n        placeholder=\"Type a new unit to see custom template...\"\n        .renderCreateOption=${(query: string) => html`\n          <div\n            style=\"display: flex; align-items: center; gap: 8px; color: #4f46e5; padding: 4px;\"\n          >\n            <div\n              style=\"background: #e0e7ff; border-radius: 4px; padding: 2px 4px; font-weight: bold; font-size: 10px;\"\n            >\n              NEW\n            </div>\n            <span>Create custom unit: <strong>${query}</strong></span>\n          </div>\n        `}\n      ></vi-combobox>\n    </div>\n  `\n}",
            ...CreatableModeWithCustomTemplate.parameters?.docs?.source
        }
    }
};
SlottedItemsWithSearch.parameters = {
    ...SlottedItemsWithSearch.parameters,
    docs: {
        ...SlottedItemsWithSearch.parameters?.docs,
        source: {
            originalSource: "{\n  parameters: {\n    docs: {\n      description: {\n        story: '`searchText` lets each slotted item declare its full search corpus independently ' + 'of its display label. The combobox hides non-matching items via `element.hidden`. ' + 'Listen to `vi-filter` for `matchedValues` to apply app-side highlighting.'\n      }\n    }\n  },\n  render: () => {\n    const teamMembers = [{\n      value: 'usr-1',\n      label: 'Alice Johnson',\n      role: 'Principal Investigator',\n      abbr: 'PI',\n      email: 'alice@vialiq.com',\n      data: {\n        id: 101\n      }\n    }, {\n      value: 'usr-2',\n      label: 'Bob Smith',\n      role: 'Clinical Research Associate',\n      abbr: 'CRA',\n      email: 'bob@vialiq.com',\n      data: {\n        id: 102\n      }\n    }, {\n      value: 'usr-3',\n      label: 'Carol Davies',\n      role: 'Data Manager',\n      abbr: 'DM',\n      email: 'carol@vialiq.com',\n      data: {\n        id: 103\n      }\n    }];\n    return html`\n      <div style=\"max-width: 480px; padding: 24px; font-family: sans-serif;\">\n        <p style=\"font-size: 12px; color: #666; margin: 0 0 12px;\">\n          Try searching: <code>alice</code>, <code>PI</code>, <code>cra</code>,\n          <code>bob@</code>, <code>data manager</code>\n        </p>\n\n        <vi-combobox\n          mode=\"single\"\n          placeholder=\"Search team members...\"\n          @vi-combobox-change=${(e: CustomEvent) => {\n      console.log('[vi-combobox-change]', e.detail);\n    }}\n          @vi-combobox-filter=${(e: CustomEvent) => {\n      console.log('[vi-combobox-filter] query:', e.detail.query, '| matched:', e.detail.matchedValues);\n    }}\n        >\n          ${teamMembers.map(m => html`\n              <vi-combobox-item\n                value=${m.value}\n                label=${m.label}\n                .searchText=${[m.label, m.role, m.abbr, m.email]}\n                .data=${m.data}\n              >\n                <div\n                  style=\"display: flex; align-items: center; gap: 10px; padding: 2px 0;\"\n                >\n                  <div\n                    style=\"\n                      width: 32px; height: 32px; border-radius: 50%;\n                      background: linear-gradient(135deg, #4f46e5, #7c3aed);\n                      display: flex; align-items: center; justify-content: center;\n                      color: #fff; font-weight: 600; font-size: 13px; flex-shrink: 0;\n                    \"\n                  >\n                    ${m.label.split(' ').map((n: string) => n[0]).join('')}\n                  </div>\n                  <div\n                    style=\"display: flex; flex-direction: column; min-width: 0;\"\n                  >\n                    <strong\n                      style=\"font-size: 14px; color: var(--vi-text-primary, #111); white-space: nowrap;\"\n                    >\n                      ${m.label}\n                    </strong>\n                    <span\n                      style=\"font-size: 11px; color: var(--vi-text-secondary, #666); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\"\n                    >\n                      ${m.abbr} \xB7 ${m.email}\n                    </span>\n                  </div>\n                </div>\n              </vi-combobox-item>\n            `)}\n        </vi-combobox>\n      </div>\n    `;\n  }\n}",
            ...SlottedItemsWithSearch.parameters?.docs?.source
        },
        description: {
            story: "Demonstrates slotted mode with `searchText` for full-corpus search.\n\nEach `<vi-combobox-item>` has a rich custom template showing role + email.\nThe `searchText` array exposes all searchable terms (name, abbreviation, email).\n\nTry typing:\n- \"alice\"  \u2192 matches Alice (via label)\n- \"PI\"     \u2192 matches Alice (via abbreviation in searchText)\n- \"cra\"    \u2192 matches Bob (via role abbreviation)\n- \"bob@\"   \u2192 matches Bob (via email)\n- \"zzz\"    \u2192 shows \"No results found\" empty state\n\nThe `vi-filter` event is used to drive a data-attr highlight \u2014 open the console\nto see `{ query, results, matchedValues }` logged on every keypress.",
            ...SlottedItemsWithSearch.parameters?.docs?.description
        }
    }
};
DataDrivenWithSearchText.parameters = {
    ...DataDrivenWithSearchText.parameters,
    docs: {
        ...DataDrivenWithSearchText.parameters?.docs,
        source: {
            originalSource: "{\n  parameters: {\n    docs: {\n      description: {\n        story: 'In data-driven mode `ComboboxOption.searchText` overrides the filter corpus. ' + 'Without it, `label + description` is the default corpus. ' + 'Try: <code>ICD</code>, <code>E11</code>, <code>diabetes</code>, <code>sugar</code>.'\n      }\n    }\n  },\n  render: () => html`\n    <div style=\"max-width: 440px; padding: 24px; font-family: sans-serif;\">\n      <p style=\"font-size: 12px; color: #666; margin: 0 0 12px;\">\n        Try: <code>diabetes</code>, <code>E11</code>, <code>sugar</code>,\n        <code>ICD</code>\n      </p>\n      <vi-combobox\n        mode=\"single\"\n        placeholder=\"Search diagnoses...\"\n        .options=${[{\n    value: 'E10',\n    label: 'E10 \u2014 Type 1 Diabetes Mellitus',\n    description: 'Insulin-dependent diabetes',\n    searchText: 'E10 Type 1 Diabetes Mellitus insulin dependent sugar T1DM'\n  }, {\n    value: 'E11',\n    label: 'E11 \u2014 Type 2 Diabetes Mellitus',\n    description: 'Non-insulin-dependent diabetes',\n    searchText: 'E11 Type 2 Diabetes Mellitus non-insulin T2DM sugar'\n  }, {\n    value: 'I10',\n    label: 'I10 \u2014 Essential Hypertension',\n    description: 'Primary high blood pressure',\n    searchText: 'I10 Essential Hypertension high blood pressure HTN BP'\n  }] as ComboboxOption[]}\n      ></vi-combobox>\n    </div>\n  `\n}",
            ...DataDrivenWithSearchText.parameters?.docs?.source
        },
        description: {
            story: "Data-driven mode with `ComboboxOption.searchText` \u2014 extends the filter corpus beyond the\nlabel. Description is also automatically included by default, but `searchText` provides\ntotal control (e.g. include codes, abbreviations, translated terms).",
            ...DataDrivenWithSearchText.parameters?.docs?.description
        }
    }
};
DynamicFlipping.parameters = {
    ...DynamicFlipping.parameters,
    docs: {
        ...DynamicFlipping.parameters?.docs,
        source: {
            originalSource: "{\n  parameters: {\n    docs: {\n      description: {\n        story: 'Demonstrates dynamic flipping using Floating UI. Scroll the container up and down to see the listbox flip from bottom to top to avoid clipping.'\n      }\n    }\n  },\n  render: () => html`\n    <div\n      style=\"height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 20px; position: relative;\"\n      id=\"scroll-boundary\"\n    >\n      <div style=\"height: 400px; padding-top: 150px;\">\n        <vi-combobox\n          mode=\"single\"\n          placeholder=\"Scroll to see me flip...\"\n          flip-boundary=\"#scroll-boundary\"\n          .options=${[{\n    value: '1',\n    label: 'Option 1'\n  }, {\n    value: '2',\n    label: 'Option 2'\n  }, {\n    value: '3',\n    label: 'Option 3'\n  }, {\n    value: '4',\n    label: 'Option 4'\n  }, {\n    value: '5',\n    label: 'Option 5'\n  }] as ComboboxOption[]}\n        ></vi-combobox>\n      </div>\n    </div>\n  `\n}",
            ...DynamicFlipping.parameters?.docs?.source
        }
    }
};
Hoisting.parameters = {
    ...Hoisting.parameters,
    docs: {
        ...Hoisting.parameters?.docs,
        source: {
            originalSource: "{\n  parameters: {\n    docs: {\n      description: {\n        story: 'When `hoist=\"true\"`, the listbox uses `position: fixed` via Floating UI. This helps it escape tight `overflow: hidden` containers without needing to move the DOM node.'\n      }\n    }\n  },\n  render: () => html`\n    <div style=\"display: flex; gap: 40px; font-family: sans-serif;\">\n      <div\n        style=\"width: 250px; height: 120px; overflow: hidden; border: 2px dashed #f87171; padding: 10px; box-sizing: border-box;\"\n      >\n        <p style=\"margin-top: 0; font-size: 12px; color: #b91c1c;\">\n          Clipped (Default)\n        </p>\n        <vi-combobox\n          mode=\"single\"\n          placeholder=\"I will get clipped...\"\n          .options=${[{\n    value: '1',\n    label: 'Option 1'\n  }, {\n    value: '2',\n    label: 'Option 2'\n  }, {\n    value: '3',\n    label: 'Option 3'\n  }] as ComboboxOption[]}\n        ></vi-combobox>\n      </div>\n\n      <div\n        style=\"width: 250px; height: 120px; overflow: hidden; border: 2px dashed #10b981; padding: 10px; box-sizing: border-box;\"\n      >\n        <p style=\"margin-top: 0; font-size: 12px; color: #047857;\">\n          Escaped (hoist=\"true\")\n        </p>\n        <vi-combobox\n          mode=\"single\"\n          hoist\n          placeholder=\"I will escape!\"\n          .options=${[{\n    value: '1',\n    label: 'Option 1'\n  }, {\n    value: '2',\n    label: 'Option 2'\n  }, {\n    value: '3',\n    label: 'Option 3'\n  }] as ComboboxOption[]}\n        ></vi-combobox>\n      </div>\n    </div>\n  `\n}",
            ...Hoisting.parameters?.docs?.source
        }
    }
};
VirtualizationAndInfiniteScroll.parameters = {
    ...VirtualizationAndInfiniteScroll.parameters,
    docs: {
        ...VirtualizationAndInfiniteScroll.parameters?.docs,
        source: {
            originalSource: "{\n  parameters: {\n    docs: {\n      description: {\n        story: 'Virtualization renders massive lists efficiently. It requires `virtualize=\"true\"` and an array of `options`. You can optionally supply `renderOption` for custom templates instead of using slotted items. The `vi-load-more` event fires when scrolling near the bottom to support infinite loading.'\n      }\n    }\n  },\n  render: () => {\n    const massiveData = Array.from({\n      length: 5000\n    }).map((_, i) => ({\n      value: `item-${i}`,\n      label: `Virtual Item ${i}`,\n      description: `Description for item ${i}`,\n      data: {\n        id: i\n      }\n    }));\n    return html`\n      <div style=\"max-width: 400px; padding: 20px; font-family: sans-serif;\">\n        <vi-combobox\n          mode=\"single\"\n          placeholder=\"Scroll through 5000 items...\"\n          virtualize\n          .options=${massiveData as ComboboxOption[]}\n          .renderOption=${(params: RenderOptionParams) => html`\n            <div\n              style=\"display: flex; gap: 12px; align-items: center; padding: 4px; width: 100%; box-sizing: border-box;\"\n            >\n              <div\n                style=\"background: #eef2ff; color: #4f46e5; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 11px; font-weight: bold; flex-shrink: 0;\"\n              >\n                #${params.option.data.id}\n              </div>\n              <div style=\"display: flex; flex-direction: column; min-width: 0;\">\n                <strong\n                  style=\"font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ${params.selected ? '#4f46e5' : 'inherit'};\"\n                >\n                  ${params.option.label}\n                </strong>\n                <span\n                  style=\"font-size: 12px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\"\n                >\n                  ${params.option.description}\n                </span>\n              </div>\n            </div>\n          `}\n          @vi-combobox-load-more=${(e: CustomEvent) => {\n      console.log('[vi-combobox-load-more] Reached the bottom! Event payload:', e.detail);\n    }}\n        ></vi-combobox>\n      </div>\n    `;\n  }\n}",
            ...VirtualizationAndInfiniteScroll.parameters?.docs?.source
        }
    }
};
InfiniteScrollWithMockApi.parameters = {
    ...InfiniteScrollWithMockApi.parameters,
    docs: {
        ...InfiniteScrollWithMockApi.parameters?.docs,
        source: {
            originalSource: "{\n  parameters: {\n    docs: {\n      description: {\n        story: 'Demonstrates infinite scrolling with a mocked API. When the user scrolls to the bottom of the list, the `vi-load-more` event triggers a network request. The combobox displays a loading indicator while data is fetched, and seamlessly appends new items to the virtualized list.'\n      }\n    }\n  },\n  render: () => {\n    return html`\n      <div style=\"max-width: 400px; padding: 20px;\">\n        <vi-infinite-scroll-demo></vi-infinite-scroll-demo>\n      </div>\n    `;\n  }\n}",
            ...InfiniteScrollWithMockApi.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","MultiSelectWithTags","SlottedCustomItemsWithDataPayload","NonSearchableDropdown","CreatableMode","CreatableModeWithCustomTemplate","SlottedItemsWithSearch","DataDrivenWithSearchText","DynamicFlipping","Hoisting","VirtualizationAndInfiniteScroll","InfiniteScrollWithMockApi"];

export { CreatableMode, CreatableModeWithCustomTemplate, DataDrivenWithSearchText, Default, DynamicFlipping, Hoisting, InfiniteScrollWithMockApi, MultiSelectWithTags, NonSearchableDropdown, SlottedCustomItemsWithDataPayload, SlottedItemsWithSearch, VirtualizationAndInfiniteScroll, __namedExportsOrder, meta as default };
