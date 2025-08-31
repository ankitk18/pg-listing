"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import PgCard from "@/components/PgCard";
import Popup from "@/components/Popup";
import Link from "next/link";
import { socket } from "@/lib/socket";
import { getPgByPgId, getUserIdByPgId } from "@/hooks/useFunc";
import NotLoggedIn from "@/components/NotLoggedIn";

export default function PgSuggest() {
  const searchParams = useSearchParams();
  const collegeName = searchParams.get("collegeName");
  const [pgs, setPgs] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleClick = async (e, pgId) => {
    // Always prevent default navigation first
    e.preventDefault();
    //if user is not logged in, show not logged in component
    if (!localStorage.getItem("user")) {
      setIsLoggedIn(false);
      return;
    }
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const { user } = await getUserIdByPgId(pgId);
    const { pg } = await getPgByPgId(pgId);
    //popup if user and currentUser are same
    if (user._id === currentUser._id) {
      setShowPopup(true);
      return;
    }
    // If it's a valid chat, navigate manually
    socket.emit("join-chat", {
      currentUser: currentUser._id,
      targetUser: user._id,
      pgId: pgId,
      pgName: pg.name,
    });

    // Navigate to the chat page
    window.location.href = `/chats?pgId=${pgId}`;
  };
  useEffect(() => {
    fetch("/api/pg")
      .then((res) => res.json())
      .then((data) => setPgs(data))
      .catch((err) => console.error("Error fetching PGs:", err));
  }, []);
  useEffect(() => {
    if (!collegeName) return;
    const fetchPgs = async () => {
      try {
        const response = await fetch(
          `/api/pgByName?collegeName=${collegeName}`
        );
        const data = await response.json();
        setPgs(data);
      } catch (error) {
        console.error("Error fetching PGs:", error);
      }
    };
    fetchPgs();
  }, [collegeName]);
  return (
    <>
      {isLoggedIn ? (
        pgs ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pgs.map((pg) => (
                <Link
                  href={`/chats?pgId=${pg._id}`}
                  key={pg._id}
                  className="block"
                  onClick={(e) => handleClick(e, pg._id)}
                >
                  <PgCard key={pg.name} pg={pg} />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-screen">
            <p className="text-gray-500">Loading...</p>
          </div>
        )
      ) : (
        <NotLoggedIn />
      )}

      <Popup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        title="Cannot Start Chat"
        message="You cannot chat with yourself. Please select a different PG to start a conversation."
      />
    </>
  );
}
