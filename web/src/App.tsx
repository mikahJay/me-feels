import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import UserHome from './pages/UserHome';
import Dashboard from './pages/Dashboard';
import About from './pages/About';

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/home" replace /> : <Home />} />
          <Route path="/home" element={user ? <UserHome /> : <Navigate to="/" replace />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" replace />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
