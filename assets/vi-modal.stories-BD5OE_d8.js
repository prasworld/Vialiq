import { b, r as r$1, i, A, c as i$1, D } from './iframe-9yd_z6c6.js';
import { o } from './if-defined-CYaYkB02.js';
import { n, t, V as ViElement } from './vi-element-D7bP2wsn.js';
import { r } from './state-FW5tp7Om.js';
import { O as OverlayManager, e as e$2 } from './overlay-manager-B43cq-OI.js';
import { e as e$1 } from './class-map-BnH_mZac.js';
import { F as FocusTrapMixin } from './focus-trap-mixin-Bhw7FczQ.js';
import './vi-icon-C_atHq7t.js';
import './vi-button-D54BGZG7.js';
import { E as EXIT_COUNTERPART, P as PRESET_KEYFRAMES } from './animation-constants-LE17KXe0.js';
import { a as arrowsMaximizeIcon, b as arrowsMinimizeIcon } from './arrows-minimize-9BX4BzeO.js';
import { c as checkCircleIcon } from './check-circle-BQwul-8G.js';
import { t as triangleWarningIcon, i as infoIcon } from './triangle-warning-CA6nkDfn.js';
import { x as xIcon } from './x-3JmBhc9n.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import './vi-input-znutdRU4.js';
import './preload-helper-D5QYaGzd.js';
import './base-Cl6v8-BZ.js';
import './directive-BKuZRRPO.js';
import './focusable-mixin-CmxOyPX5.js';
import './validity-mixin-BGbFxpv9.js';
import './if-non-empty-BGlyk1yZ.js';

