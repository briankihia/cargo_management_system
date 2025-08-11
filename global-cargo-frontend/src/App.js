import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
// import Layout from './components/Layout';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
       
      </Routes>
    </Router>
  );
}

export default App;