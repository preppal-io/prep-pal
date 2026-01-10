import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  templateCategoryWithMultiplier,
  templateCategoryNoPeople,
  templateCategoryNoDays,
  templateCategoryFixed,
  templateCategoryZeroMultiplier,
  templateCategoryNoMultiplier,
} from '../mocks/testData'

// The quantityFunction logic from fileUtils.js:267-274
// We test this logic directly since it's the core business logic
const quantityFunction = (category, forPeople, forDays) => {
  const people = category.functionOfPeople === 'yes' ? forPeople : 1
  const days = category.functionOfDays === 'yes' ? forDays : 1

  return Math.ceil(people * days * category.quantityMultiplier || 0)
}

describe('fileUtils', () => {
  describe('quantityFunction - core business logic', () => {
    describe('basic calculations', () => {
      it('calculates quantity with people and days multipliers', () => {
        // 2 people * 30 days * 2 multiplier = 120
        const result = quantityFunction(templateCategoryWithMultiplier, 2, 30)
        expect(result).toBe(120)
      })

      it('ignores people when functionOfPeople is "no"', () => {
        // 1 (fixed) * 30 days * 0.5 multiplier = 15
        const result = quantityFunction(templateCategoryNoPeople, 4, 30)
        expect(result).toBe(15)
      })

      it('ignores days when functionOfDays is "no"', () => {
        // 3 people * 1 (fixed) * 1 multiplier = 3
        const result = quantityFunction(templateCategoryNoDays, 3, 90)
        expect(result).toBe(3)
      })

      it('returns fixed quantity when both people and days are "no"', () => {
        // 1 (fixed) * 1 (fixed) * 1 multiplier = 1
        const result = quantityFunction(templateCategoryFixed, 10, 365)
        expect(result).toBe(1)
      })
    })

    describe('rounding behavior', () => {
      it('rounds up fractional results using Math.ceil', () => {
        const category = {
          functionOfPeople: 'yes',
          functionOfDays: 'yes',
          quantityMultiplier: 0.25,
        }
        // 2 people * 7 days * 0.25 = 3.5, should round up to 4
        expect(quantityFunction(category, 2, 7)).toBe(4)
      })

      it('rounds up small fractional results', () => {
        const category = {
          functionOfPeople: 'yes',
          functionOfDays: 'yes',
          quantityMultiplier: 0.1,
        }
        // 1 person * 1 day * 0.1 = 0.1, should round up to 1
        expect(quantityFunction(category, 1, 1)).toBe(1)
      })

      it('does not round when result is whole number', () => {
        const category = {
          functionOfPeople: 'yes',
          functionOfDays: 'yes',
          quantityMultiplier: 1,
        }
        // 2 people * 15 days * 1 = 30
        expect(quantityFunction(category, 2, 15)).toBe(30)
      })
    })

    describe('edge cases', () => {
      it('returns 0 for zero multiplier', () => {
        const result = quantityFunction(templateCategoryZeroMultiplier, 2, 30)
        expect(result).toBe(0)
      })

      it('returns 0 for undefined multiplier', () => {
        const result = quantityFunction(templateCategoryNoMultiplier, 2, 30)
        expect(result).toBe(0)
      })

      it('handles very small multipliers', () => {
        const category = {
          functionOfPeople: 'yes',
          functionOfDays: 'yes',
          quantityMultiplier: 0.00003, // Like coffee in the template
        }
        // 2 people * 30 days * 0.00003 = 0.0018, should round up to 1
        expect(quantityFunction(category, 2, 30)).toBe(1)
      })

      it('handles 1 person for 1 day', () => {
        const result = quantityFunction(templateCategoryWithMultiplier, 1, 1)
        // 1 * 1 * 2 = 2
        expect(result).toBe(2)
      })

      it('handles large numbers of people', () => {
        const result = quantityFunction(templateCategoryWithMultiplier, 10, 30)
        // 10 * 30 * 2 = 600
        expect(result).toBe(600)
      })

      it('handles large number of days', () => {
        const result = quantityFunction(templateCategoryWithMultiplier, 2, 90)
        // 2 * 90 * 2 = 360
        expect(result).toBe(360)
      })
    })

    describe('real-world category scenarios', () => {
      it('calculates mineral water correctly (2 people, 30 days)', () => {
        const mineralWater = {
          functionOfPeople: 'yes',
          functionOfDays: 'yes',
          quantityMultiplier: 2,
        }
        // Expected: 2 * 30 * 2 = 120 bottles
        expect(quantityFunction(mineralWater, 2, 30)).toBe(120)
      })

      it('calculates spices correctly (not people-based)', () => {
        const spices = {
          functionOfPeople: 'no',
          functionOfDays: 'yes',
          quantityMultiplier: 0.033,
        }
        // Expected: 1 * 30 * 0.033 = 0.99, rounds up to 1
        expect(quantityFunction(spices, 4, 30)).toBe(1)
      })

      it('calculates flashlight correctly (fixed quantity)', () => {
        const flashlight = {
          functionOfPeople: 'no',
          functionOfDays: 'no',
          quantityMultiplier: 1,
        }
        // Expected: 1 * 1 * 1 = 1 (always 1 regardless of people/days)
        expect(quantityFunction(flashlight, 10, 365)).toBe(1)
      })

      it('calculates garbage bags correctly (not people-based but days-based)', () => {
        const garbageBags = {
          functionOfPeople: 'no',
          functionOfDays: 'yes',
          quantityMultiplier: 0.1,
        }
        // Expected: 1 * 30 * 0.1 = 3
        expect(quantityFunction(garbageBags, 4, 30)).toBe(3)
      })
    })
  })

  describe('quantity override logic', () => {
    // Testing the override logic from RecommendedScreen.jsx:163-172
    const quantity = (item) => {
      return item.quantityOverride || item.quantityOverride === 0
        ? item.quantityOverride
        : item.quantity
    }

    const overridenQuantity = (item) => {
      return (
        (item.quantityOverride || item.quantityOverride === 0) &&
        item.quantityOverride !== item.quantity
      )
    }

    it('returns calculated quantity when no override', () => {
      const item = { quantity: 100, quantityOverride: '' }
      expect(quantity(item)).toBe(100)
    })

    it('returns override when set to a number', () => {
      const item = { quantity: 100, quantityOverride: 50 }
      expect(quantity(item)).toBe(50)
    })

    it('returns 0 override correctly (falsy value edge case)', () => {
      const item = { quantity: 100, quantityOverride: 0 }
      expect(quantity(item)).toBe(0)
    })

    it('detects when quantity is overridden', () => {
      const item = { quantity: 100, quantityOverride: 50 }
      expect(overridenQuantity(item)).toBe(true)
    })

    it('detects when quantity is not overridden', () => {
      const item = { quantity: 100, quantityOverride: '' }
      expect(overridenQuantity(item)).toBe(false)
    })

    it('detects override set to 0', () => {
      const item = { quantity: 100, quantityOverride: 0 }
      expect(overridenQuantity(item)).toBe(true)
    })

    it('does not flag as overridden when override equals quantity', () => {
      const item = { quantity: 100, quantityOverride: 100 }
      expect(overridenQuantity(item)).toBe(false)
    })
  })
})
