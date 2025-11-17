#!/usr/bin/env bun
/**
 * Generate comprehensive smart contract examples for the developers page
 * Creates production-quality examples across multiple categories
 */

import fs from 'fs'
import path from 'path'

interface CodeExample {
  id: string
  title: string
  description: string
  code: string
  result: any
  category: string
}

const examples: CodeExample[] = [
  // ===== BASIC =====
  {
    id: 'hello-world',
    title: 'Hello World',
    description: 'Basic smart contract that stores and retrieves a greeting message',
    category: 'Basic',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  await kv.put('greeting', 'Hello, Tana!')
  return { initialized: true }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()

  if (!input.greeting) {
    throw new Error('Greeting required')
  }

  await kv.put('greeting', input.greeting)
  await kv.put('lastUpdatedBy', caller.id)

  return { success: true, greeting: input.greeting }
}

export async function get(req: Request) {
  const greeting = await kv.get('greeting')
  const lastUpdatedBy = await kv.get('lastUpdatedBy')

  return { greeting, lastUpdatedBy }
}`,
    result: { greeting: 'Hello, Tana!', lastUpdatedBy: 'usr_abc123' },
  },

  {
    id: 'counter',
    title: 'Counter',
    description: 'Simple counter that can be incremented and decremented',
    category: 'Basic',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  await kv.put('count', '0')
  return { initialized: true, count: 0 }
}

export async function contract() {
  const input = context.input()
  const count = parseInt(await kv.get('count') || '0')

  let newCount = count

  if (input.action === 'increment') {
    newCount = count + (input.amount || 1)
  } else if (input.action === 'decrement') {
    newCount = count - (input.amount || 1)
  } else if (input.action === 'reset') {
    newCount = 0
  }

  await kv.put('count', String(newCount))

  return {
    success: true,
    action: input.action,
    previousCount: count,
    currentCount: newCount
  }
}

export async function get(req: Request) {
  const count = parseInt(await kv.get('count') || '0')
  return { count }
}`,
    result: { success: true, action: 'increment', previousCount: 5, currentCount: 6 },
  },

  {
    id: 'key-value-store',
    title: 'Key-Value Store',
    description: 'Generic key-value storage with permissions',
    category: 'Basic',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  const owner = context.owner()
  await kv.put('_owner', owner.id)
  return { initialized: true, owner: owner.username }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()
  const owner = await kv.get('_owner')

  // Only owner can write
  if (caller.id !== owner) {
    throw new Error('Unauthorized')
  }

  if (input.action === 'set') {
    await kv.put(input.key, input.value)
    return { success: true, key: input.key, value: input.value }
  }

  if (input.action === 'delete') {
    await kv.delete(input.key)
    return { success: true, deleted: input.key }
  }
}

