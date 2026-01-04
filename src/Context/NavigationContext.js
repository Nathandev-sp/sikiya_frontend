import React, { createContext } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ navigation, children }) => {
  return (
    <NavigationContext.Provider value={navigation}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationContext;