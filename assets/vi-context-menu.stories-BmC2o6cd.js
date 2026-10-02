import { r, i, b } from './iframe-C5KGnDWv.js';
import { t } from './vi-element-B5V_Ir3U.js';
import { _ as _ViDropdown$1 } from './vi-dropdown-DJNDHAgl.js';
import './vi-menu-item-C9_auGQO.js';
import './preload-helper-D5QYaGzd.js';
import './vi-popover-BadZF0RK.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './floating-ui.dom-Dsl7AwNm.js';
import './class-map-BUAmi8pa.js';
import './directive-BKuZRRPO.js';

const contextMenuStyles = "@charset \"UTF-8\";@layer reset,components,utilities;.vi-dropdown-popover{--vi-menu-padding: var(--vi-context-menu-padding, var(--vi-spacing-unit, .25rem) 0);--vi-menu-item-padding: var( --vi-context-menu-item-padding, var(--vi-spacing-unit, .25rem) var(--vi-spacing-sm, .75rem) );--vi-menu-item-margin: var(--vi-context-menu-item-margin, 0);--vi-menu-min-width: var(--vi-context-menu-min-width, 160px);--vi-menu-item-gap: var(--vi-context-menu-item-gap, var(--vi-spacing-xs, .5rem))}:host{display:inline-block}";

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
var _dec, _initClass, _ViDropdown;
let _ViContextMenu;
_dec = t('vi-context-menu');
new class extends _identity {
    constructor(){
        super(_ViContextMenu), _initClass();
    }
    static{
        class ViContextMenu extends (_ViDropdown = _ViDropdown$1) {
            static{
                ({ c: [_ViContextMenu, _initClass] } = _apply_decs_2203_r(this, [], [
                    _dec
                ], _ViDropdown));
            }
            static styles = [
                _ViDropdown$1.styles,
                i`
      ${r(contextMenuStyles)}
    `
            ];
            constructor(){
                super();
                this.trigger = 'contextmenu';
            }
        }
    }
}();

const meta = {
    title: 'Components/Context Menu',
    component: 'vi-context-menu',
    parameters: {
        layout: 'centered'
    }
};
const Default = {
    render: ()=>b`
    <vi-context-menu>
      <div
        style="width: 300px; height: 150px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; border-radius: 8px; user-select: none;"
      >
        Right click inside here
      </div>

      <vi-menu slot="content" style="width: 200px;">
        <vi-menu-item value="copy"> Copy </vi-menu-item>
        <vi-menu-item value="paste"> Paste </vi-menu-item>
        <div class="vi-menu-divider"></div>
        <vi-menu-item value="delete" danger> Delete </vi-menu-item>
      </vi-menu>
    </vi-context-menu>
  `
};
const CustomPanel = {
    render: ()=>b`
    <vi-popover trigger="contextmenu">
      <div
        style="width: 300px; height: 150px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; border-radius: 8px; user-select: none;"
      >
        Right click for custom panel
      </div>

      <div
        slot="content"
        style="width: 260px; display: flex; flex-direction: column; gap: 12px;"
      >
        <h4
          style="margin: 0; font-size: 14px; color: var(--vi-color-primary, #3676d0);"
        >
          Quick Filters
        </h4>
        <input
          type="text"
          placeholder="Search by name..."
          style="padding: 8px; border: 1px solid var(--vi-border-03, #e0e0e0); border-radius: 4px; outline: none; font-family: inherit; font-size: 13px;"
        />
        <label
          style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--vi-text-secondary, #4b5563); cursor: pointer;"
        >
          <input type="checkbox" checked /> Include archived items
        </label>
        <div
          style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px;"
        >
          <button
            style="padding: 6px 12px; border: 1px solid var(--vi-border-03, #e0e0e0); background: transparent; border-radius: 4px; cursor: pointer; font-size: 13px;"
          >
            Clear
          </button>
          <button
            style="padding: 6px 12px; border: none; background: var(--vi-color-primary, #3676d0); color: white; border-radius: 4px; cursor: pointer; font-size: 13px;"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </vi-popover>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <vi-context-menu>\n      <div\n        style=\"width: 300px; height: 150px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; border-radius: 8px; user-select: none;\"\n      >\n        Right click inside here\n      </div>\n\n      <vi-menu slot=\"content\" style=\"width: 200px;\">\n        <vi-menu-item value=\"copy\"> Copy </vi-menu-item>\n        <vi-menu-item value=\"paste\"> Paste </vi-menu-item>\n        <div class=\"vi-menu-divider\"></div>\n        <vi-menu-item value=\"delete\" danger> Delete </vi-menu-item>\n      </vi-menu>\n    </vi-context-menu>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
CustomPanel.parameters = {
    ...CustomPanel.parameters,
    docs: {
        ...CustomPanel.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <vi-popover trigger=\"contextmenu\">\n      <div\n        style=\"width: 300px; height: 150px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; border-radius: 8px; user-select: none;\"\n      >\n        Right click for custom panel\n      </div>\n\n      <div\n        slot=\"content\"\n        style=\"width: 260px; display: flex; flex-direction: column; gap: 12px;\"\n      >\n        <h4\n          style=\"margin: 0; font-size: 14px; color: var(--vi-color-primary, #3676d0);\"\n        >\n          Quick Filters\n        </h4>\n        <input\n          type=\"text\"\n          placeholder=\"Search by name...\"\n          style=\"padding: 8px; border: 1px solid var(--vi-border-03, #e0e0e0); border-radius: 4px; outline: none; font-family: inherit; font-size: 13px;\"\n        />\n        <label\n          style=\"display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--vi-text-secondary, #4b5563); cursor: pointer;\"\n        >\n          <input type=\"checkbox\" checked /> Include archived items\n        </label>\n        <div\n          style=\"display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px;\"\n        >\n          <button\n            style=\"padding: 6px 12px; border: 1px solid var(--vi-border-03, #e0e0e0); background: transparent; border-radius: 4px; cursor: pointer; font-size: 13px;\"\n          >\n            Clear\n          </button>\n          <button\n            style=\"padding: 6px 12px; border: none; background: var(--vi-color-primary, #3676d0); color: white; border-radius: 4px; cursor: pointer; font-size: 13px;\"\n          >\n            Apply Filters\n          </button>\n        </div>\n      </div>\n    </vi-popover>\n  `\n}",
            ...CustomPanel.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","CustomPanel"];

export { CustomPanel, Default, __namedExportsOrder, meta as default };
