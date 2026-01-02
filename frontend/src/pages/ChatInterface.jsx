import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './ChatInterface.css';

// Connect to backend
const socket = io.connect("http://localhost:3001");

const ChatInterface = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Listen for incoming messages
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    // Load history
    socket.on("load_history", (history) => {
      setMessageList(history);
    });

    return () => socket.off(); // Cleanup
  }, []);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      // Emit to server
      await socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="cyber-chat-layout">
      {/* Sidebar - mimicking ChatGPT history */}
      <aside className="cyber-sidebar">
        <div className="new-chat-btn">+ New Chat</div>
        <div className="history-section">
          <div className="history-label">Today</div>
          <div className="history-item">Neon Core Project</div>
          <div className="history-item">React Architecture</div>
        </div>
        <div className="user-profile">
          <div className="user-avatar"></div>
          <span>Guest User</span>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="cyber-chat-main">
        <div className="chat-window">
          {messageList.map((msg, index) => (
            <div 
              key={index} 
              className={`message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}
            >
              <div className={`message-bubble ${msg.sender}`}>
                {/* Optional: Add icon/avatar here */}
                <div className="message-text">{msg.text}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={currentMessage}
              placeholder="Message Neon Bot..."
              onChange={(event) => setCurrentMessage(event.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={sendMessage} className="send-btn">
              ➤
            </button>
          </div>
          <p className="disclaimer">Neon Bot can make mistakes. Consider checking important info.</p>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;