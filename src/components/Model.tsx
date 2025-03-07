import React from "react";

interface ModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-96 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-medium text-black">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
