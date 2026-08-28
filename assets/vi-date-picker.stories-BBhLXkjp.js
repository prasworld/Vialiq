const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./ar-D7YUFJoh.js","./_commonjsHelpers-B85MJLTf.js","./de-QezAXHxY.js","./es-D78efT7Z.js","./fr-ukX1ivur.js","./it-DwtncU-B.js","./ja-BJZuGdti.js","./ko-XrdKB8-8.js","./nl-CTA8Rmjr.js","./pt-CyMXXVSQ.js","./zh-BaBtHGie.js","./weekSelect-C2BqQsBG.js"])))=>i.map(i=>d[i]);
import { c as i, A, b, r, i as i$1 } from './iframe-D1QzB0mn.js';
import { n, V as ViElement, t } from './vi-element-C6aRBN2A.js';
import { r as r$1 } from './state-CiJj2b7P.js';
import { e } from './overlay-manager-B43cq-OI.js';
import { o } from './query-assigned-elements-BJaGSqM0.js';
import { _ as __vitePreload } from './preload-helper-D5QYaGzd.js';
import { V as ValidityMixin } from './validity-mixin-BUuZWHUr.js';
import { F as FloatingController } from './keyboard-controller-DbV1C_E6.js';
import './vi-select-DNV1MZGO.js';
import { g as getDefaultExportFromCjs } from './_commonjsHelpers-B85MJLTf.js';
import './base-Cl6v8-BZ.js';
import './floating-ui.dom-DwUTpXgb.js';
import './focusable-mixin-CmxOyPX5.js';
import './if-non-empty-2j-LQqEv.js';
import './if-defined-BuiTVVkk.js';
import './vi-icon-C4QGt-z3.js';
import './directive-BKuZRRPO.js';
import './registry-CeXOZkT9.js';
import './chevron-down-BU8Kh4z3.js';
import './x-3JmBhc9n.js';
import './check-D9SDO18H.js';

async function loadL10n(importer) {
    const mod = await importer();
    const isLocale = (v)=>!!v && typeof v === 'object' && 'weekdays' in v && 'months' in v;
    // 1. Check if the module exports a named locale directly (e.g. exports.French)
    for (const key of Object.keys(mod)){
        if (key !== 'default' && isLocale(mod[key])) {
            return mod[key];
        }
    }
    // 2. Check if mod.default is the locale directly
    if (isLocale(mod.default)) {
        return mod.default;
    }
    // 3. Check if mod.default is an l10ns map (e.g. { fr: CustomLocale })
    if (mod.default && typeof mod.default === 'object') {
        const l10ns = mod.default;
        for (const key of Object.keys(l10ns)){
            if (isLocale(l10ns[key])) {
                return l10ns[key];
            }
        }
    }
    // 4. Check if mod itself is the l10ns map
    for (const key of Object.keys(mod)){
        if (isLocale(mod[key])) {
            return mod[key];
        }
    }
    return null;
}
// Map of BCP 47 locale tags to flatpickr l10n imports.
const LOCALE_MAP = {
    ar: ()=>loadL10n(()=>__vitePreload(() => import('./ar-D7YUFJoh.js').then(n => n.a),true              ?__vite__mapDeps([0,1]):void 0,import.meta.url)),
    de: ()=>loadL10n(()=>__vitePreload(() => import('./de-QezAXHxY.js').then(n => n.d),true              ?__vite__mapDeps([2,1]):void 0,import.meta.url)),
    'de-DE': ()=>loadL10n(()=>__vitePreload(() => import('./de-QezAXHxY.js').then(n => n.d),true              ?__vite__mapDeps([2,1]):void 0,import.meta.url)),
    es: ()=>loadL10n(()=>__vitePreload(() => import('./es-D78efT7Z.js').then(n => n.e),true              ?__vite__mapDeps([3,1]):void 0,import.meta.url)),
    'es-ES': ()=>loadL10n(()=>__vitePreload(() => import('./es-D78efT7Z.js').then(n => n.e),true              ?__vite__mapDeps([3,1]):void 0,import.meta.url)),
    fr: ()=>loadL10n(()=>__vitePreload(() => import('./fr-ukX1ivur.js').then(n => n.f),true              ?__vite__mapDeps([4,1]):void 0,import.meta.url)),
    'fr-FR': ()=>loadL10n(()=>__vitePreload(() => import('./fr-ukX1ivur.js').then(n => n.f),true              ?__vite__mapDeps([4,1]):void 0,import.meta.url)),
    it: ()=>loadL10n(()=>__vitePreload(() => import('./it-DwtncU-B.js').then(n => n.i),true              ?__vite__mapDeps([5,1]):void 0,import.meta.url)),
    ja: ()=>loadL10n(()=>__vitePreload(() => import('./ja-BJZuGdti.js').then(n => n.j),true              ?__vite__mapDeps([6,1]):void 0,import.meta.url)),
    ko: ()=>loadL10n(()=>__vitePreload(() => import('./ko-XrdKB8-8.js').then(n => n.k),true              ?__vite__mapDeps([7,1]):void 0,import.meta.url)),
    nl: ()=>loadL10n(()=>__vitePreload(() => import('./nl-CTA8Rmjr.js').then(n => n.n),true              ?__vite__mapDeps([8,1]):void 0,import.meta.url)),
    'pt-BR': ()=>loadL10n(()=>__vitePreload(() => import('./pt-CyMXXVSQ.js').then(n => n.p),true              ?__vite__mapDeps([9,1]):void 0,import.meta.url)),
    pt: ()=>loadL10n(()=>__vitePreload(() => import('./pt-CyMXXVSQ.js').then(n => n.p),true              ?__vite__mapDeps([9,1]):void 0,import.meta.url)),
    'zh-CN': ()=>loadL10n(()=>__vitePreload(() => import('./zh-BaBtHGie.js').then(n => n.z),true              ?__vite__mapDeps([10,1]):void 0,import.meta.url)),
    zh: ()=>loadL10n(()=>__vitePreload(() => import('./zh-BaBtHGie.js').then(n => n.z),true              ?__vite__mapDeps([10,1]):void 0,import.meta.url))
};
const localeCache = new Map();
/**
 * Lazily loads a flatpickr locale definition for a given BCP 47 tag.
 * Returns null for English (flatpickr's built-in default) or unsupported locales.
 */ async function loadLocale(bcp47) {
    // English is built-in
    if (bcp47.startsWith('en')) {
        return null;
    }
    // Check cache
    if (localeCache.has(bcp47)) {
        return localeCache.get(bcp47) ?? null;
    }
    const loadFn = LOCALE_MAP[bcp47] ?? LOCALE_MAP[bcp47.split('-')[0]];
    if (!loadFn) {
        localeCache.set(bcp47, null);
        return null;
    }
    try {
        const locale = await loadFn();
        localeCache.set(bcp47, locale);
        return locale;
    } catch (e) {
        console.warn(`[vi-date-picker] Failed to load locale: ${bcp47}`, e);
        localeCache.set(bcp47, null);
        return null;
    }
}

const REGISTRY = {
    month: async (options)=>{
        const mod = await __vitePreload(() => Promise.resolve().then(() => viMonthYearPlugin),true              ?void 0:void 0,import.meta.url);
        const factory = mod.ViMonthYearPlugin({
            hideDays: true,
            ariaLabels: options?.ariaLabels
        });
        return {
            id: 'vi-month-select',
            label: 'Month Select',
            factory
        };
    },
    'month-year': async (options)=>{
        const mod = await __vitePreload(() => Promise.resolve().then(() => viMonthYearPlugin),true              ?void 0:void 0,import.meta.url);
        const factory = mod.ViMonthYearPlugin({
            hideDays: true,
            ariaLabels: options?.ariaLabels
        });
        return {
            id: 'vi-month-select',
            label: 'Month Select',
            factory
        };
    },
    week: async ()=>{
        // weekSelectPlugin is a plain factory function returning Plugin<PlusWeeks>.
        // We widen to Plugin (= Plugin<{}>) here — the extra PlusWeeks fields on the
        // instance are irrelevant to our wrapper; flatpickr accepts Plugin<{}> in its
        // plugins array.
        const mod = await __vitePreload(() => import('./weekSelect-C2BqQsBG.js').then(n => n.w),true              ?__vite__mapDeps([11,1]):void 0,import.meta.url);
        const factory = mod.default();
        return {
            id: 'vi-week-select',
            label: 'Week Select',
            factory
        };
    }
};
/**
 * Lazily loads the required flatpickr plugin for a given picker mode.
 * Returns null if the mode does not require a plugin (e.g. 'date', 'range').
 */ async function loadModePlugin(mode, options) {
    const loader = REGISTRY[mode];
    if (loader) {
        return await loader(options);
    }
    return null;
}

function isViPlugin(p) {
    return typeof p === 'object' && p !== null && 'id' in p && 'factory' in p;
}
/**
 * Merges the built-in mode plugin with any consumer-provided plugins.
 * Ensures the mode plugin is always first, and deduplicates by ViDatePickerPlugin.id.
 */ function mergePlugins(modePlugin, consumerPlugins = []) {
    const finalPlugins = [];
    const seenIds = new Set();
    // Helper to add a plugin if not duplicated by ID
    const addPlugin = (pInput)=>{
        if (isViPlugin(pInput)) {
            if (!seenIds.has(pInput.id)) {
                seenIds.add(pInput.id);
                finalPlugins.push(pInput.factory);
            }
        } else {
            // Raw flatpickr plugin — no ID, just push
            finalPlugins.push(pInput);
        }
    };
    if (modePlugin) {
        addPlugin(modePlugin);
    }
    consumerPlugins.forEach(addPlugin);
    return finalPlugins;
}

/** Resolves the effective BCP 47 locale tag. */ function resolveLocale(localeAttr) {
    if (localeAttr) return localeAttr;
    if (typeof navigator !== 'undefined' && navigator.language) return navigator.language;
    return 'en';
}
/** Reads the browser's IANA time zone from Intl. */ function resolveTimeZone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (_e) {
        return 'UTC';
    }
}
/** 
 * Returns the localized word for "Today" (e.g. "today", "hoy", "aujourd'hui")
 * capitalized properly using native Intl formatting.
 */ function getTodayLabel(locale) {
    try {
        const rtf = new Intl.RelativeTimeFormat(locale, {
            numeric: 'auto'
        });
        const today = rtf.format(0, 'day');
        return today.charAt(0).toUpperCase() + today.slice(1);
    } catch (_e) {
        return 'Today';
    }
}
const FMT_OPTIONS_BY_MODE = {
    date: {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    },
    month: {
        month: 'long',
        year: 'numeric'
    },
    'month-year': {
        month: 'long',
        year: 'numeric'
    },
    range: {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    },
    week: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    } // Fallback, usually overridden by custom week display
};
function formatDisplay(date, locale, mode, formatStr) {
    if (formatStr && new RegExp('^([yYmMdD\\-/.\\s]+)$').test(formatStr)) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const res = formatStr.replace(/y{4}|Y{4}|y{2}|Y{2}|y|Y|m{4}|M{4}|m{3}|M{3}|m{2}|M{2}|m|M|d{2}|D{2}|d|D/g, (match)=>{
            switch(match){
                case 'yyyy':
                case 'YYYY':
                    return year.toString();
                case 'yy':
                case 'YY':
                    return year.toString().slice(-2);
                case 'y':
                case 'Y':
                    return year.toString();
                case 'mmmm':
                case 'MMMM':
                    return new Intl.DateTimeFormat(locale, {
                        month: 'long'
                    }).format(date);
                case 'mmm':
                case 'MMM':
                    return new Intl.DateTimeFormat(locale, {
                        month: 'short'
                    }).format(date);
                case 'mm':
                case 'MM':
                    return month.toString().padStart(2, '0');
                case 'm':
                case 'M':
                    return month.toString();
                case 'dd':
                case 'DD':
                    return day.toString().padStart(2, '0');
                case 'd':
                case 'D':
                    return day.toString();
                default:
                    return match;
            }
        });
        return res;
    }
    const opts = FMT_OPTIONS_BY_MODE[mode] || FMT_OPTIONS_BY_MODE.date;
    return new Intl.DateTimeFormat(locale, opts).format(date);
}

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
/**
 * FlatpickrMixin — abstract base mixin that manages a flatpickr lifecycle.
 *
 * Usage:
 *   class MyPicker extends FlatpickrMixin(ViElement) { ... }
 *
 * The subclass must:
 *  1. Call `_initFlatpickr(config, mode, resolvedLocale)` in `firstUpdated()`.
 *  2. Override `_getHiddenInput()` to return the `<input type="hidden">` element
 *     flatpickr should attach to.
 */ function FlatpickrMixin(Base) {
    var _dec, /**
     * Consumer-provided plugins (in addition to the mode plugin).
     * Not reflected as an attribute — set via JS property only.
     */ _init_plugins, _initProto;
    _dec = n({
        attribute: false
    });
    class FlatpickrMixinClass extends Base {
        static{
            ({ e: [_init_plugins, _initProto] } = _apply_decs_2203_r$2(this, [
                [
                    _dec,
                    1,
                    "plugins"
                ]
            ], []));
        }
        /** Live flatpickr instance — null before init or after destroy. */ _fp = (_initProto(this), null);
        #___private_plugins_1 = _init_plugins(this, []);
        get plugins() {
            return this.#___private_plugins_1;
        }
        set plugins(_v) {
            this.#___private_plugins_1 = _v;
        }
        /**
     * Returns the hidden input flatpickr should mount on.
     * Subclasses override this with `@query('#fp-input')`.
     */ _getHiddenInput() {
            return null;
        }
        /** Token to track and cancel overlapping initializations. */ _initGeneration = 0;
        /**
     * Optional config to pass to the mode plugin loader.
     */ _getModePluginConfig() {
            return {};
        }
        /**
     * Initialises flatpickr with the given config and optional mode.
     * Loads the flatpickr module, locale, and mode plugin in parallel.
     */ async _initFlatpickr(config, mode = 'date', resolvedLocale = resolveLocale(null)) {
            const currentGen = ++this._initGeneration;
            const input = this._getHiddenInput();
            if (!input) return;
            // Load flatpickr module, locale, and mode plugin in parallel
            const [{ default: flatpickr }, locale, modePlugin] = await Promise.all([
                __vitePreload(() => import('./index-ClJz_aYQ.js'),true              ?[]:void 0,import.meta.url),
                loadLocale(resolvedLocale),
                loadModePlugin(mode, this._getModePluginConfig())
            ]);
            // Abort if another init was called, or if disconnected during loading
            if (currentGen !== this._initGeneration || !this.isConnected) {
                return;
            }
            // Destroy any previous instance right before we mount the new one
            this._destroyFlatpickr();
            // Resolve raw Plugin[] from ViDatePickerPlugin wrappers + consumer plugins + internal config plugins
            const mergedPlugins = mergePlugins(modePlugin, this.plugins);
            const allPlugins = [
                ...config.plugins || [],
                ...mergedPlugins
            ];
            const fpConfig = {
                appendTo: document.body,
                disableMobile: true,
                static: false,
                ...config,
                plugins: allPlugins,
                ...locale ? {
                    locale
                } : {}
            };
            this._fp = flatpickr(input, fpConfig);
        }
        /** Destroys the current flatpickr instance and clears the reference. */ _destroyFlatpickr() {
            if (this._fp) {
                this._fp.destroy();
                this._fp = null;
            }
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this._destroyFlatpickr();
        }
    }
    return FlatpickrMixinClass;
}

