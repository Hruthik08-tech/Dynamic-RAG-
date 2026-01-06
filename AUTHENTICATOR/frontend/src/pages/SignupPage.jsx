
// Import components
import Navbar from '../components/Navbar';
import './SignupPage.css';

// Importing built-in modules 
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Import vanta modules for animation
import HALO from 'vanta/dist/vanta.halo.min'; // Import vanta HALO
import * as THREE from 'three'; // Import three.js 



const SignupPage = () => {

  // useState hooks 
  const [formData, setformData] = useState({});         // formData to collect details and send to backend 
  const [message, setMessage] = useState('');           // message to display (backend response)
  const [messageType, setMessageType] = useState('');   // message type to display to user (success/error)


  // handles change in input fields 
  const handleChange = (e) => {
    const {name, value} = e.target;
    setformData(prevState => ({
      ...prevState, 
      // name: name of the input filed 
      // value: value of the input filed 
      [name]: value 
    }))
  }


  
  const handleSubmit = (e) => {
    // redirects to avatar selection page, along with the formData
    e.preventDefault();
    console.log("SignupPage - Submitting formData:", formData);
    navigate('/avatar-selection', { state: { formData } });

  }


  const navigate = useNavigate();

  const handleNavigation = () => {
    // redirects to signin page
    navigate('/signin');
  };

  // animation hooks 
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    // Initialize vanta when the components mounts
    if (!vantaEffect) {
      setVantaEffect(
        HALO({
          el: vantaRef.current, 
          THREE: THREE,         
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          baseColor: '#35d431',
          backgroundColor: '#060c06'
        })
      );
    }
    // Cleanup the effect when the component unmounts
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);




  return (
    <div className="sp-page-container" ref = {vantaRef}> 
      <Navbar />
      {/* signup form */}
      <div className="sp-card" style = {{position: 'relative', zIndex: 1}}> 
        <div className="sp-header">
          <h2>Create Account</h2>
          <p className = {`sp-message ${messageType}`}> {message} </p>
        </div>
        
        <form className="sp-form" onSubmit={handleSubmit}>
          <div className="sp-input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value = {formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="sp-input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              value = {formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="sp-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value = {formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="sp-submit-btn">
            Sign Up
          </button>
        </form>

        <div className="sp-footer">
          <p>Already have an account? <a className="sp-link" onClick={handleNavigation}>Log in</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;