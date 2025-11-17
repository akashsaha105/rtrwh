"use client";

import { useRef, useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { AnimatePresence, motion } from "framer-motion";

type Role = "system" | "user" | "assistant";
interface Message {
  id: string;
  role: Role;
  content: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuid(),
      role: "assistant",
      content:
        "💧 Hi! I’m **JalMitra**, your Rooftop Rainwater Harvesting guide.\n\nShare your city, roof area (m²), annual rainfall (mm), roof material, and intended use — I’ll help with calculations and suggestions.",
    },
  ]);

  const inFlight = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);

    const userMsg: Message = { id: uuid(), role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const reqBody = {
        messages: [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error ?? `Request failed: ${res.status}`;
        setMessages((prev) => [
          ...prev,
          { id: uuid(), role: "assistant", content: msg },
        ]);
        return;
      }
      const data = await res.json();
      const content = data?.content ?? "No content";
      setMessages((prev) => [
        ...prev,
        { id: uuid(), role: "assistant", content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uuid(),
          role: "assistant",
          content: "⚠️ Sorry, something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-[380px] h-[540px] rounded-2xl bg-white/70 backdrop-blur-lg border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
              <div className="flex flex-col">
                <span className="font-semibold">💧 JalMitra</span>
                <span className="text-xs text-blue-100">Ask JalMitra</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="hover:bg-white/20 rounded-md p-1 transition"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-blue-50 to-white">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm shadow-md ${
                        isUser
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="text-xs text-gray-500 px-2 animate-pulse">
                  JalMitra is typing…
                </div>
              )}
              <div ref={messagesEndRef} /> {/* Auto-scroll target */}
            </div>

            {/* Input */}
            <form
              onSubmit={onSubmit}
              className="p-3 border-t bg-white/60 backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ask JalMitra about tank size, recharge, filters…"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm disabled:opacity-50 hover:bg-blue-700 transition"
                >
                  ➤
                </button>
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                Example: “Kolkata, 120 m² roof, 1600 mm/yr, concrete, non-potable”
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:shadow-xl px-5 py-3"
      >
        <span className="text-sm font-medium">
          {open ? "Close" : "💧 Ask JalMitra"}
        </span>
      </motion.button>
    </div>
  );
}
