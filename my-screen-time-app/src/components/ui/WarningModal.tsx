import React from 'react';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmButtonText?: string;
  onConfirm?: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({
  isOpen,
  onClose,
  title = "Usage Limit Exceeded",
  message,
  confirmButtonText = "Okay, I understand",
  onConfirm,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
     if (onConfirm) {
         onConfirm();
     }
     onClose(); // Always close on confirm
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={handleConfirm}
          className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {confirmButtonText}
        </button>
      </div>
    </div>
  );
};

export default WarningModal;
