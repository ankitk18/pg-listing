"use client";
import React, { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import { getPgByPgId, getUserByUserId, getUserIdByPgId } from "@/hooks/useFunc";
import { useSearchParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { motion, AnimatePresence } from "framer-motion";

import NotLoggedIn from "@/components/NotLoggedIn";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const urlPgId = searchParams.get("pgId");

  // Core state
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [targetedUserId, setTargetedUserId] = useState(null);
  const [targetedUser, setTargetedUser] = useState(null);
  const [pg, setPg] = useState(null);
  const [currentPgId, setCurrentPgId] = useState(urlPgId);
  const [activePg, setActivePg] = useState(null);

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Cache state
  const [participantNames, setParticipantNames] = useState({});
  const [pgDetails, setPgDetails] = useState({});

  // 🟢 Unread & notifications
  const [unreadCounts, setUnreadCounts] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize user and setup
  useEffect(() => {
    document.title = "Chats - GradStay";
    if (localStorage.getItem("user")) {
      setUser(JSON.parse(localStorage.getItem("user")));
    }

    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // When chat page refreshed remove activePg
  useEffect(() => {
    const isReload =
      performance.navigation && performance.navigation.type === 1;
    if (isReload) {
      setCurrentPgId(null);
      setActivePg(null);
      window.history.replaceState({}, "", "/chats");
    }
  }, []);

  // Socket setup
  useEffect(() => {
    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      // Update unread if message is for another PG
      if (msg.message.pgId !== currentPgId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.message.pgId]: (prev[msg.message.pgId] || 0) + 1,
        }));
        setNotifications((prev) => [...prev, msg]);
      }
    });

    socket.on("messages-read", ({ by, pgId }) => {
      setUnreadCounts((prev) => ({
        ...prev,
        [pgId]: 0,
      }));
    });

    return () => {
      socket.off("receive-message");
      socket.off("messages-read");
    };
  }, [currentPgId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (targetedUserId && inputRef.current) inputRef.current.focus();
  }, [targetedUserId]);

  // Fetch chats
  useEffect(() => {
    if (!user) return;
    const fetchChats = async () => {
      try {
        const response = await fetch(`/api/chats/${user._id}`);
        if (!response.ok) throw new Error("Failed to fetch chats");
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchChats();
  }, [user]);

  // Update currentPgId when URL changes
  useEffect(() => setCurrentPgId(urlPgId), [urlPgId]);

  // fetch PG data
  useEffect(() => {
    if (currentPgId && user) {
      getPgByPgId(currentPgId).then((data) => {
        setPg(data.pg);
        setUnreadCounts((prev) => ({ ...prev, [currentPgId]: 0 }));
      });
    } else {
      setTargetedUser(null);
      setTargetedUserId(null);
      setPg(null);
    }
  }, [currentPgId, user]);

  // run logic after pg is set
  useEffect(() => {
    if (pg && user && user._id !== pg.userId) {
      getUserIdByPgId(pg._id)
        .then((data) => {
          setTargetedUser(data.user);
          setTargetedUserId(data.user._id);

          socket.emit("join-chat", {
            currentUser: user._id,
            targetUser: data.user._id,
            pgId: pg._id,
            pgName: pg.name || "PG Chat",
          });
        })
        .catch(() => setTargetedUser(null));
    }
  }, [pg, user]);

  // Fetch messages
  useEffect(() => {
    if (!user || !targetedUserId || !currentPgId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `/api/chats/message?currentUser=${user._id}&targetedUserId=${targetedUserId}&targetedPgId=${currentPgId}`
        );
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [user, targetedUserId, currentPgId]);

  // Fetch participant name
  const getUserName = async (userId) => {
    if (participantNames[userId]) return participantNames[userId];
    try {
      const data = await getUserByUserId(userId);
      const name = data.user?.name || "Unknown User";
      setParticipantNames((prev) => ({ ...prev, [userId]: name }));
      return name;
    } catch (err) {
      console.error(err);
      return "Unknown User";
    }
  };

  // Fetch PG details
  const getPgDetails = async (pgId) => {
    if (pgDetails[pgId]) return pgDetails[pgId];
    try {
      const data = await getPgByPgId(pgId);
      setPgDetails((prev) => ({ ...prev, [pgId]: data.pg || {} }));
      return data.pg || {};
    } catch (err) {
      console.error(err);
      return {};
    }
  };

  // Fetch participant names & PG details
  useEffect(() => {
    if (!chats || !user) return;
    chats.forEach((chat) => {
      const other = chat.participants.find((id) => id !== user._id);
      if (!participantNames[other]) getUserName(other);
      if (!pgDetails[chat.pgId]) getPgDetails(chat.pgId);
    });
  }, [chats, user, participantNames, pgDetails]);

  // Handle chat click
  const handleChatClick = (chat) => {
    setIsSidebarOpen(false);
    setCurrentPgId(chat.pgId);
    const other = chat.participants.find((id) => id !== user._id);
    setTargetedUserId(other);
    setActivePg(chat);
    socket.emit("join-chat", {
      currentUser: user._id,
      targetUser: other,
      pgId: chat.pgId,
      pgName: pgDetails[chat.pgId]?.name || "PG Chat",
    });
    window.history.pushState({}, "", `/chats?pgId=${chat.pgId}`);
    setUnreadCounts((prev) => ({ ...prev, [chat.pgId]: 0 }));
  };

  // Handle message submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = e.target[0].value;
    if (!msg.trim()) return;
    socket.emit("send-message", {
      msg,
      currentUser: user._id,
      targetUser: targetedUserId,
      pgId: currentPgId,
    });
    e.target[0].value = "";
    if (!isDesktop) setIsSidebarOpen(false);
  };

  if (!user) return <NotLoggedIn />;

  return (
    <div className="fixed inset-0 top-16 bg-[var(--bg-primary)] text-[var(--text-primary)] flex overflow-hidden">
      {/* Sidebar + chats with unread */}
      <AnimatePresence>
        {(isSidebarOpen || isDesktop) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col w-64 md:w-72 lg:w-80 border-r border-[var(--card-border)] bg-[var(--card-bg)] p-4 h-full absolute md:relative z-40"
          >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-lg md:text-xl font-bold text-[var(--accent-highlight)]">
                Chats
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden text-[var(--text-primary)] hover:text-[var(--accent-highlight)]"
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

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {chats.map((chat, idx) => {
                const pg = pgDetails[chat.pgId] || {};
                const isActive = activePg?._id === chat._id;
                const other = chat.participants.find((id) => id !== user._id);

                return (
                  <motion.div
                    key={chat._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      onClick={() => !isActive && handleChatClick(chat)}
                      className={`p-3 rounded-lg font-medium flex justify-between items-center transition-all ${
                        isActive
                          ? "bg-[var(--card-hover)] text-[var(--navbar-text)] cursor-default shadow-lg"
                          : "cursor-pointer hover:bg-[var(--card-hover)] hover:text-[var(--navbar-text)] hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--bg-secondary)] flex-shrink-0">
                          <img
                            src={pg.images?.[0] || "/noImg.png"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--text-primary)] truncate">
                            {pg.name || "PG Chat"}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)] opacity-70 truncate">
                            {participantNames[other] || "Loading..."}
                          </p>
                        </div>
                      </div>
                      {console.log(unreadCounts)}
                      {unreadCounts[chat.pgId] > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {unreadCounts[chat.pgId]}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-0">
        {targetedUserId ? (
          <>
            {/* Chat Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 p-4 md:p-6 pb-2 border-b border-[var(--card-border)] bg-[var(--card-bg)]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[var(--btn-cyan)] rounded-full flex items-center justify-center">
                  <span className="text-[var(--bg-primary)] font-bold">
                    {pg?.name?.charAt(0)?.toUpperCase() || "P"}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-[var(--btn-cyan)]">
                    {pg?.name || "Chat"}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] opacity-70">
                    {participantNames[targetedUserId] || "Loading..."}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-4 min-h-0 custom-scrollbar">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-[var(--text-primary)]"
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
                          className={`flex ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl shadow-lg ${
                              isOwn
                                ? "bg-[var(--btn-cyan)] text-[var(--bg-primary)] rounded-br-md"
                                : "bg-[var(--card-bg)] text-[var(--text-primary)] rounded-bl-md border border-[var(--card-border)]"
                            }`}
                          >
                            <p className="text-sm md:text-base leading-relaxed">
                              {msg.message.message}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwn
                                  ? "text-[var(--bg-primary)] opacity-70"
                                  : "text-[var(--text-secondary)] opacity-50"
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

            {/* Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 bg-[var(--card-bg)] p-4 md:p-6 pt-4 border-t border-[var(--card-border)]"
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
                    className="w-full p-3 md:p-4 pr-12 rounded-2xl border border-[var(--card-border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--btn-cyan)] focus:outline-none resize-none text-sm md:text-base"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[var(--btn-cyan)] text-[var(--bg-primary)] p-3 md:p-4 rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all"
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
            className="flex-1 flex flex-col items-center justify-center text-[var(--text-primary)] p-8"
          >
            <div className="text-8xl mb-6">💬</div>
            <h3 className="text-xl md:text-2xl font-bold text-[var(--btn-cyan)] mb-2">
              Welcome to GradStay Chat
            </h3>
            <p className="text-base md:text-lg opacity-70 text-center max-w-md">
              Select a chat from the sidebar to start messaging with PG owners
            </p>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden mt-6 bg-[var(--btn-cyan)] text-[var(--bg-primary)] px-6 py-3 rounded-lg font-medium"
            >
              View Chats
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <p className="text-[var(--text)]">Loading chat...</p>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
