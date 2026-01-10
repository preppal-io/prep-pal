import { describe, it, expect } from 'vitest'
import { parseDate, formatDate, addDays, daysBetween } from '../../src/utils/dateUtils'

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
})
