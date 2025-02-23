import { useState, useEffect } from 'react';

const useTickets = (user) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/tickets');
        const data = await response.json();
        let filteredTickets = data;
        if (user.role === "driver") {
          filteredTickets = data.filter(ticket => ticket.driverId === user.id);
        } else if (user.role === "company") {
          filteredTickets = data.filter(ticket => ticket.company === user.company);
        }
        setTickets(filteredTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchTickets();
    }
  }, [user]);
  
  return { tickets, loading };
};

export default useTickets;
