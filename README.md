# Cardano Wallet

This project is a reference implementation for a simple Cardano wallet
interacting with Mynth. It consists of a CLI written in TypeScript
illustrating basic functions such as sending transactions with embedded
encrypted messages.

A Cardano wallet is a critical tool for interacting with Cardano,
allowing users to store, send, receive, and stake tokens. The foundation
of a Cardano wallet is the **seed phrase** (also known as a recovery
phrase or mnemonic phrase). This is a series of 12, 15, or 24 words
generated when the wallet is created. Every wallet has a unique seed
phrase. The seed phrase is the master key to the wallet, allowing the
user to recover the associated private keys and, therefore, all funds
and staking rights.

A Cardano wallet consists of two main types of private keys:

1.  **Payment Private Key:** Used for transactions, such as sending or
    receiving tokens.
2.  **Staking Private Key:** Used for delegating ADA to a staking pool
    or managing staking rewards.

From each private key, a corresponding **public key** is derived. The
public key is then used to generate a **Cardano address**, which others
can use to send tokens to your wallet.

## Prerequisites

To use this project, ensure you have the following installed:

  - **Node.js** (v18.8 or later)
  - **npm** (Node Package Manager)

## Installation

To install and set up the Cardano Wallet CLI project, follow these
steps:

1.  **Clone the repository:**
    
    ``` bash
    git clone https://github.com/MynthAI/wallet.git
    ```

2.  **Navigate to the project directory:**
    
    ``` bash
    cd wallet
    ```

3.  **Install the dependencies:**
    
    ``` bash
    npm install
    ```

After completing these steps, the Cardano Wallet CLI should be ready for
use. You can test this by running:

``` bash
npx wallet
```

## License

This project is licensed under the MIT License. By using or contributing
to this project, you agree to the terms and conditions of MIT.

## Support

If you encounter any issues or have questions, feel free to reach out
for support.

Happy encrypting and decrypting\!
