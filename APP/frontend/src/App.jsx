// Import pages 
import HomePage from "./pages/HomePage";
import ChatInterface from "./pages/ChatInterface";

// Import styles 
import './index.css';

// Import built-in modules 
import React, { useState, useEffect, useRef} from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Import environment variables 


function App() {

  // Get user name from authenticator backend 
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  // GET OTHER USER FIELDS TO PASS AS PROPS TO PAGES AND COMPONENTS 

  // ROUTE_AUTHENTICATOR_BACKEND: route to authenticator backend 
  const ROUTE_AUTHENTICATOR_BACKEND = import.meta.env.VITE_ROUTE_AUTHENTICATOR_BACKEND;

  useEffect(() => {
    const fetchUser = async () => {
      // fetch user from token based user verifier.
      try {
        const response = await fetch(`${ROUTE_AUTHENTICATOR_BACKEND}/api/verifyUser`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (data.status) {
          setUsername(data.existingUser);
          setAvatar(data.existingAvatar);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className = "app-viewport"> 
      <Router>
        <Routes>
          <Route path="/" element={<HomePage username={username} avatar={avatar} />} />
          <Route path="/chat" element={<ChatInterface username={username} avatar={avatar} />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
