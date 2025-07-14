import { Routes, Route } from "react-router-dom"; // Only import Routes and Route here
import CosmicBackground from "./components/layout/CosmicBackground";
import Navbar from "./components/layout/Navbar";
import ApodPage from "./pages/ApodPage";
import HomePage from "./pages/HomePage";
import MarsRoverPhotosPage from "./pages/MarsRoverPhotosPage";

function App() {
  return (
    <div className="relative min-h-screen text-starlight-100">
      <CosmicBackground />
      <Navbar />
      <main className="relative z-10">
        {" "}
        {/* Ensure content is above background */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/apod" element={<ApodPage />} />
          <Route path="/mars-rover" element={<MarsRoverPhotosPage />} />
          {/* Add other routes here as you create them */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
