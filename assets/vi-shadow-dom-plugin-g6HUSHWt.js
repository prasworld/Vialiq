const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./ar-CxJaMXAO.js","./_commonjsHelpers-BFTU3MAI.js","./de-CGMFHHHZ.js","./es-FqesSBly.js","./fr-D02mQ4z8.js","./it-DtoiGUfB.js","./ja-16-6IS1_.js","./ko-BAUu4Xzd.js","./nl-DQgoORF9.js","./pt-B4wzlclC.js","./zh-DAW2IPWy.js","./vi-month-year-plugin-BSTqk3vR.js","./vi-select-DH2Bv5fr.js","./iframe-uoEhHf4u.js","./preload-helper-D5QYaGzd.js","./iframe-CEyBKce_.css","./vi-element-Du0clqr8.js","./state-DnAJ4lzN.js","./query-CHb9Ft_d.js","./base-Cl6v8-BZ.js","./focusable-mixin-DkKvOjpm.js","./validity-mixin-VBcRRStw.js","./if-non-empty-C-_R0cOl.js","./if-defined-Cm45hJyG.js","./vi-icon-DCNjtJZo.js","./directive-BKuZRRPO.js","./registry-CeXOZkT9.js","./chevron-down-BU8Kh4z3.js","./x-3JmBhc9n.js","./floating-controller-d7XvEPSf.js","./floating-ui.dom-Dsl7AwNm.js","./overlay-manager-DiQwTjfQ.js","./keyboard-controller-DwAzd1K9.js","./check-D9SDO18H.js","./weekSelect-CsV0Zbmq.js"])))=>i.map(i=>d[i]);
import { _ as __vitePreload } from './preload-helper-D5QYaGzd.js';
import { n } from './vi-element-Du0clqr8.js';

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
    ar: ()=>loadL10n(()=>__vitePreload(() => import('./ar-CxJaMXAO.js').then(n => n.a),true              ?__vite__mapDeps([0,1]):void 0,import.meta.url)),
    de: ()=>loadL10n(()=>__vitePreload(() => import('./de-CGMFHHHZ.js').then(n => n.d),true              ?__vite__mapDeps([2,1]):void 0,import.meta.url)),
    'de-DE': ()=>loadL10n(()=>__vitePreload(() => import('./de-CGMFHHHZ.js').then(n => n.d),true              ?__vite__mapDeps([2,1]):void 0,import.meta.url)),
    es: ()=>loadL10n(()=>__vitePreload(() => import('./es-FqesSBly.js').then(n => n.e),true              ?__vite__mapDeps([3,1]):void 0,import.meta.url)),
    'es-ES': ()=>loadL10n(()=>__vitePreload(() => import('./es-FqesSBly.js').then(n => n.e),true              ?__vite__mapDeps([3,1]):void 0,import.meta.url)),
    fr: ()=>loadL10n(()=>__vitePreload(() => import('./fr-D02mQ4z8.js').then(n => n.f),true              ?__vite__mapDeps([4,1]):void 0,import.meta.url)),
    'fr-FR': ()=>loadL10n(()=>__vitePreload(() => import('./fr-D02mQ4z8.js').then(n => n.f),true              ?__vite__mapDeps([4,1]):void 0,import.meta.url)),
    it: ()=>loadL10n(()=>__vitePreload(() => import('./it-DtoiGUfB.js').then(n => n.i),true              ?__vite__mapDeps([5,1]):void 0,import.meta.url)),
    ja: ()=>loadL10n(()=>__vitePreload(() => import('./ja-16-6IS1_.js').then(n => n.j),true              ?__vite__mapDeps([6,1]):void 0,import.meta.url)),
    ko: ()=>loadL10n(()=>__vitePreload(() => import('./ko-BAUu4Xzd.js').then(n => n.k),true              ?__vite__mapDeps([7,1]):void 0,import.meta.url)),
    nl: ()=>loadL10n(()=>__vitePreload(() => import('./nl-DQgoORF9.js').then(n => n.n),true              ?__vite__mapDeps([8,1]):void 0,import.meta.url)),
    'pt-BR': ()=>loadL10n(()=>__vitePreload(() => import('./pt-B4wzlclC.js').then(n => n.p),true              ?__vite__mapDeps([9,1]):void 0,import.meta.url)),
    pt: ()=>loadL10n(()=>__vitePreload(() => import('./pt-B4wzlclC.js').then(n => n.p),true              ?__vite__mapDeps([9,1]):void 0,import.meta.url)),
    'zh-CN': ()=>loadL10n(()=>__vitePreload(() => import('./zh-DAW2IPWy.js').then(n => n.z),true              ?__vite__mapDeps([10,1]):void 0,import.meta.url)),
    zh: ()=>loadL10n(()=>__vitePreload(() => import('./zh-DAW2IPWy.js').then(n => n.z),true              ?__vite__mapDeps([10,1]):void 0,import.meta.url))
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
        const mod = await __vitePreload(() => import('./vi-month-year-plugin-BSTqk3vR.js'),true              ?__vite__mapDeps([11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33]):void 0,import.meta.url);
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
        const mod = await __vitePreload(() => import('./vi-month-year-plugin-BSTqk3vR.js'),true              ?__vite__mapDeps([11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33]):void 0,import.meta.url);
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
        const mod = await __vitePreload(() => import('./weekSelect-CsV0Zbmq.js').then(n => n.w),true              ?__vite__mapDeps([34,1]):void 0,import.meta.url);
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
    }
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
            ({ e: [_init_plugins, _initProto] } = _apply_decs_2203_r(this, [
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

export { FlatpickrMixin as F, ViShadowDomPlugin as V, resolveTimeZone as a, formatDisplay as f, getTodayLabel as g, isViPlugin as i, loadLocale as l, resolveLocale as r };
