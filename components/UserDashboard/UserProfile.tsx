"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import profile from "../../public/assets/profile.jpg";
import { MapPinIcon } from "@heroicons/react/16/solid";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth, firestore } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface FormData {
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  location: {
    state: string;
    city: string;
    address: string;
  };
}

interface RoofTopFormData {
  rooftop: {
    area: string;
    type: string;
    dwellers: string;
    space: string;
  };
}

const FloatingNavbar = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => (
  <div className="absolute z-50 top-5 left-80 transform -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-3xl w-11/12 max-w-md flex justify-between py-3 px-4">
    <button
      onClick={() => setActiveTab("profile")}
      className={`flex-1 text-center py-2 mx-1 rounded-2xl font-medium transition-all ${
        activeTab === "profile"
          ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-md"
          : "text-white/70 hover:bg-white/10"
      }`}
    >
      Profile
    </button>
    <button
      onClick={() => setActiveTab("rooftop")}
      className={`flex-1 text-center py-2 mx-1 rounded-2xl font-medium transition-all ${
        activeTab === "rooftop"
          ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-md"
          : "text-white/70 hover:bg-white/10"
      }`}
    >
      Rooftop
    </button>
  </div>
);

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const [userProfile, setUserProfile] = useState<FormData>({
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    location: { state: "", city: "", address: "" },
  });

  const [userRoofTop, setUserRoofTop] = useState<RoofTopFormData>({
    rooftop: { area: "", type: "", dwellers: "", space: "" },
  });

  const [formData, setFormData] = useState<FormData>(userProfile);
  const [rooftopFormData, setRooftopFormData] = useState<RoofTopFormData>(userRoofTop);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [loadingLocation, setLoadingLocation] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [rooftopSubmitted, setRooftopSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "state" || name === "city" || name === "address") {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Rooftop handler is okay
  const handleRooftopChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setRooftopFormData((prev) => ({
      ...prev,
      rooftop: {
        ...prev.rooftop,
        [name]: value,
      },
    }));
  };

  // Submit profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;
      const docRef = doc(firestore, "users", currentUser.uid);
      await updateDoc(docRef, {
        username: formData.username || currentUser.displayName || "",
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        location: {
          state: formData.location.state,
          city: formData.location.city,
          address: formData.location.address,
        },
        geopoint: [latitude, longitude],
      });

      if (formData.username) {
        await updateProfile(currentUser, {
          displayName: formData.username,
        });
      }

      const docsSnap = await getDoc(docRef);
      if (docsSnap.exists()) {
        const data = docsSnap.data() as FormData;
        setUserProfile(data);
        setFormData(data);
      }

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    });
  };

  // Submit rooftop
  const handleRooftopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;
      try {
        const docRef = doc(firestore, "users", currentUser.uid);
        await setDoc(
          docRef,
          {
            rooftop: rooftopFormData.rooftop,
          },
          { merge: true }
        );

        const docsSnap = await getDoc(docRef);
        if (docsSnap.exists()) {
          const data = docsSnap.data();
          if (data?.rooftop) {
            setUserRoofTop({ rooftop: data.rooftop });
            setRooftopFormData({ rooftop: data.rooftop });
          } else {
            setUserRoofTop({
              rooftop: { area: "", type: "", dwellers: "", space: "" },
            });
            setRooftopFormData({
              rooftop: { area: "", type: "", dwellers: "", space: "" },
            });
          }
        }
        setRooftopSubmitted(true);
        setTimeout(() => setRooftopSubmitted(false), 3000);
      } catch (e) {
        console.log("Error saving rooftop:", e);
      }
    });
  };

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) return;
        const docRef = doc(firestore, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data() as FormData & RoofTopFormData;
          setUserProfile({
            username: userData.username || "",
            fullName: userData.fullName || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            location: {
              state: userData.location?.state || "",
              city: userData.location?.city || "",
              address: userData.location?.address || "",
            },
          });
          setFormData({
            username: userData.username || "",
            fullName: userData.fullName || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            location: {
              state: userData.location?.state || "",
              city: userData.location?.city || "",
              address: userData.location?.address || "",
            },
          });
          if (userData.rooftop) {
            setUserRoofTop({ rooftop: userData.rooftop });
            setRooftopFormData({ rooftop: userData.rooftop });
          } else {
            setUserRoofTop({
              rooftop: { area: "", type: "", dwellers: "", space: "" },
            });
            setRooftopFormData({
              rooftop: { area: "", type: "", dwellers: "", space: "" },
            });
          }
        }
      });
    };
    fetchUser();
  }, []);

  // Detect location 
  const detectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLatitude(latitude);
        setLongitude(longitude);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              state: data.address.state || "",
              city: data.address.city || data.address.town || data.address.village || "",
              address: data.display_name || "",
            },
          }));
        } catch (error) {
          console.error("Failed to fetch address:", error);
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLoadingLocation(false);
      }
    );
  };

  return (
    <div className="flex flex-row-reverse mt-3 mb-10">
      {/* Floating Navbar */}
      <FloatingNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Left Side: User Profile Card */}
      <div className="flex flex-col gap-4 w-full max-w-4xl mx-10 mt-24">
        <div className="bg-gradient-to-r from-indigo-500 to-pink-500 p-1 rounded-2xl shadow-xl">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col md:flex-row items-center gap-6 p-6">
            <Image
              src={profile}
              width={130}
              height={130}
              alt="Profile Image"
              className="rounded-full border-4 border-white shadow-lg"
            />
            <div className="flex flex-col flex-1 gap-2 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-200">
                {userProfile.fullName}
              </h1>
              <div className="flex flex-col gap-3 text-black mt-2">
                <span>📧 {userProfile.email}</span>
                <span>📞 {userProfile.phoneNumber}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 text-black mt-1">
                🏠 {userProfile.location.address}
              </div>
            </div>
          </div>
        </div>
        {submitted && (
          <div className="mb-4 mt-5 p-3 bg-green-500/20 text-green-200 rounded-lg animate-pulse">
            ✅ Details updated successfully!
          </div>
        )}
      </div>

      {/* Right Side: Forms */}
      <div className="relative w-full flex flex-col ml-5 mt-23">
        {activeTab === "profile" && (
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-lg transition hover:shadow-indigo-400/40">
            <h2 className="text-2xl font-semibold text-white mb-6">
              ✨ Update Your Profile
            </h2>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Full Name + Username */}
              <div className="flex gap-3 max-w-full">
                <div className="flex flex-col gap-2 w-[120%]">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={toTitleCase(formData.fullName)}
                    onChange={handleChange}
                    className="bg-white/10 text-white placeholder-white/50 border border-white/30 rounded-xl p-3 focus:ring-2 focus:ring-pink-400 outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 w-[100%]">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="bg-white/10 text-white placeholder-white/50 border border-white/30 rounded-xl p-3 focus:ring-2 focus:ring-pink-400 outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="bg-white/10 text-white placeholder-white/50 border border-white/30 rounded-xl p-3 focus:ring-2 focus:ring-pink-400 outline-none"
                  required
                />
              </div>

              {/* State + City */}
              <div className="flex gap-3 max-w-full">
                <div className="flex flex-col gap-2 w-[120%]">
                  <label>State</label>
                  <select
                    name="state"
                    value={formData.location.state}
                    onChange={handleChange}
                    className="bg-white/10 text-white placeholder-white/50 border border-white/30 rounded-xl p-3 focus:ring-2 focus:ring-pink-400 outline-none"
                    required
                  >
                    <option value="" className="bg-white/100 text-gray-900">Select State</option>
                    {[{ id: 1, name: "West Bengal" }, { id: 2, name: "Maharastra" }, { id: 3, name: "Delhi" }]
                      .map((item) => (
                        <option
                          key={item.id}
                          value={item.name}
                          className="bg-white/100 text-gray-900"
                        >
                          {item.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2 w-[100%]">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.location.city}
                    onChange={handleChange}
                    className="bg-white/10 text-white placeholder-white/50 border border-white/30 rounded-xl p-3 focus:ring-2 focus:ring-pink-400 outline-none"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2">
                <label>Address</label>
                <div className="flex gap-3 items-center">
                  <textarea
                    name="address"
                    value={formData.location.address}
                    onChange={handleChange}
                    className="bg-white/10 text-white placeholder-white/50 border border-white/30 rounded-xl p-3 flex-1 resize-none focus:ring-2 focus:ring-pink-400 outline-none"
                    rows={2}
                    required
                  />
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-4 rounded-full min-w-[50px] h-15 flex items-center justify-center hover:opacity-90 transition cursor-pointer"
                  >
                    {loadingLocation ? "..." : <MapPinIcon width={24} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold py-3 rounded-xl shadow-md hover:opacity-90 transition cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

        {activeTab === "rooftop" && (
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-lg transition hover:shadow-indigo-400/40">
            <h2 className="text-2xl font-semibold text-white mb-6">
              🌇 Rooftop Details
            </h2>
            {rooftopSubmitted && (
              <div className="mb-4 p-3 bg-green-500/20 text-green-200 rounded-lg animate-pulse">
                ✅ Rooftop details submitted successfully!
              </div>
            )}
            <form
              className="flex flex-col gap-5 pb-3"
              onSubmit={handleRooftopSubmit}
            >
              <div className="flex gap-5 max-w-full items-center">
                <div className="flex flex-col gap-2 w-[50%]">
                  <label>RoofTop Area (sq. ft.)</label>
                  <input
                    type="text"
                    name="area"
                    placeholder="Rooftop Area (sq. ft.)"
                    value={rooftopFormData.rooftop.area}
                    onChange={handleRooftopChange}
                    className="bg-white/10 text-white placeholder-white/50 border border-white/30 rounded-xl p-3 focus:ring-2 focus:ring-pink-400 outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 w-[50%]">
                  <label>RoofTop Type</label>
                  <div className="relative w-full">
                    <select
                      name="type"
                      value={rooftopFormData.rooftop.type}
                      onChange={handleRooftopChange}
                      required
                      className="appearance-none w-full p-3 pr-10 rounded-xl bg-gradient-to-r from-indigo-500/20 to-pink-500/20 
                  text-white font-medium border border-white/30 shadow-md backdrop-blur-md 
                  focus:ring-2 focus:ring-pink-400 outline-none transition-all duration-300"
                    >
                      <option value="" className="bg-white/100 text-gray-900">
                        🌇 Select Rooftop Type
                      </option>
                      <option
                        value="Flat"
                        className="bg-white/100 text-gray-900"
                      >
                        Flat
                      </option>
                      <option
                        value="Sloped"
                        className="bg-white/100 text-gray-900"
                      >
                        Sloped
                      </option>
                      <option
                        value="asbestos"
                        className="bg-white/100 text-gray-900"
                      >
                        Asbestos
                      </option>
                      <option
                        value="metal"
                        className="bg-white/100 text-gray-900"
                      >
                        Metal Sheet Roof
                      </option>
                      <option
                        value="asbestos"
                        className="bg-white/100 text-gray-900"
                      >
                        Bamboo Roof
                      </option>
                    </select>
                    {/* Dropdown Arrow */}
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none">
                      ▼
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-5 max-w-full items-center">
                <div className="flex flex-col gap-2 w-[50%]">
                  <label>Number of Dwellers</label>
                  <input
                    type="text"
                    name="dwellers"
                    placeholder="Number of Dwellers"
                    value={rooftopFormData.rooftop.dwellers}
                    onChange={handleRooftopChange}
                    className="bg-white/10 text-white placeholder-white/50 border border-white/30 rounded-xl p-3 focus:ring-2 focus:ring-pink-400 outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 w-[50%]">
                  <label>Available Space (sq. ft.)</label>
                  <input
                    type="text"
                    name="space"
                    placeholder="Open Available Space (sq. ft.)"
                    value={rooftopFormData.rooftop.space}
                    onChange={handleRooftopChange}
                    className="bg-white/10 text-white placeholder-white/50 border border-white/30 rounded-xl p-3 focus:ring-2 focus:ring-pink-400 outline-none"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold py-3 rounded-xl shadow-md hover:opacity-90 transition cursor-pointer"
              >
                Submit Rooftop Details
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