export async function get(req: Request) {
  const url = new URL(req.url)
  const key = url.searchParams.get('key')

  if (!key) {
    // List all keys
    const list = await kv.list()
    return { keys: list.keys.filter(k => !k.name.startsWith('_')) }
  }

  const value = await kv.get(key)
  return { key, value }
}`,
    result: { success: true, key: 'config', value: 'enabled' },
  },

  // ===== FINANCE =====
  {
    id: 'token-system',
    title: 'Token System',
    description: 'Full-featured token with minting, transfers, and allowances',
    category: 'Finance',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  const owner = context.owner()
  const input = context.input()

  await kv.put('name', input.name || 'MyToken')
  await kv.put('symbol', input.symbol || 'MTK')
  await kv.put('totalSupply', '0')
  await kv.put('owner', owner.id)

  return { initialized: true, name: input.name, symbol: input.symbol }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()

  if (input.action === 'mint') {
    const owner = await kv.get('owner')
    if (caller.id !== owner) throw new Error('Only owner can mint')

    const balance = parseInt(await kv.get(\`balance:\${input.to}\`) || '0')
    const totalSupply = parseInt(await kv.get('totalSupply') || '0')

    await kv.put(\`balance:\${input.to}\`, String(balance + input.amount))
    await kv.put('totalSupply', String(totalSupply + input.amount))

    return { success: true, minted: input.amount, to: input.to }
  }

  if (input.action === 'transfer') {
    const fromBalance = parseInt(await kv.get(\`balance:\${caller.id}\`) || '0')
    const toBalance = parseInt(await kv.get(\`balance:\${input.to}\`) || '0')

    if (fromBalance < input.amount) throw new Error('Insufficient balance')

    await kv.put(\`balance:\${caller.id}\`, String(fromBalance - input.amount))
    await kv.put(\`balance:\${input.to}\`, String(toBalance + input.amount))

    return { success: true, from: caller.id, to: input.to, amount: input.amount }
  }
}

export async function get(req: Request) {
  const url = new URL(req.url)
  const address = url.searchParams.get('address')

  if (!address) {
    return {
      name: await kv.get('name'),
      symbol: await kv.get('symbol'),
      totalSupply: await kv.get('totalSupply')
    }
  }

  const balance = await kv.get(\`balance:\${address}\`) || '0'
  return { address, balance: parseInt(balance) }
}`,
    result: { success: true, from: 'usr_alice', to: 'usr_bob', amount: 100 },
  },

  {
    id: 'escrow',
    title: 'Escrow Contract',
    description: 'Hold funds until conditions are met with arbiter',
    category: 'Finance',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  const input = context.input()
  const owner = context.owner()

  await kv.put('buyer', input.buyer)
  await kv.put('seller', input.seller)
  await kv.put('amount', input.amount)
  await kv.put('status', 'pending')
  await kv.put('arbiter', owner.id)

  return { initialized: true, buyer: input.buyer, seller: input.seller }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()

  const buyer = await kv.get('buyer')
  const seller = await kv.get('seller')
  const arbiter = await kv.get('arbiter')
  const status = await kv.get('status')

  if (status !== 'pending') {
    throw new Error('Escrow already completed')
  }

  if (input.action === 'release' && caller.id === arbiter) {
    await kv.put('status', 'released')
    return { success: true, action: 'released', to: seller }
  }

  if (input.action === 'refund' && caller.id === arbiter) {
    await kv.put('status', 'refunded')
    return { success: true, action: 'refunded', to: buyer }
  }

  throw new Error('Unauthorized or invalid action')
}

export async function get(req: Request) {
  return {
    buyer: await kv.get('buyer'),
    seller: await kv.get('seller'),
    amount: await kv.get('amount'),
    status: await kv.get('status'),
    arbiter: await kv.get('arbiter')
  }
}`,
    result: { success: true, action: 'released', to: 'usr_seller123' },
  },

  {
    id: 'crowdfunding',
    title: 'Crowdfunding Campaign',
    description: 'Raise funds with goal and deadline',
    category: 'Finance',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  const input = context.input()
  const owner = context.owner()

  await kv.put('creator', owner.id)
  await kv.put('goal', input.goal)
  await kv.put('deadline', input.deadline)
  await kv.put('raised', '0')
  await kv.put('status', 'active')

  return { initialized: true, goal: input.goal, deadline: input.deadline }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()
  const now = Date.now()

  const deadline = parseInt(await kv.get('deadline'))
  const status = await kv.get('status')

  if (input.action === 'contribute') {
    if (now > deadline || status !== 'active') {
      throw new Error('Campaign ended')
    }

    const raised = parseInt(await kv.get('raised') || '0')
    const userContribution = parseInt(await kv.get(\`contribution:\${caller.id}\`) || '0')

    await kv.put('raised', String(raised + input.amount))
    await kv.put(\`contribution:\${caller.id}\`, String(userContribution + input.amount))

    return { success: true, contributed: input.amount, totalRaised: raised + input.amount }
  }

  if (input.action === 'finalize') {
    const creator = await kv.get('creator')
    if (caller.id !== creator) throw new Error('Only creator can finalize')

    const raised = parseInt(await kv.get('raised'))
    const goal = parseInt(await kv.get('goal'))

    if (raised >= goal) {
      await kv.put('status', 'successful')
      return { success: true, status: 'successful', raised }
    } else {
      await kv.put('status', 'failed')
      return { success: true, status: 'failed', raised }
    }
  }
}

export async function get(req: Request) {
  return {
    goal: await kv.get('goal'),
    raised: await kv.get('raised'),
    deadline: await kv.get('deadline'),
    status: await kv.get('status'),
    creator: await kv.get('creator')
  }
}`,
    result: { success: true, contributed: 50, totalRaised: 450 },
  },

  // ===== GOVERNANCE =====
  {
    id: 'voting-poll',
    title: 'Voting Poll',
    description: 'Create polls and vote on multiple options',
    category: 'Governance',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  const input = context.input()

  await kv.put('question', input.question)
  await kv.put('options', JSON.stringify(input.options))
  await kv.put('votes', JSON.stringify({}))
  await kv.put('endTime', input.endTime || String(Date.now() + 86400000))

  return { initialized: true, question: input.question, options: input.options }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()

  const endTime = parseInt(await kv.get('endTime'))
  if (Date.now() > endTime) {
    throw new Error('Poll ended')
  }

  const votes = JSON.parse(await kv.get('votes') || '{}')

  if (votes[caller.id]) {
    throw new Error('Already voted')
  }

  votes[caller.id] = input.option
  await kv.put('votes', JSON.stringify(votes))

  return { success: true, voted: input.option, totalVotes: Object.keys(votes).length }
}

