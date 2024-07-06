// const express = require("express");
// const router = express.Router();
// const axios = require('axios');
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const ZOOM_API_KEY = '709UyY5gR67SqKLwJACw';
// const ZOOM_API_SECRET = 'FbYI4IhFgBxxF4GTbQ8u5U6UH0xBLR6w';

// // Function to generate a JWT token
// function generateZoomToken() {
//   const payload = {
//     iss: ZOOM_API_KEY,
//     exp: Math.floor(Date.now() / 1000) + 60 * 60 // Token valid for 1 hour
//   };
//   return jwt.sign(payload, ZOOM_API_SECRET);
// }

// // Endpoint to create a Zoom meeting
// router.post('/create-meeting', async (req, res) => {
//   const token = generateZoomToken();
//   const config = {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     }
//   };
//   const body = {
//     topic: req.body.topic || 'Sample Meeting',
//     type: 1, // Instant meeting
//     settings: {
//       host_video: req.body.host_video || true,
//       participant_video: req.body.participant_video || true
//     }
//   };

//   try {
//     const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', body, config);
//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error('Error creating meeting:', error.response ? error.response.data : error.message);
//     res.status(500).json({ error: 'Error creating meeting' });
//   }
// });

// module.exports = router;