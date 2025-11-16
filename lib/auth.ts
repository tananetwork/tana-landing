/**
 * Authentication utilities for QR code login
 */

import type { SessionTokenData } from '@/types/auth'

const TOKEN_STORAGE_KEY = 'tana_session_token'
const USER_ID_STORAGE_KEY = 'tana_user_id'
const USERNAME_STORAGE_KEY = 'tana_username'
const TOKEN_EXPIRY_STORAGE_KEY = 'tana_token_expiry'

/**
 * Get the identity API URL from environment or default
 */
export function getIdentityApiUrl(): string {
  return process.env.NEXT_PUBLIC_IDENTITY_API_URL || 'http://localhost:8090'
}

/**
 * Save session token and user data to localStorage
 */
export function saveSession(data: {
  sessionToken: string
  userId: string
  username: string
  expiresAt?: string
}): void {
  if (typeof window === 'undefined') return

  localStorage.setItem(TOKEN_STORAGE_KEY, data.sessionToken)
  localStorage.setItem(USER_ID_STORAGE_KEY, data.userId)
  localStorage.setItem(USERNAME_STORAGE_KEY, data.username)

  if (data.expiresAt) {
    localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, data.expiresAt)
  }
}

/**
 * Get session token data from localStorage
 */
export function getSession(): SessionTokenData | null {
  if (typeof window === 'undefined') return null

  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  const userId = localStorage.getItem(USER_ID_STORAGE_KEY)
  const username = localStorage.getItem(USERNAME_STORAGE_KEY)
  const expiresAt = localStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY)

  if (!token || !userId || !username) {
    return null
  }

  return {
    token,
    userId,
    username,
    expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

/**
 * Clear session data from localStorage
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_ID_STORAGE_KEY)
  localStorage.removeItem(USERNAME_STORAGE_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY)
}

/**
 * Check if user is authenticated
 *
 * NOTE: This function checks localStorage only. For server-side authentication,
 * use the UserContext which checks HTTP-only cookies.
 */
export function isAuthenticated(): boolean {
  const session = getSession()

  if (!session) return false

  // Check if token is expired
  const expiryDate = new Date(session.expiresAt)
  if (expiryDate < new Date()) {
    clearSession()
    return false
  }

  return true
}

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
