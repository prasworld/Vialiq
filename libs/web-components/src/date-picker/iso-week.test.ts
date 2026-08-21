import { describe, it, expect } from 'vitest';
import { getISOWeek } from './iso-week.js';

describe('iso-week', () => {
  it('calculates correct week for normal dates', () => {
    // June 15 2025 is a Sunday, Week 24
    expect(getISOWeek(new Date(2025, 5, 15))).toBe(24);
  });

  it('calculates correct week for Jan 1 edge cases', () => {
    // Jan 1 2022 is a Saturday -> Week 52 of 2021
    expect(getISOWeek(new Date(2022, 0, 1))).toBe(52);
    
    // Jan 1 2024 is a Monday -> Week 1 of 2024
    expect(getISOWeek(new Date(2024, 0, 1))).toBe(1);
    
    // Jan 1 2021 is a Friday -> Week 53 of 2020
    expect(getISOWeek(new Date(2021, 0, 1))).toBe(53);
  });
  
  it('calculates correct week for Dec 31 edge cases', () => {
    // Dec 31 2024 is a Tuesday -> Week 1 of 2025
    expect(getISOWeek(new Date(2024, 11, 31))).toBe(1);
    
    // Dec 31 2023 is a Sunday -> Week 52 of 2023
    expect(getISOWeek(new Date(2023, 11, 31))).toBe(52);
  });
});
