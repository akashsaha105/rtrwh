"use client";

import React from "react";
import {
  Droplets,
  Database,
  CloudRain,
  BarChart2,
  TrendingDown,
  Gauge,
} from "lucide-react";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";

const Insights = () => {
  // Dummy Data
  const monthlyPerformance = [
    { month: "Jan", rainfall: 320, harvested: 250 },
    { month: "Feb", rainfall: 280, harvested: 210 },
    { month: "Mar", rainfall: 400, harvested: 320 },
    { month: "Apr", rainfall: 600, harvested: 480 },
    { month: "May", rainfall: 720, harvested: 600 },
    { month: "Jun", rainfall: 950, harvested: 820 },
    { month: "Jul", rainfall: 880, harvested: 700 },
    { month: "Aug", rainfall: 790, harvested: 680 },
    { month: "Sep", rainfall: 610, harvested: 500 },
    { month: "Oct", rainfall: 450, harvested: 360 },
    { month: "Nov", rainfall: 320, harvested: 260 },
    { month: "Dec", rainfall: 200, harvested: 160 },
  ];

  return (
    <>
      <div>
        <div className=" p-8 min-h-screen text-white">
          {/* Page Header */}
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <BarChart2 className="h-8 w-8 text-green-400" />
            Rainwater Harvesting Insights
          </h2>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <Droplets className="h-6 w-6 text-blue-400" />
                <h3 className="text-lg font-semibold">Rain Captured</h3>
              </div>
              <p className="text-2xl font-bold mt-3">15,200 Liters</p>
              <p className="text-sm text-white/60">This month’s total</p>
            </div>

            <div className="bg-white/10 p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-yellow-400" />
                <h3 className="text-lg font-semibold">Tank Utilization</h3>
              </div>
              <p className="text-2xl font-bold mt-3">78%</p>
              <p className="text-sm text-white/60">Current storage filled</p>
            </div>

            <div className="bg-white/10 p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <CloudRain className="h-6 w-6 text-green-400" />
                <h3 className="text-lg font-semibold">Groundwater Recharge</h3>
              </div>
              <p className="text-2xl font-bold mt-3">↑ 72%</p>
              <p className="text-sm text-white/60">12,000 liters contributed</p>
            </div>
          </div>

          {/* Recommendation for Storage Tank */}
          <div className="mb-12">
            <h4 className="text-2xl font-semibold text-blue-400 mb-6 flex items-center gap-2">
              🛢️ Storage Tank
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
                      <strong>Dimension:</strong> {tank.dimension}
                    </li>
                    <li>
                      <strong>Capacity:</strong> {tank.capacity}
                    </li>
                  </ul>

                  {/* Utilization Progress Bar */}
                  <div className="mt-4">
                    <p className="text-sm text-white/70 mb-1">Utilization</p>
                    <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${tank.utilization}%` }}
                        className="h-3 bg-blue-400 rounded-full"
                      ></div>
                    </div>
                    <p className="text-xs mt-1 text-yellow-300">
                      {tank.utilization}% filled
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Performance Insights */}
          <div className="mt-8 min-h-screen text-white">
            {/* Page Header */}
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
              <Gauge className="h-8 w-8 text-emerald-400" />
              Performance Insights
            </h2>

            {/* Key Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/10 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <Droplets className="h-6 w-6 text-blue-400" />
                  <h3 className="text-lg font-semibold">System Efficiency</h3>
                </div>
                <p className="text-2xl font-bold mt-3">81%</p>
                <p className="text-sm text-white/60">
                  Captured vs. potential rainfall
                </p>
              </div>

              <div className="bg-white/10 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-yellow-400" />
                  <h3 className="text-lg font-semibold">Demand Coverage</h3>
                </div>
                <p className="text-2xl font-bold mt-3">67%</p>
                <p className="text-sm text-white/60">
                  Household demand met by rainwater
                </p>
              </div>

              <div className="bg-white/10 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-6 w-6 text-red-400" />
                  <h3 className="text-lg font-semibold">Overflow Loss</h3>
                </div>
                <p className="text-2xl font-bold mt-3">2,500 L</p>
                <p className="text-sm text-white/60">This month’s wastage</p>
              </div>

              <div className="bg-white/10 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <CloudRain className="h-6 w-6 text-green-400" />
                  <h3 className="text-lg font-semibold">
                    Groundwater Recharge
                  </h3>
                </div>
                <p className="text-2xl font-bold mt-3">8,000 L</p>
                <p className="text-sm text-white/60">Recharged into aquifer</p>
              </div>
            </div>

            {/* Rainfall vs Harvested Water */}
            <div className="mb-12">
              <h4 className="text-2xl font-semibold text-cyan-300 mb-6">
                Rainfall vs Harvested Water
              </h4>
              <div className="h-80 bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-md">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#666" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="rainfall"
                      fill="#60a5fa"
                      name="Rainfall (L)"
                    />
                    <Bar
                      dataKey="harvested"
                      fill="#34d399"
                      name="Harvested (L)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Seasonal Trend */}
            <div className="mb-12">
              <h4 className="text-2xl font-semibold text-pink-300 mb-6">
                Seasonal Performance Trend
              </h4>
              <div className="h-80 bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-md">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#666" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="harvested"
                      stroke="#f472b6"
                      strokeWidth={3}
                      name="Harvested (L)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Predictions & Recommendations */}
          <div className="bg-white/5 p-6 rounded-2xl shadow-lg">
            <h4 className="text-xl font-semibold text-emerald-300 mb-4">
              📈 Predictions & Recommendations
            </h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li>
                • Based on forecasted rainfall, your system will likely store{" "}
                <span className="text-emerald-300 font-semibold">45,000 L</span>{" "}
                by end of next month.
              </li>
              <li>
                • Overflow risk is high. Adding{" "}
                <span className="text-emerald-300 font-semibold">+5,000 L</span>{" "}
                storage can reduce wastage by 70%.
              </li>
              <li>
                • With current efficiency, expect a payback period of{" "}
                <span className="text-emerald-300 font-semibold">
                  4.2 years
                </span>
                .
              </li>
              <li>
                • System is covering{" "}
                <span className="text-emerald-300 font-semibold">67%</span> of
                your household demand — consider adding secondary recharge pit
                for dry season support.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg">
        <div className="max-w-3xl ml-80 px-6 py-3 flex items-center justify-between">
          {/* Message */}
          <p className="text-sm md:text-base font-medium">
            🚀 Your system is now inactive! Install now to start tracking water
            savings.
          </p>

          {/* Button */}
          <button className="bg-white text-green-700 font-semibold px-5 py-2 rounded-xl shadow hover:bg-green-100 transition cursor-pointer">
            Install Now
          </button>
        </div>
      </div>
    </>
  );
};

export default Insights;
