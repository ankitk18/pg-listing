import { createServer, get } from "http";
import next from "next";
import { Server } from "socket.io";
const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const { default: Chat } = await import("./src/models/chatModel.js");
  const { default: Message } = await import("./src/models/MessageModel.js");
  const { getPgByPgId } = await import("./src/hooks/useFunc.js");
  const { connectToDatabase } = await import("./src/lib/db.js");
  const server = createServer((req, res) => {
    handle(req, res);
  });

  connectToDatabase()
    .then(() => {})
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });
  const io = new Server(server);

  io.on("connection", (socket) => {
    socket.on("send-message", ({ msg, currentUser, targetUser, pgId }) => {
      const roomId = [currentUser, targetUser, pgId].sort().join("-");
      Message.create({
        participants: [currentUser, targetUser].sort(),
        message: {
          senderId: currentUser,
          message: msg,
        },
        pgId: pgId,
      })
        .then((message) => {
        })
        .catch((error) => {
          console.error("Error saving message:", error);
        });
      io.to(roomId).emit("receive-message", {
        message: {
          message: msg,
          senderId: currentUser,
          timeStamp: new Date(),
        },
      });
    });
    socket.on("join-chat", async ({ currentUser, targetUser, pgId,pgName }) => {
      const roomId = [currentUser, targetUser, pgId].sort().join("-");
      socket.join(roomId);
      const findChat = await Chat.findOne({
        participants: { $all: [currentUser, targetUser] },
        pgId: pgId,
      });
      if (!findChat) {
        // Fetch PG details to get the name
        const chat = await Chat.findOrCreate(
          [currentUser, targetUser],
          pgId,
          pgName
        );
        socket.emit("chat-joined", chat);
      } else {
        socket.emit("chat-joined", findChat);
      }
    });

    socket.on("disconnect", () => {
    });
  });

  server.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://localhost:3000");
  });
});
