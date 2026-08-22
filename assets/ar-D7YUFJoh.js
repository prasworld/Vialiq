import { g as getDefaultExportFromCjs } from './_commonjsHelpers-B85MJLTf.js';

function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== 'string' && !Array.isArray(e)) { for (const k in e) {
      if (k !== 'default' && !(k in n)) {
        const d = Object.getOwnPropertyDescriptor(e, k);
        if (d) {
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    } }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: 'Module' }));
}

var ar$3 = {exports: {}};

var ar$2 = ar$3.exports;

var hasRequiredAr;

function requireAr () {
	if (hasRequiredAr) return ar$3.exports;
	hasRequiredAr = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  factory(exports$1) ;
		}(ar$2, (function (exports$1) {
		  var fp = typeof window !== "undefined" && window.flatpickr !== undefined
		      ? window.flatpickr
		      : {
		          l10ns: {},
		      };
		  var Arabic = {
		      weekdays: {
		          shorthand: ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
		          longhand: [
		              "الأحد",
		              "الاثنين",
		              "الثلاثاء",
		              "الأربعاء",
		              "الخميس",
		              "الجمعة",
		              "السبت",
		          ],
		      },
		      months: {
		          shorthand: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
		          longhand: [
		              "يناير",
		              "فبراير",
		              "مارس",
		              "أبريل",
		              "مايو",
		              "يونيو",
		              "يوليو",
		              "أغسطس",
		              "سبتمبر",
		              "أكتوبر",
		              "نوفمبر",
		              "ديسمبر",
		          ],
		      },
		      firstDayOfWeek: 6,
		      rangeSeparator: " إلى ",
		      weekAbbreviation: "Wk",
		      scrollTitle: "قم بالتمرير للزيادة",
		      toggleTitle: "اضغط للتبديل",
		      amPM: ["ص", "م"],
		      yearAriaLabel: "سنة",
		      monthAriaLabel: "شهر",
		      hourAriaLabel: "ساعة",
		      minuteAriaLabel: "دقيقة",
		      time_24hr: false,
		  };
		  fp.l10ns.ar = Arabic;
		  var ar = fp.l10ns;

		  exports$1.Arabic = Arabic;
		  exports$1.default = ar;

		  Object.defineProperty(exports$1, '__esModule', { value: true });

		}))); 
	} (ar$3, ar$3.exports));
	return ar$3.exports;
}

var arExports = requireAr();
const ar = /*@__PURE__*/getDefaultExportFromCjs(arExports);

const ar$1 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: ar
}, [arExports]);

export { ar$1 as a };
