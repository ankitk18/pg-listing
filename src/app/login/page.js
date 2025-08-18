"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {useLogin} from "@/hooks/useLogin";
export default function LoginPage() {
  const { login, error, loading } = useLogin();
  const handleLogin = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");
    const success = await login(email, password);
    if (success) {
      window.location.href = "/";
    }
    event.target.reset();
  };
  return (
    <div className="flex justify-center bg-[var(--bg)] text-[var(--text)] p-4 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-8"
      >
        <h1 className="text-center text-4xl font-extrabold text-[var(--highlight)] mb-8 drop-shadow">
          📝 Log In
        </h1>

        <form className="space-y-4" onSubmit={handleLogin}>
          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="📧 Email Address"
            className="w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] placeholder:text-gray-400"
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="🔐 Password"
            className="w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] placeholder:text-gray-400"
            required
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="w-full bg-[var(--highlight)] text-[var(--bg)] py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition"
          >
            🚀 Log In
          </motion.button>
          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-2">
              {error}
            </p>
          )}
        </form>
        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-400 mt-4">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-[var(--highlight)] font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
