import { r, i, b } from './iframe-9yd_z6c6.js';
import { V as ViElement, t, n } from './vi-element-D7bP2wsn.js';
import './vi-skeleton-DER1I5C9.js';
import './vi-button-D54BGZG7.js';
import './vi-badge-BZtuyjVn.js';
import './preload-helper-D5QYaGzd.js';
import './class-map-BnH_mZac.js';
import './directive-BKuZRRPO.js';
import './state-FW5tp7Om.js';
import './focusable-mixin-CmxOyPX5.js';

const cardStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{:host{display:block;width:100%}.vi-card{display:flex;flex-direction:column;position:relative;box-sizing:border-box;width:100%;background-color:var(--vi-card-bg, var(--vi-layer-01, #ffffff));border:var(--vi-border-width-thin, 1px) solid var(--vi-card-border-color, var(--vi-border-02, #eeeeee));border-radius:var(--vi-card-border-radius, var(--vi-border-radius-lg, 8px));color:var(--vi-card-color, var(--vi-text-primary, #111827));transition:box-shadow .3s cubic-bezier(.2,.8,.2,1),border-color .3s cubic-bezier(.2,.8,.2,1),transform .3s cubic-bezier(.2,.8,.2,1);box-shadow:var(--vi-card-shadow, var(--vi-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, .03)), var(--vi-shadow-inner-light, inset 0 1px 0 rgba(255, 255, 255, .3)));--vi-card-padding: 1.5rem}.vi-card--size-sm{--vi-card-padding: .75rem}.vi-card--size-md{--vi-card-padding: 1rem}.vi-card--size-lg{--vi-card-padding: 1.5rem}.vi-card--hoverable:hover{box-shadow:var(--vi-card-hover-shadow, var(--vi-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, .05), 0 10px 15px -3px rgba(0, 0, 0, .1)), var(--vi-shadow-inner-light, inset 0 1px 0 rgba(255, 255, 255, .3)));border-color:var(--vi-card-hover-border-color, var(--vi-border-03, #e0e0e0));transform:translateY(-2px);cursor:pointer}.vi-card--hoverable:active{transform:translateY(0) scale(.995);box-shadow:var(--vi-card-active-shadow, var(--vi-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, .03)), var(--vi-shadow-inner-light, inset 0 1px 0 rgba(255, 255, 255, .3)))}.vi-card-cover{display:flex;overflow:hidden;border-top-left-radius:var(--vi-card-border-radius, var(--vi-border-radius-lg, 8px));border-top-right-radius:var(--vi-card-border-radius, var(--vi-border-radius-lg, 8px));margin-top:-1px;margin-left:-1px;margin-right:-1px}.vi-card-cover ::slotted(*){width:100%;display:block;object-fit:cover}.vi-card-header{display:flex;align-items:center;justify-content:space-between;padding:var(--vi-card-padding);border-bottom:var(--vi-border-width-thin, 1px) solid transparent}.vi-card--bordered .vi-card-header{border-bottom-color:var(--vi-card-border-color, var(--vi-border-02, #eeeeee))}.vi-card-title{margin:0;font-family:var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);font-weight:var(--vi-font-weight-semibold, 600);letter-spacing:-.01em;font-size:var(--vi-card-title-font-size, clamp(1rem, .875rem + 1vw, 1.25rem));line-height:var(--vi-line-height-tight, 1.2);color:var(--vi-card-title-color, var(--vi-text-primary, #111827))}.vi-card-extra{display:flex;align-items:center;gap:.5rem}.vi-card-body{padding:var(--vi-card-padding);flex:1 1 auto;font-size:var(--vi-card-body-font-size, var(--vi-font-size-base, .875rem));line-height:var(--vi-line-height-normal, 1.5715);color:var(--vi-card-body-color, var(--vi-text-secondary, #4b5563))}.vi-card-footer{display:flex;align-items:center;padding:var(--vi-card-padding);border-top:var(--vi-border-width-thin, 1px) solid transparent}.vi-card--bordered .vi-card-footer{border-top-color:var(--vi-card-border-color, var(--vi-border-02, #eeeeee))}.vi-card-actions{display:flex;background:var(--vi-card-actions-bg, var(--vi-layer-dimmed, rgba(0, 0, 0, .02)));border-top:var(--vi-border-width-thin, 1px) solid transparent}.vi-card--bordered .vi-card-actions{border-top-color:var(--vi-card-border-color, var(--vi-border-02, #eeeeee))}.vi-card-actions ::slotted(*){flex:1;display:flex;justify-content:center;align-items:center;padding:.75rem 0;margin:0;border-right:var(--vi-border-width-thin, 1px) solid transparent;color:var(--vi-card-action-color, var(--vi-text-secondary, #4b5563));transition:color .3s ease;cursor:pointer}.vi-card--bordered .vi-card-actions ::slotted(*){border-right-color:var(--vi-card-border-color, var(--vi-border-02, #eeeeee))}.vi-card-actions ::slotted(*:hover){color:var(--vi-card-action-hover-color, var(--vi-text-primary, #111827))}.vi-card-actions ::slotted(*:last-child){border-right:none}.vi-card-skeleton{display:flex;gap:1rem;width:100%}.vi-card-skeleton-content{display:flex;flex-direction:column;flex:1 1 auto;gap:1rem}.vi-card-skeleton-title{width:38%;margin-top:.5rem;margin-bottom:.25rem}.vi-card-skeleton-short{width:61%}}:host{display:block;width:100%}.vi-card-header:empty,.vi-card-footer:empty,.vi-card-actions:empty,.vi-card-cover:empty{display:none}";

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
var _dec, _initClass, _ViElement, _dec1, _dec2, _dec3, _dec4, /** Renders a border around the card */ _init_bordered, /** Adds a shadow and border highlight on hover */ _init_hoverable, /** Shows a skeleton loader in the card body */ _init_loading, /** Controls the padding size scale */ _init_size, _initProto;
let _ViCard;
_dec = t('vi-card'), _dec1 = n({
    type: Boolean,
    reflect: true
}), _dec2 = n({
    type: Boolean,
    reflect: true
}), _dec3 = n({
    type: Boolean,
    reflect: true
}), _dec4 = n({
    type: String,
    reflect: true
});
new class extends _identity {
    constructor(){
        super(_ViCard), _initClass();
    }
    static{
        class ViCard extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_bordered, _init_hoverable, _init_loading, _init_size, _initProto], c: [_ViCard, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "bordered"
                    ],
                    [
                        _dec2,
                        1,
                        "hoverable"
                    ],
                    [
                        _dec3,
                        1,
                        "loading"
                    ],
                    [
                        _dec4,
                        1,
                        "size"
                    ]
                ], [
                    _dec
                ], _ViElement));
            }
            static styles = i`${r(cardStyles)}`;
            #___private_bordered_1 = (_initProto(this), _init_bordered(this, false));
            get bordered() {
                return this.#___private_bordered_1;
            }
            set bordered(_v) {
                this.#___private_bordered_1 = _v;
            }
            #___private_hoverable_2 = _init_hoverable(this, false);
            get hoverable() {
                return this.#___private_hoverable_2;
            }
            set hoverable(_v) {
                this.#___private_hoverable_2 = _v;
            }
            #___private_loading_3 = _init_loading(this, false);
            get loading() {
                return this.#___private_loading_3;
            }
            set loading(_v) {
                this.#___private_loading_3 = _v;
            }
            #___private_size_4 = _init_size(this, 'fluid');
            get size() {
                return this.#___private_size_4;
            }
            set size(_v) {
                this.#___private_size_4 = _v;
            }
            render() {
                // Classes applied based on attributes
                const classes = {
                    'vi-card': true,
                    'vi-card--bordered': this.bordered,
                    'vi-card--hoverable': this.hoverable,
                    [`vi-card--size-${this.size}`]: this.size !== 'fluid'
                };
                // Helper to generate class string
                const classStr = Object.entries(classes).filter(([_, value])=>value).map(([key])=>key).join(' ');
                return b`
      <div class="${classStr}" part="card">
        <!-- Cover Section -->
        <div class="vi-card-cover" part="cover">
          <slot name="cover"></slot>
        </div>

        <!-- Header Section -->
        <div class="vi-card-header" part="header">
          <div class="vi-card-title" part="title">
            <slot name="title"></slot>
          </div>
          <div class="vi-card-extra" part="extra">
            <slot name="extra"></slot>
          </div>
        </div>

        <!-- Body Section -->
        <div class="vi-card-body" part="body">
          ${this.loading ? b`
            <slot name="loader">
              <div class="vi-card-skeleton">
                <div class="vi-card-skeleton-content">
                  <vi-skeleton variant="text" class="vi-card-skeleton-title"></vi-skeleton>
                  <vi-skeleton variant="text"></vi-skeleton>
                  <vi-skeleton variant="text"></vi-skeleton>
                  <vi-skeleton variant="text" class="vi-card-skeleton-short"></vi-skeleton>
                </div>
              </div>
            </slot>
          ` : b`
            <slot></slot>
          `}
        </div>

        <!-- Footer Section -->
        <div class="vi-card-footer" part="footer" style=${this.loading ? 'display: none;' : ''}>
          <slot name="footer"></slot>
        </div>

        <!-- Actions Section -->
        <div class="vi-card-actions" part="actions" style=${this.loading ? 'display: none;' : ''}>
          <slot name="actions"></slot>
        </div>
      </div>
    `;
            }
        }
    }
}();

