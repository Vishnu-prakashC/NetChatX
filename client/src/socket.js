// client/src/socket.js
import { io } from "socket.io-client";
import { getAuthToken } from "./api";

const URL = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000";

// Create a socket instance with auth token
const createSocket = () => {
  const token = getAuthToken();
  return io(URL, {
    autoConnect: !!token,
    transports: ["websocket", "polling"],
    withCredentials: true,
    auth: token ? { token } : {},
  });
};

const socket = createSocket();

export const reconnectSocket = () => {
  try {
    socket.disconnect();
  } catch {}
  const token = getAuthToken();
  if (token) {
    socket.auth = { token };
    socket.connect();
  }
};

export default socket;
