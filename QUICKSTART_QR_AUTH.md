# Quick Start - QR Authentication

Get the QR authentication system running in 2 minutes.

## Option 1: Quick Test (With Mock Server)

```bash
# Terminal 1 - Start mock backend
cd websites/landing
node mock-identity-server.js

# Terminal 2 - Start Next.js
cd websites/landing
npm run dev

# Open browser
# Navigate to: http://localhost:3000/login
```

**What you'll see:**
1. QR code appears immediately
2. After 3 seconds: "QR Code Scanned!"
3. After 6 seconds: "Login Approved!" → redirect to dashboard

## Option 2: UI Only (No Backend)

```bash
cd websites/landing
npm run dev

# Navigate to: http://localhost:3000/login
```

**What you'll see:**
- Error message: "Failed to create session"
- This is expected without the backend running
- UI is still fully functional and testable

## What to Test

### Login Page: http://localhost:3000/login
- QR code display
- Real-time status updates
- Beautiful dark theme
- Smooth animations
- Error handling
- Retry functionality

### Dashboard: http://localhost:3000/dashboard
- Session information display
- Logout functionality
- Protected route (redirects if not authenticated)

## Files to Explore

**Main entry point:**
```
/app/login/page.tsx
```

**Core logic:**
```
/hooks/useQRAuth.ts
```

**Components:**
```
/components/auth/QRCode.tsx
/components/auth/StatusIndicator.tsx
```

## Key Features Demonstrated

1. **Real-time Updates**: SSE connection shows live status changes
2. **State Management**: Smooth transitions between auth states
3. **Error Handling**: Network errors handled gracefully
4. **Session Storage**: Automatic token persistence
5. **Protected Routes**: Dashboard requires authentication
6. **Mobile Responsive**: Works on all screen sizes

## Environment Variables

Create `.env.local` (optional):
```bash
NEXT_PUBLIC_IDENTITY_API_URL=http://localhost:8090
```

Default is `http://localhost:8090` if not set.

## Mock Server Details

The mock server (`mock-identity-server.js`):
- Runs on port 8090
- No dependencies (uses Node.js built-in modules)
- Simulates the full auth flow
- Auto-approves after 6 seconds
- Detailed console logging

## Testing Different States

Edit `mock-identity-server.js` to test:

**Test Rejection:**
```javascript
// Line ~80, replace approval with:
sendEvent({
  type: 'rejected',
  sessionId,
  timestamp: new Date().toISOString()
})
```

**Test Expiration:**
```javascript
// Line ~80, replace approval with:
sendEvent({
  type: 'expired',
  sessionId,
  timestamp: new Date().toISOString()
})
```

**Faster Testing:**
```javascript
// Change timeout values (lines ~70, ~80)
setTimeout(() => { ... }, 1000)  // Scan after 1s
setTimeout(() => { ... }, 2000)  // Approve after 2s
```

## Browser DevTools

### Watch SSE Connection
1. Open DevTools → Network tab
2. Look for "events" request
3. Click it to see real-time messages

### Check Session Data
```javascript
// In browser console after login
localStorage.getItem('tana_session_token')
localStorage.getItem('tana_user_id')
localStorage.getItem('tana_username')
```

### Clear Session
```javascript
// In browser console
localStorage.clear()
location.reload()
```

## Troubleshooting

**"Failed to create session"**
- Make sure mock server is running on port 8090
- Check if port is already in use
- Verify CORS is working (check browser console)

**QR code not showing**
- Check browser console for errors
- Verify `qrcode.react` is installed: `npm list qrcode.react`
- Refresh the page

**SSE not connecting**
- Check Network tab in DevTools
- Verify EventSource is supported (all modern browsers)
- Check mock server console for connection logs

**Redirect not working**
- Check localStorage has session token
- Verify dashboard page exists
- Check browser console for navigation errors

## Next Steps

1. Read `QR_AUTH_README.md` for architecture details
2. See `TESTING_QR_AUTH.md` for comprehensive testing guide
3. Review `QR_AUTH_IMPLEMENTATION_SUMMARY.md` for full overview
4. Customize the UI to match your brand
5. Integrate with your real backend when ready

## Production Integration

When your backend is ready:

1. **Update environment:**
   ```bash
   NEXT_PUBLIC_IDENTITY_API_URL=https://identity.tana.network
   ```

2. **Implement endpoints:**
   - POST /auth/session/create
   - GET /auth/session/:id/events (SSE)

3. **See API specs in:**
   - `QR_AUTH_README.md` → API Integration section
   - `QR_AUTH_IMPLEMENTATION_SUMMARY.md` → API Integration section

## Questions?

- Architecture: See `QR_AUTH_README.md`
- Testing: See `TESTING_QR_AUTH.md`
- Implementation: See `QR_AUTH_IMPLEMENTATION_SUMMARY.md`
- Code: Read inline comments in source files
