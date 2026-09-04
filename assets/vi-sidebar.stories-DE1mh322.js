import { r as r$1, i, b } from './iframe-9yd_z6c6.js';
import { o as o$1 } from './if-defined-CYaYkB02.js';
import { V as ViElement, t, n } from './vi-element-D7bP2wsn.js';
import { r } from './state-FW5tp7Om.js';
import { F as FocusTrapMixin } from './focus-trap-mixin-Bhw7FczQ.js';
import { o } from './query-assigned-elements-BJaGSqM0.js';
import './vi-button-D54BGZG7.js';
import './vi-icon-C_atHq7t.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import { c as chevronRightIcon } from './chevron-right-C38rqkF2.js';
import { h as homeIcon, u as usersIcon, d as documentIcon, e as edit1Icon } from './users-CNkqxNdV.js';
import './preload-helper-D5QYaGzd.js';
import './base-Cl6v8-BZ.js';
import './focusable-mixin-CmxOyPX5.js';
import './directive-BKuZRRPO.js';

const sidebarStyles = "@charset \"UTF-8\";@layer reset,components,utilities;:host{display:block;position:absolute;z-index:var(--vi-sidebar-z-index, 9999);transition:transform .4s cubic-bezier(.16,1,.3,1),width .4s cubic-bezier(.16,1,.3,1),height .4s cubic-bezier(.16,1,.3,1),visibility .4s;background-color:var(--vi-sidebar-bg, var(--vi-layer-01, #ffffff));box-shadow:var(--vi-sidebar-shadow, var(--vi-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, .05), 0 20px 25px -5px rgba(0, 0, 0, .1)));will-change:transform,width,height}:host(:not([animations])){transition:none!important}.vi-sidebar{position:relative;width:100%;height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch}.vi-sidebar__content{flex:1}.vi-sidebar__resizer{position:absolute;top:0;bottom:0;width:12px;cursor:col-resize;z-index:10;background-color:transparent;display:flex;align-items:center}.vi-sidebar__resizer:after{content:\"\";display:block;width:3px;height:100%;background-color:var(--vi-sidebar-resizer-color, var(--vi-border-03, #e0e0e0));transition:background-color 0s ease .15s}.vi-sidebar__resizer:hover:after,.vi-sidebar__resizer:active:after{background-color:var(--vi-sidebar-resizer-hover-color, var(--vi-color-primary, #3676d0));transition-delay:0s}:host([position=left]) .vi-sidebar__resizer,:host([position=start]) .vi-sidebar__resizer,:host(:not([position])) .vi-sidebar__resizer{right:0;justify-content:flex-end}:host([position=right]) .vi-sidebar__resizer,:host([position=end]) .vi-sidebar__resizer{left:0;justify-content:flex-start}:host([position=top]) .vi-sidebar__resizer,:host([position=bottom]) .vi-sidebar__resizer{width:100%;height:12px;cursor:row-resize;flex-direction:column}:host([position=top]) .vi-sidebar__resizer{bottom:0;top:auto;align-items:stretch;justify-content:flex-end}:host([position=top]) .vi-sidebar__resizer:after{width:100%;height:3px;flex-shrink:0}:host([position=bottom]) .vi-sidebar__resizer{top:0;bottom:auto;align-items:stretch;justify-content:flex-start}:host([position=bottom]) .vi-sidebar__resizer:after{width:100%;height:3px;flex-shrink:0}:host([resizing]){transition:none!important;will-change:width,height}:host(:not([position])),:host([position=left]),:host([position=start]){top:0;bottom:0;left:0;width:var(--vi-sidebar-width, 250px);transform:translate(-100%)}:host([position=right]),:host([position=end]){top:0;bottom:0;right:0;width:var(--vi-sidebar-width, 250px);transform:translate(100%)}:host([position=top]){top:0;left:0;right:0;height:var(--vi-sidebar-height, 250px);transform:translateY(-100%)}:host([position=bottom]){bottom:0;left:0;right:0;height:var(--vi-sidebar-height, 250px);transform:translateY(100%)}:host([dock]:not([position])),:host([dock][position=left]),:host([dock][position=start]){transform:translate(0)}:host([dock][position=right]),:host([dock][position=end]){transform:translate(0)}:host([dock][position=top]){transform:translateY(0)}:host([dock][position=bottom]){transform:translateY(0)}:host([dock]:not([opened]):not([position])),:host([dock]:not([opened])[position=left]),:host([dock]:not([opened])[position=start]){width:var(--vi-sidebar-docked-size, 0px);overflow:hidden}:host([dock]:not([opened])[position=right]),:host([dock]:not([opened])[position=end]){width:var(--vi-sidebar-docked-size, 0px);overflow:hidden}:host([dock]:not([opened])[position=top]){height:var(--vi-sidebar-docked-size, 0px);overflow:hidden}:host([dock]:not([opened])[position=bottom]){height:var(--vi-sidebar-docked-size, 0px);overflow:hidden}:host([opened]:not([position])),:host([opened][position=left]),:host([opened][position=start]){transform:translate(0)}:host([opened][position=right]),:host([opened][position=end]){transform:translate(0)}:host([opened][position=top]){transform:translateY(0)}:host([opened][position=bottom]){transform:translateY(0)}:host(:not([opened]):not([dock])){visibility:hidden}@media(prefers-reduced-motion:reduce){:host{transition:none!important}}";

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
var _dec$1, _initClass$1, _FocusTrapMixin, _dec1$1, _dec2$1, _dec3$1, _dec4$1, _dec5$1, _dec6$1, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, /** Whether the sidebar is currently open. */ _init_opened, /** Display mode: `over` (floats above content), `push` (shifts content), `slide` (translates content). */ _init_mode, /** Position of the sidebar relative to the container. */ _init_position, /**
   * When true, the sidebar uses a width-collapse animation instead of
   * sliding off-screen. Set `docked-size` to a non-zero value (e.g. `"60px"`)
   * to keep a persistent strip visible when closed.
   */ _init_dock, /**
   * How wide (or tall) the sidebar remains when docked and closed.
   * Defaults to `"0px"` (completely hidden).
   * Set to e.g. `"60px"` for an icon-rail style dock.
   */ _init_dockedSize, /** Collapse the sidebar when the viewport width drops to or below this value (px). */ _init_autoCollapseWidth, /** Collapse the sidebar when the viewport height drops to or below this value (px). */ _init_autoCollapseHeight, /** Whether to check auto-collapse on initial connection. */ _init_autoCollapseOnInit, /** Enable/disable CSS transitions. */ _init_animations$1, /** Trap focus inside the sidebar while it is open. */ _init_trapFocus, /** Automatically move focus to the first focusable element when opened. */ _init_autoFocus, /** Request the container to show a backdrop when the sidebar is open. */ _init_showBackdrop$1, /** Close when the backdrop is clicked. */ _init_closeOnClickBackdrop, /** Close when a click occurs outside the sidebar. */ _init_closeOnClickOutside, /** Close when a key is pressed (default: Escape). */ _init_keyClose, /** The keyboard key that closes the sidebar when `key-close` is enabled. */ _init_closeKey, /**
   * Allow the user to drag the sidebar edge to resize it.
   * Only effective on left/right (and top/bottom) positioned sidebars.
   */ _init_resizable, /** Minimum width (or height) when resizing. In px. */ _init_resizeMin, /** Maximum width (or height) when resizing. In px. */ _init_resizeMax, _init__isResizing, _initProto$1;
