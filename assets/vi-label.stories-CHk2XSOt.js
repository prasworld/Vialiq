import { r, i, A, b } from './iframe-DecssaRk.js';
import { o } from './if-defined-DacuyPfn.js';
import { V as ViElement, t, n } from './vi-element-CZpFtKKU.js';
import { e } from './class-map-Dpe_MPwk.js';
import './vi-input-BDrXvs0U.js';
import './preload-helper-D5QYaGzd.js';
import './directive-BKuZRRPO.js';
import './focusable-mixin-CmxOyPX5.js';
import './validity-mixin-BsMHfyHD.js';
import './if-non-empty-DFN6RywG.js';

const labelStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.vi-label{--vi-label-font-size: var(--vi-font-size-sm, var(--vi-font-size-sm, .8125rem));--vi-label-font-weight: var(--vi-font-weight-medium, var(--vi-font-weight-medium, 500));--vi-label-color: var(--vi-text-primary, var(--vi-text-primary, #111827));--vi-label-color-disabled: var(--vi-text-disabled, var(--vi-text-disabled, #9e9e9e));--vi-label-required-color: var(--vi-color-error, var(--vi-color-error, #ef4444));--vi-label-optional-color: var(--vi-text-helper, var(--vi-text-helper, #9e9e9e));--vi-label-gap: var(--vi-spacing-unit, .25rem)}.vi-label{display:inline-flex;align-items:center;gap:var(--vi-label-gap);font-size:var(--vi-label-font-size);font-weight:var(--vi-label-font-weight);color:var(--vi-label-color);line-height:var(--vi-line-height-normal, 1.5715);margin:0}.vi-label.size-sm{--vi-label-font-size: var(--vi-font-size-xs, var(--vi-font-size-xs, .75rem))}.vi-label.size-lg{--vi-label-font-size: var(--vi-font-size-base, var(--vi-font-size-base, .875rem))}.vi-label.is-disabled{color:var(--vi-label-color-disabled);cursor:default}.vi-label-required{color:var(--vi-label-required-color)}.vi-label-optional{color:var(--vi-label-optional-color);font-weight:400}}:host{display:inline-block;vertical-align:middle;color:var(--vi-label-color, var(--vi-text-primary, var(--vi-text-primary, #111827)));font-size:var(--vi-label-font-size, var(--vi-font-size-sm, var(--vi-font-size-sm, .8125rem)));font-weight:var(--vi-label-font-weight, var(--vi-font-weight-medium, var(--vi-font-weight-medium, 500)))}:host([layout=stacked]){display:block;margin-bottom:var(--vi-label-margin-bottom, 8px)}:host([layout=inline]){display:inline-flex;align-items:center;margin-right:var(--vi-label-margin-inline, 12px);margin-bottom:0}:host([size=sm]){--vi-label-font-size: var(--vi-font-size-xs, var(--vi-font-size-xs, .75rem))}:host([size=lg]){--vi-label-font-size: var(--vi-font-size-base, var(--vi-font-size-base, .875rem))}:host([disabled]){color:var(--vi-label-color-disabled, var(--vi-text-disabled, var(--vi-text-disabled, #9e9e9e)));cursor:default}:host([type=primary]){--vi-label-color: var(--vi-color-text-primary, var(--vi-text-primary, #111827))}:host([type=secondary]){--vi-label-color: var(--vi-color-text-secondary, var(--vi-text-secondary, #4b5563))}::slotted(vi-tooltip){margin-inline-start:var(--vi-label-gap, 4px)}";

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
var _dec, _initClass, _ViElement, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, /** ID of the associated control */ _init_for, /** Show required `*` indicator */ _init_required, /** Show "(optional)" text */ _init_optional, /** Muted disabled styling */ _init_disabled, /** Font size variant */ _init_size, /** Layout spacing behavior */ _init_layout, /** Semantic text color */ _init_type, _initProto;
let _ViLabel;
_dec = t('vi-label'), _dec1 = n({
    type: String
}), _dec2 = n({
    type: Boolean
}), _dec3 = n({
    type: Boolean
}), _dec4 = n({
    type: Boolean,
    reflect: true
}), _dec5 = n({
    type: String
}), _dec6 = n({
    type: String,
    reflect: true
}), _dec7 = n({
    type: String,
    reflect: true
});
new class extends _identity {
    constructor(){
        super(_ViLabel), _initClass();
    }
    static{
        class ViLabel extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_for, _init_required, _init_optional, _init_disabled, _init_size, _init_layout, _init_type, _initProto], c: [_ViLabel, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "for"
                    ],
                    [
                        _dec2,
                        1,
                        "required"
                    ],
                    [
                        _dec3,
                        1,
                        "optional"
                    ],
                    [
                        _dec4,
                        1,
                        "disabled"
                    ],
                    [
                        _dec5,
                        1,
                        "size"
                    ],
                    [
                        _dec6,
                        1,
                        "layout"
                    ],
                    [
                        _dec7,
                        1,
                        "type"
                    ]
                ], [
                    _dec
                ], _ViElement));
            }
            static styles = i`
    ${r(labelStyles)}
  `;
            #___private_for_1 = (_initProto(this), _init_for(this, ''));
            get for() {
                return this.#___private_for_1;
            }
            set for(_v) {
                this.#___private_for_1 = _v;
            }
            #___private_required_2 = _init_required(this, false);
            get required() {
                return this.#___private_required_2;
            }
            set required(_v) {
                this.#___private_required_2 = _v;
            }
            #___private_optional_3 = _init_optional(this, false);
            get optional() {
                return this.#___private_optional_3;
            }
            set optional(_v) {
                this.#___private_optional_3 = _v;
            }
            #___private_disabled_4 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_4;
            }
            set disabled(_v) {
                this.#___private_disabled_4 = _v;
            }
            #___private_size_5 = _init_size(this, 'md');
            get size() {
                return this.#___private_size_5;
            }
            set size(_v) {
                this.#___private_size_5 = _v;
            }
            #___private_layout_6 = _init_layout(this, 'stacked');
            get layout() {
                return this.#___private_layout_6;
            }
            set layout(_v) {
                this.#___private_layout_6 = _v;
            }
            #___private_type_7 = _init_type(this, 'default');
            get type() {
                return this.#___private_type_7;
            }
            set type(_v) {
                this.#___private_type_7 = _v;
            }
            _hasTooltip = false;
            _handleSlotChange(e) {
                const slot = e.target;
                const nodes = slot.assignedNodes({
                    flatten: true
                });
                this._hasTooltip = nodes.some((node)=>node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()));
                this.requestUpdate();
            }
            _handleClick(e) {
                if (this.disabled) {
                    e.preventDefault();
                    return;
                }
                if (!this.for) {
                    return; // Do not prevent default if it's wrapping an input normally
                }
                // Custom elements are not natively 'labelable' by the browser, so we must
                // manually route the focus/click.
                const rootNode = this.getRootNode();
                const target = rootNode.getElementById(this.for);
                if (target) {
                    e.preventDefault();
                    target.focus();
                    if ('click' in target && typeof target.click === 'function') {
                        target.click();
                    }
                }
            }
            updated(changedProperties) {
                super.updated(changedProperties);
                // Cross shadow boundary workaround for screen readers
                // Link the aria-labelledby of the target to this label's ID natively in Light DOM
                if (changedProperties.has('for') && this.for) {
                    const rootNode = this.getRootNode();
                    const target = rootNode.getElementById(this.for);
                    if (target) {
                        if (!this.id) {
                            this.id = `vi-label-${Math.random().toString(36).substring(2, 9)}`;
                        }
                        const currentAria = target.getAttribute('aria-labelledby') || '';
                        if (!currentAria.includes(this.id)) {
                            const newAria = currentAria ? `${currentAria} ${this.id}` : this.id;
                            target.setAttribute('aria-labelledby', newAria);
                        }
                    }
                }
            }
            render() {
                const classes = {
                    'vi-label': true,
                    [`size-${this.size}`]: true,
                    'is-disabled': this.disabled
                };
                return b`
      <label part="label" class=${e(classes)} for=${this.for || A} @click=${this._handleClick}>
        <slot></slot>

        ${this.required ? b`
              <span part="required-indicator" class="vi-label-required" aria-hidden="true">*</span>
            ` : A}

        ${this.optional && !this.required ? b`
              <span part="optional-indicator" class="vi-label-optional">(optional)</span>
            ` : A}

        <span part="tooltip-trigger" style=${!this._hasTooltip ? 'display: none;' : A}>
          <slot name="tooltip" @slotchange=${this._handleSlotChange}></slot>
        </span>
      </label>
    `;
            }
        }
    }
}();

