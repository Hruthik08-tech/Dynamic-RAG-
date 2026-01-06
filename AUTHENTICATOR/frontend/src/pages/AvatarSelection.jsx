
// Import pages and components 
import Navbar from '../components/Navbar';
import './AvatarSelection.css';

// Import built-in modules 
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Import avatars from assets 
import avatar_1 from '../assets/avatar_1.png';
import avatar_2 from '../assets/avatar_2.png';
import avatar_3 from '../assets/avatar_3.png';
import avatar_4 from '../assets/avatar_4.png';
import avatar_5 from '../assets/avatar_5.png';
import avatar_6 from '../assets/avatar_6.png';
import avatar_7 from '../assets/avatar_7.png';
import avatar_8 from '../assets/avatar_8.png';



// Avatar data 
const AVATAR_DATA = [
  { id: 1, src: avatar_1},
  { id: 2, src: avatar_2},
  { id: 3, src: avatar_3},
  { id: 4, src: avatar_4},
  { id: 5, src: avatar_5},
  { id: 6, src: avatar_6},
  { id: 7, src: avatar_7},
  { id: 8, src: avatar_8},
];

const AvatarSelection = () => {


  const navigate = useNavigate();
  const location = useLocation();
  
  // Robust data extraction: check for nested formData or direct state
  const signupData = location.state?.formData || location.state || {};
  
  useEffect(() => {
    
    // checks if any registration data is missing or incomplete 
    if (!signupData || !signupData.email || !signupData.password) {
      console.warn("Registration data missing or incomplete, redirecting to signup.");
      // Small delay to allow user to see the log if they are debugging
      const timer = setTimeout(() => navigate('/'), 1000);
      return () => clearTimeout(timer);
    }
  }, 
  // Dependencies array 
  [signupData, navigate, location.state]);


  // State variables  
  const [currentIndex, setCurrentIndex] = useState(2); 
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleNext = () => {
    // Move to the next avatar
    setCurrentIndex((prev) => (prev + 1) % AVATAR_DATA.length);
  };

  const handlePrev = () => {
    // Move to the previous avatar
    setCurrentIndex((prev) => (prev - 1 + AVATAR_DATA.length) % AVATAR_DATA.length);
  };

  const handleSelect = () => {
    // Get the current avatar
    const currentAvatar = AVATAR_DATA[currentIndex];
    // Toggle selection: if already selected, unselect.
    if (selectedId === currentAvatar.id) {
      setSelectedId(null);
    } else {
      setSelectedId(currentAvatar.id);
    }
  };

  const handleConfirm = () => {
    // Confirm the selected avatar
    if (selectedId) {
      console.log(`Avatar ${selectedId} confirmed.`);
      // Add your API call or navigation logic here
      navigate('/signin'); 
    }
  };

  // Helper to determine position relative to active index
  const getPositionClass = (index) => {
    if (index === currentIndex) return "active";
    // Check previous (handling wrap-around)
    const prevIndex = (currentIndex - 1 + AVATAR_DATA.length) % AVATAR_DATA.length;
    if (index === prevIndex) return "prev";
    // Check next (handling wrap-around)
    const nextIndex = (currentIndex + 1) % AVATAR_DATA.length;
    if (index === nextIndex) return "next";
    return "hidden";
  };

  const sendAvatar = async() => {
    try {
      // ROUTE_AUTHENTICATOR_BACKEND: route to authenticator backend server 
      const ROUTE_AUTHENTICATOR_BACKEND = import.meta.env.VITE_ROUTE_AUTHENTICATOR_BACKEND;
      const url = `${ROUTE_AUTHENTICATOR_BACKEND}/api/registerUser`;
      
      // registrationData: data to be sent to backend 
      const registrationData = {
        // spread operator to include all data from signupData (i.e, username, email, password) 
        ...signupData,
        avatar: selectedId,
        date: new Date().toISOString(),
        role: 'user',
        otp: ''
      };

      console.log("Sending registration data to backend:", registrationData);

      // send data to backend 
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      const data = await response.json();
      console.log("Backend response:", data);
      
      if (response.ok) {
        // condition rendering if the user is successfully logged in or not 
        setMessage("Profile Initialized Successfully!");
        setMessageType("success");
        setTimeout(() => navigate('/signin'), 2000);
      } else {
        // condition rendering if the user is not successfully logged in 
        setMessage(data.message || "Registration failed");
        setMessageType("error");
        if (data.receivedKeys) {
          console.error("Backend received these keys:", data.receivedKeys);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("Network error. Please try again.");
      setMessageType("error");
    }
  }

  const handleSubmit = () => {
    // handles submit button 
    sendAvatar();
  }


  return (
    <div className="av-page-container">
      <Navbar />
      <div className="av-card">
        <div className="av-header">
          <h2>Select Identity</h2>
          <p>Choose your digital persona to interact with the system.</p>
          {message && <p className={`av-message ${messageType}`}>{message}</p>}
        </div>

        {/* Carousel Window */}
        <div className="av-carousel-wrapper">
          <button className="av-nav-btn left" onClick={handlePrev}>
            &#8592;
          </button>

          <div className="av-track">
            {AVATAR_DATA.map((avatar, index) => {
              const position = getPositionClass(index);
              const isSelected = selectedId === avatar.id;
              
              return (
                <div 
                  key={avatar.id} 
                  className={`av-item ${position} ${isSelected ? 'selected' : ''}`}
                  onClick={() => position === 'active' && handleSelect()}
                >
                  <div className="av-image-container">
                    <img src={avatar.src} alt={avatar.label} />
                    {isSelected && <div className="av-check-badge">✓</div>}
                  </div>
                </div>
              );
            })}
          </div>

          <button className="av-nav-btn right" onClick={handleNext}>
            &#8594;
          </button>
        </div>

        {/* Status & Confirmation */}
        <div className="av-footer">
          <p className={`av-status ${selectedId ? 'ready' : ''}`}>
            {selectedId 
              ? "Avatar Identity Confirmed" 
              : "Please select an avatar to proceed"}
          </p>
          
          <button 
            className="av-confirm-btn" 
            disabled={!selectedId}
            onClick={handleSubmit}
          >
            Initialize Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelection;