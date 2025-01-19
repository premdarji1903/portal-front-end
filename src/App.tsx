import './App.css'
import SignUp from './components/SignUp'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OTPVerification from './components/OTPVerification'
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/otp" element={<OTPVerification />} />
      </Routes>
    </Router>
  )
}

export default App
