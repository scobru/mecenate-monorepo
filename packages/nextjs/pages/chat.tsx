// pages/chatRoom.js
import { useState } from "react";
import ipfs from "../utils/ipfs";

export default function ChatRoom() {
  const [message, setMessage] = useState("");
  const [ipfsHash, setIpfsHash] = useState(null);

  const sendMessage = async () => {
    const { path } = await ipfs.add(message);
    setIpfsHash(path);
  };

  const receiveMessage = async () => {
    if (!ipfsHash) return;
    const fileBuffer = await ipfs.cat(ipfsHash);
    const receivedMessage = await fileBuffer.toString();
    console.log("Received Message:", await receivedMessage);
  };

  return (
    <div>
      <input type="text" value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
      <button onClick={receiveMessage}>Receive</button>
      <p>IPFS Hash: {ipfsHash}</p>
    </div>
  );
}
