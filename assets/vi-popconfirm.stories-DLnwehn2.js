import { r as r$1, i, A, b } from './iframe-Dou6M6kd.js';
import { V as ViElement, t, n } from './vi-element-D24a-rkj.js';
import { r } from './state-CeBMAm36.js';
import { e } from './query-CHb9Ft_d.js';
import './vi-popover-CxzGse8v.js';
import './vi-button-CmhZ2JyL.js';
import './vi-icon-DLYcnZCy.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import './preload-helper-D5QYaGzd.js';
import './base-Cl6v8-BZ.js';
import './floating-ui.dom-Dsl7AwNm.js';
import './focusable-mixin-CmxOyPX5.js';
import './directive-BKuZRRPO.js';

const popconfirmStyles = "@charset \"UTF-8\";@layer reset,components,utilities;.popconfirm-body{display:flex;align-items:flex-start;gap:var(--vi-spacing-sm, .75rem)}.popconfirm-body .popconfirm-icon{flex-shrink:0;margin-top:2px}.popconfirm-body .popconfirm-text{display:flex;flex-direction:column;gap:var(--vi-spacing-xs, .5rem)}.popconfirm-body .popconfirm-text .popconfirm-title{font-weight:var(--vi-popconfirm-title-weight, var(--vi-font-weight-medium, 500));color:var(--vi-popconfirm-title-color, var(--vi-text-primary, #111827))}.popconfirm-body .popconfirm-text .popconfirm-desc{font-size:var(--vi-popconfirm-desc-size, var(--vi-font-size-sm, .8125rem));color:var(--vi-popconfirm-desc-color, var(--vi-text-secondary, #4b5563))}.popconfirm-buttons{display:flex;justify-content:flex-end;gap:var(--vi-spacing-sm, .75rem);margin-top:var(--vi-spacing-md, 1rem)}:host{display:inline-block}";

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
var _dec, _initClass, _ViElement, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _init_title, _init_description, _init_icon, _init_okText, _init_cancelText, _init_okVariant, _init_cancelVariant, _init_placement, _init_disabled, _init__open, _init__popover, _initProto;
let _ViPopconfirm;
_dec = t('vi-popconfirm'), _dec1 = n({
    type: String
}), _dec2 = n({
    type: String
}), _dec3 = n({
    type: String
}), _dec4 = n({
    type: String,
    attribute: 'ok-text'
}), _dec5 = n({
    type: String,
    attribute: 'cancel-text'
}), _dec6 = n({
    type: String,
    attribute: 'ok-variant'
}), _dec7 = n({
    type: String,
    attribute: 'cancel-variant'
}), _dec8 = n({
    type: String,
    reflect: true
}), _dec9 = n({
    type: Boolean,
    reflect: true
}), _dec10 = r(), _dec11 = e('vi-popover');
new class extends _identity {
    constructor(){
        super(_ViPopconfirm), _initClass();
    }
    static{
        class ViPopconfirm extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_title, _init_description, _init_icon, _init_okText, _init_cancelText, _init_okVariant, _init_cancelVariant, _init_placement, _init_disabled, _init__open, _init__popover, _initProto], c: [_ViPopconfirm, _initClass] } = _apply_decs_2203_r(this, [
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
                        "icon"
                    ],
                    [
                        _dec4,
                        1,
                        "okText"
                    ],
                    [
                        _dec5,
                        1,
                        "cancelText"
                    ],
                    [
                        _dec6,
                        1,
                        "okVariant"
                    ],
                    [
                        _dec7,
                        1,
                        "cancelVariant"
                    ],
                    [
                        _dec8,
                        1,
                        "placement"
                    ],
                    [
                        _dec9,
                        1,
                        "disabled"
                    ],
                    [
                        _dec10,
                        1,
                        "_open"
                    ],
                    [
                        _dec11,
                        1,
                        "_popover"
                    ]
                ], [
                    _dec
                ], _ViElement));
            }
            static styles = i`${r$1(popconfirmStyles)}`;
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
            #___private_icon_3 = _init_icon(this, 'warning');
            get icon() {
                return this.#___private_icon_3;
            }
            set icon(_v) {
                this.#___private_icon_3 = _v;
            }
            #___private_okText_4 = _init_okText(this, 'OK');
            get okText() {
                return this.#___private_okText_4;
            }
            set okText(_v) {
                this.#___private_okText_4 = _v;
            }
            #___private_cancelText_5 = _init_cancelText(this, 'Cancel');
            get cancelText() {
                return this.#___private_cancelText_5;
            }
            set cancelText(_v) {
                this.#___private_cancelText_5 = _v;
            }
            #___private_okVariant_6 = _init_okVariant(this, 'primary');
            get okVariant() {
                return this.#___private_okVariant_6;
            }
            set okVariant(_v) {
                this.#___private_okVariant_6 = _v;
            }
            #___private_cancelVariant_7 = _init_cancelVariant(this, 'secondary');
            get cancelVariant() {
                return this.#___private_cancelVariant_7;
            }
            set cancelVariant(_v) {
                this.#___private_cancelVariant_7 = _v;
            }
            #___private_placement_8 = _init_placement(this, 'top');
            get placement() {
                return this.#___private_placement_8;
            }
            set placement(_v) {
                this.#___private_placement_8 = _v;
            }
            #___private_disabled_9 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_9;
            }
            set disabled(_v) {
                this.#___private_disabled_9 = _v;
            }
            #___private__open_10 = _init__open(this, false);
            get _open() {
                return this.#___private__open_10;
            }
            set _open(_v) {
                this.#___private__open_10 = _v;
            }
            #___private__popover_11 = _init__popover(this);
            get _popover() {
                return this.#___private__popover_11;
            }
            set _popover(_v) {
                this.#___private__popover_11 = _v;
            }
            _isActionHandled = false;
            _onPopoverShow(e) {
                if (this.disabled) {
                    e.preventDefault();
                    this._isActionHandled = true;
                    if (this._popover) {
                        this._popover.open = false;
                    }
                    this._open = false;
                } else {
                    this._isActionHandled = false;
                    this._open = true;
                }
            }
            _onPopoverHide() {
                this._open = false;
                if (!this._isActionHandled) {
                    this.dispatchEvent(new CustomEvent('vi-popconfirm-cancel', {
                        bubbles: true,
                        composed: true
                    }));
                }
            }
            _handleCancel(e) {
                e.stopPropagation();
                this._isActionHandled = true;
                this._open = false;
                this.dispatchEvent(new CustomEvent('vi-popconfirm-cancel', {
                    bubbles: true,
                    composed: true
                }));
            }
            _handleConfirm(e) {
                e.stopPropagation();
                this._isActionHandled = true;
                this._open = false;
                this.dispatchEvent(new CustomEvent('vi-popconfirm-confirm', {
                    bubbles: true,
                    composed: true
                }));
            }
            get _hasDescription() {
                return this.description !== '' || this.querySelector('[slot="description"]') !== null;
            }
            get _hasTitle() {
                return this.title !== '' || this.querySelector('[slot="title"]') !== null;
            }
            render() {
                return b`
      <vi-popover 
        .placement=${this.placement}
        .open=${this._open}
        trigger="click"
        accessible-name=${this.title || 'Confirmation dialog'}
        @vi-popover-show=${this._onPopoverShow}
        @vi-popover-hide=${this._onPopoverHide}
      >
        <slot></slot>
        
        <div slot="content" class="popconfirm-content">
          <div class="popconfirm-body">
            <div class="popconfirm-icon">
              <slot name="icon">
                <vi-icon name=${this.icon} size="20" color=${this.icon === 'warning' ? 'var(--vi-color-warning)' : 'currentColor'}></vi-icon>
              </slot>
            </div>
            
            <div class="popconfirm-text">
              ${this._hasTitle ? b`
                <div class="popconfirm-title">
                  <slot name="title">${this.title}</slot>
                </div>
              ` : A}
              
              ${this._hasDescription ? b`
                <div class="popconfirm-desc">
                  <slot name="description">${this.description}</slot>
                </div>
              ` : A}
            </div>
          </div>
          
          <div class="popconfirm-buttons">
            <vi-button size="sm" variant=${this.cancelVariant} @click=${this._handleCancel}>
              ${this.cancelText}
            </vi-button>
            <vi-button size="sm" variant=${this.okVariant} @click=${this._handleConfirm}>
              ${this.okText}
            </vi-button>
          </div>
        </div>
      </vi-popover>
    `;
            }
        }
    }
}();

