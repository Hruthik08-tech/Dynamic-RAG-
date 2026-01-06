
// Import pages 
import './Navbar.css';
import ProfileCard from './profileCard';

// Import built-in modules  
import React, { useState, useEffect } from 'react';

// Import avatars from assets 
import avatar_1 from '../assets/avatar_1.png';
import avatar_2 from '../assets/avatar_2.png';
import avatar_3 from '../assets/avatar_3.png';
import avatar_4 from '../assets/avatar_4.png';
import avatar_5 from '../assets/avatar_5.png';
import avatar_6 from '../assets/avatar_6.png';
import avatar_7 from '../assets/avatar_7.png';
import avatar_8 from '../assets/avatar_8.png';


const AVATAR_MAP = {
  // Mapping avatar IDs to their corresponding image paths
  1: avatar_1,
  2: avatar_2,
  3: avatar_3,
  4: avatar_4,
  5: avatar_5,
  6: avatar_6,
  7: avatar_7,
  8: avatar_8,
};

const Navbar = ({avatar, username} ) => {
  // props: username, avatar 
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfile = (e) => {
    e.stopPropagation();
    setIsProfileOpen(!isProfileOpen);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  const handleOutsideClick = (event) => {
    if (!event.target.closest('.cyber-profile-section')) {
      closeProfile();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);


  // Handle scroll effect for aesthetic depth
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const avatarSrc = AVATAR_MAP[avatar] || avatar_1; // Default to avatar_1 if not found

  return (
    <nav className={`cyber-nav-container ${isScrolled ? 'scrolled' : ''}`}>
      <div className="cyber-nav-content">
        {/* Left Section: Logo & Brand */}
        <div className="cyber-nav-left">
          <div className="cyber-logo-icon"></div>
          <span className="cyber-brand-name">NEON_CORE</span>
        </div>

        {/* Right Section: Navigation Links & CTA */}
        <div className="cyber-nav-right">
          <ul className="cyber-nav-links">
            <li><a href="#home" className="cyber-link">Home</a></li>
            <li><a href="#about" className="cyber-link">About Us</a></li>
          </ul>

          <div className="cyber-profile-section">
            <div className="cyber-avatar-wrapper" onClick={toggleProfile}>
              <div className="cyber-avatar">
                <img src={avatarSrc} alt="User Avatar" className="nav-avatar-img" />
              </div>
              <div className="cyber-status-indicator"></div>
            </div>

            {isProfileOpen && (
              <div className="profile-dropdown-container">
                <ProfileCard avatar={avatar} user={{ name: username || "Alex Cipher", email: "user@neon.tech", bio: "Authorized User", sex: "Unknown" }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;