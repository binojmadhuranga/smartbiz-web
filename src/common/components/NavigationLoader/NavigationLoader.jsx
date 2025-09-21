import React from 'react';
import { useNavigation } from '../../../context/NavigationContext';

const NavigationLoader = () => {
  const { isNavigating, currentSection } = useNavigation();

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full md:h-12 md:w-12 border-b-2 border-green-600"></div>
          <div>
            <p className="text-lg font-semibold text-gray-900">Loading...</p>
            {currentSection && (
              <p className="text-sm text-gray-600">Navigating to {currentSection}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationLoader;