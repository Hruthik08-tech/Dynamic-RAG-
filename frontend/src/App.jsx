import HomePage from "./pages/HomePage";
import ChatInterface from "./pages/ChatInterface";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatInterface />} />
      </Routes>
    </Router>
  )
}

export default App
