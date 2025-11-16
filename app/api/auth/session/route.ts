/**
 * Session API Route
 *
 * Handles saving session tokens to HTTP-only cookies
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'tana_session_token'

/**
 * POST /api/auth/session
 * Save session token to HTTP-only cookie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionToken, expiresAt } = body

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      )
    }

    // Set cookie
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
    } else {
      // Default to 7 days
      cookieOptions.maxAge = 7 * 24 * 60 * 60
    }

    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, cookieOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting session cookie:', error)
    return NextResponse.json(
      { error: 'Failed to set session cookie' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/auth/session
 * Clear session token cookie
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing session cookie:', error)
    return NextResponse.json(
      { error: 'Failed to clear session cookie' },
      { status: 500 }
    )
  }
}