const meta = {
    title: 'Components / Card',
    component: 'vi-card',
    tags: [
        'autodocs'
    ],
    argTypes: {
        bordered: {
            control: 'boolean'
        },
        hoverable: {
            control: 'boolean'
        }
    }
};
const Default = {
    args: {
        bordered: true,
        hoverable: false
    },
    render: (args)=>b`
    <div style="max-width: 400px; width: 100%;">
      <vi-card ?bordered=${args.bordered} ?hoverable=${args.hoverable}>
        <span slot="title">Card Title</span>
        <vi-button slot="extra" variant="text" size="sm">Action</vi-button>
        <p style="margin: 0;">This is a basic card component. It acts as a container for related information and actions.</p>
        <div slot="footer" style="display: flex; gap: 8px; justify-content: flex-end; width: 100%;">
          <vi-button variant="outline">Cancel</vi-button>
          <vi-button>Submit</vi-button>
        </div>
      </vi-card>
    </div>
  `
};
const FluidContainerQueries = {
    render: ()=>b`
    <div style="display: flex; gap: 24px; align-items: flex-start; padding: 24px; background: #f5f5f5;">
      
      <!-- NARROW CONTAINER (300px) -->
      <div style="width: 300px;">
        <h3 style="font-family: sans-serif; font-size: 14px; color: #666; margin-bottom: 8px;">Narrow Container (300px)</h3>
        <vi-card bordered hoverable>
          <span slot="title">Fluid Title Shrinks</span>
          <vi-badge slot="extra" variant="primary" dot></vi-badge>
          <p style="margin: 0; color: #666;">
            Notice how the padding and the title font-size dynamically scale down when this card is placed inside a tight column. This is powered by <code>cqi</code> math.
          </p>
          <div slot="footer">
            <vi-button variant="primary" style="width: 100%;">View Details &gt;</vi-button>
          </div>
        </vi-card>
      </div>

      <!-- WIDE CONTAINER (800px) -->
      <div style="flex: 1; max-width: 800px;">
        <h3 style="font-family: sans-serif; font-size: 14px; color: #666; margin-bottom: 8px;">Wide Container (800px)</h3>
        <vi-card bordered hoverable>
          <span slot="title">Fluid Title Grows</span>
          <vi-badge slot="extra" variant="primary" dot></vi-badge>
          <p style="margin: 0; color: #666;">
            Notice how the padding expands and the title font-size increases when this exact same component is placed inside a wider main content column. There are no @media queries here!
          </p>
          <div slot="footer" style="display: flex; gap: 8px;">
            <vi-button size="sm" variant="outline">Share</vi-button>
            <vi-button size="sm">Read More</vi-button>
          </div>
        </vi-card>
      </div>

    </div>
  `
};
const CoverImageAndActions = {
    render: ()=>b`
    <div style="max-width: 350px; width: 100%;">
      <vi-card bordered hoverable>
        <!-- Cover Image Slot -->
        <img 
          slot="cover" 
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&amp;fit=crop&amp;w=400&amp;q=80" 
          alt="Developer coding" 
          style="height: 200px;" 
        />
        
        <span slot="title">Web Components API</span>
        <p style="margin: 0; color: #666; font-size: 14px;">
          Build encapsulation into your UI with Shadow DOM. Compatible everywhere.
        </p>

        <!-- Actions Slot (Bottom Bar) -->
        <div slot="actions">
          <span>Settings</span>
          <span>Edit</span>
          <span>Share</span>
        </div>
      </vi-card>
    </div>
  `
};
const LoadingState = {
    render: ()=>b`
    <div style="max-width: 350px; width: 100%;">
      <vi-card bordered loading>
        <span slot="title">Dashboard Stats</span>
        <vi-button slot="extra" variant="text" size="sm">Refresh</vi-button>
        <p style="margin: 0;">This content is hidden behind a loading spinner.</p>
        <div style="height: 100px;"></div>
      </vi-card>
    </div>
  `
};
const StaticSizes = {
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <vi-card bordered size="sm">
        <span slot="title">Small Padding (12px)</span>
        <p style="margin: 0;">Fixed size override. Ignores container width.</p>
      </vi-card>

      <vi-card bordered size="md">
        <span slot="title">Medium Padding (16px)</span>
        <p style="margin: 0;">Fixed size override. Ignores container width.</p>
      </vi-card>

      <vi-card bordered size="lg">
        <span slot="title">Large Padding (24px)</span>
        <p style="margin: 0;">Fixed size override. Ignores container width.</p>
      </vi-card>
    </div>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    bordered: true,\n    hoverable: false\n  },\n  render: args => html`\n    <div style=\"max-width: 400px; width: 100%;\">\n      <vi-card ?bordered=${args.bordered} ?hoverable=${args.hoverable}>\n        <span slot=\"title\">Card Title</span>\n        <vi-button slot=\"extra\" variant=\"text\" size=\"sm\">Action</vi-button>\n        <p style=\"margin: 0;\">This is a basic card component. It acts as a container for related information and actions.</p>\n        <div slot=\"footer\" style=\"display: flex; gap: 8px; justify-content: flex-end; width: 100%;\">\n          <vi-button variant=\"outline\">Cancel</vi-button>\n          <vi-button>Submit</vi-button>\n        </div>\n      </vi-card>\n    </div>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
FluidContainerQueries.parameters = {
    ...FluidContainerQueries.parameters,
    docs: {
        ...FluidContainerQueries.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 24px; align-items: flex-start; padding: 24px; background: #f5f5f5;\">\n      \n      <!-- NARROW CONTAINER (300px) -->\n      <div style=\"width: 300px;\">\n        <h3 style=\"font-family: sans-serif; font-size: 14px; color: #666; margin-bottom: 8px;\">Narrow Container (300px)</h3>\n        <vi-card bordered hoverable>\n          <span slot=\"title\">Fluid Title Shrinks</span>\n          <vi-badge slot=\"extra\" variant=\"primary\" dot></vi-badge>\n          <p style=\"margin: 0; color: #666;\">\n            Notice how the padding and the title font-size dynamically scale down when this card is placed inside a tight column. This is powered by <code>cqi</code> math.\n          </p>\n          <div slot=\"footer\">\n            <vi-button variant=\"primary\" style=\"width: 100%;\">View Details &gt;</vi-button>\n          </div>\n        </vi-card>\n      </div>\n\n      <!-- WIDE CONTAINER (800px) -->\n      <div style=\"flex: 1; max-width: 800px;\">\n        <h3 style=\"font-family: sans-serif; font-size: 14px; color: #666; margin-bottom: 8px;\">Wide Container (800px)</h3>\n        <vi-card bordered hoverable>\n          <span slot=\"title\">Fluid Title Grows</span>\n          <vi-badge slot=\"extra\" variant=\"primary\" dot></vi-badge>\n          <p style=\"margin: 0; color: #666;\">\n            Notice how the padding expands and the title font-size increases when this exact same component is placed inside a wider main content column. There are no @media queries here!\n          </p>\n          <div slot=\"footer\" style=\"display: flex; gap: 8px;\">\n            <vi-button size=\"sm\" variant=\"outline\">Share</vi-button>\n            <vi-button size=\"sm\">Read More</vi-button>\n          </div>\n        </vi-card>\n      </div>\n\n    </div>\n  `\n}",
            ...FluidContainerQueries.parameters?.docs?.source
        }
    }
};
CoverImageAndActions.parameters = {
    ...CoverImageAndActions.parameters,
    docs: {
        ...CoverImageAndActions.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"max-width: 350px; width: 100%;\">\n      <vi-card bordered hoverable>\n        <!-- Cover Image Slot -->\n        <img \n          slot=\"cover\" \n          src=\"https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&amp;fit=crop&amp;w=400&amp;q=80\" \n          alt=\"Developer coding\" \n          style=\"height: 200px;\" \n        />\n        \n        <span slot=\"title\">Web Components API</span>\n        <p style=\"margin: 0; color: #666; font-size: 14px;\">\n          Build encapsulation into your UI with Shadow DOM. Compatible everywhere.\n        </p>\n\n        <!-- Actions Slot (Bottom Bar) -->\n        <div slot=\"actions\">\n          <span>Settings</span>\n          <span>Edit</span>\n          <span>Share</span>\n        </div>\n      </vi-card>\n    </div>\n  `\n}",
            ...CoverImageAndActions.parameters?.docs?.source
        }
    }
};
LoadingState.parameters = {
    ...LoadingState.parameters,
    docs: {
        ...LoadingState.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"max-width: 350px; width: 100%;\">\n      <vi-card bordered loading>\n        <span slot=\"title\">Dashboard Stats</span>\n        <vi-button slot=\"extra\" variant=\"text\" size=\"sm\">Refresh</vi-button>\n        <p style=\"margin: 0;\">This content is hidden behind a loading spinner.</p>\n        <div style=\"height: 100px;\"></div>\n      </vi-card>\n    </div>\n  `\n}",
            ...LoadingState.parameters?.docs?.source
        }
    }
};
StaticSizes.parameters = {
    ...StaticSizes.parameters,
    docs: {
        ...StaticSizes.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 16px;\">\n      <vi-card bordered size=\"sm\">\n        <span slot=\"title\">Small Padding (12px)</span>\n        <p style=\"margin: 0;\">Fixed size override. Ignores container width.</p>\n      </vi-card>\n\n      <vi-card bordered size=\"md\">\n        <span slot=\"title\">Medium Padding (16px)</span>\n        <p style=\"margin: 0;\">Fixed size override. Ignores container width.</p>\n      </vi-card>\n\n      <vi-card bordered size=\"lg\">\n        <span slot=\"title\">Large Padding (24px)</span>\n        <p style=\"margin: 0;\">Fixed size override. Ignores container width.</p>\n      </vi-card>\n    </div>\n  `\n}",
            ...StaticSizes.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","FluidContainerQueries","CoverImageAndActions","LoadingState","StaticSizes"];

export { CoverImageAndActions, Default, FluidContainerQueries, LoadingState, StaticSizes, __namedExportsOrder, meta as default };