let _ViSidebar;
_dec$1 = t('vi-sidebar'), _dec1$1 = n({
    type: Boolean,
    reflect: true
}), _dec2$1 = n({
    type: String,
    reflect: true
}), _dec3$1 = n({
    type: String,
    reflect: true
}), _dec4$1 = n({
    type: Boolean,
    reflect: true
}), _dec5$1 = n({
    type: String,
    attribute: 'docked-size'
}), _dec6$1 = n({
    type: Number,
    attribute: 'auto-collapse-width'
}), _dec7 = n({
    type: Number,
    attribute: 'auto-collapse-height'
}), _dec8 = n({
    type: Boolean,
    attribute: 'auto-collapse-on-init'
}), _dec9 = n({
    type: Boolean,
    reflect: true
}), _dec10 = n({
    type: Boolean,
    attribute: 'trap-focus'
}), _dec11 = n({
    type: Boolean,
    attribute: 'auto-focus'
}), _dec12 = n({
    type: Boolean,
    attribute: 'show-backdrop'
}), _dec13 = n({
    type: Boolean,
    attribute: 'close-on-click-backdrop'
}), _dec14 = n({
    type: Boolean,
    attribute: 'close-on-click-outside'
}), _dec15 = n({
    type: Boolean,
    attribute: 'key-close'
}), _dec16 = n({
    type: String,
    attribute: 'close-key'
}), _dec17 = n({
    type: Boolean
}), _dec18 = n({
    type: Number,
    attribute: 'resize-min'
}), _dec19 = n({
    type: Number,
    attribute: 'resize-max'
}), _dec20 = r();
new class extends _identity$1 {
    constructor(){
        super(_ViSidebar), _initClass$1();
    }
    static{
        class ViSidebar extends (_FocusTrapMixin = FocusTrapMixin(ViElement)) {
            static{
                ({ e: [_init_opened, _init_mode, _init_position, _init_dock, _init_dockedSize, _init_autoCollapseWidth, _init_autoCollapseHeight, _init_autoCollapseOnInit, _init_animations$1, _init_trapFocus, _init_autoFocus, _init_showBackdrop$1, _init_closeOnClickBackdrop, _init_closeOnClickOutside, _init_keyClose, _init_closeKey, _init_resizable, _init_resizeMin, _init_resizeMax, _init__isResizing, _initProto$1], c: [_ViSidebar, _initClass$1] } = _apply_decs_2203_r$1(this, [
                    [
                        _dec1$1,
                        1,
                        "opened"
                    ],
                    [
                        _dec2$1,
                        1,
                        "mode"
                    ],
                    [
                        _dec3$1,
                        1,
                        "position"
                    ],
                    [
                        _dec4$1,
                        1,
                        "dock"
                    ],
                    [
                        _dec5$1,
                        1,
                        "dockedSize"
                    ],
                    [
                        _dec6$1,
                        1,
                        "autoCollapseWidth"
                    ],
                    [
                        _dec7,
                        1,
                        "autoCollapseHeight"
                    ],
                    [
                        _dec8,
                        1,
                        "autoCollapseOnInit"
                    ],
                    [
                        _dec9,
                        1,
                        "animations"
                    ],
                    [
                        _dec10,
                        1,
                        "trapFocus"
                    ],
                    [
                        _dec11,
                        1,
                        "autoFocus"
                    ],
                    [
                        _dec12,
                        1,
                        "showBackdrop"
                    ],
                    [
                        _dec13,
                        1,
                        "closeOnClickBackdrop"
                    ],
                    [
                        _dec14,
                        1,
                        "closeOnClickOutside"
                    ],
                    [
                        _dec15,
                        1,
                        "keyClose"
                    ],
                    [
                        _dec16,
                        1,
                        "closeKey"
                    ],
                    [
                        _dec17,
                        1,
                        "resizable"
                    ],
                    [
                        _dec18,
                        1,
                        "resizeMin"
                    ],
                    [
                        _dec19,
                        1,
                        "resizeMax"
                    ],
                    [
                        _dec20,
                        1,
                        "_isResizing"
                    ]
                ], [
                    _dec$1
                ], _FocusTrapMixin));
            }
            static styles = i`
    ${r$1(sidebarStyles)}
  `;
            #___private_opened_1 = (_initProto$1(this), _init_opened(this, false));
            get opened() {
                return this.#___private_opened_1;
            }
            set opened(_v) {
                this.#___private_opened_1 = _v;
            }
            #___private_mode_2 = _init_mode(this, 'over');
            get mode() {
                return this.#___private_mode_2;
            }
            set mode(_v) {
                this.#___private_mode_2 = _v;
            }
            #___private_position_3 = _init_position(this, 'start');
            get position() {
                return this.#___private_position_3;
            }
            set position(_v) {
                this.#___private_position_3 = _v;
            }
            #___private_dock_4 = _init_dock(this, false);
            get dock() {
                return this.#___private_dock_4;
            }
            set dock(_v) {
                this.#___private_dock_4 = _v;
            }
            #___private_dockedSize_5 = _init_dockedSize(this, '0px');
            get dockedSize() {
                return this.#___private_dockedSize_5;
            }
            set dockedSize(_v) {
                this.#___private_dockedSize_5 = _v;
            }
            #___private_autoCollapseWidth_6 = _init_autoCollapseWidth(this);
            get autoCollapseWidth() {
                return this.#___private_autoCollapseWidth_6;
            }
            set autoCollapseWidth(_v) {
                this.#___private_autoCollapseWidth_6 = _v;
            }
            #___private_autoCollapseHeight_7 = _init_autoCollapseHeight(this);
            get autoCollapseHeight() {
                return this.#___private_autoCollapseHeight_7;
            }
            set autoCollapseHeight(_v) {
                this.#___private_autoCollapseHeight_7 = _v;
            }
            #___private_autoCollapseOnInit_8 = _init_autoCollapseOnInit(this, true);
            get autoCollapseOnInit() {
                return this.#___private_autoCollapseOnInit_8;
            }
            set autoCollapseOnInit(_v) {
                this.#___private_autoCollapseOnInit_8 = _v;
            }
            #___private_animations_9 = _init_animations$1(this, true);
            get animations() {
                return this.#___private_animations_9;
            }
            set animations(_v) {
                this.#___private_animations_9 = _v;
            }
            #___private_trapFocus_10 = _init_trapFocus(this, false);
            get trapFocus() {
                return this.#___private_trapFocus_10;
            }
            set trapFocus(_v) {
                this.#___private_trapFocus_10 = _v;
            }
            #___private_autoFocus_11 = _init_autoFocus(this, true);
            get autoFocus() {
                return this.#___private_autoFocus_11;
            }
            set autoFocus(_v) {
                this.#___private_autoFocus_11 = _v;
            }
            #___private_showBackdrop_12 = _init_showBackdrop$1(this, false);
            get showBackdrop() {
                return this.#___private_showBackdrop_12;
            }
            set showBackdrop(_v) {
                this.#___private_showBackdrop_12 = _v;
            }
            #___private_closeOnClickBackdrop_13 = _init_closeOnClickBackdrop(this, false);
            get closeOnClickBackdrop() {
                return this.#___private_closeOnClickBackdrop_13;
            }
            set closeOnClickBackdrop(_v) {
                this.#___private_closeOnClickBackdrop_13 = _v;
            }
            #___private_closeOnClickOutside_14 = _init_closeOnClickOutside(this, false);
            get closeOnClickOutside() {
                return this.#___private_closeOnClickOutside_14;
            }
            set closeOnClickOutside(_v) {
                this.#___private_closeOnClickOutside_14 = _v;
            }
            #___private_keyClose_15 = _init_keyClose(this, false);
            get keyClose() {
                return this.#___private_keyClose_15;
            }
            set keyClose(_v) {
                this.#___private_keyClose_15 = _v;
            }
            #___private_closeKey_16 = _init_closeKey(this, 'Escape');
            get closeKey() {
                return this.#___private_closeKey_16;
            }
            set closeKey(_v) {
                this.#___private_closeKey_16 = _v;
            }
            #___private_resizable_17 = _init_resizable(this, false);
            get resizable() {
                return this.#___private_resizable_17;
            }
            set resizable(_v) {
                this.#___private_resizable_17 = _v;
            }
            #___private_resizeMin_18 = _init_resizeMin(this, 100);
            get resizeMin() {
                return this.#___private_resizeMin_18;
            }
            set resizeMin(_v) {
                this.#___private_resizeMin_18 = _v;
            }
            #___private_resizeMax_19 = _init_resizeMax(this, 800);
            get resizeMax() {
                return this.#___private_resizeMax_19;
            }
            set resizeMax(_v) {
                this.#___private_resizeMax_19 = _v;
            }
            #___private__isResizing_20 = _init__isResizing(this, false);
            get _isResizing() {
                return this.#___private__isResizing_20;
            }
            set _isResizing(_v) {
                this.#___private__isResizing_20 = _v;
            }
            // Track whether the sidebar was open before auto-collapse so we can re-open it.
            _wasCollapsed = false;
            // Internal reference to parent container
            container;
            _resizeObserver;
            _clickOutsideHandler = this._onClickOutside.bind(this);
            _keydownHandler = this._onKeydown.bind(this);
            connectedCallback() {
                super.connectedCallback();
                // Initialize CSS variable for dock width immediately — before first paint.
                this._syncDockedSizeVar();
                if (this.autoCollapseWidth || this.autoCollapseHeight) {
                    // Use window resize event — more reliable than ResizeObserver on body.
                    this._resizeObserver = new ResizeObserver(()=>this._checkAutoCollapse());
                    this._resizeObserver.observe(document.documentElement);
                    if (this.autoCollapseOnInit) {
                        requestAnimationFrame(()=>this._checkAutoCollapse());
                    }
                }
                // Only attach global listeners when the features are actually enabled.
                if (this.closeOnClickOutside) {
                    document.addEventListener('mousedown', this._clickOutsideHandler);
                }
                if (this.keyClose) {
                    document.addEventListener('keydown', this._keydownHandler);
                }
                this.addEventListener('transitionend', this._onTransitionEnd);
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                if (this._resizeObserver) {
                    this._resizeObserver.disconnect();
                }
                document.removeEventListener('mousedown', this._clickOutsideHandler);
                document.removeEventListener('keydown', this._keydownHandler);
                this.removeEventListener('transitionend', this._onTransitionEnd);
                // Clean up any lingering resize pointer listeners (in case removed mid-drag).
                document.removeEventListener('pointermove', this._onResizeMove);
                document.removeEventListener('pointerup', this._stopResize);
                document.body.style.cursor = '';
            }
            updated(changedProperties) {
                super.updated(changedProperties);
                // Sync the CSS variable that drives the dock width/height animation.
                if (changedProperties.has('dock') || changedProperties.has('dockedSize') || changedProperties.has('opened')) {
                    this._syncDockedSizeVar();
                }
                // Re-attach/detach global listeners when their enabling properties change.
                if (changedProperties.has('closeOnClickOutside')) {
                    if (this.closeOnClickOutside) {
                        document.addEventListener('mousedown', this._clickOutsideHandler);
                    } else {
                        document.removeEventListener('mousedown', this._clickOutsideHandler);
                    }
                }
                if (changedProperties.has('keyClose')) {
                    if (this.keyClose) {
                        document.addEventListener('keydown', this._keydownHandler);
                    } else {
                        document.removeEventListener('keydown', this._keydownHandler);
                    }
                }
                if (changedProperties.has('opened')) {
                    const eventName = this.opened ? 'vi-sidebar-opened' : 'vi-sidebar-closed';
                    this.dispatchEvent(new CustomEvent(eventName, {
                        bubbles: true,
                        composed: true
                    }));
                    this.dispatchEvent(new CustomEvent('vi-sidebar-opened-change', {
                        detail: {
                            opened: this.opened
                        },
                        bubbles: true,
                        composed: true
                    }));
                    this._updateContainer();
                    if (this.opened) {
                        if (this.trapFocus) {
                            this._activateFocusTrap(null, this.autoFocus);
                        } else if (this.autoFocus) {
                            this._focusFirstElement();
                        }
                    } else {
                        if (this.trapFocus) {
                            this._deactivateFocusTrap();
                        }
                    }
                } else if (changedProperties.has('dock') || changedProperties.has('dockedSize') || changedProperties.has('mode') || changedProperties.has('position')) {
                    this._updateContainer();
                }
            }
            render() {
                // Sidebar is effectively invisible when dock=true and dockedSize=0px and closed.
                const effectivelyVisible = this.opened || this.dock && parseFloat(this.dockedSize) > 0;
                return b`
      <aside
        part="base"
        class="vi-sidebar"
        aria-hidden=${!effectivelyVisible}
        role=${this.trapFocus ? 'dialog' : undefined}
        aria-modal=${this.trapFocus ? 'true' : undefined}
        aria-label=${this.trapFocus ? this.getAttribute('aria-label') || 'Sidebar' : undefined}
      >
        <div class="vi-sidebar__content">
          <slot></slot>
        </div>
        ${this.resizable ? b`<div
              part="resizer"
              class="vi-sidebar__resizer"
              @pointerdown=${this._startResize}
            ></div>` : ''}
      </aside>
    `;
            }
            /** Opens the sidebar. */ open() {
                if (!this.opened) {
                    this.dispatchEvent(new CustomEvent('vi-sidebar-open-start', {
                        bubbles: true,
                        composed: true
                    }));
                    this.opened = true;
                }
            }
            /** Closes the sidebar. */ close() {
                if (this.opened) {
                    this.dispatchEvent(new CustomEvent('vi-sidebar-close-start', {
                        bubbles: true,
                        composed: true
                    }));
                    this.opened = false;
                }
            }
            /** Toggles the sidebar open/closed. */ toggle() {
                if (this.opened) {
                    this.close();
                } else {
                    this.open();
                }
            }
            // ---------------------------------------------------------------------------
            // Private
            // ---------------------------------------------------------------------------
            /** Syncs `--vi-sidebar-docked-size` CSS variable to drive the dock animation. */ _syncDockedSizeVar() {
                const size = this.dock && !this.opened ? this.dockedSize : '0px';
                this.style.setProperty('--vi-sidebar-docked-size', size);
            }
            _updateContainer() {
                if (this.container) {
                    if (this.showBackdrop) {
                        this.container.requestBackdrop(this.opened);
                    }
                    this.container.updateLayout();
                }
            }
            _checkAutoCollapse() {
                const width = window.innerWidth;
                const height = window.innerHeight;
                let shouldCollapse = false;
                if (this.autoCollapseWidth && width <= this.autoCollapseWidth) shouldCollapse = true;
                if (this.autoCollapseHeight && height <= this.autoCollapseHeight) shouldCollapse = true;
                if (shouldCollapse && this.opened) {
                    this._wasCollapsed = true;
                    this.close();
                } else if (!shouldCollapse && this._wasCollapsed && !this.opened) {
                    // Re-open when viewport grows back above the threshold (matches ng-sidebar).
                    this._wasCollapsed = false;
                    this.open();
                }
            }
            _onClickOutside(e) {
                if (!this.opened || !this.closeOnClickOutside) return;
                const path = e.composedPath();
                if (!path.includes(this)) {
                    const isBackdrop = e.target.classList?.contains('vi-sidebar-container__backdrop');
                    if (!isBackdrop) {
                        this.close();
                    }
                }
            }
            _startResize = (e)=>{
                e.preventDefault();
                if (this.dock && !this.opened) {
                    this.open();
                }
                this._isResizing = true;
                this.setAttribute('resizing', '');
                const isHorizontal = this.position === 'top' || this.position === 'bottom';
                document.body.style.cursor = isHorizontal ? 'row-resize' : 'col-resize';
                document.addEventListener('pointermove', this._onResizeMove);
                document.addEventListener('pointerup', this._stopResize);
            };
            _onResizeMove = (e)=>{
                if (!this._isResizing) return;
                requestAnimationFrame(()=>{
                    const rect = this.getBoundingClientRect();
                    if (this.position === 'start' || this.position === 'left') {
                        const newWidth = Math.max(this.resizeMin, Math.min(e.clientX - rect.left, this.resizeMax));
                        this.style.setProperty('--vi-sidebar-width', `${newWidth}px`);
                    } else if (this.position === 'end' || this.position === 'right') {
                        const newWidth = Math.max(this.resizeMin, Math.min(rect.right - e.clientX, this.resizeMax));
                        this.style.setProperty('--vi-sidebar-width', `${newWidth}px`);
                    } else if (this.position === 'top') {
                        const newHeight = Math.max(this.resizeMin, Math.min(e.clientY - rect.top, this.resizeMax));
                        this.style.setProperty('--vi-sidebar-height', `${newHeight}px`);
                    } else if (this.position === 'bottom') {
                        const newHeight = Math.max(this.resizeMin, Math.min(rect.bottom - e.clientY, this.resizeMax));
                        this.style.setProperty('--vi-sidebar-height', `${newHeight}px`);
                    }
                    this.container?.updateLayout();
                });
            };
            _stopResize = ()=>{
                this._isResizing = false;
                this.removeAttribute('resizing');
                document.body.style.cursor = '';
                document.removeEventListener('pointermove', this._onResizeMove);
                document.removeEventListener('pointerup', this._stopResize);
            };
            _onKeydown(e) {
                if (this.keyClose && e.key === this.closeKey && this.opened) {
                    this.close();
                    e.preventDefault();
                }
            }
            _onTransitionEnd = (e)=>{
                // Fire post-transition events for both transform (over/push/slide) and
                // width/height (dock mode) transitions.
                if (e.target === this && (e.propertyName === 'transform' || e.propertyName === 'width' || e.propertyName === 'height')) {
                    this.dispatchEvent(new CustomEvent('vi-sidebar-transition-end', {
                        bubbles: true,
                        composed: true
                    }));
                    if (this.opened) {
                        this.dispatchEvent(new CustomEvent('vi-sidebar-after-opened', {
                            bubbles: true,
                            composed: true
                        }));
                    } else {
                        this.dispatchEvent(new CustomEvent('vi-sidebar-after-closed', {
                            bubbles: true,
                            composed: true
                        }));
                    }
                }
            };
            _focusFirstElement() {
                const focusable = this.shadowRoot?.querySelector('slot')?.assignedElements({
                    flatten: true
                }).flatMap((el)=>Array.from(el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))).filter((el)=>el.tabIndex >= 0);
                focusable?.[0]?.focus();
            }
        }
    }
}();

