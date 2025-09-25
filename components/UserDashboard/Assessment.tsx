"use client";

import { auth, firestore } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface RoofTopData {
  rooftop: {
    area: string;
    type: string;
    dwellers: string;
    space: string;
  };
}

function sqftToSqm(sqft: number): number {
  const sqm = sqft * 0.092903; // 1 ft² = 0.092903 m²
  return parseFloat(sqm.toFixed(4)); // rounding to 4 decimal places
}

const Assessment: React.FC = () => {
  // Dashboard Overview State
  const [area, setArea] = useState("");
  const [type, setType] = useState("");
  const [space, setSpace] = useState("");
  const [dwellers, setDewellers] = useState("");

  // Rooftop Harvest Analysis
  const collectedRainfall = sqftToSqm(+area) * 2.5 * 0.82 * 1000;
  const harvestPotential = sqftToSqm(+area) * 2.5 * 1000;
  const perPersonAvail = harvestPotential / +dwellers;

  // Rooftop Efficiency
  const efficiency = (collectedRainfall / harvestPotential) * 100;

  // Storage Tank Calculations
  const [storageDays, setStorageDays] = useState("");
  const tankVolume = +dwellers * 135 * +storageDays;
  const tankUtilization =
    (Math.min(collectedRainfall, tankVolume) / tankVolume) * 100;

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(firestore, "users", currentUser.uid);
        const roofTopSnap = await getDoc(docRef);

        if (roofTopSnap.exists()) {
          try {
            const getRoofTopData = roofTopSnap.data() as RoofTopData;
            setArea(getRoofTopData.rooftop.area);
            setType(getRoofTopData.rooftop.type);
            setSpace(getRoofTopData.rooftop.space);
            setDewellers(getRoofTopData.rooftop.dwellers);
          } catch (e) {
            console.log(e);
          }
        } else {
          console.log("No Data found");
        }
      }
    });
  }, []);

  // Dummy Data
  const yearlyHarvestData = [
    { month: "Jan", liters: 120 },
    { month: "Feb", liters: 300 },
    { month: "Mar", liters: 250 },
    { month: "Apr", liters: 500 },
    { month: "May", liters: 700 },
    { month: "Jun", liters: 1000 },
    { month: "Jul", liters: 900 },
    { month: "Aug", liters: 800 },
    { month: "Sep", liters: 600 },
    { month: "Oct", liters: 400 },
    { month: "Nov", liters: 300 },
    { month: "Dec", liters: 200 },
  ];

  const usageBreakdown = [
    { name: "Drinking", value: 15 },
    { name: "Cooking", value: 25 },
    { name: "Cleaning", value: 30 },
    { name: "Gardening", value: 20 },
    { name: "Others", value: 10 },
  ];

  const COLORS = ["#4ade80", "#60a5fa", "#facc15", "#f472b6", "#c084fc"];

  return (
    <div className="p-4 relative z-[-1]">
      {/* Dashboard Overview */}
      <div className="relative z-0">
        <h3 className="text-2xl font-bold text-sky-300 mb-4" id="overview" data-tab="assessment">
          Dashboard Overview
        </h3>
        <div className="relative **:z-[-1] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Rooftop Area", value: area + " sq. ft." },
            { title: "Rooftop Type", value: type },
            { title: "Available Space", value: space + " sq. ft." },
            { title: "No. of Dwellers", value: dwellers },
          ].map((item, i) => (
            <div
              key={i}
              className="relative **:z-0 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-md"
            >
              <h3 className="text-lg font-semibold"  id={"rooftop-" + i} data-tab="assessment">{item.title}</h3>
              <p className="text-2xl font-bold mt-2 text-sky-300">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Water Storage Analysis */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4" id="harvest_1">
          Rainwater Harvest Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-green-900/20 backdrop-blur-md border border-green-500/30 shadow-md">
            <h3 className="text-lg font-semibold" id="harvest_2">Total Harvest Potential</h3>
            <p className="text-2xl font-bold mt-2 text-green-400">
              {/* 15,000 Liters / Year */}
              {Math.round(harvestPotential).toLocaleString()} Liters / Year
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-blue-900/20 backdrop-blur-md border border-blue-500/30 shadow-md">
            <h3 className="text-lg font-semibold">Per Person Availability</h3>
            <p className="text-2xl font-bold mt-2 text-blue-400">
              {Math.round(perPersonAvail).toLocaleString()} Liters / Year
            </p>
          </div>
        </div>

        {/* Roof Efficiency Card */}
        <div className="relative p-6 mt-10 rounded-2xl border border-sky-400/30 bg-gradient-to-r from-sky-900/20 to-indigo-900/20 backdrop-blur-md shadow-2xl hover:scale-101 transition-transform duration-300">
          {/* Decorative Water Droplet */}
          <div className="absolute -top-4 -right-4 text-6xl text-sky-500/30 animate-bounce">
            💧
          </div>

          {/* Heading */}
          <h4 className="text-2xl font-bold text-white mb-3">
            How Efficient Is Your Rooftop ?
          </h4>

          {/* Subheading / Message */}
          <p className="text-lg text-gray-200 mb-4">
            {efficiency >= 85
              ? `🏆 Excellent! Your roof is a rain-catching hero!`
              : efficiency >= 60
              ? `🌤 Good job! A little tweak could boost it further.`
              : `⚠️ Only ${Math.round(
                  efficiency
                )}% collected… check your gutters and rooftop!`}
          </p>

          {/* Efficiency Percentage */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-lg">
              {Math.round(efficiency)}%
            </span>
            <span className="text-gray-300 text-sm">Efficiency</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-4 rounded-full bg-sky-800/40">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-400 transition-all duration-1000"
              style={{ width: `${Math.round(efficiency)}%` }}
            ></div>
          </div>

          {/* Extra Visual Flair */}
          <div className="absolute -bottom-4 left-4 text-xl text-indigo-400/40 animate-pulse">
            💦
          </div>
        </div>
      </div>

      {/* Storage Tank Analysis */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4">Storage Tank Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-blue-900/20 backdrop-blur-md border border-blue-500/30 shadow-md space-y-5">
            <h3 className="text-lg font-semibold">Required Tank Volume</h3>
            <div className="flex flex-col gap-3">
              <label htmlFor="">
                Number of days to store water without rain
              </label>
              <input
                type="text"
                placeholder="e.g., 30 (days of water storage)"
                className="w-100 p-4 rounded-xl bg-white/10 text-white/90 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm shadow-md"
                onChange={(e) => setStorageDays(e.target.value)}
              />
            </div>

            <p className="text-gray-400">
              To store water for dry periods or to match daily consumption:
            </p>
            <p className="text-2xl font-bold mt-2 text-blue-400">
              {Math.round(tankVolume).toLocaleString()} Liters
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-blue-900/20 backdrop-blur-md border border-blue-500/30 shadow-md space-y-5">
            <h3 className="text-lg font-semibold">
              Tank Utilization Efficiency
            </h3>
            <ul className="list-disc ml-5 text-gray-400">
              <li>Shows how effectively your tank is used.</li>
              <li>
                If {">"} 100%, tank is too small; if {"<"} 50%, tank may be
                oversized.
              </li>
            </ul>
            <p className="text-2xl font-bold mt-2 text-blue-400">
              {+storageDays != 0 ? (
                Math.round(tankUtilization).toLocaleString() + "%"
              ) : "Tank utilization will appear here"}
            </p>
            <div className="w-full h-4 rounded-full bg-sky-800/40">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-400 transition-all duration-1000"
                style={{
                  width: `${
                    +storageDays == 0 ? 0 : Math.round(tankUtilization)
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Rainwater Collection Trend */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4">
          Rainwater Collection Trend
        </h3>
        <div className="h-72 bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-md">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearlyHarvestData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="liters"
                stroke="#38bdf8"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Usage Breakdown Pie Chart */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Usage Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={usageBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {usageBreakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Environmental Impact Card */}
        <div className="p-6 rounded-2xl bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Environmental Impact</h3>
          <p className="text-gray-200 mb-2">
            By installing rooftop rainwater harvesting, you can save:
          </p>
          <ul className="space-y-2 text-emerald-300 font-semibold">
            <li>🌍 Reduce 30% dependency on groundwater</li>
            <li>💧 Save 15,000 Liters yearly</li>
            <li>🌱 Recharge aquifers in your locality</li>
            <li>⚡ Save energy used in pumping water</li>
          </ul>
        </div>
      </div>

      {/* What-If Analysis */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4" id="what-if" data-tab="assessment">What-If Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-purple-900/20 backdrop-blur-md border border-purple-500/30 shadow-md">
            <h3 className="text-lg font-semibold">Double Rooftop Area</h3>
            <p className="text-xl font-bold text-purple-400 mt-2">
              30,000 Liters / Year
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-pink-900/20 backdrop-blur-md border border-pink-500/30 shadow-md">
            <h3 className="text-lg font-semibold">Reduce Dwellers by Half</h3>
            <p className="text-xl font-bold text-pink-400 mt-2">
              4,000 Liters / Person
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-yellow-900/20 backdrop-blur-md border border-yellow-500/30 shadow-md">
            <h3 className="text-lg font-semibold">Add Storage Tank</h3>
            <p className="text-xl font-bold text-yellow-400 mt-2">
              5,000 Liters Extra Capacity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
