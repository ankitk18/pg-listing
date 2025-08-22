"use client";
import React, { Suspense } from "react";
import { useState, useEffect } from "react";
import { getUserByUserId, getUserIdByPgId } from "@/hooks/useFunc";
import { useRouter, useSearchParams } from "next/navigation";
import { socket } from "@/lib/socket";
import NotLoggedIn from "@/components/NotLoggedIn";
import WholeChatPage from "@/components/WholeChatPage";

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pgId = searchParams.get("pgId"); // Get target pg ID from URL
  const [targetedUserId, setTargetedUserId] = useState(null);
  const [targetedPgId, setTargetedPgId] = useState(pgId);
  const [targetedUser, setTargetedUser] = useState(null); // Full user object from API
  const [chats, setChats] = useState([]); // List of chat conversations
  const [message, setMessage] = useState([]); // Messages for current chat
  const [user, setUser] = useState(null); // Current logged-in user
  // Initialize user on component mount
  useEffect(() => {
    if (localStorage.getItem("user")) {
      setUser(JSON.parse(localStorage.getItem("user")));
    }
  }, []);

  // Set up socket listeners once
  useEffect(() => {
    // Listen for incoming messages
    socket.on("receive-message", (msg) => {
      // Add new message to chat history
      setMessage((prevMessages) => [...prevMessages, msg]);
    });

    // Cleanup socket listener on unmount
    return () => {
      socket.off("receive-message");
      socket.off("chat-joined");
    };
  }, []);

  // Fetch chats when user is available
  useEffect(() => {
    if (!user) return; // Wait for user to be set
    const currentUser = JSON.parse(localStorage.getItem("user"))._id;
    const allChats = async () => {
      try {
        const response = await fetch(`/api/chats/${currentUser}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch chats");
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    allChats();
  }, [user]);
  useEffect(() => {
    //reload page when chats changed
  }, [chats]);
  // Handle target user changes from URL parameter
  useEffect(() => {
    if (pgId) {
      setTargetedPgId(pgId);
      // Fetch user details from API
      getUserIdByPgId(pgId)
        .then((data) => {
          setTargetedUser(data.user);
          setTargetedUserId(data.user._id);
        })
        .catch((error) => {
          console.error("Failed to fetch user:", error);
          setTargetedUser(null);
        });

      setMessage([]); // Clear messages when switching users
    } else {
      setTargetedUser(null);
    }
  }, [pgId]);
  useEffect(() => {
    if (pgId) {
      // remove query param from URL after refresh
      router.replace("/chats");
    }
  }, [pgId, router]);
  useEffect(() => {
    const allMessages = async () => {
      const currentUser = user._id;
      try {
        const response = await fetch(
          `/api/chats/message?currentUser=${currentUser}&targetedUserId=${targetedUserId}&targetedPgId=${targetedPgId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data = await response.json();
        setMessage(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    if (user && targetedUserId && targetedPgId) {
      allMessages();
    }
  }, [user, targetedUserId, targetedPgId]);

  return user ? (
    <div className="h-full">
      {chats ? (
        <WholeChatPage
          chats={chats}
          messages={message}
          user={user}
          toSendUser={targetedUserId}
          setToSendUser={setTargetedUserId}
          pgId={targetedPgId}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-[var(--text)]">
          <p className="text-lg">Select a chat to start messaging</p>
        </div>
      )}
    </div>
  ) : (
    <NotLoggedIn />
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
