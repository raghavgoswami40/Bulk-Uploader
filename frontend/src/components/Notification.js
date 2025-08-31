import React from "react";
import { useNotification } from "../context/NotificationContext";

const Notification = () => {
  const { successMessage, errorMessage } = useNotification();

  return (
    <>
      {/* Success */}
      {successMessage && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-96 max-w-full bg-green-600 border border-green-400 text-white text-center font-bold px-4 py-2 shadow-md z-50">
          {successMessage}
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div className="fixed top-12 left-1/2 transform -translate-x-1/2 w-96 max-w-full bg-red-600 border border-red-400 text-white text-center font-bold px-4 py-2 shadow-md z-50">
          {errorMessage}
        </div>
      )}
    </>
  );
};

export default Notification;
