import { useNavigate } from 'react-router-dom';
import './SigninPage.css';
import Navbar from '../components/Navbar';

import React, { useState, useEffect, useRef } from 'react';
import HALO from 'vanta/dist/vanta.halo.min'; // Import vanta birds 
import * as THREE from 'three'; // Import three.js 



const SigninPage = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/');
  };

  const [formData, setformData] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');


  const handleChange = (e) => {
    const {name, value} = e.target;
    setformData(prevState => ({
      ...prevState, 
      [name]: value 
    }))
  };

  
  const handleOtpNavigation = () => {
    navigate('/verify-otp')
  }

  const sendData = async () => {
    try {
      const ROUTE_AUTHENTICATOR_BACKEND = import.meta.env.VITE_ROUTE_AUTHENTICATOR_BACKEND;
      const url = `${ROUTE_AUTHENTICATOR_BACKEND}/api/verifyLogin`;
      const data = {
        email: formData.email,
        password: formData.password
      };
      const response = await fetch(url, {
        method: 'POST', 
        headers: {
          'content-type': 'application/json'
        }, 
        body: JSON.stringify(data)
      });

      const result = await response.json();

    } catch (error) {
      console.log("Error in sending data", error);

    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    sendData();

  }


  // create animation
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    // Initialize vanta when the components mounts
    if (!vantaEffect) {
      setVantaEffect(
        HALO({
          el: vantaRef.current, // Use the ref instead of a CSS selector
          THREE: THREE,         // Pass the Three.js library explicitly
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
    <div className="si-page-container" ref = {vantaRef}>
      <Navbar />
      <div className="si-card" style = {{position: "relative", zIndex: 1}}>
        <div className="si-header">
          <h2>Welcome Back</h2>
          <p>Please enter your details to sign in</p>
        </div>
        
        <form className="si-form" onSubmit={handleSubmit}>
          <div className="si-input-group">
            <label htmlFor="signin-email">Email Address</label>
            <input
              type="email"
              id="signin-email"
              name="email"
              placeholder="name@example.com"
              value = {formData.email}
              onChange={handleChange}
              required

            />
          </div>

          <div className="si-input-group">
            <div className="si-label-row">
              <label htmlFor="signin-password">Password</label>
            </div>
            <input
              type="password"
              id="signin-password"
              name="password"
              placeholder="••••••••"
              value = {formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="si-submit-btn" onClick={handleOtpNavigation}>
            Sign In
          </button>
        </form>

        <div className="si-footer">
          <p>Don't have an account? <a className="si-link" onClick={handleNavigation}>Create one</a></p>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;