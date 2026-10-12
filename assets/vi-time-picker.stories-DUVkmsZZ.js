import { i as instance, s as singleton } from './index-BeC6Zh2p.js';
import { A, b, r as r$1, i } from './iframe-uoEhHf4u.js';
import { V as ViElement, t, n } from './vi-element-Du0clqr8.js';
import { r } from './state-DnAJ4lzN.js';
import { e } from './query-CHb9Ft_d.js';
import { l as loadLocale$1, F as FlatpickrMixin, V as ViShadowDomPlugin } from './vi-shadow-dom-plugin-g6HUSHWt.js';
import { V as ValidityMixin } from './validity-mixin-VBcRRStw.js';
import { F as FloatingController } from './floating-controller-d7XvEPSf.js';
import './_commonjsHelpers-BFTU3MAI.js';
import './preload-helper-D5QYaGzd.js';
import './base-Cl6v8-BZ.js';
import './floating-ui.dom-Dsl7AwNm.js';
import './overlay-manager-DiQwTjfQ.js';

const timePickerStyles = "@charset \"UTF-8\";@layer reset,components,utilities;@layer components{.timepicker-control{display:inline-flex;align-items:center;box-sizing:border-box;height:var(--vi-time-picker-sizing-min-height, 2.25rem);min-height:var(--vi-time-picker-sizing-min-height, 2.25rem);border:var(--vi-time-picker-border-width, var(--vi-border-width-thin, 1px)) solid var(--vi-time-picker-border-color, var(--vi-border-03, #e0e0e0));border-radius:var(--vi-time-picker-shape-border-radius, var(--vi-border-radius-lg, 8px));background-color:var(--vi-time-picker-background-color, var(--vi-color-background, #ffffff));padding:0 var(--vi-spacing-sm, .75rem);gap:var(--vi-spacing-xs, .5rem);transition:border-color .15s ease,box-shadow .15s ease;-webkit-user-select:none;user-select:none;cursor:text}.timepicker-control:hover:not(:focus-within){border-color:var(--vi-time-picker-border-color-hover, var(--vi-border-04, #bdbdbd))}.timepicker-control:focus-within{border-color:var(--vi-time-picker-focus-ring-color, var(--vi-focus, #3676d0));box-shadow:0 0 0 3px var(--vi-time-picker-focus-ring-glow, var(--vi-color-blue-200, #cee6ff))}.timepicker-inputs{display:inline-flex;align-items:center;height:100%;gap:.0625rem}.timepicker-segment{appearance:none;-webkit-appearance:none;-moz-appearance:textfield;width:var(--vi-time-picker-segment-width, 1.75rem);min-width:1.625rem;box-sizing:border-box;text-align:center;border:1px solid transparent;outline:none;background:transparent;color:var(--vi-time-picker-text-color, var(--vi-text-primary, #111827));font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));font-size:var(--vi-time-picker-typography-font-size, var(--vi-font-size-base, .875rem));font-weight:var(--vi-font-weight-medium, 500);line-height:1.2;padding:.0625rem 0;border-radius:var(--vi-border-radius-sm, var(--vi-border-radius-sm, 4px));font-variant-numeric:tabular-nums;transition:background-color .12s ease,border-color .12s ease}.timepicker-segment::-webkit-inner-spin-button,.timepicker-segment::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.timepicker-segment::placeholder{color:var(--vi-time-picker-placeholder-color, var(--vi-text-secondary, #4b5563));opacity:1}.timepicker-segment:hover:not(:focus):not(:disabled){background:var(--vi-layer-hover-01, var(--vi-layer-hover-01, #f3f4f6))}.timepicker-segment:focus{background:var(--vi-layer-hover-01, var(--vi-layer-hover-01, #f3f4f6));border-color:var(--vi-time-picker-focus-ring-color, var(--vi-focus, #3676d0));box-shadow:0 0 0 1px var(--vi-time-picker-focus-ring-color, var(--vi-focus, #3676d0))}.timepicker-segment:disabled{color:var(--vi-text-disabled, var(--vi-text-disabled, #9e9e9e));cursor:not-allowed}.timepicker-separator{display:inline-flex;align-items:center;justify-content:center;align-self:center;height:100%;color:var(--vi-time-picker-separator-color, var(--vi-text-secondary, #4b5563));font-weight:var(--vi-font-weight-semibold, 600);font-size:var(--vi-time-picker-typography-font-size, var(--vi-font-size-base, .875rem));-webkit-user-select:none;user-select:none;padding:0 .0625rem;line-height:1}.timepicker-period-btn{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:var(--vi-time-picker-period-width, 2.375rem);height:1.5rem;padding:0 .25rem;margin-left:.125rem;border:1px solid var(--vi-border-02, var(--vi-border-02, #eeeeee));border-radius:var(--vi-border-radius-sm, var(--vi-border-radius-sm, 4px));background:var(--vi-layer-02, var(--vi-layer-02, #f3f4f6));color:var(--vi-time-picker-text-color, var(--vi-text-primary, #111827));font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));font-size:var(--vi-font-size-xs, var(--vi-font-size-xs, .75rem));font-weight:var(--vi-font-weight-semibold, 600);cursor:pointer;-webkit-user-select:none;user-select:none;transition:background-color .15s ease,border-color .15s ease}.timepicker-period-btn:hover:not(:disabled){background:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb));border-color:var(--vi-border-03, var(--vi-border-03, #e0e0e0))}.timepicker-period-btn:focus-visible{outline:2px solid var(--vi-focus, var(--vi-focus, #3676d0));outline-offset:1px}.timepicker-period-btn:disabled{opacity:.5;cursor:not-allowed}.timepicker-actions{display:inline-flex;align-items:center;gap:.125rem;margin-left:auto}.timepicker-now-btn{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;height:1.375rem;padding:0 .375rem;border:1px solid var(--vi-border-02, var(--vi-border-02, #eeeeee));border-radius:var(--vi-border-radius-sm, var(--vi-border-radius-sm, 4px));background:var(--vi-layer-02, var(--vi-layer-02, #f3f4f6));color:var(--vi-color-primary, var(--vi-color-primary, #3676d0));font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));font-size:var(--vi-font-size-xs, var(--vi-font-size-xs, .75rem));font-weight:var(--vi-font-weight-medium, 500);cursor:pointer;-webkit-user-select:none;user-select:none;transition:background-color .15s ease,border-color .15s ease,color .15s ease}.timepicker-now-btn:hover:not(:disabled){background:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb));border-color:var(--vi-border-03, var(--vi-border-03, #e0e0e0))}.timepicker-now-btn:focus-visible{outline:2px solid var(--vi-focus, var(--vi-focus, #3676d0));outline-offset:1px}.timepicker-now-btn:disabled{opacity:.5;cursor:not-allowed}.timepicker-timezone{display:inline-flex;align-items:center;justify-content:center;padding:.0625rem .25rem;margin-left:.125rem;border-radius:var(--vi-border-radius-sm, var(--vi-border-radius-sm, 4px));background:var(--vi-layer-02, var(--vi-layer-02, #f3f4f6));color:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));font-size:.625rem;font-weight:var(--vi-font-weight-semibold, 600);letter-spacing:.5px;-webkit-user-select:none;user-select:none}.timepicker-clock-btn,.timepicker-clear-btn{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:1.5rem;height:1.5rem;padding:0;border:none;background:transparent;border-radius:var(--vi-border-radius-sm, var(--vi-border-radius-sm, 4px));color:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));cursor:pointer;transition:background-color .15s ease,color .15s ease}.timepicker-clock-btn:hover:not(:disabled),.timepicker-clear-btn:hover:not(:disabled){background:var(--vi-layer-hover-01, var(--vi-layer-hover-01, #f3f4f6));color:var(--vi-text-primary, var(--vi-text-primary, #111827))}.timepicker-clock-btn:focus-visible,.timepicker-clear-btn:focus-visible{outline:2px solid var(--vi-focus, var(--vi-focus, #3676d0));outline-offset:1px}.timepicker-clock-btn:disabled,.timepicker-clear-btn:disabled{opacity:.5;cursor:not-allowed}.timepicker-clock-btn svg,.timepicker-clear-btn svg{width:.875rem;height:.875rem;stroke:currentColor}.timepicker-unknown-wrapper{display:inline-flex;align-items:center;gap:var(--vi-spacing-xs, .5rem);margin-top:var(--vi-spacing-xs, .5rem);font-size:var(--vi-font-size-xs, var(--vi-font-size-xs, .75rem));color:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));cursor:pointer;-webkit-user-select:none;user-select:none}.timepicker-unknown-wrapper input[type=checkbox]{cursor:pointer;accent-color:var(--vi-color-primary, var(--vi-color-primary, #3676d0))}.timepicker-unknown-wrapper label{cursor:pointer}.validity-msg{display:block;font-size:var(--vi-font-size-xs, var(--vi-font-size-xs, .75rem));color:var(--vi-time-picker-error-color, var(--vi-color-error, #ef4444));margin-top:var(--vi-spacing-xs, .5rem)}}.flatpickr-calendar{background:transparent;opacity:0;display:none;text-align:center;visibility:hidden;padding:0;-webkit-animation:none;animation:none;direction:ltr;border:0;font-size:.875rem;line-height:24px;border-radius:.3125rem;position:absolute;width:307.875px;-webkit-box-sizing:border-box;box-sizing:border-box;-ms-touch-action:manipulation;touch-action:manipulation;background:var(--vi-color-background, #ffffff);-webkit-box-shadow:var(--vi-date-picker-calendar-shadow, var(--vi-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, .05), 0 20px 25px -5px rgba(0, 0, 0, .1)));box-shadow:var(--vi-date-picker-calendar-shadow, var(--vi-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, .05), 0 20px 25px -5px rgba(0, 0, 0, .1)))}.flatpickr-calendar.open,.flatpickr-calendar.inline{opacity:1;max-height:640px;visibility:visible}.flatpickr-calendar.open{display:inline-block;z-index:99999}.flatpickr-calendar.animate.open{-webkit-animation:fpFadeInDown .3s cubic-bezier(.23,1,.32,1);animation:fpFadeInDown .3s cubic-bezier(.23,1,.32,1)}.flatpickr-calendar.inline{display:block;position:relative;top:2px}.flatpickr-calendar.static{position:absolute;top:calc(100% + 2px)}.flatpickr-calendar.static.open{z-index:999;display:block}.flatpickr-calendar.multiMonth .flatpickr-days .dayContainer:nth-child(n+1) .flatpickr-day.inRange:nth-child(7n+7){-webkit-box-shadow:none!important;box-shadow:none!important}.flatpickr-calendar.multiMonth .flatpickr-days .dayContainer:nth-child(n+2) .flatpickr-day.inRange:nth-child(7n+1){-webkit-box-shadow:none;box-shadow:none}.flatpickr-calendar .hasWeeks .dayContainer,.flatpickr-calendar .hasTime .dayContainer{border-bottom:0;border-bottom-right-radius:0;border-bottom-left-radius:0}.flatpickr-calendar .hasWeeks .dayContainer{border-left:0}.flatpickr-calendar.hasTime .flatpickr-time{height:40px;border-top:1px solid var(--vi-color-border, #e5e7eb)}.flatpickr-calendar.noCalendar.hasTime .flatpickr-time{height:auto}.flatpickr-calendar:before,.flatpickr-calendar:after{position:absolute;display:block;pointer-events:none;border:solid transparent;content:\"\";height:0;width:0;left:22px}.flatpickr-calendar.rightMost:before,.flatpickr-calendar.arrowRight:before,.flatpickr-calendar.rightMost:after,.flatpickr-calendar.arrowRight:after{left:auto;right:22px}.flatpickr-calendar.arrowCenter:before,.flatpickr-calendar.arrowCenter:after{left:50%;right:50%}.flatpickr-calendar:before{border-width:5px;margin:0 -5px}.flatpickr-calendar:after{border-width:4px;margin:0 -4px}.flatpickr-calendar.arrowTop:before,.flatpickr-calendar.arrowTop:after{bottom:100%}.flatpickr-calendar.arrowTop:before{border-bottom-color:var(--vi-color-border, #e5e7eb)}.flatpickr-calendar.arrowTop:after{border-bottom-color:var(--vi-color-background, #ffffff)}.flatpickr-calendar.arrowBottom:before,.flatpickr-calendar.arrowBottom:after{top:100%}.flatpickr-calendar.arrowBottom:before{border-top-color:var(--vi-color-border, #e5e7eb)}.flatpickr-calendar.arrowBottom:after{border-top-color:var(--vi-color-background, #ffffff)}.flatpickr-calendar:focus{outline:0}.flatpickr-wrapper{position:relative;display:inline-block}.flatpickr-months{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex}.flatpickr-months .flatpickr-month{background:transparent;color:var(--vi-text-primary, #111827);fill:var(--vi-text-primary, #111827);height:34px;line-height:1;text-align:center;position:relative;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;overflow:hidden;-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1}.flatpickr-months .flatpickr-prev-month,.flatpickr-months .flatpickr-next-month{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;text-decoration:none;cursor:pointer;position:absolute;top:0;height:34px;padding:10px;z-index:3;color:var(--vi-text-primary, #111827);fill:var(--vi-text-primary, #111827)}.flatpickr-months .flatpickr-prev-month.flatpickr-disabled,.flatpickr-months .flatpickr-next-month.flatpickr-disabled{display:none}.flatpickr-months .flatpickr-prev-month i,.flatpickr-months .flatpickr-next-month i{position:relative}.flatpickr-months .flatpickr-prev-month.flatpickr-prev-month,.flatpickr-months .flatpickr-next-month.flatpickr-prev-month{left:0}.flatpickr-months .flatpickr-prev-month.flatpickr-next-month,.flatpickr-months .flatpickr-next-month.flatpickr-next-month{right:0}.flatpickr-months .flatpickr-prev-month:hover,.flatpickr-months .flatpickr-next-month:hover{color:var(--vi-text-secondary, #4b5563)}.flatpickr-months .flatpickr-prev-month:hover svg,.flatpickr-months .flatpickr-next-month:hover svg{fill:var(--vi-color-error, #ef4444)}.flatpickr-months .flatpickr-prev-month svg,.flatpickr-months .flatpickr-next-month svg{width:14px;height:14px}.flatpickr-months .flatpickr-prev-month svg path,.flatpickr-months .flatpickr-next-month svg path{-webkit-transition:fill .1s;transition:fill .1s;fill:inherit}.numInputWrapper{position:relative;height:auto}.numInputWrapper input,.numInputWrapper span{display:inline-block}.numInputWrapper input{width:100%}.numInputWrapper input::-ms-clear{display:none}.numInputWrapper input::-webkit-outer-spin-button,.numInputWrapper input::-webkit-inner-spin-button{margin:0;-webkit-appearance:none}.numInputWrapper span{position:absolute;right:0;width:14px;padding:0 4px 0 2px;height:50%;line-height:50%;opacity:0;cursor:pointer;border:1px solid var(--vi-border-02, #eeeeee);-webkit-box-sizing:border-box;box-sizing:border-box}.numInputWrapper span:hover{background:var(--vi-layer-hover-01, #f3f4f6)}.numInputWrapper span:active{background:var(--vi-layer-hover-02, #e5e7eb)}.numInputWrapper span:after{display:block;content:\"\";position:absolute}.numInputWrapper span.arrowUp{top:0;border-bottom:0}.numInputWrapper span.arrowUp:after{border-left:4px solid transparent;border-right:4px solid transparent;border-bottom:4px solid var(--vi-text-secondary, #4b5563);top:26%}.numInputWrapper span.arrowDown{top:50%}.numInputWrapper span.arrowDown:after{border-left:4px solid transparent;border-right:4px solid transparent;border-top:4px solid var(--vi-text-secondary, #4b5563);top:40%}.numInputWrapper span svg{width:inherit;height:auto}.numInputWrapper span svg path{fill:var(--vi-text-secondary, #4b5563)}.numInputWrapper:hover{background:var(--vi-layer-hover-01, #f3f4f6)}.numInputWrapper:hover span{opacity:1}.flatpickr-current-month{font-size:135%;line-height:inherit;font-weight:300;color:inherit;position:absolute;width:75%;left:12.5%;padding:7.48px 0 0;line-height:1;height:34px;display:inline-block;text-align:center;-webkit-transform:translate3d(0px,0px,0px);transform:translateZ(0)}.flatpickr-current-month span.cur-month{font-family:inherit;font-weight:700;color:inherit;display:inline-block;margin-left:.5ch;padding:0}.flatpickr-current-month span.cur-month:hover{background:var(--vi-layer-hover-01, #f3f4f6)}.flatpickr-current-month .numInputWrapper{width:6ch;width:7ch\\fffd;display:inline-block}.flatpickr-current-month .numInputWrapper span.arrowUp:after{border-bottom-color:var(--vi-text-primary, #111827)}.flatpickr-current-month .numInputWrapper span.arrowDown:after{border-top-color:var(--vi-text-primary, #111827)}.flatpickr-current-month input.cur-year{background:transparent;-webkit-box-sizing:border-box;box-sizing:border-box;color:inherit;cursor:text;padding:0 0 0 .5ch;margin:0;display:inline-block;font-size:inherit;font-family:inherit;font-weight:300;line-height:inherit;height:auto;border:0;border-radius:0;vertical-align:initial;-webkit-appearance:textfield;-moz-appearance:textfield;appearance:textfield}.flatpickr-current-month input.cur-year:focus{outline:0}.flatpickr-current-month input.cur-year[disabled],.flatpickr-current-month input.cur-year[disabled]:hover{font-size:100%;color:var(--vi-text-secondary, #4b5563);background:transparent;pointer-events:none}.flatpickr-current-month .flatpickr-monthDropdown-months{appearance:menulist;background:transparent;border:none;border-radius:0;box-sizing:border-box;color:inherit;cursor:pointer;font-size:inherit;font-family:inherit;font-weight:300;height:auto;line-height:inherit;margin:-1px 0 0;outline:none;padding:0 0 0 .5ch;position:relative;vertical-align:initial;-webkit-box-sizing:border-box;-webkit-appearance:menulist;-moz-appearance:menulist;width:auto}.flatpickr-current-month .flatpickr-monthDropdown-months:focus,.flatpickr-current-month .flatpickr-monthDropdown-months:active{outline:none}.flatpickr-current-month .flatpickr-monthDropdown-months:hover{background:var(--vi-layer-hover-01, #f3f4f6)}.flatpickr-current-month .flatpickr-monthDropdown-months .flatpickr-monthDropdown-month{background-color:transparent;outline:none;padding:0}.flatpickr-weekdays{background:transparent;text-align:center;overflow:hidden;width:100%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;height:28px}.flatpickr-weekdays .flatpickr-weekdaycontainer{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1}span.flatpickr-weekday{cursor:default;font-size:90%;background:transparent;color:var(--vi-text-secondary, #4b5563);line-height:1;margin:0;text-align:center;display:block;-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1;font-weight:bolder}.dayContainer,.flatpickr-weeks{padding:1px 0 0}.flatpickr-days{position:relative;overflow:hidden;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:start;-webkit-align-items:flex-start;-ms-flex-align:start;align-items:flex-start;width:307.875px}.flatpickr-days:focus{outline:0}.dayContainer{padding:0;outline:0;text-align:left;width:307.875px;min-width:307.875px;max-width:307.875px;-webkit-box-sizing:border-box;box-sizing:border-box;display:inline-block;display:-ms-flexbox;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap;-ms-flex-wrap:wrap;-ms-flex-pack:justify;-webkit-justify-content:space-around;justify-content:space-around;-webkit-transform:translate3d(0px,0px,0px);transform:translateZ(0);opacity:1}.dayContainer+.dayContainer{-webkit-box-shadow:-1px 0 0 var(--vi-color-border, #e5e7eb);box-shadow:-1px 0 0 var(--vi-color-border, #e5e7eb)}.flatpickr-day{background:none;border:1px solid transparent;border-radius:9.375rem;-webkit-box-sizing:border-box;box-sizing:border-box;color:var(--vi-text-primary, #111827);cursor:pointer;font-weight:400;width:14.2857143%;-webkit-flex-basis:14.2857143%;-ms-flex-preferred-size:14.2857143%;flex-basis:14.2857143%;max-width:39px;height:39px;line-height:39px;margin:0;display:inline-block;position:relative;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;text-align:center}.flatpickr-day.inRange,.flatpickr-day.prevMonthDay.inRange,.flatpickr-day.nextMonthDay.inRange,.flatpickr-day.today.inRange,.flatpickr-day.prevMonthDay.today.inRange,.flatpickr-day.nextMonthDay.today.inRange,.flatpickr-day:hover,.flatpickr-day.prevMonthDay:hover,.flatpickr-day.nextMonthDay:hover,.flatpickr-day:focus,.flatpickr-day.prevMonthDay:focus,.flatpickr-day.nextMonthDay:focus{cursor:pointer;outline:0;background:var(--vi-color-border, #e5e7eb);border-color:var(--vi-color-border, #e5e7eb)}.flatpickr-day.today{border-color:var(--vi-text-secondary, #4b5563)}.flatpickr-day.today:hover,.flatpickr-day.today:focus{border-color:var(--vi-text-secondary, #4b5563);background:var(--vi-text-secondary, #4b5563);color:var(--vi-color-background, #ffffff)}.flatpickr-day.selected,.flatpickr-day.startRange,.flatpickr-day.endRange,.flatpickr-day.selected.inRange,.flatpickr-day.startRange.inRange,.flatpickr-day.endRange.inRange,.flatpickr-day.selected:focus,.flatpickr-day.startRange:focus,.flatpickr-day.endRange:focus,.flatpickr-day.selected:hover,.flatpickr-day.startRange:hover,.flatpickr-day.endRange:hover,.flatpickr-day.selected.prevMonthDay,.flatpickr-day.startRange.prevMonthDay,.flatpickr-day.endRange.prevMonthDay,.flatpickr-day.selected.nextMonthDay,.flatpickr-day.startRange.nextMonthDay,.flatpickr-day.endRange.nextMonthDay{background:var(--vi-color-primary, #3676d0);-webkit-box-shadow:none;box-shadow:none;color:var(--vi-color-background, #ffffff);border-color:var(--vi-color-primary, #3676d0)}.flatpickr-day.selected.startRange,.flatpickr-day.startRange.startRange,.flatpickr-day.endRange.startRange{border-radius:3.125rem 0 0 3.125rem}.flatpickr-day.selected.endRange,.flatpickr-day.startRange.endRange,.flatpickr-day.endRange.endRange{border-radius:0 3.125rem 3.125rem 0}.flatpickr-day.selected.startRange+.endRange:not(:nth-child(7n+1)),.flatpickr-day.startRange.startRange+.endRange:not(:nth-child(7n+1)),.flatpickr-day.endRange.startRange+.endRange:not(:nth-child(7n+1)){-webkit-box-shadow:-10px 0 0 var(--vi-color-primary, #3676d0);box-shadow:-10px 0 0 var(--vi-color-primary, #3676d0)}.flatpickr-day.selected.startRange.endRange,.flatpickr-day.startRange.startRange.endRange,.flatpickr-day.endRange.startRange.endRange{border-radius:3.125rem}.flatpickr-day.inRange{border-radius:0;-webkit-box-shadow:-5px 0 0 var(--vi-layer-03, #e5e7eb),5px 0 0 var(--vi-layer-03, #e5e7eb);box-shadow:-5px 0 0 var(--vi-layer-03, #e5e7eb),5px 0 0 var(--vi-layer-03, #e5e7eb)}.flatpickr-day.flatpickr-disabled,.flatpickr-day.flatpickr-disabled:hover,.flatpickr-day.prevMonthDay,.flatpickr-day.nextMonthDay,.flatpickr-day.notAllowed,.flatpickr-day.notAllowed.prevMonthDay,.flatpickr-day.notAllowed.nextMonthDay{color:var(--vi-text-disabled, #9e9e9e);background:transparent;border-color:transparent;cursor:default}.flatpickr-day.flatpickr-disabled,.flatpickr-day.flatpickr-disabled:hover{cursor:not-allowed;color:var(--vi-layer-disabled, #f3f4f6)}.flatpickr-day.week.selected{border-radius:0;-webkit-box-shadow:-5px 0 0 var(--vi-color-primary, #3676d0),5px 0 0 var(--vi-color-primary, #3676d0);box-shadow:-5px 0 0 var(--vi-color-primary, #3676d0),5px 0 0 var(--vi-color-primary, #3676d0)}.flatpickr-day.hidden{visibility:hidden}.rangeMode .flatpickr-day{margin-top:1px}.flatpickr-weekwrapper{float:left}.flatpickr-weekwrapper .flatpickr-weeks{padding:0 12px;-webkit-box-shadow:1px 0 0 var(--vi-color-border, #e5e7eb);box-shadow:1px 0 0 var(--vi-color-border, #e5e7eb)}.flatpickr-weekwrapper .flatpickr-weekday{float:none;width:100%;line-height:28px}.flatpickr-weekwrapper span.flatpickr-day,.flatpickr-weekwrapper span.flatpickr-day:hover{display:block;width:100%;max-width:none;color:var(--vi-text-disabled, #9e9e9e);background:transparent;cursor:default;border:none}.flatpickr-innerContainer{display:block;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-sizing:border-box;box-sizing:border-box;overflow:hidden}.flatpickr-rContainer{display:inline-block;padding:0;-webkit-box-sizing:border-box;box-sizing:border-box}.flatpickr-time{text-align:center;outline:0;display:block;height:0;line-height:40px;max-height:40px;-webkit-box-sizing:border-box;box-sizing:border-box;overflow:hidden;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex}.flatpickr-time:after{content:\"\";display:table;clear:both}.flatpickr-time .numInputWrapper{-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1;width:40%;height:40px;float:left}.flatpickr-time .numInputWrapper span.arrowUp:after{border-bottom-color:var(--vi-text-primary, #111827)}.flatpickr-time .numInputWrapper span.arrowDown:after{border-top-color:var(--vi-text-primary, #111827)}.flatpickr-time.hasSeconds .numInputWrapper{width:26%}.flatpickr-time.time24hr .numInputWrapper{width:49%}.flatpickr-time input{background:transparent;-webkit-box-shadow:none;box-shadow:none;border:0;border-radius:0;text-align:center;margin:0;padding:0;height:inherit;line-height:inherit;color:var(--vi-text-primary, #111827);font-size:.875rem;position:relative;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-appearance:textfield;-moz-appearance:textfield;appearance:textfield}.flatpickr-time input.flatpickr-hour{font-weight:700}.flatpickr-time input.flatpickr-minute,.flatpickr-time input.flatpickr-second{font-weight:400}.flatpickr-time input:focus{outline:0;border:0}.flatpickr-time .flatpickr-time-separator,.flatpickr-time .flatpickr-am-pm{height:inherit;float:left;line-height:inherit;color:var(--vi-text-primary, #111827);font-weight:700;width:2%;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-align-self:center;-ms-flex-item-align:center;align-self:center}.flatpickr-time .flatpickr-am-pm{outline:0;width:18%;cursor:pointer;text-align:center;font-weight:400}.flatpickr-time input:hover,.flatpickr-time .flatpickr-am-pm:hover,.flatpickr-time input:focus,.flatpickr-time .flatpickr-am-pm:focus{background:var(--vi-layer-hover-01, #f3f4f6)}.flatpickr-input[readonly]{cursor:pointer}@-webkit-keyframes fpFadeInDown{0%{opacity:0;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}to{opacity:1;-webkit-transform:translate3d(0,0,0);transform:translateZ(0)}}@keyframes fpFadeInDown{0%{opacity:0;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}to{opacity:1;-webkit-transform:translate3d(0,0,0);transform:translateZ(0)}}.flatpickr-calendar{background:var(--vi-date-picker-calendar-bg, var(--vi-layer-01, #ffffff));box-shadow:var(--vi-date-picker-calendar-shadow, var(--vi-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, .05), 0 20px 25px -5px rgba(0, 0, 0, .1)));border-radius:var(--vi-border-radius-lg, var(--vi-border-radius-lg, 8px));border:1px solid var(--vi-border-03, var(--vi-border-03, #e0e0e0));font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));color:var(--vi-text-primary, var(--vi-text-primary, #111827));padding:var(--vi-spacing-xs, var(--vi-spacing-xs, .5rem)) 0;width:max-content}.flatpickr-calendar.arrowTop:before{border-bottom-color:var(--vi-border-03, var(--vi-border-03, #e0e0e0))}.flatpickr-calendar.arrowTop:after{border-bottom-color:var(--vi-date-picker-calendar-bg, var(--vi-layer-01, #ffffff))}.flatpickr-calendar.arrowBottom:before{border-top-color:var(--vi-border-03, var(--vi-border-03, #e0e0e0))}.flatpickr-calendar.arrowBottom:after{border-top-color:var(--vi-date-picker-calendar-bg, var(--vi-layer-01, #ffffff))}.flatpickr-calendar .flatpickr-innerContainer{justify-content:center}.flatpickr-months .flatpickr-month{color:var(--vi-text-primary, var(--vi-text-primary, #111827));fill:var(--vi-text-primary, var(--vi-text-primary, #111827))}.flatpickr-months .flatpickr-prev-month,.flatpickr-months .flatpickr-next-month{color:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));fill:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));padding:var(--vi-spacing-xs, var(--vi-spacing-xs, .5rem));border-radius:var(--vi-border-radius-md, var(--vi-border-radius-md, 6px));transition:background-color .2s ease}.flatpickr-months .flatpickr-prev-month:hover,.flatpickr-months .flatpickr-next-month:hover{background-color:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb));color:var(--vi-text-primary, var(--vi-text-primary, #111827));fill:var(--vi-text-primary, var(--vi-text-primary, #111827))}.flatpickr-current-month{font-size:var(--vi-font-size-base, var(--vi-font-size-base, .875rem));font-weight:var(--vi-font-weight-semibold, var(--vi-font-weight-semibold, 600));color:inherit}.flatpickr-current-month .flatpickr-monthDropdown-months{background:var(--vi-date-picker-calendar-bg, var(--vi-layer-01, #ffffff));border-radius:var(--vi-border-radius-md, var(--vi-border-radius-md, 6px));padding:4px}.flatpickr-current-month .flatpickr-monthDropdown-months:hover{background-color:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb))}.flatpickr-current-month input.cur-year{font-weight:inherit;color:inherit}.flatpickr-current-month input.cur-year:hover{background-color:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb))}.flatpickr-weekdays .flatpickr-weekdaycontainer{display:grid;grid-template-columns:repeat(7,var(--vi-date-picker-day-size, 32px));justify-items:center;width:max-content}.flatpickr-weekdays .flatpickr-weekday{color:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));font-size:var(--vi-font-size-xs, var(--vi-font-size-xs, .75rem));font-weight:var(--vi-font-weight-medium, var(--vi-font-weight-medium, 500))}.flatpickr-days{width:auto}.dayContainer{display:grid;grid-template-columns:repeat(7,var(--vi-date-picker-day-size, 32px));justify-items:center;width:max-content;min-width:auto;max-width:none}.flatpickr-day{color:var(--vi-text-primary, var(--vi-text-primary, #111827));border-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px));margin:0;width:var(--vi-date-picker-day-size, 32px);max-width:var(--vi-date-picker-day-size, 32px);height:var(--vi-date-picker-day-size, 32px);line-height:var(--vi-date-picker-day-size, 32px);display:flex;align-items:center;justify-content:center;transition:all .2s ease}.flatpickr-day:hover,.flatpickr-day:focus{background:var(--vi-date-picker-day-hover-bg, var(--vi-layer-hover-01, #f3f4f6));border-color:var(--vi-date-picker-day-hover-bg, var(--vi-layer-hover-01, #f3f4f6))}.flatpickr-day.today{border-color:var(--vi-date-picker-day-today-border, var(--vi-color-primary, #3676d0))}.flatpickr-day.today:hover,.flatpickr-day.today:focus{border-color:var(--vi-date-picker-day-today-border, var(--vi-color-primary, #3676d0));background:var(--vi-date-picker-day-hover-bg, var(--vi-layer-hover-01, #f3f4f6))}.flatpickr-day.selected,.flatpickr-day.startRange,.flatpickr-day.endRange,.flatpickr-day.selected.inRange,.flatpickr-day.startRange.inRange,.flatpickr-day.endRange.inRange,.flatpickr-day.selected:focus,.flatpickr-day.startRange:focus,.flatpickr-day.endRange:focus,.flatpickr-day.selected:hover,.flatpickr-day.startRange:hover,.flatpickr-day.endRange:hover,.flatpickr-day.selected.prevMonthDay,.flatpickr-day.startRange.prevMonthDay,.flatpickr-day.endRange.prevMonthDay,.flatpickr-day.selected.nextMonthDay,.flatpickr-day.startRange.nextMonthDay,.flatpickr-day.endRange.nextMonthDay{background:var(--vi-date-picker-day-selected-bg, var(--vi-color-primary, #3676d0));border-color:var(--vi-date-picker-day-selected-bg, var(--vi-color-primary, #3676d0));color:var(--vi-date-picker-day-selected-color, var(--vi-text-primary-inverse, #ffffff))}.flatpickr-day.inRange,.flatpickr-day.prevMonthDay.inRange,.flatpickr-day.nextMonthDay.inRange,.flatpickr-day.today.inRange,.flatpickr-day.prevMonthDay.today.inRange,.flatpickr-day.nextMonthDay.today.inRange,.flatpickr-day:hover.inRange,.flatpickr-day.prevMonthDay:hover.inRange,.flatpickr-day.nextMonthDay:hover.inRange{background:var(--vi-color-blue-100, var(--vi-color-blue-100, #ebf5ff));border-color:var(--vi-color-blue-100, var(--vi-color-blue-100, #ebf5ff));border-radius:0;box-shadow:none;color:var(--vi-text-primary, var(--vi-text-primary, #111827))}.flatpickr-day.flatpickr-disabled,.flatpickr-day.flatpickr-disabled:hover,.flatpickr-day.prevMonthDay,.flatpickr-day.nextMonthDay,.flatpickr-day.notAllowed,.flatpickr-day.notAllowed.prevMonthDay,.flatpickr-day.notAllowed.nextMonthDay{color:var(--vi-text-disabled, var(--vi-text-disabled, #9e9e9e));background:transparent;border-color:transparent}.flatpickr-day.flatpickr-disabled,.flatpickr-day.flatpickr-disabled:hover{cursor:not-allowed}.vi-calendar-header{display:flex;justify-content:space-between;align-items:center;padding:4px var(--vi-spacing-xs, var(--vi-spacing-xs, .5rem));border-bottom:1px solid var(--vi-border-02, var(--vi-border-02, #eeeeee));margin-bottom:var(--vi-spacing-xs, var(--vi-spacing-xs, .5rem))}.vi-calendar-selectors{display:flex;gap:var(--vi-spacing-xs, var(--vi-spacing-xs, .5rem));align-items:center}.vi-calendar-month-toggle{background:transparent;border:1px solid transparent;border-radius:var(--vi-border-radius-md, var(--vi-border-radius-md, 6px));padding:4px 8px;font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));font-weight:var(--vi-font-weight-semibold, var(--vi-font-weight-semibold, 600));font-size:var(--vi-font-size-base, var(--vi-font-size-base, .875rem));color:var(--vi-text-primary, var(--vi-text-primary, #111827));cursor:pointer;transition:all .2s ease}.vi-calendar-month-toggle:hover{background:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb))}.vi-calendar-month-toggle:focus-visible{outline:none;background:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb));box-shadow:0 0 0 2px var(--vi-focus, var(--vi-focus, #3676d0))}.vi-calendar-year-select{min-width:76px;--vi-select-spacing-padding-inline: 4px;--vi-select-option-padding-inline: 8px;--vi-select-sizing-min-height: 32px}.vi-calendar-nav{display:flex;gap:2px}.vi-calendar-nav-btn{background:transparent;border:none;border-radius:var(--vi-border-radius-md, var(--vi-border-radius-md, 6px));width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;color:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));cursor:pointer;transition:all .2s ease}.vi-calendar-nav-btn:hover{background:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb));color:var(--vi-text-primary, var(--vi-text-primary, #111827))}.vi-calendar-month-grid{position:absolute;inset:50px 0 0;background:var(--vi-date-picker-calendar-bg, var(--vi-layer-01, #ffffff));z-index:10;display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:min-content;gap:4px;padding:var(--vi-spacing-xs, var(--vi-spacing-xs, .5rem));border-radius:0 0 var(--vi-border-radius-lg, var(--vi-border-radius-lg, 8px)) var(--vi-border-radius-lg, var(--vi-border-radius-lg, 8px))}.vi-month-mode .vi-calendar-month-grid{position:relative;top:0;margin-top:var(--vi-spacing-xs, var(--vi-spacing-xs, .5rem))}.vi-calendar-month-btn{background:transparent;border:1px solid transparent;border-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px));padding:var(--vi-spacing-xs, var(--vi-spacing-xs, .5rem)) 0;font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));font-size:var(--vi-font-size-sm, var(--vi-font-size-sm, .8125rem));color:var(--vi-text-primary, var(--vi-text-primary, #111827));cursor:pointer;transition:all .2s ease}.vi-calendar-month-btn:hover{background:var(--vi-layer-hover-01, var(--vi-layer-hover-01, #f3f4f6))}.vi-calendar-month-btn.active{background:var(--vi-date-picker-day-selected-bg, var(--vi-color-primary, #3676d0));color:var(--vi-text-primary-inverse, var(--vi-text-primary-inverse, #ffffff))}.flatpickr-day.inRange:nth-child(7n+1),.flatpickr-day.inRange:hover:nth-child(7n+1){border-top-left-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px));border-bottom-left-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px))}.flatpickr-day.inRange:nth-child(7n),.flatpickr-day.inRange:hover:nth-child(7n){border-top-right-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px));border-bottom-right-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px))}.flatpickr-day.week.selected{background:var(--vi-color-blue-100, var(--vi-color-blue-100, #ebf5ff));border-color:var(--vi-color-blue-100, var(--vi-color-blue-100, #ebf5ff));color:var(--vi-text-primary, var(--vi-text-primary, #111827));border-radius:0;box-shadow:none}.flatpickr-day.week.selected:nth-child(7n+1){background:var(--vi-date-picker-day-selected-bg, var(--vi-color-primary, #3676d0));border-color:var(--vi-date-picker-day-selected-bg, var(--vi-color-primary, #3676d0));color:var(--vi-date-picker-day-selected-color, var(--vi-text-primary-inverse, #ffffff));border-top-left-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px));border-bottom-left-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px))}.flatpickr-day.week.selected:nth-child(7n){background:var(--vi-date-picker-day-selected-bg, var(--vi-color-primary, #3676d0));border-color:var(--vi-date-picker-day-selected-bg, var(--vi-color-primary, #3676d0));color:var(--vi-date-picker-day-selected-color, var(--vi-text-primary-inverse, #ffffff));border-top-right-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px));border-bottom-right-radius:var(--vi-border-radius-full, var(--vi-border-radius-full, 9999px))}.vi-calendar-footer{padding:4px var(--vi-spacing-xs, var(--vi-spacing-xs, .5rem));border-top:1px solid var(--vi-border-02, var(--vi-border-02, #eeeeee));display:flex;justify-content:flex-end}.vi-calendar-today-btn{background:transparent;border:none;color:var(--vi-color-primary, var(--vi-color-primary, #3676d0));font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));font-weight:var(--vi-font-weight-medium, var(--vi-font-weight-medium, 500));font-size:var(--vi-font-size-sm, var(--vi-font-size-sm, .8125rem));cursor:pointer;padding:var(--vi-spacing-xs, var(--vi-spacing-xs, .5rem)) var(--vi-spacing-sm, var(--vi-spacing-sm, .75rem));border-radius:var(--vi-border-radius-md, var(--vi-border-radius-md, 6px));transition:background-color .2s ease}.vi-calendar-today-btn:hover{background:var(--vi-layer-hover-01, var(--vi-layer-hover-01, #f3f4f6))}.flatpickr-calendar.hasTime.noCalendar{display:block!important;width:max-content!important;min-width:8.75rem!important;box-sizing:border-box!important;background:var(--vi-time-picker-popup-bg, var(--vi-layer-01, #ffffff));box-shadow:var(--vi-time-picker-popup-shadow, var(--vi-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, .05), 0 20px 25px -5px rgba(0, 0, 0, .1)));border:1px solid var(--vi-time-picker-popup-border, var(--vi-border-03, #e0e0e0));border-radius:var(--vi-border-radius-lg, var(--vi-border-radius-lg, 8px));padding:var(--vi-spacing-xs, var(--vi-spacing-xs, .5rem)) var(--vi-spacing-sm, var(--vi-spacing-sm, .75rem));z-index:99999}.flatpickr-calendar.hasTime .flatpickr-time{height:2.625rem!important;max-height:2.625rem!important;line-height:2.625rem!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;width:100%!important;min-width:8.125rem!important;box-sizing:border-box!important;border-top:none!important;gap:.25rem!important}.flatpickr-calendar.hasTime .flatpickr-time .numInputWrapper{flex:0 0 2.875rem!important;width:2.875rem!important;min-width:2.75rem!important;height:2.25rem!important;position:relative!important;border-radius:var(--vi-border-radius-md, var(--vi-border-radius-md, 6px));box-sizing:border-box!important}.flatpickr-calendar.hasTime .flatpickr-time .numInputWrapper input.numInput{width:100%!important;height:100%!important;color:var(--vi-time-picker-text-color, var(--vi-text-primary, #111827))!important;font-size:var(--vi-font-size-base, var(--vi-font-size-base, .875rem))!important;font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif))!important;font-weight:var(--vi-font-weight-semibold, 600)!important;background:var(--vi-layer-02, var(--vi-layer-02, #f3f4f6))!important;border:1px solid var(--vi-border-02, var(--vi-border-02, #eeeeee))!important;border-radius:var(--vi-border-radius-md, var(--vi-border-radius-md, 6px))!important;text-align:center!important;padding:0 .875rem 0 .125rem!important;box-sizing:border-box!important;outline:none!important}.flatpickr-calendar.hasTime .flatpickr-time .numInputWrapper input.numInput:hover{background:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb))!important;border-color:var(--vi-border-03, var(--vi-border-03, #e0e0e0))!important}.flatpickr-calendar.hasTime .flatpickr-time .numInputWrapper input.numInput:focus{background:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb))!important;border-color:var(--vi-focus, var(--vi-focus, #3676d0))!important;box-shadow:0 0 0 2px var(--vi-focus-ring-glow, rgba(0, 94, 184, .2))!important}.flatpickr-calendar.hasTime .flatpickr-time .numInputWrapper span.arrowUp,.flatpickr-calendar.hasTime .flatpickr-time .numInputWrapper span.arrowDown{position:absolute!important;right:.125rem!important;width:.875rem!important;height:50%!important;box-sizing:border-box!important;cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important;opacity:.7}.flatpickr-calendar.hasTime .flatpickr-time .numInputWrapper span.arrowUp:hover,.flatpickr-calendar.hasTime .flatpickr-time .numInputWrapper span.arrowDown:hover{opacity:1}.flatpickr-calendar.hasTime .flatpickr-time .numInputWrapper span.arrowUp:after,.flatpickr-calendar.hasTime .flatpickr-time .numInputWrapper span.arrowDown:after{content:\"\";display:block;width:0;height:0;border-left:.25rem solid transparent;border-right:.25rem solid transparent}.flatpickr-calendar.hasTime .flatpickr-time .numInputWrapper span.arrowUp{top:.125rem!important}.flatpickr-calendar.hasTime .flatpickr-time .numInputWrapper span.arrowUp:after{border-bottom:.3125rem solid var(--vi-text-secondary, var(--vi-text-secondary, #4b5563))}.flatpickr-calendar.hasTime .flatpickr-time .numInputWrapper span.arrowDown{bottom:.125rem!important}.flatpickr-calendar.hasTime .flatpickr-time .numInputWrapper span.arrowDown:after{border-top:.3125rem solid var(--vi-text-secondary, var(--vi-text-secondary, #4b5563))}.flatpickr-calendar.hasTime .flatpickr-time .flatpickr-time-separator{display:inline-flex!important;align-items:center!important;justify-content:center!important;align-self:center!important;height:2.25rem!important;line-height:1!important;flex:0 0 auto!important;width:auto!important;float:none!important;color:var(--vi-time-picker-separator-color, var(--vi-text-secondary, #4b5563))!important;font-weight:var(--vi-font-weight-bold, 700)!important;font-size:var(--vi-font-size-base, var(--vi-font-size-base, .875rem))!important;padding:0 .125rem!important;-webkit-user-select:none!important;user-select:none!important}.flatpickr-calendar.hasTime .flatpickr-time .flatpickr-am-pm{flex:0 0 auto!important;width:3rem!important;height:2.25rem!important;line-height:2.25rem!important;text-align:center!important;border-radius:var(--vi-border-radius-md, var(--vi-border-radius-md, 6px))!important;background:var(--vi-layer-02, var(--vi-layer-02, #f3f4f6))!important;border:1px solid var(--vi-border-02, var(--vi-border-02, #eeeeee))!important;color:var(--vi-time-picker-text-color, var(--vi-text-primary, #111827))!important;font-family:var(--vi-font-family-base, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif))!important;font-weight:var(--vi-font-weight-semibold, 600)!important;font-size:var(--vi-font-size-sm, var(--vi-font-size-sm, .8125rem))!important;cursor:pointer!important;margin-left:.25rem!important;box-sizing:border-box!important;-webkit-user-select:none!important;user-select:none!important;outline:none!important;float:none!important}.flatpickr-calendar.hasTime .flatpickr-time .flatpickr-am-pm:hover{background:var(--vi-layer-hover-02, var(--vi-layer-hover-02, #e5e7eb))!important;border-color:var(--vi-border-03, var(--vi-border-03, #e0e0e0))!important}.flatpickr-calendar.hasTime .flatpickr-time .flatpickr-am-pm:focus{border-color:var(--vi-focus, var(--vi-focus, #3676d0))!important;box-shadow:0 0 0 2px var(--vi-focus-ring-glow, rgba(0, 94, 184, .2))!important}:host{display:inline-block;font-family:var(--vi-font-family, var(--vi-font-family-base, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif));position:relative;outline:none}#fp-input{position:absolute;top:0;left:0;opacity:0;pointer-events:none;width:0;height:0;margin:0;padding:0;border:0}#floating-menu-container{position:absolute;top:0;left:0}:host([disabled]){opacity:.6;pointer-events:none;cursor:not-allowed}:host([readonly]){cursor:default}:host([status=invalid]){--vi-time-picker-border-color: var( --vi-color-error, var(--vi-color-error, #ef4444) );--vi-time-picker-focus-ring-color: var( --vi-color-error, var(--vi-color-error, #ef4444) )}:host([status=valid]){--vi-time-picker-border-color: var( --vi-color-success, var(--vi-color-success, #489167) );--vi-time-picker-focus-ring-color: var( --vi-color-success, var(--vi-color-success, #489167) )}.timepicker-label,::slotted([slot=label]){display:block;font-size:var(--vi-font-size-sm, var(--vi-font-size-sm, .8125rem));font-weight:var(--vi-font-weight-medium, 500);color:var(--vi-text-primary, var(--vi-text-primary, #111827));margin-bottom:var(--vi-spacing-xs, .5rem);cursor:pointer;-webkit-user-select:none;user-select:none}.timepicker-helper,::slotted([slot=helper]){display:block;font-size:var(--vi-font-size-xs, var(--vi-font-size-xs, .75rem));color:var(--vi-text-secondary, var(--vi-text-secondary, #4b5563));margin-top:var(--vi-spacing-xs, .5rem)}";

