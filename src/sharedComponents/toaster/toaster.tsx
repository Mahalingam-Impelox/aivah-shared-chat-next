'use client';

import { ToastContainer } from 'react-toastify';

const Toaster: React.FC<unknown> = () => {
  return (
    <ToastContainer
      toastClassName="!bg-gray-800 !text-white !border !border-gray-700 !rounded-lg !shadow-lg"
      progressClassName="!bg-blue-500"
      closeButton={({ closeToast }) => (
        <button
          onClick={closeToast}
          className="!text-white hover:!text-gray-300 !transition-colors"
        >
          ✕
        </button>
      )}
    />
  );
};

export default Toaster;
