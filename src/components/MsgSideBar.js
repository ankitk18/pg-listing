import Link from "next/link";
import { socket } from "@/lib/socket";

export default function SidebarMsg({ chats }) {
  const handleClick = (chat) => {
    const targetedUserId = chat.participants.find(
      (user) => user !== JSON.parse(localStorage.getItem("user"))._id
    );
    const currentUser = JSON.parse(localStorage.getItem("user"))._id;
    const targetedPgId = chat.pgId;
    // Join the chat room for the selected conversation

    socket.emit("join-chat", {
      currentUser: currentUser,
      targetUser: targetedUserId,
      pgId: targetedPgId,
    });
  };
  return (
    <div key={chats?.userId} className=" flex flex-col w-64 border-r border-[var(--border)] bg-[var(--dropdown)] p-4">
      <h2 className="text-lg font-bold text-[var(--highlight)] mb-4">Chats</h2>
        {chats.length != 0 ? (chats.map((chat) => (
          <Link
            href={`/chats?pgId=${chat.pgId}`}
            key={chat.pgId}
            onClick={() => handleClick(chat)}
            className="p-2 rounded mr-1.5 cursor-pointer font-bold hover:bg-[var(--hover)]  hover:text-[var(--nav-text)] transition-all"
          >
            {chat.pgId}
          </Link>
        ))):(
          <p>No chats</p>
        )}
    </div>
  );
}