/**
 * Resolves the effective BCP 47 locale tag from an attribute/prop or navigator.
 */ function resolveLocale(localeAttr) {
    if (localeAttr) return localeAttr;
    if (typeof navigator !== 'undefined' && navigator.language) {
        return navigator.language;
    }
    return 'en';
}
const LOCALE_DICTIONARIES = {
    fr: {
        hoursAriaLabel: 'Heures',
        minutesAriaLabel: 'Minutes',
        secondsAriaLabel: 'Secondes',
        groupAriaLabel: 'Sélecteur d’heure',
        clockAriaLabel: 'Choisir l’heure',
        clearAriaLabel: 'Effacer l’heure',
        periodAriaLabel: 'Basculer AM/PM, actuellement {period}',
        unknownLabel: 'Heure inconnue',
        popupAriaLabel: 'Fenêtre de l’heure',
        nowLabel: 'Maintenant',
        nowAriaLabel: 'Régler à l’heure actuelle',
        timezoneAriaLabel: 'Fuseau horaire',
        requiredMessage: 'L’heure est requise.',
        invalidMessage: 'Veuillez saisir une heure valide.',
        minMessage: 'Veuillez sélectionner une heure postérieure ou égale à {min}.',
        maxMessage: 'Veuillez sélectionner une heure antérieure ou égale à {max}.',
        disabledTimeMessage: 'Cette heure n’est pas disponible.',
        emptyValueText: 'Vide',
        unknownValueText: 'Inconnue',
        hoursUnit: 'heures',
        minutesUnit: 'minutes',
        secondsUnit: 'secondes'
    },
    de: {
        hoursAriaLabel: 'Stunden',
        minutesAriaLabel: 'Minuten',
        secondsAriaLabel: 'Sekunden',
        groupAriaLabel: 'Zeitauswahl',
        clockAriaLabel: 'Uhrzeit auswählen',
        clearAriaLabel: 'Uhrzeit löschen',
        periodAriaLabel: 'AM/PM umschalten, aktuell {period}',
        unknownLabel: 'Uhrzeit unbekannt',
        popupAriaLabel: 'Uhrzeit-Popup',
        nowLabel: 'Jetzt',
        nowAriaLabel: 'Aktuelle Uhrzeit einstellen',
        timezoneAriaLabel: 'Zeitzone',
        requiredMessage: 'Uhrzeit ist erforderlich.',
        invalidMessage: 'Bitte geben Sie eine gültige Uhrzeit ein.',
        minMessage: 'Bitte wählen Sie eine Uhrzeit ab {min}.',
        maxMessage: 'Bitte wählen Sie eine Uhrzeit bis {max}.',
        disabledTimeMessage: 'Diese Uhrzeit ist nicht verfügbar.',
        emptyValueText: 'Leer',
        unknownValueText: 'Unbekannt',
        hoursUnit: 'Stunden',
        minutesUnit: 'Minuten',
        secondsUnit: 'Sekunden'
    },
    es: {
        hoursAriaLabel: 'Horas',
        minutesAriaLabel: 'Minutos',
        secondsAriaLabel: 'Segundos',
        groupAriaLabel: 'Selector de hora',
        clockAriaLabel: 'Seleccionar hora',
        clearAriaLabel: 'Borrar hora',
        periodAriaLabel: 'Alternar AM/PM, actualmente {period}',
        unknownLabel: 'Hora desconocida',
        popupAriaLabel: 'Ventana de hora',
        nowLabel: 'Ahora',
        nowAriaLabel: 'Establecer en la hora actual',
        timezoneAriaLabel: 'Zona horaria',
        requiredMessage: 'La hora es obligatoria.',
        invalidMessage: 'Por favor, introduce una hora válida.',
        minMessage: 'Selecciona una hora a partir de las {min}.',
        maxMessage: 'Selecciona una hora anterior o igual a las {max}.',
        disabledTimeMessage: 'Esta hora no está disponible.',
        emptyValueText: 'Vacío',
        unknownValueText: 'Desconocido',
        hoursUnit: 'horas',
        minutesUnit: 'minutos',
        secondsUnit: 'segundos'
    },
    ja: {
        hoursPlaceholder: '時',
        minutesPlaceholder: '分',
        secondsPlaceholder: '秒',
        hoursAriaLabel: '時間',
        minutesAriaLabel: '分',
        secondsAriaLabel: '秒',
        groupAriaLabel: '時刻選択',
        clockAriaLabel: 'ポップアップから時刻を選択',
        clearAriaLabel: '時刻をクリア',
        periodAriaLabel: '午前/午後を切り替え、現在{period}',
        unknownLabel: '時刻不明',
        popupAriaLabel: '時刻ポップアップ',
        nowLabel: '現在時刻',
        nowAriaLabel: '現在時刻を設定',
        timezoneAriaLabel: 'タイムゾーン',
        requiredMessage: '時刻を入力してください。',
        invalidMessage: '有効な時刻を入力してください。',
        minMessage: '{min}以降の時刻を選択してください。',
        maxMessage: '{max}以前の時刻を選択してください。',
        disabledTimeMessage: 'この時刻は選択できません。',
        emptyValueText: '未設定',
        unknownValueText: '不明',
        hoursUnit: '時',
        minutesUnit: '分',
        secondsUnit: '秒'
    },
    zh: {
        hoursPlaceholder: '时',
        minutesPlaceholder: '分',
        secondsPlaceholder: '秒',
        hoursAriaLabel: '小时',
        minutesAriaLabel: '分钟',
        secondsAriaLabel: '秒钟',
        groupAriaLabel: '时间选择器',
        clockAriaLabel: '从弹出框选择时间',
        clearAriaLabel: '清除时间',
        periodAriaLabel: '切换上午/下午，当前为{period}',
        unknownLabel: '时间未知',
        popupAriaLabel: '时间弹出框',
        nowLabel: '现在',
        nowAriaLabel: '设置为当前时间',
        timezoneAriaLabel: '时区',
        requiredMessage: '请输入时间。',
        invalidMessage: '请输入有效的时间。',
        minMessage: '请选择{min}或之后的时间。',
        maxMessage: '请选择{max}或之前的时间。',
        disabledTimeMessage: '该时间不可选。',
        emptyValueText: '未填',
        unknownValueText: '未知',
        hoursUnit: '时',
        minutesUnit: '分',
        secondsUnit: '秒'
    }
};
/**
 * Returns default i18n messages and labels.
 * Can be overridden via props or custom `i18n` dictionary.
 */ function getDefaultTimePickerI18n(locale = 'en', format = '24') {
    const is12 = format === '12';
    const lang = (locale || 'en').toLowerCase().split('-')[0];
    const localized = LOCALE_DICTIONARIES[lang] || {};
    return {
        hoursPlaceholder: is12 ? 'hh' : 'HH',
        minutesPlaceholder: 'mm',
        secondsPlaceholder: 'ss',
        hoursAriaLabel: is12 ? 'Hours, 1 to 12' : 'Hours, 0 to 23',
        minutesAriaLabel: 'Minutes, 0 to 59',
        secondsAriaLabel: 'Seconds, 0 to 59',
        groupAriaLabel: 'Time picker',
        clockAriaLabel: 'Choose time from popup',
        clearAriaLabel: 'Clear time',
        periodAriaLabel: 'Toggle AM/PM, currently {period}',
        unknownLabel: 'Time unknown',
        popupAriaLabel: 'Time popup',
        nowLabel: 'Now',
        nowAriaLabel: 'Set to current time',
        timezoneAriaLabel: 'Timezone',
        requiredMessage: 'Time is required.',
        invalidMessage: 'Please enter a valid time.',
        minMessage: 'Please select a time on or after {min}.',
        maxMessage: 'Please select a time on or before {max}.',
        disabledTimeMessage: 'This time is not selectable.',
        emptyValueText: 'Empty',
        unknownValueText: 'Unknown',
        hoursUnit: 'hours',
        minutesUnit: 'minutes',
        secondsUnit: 'seconds',
        ...localized
    };
}
/**
 * Lazily loads a Flatpickr locale definition for a given BCP 47 tag.
 * Reuses the cached locale registry from date-picker.
 */ async function loadLocale(bcp47) {
    return loadLocale$1(bcp47);
}

