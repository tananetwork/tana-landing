/**
 * QR Code Login Page
 *
 * Provides mobile-first authentication where users scan a QR code
 * with their mobile app (which holds their Ed25519 private keys)
 * and get logged in securely without their private keys ever touching the desktop.
 */

'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QRCode } from '@/components/auth/QRCode'
import { StatusIndicator } from '@/components/auth/StatusIndicator'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useQRAuth } from '@/hooks/useQRAuth'
import { useUser } from '@/context/user-context'
import { RefreshCw, ArrowLeft, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { user, isLoading } = useUser()
  const { status, qrData, error, refresh } = useQRAuth({
    appName: 'Tana',
    returnUrl: '/dashboard',
  })

  // Prevent redirect loops - track if we've already redirected
  const hasRedirectedRef = useRef(false)

  // Redirect if already authenticated (using server-side session check)
  useEffect(() => {
    console.log('[LOGIN] Auth state:', {
      user: user?.username,
      isLoading,
      hasRedirected: hasRedirectedRef.current
    })

    // Don't redirect if we've already redirected once
    if (hasRedirectedRef.current) {
      console.log('[LOGIN] Already redirected, skipping to prevent loop')
      return
    }

    // Only redirect if we're NOT loading and user IS authenticated
    if (!isLoading && user) {
      console.log('[LOGIN] User authenticated, redirecting to dashboard...')
      hasRedirectedRef.current = true
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-200">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    )
  }

  // If authenticated, don't show login UI (will redirect via useEffect)
  if (user) {
    return null
  }

  const isTerminalState = status === 'approved' || status === 'rejected' || status === 'expired'
  const shouldShowQR = status === 'waiting' && qrData && !error

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-950 to-purple-900/20" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Login to Tana
          </h1>
          <p className="text-blue-200/70 text-base">
            Secure, passwordless authentication with your mobile device
          </p>
        </div>

        {/* Main card */}
        <Card className="bg-slate-900/50 border-blue-400/20 backdrop-blur-sm shadow-2xl shadow-blue-500/10">
          <CardContent className="pt-8 pb-8">

            {/* Error state */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Loading state */}
            {status === 'loading' && !error && (
              <div className="py-12">
                <StatusIndicator status="loading" />
              </div>
            )}

            {/* QR Code display */}
            {shouldShowQR && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <QRCode value={qrData} size={280} />
                </div>

                <StatusIndicator status="waiting" />

                <div className="pt-4 border-t border-blue-400/10">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 text-sm text-blue-200/60">
                      <div className="w-6 h-6 rounded-full bg-blue-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-400 font-semibold text-xs">1</span>
                      </div>
                      <p>Open the Tana mobile app on your phone</p>
                    </div>
                    <div className="flex items-start space-x-3 text-sm text-blue-200/60">
                      <div className="w-6 h-6 rounded-full bg-blue-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-400 font-semibold text-xs">2</span>
                      </div>
                      <p>Scan this QR code with your camera</p>
                    </div>
                    <div className="flex items-start space-x-3 text-sm text-blue-200/60">
                      <div className="w-6 h-6 rounded-full bg-blue-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-400 font-semibold text-xs">3</span>
                      </div>
                      <p>Approve the login on your device</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scanned state */}
            {status === 'scanned' && (
              <div className="py-12">
                <StatusIndicator status="scanned" />
              </div>
            )}

            {/* Approved state */}
            {status === 'approved' && (
              <div className="py-12">
                <StatusIndicator status="approved" />
              </div>
            )}

            {/* Rejected state */}
            {status === 'rejected' && (
              <div className="py-12 space-y-6">
                <StatusIndicator status="rejected" />
                <div className="flex justify-center">
                  <Button
                    onClick={refresh}
                    variant="outline"
                    className="border-blue-400/30 text-blue-200 hover:bg-blue-900/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Expired state */}
            {status === 'expired' && (
              <div className="py-12 space-y-6">
                <StatusIndicator status="expired" />
                <div className="flex justify-center">
                  <Button
                    onClick={refresh}
                    variant="outline"
                    className="border-blue-400/30 text-blue-200 hover:bg-blue-900/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate New QR Code
                  </Button>
                </div>
              </div>
            )}

            {/* Error state with retry */}
            {error && status !== 'loading' && (
              <div className="py-6 space-y-6">
                <div className="text-center">
                  <p className="text-red-300 text-sm mb-4">{error}</p>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={refresh}
                    variant="outline"
                    className="border-red-400/30 text-red-200 hover:bg-red-900/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to home link */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-blue-300/70 hover:text-blue-200 hover:bg-blue-900/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Security notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-blue-300/40">
            Your private keys never leave your mobile device. This login method is secure and passwordless.
          </p>
        </div>
      </div>
    </div>
  )
}