const datePickerStyles = "@charset \"UTF-8\";@layer reset,components,utilities;.flatpickr-calendar{background:transparent;opacity:0;display:none;text-align:center;visibility:hidden;padding:0;-webkit-animation:none;animation:none;direction:ltr;border:0;font-size:14px;line-height:24px;border-radius:5px;position:absolute;width:307.875px;-webkit-box-sizing:border-box;box-sizing:border-box;-ms-touch-action:manipulation;touch-action:manipulation;background:var(--vi-color-background, #ffffff);-webkit-box-shadow:var(--vi-date-picker-calendar-shadow, var(--vi-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, .1)));box-shadow:var(--vi-date-picker-calendar-shadow, var(--vi-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, .1)))}.flatpickr-calendar.open,.flatpickr-calendar.inline{opacity:1;max-height:640px;visibility:visible}.flatpickr-calendar.open{display:inline-block;z-index:99999}.flatpickr-calendar.animate.open{-webkit-animation:fpFadeInDown .3s cubic-bezier(.23,1,.32,1);animation:fpFadeInDown .3s cubic-bezier(.23,1,.32,1)}.flatpickr-calendar.inline{display:block;position:relative;top:2px}.flatpickr-calendar.static{position:absolute;top:calc(100% + 2px)}.flatpickr-calendar.static.open{z-index:999;display:block}.flatpickr-calendar.multiMonth .flatpickr-days .dayContainer:nth-child(n+1) .flatpickr-day.inRange:nth-child(7n+7){-webkit-box-shadow:none!important;box-shadow:none!important}.flatpickr-calendar.multiMonth .flatpickr-days .dayContainer:nth-child(n+2) .flatpickr-day.inRange:nth-child(7n+1){-webkit-box-shadow:none;box-shadow:none}.flatpickr-calendar .hasWeeks .dayContainer,.flatpickr-calendar .hasTime .dayContainer{border-bottom:0;border-bottom-right-radius:0;border-bottom-left-radius:0}.flatpickr-calendar .hasWeeks .dayContainer{border-left:0}.flatpickr-calendar.hasTime .flatpickr-time{height:40px;border-top:1px solid var(--vi-color-border, #e5e7eb)}.flatpickr-calendar.noCalendar.hasTime .flatpickr-time{height:auto}.flatpickr-calendar:before,.flatpickr-calendar:after{position:absolute;display:block;pointer-events:none;border:solid transparent;content:\"\";height:0;width:0;left:22px}.flatpickr-calendar.rightMost:before,.flatpickr-calendar.arrowRight:before,.flatpickr-calendar.rightMost:after,.flatpickr-calendar.arrowRight:after{left:auto;right:22px}.flatpickr-calendar.arrowCenter:before,.flatpickr-calendar.arrowCenter:after{left:50%;right:50%}.flatpickr-calendar:before{border-width:5px;margin:0 -5px}.flatpickr-calendar:after{border-width:4px;margin:0 -4px}.flatpickr-calendar.arrowTop:before,.flatpickr-calendar.arrowTop:after{bottom:100%}.flatpickr-calendar.arrowTop:before{border-bottom-color:var(--vi-color-border, #e5e7eb)}.flatpickr-calendar.arrowTop:after{border-bottom-color:var(--vi-color-background, #ffffff)}.flatpickr-calendar.arrowBottom:before,.flatpickr-calendar.arrowBottom:after{top:100%}.flatpickr-calendar.arrowBottom:before{border-top-color:var(--vi-color-border, #e5e7eb)}.flatpickr-calendar.arrowBottom:after{border-top-color:var(--vi-color-background, #ffffff)}.flatpickr-calendar:focus{outline:0}.flatpickr-wrapper{position:relative;display:inline-block}.flatpickr-months{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex}.flatpickr-months .flatpickr-month{background:transparent;color:var(--vi-text-primary, #111827);fill:var(--vi-text-primary, #111827);height:34px;line-height:1;text-align:center;position:relative;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;overflow:hidden;-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1}.flatpickr-months .flatpickr-prev-month,.flatpickr-months .flatpickr-next-month{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;text-decoration:none;cursor:pointer;position:absolute;top:0;height:34px;padding:10px;z-index:3;color:var(--vi-text-primary, #111827);fill:var(--vi-text-primary, #111827)}.flatpickr-months .flatpickr-prev-month.flatpickr-disabled,.flatpickr-months .flatpickr-next-month.flatpickr-disabled{display:none}.flatpickr-months .flatpickr-prev-month i,.flatpickr-months .flatpickr-next-month i{position:relative}.flatpickr-months .flatpickr-prev-month.flatpickr-prev-month,.flatpickr-months .flatpickr-next-month.flatpickr-prev-month{left:0}.flatpickr-months .flatpickr-prev-month.flatpickr-next-month,.flatpickr-months .flatpickr-next-month.flatpickr-next-month{right:0}.flatpickr-months .flatpickr-prev-month:hover,.flatpickr-months .flatpickr-next-month:hover{color:var(--vi-text-secondary, #4b5563)}.flatpickr-months .flatpickr-prev-month:hover svg,.flatpickr-months .flatpickr-next-month:hover svg{fill:var(--vi-color-error, #ef4444)}.flatpickr-months .flatpickr-prev-month svg,.flatpickr-months .flatpickr-next-month svg{width:14px;height:14px}.flatpickr-months .flatpickr-prev-month svg path,.flatpickr-months .flatpickr-next-month svg path{-webkit-transition:fill .1s;transition:fill .1s;fill:inherit}.numInputWrapper{position:relative;height:auto}.numInputWrapper input,.numInputWrapper span{display:inline-block}.numInputWrapper input{width:100%}.numInputWrapper input::-ms-clear{display:none}.numInputWrapper input::-webkit-outer-spin-button,.numInputWrapper input::-webkit-inner-spin-button{margin:0;-webkit-appearance:none}.numInputWrapper span{position:absolute;right:0;width:14px;padding:0 4px 0 2px;height:50%;line-height:50%;opacity:0;cursor:pointer;border:1px solid var(--vi-border-02, #eeeeee);-webkit-box-sizing:border-box;box-sizing:border-box}.numInputWrapper span:hover{background:var(--vi-layer-hover-01, #f3f4f6)}.numInputWrapper span:active{background:var(--vi-layer-hover-02, #e5e7eb)}.numInputWrapper span:after{display:block;content:\"\";position:absolute}.numInputWrapper span.arrowUp{top:0;border-bottom:0}.numInputWrapper span.arrowUp:after{border-left:4px solid transparent;border-right:4px solid transparent;border-bottom:4px solid var(--vi-text-secondary, #4b5563);top:26%}.numInputWrapper span.arrowDown{top:50%}.numInputWrapper span.arrowDown:after{border-left:4px solid transparent;border-right:4px solid transparent;border-top:4px solid var(--vi-text-secondary, #4b5563);top:40%}.numInputWrapper span svg{width:inherit;height:auto}.numInputWrapper span svg path{fill:var(--vi-text-secondary, #4b5563)}.numInputWrapper:hover{background:var(--vi-layer-hover-01, #f3f4f6)}.numInputWrapper:hover span{opacity:1}.flatpickr-current-month{font-size:135%;line-height:inherit;font-weight:300;color:inherit;position:absolute;width:75%;left:12.5%;padding:7.48px 0 0;line-height:1;height:34px;display:inline-block;text-align:center;-webkit-transform:translate3d(0px,0px,0px);transform:translateZ(0)}.flatpickr-current-month span.cur-month{font-family:inherit;font-weight:700;color:inherit;display:inline-block;margin-left:.5ch;padding:0}.flatpickr-current-month span.cur-month:hover{background:var(--vi-layer-hover-01, #f3f4f6)}.flatpickr-current-month .numInputWrapper{width:6ch;width:7ch\\fffd;display:inline-block}.flatpickr-current-month .numInputWrapper span.arrowUp:after{border-bottom-color:var(--vi-text-primary, #111827)}.flatpickr-current-month .numInputWrapper span.arrowDown:after{border-top-color:var(--vi-text-primary, #111827)}.flatpickr-current-month input.cur-year{background:transparent;-webkit-box-sizing:border-box;box-sizing:border-box;color:inherit;cursor:text;padding:0 0 0 .5ch;margin:0;display:inline-block;font-size:inherit;font-family:inherit;font-weight:300;line-height:inherit;height:auto;border:0;border-radius:0;vertical-align:initial;-webkit-appearance:textfield;-moz-appearance:textfield;appearance:textfield}.flatpickr-current-month input.cur-year:focus{outline:0}.flatpickr-current-month input.cur-year[disabled],.flatpickr-current-month input.cur-year[disabled]:hover{font-size:100%;color:var(--vi-text-secondary, #4b5563);background:transparent;pointer-events:none}.flatpickr-current-month .flatpickr-monthDropdown-months{appearance:menulist;background:transparent;border:none;border-radius:0;box-sizing:border-box;color:inherit;cursor:pointer;font-size:inherit;font-family:inherit;font-weight:300;height:auto;line-height:inherit;margin:-1px 0 0;outline:none;padding:0 0 0 .5ch;position:relative;vertical-align:initial;-webkit-box-sizing:border-box;-webkit-appearance:menulist;-moz-appearance:menulist;width:auto}.flatpickr-current-month .flatpickr-monthDropdown-months:focus,.flatpickr-current-month .flatpickr-monthDropdown-months:active{outline:none}.flatpickr-current-month .flatpickr-monthDropdown-months:hover{background:var(--vi-layer-hover-01, #f3f4f6)}.flatpickr-current-month .flatpickr-monthDropdown-months .flatpickr-monthDropdown-month{background-color:transparent;outline:none;padding:0}.flatpickr-weekdays{background:transparent;text-align:center;overflow:hidden;width:100%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;height:28px}.flatpickr-weekdays .flatpickr-weekdaycontainer{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1}span.flatpickr-weekday{cursor:default;font-size:90%;background:transparent;color:var(--vi-text-secondary, #4b5563);line-height:1;margin:0;text-align:center;display:block;-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1;font-weight:bolder}.dayContainer,.flatpickr-weeks{padding:1px 0 0}.flatpickr-days{position:relative;overflow:hidden;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:start;-webkit-align-items:flex-start;-ms-flex-align:start;align-items:flex-start;width:307.875px}.flatpickr-days:focus{outline:0}.dayContainer{padding:0;outline:0;text-align:left;width:307.875px;min-width:307.875px;max-width:307.875px;-webkit-box-sizing:border-box;box-sizing:border-box;display:inline-block;display:-ms-flexbox;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap;-ms-flex-wrap:wrap;-ms-flex-pack:justify;-webkit-justify-content:space-around;justify-content:space-around;-webkit-transform:translate3d(0px,0px,0px);transform:translateZ(0);opacity:1}.dayContainer+.dayContainer{-webkit-box-shadow:-1px 0 0 var(--vi-color-border, #e5e7eb);box-shadow:-1px 0 0 var(--vi-color-border, #e5e7eb)}.flatpickr-day{background:none;border:1px solid transparent;border-radius:150px;-webkit-box-sizing:border-box;box-sizing:border-box;color:var(--vi-text-primary, #111827);cursor:pointer;font-weight:400;width:14.2857143%;-webkit-flex-basis:14.2857143%;-ms-flex-preferred-size:14.2857143%;flex-basis:14.2857143%;max-width:39px;height:39px;line-height:39px;margin:0;display:inline-block;position:relative;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;text-align:center}.flatpickr-day.inRange,.flatpickr-day.prevMonthDay.inRange,.flatpickr-day.nextMonthDay.inRange,.flatpickr-day.today.inRange,.flatpickr-day.prevMonthDay.today.inRange,.flatpickr-day.nextMonthDay.today.inRange,.flatpickr-day:hover,.flatpickr-day.prevMonthDay:hover,.flatpickr-day.nextMonthDay:hover,.flatpickr-day:focus,.flatpickr-day.prevMonthDay:focus,.flatpickr-day.nextMonthDay:focus{cursor:pointer;outline:0;background:var(--vi-color-border, #e5e7eb);border-color:var(--vi-color-border, #e5e7eb)}.flatpickr-day.today{border-color:var(--vi-text-secondary, #4b5563)}.flatpickr-day.today:hover,.flatpickr-day.today:focus{border-color:var(--vi-text-secondary, #4b5563);background:var(--vi-text-secondary, #4b5563);color:var(--vi-color-background, #ffffff)}.flatpickr-day.selected,.flatpickr-day.startRange,.flatpickr-day.endRange,.flatpickr-day.selected.inRange,.flatpickr-day.startRange.inRange,.flatpickr-day.endRange.inRange,.flatpickr-day.selected:focus,.flatpickr-day.startRange:focus,.flatpickr-day.endRange:focus,.flatpickr-day.selected:hover,.flatpickr-day.startRange:hover,.flatpickr-day.endRange:hover,.flatpickr-day.selected.prevMonthDay,.flatpickr-day.startRange.prevMonthDay,.flatpickr-day.endRange.prevMonthDay,.flatpickr-day.selected.nextMonthDay,.flatpickr-day.startRange.nextMonthDay,.flatpickr-day.endRange.nextMonthDay{background:var(--vi-color-primary, #3676d0);-webkit-box-shadow:none;box-shadow:none;color:var(--vi-color-background, #ffffff);border-color:var(--vi-color-primary, #3676d0)}.flatpickr-day.selected.startRange,.flatpickr-day.startRange.startRange,.flatpickr-day.endRange.startRange{border-radius:50px 0 0 50px}.flatpickr-day.selected.endRange,.flatpickr-day.startRange.endRange,.flatpickr-day.endRange.endRange{border-radius:0 50px 50px 0}.flatpickr-day.selected.startRange+.endRange:not(:nth-child(7n+1)),.flatpickr-day.startRange.startRange+.endRange:not(:nth-child(7n+1)),.flatpickr-day.endRange.startRange+.endRange:not(:nth-child(7n+1)){-webkit-box-shadow:-10px 0 0 var(--vi-color-primary, #3676d0);box-shadow:-10px 0 0 var(--vi-color-primary, #3676d0)}.flatpickr-day.selected.startRange.endRange,.flatpickr-day.startRange.startRange.endRange,.flatpickr-day.endRange.startRange.endRange{border-radius:50px}.flatpickr-day.inRange{border-radius:0;-webkit-box-shadow:-5px 0 0 var(--vi-layer-03, #e5e7eb),5px 0 0 var(--vi-layer-03, #e5e7eb);box-shadow:-5px 0 0 var(--vi-layer-03, #e5e7eb),5px 0 0 var(--vi-layer-03, #e5e7eb)}.flatpickr-day.flatpickr-disabled,.flatpickr-day.flatpickr-disabled:hover,.flatpickr-day.prevMonthDay,.flatpickr-day.nextMonthDay,.flatpickr-day.notAllowed,.flatpickr-day.notAllowed.prevMonthDay,.flatpickr-day.notAllowed.nextMonthDay{color:var(--vi-text-disabled, #9e9e9e);background:transparent;border-color:transparent;cursor:default}.flatpickr-day.flatpickr-disabled,.flatpickr-day.flatpickr-disabled:hover{cursor:not-allowed;color:var(--vi-layer-disabled, #f3f4f6)}.flatpickr-day.week.selected{border-radius:0;-webkit-box-shadow:-5px 0 0 var(--vi-color-primary, #3676d0),5px 0 0 var(--vi-color-primary, #3676d0);box-shadow:-5px 0 0 var(--vi-color-primary, #3676d0),5px 0 0 var(--vi-color-primary, #3676d0)}.flatpickr-day.hidden{visibility:hidden}.rangeMode .flatpickr-day{margin-top:1px}.flatpickr-weekwrapper{float:left}.flatpickr-weekwrapper .flatpickr-weeks{padding:0 12px;-webkit-box-shadow:1px 0 0 var(--vi-color-border, #e5e7eb);box-shadow:1px 0 0 var(--vi-color-border, #e5e7eb)}.flatpickr-weekwrapper .flatpickr-weekday{float:none;width:100%;line-height:28px}.flatpickr-weekwrapper span.flatpickr-day,.flatpickr-weekwrapper span.flatpickr-day:hover{display:block;width:100%;max-width:none;color:var(--vi-text-disabled, #9e9e9e);background:transparent;cursor:default;border:none}.flatpickr-innerContainer{display:block;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-sizing:border-box;box-sizing:border-box;overflow:hidden}.flatpickr-rContainer{display:inline-block;padding:0;-webkit-box-sizing:border-box;box-sizing:border-box}.flatpickr-time{text-align:center;outline:0;display:block;height:0;line-height:40px;max-height:40px;-webkit-box-sizing:border-box;box-sizing:border-box;overflow:hidden;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex}.flatpickr-time:after{content:\"\";display:table;clear:both}.flatpickr-time .numInputWrapper{-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1;width:40%;height:40px;float:left}.flatpickr-time .numInputWrapper span.arrowUp:after{border-bottom-color:var(--vi-text-primary, #111827)}.flatpickr-time .numInputWrapper span.arrowDown:after{border-top-color:var(--vi-text-primary, #111827)}.flatpickr-time.hasSeconds .numInputWrapper{width:26%}.flatpickr-time.time24hr .numInputWrapper{width:49%}.flatpickr-time input{background:transparent;-webkit-box-shadow:none;box-shadow:none;border:0;border-radius:0;text-align:center;margin:0;padding:0;height:inherit;line-height:inherit;color:var(--vi-text-primary, #111827);font-size:14px;position:relative;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-appearance:textfield;-moz-appearance:textfield;appearance:textfield}.flatpickr-time input.flatpickr-hour{font-weight:700}.flatpickr-time input.flatpickr-minute,.flatpickr-time input.flatpickr-second{font-weight:400}.flatpickr-time input:focus{outline:0;border:0}.flatpickr-time .flatpickr-time-separator,.flatpickr-time .flatpickr-am-pm{height:inherit;float:left;line-height:inherit;color:var(--vi-text-primary, #111827);font-weight:700;width:2%;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-align-self:center;-ms-flex-item-align:center;align-self:center}.flatpickr-time .flatpickr-am-pm{outline:0;width:18%;cursor:pointer;text-align:center;font-weight:400}.flatpickr-time input:hover,.flatpickr-time .flatpickr-am-pm:hover,.flatpickr-time input:focus,.flatpickr-time .flatpickr-am-pm:focus{background:var(--vi-layer-hover-01, #f3f4f6)}.flatpickr-input[readonly]{cursor:pointer}@-webkit-keyframes fpFadeInDown{0%{opacity:0;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}to{opacity:1;-webkit-transform:translate3d(0,0,0);transform:translateZ(0)}}@keyframes fpFadeInDown{0%{opacity:0;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}to{opacity:1;-webkit-transform:translate3d(0,0,0);transform:translateZ(0)}}.flatpickr-calendar{background:var(--vi-date-picker-calendar-bg, var(--vi-layer-01, #ffffff));box-shadow:var(--vi-date-picker-calendar-shadow, var(--vi-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, .1)));border-radius:var(--vi-border-radius-lg, var(--vi-border-radius-lg, 8px));border:1px solid var(--vi-border-03, var(--vi-border-03, #e0e0e0));font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));color:var(--vi-text-primary, var(--vi-text-primary, #111827));padding:var(--vi-spacing-xs, var(--vi-spacing-xs, 8px)) 0;width:max-content}.flatpickr-calendar.arrowTop:before{border-bottom-color:var(--vi-border-03, var(--vi-border-03, #e0e0e0))}.flatpickr-calendar.arrowTop:after{border-bottom-color:var(--vi-date-picker-calendar-bg, var(--vi-layer-01, #ffffff))}.flatpickr-calendar.arrowBottom:before{border-top-color:var(--vi-border-03, var(--vi-border-03, #e0e0e0))}.flatpickr-calendar.arrowBottom:after{border-top-color:var(--vi-date-picker-calendar-bg, var(--vi-layer-01, #ffffff))}.flatpickr-calendar .flatpickr-innerContainer{justify-content:center}.flatpickr-months .flatpickr-month{color:var(--vi-text-primary, var(--vi-text-primary, #111827));fill:var(--vi-text-primary, var(--vi-text-primary, #111827))}.flatpickr-months .flatpickr-prev-month,.flatpickr-months .flatpickr-next-month{color:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));fill:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));padding:var(--vi-spacing-xs, var(--vi-spacing-xs, 8px));border-radius:var(--vi-border-radius-md, var(--vi-border-radius-md, 4px));transition:background-color .2s ease}.flatpickr-months .flatpickr-prev-month:hover,.flatpickr-months .flatpickr-next-month:hover{background-color:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb));color:var(--vi-text-primary, var(--vi-text-primary, #111827));fill:var(--vi-text-primary, var(--vi-text-primary, #111827))}.flatpickr-current-month{font-size:var(--vi-font-size-base, var(--vi-font-size-base, 16px));font-weight:var(--vi-font-weight-semibold, var(--vi-font-weight-semibold, 600));color:inherit}.flatpickr-current-month .flatpickr-monthDropdown-months{background:var(--vi-date-picker-calendar-bg, var(--vi-layer-01, #ffffff));border-radius:var(--vi-border-radius-md, var(--vi-border-radius-md, 4px));padding:4px}.flatpickr-current-month .flatpickr-monthDropdown-months:hover{background-color:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb))}.flatpickr-current-month input.cur-year{font-weight:inherit;color:inherit}.flatpickr-current-month input.cur-year:hover{background-color:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb))}.flatpickr-weekdays .flatpickr-weekdaycontainer{display:grid;grid-template-columns:repeat(7,var(--vi-date-picker-day-size, 32px));justify-items:center;width:max-content}.flatpickr-weekdays .flatpickr-weekday{color:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));font-size:var(--vi-font-size-xs, var(--vi-font-size-xs, 12px));font-weight:var(--vi-font-weight-medium, var(--vi-font-weight-medium, 500))}.flatpickr-days{width:auto}.dayContainer{display:grid;grid-template-columns:repeat(7,var(--vi-date-picker-day-size, 32px));justify-items:center;width:max-content;min-width:auto;max-width:none}.flatpickr-day{color:var(--vi-text-primary, var(--vi-text-primary, #111827));border-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px));margin:0;width:var(--vi-date-picker-day-size, 32px);max-width:var(--vi-date-picker-day-size, 32px);height:var(--vi-date-picker-day-size, 32px);line-height:var(--vi-date-picker-day-size, 32px);display:flex;align-items:center;justify-content:center;transition:all .2s ease}.flatpickr-day:hover,.flatpickr-day:focus{background:var(--vi-date-picker-day-hover-bg, var(--vi-layer-hover-01, #f3f4f6));border-color:var(--vi-date-picker-day-hover-bg, var(--vi-layer-hover-01, #f3f4f6))}.flatpickr-day.today{border-color:var(--vi-date-picker-day-today-border, var(--vi-color-primary, #3676d0))}.flatpickr-day.today:hover,.flatpickr-day.today:focus{border-color:var(--vi-date-picker-day-today-border, var(--vi-color-primary, #3676d0));background:var(--vi-date-picker-day-hover-bg, var(--vi-layer-hover-01, #f3f4f6))}.flatpickr-day.selected,.flatpickr-day.startRange,.flatpickr-day.endRange,.flatpickr-day.selected.inRange,.flatpickr-day.startRange.inRange,.flatpickr-day.endRange.inRange,.flatpickr-day.selected:focus,.flatpickr-day.startRange:focus,.flatpickr-day.endRange:focus,.flatpickr-day.selected:hover,.flatpickr-day.startRange:hover,.flatpickr-day.endRange:hover,.flatpickr-day.selected.prevMonthDay,.flatpickr-day.startRange.prevMonthDay,.flatpickr-day.endRange.prevMonthDay,.flatpickr-day.selected.nextMonthDay,.flatpickr-day.startRange.nextMonthDay,.flatpickr-day.endRange.nextMonthDay{background:var(--vi-date-picker-day-selected-bg, var(--vi-color-primary, #3676d0));border-color:var(--vi-date-picker-day-selected-bg, var(--vi-color-primary, #3676d0));color:var(--vi-date-picker-day-selected-color, var(--vi-text-primary-inverse, #ffffff))}.flatpickr-day.inRange,.flatpickr-day.prevMonthDay.inRange,.flatpickr-day.nextMonthDay.inRange,.flatpickr-day.today.inRange,.flatpickr-day.prevMonthDay.today.inRange,.flatpickr-day.nextMonthDay.today.inRange,.flatpickr-day:hover.inRange,.flatpickr-day.prevMonthDay:hover.inRange,.flatpickr-day.nextMonthDay:hover.inRange{background:var(--vi-color-blue-100, var(--vi-color-blue-100, #ebf5ff));border-color:var(--vi-color-blue-100, var(--vi-color-blue-100, #ebf5ff));border-radius:0;box-shadow:none;color:var(--vi-text-primary, var(--vi-text-primary, #111827))}.flatpickr-day.flatpickr-disabled,.flatpickr-day.flatpickr-disabled:hover,.flatpickr-day.prevMonthDay,.flatpickr-day.nextMonthDay,.flatpickr-day.notAllowed,.flatpickr-day.notAllowed.prevMonthDay,.flatpickr-day.notAllowed.nextMonthDay{color:var(--vi-text-disabled, var(--vi-text-disabled, #9e9e9e));background:transparent;border-color:transparent}.flatpickr-day.flatpickr-disabled,.flatpickr-day.flatpickr-disabled:hover{cursor:not-allowed}.vi-calendar-header{display:flex;justify-content:space-between;align-items:center;padding:4px var(--vi-spacing-xs, var(--vi-spacing-xs, 8px));border-bottom:1px solid var(--vi-border-02, var(--vi-border-02, #eeeeee));margin-bottom:var(--vi-spacing-xs, var(--vi-spacing-xs, 8px))}.vi-calendar-selectors{display:flex;gap:var(--vi-spacing-xs, var(--vi-spacing-xs, 8px));align-items:center}.vi-calendar-month-toggle{background:transparent;border:1px solid transparent;border-radius:var(--vi-border-radius-md, var(--vi-border-radius-md, 4px));padding:4px 8px;font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));font-weight:var(--vi-font-weight-semibold, var(--vi-font-weight-semibold, 600));font-size:var(--vi-font-size-base, var(--vi-font-size-base, 16px));color:var(--vi-text-primary, var(--vi-text-primary, #111827));cursor:pointer;transition:all .2s ease}.vi-calendar-month-toggle:hover{background:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb))}.vi-calendar-month-toggle:focus-visible{outline:none;background:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb));box-shadow:0 0 0 2px var(--vi-focus, var(--vi-focus, #3676d0))}.vi-calendar-year-select{min-width:76px;--vi-select-spacing-padding-inline: 4px;--vi-select-option-padding-inline: 8px;--vi-select-sizing-min-height: 32px}.vi-calendar-nav{display:flex;gap:2px}.vi-calendar-nav-btn{background:transparent;border:none;border-radius:var(--vi-border-radius-md, var(--vi-border-radius-md, 4px));width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;color:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));cursor:pointer;transition:all .2s ease}.vi-calendar-nav-btn:hover{background:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb));color:var(--vi-text-primary, var(--vi-text-primary, #111827))}.vi-calendar-month-grid{position:absolute;inset:50px 0 0;background:var(--vi-date-picker-calendar-bg, var(--vi-layer-01, #ffffff));z-index:10;display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:min-content;gap:4px;padding:var(--vi-spacing-xs, var(--vi-spacing-xs, 8px));border-radius:0 0 var(--vi-border-radius-lg, var(--vi-border-radius-lg, 8px)) var(--vi-border-radius-lg, var(--vi-border-radius-lg, 8px))}.vi-month-mode .vi-calendar-month-grid{position:relative;top:0;margin-top:var(--vi-spacing-xs, var(--vi-spacing-xs, 8px))}.vi-calendar-month-btn{background:transparent;border:1px solid transparent;border-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px));padding:var(--vi-spacing-xs, var(--vi-spacing-xs, 8px)) 0;font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));font-size:var(--vi-font-size-sm, var(--vi-font-size-sm, 14px));color:var(--vi-text-primary, var(--vi-text-primary, #111827));cursor:pointer;transition:all .2s ease}.vi-calendar-month-btn:hover{background:var(--vi-layer-hover-01, var(--vi-layer-hover-01, #f3f4f6))}.vi-calendar-month-btn.active{background:var(--vi-date-picker-day-selected-bg, var(--vi-color-primary, #3676d0));color:var(--vi-text-primary-inverse, var(--vi-text-primary-inverse, #ffffff))}.flatpickr-day.inRange:nth-child(7n+1),.flatpickr-day.inRange:hover:nth-child(7n+1){border-top-left-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px));border-bottom-left-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px))}.flatpickr-day.inRange:nth-child(7n),.flatpickr-day.inRange:hover:nth-child(7n){border-top-right-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px));border-bottom-right-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px))}.flatpickr-day.week.selected{background:var(--vi-color-blue-100, var(--vi-color-blue-100, #ebf5ff));border-color:var(--vi-color-blue-100, var(--vi-color-blue-100, #ebf5ff));color:var(--vi-text-primary, var(--vi-text-primary, #111827));border-radius:0;box-shadow:none}.flatpickr-day.week.selected:nth-child(7n+1){background:var(--vi-date-picker-day-selected-bg, var(--vi-color-primary, #3676d0));border-color:var(--vi-date-picker-day-selected-bg, var(--vi-color-primary, #3676d0));color:var(--vi-date-picker-day-selected-color, var(--vi-text-primary-inverse, #ffffff));border-top-left-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px));border-bottom-left-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px))}.flatpickr-day.week.selected:nth-child(7n){background:var(--vi-date-picker-day-selected-bg, var(--vi-color-primary, #3676d0));border-color:var(--vi-date-picker-day-selected-bg, var(--vi-color-primary, #3676d0));color:var(--vi-date-picker-day-selected-color, var(--vi-text-primary-inverse, #ffffff));border-top-right-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px));border-bottom-right-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px))}.vi-calendar-footer{padding:4px var(--vi-spacing-xs, var(--vi-spacing-xs, 8px));border-top:1px solid var(--vi-border-02, var(--vi-border-02, #eeeeee));display:flex;justify-content:flex-end}.vi-calendar-today-btn{background:transparent;border:none;color:var(--vi-color-primary, var(--vi-color-primary, #3676d0));font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));font-weight:var(--vi-font-weight-medium, var(--vi-font-weight-medium, 500));font-size:var(--vi-font-size-sm, var(--vi-font-size-sm, 14px));cursor:pointer;padding:var(--vi-spacing-xs, var(--vi-spacing-xs, 8px)) var(--vi-spacing-sm, var(--vi-spacing-sm, 16px));border-radius:var(--vi-border-radius-md, var(--vi-border-radius-md, 4px));transition:background-color .2s ease}.vi-calendar-today-btn:hover{background:var(--vi-layer-hover-01, var(--vi-layer-hover-01, #f3f4f6))}:host{display:inline-block;font-family:var(--vi-font-family, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));position:relative}#fp-input{position:absolute;top:0;left:0;opacity:0;pointer-events:none;width:0;height:0;margin:0;padding:0;border:0}.control{display:flex;flex-direction:column;gap:var(--vi-date-picker-spacing-field-gap, var(--vi-spacing-xs, 8px))}.inputs-container{display:flex;flex-direction:row;align-items:flex-start;gap:var(--vi-date-picker-spacing-inputs-gap, var(--vi-spacing-md, 24px));width:100%}:host([status=invalid]) .inputs-container ::slotted(vi-date-picker-input){--vi-input-border-color: var( --vi-date-picker-error-color, tokens.$color-error )}.validity-msg{font-size:var(--vi-date-picker-validity-font-size, var(--vi-font-size-xs, 12px));color:var(--vi-date-picker-error-color, var(--vi-color-error, #ef4444))}#floating-menu-container{position:absolute}";

