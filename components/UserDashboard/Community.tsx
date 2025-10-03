"use client";

import { MessageCircle, UserCircle2, Send, ArrowDown, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { auth, firestore } from "@/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  DocumentData,
  where,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

interface Reply {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timestamp?: any;
  replyToName?: string;
  replyToText?: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timestamp?: any;
  replies?: Reply[];
}

interface OnlineUser {
  uid: string;
  fullName: string;
  photoURL?: string | null;
}

const Community = () => {
  const [messageQuery, setMessageQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) =>
      setUser(currentUser)
    );
    return () => unsubscribe();
  }, []);

  // Listen to messages and replies
  useEffect(() => {
    const messagesCol = collection(firestore, "messages");
    const q = query(messagesCol, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          senderPhotoURL: data.senderPhotoURL || null,
          timestamp: data.timestamp,
          replies: [],
        };
      });

      setMessages(msgs);

      // Setup real-time listeners for replies
      msgs.forEach((msg) => {
        const repliesCol = collection(firestore, `messages/${msg.id}/replies`);
        const replyQuery = query(repliesCol, orderBy("timestamp", "asc"));
        onSnapshot(replyQuery, (replySnap) => {
          const replies: Reply[] = replySnap.docs.map((doc) => {
            const data = doc.data() as DocumentData;
            return {
              id: doc.id,
              text: data.text,
              senderId: data.senderId,
              senderName: data.senderName,
              senderPhotoURL: data.senderPhotoURL || null,
              timestamp: data.timestamp,
              replyToName: data.replyToName,
              replyToText: data.replyToText,
            };
          });
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, replies } : m))
          );
          // Scroll only if user is not manually scrolling
          if (!isUserScrolling.current) scrollToBottom();
        });
      });

      if (!isUserScrolling.current) scrollToBottom();
    });

    return () => unsubscribe();
  }, []);

  // Listen to online users
  useEffect(() => {
    const usersCol = collection(firestore, "users");
    const unsubscribe = onSnapshot(usersCol, (snapshot) => {
      const online = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: data.uid,
          fullName: data.fullName || data.username,
          photoURL: data.photoURL || null,
        };
      });
      setOnlineUsers(online);
    });
    return () => unsubscribe();
  }, []);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    isUserScrolling.current = scrollHeight - scrollTop > clientHeight + 50;
    setShowScrollButton(isUserScrolling.current);
  };

  const handleSend = async () => {
    if (!messageQuery.trim() || !user) return;

    try {
      if (replyTo) {
        await addDoc(collection(firestore, `messages/${replyTo.id}/replies`), {
          text: messageQuery,
          senderId: user.uid,
          senderName: user.displayName || user.email || "Anonymous",
          senderPhotoURL: user.photoURL || null,
          timestamp: serverTimestamp(),
          replyToName: replyTo.senderName,
          replyToText: replyTo.text,
        });
        setReplyTo(null);
      } else {
        await addDoc(collection(firestore, "messages"), {
          text: messageQuery,
          senderId: user.uid,
          senderName: user.displayName || user.email || "Anonymous",
          senderPhotoURL: user.photoURL || null,
          timestamp: serverTimestamp(),
        });
      }
      setMessageQuery("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const renderAvatar = (
    photoURL?: string | null,
    senderId?: string,
    senderName?: string
  ) => {
    if (photoURL)
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoURL}
          alt={senderName}
          className="h-8 w-8 rounded-full object-cover"
        />
      );
    const firstLetter = senderName?.[0]?.toUpperCase() || "U";
    const bgColor = senderId === user?.uid ? "bg-indigo-600" : "bg-sky-500";
    return (
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-full ${bgColor} text-white font-semibold`}
      >
        {firstLetter}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-[90vh] bg-gradient-to-br from-indigo-900 via-gray-900 to-black text-white overflow-hidden">
      <div className="flex-1 flex flex-col p-6 backdrop-blur-lg bg-white/5 shadow-xl relative">
        <h3 className="text-3xl font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-7 w-7 text-indigo-400 animate-pulse" />{" "}
          Community Chat
        </h3>

        <div
          className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl bg-white/5 shadow-inner"
          ref={messagesContainerRef}
          onScroll={handleScroll}
          style={{
            scrollbarWidth: "none",
          }}
        >
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1">
              <div
                className={`flex items-end gap-3 ${
                  msg.senderId === user?.uid ? "justify-end" : "justify-start"
                }`}
              >
                {msg.senderId !== user?.uid &&
                  renderAvatar(
                    msg.senderPhotoURL,
                    msg.senderId,
                    msg.senderName
                  )}
                <div
                  className={`max-w-lg px-4 py-2 rounded-2xl shadow-md transition transform ${
                    msg.senderId === user?.uid
                      ? "bg-indigo-600 text-white hover:scale-105"
                      : "bg-gray-700 text-gray-200 hover:scale-105"
                  }`}
                >
                  {msg.replies && msg.replies.length > 0 && (
                    <div className="text-[10px] text-gray-400 mb-1 px-2 py-1 bg-gray-800 rounded">
                      Replying to{" "}
                      {msg.replies[msg.replies.length - 1].replyToName}: &quot;
                      {msg.replies[msg.replies.length - 1].replyToText}&quot;
                    </div>
                  )}
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {msg.senderName}
                  </p>
                  <button
                    onClick={() => setReplyTo(msg)}
                    className="text-xs text-indigo-400 mt-1 hover:underline"
                  >
                    Reply
                  </button>
                </div>
                {msg.senderId === user?.uid &&
                  renderAvatar(
                    msg.senderPhotoURL,
                    msg.senderId,
                    msg.senderName
                  )}
              </div>

              {/* Replies */}
              {/* Replies */}
              {msg.replies?.map((r) => (
                <div key={r.id} className="ml-8 flex items-start gap-3">
                  {r.senderId !== user?.uid &&
                    renderAvatar(r.senderPhotoURL, r.senderId, r.senderName)}
                  <div
                    className={`px-3 py-1 rounded-xl text-sm shadow-sm transition transform
        ${
          r.senderId === user?.uid
            ? "bg-indigo-600 text-white hover:scale-105"
            : "bg-gray-700 text-gray-200 hover:scale-105"
        }`}
                  >
                    {r.replyToName && (
                      <div className="text-[10px] text-gray-400 mb-1">
                        Replying to {r.replyToName}: &quot;{r.replyToText}&quot;
                      </div>
                    )}
                    {r.text}
                    <div className="text-[10px] text-gray-300 mt-1">
                      {r.senderName}
                    </div>
                  </div>
                  {r.senderId === user?.uid &&
                    renderAvatar(r.senderPhotoURL, r.senderId, r.senderName)}
                </div>
              ))}
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-28 right-6 bg-indigo-600 hover:bg-indigo-700 p-3 rounded-full shadow-lg transition"
          >
            <ArrowDown className="h-5 w-5 text-white" />
          </button>
        )}

        {replyTo && (
          <div
            className={`mb-2 flex items-center gap-2 text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded`}
          >
            Replying to {replyTo.senderName}: &quot;{replyTo.text}&quot;
            <button onClick={() => setReplyTo(null)} className="ml-auto">
              <X className="h-4 w-4 text-red-400" />
            </button>
          </div>
        )}

        <div className="mt-2 relative">
          <div className="flex items-center gap-3 relative">
            <input
              type="text"
              value={messageQuery}
              onChange={(e) => setMessageQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
        <h4 className="text-xl font-semibold mb-4">Users</h4>
        <ul className="space-y-4">
          {onlineUsers.map((u) => (
            <li
              key={u.uid}
              className="flex items-center gap-3 bg-white/10 p-2 rounded-xl hover:bg-white/20 transition cursor-pointer"
            >
              {u.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={u.photoURL}
                  alt={u.fullName}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <UserCircle2 className="h-8 w-8 text-indigo-400" />
              )}
              <span>{u.fullName}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Community;
