import { r as r$1, i, A, b } from './iframe-HYUOBlkX.js';
import { V as ViElement, t, n } from './vi-element-CfjAgxlD.js';
import { r } from './state-B9TAfF5K.js';
import { F as FocusableMixin } from './focusable-mixin-DkKvOjpm.js';
import './vi-tooltip-Dv2NV8T1.js';
import './vi-icon-Cnd4Jh50.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import { c as chevronUpIcon, a as commentIcon, b as capsulesIcon, f as folderOpenIcon } from './folder-open-wZnTmIAf.js';
import { p as plusIcon } from './plus-5xw9LULD.js';
import { x as xIcon } from './x-3JmBhc9n.js';
import { c as checkIcon } from './check-D9SDO18H.js';
import { d as documentIcon } from './document-Ga13OJpQ.js';
import { f as fileTextIcon, s as saveIcon } from './save-DLPFi_QN.js';
import { l as lockIcon } from './lock-CCJyCMJ1.js';
import { t as triangleWarningIcon } from './triangle-warning-DChErXmA.js';
import { u as userIcon } from './user-ClgjB9Gx.js';
import './preload-helper-D5QYaGzd.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './floating-ui.dom-Dsl7AwNm.js';
import './overlay-manager-DiQwTjfQ.js';
import './directive-BKuZRRPO.js';

/**
 * Private policy set used for URL validation.
 * Internal to this module to prevent external callers from mutating component URL policies.
 */ const INTERNAL_ALLOWED_URL_SCHEMES = new Set([
    'http:',
    'https:',
    'mailto:',
    'tel:'
]);
class ReadonlySetSnapshot extends Set {
    _frozen = false;
    constructor(iterable){
        super(iterable);
        this._frozen = true;
    }
    add(value) {
        if (!this._frozen) {
            return super.add(value);
        }
        throw new TypeError('Cannot mutate read-only ALLOWED_URL_SCHEMES set');
    }
    delete(value) {
        if (!this._frozen) {
            return super.delete(value);
        }
        throw new TypeError('Cannot mutate read-only ALLOWED_URL_SCHEMES set');
    }
    clear() {
        if (!this._frozen) {
            super.clear();
            return;
        }
        throw new TypeError('Cannot mutate read-only ALLOWED_URL_SCHEMES set');
    }
}
/**
 * Read-only snapshot of safe URL schemes allowed for navigation.
 * All other schemes (e.g. javascript:, data:, vbscript:, file:, blob:) are rejected.
 */ Object.freeze(new ReadonlySetSnapshot(INTERNAL_ALLOWED_URL_SCHEMES));
/**
 * Regex matching dangerous and executable URI schemes.
 */ const DANGEROUS_SCHEMES = /^(?:javascript|data|vbscript|blob|file):/i;
/**
 * Regex matching ASCII control characters (0x00-0x1F, 0x7F).
 */ // eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS_REGEX = /[\x00-\x1F\x7F]/g;
/**
 * Regex matching ASCII control characters and whitespace.
 */ // eslint-disable-next-line no-control-regex
