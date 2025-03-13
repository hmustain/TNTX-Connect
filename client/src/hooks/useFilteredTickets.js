import { useState, useEffect } from 'react';

const useFilteredTickets = (user) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no user is available (e.g., user logged out), clear tickets and set loading to false.
    if (!user) {
      setTickets([]);
      setLoading(false);
      return;
    }

    // When a user is available, start fetching tickets
    setLoading(true);
    const token = localStorage.getItem('authToken');
    let endpoint = '/api/tickets/company';
    if (
      user.role === 'admin' ||
      user.role === 'agent' ||
      (user.company && user.company.name.toUpperCase() === 'TNTX SOLUTIONS')
    ) {
      endpoint = '/api/tickets';
    }
    
    console.log("useFilteredTickets - User:", user);
    console.log("useFilteredTickets - Chosen endpoint:", endpoint);
    console.log("useFilteredTickets - Token:", token);

    const fetchTickets = async () => {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch tickets. Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("useFilteredTickets - Fetched data:", data);
        if (data && data.data && Array.isArray(data.data)) {
          setTickets(data.data);
          console.log("useFilteredTickets - Updated tickets state:", data.data);
        } else {
          console.warn("Fetched data is not in expected format:", data);
          setTickets([]);
        }
      } catch (err) {
        console.error("useFilteredTickets - Error:", err);
        setError(err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  return { tickets, loading, error };
};

export default useFilteredTickets;
