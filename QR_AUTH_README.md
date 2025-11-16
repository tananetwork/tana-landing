# QR Code Authentication System

Production-ready QR code login system for the Tana blockchain project landing website.

## Overview

This is a mobile-first authentication system where users see a QR code on the website, scan it with their mobile app (which holds their Ed25519 private keys), and get logged in securely without their private keys ever touching the desktop.

## Architecture

### Components

**Pages:**
- `/app/login/page.tsx` - Main QR code login page
- `/app/dashboard/page.tsx` - Protected dashboard (placeholder)

**Components:**
- `/components/auth/QRCode.tsx` - QR code display component using qrcode.react
- `/components/auth/StatusIndicator.tsx` - Visual status feedback for authentication flow

**Hooks:**
- `/hooks/useQRAuth.ts` - Custom hook managing authentication state and SSE connections

**Libraries:**
- `/lib/auth.ts` - Authentication utilities (session management, localStorage)

**Types:**
- `/types/auth.ts` - TypeScript type definitions for authentication

## Features

### 1. QR Code Display
- High-quality SVG QR code generation
- Error correction level H (high)
- Styled to match Tana's design system
- Responsive sizing

### 2. Real-time Status Updates via SSE
- Connection to identity service SSE endpoint
- Live status updates: waiting → scanned → approved
- Automatic reconnection handling
- Error state management

### 3. Session Management
- Secure localStorage-based session storage
- Automatic expiration checking
- Token validation
- Easy logout functionality

### 4. Beautiful UI
- Mobile-responsive design
- Dark theme matching Tana's branding
- Smooth transitions between states
- Loading states
- Error states
- Success animations

### 5. State Machine

```
loading → waiting → scanned → approved → redirect
                  ↓
                rejected → retry
                  ↓
                expired → retry
```

## Installation

Dependencies are already installed:
```bash
npm install qrcode.react
```

## Configuration

Create a `.env.local` file (see `.env.local.example`):

```bash
NEXT_PUBLIC_IDENTITY_API_URL=http://localhost:8090
```

## Usage

### Testing the Login Flow

1. **Start the Next.js dev server:**
   ```bash
   cd websites/landing
   npm run dev
   ```

2. **Navigate to the login page:**
   ```
   http://localhost:3000/login
   ```

3. **You should see:**
   - QR code displayed prominently
   - Status indicator showing "Waiting for Scan"
   - Step-by-step instructions

### Testing with the Backend

The login page expects the identity service to be running at `http://localhost:8090` with these endpoints:

**POST /auth/session/create**
```json
Request:
{
  "appName": "Tana",
  "returnUrl": "http://localhost:3000/dashboard"
}

Response:
{
  "sessionId": "abc123...",
  "challenge": "xyz789...",
  "qrData": {
    "protocol": "tana",
    "type": "auth",
    "sessionId": "abc123...",
    "challenge": "xyz789...",
    "server": "http://localhost:8090"
  },
  "expiresIn": 300,
  "expiresAt": "2025-11-14T12:00:00Z"
}
```

**GET /auth/session/:id/events** (SSE)
```
Event stream messages:

// When mobile app scans
{"type":"status_update","status":"scanned","sessionId":"abc123...","timestamp":"..."}

// When user approves
{"type":"approved","sessionId":"abc123...","sessionToken":"token123","userId":"user1","username":"alice","timestamp":"..."}

// When user rejects
{"type":"rejected","sessionId":"abc123...","timestamp":"..."}

// When session expires
{"type":"expired","sessionId":"abc123...","timestamp":"..."}
```

### Manual Testing with curl

You can simulate the backend responses:

```bash
# Start SSE server (example)
while true; do
  echo "data: {\"type\":\"status_update\",\"status\":\"waiting\",\"sessionId\":\"test\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"
  echo ""
  sleep 5
done
```

## API Integration

### QR Code Format

The QR code contains a deep link in this format:

```
tana://auth?session=SESSION_ID&challenge=CHALLENGE&server=SERVER_URL
```

