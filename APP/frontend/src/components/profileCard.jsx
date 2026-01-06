import React, { useState } from 'react';
import './ProfileCard.css';

import avatar_1 from '../assets/avatar_1.png';
import avatar_2 from '../assets/avatar_2.png';
import avatar_3 from '../assets/avatar_3.png';
import avatar_4 from '../assets/avatar_4.png';
import avatar_5 from '../assets/avatar_5.png';
import avatar_6 from '../assets/avatar_6.png';
import avatar_7 from '../assets/avatar_7.png';
import avatar_8 from '../assets/avatar_8.png';

const AVATAR_MAP = {
  1: avatar_1,
  2: avatar_2,
  3: avatar_3,
  4: avatar_4,
  5: avatar_5,
  6: avatar_6,
  7: avatar_7,
  8: avatar_8,
};

// Default placeholder if no props are provided
const DEFAULT_USER = {
  name: "Alex Cipher",
  email: "alex.cipher@neonfin.tech",
  bio: "Senior Quantitative Analyst specializing in high-frequency crypto markets.",
  sex: "Male", // or "Female", "Non-binary", etc.
};

const ProfileCard = ({ user = DEFAULT_USER, avatar }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleCard = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const avatarSrc = AVATAR_MAP[avatar] || avatar_1;

  return (
    <>
      <div 
        className={`pc-card ${isExpanded ? 'expanded' : ''}`} 
        onClick={toggleCard}
      >
        {/* --- HEADER (Always Visible) --- */}
        <div className="pc-header">
          <div className="pc-avatar-wrapper">
            <img src={avatarSrc} alt="Profile" className="pc-avatar-img" />
            <div className="pc-status-dot"></div>
          </div>
          
          <div className="pc-header-info">
            <h3 className="pc-name">{user.name}</h3>
            <span className="pc-role">Authorized User</span>
          </div>

          <div className="pc-toggle-icon">
            <svg 
              viewBox="0 0 24 24" 
              width="24" 
              height="24" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        {/* --- BODY (Collapsible Dropdown) --- */}
        <div className="pc-content">
          <div className="pc-divider"></div>
          
          <div className="pc-detail-row">
            <span className="pc-label">Digital ID</span>
            <span className="pc-value email">{user.email}</span>
          </div>

          <div className="pc-detail-row">
            <span className="pc-label">Identity</span>
            <span className="pc-value">{user.sex}</span>
          </div>

          <div className="pc-detail-column">
            <span className="pc-label">Bio</span>
            <p className="pc-bio-text">
              {user.bio}
            </p>
          </div>

          <div className="pc-actions">
            <button className="pc-btn-outline" onClick={(e) => e.stopPropagation()}>
              Edit Profile
            </button>
            <button className="pc-btn-primary" onClick={(e) => e.stopPropagation()}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileCard;