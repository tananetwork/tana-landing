/**
 * Feed Card Component
 * Displays different types of activity in the dashboard feed
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  ArrowUpRight,
  ArrowDownLeft,
  User as UserIcon,
  FileCode,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from '@/lib/date-utils'

// ============================================================================
// TYPES
// ============================================================================

export type FeedItemType = 'transaction' | 'user_created' | 'contract_deployed' | 'balance_update'

export interface FeedItem {
  id: string
  type: FeedItemType
  timestamp: string
  title: string
  description: string
  metadata?: Record<string, any>
  user?: {
    id: string
    username: string
    displayName: string
    avatarData?: string | null
  }
  amount?: string
  currencyCode?: string
  direction?: 'incoming' | 'outgoing'
}

// ============================================================================
// COMPONENT
// ============================================================================

interface FeedCardProps {
  item: FeedItem
}

export function FeedCard({ item }: FeedCardProps) {
  const getIcon = () => {
    switch (item.type) {
      case 'transaction':
        return item.direction === 'incoming' ? (
          <ArrowDownLeft className="w-5 h-5 text-green-400" />
        ) : (
          <ArrowUpRight className="w-5 h-5 text-blue-400" />
        )
      case 'user_created':
        return <UserIcon className="w-5 h-5 text-purple-400" />
      case 'contract_deployed':
        return <FileCode className="w-5 h-5 text-orange-400" />
      default:
        return <Clock className="w-5 h-5 text-slate-400" />
    }
  }

  const getCardBorderColor = () => {
    switch (item.type) {
      case 'transaction':
        return item.direction === 'incoming'
          ? 'border-green-400/20'
          : 'border-blue-400/20'
      case 'user_created':
        return 'border-purple-400/20'
      case 'contract_deployed':
        return 'border-orange-400/20'
      default:
        return 'border-slate-400/20'
    }
  }

  const getUserInitials = (username: string, displayName: string) => {
    if (displayName) {
      const names = displayName.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return displayName.substring(0, 2).toUpperCase()
    }
    return username.substring(0, 2).toUpperCase().replace('@', '')
  }

  return (
    <Card className={`bg-slate-900/50 ${getCardBorderColor()} hover:bg-slate-900/70 transition-colors`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            <div className="mt-1">
              {getIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-white text-base mb-1 flex items-center gap-2">
                {item.title}
                {item.amount && item.currencyCode && (
                  <span className={`text-sm font-medium ${
                    item.direction === 'incoming' ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    {item.direction === 'incoming' ? '+' : '-'}{item.amount} {item.currencyCode}
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                {item.description}
              </CardDescription>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-slate-500 ml-2 whitespace-nowrap">
            {formatDistanceToNow(new Date(item.timestamp))}
          </div>
        </div>
      </CardHeader>

      {/* User Info (if present) */}
      {item.user && (
        <>
          <Separator className="bg-slate-700/30" />
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border border-slate-700">
                {item.user.avatarData && (
                  <AvatarImage src={item.user.avatarData} alt={item.user.displayName} />
                )}
                <AvatarFallback className="bg-slate-800 text-slate-300 text-xs">
                  {getUserInitials(item.user.username, item.user.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {item.user.displayName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {item.user.username}
                </p>
              </div>
            </div>
          </CardContent>
        </>
      )}

      {/* Additional Metadata */}
      {item.metadata && Object.keys(item.metadata).length > 0 && (
        <>
          <Separator className="bg-slate-700/30" />
          <CardContent className="pt-3 pb-3">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(item.metadata).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-xs text-slate-500 capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-slate-300 truncate">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}

// ============================================================================
// SKELETON LOADING STATE
// ============================================================================

export function FeedCardSkeleton() {
  return (
    <Card className="bg-slate-900/50 border-slate-400/20">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-slate-700 rounded animate-pulse mt-1" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-slate-700 rounded w-1/2 animate-pulse" />
          </div>
          <div className="h-3 bg-slate-700 rounded w-16 animate-pulse" />
        </div>
      </CardHeader>
    </Card>
  )
}