const containerStyles = "@charset \"UTF-8\";@layer reset,components,utilities;:host{display:block;width:100%;height:100%;box-sizing:border-box}.vi-sidebar-container__inner{position:relative;width:100%;height:100%;overflow:hidden}.vi-sidebar-container__content-wrapper{position:absolute;inset:0;overflow:auto;box-sizing:border-box;z-index:1;transition:padding .3s cubic-bezier(.25,.8,.25,1),transform .3s cubic-bezier(.25,.8,.25,1)}:host(:not([animations])) .vi-sidebar-container__content-wrapper{transition:none!important}.vi-sidebar-container__backdrop{position:absolute;inset:0;background-color:var(--vi-sidebar-backdrop-bg, var(--vi-layer-overlay, rgba(0, 0, 0, .4)));backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:100;opacity:0;animation:vi-sidebar-backdrop-fade-in .3s forwards}@keyframes vi-sidebar-backdrop-fade-in{0%{opacity:0}to{opacity:1}}@media(prefers-reduced-motion:reduce){.vi-sidebar-container__content-wrapper{transition:none!important}.vi-sidebar-container__backdrop{animation:none!important;opacity:1}}";

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
var _dec, _initClass, _ViElement, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _init_showBackdrop, _init_animations, _init_allowSidebarBackdropControl, _init_contentClass, _init_backdropClass, _init__sidebars, _initProto;
let _ViSidebarContainer;
_dec = t('vi-sidebar-container'), _dec1 = n({
    type: Boolean,
    attribute: 'show-backdrop'
}), _dec2 = n({
    type: Boolean,
    reflect: true
}), _dec3 = n({
    type: Boolean,
    attribute: 'allow-sidebar-backdrop-control'
}), _dec4 = n({
    type: String,
    attribute: 'content-class'
}), _dec5 = n({
    type: String,
    attribute: 'backdrop-class'
}), _dec6 = o({
    slot: 'sidebar',
    selector: 'vi-sidebar'
});
new class extends _identity {
    constructor(){
        super(_ViSidebarContainer), _initClass();
    }
    static{
        class ViSidebarContainer extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_showBackdrop, _init_animations, _init_allowSidebarBackdropControl, _init_contentClass, _init_backdropClass, _init__sidebars, _initProto], c: [_ViSidebarContainer, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "showBackdrop"
                    ],
                    [
                        _dec2,
                        1,
                        "animations"
                    ],
                    [
                        _dec3,
                        1,
                        "allowSidebarBackdropControl"
                    ],
                    [
                        _dec4,
                        1,
                        "contentClass"
                    ],
                    [
                        _dec5,
                        1,
                        "backdropClass"
                    ],
                    [
                        _dec6,
                        1,
                        "_sidebars"
                    ]
                ], [
                    _dec
                ], _ViElement));
            }
            static styles = i`
    ${r$1(containerStyles)}
  `;
            #___private_showBackdrop_1 = (_initProto(this), _init_showBackdrop(this, false));
            get showBackdrop() {
                return this.#___private_showBackdrop_1;
            }
            set showBackdrop(_v) {
                this.#___private_showBackdrop_1 = _v;
            }
            #___private_animations_2 = _init_animations(this, true);
            get animations() {
                return this.#___private_animations_2;
            }
            set animations(_v) {
                this.#___private_animations_2 = _v;
            }
            #___private_allowSidebarBackdropControl_3 = _init_allowSidebarBackdropControl(this, true);
            get allowSidebarBackdropControl() {
                return this.#___private_allowSidebarBackdropControl_3;
            }
            set allowSidebarBackdropControl(_v) {
                this.#___private_allowSidebarBackdropControl_3 = _v;
            }
            #___private_contentClass_4 = _init_contentClass(this, '');
            get contentClass() {
                return this.#___private_contentClass_4;
            }
            set contentClass(_v) {
                this.#___private_contentClass_4 = _v;
            }
            #___private_backdropClass_5 = _init_backdropClass(this, '');
            get backdropClass() {
                return this.#___private_backdropClass_5;
            }
            set backdropClass(_v) {
                this.#___private_backdropClass_5 = _v;
            }
            #___private__sidebars_6 = _init__sidebars(this);
            get _sidebars() {
                return this.#___private__sidebars_6;
            }
            set _sidebars(_v) {
                this.#___private__sidebars_6 = _v;
            }
            firstUpdated() {
                this._handleSidebarSlotChange();
            }
            render() {
                return b`
      <div class="vi-sidebar-container__inner">
        <slot name="sidebar" @slotchange=${this._handleSidebarSlotChange}></slot>
        <div class="vi-sidebar-container__content-wrapper ${this.contentClass}" part="content-wrapper">
          <slot name="content"></slot>
          ${this.showBackdrop ? b`<div class="vi-sidebar-container__backdrop ${this.backdropClass}" @click=${this._onBackdropClick}></div>` : ''}
        </div>
      </div>
    `;
            }
            _handleSidebarSlotChange() {
                this._sidebars.forEach((sidebar)=>{
                    sidebar.container = this;
                });
                this.updateLayout();
            }
            _onBackdropClick() {
                this.dispatchEvent(new CustomEvent('vi-sidebar-backdrop-click', {
                    bubbles: true,
                    composed: true
                }));
                this._sidebars.forEach((sidebar)=>{
                    if (sidebar.opened && sidebar.closeOnClickBackdrop) {
                        sidebar.close();
                    }
                });
            }
            requestBackdrop(show) {
                if (this.allowSidebarBackdropControl) {
                    if (this.showBackdrop !== show) {
                        this.showBackdrop = show;
                        this.dispatchEvent(new CustomEvent('vi-sidebar-show-backdrop-change', {
                            detail: {
                                showBackdrop: show
                            },
                            bubbles: true,
                            composed: true
                        }));
                    }
                }
            }
            updateLayout() {
                let marginLeft = 0;
                let marginRight = 0;
                let marginTop = 0;
                let marginBottom = 0;
                let translateX = 0;
                let translateY = 0;
                this._sidebars.forEach((sidebar)=>{
                    const isLeftOrRight = sidebar.position === 'left' || sidebar.position === 'right' || sidebar.position === 'start' || sidebar.position === 'end';
                    const isLeftOrTop = sidebar.position === 'left' || sidebar.position === 'top' || sidebar.position === 'start';
                    const dockedSize = parseFloat(sidebar.dockedSize) || 0;
                    const isDocked = sidebar.dock && !sidebar.opened;
                    // --- Slide mode: translate the content wrapper ---
                    if (sidebar.mode === 'slide') {
                        // Only translate when the sidebar is open (not just docked)
                        if (sidebar.opened) {
                            const size = isLeftOrRight ? sidebar.offsetWidth || 250 : sidebar.offsetHeight || 250;
                            const amt = isLeftOrTop ? size : -size;
                            if (isLeftOrRight) {
                                translateX += amt;
                            } else {
                                translateY += amt;
                            }
                        }
                        // In slide mode, content never gets padding (even docked)
                        return;
                    }
                    // --- Push / Over mode: pad the content wrapper ---
                    // Push mode: pad when opened OR docked
                    // Over mode: pad only when docked (the open sidebar floats over content)
                    const shouldPad = sidebar.mode === 'push' && (sidebar.opened || isDocked) || sidebar.mode === 'over' && isDocked;
                    if (!shouldPad) return;
                    // Amount to pad: use dockedSize when closed+docked, full size when open
                    let paddingAmt = 0;
                    if (isDocked) {
                        paddingAmt = dockedSize;
                    } else {
                        paddingAmt = this._getSidebarSize(sidebar);
                    }
                    if (sidebar.position === 'left' || sidebar.position === 'start') marginLeft = Math.max(marginLeft, paddingAmt);
                    else if (sidebar.position === 'right' || sidebar.position === 'end') marginRight = Math.max(marginRight, paddingAmt);
                    else if (sidebar.position === 'top') marginTop = Math.max(marginTop, paddingAmt);
                    else if (sidebar.position === 'bottom') marginBottom = Math.max(marginBottom, paddingAmt);
                });
                const wrapper = this.shadowRoot?.querySelector('.vi-sidebar-container__content-wrapper');
                if (wrapper) {
                    wrapper.style.padding = marginLeft || marginRight || marginTop || marginBottom ? `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px` : '';
                    wrapper.style.transform = translateX || translateY ? `translate(${translateX}px, ${translateY}px)` : '';
                }
            }
            _getSidebarSize(sidebar) {
                const isVertical = sidebar.position === 'left' || sidebar.position === 'right' || sidebar.position === 'start' || sidebar.position === 'end';
                if (isVertical) {
                    // In dock mode, offsetWidth transitions from 0 during animation -- it's unreliable.
                    // Use the inline CSS variable (set by the resizer) or fall back to 250px default.
                    if (sidebar.dock) {
                        return parseFloat(sidebar.style.getPropertyValue('--vi-sidebar-width')) || 250;
                    }
                    return sidebar.offsetWidth || parseFloat(getComputedStyle(sidebar).getPropertyValue('--vi-sidebar-width')) || 250;
                }
                if (sidebar.dock) {
                    return parseFloat(sidebar.style.getPropertyValue('--vi-sidebar-height')) || 250;
                }
                return sidebar.offsetHeight || parseFloat(getComputedStyle(sidebar).getPropertyValue('--vi-sidebar-height')) || 250;
            }
        }
    }
}();

