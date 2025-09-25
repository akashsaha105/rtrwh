"use client";

import ParticlesBackground from "./ParticlesBackground";
import { ArrowLongRightIcon } from "@heroicons/react/16/solid";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative h-screen w-full bg-gradient-to-r blue-900 via-indigo-900 shadow-xl border border-blue-950/40 hover:bg-blue-800 ring-2 ring-sky-500 bg-indigo-950 from-sky-800 to-indigo-800 text-sky-30 placeholder:text-indigo-300 focus:ring-sky-500 hover:text-sky-200"
    >
      {/* Particle Background */}
      <ParticlesBackground />

      {/* Main Hero Content */}
      <div className="h-full flex items-center pl-6 md:pl-20">
        <div className="space-y-6 relative z-10">
          <span className="text-5xl md:text-6xl font-bold text-white max-w-2xl leading-tight block">
            Save Rain Today, Sustain Life{" "}
            <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-blue-100 to-blue-100 bg-clip-text text-transparent animate-[gradient-move_4s_ease-in-out_infinite] bg-[length:200%_auto]">
              Tomorrow
            </span>
          </span>

          <p className="mb-6 text-lg md:text-xl max-w-2xl leading-relaxed bg-gradient-to-r from-blue-100 to-blue-300 bg-clip-text text-transparent">
            We help you capture rooftop rain, store it smartly, and recharge the
            ground beneath your home—reducing water bills, preventing shortages,
            and ensuring every drop finds purpose.
          </p>

          <Link
            href="#features"
            className="inline-flex gap-2 items-center rounded-xl border border-white/20 px-8 py-3 bg-zinc-900 text-white font-light text-lg hover:bg-zinc-800 transition-colors"
          >
            Analyze <ArrowLongRightIcon width={28} />
          </Link>
        </div>
      </div>

      {/* Subtle Wave Animation at Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden pointer-events-none">
        <svg
          className="absolute bottom-0 w-full h-full animate-[waterwave_10s_linear_infinite]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="rainwater-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <path
            d="M0,20 C150,80 350,0 600,60 C850,120 1050,20 1200,60 L1200,120 L0,120 Z"
            fill="url(#rainwater-gradient)"
            className="opacity-50"
          />
          <path
            d="M0,40 C150,100 350,20 600,80 C850,140 1050,40 1200,80 L1200,120 L0,120 Z"
            fill="url(#rainwater-gradient)"
            className="opacity-30"
          />
          <path
            d="M0,60 C150,120 350,40 600,100 C850,160 1050,60 1200,100 L1200,120 L0,120 Z"
            fill="url(#rainwater-gradient)"
            className="opacity-20"
          />
        </svg>
        <style>
          {`
            @keyframes gradient-move {
              0% { background-position: 0% center; }
              50% { background-position: 100% center; }
              100% { background-position: 0% center; }
            }
            @keyframes waterwave {
              0% { transform: translateX(0); }
              100% { transform: translateX(-100px); }
            }
          `}
        </style>
      </div>
    </section>
  );
}
