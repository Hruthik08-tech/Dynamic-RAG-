import React, { useState, useRef, useEffect } from 'react';
import './OtpVerifier.css';
import Navbar from '../components/Navbar';


import HALO from 'vanta/dist/vanta.halo.min'; // Import vanta birds 
import * as THREE from 'three'; // Import three.js 


const OtpVerifier = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  // messages to display in the frontend 
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');


  // animation part 
  useEffect(() => {
    // Auto-focus the first input on load
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // handling data and shifting focus animation forward 
  const handleChange = (element, index) => {
    const value = element.value;

    // Only allow numbers
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Take the last character entered to ensure only one digit per box
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move focus to next input if value is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // shifting focus animation backward
  const handleKeyDown = (e, index) => {
    // Handle Backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        // If empty, move to previous and delete
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // handling pasting of OTP preventing from pasting in complete cell. 
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    
    if (!/^\d+$/.test(pasteData)) return; // Only allow digits

    const newOtp = [...otp];
    pasteData.split("").forEach((char, i) => {
      if (inputRefs.current[i]) {
        newOtp[i] = char;
      }
    });
    setOtp(newOtp);
    
    // Focus the last filled input or the next empty one
    const focusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  // handling submit to the backend. 
  const sendData = async () => {
    const ROUTE_AUTHENTICATOR_BACKEND = import.meta.env.VITE_ROUTE_AUTHENTICATOR_BACKEND;
    const url = `${ROUTE_AUTHENTICATOR_BACKEND}/api/verifyOTP`;
    const otpString = otp.join('');
  
    try{
      const res = await fetch (url, {
        method: 'POST', 
        headers: {
          'content-type' : 'application/json'
        }, 
        credentials: 'include',
        body: JSON.stringify({otp: otpString})
      });

      const result = await res.json();

      if (res.ok) {
        // success message to dispaly in the frontend 
        setMessage(result.message || 'OTP verified successfully.');
        setMessageType(result.ok || 'success');

        const ROUTE_APP_FRONTEND = import.meta.env.VITE_ROUTE_APP_FRONTEND;
        window.location.href = `${ROUTE_APP_FRONTEND}?username=${result.username}`;
      } else {
        // error message to display in the frontend 
        setMessage(result.message || 'OTP verification failed.');
        setMessageType(result.ok || 'error');
      }

      return result;
    } catch (error) {
      // error message to display in the frontend 
      setMessage('Network error, please fix your connection.');
      setMessageType('error');
      throw error;
    }
  }

  // submit function 
  const handleSubmit = async (e) => {
    e.preventDefault();

    // simple validation 
    if (otp.join('').length < 6) {
      // error message to display in the frontend 
    }

    await sendData();

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
    <div className="fintech-otp-container" ref = {vantaRef}>
      <Navbar />
      <div className="fintech-otp-card" style = {{position: "relative", zIndex: 1}}>
        <div className="fintech-icon-wrapper">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="fintech-lock-icon"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        
        <h2 className="fintech-title">Authentication Required</h2>
        <p className= {`fintech-message ${messageType}`}>
          {message}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="fintech-input-group" onPaste={handlePaste}>
            {otp.map((data, index) => (
              <input
                className="fintech-otp-input"
                type="text"
                name="otp"
                maxLength="1"
                key={index}
                value={data}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                autoComplete="off"
              />
            ))}
          </div>

          <button type="submit" className="fintech-verify-btn">
            Verify Identity
          </button>
        </form>

        <div className="fintech-resend-wrapper">
          <span className="fintech-text-muted">Didn't receive code? </span>
          <button className="fintech-resend-link">Resend Code</button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerifier;