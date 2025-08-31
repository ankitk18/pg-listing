"use client";
import { motion } from "framer-motion";
import { useState, useEffect, use } from "react";
export default function ProfilePage() {
  const [collegeName, setCollegeName] = useState("");
  const [debounceCollegeName, setDebounceCollegeName] = useState("");
  const [results, setResults] = useState([]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceCollegeName(collegeName);
    }, 500);
    return () => clearTimeout(timer);
  }, [collegeName]);
  useEffect(() => {
    if (debounceCollegeName.trim() === "") {
      setResults([]);
      return;
    }
    const fetchColleges = async () => {
      try {
        const response = await fetch(
          `/api/college?collegeName=${debounceCollegeName}`
        );
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching colleges:", error);
      }
    };
    fetchColleges();
  }, [debounceCollegeName]);
  return (
    <div>
      <div className="fixed flex h-full w-full bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-elevated)] rounded-b-4xl items-center flex-col">
        <h1 className="mt-20 text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-2xl backdrop-blur-sm">
          A simpler way to find PG
        </h1>
        <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl flex items-center mt-10 mx-4 p-3 sm:p-4 rounded-full bg-white/10 text-white placeholder-white border border-white/20 gap-2 sm:gap-4 md:gap-6">
          <input
            type="text"
            placeholder="Search for PGs near your college..."
            className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 outline-none text-white placeholder-white text-sm sm:text-base"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
          />
          <button
            onClick={() => (window.location.href = `/pg?collegeName=${collegeName}`)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 md:px-6 rounded-full shadow-lg transition whitespace-nowrap text-sm sm:text-base"
          >
            Search
          </button>
        </div>
        {results.length > 0 && (
          <ul className="mt-6 border border-gray-300 rounded-md p-4 w-3xl max-h-60 overflow-y-auto bg-[var(--bg)] text-[var(--text)] mb-4">
            {results.map((college) => (
              <li
                key={college._id}
                className="mb-2 cursor-pointer hover:text-[var(--highlight)]"
                onClick={() => {
                  setCollegeName(college.name);
                  setResults([]);
                }}
              >
                {college.name} - {college.city}, {college.state}
              </li>
            ))}
          </ul>
        )}
        <h1 className="flex flex-col items-center mt-15 text-center">
          <span className="text-lg md:text-xl lg:text-2xl font-medium text-white/70 mt-4 drop-shadow-2xl backdrop-blur-sm">
            Find your perfect PG in just a few clicks!
          </span>
        </h1>
        <h1 className="mt-10 text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-2xl backdrop-blur-sm">
          List your PG for free!
        </h1>
        <div className="mt-4 text-center">
          <span className="text-lg md:text-xl lg:text-2xl font-medium text-white/70 drop-shadow-2xl backdrop-blur-sm">
            Join our community of PG owners and reach thousands of students.
          </span>
        </div>
        <button
          className="mt-6 bg-[var(--btn-cyan)] hover:bg-[var(--btn-hover)] text-white font-semibold py-2 px-4 md:px-6 rounded-full shadow-lg transition text-lg md:text-xl lg:text-2xl"
          onClick={() => (window.location.href = "/add-pg")}
        >
          List Your PG
        </button>
      </div>
    </div>
  );
}