/**
 * Calculates the ISO 8601 week number of a given date.
 * ISO week starts on Monday, and the first week of the year is the one
 * that contains the first Thursday of the year (or Jan 4).
 *
 * @param date The Date object to calculate the ISO week for.
 * @returns The ISO 8601 week number (1-53).
 */ function getISOWeek(date) {
    const dt = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    const dayn = (dt.getUTCDay() + 6) % 7;
    dt.setUTCDate(dt.getUTCDate() - dayn + 3);
    // Return the calculated week number
    const firstThursday = dt.valueOf();
    // Set to January 1 of the nearest Thursday's year
    dt.setUTCMonth(0, 1);
    if (dt.getUTCDay() !== 4) {
        dt.setUTCMonth(0, 1 + (4 - dt.getUTCDay() + 7) % 7);
    }
    // Calculate week number
    return 1 + Math.round((firstThursday - dt.valueOf()) / 604800000);
}
/**
 * Parses an ISO 8601 week string (YYYY-Www) into a Date object.
 * Returns the Monday of that week.
 *
 * @param isoWeekString The string in format YYYY-Www
 * @returns A Date object representing the Monday of the given week, or null if invalid.
 */ function parseISOWeek(isoWeekString) {
    const match = /^(\d{4})-W(\d{2})$/.exec(isoWeekString);
    if (!match) return null;
    const year = parseInt(match[1], 10);
    const week = parseInt(match[2], 10);
    if (week < 1 || week > 53) return null;
    // Jan 4 is always in ISO week 1.
    const jan4 = new Date(Date.UTC(year, 0, 4));
    // Find Monday of week 1
    const dayn = (jan4.getUTCDay() + 6) % 7; // Monday = 0, Sunday = 6
    const week1Monday = new Date(Date.UTC(year, 0, 4 - dayn));
    // Add (week - 1) weeks
    week1Monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
    return new Date(week1Monday.getUTCFullYear(), week1Monday.getUTCMonth(), week1Monday.getUTCDate());
}

