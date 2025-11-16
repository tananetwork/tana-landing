/**
 * User Server Actions
 *
 * Server-side functions for fetching user data using session tokens
 * These run on the server and can securely access cookies
 */

'use server'

import { cookies } from 'next/headers'
import { getCurrentUser, getUserWithBalances } from '@/lib/tana-api'
import type { TanaUser, TanaBalance, SessionVerifyResponse } from '@/types/tana-api'

// ============================================================================
// CONSTANTS
// ============================================================================

const SESSION_COOKIE_NAME = 'tana_session_token'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get session token from cookies
 */
async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get(SESSION_COOKIE_NAME)
  return tokenCookie?.value || null
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

export interface UserData {
  session: SessionVerifyResponse
  user: TanaUser
  balances: TanaBalance[]
}

/**
 * Get current authenticated user data
 * Returns user info and balances based on session token in cookies
 */
export async function getCurrentUserData(): Promise<UserData | null> {
  try {
    const token = await getSessionToken()

    if (!token) {
      console.log('No session token found in cookies')
      return null
    }

    const userData = await getCurrentUser(token)

    if (!userData) {
      console.log('Failed to fetch user data or session invalid')
      return null
    }

    return userData
  } catch (error) {
    console.error('Error in getCurrentUserData:', error)
    return null
  }
}

/**
 * Get user data by user ID
 */
export async function getUserData(userId: string): Promise<{ user: TanaUser; balances: TanaBalance[] } | null> {
  try {
    const token = await getSessionToken()
    return await getUserWithBalances(userId, token || undefined)
  } catch (error) {
    console.error('Error in getUserData:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 * Returns true if valid session exists
 */
export async function isUserAuthenticated(): Promise<boolean> {
  try {
    const userData = await getCurrentUserData()
    return userData !== null
  } catch {
    return false
  }
}

/**
 * Set session token in cookie (call this after login)
 */
export async function setSessionToken(token: string, expiresAt?: string): Promise<void> {
  const cookieStore = await cookies()

  const cookieOptions: any = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  }

  // Set expiration if provided
  if (expiresAt) {
    cookieOptions.expires = new Date(expiresAt)
  }

  cookieStore.set(SESSION_COOKIE_NAME, token, cookieOptions)
}

/**
 * Clear session token from cookie (logout)
 */
export async function clearSessionToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
