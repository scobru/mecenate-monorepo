# Mecenate

## #100builders #backdrop #sismo #scaffold-eth #buildguild

This project is dedicated to anyone who wishes to exchange information and data anonymously, while also providing a system designed to filter and ensure the quality of the data received.

## What's New ?

## Update 26/10/2023 v2.0.0

We are thrilled to announce version 2 of Mecenate with the following enhancements:

### Smart Contract

- [x] **Multi-Token Usage**: Now supports ETH, DAI, and MUSE (the protocol token) as currencies for feeds.
- [x] **Security and Gas Fee Optimization**: Improved security measures and optimized gas fees for better performance.
- [x] **Mecenate EAS Resolver Contract**: Introduced the Mecenate EAS Resolver contract to ensure the attestations are genuinely valid.
- [x] **Attestation Mechanism**: Implemented an attestation mechanism via eas during the post finalization stage. When the Buyer confirms the data validity, they also attest to the seller's reliability on-chain.
- [x] **MUSE Token Burning Mechanism**: Implemented a mechanism for burning the native MUSE tokens to control the supply and increase scarcity.
- [x] **Uniswap Purchase and Burning**: Enabled the purchase of native MUSE tokens on Uniswap using DAI and ETH, followed by a burning mechanism to further manage the token economics.

### Frontend

- [x] **Account Abstraction and Social Login**: Implemented Account Abstraction and social login functionalities using Web3Auth.
- [x] **Sismo Implementation**: Integrated Sismo to verify user identity via zkproof without requiring the user to provide any data to the platform.

enjoy the beta on : <https://mecenate.vercel.app/>

Documentation: <https://scobru.gitbook.io/mecenatedocs/>

- [**Mecente Protocol v2.0.0**](./#mecente-protocol-v100)
  - [Features](./#features)
  - [Quick Start](./#-quick-start)
  - [Contribution](./#contribution)

### Features

Mecenate consists of several applications, including:

- 📄Mecenate Feed: A smart contract protocol for buy and sell encrypted and private data.
- 📣Mecenate Bay: A Dapp marketplace built on top of Mecenate Feed.

## 🚀 QUICK START

---

To get started with Scaffold-Eth 2, follow the steps below:

1. Clone this repo & install dependencies

   ```bash
   git clone https://github.com/scobru/mecenate-monorepo.git
   cd mecenate-monorepo
   yarn
   ```

2. On a third terminal, start your NextJS app:

   ```bash
   yarn start
   ```

### Contribution

Other developers who share a passion for decentralized data exchange are invited to join this project and help it reach its full potential.
Thank you for taking the time to read about Mecenate, and we look forward to sharing more updates soon.
