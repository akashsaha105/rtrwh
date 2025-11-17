/* eslint-disable @next/next/no-img-element */
import { firestore } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";

interface Product {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
}

const RecommendedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "products"), (snapshot) => {
      const productList: Product[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productList);
    });
    return () => unsub();
  }, []);

  console.log(products)
  return (
    <div>
      <h3
        className="text-2xl font-bold text-pink-300 mb-6 mt-12"
        id="recommend"
        data-tab="install"
      >
        🛒 Recommended Products
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((item, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-indigo-900/40 to-sky-800/30 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg hover:shadow-2xl transition cursor-pointer"
          >
            {/* Image Section */}
            <div className="relative w-full h-40 mb-5">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 text-xs text-white bg-pink-600/80 px-2 py-1 rounded-md shadow-md">
                {item.category}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-white">{item.name}</h4>
            </div>
            <p className="text-gray-300 text-sm">{item.description}</p>
            <p className="text-xl font-bold text-sky-300 mt-3">₹ {item.price.toLocaleString()}</p>
            <button className="mt-4 w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition cursor-pointer">
              Buy Now
            </button>
          </div>
        ))}
        {/* {[
          {
            name: "Rainwater Harvesting Tank (1000L)",
            price: "₹ 8,500",
            desc: "Durable plastic tank with easy filtration.",
            tag: "Best Seller",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-wcYlDosVz_2fmnf8Zgo5NyxOrw2PkbSuoA&s",
          },
          {
            name: "Gutter Pipes",
            price: "₹ 1,200",
            desc: "High-quality PVC pipes for rooftop collection.",
            tag: "Smart Choice",
            img: "https://www.supreme.co.in/uploads/images/ZFg7H5UhK4IWr4KFx21nsHVHfHiVDZ63EbE1v5PN.jpg",
          },
          {
            name: "Filtration Kit (Sand + Charcoal)",
            price: "₹ 1,500",
            desc: "Removes debris and contaminants effectively.",
            tag: "Eco Pack",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-wcYlDosVz_2fmnf8Zgo5NyxOrw2PkbSuoA&s",
          },
        ].map((item, i) => ( */}
        {/* //   <div
        //     key={i}
        //     className="bg-gradient-to-br from-indigo-900/40 to-sky-800/30 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg hover:shadow-2xl transition cursor-pointer"
        //   >
        //     {/* Image Section */}
        {/* //     <div className="relative w-full h-40 mb-5">
        //       <img */}
        {/* //         src={item.img}
        //         alt={item.name}
        //         className="w-full h-full object-cover"
        //       />
        //       <span className="absolute top-3 left-3 text-xs text-white bg-pink-600/80 px-2 py-1 rounded-md shadow-md">
        //         {item.tag}
        //       </span>
        //     </div>
        //     <div className="flex items-center justify-between mb-2">
        //       <h4 className="text-lg font-semibold text-white">{item.name}</h4>
        //     </div>
        //     <p className="text-gray-300 text-sm">{item.desc}</p>
        //     <p className="text-xl font-bold text-sky-300 mt-3">{item.price}</p>
        //     <button className="mt-4 w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition cursor-pointer">
        //       Buy Now
        //     </button>
        //   </div> */}
        {/* // ))} */}
      </div>
    </div>
  );
};

export default RecommendedProducts;
