import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import StudentPage from './pages/StudentPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user } = useAuthStore();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <LoginPage />} />
      
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/staff/*"
        element={
          <ProtectedRoute role="STAFF">
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/student"
        element={
          <ProtectedRoute role="STUDENT">
            <StudentPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
