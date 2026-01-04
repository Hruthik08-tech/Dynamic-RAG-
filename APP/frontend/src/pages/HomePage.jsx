
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Assuming Navbar files are in the same directory
import './HomePage.css';

// Adding vanta background animation 
import React, { useState, useEffect, useRef } from 'react';
import NET from 'vanta/dist/vanta.net.min'; // Import vanta birds 
import * as THREE from 'three'; // Import three.js 

const ROUTE_AUTHENTICATOR_BACKEND = import.meta.env.VITE_ROUTE_AUTHENTICATOR_BACKEND;

const HomePage = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      // 1. Check URL first
      const urlUsername = searchParams.get('username');
      if (urlUsername) {
        setUsername(urlUsername);
        return;
      }

      // 2. If not in URL, check session
      try {
        const response = await fetch(`${ROUTE_AUTHENTICATOR_BACKEND}/api/verifyUser`,  {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (data.status) {
          setUsername(data.existingUser);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [searchParams]);

  const handleGetStarted = () => {
    navigate('/chat');
  }

  // Create a state to hold the effect and a ref for the container 
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
      <Navbar username={username} />
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