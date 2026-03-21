import Dashboard from './global/views/Dashboard';
import { AuthProvider } from './global/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

export default App;