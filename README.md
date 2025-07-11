# Mynth Wallet

A simple CLI-based multi-chain wallet for interacting with Mynth wallets
(intents).

## About Mynth

Mynth is an intent-based, multi‑chain, layer zero protocol designed to
simplify and secure cross‑chain token transfers. By encoding user
intentions (or “intents”) into on‑chain contracts, Mynth enables
seamless value movement between disparate blockchains without requiring
trust in centralized bridges or custodians. Key characteristics of Mynth
include:

- **Protocol‑level Intents**: Users express desired transfers as
  intents, which are recorded in a contract and can be fulfilled or
  canceled according to protocol rules.
- **Decentralized Execution**: Executors monitor and fulfill intents on
  behalf of users, unlocking funds only upon valid proof of execution.
- **Secure Key Exposure**: When an intent is fulfilled or expired, the
  associated private key is revealed in a verifiable way, ensuring that
  only authorized parties can claim funds.
- **Multi‑Chain Interoperability**: Mynth operates agnostically across
  chains, enabling transfers between any compatible network.

## Purpose

`mywallet` is a CLI companion utility for interacting with multi-chain
wallets. When a user wants to perform a swap between two blockchains,
Mynth encodes an intent within a contract, and these contracts act as
wallets that are controlled by the Mynth Lizard network. Once an intent
is fulfilled, it can be unlocked by an executor. If an intent expires,
it can be canceled by its owner. In either case of unlocking or
cancellation, the associated private key is exposed. To obtain this
private key, a user must verify that they have the authority to request
it.

One of the functionalities of the `mywallet` tool is to allow a user to
sign an intent to verify that they are one of the authorized
representatives for interacting with that intent. This signed
verification enables communicating with the Lizard network to retrieve
the underlying private key. Once the private key is obtained, `mywallet`
can be used to withdraw funds, transfer funds, or retrieve the addresses
associated with the intent.

## Prerequisites

To use this project, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download)
- [pnpm](https://pnpm.io/)

## Installation

Clone the repository:

``` bash
git clone https://github.com/MynthAI/wallet.git
cd wallet
```

Ensure you have nodejs and pnpm installed:

``` bash
bash setup.sh
```

Set up the `mywallet` CLI globally:

``` bash
pnpm build
pnpm link --global
```

After completing these steps, the `mywallet` should be ready for use.
You can test this by running:

``` bash
mywallet --help
```

## License

This project is licensed under the MIT License. By using or contributing
to this project, you agree to the terms and conditions of MIT.
