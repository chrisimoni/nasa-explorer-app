import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Import Link for navigation

function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center text-starlight-100 p-4 text-center pt-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        className="text-6xl md:text-7xl font-heading text-nebula-300 mb-6 drop-shadow-xl"
        variants={itemVariants}
      >
        AstroExplorer
      </motion.h1>
      <motion.p
        className="text-2xl md:text-3xl text-starlight-200 mb-10 max-w-2xl leading-relaxed"
        variants={itemVariants}
      >
        Your gateway to the wonders of space, powered by NASA's APIs. Explore
        daily cosmic images and Mars Rover discoveries.
      </motion.p>
      <motion.div
        className="flex flex-col sm:flex-row gap-6 mt-8"
        variants={containerVariants} // Stagger animations for buttons too
      >
        <Link to="/apod">
          <motion.button
            className="px-10 py-4 bg-comet-500 text-space-900 font-bold text-xl rounded-lg shadow-lg hover:bg-comet-400 transition-colors duration-300 transform hover:scale-105"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore APOD
          </motion.button>
        </Link>
        <Link to="/mars-rover">
          <motion.button
            className="px-10 py-4 bg-nebula-500 text-starlight-50 font-bold text-xl rounded-lg shadow-lg hover:bg-nebula-400 transition-colors duration-300 transform hover:scale-105"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Mars Rover Photos
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default HomePage;
