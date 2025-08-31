"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NotLoggedIn from "@/components/NotLoggedIn";

export default function AddPgPage() {
  const statesAndUTsOfIndia = [
    // States
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",

    // Union Territories
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ].sort();
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
  const [selectedState, setSelectedState] = useState("");
  const [success, setSuccess] = useState(null);
  const [debounceCollegeName, setDebounceCollegeName] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [resultColleges, setResultColleges] = useState([]);
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
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceCollegeName(selectedCollege);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [selectedCollege]);
  useEffect(() => {
    const fetchColleges = async () => {
      if (debounceCollegeName.trim() === "" || selectedState.trim() === "") {
        setResultColleges([]);
        return;
      }
      try {
        const response = await fetch(
          `/api/college?collegeName=${debounceCollegeName}&state=${selectedState}`
        );
        if (response.ok) {
          const data = await response.json();
          setResultColleges(data);
        } else {
          console.error("Error fetching colleges");
        }
      } catch (error) {
        console.error("Error fetching colleges:", error);
      }
    };
    fetchColleges();
  }, [debounceCollegeName, selectedState]);
  return user ? (
    <main className="min-h-full bg-gradient-to-br from-[var(--bg)] via-[var(--dropdown)] to-[var(--bg)] text-[var(--text)] flex items-center justify-center px-4 py-12">
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
          <input
            type="text"
            name="name"
            placeholder="🏷️ PG Name"
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--highlight)] focus:outline-none placeholder:text-gray-400"
          />
          <select
            name="state"
            required
            onChange={(e) => { setSelectedState(e.target.value);}}
            value={selectedState}
            className="w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--highlight)] focus:outline-none placeholder:text-gray-400"
          >
            <option value="" disabled>
              🗺️ Select State
            </option>
            {statesAndUTsOfIndia.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="nearByCollege"
            placeholder="🎓 Near By College"
            disabled={!selectedState}
            required
            value={selectedCollege}
            onChange={(e) =>
              setSelectedCollege(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--highlight)] focus:outline-none placeholder:text-gray-400"
          />
          {resultColleges.length > 0 && (
            <ul className="border border-gray-300 rounded-md p-4 w-full max-h-60 overflow-y-auto bg-[var(--bg)] text-[var(--text)] mb-4">
              {resultColleges.map((college) => (
                <li
                  key={college._id}
                  className="mb-2 cursor-pointer hover:text-[var(--highlight)]"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      nearByCollege: college.name,
                    });
                    setSelectedCollege(college.name);
                    setResultColleges([]);
                  }}
                >
                  {college.name} - {college.city}, {college.state}
                </li>
              ))}
            </ul>
          )}
          <input
            type="text"
            name="address"
            placeholder="📍 Address"
            required
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--highlight)] focus:outline-none placeholder:text-gray-400"
          />

          <input
            type="number"
            name="rent"
            placeholder="💰 Monthly Rent (in INR)"
            required
            onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
            className="w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--highlight)] focus:outline-none placeholder:text-gray-400"
          />
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
