"use client";

import { MessageCircle, Search, UserCircle2, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const Community = () => {
  const [messageQuery, setMessageQuery] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [filteredSuggestion, setFilteredSuggestion] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dummy messages
  const [messages, setMessages] = useState<
    { text: string; sender: "me" | "other" }[]
  >([
    { text: "Hey! Anyone installed the system in apartments?", sender: "other" },
    { text: "Yes, works perfectly. Saved 30% water bills!", sender: "me" },
  ]);

  const suggestion = [
    "What is rooftop rainwater harvesting?",
    "How does rooftop rainwater harvesting work?",
    "Is rainwater safe to drink?",
    "Do I need a filter before storing rainwater?",
    "How much water can be collected from a 100 sq.m rooftop?",
    "Does rainwater harvesting reduce water bills?",
    "Can rainwater harvesting recharge groundwater?",
    "What is the average lifespan of the system?",
    "What is first flush in rainwater harvesting?",
    "How to calculate cost-benefit analysis?",
  ];

  // Filter suggestions
  useEffect(() => {
    if (messageQuery.trim() === "") {
      setFilteredSuggestion([]);
      setHighlightedIndex(-1);
      return;
    }
    const results = suggestion
      .filter((el) => el.toLowerCase().includes(messageQuery.toLowerCase()))
      .slice(0, 5);
    setFilteredSuggestion(results);
    setHighlightedIndex(results.length > 0 ? 0 : -1);
  }, [messageQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestion(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestion || filteredSuggestion.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestion.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestion.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        const selected = filteredSuggestion[highlightedIndex];
        setMessageQuery(selected);
        setShowSuggestion(false);
      }
    } else if (e.key === "Escape") {
      setShowSuggestion(false);
    }
  };

  // Send message
  const handleSend = () => {
    if (messageQuery.trim() === "") return;
    setMessages([...messages, { text: messageQuery, sender: "me" }]);
    setMessageQuery("");
    setShowSuggestion(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-155.5 bg-gradient-to-br from-indigo-900 via-gray-900 to-black text-white">
      {/* Left: Chat Section */}
      <div className="flex-1 flex flex-col p-6 backdrop-blur-lg bg-white/5 shadow-xl">
        <h3 className="text-3xl font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-7 w-7 text-indigo-400 animate-pulse" />
          Community Chat
        </h3>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl bg-white/5 shadow-inner scrollbar-thin">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-3 ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "other" && (
                <UserCircle2 className="h-8 w-8 text-gray-300" />
              )}
              <div
                className={`max-w-lg px-4 py-2 rounded-2xl shadow-md transition transform ${
                  msg.sender === "me"
                    ? "bg-indigo-600 text-white hover:scale-105"
                    : "bg-gray-700 text-gray-200 hover:scale-105"
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === "me" && (
                <UserCircle2 className="h-8 w-8 text-indigo-400" />
              )}
            </div>
          ))}
        </div>

        {/* Input + Suggestions */}
        <div className="mt-4 relative" ref={containerRef}>
          {showSuggestion && messageQuery && (
            <div className="absolute -top-48 left-0 w-full bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-lg p-3 transition-all animate-fade-in">
              {filteredSuggestion.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {filteredSuggestion.map((item, index) => (
                    <li
                      key={item}
                      className={`px-3 py-2 rounded-lg cursor-pointer transition ${
                        index === highlightedIndex
                          ? "bg-indigo-600 text-white"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                      onClick={() => {
                        setMessageQuery(item);
                        setShowSuggestion(false);
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <h3 className="text-red-400">No suggestions...</h3>
              )}
            </div>
          )}

          {/* Message Bar */}
          <div className="flex items-center gap-3 relative">
            <input
              ref={inputRef}
              type="text"
              value={messageQuery}
              onChange={(e) => {
                setMessageQuery(e.target.value);
                setShowSuggestion(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 pl-4 pr-12 py-3 rounded-full bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md"
            />
            <button
              onClick={handleSend}
              className="absolute right-4 bg-indigo-600 hover:bg-indigo-700 p-2 rounded-full transition shadow-lg"
            >
              <Send className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Online Users */}
      <div className="w-full md:w-64 border-l border-white/10 p-6 bg-white/5 backdrop-blur-xl shadow-xl">
        <h4 className="text-xl font-semibold mb-4">Online Users</h4>
        <ul className="space-y-4">
          {["Alice", "Rahul", "Sita", "David"].map((user, i) => (
            <li
              key={i}
              className="flex items-center gap-3 bg-white/10 p-2 rounded-xl hover:bg-white/20 transition cursor-pointer"
            >
              <UserCircle2 className="h-8 w-8 text-indigo-400" />
              <span>{user}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Community;
