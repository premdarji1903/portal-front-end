import './App.css'
import SignUp from './components/SignUp'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OTPVerification from './components/OTPVerification'
import Login from './components/Login';
import UserList from './components/UserList';
import LandingPage from './components/LandingPage';
import Dashboard from './components/DashBoard';
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-list" element={<UserList />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
