// pages/api/socket.js
export const config = {
  api: {
    bodyParser: false,
  },
};

let connectedUsers: any[] = [];

export default function handler(
  req: { ws: any },
  res: { status: (arg0: number) => { (): any; new (): any; end: { (): any; new (): any } } },
) {
  if (!req.ws) {
    return res.status(500).end();
  }

  const ws = req.ws;
  ws.on("message", (message: string) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === "JOIN") {
      connectedUsers.push({ id: parsedMessage.id, ws });
      console.log(`${parsedMessage.id} joined`);
    }

    if (parsedMessage.type === "SEND_MESSAGE") {
      connectedUsers.forEach(user => {
        if (user.ws.readyState === ws.OPEN) {
          user.ws.send(JSON.stringify({ type: "NEW_MESSAGE", message: parsedMessage.message, id: parsedMessage.id }));
        }
      });
    }
  });

  ws.on("close", () => {
    connectedUsers = connectedUsers.filter(user => user.ws !== ws);
  });

  return res.status(200).end();
}
