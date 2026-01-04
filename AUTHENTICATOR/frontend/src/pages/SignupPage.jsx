import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

import './SignupPage.css';

import React, { useState, useEffect, useRef } from 'react';
import HALO from 'vanta/dist/vanta.halo.min'; // Import vanta birds 
import * as THREE from 'three'; // Import three.js 



const SignupPage = () => {
  const [formData, setformData] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');


  const handleChange = (e) => {
    const {name, value} = e.target;
    setformData(prevState => ({
      ...prevState, 
      [name]: value 
    }))
  }

  const sendData = async () => {
    try {
      const ROUTE_AUTHENTICATOR_BACKEND = import.meta.env.VITE_ROUTE_AUTHENTICATOR_BACKEND;
      const url = `${ROUTE_AUTHENTICATOR_BACKEND}/api/registerUser`;
      const data = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        date: new Date().toISOString(),
        role: 'user', 
        isVerified: false, 
        otp: ''
      };
      const response = await fetch(url, {
        method: 'POST', 
        headers: {
          'content-type': 'application/json'
        }, 
        body: JSON.stringify(data)

      });
      const result = await response.json();

      // messages to display 
      if (response.ok) {
        setMessage(result.message || "Registration successful");
        setMessageType(result.message || 'success');
      } else {
        setMessage(result.message || "Registration failed");
        setMessageType(result.message || 'error');
      }

      return result;
  } catch (error) {
    setMessage("Network error. Please try again");
    setMessageType("error");

  }

};

  const handleSubmit = (e) => {
    e.preventDefault();
    sendData();

  }


  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/signin');
  };

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
    <div className="sp-page-container" ref = {vantaRef}> 
      <Navbar />
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