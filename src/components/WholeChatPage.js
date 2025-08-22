import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    // Set initial value
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat is selected
  useEffect(() => {
    if (toSendUser && inputRef.current) {
      inputRef.current.focus();
    }
  }, [toSendUser]);
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

    // Close sidebar on mobile after sending message
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
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
    <div className="fixed inset-0 top-16 bg-[var(--bg)] text-[var(--text)] flex overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-20 right-0 mr-3 z-50 bg-[var(--highlight)] text-[var(--bg)] p-2 rounded-lg shadow-lg"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen ||
          (typeof window !== "undefined" && window.innerWidth >= 768)) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col w-64 md:w-72 lg:w-80 border-r border-[var(--border)] bg-[var(--dropdown)] p-4 h-full absolute md:relative z-40"
          >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-lg md:text-xl font-bold text-[var(--highlight)]">
                Chats
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden text-[var(--text)] hover:text-[var(--highlight)]"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto custom-scrollbar"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "var(--text) transparent",
              }}
            >
              {chats.length != 0 ? (
                <motion.div layout className="space-y-2">
                  {chats.map((chat, index) => {
                    const isActive = currChat?.pgId === chat.pgId;
                    return (
                      <motion.div
                        key={chat.pgId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={`/chats?pgId=${chat.pgId}`}
                          onClick={(e) => {
                            if (isActive) {
                              e.preventDefault();
                              return;
                            }
                            handleClick(chat);
                          }}
                          className={`p-3 rounded-lg font-medium transition-all block ${
                            isActive
                              ? "bg-[var(--highlight)] text-[var(--bg)] cursor-default shadow-lg"
                              : "cursor-pointer hover:bg-[var(--hover)] hover:text-[var(--nav-text)] hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[var(--border)] rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold">
                                {chat.pgName?.charAt(0)?.toUpperCase() || "P"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">
                                {chat.pgName}
                              </p>
                              <p className="text-xs opacity-70 truncate">
                                PG Chat
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--text)] opacity-70">
                    No chats available
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-0">
        {toSendUser ? (
          <>
            {/* Chat Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 p-4 md:p-6 pb-2 border-b border-[var(--border)] bg-[var(--dropdown)]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[var(--highlight)] rounded-full flex items-center justify-center">
                  <span className="text-[var(--bg)] font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-[var(--highlight)]">
                    {currChat?.pgName || "Chat"}
                  </h2>
                  <p className="text-sm text-[var(--text)] opacity-70">
                    {user?.name}'s conversation
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto p-4 md:p-6 pt-4 min-h-0 custom-scrollbar"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "var(--text) transparent",
              }}
            >
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-[var(--text)]"
                >
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-lg md:text-xl font-medium">
                    No messages yet
                  </p>
                  <p className="text-sm opacity-70 mt-2">
                    Start the conversation!
                  </p>
                </motion.div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <AnimatePresence>
                    {messages.map((msg, index) => {
                      const isOwn = user?._id === msg.message.senderId;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl shadow-lg ${
                              isOwn
                                ? "bg-[var(--highlight)] text-[var(--bg)] rounded-br-md"
                                : "bg-[var(--dropdown)] text-[var(--text)] rounded-bl-md border border-[var(--border)]"
                            }`}
                          >
                            <p className="text-sm md:text-base leading-relaxed">
                              {msg.message.message}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwn
                                  ? "text-[var(--bg)] opacity-70"
                                  : "text-[var(--text)] opacity-50"
                              }`}
                            >
                              {new Date(
                                msg.message.timeStamp || Date.now()
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 bg-[var(--dropdown)] p-4 md:p-6 pt-4 border-t border-[var(--border)]"
            >
              <form
                onSubmit={handleSubmit}
                className="flex items-end space-x-3"
              >
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a message..."
                    className="w-full p-3 md:p-4 pr-12 rounded-2xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--highlight)] focus:outline-none resize-none text-sm md:text-base"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[var(--highlight)] text-[var(--bg)] p-3 md:p-4 rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </motion.button>
              </form>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-[var(--text)] p-8"
          >
            <div className="text-8xl mb-6">💬</div>
            <h3 className="text-xl md:text-2xl font-bold text-[var(--highlight)] mb-2">
              Welcome to GradStay Chat
            </h3>
            <p className="text-base md:text-lg opacity-70 text-center max-w-md">
              Select a chat from the sidebar to start messaging with PG owners
            </p>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden mt-6 bg-[var(--highlight)] text-[var(--bg)] px-6 py-3 rounded-lg font-medium"
            >
              View Chats
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
