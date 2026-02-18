
import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200">
      {user ? <CalendarPage /> : <LoginPage />}
    </div>
  );
};

export default App;
