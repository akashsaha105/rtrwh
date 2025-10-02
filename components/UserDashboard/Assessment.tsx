"use client";

import { auth, firestore } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface City {
  location: {
    city: string;
  };
}

interface RoofTopData {
  rooftop: {
    area: string;
    type: string;
    dwellers: string;
    space: string;
  };
}

async function getCoordinates(cityName: string) {
   
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${cityName}`
    );
    const data = await response.json();
    if (data.length > 0) {
      const latitude = parseFloat(data[0].lat);
      const longitude = parseFloat(data[0].lon);
      return { latitude, longitude };
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching coordinates:", err);
    return null;
  }
}

function sqftToSqm(sqft: number): number {
  const sqm = sqft * 0.092903; // 1 ft² = 0.092903 m²
  return parseFloat(sqm.toFixed(4)); // rounding to 4 decimal places
}

const Assessment: React.FC = () => {
  const t = useTranslations("assessment");

  // User city
  const [city, setCity] = useState("");

  // Dashboard Overview State
  const [area, setArea] = useState("");
  const [type, setType] = useState("");
  const [space, setSpace] = useState("");
  const [dwellers, setDwellers] = useState("");

  // Rainfall
  const [rainfall, setRainfall] = useState(0); // in mm

  // Load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(firestore, "users", currentUser.uid);

        const unsubscribeSnapshot = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            try {
              const data = snapshot.data(); 

              const getRoofTopData = data as RoofTopData;
              if (getRoofTopData.rooftop.area != "") setArea(getRoofTopData.rooftop.area)
              if (getRoofTopData.rooftop.type != "") setType(getRoofTopData.rooftop.type);
              if (getRoofTopData.rooftop.space != "") setSpace(getRoofTopData.rooftop.space);
              if (getRoofTopData.rooftop.dwellers != "") setDwellers(getRoofTopData.rooftop.dwellers);
              
              const getCity = data as City;
              if (getCity.location.city != "") setCity(getCity.location.city);
              
            } catch (e) {
              console.log(e);
            }
          } else {
            console.log("No Data found");
          }
        });

        return () => unsubscribeSnapshot(); // cleanup snapshot
      }
    });

    return () => unsubscribe(); // cleanup auth
  }, []);

  // Fetch annual rainfall from Open-Meteo
  useEffect(() => {
    if (!city) return;

    const fetchAnnualRainfall = async () => {
      const coords = await getCoordinates(city);
      if (!coords) {
        console.log("Could not get coordinates for city:", city);
        return;
      }
      try {
        const res = await fetch(
          `https://archive-api.open-meteo.com/v1/archive?latitude=${coords.latitude}&longitude=${coords.longitude}&start_date=2025-09-12&end_date=2025-09-26&daily=rain_sum&timezone=auto`
        );
        const data = await res.json();
        // const annual = data?.rain_sum?.reduce(
        //   (a: number, b: number) => a + b,
        //   0
        // ) || 0;
        let annual = 0;

        for (let i = 0; i < data.daily.rain_sum.length; i++) {
          annual += data.daily.rain_sum[i];
        }
        setRainfall(annual);
        console.log("Annual Rainfall (mm):", annual);
      } catch (err) {
        console.log("Error fetching annual rainfall:", err);
      }
    };

    fetchAnnualRainfall();
  }, [city]);

  // Rooftop Harvest Analysis
  const harvestPotential = sqftToSqm(+area) * (rainfall / 1000) * 1000; // Total Harvest Potential
  const perPersonAvail = harvestPotential / +dwellers; // Per person Availability

  // Rooftop Efficiency
  let runoffCoefficient = 0.9;

  switch (type) {
    case "Flat":
      runoffCoefficient = 0.75;

    case "Sloped":
      runoffCoefficient = 0.85;

    case "Asbestos":
      runoffCoefficient = 0.7;

    case "Metal Sheet Roof":
      runoffCoefficient = 0.9;

    case "Bamboo Roof":
      runoffCoefficient = 0.65;
  }

  const collectedRainfall =
    sqftToSqm(+area) * (rainfall / 1000) * runoffCoefficient * 1000;
  const efficiency = (collectedRainfall / harvestPotential) * 100;

  // Storage Tank Calculations
  const [storageDays, setStorageDays] = useState("");
  const tankVolume = +dwellers * 135 * +storageDays;
  const tankUtilization =
    (Math.min(collectedRainfall, tankVolume) / tankVolume) * 100;

  const usageBreakdown = [
    { name: "Drinking", value: 15 },
    { name: "Cooking", value: 25 },
    { name: "Cleaning", value: 30 },
    { name: "Gardening", value: 20 },
    { name: "Others", value: 10 },
  ];

  const COLORS = ["#4ade80", "#60a5fa", "#facc15", "#f472b6", "#c084fc"];

  return (
    <div className="p-8 relative">
      {/* Dashboard Overview */}
      <div className="relative">
        <h2
          className="text-3xl font-bold mb-6 flex items-center gap-2 text-sky-300"
          id="overview"
          data-tab="assessment"
        >
          {/* Dashboard Overview */}
          {t("dashboardOverview")}
        </h2>
        <div className="relative **:z-[-1] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: t("rooftopArea"), value: area + " sq. ft." },
            { title: t("rooftopType"), value: type },
            { title: t("availableSpace"), value: space + " sq. ft." },
            { title: t("noOfDwellers"), value: dwellers },
          ].map((item, i) => (
            <div
              key={i}
              className="relative **:z-0 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-md"
            >
              <h3
                className="text-lg font-semibold"
                id={"rooftop-" + i}
                data-tab="assessment"
              >
                {item.title}
              </h3>
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
          {t("rainwaterHarvestAnalysis")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-green-900/20 backdrop-blur-md border border-green-500/30 shadow-md">
            <h3 className="text-lg font-semibold" id="harvest_2">
              {t("totalHarvestPotential")}
            </h3>
            <p className="text-2xl font-bold mt-2 text-green-400">
              {/* 15,000 Liters / Year */}
              {Math.round(harvestPotential).toLocaleString()} Liters / Year
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-blue-900/20 backdrop-blur-md border border-blue-500/30 shadow-md">
            <h3 className="text-lg font-semibold">
              {t("perPersonAvailability")}
            </h3>
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
            {t("roofEfficiencyHeading")}
          </h4>

          {/* Subheading / Message */}
          <p className="text-lg text-gray-200 mb-4">
            {efficiency >= 85
              ? t("roofEfficiencyExcellent")
              : efficiency >= 60
              ? t("roofEfficiencyGood")
              : t("roofEfficiencyLow")}
          </p>

          {/* Efficiency Percentage */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-lg">
              {Math.round(efficiency)}%
            </span>
            <span className="text-gray-300 text-sm">{t("efficiency")}</span>
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

      {/* Recommendation for Groundwater Recharge Structures */}
      <div className="mt-12 mb-12">
        <h4 className="text-2xl font-semibold text-green-400 mb-6 flex items-center gap-2">
          💧{t("rechargeStructureRecommendations")}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              type: "Recharge Pit",
              dimension: "2m x 2m x 2.5m",
              capacity: "10,000 L",
              suitability: "Best for clayey soil",
            },
            {
              type: "Recharge Trench",
              dimension: "1m x 8m x 2m",
              capacity: "16,000 L",
              suitability: "Good for sandy soil",
            },
            {
              type: "Recharge Shaft",
              dimension: "Ø 1.5m x 12m",
              capacity: "25,000 L",
              suitability: "Ideal for deep aquifers",
            },
          ].map((structure, idx) => (
            <div
              key={idx}
              className="relative bg-gradient-to-br from-green-900/40 to-green-700/20 p-6 rounded-2xl border border-green-400/30 transition transform shadow-lg"
            >
              <h5 className="text-xl font-bold text-green-300 mb-3">
                {structure.type}
              </h5>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <strong>{t("dimension")}:</strong> {structure.dimension}
                </li>
                <li>
                  <strong>{t("capacity")}:</strong> {structure.capacity}
                </li>
                <li>
                  <strong>{t("bestFor")}:</strong> {structure.suitability}
                </li>
              </ul>
              <button className="mt-4 px-4 py-2 bg-green-600/60 hover:bg-green-500 text-white rounded-lg text-sm cursor-pointer">
                {t("learnMore")}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation for Storage Tank */}
      <div className="mb-12">
        <h4 className="text-2xl font-semibold text-blue-400 mb-6 flex items-center gap-2">
          🛢️ {t("storageTankRecommendations")}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              type: "Underground Tank",
              dimension: "5m x 4m x 3m",
              capacity: "60,000 L",
              utilization: 72,
            },
            {
              type: "Overhead Tank",
              dimension: "3m x 3m x 4m",
              capacity: "36,000 L",
              utilization: 85,
            },
          ].map((tank, idx) => (
            <div
              key={idx}
              className="relative bg-blue-900/20 backdrop-blur-md border-blue-500/30 p-6 rounded-2xl border transition transform shadow-lg"
            >
              <h5 className="text-xl font-bold text-blue-400 mb-3">
                {tank.type}
              </h5>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <strong>{t("dimension")}:</strong> {tank.dimension}
                </li>
                <li>
                  <strong>{t("capacity")}:</strong> {tank.capacity}
                </li>
              </ul>

              <button className="mt-4 px-4 py-2 bg-sky-600/60 hover:bg-blue-500 text-white rounded-lg text-sm cursor-pointer">
                Learn More
              </button>
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-blue-900/20 backdrop-blur-md border border-blue-500/30 shadow-md space-y-5">
            <h3 className="text-lg font-semibold">{t("requiredTankVolume")}</h3>
            <div className="flex flex-col gap-3">
              <label htmlFor="">{t("numberOfDays")}</label>
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
              {t("tankUtilizationEfficiency")}
            </h3>
            <ul className="list-disc ml-5 text-gray-400">
              <li>Shows how effectively your tank is used.</li>
              <li>
                If {">"} 100%, tank is too small; if {"<"} 50%, tank may be
                oversized.
              </li>
            </ul>
            <p className="text-2xl font-bold mt-2 text-blue-400">
              {+storageDays != 0
                ? Math.round(tankUtilization).toLocaleString() + "%"
                : "Tank utilization will appear here"}
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

      {/* Usage Breakdown Pie Chart */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t("usageBreakdown")}</h3>
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
          <h3 className="text-lg font-semibold mb-4">
            {t("environmentalImpact")}
          </h3>
          <p className="text-gray-200 mb-2">{t("impactDescription")}:</p>
          <ul className="space-y-2 text-emerald-300 font-semibold">
            <li>🌍 Reduce 30% dependency on groundwater</li>
            <li>💧 Save 15,000 Liters yearly</li>
            <li>🌱 Recharge aquifers in your locality</li>
            <li>⚡ Save energy used in pumping water</li>
          </ul>
        </div>
      </div>
      {/* Cost Estimation & Cost-Benefit Analysis */}
      <div className="mt-12 mb-12">
        <h4 className="text-2xl font-semibold text-amber-400 mb-6 border-b border-amber-400/30 pb-2">
          Cost Estimation & Benefits
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Installation & Maintenance Cost */}
          <div className="bg-gradient-to-br from-amber-900/30 to-amber-700/20 p-6 rounded-2xl border border-amber-400/30 shadow-lg">
            <h5 className="text-xl font-bold text-amber-300 mb-4">
              Estimated Costs
            </h5>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex justify-between">
                <span>Installation Cost:</span>
                <span className="font-semibold text-white">₹ 1,20,000</span>
              </li>
              <li className="flex justify-between">
                <span>Annual Maintenance:</span>
                <span className="font-semibold text-white">₹ 5,000</span>
              </li>
              <li className="flex justify-between">
                <span>Expected Lifespan:</span>
                <span className="font-semibold text-white">15+ Years</span>
              </li>
            </ul>
          </div>

          {/* Cost-Benefit Analysis */}
          <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-700/20 p-6 rounded-2xl border border-emerald-400/30 shadow-lg">
            <h5 className="text-xl font-bold text-emerald-300 mb-4">
              Benefits & Savings
            </h5>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex justify-between">
                <span>Annual Water Bill Savings:</span>
                <span className="font-semibold text-white">₹ 25,000</span>
              </li>
              <li className="flex justify-between">
                <span>Subsidy Eligible:</span>
                <span className="font-semibold text-white">
                  Yes (Up to 30%)
                </span>
              </li>
              <li className="flex justify-between">
                <span>Payback Period:</span>
                <span className="font-semibold text-white">~ 4.5 Years</span>
              </li>
              <li className="flex justify-between">
                <span>Return on Investment (10 Yrs):</span>
                <span className="font-semibold text-white">3.2x</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ROI */}
      <div className="bg-gradient-to-r from-sky-900/30 to-indigo-900/30 p-6 rounded-2xl border border-sky-400/30 backdrop-blur-md shadow-xl hover:scale-[1.01] transition">
        <h4 className="text-xl font-semibold text-sky-300">
          ⏳ {t("roiHeading")}
        </h4>
        <p className="text-lg mt-2 text-gray-200">
          Your system will pay for itself in around{" "}
          <span className="text-sky-400 font-bold">2 years</span>.
        </p>
      </div>

      {/* Benefits */}
      <div>
        <h4 className="text-xl font-semibold text-purple-300 mt-10 my-4">
          🌱 {t("keyBenefits")}
        </h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Save up to 40% on water bills",
            "Recharge groundwater",
            "Eco-friendly solution",
            "Eligible for subsidies",
            "IoT monitoring options",
            "Drought resilience",
          ].map((benefit, i) => (
            <li
              key={i}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 p-4 rounded-xl transition"
            >
              ✅ <span className="text-gray-200">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* What-If Analysis */}
      <div className="mt-10">
        <h3
          className="text-lg font-semibold mb-4"
          id="what-if"
          data-tab="assessment"
        >
          {t("whatIfAnalysis")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-purple-900/20 backdrop-blur-md border border-purple-500/30 shadow-md">
            <h3 className="text-lg font-semibold">{t("doubleRooftopArea")}</h3>
            <p className="text-xl font-bold text-purple-400 mt-2">
              30,000 Liters / Year
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-pink-900/20 backdrop-blur-md border border-pink-500/30 shadow-md">
            <h3 className="text-lg font-semibold">{t("reduceDwellers")}</h3>
            <p className="text-xl font-bold text-pink-400 mt-2">
              4,000 Liters / Person
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-yellow-900/20 backdrop-blur-md border border-yellow-500/30 shadow-md">
            <h3 className="text-lg font-semibold">{t("addStorageTank")}</h3>
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
