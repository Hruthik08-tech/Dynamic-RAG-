import React, { useState, useEffect } from 'react';
import './Navbar.css';



const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for aesthetic depth
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <li><a href="/" className="cyber-link">Signup</a></li>
            <li><a href="/signin" className="cyber-link">Signin</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;