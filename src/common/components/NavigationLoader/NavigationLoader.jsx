import React from 'react';
import { useNavigation } from '../../../context/NavigationContext';

const NavigationLoader = () => {
  const { isNavigating, currentSection } = useNavigation();

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300">
      <div className="flex flex-col items-center space-y-6 max-w-sm w-full mx-4">
        {/* Loading Animation */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-200 rounded-full animate-spin border-t-green-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-green-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Loading {currentSection}
          </h3>
          <p className="text-sm text-gray-200">
            Please wait a moment...
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 bg-opacity-50 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-progress-bar"></div>
        </div>
        
        {/* Loading Dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default NavigationLoader;
