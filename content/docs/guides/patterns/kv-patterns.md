---
title: "KV Design Patterns"
description: "Advanced patterns and techniques for KV storage"
---

Common patterns and techniques for building sophisticated applications with KV storage.

## Indexing with Prefixes

Use key prefixes to create queryable "indexes" without a separate index system.

```typescript
import { kv } from 'tana/kv'

// Store user data with multiple access patterns
async function createUser(id: string, email: string, username: string) {
  const user = { id, email, username, created: Date.now() }

  // Primary key: user ID
  await kv.put(`user:${id}`, user)

  // Secondary indexes
  await kv.put(`email:${email}`, id)  // Email → ID lookup
  await kv.put(`username:${username}`, id)  // Username → ID lookup

  return user
}

// Lookup by email
async function getUserByEmail(email: string) {
  const userId = await kv.get(`email:${email}`)
  if (!userId) return null

  return await kv.get(`user:${userId}`, { type: 'json' })
}

// List all users
async function listUsers() {
  const result = await kv.list({ prefix: 'user:' })
  const users = []

  for (const key of result.keys) {
    const user = await kv.get(key.name, { type: 'json' })
    users.push(user)
  }

  return users
}
```

## Atomic Counters

Implement counters that increment atomically.

```typescript
import { kv } from 'tana/kv'

async function incrementCounter(name: string): Promise<number> {
  const current = await kv.get(`counter:${name}`, { type: 'json' })
  const newCount = (current?.value || 0) + 1

  await kv.put(`counter:${name}`, {
    value: newCount,
    lastUpdated: Date.now()
  })

  return newCount
}

// Track page views
export async function get(req: Request) {
  const page = req.url
  const views = await incrementCounter(`views:${page}`)

  return { page, views }
}
```

## TTL Simulation

Manually implement time-to-live expiration.

```typescript
import { kv } from 'tana/kv'

async function putWithTTL(key: string, value: any, ttlSeconds: number) {
  const expiresAt = Date.now() + (ttlSeconds * 1000)

  await kv.put(key, {
    value,
    expiresAt
  })
}

async function getWithTTL(key: string) {
  const data = await kv.get(key, { type: 'json' })

  if (!data) return null

  // Check expiration
  if (data.expiresAt && Date.now() > data.expiresAt) {
    await kv.delete(key)  // Clean up expired key
    return null
  }

  return data.value
}

// Cache with 5 minute TTL
await putWithTTL('cache:api:users', users, 300)
```

## Pagination

Implement cursor-based pagination for large datasets.

```typescript
import { kv } from 'tana/kv'

interface PaginatedResult<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

async function paginateUsers(
  cursor: string | null,
  limit: number = 10
): Promise<PaginatedResult<any>> {
  // List with limit + 1 to detect if more items exist
  const result = await kv.list({
    prefix: 'user:',
    limit: limit + 1
  })

  // Fetch actual data
  const items = []
  for (let i = 0; i < Math.min(limit, result.keys.length); i++) {
    const user = await kv.get(result.keys[i].name, { type: 'json' })
    items.push(user)
  }

  // Check if more items exist
  const hasMore = result.keys.length > limit
  const nextCursor = hasMore ? result.keys[limit - 1].name : null

  return { items, nextCursor, hasMore }
}

// Usage
export async function get(req: Request) {
  const cursor = req.query.cursor || null
  const page = await paginateUsers(cursor, 10)

  return page
}
```

## Rate Limiting

Track request rates per user or IP.

```typescript
import { kv } from 'tana/kv'

async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowStart = now - (windowSeconds * 1000)

  // Get request log
  const data = await kv.get(key, { type: 'json' })
  const requests = data?.requests || []

  // Filter to current window
  const recentRequests = requests.filter((ts: number) => ts > windowStart)

  // Check limit
  const allowed = recentRequests.length < maxRequests

  if (allowed) {
    recentRequests.push(now)
    await kv.put(key, { requests: recentRequests })
  }

  return {
    allowed,
    remaining: Math.max(0, maxRequests - recentRequests.length)
  }
}

// Apply rate limit
export async function post(req: Request, body: any) {
  const userId = req.tana.caller?.id

  if (!userId) {
    return { error: 'Login required' }
  }

  const limit = await checkRateLimit(userId, 100, 60)  // 100 req/min

  if (!limit.allowed) {
    return {
      error: 'Rate limit exceeded',
      remaining: limit.remaining
    }
  }

  // Process request...
  return { success: true }
}
```

## Cache Invalidation

Implement cache with manual invalidation.

```typescript
import { kv } from 'tana/kv'

class Cache {
  // Set with version tag
  async set(key: string, value: any, tags: string[] = []) {
    await kv.put(`cache:${key}`, { value, tags, cachedAt: Date.now() })

    // Track keys by tag
    for (const tag of tags) {
      const tagData = await kv.get(`tag:${tag}`, { type: 'json' })
      const keys = tagData?.keys || []

      if (!keys.includes(key)) {
        keys.push(key)
        await kv.put(`tag:${tag}`, { keys })
      }
    }
  }

  // Get from cache
  async get(key: string) {
    const data = await kv.get(`cache:${key}`, { type: 'json' })
    return data?.value || null
  }

  // Invalidate by tag
  async invalidateTag(tag: string) {
    const tagData = await kv.get(`tag:${tag}`, { type: 'json' })
    if (!tagData) return

    // Delete all keys with this tag
    for (const key of tagData.keys) {
      await kv.delete(`cache:${key}`)
    }

    await kv.delete(`tag:${tag}`)
  }
}

const cache = new Cache()

// Cache user data with tag
await cache.set('user:123', userData, ['users', 'user:123'])

// Invalidate all user caches
await cache.invalidateTag('users')
```

