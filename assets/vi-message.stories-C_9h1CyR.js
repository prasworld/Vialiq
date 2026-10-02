import { s as singleton, i as instance } from './index-BeC6Zh2p.js';
import { r, i, b } from './iframe-C5KGnDWv.js';
import { V as ViElement, t, n } from './vi-element-B5V_Ir3U.js';
import './vi-icon-DDTbJySC.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import { c as checkCircleIcon } from './check-circle-BQwul-8G.js';
import { c as circleXIcon } from './circle-x-C2gECXwf.js';
import { t as triangleWarningIcon, i as infoIcon } from './triangle-warning-CA6nkDfn.js';
import { p as pendingIcon } from './pending-ekuJJTTY.js';
import './vi-button-PI0EYrc7.js';
import './_commonjsHelpers-BFTU3MAI.js';
import './preload-helper-D5QYaGzd.js';
import './state-BBw71q8t.js';
import './directive-BKuZRRPO.js';
import './focusable-mixin-DkKvOjpm.js';

const messageStyles = "@charset \"UTF-8\";@layer reset,components,utilities;:host{display:block}:host([hidden]){display:none!important}.message-root{display:flex;align-items:center;gap:var(--vi-spacing-sm, .75rem);background-color:var(--vi-message-bg, var(--vi-color-background, #ffffff));border:1px solid var(--vi-message-border-color, var(--vi-border-02, #eeeeee));border-radius:var(--vi-message-border-radius, 8px);box-shadow:var(--vi-message-shadow, var(--vi-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, .05), 0 10px 15px -3px rgba(0, 0, 0, .1)));padding:var(--vi-message-padding, 9px 16px);font-size:var(--vi-message-font-size, var(--vi-font-size-sm, .8125rem))}.message-icon{display:flex;align-items:center;justify-content:center}vi-icon,::slotted(vi-icon),::slotted(svg){--vi-icon-size: 1.25em;width:1.25em;height:1.25em}.message-root[data-variant=info] .message-icon{color:var(--vi-message-info-icon, var(--vi-color-info, #3676d0))}.message-root[data-variant=success] .message-icon{color:var(--vi-message-success-icon, var(--vi-color-success, #489167))}.message-root[data-variant=warning] .message-icon{color:var(--vi-message-warning-icon, var(--vi-color-warning, #ffba00))}.message-root[data-variant=error] .message-icon{color:var(--vi-message-error-icon, var(--vi-color-error, #ef4444))}.message-root[data-variant=loading] .message-icon{color:var(--vi-message-loading-icon, var(--vi-color-primary, #3676d0));animation:vi-message-spin 1s linear infinite}@keyframes vi-message-spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.message-root[data-variant=loading] .message-icon{animation:none}}";

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
var _dec$2, _initClass$2, _ViElement$1, _dec1$1, _dec2, _dec3, _dec4, _dec5, _init_variant, _init_content, _init_duration, _init_paused, _init_icon, _initProto$1;
registerIcons([
    checkCircleIcon,
    triangleWarningIcon,
    infoIcon,
    circleXIcon,
    pendingIcon
]);
let _ViMessage;
_dec$2 = t('vi-message'), _dec1$1 = n({
    type: String,
    reflect: true
}), _dec2 = n({
    type: String
}), _dec3 = n({
    type: Number
}), _dec4 = n({
    type: Boolean,
    reflect: true
}), _dec5 = n({
    type: String
});
new class extends _identity$1 {
    constructor(){
        super(_ViMessage), _initClass$2();
    }
    static{
        class ViMessage extends (_ViElement$1 = ViElement) {
            static{
                ({ e: [_init_variant, _init_content, _init_duration, _init_paused, _init_icon, _initProto$1], c: [_ViMessage, _initClass$2] } = _apply_decs_2203_r$2(this, [
                    [
                        _dec1$1,
                        1,
                        "variant"
                    ],
                    [
                        _dec2,
                        1,
                        "content"
                    ],
                    [
                        _dec3,
                        1,
                        "duration"
                    ],
                    [
                        _dec4,
                        1,
                        "paused"
                    ],
                    [
                        _dec5,
                        1,
                        "icon"
                    ]
                ], [
                    _dec$2
                ], _ViElement$1));
            }
            static styles = i`
    ${r(messageStyles)}
  `;
            #___private_variant_1 = (_initProto$1(this), _init_variant(this, 'info'));
            get variant() {
                return this.#___private_variant_1;
            }
            set variant(_v) {
                this.#___private_variant_1 = _v;
            }
            #___private_content_2 = _init_content(this, '');
            get content() {
                return this.#___private_content_2;
            }
            set content(_v) {
                this.#___private_content_2 = _v;
            }
            #___private_duration_3 = _init_duration(this, 3000);
            get duration() {
                return this.#___private_duration_3;
            }
            set duration(_v) {
                this.#___private_duration_3 = _v;
            }
            #___private_paused_4 = _init_paused(this, false);
            get paused() {
                return this.#___private_paused_4;
            }
            set paused(_v) {
                this.#___private_paused_4 = _v;
            }
            #___private_icon_5 = _init_icon(this, '');
            get icon() {
                return this.#___private_icon_5;
            }
            set icon(_v) {
                this.#___private_icon_5 = _v;
            }
            _timer = null;
            _startTime = 0;
            _remainingTime = 0;
            connectedCallback() {
                super.connectedCallback();
                this.setAttribute('role', this.variant === 'warning' || this.variant === 'error' ? 'alert' : 'status');
                this.setAttribute('aria-live', 'polite');
                if (this.duration > 0 && this.variant !== 'loading') {
                    this._remainingTime = this.duration;
                    this.startTimer();
                }
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this.clearTimer();
            }
            updated(changedProperties) {
                super.updated(changedProperties);
                if (changedProperties.has('paused')) {
                    if (this.paused) {
                        this.pauseTimer();
                    } else {
                        this.resumeTimer();
                    }
                }
                if (changedProperties.has('duration') || changedProperties.has('variant')) {
                    // If variant changed to non-loading, ensure we have a timer if duration > 0
                    if (this.duration > 0 && this.variant !== 'loading') {
                        if (!this._timer && this._remainingTime <= 0) {
                            this._remainingTime = this.duration;
                        }
                        this.startTimer();
                    } else if (this.variant === 'loading') {
                        this.clearTimer(); // Loading messages usually stay until resolved manually
                    }
                    // Update ARIA role for accessibility
                    this.setAttribute('role', this.variant === 'warning' || this.variant === 'error' ? 'alert' : 'status');
                }
            }
            startTimer() {
                if (this.duration <= 0 || this._remainingTime <= 0 || this.variant === 'loading' || this.paused) return;
                this.clearTimer();
                this._startTime = Date.now();
                this._timer = setTimeout(()=>{
                    this.handleDismiss('auto');
                }, this._remainingTime);
            }
            pauseTimer() {
                if (this._timer) {
                    clearTimeout(this._timer);
                    this._timer = null;
                    this._remainingTime -= Date.now() - this._startTime;
                }
            }
            resumeTimer() {
                if (this._remainingTime > 0) {
                    this.startTimer();
                }
            }
            clearTimer() {
                if (this._timer !== null) {
                    clearTimeout(this._timer);
                    this._timer = null;
                }
            }
            handleDismiss(reason = 'user') {
                this.dispatchEvent(new CustomEvent('vi-message-close', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        reason,
                        id: this.id
                    }
                }));
            }
            get defaultIcon() {
                if (this.icon) return this.icon;
                switch(this.variant){
                    case 'success':
                        return 'check-circle';
                    case 'warning':
                        return 'triangle-warning';
                    case 'error':
                        return 'circle-x';
                    case 'loading':
                        return 'pending';
                    case 'info':
                    default:
                        return 'info';
                }
            }
            render() {
                return b`
      <div part="message" class="message-root" data-variant=${this.variant}>
        <div part="icon" class="message-icon">
          <slot name="icon">
            <vi-icon name=${this.defaultIcon} aria-hidden="true"></vi-icon>
          </slot>
        </div>
        <div part="content" class="message-content">
          <slot>${this.content}</slot>
        </div>
      </div>
    `;
            }
        }
    }
}();

