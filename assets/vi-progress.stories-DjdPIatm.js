import { c as i, r, b, A, w } from './iframe-D4zu5Ix9.js';
import { t, n } from './vi-element-BRb8_cc9.js';
import { e } from './class-map-BrS1GRSy.js';
import { o } from './style-map-Dh4jB10O.js';
import './vi-icon-BINcKKFQ.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import { c as checkCircleIcon } from './check-circle-BQwul-8G.js';
import { c as checkIcon } from './check-D9SDO18H.js';
import { x as xIcon } from './x-3JmBhc9n.js';
import { o as o$1 } from './if-defined-X7o0wmDc.js';
import './preload-helper-D5QYaGzd.js';
import './directive-BKuZRRPO.js';
import './state-CLgu7NT9.js';

const styles = "@charset \"UTF-8\";@layer reset,components,utilities;:host{display:block;width:100%}.vi-progress{display:flex;align-items:center;gap:var(--vi-progress-gap, var(--vi-spacing-sm, .75rem));font-family:var(--vi-font-family, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));--progress-track-bg: var(--vi-progress-track-bg, var(--vi-layer-03, #e5e7eb));--progress-indicator-bg: var(--vi-progress-indicator-bg, var(--vi-color-primary, #3676d0));--progress-text-color: var(--vi-progress-text-color, var(--vi-text-primary, #111827));--progress-border-radius: var(--vi-progress-border-radius, var(--vi-border-radius-full, 9999px));--progress-line-height: var(--vi-progress-line-height, .5rem);--progress-circle-size: var(--vi-progress-circle-size, 7.5rem);--progress-font-size: var(--vi-progress-font-size, var(--vi-font-size-base, .875rem))}.vi-progress.vi-progress--variant-primary{--progress-indicator-bg: var(--vi-progress-primary-bg, var(--vi-color-primary, #3676d0))}.vi-progress.vi-progress--variant-success{--progress-indicator-bg: var(--vi-progress-success-bg, var(--vi-color-green-500, #489167))}.vi-progress.vi-progress--variant-error{--progress-indicator-bg: var(--vi-progress-error-bg, var(--vi-color-red-500, #fb3c1e))}.vi-progress.vi-progress--variant-warning{--progress-indicator-bg: var(--vi-progress-warning-bg, var(--vi-color-yellow-500, #ffba00))}.vi-progress.vi-progress--size-sm{--progress-line-height: var(--vi-progress-line-height-sm, .375rem);--progress-font-size: var(--vi-progress-font-size-sm, var(--vi-font-size-sm, .8125rem));--progress-circle-size: var(--vi-progress-circle-size-sm, 5rem)}.vi-progress.vi-progress--size-md{--progress-line-height: var(--vi-progress-line-height-md, .5rem);--progress-font-size: var(--vi-progress-font-size-md, var(--vi-font-size-base, .875rem));--progress-circle-size: var(--vi-progress-circle-size-md, 7.5rem)}.vi-progress.vi-progress--size-lg{--progress-line-height: var(--vi-progress-line-height-lg, .75rem);--progress-font-size: var(--vi-progress-font-size-lg, var(--vi-font-size-lg, 1rem));--progress-circle-size: var(--vi-progress-circle-size-lg, 10rem)}.vi-progress--line .vi-progress-outer{flex:1 1 auto}.vi-progress--line .vi-progress-track{background-color:var(--progress-track-bg);border-radius:var(--progress-border-radius);height:var(--progress-line-height);overflow:hidden;position:relative;width:100%}.vi-progress--line .vi-progress-success-indicator{background-color:var(--progress-success-bg, var(--vi-color-success, #489167));border-radius:var(--progress-border-radius);height:100%;position:absolute;left:0;top:0;transition:width .3s cubic-bezier(.4,0,.2,1)}.vi-progress--line .vi-progress-indicator{background-color:var(--progress-indicator-bg);border-radius:var(--progress-border-radius);height:100%;position:absolute;left:0;top:0;transition:width .3s cubic-bezier(.4,0,.2,1),background-color .3s ease}.vi-progress--line.vi-progress--status-active .vi-progress-indicator:before{content:\"\";position:absolute;inset:0;background:var(--vi-progress-gleam-bg, var(--vi-layer-01, #ffffff));opacity:0;animation:vi-progress-active-gleam 2s cubic-bezier(.23,1,.32,1) infinite}.vi-progress--circle,.vi-progress--dashboard{position:relative;display:inline-flex;flex-direction:column;justify-content:center;align-items:center;width:var(--progress-circle-size);height:var(--progress-circle-size);gap:0}.vi-progress--circle .vi-progress-circle-svg,.vi-progress--dashboard .vi-progress-circle-svg{width:100%;height:100%;transform:rotate(-90deg)}.vi-progress--circle .vi-progress-circle-track,.vi-progress--dashboard .vi-progress-circle-track{fill:transparent;stroke:var(--progress-track-bg);stroke-width:var(--vi-progress-circle-stroke-width, 6)}.vi-progress--circle .vi-progress-circle-success,.vi-progress--dashboard .vi-progress-circle-success{fill:transparent;stroke:var(--progress-success-bg, var(--vi-color-success, #489167));stroke-width:var(--vi-progress-circle-stroke-width, 6);transition:stroke-dashoffset .3s cubic-bezier(.4,0,.2,1)}.vi-progress--circle .vi-progress-circle-indicator,.vi-progress--dashboard .vi-progress-circle-indicator{fill:transparent;stroke:var(--progress-indicator-bg);stroke-width:var(--vi-progress-circle-stroke-width, 6);transition:stroke-dashoffset .3s cubic-bezier(.4,0,.2,1),stroke .3s ease}.vi-progress--circle .vi-progress-info,.vi-progress--dashboard .vi-progress-info{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100%;text-align:center}.vi-progress--steps .vi-progress-steps{flex:1 1 auto;display:flex;gap:var(--vi-progress-step-gap, .25rem);align-items:center}.vi-progress--steps .vi-progress-step-item{flex:1;border-radius:var(--progress-border-radius);transition:background-color .3s ease,height .3s ease}.vi-progress-info{color:var(--progress-text-color);font-size:var(--progress-font-size);line-height:1;white-space:nowrap;word-break:keep-all;display:flex;align-items:center;justify-content:center}.vi-progress-info vi-icon{font-size:calc(var(--progress-font-size) * 1.15)}.vi-progress--variant-success .vi-progress-info vi-icon{color:var(--progress-indicator-bg)}.vi-progress--variant-error .vi-progress-info vi-icon{color:var(--progress-indicator-bg)}.vi-progress--line.vi-progress--status-success .vi-progress-info vi-icon,.vi-progress--line.vi-progress--status-exception .vi-progress-info vi-icon{background-color:var(--progress-indicator-bg);color:var(--vi-text-inverse, #ffffff);border-radius:50%;width:1em;height:1em;display:inline-flex;align-items:center;justify-content:center}@keyframes vi-progress-active-gleam{0%{opacity:.1;width:0}20%{opacity:.5;width:0}to{opacity:0;width:100%}}@media(prefers-reduced-motion:reduce){.vi-progress-indicator{transition:none!important}.vi-progress--status-active .vi-progress-indicator:before{animation:none!important}.vi-progress-circle-indicator{transition:none!important}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}";

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
var _dec, _initClass, _LitElement, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, /** Current progress value (0 to max) */ _init_value, /** Maximum progress value */ _init_max, /** Visual type of the progress bar */ _init_type, /** Semantic color variant */ _init_variant, /** Visual size */ _init_size, /** Status overrides behavior and variant (normal, active, exception, success) */ _init_status, /** Whether to show the info text/icon alongside the progress */ _init_showInfo, /** SVG stroke linecap for circle or border-radius handling for line */ _init_strokeLinecap, /** Number of steps for a segmented progress bar */ _init_steps, /** Value for secondary success segment */ _init_successPercent, /** Custom stroke color (string or gradient object) */ _init_strokeColor, /** Custom trail color */ _init_trailColor, /** Custom stroke width (in px) */ _init_strokeWidth, /** Width for circle/dashboard in px */ _init_width, /** Gap degree for circle/dashboard (0-360) */ _init_gapDegree, /** Gap position for circle/dashboard */ _init_gapPosition, /** Formatter for percentage text */ _init_format, /** Forwarded aria-label for accessibility */ _init_ariaLabel, _initProto;
registerIcons([
    checkIcon,
    xIcon,
    checkCircleIcon
]);
let _ViProgress;
_dec = t('vi-progress'), _dec1 = n({
    type: Number
}), _dec2 = n({
    type: Number
}), _dec3 = n({
    type: String,
    reflect: true
}), _dec4 = n({
    type: String,
    reflect: true
}), _dec5 = n({
    type: String,
    reflect: true
}), _dec6 = n({
    type: String,
    reflect: true
}), _dec7 = n({
    type: Boolean,
    attribute: 'show-info'
}), _dec8 = n({
    type: String,
    attribute: 'stroke-linecap'
}), _dec9 = n({
    type: Number
}), _dec10 = n({
    type: Number,
    attribute: 'success-percent'
}), _dec11 = n(), _dec12 = n({
    type: String,
    attribute: 'trail-color'
}), _dec13 = n({
    type: Number,
    attribute: 'stroke-width'
}), _dec14 = n({
    type: Number
}), _dec15 = n({
    type: Number,
    attribute: 'gap-degree'
}), _dec16 = n({
    type: String,
    attribute: 'gap-position'
}), _dec17 = n({
    attribute: false
}), _dec18 = n({
    attribute: 'aria-label'
});
new class extends _identity {
    constructor(){
        super(_ViProgress), _initClass();
    }
    static{
        class ViProgress extends (_LitElement = i) {
            static{
                ({ e: [_init_value, _init_max, _init_type, _init_variant, _init_size, _init_status, _init_showInfo, _init_strokeLinecap, _init_steps, _init_successPercent, _init_strokeColor, _init_trailColor, _init_strokeWidth, _init_width, _init_gapDegree, _init_gapPosition, _init_format, _init_ariaLabel, _initProto], c: [_ViProgress, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "value"
                    ],
                    [
                        _dec2,
                        1,
                        "max"
                    ],
                    [
                        _dec3,
                        1,
                        "type"
                    ],
                    [
                        _dec4,
                        1,
                        "variant"
                    ],
                    [
                        _dec5,
                        1,
                        "size"
                    ],
                    [
                        _dec6,
                        1,
                        "status"
                    ],
                    [
                        _dec7,
                        1,
                        "showInfo"
                    ],
                    [
                        _dec8,
                        1,
                        "strokeLinecap"
                    ],
                    [
                        _dec9,
                        1,
                        "steps"
                    ],
                    [
                        _dec10,
                        1,
                        "successPercent"
                    ],
                    [
                        _dec11,
                        1,
                        "strokeColor"
                    ],
                    [
                        _dec12,
                        1,
                        "trailColor"
                    ],
                    [
                        _dec13,
                        1,
                        "strokeWidth"
                    ],
                    [
                        _dec14,
                        1,
                        "width"
                    ],
                    [
                        _dec15,
                        1,
                        "gapDegree"
                    ],
                    [
                        _dec16,
                        1,
                        "gapPosition"
                    ],
                    [
                        _dec17,
                        1,
                        "format"
                    ],
                    [
                        _dec18,
                        1,
                        "ariaLabel"
                    ]
                ], [
                    _dec
                ], _LitElement));
            }
            static styles = r(styles);
            _gradId = (_initProto(this), `vi-grad-${Math.random().toString(36).substring(2, 9)}`);
            #___private_value_1 = _init_value(this, 0);
            get value() {
                return this.#___private_value_1;
            }
            set value(_v) {
                this.#___private_value_1 = _v;
            }
            #___private_max_2 = _init_max(this, 100);
            get max() {
                return this.#___private_max_2;
            }
            set max(_v) {
                this.#___private_max_2 = _v;
            }
            #___private_type_3 = _init_type(this, 'line');
            get type() {
                return this.#___private_type_3;
            }
            set type(_v) {
                this.#___private_type_3 = _v;
            }
            #___private_variant_4 = _init_variant(this, 'primary');
            get variant() {
                return this.#___private_variant_4;
            }
            set variant(_v) {
                this.#___private_variant_4 = _v;
            }
            #___private_size_5 = _init_size(this, 'md');
            get size() {
                return this.#___private_size_5;
            }
            set size(_v) {
                this.#___private_size_5 = _v;
            }
            #___private_status_6 = _init_status(this, 'normal');
            get status() {
                return this.#___private_status_6;
            }
            set status(_v) {
                this.#___private_status_6 = _v;
            }
            #___private_showInfo_7 = _init_showInfo(this, true);
            get showInfo() {
                return this.#___private_showInfo_7;
            }
            set showInfo(_v) {
                this.#___private_showInfo_7 = _v;
            }
            #___private_strokeLinecap_8 = _init_strokeLinecap(this, 'round');
            get strokeLinecap() {
                return this.#___private_strokeLinecap_8;
            }
            set strokeLinecap(_v) {
                this.#___private_strokeLinecap_8 = _v;
            }
            #___private_steps_9 = _init_steps(this, undefined);
            get steps() {
                return this.#___private_steps_9;
            }
            set steps(_v) {
                this.#___private_steps_9 = _v;
            }
            #___private_successPercent_10 = _init_successPercent(this, 0);
            get successPercent() {
                return this.#___private_successPercent_10;
            }
            set successPercent(_v) {
                this.#___private_successPercent_10 = _v;
            }
            #___private_strokeColor_11 = _init_strokeColor(this, undefined);
            get strokeColor() {
                return this.#___private_strokeColor_11;
            }
            set strokeColor(_v) {
                this.#___private_strokeColor_11 = _v;
            }
            #___private_trailColor_12 = _init_trailColor(this, undefined);
            get trailColor() {
                return this.#___private_trailColor_12;
            }
            set trailColor(_v) {
                this.#___private_trailColor_12 = _v;
            }
            #___private_strokeWidth_13 = _init_strokeWidth(this, undefined);
            get strokeWidth() {
                return this.#___private_strokeWidth_13;
            }
            set strokeWidth(_v) {
                this.#___private_strokeWidth_13 = _v;
            }
            #___private_width_14 = _init_width(this, undefined);
            get width() {
                return this.#___private_width_14;
            }
            set width(_v) {
                this.#___private_width_14 = _v;
            }
            #___private_gapDegree_15 = _init_gapDegree(this, undefined);
            get gapDegree() {
                return this.#___private_gapDegree_15;
            }
            set gapDegree(_v) {
                this.#___private_gapDegree_15 = _v;
            }
            #___private_gapPosition_16 = _init_gapPosition(this, undefined);
            get gapPosition() {
                return this.#___private_gapPosition_16;
            }
            set gapPosition(_v) {
                this.#___private_gapPosition_16 = _v;
            }
            #___private_format_17 = _init_format(this, undefined);
            get format() {
                return this.#___private_format_17;
            }
            set format(_v) {
                this.#___private_format_17 = _v;
            }
            #___private_ariaLabel_18 = _init_ariaLabel(this, null);
            get ariaLabel() {
                return this.#___private_ariaLabel_18;
            }
            set ariaLabel(_v) {
                this.#___private_ariaLabel_18 = _v;
            }
            get baseStyles() {
                const styles = {};
                if (this.strokeColor) {
                    if (typeof this.strokeColor === 'string') {
                        styles['--vi-progress-indicator-bg'] = this.strokeColor;
                    } else {
                        // Handle object format: { '0%': 'red', '100%': 'blue' } or { from: 'red', to: 'blue', direction: 'to right' }
                        const stops = Object.entries(this.strokeColor).filter(([key])=>key !== 'direction').map(([key, value])=>{
                            if (key === 'from') return `${value} 0%`;
                            if (key === 'to') return `${value} 100%`;
                            return `${value} ${key}`;
                        }).join(', ');
                        const direction = this.strokeColor.direction || 'to right';
                        styles['--vi-progress-indicator-bg'] = `linear-gradient(${direction}, ${stops})`;
                    }
                }
                if (this.trailColor) {
                    styles['--vi-progress-track-bg'] = this.trailColor;
                }
                if (this.strokeWidth !== undefined) {
                    styles['--vi-progress-line-height'] = `${this.strokeWidth}px`;
                    styles['--vi-progress-circle-stroke-width'] = `${this.strokeWidth}`;
                }
                if (this.width !== undefined && this.type !== 'line') {
                    styles['--vi-progress-circle-size'] = `${this.width}px`;
                    styles['width'] = `${this.width}px`;
                    styles['height'] = `${this.width}px`;
                }
                return styles;
            }
            get percentage() {
                if (this.max <= 0) return 0;
                const clampedValue = Math.max(0, Math.min(this.value, this.max));
                return Math.floor(clampedValue / this.max * 100);
            }
            get effectiveStatus() {
                if (this.status === 'normal' && this.value >= this.max) {
                    return 'success';
                }
                return this.status;
            }
            get effectiveVariant() {
                const status = this.effectiveStatus;
                if (status === 'exception') return 'error';
                if (status === 'success') return 'success';
                return this.variant;
            }
            renderInfo() {
                if (!this.showInfo) {
                    return b`<span class="sr-only">${this.percentage}%</span>`;
                }
                const isLine = this.type === 'line';
                const successIcon = isLine ? 'check-circle' : 'check';
                const errorIcon = 'x'; // We'll just style the 'x' with border-radius: 50% to look like a circle
                return b`
      <span part="info" class="vi-progress-info" aria-hidden="true">
        <slot name="info">
          ${this.effectiveStatus === 'exception' ? b`<vi-icon name=${errorIcon}></vi-icon>` : this.effectiveStatus === 'success' ? b`<vi-icon name=${successIcon}></vi-icon>` : b`${this.format ? this.format(this.percentage) : this.percentage + '%'}`}
        </slot>
      </span>
    `;
            }
            renderLine() {
                return b`
      <div class="vi-progress-outer">
        <div part="track" class="vi-progress-track">
          <div
            part="indicator"
            class="vi-progress-indicator"
            style=${o({
                    width: `${this.percentage}%`,
                    borderRadius: this.strokeLinecap === 'square' || this.strokeLinecap === 'butt' ? '0' : undefined
                })}
          ></div>
          ${this.successPercent > 0 ? b`<div
                class="vi-progress-success-indicator"
                style=${o({
                    width: `${Math.min(100, Math.max(0, this.successPercent))}%`,
                    borderRadius: this.strokeLinecap === 'square' || this.strokeLinecap === 'butt' ? '0' : undefined
                })}
              ></div>` : A}
        </div>
      </div>
      ${this.renderInfo()}
    `;
            }
            renderSteps() {
                const stepsCount = Math.max(1, this.steps ?? 1);
                const stepRatio = 100 / stepsCount;
                const currentStep = Math.floor(this.percentage / stepRatio);
                return b`
      <div class="vi-progress-steps">
        ${Array.from({
                    length: stepsCount
                }).map((_, i)=>{
                    const stepStyle = {
                        backgroundColor: i < currentStep ? typeof this.strokeColor === 'string' ? this.strokeColor : 'var(--vi-progress-indicator-bg)' : this.trailColor || 'var(--vi-progress-track-bg)',
                        height: this.strokeWidth ? `${this.strokeWidth}px` : 'var(--vi-progress-line-height)'
                    };
                    return b`
          <div class=${e({
                        'vi-progress-step-item': true,
                        'vi-progress-step-item--active': i < currentStep
                    })}
          style=${o(stepStyle)}></div>
        `;
                })}
      </div>
      ${this.renderInfo()}
    `;
            }
            renderCircle() {
                const radius = 47;
                const circumference = 2 * Math.PI * radius;
                const isDashboard = this.type === 'dashboard';
                const gapDeg = this.gapDegree ?? (isDashboard ? 75 : 0);
                const gapPosition = this.gapPosition ?? (isDashboard ? 'bottom' : 'top');
                const gapLength = gapDeg / 360 * circumference;
                const drawLength = circumference - gapLength;
                // Rotate to position the gap correctly
                let rotation = -90; // Default is gap at top (for circle)
                if (isDashboard) {
                    if (gapPosition === 'bottom') rotation = 90 + gapDeg / 2;
                    if (gapPosition === 'top') rotation = -90 + gapDeg / 2;
                    if (gapPosition === 'left') rotation = 180 + gapDeg / 2;
                    if (gapPosition === 'right') rotation = 0 + gapDeg / 2;
                }
                // Gradient parsing
                let gradientDefs = A;
                let circleStrokeColor = typeof this.strokeColor === 'string' ? this.strokeColor : undefined;
                if (this.strokeColor) {
                    if (typeof this.strokeColor === 'string' && this.strokeColor.includes('linear-gradient')) {
                        const match = this.strokeColor.match(/linear-gradient\(\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*\)/);
                        if (match) {
                            gradientDefs = w`
            <defs>
              <linearGradient id=${this._gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color=${match[2]} />
                <stop offset="100%" stop-color=${match[3]} />
              </linearGradient>
            </defs>
          `;
                            circleStrokeColor = `url(#${this._gradId})`;
                        }
                    } else if (typeof this.strokeColor === 'object') {
                        const stops = Object.entries(this.strokeColor).filter(([key])=>key !== 'direction').map(([key, value])=>{
                            let offset = key;
                            if (key === 'from') offset = '0%';
                            if (key === 'to') offset = '100%';
                            return w`<stop offset=${offset} stop-color=${value} />`;
                        });
                        gradientDefs = w`
          <defs>
            <linearGradient id=${this._gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              ${stops}
            </linearGradient>
          </defs>
        `;
                        circleStrokeColor = `url(#${this._gradId})`;
                    }
                }
                // Circular Steps
                if (this.steps !== undefined && this.steps > 0) {
                    const stepsCount = this.steps;
                    const stepGap = 2; // Fixed gap size in px equivalent
                    const numGaps = isDashboard ? stepsCount - 1 : stepsCount;
                    const totalStepGapLength = numGaps * stepGap;
                    const stepLength = (drawLength - totalStepGapLength) / stepsCount;
                    const stepRatio = 100 / stepsCount;
                    const currentStep = Math.ceil(this.percentage / stepRatio);
                    const renderCircularStep = (i)=>{
                        const isActive = i < currentStep;
                        const offsetAngle = i * (stepLength + stepGap) * (360 / circumference);
                        const stepRotation = rotation + offsetAngle;
                        return w`
          <circle
            class=${isActive ? 'vi-progress-circle-indicator' : 'vi-progress-circle-track'}
            cx="50" cy="50" r=${radius}
            stroke-linecap=${this.strokeLinecap}
            style=${o({
                            strokeDasharray: `${stepLength} ${circumference}`,
                            strokeDashoffset: '0',
                            transform: `rotate(${stepRotation}deg)`,
                            transformOrigin: '50% 50%',
                            stroke: isActive && circleStrokeColor ? circleStrokeColor : !isActive && this.trailColor ? this.trailColor : undefined
                        })}
          />
        `;
                    };
                    return b`
        <svg viewBox="0 0 100 100" class="vi-progress-circle-svg" style="transform: none;">
          ${gradientDefs}
          ${Array.from({
                        length: stepsCount
                    }).map((_, i)=>renderCircularStep(i))}
        </svg>
        ${this.renderInfo()}
      `;
                }
                const offset = drawLength - this.percentage / 100 * drawLength;
                const successOffset = drawLength - Math.min(100, Math.max(0, this.successPercent)) / 100 * drawLength;
                return b`
      <svg viewBox="0 0 100 100" class="vi-progress-circle-svg" style="transform: rotate(${rotation}deg);">
        ${gradientDefs}
        <circle
          part="track"
          class="vi-progress-circle-track"
          cx="50"
          cy="50"
          r=${radius}
          stroke-linecap=${this.strokeLinecap}
          style=${o({
                    strokeDasharray: `${drawLength} ${circumference}`,
                    strokeDashoffset: isDashboard ? '0' : undefined
                })}
        />
        <circle
          part="indicator"
          class="vi-progress-circle-indicator"
          cx="50"
          cy="50"
          r=${radius}
          stroke-linecap=${this.strokeLinecap}
          style=${o({
                    strokeDasharray: `${drawLength} ${circumference}`,
                    strokeDashoffset: `${offset}`,
                    stroke: circleStrokeColor
                })}
        ></circle>
        ${this.successPercent > 0 ? b`
        <circle
          class="vi-progress-circle-success"
          cx="50"
          cy="50"
          r=${radius}
          stroke-linecap=${this.strokeLinecap}
          style=${o({
                    strokeDasharray: `${drawLength} ${circumference}`,
                    strokeDashoffset: `${successOffset}`
                })}
        ></circle>` : A}
      </svg>
      ${this.renderInfo()}
    `;
            }
            render() {
                const classes = {
                    'vi-progress': true,
                    [`vi-progress--${this.type}`]: true,
                    [`vi-progress--variant-${this.effectiveVariant}`]: true,
                    [`vi-progress--size-${this.size}`]: true,
                    [`vi-progress--status-${this.effectiveStatus}`]: true,
                    'vi-progress--steps': this.steps !== undefined
                };
                return b`
      <div
        part="base"
        class=${e(classes)}
        style=${o(this.baseStyles)}
        role="progressbar"
        aria-valuenow=${Math.max(0, Math.min(this.value, Math.max(0, this.max)))}
        aria-valuemin="0"
        aria-valuemax=${Math.max(0, this.max)}
        aria-label=${this.ariaLabel || 'progress'}
      >
        ${this.steps !== undefined && this.type === 'line' ? this.renderSteps() : this.type === 'line' ? this.renderLine() : this.renderCircle()}
      </div>
    `;
            }
        }
    }
}();

