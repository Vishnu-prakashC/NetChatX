require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('your-mongodb-atlas-connection-string', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected successfully");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Chat server is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
