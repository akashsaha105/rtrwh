"use client";

import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import SearchBar from "../SearchBar";
import { BellIcon } from "@heroicons/react/24/outline"; // Using Heroicons for clean icons
import LanguageSwitcher from "../LanguageSwitcher";
import NotificationBell from "./NotificationBell";

// Dashboard Header
interface DashboardHeaderProps {
  status: string;
  activeItem: string;
  setActiveItem: (id: string) => void;
}

const Navbar: React.FC<DashboardHeaderProps> = ({
  status,
  // activeItem,
  setActiveItem,
}) => {
  const [language, setLanguage] = useState("EN"); // default English

  const [notifications, setNotifications] = useState(3); // Example: 3 unread notifications
  const router = useRouter();

  // ✅ Load language from localStorage on first render
  useEffect(() => {
    const storedLang = localStorage.getItem("app_language");
    if (storedLang) {
      setLanguage(storedLang);
    }
  }, []); 

  console.log(language);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
      {/* Left: Active Section */}
      <div className="flex items-center gap-2 select-none">
        {/* Water droplet icon */}
        <span className="text-3xl animate-bounce text-sky-400">💧</span>

        {/* Logo Text */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-wide drop-shadow-lg">
          JalYantra
        </h1>
      </div>
      {/* Search Button */}
      <SearchBar setActiveItem={setActiveItem} />

      {/* Right: Status + Notification + Language + Sign Out */}
      <div className="flex items-center gap-5 relative z-[9999]">
        {/* Status Badge */}
        <span
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shadow-md transition-all duration-300 cursor-pointer
            ${
              status.toLowerCase() === "active"
                ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
            }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full animate-pulse ${
              status.toLowerCase() === "active" ? "bg-green-400" : "bg-red-400"
            }`}
          ></span>
          {status}
        </span>

        {/* Notification Icon */}
        {/* <div className="relative">
          <button className="relative p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition-all duration-300 focus:outline-none cursor-pointer">
            <BellIcon className="h-6 w-6" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
                {notifications}
              </span>
            )}
          </button>
        </div> */}

        <NotificationBell />  

        {/* Language Selector */}
        <LanguageSwitcher language={language} setLanguage={setLanguage} page="dashboard" />

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="relative inline-flex items-center justify-center px-6 py-2 rounded-full text-sm font-semibold 
                     text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                     shadow-lg hover:shadow-indigo-500/50 transition-all duration-300
                     hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
        >
          🚪 Sign Out
        </button>
      </div>
    </header>
  );
};

export default Navbar;
