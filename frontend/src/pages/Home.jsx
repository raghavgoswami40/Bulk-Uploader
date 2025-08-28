// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import bgImage from "../assets/home-bg.png"; 

const Home = () => {
  return (
    // <div
    //   className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center p-6"
    //   style={{ backgroundImage: `url(${bgImage})` }}
    // >
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center p-6"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: '140% auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
    
      <div className="bg-white bg-opacity-80 p-8 rounded-md text-center">
        <h1 className="text-3xl font-bold mb-6" style={{ marginBottom: '1em' }}>Welcome to the Multi-Project App</h1>
        
        <p className="text-gray-700 mb-4">
          Click the button below to go to the Actuals Upload page:
        </p>

        <Link
          to="/ActualsUpload"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Actuals Upload
        </Link>
      </div>
    </div>
  );
};

export default Home;