import { s as singleton, i as instance } from './index-BeC6Zh2p.js';
import { r, i, b } from './iframe-Dou6M6kd.js';
import { V as ViElement, t, n } from './vi-element-D24a-rkj.js';
import './vi-icon-DLYcnZCy.js';
import './vi-button-CmhZ2JyL.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import { c as checkCircleIcon } from './check-circle-BQwul-8G.js';
import { c as circleXIcon } from './circle-x-C2gECXwf.js';
import { t as triangleWarningIcon, i as infoIcon } from './triangle-warning-CA6nkDfn.js';
import { x as xIcon } from './x-3JmBhc9n.js';
import './_commonjsHelpers-BFTU3MAI.js';
import './preload-helper-D5QYaGzd.js';
import './state-CeBMAm36.js';
import './directive-BKuZRRPO.js';
import './focusable-mixin-CmxOyPX5.js';

const toastStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.toast-root{display:flex;align-items:flex-start;box-sizing:border-box;width:var(--vi-toast-width, 360px);background-color:var(--vi-toast-bg, var(--vi-color-background, #ffffff));border:1px solid var(--vi-toast-border-color, var(--vi-border-02, #eeeeee));border-radius:var(--vi-toast-border-radius, var(--vi-border-radius-md, 6px));box-shadow:var(--vi-toast-shadow, var(--vi-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, .05), 0 20px 25px -5px rgba(0, 0, 0, .1)));padding:var(--vi-toast-padding, var(--vi-spacing-sm, .75rem) var(--vi-spacing-md, 1rem));padding-left:calc(var(--vi-toast-padding-left-base, var(--vi-spacing-md, 1rem)) + 4px);gap:var(--vi-toast-gap, var(--vi-spacing-sm, .75rem));font-family:var(--vi-toast-font-family, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));font-size:var(--vi-font-size-sm, .8125rem);line-height:var(--vi-line-height-normal, 1.5715);position:relative;overflow:hidden;pointer-events:auto}.toast-icon{display:flex;align-items:center;justify-content:center;flex-shrink:0;padding-top:2px}.toast-content{display:flex;flex-direction:column;flex-grow:1;min-width:0}.toast-title{font-weight:var(--vi-font-weight-semibold, 600);margin-bottom:var(--vi-spacing-unit, .25rem);display:block;color:var(--vi-text-primary, #111827)}.toast-message{color:var(--vi-text-secondary, #4b5563)}.toast-actions{display:flex;align-items:center;gap:var(--vi-spacing-xs, .5rem);margin-top:var(--vi-spacing-sm, .75rem)}.toast-progress{position:absolute;bottom:0;left:0;width:100%;height:var(--vi-toast-progress-height, 3px);background-color:var(--vi-toast-progress-bg, var(--vi-layer-03, #e5e7eb));transform-origin:left center}.toast-progress-bar{height:100%;background-color:var(--vi-toast-progress-color, var(--vi-color-primary, #3676d0));width:100%;transform-origin:left center}}:host{display:block}:host([hidden]){display:none!important}.toast-root:before{content:\"\";position:absolute;top:0;bottom:0;left:0;width:4px;background-color:transparent}.toast-root[data-variant=info]:before{background-color:var(--vi-toast-info-border, var(--vi-color-info, #3676d0))}.toast-root[data-variant=info] .toast-icon{color:var(--vi-toast-info-icon, var(--vi-color-info, #3676d0))}.toast-root[data-variant=info] .toast-progress-bar{background-color:var(--vi-toast-info-progress, var(--vi-color-info, #3676d0))}.toast-root[data-variant=success]:before{background-color:var(--vi-toast-success-border, var(--vi-color-success, #489167))}.toast-root[data-variant=success] .toast-icon{color:var(--vi-toast-success-icon, var(--vi-color-success, #489167))}.toast-root[data-variant=success] .toast-progress-bar{background-color:var(--vi-toast-success-progress, var(--vi-color-success, #489167))}.toast-root[data-variant=warning]:before{background-color:var(--vi-toast-warning-border, var(--vi-color-warning, #ffba00))}.toast-root[data-variant=warning] .toast-icon{color:var(--vi-toast-warning-icon, var(--vi-color-warning, #ffba00))}.toast-root[data-variant=warning] .toast-progress-bar{background-color:var(--vi-toast-warning-progress, var(--vi-color-warning, #ffba00))}.toast-root[data-variant=danger]:before{background-color:var(--vi-toast-danger-border, var(--vi-color-error, #ef4444))}.toast-root[data-variant=danger] .toast-icon{color:var(--vi-toast-danger-icon, var(--vi-color-error, #ef4444))}.toast-root[data-variant=danger] .toast-progress-bar{background-color:var(--vi-toast-danger-progress, var(--vi-color-error, #ef4444))}vi-icon,::slotted(vi-icon),::slotted(svg){--vi-icon-size: 1.25em;width:1.25em;height:1.25em}vi-button[part=close-btn]{margin-top:-4px;margin-right:-4px;margin-left:4px}@keyframes vi-toast-progress{0%{transform:scaleX(1)}to{transform:scaleX(0)}}.toast-progress-bar{animation-name:vi-toast-progress;animation-timing-function:linear;animation-fill-mode:forwards}:host([paused]) .toast-progress-bar{animation-play-state:paused}";

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
var _dec$2, _initClass$2, _ViElement$1, _dec1$1, _dec2$1, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _init_variant, _init_title, _init_message, _init_duration, _init_closable, _init_showProgress, _init_paused, _init_closeIcon, _init_actions, _initProto$1;
registerIcons([
    checkCircleIcon,
    triangleWarningIcon,
    infoIcon,
    circleXIcon,
    xIcon
]);
let _ViToast;
_dec$2 = t('vi-toast'), _dec1$1 = n({
    type: String,
    reflect: true
}), _dec2$1 = n({
    type: String
}), _dec3 = n({
    type: String
}), _dec4 = n({
    type: Number
}), _dec5 = n({
    type: Boolean,
    reflect: true
}), _dec6 = n({
    type: Boolean,
    attribute: 'show-progress'
}), _dec7 = n({
    type: Boolean,
    reflect: true
}), _dec8 = n({
    type: String,
    attribute: 'close-icon'
}), _dec9 = n({
    type: Array,
    attribute: false
});
new class extends _identity$1 {
    constructor(){
        super(_ViToast), _initClass$2();
    }
    static{
        class ViToast extends (_ViElement$1 = ViElement) {
            static{
                ({ e: [_init_variant, _init_title, _init_message, _init_duration, _init_closable, _init_showProgress, _init_paused, _init_closeIcon, _init_actions, _initProto$1], c: [_ViToast, _initClass$2] } = _apply_decs_2203_r$2(this, [
                    [
                        _dec1$1,
                        1,
                        "variant"
                    ],
                    [
                        _dec2$1,
                        1,
                        "title"
                    ],
                    [
                        _dec3,
                        1,
                        "message"
                    ],
                    [
                        _dec4,
                        1,
                        "duration"
                    ],
                    [
                        _dec5,
                        1,
                        "closable"
                    ],
                    [
                        _dec6,
                        1,
                        "showProgress"
                    ],
                    [
                        _dec7,
                        1,
                        "paused"
                    ],
                    [
                        _dec8,
                        1,
                        "closeIcon"
                    ],
                    [
                        _dec9,
                        1,
                        "actions"
                    ]
                ], [
                    _dec$2
                ], _ViElement$1));
            }
            static styles = i`
    ${r(toastStyles)}
  `;
            #___private_variant_1 = (_initProto$1(this), _init_variant(this, 'info'));
            get variant() {
                return this.#___private_variant_1;
            }
            set variant(_v) {
                this.#___private_variant_1 = _v;
            }
            #___private_title_2 = _init_title(this, '');
            get title() {
                return this.#___private_title_2;
            }
            set title(_v) {
                this.#___private_title_2 = _v;
            }
            #___private_message_3 = _init_message(this, '');
            get message() {
                return this.#___private_message_3;
            }
            set message(_v) {
                this.#___private_message_3 = _v;
            }
            #___private_duration_4 = _init_duration(this, 4000);
            get duration() {
                return this.#___private_duration_4;
            }
            set duration(_v) {
                this.#___private_duration_4 = _v;
            }
            #___private_closable_5 = _init_closable(this, true);
            get closable() {
                return this.#___private_closable_5;
            }
            set closable(_v) {
                this.#___private_closable_5 = _v;
            }
            #___private_showProgress_6 = _init_showProgress(this, true);
            get showProgress() {
                return this.#___private_showProgress_6;
            }
            set showProgress(_v) {
                this.#___private_showProgress_6 = _v;
            }
            #___private_paused_7 = _init_paused(this, false);
            get paused() {
                return this.#___private_paused_7;
            }
            set paused(_v) {
                this.#___private_paused_7 = _v;
            }
            #___private_closeIcon_8 = _init_closeIcon(this, 'x');
            get closeIcon() {
                return this.#___private_closeIcon_8;
            }
            set closeIcon(_v) {
                this.#___private_closeIcon_8 = _v;
            }
            #___private_actions_9 = _init_actions(this, []);
            get actions() {
                return this.#___private_actions_9;
            }
            set actions(_v) {
                this.#___private_actions_9 = _v;
            }
            _timer = null;
            _startTime = 0;
            _remainingTime = 0;
            connectedCallback() {
                super.connectedCallback();
                this.setAttribute('role', this.variant === 'warning' || this.variant === 'danger' ? 'alert' : 'status');
                this.setAttribute('aria-atomic', 'true');
                if (this.duration > 0) {
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
                if (changedProperties.has('variant')) {
                    this.setAttribute('role', this.variant === 'warning' || this.variant === 'danger' ? 'alert' : 'status');
                }
            }
            startTimer() {
                if (this.duration <= 0 || this._remainingTime <= 0 || this.paused) return;
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
                this.dispatchEvent(new CustomEvent('vi-toast-close', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        reason,
                        id: this.id
                    }
                }));
            }
            handleAction(action) {
                this.dispatchEvent(new CustomEvent('vi-toast-action', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        action,
                        id: this.id
                    }
                }));
            }
            get defaultIcon() {
                switch(this.variant){
                    case 'success':
                        return 'check-circle';
                    case 'warning':
                        return 'triangle-warning';
                    case 'danger':
                        return 'circle-x';
                    case 'info':
                    default:
                        return 'info';
                }
            }
            render() {
                const hasActions = this.actions && this.actions.length > 0;
                return b`
      <div part="toast" class="toast-root" data-variant=${this.variant}>
        <div part="icon" class="toast-icon">
          <slot name="icon">
            <vi-icon name=${this.defaultIcon} aria-hidden="true"></vi-icon>
          </slot>
        </div>

        <div part="content" class="toast-content">
          ${this.title ? b`<span part="title" class="toast-title">${this.title}</span>` : ''}
          <span part="message" class="toast-message">
            <slot>${this.message}</slot>
          </span>
          
          ${hasActions ? b`
            <div part="actions" class="toast-actions">
              ${this.actions.map((action)=>b`
                <vi-button 
                  variant=${action.variant || 'ghost'} 
                  size="sm" 
                  @click=${()=>this.handleAction(action.action)}
                >
                  ${action.label}
                </vi-button>
              `)}
            </div>
          ` : ''}
        </div>

        ${this.closable ? b`
          <vi-button
            part="close-btn"
            variant="ghost"
            size="sm"
            icon-only
            aria-label="Dismiss notification"
            @click=${()=>this.handleDismiss('user')}
          >
            <vi-icon name=${this.closeIcon} slot="icon"></vi-icon>
          </vi-button>
        ` : ''}
        
        ${this.duration > 0 && this.showProgress ? b`
          <div part="progress" class="toast-progress" aria-hidden="true">
            <div 
              part="progress-bar" 
              class="toast-progress-bar" 
              style="animation-duration: ${this.duration}ms;"
            ></div>
          </div>
        ` : ''}
      </div>
    `;
            }
        }
    }
}();

