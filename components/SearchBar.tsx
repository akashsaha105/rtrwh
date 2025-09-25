"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface SearchButtonProps {
  setActiveItem: (id: string) => void;
}

const SearchBar: React.FC<SearchButtonProps> = ({ setActiveItem }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [elements, setElements] = useState<
    { id: string; text: string; tab: string }[]
  >([]);
  const [filteredElements, setFilteredElements] = useState<typeof elements>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Collect Searchable elements
  useEffect(() => {
    const collectElements = () => {
      const allElements: { id: string; text: string; tab: string }[] = [];

      document.querySelectorAll("[data-tab]").forEach((el) => {
        const tab = el.getAttribute("data-tab") || "";
        const targetEl = el as HTMLElement;
        if (targetEl.id) {
          allElements.push({
            id: targetEl.id,
            text: targetEl.innerText,
            tab,
          });
        }
      });
      setElements(allElements);
    };

    collectElements();
    window.addEventListener("resize", collectElements);
    return () => window.removeEventListener("resize", collectElements);
  }, []);

  // Filter on query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredElements([]);
      setHighlightedIndex(-1);
      return;
    }
    const results = elements.filter((el) =>
      el.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredElements(results);
    setHighlightedIndex(results.length > 0 ? 0 : -1);
  }, [searchQuery, elements]);

  // Smooth scroll
  const scrollToElement = (target: HTMLElement) => {
    const tryScroll = () => {
      if (document.body.contains(target)) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        requestAnimationFrame(tryScroll);
      }
    };
    tryScroll();
  };

  const handleClick = (id: string, tab: string) => {
    setActiveItem(tab);
    setTimeout(() => {
      const target = document.getElementById(id);
      if (target) scrollToElement(target);
    }, 100);
    setSearchQuery("");
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredElements.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredElements.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredElements.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        const el = filteredElements[highlightedIndex];
        handleClick(el.id, el.tab);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div className="flex-1 flex justify-center px-6 relative z-50">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 h-5 w-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 rounded-full bg-white/10 text-white/90 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm shadow-md"
        />
      </div>

      {showDropdown && searchQuery && (
        <div className="absolute z-50 top-12 w-full max-w-md bg-slate-900/95 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-2">
          {filteredElements.length > 0 ? (
            <ul>
              {filteredElements.map((el, index) => (
                <li
                  key={el.id}
                  className={`px-4 py-2 rounded-lg cursor-pointer text-white/90 transition ${
                    index === highlightedIndex
                      ? "bg-indigo-600/60"
                      : "hover:bg-indigo-600/40"
                  }`}
                  onClick={() => handleClick(el.id, el.tab)}
                >
                  {el.text.length > 80 ? el.text.slice(0, 80) + "…" : el.text}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-gray-400">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
