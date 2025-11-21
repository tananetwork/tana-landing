---
title: Quick Start
description: Get up and running with Tana in minutes
---

## Prerequisites

- macOS, Linux, or Windows (WSL)
- [Docker](https://docker.com) (for PostgreSQL database)

## Installation

### Download Binaries

**Coming soon:** Pre-built binaries for all platforms.

For now, see the [Contributing Guide](/contributing/setup/) for building from source.

## Usage

Once you have the `tana` binary installed:

```bash
# Start databases (PostgreSQL and Redis)
npm run db:up

# Start Tana services (mesh, t4, ledger)
tana start

# Create a new blockchain (you become the genesis leader)
tana new chain local

# In another terminal, create a user
tana new user @alice --name "Alice Johnson"

# Deploy user to blockchain
tana deploy user @alice

# Check status
tana status
```

## Basic Workflow

### 1. Start Databases

```bash
npm run db:up
```

This starts PostgreSQL and Redis using Docker Compose.

### 2. Start Tana Services

```bash
tana start
```

This starts all Tana services (mesh, t4, and ledger) in the correct order. The ledger service runs on port 8080.

### 3. Create a Blockchain

```bash
tana new chain local
```

This creates a new blockchain with you as the genesis leader. You can name your chain anything (e.g., "local", "testnet", etc.).

### 4. Create a User

```bash
tana new user @alice --name "Alice Johnson"
```

This creates a user configuration locally with a generated keypair. You can optionally add `--bio` and `--role` flags.

### 5. Deploy User to Blockchain

```bash
tana deploy user @alice
```

This creates a transaction on the blockchain to register the user.

### 6. Check Balance

```bash
tana balance @alice USD
```

View the user's balance in a specific currency.

### 7. Transfer Funds

```bash
tana transfer @alice @bob 100 USD
```

Transfer currency between users.

## Using the API

The ledger service provides a REST API:

```bash
# Health check
curl http://localhost:8080/health

# List users
curl http://localhost:8080/users

# Get latest block
curl http://localhost:8080/blocks/latest
```

See the [API Reference](/tana-api/intro/) for complete documentation.

## Next Steps

1. ✅ Ledger service is working
2. 🔨 Build CLI commands to interact with ledger
3. 🔨 Implement smart contracts service
4. 🔨 Create blockchain node with P2P
5. 🔨 Build landing pages feature

Check out the [CLI Reference](/tana-cli/intro/) to learn more about available commands.