registerIcons([
    {
        name: 'warning',
        data: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>'
    }
]);
const meta = {
    title: 'Feedback/Popconfirm',
    component: 'vi-popconfirm',
    argTypes: {
        placement: {
            control: 'select',
            options: [
                'top',
                'bottom',
                'left',
                'right'
            ]
        },
        title: {
            control: 'text'
        },
        description: {
            control: 'text'
        },
        icon: {
            control: 'text'
        },
        okText: {
            control: 'text'
        },
        cancelText: {
            control: 'text'
        },
        okVariant: {
            control: 'select',
            options: [
                'primary',
                'secondary',
                'danger',
                'ghost'
            ]
        }
    },
    parameters: {
        layout: 'centered'
    }
};
const Default = {
    args: {
        title: 'Delete this task?',
        description: 'This action cannot be undone.',
        okText: 'Yes',
        cancelText: 'No',
        okVariant: 'danger',
        placement: 'top'
    },
    render: (args)=>b`
    <vi-popconfirm
      title=${args.title}
      description=${args.description}
      ok-text=${args.okText}
      cancel-text=${args.cancelText}
      ok-variant=${args.okVariant}
      placement=${args.placement}
      @vi-popconfirm-confirm=${()=>alert('Confirmed!')}
      @vi-popconfirm-cancel=${()=>console.log('Cancelled')}
    >
      <vi-button variant="danger">Delete Task</vi-button>
    </vi-popconfirm>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    title: 'Delete this task?',\n    description: 'This action cannot be undone.',\n    okText: 'Yes',\n    cancelText: 'No',\n    okVariant: 'danger',\n    placement: 'top'\n  },\n  render: args => html`\n    <vi-popconfirm\n      title=${args.title}\n      description=${args.description}\n      ok-text=${args.okText}\n      cancel-text=${args.cancelText}\n      ok-variant=${args.okVariant}\n      placement=${args.placement}\n      @vi-popconfirm-confirm=${() => alert('Confirmed!')}\n      @vi-popconfirm-cancel=${() => console.log('Cancelled')}\n    >\n      <vi-button variant=\"danger\">Delete Task</vi-button>\n    </vi-popconfirm>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default"];

export { Default, __namedExportsOrder, meta as default };
