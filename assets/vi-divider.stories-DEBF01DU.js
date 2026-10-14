import { r as r$1, i, b, A } from './iframe-HYUOBlkX.js';
import { V as ViElement, t, n } from './vi-element-CfjAgxlD.js';
import { r } from './state-B9TAfF5K.js';
import { e } from './class-map-OLIt12rv.js';
import { o } from './style-map-BKHAWzh3.js';
import './vi-button-CPKznN1p.js';
import './vi-icon-Cnd4Jh50.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import { s as saveIcon, f as fileTextIcon } from './save-DLPFi_QN.js';
import { l as lockIcon } from './lock-CCJyCMJ1.js';
import { t as triangleWarningIcon } from './triangle-warning-DChErXmA.js';
import './preload-helper-D5QYaGzd.js';
import './directive-BKuZRRPO.js';
import './focusable-mixin-DkKvOjpm.js';

const dividerStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.divider{box-sizing:border-box;color:var(--vi-divider-text-color, var(--vi-text-primary, #111827));font-size:var(--vi-divider-font-size, var(--vi-font-size-base, .875rem));line-height:var(--vi-line-height-normal, 1.5715);list-style:none}.divider--horizontal{display:flex;align-items:center;margin-block:var(--vi-divider-margin-block, var(--vi-spacing-md, 1rem));margin-inline:0;clear:both;width:100%;min-width:100%}.divider--horizontal.divider--dashed{--vi-divider-style: dashed}.divider--horizontal.divider--plain .divider__text{font-weight:var(--vi-divider-plain-font-weight, var(--vi-font-weight-normal, 400));color:var(--vi-divider-text-plain-color, var(--vi-text-secondary, #4b5563))}.divider__line-start,.divider__line-end{position:relative;flex-grow:1;border-top:var(--vi-divider-width, var(--vi-border-width-thin, 1px)) var(--vi-divider-style, solid) var(--vi-divider-color, var(--vi-border-03, #e0e0e0));transform:translateY(50%)}.divider--placement-center .divider__line-start,.divider--placement-center .divider__line-end{flex-grow:1}.divider--placement-left .divider__line-start{flex-grow:0;flex-basis:var(--vi-divider-text-margin, 24px);width:var(--vi-divider-text-margin, 24px)}.divider--placement-left .divider__line-end,.divider--placement-right .divider__line-start{flex-grow:1}.divider--placement-right .divider__line-end{flex-grow:0;flex-basis:var(--vi-divider-text-margin, 24px);width:var(--vi-divider-text-margin, 24px)}.divider__text{display:inline-block;padding-inline:var(--vi-divider-text-padding, var(--vi-spacing-sm, .75rem));white-space:nowrap;text-align:center;font-weight:var(--vi-divider-font-weight, var(--vi-font-weight-medium, 500))}.divider--vertical{position:relative;top:-.06em;display:inline-block;height:var(--vi-divider-height, .9em);margin-inline:var(--vi-divider-margin-inline, var(--vi-spacing-xs, .5rem));margin-block:0;vertical-align:middle;border-top:0;border-inline-start:var(--vi-divider-width, var(--vi-border-width-thin, 1px)) var(--vi-divider-style, solid) var(--vi-divider-color, var(--vi-border-03, #e0e0e0))}.divider--vertical.divider--dashed{border-inline-start-style:dashed}}:host{display:block;box-sizing:border-box}:host([direction=vertical]){display:inline-block;vertical-align:middle}:host([hidden]){display:none!important}.divider{box-sizing:border-box}.divider__text[hidden]{display:none!important}";

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
var _dec, _initClass, _ViElement, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _init_direction, _init_textPlacement, _init_textMargin, _init_dashed, _init_plain, _init__hasSlottedText, _initProto;
let _ViDivider;
_dec = t('vi-divider'), _dec1 = n({
    type: String,
    reflect: true
}), _dec2 = n({
    type: String,
    attribute: 'text-placement',
    reflect: true
}), _dec3 = n({
    attribute: 'text-margin',
    reflect: true
}), _dec4 = n({
    type: Boolean,
    reflect: true
}), _dec5 = n({
    type: Boolean,
    reflect: true
}), _dec6 = r();
new class extends _identity {
    constructor(){
        super(_ViDivider), _initClass();
    }
    static{
        class ViDivider extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_direction, _init_textPlacement, _init_textMargin, _init_dashed, _init_plain, _init__hasSlottedText, _initProto], c: [_ViDivider, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "direction"
                    ],
                    [
                        _dec2,
                        1,
                        "textPlacement"
                    ],
                    [
                        _dec3,
                        1,
                        "textMargin"
                    ],
                    [
                        _dec4,
                        1,
                        "dashed"
                    ],
                    [
                        _dec5,
                        1,
                        "plain"
                    ],
                    [
                        _dec6,
                        1,
                        "_hasSlottedText"
                    ]
                ], [
                    _dec
                ], _ViElement));
            }
            static styles = i`
    ${r$1(dividerStyles)}
  `;
            #___private_direction_1 = (_initProto(this), _init_direction(this, 'horizontal'));
            get direction() {
                return this.#___private_direction_1;
            }
            set direction(_v) {
                this.#___private_direction_1 = _v;
            }
            #___private_textPlacement_2 = _init_textPlacement(this, 'center');
            get textPlacement() {
                return this.#___private_textPlacement_2;
            }
            set textPlacement(_v) {
                this.#___private_textPlacement_2 = _v;
            }
            #___private_textMargin_3 = _init_textMargin(this, undefined);
            get textMargin() {
                return this.#___private_textMargin_3;
            }
            set textMargin(_v) {
                this.#___private_textMargin_3 = _v;
            }
            #___private_dashed_4 = _init_dashed(this, false);
            get dashed() {
                return this.#___private_dashed_4;
            }
            set dashed(_v) {
                this.#___private_dashed_4 = _v;
            }
            #___private_plain_5 = _init_plain(this, false);
            get plain() {
                return this.#___private_plain_5;
            }
            set plain(_v) {
                this.#___private_plain_5 = _v;
            }
            #___private__hasSlottedText_6 = _init__hasSlottedText(this, false);
            get _hasSlottedText() {
                return this.#___private__hasSlottedText_6;
            }
            set _hasSlottedText(_v) {
                this.#___private__hasSlottedText_6 = _v;
            }
            connectedCallback() {
                super.connectedCallback();
                if (!this.hasAttribute('role')) {
                    this.setAttribute('role', 'separator');
                }
                this.setAttribute('aria-orientation', this.direction);
            }
            updated(changedProperties) {
                super.updated(changedProperties);
                if (changedProperties.has('direction')) {
                    this.setAttribute('aria-orientation', this.direction);
                }
            }
            _handleSlotChange(e) {
                const slot = e.target;
                const nodes = slot.assignedNodes({
                    flatten: true
                });
                const hasText = nodes.some((node)=>{
                    if (node.nodeType === Node.TEXT_NODE) {
                        return (node.textContent ?? '').trim().length > 0;
                    }
                    return node.nodeType === Node.ELEMENT_NODE;
                });
                this._hasSlottedText = hasText;
            }
            _getTextMarginStyle() {
                if (this.textMargin !== undefined && this.textMargin !== null && this.textMargin !== '') {
                    const margin = typeof this.textMargin === 'number' ? `${this.textMargin}px` : /^\d+$/.test(String(this.textMargin)) ? `${this.textMargin}px` : String(this.textMargin);
                    return {
                        '--vi-divider-text-margin': margin
                    };
                }
                return {};
            }
            render() {
                const isVertical = this.direction === 'vertical';
                const classes = {
                    divider: true,
                    'divider--vertical': isVertical,
                    'divider--horizontal': !isVertical,
                    'divider--dashed': this.dashed,
                    'divider--plain': this.plain,
                    'divider--with-text': !isVertical && this._hasSlottedText,
                    [`divider--placement-${this.textPlacement}`]: !isVertical && this._hasSlottedText
                };
                if (isVertical) {
                    return b`
        <div
          class=${e(classes)}
          part="divider"
        ></div>
      `;
                }
                return b`
      <div
        class=${e(classes)}
        part="divider"
        style=${o(this._getTextMarginStyle())}
      >
        <span class="divider__line-start" part="line-start"></span>
        <span
          class="divider__text"
          part="text"
          ?hidden=${!this._hasSlottedText}
        >
          <slot @slotchange=${this._handleSlotChange}></slot>
        </span>
        ${this._hasSlottedText ? b`<span class="divider__line-end" part="line-end"></span>` : A}
      </div>
    `;
            }
        }
    }
}();

