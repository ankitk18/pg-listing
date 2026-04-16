"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NotLoggedIn from "@/components/NotLoggedIn";
import Popup from "@/components/Popup";

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
  const [showPopup, setShowPopup] = useState(true);
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
  const [missingFields, setMissingFields] = useState({});

  const getFieldClassName = (fieldName) => {
    const baseClass =
      "w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border focus:ring-2 focus:outline-none placeholder:text-gray-400";

    if (missingFields[fieldName]) {
      return `${baseClass} border-red-500 ring-2 ring-red-400`;
    }

    return `${baseClass} border-[var(--border)] focus:ring-[var(--highlight)]`;
  };

  const handleAmenityChange = (event) => {
    const selectedAmenity = event.target.value;
    //unckeck logic
    if (formData.amenities.includes(selectedAmenity)) {
      setFormData((prevData) => ({
        ...prevData,
        amenities: prevData.amenities.filter(
          (amenity) => amenity !== selectedAmenity,
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
    if (files && files.length > 0) {
      setMissingFields((prev) => ({ ...prev, images: false }));
    }
  };
  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const nextMissingFields = {
        name: !formData.name.trim(),
        state: !selectedState.trim(),
        nearByCollege: !selectedCollege.trim(),
        address: !formData.address.trim(),
        rent: !String(formData.rent).trim(),
        description: !formData.description.trim(),
      };

      const missingLabels = [];
      if (nextMissingFields.name) missingLabels.push("PG Name");
      if (nextMissingFields.state) missingLabels.push("State");
      if (nextMissingFields.nearByCollege)
        missingLabels.push("Near By College");
      if (nextMissingFields.address) missingLabels.push("Address");
      if (nextMissingFields.rent) missingLabels.push("Monthly Rent");
      if (nextMissingFields.description) missingLabels.push("Description");

      if (missingLabels.length > 0) {
        setMissingFields((prev) => ({ ...prev, ...nextMissingFields }));
        setError(`Please fill required fields: ${missingLabels.join(", ")}`);
        setSuccess(null);
        return;
      }

      setMissingFields({});
      const form = new FormData();
      if (!images || images.length === 0) {
        setMissingFields((prev) => ({ ...prev, images: true }));
        setError("Please upload an image.");
        return;
      }
      if (images.length > 1) {
        setMissingFields((prev) => ({ ...prev, images: false }));
        setError("Please upload only one image.");
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
        await response.json();
        setSuccess("PG listing added successfully!");
        setMissingFields({});
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
        return;
      }

      setSuccess(null);
      const errorData = await response.json();
      console.log("Error adding PG listing:", errorData.message);
      setError(errorData.message);
    } finally {
      setIsSubmitting(false);
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
          `/api/college?collegeName=${debounceCollegeName}&state=${selectedState}`,
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
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (e.target.value.trim()) {
                setMissingFields((prev) => ({ ...prev, name: false }));
              }
            }}
            className={getFieldClassName("name")}
          />
          <select
            name="state"
            required
            onChange={(e) => {
              setSelectedState(e.target.value);
              if (e.target.value.trim()) {
                setMissingFields((prev) => ({ ...prev, state: false }));
              }
            }}
            value={selectedState}
            className={getFieldClassName("state")}
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
            onChange={(e) => {
              setSelectedCollege(e.target.value);
              if (e.target.value.trim()) {
                setMissingFields((prev) => ({ ...prev, nearByCollege: false }));
              }
            }}
            className={getFieldClassName("nearByCollege")}
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
                    setMissingFields((prev) => ({
                      ...prev,
                      nearByCollege: false,
                    }));
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
            onChange={(e) => {
              setFormData({ ...formData, address: e.target.value });
              if (e.target.value.trim()) {
                setMissingFields((prev) => ({ ...prev, address: false }));
              }
            }}
            className={getFieldClassName("address")}
          />

          <input
            type="number"
            name="rent"
            placeholder="💰 Monthly Rent (in INR)"
            required
            onChange={(e) => {
              setFormData({ ...formData, rent: e.target.value });
              if (String(e.target.value).trim()) {
                setMissingFields((prev) => ({ ...prev, rent: false }));
              }
            }}
            className={getFieldClassName("rent")}
          />
          <textarea
            name="description"
            placeholder="📝 Description"
            required
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              if (e.target.value.trim()) {
                setMissingFields((prev) => ({ ...prev, description: false }));
              }
            }}
            rows="4"
            className={`${getFieldClassName("description")} h-24`}
          />

          <input
            type="file"
            name="images"
            onChange={handleFileChange}
            accept="image/*"
            className={`w-full p-3 rounded-xl bg-[var(--bg)] text-[var(--text)] border placeholder:text-gray-400 ${
              missingFields.images
                ? "border-red-500 ring-2 ring-red-400"
                : "border-[var(--border)]"
            }`}
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
          <Popup
            isOpen={showPopup}
            onClose={() => setShowPopup(false)}
            title="PG Listing Submitted!"
            message="Your PG listing has been submitted and is under review. It will be live on the platform once approved. Thank you for contributing to GradStay!"
          />
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
