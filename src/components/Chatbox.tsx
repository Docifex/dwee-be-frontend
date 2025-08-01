import React, { useState } from 'react';
import './Chatbox.css';

// Define a type for messages
interface ChatMessage {
  role: 'user' | 'system';
  content: string;
}

export default function Chatbox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await fetch('/api/dweebe-spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await response.json();

      const systemMessage: ChatMessage = { role: 'system', content: data.responseText };
      setMessages((prev) => [...prev, systemMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
    }

    setInput('');
  };

  return (
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
  );
}
