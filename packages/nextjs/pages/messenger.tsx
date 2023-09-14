import React, { use, useEffect, useState } from "react";
import axios from "axios";

const Messenger: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<string>("General");
  const [sending, setSending] = useState<boolean>(false);

  const sendMessage = async () => {
    setSending(true);
    const url = `https://api.telegram.org/bot${String(process.env.NEXT_PUBLIC_TELEGRAM_TOKEN)}/sendMessage`;
    const formattedText = `
      <b>📦 ${messageType} Message</b>
      \n<b>👤 from: </b>${localStorage.getItem("userName")}
      \n<b>✉️ message: </b>${message}
    `;
    try {
      const response = await axios.post(url, {
        chat_id: "@mecenate_channel",
        text: formattedText,
        parse_mode: "HTML",
      });
      console.log("Message sent:", response.data);
      setSending(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setSending(false);
    }
  };

  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "");
  }, []);

  return (
    <div className="flex items-center flex-col flex-grow pt-10  min-w-fit">
      <div className="max-w-3xl text-center">
        <h1 className="text-6xl font-bold mb-8">MESSENGER</h1>
        <p className="text-xl  mb-5">Talk with buyer/seller or mecenate community withour reveal your telegram ID</p>
        <p className="text-xl  mb-5"></p>

        <a href="https://t.me/mecenate_message_bot" className="link-hover mx-10">
          Telegram Buyer/Seller Bot
        </a>
        <a href="https://t.me/mecenate_message_bot" className="link-hover mx-10">
          Telegram Channel
        </a>
        <a href="https://t.me/mecenate_message_bot" className="link-hover mx-10">
          Telegram Group
        </a>
      </div>

      <div className="flex flex-col w-3/4 p-10">
        <div className="form-control mb-5">
          <label className="label">
            <span className="label-text">Type</span>
          </label>
          <select className="select select-bordered w-full max-w-xs" onChange={e => setMessageType(e.target.value)}>
            <option value="General">General</option>
            <option value="Question">Question</option>
            <option value="Feedback">Feedback</option>
            <option value="Issue">Issue</option>
          </select>
        </div>{" "}
        <div className="form-control mb-5">
          <label className="label">
            <span className="label-text">Username</span>
          </label>
          <input
            type="text"
            placeholder="UserName"
            className="input input-bordered"
            value={userName || ""}
            disabled={userName !== null}
          />
        </div>
        <div className="form-control mb-5">
          <label className="label">
            <span className="label-text">Your message here</span>
          </label>
          <textarea
            rows={4}
            placeholder="Your message here"
            className="textarea textarea-bordered"
            onChange={e => setMessage(e.target.value)}
          ></textarea>
        </div>
        <button
          className={`btn btn-primary ${sending ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={sendMessage}
          disabled={sending}
        >
          {sending ? "Sending..." : "Send Message"}
        </button>
      </div>
    </div>
  );
};

export default Messenger;
