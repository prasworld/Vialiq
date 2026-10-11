import type { CustomLocale } from 'flatpickr/dist/types/locale';
import { loadLocale as loadFpLocale } from '../date-picker/locale-registry.js';
import type { TimeFormat, TimePickerI18n } from './types.js';

/**
 * Resolves the effective BCP 47 locale tag from an attribute/prop or navigator.
 */
export function resolveLocale(localeAttr: string | null): string {
  if (localeAttr) return localeAttr;
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'en';
}

export const LOCALE_DICTIONARIES: Record<string, Partial<TimePickerI18n>> = {
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
    secondsUnit: 'secondes',
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
    secondsUnit: 'Sekunden',
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
    secondsUnit: 'segundos',
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
    secondsUnit: '秒',
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
    secondsUnit: '秒',
  },
};

/**
 * Returns default i18n messages and labels.
 * Can be overridden via props or custom `i18n` dictionary.
 */
export function getDefaultTimePickerI18n(
  locale = 'en',
  format: TimeFormat = '24',
): Required<TimePickerI18n> {
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
    ...localized,
  };
}

/**
 * Lazily loads a Flatpickr locale definition for a given BCP 47 tag.
 * Reuses the cached locale registry from date-picker.
 */
export async function loadLocale(bcp47: string): Promise<CustomLocale | null> {
  return loadFpLocale(bcp47);
}