const meta = {
    title: 'Components / Progress',
    component: 'vi-progress',
    parameters: {
        docs: {
            description: {
                component: 'Displays the completion progress of a task. Can be represented as a linear bar or a circular ring.'
            }
        }
    },
    argTypes: {
        value: {
            control: {
                type: 'range',
                min: 0,
                max: 100,
                step: 1
            }
        },
        max: {
            control: 'number'
        },
        type: {
            control: 'radio',
            options: [
                'line',
                'circle'
            ]
        },
        variant: {
            control: 'radio',
            options: [
                'primary',
                'success',
                'error',
                'warning'
            ]
        },
        size: {
            control: 'radio',
            options: [
                'sm',
                'md',
                'lg'
            ]
        },
        status: {
            control: 'radio',
            options: [
                'normal',
                'active',
                'exception',
                'success'
            ]
        },
        showInfo: {
            control: 'boolean'
        },
        strokeLinecap: {
            control: 'radio',
            options: [
                'round',
                'butt',
                'square'
            ]
        }
    }
};
const Template = (args)=>b`
  <div style="width: 400px; max-width: 100%; padding: 2rem;">
    <vi-progress
      value=${o$1(args.value)}
      max=${o$1(args.max)}
      type=${o$1(args.type)}
      variant=${o$1(args.variant)}
      size=${o$1(args.size)}
      status=${o$1(args.status)}
      ?show-info=${args.showInfo !== false}
      stroke-linecap=${o$1(args.strokeLinecap)}
    ></vi-progress>
  </div>
`;
const Default = {
    render: Template,
    args: {
        value: 50,
        type: 'line'
    }
};
const ActiveAnimation = {
    render: Template,
    args: {
        value: 70,
        type: 'line',
        status: 'active'
    }
};
const Sizes = {
    render: ()=>b`
    <div style="width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
      <vi-progress value="30" size="sm"></vi-progress>
      <vi-progress value="50" size="md"></vi-progress>
      <vi-progress value="70" size="lg"></vi-progress>
    </div>
  `
};
const Statuses = {
    render: ()=>b`
    <div style="width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
      <vi-progress value="50" status="normal"></vi-progress>
      <vi-progress value="50" status="active"></vi-progress>
      <vi-progress value="50" status="success"></vi-progress>
      <vi-progress value="50" status="exception"></vi-progress>
    </div>
  `
};
const Circular = {
    render: ()=>b`
    <div style="padding: 2rem; display: flex; gap: 2rem; align-items: center;">
      <vi-progress type="circle" value="75"></vi-progress>
      <vi-progress type="circle" value="100" status="success"></vi-progress>
      <vi-progress type="circle" value="60" status="exception"></vi-progress>
    </div>
  `
};
const CustomColorsCSS = {
    render: ()=>b`
    <div style="width: 400px; max-width: 100%; padding: 2rem;">
      <p style="font-family: sans-serif; font-size: 14px; margin-bottom: 1rem; color: #666;">
        Demonstrating the 3-level CSS cascade overriding capabilities (like Ant Design's strokeColor property).
      </p>
      
      <vi-progress 
        value="80" 
        style="
          --vi-progress-indicator-bg: linear-gradient(90deg, #ff8a00, #e52e71);
          --vi-progress-track-bg: #ffe4e1;
          --vi-progress-text-color: #e52e71;
          --vi-progress-line-height: 16px;
        "
      ></vi-progress>
    </div>
  `
};
const CustomSlot = {
    render: ()=>b`
    <div style="width: 400px; max-width: 100%; padding: 2rem;">
      <vi-progress value="30">
        <span slot="info" style="font-size: 12px; color: #666;">3 / 10 Steps</span>
      </vi-progress>
    </div>
  `
};
const Dashboard = {
    render: ()=>b`
    <div style="padding: 2rem; display: flex; gap: 2rem; align-items: center;">
      <vi-progress type="dashboard" value="75"></vi-progress>
      <vi-progress type="dashboard" value="100" status="success"></vi-progress>
      <vi-progress type="dashboard" value="60" status="exception" gap-degree="120" gap-position="left"></vi-progress>
    </div>
  `
};
const Steps = {
    render: ()=>b`
    <div style="width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
      <vi-progress value="30" steps="3"></vi-progress>
      <vi-progress value="50" steps="5" size="sm"></vi-progress>
      <vi-progress value="70" steps="10" stroke-width="4"></vi-progress>
    </div>
  `
};
const SuccessSegment = {
    render: ()=>b`
    <div style="width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 2rem;">
      <vi-progress value="50" success-percent="30"></vi-progress>
      <vi-progress type="circle" value="50" success-percent="30"></vi-progress>
    </div>
  `
};
const DirectProps = {
    render: ()=>b`
    <div style="width: 400px; max-width: 100%; padding: 2rem;">
      <vi-progress 
        value="80" 
        stroke-color="linear-gradient(90deg, #ff8a00, #e52e71)"
        trail-color="#ffe4e1"
        stroke-width="16"
      ></vi-progress>
    </div>
  `
};
const AutoSuccess = {
    render: ()=>b`
    <div style="width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
      <vi-progress value="100"></vi-progress>
      <vi-progress type="circle" value="100"></vi-progress>
    </div>
  `
};
const CircularSteps = {
    render: ()=>b`
    <div style="padding: 2rem;">
      <vi-progress type="circle" value="50" steps="10"></vi-progress>
    </div>
  `
};
const GradientCircle = {
    render: ()=>b`
    <div style="padding: 2rem;">
      <vi-progress 
        type="circle" 
        value="80" 
        stroke-color="linear-gradient(90deg, #108ee9, #87d068)"
      ></vi-progress>
    </div>
  `
};
const ZorroParity = {
    render: ()=>b`
    <div style="padding: 2rem; display: flex; flex-direction: column; gap: 2rem;">
      <!-- Format Function -->
      <vi-progress 
        value="50" 
        .format=${(p)=>`${p} Days`}
      ></vi-progress>

      <!-- Complex Line Gradient -->
      <vi-progress 
        value="100" 
        .strokeColor=${{
            '0%': '#108ee9',
            '100%': '#87d068'
        }}
      ></vi-progress>

      <!-- Width + Complex Circle Gradient -->
      <vi-progress 
        type="circle" 
        value="75" 
        width="132"
        .strokeColor=${{
            '0%': '#108ee9',
            '100%': '#87d068'
        }}
      ></vi-progress>
    </div>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  render: Template,\n  args: {\n    value: 50,\n    type: 'line'\n  }\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
ActiveAnimation.parameters = {
    ...ActiveAnimation.parameters,
    docs: {
        ...ActiveAnimation.parameters?.docs,
        source: {
            originalSource: "{\n  render: Template,\n  args: {\n    value: 70,\n    type: 'line',\n    status: 'active'\n  }\n}",
            ...ActiveAnimation.parameters?.docs?.source
        }
    }
};
Sizes.parameters = {
    ...Sizes.parameters,
    docs: {
        ...Sizes.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;\">\n      <vi-progress value=\"30\" size=\"sm\"></vi-progress>\n      <vi-progress value=\"50\" size=\"md\"></vi-progress>\n      <vi-progress value=\"70\" size=\"lg\"></vi-progress>\n    </div>\n  `\n}",
            ...Sizes.parameters?.docs?.source
        }
    }
};
Statuses.parameters = {
    ...Statuses.parameters,
    docs: {
        ...Statuses.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;\">\n      <vi-progress value=\"50\" status=\"normal\"></vi-progress>\n      <vi-progress value=\"50\" status=\"active\"></vi-progress>\n      <vi-progress value=\"50\" status=\"success\"></vi-progress>\n      <vi-progress value=\"50\" status=\"exception\"></vi-progress>\n    </div>\n  `\n}",
            ...Statuses.parameters?.docs?.source
        }
    }
};
Circular.parameters = {
    ...Circular.parameters,
    docs: {
        ...Circular.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"padding: 2rem; display: flex; gap: 2rem; align-items: center;\">\n      <vi-progress type=\"circle\" value=\"75\"></vi-progress>\n      <vi-progress type=\"circle\" value=\"100\" status=\"success\"></vi-progress>\n      <vi-progress type=\"circle\" value=\"60\" status=\"exception\"></vi-progress>\n    </div>\n  `\n}",
            ...Circular.parameters?.docs?.source
        }
    }
};
CustomColorsCSS.parameters = {
    ...CustomColorsCSS.parameters,
    docs: {
        ...CustomColorsCSS.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"width: 400px; max-width: 100%; padding: 2rem;\">\n      <p style=\"font-family: sans-serif; font-size: 14px; margin-bottom: 1rem; color: #666;\">\n        Demonstrating the 3-level CSS cascade overriding capabilities (like Ant Design's strokeColor property).\n      </p>\n      \n      <vi-progress \n        value=\"80\" \n        style=\"\n          --vi-progress-indicator-bg: linear-gradient(90deg, #ff8a00, #e52e71);\n          --vi-progress-track-bg: #ffe4e1;\n          --vi-progress-text-color: #e52e71;\n          --vi-progress-line-height: 16px;\n        \"\n      ></vi-progress>\n    </div>\n  `\n}",
            ...CustomColorsCSS.parameters?.docs?.source
        }
    }
};
CustomSlot.parameters = {
    ...CustomSlot.parameters,
    docs: {
        ...CustomSlot.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"width: 400px; max-width: 100%; padding: 2rem;\">\n      <vi-progress value=\"30\">\n        <span slot=\"info\" style=\"font-size: 12px; color: #666;\">3 / 10 Steps</span>\n      </vi-progress>\n    </div>\n  `\n}",
            ...CustomSlot.parameters?.docs?.source
        }
    }
};
Dashboard.parameters = {
    ...Dashboard.parameters,
    docs: {
        ...Dashboard.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"padding: 2rem; display: flex; gap: 2rem; align-items: center;\">\n      <vi-progress type=\"dashboard\" value=\"75\"></vi-progress>\n      <vi-progress type=\"dashboard\" value=\"100\" status=\"success\"></vi-progress>\n      <vi-progress type=\"dashboard\" value=\"60\" status=\"exception\" gap-degree=\"120\" gap-position=\"left\"></vi-progress>\n    </div>\n  `\n}",
            ...Dashboard.parameters?.docs?.source
        }
    }
};
Steps.parameters = {
    ...Steps.parameters,
    docs: {
        ...Steps.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;\">\n      <vi-progress value=\"30\" steps=\"3\"></vi-progress>\n      <vi-progress value=\"50\" steps=\"5\" size=\"sm\"></vi-progress>\n      <vi-progress value=\"70\" steps=\"10\" stroke-width=\"4\"></vi-progress>\n    </div>\n  `\n}",
            ...Steps.parameters?.docs?.source
        }
    }
};
SuccessSegment.parameters = {
    ...SuccessSegment.parameters,
    docs: {
        ...SuccessSegment.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 2rem;\">\n      <vi-progress value=\"50\" success-percent=\"30\"></vi-progress>\n      <vi-progress type=\"circle\" value=\"50\" success-percent=\"30\"></vi-progress>\n    </div>\n  `\n}",
            ...SuccessSegment.parameters?.docs?.source
        }
    }
};
DirectProps.parameters = {
    ...DirectProps.parameters,
    docs: {
        ...DirectProps.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"width: 400px; max-width: 100%; padding: 2rem;\">\n      <vi-progress \n        value=\"80\" \n        stroke-color=\"linear-gradient(90deg, #ff8a00, #e52e71)\"\n        trail-color=\"#ffe4e1\"\n        stroke-width=\"16\"\n      ></vi-progress>\n    </div>\n  `\n}",
            ...DirectProps.parameters?.docs?.source
        }
    }
};
AutoSuccess.parameters = {
    ...AutoSuccess.parameters,
    docs: {
        ...AutoSuccess.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;\">\n      <vi-progress value=\"100\"></vi-progress>\n      <vi-progress type=\"circle\" value=\"100\"></vi-progress>\n    </div>\n  `\n}",
            ...AutoSuccess.parameters?.docs?.source
        }
    }
};
CircularSteps.parameters = {
    ...CircularSteps.parameters,
    docs: {
        ...CircularSteps.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"padding: 2rem;\">\n      <vi-progress type=\"circle\" value=\"50\" steps=\"10\"></vi-progress>\n    </div>\n  `\n}",
            ...CircularSteps.parameters?.docs?.source
        }
    }
};
GradientCircle.parameters = {
    ...GradientCircle.parameters,
    docs: {
        ...GradientCircle.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"padding: 2rem;\">\n      <vi-progress \n        type=\"circle\" \n        value=\"80\" \n        stroke-color=\"linear-gradient(90deg, #108ee9, #87d068)\"\n      ></vi-progress>\n    </div>\n  `\n}",
            ...GradientCircle.parameters?.docs?.source
        }
    }
};
ZorroParity.parameters = {
    ...ZorroParity.parameters,
    docs: {
        ...ZorroParity.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"padding: 2rem; display: flex; flex-direction: column; gap: 2rem;\">\n      <!-- Format Function -->\n      <vi-progress \n        value=\"50\" \n        .format=${(p: number) => `${p} Days`}\n      ></vi-progress>\n\n      <!-- Complex Line Gradient -->\n      <vi-progress \n        value=\"100\" \n        .strokeColor=${{\n    '0%': '#108ee9',\n    '100%': '#87d068'\n  }}\n      ></vi-progress>\n\n      <!-- Width + Complex Circle Gradient -->\n      <vi-progress \n        type=\"circle\" \n        value=\"75\" \n        width=\"132\"\n        .strokeColor=${{\n    '0%': '#108ee9',\n    '100%': '#87d068'\n  }}\n      ></vi-progress>\n    </div>\n  `\n}",
            ...ZorroParity.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","ActiveAnimation","Sizes","Statuses","Circular","CustomColorsCSS","CustomSlot","Dashboard","Steps","SuccessSegment","DirectProps","AutoSuccess","CircularSteps","GradientCircle","ZorroParity"];

export { ActiveAnimation, AutoSuccess, Circular, CircularSteps, CustomColorsCSS, CustomSlot, Dashboard, Default, DirectProps, GradientCircle, Sizes, Statuses, Steps, SuccessSegment, ZorroParity, __namedExportsOrder, meta as default };
