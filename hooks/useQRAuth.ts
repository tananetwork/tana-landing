/**
 * Custom hook for QR code authentication
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { SessionStatus, QRSessionData, SSEStatusUpdate } from '@/types/auth'
import { saveSession, getIdentityApiUrl } from '@/lib/auth'
import { useUser } from '@/context/user-context'

interface UseQRAuthOptions {
  appName?: string
  returnUrl?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseQRAuthReturn {
  status: SessionStatus | 'loading'
  qrData: string
  sessionId: string
  error: string
  refresh: () => void
}

export function useQRAuth(options: UseQRAuthOptions = {}): UseQRAuthReturn {
  const {
    appName = 'Tana',
    returnUrl,
    onSuccess,
    onError,
  } = options

  const router = useRouter()
  const { refreshUser } = useUser()
  const [status, setStatus] = useState<SessionStatus | 'loading'>('loading')
  const [qrData, setQrData] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [error, setError] = useState<string>('')

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)
  const sessionDataRef = useRef<{ sessionId: string; apiUrl: string } | null>(null)

  /**
   * Create a new authentication session
   */
  const initSession = useCallback(async () => {
    try {
      setStatus('loading')
      setError('')

      const apiUrl = getIdentityApiUrl()
      const defaultReturnUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/dashboard`
        : '/dashboard'

      const response = await fetch(`${apiUrl}/auth/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName,
          returnUrl: returnUrl || defaultReturnUrl,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`)
      }

      const data: QRSessionData = await response.json()
      setSessionId(data.sessionId)

      // Build QR code data with deep link format
      // Format: tana://auth?session=xxx&challenge=xxx&server=xxx
      const qrPayload = `tana://auth?${new URLSearchParams({
        session: data.sessionId,
        challenge: data.challenge,
        server: apiUrl,
      }).toString()}`

      setQrData(qrPayload)
      setStatus('waiting')

      // Start polling for status updates
      startPolling(data.sessionId, apiUrl)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session'
      setError(errorMessage)
      console.error('Session creation error:', err)

      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage))
      }
    }
  }, [appName, returnUrl, onError])

  /**
   * Poll session status for updates
   */
  const startPolling = useCallback((sessionId: string, apiUrl: string) => {
    // Clear existing polling if any
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    // Store session data for polling
    sessionDataRef.current = { sessionId, apiUrl }

    console.log('[POLL] Starting polling for session:', sessionId)

    // Poll every second
    const poll = async () => {
      try {
        const response = await fetch(`${apiUrl}/auth/session/${sessionId}`)

        if (!response.ok) {
          console.error('[POLL] Failed to fetch session status:', response.status)
          return
        }

        const data = await response.json()
        console.log('[POLL] Session data:', data)

        const newStatus = data.status as SessionStatus

        // Update status if it changed
        if (newStatus !== status) {
          console.log('[POLL] Status changed from', status, 'to', newStatus)
          setStatus(newStatus)

          // Handle terminal states
          if (newStatus === 'approved') {
            console.log('[POLL] Approval detected!')

            // Stop polling
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }

            // The session data should include the token now
            if (data.sessionToken && data.userId && data.username) {
              console.log('[QR_AUTH] Login approved, saving session...')

              saveSession({
                sessionToken: data.sessionToken,
                userId: data.userId,
                username: data.username,
              })

              // Also save to HTTP-only cookie via API route
              fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionToken: data.sessionToken,
                  expiresAt: data.approvedAt
                    ? new Date(new Date(data.approvedAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    : undefined,
                }),
              })
                .then(() => {
                  console.log('[QR_AUTH] Session cookie saved, refreshing user context...')
                  return refreshUser()
                })
                .then(() => {
                  console.log('[QR_AUTH] User context refreshed')
                })
                .catch(console.error)

              // Redirect after a brief delay to show success state
              setTimeout(() => {
                if (onSuccess) {
                  onSuccess()
                } else {
                  console.log('[QR_AUTH] Redirecting to:', returnUrl || '/dashboard')
                  router.push(returnUrl || '/dashboard')
                }
              }, 1500)
            } else {
              console.error('[POLL] Approved but missing session data:', data)
            }
          } else if (newStatus === 'rejected' || newStatus === 'expired') {
            console.log('[POLL] Terminal state reached, stopping polling')

            // Stop polling
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
          }
        }
      } catch (err) {
        console.error('[POLL] Error polling session:', err)
      }
    }

    // Poll immediately and then every second
    poll()
    pollingIntervalRef.current = setInterval(poll, 1000)
  }, [status, router, returnUrl, onSuccess, refreshUser])

  /**
   * Refresh/retry session creation
   */
  const refresh = useCallback(() => {
    initSession()
  }, [initSession])

  /**
   * Initialize on mount
   */
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      initSession()
    }

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [initSession])

  return {
    status,
    qrData,
    sessionId,
    error,
    refresh,
  }
}
