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

var nl$3 = {exports: {}};

var nl$2 = nl$3.exports;

var hasRequiredNl;

function requireNl () {
	if (hasRequiredNl) return nl$3.exports;
	hasRequiredNl = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  factory(exports$1) ;
		}(nl$2, (function (exports$1) {
		  var fp = typeof window !== "undefined" && window.flatpickr !== undefined
		      ? window.flatpickr
		      : {
		          l10ns: {},
		      };
		  var Dutch = {
		      weekdays: {
		          shorthand: ["zo", "ma", "di", "wo", "do", "vr", "za"],
		          longhand: [
		              "zondag",
		              "maandag",
		              "dinsdag",
		              "woensdag",
		              "donderdag",
		              "vrijdag",
		              "zaterdag",
		          ],
		      },
		      months: {
		          shorthand: [
		              "jan",
		              "feb",
		              "mrt",
		              "apr",
		              "mei",
		              "jun",
		              "jul",
		              "aug",
		              "sept",
		              "okt",
		              "nov",
		              "dec",
		          ],
		          longhand: [
		              "januari",
		              "februari",
		              "maart",
		              "april",
		              "mei",
		              "juni",
		              "juli",
		              "augustus",
		              "september",
		              "oktober",
		              "november",
		              "december",
		          ],
		      },
		      firstDayOfWeek: 1,
		      weekAbbreviation: "wk",
		      rangeSeparator: " t/m ",
		      scrollTitle: "Scroll voor volgende / vorige",
		      toggleTitle: "Klik om te wisselen",
		      time_24hr: true,
		      ordinal: function (nth) {
		          if (nth === 1 || nth === 8 || nth >= 20)
		              return "ste";
		          return "de";
		      },
		  };
		  fp.l10ns.nl = Dutch;
		  var nl = fp.l10ns;

		  exports$1.Dutch = Dutch;
		  exports$1.default = nl;

		  Object.defineProperty(exports$1, '__esModule', { value: true });

		}))); 
	} (nl$3, nl$3.exports));
	return nl$3.exports;
}

var nlExports = requireNl();
const nl = /*@__PURE__*/getDefaultExportFromCjs(nlExports);

const nl$1 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: nl
}, [nlExports]);

export { nl$1 as n };
