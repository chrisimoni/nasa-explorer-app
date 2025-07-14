import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar() {
  return (
    <motion.nav
      className="fixed top-0 left-0 w-full z-20 bg-space-900 bg-opacity-80 backdrop-blur-md shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <NavLink
          to="/"
          className="text-3xl font-heading text-nebula-300 hover:text-nebula-200 transition-colors duration-300 drop-shadow-md"
        >
          AstroExplorer
        </NavLink>
        <div className="space-x-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-lg font-semibold transition-colors duration-200 ${
                isActive
                  ? "text-comet-300 border-b-2 border-comet-300"
                  : "text-starlight-100 hover:text-starlight-50"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/apod"
            className={({ isActive }) =>
              `text-lg font-semibold transition-colors duration-200 ${
                isActive
                  ? "text-comet-300 border-b-2 border-comet-300"
                  : "text-starlight-100 hover:text-starlight-50"
              }`
            }
          >
            APOD
          </NavLink>
          {/* Corrected: Removed invalid comment from inside NavLink tag */}
          <NavLink
            to="/mars-rover"
            className={({ isActive }) =>
              `text-lg font-semibold transition-colors duration-200 ${
                isActive
                  ? "text-comet-300 border-b-2 border-comet-300"
                  : "text-starlight-100 hover:text-starlight-50"
              }`
            }
          >
            Mars Rover
          </NavLink>
          {/* Add more navigation links here */}
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
