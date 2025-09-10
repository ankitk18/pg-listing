import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { socket } from "@/lib/socket";
import { getPgByPgId, getUserByUserId } from "@/hooks/useFunc";

export default function SidebarMsg({ chats, currentPgId }) {
  const [participantNames, setParticipantNames] = useState({});
  const [pgDetails, setPgDetails] = useState({});
  const [user, setUser] = useState(null);

  // Get current user
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Function to fetch user name by ID
  const getUserName = async (userId) => {
    if (participantNames[userId]) return participantNames[userId];

    try {
      const data = await getUserByUserId(userId);
      const name = data.user?.name || "Unknown User";
      setParticipantNames((prev) => ({ ...prev, [userId]: name }));
      return name;
    } catch (error) {
      console.error("Error fetching user name:", error);
      return "Unknown User";
    }
  };

  // Function to fetch PG details by ID
  const getPgDetails = async (pgId) => {
    if (pgDetails[pgId]) return pgDetails[pgId];

    try {
      const data = await getPgByPgId(pgId);
      const pg = data.pg || {};

      setPgDetails((prev) => ({ ...prev, [pgId]: pg }));
      return pg;
    } catch (error) {
      console.error("Error fetching PG details:", error);
      return {};
    }
  };

  // Fetch participant names and PG details when chats change
  useEffect(() => {
    const fetchChatData = async () => {
      if (!chats || !user) return;

      const uniqueUserIds = new Set();
      const uniquePgIds = new Set();

      // Collect all unique participant IDs and PG IDs
      chats.forEach((chat) => {
        uniquePgIds.add(chat.pgId);
        chat.participants.forEach((participantId) => {
          if (participantId !== user._id) {
            uniqueUserIds.add(participantId);
          }
        });
      });

      // Fetch names for all unique user IDs
      for (const userId of uniqueUserIds) {
        if (!participantNames[userId]) {
          await getUserName(userId);
        }
      }

      // Fetch details for all unique PG IDs
      for (const pgId of uniquePgIds) {
        if (!pgDetails[pgId]) {
          await getPgDetails(pgId);
        }
      }
    };

    fetchChatData();
  }, [chats, user]);

  const handleClick = (chat) => {
    const targetedUserId = chat.participants.find(
      (userId) => userId !== user._id
    );
    const currentUserId = user._id;
    const targetedPgId = chat.pgId;
    const pg = pgDetails[targetedPgId];

    // Join the chat room for the selected conversation
    socket.emit("join-chat", {
      currentUser: currentUserId,
      targetUser: targetedUserId,
      pgId: targetedPgId,
      pgName: pg?.name || "PG Chat",
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col w-64 md:w-72 lg:w-80 border-r border-[var(--card-border)] bg-[var(--card-bg)] p-4">
        <h2 className="text-lg md:text-xl font-bold text-[var(--accent-highlight)] mb-4">
          Chats
        </h2>
        <div className="text-center py-8">
          <p className="text-[var(--text-primary)] opacity-70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-64 md:w-72 lg:w-80 border-r border-[var(--card-border)] bg-[var(--card-bg)] p-4 h-full">
      <h2 className="text-lg md:text-xl font-bold text-[var(--accent-highlight)] mb-4">
        Chats
      </h2>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chats && chats.length > 0 ? (
          <motion.div layout className="space-y-2">
            {chats.map((chat, index) => {
              const pg = pgDetails[chat.pgId] || {};
              const isActive = currentPgId === chat.pgId;
              const otherParticipant = chat.participants.find(
                (id) => id !== user._id
              );
              const participantName =
                participantNames[otherParticipant] || "Loading...";

              return (
                <motion.div
                  key={chat._id}
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
                        ? "bg-[var(--card-hover)] text-[var(--navbar-text)] cursor-default shadow-lg"
                        : "cursor-pointer hover:bg-[var(--card-hover)] hover:text-[var(--navbar-text)] hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* PG Image */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--bg-secondary)] flex-shrink-0">
                        <img
                          src={pg.images?.[0] || "/noImg.png"}
                          alt={pg.name || "PG"}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--text-primary)] truncate">
                          {pg.name || "PG Chat"}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)] opacity-70 truncate">
                          {participantName}
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
            <div className="text-4xl mb-4">💬</div>
            <p className="text-[var(--text-primary)] opacity-70 mb-2">
              No chats available
            </p>
            <p className="text-sm text-[var(--text-secondary)] opacity-50">
              Start a conversation with a PG owner
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
