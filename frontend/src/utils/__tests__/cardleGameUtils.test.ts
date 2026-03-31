import { describe, it, expect } from 'vitest'
import { compareCards } from '@/utils/cardleGameUtils'
import type { CardData } from '@/types/deck'

const mockCard: CardData = {
  cardId: 'OGN-001',
  name: 'Test Card',
  energy: 3,
  power: 5,
  might: 2,
  colors: ['Fire'],
  type: 'Champion',
  set: 'OGN',
  rarity: 'Common',
}

describe('cardleGameUtils', () => {
  describe('compareCards', () => {
    it('should return all correct when cards match', () => {
      const result = compareCards(mockCard, mockCard)

      expect(result.energy).toBe('correct')
      expect(result.power).toBe('correct')
      expect(result.might).toBe('correct')
      expect(result.color).toBe('correct')
      expect(result.type).toBe(true)
      expect(result.set).toBe(true)
      expect(result.rarity).toBe(true)
    })

    it('should correctly identify higher energy values', () => {
      const guess: CardData = { ...mockCard, energy: 2 }
      const answer: CardData = { ...mockCard, energy: 5 }

      const result = compareCards(guess, answer)
      expect(result.energy).toBe('higher')
    })

    it('should correctly identify lower energy values', () => {
      const guess: CardData = { ...mockCard, energy: 6 }
      const answer: CardData = { ...mockCard, energy: 3 }

      const result = compareCards(guess, answer)
      expect(result.energy).toBe('lower')
    })

    it('should handle undefined stat values', () => {
      const guess: CardData = { ...mockCard, energy: undefined }
      const answer: CardData = { ...mockCard, energy: 3 }

      const result = compareCards(guess, answer)
      expect(result.energy).toBe('incorrect')
    })

    it('should correctly identify matching types', () => {
      const guess: CardData = { ...mockCard, type: 'Champion' }
      const answer: CardData = { ...mockCard, type: 'Champion' }

      const result = compareCards(guess, answer)
      expect(result.type).toBe(true)
    })

    it('should correctly identify mismatched types', () => {
      const guess: CardData = { ...mockCard, type: 'Champion' }
      const answer: CardData = { ...mockCard, type: 'Spell' }

      const result = compareCards(guess, answer)
      expect(result.type).toBe(false)
    })

    it('should correctly identify matching sets', () => {
      const result = compareCards(
        { ...mockCard, set: 'OGN' },
        { ...mockCard, set: 'OGN' }
      )
      expect(result.set).toBe(true)
    })

    it('should correctly identify mismatched rarities', () => {
      const result = compareCards(
        { ...mockCard, rarity: 'Common' },
        { ...mockCard, rarity: 'Rare' }
      )
      expect(result.rarity).toBe(false)
    })

    it('should handle partial color matches', () => {
      const guess: CardData = { ...mockCard, colors: ['Fire', 'Ice'] }
      const answer: CardData = { ...mockCard, colors: ['Fire'] }

      const result = compareCards(guess, answer)
      expect(result.color).toBe('partial')
    })

    it('should return unknown for empty colors', () => {
      const guess: CardData = { ...mockCard, colors: [] }
      const answer: CardData = { ...mockCard, colors: ['Fire'] }

      const result = compareCards(guess, answer)
      expect(result.color).toBe('unknown')
    })
  })
})
