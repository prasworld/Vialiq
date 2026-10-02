import { b } from './iframe-C5KGnDWv.js';
import { o } from './if-defined-kcNOoE5f.js';
import { _ as __vitePreload } from './preload-helper-D5QYaGzd.js';
import { t, n } from './vi-element-B5V_Ir3U.js';
import { _ as _ViInput$1 } from './vi-input-XELU7gJF.js';
import './focusable-mixin-DkKvOjpm.js';
import './validity-mixin-DNEYOJjM.js';
import './if-non-empty-CS-n4cU8.js';

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
var _dec, _initClass, _ViInput, _dec1, _dec2, _dec3, /**
   * The mask pattern.
   * If not provided, it behaves exactly like a standard vi-input.
   * @attr mask
   */ _init_mask, /**
   * Advanced IMask configuration object.
   * Useful for dynamic masks (e.g. Credit Cards) or RegExp masks.
   * Takes precedence over the string \`mask\` property.
   * @prop {any} maskOptions
   */ _init_maskOptions, /**
   * The unmasked, raw underlying value.
   * @attr rawValue
   */ _init_rawValue, _initProto;
let _ViMaskedInput;
_dec = t('vi-masked-input'), _dec1 = n({
    type: String
}), _dec2 = n({
    attribute: false
}), _dec3 = n({
    type: String,
    attribute: 'raw-value',
    reflect: true
});
class ViMaskedInput extends (_ViInput = _ViInput$1) {
    static{
        ({ e: [_init_mask, _init_maskOptions, _init_rawValue, _initProto], c: [_ViMaskedInput, _initClass] } = _apply_decs_2203_r(this, [
            [
                _dec1,
                1,
                "mask"
            ],
            [
                _dec2,
                1,
                "maskOptions"
            ],
            [
                _dec3,
                1,
                "rawValue"
            ]
        ], [
            _dec
        ], _ViInput));
    }
    #___private_mask_1 = (_initProto(this), _init_mask(this, ''));
    get mask() {
        return this.#___private_mask_1;
    }
    set mask(_v) {
        this.#___private_mask_1 = _v;
    }
    #___private_maskOptions_2 = _init_maskOptions(this, null);
    get maskOptions() {
        return this.#___private_maskOptions_2;
    }
    set maskOptions(_v) {
        this.#___private_maskOptions_2 = _v;
    }
    #___private_rawValue_3 = _init_rawValue(this, '');
    get rawValue() {
        return this.#___private_rawValue_3;
    }
    set rawValue(_v) {
        this.#___private_rawValue_3 = _v;
    }
    _maskInstance = null;
    async connectedCallback() {
        super.connectedCallback();
        // Defer initialization slightly to ensure the native <input> is rendered in shadow DOM
        await this.updateComplete;
        // Lazy load IMask only if a mask/maskOptions is provided and component is mounted
        if ((this.mask || this.maskOptions) && !this._maskInstance) {
            const { default: IMask } = await __vitePreload(async () => { const { default: IMask } = await import('./index-BLwT7fu_.js');return { default: IMask }},true              ?[]:void 0,import.meta.url);
            this._initMask(IMask);
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._maskInstance) {
            this._maskInstance.destroy();
            this._maskInstance = null;
        }
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        // If mask pattern or options change dynamically, update, init, or destroy IMask
        if (changedProperties.has('mask') || changedProperties.has('maskOptions')) {
            const hasMask = !!(this.mask || this.maskOptions);
            if (hasMask) {
                if (this._maskInstance) {
                    this._maskInstance.updateOptions(this.maskOptions || {
                        mask: this.mask
                    });
                } else {
                    __vitePreload(async () => { const {default: IMask} = await import('./index-BLwT7fu_.js');return { default: IMask }},true              ?[]:void 0,import.meta.url).then(({ default: IMask })=>{
                        if ((this.mask || this.maskOptions) && !this._maskInstance) {
                            this._initMask(IMask);
                        }
                    });
                }
            } else if (this._maskInstance) {
                this._maskInstance.destroy();
                this._maskInstance = null;
            }
        }
        // If consumer programmatically sets value, sync it to mask instance
        if (changedProperties.has('value') && this._maskInstance && this.value !== this._maskInstance.value) {
            this._maskInstance.value = this.value;
            this.rawValue = this._maskInstance.unmaskedValue;
        }
    }
    _initMask(IMask) {
        const inputEl = this.shadowRoot?.querySelector('input');
        if (!inputEl) return;
        const options = this.maskOptions || {
            mask: this.mask
        };
        this._maskInstance = IMask(inputEl, options);
        if (this.rawValue) {
            this._maskInstance.unmaskedValue = this.rawValue;
            this.value = this._maskInstance.value;
        } else if (this.value) {
            this._maskInstance.value = this.value;
            this.rawValue = this._maskInstance.unmaskedValue;
        }
        // Handle cut/paste/type
        this._maskInstance.on('accept', ()=>{
            // Suppress the native events of ViInput when masked so we don't fire twice
            // We do this by keeping internal states in sync before native handlers fire
            this.value = this._maskInstance.value;
            this.rawValue = this._maskInstance.unmaskedValue;
            this.dispatchEvent(new CustomEvent('vi-masked-input-input', {
                detail: {
                    value: this.value,
                    rawValue: this.rawValue
                },
                bubbles: true,
                composed: true
            }));
        });
        this._maskInstance.on('complete', ()=>{
        // Optional hook if we want to add valid states automatically on complete
        });
    }
    // Override the ViInput internal handlers to prevent duplicate firing of standard events
    // We emit our own typed masked events instead.
    _onInput(e) {
        // If mask is active, IMask's 'accept' event handles updating state and firing our custom event.
        // We prevent ViInput's default _onInput from firing a generic 'vi-input-input' event.
        if (!this._maskInstance) {
            super._onInput(e);
        }
    }
    _onChange(e) {
        if (this._maskInstance) {
            this.dispatchEvent(new CustomEvent('vi-masked-input-change', {
                detail: {
                    value: this.value,
                    rawValue: this.rawValue
                },
                bubbles: true,
                composed: true
            }));
        } else {
            super._onChange(e);
        }
    }
    static{
        _initClass();
    }
}

