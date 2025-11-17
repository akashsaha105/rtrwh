"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase";

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: "Active" | "Inactive" | "Blocked" | "Pending";
  location: {
    address: string;
  };
  proUser: true; // replaces score
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // 🔹 Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(firestore, "users");
        const snapshot = await getDocs(usersCollection);

        const usersData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as User)
        );

        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // 🔎 Filtering logic
  const filteredUsers = users.filter((user) => {
    const name = user.fullName || "";
    const email = user.email || "";

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 🌟 Pro Users
  const proUsers = users.filter((user) => user.proUser).slice(0, 3);

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg">
      <h3 className="text-2xl font-bold mb-6 text-sky-300">Users Dashboard</h3>

      {/* 🔍 Search + Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-white/10 text-white/90 placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-sky-400"
        />

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 
                 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
              <option value="Blocked">Blocked</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm text-left text-gray-300">
          <thead className="bg-sky-900/40 text-gray-100">
            <tr>
              <th className="px-4 py-3">👤 Name</th>
              <th className="px-4 py-3">📧 Email</th>
              <th className="px-4 py-3">📱 Phone Number</th>
              <th className="px-4 py-3">🏠 Address</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Pro</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/10 hover:bg-white/5 transition"
                >
                  <td className="px-4 py-3 font-medium">{user.fullName}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-10 py-3">{user.phoneNumber}</td>
                  <td className="px-4 py-3">{user.location.address}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs ${
                        user.status === "Active"
                          ? "bg-green-500/20 text-green-400"
                          : user.status === "Blocked"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  {/* <td className="px-4 py-3">{user.joined}</td> */}
                  <td className="px-4 py-3 text-center">
                    {user.proUser ? (
                      <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs">
                        ✅ Pro
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg bg-gray-600/30 text-gray-400 text-xs">
                        ❌ Free
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button className="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30">
                      View
                    </button>
                    <button className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30">
                      Block
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  No users found 🚫
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
