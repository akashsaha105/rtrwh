"use client";
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; // slim version for smaller bundle size

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine); // load slim package instead of full
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: { color: "transparent" },
        fpsLimit: 60,
        particles: {
          number: { value: 40, density: { enable: true, value_area: 800 } },
          color: { value: "#ffffff" },
          opacity: { value: 0.3, random: true },
          size: { value: 3, random: true },
          move: {
            enable: true,
            speed: 0.5,
            direction: "top",
            outModes: { default: "out" },
          },
        },
        detectRetina: true,
      }}
    />
  );
}

