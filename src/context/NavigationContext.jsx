import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentSection, setCurrentSection] = useState('');

  const startNavigation = (sectionName) => {
    setCurrentSection(sectionName);
    setIsNavigating(true);
    
    // Auto-stop loading after 1 second
    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
  };

  return (
    <NavigationContext.Provider value={{
      isNavigating,
      currentSection,
      startNavigation,
      stopNavigation
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
