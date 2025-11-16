/**
 * Tana Blockchain API Types
 */

// ============================================================================
// USER TYPES
// ============================================================================

export interface TanaUser {
  id: string
  publicKey: string
  username: string
  displayName: string
  bio?: string | null
  avatarData?: string | null
  role: 'sovereign' | 'staff' | 'user'
  nonce: number
  landingPageId?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserPayload {
  publicKey: string
  username: string
  displayName: string
  bio?: string
  avatarData?: string
  role?: 'sovereign' | 'staff' | 'user'
  signature: string
  timestamp: number
  nonce: number
}

export interface UpdateUserPayload {
  displayName?: string
  bio?: string
  avatarData?: string
  landingPageId?: string
  role?: 'sovereign' | 'staff' | 'user'
}

// ============================================================================
// BALANCE TYPES
// ============================================================================

export interface TanaBalance {
  ownerId: string
  ownerType: 'user' | 'team'
  currencyCode: string
  balance: string
  createdAt: string
  updatedAt: string
}

export interface TanaCurrency {
  code: string
  type: 'fiat' | 'crypto'
  decimals: number
  name?: string | null
  symbol?: string | null
  verified: boolean
  createdAt: string
}

// ============================================================================
// SESSION TYPES
// ============================================================================

export interface SessionVerifyResponse {
  valid: boolean
  userId?: string
  username?: string
  publicKey?: string
  expiresAt?: string
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export interface TanaTransaction {
  id: string
  from: string
  to: string
  amount?: string | null
  currencyCode?: string | null
  type: 'transfer' | 'deposit' | 'withdraw' | 'contract_call' | 'user_creation' | 'contract_deployment'
  signature: string
  timestamp?: number | null
  nonce?: number | null
  contractId?: string | null
  contractInput?: Record<string, any> | null
  metadata?: Record<string, any> | null
  status: 'pending' | 'confirmed' | 'failed'
  blockId?: string | null
  confirmedAt?: string | null
  createdAt: string
  updatedAt: string
}

// ============================================================================
// API ERROR TYPES
// ============================================================================

export interface TanaApiError {
  error: string
  details?: string
}
