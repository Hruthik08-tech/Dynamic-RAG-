import HomePage from "./pages/HomePage";
import ChatInterface from "./pages/ChatInterface";

import './index.css';

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";


function App() {
  return (
    <div className = "app-viewport"> 
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatInterface />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