const containerStyles = "@charset \"UTF-8\";@layer reset,components,utilities;:host{display:block;position:fixed;z-index:var(--vi-message-z-index, 1010);top:var(--vi-message-top, 24px);left:50%;transform:translate(-50%);pointer-events:none}.message-stack{display:flex;flex-direction:column;align-items:center;gap:var(--vi-spacing-sm, .75rem);pointer-events:none}::slotted(vi-message){transition:all .3s cubic-bezier(.2,0,0,1);transform-origin:top center;pointer-events:auto}::slotted(vi-message.entering){opacity:0;transform:translateY(-24px)}::slotted(vi-message.exiting){opacity:0!important;max-height:0!important;margin-top:calc(-1 * var(--vi-spacing-sm, .75rem))!important;margin-bottom:0!important;padding-top:0!important;padding-bottom:0!important;border:none!important;overflow:hidden!important;transform:scale(.9)!important}@media(prefers-reduced-motion:reduce){::slotted(vi-message){transition:none!important}}";

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
function _identity(x) {
    return x;
}
var _dec$1, _initClass$1, _ViElement, _dec1, _init_maxVisible, _initProto;
let _ViMessageContainer;
_dec$1 = t('vi-message-container'), _dec1 = n({
    type: Number
});
new class extends _identity {
    constructor(){
        super(_ViMessageContainer), _initClass$1();
    }
    static{
        class ViMessageContainer extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_maxVisible, _initProto], c: [_ViMessageContainer, _initClass$1] } = _apply_decs_2203_r$1(this, [
                    [
                        _dec1,
                        1,
                        "maxVisible"
                    ]
                ], [
                    _dec$1
                ], _ViElement));
            }
            static styles = i`
    ${r(containerStyles)}
  `;
            #___private_maxVisible_1 = (_initProto(this), _init_maxVisible(this, 5));
            get maxVisible() {
                return this.#___private_maxVisible_1;
            }
            set maxVisible(_v) {
                this.#___private_maxVisible_1 = _v;
            }
            _handleMouseEnter = ()=>{
                // Pause all messages
                const messages = this.querySelectorAll('vi-message');
                messages.forEach((msg)=>{
                    msg.paused = true;
                });
            };
            _handleMouseLeave = ()=>{
                // Resume all messages
                const messages = this.querySelectorAll('vi-message');
                messages.forEach((msg)=>{
                    msg.paused = false;
                });
            };
            connectedCallback() {
                super.connectedCallback();
                this.addEventListener('mouseenter', this._handleMouseEnter);
                this.addEventListener('mouseleave', this._handleMouseLeave);
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this.removeEventListener('mouseenter', this._handleMouseEnter);
                this.removeEventListener('mouseleave', this._handleMouseLeave);
            }
            render() {
                return b`
      <div class="message-stack" part="stack">
        <slot></slot>
      </div>
    `;
            }
        }
    }
}();

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
var _dec, _initClass;
let _ViMessageService;
_dec = singleton();
class ViMessageService {
    static{
        ({ c: [_ViMessageService, _initClass] } = _apply_decs_2203_r(this, [], [
            _dec
        ]));
    }
    _container = null;
    _config = {
        maxVisible: 5,
        defaultDuration: 3000,
        animationDuration: 300
    };
    /**
   * Configure global defaults for the message service.
   */ configure(config) {
        this._config = {
            ...this._config,
            ...config
        };
        if (this._container) {
            this._container.setAttribute('maxVisible', this._config.maxVisible.toString());
        }
    }
    _ensureContainer() {
        if (!this._container || !this._container.isConnected) {
            this._container = document.createElement('vi-message-container');
            this._container.setAttribute('maxVisible', this._config.maxVisible.toString());
            document.body.appendChild(this._container);
        }
        return this._container;
    }
    /**
   * Show a message notification.
   */ show(options) {
        const container = this._ensureContainer();
        const messageId = options.id || crypto.randomUUID();
        // Check if maxVisible is exceeded
        const currentMessages = Array.from(container.querySelectorAll('vi-message')).filter((msg)=>!msg.classList.contains('exiting'));
        if (this._config.maxVisible <= 0) return messageId;
        if (currentMessages.length >= this._config.maxVisible) {
            const excess = currentMessages.length - this._config.maxVisible + 1;
            for(let i = 0; i < excess; i++){
                this.dismissElement(currentMessages[i]);
            }
        }
        const message = document.createElement('vi-message');
        message.id = messageId;
        message.variant = options.variant || 'info';
        if (typeof options.content === 'string') {
            message.content = options.content;
        } else if (options.content instanceof Node) {
            message.appendChild(options.content);
        }
        if (options.icon) message.icon = options.icon;
        if (options.className) message.className = options.className;
        if (options.style) message.setAttribute('style', options.style);
        message.duration = options.duration !== undefined ? options.duration : this._config.defaultDuration;
        // Listeners
        message.addEventListener('vi-message-close', (e)=>{
            const customEvent = e;
            try {
                if (options.onClose) {
                    options.onClose(customEvent.detail.reason);
                }
            } catch (error) {
                console.error('Error in message onClose callback:', error);
            } finally{
                this.dismissElement(message);
            }
        });
        // Animation entry
        message.classList.add('entering');
        container.appendChild(message);
        // Trigger reflow to ensure animation plays
        message.getBoundingClientRect();
        requestAnimationFrame(()=>{
            message.classList.remove('entering');
        });
        return messageId;
    }
    info(content, duration) {
        return this.show({
            variant: 'info',
            content,
            duration
        });
    }
    success(content, duration) {
        return this.show({
            variant: 'success',
            content,
            duration
        });
    }
    error(content, duration) {
        return this.show({
            variant: 'error',
            content,
            duration
        });
    }
    warning(content, duration) {
        return this.show({
            variant: 'warning',
            content,
            duration
        });
    }
    loading(content, duration = 0) {
        return this.show({
            variant: 'loading',
            content,
            duration
        });
    }
    /**
   * Dismiss a specific message by its ID.
   */ dismiss(id) {
        if (!this._container) return;
        const message = Array.from(this._container.querySelectorAll('vi-message')).find((msg)=>msg.id === id);
        if (message) {
            this.dismissElement(message);
        }
    }
    /**
   * Dismiss all visible messages.
   */ dismissAll() {
        if (!this._container) return;
        const messages = this._container.querySelectorAll('vi-message');
        messages.forEach((msg)=>this.dismissElement(msg));
    }
    dismissElement(message) {
        if (message.classList.contains('exiting')) return;
        message.classList.add('exiting');
        // Cancel the component's internal auto-dismiss timer to prevent race conditions
        message.clearTimer();
        setTimeout(()=>{
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, this._config.animationDuration);
    }
    static{
        _initClass();
    }
}

const messageService = instance.resolve(_ViMessageService);
const meta = {
    title: 'Components/Message',
    component: 'vi-message',
    tags: [
        'autodocs'
    ],
    parameters: {
        docs: {
            description: {
                component: 'A lightweight, ephemeral global feedback message used to indicate the result of a user action without interrupting their workflow. Triggered programmatically via `messageService`.'
            }
        }
    }
};
const ProgrammaticUsage = {
    render: ()=>b`
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <vi-button
        variant="secondary"
        @click=${()=>{
            messageService.info('This is a normal message');
        }}
      >
        Info Message
      </vi-button>

      <vi-button
        variant="primary"
        @click=${()=>{
            messageService.success('Profile updated successfully');
        }}
      >
        Success Message
      </vi-button>

      <vi-button
        variant="secondary"
        @click=${()=>{
            messageService.warning('Your session will expire soon');
        }}
      >
        Warning Message
      </vi-button>

      <vi-button
        variant="danger"
        @click=${()=>{
            messageService.error('Failed to load data');
        }}
      >
        Error Message
      </vi-button>

      <vi-button
        variant="secondary"
        @click=${()=>{
            const id = messageService.loading('Action in progress...', 0);
            setTimeout(()=>{
                messageService.dismiss(id);
                messageService.success('Action completed');
            }, 3000);
        }}
      >
        Loading Message (3s)
      </vi-button>
    </div>
  `
};
const CustomDuration = {
    render: ()=>b`
    <div style="display: flex; gap: 8px;">
      <vi-button
        variant="primary"
        @click=${()=>{
            messageService.info('This will stay for 10 seconds', 10000);
        }}
      >
        10s Duration
      </vi-button>
    </div>
  `
};
const DismissAll = {
    render: ()=>b`
    <div style="display: flex; gap: 8px;">
      <vi-button
        variant="primary"
        @click=${()=>{
            for(let i = 0; i < 3; i++){
                setTimeout(()=>{
                    messageService.info(`Message ${i + 1}`, 0);
                }, i * 200);
            }
        }}
      >
        Spawn Multiple
      </vi-button>

      <vi-button variant="danger" @click=${()=>messageService.dismissAll()}>
        Dismiss All
      </vi-button>
    </div>
  `
};
const StickyAndCustomHTML = {
    render: ()=>b`
    <div style="display: flex; gap: 8px;">
      <vi-button
        variant="danger"
        @click=${()=>{
            const frag = document.createDocumentFragment();
            const span = document.createElement('span');
            span.innerHTML = '<strong>Network connection lost!</strong> Please check your cables. <a href="#" style="color: inherit; text-decoration: underline; margin-left: 8px;">Retry</a>';
            frag.appendChild(span);
            // 0 means sticky indefinitely
            messageService.error(frag, 0);
        }}
      >
        Simulate Network Loss (Sticky Custom HTML)
      </vi-button>
    </div>
  `
};
ProgrammaticUsage.parameters = {
    ...ProgrammaticUsage.parameters,
    docs: {
        ...ProgrammaticUsage.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px; flex-wrap: wrap;\">\n      <vi-button\n        variant=\"secondary\"\n        @click=${() => {\n    messageService.info('This is a normal message');\n  }}\n      >\n        Info Message\n      </vi-button>\n\n      <vi-button\n        variant=\"primary\"\n        @click=${() => {\n    messageService.success('Profile updated successfully');\n  }}\n      >\n        Success Message\n      </vi-button>\n\n      <vi-button\n        variant=\"secondary\"\n        @click=${() => {\n    messageService.warning('Your session will expire soon');\n  }}\n      >\n        Warning Message\n      </vi-button>\n\n      <vi-button\n        variant=\"danger\"\n        @click=${() => {\n    messageService.error('Failed to load data');\n  }}\n      >\n        Error Message\n      </vi-button>\n\n      <vi-button\n        variant=\"secondary\"\n        @click=${() => {\n    const id = messageService.loading('Action in progress...', 0);\n    setTimeout(() => {\n      messageService.dismiss(id);\n      messageService.success('Action completed');\n    }, 3000);\n  }}\n      >\n        Loading Message (3s)\n      </vi-button>\n    </div>\n  `\n}",
            ...ProgrammaticUsage.parameters?.docs?.source
        }
    }
};
CustomDuration.parameters = {
    ...CustomDuration.parameters,
    docs: {
        ...CustomDuration.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px;\">\n      <vi-button\n        variant=\"primary\"\n        @click=${() => {\n    messageService.info('This will stay for 10 seconds', 10000);\n  }}\n      >\n        10s Duration\n      </vi-button>\n    </div>\n  `\n}",
            ...CustomDuration.parameters?.docs?.source
        }
    }
};
DismissAll.parameters = {
    ...DismissAll.parameters,
    docs: {
        ...DismissAll.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px;\">\n      <vi-button\n        variant=\"primary\"\n        @click=${() => {\n    for (let i = 0; i < 3; i++) {\n      setTimeout(() => {\n        messageService.info(`Message ${i + 1}`, 0);\n      }, i * 200);\n    }\n  }}\n      >\n        Spawn Multiple\n      </vi-button>\n\n      <vi-button variant=\"danger\" @click=${() => messageService.dismissAll()}>\n        Dismiss All\n      </vi-button>\n    </div>\n  `\n}",
            ...DismissAll.parameters?.docs?.source
        }
    }
};
StickyAndCustomHTML.parameters = {
    ...StickyAndCustomHTML.parameters,
    docs: {
        ...StickyAndCustomHTML.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px;\">\n      <vi-button\n        variant=\"danger\"\n        @click=${() => {\n    const frag = document.createDocumentFragment();\n    const span = document.createElement('span');\n    span.innerHTML = '<strong>Network connection lost!</strong> Please check your cables. <a href=\"#\" style=\"color: inherit; text-decoration: underline; margin-left: 8px;\">Retry</a>';\n    frag.appendChild(span);\n\n    // 0 means sticky indefinitely\n    messageService.error(frag, 0);\n  }}\n      >\n        Simulate Network Loss (Sticky Custom HTML)\n      </vi-button>\n    </div>\n  `\n}",
            ...StickyAndCustomHTML.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["ProgrammaticUsage","CustomDuration","DismissAll","StickyAndCustomHTML"];

export { CustomDuration, DismissAll, ProgrammaticUsage, StickyAndCustomHTML, __namedExportsOrder, meta as default };
