import React from 'react';
import { useNavigation } from '../../../context/NavigationContext';

const NavigationLoader = () => {
  const { isNavigating, currentSection } = useNavigation();

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center transition-all duration-300">
      <div className="flex flex-col items-center space-y-4">
        {/* Simple Loading Spinner */}
        <div className="w-12 h-12 border-3 border-green-200 rounded-full animate-spin border-t-green-600"></div>
        
        {/* Loading Text */}
        <div className="text-center">
          <h3 className="text-base font-medium text-gray-700">
            Loading {currentSection}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default NavigationLoader;
