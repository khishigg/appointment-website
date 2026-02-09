import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MyNavbar from "./components/MyNavbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import BookingPage from "./pages/BookingPage";
import CalendarPage from "./pages/CalendarPage";
import Login from "./pages/Login";
import "react-big-calendar/lib/css/react-big-calendar.css";

export default function App() {
  return (
    <Router>
      <MyNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Footer />
    </Router>
  );
}
