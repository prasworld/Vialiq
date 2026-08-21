import type { Instance } from 'flatpickr/dist/types/instance';
import '../../select/vi-select.js';

export interface ViMonthYearPluginConfig {
  hideDays?: boolean;
  ariaLabels?: {
    prevMonth?: string;
    nextMonth?: string;
    selectMonth?: string;
    selectYear?: string;
  };
}

export function ViMonthYearPlugin(config: ViMonthYearPluginConfig = {}) {
  return function (fp: Instance) {
    let headerContainer: HTMLDivElement;
    let prevBtn: HTMLButtonElement;
    let nextBtn: HTMLButtonElement;
    let monthToggleBtn: HTMLButtonElement;
    let yearSelect: HTMLElement; // vi-select
    let monthGridContainer: HTMLDivElement;

    function createHeader() {
      headerContainer = document.createElement('div');
      headerContainer.className = 'vi-calendar-header';

      prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'vi-calendar-nav-btn vi-calendar-prev';
      if (config.ariaLabels?.prevMonth) {
        prevBtn.setAttribute('aria-label', config.ariaLabels.prevMonth);
      }
      prevBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`;
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fp.changeMonth(-1);
      });

      nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'vi-calendar-nav-btn vi-calendar-next';
      if (config.ariaLabels?.nextMonth) {
        nextBtn.setAttribute('aria-label', config.ariaLabels.nextMonth);
      }
      nextBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`;
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fp.changeMonth(1);
      });

      const selectorsContainer = document.createElement('div');
      selectorsContainer.className = 'vi-calendar-selectors';

      monthToggleBtn = document.createElement('button');
      monthToggleBtn.type = 'button';
      monthToggleBtn.className = 'vi-calendar-month-toggle';
      monthToggleBtn.setAttribute('aria-label', config.ariaLabels?.selectMonth ?? fp.l10n.monthAriaLabel ?? 'Select month');
      monthToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMonthGrid();
      });

      yearSelect = document.createElement('vi-select');
      yearSelect.className = 'vi-calendar-year-select';
      yearSelect.setAttribute('size', 'sm');
      yearSelect.setAttribute('aria-label', config.ariaLabels?.selectYear ?? fp.l10n.yearAriaLabel ?? 'Select year');
      
      // Use createElement and assign .value directly so vi-select can synchronously read the value
      // even before Lit has fully upgraded the custom elements in the browser.
      const currentYear = new Date().getFullYear();
      for (let y = currentYear - 50; y <= currentYear + 50; y++) {
        const opt = document.createElement('vi-select-option') as HTMLElement & { value: string };
        opt.value = y.toString();
        opt.textContent = y.toString();
        yearSelect.appendChild(opt);
      }
      
      yearSelect.addEventListener('vialiq-change', (e: Event) => {
        e.stopPropagation(); // prevent it from bubbling up to Storybook
        const selectedYear = parseInt((e as CustomEvent).detail.value, 10);
        if (!isNaN(selectedYear)) {
          fp.changeYear(selectedYear);
        }
      });

      selectorsContainer.appendChild(monthToggleBtn);
      selectorsContainer.appendChild(yearSelect);

      headerContainer.appendChild(prevBtn);
      headerContainer.appendChild(selectorsContainer);
      headerContainer.appendChild(nextBtn);

      // Stop ALL click/pointer events from bubbling out of the header!
      // This is the CRITICAL fix that prevents Flatpickr from closing the calendar 
      // when you click the year select. Because vi-select uses Shadow DOM, Flatpickr
      // gets confused and thinks you clicked outside the calendar.
      const stopPropagation = (e: Event) => e.stopPropagation();
      headerContainer.addEventListener('mousedown', stopPropagation);
      headerContainer.addEventListener('click', stopPropagation);
      headerContainer.addEventListener('touchstart', stopPropagation);

      return headerContainer;
    }

    function createMonthGrid() {
      monthGridContainer = document.createElement('div');
      monthGridContainer.className = 'vi-calendar-month-grid';
      monthGridContainer.style.display = 'none';

      const months = fp.l10n.months.shorthand;

      months.forEach((monthName, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'vi-calendar-month-btn';
        btn.textContent = monthName;
        btn.dataset.month = index.toString();
        
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (config.hideDays) {
            // In month-only mode, clicking a month selects it and closes the picker
            const newDate = new Date(fp.currentYear, index, 1);
            fp.setDate(newDate, true);
            fp.close();
          } else {
            // Normal mode: just change the calendar view to that month
            fp.changeMonth(index, false);
            toggleMonthGrid(false);
          }
        });
        
        monthGridContainer.appendChild(btn);
      });

      return monthGridContainer;
    }

    function toggleMonthGrid(force?: boolean) {
      const isCurrentlyVisible = monthGridContainer.style.display === 'grid';
      const shouldShow = force !== undefined ? force : !isCurrentlyVisible;
      
      monthGridContainer.style.display = shouldShow ? 'grid' : 'none';
      
      if (shouldShow) {
        const monthBtns = monthGridContainer.querySelectorAll<HTMLButtonElement>('.vi-calendar-month-btn');
        monthBtns.forEach((btn) => {
          if (parseInt(btn.dataset.month || '', 10) === fp.currentMonth) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }
    }

    function updateHeaderValues() {
      if (!monthToggleBtn || !yearSelect) return;
      monthToggleBtn.textContent = fp.l10n.months.longhand[fp.currentMonth];
      (yearSelect as HTMLElement & { value: string }).value = fp.currentYear.toString();

      if (prevBtn && !config.ariaLabels?.prevMonth) {
        const prevMonthIndex = fp.currentMonth === 0 ? 11 : fp.currentMonth - 1;
        prevBtn.setAttribute('aria-label', fp.l10n.months.longhand[prevMonthIndex]);
      }
      if (nextBtn && !config.ariaLabels?.nextMonth) {
        const nextMonthIndex = fp.currentMonth === 11 ? 0 : fp.currentMonth + 1;
        nextBtn.setAttribute('aria-label', fp.l10n.months.longhand[nextMonthIndex]);
      }
    }

    function applyHideDaysConfig() {
      if (!config.hideDays) return;
      
      fp.calendarContainer.classList.add('vi-month-mode');
      
      const innerContainer = fp.calendarContainer.querySelector('.flatpickr-innerContainer') as HTMLElement;
      if (innerContainer) innerContainer.style.display = 'none';
      
      // Permanently show the month grid
      toggleMonthGrid(true);
      
      // Also hide the month toggle button since it's permanently showing the grid anyway
      if (monthToggleBtn) {
        monthToggleBtn.style.display = 'none';
      }
    }

    return {
      onReady: () => {
        if (fp.monthNav) {
          fp.monthNav.style.display = 'none';
        }
        const header = createHeader();
        fp.calendarContainer.insertBefore(header, fp.calendarContainer.firstChild);
        const grid = createMonthGrid();
        fp.calendarContainer.appendChild(grid);

        // Tell Flatpickr not to close when these custom elements are clicked
        if (!fp.config.ignoredFocusElements) {
          fp.config.ignoredFocusElements = [];
        }
        fp.config.ignoredFocusElements.push(header, grid);

        updateHeaderValues();
        applyHideDaysConfig();
      },
      onMonthChange: () => {
        updateHeaderValues();
      },
      onYearChange: () => {
        updateHeaderValues();
      },
      onDestroy: () => {
        headerContainer?.remove();
        monthGridContainer?.remove();
      }
    };
  };
}
