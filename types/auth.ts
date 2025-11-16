/**
 * Authentication types for QR code login system
 */

export type SessionStatus = 'waiting' | 'scanned' | 'approved' | 'rejected' | 'expired'

export interface QRSessionData {
  sessionId: string
  challenge: string
  qrData: {
    protocol: string
    type: string
    sessionId: string
    challenge: string
    server: string
  }
  expiresIn: number
  expiresAt: string
}

export interface SSEStatusUpdate {
  type: 'status_update' | 'approved' | 'rejected' | 'expired'
  sessionId: string
  status?: SessionStatus
  sessionToken?: string
  userId?: string
  username?: string
  timestamp: string
}

export interface SessionTokenData {
  token: string
  userId: string
  username: string
  expiresAt: string
}
