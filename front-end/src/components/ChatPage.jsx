import React, { useState, useRef, useEffect } from 'react';

const users = {
  Alice: '🧑‍🦰',
  Bob: '🧑‍🦱',
  You: '🧑'
};

function ChatPage() {
  const [messages, setMessages] = useState([
    { text: 'Hello!', sender: 'Alice' },
    { text: 'Hi there!', sender: 'Bob' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    setMessages([...messages, { text: input, sender: 'You' }]);
    setInput('');
  };

  return (
    <div style={{
      maxWidth: 500,
      margin: '40px auto',
      padding: 24,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(60, 72, 88, 0.15)'
    }}>
      <h2 style={{
        textAlign: 'center',
        color: '#6366f1',
        marginBottom: 24,
        fontFamily: 'Segoe UI, sans-serif'
      }}>💬 Chat Room</h2>
      <div style={{
        border: '1px solid #d1d5db',
        background: '#fff',
        padding: 16,
        height: 320,
        overflowY: 'auto',
        borderRadius: 12,
        marginBottom: 16,
        boxShadow: '0 2px 8px rgba(60, 72, 88, 0.07)'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 14,
            justifyContent: msg.sender === 'You' ? 'flex-end' : 'flex-start'
          }}>
            {msg.sender !== 'You' && (
              <span style={{
                fontSize: 24,
                marginRight: 10
              }}>{users[msg.sender]}</span>
            )}
            <div style={{
              background: msg.sender === 'You' ? '#6366f1' : '#e0e7ff',
              color: msg.sender === 'You' ? '#fff' : '#374151',
              padding: '10px 16px',
              borderRadius: 18,
              maxWidth: 300,
              fontFamily: 'Segoe UI, sans-serif',
              boxShadow: msg.sender === 'You' ? '0 2px 8px #6366f133' : '0 2px 8px #e0e7ff33'
            }}>
              <strong style={{ fontWeight: 500 }}>{msg.sender}</strong>
              <div style={{ fontSize: 15 }}>{msg.text}</div>
            </div>
            {msg.sender === 'You' && (
              <span style={{
                fontSize: 24,
                marginLeft: 10
              }}>{users[msg.sender]}</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            fontSize: 16,
            fontFamily: 'Segoe UI, sans-serif',
            outline: 'none',
            boxShadow: '0 1px 4px #6366f111'
          }}
        />
        <button
          type="submit"
          style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0 24px',
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #6366f133',
            transition: 'background 0.2s'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatPage