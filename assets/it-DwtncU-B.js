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

var it$3 = {exports: {}};

var it$2 = it$3.exports;

var hasRequiredIt;

function requireIt () {
	if (hasRequiredIt) return it$3.exports;
	hasRequiredIt = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  factory(exports$1) ;
		}(it$2, (function (exports$1) {
		  var fp = typeof window !== "undefined" && window.flatpickr !== undefined
		      ? window.flatpickr
		      : {
		          l10ns: {},
		      };
		  var Italian = {
		      weekdays: {
		          shorthand: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
		          longhand: [
		              "Domenica",
		              "Lunedì",
		              "Martedì",
		              "Mercoledì",
		              "Giovedì",
		              "Venerdì",
		              "Sabato",
		          ],
		      },
		      months: {
		          shorthand: [
		              "Gen",
		              "Feb",
		              "Mar",
		              "Apr",
		              "Mag",
		              "Giu",
		              "Lug",
		              "Ago",
		              "Set",
		              "Ott",
		              "Nov",
		              "Dic",
		          ],
		          longhand: [
		              "Gennaio",
		              "Febbraio",
		              "Marzo",
		              "Aprile",
		              "Maggio",
		              "Giugno",
		              "Luglio",
		              "Agosto",
		              "Settembre",
		              "Ottobre",
		              "Novembre",
		              "Dicembre",
		          ],
		      },
		      firstDayOfWeek: 1,
		      ordinal: function () { return "°"; },
		      rangeSeparator: " al ",
		      weekAbbreviation: "Se",
		      scrollTitle: "Scrolla per aumentare",
		      toggleTitle: "Clicca per cambiare",
		      time_24hr: true,
		  };
		  fp.l10ns.it = Italian;
		  var it = fp.l10ns;

		  exports$1.Italian = Italian;
		  exports$1.default = it;

		  Object.defineProperty(exports$1, '__esModule', { value: true });

		}))); 
	} (it$3, it$3.exports));
	return it$3.exports;
}

var itExports = requireIt();
const it = /*@__PURE__*/getDefaultExportFromCjs(itExports);

const it$1 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: it
}, [itExports]);

export { it$1 as i };
