"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserByUserId } from "@/hooks/useFunc";

const profileMenuItems = ["My Profile", "Inbox", "Help", "Sign Out"];
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
  const handeleAction = (label) => {
    switch (label) {
      case "Sign Out":
        handleSignOut();
        break;
      case "My Profile":
        window.location.href = "/profile";
        break;
      case "Inbox":
        window.location.href = "/chats";
        break;
      case "Help":
        window.location.href = "/";
        break;
      default:
        return;
    }
  };
  return (
    <div className="relative profile-menu">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-[var(--navbar-border)] px-3 py-1 text-[var(--navbar-text)]"
      >
        <span className="h-8 w-8 rounded-full bg-[var(--bg-accent)] flex items-center justify-center text-sm font-bold text-[var(--navbar-text)]">
          {user.user.profilePicture ? (
            <img
              src={user?.user?.profilePicture}
              alt="Profile"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            user?.user?.name.charAt(0).toUpperCase()
          )}
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
            className="absolute right-0 z-10 mt-4 w-40 rounded-md border border-[var(--card-border)] bg-[var(--navbar-bg)] shadow-lg text-[var(--text-primary)] overflow-hidden"
          >
            {profileMenuItems.map((label) => (
              <motion.li
                key={label}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(false)}
                onMouseDown={() => handeleAction(label)}
                className={`px-4 py-2 text-sm font-bold cursor-pointer hover:bg-[var(--navbar-hover)] transition ${
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
        className="px-4 py-2 rounded-full font-bold text-[var(--navbar-text)] bg-[var(--bg-accent)] hover:bg-[var(--navbar-hover)] shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-highlight)]"
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
  const [user, setUser] = useState(null);
  // outside click handler to close mobile nav
  useEffect(() => {
    if (localStorage.getItem("user")) {
      const parsedUser = JSON.parse(localStorage.getItem("user"));
      const fetchUser = async (userId) => {
        try {
          const userData = await getUserByUserId(userId);
          setUser(userData.user);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      };
      fetchUser(parsedUser._id);
    }
  }, []);

  return (
    <nav className="relative z-50 max-w-screen mx-auto px-4 py-3 flex items-center justify-between bg-[var(--navbar-bg)] text-[var(--navbar-text)]">
      {/* LEFT: Logo */}
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="UNINEST Logo"
          width={40}
          height={40}
          className="rounded-full"
        />
        <span className="text-2xl font-semibold text-[var(--navbar-text)]">
          GRADSTAY
        </span>
      </Link>

      <div className="hidden lg:flex flex-1 justify-center">
        <NavList />
      </div>
      {/* RIGHT: Profile and Menu */}
      <div className="mobNav flex items-center gap-4">
        {!user ? (
          <Link href="/login">
            <motion.button
              className="text-sm font-bold hover:underline bg-[var(--navbar-hover)] px-2 py-1 rounded text-[var(--navbar-text)]"
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Log In
            </motion.button>
          </Link>
        ) : (
          <div className="flex items-center gap-4">
            <div className="lg:hidden text-[var(--navbar-text)] w-full flex justify-end gap-4">
              <Link href="/chats" className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                  />
                </svg>
              </Link>
              <Link href="/add-pg" className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-8"
                >
                  <path d="M19 12h2l-9 -9l-9 9h2v7a2 2 0 0 0 2 2h5.5" />
                  <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2" />
                  <path d="M16 19h6" />
                  <path d="M19 16v6" />
                </svg>
              </Link>
            </div>
            <ProfileMenu user={user} />
          </div>
        )}
      </div>
    </nav>
  );
}