const meta = {
    title: 'Components/Masked Input',
    component: 'vi-masked-input',
    argTypes: {
        mask: {
            control: 'text',
            description: 'The mask pattern (e.g. "(000) 000-0000")'
        },
        value: {
            control: 'text',
            description: 'The formatted value'
        },
        rawValue: {
            control: 'text',
            description: 'The unmasked raw value'
        },
        label: {
            control: 'text'
        },
        disabled: {
            control: 'boolean'
        },
        required: {
            control: 'boolean'
        }
    },
    parameters: {
        actions: {
            handles: [
                'vi-masked-input-input',
                'vi-masked-input-change'
            ]
        }
    }
};
const Default = {
    args: {
        label: 'Phone Number',
        mask: '(000) 000-0000',
        placeholder: '(555) 555-5555'
    },
    render: (args)=>b`
    <vi-masked-input
      label=${o(args.label)}
      mask=${o(args.mask)}
      placeholder=${o(args.placeholder)}
      value=${o(args.value)}
      ?disabled=${args.disabled}
      ?required=${args.required}
    ></vi-masked-input>
  `
};
const SocialSecurity = {
    args: {
        label: 'SSN',
        mask: '000-00-0000',
        placeholder: '___-__-____'
    },
    render: (args)=>b`
    <vi-masked-input
      label=${o(args.label)}
      mask=${o(args.mask)}
      placeholder=${o(args.placeholder)}
    ></vi-masked-input>
  `
};
const PreFilled = {
    args: {
        label: 'Pre-filled from Raw',
        mask: '(000) 000-0000',
        rawValue: '1234567890'
    },
    render: (args)=>b`
    <vi-masked-input
      label=${o(args.label)}
      mask=${o(args.mask)}
      raw-value=${o(args.rawValue)}
    ></vi-masked-input>
  `
};
const Alphanumeric = {
    args: {
        label: 'License Key (Alphanumeric)',
        mask: '****-****-****',
        placeholder: 'ABCD-1234-EFGH'
    },
    render: (args)=>b`
    <vi-masked-input
      label=${o(args.label)}
      mask=${o(args.mask)}
      placeholder=${o(args.placeholder)}
    ></vi-masked-input>
    <div style="margin-top: 8px; font-size: 14px; color: #666;">
      <strong>Note:</strong> In the mask property, <code>0</code> restricts to
      numbers, <code>a</code> restricts to letters, and <code>*</code> allows
      any alphanumeric character.
    </div>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    label: 'Phone Number',\n    mask: '(000) 000-0000',\n    placeholder: '(555) 555-5555'\n  },\n  render: args => html`\n    <vi-masked-input\n      label=${ifDefined(args.label)}\n      mask=${ifDefined(args.mask)}\n      placeholder=${ifDefined(args.placeholder)}\n      value=${ifDefined(args.value)}\n      ?disabled=${args.disabled}\n      ?required=${args.required}\n    ></vi-masked-input>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
SocialSecurity.parameters = {
    ...SocialSecurity.parameters,
    docs: {
        ...SocialSecurity.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    label: 'SSN',\n    mask: '000-00-0000',\n    placeholder: '___-__-____'\n  },\n  render: args => html`\n    <vi-masked-input\n      label=${ifDefined(args.label)}\n      mask=${ifDefined(args.mask)}\n      placeholder=${ifDefined(args.placeholder)}\n    ></vi-masked-input>\n  `\n}",
            ...SocialSecurity.parameters?.docs?.source
        }
    }
};
PreFilled.parameters = {
    ...PreFilled.parameters,
    docs: {
        ...PreFilled.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    label: 'Pre-filled from Raw',\n    mask: '(000) 000-0000',\n    rawValue: '1234567890'\n  },\n  render: args => html`\n    <vi-masked-input\n      label=${ifDefined(args.label)}\n      mask=${ifDefined(args.mask)}\n      raw-value=${ifDefined(args.rawValue)}\n    ></vi-masked-input>\n  `\n}",
            ...PreFilled.parameters?.docs?.source
        }
    }
};
Alphanumeric.parameters = {
    ...Alphanumeric.parameters,
    docs: {
        ...Alphanumeric.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    label: 'License Key (Alphanumeric)',\n    mask: '****-****-****',\n    placeholder: 'ABCD-1234-EFGH'\n  },\n  render: args => html`\n    <vi-masked-input\n      label=${ifDefined(args.label)}\n      mask=${ifDefined(args.mask)}\n      placeholder=${ifDefined(args.placeholder)}\n    ></vi-masked-input>\n    <div style=\"margin-top: 8px; font-size: 14px; color: #666;\">\n      <strong>Note:</strong> In the mask property, <code>0</code> restricts to\n      numbers, <code>a</code> restricts to letters, and <code>*</code> allows\n      any alphanumeric character.\n    </div>\n  `\n}",
            ...Alphanumeric.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","SocialSecurity","PreFilled","Alphanumeric"];

export { Alphanumeric, Default, PreFilled, SocialSecurity, __namedExportsOrder, meta as default };
