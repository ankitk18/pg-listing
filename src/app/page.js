"use client";
import PgCard from "@/components/PgCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { getUserIdByPgId } from "@/hooks/useFunc";

export default function Home() {
  const [pgs, setPgs] = useState(null);
  const handleClick = async (pgId) => {
    if(!localStorage.getItem("user")) {
      return <NotLoggedIn />;
    }
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const {user} = await getUserIdByPgId(pgId);
    socket.emit("join-chat", {
      currentUser: currentUser._id,
      targetUser: user._id,
      pgId: pgId
    });

  }
  useEffect(() => {
    fetch("/api/pg")
      .then((res) => res.json())
      .then((data) => setPgs(data))
      .catch((err) => console.error("Error fetching PGs:", err));
  }, []);
  return pgs ? (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pgs.map((pg) => (
          <Link href={`/chats?pgId=${pg._id}`} key={pg._id} className="block" onClick={() => handleClick(pg._id)}>
            <PgCard key={pg.name} pg={pg} />
          </Link>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Loading...</p>
    </div>
  );
}
