const express = require("express");
require("dotenv").config(); // Load .env file
const { RtcTokenBuilder, RtmTokenBuilder, RtcRole } = require("agora-token"); // Use RtcTokenBuilder for RTC tokens
const app = express();
const port = 3000;
const cors = require("cors");
// Middleware to handle JSON payloads in POST requests
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(cors());

// Load Agora credentials from environment variables
const appID = "97f3ce4bb6a24afba91a0229da432666"; // Static App ID
const appCertificate = process.env.CERTIFICATE; // Loaded from .env file

// Route to generate RTC token using GET
app.get("/generate-token", (req, res) => {
  const uid = req.query.uid || Math.floor(Math.random() * 1000000); // Generate UID if not provided
  const channelName = req.query.channelName || "test"; // Use 'test' as default channel name
  const role = 1; // 1 for Publisher
  const expirationTimeInSeconds = 3600; // Token expiration time (1 hour)

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  // Generate the RTC token
  const token = RtcTokenBuilder.buildTokenWithUserAccount(
    appID,
    appCertificate,
    channelName,
    uid,
    role,
    expirationTimeInSeconds,
    privilegeExpiredTs
  );

  console.log(`Generated RTC Token for UID: ${uid} on channel: ${channelName}`);

  res.json({
    token,
  });
});

app.get("/rtm/:uid/", (req, res) => {
  const uid = req.params.uid || Math.floor(Math.random() * 1000000); // Generate UID if not provided
  const expirationTimeInSeconds = 3600; // Token expiration time (1 hour)

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  console.log("ok", appID, appCertificate, uid, expirationTimeInSeconds);
  // Generate the RTM token
  const token = RtmTokenBuilder.buildToken(
    appID,
    appCertificate,
    uid,
    expirationTimeInSeconds
  );

  console.log(`Generated RTM Token for UID: ${uid}`, token);

  // Send the generated token as JSON
  res.json({ token });
});

// Start the server
app.listen(port, () => {
  console.log(`Token server running at http://localhost:${port}`);
});
