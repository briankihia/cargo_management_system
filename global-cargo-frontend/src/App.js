import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import Layout from './components/Layout';
import ShipManagement from "./pages/ShipManagement"; // Assuming you have a ShipManagement component
import CargoManagement from "./pages/CargoManagement"; // Assuming you have a CargoManagement component
import CrewManagement from "./pages/CrewManagement";
import PortManagement from "./pages/PortManagement";
import ClientManagement from "./pages/ClientManagement"; // Assuming you have a ClientManagement component
import ShipmentManagement from "./pages/ShipmentManagement"; // Assuming you have a ShipmentManagement component
import Dashboard from "./pages/Dashboard";
import RegistrationPage from "./pages/RegistrationPage/RegistrationPage"; // Assuming you have a RegistrationPage component


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        {/* Add more routes as needed */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/ships" element={<Layout><ShipManagement /></Layout>} />
        <Route path="/cargo" element={<Layout><CargoManagement /></Layout>} />
        {/* Add other routes for your application */}
        <Route path="/crew" element={<Layout><CrewManagement /></Layout>} />
        {/* Add more routes as needed */}
        <Route path="/ports" element={<Layout><PortManagement /></Layout>} />
        {/* Add other routes for your application */}
        <Route path="/clients" element={<Layout><ClientManagement /></Layout>} />
        <Route path="/shipments" element={<Layout><ShipmentManagement /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;