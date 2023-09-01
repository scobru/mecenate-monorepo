// utils/ipfs.js
import { create } from "ipfs-http-client";

const projectId = "2FMUdMfqb8YwcclqJQhPHYlUHx5";
const projectSecret = "076b6e972ec77f21521ac05108a2c645";
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export default ipfs;
