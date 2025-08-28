import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ActualsUpload from "./pages/ActualsUpload";
import ActualsCustomMapping from "./pages/ActualsCustomMapping";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/actualsupload" element={<ActualsUpload />} />
        <Route path="/actualscustommapping" element={<ActualsCustomMapping />} />
      </Routes>
    </Router>
  );
}

export default App;