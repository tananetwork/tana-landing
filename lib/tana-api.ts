/**
 * Tana Blockchain API Client
 *
 * A clean, type-safe client for interacting with Tana services:
 * - Identity Service (http://localhost:8090) - Authentication
 * - Ledger Service (http://localhost:8080) - Users, Balances, Transactions
 */

import type {
  TanaUser,
  TanaBalance,
  TanaCurrency,
  TanaTransaction,
  SessionVerifyResponse,
  TanaApiError,
} from '@/types/tana-api'

// ============================================================================
// CONFIGURATION
// ============================================================================

const IDENTITY_API_URL = process.env.NEXT_PUBLIC_IDENTITY_API_URL || 'http://localhost:8090'
const LEDGER_API_URL = process.env.NEXT_PUBLIC_LEDGER_API_URL || 'http://localhost:8080'

// ============================================================================
// TYPES FOR CLIENT OPTIONS
// ============================================================================

interface FetchOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
  token?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Make an authenticated fetch request
 */
async function fetchApi<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body, token } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',
  }

  if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    requestOptions.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, requestOptions)

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }))
      throw new Error(errorData.error || `Request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unknown error occurred')
  }
}

// ============================================================================
// IDENTITY SERVICE API
// ============================================================================

export const identityApi = {
  /**
   * Verify a session token
   */
  async verifySession(token: string): Promise<SessionVerifyResponse> {
    return fetchApi<SessionVerifyResponse>(
      `${IDENTITY_API_URL}/auth/session/verify`,
      { token }
    )
  },

  /**
   * Check if a token is valid
   */
  async isTokenValid(token: string): Promise<boolean> {
    try {
      const result = await this.verifySession(token)
      return result.valid === true
    } catch {
      return false
    }
  },
}

// ============================================================================
// LEDGER SERVICE - USERS API
// ============================================================================

export const usersApi = {
  /**
   * Get user by ID
   */
  async getUser(userId: string, token?: string): Promise<TanaUser> {
    return fetchApi<TanaUser>(`${LEDGER_API_URL}/users/${userId}`, { token })
  },

  /**
   * Get user by username
   */
  async getUserByUsername(username: string, token?: string): Promise<TanaUser> {
    return fetchApi<TanaUser>(`${LEDGER_API_URL}/users/username/${username}`, { token })
  },

  /**
   * List all users
   */
  async listUsers(limit = 50, offset = 0, token?: string): Promise<TanaUser[]> {
    return fetchApi<TanaUser[]>(
      `${LEDGER_API_URL}/users?limit=${limit}&offset=${offset}`,
      { token }
    )
  },

  /**
   * Get user balances
   */
  async getUserBalances(userId: string, token?: string): Promise<TanaBalance[]> {
    return fetchApi<TanaBalance[]>(`${LEDGER_API_URL}/users/${userId}/balances`, { token })
  },

  /**
   * Get user's current nonce for transaction signing
   */
  async getUserNonce(
    userId: string,
    token?: string
  ): Promise<{ userId: string; username: string; currentNonce: number; nextNonce: number }> {
    return fetchApi(`${LEDGER_API_URL}/users/${userId}/nonce`, { token })
  },
}

// ============================================================================
// LEDGER SERVICE - BALANCES API
// ============================================================================

export const balancesApi = {
  /**
   * Get all balances in the system
   */
  async getAllBalances(token?: string): Promise<TanaBalance[]> {
    return fetchApi<TanaBalance[]>(`${LEDGER_API_URL}/balances`, { token })
  },

  /**
   * Get specific balance
   */
  async getBalance(
    ownerId: string,
    ownerType: 'user' | 'team',
    currencyCode: string,
    token?: string
  ): Promise<TanaBalance> {
    return fetchApi<TanaBalance>(
      `${LEDGER_API_URL}/balances?ownerId=${ownerId}&ownerType=${ownerType}&currencyCode=${currencyCode}`,
      { token }
    )
  },

  /**
   * List all currencies
   */
  async listCurrencies(token?: string): Promise<TanaCurrency[]> {
    return fetchApi<TanaCurrency[]>(`${LEDGER_API_URL}/balances/currencies`, { token })
  },
}

// ============================================================================
// LEDGER SERVICE - TRANSACTIONS API
// ============================================================================

export const transactionsApi = {
  /**
   * Get all transactions
   */
  async getAllTransactions(limit = 100, offset = 0, token?: string): Promise<TanaTransaction[]> {
    return fetchApi<TanaTransaction[]>(
      `${LEDGER_API_URL}/transactions?limit=${limit}&offset=${offset}`,
      { token }
    )
  },

  /**
   * Get transaction by ID
   */
  async getTransaction(txId: string, token?: string): Promise<TanaTransaction> {
    return fetchApi<TanaTransaction>(`${LEDGER_API_URL}/transactions/${txId}`, { token })
  },

  /**
   * Get transactions for a specific account
   */
  async getAccountTransactions(
    accountId: string,
    limit = 50,
    offset = 0,
    token?: string
  ): Promise<TanaTransaction[]> {
    return fetchApi<TanaTransaction[]>(
      `${LEDGER_API_URL}/transactions/account/${accountId}?limit=${limit}&offset=${offset}`,
      { token }
    )
  },

  /**
   * Get pending transactions
   */
  async getPendingTransactions(limit = 100, token?: string): Promise<TanaTransaction[]> {
    return fetchApi<TanaTransaction[]>(
      `${LEDGER_API_URL}/transactions/pending?limit=${limit}`,
      { token }
    )
  },
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get current user data using session token
 */
export async function getCurrentUser(token: string): Promise<{
  session: SessionVerifyResponse
  user: TanaUser
  balances: TanaBalance[]
} | null> {
  try {
    // First, verify the session
    const session = await identityApi.verifySession(token)

    if (!session.valid || !session.userId) {
      return null
    }

    // Get user data from ledger
    const [user, balances] = await Promise.all([
      usersApi.getUser(session.userId, token),
      usersApi.getUserBalances(session.userId, token),
    ])

    return {
      session,
      user,
      balances,
    }
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

/**
 * Get user data with balances
 */
export async function getUserWithBalances(
  userId: string,
  token?: string
): Promise<{ user: TanaUser; balances: TanaBalance[] } | null> {
  try {
    const [user, balances] = await Promise.all([
      usersApi.getUser(userId, token),
      usersApi.getUserBalances(userId, token),
    ])

    return { user, balances }
  } catch (error) {
    console.error('Error fetching user with balances:', error)
    return null
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  identity: identityApi,
  users: usersApi,
  balances: balancesApi,
  transactions: transactionsApi,
  getCurrentUser,
  getUserWithBalances,
}
