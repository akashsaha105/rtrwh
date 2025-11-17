"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Camera, Calculator, Droplets, ChevronDown, ChevronRight } from "lucide-react";

// 🔹 Demo Users Data
const demoUsers = [
  {
    id: 1,
    user: "Janvi Shah",
    location: "Pune",
    area: "1200 sq ft",
    rainfall: "1200mm/year",
    tank: "5000L",
    annual: "14,400L",
    savings: "₹2,400/year",
    efficiency: "85%",
    roof: "Concrete",
    slope: "15°",
    src:"img1.jpg"
  },
  {
    id: 2,
    user: "Amit Verma",
    location: "Delhi",
    area: "1500 sq ft",
    rainfall: "800mm/year",
    tank: "8000L",
    annual: "12,000L",
    savings: "₹3,100/year",
    efficiency: "78%",
    roof: "Tiles",
    slope: "10°",
    src:'img2.jpg'
  },
  {
    id: 3,
    user: "Sneha Patel",
    location: "Ahmedabad",
    area: "1000 sq ft",
    rainfall: "950mm/year",
    tank: "6000L",
    annual: "9,500L",
    savings: "₹2,000/year",
    efficiency: "82%",
    roof: "Metal Sheet",
    slope: "12°",
    src:'img3.jpg'
  },
  {
    id: 4,
    user: "rahul Gupta",
    location: "Mumbai",
    area: "900 sq ft",
    rainfall: "2000mm/year",
    tank: "7000L",
    annual: "18,000L",
    savings: "₹4,500/year",
    efficiency: "90%",
    roof: "Asphalt Shingles",
    slope: "20°",
    src:'img4.jpg'
 
  },
  {
    id: 5,
    user: "salena Gomez",
    location: "Chennai",
    area: "1100 sq ft",
    rainfall: "1500mm/year",
    tank: "5500L",
    annual: "16,500L",
    savings: "₹3,200/year",
    efficiency: "88%",
    roof: "Clay Tiles",
    slope: "18°",
    src:'img5.jpg'

  },
  {
    id: 6,
    user: "Puja Singh",
    location: "Bihar",
    area: "1000 sq ft",
    rainfall: "950mm/year",
    tank: "3000L",
    annual: "9,500L",
    savings: "₹1,000/year",
    efficiency: "82%",
    roof: "Metal Sheet",
    slope: "16°",
    src:'img6.jpg'
  },
  {
    id: 7,
    user: "Rohit Kumar",
    location: "Kolkata",
    area: "1300 sq ft",
    rainfall: "1100mm/year",
    tank: "7500L",
    annual: "13,200L",
    savings: "₹2,800/year",
    efficiency: "80%",
    roof: "Wood Shingles",
    slope: "14°",
    src:'img6.png'
  }
];

