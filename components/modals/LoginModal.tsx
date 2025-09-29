/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Modal } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@reduxjs/toolkit/query";
import { AppDispatch } from "@/redux/store";
import {
  openLoginModal,
  closeLoginModal,
  openSignupModal,
} from "@/redux/slices/modalSlice";
import { EyeIcon, EyeSlashIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LoginModal = () => {
  const isOpen = useSelector(
    (state: RootState) => state.modals.loginModalIsOpen
  );
  const dispatch: AppDispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter()

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const loginUser = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      if (loginUser) {
        router.push('/en/dashboard')
      }

      dispatch(closeLoginModal());
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Trigger Button */}
      <button
        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl shadow-lg hover:scale-105 transition font-semibold cursor-pointer"
        onClick={() => dispatch(openLoginModal())}
      >
        Log in
      </button>

      {/* Modal */}
      <Modal
        open={isOpen}
        onClose={() => dispatch(closeLoginModal())}
        className="flex justify-center items-center"
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-md bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700"
          >
            {/* Close Button */}
            <button
              onClick={() => dispatch(closeLoginModal())}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Title */}
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-white via-sky-200 to-cyan-300 bg-clip-text text-transparent">
              Welcome Back
            </h2>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2 bg-gray-800/70 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-2 bg-gray-800/70 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>

                <div className="flex justify-end mt-1">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-cyan-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-2 rounded-lg shadow-md hover:opacity-90 transition font-semibold"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-gray-300">
              Don’t have an account?{" "}
              <a
                className="text-cyan-400 underline cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(closeLoginModal());
                  dispatch(openSignupModal());
                }}
              >
                Sign Up
              </a>
            </p>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-700" />
              <span className="px-3 text-gray-400 text-sm">or</span>
              <div className="flex-grow h-px bg-gray-700" />
            </div>

            {/* Social Login */}
            <button className="w-full flex items-center justify-center gap-2 border border-gray-700 bg-gray-800/80 text-gray-300 py-2 rounded-lg hover:bg-gray-700 transition">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
          </motion.div>
        </div>
      </Modal>
    </div>
  );
};

export default LoginModal;
