"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";

const profileMenuItems = [
  "My Profile",
  "Edit Profile",
  "Inbox",
  "Help",
  "Sign Out",
];
// ProfileMenu component for user profile dropdown
function ProfileMenu(user) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-menu")) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);
  const handleSignOut = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };
  return (
    <div className="relative profile-menu">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 bg-[var(--hover)] text-[var(--text)]"
      >
        <span className="h-8 w-8 rounded-full bg-[var(--highlight)] flex items-center justify-center text-sm font-bold text-[var(--bg)]">
          {user?.user?.charAt(0).toUpperCase()}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-sm"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            key="dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-10 mt-4 w-40 rounded-md border border-[var(--border)] bg-[var(--dropdown)] shadow-lg text-[var(--text)] overflow-hidden"
          >
            {profileMenuItems.map((label) => (
              <motion.li
                key={label}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(false)}
                onMouseDown={label === "Sign Out" ? handleSignOut : null}
                className={`px-4 py-2 text-sm font-bold cursor-pointer hover:bg-[var(--hover)] transition ${
                  label === "Sign Out" ? "text-red-500" : ""
                }`}
              >
                {label}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// Navigation items for the navbar
const navItems = [
  { label: "Chats", href: "/chats" },
  { label: "Profile", href: "/profile" },
  { label: "Add PG", href: "/add-pg" },
];
function AnimatedNavItem({ label, href }) {
  return (
    <motion.div
      whileTap={{ scale: 1.1 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link
        href={href}
        className="px-4 py-2 rounded-full font-bold text-[var(--text)] hover:bg-[var(--hover)] shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
      >
        {label}
      </Link>
    </motion.div>
  );
}

function NavList() {
  return (
    <ul className="flex flex-col lg:flex-row gap-3 lg:items-center text-[20px]">
      {navItems.map(({ label, href }) => (
        <li key={label}>
          <AnimatedNavItem label={label} href={href} />
        </li>
      ))}
    </ul>
  );
}

export default function ComplexNavbar() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [user, setUser] = useState(null);
  useEffect(() => {
    if(localStorage.getItem("user")) {
      setUser(JSON.parse(localStorage.getItem("user")));
    }
  }, []);

  return (
    <nav className="relative z-50 max-w-screen mx-auto px-4 py-3 flex items-center justify-between bg-[var(--primary)] text-[var(--text)]">
      {/* LEFT: Logo */}
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="UNINEST Logo"
          width={40}
          height={40}
          className="rounded-full"
        />
        <span className="text-2xl font-semibold text-[var(--nav-text)]">
          GRADSTAY
        </span>
      </Link>

      <div className="hidden lg:flex flex-1 justify-center">
        <NavList />
      </div>
      {/* RIGHT: Profile and Menu */}
      <div className="flex items-center gap-4">
        {!user ? (
          <Link href="/login">
            <motion.button
              className="text-sm font-bold hover:underline bg-[var(--hover)] px-2 py-1 rounded text-[var(--text)]"
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Log In
            </motion.button>
          </Link>
        ) : (
          <ProfileMenu user={user.name}/>
        )}
        {user && (
          <button
            onClick={() => setIsNavOpen((prev) => !prev)}
            className="lg:hidden px-2 py-1 rounded border border-[var(--border)] text-xl font-bold bg-[var(--hover)]"
          >
            {isNavOpen ? "Close" : "Menu"}
          </button>
        )}
      </div>

      {/* MOBILE NAV */}
      {isNavOpen && (
        <div className="absolute flex items-center justify-center top-full right-4 mt-2 w-auto rounded-md border border-[var(--border)] bg-[var(--dropdown)] shadow-lg p-3 lg:hidden">
          <NavList />
        </div>
      )}
    </nav>
  );
}
