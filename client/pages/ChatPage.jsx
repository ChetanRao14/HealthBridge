import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

import { api, getAccessToken } from '../services/api';

export default function ChatPage() {
  const { appointmentId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const listRef = useRef(null);
  const socketRef = useRef(null);

  const socketUrl = useMemo(() => import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/appointments/${appointmentId}/messages`);
        setMessages(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load messages');
      }
    })();
  }, [appointmentId]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const socket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('chat:join', { appointmentId });
    });

    socket.on('chat:message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('chat:error', (payload) => {
      setError(payload?.message || 'Chat error');
    });

    return () => {
      socketRef.current = null;
      socket.disconnect();
    };
  }, [appointmentId, socketUrl]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  const send = async () => {
    const clean = text.trim();
    if (!clean) return;

    setText('');

    const socket = socketRef.current;
    if (!socket) {
      setError('Chat is not connected');
      return;
    }

    socket.emit('chat:send', { appointmentId, text: clean });
  };

  return (
    <div className="hb-card p-6">
      <div className="hb-card-title">Chat</div>
      <div className="hb-muted">Appointment: {appointmentId}</div>

      {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}

      <div ref={listRef} className="mt-4 h-[420px] overflow-auto border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50">
        {messages.map((m) => (
          <div key={m._id} className="text-sm">
            <div className="text-xs text-slate-500">{m.senderRole} • {new Date(m.createdAt).toLocaleString()}</div>
            <div className="text-slate-900">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="hb-input flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
        />
        <button className="hb-btn-secondary" type="button" onClick={send}>
          Send
        </button>
      </div>

      <div className="mt-2 text-xs text-slate-500">
        Note: Chat works only after appointment is confirmed.
      </div>
    </div>
  );
}
