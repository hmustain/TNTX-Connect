// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any token on startup so the user always starts logged out.
    localStorage.removeItem('authToken');
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ authData, setAuthData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