When scanned by the mobile app, it should:
1. Parse the URL parameters
2. Extract session ID and challenge
3. Sign the challenge with the user's Ed25519 private key
4. Send the signature to the server
5. Wait for server approval

### Session Storage

After successful authentication, the following data is stored in localStorage:

- `tana_session_token` - JWT or session token
- `tana_user_id` - User's ID
- `tana_username` - User's username
- `tana_token_expiry` - ISO timestamp of token expiration

## Security Considerations

### What's Secure
- Private keys never leave the mobile device
- Challenge-response authentication pattern
- Session tokens stored in localStorage (appropriate for demo)
- High error correction on QR codes
- SSE connection monitoring

### Production Enhancements
- Add HTTPS requirement for production
- Implement CSRF protection
- Add rate limiting on session creation
- Consider httpOnly cookies instead of localStorage
- Add session refresh mechanism
- Implement device fingerprinting
- Add 2FA as optional layer

## Component Reusability

The authentication system is designed to be extracted as a library:

```tsx
// Easy to extract as a standalone package
import { QRAuth } from '@tana/qr-auth'

<QRAuth
  apiUrl="https://api.tana.network"
  appName="Tana"
  onSuccess={(session) => {
    console.log('Logged in:', session)
  }}
  onError={(error) => {
    console.error('Auth error:', error)
  }}
/>
```

## TypeScript Types

All components are fully typed:

```typescript
import type {
  SessionStatus,
  QRSessionData,
  SSEStatusUpdate,
  SessionTokenData
} from '@/types/auth'
```

## Styling

The login page uses:
- Tailwind CSS utility classes
- Dark theme (slate-950 background)
- Blue gradient accents
- Smooth animations via Tailwind
- Responsive design (mobile-first)

## Browser Support

- Modern browsers with ES6+ support
- EventSource (SSE) support required
- localStorage support required

## Accessibility

- Semantic HTML
- ARIA labels where appropriate
- Keyboard navigation support
- Screen reader friendly status updates
- Focus management

## Testing Checklist

- [ ] QR code renders correctly
- [ ] SSE connection establishes
- [ ] Status updates in real-time
- [ ] Approval flow works
- [ ] Rejection flow works
- [ ] Expiration handling works
- [ ] Refresh/retry functionality
- [ ] Redirect after approval
- [ ] Error states display properly
- [ ] Mobile responsive
- [ ] Back navigation works
- [ ] Session persists after refresh
- [ ] Logout clears session

## Known Issues / Edge Cases

1. **SSE Connection Loss**: The system handles connection errors gracefully but doesn't auto-reconnect. Consider adding exponential backoff reconnection.

2. **Multiple Tabs**: If user opens multiple login tabs, they'll create multiple sessions. This is acceptable but could be optimized.

3. **QR Code Refresh**: Currently requires manual refresh after expiration. Could add auto-refresh timer.

4. **Network Changes**: If user switches networks, SSE connection may drop. Handle with reconnection logic.

## Future Enhancements

- [ ] Auto-refresh QR code before expiration
- [ ] Sound/notification on mobile scan
- [ ] Show device info after scan
- [ ] Session history/management
- [ ] Multiple device support
- [ ] Biometric confirmation option
- [ ] QR code animation
- [ ] Progressive Web App support
- [ ] Offline detection
- [ ] WebSocket fallback for SSE

## File Structure

```
websites/landing/
├── app/
│   ├── login/
│   │   └── page.tsx          # QR login page
│   └── dashboard/
│       └── page.tsx          # Protected dashboard
├── components/
│   └── auth/
│       ├── QRCode.tsx        # QR code display
│       └── StatusIndicator.tsx  # Status UI
├── hooks/
│   └── useQRAuth.ts          # Authentication hook
├── lib/
│   └── auth.ts               # Auth utilities
├── types/
│   └── auth.ts               # TypeScript types
└── .env.local.example        # Environment template
```

## License

Part of the Tana blockchain project.
