# Debugging Authentication Issues

## Quick Fix for Redirect Loops

If you're stuck in an infinite redirect loop between `/login` and `/dashboard`, open your browser console and run:

```javascript
tanaDebug.clearAuth()
```

This will clear all authentication data (localStorage + cookies) and reload the page.

## Available Debug Commands

The app includes built-in debug tools accessible via the browser console:

### 1. Show Current Auth State

```javascript
tanaDebug.showAuthState()
```

This displays:
- localStorage data (session token, user ID, username, expiry)
- Parsed session object
- HTTP-only cookies
- Token expiration status

**Example output:**
```
[TANA_DEBUG] Current Auth State:
localStorage: {
  sessionToken: "abc123...",
  userId: "user-123",
  username: "alice",
  tokenExpiry: "2025-11-21T10:00:00Z"
}
Session (from getSession()): {
  token: "abc123...",
  userId: "user-123",
  username: "alice",
  expiresAt: "2025-11-21T10:00:00Z"
}
Cookies (tana_*): {
  tana_session_token: "abc123..."
}
Token expiry: {
  expiresAt: "2025-11-21T10:00:00Z",
  now: "2025-11-14T12:30:00Z",
  isExpired: false,
  minutesUntilExpiry: 10050
}
```

### 2. Clear All Auth Data

```javascript
tanaDebug.clearAuth()
```

This will:
1. Clear localStorage (session token, user ID, username, expiry)
2. Clear HTTP-only session cookie via API
3. Reload the page after 500ms

**When to use:** When stuck in redirect loops or testing fresh login flow

### 3. Clear Only localStorage

```javascript
tanaDebug.clearLocalStorage()
```

Clears only the localStorage data, keeps cookies intact.

**When to use:** Testing localStorage/cookie sync issues

### 4. Clear Only Cookies

```javascript
await tanaDebug.clearCookies()
```

Clears only the HTTP-only session cookie, keeps localStorage intact.

**When to use:** Testing what happens when cookie expires but localStorage exists

### 5. Show Help

```javascript
tanaDebug.help()
```

Displays a help menu with all available commands.

## Console Logging

The application includes comprehensive debug logging prefixed by component:

### Log Prefixes

- `[USER_CONTEXT]` - User context provider authentication checks
- `[LOGIN]` - Login page authentication and redirects
- `[DASHBOARD]` - Dashboard page authentication and redirects
- `[QR_AUTH]` - QR code authentication flow
- `[AUTH_DEBUG]` - Debug utility functions

### Example Flow Logs

**Successful Login:**
```
[USER_CONTEXT] Starting auth check...
[USER_CONTEXT] No valid session found
[USER_CONTEXT] Cleared stale localStorage data
[USER_CONTEXT] Auth check complete, isLoading = false
[LOGIN] Auth state: { user: null, isLoading: false }
[QR_AUTH] Login approved, saving session...
[QR_AUTH] Session cookie saved, refreshing user context...
[USER_CONTEXT] Starting auth check...
[USER_CONTEXT] User authenticated: alice
[USER_CONTEXT] Auth check complete, isLoading = false
[QR_AUTH] User context refreshed
[QR_AUTH] Redirecting to: /dashboard
[LOGIN] Auth state: { user: alice, isLoading: false }
[LOGIN] User authenticated, redirecting to dashboard...
[DASHBOARD] Auth state: { user: alice, isLoading: false, error: null }
```

**Accessing Dashboard Without Auth:**
```
[USER_CONTEXT] Starting auth check...
[USER_CONTEXT] No valid session found
[USER_CONTEXT] Cleared stale localStorage data
[USER_CONTEXT] Auth check complete, isLoading = false
[DASHBOARD] Auth state: { user: null, isLoading: false, error: null }
[DASHBOARD] User not authenticated, redirecting to login...
[LOGIN] Auth state: { user: null, isLoading: false }
```

## Common Scenarios

### Scenario 1: Redirect Loop

**Symptoms:**
- Bouncing between `/login` and `/dashboard`
- Console shows repeated redirect logs

