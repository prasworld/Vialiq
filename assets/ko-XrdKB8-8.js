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

var ko$3 = {exports: {}};

var ko$2 = ko$3.exports;

var hasRequiredKo;

function requireKo () {
	if (hasRequiredKo) return ko$3.exports;
	hasRequiredKo = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  factory(exports$1) ;
		}(ko$2, (function (exports$1) {
		  var fp = typeof window !== "undefined" && window.flatpickr !== undefined
		      ? window.flatpickr
		      : {
		          l10ns: {},
		      };
		  var Korean = {
		      weekdays: {
		          shorthand: ["일", "월", "화", "수", "목", "금", "토"],
		          longhand: [
		              "일요일",
		              "월요일",
		              "화요일",
		              "수요일",
		              "목요일",
		              "금요일",
		              "토요일",
		          ],
		      },
		      months: {
		          shorthand: [
		              "1월",
		              "2월",
		              "3월",
		              "4월",
		              "5월",
		              "6월",
		              "7월",
		              "8월",
		              "9월",
		              "10월",
		              "11월",
		              "12월",
		          ],
		          longhand: [
		              "1월",
		              "2월",
		              "3월",
		              "4월",
		              "5월",
		              "6월",
		              "7월",
		              "8월",
		              "9월",
		              "10월",
		              "11월",
		              "12월",
		          ],
		      },
		      ordinal: function () {
		          return "일";
		      },
		      rangeSeparator: " ~ ",
		      amPM: ["오전", "오후"],
		  };
		  fp.l10ns.ko = Korean;
		  var ko = fp.l10ns;

		  exports$1.Korean = Korean;
		  exports$1.default = ko;

		  Object.defineProperty(exports$1, '__esModule', { value: true });

		}))); 
	} (ko$3, ko$3.exports));
	return ko$3.exports;
}

var koExports = requireKo();
const ko = /*@__PURE__*/getDefaultExportFromCjs(koExports);

const ko$1 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: ko
}, [koExports]);

export { ko$1 as k };
