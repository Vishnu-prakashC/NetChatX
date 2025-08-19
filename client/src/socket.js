// client/src/socket.js
import { io } from "socket.io-client";

// connect to backend server (port 5000)
const socket = io("http://localhost:5000");

export default socket;
