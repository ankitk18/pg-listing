import { motion, AnimatePresence } from "framer-motion";

export default function Popup({ isOpen, onClose, title, message }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Popup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          style={{
            background: "#232f4b", // --dropdown
            color: "#ffffff", // --text
            border: "2px solid #b3c2ff", // --border
          }}
          className="relative max-w-md w-full mx-4 p-6 rounded-lg shadow-xl"
        >
          {/* Icon and Title */}
          <div className="flex items-center mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
              style={{ color: "#f9e88d" }} // --highlight
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {title && (
              <h3
                className="text-lg font-semibold"
                style={{ color: "#ffffff" }}
              >
                {title}
              </h3>
            )}
          </div>

          {/* Message */}
          <p
            className="mb-6 text-sm leading-relaxed"
            style={{ color: "#ffffff" }}
          >
            {message}
          </p>

          {/* Button */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                background: "#f9e88d", // --highlight
                color: "#1c263b", // --bg
              }}
              className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              OK
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
