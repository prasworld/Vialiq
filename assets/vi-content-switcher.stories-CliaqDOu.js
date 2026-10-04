import { r as r$1, i, b } from './iframe-hzqOaETw.js';
import { o } from './if-defined-WAi_GbIg.js';
import { V as ViElement, t, n } from './vi-element-B3cR7BW5.js';
import { r } from './state-jUdfvlB0.js';
import './preload-helper-D5QYaGzd.js';

const switcherStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.content-switcher-track,.track{display:inline-flex;align-items:center;position:relative;padding:var(--vi-content-switcher-track-padding, .1875rem);background-color:var(--vi-content-switcher-track-background, var(--vi-layer-02, #f3f4f6));border-radius:var(--vi-content-switcher-track-radius, var(--vi-border-radius-full, 9999px));-webkit-user-select:none;user-select:none}.content-switcher-indicator,.indicator{position:absolute;inset-block:var(--vi-content-switcher-track-padding, .1875rem);left:var(--_indicator-left, 0px);width:var(--_indicator-width, 0px);transition:all var(--vi-content-switcher-transition, .16s ease);background-color:var(--vi-content-switcher-indicator-background, var(--vi-layer-selected, var(--vi-color-primary, #3676d0)));border-radius:var(--vi-content-switcher-indicator-radius, var(--vi-border-radius-lg, 8px));box-shadow:var(--vi-content-switcher-indicator-shadow, var(--vi-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, .03)));pointer-events:none}@media(prefers-reduced-motion:reduce){.content-switcher-indicator,.indicator{transition:none}}}:host{display:inline-block;outline:none}:host([disabled]){opacity:.5;pointer-events:none}:host([block]){display:block;width:100%}:host([block]) .track{display:flex;width:100%}:host([block]) ::slotted(vi-switcher-item){flex:1 1 0}:host([size=sm]){--vi-content-switcher-item-padding-block: .25rem;--vi-content-switcher-item-padding-inline: var(--vi-spacing-sm, .75rem);--vi-content-switcher-font-size: var(--vi-font-size-sm, .8125rem)}:host([size=md]){--vi-content-switcher-item-padding-block: .375rem;--vi-content-switcher-item-padding-inline: var(--vi-spacing-md, 1rem);--vi-content-switcher-font-size: var(--vi-font-size-base, .875rem)}:host([size=lg]){--vi-content-switcher-item-padding-block: .5rem;--vi-content-switcher-item-padding-inline: var(--vi-spacing-lg, 1.5rem);--vi-content-switcher-font-size: var(--vi-font-size-lg, 1rem)}";

const itemStyles = "@charset \"UTF-8\";@layer reset,components,utilities;:host{display:inline-flex;align-items:center;justify-content:center;gap:var(--vi-content-switcher-icon-gap, 8px);position:relative;z-index:1;cursor:pointer;outline:none;padding-block:var(--vi-content-switcher-item-padding-block, .375rem);padding-inline:var(--vi-content-switcher-item-padding-inline, var(--vi-spacing-md, 1rem));font-size:var(--vi-content-switcher-font-size, var(--vi-font-size-base, .875rem));font-weight:var(--vi-content-switcher-font-weight, var(--vi-font-weight-medium, 500));line-height:var(--vi-content-switcher-line-height, var(--vi-line-height-tight, 1.2));white-space:nowrap;color:var(--vi-content-switcher-item-color, var(--vi-text-secondary, #4b5563));border-radius:var(--vi-content-switcher-indicator-radius, var(--vi-border-radius-lg, 8px));transition:color var(--vi-content-switcher-transition, .16s ease),font-weight var(--vi-content-switcher-transition, .16s ease);-webkit-user-select:none;user-select:none}:host([active]){color:var(--vi-content-switcher-item-color-active, var(--vi-text-primary-inverse, #ffffff));font-weight:var(--vi-content-switcher-font-weight-active, var(--vi-font-weight-semibold, 600))}:host(:not([active]):not([disabled]):hover){color:var(--vi-content-switcher-item-color-hover, var(--vi-text-primary, #111827))}:host(:focus-visible){outline:2px solid var(--vi-content-switcher-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:-2px;box-shadow:var(--vi-focus-ring-shadow, 0 0 0 3px var(--vi-focus-ring-color, var(--vi-color-blue-200, #cee6ff)))}:host([disabled]){cursor:not-allowed;opacity:.4}::slotted([slot=icon]){flex-shrink:0;width:var(--vi-content-switcher-icon-size, 1.25em);height:var(--vi-content-switcher-icon-size, 1.25em);fill:currentColor;display:inline-flex;align-items:center;justify-content:center}.item-label{display:contents}@media(prefers-reduced-motion:reduce){:host{transition:none}}";

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
var _dec, _initClass, _ViElement, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, /**
   * The currently active item value.
   * @attr value
   */ _init_value, /**
   * Visual size of the switcher.
   * @attr size
   */ _init_size, /**
   * If true, stretches the switcher to 100% of its parent's width.
   * @attr block
   */ _init_block, /**
   * The name of the input for form submission.
   * @attr name
   */ _init_name, /**
   * Disables all item interactions.
   * @attr
   */ _init_disabled, /** Tracks known items from the slotted children */ _init__items, _initProto, _dec7, _initClass1, _ViElement1, _dec8, _dec9, _dec10, /**
   * The value this item represents. Must match the `value` on the parent switcher.
   * @attr value
   */ _init_value1, /**
   * Whether this item is currently active. Managed by `vi-content-switcher`.
   * @attr
   */ _init_active, /**
   * Disables this individual item.
   * @attr
   */ _init_disabled1, _initProto1;
let _ViContentSwitcher;
_dec = t('vi-content-switcher'), _dec1 = n({
    type: String,
    reflect: true
}), _dec2 = n({
    type: String,
    reflect: true
}), _dec3 = n({
    type: Boolean,
    reflect: true
}), _dec4 = n({
    type: String,
    reflect: true
}), _dec5 = n({
    type: Boolean,
    reflect: true
}), _dec6 = r();
new class extends _identity {
    constructor(){
        super(_ViContentSwitcher), _initClass();
    }
    static{
        class ViContentSwitcher extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_value, _init_size, _init_block, _init_name, _init_disabled, _init__items, _initProto], c: [_ViContentSwitcher, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "value"
                    ],
                    [
                        _dec2,
                        1,
                        "size"
                    ],
                    [
                        _dec3,
                        1,
                        "block"
                    ],
                    [
                        _dec4,
                        1,
                        "name"
                    ],
                    [
                        _dec5,
                        1,
                        "disabled"
                    ],
                    [
                        _dec6,
                        1,
                        "_items"
                    ]
                ], [
                    _dec
                ], _ViElement));
            }
            static formAssociated = true;
            static styles = i`
    ${r$1(switcherStyles)}
  `;
            _internals;
            constructor(){
                super();
                this._internals = this.attachInternals();
            }
            #___private_value_1 = (_initProto(this), _init_value(this, ''));
            get value() {
                return this.#___private_value_1;
            }
            set value(_v) {
                this.#___private_value_1 = _v;
            }
            #___private_size_2 = _init_size(this, 'md');
            get size() {
                return this.#___private_size_2;
            }
            set size(_v) {
                this.#___private_size_2 = _v;
            }
            #___private_block_3 = _init_block(this, false);
            get block() {
                return this.#___private_block_3;
            }
            set block(_v) {
                this.#___private_block_3 = _v;
            }
            #___private_name_4 = _init_name(this, '');
            get name() {
                return this.#___private_name_4;
            }
            set name(_v) {
                this.#___private_name_4 = _v;
            }
            #___private_disabled_5 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_5;
            }
            set disabled(_v) {
                this.#___private_disabled_5 = _v;
            }
            #___private__items_6 = _init__items(this, []);
            get _items() {
                return this.#___private__items_6;
            }
            set _items(_v) {
                this.#___private__items_6 = _v;
            }
            // ── Lifecycle ──────────────────────────────────────────────────────────────
            _defaultValue = '';
            _resizeObserver;
            connectedCallback() {
                super.connectedCallback();
                this.setAttribute('role', 'radiogroup');
                this.addEventListener('keydown', this._onKeyDown);
                if (!this.hasAttribute('tabindex')) ;
                // Capture initial value for form resets
                this._defaultValue = this.getAttribute('value') || '';
                this._resizeObserver = new ResizeObserver(()=>{
                    this._updateIndicator();
                });
                this._resizeObserver.observe(this);
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this.removeEventListener('keydown', this._onKeyDown);
                if (this._resizeObserver) {
                    this._resizeObserver.disconnect();
                    this._resizeObserver = undefined;
                }
            }
            updated(changedProperties) {
                super.updated(changedProperties);
                if (changedProperties.has('value')) {
                    this._internals.setFormValue(this.value);
                }
                // Ensure active state and tabindex are updated on programmatic changes
                if (changedProperties.has('value') || changedProperties.has('disabled')) {
                    this._syncItems();
                }
            }
            // ── Form integration ───────────────────────────────────────────────────────
            formResetCallback() {
                this.value = this._defaultValue;
                this._syncItems();
            }
            formDisabledCallback(disabled) {
                this.disabled = disabled;
            }
            // ── Event handling ─────────────────────────────────────────────────────────
            _onSlotChange() {
                const slot = this.shadowRoot?.querySelector('slot');
                if (!slot) return;
                this._items = slot.assignedElements({
                    flatten: true
                }).filter((el)=>el instanceof _ViSwitcherItem);
                this._syncItems();
            }
            _onItemClick(e) {
                const item = e.composedPath().find((el)=>el instanceof _ViSwitcherItem);
                this._selectItem(item);
            }
            _selectItem(item) {
                if (!item || item.disabled || this.disabled) return;
                const previousValue = this.value;
                if (item.value === previousValue) return;
                const beforeEvent = new CustomEvent('vi-content-switcher-before-change', {
                    detail: {
                        value: item.value,
                        previousValue
                    },
                    bubbles: true,
                    composed: true,
                    cancelable: true
                });
                this.dispatchEvent(beforeEvent);
                if (beforeEvent.defaultPrevented) return;
                this.value = item.value;
                this._syncItems();
                this.dispatchEvent(new CustomEvent('vi-content-switcher-change', {
                    detail: {
                        value: this.value,
                        previousValue
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            _onKeyDown = (e)=>{
                if (this.disabled) return;
                const items = this._items.filter((i)=>!i.disabled);
                if (!items.length) return;
                const activeItem = this._items.find((i)=>i.value === this.value);
                const currentIndex = this._items.indexOf(activeItem || e.target);
                if (currentIndex === -1) return;
                let nextIndex = currentIndex;
                const isRtl = this.matches(':dir(rtl)');
                const arrowLeft = isRtl ? 'ArrowRight' : 'ArrowLeft';
                const arrowRight = isRtl ? 'ArrowLeft' : 'ArrowRight';
                if (e.key === arrowRight || e.key === 'ArrowDown') {
                    nextIndex = this._findNextEnabledItemIndex(currentIndex, 1);
                } else if (e.key === arrowLeft || e.key === 'ArrowUp') {
                    nextIndex = this._findNextEnabledItemIndex(currentIndex, -1);
                } else if (e.key === 'Home') {
                    nextIndex = this._findNextEnabledItemIndex(-1, 1);
                } else if (e.key === 'End') {
                    nextIndex = this._findNextEnabledItemIndex(this._items.length, -1);
                } else {
                    return;
                }
                e.preventDefault();
                if (nextIndex !== -1 && nextIndex !== currentIndex) {
                    const nextItem = this._items[nextIndex];
                    this._selectItem(nextItem);
                    nextItem.focus();
                }
            };
            _findNextEnabledItemIndex(startIndex, direction) {
                let index = startIndex + direction;
                while(index >= 0 && index < this._items.length){
                    if (!this._items[index].disabled) return index;
                    index += direction;
                }
                // wrap around
                if (direction === 1) {
                    for(let i = 0; i < startIndex; i++){
                        if (!this._items[i].disabled) return i;
                    }
                } else {
                    for(let i = this._items.length - 1; i > startIndex; i--){
                        if (!this._items[i].disabled) return i;
                    }
                }
                return startIndex;
            }
            _syncItems() {
                let hasActive = false;
                for (const item of this._items){
                    item.active = item.value === this.value;
                    if (item.active) hasActive = true;
                    // preserve item-level disabled (no-op removed)
                    // Use internal method to set tabindex so it isn't completely controlled by the item itself
                    item.tabIndex = item.disabled || this.disabled ? -1 : item.active ? 0 : -1;
                }
                // If no item is active, make the first non-disabled item focusable
                if (!hasActive && !this.disabled) {
                    const firstEnabled = this._items.find((i)=>!i.disabled);
                    if (firstEnabled) firstEnabled.tabIndex = 0;
                }
                this._updateIndicator();
            }
            _updateIndicator() {
                const activeItem = this._items.find((it)=>it.value === this.value);
                if (!activeItem) {
                    this.style.removeProperty('--_indicator-width');
                    this.style.removeProperty('--_indicator-left');
                    return;
                }
                // Await layout calculation if just rendered, then update the pill bounds.
                requestAnimationFrame(()=>{
                    const track = this.shadowRoot?.querySelector('.track');
                    if (!track) return;
                    const trackRect = track.getBoundingClientRect();
                    const itemRect = activeItem.getBoundingClientRect();
                    // Compute left relative to the .track container
                    const left = itemRect.left - trackRect.left;
                    const width = itemRect.width;
                    this.style.setProperty('--_indicator-width', `${width}px`);
                    this.style.setProperty('--_indicator-left', `${left}px`);
                });
            }
            // ── Render ─────────────────────────────────────────────────────────────────
            render() {
                return b`
      <div part="track" class="track" @click=${this._onItemClick}>
        <div part="indicator" class="indicator" aria-hidden="true"></div>
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
            }
        }
    }
}();
let _ViSwitcherItem;
_dec7 = t('vi-switcher-item'), _dec8 = n({
    type: String,
    reflect: true
}), _dec9 = n({
    type: Boolean,
    reflect: true
}), _dec10 = n({
    type: Boolean,
    reflect: true
});
new class extends _identity {
    constructor(){
        super(_ViSwitcherItem), _initClass1();
    }
    static{
        class ViSwitcherItem extends (_ViElement1 = ViElement) {
            static{
                ({ e: [_init_value1, _init_active, _init_disabled1, _initProto1], c: [_ViSwitcherItem, _initClass1] } = _apply_decs_2203_r(this, [
                    [
                        _dec8,
                        1,
                        "value"
                    ],
                    [
                        _dec9,
                        1,
                        "active"
                    ],
                    [
                        _dec10,
                        1,
                        "disabled"
                    ]
                ], [
                    _dec7
                ], _ViElement1));
            }
            static styles = i`
    ${r$1(itemStyles)}
  `;
            #___private_value_1 = (_initProto1(this), _init_value1(this, ''));
            get value() {
                return this.#___private_value_1;
            }
            set value(_v) {
                this.#___private_value_1 = _v;
            }
            #___private_active_2 = _init_active(this, false);
            get active() {
                return this.#___private_active_2;
            }
            set active(_v) {
                this.#___private_active_2 = _v;
            }
            #___private_disabled_3 = _init_disabled1(this, false);
            get disabled() {
                return this.#___private_disabled_3;
            }
            set disabled(_v) {
                this.#___private_disabled_3 = _v;
            }
            connectedCallback() {
                super.connectedCallback();
                this.setAttribute('role', 'radio');
            }
            updated() {
                this.setAttribute('aria-checked', String(this.active));
                this.setAttribute('aria-disabled', String(this.disabled));
            // Focus management is handled by the parent switcher for correct radiogroup behavior
            }
            render() {
                return b`
      <slot name="icon"></slot>
      <span class="item-label">
        <slot></slot>
      </span>
    `;
            }
        }
    }
}();

const meta = {
    title: 'Components/Content Switcher',
    component: 'vi-content-switcher',
    argTypes: {
        value: {
            control: 'text',
            description: 'The currently active item value'
        },
        size: {
            control: 'select',
            options: [
                'sm',
                'md',
                'lg'
            ],
            description: 'Visual size of the switcher'
        },
        disabled: {
            control: 'boolean',
            description: 'Disables all interactions'
        }
    },
    parameters: {
        actions: {
            handles: [
                'vi-content-switcher-change'
            ]
        }
    }
};
const Default = {
    args: {
        value: 'design',
        size: 'md',
        disabled: false
    },
    render: (args)=>b`
    <vi-content-switcher
      value=${o(args.value)}
      size=${o(args.size)}
      ?disabled=${args.disabled}
    >
      <vi-switcher-item value="design">Design</vi-switcher-item>
      <vi-switcher-item value="json">JSON</vi-switcher-item>
      <vi-switcher-item value="preview">Preview</vi-switcher-item>
    </vi-content-switcher>
  `
};
const Sizes = {
    render: ()=>b`
    <style>
      .layout-gap {
        display: flex;
        flex-direction: column;
        gap: 24px;
        align-items: flex-start;
      }
    </style>
    <div class="layout-gap">
      <vi-content-switcher value="code" size="sm">
        <vi-switcher-item value="code">Code</vi-switcher-item>
        <vi-switcher-item value="issues">Issues</vi-switcher-item>
        <vi-switcher-item value="pulls">Pull Requests</vi-switcher-item>
      </vi-content-switcher>

      <vi-content-switcher value="code" size="md">
        <vi-switcher-item value="code">Code</vi-switcher-item>
        <vi-switcher-item value="issues">Issues</vi-switcher-item>
        <vi-switcher-item value="pulls">Pull Requests</vi-switcher-item>
      </vi-content-switcher>

      <vi-content-switcher value="code" size="lg">
        <vi-switcher-item value="code">Code</vi-switcher-item>
        <vi-switcher-item value="issues">Issues</vi-switcher-item>
        <vi-switcher-item value="pulls">Pull Requests</vi-switcher-item>
      </vi-content-switcher>
    </div>
  `
};
const Disabled = {
    render: ()=>b`
    <style>
      .layout-gap {
        display: flex;
        flex-direction: column;
        gap: 24px;
        align-items: flex-start;
      }
    </style>
    <div class="layout-gap">
      <div>
        <p
          style="margin-top: 0; margin-bottom: 8px; font-family: sans-serif; font-size: 14px; color: #666;"
        >
          Fully disabled:
        </p>
        <vi-content-switcher value="monthly" disabled>
          <vi-switcher-item value="monthly">Monthly</vi-switcher-item>
          <vi-switcher-item value="annually">Annually</vi-switcher-item>
        </vi-content-switcher>
      </div>

      <div>
        <p
          style="margin-top: 0; margin-bottom: 8px; font-family: sans-serif; font-size: 14px; color: #666;"
        >
          Individual item disabled:
        </p>
        <vi-content-switcher value="monthly">
          <vi-switcher-item value="monthly">Monthly</vi-switcher-item>
          <vi-switcher-item value="annually" disabled
            >Annually (Unavailable)</vi-switcher-item
          >
        </vi-content-switcher>
      </div>
    </div>
  `
};
const PreventSwitching = {
    render: ()=>b`
    <div
      style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; align-items: flex-start;"
    >
      <p style="margin: 0; font-size: 14px; color: #666; max-width: 400px;">
        This switcher intercepts the
        <code>vi-content-switcher-before-change</code> event and prevents
        switching to the <b>Pro</b> plan using
        <code>event.preventDefault()</code>. Try clicking it!
      </p>
      <vi-content-switcher
        value="basic"
        @vi-content-switcher-before-change=${(e)=>{
            if (e.detail.value === 'pro') {
                e.preventDefault();
                alert('Switching to Pro plan is not allowed in this demo!');
            }
        }}
      >
        <vi-switcher-item value="basic">Basic</vi-switcher-item>
        <vi-switcher-item value="pro">Pro</vi-switcher-item>
        <vi-switcher-item value="enterprise">Enterprise</vi-switcher-item>
      </vi-content-switcher>
    </div>
  `
};
const BlockLayout = {
    render: ()=>b`
    <div
      style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px;"
    >
      <p style="margin: 0; font-size: 14px; color: #666;">
        With the <code>block</code> attribute, the switcher stretches to 100% of
        its container's width, distributing the items evenly.
      </p>
      <div
        style="width: 500px; max-width: 100%; border: 1px dashed #ccc; padding: 16px; border-radius: 8px;"
      >
        <vi-content-switcher value="apple" block>
          <vi-switcher-item value="apple">Apple</vi-switcher-item>
          <vi-switcher-item value="orange">Orange</vi-switcher-item>
          <vi-switcher-item value="banana">Banana</vi-switcher-item>
        </vi-content-switcher>
      </div>
    </div>
  `
};
const FormIntegration = {
    render: ()=>b`
    <div
      style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; align-items: flex-start;"
    >
      <p style="margin: 0; font-size: 14px; color: #666; max-width: 400px;">
        The switcher uses <code>ElementInternals</code> to seamlessly integrate
        with native HTML forms. It supports serialization via
        <code>FormData</code> and proper form resets.
      </p>
      <form
        style="padding: 16px; border: 1px solid #eee; border-radius: 8px; display: flex; flex-direction: column; gap: 16px; background: #f9fafb;"
        @submit=${(e)=>{
            e.preventDefault();
            const fd = new FormData(e.target);
            alert('Form Submitted!\\n\\nSelected Fruit: ' + fd.get('fruit'));
        }}
      >
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="font-size: 14px; font-weight: 500;"
            >Select your favorite fruit:</label
          >
          <vi-content-switcher name="fruit" value="apple">
            <vi-switcher-item value="apple">Apple</vi-switcher-item>
            <vi-switcher-item value="orange">Orange</vi-switcher-item>
            <vi-switcher-item value="banana">Banana</vi-switcher-item>
          </vi-content-switcher>
        </div>

        <div style="display: flex; gap: 8px;">
          <button
            type="submit"
            style="padding: 6px 12px; cursor: pointer; border: none; background: #0f62fe; color: white; border-radius: 4px;"
          >
            Submit
          </button>
          <button
            type="reset"
            style="padding: 6px 12px; cursor: pointer; border: 1px solid #ccc; background: white; border-radius: 4px;"
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  `
};
const FormSections = {
    render: ()=>{
        // A quick local state manager for the story since we aren't using a framework
        let activeSection = 'personal';
        return b`
      <div
        style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; align-items: flex-start;"
      >
        <p style="margin: 0; font-size: 14px; color: #666; max-width: 500px;">
          This form uses a switcher <i>without</i> a
          <code>name</code> attribute. It acts purely as a UI controller to
          toggle between form sections (Personal vs Billing) and does not
          pollute the form's submitted data.
        </p>

        <form
          id="multi-step-form"
          style="padding: 24px; border: 1px solid #eee; border-radius: 8px; display: flex; flex-direction: column; gap: 24px; background: #fff; width: 400px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"
          @submit=${(e)=>{
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            alert('Form Submitted!\\n\\nData: ' + JSON.stringify(data, null, 2));
        }}
        >
          <vi-content-switcher
            value="${activeSection}"
            block
            @vi-content-switcher-change=${(e)=>{
            activeSection = e.detail.value;
            const form = document.getElementById('multi-step-form');
            form?.querySelectorAll('.form-section').forEach((el)=>{
                el.style.display = el.id === 'section-' + activeSection ? 'flex' : 'none';
            });
        }}
          >
            <vi-switcher-item value="personal">Personal Info</vi-switcher-item>
            <vi-switcher-item value="billing">Billing Details</vi-switcher-item>
          </vi-content-switcher>

          <!-- Personal Info Section -->
          <div
            id="section-personal"
            class="form-section"
            style="display: flex; flex-direction: column; gap: 12px;"
          >
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 14px;">Full Name</label>
              <input
                name="fullName"
                type="text"
                style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                required
              />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 14px;">Email</label>
              <input
                name="email"
                type="email"
                style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                required
              />
            </div>
          </div>

          <!-- Billing Section -->
          <div
            id="section-billing"
            class="form-section"
            style="display: none; flex-direction: column; gap: 12px;"
          >
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 14px;">Credit Card Number</label>
              <input
                name="card"
                type="text"
                placeholder="**** **** **** ****"
                style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
              />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button
              type="submit"
              style="padding: 8px 16px; cursor: pointer; border: none; background: #0f62fe; color: white; border-radius: 4px; font-weight: bold;"
            >
              Complete Checkout
            </button>
          </div>
        </form>
      </div>
    `;
    }
};
const WithIcons = {
    render: ()=>b`
    <div
      style="display: flex; flex-direction: column; gap: 24px; font-family: sans-serif;"
    >
      <div>
        <p style="margin: 0 0 8px; font-size: 14px; color: #666;">
          Icon and Text:
        </p>
        <vi-content-switcher value="grid">
          <vi-switcher-item value="list">
            <svg slot="icon" viewBox="0 0 24 24">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
            List View
          </vi-switcher-item>
          <vi-switcher-item value="grid">
            <svg slot="icon" viewBox="0 0 24 24">
              <path d="M4 4h6v6H4zm8 0h6v6h-6zm-8 8h6v6H4zm8 0h6v6h-6z" />
            </svg>
            Grid View
          </vi-switcher-item>
        </vi-content-switcher>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-size: 14px; color: #666;">Icon Only:</p>
        <vi-content-switcher value="light">
          <vi-switcher-item value="light" aria-label="Light mode">
            <svg slot="icon" viewBox="0 0 24 24">
              <path
                d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <circle
                cx="12"
                cy="12"
                r="4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </vi-switcher-item>
          <vi-switcher-item value="dark" aria-label="Dark mode">
            <svg slot="icon" viewBox="0 0 24 24">
              <path
                d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </vi-switcher-item>
          <vi-switcher-item value="system" aria-label="System mode">
            <svg slot="icon" viewBox="0 0 24 24">
              <rect
                x="2"
                y="3"
                width="20"
                height="14"
                rx="2"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M8 21h8m-4-4v4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </vi-switcher-item>
        </vi-content-switcher>
      </div>
    </div>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    value: 'design',\n    size: 'md',\n    disabled: false\n  },\n  render: args => html`\n    <vi-content-switcher\n      value=${ifDefined(args.value)}\n      size=${ifDefined(args.size)}\n      ?disabled=${args.disabled}\n    >\n      <vi-switcher-item value=\"design\">Design</vi-switcher-item>\n      <vi-switcher-item value=\"json\">JSON</vi-switcher-item>\n      <vi-switcher-item value=\"preview\">Preview</vi-switcher-item>\n    </vi-content-switcher>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
Sizes.parameters = {
    ...Sizes.parameters,
    docs: {
        ...Sizes.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <style>\n      .layout-gap {\n        display: flex;\n        flex-direction: column;\n        gap: 24px;\n        align-items: flex-start;\n      }\n    </style>\n    <div class=\"layout-gap\">\n      <vi-content-switcher value=\"code\" size=\"sm\">\n        <vi-switcher-item value=\"code\">Code</vi-switcher-item>\n        <vi-switcher-item value=\"issues\">Issues</vi-switcher-item>\n        <vi-switcher-item value=\"pulls\">Pull Requests</vi-switcher-item>\n      </vi-content-switcher>\n\n      <vi-content-switcher value=\"code\" size=\"md\">\n        <vi-switcher-item value=\"code\">Code</vi-switcher-item>\n        <vi-switcher-item value=\"issues\">Issues</vi-switcher-item>\n        <vi-switcher-item value=\"pulls\">Pull Requests</vi-switcher-item>\n      </vi-content-switcher>\n\n      <vi-content-switcher value=\"code\" size=\"lg\">\n        <vi-switcher-item value=\"code\">Code</vi-switcher-item>\n        <vi-switcher-item value=\"issues\">Issues</vi-switcher-item>\n        <vi-switcher-item value=\"pulls\">Pull Requests</vi-switcher-item>\n      </vi-content-switcher>\n    </div>\n  `\n}",
            ...Sizes.parameters?.docs?.source
        }
    }
};
Disabled.parameters = {
    ...Disabled.parameters,
    docs: {
        ...Disabled.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <style>\n      .layout-gap {\n        display: flex;\n        flex-direction: column;\n        gap: 24px;\n        align-items: flex-start;\n      }\n    </style>\n    <div class=\"layout-gap\">\n      <div>\n        <p\n          style=\"margin-top: 0; margin-bottom: 8px; font-family: sans-serif; font-size: 14px; color: #666;\"\n        >\n          Fully disabled:\n        </p>\n        <vi-content-switcher value=\"monthly\" disabled>\n          <vi-switcher-item value=\"monthly\">Monthly</vi-switcher-item>\n          <vi-switcher-item value=\"annually\">Annually</vi-switcher-item>\n        </vi-content-switcher>\n      </div>\n\n      <div>\n        <p\n          style=\"margin-top: 0; margin-bottom: 8px; font-family: sans-serif; font-size: 14px; color: #666;\"\n        >\n          Individual item disabled:\n        </p>\n        <vi-content-switcher value=\"monthly\">\n          <vi-switcher-item value=\"monthly\">Monthly</vi-switcher-item>\n          <vi-switcher-item value=\"annually\" disabled\n            >Annually (Unavailable)</vi-switcher-item\n          >\n        </vi-content-switcher>\n      </div>\n    </div>\n  `\n}",
            ...Disabled.parameters?.docs?.source
        }
    }
};
PreventSwitching.parameters = {
    ...PreventSwitching.parameters,
    docs: {
        ...PreventSwitching.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div\n      style=\"font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; align-items: flex-start;\"\n    >\n      <p style=\"margin: 0; font-size: 14px; color: #666; max-width: 400px;\">\n        This switcher intercepts the\n        <code>vi-content-switcher-before-change</code> event and prevents\n        switching to the <b>Pro</b> plan using\n        <code>event.preventDefault()</code>. Try clicking it!\n      </p>\n      <vi-content-switcher\n        value=\"basic\"\n        @vi-content-switcher-before-change=${(e: CustomEvent) => {\n    if (e.detail.value === 'pro') {\n      e.preventDefault();\n      alert('Switching to Pro plan is not allowed in this demo!');\n    }\n  }}\n      >\n        <vi-switcher-item value=\"basic\">Basic</vi-switcher-item>\n        <vi-switcher-item value=\"pro\">Pro</vi-switcher-item>\n        <vi-switcher-item value=\"enterprise\">Enterprise</vi-switcher-item>\n      </vi-content-switcher>\n    </div>\n  `\n}",
            ...PreventSwitching.parameters?.docs?.source
        }
    }
};
BlockLayout.parameters = {
    ...BlockLayout.parameters,
    docs: {
        ...BlockLayout.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div\n      style=\"font-family: sans-serif; display: flex; flex-direction: column; gap: 16px;\"\n    >\n      <p style=\"margin: 0; font-size: 14px; color: #666;\">\n        With the <code>block</code> attribute, the switcher stretches to 100% of\n        its container's width, distributing the items evenly.\n      </p>\n      <div\n        style=\"width: 500px; max-width: 100%; border: 1px dashed #ccc; padding: 16px; border-radius: 8px;\"\n      >\n        <vi-content-switcher value=\"apple\" block>\n          <vi-switcher-item value=\"apple\">Apple</vi-switcher-item>\n          <vi-switcher-item value=\"orange\">Orange</vi-switcher-item>\n          <vi-switcher-item value=\"banana\">Banana</vi-switcher-item>\n        </vi-content-switcher>\n      </div>\n    </div>\n  `\n}",
            ...BlockLayout.parameters?.docs?.source
        }
    }
};
FormIntegration.parameters = {
    ...FormIntegration.parameters,
    docs: {
        ...FormIntegration.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div\n      style=\"font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; align-items: flex-start;\"\n    >\n      <p style=\"margin: 0; font-size: 14px; color: #666; max-width: 400px;\">\n        The switcher uses <code>ElementInternals</code> to seamlessly integrate\n        with native HTML forms. It supports serialization via\n        <code>FormData</code> and proper form resets.\n      </p>\n      <form\n        style=\"padding: 16px; border: 1px solid #eee; border-radius: 8px; display: flex; flex-direction: column; gap: 16px; background: #f9fafb;\"\n        @submit=${(e: Event) => {\n    e.preventDefault();\n    const fd = new FormData(e.target as HTMLFormElement);\n    alert('Form Submitted!\\\\n\\\\nSelected Fruit: ' + fd.get('fruit'));\n  }}\n      >\n        <div style=\"display: flex; flex-direction: column; gap: 8px;\">\n          <label style=\"font-size: 14px; font-weight: 500;\"\n            >Select your favorite fruit:</label\n          >\n          <vi-content-switcher name=\"fruit\" value=\"apple\">\n            <vi-switcher-item value=\"apple\">Apple</vi-switcher-item>\n            <vi-switcher-item value=\"orange\">Orange</vi-switcher-item>\n            <vi-switcher-item value=\"banana\">Banana</vi-switcher-item>\n          </vi-content-switcher>\n        </div>\n\n        <div style=\"display: flex; gap: 8px;\">\n          <button\n            type=\"submit\"\n            style=\"padding: 6px 12px; cursor: pointer; border: none; background: #0f62fe; color: white; border-radius: 4px;\"\n          >\n            Submit\n          </button>\n          <button\n            type=\"reset\"\n            style=\"padding: 6px 12px; cursor: pointer; border: 1px solid #ccc; background: white; border-radius: 4px;\"\n          >\n            Reset Form\n          </button>\n        </div>\n      </form>\n    </div>\n  `\n}",
            ...FormIntegration.parameters?.docs?.source
        }
    }
};
FormSections.parameters = {
    ...FormSections.parameters,
    docs: {
        ...FormSections.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => {\n    // A quick local state manager for the story since we aren't using a framework\n    let activeSection = 'personal';\n    return html`\n      <div\n        style=\"font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; align-items: flex-start;\"\n      >\n        <p style=\"margin: 0; font-size: 14px; color: #666; max-width: 500px;\">\n          This form uses a switcher <i>without</i> a\n          <code>name</code> attribute. It acts purely as a UI controller to\n          toggle between form sections (Personal vs Billing) and does not\n          pollute the form's submitted data.\n        </p>\n\n        <form\n          id=\"multi-step-form\"\n          style=\"padding: 24px; border: 1px solid #eee; border-radius: 8px; display: flex; flex-direction: column; gap: 24px; background: #fff; width: 400px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);\"\n          @submit=${(e: Event) => {\n      e.preventDefault();\n      const fd = new FormData(e.target as HTMLFormElement);\n      const data = Object.fromEntries(fd.entries());\n      alert('Form Submitted!\\\\n\\\\nData: ' + JSON.stringify(data, null, 2));\n    }}\n        >\n          <vi-content-switcher\n            value=\"${activeSection}\"\n            block\n            @vi-content-switcher-change=${(e: CustomEvent) => {\n      activeSection = e.detail.value;\n      const form = document.getElementById('multi-step-form');\n      form?.querySelectorAll('.form-section').forEach(el => {\n        (el as HTMLElement).style.display = el.id === 'section-' + activeSection ? 'flex' : 'none';\n      });\n    }}\n          >\n            <vi-switcher-item value=\"personal\">Personal Info</vi-switcher-item>\n            <vi-switcher-item value=\"billing\">Billing Details</vi-switcher-item>\n          </vi-content-switcher>\n\n          <!-- Personal Info Section -->\n          <div\n            id=\"section-personal\"\n            class=\"form-section\"\n            style=\"display: flex; flex-direction: column; gap: 12px;\"\n          >\n            <div style=\"display: flex; flex-direction: column; gap: 4px;\">\n              <label style=\"font-size: 14px;\">Full Name</label>\n              <input\n                name=\"fullName\"\n                type=\"text\"\n                style=\"padding: 8px; border: 1px solid #ccc; border-radius: 4px;\"\n                required\n              />\n            </div>\n            <div style=\"display: flex; flex-direction: column; gap: 4px;\">\n              <label style=\"font-size: 14px;\">Email</label>\n              <input\n                name=\"email\"\n                type=\"email\"\n                style=\"padding: 8px; border: 1px solid #ccc; border-radius: 4px;\"\n                required\n              />\n            </div>\n          </div>\n\n          <!-- Billing Section -->\n          <div\n            id=\"section-billing\"\n            class=\"form-section\"\n            style=\"display: none; flex-direction: column; gap: 12px;\"\n          >\n            <div style=\"display: flex; flex-direction: column; gap: 4px;\">\n              <label style=\"font-size: 14px;\">Credit Card Number</label>\n              <input\n                name=\"card\"\n                type=\"text\"\n                placeholder=\"**** **** **** ****\"\n                style=\"padding: 8px; border: 1px solid #ccc; border-radius: 4px;\"\n              />\n            </div>\n          </div>\n\n          <div style=\"display: flex; justify-content: flex-end;\">\n            <button\n              type=\"submit\"\n              style=\"padding: 8px 16px; cursor: pointer; border: none; background: #0f62fe; color: white; border-radius: 4px; font-weight: bold;\"\n            >\n              Complete Checkout\n            </button>\n          </div>\n        </form>\n      </div>\n    `;\n  }\n}",
            ...FormSections.parameters?.docs?.source
        }
    }
};
WithIcons.parameters = {
    ...WithIcons.parameters,
    docs: {
        ...WithIcons.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div\n      style=\"display: flex; flex-direction: column; gap: 24px; font-family: sans-serif;\"\n    >\n      <div>\n        <p style=\"margin: 0 0 8px; font-size: 14px; color: #666;\">\n          Icon and Text:\n        </p>\n        <vi-content-switcher value=\"grid\">\n          <vi-switcher-item value=\"list\">\n            <svg slot=\"icon\" viewBox=\"0 0 24 24\">\n              <path d=\"M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z\" />\n            </svg>\n            List View\n          </vi-switcher-item>\n          <vi-switcher-item value=\"grid\">\n            <svg slot=\"icon\" viewBox=\"0 0 24 24\">\n              <path d=\"M4 4h6v6H4zm8 0h6v6h-6zm-8 8h6v6H4zm8 0h6v6h-6z\" />\n            </svg>\n            Grid View\n          </vi-switcher-item>\n        </vi-content-switcher>\n      </div>\n      <div>\n        <p style=\"margin: 0 0 8px; font-size: 14px; color: #666;\">Icon Only:</p>\n        <vi-content-switcher value=\"light\">\n          <vi-switcher-item value=\"light\" aria-label=\"Light mode\">\n            <svg slot=\"icon\" viewBox=\"0 0 24 24\">\n              <path\n                d=\"M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41\"\n                fill=\"none\"\n                stroke=\"currentColor\"\n                stroke-width=\"2\"\n                stroke-linecap=\"round\"\n              />\n              <circle\n                cx=\"12\"\n                cy=\"12\"\n                r=\"4\"\n                fill=\"none\"\n                stroke=\"currentColor\"\n                stroke-width=\"2\"\n              />\n            </svg>\n          </vi-switcher-item>\n          <vi-switcher-item value=\"dark\" aria-label=\"Dark mode\">\n            <svg slot=\"icon\" viewBox=\"0 0 24 24\">\n              <path\n                d=\"M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z\"\n                fill=\"none\"\n                stroke=\"currentColor\"\n                stroke-width=\"2\"\n              />\n            </svg>\n          </vi-switcher-item>\n          <vi-switcher-item value=\"system\" aria-label=\"System mode\">\n            <svg slot=\"icon\" viewBox=\"0 0 24 24\">\n              <rect\n                x=\"2\"\n                y=\"3\"\n                width=\"20\"\n                height=\"14\"\n                rx=\"2\"\n                fill=\"none\"\n                stroke=\"currentColor\"\n                stroke-width=\"2\"\n              />\n              <path\n                d=\"M8 21h8m-4-4v4\"\n                stroke=\"currentColor\"\n                stroke-width=\"2\"\n                stroke-linecap=\"round\"\n              />\n            </svg>\n          </vi-switcher-item>\n        </vi-content-switcher>\n      </div>\n    </div>\n  `\n}",
            ...WithIcons.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","Sizes","Disabled","PreventSwitching","BlockLayout","FormIntegration","FormSections","WithIcons"];

export { BlockLayout, Default, Disabled, FormIntegration, FormSections, PreventSwitching, Sizes, WithIcons, __namedExportsOrder, meta as default };
