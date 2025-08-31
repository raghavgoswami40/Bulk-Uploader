import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ActualsUpload from "./pages/ActualsUpload";
import ActualsCustomMapping from "./pages/ActualsCustomMapping";
import ActualsReview from "./pages/ActualsReview";
import { NotificationProvider } from "./context/NotificationContext";
import Notification from "./components/Notification";

function App() {
  return (
    <NotificationProvider>
      <Router>
        {/* Global notification component (always rendered) */}
        <Notification />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/actualsupload" element={<ActualsUpload />} />
          <Route
            path="/actualscustommapping"
            element={<ActualsCustomMapping />}
          />
          <Route path="/actualsreview" element={<ActualsReview />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
