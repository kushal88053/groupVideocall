const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { RtcTokenBuilder, RtcRole, RtmTokenBuilder } = require("agora-token");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.CERTIFICATE;
const APP_ID_RTM = process.env.APP_ID_RTM;
const APP_ID_RTM_CERTIFICATE = process.env.APP_ID_RTM_CERTIFICATE;

const ping = (req, resp) => {
  resp.send({ message: "pong" });
};

app.use(express.static(__dirname + "/public"));

const generateRTCToken = (req, resp) => {
  // set response header
  resp.header("Access-Control-Allow-Origin", "*");
  // get channel name
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(400).json({ error: "channel is required" });
  }
  // get uid
  let uid = req.params.uid;
  if (!uid || uid === "") {
    return resp.status(400).json({ error: "uid is required" });
  }
  // get role
  let role;
  if (req.params.role === "publisher") {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === "audience") {
    role = RtcRole.SUBSCRIBER;
  } else {
    return resp.status(400).json({ error: "role is incorrect" });
  }
  // get the expire time
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === "") {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  let token;
  if (req.params.tokentype === "uid") {
    token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      expireTime,
      privilegeExpireTime
    );
  } else {
    return resp.status(400).json({ error: "token type is invalid" });
  }
  // return the token
  console.log(APP_ID, APP_CERTIFICATE, uid, expireTime);
  console.log("rtc :", token);

  return resp.json({ rtcToken: token });
};

const generateRTMToken = (req, resp) => {
  // set response header
  resp.header("Access-Control-Allow-Origin", "*");

  // get uid
  // let uid = req.params.uid;
  // if (!uid || uid === "") {
  //   return resp.status(400).json({ error: "uid is required" });
  // }
  // // get role
  // let role = RtmRole.Rtm_User;
  // // get the expire time
  // let expireTime = req.query.expiry;
  // if (!expireTime || expireTime === "") {
  //   expireTime = 3600;
  // } else {
  //   expireTime = parseInt(expireTime, 10);
  // }
  // // calculate privilege expire time
  // const currentTime = Math.floor(Date.now() / 1000);
  // const privilegeExpireTime = currentTime + expireTime;
  // // build the token
  // console.log(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime);
  // const token = RtmTokenBuilder.buildToken(
  //   APP_ID,
  //   APP_CERTIFICATE,
  //   uid,
  //   expireTime
  // );
  // console.log("rtm", token);
  // // return the token
  // return resp.json({ rtmToken: token });

  console.log("rtmtoken");
  const uid = req.params.uid || Math.floor(Math.random() * 1000000); // Generate UID if not provided

  console.log("uid : ", uid);
  const expirationTimeInSeconds = 3600; // Token expiration time (1 hour)

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  console.log(APP_ID_RTM, APP_ID_RTM_CERTIFICATE, uid, expirationTimeInSeconds);
  // Generate the RTM token
  const token = RtmTokenBuilder.buildToken(
    APP_ID_RTM,
    APP_ID_RTM_CERTIFICATE,
    uid,
    expirationTimeInSeconds
  );

  console.log(`Generated RTM Token for UID: ${uid}`);

  console.log(APP_ID_RTM, APP_ID_RTM_CERTIFICATE, uid, expirationTimeInSeconds);
  console.log("rtm :", token);
  // Send the generated token as JSON
  return resp.json({ rtmToken: token });
};

app.options("*", cors());
app.get("/ping", ping);
app.get("/rtc/:channel/:role/:tokentype/:uid", generateRTCToken);
app.get("/rtm/:uid/", generateRTMToken);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
