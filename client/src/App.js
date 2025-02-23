import React, { useContext } from 'react';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import LandingScreen from './components/LandingScreen';
import LoginScreen from './components/LoginScreen';

function AppContent() {
  const { authData, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  return authData ? <LandingScreen /> : <LoginScreen />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
