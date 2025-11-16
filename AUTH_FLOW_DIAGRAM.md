# QR Authentication Flow Diagram

Complete visual flow of the QR code authentication system.

## System Overview

```
┌─────────────┐          ┌──────────────┐          ┌─────────────┐
│   Desktop   │          │   Identity   │          │   Mobile    │
│   Browser   │◄────────►│   Service    │◄────────►│     App     │
│             │   HTTP   │  (Backend)   │   HTTP   │             │
└─────────────┘   SSE    └──────────────┘           └─────────────┘
```

## Detailed Flow

### Step 1: Session Creation

```
Desktop Browser                Identity Service               Mobile App
      │                              │                            │
      │──── POST /session/create ───►│                            │
      │     {appName, returnUrl}     │                            │
      │                              │                            │
      │◄─── 200 OK ──────────────────│                            │
      │     {sessionId, challenge}   │                            │
      │                              │                            │
      │                              │                            │
   [Generate QR Code]                │                            │
      │                              │                            │
   tana://auth?                      │                            │
   session=ABC&                      │                            │
   challenge=XYZ&                    │                            │
   server=http://...                 │                            │
      │                              │                            │
```

### Step 2: SSE Connection

```
Desktop Browser                Identity Service               Mobile App
      │                              │                            │
      │──── GET /session/ABC/events ►│                            │
      │     (EventSource)            │                            │
      │                              │                            │
      │◄─── SSE Stream Opened ───────│                            │
      │                              │                            │
      │◄─── data: {status:waiting} ──│                            │
      │                              │                            │
   [Display QR Code]                 │                            │
   [Show "Waiting" Status]           │                            │
      │                              │                            │
```

### Step 3: QR Scan

```
Desktop Browser                Identity Service               Mobile App
      │                              │                            │
      │                              │                            │
      │                              │                     [User scans QR]
      │                              │                            │
      │                              │◄──── POST /session/ABC ────│
      │                              │      {type: "scan"}        │
      │                              │                            │
      │                              │──── 200 OK ───────────────►│
      │                              │                            │
      │                              │                            │
      │◄─── data: {status:scanned} ──│                            │
      │                              │                            │
   [Update UI to "Scanned"]          │                            │
   [Show "Approve on device"]        │                            │
      │                              │                            │
```

### Step 4: Cryptographic Approval

```
Desktop Browser                Identity Service               Mobile App
      │                              │                            │
      │                              │                     [Display approval UI]
      │                              │                     [Show: sessionId, app]
      │                              │                            │
      │                              │                     [User taps "Approve"]
      │                              │                            │
      │                              │                     [Sign challenge with]
      │                              │                     [Ed25519 private key]
      │                              │                            │
      │                              │◄──── POST /approve ────────│
      │                              │      {                     │
      │                              │        sessionId,          │
      │                              │        signature,          │
      │                              │        publicKey           │
      │                              │      }                     │
      │                              │                            │
      │                              │                            │
      │                          [Validate signature]            │
      │                          [Generate session token]        │
      │                              │                            │
      │                              │──── 200 OK ───────────────►│
      │                              │                            │
      │                              │                     [Show success]
      │                              │                     [Close approval]
      │                              │                            │
```

### Step 5: Approval Notification

```
Desktop Browser                Identity Service               Mobile App
      │                              │                            │
      │◄─── data: {                ──│                            │
      │       type: "approved",      │                            │
      │       sessionToken,          │                            │
      │       userId,                │                            │
      │       username               │                            │
      │     }                        │                            │
      │                              │                            │
   [Save to localStorage]            │                            │
   [Show "Approved!" animation]      │                            │
      │                              │                            │
      │                              │                            │
   [1.5s delay]                      │                            │
      │                              │                            │
   [Redirect to dashboard]           │                            │
      │                              │                            │
```

## Alternative Flows

### Rejection Flow

```
Desktop Browser                Identity Service               Mobile App
      │                              │                            │
      │                              │                     [User taps "Reject"]
      │                              │                            │
      │                              │◄──── POST /reject ─────────│
      │                              │                            │
      │◄─── data: {type:rejected} ───│                            │
      │                              │                            │
   [Show "Login Rejected"]           │                            │
   [Display retry button]            │                            │
      │                              │                            │
```

### Expiration Flow

```
Desktop Browser                Identity Service               Mobile App
      │                              │                            │
   [5 minutes pass]                  │                            │
      │                              │                            │
      │                         [Session expires]                 │
      │                              │                            │
      │◄─── data: {type:expired} ────│                            │
      │                              │                            │
   [Show "Session Expired"]          │                            │
   [Display refresh button]          │                            │
      │                              │                            │
```

### Network Error Flow

```
Desktop Browser                Identity Service               Mobile App
      │                              │                            │
      │──── POST /session/create ───►│                            │
      │                              X (network error)            │
      │                              │                            │
   [Catch error]                     │                            │
   [Show error message]              │                            │
   [Display retry button]            │                            │
      │                              │                            │
```

## State Transitions

```
┌─────────┐
│ Loading │ (Initial page load)
└────┬────┘
     │
     ▼
┌─────────┐       Error
│ Waiting │──────────────┐
└────┬────┘              │
     │                   ▼
     │ Scan         ┌────────┐
     ├─────────────►│ Error  │◄──┐
     │              └────┬───┘   │
     │                   │       │
     │                   │ Retry │
     │                   └───────┘
     ▼
┌─────────┐
│ Scanned │ (Waiting for approval)
└────┬────┘
     │
     ├────Approve───┐
     │              ▼
     │         ┌──────────┐      Redirect
     │         │ Approved │─────────────►[Dashboard]
     │         └──────────┘
     │
     ├────Reject────┐
     │              ▼
     │         ┌──────────┐      Retry
     │         │ Rejected │──────────►[New Session]
     │         └──────────┘
     │
     └────Expire────┐
                    ▼
               ┌──────────┐      Retry
               │ Expired  │──────────►[New Session]
               └──────────┘
```

