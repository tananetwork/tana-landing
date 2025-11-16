---
title: Smart Contracts
description: Learn to write TypeScript smart contracts for Tana
sidebar:
  order: 3
---

Tana smart contracts are TypeScript files that export up to 4 functions: `init()`, `contract()`, `get()`, and `post()`. All functions must return JSON-serializable data.

## Quick Start

### 1. Create a Contract

Create a single TypeScript file with your contract logic:

```typescript
// mycontract.ts
import type { Request, JsonValue } from 'tana/net'
import { context } from 'tana/context'
import { console } from 'tana/core'
import { data } from 'tana/data'

export function init(): JsonValue {
  console.log('Contract initialized')
  data.set('deployed_at', Date.now().toString())

  return { initialized: true }
}

export function contract(): JsonValue {
  const caller = context.caller()
  const owner = context.owner()

  if (!caller || caller.id !== owner.id) {
    return { error: 'Unauthorized' }
  }

  return { success: true, caller: caller.username }
}

export function get(req: Request): JsonValue {
  const caller = req.tana.caller

  return {
    message: 'Hello from Tana!',
    caller: caller?.username || 'anonymous',
    timestamp: Date.now()
  }
}

export function post(req: Request): JsonValue {
  if (!req.tana.caller) {
    return { error: 'Authentication required' }
  }

  return {
    success: true,
    received: req.body
  }
}
```

### 2. Deploy to Blockchain

```bash
tana deploy contract mycontract.ts
```

### 3. Call Your Contract

**HTTP Requests (get/post):**
```bash
# GET request
curl http://localhost:8180/mycontract

# POST request
curl -X POST http://localhost:8180/mycontract \
  -H "Content-Type: application/json" \
  -d '{"data":"test"}'
```

**On-Chain Execution (contract):**
```bash
# Via transaction (coming soon via CLI)
tana call contract mycontract
```

## Contract Structure

Every contract exports up to 4 functions. Only `contract()` is required.

### init() - Optional
Runs **once** when the contract is deployed to the blockchain.

**Use for:**
- Setting initial state
- Storing deployment metadata
- One-time configuration

```typescript
export function init(): JsonValue {
  const owner = context.owner()
  const block = context.block()

  // Store deployment info
  data.set('owner_id', owner.id)
  data.set('deployed_at', block.timestamp.toString())

  return {
    initialized: true,
    owner: owner.username,
    block: block.height
  }
}
```

**Context Available:**
- `context.owner()` - Contract owner (same as deployer)
- `context.block()` - Deployment block info
- `context.caller()` - Returns null (no caller in init)
- `context.input()` - Returns null (no input in init)

### contract() - Required
Runs on-chain via blockchain transactions.

**Use for:**
- State-changing operations
- Authorization checks
- Business logic that needs consensus

```typescript
export function contract(): JsonValue {
  const caller = context.caller()
  const owner = context.owner()
  const input = context.input()

  // Authorization
  if (!caller || caller.id !== owner.id) {
    return { error: 'Unauthorized: owner only' }
  }

  // Business logic
  const count = parseInt(data.get('count') || '0')
  data.set('count', (count + 1).toString())

  return {
    success: true,
    count: count + 1,
    caller: caller.username,
    input
  }
}
```

**Context Available:**
- `context.owner()` - Contract owner
- `context.caller()` - Transaction sender
- `context.block()` - Current block info
- `context.input()` - Contract call parameters

### get() - Optional
Handles HTTP GET requests via tana-edge.

**Use for:**
- Reading contract state
- Public APIs
- Query endpoints

```typescript
export function get(req: Request): JsonValue {
  // Parse query parameters
  const url = new URL(req.url)
  const name = url.searchParams.get('name')

  // Access Tana context
  const caller = req.tana.caller
  const owner = req.tana.contract.owner

  // Read state
  const count = data.get('count') || '0'

  return {
    message: name ? `Hello, ${name}!` : 'Hello!',
    count: parseInt(count),
    caller: caller?.username || 'anonymous',
    isOwner: caller?.id === owner.id
  }
}
```

**Request Object:**
- `req.url` - Full URL
- `req.method` - HTTP method
- `req.headers` - Request headers
- `req.tana.caller` - Authenticated user (or null)
- `req.tana.contract` - Contract metadata
- `req.tana.session` - Session info (or null)

### post() - Optional
Handles HTTP POST requests via tana-edge.

**Use for:**
- Creating resources
- Submitting data
- Authenticated actions

```typescript
export function post(req: Request): JsonValue {
  const caller = req.tana.caller

  // Require authentication
  if (!caller) {
    return { error: 'Login required' }
  }

  // Only owner can post
  const owner = req.tana.contract.owner
  if (caller.id !== owner.id) {
    return { error: 'Unauthorized: owner only' }
  }

  // Process body
  const body = req.body as any

  // Update state
  data.set('last_post', JSON.stringify(body))

  return {
    success: true,
    received: body,
    caller: caller.username
  }
}
```

**Request Object:**
Same as `get()`, plus:
- `req.body` - Parsed JSON body

## JSON-Only Returns

**All functions MUST return JSON-serializable data.** This is enforced for security and simplicity.

```typescript
// ✅ Valid JSON returns
return { success: true }
return { items: [1, 2, 3], count: 3 }
return { user: { name: 'Alice', age: 30 } }
return { value: null }  // null is valid

// ❌ Invalid (will cause errors)
return { fn: () => {} }  // Functions not allowed
return { undef: undefined }  // undefined not allowed
return { date: new Date() }  // Objects must be plain
return undefined  // Use null instead
```