## Batch Operations

Efficiently handle multiple KV operations.

```typescript
import { kv } from 'tana/kv'

async function batchGet(keys: string[]) {
  const promises = keys.map(key => kv.get(key, { type: 'json' }))
  return await Promise.all(promises)
}

async function batchPut(entries: Record<string, any>) {
  const promises = Object.entries(entries).map(([key, value]) =>
    kv.put(key, value)
  )
  await Promise.all(promises)
}

async function batchDelete(keys: string[]) {
  const promises = keys.map(key => kv.delete(key))
  await Promise.all(promises)
}

// Usage
export async function post(req: Request, body: any) {
  // Batch create users
  await batchPut({
    'user:1': { name: 'alice' },
    'user:2': { name: 'bob' },
    'user:3': { name: 'charlie' }
  })

  // Batch fetch
  const users = await batchGet(['user:1', 'user:2', 'user:3'])

  return { users }
}
```

## Session Storage

Complete session management implementation.

```typescript
import { kv } from 'tana/kv'
import { randomBytes } from 'crypto'

class SessionStore {
  private ttl = 3600  // 1 hour

  async create(userId: string): Promise<string> {
    const sessionId = randomBytes(32).toString('hex')
    const session = {
      id: sessionId,
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + (this.ttl * 1000)
    }

    await kv.put(`session:${sessionId}`, session)
    await kv.put(`user_session:${userId}`, sessionId)

    return sessionId
  }

  async get(sessionId: string) {
    const session = await kv.get(`session:${sessionId}`, { type: 'json' })

    if (!session) return null

    // Check expiration
    if (Date.now() > session.expiresAt) {
      await this.destroy(sessionId)
      return null
    }

    return session
  }

  async refresh(sessionId: string) {
    const session = await this.get(sessionId)
    if (!session) return false

    session.expiresAt = Date.now() + (this.ttl * 1000)
    await kv.put(`session:${sessionId}`, session)

    return true
  }

  async destroy(sessionId: string) {
    const session = await this.get(sessionId)
    if (session) {
      await kv.delete(`user_session:${session.userId}`)
    }
    await kv.delete(`session:${sessionId}`)
  }

  async getByUserId(userId: string): Promise<string | null> {
    return await kv.get(`user_session:${userId}`)
  }
}
```

## Feature Flags

Dynamic feature flag system.

```typescript
import { kv } from 'tana/kv'

async function setFlag(name: string, enabled: boolean, config: any = {}) {
  await kv.put(`flag:${name}`, {
    enabled,
    config,
    updatedAt: Date.now()
  })
}

async function isEnabled(name: string, context: any = {}): Promise<boolean> {
  const flag = await kv.get(`flag:${name}`, { type: 'json' })

  if (!flag) return false
  if (!flag.enabled) return false

  // Percentage rollout
  if (flag.config.percentage) {
    const hash = hashString(context.userId || '')
    return (hash % 100) < flag.config.percentage
  }

  // User whitelist
  if (flag.config.userIds) {
    return flag.config.userIds.includes(context.userId)
  }

  return true
}

// Usage
export async function get(req: Request) {
  const userId = req.tana.caller?.id

  const newUIEnabled = await isEnabled('new_ui', { userId })

  return {
    features: {
      newUI: newUIEnabled
    }
  }
}
```

## Best Practices

### ✅ Key Naming Conventions

```typescript
// Good: Hierarchical, predictable
'user:123'
'user:123:profile'
'user:123:settings'
'cache:api:users'
'session:abc123'

// Bad: Inconsistent, hard to query
'123_user'
'user_profile_123'
'apiCacheUsers'
```

### ✅ Efficient Listing

```typescript
// Good: Use prefix to limit scope
const users = await kv.list({ prefix: 'user:', limit: 100 })

// Bad: List everything then filter
const all = await kv.list()
const users = all.keys.filter(k => k.name.startsWith('user:'))
```

### ✅ Error Handling

```typescript
// Good: Handle null and errors
try {
  const data = await kv.get('key', { type: 'json' })
  if (!data) {
    return { error: 'Not found' }
  }
  // Use data
} catch (err) {
  return { error: 'Invalid JSON' }
}

// Bad: Assume data exists
const data = await kv.get('key', { type: 'json' })
return { value: data.someField }  // Crashes if null
```

### ✅ Avoid Large Values

```typescript
// Good: Split large objects
await kv.put('user:123:profile', profile)
await kv.put('user:123:preferences', prefs)
await kv.put('user:123:activity', activity)

// Bad: Store everything together
await kv.put('user:123', {
  profile,
  preferences,
  activity,
  history,  // This could grow unbounded
  logs      // This could exceed 25MB limit
})
```

## See Also

- [KV Storage Guide](/guides/kv-storage) - Basic usage
- [KV API Reference](/tana-api/modules/kv) - Complete API documentation
- [Smart Contracts](/guides/smart-contracts) - Contract development