const containerStyles = "@charset \"UTF-8\";@layer reset,components,utilities;:host{display:block;position:fixed;z-index:var(--vi-toast-z-index, 10000);pointer-events:none}:host([position^=top]){top:var(--vi-toast-top-offset, var(--vi-spacing-lg, 1.5rem))}:host([position^=bottom]){bottom:var(--vi-toast-bottom-offset, var(--vi-spacing-lg, 1.5rem))}:host([position$=right]){right:var(--vi-toast-right-offset, var(--vi-spacing-lg, 1.5rem))}:host([position$=left]){left:var(--vi-toast-left-offset, var(--vi-spacing-lg, 1.5rem))}:host([position$=center]){left:50%;transform:translate(-50%)}.toast-stack{display:flex;flex-direction:column;gap:var(--vi-spacing-sm, .75rem);pointer-events:none}:host([position^=bottom]) .toast-stack{flex-direction:column-reverse}::slotted(vi-toast){transition:all .25s cubic-bezier(.2,0,0,1);transform-origin:center;pointer-events:auto}::slotted(vi-toast.entering){opacity:0}:host([position$=right]) ::slotted(vi-toast.entering){transform:translate(var(--vi-toast-slide-distance, 24px))}:host([position$=left]) ::slotted(vi-toast.entering){transform:translate(calc(-1 * var(--vi-toast-slide-distance, 24px)))}:host([position$=center][position^=top]) ::slotted(vi-toast.entering){transform:translateY(calc(-1 * var(--vi-toast-slide-distance, 24px)))}:host([position$=center][position^=bottom]) ::slotted(vi-toast.entering){transform:translateY(var(--vi-toast-slide-distance, 24px))}::slotted(vi-toast.exiting){opacity:0!important;max-height:0!important;margin-top:calc(-1 * var(--vi-spacing-sm, .75rem))!important;margin-bottom:0!important;padding-top:0!important;padding-bottom:0!important;border:none!important;overflow:hidden!important;transform:scale(.9)!important}@media(prefers-reduced-motion:reduce){::slotted(vi-toast){transition:none!important}}";

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
var _dec$1, _initClass$1, _ViElement, _dec1, _dec2, _init_position, _init_maxVisible, _initProto;
let _ViToastContainer;
_dec$1 = t('vi-toast-container'), _dec1 = n({
    type: String,
    reflect: true
}), _dec2 = n({
    type: Number
});
new class extends _identity {
    constructor(){
        super(_ViToastContainer), _initClass$1();
    }
    static{
        class ViToastContainer extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_position, _init_maxVisible, _initProto], c: [_ViToastContainer, _initClass$1] } = _apply_decs_2203_r$1(this, [
                    [
                        _dec1,
                        1,
                        "position"
                    ],
                    [
                        _dec2,
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
            #___private_position_1 = (_initProto(this), _init_position(this, 'top-right'));
            get position() {
                return this.#___private_position_1;
            }
            set position(_v) {
                this.#___private_position_1 = _v;
            }
            #___private_maxVisible_2 = _init_maxVisible(this, 5);
            get maxVisible() {
                return this.#___private_maxVisible_2;
            }
            set maxVisible(_v) {
                this.#___private_maxVisible_2 = _v;
            }
            _handleMouseEnter = ()=>{
                // Pause all toasts
                const toasts = this.querySelectorAll('vi-toast');
                toasts.forEach((toast)=>{
                    toast.paused = true;
                });
            };
            _handleMouseLeave = ()=>{
                // Resume all toasts
                const toasts = this.querySelectorAll('vi-toast');
                toasts.forEach((toast)=>{
                    toast.paused = false;
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
      <div class="toast-stack" part="stack">
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
let _ViToastService;
_dec = singleton();
class ViToastService {
    static{
        ({ c: [_ViToastService, _initClass] } = _apply_decs_2203_r(this, [], [
            _dec
        ]));
    }
    _containers = new Map();
    _config = {
        position: 'top-right',
        maxVisible: 5,
        defaultDuration: 4000,
        animationDuration: 250
    };
    /**
   * Configure global defaults for the toast service.
   * Call this once at app bootstrap.
   */ configure(config) {
        this._config = {
            ...this._config,
            ...config
        };
        // Update existing containers with new maxVisible
        this._containers.forEach((container)=>{
            container.setAttribute('maxVisible', this._config.maxVisible.toString());
        });
    }
    _ensureContainer(position) {
        const existingContainer = this._containers.get(position);
        if (!existingContainer || !existingContainer.isConnected) {
            const container = document.createElement('vi-toast-container');
            container.setAttribute('position', position);
            container.setAttribute('maxVisible', this._config.maxVisible.toString());
            document.body.appendChild(container);
            this._containers.set(position, container);
        }
        return this._containers.get(position);
    }
    /**
   * Show a toast notification.
   */ show(options) {
        const position = options.position || this._config.position;
        const container = this._ensureContainer(position);
        const toastId = options.id || crypto.randomUUID();
        // Check if maxVisible is exceeded in this specific container
        const currentToasts = Array.from(container.querySelectorAll('vi-toast')).filter((toast)=>!toast.classList.contains('exiting'));
        if (this._config.maxVisible <= 0) return toastId;
        if (currentToasts.length >= this._config.maxVisible) {
            const excess = currentToasts.length - this._config.maxVisible + 1;
            for(let i = 0; i < excess; i++){
                this.dismissElement(currentToasts[i]);
            }
        }
        const toast = document.createElement('vi-toast');
        toast.id = toastId;
        toast.variant = options.variant;
        if (options.title) toast.title = options.title;
        if (options.message) toast.message = options.message;
        if (options.content) toast.appendChild(options.content);
        if (options.closeIcon) toast.closeIcon = options.closeIcon;
        if (options.className) toast.className = options.className;
        if (options.style) toast.setAttribute('style', options.style);
        toast.duration = options.duration ?? this._config.defaultDuration;
        if (options.closable !== undefined) toast.closable = options.closable;
        if (options.showProgress !== undefined) toast.showProgress = options.showProgress;
        if (options.actions) toast.actions = options.actions;
        // Listeners
        toast.addEventListener('vi-toast-close', (e)=>{
            const customEvent = e;
            try {
                if (options.onClose) {
                    options.onClose(customEvent.detail.reason);
                }
            } catch (error) {
                console.error('Error in toast onClose callback:', error);
            } finally{
                this.dismissElement(toast);
            }
        });
        toast.addEventListener('vi-toast-action', (e)=>{
            const customEvent = e;
            if (options.onAction) {
                options.onAction(customEvent.detail.action);
            }
        });
        if (options.onClick) {
            toast.addEventListener('click', (e)=>{
                const target = e.target;
                // Do not trigger onClick if clicking a button inside the toast
                if (!target.closest('vi-button')) {
                    options.onClick?.();
                }
            });
        }
        // Animation entry
        toast.classList.add('entering');
        container.appendChild(toast);
        // Trigger reflow to ensure animation plays
        toast.getBoundingClientRect();
        requestAnimationFrame(()=>{
            toast.classList.remove('entering');
        });
        return toastId;
    }
    /**
   * Dismiss a specific toast by its ID.
   */ dismiss(id) {
        this._containers.forEach((container)=>{
            const toast = Array.from(container.querySelectorAll('vi-toast')).find((t)=>t.id === id);
            if (toast) {
                this.dismissElement(toast);
            }
        });
    }
    /**
   * Dismiss all visible toasts across all containers.
   */ dismissAll() {
        this._containers.forEach((container)=>{
            const toasts = container.querySelectorAll('vi-toast');
            toasts.forEach((toast)=>this.dismissElement(toast));
        });
    }
    dismissElement(toast) {
        if (toast.classList.contains('exiting')) return;
        toast.classList.add('exiting');
        // Cancel the component's internal auto-dismiss timer to prevent race conditions
        toast.clearTimer();
        setTimeout(()=>{
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, this._config.animationDuration);
    }
    static{
        _initClass();
    }
}

const toastService = instance.resolve(_ViToastService);
const meta = {
    title: 'Components/Toast',
    component: 'vi-toast',
    tags: [
        'autodocs'
    ],
    parameters: {
        docs: {
            description: {
                component: 'Ephemeral floating notifications that appear in response to user actions or system events. Primarily triggered programmatically via `toastService`.'
            }
        }
    }
};
const ProgrammaticUsage = {
    render: ()=>b`
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <vi-button
        variant="primary"
        @click=${()=>{
            toastService.show({
                variant: 'info',
                title: 'Tip',
                message: 'You can use keyboard shortcut Ctrl+S to save.'
            });
        }}
      >
        Show Info
      </vi-button>
      
      <vi-button
        variant="primary"
        @click=${()=>{
            toastService.show({
                variant: 'success',
                title: 'Draft saved',
                message: 'Your progress has been saved automatically.'
            });
        }}
      >
        Show Success
      </vi-button>

      <vi-button
        variant="primary"
        @click=${()=>{
            toastService.show({
                variant: 'warning',
                title: 'Connection lost',
                message: 'Working offline. Changes will sync when online.'
            });
        }}
      >
        Show Warning
      </vi-button>

      <vi-button
        variant="primary"
        @click=${()=>{
            toastService.show({
                variant: 'danger',
                title: 'Upload failed',
                message: 'The file was too large to upload.'
            });
        }}
      >
        Show Error
      </vi-button>

      <vi-button
        variant="primary"
        @click=${()=>{
            const frag = document.createDocumentFragment();
            const strong = document.createElement('strong');
            strong.textContent = 'Custom HTML: ';
            const span = document.createElement('span');
            span.textContent = 'This uses a DOM Node for the message!';
            span.style.textDecoration = 'underline';
            frag.appendChild(strong);
            frag.appendChild(span);
            toastService.show({
                variant: 'info',
                content: frag
            });
        }}
      >
        Show Custom HTML
      </vi-button>
    </div>
  `
};
const WithActions = {
    render: ()=>b`
    <vi-button
      variant="primary"
      @click=${()=>{
            toastService.show({
                variant: 'warning',
                title: 'Session expiring',
                message: 'You will be logged out in 5 minutes.',
                duration: 0,
                // sticky
                closable: true,
                actions: [
                    {
                        label: 'Extend session',
                        action: 'extend',
                        variant: 'primary'
                    }
                ],
                onAction: (action)=>alert(`Action triggered: ${action}`)
            });
        }}
    >
      Show Sticky with Action
    </vi-button>
  `
};
const CustomPositions = {
    render: ()=>b`
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <vi-button
        variant="secondary"
        @click=${()=>{
            toastService.show({
                variant: 'info',
                message: 'I am on the top left!',
                position: 'top-left'
            });
        }}
      >
        Top Left
      </vi-button>

      <vi-button
        variant="secondary"
        @click=${()=>{
            toastService.show({
                variant: 'info',
                message: 'I am on the top center!',
                position: 'top-center'
            });
        }}
      >
        Top Center
      </vi-button>

      <vi-button
        variant="secondary"
        @click=${()=>{
            toastService.show({
                variant: 'info',
                message: 'I am on the top right!',
                position: 'top-right'
            });
        }}
      >
        Top Right
      </vi-button>

      <vi-button
        variant="secondary"
        @click=${()=>{
            toastService.show({
                variant: 'info',
                message: 'I am on the bottom left!',
                position: 'bottom-left'
            });
        }}
      >
        Bottom Left
      </vi-button>
      
      <vi-button
        variant="secondary"
        @click=${()=>{
            toastService.show({
                variant: 'info',
                message: 'I am in the bottom center!',
                position: 'bottom-center'
            });
        }}
      >
        Bottom Center
      </vi-button>

      <vi-button
        variant="secondary"
        @click=${()=>{
            toastService.show({
                variant: 'info',
                message: 'I am on the bottom right!',
                position: 'bottom-right'
            });
        }}
      >
        Bottom Right
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
            toastService.configure({
                position: 'top-right'
            });
            for(let i = 0; i < 3; i++){
                setTimeout(()=>{
                    toastService.show({
                        variant: 'info',
                        message: `Toast ${i + 1}`,
                        duration: 0
                    });
                }, i * 200);
            }
        }}
      >
        Spawn Multiple
      </vi-button>

      <vi-button
        variant="danger"
        @click=${()=>toastService.dismissAll()}
      >
        Dismiss All
      </vi-button>
    </div>
  `
};
const StickyNetworkLoss = {
    render: ()=>b`
    <div style="display: flex; gap: 8px;">
      <vi-button
        variant="danger"
        @click=${()=>{
            const frag = document.createDocumentFragment();
            const span = document.createElement('span');
            span.innerHTML = '<strong>Network Offline!</strong> Some features may not be available until you reconnect.';
            frag.appendChild(span);
            toastService.show({
                variant: 'danger',
                content: frag,
                duration: 0,
                // sticky indefinitely
                closable: true,
                actions: [
                    {
                        label: 'Try again',
                        action: 'retry',
                        variant: 'primary'
                    }
                ],
                onAction: (action)=>alert(`Action triggered: ${action}`)
            });
        }}
      >
        Simulate Network Loss (Sticky Toast)
      </vi-button>
    </div>
  `
};
ProgrammaticUsage.parameters = {
    ...ProgrammaticUsage.parameters,
    docs: {
        ...ProgrammaticUsage.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px; flex-wrap: wrap;\">\n      <vi-button\n        variant=\"primary\"\n        @click=${() => {\n    toastService.show({\n      variant: 'info',\n      title: 'Tip',\n      message: 'You can use keyboard shortcut Ctrl+S to save.'\n    });\n  }}\n      >\n        Show Info\n      </vi-button>\n      \n      <vi-button\n        variant=\"primary\"\n        @click=${() => {\n    toastService.show({\n      variant: 'success',\n      title: 'Draft saved',\n      message: 'Your progress has been saved automatically.'\n    });\n  }}\n      >\n        Show Success\n      </vi-button>\n\n      <vi-button\n        variant=\"primary\"\n        @click=${() => {\n    toastService.show({\n      variant: 'warning',\n      title: 'Connection lost',\n      message: 'Working offline. Changes will sync when online.'\n    });\n  }}\n      >\n        Show Warning\n      </vi-button>\n\n      <vi-button\n        variant=\"primary\"\n        @click=${() => {\n    toastService.show({\n      variant: 'danger',\n      title: 'Upload failed',\n      message: 'The file was too large to upload.'\n    });\n  }}\n      >\n        Show Error\n      </vi-button>\n\n      <vi-button\n        variant=\"primary\"\n        @click=${() => {\n    const frag = document.createDocumentFragment();\n    const strong = document.createElement('strong');\n    strong.textContent = 'Custom HTML: ';\n    const span = document.createElement('span');\n    span.textContent = 'This uses a DOM Node for the message!';\n    span.style.textDecoration = 'underline';\n    frag.appendChild(strong);\n    frag.appendChild(span);\n    toastService.show({\n      variant: 'info',\n      content: frag\n    });\n  }}\n      >\n        Show Custom HTML\n      </vi-button>\n    </div>\n  `\n}",
            ...ProgrammaticUsage.parameters?.docs?.source
        }
    }
};
WithActions.parameters = {
    ...WithActions.parameters,
    docs: {
        ...WithActions.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <vi-button\n      variant=\"primary\"\n      @click=${() => {\n    toastService.show({\n      variant: 'warning',\n      title: 'Session expiring',\n      message: 'You will be logged out in 5 minutes.',\n      duration: 0,\n      // sticky\n      closable: true,\n      actions: [{\n        label: 'Extend session',\n        action: 'extend',\n        variant: 'primary'\n      }],\n      onAction: action => alert(`Action triggered: ${action}`)\n    });\n  }}\n    >\n      Show Sticky with Action\n    </vi-button>\n  `\n}",
            ...WithActions.parameters?.docs?.source
        }
    }
};
CustomPositions.parameters = {
    ...CustomPositions.parameters,
    docs: {
        ...CustomPositions.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px; flex-wrap: wrap;\">\n      <vi-button\n        variant=\"secondary\"\n        @click=${() => {\n    toastService.show({\n      variant: 'info',\n      message: 'I am on the top left!',\n      position: 'top-left'\n    });\n  }}\n      >\n        Top Left\n      </vi-button>\n\n      <vi-button\n        variant=\"secondary\"\n        @click=${() => {\n    toastService.show({\n      variant: 'info',\n      message: 'I am on the top center!',\n      position: 'top-center'\n    });\n  }}\n      >\n        Top Center\n      </vi-button>\n\n      <vi-button\n        variant=\"secondary\"\n        @click=${() => {\n    toastService.show({\n      variant: 'info',\n      message: 'I am on the top right!',\n      position: 'top-right'\n    });\n  }}\n      >\n        Top Right\n      </vi-button>\n\n      <vi-button\n        variant=\"secondary\"\n        @click=${() => {\n    toastService.show({\n      variant: 'info',\n      message: 'I am on the bottom left!',\n      position: 'bottom-left'\n    });\n  }}\n      >\n        Bottom Left\n      </vi-button>\n      \n      <vi-button\n        variant=\"secondary\"\n        @click=${() => {\n    toastService.show({\n      variant: 'info',\n      message: 'I am in the bottom center!',\n      position: 'bottom-center'\n    });\n  }}\n      >\n        Bottom Center\n      </vi-button>\n\n      <vi-button\n        variant=\"secondary\"\n        @click=${() => {\n    toastService.show({\n      variant: 'info',\n      message: 'I am on the bottom right!',\n      position: 'bottom-right'\n    });\n  }}\n      >\n        Bottom Right\n      </vi-button>\n    </div>\n  `\n}",
            ...CustomPositions.parameters?.docs?.source
        }
    }
};
DismissAll.parameters = {
    ...DismissAll.parameters,
    docs: {
        ...DismissAll.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px;\">\n      <vi-button\n        variant=\"primary\"\n        @click=${() => {\n    toastService.configure({\n      position: 'top-right'\n    });\n    for (let i = 0; i < 3; i++) {\n      setTimeout(() => {\n        toastService.show({\n          variant: 'info',\n          message: `Toast ${i + 1}`,\n          duration: 0\n        });\n      }, i * 200);\n    }\n  }}\n      >\n        Spawn Multiple\n      </vi-button>\n\n      <vi-button\n        variant=\"danger\"\n        @click=${() => toastService.dismissAll()}\n      >\n        Dismiss All\n      </vi-button>\n    </div>\n  `\n}",
            ...DismissAll.parameters?.docs?.source
        }
    }
};
StickyNetworkLoss.parameters = {
    ...StickyNetworkLoss.parameters,
    docs: {
        ...StickyNetworkLoss.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 8px;\">\n      <vi-button\n        variant=\"danger\"\n        @click=${() => {\n    const frag = document.createDocumentFragment();\n    const span = document.createElement('span');\n    span.innerHTML = '<strong>Network Offline!</strong> Some features may not be available until you reconnect.';\n    frag.appendChild(span);\n    toastService.show({\n      variant: 'danger',\n      content: frag,\n      duration: 0,\n      // sticky indefinitely\n      closable: true,\n      actions: [{\n        label: 'Try again',\n        action: 'retry',\n        variant: 'primary'\n      }],\n      onAction: action => alert(`Action triggered: ${action}`)\n    });\n  }}\n      >\n        Simulate Network Loss (Sticky Toast)\n      </vi-button>\n    </div>\n  `\n}",
            ...StickyNetworkLoss.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["ProgrammaticUsage","WithActions","CustomPositions","DismissAll","StickyNetworkLoss"];

export { CustomPositions, DismissAll, ProgrammaticUsage, StickyNetworkLoss, WithActions, __namedExportsOrder, meta as default };
