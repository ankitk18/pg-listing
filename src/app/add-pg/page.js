"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NotLoggedIn from "@/components/NotLoggedIn";

export default function AddPgPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      setUser(JSON.parse(localStorage.getItem("user")));
    }
  }, []);

  // Set page title
  useEffect(() => {
    document.title = "Add PG - GradStay";
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [images, setImages] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    nearByCollege: "",
    address: "",
    rent: "",
    description: "",
    images: "",
    amenities: [],
  });
  const amenitiesList = [
    "WiFi",
    "AC",
    "Laundry",
    "Food",
    "Parking",
    "security",
    "Gym",
    "Cleaning",
    "Power Backup",
    "Refrigerator",
    "Microwave",
    "Water Purifier",
    "TV",
    "Balcony",
    "Pet Friendly",
  ];
  const [error, setError] = useState(null);
  const handleAmenityChange = (event) => {
    const selectedAmenity = event.target.value;
    //unckeck logic
    if (formData.amenities.includes(selectedAmenity)) {
      setFormData((prevData) => ({
        ...prevData,
        amenities: prevData.amenities.filter(
          (amenity) => amenity !== selectedAmenity
        ),
      }));
      return;
    }
    setFormData((prevData) => ({
      ...prevData,
      amenities: [...prevData.amenities, selectedAmenity],
    }));
  };
  //file handling
  const handleFileChange = (event) => {
    const files = event.target.files;
    setImages(files);
  };
  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const form = new FormData();
    if (!images || images.length === 0) {
      setError("Please upload an image.");
      setIsSubmitting(false);
      return;
    }
    if (images.length > 1) {
      setError("Please upload only one image.");
      setIsSubmitting(false);
      return;
    }
    form.append("file", images[0]);
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
    const uploadData = await uploadResponse.json();
    setFormData((prevData) => ({
      ...prevData,
      images: uploadData.url,
    }));
    const response = await fetch("/api/pg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        userId: user._id,
        images: uploadData.url,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      setSuccess("PG listing added successfully!");
      setFormData({
        name: "",
        nearByCollege: "",
        address: "",
        rent: "",
        description: "",
        images: "",
        amenities: [],
      });
      setError(null);
      // Reset the form data
      document.querySelector("form").reset();
    }
    if (!response.ok) {
      setSuccess(null);
      const errorData = await response.json();
      setError(errorData.message);
    }
  };
  return user ? (
    <main className="min-h-full bg-gradient-to-br from-[#1a2238] via-[#232f4b] to-[#0f172a] text-[var(--text)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-3xl bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-8"
      >
        <h1 className="text-center text-4xl font-extrabold text-[var(--highlight)] mb-8 drop-shadow">
          🏠 Add PG Listing
        </h1>

        <form className="grid gap-6">
          {[
            { name: "name", type: "text", placeholder: "🏡 PG Name" },
            {
              name: "nearByCollege",
              type: "text",
              placeholder: "🎓 Nearby College",
            },
            { name: "address", type: "text", placeholder: "📍 Full Address" },
            {
              name: "rent",
              type: "number",
              placeholder: "💰 Monthly Rent (₹)",
            },
          ].map(({ name, type, placeholder }) => (
            <input
              key={name}
              name={name}
              type={type}
              placeholder={placeholder}
              onChange={(e) => {
                if (name === "name")
                  setFormData({ ...formData, name: e.target.value });
                if (name === "nearByCollege")
                  setFormData({ ...formData, nearByCollege: e.target.value });
                if (name === "address")
                  setFormData({ ...formData, address: e.target.value });
                if (name === "rent")
                  setFormData({ ...formData, rent: e.target.value });
              }}
              required
              className="w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--highlight)] focus:outline-none placeholder:text-gray-400 transition"
            />
          ))}

          <textarea
            name="description"
            placeholder="📝 Description"
            required
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows="4"
            className="w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] h-24 border border-[var(--border)] focus:ring-2 focus:ring-[var(--highlight)] focus:outline-none placeholder:text-gray-400"
          />

          <input
            type="file"
            name="images"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] placeholder:text-gray-400"
          />

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-[var(--text)]">
              🛏️ Select Amenities
            </h3>
            <div className="flex flex-wrap lg:gap-5 gap-4">
              {amenitiesList.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-1 text-lg font-medium text-[var(--text)] cursor-pointer hover:text-[var(--highlight)] transition"
                >
                  <input
                    type="checkbox"
                    name="amenities"
                    value={amenity}
                    onChange={handleAmenityChange}
                    className="w-5 h-5 accent-[var(--highlight)]"
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[var(--highlight)] text-[var(--bg)] py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition"
          >
            🚀 Submit
          </motion.button>
        </form>
        {success && (
          <div className="mt-4 text-green-500 text-center">
            <p>{success}</p>
          </div>
        )}
        {error && (
          <div className="mt-4 text-red-500 text-center">
            <p>Error: {error}</p>
          </div>
        )}
      </motion.div>
    </main>
  ) : (
    <NotLoggedIn />
  );
}
