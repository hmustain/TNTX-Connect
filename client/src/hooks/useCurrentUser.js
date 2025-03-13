import { useState, useEffect } from 'react';

const useCurrentUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }
    // Fetch current user from your backend
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
        console.log("User data from /api/auth/me:", data.data);
        setUser(data.data);
      })      
      .catch((error) => {
        console.error("Error fetching current user:", error);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);
  
  return { user, loading };
};

export default useCurrentUser;
