"use client";

import { useLocationAlerts } from "@/hooks/useRainAlerts";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBell() {
  const { rain, groundwater, aquifer } = useLocationAlerts();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Count total alerts
  const totalAlerts = [rain, groundwater, aquifer].filter(Boolean).length;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition-all"
      >
        🔔
        {totalAlerts > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {totalAlerts}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-gray-800 text-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
              <span className="font-semibold text-sm">Notifications</span>
              {totalAlerts > 0 && (
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-gray-700">
              {!rain && !groundwater && !aquifer ? (
                <p className="p-4 text-sm text-gray-400">No new alerts</p>
              ) : (
                <>
                  {rain && (
                    <div className="p-3 hover:bg-gray-700 transition-colors">
                      <span className="font-semibold">🌧 Rainfall</span>
                      <p className="text-sm text-gray-300 mt-1">{rain}</p>
                    </div>
                  )}
                  {groundwater && (
                    <div className="p-3 hover:bg-gray-700 transition-colors">
                      <span className="font-semibold">💧 Groundwater</span>
                      <p className="text-sm text-gray-300 mt-1">{groundwater}</p>
                    </div>
                  )}
                  {aquifer && (
                    <div className="p-3 hover:bg-gray-700 transition-colors">
                      <span className="font-semibold">🌍 Aquifer</span>
                      <p className="text-sm text-gray-300 mt-1">{aquifer}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
