/* eslint-disable @next/next/no-img-element */
import React from "react";

const InstallPage: React.FC = () => {
  return (
    <div className="relative space-y-6 p-8">
      {/* Title */}
      <h3 className="text-3xl font-bold text-sky-300" id="installation-overview" data-tab="products">Installation Overview</h3>

      {/* ================= Cost & Benefits ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10 hover:scale-[1.01] transition">
          <h4 className="text-lg font-semibold text-sky-200 mb-3">
            Installation Cost
          </h4>
          <p className="text-3xl font-bold text-white">₹ 25,000</p>
          <p className="text-sm text-gray-300 mt-2">
            Includes tank, filtration, plumbing, and sensors.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10 hover:scale-[1.01] transition">
          <h4 className="text-lg font-semibold text-green-300 mb-3">
            Annual Savings
          </h4>
          <p className="text-3xl font-bold text-green-400">₹ 12,000</p>
          <p className="text-sm text-gray-300 mt-2">
            Reduced water bills and recharge benefits.
          </p>
        </div>
      </div>

      {/* ================= Recommendation System ================= */}
      <div>
        <h3 className="text-2xl font-bold text-pink-300 mb-6 mt-12" id="recommend" data-tab="products">
          🛒 Recommended Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Rainwater Harvesting Tank (1000L)",
              price: "₹ 8,500",
              desc: "Durable plastic tank with easy filtration.",
              tag: "Best Seller",
              img:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-wcYlDosVz_2fmnf8Zgo5NyxOrw2PkbSuoA&s",
            },
            {
              name: "Smart Water Flow Sensor",
              price: "₹ 2,200",
              desc: "IoT-enabled real-time water tracking.",
              tag: "Smart Choice",
              img:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-wcYlDosVz_2fmnf8Zgo5NyxOrw2PkbSuoA&s",
            },
            {
              name: "Filtration Kit (Sand + Charcoal)",
              price: "₹ 1,500",
              desc: "Removes debris and contaminants effectively.",
              tag: "Eco Pack",
              img:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-wcYlDosVz_2fmnf8Zgo5NyxOrw2PkbSuoA&s",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-indigo-900/40 to-sky-800/30 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg hover:scale-105 hover:shadow-2xl transition cursor-pointer"
            >
              {/* Image Section */}
              <div className="relative w-full h-40 mb-5">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 text-xs text-white bg-pink-600/80 px-2 py-1 rounded-md shadow-md">
                  {item.tag}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-white">
                  {item.name}
                </h4>
              </div>
              <p className="text-gray-300 text-sm">{item.desc}</p>
              <p className="text-xl font-bold text-sky-300 mt-3">
                {item.price}
              </p>
              <button className="mt-4 w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition cursor-pointer">
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </div>


      {/* Chart Placeholder */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
        <h4 className="text-lg font-semibold text-sky-200 mb-4">
          📊 Cost vs. Savings Projection
        </h4>
        <div className="h-64 flex items-center justify-center text-sky-400">
          Chart (Install cost vs. yearly savings) will go here
        </div>
      </div>

      {/* Additional Items */}
      <div>
        <h3 className="text-2xl font-bold text-green-300 mb-6">
          ➕ Additional Items
        </h3>
        <div className="flex flex-wrap gap-4">
          {[
            "Gutter Pipes",
            "First Flush Diverter",
            "Recharge Pit Rings",
            "Overflow Pipe",
            "pH Sensor",
            "Water Quality Tester",
          ].map((extra, i) => (
            <span
              key={i}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-gray-200 shadow transition cursor-pointer"
            >
              {extra}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstallPage;