function applyDecs2203RFactory$1() {
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
function _apply_decs_2203_r$1(targetClass, memberDecs, classDecs, parentClass) {
    return (_apply_decs_2203_r$1 = applyDecs2203RFactory$1())(targetClass, memberDecs, classDecs, parentClass);
}
function _identity$1(x) {
    return x;
}
var _dec$1, _initClass$1;
let _ViTimePickerLocaleRegistry;
_dec$1 = singleton();
new class extends _identity$1 {
    constructor(){
        super(_ViTimePickerLocaleRegistry), _initClass$1();
    }
    static{
        class ViTimePickerLocaleRegistry {
            static{
                ({ c: [_ViTimePickerLocaleRegistry, _initClass$1] } = _apply_decs_2203_r$1(this, [], [
                    _dec$1
                ]));
            }
            _dictionaries = new Map();
            _loaders = [];
            _fallbackLocale = 'en';
            constructor(){
                this._seedDefaults();
            }
            _seedDefaults() {
                for (const [key, dict] of Object.entries(LOCALE_DICTIONARIES)){
                    this._dictionaries.set(key.toLowerCase(), {
                        ...dict
                    });
                }
            }
            /**
   * Registers or extends translations for a BCP 47 locale tag (e.g. 'sv', 'it', 'de-AT').
   */ register(locale, dictionary) {
                if (!locale) return;
                const key = locale.toLowerCase();
                const existing = this._dictionaries.get(key) || {};
                this._dictionaries.set(key, {
                    ...existing,
                    ...dictionary
                });
            }
            /**
   * Registers an asynchronous loader (e.g., fetch from `/assets/i18n/time-picker/${locale}.json` or CMS).
   */ registerLoader(loader) {
                this._loaders.push(loader);
            }
            /**
   * Checks whether a locale is registered (directly or by language base code).
   */ has(locale) {
                if (!locale) return false;
                const norm = locale.toLowerCase();
                const lang = norm.split('-')[0];
                return this._dictionaries.has(norm) || this._dictionaries.has(lang);
            }
            /**
   * Retrieves the combined dictionary for the given locale with automatic fallback to English defaults.
   */ getLocale(locale, format = '24') {
                const norm = (locale || this._fallbackLocale).toLowerCase();
                const lang = norm.split('-')[0];
                const match = this._dictionaries.get(norm) ?? this._dictionaries.get(lang) ?? {};
                const baseFallback = getDefaultTimePickerI18n(this._fallbackLocale, format);
                return {
                    ...baseFallback,
                    ...match
                };
            }
            /**
   * Asynchronously resolves a locale, calling registered loaders if not yet registered.
   */ async resolveLocale(locale) {
                if (!locale) return this.getLocale(this._fallbackLocale);
                const norm = locale.toLowerCase();
                if (!this.has(norm) && this._loaders.length > 0) {
                    for (const loader of this._loaders){
                        try {
                            const loaded = await loader(norm);
                            if (loaded) {
                                this.register(norm, loaded);
                                break;
                            }
                        } catch (_e) {
                        // Continue to next loader on failure
                        }
                    }
                }
                return this.getLocale(norm);
            }
            /**
   * Resets the registry back to default starter locales (useful in test teardown).
   */ clear() {
                this._dictionaries.clear();
                this._loaders = [];
                this._seedDefaults();
            }
            /**
   * Returns the singleton instance resolved from the global tsyringe container.
   */ static getInstance() {
                return instance.resolve(ViTimePickerLocaleRegistry);
            }
        }
    }
}();
/**
 * Default global singleton instance of ViTimePickerLocaleRegistry.
 */ const timePickerLocaleRegistry = _ViTimePickerLocaleRegistry.getInstance();

function pad2(n) {
    return String(Math.floor(Number(n))).padStart(2, '0');
}
/**
 * Returns true if the string represents an unknown clinical time (CDISC SDTM format).
 */ /**
 * Returns true if the string represents a fully unknown clinical time (CDISC SDTM format).
 */ function isUnknownTime(value) {
    if (!value) return false;
    const trimmed = value.trim();
    return trimmed === '??:??' || trimmed === '??:??:??';
}
/**
 * Parses a CDISC SDTM partial unknown time string (e.g. "14:??", "??:30", "14:??:??", "02:?? PM")
 * according to CDISC grammar and numeric range rules.
 *
 * Grammar:
 * - 2-segment: (\d{1,2}|??):(\d{2}|??)( AM|PM)?
 * - 3-segment: (\d{1,2}|??):(\d{2}|??):(\d{2}|??)( AM|PM)?
 *
 * Range & Wildcard Rules:
 * - Must contain at least one wildcard '??' segment.
 * - Must NOT be fully unknown (where all present segments are '??', e.g. "??:??" or "??:??:??").
 * - Numeric hours with period: 1–12.
 * - Numeric hours without period: 0–23.
 * - Numeric minutes: 0–59.
 * - Numeric seconds: 0–59.
 *
 * Returns normalized TimeComponents if valid, or null if malformed or out of range.
 */ function parsePartialTime(value, format = '24') {
    if (!value) return null;
    const trimmed = value.trim();
    if (isUnknownTime(trimmed)) return null;
    const match = trimmed.match(/^(\d{1,2}|\?\?):(\d{2}|\?\?)(?::(\d{2}|\?\?))?(?:\s*(AM|PM))?$/i);
    if (!match) return null;
    const rawH = match[1];
    const rawM = match[2];
    const rawS = match[3];
    const rawPeriod = match[4]?.toUpperCase();
    // Must contain at least one '??' segment to be a partial unknown
    const hasWildcard = rawH === '??' || rawM === '??' || rawS === '??';
    if (!hasWildcard) return null;
    // Must not have all segments as '??' unless period is specified (full unknown without period is handled by isUnknownTime)
    const allWildcards = rawH === '??' && rawM === '??' && (rawS === undefined || rawS === '??') && !rawPeriod;
    if (allWildcards) return null;
    // Validate minutes range if numeric
    let minutes = null;
    if (rawM !== '??') {
        minutes = parseInt(rawM, 10);
        if (minutes < 0 || minutes > 59) return null;
    }
    // Validate seconds range if present and numeric
    let seconds = undefined;
    if (rawS !== undefined) {
        if (rawS === '??') {
            seconds = null;
        } else {
            seconds = parseInt(rawS, 10);
            if (seconds < 0 || seconds > 59) return null;
        }
    }
    // Validate hours range if numeric
    let hours = null;
    let period = rawPeriod;
    if (format === '24') {
        period = undefined;
    }
    if (rawH !== '??') {
        hours = parseInt(rawH, 10);
        if (rawPeriod) {
            if (hours < 1 || hours > 12) return null;
            if (format === '24') {
                hours = to24Hour(hours, rawPeriod);
            }
        } else {
            if (hours < 0 || hours > 23) return null;
            if (format === '12') {
                const converted = to12Hour(hours);
                hours = converted.hours;
                period = converted.period;
            }
        }
    }
    const rawHoursFormatted = rawH === '??' ? '??' : hours !== null ? pad2(hours) : rawH;
    const rawMinutesFormatted = rawM === '??' ? '??' : minutes !== null ? pad2(minutes) : rawM;
    const rawSecondsFormatted = rawS === undefined ? undefined : rawS === '??' ? '??' : seconds !== null && seconds !== undefined ? pad2(seconds) : rawS;
    return {
        hours,
        minutes,
        seconds,
        period,
        rawHours: rawHoursFormatted,
        rawMinutes: rawMinutesFormatted,
        rawSeconds: rawSecondsFormatted,
        isPartial: true
    };
}
/**
 * Returns true if the string represents a valid partially unknown clinical time (e.g. "14:??" or "??:30")
 * conforming to CDISC SDTM grammar and numeric ranges.
 */ function isPartialUnknownTime(value, format = '24') {
    return parsePartialTime(value, format) !== null;
}
/**
 * Converts a 12-hour clock value with period into a 24-hour number (0–23).
 */ function to24Hour(hours, period) {
    if (!period) return Math.min(23, Math.max(0, hours));
    if (period === 'AM') {
        return hours === 12 ? 0 : hours;
    }
    // PM
    return hours === 12 ? 12 : hours + 12;
}
/**
 * Converts a 24-hour number (0–23) into 12-hour clock values (1–12) with period.
 */ function to12Hour(hours24) {
    const normalized = (hours24 % 24 + 24) % 24;
    const period = normalized >= 12 ? 'PM' : 'AM';
    const hours = normalized % 12 || 12;
    return {
        hours,
        period
    };
}
/**
 * Parses any time string ("14:30", "14:30:45", "02:30 PM", "2:30:15 am", "14:??", "??:30")
 * into normalized components.
 */ function parseTime(value, format = '24') {
    if (!value || isUnknownTime(value)) return null;
    const trimmed = value.trim();
    // Handle partial unknown time (CDISC SDTM wildcards: e.g. "14:??", "??:30", "14:??:??")
    if (trimmed.includes('??')) {
        return parsePartialTime(trimmed, format);
    }
    const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] !== undefined ? parseInt(match[3], 10) : undefined;
    const rawPeriod = match[4]?.toUpperCase();
    if (minutes < 0 || minutes > 59) return null;
    if (seconds !== undefined && (seconds < 0 || seconds > 59)) return null;
    if (rawPeriod) {
        if (hours < 1 || hours > 12) return null;
        if (format === '24') {
            hours = to24Hour(hours, rawPeriod);
            return {
                hours,
                minutes,
                seconds
            };
        }
        return {
            hours,
            minutes,
            seconds,
            period: rawPeriod
        };
    }
    // No explicit period in the string:
    if (hours < 0 || hours > 23) return null;
    if (format === '12') {
        const converted = to12Hour(hours);
        return {
            hours: converted.hours,
            minutes,
            seconds,
            period: converted.period
        };
    }
    // 24-hour format
    return {
        hours,
        minutes,
        seconds
    };
}
/**
 * Parses pasted clipboard strings across standard, 12h, military continuous (1430), and partial formats.
 */ function parsePastedTime(pastedText, format = '24') {
    if (!pastedText) return null;
    const clean = pastedText.trim();
    // 1. Direct standard or partial parse
    const direct = parseTime(clean, format);
    if (direct) return direct;
    // 2. Fully unknown
    if (isUnknownTime(clean)) {
        return {
            hours: null,
            minutes: null,
            seconds: null,
            rawHours: '??',
            rawMinutes: '??',
            rawSeconds: '??',
            isPartial: false
        };
    }
    // 3. Compact military format (no colons): "1430", "0930", "930", "143045"
    const digitsOnly = clean.match(/^(\d{3,6})(?:\s*(AM|PM))?$/i);
    if (digitsOnly) {
        const rawDigits = digitsOnly[1];
        const period = digitsOnly[2]?.toUpperCase();
        let hStr = '';
        let mStr = '';
        let sStr = undefined;
        if (rawDigits.length === 3) {
            // e.g. "930" -> "09:30"
            hStr = rawDigits.slice(0, 1);
            mStr = rawDigits.slice(1, 3);
        } else if (rawDigits.length === 4) {
            // e.g. "1430"
            hStr = rawDigits.slice(0, 2);
            mStr = rawDigits.slice(2, 4);
        } else if (rawDigits.length === 6) {
            // e.g. "143045"
            hStr = rawDigits.slice(0, 2);
            mStr = rawDigits.slice(2, 4);
            sStr = rawDigits.slice(4, 6);
        }
        if (hStr && mStr) {
            const synthetic = `${hStr}:${mStr}${sStr ? `:${sStr}` : ''}${period ? ` ${period}` : ''}`;
            return parseTime(synthetic, format);
        }
    }
    return null;
}
/**
 * Formats time components into display string based on format ('12' or '24').
 */ function formatTime(components, format = '24', showSeconds = false) {
    if (!components) return '';
    const hStr = components.rawHours !== undefined && components.rawHours !== '' ? components.rawHours : components.hours !== null && components.hours !== undefined ? pad2(components.hours) : '??';
    const mStr = components.rawMinutes !== undefined && components.rawMinutes !== '' ? components.rawMinutes : components.minutes !== null && components.minutes !== undefined ? pad2(components.minutes) : '??';
    const sStr = components.rawSeconds !== undefined && components.rawSeconds !== '' ? components.rawSeconds : components.seconds !== null && components.seconds !== undefined ? pad2(components.seconds) : '??';
    if (format === '12') {
        const period = components.period || 'AM';
        const base = `${hStr}:${mStr}`;
        return showSeconds ? `${base}:${sStr} ${period}` : `${base} ${period}`;
    }
    const base = `${hStr}:${mStr}`;
    return showSeconds ? `${base}:${sStr}` : base;
}
/**
 * Produces a standardized 24-hour ISO string ("14:30" or "14:30:00"), with optional timezone.
 */ function toIsoTime(components, showSeconds = false, timezone = '') {
    if (!components) return null;
    const hStr = components.hours !== null && components.hours !== undefined ? pad2(components.period !== undefined ? to24Hour(components.hours, components.period) : components.hours) : components.rawHours || '??';
    const mStr = components.minutes !== null && components.minutes !== undefined ? pad2(components.minutes) : components.rawMinutes || '??';
    const sStr = components.seconds !== null && components.seconds !== undefined ? pad2(components.seconds) : components.rawSeconds || (showSeconds ? '00' : '');
    let base = `${hStr}:${mStr}`;
    if (showSeconds) {
        base = `${base}:${sStr}`;
    }
    if (!timezone) return base;
    const tz = timezone.trim();
    if (tz === 'UTC' || tz === 'Z') {
        return `${base}Z`;
    }
    if (/^[+-]\d{2}(?::?\d{2})?$/.test(tz)) {
        return `${base}${tz}`;
    }
    return `${base} [${tz}]`;
}
/**
 * Converts a time string or components into seconds from midnight (0–86399).
 */ function timeToSeconds(timeStr) {
    const parsed = parseTime(timeStr);
    if (!parsed || parsed.hours === null || parsed.minutes === null) return null;
    const h24 = parsed.period !== undefined ? to24Hour(parsed.hours, parsed.period) : parsed.hours;
    return h24 * 3600 + parsed.minutes * 60 + (parsed.seconds ?? 0);
}
/**
 * Compares two time strings. Returns:
 * < 0 if a < b
 * = 0 if a === b
 * > 0 if a > b
 */ function compareTimes(a, b) {
    const secA = timeToSeconds(a);
    const secB = timeToSeconds(b);
    if (secA === null || secB === null) return 0;
    return secA - secB;
}
/**
 * Increments or decrements a number with wrap-around within [min, max].
 */ function stepSegment(val, step, min, max, direction) {
    const range = max - min + 1;
    const delta = direction === 'up' ? step : -step;
    const next = val + delta;
    return ((next - min) % range + range) % range + min;
}

const TIME_PICKER_LOCALE_REGISTRY_TOKEN = Symbol('TIME_PICKER_LOCALE_REGISTRY_TOKEN');

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
function _identity(x) {
    return x;
}
var _dec, _initClass, _ValidityMixin, _dec1, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _init_value, _init_name, _init_format, _init_step, _init_hourStep, _init_secondStep, _init_showSeconds, _init_min, _init_max, _init_disabled, _init_readonly, _init_allowUnknown, _init_label, _init_helperText, _init_clearable, _init_showNow, _init_timezone, _init_hoist, _init_disabledHours, _init_disabledMinutes, _init_disabledSeconds, _init_locale, /**
   * Unified configuration object for placeholders, labels, messages, and formatting.
   * Changes to this object (including in-place property mutations) are automatically watched.
   */ _init_config, /**
   * Alias for `config`, supporting internationalization terminology.
   */ _init_i18n, _init_hoursPlaceholder, _init_minutesPlaceholder, _init_secondsPlaceholder, _init__hours, _init__minutes, _init__seconds, _init__period, _init__isUnknown, _init__isOpen, _init__resolvedLocale, _init__fpInput, _init__hoursInput, _init__minutesInput, _init__secondsInput, _init__periodBtn, _init__controlEl, _init__clockBtn, _init__floatingMenuContainer, _initProto;
