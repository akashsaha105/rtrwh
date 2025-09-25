"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, firestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingPage from "@/components/Loading";
import SideBar from "@/components/UserDashboard/Sidebar";
import Navbar from "@/components/UserDashboard/Navbar";
import UserProfile from "@/components/UserDashboard/UserProfile";
import Assessment from "@/components/UserDashboard/Assessment";
import NoRoofTop from "@/components/UserDashboard/NoRooftop";
import Products from "@/components/UserDashboard/ProductPage";

const Page = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRooftop, setHasRooftop] = useState<boolean | null>(null);
  const router = useRouter();

  // Sidebar states
  const [activeItem, setActiveItem] = useState("assessment");

  // Auth check + Firestore rooftop check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser || currentUser.email == "admin123@admin.com") {
        router.push("/");
        console.log("User is not authenticated");
        return;
      }
      setUser(currentUser);

      try {
        const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setHasRooftop(!!data?.rooftop);
        } else {
          setHasRooftop(false);
        }
      } catch (error) {
        console.error("Error fetching rooftop data:", error);
        setHasRooftop(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <LoadingPage />;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900 text-white">
      {/* Sidebar */}
      <SideBar
        username={user?.displayName}
        email={user?.email}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />

      {/* Main Section */}
      <div className="relative z-50 flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar
          status="Inactive"
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />

        {/* Content */}
        <main className="relative z-[-1] flex-1 pt-6 p-6 overflow-y-auto">
          {/* Assessment */}
          <div className={activeItem === "assessment" ? "block" : "hidden"}>
            {!hasRooftop ? (
              <NoRoofTop activeItem="profile" setActiveItem={setActiveItem} />
            ) : (
              <Assessment />
            )}
          </div>

          {/* Insights */}
          <div className={activeItem === "insights" ? "block" : "hidden"}>
            <h3 className="text-lg font-semibold mb-4">Analytics Overview</h3>
            <div className="h-64 flex items-center justify-center text-sky-400">
              📊 Chart Placeholder
            </div>
          </div>

          {/* Installation */}
          <div className={activeItem === "products" ? "block" : "hidden"}>
            <Products />
          </div>

          {/* Community */}
          <div className={activeItem === "community" ? "block" : "hidden"}>
            <h3 className="text-lg font-semibold mb-4">Users List</h3>
            <ul className="space-y-2">
              <li className="bg-white/10 p-3 rounded-md">👤 User 1</li>
              <li className="bg-white/10 p-3 rounded-md">👤 User 2</li>
              <li className="bg-white/10 p-3 rounded-md">👤 User 3</li>
            </ul>
          </div>

          {/* Pro Users */}
          <div className={activeItem === "pro" ? "block" : "hidden"}>
            <h1>Pro Users</h1>
          </div>

          {/* Profile */}
          <div className={activeItem === "profile" ? "block" : "hidden"}>
            <UserProfile />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Page;