function ViMonthYearPlugin(config = {}) {
    return function(fp) {
        let headerContainer;
        let prevBtn;
        let nextBtn;
        let monthToggleBtn;
        let yearSelect; // vi-select
        let monthGridContainer;
        function createHeader() {
            headerContainer = document.createElement('div');
            headerContainer.className = 'vi-calendar-header';
            prevBtn = document.createElement('button');
            prevBtn.type = 'button';
            prevBtn.className = 'vi-calendar-nav-btn vi-calendar-prev';
            if (config.ariaLabels?.prevMonth) {
                prevBtn.setAttribute('aria-label', config.ariaLabels.prevMonth);
            }
            const parser = new DOMParser();
            const prevDoc = parser.parseFromString(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`, 'image/svg+xml');
            prevBtn.appendChild(prevDoc.documentElement);
            prevBtn.addEventListener('click', (e)=>{
                e.preventDefault();
                fp.changeMonth(-1);
            });
            nextBtn = document.createElement('button');
            nextBtn.type = 'button';
            nextBtn.className = 'vi-calendar-nav-btn vi-calendar-next';
            if (config.ariaLabels?.nextMonth) {
                nextBtn.setAttribute('aria-label', config.ariaLabels.nextMonth);
            }
            const nextDoc = parser.parseFromString(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`, 'image/svg+xml');
            nextBtn.appendChild(nextDoc.documentElement);
            nextBtn.addEventListener('click', (e)=>{
                e.preventDefault();
                fp.changeMonth(1);
            });
            const selectorsContainer = document.createElement('div');
            selectorsContainer.className = 'vi-calendar-selectors';
            monthToggleBtn = document.createElement('button');
            monthToggleBtn.type = 'button';
            monthToggleBtn.className = 'vi-calendar-month-toggle';
            monthToggleBtn.setAttribute('aria-label', config.ariaLabels?.selectMonth ?? fp.l10n.monthAriaLabel ?? 'Select month');
            monthToggleBtn.addEventListener('click', (e)=>{
                e.preventDefault();
                toggleMonthGrid();
            });
            yearSelect = document.createElement('vi-select');
            yearSelect.className = 'vi-calendar-year-select';
            yearSelect.setAttribute('size', 'sm');
            yearSelect.setAttribute('aria-label', config.ariaLabels?.selectYear ?? fp.l10n.yearAriaLabel ?? 'Select year');
            // Use createElement and assign .value directly so vi-select can synchronously read the value
            // even before Lit has fully upgraded the custom elements in the browser.
            const currentYear = new Date().getFullYear();
            for(let y = currentYear - 50; y <= currentYear + 50; y++){
                const opt = document.createElement('vi-select-option');
                opt.value = y.toString();
                opt.textContent = y.toString();
                yearSelect.appendChild(opt);
            }
            yearSelect.addEventListener('vialiq-change', (e)=>{
                e.stopPropagation(); // prevent it from bubbling up to Storybook
                const selectedYear = parseInt(e.detail.value, 10);
                if (!isNaN(selectedYear)) {
                    fp.changeYear(selectedYear);
                }
            });
            selectorsContainer.appendChild(monthToggleBtn);
            selectorsContainer.appendChild(yearSelect);
            headerContainer.appendChild(prevBtn);
            headerContainer.appendChild(selectorsContainer);
            headerContainer.appendChild(nextBtn);
            // Stop ALL click/pointer events from bubbling out of the header!
            // This is the CRITICAL fix that prevents Flatpickr from closing the calendar 
            // when you click the year select. Because vi-select uses Shadow DOM, Flatpickr
            // gets confused and thinks you clicked outside the calendar.
            const stopPropagation = (e)=>e.stopPropagation();
            headerContainer.addEventListener('mousedown', stopPropagation);
            headerContainer.addEventListener('click', stopPropagation);
            headerContainer.addEventListener('touchstart', stopPropagation);
            return headerContainer;
        }
        function createMonthGrid() {
            monthGridContainer = document.createElement('div');
            monthGridContainer.className = 'vi-calendar-month-grid';
            monthGridContainer.style.display = 'none';
            const months = fp.l10n.months.shorthand;
            months.forEach((monthName, index)=>{
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'vi-calendar-month-btn';
                btn.textContent = monthName;
                btn.dataset.month = index.toString();
                btn.addEventListener('click', (e)=>{
                    e.preventDefault();
                    if (config.hideDays) {
                        // In month-only mode, clicking a month selects it and closes the picker
                        const newDate = new Date(fp.currentYear, index, 1);
                        fp.setDate(newDate, true);
                        fp.close();
                    } else {
                        // Normal mode: just change the calendar view to that month
                        fp.changeMonth(index, false);
                        toggleMonthGrid(false);
                    }
                });
                monthGridContainer.appendChild(btn);
            });
            return monthGridContainer;
        }
        function toggleMonthGrid(force) {
            const isCurrentlyVisible = monthGridContainer.style.display === 'grid';
            const shouldShow = force !== undefined ? force : !isCurrentlyVisible;
            monthGridContainer.style.display = shouldShow ? 'grid' : 'none';
            if (shouldShow) {
                const monthBtns = monthGridContainer.querySelectorAll('.vi-calendar-month-btn');
                monthBtns.forEach((btn)=>{
                    if (parseInt(btn.dataset.month || '', 10) === fp.currentMonth) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
        }
        function updateHeaderValues() {
            if (!monthToggleBtn || !yearSelect) return;
            monthToggleBtn.textContent = fp.l10n.months.longhand[fp.currentMonth];
            yearSelect.value = fp.currentYear.toString();
            if (prevBtn && !config.ariaLabels?.prevMonth) {
                const prevMonthIndex = fp.currentMonth === 0 ? 11 : fp.currentMonth - 1;
                prevBtn.setAttribute('aria-label', fp.l10n.months.longhand[prevMonthIndex]);
            }
            if (nextBtn && !config.ariaLabels?.nextMonth) {
                const nextMonthIndex = fp.currentMonth === 11 ? 0 : fp.currentMonth + 1;
                nextBtn.setAttribute('aria-label', fp.l10n.months.longhand[nextMonthIndex]);
            }
        }
        function applyHideDaysConfig() {
            if (!config.hideDays) return;
            fp.calendarContainer.classList.add('vi-month-mode');
            const innerContainer = fp.calendarContainer.querySelector('.flatpickr-innerContainer');
            if (innerContainer) innerContainer.style.display = 'none';
            // Permanently show the month grid
            toggleMonthGrid(true);
            // Also hide the month toggle button since it's permanently showing the grid anyway
            if (monthToggleBtn) {
                monthToggleBtn.style.display = 'none';
            }
        }
        return {
            onReady: ()=>{
                if (fp.monthNav) {
                    fp.monthNav.style.display = 'none';
                }
                const header = createHeader();
                fp.calendarContainer.insertBefore(header, fp.calendarContainer.firstChild);
                const grid = createMonthGrid();
                fp.calendarContainer.appendChild(grid);
                // Tell Flatpickr not to close when these custom elements are clicked
                if (!fp.config.ignoredFocusElements) {
                    fp.config.ignoredFocusElements = [];
                }
                fp.config.ignoredFocusElements.push(header, grid);
                updateHeaderValues();
                applyHideDaysConfig();
            },
            onMonthChange: ()=>{
                updateHeaderValues();
            },
            onYearChange: ()=>{
                updateHeaderValues();
            },
            onDestroy: ()=>{
                headerContainer?.remove();
                monthGridContainer?.remove();
            }
        };
    };
}

const viMonthYearPlugin = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  ViMonthYearPlugin
}, Symbol.toStringTag, { value: 'Module' }));

/**
 * A Carbon Web Components inspired plugin that fixes Flatpickr's native
 * event targeting issues when used within a Web Component (Shadow DOM).
 * 
 * Flatpickr relies on native `Node.contains()` for its `documentClick` listener
 * to determine if a click occurred outside the calendar. Because Shadow DOM 
 * boundaries are not pierced by `Node.contains()`, clicks on custom elements 
 * (like `<vi-select>`) inside the calendar are falsely identified as outside 
 * clicks, causing the calendar to close unexpectedly.
 * 
 * This plugin overrides `fp.calendarContainer.contains` to properly traverse 
 * up through Shadow Roots.
 */ function ViShadowDomPlugin() {
    return function(fp) {
        return {
            onReady: ()=>{
                if (!fp.calendarContainer) return;
                const originalContains = fp.calendarContainer.contains.bind(fp.calendarContainer);
                fp.calendarContainer.contains = (node)=>{
                    if (!node) return false;
                    if (originalContains(node)) return true;
                    let curr = node;
                    while(curr){
                        if (curr === fp.calendarContainer) return true;
                        if (curr.getRootNode() instanceof ShadowRoot) {
                            curr = curr.getRootNode().host;
                        } else {
                            curr = curr.parentNode;
                        }
                    }
                    return false;
                };
            }
        };
    };
}

var rangePlugin$2 = {exports: {}};

var rangePlugin$1 = rangePlugin$2.exports;

var hasRequiredRangePlugin;

function requireRangePlugin () {
	if (hasRequiredRangePlugin) return rangePlugin$2.exports;
	hasRequiredRangePlugin = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		    module.exports = factory() ;
		}(rangePlugin$1, (function () {
		    /*! *****************************************************************************
		    Copyright (c) Microsoft Corporation.

		    Permission to use, copy, modify, and/or distribute this software for any
		    purpose with or without fee is hereby granted.

		    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
		    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
		    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
		    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
		    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
		    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
		    PERFORMANCE OF THIS SOFTWARE.
		    ***************************************************************************** */

		    function __spreadArrays() {
		        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
		        for (var r = Array(s), k = 0, i = 0; i < il; i++)
		            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
		                r[k] = a[j];
		        return r;
		    }

		    function rangePlugin(config) {
		        if (config === void 0) { config = {}; }
		        return function (fp) {
		            var dateFormat = "", secondInput, _secondInputFocused, _prevDates;
		            var createSecondInput = function () {
		                if (config.input) {
		                    secondInput =
		                        config.input instanceof Element
		                            ? config.input
		                            : window.document.querySelector(config.input);
		                    if (!secondInput) {
		                        fp.config.errorHandler(new Error("Invalid input element specified"));
		                        return;
		                    }
		                    if (fp.config.wrap) {
		                        secondInput = secondInput.querySelector("[data-input]");
		                    }
		                }
		                else {
		                    secondInput = fp._input.cloneNode();
		                    secondInput.removeAttribute("id");
		                    secondInput._flatpickr = undefined;
		                }
		                if (secondInput.value) {
		                    var parsedDate = fp.parseDate(secondInput.value);
		                    if (parsedDate)
		                        fp.selectedDates.push(parsedDate);
		                }
		                secondInput.setAttribute("data-fp-omit", "");
		                if (fp.config.clickOpens) {
		                    fp._bind(secondInput, ["focus", "click"], function () {
		                        if (fp.selectedDates[1]) {
		                            fp.latestSelectedDateObj = fp.selectedDates[1];
		                            fp._setHoursFromDate(fp.selectedDates[1]);
		                            fp.jumpToDate(fp.selectedDates[1]);
		                        }
		                        _secondInputFocused = true;
		                        fp.isOpen = false;
		                        fp.open(undefined, config.position === "left" ? fp._input : secondInput);
		                    });
		                    fp._bind(fp._input, ["focus", "click"], function (e) {
		                        e.preventDefault();
		                        fp.isOpen = false;
		                        fp.open();
		                    });
		                }
		                if (fp.config.allowInput)
		                    fp._bind(secondInput, "keydown", function (e) {
		                        if (e.key === "Enter") {
		                            fp.setDate([fp.selectedDates[0], secondInput.value], true, dateFormat);
		                            secondInput.click();
		                        }
		                    });
		                if (!config.input)
		                    fp._input.parentNode &&
		                        fp._input.parentNode.insertBefore(secondInput, fp._input.nextSibling);
		            };
		            var plugin = {
		                onParseConfig: function () {
		                    fp.config.mode = "range";
		                    dateFormat = fp.config.altInput
		                        ? fp.config.altFormat
		                        : fp.config.dateFormat;
		                },
		                onReady: function () {
		                    createSecondInput();
		                    fp.config.ignoredFocusElements.push(secondInput);
		                    if (fp.config.allowInput) {
		                        fp._input.removeAttribute("readonly");
		                        secondInput.removeAttribute("readonly");
		                    }
		                    else {
		                        secondInput.setAttribute("readonly", "readonly");
		                    }
		                    fp._bind(fp._input, "focus", function () {
		                        fp.latestSelectedDateObj = fp.selectedDates[0];
		                        fp._setHoursFromDate(fp.selectedDates[0]);
		                        _secondInputFocused = false;
		                        fp.jumpToDate(fp.selectedDates[0]);
		                    });
		                    if (fp.config.allowInput)
		                        fp._bind(fp._input, "keydown", function (e) {
		                            if (e.key === "Enter")
		                                fp.setDate([fp._input.value, fp.selectedDates[1]], true, dateFormat);
		                        });
		                    fp.setDate(fp.selectedDates, false);
		                    plugin.onValueUpdate(fp.selectedDates);
		                    fp.loadedPlugins.push("range");
		                },
		                onPreCalendarPosition: function () {
		                    if (_secondInputFocused) {
		                        fp._positionElement = secondInput;
		                        setTimeout(function () {
		                            fp._positionElement = fp._input;
		                        }, 0);
		                    }
		                },
		                onChange: function () {
		                    if (!fp.selectedDates.length) {
		                        setTimeout(function () {
		                            if (fp.selectedDates.length)
		                                return;
		                            secondInput.value = "";
		                            _prevDates = [];
		                        }, 10);
		                    }
		                    if (_secondInputFocused) {
		                        setTimeout(function () {
		                            secondInput.focus();
		                        }, 0);
		                    }
		                },
		                onDestroy: function () {
		                    if (!config.input)
		                        secondInput.parentNode &&
		                            secondInput.parentNode.removeChild(secondInput);
		                },
		                onValueUpdate: function (selDates) {
		                    var _a, _b, _c;
		                    if (!secondInput)
		                        return;
		                    _prevDates =
		                        !_prevDates || selDates.length >= _prevDates.length
		                            ? __spreadArrays(selDates) : _prevDates;
		                    if (_prevDates.length > selDates.length) {
		                        var newSelectedDate = selDates[0];
		                        var newDates = _secondInputFocused
		                            ? [_prevDates[0], newSelectedDate]
		                            : [newSelectedDate, _prevDates[1]];
		                        if (newDates[0].getTime() > newDates[1].getTime()) {
		                            if (_secondInputFocused) {
		                                newDates[0] = newDates[1];
		                            }
		                            else {
		                                newDates[1] = newDates[0];
		                            }
		                        }
		                        fp.setDate(newDates, false);
		                        _prevDates = __spreadArrays(newDates);
		                    }
		                    _a = fp.selectedDates.map(function (d) { return fp.formatDate(d, dateFormat); }), _b = _a[0], fp._input.value = _b === void 0 ? "" : _b, _c = _a[1], secondInput.value = _c === void 0 ? "" : _c;
		                },
		            };
		            return plugin;
		        };
		    }

		    return rangePlugin;

		}))); 
	} (rangePlugin$2));
	return rangePlugin$2.exports;
}

