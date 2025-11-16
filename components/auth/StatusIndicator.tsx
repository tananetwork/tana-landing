/**
 * Status indicator component for authentication states
 */

'use client'

import type { SessionStatus } from '@/types/auth'
import { CheckCircle2, XCircle, Clock, Smartphone, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusIndicatorProps {
  status: SessionStatus | 'loading'
  className?: string
}

const statusConfig = {
  loading: {
    icon: Loader2,
    iconClassName: 'text-blue-400 animate-spin',
    bgClassName: 'bg-blue-400/10',
    title: 'Creating Session',
    description: 'Connecting to authentication server...',
  },
  waiting: {
    icon: Smartphone,
    iconClassName: 'text-blue-400 animate-pulse',
    bgClassName: 'bg-blue-400/10',
    title: 'Waiting for Scan',
    description: 'Open your Tana mobile app and scan the QR code',
  },
  scanned: {
    icon: CheckCircle2,
    iconClassName: 'text-yellow-400',
    bgClassName: 'bg-yellow-400/10',
    title: 'QR Code Scanned',
    description: 'Please approve the login on your mobile device',
  },
  approved: {
    icon: CheckCircle2,
    iconClassName: 'text-green-400 animate-bounce',
    bgClassName: 'bg-green-400/10',
    title: 'Login Approved!',
    description: 'Redirecting to your dashboard...',
  },
  rejected: {
    icon: XCircle,
    iconClassName: 'text-red-400',
    bgClassName: 'bg-red-400/10',
    title: 'Login Rejected',
    description: 'The login was rejected on your mobile device',
  },
  expired: {
    icon: Clock,
    iconClassName: 'text-orange-400',
    bgClassName: 'bg-orange-400/10',
    title: 'Session Expired',
    description: 'This QR code has expired. Please try again.',
  },
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={cn('flex flex-col items-center text-center', className)}>
      <div
        className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300',
          config.bgClassName
        )}
      >
        <Icon className={cn('w-10 h-10', config.iconClassName)} />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{config.title}</h3>
      <p className="text-blue-200/70 text-sm max-w-xs">{config.description}</p>
    </div>
  )
}
