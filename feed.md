---
description: How To
---

# Feeds

### SIGN IN

Go to the Identity page and click the 'Join with sismo' button. After your zk-proof has been verified, click 'Sign In' to register your ID into the protocol.

### VERIFIED

This is the badge that appears on the page when your zk-proofs are stored locally. If you don't see it, please re-join by clicking 'JOIN With Sismo' on the iDentity page.

### CREATE A FEED (seller)

Go to the Feed page and click on 'Create' to create your own feed where you can sell your data anonymously. Creating a feed has a fixed fee of 0.01 ETH, which is distributed to the protocol's treasury.

### CREATE POST (seller)

Once you've created your feed, go to the feed page and click on the '**CREATE**' button. Enter the details related to your post. Currently, only text files and images are accepted, but soon the interface will support audio, video, and ZIP files.

### _<mark style="color:yellow;">⚠️</mark> Please make sure to save the JSON file containing the symmetric key for your uploaded encrypted data. This key will be necessary for the buyer to decrypt the data in future transactions_

### ACCEPT POST (buyer)

Once the post is created, you will need to wait for a buyer to **ACCEPT** your information request at your set price. This can happen through the bay, or you could simply direct your buyer to your feed's address and have them accept your request, thereby activating the escrow.

### SUBMIT POST (seller)

Click on the **SUBMIT** button and paste your symmetric key generated before.

### RETRIEVE AND FINALIZE (buyer)

Click on the **RETRIEVE** button and enjoy your decrypted data 🚀🔓

Once you are satisfied that the data provided by the seller is what you were looking for, you can finalize the feed by clicking the '**FINALIZE**' button and checking the '**VALID**' checkbox.

If you are not satisfied with the data, you can enter the amount to be subtracted from the seller's stake as a form of penalty for partially or entirely incorrect data. Remember, the penalty will also apply to the amount deposited by the buyer at a 1/10 ratio. If you choose to deduct 100 ETH from the seller, the buyer will lose 10 ETH. All ETH from punishment are distributed to treasury.

### REVEAL AND RENOUNCE (seller)

After the resolution of the feed, the seller can choose to publicly reveal their initial data

The seller has the option to withdraw from their post even after it has been submitted or accepted by the buyer. In such cases, the contract provides for the refund of both the seller and the buyer

### ADD and TAKE STAKE or PAYMENT (seller and buyer)

Seller and Buyer can always add to their respective deposits in the feed. For the seller, this means increasing their stake; for the buyer, it means increasing their payment. However, neither party can add funds when the Feed's state is 'Submitted.' Essentially, once the seller submits the encrypted key to the buyer, the contract becomes locked and will not accept additional funds.
