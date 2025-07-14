import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; // or 'tsparticles' for full functionality

const CosmicBackground = () => {
  // This init function is essential for loading the tsParticles engine
  const particlesInit = useCallback(async (engine) => {
    console.log(engine);
    // You can initiate the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    await console.log(container);
  }, []);

  // Configuration for a subtle starfield
  const particlesOptions = {
    background: {
      color: {
        value: "transparent", // Background handled by outer div
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: {
          enable: false, // No interaction on click
          mode: "push",
        },
        onHover: {
          enable: false, // No interaction on hover
          mode: "repulse",
        },
        resize: true,
      },
    },
    particles: {
      color: {
        value: "#ffffff", // White stars
      },
      links: {
        enable: false, // No lines between stars
      },
      move: {
        direction: "bottom", // Stars fall downwards
        enable: true,
        outModes: {
          default: "out",
        },
        random: true, // Random movement
        speed: 0.1, // Very slow movement
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 800, // Number of stars
      },
      opacity: {
        value: { min: 0.1, max: 0.5 }, // Subtle opacity variation for twinkling effect
        animation: {
          enable: true,
          speed: 0.5,
          sync: false,
          startValue: "random",
          destroy: "none",
        },
      },
      shape: {
        type: "circle", // Stars are circles
      },
      size: {
        value: { min: 0.5, max: 2 }, // Small stars, varied sizes
        animation: {
          enable: true,
          speed: 1,
          sync: false,
          startValue: "random",
          destroy: "none",
        },
      },
    },
    detectRetina: true,
  };

  return (
    <div className="cosmic-background">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={particlesOptions}
      />
    </div>
  );
};

export default CosmicBackground;
