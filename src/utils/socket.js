// src/utils/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false });
  }
  return socket;
}

export function connectSocket(token) {
  const s = getSocket();
  if (token) {
    s.auth = { token };
  }
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket && socket.connected) socket.disconnect();
}
