
// Import pages 
import Navbar from '../components/Navbar'; // Assuming Navbar files are in the same directory
import './HomePage.css';

// Import built-in modules 
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Import vanta modules for animation 
import NET from 'vanta/dist/vanta.net.min'; // Import vanta NET 
import * as THREE from 'three'; // Import three.js 



const HomePage = ({username, avatar}) => {

  const navigate = useNavigate();

  const handleGetStarted = () => {
    // redirects to chat page 
    navigate('/chat');
  }

  // vanta animation hooks 
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    // Initialize vanta when the components mounts
    if (!vantaEffect) {
      setVantaEffect(
        NET({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: '#54c750',
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
    <div className="cyber-home-container" ref={vantaRef}>
      <Navbar avatar={avatar} username={username} />
      <main className="cyber-hero-section">
        <div className="cyber-hero-content">
          <h1 className="cyber-hero-title">
            Welcome <span className="highlight-text">{username || 'Guest'}</span>
          </h1>
          <p className="cyber-hero-subtitle">
            Next-generation interfaces built for speed and scale. 
          </p>
          <button className="cyber-hero-cta" onClick={handleGetStarted}>
            Get Started Now
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;