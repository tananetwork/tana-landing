# Testing QR Code Authentication

This guide explains how to test the QR code authentication system in isolation while the backend identity service is being built.

## Quick Start

### 1. Start the Development Server

```bash
cd websites/landing
npm run dev
```

Navigate to: http://localhost:3000/login

### 2. What You Should See

The login page will attempt to connect to `http://localhost:8090/auth/session/create` and will show:

- **Without backend running**: Error message "Failed to create session"
- **With backend running**: QR code and "Waiting for scan" status

## Testing Without the Backend

You can test the UI states manually using browser DevTools:

### Test All UI States

Open the browser console and run these commands to manually trigger different states:

```javascript
// Simulate loading state (initial state)
// Just refresh the page

// To test the QR code display, you can inspect the component
// by temporarily hardcoding a test value in useQRAuth.ts

// Test scanned state
// This requires modifying the SSE response or using DevTools to set state
```

## Testing With Mock Backend

Create a simple mock server to test the full flow:

### Mock Server (Node.js)

Create `mock-identity-server.js`:

```javascript
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

// Store active sessions
const sessions = new Map()

// Create session endpoint
app.post('/auth/session/create', (req, res) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const challenge = `challenge_${Math.random().toString(36).substr(2, 32)}`

  const sessionData = {
    sessionId,
    challenge,
    qrData: {
      protocol: 'tana',
      type: 'auth',
      sessionId,
      challenge,
      server: 'http://localhost:8090'
    },
    expiresIn: 300,
    expiresAt: new Date(Date.now() + 300000).toISOString(),
    status: 'waiting'
  }

  sessions.set(sessionId, sessionData)

  console.log('Created session:', sessionId)
  res.json(sessionData)
})

// SSE endpoint
app.get('/auth/session/:id/events', (req, res) => {
  const sessionId = req.params.id

  console.log('SSE connected for session:', sessionId)

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // Send initial status
  res.write(`data: ${JSON.stringify({
    type: 'status_update',
    sessionId,
    status: 'waiting',
    timestamp: new Date().toISOString()
  })}\n\n`)

  // Simulate scanned after 3 seconds
  setTimeout(() => {
    console.log('Simulating scan for:', sessionId)
    res.write(`data: ${JSON.stringify({
      type: 'status_update',
      sessionId,
      status: 'scanned',
      timestamp: new Date().toISOString()
    })}\n\n`)
  }, 3000)

  // Simulate approval after 6 seconds
  setTimeout(() => {
    console.log('Simulating approval for:', sessionId)
    res.write(`data: ${JSON.stringify({
      type: 'approved',
      sessionId,
      sessionToken: `token_${Math.random().toString(36).substr(2, 32)}`,
      userId: 'user_123',
      username: 'alice',
      timestamp: new Date().toISOString()
    })}\n\n`)

    // Close connection after approval
    setTimeout(() => {
      res.end()
    }, 100)
  }, 6000)

  // Handle client disconnect
  req.on('close', () => {
    console.log('SSE disconnected for:', sessionId)
  })
})

// Manual approval endpoint (for testing rejection/approval)
app.post('/auth/session/:id/approve', (req, res) => {
  const sessionId = req.params.id
  console.log('Manual approval for:', sessionId)
  res.json({ success: true })
})

app.post('/auth/session/:id/reject', (req, res) => {
  const sessionId = req.params.id
  console.log('Manual rejection for:', sessionId)
  res.json({ success: true })
})

app.listen(8090, () => {
  console.log('Mock identity server running on http://localhost:8090')
  console.log('Endpoints:')
  console.log('  POST /auth/session/create')
  console.log('  GET /auth/session/:id/events')
  console.log('  POST /auth/session/:id/approve')
  console.log('  POST /auth/session/:id/reject')
})
```

### Run Mock Server

```bash
# Install dependencies
npm install -g express cors

# Run server
node mock-identity-server.js
```

### Test Flow

1. Start mock server: `node mock-identity-server.js`
2. Start Next.js dev: `npm run dev`
3. Navigate to: http://localhost:3000/login
4. Watch the automatic flow:
   - QR code appears immediately
   - After 3 seconds: "QR Code Scanned" status
   - After 6 seconds: "Login Approved" and redirect

## Manual Testing Scenarios

### Test Rejection

Modify the mock server timeout to send rejection instead:

```javascript
setTimeout(() => {
  res.write(`data: ${JSON.stringify({
    type: 'rejected',
    sessionId,
    timestamp: new Date().toISOString()
  })}\n\n`)
  res.end()
}, 6000)
```

