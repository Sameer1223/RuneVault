# Frontend Tests

30+ Vitest tests covering game logic, components, and data utilities.

## Test Files & Coverage

### src/utils/__tests__/cardleGameUtils.test.ts (10 tests)
Tests for Cardle game card comparison logic:
- **test_compareCards_all_correct**: Validates when guess card exactly matches answer
- **test_compareCards_higher_energy**: Correctly identifies when guess has lower energy than answer
- **test_compareCards_lower_energy**: Correctly identifies when guess has higher energy than answer
- **test_compareCards_undefined_values**: Handles missing stat values as incorrect
- **test_compareCards_matching_types**: Verifies type matching (Champion vs Spell)
- **test_compareCards_mismatched_types**: Correctly identifies type mismatches
- **test_compareCards_matching_sets**: Verifies set matching (OGN vs other sets)
- **test_compareCards_mismatched_rarities**: Correctly identifies rarity differences
- **test_compareCards_partial_colors**: Detects partial color matches (some colors match)
- **test_compareCards_unknown_colors**: Returns unknown when color data missing

### src/test/components.test.tsx (5 tests)
Tests for React component rendering and interactions:
- **test_render_without_crashing**: Basic smoke test - components render successfully
- **test_render_text_content**: Text displays correctly in components
- **test_handle_button_clicks**: Button click events fire and are handled
- **test_render_lists**: Lists render correct number of items
- **test_conditional_rendering**: Components show/hide content based on conditions

### src/test/utilities.test.ts (15+ tests)
Tests for data utilities and business logic:

**Card Filtering (4 tests)**
- Filter cards by name substring match
- Filter cards by type (Spell, Champion, etc)
- Handle empty filter results
- Combine multiple filters together

**Collection Management (5 tests)**
- Add cards to collection incrementing count
- Remove cards from collection
- Prevent negative collection counts (clamps to 0)
- Calculate total cards in collection
- Handle foil and regular collections separately

**Deck Validation (6+ tests)**
- Validate deck name is not empty
- Verify deck has a legend
- Count cards in deck correctly
- Check deck format compliance
- Validate main/side deck structure

## Running Tests

```bash
cd frontend
npm install              # One time only

npm test                 # Run all tests
npm test -- --watch    # Watch mode (re-run on changes)
npm test -- --coverage  # Show test coverage

npm run lint            # Check code style
npm run build           # Verify TypeScript builds
```

## What's Tested

✅ **Game Logic**: Cardle card comparison (energy, power, might, colors, type, set, rarity)
✅ **Components**: React rendering, event handling, conditional display
✅ **Utilities**: Card filtering, collection math, deck validation
✅ **Edge Cases**: Empty collections, undefined values, partial matches
✅ **Data Types**: Proper TypeScript typing, data structure validation

## Test Setup

- Each test runs in jsdom environment (simulated browser DOM)
- React Testing Library provides component testing utilities
- window.matchMedia mocked for CSS media queries
- Automatic cleanup after each test
- No external API calls - pure logic testing