## Available Modules

### tana/net - HTTP APIs
```typescript
import type { Request, JsonValue } from 'tana/net'

// Type definitions for HTTP functions
```

### tana/context - On-Chain Context
```typescript
import { context } from 'tana/context'

const owner = context.owner()      // Contract owner
const caller = context.caller()    // Transaction sender
const block = context.block()      // Block info
const input = context.input()      // Call parameters
```

### tana/core - Console Logging
```typescript
import { console } from 'tana/core'

console.log('Message')  // Appears in logs
```

### tana/kv - Cloudflare Workers KV Storage
```typescript
import { kv } from 'tana/kv'

await kv.put('username', 'alice')
const name = await kv.get('username')

// JSON support
await kv.put('user', { id: 1, balance: 100 })
const user = await kv.get('user', { type: 'json' })

// List and delete
const keys = await kv.list({ prefix: 'user:' })
await kv.delete('username')
```

See [KV Storage Guide](/guides/kv-storage) for complete documentation.

### tana/utils - External HTTP (Coming Soon)
```typescript
import { fetch } from 'tana/utils'

const response = await fetch('https://api.example.com')
const json = await response.json()
```

## Validation with Zod

Use Zod for type-safe input validation:

```typescript
import { z } from 'zod'

const UserSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().int().min(13)
})

export function contract(): JsonValue {
  const input = context.input()

  // Validate input
  const validation = UserSchema.safeParse(input)

  if (!validation.success) {
    return {
      error: 'Invalid input',
      details: validation.error.flatten()
    }
  }

  // Use validated data
  const user = validation.data

  return {
    success: true,
    user
  }
}
```

## Authorization Patterns

### Owner-Only Contract
```typescript
export function contract(): JsonValue {
  const caller = context.caller()
  const owner = context.owner()

  if (!caller || caller.id !== owner.id) {
    return { error: 'Unauthorized' }
  }

  // Owner-only logic
  return { success: true }
}
```

### Authenticated HTTP
```typescript
export function post(req: Request): JsonValue {
  if (!req.tana.caller) {
    return { error: 'Login required' }
  }

  // Authenticated logic
  return { success: true }
}
```

### Public Read, Private Write
```typescript
export function get(req: Request): JsonValue {
  // Anyone can read
  return { data: data.get('public_data') }
}

export function post(req: Request): JsonValue {
  const caller = req.tana.caller
  const owner = req.tana.contract.owner

  // Only owner can write
  if (!caller || caller.id !== owner.id) {
    return { error: 'Unauthorized' }
  }

  data.set('public_data', req.body.data)
  return { success: true }
}
```

## Example Contracts

### Hello World
Basic contract with all 4 functions:

```bash
# View source
cat contracts/examples/hello-world.ts

# Deploy
tana deploy contract contracts/examples/hello-world.ts
```

### User Registry
Advanced contract with Zod validation:

```bash
# View source
cat contracts/examples/user-registry.ts

# Deploy
tana deploy contract contracts/examples/user-registry.ts
```

## Best Practices

### ✅ Do

- **Validate all input** - Use Zod schemas
- **Return JSON only** - No undefined, functions, or complex objects
- **Check authorization** - Verify caller permissions
- **Handle errors gracefully** - Return error objects with messages
- **Use storage wisely** - data.get/set for persistence
- **Log important events** - console.log() for debugging

### ❌ Don't

- **Don't return undefined** - Use null instead
- **Don't assume caller exists** - Always check for null
- **Don't hardcode IDs** - Use context/req.tana for dynamic values
- **Don't skip validation** - Always validate untrusted input
- **Don't expose secrets** - Never log or return sensitive data

## Testing Locally

```bash
# 1. Start local chain
tana start

# 2. Deploy contract
tana deploy contract mycontract.ts

# 3. Test HTTP endpoints
curl http://localhost:8180/mycontract
curl -X POST http://localhost:8180/mycontract -d '{"test":"data"}'

# 4. View logs
# Contract console.log() appears in block producer logs
```

## Deployment Flow

1. **Write contract** - Single TypeScript file with exports
2. **CLI validates** - Checks for required exports, validates structure
3. **CLI extracts** - Separates init/contract/get/post functions
4. **CLI signs** - Creates signed transaction with Ed25519
5. **Ledger stores** - Saves to PostgreSQL with all extracted functions
6. **Block producer** - Executes init() on deployment
7. **Filesystem write** - Writes get.ts/post.ts for tana-edge
8. **Ready** - Contract available for execution

## Security

### Sandboxed Execution
- No filesystem access
- Limited network access (whitelisted only)
- No system calls
- Memory limits enforced
- Gas metering (coming soon)

### Transaction Signing
- All deployments require Ed25519 signatures
- Owner tracked in database
- Replay protection via nonces
- Timestamp validation

### JSON Enforcement
- Runtime validates all returns are JSON
- Prevents serialization bugs
- Easy to audit and inspect
- Consistent API surface

## Next Steps

- [Transaction Signing](/guides/transaction-signing/) - How signatures work
- [API Reference](/tana-api/contracts/) - Contract API endpoints
- [CLI Commands](/tana-cli/commands/) - Deploy and manage contracts
- [Example Contracts](/contracts/examples/README.md) - More examples