const meta = {
    title: 'Components/Label',
    component: 'vi-label',
    tags: [
        'autodocs'
    ],
    argTypes: {
        for: {
            control: 'text',
            description: 'ID of the associated control'
        },
        required: {
            control: 'boolean',
            description: 'Show required `*` indicator'
        },
        optional: {
            control: 'boolean',
            description: 'Show "(optional)" text'
        },
        disabled: {
            control: 'boolean',
            description: 'Muted disabled styling'
        },
        size: {
            control: 'select',
            options: [
                'sm',
                'md',
                'lg'
            ],
            description: 'Font size variant'
        },
        layout: {
            control: 'select',
            options: [
                'stacked',
                'inline'
            ],
            description: 'Layout spacing behavior'
        },
        type: {
            control: 'select',
            options: [
                'default',
                'primary',
                'secondary'
            ],
            description: 'Semantic text color'
        }
    },
    args: {
        required: false,
        optional: false,
        disabled: false,
        size: 'md',
        layout: 'stacked',
        type: 'default'
    }
};
const Default = {
    render: (args)=>b`
    <vi-label
      for="default-input"
      ?required=${args.required}
      ?optional=${args.optional}
      ?disabled=${args.disabled}
      size=${o(args.size)}
      layout=${o(args.layout)}
      type=${o(args.type)}
    >
      Label Text
    </vi-label>
    <vi-input id="default-input" ?disabled=${args.disabled}></vi-input>
  `
};
const Required = {
    args: {
        required: true
    },
    render: (args)=>b`
    <vi-label
      for="required-input"
      ?required=${args.required}
      ?optional=${args.optional}
      ?disabled=${args.disabled}
      size=${o(args.size)}
      layout=${o(args.layout)}
      type=${o(args.type)}
    >
      Subject ID
    </vi-label>
    <vi-input id="required-input" ?disabled=${args.disabled}></vi-input>
  `
};
const Optional = {
    args: {
        optional: true
    },
    render: (args)=>b`
    <vi-label
      for="optional-input"
      ?required=${args.required}
      ?optional=${args.optional}
      ?disabled=${args.disabled}
      size=${o(args.size)}
      layout=${o(args.layout)}
      type=${o(args.type)}
    >
      Middle Name
    </vi-label>
    <vi-input id="optional-input" ?disabled=${args.disabled}></vi-input>
  `
};
const Sizes = {
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <vi-label size="sm" for="size-sm">Small Label</vi-label>
        <vi-input size="sm" id="size-sm"></vi-input>
      </div>
      <div>
        <vi-label size="md" for="size-md">Medium Label</vi-label>
        <vi-input size="md" id="size-md"></vi-input>
      </div>
      <div>
        <vi-label size="lg" for="size-lg">Large Label</vi-label>
        <vi-input size="lg" id="size-lg"></vi-input>
      </div>
    </div>
  `
};
const Disabled = {
    args: {
        disabled: true
    },
    render: (args)=>b`
    <vi-label
      for="disabled-input"
      ?required=${args.required}
      ?optional=${args.optional}
      ?disabled=${args.disabled}
      size=${o(args.size)}
      layout=${o(args.layout)}
      type=${o(args.type)}
    >
      Disabled Label
    </vi-label>
  `
};
const LayoutInline = {
    args: {
        layout: 'inline'
    },
    render: (args)=>b`
    <div style="display: flex; align-items: center;">
      <vi-label
        for="inline-input"
        ?required=${args.required}
        ?optional=${args.optional}
        ?disabled=${args.disabled}
        size=${o(args.size)}
        layout=${o(args.layout)}
        type=${o(args.type)}
      >
        Inline Label
      </vi-label>
      <vi-input id="inline-input" ?disabled=${args.disabled}></vi-input>
    </div>
  `
};
const SemanticTypes = {
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div>
        <vi-label type="default" for="type-default">Default Label</vi-label>
        <vi-input id="type-default"></vi-input>
      </div>
      <div>
        <vi-label type="primary" for="type-primary">Primary Label</vi-label>
        <vi-input id="type-primary"></vi-input>
      </div>
      <div>
        <vi-label type="secondary" for="type-secondary">Secondary Label</vi-label>
        <vi-input id="type-secondary"></vi-input>
      </div>
    </div>
  `
};
const WithTooltip = {
    render: (args)=>b`
    <vi-label
      for="tooltip-input"
      ?required=${args.required}
      ?optional=${args.optional}
      ?disabled=${args.disabled}
      size=${o(args.size)}
      layout=${o(args.layout)}
      type=${o(args.type)}
    >
      Label with Tooltip
      <span slot="tooltip" style="cursor: help; margin-left: 4px;" title="Helpful information about this field">ℹ️</span>
    </vi-label>
    <vi-input id="tooltip-input" ?disabled=${args.disabled}></vi-input>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <vi-label\n      for=\"default-input\"\n      ?required=${args.required}\n      ?optional=${args.optional}\n      ?disabled=${args.disabled}\n      size=${ifDefined(args.size)}\n      layout=${ifDefined(args.layout)}\n      type=${ifDefined(args.type)}\n    >\n      Label Text\n    </vi-label>\n    <vi-input id=\"default-input\" ?disabled=${args.disabled}></vi-input>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
Required.parameters = {
    ...Required.parameters,
    docs: {
        ...Required.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    required: true\n  },\n  render: args => html`\n    <vi-label\n      for=\"required-input\"\n      ?required=${args.required}\n      ?optional=${args.optional}\n      ?disabled=${args.disabled}\n      size=${ifDefined(args.size)}\n      layout=${ifDefined(args.layout)}\n      type=${ifDefined(args.type)}\n    >\n      Subject ID\n    </vi-label>\n    <vi-input id=\"required-input\" ?disabled=${args.disabled}></vi-input>\n  `\n}",
            ...Required.parameters?.docs?.source
        }
    }
};
Optional.parameters = {
    ...Optional.parameters,
    docs: {
        ...Optional.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    optional: true\n  },\n  render: args => html`\n    <vi-label\n      for=\"optional-input\"\n      ?required=${args.required}\n      ?optional=${args.optional}\n      ?disabled=${args.disabled}\n      size=${ifDefined(args.size)}\n      layout=${ifDefined(args.layout)}\n      type=${ifDefined(args.type)}\n    >\n      Middle Name\n    </vi-label>\n    <vi-input id=\"optional-input\" ?disabled=${args.disabled}></vi-input>\n  `\n}",
            ...Optional.parameters?.docs?.source
        }
    }
};
Sizes.parameters = {
    ...Sizes.parameters,
    docs: {
        ...Sizes.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 1rem;\">\n      <div>\n        <vi-label size=\"sm\" for=\"size-sm\">Small Label</vi-label>\n        <vi-input size=\"sm\" id=\"size-sm\"></vi-input>\n      </div>\n      <div>\n        <vi-label size=\"md\" for=\"size-md\">Medium Label</vi-label>\n        <vi-input size=\"md\" id=\"size-md\"></vi-input>\n      </div>\n      <div>\n        <vi-label size=\"lg\" for=\"size-lg\">Large Label</vi-label>\n        <vi-input size=\"lg\" id=\"size-lg\"></vi-input>\n      </div>\n    </div>\n  `\n}",
            ...Sizes.parameters?.docs?.source
        }
    }
};
Disabled.parameters = {
    ...Disabled.parameters,
    docs: {
        ...Disabled.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    disabled: true\n  },\n  render: args => html`\n    <vi-label\n      for=\"disabled-input\"\n      ?required=${args.required}\n      ?optional=${args.optional}\n      ?disabled=${args.disabled}\n      size=${ifDefined(args.size)}\n      layout=${ifDefined(args.layout)}\n      type=${ifDefined(args.type)}\n    >\n      Disabled Label\n    </vi-label>\n  `\n}",
            ...Disabled.parameters?.docs?.source
        }
    }
};
LayoutInline.parameters = {
    ...LayoutInline.parameters,
    docs: {
        ...LayoutInline.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    layout: 'inline'\n  },\n  render: args => html`\n    <div style=\"display: flex; align-items: center;\">\n      <vi-label\n        for=\"inline-input\"\n        ?required=${args.required}\n        ?optional=${args.optional}\n        ?disabled=${args.disabled}\n        size=${ifDefined(args.size)}\n        layout=${ifDefined(args.layout)}\n        type=${ifDefined(args.type)}\n      >\n        Inline Label\n      </vi-label>\n      <vi-input id=\"inline-input\" ?disabled=${args.disabled}></vi-input>\n    </div>\n  `\n}",
            ...LayoutInline.parameters?.docs?.source
        }
    }
};
SemanticTypes.parameters = {
    ...SemanticTypes.parameters,
    docs: {
        ...SemanticTypes.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 1.5rem;\">\n      <div>\n        <vi-label type=\"default\" for=\"type-default\">Default Label</vi-label>\n        <vi-input id=\"type-default\"></vi-input>\n      </div>\n      <div>\n        <vi-label type=\"primary\" for=\"type-primary\">Primary Label</vi-label>\n        <vi-input id=\"type-primary\"></vi-input>\n      </div>\n      <div>\n        <vi-label type=\"secondary\" for=\"type-secondary\">Secondary Label</vi-label>\n        <vi-input id=\"type-secondary\"></vi-input>\n      </div>\n    </div>\n  `\n}",
            ...SemanticTypes.parameters?.docs?.source
        }
    }
};
WithTooltip.parameters = {
    ...WithTooltip.parameters,
    docs: {
        ...WithTooltip.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <vi-label\n      for=\"tooltip-input\"\n      ?required=${args.required}\n      ?optional=${args.optional}\n      ?disabled=${args.disabled}\n      size=${ifDefined(args.size)}\n      layout=${ifDefined(args.layout)}\n      type=${ifDefined(args.type)}\n    >\n      Label with Tooltip\n      <span slot=\"tooltip\" style=\"cursor: help; margin-left: 4px;\" title=\"Helpful information about this field\">\u2139\uFE0F</span>\n    </vi-label>\n    <vi-input id=\"tooltip-input\" ?disabled=${args.disabled}></vi-input>\n  `\n}",
            ...WithTooltip.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","Required","Optional","Sizes","Disabled","LayoutInline","SemanticTypes","WithTooltip"];

export { Default, Disabled, LayoutInline, Optional, Required, SemanticTypes, Sizes, WithTooltip, __namedExportsOrder, meta as default };