const VI_TIME_PICKER_CHANGE = 'vi-time-picker-change';
let _ViTimePicker;
_dec = t('vi-time-picker'), _dec1 = n({
    type: String,
    reflect: true
}), _dec2 = n({
    type: String
}), _dec3 = n({
    type: String,
    reflect: true
}), _dec4 = n({
    type: Number
}), _dec5 = n({
    type: Number,
    attribute: 'hour-step'
}), _dec6 = n({
    type: Number,
    attribute: 'second-step'
}), _dec7 = n({
    type: Boolean,
    attribute: 'show-seconds'
}), _dec8 = n({
    type: String
}), _dec9 = n({
    type: String
}), _dec10 = n({
    type: Boolean,
    reflect: true
}), _dec11 = n({
    type: Boolean,
    reflect: true
}), _dec12 = n({
    type: Boolean,
    attribute: 'allow-unknown'
}), _dec13 = n({
    type: String
}), _dec14 = n({
    type: String,
    attribute: 'helper-text'
}), _dec15 = n({
    type: Boolean
}), _dec16 = n({
    type: Boolean,
    attribute: 'show-now'
}), _dec17 = n({
    type: String,
    reflect: true
}), _dec18 = n({
    type: Boolean
}), _dec19 = n({
    attribute: false
}), _dec20 = n({
    attribute: false
}), _dec21 = n({
    attribute: false
}), _dec22 = n({
    type: String
}), _dec23 = n({
    type: Object
}), _dec24 = n({
    type: Object
}), _dec25 = n({
    type: String,
    attribute: 'hours-placeholder'
}), _dec26 = n({
    type: String,
    attribute: 'minutes-placeholder'
}), _dec27 = n({
    type: String,
    attribute: 'seconds-placeholder'
}), _dec28 = r(), _dec29 = r(), _dec30 = r(), _dec31 = r(), _dec32 = r(), _dec33 = r(), _dec34 = r(), _dec35 = e('#fp-input'), _dec36 = e('#hours-input'), _dec37 = e('#minutes-input'), _dec38 = e('#seconds-input'), _dec39 = e('.timepicker-period-btn'), _dec40 = e('.timepicker-control'), _dec41 = e('.timepicker-clock-btn'), _dec42 = e('#floating-menu-container');
new class extends _identity {
    constructor(){
        super(_ViTimePicker), _initClass();
    }
    static{
        class ViTimePicker extends (_ValidityMixin = ValidityMixin(FlatpickrMixin(ViElement))) {
            static{
                ({ e: [_init_value, _init_name, _init_format, _init_step, _init_hourStep, _init_secondStep, _init_showSeconds, _init_min, _init_max, _init_disabled, _init_readonly, _init_allowUnknown, _init_label, _init_helperText, _init_clearable, _init_showNow, _init_timezone, _init_hoist, _init_disabledHours, _init_disabledMinutes, _init_disabledSeconds, _init_locale, _init_config, _init_i18n, _init_hoursPlaceholder, _init_minutesPlaceholder, _init_secondsPlaceholder, _init__hours, _init__minutes, _init__seconds, _init__period, _init__isUnknown, _init__isOpen, _init__resolvedLocale, _init__fpInput, _init__hoursInput, _init__minutesInput, _init__secondsInput, _init__periodBtn, _init__controlEl, _init__clockBtn, _init__floatingMenuContainer, _initProto], c: [_ViTimePicker, _initClass] } = _apply_decs_2203_r(this, [
                    [
                        _dec1,
                        1,
                        "value"
                    ],
                    [
                        _dec2,
                        1,
                        "name"
                    ],
                    [
                        _dec3,
                        1,
                        "format"
                    ],
                    [
                        _dec4,
                        1,
                        "step"
                    ],
                    [
                        _dec5,
                        1,
                        "hourStep"
                    ],
                    [
                        _dec6,
                        1,
                        "secondStep"
                    ],
                    [
                        _dec7,
                        1,
                        "showSeconds"
                    ],
                    [
                        _dec8,
                        1,
                        "min"
                    ],
                    [
                        _dec9,
                        1,
                        "max"
                    ],
                    [
                        _dec10,
                        1,
                        "disabled"
                    ],
                    [
                        _dec11,
                        1,
                        "readonly"
                    ],
                    [
                        _dec12,
                        1,
                        "allowUnknown"
                    ],
                    [
                        _dec13,
                        1,
                        "label"
                    ],
                    [
                        _dec14,
                        1,
                        "helperText"
                    ],
                    [
                        _dec15,
                        1,
                        "clearable"
                    ],
                    [
                        _dec16,
                        1,
                        "showNow"
                    ],
                    [
                        _dec17,
                        1,
                        "timezone"
                    ],
                    [
                        _dec18,
                        1,
                        "hoist"
                    ],
                    [
                        _dec19,
                        1,
                        "disabledHours"
                    ],
                    [
                        _dec20,
                        1,
                        "disabledMinutes"
                    ],
                    [
                        _dec21,
                        1,
                        "disabledSeconds"
                    ],
                    [
                        _dec22,
                        1,
                        "locale"
                    ],
                    [
                        _dec23,
                        1,
                        "config"
                    ],
                    [
                        _dec24,
                        1,
                        "i18n"
                    ],
                    [
                        _dec25,
                        1,
                        "hoursPlaceholder"
                    ],
                    [
                        _dec26,
                        1,
                        "minutesPlaceholder"
                    ],
                    [
                        _dec27,
                        1,
                        "secondsPlaceholder"
                    ],
                    [
                        _dec28,
                        1,
                        "_hours"
                    ],
                    [
                        _dec29,
                        1,
                        "_minutes"
                    ],
                    [
                        _dec30,
                        1,
                        "_seconds"
                    ],
                    [
                        _dec31,
                        1,
                        "_period"
                    ],
                    [
                        _dec32,
                        1,
                        "_isUnknown"
                    ],
                    [
                        _dec33,
                        1,
                        "_isOpen"
                    ],
                    [
                        _dec34,
                        1,
                        "_resolvedLocale"
                    ],
                    [
                        _dec35,
                        1,
                        "_fpInput"
                    ],
                    [
                        _dec36,
                        1,
                        "_hoursInput"
                    ],
                    [
                        _dec37,
                        1,
                        "_minutesInput"
                    ],
                    [
                        _dec38,
                        1,
                        "_secondsInput"
                    ],
                    [
                        _dec39,
                        1,
                        "_periodBtn"
                    ],
                    [
                        _dec40,
                        1,
                        "_controlEl"
                    ],
                    [
                        _dec41,
                        1,
                        "_clockBtn"
                    ],
                    [
                        _dec42,
                        1,
                        "_floatingMenuContainer"
                    ]
                ], [
                    _dec
                ], _ValidityMixin));
            }
            #___private_value_1 = (_initProto(this), _init_value(this, ''));
            get value() {
                return this.#___private_value_1;
            }
            set value(_v) {
                this.#___private_value_1 = _v;
            }
            #___private_name_2 = _init_name(this, '');
            get name() {
                return this.#___private_name_2;
            }
            set name(_v) {
                this.#___private_name_2 = _v;
            }
            #___private_format_3 = _init_format(this, '24');
            get format() {
                return this.#___private_format_3;
            }
            set format(_v) {
                this.#___private_format_3 = _v;
            }
            #___private_step_4 = _init_step(this, 15);
            get step() {
                return this.#___private_step_4;
            }
            set step(_v) {
                this.#___private_step_4 = _v;
            }
            #___private_hourStep_5 = _init_hourStep(this, 1);
            get hourStep() {
                return this.#___private_hourStep_5;
            }
            set hourStep(_v) {
                this.#___private_hourStep_5 = _v;
            }
            #___private_secondStep_6 = _init_secondStep(this, 1);
            get secondStep() {
                return this.#___private_secondStep_6;
            }
            set secondStep(_v) {
                this.#___private_secondStep_6 = _v;
            }
            #___private_showSeconds_7 = _init_showSeconds(this, false);
            get showSeconds() {
                return this.#___private_showSeconds_7;
            }
            set showSeconds(_v) {
                this.#___private_showSeconds_7 = _v;
            }
            #___private_min_8 = _init_min(this, '');
            get min() {
                return this.#___private_min_8;
            }
            set min(_v) {
                this.#___private_min_8 = _v;
            }
            #___private_max_9 = _init_max(this, '');
            get max() {
                return this.#___private_max_9;
            }
            set max(_v) {
                this.#___private_max_9 = _v;
            }
            #___private_disabled_10 = _init_disabled(this, false);
            get disabled() {
                return this.#___private_disabled_10;
            }
            set disabled(_v) {
                this.#___private_disabled_10 = _v;
            }
            #___private_readonly_11 = _init_readonly(this, false);
            get readonly() {
                return this.#___private_readonly_11;
            }
            set readonly(_v) {
                this.#___private_readonly_11 = _v;
            }
            #___private_allowUnknown_12 = _init_allowUnknown(this, false);
            get allowUnknown() {
                return this.#___private_allowUnknown_12;
            }
            set allowUnknown(_v) {
                this.#___private_allowUnknown_12 = _v;
            }
            #___private_label_13 = _init_label(this, '');
            get label() {
                return this.#___private_label_13;
            }
            set label(_v) {
                this.#___private_label_13 = _v;
            }
            #___private_helperText_14 = _init_helperText(this, '');
            get helperText() {
                return this.#___private_helperText_14;
            }
            set helperText(_v) {
                this.#___private_helperText_14 = _v;
            }
            #___private_clearable_15 = _init_clearable(this, false);
            get clearable() {
                return this.#___private_clearable_15;
            }
            set clearable(_v) {
                this.#___private_clearable_15 = _v;
            }
            #___private_showNow_16 = _init_showNow(this, false);
            get showNow() {
                return this.#___private_showNow_16;
            }
            set showNow(_v) {
                this.#___private_showNow_16 = _v;
            }
            #___private_timezone_17 = _init_timezone(this, '');
            get timezone() {
                return this.#___private_timezone_17;
            }
            set timezone(_v) {
                this.#___private_timezone_17 = _v;
            }
            #___private_hoist_18 = _init_hoist(this, false);
            get hoist() {
                return this.#___private_hoist_18;
            }
            set hoist(_v) {
                this.#___private_hoist_18 = _v;
            }
            #___private_disabledHours_19 = _init_disabledHours(this, null);
            get disabledHours() {
                return this.#___private_disabledHours_19;
            }
            set disabledHours(_v) {
                this.#___private_disabledHours_19 = _v;
            }
            #___private_disabledMinutes_20 = _init_disabledMinutes(this, null);
            get disabledMinutes() {
                return this.#___private_disabledMinutes_20;
            }
            set disabledMinutes(_v) {
                this.#___private_disabledMinutes_20 = _v;
            }
            #___private_disabledSeconds_21 = _init_disabledSeconds(this, null);
            get disabledSeconds() {
                return this.#___private_disabledSeconds_21;
            }
            set disabledSeconds(_v) {
                this.#___private_disabledSeconds_21 = _v;
            }
            #___private_locale_22 = _init_locale(this, null);
            get locale() {
                return this.#___private_locale_22;
            }
            set locale(_v) {
                this.#___private_locale_22 = _v;
            }
            #___private_config_23 = _init_config(this, {});
            get config() {
                return this.#___private_config_23;
            }
            set config(_v) {
                this.#___private_config_23 = _v;
            }
            #___private_i18n_24 = _init_i18n(this, {});
            get i18n() {
                return this.#___private_i18n_24;
            }
            set i18n(_v) {
                this.#___private_i18n_24 = _v;
            }
            #___private_hoursPlaceholder_25 = _init_hoursPlaceholder(this, '');
            get hoursPlaceholder() {
                return this.#___private_hoursPlaceholder_25;
            }
            set hoursPlaceholder(_v) {
                this.#___private_hoursPlaceholder_25 = _v;
            }
            #___private_minutesPlaceholder_26 = _init_minutesPlaceholder(this, '');
            get minutesPlaceholder() {
                return this.#___private_minutesPlaceholder_26;
            }
            set minutesPlaceholder(_v) {
                this.#___private_minutesPlaceholder_26 = _v;
            }
            #___private_secondsPlaceholder_27 = _init_secondsPlaceholder(this, '');
            get secondsPlaceholder() {
                return this.#___private_secondsPlaceholder_27;
            }
            set secondsPlaceholder(_v) {
                this.#___private_secondsPlaceholder_27 = _v;
            }
            _proxySet = new WeakSet();
            _isProxy(obj) {
                return !!obj && typeof obj === 'object' && this._proxySet.has(obj);
            }
            _createConfigProxy(target) {
                if (!target || typeof target !== 'object' || this._isProxy(target)) {
                    return target;
                }
                const proxy = new Proxy(target, {
                    set: (obj, prop, value, receiver)=>{
                        const res = Reflect.set(obj, prop, value, receiver);
                        this._syncValidity();
                        this.requestUpdate();
                        return res;
                    },
                    deleteProperty: (obj, prop)=>{
                        const res = Reflect.deleteProperty(obj, prop);
                        this._syncValidity();
                        this.requestUpdate();
                        return res;
                    }
                });
                this._proxySet.add(proxy);
                return proxy;
            }
            /**
   * Merges partial configuration updates into the existing config and triggers reactivity.
   */ setConfig(updates) {
                if (!this.config) {
                    this.config = {};
                }
                Object.assign(this.config, updates);
                this._syncValidity();
                this.requestUpdate();
            }
            /**
   * Merges partial configuration updates into the existing i18n and triggers reactivity.
   */ setI18n(updates) {
                if (!this.i18n) {
                    this.i18n = {};
                }
                Object.assign(this.i18n, updates);
                this._syncValidity();
                this.requestUpdate();
            }
            #___private__hours_28 = _init__hours(this, '');
            get _hours() {
                return this.#___private__hours_28;
            }
            set _hours(_v) {
                this.#___private__hours_28 = _v;
            }
            #___private__minutes_29 = _init__minutes(this, '');
            get _minutes() {
                return this.#___private__minutes_29;
            }
            set _minutes(_v) {
                this.#___private__minutes_29 = _v;
            }
            #___private__seconds_30 = _init__seconds(this, '');
            get _seconds() {
                return this.#___private__seconds_30;
            }
            set _seconds(_v) {
                this.#___private__seconds_30 = _v;
            }
            #___private__period_31 = _init__period(this, 'AM');
            get _period() {
                return this.#___private__period_31;
            }
            set _period(_v) {
                this.#___private__period_31 = _v;
            }
            #___private__isUnknown_32 = _init__isUnknown(this, false);
            get _isUnknown() {
                return this.#___private__isUnknown_32;
            }
            set _isUnknown(_v) {
                this.#___private__isUnknown_32 = _v;
            }
            #___private__isOpen_33 = _init__isOpen(this, false);
            get _isOpen() {
                return this.#___private__isOpen_33;
            }
            set _isOpen(_v) {
                this.#___private__isOpen_33 = _v;
            }
            #___private__resolvedLocale_34 = _init__resolvedLocale(this, 'en');
            get _resolvedLocale() {
                return this.#___private__resolvedLocale_34;
            }
            set _resolvedLocale(_v) {
                this.#___private__resolvedLocale_34 = _v;
            }
            #___private__fpInput_35 = _init__fpInput(this);
            get _fpInput() {
                return this.#___private__fpInput_35;
            }
            set _fpInput(_v) {
                this.#___private__fpInput_35 = _v;
            }
            #___private__hoursInput_36 = _init__hoursInput(this);
            get _hoursInput() {
                return this.#___private__hoursInput_36;
            }
            set _hoursInput(_v) {
                this.#___private__hoursInput_36 = _v;
            }
            #___private__minutesInput_37 = _init__minutesInput(this);
            get _minutesInput() {
                return this.#___private__minutesInput_37;
            }
            set _minutesInput(_v) {
                this.#___private__minutesInput_37 = _v;
            }
            #___private__secondsInput_38 = _init__secondsInput(this);
            get _secondsInput() {
                return this.#___private__secondsInput_38;
            }
            set _secondsInput(_v) {
                this.#___private__secondsInput_38 = _v;
            }
            #___private__periodBtn_39 = _init__periodBtn(this);
            get _periodBtn() {
                return this.#___private__periodBtn_39;
            }
            set _periodBtn(_v) {
                this.#___private__periodBtn_39 = _v;
            }
            #___private__controlEl_40 = _init__controlEl(this);
            get _controlEl() {
                return this.#___private__controlEl_40;
            }
            set _controlEl(_v) {
                this.#___private__controlEl_40 = _v;
            }
            #___private__clockBtn_41 = _init__clockBtn(this);
            get _clockBtn() {
                return this.#___private__clockBtn_41;
            }
            set _clockBtn(_v) {
                this.#___private__clockBtn_41 = _v;
            }
            #___private__floatingMenuContainer_42 = _init__floatingMenuContainer(this);
            get _floatingMenuContainer() {
                return this.#___private__floatingMenuContainer_42;
            }
            set _floatingMenuContainer(_v) {
                this.#___private__floatingMenuContainer_42 = _v;
            }
            _initialValue = '';
            _isSyncingFromFp = false;
            _floatingController = new FloatingController(this, {
                reference: ()=>this._controlEl,
                floating: ()=>this._fp?.calendarContainer ?? null,
                hoist: ()=>this.hoist,
                placement: ()=>'bottom-start',
                offset: 4,
                matchWidth: 'none'
            });
            // ── i18n Resolution Helper & Dependency Inversion ──────────────────────────
            _getLocaleRegistry() {
                try {
                    if (instance.isRegistered(TIME_PICKER_LOCALE_REGISTRY_TOKEN)) {
                        return instance.resolve(TIME_PICKER_LOCALE_REGISTRY_TOKEN);
                    }
                    return instance.resolve(_ViTimePickerLocaleRegistry);
                } catch (_e) {
                    return _ViTimePickerLocaleRegistry.getInstance();
                }
            }
            /** Returns the localized string for a given key, resolving direct props > config > i18n > registry > default. */ getI18nText(key) {
                if (key === 'hoursPlaceholder' && this.hoursPlaceholder) {
                    return this.hoursPlaceholder;
                }
                if (key === 'minutesPlaceholder' && this.minutesPlaceholder) {
                    return this.minutesPlaceholder;
                }
                if (key === 'secondsPlaceholder' && this.secondsPlaceholder) {
                    return this.secondsPlaceholder;
                }
                const cfgVal = this.config?.[key];
                if (typeof cfgVal === 'string' && cfgVal.length > 0) {
                    return cfgVal;
                }
                const i18nVal = this.i18n?.[key];
                if (typeof i18nVal === 'string' && i18nVal.length > 0) {
                    return i18nVal;
                }
                const registry = this._getLocaleRegistry();
                const localized = registry.getLocale(this._resolvedLocale, this.format);
                return localized[key] ?? '';
            }
            // ── Lifecycle ─────────────────────────────────────────────────────────────
            connectedCallback() {
                super.connectedCallback();
                if (this.config && !this._isProxy(this.config)) {
                    this.config = this._createConfigProxy(this.config);
                }
                if (this.i18n && !this._isProxy(this.i18n)) {
                    this.i18n = this._createConfigProxy(this.i18n);
                }
                this._resolvedLocale = resolveLocale(this.locale);
                this._syncStateFromValue(this.value);
                this._normalizeCurrentValue();
                if (!this.hasUpdated) {
                    this._initialValue = this.value;
                }
                if (this.hasUpdated && !this._fp) {
                    this._setupFlatpickr();
                }
            }
            willUpdate(changed) {
                super.willUpdate(changed);
                if (changed.has('config')) {
                    if (this.config && !this._isProxy(this.config)) {
                        this.config = this._createConfigProxy(this.config);
                    }
                }
                if (changed.has('i18n')) {
                    if (this.i18n && !this._isProxy(this.i18n)) {
                        this.i18n = this._createConfigProxy(this.i18n);
                    }
                }
                if (changed.has('format') || changed.has('showSeconds') || changed.has('value')) {
                    if (this.value) {
                        this._syncStateFromValue(this.value);
                        this._normalizeCurrentValue();
                    }
                }
            }
            async firstUpdated(_changed) {
                super.firstUpdated(_changed);
                this._floatingMenuContainer.addEventListener('keydown', this._handlePopupKeydown, true);
                this._resolvedLocale = resolveLocale(this.locale);
                await this._setupFlatpickr();
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this._floatingMenuContainer?.removeEventListener('keydown', this._handlePopupKeydown, true);
            }
            async updated(changed) {
                super.updated(changed);
                const valueChanged = changed.has('value');
                const formatChanged = changed.has('format');
                const stepChanged = changed.has('step');
                const secondsChanged = changed.has('showSeconds');
                const minMaxChanged = changed.has('min') || changed.has('max');
                const disabledTimesChanged = changed.has('disabledHours') || changed.has('disabledMinutes') || changed.has('disabledSeconds');
                const localeChanged = changed.has('locale');
                const configChanged = changed.has('config') || changed.has('i18n');
                if (localeChanged) {
                    this._resolvedLocale = resolveLocale(this.locale);
                    if (this._fp) {
                        await this._setupFlatpickr();
                    }
                    this._syncValidity();
                }
                if (configChanged) {
                    this._syncValidity();
                }
                if (valueChanged) {
                    this._syncStateFromValue(this.value);
                    this._normalizeCurrentValue();
                    this._internals.setFormValue(this.value);
                    this._syncFlatpickrValue();
                    this._syncValidity();
                    const cb = this.renderRoot?.querySelector('#unknown-checkbox');
                    if (cb) {
                        cb.indeterminate = isPartialUnknownTime(this.value, this.format);
                    }
                }
                if (formatChanged || stepChanged || secondsChanged) {
                    if (this.value) {
                        this._syncStateFromValue(this.value);
                        this._normalizeCurrentValue();
                    }
                    if (this._fp) {
                        await this._setupFlatpickr();
                    }
                    this._syncValidity();
                }
                if (minMaxChanged) {
                    if (this._fp) {
                        this._fp.set('minTime', this.min || undefined);
                        this._fp.set('maxTime', this.max || undefined);
                    }
                    this._syncValidity();
                }
                if (disabledTimesChanged) {
                    if (this._fp) {
                        await this._setupFlatpickr();
                    }
                    this._syncValidity();
                }
            }
            // ── FlatpickrMixin Contract ───────────────────────────────────────────────
            _getHiddenInput() {
                return this._fpInput ?? null;
            }
            async _setupFlatpickr() {
                await this._getLocaleRegistry().resolveLocale(this._resolvedLocale);
                const fpLocale = await loadLocale(this._resolvedLocale);
                await this._initFlatpickr(this._buildFpConfig(fpLocale), 'time');
                if (this._fp?.calendarContainer) {
                    this._fp.calendarContainer.addEventListener('keydown', this._handlePopupKeydown, true);
                }
                this._syncFlatpickrValue();
                this.requestUpdate();
            }
            _buildFpConfig(fpLocale) {
                return {
                    enableTime: true,
                    noCalendar: true,
                    time_24hr: this.format === '24',
                    minuteIncrement: this.step,
                    enableSeconds: this.showSeconds,
                    minTime: this.min || undefined,
                    maxTime: this.max || undefined,
                    disable: [
                        (date)=>this._isTimeDisabled(date.getHours(), date.getMinutes(), date.getSeconds())
                    ],
                    ...fpLocale ? {
                        locale: fpLocale
                    } : {},
                    dateFormat: this.format === '24' ? this.showSeconds ? 'H:i:S' : 'H:i' : this.showSeconds ? 'h:i:S K' : 'h:i K',
                    disableMobile: true,
                    clickOpens: false,
                    static: false,
                    ignoredFocusElements: [
                        this
                    ],
                    appendTo: this._floatingMenuContainer,
                    plugins: [
                        ViShadowDomPlugin()
                    ],
                    onChange: (dates, dateStr)=>{
                        this._onFlatpickrChange(dates[0], dateStr);
                    },
                    onOpen: ()=>{
                        this._isOpen = true;
                        this._floatingController.start();
                        this.requestUpdate();
                        setTimeout(()=>{
                            this._setupPopupFocusableElements();
                            const hourInput = this._fp?.calendarContainer?.querySelector('.flatpickr-hour');
                            if (hourInput) {
                                hourInput.focus();
                                hourInput.select();
                            }
                        }, 50);
                    },
                    onClose: ()=>{
                        this._isOpen = false;
                        this._floatingController.stop();
                        this._clockBtn?.focus();
                        this.requestUpdate();
                    }
                };
            }
            _setupPopupFocusableElements() {
                const calendar = this._fp?.calendarContainer || this._floatingMenuContainer;
                if (!calendar) return;
                const elements = calendar.querySelectorAll('.flatpickr-hour, .flatpickr-minute, .flatpickr-second, .flatpickr-am-pm');
                elements.forEach((el)=>{
                    el.tabIndex = 0;
                });
            }
            _syncFlatpickrValue() {
                if (!this._fp || this._isSyncingFromFp) return;
                if (this._isUnknown || !this.value) {
                    this._fp.clear(false);
                    return;
                }
                const parsed = parseTime(this.value, this.format);
                if (!parsed || parsed.hours === null || parsed.minutes === null) {
                    this._fp.clear(false);
                    return;
                }
                const d = new Date();
                const h24 = parsed.period !== undefined ? to24Hour(parsed.hours, parsed.period) : parsed.hours;
                d.setHours(h24, parsed.minutes, parsed.seconds ?? 0, 0);
                this._fp.setDate(d, false);
            }
            // ── ValidityMixin Contract ────────────────────────────────────────────────
            _customValidityText = '';
            setCustomValidity(message) {
                this._customValidityText = message;
                super.setCustomValidity(message);
            }
            _syncValidity() {
                super._syncValidity();
                const flags = this._testValidity();
                const isValid = !Object.values(flags).some(Boolean);
                if (isValid) {
                    this.validityMessage = '';
                    if (this.status === 'invalid' && !this._customValidityText) {
                        this.status = 'default';
                    }
                }
            }
            _testValidity() {
                if (this._customValidityText) {
                    this.validityMessage = this._customValidityText;
                    return {
                        customError: true
                    };
                }
                if (this.required && !this.value) {
                    const hasCustom = !!(this.config?.requiredMessage || this.i18n?.requiredMessage);
                    if (hasCustom) {
                        this.validityMessage = this.getI18nText('requiredMessage');
                    } else {
                        const temp = document.createElement('input');
                        temp.required = true;
                        this.validityMessage = temp.validationMessage || this.getI18nText('requiredMessage');
                    }
                    return {
                        valueMissing: true
                    };
                }
                if (this.value && !this._isUnknown && !isUnknownTime(this.value)) {
                    if (!isPartialUnknownTime(this.value, this.format)) {
                        const parsed = parseTime(this.value, this.format);
                        if (!parsed) {
                            this.validityMessage = this.getI18nText('invalidMessage');
                            return {
                                badInput: true
                            };
                        }
                        if (this.min && compareTimes(this.value, this.min) < 0) {
                            const hasCustom = !!(this.config?.minMessage || this.i18n?.minMessage);
                            if (hasCustom) {
                                this.validityMessage = this.getI18nText('minMessage').replace('{min}', this.min);
                            } else {
                                const temp = document.createElement('input');
                                temp.type = 'time';
                                temp.min = this.min;
                                temp.value = '00:00';
                                this.validityMessage = temp.validationMessage || this.getI18nText('minMessage').replace('{min}', this.min);
                            }
                            return {
                                rangeUnderflow: true
                            };
                        }
                        if (this.max && compareTimes(this.value, this.max) > 0) {
                            const hasCustom = !!(this.config?.maxMessage || this.i18n?.maxMessage);
                            if (hasCustom) {
                                this.validityMessage = this.getI18nText('maxMessage').replace('{max}', this.max);
                            } else {
                                const temp = document.createElement('input');
                                temp.type = 'time';
                                temp.max = this.max;
                                temp.value = '23:59';
                                this.validityMessage = temp.validationMessage || this.getI18nText('maxMessage').replace('{max}', this.max);
                            }
                            return {
                                rangeOverflow: true
                            };
                        }
                        // Disabled times validation:
                        if (parsed.hours !== null && parsed.hours !== undefined) {
                            const h = this.format === '12' && parsed.period ? to24Hour(parsed.hours, parsed.period) : parsed.hours;
                            const m = parsed.minutes ?? 0;
                            const s = parsed.seconds ?? 0;
                            const isHourDisabled = this._isHourDisabled(h);
                            const isMinuteDisabled = this._isMinuteDisabled(m, h);
                            const isSecondDisabled = this.showSeconds && parsed.seconds !== null && parsed.seconds !== undefined && this._isSecondDisabled(s, m, h);
                            if (isHourDisabled || isMinuteDisabled || isSecondDisabled) {
                                this.validityMessage = this.getI18nText('disabledTimeMessage');
                                return {
                                    customError: true
                                };
                            }
                        }
                    }
                }
                this.validityMessage = '';
                return {};
            }
            _isHourDisabled(h) {
                if (!this.disabledHours) return false;
                if (typeof this.disabledHours === 'function') {
                    return this.disabledHours(h);
                }
                if (Array.isArray(this.disabledHours)) {
                    return this.disabledHours.includes(h);
                }
                return false;
            }
            _isMinuteDisabled(m, h = 0) {
                if (!this.disabledMinutes) return false;
                if (typeof this.disabledMinutes === 'function') {
                    return this.disabledMinutes(m, h);
                }
                if (Array.isArray(this.disabledMinutes)) {
                    return this.disabledMinutes.includes(m);
                }
                return false;
            }
            _isSecondDisabled(s, m = 0, h = 0) {
                if (!this.disabledSeconds) return false;
                if (typeof this.disabledSeconds === 'function') {
                    return this.disabledSeconds(s, m, h);
                }
                if (Array.isArray(this.disabledSeconds)) {
                    return this.disabledSeconds.includes(s);
                }
                return false;
            }
            _isTimeDisabled(h, m, s = 0) {
                if (this._isHourDisabled(h)) return true;
                if (this._isMinuteDisabled(m, h)) return true;
                if (this.showSeconds && this._isSecondDisabled(s, m, h)) return true;
                return false;
            }
            formResetCallback() {
                super.formResetCallback();
                this.value = this._initialValue;
                this._syncStateFromValue(this.value);
                this._normalizeCurrentValue();
                this._internals.setFormValue(this.value);
                this._syncFlatpickrValue();
                this._customValidityText = '';
                this.validityMessage = '';
                this.status = 'default';
            }
            // ── Public API ────────────────────────────────────────────────────────────
            focus(options) {
                if (this._hoursInput) {
                    this._hoursInput.focus(options);
                } else {
                    super.focus(options);
                }
            }
            open() {
                if (this.disabled || this.readonly || this._isUnknown) return;
                this._fp?.open();
            }
            close() {
                this._isOpen = false;
                this._fp?.close();
                this._floatingController.stop();
                this._clockBtn?.focus();
                this.requestUpdate();
            }
            clear() {
                if (this.disabled || this.readonly) return;
                this._hours = '';
                this._minutes = '';
                this._seconds = '';
                this._period = 'AM';
                this._isUnknown = false;
                this.value = '';
                this._internals.setFormValue('');
                this._customValidityText = '';
                this.validityMessage = '';
                if (this.status === 'invalid') {
                    this.status = 'default';
                }
                this._internals.setValidity({});
                this._fp?.clear(false);
                this._emitChange();
                this.dispatchEvent(new CustomEvent('vialiq-clear', {
                    bubbles: true,
                    composed: true
                }));
            }
            stepUp(segment = 'minutes') {
                if (this.disabled || this.readonly || this._isUnknown) return;
                this._stepSegment(segment, 'up');
            }
            stepDown(segment = 'minutes') {
                if (this.disabled || this.readonly || this._isUnknown) return;
                this._stepSegment(segment, 'down');
            }
            /** Sets the time picker to the current system time */ setCurrentTime() {
                if (this.disabled || this.readonly) return;
                const now = new Date();
                const hours24 = now.getHours();
                const minutes = now.getMinutes();
                const seconds = now.getSeconds();
                if (this.format === '12') {
                    const converted = to12Hour(hours24);
                    this._hours = pad2(converted.hours);
                    this._minutes = pad2(minutes);
                    this._seconds = this.showSeconds ? pad2(seconds) : '';
                    this._period = converted.period;
                } else {
                    this._hours = pad2(hours24);
                    this._minutes = pad2(minutes);
                    this._seconds = this.showSeconds ? pad2(seconds) : '';
                }
                this._isUnknown = false;
                this._customValidityText = '';
                this.validityMessage = '';
                if (this.status === 'invalid') {
                    this.status = 'default';
                }
                this._commitTime();
            }
            /** Alias for setCurrentTime */ now() {
                this.setCurrentTime();
            }
            // ── Private Event & State Handlers ────────────────────────────────────────
            _syncStateFromValue(val) {
                if (isUnknownTime(val)) {
                    this._isUnknown = true;
                    this._hours = '??';
                    this._minutes = '??';
                    this._seconds = this.showSeconds ? '??' : '';
                    if (this._hoursInput) this._hoursInput.value = this._hours;
                    if (this._minutesInput) this._minutesInput.value = this._minutes;
                    if (this._secondsInput) this._secondsInput.value = this._seconds;
                    return;
                }
                if (isPartialUnknownTime(val, this.format)) {
                    this._isUnknown = false;
                    const parsed = parseTime(val, this.format);
                    if (parsed) {
                        this._hours = parsed.rawHours ?? (parsed.hours !== null && parsed.hours !== undefined ? pad2(parsed.hours) : '??');
                        this._minutes = parsed.rawMinutes ?? (parsed.minutes !== null && parsed.minutes !== undefined ? pad2(parsed.minutes) : '??');
                        this._seconds = this.showSeconds ? parsed.rawSeconds ?? (parsed.seconds !== null && parsed.seconds !== undefined ? pad2(parsed.seconds) : '??') : '';
                        if (this.format === '12' && parsed.period) {
                            this._period = parsed.period;
                        }
                        if (this._hoursInput) this._hoursInput.value = this._hours;
                        if (this._minutesInput) this._minutesInput.value = this._minutes;
                        if (this._secondsInput) this._secondsInput.value = this._seconds;
                        return;
                    }
                }
                this._isUnknown = false;
                const parsed = parseTime(val, this.format);
                if (!parsed) {
                    this._hours = '';
                    this._minutes = '';
                    this._seconds = '';
                    this._period = 'AM';
                    if (this._hoursInput) this._hoursInput.value = '';
                    if (this._minutesInput) this._minutesInput.value = '';
                    if (this._secondsInput) this._secondsInput.value = '';
                    return;
                }
                this._hours = parsed.hours !== null && parsed.hours !== undefined ? pad2(parsed.hours) : '';
                this._minutes = parsed.minutes !== null && parsed.minutes !== undefined ? pad2(parsed.minutes) : '';
                this._seconds = parsed.seconds !== null && parsed.seconds !== undefined ? pad2(parsed.seconds) : this.showSeconds ? '00' : '';
                if (this.format === '12') {
                    this._period = parsed.period || 'AM';
                }
                if (this._hoursInput) this._hoursInput.value = this._hours;
                if (this._minutesInput) this._minutesInput.value = this._minutes;
                if (this._secondsInput) this._secondsInput.value = this._seconds;
            }
            /**
   * Normalizes this.value and the form value to match this.format and this.showSeconds,
   * enforcing a single source of truth between displayed segments and public value.
   */ _normalizeCurrentValue() {
                if (!this.value) return;
                if (this._isUnknown || isUnknownTime(this.value)) {
                    const unknownStr = this.showSeconds ? '??:??:??' : '??:??';
                    if (this.value !== unknownStr) {
                        this.value = unknownStr;
                        this._internals.setFormValue(unknownStr);
                        this._syncFlatpickrValue();
                    }
                    return;
                }
                const isPartial = this._hours === '??' || this._minutes === '??' || this.showSeconds && this._seconds === '??';
                if (isPartial) {
                    const hStr = this._hours || '??';
                    const mStr = this._minutes || '??';
                    const sStr = this.showSeconds ? this._seconds || '??' : '';
                    let formatted = `${hStr}:${mStr}`;
                    if (this.showSeconds) formatted = `${formatted}:${sStr}`;
                    if (this.format === '12') formatted = `${formatted} ${this._period}`;
                    if (this.value !== formatted) {
                        this.value = formatted;
                        this._internals.setFormValue(this.value);
                    }
                    return;
                }
                if (!this._hours || !this._minutes || this.showSeconds && !this._seconds) {
                    return;
                }
                const h = parseInt(this._hours, 10);
                const m = parseInt(this._minutes, 10);
                const s = this.showSeconds ? parseInt(this._seconds, 10) : undefined;
                if (Number.isNaN(h) || Number.isNaN(m) || s !== undefined && Number.isNaN(s)) {
                    return;
                }
                const components = {
                    hours: h,
                    minutes: m,
                    seconds: s,
                    rawHours: this._hours,
                    rawMinutes: this._minutes,
                    rawSeconds: this._seconds,
                    ...this.format === '12' ? {
                        period: this._period
                    } : {}
                };
                const formatted = formatTime(components, this.format, this.showSeconds);
                if (this.value !== formatted) {
                    this.value = formatted;
                    this._internals.setFormValue(this.value);
                    this._syncFlatpickrValue();
                }
            }
            _onFlatpickrChange(date, _dateStr) {
                if (!date) return;
                const hours24 = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();
                if (this.format === '12') {
                    const converted = to12Hour(hours24);
                    this._hours = pad2(converted.hours);
                    this._minutes = pad2(minutes);
                    this._seconds = this.showSeconds ? pad2(seconds) : '';
                    this._period = converted.period;
                } else {
                    this._hours = pad2(hours24);
                    this._minutes = pad2(minutes);
                    this._seconds = this.showSeconds ? pad2(seconds) : '';
                }
                this._isUnknown = false;
                this._customValidityText = '';
                this.validityMessage = '';
                if (this.status === 'invalid') {
                    this.status = 'default';
                }
                this._isSyncingFromFp = true;
                try {
                    this._commitTime();
                } finally{
                    this._isSyncingFromFp = false;
                }
            }
            _handleUnknownToggle(e) {
                if (this.disabled || this.readonly) return;
                const target = e.target;
                this._isUnknown = target.checked;
                if (this._isUnknown) {
                    const unknownStr = this.showSeconds ? '??:??:??' : '??:??';
                    this._hours = '??';
                    this._minutes = '??';
                    this._seconds = this.showSeconds ? '??' : '';
                    this.value = unknownStr;
                    this._internals.setFormValue(unknownStr);
                    this._fp?.clear(false);
                    this._emitChange();
                } else {
                    this.clear();
                }
            }
            _togglePeriod() {
                if (this.disabled || this.readonly || this._isUnknown) return;
                this._period = this._period === 'AM' ? 'PM' : 'AM';
                this._commitTime();
            }
            _focusPrimary() {
                if (this.disabled || this._isUnknown) return;
                this._hoursInput?.focus();
                this._hoursInput?.select();
            }
            _handleControlClick(e) {
                if (this.disabled || this._isUnknown) return;
                const target = e.target;
                if (target === this._controlEl || target.classList.contains('timepicker-inputs') || target.classList.contains('timepicker-separator')) {
                    this._focusPrimary();
                }
            }
            _handlePaste(e) {
                if (this.disabled || this.readonly) return;
                const text = e.clipboardData?.getData('text');
                if (!text) return;
                const parsed = parsePastedTime(text, this.format);
                if (!parsed) return;
                e.preventDefault();
                e.stopPropagation();
                if (isUnknownTime(text)) {
                    this._isUnknown = true;
                    this._hours = '??';
                    this._minutes = '??';
                    this._seconds = this.showSeconds ? '??' : '';
                } else {
                    this._isUnknown = false;
                    this._hours = parsed.rawHours ?? (parsed.hours !== null && parsed.hours !== undefined ? pad2(parsed.hours) : '??');
                    this._minutes = parsed.rawMinutes ?? (parsed.minutes !== null && parsed.minutes !== undefined ? pad2(parsed.minutes) : '??');
                    this._seconds = this.showSeconds ? parsed.rawSeconds ?? (parsed.seconds !== null && parsed.seconds !== undefined ? pad2(parsed.seconds) : '00') : '';
                    if (this.format === '12' && parsed.period) {
                        this._period = parsed.period;
                    }
                }
                this._commitTime();
            }
            _handleSegmentFocus(e) {
                const input = e.target;
                setTimeout(()=>{
                    const activeEl = this.shadowRoot?.activeElement ?? document.activeElement;
                    if (activeEl === input || input.matches(':focus')) {
                        input.select();
                    }
                }, 0);
            }
            _handleHoursBlur() {
                if (this._hours && this._hours !== '??') {
                    const minHour = this.format === '12' ? 1 : 0;
                    const val = parseInt(this._hours, 10);
                    this._hours = pad2(Math.max(minHour, val));
                    if (this._hoursInput) {
                        this._hoursInput.value = this._hours;
                    }
                    this._commitTime();
                }
            }
            _handleMinutesBlur() {
                if (this._minutes && this._minutes !== '??') {
                    const val = parseInt(this._minutes, 10);
                    this._minutes = pad2(val);
                    if (this._minutesInput) {
                        this._minutesInput.value = this._minutes;
                    }
                    this._commitTime();
                }
            }
            _handleSecondsBlur() {
                if (this._seconds && this._seconds !== '??') {
                    const val = parseInt(this._seconds, 10);
                    this._seconds = pad2(val);
                    if (this._secondsInput) {
                        this._secondsInput.value = this._seconds;
                    }
                    this._commitTime();
                }
            }
            _handleControlFocusout(e) {
                const relatedTarget = e.relatedTarget;
                if (relatedTarget && this._controlEl?.contains(relatedTarget)) {
                    return;
                }
                // Entire control lost focus:
                if (this._hours && !this._minutes) {
                    this._minutes = '00';
                    if (this._minutesInput) this._minutesInput.value = '00';
                    if (this.showSeconds && !this._seconds) {
                        this._seconds = '00';
                        if (this._secondsInput) this._secondsInput.value = '00';
                    }
                    this._commitTime();
                } else if (!this._hours && this._minutes) {
                    this._hours = this.format === '12' ? '12' : '00';
                    if (this._hoursInput) this._hoursInput.value = this._hours;
                    if (this.showSeconds && !this._seconds) {
                        this._seconds = '00';
                        if (this._secondsInput) this._secondsInput.value = '00';
                    }
                    this._commitTime();
                }
            }
            _handleHoursInput(e) {
                const input = e.target;
                if (this.allowUnknown && input.value.includes('?')) {
                    this._hours = '??';
                    input.value = '??';
                    if (this._minutes === '??') {
                        this._isUnknown = true;
                    }
                    this._commitTime();
                    this._minutesInput?.focus();
                    this._minutesInput?.select();
                    return;
                }
                let raw = input.value.replace(/\D/g, '');
                if (!raw) {
                    this._hours = '';
                    input.value = '';
                    if (!this._minutes) {
                        this._commitTime();
                    }
                    return;
                }
                // When typing a new digit over existing 2 digits without selection, start fresh with the new digit
                if (raw.length > 2) {
                    raw = raw.slice(-1);
                }
                let val = parseInt(raw, 10);
                const maxHour = this.format === '12' ? 12 : 23;
                const minHour = this.format === '12' ? 1 : 0;
                if (val > maxHour) {
                    val = maxHour;
                    raw = String(val);
                }
                this._hours = raw;
                input.value = raw;
                // Auto-advance logic:
                // In 24h mode: if 2 digits (e.g. "14", "08") OR 1 digit > 2 (e.g. "3" -> "03", "9" -> "09")
                // In 12h mode: if 2 digits (e.g. "12", "08") OR 1 digit > 1 (e.g. "2" -> "02", "9" -> "09")
                const shouldAdvance = raw.length >= 2 || this.format === '24' && val > 2 || this.format === '12' && val > 1;
                if (shouldAdvance) {
                    this._hours = pad2(Math.max(minHour, val));
                    input.value = this._hours;
                    this._commitTime();
                    this._minutesInput?.focus();
                    this._minutesInput?.select();
                }
            }
            _handleMinutesInput(e) {
                const input = e.target;
                if (this.allowUnknown && input.value.includes('?')) {
                    this._minutes = '??';
                    input.value = '??';
                    if (this._hours === '??') {
                        this._isUnknown = true;
                    }
                    this._commitTime();
                    if (this.showSeconds && this._secondsInput) {
                        this._secondsInput.focus();
                        this._secondsInput.select();
                    } else if (this.format === '12' && this._periodBtn) {
                        this._periodBtn.focus();
                    }
                    return;
                }
                let raw = input.value.replace(/\D/g, '');
                if (!raw) {
                    this._minutes = '';
                    input.value = '';
                    if (!this._hours) {
                        this._commitTime();
                    }
                    return;
                }
                if (raw.length > 2) {
                    raw = raw.slice(-1);
                }
                let val = parseInt(raw, 10);
                if (val > 59) {
                    val = 59;
                    raw = String(val);
                }
                this._minutes = raw;
                input.value = raw;
                const shouldAdvance = raw.length >= 2 || val > 5;
                if (shouldAdvance) {
                    this._minutes = pad2(val);
                    input.value = this._minutes;
                    this._commitTime();
                    if (this.showSeconds && this._secondsInput) {
                        this._secondsInput.focus();
                        this._secondsInput.select();
                    } else if (this.format === '12' && this._periodBtn) {
                        this._periodBtn.focus();
                    }
                }
            }
            _handleSecondsInput(e) {
                const input = e.target;
                if (this.allowUnknown && input.value.includes('?')) {
                    this._seconds = '??';
                    input.value = '??';
                    this._commitTime();
                    return;
                }
                let raw = input.value.replace(/\D/g, '');
                if (!raw) {
                    this._seconds = '';
                    input.value = '';
                    this._commitTime();
                    return;
                }
                if (raw.length > 2) {
                    raw = raw.slice(-1);
                }
                let val = parseInt(raw, 10);
                if (val > 59) {
                    val = 59;
                    raw = String(val);
                }
                this._seconds = raw;
                input.value = raw;
                const shouldAdvance = raw.length >= 2 || val > 5;
                if (shouldAdvance) {
                    this._seconds = pad2(val);
                    input.value = this._seconds;
                    this._commitTime();
                    if (this.format === '12' && this._periodBtn) {
                        this._periodBtn.focus();
                    }
                }
            }
            _handleHoursKeydown(e) {
                if (this.disabled || this.readonly) return;
                if (e.altKey && e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.open();
                    return;
                }
                if (e.key === 'Escape' && this._isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this._stepSegment('hours', 'up');
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this._stepSegment('hours', 'down');
                } else if (e.key === 'PageUp') {
                    e.preventDefault();
                    this._stepSegment('hours', 'up', 5);
                } else if (e.key === 'PageDown') {
                    e.preventDefault();
                    this._stepSegment('hours', 'down', 5);
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    this._hours = pad2(this.format === '12' ? 1 : 0);
                    if (this._hoursInput) this._hoursInput.value = this._hours;
                    this._commitTime();
                } else if (e.key === 'End') {
                    e.preventDefault();
                    this._hours = pad2(this.format === '12' ? 12 : 23);
                    if (this._hoursInput) this._hoursInput.value = this._hours;
                    this._commitTime();
                } else if (e.key === 'ArrowRight' || e.key === ':' || e.key === 'Enter') {
                    e.preventDefault();
                    this._minutesInput?.focus();
                    this._minutesInput?.select();
                } else if (this.format === '12') {
                    if (e.key === 'a' || e.key === 'A') {
                        e.preventDefault();
                        this._period = 'AM';
                        this._commitTime();
                    } else if (e.key === 'p' || e.key === 'P') {
                        e.preventDefault();
                        this._period = 'PM';
                        this._commitTime();
                    }
                }
            }
            _handleMinutesKeydown(e) {
                if (this.disabled || this.readonly) return;
                if (e.altKey && e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.open();
                    return;
                }
                if (e.key === 'Escape' && this._isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this._stepSegment('minutes', 'up');
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this._stepSegment('minutes', 'down');
                } else if (e.key === 'PageUp') {
                    e.preventDefault();
                    this._stepSegment('minutes', 'up', 15);
                } else if (e.key === 'PageDown') {
                    e.preventDefault();
                    this._stepSegment('minutes', 'down', 15);
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    this._minutes = '00';
                    this._commitTime();
                } else if (e.key === 'End') {
                    e.preventDefault();
                    this._minutes = '59';
                    this._commitTime();
                } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' && !this._minutes) {
                    e.preventDefault();
                    this._hoursInput?.focus();
                    this._hoursInput?.select();
                } else if (e.key === 'ArrowRight' || e.key === ':' || e.key === 'Enter') {
                    e.preventDefault();
                    if (this.showSeconds && this._secondsInput) {
                        this._secondsInput.focus();
                        this._secondsInput.select();
                    } else if (this.format === '12' && this._periodBtn) {
                        this._periodBtn.focus();
                    }
                } else if (this.format === '12') {
                    if (e.key === 'a' || e.key === 'A') {
                        e.preventDefault();
                        this._period = 'AM';
                        this._commitTime();
                    } else if (e.key === 'p' || e.key === 'P') {
                        e.preventDefault();
                        this._period = 'PM';
                        this._commitTime();
                    }
                }
            }
            _handleSecondsKeydown(e) {
                if (this.disabled || this.readonly) return;
                if (e.altKey && e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.open();
                    return;
                }
                if (e.key === 'Escape' && this._isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this._stepSegment('seconds', 'up');
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this._stepSegment('seconds', 'down');
                } else if (e.key === 'PageUp') {
                    e.preventDefault();
                    this._stepSegment('seconds', 'up', 15);
                } else if (e.key === 'PageDown') {
                    e.preventDefault();
                    this._stepSegment('seconds', 'down', 15);
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    this._seconds = '00';
                    this._commitTime();
                } else if (e.key === 'End') {
                    e.preventDefault();
                    this._seconds = '59';
                    this._commitTime();
                } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' && !this._seconds) {
                    e.preventDefault();
                    this._minutesInput?.focus();
                    this._minutesInput?.select();
                } else if (e.key === 'ArrowRight' && this.format === '12' && this._periodBtn) {
                    e.preventDefault();
                    this._periodBtn.focus();
                } else if (this.format === '12') {
                    if (e.key === 'a' || e.key === 'A') {
                        e.preventDefault();
                        this._period = 'AM';
                        this._commitTime();
                    } else if (e.key === 'p' || e.key === 'P') {
                        e.preventDefault();
                        this._period = 'PM';
                        this._commitTime();
                    }
                }
            }
            _handlePeriodKeydown(e) {
                if (this.disabled || this.readonly || this._isUnknown) return;
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    if (this.showSeconds && this._secondsInput) {
                        this._secondsInput.focus();
                        this._secondsInput.select();
                    } else {
                        this._minutesInput?.focus();
                        this._minutesInput?.select();
                    }
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === ' ') {
                    e.preventDefault();
                    this._togglePeriod();
                } else if (e.key === 'a' || e.key === 'A') {
                    e.preventDefault();
                    this._period = 'AM';
                    this._commitTime();
                } else if (e.key === 'p' || e.key === 'P') {
                    e.preventDefault();
                    this._period = 'PM';
                    this._commitTime();
                }
            }
            _handlePopupKeydown = (e)=>{
                if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.close();
                    return;
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.close();
                    return;
                }
                const calendar = this._fp?.calendarContainer || this._floatingMenuContainer;
                if (!calendar) return;
                const timeControls = Array.from(calendar.querySelectorAll('.flatpickr-hour, .flatpickr-minute, .flatpickr-second, .flatpickr-am-pm')).filter((el)=>el.offsetParent !== null || getComputedStyle(el).display !== 'none');
                if (timeControls.length === 0) return;
                for (const el of timeControls){
                    if (el.tabIndex !== 0) el.tabIndex = 0;
                }
                const active = this.shadowRoot?.activeElement || calendar.querySelector(':focus');
                const currentIndex = active ? timeControls.indexOf(active) : -1;
                if (e.key === 'Tab') {
                    e.preventDefault();
                    e.stopPropagation();
                    const nextIndex = e.shiftKey ? currentIndex > 0 ? currentIndex - 1 : timeControls.length - 1 : currentIndex >= 0 ? (currentIndex + 1) % timeControls.length : 0;
                    const nextEl = timeControls[nextIndex];
                    if (nextEl) {
                        nextEl.focus();
                        if (nextEl instanceof HTMLInputElement) {
                            nextEl.select();
                        }
                    }
                    return;
                }
                if (e.key === 'ArrowRight' || e.key === ':') {
                    if (currentIndex >= 0 && currentIndex < timeControls.length - 1) {
                        e.preventDefault();
                        e.stopPropagation();
                        const nextEl = timeControls[currentIndex + 1];
                        nextEl.focus();
                        if (nextEl instanceof HTMLInputElement) {
                            nextEl.select();
                        }
                    }
                    return;
                }
                if (e.key === 'ArrowLeft') {
                    if (currentIndex > 0) {
                        e.preventDefault();
                        e.stopPropagation();
                        const prevEl = timeControls[currentIndex - 1];
                        prevEl.focus();
                        if (prevEl instanceof HTMLInputElement) {
                            prevEl.select();
                        }
                    }
                    return;
                }
            };
            _stepSegment(segment, direction, delta) {
                if (this._isUnknown) {
                    this._isUnknown = false;
                }
                if (segment === 'hours') {
                    const step = delta ?? this.hourStep;
                    const minH = this.format === '12' ? 1 : 0;
                    const maxH = this.format === '12' ? 12 : 23;
                    const parsed = parseInt(this._hours, 10);
                    const current = Number.isNaN(parsed) ? this.format === '12' ? 12 : 0 : parsed;
                    const stepped = stepSegment(current, step, minH, maxH, direction);
                    this._hours = pad2(stepped);
                    if (this._hoursInput) this._hoursInput.value = this._hours;
                    if (!this._minutes) this._minutes = '00';
                    if (this.showSeconds && !this._seconds) this._seconds = '00';
                } else if (segment === 'minutes') {
                    const step = delta ?? this.step;
                    const parsed = parseInt(this._minutes, 10);
                    const current = Number.isNaN(parsed) ? 0 : parsed;
                    const stepped = stepSegment(current, step, 0, 59, direction);
                    this._minutes = pad2(stepped);
                    if (this._minutesInput) this._minutesInput.value = this._minutes;
                    if (!this._hours) this._hours = this.format === '12' ? '12' : '00';
                    if (this.showSeconds && !this._seconds) this._seconds = '00';
                } else if (segment === 'seconds') {
                    if (!this.showSeconds) return;
                    const step = delta ?? this.secondStep;
                    const parsed = parseInt(this._seconds, 10);
                    const current = Number.isNaN(parsed) ? 0 : parsed;
                    const stepped = stepSegment(current, step, 0, 59, direction);
                    this._seconds = pad2(stepped);
                    if (this._secondsInput) this._secondsInput.value = this._seconds;
                    if (!this._hours) this._hours = this.format === '12' ? '12' : '00';
                    if (!this._minutes) this._minutes = '00';
                }
                this._commitTime();
            }
            _commitTime() {
                if (this._isUnknown) {
                    const unknownStr = this.showSeconds ? '??:??:??' : '??:??';
                    this.value = unknownStr;
                    this._internals.setFormValue(unknownStr);
                    this._syncFlatpickrValue();
                    this._customValidityText = '';
                    this.validityMessage = '';
                    if (this.status === 'invalid') {
                        this.status = 'default';
                    }
                    this._internals.setValidity({});
                    this._emitChange();
                    return;
                }
                if (!this._hours && !this._minutes && (!this.showSeconds || !this._seconds)) {
                    this.value = '';
                    this._internals.setFormValue('');
                    this._syncFlatpickrValue();
                    this._emitChange();
                    return;
                }
                const isPartial = this._hours === '??' || this._minutes === '??' || this._seconds === '??';
                if (isPartial) {
                    const hStr = this._hours || '??';
                    const mStr = this._minutes || '??';
                    const sStr = this.showSeconds ? this._seconds || '??' : '';
                    let formatted = `${hStr}:${mStr}`;
                    if (this.showSeconds) formatted = `${formatted}:${sStr}`;
                    if (this.format === '12') formatted = `${formatted} ${this._period}`;
                    this.value = formatted;
                    this._internals.setFormValue(this.value);
                    this._emitChange();
                    return;
                }
                // Do NOT commit incomplete partial strings like "14:" or ":30" during typing
                if (!this._hours || !this._minutes || this.showSeconds && !this._seconds) {
                    return;
                }
                const h = parseInt(this._hours, 10);
                const m = parseInt(this._minutes, 10);
                const s = this.showSeconds ? parseInt(this._seconds, 10) : undefined;
                const components = {
                    hours: h,
                    minutes: m,
                    seconds: s,
                    rawHours: this._hours,
                    rawMinutes: this._minutes,
                    rawSeconds: this._seconds,
                    ...this.format === '12' ? {
                        period: this._period
                    } : {}
                };
                const formatted = formatTime(components, this.format, this.showSeconds);
                this.value = formatted;
                this._internals.setFormValue(this.value);
                this._syncFlatpickrValue();
                this._emitChange();
            }
            _emitChange() {
                let components = null;
                let isoValue = null;
                const isPartial = isPartialUnknownTime(this.value, this.format);
                if (!this._isUnknown && this.value) {
                    components = parseTime(this.value, this.format);
                    isoValue = toIsoTime(components, this.showSeconds, this.timezone);
                } else if (this._isUnknown) {
                    isoValue = this.showSeconds ? '??:??:??' : '??:??';
                }
                const detail = {
                    value: this.value || null,
                    isoValue,
                    hours: components ? components.hours : null,
                    minutes: components ? components.minutes : null,
                    seconds: components?.seconds ?? null,
                    period: components?.period ?? null,
                    isUnknown: this._isUnknown,
                    isPartialUnknown: isPartial,
                    timezone: this.timezone || undefined,
                    formattedValue: this.value
                };
                this.dispatchEvent(new CustomEvent(VI_TIME_PICKER_CHANGE, {
                    detail,
                    bubbles: true,
                    composed: true
                }));
                // Legacy alias event
                this.dispatchEvent(new CustomEvent('vialiq-change', {
                    detail,
                    bubbles: true,
                    composed: true
                }));
            }
            // ── Render ────────────────────────────────────────────────────────────────
            render() {
                const hoursNumeric = this._hours && this._hours !== '??' ? parseInt(this._hours, 10) : undefined;
                const minutesNumeric = this._minutes && this._minutes !== '??' ? parseInt(this._minutes, 10) : undefined;
                const secondsNumeric = this._seconds && this._seconds !== '??' ? parseInt(this._seconds, 10) : undefined;
                const describedBy = this.status === 'invalid' && this.validityMessage ? 'validation-msg' : this.helperText ? 'helper-text' : A;
                const hoursPlaceholder = this.getI18nText('hoursPlaceholder');
                const minutesPlaceholder = this.getI18nText('minutesPlaceholder');
                const secondsPlaceholder = this.getI18nText('secondsPlaceholder');
                const hoursAriaLabel = this.getI18nText('hoursAriaLabel');
                const minutesAriaLabel = this.getI18nText('minutesAriaLabel');
                const secondsAriaLabel = this.getI18nText('secondsAriaLabel');
                const hoursUnit = this.getI18nText('hoursUnit');
                const minutesUnit = this.getI18nText('minutesUnit');
                const secondsUnit = this.getI18nText('secondsUnit');
                const emptyValueText = this.getI18nText('emptyValueText');
                const unknownValueText = this.getI18nText('unknownValueText');
                const hoursValueText = hoursNumeric !== undefined ? `${hoursNumeric} ${hoursUnit}` : this._hours === '??' ? `${unknownValueText} ${hoursUnit}` : emptyValueText;
                const minutesValueText = minutesNumeric !== undefined ? `${minutesNumeric} ${minutesUnit}` : this._minutes === '??' ? `${unknownValueText} ${minutesUnit}` : emptyValueText;
                const secondsValueText = secondsNumeric !== undefined ? `${secondsNumeric} ${secondsUnit}` : this._seconds === '??' ? `${unknownValueText} ${secondsUnit}` : emptyValueText;
                const groupAriaLabel = this.label || this.getI18nText('groupAriaLabel');
                const clockAriaLabel = this.getI18nText('clockAriaLabel');
                const clearAriaLabel = this.getI18nText('clearAriaLabel');
                const nowLabel = this.getI18nText('nowLabel');
                const nowAriaLabel = this.getI18nText('nowAriaLabel');
                const timezoneAriaLabel = this.getI18nText('timezoneAriaLabel');
                const periodAriaLabel = this.getI18nText('periodAriaLabel').replace('{period}', this._period);
                const unknownLabel = this.getI18nText('unknownLabel');
                const popupAriaLabel = this.getI18nText('popupAriaLabel');
                return b`
      ${this.label ? b`<label
            id="timepicker-label"
            for="hours-input"
            class="timepicker-label"
            part="label"
            @click="${this._focusPrimary}"
            >${this.label}</label
          >` : A}
      <slot name="label"></slot>

      <!-- Hidden input flatpickr binds to -->
      <input
        type="hidden"
        id="fp-input"
        tabindex="-1"
        aria-hidden="true"
        name="${this.name}"
        .value="${this.value}"
      />

      <div
        part="control"
        class="timepicker-control"
        role="group"
        aria-labelledby="${this.label ? 'timepicker-label' : A}"
        aria-label="${this.label || groupAriaLabel}"
        @click="${this._handleControlClick}"
        @focusout="${this._handleControlFocusout}"
        @paste="${this._handlePaste}"
      >
        <div class="timepicker-inputs" role="presentation" @paste="${this._handlePaste}">
          <input
            id="hours-input"
            part="hours-input"
            class="timepicker-segment"
            type="text"
            inputmode="numeric"
            role="spinbutton"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder="${hoursPlaceholder}"
            aria-label="${hoursAriaLabel}"
            aria-valuenow="${hoursNumeric ?? A}"
            aria-valuemin="${this.format === '12' ? 1 : 0}"
            aria-valuemax="${this.format === '12' ? 12 : 23}"
            aria-valuetext="${hoursValueText}"
            aria-required="${this.required}"
            aria-invalid="${this.status === 'invalid'}"
            aria-describedby="${describedBy}"
            ?disabled="${this.disabled || this._isUnknown}"
            ?readonly="${this.readonly}"
            .value="${this._hours}"
            @focus="${this._handleSegmentFocus}"
            @blur="${this._handleHoursBlur}"
            @input="${this._handleHoursInput}"
            @keydown="${this._handleHoursKeydown}"
            @paste="${this._handlePaste}"
          />
          <span part="separator" class="timepicker-separator" aria-hidden="true"
            >:</span
          >
          <input
            id="minutes-input"
            part="minutes-input"
            class="timepicker-segment"
            type="text"
            inputmode="numeric"
            role="spinbutton"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder="${minutesPlaceholder}"
            aria-label="${minutesAriaLabel}"
            aria-valuenow="${minutesNumeric ?? A}"
            aria-valuemin="0"
            aria-valuemax="59"
            aria-valuetext="${minutesValueText}"
            aria-required="${this.required}"
            aria-invalid="${this.status === 'invalid'}"
            aria-describedby="${describedBy}"
            ?disabled="${this.disabled || this._isUnknown}"
            ?readonly="${this.readonly}"
            .value="${this._minutes}"
            @focus="${this._handleSegmentFocus}"
            @blur="${this._handleMinutesBlur}"
            @input="${this._handleMinutesInput}"
            @keydown="${this._handleMinutesKeydown}"
            @paste="${this._handlePaste}"
          />
          ${this.showSeconds ? b`
                <span
                  part="separator"
                  class="timepicker-separator"
                  aria-hidden="true"
                  >:</span
                >
                <input
                  id="seconds-input"
                  part="seconds-input"
                  class="timepicker-segment"
                  type="text"
                  inputmode="numeric"
                  role="spinbutton"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  placeholder="${secondsPlaceholder}"
                  aria-label="${secondsAriaLabel}"
                  aria-valuenow="${secondsNumeric ?? A}"
                  aria-valuemin="0"
                  aria-valuemax="59"
                  aria-valuetext="${secondsValueText}"
                  aria-required="${this.required}"
                  aria-invalid="${this.status === 'invalid'}"
                  aria-describedby="${describedBy}"
                  ?disabled="${this.disabled || this._isUnknown}"
                  ?readonly="${this.readonly}"
                  .value="${this._seconds}"
                  @focus="${this._handleSegmentFocus}"
                  @blur="${this._handleSecondsBlur}"
                  @input="${this._handleSecondsInput}"
                  @keydown="${this._handleSecondsKeydown}"
                  @paste="${this._handlePaste}"
                />
              ` : A}
          ${this.timezone ? b`
                <span
                  part="timezone"
                  class="timepicker-timezone"
                  aria-label="${timezoneAriaLabel}: ${this.timezone}"
                  title="${this.timezone}"
                  >${this.timezone}</span
                >
              ` : A}
        </div>

        ${this.format === '12' ? b`
              <button
                type="button"
                role="button"
                part="period-btn"
                class="timepicker-period-btn"
                aria-label="${periodAriaLabel}"
                aria-pressed="${this._period === 'PM'}"
                ?disabled="${this.disabled || this.readonly || this._isUnknown}"
                @click="${this._togglePeriod}"
                @keydown="${this._handlePeriodKeydown}"
              >
                ${this._period}
              </button>
            ` : A}

        <div class="timepicker-actions">
          ${this.showNow && !this.disabled && !this.readonly ? b`
                <button
                  type="button"
                  role="button"
                  part="now-btn"
                  class="timepicker-now-btn"
                  aria-label="${nowAriaLabel}"
                  title="${nowLabel}"
                  @click="${this.setCurrentTime}"
                >
                  ${nowLabel}
                </button>
              ` : A}

          ${this.clearable && this.value && !this.disabled && !this.readonly ? b`
                <button
                  type="button"
                  role="button"
                  part="clear-btn"
                  class="timepicker-clear-btn"
                  aria-label="${clearAriaLabel}"
                  @click="${this.clear}"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              ` : A}

          <button
            type="button"
            role="button"
            part="clock-btn"
            class="timepicker-clock-btn"
            aria-label="${clockAriaLabel}"
            aria-haspopup="dialog"
            aria-expanded="${this._isOpen}"
            ?disabled="${this.disabled || this.readonly || this._isUnknown}"
            @click="${()=>this._isOpen ? this.close() : this.open()}"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div
        id="floating-menu-container"
        part="popup"
        role="dialog"
        aria-modal="false"
        aria-label="${popupAriaLabel}"
        @keydown="${this._handlePopupKeydown}"
      ></div>

      ${this.allowUnknown ? b`
            <div part="unknown-wrapper" class="timepicker-unknown-wrapper">
              <input
                id="unknown-checkbox"
                part="unknown-checkbox"
                type="checkbox"
                aria-label="${unknownLabel}"
                .checked="${this._isUnknown}"
                .indeterminate="${isPartialUnknownTime(this.value, this.format)}"
                ?disabled="${this.disabled || this.readonly}"
                @change="${this._handleUnknownToggle}"
              />
              <label for="unknown-checkbox">${unknownLabel}</label>
            </div>
          ` : A}
      ${this.status === 'invalid' && this.validityMessage ? b`<span
            id="validation-msg"
            part="validation"
            class="validity-msg"
            role="alert"
            aria-live="polite"
            >${this.validityMessage}</span
          >` : A}

      ${this.helperText ? b`<span id="helper-text" class="timepicker-helper" part="helper"
            >${this.helperText}</span
          >` : A}
      <slot name="helper"></slot>
    `;
            }
            static styles = i`
    ${r$1(timePickerStyles)}
  `;
        }
    }
}();

