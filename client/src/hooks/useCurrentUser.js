// src/hooks/useCurrentUser.js
import { useState, useEffect } from 'react';

const useCurrentUser = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/currentUser'); // adjust the URL as needed
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchUser();
  }, []);
  
  return user;
};

export default useCurrentUser;
