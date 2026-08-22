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

var pt$3 = {exports: {}};

var pt$2 = pt$3.exports;

var hasRequiredPt;

function requirePt () {
	if (hasRequiredPt) return pt$3.exports;
	hasRequiredPt = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  factory(exports$1) ;
		}(pt$2, (function (exports$1) {
		  var fp = typeof window !== "undefined" && window.flatpickr !== undefined
		      ? window.flatpickr
		      : {
		          l10ns: {},
		      };
		  var Portuguese = {
		      weekdays: {
		          shorthand: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
		          longhand: [
		              "Domingo",
		              "Segunda-feira",
		              "Terça-feira",
		              "Quarta-feira",
		              "Quinta-feira",
		              "Sexta-feira",
		              "Sábado",
		          ],
		      },
		      months: {
		          shorthand: [
		              "Jan",
		              "Fev",
		              "Mar",
		              "Abr",
		              "Mai",
		              "Jun",
		              "Jul",
		              "Ago",
		              "Set",
		              "Out",
		              "Nov",
		              "Dez",
		          ],
		          longhand: [
		              "Janeiro",
		              "Fevereiro",
		              "Março",
		              "Abril",
		              "Maio",
		              "Junho",
		              "Julho",
		              "Agosto",
		              "Setembro",
		              "Outubro",
		              "Novembro",
		              "Dezembro",
		          ],
		      },
		      rangeSeparator: " até ",
		      time_24hr: true,
		  };
		  fp.l10ns.pt = Portuguese;
		  var pt = fp.l10ns;

		  exports$1.Portuguese = Portuguese;
		  exports$1.default = pt;

		  Object.defineProperty(exports$1, '__esModule', { value: true });

		}))); 
	} (pt$3, pt$3.exports));
	return pt$3.exports;
}

var ptExports = requirePt();
const pt = /*@__PURE__*/getDefaultExportFromCjs(ptExports);

const pt$1 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: pt
}, [ptExports]);

export { pt$1 as p };