var rangePluginExports = requireRangePlugin();
const rangePlugin = /*@__PURE__*/getDefaultExportFromCjs(rangePluginExports);

/**
 * A wrapper around Flatpickr's rangePlugin that correctly formats dates back to the
 * Shadow DOM input elements and handles Shadow DOM focus events correctly.
 */ function ViRangePlugin(config) {
    // We initialize the base rangePlugin
    // Carbon originally forced position: 'left' to always align to the start date.
    // We remove this constraint so it correctly aligns to the end date when clicked.
    const factory = rangePlugin({
        ...config,
        position: config.position
    });
    return (fp)=>{
        const origRangePlugin = factory(fp);
        const origOnReady = origRangePlugin.onReady;
        return Object.assign(origRangePlugin, {
            onChange () {},
            onPreCalendarPosition () {},
            onValueUpdate (selectedDates) {
                // We sync the formatted dates back to the two inputs when the value updates
                const [startDate, endDate] = selectedDates;
                const startDateFormatted = startDate ? fp.formatDate(startDate, fp.config.dateFormat) : '';
                const endDateFormatted = endDate ? fp.formatDate(endDate, fp.config.dateFormat) : '';
                // Ensure start date updates the main input
                if (fp._input && 'value' in fp._input) {
                    fp._input.value = startDateFormatted;
                    // Dispatch input event so our Lit wrapper knows the value changed
                    fp._input.dispatchEvent(new Event('input', {
                        bubbles: true
                    }));
                }
                // Ensure end date updates the secondary config input
                if (config.input && typeof config.input !== 'string' && 'value' in config.input) {
                    config.input.value = endDateFormatted;
                    config.input.dispatchEvent(new Event('input', {
                        bubbles: true
                    }));
                }
            },
            onReady (dates, currentDateString, self, data) {
                if (typeof origOnReady === 'function') {
                    origOnReady(dates, currentDateString, self, data);
                } else if (Array.isArray(origOnReady)) {
                    origOnReady.forEach((fn)=>fn(dates, currentDateString, self, data));
                }
                // Make sure flatpickr ignores clicks inside the inputs when they are in shadow DOM
                const { ignoredFocusElements } = fp.config;
                // Add shadow roots of ignored elements so clicks inside shadow DOM are ignored
                const shadowRoots = ignoredFocusElements.map((elem)=>elem.shadowRoot).filter(Boolean);
                ignoredFocusElements.push(...shadowRoots || []);
            }
        });
    };
}

