import './App.css'
import Topbar from './components/Topbar.tsx';
import Sidebar from './components/Sidebar.tsx';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Login from './pages/Login.tsx';
import ModelDashboard from './pages/ModelDashboard.tsx'; // Import ModelDashboard
import AssistDashboard from './pages/AssistDashboard.tsx'; // Import AssistDashboard
import AdminDashboard from './pages/AdminDashboard.tsx';
import Register from './pages/Register.tsx'; // Import Register component
import { AuthProvider } from './context/AuthContext.tsx'; // Import AuthProvider
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Topbar />
          <ToastContainer />
          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} /> {/* Add route for Register */}
              <Route element={<ProtectedRoute />}>
                <Route path="/model/dashboard" element={<ModelDashboard />} />
                <Route path="/assist/dashboard" element={<AssistDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </div>
          <Sidebar />
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}
export default App
