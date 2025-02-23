import { useState, useEffect } from 'react';

const useTickets = (user) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YmE4NzE1ZGU0ZmZkNjIzZDFhZjFhYSIsImlhdCI6MTc0MDI3NzY2MCwiZXhwIjoxNzQyODY5NjYwfQ.qRSySMLOy42OBOn8Hja44rMgVP0nWS_aSqe0dr3_q7M"; // Replace with your actual token
        const response = await fetch('/api/tickets', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        const ticketArray = Array.isArray(data.data) ? data.data : [];
        let filteredTickets = ticketArray;
        if (user.role === "driver") {
          filteredTickets = ticketArray.filter(ticket => ticket.user._id === user.id);
        } else if (user.role === "company") {
          filteredTickets = ticketArray.filter(ticket => ticket.company.name === user.company);
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