### Test Expiration

```javascript
setTimeout(() => {
  res.write(`data: ${JSON.stringify({
    type: 'expired',
    sessionId,
    timestamp: new Date().toISOString()
  })}\n\n`)
  res.end()
}, 10000)
```

### Test Connection Error

Stop the mock server while a session is active to test connection loss handling.

## Using curl to Test Endpoints

### Create Session

```bash
curl -X POST http://localhost:8090/auth/session/create \
  -H "Content-Type: application/json" \
  -d '{"appName":"Tana","returnUrl":"http://localhost:3000/dashboard"}'
```

### Watch SSE Events

```bash
curl -N http://localhost:8090/auth/session/SESSION_ID_HERE/events
```

## Browser DevTools Testing

### Inspect SSE Connection

1. Open DevTools → Network tab
2. Filter by "events"
3. Look for the EventSource connection
4. Click to see real-time messages

### Inspect localStorage

After successful login:

```javascript
// In browser console
localStorage.getItem('tana_session_token')
localStorage.getItem('tana_user_id')
localStorage.getItem('tana_username')
```

### Clear Session

```javascript
// In browser console
localStorage.clear()
// Then refresh to go back to login
```

## Visual Testing Checklist

Visit http://localhost:3000/login and verify:

- [ ] Page loads without errors
- [ ] Beautiful dark theme matches Tana branding
- [ ] QR code placeholder or loading state shows
- [ ] Error messages display clearly
- [ ] All states are visually distinct
- [ ] Responsive on mobile (test with DevTools)
- [ ] Animations are smooth
- [ ] Typography is readable
- [ ] Colors have sufficient contrast
- [ ] Icons render correctly

## Functional Testing Checklist

With mock server running:

- [ ] Session creation succeeds
- [ ] QR code renders with data
- [ ] SSE connection establishes
- [ ] Status updates in real-time
- [ ] Scanned state shows correctly
- [ ] Approved state shows success
- [ ] Redirect happens after approval
- [ ] Session data saves to localStorage
- [ ] Dashboard shows session info
- [ ] Logout clears session
- [ ] Refresh button works on error
- [ ] Back button returns to home
- [ ] Rejection handling works
- [ ] Expiration handling works

## Performance Testing

Check browser console for:

- Memory leaks (use DevTools Performance)
- SSE reconnection loops
- React warnings
- Console errors

## Accessibility Testing

- [ ] Tab navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Screen reader friendly
- [ ] Keyboard shortcuts work

## Mobile Testing

Use Chrome DevTools device emulation:

- [ ] iPhone SE (small screen)
- [ ] iPhone 14 Pro
- [ ] iPad
- [ ] Various Android sizes

Check:
- QR code size appropriate
- Text readable
- Buttons tappable
- No horizontal scroll

## Common Issues

### "Failed to create session"
- Mock server not running
- CORS issues
- Port 8090 in use
- Wrong API URL in .env.local

### "Connection lost"
- SSE endpoint not responding
- Network changed
- Server restarted
- Timeout occurred

### QR code not showing
- Empty qrData string
- React rendering issue
- qrcode.react not installed
- Import error

### Redirect not working
- localStorage blocked
- Next.js router issue
- returnUrl malformed
- Session data incomplete

## Next Steps

Once the real backend identity service is ready:

1. Update `.env.local` with production URL
2. Remove mock server
3. Test with real mobile app
4. Verify Ed25519 signature validation
5. Test full end-to-end flow
6. Add monitoring/analytics
7. Load test with multiple sessions

## Debugging Tips

### Enable Verbose Logging

Add to hooks/useQRAuth.ts:

```typescript
console.log('SSE update received:', update)
console.log('Current status:', status)
```

### Monitor Network

Watch DevTools Network tab for:
- POST /auth/session/create
- GET /auth/session/:id/events (EventSource)

### Check React State

Use React DevTools to inspect:
- useQRAuth hook state
- Component re-renders
- Props flow

## Integration with Mobile App

The QR code contains:
```
tana://auth?session=XXX&challenge=YYY&server=http://localhost:8090
```

Mobile app should:
1. Parse URL
2. Extract session, challenge, server
3. Sign challenge with Ed25519 private key
4. POST signature to server
5. Server validates and approves session
6. Web receives approval via SSE
7. User logged in

## Screenshots

Take screenshots of each state for documentation:
- Loading
- QR code displayed
- Scanned
- Approved
- Rejected
- Expired
- Error

Save to: `websites/landing/docs/screenshots/`

## Questions?

See the main README: `QR_AUTH_README.md`
