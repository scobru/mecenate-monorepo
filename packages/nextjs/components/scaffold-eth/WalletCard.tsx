import React, { useState } from "react";
import { ethers } from "ethers";
import { useAccountBalance } from "~~/hooks/scaffold-eth/useAccountBalance";
import Address from "./Address";

const WalletCard = (publicKey: string | undefined, privateKey: any) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const balance = useAccountBalance(publicKey);
  const [destinationAddress, setDestinationAddress] = useState("");
  const [amount, setAmount] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const sendETH = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();

      // Convert amount to Wei
      const amountInWei = ethers.utils.parseEther(amount);

      // Create a transaction and wait for it to be mined
      const tx = await signer.sendTransaction({
        to: destinationAddress,
        value: amountInWei,
      });

      console.log("Transaction sent:", tx);
      await tx.wait();
      console.log("Transaction done:", tx);
    } catch (e) {
      console.log("Error:", e);
    }
  };

  return (
    <div className="card w-full  mx-auto p-5 rounded-xl border-2 text-left text-black text-xl font-light shadow-lg">
      <div className="text-2xl font-bold text-left mb-4">Wallet Info</div>
      <Address address={publicKey} format="long" />
      <div className="text-lg mb-4">{balance !== null ? `${balance.balance} ETH` : "Loading..."}</div>
      <button className="btn btn-primary mt-4 w-full text-center rounded" onClick={openModal}>
        Send
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h1 className="text-2xl font-semibold mb-6">Send ETH</h1>
            <input
              className="input input-bordered w-full mb-4 p-2 rounded"
              type="text"
              placeholder="Destination Address"
              onChange={e => setDestinationAddress(e.target.value)}
            />
            <input
              className="input input-bordered w-full mb-4 p-2 rounded"
              type="text"
              placeholder="Amount in ETH"
              onChange={e => setAmount(e.target.value)}
            />
            <div className="flex justify-between">
              <button className="btn btn-primary px-6 py-2 rounded" onClick={sendETH}>
                Send ETH
              </button>
              <button className="btn btn-secondary px-6 py-2 rounded" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletCard;
