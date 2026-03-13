import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Register from './pages/Register'
import EventDetails from './pages/EventDetails'
import Payment from './pages/Payment'
import Ticket from './pages/Ticket'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div className="app">
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<Navigate to="/dashboard" replace />} />
          <Route path="/events/create" element={<Navigate to="/dashboard" state={{ openCreateModal: true }} replace />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/ticket/:ticketId" element={<Ticket />} />
        </Routes>
      </div>
      <Footer />
      <BottomNav />
    </div>
  )
}

export default App
