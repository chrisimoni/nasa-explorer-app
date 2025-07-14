import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MarsPhotoModal = ({ photo, onClose }) => {
  // If no photo is provided, don't render the modal
  if (!photo) return null;

  // Disable scrolling on the body when the modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { y: "-100vh", opacity: 0 },
    visible: {
      y: "0",
      opacity: 1,
      transition: { delay: 0.1, type: "spring", stiffness: 100, damping: 15 },
    },
    exit: { y: "100vh", opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <AnimatePresence>
      {photo && ( // Ensure photo exists before rendering motion components
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          onClick={onClose} // Close modal when clicking outside
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-space-900 bg-opacity-80 backdrop-blur-sm"></div>

          {/* Modal Content */}
          <motion.div
            className="relative bg-space-800 border border-space-600 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-starlight-100 hover:text-comet-300 transition-colors text-3xl font-bold z-10"
              aria-label="Close modal"
            >
              &times;
            </button>

            {/* Image */}
            <img
              src={photo.img_src}
              alt={`Mars Rover Photo ${photo.id}`}
              className="w-full h-auto object-contain max-h-[60vh] rounded-t-lg border-b border-space-600"
            />

            {/* Details */}
            <div className="p-6 text-left flex-grow">
              <h2 className="text-3xl font-heading text-nebula-300 mb-3">
                Rover:{" "}
                {photo.rover.name.charAt(0).toUpperCase() +
                  photo.rover.name.slice(1)}
              </h2>
              <p className="text-starlight-200 text-lg mb-1">
                Camera: {photo.camera.full_name} (
                <span className="font-mono">{photo.camera.name}</span>)
              </p>
              <p className="text-starlight-200 text-lg mb-1">
                Sol: {photo.sol} (Martian Day)
              </p>
              <p className="text-starlight-200 text-lg">
                Earth Date: {photo.earth_date}
              </p>
              <p className="text-starlight-300 text-sm mt-4">
                Photo ID: {photo.id}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MarsPhotoModal;
