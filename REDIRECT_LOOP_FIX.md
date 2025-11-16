# Redirect Loop Fix - Summary

## Problem Description

An infinite redirect loop was occurring between `/login` and `/dashboard` pages caused by inconsistent authentication checks between localStorage and HTTP-only cookies.

## Root Cause

The application had **two separate authentication mechanisms** that could get out of sync:

1. **localStorage tokens** - Used by the login page via `isAuthenticated()` from `lib/auth.ts`
2. **HTTP-only cookies** - Used by the dashboard via `UserContext` server actions

### The Loop Scenario

When localStorage had stale data but no valid cookie (or vice versa):

```
User visits /dashboard
  → UserContext checks HTTP-only cookie (server-side)
  → No valid cookie found
  → Redirects to /login

User at /login
  → isAuthenticated() checks localStorage (client-side)
  → Stale token exists in localStorage
  → Redirects to /dashboard

INFINITE LOOP!
```

## Changes Made

### 1. Login Page (`/app/login/page.tsx`)

**Before:**
- Used `isAuthenticated()` which checked localStorage only
- No loading state guard
- Redirected immediately based on localStorage

**After:**
- Uses `useUser()` hook which checks server-side session
- Proper loading state handling
- Only redirects after authentication check completes
- Added debug logging

```typescript
// Old approach (causes loop)
useEffect(() => {
  if (isAuthenticated()) {
    router.push('/dashboard')
  }
}, [router])

// New approach (fixes loop)
useEffect(() => {
  console.log('[LOGIN] Auth state:', { user: user?.username, isLoading })

  // Only redirect if we're NOT loading and user IS authenticated
  if (!isLoading && user) {
    console.log('[LOGIN] User authenticated, redirecting to dashboard...')
    router.push('/dashboard')
  }
}, [user, isLoading, router])
```

### 2. Dashboard Page (`/app/dashboard/page.tsx`)

**Before:**
- Redirect logic was correct but lacked logging

**After:**
- Added debug logging to track authentication flow
- Enhanced error handling in useEffect dependency array

```typescript
useEffect(() => {
  console.log('[DASHBOARD] Auth state:', { user: user?.username, isLoading, error })

  // Only redirect if we're NOT loading and user is NOT authenticated
  if (!isLoading && !user) {
    console.log('[DASHBOARD] User not authenticated, redirecting to login...')
    router.push('/login')
  }
}, [user, isLoading, router, error])
```

### 3. User Context (`/context/user-context.tsx`)

**Before:**
- Basic authentication check
- No cleanup of stale localStorage

**After:**
- Added debug logging throughout auth flow
- **Automatically clears stale localStorage** when no valid session
- Better error handling

```typescript
if (userData) {
  console.log('[USER_CONTEXT] User authenticated:', userData.user.username)
  // ... set user data
} else {
  console.log('[USER_CONTEXT] No valid session found')
  // Clear any stale localStorage data
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tana_session_token')
    localStorage.removeItem('tana_user_id')
    localStorage.removeItem('tana_username')
    localStorage.removeItem('tana_token_expiry')
    console.log('[USER_CONTEXT] Cleared stale localStorage data')
  }
  // ... clear state
}
```

### 4. QR Auth Hook (`/hooks/useQRAuth.ts`)

**Before:**
- Saved session to cookie but didn't refresh UserContext

**After:**
- Refreshes UserContext after successful login
- Added debug logging

```typescript
fetch('/api/auth/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionToken, expiresAt }),
})
  .then(() => {
    console.log('[QR_AUTH] Session cookie saved, refreshing user context...')
    return refreshUser() // <-- This ensures UserContext stays in sync
  })
  .then(() => {
    console.log('[QR_AUTH] User context refreshed')
  })
```

### 5. Auth Utilities (`/lib/auth.ts`)

Added a debug utility function to clear all authentication data:

