import { describe, it, expect } from 'vitest'

// Test suite for data validation and transformations
describe('Data Utilities', () => {
  describe('Card filtering', () => {
    it('should filter cards by name', () => {
      const cards = [
        { cardId: '001', name: 'Fire Spell', type: 'Spell' },
        { cardId: '002', name: 'Ice Spell', type: 'Spell' },
        { cardId: '003', name: 'Fire Champion', type: 'Champion' },
      ]

      const filtered = cards.filter(c => c.name.includes('Fire'))
      expect(filtered).toHaveLength(2)
      expect(filtered[0].cardId).toBe('001')
      expect(filtered[1].cardId).toBe('003')
    })

    it('should filter cards by type', () => {
      const cards = [
        { cardId: '001', name: 'Fire Spell', type: 'Spell' },
        { cardId: '002', name: 'Ice Spell', type: 'Spell' },
        { cardId: '003', name: 'Fire Champion', type: 'Champion' },
      ]

      const filtered = cards.filter(c => c.type === 'Spell')
      expect(filtered).toHaveLength(2)
      expect(filtered.every(c => c.type === 'Spell')).toBe(true)
    })

    it('should filter empty result correctly', () => {
      const cards = [
        { cardId: '001', name: 'Fire Spell', type: 'Spell' },
      ]

      const filtered = cards.filter(c => c.name.includes('Water'))
      expect(filtered).toHaveLength(0)
    })

    it('should combine multiple filters', () => {
      const cards = [
        { cardId: '001', name: 'Fire Spell', type: 'Spell', rarity: 'Common' },
        { cardId: '002', name: 'Fire Spell', type: 'Spell', rarity: 'Rare' },
        { cardId: '003', name: 'Fire Champion', type: 'Champion', rarity: 'Common' },
      ]

      const filtered = cards.filter(
        c => c.name.includes('Fire') && c.type === 'Spell' && c.rarity === 'Common'
      )
      expect(filtered).toHaveLength(1)
      expect(filtered[0].cardId).toBe('001')
    })
  })

  describe('Collection management', () => {
    it('should add cards to collection', () => {
      const collection: Record<string, number> = {}
      
      collection['OGN-001'] = (collection['OGN-001'] || 0) + 1
      expect(collection['OGN-001']).toBe(1)
      
      collection['OGN-001'] = (collection['OGN-001'] || 0) + 1
      expect(collection['OGN-001']).toBe(2)
    })

    it('should remove cards from collection', () => {
      const collection: Record<string, number> = { 'OGN-001': 2 }
      
      collection['OGN-001'] = Math.max(0, collection['OGN-001'] - 1)
      expect(collection['OGN-001']).toBe(1)
      
      collection['OGN-001'] = Math.max(0, collection['OGN-001'] - 1)
      expect(collection['OGN-001']).toBe(0)
      
      if (collection['OGN-001'] === 0) {
        delete collection['OGN-001']
      }
      expect(collection['OGN-001']).toBeUndefined()
    })

    it('should prevent negative collection counts', () => {
      const collection: Record<string, number> = { 'OGN-001': 1 }
      
      collection['OGN-001'] = Math.max(0, collection['OGN-001'] - 5)
      expect(collection['OGN-001']).toBe(0)
    })

    it('should calculate total cards in collection', () => {
      const collection: Record<string, number> = {
        'OGN-001': 2,
        'OGN-002': 3,
        'OGN-003': 1,
      }

      const total = Object.values(collection).reduce((sum, count) => sum + count, 0)
      expect(total).toBe(6)
    })

    it('should handle foil and regular collections separately', () => {
      const regularCollection: Record<string, number> = { 'OGN-001': 2 }
      const foilCollection: Record<string, number> = { 'OGN-001': 1 }

      const total = (regularCollection['OGN-001'] || 0) + (foilCollection['OGN-001'] || 0)
      expect(total).toBe(3)
    })
  })

  describe('Deck validation', () => {
    it('should validate deck name is not empty', () => {
      const isValid = (name: string) => !!name && name.trim().length > 0
      
      expect(isValid('My Deck')).toBe(true)
      expect(isValid('')).toBe(false)
      expect(isValid('   ')).toBe(false)
    })

    it('should validate deck has a legend', () => {
      const deck = { Legend: 'OGN-001', Main: {} }
      const isValid = !!deck.Legend
      
      expect(isValid).toBe(true)
      
      const invalidDeck = { Legend: '', Main: {} }
      expect(!!invalidDeck.Legend).toBe(false)
    })

    it('should count cards in deck correctly', () => {
      const deckData = {
        Main: { 'OGN-001': 2, 'OGN-002': 3 },
        Side: { 'OGN-003': 1 },
      }

      const totalCards = [
        ...Object.values(deckData.Main),
        ...Object.values(deckData.Side),
      ].reduce((sum, count) => sum + count, 0)

      expect(totalCards).toBe(6)
    })
  })
})
