import React, { FormEvent, useState } from "react";
import { Modal } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@reduxjs/toolkit/query";
import { AppDispatch } from "@/redux/store";
import { openSignupModal, closeSignupModal, openLoginModal } from "@/redux/slices/modalSlice";
import { EyeIcon, EyeSlashIcon, XMarkIcon } from "@heroicons/react/16/solid";
// import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth } from "@/firebase";
import LoadingPage from "../Loading";

function getUsernameFromEmail(email: string | null): string {
  if (!email) return '';
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1) return email; // Return whole string if no '@'
  return email.substring(0, atIndex);
}

const SignupModal = () => {

  // To display the Login Modal
  const isOpen = useSelector(
    (state: RootState) => state.modals.signupModalIsOpen
  );
  const dispatch: AppDispatch = useDispatch();

  // To showPassword functionality
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirnPassword] = useState(false);

  // Signup Authentication functionality
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSignup = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await updateProfile(userCredential.user, {
        displayName: getUsernameFromEmail(user.email)
      });
    
      await sendEmailVerification(user)

      // Temporarily store user data in local storage
      const username = getUsernameFromEmail(email)

      localStorage.setItem(
        "registrationData",
        JSON.stringify({
          email,
          username,
          password
        })
      );

      alert(
        "Registration successful! Please check your email for verification"
      );
      
      setLoading(true)

      // Clear form fields
      setEmail("");
      setPassword("");

    } catch (error) {
      if (error instanceof Error){
        alert(error.message);
      } else {
        alert("An unknown error occurred")
      }
    }
  };

  if (loading) {
    window.location.reload()

    return (<LoadingPage />)
  }
  return (
    <div>
      <button
        className=" bg-white/15 text-white px-4 py-2 rounded-md hover:bg-white/25 transition cursor-pointer"
        onClick={() => dispatch(openSignupModal())}
      >
        Sign up
        {/* Sign up <ArrowRight size={18} /> */}
      </button>
      <Modal
        open={isOpen}
        onClose={() => dispatch(closeSignupModal())}
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
                onClick={() => dispatch(closeSignupModal())}
                className="absolute top-[-20] right-[-10] flex items-center justify-center w-10 rounded-full text-gray-200 hover:text-white focus:outline-none cursor-pointer"
                aria-label="Close"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              {/* Title */}
              <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-white/100 via-sky-200 to-white/70 bg-clip-text text-transparent">
                Welcome
              </h2>

              {/* Form */}
              <form onSubmit={handleSignup} className="space-y-6">
                <input
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full p-3 rounded-xl bg-white/30 text-gray-900 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-400 transition"
                  onChange={(e) => setEmail(e.target.value)}
                />

                {/* Password Input with Eye Toggle */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
                    className="w-full p-3 rounded-xl bg-white/30 text-gray-900 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-400 transition pr-12"
                    onChange={(e) => setPassword(e.target.value)}
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
                {/* Password Input with Eye Toggle */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    required
                    className="w-full p-3 rounded-xl bg-white/30 text-gray-900 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-400 transition pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirnPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-800 to-blue-600 text-white font-semibold cursor-pointer"
                >
                  Sign up
                </button>
              </form>

              {/* Footer */}
              <p className="mt-8 text-center text-sm text-gray-300">
                Already have an account?{" "}
                <a className="text-cyan-300 underline cursor-pointer" onClick={(e) => {e.preventDefault(); dispatch(closeSignupModal()); dispatch(openLoginModal()) }}>
                  Log In
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

export default SignupModal;
