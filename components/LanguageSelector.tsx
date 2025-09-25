"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

interface LanguageSelectorProps {
  language: string;
  setLanguage: (lang: string) => void;
}

const languages = [
  { code: "EN", label: "English", icon: "🌐" },
  { code: "HI", label: "Hindi", icon: "🇮🇳" },
  { code: "BNG", label: "Bengali", icon: "🅱️" },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, setLanguage }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Position dropdown based on button
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selected = languages.find((lang) => lang.code === language);

  return (
    <>
      {/* Trigger */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-sm font-medium text-white/90 
                   bg-gradient-to-r from-indigo-500/20 to-pink-500/20 backdrop-blur-md 
                   cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md transition-all duration-300"
      >
        <span>{selected?.icon}</span>
        <span>{selected?.label}</span>
        <ChevronDown
          className={`h-4 w-4 text-white/70 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Portal Dropdown */}
      {open &&
        createPortal(
          <div
            className="absolute z-[99999] rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl"
            style={{ top: coords.top, left: coords.left, width: coords.width, position: "fixed" }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-4 py-2 text-sm text-white/90 hover:bg-indigo-500/30 transition-all duration-200 
                ${lang.code === language ? "bg-indigo-500/20 font-semibold" : ""}`}
              >
                <span>{lang.icon}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default LanguageSelector;
