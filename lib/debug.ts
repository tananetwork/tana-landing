/**
 * Debug utilities for browser console
 *
 * These functions can be called from the browser console to help debug
 * authentication issues and clear stale data.
 *
 * Usage in browser console:
 * ```
 * window.tanaDebug.clearAuth()
 * window.tanaDebug.showAuthState()
 * ```
 */

import { clearAllAuthData, getSession } from './auth'

export const tanaDebug = {
  /**
   * Clear all authentication data (localStorage + cookies)
   */
  clearAuth() {
    console.log('%c[TANA_DEBUG] Clearing all auth data...', 'color: #ff6b6b; font-weight: bold')
    clearAllAuthData()
    setTimeout(() => {
      console.log('%c[TANA_DEBUG] Auth cleared. Refreshing page...', 'color: #ff6b6b; font-weight: bold')
      window.location.reload()
    }, 500)
  },

  /**
   * Show current authentication state
   */
  showAuthState() {
    console.log('%c[TANA_DEBUG] Current Auth State:', 'color: #4ecdc4; font-weight: bold')

    // Check localStorage
    const localStorageData = {
      sessionToken: localStorage.getItem('tana_session_token'),
      userId: localStorage.getItem('tana_user_id'),
      username: localStorage.getItem('tana_username'),
      tokenExpiry: localStorage.getItem('tana_token_expiry'),
    }
    console.log('localStorage:', localStorageData)

    // Check session helper
    const session = getSession()
    console.log('Session (from getSession()):', session)

    // Check cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key.startsWith('tana_')) {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, string>)
    console.log('Cookies (tana_*):', cookies)

    // Check if expired
    if (session?.expiresAt) {
      const expiryDate = new Date(session.expiresAt)
      const now = new Date()
      const isExpired = expiryDate < now
      console.log('Token expiry:', {
        expiresAt: expiryDate.toISOString(),
        now: now.toISOString(),
        isExpired,
        minutesUntilExpiry: isExpired ? 'EXPIRED' : Math.round((expiryDate.getTime() - now.getTime()) / 1000 / 60),
      })
    }
  },

  /**
   * Clear only localStorage
   */
  clearLocalStorage() {
    console.log('%c[TANA_DEBUG] Clearing localStorage only...', 'color: #ffd93d; font-weight: bold')
    localStorage.removeItem('tana_session_token')
    localStorage.removeItem('tana_user_id')
    localStorage.removeItem('tana_username')
    localStorage.removeItem('tana_token_expiry')
    console.log('%c[TANA_DEBUG] localStorage cleared', 'color: #ffd93d; font-weight: bold')
  },

  /**
   * Clear only cookies
   */
  async clearCookies() {
    console.log('%c[TANA_DEBUG] Clearing cookies only...', 'color: #ffd93d; font-weight: bold')
    try {
      await fetch('/api/auth/session', { method: 'DELETE' })
      console.log('%c[TANA_DEBUG] Cookies cleared', 'color: #ffd93d; font-weight: bold')
    } catch (err) {
      console.error('[TANA_DEBUG] Failed to clear cookies:', err)
    }
  },

  /**
   * Help text
   */
  help() {
    console.log('%c[TANA_DEBUG] Available Commands:', 'color: #4ecdc4; font-weight: bold')
    console.log(`
Available debug commands:

  tanaDebug.showAuthState()     - Show current authentication state
  tanaDebug.clearAuth()          - Clear all auth data (localStorage + cookies) and reload
  tanaDebug.clearLocalStorage()  - Clear only localStorage
  tanaDebug.clearCookies()       - Clear only HTTP-only cookies
  tanaDebug.help()               - Show this help text

Examples:

  // Check why redirect loop is happening
  tanaDebug.showAuthState()

  // Clear everything and start fresh
  tanaDebug.clearAuth()
`)
  },
}

// Make it available globally in development
if (typeof window !== 'undefined') {
  ;(window as any).tanaDebug = tanaDebug

  // Only log once on page load
  if (!(window as any).__tanaDebugLoaded) {
    console.log(
      '%cTana Debug Tools Available',
      'color: #4ecdc4; font-weight: bold; font-size: 14px; background: #1a1a1a; padding: 8px 16px; border-radius: 4px;'
    )
    console.log(
      '%cType "tanaDebug.help()" for available commands',
      'color: #95e1d3; font-size: 12px;'
    )
    ;(window as any).__tanaDebugLoaded = true
  }
}
