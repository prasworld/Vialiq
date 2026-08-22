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

var ja$3 = {exports: {}};

var ja$2 = ja$3.exports;

var hasRequiredJa;

function requireJa () {
	if (hasRequiredJa) return ja$3.exports;
	hasRequiredJa = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  factory(exports$1) ;
		}(ja$2, (function (exports$1) {
		  var fp = typeof window !== "undefined" && window.flatpickr !== undefined
		      ? window.flatpickr
		      : {
		          l10ns: {},
		      };
		  var Japanese = {
		      weekdays: {
		          shorthand: ["日", "月", "火", "水", "木", "金", "土"],
		          longhand: [
		              "日曜日",
		              "月曜日",
		              "火曜日",
		              "水曜日",
		              "木曜日",
		              "金曜日",
		              "土曜日",
		          ],
		      },
		      months: {
		          shorthand: [
		              "1月",
		              "2月",
		              "3月",
		              "4月",
		              "5月",
		              "6月",
		              "7月",
		              "8月",
		              "9月",
		              "10月",
		              "11月",
		              "12月",
		          ],
		          longhand: [
		              "1月",
		              "2月",
		              "3月",
		              "4月",
		              "5月",
		              "6月",
		              "7月",
		              "8月",
		              "9月",
		              "10月",
		              "11月",
		              "12月",
		          ],
		      },
		      time_24hr: true,
		      rangeSeparator: " から ",
		      monthAriaLabel: "月",
		      amPM: ["午前", "午後"],
		      yearAriaLabel: "年",
		      hourAriaLabel: "時間",
		      minuteAriaLabel: "分",
		  };
		  fp.l10ns.ja = Japanese;
		  var ja = fp.l10ns;

		  exports$1.Japanese = Japanese;
		  exports$1.default = ja;

		  Object.defineProperty(exports$1, '__esModule', { value: true });

		}))); 
	} (ja$3, ja$3.exports));
	return ja$3.exports;
}

var jaExports = requireJa();
const ja = /*@__PURE__*/getDefaultExportFromCjs(jaExports);

const ja$1 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: ja
}, [jaExports]);

export { ja$1 as j };
