import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { socket } from "@/lib/socket";
import { getPgByPgId } from "@/hooks/useFunc";

export default function WholeChatPage({
  chats,
  messages,
  user,
  toSendUser,
  setToSendUser,
  pgId,
}) {
  const [currChat, setCurrChat] = useState();
  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = e.target[0].value;
    if (!msg.trim()) return; // Prevent empty messages

    // Ensure we have the correct target user
    let targetUserId = toSendUser;
    if (currChat && currChat.participants) {
      // Find the other participant (not the current user)
      targetUserId = currChat.participants.find(
        (participantId) => participantId !== user._id
      );
    }

    // Send message via Socket.IO
    socket.emit("send-message", {
      msg: msg,
      currentUser: user._id,
      targetUser: targetUserId,
      pgId: pgId,
    });
    e.target[0].value = ""; // Clear input
  };
  const handleClick = (chat) => {
    setCurrChat(chat);
    const targetedUserId = chat.participants.find(
      (user) => user !== JSON.parse(localStorage.getItem("user"))._id
    );
    const currentUser = JSON.parse(localStorage.getItem("user"))._id;
    const targetedPgId = chat.pgId;
    setToSendUser(targetedUserId);
    const targetedPg = getPgByPgId(targetedPgId);
    // Join the chat room for the selected conversation

    socket.emit("join-chat", {
      currentUser: currentUser,
      targetUser: targetedUserId,
      pgId: targetedPgId,
      pgName: targetedPg.name,
    });
  };
  return (
    <div className="fixed inset-0 top-16 bg-[var(--bg)] text-[var(--text)] grid grid-cols-[auto_1fr] overflow-hidden">
      <div
        key={chats?.userId}
        className="flex flex-col w-64 border-r border-[var(--border)] bg-[var(--dropdown)] p-4 h-full"
      >
        <h2 className="text-lg font-bold text-[var(--highlight)] mb-4 flex-shrink-0">
          Chats
        </h2>
        <div className="flex-1 overflow-y-auto">
          {chats.length != 0 ? (
            chats.map((chat) => {
              const isActive = currChat?.pgId === chat.pgId;
              return (
                <Link
                  href={`/chats?pgId=${chat.pgId}`}
                  key={chat.pgId}
                  onClick={(e) => {
                    if (isActive) {
                      e.preventDefault();
                      return;
                    }
                    handleClick(chat);
                  }}
                  className={`p-2 rounded mr-1.5 font-bold transition-all block mb-2 ${
                    isActive
                      ? "bg-[var(--highlight)] text-[var(--bg)] cursor-default"
                      : "cursor-pointer hover:bg-[var(--hover)] hover:text-[var(--nav-text)]"
                  }`}
                >
                  {chat.pgName}
                </Link>
              );
            })
          ) : (
            <p>No chats</p>
          )}
        </div>
      </div>
      {toSendUser ? (
        <div className="h-full flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <div className="flex-shrink-0 p-6 pb-0">
            <h2 className="text-xl font-bold text-[var(--highlight)] mb-4">
              {user?.name}'s Chat
            </h2>
          </div>

          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 pt-0 min-h-0 scrollbar-thin scrollbar-thumb-[var(--text)] scrollbar-track-transparent">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[var(--text)]">
                <p className="text-lg">No messages yet</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                {messages.map((msg, index) => {
                  return user?._id === msg.message.senderId ? (
                    <div key={index} className="flex items-center justify-end">
                      <div className="bg-[var(--hover)] text-[var(--text)] rounded-lg p-2 max-w-xs">
                        {msg.message.message}
                      </div>
                    </div>
                  ) : (
                    <div key={index} className="flex items-center">
                      <div className="bg-[var(--hover)] text-[var(--text)] rounded-lg p-2 max-w-xs">
                        {msg.message.message}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fixed Input Form */}
          <div className="flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[var(--bg)] p-4 border-t border-[var(--border)]"
            >
              <form
                onSubmit={handleSubmit}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-2 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--highlight)] focus:outline-none"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[var(--highlight)] text-[var(--bg)] px-4 py-2 rounded-lg font-bold shadow-lg hover:opacity-90 transition"
                >
                  Send
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[var(--text)]">
          <p className="text-lg">Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
}