const datePickerInputStyles = "@charset \"UTF-8\";@layer reset,components,utilities;:host{display:block;font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif))}.input-wrapper{display:flex;flex-direction:column;gap:var(--vi-spacing-xs, var(--vi-spacing-xs, 8px))}.label{font-size:var(--vi-font-size-sm, var(--vi-font-size-sm, 14px));color:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));font-weight:var(--vi-font-weight-medium, var(--vi-font-weight-medium, 500))}:host([disabled]){cursor:not-allowed;opacity:var(--vi-disabled-opacity, .6)}:host([disabled]) .label,:host([disabled]) .trigger{pointer-events:none}.trigger{box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;width:100%;min-height:var(--vi-input-height, 40px);padding:0 var(--vi-spacing-md, var(--vi-spacing-md, 24px));background:var(--vi-input-bg, var(--vi-layer-01, #ffffff));border:1px solid var(--vi-input-trigger-border-color, var(--vi-border-02, #eeeeee));border-radius:var(--vi-border-radius-md, var(--vi-border-radius-md, 4px));color:var(--vi-text-primary, var(--vi-text-primary, #111827));font-family:inherit;font-size:var(--vi-font-size-base, var(--vi-font-size-base, 16px));text-align:left;cursor:pointer;transition:all .2s ease}.trigger:hover:not(:disabled){background:var(--vi-layer-hover-01, var(--vi-layer-hover-01, #f3f4f6));border-color:var(--vi-border-03, var(--vi-border-03, #e0e0e0))}:host(:focus-within) .trigger{outline:none;border-color:var(--vi-focus, var(--vi-focus, #3676d0));box-shadow:0 0 0 1px var(--vi-focus, var(--vi-focus, #3676d0))}.trigger:disabled{background:var(--vi-layer-disabled, var(--vi-layer-02, #f3f4f6));color:var(--vi-text-disabled, var(--vi-text-disabled, #9e9e9e));cursor:not-allowed;border-color:var(--vi-border-disabled, var(--vi-border-02, #eeeeee))}.display-value{flex-grow:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.placeholder{color:var(--vi-text-placeholder, var(--vi-text-secondary, #4b5563))}.icon{flex-shrink:0;display:flex;align-items:center;color:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));margin-left:var(--vi-spacing-sm, var(--vi-spacing-sm, 16px))}.trigger:disabled .icon{color:var(--vi-text-disabled, var(--vi-text-disabled, #9e9e9e))}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}";

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
var _dec$1, _initClass$1, _ViElement, _dec1$1, _dec2$1, _dec3$1, _dec4$1, _dec5$1, _dec6$1, _dec7$1, _dec8$1, _dec9$1, _dec10$1, _init_kind, _init_label, _init_placeholder, _init_disabled$1, _init_required, _init_invalid, _init_validityMessage, _init_expanded, _init_value$1, _init__triggerBtn, _initProto$1;
let _ViDatePickerInput;
_dec$1 = t('vi-date-picker-input'), _dec1$1 = n({
    type: String,
    reflect: true
}), _dec2$1 = n({
    type: String
}), _dec3$1 = n({
    type: String
}), _dec4$1 = n({
    type: Boolean,
    reflect: true
}), _dec5$1 = n({
    type: Boolean,
    reflect: true
}), _dec6$1 = n({
    type: Boolean,
    reflect: true
}), _dec7$1 = n({
    type: String
}), _dec8$1 = n({
    type: Boolean
}), _dec9$1 = n({
    type: String
}), _dec10$1 = e('.trigger');
new class extends _identity$1 {
    constructor(){
        super(_ViDatePickerInput), _initClass$1();
    }
    static{
        class ViDatePickerInput extends (_ViElement = ViElement) {
            static{
                ({ e: [_init_kind, _init_label, _init_placeholder, _init_disabled$1, _init_required, _init_invalid, _init_validityMessage, _init_expanded, _init_value$1, _init__triggerBtn, _initProto$1], c: [_ViDatePickerInput, _initClass$1] } = _apply_decs_2203_r$1(this, [
                    [
                        _dec1$1,
                        1,
                        "kind"
                    ],
                    [
                        _dec2$1,
                        1,
                        "label"
                    ],
                    [
                        _dec3$1,
                        1,
                        "placeholder"
                    ],
                    [
                        _dec4$1,
                        1,
                        "disabled"
                    ],
                    [
                        _dec5$1,
                        1,
                        "required"
                    ],
                    [
                        _dec6$1,
                        1,
                        "invalid"
                    ],
                    [
                        _dec7$1,
                        1,
                        "validityMessage"
                    ],
                    [
                        _dec8$1,
                        1,
                        "expanded"
                    ],
                    [
                        _dec9$1,
                        1,
                        "value"
                    ],
                    [
                        _dec10$1,
                        1,
                        "_triggerBtn"
                    ]
                ], [
                    _dec$1
                ], _ViElement));
            }
            #___private_kind_1 = (_initProto$1(this), _init_kind(this, 'single'));
            get kind() {
                return this.#___private_kind_1;
            }
            set kind(_v) {
                this.#___private_kind_1 = _v;
            }
            #___private_label_2 = _init_label(this, '');
            get label() {
                return this.#___private_label_2;
            }
            set label(_v) {
                this.#___private_label_2 = _v;
            }
            #___private_placeholder_3 = _init_placeholder(this);
            get placeholder() {
                return this.#___private_placeholder_3;
            }
            set placeholder(_v) {
                this.#___private_placeholder_3 = _v;
            }
            #___private_disabled_4 = _init_disabled$1(this, false);
            get disabled() {
                return this.#___private_disabled_4;
            }
            set disabled(_v) {
                this.#___private_disabled_4 = _v;
            }
            #___private_required_5 = _init_required(this, false);
            get required() {
                return this.#___private_required_5;
            }
            set required(_v) {
                this.#___private_required_5 = _v;
            }
            #___private_invalid_6 = _init_invalid(this, false);
            get invalid() {
                return this.#___private_invalid_6;
            }
            set invalid(_v) {
                this.#___private_invalid_6 = _v;
            }
            #___private_validityMessage_7 = _init_validityMessage(this, '');
            get validityMessage() {
                return this.#___private_validityMessage_7;
            }
            set validityMessage(_v) {
                this.#___private_validityMessage_7 = _v;
            }
            #___private_expanded_8 = _init_expanded(this, false);
            get expanded() {
                return this.#___private_expanded_8;
            }
            set expanded(_v) {
                this.#___private_expanded_8 = _v;
            }
            #___private_value_9 = _init_value$1(this, '');
            get value() {
                return this.#___private_value_9;
            }
            set value(_v) {
                this.#___private_value_9 = _v;
            }
            #___private__triggerBtn_10 = _init__triggerBtn(this);
            get _triggerBtn() {
                return this.#___private__triggerBtn_10;
            }
            set _triggerBtn(_v) {
                this.#___private__triggerBtn_10 = _v;
            }
            static shadowRootOptions = {
                ...i.shadowRootOptions,
                delegatesFocus: true
            };
            /**
   * Returns the interactable element for Flatpickr to bind to.
   */ get inputElement() {
                return this._triggerBtn;
            }
            focus(options) {
                if (this._triggerBtn) {
                    this._triggerBtn.focus(options);
                } else {
                    super.focus(options);
                }
            }
            render() {
                const accessibleName = [
                    this.label,
                    this.value || this.placeholder
                ].filter(Boolean).join(', ');
                return b`
      <div class="input-wrapper">
        ${this.label ? b`<label class="label" aria-hidden="true">${this.label}</label>` : ''}
        <button
          type="button"
          part="trigger"
          class="trigger"
          ?disabled="${this.disabled}"
          aria-haspopup="dialog"
          aria-expanded="${this.expanded}"
          aria-label="${accessibleName}"
          aria-required="${this.required ? 'true' : 'false'}"
          aria-invalid="${this.invalid ? 'true' : 'false'}"
          aria-errormessage="${this.invalid && this.validityMessage ? 'vi-err-msg' : A}"
        >
          <span class="display-value">
            ${this.value ? b`<span class="value-text">${this.value}</span>` : b`<span class="placeholder">${this.placeholder}</span>`}
          </span>
          <span class="icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </span>
        </button>
        ${this.invalid && this.validityMessage ? b`<span id="vi-err-msg" class="sr-only">${this.validityMessage}</span>` : ''}
      </div>
    `;
            }
            static styles = i$1`
    ${r(datePickerInputStyles)}
  `;
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
var _dec, _initClass, _ValidityMixin, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _init_value, _init_name, _init_mode, _init_flat, _init_hoist, _init_min, _init_max, _init_locale, _init_disabled, _init_weekNumbers, _init_todayLabel, _init__resolvedLocale, _init__displayValue, _init__fpInput, _init__floatingMenuContainer, _init__inputs, _init_labelPrevMonth, _init_labelNextMonth, _init_labelSelectMonth, _init_labelSelectYear, _initProto;
/** Emitted when the user selects a date. Detail: DatePickerChangeDetail. */ const VIALIQ_CHANGE = 'vialiq-change';
let _ViDatePicker;
_dec = t('vi-date-picker'), _dec1 = n({
    type: String,
    reflect: true
}), _dec2 = n({
    type: String
}), _dec3 = n({
    type: String,
    reflect: true
}), _dec4 = n({
    type: Boolean,
    reflect: true
}), _dec5 = n({
    type: Boolean
}), _dec6 = n({
    type: String
}), _dec7 = n({
    type: String
}), _dec8 = n({
    type: String
}), _dec9 = n({
    type: Boolean,
    reflect: true
}), _dec10 = n({
    type: Boolean,
    attribute: 'week-numbers'
}), _dec11 = n({
    type: String,
    attribute: 'today-label'
}), _dec12 = r$1(), _dec13 = r$1(), _dec14 = e('#fp-input'), _dec15 = e('#floating-menu-container'), _dec16 = o({
    selector: 'vi-date-picker-input'
}), _dec17 = n({
    type: String,
    attribute: 'label-prev-month'
}), _dec18 = n({
    type: String,
    attribute: 'label-next-month'
}), _dec19 = n({
    type: String,
    attribute: 'label-select-month'
}), _dec20 = n({
    type: String,
    attribute: 'label-select-year'
});
new class extends _identity {
    constructor(){
        super(_ViDatePicker), _initClass();
    }
    static{
        class ViDatePicker extends (_ValidityMixin = ValidityMixin(FlatpickrMixin(ViElement))) {
            static{
                ({ e: [_init_value, _init_name, _init_mode, _init_flat, _init_hoist, _init_min, _init_max, _init_locale, _init_disabled, _init_weekNumbers, _init_todayLabel, _init__resolvedLocale, _init__displayValue, _init__fpInput, _init__floatingMenuContainer, _init__inputs, _init_labelPrevMonth, _init_labelNextMonth, _init_labelSelectMonth, _init_labelSelectYear, _initProto], c: [_ViDatePicker, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "value"
                    ],
                    [
                        _dec2,
                        1,
                        "name"
                    ],
                    [
                        _dec3,
                        1,
                        "mode"
                    ],
                    [
                        _dec4,
                        1,
                        "flat"
                    ],
                    [
                        _dec5,
                        1,
                        "hoist"
                    ],
                    [
                        _dec6,
                        1,
                        "min"
                    ],
                    [
                        _dec7,
                        1,
                        "max"
                    ],
                    [
                        _dec8,
                        1,
                        "locale"
                    ],
                    [
                        _dec9,
                        1,
                        "disabled"
                    ],
                    [
                        _dec10,
                        1,
                        "weekNumbers"
                    ],
                    [
                        _dec11,
                        1,
                        "todayLabel"
                    ],
                    [
                        _dec12,
                        1,
                        "_resolvedLocale"
                    ],
                    [
                        _dec13,
                        1,
                        "_displayValue"
                    ],
                    [
                        _dec14,
                        1,
                        "_fpInput"
                    ],
                    [
                        _dec15,
                        1,
                        "_floatingMenuContainer"
                    ],
                    [
                        _dec16,
                        1,
                        "_inputs"
                    ],
                    [
                        _dec17,
                        1,
                        "labelPrevMonth"
                    ],
                    [
                        _dec18,
                        1,
                        "labelNextMonth"
                    ],
                    [
                        _dec19,
                        1,
                        "labelSelectMonth"
                    ],
                    [
                        _dec20,
                        1,
                        "labelSelectYear"
                    ]
                ], [
                    _dec
                ], _ValidityMixin));
            }
            #___private_value_1 = (_initProto(this), _init_value(this, ''));
            get value() {
                return this.#___private_value_1;
            }
            set value(_v) {
                this.#___private_value_1 = _v;
            }
            #___private_name_2 = _init_name(this, '');
            get name() {
                return this.#___private_name_2;
            }
            set name(_v) {
                this.#___private_name_2 = _v;
            }
            #___private_mode_3 = _init_mode(this, 'date');
            get mode() {
                return this.#___private_mode_3;
            }
            set mode(_v) {
                this.#___private_mode_3 = _v;
            }
            #___private_flat_4 = _init_flat(this, false);
            get flat() {
                return this.#___private_flat_4;
            }
            set flat(_v) {
                this.#___private_flat_4 = _v;
            }
            #___private_hoist_5 = _init_hoist(this, false);
            get hoist() {
                return this.#___private_hoist_5;
            }
            set hoist(_v) {
                this.#___private_hoist_5 = _v;
            }
            #___private_min_6 = _init_min(this, '');
            get min() {
                return this.#___private_min_6;
            }
            set min(_v) {
                this.#___private_min_6 = _v;
            }
            #___private_max_7 = _init_max(this, '');
            get max() {
                return this.#___private_max_7;
            }
            set max(_v) {
                this.#___private_max_7 = _v;
            }
            #___private_locale_8 = _init_locale(this, null);
            get locale() {
                return this.#___private_locale_8;
            }
            set locale(_v) {
                this.#___private_locale_8 = _v;
            }
            #___private_disabled_9 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_9;
            }
            set disabled(_v) {
                this.#___private_disabled_9 = _v;
            }
            #___private_weekNumbers_10 = _init_weekNumbers(this, false);
            get weekNumbers() {
                return this.#___private_weekNumbers_10;
            }
            set weekNumbers(_v) {
                this.#___private_weekNumbers_10 = _v;
            }
            #___private_todayLabel_11 = _init_todayLabel(this, undefined);
            get todayLabel() {
                return this.#___private_todayLabel_11;
            }
            set todayLabel(_v) {
                this.#___private_todayLabel_11 = _v;
            }
            #___private__resolvedLocale_12 = _init__resolvedLocale(this, 'en');
            get _resolvedLocale() {
                return this.#___private__resolvedLocale_12;
            }
            set _resolvedLocale(_v) {
                this.#___private__resolvedLocale_12 = _v;
            }
            #___private__displayValue_13 = _init__displayValue(this, '');
            get _displayValue() {
                return this.#___private__displayValue_13;
            }
            set _displayValue(_v) {
                this.#___private__displayValue_13 = _v;
            }
            #___private__fpInput_14 = _init__fpInput(this);
            get _fpInput() {
                return this.#___private__fpInput_14;
            }
            set _fpInput(_v) {
                this.#___private__fpInput_14 = _v;
            }
            #___private__floatingMenuContainer_15 = _init__floatingMenuContainer(this);
            get _floatingMenuContainer() {
                return this.#___private__floatingMenuContainer_15;
            }
            set _floatingMenuContainer(_v) {
                this.#___private__floatingMenuContainer_15 = _v;
            }
            #___private__inputs_16 = _init__inputs(this);
            get _inputs() {
                return this.#___private__inputs_16;
            }
            set _inputs(_v) {
                this.#___private__inputs_16 = _v;
            }
            /** Light DOM container for flatpickr inline mode to inherit global CSS */ _inlineContainer;
            _initialValue = '';
            #___private_labelPrevMonth_17 = _init_labelPrevMonth(this, undefined);
            get labelPrevMonth() {
                return this.#___private_labelPrevMonth_17;
            }
            set labelPrevMonth(_v) {
                this.#___private_labelPrevMonth_17 = _v;
            }
            #___private_labelNextMonth_18 = _init_labelNextMonth(this, undefined);
            get labelNextMonth() {
                return this.#___private_labelNextMonth_18;
            }
            set labelNextMonth(_v) {
                this.#___private_labelNextMonth_18 = _v;
            }
            #___private_labelSelectMonth_19 = _init_labelSelectMonth(this, undefined);
            get labelSelectMonth() {
                return this.#___private_labelSelectMonth_19;
            }
            set labelSelectMonth(_v) {
                this.#___private_labelSelectMonth_19 = _v;
            }
            #___private_labelSelectYear_20 = _init_labelSelectYear(this, undefined);
            get labelSelectYear() {
                return this.#___private_labelSelectYear_20;
            }
            set labelSelectYear(_v) {
                this.#___private_labelSelectYear_20 = _v;
            }
            _floatingController = new FloatingController(this, {
                reference: ()=>{
                    const primaryInput = this._inputs.find((i)=>i.kind === 'from') || this._inputs[0];
                    return primaryInput ? primaryInput.inputElement : this._fpInput;
                },
                floating: ()=>this._fp?.calendarContainer ?? null,
                hoist: ()=>this.hoist,
                placement: ()=>'bottom-start',
                offset: 4,
                matchWidth: 'none'
            });
            // ── Lifecycle ─────────────────────────────────────────────────────────────
            _getModePluginConfig() {
                return {
                    ariaLabels: {
                        prevMonth: this.labelPrevMonth,
                        nextMonth: this.labelNextMonth,
                        selectMonth: this.labelSelectMonth,
                        selectYear: this.labelSelectYear
                    }
                };
            }
            // ── ValidityMixin hook ─────────────────────────────────────────────────────
            _testValidity() {
                if (this._internals.validity.customError) {
                    return {
                        customError: true
                    };
                }
                if (this.required && !this.value) {
                    const temp = document.createElement('input');
                    temp.required = true;
                    this.validityMessage = temp.validationMessage;
                    return {
                        valueMissing: true
                    };
                }
                if (this.value && (this.min || this.max)) {
                    const dates = [];
                    // Parse this.value directly since flatpickr might silently drop out-of-bounds dates
                    // from its selectedDates array, causing us to miss the validation error.
                    if (this.mode === 'range') {
                        const parts = this.value.split(' to ');
                        if (parts[0]) {
                            const d = new Date(parts[0]);
                            if (!isNaN(d.getTime())) dates.push(d);
                        }
                        if (parts[1]) {
                            const d = new Date(parts[1]);
                            if (!isNaN(d.getTime())) dates.push(d);
                        }
                    } else {
                        const d = new Date(this.value);
                        if (!isNaN(d.getTime())) {
                            dates.push(d);
                        } else if (this._fp) {
                            const parsed = this._fp.parseDate(this.value, this._fp.config.dateFormat);
                            if (parsed) dates.push(parsed);
                        }
                    }
                    if (dates.length === 0 && this.value) {
                        this.validityMessage = 'Please enter a valid date.';
                        return {
                            badInput: true
                        };
                    }
                    if (dates.length > 0) {
                        const first = dates[0];
                        const last = dates[dates.length - 1];
                        if (this.min) {
                            const minDate = new Date(this.min);
                            first.setHours(0, 0, 0, 0);
                            minDate.setHours(0, 0, 0, 0);
                            if (first < minDate) {
                                const temp = document.createElement('input');
                                temp.type = this.mode === 'month' || this.mode === 'month-year' ? 'month' : this.mode === 'week' ? 'week' : 'date';
                                temp.min = this.min;
                                temp.value = '1000-01-01'; // Force underflow to get localized message
                                this.validityMessage = temp.validationMessage;
                                return {
                                    rangeUnderflow: true
                                };
                            }
                        }
                        if (this.max) {
                            const maxDate = new Date(this.max);
                            last.setHours(0, 0, 0, 0);
                            maxDate.setHours(0, 0, 0, 0);
                            if (last > maxDate) {
                                const temp = document.createElement('input');
                                temp.type = this.mode === 'month' || this.mode === 'month-year' ? 'month' : this.mode === 'week' ? 'week' : 'date';
                                temp.max = this.max;
                                temp.value = '9999-12-31'; // Force overflow to get localized message
                                this.validityMessage = temp.validationMessage;
                                return {
                                    rangeOverflow: true
                                };
                            }
                        }
                    }
                }
                return {};
            }
            connectedCallback() {
                super.connectedCallback();
                this._resolvedLocale = resolveLocale(this.locale);
                if (!this.hasUpdated) {
                    this._initialValue = this.value;
                }
                if (this.hasUpdated && !this._fp) {
                    // Re-initialize if the component is detached and re-attached
                    this._setupFlatpickr();
                }
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                if (this._inlineContainer) {
                    this._inlineContainer.remove();
                    this._inlineContainer = undefined;
                }
            }
            // ── Form lifecycle ────────────────────────────────────────────────────────
            formResetCallback() {
                super.formResetCallback();
                this.value = this._initialValue;
                this._internals.setFormValue(this.value);
                if (this._fp) {
                    this._setFpValue(this.value);
                } else if (this._inputs) {
                    this._inputs.forEach((input)=>{
                        input.value = this.value;
                    });
                }
            }
            async firstUpdated(_changedProperties) {
                super.firstUpdated(_changedProperties);
                // Wait for all projected inputs to finish rendering so their internal `inputElement` is available
                if (this._inputs && this._inputs.length > 0) {
                    await Promise.all(this._inputs.map((input)=>input.updateComplete));
                }
                await this._setupFlatpickr();
            }
            async _setupFlatpickr() {
                if (this.flat && !this._inlineContainer) {
                    this._inlineContainer = document.createElement('div');
                    this._inlineContainer.slot = 'inline-container';
                    // Fallback part for styling if needed, though light DOM CSS usually styles it directly
                    this._inlineContainer.part.add('inline-calendar');
                    this.appendChild(this._inlineContainer);
                }
                await this._initFlatpickr(this._buildFpConfig(), this.mode, this._resolvedLocale);
                // Restore value if re-attaching
                if (this.value && this._fp) {
                    this._setFpValue(this.value);
                }
            }
            async updated(changed) {
                super.updated(changed);
                const localeChanged = changed.has('locale');
                const modeChanged = changed.has('mode');
                const minMaxChanged = changed.has('min') || changed.has('max');
                const flatChanged = changed.has('flat');
                const pluginsChanged = changed.has('plugins');
                if (localeChanged) {
                    this._resolvedLocale = resolveLocale(this.locale);
                }
                if (flatChanged) {
                    if (this.flat && !this._inlineContainer) {
                        this._inlineContainer = document.createElement('div');
                        this._inlineContainer.slot = 'inline-container';
                        this._inlineContainer.part.add('inline-calendar');
                        this.appendChild(this._inlineContainer);
                    } else if (!this.flat && this._inlineContainer) {
                        this._inlineContainer.remove();
                        this._inlineContainer = undefined;
                    }
                }
                // Re-init when mode, locale, flat, or plugins change (flatpickr config requires re-init for these)
                if ((localeChanged || modeChanged || flatChanged || pluginsChanged) && this._fp) {
                    await this._initFlatpickr(this._buildFpConfig(), this.mode, this._resolvedLocale);
                    // Restore value when re-initializing
                    if (this.value) {
                        this._setFpValue(this.value);
                    }
                    return;
                }
                if (minMaxChanged) {
                    if (this._fp) {
                        this._fp.set('minDate', this.min || undefined);
                        this._fp.set('maxDate', this.max || undefined);
                    }
                    this._syncValidity();
                }
                if (changed.has('value') && this._fp) {
                    const fpDates = this._fp.selectedDates;
                    const start = fpDates[0] ?? null;
                    const end = fpDates[1] ?? null;
                    if (this.value !== this._buildIsoValue(start, end)) {
                        this._setFpValue(this.value);
                    }
                }
                if (changed.has('disabled') || changed.has('invalid') || changed.has('validityMessage') || changed.has('required')) {
                    if (this._inputs) {
                        this._inputs.forEach((input)=>{
                            input.disabled = this.disabled;
                            input.required = this.required;
                            input.invalid = this.invalid;
                            input.validityMessage = this.validityMessage;
                        });
                    }
                    if (changed.has('disabled') && this._fp) {
                        this._fp.set('clickOpens', !this.disabled);
                    }
                }
            }
            // ── FlatpickrMixin contract ───────────────────────────────────────────────
            _getHiddenInput() {
                return this._fpInput ?? null;
            }
            // ── Public API ────────────────────────────────────────────────────────────
            focus(options) {
                if (this._inputs && this._inputs.length > 0) {
                    this._inputs[0].focus(options);
                } else if (this._fpInput) {
                    this._fpInput.focus(options);
                } else {
                    super.focus(options);
                }
            }
            /** Opens the calendar popup. No-op when flat=true. */ openCalendar() {
                this._fp?.open();
            }
            /** Closes the calendar popup. No-op when flat=true. */ closeCalendar() {
                this._fp?.close();
            }
            /** Clears the selected date(s). */ clear() {
                this._fp?.clear(false);
                this.value = '';
                this._internals.setFormValue('');
                this._inputs.forEach((input)=>{
                    input.value = '';
                });
                this._emitChange([], '');
            }
            // ── Config builder ────────────────────────────────────────────────────────
            _buildFpConfig() {
                // Check if consumers already provided these plugins
                const hasMonthYear = this.plugins.some((p)=>isViPlugin(p) && p.id === 'vi-month-select');
                const hasShadowDomFix = this.plugins.some((p)=>isViPlugin(p) && p.id === 'ViShadowDomPlugin');
                // Construct internal plugins
                const internalPlugins = [];
                if (!hasMonthYear && this.mode !== 'month' && this.mode !== 'month-year') {
                    internalPlugins.push(ViMonthYearPlugin());
                }
                if (!hasShadowDomFix) {
                    internalPlugins.push(ViShadowDomPlugin());
                }
                if (this.mode === 'range') {
                    const toInput = this._inputs.find((i)=>i.kind === 'to');
                    if (toInput) {
                        internalPlugins.push(ViRangePlugin({
                            input: toInput.inputElement
                        }));
                    }
                }
                const primaryInput = this._inputs.find((i)=>i.kind === 'from') || this._inputs[0];
                return {
                    inline: this.flat,
                    mode: this.mode === 'range' ? 'range' : 'single',
                    dateFormat: 'Y-m-d',
                    disableMobile: true,
                    ignoredFocusElements: [
                        this,
                        ...this._inputs,
                        ...this._inputs.map((i)=>i.shadowRoot).filter(Boolean)
                    ],
                    ...this.flat && this._inlineContainer ? {
                        appendTo: this._inlineContainer
                    } : this._floatingMenuContainer ? {
                        appendTo: this._floatingMenuContainer
                    } : {},
                    ...primaryInput && !this.flat ? {
                        positionElement: primaryInput.inputElement
                    } : {},
                    ...!this.flat ? {
                        position: (fp)=>{
                            if (this._fp?.isOpen) {
                                this._floatingController.updatePosition().then(()=>{
                                    if (fp.calendarContainer) {
                                        const placement = fp.calendarContainer.getAttribute('data-placement') || 'bottom';
                                        const isBottom = placement.startsWith('bottom');
                                        fp.calendarContainer.classList.toggle('arrowTop', isBottom);
                                        fp.calendarContainer.classList.toggle('arrowBottom', !isBottom);
                                    }
                                });
                            }
                        }
                    } : {},
                    ...this.min ? {
                        minDate: this.min
                    } : {},
                    ...this.max ? {
                        maxDate: this.max
                    } : {},
                    weekNumbers: this.weekNumbers,
                    plugins: internalPlugins,
                    onReady: (selectedDates, dateStr, instance)=>{
                        if (this.mode === 'date') {
                            this._setupTodayButton(instance);
                        }
                        this._removeFpAria();
                    },
                    onOpen: (selectedDates, dateStr, instance)=>{
                        if (this._inputs) this._inputs.forEach((i)=>i.expanded = true);
                        this._removeFpAria();
                        if (instance.calendarContainer) {
                            instance.calendarContainer.focus();
                        }
                        if (!this.flat) {
                            this._floatingController.start();
                        }
                    },
                    onClose: (selectedDates, dateStr, instance)=>{
                        if (this._inputs) this._inputs.forEach((i)=>i.expanded = false);
                        this._removeFpAria();
                        if (!this.flat) {
                            this._floatingController.stop();
                        }
                        if (!this.flat && this._inputs && this._inputs.length > 0) {
                            const active = document.activeElement;
                            if (active === this || active === document.body || active && instance.calendarContainer?.contains(active)) {
                                const primaryInput = this._inputs.find((i)=>i.kind === 'from') || this._inputs[0];
                                if (primaryInput) {
                                    primaryInput.focus();
                                }
                            }
                        }
                    },
                    onChange: (dates, dateStr, fp)=>{
                        this._onFlatpickrChange(dates, dateStr, fp);
                    }
                };
            }
            _removeFpAria() {
                // Flatpickr blindly attaches ARIA properties to the bound input.
                // Since our bound input is type="hidden", this causes a11y audit failures.
                if (this._fpInput) {
                    this._fpInput.removeAttribute('aria-expanded');
                    this._fpInput.removeAttribute('aria-haspopup');
                    this._fpInput.removeAttribute('readonly');
                }
            }
            // ── Change handler ────────────────────────────────────────────────────────
            _setFpValue(val) {
                if (!this._fp) return;
                let dateToSet = val;
                if (this.mode === 'week' && val) {
                    const parsed = parseISOWeek(val);
                    if (parsed) dateToSet = parsed;
                }
                this._fp.setDate(dateToSet, false);
                this._syncInputValues(this._fp.selectedDates);
            }
            _syncInputValues(dates) {
                const start = dates[0] ?? null;
                const end = dates[1] ?? null;
                if (this.mode !== 'range' || !this._inputs.find((i)=>i.kind === 'to')) {
                    // If single mode, or range mode but no 'to' input provided, sync formatted string to the first input
                    const primaryInput = this._inputs.find((i)=>i.kind === 'from') || this._inputs[0];
                    if (primaryInput) {
                        primaryInput.value = start ? formatDisplay(start, this._resolvedLocale, this.mode, primaryInput.placeholder) : '';
                    }
                } else {
                    // vi-range-plugin handles updating the 'to' input's value, but since we are using custom elements,
                    // it's cleaner to sync them here as well based on lit properties, though vi-range-plugin triggers 'input' event.
                    const fromInput = this._inputs.find((i)=>i.kind === 'from');
                    const toInput = this._inputs.find((i)=>i.kind === 'to');
                    if (fromInput) {
                        fromInput.value = start ? formatDisplay(start, this._resolvedLocale, 'date', fromInput.placeholder) : '';
                    }
                    if (toInput) {
                        toInput.value = end ? formatDisplay(end, this._resolvedLocale, 'date', toInput.placeholder) : '';
                    }
                }
            }
            _onFlatpickrChange(dates, _dateStr, _fp) {
                const start = dates[0] ?? null;
                const end = dates[1] ?? null;
                const isoValue = this._buildIsoValue(start, end) ?? '';
                this.value = isoValue;
                this._syncInputValues(dates);
                let formattedValue = '';
                const fromInput = this._inputs.find((i)=>i.kind === 'from') || this._inputs[0];
                const toInput = this._inputs.find((i)=>i.kind === 'to');
                if (this.mode === 'range' && toInput) {
                    if (fromInput && toInput && start && end) {
                        formattedValue = `${fromInput.value} to ${toInput.value}`;
                    } else if (fromInput && start) {
                        formattedValue = fromInput.value;
                    }
                } else if (fromInput) {
                    formattedValue = fromInput.value;
                }
                this._internals.setFormValue(isoValue);
                this._emitChange(dates, formattedValue);
            }
            _emitChange(dates, formattedValue) {
                const start = dates[0] ?? null;
                const end = dates[1] ?? null;
                const toComponents = (d)=>d ? {
                        day: d.getDate(),
                        month: d.getMonth() + 1,
                        year: d.getFullYear()
                    } : null;
                const detail = {
                    value: this._buildIsoValue(start, end),
                    type: this.mode,
                    isoValue: this._buildIsoValue(start, end),
                    utcIso: start ? new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())).toISOString() : null,
                    formattedValue,
                    rawValue: toComponents(start),
                    rawEndValue: toComponents(end),
                    weekNumber: this.mode === 'week' && start ? getISOWeek(start) : null,
                    locale: this._resolvedLocale,
                    timeZone: resolveTimeZone()
                };
                this.dispatchEvent(new CustomEvent(VIALIQ_CHANGE, {
                    detail,
                    bubbles: true,
                    composed: true
                }));
            }
            _buildIsoValue(start, end) {
                if (!start) return null;
                const fmt = (d)=>`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                switch(this.mode){
                    case 'range':
                        return end ? `${fmt(start)} to ${fmt(end)}` : fmt(start);
                    case 'month':
                    case 'month-year':
                        return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
                    case 'week':
                        {
                            const week = getISOWeek(start);
                            const weekYearDate = new Date(start);
                            const mondayBasedDay = (start.getDay() + 6) % 7;
                            weekYearDate.setDate(start.getDate() - mondayBasedDay + 3);
                            return `${weekYearDate.getFullYear()}-W${String(week).padStart(2, '0')}`;
                        }
                    default:
                        return fmt(start);
                }
            }
            _setupTodayButton(fp) {
                const todayBtn = document.createElement('button');
                todayBtn.type = 'button';
                todayBtn.className = 'vi-calendar-today-btn';
                todayBtn.textContent = this.todayLabel || getTodayLabel(this._resolvedLocale);
                const handleTodayAction = (e)=>{
                    e.stopPropagation();
                    fp.setDate(new Date(), true);
                    fp.close();
                };
                todayBtn.addEventListener('click', handleTodayAction);
                todayBtn.addEventListener('keydown', (e)=>{
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTodayAction(e);
                    }
                });
                const footer = document.createElement('div');
                footer.className = 'vi-calendar-footer';
                footer.appendChild(todayBtn);
                fp.calendarContainer.appendChild(footer);
            }
            async _handleSlotChange() {
                if (this._inputs && this._inputs.length > 0) {
                    await Promise.all(this._inputs.map((input)=>input.updateComplete));
                }
                this._inputs.forEach((input)=>{
                    input.disabled = this.disabled;
                    input.required = this.required;
                    input.invalid = this.invalid;
                    input.validityMessage = this.validityMessage;
                });
                // We should re-init flatpickr to register the range plugin if the 'to' input was just slotted
                if (this._fp) {
                    this._initFlatpickr(this._buildFpConfig(), this.mode, this._resolvedLocale);
                }
            }
            _handleInputsClick(e) {
                if (this.disabled || this.flat || !this._fp) return;
                // Check if the click came from a trigger button inside an input
                const path = e.composedPath();
                const inputWrapper = path.find((node)=>node.tagName?.toLowerCase() === 'vi-date-picker-input');
                if (inputWrapper && inputWrapper.inputElement) {
                    this._fp.config.positionElement = inputWrapper.inputElement;
                    this._fp.open();
                }
            }
            // ── Render ────────────────────────────────────────────────────────────────
            render() {
                return b`
      <!-- Hidden input flatpickr binds to -->
      <input
        type="hidden"
        id="fp-input"
        tabindex="-1"
        aria-hidden="true"
        name="${this.name}"
        .value="${this.value}"
      />

      ${this.flat ? b`<slot name="inline-container"></slot>` : b`
            <div part="control" class="control">
              <div class="inputs-container" @click="${this._handleInputsClick}">
                <slot @slotchange="${this._handleSlotChange}"></slot>
              </div>
              ${this.validityMessage ? b`<span
                    part="validity-message"
                    class="validity-msg"
                    role="alert"
                  >
                    ${this.validityMessage}
                  </span>` : ''}
            </div>
            <div id="floating-menu-container"></div>
          `}

      <slot name="helper"></slot>
    `;
            }
            static styles = i$1`
    ${r(datePickerStyles)}
  `;
        }
    }
}();

const meta = {
    title: 'Components/DatePicker',
    tags: [
        'autodocs'
    ],
    argTypes: {
        onVialiqChange: {
            action: 'vialiq-change'
        },
        mode: {
            control: 'select',
            options: [
                'date',
                'range',
                'month',
                'month-year',
                'week'
            ],
            description: 'Picker mode'
        },
        flat: {
            control: 'boolean',
            description: 'Render inline (no popup trigger button)'
        },
        min: {
            control: 'text',
            description: 'Minimum selectable date (ISO string)'
        },
        max: {
            control: 'text',
            description: 'Maximum selectable date (ISO string)'
        },
        locale: {
            control: 'select',
            options: [
                'en',
                'de-DE',
                'fr-FR',
                'zh-CN',
                'ja',
                'ar',
                'ko',
                'nl',
                'es-ES',
                'pt-BR'
            ],
            description: 'BCP 47 locale tag — affects calendar labels and segment order'
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the picker'
        },
        required: {
            control: 'boolean',
            description: 'Marks the field as required'
        },
        weekNumbers: {
            control: 'boolean',
            description: 'Show ISO week numbers in the calendar'
        },
        status: {
            control: 'select',
            options: [
                'default',
                'valid',
                'invalid'
            ],
            description: 'Visual validation state'
        },
        validityMessage: {
            control: 'text',
            description: 'Validation error message shown below the trigger'
        },
        name: {
            control: 'text',
            description: 'Form field name'
        }
    }
};
const render = ({ mode, flat, min, max, locale, disabled, required, weekNumbers, status, validityMessage, name, value, onVialiqChange })=>b`
  <div style="padding: 1.5rem; font-family: sans-serif;">
    <vi-date-picker
      mode=${mode}
      ?flat=${flat}
      ?disabled=${disabled}
      ?required=${required}
      ?week-numbers=${weekNumbers}
      status=${status}
      .validityMessage=${validityMessage}
      name=${name}
      value=${value || ''}
      locale=${locale || ''}
      min=${min || ''}
      max=${max || ''}
      @vialiq-change=${(e)=>onVialiqChange?.(e.detail)}
    >
      ${mode === 'range' ? b`
            <vi-date-picker-input
              kind="from"
              label="Start Date"
              placeholder="yyyy-mm-dd"
            ></vi-date-picker-input>
            <vi-date-picker-input
              kind="to"
              label="End Date"
              placeholder="yyyy-mm-dd"
            ></vi-date-picker-input>
          ` : b`
            <vi-date-picker-input
              label="Select a Date"
              placeholder="yyyy-mm-dd"
            ></vi-date-picker-input>
          `}
    </vi-date-picker>
  </div>
`;
const defaultArgs = {
    mode: 'date',
    flat: false,
    min: '',
    max: '',
    locale: 'en',
    disabled: false,
    required: false,
    weekNumbers: false,
    status: 'default',
    validityMessage: '',
    name: 'date'
};
// ── Stories ────────────────────────────────────────────────────────────────
const Default = {
    name: 'Date Picker (default)',
    args: {
        ...defaultArgs
    },
    render
};
const RangeMode = {
    name: 'Range Mode',
    parameters: {
        docs: {
            description: {
                story: 'Allows the user to select a start and end date. `vialiq-change` detail includes both `rawValue` and `rawEndValue`.'
            }
        }
    },
    args: {
        ...defaultArgs,
        mode: 'range',
        name: 'daterange'
    },
    render
};
const MonthMode = {
    name: 'Month Mode',
    parameters: {
        docs: {
            description: {
                story: 'Select only a month and year.'
            }
        }
    },
    args: {
        ...defaultArgs,
        mode: 'month',
        name: 'datemonth'
    },
    render: (args)=>b`
    <div style="padding: 1.5rem; font-family: sans-serif;">
      <vi-date-picker
        mode=${args.mode}
        ?flat=${args.flat}
        ?disabled=${args.disabled}
        ?required=${args.required}
        ?week-numbers=${args.weekNumbers}
        status=${args.status}
        .validityMessage=${args.validityMessage}
        name=${args.name}
        locale=${args.locale || ''}
        min=${args.min || ''}
        max=${args.max || ''}
        @vialiq-change=${(e)=>args.onVialiqChange?.(e.detail)}
      >
        <vi-date-picker-input
          label="Select a Month"
          placeholder="YM"
        ></vi-date-picker-input>
      </vi-date-picker>
    </div>
  `
};
const WeekMode = {
    name: 'Week Mode',
    parameters: {
        docs: {
            description: {
                story: 'Select an entire week.'
            }
        }
    },
    args: {
        ...defaultArgs,
        mode: 'week',
        name: 'dateweek'
    },
    render
};
const WithMinMax = {
    name: 'Min / Max Constraints',
    parameters: {
        docs: {
            description: {
                story: 'Dates outside the min/max range are greyed out and unselectable.'
            }
        }
    },
    args: {
        ...defaultArgs,
        min: new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10),
        // 7 days ago
        max: new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10),
        // 14 days from now
        name: 'constrained-date'
    },
    render
};
const WithWeekNumbers = {
    name: 'With ISO Week Numbers',
    args: {
        ...defaultArgs,
        weekNumbers: true,
        name: 'week-date'
    },
    render
};
const ProgrammaticRange = {
    name: 'Programmatic Range',
    parameters: {
        docs: {
            description: {
                story: 'The range can be set programmatically by setting the `value` property to a string in the format `YYYY-MM-DD to YYYY-MM-DD`.'
            }
        }
    },
    args: {
        ...defaultArgs,
        mode: 'range',
        name: 'programmatic-range'
    },
    render: (args)=>{
        const setLast7Days = (e)=>{
            const picker = e.target.parentElement?.parentElement?.querySelector('vi-date-picker');
            if (picker) {
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - 7);
                const fmt = (d)=>d.toISOString().slice(0, 10);
                picker.value = `${fmt(start)} to ${fmt(end)}`;
            }
        };
        return b`
      <div style="padding: 1.5rem; font-family: sans-serif;">
        <div style="margin-bottom: 1.5rem; display: flex; gap: 0.5rem;">
          <button
            @click=${setLast7Days}
            style="padding: 0.5rem 1rem; cursor: pointer; border-radius: 4px; border: 1px solid #d1d5db; background: #fff;"
          >
            Set Last 7 Days
          </button>
          <button
            @click=${(e)=>{
            const picker = e.target.parentElement?.parentElement?.querySelector('vi-date-picker');
            if (picker) picker.value = '';
        }}
            style="padding: 0.5rem 1rem; cursor: pointer; border-radius: 4px; border: 1px solid #d1d5db; background: #fff;"
          >
            Clear Range
          </button>
        </div>
        <vi-date-picker
          mode=${args.mode}
          ?flat=${args.flat}
          ?disabled=${args.disabled}
          ?required=${args.required}
          name=${args.name}
          @vialiq-change=${(e)=>args.onVialiqChange?.(e.detail)}
        >
          <vi-date-picker-input
            kind="from"
            label="Start Date"
            placeholder="yyyy-mm-dd"
          ></vi-date-picker-input>
          <vi-date-picker-input
            kind="to"
            label="End Date"
            placeholder="yyyy-mm-dd"
          ></vi-date-picker-input>
        </vi-date-picker>
      </div>
    `;
    }
};
const FlatInline = {
    name: 'Flat / Inline Calendar',
    parameters: {
        docs: {
            description: {
                story: 'When `flat` is set, the calendar renders inline without a trigger button.'
            }
        }
    },
    args: {
        ...defaultArgs,
        flat: true,
        name: 'inline-date'
    },
    render
};
const LocaleDeDE = {
    name: 'Locale: de-DE (German)',
    parameters: {
        docs: {
            description: {
                story: 'Calendar labels are rendered in German.'
            }
        }
    },
    args: {
        ...defaultArgs,
        locale: 'de-DE',
        name: 'date-de'
    },
    render
};
const LocaleFrFR = {
    name: 'Locale: fr-FR (French)',
    args: {
        ...defaultArgs,
        locale: 'fr-FR',
        name: 'date-fr'
    },
    render
};
const LocaleZhCN = {
    name: 'Locale: zh-CN (Chinese Simplified)',
    args: {
        ...defaultArgs,
        locale: 'zh-CN',
        name: 'date-zh'
    },
    render
};
const Disabled = {
    name: 'Disabled State',
    args: {
        ...defaultArgs,
        disabled: true,
        name: 'disabled-date'
    },
    render
};
const InvalidState = {
    name: 'Invalid State',
    parameters: {
        docs: {
            description: {
                story: 'Shows a red border and an error message below the trigger.'
            }
        }
    },
    args: {
        ...defaultArgs,
        status: 'invalid',
        validityMessage: 'Please select a valid date.',
        name: 'invalid-date'
    },
    render
};
const Playground = {
    name: '🎛️ Playground',
    parameters: {
        docs: {
            description: {
                story: 'All controls are editable. Use the Controls panel to explore all prop combinations.'
            }
        }
    },
    args: {
        ...defaultArgs,
        mode: 'date',
        locale: 'en'
    },
    render
};
const ProgrammaticValueUpdate = {
    name: 'Programmatic Value Update',
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates updating the `value` property programmatically. The `value` property should always be passed as an ISO 8601 string, regardless of the active locale or display format. Accepted formats based on `mode`:\n\n- `date`: `YYYY-MM-DD`\n- `month` / `month-year`: `YYYY-MM`\n- `week`: `YYYY-Www`\n- `range`: `YYYY-MM-DD to YYYY-MM-DD`'
            }
        }
    },
    args: {
        ...defaultArgs,
        value: '2026-10-12',
        name: 'programmatic-date'
    },
    render: (args)=>b`
    <div style="padding: 1.5rem; font-family: sans-serif;">
      <vi-date-picker
        id="prog-picker"
        mode=${args.mode}
        value=${args.value || ''}
        locale=${args.locale || 'en'}
        @vialiq-change=${(e)=>args.onVialiqChange?.(e.detail)}
      >
        <vi-date-picker-input
          label="Select a Date"
          placeholder="yyyy-mm-dd"
        ></vi-date-picker-input>
      </vi-date-picker>

      <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
        <button
          @click=${()=>document.querySelector('#prog-picker').value = '2025-01-01'}
        >
          Set to 2025-01-01
        </button>
        <button
          @click=${()=>document.querySelector('#prog-picker').value = '2027-12-31'}
        >
          Set to 2027-12-31
        </button>
        <button
          @click=${()=>document.querySelector('#prog-picker').value = ''}
        >
          Clear Value
        </button>
      </div>
    </div>
  `
};
const Hoisting = {
    render: (_args)=>b`
    <div
      style="height: 150px; overflow: hidden; border: 2px dashed red; padding: 20px;"
    >
      <p style="margin-bottom: 20px;">
        This container has <code>overflow: hidden</code>. The calendar should
        escape it when hoisted.
      </p>
      <vi-date-picker .hoist=${true}>
        <vi-date-picker-input></vi-date-picker-input>
      </vi-date-picker>
    </div>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Date Picker (default)',\n  args: {\n    ...defaultArgs\n  },\n  render\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
RangeMode.parameters = {
    ...RangeMode.parameters,
    docs: {
        ...RangeMode.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Range Mode',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Allows the user to select a start and end date. `vialiq-change` detail includes both `rawValue` and `rawEndValue`.'\n      }\n    }\n  },\n  args: {\n    ...defaultArgs,\n    mode: 'range',\n    name: 'daterange'\n  },\n  render\n}",
            ...RangeMode.parameters?.docs?.source
        }
    }
};
MonthMode.parameters = {
    ...MonthMode.parameters,
    docs: {
        ...MonthMode.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Month Mode',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Select only a month and year.'\n      }\n    }\n  },\n  args: {\n    ...defaultArgs,\n    mode: 'month',\n    name: 'datemonth'\n  },\n  render: args => html`\n    <div style=\"padding: 1.5rem; font-family: sans-serif;\">\n      <vi-date-picker\n        mode=${args.mode}\n        ?flat=${args.flat}\n        ?disabled=${args.disabled}\n        ?required=${args.required}\n        ?week-numbers=${args.weekNumbers}\n        status=${args.status}\n        .validityMessage=${args.validityMessage}\n        name=${args.name}\n        locale=${args.locale || ''}\n        min=${args.min || ''}\n        max=${args.max || ''}\n        @vialiq-change=${(e: CustomEvent) => args.onVialiqChange?.(e.detail)}\n      >\n        <vi-date-picker-input\n          label=\"Select a Month\"\n          placeholder=\"YM\"\n        ></vi-date-picker-input>\n      </vi-date-picker>\n    </div>\n  `\n}",
            ...MonthMode.parameters?.docs?.source
        }
    }
};
WeekMode.parameters = {
    ...WeekMode.parameters,
    docs: {
        ...WeekMode.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Week Mode',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Select an entire week.'\n      }\n    }\n  },\n  args: {\n    ...defaultArgs,\n    mode: 'week',\n    name: 'dateweek'\n  },\n  render\n}",
            ...WeekMode.parameters?.docs?.source
        }
    }
};
WithMinMax.parameters = {
    ...WithMinMax.parameters,
    docs: {
        ...WithMinMax.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Min / Max Constraints',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Dates outside the min/max range are greyed out and unselectable.'\n      }\n    }\n  },\n  args: {\n    ...defaultArgs,\n    min: new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10),\n    // 7 days ago\n    max: new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10),\n    // 14 days from now\n    name: 'constrained-date'\n  },\n  render\n}",
            ...WithMinMax.parameters?.docs?.source
        }
    }
};
WithWeekNumbers.parameters = {
    ...WithWeekNumbers.parameters,
    docs: {
        ...WithWeekNumbers.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'With ISO Week Numbers',\n  args: {\n    ...defaultArgs,\n    weekNumbers: true,\n    name: 'week-date'\n  },\n  render\n}",
            ...WithWeekNumbers.parameters?.docs?.source
        }
    }
};
ProgrammaticRange.parameters = {
    ...ProgrammaticRange.parameters,
    docs: {
        ...ProgrammaticRange.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Programmatic Range',\n  parameters: {\n    docs: {\n      description: {\n        story: 'The range can be set programmatically by setting the `value` property to a string in the format `YYYY-MM-DD to YYYY-MM-DD`.'\n      }\n    }\n  },\n  args: {\n    ...defaultArgs,\n    mode: 'range',\n    name: 'programmatic-range'\n  },\n  render: args => {\n    const setLast7Days = (e: Event) => {\n      const picker = (e.target as HTMLElement).parentElement?.parentElement?.querySelector('vi-date-picker');\n      if (picker) {\n        const end = new Date();\n        const start = new Date();\n        start.setDate(end.getDate() - 7);\n        const fmt = (d: Date) => d.toISOString().slice(0, 10);\n        picker.value = `${fmt(start)} to ${fmt(end)}`;\n      }\n    };\n    return html`\n      <div style=\"padding: 1.5rem; font-family: sans-serif;\">\n        <div style=\"margin-bottom: 1.5rem; display: flex; gap: 0.5rem;\">\n          <button\n            @click=${setLast7Days}\n            style=\"padding: 0.5rem 1rem; cursor: pointer; border-radius: 4px; border: 1px solid #d1d5db; background: #fff;\"\n          >\n            Set Last 7 Days\n          </button>\n          <button\n            @click=${(e: Event) => {\n      const picker = (e.target as HTMLElement).parentElement?.parentElement?.querySelector('vi-date-picker');\n      if (picker) picker.value = '';\n    }}\n            style=\"padding: 0.5rem 1rem; cursor: pointer; border-radius: 4px; border: 1px solid #d1d5db; background: #fff;\"\n          >\n            Clear Range\n          </button>\n        </div>\n        <vi-date-picker\n          mode=${args.mode}\n          ?flat=${args.flat}\n          ?disabled=${args.disabled}\n          ?required=${args.required}\n          name=${args.name}\n          @vialiq-change=${(e: CustomEvent) => args.onVialiqChange?.(e.detail)}\n        >\n          <vi-date-picker-input\n            kind=\"from\"\n            label=\"Start Date\"\n            placeholder=\"yyyy-mm-dd\"\n          ></vi-date-picker-input>\n          <vi-date-picker-input\n            kind=\"to\"\n            label=\"End Date\"\n            placeholder=\"yyyy-mm-dd\"\n          ></vi-date-picker-input>\n        </vi-date-picker>\n      </div>\n    `;\n  }\n}",
            ...ProgrammaticRange.parameters?.docs?.source
        }
    }
};
FlatInline.parameters = {
    ...FlatInline.parameters,
    docs: {
        ...FlatInline.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Flat / Inline Calendar',\n  parameters: {\n    docs: {\n      description: {\n        story: 'When `flat` is set, the calendar renders inline without a trigger button.'\n      }\n    }\n  },\n  args: {\n    ...defaultArgs,\n    flat: true,\n    name: 'inline-date'\n  },\n  render\n}",
            ...FlatInline.parameters?.docs?.source
        }
    }
};
LocaleDeDE.parameters = {
    ...LocaleDeDE.parameters,
    docs: {
        ...LocaleDeDE.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Locale: de-DE (German)',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Calendar labels are rendered in German.'\n      }\n    }\n  },\n  args: {\n    ...defaultArgs,\n    locale: 'de-DE',\n    name: 'date-de'\n  },\n  render\n}",
            ...LocaleDeDE.parameters?.docs?.source
        }
    }
};
LocaleFrFR.parameters = {
    ...LocaleFrFR.parameters,
    docs: {
        ...LocaleFrFR.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Locale: fr-FR (French)',\n  args: {\n    ...defaultArgs,\n    locale: 'fr-FR',\n    name: 'date-fr'\n  },\n  render\n}",
            ...LocaleFrFR.parameters?.docs?.source
        }
    }
};
LocaleZhCN.parameters = {
    ...LocaleZhCN.parameters,
    docs: {
        ...LocaleZhCN.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Locale: zh-CN (Chinese Simplified)',\n  args: {\n    ...defaultArgs,\n    locale: 'zh-CN',\n    name: 'date-zh'\n  },\n  render\n}",
            ...LocaleZhCN.parameters?.docs?.source
        }
    }
};
Disabled.parameters = {
    ...Disabled.parameters,
    docs: {
        ...Disabled.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Disabled State',\n  args: {\n    ...defaultArgs,\n    disabled: true,\n    name: 'disabled-date'\n  },\n  render\n}",
            ...Disabled.parameters?.docs?.source
        }
    }
};
InvalidState.parameters = {
    ...InvalidState.parameters,
    docs: {
        ...InvalidState.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Invalid State',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Shows a red border and an error message below the trigger.'\n      }\n    }\n  },\n  args: {\n    ...defaultArgs,\n    status: 'invalid',\n    validityMessage: 'Please select a valid date.',\n    name: 'invalid-date'\n  },\n  render\n}",
            ...InvalidState.parameters?.docs?.source
        }
    }
};
Playground.parameters = {
    ...Playground.parameters,
    docs: {
        ...Playground.parameters?.docs,
        source: {
            originalSource: "{\n  name: '\uD83C\uDF9B\uFE0F Playground',\n  parameters: {\n    docs: {\n      description: {\n        story: 'All controls are editable. Use the Controls panel to explore all prop combinations.'\n      }\n    }\n  },\n  args: {\n    ...defaultArgs,\n    mode: 'date',\n    locale: 'en'\n  },\n  render\n}",
            ...Playground.parameters?.docs?.source
        }
    }
};
ProgrammaticValueUpdate.parameters = {
    ...ProgrammaticValueUpdate.parameters,
    docs: {
        ...ProgrammaticValueUpdate.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Programmatic Value Update',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Demonstrates updating the `value` property programmatically. The `value` property should always be passed as an ISO 8601 string, regardless of the active locale or display format. Accepted formats based on `mode`:\\n\\n- `date`: `YYYY-MM-DD`\\n- `month` / `month-year`: `YYYY-MM`\\n- `week`: `YYYY-Www`\\n- `range`: `YYYY-MM-DD to YYYY-MM-DD`'\n      }\n    }\n  },\n  args: {\n    ...defaultArgs,\n    value: '2026-10-12',\n    name: 'programmatic-date'\n  },\n  render: args => html`\n    <div style=\"padding: 1.5rem; font-family: sans-serif;\">\n      <vi-date-picker\n        id=\"prog-picker\"\n        mode=${args.mode}\n        value=${args.value || ''}\n        locale=${args.locale || 'en'}\n        @vialiq-change=${(e: CustomEvent) => args.onVialiqChange?.(e.detail)}\n      >\n        <vi-date-picker-input\n          label=\"Select a Date\"\n          placeholder=\"yyyy-mm-dd\"\n        ></vi-date-picker-input>\n      </vi-date-picker>\n\n      <div style=\"margin-top: 1rem; display: flex; gap: 0.5rem;\">\n        <button\n          @click=${() => (document.querySelector('#prog-picker') as HTMLInputElement).value = '2025-01-01'}\n        >\n          Set to 2025-01-01\n        </button>\n        <button\n          @click=${() => (document.querySelector('#prog-picker') as HTMLInputElement).value = '2027-12-31'}\n        >\n          Set to 2027-12-31\n        </button>\n        <button\n          @click=${() => (document.querySelector('#prog-picker') as HTMLInputElement).value = ''}\n        >\n          Clear Value\n        </button>\n      </div>\n    </div>\n  `\n}",
            ...ProgrammaticValueUpdate.parameters?.docs?.source
        }
    }
};
Hoisting.parameters = {
    ...Hoisting.parameters,
    docs: {
        ...Hoisting.parameters?.docs,
        source: {
            originalSource: "{\n  render: _args => html`\n    <div\n      style=\"height: 150px; overflow: hidden; border: 2px dashed red; padding: 20px;\"\n    >\n      <p style=\"margin-bottom: 20px;\">\n        This container has <code>overflow: hidden</code>. The calendar should\n        escape it when hoisted.\n      </p>\n      <vi-date-picker .hoist=${true}>\n        <vi-date-picker-input></vi-date-picker-input>\n      </vi-date-picker>\n    </div>\n  `\n}",
            ...Hoisting.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","RangeMode","MonthMode","WeekMode","WithMinMax","WithWeekNumbers","ProgrammaticRange","FlatInline","LocaleDeDE","LocaleFrFR","LocaleZhCN","Disabled","InvalidState","Playground","ProgrammaticValueUpdate","Hoisting"];

export { Default, Disabled, FlatInline, Hoisting, InvalidState, LocaleDeDE, LocaleFrFR, LocaleZhCN, MonthMode, Playground, ProgrammaticRange, ProgrammaticValueUpdate, RangeMode, WeekMode, WithMinMax, WithWeekNumbers, __namedExportsOrder, meta as default };
