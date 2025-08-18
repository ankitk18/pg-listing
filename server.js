import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const { default: Chat } = await import("./src/models/chatModel.js");
  const { default: Message } = await import("./src/models/MessageModel.js");
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
    console.log("User connected:", socket.id);

    socket.on("send-message", ({ msg, currentUser, targetUser, pgId }) => {
      const roomId = [currentUser, targetUser, pgId].sort().join("-");
      console.log(
        `Message from ${currentUser} to ${targetUser} in room ${roomId}:`
      );
      Message.create({
        participants: [currentUser, targetUser].sort(),
        message: {
          senderId: currentUser,
          message: msg,
        },
        pgId: pgId,
      })
        .then((message) => {
          console.log("Message saved:");
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
    socket.on("join-chat", async ({ currentUser, targetUser, pgId }) => {
      const roomId = [currentUser, targetUser, pgId].sort().join("-");
      socket.join(roomId);
      const findChat = await Chat.findOne({
        participants: { $all: [currentUser, targetUser] },
        pgId: pgId,
      });
      if (!findChat) {
        const chat = await Chat.findOrCreate([currentUser, targetUser], pgId);
        console.log("Chat created:", chat);
        socket.emit("chat-joined", chat);
      } else {
        console.log("Chat already exists:", findChat);
        socket.emit("chat-joined", findChat);
      }
      console.log(`User ${currentUser} joined the room ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  server.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://localhost:3000");
  });
});
