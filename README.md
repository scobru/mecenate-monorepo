# MecenateIdentity 🎭

MecenateIdentity is a **decentralized identity management system** built on the Ethereum blockchain. It enables users to create and manage their unique **NFT-based identities**, providing a secure and verifiable way to interact with various applications and services in the decentralized ecosystem.

## ✨ Features

- Unique NFT-based identities on the Ethereum blockchain
- Secure and verifiable user identity management
- Easily configurable and extendable
- User-friendly platform for creating and managing identities
- Interoperable with various applications and services in the decentralized ecosystem

## 📜 Smart Contract

The MecenateIdentity smart contract includes multiple modules for managing different aspects of the user identities, such as creation, ownership, and metadata management.

- MecenateIdentity.sol

### 🗝️ Key Functions

- **Create Identity**: Users can create their unique NFT-based identities on the Ethereum blockchain.
- **Manage Metadata**: Users can manage the metadata associated with their identities, including updating and deleting information.

---------------------------------------------------------------------------------

# MecenateFeed 📄

MecenateFeed is a decentralized protocol built on the Ethereum blockchain inspired by the Erasure Protocol. It allows users to create secure and reliable data feeds, where stakeholders can lock up a cryptocurrency reward and others can submit their responses. If the stakeholder is not satisfied with the response, they can destroy the responder's stake, creating a strong incentive for high-quality responses.

## 🌟 Features

- Secure and reliable data feeds on the Ethereum blockchain
- Stakeholders can lock up a cryptocurrency reward for others to respond
- Responders can submit their response with a stake
- Stakeholders can destroy responder's stake if they are not satisfied with the response
- Incentivizes high-quality responses
- Easily configurable and extendable smart contracts
- User-friendly platform for creating, managing, and interacting with data feeds

## 📜  Smart Contract

The MecenateFeed smart contract includes multiple modules for managing different aspects of the data feeds, such as Creation, Acceptance, Submission, and Finalization.

- features/MecenateFeed.sol
- factories/MecenateFeedFactory.sol

### 🗝️ Key Functions and Phases

- **Creation phase:** The creator posts their encrypted data and shares it on their feed along with a stake.
- **Acceptance phase:** The buyer accepts the creator's post, staking their payment for the post.
- **Submission phase:** The creator posts the encrypted key that only the buyer can decrypt to the data feed.
- **Finalization phase:** After the buyer retrieves their data, they can finalize the post and can punish or reward the creator.

---------------------------------------------------------------------------------

# 🛍️ MecenateBay

MecenateBay is a decentralized marketplace built on top of MecenateFeed, a protocol inspired by the Erasure Protocol. It enables users to create, discover, and interact with secure and reliable data feeds on the Ethereum blockchain. Stakeholders can lock up a cryptocurrency reward and invite others to submit their responses. If the stakeholder is not satisfied with the response, they can destroy the responder's stake, creating a strong incentive for high-quality responses.

## 🌟 Features

- Decentralized marketplace built on top of MecenateFeed
- Discover and interact with secure and reliable data feeds on the Ethereum blockchain
- Stakeholders can lock up a cryptocurrency reward for others to respond
- Responders can submit their response with a stake
- Stakeholders can destroy responder's stake if they are not satisfied with the response
- Incentivizes high-quality responses
- Easily configurable and extendable smart contracts
- User-friendly platform for creating, managing, and participating in data feed-based transactions

## 📜 MecenateFeed Integration

MecenateBay is built on top of MecenateFeed, utilizing its smart contracts and modules for Creation, Acceptance, Submission, and Finalization of data feeds. This allows MecenateBay to inherit the robust and secure functionality of the MecenateFeed protocol, while extending it with marketplace features for a seamless user experience.

- layer/MecenateBay.sol

### 🔑 Key Functions and Phases

- **Creation phase:** Users can create data feeds by posting their encrypted data and sharing it on their feed, along with a stake.
- **Discovery phase:** Users can browse and discover data feeds within the marketplace.
- **Acceptance phase:** Buyers can accept the creator's post, staking their payment for the post.
- **Submission phase:** The creator posts the encrypted key that only the buyer can decrypt to the data feed.
- **Finalization phase:** After the buyer retrieves their data, they can finalize the post and can punish or reward the creator.

---------------------------------------------------------------------------------

# 🏛️ MecenateTier

MecenateTier is a decentralized subscription platform built on top of the Ethereum blockchain, designed for creators and their supporters. It allows creators to monetize their content by setting their own subscription fees and durations, while fans can easily support their favorite creators by subscribing with just a few clicks. This creates a fair and transparent way for creators to earn from their content and for fans to access exclusive content from their favorite creators.

## 🌟 Features

- Decentralized subscription platform on the Ethereum blockchain
- Creators can set their own subscription fees and durations
- Fans can subscribe to their favorite creators with just a few clicks
- Access to exclusive content for subscribed fans
- Fair and transparent revenue sharing model
- Easily configurable and extendable smart contracts
- User-friendly platform for creating, managing, and interacting with creator tiers

## 📜 Smart Contract

The MecenateTier smart contract includes multiple modules for managing different aspects of the subscription platform, such as Tier Creation, Subscription Management, and Revenue Distribution.

### 🔑 Key Functions and Phases

- **Tier Creation:** Creators can create their own unique subscription tiers, setting their desired subscription fees and durations.
- **Subscription Management:** Fans can easily subscribe and unsubscribe from creator tiers, gaining access to exclusive content while supporting their favorite creators.
- **Revenue Distribution:** A built-in revenue sharing model ensures fair compensation for creators based on their subscription earnings.

---------------------------------------------------------------------------------

# 🌐 MecenateQuestion

MecenateQuestion is a decentralized prediction protocol built on the Ethereum blockchain, inspired by prediction markets. It features a unique punishment mechanism that aims to ensure the correctness of the predictions. Stakeholders can create questions and set rewards for others to answer. Users can stake their answers, and if their prediction turns out to be incorrect, they may face a penalty.

## Features

- Decentralized prediction protocol on the Ethereum blockchain
- Stakeholders can create questions and set rewards for answers
- Users can stake their answers with a potential penalty for incorrect predictions
- Punishment mechanism ensures the correctness of predictions
- Easily configurable and extendable smart contracts
- User-friendly platform for creating, managing, and interacting with questions and predictions

## Smart Contract

The MecenateQuestion smart contract includes multiple modules for managing different aspects of the questions and predictions, such as Creation, Voting, and Resolution.

- features/MecenateQuestion.sol
- factories/MecenateQuestionFactory.sol

### Key Functions and Phases

- **Creation phase:** The creator posts a question and sets a reward for correct predictions.
- **Voting phase:** Users can submit their predictions by staking a certain amount.
- **Resolution phase:** Once the voting period has ended, the correct answer is determined, and incorrect predictions may face a penalty.

---------------------------------------------------------------------------------

## COMING SOON

    - MecenateDCA
    - MecenateDrop
