"use client";

import { onAuthStateChanged } from "firebase/auth/cordova";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";
import { UserCircle2 } from "lucide-react";

interface UserInfoProps {
  displayName?: string | null | undefined;
  email?: string | null | undefined;
  collapsed: boolean
}

const UserInfo: React.FC<UserInfoProps> = ({ displayName, email, collapsed }) => {
  // const [user, setUser] = useState<User | null> (null)
  const router = useRouter();
  const [username, setUsername] = useState(displayName)

  // Handle auth state check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/");
        console.log("User is not authenticated");
      }
      setUsername(displayName)
    });

    return () => unsubscribe();
  }, [router, displayName]);

  // if (loading) return <LoadingPage />;

  return (
    <div
      // onClick={() => router.push("/dashboard/profile")}
      className={`w-full relative rounded-xl px-4 py-3 cursor-pointer
                 ${!collapsed ? "bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 ease-in-out hover:bg-sky-500/20 " : "right-0 p-10 ml-[-11] pe-13"} hover:bg-sky-500/20 hover:scale-[1.02]`}
    >
      {/* Inner flex row */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <UserCircle2 className="w-10 h-10 text-sky-300 transition-transform duration-300 group-hover:scale-110" />
        </div>

        {/* User Details */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {username || "Guest User"}
          </p>
          <p className="text-xs text-sky-200/80 truncate">
            {email || "guest@example.com"}
          </p>
        </div>
      </div>

      {/* Animated gradient line at bottom */}
      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-sky-400 to-indigo-400 transition-all duration-300 group-hover:w-full rounded-b-xl"></span>
    </div>
  );
};

export default UserInfo;
