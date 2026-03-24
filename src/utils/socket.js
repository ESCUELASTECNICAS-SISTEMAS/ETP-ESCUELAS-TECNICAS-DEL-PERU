// src/utils/socket.js
import { io } from 'socket.io-client';

// Usa la misma base que tu API por defecto (definida en `apiStatic.js`).
// Esto evita que el frontend intente conectar a `localhost:3000` cuando el backend
// real está en el dominio de producción.
const API_BASE =
  import.meta.env.VITE_API_BASE || 'https://servidorpaginaetp-production.up.railway.app'

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || API_BASE).replace(/\/$/, '');

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
