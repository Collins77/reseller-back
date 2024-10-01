// Create a new file named UserContext.js
import React, { createContext, useState, useContext } from 'react';

const ResellerContext = createContext();

export const ResellerProvider = ({ children }) => {
  const [reseller, setReseller] = useState(null);

  return (
    <ResellerContext.Provider value={{ reseller, setReseller }}>
      {children}
    </ResellerContext.Provider>
  );
};

export const useReseller = () => useContext(ResellerContext);
