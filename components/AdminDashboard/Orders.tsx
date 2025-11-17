"use client";

import React, { useState } from "react";

interface Order {
  id: string;
  customer: string;
  contact: string;
  rooftopSize: string;
  package: string;
  addons: string[];
  status: "Pending" | "In Progress" | "Installed" | "Maintenance";
  date: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "RWH-001",
      customer: "Akash Saha",
      contact: "akash@example.com | +91 9876543210",
      rooftopSize: "120 m²",
      package: "Medium Rooftop (1000L Tank + Recharge Pit)",
      addons: ["IoT Flow Sensor", "Filtration Kit"],
      status: "Pending",
      date: "2025-09-20",
    },
    {
      id: "RWH-002",
      customer: "Ankit Jha",
      contact: "ankit@example.com | +91 9123456780",
      rooftopSize: "200 m²",
      package: "Large Rooftop (1500L+ Tank + Automation)",
      addons: ["Smart Automation Kit"],
      status: "In Progress",
      date: "2025-09-22",
    },
    {
      id: "RWH-003",
      customer: "Priya Sharma",
      contact: "priya@example.com | +91 9988776655",
      rooftopSize: "75 m²",
      package: "Small Rooftop (500L Tank)",
      addons: [],
      status: "Installed",
      date: "2025-09-15",
    },
  ]);

  return (
    <div className="relative p-6 rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl">
      <h3 className="text-2xl font-bold mb-6 text-sky-300">📦 Orders Management</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="bg-sky-900/50 text-gray-100">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Rooftop Size</th>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Add-ons</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-white/10 hover:bg-white/5 transition"
              >
                <td className="px-4 py-3 font-semibold text-sky-300">{order.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{order.customer}</div>
                  <div className="text-xs text-gray-400">{order.contact}</div>
                </td>
                <td className="px-4 py-3">{order.rooftopSize}</td>
                <td className="px-4 py-3">{order.package}</td>
                <td className="px-4 py-3">
                  {order.addons.length > 0 ? (
                    <ul className="list-disc ml-4 text-xs">
                      {order.addons.map((addon, i) => (
                        <li key={i}>{addon}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs ${
                      order.status === "Pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : order.status === "In Progress"
                        ? "bg-blue-500/20 text-blue-400"
                        : order.status === "Installed"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-purple-500/20 text-purple-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3">{order.date}</td>
                <td className="px-4 py-3 text-center space-x-2">
                  <button className="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30">
                    View
                  </button>
                  <button className="px-3 py-1 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30">
                    Update
                  </button>
                  <button className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30">
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
