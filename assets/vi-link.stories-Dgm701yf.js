import { r, i, A, b } from './iframe-BWFd5gnq.js';
import { V as ViElement, t, n } from './vi-element-BiIvwBjw.js';
import { F as FocusableMixin } from './focusable-mixin-CmxOyPX5.js';
import './vi-icon-nPc8sIIY.js';
import './preload-helper-D5QYaGzd.js';
import './state-BbKxyFqT.js';
import './directive-BKuZRRPO.js';
import './registry-CeXOZkT9.js';

const linkStyles = "@charset \"UTF-8\";@layer reset,components,utilities;:host{display:inline-block}.link{color:var(--vi-link-color, var(--vi-link-color, var(--vi-color-primary, #3676d0)));text-decoration-thickness:1px;text-underline-offset:var(--vi-link-underline-offset, 2px);cursor:pointer;transition:color .2s ease,text-decoration-color .2s ease;outline:none;text-decoration:underline}.link.underline-none,.link.underline-hover{text-decoration:none}.link.underline-hover:hover{text-decoration:underline}.link.size-inherit{font-size:inherit}.link.size-sm{font-size:var(--vi-font-size-sm, var(--vi-font-size-sm, .8125rem))}.link.size-md{font-size:var(--vi-font-size-base, var(--vi-font-size-base, .875rem))}.link.size-lg{font-size:var(--vi-font-size-lg, var(--vi-font-size-lg, 1rem))}.link.variant-secondary{--vi-link-color: var(--vi-link-color-secondary, var(--vi-link-color-secondary, var(--vi-color-grey-700, #616161)));--vi-link-color-hover: var(--vi-link-color-secondary-hover, var(--vi-color-grey-800, #424242));--vi-link-color-active: var(--vi-link-color-secondary-active, var(--vi-color-grey-900, #212121));--vi-link-color-visited: var(--vi-link-color-secondary-visited, var(--vi-color-grey-700, #616161))}.link.variant-muted{--vi-link-color: var(--vi-link-color-muted, var(--vi-link-color-muted, var(--vi-color-grey-500, #9e9e9e)));--vi-link-color-hover: var(--vi-link-color-muted-hover, var(--vi-color-grey-600, #757575));--vi-link-color-active: var(--vi-link-color-muted-active, var(--vi-color-grey-700, #616161));--vi-link-color-visited: var(--vi-link-color-muted-visited, var(--vi-color-grey-500, #9e9e9e))}.link:visited{color:var(--vi-link-color-visited, var(--vi-link-color-visited, var(--vi-color-purple-600, #6507c9)))}.link:hover{color:var(--vi-link-color-hover, var(--vi-link-color-hover, var(--vi-color-blue-800, #2d5fa8)))}.link:active{color:var(--vi-link-color-active, var(--vi-link-color-active, var(--vi-color-blue-900, #254882)))}.link:focus-visible{outline:var(--vi-border-width-base, 2px) solid var(--vi-focus-ring-color, var(--vi-link-color, var(--vi-color-primary, #3676d0)));outline-offset:0;box-shadow:0 0 0 3px var(--vi-focus-ring-glow, transparent)}.link[aria-disabled=true],.link.disabled{color:var(--vi-link-color-disabled, var(--vi-link-color-disabled, var(--vi-color-grey-400, #bdbdbd)));pointer-events:none;cursor:not-allowed;text-decoration:none}.link{display:inline-flex;align-items:center}::slotted([slot=icon]){display:inline-flex;margin-inline-end:.25rem}[part=external-icon]{display:inline-flex;align-items:center;margin-inline-start:.25rem}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}";

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
var _dec, _initClass, _FocusableMixin, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _init_href, _init_target, _init_rel, _init_download, _init_variant, _init_size, _init_underline, _init_disabled, _init_external, _init_ariaLabel, _initProto;
let _ViLink;
_dec = t('vi-link'), _dec1 = n({
    type: String
}), _dec2 = n({
    type: String
}), _dec3 = n({
    type: String
}), _dec4 = n({
    type: String
}), _dec5 = n({
    type: String,
    reflect: true
}), _dec6 = n({
    type: String
}), _dec7 = n({
    type: String
}), _dec8 = n({
    type: Boolean,
    reflect: true
}), _dec9 = n({
    type: Boolean
}), _dec10 = n({
    attribute: 'aria-label'
});
new class extends _identity {
    constructor(){
        super(_ViLink), _initClass();
    }
    static{
        class ViLink extends (_FocusableMixin = FocusableMixin(ViElement)) {
            static{
                ({ e: [_init_href, _init_target, _init_rel, _init_download, _init_variant, _init_size, _init_underline, _init_disabled, _init_external, _init_ariaLabel, _initProto], c: [_ViLink, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "href"
                    ],
                    [
                        _dec2,
                        1,
                        "target"
                    ],
                    [
                        _dec3,
                        1,
                        "rel"
                    ],
                    [
                        _dec4,
                        1,
                        "download"
                    ],
                    [
                        _dec5,
                        1,
                        "variant"
                    ],
                    [
                        _dec6,
                        1,
                        "size"
                    ],
                    [
                        _dec7,
                        1,
                        "underline"
                    ],
                    [
                        _dec8,
                        1,
                        "disabled"
                    ],
                    [
                        _dec9,
                        1,
                        "external"
                    ],
                    [
                        _dec10,
                        1,
                        "ariaLabel"
                    ]
                ], [
                    _dec
                ], _FocusableMixin));
            }
            static styles = i`
    ${r(linkStyles)}
  `;
            #___private_href_1 = (_initProto(this), _init_href(this, ''));
            get href() {
                return this.#___private_href_1;
            }
            set href(_v) {
                this.#___private_href_1 = _v;
            }
            #___private_target_2 = _init_target(this, '_self');
            get target() {
                return this.#___private_target_2;
            }
            set target(_v) {
                this.#___private_target_2 = _v;
            }
            #___private_rel_3 = _init_rel(this, '');
            get rel() {
                return this.#___private_rel_3;
            }
            set rel(_v) {
                this.#___private_rel_3 = _v;
            }
            #___private_download_4 = _init_download(this, '');
            get download() {
                return this.#___private_download_4;
            }
            set download(_v) {
                this.#___private_download_4 = _v;
            }
            #___private_variant_5 = _init_variant(this, 'primary');
            get variant() {
                return this.#___private_variant_5;
            }
            set variant(_v) {
                this.#___private_variant_5 = _v;
            }
            #___private_size_6 = _init_size(this, 'inherit');
            get size() {
                return this.#___private_size_6;
            }
            set size(_v) {
                this.#___private_size_6 = _v;
            }
            #___private_underline_7 = _init_underline(this, 'hover');
            get underline() {
                return this.#___private_underline_7;
            }
            set underline(_v) {
                this.#___private_underline_7 = _v;
            }
            #___private_disabled_8 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_8;
            }
            set disabled(_v) {
                this.#___private_disabled_8 = _v;
            }
            #___private_external_9 = _init_external(this, false);
            get external() {
                return this.#___private_external_9;
            }
            set external(_v) {
                this.#___private_external_9 = _v;
            }
            get _focusableElement() {
                return this.shadowRoot?.querySelector('a');
            }
            get _effectiveTarget() {
                return this.external ? '_blank' : this.target;
            }
            get _effectiveRel() {
                const isExternal = this.external || this.target === '_blank';
                if (!isExternal) {
                    return this.rel || A;
                }
                const rels = new Set((this.rel || '').split(' ').filter(Boolean));
                rels.add('noopener');
                rels.add('noreferrer');
                return Array.from(rels).join(' ');
            }
            #___private_ariaLabel_10 = _init_ariaLabel(this, null);
            get ariaLabel() {
                return this.#___private_ariaLabel_10;
            }
            set ariaLabel(_v) {
                this.#___private_ariaLabel_10 = _v;
            }
            render() {
                const effectiveTarget = this._effectiveTarget;
                const effectiveRel = this._effectiveRel;
                const ariaDisabled = this.disabled ? 'true' : null;
                const href = this.disabled || !this.href ? A : this.href;
                const ariaLabel = this.ariaLabel ?? A;
                return b`
      <a
        part="link"
        class="link ${this.disabled ? 'disabled' : ''} variant-${this.variant} size-${this.size} underline-${this.underline}"
        href=${href}
        target=${effectiveTarget}
        rel=${effectiveRel}
        download=${this.download || A}
        aria-disabled=${ariaDisabled}
        aria-label=${ariaLabel}
        tabindex=${this.disabled ? '-1' : '0'}
      >
        <slot name="icon" part="icon"></slot>
        <slot></slot>
        ${this.external ? b`<span part="external-icon">
              <vi-icon name="external-link" size="14"></vi-icon>
              <span class="sr-only">(opens in new tab)</span>
            </span>` : A}
      </a>
    `;
            }
        }
    }
}();