registerIcons([
    homeIcon,
    usersIcon,
    documentIcon,
    edit1Icon,
    chevronRightIcon
]);
const meta = {
    title: 'Components/Sidebar',
    component: 'vi-sidebar',
    argTypes: {
        mode: {
            control: 'select',
            options: [
                'over',
                'push',
                'slide'
            ],
            defaultValue: 'over'
        },
        position: {
            control: 'select',
            options: [
                'left',
                'right',
                'top',
                'bottom',
                'start',
                'end'
            ],
            defaultValue: 'start'
        },
        opened: {
            control: 'boolean',
            defaultValue: true
        },
        dock: {
            control: 'boolean',
            defaultValue: false
        },
        dockedSize: {
            control: 'text',
            defaultValue: '50px'
        },
        showBackdrop: {
            control: 'boolean',
            defaultValue: false
        },
        animations: {
            control: 'boolean',
            defaultValue: true
        },
        closeOnClickBackdrop: {
            control: 'boolean',
            defaultValue: true
        },
        closeOnClickOutside: {
            control: 'boolean',
            defaultValue: false
        },
        keyClose: {
            control: 'boolean',
            description: 'Close sidebar on specific key press (default Escape)',
            defaultValue: true
        },
        resizable: {
            control: 'boolean',
            description: 'Allows resizing the sidebar width dynamically',
            defaultValue: false
        }
    },
    parameters: {
        layout: 'fullscreen'
    }
};
const renderSidebarTemplate = (args)=>b`
  <div style="height: 100vh; width: 100vw;">
    <vi-sidebar-container
      ?show-backdrop=${args.showBackdrop}
      ?animations=${args.animations}
    >
      <vi-sidebar
        id="demo-sidebar"
        slot="sidebar"
        ?opened=${args.opened}
        mode=${o$1(args.mode)}
        position=${o$1(args.position)}
        ?dock=${args.dock}
        docked-size=${o$1(args.dockedSize)}
        ?animations=${args.animations}
        ?show-backdrop=${args.showBackdrop}
        ?close-on-click-backdrop=${args.closeOnClickBackdrop}
        ?close-on-click-outside=${args.closeOnClickOutside}
        ?key-close=${args.keyClose}
        ?resizable=${args.resizable}
        style="--vi-sidebar-bg: #ffffff; border-right: 1px solid #e3e3e3; z-index: 9999;"
      >
        <div style="padding: 24px; display: flex; flex-direction: column; height: 100%; box-sizing: border-box;">
          <h3 style="margin-top: 0; margin-bottom: 32px; font-family: Inter, sans-serif; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 8px;">
            <vi-icon name="document" style="color: #4f46e5;"></vi-icon>
            Menu
          </h3>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; flex: 1;">
            <li><vi-button variant="text" style="width: 100%; justify-content: flex-start; color: #4b5563;"><vi-icon name="home" slot="prefix"></vi-icon> Dashboard</vi-button></li>
            <li><vi-button variant="text" style="width: 100%; justify-content: flex-start; color: #4b5563;"><vi-icon name="users" slot="prefix"></vi-icon> Team</vi-button></li>
            <li><vi-button variant="text" style="width: 100%; justify-content: flex-start; color: #4b5563;"><vi-icon name="document" slot="prefix"></vi-icon> Projects</vi-button></li>
            <li><vi-button variant="text" style="width: 100%; justify-content: flex-start; color: #4b5563;"><vi-icon name="edit-1" slot="prefix"></vi-icon> Settings</vi-button></li>
          </ul>
          <div style="margin-top: auto; padding-top: 24px; border-top: 1px solid #f3f4f6;">
            <vi-button 
              variant="outline" 
              style="width: 100%; border-color: #e5e7eb; color: #374151;"
              @click=${()=>document.querySelector('#demo-sidebar')?.removeAttribute('opened')}
            >
              Close Sidebar
            </vi-button>
          </div>
        </div>
      </vi-sidebar>

      <div slot="content" style="padding: 48px; height: 100%; box-sizing: border-box; background: #f9fafb; font-family: Inter, sans-serif;">
        <div style="max-width: 800px; margin: 0 auto;">
          <h1 style="color: #111827; font-weight: 700; margin-top: 0; font-size: 2.25rem;">Main Dashboard</h1>
          <p style="color: #4b5563; font-size: 1.125rem; line-height: 1.75; margin-bottom: 32px;">
            This is the main page content. The layout responds fluidly to the sidebar modes: Push, Slide, and Over.
          </p>
          
          <div style="display: flex; gap: 16px; margin-bottom: 48px;">
            <vi-button 
              variant="primary" 
              style="background-color: #4f46e5; border-color: #4f46e5; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);"
              @click=${(e)=>{
        e.stopPropagation();
        document.querySelector('#demo-sidebar')?.setAttribute('opened', 'true');
    }}
            >
              <vi-icon name="chevron-right" slot="prefix"></vi-icon>
              Open Menu
            </vi-button>
          </div>

          <div style="background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02); border: 1px solid #f3f4f6;">
            <h3 style="margin-top: 0; color: #111827;">System Status</h3>
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 0;">
              <strong>Current Mode:</strong> ${args.mode} <br/>
              <strong>Current Position:</strong> ${args.position}
            </p>
          </div>
        </div>
      </div>
    </vi-sidebar-container>
  </div>
`;
const DefaultOver = {
    render: renderSidebarTemplate,
    args: {
        mode: 'over',
        position: 'start',
        opened: false,
        showBackdrop: true
    }
};
const PushMode = {
    render: renderSidebarTemplate,
    args: {
        mode: 'push',
        position: 'start',
        opened: false,
        dock: false,
        dockedSize: '60px',
        showBackdrop: true,
        animations: true,
        resizable: true
    }
};
const SlideMode = {
    render: renderSidebarTemplate,
    args: {
        mode: 'slide',
        position: 'start',
        opened: true,
        showBackdrop: false
    }
};
const DockedMode = {
    render: renderSidebarTemplate,
    args: {
        mode: 'push',
        position: 'start',
        opened: true,
        dock: true,
        dockedSize: '0px',
        showBackdrop: false
    }
};
DefaultOver.parameters = {
    ...DefaultOver.parameters,
    docs: {
        ...DefaultOver.parameters?.docs,
        source: {
            originalSource: "{\n  render: renderSidebarTemplate,\n  args: {\n    mode: 'over',\n    position: 'start',\n    opened: false,\n    showBackdrop: true\n  }\n}",
            ...DefaultOver.parameters?.docs?.source
        }
    }
};
PushMode.parameters = {
    ...PushMode.parameters,
    docs: {
        ...PushMode.parameters?.docs,
        source: {
            originalSource: "{\n  render: renderSidebarTemplate,\n  args: {\n    mode: 'push',\n    position: 'start',\n    opened: false,\n    dock: false,\n    dockedSize: '60px',\n    showBackdrop: true,\n    animations: true,\n    resizable: true\n  }\n}",
            ...PushMode.parameters?.docs?.source
        }
    }
};
SlideMode.parameters = {
    ...SlideMode.parameters,
    docs: {
        ...SlideMode.parameters?.docs,
        source: {
            originalSource: "{\n  render: renderSidebarTemplate,\n  args: {\n    mode: 'slide',\n    position: 'start',\n    opened: true,\n    showBackdrop: false\n  }\n}",
            ...SlideMode.parameters?.docs?.source
        }
    }
};
DockedMode.parameters = {
    ...DockedMode.parameters,
    docs: {
        ...DockedMode.parameters?.docs,
        source: {
            originalSource: "{\n  render: renderSidebarTemplate,\n  args: {\n    mode: 'push',\n    position: 'start',\n    opened: true,\n    dock: true,\n    dockedSize: '0px',\n    showBackdrop: false\n  }\n}",
            ...DockedMode.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["DefaultOver","PushMode","SlideMode","DockedMode"];

export { DefaultOver, DockedMode, PushMode, SlideMode, __namedExportsOrder, meta as default };