function applyDecs2203RFactory$4() {
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
function _apply_decs_2203_r$4(targetClass, memberDecs, classDecs, parentClass) {
    return (_apply_decs_2203_r$4 = applyDecs2203RFactory$4())(targetClass, memberDecs, classDecs, parentClass);
}
/**
 * DraggableMixin
 * 
 * Provides native drag-and-drop capabilities using Pointer Events to any LitElement.
 * It applies performant `transform: translate3d(x, y, 0)` positioning to `_dragTarget`.
 * 
 * Subclasses MUST implement:
 * - `_dragTarget`: The HTML element that moves (usually the outer container or dialog).
 * - `_dragHandle`: The HTML element that accepts pointer events to initiate the drag (usually a header).
 */ function DraggableMixin(Base) {
    var _dec, _dec1, /**
     * Determines whether dragging is currently enabled.
     */ _init_draggable, /**
     * Constrains the drag movement to prevent the element from leaving a boundary.
     * - `'none'` (default): No clamping — element can be dragged anywhere.
     * - `'viewport'`: Clamps so the dragged element stays fully within the viewport.
     * - `'parent'`: Clamps within the bounding rect of the element's offset parent.
     */ _init_dragContainment, _initProto;
    _dec = n({
        type: Boolean,
        reflect: true
    }), _dec1 = n({
        type: String,
        attribute: 'drag-containment'
    });
    class DraggableMixinClass extends Base {
        static{
            ({ e: [_init_draggable, _init_dragContainment, _initProto] } = _apply_decs_2203_r$4(this, [
                [
                    _dec,
                    1,
                    "draggable"
                ],
                [
                    _dec1,
                    1,
                    "dragContainment"
                ]
            ], []));
        }
        #___private_draggable_1 = (_initProto(this), _init_draggable(this, false));
        get draggable() {
            return this.#___private_draggable_1;
        }
        set draggable(_v) {
            this.#___private_draggable_1 = _v;
        }
        #___private_dragContainment_2 = _init_dragContainment(this, 'none');
        get dragContainment() {
            return this.#___private_dragContainment_2;
        }
        set dragContainment(_v) {
            this.#___private_dragContainment_2 = _v;
        }
        _isDragging = false;
        _previousUserSelect = null;
        _previousTransition = null;
        _dragStartX = 0;
        _dragStartY = 0;
        _initialTranslateX = 0;
        _initialTranslateY = 0;
        _currentTranslateX = 0;
        _currentTranslateY = 0;
        get _dragTarget() {
            return null;
        }
        get _dragHandle() {
            return null;
        }
        _boundOnPointerDown = this._onPointerDown.bind(this);
        _boundOnPointerMove = this._onPointerMove.bind(this);
        _boundOnPointerUp = this._onPointerUp.bind(this);
        connectedCallback() {
            super.connectedCallback();
            if (this.hasUpdated) {
                this._updateDragState();
            }
        }
        updated(changedProperties) {
            super.updated(changedProperties);
            if (changedProperties.has('draggable') || this.draggable) {
                this._updateDragState();
            }
        }
        /**
     * Centralized method to apply or remove drag event listeners based on `draggable` state.
     */ _updateDragState() {
            const handle = this._dragHandle;
            if (handle) {
                if (this.draggable) {
                    handle.style.cursor = 'grab';
                    handle.style.touchAction = 'none';
                    handle.removeEventListener('pointerdown', this._boundOnPointerDown);
                    handle.addEventListener('pointerdown', this._boundOnPointerDown);
                } else {
                    handle.style.cursor = '';
                    handle.style.touchAction = '';
                    handle.removeEventListener('pointerdown', this._boundOnPointerDown);
                    this._resetDrag();
                }
            }
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            const handle = this._dragHandle;
            if (handle) {
                handle.removeEventListener('pointerdown', this._boundOnPointerDown);
            }
            this._removeWindowListeners();
        }
        _onPointerDown(e) {
            if (!this.draggable || e.button !== 0) return;
            const target = this._dragTarget;
            const handle = this._dragHandle;
            if (!target || !handle) return;
            // Ignore clicks on interactive controls inside the header handle
            const composedPath = e.composedPath();
            const isInteractive = composedPath.some((node)=>{
                if (node instanceof HTMLElement && node !== handle) {
                    const tag = node.tagName.toLowerCase();
                    const role = node.getAttribute('role');
                    return [
                        'button',
                        'a',
                        'input',
                        'select',
                        'textarea',
                        'vi-button'
                    ].includes(tag) || role === 'button' || node.hasAttribute('data-no-drag');
                }
                return false;
            });
            if (isInteractive) return;
            // Prevent native text selection or default drag behavior
            e.preventDefault();
            this._isDragging = true;
            this._dragStartX = e.clientX;
            this._dragStartY = e.clientY;
            this._initialTranslateX = this._currentTranslateX;
            this._initialTranslateY = this._currentTranslateY;
            // Unblock inline transform by cancelling any active Web Animations API effects
            if (typeof target.getAnimations === 'function') {
                target.getAnimations().forEach((anim)=>anim.cancel());
            }
            this._previousTransition = target.style.transition;
            target.style.transition = 'none';
            document.body.style.cursor = 'grabbing';
            if (handle) {
                handle.style.cursor = 'grabbing';
            }
            this._previousUserSelect = document.body.style.getPropertyValue('user-select') || null;
            document.body.style.setProperty('user-select', 'none', 'important');
            window.addEventListener('pointermove', this._boundOnPointerMove);
            window.addEventListener('pointerup', this._boundOnPointerUp);
            window.addEventListener('pointercancel', this._boundOnPointerUp);
            try {
                handle.setPointerCapture(e.pointerId);
            } catch  {
            // Fallback if pointer capture fails
            }
        }
        _onPointerMove(e) {
            if (!this._isDragging) return;
            e.preventDefault();
            const deltaX = e.clientX - this._dragStartX;
            const deltaY = e.clientY - this._dragStartY;
            this._currentTranslateX = this._initialTranslateX + deltaX;
            this._currentTranslateY = this._initialTranslateY + deltaY;
            // Apply boundary clamping if containment is set
            if (this.dragContainment !== 'none') {
                this._clampDrag();
            }
            const target = this._dragTarget;
            if (target) {
                target.style.transform = `translate3d(${this._currentTranslateX}px, ${this._currentTranslateY}px, 0)`;
            }
        }
        /**
     * Clamps `_currentTranslateX` / `_currentTranslateY` so the drag target
     * stays within the configured containment boundary.
     */ _clampDrag() {
            const target = this._dragTarget;
            if (!target) return;
            // Get the natural (un-transformed) position of the target
            const savedTransform = target.style.transform;
            target.style.transform = '';
            const naturalRect = target.getBoundingClientRect();
            target.style.transform = savedTransform;
            let boundsLeft;
            let boundsTop;
            let boundsRight;
            let boundsBottom;
            if (this.dragContainment === 'viewport') {
                boundsLeft = 0;
                boundsTop = 0;
                boundsRight = window.innerWidth;
                boundsBottom = window.innerHeight;
            } else {
                // 'parent' — use the offsetParent's bounding rect, or fall back to the host's parentElement
                let parent = target.offsetParent;
                if (!parent) {
                    parent = this.parentElement;
                }
                if (parent) {
                    const pr = parent.getBoundingClientRect();
                    boundsLeft = pr.left;
                    boundsTop = pr.top;
                    boundsRight = pr.right;
                    boundsBottom = pr.bottom;
                } else {
                    boundsLeft = 0;
                    boundsTop = 0;
                    boundsRight = window.innerWidth;
                    boundsBottom = window.innerHeight;
                }
            }
            // Compute allowed translate range
            const minX = boundsLeft - naturalRect.left;
            const maxX = boundsRight - naturalRect.right;
            const minY = boundsTop - naturalRect.top;
            const maxY = boundsBottom - naturalRect.bottom;
            this._currentTranslateX = Math.max(minX, Math.min(this._currentTranslateX, maxX));
            this._currentTranslateY = Math.max(minY, Math.min(this._currentTranslateY, maxY));
        }
        _onPointerUp(e) {
            if (!this._isDragging) return;
            this._isDragging = false;
            // Remove event listeners before releasing pointer capture to avoid synthetic event triggers
            this._removeWindowListeners();
            const handle = this._dragHandle;
            if (handle) {
                try {
                    if (handle.hasPointerCapture(e.pointerId)) {
                        handle.releasePointerCapture(e.pointerId);
                    }
                } catch  {
                // Ignore if release fails
                }
            }
            document.body.style.cursor = '';
            if (handle) {
                handle.style.cursor = 'grab';
            }
            if (this._previousUserSelect !== null) {
                document.body.style.setProperty('user-select', this._previousUserSelect);
            } else {
                document.body.style.removeProperty('user-select');
            }
            this._previousUserSelect = null;
            const target = this._dragTarget;
            if (target) {
                target.style.transform = `translate3d(${this._currentTranslateX}px, ${this._currentTranslateY}px, 0)`;
                if (this._previousTransition !== null) {
                    target.style.transition = this._previousTransition;
                } else {
                    target.style.removeProperty('transition');
                }
            }
            this._previousTransition = null;
        }
        _removeWindowListeners() {
            window.removeEventListener('pointermove', this._boundOnPointerMove);
            window.removeEventListener('pointerup', this._boundOnPointerUp);
            window.removeEventListener('pointercancel', this._boundOnPointerUp);
        }
        /**
     * Resets the drag translation back to origin (0,0).
     */ _resetDrag() {
            this._currentTranslateX = 0;
            this._currentTranslateY = 0;
            const target = this._dragTarget;
            if (target) {
                target.style.transform = '';
            }
        }
        /**
     * Stops the drag operation forcefully and cleans up state and listeners.
     */ _stopDrag() {
            if (!this._isDragging) return;
            this._isDragging = false;
            this._removeWindowListeners();
            if (this._previousUserSelect !== null) {
                document.body.style.setProperty('user-select', this._previousUserSelect);
            } else {
                document.body.style.removeProperty('user-select');
            }
            this._previousUserSelect = null;
            const target = this._dragTarget;
            if (target) {
                if (this._previousTransition !== null) {
                    target.style.transition = this._previousTransition;
                } else {
                    target.style.removeProperty('transition');
                }
            }
            this._previousTransition = null;
        }
    }
    return DraggableMixinClass;
}

function applyDecs2203RFactory$3() {
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
function _apply_decs_2203_r$3(targetClass, memberDecs, classDecs, parentClass) {
    return (_apply_decs_2203_r$3 = applyDecs2203RFactory$3())(targetClass, memberDecs, classDecs, parentClass);
}
/**
 * ResizableMixin
 *
 * Provides native 8-direction resize capabilities using Pointer Events.
 * Applies `width` and `height` inline styles to `_resizeTarget`.
 *
 * **Important**: All private fields use the `_rsz_` prefix to prevent
 * name collisions when composed with other mixins (e.g., DraggableMixin).
 *
 * Subclasses MUST implement:
 * - `_resizeTarget`: The HTML element that resizes (usually the dialog box).
 * - Render `${this._renderResizeHandles()}` inside the component's template.
 */ function ResizableMixin(Base) {
    var _dec, _dec1, _dec2, _dec3, _dec4, /** Enable resizing */ _init_resizable, /** Minimum width in pixels */ _init_minWidth, /** Minimum height in pixels */ _init_minHeight, /** Maximum width in pixels (0 = viewport width) */ _init_maxWidth, /** Maximum height in pixels (0 = viewport height) */ _init_maxHeight, _initProto;
    _dec = n({
        type: Boolean,
        reflect: true
    }), _dec1 = n({
        type: Number,
        attribute: 'min-width'
    }), _dec2 = n({
        type: Number,
        attribute: 'min-height'
    }), _dec3 = n({
        type: Number,
        attribute: 'max-width'
    }), _dec4 = n({
        type: Number,
        attribute: 'max-height'
    });
    class ResizableMixinClass extends Base {
        static{
            ({ e: [_init_resizable, _init_minWidth, _init_minHeight, _init_maxWidth, _init_maxHeight, _initProto] } = _apply_decs_2203_r$3(this, [
                [
                    _dec,
                    1,
                    "resizable"
                ],
                [
                    _dec1,
                    1,
                    "minWidth"
                ],
                [
                    _dec2,
                    1,
                    "minHeight"
                ],
                [
                    _dec3,
                    1,
                    "maxWidth"
                ],
                [
                    _dec4,
                    1,
                    "maxHeight"
                ]
            ], []));
        }
        #___private_resizable_1 = (_initProto(this), _init_resizable(this, false));
        get resizable() {
            return this.#___private_resizable_1;
        }
        set resizable(_v) {
            this.#___private_resizable_1 = _v;
        }
        #___private_minWidth_2 = _init_minWidth(this, 200);
        get minWidth() {
            return this.#___private_minWidth_2;
        }
        set minWidth(_v) {
            this.#___private_minWidth_2 = _v;
        }
        #___private_minHeight_3 = _init_minHeight(this, 120);
        get minHeight() {
            return this.#___private_minHeight_3;
        }
        set minHeight(_v) {
            this.#___private_minHeight_3 = _v;
        }
        #___private_maxWidth_4 = _init_maxWidth(this, 0);
        get maxWidth() {
            return this.#___private_maxWidth_4;
        }
        set maxWidth(_v) {
            this.#___private_maxWidth_4 = _v;
        }
        #___private_maxHeight_5 = _init_maxHeight(this, 0);
        get maxHeight() {
            return this.#___private_maxHeight_5;
        }
        set maxHeight(_v) {
            this.#___private_maxHeight_5 = _v;
        }
        // ── All private fields prefixed _rsz_ to prevent mixin collision ──
        _rsz_isResizing = false;
        _rsz_activeHandle = null;
        _rsz_prevUserSelect = null;
        _rsz_prevTransition = null;
        _rsz_startX = 0;
        _rsz_startY = 0;
        _rsz_startWidth = 0;
        _rsz_startHeight = 0;
        get _resizeTarget() {
            return null;
        }
        // Bound handlers — arrow function class fields, uniquely named
        _rsz_onPointerMove = (e)=>this._rsz_handlePointerMove(e);
        _rsz_onPointerUp = (e)=>this._rsz_handlePointerUp(e);
        disconnectedCallback() {
            super.disconnectedCallback();
            this._rsz_removeListeners();
        }
        updated(changedProperties) {
            super.updated(changedProperties);
        }
        _rsz_onPointerDown(e, handle) {
            if (!this.resizable || e.button !== 0) return;
            // Duck-type: suppress resize when maximized
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (this._maximized) return;
            const target = this._resizeTarget;
            if (!target) return;
            e.preventDefault();
            e.stopPropagation();
            this._rsz_isResizing = true;
            this._rsz_activeHandle = handle;
            this._rsz_startX = e.clientX;
            this._rsz_startY = e.clientY;
            const rect = target.getBoundingClientRect();
            this._rsz_startWidth = rect.width;
            this._rsz_startHeight = rect.height;
            // Cancel active animations so inline style takes over immediately
            if (typeof target.getAnimations === 'function') {
                target.getAnimations().forEach((anim)=>anim.cancel());
            }
            this._rsz_prevTransition = target.style.transition;
            target.style.transition = 'none';
            this._rsz_prevUserSelect = document.body.style.getPropertyValue('user-select') || null;
            document.body.style.setProperty('user-select', 'none', 'important');
            document.body.style.cursor = `${handle}-resize`;
            window.addEventListener('pointermove', this._rsz_onPointerMove);
            window.addEventListener('pointerup', this._rsz_onPointerUp);
            window.addEventListener('pointercancel', this._rsz_onPointerUp);
            try {
                e.currentTarget.setPointerCapture(e.pointerId);
            } catch  {
            // Fallback silently
            }
        }
        _rsz_handlePointerMove(e) {
            if (!this._rsz_isResizing || !this._rsz_activeHandle) return;
            e.preventDefault();
            const target = this._resizeTarget;
            if (!target) return;
            const deltaX = e.clientX - this._rsz_startX;
            const deltaY = e.clientY - this._rsz_startY;
            const handle = this._rsz_activeHandle;
            let newWidth = this._rsz_startWidth;
            let newHeight = this._rsz_startHeight;
            // Horizontal
            if (handle.includes('e')) {
                newWidth = this._rsz_startWidth + deltaX;
            } else if (handle.includes('w')) {
                newWidth = this._rsz_startWidth - deltaX;
            }
            // Vertical
            if (handle.includes('s')) {
                newHeight = this._rsz_startHeight + deltaY;
            } else if (handle.includes('n')) {
                newHeight = this._rsz_startHeight - deltaY;
            }
            // Enforce min/max (0 means use viewport)
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const effectiveMaxWidth = this.maxWidth > 0 ? this.maxWidth : vw;
            const effectiveMaxHeight = this.maxHeight > 0 ? this.maxHeight : vh;
            newWidth = Math.max(this.minWidth, Math.min(newWidth, effectiveMaxWidth));
            newHeight = Math.max(this.minHeight, Math.min(newHeight, effectiveMaxHeight));
            target.style.width = `${newWidth}px`;
            target.style.height = `${newHeight}px`;
            // Override any max-width/max-height from CSS so resize takes precedence
            target.style.maxWidth = `${newWidth}px`;
            target.style.maxHeight = `${newHeight}px`;
        }
        _rsz_handlePointerUp(_e) {
            if (!this._rsz_isResizing) return;
            this._rsz_isResizing = false;
            this._rsz_activeHandle = null;
            document.body.style.cursor = '';
            if (this._rsz_prevUserSelect !== null) {
                document.body.style.setProperty('user-select', this._rsz_prevUserSelect);
            } else {
                document.body.style.removeProperty('user-select');
            }
            this._rsz_prevUserSelect = null;
            const target = this._resizeTarget;
            if (target) {
                if (this._rsz_prevTransition !== null) {
                    target.style.transition = this._rsz_prevTransition;
                } else {
                    target.style.removeProperty('transition');
                }
            }
            this._rsz_prevTransition = null;
            this._rsz_removeListeners();
        }
        _rsz_removeListeners() {
            window.removeEventListener('pointermove', this._rsz_onPointerMove);
            window.removeEventListener('pointerup', this._rsz_onPointerUp);
            window.removeEventListener('pointercancel', this._rsz_onPointerUp);
        }
        /**
     * Clears any inline resize dimensions (called on open or maximize).
     */ _resetResize() {
            this._rsz_isResizing = false;
            this._rsz_activeHandle = null;
            this._rsz_removeListeners();
            const target = this._resizeTarget;
            if (target) {
                target.style.width = '';
                target.style.height = '';
                target.style.maxWidth = '';
                target.style.maxHeight = '';
            }
        }
        /**
     * Renders 8 invisible hit-area divs for all resize directions.
     * Returns empty template when `resizable` is false.
     */ _renderResizeHandles() {
            if (!this.resizable) return b``;
            const handles = [
                'n',
                's',
                'e',
                'w',
                'ne',
                'nw',
                'se',
                'sw'
            ];
            return b`
        ${handles.map((handle)=>b`
            <div
              class="resize-handle resize-handle-${handle}"
              @pointerdown=${(e)=>this._rsz_onPointerDown(e, handle)}
              aria-hidden="true"
            ></div>
          `)}
      `;
        }
    }
    return ResizableMixinClass;
}

const modalStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.modal-dialog,[part=dialog]{border:none;color:inherit;display:none;background-color:var(--vi-modal-bg, var(--vi-color-background, #ffffff));border-radius:var(--vi-modal-border-radius, var(--vi-border-radius-lg, 8px));box-shadow:var(--vi-modal-shadow, var(--vi-shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, .05), 0 25px 50px -12px rgba(0, 0, 0, .15)));padding:0;margin:auto;width:100%;max-width:var(--vi-modal-max-width-md, 520px);max-height:90vh;max-height:90dvh;z-index:var(--vi-modal-z-index, 1050);font-family:var(--vi-modal-font-family, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));font-size:var(--vi-modal-font-size, var(--vi-font-size-base, .875rem));line-height:var(--vi-modal-line-height, var(--vi-line-height-normal, 1.5715));color:var(--vi-text-primary, #111827)}.modal-dialog[open],[open][part=dialog]{display:flex;flex-direction:column;animation:vi-modal-enter var(--vi-modal-animation-duration, .2s) ease-out}.modal-dialog::backdrop,[part=dialog]::backdrop{background-color:var(--vi-modal-backdrop-bg, rgba(0, 0, 0, .5))}.modal-header,[part=header]{display:flex;align-items:center;justify-content:space-between;padding:var(--vi-modal-header-padding, var(--vi-spacing-md, 1rem) var(--vi-spacing-lg, 1.5rem));flex-shrink:0}.modal-dialog.is-draggable .modal-header,.is-draggable[part=dialog] .modal-header,.modal-dialog.is-draggable [part=header],.is-draggable[part=dialog] [part=header]{cursor:move;-webkit-user-select:none;user-select:none}.modal-title,[part=title]{font-size:var(--vi-font-size-lg, 1rem);font-weight:var(--vi-font-weight-semibold, 600);margin:0}.modal-header-actions{display:flex;align-items:center;gap:var(--vi-spacing-xs, .5rem)}.modal-body,[part=body]{padding:var(--vi-modal-body-padding, var(--vi-spacing-lg, 1.5rem));flex-grow:1;overflow-y:auto}.modal-footer,[part=footer]{display:flex;align-items:center;justify-content:flex-end;gap:var(--vi-spacing-sm, .75rem);padding:var(--vi-modal-footer-padding, var(--vi-spacing-xs, .5rem) var(--vi-spacing-md, 1rem));background-color:var(--vi-modal-footer-bg, var(--vi-layer-02, #f3f4f6));border-top:1px solid var(--vi-modal-footer-border-color, var(--vi-border-02, #eeeeee));flex-shrink:0}.modal-variant-drawer{margin:0;max-height:none;height:100vh;height:100dvh;max-width:none;width:var(--vi-modal-drawer-width, 480px);border-radius:0}.modal-variant-drawer.placement-right{margin-left:auto}.modal-variant-drawer.placement-right[open]{animation:vi-modal-drawer-enter-right var(--vi-modal-animation-duration, .2s) ease-out}.modal-variant-drawer.placement-left{margin-right:auto}.modal-variant-drawer.placement-left[open]{animation:vi-modal-drawer-enter-left var(--vi-modal-animation-duration, .2s) ease-out}.modal-variant-alert{flex-direction:row;padding:var(--vi-modal-body-padding, var(--vi-spacing-lg, 1.5rem));max-width:var(--vi-modal-max-width-sm, 480px)}.modal-variant-alert .modal-alert-icon{flex-shrink:0;margin-right:var(--vi-spacing-md, 1rem);display:flex;align-items:flex-start;padding-top:2px}.modal-variant-alert .modal-alert-content{flex-grow:1;display:flex;flex-direction:column}.modal-variant-alert .modal-alert-content .modal-header,.modal-variant-alert .modal-alert-content [part=header]{padding:0;margin-bottom:var(--vi-spacing-xs, .5rem)}.modal-variant-alert .modal-alert-content .modal-body,.modal-variant-alert .modal-alert-content [part=body]{padding:0;margin-bottom:var(--vi-spacing-sm, .75rem)}.modal-variant-alert .modal-alert-content .modal-footer,.modal-variant-alert .modal-alert-content [part=footer]{padding:0;background:transparent;border-top:none;margin-top:auto}.modal-variant-alert[open]{animation:vi-modal-alert-enter var(--vi-modal-animation-duration, .2s) cubic-bezier(.175,.885,.32,1.275)}.modal-size-xs{max-width:var(--vi-modal-max-width-xs, 320px)}.modal-size-sm{max-width:var(--vi-modal-max-width-sm, 480px)}.modal-size-md{max-width:var(--vi-modal-max-width-md, 520px)}.modal-size-lg{max-width:var(--vi-modal-max-width-lg, 800px)}.modal-size-xl{max-width:var(--vi-modal-max-width-xl, 960px)}.modal-size-fullscreen{max-width:none;width:100vw;width:100dvw;max-height:none;height:100vh;height:100dvh;border-radius:0;margin:0}.modal-size-full-width{max-width:none;width:100vw;width:100dvw;border-radius:0;margin-left:0;margin-right:0}.modal-scrollable-false .modal-body,.modal-scrollable-false [part=body]{overflow-y:visible}@keyframes vi-modal-enter{0%{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}@keyframes vi-modal-drawer-enter-right{0%{transform:translate(100%)}to{transform:translate(0)}}@keyframes vi-modal-drawer-enter-left{0%{transform:translate(-100%)}to{transform:translate(0)}}@keyframes vi-modal-alert-enter{0%{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}@media(prefers-reduced-motion:reduce){.modal-dialog[open],[open][part=dialog]{animation:none!important}}@media(max-width:639px){.modal-dialog:not(.modal-variant-drawer),[part=dialog]:not(.modal-variant-drawer){max-width:100vw!important;width:100vw!important;width:100dvw!important;max-height:100vh!important;max-height:100dvh!important;height:100vh!important;height:100dvh!important;border-radius:0!important;margin:0!important;transform:none!important}.modal-header,[part=header],.modal-body,[part=body],.modal-footer,[part=footer]{padding:var(--vi-spacing-md, 1rem)}}}:host{display:block}:host(:not([open])){display:none}.modal-backdrop{position:fixed;inset:0;background:var(--vi-modal-backdrop-bg, var(--vi-modal-backdrop-bg, rgba(0, 0, 0, .5)));-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);pointer-events:auto}[part=dialog][open]{position:fixed;inset:0;margin:auto}[part=dialog].modal-variant-drawer{margin:0}[part=dialog].modal-variant-drawer.placement-right{margin-left:auto}[part=dialog].modal-variant-drawer.placement-left{margin-right:auto}[part=dialog].modal-position-top{margin-top:var(--vi-modal-offset-y, 5dvh);margin-bottom:auto}[part=dialog].modal-position-bottom{margin-top:auto;margin-bottom:var(--vi-modal-offset-y, 5dvh)}[part=dialog].modal-position-left{margin-left:var(--vi-modal-offset-x, 5vw);margin-right:auto}[part=dialog].modal-position-right{margin-left:auto;margin-right:var(--vi-modal-offset-x, 5vw)}[part=dialog].modal-position-top-left{margin:var(--vi-modal-offset-y, 5dvh) auto auto var(--vi-modal-offset-x, 5vw)}[part=dialog].modal-position-top-right{margin:var(--vi-modal-offset-y, 5dvh) var(--vi-modal-offset-x, 5vw) auto auto}[part=dialog].modal-position-bottom-left{margin:auto auto var(--vi-modal-offset-y, 5dvh) var(--vi-modal-offset-x, 5vw)}[part=dialog].modal-position-bottom-right{margin:auto var(--vi-modal-offset-x, 5vw) var(--vi-modal-offset-y, 5dvh) auto}.is-maximized{margin:0!important;max-width:100vw!important;max-height:100dvh!important;width:100vw!important;height:100dvh!important;border-radius:0!important;transform:none!important}.resize-handle{position:absolute;z-index:10}.resize-handle-n{top:-4px;left:8px;right:8px;height:8px;cursor:n-resize}.resize-handle-s{bottom:-4px;left:8px;right:8px;height:8px;cursor:s-resize}.resize-handle-e{right:-4px;top:8px;bottom:8px;width:8px;cursor:e-resize}.resize-handle-w{left:-4px;top:8px;bottom:8px;width:8px;cursor:w-resize}.resize-handle-ne{top:-4px;right:-4px;width:12px;height:12px;cursor:ne-resize}.resize-handle-nw{top:-4px;left:-4px;width:12px;height:12px;cursor:nw-resize}.resize-handle-se{bottom:-4px;right:-4px;width:12px;height:12px;cursor:se-resize}.resize-handle-sw{bottom:-4px;left:-4px;width:12px;height:12px;cursor:sw-resize}.is-maximized .resize-handle{display:none}.is-draggable [part=header],.is-draggable .modal-header{cursor:grab!important}.is-draggable [part=header]:active,.is-draggable .modal-header:active{cursor:grabbing!important}[part=dialog].modal-variant-alert{padding:0!important;flex-direction:column!important}.modal-header--alert{display:flex;align-items:center;justify-content:flex-start;gap:var(--vi-spacing-sm, .75rem)}.modal-header--alert .modal-alert-icon{display:flex;margin:0;padding:0}:host([alert-variant=danger]) .modal-alert-icon{color:var(--vi-color-error, #ef4444)}:host([alert-variant=warning]) .modal-alert-icon{color:var(--vi-color-warning, #ffba00)}:host([alert-variant=success]) .modal-alert-icon{color:var(--vi-color-success, #489167)}:host([alert-variant=info]) .modal-alert-icon,:host(:not([alert-variant])) .modal-alert-icon{color:var(--vi-color-info, #3676d0)}";

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
function _identity$2(x) {
    return x;
}
var _dec$2, _initClass$2, _ResizableMixin, _dec1$1, _dec2$1, _dec3$1, _dec4$1, _dec5$1, _dec6$1, _dec7$1, _dec8$1, _dec9$1, _dec10$1, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, /** Layout variant */ _init_variant, /** Dialog dimensions */ _init_size, /** Position of the modal */ _init_position, /** Show × button in header */ _init_closable$1, /** Allow maximizing to fullscreen */ _init_maximizable$1, /** Prevent close on Escape and backdrop click */ _init_persistent, /** Hide/disable the backdrop overlay and allow background interaction */ _init_noBackdrop, /** Focus first element on open */ _init_autofocus, /** Body scrolls; header/footer stay fixed */ _init_scrollable, /** Side for drawer variant */ _init_drawerPlacement, /** Icon+colour for alert variant */ _init_alertVariant$1, /** Element or CSS selector to return focus to on close */ _init_returnFocusSelector, /** Initial element or CSS selector to focus when opened */ _init_initialFocusSelector, /** Header description text */ /**
   * Enter animation preset. Defaults to 'zoom-in' for default/alert, 'slide-in-right' for right drawer,
   * 'slide-in-left' for left drawer. Set to 'none' to disable.
   */ _init_enterAnimation, /** Exit animation preset. Auto-derived from enterAnimation if not set. Set to 'none' to disable. */ _init_exitAnimation, /** Duration of enter/exit animations in milliseconds. */ _init_animationDuration, /**
   * Where the modal is teleported when opened. Accepts a CSS selector string
   * or an `HTMLElement`. Defaults to `'body'`. No change from current behavior
   * when left at default.
   */ _init_appendTo, /**
   * Scroll strategy when the modal is open. Defaults to 'block' which prevents
   * scrolling the document body. Set to 'noop' to allow background scrolling.
   */ _init_scrollStrategy, _init__dialog, _init__backdropEl, _init__maximized, _init__overlayZIndex, _initProto$1;
const prefersReducedMotion = ()=>typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let _ViModal;
_dec$2 = t('vi-modal'), _dec1$1 = n({
    type: String,
    reflect: true
}), _dec2$1 = n({
    type: String,
    reflect: true
}), _dec3$1 = n({
    type: String,
    reflect: true
}), _dec4$1 = n({
    type: Boolean
}), _dec5$1 = n({
    type: Boolean
}), _dec6$1 = n({
    type: Boolean
}), _dec7$1 = n({
    type: Boolean,
    attribute: 'no-backdrop'
}), _dec8$1 = n({
    type: Boolean
}), _dec9$1 = n({
    type: Boolean
}), _dec10$1 = n({
    type: String,
    attribute: 'drawer-placement'
}), _dec11 = n({
    type: String,
    attribute: 'alert-variant'
}), _dec12 = n({
    attribute: 'return-focus'
}), _dec13 = n({
    attribute: 'initial-focus'
}), _dec14 = n({
    attribute: 'enter-animation'
}), _dec15 = n({
    attribute: 'exit-animation'
}), _dec16 = n({
    type: Number,
    attribute: 'animation-duration'
}), _dec17 = n({
    attribute: 'append-to'
}), _dec18 = n({
    attribute: 'scroll-strategy'
}), _dec19 = e$2('dialog'), _dec20 = e$2('.modal-backdrop'), _dec21 = r(), _dec22 = r();
new class extends _identity$2 {
    constructor(){
        super(_ViModal), _initClass$2();
    }
    static{
        class ViModal extends (_ResizableMixin = ResizableMixin(DraggableMixin(FocusTrapMixin(ViElement)))) {
            static{
                ({ e: [_init_variant, _init_size, _init_position, _init_closable$1, _init_maximizable$1, _init_persistent, _init_noBackdrop, _init_autofocus, _init_scrollable, _init_drawerPlacement, _init_alertVariant$1, _init_returnFocusSelector, _init_initialFocusSelector, _init_enterAnimation, _init_exitAnimation, _init_animationDuration, _init_appendTo, _init_scrollStrategy, _init__dialog, _init__backdropEl, _init__maximized, _init__overlayZIndex, _initProto$1], c: [_ViModal, _initClass$2] } = _apply_decs_2203_r$2(this, [
                    [
                        _dec1$1,
                        1,
                        "variant"
                    ],
                    [
                        _dec2$1,
                        1,
                        "size"
                    ],
                    [
                        _dec3$1,
                        1,
                        "position"
                    ],
                    [
                        _dec4$1,
                        1,
                        "closable"
                    ],
                    [
                        _dec5$1,
                        1,
                        "maximizable"
                    ],
                    [
                        _dec6$1,
                        1,
                        "persistent"
                    ],
                    [
                        _dec7$1,
                        1,
                        "noBackdrop"
                    ],
                    [
                        _dec8$1,
                        1,
                        "autofocus"
                    ],
                    [
                        _dec9$1,
                        1,
                        "scrollable"
                    ],
                    [
                        _dec10$1,
                        1,
                        "drawerPlacement"
                    ],
                    [
                        _dec11,
                        1,
                        "alertVariant"
                    ],
                    [
                        _dec12,
                        1,
                        "returnFocusSelector"
                    ],
                    [
                        _dec13,
                        1,
                        "initialFocusSelector"
                    ],
                    [
                        _dec14,
                        1,
                        "enterAnimation"
                    ],
                    [
                        _dec15,
                        1,
                        "exitAnimation"
                    ],
                    [
                        _dec16,
                        1,
                        "animationDuration"
                    ],
                    [
                        _dec17,
                        1,
                        "appendTo"
                    ],
                    [
                        _dec18,
                        1,
                        "scrollStrategy"
                    ],
                    [
                        _dec19,
                        1,
                        "_dialog"
                    ],
                    [
                        _dec20,
                        1,
                        "_backdropEl"
                    ],
                    [
                        _dec21,
                        1,
                        "_maximized"
                    ],
                    [
                        _dec22,
                        1,
                        "_overlayZIndex"
                    ]
                ], [
                    _dec$2
                ], _ResizableMixin));
            }
            static styles = i`
    ${r$1(modalStyles)}
  `;
            static properties = {
                open: {
                    type: Boolean,
                    reflect: true
                }
            };
            _open = (_initProto$1(this), false);
            _bodyId = 'vi-modal-body-' + Math.random().toString(36).substring(2, 9);
            /** Whether the modal is currently open. */ get open() {
                return this._open;
            }
            set open(val) {
                const oldVal = this._open;
                if (val === oldVal) return;
                if (this.isConnected) {
                    const eventName = val ? 'vi-modal-before-open' : 'vi-modal-before-close';
                    const ev = new CustomEvent(eventName, {
                        bubbles: true,
                        composed: true,
                        cancelable: true
                    });
                    this.dispatchEvent(ev);
                    if (ev.defaultPrevented) {
                        if (oldVal) {
                            this.setAttribute('open', '');
                        } else {
                            this.removeAttribute('open');
                        }
                        return;
                    }
                }
                this._open = val;
                this.requestUpdate('open', oldVal);
            }
            #___private_variant_1 = _init_variant(this, 'default');
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
            #___private_position_3 = _init_position(this, 'center');
            get position() {
                return this.#___private_position_3;
            }
            set position(_v) {
                this.#___private_position_3 = _v;
            }
            #___private_closable_4 = _init_closable$1(this, true);
            get closable() {
                return this.#___private_closable_4;
            }
            set closable(_v) {
                this.#___private_closable_4 = _v;
            }
            #___private_maximizable_5 = _init_maximizable$1(this, false);
            get maximizable() {
                return this.#___private_maximizable_5;
            }
            set maximizable(_v) {
                this.#___private_maximizable_5 = _v;
            }
            #___private_persistent_6 = _init_persistent(this, false);
            get persistent() {
                return this.#___private_persistent_6;
            }
            set persistent(_v) {
                this.#___private_persistent_6 = _v;
            }
            #___private_noBackdrop_7 = _init_noBackdrop(this, false);
            get noBackdrop() {
                return this.#___private_noBackdrop_7;
            }
            set noBackdrop(_v) {
                this.#___private_noBackdrop_7 = _v;
            }
            #___private_autofocus_8 = _init_autofocus(this, true);
            get autofocus() {
                return this.#___private_autofocus_8;
            }
            set autofocus(_v) {
                this.#___private_autofocus_8 = _v;
            }
            #___private_scrollable_9 = _init_scrollable(this, true);
            get scrollable() {
                return this.#___private_scrollable_9;
            }
            set scrollable(_v) {
                this.#___private_scrollable_9 = _v;
            }
            #___private_drawerPlacement_10 = _init_drawerPlacement(this, 'right');
            get drawerPlacement() {
                return this.#___private_drawerPlacement_10;
            }
            set drawerPlacement(_v) {
                this.#___private_drawerPlacement_10 = _v;
            }
            #___private_alertVariant_11 = _init_alertVariant$1(this, 'info');
            get alertVariant() {
                return this.#___private_alertVariant_11;
            }
            set alertVariant(_v) {
                this.#___private_alertVariant_11 = _v;
            }
            #___private_returnFocusSelector_12 = _init_returnFocusSelector(this, undefined);
            get returnFocusSelector() {
                return this.#___private_returnFocusSelector_12;
            }
            set returnFocusSelector(_v) {
                this.#___private_returnFocusSelector_12 = _v;
            }
            #___private_initialFocusSelector_13 = _init_initialFocusSelector(this, undefined);
            get initialFocusSelector() {
                return this.#___private_initialFocusSelector_13;
            }
            set initialFocusSelector(_v) {
                this.#___private_initialFocusSelector_13 = _v;
            }
            #___private_enterAnimation_14 = _init_enterAnimation(this, '');
            get enterAnimation() {
                return this.#___private_enterAnimation_14;
            }
            set enterAnimation(_v) {
                this.#___private_enterAnimation_14 = _v;
            }
            #___private_exitAnimation_15 = _init_exitAnimation(this, '');
            get exitAnimation() {
                return this.#___private_exitAnimation_15;
            }
            set exitAnimation(_v) {
                this.#___private_exitAnimation_15 = _v;
            }
            #___private_animationDuration_16 = _init_animationDuration(this, 250);
            get animationDuration() {
                return this.#___private_animationDuration_16;
            }
            set animationDuration(_v) {
                this.#___private_animationDuration_16 = _v;
            }
            #___private_appendTo_17 = _init_appendTo(this, 'body');
            get appendTo() {
                return this.#___private_appendTo_17;
            }
            set appendTo(_v) {
                this.#___private_appendTo_17 = _v;
            }
            #___private_scrollStrategy_18 = _init_scrollStrategy(this, 'block');
            get scrollStrategy() {
                return this.#___private_scrollStrategy_18;
            }
            set scrollStrategy(_v) {
                this.#___private_scrollStrategy_18 = _v;
            }
            #___private__dialog_19 = _init__dialog(this);
            get _dialog() {
                return this.#___private__dialog_19;
            }
            set _dialog(_v) {
                this.#___private__dialog_19 = _v;
            }
            #___private__backdropEl_20 = _init__backdropEl(this);
            get _backdropEl() {
                return this.#___private__backdropEl_20;
            }
            set _backdropEl(_v) {
                this.#___private__backdropEl_20 = _v;
            }
            #___private__maximized_21 = _init__maximized(this, false);
            get _maximized() {
                return this.#___private__maximized_21;
            }
            set _maximized(_v) {
                this.#___private__maximized_21 = _v;
            }
            #___private__overlayZIndex_22 = _init__overlayZIndex(this, null);
            get _overlayZIndex() {
                return this.#___private__overlayZIndex_22;
            }
            set _overlayZIndex(_v) {
                this.#___private__overlayZIndex_22 = _v;
            }
            _originalParent = null;
            _originalNextSibling = null;
            _activeAnimation = null;
            get _dragTarget() {
                return this._dialog;
            }
            get _dragHandle() {
                // DraggableMixin queries this to know what initiates dragging
                return this.querySelector('vi-modal-header') ?? null;
            }
            get _resizeTarget() {
                return this._dialog;
            }
            connectedCallback() {
                super.connectedCallback();
                this.addEventListener('vi-modal-close-request', this._handleHeaderCloseRequest);
                this.addEventListener('vi-modal-maximize-request', this._handleHeaderMaximizeRequest);
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this.removeEventListener('vi-modal-close-request', this._handleHeaderCloseRequest);
                this.removeEventListener('vi-modal-maximize-request', this._handleHeaderMaximizeRequest);
                OverlayManager.unregister(this);
                this._activeAnimation?.cancel();
                this._activeAnimation = null;
            }
            _handleHeaderCloseRequest = ()=>{
                this.close('button');
            };
            _handleHeaderMaximizeRequest = ()=>{
                this._maximized = !this._maximized;
                if (this._maximized) {
                    this._resetDrag(); // Clear drag state when maximized
                    this._resetResize(); // Clear resize state when maximized
                }
                this._syncHeaderState();
            };
            _syncHeaderState() {
                const header = this.querySelector('vi-modal-header');
                if (header) {
                    header.maximized = this._maximized;
                }
            }
            updated(changedProperties) {
                super.updated(changedProperties);
                if (changedProperties.has('open')) {
                    if (this.open) {
                        // Resolve append-to target
                        // Blocking modals (with backdrop) MUST teleport to document.body.
                        // Otherwise, the OverlayManager's 'inert' application to body children 
                        // will make the custom container (and therefore the modal) completely inert.
                        let teleportTarget = document.body;
                        if (this.noBackdrop) {
                            if (this.appendTo instanceof HTMLElement) {
                                teleportTarget = this.appendTo;
                            } else if (typeof this.appendTo === 'string' && this.appendTo) {
                                try {
                                    teleportTarget = document.querySelector(this.appendTo) ?? document.body;
                                } catch  {
                                    teleportTarget = document.body;
                                }
                            }
                        }
                        // Teleport to target container to ensure correct stacking context
                        if (this.parentElement !== teleportTarget) {
                            this._originalParent = this.parentNode;
                            this._originalNextSibling = this.nextSibling;
                            teleportTarget.appendChild(this);
                        }
                        // Register overlay to calculate z-index and manage body scroll
                        this._overlayZIndex = OverlayManager.register(this, this.variant === 'drawer' ? 'modal' : 'modal', this.noBackdrop ? 'noop' : 'block', {
                            noBackdrop: this.noBackdrop
                        });
                        // Apply inert to background content (must happen after teleport)
                        // (Handled by OverlayManager now)
                        // Reset drag/maximize/resize state on open
                        this._maximized = false;
                        this._resetDrag();
                        this._resetResize();
                        // Activate focus trap immediately (concurrent with animation)
                        let initialFocus;
                        if (typeof this.initialFocusSelector === 'string' && this.initialFocusSelector) {
                            initialFocus = document.querySelector(this.initialFocusSelector) ?? undefined;
                        }
                        if (!this.noBackdrop) {
                            this._activateFocusTrap(initialFocus, this.autofocus);
                        }
                        this.dispatchEvent(new CustomEvent('vi-modal-open', {
                            bubbles: true,
                            composed: true
                        }));
                        // Play enter animation after first render
                        this.updateComplete.then(()=>{
                            if (!this.open) return;
                            this._runEnterAnimation().then(()=>{
                                if (!this.open) return;
                                this.dispatchEvent(new CustomEvent('vi-modal-after-open', {
                                    bubbles: true,
                                    composed: true
                                }));
                            });
                        });
                    } else {
                        const finalReason = this._closeReason;
                        this._closeReason = 'programmatic';
                        this.dispatchEvent(new CustomEvent('vi-modal-close', {
                            bubbles: true,
                            composed: true,
                            detail: {
                                reason: finalReason
                            }
                        }));
                        // Run exit animation, then tear down
                        this._runExitAnimation().then(()=>{
                            if (this.open) return;
                            OverlayManager.unregister(this);
                            this._stopDrag();
                            // (Handled by OverlayManager now)
                            let returnTarget = null;
                            if (typeof this.returnFocusSelector === 'string' && this.returnFocusSelector) {
                                returnTarget = document.querySelector(this.returnFocusSelector);
                            } else if (this.returnFocusSelector instanceof HTMLElement) {
                                returnTarget = this.returnFocusSelector;
                            }
                            this._deactivateFocusTrap(returnTarget);
                            // Restore original DOM position
                            if (this._originalParent && this.parentElement !== this._originalParent) {
                                this._originalParent.insertBefore(this, this._originalNextSibling);
                            }
                            this._originalParent = null;
                            this._originalNextSibling = null;
                            this.dispatchEvent(new CustomEvent('vi-modal-after-close', {
                                bubbles: true,
                                composed: true,
                                detail: {
                                    reason: finalReason
                                }
                            }));
                        });
                    }
                }
            }
            _closeReason = 'programmatic';
            // ─── Animation Helpers ───────────────────────────────────────────────────
            /** Returns the effective enter animation preset based on variant/placement if not overridden. */ get _resolvedEnterAnimation() {
                if (this.enterAnimation) return this.enterAnimation;
                if (this.variant === 'drawer') {
                    return this.drawerPlacement === 'left' ? 'slide-in-left' : 'slide-in-right';
                }
                return 'zoom-in'; // default and alert variants
            }
            get _resolvedExitAnimation() {
                if (this.exitAnimation) return this.exitAnimation;
                return EXIT_COUNTERPART[this._resolvedEnterAnimation] ?? 'fade-out';
            }
            async _runEnterAnimation() {
                const animName = this._resolvedEnterAnimation;
                if (animName === 'none' || !this._dialog || !this._dialog.animate) return;
                const reduced = prefersReducedMotion();
                const kf = reduced ? PRESET_KEYFRAMES['fade-in'] : PRESET_KEYFRAMES[animName];
                const dur = reduced ? Math.min(this.animationDuration, 100) : this.animationDuration;
                if (!kf) return;
                // Cancel any leftover animation
                this._activeAnimation?.cancel();
                const anim = this._dialog.animate(kf, {
                    duration: dur,
                    easing: 'cubic-bezier(0.2, 0, 0, 1)',
                    fill: 'forwards'
                });
                this._activeAnimation = anim;
                // Animate backdrop concurrently (simple fade)
                const backdropAnim = this._backdropEl?.animate?.(PRESET_KEYFRAMES['fade-in'], {
                    duration: dur,
                    easing: 'ease',
                    fill: 'forwards'
                });
                await Promise.allSettled([
                    anim.finished,
                    backdropAnim?.finished ?? Promise.resolve()
                ]);
                if (this._activeAnimation === anim) {
                    anim.cancel();
                }
            }
            async _runExitAnimation() {
                const animName = this._resolvedExitAnimation;
                if (animName === 'none' || !this._dialog || !this._dialog.animate) return;
                const reduced = prefersReducedMotion();
                const kf = reduced ? PRESET_KEYFRAMES['fade-out'] : PRESET_KEYFRAMES[animName];
                const dur = reduced ? Math.min(this.animationDuration, 100) : this.animationDuration;
                if (!kf) return;
                // Animate dialog and backdrop concurrently, await both
                const dialogAnim = this._dialog.animate(kf, {
                    duration: dur,
                    easing: 'cubic-bezier(0.2, 0, 0, 1)',
                    fill: 'forwards'
                });
                const backdropAnim = this._backdropEl?.animate?.(PRESET_KEYFRAMES['fade-out'], {
                    duration: dur,
                    easing: 'ease',
                    fill: 'forwards'
                });
                await Promise.allSettled([
                    dialogAnim.finished,
                    backdropAnim?.finished ?? Promise.resolve()
                ]);
                // Clear fill so CSS can take over
                try {
                    dialogAnim.cancel();
                } catch  {
                /* already finished */ }
                try {
                    backdropAnim?.cancel();
                } catch  {
                /* already finished */ }
            }
            /** Play a shake animation on the dialog to signal a blocked close attempt. */ _shakeDialog() {
                if (!this._dialog || !this._dialog.animate) return;
                const reduced = prefersReducedMotion();
                const dur = reduced ? 0 : 380;
                this._dialog.animate(PRESET_KEYFRAMES['shake'], {
                    duration: dur,
                    easing: 'ease-in-out'
                });
            }
            /** Open the modal */ show() {
                this.open = true;
            }
            /** Close the modal with an optional reason */ close(reason = 'programmatic') {
                const requestCloseEvent = new CustomEvent('vi-modal-close-request', {
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                    detail: {
                        reason
                    }
                });
                this.dispatchEvent(requestCloseEvent);
                if (!requestCloseEvent.defaultPrevented) {
                    this._closeReason = reason;
                    this.open = false;
                }
            }
            _requestClose(reason) {
                const requestCloseEvent = new CustomEvent('vi-modal-close-request', {
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                    detail: {
                        reason
                    }
                });
                this.dispatchEvent(requestCloseEvent);
                if (!requestCloseEvent.defaultPrevented) {
                    if (this.persistent) {
                        this._shakeDialog();
                    } else {
                        // Use an internal flag or just skip dispatching request-close again inside close()
                        // For simplicity, we can just let close() dispatch it again, or we can inline the close logic.
                        // Actually, close() dispatches it too. Let's just avoid duplicate events by setting internal open directly,
                        // or bypass the public close() event dispatch.
                        // Wait, the tests expect exactly one event? Let's check `close()`.
                        this._closeReason = reason;
                        this.open = false;
                    }
                }
            }
            _handleCancel(e) {
                e.preventDefault();
                this._requestClose('escape');
            }
            _handleBackdropClick(_e) {
                this._requestClose('backdrop');
            }
            _handleNativeClose() {
                this.open = false;
            }
            _handleDialogMouseDown(e) {
                if (e.target === this._dialog) {
                    this._dialog.dataset.clickedOnBackdrop = 'true';
                }
            }
            _handleDialogClick(e) {
                if (e.target === this._dialog && this._dialog.dataset.clickedOnBackdrop === 'true') {
                    this._requestClose('backdrop');
                }
                delete this._dialog.dataset.clickedOnBackdrop;
            }
            render() {
                const activeSize = this._maximized ? 'fullscreen' : this.size;
                const classes = {
                    'modal-variant-drawer': this.variant === 'drawer',
                    [`placement-${this.drawerPlacement}`]: this.variant === 'drawer',
                    'modal-variant-alert': this.variant === 'alert',
                    [`modal-size-${activeSize}`]: this.variant === 'default',
                    [`modal-position-${this.position}`]: this.position !== 'center' && this.variant === 'default',
                    'modal-scrollable-false': !this.scrollable,
                    'is-maximized': this._maximized,
                    'is-draggable': this.draggable,
                    'is-resizable': this.resizable
                };
                return b`
      ${this.open && !this.noBackdrop ? b`
            <div
              class="modal-backdrop"
              @click=${this._handleBackdropClick}
              style=${o(this._overlayZIndex !== null ? `z-index: ${this._overlayZIndex}` : undefined)}
            ></div>
          ` : ''}
      <dialog
        part="dialog"
        class=${e$1(classes)}
        ?open=${this.open}
        role=${this.variant === 'alert' ? 'alertdialog' : 'dialog'}
        @cancel=${this._handleCancel}
        @close=${this._handleNativeClose}
        @mousedown=${this._handleDialogMouseDown}
        @click=${this._handleDialogClick}
        aria-modal=${this.noBackdrop ? A : 'true'}
        aria-label=${o(this.getAttribute('aria-label') || undefined)}
        aria-labelledby=${o(this.getAttribute('aria-label') ? undefined : this.getAttribute('aria-labelledby') || 'vi-modal-header-slot')}
        aria-describedby=${o(this.getAttribute('aria-describedby') || this._bodyId)}
        style=${o(this._overlayZIndex !== null ? `z-index: ${this._overlayZIndex + 1}` : undefined)}
      >
        ${this._renderResizeHandles()}
        <slot name="header" id="vi-modal-header-slot"></slot>

        <div part="body" id=${this._bodyId} class="modal-body">
          <slot></slot>
        </div>

        <slot name="footer"></slot>
      </dialog>
    `;
            }
        }
    }
}();

const styles$1 = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.modal-dialog{border:none;color:inherit;display:none;background-color:var(--vi-modal-bg, var(--vi-color-background, #ffffff));border-radius:var(--vi-modal-border-radius, var(--vi-border-radius-lg, 8px));box-shadow:var(--vi-modal-shadow, var(--vi-shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, .05), 0 25px 50px -12px rgba(0, 0, 0, .15)));padding:0;margin:auto;width:100%;max-width:var(--vi-modal-max-width-md, 520px);max-height:90vh;max-height:90dvh;z-index:var(--vi-modal-z-index, 1050);font-family:var(--vi-modal-font-family, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));font-size:var(--vi-modal-font-size, var(--vi-font-size-base, .875rem));line-height:var(--vi-modal-line-height, var(--vi-line-height-normal, 1.5715));color:var(--vi-text-primary, #111827)}.modal-dialog[open]{display:flex;flex-direction:column;animation:vi-modal-enter var(--vi-modal-animation-duration, .2s) ease-out}.modal-dialog::backdrop{background-color:var(--vi-modal-backdrop-bg, rgba(0, 0, 0, .5))}.modal-header{display:flex;align-items:center;justify-content:space-between;padding:var(--vi-modal-header-padding, var(--vi-spacing-md, 1rem) var(--vi-spacing-lg, 1.5rem));flex-shrink:0}.modal-dialog.is-draggable .modal-header{cursor:move;-webkit-user-select:none;user-select:none}.modal-title{font-size:var(--vi-font-size-lg, 1rem);font-weight:var(--vi-font-weight-semibold, 600);margin:0}.modal-header-actions{display:flex;align-items:center;gap:var(--vi-spacing-xs, .5rem)}.modal-body{padding:var(--vi-modal-body-padding, var(--vi-spacing-lg, 1.5rem));flex-grow:1;overflow-y:auto}.modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:var(--vi-spacing-sm, .75rem);padding:var(--vi-modal-footer-padding, var(--vi-spacing-xs, .5rem) var(--vi-spacing-md, 1rem));background-color:var(--vi-modal-footer-bg, var(--vi-layer-02, #f3f4f6));border-top:1px solid var(--vi-modal-footer-border-color, var(--vi-border-02, #eeeeee));flex-shrink:0}.modal-variant-drawer{margin:0;max-height:none;height:100vh;height:100dvh;max-width:none;width:var(--vi-modal-drawer-width, 480px);border-radius:0}.modal-variant-drawer.placement-right{margin-left:auto}.modal-variant-drawer.placement-right[open]{animation:vi-modal-drawer-enter-right var(--vi-modal-animation-duration, .2s) ease-out}.modal-variant-drawer.placement-left{margin-right:auto}.modal-variant-drawer.placement-left[open]{animation:vi-modal-drawer-enter-left var(--vi-modal-animation-duration, .2s) ease-out}.modal-variant-alert{flex-direction:row;padding:var(--vi-modal-body-padding, var(--vi-spacing-lg, 1.5rem));max-width:var(--vi-modal-max-width-sm, 480px)}.modal-variant-alert .modal-alert-icon{flex-shrink:0;margin-right:var(--vi-spacing-md, 1rem);display:flex;align-items:flex-start;padding-top:2px}.modal-variant-alert .modal-alert-content{flex-grow:1;display:flex;flex-direction:column}.modal-variant-alert .modal-alert-content .modal-header{padding:0;margin-bottom:var(--vi-spacing-xs, .5rem)}.modal-variant-alert .modal-alert-content .modal-body{padding:0;margin-bottom:var(--vi-spacing-sm, .75rem)}.modal-variant-alert .modal-alert-content .modal-footer{padding:0;background:transparent;border-top:none;margin-top:auto}.modal-variant-alert[open]{animation:vi-modal-alert-enter var(--vi-modal-animation-duration, .2s) cubic-bezier(.175,.885,.32,1.275)}.modal-size-xs{max-width:var(--vi-modal-max-width-xs, 320px)}.modal-size-sm{max-width:var(--vi-modal-max-width-sm, 480px)}.modal-size-md{max-width:var(--vi-modal-max-width-md, 520px)}.modal-size-lg{max-width:var(--vi-modal-max-width-lg, 800px)}.modal-size-xl{max-width:var(--vi-modal-max-width-xl, 960px)}.modal-size-fullscreen{max-width:none;width:100vw;width:100dvw;max-height:none;height:100vh;height:100dvh;border-radius:0;margin:0}.modal-size-full-width{max-width:none;width:100vw;width:100dvw;border-radius:0;margin-left:0;margin-right:0}.modal-scrollable-false .modal-body{overflow-y:visible}@keyframes vi-modal-enter{0%{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}@keyframes vi-modal-drawer-enter-right{0%{transform:translate(100%)}to{transform:translate(0)}}@keyframes vi-modal-drawer-enter-left{0%{transform:translate(-100%)}to{transform:translate(0)}}@keyframes vi-modal-alert-enter{0%{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}@media(prefers-reduced-motion:reduce){.modal-dialog[open]{animation:none!important}}@media(max-width:639px){.modal-dialog:not(.modal-variant-drawer){max-width:100vw!important;width:100vw!important;width:100dvw!important;max-height:100vh!important;max-height:100dvh!important;height:100vh!important;height:100dvh!important;border-radius:0!important;margin:0!important;transform:none!important}.modal-header,.modal-body,.modal-footer{padding:var(--vi-spacing-md, 1rem)}}}:host{display:block}.modal-description{margin:var(--vi-spacing-xs, .5rem) 0 0 0;font-size:var(--vi-font-size-sm, .8125rem);color:var(--vi-text-secondary, #4b5563);font-weight:var(--vi-font-weight-normal, 400)}.modal-header-content{flex-grow:1;display:flex;flex-direction:column}.modal-header--alert{display:flex;align-items:center;justify-content:flex-start;gap:var(--vi-spacing-sm, .75rem)}.modal-header--alert .modal-alert-icon{display:flex;align-items:center;justify-content:center;margin:0;padding:0;width:var(--vi-icon-size-md, 1.5rem);height:var(--vi-icon-size-md, 1.5rem);font-size:var(--vi-icon-size-md, 1.5rem)}:host([alert-variant=danger]) .modal-alert-icon{color:var(--vi-color-error, #ef4444)}:host([alert-variant=warning]) .modal-alert-icon{color:var(--vi-color-warning, #ffba00)}:host([alert-variant=success]) .modal-alert-icon{color:var(--vi-color-success, #489167)}:host([alert-variant=info]) .modal-alert-icon,:host(:not([alert-variant])) .modal-alert-icon{color:var(--vi-color-info, #3676d0)}";

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
var _dec$1, _initClass$1, _LitElement$1, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, /** Title text (or use default slot for complex HTML) */ _init_title, /** Header description text */ _init_description, /** Whether to show a close "X" button */ _init_closable, /** Whether to show a maximize/restore button */ _init_maximizable, /** Current maximized state (bound by parent modal if needed, or visual only) */ _init_maximized, /** Custom icon name for alert variants */ _init_icon, /** Semantic alert variant to color the icon */ _init_alertVariant, /** Close button label for screen readers */ _init_closeLabel, /** Accessible label for the maximize button */ _init_maximizeLabel, /** Accessible label for the restore button */ _init_restoreLabel, _initProto;
registerIcons([
    checkCircleIcon,
    triangleWarningIcon,
    infoIcon,
    xIcon,
    arrowsMaximizeIcon,
    arrowsMinimizeIcon
]);
let _ViModalHeader;
_dec$1 = t('vi-modal-header'), _dec1 = n(), _dec2 = n(), _dec3 = n({
    type: Boolean
}), _dec4 = n({
    type: Boolean
}), _dec5 = n({
    type: Boolean
}), _dec6 = n(), _dec7 = n({
    attribute: 'alert-variant'
}), _dec8 = n({
    attribute: 'close-label'
}), _dec9 = n({
    attribute: 'maximize-label'
}), _dec10 = n({
    attribute: 'restore-label'
});
new class extends _identity$1 {
    constructor(){
        super(_ViModalHeader), _initClass$1();
    }
    static{
        class ViModalHeader extends (_LitElement$1 = i$1) {
            static{
                ({ e: [_init_title, _init_description, _init_closable, _init_maximizable, _init_maximized, _init_icon, _init_alertVariant, _init_closeLabel, _init_maximizeLabel, _init_restoreLabel, _initProto], c: [_ViModalHeader, _initClass$1] } = _apply_decs_2203_r$1(this, [
                    [
                        _dec1,
                        1,
                        "title"
                    ],
                    [
                        _dec2,
                        1,
                        "description"
                    ],
                    [
                        _dec3,
                        1,
                        "closable"
                    ],
                    [
                        _dec4,
                        1,
                        "maximizable"
                    ],
                    [
                        _dec5,
                        1,
                        "maximized"
                    ],
                    [
                        _dec6,
                        1,
                        "icon"
                    ],
                    [
                        _dec7,
                        1,
                        "alertVariant"
                    ],
                    [
                        _dec8,
                        1,
                        "closeLabel"
                    ],
                    [
                        _dec9,
                        1,
                        "maximizeLabel"
                    ],
                    [
                        _dec10,
                        1,
                        "restoreLabel"
                    ]
                ], [
                    _dec$1
                ], _LitElement$1));
            }
            static styles = r$1(styles$1);
            #___private_title_1 = (_initProto(this), _init_title(this, ''));
            get title() {
                return this.#___private_title_1;
            }
            set title(_v) {
                this.#___private_title_1 = _v;
            }
            #___private_description_2 = _init_description(this, '');
            get description() {
                return this.#___private_description_2;
            }
            set description(_v) {
                this.#___private_description_2 = _v;
            }
            #___private_closable_3 = _init_closable(this, false);
            get closable() {
                return this.#___private_closable_3;
            }
            set closable(_v) {
                this.#___private_closable_3 = _v;
            }
            #___private_maximizable_4 = _init_maximizable(this, false);
            get maximizable() {
                return this.#___private_maximizable_4;
            }
            set maximizable(_v) {
                this.#___private_maximizable_4 = _v;
            }
            #___private_maximized_5 = _init_maximized(this, false);
            get maximized() {
                return this.#___private_maximized_5;
            }
            set maximized(_v) {
                this.#___private_maximized_5 = _v;
            }
            #___private_icon_6 = _init_icon(this, undefined);
            get icon() {
                return this.#___private_icon_6;
            }
            set icon(_v) {
                this.#___private_icon_6 = _v;
            }
            #___private_alertVariant_7 = _init_alertVariant(this, undefined);
            get alertVariant() {
                return this.#___private_alertVariant_7;
            }
            set alertVariant(_v) {
                this.#___private_alertVariant_7 = _v;
            }
            #___private_closeLabel_8 = _init_closeLabel(this, 'Close modal');
            get closeLabel() {
                return this.#___private_closeLabel_8;
            }
            set closeLabel(_v) {
                this.#___private_closeLabel_8 = _v;
            }
            #___private_maximizeLabel_9 = _init_maximizeLabel(this, 'Maximize modal');
            get maximizeLabel() {
                return this.#___private_maximizeLabel_9;
            }
            set maximizeLabel(_v) {
                this.#___private_maximizeLabel_9 = _v;
            }
            #___private_restoreLabel_10 = _init_restoreLabel(this, 'Restore modal');
            get restoreLabel() {
                return this.#___private_restoreLabel_10;
            }
            set restoreLabel(_v) {
                this.#___private_restoreLabel_10 = _v;
            }
            get _defaultIcon() {
                if (this.icon) return this.icon;
                switch(this.alertVariant){
                    case 'success':
                        return 'check-circle';
                    case 'warning':
                    case 'danger':
                        return 'triangle-warning';
                    case 'info':
                        return 'info';
                    default:
                        return undefined;
                }
            }
            _handleClose(e) {
                e.stopPropagation();
                this.dispatchEvent(new CustomEvent('vi-modal-close-request', {
                    bubbles: true,
                    composed: true
                }));
            }
            _handleMaximize(e) {
                e.stopPropagation();
                this.dispatchEvent(new CustomEvent('vi-modal-maximize-request', {
                    bubbles: true,
                    composed: true
                }));
            }
            render() {
                const isAlert = !!this.alertVariant || !!this.icon;
                const headerClasses = {
                    'modal-header': true,
                    'modal-header--alert': isAlert
                };
                return b`
      <header part="header" class=${e$1(headerClasses)}>
        ${isAlert ? b`
              <div part="icon" class="modal-alert-icon">
                <slot name="icon">
                  <vi-icon name=${o(this._defaultIcon)} aria-hidden="true"></vi-icon>
                </slot>
              </div>
            ` : ''}

        <div class="modal-header-content">
          <slot>
            <span part="title" class="modal-title">${this.title}</span>
          </slot>
          ${this.description ? b`<p part="description" class="modal-description">${this.description}</p>` : ''}
        </div>

        ${this.closable || this.maximizable ? b`
              <div part="actions" class="modal-header-actions">
                ${this.maximizable ? b`
                      <vi-button
                        part="maximize-btn"
                        variant="ghost"
                        size="sm"
                        icon-only
                        @click=${this._handleMaximize}
                        aria-label=${this.maximized ? this.restoreLabel : this.maximizeLabel}
                      >
                        <vi-icon
                          name=${this.maximized ? 'arrows-minimize' : 'arrows-maximize'}
                          slot="icon"
                        ></vi-icon>
                      </vi-button>
                    ` : ''}
                ${this.closable ? b`
                      <vi-button
                        part="close-btn"
                        variant="ghost"
                        size="sm"
                        icon-only
                        @click=${this._handleClose}
                        aria-label=${this.closeLabel}
                      >
                        <vi-icon name="x" slot="icon"></vi-icon>
                      </vi-button>
                    ` : ''}
              </div>
            ` : ''}
      </header>
    `;
            }
        }
    }
}();

const styles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.modal-dialog{border:none;color:inherit;display:none;background-color:var(--vi-modal-bg, var(--vi-color-background, #ffffff));border-radius:var(--vi-modal-border-radius, var(--vi-border-radius-lg, 8px));box-shadow:var(--vi-modal-shadow, var(--vi-shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, .05), 0 25px 50px -12px rgba(0, 0, 0, .15)));padding:0;margin:auto;width:100%;max-width:var(--vi-modal-max-width-md, 520px);max-height:90vh;max-height:90dvh;z-index:var(--vi-modal-z-index, 1050);font-family:var(--vi-modal-font-family, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));font-size:var(--vi-modal-font-size, var(--vi-font-size-base, .875rem));line-height:var(--vi-modal-line-height, var(--vi-line-height-normal, 1.5715));color:var(--vi-text-primary, #111827)}.modal-dialog[open]{display:flex;flex-direction:column;animation:vi-modal-enter var(--vi-modal-animation-duration, .2s) ease-out}.modal-dialog::backdrop{background-color:var(--vi-modal-backdrop-bg, rgba(0, 0, 0, .5))}.modal-header{display:flex;align-items:center;justify-content:space-between;padding:var(--vi-modal-header-padding, var(--vi-spacing-md, 1rem) var(--vi-spacing-lg, 1.5rem));flex-shrink:0}.modal-dialog.is-draggable .modal-header{cursor:move;-webkit-user-select:none;user-select:none}.modal-title{font-size:var(--vi-font-size-lg, 1rem);font-weight:var(--vi-font-weight-semibold, 600);margin:0}.modal-header-actions{display:flex;align-items:center;gap:var(--vi-spacing-xs, .5rem)}.modal-body{padding:var(--vi-modal-body-padding, var(--vi-spacing-lg, 1.5rem));flex-grow:1;overflow-y:auto}.modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:var(--vi-spacing-sm, .75rem);padding:var(--vi-modal-footer-padding, var(--vi-spacing-xs, .5rem) var(--vi-spacing-md, 1rem));background-color:var(--vi-modal-footer-bg, var(--vi-layer-02, #f3f4f6));border-top:1px solid var(--vi-modal-footer-border-color, var(--vi-border-02, #eeeeee));flex-shrink:0}.modal-variant-drawer{margin:0;max-height:none;height:100vh;height:100dvh;max-width:none;width:var(--vi-modal-drawer-width, 480px);border-radius:0}.modal-variant-drawer.placement-right{margin-left:auto}.modal-variant-drawer.placement-right[open]{animation:vi-modal-drawer-enter-right var(--vi-modal-animation-duration, .2s) ease-out}.modal-variant-drawer.placement-left{margin-right:auto}.modal-variant-drawer.placement-left[open]{animation:vi-modal-drawer-enter-left var(--vi-modal-animation-duration, .2s) ease-out}.modal-variant-alert{flex-direction:row;padding:var(--vi-modal-body-padding, var(--vi-spacing-lg, 1.5rem));max-width:var(--vi-modal-max-width-sm, 480px)}.modal-variant-alert .modal-alert-icon{flex-shrink:0;margin-right:var(--vi-spacing-md, 1rem);display:flex;align-items:flex-start;padding-top:2px}.modal-variant-alert .modal-alert-content{flex-grow:1;display:flex;flex-direction:column}.modal-variant-alert .modal-alert-content .modal-header{padding:0;margin-bottom:var(--vi-spacing-xs, .5rem)}.modal-variant-alert .modal-alert-content .modal-body{padding:0;margin-bottom:var(--vi-spacing-sm, .75rem)}.modal-variant-alert .modal-alert-content .modal-footer{padding:0;background:transparent;border-top:none;margin-top:auto}.modal-variant-alert[open]{animation:vi-modal-alert-enter var(--vi-modal-animation-duration, .2s) cubic-bezier(.175,.885,.32,1.275)}.modal-size-xs{max-width:var(--vi-modal-max-width-xs, 320px)}.modal-size-sm{max-width:var(--vi-modal-max-width-sm, 480px)}.modal-size-md{max-width:var(--vi-modal-max-width-md, 520px)}.modal-size-lg{max-width:var(--vi-modal-max-width-lg, 800px)}.modal-size-xl{max-width:var(--vi-modal-max-width-xl, 960px)}.modal-size-fullscreen{max-width:none;width:100vw;width:100dvw;max-height:none;height:100vh;height:100dvh;border-radius:0;margin:0}.modal-size-full-width{max-width:none;width:100vw;width:100dvw;border-radius:0;margin-left:0;margin-right:0}.modal-scrollable-false .modal-body{overflow-y:visible}@keyframes vi-modal-enter{0%{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}@keyframes vi-modal-drawer-enter-right{0%{transform:translate(100%)}to{transform:translate(0)}}@keyframes vi-modal-drawer-enter-left{0%{transform:translate(-100%)}to{transform:translate(0)}}@keyframes vi-modal-alert-enter{0%{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}@media(prefers-reduced-motion:reduce){.modal-dialog[open]{animation:none!important}}@media(max-width:639px){.modal-dialog:not(.modal-variant-drawer){max-width:100vw!important;width:100vw!important;width:100dvw!important;max-height:100vh!important;max-height:100dvh!important;height:100vh!important;height:100dvh!important;border-radius:0!important;margin:0!important;transform:none!important}.modal-header,.modal-body,.modal-footer{padding:var(--vi-spacing-md, 1rem)}}}:host{display:block;width:100%;flex-shrink:0}";

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
var _dec, _initClass, _LitElement;
let _ViModalFooter;
_dec = t('vi-modal-footer');
new class extends _identity {
    constructor(){
        super(_ViModalFooter), _initClass();
    }
    static{
        class ViModalFooter extends (_LitElement = i$1) {
            static{
                ({ c: [_ViModalFooter, _initClass] } = _apply_decs_2203_r(this, [], [
                    _dec
                ], _LitElement));
            }
            static styles = r$1(styles);
            render() {
                return b`
      <footer part="footer" class="modal-footer">
        <slot></slot>
      </footer>
    `;
            }
        }
    }
}();

const meta = {
    title: 'Components/Modal',
    tags: [
        'autodocs'
    ],
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'default',
                'drawer',
                'alert'
            ],
            description: 'The layout variant of the modal.'
        },
        size: {
            control: 'select',
            options: [
                'xs',
                'sm',
                'md',
                'lg',
                'xl',
                'full-width',
                'fullscreen'
            ],
            description: 'The size of the modal (for default variant).'
        },
        alertVariant: {
            name: 'alert-variant',
            control: 'select',
            options: [
                'info',
                'success',
                'warning',
                'danger'
            ],
            description: 'Icon and color context for the alert variant.'
        },
        drawerPlacement: {
            name: 'drawer-placement',
            control: 'radio',
            options: [
                'right',
                'left'
            ],
            description: 'Side for the drawer to slide in from.'
        },
        open: {
            control: 'boolean',
            description: 'Controls the visibility of the modal.'
        },
        closable: {
            control: 'boolean',
            description: 'Show the × close button in the header.'
        },
        persistent: {
            control: 'boolean',
            description: 'Prevent closing on Escape key and backdrop clicks.'
        },
        maximizable: {
            control: 'boolean',
            description: 'Show maximize toggle in header.'
        },
        draggable: {
            control: 'boolean',
            description: 'Allow dragging modal by the header.'
        },
        position: {
            control: 'select',
            options: [
                'center',
                'top',
                'bottom',
                'left',
                'right',
                'top-left',
                'top-right',
                'bottom-left',
                'bottom-right'
            ],
            description: 'Position of the modal on the screen.'
        },
        autofocus: {
            control: 'boolean',
            description: 'Focus first element on open.'
        },
        scrollable: {
            name: 'scrollable',
            control: 'boolean',
            description: 'Allows the body to scroll while keeping the header/footer fixed.'
        },
        scrollStrategy: {
            control: 'radio',
            options: [
                'block',
                'noop'
            ],
            description: 'Scroll strategy when the modal is open',
            table: {
                defaultValue: {
                    summary: 'block'
                }
            }
        },
        dragContainment: {
            name: 'drag-containment',
            control: 'radio',
            options: [
                'none',
                'viewport',
                'parent'
            ],
            description: 'Clamp drag movement: `none` = unconstrained, `viewport` = stays in viewport, `parent` = stays in offset parent.'
        }
    }
};
// Helper to open a modal by ID
const openModal = (id)=>{
    const modal = document.getElementById(id);
    if (modal) modal.show();
};
// Helper to close a modal by ID
const closeModal = (id)=>{
    const modal = document.getElementById(id);
    if (modal) modal.close();
};
const Default = {
    args: {
        variant: 'default',
        size: 'md',
        position: 'center',
        closable: true,
        persistent: false,
        maximizable: false,
        draggable: false,
        autofocus: true,
        scrollable: true
    },
    render: (args)=>b`
    <vi-button @click=${()=>openModal('modal-default')}>Open Modal</vi-button>
    <vi-modal
      id="modal-default"
      variant=${args.variant}
      size=${args.size}
      position=${args.position}
      ?persistent=${args.persistent}
      ?draggable=${args.draggable}
      ?autofocus=${args.autofocus}
      ?scrollable=${args.scrollable}
    >
      <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Default Modal</vi-modal-header>
      <p>
        This is the default modal content. It acts as a standard dialog for
        forms and general information.
      </p>
      <vi-modal-footer slot="footer">
        <vi-button variant="ghost" @click=${()=>closeModal('modal-default')}
          >Cancel</vi-button
        >
        <vi-button variant="primary" @click=${()=>closeModal('modal-default')}
          >Save</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `
};
const Sizes = {
    render: (args)=>b`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      ${[
            'xs',
            'sm',
            'md',
            'lg',
            'xl',
            'full-width',
            'fullscreen'
        ].map((size)=>b`
          <vi-button @click=${()=>openModal(`modal-size-${size}`)}
            >Size: ${size}</vi-button
          >
          <vi-modal id="modal-size-${size}" size=${size}>
            <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Modal Size: ${size}</vi-modal-header>
            <p>This modal is rendered with size <strong>${size}</strong>.</p>
            <vi-modal-footer slot="footer">
              <vi-button @click=${()=>closeModal(`modal-size-${size}`)}
                >Close</vi-button
              >
            </vi-modal-footer>
          </vi-modal>
        `)}
    </div>
  `
};
const Drawer = {
    args: {
        drawerPlacement: 'right'
    },
    render: (args)=>b`
    <vi-button @click=${()=>openModal('modal-drawer')}>Open Drawer</vi-button>
    <vi-modal
      id="modal-drawer"
      variant="drawer"
      drawer-placement=${args.drawerPlacement}
    >
      <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Drawer Variant</vi-modal-header>
      <p>
        Drawers slide in from the edge of the screen and take up the full
        viewport height.
      </p>
      <p>
        They are useful for detailed records, audit trails, and configuration
        settings.
      </p>
      <vi-modal-footer slot="footer">
        <vi-button variant="primary" @click=${()=>closeModal('modal-drawer')}
          >Submit</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `
};
const Alert = {
    args: {
        alertVariant: 'danger',
        persistent: true
    },
    render: (args)=>b`
    <vi-button variant="danger" @click=${()=>openModal('modal-alert')}
      >Lock Data</vi-button
    >
    <vi-modal
      id="modal-alert"
      variant="alert"
      ?persistent=${args.persistent}
      size="sm"
    >
      <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Lock Data</vi-modal-header>
      <p>
        This action is <strong>irreversible</strong>. All forms will be locked
        for editing.
      </p>
      <p>Are you sure you want to lock this subject's data?</p>
      <vi-modal-footer slot="footer">
        <vi-button variant="ghost" @click=${()=>closeModal('modal-alert')}
          >Cancel</vi-button
        >
        <vi-button
          variant=${args.alertVariant === 'danger' ? 'danger' : 'primary'}
          @click=${()=>closeModal('modal-alert')}
          >Confirm Lock</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `
};
const ScrollableContent = {
    render: (args)=>b`
    <vi-button @click=${()=>openModal('modal-scroll')}
      >Open Scrollable Modal</vi-button
    >
    <vi-modal id="modal-scroll" size="md">
      <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Terms and Conditions</vi-modal-header>
      <div
        style="height: 1200px; padding: 1rem; background: repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #fafafa 10px, #fafafa 20px);"
      >
        <p>Tall content that requires scrolling...</p>
        <p style="margin-top: 1100px;">End of content.</p>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button variant="primary" @click=${()=>closeModal('modal-scroll')}
          >I Agree</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `
};
const ProgrammaticGuard = {
    name: 'Programmatic Guard (Prevent Close)',
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates listening to `vi-modal-close-request` to prevent the modal from closing if there are unsaved changes. Cancel the event via `e.preventDefault()`.'
            }
        }
    },
    render: (args)=>{
        const handleRequestClose = (e1)=>{
            // Simulate form dirtiness
            const confirmed = window.confirm('You have unsaved changes. Are you sure you want to discard them?');
            if (!confirmed) {
                e1.preventDefault(); // Block the modal from closing
            }
        };
        return b`
      <vi-button @click=${()=>openModal('modal-guard')}
        >Open Form Modal</vi-button
      >
      <vi-modal
        id="modal-guard"
        size="sm"
        @vi-modal-close-request=${handleRequestClose}
      >
        <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Edit Record</vi-modal-header>
        <vi-input placeholder="Type something..."></vi-input>
        <p style="margin-top: 1rem; color: #666; font-size: 0.875rem;">
          Try clicking outside or pressing Escape. A browser confirm dialog will
          guard the close action.
        </p>
        <vi-modal-footer slot="footer">
          <vi-button variant="ghost" @click=${()=>closeModal('modal-guard')}
            >Cancel</vi-button
          >
          <vi-button
            variant="primary"
            @click=${()=>{
            // Force close without firing request-close (simulates successful save)
            const modal = document.getElementById('modal-guard');
            if (modal) {
                modal.open = false; // Programmatically resetting open property bypasses the guard check
            }
        }}
            >Save</vi-button
          >
        </vi-modal-footer>
      </vi-modal>
    `;
    }
};
const DraggableAndMaximizable = {
    render: (args)=>b`
    <vi-button @click=${()=>openModal('modal-drag-max')}
      >Open Draggable Modal</vi-button
    >
    <vi-modal id="modal-drag-max" size="md" draggable>
      <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} maximizable>Interactive Modal</vi-modal-header>
      <p>Drag me by the header, or click the maximize button!</p>
      <div style="margin-top: 1rem;">
        <vi-input placeholder="Try typing..."></vi-input>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button @click=${()=>closeModal('modal-drag-max')}
          >Close</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `
};
const Positioning = {
    render: (args)=>b`
    <div
      style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;"
    >
      ${[
            'top-left',
            'top',
            'top-right',
            'left',
            'center',
            'right',
            'bottom-left',
            'bottom',
            'bottom-right'
        ].map((pos)=>b`
          <vi-button @click=${()=>openModal(`modal-pos-${pos}`)}
            >${pos}</vi-button
          >
          <vi-modal id="modal-pos-${pos}" position=${pos} size="sm">
            <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Position: ${pos}</vi-modal-header>
            <p>This modal appears at ${pos}.</p>
            <vi-modal-footer slot="footer">
              <vi-button @click=${()=>closeModal(`modal-pos-${pos}`)}
                >Close</vi-button
              >
            </vi-modal-footer>
          </vi-modal>
        `)}
    </div>
  `
};
const ZIndexStacking = {
    render: (args)=>{
        return b`
      <div style="padding: 24px; min-height: 400px;">
        <vi-button
          @click=${()=>document.getElementById('stacking-modal-1')?.setAttribute('open', 'true')}
        >
          Open Stacking Modal 1
        </vi-button>

        <vi-modal id="stacking-modal-1" size="lg" closable>
          <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Stacking Modal 1 (Base)</vi-modal-header>

          <div style="padding: 16px; min-height: 300px;">
            <p style="margin-bottom: 24px;">
              This modal tests the OverlayManager. Modals are now appended to
              body, and their z-index is managed explicitly.
            </p>

            <div style="margin-bottom: 24px;">
              <vi-combobox
                hoist
                placeholder="Select an option (Hoisted)"
                .options=${[
            {
                value: '1',
                label: 'Option 1'
            },
            {
                value: '2',
                label: 'Option 2'
            }
        ]}
              >
              </vi-combobox>
              <p style="font-size: 12px; color: #666; margin-top: 8px;">
                The combobox listbox is also teleported to the body via hoist,
                and given a higher z-index than the modal.
              </p>
            </div>

            <vi-button
              @click=${()=>document.getElementById('stacking-modal-2')?.setAttribute('open', 'true')}
            >
              Open Nested Modal 2
            </vi-button>
          </div>
        </vi-modal>

        <vi-modal id="stacking-modal-2" size="sm" closable>
          <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Nested Modal 2</vi-modal-header>

          <div style="padding: 16px;">
            <p>
              This modal should appear <strong>above</strong> Modal 1 and its
              backdrop should cover Modal 1.
            </p>
            <vi-button
              @click=${()=>document.getElementById('stacking-modal-2')?.removeAttribute('open')}
            >
              Close Me
            </vi-button>
          </div>
        </vi-modal>
      </div>
    `;
    }
};
const PersistentWithShake = {
    name: 'Persistent Modal (Shake on Dismiss)',
    parameters: {
        docs: {
            description: {
                story: `
Demonstrates the **shake animation** on a persistent modal.
When \`persistent\` is \`true\`, pressing **Escape** or clicking the **backdrop**
will not close the modal. Instead, the dialog shakes to signal "blocked" — 
matching the macOS alert dialog and MUI Dialog patterns.

The modal also dispatches a \`vi-modal-close-request\` event with \`detail.reason\`
so consumers can show a custom in-modal warning message instead.
        `
            }
        }
    },
    render: (args)=>{
        const handleRequestClose = (_e)=>{
            const modal = document.getElementById('modal-persistent-shake');
            const warning = modal?.querySelector('.shake-warning');
            if (!warning) return;
            warning.style.display = 'block';
            warning.animate([
                {
                    opacity: 0,
                    transform: 'translateY(-4px)'
                },
                {
                    opacity: 1,
                    transform: 'translateY(0)'
                }
            ], {
                duration: 200,
                fill: 'forwards'
            });
        };
        return b`
      <vi-button
        variant="danger"
        @click=${()=>openModal('modal-persistent-shake')}
      >
        Open Persistent Modal
      </vi-button>

      <vi-modal
        id="modal-persistent-shake"
        persistent
        closable=${false}
        size="sm"
        @vi-modal-close-request=${handleRequestClose}
      >
        <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>⚠️ Action Required</vi-modal-header>
        <div>
          <p>
            You <strong>must</strong> make a choice before dismissing this
            dialog.
          </p>
          <p style="color: #888; font-size: 0.875rem; margin-top: 0.5rem;">
            Try pressing
            <kbd
              style="background:#eee;padding:2px 6px;border-radius:4px;border:1px solid #ccc"
              >Escape</kbd
            >
            or clicking the backdrop — the modal will shake instead of closing.
          </p>
          <p
            class="shake-warning"
            style="display: none; margin-top: 1rem; padding: 0.75rem; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; font-size: 0.875rem; color: #856404;"
          >
            ⚠️ Please select an option below before closing.
          </p>
        </div>
        <div
          slot="footer"
          style="display: flex; gap: 0.5rem; justify-content: flex-end;"
        >
          <vi-button
            variant="ghost"
            @click=${()=>closeModal('modal-persistent-shake')}
          >
            Decline
          </vi-button>
          <vi-button
            variant="primary"
            @click=${()=>closeModal('modal-persistent-shake')}
          >
            Accept & Continue
          </vi-button>
        </div>
      </vi-modal>
    `;
    }
};
const CustomAnimations = {
    name: 'Custom Animations',
    parameters: {
        docs: {
            description: {
                story: `
Demonstrates how to customize the **enter** and **exit** animations using the \`enter-animation\` and \`exit-animation\` properties.
You can also adjust the animation duration with \`animation-duration\`.
        `
            }
        }
    },
    args: {
        enterAnimation: 'pop-in',
        exitAnimation: 'pop-out',
        animationDuration: 400
    },
    argTypes: {
        enterAnimation: {
            name: 'enter-animation',
            control: 'select',
            options: [
                'fade-in',
                'fade-in-up',
                'fade-in-down',
                'zoom-in',
                'scale-up',
                'pop-in',
                'slide-in-top',
                'slide-in-bottom',
                'slide-in-left',
                'slide-in-right',
                'none'
            ]
        },
        exitAnimation: {
            name: 'exit-animation',
            control: 'select',
            options: [
                'fade-out',
                'fade-out-down',
                'fade-out-up',
                'zoom-out',
                'scale-down',
                'pop-out',
                'slide-out-top',
                'slide-out-bottom',
                'slide-out-left',
                'slide-out-right',
                'none'
            ]
        },
        animationDuration: {
            name: 'animation-duration',
            control: {
                type: 'range',
                min: 100,
                max: 2000,
                step: 100
            }
        }
    },
    render: (args)=>b`
    <vi-button @click=${()=>openModal('modal-custom-animation')}>
      Open Animated Modal
    </vi-button>

    <vi-modal
      id="modal-custom-animation"
      enter-animation=${args.enterAnimation}
      exit-animation=${args.exitAnimation}
      animation-duration=${args.animationDuration}
    >
      <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Custom Animation</vi-modal-header>
      <div>
        <p>This modal is using custom enter and exit animations.</p>
        <ul style="margin-top: 1rem; margin-bottom: 1rem;">
          <li><strong>Enter:</strong> ${args.enterAnimation}</li>
          <li><strong>Exit:</strong> ${args.exitAnimation}</li>
          <li><strong>Duration:</strong> ${args.animationDuration}ms</li>
        </ul>
        <p>Try changing the controls below to see different effects!</p>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button @click=${()=>closeModal('modal-custom-animation')}>
          Close
        </vi-button>
      </vi-modal-footer>
    </vi-modal>
  `
};
const NoBackdrop = {
    name: 'No Backdrop (Floating Tool Window)',
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates a modeless floating tool window using `no-backdrop` and `draggable`. Background controls remain interactive.'
            }
        }
    },
    render: (args)=>b`
    <div style="padding: 1rem;">
      <vi-button @click=${()=>openModal('modal-no-backdrop')}>
        Open Floating Window
      </vi-button>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <vi-button variant="secondary"
          >Background Interactive Button 1</vi-button
        >
        <vi-button variant="outline">Background Interactive Button 2</vi-button>
      </div>
    </div>

    <vi-modal
      id="modal-no-backdrop"
      size="sm"
      draggable
      no-backdrop
      position="top-right"
    >
      <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Floating Inspector</vi-modal-header>
      <div>
        <p>This modal floats without a dark backdrop overlay.</p>
        <p style="margin-top: 0.5rem; color: #666; font-size: 0.875rem;">
          You can drag this panel around and click background controls while it
          is open.
        </p>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button size="sm" @click=${()=>closeModal('modal-no-backdrop')}>
          Close
        </vi-button>
      </vi-modal-footer>
    </vi-modal>
  `
};
const MultipleFloatingWindows = {
    name: 'Multiple Floating Modeless Modals',
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates multiple modeless floating panels (`no-backdrop` + `draggable`) open simultaneously. Each window can be dragged independently, layered on focus, and operated alongside background page controls.'
            }
        }
    },
    render: (args)=>b`
    <div
      style="padding: 1.5rem; min-height: 450px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; position: relative;"
    >
      <div
        style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; background: #ffffff; padding: 1rem; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);"
      >
        <vi-button
          variant="primary"
          size="sm"
          @click=${()=>openModal('modal-panel-1')}
        >
          Toggle Subject Inspector
        </vi-button>

        <vi-button
          variant="secondary"
          size="sm"
          @click=${()=>openModal('modal-panel-2')}
        >
          Toggle Filter Palette
        </vi-button>

        <vi-button
          variant="info"
          size="sm"
          @click=${()=>openModal('modal-panel-3')}
        >
          Toggle Live Metrics
        </vi-button>
      </div>

      <div
        style="background: #ffffff; padding: 1.25rem; border-radius: 6px; border: 1px solid #cbd5e1;"
      >
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #0f172a;">
          Background EDC Data Workspace
        </h4>
        <p style="margin: 0 0 1rem 0; color: #64748b; font-size: 0.875rem;">
          Click the buttons above to open multiple modeless windows. Drag each
          window by its header, interact with background inputs/buttons below,
          or layer windows on focus.
        </p>
        <div style="display: flex; gap: 1rem;">
          <vi-button variant="outline" size="sm"
            >Background Export CSV</vi-button
          >
          <vi-button variant="ghost" size="sm"
            >Background Refresh Data</vi-button
          >
        </div>
      </div>
    </div>

    <!-- Window 1: Subject Inspector -->
    <vi-modal
      id="modal-panel-1"
      open
      size="xs"
      draggable
      no-backdrop
      position="top-left"
    >
      <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Subject Inspector</vi-modal-header>
      <div>
        <p style="margin: 0; font-size: 0.875rem; color: #334155;">
          <strong>Subject ID:</strong> SUBJ-0042
        </p>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #64748b;">
          Status: Enrolled (Site 101)
        </p>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button
          size="xs"
          variant="ghost"
          @click=${()=>closeModal('modal-panel-1')}
        >
          Close Inspector
        </vi-button>
      </vi-modal-footer>
    </vi-modal>

    <!-- Window 2: Filter Palette -->
    <vi-modal
      id="modal-panel-2"
      open
      size="xs"
      draggable
      no-backdrop
      position="center"
    >
      <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Filter Palette</vi-modal-header>
      <div>
        <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #334155;">
          Active Filter Options:
        </p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <vi-tag size="xs" selectable selected variant="primary"
            >Screened</vi-tag
          >
          <vi-tag size="xs" selectable variant="warning">Pending</vi-tag>
          <vi-tag size="xs" selectable variant="success">Completed</vi-tag>
        </div>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button
          size="xs"
          variant="ghost"
          @click=${()=>closeModal('modal-panel-2')}
        >
          Close Palette
        </vi-button>
      </vi-modal-footer>
    </vi-modal>

    <!-- Window 3: Live Metrics -->
    <vi-modal
      id="modal-panel-3"
      open
      size="xs"
      draggable
      no-backdrop
      position="top-right"
    >
      <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Live Metrics</vi-modal-header>
      <div>
        <p style="margin: 0; font-size: 0.875rem; color: #334155;">
          <strong>Sync Latency:</strong> 12ms
        </p>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #64748b;">
          Queries Pending: 3
        </p>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button
          size="xs"
          variant="ghost"
          @click=${()=>closeModal('modal-panel-3')}
        >
          Close Metrics
        </vi-button>
      </vi-modal-footer>
    </vi-modal>
  `
};
// ─────────────────────────────────────────────────────────────────────────────
// Resizable & Draggable
// ─────────────────────────────────────────────────────────────────────────────
const ResizableModal = {
    name: 'Resizable & Draggable',
    parameters: {
        docs: {
            description: {
                story: 'Combine `draggable`, `resizable`, and `maximizable` for a fully window-like experience. ' + 'Resize from any of the 8 edge/corner handles. Handles automatically hide when maximized.'
            }
        }
    },
    render: (args)=>b`
    <vi-button @click=${()=>openModal('modal-resizable')}
      >Open Resizable Modal</vi-button
    >
    <vi-modal id="modal-resizable" size="md" draggable resizable>
      <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} maximizable>Window Panel</vi-modal-header>
      <p>
        This modal can be dragged by its header and resized from any of its 8
        edges and corners.
      </p>
      <p style="color: #64748b; font-size: 0.875rem; margin-top: 0.5rem;">
        Try dragging the bottom-right corner to resize, then click maximize —
        resize handles will automatically hide.
      </p>
      <vi-modal-footer slot="footer">
        <vi-button variant="ghost" @click=${()=>closeModal('modal-resizable')}
          >Cancel</vi-button
        >
        <vi-button
          variant="primary"
          @click=${()=>closeModal('modal-resizable')}
          >Save</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `
};
// ─────────────────────────────────────────────────────────────────────────────
// Drag Containment — viewport clamping
// ─────────────────────────────────────────────────────────────────────────────
const ContainedDrag = {
    name: 'Drag Containment (Viewport)',
    parameters: {
        docs: {
            description: {
                story: 'Use `drag-containment="viewport"` to prevent the modal from being dragged off-screen. ' + 'The modal will be clamped to the viewport boundary on all sides.'
            }
        }
    },
    render: (args)=>b`
    <vi-button @click=${()=>openModal('modal-contained')}
      >Open Contained Draggable</vi-button
    >
    <vi-modal
      id="modal-contained"
      size="sm"
      draggable
      drag-containment="viewport"
    >
      <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Contained Draggable</vi-modal-header>
      <p>
        Try dragging this modal to the edge of the viewport — it will stop at
        the boundary and cannot go off-screen.
      </p>
      <p style="color: #64748b; font-size: 0.875rem; margin-top: 0.5rem;">
        <code>drag-containment="viewport"</code>
      </p>
      <vi-modal-footer slot="footer">
        <vi-button @click=${()=>closeModal('modal-contained')}
          >Close</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `
};
// ─────────────────────────────────────────────────────────────────────────────
// Custom append-to container
// ─────────────────────────────────────────────────────────────────────────────
const CustomAppendTo = {
    name: 'Custom append-to Container',
    parameters: {
        docs: {
            description: {
                story: 'Use the `append-to` attribute to teleport the modal into a specific container element ' + 'instead of `document.body`. Useful for scoped stacking contexts (e.g., a full-screen app shell). ' + 'Inspect the DOM after opening — the modal will be inside `#custom-portal`, not `body`.'
            }
        }
    },
    render: (args)=>b`
    <div
      id="custom-portal"
      style="
        position: relative;
        min-height: 400px;
        background: #f8fafc;
        border: 2px dashed #94a3b8;
        border-radius: 8px;
        padding: 1.5rem;
        overflow: hidden;
      "
    >
      <p style="color: #64748b; font-size: 0.875rem; margin-bottom: 1rem;">
        This <code>#custom-portal</code> div is the teleport target. Open the
        modal and inspect the DOM — <code>vi-modal</code> will be appended here,
        not to <code>body</code>.
      </p>

      <vi-button @click=${()=>openModal('modal-append-to')}
        >Open Modal (append-to #custom-portal)</vi-button
      >

      <vi-modal
        id="modal-append-to"
        size="sm"
        append-to="#custom-portal"
        no-backdrop
        draggable
      >
        <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Scoped Modal</vi-modal-header>
        <p>
          This modal was teleported into
          <code>#custom-portal</code>, not <code>body</code>.
        </p>
        <p style="color: #64748b; font-size: 0.875rem; margin-top: 0.5rem;">
          Useful for scoped stacking contexts or micro-frontend shells.
        </p>
        <vi-modal-footer slot="footer">
          <vi-button @click=${()=>closeModal('modal-append-to')}>Close</vi-button>
        </vi-modal-footer>
      </vi-modal>
    </div>
  `
};
// ─────────────────────────────────────────────────────────────────────────────
// Drag Containment
// ─────────────────────────────────────────────────────────────────────────────
const DragContainmentDemo = {
    name: 'Drag Containment',
    parameters: {
        docs: {
            description: {
                story: 'Modals with `draggable` can be clamped to boundaries using `drag-containment`.<br/>' + 'Options are: `none` (default), `viewport` (cannot be dragged off-screen), and `parent` (stays within its offset parent).'
            }
        }
    },
    render: (args)=>b`
    <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
      <vi-button @click=${()=>openModal('modal-drag-viewport')}
        >Open (Viewport Bound)</vi-button
      >
      <vi-button
        variant="secondary"
        @click=${()=>openModal('modal-drag-parent')}
        >Open (Parent Bound)</vi-button
      >
    </div>

    <!-- Parent container to demonstrate "parent" containment -->
    <div
      id="drag-parent-container"
      style="
        position: relative;
        width: 100%;
        max-width: 600px;
        height: 400px;
        background: #f8fafc;
        border: 2px dashed #94a3b8;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      "
    >
      <p style="color: #64748b; font-size: 0.875rem;">
        The "Parent Bound" modal is appended here and cannot be dragged outside
        this dashed box.
      </p>

      <vi-modal
        id="modal-drag-parent"
        size="xs"
        draggable
        drag-containment="parent"
        append-to="#drag-parent-container"
        no-backdrop
      >
        <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Bound to Parent</vi-modal-header>
        <p>I cannot be dragged outside the dashed box.</p>
        <vi-modal-footer slot="footer">
          <vi-button size="sm" @click=${()=>closeModal('modal-drag-parent')}
            >Close</vi-button
          >
        </vi-modal-footer>
      </vi-modal>
    </div>

    <!-- Viewport bounded modal (appended to body by default) -->
    <vi-modal
      id="modal-drag-viewport"
      size="xs"
      draggable
      drag-containment="viewport"
      no-backdrop
    >
      <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Bound to Viewport</vi-modal-header>
      <p>I cannot be dragged off the screen. Try throwing me off the edge!</p>
      <vi-modal-footer slot="footer">
        <vi-button size="sm" @click=${()=>closeModal('modal-drag-viewport')}
          >Close</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `
};
const ModelessScroll = {
    render: (args)=>b`
    <div
      style="height: 150vh; padding: 2rem; border: 2px dashed #ccc; background: linear-gradient(to bottom, #f9f9f9, #eaeaea);"
    >
      <h2>Scroll Strategy Demonstration</h2>
      <p>This page has a lot of content to make it scrollable.</p>
      <vi-button @click=${()=>openModal('modal-modeless-scroll')}
        >Open Modeless Panel</vi-button
      >

      <div style="margin-top: 100vh;">
        <p>Bottom of the page!</p>
      </div>

      <vi-modal
        id="modal-modeless-scroll"
        size="xs"
        draggable
        no-backdrop
        scroll-strategy="noop"
      >
        <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Modeless Palette</vi-modal-header>
        <p>
          Because <code>scroll-strategy="noop"</code> is set and there's no
          backdrop, you can still scroll the background document while this is
          open!
        </p>
        <vi-modal-footer slot="footer">
          <vi-button @click=${()=>closeModal('modal-modeless-scroll')}
            >Close</vi-button
          >
        </vi-modal-footer>
      </vi-modal>
    </div>
  `
};
const NestedScrolling = {
    render: (args)=>b`
    <div
      style="height: 200vh; padding: 2rem; border: 2px dashed #999; background: linear-gradient(to bottom, #e3f2fd, #bbdefb);"
    >
      <h2>Nested Scrolling Demonstration</h2>
      <p>Scroll down to open the modal.</p>
      <div style="margin-top: 50vh;">
        <vi-button @click=${()=>openModal('modal-nested-scroll')}
          >Open Modal with Scrollable Content</vi-button
        >
      </div>

      <div style="margin-top: 100vh;">
        <p>Bottom of the background page!</p>
      </div>

      <vi-modal
        id="modal-nested-scroll"
        size="sm"
        scroll-strategy="noop"
        no-backdrop
        draggable
      >
        <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Scrollable Modal</vi-modal-header>
        <div style="padding-right: 1rem;">
          <p>This modal has a lot of content, so it will scroll internally.</p>
          ${Array.from({
            length: 20
        }).map((_, i)=>b`<p>Modal content line ${i + 1}</p>`)}
          <p>
            Try scrolling here. If <code>scroll-strategy="block"</code>, the
            background will <strong>not</strong> scroll when you reach the
            bottom of this modal. If you change it to <code>noop</code>, the
            background <em>will</em> scroll when the modal reaches its scroll
            bounds (or if you scroll outside the modal).
          </p>
        </div>
        <vi-modal-footer slot="footer">
          <vi-button @click=${()=>closeModal('modal-nested-scroll')}
            >Close</vi-button
          >
        </vi-modal-footer>
      </vi-modal>
    </div>
  `
};
const EventLifecycle = {
    render: (args)=>{
        let preventClose = false;
        let logCount = 0;
        const logEvent = (name, detail)=>{
            const logger = document.getElementById('event-logger');
            if (logger) {
                logCount++;
                const detailString = detail ? ` - ${JSON.stringify(detail)}` : '';
                const div = document.createElement('div');
                div.textContent = `[${logCount}] `;
                const strong = document.createElement('strong');
                strong.textContent = name;
                div.appendChild(strong);
                if (detailString) {
                    const span = document.createElement('span');
                    span.textContent = detailString;
                    div.appendChild(span);
                }
                logger.insertBefore(div, logger.firstChild);
            }
        };
        const handleBeforeOpen = (_e)=>{
            logEvent('vi-modal-before-open');
        };
        const handleOpen = (_e)=>{
            logEvent('vi-modal-open');
        };
        const handleAfterOpen = (_e)=>{
            logEvent('vi-modal-after-open');
        };
        const handleBeforeClose = (_e)=>{
            logEvent('vi-modal-before-close');
            if (preventClose) {
                e.preventDefault();
                logEvent('❌ Close prevented by vi-modal-before-close!');
            }
        };
        const handleRequestClose = (e1)=>{
            logEvent('vi-modal-close-request', e1.detail);
        };
        const handleClose = (e1)=>{
            logEvent('vi-modal-close', e1.detail);
        };
        const handleAfterClose = (e1)=>{
            logEvent('vi-modal-after-close', e1.detail);
        };
        return b`
      <div style="display: flex; gap: 2rem; align-items: flex-start;">
        <div>
          <vi-button @click=${()=>openModal('modal-events')}>Open Event Modal</vi-button>
          
          <div style="margin-top: 1rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-family: sans-serif;">
              <input type="checkbox" @change=${(e1)=>{
            preventClose = e1.target.checked;
        }}>
              Prevent Closing (tests before-close cancellation)
            </label>
          </div>
        </div>

        <div style="flex: 1; min-width: 300px; max-width: 400px;">
          <h3 style="margin-top: 0; font-family: sans-serif;">Event Log</h3>
          <div 
            id="event-logger" 
            style="height: 300px; overflow-y: auto; background: #1e293b; color: #a5b4fc; padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 13px;"
          >
            <em>Waiting for events...</em>
          </div>
          <vi-button variant="ghost" size="sm" style="margin-top: 0.5rem;" @click=${()=>{
            const logger = document.getElementById('event-logger');
            if (logger) {
                D(b`<em>Waiting for events...</em>`, logger);
                logCount = 0;
            }
        }}>Clear Log</vi-button>
        </div>
      </div>

      <vi-modal
        id="modal-events"
        size="sm"
        @vi-modal-before-open=${handleBeforeOpen}
        @vi-modal-open=${handleOpen}
        @vi-modal-after-open=${handleAfterOpen}
        @vi-modal-close-request=${handleRequestClose}
        @vi-modal-before-close=${handleBeforeClose}
        @vi-modal-close=${handleClose}
        @vi-modal-after-close=${handleAfterClose}
      >
        <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Lifecycle Events</vi-modal-header>
        <p>Watch the event log to the right.</p>
        <p>This modal fires events in the following order when opening:</p>
        <ol style="font-family: sans-serif;">
          <li><code>vi-modal-before-open</code> (cancelable)</li>
          <li><code>vi-modal-open</code></li>
          <li><code>vi-modal-after-open</code> (post-animation)</li>
        </ol>
        <p>And when closing:</p>
        <ol style="font-family: sans-serif;">
          <li><code>vi-modal-close-request</code> (cancelable, provides reason)</li>
          <li><code>vi-modal-before-close</code> (cancelable)</li>
          <li><code>vi-modal-close</code></li>
          <li><code>vi-modal-after-close</code> (post-animation)</li>
        </ol>
        <vi-modal-footer slot="footer">
          <vi-button variant="ghost" @click=${()=>closeModal('modal-events')}>Close Programmatically</vi-button>
        </vi-modal-footer>
      </vi-modal>
    `;
    }
};
// ─────────────────────────────────────────────────────────────────────────────
// Responsive (Mobile View)
// ─────────────────────────────────────────────────────────────────────────────
const ResponsiveMobile = {
    name: 'Responsive (Mobile)',
    parameters: {
        docs: {
            description: {
                story: 'On screens narrower than 640px (mobile), modals automatically snap to full screen. ' + 'Margins and border radius are removed, and padding is optimized for small screens. ' + 'Resize your browser window or use the Storybook viewport tool to test this behavior.'
            }
        },
        // If the viewport addon is installed, this forces it to mobile by default in the canvas
        viewport: {
            defaultViewport: 'mobile1'
        }
    },
    render: (args)=>b`
    <vi-button @click=${()=>openModal('modal-responsive')}
      >Open Responsive Modal</vi-button
    >
    <vi-modal id="modal-responsive" size="md">
      <vi-modal-header slot="header" alert-variant=${o(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Mobile Optimized View</vi-modal-header>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <p>
          This modal is designed to automatically adapt to small screens. When the 
          viewport width drops below 640px, it expands to 100vw and 100vh.
        </p>
        <div style="padding: 1rem; background-color: var(--vi-color-grey-100); border-radius: 4px;">
          <h4 style="margin-top: 0;">Try it out:</h4>
          <ol style="margin-bottom: 0;">
            <li>Open this modal on a desktop screen.</li>
            <li>Slowly shrink your browser window width.</li>
            <li>Watch it snap to full screen!</li>
          </ol>
        </div>
        <p>
          Also notice that if the content becomes too long, the body scrolls smoothly 
          while the header and footer remain pinned to the top and bottom of your screen, 
          ensuring action buttons are always reachable.
        </p>
        <!-- Adding some dummy height to prove scrolling works -->
        <div style="height: 400px; border: 1px dashed var(--vi-color-grey-300); display: flex; align-items: center; justify-content: center; color: var(--vi-color-grey-500);">
          Scrollable Content Area
        </div>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button variant="ghost" @click=${()=>closeModal('modal-responsive')}
          >Cancel</vi-button
        >
        <vi-button
          variant="primary"
          @click=${()=>closeModal('modal-responsive')}
          >Confirm</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    variant: 'default',\n    size: 'md',\n    position: 'center',\n    closable: true,\n    persistent: false,\n    maximizable: false,\n    draggable: false,\n    autofocus: true,\n    scrollable: true\n  },\n  render: args => html`\n    <vi-button @click=${() => openModal('modal-default')}>Open Modal</vi-button>\n    <vi-modal\n      id=\"modal-default\"\n      variant=${args.variant}\n      size=${args.size}\n      position=${args.position}\n      ?persistent=${args.persistent}\n      ?draggable=${args.draggable}\n      ?autofocus=${args.autofocus}\n      ?scrollable=${args.scrollable}\n    >\n      <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Default Modal</vi-modal-header>\n      <p>\n        This is the default modal content. It acts as a standard dialog for\n        forms and general information.\n      </p>\n      <vi-modal-footer slot=\"footer\">\n        <vi-button variant=\"ghost\" @click=${() => closeModal('modal-default')}\n          >Cancel</vi-button\n        >\n        <vi-button variant=\"primary\" @click=${() => closeModal('modal-default')}\n          >Save</vi-button\n        >\n      </vi-modal-footer>\n    </vi-modal>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
Sizes.parameters = {
    ...Sizes.parameters,
    docs: {
        ...Sizes.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <div style=\"display: flex; gap: 1rem; flex-wrap: wrap;\">\n      ${['xs', 'sm', 'md', 'lg', 'xl', 'full-width', 'fullscreen'].map(size => html`\n          <vi-button @click=${() => openModal(`modal-size-${size}`)}\n            >Size: ${size}</vi-button\n          >\n          <vi-modal id=\"modal-size-${size}\" size=${size}>\n            <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Modal Size: ${size}</vi-modal-header>\n            <p>This modal is rendered with size <strong>${size}</strong>.</p>\n            <vi-modal-footer slot=\"footer\">\n              <vi-button @click=${() => closeModal(`modal-size-${size}`)}\n                >Close</vi-button\n              >\n            </vi-modal-footer>\n          </vi-modal>\n        `)}\n    </div>\n  `\n}",
            ...Sizes.parameters?.docs?.source
        }
    }
};
Drawer.parameters = {
    ...Drawer.parameters,
    docs: {
        ...Drawer.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    drawerPlacement: 'right'\n  },\n  render: args => html`\n    <vi-button @click=${() => openModal('modal-drawer')}>Open Drawer</vi-button>\n    <vi-modal\n      id=\"modal-drawer\"\n      variant=\"drawer\"\n      drawer-placement=${args.drawerPlacement}\n    >\n      <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Drawer Variant</vi-modal-header>\n      <p>\n        Drawers slide in from the edge of the screen and take up the full\n        viewport height.\n      </p>\n      <p>\n        They are useful for detailed records, audit trails, and configuration\n        settings.\n      </p>\n      <vi-modal-footer slot=\"footer\">\n        <vi-button variant=\"primary\" @click=${() => closeModal('modal-drawer')}\n          >Submit</vi-button\n        >\n      </vi-modal-footer>\n    </vi-modal>\n  `\n}",
            ...Drawer.parameters?.docs?.source
        }
    }
};
Alert.parameters = {
    ...Alert.parameters,
    docs: {
        ...Alert.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    alertVariant: 'danger',\n    persistent: true\n  },\n  render: args => html`\n    <vi-button variant=\"danger\" @click=${() => openModal('modal-alert')}\n      >Lock Data</vi-button\n    >\n    <vi-modal\n      id=\"modal-alert\"\n      variant=\"alert\"\n      ?persistent=${args.persistent}\n      size=\"sm\"\n    >\n      <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Lock Data</vi-modal-header>\n      <p>\n        This action is <strong>irreversible</strong>. All forms will be locked\n        for editing.\n      </p>\n      <p>Are you sure you want to lock this subject's data?</p>\n      <vi-modal-footer slot=\"footer\">\n        <vi-button variant=\"ghost\" @click=${() => closeModal('modal-alert')}\n          >Cancel</vi-button\n        >\n        <vi-button\n          variant=${args.alertVariant === 'danger' ? 'danger' : 'primary'}\n          @click=${() => closeModal('modal-alert')}\n          >Confirm Lock</vi-button\n        >\n      </vi-modal-footer>\n    </vi-modal>\n  `\n}",
            ...Alert.parameters?.docs?.source
        }
    }
};
ScrollableContent.parameters = {
    ...ScrollableContent.parameters,
    docs: {
        ...ScrollableContent.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <vi-button @click=${() => openModal('modal-scroll')}\n      >Open Scrollable Modal</vi-button\n    >\n    <vi-modal id=\"modal-scroll\" size=\"md\">\n      <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Terms and Conditions</vi-modal-header>\n      <div\n        style=\"height: 1200px; padding: 1rem; background: repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #fafafa 10px, #fafafa 20px);\"\n      >\n        <p>Tall content that requires scrolling...</p>\n        <p style=\"margin-top: 1100px;\">End of content.</p>\n      </div>\n      <vi-modal-footer slot=\"footer\">\n        <vi-button variant=\"primary\" @click=${() => closeModal('modal-scroll')}\n          >I Agree</vi-button\n        >\n      </vi-modal-footer>\n    </vi-modal>\n  `\n}",
            ...ScrollableContent.parameters?.docs?.source
        }
    }
};
ProgrammaticGuard.parameters = {
    ...ProgrammaticGuard.parameters,
    docs: {
        ...ProgrammaticGuard.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Programmatic Guard (Prevent Close)',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Demonstrates listening to `vi-modal-close-request` to prevent the modal from closing if there are unsaved changes. Cancel the event via `e.preventDefault()`.'\n      }\n    }\n  },\n  render: args => {\n    const handleRequestClose = (e: Event) => {\n      // Simulate form dirtiness\n      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to discard them?');\n      if (!confirmed) {\n        e.preventDefault(); // Block the modal from closing\n      }\n    };\n    return html`\n      <vi-button @click=${() => openModal('modal-guard')}\n        >Open Form Modal</vi-button\n      >\n      <vi-modal\n        id=\"modal-guard\"\n        size=\"sm\"\n        @vi-modal-close-request=${handleRequestClose}\n      >\n        <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Edit Record</vi-modal-header>\n        <vi-input placeholder=\"Type something...\"></vi-input>\n        <p style=\"margin-top: 1rem; color: #666; font-size: 0.875rem;\">\n          Try clicking outside or pressing Escape. A browser confirm dialog will\n          guard the close action.\n        </p>\n        <vi-modal-footer slot=\"footer\">\n          <vi-button variant=\"ghost\" @click=${() => closeModal('modal-guard')}\n            >Cancel</vi-button\n          >\n          <vi-button\n            variant=\"primary\"\n            @click=${() => {\n      // Force close without firing request-close (simulates successful save)\n      const modal = document.getElementById('modal-guard') as ViModal | null;\n      if (modal) {\n        modal.open = false; // Programmatically resetting open property bypasses the guard check\n      }\n    }}\n            >Save</vi-button\n          >\n        </vi-modal-footer>\n      </vi-modal>\n    `;\n  }\n}",
            ...ProgrammaticGuard.parameters?.docs?.source
        }
    }
};
DraggableAndMaximizable.parameters = {
    ...DraggableAndMaximizable.parameters,
    docs: {
        ...DraggableAndMaximizable.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <vi-button @click=${() => openModal('modal-drag-max')}\n      >Open Draggable Modal</vi-button\n    >\n    <vi-modal id=\"modal-drag-max\" size=\"md\" draggable>\n      <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} maximizable>Interactive Modal</vi-modal-header>\n      <p>Drag me by the header, or click the maximize button!</p>\n      <div style=\"margin-top: 1rem;\">\n        <vi-input placeholder=\"Try typing...\"></vi-input>\n      </div>\n      <vi-modal-footer slot=\"footer\">\n        <vi-button @click=${() => closeModal('modal-drag-max')}\n          >Close</vi-button\n        >\n      </vi-modal-footer>\n    </vi-modal>\n  `\n}",
            ...DraggableAndMaximizable.parameters?.docs?.source
        }
    }
};
Positioning.parameters = {
    ...Positioning.parameters,
    docs: {
        ...Positioning.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <div\n      style=\"display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;\"\n    >\n      ${['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'].map(pos => html`\n          <vi-button @click=${() => openModal(`modal-pos-${pos}`)}\n            >${pos}</vi-button\n          >\n          <vi-modal id=\"modal-pos-${pos}\" position=${pos} size=\"sm\">\n            <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Position: ${pos}</vi-modal-header>\n            <p>This modal appears at ${pos}.</p>\n            <vi-modal-footer slot=\"footer\">\n              <vi-button @click=${() => closeModal(`modal-pos-${pos}`)}\n                >Close</vi-button\n              >\n            </vi-modal-footer>\n          </vi-modal>\n        `)}\n    </div>\n  `\n}",
            ...Positioning.parameters?.docs?.source
        }
    }
};
ZIndexStacking.parameters = {
    ...ZIndexStacking.parameters,
    docs: {
        ...ZIndexStacking.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => {\n    return html`\n      <div style=\"padding: 24px; min-height: 400px;\">\n        <vi-button\n          @click=${() => document.getElementById('stacking-modal-1')?.setAttribute('open', 'true')}\n        >\n          Open Stacking Modal 1\n        </vi-button>\n\n        <vi-modal id=\"stacking-modal-1\" size=\"lg\" closable>\n          <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Stacking Modal 1 (Base)</vi-modal-header>\n\n          <div style=\"padding: 16px; min-height: 300px;\">\n            <p style=\"margin-bottom: 24px;\">\n              This modal tests the OverlayManager. Modals are now appended to\n              body, and their z-index is managed explicitly.\n            </p>\n\n            <div style=\"margin-bottom: 24px;\">\n              <vi-combobox\n                hoist\n                placeholder=\"Select an option (Hoisted)\"\n                .options=${[{\n      value: '1',\n      label: 'Option 1'\n    }, {\n      value: '2',\n      label: 'Option 2'\n    }]}\n              >\n              </vi-combobox>\n              <p style=\"font-size: 12px; color: #666; margin-top: 8px;\">\n                The combobox listbox is also teleported to the body via hoist,\n                and given a higher z-index than the modal.\n              </p>\n            </div>\n\n            <vi-button\n              @click=${() => document.getElementById('stacking-modal-2')?.setAttribute('open', 'true')}\n            >\n              Open Nested Modal 2\n            </vi-button>\n          </div>\n        </vi-modal>\n\n        <vi-modal id=\"stacking-modal-2\" size=\"sm\" closable>\n          <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Nested Modal 2</vi-modal-header>\n\n          <div style=\"padding: 16px;\">\n            <p>\n              This modal should appear <strong>above</strong> Modal 1 and its\n              backdrop should cover Modal 1.\n            </p>\n            <vi-button\n              @click=${() => document.getElementById('stacking-modal-2')?.removeAttribute('open')}\n            >\n              Close Me\n            </vi-button>\n          </div>\n        </vi-modal>\n      </div>\n    `;\n  }\n}",
            ...ZIndexStacking.parameters?.docs?.source
        }
    }
};
PersistentWithShake.parameters = {
    ...PersistentWithShake.parameters,
    docs: {
        ...PersistentWithShake.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Persistent Modal (Shake on Dismiss)',\n  parameters: {\n    docs: {\n      description: {\n        story: `\nDemonstrates the **shake animation** on a persistent modal.\nWhen \\`persistent\\` is \\`true\\`, pressing **Escape** or clicking the **backdrop**\nwill not close the modal. Instead, the dialog shakes to signal \"blocked\" \u2014 \nmatching the macOS alert dialog and MUI Dialog patterns.\n\nThe modal also dispatches a \\`vi-modal-close-request\\` event with \\`detail.reason\\`\nso consumers can show a custom in-modal warning message instead.\n        `\n      }\n    }\n  },\n  render: args => {\n    let _warningVisible = false;\n    const handleRequestClose = (_e: Event) => {\n      const modal = document.getElementById('modal-persistent-shake') as ViModal | null;\n      const warning = modal?.querySelector<HTMLElement>('.shake-warning');\n      if (!warning) return;\n\n      // Show the warning message on first attempt, escalate on repeated attempts\n      _warningVisible = true;\n      warning.style.display = 'block';\n      warning.animate([{\n        opacity: 0,\n        transform: 'translateY(-4px)'\n      }, {\n        opacity: 1,\n        transform: 'translateY(0)'\n      }], {\n        duration: 200,\n        fill: 'forwards'\n      });\n    };\n    return html`\n      <vi-button\n        variant=\"danger\"\n        @click=${() => openModal('modal-persistent-shake')}\n      >\n        Open Persistent Modal\n      </vi-button>\n\n      <vi-modal\n        id=\"modal-persistent-shake\"\n        persistent\n        closable=${false}\n        size=\"sm\"\n        @vi-modal-close-request=${handleRequestClose}\n      >\n        <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>\u26A0\uFE0F Action Required</vi-modal-header>\n        <div>\n          <p>\n            You <strong>must</strong> make a choice before dismissing this\n            dialog.\n          </p>\n          <p style=\"color: #888; font-size: 0.875rem; margin-top: 0.5rem;\">\n            Try pressing\n            <kbd\n              style=\"background:#eee;padding:2px 6px;border-radius:4px;border:1px solid #ccc\"\n              >Escape</kbd\n            >\n            or clicking the backdrop \u2014 the modal will shake instead of closing.\n          </p>\n          <p\n            class=\"shake-warning\"\n            style=\"display: none; margin-top: 1rem; padding: 0.75rem; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; font-size: 0.875rem; color: #856404;\"\n          >\n            \u26A0\uFE0F Please select an option below before closing.\n          </p>\n        </div>\n        <div\n          slot=\"footer\"\n          style=\"display: flex; gap: 0.5rem; justify-content: flex-end;\"\n        >\n          <vi-button\n            variant=\"ghost\"\n            @click=${() => closeModal('modal-persistent-shake')}\n          >\n            Decline\n          </vi-button>\n          <vi-button\n            variant=\"primary\"\n            @click=${() => closeModal('modal-persistent-shake')}\n          >\n            Accept & Continue\n          </vi-button>\n        </div>\n      </vi-modal>\n    `;\n  }\n}",
            ...PersistentWithShake.parameters?.docs?.source
        }
    }
};
CustomAnimations.parameters = {
    ...CustomAnimations.parameters,
    docs: {
        ...CustomAnimations.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Custom Animations',\n  parameters: {\n    docs: {\n      description: {\n        story: `\nDemonstrates how to customize the **enter** and **exit** animations using the \\`enter-animation\\` and \\`exit-animation\\` properties.\nYou can also adjust the animation duration with \\`animation-duration\\`.\n        `\n      }\n    }\n  },\n  args: {\n    enterAnimation: 'pop-in',\n    exitAnimation: 'pop-out',\n    animationDuration: 400\n  },\n  argTypes: {\n    enterAnimation: {\n      name: 'enter-animation',\n      control: 'select',\n      options: ['fade-in', 'fade-in-up', 'fade-in-down', 'zoom-in', 'scale-up', 'pop-in', 'slide-in-top', 'slide-in-bottom', 'slide-in-left', 'slide-in-right', 'none']\n    },\n    exitAnimation: {\n      name: 'exit-animation',\n      control: 'select',\n      options: ['fade-out', 'fade-out-down', 'fade-out-up', 'zoom-out', 'scale-down', 'pop-out', 'slide-out-top', 'slide-out-bottom', 'slide-out-left', 'slide-out-right', 'none']\n    },\n    animationDuration: {\n      name: 'animation-duration',\n      control: {\n        type: 'range',\n        min: 100,\n        max: 2000,\n        step: 100\n      }\n    }\n  },\n  render: args => html`\n    <vi-button @click=${() => openModal('modal-custom-animation')}>\n      Open Animated Modal\n    </vi-button>\n\n    <vi-modal\n      id=\"modal-custom-animation\"\n      enter-animation=${args.enterAnimation}\n      exit-animation=${args.exitAnimation}\n      animation-duration=${args.animationDuration}\n    >\n      <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Custom Animation</vi-modal-header>\n      <div>\n        <p>This modal is using custom enter and exit animations.</p>\n        <ul style=\"margin-top: 1rem; margin-bottom: 1rem;\">\n          <li><strong>Enter:</strong> ${args.enterAnimation}</li>\n          <li><strong>Exit:</strong> ${args.exitAnimation}</li>\n          <li><strong>Duration:</strong> ${args.animationDuration}ms</li>\n        </ul>\n        <p>Try changing the controls below to see different effects!</p>\n      </div>\n      <vi-modal-footer slot=\"footer\">\n        <vi-button @click=${() => closeModal('modal-custom-animation')}>\n          Close\n        </vi-button>\n      </vi-modal-footer>\n    </vi-modal>\n  `\n}",
            ...CustomAnimations.parameters?.docs?.source
        }
    }
};
NoBackdrop.parameters = {
    ...NoBackdrop.parameters,
    docs: {
        ...NoBackdrop.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'No Backdrop (Floating Tool Window)',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Demonstrates a modeless floating tool window using `no-backdrop` and `draggable`. Background controls remain interactive.'\n      }\n    }\n  },\n  render: args => html`\n    <div style=\"padding: 1rem;\">\n      <vi-button @click=${() => openModal('modal-no-backdrop')}>\n        Open Floating Window\n      </vi-button>\n      <div style=\"margin-top: 1.5rem; display: flex; gap: 1rem;\">\n        <vi-button variant=\"secondary\"\n          >Background Interactive Button 1</vi-button\n        >\n        <vi-button variant=\"outline\">Background Interactive Button 2</vi-button>\n      </div>\n    </div>\n\n    <vi-modal\n      id=\"modal-no-backdrop\"\n      size=\"sm\"\n      draggable\n      no-backdrop\n      position=\"top-right\"\n    >\n      <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Floating Inspector</vi-modal-header>\n      <div>\n        <p>This modal floats without a dark backdrop overlay.</p>\n        <p style=\"margin-top: 0.5rem; color: #666; font-size: 0.875rem;\">\n          You can drag this panel around and click background controls while it\n          is open.\n        </p>\n      </div>\n      <vi-modal-footer slot=\"footer\">\n        <vi-button size=\"sm\" @click=${() => closeModal('modal-no-backdrop')}>\n          Close\n        </vi-button>\n      </vi-modal-footer>\n    </vi-modal>\n  `\n}",
            ...NoBackdrop.parameters?.docs?.source
        }
    }
};
MultipleFloatingWindows.parameters = {
    ...MultipleFloatingWindows.parameters,
    docs: {
        ...MultipleFloatingWindows.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Multiple Floating Modeless Modals',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Demonstrates multiple modeless floating panels (`no-backdrop` + `draggable`) open simultaneously. Each window can be dragged independently, layered on focus, and operated alongside background page controls.'\n      }\n    }\n  },\n  render: args => html`\n    <div\n      style=\"padding: 1.5rem; min-height: 450px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; position: relative;\"\n    >\n      <div\n        style=\"display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; background: #ffffff; padding: 1rem; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);\"\n      >\n        <vi-button\n          variant=\"primary\"\n          size=\"sm\"\n          @click=${() => openModal('modal-panel-1')}\n        >\n          Toggle Subject Inspector\n        </vi-button>\n\n        <vi-button\n          variant=\"secondary\"\n          size=\"sm\"\n          @click=${() => openModal('modal-panel-2')}\n        >\n          Toggle Filter Palette\n        </vi-button>\n\n        <vi-button\n          variant=\"info\"\n          size=\"sm\"\n          @click=${() => openModal('modal-panel-3')}\n        >\n          Toggle Live Metrics\n        </vi-button>\n      </div>\n\n      <div\n        style=\"background: #ffffff; padding: 1.25rem; border-radius: 6px; border: 1px solid #cbd5e1;\"\n      >\n        <h4 style=\"margin: 0 0 0.5rem 0; font-size: 1rem; color: #0f172a;\">\n          Background EDC Data Workspace\n        </h4>\n        <p style=\"margin: 0 0 1rem 0; color: #64748b; font-size: 0.875rem;\">\n          Click the buttons above to open multiple modeless windows. Drag each\n          window by its header, interact with background inputs/buttons below,\n          or layer windows on focus.\n        </p>\n        <div style=\"display: flex; gap: 1rem;\">\n          <vi-button variant=\"outline\" size=\"sm\"\n            >Background Export CSV</vi-button\n          >\n          <vi-button variant=\"ghost\" size=\"sm\"\n            >Background Refresh Data</vi-button\n          >\n        </div>\n      </div>\n    </div>\n\n    <!-- Window 1: Subject Inspector -->\n    <vi-modal\n      id=\"modal-panel-1\"\n      open\n      size=\"xs\"\n      draggable\n      no-backdrop\n      position=\"top-left\"\n    >\n      <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Subject Inspector</vi-modal-header>\n      <div>\n        <p style=\"margin: 0; font-size: 0.875rem; color: #334155;\">\n          <strong>Subject ID:</strong> SUBJ-0042\n        </p>\n        <p style=\"margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #64748b;\">\n          Status: Enrolled (Site 101)\n        </p>\n      </div>\n      <vi-modal-footer slot=\"footer\">\n        <vi-button\n          size=\"xs\"\n          variant=\"ghost\"\n          @click=${() => closeModal('modal-panel-1')}\n        >\n          Close Inspector\n        </vi-button>\n      </vi-modal-footer>\n    </vi-modal>\n\n    <!-- Window 2: Filter Palette -->\n    <vi-modal\n      id=\"modal-panel-2\"\n      open\n      size=\"xs\"\n      draggable\n      no-backdrop\n      position=\"center\"\n    >\n      <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Filter Palette</vi-modal-header>\n      <div>\n        <p style=\"margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #334155;\">\n          Active Filter Options:\n        </p>\n        <div style=\"display: flex; gap: 0.5rem; flex-wrap: wrap;\">\n          <vi-tag size=\"xs\" selectable selected variant=\"primary\"\n            >Screened</vi-tag\n          >\n          <vi-tag size=\"xs\" selectable variant=\"warning\">Pending</vi-tag>\n          <vi-tag size=\"xs\" selectable variant=\"success\">Completed</vi-tag>\n        </div>\n      </div>\n      <vi-modal-footer slot=\"footer\">\n        <vi-button\n          size=\"xs\"\n          variant=\"ghost\"\n          @click=${() => closeModal('modal-panel-2')}\n        >\n          Close Palette\n        </vi-button>\n      </vi-modal-footer>\n    </vi-modal>\n\n    <!-- Window 3: Live Metrics -->\n    <vi-modal\n      id=\"modal-panel-3\"\n      open\n      size=\"xs\"\n      draggable\n      no-backdrop\n      position=\"top-right\"\n    >\n      <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Live Metrics</vi-modal-header>\n      <div>\n        <p style=\"margin: 0; font-size: 0.875rem; color: #334155;\">\n          <strong>Sync Latency:</strong> 12ms\n        </p>\n        <p style=\"margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #64748b;\">\n          Queries Pending: 3\n        </p>\n      </div>\n      <vi-modal-footer slot=\"footer\">\n        <vi-button\n          size=\"xs\"\n          variant=\"ghost\"\n          @click=${() => closeModal('modal-panel-3')}\n        >\n          Close Metrics\n        </vi-button>\n      </vi-modal-footer>\n    </vi-modal>\n  `\n}",
            ...MultipleFloatingWindows.parameters?.docs?.source
        }
    }
};
ResizableModal.parameters = {
    ...ResizableModal.parameters,
    docs: {
        ...ResizableModal.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Resizable & Draggable',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Combine `draggable`, `resizable`, and `maximizable` for a fully window-like experience. ' + 'Resize from any of the 8 edge/corner handles. Handles automatically hide when maximized.'\n      }\n    }\n  },\n  render: args => html`\n    <vi-button @click=${() => openModal('modal-resizable')}\n      >Open Resizable Modal</vi-button\n    >\n    <vi-modal id=\"modal-resizable\" size=\"md\" draggable resizable>\n      <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} maximizable>Window Panel</vi-modal-header>\n      <p>\n        This modal can be dragged by its header and resized from any of its 8\n        edges and corners.\n      </p>\n      <p style=\"color: #64748b; font-size: 0.875rem; margin-top: 0.5rem;\">\n        Try dragging the bottom-right corner to resize, then click maximize \u2014\n        resize handles will automatically hide.\n      </p>\n      <vi-modal-footer slot=\"footer\">\n        <vi-button variant=\"ghost\" @click=${() => closeModal('modal-resizable')}\n          >Cancel</vi-button\n        >\n        <vi-button\n          variant=\"primary\"\n          @click=${() => closeModal('modal-resizable')}\n          >Save</vi-button\n        >\n      </vi-modal-footer>\n    </vi-modal>\n  `\n}",
            ...ResizableModal.parameters?.docs?.source
        }
    }
};
ContainedDrag.parameters = {
    ...ContainedDrag.parameters,
    docs: {
        ...ContainedDrag.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Drag Containment (Viewport)',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Use `drag-containment=\"viewport\"` to prevent the modal from being dragged off-screen. ' + 'The modal will be clamped to the viewport boundary on all sides.'\n      }\n    }\n  },\n  render: args => html`\n    <vi-button @click=${() => openModal('modal-contained')}\n      >Open Contained Draggable</vi-button\n    >\n    <vi-modal\n      id=\"modal-contained\"\n      size=\"sm\"\n      draggable\n      drag-containment=\"viewport\"\n    >\n      <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Contained Draggable</vi-modal-header>\n      <p>\n        Try dragging this modal to the edge of the viewport \u2014 it will stop at\n        the boundary and cannot go off-screen.\n      </p>\n      <p style=\"color: #64748b; font-size: 0.875rem; margin-top: 0.5rem;\">\n        <code>drag-containment=\"viewport\"</code>\n      </p>\n      <vi-modal-footer slot=\"footer\">\n        <vi-button @click=${() => closeModal('modal-contained')}\n          >Close</vi-button\n        >\n      </vi-modal-footer>\n    </vi-modal>\n  `\n}",
            ...ContainedDrag.parameters?.docs?.source
        }
    }
};
CustomAppendTo.parameters = {
    ...CustomAppendTo.parameters,
    docs: {
        ...CustomAppendTo.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Custom append-to Container',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Use the `append-to` attribute to teleport the modal into a specific container element ' + 'instead of `document.body`. Useful for scoped stacking contexts (e.g., a full-screen app shell). ' + 'Inspect the DOM after opening \u2014 the modal will be inside `#custom-portal`, not `body`.'\n      }\n    }\n  },\n  render: args => html`\n    <div\n      id=\"custom-portal\"\n      style=\"\n        position: relative;\n        min-height: 400px;\n        background: #f8fafc;\n        border: 2px dashed #94a3b8;\n        border-radius: 8px;\n        padding: 1.5rem;\n        overflow: hidden;\n      \"\n    >\n      <p style=\"color: #64748b; font-size: 0.875rem; margin-bottom: 1rem;\">\n        This <code>#custom-portal</code> div is the teleport target. Open the\n        modal and inspect the DOM \u2014 <code>vi-modal</code> will be appended here,\n        not to <code>body</code>.\n      </p>\n\n      <vi-button @click=${() => openModal('modal-append-to')}\n        >Open Modal (append-to #custom-portal)</vi-button\n      >\n\n      <vi-modal\n        id=\"modal-append-to\"\n        size=\"sm\"\n        append-to=\"#custom-portal\"\n        no-backdrop\n        draggable\n      >\n        <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Scoped Modal</vi-modal-header>\n        <p>\n          This modal was teleported into\n          <code>#custom-portal</code>, not <code>body</code>.\n        </p>\n        <p style=\"color: #64748b; font-size: 0.875rem; margin-top: 0.5rem;\">\n          Useful for scoped stacking contexts or micro-frontend shells.\n        </p>\n        <vi-modal-footer slot=\"footer\">\n          <vi-button @click=${() => closeModal('modal-append-to')}>Close</vi-button>\n        </vi-modal-footer>\n      </vi-modal>\n    </div>\n  `\n}",
            ...CustomAppendTo.parameters?.docs?.source
        }
    }
};
DragContainmentDemo.parameters = {
    ...DragContainmentDemo.parameters,
    docs: {
        ...DragContainmentDemo.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Drag Containment',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Modals with `draggable` can be clamped to boundaries using `drag-containment`.<br/>' + 'Options are: `none` (default), `viewport` (cannot be dragged off-screen), and `parent` (stays within its offset parent).'\n      }\n    }\n  },\n  render: args => html`\n    <div style=\"display: flex; gap: 1rem; margin-bottom: 2rem;\">\n      <vi-button @click=${() => openModal('modal-drag-viewport')}\n        >Open (Viewport Bound)</vi-button\n      >\n      <vi-button\n        variant=\"secondary\"\n        @click=${() => openModal('modal-drag-parent')}\n        >Open (Parent Bound)</vi-button\n      >\n    </div>\n\n    <!-- Parent container to demonstrate \"parent\" containment -->\n    <div\n      id=\"drag-parent-container\"\n      style=\"\n        position: relative;\n        width: 100%;\n        max-width: 600px;\n        height: 400px;\n        background: #f8fafc;\n        border: 2px dashed #94a3b8;\n        border-radius: 8px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        overflow: hidden;\n      \"\n    >\n      <p style=\"color: #64748b; font-size: 0.875rem;\">\n        The \"Parent Bound\" modal is appended here and cannot be dragged outside\n        this dashed box.\n      </p>\n\n      <vi-modal\n        id=\"modal-drag-parent\"\n        size=\"xs\"\n        draggable\n        drag-containment=\"parent\"\n        append-to=\"#drag-parent-container\"\n        no-backdrop\n      >\n        <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Bound to Parent</vi-modal-header>\n        <p>I cannot be dragged outside the dashed box.</p>\n        <vi-modal-footer slot=\"footer\">\n          <vi-button size=\"sm\" @click=${() => closeModal('modal-drag-parent')}\n            >Close</vi-button\n          >\n        </vi-modal-footer>\n      </vi-modal>\n    </div>\n\n    <!-- Viewport bounded modal (appended to body by default) -->\n    <vi-modal\n      id=\"modal-drag-viewport\"\n      size=\"xs\"\n      draggable\n      drag-containment=\"viewport\"\n      no-backdrop\n    >\n      <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Bound to Viewport</vi-modal-header>\n      <p>I cannot be dragged off the screen. Try throwing me off the edge!</p>\n      <vi-modal-footer slot=\"footer\">\n        <vi-button size=\"sm\" @click=${() => closeModal('modal-drag-viewport')}\n          >Close</vi-button\n        >\n      </vi-modal-footer>\n    </vi-modal>\n  `\n}",
            ...DragContainmentDemo.parameters?.docs?.source
        }
    }
};
ModelessScroll.parameters = {
    ...ModelessScroll.parameters,
    docs: {
        ...ModelessScroll.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <div\n      style=\"height: 150vh; padding: 2rem; border: 2px dashed #ccc; background: linear-gradient(to bottom, #f9f9f9, #eaeaea);\"\n    >\n      <h2>Scroll Strategy Demonstration</h2>\n      <p>This page has a lot of content to make it scrollable.</p>\n      <vi-button @click=${() => openModal('modal-modeless-scroll')}\n        >Open Modeless Panel</vi-button\n      >\n\n      <div style=\"margin-top: 100vh;\">\n        <p>Bottom of the page!</p>\n      </div>\n\n      <vi-modal\n        id=\"modal-modeless-scroll\"\n        size=\"xs\"\n        draggable\n        no-backdrop\n        scroll-strategy=\"noop\"\n      >\n        <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Modeless Palette</vi-modal-header>\n        <p>\n          Because <code>scroll-strategy=\"noop\"</code> is set and there's no\n          backdrop, you can still scroll the background document while this is\n          open!\n        </p>\n        <vi-modal-footer slot=\"footer\">\n          <vi-button @click=${() => closeModal('modal-modeless-scroll')}\n            >Close</vi-button\n          >\n        </vi-modal-footer>\n      </vi-modal>\n    </div>\n  `\n}",
            ...ModelessScroll.parameters?.docs?.source
        }
    }
};
NestedScrolling.parameters = {
    ...NestedScrolling.parameters,
    docs: {
        ...NestedScrolling.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <div\n      style=\"height: 200vh; padding: 2rem; border: 2px dashed #999; background: linear-gradient(to bottom, #e3f2fd, #bbdefb);\"\n    >\n      <h2>Nested Scrolling Demonstration</h2>\n      <p>Scroll down to open the modal.</p>\n      <div style=\"margin-top: 50vh;\">\n        <vi-button @click=${() => openModal('modal-nested-scroll')}\n          >Open Modal with Scrollable Content</vi-button\n        >\n      </div>\n\n      <div style=\"margin-top: 100vh;\">\n        <p>Bottom of the background page!</p>\n      </div>\n\n      <vi-modal\n        id=\"modal-nested-scroll\"\n        size=\"sm\"\n        scroll-strategy=\"noop\"\n        no-backdrop\n        draggable\n      >\n        <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Scrollable Modal</vi-modal-header>\n        <div style=\"padding-right: 1rem;\">\n          <p>This modal has a lot of content, so it will scroll internally.</p>\n          ${Array.from({\n    length: 20\n  }).map((_, i) => html`<p>Modal content line ${i + 1}</p>`)}\n          <p>\n            Try scrolling here. If <code>scroll-strategy=\"block\"</code>, the\n            background will <strong>not</strong> scroll when you reach the\n            bottom of this modal. If you change it to <code>noop</code>, the\n            background <em>will</em> scroll when the modal reaches its scroll\n            bounds (or if you scroll outside the modal).\n          </p>\n        </div>\n        <vi-modal-footer slot=\"footer\">\n          <vi-button @click=${() => closeModal('modal-nested-scroll')}\n            >Close</vi-button\n          >\n        </vi-modal-footer>\n      </vi-modal>\n    </div>\n  `\n}",
            ...NestedScrolling.parameters?.docs?.source
        }
    }
};
EventLifecycle.parameters = {
    ...EventLifecycle.parameters,
    docs: {
        ...EventLifecycle.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => {\n    let preventClose = false;\n    let logCount = 0;\n    const logEvent = (name: string, detail?: unknown) => {\n      const logger = document.getElementById('event-logger');\n      if (logger) {\n        logCount++;\n        const detailString = detail ? ` - ${JSON.stringify(detail)}` : '';\n        const div = document.createElement('div');\n        div.textContent = `[${logCount}] `;\n        const strong = document.createElement('strong');\n        strong.textContent = name;\n        div.appendChild(strong);\n        if (detailString) {\n          const span = document.createElement('span');\n          span.textContent = detailString;\n          div.appendChild(span);\n        }\n        logger.insertBefore(div, logger.firstChild);\n      }\n    };\n    const handleBeforeOpen = (_e: Event) => {\n      logEvent('vi-modal-before-open');\n    };\n    const handleOpen = (_e: Event) => {\n      logEvent('vi-modal-open');\n    };\n    const handleAfterOpen = (_e: Event) => {\n      logEvent('vi-modal-after-open');\n    };\n    const handleBeforeClose = (_e: Event) => {\n      logEvent('vi-modal-before-close');\n      if (preventClose) {\n        e.preventDefault();\n        logEvent('\u274C Close prevented by vi-modal-before-close!');\n      }\n    };\n    const handleRequestClose = (e: CustomEvent) => {\n      logEvent('vi-modal-close-request', e.detail);\n    };\n    const handleClose = (e: CustomEvent) => {\n      logEvent('vi-modal-close', e.detail);\n    };\n    const handleAfterClose = (e: CustomEvent) => {\n      logEvent('vi-modal-after-close', e.detail);\n    };\n    return html`\n      <div style=\"display: flex; gap: 2rem; align-items: flex-start;\">\n        <div>\n          <vi-button @click=${() => openModal('modal-events')}>Open Event Modal</vi-button>\n          \n          <div style=\"margin-top: 1rem;\">\n            <label style=\"display: flex; align-items: center; gap: 0.5rem; font-family: sans-serif;\">\n              <input type=\"checkbox\" @change=${(e: Event) => {\n      preventClose = (e.target as HTMLInputElement).checked;\n    }}>\n              Prevent Closing (tests before-close cancellation)\n            </label>\n          </div>\n        </div>\n\n        <div style=\"flex: 1; min-width: 300px; max-width: 400px;\">\n          <h3 style=\"margin-top: 0; font-family: sans-serif;\">Event Log</h3>\n          <div \n            id=\"event-logger\" \n            style=\"height: 300px; overflow-y: auto; background: #1e293b; color: #a5b4fc; padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 13px;\"\n          >\n            <em>Waiting for events...</em>\n          </div>\n          <vi-button variant=\"ghost\" size=\"sm\" style=\"margin-top: 0.5rem;\" @click=${() => {\n      const logger = document.getElementById('event-logger');\n      if (logger) {\n        render(html`<em>Waiting for events...</em>`, logger);\n        logCount = 0;\n      }\n    }}>Clear Log</vi-button>\n        </div>\n      </div>\n\n      <vi-modal\n        id=\"modal-events\"\n        size=\"sm\"\n        @vi-modal-before-open=${handleBeforeOpen}\n        @vi-modal-open=${handleOpen}\n        @vi-modal-after-open=${handleAfterOpen}\n        @vi-modal-close-request=${handleRequestClose}\n        @vi-modal-before-close=${handleBeforeClose}\n        @vi-modal-close=${handleClose}\n        @vi-modal-after-close=${handleAfterClose}\n      >\n        <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Lifecycle Events</vi-modal-header>\n        <p>Watch the event log to the right.</p>\n        <p>This modal fires events in the following order when opening:</p>\n        <ol style=\"font-family: sans-serif;\">\n          <li><code>vi-modal-before-open</code> (cancelable)</li>\n          <li><code>vi-modal-open</code></li>\n          <li><code>vi-modal-after-open</code> (post-animation)</li>\n        </ol>\n        <p>And when closing:</p>\n        <ol style=\"font-family: sans-serif;\">\n          <li><code>vi-modal-close-request</code> (cancelable, provides reason)</li>\n          <li><code>vi-modal-before-close</code> (cancelable)</li>\n          <li><code>vi-modal-close</code></li>\n          <li><code>vi-modal-after-close</code> (post-animation)</li>\n        </ol>\n        <vi-modal-footer slot=\"footer\">\n          <vi-button variant=\"ghost\" @click=${() => closeModal('modal-events')}>Close Programmatically</vi-button>\n        </vi-modal-footer>\n      </vi-modal>\n    `;\n  }\n}",
            ...EventLifecycle.parameters?.docs?.source
        }
    }
};
ResponsiveMobile.parameters = {
    ...ResponsiveMobile.parameters,
    docs: {
        ...ResponsiveMobile.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Responsive (Mobile)',\n  parameters: {\n    docs: {\n      description: {\n        story: 'On screens narrower than 640px (mobile), modals automatically snap to full screen. ' + 'Margins and border radius are removed, and padding is optimized for small screens. ' + 'Resize your browser window or use the Storybook viewport tool to test this behavior.'\n      }\n    },\n    // If the viewport addon is installed, this forces it to mobile by default in the canvas\n    viewport: {\n      defaultViewport: 'mobile1'\n    }\n  },\n  render: args => html`\n    <vi-button @click=${() => openModal('modal-responsive')}\n      >Open Responsive Modal</vi-button\n    >\n    <vi-modal id=\"modal-responsive\" size=\"md\">\n      <vi-modal-header slot=\"header\" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Mobile Optimized View</vi-modal-header>\n      <div style=\"display: flex; flex-direction: column; gap: 1rem;\">\n        <p>\n          This modal is designed to automatically adapt to small screens. When the \n          viewport width drops below 640px, it expands to 100vw and 100vh.\n        </p>\n        <div style=\"padding: 1rem; background-color: var(--vi-color-grey-100); border-radius: 4px;\">\n          <h4 style=\"margin-top: 0;\">Try it out:</h4>\n          <ol style=\"margin-bottom: 0;\">\n            <li>Open this modal on a desktop screen.</li>\n            <li>Slowly shrink your browser window width.</li>\n            <li>Watch it snap to full screen!</li>\n          </ol>\n        </div>\n        <p>\n          Also notice that if the content becomes too long, the body scrolls smoothly \n          while the header and footer remain pinned to the top and bottom of your screen, \n          ensuring action buttons are always reachable.\n        </p>\n        <!-- Adding some dummy height to prove scrolling works -->\n        <div style=\"height: 400px; border: 1px dashed var(--vi-color-grey-300); display: flex; align-items: center; justify-content: center; color: var(--vi-color-grey-500);\">\n          Scrollable Content Area\n        </div>\n      </div>\n      <vi-modal-footer slot=\"footer\">\n        <vi-button variant=\"ghost\" @click=${() => closeModal('modal-responsive')}\n          >Cancel</vi-button\n        >\n        <vi-button\n          variant=\"primary\"\n          @click=${() => closeModal('modal-responsive')}\n          >Confirm</vi-button\n        >\n      </vi-modal-footer>\n    </vi-modal>\n  `\n}",
            ...ResponsiveMobile.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","Sizes","Drawer","Alert","ScrollableContent","ProgrammaticGuard","DraggableAndMaximizable","Positioning","ZIndexStacking","PersistentWithShake","CustomAnimations","NoBackdrop","MultipleFloatingWindows","ResizableModal","ContainedDrag","CustomAppendTo","DragContainmentDemo","ModelessScroll","NestedScrolling","EventLifecycle","ResponsiveMobile"];

export { Alert, ContainedDrag, CustomAnimations, CustomAppendTo, Default, DragContainmentDemo, DraggableAndMaximizable, Drawer, EventLifecycle, ModelessScroll, MultipleFloatingWindows, NestedScrolling, NoBackdrop, PersistentWithShake, Positioning, ProgrammaticGuard, ResizableModal, ResponsiveMobile, ScrollableContent, Sizes, ZIndexStacking, __namedExportsOrder, meta as default };
