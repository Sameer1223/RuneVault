# Auth0 First-Login User Creation Setup

## Overview
This setup automatically creates users in your database when they log in for the first time with Auth0.

## How It Works

### Flow:
1. **User logs in with Auth0** → Auth0 authenticates and returns an access token
2. **Frontend detects authentication** → The `useUserSync` hook detects the user is authenticated
3. **Backend sync endpoint called** → Frontend sends Auth0 token to `/api/auth/sync-user`
4. **Database check** → Backend verifies if user exists by email
5. **User creation or retrieval** → New user created or existing user returned
6. **User ID stored** → Frontend stores `user_id` in localStorage for API calls

## Backend Changes

### New File: `backend/routes/user.py`
- **`POST /api/auth/sync-user`** - Creates or syncs user on login
  - Requires Auth0 token in Authorization header
  - Extracts user data from Auth0 token payload (email, username, etc.)
  - Returns `user_id`, `username`, `email`, and `is_new` flag
  
- **`GET /api/auth/user/<user_id>`** - Retrieves user information
  - Requires authentication
  - Returns user details

### Modified: `backend/routes/__init__.py`
- Registered the new `auth_routes` blueprint

## Frontend Changes

### New File: `frontend/src/hooks/useUserSync.ts`
Custom React hook that:
- Triggers on authentication state change
- Calls `/api/auth/sync-user` endpoint with Auth0 access token
- Stores `user_id` in localStorage
- Logs whether user is new or existing
- Handles errors gracefully

### Modified: `frontend/src/components/layout/Layout.tsx`
- Added `useUserSync()` hook to Layout component
- This ensures sync happens automatically when user navigates the app

## Environment Variables Required

### Backend (`.env`)
```
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
```

### Frontend (`.env.local`)
```
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENTID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier
VITE_API_URL=http://localhost:5000
```

## Database Schema
The `User` model stores:
- `id` - Primary key
- `username` - User's display name
- `email` - User's email (unique)
- `collection` - JSON field for card collections

## Additional Features You Can Add

### 1. User Preferences on First Login
Extend the sync endpoint to create default user preferences:
```python
new_user.preferences = {
    "theme": "dark",
    "notifications": True
}
```

### 2. Welcome Email
Send a welcome email on first login by calling an email service after user creation.

### 3. Referral Tracking
Track which user referred the new user.

### 4. Initial Collection
Pre-populate user's collection with starter cards or sets.

### 5. Onboarding Flow
Redirect new users to an onboarding page in the frontend:
```typescript
if (data.is_new) {
  navigate('/onboarding');
}
```

## Error Handling
The implementation handles:
- Missing Auth0 token
- Invalid/expired token
- Database errors (duplicate emails, connection issues)
- Missing Auth0 user data
- Network failures

## Testing

### 1. Test New User Creation
- Log in with a new Auth0 account
- Check backend logs for user creation
- Verify user appears in database
- Check localStorage has `userId`

### 2. Test Existing User
- Log in with same account again
- Verify `is_new` is false in response
- Verify user_id remains the same

### 3. Test Error Cases
- Manually expire token and test
- Test with invalid API URL
- Check backend error logs

## Security Notes
- Always verify Auth0 tokens on the backend
- Use HTTPS in production
- Store sensitive data (user_id) securely
- Validate all user input
- Use Auth0 rules/hooks for additional security logic

## Future Enhancements
- Implement refresh token handling
- Add user roles/permissions from Auth0
- Create audit logs for user creation
- Implement soft delete for users
- Add user metadata syncing
