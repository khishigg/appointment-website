import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import MyNavbar from "./components/MyNavbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import BookingPage from "./pages/BookingPage";
import CalendarPage from "./pages/CalendarPage";
import Login from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAuthStore } from "./store/AuthStore";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

const AppShell = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!isAuthPage && <MyNavbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Home is public so visitors can use the header login action. */}
        <Route path="/" element={<Home />} />

        {/* Protected Routes */}
        <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/emch-songoh" element={<Navigate to="/booking" replace />} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      </Routes>
      {!isAuthPage && <Footer />}
    </>
  );
};
