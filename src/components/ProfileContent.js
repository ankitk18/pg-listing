import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function ProfileContent({ activeSection, user, userPgs }) {
  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <ProfileOverview user={user} userPgs={userPgs} />;
      case "listings":
        return <MyListings userPgs={userPgs} />;
      case "settings":
        return <AccountSettings user={user} />;
      default:
        return <ProfileOverview user={user} userPgs={userPgs} />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}

function ProfileOverview({ user, userPgs }) {
  const stats = [
    { label: "PG Listings", value: userPgs?.length || 0, icon: "🏠" },
    {
      label: "Account Status",
      value: user?.isVerified ? "Verified" : "Unverified",
      icon: "✅",
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
          Welcome back, {user?.name?.split(" ")[0] || "User"}!
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-sm text-[var(--text-secondary)] opacity-70">
                  {stat.label}
                </p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Profile Details */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Profile Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[var(--text-secondary)] opacity-70">
              Full Name
            </label>
            <p className="text-[var(--text-primary)] font-medium">
              {user?.name || "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm text-[var(--text-secondary)] opacity-70">
              Email Address
            </label>
            <p className="text-[var(--text-primary)] font-medium">
              {user?.email || "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm text-[var(--text-secondary)] opacity-70">
              Phone Number
            </label>
            <p className="text-[var(--text-primary)] font-medium">
              {user?.phone || "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm text-[var(--text-secondary)] opacity-70">
              Account Status
            </label>
            <p
              className={`font-medium ${
                user?.isVerified ? "text-green-500" : "text-yellow-500"
              }`}
            >
              {user?.isVerified ? "Verified" : "Pending Verification"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/add-pg"
            className="flex items-center space-x-3 p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--card-hover)] transition-all"
          >
            <span className="text-2xl">🏠</span>
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                Add New PG
              </p>
              <p className="text-sm text-[var(--text-secondary)] opacity-70">
                List a new property
              </p>
            </div>
          </Link>
          <Link
            href="/chats"
            className="flex items-center space-x-3 p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--card-hover)] transition-all"
          >
            <span className="text-2xl">💬</span>
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                View Chats
              </p>
              <p className="text-sm text-[var(--text-secondary)] opacity-70">
                Check your messages
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function MyListings({ userPgs }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
          My PG Listings
        </h1>
        <Link
          href="/add-pg"
          className="bg-[var(--btn-cyan)] text-[var(--bg-primary)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all"
        >
          + Add New PG
        </Link>
      </div>

      {userPgs && userPgs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userPgs.map((pg, index) => (
            <motion.div
              key={pg._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="h-48 bg-[var(--bg-secondary)] flex items-center justify-center">
                {pg.images && pg.images.length > 0 ? (
                  <img
                    src={pg.images[0]}
                    alt={pg.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">🏠</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                  {pg.name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] opacity-70 mb-2">
                  Near {pg.nearByCollege}
                </p>
                <p className="text-lg font-bold text-[var(--btn-cyan)] mb-3">
                  ₹{pg.rent}/month
                </p>
                <div className="flex space-x-2">
                  <Link
                    href={`/chats?pgId=${pg._id}`}
                    className="flex-1 bg-[var(--bg-secondary)] text-[var(--text-primary)] py-2 px-3 rounded text-center text-sm hover:bg-[var(--card-hover)] transition-all"
                  >
                    View
                  </Link>
                  <button className="flex-1 bg-[var(--btn-cyan)] text-[var(--bg-primary)] py-2 px-3 rounded text-sm hover:opacity-90 transition-all">
                    Edit
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            No PG listings yet
          </h3>
          <p className="text-[var(--text-secondary)] opacity-70 mb-6">
            Start by adding your first PG listing to attract potential tenants
          </p>
          <Link
            href="/add-pg"
            className="bg-[var(--btn-cyan)] text-[var(--bg-primary)] px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all"
          >
            Add Your First PG
          </Link>
        </div>
      )}
    </div>
  );
}

function AccountSettings({ user }) {
  const [profilePicture, setProfilePicture] = useState(null);
  const  handleSubmit = async(e) => {
    e.preventDefault();
    // Handle form submission logic here
    const form = new FormData();
    if (profilePicture.length > 0) {
      alert(
        "Profile picture upload is currently not supported. Please try again later."
      );
      return;
    }
    form.append("file", profilePicture);
    const uploadResponse = await fetch("/api/uploadImage", {
      method: "POST",
      body: form,
    });
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      setError(errorData.message);
      console.error("Image upload failed:", errorData.message);
      return;
    }
    const uploadResult = await uploadResponse.json();
    const profilePictureUrl = uploadResult.url;
    const formData = new FormData(e.target);
    const updatedData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      profilePicture: profilePictureUrl || user.profilePicture || null,
    };
    if(user.name===updatedData.name && user.email===updatedData.email && user.phone===updatedData.phone && user.profilePicture===updatedData.profilePicture){
      alert("No changes made to update");
      return;
    }
    const res = await fetch(`/api/user/${user._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });
    if (res.ok) {
      alert("Profile updated successfully!");
      // Optionally, refresh the page or update state to reflect changes
      window.location.reload();
    } else {
      alert("Failed to update profile. Please try again.");
    }
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
        Account Settings
      </h1>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-6">
        <form onSubmit={(e) => handleSubmit(e)}>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                defaultValue={user?.name || ""}
                className="w-full p-3 border border-[var(--card-border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--btn-cyan)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                defaultValue={user?.email || ""}
                className="w-full p-3 border border-[var(--card-border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--btn-cyan)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                defaultValue={user?.phone || ""}
                className="w-full p-3 border border-[var(--card-border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--btn-cyan)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Profile Picture
              </label>
              <input
                type="File"
                name="profilePicture"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files[0])}
                className="w-full p-3 border border-[var(--card-border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--btn-cyan)] focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-6 bg-[var(--btn-cyan)] text-[var(--bg-primary)] px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
