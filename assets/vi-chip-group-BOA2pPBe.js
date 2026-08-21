import { r, i, b } from './iframe-DLZvjPtb.js';
import { V as ViElement, t, n } from './vi-element-Dvl4DFHz.js';
import { e } from './base-Cl6v8-BZ.js';
import { V as ValidityMixin } from './validity-mixin-CIusymNJ.js';

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function o(o){return (e$1,n)=>{const{slot:r,selector:s}=o??{},c="slot"+(r?`[name=${r}]`:":not([name])");return e(e$1,n,{get(){const t=this.renderRoot?.querySelector(c),e=t?.assignedElements(o)??[];return void 0===s?e:e.filter(t=>t.matches(s))}})}}

const groupStyles = ":host{display:block}:host([hidden]){display:none!important}[part=group]{display:flex;align-items:center}";

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
var _dec, _initClass, _ValidityMixin, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, /** Currently selected chip values. */ _init_value, /** Allow multiple selections. */ _init_multi, /** Form field name. */ _init_name, /** At least one chip must be selected. */ _init_required, /** Disable all chips. */ _init_disabled, /** Chips wrap to next line. */ _init_wrap, /** Gap between chips. */ _init_gap, _init_status, _init_validityMessage, _init__chips, _initProto;
let _ViChipGroup;
_dec = t('vi-chip-group'), _dec1 = n({
    type: Array
}), _dec2 = n({
    type: Boolean
}), _dec3 = n({
    type: String
}), _dec4 = n({
    type: Boolean,
    reflect: true
}), _dec5 = n({
    type: Boolean,
    reflect: true
}), _dec6 = n({
    type: Boolean
}), _dec7 = n({
    type: String
}), _dec8 = n({
    reflect: true
}), _dec9 = n(), _dec10 = o({
    selector: 'vi-chip'
});
new class extends _identity {
    constructor(){
        super(_ViChipGroup), _initClass();
    }
    static{
        class ViChipGroup extends (_ValidityMixin = ValidityMixin(ViElement)) {
            static{
                ({ e: [_init_value, _init_multi, _init_name, _init_required, _init_disabled, _init_wrap, _init_gap, _init_status, _init_validityMessage, _init__chips, _initProto], c: [_ViChipGroup, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "value"
                    ],
                    [
                        _dec2,
                        1,
                        "multi"
                    ],
                    [
                        _dec3,
                        1,
                        "name"
                    ],
                    [
                        _dec4,
                        1,
                        "required"
                    ],
                    [
                        _dec5,
                        1,
                        "disabled"
                    ],
                    [
                        _dec6,
                        1,
                        "wrap"
                    ],
                    [
                        _dec7,
                        1,
                        "gap"
                    ],
                    [
                        _dec8,
                        1,
                        "status"
                    ],
                    [
                        _dec9,
                        1,
                        "validityMessage"
                    ],
                    [
                        _dec10,
                        1,
                        "_chips"
                    ]
                ], [
                    _dec
                ], _ValidityMixin));
            }
            static styles = i`${r(groupStyles)}`;
            #___private_value_1 = (_initProto(this), _init_value(this, []));
            get value() {
                return this.#___private_value_1;
            }
            set value(_v) {
                this.#___private_value_1 = _v;
            }
            #___private_multi_2 = _init_multi(this, true);
            get multi() {
                return this.#___private_multi_2;
            }
            set multi(_v) {
                this.#___private_multi_2 = _v;
            }
            #___private_name_3 = _init_name(this, '');
            get name() {
                return this.#___private_name_3;
            }
            set name(_v) {
                this.#___private_name_3 = _v;
            }
            #___private_required_4 = _init_required(this, false);
            get required() {
                return this.#___private_required_4;
            }
            set required(_v) {
                this.#___private_required_4 = _v;
            }
            #___private_disabled_5 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_5;
            }
            set disabled(_v) {
                this.#___private_disabled_5 = _v;
            }
            #___private_wrap_6 = _init_wrap(this, true);
            get wrap() {
                return this.#___private_wrap_6;
            }
            set wrap(_v) {
                this.#___private_wrap_6 = _v;
            }
            #___private_gap_7 = _init_gap(this, '8px');
            get gap() {
                return this.#___private_gap_7;
            }
            set gap(_v) {
                this.#___private_gap_7 = _v;
            }
            #___private_status_8 = _init_status(this, 'default');
            get status() {
                return this.#___private_status_8;
            }
            set status(_v) {
                this.#___private_status_8 = _v;
            }
            #___private_validityMessage_9 = _init_validityMessage(this, '');
            get validityMessage() {
                return this.#___private_validityMessage_9;
            }
            set validityMessage(_v) {
                this.#___private_validityMessage_9 = _v;
            }
            #___private__chips_10 = _init__chips(this);
            get _chips() {
                return this.#___private__chips_10;
            }
            set _chips(_v) {
                this.#___private__chips_10 = _v;
            }
            _mutationObserver;
            constructor(){
                super();
                this._mutationObserver = new MutationObserver(()=>this._syncChips());
                this.addEventListener('vi-chip-select', this._handleChipSelect);
            }
            connectedCallback() {
                super.connectedCallback();
                this._syncInternals();
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this._mutationObserver.disconnect();
            }
            updated(changed) {
                super.updated(changed);
                if (changed.has('value')) {
                    this._syncInternals();
                    this._syncChips();
                }
                if (changed.has('disabled')) {
                    this._syncChips();
                }
            }
            formResetCallback() {
                const initialValue = this.getAttribute('value');
                if (initialValue) {
                    try {
                        const parsed = JSON.parse(initialValue);
                        this.value = Array.isArray(parsed) ? parsed : [
                            initialValue
                        ];
                    } catch  {
                        this.value = [
                            initialValue
                        ];
                    }
                } else {
                    this.value = [];
                }
                this.status = 'default';
                this.validityMessage = '';
            }
            formStateRestoreCallback(state, _mode) {
                if (typeof state === 'string') {
                    try {
                        const parsed = JSON.parse(state);
                        this.value = Array.isArray(parsed) ? parsed : [
                            state
                        ];
                    } catch  {
                        this.value = [
                            state
                        ];
                    }
                } else if (state instanceof FormData) {
                    const values = state.getAll(this.name);
                    this.value = values.map((v)=>v.toString());
                }
            }
            formDisabledCallback(disabled) {
                this.disabled = disabled;
            }
            _testValidity() {
                if (this.required && this.value.length === 0) {
                    return {
                        valueMissing: true
                    };
                }
                return {};
            }
            /** Selects all available child chips (if multi is true) */ selectAll() {
                if (!this.multi) return;
                this.value = this._chips.map((chip)=>chip.value).filter((val)=>val !== undefined);
                this.dispatchEvent(new CustomEvent('vi-chip-group-change', {
                    detail: {
                        value: this.value
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            /** Deselects all child chips */ clearAll() {
                this.value = [];
                this.dispatchEvent(new CustomEvent('vi-chip-group-change', {
                    detail: {
                        value: this.value
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            _syncInternals() {
                const formData = new FormData();
                this.value.forEach((val)=>formData.append(this.name, val));
                this._internals.setFormValue(formData);
            }
            _syncChips() {
                if (!this._chips) return;
                let hasFocusable = false;
                this._chips.forEach((chip)=>{
                    chip.selected = this.value.includes(chip.value);
                    if (this.disabled) {
                        chip.disabled = true;
                    } else {
                        chip.disabled = chip.hasAttribute('disabled');
                    }
                    // Roving tabindex: Only the first selected chip (or the first chip if none selected) is focusable
                    if (!chip.disabled && (chip.selected || !hasFocusable && this.value.length === 0)) {
                        chip.tabIndex = 0;
                        hasFocusable = true;
                    } else {
                        chip.tabIndex = -1;
                    }
                });
                // If no chip was focusable yet (e.g. none selected), make the first non-disabled chip focusable
                if (!hasFocusable && this._chips.length > 0) {
                    const firstEnabled = this._chips.find((c)=>!c.disabled);
                    if (firstEnabled) firstEnabled.tabIndex = 0;
                }
            }
            _handleSlotChange() {
                this._syncChips();
                // Disconnect old, connect new observers for child mutations
                this._mutationObserver.disconnect();
                this._chips.forEach((chip)=>{
                    this._mutationObserver.observe(chip, {
                        attributes: true,
                        attributeFilter: [
                            'value',
                            'disabled'
                        ]
                    });
                });
            }
            _handleChipSelect(e) {
                e.stopPropagation(); // Stop the inner event
                const { value, selected } = e.detail;
                let newValue = [
                    ...this.value
                ];
                if (this.multi) {
                    if (selected) {
                        if (!newValue.includes(value)) newValue.push(value);
                    } else {
                        newValue = newValue.filter((v)=>v !== value);
                    }
                } else {
                    if (selected) {
                        newValue = [
                            value
                        ];
                    } else {
                        // In single select, clicking a selected chip could deselect it depending on requirements.
                        // Assuming it toggles.
                        newValue = [];
                    }
                }
                this.value = newValue;
                this.dispatchEvent(new CustomEvent('vi-chip-group-change', {
                    detail: {
                        value: this.value
                    },
                    bubbles: true,
                    composed: true
                }));
            }
            _handleKeyDown(e) {
                const focusableChips = this._chips.filter((c)=>!c.disabled);
                if (focusableChips.length === 0) return;
                const currentIndex = focusableChips.findIndex((c)=>c === document.activeElement || c.shadowRoot?.activeElement);
                if (currentIndex === -1) return;
                let nextIndex = currentIndex;
                switch(e.key){
                    case 'ArrowRight':
                    case 'ArrowDown':
                        e.preventDefault();
                        nextIndex = (currentIndex + 1) % focusableChips.length;
                        break;
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        e.preventDefault();
                        nextIndex = (currentIndex - 1 + focusableChips.length) % focusableChips.length;
                        break;
                    case 'Home':
                        e.preventDefault();
                        nextIndex = 0;
                        break;
                    case 'End':
                        e.preventDefault();
                        nextIndex = focusableChips.length - 1;
                        break;
                    default:
                        return; // Let other keys do their thing
                }
                this._chips.forEach((c)=>c.tabIndex = -1);
                const nextChip = focusableChips[nextIndex];
                nextChip.tabIndex = 0;
                nextChip.focus();
            }
            render() {
                const style = `gap: ${this.gap}; flex-wrap: ${this.wrap ? 'wrap' : 'nowrap'};`;
                return b`
      <div
        part="group"
        role="listbox"
        aria-multiselectable=${this.multi ? 'true' : 'false'}
        aria-required=${this.required ? 'true' : 'false'}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        style=${style}
        @keydown=${this._handleKeyDown}
      >
        <slot @slotchange=${this._handleSlotChange}></slot>
      </div>
    `;
            }
        }
    }
}();
