import React, { useState, useEffect, useCallback } from "react"; // Add useCallback
import { fetchApod } from "../lib/api";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Default styles (we'll override some)
import "../../src/styles/custom-datepicker.css"; // Our custom styles for it

function ApodPage() {
  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date()); // State for selected date, initialized to today

  // NASA APOD API's earliest date is June 16, 1995
  const earliestApodDate = new Date("1995-06-16");

  // Use useCallback to memoize the data fetching function
  const getApod = useCallback(async (dateToFetch) => {
    setLoading(true);
    setError(null);
    try {
      // Format the date to 'YYYY-MM-DD'
      const formattedDate = dateToFetch
        ? dateToFetch.toISOString().split("T")[0]
        : undefined; // Pass undefined if no date is explicitly selected (for today)

      const data = await fetchApod(formattedDate);
      setApodData(data);
    } catch (err) {
      console.error("Error fetching APOD:", err);
      setError(err.message || "Failed to load APOD. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies as it uses state directly via its parameters

  // Effect to fetch data when selectedDate changes
  useEffect(() => {
    getApod(selectedDate);
  }, [selectedDate, getApod]); // Re-fetch when selectedDate or getApod (due to useCallback) changes

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-4 pt-20" // Use flex-col to stack date picker and content
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Date Picker Section */}
      <motion.div
        className="mb-8 flex flex-col items-center"
        variants={itemVariants}
      >
        <label
          htmlFor="apod-date-picker"
          className="text-starlight-100 text-lg font-heading mb-2"
        >
          Select APOD Date:
        </label>
        <DatePicker
          id="apod-date-picker"
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          minDate={earliestApodDate} // Set the minimum selectable date
          maxDate={new Date()} // Set today as the maximum selectable date
          className="p-3 rounded-md bg-space-700 text-starlight-50 border border-space-600 focus:outline-none focus:ring-2 focus:ring-nebula-500 transition-colors duration-200"
          wrapperClassName="w-auto" // Ensures the wrapper doesn't stretch too wide
          popperPlacement="top-end" // Adjust placement if needed
        />
      </motion.div>

      {loading && (
        <motion.p
          className="text-starlight-100 text-2xl font-heading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          Loading APOD... 🚀
        </motion.p>
      )}

      {error && (
        <motion.p
          className="text-red-500 text-xl font-heading text-center max-w-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Error: {error}
        </motion.p>
      )}

      {apodData && !loading && !error && (
        <motion.div
          className="apod-container bg-space-700 bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl p-8 max-w-4xl w-full text-center border border-space-600"
          variants={containerVariants} // Use containerVariants here for initial reveal
          initial="hidden" // Ensure it starts hidden
          animate="visible" // Animate to visible
          key={apodData.url} // Key change will re-trigger animation on new data
        >
          <motion.h1
            className="text-5xl font-heading text-nebula-300 mb-4 drop-shadow-lg"
            variants={itemVariants}
          >
            {apodData.title}
          </motion.h1>

          <motion.p
            className="text-starlight-200 text-lg mb-6"
            variants={itemVariants}
          >
            {apodData.date} {apodData.copyright && `(© ${apodData.copyright})`}
          </motion.p>

          {apodData.media_type === "image" ? (
            <motion.img
              src={apodData.url}
              alt={apodData.title}
              className="w-full h-auto object-contain rounded-lg mb-6 shadow-md border border-space-600"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              loading="lazy"
            />
          ) : (
            <motion.iframe
              src={apodData.url}
              title={apodData.title}
              className="w-full aspect-video rounded-lg mb-6 shadow-md border border-space-600"
              allowFullScreen
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            ></motion.iframe>
          )}

          <motion.p
            className="text-starlight-100 text-base leading-relaxed text-justify"
            variants={itemVariants}
          >
            {apodData.explanation}
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ApodPage;
