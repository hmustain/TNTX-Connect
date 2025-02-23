import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Fetch the current user from your backend. Adjust URL if needed.
      fetch('/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch current user');
          }
          return res.json();
        })
        .then((data) => {
          setAuthData({ token, user: data.data }); // assuming data.data is the user
        })
        .catch((error) => {
          console.error("Error fetching current user:", error);
          setAuthData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authData, setAuthData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