const meta = {
    title: 'Components/Link',
    component: 'vi-link',
    tags: [
        'autodocs'
    ],
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'primary',
                'secondary',
                'muted'
            ]
        },
        size: {
            control: 'select',
            options: [
                'inherit',
                'sm',
                'md',
                'lg'
            ]
        },
        underline: {
            control: 'select',
            options: [
                'always',
                'hover',
                'none'
            ]
        },
        disabled: {
            control: 'boolean'
        },
        external: {
            control: 'boolean'
        }
    },
    args: {
        variant: 'primary',
        size: 'inherit',
        underline: 'hover',
        disabled: false,
        external: false
    }
};
const Default = {
    render: (args)=>b`
    <vi-link
      variant=${args.variant}
      size=${args.size}
      underline=${args.underline}
      ?disabled=${args.disabled}
      ?external=${args.external}
      href="https://example.com"
    >
      Click here to learn more
    </vi-link>
  `
};
const Variants = {
    render: ()=>b`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <vi-link variant="primary" href="#">Primary Link</vi-link>
      <vi-link variant="secondary" href="#">Secondary Link</vi-link>
      <vi-link variant="muted" href="#">Muted Link</vi-link>
    </div>
  `
};
const UnderlineModes = {
    render: ()=>b`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <vi-link underline="always" href="#">Always Underline</vi-link>
      <vi-link underline="hover" href="#">Hover Underline</vi-link>
      <vi-link underline="none" href="#">No Underline</vi-link>
    </div>
  `
};
const External = {
    render: ()=>b`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <vi-link external href="https://example.com">External Link</vi-link>
    </div>
  `
};
const Disabled = {
    render: ()=>b`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <vi-link disabled href="#">Disabled Link</vi-link>
    </div>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <vi-link\n      variant=${args.variant}\n      size=${args.size}\n      underline=${args.underline}\n      ?disabled=${args.disabled}\n      ?external=${args.external}\n      href=\"https://example.com\"\n    >\n      Click here to learn more\n    </vi-link>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
Variants.parameters = {
    ...Variants.parameters,
    docs: {
        ...Variants.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 1rem; align-items: center;\">\n      <vi-link variant=\"primary\" href=\"#\">Primary Link</vi-link>\n      <vi-link variant=\"secondary\" href=\"#\">Secondary Link</vi-link>\n      <vi-link variant=\"muted\" href=\"#\">Muted Link</vi-link>\n    </div>\n  `\n}",
            ...Variants.parameters?.docs?.source
        }
    }
};
UnderlineModes.parameters = {
    ...UnderlineModes.parameters,
    docs: {
        ...UnderlineModes.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 1rem; align-items: center;\">\n      <vi-link underline=\"always\" href=\"#\">Always Underline</vi-link>\n      <vi-link underline=\"hover\" href=\"#\">Hover Underline</vi-link>\n      <vi-link underline=\"none\" href=\"#\">No Underline</vi-link>\n    </div>\n  `\n}",
            ...UnderlineModes.parameters?.docs?.source
        }
    }
};
External.parameters = {
    ...External.parameters,
    docs: {
        ...External.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 1rem; align-items: center;\">\n      <vi-link external href=\"https://example.com\">External Link</vi-link>\n    </div>\n  `\n}",
            ...External.parameters?.docs?.source
        }
    }
};
Disabled.parameters = {
    ...Disabled.parameters,
    docs: {
        ...Disabled.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 1rem; align-items: center;\">\n      <vi-link disabled href=\"#\">Disabled Link</vi-link>\n    </div>\n  `\n}",
            ...Disabled.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","Variants","UnderlineModes","External","Disabled"];

export { Default, Disabled, External, UnderlineModes, Variants, __namedExportsOrder, meta as default };
