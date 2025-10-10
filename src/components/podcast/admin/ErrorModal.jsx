import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

const ErrorModal = ({ open, onClose, message }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 h-full w-full">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center justify-center gap-2 text-lg font-semibold p-3 rounded-lg">
          <span className="text-2xl font-bold">Invalid Spotify Link</span>
          <ExclamationTriangleIcon className="h-12 w-12 text-red-700" />
        </div>
        <p className="text-gray-700 mt-4 text-center text-sm">{message}</p>
        <div className="flex justify-center mt-4">
          <Button onClick={onClose} variant="primary">
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;