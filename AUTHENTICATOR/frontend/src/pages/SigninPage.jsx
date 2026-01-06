// Import pages 
import './SigninPage.css';
import Navbar from '../components/Navbar';

// Import built-in modules 
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


// Import vanta modules for animation
import HALO from 'vanta/dist/vanta.halo.min'; // Import vanta HALO
import * as THREE from 'three'; // Import three.js 



const SigninPage = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    // redirects to home page 
    navigate('/');
  };

  // useState hooks 
  const [formData, setformData] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');


  const handleChange = (e) => {
    // handles change in input fields 
    const {name, value} = e.target;
    setformData(prevState => ({
      ...prevState, 
      // name: name of the input field 
      // value: value of the input field 
      [name]: value 
    }))
  };

  
  const handleOtpNavigation = () => {
    // redirects to otp page 
    navigate('/verify-otp')
  }

  const sendData = async () => {
    // sends data to backend 
    try {
      // ROUTE_AUTHENTICATOR_BACKEND: route to authenticator backend server
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

      // condition rendering if the user is successfully logged in or not 
      if (response.ok) {
        setMessage(result.message);
        setMessageType('success');
        navigate('/verify-otp');
      } else {
        setMessage(result.message);
        setMessageType('error');
      }

    } catch (error) {
      console.log("Error in sending data", error);

    }
  }

  const handleSubmit = (e) => {
    // sends data to backend 
    e.preventDefault();
    sendData();

  }


  // vanta animation hooks 
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    // Initialize vanta when the components mounts
    if (!vantaEffect) {
      setVantaEffect(
        HALO({
          el: vantaRef.current, 
          THREE: THREE,        
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
      {/*signin form*/}
      <div className="si-card" style = {{position: "relative", zIndex: 1}}>
        <div className="si-header">
          <h2>Welcome Back</h2>
          <p className = {`si-message ${messageType}`}>{message}</p>
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