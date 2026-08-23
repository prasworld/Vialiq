import { r as r$1, i, b } from './iframe-DPjVeIYZ.js';
import { V as ViElement, t, n } from './vi-element-CFl5z9YB.js';
import { r } from './state-DxFifLpA.js';

const badgeStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.badge{display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;box-sizing:border-box;font-size:var(--vi-badge-font-size, 11px);font-weight:var(--vi-badge-font-weight, var(--vi-font-weight-semibold, 600));padding:var(--vi-badge-padding, 2px 8px);border-radius:var(--vi-badge-border-radius, 9999px);gap:var(--vi-badge-gap, 4px);border:var(--vi-border-width-thin, 1px) solid transparent}.dot{display:inline-block;width:var(--vi-badge-dot-size, 8px);height:var(--vi-badge-dot-size, 8px);border-radius:50%;background-color:currentColor;flex-shrink:0}.icon{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}}:host{display:inline-block;vertical-align:middle}:host([hidden]),:host([count=\"0\"]:not([show-zero])){display:none!important}:host([size=sm]){--vi-badge-font-size: 10px;--vi-badge-padding: 0 6px;--vi-badge-gap: 2px;--vi-badge-dot-size: 6px}:host([size=md]){--vi-badge-font-size: 11px;--vi-badge-padding: 2px 8px;--vi-badge-gap: 4px;--vi-badge-dot-size: 8px}:host([size=lg]){--vi-badge-font-size: 13px;--vi-badge-padding: 4px 12px;--vi-badge-gap: 6px;--vi-badge-dot-size: 10px}:host([pill]){--vi-badge-border-radius: 9999px}:host(:not([pill])){--vi-badge-border-radius: var(--vi-border-radius-sm, 2px)}.badge.dot-only{--vi-badge-padding: 4px}:host([variant=neutral]) .badge{background-color:var(--vi-badge-neutral-bg, var(--vi-border-02, #eeeeee));color:var(--vi-badge-neutral-color, var(--vi-text-secondary, #4b5563))}:host([variant=primary]) .badge{background-color:var(--vi-badge-primary-bg, var(--vi-bg-info, #e3f2fd));color:var(--vi-badge-primary-color, var(--vi-text-info, #3676d0))}:host([variant=success]) .badge{background-color:var(--vi-badge-success-bg, var(--vi-bg-success, #e6f9f0));color:var(--vi-badge-success-color, var(--vi-text-success, #265a3d))}:host([variant=warning]) .badge{background-color:var(--vi-badge-warning-bg, var(--vi-bg-warning, #fff8e1));color:var(--vi-badge-warning-color, var(--vi-text-warning, #e68300))}:host([variant=danger]) .badge{background-color:var(--vi-badge-danger-bg, var(--vi-bg-error, #ffebee));color:var(--vi-badge-danger-color, var(--vi-text-error, #db231b))}:host([variant=info]) .badge{background-color:var(--vi-badge-info-bg, var(--vi-bg-info, #e3f2fd));color:var(--vi-badge-info-color, var(--vi-text-info, #3676d0))}:host([outline][variant=neutral]) .badge{background-color:transparent;color:var(--vi-badge-neutral-color, var(--vi-text-secondary, #4b5563));border-color:var(--vi-badge-neutral-border, var(--vi-border-03, #e0e0e0))}:host([outline][variant=primary]) .badge{background-color:transparent;color:var(--vi-badge-primary-color, var(--vi-text-info, #3676d0));border-color:var(--vi-badge-primary-border, var(--vi-color-primary, #3676d0))}:host([outline][variant=success]) .badge{background-color:transparent;color:var(--vi-badge-success-color, var(--vi-text-success, #265a3d));border-color:var(--vi-badge-success-border, var(--vi-color-success, #489167))}:host([outline][variant=warning]) .badge{background-color:transparent;color:var(--vi-badge-warning-color, var(--vi-text-warning, #e68300));border-color:var(--vi-badge-warning-border, var(--vi-color-warning, #ffba00))}:host([outline][variant=danger]) .badge{background-color:transparent;color:var(--vi-badge-danger-color, var(--vi-text-error, #db231b));border-color:var(--vi-badge-danger-border, var(--vi-color-error, #ef4444))}:host([outline][variant=info]) .badge{background-color:transparent;color:var(--vi-badge-info-color, var(--vi-text-info, #3676d0));border-color:var(--vi-badge-info-border, var(--vi-color-info, #3676d0))}.icon{display:inline-flex;flex-shrink:0}.icon[hidden]{display:none}::slotted(vi-icon),::slotted(svg){--vi-icon-size: 1em;width:1em;height:1em}";

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
var _dec, _initClass, _ViElement, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, /** Colour semantic */ _init_variant, /** Size */ _init_size, /** Show coloured dot */ _init_dot, /** Fully rounded (pill shape) vs. square */ _init_pill, /** Numeric count to display */ _init_count, /** Show the badge even if the count is zero */ _init_showZero, /** Max count before showing {max}+ */ _init_max, /** Outlined/ghost style */ _init_outline, _init__hasIcon, _init__hasDefaultSlot, _initProto;
let _ViBadge;
_dec = t('vi-badge'), _dec1 = n({
    type: String,
    reflect: true
}), _dec2 = n({
    type: String,
    reflect: true
}), _dec3 = n({
    type: Boolean,
    reflect: true
}), _dec4 = n({
    type: Boolean,
    reflect: true
}), _dec5 = n({
    type: Number,
    reflect: true
}), _dec6 = n({
    type: Boolean,
    reflect: true,
    attribute: 'show-zero'
}), _dec7 = n({
    type: Number
}), _dec8 = n({
    type: Boolean,
    reflect: true
}), _dec9 = r(), _dec10 = r();
new class extends _identity {
    constructor(){
        super(_ViBadge), _initClass();
    }
    static{
        class ViBadge extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_variant, _init_size, _init_dot, _init_pill, _init_count, _init_showZero, _init_max, _init_outline, _init__hasIcon, _init__hasDefaultSlot, _initProto], c: [_ViBadge, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "variant"
                    ],
                    [
                        _dec2,
                        1,
                        "size"
                    ],
                    [
                        _dec3,
                        1,
                        "dot"
                    ],
                    [
                        _dec4,
                        1,
                        "pill"
                    ],
                    [
                        _dec5,
                        1,
                        "count"
                    ],
                    [
                        _dec6,
                        1,
                        "showZero"
                    ],
                    [
                        _dec7,
                        1,
                        "max"
                    ],
                    [
                        _dec8,
                        1,
                        "outline"
                    ],
                    [
                        _dec9,
                        1,
                        "_hasIcon"
                    ],
                    [
                        _dec10,
                        1,
                        "_hasDefaultSlot"
                    ]
                ], [
                    _dec
                ], _ViElement));
            }
            static styles = i`${r$1(badgeStyles)}`;
            #___private_variant_1 = (_initProto(this), _init_variant(this, 'neutral'));
            get variant() {
                return this.#___private_variant_1;
            }
            set variant(_v) {
                this.#___private_variant_1 = _v;
            }
            #___private_size_2 = _init_size(this, 'md');
            get size() {
                return this.#___private_size_2;
            }
            set size(_v) {
                this.#___private_size_2 = _v;
            }
            #___private_dot_3 = _init_dot(this, false);
            get dot() {
                return this.#___private_dot_3;
            }
            set dot(_v) {
                this.#___private_dot_3 = _v;
            }
            #___private_pill_4 = _init_pill(this, true);
            get pill() {
                return this.#___private_pill_4;
            }
            set pill(_v) {
                this.#___private_pill_4 = _v;
            }
            #___private_count_5 = _init_count(this, undefined);
            get count() {
                return this.#___private_count_5;
            }
            set count(_v) {
                this.#___private_count_5 = _v;
            }
            #___private_showZero_6 = _init_showZero(this, false);
            get showZero() {
                return this.#___private_showZero_6;
            }
            set showZero(_v) {
                this.#___private_showZero_6 = _v;
            }
            #___private_max_7 = _init_max(this, 99);
            get max() {
                return this.#___private_max_7;
            }
            set max(_v) {
                this.#___private_max_7 = _v;
            }
            #___private_outline_8 = _init_outline(this, false);
            get outline() {
                return this.#___private_outline_8;
            }
            set outline(_v) {
                this.#___private_outline_8 = _v;
            }
            #___private__hasIcon_9 = _init__hasIcon(this, false);
            get _hasIcon() {
                return this.#___private__hasIcon_9;
            }
            set _hasIcon(_v) {
                this.#___private__hasIcon_9 = _v;
            }
            #___private__hasDefaultSlot_10 = _init__hasDefaultSlot(this, false);
            get _hasDefaultSlot() {
                return this.#___private__hasDefaultSlot_10;
            }
            set _hasDefaultSlot(_v) {
                this.#___private__hasDefaultSlot_10 = _v;
            }
            connectedCallback() {
                super.connectedCallback();
                this.updateAriaHidden();
            }
            updated(changedProperties) {
                super.updated(changedProperties);
                if (changedProperties.has('dot') || changedProperties.has('count') || changedProperties.has('showZero') || changedProperties.has('_hasDefaultSlot')) {
                    this.updateAriaHidden();
                }
            }
            updateAriaHidden() {
                const isPurelyDecorative = this.dot && !this._hasDefaultSlot && this.count === undefined && !this.hasAttribute('aria-label') && !this.hasAttribute('aria-labelledby');
                if (isPurelyDecorative) {
                    this.setAttribute('aria-hidden', 'true');
                } else {
                    this.removeAttribute('aria-hidden');
                }
            }
            onIconSlotChange(e) {
                const slot = e.target;
                this._hasIcon = slot.assignedElements({
                    flatten: true
                }).length > 0;
            }
            onDefaultSlotChange(e) {
                const slot = e.target;
                this._hasDefaultSlot = slot.assignedNodes({
                    flatten: true
                }).some((node)=>{
                    // Check if it's text with actual content or an element
                    return node.nodeType === Node.TEXT_NODE && node.textContent?.trim().length || node.nodeType === Node.ELEMENT_NODE;
                });
                this.updateAriaHidden();
            }
            render() {
                let countContent = '';
                // If count is defined, render it, and we do not render the default slot content
                const hideDefaultSlot = this.count !== undefined;
                if (this.count !== undefined) {
                    countContent = b`${this.count > this.max ? `${this.max}+` : `${this.count}`}`;
                }
                const dotContent = this.dot ? b`<span part="dot" class="dot"></span>` : '';
                return b`
      <span class="badge ${this.dot && !this._hasDefaultSlot && this.count === undefined ? 'dot-only' : ''}" part="badge">
        <slot
          name="icon"
          part="icon"
          class="icon"
          ?hidden=${!this._hasIcon}
          @slotchange=${this.onIconSlotChange}
        ></slot>
        ${dotContent}
        ${countContent}
        <slot ?hidden=${hideDefaultSlot} @slotchange=${this.onDefaultSlotChange}></slot>
      </span>
    `;
            }
        }
    }
}();
