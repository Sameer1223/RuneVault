# Backend Tests

25 pytest tests covering all API endpoints with proper error handling and authorization checks.

## Test Files & Coverage

### test_users.py (4 tests)
Tests for user authentication and retrieval:
- **test_sync_user_creates_new_user**: Creates new user on first login, generates username from Auth0 ID
- **test_sync_user_existing_user**: Returns existing user data without creating duplicate
- **test_get_user_success**: Retrieves user by database ID with full user info
- **test_get_user_not_found**: Returns 404 when user doesn't exist

### test_decks.py (10 tests)
Tests for deck CRUD operations with ownership verification:
- **test_create_deck_success**: Creates deck with all required fields, returns deck ID
- **test_create_deck_missing_fields**: Rejects deck creation with missing required fields (400)
- **test_get_decks_by_user_empty**: Returns empty array when user has no decks
- **test_get_decks_by_user_success**: Returns all decks for a specific user
- **test_get_deck_by_id_success**: Retrieves specific deck with all data
- **test_get_deck_not_found**: Returns 404 for non-existent deck ID
- **test_update_deck_success**: Updates deck name/format, persists changes
- **test_update_deck_unauthorized**: Prevents non-owner from updating (403)
- **test_delete_deck_success**: Removes deck from database
- **test_delete_deck_unauthorized**: Prevents non-owner from deleting (403)

### test_collection.py (11 tests)
Tests for user card collection management:
- **test_get_collection_success**: Returns user's regular and foil card counts
- **test_get_collection_empty**: Returns empty collections for new users
- **test_get_collection_user_not_found**: Returns 404 for non-existent user
- **test_add_card_to_collection**: Increments card count in regular collection
- **test_add_multiple_copies_of_card**: Properly accumulates copies of same card
- **test_remove_card_from_collection**: Decrements card count, preserves other cards
- **test_remove_all_copies_deletes_entry**: Removes card entry when count reaches 0
- **test_prevent_negative_count**: Never allows negative card counts (clamps to 0)
- **test_add_foil_card**: Adds card to foil collection separately from regular
- **test_update_collection_user_not_found**: Returns 404 when updating non-existent user
- **test_mixed_collection_and_foil**: Handles users with same card in both regular and foil

## Running Tests

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt  # One time

pytest                   # Run all 25 tests
pytest -v               # Verbose output showing each test
pytest tests/test_users.py  # Run specific file
pytest -k "sync_user"   # Run tests matching pattern
```

## What's Tested

✅ **API Endpoints**: All 9 endpoints (2 users, 5 decks, 2 collection)
✅ **Auth**: JWT token verification mocked, ownership checks enforced
✅ **Data**: Correct status codes, proper JSON responses
✅ **Errors**: 404 not found, 403 unauthorized, 400 bad request
✅ **Edge Cases**: Empty collections, negative counts, non-existent users
✅ **Database**: Foreign key constraints, data persistence per test

## Test Setup

- Each test gets fresh in-memory SQLite database
- Auth0 JWT verification is mocked to avoid external calls
- Database automatically cleaned up after each test
- All tests run independently with no cross-contamination
  - Error handling (404s, 403s, 400s)
  - Authorization/ownership checks
  - Data validation
  - Foreign key constraints

## Notes

- Tests use an in-memory SQLite database (`sqlite:///:memory:`)
- Auth0 verification is mocked using `unittest.mock.patch`
- Each test is isolated with its own database session
- Tests run in approximately 1 second total
