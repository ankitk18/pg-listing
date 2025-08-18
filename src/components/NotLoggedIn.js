"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export default function NotLoggedIn() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-2xl bg-white/5 border border-[var(--border)] shadow-xl text-center p-8 space-y-6"
      >
        <div className="flex justify-center">
          <div className="bg-orange-100 rounded-full p-4">
            <ShieldAlert className="text-orange-500 w-8 h-8" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[var(--text)]">
          Authentication Required
        </h1>
        <p className="text-gray-400 text-sm">
          You need to be logged in to view this content.
          <br />
          Please login to continue.
        </p>

        <Link
          href="/login"
          className="w-full inline-block bg-[var(--highlight)] text-[var(--bg)] font-bold py-3 rounded-xl transition hover:opacity-90"
        >
          → Login
        </Link>

        <p className="text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-[var(--highlight)] font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
