import { r, i, b } from './iframe-9yd_z6c6.js';
import { V as ViElement, t, n } from './vi-element-D7bP2wsn.js';
import { e } from './class-map-BnH_mZac.js';

const skeletonStyles = "@charset \"UTF-8\";@layer reset,components,utilities;:root{--vi-animation-duration-fast: .15s;--vi-animation-duration-base: .3s;--vi-animation-duration-slow: .5s;--vi-animation-easing-standard: cubic-bezier(.2, 0, 0, 1);--vi-animation-easing-entrance: cubic-bezier(0, 0, .2, 1);--vi-animation-easing-exit: cubic-bezier(.4, 0, 1, 1);--vi-animation-easing-bounce: cubic-bezier(.34, 1.56, .64, 1);--vi-animation-expand-max-height: 100dvh;--vi-animation-expand-max-width: 100vw}@keyframes vi-fade-in{0%{opacity:0}to{opacity:1}}@keyframes vi-fade-out{0%{opacity:1}to{opacity:0}}@keyframes vi-fade-in-up{0%{opacity:0;transform:translate3d(0,1rem,0)}to{opacity:1;transform:translateZ(0)}}@keyframes vi-fade-in-down{0%{opacity:0;transform:translate3d(0,-1rem,0)}to{opacity:1;transform:translateZ(0)}}@keyframes vi-fade-in-left{0%{opacity:0;transform:translate3d(-1rem,0,0)}to{opacity:1;transform:translateZ(0)}}@keyframes vi-fade-in-right{0%{opacity:0;transform:translate3d(1rem,0,0)}to{opacity:1;transform:translateZ(0)}}@keyframes vi-fade-out-up{0%{opacity:1;transform:translateZ(0)}to{opacity:0;transform:translate3d(0,-1rem,0)}}@keyframes vi-fade-out-down{0%{opacity:1;transform:translateZ(0)}to{opacity:0;transform:translate3d(0,1rem,0)}}@keyframes vi-fade-out-left{0%{opacity:1;transform:translateZ(0)}to{opacity:0;transform:translate3d(-1rem,0,0)}}@keyframes vi-fade-out-right{0%{opacity:1;transform:translateZ(0)}to{opacity:0;transform:translate3d(1rem,0,0)}}@keyframes vi-zoom-in{0%{opacity:0;transform:scale3d(.92,.92,.92)}to{opacity:1;transform:scaleZ(1)}}@keyframes vi-zoom-out{0%{opacity:1;transform:scaleZ(1)}to{opacity:0;transform:scale3d(.92,.92,.92)}}@keyframes vi-scale-up{0%{transform:scale3d(.8,.8,.8)}to{transform:scaleZ(1)}}@keyframes vi-scale-down{0%{transform:scale3d(1.2,1.2,1.2)}to{transform:scaleZ(1)}}@keyframes vi-bounce-in{0%{opacity:0;transform:scale3d(.3,.3,.3)}50%{opacity:.9;transform:scale3d(1.08,1.08,1.08)}75%{transform:scale3d(.95,.95,.95)}to{opacity:1;transform:scaleZ(1)}}@keyframes vi-bounce-out{0%{opacity:1;transform:scaleZ(1)}20%{transform:scale3d(.9,.9,.9)}50%{opacity:1;transform:scale3d(1.1,1.1,1.1)}to{opacity:0;transform:scale3d(.3,.3,.3)}}@keyframes vi-pop-in{0%{opacity:0;transform:scale3d(.8,.8,1)}70%{transform:scale3d(1.05,1.05,1)}to{opacity:1;transform:scaleZ(1)}}@keyframes vi-pop-out{0%{opacity:1;transform:scaleZ(1)}to{opacity:0;transform:scale3d(.8,.8,1)}}@keyframes vi-slide-in-top{0%{transform:translate3d(0,-100%,0)}to{transform:translateZ(0)}}@keyframes vi-slide-in-bottom{0%{transform:translate3d(0,100%,0)}to{transform:translateZ(0)}}@keyframes vi-slide-in-left{0%{transform:translate3d(-100%,0,0)}to{transform:translateZ(0)}}@keyframes vi-slide-in-right{0%{transform:translate3d(100%,0,0)}to{transform:translateZ(0)}}@keyframes vi-slide-out-top{0%{transform:translateZ(0)}to{transform:translate3d(0,-100%,0)}}@keyframes vi-slide-out-bottom{0%{transform:translateZ(0)}to{transform:translate3d(0,100%,0)}}@keyframes vi-slide-out-left{0%{transform:translateZ(0)}to{transform:translate3d(-100%,0,0)}}@keyframes vi-slide-out-right{0%{transform:translateZ(0)}to{transform:translate3d(100%,0,0)}}@keyframes vi-flip-x{0%{transform:perspective(400px) rotateX(90deg);opacity:0}to{transform:perspective(400px) rotateX(0);opacity:1}}@keyframes vi-flip-y{0%{transform:perspective(400px) rotateY(90deg);opacity:0}to{transform:perspective(400px) rotateY(0);opacity:1}}@keyframes vi-perspective-pop{0%{transform:perspective(600px) translateZ(-100px);opacity:0}to{transform:perspective(600px) translateZ(0);opacity:1}}@keyframes vi-expand-vertical{0%{max-height:0;opacity:0}to{max-height:var(--vi-animation-expand-max-height, 100dvh);opacity:1}}@keyframes vi-collapse-vertical{0%{max-height:var(--vi-animation-expand-max-height, 100dvh);opacity:1}to{max-height:0;opacity:0}}@keyframes vi-expand-horizontal{0%{max-width:0;opacity:0}to{max-width:var(--vi-animation-expand-max-width, 100vw);opacity:1}}@keyframes vi-collapse-horizontal{0%{max-width:var(--vi-animation-expand-max-width, 100vw);opacity:1}to{max-width:0;opacity:0}}@keyframes vi-pulse{0%{transform:scaleZ(1)}50%{transform:scale3d(1.05,1.05,1.05)}to{transform:scaleZ(1)}}@keyframes vi-bounce{0%,20%,53%,80%,to{transform:translateZ(0)}40%,43%{transform:translate3d(0,-12px,0)}70%{transform:translate3d(0,-6px,0)}90%{transform:translate3d(0,-2px,0)}}@keyframes vi-shake{0%,to{transform:translateZ(0)}10%,30%,50%,70%,90%{transform:translate3d(-4px,0,0)}20%,40%,60%,80%{transform:translate3d(4px,0,0)}}@keyframes vi-wobble{0%,to{transform:translateZ(0) rotate(0)}15%{transform:translate3d(-15%,0,0) rotate(-4deg)}30%{transform:translate3d(12%,0,0) rotate(3deg)}45%{transform:translate3d(-9%,0,0) rotate(-2deg)}60%{transform:translate3d(6%,0,0) rotate(1deg)}75%{transform:translate3d(-3%,0,0) rotate(-1deg)}}@keyframes vi-heartbeat{0%{transform:scale(1)}14%{transform:scale(1.15)}28%{transform:scale(1)}42%{transform:scale(1.15)}70%{transform:scale(1)}}@keyframes vi-shimmer{0%{background-position:-200% 0}to{background-position:200% 0}}@keyframes vi-pulse{0%,to{opacity:1}50%{opacity:.4}}@layer components{.vi-skeleton{display:block;background:var(--vi-skeleton-color, var(--vi-layer-02, #f3f4f6));box-sizing:border-box;transition:background .3s ease}.vi-skeleton--animation-shimmer{background:linear-gradient(90deg,var(--vi-skeleton-color, var(--vi-layer-02, #f3f4f6)) 25%,var(--vi-skeleton-to-color, var(--vi-layer-03, #e5e7eb)) 37%,var(--vi-skeleton-color, var(--vi-layer-02, #f3f4f6)) 63%);background-size:400% 100%;animation:vi-shimmer 1.4s ease infinite}.vi-skeleton--animation-pulse{animation:vi-pulse 1.5s ease-in-out infinite}}:host{display:block;width:var(--vi-skeleton-width, 100%);height:var(--vi-skeleton-height, 1rem);border-radius:var(--vi-skeleton-radius, var(--vi-border-radius-sm, 4px))}:host([variant=circle]){width:var(--vi-skeleton-width, 2.5rem);height:var(--vi-skeleton-height, 2.5rem);border-radius:var(--vi-skeleton-radius, 50%)}:host([variant=rect]){width:var(--vi-skeleton-width, 100%);height:var(--vi-skeleton-height, 9.375rem);border-radius:var(--vi-skeleton-radius, var(--vi-border-radius-md, 6px))}.vi-skeleton{width:100%;height:100%;border-radius:inherit}";

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
var _dec, _initClass, _ViElement, _dec1, _dec2, /** The shape of the skeleton */ _init_variant, /** The animation style */ _init_animation, _initProto;
let _ViSkeleton;
_dec = t('vi-skeleton'), _dec1 = n({
    type: String,
    reflect: true
}), _dec2 = n({
    type: String,
    reflect: true
});
new class extends _identity {
    constructor(){
        super(_ViSkeleton), _initClass();
    }
    static{
        class ViSkeleton extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_variant, _init_animation, _initProto], c: [_ViSkeleton, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "variant"
                    ],
                    [
                        _dec2,
                        1,
                        "animation"
                    ]
                ], [
                    _dec
                ], _ViElement));
            }
            static styles = i`${r(skeletonStyles)}`;
            #___private_variant_1 = (_initProto(this), _init_variant(this, 'text'));
            get variant() {
                return this.#___private_variant_1;
            }
            set variant(_v) {
                this.#___private_variant_1 = _v;
            }
            #___private_animation_2 = _init_animation(this, 'shimmer');
            get animation() {
                return this.#___private_animation_2;
            }
            set animation(_v) {
                this.#___private_animation_2 = _v;
            }
            render() {
                const classes = {
                    'vi-skeleton': true,
                    [`vi-skeleton--${this.variant}`]: true,
                    [`vi-skeleton--animation-${this.animation}`]: true
                };
                return b`
      <div class=${e(classes)} part="skeleton"></div>
    `;
            }
        }
    }
}();
