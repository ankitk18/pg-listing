"use client";
import { useState, useEffect } from "react";
export default function Home() {
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
    <div className="fixed flex h-full justify-center w-full bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-elevated)]">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        {/* Main heading */}
        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-2xl backdrop-blur-sm text-center mb-8 sm:mb-10">
          A simpler way to find PG
        </h1>

        {/* Search container */}
        <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl relative">
          <div className="flex items-center p-3 sm:p-4 rounded-full bg-white/10 text-white placeholder-white border border-white/20 gap-2 sm:gap-4">
            <input
              type="text"
              placeholder="Search for PGs near your college..."
              className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 outline-none text-white placeholder-white text-sm sm:text-base"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
            />
            <button
              onClick={() =>
                (window.location.href = `/pg?collegeName=${collegeName}`)
              }
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 md:px-6 rounded-full shadow-lg transition whitespace-nowrap text-sm sm:text-base"
            >
              Search
            </button>
          </div>

          {/* Search results dropdown */}
          {results.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-2 border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto bg-[var(--bg)] text-[var(--text)] z-10 shadow-lg">
              {results.map((college) => (
                <li
                  key={college._id}
                  className="mb-2 p-2 cursor-pointer hover:text-[var(--highlight)] hover:bg-white/5 rounded transition-colors"
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
        </div>

        {/* Subtitle */}
        <div className="text-center mt-6 sm:mt-8">
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-white/70 drop-shadow-2xl backdrop-blur-sm">
            Find your perfect PG in just a few clicks!
          </span>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 sm:mt-16 lg:mt-20">
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-2xl backdrop-blur-sm mb-4">
            List your PG for free!
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-white/70 drop-shadow-2xl backdrop-blur-sm mb-6 px-4">
            Join our community of PG owners and reach thousands of students.
          </p>
          <button
            className="bg-[var(--btn-cyan)] hover:bg-[var(--btn-hover)] text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 md:px-10 rounded-full shadow-lg transition text-base sm:text-lg md:text-xl lg:text-2xl"
            onClick={() => (window.location.href = "/add-pg")}
          >
            List Your PG
          </button>
        </div>
      </div>
    </div>
  );
}