const CONTROL_AND_WHITESPACE_REGEX = /[\x00-\x1F\x7F\s]+/g;
/**
 * Decodes numeric and hexadecimal HTML character entity references that attackers
 * might use to obfuscate URL schemes (e.g. &#106;avascript: or &#x6a;avascript:).
 */ function decodeHtmlEntities(value) {
    return value.replace(/&#x([0-9a-fA-F]+);?/g, (_, hex)=>String.fromCharCode(parseInt(hex, 16))).replace(/&#([0-9]+);?/g, (_, dec)=>String.fromCharCode(parseInt(dec, 10)));
}
/**
 * Validates and sanitizes a URL string for safe use in anchor `href` attributes.
 *
 * Enforces an explicit allowlist of safe schemes (http, https, mailto, tel) as well as
 * relative URLs (/path, ./path, ../path, #hash, ?query).
 *
 * Strips ASCII control characters and rejects executable schemes (such as `javascript:`,
 * `data:`, `vbscript:`), preventing DOM-based Cross-Site Scripting (XSS).
 *
 * @param url - The candidate URL string to sanitize.
 * @returns The sanitized URL string, or `undefined` if the URL is invalid or unsafe.
 *
 * @example
 * sanitizeUrl('https://example.com'); // 'https://example.com'
 * sanitizeUrl('/dashboard');          // '/dashboard'
 * sanitizeUrl('#top');                // '#top'
 * sanitizeUrl('mailto:user@corp.io'); // 'mailto:user@corp.io'
 * sanitizeUrl('javascript:alert(1)'); // undefined
 * sanitizeUrl('data:text/html,...');  // undefined
 */ function sanitizeUrl(url) {
    if (typeof url !== 'string') {
        return undefined;
    }
    // Remove ASCII control characters and trim whitespace
    const sanitized = url.replace(CONTROL_CHARACTERS_REGEX, '').trim();
    if (sanitized.length === 0) {
        return undefined;
    }
    // Decode potential HTML entity obfuscations and strip inner whitespace to detect hidden schemes
    const decoded = decodeHtmlEntities(sanitized).replace(CONTROL_AND_WHITESPACE_REGEX, '');
    if (DANGEROUS_SCHEMES.test(decoded)) {
        return undefined;
    }
    // Check using WHATWG URL parsing with an internal dummy base
    try {
        const parsed = new URL(sanitized, 'https://vialiq.internal');
        if (!INTERNAL_ALLOWED_URL_SCHEMES.has(parsed.protocol)) {
            return undefined;
        }
        return sanitized;
    } catch  {
        return undefined;
    }
}

const floatButtonStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.float-button{box-sizing:border-box;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:var(--vi-float-button-size, 48px);height:var(--vi-float-button-size, 48px);min-width:var(--vi-float-button-size, 48px);min-height:var(--vi-float-button-size, 48px);padding:var(--vi-spacing-unit, .25rem);border-radius:var(--vi-float-button-border-radius, var(--vi-border-radius-full, 9999px));background-color:var(--vi-float-button-bg, var(--vi-layer-01, #ffffff));color:var(--vi-float-button-color, var(--vi-text-primary, #111827));border:var(--vi-border-width-thin, 1px) solid var(--vi-float-button-border-color, var(--vi-border-02, #eeeeee));box-shadow:var(--vi-float-button-shadow, var(--vi-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, .05), 0 20px 25px -5px rgba(0, 0, 0, .1)));cursor:pointer;position:relative;-webkit-user-select:none;user-select:none;text-decoration:none;outline:none;transition:background-color var(--vi-float-button-transition-duration, .2s) cubic-bezier(.4,0,.2,1),border-color var(--vi-float-button-transition-duration, .2s) cubic-bezier(.4,0,.2,1),box-shadow var(--vi-float-button-transition-duration, .2s) cubic-bezier(.4,0,.2,1),transform var(--vi-float-button-transition-duration, .2s) cubic-bezier(.4,0,.2,1),opacity var(--vi-float-button-transition-duration, .2s) cubic-bezier(.4,0,.2,1)}.float-button:hover:not([disabled]){background-color:var(--vi-float-button-hover-bg, var(--vi-layer-hover-01, #f3f4f6));box-shadow:var(--vi-float-button-shadow-hover, var(--vi-shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, .05), 0 25px 50px -12px rgba(0, 0, 0, .15)));transform:translateY(-2px)}.float-button:active:not([disabled]){transform:translateY(0);box-shadow:var(--vi-float-button-shadow, var(--vi-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, .05), 0 20px 25px -5px rgba(0, 0, 0, .1)))}.float-button:focus-visible{outline:var(--vi-border-width-base, 2px) solid var(--vi-float-button-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:2px}.float-button[disabled]{cursor:not-allowed;opacity:.5;pointer-events:none;box-shadow:none;transform:none}.float-button--square{border-radius:var(--vi-float-button-border-radius-square, var(--vi-border-radius-lg, 8px))}.float-button--sm{width:var(--vi-float-button-size-sm, 40px);height:var(--vi-float-button-size-sm, 40px);min-width:var(--vi-float-button-size-sm, 40px);min-height:var(--vi-float-button-size-sm, 40px);padding:2px}.float-button--primary{background-color:var(--vi-float-button-bg-primary, var(--vi-color-primary, #3676d0));color:var(--vi-float-button-color-primary, var(--vi-text-primary-inverse, #ffffff));border-color:transparent}.float-button--primary:hover:not([disabled]){background-color:var(--vi-float-button-hover-bg-primary, var(--vi-color-blue-800, #2d5fa8))}.float-button__icon{display:inline-flex;align-items:center;justify-content:center;line-height:1;font-size:1.25rem}.float-button__icon svg{width:1.25rem;height:1.25rem}.float-button--sm .float-button__icon{font-size:1rem}.float-button--sm .float-button__icon svg{width:1rem;height:1rem}.float-button__description{font-size:var(--vi-float-button-font-size, var(--vi-font-size-xs, .75rem));line-height:var(--vi-line-height-tight, 1.2);text-align:center;margin-top:2px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-inline:2px}.float-button__badge{position:absolute;top:-4px;inset-inline-end:-4px;z-index:2;pointer-events:none}.float-button-group{display:inline-flex;flex-direction:column;align-items:center;gap:var(--vi-float-button-group-gap, var(--vi-spacing-xs, .5rem))}.float-button-group__menu{display:inline-flex;flex-direction:column;align-items:center;gap:var(--vi-float-button-group-gap, var(--vi-spacing-xs, .5rem));transition:opacity var(--vi-float-button-transition-duration, .2s) ease,transform var(--vi-float-button-transition-duration, .2s) ease}}:host{display:inline-block;box-sizing:border-box}:host(:not([in-group])){position:fixed;inset-inline-end:var(--vi-float-button-inset-inline-end, 24px);inset-block-end:var(--vi-float-button-inset-block-end, 48px);z-index:var(--vi-float-button-z-index, 1030)}:host([back-top][hidden-back-top]){opacity:0;pointer-events:none;transform:scale(.6);visibility:hidden;transition:opacity var(--vi-float-button-transition-duration, .2s) cubic-bezier(.4,0,.2,1),transform var(--vi-float-button-transition-duration, .2s) cubic-bezier(.4,0,.2,1),visibility var(--vi-float-button-transition-duration, .2s)}:host([back-top]:not([hidden-back-top])){opacity:1;pointer-events:auto;transform:scale(1);visibility:visible;transition:opacity var(--vi-float-button-transition-duration, .2s) cubic-bezier(.4,0,.2,1),transform var(--vi-float-button-transition-duration, .2s) cubic-bezier(.4,0,.2,1),visibility var(--vi-float-button-transition-duration, .2s)}:host(:active) .float-button:not([disabled]):not([aria-disabled=true]),:host([aria-pressed=true]) .float-button:not([disabled]):not([aria-disabled=true]){background-color:var(--vi-float-button-active-bg, var(--vi-layer-hover-02, #e5e7eb));border-color:var(--vi-float-button-active-border-color, var(--vi-border-03, #e0e0e0));box-shadow:var(--vi-float-button-shadow-active, inset 0 2px 4px rgba(0, 0, 0, .12), var(--vi-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, .03)));transform:translateY(1px) scale(.97)}:host([type=primary]:active) .float-button:not([disabled]):not([aria-disabled=true]),:host([type=primary][aria-pressed=true]) .float-button:not([disabled]):not([aria-disabled=true]){background-color:var(--vi-float-button-active-bg-primary, var(--vi-color-blue-900, #254882));box-shadow:var(--vi-float-button-shadow-active-primary, inset 0 2px 4px rgba(0, 0, 0, .25), var(--vi-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, .03)));transform:translateY(1px) scale(.97)}.float-button__control{position:relative;display:inline-flex}.float-button__control vi-tooltip{display:inline-flex}.float-button__icon,.default-icon{pointer-events:none}:host([in-group]:not(.float-button-group__trigger)) .float-button:focus,:host([in-group]:not(.float-button-group__trigger)) .float-button:focus-visible{outline:var(--vi-border-width-base, 2px) solid var(--vi-float-button-focus-ring-color, var(--vi-focus, #3676d0));outline-offset:2px}.float-button__description[hidden]{display:none!important}.float-button__badge{display:inline-flex;align-items:center;justify-content:center;position:absolute;top:-4px;inset-inline-end:-4px;z-index:2;pointer-events:none}.badge-dot{width:8px;height:8px;border-radius:var(--vi-border-radius-full, 9999px);background-color:var(--vi-badge-danger-bg, var(--vi-bg-error, #ffebee));border:1.5px solid var(--vi-float-button-bg, var(--vi-layer-01, #ffffff));box-sizing:content-box}.badge-count{min-width:18px;height:18px;padding:0 4px;border-radius:var(--vi-border-radius-full, 9999px);font-size:11px;font-weight:600;line-height:18px;text-align:center;background-color:var(--vi-badge-danger-color, var(--vi-color-red-500, #fb3c1e));color:var(--vi-text-primary-inverse, var(--vi-text-primary-inverse, #ffffff));border:1.5px solid var(--vi-float-button-bg, var(--vi-layer-01, #ffffff));box-sizing:border-box;white-space:nowrap}:host([badge-status=primary]) .badge-dot,:host([badge-status=primary]) .badge-count{background-color:var(--vi-color-primary, var(--vi-color-primary, #3676d0))}:host([badge-status=success]) .badge-dot,:host([badge-status=success]) .badge-count{background-color:var(--vi-color-success, var(--vi-color-green-500, #489167))}:host([badge-status=warning]) .badge-dot,:host([badge-status=warning]) .badge-count{background-color:var(--vi-color-warning, var(--vi-color-yellow-500, #ffba00));color:var(--vi-text-primary, var(--vi-text-primary, #111827))}:host([badge-status=info]) .badge-dot,:host([badge-status=info]) .badge-count{background-color:var(--vi-color-info, var(--vi-color-blue-500, #3f96f1))}:host([badge-status=neutral]) .badge-dot,:host([badge-status=neutral]) .badge-count{background-color:var(--vi-badge-neutral-color, var(--vi-color-grey-600, #757575))}.default-icon{display:block;width:1.25rem;height:1.25rem;fill:currentColor}:host([size=sm]) .default-icon{width:1rem;height:1rem}:host-context(vi-float-button-group){position:static;inset-inline-end:auto;inset-block-end:auto}:host(vi-float-button-group){position:fixed;inset-inline-end:var(--vi-float-button-inset-inline-end, 24px);inset-block-end:var(--vi-float-button-inset-block-end, 48px);z-index:var(--vi-float-button-z-index, 1030);display:inline-flex;flex-direction:column;align-items:center}.float-button-group__menu{display:flex;flex-direction:column;align-items:center;gap:var(--vi-float-button-group-gap, var(--vi-spacing-xs, .5rem));margin-bottom:var(--vi-float-button-group-gap, var(--vi-spacing-xs, .5rem));transition:opacity var(--vi-float-button-transition-duration, .2s) cubic-bezier(.4,0,.2,1),transform var(--vi-float-button-transition-duration, .2s) cubic-bezier(.4,0,.2,1)}:host(vi-float-button-group:not([open])) .float-button-group__menu{opacity:0;pointer-events:none;visibility:hidden;transform:translateY(12px) scale(.9)}:host(vi-float-button-group[open]) .float-button-group__menu{opacity:1;pointer-events:auto;visibility:visible;transform:translateY(0) scale(1)}@media(prefers-reduced-motion:reduce){.float-button,.float-button-group__menu,:host([back-top]){transition:none!important}}";

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
var _dec$1, _initClass$1, _FocusableMixin, _dec1$1, _dec2$1, _dec3$1, _dec4$1, _dec5$1, _dec6$1, _dec7$1, _dec8$1, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, /** Button geometry shape. */ _init_shape$1, /** Visual type. */ _init_type, /** Size scale. */ _init_size, /** Description text displayed under the icon. */ _init_description, /** Tooltip text. */ _init_tooltip, /** Optional anchor link URL. */ _init_href, /** Target for anchor link. */ _init_target, /** Relationship attribute for anchor link. Enforces noopener noreferrer when target is _blank. */ _init_rel, /** Badge count or string label. */ _init_badge, /** Badge dot indicator mode. */ _init_badgeDot, /** Badge semantic status color. */ _init_badgeStatus, /** Enables smooth scroll-to-top mode. */ _init_backTop, /** Scroll distance threshold before backTop button appears. */ _init_visibilityHeight, /** Target scrollable container CSS selector or element ID. */ _init_scrollTarget, /** Scroll animation duration in milliseconds (applies to both window and custom scroll targets; 0 for instant). */ _init_duration, /** Disabled state. */ _init_disabled, /** Whether the button participates in sequential tab navigation. Used for roving tabindex in groups. */ _init_tabbable, /** Reflects if the button is placed inside a <vi-float-button-group>. */ _init_inGroup, /** Accessible label. */ _init_ariaLabel$1, /** Pressed state for toggle button functionality. */ _init_ariaPressed, /** Popup type (e.g. 'menu', 'dialog') forwarded to inner native button. */ _init_ariaHasPopup, /** Expanded state forwarded to inner native button. */ _init_ariaExpanded, /** Internal state tracking back-top visibility below threshold. */ _init_hiddenBackTop, _init__hasSlottedIcon$1, _init__hasSlottedTooltip, _init__hasSlottedDescription, _initProto$1;
registerIcons([
    chevronUpIcon
]);
/**
 * vi-float-button
 * Floating action button for quick actions, back-to-top navigation, and speed dial clusters.
 *
 * @element vi-float-button
 * @attr shape - Button geometry: circle | square (default: circle)
 * @attr type - Visual type: default | primary (default: default)
 * @attr size - Size: default | sm (default: default)
 * @attr description - Text description label under icon
 * @attr tooltip - Text tooltip displayed on hover/focus
 * @attr href - Optional URL to navigate to (renders <a> when provided)
 * @attr target - Anchor target (_blank, _self, etc.)
 * @attr rel - Relationship attribute for anchor link (automatically includes noopener noreferrer for _blank)
 * @attr badge - Numeric count or text badge
 * @attr badge-dot - Show a status dot badge
 * @attr badge-status - Badge status semantic color: neutral | primary | success | warning | danger | info
 * @attr back-top - Enable back-to-top scroll behavior
 * @attr visibility-height - Scroll threshold (px) before backTop button appears (default: 400)
 * @attr scroll-target - CSS selector or element ID for custom scroll container
 * @attr duration - Scroll animation duration in milliseconds for window and custom containers (default: 450, 0 for instant)
 * @attr disabled - Disables interactions
 *
 * @slot icon - Custom icon element
 * @slot description - Custom description content
 * @slot tooltip - Custom slotted tooltip
 * @slot - Fallback content
 *
 * @csspart control - Host wrapper container
 * @csspart button - Inner <button> or <a> element
 * @csspart icon - Icon slot wrapper
 * @csspart description - Description label wrapper
 * @csspart badge - Badge indicator wrapper
 *
 * @fires vi-float-button-click - Dispatched when button is clicked
 * @fires vi-float-button-back-top - Dispatched when back-top triggers scrolling
 */ /**
 * Cubic ease-in-out easing function.
 * @param t Normalized progress from 0 to 1.
 */ function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}
let _ViFloatButton;
_dec$1 = t('vi-float-button'), _dec1$1 = n({
    type: String,
    reflect: true
}), _dec2$1 = n({
    type: String,
    reflect: true
}), _dec3$1 = n({
    type: String,
    reflect: true
}), _dec4$1 = n({
    type: String,
    reflect: true
}), _dec5$1 = n({
    type: String
}), _dec6$1 = n({
    type: String,
    reflect: true
}), _dec7$1 = n({
    type: String,
    reflect: true
}), _dec8$1 = n({
    type: String,
    reflect: true
}), _dec9 = n({
    reflect: true
}), _dec10 = n({
    type: Boolean,
    reflect: true,
    attribute: 'badge-dot'
}), _dec11 = n({
    type: String,
    reflect: true,
    attribute: 'badge-status'
}), _dec12 = n({
    type: Boolean,
    reflect: true,
    attribute: 'back-top'
}), _dec13 = n({
    type: Number,
    reflect: true,
    attribute: 'visibility-height'
}), _dec14 = n({
    type: String,
    attribute: 'scroll-target'
}), _dec15 = n({
    type: Number
}), _dec16 = n({
    type: Boolean,
    reflect: true
}), _dec17 = n({
    type: Boolean
}), _dec18 = n({
    type: Boolean,
    reflect: true,
    attribute: 'in-group'
}), _dec19 = n({
    attribute: 'aria-label'
}), _dec20 = n({
    attribute: 'aria-pressed',
    reflect: true
}), _dec21 = n({
    attribute: 'aria-haspopup',
    reflect: true
}), _dec22 = n({
    attribute: 'aria-expanded',
    reflect: true
}), _dec23 = n({
    type: Boolean,
    reflect: true,
    attribute: 'hidden-back-top'
}), _dec24 = r(), _dec25 = r(), _dec26 = r();
new class extends _identity$1 {
    constructor(){
        super(_ViFloatButton), _initClass$1();
    }
    static{
        class ViFloatButton extends (_FocusableMixin = FocusableMixin(ViElement)) {
            static{
                ({ e: [_init_shape$1, _init_type, _init_size, _init_description, _init_tooltip, _init_href, _init_target, _init_rel, _init_badge, _init_badgeDot, _init_badgeStatus, _init_backTop, _init_visibilityHeight, _init_scrollTarget, _init_duration, _init_disabled, _init_tabbable, _init_inGroup, _init_ariaLabel$1, _init_ariaPressed, _init_ariaHasPopup, _init_ariaExpanded, _init_hiddenBackTop, _init__hasSlottedIcon$1, _init__hasSlottedTooltip, _init__hasSlottedDescription, _initProto$1], c: [_ViFloatButton, _initClass$1] } = _apply_decs_2203_r$1(this, [
                    [
                        _dec1$1,
                        1,
                        "shape"
                    ],
                    [
                        _dec2$1,
                        1,
                        "type"
                    ],
                    [
                        _dec3$1,
                        1,
                        "size"
                    ],
                    [
                        _dec4$1,
                        1,
                        "description"
                    ],
                    [
                        _dec5$1,
                        1,
                        "tooltip"
                    ],
                    [
                        _dec6$1,
                        1,
                        "href"
                    ],
                    [
                        _dec7$1,
                        1,
                        "target"
                    ],
                    [
                        _dec8$1,
                        1,
                        "rel"
                    ],
                    [
                        _dec9,
                        1,
                        "badge"
                    ],
                    [
                        _dec10,
                        1,
                        "badgeDot"
                    ],
                    [
                        _dec11,
                        1,
                        "badgeStatus"
                    ],
                    [
                        _dec12,
                        1,
                        "backTop"
                    ],
                    [
                        _dec13,
                        1,
                        "visibilityHeight"
                    ],
                    [
                        _dec14,
                        1,
                        "scrollTarget"
                    ],
                    [
                        _dec15,
                        1,
                        "duration"
                    ],
                    [
                        _dec16,
                        1,
                        "disabled"
                    ],
                    [
                        _dec17,
                        1,
                        "tabbable"
                    ],
                    [
                        _dec18,
                        1,
                        "inGroup"
                    ],
                    [
                        _dec19,
                        1,
                        "ariaLabel"
                    ],
                    [
                        _dec20,
                        1,
                        "ariaPressed"
                    ],
                    [
                        _dec21,
                        1,
                        "ariaHasPopup"
                    ],
                    [
                        _dec22,
                        1,
                        "ariaExpanded"
                    ],
                    [
                        _dec23,
                        1,
                        "hiddenBackTop"
                    ],
                    [
                        _dec24,
                        1,
                        "_hasSlottedIcon"
                    ],
                    [
                        _dec25,
                        1,
                        "_hasSlottedTooltip"
                    ],
                    [
                        _dec26,
                        1,
                        "_hasSlottedDescription"
                    ]
                ], [
                    _dec$1
                ], _FocusableMixin));
            }
            static styles = i`
    ${r$1(floatButtonStyles)}
  `;
            get _focusableElement() {
                return this.shadowRoot?.querySelector('.float-button') ?? null;
            }
            #___private_shape_1 = (_initProto$1(this), _init_shape$1(this, 'circle'));
            get shape() {
                return this.#___private_shape_1;
            }
            set shape(_v) {
                this.#___private_shape_1 = _v;
            }
            #___private_type_2 = _init_type(this, 'default');
            get type() {
                return this.#___private_type_2;
            }
            set type(_v) {
                this.#___private_type_2 = _v;
            }
            #___private_size_3 = _init_size(this, 'default');
            get size() {
                return this.#___private_size_3;
            }
            set size(_v) {
                this.#___private_size_3 = _v;
            }
            #___private_description_4 = _init_description(this, undefined);
            get description() {
                return this.#___private_description_4;
            }
            set description(_v) {
                this.#___private_description_4 = _v;
            }
            #___private_tooltip_5 = _init_tooltip(this, undefined);
            get tooltip() {
                return this.#___private_tooltip_5;
            }
            set tooltip(_v) {
                this.#___private_tooltip_5 = _v;
            }
            #___private_href_6 = _init_href(this, undefined);
            get href() {
                return this.#___private_href_6;
            }
            set href(_v) {
                this.#___private_href_6 = _v;
            }
            #___private_target_7 = _init_target(this, undefined);
            get target() {
                return this.#___private_target_7;
            }
            set target(_v) {
                this.#___private_target_7 = _v;
            }
            #___private_rel_8 = _init_rel(this, undefined);
            get rel() {
                return this.#___private_rel_8;
            }
            set rel(_v) {
                this.#___private_rel_8 = _v;
            }
            get _effectiveRel() {
                const isBlank = this.target === '_blank';
                if (!isBlank && !this.rel) {
                    return A;
                }
                const rels = new Set((this.rel || '').split(' ').filter(Boolean));
                if (isBlank) {
                    rels.add('noopener');
                    rels.add('noreferrer');
                }
                return rels.size > 0 ? Array.from(rels).join(' ') : A;
            }
            #___private_badge_9 = _init_badge(this, undefined);
            get badge() {
                return this.#___private_badge_9;
            }
            set badge(_v) {
                this.#___private_badge_9 = _v;
            }
            #___private_badgeDot_10 = _init_badgeDot(this, false);
            get badgeDot() {
                return this.#___private_badgeDot_10;
            }
            set badgeDot(_v) {
                this.#___private_badgeDot_10 = _v;
            }
            #___private_badgeStatus_11 = _init_badgeStatus(this, 'danger');
            get badgeStatus() {
                return this.#___private_badgeStatus_11;
            }
            set badgeStatus(_v) {
                this.#___private_badgeStatus_11 = _v;
            }
            #___private_backTop_12 = _init_backTop(this, false);
            get backTop() {
                return this.#___private_backTop_12;
            }
            set backTop(_v) {
                this.#___private_backTop_12 = _v;
            }
            #___private_visibilityHeight_13 = _init_visibilityHeight(this, 400);
            get visibilityHeight() {
                return this.#___private_visibilityHeight_13;
            }
            set visibilityHeight(_v) {
                this.#___private_visibilityHeight_13 = _v;
            }
            #___private_scrollTarget_14 = _init_scrollTarget(this, undefined);
            get scrollTarget() {
                return this.#___private_scrollTarget_14;
            }
            set scrollTarget(_v) {
                this.#___private_scrollTarget_14 = _v;
            }
            #___private_duration_15 = _init_duration(this, 450);
            get duration() {
                return this.#___private_duration_15;
            }
            set duration(_v) {
                this.#___private_duration_15 = _v;
            }
            #___private_disabled_16 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_16;
            }
            set disabled(_v) {
                this.#___private_disabled_16 = _v;
            }
            #___private_tabbable_17 = _init_tabbable(this, true);
            get tabbable() {
                return this.#___private_tabbable_17;
            }
            set tabbable(_v) {
                this.#___private_tabbable_17 = _v;
            }
            #___private_inGroup_18 = _init_inGroup(this, false);
            get inGroup() {
                return this.#___private_inGroup_18;
            }
            set inGroup(_v) {
                this.#___private_inGroup_18 = _v;
            }
            #___private_ariaLabel_19 = _init_ariaLabel$1(this, null);
            get ariaLabel() {
                return this.#___private_ariaLabel_19;
            }
            set ariaLabel(_v) {
                this.#___private_ariaLabel_19 = _v;
            }
            #___private_ariaPressed_20 = _init_ariaPressed(this, null);
            get ariaPressed() {
                return this.#___private_ariaPressed_20;
            }
            set ariaPressed(_v) {
                this.#___private_ariaPressed_20 = _v;
            }
            #___private_ariaHasPopup_21 = _init_ariaHasPopup(this, null);
            get ariaHasPopup() {
                return this.#___private_ariaHasPopup_21;
            }
            set ariaHasPopup(_v) {
                this.#___private_ariaHasPopup_21 = _v;
            }
            #___private_ariaExpanded_22 = _init_ariaExpanded(this, null);
            get ariaExpanded() {
                return this.#___private_ariaExpanded_22;
            }
            set ariaExpanded(_v) {
                this.#___private_ariaExpanded_22 = _v;
            }
            #___private_hiddenBackTop_23 = _init_hiddenBackTop(this, false);
            get hiddenBackTop() {
                return this.#___private_hiddenBackTop_23;
            }
            set hiddenBackTop(_v) {
                this.#___private_hiddenBackTop_23 = _v;
            }
            #___private__hasSlottedIcon_24 = _init__hasSlottedIcon$1(this, false);
            get _hasSlottedIcon() {
                return this.#___private__hasSlottedIcon_24;
            }
            set _hasSlottedIcon(_v) {
                this.#___private__hasSlottedIcon_24 = _v;
            }
            #___private__hasSlottedTooltip_25 = _init__hasSlottedTooltip(this, false);
            get _hasSlottedTooltip() {
                return this.#___private__hasSlottedTooltip_25;
            }
            set _hasSlottedTooltip(_v) {
                this.#___private__hasSlottedTooltip_25 = _v;
            }
            #___private__hasSlottedDescription_26 = _init__hasSlottedDescription(this, false);
            get _hasSlottedDescription() {
                return this.#___private__hasSlottedDescription_26;
            }
            set _hasSlottedDescription(_v) {
                this.#___private__hasSlottedDescription_26 = _v;
            }
            _scrollHandlerBound;
            _currentScrollContainer;
            _scrollTargetObserver;
            _scrollAnimationId;
            get _hasSlottedTooltipContent() {
                if (this._hasSlottedTooltip) return true;
                return Array.from(this.children).some((child)=>child.getAttribute('slot') === 'tooltip');
            }
            _handleTooltipSlotChange(event) {
                const slot = event.target;
                const nodes = slot.assignedNodes({
                    flatten: true
                });
                this._hasSlottedTooltip = nodes.some((node)=>node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '');
            }
            get _hasSlottedDescriptionContent() {
                if (this._hasSlottedDescription) return true;
                return Array.from(this.children).some((child)=>child.getAttribute('slot') === 'description');
            }
            _handleDescriptionSlotChange(event) {
                const slot = event.target;
                const nodes = slot.assignedNodes({
                    flatten: true
                });
                this._hasSlottedDescription = nodes.some((node)=>node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '');
            }
            connectedCallback() {
                super.connectedCallback();
                if (!this.tabbable || this.disabled) {
                    this._setHostFocusable(false);
                }
                if (this.backTop) {
                    this._setupScrollListener();
                }
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this._cancelScrollAnimation();
                this._teardownScrollListener();
            }
            updated(changedProperties) {
                super.updated(changedProperties);
                if (changedProperties.has('disabled') || changedProperties.has('tabbable')) {
                    this._setHostFocusable(!this.disabled && this.tabbable);
                }
                if (changedProperties.has('backTop') || changedProperties.has('scrollTarget') || changedProperties.has('visibilityHeight')) {
                    if (this.backTop) {
                        this._setupScrollListener();
                    } else {
                        this._teardownScrollListener();
                        this.hiddenBackTop = false;
                    }
                }
            }
            _resolveScrollContainer() {
                if (!this.scrollTarget) {
                    return window;
                }
                const target = this.scrollTarget.trim();
                if (!target) {
                    return window;
                }
                const rootNode = this.getRootNode() ?? document;
                // 1. Direct ID lookup (handles bare IDs without '#')
                if ('getElementById' in rootNode && typeof rootNode.getElementById === 'function') {
                    const byId = rootNode.getElementById(target);
                    if (byId) return byId;
                }
                const docById = document.getElementById(target);
                if (docById) return docById;
                // If target has a leading '#', also try getElementById with '#' stripped
                if (target.startsWith('#')) {
                    const rawId = target.slice(1);
                    if ('getElementById' in rootNode && typeof rootNode.getElementById === 'function') {
                        const byId = rootNode.getElementById(rawId);
                        if (byId) return byId;
                    }
                    const docById = document.getElementById(rawId);
                    if (docById) return docById;
                }
                // 2. Query selector lookup (CSS selector or ID with '#')
                try {
                    const el = rootNode.querySelector(target) ?? document.querySelector(target);
                    if (el) return el;
                } catch  {
                // Ignore syntax errors from invalid selector strings
                }
                // 3. Fallback: if bare ID didn't match a selector, attempt escaping ID as selector
                if (!/^([#.[:>])/.test(target)) {
                    try {
                        const escapedSelector = `#${CSS.escape(target)}`;
                        const el = rootNode.querySelector(escapedSelector) ?? document.querySelector(escapedSelector);
                        if (el) return el;
                    } catch  {
                    // Ignore escaping errors
                    }
                }
                return window;
            }
            _setupScrollListener() {
                this._teardownScrollListener();
                this._currentScrollContainer = this._resolveScrollContainer();
                this._scrollHandlerBound = ()=>this._handleScroll();
                this._currentScrollContainer.addEventListener('scroll', this._scrollHandlerBound, {
                    passive: true
                });
                // Initial check
                this._handleScroll();
                // If a custom scrollTarget was configured but resolved to window,
                // observe the DOM to retry resolving when the target is inserted late.
                if (this.scrollTarget && this._currentScrollContainer instanceof Window) {
                    this._observeForScrollTarget();
                }
            }
            _observeForScrollTarget() {
                this._disconnectScrollTargetObserver();
                const rootNode = this.getRootNode() ?? document;
                const targetsToObserve = [];
                if (rootNode instanceof Document) {
                    if (rootNode.documentElement) targetsToObserve.push(rootNode.documentElement);
                } else if (rootNode instanceof ShadowRoot) {
                    targetsToObserve.push(rootNode);
                    if (document.documentElement) targetsToObserve.push(document.documentElement);
                } else {
                    if (document.documentElement) targetsToObserve.push(document.documentElement);
                }
                if (!targetsToObserve.length) return;
                this._scrollTargetObserver = new MutationObserver(()=>{
                    const container = this._resolveScrollContainer();
                    if (!(container instanceof Window)) {
                        this._disconnectScrollTargetObserver();
                        this._setupScrollListener();
                    }
                });
                for (const node of targetsToObserve){
                    this._scrollTargetObserver.observe(node, {
                        childList: true,
                        subtree: true
                    });
                }
            }
            _disconnectScrollTargetObserver() {
                if (this._scrollTargetObserver) {
                    this._scrollTargetObserver.disconnect();
                    this._scrollTargetObserver = undefined;
                }
            }
            _cancelScrollAnimation() {
                if (this._scrollAnimationId !== undefined) {
                    cancelAnimationFrame(this._scrollAnimationId);
                    this._scrollAnimationId = undefined;
                }
            }
            _teardownScrollListener() {
                this._cancelScrollAnimation();
                this._disconnectScrollTargetObserver();
                if (this._currentScrollContainer && this._scrollHandlerBound) {
                    this._currentScrollContainer.removeEventListener('scroll', this._scrollHandlerBound);
                }
                this._scrollHandlerBound = undefined;
                this._currentScrollContainer = undefined;
            }
            _handleScroll() {
                if (!this.backTop) return;
                // If configured scrollTarget was previously unresolved, check if it's now available
                if (this.scrollTarget && this._currentScrollContainer instanceof Window) {
                    const resolved = this._resolveScrollContainer();
                    if (!(resolved instanceof Window)) {
                        this._disconnectScrollTargetObserver();
                        this._setupScrollListener();
                        return;
                    }
                }
                const container = this._currentScrollContainer ?? window;
                let scrollTop = 0;
                if (container instanceof Window) {
                    scrollTop = window.scrollY ?? document.documentElement.scrollTop ?? 0;
                } else {
                    scrollTop = container.scrollTop ?? 0;
                }
                const shouldHide = scrollTop < this.visibilityHeight;
                if (this.hiddenBackTop !== shouldHide) {
                    this.hiddenBackTop = shouldHide;
                }
            }
            _handleSlotChange(event) {
                const slot = event.target;
                if (slot.name === 'icon') {
                    this._hasSlottedIcon = slot.assignedElements().length > 0;
                }
            }
            _handleClick(event) {
                if (this.disabled) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return;
                }
                if (this.backTop) {
                    this._scrollToTop();
                }
                this.dispatchEvent(new CustomEvent('vi-float-button-click', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        originalEvent: event
                    }
                }));
            }
            _scrollToTop() {
                const container = this._resolveScrollContainer();
                const isWindow = container instanceof Window;
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                const duration = typeof this.duration === 'number' && !isNaN(this.duration) ? Math.max(0, this.duration) : 450;
                this._cancelScrollAnimation();
                const getScrollTop = ()=>{
                    if (isWindow) {
                        return window.scrollY ?? window.pageYOffset ?? document.documentElement?.scrollTop ?? document.body?.scrollTop ?? 0;
                    }
                    return container.scrollTop ?? 0;
                };
                const setScrollTop = (top)=>{
                    if (isWindow) {
                        if (typeof window.scrollTo === 'function') {
                            try {
                                window.scrollTo({
                                    top,
                                    behavior: 'auto'
                                });
                            } catch  {
                                try {
                                    window.scrollTo(0, top);
                                } catch  {
                                // Ignore
                                }
                            }
                        }
                        if (document.documentElement) {
                            document.documentElement.scrollTop = top;
                        }
                        if (document.body) {
                            document.body.scrollTop = top;
                        }
                    } else {
                        const el = container;
                        if (typeof el.scrollTo === 'function') {
                            try {
                                el.scrollTo({
                                    top,
                                    behavior: 'auto'
                                });
                            } catch  {
                            // Ignore
                            }
                        }
                        el.scrollTop = top;
                    }
                };
                const startTop = getScrollTop();
                if (prefersReducedMotion || duration === 0 || startTop <= 0) {
                    setScrollTop(0);
                } else {
                    const startTime = performance.now();
                    const step = (currentTime)=>{
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const easedProgress = easeInOutCubic(progress);
                        const currentTop = Math.max(0, Math.round(startTop * (1 - easedProgress)));
                        setScrollTop(currentTop);
                        if (progress < 1) {
                            this._scrollAnimationId = requestAnimationFrame(step);
                        } else {
                            this._scrollAnimationId = undefined;
                            setScrollTop(0);
                        }
                    };
                    this._scrollAnimationId = requestAnimationFrame(step);
                }
                this.dispatchEvent(new CustomEvent('vi-float-button-back-top', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        scrollTarget: container
                    }
                }));
            }
            _renderBadge() {
                if (this.badgeDot) {
                    return b`
        <span class="float-button__badge" part="badge" aria-hidden="true">
          <span class="badge-dot"></span>
        </span>
      `;
                }
                if (this.badge !== undefined && this.badge !== null && this.badge !== '') {
                    return b`
        <span class="float-button__badge" part="badge" aria-hidden="true">
          <span class="badge-count">${this.badge}</span>
        </span>
      `;
                }
                return A;
            }
            _renderIcon() {
                return b`
      <span class="float-button__icon" part="icon">
        <slot name="icon" @slotchange="${this._handleSlotChange}"></slot>
        ${!this._hasSlottedIcon && this.backTop ? b`<vi-icon name="chevron-up" class="default-icon"></vi-icon>` : A}
      </span>
    `;
            }
            _renderDescription() {
                const hasDescription = Boolean(this.description) || this._hasSlottedDescriptionContent;
                return b`
      <span
        class="float-button__description"
        part="description"
        ?hidden="${!hasDescription}"
      >
        <slot
          name="description"
          @slotchange="${this._handleDescriptionSlotChange}"
        >${this.description ?? ''}</slot>
      </span>
    `;
            }
            _renderButtonContent() {
                const isSquare = this.shape === 'square';
                const isSm = this.size === 'sm';
                const isPrimary = this.type === 'primary';
                const classes = [
                    'float-button',
                    isSquare ? 'float-button--square' : '',
                    isSm ? 'float-button--sm' : '',
                    isPrimary ? 'float-button--primary' : ''
                ].filter(Boolean).join(' ');
                const accessibleLabel = this.ariaLabel ?? (this.tooltip ? this.tooltip : this.backTop ? 'Back to top' : this.description ? this.description : undefined);
                const safeHref = sanitizeUrl(this.href);
                const effectiveAriaHasPopup = this.ariaHasPopup !== null && this.ariaHasPopup !== undefined ? String(this.ariaHasPopup) : A;
                const effectiveAriaExpanded = this.ariaExpanded !== null && this.ariaExpanded !== undefined ? String(this.ariaExpanded) : A;
                if (safeHref) {
                    return b`
        <a
          class="${classes}"
          part="button"
          href="${this.disabled ? A : safeHref}"
          target="${this.target ?? A}"
          rel="${this._effectiveRel}"
          tabindex="${this.disabled ? -1 : this.tabbable ? 0 : -1}"
          role="${this.inGroup && !this.ariaHasPopup ? 'menuitem' : A}"
          aria-label="${accessibleLabel ?? A}"
          aria-pressed="${this.ariaPressed ?? A}"
          aria-disabled="${this.disabled ? 'true' : A}"
          aria-haspopup="${effectiveAriaHasPopup}"
          aria-expanded="${effectiveAriaExpanded}"
          @click="${this._handleClick}"
        >
          ${this._renderBadge()} ${this._renderIcon()}
          ${this._renderDescription()}
          <slot></slot>
        </a>
      `;
                }
                return b`
      <button
        class="${classes}"
        part="button"
        type="button"
        ?disabled="${this.disabled}"
        tabindex="${this.disabled ? -1 : this.tabbable ? 0 : -1}"
        role="${this.inGroup && !this.ariaHasPopup ? 'menuitem' : A}"
        aria-label="${accessibleLabel ?? A}"
        aria-pressed="${this.ariaPressed ?? A}"
        aria-disabled="${this.disabled ? 'true' : A}"
        aria-haspopup="${effectiveAriaHasPopup}"
        aria-expanded="${effectiveAriaExpanded}"
        @click="${this._handleClick}"
      >
        ${this._renderBadge()} ${this._renderIcon()}
        ${this._renderDescription()}
        <slot></slot>
      </button>
    `;
            }
            render() {
                const buttonContent = this._renderButtonContent();
                const hasTooltip = (Boolean(this.tooltip) || this._hasSlottedTooltipContent) && !this.disabled;
                const inner = hasTooltip ? b`
          <vi-tooltip placement="left" .content="${this.tooltip || ''}">
            ${buttonContent}
            <slot
              name="tooltip"
              slot="content"
              @slotchange="${this._handleTooltipSlotChange}"
            >${this.tooltip ?? A}</slot>
          </vi-tooltip>
        ` : b`
          ${buttonContent}
          <div hidden style="display: none;">
            <slot
              name="tooltip"
              @slotchange="${this._handleTooltipSlotChange}"
            ></slot>
          </div>
        `;
                return b`
      <div class="float-button__control" part="control">
        ${inner}
      </div>
    `;
            }
        }
    }
}();

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
var _dec, _initClass, _ViElement, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, /** Geometry shape passed to child buttons. */ _init_shape, /** Interaction trigger mode. */ _init_trigger, /** Expanded state. */ _init_open, /** Icon displayed on the trigger button when expanded. */ _init_closeIcon, /** Whether clicking a menu action item closes the speed dial menu. */ _init_closeOnSelect, /** Accessible label for the group. */ _init_ariaLabel, _init__hasSlottedIcon, _init__hasSlottedCloseIcon, _initProto;
registerIcons([
    plusIcon,
    xIcon
]);
let _ViFloatButtonGroup;
_dec = t('vi-float-button-group'), _dec1 = n({
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
    reflect: true,
    attribute: 'close-icon'
}), _dec5 = n({
    attribute: 'close-on-select',
    converter: {
        fromAttribute: (v)=>v !== null && v !== 'false'
    }
}), _dec6 = n({
    attribute: 'aria-label'
}), _dec7 = r(), _dec8 = r();
new class extends _identity {
    constructor(){
        super(_ViFloatButtonGroup), _initClass();
    }
    static{
        class ViFloatButtonGroup extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_shape, _init_trigger, _init_open, _init_closeIcon, _init_closeOnSelect, _init_ariaLabel, _init__hasSlottedIcon, _init__hasSlottedCloseIcon, _initProto], c: [_ViFloatButtonGroup, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "shape"
                    ],
                    [
                        _dec2,
                        1,
                        "trigger"
                    ],
                    [
                        _dec3,
                        1,
                        "open"
                    ],
                    [
                        _dec4,
                        1,
                        "closeIcon"
                    ],
                    [
                        _dec5,
                        1,
                        "closeOnSelect"
                    ],
                    [
                        _dec6,
                        1,
                        "ariaLabel"
                    ],
                    [
                        _dec7,
                        1,
                        "_hasSlottedIcon"
                    ],
                    [
                        _dec8,
                        1,
                        "_hasSlottedCloseIcon"
                    ]
                ], [
                    _dec
                ], _ViElement));
            }
            static styles = i`
    ${r$1(floatButtonStyles)}
  `;
            #___private_shape_1 = (_initProto(this), _init_shape(this, 'circle'));
            get shape() {
                return this.#___private_shape_1;
            }
            set shape(_v) {
                this.#___private_shape_1 = _v;
            }
            #___private_trigger_2 = _init_trigger(this, 'hover');
            get trigger() {
                return this.#___private_trigger_2;
            }
            set trigger(_v) {
                this.#___private_trigger_2 = _v;
            }
            #___private_open_3 = _init_open(this, false);
            get open() {
                return this.#___private_open_3;
            }
            set open(_v) {
                this.#___private_open_3 = _v;
            }
            #___private_closeIcon_4 = _init_closeIcon(this, 'x');
            get closeIcon() {
                return this.#___private_closeIcon_4;
            }
            set closeIcon(_v) {
                this.#___private_closeIcon_4 = _v;
            }
            #___private_closeOnSelect_5 = _init_closeOnSelect(this, true);
            get closeOnSelect() {
                return this.#___private_closeOnSelect_5;
            }
            set closeOnSelect(_v) {
                this.#___private_closeOnSelect_5 = _v;
            }
            #___private_ariaLabel_6 = _init_ariaLabel(this, null);
            get ariaLabel() {
                return this.#___private_ariaLabel_6;
            }
            set ariaLabel(_v) {
                this.#___private_ariaLabel_6 = _v;
            }
            #___private__hasSlottedIcon_7 = _init__hasSlottedIcon(this, false);
            get _hasSlottedIcon() {
                return this.#___private__hasSlottedIcon_7;
            }
            set _hasSlottedIcon(_v) {
                this.#___private__hasSlottedIcon_7 = _v;
            }
            #___private__hasSlottedCloseIcon_8 = _init__hasSlottedCloseIcon(this, false);
            get _hasSlottedCloseIcon() {
                return this.#___private__hasSlottedCloseIcon_8;
            }
            set _hasSlottedCloseIcon(_v) {
                this.#___private__hasSlottedCloseIcon_8 = _v;
            }
            /**
   * When true, the next `updated()` cycle will focus the first menu item.
   * This avoids calling focus() before Lit has reflected the [open] attribute
   * (which controls CSS visibility).
   */ _pendingFocusOnOpen = false;
            /**
   * Tracks previously assigned menu items so that when a child is removed from the
   * group (or on group teardown), its standalone state can be restored.
   */ _previousMenuItems = [];
            _restoreChild(item) {
                item.inGroup = false;
                item.tabbable = true;
                item._savedTabIndex = item.disabled ? -1 : 0;
                item.tabIndex = item.disabled ? -1 : 0;
            }
            _handleDocumentClick = (event)=>{
                if (!this.open) return;
                const path = event.composedPath();
                if (!path.includes(this)) {
                    this.open = false;
                }
            };
            _handleMenuItemClick = ()=>{
                if (this.open && this.closeOnSelect) {
                    this.open = false;
                }
            };
            connectedCallback() {
                super.connectedCallback();
                this.addEventListener('keydown', this._handleKeyDown, true);
                document.addEventListener('click', this._handleDocumentClick);
                if (this.hasUpdated) {
                    this._syncChildrenProps();
                }
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this.removeEventListener('keydown', this._handleKeyDown, true);
                document.removeEventListener('click', this._handleDocumentClick);
                this._previousMenuItems.forEach((item)=>{
                    this._restoreChild(item);
                });
                this._previousMenuItems = [];
            }
            updated(changedProperties) {
                super.updated(changedProperties);
                if (changedProperties.has('open')) {
                    // On close: return focus to trigger if it was inside a menu item
                    if (!this.open && this._getAllMenuItems().some((item)=>item.matches(':focus-within'))) {
                        const triggerBtn = this.shadowRoot?.querySelector('.float-button-group__trigger');
                        triggerBtn?.focus();
                    }
                    this._updateTabbableItems();
                    // On open: focus the first item above trigger once the child has rendered.
                    // visibility flips instantly (no CSS transition), so we only need
                    // the child's inner <button> to have tabindex="0" before calling focus().
                    if (this.open && this._pendingFocusOnOpen) {
                        this._pendingFocusOnOpen = false;
                        const items = this._getMenuItems();
                        const activeItem = items[items.length - 1];
                        if (activeItem) {
                            this._setActiveItem(activeItem);
                            void (async ()=>{
                                await activeItem.updateComplete;
                                if (!this.open) return;
                                activeItem.focus({
                                    focusVisible: true
                                });
                            })();
                        }
                    }
                    const oldOpen = changedProperties.get('open');
                    if (oldOpen !== undefined && oldOpen !== this.open) {
                        this.dispatchEvent(new CustomEvent('vi-float-button-open-change', {
                            bubbles: true,
                            composed: true,
                            detail: {
                                open: this.open
                            }
                        }));
                    }
                }
                if (changedProperties.has('shape')) {
                    this._syncChildrenProps();
                }
            }
            _syncChildrenProps() {
                const currentItems = this._getAllMenuItems();
                // Restore standalone state on children removed from the group
                const removedItems = this._previousMenuItems.filter((prev)=>!currentItems.includes(prev));
                removedItems.forEach((item)=>{
                    this._restoreChild(item);
                });
                currentItems.forEach((item)=>{
                    item.inGroup = true;
                    if (!item.hasAttribute('shape')) {
                        item.shape = this.shape;
                    }
                });
                this._previousMenuItems = [
                    ...currentItems
                ];
                this._updateTabbableItems();
            }
            _getAllMenuItems() {
                const slot = this.shadowRoot?.querySelector('.float-button-group__menu slot:not([name])');
                if (!slot) return [];
                return slot.assignedElements().filter((el)=>el instanceof _ViFloatButton);
            }
            _getMenuItems() {
                return this._getAllMenuItems().filter((el)=>!el.disabled);
            }
            _updateTabbableItems() {
                const allItems = this._getAllMenuItems();
                if (!this.open) {
                    allItems.forEach((item)=>{
                        item.tabbable = false;
                        item.tabIndex = -1;
                    });
                    return;
                }
                const enabledItems = this._getMenuItems();
                if (!enabledItems.length) {
                    allItems.forEach((item)=>{
                        item.tabbable = false;
                        item.tabIndex = -1;
                    });
                    return;
                }
                const focusedItem = enabledItems.find((item)=>item.matches(':focus-within'));
                const activeItem = focusedItem ?? enabledItems[enabledItems.length - 1];
                this._setActiveItem(activeItem);
            }
            _setActiveItem(activeItem) {
                const allItems = this._getAllMenuItems();
                allItems.forEach((item)=>{
                    const isTabbable = this.open && item === activeItem && !item.disabled;
                    item.tabbable = isTabbable;
                    item.tabIndex = isTabbable ? 0 : -1;
                });
            }
            _handleFocusIn = (event)=>{
                if (!this.open) return;
                const path = event.composedPath();
                const item = path.find((el)=>el instanceof _ViFloatButton);
                const triggerBtn = this.shadowRoot?.querySelector('.float-button-group__trigger');
                if (item && item !== triggerBtn && !item.disabled) {
                    this._setActiveItem(item);
                }
            };
            _handleSlotChange() {
                this._syncChildrenProps();
            }
            _handleTriggerClick(event) {
                const originalEvent = event.detail?.originalEvent;
                const isKeyboard = !originalEvent || originalEvent instanceof KeyboardEvent || originalEvent.detail === 0;
                if (this.trigger === 'click' || isKeyboard) {
                    event.stopPropagation();
                    this.open = !this.open;
                    if (this.open) {
                        this._pendingFocusOnOpen = true;
                    }
                }
            }
            _handleMouseEnter() {
                if (this.trigger === 'hover' && !this.open) {
                    this._pendingFocusOnOpen = true;
                    this.open = true;
                }
            }
            _handleMouseLeave() {
                if (this.trigger === 'hover') {
                    this.open = false;
                }
            }
            _handleKeyDown = (event)=>{
                if (event.key === 'Escape' && this.open) {
                    event.preventDefault();
                    this.open = false;
                    const triggerBtn = this.shadowRoot?.querySelector('.float-button-group__trigger');
                    triggerBtn?.focus();
                    return;
                }
                if (!this.open) {
                    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                        const triggerBtn = this.shadowRoot?.querySelector('.float-button-group__trigger');
                        const isTrigger = event.target === this || event.target === triggerBtn || triggerBtn?.matches(':focus-within');
                        if (isTrigger) {
                            event.preventDefault();
                            this._pendingFocusOnOpen = true;
                            this.open = true;
                            return;
                        }
                    }
                    return;
                }
                if (this.open) {
                    const items = this._getMenuItems();
                    if (!items.length) return;
                    if (event.key === 'Home') {
                        event.preventDefault();
                        const nextItem = items[0];
                        this._setActiveItem(nextItem);
                        nextItem?.focus();
                        return;
                    }
                    if (event.key === 'End') {
                        event.preventDefault();
                        const nextItem = items[items.length - 1];
                        this._setActiveItem(nextItem);
                        nextItem?.focus();
                        return;
                    }
                    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                        event.preventDefault();
                        const activeIndex = items.findIndex((item)=>item.matches(':focus-within'));
                        let nextIndex = 0;
                        if (event.key === 'ArrowUp') {
                            nextIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
                        } else {
                            nextIndex = activeIndex >= items.length - 1 || activeIndex === -1 ? 0 : activeIndex + 1;
                        }
                        const nextItem = items[nextIndex];
                        this._setActiveItem(nextItem);
                        nextItem?.focus();
                    }
                }
            };
            _handleIconSlotChange(event) {
                const slot = event.target;
                this._hasSlottedIcon = slot.assignedElements().length > 0;
            }
            _handleCloseIconSlotChange(event) {
                const slot = event.target;
                this._hasSlottedCloseIcon = slot.assignedElements().length > 0;
            }
            _renderTriggerIcon() {
                if (this.open) {
                    const closeIconName = this.closeIcon?.trim() || 'x';
                    return b`
        <slot
          name="close-icon"
          slot="icon"
          @slotchange="${this._handleCloseIconSlotChange}"
        >
          ${!this._hasSlottedCloseIcon ? b`<vi-icon
                name="${closeIconName}"
                class="default-icon"
              ></vi-icon>` : A}
        </slot>
      `;
                }
                return b`
      <slot name="icon" slot="icon" @slotchange="${this._handleIconSlotChange}">
        ${!this._hasSlottedIcon ? b`<vi-icon name="plus" class="default-icon"></vi-icon>` : A}
      </slot>
    `;
            }
            render() {
                return b`
      <div
        class="float-button-group"
        part="group"
        role="group"
        aria-label="${this.ariaLabel ?? 'Speed dial actions'}"
        @mouseenter="${this._handleMouseEnter}"
        @mouseleave="${this._handleMouseLeave}"
      >
        <div
          class="float-button-group__menu"
          part="menu"
          role="menu"
          aria-hidden="${!this.open}"
          @focusin="${this._handleFocusIn}"
          @vi-float-button-click="${this._handleMenuItemClick}"
        >
          <slot @slotchange="${this._handleSlotChange}"></slot>
        </div>

        <vi-float-button
          class="float-button-group__trigger"
          part="trigger"
          .shape="${this.shape}"
          in-group
          aria-haspopup="menu"
          aria-expanded="${this.open}"
          .ariaHasPopup="${'menu'}"
          .ariaExpanded="${this.open ? 'true' : 'false'}"
          aria-label="${this.ariaLabel ?? 'Speed dial actions'}"
          @vi-float-button-click="${this._handleTriggerClick}"
        >
          ${this._renderTriggerIcon()}
          <slot name="description" slot="description"></slot>
        </vi-float-button>
      </div>
    `;
            }
        }
    }
}();

