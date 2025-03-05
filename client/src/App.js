import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import LandingScreen from './components/LandingScreen';
import LoginScreen from './components/LoginScreen';
import RegistrationScreen from './components/RegistrationScreen'; // Import RegistrationScreen
import TicketScreen from './components/TicketScreen';
import BreakdownTicketForm from './components/BreakdownTicketForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegistrationScreen />} />
            <Route path="/ticket/:id" element={<TicketScreen />} />
            <Route path="/breakdown" element={<BreakdownTicketForm />} />
            {/* You can add other routes like /profile etc. */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
