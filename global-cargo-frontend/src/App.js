import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
// import Layout from './components/Layout';
import ShipManagement from "./pages/ShipManagement"; // Assuming you have a ShipManagement component


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* Add more routes as needed */}
        <Route path="/ships" element={<ShipManagement />} />
      </Routes>
    </Router>
  );
}

export default App;