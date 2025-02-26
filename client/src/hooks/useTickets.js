// src/hooks/useTickets.js
import { useState, useEffect } from 'react';

const useTickets = (user) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('authToken');
        // Choose endpoint based on user role
        let endpoint = '/api/tickets';
        if (user.role === "driver") {
          endpoint = '/api/tickets/mytickets';
        } else if (user.role === "company_user") {
          endpoint = '/api/tickets/company';
        }
        
        const response = await fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch tickets: ${response.status}`);
        }
        const data = await response.json();
        // Ensure that data.data is an array.
        const ticketArray = Array.isArray(data.data) ? data.data : [];
        setTickets(ticketArray);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTickets();
    } else {
      setTickets([]);
      setLoading(false);
    }
  }, [user]);

  return { tickets, loading };
};

export default useTickets;
