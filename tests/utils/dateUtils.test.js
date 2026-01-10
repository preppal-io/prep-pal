import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  parseDate,
  formatDate,
  addDays,
  daysBetween,
  isTodayAfter,
  isDateToday,
  getTodayFormatted,
  getToday,
} from '../../src/utils/dateUtils'

describe('dateUtils', () => {
  describe('parseDate', () => {
    it('parses a valid date string', () => {
      const result = parseDate('2024-03-15')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(2) // March is 0-indexed
      expect(result.getDate()).toBe(15)
    })

    it('returns null for empty string', () => {
      expect(parseDate('')).toBeNull()
      expect(parseDate(null)).toBeNull()
      expect(parseDate(undefined)).toBeNull()
    })
  })

  describe('formatDate', () => {
    it('formats a Date object to yyyy-mm-dd', () => {
      const date = new Date(2024, 2, 15) // March 15, 2024
      expect(formatDate(date)).toBe('2024-03-15')
    })

    it('pads single digit months and days', () => {
      const date = new Date(2024, 0, 5) // January 5, 2024
      expect(formatDate(date)).toBe('2024-01-05')
    })

    it('returns empty string for invalid input', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
      expect(formatDate('not a date')).toBe('')
    })
  })

  describe('addDays', () => {
    it('adds days to a date string', () => {
      expect(addDays('2024-03-15', 5)).toBe('2024-03-20')
    })

    it('handles month boundaries', () => {
      expect(addDays('2024-03-30', 5)).toBe('2024-04-04')
    })

    it('handles negative days', () => {
      expect(addDays('2024-03-15', -5)).toBe('2024-03-10')
    })
  })

  describe('daysBetween', () => {
    it('calculates days between two dates', () => {
      // Function uses Math.floor, so 5 days apart returns 4 full days
      expect(daysBetween('2024-01-01', '2024-01-06')).toBe(5)
    })

    it('returns negative for reversed dates', () => {
      expect(daysBetween('2024-01-06', '2024-01-01')).toBe(-5)
    })

    it('returns 0 for same date', () => {
      expect(daysBetween('2024-03-15', '2024-03-15')).toBe(0)
    })
  })

  describe('isTodayAfter - expiration checking', () => {
    beforeEach(() => {
      // Mock the current date to 2024-06-15 for consistent testing
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2024, 5, 15)) // June 15, 2024
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns true when today is after the given date', () => {
      expect(isTodayAfter('2024-06-14')).toBe(true) // Yesterday
      expect(isTodayAfter('2024-05-15')).toBe(true) // Last month
      expect(isTodayAfter('2023-06-15')).toBe(true) // Last year
    })

    it('returns false when today is before the given date', () => {
      expect(isTodayAfter('2024-06-16')).toBe(false) // Tomorrow
      expect(isTodayAfter('2024-07-15')).toBe(false) // Next month
      expect(isTodayAfter('2025-06-15')).toBe(false) // Next year
    })

    it('returns false when date is today', () => {
      expect(isTodayAfter('2024-06-15')).toBe(false) // Today
    })

    it('returns false for null or empty date string', () => {
      expect(isTodayAfter('')).toBe(false)
      expect(isTodayAfter(null)).toBe(false)
      expect(isTodayAfter(undefined)).toBe(false)
    })

    it('handles edge cases at month boundaries', () => {
      vi.setSystemTime(new Date(2024, 2, 1)) // March 1, 2024
      expect(isTodayAfter('2024-02-29')).toBe(true) // Feb 29 in leap year
      expect(isTodayAfter('2024-02-28')).toBe(true)
    })

    it('handles year boundaries', () => {
      vi.setSystemTime(new Date(2025, 0, 1)) // January 1, 2025
      expect(isTodayAfter('2024-12-31')).toBe(true)
      expect(isTodayAfter('2025-01-01')).toBe(false)
    })
  })

  describe('isDateToday', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2024, 5, 15)) // June 15, 2024
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns true when date is today', () => {
      expect(isDateToday('2024-06-15')).toBe(true)
    })

    it('returns false when date is yesterday', () => {
      expect(isDateToday('2024-06-14')).toBe(false)
    })

    it('returns false when date is tomorrow', () => {
      expect(isDateToday('2024-06-16')).toBe(false)
    })

    it('returns false for null or empty date string', () => {
      expect(isDateToday('')).toBe(false)
      expect(isDateToday(null)).toBe(false)
      expect(isDateToday(undefined)).toBe(false)
    })

    it('returns false for dates in different months/years', () => {
      expect(isDateToday('2024-05-15')).toBe(false) // Same day, different month
      expect(isDateToday('2023-06-15')).toBe(false) // Same day/month, different year
    })
  })

  describe('getTodayFormatted', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns today in yyyy-mm-dd format', () => {
      vi.setSystemTime(new Date(2024, 5, 15)) // June 15, 2024
      expect(getTodayFormatted()).toBe('2024-06-15')
    })

    it('pads single digit month and day', () => {
      vi.setSystemTime(new Date(2024, 0, 5)) // January 5, 2024
      expect(getTodayFormatted()).toBe('2024-01-05')
    })

    it('handles December correctly', () => {
      vi.setSystemTime(new Date(2024, 11, 31)) // December 31, 2024
      expect(getTodayFormatted()).toBe('2024-12-31')
    })
  })

  describe('getToday', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns today in yyyy-mm-dd format using ISO string', () => {
      // Note: getToday uses toISOString which is UTC-based
      // We set a time that will be the same date in UTC
      vi.setSystemTime(new Date('2024-06-15T12:00:00Z'))
      expect(getToday()).toBe('2024-06-15')
    })
  })

  describe('addDays - extended', () => {
    it('handles Date object input', () => {
      const date = new Date(2024, 2, 15) // March 15, 2024
      expect(addDays(date, 5)).toBe('2024-03-20')
    })

    it('returns empty string for null input', () => {
      expect(addDays(null, 5)).toBe('')
      expect(addDays(undefined, 5)).toBe('')
      expect(addDays('', 5)).toBe('')
    })

    it('handles leap year', () => {
      expect(addDays('2024-02-28', 1)).toBe('2024-02-29') // Leap year
      expect(addDays('2024-02-29', 1)).toBe('2024-03-01')
    })

    it('handles year boundary', () => {
      expect(addDays('2024-12-30', 5)).toBe('2025-01-04')
    })

    it('handles large number of days', () => {
      expect(addDays('2024-01-01', 365)).toBe('2024-12-31') // Leap year has 366 days
    })
  })

  describe('daysBetween - extended', () => {
    it('returns 0 for null inputs', () => {
      expect(daysBetween(null, '2024-01-06')).toBe(0)
      expect(daysBetween('2024-01-01', null)).toBe(0)
      expect(daysBetween(null, null)).toBe(0)
    })

    it('handles large date differences', () => {
      expect(daysBetween('2024-01-01', '2025-01-01')).toBe(366) // Leap year
    })

    it('handles month-end dates', () => {
      expect(daysBetween('2024-01-31', '2024-02-29')).toBe(29)
    })
  })
})
