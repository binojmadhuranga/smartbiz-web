import React from 'react';

const LogoutCard = ({ isVisible, onConfirm, onCancel }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-20 md:top-24 lg:top-28 right-4 md:right-6 lg:right-8 z-50">
      <div className="bg-white rounded-lg md:rounded-xl shadow-xl border p-6 md:p-8 lg:p-10 max-w-sm md:max-w-md lg:max-w-lg w-full">
        <div className="flex items-center mb-4 md:mb-6">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-full bg-red-100">
            <svg 
              className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-red-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5C2.962 17.333 3.924 19 5.464 19z" 
              />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-gray-900 mb-2 md:mb-3">
            Confirm Sign Out
          </h3>
          <p className="text-sm md:text-base lg:text-lg text-gray-500 mb-6 md:mb-8 lg:mb-10">
            Are you sure you want to sign out? You will need to log in again to access your dashboard.
          </p>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-5 justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 bg-gray-300 text-gray-700 rounded-md md:rounded-lg hover:bg-gray-400 transition-colors duration-200 font-medium text-sm md:text-base order-2 md:order-1"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 bg-red-500 text-white rounded-md md:rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium text-sm md:text-base order-1 md:order-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutCard;
