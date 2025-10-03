/* eslint-disable @next/next/no-img-element */
import { Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { closeProductModal, openProductModal } from "@/redux/slices/modalSlice";
import { motion } from "framer-motion";
import {
  addDoc,
  collection,
  onSnapshot,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/firebase";

interface Product {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
}

const categories = [
  "Storage Tank",
  "Filter",
  "Recharge",
  "Automation",
  "Accessory",
];

const Product = () => {
  const [category, setCategory] = useState("")
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);

  // 🔹 Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all"); // all | inStock | outOfStock | lowPrice | highPrice

  const isOpen = useSelector(
    (state: RootState) => state.modals.productModalIsOpen
  );
  const dispatch: AppDispatch = useDispatch();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setImageFile(e.target.files[0]);
  };

  // 🔹 Delete Product
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(firestore, "products", id));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // 🔹 Firestore Snapshot
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

  // 🔹 Edit Product
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setQuantity(product.quantity.toString());
    setImageFile(null);
    setCategory(product.category.toString())
    dispatch(openProductModal());
  };

  // 🔹 Add / Update Product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !editingId) return alert("Please select an image");

    try {
      setLoading(true);

      let imageUrl = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "rtrwh-products");

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/dyjd9ydts/image/upload`,
          { method: "POST", body: formData }
        );

        const cloudData = await cloudRes.json();
        imageUrl = cloudData.secure_url;
      }

      if (editingId) {
        const ref = doc(firestore, "products", editingId);
        await updateDoc(ref, {
          name,
          description,
          price: parseFloat(price),
          quantity: parseInt(quantity),
          category: category,
          ...(imageUrl && { imageUrl }),
        });
      } else {
        await addDoc(collection(firestore, "products"), {
          name,
          description,
          price: parseFloat(price),
          quantity: parseInt(quantity),
          imageUrl,
          category: category,
          createdAt: Timestamp.now(),
        });
      }

      // Reset
      setEditingId(null);
      setName("");
      setDescription("");
      setPrice("");
      setQuantity("");
      setImageFile(null);
      dispatch(closeProductModal());
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Filter + Search Logic
  const filteredProducts = products
    .filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
    .filter((p) => {
      if (filterBy === "inStock") return p.quantity > 0;
      if (filterBy === "outOfStock") return p.quantity === 0;
      if (filterBy === "lowPrice") return p.price <= 100; // Example threshold
      if (filterBy === "highPrice") return p.price > 100;
      return true;
    });

  return (
    <div className="relative p-6 pt-4 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap px-4 py-3 mb-4">
        {/* Left: Title */}
        <h2 className="text-xl font-semibold text-sky-300 whitespace-nowrap">
          Product Listings
        </h2>

        {/* Right: Controls (Search + Filter + Button) */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-md transition"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="appearance-none w-44 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-gray-600 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-md transition cursor-pointer"
            >
              <option value="all">All</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
              <option value="lowPrice">Low Price (≤ ₹100)</option>
              <option value="highPrice">High Price (&gt; ₹100)</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </span>
          </div>

          {/* Add Button (kept as is) */}
          <button
            onClick={() => dispatch(openProductModal())}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg shadow cursor-pointer whitespace-nowrap"
          >
            + Add Product
          </button>
        </div>
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
            {filteredProducts.length > 0 ? (
              filteredProducts.map((prod) => (
                <tr className="hover:bg-gray-800/40" key={prod.id}>
                  <td className="px-4 py-3">
                    <img
                      src={prod.imageUrl}
                      alt="Product"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="px-4 py-3">{prod.name}</td>
                  <td className="px-4 py-3">{prod.description}</td>
                  <td className="px-4 py-3">₹ {prod.price}</td>
                  <td className="px-4 py-3">{prod.quantity}</td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(prod)}
                      className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-gray-400 italic"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal open={isOpen} onClose={() => dispatch(closeProductModal())}>
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-600">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border text-gray-700 border-blue-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                  required
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border text-gray-700 border-blue-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border text-gray-700 border-blue-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm resize-none"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border text-gray-700 border-blue-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border text-gray-700 border-blue-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Product Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="fileUpload"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="fileUpload"
                  className="flex items-center justify-center w-100 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl cursor-pointer"
                >
                  {imageFile ? "Change Photo" : "Click to upload product image"}
                </label>
                {imageFile && (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded-xl border border-blue-300 shadow-sm"
                  />
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => dispatch(closeProductModal())}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition shadow cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl ${
                    !loading
                      ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                      : "bg-blue-400 cursor-not-allowed"
                  } text-white transition shadow`}
                >
                  {!loading
                    ? editingId
                      ? "Update Product"
                      : "Add Product"
                    : "Loading"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </Modal>
    </div>
  );
};

export default Product;