export default function InteractiveDemo() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setIsExpanded(false); // collapse details when switching
    setCurrentIndex((prev) => (prev + 1) % demoUsers.length);
  };

  const data = demoUsers[currentIndex];

  return (
    <div className="relative mt-30 mb-20 flex justify-center px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={data.id}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Main Demo Card */}
          <motion.div
            className="rounded-3xl p-8 glass shadow-glow water-ripple"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="p-2 rounded-lg bg-gradient-to-r from-[#0077b6] to-[#00b4d8]"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Home className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <span className="text-white font-semibold">
                      Rooftop Rainwater Harvesting Demo Analysis
                    </span>
                    <p className="text-xs text-gray-400">AI-powered rooftop assessment</p>
                  </div>
                </div>
                <motion.div
                  className="ml-3 w-3 h-3 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                ></motion.div>
              </div>

              {/* Interactive Rooftop Visualization */}
              <motion.div
                className="h-72  bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl relative overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-full h-full relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={data.src}
                      alt="Rooftop Rainwater Harvesting System"
                      className="w-full h-full object-cover rounded-xl"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />

                    {/* Animated Camera Icon */}
                    <motion.div
                      className="absolute top-4 right-4 w-8 h-8 bg-[#48bb78] rounded-full flex items-center justify-center shadow-lg"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </motion.div>

                    {/* Animated Water Drops */}
                    {/* <motion.div
                      className="absolute top-1/2 left-1/4 w-2 h-2 bg-[#00b4d8] rounded-full"
                      animate={{ y: [0, 20, 0], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-[#48bb78] rounded-full"
                      animate={{ y: [0, 15, 0], opacity: [1, 0, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.div
                      className="absolute top-1/3 left-1/2 w-1 h-1 bg-[#0077b6] rounded-full"
                      animate={{ y: [0, 25, 0], opacity: [1, 0, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    /> */}
                  </motion.div>
                </div>

                {/* Interactive Data Display */}
                <motion.div
                  className="absolute bottom-4 left-4 right-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  <div className="bg-black/50 rounded-lg p-3  border border-white/10">
                    <motion.div
                      className="text-xs text-zinc-200 font-medium"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      User: {data.user} | Location: {data.location}
                    </motion.div>
                    <motion.div
                      className="text-xs text-emerald-400 font-medium"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Area: {data.area}
                    </motion.div>
                    <motion.div
                      className="text-xs text-[#00b4d8] font-medium"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                    >
                      Rainfall: {data.rainfall}
                    </motion.div>
                    <motion.div
                      className="text-xs text-orange-400 font-medium mt-1"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    >
                      System: Active
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Animated Results */}
              <div className="space-y-2">
                <motion.div
                  className="flex items-center justify-between p-4 glass rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Calculator className="w-5 h-5 text-[#00b4d8]" />
                    </motion.div>
                    <span className="text-white">Tank Size</span>
                  </div>
                  <motion.span
                    className="text-[#48bb78] font-bold"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {data.tank}
                  </motion.span>
                </motion.div>

                <motion.div
                  className="flex items-center justify-between p-4 glass rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Droplets className="w-5 h-5 text-[#00b4d8]" />
                    </motion.div>
                    <span className="text-white">Annual Collection</span>
                  </div>
                  <motion.span
                    className="text-[#48bb78] font-bold"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  >
                    {data.annual}
                  </motion.span>
                </motion.div>
              </div>

              {/* Expandable Content */}
              <motion.div
                initial={false}
                animate={{ height: isExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden mt-0"
              >
                <div className="space-y-3 ">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 glass rounded-lg">
                      <div className="text-xs text-gray-400">Roof Material</div>
                      <div className="text-sm text-white font-medium">{data.roof}</div>
                    </div>
                    <div className="p-3 glass rounded-lg">
                      <div className="text-xs text-gray-400">Slope Angle</div>
                      <div className="text-sm text-white font-medium">{data.slope}</div>
                    </div>
                  </div>

                  <div className="p-4 glass rounded-lg">
                    <div className="text-xs text-gray-400 mb-2">Collection Efficiency</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-[#48bb78] to-[#00b4d8] h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: data.efficiency }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <div className="text-xs text-[#48bb78] mt-1">{data.efficiency} Efficiency</div>
                  </div>

                  <div className="p-3 glass rounded-lg">
                    <div className="text-xs text-gray-400">Estimated Savings</div>
                    <div className="text-lg text-[#48bb78] font-bold">{data.savings}</div>
                  </div>
                </div>
              </motion.div>

              {/* Sliding Toggle Button */}
              <motion.button
                className="w-full py-3 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white rounded-lg font-medium relative overflow-hidden flex items-center justify-center space-x-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <span>{isExpanded ? "Show Less" : "Show More Details"}</span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.button>

              {/* 🔹 Swipe Right Button */}
              <motion.button
                onClick={handleNext}
                className="w-full mt-4 py-3 bg-gradient-to-r from-[#48bb78] to-[#00b4d8] text-white rounded-lg font-medium flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Swipe Right</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

