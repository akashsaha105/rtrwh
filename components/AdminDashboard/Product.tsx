import React from "react";

const Product = () => {
  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-6 text-sky-300">Product Listings</h2>
        <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg shadow">
          + Add Product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full text-sm text-gray-300">
          <thead className="bg-sky-900/40 text-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Product Name</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {/* Example Row */}
            <tr className="hover:bg-gray-800/40">
              <td className="px-4 py-3">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-wcYlDosVz_2fmnf8Zgo5NyxOrw2PkbSuoA&s"
                  alt="Product"
                  className="w-12 h-12 rounded-lg object-cover"
                />
              </td>
              <td className="px-4 py-3">Rainwater Harvesting Tank (1000L)</td>
              <td className="px-4 py-3">Durable plastic tank with easy filtration.</td>
              <td className="px-4 py-3">₹ 8,500</td>
              <td className="px-4 py-3">120</td>
              <td className="px-4 py-3 text-center space-x-2">
                <button className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                  Edit
                </button>
                <button className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Product;
