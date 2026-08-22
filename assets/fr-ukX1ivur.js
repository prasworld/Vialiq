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

var fr$3 = {exports: {}};

var fr$2 = fr$3.exports;

var hasRequiredFr;

function requireFr () {
	if (hasRequiredFr) return fr$3.exports;
	hasRequiredFr = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  factory(exports$1) ;
		}(fr$2, (function (exports$1) {
		  var fp = typeof window !== "undefined" && window.flatpickr !== undefined
		      ? window.flatpickr
		      : {
		          l10ns: {},
		      };
		  var French = {
		      firstDayOfWeek: 1,
		      weekdays: {
		          shorthand: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
		          longhand: [
		              "dimanche",
		              "lundi",
		              "mardi",
		              "mercredi",
		              "jeudi",
		              "vendredi",
		              "samedi",
		          ],
		      },
		      months: {
		          shorthand: [
		              "janv",
		              "févr",
		              "mars",
		              "avr",
		              "mai",
		              "juin",
		              "juil",
		              "août",
		              "sept",
		              "oct",
		              "nov",
		              "déc",
		          ],
		          longhand: [
		              "janvier",
		              "février",
		              "mars",
		              "avril",
		              "mai",
		              "juin",
		              "juillet",
		              "août",
		              "septembre",
		              "octobre",
		              "novembre",
		              "décembre",
		          ],
		      },
		      ordinal: function (nth) {
		          if (nth > 1)
		              return "";
		          return "er";
		      },
		      rangeSeparator: " au ",
		      weekAbbreviation: "Sem",
		      scrollTitle: "Défiler pour augmenter la valeur",
		      toggleTitle: "Cliquer pour basculer",
		      time_24hr: true,
		  };
		  fp.l10ns.fr = French;
		  var fr = fp.l10ns;

		  exports$1.French = French;
		  exports$1.default = fr;

		  Object.defineProperty(exports$1, '__esModule', { value: true });

		}))); 
	} (fr$3, fr$3.exports));
	return fr$3.exports;
}

var frExports = requireFr();
const fr = /*@__PURE__*/getDefaultExportFromCjs(frExports);

const fr$1 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: fr
}, [frExports]);

export { fr$1 as f };
