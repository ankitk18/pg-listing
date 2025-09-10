"use client";
import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import NotLoggedIn from "@/components/NotLoggedIn";
import ProfileSidebar from "@/components/ProfileSidebar";
import ProfileContent from "@/components/ProfileContent";
import { getUserByUserId } from "@/hooks/useFunc";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userPgs, setUserPgs] = useState([]);
  const [activeSection, setActiveSection] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set page title
  useEffect(() => {
    document.title = "Profile - GradStay";
  }, []);

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    // Set initial value
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize user on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      const fetchUser = async (userId) => {
        try {
          const { user } = await getUserByUserId(userId);
          if (user) {
            setUser(user);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      };
      fetchUser(parsedUser._id);
      fetchUserPgs(parsedUser._id);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user's PG listings
  const fetchUserPgs = async (userId) => {
    try {
      const response = await fetch("/api/pg", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch PGs");

      const allPgs = await response.json();
      // Filter PGs by user ID
      const userSpecificPgs = allPgs.filter((pg) => pg.userId === userId);
      setUserPgs(userSpecificPgs);
    } catch (error) {
      console.error("Error fetching user PGs:", error);
      setUserPgs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--btn-cyan)] mx-auto mb-4"></div>
          <p className="text-[var(--text-primary)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <NotLoggedIn />;
  }

  return (
    <div className="fixed inset-0 top-16 bg-[var(--bg-primary)] text-[var(--text-primary)] flex overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-20 right-0 mr-3 z-50 bg-[var(--bg-accent)] text-[var(--bg-primary)] p-2 rounded-lg shadow-lg"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || isDesktop) && (
          <ProfileSidebar
            user={user}
            userPgs={userPgs}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isSidebarOpen && !isDesktop && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ProfileContent
          activeSection={activeSection}
          user={user}
          userPgs={userPgs}
        />
      </div>
    </div>
  );
}
