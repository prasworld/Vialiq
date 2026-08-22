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

var es$3 = {exports: {}};

var es$2 = es$3.exports;

var hasRequiredEs;

function requireEs () {
	if (hasRequiredEs) return es$3.exports;
	hasRequiredEs = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  factory(exports$1) ;
		}(es$2, (function (exports$1) {
		  var fp = typeof window !== "undefined" && window.flatpickr !== undefined
		      ? window.flatpickr
		      : {
		          l10ns: {},
		      };
		  var Spanish = {
		      weekdays: {
		          shorthand: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
		          longhand: [
		              "Domingo",
		              "Lunes",
		              "Martes",
		              "Miércoles",
		              "Jueves",
		              "Viernes",
		              "Sábado",
		          ],
		      },
		      months: {
		          shorthand: [
		              "Ene",
		              "Feb",
		              "Mar",
		              "Abr",
		              "May",
		              "Jun",
		              "Jul",
		              "Ago",
		              "Sep",
		              "Oct",
		              "Nov",
		              "Dic",
		          ],
		          longhand: [
		              "Enero",
		              "Febrero",
		              "Marzo",
		              "Abril",
		              "Mayo",
		              "Junio",
		              "Julio",
		              "Agosto",
		              "Septiembre",
		              "Octubre",
		              "Noviembre",
		              "Diciembre",
		          ],
		      },
		      ordinal: function () {
		          return "º";
		      },
		      firstDayOfWeek: 1,
		      rangeSeparator: " a ",
		      time_24hr: true,
		  };
		  fp.l10ns.es = Spanish;
		  var es = fp.l10ns;

		  exports$1.Spanish = Spanish;
		  exports$1.default = es;

		  Object.defineProperty(exports$1, '__esModule', { value: true });

		}))); 
	} (es$3, es$3.exports));
	return es$3.exports;
}

var esExports = requireEs();
const es = /*@__PURE__*/getDefaultExportFromCjs(esExports);

const es$1 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: es
}, [esExports]);

export { es$1 as e };
