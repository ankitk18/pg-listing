import { motion } from "framer-motion";

export default function RenderChat({ messages, user }) {
  return messages.length === 0 ? (
    <div key={ user.userId} className="flex-1 flex items-center justify-center text-[var(--text)]">
      <p className="text-lg">No messages yet</p>
    </div>
  ) : (
    <main className="flex-1 p-6 w-full flex flex-col">
      <h2 className="text-xl font-bold text-[var(--highlight)] mb-4">
        {user.name}'s Chat
      </h2>
      {/* Messages and Form Container */}
      <div className="flex flex-col flex-1 space-y-2">
        {messages.map((msg, index) => {
          return user.name === msg.sender ? (
            <div key={index} className="flex items-center justify-end">
              <div className="bg-[var(--hover)] text-[var(--text)] rounded-lg p-2 max-w-xs">
                {msg.text}
              </div>
            </div>
          ) : (
            <div key={index} className="flex items-center">
              <div className="bg-[var(--hover)] text-[var(--text)] rounded-lg p-2 max-w-xs">
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