export async function get(req: Request) {
  const question = await kv.get('question')
  const options = JSON.parse(await kv.get('options') || '[]')
  const votes = JSON.parse(await kv.get('votes') || '{}')
  const endTime = await kv.get('endTime')

  const results: Record<string, number> = {}
  for (const vote of Object.values(votes)) {
    results[vote as string] = (results[vote as string] || 0) + 1
  }

  return {
    question,
    options,
    results,
    totalVotes: Object.keys(votes).length,
    endTime: parseInt(endTime),
    hasEnded: Date.now() > parseInt(endTime)
  }
}`,
    result: { success: true, voted: 'Option A', totalVotes: 15 },
  },

  {
    id: 'dao-governance',
    title: 'DAO Governance',
    description: 'Token-weighted voting for DAOs',
    category: 'Governance',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import { block } from 'tana/block'
import type { Request } from 'tana/net'

export async function init() {
  const input = context.input()
  await kv.put('proposalCount', '0')
  await kv.put('quorum', input.quorum || '1000')
  return { initialized: true }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()

  if (input.action === 'propose') {
    const count = parseInt(await kv.get('proposalCount') || '0')
    const proposalId = \`prop_\${count + 1}\`

    await kv.put(proposalId, JSON.stringify({
      title: input.title,
      description: input.description,
      proposer: caller.id,
      created: Date.now(),
      votes: { for: 0, against: 0 },
      status: 'active'
    }))

    await kv.put('proposalCount', String(count + 1))
    return { success: true, proposalId }
  }

  if (input.action === 'vote') {
    const proposal = JSON.parse(await kv.get(input.proposalId))
    if (proposal.status !== 'active') throw new Error('Proposal not active')

    // Check if already voted
    const voteKey = \`vote:\${input.proposalId}:\${caller.id}\`
    if (await kv.get(voteKey)) throw new Error('Already voted')

    // Get voter's token balance (simplified)
    const balance = await block.getBalance(caller.id, 'GOV')
    const weight = balance?.amount || 1

    if (input.vote === 'for') {
      proposal.votes.for += weight
    } else {
      proposal.votes.against += weight
    }

    await kv.put(input.proposalId, JSON.stringify(proposal))
    await kv.put(voteKey, input.vote)

    return { success: true, voted: input.vote, weight }
  }
}

export async function get(req: Request) {
  const url = new URL(req.url)
  const proposalId = url.searchParams.get('id')

  if (proposalId) {
    const proposal = await kv.get(proposalId)
    return proposal ? JSON.parse(proposal) : null
  }

  const count = await kv.get('proposalCount') || '0'
  return { proposalCount: parseInt(count) }
}`,
    result: { success: true, voted: 'for', weight: 100 },
  },

  // ===== IDENTITY =====
  {
    id: 'user-registry',
    title: 'User Registry',
    description: 'Register users with profile information',
    category: 'Identity',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  await kv.put('userCount', '0')
  return { initialized: true }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()

  const existing = await kv.get(\`user:\${caller.id}\`)
  if (existing) {
    throw new Error('Already registered')
  }

  if (!input.username || !input.bio) {
    throw new Error('Username and bio required')
  }

  const profile = {
    username: input.username,
    bio: input.bio,
    joinedAt: Date.now()
  }

  await kv.put(\`user:\${caller.id}\`, JSON.stringify(profile))

  const count = parseInt(await kv.get('userCount') || '0')
  await kv.put('userCount', String(count + 1))

  return { success: true, profile }
}

export async function get(req: Request) {
  const userId = req.tana.caller?.id
  if (!userId) {
    return { error: 'Authentication required' }
  }

  const profile = await kv.get(\`user:\${userId}\`)
  const userCount = await kv.get('userCount')

  return {
    profile: profile ? JSON.parse(profile) : null,
    totalUsers: parseInt(userCount || '0')
  }
}`,
    result: { success: true, profile: { username: 'alice', bio: 'Developer', joinedAt: 1699564800000 } },
  },

  {
    id: 'reputation-system',
    title: 'Reputation System',
    description: 'Track user reputation with endorsements',
    category: 'Identity',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  return { initialized: true }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()

  if (input.action === 'endorse') {
    const target = input.userId
    const endorseKey = \`endorse:\${caller.id}:\${target}\`

    if (await kv.get(endorseKey)) {
      throw new Error('Already endorsed this user')
    }

    const score = parseInt(await kv.get(\`reputation:\${target}\`) || '0')
    await kv.put(\`reputation:\${target}\`, String(score + input.points))
    await kv.put(endorseKey, 'true')

    return { success: true, userId: target, newScore: score + input.points }
  }

  if (input.action === 'badge') {
    const badges = JSON.parse(await kv.get(\`badges:\${input.userId}\`) || '[]')
    badges.push({
      name: input.badge,
      issuedBy: caller.id,
      issuedAt: Date.now()
    })
    await kv.put(\`badges:\${input.userId}\`, JSON.stringify(badges))

    return { success: true, badge: input.badge, userId: input.userId }
  }
}

export async function get(req: Request) {
  const url = new URL(req.url)
  const userId = url.searchParams.get('userId')

  if (!userId) {
    return { error: 'userId required' }
  }

  const reputation = parseInt(await kv.get(\`reputation:\${userId}\`) || '0')
  const badges = JSON.parse(await kv.get(\`badges:\${userId}\`) || '[]')

  return { userId, reputation, badges }
}`,
    result: { success: true, userId: 'usr_alice', newScore: 150 },
  },

  // ===== GAMING =====
  {
    id: 'leaderboard',
    title: 'Leaderboard',
    description: 'Track high scores and rankings',
    category: 'Gaming',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  await kv.put('scores', JSON.stringify([]))
  return { initialized: true }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()

  const scores = JSON.parse(await kv.get('scores') || '[]')

  const entry = {
    userId: caller.id,
    username: caller.username,
    score: input.score,
    timestamp: Date.now()
  }

  scores.push(entry)
  scores.sort((a, b) => b.score - a.score)

  // Keep top 100
  const top100 = scores.slice(0, 100)
  await kv.put('scores', JSON.stringify(top100))

  const rank = top100.findIndex(s => s.userId === caller.id && s.score === input.score) + 1

  return {
    success: true,
    score: input.score,
    rank,
    isTopScore: rank === 1
  }
}

export async function get(req: Request) {
  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '10')

  const scores = JSON.parse(await kv.get('scores') || '[]')

  return {
    topScores: scores.slice(0, limit),
    totalEntries: scores.length
  }
}`,
    result: { success: true, score: 9500, rank: 3, isTopScore: false },
  },

  {
    id: 'nft-marketplace',
    title: 'NFT Marketplace',
    description: 'List and trade digital items',
    category: 'Marketplace',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  await kv.put('listingCount', '0')
  return { initialized: true }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()

  if (input.action === 'list') {
    const count = parseInt(await kv.get('listingCount') || '0')
    const listingId = \`listing_\${count + 1}\`

    await kv.put(listingId, JSON.stringify({
      id: listingId,
      seller: caller.id,
      itemId: input.itemId,
      price: input.price,
      status: 'active',
      listedAt: Date.now()
    }))

    await kv.put('listingCount', String(count + 1))
    return { success: true, listingId }
  }

  if (input.action === 'buy') {
    const listing = JSON.parse(await kv.get(input.listingId))

    if (!listing || listing.status !== 'active') {
      throw new Error('Listing not available')
    }

    if (listing.seller === caller.id) {
      throw new Error('Cannot buy your own listing')
    }

    listing.status = 'sold'
    listing.buyer = caller.id
    listing.soldAt = Date.now()

    await kv.put(input.listingId, JSON.stringify(listing))
    await kv.put(\`owner:\${listing.itemId}\`, caller.id)

    return { success: true, itemId: listing.itemId, price: listing.price }
  }
}

export async function get(req: Request) {
  const url = new URL(req.url)
  const listingId = url.searchParams.get('id')

  if (listingId) {
    const listing = await kv.get(listingId)
    return listing ? JSON.parse(listing) : null
  }

  const count = await kv.get('listingCount') || '0'
  return { listingCount: parseInt(count) }
}`,
    result: { success: true, itemId: 'nft_12345', price: 100 },
  },

  // ===== SOCIAL =====
  {
    id: 'message-board',
    title: 'Message Board',
    description: 'Post and read messages publicly',
    category: 'Social',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  await kv.put('messageCount', '0')
  return { initialized: true }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()

  const count = parseInt(await kv.get('messageCount') || '0')
  const messageId = \`msg_\${count + 1}\`

  await kv.put(messageId, JSON.stringify({
    id: messageId,
    author: caller.id,
    username: caller.username,
    content: input.message,
    timestamp: Date.now()
  }))

  await kv.put('messageCount', String(count + 1))

  return { success: true, messageId, count: count + 1 }
}

export async function get(req: Request) {
  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const count = parseInt(await kv.get('messageCount') || '0')

  const messages = []
  for (let i = Math.max(1, count - limit + 1); i <= count; i++) {
    const msg = await kv.get(\`msg_\${i}\`)
    if (msg) messages.push(JSON.parse(msg))
  }

  return {
    messages: messages.reverse(),
    totalCount: count
  }
}`,
    result: { success: true, messageId: 'msg_42', count: 42 },
  },

  {
    id: 'social-graph',
    title: 'Social Graph',
    description: 'Follow and unfollow users, build social connections',
    category: 'Social',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  return { initialized: true }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()

  if (input.action === 'follow') {
    const following = JSON.parse(await kv.get(\`following:\${caller.id}\`) || '[]')
    const followers = JSON.parse(await kv.get(\`followers:\${input.userId}\`) || '[]')

    if (following.includes(input.userId)) {
      throw new Error('Already following')
    }

    following.push(input.userId)
    followers.push(caller.id)

    await kv.put(\`following:\${caller.id}\`, JSON.stringify(following))
    await kv.put(\`followers:\${input.userId}\`, JSON.stringify(followers))

    return { success: true, action: 'followed', userId: input.userId }
  }

  if (input.action === 'unfollow') {
    const following = JSON.parse(await kv.get(\`following:\${caller.id}\`) || '[]')
    const followers = JSON.parse(await kv.get(\`followers:\${input.userId}\`) || '[]')

    const newFollowing = following.filter(id => id !== input.userId)
    const newFollowers = followers.filter(id => id !== caller.id)

    await kv.put(\`following:\${caller.id}\`, JSON.stringify(newFollowing))
    await kv.put(\`followers:\${input.userId}\`, JSON.stringify(newFollowers))

    return { success: true, action: 'unfollowed', userId: input.userId }
  }
}

export async function get(req: Request) {
  const url = new URL(req.url)
  const userId = url.searchParams.get('userId') || req.tana.caller?.id

  if (!userId) {
    return { error: 'userId required' }
  }

  const following = JSON.parse(await kv.get(\`following:\${userId}\`) || '[]')
  const followers = JSON.parse(await kv.get(\`followers:\${userId}\`) || '[]')

  return {
    userId,
    following,
    followers,
    followingCount: following.length,
    followersCount: followers.length
  }
}`,
    result: { success: true, action: 'followed', userId: 'usr_bob' },
  },

  // ===== UTILITY =====
  {
    id: 'timelock',
    title: 'Timelock',
    description: 'Schedule actions to execute after a delay',
    category: 'Security',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  const owner = context.owner()
  await kv.put('owner', owner.id)
  await kv.put('lockCount', '0')
  return { initialized: true }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()
  const owner = await kv.get('owner')

  if (caller.id !== owner) {
    throw new Error('Only owner can use timelock')
  }

  if (input.action === 'schedule') {
    const count = parseInt(await kv.get('lockCount') || '0')
    const lockId = \`lock_\${count + 1}\`

    await kv.put(lockId, JSON.stringify({
      id: lockId,
      data: input.data,
      executeAfter: Date.now() + (input.delaySeconds * 1000),
      status: 'pending'
    }))

    await kv.put('lockCount', String(count + 1))
    return { success: true, lockId, executeAfter: Date.now() + (input.delaySeconds * 1000) }
  }

  if (input.action === 'execute') {
    const lock = JSON.parse(await kv.get(input.lockId))

    if (!lock || lock.status !== 'pending') {
      throw new Error('Invalid or already executed')
    }

    if (Date.now() < lock.executeAfter) {
      throw new Error('Timelock not expired')
    }

    lock.status = 'executed'
    lock.executedAt = Date.now()
    await kv.put(input.lockId, JSON.stringify(lock))

    return { success: true, executed: lock.data }
  }
}

export async function get(req: Request) {
  const url = new URL(req.url)
  const lockId = url.searchParams.get('id')

  if (lockId) {
    const lock = await kv.get(lockId)
    return lock ? JSON.parse(lock) : null
  }

  const count = await kv.get('lockCount') || '0'
  return { lockCount: parseInt(count) }
}`,
    result: { success: true, lockId: 'lock_5', executeAfter: 1699651200000 },
  },

  {
    id: 'multisig-wallet',
    title: 'Multisig Wallet',
    description: 'Require multiple signatures for actions',
    category: 'Security',
    code: `import { kv } from 'tana/kv'
import { context } from 'tana/context'
import type { Request } from 'tana/net'

export async function init() {
  const input = context.input()

  await kv.put('signers', JSON.stringify(input.signers))
  await kv.put('threshold', String(input.threshold))
  await kv.put('proposalCount', '0')

  return { initialized: true, signers: input.signers, threshold: input.threshold }
}

export async function contract() {
  const input = context.input()
  const caller = context.caller()
  const signers = JSON.parse(await kv.get('signers') || '[]')

  if (!signers.includes(caller.id)) {
    throw new Error('Not a signer')
  }

  if (input.action === 'propose') {
    const count = parseInt(await kv.get('proposalCount') || '0')
    const proposalId = \`proposal_\${count + 1}\`

    await kv.put(proposalId, JSON.stringify({
      id: proposalId,
      data: input.data,
      signatures: [caller.id],
      status: 'pending',
      created: Date.now()
    }))

    await kv.put('proposalCount', String(count + 1))
    return { success: true, proposalId }
  }

  if (input.action === 'sign') {
    const proposal = JSON.parse(await kv.get(input.proposalId))
    const threshold = parseInt(await kv.get('threshold'))

    if (proposal.signatures.includes(caller.id)) {
      throw new Error('Already signed')
    }

    proposal.signatures.push(caller.id)

    if (proposal.signatures.length >= threshold) {
      proposal.status = 'executed'
      proposal.executedAt = Date.now()
    }

    await kv.put(input.proposalId, JSON.stringify(proposal))

    return {
      success: true,
      proposalId: input.proposalId,
      signatures: proposal.signatures.length,
      threshold,
      executed: proposal.status === 'executed'
    }
  }
}

export async function get(req: Request) {
  const url = new URL(req.url)
  const proposalId = url.searchParams.get('id')

  if (proposalId) {
    const proposal = await kv.get(proposalId)
    return proposal ? JSON.parse(proposal) : null
  }

  return {
    signers: JSON.parse(await kv.get('signers') || '[]'),
    threshold: parseInt(await kv.get('threshold') || '0'),
    proposalCount: parseInt(await kv.get('proposalCount') || '0')
  }
}`,
    result: { success: true, proposalId: 'proposal_3', signatures: 2, threshold: 3, executed: false },
  },
]

// Write to file
const outputPath = path.join(process.cwd(), 'lib/bundled-examples.json')
fs.writeFileSync(outputPath, JSON.stringify(examples, null, 2), 'utf8')

console.log(`✅ Generated ${examples.length} smart contract examples`)
console.log(`📁 Saved to: ${outputPath}`)
console.log(`📊 File size: ${(JSON.stringify(examples).length / 1024).toFixed(2)} KB`)
console.log(`\n📋 Categories:`)

const categories = examples.reduce((acc, ex) => {
  acc[ex.category] = (acc[ex.category] || 0) + 1
  return acc
}, {} as Record<string, number>)

for (const [category, count] of Object.entries(categories)) {
  console.log(`  ${category}: ${count} examples`)
}
