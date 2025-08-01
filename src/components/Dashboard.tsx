import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import './Chatbox.css';
import './Dashboard.css';

interface ChatMessage {
  role: 'user' | 'system';
  content: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const activeAccount = accounts && accounts.length > 0 ? accounts[0] : null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');

  const goToAccountManagement = () => {
    navigate('/account-management', { state: { fromDashboard: true } });
  };

  const goToDweebeAdminMain = () => {
    navigate('/dweebe-admin-main', { state: { fromDashboard: true } });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMessage]);

    try {
      

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dweebe-spawn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: input,
            userId: activeAccount?.localAccountId || 'anonymous',
            userName: activeAccount?.username || 'unknown'
            })
        });


        /* Local Environment for dev prior to 30 July 2025
        const response = await fetch('/api/dweebe-spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          userId: activeAccount?.localAccountId || 'anonymous',
          userName: activeAccount?.username || 'unknown'
        })
      });
      */

      const data = await response.json();

      const systemMessage: ChatMessage = { role: 'system', content: data.responseText };
      setMessages((prev) => [...prev, systemMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
    }

    setInput('');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-title">DWEE.BE</div>
        <div className="header-buttons">
          <button className="btn-eblue" onClick={goToAccountManagement}>Manage Account</button>
          <button className="btn-eorange" onClick={goToDweebeAdminMain}>dweebe Admin Main</button>
        </div>
      </header>

      <div className="chatbox-wrapper">
        <div className="chatbox-container">
          <div className="chatbox-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <span>{msg.content}</span>
              </div>
            ))}
          </div>
          <div className="chatbox-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
