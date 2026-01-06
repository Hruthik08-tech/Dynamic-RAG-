
// Import pages components
import SignupPage from './pages/SignupPage.jsx';        // For user registration
import AvatarSelection from './pages/AvatarSelection.jsx';    // User avatar selection

import SigninPage from './pages/SigninPage.jsx';        // User Login
import OtpVerifier  from './pages/OtpVerifier.jsx';        // OTP verification and redirecting to APP 

// Import built-in modules 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
  return (
    // Router and paths 
    <Router>
        <Routes>
          <Route path="/" element={<SignupPage />} />
          <Route path="/avatar-selection" element={<AvatarSelection />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path ="/verify-otp" element={<OtpVerifier />} /> 
        </Routes>
    </Router>
  )
}

export default App;


