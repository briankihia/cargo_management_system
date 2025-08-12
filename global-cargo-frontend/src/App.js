import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
// import Layout from './components/Layout';
import ShipManagement from "./pages/ShipManagement"; // Assuming you have a ShipManagement component
import CargoManagement from "./pages/CargoManagement"; // Assuming you have a CargoManagement component
import CrewManagement from "./pages/CrewManagement";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* Add more routes as needed */}
        <Route path="/ships" element={<ShipManagement />} />
        <Route path="/cargo" element={<CargoManagement />} />
        {/* Add other routes for your application */}
        <Route path="/crew" element={<CrewManagement />} />
      </Routes>
    </Router>
  );
}

export default App;