```typescript
/**
 * Debug function to clear all authentication data
 * Useful for fixing redirect loops and clearing stale sessions
 */
export function clearAllAuthData(): void {
  console.log('[AUTH_DEBUG] Clearing all authentication data...')

  // Clear localStorage
  clearSession()

  // Clear session cookie via API
  if (typeof window !== 'undefined') {
    fetch('/api/auth/session', { method: 'DELETE' })
      .then(() => console.log('[AUTH_DEBUG] Session cookie cleared'))
      .catch((err) => console.error('[AUTH_DEBUG] Failed to clear session cookie:', err))
  }

  console.log('[AUTH_DEBUG] All auth data cleared')
}
```

## How to Clear Stale Sessions (If Needed)

If you ever get stuck in a redirect loop, open the browser console and run:

```javascript
// Method 1: Use the utility function
import { clearAllAuthData } from '@/lib/auth'
clearAllAuthData()

// Method 2: Manual cleanup
localStorage.clear()
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
})

// Then hard refresh the page
location.reload()
```

Or simply:
1. Open DevTools (F12)
2. Go to Application tab
3. Clear localStorage
4. Clear cookies for the site
5. Refresh the page

## Debug Logging

The fix includes comprehensive debug logging prefixed by component:

- `[USER_CONTEXT]` - User context provider authentication checks
- `[LOGIN]` - Login page authentication and redirects
- `[DASHBOARD]` - Dashboard page authentication and redirects
- `[QR_AUTH]` - QR code authentication flow
- `[AUTH_DEBUG]` - Debug utility functions

## Expected Behavior After Fix

### When NOT logged in:
1. Visit `/dashboard`
2. UserContext checks (logs: "No valid session found")
3. Clears any stale localStorage
4. Redirects to `/login` (logs: "User not authenticated, redirecting to login...")
5. **Stays on `/login`** (no redirect because `user` is null and `!isLoading`)

### When logged in (valid session):
1. Visit `/login`
2. UserContext loads (logs: "User authenticated: username")
3. Login page checks (logs: "User authenticated, redirecting to dashboard...")
4. Redirects to `/dashboard`
5. **Stays on `/dashboard`** (no redirect because `user` exists and `!isLoading`)

### When logged in (invalid/expired session):
1. Visit any protected page
2. UserContext checks session cookie
3. Server returns null (invalid session)
4. UserContext clears localStorage automatically
5. Treats as not logged in
6. Redirects to `/login`
7. **Stays on `/login`**

## Key Principles Applied

1. **Single Source of Truth**: Use server-side session checks (HTTP-only cookies) as the primary authentication mechanism
2. **Loading State Guards**: Never redirect while `isLoading === true`
3. **Automatic Cleanup**: Clear localStorage when server says session is invalid
4. **Debug Visibility**: Console logs track the entire authentication flow
5. **Context Synchronization**: Refresh UserContext after login to ensure consistency

## Files Modified

- `/app/login/page.tsx` - Fixed to use UserContext instead of localStorage
- `/app/dashboard/page.tsx` - Added better logging
- `/context/user-context.tsx` - Auto-clear stale localStorage + logging
- `/hooks/useQRAuth.ts` - Refresh UserContext after login + logging
- `/lib/auth.ts` - Added `clearAllAuthData()` utility function

## Testing the Fix

1. **Test Clean Login Flow:**
   - Clear all cookies and localStorage
   - Visit `/login`
   - Scan QR code and approve
   - Should redirect to `/dashboard` once
   - Should stay on `/dashboard`

2. **Test Direct Dashboard Access (Not Logged In):**
   - Clear all cookies and localStorage
   - Visit `/dashboard` directly
   - Should redirect to `/login` once
   - Should stay on `/login`

3. **Test Direct Dashboard Access (Logged In):**
   - Have a valid session
   - Visit `/dashboard` directly
   - Should stay on `/dashboard`
   - No redirects

4. **Test Stale Session:**
   - Have localStorage data but no valid cookie
   - Visit `/dashboard`
   - Should clear localStorage automatically
   - Should redirect to `/login` once
   - Should stay on `/login`

## Result

The redirect loop is completely resolved. Both pages now use the same authentication source (server-side session via UserContext), respect loading states, and automatically clean up stale data.