## Component Communication

```
┌──────────────────────────────────────────┐
│          LoginPage Component             │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │      useQRAuth Hook                │  │
│  │                                    │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │   initSession()              │  │  │
│  │  │   - POST /session/create     │  │  │
│  │  │   - Generate QR data         │  │  │
│  │  └──────────────────────────────┘  │  │
│  │                                    │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │   connectSSE()               │  │  │
│  │  │   - Open EventSource         │  │  │
│  │  │   - Listen for events        │  │  │
│  │  │   - Update state             │  │  │
│  │  └──────────────────────────────┘  │  │
│  │                                    │  │
│  │  State: {                          │  │
│  │    status,                         │  │
│  │    qrData,                         │  │
│  │    sessionId,                      │  │
│  │    error                           │  │
│  │  }                                 │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────┐  ┌─────────────────┐ │
│  │  QRCode        │  │ StatusIndicator │ │
│  │  Component     │  │ Component       │ │
│  └────────────────┘  └─────────────────┘ │
│                                          │
└──────────────────────────────────────────┘
```

## Data Storage

```
Browser localStorage
┌───────────────────────────────────┐
│  Key                    Value     │
├───────────────────────────────────┤
│  tana_session_token     "token_" │
│  tana_user_id           "user_"  │
│  tana_username          "alice"  │
│  tana_token_expiry      "2025-" │
└───────────────────────────────────┘
```

## Security Flow

```
┌──────────────┐
│ Private Keys │ (NEVER leaves mobile)
│  (Ed25519)   │
└──────┬───────┘
       │
       │ Sign
       ▼
┌──────────────┐
│  Signature   │──────► Sent to server
└──────────────┘

Server validates:
  ✓ Signature matches challenge
  ✓ Public key is registered
  ✓ Session not expired
  ✓ Session in "scanned" state
```

## Timeline Example

```
Time    Desktop Browser           Identity Service          Mobile App
────────────────────────────────────────────────────────────────────────
0:00    Load /login page
0:01    POST /session/create  ──►
0:02                          ◄── Response (sessionId)
0:03    Generate QR code
0:04    GET /session/X/events ──►
0:05                          ◄── SSE: status=waiting
0:06    Display QR code

0:15                                                       Scan QR code
0:16                          ◄── POST /scan
0:17                          ◄── SSE: status=scanned
0:18    Update UI: "Scanned"

0:25                                                       Tap "Approve"
0:26                                                       Sign challenge
0:27                          ◄── POST /approve {signature}
0:28                              Validate signature
0:29                              Generate token
0:30                          ◄── SSE: approved {token}
0:31    Save token
0:32    Show success animation
0:33    Redirect to dashboard
```

## Mobile App Deep Link Parsing

```
Input: tana://auth?session=ABC&challenge=XYZ&server=http://localhost:8090

Mobile App Processing:
┌────────────────────────────┐
│ 1. Parse URL               │
│    - protocol: "tana"      │
│    - type: "auth"          │
│    - params: {...}         │
├────────────────────────────┤
│ 2. Validate                │
│    - Check server trusted  │
│    - Verify format         │
├────────────────────────────┤
│ 3. Display Approval UI     │
│    - Show app name         │
│    - Show session ID       │
│    - Request confirmation  │
├────────────────────────────┤
│ 4. Sign Challenge          │
│    - Load private key      │
│    - Sign with Ed25519     │
│    - Generate signature    │
├────────────────────────────┤
│ 5. Send to Server          │
│    - POST to server/approve│
│    - Include signature     │
│    - Include public key    │
└────────────────────────────┘
```

## Error Handling

```
Error Type          Handler                    User Experience
─────────────────────────────────────────────────────────────────
Network error       Catch in useQRAuth         Red error banner
                    Set error state            + Retry button

SSE disconnect      EventSource.onerror        Connection lost msg
                    Close connection           Auto-reconnect (TBD)

Session expired     SSE event: expired         "Session Expired"
                    Update state               + Refresh button

User rejection      SSE event: rejected        "Login Rejected"
                    Update state               + Try Again button

Invalid response    JSON parse error           Generic error msg
                    Catch block                + Retry button

Backend down        Fetch fails                "Server unavailable"
                    Connection refused         + Retry button
```

## Performance Considerations

```
Optimization              Implementation
─────────────────────────────────────────────────────────────
QR generation            Rendered once, cached
SSE connection           Single connection, auto-cleanup
React re-renders         Minimal, state-driven updates
Bundle size              qrcode.react (~10KB gzipped)
Image formats            SVG (scalable, small)
Network requests         Only 1 POST + 1 SSE
localStorage             Synchronous, fast access
```

## Browser Compatibility

```
Feature              Chrome  Firefox  Safari  Edge
───────────────────────────────────────────────────
EventSource (SSE)      ✓       ✓        ✓      ✓
localStorage           ✓       ✓        ✓      ✓
ES6+ syntax            ✓       ✓        ✓      ✓
Fetch API              ✓       ✓        ✓      ✓
CSS Grid/Flexbox       ✓       ✓        ✓      ✓
```