// Register all icons used in the stories
registerIcons([
    plusIcon,
    checkIcon,
    commentIcon,
    fileTextIcon,
    triangleWarningIcon,
    lockIcon,
    userIcon,
    capsulesIcon,
    documentIcon,
    xIcon,
    chevronUpIcon,
    folderOpenIcon,
    saveIcon
]);
const meta = {
    title: 'Components/FloatButton',
    component: 'vi-float-button',
    tags: [
        'autodocs'
    ],
    argTypes: {
        shape: {
            control: 'radio',
            options: [
                'circle',
                'square'
            ],
            description: 'Button geometry shape'
        },
        type: {
            control: 'radio',
            options: [
                'default',
                'primary'
            ],
            description: 'Button visual type'
        },
        size: {
            control: 'radio',
            options: [
                'default',
                'sm'
            ],
            description: 'Button size scale'
        },
        description: {
            control: 'text',
            description: 'Text label under icon'
        },
        tooltip: {
            control: 'text',
            description: 'Tooltip text on hover'
        },
        disabled: {
            control: 'boolean',
            description: 'Disables button'
        },
        badgeDot: {
            name: 'badge-dot',
            control: 'boolean',
            description: 'Show status dot badge'
        },
        badge: {
            control: 'text',
            description: 'Badge count or text'
        },
        badgeStatus: {
            name: 'badge-status',
            control: 'select',
            options: [
                'neutral',
                'primary',
                'success',
                'warning',
                'danger',
                'info'
            ],
            description: 'Badge status color'
        }
    },
    args: {
        shape: 'circle',
        type: 'default',
        size: 'default',
        disabled: false,
        badgeDot: false,
        badgeStatus: 'danger',
        tooltip: 'Floating action'
    }
};
const Default = {
    render: (args)=>b`
    <div style="height: 120px; position: relative;">
      <vi-float-button
        shape=${args.shape}
        type=${args.type}
        size=${args.size}
        ?disabled=${args.disabled}
        tooltip=${args.tooltip ?? ''}
        description=${args.description ?? ''}
        badge=${args.badge ?? ''}
        ?badge-dot=${args.badgeDot}
        badge-status=${args.badgeStatus}
        in-group
      >
        <vi-icon slot="icon" name="plus"></vi-icon>
      </vi-float-button>
    </div>
  `
};
const ShapesAndSizes = {
    render: ()=>b`
    <div style="display: flex; gap: 32px; align-items: flex-end; padding: 24px;">
      <!-- Circle default -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <vi-float-button shape="circle" size="default" tooltip="Circle Default (48px)" in-group>
          <vi-icon slot="icon" name="plus"></vi-icon>
        </vi-float-button>
        <span style="font-size: 12px; color: #666;">Circle (48px)</span>
      </div>

      <!-- Circle small -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <vi-float-button shape="circle" size="sm" tooltip="Circle Small (40px)" in-group>
          <vi-icon slot="icon" name="plus"></vi-icon>
        </vi-float-button>
        <span style="font-size: 12px; color: #666;">Circle Sm (40px)</span>
      </div>

      <!-- Square default -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <vi-float-button shape="square" size="default" tooltip="Square Default" in-group>
          <vi-icon slot="icon" name="plus"></vi-icon>
        </vi-float-button>
        <span style="font-size: 12px; color: #666;">Square (48px)</span>
      </div>

      <!-- Square small -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <vi-float-button shape="square" size="sm" tooltip="Square Small" in-group>
          <vi-icon slot="icon" name="plus"></vi-icon>
        </vi-float-button>
        <span style="font-size: 12px; color: #666;">Square Sm (40px)</span>
      </div>
    </div>
  `
};
const TypesAndStates = {
    render: ()=>b`
    <div style="display: flex; gap: 32px; align-items: center; padding: 24px;">
      <!-- Default -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <vi-float-button type="default" tooltip="Default Type" in-group>
          <vi-icon slot="icon" name="file-text"></vi-icon>
        </vi-float-button>
        <span style="font-size: 12px; color: #666;">Default</span>
      </div>

      <!-- Primary -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <vi-float-button type="primary" tooltip="Primary Type" in-group>
          <vi-icon slot="icon" name="save"></vi-icon>
        </vi-float-button>
        <span style="font-size: 12px; color: #666;">Primary</span>
      </div>

      <!-- Disabled -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <vi-float-button disabled tooltip="Disabled" in-group>
          <vi-icon slot="icon" name="lock"></vi-icon>
        </vi-float-button>
        <span style="font-size: 12px; color: #666;">Disabled</span>
      </div>
    </div>
  `
};
const BadgesAndIndicators = {
    render: ()=>b`
    <div style="display: flex; gap: 32px; align-items: center; padding: 24px;">
      <!-- Numeric Count Badge -->
      <vi-float-button
        type="primary"
        badge="8"
        badge-status="danger"
        tooltip="8 Unresolved Queries"
        in-group
      >
        <vi-icon slot="icon" name="comment"></vi-icon>
      </vi-float-button>

      <!-- Dot Badge (Success) -->
      <vi-float-button
        badge-dot
        badge-status="success"
        tooltip="System Connected"
        in-group
      >
        <vi-icon slot="icon" name="check"></vi-icon>
      </vi-float-button>

      <!-- Dot Badge (Warning) -->
      <vi-float-button
        badge-dot
        badge-status="warning"
        tooltip="Protocol Alert"
        in-group
      >
        <vi-icon slot="icon" name="triangle-warning"></vi-icon>
      </vi-float-button>

      <!-- Text Count Badge (99+) -->
      <vi-float-button
        badge="99+"
        badge-status="primary"
        tooltip="99+ Notifications"
        in-group
      >
        <vi-icon slot="icon" name="user"></vi-icon>
      </vi-float-button>
    </div>
  `
};
const SquareWithDescription = {
    render: ()=>b`
    <div style="display: flex; gap: 32px; align-items: center; padding: 24px;">
      <vi-float-button
        shape="square"
        description="Audit"
        tooltip="View Subject Audit Trail"
        in-group
      >
        <vi-icon slot="icon" name="file-text"></vi-icon>
      </vi-float-button>

      <vi-float-button
        shape="square"
        type="primary"
        description="Meds"
        tooltip="Concomitant Medication"
        in-group
      >
        <vi-icon slot="icon" name="capsules"></vi-icon>
      </vi-float-button>

      <vi-float-button
        shape="square"
        description="Forms"
        badge="3"
        badge-status="danger"
        tooltip="Pending CRF Forms"
        in-group
      >
        <vi-icon slot="icon" name="document"></vi-icon>
      </vi-float-button>
    </div>
  `
};
const BackToTop = {
    render: ()=>b`
    <div style="padding: 24px;">
      <p style="margin-bottom: 16px; color: #555;">
        Scroll the container below to see the back-to-top button appear when scrolled past 100px:
      </p>
      <div
        id="scrollable-container"
        style="height: 250px; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px; padding: 16px; position: relative;"
      >
        <div style="height: 800px; background: linear-gradient(to bottom, #f0f4f8, #d9e2ec, #bcccdc); padding: 16px; border-radius: 4px;">
          <p><strong>Top of Container</strong></p>
          <p style="margin-top: 150px;">Scroll down further...</p>
          <p style="margin-top: 300px;">Keep scrolling to see the floating button appear in the bottom-right corner.</p>
        </div>

        <vi-float-button
          back-top
          visibility-height="100"
          scroll-target="#scrollable-container"
          tooltip="Back to Top"
          style="position: sticky; float: right; bottom: 16px; right: 16px;"
          in-group
        ></vi-float-button>
      </div>
    </div>
  `
};
const SpeedDialGroupClick = {
    render: ()=>b`
    <div style="height: 280px; position: relative; display: flex; align-items: flex-end; padding: 24px;">
      <vi-float-button-group trigger="click" aria-label="Clinical quick actions" style="position: relative; inset: auto;">
        <vi-float-button tooltip="Add Adverse Event">
          <vi-icon slot="icon" name="triangle-warning"></vi-icon>
        </vi-float-button>

        <vi-float-button tooltip="Add Concomitant Medication">
          <vi-icon slot="icon" name="capsules"></vi-icon>
        </vi-float-button>

        <vi-float-button type="primary" tooltip="Save CRF Data">
          <vi-icon slot="icon" name="save"></vi-icon>
        </vi-float-button>
      </vi-float-button-group>
    </div>
  `
};
const SpeedDialGroupHover = {
    render: ()=>b`
    <div style="height: 280px; position: relative; display: flex; align-items: flex-end; padding: 24px;">
      <vi-float-button-group trigger="hover" aria-label="Quick navigation speed dial" style="position: relative; inset: auto;">
        <vi-float-button tooltip="Subject Demographics">
          <vi-icon slot="icon" name="user"></vi-icon>
        </vi-float-button>

        <vi-float-button tooltip="Audit Trail Documents">
          <vi-icon slot="icon" name="folder-open"></vi-icon>
        </vi-float-button>

        <vi-float-button type="primary" tooltip="Lock CRF Sheet">
          <vi-icon slot="icon" name="lock"></vi-icon>
        </vi-float-button>
      </vi-float-button-group>
    </div>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <div style=\"height: 120px; position: relative;\">\n      <vi-float-button\n        shape=${args.shape}\n        type=${args.type}\n        size=${args.size}\n        ?disabled=${args.disabled}\n        tooltip=${args.tooltip ?? ''}\n        description=${args.description ?? ''}\n        badge=${args.badge ?? ''}\n        ?badge-dot=${args.badgeDot}\n        badge-status=${args.badgeStatus}\n        in-group\n      >\n        <vi-icon slot=\"icon\" name=\"plus\"></vi-icon>\n      </vi-float-button>\n    </div>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
ShapesAndSizes.parameters = {
    ...ShapesAndSizes.parameters,
    docs: {
        ...ShapesAndSizes.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 32px; align-items: flex-end; padding: 24px;\">\n      <!-- Circle default -->\n      <div style=\"display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n        <vi-float-button shape=\"circle\" size=\"default\" tooltip=\"Circle Default (48px)\" in-group>\n          <vi-icon slot=\"icon\" name=\"plus\"></vi-icon>\n        </vi-float-button>\n        <span style=\"font-size: 12px; color: #666;\">Circle (48px)</span>\n      </div>\n\n      <!-- Circle small -->\n      <div style=\"display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n        <vi-float-button shape=\"circle\" size=\"sm\" tooltip=\"Circle Small (40px)\" in-group>\n          <vi-icon slot=\"icon\" name=\"plus\"></vi-icon>\n        </vi-float-button>\n        <span style=\"font-size: 12px; color: #666;\">Circle Sm (40px)</span>\n      </div>\n\n      <!-- Square default -->\n      <div style=\"display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n        <vi-float-button shape=\"square\" size=\"default\" tooltip=\"Square Default\" in-group>\n          <vi-icon slot=\"icon\" name=\"plus\"></vi-icon>\n        </vi-float-button>\n        <span style=\"font-size: 12px; color: #666;\">Square (48px)</span>\n      </div>\n\n      <!-- Square small -->\n      <div style=\"display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n        <vi-float-button shape=\"square\" size=\"sm\" tooltip=\"Square Small\" in-group>\n          <vi-icon slot=\"icon\" name=\"plus\"></vi-icon>\n        </vi-float-button>\n        <span style=\"font-size: 12px; color: #666;\">Square Sm (40px)</span>\n      </div>\n    </div>\n  `\n}",
            ...ShapesAndSizes.parameters?.docs?.source
        }
    }
};
TypesAndStates.parameters = {
    ...TypesAndStates.parameters,
    docs: {
        ...TypesAndStates.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 32px; align-items: center; padding: 24px;\">\n      <!-- Default -->\n      <div style=\"display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n        <vi-float-button type=\"default\" tooltip=\"Default Type\" in-group>\n          <vi-icon slot=\"icon\" name=\"file-text\"></vi-icon>\n        </vi-float-button>\n        <span style=\"font-size: 12px; color: #666;\">Default</span>\n      </div>\n\n      <!-- Primary -->\n      <div style=\"display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n        <vi-float-button type=\"primary\" tooltip=\"Primary Type\" in-group>\n          <vi-icon slot=\"icon\" name=\"save\"></vi-icon>\n        </vi-float-button>\n        <span style=\"font-size: 12px; color: #666;\">Primary</span>\n      </div>\n\n      <!-- Disabled -->\n      <div style=\"display: flex; flex-direction: column; align-items: center; gap: 8px;\">\n        <vi-float-button disabled tooltip=\"Disabled\" in-group>\n          <vi-icon slot=\"icon\" name=\"lock\"></vi-icon>\n        </vi-float-button>\n        <span style=\"font-size: 12px; color: #666;\">Disabled</span>\n      </div>\n    </div>\n  `\n}",
            ...TypesAndStates.parameters?.docs?.source
        }
    }
};
BadgesAndIndicators.parameters = {
    ...BadgesAndIndicators.parameters,
    docs: {
        ...BadgesAndIndicators.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 32px; align-items: center; padding: 24px;\">\n      <!-- Numeric Count Badge -->\n      <vi-float-button\n        type=\"primary\"\n        badge=\"8\"\n        badge-status=\"danger\"\n        tooltip=\"8 Unresolved Queries\"\n        in-group\n      >\n        <vi-icon slot=\"icon\" name=\"comment\"></vi-icon>\n      </vi-float-button>\n\n      <!-- Dot Badge (Success) -->\n      <vi-float-button\n        badge-dot\n        badge-status=\"success\"\n        tooltip=\"System Connected\"\n        in-group\n      >\n        <vi-icon slot=\"icon\" name=\"check\"></vi-icon>\n      </vi-float-button>\n\n      <!-- Dot Badge (Warning) -->\n      <vi-float-button\n        badge-dot\n        badge-status=\"warning\"\n        tooltip=\"Protocol Alert\"\n        in-group\n      >\n        <vi-icon slot=\"icon\" name=\"triangle-warning\"></vi-icon>\n      </vi-float-button>\n\n      <!-- Text Count Badge (99+) -->\n      <vi-float-button\n        badge=\"99+\"\n        badge-status=\"primary\"\n        tooltip=\"99+ Notifications\"\n        in-group\n      >\n        <vi-icon slot=\"icon\" name=\"user\"></vi-icon>\n      </vi-float-button>\n    </div>\n  `\n}",
            ...BadgesAndIndicators.parameters?.docs?.source
        }
    }
};
SquareWithDescription.parameters = {
    ...SquareWithDescription.parameters,
    docs: {
        ...SquareWithDescription.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; gap: 32px; align-items: center; padding: 24px;\">\n      <vi-float-button\n        shape=\"square\"\n        description=\"Audit\"\n        tooltip=\"View Subject Audit Trail\"\n        in-group\n      >\n        <vi-icon slot=\"icon\" name=\"file-text\"></vi-icon>\n      </vi-float-button>\n\n      <vi-float-button\n        shape=\"square\"\n        type=\"primary\"\n        description=\"Meds\"\n        tooltip=\"Concomitant Medication\"\n        in-group\n      >\n        <vi-icon slot=\"icon\" name=\"capsules\"></vi-icon>\n      </vi-float-button>\n\n      <vi-float-button\n        shape=\"square\"\n        description=\"Forms\"\n        badge=\"3\"\n        badge-status=\"danger\"\n        tooltip=\"Pending CRF Forms\"\n        in-group\n      >\n        <vi-icon slot=\"icon\" name=\"document\"></vi-icon>\n      </vi-float-button>\n    </div>\n  `\n}",
            ...SquareWithDescription.parameters?.docs?.source
        }
    }
};
BackToTop.parameters = {
    ...BackToTop.parameters,
    docs: {
        ...BackToTop.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"padding: 24px;\">\n      <p style=\"margin-bottom: 16px; color: #555;\">\n        Scroll the container below to see the back-to-top button appear when scrolled past 100px:\n      </p>\n      <div\n        id=\"scrollable-container\"\n        style=\"height: 250px; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px; padding: 16px; position: relative;\"\n      >\n        <div style=\"height: 800px; background: linear-gradient(to bottom, #f0f4f8, #d9e2ec, #bcccdc); padding: 16px; border-radius: 4px;\">\n          <p><strong>Top of Container</strong></p>\n          <p style=\"margin-top: 150px;\">Scroll down further...</p>\n          <p style=\"margin-top: 300px;\">Keep scrolling to see the floating button appear in the bottom-right corner.</p>\n        </div>\n\n        <vi-float-button\n          back-top\n          visibility-height=\"100\"\n          scroll-target=\"#scrollable-container\"\n          tooltip=\"Back to Top\"\n          style=\"position: sticky; float: right; bottom: 16px; right: 16px;\"\n          in-group\n        ></vi-float-button>\n      </div>\n    </div>\n  `\n}",
            ...BackToTop.parameters?.docs?.source
        }
    }
};
SpeedDialGroupClick.parameters = {
    ...SpeedDialGroupClick.parameters,
    docs: {
        ...SpeedDialGroupClick.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"height: 280px; position: relative; display: flex; align-items: flex-end; padding: 24px;\">\n      <vi-float-button-group trigger=\"click\" aria-label=\"Clinical quick actions\" style=\"position: relative; inset: auto;\">\n        <vi-float-button tooltip=\"Add Adverse Event\">\n          <vi-icon slot=\"icon\" name=\"triangle-warning\"></vi-icon>\n        </vi-float-button>\n\n        <vi-float-button tooltip=\"Add Concomitant Medication\">\n          <vi-icon slot=\"icon\" name=\"capsules\"></vi-icon>\n        </vi-float-button>\n\n        <vi-float-button type=\"primary\" tooltip=\"Save CRF Data\">\n          <vi-icon slot=\"icon\" name=\"save\"></vi-icon>\n        </vi-float-button>\n      </vi-float-button-group>\n    </div>\n  `\n}",
            ...SpeedDialGroupClick.parameters?.docs?.source
        }
    }
};
SpeedDialGroupHover.parameters = {
    ...SpeedDialGroupHover.parameters,
    docs: {
        ...SpeedDialGroupHover.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"height: 280px; position: relative; display: flex; align-items: flex-end; padding: 24px;\">\n      <vi-float-button-group trigger=\"hover\" aria-label=\"Quick navigation speed dial\" style=\"position: relative; inset: auto;\">\n        <vi-float-button tooltip=\"Subject Demographics\">\n          <vi-icon slot=\"icon\" name=\"user\"></vi-icon>\n        </vi-float-button>\n\n        <vi-float-button tooltip=\"Audit Trail Documents\">\n          <vi-icon slot=\"icon\" name=\"folder-open\"></vi-icon>\n        </vi-float-button>\n\n        <vi-float-button type=\"primary\" tooltip=\"Lock CRF Sheet\">\n          <vi-icon slot=\"icon\" name=\"lock\"></vi-icon>\n        </vi-float-button>\n      </vi-float-button-group>\n    </div>\n  `\n}",
            ...SpeedDialGroupHover.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","ShapesAndSizes","TypesAndStates","BadgesAndIndicators","SquareWithDescription","BackToTop","SpeedDialGroupClick","SpeedDialGroupHover"];

export { BackToTop, BadgesAndIndicators, Default, ShapesAndSizes, SpeedDialGroupClick, SpeedDialGroupHover, SquareWithDescription, TypesAndStates, __namedExportsOrder, meta as default };
