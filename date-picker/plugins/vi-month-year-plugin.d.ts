import { Instance } from 'flatpickr/dist/types/instance';
export interface ViMonthYearPluginConfig {
    hideDays?: boolean;
    ariaLabels?: {
        prevMonth?: string;
        nextMonth?: string;
        selectMonth?: string;
        selectYear?: string;
    };
}
export declare function ViMonthYearPlugin(config?: ViMonthYearPluginConfig): (fp: Instance) => {
    onReady: () => void;
    onMonthChange: () => void;
    onYearChange: () => void;
    onDestroy: () => void;
};
//# sourceMappingURL=vi-month-year-plugin.d.ts.map