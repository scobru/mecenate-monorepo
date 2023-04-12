# **Mecente Protocol v1.0.0** for Buidlguidl Hackthon

[feed video demo](https://www.youtube.com/watch?v=ZCfASOjT04Y&list=PLTenf2t5YuIp68AlFJWjFiJtf4svPuQiX)

- [**Mecente Protocol v1.0.0** for Buidlguidl Hackthon](#mecente-protocol-v100-for-buidlguidl-hackthon)
  - [V1.1.0](#v110)
    - [Features](#features)
  - [🚀 QUICK START](#-quick-start)
    - [Development Notes](#development-notes)
    - [Treasury \& DAO](#treasury--dao)
    - [Contribution](#contribution)

---

## V1.1.0

- [x] Now the user can use only MUSE,DAI or WETH as collateral for Mecenate Feeds and Mecenate Bay.
- [x] DAO created for the Mecenate protocol that will be used to manage the treasury.

### Features

Mecenate consists of several applications, including:

- 📄Mecenate Feed: A smart contract protocol for sharing information privately and anonymously, similar to the Erasure Protocol clone.
- 📣Mecenate Bay: A Dapp marketplace built on top of Mecenate Feed.
- 🆔Mecenate Identity: A Dapp for creating a tokenized identity.
- 🎫Mecenate Tier: A Dapp for creating subscriptions and memberships.
- ❔Mecenate Question: A Dapp for prediction markets where users can act as both hosts and oracles.

## 🚀 QUICK START

---

To get started with Scaffold-Eth 2, follow the steps below:

1. Clone this repo & install dependencies

    ```bash
    git clone https://github.com/scobru/mecenate-monorepo.git
    cd mecenate-monorepo
    yarn
    ```

2. Run a local network in the first terminal:

    ```bash
    yarn chain
    ```

3. This command deploys a test smart contract to the local network. The contract is located in packages/hardhat/contracts and can be modified to suit your needs. The yarn deploy command uses the deploy script located in packages/hardhat/deploy to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

    ```bash
    yarn start
    ```

### Development Notes

The folder structure:

```bash
client  ts-node cli
nextjs  nextjs app     
hardhat hardhat app        
```

The Mecenate repository is composed of ScaffoldEth-2 and another application called "client", which allows interaction with the protocol through a command-line interface written in TypeScript.

### Treasury & DAO

Mecenate possesses a treasury that collects the fees accumulated from the use of the protocol's contracts. The plan is to create a treasury controlled by a DAO, which is aimed at making the protocol completely decentralized.

### Contribution

Other developers who share a passion for decentralized data exchange are invited to join this project and help it reach its full potential.

Thank you for taking the time to read about Mecenate, and we look forward to sharing more updates soon.
