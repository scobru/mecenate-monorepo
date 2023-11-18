# Mecenate v2.0.0

<div align="left">

<figure><img src=".gitbook/assets/banner.png" alt=""><figcaption></figcaption></figure>

</div>

## #100builders #backdrop #sismo #scaffold-eth #buildguild

We are thrilled to announce version 2 of Mecenate with the following enhancements:

enjoy the beta on : [https://mecenate.vercel.app/](https://mecenate.vercel.app/)
Join the beta tester here: <https://backdropbeta.com/mecenate-monorepo/join/I4mh3AZL>

## SUMMARY

* [NEW IN V2](./#new-in-v2)
* [WHAT'S IS THIS?](./#whats-this)
* [HOW IT WORKS?](./#how-it-works)
* [WORKFLOW FEEDS](./#workflow-feeds)
* [WORKFLOW SENDS](./#workflow-send)
* [STANDARDS](./#standards)
* [PACKAGES](./#packages)
* [QUICK START](./#quick-start)

## NEW IN V2

### Smart Contract

* [x] **MecenateSend**: New Layer that allow to send ETH or ERC20 with privacy.
* [x] **MecenateMarket**: Allow all seller to post into a board the data that they want to sell public.
* [x] **Multi-Token Usage**: Now supports ETH, DAI, and MUSE (the protocol token) as currencies for feeds.
* [x] **Security and Gas Fee Optimization**: Improved security measures and optimized gas fees for better performance.
* [x] **Mecenate EAS Resolver Contract**: Introduced the Mecenate EAS Resolver contract to ensure the attestations are genuinely valid.
* [x] **Attestation Mechanism**: Implemented an attestation mechanism via eas during the post finalization stage. When the Buyer confirms the data validity, they also attest to the seller's reliability on-chain.
* [x] **MUSE Token Burning Mechanism**: Implemented a mechanism for burning the native MUSE tokens to control the supply and increase scarcity.
* [x] **Uniswap Purchase and Burning**: Enabled the purchase of native MUSE tokens on Uniswap using DAI and ETH, followed by a burning mechanism to further manage the token economics.

### UI

* [x] **Send section added in the UI**
* [x] **Market section added in the UI**
* [x] **Account Abstraction and Social Login**: Implemented Account Abstraction and social login functionalities using Web3Auth.
* [x] **Sismo Implementation**: Integrated Sismo to verify user identity via zkproof without requiring the user to provide any data to the platform.
* [x] **Payment with DAI**: We add DAI as payment for feeds

Documentation: [https://scobru.gitbook.io/mecenatedocs/](https://scobru.gitbook.io/mecenatedocs/)

## WHAT'S THIS?

Mecenate is a protocol composed by a set of smart contracts that assicure the user's privacy and the integrity of the data. The protocol would to be open source and decentralized. All the fees are distributed to the Mecenate users.

Mecenate consists of several applications, including:

* **📄Mecenate Feed:** Mecenate Feeds Mecenate Feeds allows anyone to publish data and stake capital behind the accuracy of that information. Users can build a verifiable track record and stake their predictions with ETH. By staking ETH, the seller of a prediction puts value at risk if the prediction goes wrong. When a seller stakes behind their prediction they choose a "griefing factor". Griefing factor = degree (e.g. 1:10) to which the buyer is able to destroy their stake. If the seller stakes ETH, the buyer can destroy both their stakes for ETH .
* **📣Mecenate Bay:** A marketplace build on top of Mecenate Feeds for sourcing ANY kind of information (secrets, predictions etc). Requests for information are matched with a stake by "fulfillers" who get paid if the information meets the set parameters. ETH is used for staking. Ethers from punished fulfillers are sent to the Mecenate treasury and distributed between users protocol.

## HOW IT WORKS?

**QUESTION** Enter a short explanation of what you're looking for. This can include links, Twitter handles and hastags. Make your descriptions as clear as possible.

**REWARD** An amount of ETH cryptocurrency you are locking up as a reward. This will be transferred into an escrow when you make the request, you make sure you have this in your wallet. Like this fulfillers can see you really have the money and will take your request seriously. (Once someone fulfills your request it is added to their stake and you will not get it back, you can only punish it.)

**FULLFILLER** stake This is what makes Mecenate Bay powerful. This is how much ETH cryptocurrency someone will need to deposit when fulfilling your request. You can destroy a fraction or all of their staked money if you are dissatisfied with what they provide. This will stop people responding with spam or bad information. It usually makes sense to have this be roughly 10% - 50% of the reward.

**PUNISH RATIO** How many ETH it will cost you to destroy one dollar of the fulfiller's stake. For example; if you set the ratio to 0.1 and punish a fulfiller who staked 100 ETH, it will cost you 10 ETH to destroy their entire stake. This protects the fulfiller from reckless punishment. The default value is good for most requests.

**PUNISH PERIOD** How many days after your request is fulfilled you have to verify the quality of the information provided. Within this window, you may punish the fulfiller. After this time their stake and reward are released. You may decide to release it early if you are satisfied with the submission. The default value is good for most requests.

## WORKFLOW IDENTITY

### New User Registration

1. **Initial Connection**: New user connects to `MecenateClient` or `MecenateUI`.
2. **Key Generation**: `MecenateClient` generates asymmetric encryption keys `PubKey, PrivKey`.
3. **Identity Verification**: User verifies their identity through Sismo zk-proof.
4. **Key Storage**: User sign a tx to create his unique Key Pair stored encrypted on IPFS.
5. **Registration**: `MecenateClient` calls `registerUser(evmAccount, vaultID, pubKey)`.

## WORKFLOW FEEDS

### Creating a Post

1. **Feed Creation**: Seller creates a Feed using `Feed_Factory.buildFeed()`.
2. **Data Upload**: Seller uploads `rawdata` to `MecenateClient_Seller`.
3. **Symmetric Key**: `MecenateClient_Seller` generates symmetric encryption key `SymKey`.
4. **Data Encryption**: `MecenateClient_Seller` computes `encryptedData = SymKey.encrypt(rawdata)`.
5. **Hash Computations**:
   * `keyhash = sha256(SymKey)`
   * `datahash = sha256(rawdata)`
   * `encryptedDatahash = sha256(encryptedData)`
6. **JSON and Proof**:
   * `json_proofhash_v120 = JSON(address_seller, multihashformat(datahash), multihashformat(keyhash), multihashformat(encryptedDatahash))`
   * `proofhash = sha256(json_proofhash_v120)`
7. **Blockchain Interaction**:
   * Submits `proofhash` to their Feed contract
   * Uploads `json_proofhash_v120` to IPFS at `multihashformat(proofhash)`
   * Uploads `encryptedData` to IPFS at `multihashformat(encryptedDatahash)`
8. **Post Submission**: Creates a Post using `Feed.submitHash(proofhash)`.

### Selling a Post

1. **Payment**: Buyer deposits the required payment using `Feed.accept()`.
2. **Key Retrieval**: `MecenateClient_Seller` retrieves `PubKey_Buyer` from `Mecenate_Users` contract.
3. **Encryption**: `MecenateClient_Seller` computes `encryptedSymKey_Buyer = PubKey_Buyer.encrypt(SymKey)`.
4. **Sell Data**:
   * `json_selldata_v120 = JSON(encryptedSymKey_Buyer, multihashformat(proofhash))`
   * Uploads `json_selldata_v120` to IPFS at `multihashformat(sha256(json_selldata_v120))`
5. **Submission**: Submits `json_selldata_v120` to buyer using `Feed.submitHash(multihashformat(sha256(json_selldata_v120)))`.

### Revealing a Post

1. **SymKey Upload**: `MecenateClient_Seller` uploads `SymKey` to IPFS at `multihashformat(keyhash)`.
2. **Raw Data Upload**: `MecenateClient_Seller` uploads `rawdata` to IPFS at `multihashformat(datahash)`.

## WORKFLOW SEND

### Send a Payment

1. **Set the transaction**: The user selects the recipient and the amount to send. The recipient must be registered to the protocol.
2. **Stealth Address Generation**: The user generates a `Stealth_Address` derived from the `PubKey_Receiver` fetched from the `MecenateUser` contract, and a `random_string`
3. **SubmitHash**: The user encrypts the `random_string` with the `PubKey_Receiver`, generate the json_payData_v100 and uploads it to IPFS:

```javascript
const json_payData_v100 = {
   encryptedR: `enrypted_random_string`
   nonce: nonce,
   ephemeralPubKey:`PubKey_Sender`
   };
```

After upload we get an `ipfs_hash`.
User Encode paramaters into a `encoded` structure like this:

```javascript
const encoded = ethers.utils.defaultAbiCoder.encode(
   [
      "bytes",
      "bytes",
      "address",
      "address",
      "uint256"
   ],
   [
   ipfsHash,
      `ipfs_hash`
      `PubKey_Receiver`,
      `Stealth_Address`,
      token_address,
      amount_to_send
   ]);
```

Subsequently, the user will call `submitHash(encoded)` to store this information in the MecenateSend contract.
4. **Send funds to stealth Address**: `MecenateSend` sends the funds to the `Stealth_Address` generated by the user, and stores in a mapping the `encoded` corresponding to the `PubKey_Receiver`.

### Receive a Payment

1. **Select the receiver**: The user selects a `Receiver_Address` for their withdrawal and calls the `getHash()` function to check if there are `encoded`  data associated with their `PubKey_Receiver`.
2. **Decrypt and generate the PK**: If the encrypted data exists, the user decrypts it, obtaining the `random_string` that multiplies by their `PubKey_Receiver`, thus obtaining the `Stealth_Address_PrivateKey` of the `Stealth_Address`.
3. **Withdraw**: Having `Stealth_Address_PrivateKey`, the user sends the funds from the frontend to the `Receiver_Address` selected at the beginning.

## STANDARDS

This standard outlines how to encode data for transfering access to an mecenate data proof. Transfering access occurs when the creator of the proof allows an other party to access the data.

```bash
Buffer(JSON.stringify({
  msp_version: <v1.0.0>,
  proofhash: <ipld_sha2_256 proof>,
  sender: <0x1234...>,
  senderPubKey: <0x1234...>,
  senderVaultId: <0x1234...>,
  receiver: <0x1234...>,
  receiverPubKey: <0x1234...>,
  receiverVaultId: <0x1234...>,
  encryptedSymKey: ipld_sha2_256(Buffer(<raw data>))),
  postId: <0x1234...>,
  ... <extra fields>
}))
```

more infos [here](standards/MSP\_1000.md)

## PACKAGES

**packages/nextjs** - package for the UI build in nextJS&#x20;

**packages/hardhat** - package with smart contracts build with Hardhat

**packages/client** - SDK and command line interface, usefull to interact with the protocol.

## QUICK START

1. Clone this repo & install dependencies

    ```bash
    git clone https://github.com/scobru/mecenate-monorepo.git
    cd mecenate-monorepo
    yarn
    ```

2. Example .env file for Base Goerli

    ```dotenv
    NEXT_PUBLIC_NETWORK=baseGoerli
    NEXT_PUBLIC_RPC_URL=https://goerli.base.org
    NEXT_PUBLIC_CHAIN_ID=84531
    NEXT_PUBLIC_RPC_POLLING_INTERVAL=5000
    NEXT_PUBLIC_PINATA_API_KEY=
    NEXT_PUBLIC_PINATA_API_SECRET=
    NEXT_PUBLIC_PINATA_GATEWAY=
    NEXT_PUBLIC_IGNORE_BUILD_ERROR=true
    NEXT_PUBLIC_ALCHEMY_SECRET=
    NEXT_PUBLIC_INFURA_API_KEY=
    NEXT_PUBLIC_TELEGRAM_TOKEN=
    NEXT_PUBLIC_DAI_ADDRESS_BASE="0x7B027042374F2002614A71e5FF2228B1c862B67b"
    NEXT_PUBLIC_MUSE_ADDRESS_BASE="0x614cA0b2fFde43704BD122B732dAF9a2B953594d"
    NEXT_PUBLIC_WETH_ADDRESS_BASE="0xa3a0460606Bb07A44Ff47fB90f2532F99de99534"
    NEXT_PUBLIC_APP_KEY=""
    NEXT_PUBLIC_DB_NAME=""
    ```

3. On a third terminal, start your NextJS app:

    ```bash
    yarn start
    ```

### Contribution

Other developers who share a passion for decentralized data exchange are invited to join this project and help it reach its full potential. Thank you for taking the time to read about Mecenate, and we look forward to sharing more updates soon.