**Diagnosis:**
```javascript
tanaDebug.showAuthState()
```

**Look for:**
- localStorage has data but cookies are empty (or vice versa)
- Token is expired

**Fix:**
```javascript
tanaDebug.clearAuth()
```

### Scenario 2: Can't Login

**Symptoms:**
- QR code approved but stays on login page
- No redirect to dashboard

**Diagnosis:**
Check console logs for:
```
[QR_AUTH] Login approved, saving session...
[QR_AUTH] Session cookie saved, refreshing user context...
```

If you see an error after these logs, the UserContext might not be refreshing.

**Fix:**
1. Clear all auth data: `tanaDebug.clearAuth()`
2. Try login again
3. If still failing, check that the Identity Service is running

### Scenario 3: Logged Out Unexpectedly

**Symptoms:**
- Was logged in, now redirected to login
- Didn't click logout

**Diagnosis:**
```javascript
tanaDebug.showAuthState()
```

Check the token expiry section. If `isExpired: true`, the session expired.

**Fix:**
This is expected behavior. Login again with QR code.

### Scenario 4: Testing Fresh State

**Symptoms:**
- Want to test login flow from scratch
- Need to clear all previous test data

**Fix:**
```javascript
tanaDebug.clearAuth()
```

## Manual Browser Console Debugging

If `tanaDebug` is not available, you can manually inspect and clear data:

### Check localStorage

```javascript
// View all localStorage
Object.keys(localStorage).forEach(key => {
  console.log(key, localStorage.getItem(key))
})

// Clear Tana-specific items
localStorage.removeItem('tana_session_token')
localStorage.removeItem('tana_user_id')
localStorage.removeItem('tana_username')
localStorage.removeItem('tana_token_expiry')
```

### Check Cookies

```javascript
// View all cookies
console.log(document.cookie)

// Note: HTTP-only cookies (like tana_session_token) won't appear here
// They can only be cleared via API
```

### Clear Session Cookie

```javascript
await fetch('/api/auth/session', { method: 'DELETE' })
```

### Hard Reset

```javascript
// Clear everything and reload
localStorage.clear()
await fetch('/api/auth/session', { method: 'DELETE' })
location.reload()
```

## Browser DevTools

### Application Tab (Chrome/Edge) / Storage Tab (Firefox)

1. Open DevTools (F12)
2. Go to Application tab
3. Expand "Local Storage" - you'll see Tana data here
4. Expand "Cookies" - look for `tana_session_token`
5. Right-click any item to delete it

### Network Tab

Useful for debugging API calls:

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for requests to:
   - `/api/auth/session` (POST/DELETE)
   - Identity service endpoints (if configured)

### Console Tab

View all the debug logs with prefixes like `[USER_CONTEXT]`, `[LOGIN]`, etc.

**Filter logs:**
```javascript
// In console filter box, type:
[USER_CONTEXT]
// to see only user context logs
```

## Tips

1. **Always check logs first** - They tell you exactly what's happening in the auth flow

2. **Use showAuthState() liberally** - It's a quick way to see if localStorage and cookies are in sync

3. **Clear auth data when testing** - Use `tanaDebug.clearAuth()` before testing login flow

4. **Check token expiry** - Sessions expire after 7 days by default

5. **Verify Identity Service** - If login isn't working, make sure the Identity Service is running on port 8090 (or whatever `NEXT_PUBLIC_IDENTITY_API_URL` is set to)

## Related Files

- `/lib/debug.ts` - Debug utility functions
- `/lib/auth.ts` - Authentication helpers
- `/context/user-context.tsx` - User context provider
- `/app/login/page.tsx` - Login page
- `/app/dashboard/page.tsx` - Dashboard page
- `/hooks/useQRAuth.ts` - QR authentication hook
- `/app/api/auth/session/route.ts` - Session cookie API

## Getting Help

If you're still stuck after trying these debugging steps:

1. Run `tanaDebug.showAuthState()` and copy the output
2. Check console logs for errors
3. Check Network tab for failed API requests
4. Check that Identity Service is running
5. Try `tanaDebug.clearAuth()` and login again
