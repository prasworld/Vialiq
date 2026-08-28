import { b } from './iframe-D1QzB0mn.js';
import { V as ViElement, t, n } from './vi-element-C6aRBN2A.js';
import { r } from './state-CiJj2b7P.js';
import { E as EXIT_COUNTERPART, P as PRESET_KEYFRAMES, a as EXPAND_COLLAPSE_PRESETS } from './animation-constants-LE17KXe0.js';
import './vi-button-C7_ixw8d.js';
import './vi-alert-BBDlEnzE.js';
import './vi-chip-C9dJi6YJ.js';
import './vi-chip-group-DpZ5kPxH.js';
import './vi-badge-W-cI-8wI.js';
import './vi-input-DzX2iIcw.js';
import './vi-checkbox-95XAXQFF.js';
import './preload-helper-D5QYaGzd.js';
import './focusable-mixin-CmxOyPX5.js';
import './vi-icon-C4QGt-z3.js';
import './directive-BKuZRRPO.js';
import './registry-CeXOZkT9.js';
import './triangle-warning-BY6LbiCU.js';
import './lock-CCJyCMJ1.js';
import './x-3JmBhc9n.js';
import './query-assigned-elements-BJaGSqM0.js';
import './base-Cl6v8-BZ.js';
import './validity-mixin-BUuZWHUr.js';
import './if-non-empty-2j-LQqEv.js';
import './if-defined-BuiTVVkk.js';
import './class-map-f85MyfbH.js';

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
var _dec, _initClass, _ViElement, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _init_name, _init_enter, _init_exit, _init_duration, _init_delay, _init_easing, _init_iterations, _init_direction, _init_fill, _init_open, _init_autoPlay, _init_cascade, _init_stagger, _init_staggerSelector, _init_staggerDirection, _init_reducedMotion, _init_keyframes, _init__isAnimating, _initProto;
/** Shuffle indices using Fisher-Yates — no duplicate delay slots. */ function shuffleIndices(length) {
    const arr = Array.from({
        length
    }, (_, i)=>i);
    for(let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [
            arr[j],
            arr[i]
        ];
    }
    return arr;
}
let _ViAnimation;
_dec = t('vi-animation'), _dec1 = n({
    type: String,
    reflect: true
}), _dec2 = n({
    type: String,
    reflect: true
}), _dec3 = n({
    type: String,
    reflect: true
}), _dec4 = n({
    type: Number,
    reflect: true
}), _dec5 = n({
    type: Number,
    reflect: true
}), _dec6 = n({
    type: String,
    reflect: true
}), _dec7 = n({
    type: Number,
    reflect: true
}), _dec8 = n({
    type: String,
    reflect: true
}), _dec9 = n({
    type: String,
    reflect: true
}), _dec10 = n({
    type: Boolean,
    reflect: true
}), _dec11 = n({
    type: Boolean,
    attribute: 'auto-play',
    reflect: true
}), _dec12 = n({
    type: Boolean,
    reflect: true
}), _dec13 = n({
    type: Number,
    reflect: true
}), _dec14 = n({
    type: String,
    attribute: 'stagger-selector',
    reflect: true
}), _dec15 = n({
    type: String,
    attribute: 'stagger-direction',
    reflect: true
}), _dec16 = n({
    type: String,
    attribute: 'reduced-motion',
    reflect: true
}), _dec17 = n({
    attribute: false
}), _dec18 = r();
class ViAnimation extends (_ViElement = ViElement) {
    static{
        ({ e: [_init_name, _init_enter, _init_exit, _init_duration, _init_delay, _init_easing, _init_iterations, _init_direction, _init_fill, _init_open, _init_autoPlay, _init_cascade, _init_stagger, _init_staggerSelector, _init_staggerDirection, _init_reducedMotion, _init_keyframes, _init__isAnimating, _initProto], c: [_ViAnimation, _initClass] } = _apply_decs_2203_r(this, [
            [
                _dec1,
                1,
                "name"
            ],
            [
                _dec2,
                1,
                "enter"
            ],
            [
                _dec3,
                1,
                "exit"
            ],
            [
                _dec4,
                1,
                "duration"
            ],
            [
                _dec5,
                1,
                "delay"
            ],
            [
                _dec6,
                1,
                "easing"
            ],
            [
                _dec7,
                1,
                "iterations"
            ],
            [
                _dec8,
                1,
                "direction"
            ],
            [
                _dec9,
                1,
                "fill"
            ],
            [
                _dec10,
                1,
                "open"
            ],
            [
                _dec11,
                1,
                "autoPlay"
            ],
            [
                _dec12,
                1,
                "cascade"
            ],
            [
                _dec13,
                1,
                "stagger"
            ],
            [
                _dec14,
                1,
                "staggerSelector"
            ],
            [
                _dec15,
                1,
                "staggerDirection"
            ],
            [
                _dec16,
                1,
                "reducedMotion"
            ],
            [
                _dec17,
                1,
                "keyframes"
            ],
            [
                _dec18,
                1,
                "_isAnimating"
            ]
        ], [
            _dec
        ], _ViElement));
    }
    createRenderRoot() {
        return this;
    }
    #___private_name_1 = (_initProto(this), _init_name(this, 'fade-in'));
    get name() {
        return this.#___private_name_1;
    }
    set name(_v) {
        this.#___private_name_1 = _v;
    }
    #___private_enter_2 = _init_enter(this, '');
    get enter() {
        return this.#___private_enter_2;
    }
    set enter(_v) {
        this.#___private_enter_2 = _v;
    }
    #___private_exit_3 = _init_exit(this, '');
    get exit() {
        return this.#___private_exit_3;
    }
    set exit(_v) {
        this.#___private_exit_3 = _v;
    }
    #___private_duration_4 = _init_duration(this, 300);
    get duration() {
        return this.#___private_duration_4;
    }
    set duration(_v) {
        this.#___private_duration_4 = _v;
    }
    #___private_delay_5 = _init_delay(this, 0);
    get delay() {
        return this.#___private_delay_5;
    }
    set delay(_v) {
        this.#___private_delay_5 = _v;
    }
    #___private_easing_6 = _init_easing(this, 'cubic-bezier(0.2, 0, 0, 1)');
    get easing() {
        return this.#___private_easing_6;
    }
    set easing(_v) {
        this.#___private_easing_6 = _v;
    }
    #___private_iterations_7 = _init_iterations(this, 1);
    get iterations() {
        return this.#___private_iterations_7;
    }
    set iterations(_v) {
        this.#___private_iterations_7 = _v;
    }
    #___private_direction_8 = _init_direction(this, 'normal');
    get direction() {
        return this.#___private_direction_8;
    }
    set direction(_v) {
        this.#___private_direction_8 = _v;
    }
    #___private_fill_9 = _init_fill(this, 'forwards');
    get fill() {
        return this.#___private_fill_9;
    }
    set fill(_v) {
        this.#___private_fill_9 = _v;
    }
    #___private_open_10 = _init_open(this, true);
    get open() {
        return this.#___private_open_10;
    }
    set open(_v) {
        this.#___private_open_10 = _v;
    }
    #___private_autoPlay_11 = _init_autoPlay(this, true);
    get autoPlay() {
        return this.#___private_autoPlay_11;
    }
    set autoPlay(_v) {
        this.#___private_autoPlay_11 = _v;
    }
    #___private_cascade_12 = _init_cascade(this, false);
    get cascade() {
        return this.#___private_cascade_12;
    }
    set cascade(_v) {
        this.#___private_cascade_12 = _v;
    }
    #___private_stagger_13 = _init_stagger(this, 50);
    get stagger() {
        return this.#___private_stagger_13;
    }
    set stagger(_v) {
        this.#___private_stagger_13 = _v;
    }
    #___private_staggerSelector_14 = _init_staggerSelector(this, ':scope > *');
    get staggerSelector() {
        return this.#___private_staggerSelector_14;
    }
    set staggerSelector(_v) {
        this.#___private_staggerSelector_14 = _v;
    }
    #___private_staggerDirection_15 = _init_staggerDirection(this, 'normal');
    get staggerDirection() {
        return this.#___private_staggerDirection_15;
    }
    set staggerDirection(_v) {
        this.#___private_staggerDirection_15 = _v;
    }
    #___private_reducedMotion_16 = _init_reducedMotion(this, 'auto');
    get reducedMotion() {
        return this.#___private_reducedMotion_16;
    }
    set reducedMotion(_v) {
        this.#___private_reducedMotion_16 = _v;
    }
    #___private_keyframes_17 = _init_keyframes(this, null);
    get keyframes() {
        return this.#___private_keyframes_17;
    }
    set keyframes(_v) {
        this.#___private_keyframes_17 = _v;
    }
    #___private__isAnimating_18 = _init__isAnimating(this, false);
    get _isAnimating() {
        return this.#___private__isAnimating_18;
    }
    set _isAnimating(_v) {
        this.#___private__isAnimating_18 = _v;
    }
    _activeAnimations = [];
    /**
   * Monotonically incrementing sequence ID. Incremented on every new sequence
   * start (via _cancelSilently). Async continuations check their captured ID
   * against the current to detect stale callbacks.
   */ _sequenceId = 0;
    /**
   * Prevents updated() from re-calling show()/hide() when the imperative API
   * internally mutates this.open to keep it in sync with animation state.
   */ _updateGuard = false;
    /** Cached matchMedia object for prefers-reduced-motion. */ _reducedMotionMQ = null;
    _reducedMotionListener = null;
    // ─── Public getters ───────────────────────────────────────────────────────
    /** Whether an animation sequence is currently running. */ get isAnimating() {
        return this._isAnimating;
    }
    // ─── Lifecycle ────────────────────────────────────────────────────────────
    connectedCallback() {
        super.connectedCallback();
        if (!this.open) {
            this.hidden = true;
        } else if (this.autoPlay) {
            this.updateComplete.then(()=>this.play());
        }
        if (typeof window !== 'undefined') {
            this._reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
            this._reducedMotionListener = ()=>this.requestUpdate();
            this._reducedMotionMQ.addEventListener('change', this._reducedMotionListener);
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        // Cancel in-flight animations to release resources on detached nodes
        this._cancelSilently();
        if (this._reducedMotionMQ && this._reducedMotionListener) {
            this._reducedMotionMQ.removeEventListener('change', this._reducedMotionListener);
            this._reducedMotionMQ = null;
            this._reducedMotionListener = null;
        }
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        // _updateGuard prevents show()/hide() from being called again when the
        // imperative API internally sets this.open to keep property state in sync
        if (this._updateGuard) return;
        if (changedProperties.has('open') && changedProperties.get('open') !== undefined) {
            if (this.open) {
                this.show();
            } else {
                this.hide();
            }
        }
    }
    // ─── Imperative API ───────────────────────────────────────────────────────
    /** Returns a snapshot of the currently running Animation objects. */ getAnimations() {
        return [
            ...this._activeAnimations
        ];
    }
    /**
   * Animate element into view.
   * Fires cancelable `vi-animation-before-show` — call preventDefault() to block.
   */ async show() {
        const allowed = this._dispatchCancelable('vi-animation-before-show', {
            name: this.enter || this.name,
            target: this,
            phase: 'enter'
        });
        if (!allowed) {
            // If show() was triggered by a declarative open=true change while still hidden,
            // revert to a consistent closed state.
            if (this.open && this.hidden) {
                this._withUpdateGuard(()=>{
                    this.open = false;
                    this.hidden = true;
                });
            }
            return;
        }
        this._withUpdateGuard(()=>{
            if (!this.open) this.open = true;
            this.hidden = false;
        });
        const animName = this.enter || this.name || 'fade-in';
        await this._runAnimationSequence(animName, 'enter', false);
    }
    /**
   * Animate element out of view.
   * Fires cancelable `vi-animation-before-hide` — call preventDefault() to block.
   */ async hide() {
        const exitName = this.exit || EXIT_COUNTERPART[this.name] || 'fade-out';
        const allowed = this._dispatchCancelable('vi-animation-before-hide', {
            name: exitName,
            target: this,
            phase: 'exit'
        });
        if (!allowed) {
            if (!this.open && !this.hidden) {
                this._withUpdateGuard(()=>{
                    this.open = true;
                    this.hidden = false;
                });
            }
            return;
        }
        await this._runAnimationSequence(exitName, 'exit', true);
        this._withUpdateGuard(()=>{
            if (this.open) this.open = false;
            this.hidden = true;
        });
    }
    /** Toggle between show() and hide(). */ async toggle() {
        if (this.open) {
            await this.hide();
        } else {
            await this.show();
        }
    }
    /** Play the current `name` animation without changing visibility. */ async play() {
        const phase = this.open ? 'enter' : 'custom';
        await this._runAnimationSequence(this.name, phase, false);
    }
    pause() {
        this._activeAnimations.forEach((a)=>a.pause());
    }
    resume() {
        this._activeAnimations.forEach((a)=>a.play());
    }
    reverse() {
        this._activeAnimations.forEach((a)=>a.reverse());
    }
    /**
   * Cancel all running animations and fire `vi-animation-cancel`.
   */ cancel() {
        this._cancelSilently();
        this._dispatch('vi-animation-cancel', {
            name: this.name,
            target: this,
            phase: 'custom'
        });
    }
    /**
   * Jump all running animations to their end state and fire `vi-animation-finish`.
   */ finish() {
        const anims = [
            ...this._activeAnimations
        ];
        // Clear state first so stale callbacks don't double-process
        this._cancelSilently();
        anims.forEach((a)=>{
            try {
                a.finish();
            } catch  {}
        });
        this._dispatch('vi-animation-finish', {
            name: this.name,
            target: this,
            phase: 'custom'
        });
    }
    // ─── Private helpers ──────────────────────────────────────────────────────
    /**
   * Cancel all in-flight animations WITHOUT firing a public event.
   * Used for: self-interruption when a new sequence starts, and for lifecycle cleanup.
   */ _cancelSilently() {
        this._sequenceId++; // invalidate any pending async continuations
        this._activeAnimations.forEach((a)=>{
            try {
                a.cancel();
            } catch  {}
        });
        this._activeAnimations = [];
        this._isAnimating = false;
    }
    /**
   * Runs a function that mutates reactive properties without triggering
   * the updated() -> show()/hide() feedback loop.
   */ _withUpdateGuard(fn) {
        this._updateGuard = true;
        fn();
        this.updateComplete.then(()=>{
            this._updateGuard = false;
        });
    }
    _getTargetElements() {
        const childNodes = Array.from(this.children);
        if (childNodes.length === 0) return [
            this
        ];
        if (!this.cascade) return childNodes;
        const targetElements = [];
        for (const node of childNodes){
            let matched = false;
            try {
                if (node.matches(this.staggerSelector)) {
                    targetElements.push(node);
                    matched = true;
                }
                const children = Array.from(node.querySelectorAll(this.staggerSelector));
                if (children.length > 0) {
                    targetElements.push(...children);
                    matched = true;
                }
            } catch  {
                return childNodes; // graceful fallback to all child nodes
            }
            if (!matched) targetElements.push(node);
        }
        return targetElements.length > 0 ? targetElements : childNodes;
    }
    /**
   * Returns keyframes for a given animation name.
   * - Consumer keyframes are passed through as-is (Keyframe[] or PropertyIndexedKeyframes).
   * - Expand/collapse presets dynamically read scrollHeight/scrollWidth to avoid magic-number clipping.
   * - Falls back to PRESET_KEYFRAMES, then 'fade-in' if unknown.
   */ _getKeyframes(animName, phase, isReducedMotion, target) {
        // Explicit consumer-supplied keyframes take highest priority
        if (this.keyframes) return this.keyframes;
        // For built-in presets under reduced motion, substitute with safe opacity fades
        if (isReducedMotion) {
            return PRESET_KEYFRAMES[phase === 'exit' ? 'fade-out' : 'fade-in'];
        }
        // Dynamic expand/collapse using actual element dimensions
        if (EXPAND_COLLAPSE_PRESETS.has(animName) && target) {
            const h = target.scrollHeight;
            const w = target.scrollWidth;
            switch(animName){
                case 'expand-vertical':
                    return [
                        {
                            maxHeight: '0px',
                            opacity: 0,
                            overflow: 'hidden'
                        },
                        {
                            maxHeight: `${h}px`,
                            opacity: 1,
                            overflow: 'hidden'
                        }
                    ];
                case 'collapse-vertical':
                    return [
                        {
                            maxHeight: `${h}px`,
                            opacity: 1,
                            overflow: 'hidden'
                        },
                        {
                            maxHeight: '0px',
                            opacity: 0,
                            overflow: 'hidden'
                        }
                    ];
                case 'expand-horizontal':
                    return [
                        {
                            maxWidth: '0px',
                            opacity: 0,
                            overflow: 'hidden'
                        },
                        {
                            maxWidth: `${w}px`,
                            opacity: 1,
                            overflow: 'hidden'
                        }
                    ];
                case 'collapse-horizontal':
                    return [
                        {
                            maxWidth: `${w}px`,
                            opacity: 1,
                            overflow: 'hidden'
                        },
                        {
                            maxWidth: '0px',
                            opacity: 0,
                            overflow: 'hidden'
                        }
                    ];
            }
        }
        return PRESET_KEYFRAMES[animName] ?? PRESET_KEYFRAMES['fade-in'];
    }
    _calculateStaggerDelay(index, total, shuffledOrder) {
        if (!this.cascade || total <= 1) return this.delay;
        let orderIndex = index;
        if (this.staggerDirection === 'reverse') {
            orderIndex = total - 1 - index;
        } else if (this.staggerDirection === 'center') {
            orderIndex = Math.abs((total - 1) / 2 - index);
        } else if (this.staggerDirection === 'random' && shuffledOrder) {
            orderIndex = shuffledOrder[index];
        }
        return this.delay + orderIndex * this.stagger;
    }
    async _runAnimationSequence(animName, phase, isExitPhase) {
        const isReduced = this._shouldReduceMotion();
        const targets = this._getTargetElements();
        if (targets.length === 0) return;
        // Interrupt previous sequence silently (no vi-animation-cancel event)
        this._cancelSilently();
        const mySequenceId = this._sequenceId;
        this._isAnimating = true;
        // 'auto' mode: shorten duration AND substitute keyframes.
        // 'fade-only' mode: substitute keyframes only, original duration is preserved.
        const actualDuration = isReduced && this.reducedMotion !== 'fade-only' ? Math.min(this.duration, 100) : this.duration;
        this._dispatch('vi-animation-start', {
            name: animName,
            target: this,
            phase,
            duration: actualDuration,
            delay: this.delay
        });
        // Pre-compute shuffled order so all elements get unique, non-repeating delay slots
        const shuffledOrder = this.staggerDirection === 'random' ? shuffleIndices(targets.length) : undefined;
        const animationPromises = targets.map((el, index)=>{
            const elementDelay = isReduced ? 0 : this._calculateStaggerDelay(index, targets.length, shuffledOrder);
            const kf = this._getKeyframes(animName, phase, isReduced, el);
            const anim = el.animate(kf, {
                duration: actualDuration,
                delay: elementDelay,
                easing: this.easing,
                iterations: this.iterations,
                direction: this.direction,
                fill: this.fill
            });
            this._activeAnimations.push(anim);
            return anim.finished.then(()=>{
                // For exit animations: commit the end-frame styles to element.style and
                // cancel the WAAPI fill so external CSS can take over later (avoids
                // invisible elements if the element is re-shown via show() or style).
                if (isExitPhase) {
                    try {
                        anim.commitStyles();
                    } catch  {}
                    try {
                        anim.cancel();
                    } catch  {}
                }
            }, ()=>null);
        });
        await Promise.all(animationPromises);
        // Discard stale result if a newer sequence has already started
        if (this._sequenceId !== mySequenceId) return;
        this._isAnimating = false;
        this._activeAnimations = [];
        this._dispatch('vi-animation-end', {
            name: animName,
            target: this,
            phase,
            completed: true
        });
    }
    /**
   * Returns whether any reduced-motion adaptation should be applied.
   *
   * Both 'auto' and 'fade-only' gate on the OS/browser preference so that the attribute
   * does not override what the user has configured at the system level. The distinction
   * between them is captured in _runAnimationSequence:
   *   - 'auto':      shorten duration (≤100 ms) + substitute with opacity fade.
   *   - 'fade-only': substitute with opacity fade, but keep the original duration.
   *   - 'disable':   ignore OS preference entirely — always play the full animation.
   */ _shouldReduceMotion() {
        if (this.reducedMotion === 'disable') return false;
        // Gate on the OS/browser preference for both 'auto' and 'fade-only'.
        return this._reducedMotionMQ?.matches ?? (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    _dispatch(eventName, detail) {
        this.dispatchEvent(new CustomEvent(eventName, {
            detail,
            bubbles: true,
            composed: true
        }));
    }
    /**
   * Dispatch a cancelable event. Returns true if the animation should proceed
   * (i.e. preventDefault() was NOT called), false if it should be blocked.
   */ _dispatchCancelable(eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true
        });
        this.dispatchEvent(event);
        return !event.defaultPrevented;
    }
    static{
        _initClass();
    }
}

const meta = {
    title: 'Components/Animation',
    component: 'vi-animation',
    tags: [
        'autodocs'
    ],
    argTypes: {
        name: {
            control: 'select',
            options: [
                'fade-in',
                'fade-out',
                'fade-in-up',
                'fade-in-down',
                'fade-in-left',
                'fade-in-right',
                'zoom-in',
                'zoom-out',
                'scale-up',
                'scale-down',
                'bounce-in',
                'bounce-out',
                'pop-in',
                'pop-out',
                'slide-in-top',
                'slide-in-bottom',
                'slide-in-left',
                'slide-in-right',
                'flip-x',
                'flip-y',
                'perspective-pop',
                'expand-vertical',
                'collapse-vertical',
                'pulse',
                'bounce',
                'shake',
                'wobble',
                'heartbeat',
                'shimmer'
            ]
        },
        duration: {
            control: 'number'
        },
        delay: {
            control: 'number'
        },
        easing: {
            control: 'text'
        },
        cascade: {
            control: 'boolean'
        },
        stagger: {
            control: 'number'
        },
        staggerDirection: {
            control: 'select',
            options: [
                'normal',
                'reverse',
                'center',
                'random'
            ]
        },
        reducedMotion: {
            control: 'select',
            options: [
                'auto',
                'disable',
                'fade-only'
            ]
        }
    }
};
/**
 * 1. Default Interactive Preset Controls
 */ const Default = {
    render: (args)=>b`
    <div
      style="display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start; max-width: 480px;"
    >
      <vi-button
        variant="primary"
        @click=${(e)=>{
            const btn = e.currentTarget;
            const anim = btn.nextElementSibling;
            anim.play();
        }}
      >
        Replay Animation
      </vi-button>

      <vi-animation
        .name=${args.name}
        .duration=${args.duration}
        .delay=${args.delay}
        .easing=${args.easing}
        .reducedMotion=${args.reducedMotion}
      >
        <div
          style="padding: 1.5rem; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); width: 100%;"
        >
          <div
            style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;"
          >
            <h3 style="margin: 0; font-size: 1.1rem; color: #1a202c;">
              Clinical Subject Record
            </h3>
            <vi-badge variant="info" size="sm">Active</vi-badge>
          </div>
          <p
            style="margin: 0 0 1rem 0; color: #4a5568; font-size: 0.9rem; line-height: 1.5;"
          >
            Animation preset <code>${args.name}</code> running at
            hardware-accelerated 60/120fps.
          </p>
          <vi-alert variant="info" title="Protocol Status">
            Subject SUBJ-804 has completed Visit 3 screening.
          </vi-alert>
        </div>
      </vi-animation>
    </div>
  `,
    args: {
        name: 'fade-in-up',
        duration: 400,
        delay: 0,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
        reducedMotion: 'auto'
    }
};
/**
 * 2. Preset Catalog Showcase
 */ const PresetCatalogGallery = {
    render: ()=>{
        const presets = [
            {
                category: 'Fade & Slide',
                items: [
                    'fade-in-up',
                    'fade-in-down',
                    'slide-in-bottom',
                    'slide-in-right'
                ]
            },
            {
                category: 'Scale & Zoom',
                items: [
                    'zoom-in',
                    'scale-up',
                    'bounce-in',
                    'pop-in'
                ]
            },
            {
                category: '3D & Motion',
                items: [
                    'flip-x',
                    'flip-y',
                    'perspective-pop',
                    'expand-vertical'
                ]
            },
            {
                category: 'Attention Seekers',
                items: [
                    'pulse',
                    'bounce',
                    'shake',
                    'heartbeat'
                ]
            }
        ];
        return b`
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <div
          style="display: flex; justify-content: space-between; align-items: center;"
        >
          <h2 style="margin: 0; font-size: 1.25rem; font-family: sans-serif;">
            Hardware-Accelerated Animation Catalog
          </h2>
          <vi-button
            variant="secondary"
            size="sm"
            @click=${()=>{
            const anims = document.querySelectorAll('vi-animation.catalog-anim');
            anims.forEach((a)=>a.play());
        }}
          >
            Replay All Presets
          </vi-button>
        </div>

        ${presets.map((group)=>b`
            <div>
              <h3
                style="margin: 0 0 1rem 0; font-size: 1rem; color: #4a5568; font-family: sans-serif;"
              >
                ${group.category}
              </h3>
              <div
                style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;"
              >
                ${group.items.map((preset)=>b`
                    <div
                      style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;"
                    >
                      <div
                        style="display: flex; justify-content: space-between; align-items: center;"
                      >
                        <code
                          style="font-size: 0.8rem; font-weight: 600; color: #2b6cb0;"
                          >${preset}</code
                        >
                        <vi-button
                          variant="ghost"
                          size="xs"
                          @click=${(e)=>{
                    const card = e.currentTarget.closest('div')?.parentElement;
                    const anim = card?.querySelector('vi-animation');
                    anim?.play();
                }}
                        >
                          Play
                        </vi-button>
                      </div>
                      <vi-animation
                        class="catalog-anim"
                        name=${preset}
                        duration="1000"
                      >
                        <div
                          style="padding: 0.75rem; background: #ffffff; border: 1px solid #cbd5e0; border-radius: 6px; text-align: center; font-size: 0.85rem; font-weight: 500;"
                        >
                          ${preset}
                        </div>
                      </vi-animation>
                    </div>
                  `)}
              </div>
            </div>
          `)}
      </div>
    `;
    }
};
/**
 * 3. Enter & Exit Transitions (Modal / Panel Overlay)
 */ const EnterExitTransitions = {
    render: ()=>{
        let isOpen = true;
        return b`
      <div
        style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;"
      >
        <vi-button
          variant="primary"
          @click=${(e)=>{
            const container = e.currentTarget.parentElement;
            const anim = container?.querySelector('#drawer-anim');
            isOpen = !isOpen;
            if (isOpen) {
                anim.show();
            } else {
                anim.hide();
            }
        }}
        >
          Toggle Contextual Drawer (show / hide)
        </vi-button>

        <vi-animation
          id="drawer-anim"
          enter="fade-in-up"
          exit="fade-out-down"
          .duration=${350}
          .open=${isOpen}
        >
          <div
            style="padding: 1.5rem; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); width: 360px; display: flex; flex-direction: column; gap: 1rem;"
          >
            <div
              style="display: flex; justify-content: space-between; align-items: center;"
            >
              <h3 style="margin: 0; font-size: 1.1rem;">
                Protocol Deviation Form
              </h3>
              <vi-badge variant="warning" size="sm">Urgent</vi-badge>
            </div>
            <vi-input label="Subject Identifier" value="SUBJ-4092"></vi-input>
            <vi-input
              label="Deviation Description"
              placeholder="Enter clinical notes..."
            ></vi-input>
            <div
              style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.5rem;"
            >
              <vi-button variant="ghost" size="sm">Cancel</vi-button>
              <vi-button variant="primary" size="sm">Submit Report</vi-button>
            </div>
          </div>
        </vi-animation>
      </div>
    `;
    }
};
/**
 * 4. Cascading Staggered Grid & Table Rows
 */ const CascadingStagger = {
    render: (args)=>b`
    <div
      style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 600px;"
    >
      <div style="display: flex; gap: 1rem; align-items: center;">
        <vi-button
          variant="primary"
          @click=${(e)=>{
            const wrapper = e.currentTarget.parentElement?.nextElementSibling;
            wrapper.play();
        }}
        >
          Replay Cascading Stagger
        </vi-button>
        <span style="font-size: 0.85rem; color: #64748b;"
          >Direction: <strong>${args.staggerDirection}</strong></span
        >
      </div>

      <!-- Cascading Chips -->
      <vi-animation
        cascade
        .stagger=${args.stagger}
        .staggerDirection=${args.staggerDirection}
        enter="zoom-in"
        duration="300"
      >
        <vi-chip-group multi name="filters">
          <vi-chip value="all" selected>All Subjects</vi-chip>
          <vi-chip value="enrolled">Enrolled (142)</vi-chip>
          <vi-chip value="screened">Screened (89)</vi-chip>
          <vi-chip value="completed">Completed (56)</vi-chip>
          <vi-chip value="discontinued">Discontinued (12)</vi-chip>
        </vi-chip-group>
      </vi-animation>

      <!-- Cascading Table Rows -->
      <vi-animation
        cascade
        stagger-selector="tr"
        .stagger=${args.stagger}
        .staggerDirection=${args.staggerDirection}
        enter="fade-in-up"
        duration="350"
      >
        <table
          style="width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;"
        >
          <thead>
            <tr
              style="background: #f8fafc; text-align: left; font-size: 0.85rem; color: #475569;"
            >
              <th
                style="padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0;"
              >
                Subject ID
              </th>
              <th
                style="padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0;"
              >
                Site
              </th>
              <th
                style="padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0;"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 0.75rem 1rem; font-weight: 500;">
                SUBJ-1001
              </td>
              <td style="padding: 0.75rem 1rem;">Site 01</td>
              <td style="padding: 0.75rem 1rem;">
                <vi-badge variant="success" size="sm">Enrolled</vi-badge>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 0.75rem 1rem; font-weight: 500;">
                SUBJ-1002
              </td>
              <td style="padding: 0.75rem 1rem;">Site 01</td>
              <td style="padding: 0.75rem 1rem;">
                <vi-badge variant="info" size="sm">Screened</vi-badge>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 0.75rem 1rem; font-weight: 500;">
                SUBJ-1003
              </td>
              <td style="padding: 0.75rem 1rem;">Site 02</td>
              <td style="padding: 0.75rem 1rem;">
                <vi-badge variant="success" size="sm">Completed</vi-badge>
              </td>
            </tr>
            <tr>
              <td style="padding: 0.75rem 1rem; font-weight: 500;">
                SUBJ-1004
              </td>
              <td style="padding: 0.75rem 1rem;">Site 03</td>
              <td style="padding: 0.75rem 1rem;">
                <vi-badge variant="danger" size="sm">Discontinued</vi-badge>
              </td>
            </tr>
          </tbody>
        </table>
      </vi-animation>
    </div>
  `,
    args: {
        stagger: 60,
        staggerDirection: 'normal'
    }
};
/**
 * 5. Attention-Seeking Motion Patterns
 */ const AttentionSeekers = {
    render: ()=>b`
    <div
      style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 480px;"
    >
      <h3 style="margin: 0; font-size: 1.1rem; color: #1e293b;">
        Attention-Seeking UI Feedback
      </h3>

      <div style="display: flex; gap: 1rem; align-items: center;">
        <vi-button
          variant="secondary"
          size="sm"
          @click=${(e)=>{
            const btn = e.currentTarget;
            const anim = btn.nextElementSibling;
            anim.play();
        }}
        >
          Trigger Validation Shake
        </vi-button>
        <vi-animation name="shake" duration="400" .autoPlay=${false}>
          <vi-input
            label="Required Field"
            value=""
            status="invalid"
            validity-message="Field cannot be empty"
          ></vi-input>
        </vi-animation>
      </div>

      <div style="display: flex; gap: 1rem; align-items: center;">
        <vi-button
          variant="secondary"
          size="sm"
          @click=${(e)=>{
            const btn = e.currentTarget;
            const anim = btn.nextElementSibling;
            anim.play();
        }}
        >
          Trigger Alert Pulse
        </vi-button>
        <vi-animation name="pulse" duration="500" .autoPlay=${false}>
          <vi-alert variant="warning" title="Critical Notice">
            Unsaved lab results will be lost.
          </vi-alert>
        </vi-animation>
      </div>

      <div style="display: flex; gap: 1rem; align-items: center;">
        <vi-button
          variant="secondary"
          size="sm"
          @click=${(e)=>{
            const btn = e.currentTarget;
            const anim = btn.nextElementSibling;
            anim.play();
        }}
        >
          Trigger Badge Heartbeat
        </vi-button>
        <vi-animation name="heartbeat" duration="600" .autoPlay=${false}>
          <vi-badge variant="danger" size="md">9 Unread Alerts</vi-badge>
        </vi-animation>
      </div>
    </div>
  `
};
/**
 * 6. Skeleton Loader Shimmer to Content Cross-Fade
 */ const SkeletonToContentTransition = {
    render: ()=>{
        let isLoading = true;
        return b`
      <div
        style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; max-width: 420px;"
      >
        <vi-button
          variant="primary"
          @click=${(e)=>{
            const container = e.currentTarget.parentElement;
            const skeletonAnim = container?.querySelector('#skel-anim');
            const contentAnim = container?.querySelector('#content-anim');
            isLoading = !isLoading;
            if (isLoading) {
                contentAnim.hide();
                skeletonAnim.show();
            } else {
                skeletonAnim.hide().then(()=>{
                    contentAnim.show();
                });
            }
        }}
        >
          Toggle Simulated Data Loading
        </vi-button>

        <div style="position: relative; width: 100%; min-height: 180px;">
          <!-- Skeleton Shimmer Placeholder -->
          <vi-animation
            id="skel-anim"
            name="shimmer"
            duration="1200"
            iterations="Infinity"
            exit="fade-out"
            .open=${isLoading}
          >
            <div
              style="padding: 1.5rem; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; border-radius: 12px; height: 180px; display: flex; flex-direction: column; gap: 1rem;"
            >
              <div
                style="height: 20px; width: 60%; background: #cbd5e1; border-radius: 4px;"
              ></div>
              <div
                style="height: 14px; width: 90%; background: #cbd5e1; border-radius: 4px;"
              ></div>
              <div
                style="height: 14px; width: 75%; background: #cbd5e1; border-radius: 4px;"
              ></div>
            </div>
          </vi-animation>

          <!-- Live Content Card -->
          <vi-animation
            id="content-anim"
            enter="fade-in-up"
            exit="fade-out"
            duration="400"
            .open=${!isLoading}
          >
            <div
              style="padding: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); height: 180px;"
            >
              <div
                style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;"
              >
                <h3 style="margin: 0; font-size: 1.1rem; color: #0f172a;">
                  Live Trial Analytics
                </h3>
                <vi-badge variant="success">Synchronized</vi-badge>
              </div>
              <p style="margin: 0 0 1rem 0; color: #475569; font-size: 0.9rem;">
                Real-time patient telemetry data loaded successfully from EDC
                API endpoint.
              </p>
              <vi-button variant="secondary" size="sm"
                >View Telemetry Log</vi-button
              >
            </div>
          </vi-animation>
        </div>
      </div>
    `;
    }
};
/**
 * 7. Accordion / eCRF Section Expansion
 */ const AccordionExpandCollapse = {
    render: ()=>{
        let expanded = true;
        return b`
      <div
        style="display: flex; flex-direction: column; gap: 1rem; max-width: 480px;"
      >
        <vi-button
          variant="secondary"
          @click=${(e)=>{
            const anim = e.currentTarget.nextElementSibling;
            expanded = !expanded;
            if (expanded) {
                anim.show();
            } else {
                anim.hide();
            }
        }}
        >
          Expand / Collapse Section
        </vi-button>

        <vi-animation
          enter="expand-vertical"
          exit="collapse-vertical"
          duration="350"
          .open=${expanded}
        >
          <div
            style="padding: 1.25rem; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; display: flex; flex-direction: column; gap: 1rem;"
          >
            <h4 style="margin: 0; color: #1e293b;">
              eCRF Medical History Section
            </h4>
            <vi-input
              label="Prior Surgeries"
              placeholder="List any relevant operations..."
            ></vi-input>
            <vi-checkbox
              >Subject consents to genetic sample extraction</vi-checkbox
            >
          </div>
        </vi-animation>
      </div>
    `;
    }
};
/**
 * 8. Custom Programmatic WAAPI Keyframe Sequences
 */ const CustomKeyframeSequences = {
    render: ()=>b`
    <div
      style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; max-width: 440px;"
    >
      <vi-button
        variant="primary"
        @click=${(e)=>{
            const btn = e.currentTarget;
            const anim = btn.nextElementSibling;
            anim.keyframes = [
                {
                    transform: 'rotate(0deg) scale(1)',
                    filter: 'blur(0px) hue-rotate(0deg)'
                },
                {
                    transform: 'rotate(180deg) scale(1.15)',
                    filter: 'blur(2px) hue-rotate(90deg)'
                },
                {
                    transform: 'rotate(360deg) scale(1)',
                    filter: 'blur(0px) hue-rotate(0deg)'
                }
            ];
            anim.duration = 800;
            anim.play();
        }}
      >
        Play Custom WAAPI Keyframes
      </vi-button>

      <vi-animation id="custom-keyframe-anim" duration="800" .autoPlay=${false}>
        <div
          style="padding: 1.5rem; background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; border-radius: 12px; width: 300px; box-shadow: 0 8px 20px rgba(99,102,241,0.3);"
        >
          <h3 style="margin: 0 0 0.5rem 0; color: #ffffff;">
            Custom WAAPI Morph
          </h3>
          <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">
            Programmatically passing keyframes array with rotation, 3D scaling,
            and hue rotation filters.
          </p>
        </div>
      </vi-animation>
    </div>
  `
};
/**
 * 9. Slide In/Out Right Side Panel
 * Demonstrates sliding in a panel from the right upon button click, and sliding it out to the right upon subsequent click.
 */ const SlideRightSidePanel = {
    render: ()=>{
        let isOpen = false;
        return b`
      <div
        style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 640px;"
      >
        <div>
          <vi-button
            variant="primary"
            @click=${(e)=>{
            const root = e.currentTarget.closest('div')?.parentElement;
            const anim = root?.querySelector('#side-panel-anim');
            isOpen = !isOpen;
            if (isOpen) {
                anim.show();
            } else {
                anim.hide();
            }
        }}
          >
            Toggle Right Side Panel (Slide In / Out Right)
          </vi-button>
        </div>

        <div
          style="position: relative; width: 100%; min-height: 320px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; padding: 1.5rem;"
        >
          <h3 style="margin: 0 0 0.5rem 0; color: #1e293b;">
            Main Page Content Area
          </h3>
          <p style="margin: 0; color: #64748b; font-size: 0.9rem;">
            Click the button above to slide the details panel in from the right
            edge.
          </p>

          <!-- Sliding Side Panel Container -->
          <div
            style="position: absolute; top: 0; right: 0; bottom: 0; width: 320px; z-index: 10; pointer-events: none;"
          >
            <vi-animation
              id="side-panel-anim"
              enter="slide-in-right"
              exit="slide-out-right"
              .duration=${350}
              .open=${false}
            >
              <div
                style="pointer-events: auto; height: 100%; background: #ffffff; border-left: 1px solid #cbd5e1; box-shadow: -4px 0 15px rgba(0,0,0,0.08); padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; box-sizing: border-box;"
              >
                <div
                  style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem;"
                >
                  <h4 style="margin: 0; font-size: 1rem; color: #0f172a;">
                    Patient Subject Details
                  </h4>
                  <vi-badge variant="success" size="sm">Active</vi-badge>
                </div>
                <p
                  style="margin: 0; font-size: 0.85rem; color: #475569; line-height: 1.5;"
                >
                  Sliding panel containing detailed clinical observation notes,
                  lab values, and history.
                </p>
                <vi-input
                  label="Subject ID"
                  value="SUBJ-8091"
                  readonly
                ></vi-input>
                <vi-input
                  label="Clinical Site"
                  value="Site 04 - Oncology"
                  readonly
                ></vi-input>
                <div
                  style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: auto;"
                >
                  <vi-button
                    variant="ghost"
                    size="sm"
                    @click=${(e)=>{
            const anim = e.currentTarget.closest('#side-panel-anim');
            isOpen = false;
            anim.hide();
        }}
                  >
                    Close Panel
                  </vi-button>
                </div>
              </div>
            </vi-animation>
          </div>
        </div>
      </div>
    `;
    }
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <div\n      style=\"display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start; max-width: 480px;\"\n    >\n      <vi-button\n        variant=\"primary\"\n        @click=${(e: Event) => {\n    const btn = e.currentTarget as HTMLElement;\n    const anim = btn.nextElementSibling as ViAnimation;\n    anim.play();\n  }}\n      >\n        Replay Animation\n      </vi-button>\n\n      <vi-animation\n        .name=${args.name}\n        .duration=${args.duration}\n        .delay=${args.delay}\n        .easing=${args.easing}\n        .reducedMotion=${args.reducedMotion}\n      >\n        <div\n          style=\"padding: 1.5rem; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); width: 100%;\"\n        >\n          <div\n            style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;\"\n          >\n            <h3 style=\"margin: 0; font-size: 1.1rem; color: #1a202c;\">\n              Clinical Subject Record\n            </h3>\n            <vi-badge variant=\"info\" size=\"sm\">Active</vi-badge>\n          </div>\n          <p\n            style=\"margin: 0 0 1rem 0; color: #4a5568; font-size: 0.9rem; line-height: 1.5;\"\n          >\n            Animation preset <code>${args.name}</code> running at\n            hardware-accelerated 60/120fps.\n          </p>\n          <vi-alert variant=\"info\" title=\"Protocol Status\">\n            Subject SUBJ-804 has completed Visit 3 screening.\n          </vi-alert>\n        </div>\n      </vi-animation>\n    </div>\n  `,\n  args: {\n    name: 'fade-in-up',\n    duration: 400,\n    delay: 0,\n    easing: 'cubic-bezier(0.2, 0, 0, 1)',\n    reducedMotion: 'auto'\n  }\n}",
            ...Default.parameters?.docs?.source
        },
        description: {
            story: "1. Default Interactive Preset Controls",
            ...Default.parameters?.docs?.description
        }
    }
};
PresetCatalogGallery.parameters = {
    ...PresetCatalogGallery.parameters,
    docs: {
        ...PresetCatalogGallery.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => {\n    const presets = [{\n      category: 'Fade & Slide',\n      items: ['fade-in-up', 'fade-in-down', 'slide-in-bottom', 'slide-in-right']\n    }, {\n      category: 'Scale & Zoom',\n      items: ['zoom-in', 'scale-up', 'bounce-in', 'pop-in']\n    }, {\n      category: '3D & Motion',\n      items: ['flip-x', 'flip-y', 'perspective-pop', 'expand-vertical']\n    }, {\n      category: 'Attention Seekers',\n      items: ['pulse', 'bounce', 'shake', 'heartbeat']\n    }];\n    return html`\n      <div style=\"display: flex; flex-direction: column; gap: 2rem;\">\n        <div\n          style=\"display: flex; justify-content: space-between; align-items: center;\"\n        >\n          <h2 style=\"margin: 0; font-size: 1.25rem; font-family: sans-serif;\">\n            Hardware-Accelerated Animation Catalog\n          </h2>\n          <vi-button\n            variant=\"secondary\"\n            size=\"sm\"\n            @click=${() => {\n      const anims = document.querySelectorAll<ViAnimation>('vi-animation.catalog-anim');\n      anims.forEach(a => a.play());\n    }}\n          >\n            Replay All Presets\n          </vi-button>\n        </div>\n\n        ${presets.map(group => html`\n            <div>\n              <h3\n                style=\"margin: 0 0 1rem 0; font-size: 1rem; color: #4a5568; font-family: sans-serif;\"\n              >\n                ${group.category}\n              </h3>\n              <div\n                style=\"display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;\"\n              >\n                ${group.items.map(preset => html`\n                    <div\n                      style=\"background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;\"\n                    >\n                      <div\n                        style=\"display: flex; justify-content: space-between; align-items: center;\"\n                      >\n                        <code\n                          style=\"font-size: 0.8rem; font-weight: 600; color: #2b6cb0;\"\n                          >${preset}</code\n                        >\n                        <vi-button\n                          variant=\"ghost\"\n                          size=\"xs\"\n                          @click=${(e: Event) => {\n      const card = (e.currentTarget as HTMLElement).closest('div')?.parentElement;\n      const anim = card?.querySelector('vi-animation');\n      anim?.play();\n    }}\n                        >\n                          Play\n                        </vi-button>\n                      </div>\n                      <vi-animation\n                        class=\"catalog-anim\"\n                        name=${preset}\n                        duration=\"1000\"\n                      >\n                        <div\n                          style=\"padding: 0.75rem; background: #ffffff; border: 1px solid #cbd5e0; border-radius: 6px; text-align: center; font-size: 0.85rem; font-weight: 500;\"\n                        >\n                          ${preset}\n                        </div>\n                      </vi-animation>\n                    </div>\n                  `)}\n              </div>\n            </div>\n          `)}\n      </div>\n    `;\n  }\n}",
            ...PresetCatalogGallery.parameters?.docs?.source
        },
        description: {
            story: "2. Preset Catalog Showcase",
            ...PresetCatalogGallery.parameters?.docs?.description
        }
    }
};
EnterExitTransitions.parameters = {
    ...EnterExitTransitions.parameters,
    docs: {
        ...EnterExitTransitions.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => {\n    let isOpen = true;\n    return html`\n      <div\n        style=\"display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;\"\n      >\n        <vi-button\n          variant=\"primary\"\n          @click=${(e: Event) => {\n      const container = (e.currentTarget as HTMLElement).parentElement;\n      const anim = container?.querySelector('#drawer-anim') as ViAnimation;\n      isOpen = !isOpen;\n      if (isOpen) {\n        anim.show();\n      } else {\n        anim.hide();\n      }\n    }}\n        >\n          Toggle Contextual Drawer (show / hide)\n        </vi-button>\n\n        <vi-animation\n          id=\"drawer-anim\"\n          enter=\"fade-in-up\"\n          exit=\"fade-out-down\"\n          .duration=${350}\n          .open=${isOpen}\n        >\n          <div\n            style=\"padding: 1.5rem; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); width: 360px; display: flex; flex-direction: column; gap: 1rem;\"\n          >\n            <div\n              style=\"display: flex; justify-content: space-between; align-items: center;\"\n            >\n              <h3 style=\"margin: 0; font-size: 1.1rem;\">\n                Protocol Deviation Form\n              </h3>\n              <vi-badge variant=\"warning\" size=\"sm\">Urgent</vi-badge>\n            </div>\n            <vi-input label=\"Subject Identifier\" value=\"SUBJ-4092\"></vi-input>\n            <vi-input\n              label=\"Deviation Description\"\n              placeholder=\"Enter clinical notes...\"\n            ></vi-input>\n            <div\n              style=\"display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.5rem;\"\n            >\n              <vi-button variant=\"ghost\" size=\"sm\">Cancel</vi-button>\n              <vi-button variant=\"primary\" size=\"sm\">Submit Report</vi-button>\n            </div>\n          </div>\n        </vi-animation>\n      </div>\n    `;\n  }\n}",
            ...EnterExitTransitions.parameters?.docs?.source
        },
        description: {
            story: "3. Enter & Exit Transitions (Modal / Panel Overlay)",
            ...EnterExitTransitions.parameters?.docs?.description
        }
    }
};
CascadingStagger.parameters = {
    ...CascadingStagger.parameters,
    docs: {
        ...CascadingStagger.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <div\n      style=\"display: flex; flex-direction: column; gap: 1.5rem; max-width: 600px;\"\n    >\n      <div style=\"display: flex; gap: 1rem; align-items: center;\">\n        <vi-button\n          variant=\"primary\"\n          @click=${(e: Event) => {\n    const wrapper = (e.currentTarget as HTMLElement).parentElement?.nextElementSibling as ViAnimation;\n    wrapper.play();\n  }}\n        >\n          Replay Cascading Stagger\n        </vi-button>\n        <span style=\"font-size: 0.85rem; color: #64748b;\"\n          >Direction: <strong>${args.staggerDirection}</strong></span\n        >\n      </div>\n\n      <!-- Cascading Chips -->\n      <vi-animation\n        cascade\n        .stagger=${args.stagger}\n        .staggerDirection=${args.staggerDirection}\n        enter=\"zoom-in\"\n        duration=\"300\"\n      >\n        <vi-chip-group multi name=\"filters\">\n          <vi-chip value=\"all\" selected>All Subjects</vi-chip>\n          <vi-chip value=\"enrolled\">Enrolled (142)</vi-chip>\n          <vi-chip value=\"screened\">Screened (89)</vi-chip>\n          <vi-chip value=\"completed\">Completed (56)</vi-chip>\n          <vi-chip value=\"discontinued\">Discontinued (12)</vi-chip>\n        </vi-chip-group>\n      </vi-animation>\n\n      <!-- Cascading Table Rows -->\n      <vi-animation\n        cascade\n        stagger-selector=\"tr\"\n        .stagger=${args.stagger}\n        .staggerDirection=${args.staggerDirection}\n        enter=\"fade-in-up\"\n        duration=\"350\"\n      >\n        <table\n          style=\"width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;\"\n        >\n          <thead>\n            <tr\n              style=\"background: #f8fafc; text-align: left; font-size: 0.85rem; color: #475569;\"\n            >\n              <th\n                style=\"padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0;\"\n              >\n                Subject ID\n              </th>\n              <th\n                style=\"padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0;\"\n              >\n                Site\n              </th>\n              <th\n                style=\"padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0;\"\n              >\n                Status\n              </th>\n            </tr>\n          </thead>\n          <tbody>\n            <tr style=\"border-bottom: 1px solid #f1f5f9;\">\n              <td style=\"padding: 0.75rem 1rem; font-weight: 500;\">\n                SUBJ-1001\n              </td>\n              <td style=\"padding: 0.75rem 1rem;\">Site 01</td>\n              <td style=\"padding: 0.75rem 1rem;\">\n                <vi-badge variant=\"success\" size=\"sm\">Enrolled</vi-badge>\n              </td>\n            </tr>\n            <tr style=\"border-bottom: 1px solid #f1f5f9;\">\n              <td style=\"padding: 0.75rem 1rem; font-weight: 500;\">\n                SUBJ-1002\n              </td>\n              <td style=\"padding: 0.75rem 1rem;\">Site 01</td>\n              <td style=\"padding: 0.75rem 1rem;\">\n                <vi-badge variant=\"info\" size=\"sm\">Screened</vi-badge>\n              </td>\n            </tr>\n            <tr style=\"border-bottom: 1px solid #f1f5f9;\">\n              <td style=\"padding: 0.75rem 1rem; font-weight: 500;\">\n                SUBJ-1003\n              </td>\n              <td style=\"padding: 0.75rem 1rem;\">Site 02</td>\n              <td style=\"padding: 0.75rem 1rem;\">\n                <vi-badge variant=\"success\" size=\"sm\">Completed</vi-badge>\n              </td>\n            </tr>\n            <tr>\n              <td style=\"padding: 0.75rem 1rem; font-weight: 500;\">\n                SUBJ-1004\n              </td>\n              <td style=\"padding: 0.75rem 1rem;\">Site 03</td>\n              <td style=\"padding: 0.75rem 1rem;\">\n                <vi-badge variant=\"danger\" size=\"sm\">Discontinued</vi-badge>\n              </td>\n            </tr>\n          </tbody>\n        </table>\n      </vi-animation>\n    </div>\n  `,\n  args: {\n    stagger: 60,\n    staggerDirection: 'normal'\n  }\n}",
            ...CascadingStagger.parameters?.docs?.source
        },
        description: {
            story: "4. Cascading Staggered Grid & Table Rows",
            ...CascadingStagger.parameters?.docs?.description
        }
    }
};
AttentionSeekers.parameters = {
    ...AttentionSeekers.parameters,
    docs: {
        ...AttentionSeekers.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div\n      style=\"display: flex; flex-direction: column; gap: 1.5rem; max-width: 480px;\"\n    >\n      <h3 style=\"margin: 0; font-size: 1.1rem; color: #1e293b;\">\n        Attention-Seeking UI Feedback\n      </h3>\n\n      <div style=\"display: flex; gap: 1rem; align-items: center;\">\n        <vi-button\n          variant=\"secondary\"\n          size=\"sm\"\n          @click=${(e: Event) => {\n    const btn = e.currentTarget as HTMLElement;\n    const anim = btn.nextElementSibling as ViAnimation;\n    anim.play();\n  }}\n        >\n          Trigger Validation Shake\n        </vi-button>\n        <vi-animation name=\"shake\" duration=\"400\" .autoPlay=${false}>\n          <vi-input\n            label=\"Required Field\"\n            value=\"\"\n            status=\"invalid\"\n            validity-message=\"Field cannot be empty\"\n          ></vi-input>\n        </vi-animation>\n      </div>\n\n      <div style=\"display: flex; gap: 1rem; align-items: center;\">\n        <vi-button\n          variant=\"secondary\"\n          size=\"sm\"\n          @click=${(e: Event) => {\n    const btn = e.currentTarget as HTMLElement;\n    const anim = btn.nextElementSibling as ViAnimation;\n    anim.play();\n  }}\n        >\n          Trigger Alert Pulse\n        </vi-button>\n        <vi-animation name=\"pulse\" duration=\"500\" .autoPlay=${false}>\n          <vi-alert variant=\"warning\" title=\"Critical Notice\">\n            Unsaved lab results will be lost.\n          </vi-alert>\n        </vi-animation>\n      </div>\n\n      <div style=\"display: flex; gap: 1rem; align-items: center;\">\n        <vi-button\n          variant=\"secondary\"\n          size=\"sm\"\n          @click=${(e: Event) => {\n    const btn = e.currentTarget as HTMLElement;\n    const anim = btn.nextElementSibling as ViAnimation;\n    anim.play();\n  }}\n        >\n          Trigger Badge Heartbeat\n        </vi-button>\n        <vi-animation name=\"heartbeat\" duration=\"600\" .autoPlay=${false}>\n          <vi-badge variant=\"danger\" size=\"md\">9 Unread Alerts</vi-badge>\n        </vi-animation>\n      </div>\n    </div>\n  `\n}",
            ...AttentionSeekers.parameters?.docs?.source
        },
        description: {
            story: "5. Attention-Seeking Motion Patterns",
            ...AttentionSeekers.parameters?.docs?.description
        }
    }
};
SkeletonToContentTransition.parameters = {
    ...SkeletonToContentTransition.parameters,
    docs: {
        ...SkeletonToContentTransition.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => {\n    let isLoading = true;\n    return html`\n      <div\n        style=\"display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; max-width: 420px;\"\n      >\n        <vi-button\n          variant=\"primary\"\n          @click=${(e: Event) => {\n      const container = (e.currentTarget as HTMLElement).parentElement;\n      const skeletonAnim = container?.querySelector('#skel-anim') as ViAnimation;\n      const contentAnim = container?.querySelector('#content-anim') as ViAnimation;\n      isLoading = !isLoading;\n      if (isLoading) {\n        contentAnim.hide();\n        skeletonAnim.show();\n      } else {\n        skeletonAnim.hide().then(() => {\n          contentAnim.show();\n        });\n      }\n    }}\n        >\n          Toggle Simulated Data Loading\n        </vi-button>\n\n        <div style=\"position: relative; width: 100%; min-height: 180px;\">\n          <!-- Skeleton Shimmer Placeholder -->\n          <vi-animation\n            id=\"skel-anim\"\n            name=\"shimmer\"\n            duration=\"1200\"\n            iterations=\"Infinity\"\n            exit=\"fade-out\"\n            .open=${isLoading}\n          >\n            <div\n              style=\"padding: 1.5rem; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; border-radius: 12px; height: 180px; display: flex; flex-direction: column; gap: 1rem;\"\n            >\n              <div\n                style=\"height: 20px; width: 60%; background: #cbd5e1; border-radius: 4px;\"\n              ></div>\n              <div\n                style=\"height: 14px; width: 90%; background: #cbd5e1; border-radius: 4px;\"\n              ></div>\n              <div\n                style=\"height: 14px; width: 75%; background: #cbd5e1; border-radius: 4px;\"\n              ></div>\n            </div>\n          </vi-animation>\n\n          <!-- Live Content Card -->\n          <vi-animation\n            id=\"content-anim\"\n            enter=\"fade-in-up\"\n            exit=\"fade-out\"\n            duration=\"400\"\n            .open=${!isLoading}\n          >\n            <div\n              style=\"padding: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); height: 180px;\"\n            >\n              <div\n                style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;\"\n              >\n                <h3 style=\"margin: 0; font-size: 1.1rem; color: #0f172a;\">\n                  Live Trial Analytics\n                </h3>\n                <vi-badge variant=\"success\">Synchronized</vi-badge>\n              </div>\n              <p style=\"margin: 0 0 1rem 0; color: #475569; font-size: 0.9rem;\">\n                Real-time patient telemetry data loaded successfully from EDC\n                API endpoint.\n              </p>\n              <vi-button variant=\"secondary\" size=\"sm\"\n                >View Telemetry Log</vi-button\n              >\n            </div>\n          </vi-animation>\n        </div>\n      </div>\n    `;\n  }\n}",
            ...SkeletonToContentTransition.parameters?.docs?.source
        },
        description: {
            story: "6. Skeleton Loader Shimmer to Content Cross-Fade",
            ...SkeletonToContentTransition.parameters?.docs?.description
        }
    }
};
AccordionExpandCollapse.parameters = {
    ...AccordionExpandCollapse.parameters,
    docs: {
        ...AccordionExpandCollapse.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => {\n    let expanded = true;\n    return html`\n      <div\n        style=\"display: flex; flex-direction: column; gap: 1rem; max-width: 480px;\"\n      >\n        <vi-button\n          variant=\"secondary\"\n          @click=${(e: Event) => {\n      const anim = (e.currentTarget as HTMLElement).nextElementSibling as ViAnimation;\n      expanded = !expanded;\n      if (expanded) {\n        anim.show();\n      } else {\n        anim.hide();\n      }\n    }}\n        >\n          Expand / Collapse Section\n        </vi-button>\n\n        <vi-animation\n          enter=\"expand-vertical\"\n          exit=\"collapse-vertical\"\n          duration=\"350\"\n          .open=${expanded}\n        >\n          <div\n            style=\"padding: 1.25rem; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; display: flex; flex-direction: column; gap: 1rem;\"\n          >\n            <h4 style=\"margin: 0; color: #1e293b;\">\n              eCRF Medical History Section\n            </h4>\n            <vi-input\n              label=\"Prior Surgeries\"\n              placeholder=\"List any relevant operations...\"\n            ></vi-input>\n            <vi-checkbox\n              >Subject consents to genetic sample extraction</vi-checkbox\n            >\n          </div>\n        </vi-animation>\n      </div>\n    `;\n  }\n}",
            ...AccordionExpandCollapse.parameters?.docs?.source
        },
        description: {
            story: "7. Accordion / eCRF Section Expansion",
            ...AccordionExpandCollapse.parameters?.docs?.description
        }
    }
};
CustomKeyframeSequences.parameters = {
    ...CustomKeyframeSequences.parameters,
    docs: {
        ...CustomKeyframeSequences.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div\n      style=\"display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; max-width: 440px;\"\n    >\n      <vi-button\n        variant=\"primary\"\n        @click=${(e: Event) => {\n    const btn = e.currentTarget as HTMLElement;\n    const anim = btn.nextElementSibling as ViAnimation;\n    anim.keyframes = [{\n      transform: 'rotate(0deg) scale(1)',\n      filter: 'blur(0px) hue-rotate(0deg)'\n    }, {\n      transform: 'rotate(180deg) scale(1.15)',\n      filter: 'blur(2px) hue-rotate(90deg)'\n    }, {\n      transform: 'rotate(360deg) scale(1)',\n      filter: 'blur(0px) hue-rotate(0deg)'\n    }];\n    anim.duration = 800;\n    anim.play();\n  }}\n      >\n        Play Custom WAAPI Keyframes\n      </vi-button>\n\n      <vi-animation id=\"custom-keyframe-anim\" duration=\"800\" .autoPlay=${false}>\n        <div\n          style=\"padding: 1.5rem; background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; border-radius: 12px; width: 300px; box-shadow: 0 8px 20px rgba(99,102,241,0.3);\"\n        >\n          <h3 style=\"margin: 0 0 0.5rem 0; color: #ffffff;\">\n            Custom WAAPI Morph\n          </h3>\n          <p style=\"margin: 0; font-size: 0.9rem; opacity: 0.9;\">\n            Programmatically passing keyframes array with rotation, 3D scaling,\n            and hue rotation filters.\n          </p>\n        </div>\n      </vi-animation>\n    </div>\n  `\n}",
            ...CustomKeyframeSequences.parameters?.docs?.source
        },
        description: {
            story: "8. Custom Programmatic WAAPI Keyframe Sequences",
            ...CustomKeyframeSequences.parameters?.docs?.description
        }
    }
};
SlideRightSidePanel.parameters = {
    ...SlideRightSidePanel.parameters,
    docs: {
        ...SlideRightSidePanel.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => {\n    let isOpen = false;\n    return html`\n      <div\n        style=\"display: flex; flex-direction: column; gap: 1.5rem; max-width: 640px;\"\n      >\n        <div>\n          <vi-button\n            variant=\"primary\"\n            @click=${(e: Event) => {\n      const root = (e.currentTarget as HTMLElement).closest('div')?.parentElement;\n      const anim = root?.querySelector('#side-panel-anim') as ViAnimation;\n      isOpen = !isOpen;\n      if (isOpen) {\n        anim.show();\n      } else {\n        anim.hide();\n      }\n    }}\n          >\n            Toggle Right Side Panel (Slide In / Out Right)\n          </vi-button>\n        </div>\n\n        <div\n          style=\"position: relative; width: 100%; min-height: 320px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; padding: 1.5rem;\"\n        >\n          <h3 style=\"margin: 0 0 0.5rem 0; color: #1e293b;\">\n            Main Page Content Area\n          </h3>\n          <p style=\"margin: 0; color: #64748b; font-size: 0.9rem;\">\n            Click the button above to slide the details panel in from the right\n            edge.\n          </p>\n\n          <!-- Sliding Side Panel Container -->\n          <div\n            style=\"position: absolute; top: 0; right: 0; bottom: 0; width: 320px; z-index: 10; pointer-events: none;\"\n          >\n            <vi-animation\n              id=\"side-panel-anim\"\n              enter=\"slide-in-right\"\n              exit=\"slide-out-right\"\n              .duration=${350}\n              .open=${false}\n            >\n              <div\n                style=\"pointer-events: auto; height: 100%; background: #ffffff; border-left: 1px solid #cbd5e1; box-shadow: -4px 0 15px rgba(0,0,0,0.08); padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; box-sizing: border-box;\"\n              >\n                <div\n                  style=\"display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem;\"\n                >\n                  <h4 style=\"margin: 0; font-size: 1rem; color: #0f172a;\">\n                    Patient Subject Details\n                  </h4>\n                  <vi-badge variant=\"success\" size=\"sm\">Active</vi-badge>\n                </div>\n                <p\n                  style=\"margin: 0; font-size: 0.85rem; color: #475569; line-height: 1.5;\"\n                >\n                  Sliding panel containing detailed clinical observation notes,\n                  lab values, and history.\n                </p>\n                <vi-input\n                  label=\"Subject ID\"\n                  value=\"SUBJ-8091\"\n                  readonly\n                ></vi-input>\n                <vi-input\n                  label=\"Clinical Site\"\n                  value=\"Site 04 - Oncology\"\n                  readonly\n                ></vi-input>\n                <div\n                  style=\"display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: auto;\"\n                >\n                  <vi-button\n                    variant=\"ghost\"\n                    size=\"sm\"\n                    @click=${(e: Event) => {\n      const anim = (e.currentTarget as HTMLElement).closest('#side-panel-anim') as ViAnimation;\n      isOpen = false;\n      anim.hide();\n    }}\n                  >\n                    Close Panel\n                  </vi-button>\n                </div>\n              </div>\n            </vi-animation>\n          </div>\n        </div>\n      </div>\n    `;\n  }\n}",
            ...SlideRightSidePanel.parameters?.docs?.source
        },
        description: {
            story: "9. Slide In/Out Right Side Panel\nDemonstrates sliding in a panel from the right upon button click, and sliding it out to the right upon subsequent click.",
            ...SlideRightSidePanel.parameters?.docs?.description
        }
    }
};
const __namedExportsOrder = ["Default","PresetCatalogGallery","EnterExitTransitions","CascadingStagger","AttentionSeekers","SkeletonToContentTransition","AccordionExpandCollapse","CustomKeyframeSequences","SlideRightSidePanel"];

export { AccordionExpandCollapse, AttentionSeekers, CascadingStagger, CustomKeyframeSequences, Default, EnterExitTransitions, PresetCatalogGallery, SkeletonToContentTransition, SlideRightSidePanel, __namedExportsOrder, meta as default };
