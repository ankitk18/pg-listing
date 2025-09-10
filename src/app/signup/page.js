"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSignup } from "@/hooks/useSignup";
import validator from "validator";

export default function SignupPage() {
  const { signup, error, loading } = useSignup();
  const [success, setSuccess] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState("");

  // Set page title
  useEffect(() => {
    document.title = "Sign Up - GradStay";
  }, []);
  const handleChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const { name, email, password, phone, profilePicture } = data;
    const form = new FormData();
    if(profilePicture.length > 0){
      alert("Profile picture upload is currently not supported. Please try again later.");
      return;
     }
    if(profilePicture){
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
    }
    const profilePictureUrl = null; // Default to null if no picture is uploaded
    // Validate email and password strength
    if (!validator.isEmail(email)) {
      setSuccess(null);
      return alert("Please enter a valid email address.");
    }
    if (!validator.isStrongPassword(password)) {
      setSuccess(null);
      setPasswordStrength("Password is not strong enough. It should be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols.");
      return;
    }
    signup(name, email, password, phone, profilePictureUrl)
      .then(() => {
        if (!error){
      setSuccess("Account created successfully!")
      setTimeout(() => {
        window.location.href = "/";
      }, 500);}
      })
      .catch(() => setSuccess(null));
    event.target.reset();
  };
  return (
    <div className="min-h-full min-w-full flex items-center justify-center bg-[var(--bg)] text-[var(--text)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-8"
      >
        <h1 className="text-center text-4xl font-extrabold text-[var(--highlight)] mb-8 drop-shadow">
          📝 Sign Up
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="👤 Full Name"
            className="w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] placeholder:text-gray-400"
            required
          />

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

          {/* Phone */}
          <input
            type="number"
            name="phone"
            placeholder="📱 Phone Number"
            className="w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] placeholder:text-gray-400"
            required
          />

          {/* Profile Picture (Optional) */}
          <input
            type="File"
            name="profilePicture"
            accept="image/*"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] placeholder:text-gray-400"
          />

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
            className="w-full bg-[var(--highlight)] text-[var(--bg)] py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition"
          >
            🚀 Create Account
          </motion.button>
          {/* Error Message */}
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          {/* Password Strength Message */}
          {passwordStrength && (
            <p className="text-yellow-500 text-center mt-4">{passwordStrength}</p>
          )}
          {/* Success Message */}
          {success && (
            <p className="text-green-500 text-center mt-4">{success}</p>
          )}
        </form>
      </motion.div>
    </div>
  );
}
