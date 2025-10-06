import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const getAuthToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("admin_token") || undefined;
};

const buildSocketOptions = () => {
  const token = getAuthToken();
  return {
    autoConnect: false,
    transports: ["websocket", "polling"],
    withCredentials: true,
    auth: token ? { token } : undefined,
  };
};

const socket = io(SOCKET_URL, buildSocketOptions());

export const reconnectSocket = () => {
  const token = getAuthToken();

  if (!token) {
    socket.disconnect();
    return;
  }

  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }
};

export default socket;
