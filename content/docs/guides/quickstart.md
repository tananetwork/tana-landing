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
# Create a user
tana new user @alice --name "Alice Johnson"

# Start Tana
tana start
```

That's it! Your blockchain is now running.

## Basic Workflow

### 1. Create a User

```bash
tana new user @alice --name "Alice Johnson"
```

This creates a user configuration locally with a generated keypair. You can optionally add `--bio` and `--role` flags.

### 2. Start Tana

```bash
tana start
```

This starts all Tana services and initializes your blockchain. The services will be available on their default ports.

### 3. Check Balance

```bash
tana balance @alice USD
```

View the user's balance in a specific currency.

### 4. Transfer Funds

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
