import Link from "next/link";
import { motion } from "framer-motion";

export default function ProfileSidebar({
  user,
  userPgs,
  activeSection,
  setActiveSection,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  const sidebarItems = [
    {
      id: "overview",
      label: "Profile Overview",
      icon: "👤",
      count: null,
    },
    {
      id: "listings",
      label: "My PG Listings",
      icon: "🏠",
      count: userPgs?.length || 0,
    },
    {
      id: "settings",
      label: "Account Settings",
      icon: "⚙️",
      count: null,
    },
  ];

  const handleItemClick = (sectionId) => {
    setActiveSection(sectionId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-64 md:w-72 lg:w-80 border-r border-[var(--card-border)] bg-[var(--card-bg)] p-4 h-full absolute md:relative z-40"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h2 className="text-lg md:text-xl font-bold text-[var(--accent-highlight)]">
          Profile
        </h2>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden text-[var(--text-primary)] hover:text-[var(--accent-highlight)]"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      {/* User Info Card */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 mb-6 border border-[var(--card-border)]">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[var(--btn-cyan)] rounded-full">
            <span className="text-[var(--bg-primary)] font-bold text-lg">
              {user?.profilePicture ? (
                <img
                  src={user?.profilePicture}
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                user?.name.charAt(0).toUpperCase()
              )}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--text-primary)] truncate">
              {user?.name || "User"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] opacity-70 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <motion.div layout className="space-y-2">
          {sidebarItems.map((item, index) => {
            const isActive = activeSection === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full p-3 rounded-lg font-medium transition-all text-left ${
                    isActive
                      ? "bg-[var(--card-hover)] text-[var(--navbar-text)] shadow-lg"
                      : "hover:bg-[var(--card-hover)] hover:text-[var(--navbar-text)] hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.count !== null && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isActive
                            ? "bg-[var(--bg-primary)] text-[var(--btn-cyan)]"
                            : "bg-[var(--card-border)] text-[var(--text-secondary)]"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0 pt-4 border-t border-[var(--card-border)]">
        <Link
          href="/add-pg"
          className="w-full bg-[var(--btn-cyan)] text-[var(--bg-primary)] p-3 rounded-lg font-medium text-center block hover:opacity-90 transition-all"
        >
          + Add New PG
        </Link>
      </div>
    </motion.div>
  );
}
