/* eslint-disable @next/next/no-img-element */
import { auth, firestore } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import RecommendedProducts from "./RecommendedProducts";
import InstallType from "./InstallType";
import { doc, getDoc } from "firebase/firestore";

// ====================== Annual Savings Calculator ======================
const calculateAnnualSavings = (roofArea: number) => {
  const RAINFALL_MM = 800;       // fixed rainfall per year
  const EFFICIENCY = 0.8;        // 80% runoff efficiency
  const WATER_TARIFF = 0.02;     // ₹ per litre (₹20 per 1000 litres)

  const annualWaterLitres = roofArea * RAINFALL_MM * EFFICIENCY;
  const annualSavings = annualWaterLitres * WATER_TARIFF;

  return Math.floor(annualSavings);
};

const InstallPage: React.FC = () => {
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [status, setStatus] = useState("");

  const [standardPrice, setStandardPrice] = useState<number | null>(null);
  const [proPrice, setProPrice] = useState<number | null>(null);

  const [annualSavings, setAnnualSavings] = useState<number | null>(null);

  const handleToggleExtra = (extra: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extra)
        ? prev.filter((item) => item !== extra)
        : [...prev, extra]
    );
  };

    // Fetch rooftop details from Firebase
    useEffect(() => {
  
      console.log("Fetching rooftop details...");
  
      const fetchRooftop = async () => {
        const user = auth.currentUser;
        if (!user) return;
  
        const ref = doc(firestore, "users", user.uid);
        const snap = await getDoc(ref);
  
        console.log("Rooftop Snap:", snap);
  
        if (snap.exists()) {
          const data = snap.data();
          const rooftop = data.rooftop;
  
          if (rooftop) {
            const area = parseInt(rooftop.area || "0");
            const dwellers = parseInt(rooftop.dwellers || "0");
            const space = parseInt(rooftop.space || "0");
  
            // Pricing logic
            let baseStandard = 20000;
            let basePro = 40000;
  
            // Area adjustments
            if (area > 500 && area <= 1000) baseStandard += 3000;
            if (area > 1000) baseStandard += 7000;
  
            if (area > 500 && area <= 1000) basePro += 5000;
            if (area > 1000) basePro += 10000;
  
            // Space adjustments
            if (space < 300) {
              baseStandard += 2000;
              basePro += 3000;
            }
  
            // Dweller adjustments
            if (dwellers >= 6) {
              baseStandard += 3000;
              basePro += 5000;
            }
  
            console.log("Calculated Prices:", baseStandard, basePro);
            setStandardPrice(baseStandard);
            setProPrice(basePro);
          }
        }
      };
  
      fetchRooftop();
    }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(firestore, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setStatus(userData.status || "");

            // ================= Fetch rooftop area and calculate savings =================
            const roof = userData.rooftop;
            if (roof?.area) {
              const areaNum = parseFloat(roof.area);
              const savings = calculateAnnualSavings(areaNum);
              setAnnualSavings(savings);
            }
          } else {
            console.log("No such user document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setStatus("");
        setAnnualSavings(null);
      }
    });

    return () => unsubscribe();
  }, []);

  console.log(standardPrice, proPrice);

  return (
    <div className="relative space-y-6 p-8">
      {/* Title */}
      <h3
        className="text-3xl font-bold text-sky-300"
        id="installation-overview"
        data-tab="install"
      >
        Installation Overview
      </h3>

      {/* ================= Cost & Benefits ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10">
          <h4 className="text-lg font-semibold text-sky-200 mb-3">
            Installation Cost
          </h4>
          <p className="text-3xl font-bold text-white">
            ₹ {standardPrice} – ₹ {proPrice}
          </p>
          <p className="text-sm text-gray-300 mt-2">
            Based on Standard vs Pro package.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10">
          <h4 className="text-lg font-semibold text-green-300 mb-3">
            Annual Savings
          </h4>
          <p className="text-3xl font-bold text-green-400">
            ₹ {annualSavings !== null ? annualSavings : "Calculating..."}
          </p>
          <p className="text-sm text-gray-300 mt-2">
            Reduced water bills and recharge benefits.
          </p>
        </div>
      </div>

      {/* ================= Installation Types ================= */}
      {
        status === "Inactive" &&  <InstallType
          standardPrice={standardPrice}
          proPrice={proPrice}
        />
      
      }
     

      {/* ================= Recommended Products ================= */}
      <RecommendedProducts />

      {/* Additional Items */}
      <div>
        <h3 className="text-2xl font-bold text-green-300 mb-6">
          ➕ Additional Items
        </h3>

        {/* Toggle Chips */}
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
              onClick={() => handleToggleExtra(extra)}
              className={`px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-gray-200 shadow transition cursor-pointer ${
                selectedExtras.includes(extra)
                  ? "ring-2 ring-green-400 bg-green-700/40"
                  : ""
              }`}
            >
              {extra}
            </span>
          ))}
        </div>

        {/* Show cards only if items are selected */}
        {selectedExtras.length > 0 && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {[
                {
                  name: "Gutter Pipes",
                  price: "₹ 1,200",
                  desc: "High-quality PVC pipes for rooftop collection.",
                  tag: "Durable",
                  img: "https://www.supreme.co.in/uploads/images/ZFg7H5UhK4IWr4KFx21nsHVHfHiVDZ63EbE1v5PN.jpg",
                },
                {
                  name: "First Flush Diverter",
                  price: "₹ 1,000",
                  desc: "Ensures clean water by discarding first rainwater.",
                  tag: "Must Have",
                  img: "https://store.bmigroup.com/medias/Product-Hero-Small-Desktop-Tablet-IMG-0049.jpg?context=bWFzdGVyfHJvb3R8NDk2NjJ8aW1hZ2UvanBlZ3xhREJrTDJoaU9DODVNREkwTXpJd05UQXpPRE00TDFCeWIyUjFZM1F0U0dWeWJ5MVRiV0ZzYkMxRVpYTnJkRzl3TFZSaFlteGxkRjlKVFVkZk1EQTBPUzVxY0djfDdhNDBjNTg3MTZkMmNlMzQzYjYwOGI5ZGVmMTA0ZDEwMTQyYTI0ZjZkZWVjYTUzNDQ0YTkwZTE1OGRmYmJmYTg",
                },
                {
                  name: "Recharge Pit Rings",
                  price: "₹ 3,500",
                  desc: "Concrete rings for effective groundwater recharge.",
                  tag: "Eco Friendly",
                  img: "https://urbanwaters.in/wp-content/uploads/2022/03/230720091404-e1538460971222-737x415NT.jpg",
                },
                {
                  name: "Overflow Pipe",
                  price: "₹ 600",
                  desc: "Safely channels excess water away from tanks.",
                  tag: "Safety",
                  img: "https://m.media-amazon.com/images/I/81umNTvyGyL._UF1000,1000_QL80_.jpg",
                },
                {
                  name: "pH Sensor",
                  price: "₹ 2,800",
                  desc: "Measures acidity/alkalinity of water in real time.",
                  tag: "Smart",
                  img: "https://5.imimg.com/data5/KC/XY/ME/SELLER-4167793/ph-sensor-kit.jpg",
                },
                {
                  name: "Water Quality Tester",
                  price: "₹ 4,500",
                  desc: "Portable tester for water safety and purity checks.",
                  tag: "Premium",
                  img: "https://m.media-amazon.com/images/I/713vJhqz1nL._UF1000,1000_QL80_.jpg",
                },
              ]
                .filter((item) => selectedExtras.includes(item.name))
                .map((item, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-indigo-900/40 to-sky-800/30 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg hover:shadow-2xl transition cursor-pointer"
                  >
                    <div className="relative w-full h-40 mb-5">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
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
                    <button className="mt-4 w-full py-2 rounded-lg border-2 border-sky-600 hover:bg-sky-700 text-white font-semibold transition cursor-pointer">
                      View Details
                    </button>
                    <button className="mt-4 w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition cursor-pointer">
                      Buy Now
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPage;
