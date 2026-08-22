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

var zh$3 = {exports: {}};

var zh$2 = zh$3.exports;

var hasRequiredZh;

function requireZh () {
	if (hasRequiredZh) return zh$3.exports;
	hasRequiredZh = 1;
	(function (module, exports$1) {
		(function (global, factory) {
		  factory(exports$1) ;
		}(zh$2, (function (exports$1) {
		  var fp = typeof window !== "undefined" && window.flatpickr !== undefined
		      ? window.flatpickr
		      : {
		          l10ns: {},
		      };
		  var Mandarin = {
		      weekdays: {
		          shorthand: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
		          longhand: [
		              "星期日",
		              "星期一",
		              "星期二",
		              "星期三",
		              "星期四",
		              "星期五",
		              "星期六",
		          ],
		      },
		      months: {
		          shorthand: [
		              "一月",
		              "二月",
		              "三月",
		              "四月",
		              "五月",
		              "六月",
		              "七月",
		              "八月",
		              "九月",
		              "十月",
		              "十一月",
		              "十二月",
		          ],
		          longhand: [
		              "一月",
		              "二月",
		              "三月",
		              "四月",
		              "五月",
		              "六月",
		              "七月",
		              "八月",
		              "九月",
		              "十月",
		              "十一月",
		              "十二月",
		          ],
		      },
		      rangeSeparator: " 至 ",
		      weekAbbreviation: "周",
		      scrollTitle: "滚动切换",
		      toggleTitle: "点击切换 12/24 小时时制",
		  };
		  fp.l10ns.zh = Mandarin;
		  var zh = fp.l10ns;

		  exports$1.Mandarin = Mandarin;
		  exports$1.default = zh;

		  Object.defineProperty(exports$1, '__esModule', { value: true });

		}))); 
	} (zh$3, zh$3.exports));
	return zh$3.exports;
}

var zhExports = requireZh();
const zh = /*@__PURE__*/getDefaultExportFromCjs(zhExports);

const zh$1 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: zh
}, [zhExports]);

export { zh$1 as z };
