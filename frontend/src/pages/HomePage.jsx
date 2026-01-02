import React from 'react';
import Navbar from '../components/Navbar'; // Assuming Navbar files are in the same directory
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="cyber-home-container">
      {/* The sticky Navbar sits at the top of this container */}
      <Navbar />

      {/* Main Hero Content Area */}
      <main className="cyber-hero-section">
        <div className="cyber-hero-content">
          <h1 className="cyber-hero-title">
            Forge Your <span className="highlight-text">Digital Future</span>
          </h1>
          <p className="cyber-hero-subtitle">
            Next-generation interfaces built for speed and scale.
          </p>
          <button className="cyber-hero-cta">
            Get Started Now
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;