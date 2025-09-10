import { createServer } from "http";
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
    .then(() => {
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {

    // ✅ SEND MESSAGE
    socket.on(
      "send-message",
      async ({ msg, currentUser, targetUser, pgId }) => {
        const roomId = [currentUser, targetUser, pgId].sort().join("-");
        try {
          // 🟢 ADDED (save with readBy: [sender])
          const newMessage = await Message.create({
            participants: [currentUser, targetUser].sort(),
            message: {
              senderId: currentUser,
              message: msg,
            },
            pgId,
            readBy: [currentUser], // 🟢 sender already read their own msg
          });

          io.to(roomId).emit("receive-message", {
            message: {
              message: msg,
              senderId: currentUser,
              pgId: pgId,
              timeStamp: new Date(),
            },
          });

          // 🟢 ADDED (notification to other user)
          socket.to(roomId).emit("notification", {
            from: currentUser,
            pgId,
            message: msg,
          });
        } catch (error) {
          console.error("Error saving message:", error);
        }
      }
    );

    // ✅ JOIN CHAT
    socket.on(
      "join-chat",
      async ({ currentUser, targetUser, pgId, pgName }) => {
        const roomId = [currentUser, targetUser, pgId].sort().join("-");
        socket.join(roomId);
        const findChat = await Chat.findOne({
          participants: { $all: [currentUser, targetUser] },
          pgId: pgId,
        });

        if (!findChat) {
          const chat = await Chat.findOrCreate(
            [currentUser, targetUser],
            pgId,
            pgName
          );
          socket.emit("chat-joined", chat);
        } else {
          socket.emit("chat-joined", findChat);
        }
        const unreadCount = await Message.countDocuments({
          participants: { $all: [currentUser, targetUser] },
          pgId,
          readBy: { $ne: currentUser },
        });

        socket.emit("unread-count", { roomId, count: unreadCount });
      }
    );
    socket.on("mark-read", async ({ currentUser, targetUser, pgId }) => {
      try {
        // 🟢 ADDED (update DB when user reads)
        await Message.updateMany(
          {
            participants: { $all: [currentUser, targetUser] },
            pgId,
            readBy: { $ne: currentUser },
          },
          { $push: { readBy: currentUser } }
        );
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    });

    // DISCONNECT
    socket.on("disconnect", () => {
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
