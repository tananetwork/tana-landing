/**
 * QR Code display component
 */

'use client'

import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'

interface QRCodeProps {
  value: string
  size?: number
  className?: string
}

export function QRCode({ value, size = 256, className }: QRCodeProps) {
  if (!value) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-slate-900/50 border border-blue-400/20 rounded-lg',
          className
        )}
        style={{ width: size, height: size }}
      >
        <div className="animate-pulse text-blue-300/50 text-sm">
          Generating...
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-white p-4 rounded-lg border-4 border-blue-400/30 shadow-lg shadow-blue-500/20',
        className
      )}
    >
      <QRCodeSVG
        value={value}
        size={size - 32} // Account for padding
        level="H" // High error correction
        includeMargin={false}
        fgColor="#0F172A" // slate-900
        bgColor="#FFFFFF"
      />
    </div>
  )
}
