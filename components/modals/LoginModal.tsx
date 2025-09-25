"use client"

import React, { useState } from "react";
import { Modal } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@reduxjs/toolkit/query";
import { AppDispatch } from "@/redux/store";
import { openLoginModal, closeLoginModal, openSignupModal } from "@/redux/slices/modalSlice";
import { EyeIcon, EyeSlashIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import LoadingPage from "../Loading";
// import SignupModal from "./SignupModal";

const LoginModal = () => {

  // To display the Login Modal
  const isOpen = useSelector(
    (state: RootState) => state.modals.loginModalIsOpen
  );
  const dispatch: AppDispatch = useDispatch();

  // To showPassword functionality
  const [showPassword, setShowPassword] = useState(false);

  // Login Authentication
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
    setLoading(true)
    // console.log(auth)
  }

  if (loading) return <LoadingPage />
  return (
    <div>
      <button
        // href="/login"
        className="bg-white/15 text-white px-4 py-2 rounded-md hover:bg-white/25 transition cursor-pointer"
        onClick={() => dispatch(openLoginModal())}
      >
        Log in
        {/* Sign up <ArrowRight size={18} /> */}
      </button>

      <Modal
        open={isOpen}
        onClose={() => dispatch(closeLoginModal())}
        className="flex justify-center items-center"
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-md">
          <div className="relative w-full max-w-md px-8 py-10 rounded-3xl bg-white/20 backdrop-blur-xl overflow-hidden">
            {/* Outer Gradient Animation */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 animate-gradientFlow opacity-60"
              style={{
                WebkitMaskImage:
                  "linear-gradient(rgba(255,255,255,0.8) 70%, transparent 100%)",
                maskImage:
                  "linear-gradient(rgba(255,255,255,0.8) 70%, transparent 100%)",
              }}
            />

            {/* Modal Content */}
            <div className="relative z-10 select-none text-gray-200">
              {/* Close Button */}
              <button
                onClick={() => dispatch(closeLoginModal())}
                className="absolute top-[-20] right-[-10] flex items-center justify-center w-10 rounded-full text-gray-200 hover:text-white focus:outline-none cursor-pointer"
                aria-label="Close"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              {/* Title */}
              <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-white/100 via-sky-200 to-white/70 bg-clip-text text-transparent">
                Welcome Back
              </h2>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <input
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full p-3 rounded-xl bg-white/30 text-gray-900 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-400 transition"
                  onChange={(event) => {setLoginEmail(event.target.value)}}
                />

                {/* Password Input with Eye Toggle */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
                    className="w-full p-3 rounded-xl bg-white/30 text-gray-900 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-400 transition pr-12"
                    onChange={(event) => {setLoginPassword(event.target.value)}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-800 to-blue-600 text-white font-semibold cursor-pointer"
                //   onClick={() => handleLogin()}
                >
                  Log in
                </button>
              </form>

              {/* Footer */}
              <p className="mt-8 text-center text-sm text-gray-300 cursor-pointer">
                Don’t have an account?{" "}
                <a className="text-cyan-300 underline" onClick={(e) => {
                  e.preventDefault()
                  dispatch(closeLoginModal())
                  dispatch(openSignupModal())
                }}>
                  Sign Up
                </a>
              </p>
            </div>
          </div>

          <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradientFlow {
          background-size: 200% 200%;
          animation: gradientFlow 8s ease infinite;
        }
      `}</style>
        </div>
      </Modal>
    </div>
  );
};

export default LoginModal;