registerIcons([
    saveIcon,
    fileTextIcon,
    lockIcon,
    triangleWarningIcon
]);
const meta = {
    title: 'Components/Divider',
    component: 'vi-divider',
    tags: [
        'autodocs'
    ],
    argTypes: {
        direction: {
            control: 'radio',
            options: [
                'horizontal',
                'vertical'
            ],
            description: 'Orientation direction of the separator'
        },
        textPlacement: {
            control: 'radio',
            options: [
                'left',
                'center',
                'right'
            ],
            description: 'Text placement along the divider rule'
        },
        textMargin: {
            control: 'text',
            description: 'Margin offset for left or right placement'
        },
        dashed: {
            control: 'boolean',
            description: 'Renders the separator stroke as dashed'
        },
        plain: {
            control: 'boolean',
            description: 'Renders embedded text with standard font weight and muted colour'
        }
    }
};
const Default = {
    render: ()=>b`
    <div style="max-width: 640px; font-family: sans-serif;">
      <p style="margin: 0; color: #4b5563;">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
        Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies
        sed, dolor.
      </p>
      <vi-divider></vi-divider>
      <p style="margin: 0; color: #4b5563;">
        Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper
        congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie.
      </p>
    </div>
  `
};
const WithText = {
    render: ()=>b`
    <div style="max-width: 640px; font-family: sans-serif;">
      <p style="color: #4b5563; margin: 0 0 12px 0;">
        Clinical study protocol v3.2. Form sectioning examples below.
      </p>
      <vi-divider text-placement="center">Baseline Demographics</vi-divider>
      <p style="color: #4b5563; margin: 12px 0;">
        Patient age, sex at birth, informed consent verification date.
      </p>
      <vi-divider text-placement="left">Vital Signs</vi-divider>
      <p style="color: #4b5563; margin: 12px 0;">
        Systolic blood pressure, diastolic blood pressure, heart rate.
      </p>
      <vi-divider text-placement="right">Laboratory Panel</vi-divider>
      <p style="color: #4b5563; margin: 12px 0;">
        Serum creatinine, blood urea nitrogen, alanine aminotransferase.
      </p>
    </div>
  `
};
const CustomTextMargin = {
    render: ()=>b`
    <div style="max-width: 640px; font-family: sans-serif;">
      <vi-divider text-placement="left" text-margin="48px">
        Left Aligned (48px Margin)
      </vi-divider>
      <p style="color: #4b5563; margin: 12px 0;">
        Content beneath custom offset header.
      </p>
      <vi-divider text-placement="right" text-margin="64px">
        Right Aligned (64px Margin)
      </vi-divider>
    </div>
  `
};
const PlainText = {
    render: ()=>b`
    <div style="max-width: 640px; font-family: sans-serif;">
      <p style="color: #4b5563; margin: 0 0 12px 0;">
        Plain mode renders secondary, unbolded text for subtle divider notes.
      </p>
      <vi-divider plain text-placement="center">
        Audit trail synchronized 2 minutes ago
      </vi-divider>
      <vi-divider plain text-placement="left">
        Secondary form parameters
      </vi-divider>
    </div>
  `
};
const Dashed = {
    render: ()=>b`
    <div style="max-width: 640px; font-family: sans-serif;">
      <p style="color: #4b5563; margin: 0 0 12px 0;">
        Dashed line styles for optional or collapsible sections.
      </p>
      <vi-divider dashed></vi-divider>
      <vi-divider dashed text-placement="center">
        Optional Concomitant Medications
      </vi-divider>
      <vi-divider dashed text-placement="left">
        Conditional Adverse Event Questions
      </vi-divider>
    </div>
  `
};
const VerticalToolbar = {
    render: ()=>b`
    <div
      style="display: flex; align-items: center; gap: 8px; font-family: sans-serif;"
    >
      <vi-button size="sm">
        <vi-icon name="save" slot="prefix"></vi-icon>
        Save CRF
      </vi-button>
      <vi-divider direction="vertical"></vi-divider>
      <vi-button size="sm" variant="ghost">
        <vi-icon name="file-text" slot="prefix"></vi-icon>
        Audit Log
      </vi-button>
      <vi-divider direction="vertical"></vi-divider>
      <vi-button size="sm" variant="ghost">
        <vi-icon name="lock" slot="prefix"></vi-icon>
        Freeze Form
      </vi-button>
      <vi-divider direction="vertical"></vi-divider>
      <vi-button size="sm" variant="danger">
        <vi-icon name="triangle-warning" slot="prefix"></vi-icon>
        Report SAE
      </vi-button>
    </div>
  `
};
const VerticalInlineMetadata = {
    render: ()=>b`
    <div
      style="display: flex; align-items: center; font-family: sans-serif; font-size: 14px; color: #4b5563;"
    >
      <span>Subject: <strong style="color: #111827;">101-042</strong></span>
      <vi-divider direction="vertical"></vi-divider>
      <span>Site: <strong style="color: #111827;">SITE-BOSTON-01</strong></span>
      <vi-divider direction="vertical"></vi-divider>
      <span>Cohort: <strong style="color: #111827;">Arm A (10mg)</strong></span>
      <vi-divider direction="vertical"></vi-divider>
      <span>Status: <strong style="color: #059669;">Active</strong></span>
    </div>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"max-width: 640px; font-family: sans-serif;\">\n      <p style=\"margin: 0; color: #4b5563;\">\n        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.\n        Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies\n        sed, dolor.\n      </p>\n      <vi-divider></vi-divider>\n      <p style=\"margin: 0; color: #4b5563;\">\n        Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper\n        congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie.\n      </p>\n    </div>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
WithText.parameters = {
    ...WithText.parameters,
    docs: {
        ...WithText.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"max-width: 640px; font-family: sans-serif;\">\n      <p style=\"color: #4b5563; margin: 0 0 12px 0;\">\n        Clinical study protocol v3.2. Form sectioning examples below.\n      </p>\n      <vi-divider text-placement=\"center\">Baseline Demographics</vi-divider>\n      <p style=\"color: #4b5563; margin: 12px 0;\">\n        Patient age, sex at birth, informed consent verification date.\n      </p>\n      <vi-divider text-placement=\"left\">Vital Signs</vi-divider>\n      <p style=\"color: #4b5563; margin: 12px 0;\">\n        Systolic blood pressure, diastolic blood pressure, heart rate.\n      </p>\n      <vi-divider text-placement=\"right\">Laboratory Panel</vi-divider>\n      <p style=\"color: #4b5563; margin: 12px 0;\">\n        Serum creatinine, blood urea nitrogen, alanine aminotransferase.\n      </p>\n    </div>\n  `\n}",
            ...WithText.parameters?.docs?.source
        }
    }
};
CustomTextMargin.parameters = {
    ...CustomTextMargin.parameters,
    docs: {
        ...CustomTextMargin.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"max-width: 640px; font-family: sans-serif;\">\n      <vi-divider text-placement=\"left\" text-margin=\"48px\">\n        Left Aligned (48px Margin)\n      </vi-divider>\n      <p style=\"color: #4b5563; margin: 12px 0;\">\n        Content beneath custom offset header.\n      </p>\n      <vi-divider text-placement=\"right\" text-margin=\"64px\">\n        Right Aligned (64px Margin)\n      </vi-divider>\n    </div>\n  `\n}",
            ...CustomTextMargin.parameters?.docs?.source
        }
    }
};
PlainText.parameters = {
    ...PlainText.parameters,
    docs: {
        ...PlainText.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"max-width: 640px; font-family: sans-serif;\">\n      <p style=\"color: #4b5563; margin: 0 0 12px 0;\">\n        Plain mode renders secondary, unbolded text for subtle divider notes.\n      </p>\n      <vi-divider plain text-placement=\"center\">\n        Audit trail synchronized 2 minutes ago\n      </vi-divider>\n      <vi-divider plain text-placement=\"left\">\n        Secondary form parameters\n      </vi-divider>\n    </div>\n  `\n}",
            ...PlainText.parameters?.docs?.source
        }
    }
};
Dashed.parameters = {
    ...Dashed.parameters,
    docs: {
        ...Dashed.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"max-width: 640px; font-family: sans-serif;\">\n      <p style=\"color: #4b5563; margin: 0 0 12px 0;\">\n        Dashed line styles for optional or collapsible sections.\n      </p>\n      <vi-divider dashed></vi-divider>\n      <vi-divider dashed text-placement=\"center\">\n        Optional Concomitant Medications\n      </vi-divider>\n      <vi-divider dashed text-placement=\"left\">\n        Conditional Adverse Event Questions\n      </vi-divider>\n    </div>\n  `\n}",
            ...Dashed.parameters?.docs?.source
        }
    }
};
VerticalToolbar.parameters = {
    ...VerticalToolbar.parameters,
    docs: {
        ...VerticalToolbar.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div\n      style=\"display: flex; align-items: center; gap: 8px; font-family: sans-serif;\"\n    >\n      <vi-button size=\"sm\">\n        <vi-icon name=\"save\" slot=\"prefix\"></vi-icon>\n        Save CRF\n      </vi-button>\n      <vi-divider direction=\"vertical\"></vi-divider>\n      <vi-button size=\"sm\" variant=\"ghost\">\n        <vi-icon name=\"file-text\" slot=\"prefix\"></vi-icon>\n        Audit Log\n      </vi-button>\n      <vi-divider direction=\"vertical\"></vi-divider>\n      <vi-button size=\"sm\" variant=\"ghost\">\n        <vi-icon name=\"lock\" slot=\"prefix\"></vi-icon>\n        Freeze Form\n      </vi-button>\n      <vi-divider direction=\"vertical\"></vi-divider>\n      <vi-button size=\"sm\" variant=\"danger\">\n        <vi-icon name=\"triangle-warning\" slot=\"prefix\"></vi-icon>\n        Report SAE\n      </vi-button>\n    </div>\n  `\n}",
            ...VerticalToolbar.parameters?.docs?.source
        }
    }
};
VerticalInlineMetadata.parameters = {
    ...VerticalInlineMetadata.parameters,
    docs: {
        ...VerticalInlineMetadata.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div\n      style=\"display: flex; align-items: center; font-family: sans-serif; font-size: 14px; color: #4b5563;\"\n    >\n      <span>Subject: <strong style=\"color: #111827;\">101-042</strong></span>\n      <vi-divider direction=\"vertical\"></vi-divider>\n      <span>Site: <strong style=\"color: #111827;\">SITE-BOSTON-01</strong></span>\n      <vi-divider direction=\"vertical\"></vi-divider>\n      <span>Cohort: <strong style=\"color: #111827;\">Arm A (10mg)</strong></span>\n      <vi-divider direction=\"vertical\"></vi-divider>\n      <span>Status: <strong style=\"color: #059669;\">Active</strong></span>\n    </div>\n  `\n}",
            ...VerticalInlineMetadata.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","WithText","CustomTextMargin","PlainText","Dashed","VerticalToolbar","VerticalInlineMetadata"];

export { CustomTextMargin, Dashed, Default, PlainText, VerticalInlineMetadata, VerticalToolbar, WithText, __namedExportsOrder, meta as default };
