/* eslint-disable @next/next/no-img-element */
import { closeBasicModal, closeProModal, openBasicModal, openProModal } from "@/redux/slices/modalSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { Modal } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const InstallType = () => {
  const basicOpen = useSelector(
    (state: RootState) => state.modals.basicModalIsOpen
  );  
  const proOpen = useSelector(
    (state: RootState) => state.modals.proModalIsOpen
  );
  const dispatch: AppDispatch = useDispatch();

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-green-300 mb-6">Plan</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Standard Plan */}
        <div className="bg-gradient-to-br from-gray-800/40 to-sky-900/30 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl transition flex flex-col justify-between">
          <h4 className="text-xl font-semibold text-sky-200 mb-4 flex items-center gap-2">
            🌱 Standard Installation
          </h4>
          <p className="text-sm text-gray-300 mb-6">
            Ideal for households looking for a cost-effective way to harvest and
            use rainwater. Covers only essentials.
          </p>

          <ul className="space-y-3 text-gray-200">
            <li>✔ 1000–2000L Storage Tank</li>
            <li>✔ Basic Filtration Kit (Sand + Charcoal)</li>
            <li>✔ Plumbing & Gutter Pipes</li>
            <li>✔ First Flush Diverter</li>
            <li>✔ Recharge Pit (optional)</li>
          </ul>

          <div className="mt-6">
            <p className="text-3xl font-bold text-sky-300">₹ 25,000</p>
            <p className="text-sm text-gray-400">One-time installation cost</p>
          </div>
          <button
            onClick={() => dispatch(openBasicModal())}
            className="mt-6 w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition cursor-pointer"
          >
            Get Standard Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-br from-indigo-800/40 to-purple-900/30 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl transition">
          <h4 className="text-xl font-semibold text-purple-300 mb-4 flex items-center gap-2">
            🚀 Pro Installation
          </h4>
          <p className="text-sm text-gray-300 mb-6">
            Perfect for eco-conscious and tech-savvy users. Comes with smart
            features, automation, and remote control.
          </p>

          <ul className="space-y-3 text-gray-200">
            <li>✔ Everything in Standard Plan</li>
            <li>✔ IoT-Enabled Water Flow Sensor</li>
            <li>✔ Smart Redistribution (Garden, Toilets, Cleaning)</li>
            <li>✔ Alexa/Google Home Integration</li>
            <li>✔ Mobile App Control</li>
            <li>✔ Tank Alerts & Maintenance Reminders</li>
            <li>✔ Water Sharing Mode 🌍</li>
          </ul>

          <div className="mt-6">
            <p className="text-3xl font-bold text-purple-300">₹ 45,000</p>
            <p className="text-sm text-gray-400">
              Advanced automation + lifetime dashboard
            </p>
          </div>
          <button onClick={() => dispatch(openProModal())} className="mt-6 w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition cursor-pointer">
            Get Pro Plan
          </button>
        </div>

        <Modal open={basicOpen} onClose={() => dispatch(closeBasicModal())}>
          <AnimatePresence>
            {basicOpen && (
              <motion.div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* Close Button */}
                  <button
                    onClick={() => dispatch(closeBasicModal())}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
                  >
                    ✕
                  </button>

                  {/* Modal Header */}
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Standard Installation
                  </h2>

                  {/* Instructions */}
                  <div className="mb-6 text-gray-700">
                    <p className="mb-2">
                      Click the button below to start the standard installation
                      process.
                    </p>
                    <p className="text-sm text-gray-500">
                      Once you proceed, you can complete the payment via QR/UPI.
                    </p>
                  </div>

                  {/* Payment Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">
                      Payment Options
                    </h3>
                    <div className="flex flex-col items-center gap-4">
                      {/* QR Code placeholder */}
                      <div className="border rounded-lg p-4">
                        <img
                          src="/qr-code.png"
                          alt="Pay via QR"
                          className="w-32 h-32 object-contain"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Scan to pay
                        </p>
                      </div>

                      {/* UPI / other options */}
                      <div className="flex gap-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                          Pay via UPI
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                          Pay via Google Pay / PhonePe
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-medium"
                    onClick={() => alert("Installation Started!")}
                  >
                    Start Installation
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Modal>
        <Modal open={proOpen} onClose={() => dispatch(closeProModal())}>
          <AnimatePresence>
            {proOpen && (
              <motion.div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* Close Button */}
                  <button
                    onClick={() => dispatch(closeProModal())}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
                  >
                    ✕
                  </button>

                  {/* Modal Header */}
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Pro Installation
                  </h2>

                  {/* Instructions */}
                  <div className="mb-6 text-gray-700">
                    <p className="mb-2">
                      Click the button below to start the standard installation
                      process.
                    </p>
                    <p className="text-sm text-gray-500">
                      Once you proceed, you can complete the payment via QR/UPI.
                    </p>
                  </div>

                  {/* Payment Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">
                      Payment Options
                    </h3>
                    <div className="flex flex-col items-center gap-4">
                      {/* QR Code placeholder */}
                      <div className="border rounded-lg p-4">
                        <img
                          src="/qr-code.png"
                          alt="Pay via QR"
                          className="w-32 h-32 object-contain"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Scan to pay
                        </p>
                      </div>

                      {/* UPI / other options */}
                      <div className="flex gap-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                          Pay via UPI
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                          Pay via Google Pay / PhonePe
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-medium"
                    onClick={() => alert("Installation Started!")}
                  >
                    Start Installation
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Modal>
      </div>
    </div>
  );
};

export default InstallType;
