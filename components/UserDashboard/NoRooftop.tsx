import React, { useEffect } from "react";

interface NoRoofTopProps {
  activeItem: string;
  setActiveItem: (tab: string) => void;
}

const NoRoofTop: React.FC<NoRoofTopProps> = ({ activeItem, setActiveItem }) => {
  setActiveItem(activeItem);
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br text-white">
      <div className="bg-white/10 p-10 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">🏠 Rooftop Details Missing</h2>
        <p className="text-sky-300 mb-6">
          Please enter your rooftop details to access the dashboard.
        </p>
        <button
          onClick={() => setActiveItem("profile")}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 rounded-lg font-semibold transition"
        >
          Enter Rooftop Details
        </button>
      </div>
    </div>
  );
};

export default NoRoofTop;
