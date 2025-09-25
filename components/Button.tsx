import Link from "next/link";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

const DashboardButton = () => {
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser?.email) {
        setUserEmail(currentUser.email);
      } else {
        setUserEmail(""); // reset if user logs out
      }
    });

    return () => unsubscribe(); // cleanup listener
  }, []);

  return (
    <div>
      <Link
        href={userEmail === "admin123@admin.com" ? "/adminDashboard" : "/dashboard"}
        className="bg-white/15 text-white px-4 py-3.5 rounded-md hover:bg-white/25 transition cursor-pointer"
      >
        Dashboard
      </Link>
    </div>
  );
};

export default DashboardButton;