// Pre-register custom locales dynamically to demonstrate runtime registry extension
timePickerLocaleRegistry.register('sv', {
    hoursPlaceholder: 'TT',
    minutesPlaceholder: 'MM',
    secondsPlaceholder: 'SS',
    unknownLabel: 'Okänd tid',
    clockAriaLabel: 'Välj tid',
    clearAriaLabel: 'Rensa tid',
    periodAriaLabel: 'Växla FM/EM, nu {period}',
    requiredMessage: 'Tid är obligatorisk.',
    invalidMessage: 'Ange en giltig tid.',
    minMessage: 'Välj en tid efter eller vid {min}.',
    maxMessage: 'Välj en tid före eller vid {max}.'
});
timePickerLocaleRegistry.register('it', {
    hoursPlaceholder: 'OO',
    minutesPlaceholder: 'MM',
    secondsPlaceholder: 'SS',
    unknownLabel: 'Ora sconosciuta',
    clockAriaLabel: 'Scegli ora',
    clearAriaLabel: 'Cancella ora',
    requiredMessage: "L'ora è obbligatoria."
});
const meta = {
    title: 'Components/TimePicker',
    tags: [
        'autodocs'
    ],
    argTypes: {
        onViTimePickerChange: {
            action: 'vi-time-picker-change'
        },
        format: {
            control: 'select',
            options: [
                '24',
                '12'
            ],
            description: '12-hour or 24-hour clock'
        },
        step: {
            control: 'number',
            description: 'Minute step increment (e.g. 1, 5, 10, 15, 30)'
        },
        hourStep: {
            control: 'number',
            description: 'Hour step increment (e.g. 1, 2, 4)'
        },
        secondStep: {
            control: 'number',
            description: 'Second step increment (e.g. 1, 5, 10)'
        },
        showNow: {
            control: 'boolean',
            description: 'Displays quick "Now" current time action button'
        },
        timezone: {
            control: 'text',
            description: 'Timezone identifier badge and ISO offset context (e.g. "UTC", "EST", "+05:30")'
        },
        showSeconds: {
            control: 'boolean',
            description: 'Include seconds segment'
        },
        min: {
            control: 'text',
            description: 'Minimum selectable time (e.g. "08:00")'
        },
        max: {
            control: 'text',
            description: 'Maximum selectable time (e.g. "17:00")'
        },
        disabled: {
            control: 'boolean',
            description: 'Disables all interactions'
        },
        required: {
            control: 'boolean',
            description: 'Marks the field as required'
        },
        readonly: {
            control: 'boolean',
            description: 'Prevents editing value'
        },
        allowUnknown: {
            control: 'boolean',
            description: 'Enables clinical "Time unknown" (??:??) toggle'
        },
        clearable: {
            control: 'boolean',
            description: 'Shows a clear button when value is set'
        },
        status: {
            control: 'select',
            options: [
                'default',
                'valid',
                'invalid'
            ],
            description: 'Visual validation status'
        },
        validityMessage: {
            control: 'text',
            description: 'Validation feedback message'
        },
        locale: {
            control: 'select',
            options: [
                'en',
                'ja',
                'zh',
                'fr',
                'de',
                'es'
            ],
            description: 'BCP 47 language/locale tag controlling default placeholders and labels'
        },
        hoursPlaceholder: {
            control: 'text',
            description: 'Custom placeholder for hours segment (e.g. "HH", "時", "hr")'
        },
        minutesPlaceholder: {
            control: 'text',
            description: 'Custom placeholder for minutes segment (e.g. "mm", "分", "min")'
        },
        secondsPlaceholder: {
            control: 'text',
            description: 'Custom placeholder for seconds segment (e.g. "ss", "秒", "sec")'
        },
        config: {
            control: 'object',
            description: 'Unified configuration object for placeholders, labels, and messages'
        },
        name: {
            control: 'text',
            description: 'Form field name'
        },
        value: {
            control: 'text',
            description: 'Current time value string'
        },
        label: {
            control: 'text',
            description: 'Accessible label text'
        },
        helperText: {
            control: 'text',
            description: 'Helper instruction text'
        }
    }
};
const render = (args)=>b`
  <div style="padding: 1.5rem; font-family: sans-serif;">
    <vi-time-picker
      .value=${args.value ?? ''}
      name=${args.name ?? ''}
      label=${args.label ?? ''}
      helper-text=${args.helperText ?? ''}
      format=${args.format ?? '24'}
      .step=${args.step ?? 15}
      .hourStep=${args.hourStep ?? 1}
      .secondStep=${args.secondStep ?? 1}
      ?show-seconds=${args.showSeconds}
      ?show-now=${args.showNow}
      timezone=${args.timezone ?? ''}
      min=${args.min ?? ''}
      max=${args.max ?? ''}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?readonly=${args.readonly}
      ?allow-unknown=${args.allowUnknown}
      ?clearable=${args.clearable}
      status=${args.status ?? 'default'}
      .validityMessage=${args.validityMessage ?? ''}
      locale=${args.locale ?? ''}
      hours-placeholder=${args.hoursPlaceholder ?? ''}
      minutes-placeholder=${args.minutesPlaceholder ?? ''}
      seconds-placeholder=${args.secondsPlaceholder ?? ''}
      .config=${args.config ?? {}}
      .disabledHours=${args.disabledHours ?? null}
      .disabledMinutes=${args.disabledMinutes ?? null}
      .disabledSeconds=${args.disabledSeconds ?? null}
      @vi-time-picker-change=${(e)=>args.onViTimePickerChange?.(e)}
    ></vi-time-picker>
  </div>
`;
const defaultArgs = {
    value: '14:30',
    name: 'time',
    label: 'Event Time',
    helperText: 'Select an event time (HH:mm)',
    format: '24',
    step: 15,
    hourStep: 1,
    secondStep: 1,
    showSeconds: false,
    showNow: false,
    timezone: '',
    min: '',
    max: '',
    disabled: false,
    required: false,
    readonly: false,
    allowUnknown: false,
    clearable: true,
    status: 'default',
    validityMessage: '',
    locale: 'en',
    hoursPlaceholder: '',
    minutesPlaceholder: '',
    secondsPlaceholder: ''
};
const DefaultEmpty = {
    name: 'Default (Empty)',
    args: {
        ...defaultArgs,
        value: '',
        label: 'Meeting Time',
        helperText: 'Enter meeting start time'
    },
    render
};
const Default24Hour = {
    name: '24-Hour (Default)',
    args: {
        ...defaultArgs
    },
    render
};
const TwelveHourWithPeriod = {
    name: '12-Hour with AM/PM',
    args: {
        ...defaultArgs,
        format: '12',
        value: '02:30 PM',
        label: 'Appointment Time',
        helperText: 'Use A/P keys or button to toggle period'
    },
    render
};
const WithSeconds = {
    name: 'With Seconds (HH:mm:ss)',
    args: {
        ...defaultArgs,
        showSeconds: true,
        value: '09:15:30',
        label: 'Precise Timestamp'
    },
    render
};
const SteppedIncrement = {
    name: 'Stepped (5-Minute Intervals)',
    args: {
        ...defaultArgs,
        step: 5,
        value: '08:00',
        helperText: 'Arrow keys jump in 5-minute increments'
    },
    render
};
const WithLabelAndHelper = {
    name: 'With Label and Slotted Helper',
    render: ()=>b`
    <div style="padding: 1.5rem; font-family: sans-serif;">
      <vi-time-picker label="Scheduled Departure" value="10:45" clearable>
        <span slot="helper">Select estimated local departure time</span>
      </vi-time-picker>
    </div>
  `
};
const ValidationValid = {
    name: 'Validation: Valid',
    args: {
        ...defaultArgs,
        value: '11:00',
        status: 'valid',
        label: 'Inspection Time',
        helperText: 'Time slot confirmed'
    },
    render
};
const ValidationInvalid = {
    name: 'Validation: Invalid',
    args: {
        ...defaultArgs,
        min: '09:00',
        max: '17:00',
        value: '06:30',
        status: 'invalid',
        label: 'Operating Hours',
        validityMessage: 'Time must be between 09:00 and 17:00'
    },
    render
};
const ClinicalUnknownTime = {
    name: 'Clinical EDC Unknown Time (CDISC SDTM)',
    args: {
        ...defaultArgs,
        label: 'Dose Administration Time',
        allowUnknown: true,
        value: '??:??'
    },
    render
};
const Disabled = {
    name: 'Disabled State',
    args: {
        ...defaultArgs,
        disabled: true,
        value: '12:00',
        label: 'Locked System Time'
    },
    render
};
const Readonly = {
    name: 'Readonly State',
    args: {
        ...defaultArgs,
        readonly: true,
        value: '16:30',
        label: 'Submitted Record Time'
    },
    render
};
const Clearable = {
    name: 'Clearable with Value',
    args: {
        ...defaultArgs,
        clearable: true,
        value: '18:45',
        label: 'Optional Shift End'
    },
    render
};
/**
 * Visual Test Matrix:
 * A comprehensive side-by-side snapshot covering every visual state and variant
 * for regression testing (Chromatic, Percy, Backstop).
 */ const VisualTestMatrix = {
    name: 'Visual Test Matrix (All States)',
    render: ()=>b`
    <div style="padding: 2rem; font-family: sans-serif; display: flex; flex-direction: column; gap: 2rem; max-width: 1000px;">
      <h2 style="margin: 0; font-size: 1.25rem; font-weight: 600;">Time Picker Visual Regression Matrix</h2>

      <!-- Row 1: Formats & Empty/Filled -->
      <div>
        <h3 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;">1. Clock Formats</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;">
          <vi-time-picker label="24-Hour (Empty)" format="24"></vi-time-picker>
          <vi-time-picker label="24-Hour (Filled)" format="24" value="14:30"></vi-time-picker>
          <vi-time-picker label="12-Hour AM" format="12" value="09:15 AM"></vi-time-picker>
          <vi-time-picker label="12-Hour PM" format="12" value="03:45 PM"></vi-time-picker>
        </div>
      </div>

      <!-- Row 2: Precision & Actions -->
      <div>
        <h3 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;">2. Precision & Actions</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;">
          <vi-time-picker label="24h with Seconds" show-seconds value="14:30:45"></vi-time-picker>
          <vi-time-picker label="12h with Seconds" format="12" show-seconds value="02:15:30 PM"></vi-time-picker>
          <vi-time-picker label="Clearable with Value" clearable value="16:20"></vi-time-picker>
        </div>
      </div>

      <!-- Row 3: Validation States -->
      <div>
        <h3 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;">3. Validation States</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;">
          <vi-time-picker label="Default Status" status="default" value="10:00" helper-text="Standard prompt"></vi-time-picker>
          <vi-time-picker label="Valid Status" status="valid" value="10:00" helper-text="Time confirmed"></vi-time-picker>
          <vi-time-picker
            label="Invalid Status"
            status="invalid"
            value="06:30"
            validity-message="Time must be after 09:00"
          ></vi-time-picker>
        </div>
      </div>

      <!-- Row 4: Disabled, Readonly & Clinical Unknown -->
      <div>
        <h3 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;">4. Disabled, Readonly & Unknown Time</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;">
          <vi-time-picker label="Disabled" disabled value="12:00"></vi-time-picker>
          <vi-time-picker label="Readonly" readonly value="12:00"></vi-time-picker>
          <vi-time-picker label="Unknown Unchecked" allow-unknown value=""></vi-time-picker>
          <vi-time-picker label="Unknown Checked" allow-unknown value="??:??"></vi-time-picker>
        </div>
      </div>

      <!-- Row 5: Form Container Context -->
      <div>
        <h3 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;">5. Form Layout Context</h3>
        <form style="display: flex; flex-direction: column; gap: 1rem; max-width: 360px; padding: 1.25rem; border: 1px solid #e2e8f0; border-radius: 8px;">
          <vi-time-picker label="Start Time" value="09:00" format="12" required></vi-time-picker>
          <vi-time-picker label="End Time" value="05:00 PM" format="12" required helper-text="End of workday"></vi-time-picker>
          <button type="submit" style="padding: 0.5rem 1rem; background: #0056b3; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Save Shift Schedule
          </button>
        </form>
      </div>

      <!-- Row 6: Internationalization & Localization -->
      <div>
        <h3 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;">6. Internationalization & Localized Placeholders</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;">
          <vi-time-picker label="English Default (HH/mm)" locale="en"></vi-time-picker>
          <vi-time-picker label="日本語 (locale='ja')" locale="ja" show-seconds></vi-time-picker>
          <vi-time-picker label="中文 (locale='zh')" locale="zh" show-seconds></vi-time-picker>
          <vi-time-picker label="Français (locale='fr')" locale="fr" allow-unknown clearable value="14:30"></vi-time-picker>
          <vi-time-picker label="Deutsch (locale='de')" locale="de" allow-unknown clearable value="16:45"></vi-time-picker>
          <vi-time-picker label="Español (locale='es')" locale="es" allow-unknown clearable value="18:15"></vi-time-picker>
          <vi-time-picker
            label="Custom Config Object"
            show-seconds
            allow-unknown
            min="09:00"
            value="08:00"
            .config=${{
            hoursPlaceholder: 'HHH',
            minutesPlaceholder: 'MMM',
            secondsPlaceholder: 'SSS',
            unknownLabel: 'Heure inconnue (custom)',
            minMessage: 'Veuillez choisir après {min}'
        }}
          ></vi-time-picker>
        </div>
      </div>
    </div>
  `
};
const Internationalization = {
    name: 'Internationalization & Locales',
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
      <div>
        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #1e293b;">1. Locale-Driven Placeholders (Empty State)</h3>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          Notice how input segment placeholders automatically adapt per language:
          Western languages use <strong>HH/mm</strong>, Japanese uses <strong>時/分/秒</strong>, and Chinese uses <strong>时/分/秒</strong>.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem;">
          <vi-time-picker
            label="English (en)"
            locale="en"
            helper-text="Default placeholders: HH / mm"
          ></vi-time-picker>
          <vi-time-picker
            label="日本語 (ja)"
            locale="ja"
            show-seconds
            helper-text="自動プレースホルダー: 時 / 分 / 秒"
          ></vi-time-picker>
          <vi-time-picker
            label="中文 (zh)"
            locale="zh"
            show-seconds
            helper-text="自动占位符: 时 / 分 / 秒"
          ></vi-time-picker>
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #1e293b;">2. Localized Labels, Tooltips & Error Messages</h3>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          ARIA spinbutton labels, unknown time checkbox text, and validation constraints follow each locale's dictionary.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem;">
          <vi-time-picker
            label="Français (locale='fr')"
            locale="fr"
            allow-unknown
            clearable
            value="15:30"
            helper-text="Heure inconnue checkbox et boutons en français"
          ></vi-time-picker>

          <vi-time-picker
            label="Deutsch (locale='de')"
            locale="de"
            allow-unknown
            min="09:00"
            value="07:30"
            helper-text="Validierungsfehler: Bitte wählen Sie eine Uhrzeit ab 09:00"
          ></vi-time-picker>
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #1e293b;">3. Unified Configuration Object (.config)</h3>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          Overrides any text token without needing separate individual props. Supports reactive in-place mutation.
        </p>
        <vi-time-picker
          label="Custom .config Override"
          show-seconds
          allow-unknown
          required
          .config=${{
            hoursPlaceholder: 'hrs',
            minutesPlaceholder: 'min',
            secondsPlaceholder: 'sec',
            unknownLabel: 'Hora no especificada',
            requiredMessage: '¡Este campo es obligatorio!'
        }}
          helper-text="Custom placeholders (hrs:min:sec) and Spanish unknown label via .config"
        ></vi-time-picker>
      </div>
    </div>
  `
};
const LocalePlaceholders = {
    name: 'Locale & Custom Placeholders',
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
      <div>
        <h2 style="margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">Placeholder Localization & Customization</h2>
        <p style="margin: 0 0 1.5rem 0; font-size: 0.875rem; color: #64748b;">
          Placeholders dynamically reflect the active locale, or can be customized per project via direct attributes or the <code>.config</code> object.
        </p>
      </div>

      <!-- Comparison Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
        <!-- English 24h -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;">English Default (24h)</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;">HH : mm</span>
          <vi-time-picker label="24-Hour" locale="en"></vi-time-picker>
        </div>

        <!-- English 12h -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;">English 12-Hour</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;">hh : mm [AM/PM]</span>
          <vi-time-picker label="12-Hour" format="12" locale="en"></vi-time-picker>
        </div>

        <!-- Japanese -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;">日本語 (ja)</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;">時 : 分 : 秒</span>
          <vi-time-picker label="日本語 (時・分・秒)" locale="ja" show-seconds></vi-time-picker>
        </div>

        <!-- Chinese -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;">中文 (zh)</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;">时 : 分 : 秒</span>
          <vi-time-picker label="中文 (时・分・秒)" locale="zh" show-seconds></vi-time-picker>
        </div>

        <!-- Custom HTML Attributes -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;">Custom HTML Attributes</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;">hours-placeholder="時"</span>
          <vi-time-picker
            label="Direct Attributes"
            hours-placeholder="時"
            minutes-placeholder="分"
            seconds-placeholder="秒"
            show-seconds
          ></vi-time-picker>
        </div>

        <!-- Custom via .config Object -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;">Custom via .config</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;">{ hoursPlaceholder: 'hr' }</span>
          <vi-time-picker
            label="Custom Labels"
            show-seconds
            .config=${{
            hoursPlaceholder: 'hr',
            minutesPlaceholder: 'min',
            secondsPlaceholder: 'sec'
        }}
          ></vi-time-picker>
        </div>
      </div>
    </div>
  `
};
const CustomLocaleRegistry = {
    name: 'Custom Locale Registry (DIP / tsyringe)',
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
      <div>
        <h2 style="margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">
          Dynamic Locale Registration via Singleton Registry
        </h2>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          New languages can be registered at runtime via <code>timePickerLocaleRegistry.register('sv', {...})</code>
          without modifying component source code. The component resolves it automatically via Dependency Inversion.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
        <!-- Swedish (sv) registered dynamically -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 1rem; color: #1e293b;">Svenska (locale="sv")</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 0.75rem; margin-bottom: 0.75rem; font-family: monospace;">
            Placeholder: TT / MM / SS
          </span>
          <vi-time-picker
            label="Svenska (Sverige)"
            locale="sv"
            allow-unknown
            show-seconds
            clearable
            helper-text="Dynamiskt registrerad: TT/MM/SS, Okänd tid"
          ></vi-time-picker>
        </div>

        <!-- Italian (it) registered dynamically -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 1rem; color: #1e293b;">Italiano (locale="it")</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 0.75rem; margin-bottom: 0.75rem; font-family: monospace;">
            Placeholder: OO / MM / SS
          </span>
          <vi-time-picker
            label="Italiano (Italia)"
            locale="it"
            allow-unknown
            show-seconds
            clearable
            helper-text="Registrato dinamicamente: OO/MM/SS, Ora sconosciuta"
          ></vi-time-picker>
        </div>

        <!-- Unknown locale with fallback -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 1rem; color: #1e293b;">Unknown Locale (Fallback)</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #fef3c7; color: #92400e; border-radius: 4px; font-size: 0.75rem; margin-bottom: 0.75rem; font-family: monospace;">
            locale="xx-YY" → English Fallback
          </span>
          <vi-time-picker
            label="Unregistered Tag"
            locale="xx-YY"
            allow-unknown
            show-seconds
            helper-text="Automatically falls back to English defaults"
          ></vi-time-picker>
        </div>
      </div>
    </div>
  `
};
const NowQuickAction = {
    name: 'Quick Action "Now" Button',
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
      <div>
        <h2 style="margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">
          One-Click "Now" Current Time Capture
        </h2>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          Enterprise forms frequently require stamping immediate action times (e.g. medication administration, sample collection, check-in).
          Enabling <code>show-now</code> renders a high-visibility "Now" button that instantly stamps the system clock.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">24-Hour Military "Now"</h4>
          <vi-time-picker
            label="Sample Collection Timestamp"
            show-now
            clearable
            helper-text="Click 'Now' to populate current hours and minutes"
          ></vi-time-picker>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">12-Hour with Seconds "Now"</h4>
          <vi-time-picker
            label="Medication Dose Administered"
            format="12"
            show-seconds
            show-now
            clearable
            helper-text="Captures exact second and AM/PM period"
          ></vi-time-picker>
        </div>
      </div>
    </div>
  `
};
const TimezoneContext = {
    name: 'Timezone Indicator & Offset Serialization',
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
      <div>
        <h2 style="margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">
          Clinical Multi-Site Timezone Badging
        </h2>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          Prevents time ambiguity across international multi-center trials. The <code>timezone</code> prop displays a pill badge
          inside the input box and automatically formats ISO serialization (e.g. <code>14:30Z</code> or <code>14:30+05:30</code>).
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">UTC Reference Clock</h4>
          <vi-time-picker
            label="Adverse Event Onset (UTC)"
            timezone="UTC"
            value="14:30"
            helper-text="Emits isoValue: 14:30Z"
          ></vi-time-picker>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Site Local Timezone (EST)</h4>
          <vi-time-picker
            label="Boston Trial Site (EST)"
            timezone="EST"
            format="12"
            value="09:15 AM"
            helper-text="Site-specific local time indicator"
          ></vi-time-picker>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Numerical ISO Offset (+05:30)</h4>
          <vi-time-picker
            label="Mumbai Lab Site (+05:30)"
            timezone="+05:30"
            value="19:45"
            helper-text="Emits isoValue: 19:45+05:30"
          ></vi-time-picker>
        </div>
      </div>
    </div>
  `
};
const PartialUnknownCDISC = {
    name: 'CDISC SDTM Segment-Level Unknown Time',
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
      <div>
        <h2 style="margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">
          CDISC SDTM Partial Unknown Time Capture
        </h2>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          Clinical EDC guidelines (FDA/CDISC) require recording partially known historical times (e.g., patient remembers the hour 14:00 but not minutes: <code>14:??</code>).
          The component marks the "Time unknown" checkbox as indeterminate (<code>-</code>) and validates cleanly without blocking submission.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Hour Known Only (14:??)</h4>
          <vi-time-picker
            label="Concomitant Meds Onset"
            allow-unknown
            value="14:??"
            helper-text="Known hour 14, unknown minutes"
          ></vi-time-picker>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Minute Known Only (??:30)</h4>
          <vi-time-picker
            label="Symptom Resolution"
            allow-unknown
            value="??:30"
            helper-text="Known at half-hour, hour unknown"
          ></vi-time-picker>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Completely Unknown (??:??)</h4>
          <vi-time-picker
            label="Historical Medical History"
            allow-unknown
            value="??:??"
            helper-text="Checkbox is fully checked"
          ></vi-time-picker>
        </div>
      </div>
    </div>
  `
};
const DisabledTimesValidation = {
    name: 'Custom Blackout / Disabled Hours, Minutes & Seconds',
    render: ()=>{
        // 12:00 to 13:59 lunch break disabled
        const lunchHours = [
            12,
            13
        ];
        // Minutes blackout: 00, 15, 30, 45 only allowed (others disabled)
        const disabledMinutesFn = (m)=>m % 15 !== 0;
        // Seconds blackout: 15, 30, 45
        const disabledSecondsList = [
            15,
            30,
            45
        ];
        return b`
      <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
        <div>
          <h2 style="margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">
            Restricted Time Windows & Blackout Validation
          </h2>
          <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
            Enforce custom scheduling blackout periods using <code>disabledHours</code>, <code>disabledMinutes</code>, or <code>disabledSeconds</code> arrays / callback predicates.
            Invalid times trigger automated browser and accessibility error states.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Lunch Break Hours Disabled [12, 13]</h4>
            <vi-time-picker
              label="Appointment Booking"
              value="12:30"
              .disabledHours=${lunchHours}
              helper-text="Hours 12 and 13 are blackout times"
            ></vi-time-picker>
          </div>

          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Quarter-Hour Slots Only (Function Predicate)</h4>
            <vi-time-picker
              label="Infusion Slot"
              value="10:12"
              .disabledMinutes=${disabledMinutesFn}
              helper-text="Only :00, :15, :30, :45 minutes are permitted"
            ></vi-time-picker>
          </div>

          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Restricted Seconds [15, 30, 45]</h4>
            <vi-time-picker
              show-seconds
              label="Telemetry Sampling Time"
              value="10:20:15"
              .disabledSeconds=${disabledSecondsList}
              helper-text="Seconds :15, :30, :45 are blackout intervals"
            ></vi-time-picker>
          </div>
        </div>
      </div>
    `;
    }
};
const CustomStepIncrements = {
    name: 'Custom Hour, Minute & Second Steps',
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
      <div>
        <h2 style="margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">
          Configurable Stepping Granularity
        </h2>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          Fine-tune keyboard Arrow Up/Down and step buttons independently across hours (<code>hour-step</code>),
          minutes (<code>step</code>), and seconds (<code>second-step</code>).
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">2-Hour & 30-Minute Increments</h4>
          <vi-time-picker
            label="Shift Schedule"
            value="08:00"
            hour-step="2"
            step="30"
            helper-text="ArrowUp on hour jumps by 2; on minute jumps by 30"
          ></vi-time-picker>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">10-Second Precision Increments</h4>
          <vi-time-picker
            label="Telemetry Heart Rate Sync"
            value="14:00:00"
            show-seconds
            second-step="10"
            helper-text="ArrowUp on second jumps in 10-second increments"
          ></vi-time-picker>
        </div>
      </div>
    </div>
  `
};
DefaultEmpty.parameters = {
    ...DefaultEmpty.parameters,
    docs: {
        ...DefaultEmpty.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Default (Empty)',\n  args: {\n    ...defaultArgs,\n    value: '',\n    label: 'Meeting Time',\n    helperText: 'Enter meeting start time'\n  },\n  render\n}",
            ...DefaultEmpty.parameters?.docs?.source
        }
    }
};
Default24Hour.parameters = {
    ...Default24Hour.parameters,
    docs: {
        ...Default24Hour.parameters?.docs,
        source: {
            originalSource: "{\n  name: '24-Hour (Default)',\n  args: {\n    ...defaultArgs\n  },\n  render\n}",
            ...Default24Hour.parameters?.docs?.source
        }
    }
};
TwelveHourWithPeriod.parameters = {
    ...TwelveHourWithPeriod.parameters,
    docs: {
        ...TwelveHourWithPeriod.parameters?.docs,
        source: {
            originalSource: "{\n  name: '12-Hour with AM/PM',\n  args: {\n    ...defaultArgs,\n    format: '12',\n    value: '02:30 PM',\n    label: 'Appointment Time',\n    helperText: 'Use A/P keys or button to toggle period'\n  },\n  render\n}",
            ...TwelveHourWithPeriod.parameters?.docs?.source
        }
    }
};
WithSeconds.parameters = {
    ...WithSeconds.parameters,
    docs: {
        ...WithSeconds.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'With Seconds (HH:mm:ss)',\n  args: {\n    ...defaultArgs,\n    showSeconds: true,\n    value: '09:15:30',\n    label: 'Precise Timestamp'\n  },\n  render\n}",
            ...WithSeconds.parameters?.docs?.source
        }
    }
};
SteppedIncrement.parameters = {
    ...SteppedIncrement.parameters,
    docs: {
        ...SteppedIncrement.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Stepped (5-Minute Intervals)',\n  args: {\n    ...defaultArgs,\n    step: 5,\n    value: '08:00',\n    helperText: 'Arrow keys jump in 5-minute increments'\n  },\n  render\n}",
            ...SteppedIncrement.parameters?.docs?.source
        }
    }
};
WithLabelAndHelper.parameters = {
    ...WithLabelAndHelper.parameters,
    docs: {
        ...WithLabelAndHelper.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'With Label and Slotted Helper',\n  render: () => html`\n    <div style=\"padding: 1.5rem; font-family: sans-serif;\">\n      <vi-time-picker label=\"Scheduled Departure\" value=\"10:45\" clearable>\n        <span slot=\"helper\">Select estimated local departure time</span>\n      </vi-time-picker>\n    </div>\n  `\n}",
            ...WithLabelAndHelper.parameters?.docs?.source
        }
    }
};
ValidationValid.parameters = {
    ...ValidationValid.parameters,
    docs: {
        ...ValidationValid.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Validation: Valid',\n  args: {\n    ...defaultArgs,\n    value: '11:00',\n    status: 'valid',\n    label: 'Inspection Time',\n    helperText: 'Time slot confirmed'\n  },\n  render\n}",
            ...ValidationValid.parameters?.docs?.source
        }
    }
};
ValidationInvalid.parameters = {
    ...ValidationInvalid.parameters,
    docs: {
        ...ValidationInvalid.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Validation: Invalid',\n  args: {\n    ...defaultArgs,\n    min: '09:00',\n    max: '17:00',\n    value: '06:30',\n    status: 'invalid',\n    label: 'Operating Hours',\n    validityMessage: 'Time must be between 09:00 and 17:00'\n  },\n  render\n}",
            ...ValidationInvalid.parameters?.docs?.source
        }
    }
};
ClinicalUnknownTime.parameters = {
    ...ClinicalUnknownTime.parameters,
    docs: {
        ...ClinicalUnknownTime.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Clinical EDC Unknown Time (CDISC SDTM)',\n  args: {\n    ...defaultArgs,\n    label: 'Dose Administration Time',\n    allowUnknown: true,\n    value: '??:??'\n  },\n  render\n}",
            ...ClinicalUnknownTime.parameters?.docs?.source
        }
    }
};
Disabled.parameters = {
    ...Disabled.parameters,
    docs: {
        ...Disabled.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Disabled State',\n  args: {\n    ...defaultArgs,\n    disabled: true,\n    value: '12:00',\n    label: 'Locked System Time'\n  },\n  render\n}",
            ...Disabled.parameters?.docs?.source
        }
    }
};
Readonly.parameters = {
    ...Readonly.parameters,
    docs: {
        ...Readonly.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Readonly State',\n  args: {\n    ...defaultArgs,\n    readonly: true,\n    value: '16:30',\n    label: 'Submitted Record Time'\n  },\n  render\n}",
            ...Readonly.parameters?.docs?.source
        }
    }
};
Clearable.parameters = {
    ...Clearable.parameters,
    docs: {
        ...Clearable.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Clearable with Value',\n  args: {\n    ...defaultArgs,\n    clearable: true,\n    value: '18:45',\n    label: 'Optional Shift End'\n  },\n  render\n}",
            ...Clearable.parameters?.docs?.source
        }
    }
};
VisualTestMatrix.parameters = {
    ...VisualTestMatrix.parameters,
    docs: {
        ...VisualTestMatrix.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Visual Test Matrix (All States)',\n  render: () => html`\n    <div style=\"padding: 2rem; font-family: sans-serif; display: flex; flex-direction: column; gap: 2rem; max-width: 1000px;\">\n      <h2 style=\"margin: 0; font-size: 1.25rem; font-weight: 600;\">Time Picker Visual Regression Matrix</h2>\n\n      <!-- Row 1: Formats & Empty/Filled -->\n      <div>\n        <h3 style=\"margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;\">1. Clock Formats</h3>\n        <div style=\"display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;\">\n          <vi-time-picker label=\"24-Hour (Empty)\" format=\"24\"></vi-time-picker>\n          <vi-time-picker label=\"24-Hour (Filled)\" format=\"24\" value=\"14:30\"></vi-time-picker>\n          <vi-time-picker label=\"12-Hour AM\" format=\"12\" value=\"09:15 AM\"></vi-time-picker>\n          <vi-time-picker label=\"12-Hour PM\" format=\"12\" value=\"03:45 PM\"></vi-time-picker>\n        </div>\n      </div>\n\n      <!-- Row 2: Precision & Actions -->\n      <div>\n        <h3 style=\"margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;\">2. Precision & Actions</h3>\n        <div style=\"display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;\">\n          <vi-time-picker label=\"24h with Seconds\" show-seconds value=\"14:30:45\"></vi-time-picker>\n          <vi-time-picker label=\"12h with Seconds\" format=\"12\" show-seconds value=\"02:15:30 PM\"></vi-time-picker>\n          <vi-time-picker label=\"Clearable with Value\" clearable value=\"16:20\"></vi-time-picker>\n        </div>\n      </div>\n\n      <!-- Row 3: Validation States -->\n      <div>\n        <h3 style=\"margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;\">3. Validation States</h3>\n        <div style=\"display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;\">\n          <vi-time-picker label=\"Default Status\" status=\"default\" value=\"10:00\" helper-text=\"Standard prompt\"></vi-time-picker>\n          <vi-time-picker label=\"Valid Status\" status=\"valid\" value=\"10:00\" helper-text=\"Time confirmed\"></vi-time-picker>\n          <vi-time-picker\n            label=\"Invalid Status\"\n            status=\"invalid\"\n            value=\"06:30\"\n            validity-message=\"Time must be after 09:00\"\n          ></vi-time-picker>\n        </div>\n      </div>\n\n      <!-- Row 4: Disabled, Readonly & Clinical Unknown -->\n      <div>\n        <h3 style=\"margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;\">4. Disabled, Readonly & Unknown Time</h3>\n        <div style=\"display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;\">\n          <vi-time-picker label=\"Disabled\" disabled value=\"12:00\"></vi-time-picker>\n          <vi-time-picker label=\"Readonly\" readonly value=\"12:00\"></vi-time-picker>\n          <vi-time-picker label=\"Unknown Unchecked\" allow-unknown value=\"\"></vi-time-picker>\n          <vi-time-picker label=\"Unknown Checked\" allow-unknown value=\"??:??\"></vi-time-picker>\n        </div>\n      </div>\n\n      <!-- Row 5: Form Container Context -->\n      <div>\n        <h3 style=\"margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;\">5. Form Layout Context</h3>\n        <form style=\"display: flex; flex-direction: column; gap: 1rem; max-width: 360px; padding: 1.25rem; border: 1px solid #e2e8f0; border-radius: 8px;\">\n          <vi-time-picker label=\"Start Time\" value=\"09:00\" format=\"12\" required></vi-time-picker>\n          <vi-time-picker label=\"End Time\" value=\"05:00 PM\" format=\"12\" required helper-text=\"End of workday\"></vi-time-picker>\n          <button type=\"submit\" style=\"padding: 0.5rem 1rem; background: #0056b3; color: white; border: none; border-radius: 4px; cursor: pointer;\">\n            Save Shift Schedule\n          </button>\n        </form>\n      </div>\n\n      <!-- Row 6: Internationalization & Localization -->\n      <div>\n        <h3 style=\"margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;\">6. Internationalization & Localized Placeholders</h3>\n        <div style=\"display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;\">\n          <vi-time-picker label=\"English Default (HH/mm)\" locale=\"en\"></vi-time-picker>\n          <vi-time-picker label=\"\u65E5\u672C\u8A9E (locale='ja')\" locale=\"ja\" show-seconds></vi-time-picker>\n          <vi-time-picker label=\"\u4E2D\u6587 (locale='zh')\" locale=\"zh\" show-seconds></vi-time-picker>\n          <vi-time-picker label=\"Fran\xE7ais (locale='fr')\" locale=\"fr\" allow-unknown clearable value=\"14:30\"></vi-time-picker>\n          <vi-time-picker label=\"Deutsch (locale='de')\" locale=\"de\" allow-unknown clearable value=\"16:45\"></vi-time-picker>\n          <vi-time-picker label=\"Espa\xF1ol (locale='es')\" locale=\"es\" allow-unknown clearable value=\"18:15\"></vi-time-picker>\n          <vi-time-picker\n            label=\"Custom Config Object\"\n            show-seconds\n            allow-unknown\n            min=\"09:00\"\n            value=\"08:00\"\n            .config=${{\n    hoursPlaceholder: 'HHH',\n    minutesPlaceholder: 'MMM',\n    secondsPlaceholder: 'SSS',\n    unknownLabel: 'Heure inconnue (custom)',\n    minMessage: 'Veuillez choisir apr\xE8s {min}'\n  }}\n          ></vi-time-picker>\n        </div>\n      </div>\n    </div>\n  `\n}",
            ...VisualTestMatrix.parameters?.docs?.source
        },
        description: {
            story: "Visual Test Matrix:\nA comprehensive side-by-side snapshot covering every visual state and variant\nfor regression testing (Chromatic, Percy, Backstop).",
            ...VisualTestMatrix.parameters?.docs?.description
        }
    }
};
Internationalization.parameters = {
    ...Internationalization.parameters,
    docs: {
        ...Internationalization.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Internationalization & Locales',\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;\">\n      <div>\n        <h3 style=\"margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #1e293b;\">1. Locale-Driven Placeholders (Empty State)</h3>\n        <p style=\"margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;\">\n          Notice how input segment placeholders automatically adapt per language:\n          Western languages use <strong>HH/mm</strong>, Japanese uses <strong>\u6642/\u5206/\u79D2</strong>, and Chinese uses <strong>\u65F6/\u5206/\u79D2</strong>.\n        </p>\n        <div style=\"display: flex; flex-wrap: wrap; gap: 1.5rem;\">\n          <vi-time-picker\n            label=\"English (en)\"\n            locale=\"en\"\n            helper-text=\"Default placeholders: HH / mm\"\n          ></vi-time-picker>\n          <vi-time-picker\n            label=\"\u65E5\u672C\u8A9E (ja)\"\n            locale=\"ja\"\n            show-seconds\n            helper-text=\"\u81EA\u52D5\u30D7\u30EC\u30FC\u30B9\u30DB\u30EB\u30C0\u30FC: \u6642 / \u5206 / \u79D2\"\n          ></vi-time-picker>\n          <vi-time-picker\n            label=\"\u4E2D\u6587 (zh)\"\n            locale=\"zh\"\n            show-seconds\n            helper-text=\"\u81EA\u52A8\u5360\u4F4D\u7B26: \u65F6 / \u5206 / \u79D2\"\n          ></vi-time-picker>\n        </div>\n      </div>\n\n      <div style=\"border-top: 1px solid #e2e8f0; padding-top: 1.5rem;\">\n        <h3 style=\"margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #1e293b;\">2. Localized Labels, Tooltips & Error Messages</h3>\n        <p style=\"margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;\">\n          ARIA spinbutton labels, unknown time checkbox text, and validation constraints follow each locale's dictionary.\n        </p>\n        <div style=\"display: flex; flex-wrap: wrap; gap: 1.5rem;\">\n          <vi-time-picker\n            label=\"Fran\xE7ais (locale='fr')\"\n            locale=\"fr\"\n            allow-unknown\n            clearable\n            value=\"15:30\"\n            helper-text=\"Heure inconnue checkbox et boutons en fran\xE7ais\"\n          ></vi-time-picker>\n\n          <vi-time-picker\n            label=\"Deutsch (locale='de')\"\n            locale=\"de\"\n            allow-unknown\n            min=\"09:00\"\n            value=\"07:30\"\n            helper-text=\"Validierungsfehler: Bitte w\xE4hlen Sie eine Uhrzeit ab 09:00\"\n          ></vi-time-picker>\n        </div>\n      </div>\n\n      <div style=\"border-top: 1px solid #e2e8f0; padding-top: 1.5rem;\">\n        <h3 style=\"margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #1e293b;\">3. Unified Configuration Object (.config)</h3>\n        <p style=\"margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;\">\n          Overrides any text token without needing separate individual props. Supports reactive in-place mutation.\n        </p>\n        <vi-time-picker\n          label=\"Custom .config Override\"\n          show-seconds\n          allow-unknown\n          required\n          .config=${{\n    hoursPlaceholder: 'hrs',\n    minutesPlaceholder: 'min',\n    secondsPlaceholder: 'sec',\n    unknownLabel: 'Hora no especificada',\n    requiredMessage: '\xA1Este campo es obligatorio!'\n  }}\n          helper-text=\"Custom placeholders (hrs:min:sec) and Spanish unknown label via .config\"\n        ></vi-time-picker>\n      </div>\n    </div>\n  `\n}",
            ...Internationalization.parameters?.docs?.source
        }
    }
};
LocalePlaceholders.parameters = {
    ...LocalePlaceholders.parameters,
    docs: {
        ...LocalePlaceholders.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Locale & Custom Placeholders',\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;\">\n      <div>\n        <h2 style=\"margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;\">Placeholder Localization & Customization</h2>\n        <p style=\"margin: 0 0 1.5rem 0; font-size: 0.875rem; color: #64748b;\">\n          Placeholders dynamically reflect the active locale, or can be customized per project via direct attributes or the <code>.config</code> object.\n        </p>\n      </div>\n\n      <!-- Comparison Grid -->\n      <div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;\">\n        <!-- English 24h -->\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;\">\n          <h4 style=\"margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;\">English Default (24h)</h4>\n          <span style=\"display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;\">HH : mm</span>\n          <vi-time-picker label=\"24-Hour\" locale=\"en\"></vi-time-picker>\n        </div>\n\n        <!-- English 12h -->\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;\">\n          <h4 style=\"margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;\">English 12-Hour</h4>\n          <span style=\"display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;\">hh : mm [AM/PM]</span>\n          <vi-time-picker label=\"12-Hour\" format=\"12\" locale=\"en\"></vi-time-picker>\n        </div>\n\n        <!-- Japanese -->\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;\">\n          <h4 style=\"margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;\">\u65E5\u672C\u8A9E (ja)</h4>\n          <span style=\"display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;\">\u6642 : \u5206 : \u79D2</span>\n          <vi-time-picker label=\"\u65E5\u672C\u8A9E (\u6642\u30FB\u5206\u30FB\u79D2)\" locale=\"ja\" show-seconds></vi-time-picker>\n        </div>\n\n        <!-- Chinese -->\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;\">\n          <h4 style=\"margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;\">\u4E2D\u6587 (zh)</h4>\n          <span style=\"display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;\">\u65F6 : \u5206 : \u79D2</span>\n          <vi-time-picker label=\"\u4E2D\u6587 (\u65F6\u30FB\u5206\u30FB\u79D2)\" locale=\"zh\" show-seconds></vi-time-picker>\n        </div>\n\n        <!-- Custom HTML Attributes -->\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;\">\n          <h4 style=\"margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;\">Custom HTML Attributes</h4>\n          <span style=\"display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;\">hours-placeholder=\"\u6642\"</span>\n          <vi-time-picker\n            label=\"Direct Attributes\"\n            hours-placeholder=\"\u6642\"\n            minutes-placeholder=\"\u5206\"\n            seconds-placeholder=\"\u79D2\"\n            show-seconds\n          ></vi-time-picker>\n        </div>\n\n        <!-- Custom via .config Object -->\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;\">\n          <h4 style=\"margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;\">Custom via .config</h4>\n          <span style=\"display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;\">{ hoursPlaceholder: 'hr' }</span>\n          <vi-time-picker\n            label=\"Custom Labels\"\n            show-seconds\n            .config=${{\n    hoursPlaceholder: 'hr',\n    minutesPlaceholder: 'min',\n    secondsPlaceholder: 'sec'\n  }}\n          ></vi-time-picker>\n        </div>\n      </div>\n    </div>\n  `\n}",
            ...LocalePlaceholders.parameters?.docs?.source
        }
    }
};
CustomLocaleRegistry.parameters = {
    ...CustomLocaleRegistry.parameters,
    docs: {
        ...CustomLocaleRegistry.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Custom Locale Registry (DIP / tsyringe)',\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;\">\n      <div>\n        <h2 style=\"margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;\">\n          Dynamic Locale Registration via Singleton Registry\n        </h2>\n        <p style=\"margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;\">\n          New languages can be registered at runtime via <code>timePickerLocaleRegistry.register('sv', {...})</code>\n          without modifying component source code. The component resolves it automatically via Dependency Inversion.\n        </p>\n      </div>\n\n      <div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;\">\n        <!-- Swedish (sv) registered dynamically -->\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n          <h4 style=\"margin: 0 0 0.25rem 0; font-size: 1rem; color: #1e293b;\">Svenska (locale=\"sv\")</h4>\n          <span style=\"display: inline-block; padding: 0.2rem 0.5rem; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 0.75rem; margin-bottom: 0.75rem; font-family: monospace;\">\n            Placeholder: TT / MM / SS\n          </span>\n          <vi-time-picker\n            label=\"Svenska (Sverige)\"\n            locale=\"sv\"\n            allow-unknown\n            show-seconds\n            clearable\n            helper-text=\"Dynamiskt registrerad: TT/MM/SS, Ok\xE4nd tid\"\n          ></vi-time-picker>\n        </div>\n\n        <!-- Italian (it) registered dynamically -->\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n          <h4 style=\"margin: 0 0 0.25rem 0; font-size: 1rem; color: #1e293b;\">Italiano (locale=\"it\")</h4>\n          <span style=\"display: inline-block; padding: 0.2rem 0.5rem; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 0.75rem; margin-bottom: 0.75rem; font-family: monospace;\">\n            Placeholder: OO / MM / SS\n          </span>\n          <vi-time-picker\n            label=\"Italiano (Italia)\"\n            locale=\"it\"\n            allow-unknown\n            show-seconds\n            clearable\n            helper-text=\"Registrato dinamicamente: OO/MM/SS, Ora sconosciuta\"\n          ></vi-time-picker>\n        </div>\n\n        <!-- Unknown locale with fallback -->\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n          <h4 style=\"margin: 0 0 0.25rem 0; font-size: 1rem; color: #1e293b;\">Unknown Locale (Fallback)</h4>\n          <span style=\"display: inline-block; padding: 0.2rem 0.5rem; background: #fef3c7; color: #92400e; border-radius: 4px; font-size: 0.75rem; margin-bottom: 0.75rem; font-family: monospace;\">\n            locale=\"xx-YY\" \u2192 English Fallback\n          </span>\n          <vi-time-picker\n            label=\"Unregistered Tag\"\n            locale=\"xx-YY\"\n            allow-unknown\n            show-seconds\n            helper-text=\"Automatically falls back to English defaults\"\n          ></vi-time-picker>\n        </div>\n      </div>\n    </div>\n  `\n}",
            ...CustomLocaleRegistry.parameters?.docs?.source
        }
    }
};
NowQuickAction.parameters = {
    ...NowQuickAction.parameters,
    docs: {
        ...NowQuickAction.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Quick Action \"Now\" Button',\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;\">\n      <div>\n        <h2 style=\"margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;\">\n          One-Click \"Now\" Current Time Capture\n        </h2>\n        <p style=\"margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;\">\n          Enterprise forms frequently require stamping immediate action times (e.g. medication administration, sample collection, check-in).\n          Enabling <code>show-now</code> renders a high-visibility \"Now\" button that instantly stamps the system clock.\n        </p>\n      </div>\n\n      <div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;\">\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n          <h4 style=\"margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;\">24-Hour Military \"Now\"</h4>\n          <vi-time-picker\n            label=\"Sample Collection Timestamp\"\n            show-now\n            clearable\n            helper-text=\"Click 'Now' to populate current hours and minutes\"\n          ></vi-time-picker>\n        </div>\n\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n          <h4 style=\"margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;\">12-Hour with Seconds \"Now\"</h4>\n          <vi-time-picker\n            label=\"Medication Dose Administered\"\n            format=\"12\"\n            show-seconds\n            show-now\n            clearable\n            helper-text=\"Captures exact second and AM/PM period\"\n          ></vi-time-picker>\n        </div>\n      </div>\n    </div>\n  `\n}",
            ...NowQuickAction.parameters?.docs?.source
        }
    }
};
TimezoneContext.parameters = {
    ...TimezoneContext.parameters,
    docs: {
        ...TimezoneContext.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Timezone Indicator & Offset Serialization',\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;\">\n      <div>\n        <h2 style=\"margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;\">\n          Clinical Multi-Site Timezone Badging\n        </h2>\n        <p style=\"margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;\">\n          Prevents time ambiguity across international multi-center trials. The <code>timezone</code> prop displays a pill badge\n          inside the input box and automatically formats ISO serialization (e.g. <code>14:30Z</code> or <code>14:30+05:30</code>).\n        </p>\n      </div>\n\n      <div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;\">\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n          <h4 style=\"margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;\">UTC Reference Clock</h4>\n          <vi-time-picker\n            label=\"Adverse Event Onset (UTC)\"\n            timezone=\"UTC\"\n            value=\"14:30\"\n            helper-text=\"Emits isoValue: 14:30Z\"\n          ></vi-time-picker>\n        </div>\n\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n          <h4 style=\"margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;\">Site Local Timezone (EST)</h4>\n          <vi-time-picker\n            label=\"Boston Trial Site (EST)\"\n            timezone=\"EST\"\n            format=\"12\"\n            value=\"09:15 AM\"\n            helper-text=\"Site-specific local time indicator\"\n          ></vi-time-picker>\n        </div>\n\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n          <h4 style=\"margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;\">Numerical ISO Offset (+05:30)</h4>\n          <vi-time-picker\n            label=\"Mumbai Lab Site (+05:30)\"\n            timezone=\"+05:30\"\n            value=\"19:45\"\n            helper-text=\"Emits isoValue: 19:45+05:30\"\n          ></vi-time-picker>\n        </div>\n      </div>\n    </div>\n  `\n}",
            ...TimezoneContext.parameters?.docs?.source
        }
    }
};
PartialUnknownCDISC.parameters = {
    ...PartialUnknownCDISC.parameters,
    docs: {
        ...PartialUnknownCDISC.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'CDISC SDTM Segment-Level Unknown Time',\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;\">\n      <div>\n        <h2 style=\"margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;\">\n          CDISC SDTM Partial Unknown Time Capture\n        </h2>\n        <p style=\"margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;\">\n          Clinical EDC guidelines (FDA/CDISC) require recording partially known historical times (e.g., patient remembers the hour 14:00 but not minutes: <code>14:??</code>).\n          The component marks the \"Time unknown\" checkbox as indeterminate (<code>-</code>) and validates cleanly without blocking submission.\n        </p>\n      </div>\n\n      <div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;\">\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n          <h4 style=\"margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;\">Hour Known Only (14:??)</h4>\n          <vi-time-picker\n            label=\"Concomitant Meds Onset\"\n            allow-unknown\n            value=\"14:??\"\n            helper-text=\"Known hour 14, unknown minutes\"\n          ></vi-time-picker>\n        </div>\n\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n          <h4 style=\"margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;\">Minute Known Only (??:30)</h4>\n          <vi-time-picker\n            label=\"Symptom Resolution\"\n            allow-unknown\n            value=\"??:30\"\n            helper-text=\"Known at half-hour, hour unknown\"\n          ></vi-time-picker>\n        </div>\n\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n          <h4 style=\"margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;\">Completely Unknown (??:??)</h4>\n          <vi-time-picker\n            label=\"Historical Medical History\"\n            allow-unknown\n            value=\"??:??\"\n            helper-text=\"Checkbox is fully checked\"\n          ></vi-time-picker>\n        </div>\n      </div>\n    </div>\n  `\n}",
            ...PartialUnknownCDISC.parameters?.docs?.source
        }
    }
};
DisabledTimesValidation.parameters = {
    ...DisabledTimesValidation.parameters,
    docs: {
        ...DisabledTimesValidation.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Custom Blackout / Disabled Hours, Minutes & Seconds',\n  render: () => {\n    // 12:00 to 13:59 lunch break disabled\n    const lunchHours = [12, 13];\n    // Minutes blackout: 00, 15, 30, 45 only allowed (others disabled)\n    const disabledMinutesFn = (m: number) => m % 15 !== 0;\n    // Seconds blackout: 15, 30, 45\n    const disabledSecondsList = [15, 30, 45];\n    return html`\n      <div style=\"display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;\">\n        <div>\n          <h2 style=\"margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;\">\n            Restricted Time Windows & Blackout Validation\n          </h2>\n          <p style=\"margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;\">\n            Enforce custom scheduling blackout periods using <code>disabledHours</code>, <code>disabledMinutes</code>, or <code>disabledSeconds</code> arrays / callback predicates.\n            Invalid times trigger automated browser and accessibility error states.\n          </p>\n        </div>\n\n        <div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;\">\n          <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n            <h4 style=\"margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;\">Lunch Break Hours Disabled [12, 13]</h4>\n            <vi-time-picker\n              label=\"Appointment Booking\"\n              value=\"12:30\"\n              .disabledHours=${lunchHours}\n              helper-text=\"Hours 12 and 13 are blackout times\"\n            ></vi-time-picker>\n          </div>\n\n          <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n            <h4 style=\"margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;\">Quarter-Hour Slots Only (Function Predicate)</h4>\n            <vi-time-picker\n              label=\"Infusion Slot\"\n              value=\"10:12\"\n              .disabledMinutes=${disabledMinutesFn}\n              helper-text=\"Only :00, :15, :30, :45 minutes are permitted\"\n            ></vi-time-picker>\n          </div>\n\n          <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n            <h4 style=\"margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;\">Restricted Seconds [15, 30, 45]</h4>\n            <vi-time-picker\n              show-seconds\n              label=\"Telemetry Sampling Time\"\n              value=\"10:20:15\"\n              .disabledSeconds=${disabledSecondsList}\n              helper-text=\"Seconds :15, :30, :45 are blackout intervals\"\n            ></vi-time-picker>\n          </div>\n        </div>\n      </div>\n    `;\n  }\n}",
            ...DisabledTimesValidation.parameters?.docs?.source
        }
    }
};
CustomStepIncrements.parameters = {
    ...CustomStepIncrements.parameters,
    docs: {
        ...CustomStepIncrements.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Custom Hour, Minute & Second Steps',\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;\">\n      <div>\n        <h2 style=\"margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;\">\n          Configurable Stepping Granularity\n        </h2>\n        <p style=\"margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;\">\n          Fine-tune keyboard Arrow Up/Down and step buttons independently across hours (<code>hour-step</code>),\n          minutes (<code>step</code>), and seconds (<code>second-step</code>).\n        </p>\n      </div>\n\n      <div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;\">\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n          <h4 style=\"margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;\">2-Hour & 30-Minute Increments</h4>\n          <vi-time-picker\n            label=\"Shift Schedule\"\n            value=\"08:00\"\n            hour-step=\"2\"\n            step=\"30\"\n            helper-text=\"ArrowUp on hour jumps by 2; on minute jumps by 30\"\n          ></vi-time-picker>\n        </div>\n\n        <div style=\"border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;\">\n          <h4 style=\"margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;\">10-Second Precision Increments</h4>\n          <vi-time-picker\n            label=\"Telemetry Heart Rate Sync\"\n            value=\"14:00:00\"\n            show-seconds\n            second-step=\"10\"\n            helper-text=\"ArrowUp on second jumps in 10-second increments\"\n          ></vi-time-picker>\n        </div>\n      </div>\n    </div>\n  `\n}",
            ...CustomStepIncrements.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["DefaultEmpty","Default24Hour","TwelveHourWithPeriod","WithSeconds","SteppedIncrement","WithLabelAndHelper","ValidationValid","ValidationInvalid","ClinicalUnknownTime","Disabled","Readonly","Clearable","VisualTestMatrix","Internationalization","LocalePlaceholders","CustomLocaleRegistry","NowQuickAction","TimezoneContext","PartialUnknownCDISC","DisabledTimesValidation","CustomStepIncrements"];

export { Clearable, ClinicalUnknownTime, CustomLocaleRegistry, CustomStepIncrements, Default24Hour, DefaultEmpty, Disabled, DisabledTimesValidation, Internationalization, LocalePlaceholders, NowQuickAction, PartialUnknownCDISC, Readonly, SteppedIncrement, TimezoneContext, TwelveHourWithPeriod, ValidationInvalid, ValidationValid, VisualTestMatrix, WithLabelAndHelper, WithSeconds, __namedExportsOrder, meta as default };
