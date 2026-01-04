import SignupPage from './pages/SignupPage.jsx';
import SigninPage from './pages/SigninPage.jsx';
import OtpVerifier  from './pages/OtpVerifier.jsx';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<SignupPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path ="/verify-otp" element={<OtpVerifier />} /> 
        </Routes>
    </Router>
  )
}

export default App;


