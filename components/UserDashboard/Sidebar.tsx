"use client";

import React, { useState, useEffect } from "react";
import { Bars3Icon, ChartPieIcon, XMarkIcon } from "@heroicons/react/16/solid";
import UserInfo from "./UserInfo";
import { DownloadIcon, File, StoreIcon, User2, WorkflowIcon } from "lucide-react";
import WeatherForecast from "./WeatherForecast";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

interface DashboardSideBarProps {
  username?: string | null | undefined;
  email?: string | null | undefined;
  activeItem: string;
  setActiveItem: (id: string) => void;
}

const SideBar: React.FC<DashboardSideBarProps> = ({
  username,
  email,
  activeItem,
  setActiveItem,
}) => {

  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [city, setCity] = useState("")

  useEffect(() => {
    setMounted(true);
  }, []);

  const width = 20,
    height = 20;

  const SideBarItems = [
    {
      id: "assessment",
      name: "Assessment",
      icon: <ChartPieIcon width={width} height={height} />,
      href: "/dashboard/analytics",
    },
    {
      id: "insights",
      name: "Insights",
      icon: <DownloadIcon width={width} height={height} />,
      href: "/dashboard/reports",
    },
    {
      id: "products",
      name: "Products",
      icon: <WorkflowIcon width={width} height={height} />,
      href: "/dashboard/settings",
    },
    {
      id: "community",
      name: "Community",
      icon: <StoreIcon width={width} height={height} />,
      href: "/dashboard/support",
    },
    {
      id: "pro",
      name: "Pro Users",
      icon: <User2 width={width} height={height} />,
      href: "/dashboard/support",
    },
    {
      id: "pdf",
      name: "PDF Report",
      icon: <File width={width} height={height} />,
      href: "/dashboard/support",
    },
  ];
  
  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser){
        const myDoc = await getDoc(doc(firestore, "users", currentUser.uid))

        if (myDoc.exists()) {
          const data = myDoc.data()
          setCity(data.location.city)
        }
      }
    })
  })
  // console.log(city)
  
  if (!mounted) return null;

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } relative z-50 hidden md:flex flex-col p-4 border-r border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300`}
    >
      {/* Sidebar Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-6 text-sky-300 text-sm font-semibold cursor-pointer"
      >
        {collapsed ? <Bars3Icon className="w-6 h-6 text-sky-300 animate-pulse mx-auto" /> : (
          <XMarkIcon className="w-6 h-6 text-sky-300 animate-pulse" />
        )}
      </button>

      {/* Nav Items */}
      <nav className="flex-1 space-y-2">
        {SideBarItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={`relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all group
              ${
                activeItem === item.id
                  ? "bg-sky-500/30 text-sky-300"
                  : "bg-white/10 hover:bg-white/20 text-white/80"
              }`}
          >
            {item.icon}
            {!collapsed && <span>{item.name}</span>}
            {collapsed && (
              <span className="absolute left-16 px-2 py-1 text-xs rounded bg-slate-800/90 text-white z-50 opacity-0 group-hover:opacity-100 transition">
                {item.name}
              </span>
            )}
          </div>
        ))}

        {/* Rainfall Forecast Card */}
        {/* 3-Day Weather Forecast Card */}
        {/* {!collapsed && <WeatherForecast collapsed={collapsed}/>} */}
        <WeatherForecast collapsed={collapsed} city={city}/>
      </nav>

      {/* User Info */}
      <div className="mt-auto" onClick={() => setActiveItem("profile")}>
        <UserInfo displayName={username} email={email} collapsed={collapsed}/>
      </div>
    </aside>
  );
};

export default SideBar;
