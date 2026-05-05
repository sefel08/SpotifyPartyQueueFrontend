import { useLayoutEffect } from 'react';
import Dashboard from './global/views/Dashboard';
import { AuthProvider } from './global/contexts/AuthContext';
import { PartyProvider } from './global/contexts/PartyContext';

function App() {

  useLayoutEffect(() => {
    const postLoginRedirect = localStorage.getItem('postLoginRedirect');
    if (postLoginRedirect) {
      localStorage.removeItem('postLoginRedirect');
      window.location.href = postLoginRedirect;
    }
  }, []);

  return (
    <AuthProvider>
      <PartyProvider>
        <Dashboard />
      </PartyProvider>
    </AuthProvider>
  );
}

export default App;