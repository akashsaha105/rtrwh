"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
// import { doc, getDoc } from "firebase/firestore";
import LoadingPage from "@/components/Loading";
import SideBar from "@/components/AdminDashboard/SideBar";
import Navbar from "@/components/AdminDashboard/NavBar";

const Page = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Sidebar states
  const [activeItem, setActiveItem] = useState("overview");

  // Auth check + Firestore rooftop check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser || currentUser.email != "admin123@admin.com") {
        router.push("/");
        console.log("User is not authenticated");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <LoadingPage />;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900 text-white">
      <SideBar
        username={"admin"}
        email={user?.email}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />
      <div className="relative z-50 flex-1 flex flex-col">
        <Navbar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />
        {/* Content */}
        <main className="relative z-[-1] flex-1 pt-6 p-6 overflow-y-auto">
          {/* Assessment */}
          <div className={activeItem === "overview" ? "block" : "hidden"}>
            Dashboard Overview
          </div>

          {/* Insights */}
          <div className={activeItem === "orders" ? "block" : "hidden"}>
            <h3 className="text-lg font-semibold mb-4">Orders</h3>
            <div className="h-64 flex items-center justify-center text-sky-400">
              📊 Chart Placeholder
            </div>
          </div>

          {/* Users */}
          <div className={activeItem === "users" ? "block" : "hidden"}>
            <h3 className="text-lg font-semibold mb-4">Users List</h3>
            <ul className="space-y-2">
              <li className="bg-white/10 p-3 rounded-md">👤 User 1</li>
              <li className="bg-white/10 p-3 rounded-md">👤 User 2</li>
              <li className="bg-white/10 p-3 rounded-md">👤 User 3</li>
            </ul>
          </div>

          {/* Products */}
          <div className={activeItem === "products" ? "block" : "hidden"}>
            <h1>Products</h1>
          </div>

          {/* Analytics */}
          <div className={activeItem === "analytics" ? "block" : "hidden"}>
            <h1>Analytics</h1>
          </div>

          {/* Profile */}
          <div className={activeItem === "profile" ? "block" : "hidden"}>
            User Profile
          </div>
        </main>
      </div>
    </div>
  );
};

export default Page;
