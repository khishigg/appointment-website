import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import MyNavbar from "./components/MyNavbar";
import Footer from "./components/Footer";
import { useMapOverlayStore } from './store/MapOverlayStore';
import Home from "./pages/Home";
import BookingPage from "./pages/BookingPage";
import CalendarPage from "./pages/CalendarPage";
import Login from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import MyAppointmentsPage from "./pages/MyAppointmentsPage";
import "react-big-calendar/lib/css/react-big-calendar.css";

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
  const isMapOverlayOpen = useMapOverlayStore((state) => state.isMapOverlayOpen);

  return (
    <>
      {!isAuthPage && !isMapOverlayOpen && <MyNavbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Home is public so visitors can use the header login action. */}
        <Route path="/" element={<Home />} />

        {/* Guest болон нэвтэрсэн хэрэглэгчид ижил public workflow ашиглана. */}
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/emch-songoh" element={<Navigate to="/booking" replace />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/my-appointments" element={<MyAppointmentsPage />} />
      </Routes>
      {!isAuthPage && <Footer />}
    </>
  );
};
