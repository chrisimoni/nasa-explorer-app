import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchMarsRoverPhotos } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import MarsPhotoModal from "../components/MarsPhotoModal";

// --- Chart.js Imports ---
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the components Chart.js needs
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
// --- End Chart.js Imports ---

function MarsRoverPhotosPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Photo Viewer Modal
  const [selectedPhoto, setSelectedPhoto] = useState(null); // Stores the photo data for the modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility

  // Filter states
  const [selectedRover, setSelectedRover] = useState("curiosity"); // Default rover
  const [selectedSol, setSelectedSol] = useState(1000); // Default sol (Martian day), will be updated by max_sol
  const [selectedCamera, setSelectedCamera] = useState(""); // No default camera
  const [page, setPage] = useState(1); // For pagination

  // --- Data for Cameras and Rovers ---
  // Comprehensive list of camera definitions for lookup
  const allCameras = [
    { id: "", name: "All Cameras" },
    { id: "fhaz", name: "Front Hazard Avoidance Camera" },
    { id: "rhaz", name: "Rear Hazard Avoidance Camera" },
    { id: "mast", name: "Mast Camera" },
    { id: "chemcam", name: "Chemistry and Camera Complex" },
    { id: "mahli", name: "Mars Hand Lens Imager" },
    { id: "mardi", name: "Mars Descent Imager" },
    { id: "navcam", name: "Navigation Camera" },
    { id: "pancam", name: "Panoramic Camera" }, // Only for Opportunity & Spirit
    { id: "minites", name: "Miniature Thermal Emission Spectrometer" }, // Only for Opportunity & Spirit
    { id: "edl_rnav", name: "Entry, Descent, and Landing RearHaz Camera" }, // Perseverance
    { id: "edl_fcam", name: "Entry, Descent, and Landing FrontHaz Camera" }, // Perseverance
    { id: "edl_dcam", name: "Entry, Descent, and Landing Desc Cam" }, // Perseverance
    { id: "rimfax", name: "Radar Imager for Mars Subsurface Experiment" }, // Perseverance
    {
      id: "moxie",
      name: "Mars Oxygen In-Situ Resource Utilization Experiment",
    }, // Perseverance
    {
      id: "sherloc",
      name: "Scanning Habitable Environments with Raman & Luminescence for Organics & Chemicals",
    }, // Perseverance
    {
      id: "watson",
      name: "Wide Angle Topographic Sensor for Operations and eNgineering",
    }, // Perseverance - part of SHERLOC
    { id: "supercam", name: "SuperCam" }, // Perseverance
  ];

  // Rover data, including available camera IDs and max_sol values (approximate)
  const rovers = [
    {
      name: "curiosity",
      landing_date: "2012-08-06",
      status: "active",
      max_sol: 4500, // Roughly current for mid-2025
      available_cameras: [
        "fhaz",
        "rhaz",
        "mast",
        "chemcam",
        "mahli",
        "mardi",
        "navcam",
      ],
    },
    {
      name: "opportunity",
      landing_date: "2004-01-25",
      status: "complete",
      max_sol: 5111, // Final sol
      available_cameras: ["fhaz", "rhaz", "navcam", "pancam", "minites"],
    },
    {
      name: "spirit",
      landing_date: "2004-01-04",
      status: "complete",
      max_sol: 2208, // Final sol
      available_cameras: ["fhaz", "rhaz", "navcam", "pancam", "minites"],
    },
    {
      name: "perseverance",
      landing_date: "2021-02-18",
      status: "active",
      max_sol: 1100, // Roughly current for mid-2025
      available_cameras: [
        "edl_rnav",
        "edl_fcam",
        "edl_dcam",
        "rimfax",
        "moxie",
        "sherloc",
        "watson",
        "supercam",
        "navcam",
      ],
    },
  ];
  // --- End Data for Cameras and Rovers ---

  // Memoized current rover data
  const currentRover = useMemo(
    () => rovers.find((r) => r.name === selectedRover),
    [selectedRover]
  );

  // Memoized filtered camera options based on selected rover
  const filteredCameras = useMemo(() => {
    if (!currentRover) return [];

    const options = [{ id: "", name: "All Cameras" }]; // Always include 'All Cameras'

    currentRover.available_cameras.forEach((camId) => {
      const fullCam = allCameras.find((ac) => ac.id === camId);
      if (fullCam) {
        options.push(fullCam);
      }
    });
    return options;
  }, [currentRover, allCameras]);

  // Effect to fetch photos
  const getPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        rover: selectedRover,
        sol: selectedSol,
        camera: selectedCamera,
        page: page,
      };
      const data = await fetchMarsRoverPhotos(params);
      setPhotos(data);
    } catch (err) {
      console.error("Error fetching Mars Rover photos:", err);
      setError(
        err.message || "Failed to load Mars Rover photos. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedRover, selectedSol, selectedCamera, page]);

  // Effect to trigger photo fetch
  useEffect(() => {
    getPhotos();
  }, [getPhotos]);

  // Effect to reset Sol and Camera when rover changes
  useEffect(() => {
    if (currentRover) {
      setSelectedSol(currentRover.max_sol); // Set sol to max_sol for the new rover

      // Reset selected camera if it's not valid for the new rover
      const isCurrentCameraValid =
        currentRover.available_cameras.includes(selectedCamera);
      if (selectedCamera && !isCurrentCameraValid) {
        setSelectedCamera(""); // Reset camera to 'All Cameras'
      }
      setPage(1); // Always reset page when rover changes
    }
  }, [selectedRover, currentRover, selectedCamera]); // selectedCamera in deps to re-evaluate validity

  // --- Chart Data Aggregation ---
  const chartData = useMemo(() => {
    const cameraCounts = {};
    photos.forEach((photo) => {
      const cameraName = photo.camera.full_name || photo.camera.name;
      cameraCounts[cameraName] = (cameraCounts[cameraName] || 0) + 1;
    });

    const labels = Object.keys(cameraCounts);
    const data = Object.values(cameraCounts);

    return {
      labels: labels,
      datasets: [
        {
          label: "Number of Photos",
          data: data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(199, 199, 199, 0.6)",
            "rgba(201, 203, 207, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(199, 199, 199, 1)",
            "rgba(201, 203, 207, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [photos]);

  // --- Chart Options ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#C1C7D0", // text-starlight-200
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: "Photos Per Camera",
        color: "#90CAF9", // text-nebula-300
        font: {
          size: 20,
          family: '"Orbitron", sans-serif',
        },
      },
      tooltip: {
        backgroundColor: "rgba(32, 36, 44, 0.9)", // bg-space-900 with opacity
        titleColor: "#E0E7EB", // starlight-100
        bodyColor: "#C1C7D0", // starlight-200
        borderColor: "#5B6271", // space-600
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#C1C7D0",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(91, 98, 113, 0.2)",
          borderColor: "#5B6271",
        },
      },
      y: {
        ticks: {
          color: "#C1C7D0",
          font: {
            size: 12,
          },
          stepSize: 1,
        },
        grid: {
          color: "rgba(91, 98, 113, 0.2)",
          borderColor: "#5B6271",
        },
        title: {
          display: true,
          text: "Number of Photos",
          color: "#E0E7EB",
          font: {
            size: 14,
          },
        },
      },
    },
  };

  // Modal functions
  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="min-h-screen p-4 pt-20 flex flex-col items-center justify-start text-starlight-100"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        className="text-5xl font-heading text-nebula-300 mb-8 drop-shadow-lg"
        variants={itemVariants}
      >
        Mars Rover Photos
      </motion.h1>

      {/* Filters Section */}
      <motion.div
        className="bg-space-700 bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-8 w-full max-w-4xl flex flex-wrap justify-center gap-4 border border-space-600"
        variants={itemVariants}
      >
        <div className="flex flex-col">
          <label
            htmlFor="rover-select"
            className="text-starlight-200 text-sm mb-1"
          >
            Rover:
          </label>
          <select
            id="rover-select"
            value={selectedRover}
            onChange={(e) => {
              setSelectedRover(e.target.value);
            }}
            className="p-2 rounded-md bg-space-800 text-starlight-50 border border-space-600 focus:outline-none focus:ring-2 focus:ring-comet-500 transition-colors duration-200"
          >
            {rovers.map((rover) => (
              <option key={rover.name} value={rover.name}>
                {rover.name.charAt(0).toUpperCase() + rover.name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="sol-input"
            className="text-starlight-200 text-sm mb-1"
          >
            Sol (Martian Day):
          </label>
          <input
            id="sol-input"
            type="number"
            value={selectedSol}
            onChange={(e) => {
              setSelectedSol(Number(e.target.value));
              setPage(1);
            }}
            min="0" // Sol starts from 0
            max={currentRover ? currentRover.max_sol : ""} // Set max attribute for sol input
            className="p-2 rounded-md bg-space-800 text-starlight-50 border border-space-600 focus:outline-none focus:ring-2 focus:ring-comet-500 w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // Hide number input arrows
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="camera-select"
            className="text-starlight-200 text-sm mb-1"
          >
            Camera:
          </label>
          <select
            id="camera-select"
            value={selectedCamera}
            onChange={(e) => {
              setSelectedCamera(e.target.value);
              setPage(1);
            }}
            className="p-2 rounded-md bg-space-800 text-starlight-50 border border-space-600 focus:outline-none focus:ring-2 focus:ring-comet-500 transition-colors duration-200"
          >
            {/* Use FILTERED CAMERAS here */}
            {filteredCameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.name}
              </option>
            ))}
          </select>
        </div>

        {/* Display Rover Info */}
        {currentRover && (
          <div className="text-starlight-300 text-sm mt-2 p-2 bg-space-900 bg-opacity-50 rounded-md border border-space-700 w-full text-center">
            <p>
              **
              {currentRover.name.charAt(0).toUpperCase() +
                currentRover.name.slice(1)}
              ** landed on Mars on{" "}
              <span className="font-semibold">{currentRover.landing_date}</span>{" "}
              and is{" "}
              <span
                className={`font-semibold ${
                  currentRover.status === "active"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {currentRover.status}.
              </span>
            </p>
            <p className="mt-1">
              Photos generally available up to Sol:{" "}
              <span className="font-semibold text-nebula-300">
                {currentRover.max_sol}
              </span>
              .
            </p>
          </div>
        )}
      </motion.div>

      {/* Chart Section */}
      {!loading && photos.length > 0 && (
        <motion.div
          className="bg-space-700 bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-8 w-full max-w-4xl border border-space-600"
          variants={itemVariants}
          style={{ height: "400px" }} // Fixed height for the chart container
        >
          <Bar data={chartData} options={chartOptions} />
        </motion.div>
      )}

      {loading && (
        <motion.p
          className="text-starlight-100 text-2xl font-heading mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          Searching for Mars Photos... 🪐
        </motion.p>
      )}

      {error && (
        <motion.p
          className="text-red-500 text-xl font-heading text-center mt-10 max-w-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Error: {error}
        </motion.p>
      )}

      {!loading && photos.length === 0 && !error && (
        <motion.p
          className="text-starlight-200 text-xl font-heading text-center mt-10 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          No photos found for these criteria. Try a different Sol or Camera!
        </motion.p>
      )}

      {/* Photos Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={`${selectedRover}-${selectedSol}-${selectedCamera}-${page}`} // Key change to re-trigger grid animation
      >
        <AnimatePresence>
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              className="bg-space-700 bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden border border-space-600 flex flex-col cursor-pointer hover:scale-[1.02] transition-transform duration-200"
              variants={itemVariants}
              layout // Enables smooth layout transitions (move/scale)
              onClick={() => openModal(photo)}
            >
              <img
                src={photo.img_src}
                alt={`Mars Rover Photo ${photo.id}`}
                className="w-full h-48 object-cover border-b border-space-600"
                loading="lazy"
              />
              <div className="p-4 text-left flex-grow">
                <h3 className="text-lg font-semibold text-nebula-300 mb-1">
                  Rover:{" "}
                  {photo.rover.name.charAt(0).toUpperCase() +
                    photo.rover.name.slice(1)}
                </h3>
                <p className="text-starlight-200 text-sm">
                  Camera: {photo.camera.full_name} ({photo.camera.name})
                </p>
                <p className="text-starlight-200 text-sm">
                  Sol: {photo.sol} (Earth Date: {photo.earth_date})
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination Controls (Basic) */}
      {!loading && photos.length > 0 && (
        <motion.div
          className="mt-8 flex gap-4 text-lg font-heading"
          variants={itemVariants}
        >
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-6 py-2 rounded-md bg-nebula-700 text-starlight-50 hover:bg-nebula-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="self-center text-starlight-100">Page {page}</span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="px-6 py-2 rounded-md bg-nebula-700 text-starlight-50 hover:bg-nebula-600 transition-colors"
          >
            Next
          </button>
        </motion.div>
      )}

      {/* Mars Photo Viewer Modal */}
      {isModalOpen && (
        <MarsPhotoModal photo={selectedPhoto} onClose={closeModal} />
      )}
    </motion.div>
  );
}

export default MarsRoverPhotosPage;
