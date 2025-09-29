"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface Language {
  code: string;
  label: string;
  icon: string;
}

interface LanguageSelectorProps {
  language: string;
  setLanguage: (lang: string) => void;
  page: string
}

const languages: Language[] = [
  { code: "en", label: "English", icon: "🌐" },
  { code: "hi", label: "Hindi", icon: "🇮🇳" },
  { code: "bng", label: "Bengali", icon: "🅱️" },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  setLanguage,
  page
}) => {
  const [open, setOpen] = useState(false);
  const [buttonWidth, setButtonWidth] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const router = useRouter()
  const pathname = usePathname();

  // Extract current language from URL
  const currentLang = pathname.split("/")[1] || "en";


  // Measure button width whenever open or language changes
  useEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, [open, language]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = languages.find((l) => l.code === currentLang) ?? languages[0];

  const handleLanguageChange = (langCode: string) => {
    // setLanguage(langCode);
    setOpen(false);

    // Navigate to the localized dashboard page
    router.push(`/${langCode}/${page}`);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-sm font-medium text-white/90 
                   bg-gradient-to-r from-indigo-500/20 to-pink-500/20 backdrop-blur-md 
                   cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md transition-all duration-300"
      >
        <span>{selected.icon}</span>
        <span>{selected.label}</span>
        <ChevronDown
          className={`h-4 w-4 text-white/70 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl z-20"
          style={{ width: buttonWidth }}
        >
          <ul>
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => {
                    // setLanguage(lang.code);
                    handleLanguageChange(lang.code)
                    // setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-sm text-white/90 hover:bg-indigo-500/30 transition-all duration-200 
                  ${
                    lang.code === language
                      ? "bg-indigo-500/20 font-semibold"
                      : ""
                  }`}
                >
                  <span>{lang.icon}</span>
                  <span>{lang.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
