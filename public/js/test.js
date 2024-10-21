const APP_ID = "97f3ce4bb6a24afba91a0229da432666";
let uid = sessionStorage.getItem("uid");
uid = null;
if (!uid) {
  uid = String(Math.floor(Math.random() * 10000));
  sessionStorage.setItem("uid", uid);
}

const fetchToken = async (uid, channelName) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/generate-token?uid=${uid}&channelName=${channelName}`
    );
    return response.data.token;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

const fetchTokenRTM = async (uid) => {
  expiry = 3600;
  try {
    const response = await axios.get(`http://localhost:3000/rtm/${uid}`);
    return response.data.token;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

let client;
let rtmClient;
let channel;

const querySrting = window.location.search;
const urlParams = new URLSearchParams(querySrting);

let roomId = urlParams.get("room");

if (!roomId) {
  roomId = "main";
}

// let displayName = sessionStorage.getItem(`display_name`);

// if (!displayName) {

//   window.location = "/";
// }

let localTracks = [];
let remoteUsers = {};

let loclaScreenTracks;
let sharingScreen = false;

let joinRoomInit = async (uid) => {
  console.log("room");

  let rtmtoken = await fetchTokenRTM(uid);

  console.log("get the token", rtmtoken);

  client = await AgoraRTM.createInstance(APP_ID);
  await client.login({ uid, rtmtoken });
  // channel = client.createChannel(roomId);
  // await channel.join();
  // let rtcToken = await fetchToken(uid, roomId);
  // client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  // console.log("asdf", rtcToken, roomId, uid);
  // await client.join(APP_ID, roomId, rtcToken, uid);

  // client.on("user-published", hadleUserPublished);
  // client.on("user-left", handleUserLeft);

  // joinStream();
};

// let joinStream = async () => {
//   localTracks = await AgoraRTC.createMicrophoneAndCameraTracks(
//     {},
//     {
//       encoderConfig: {
//         width: { min: 640, ideal: 1920, max: 1920 },
//         height: { min: 480, ideal: 1080, max: 1080 },
//       },
//     }
//   );

//   let player = `<div class="video__container" id="user-container-${uid}">
//   <div class="video-player" id="user-${uid}"></div>
// </div>`;

//   document
//     .getElementById("streams__container")
//     .insertAdjacentHTML("beforeend", player);

//   document
//     .getElementById(`user-container-${uid}`)
//     .addEventListener("click", expandVideoFrame);
//   localTracks[1].play(`user-${uid}`);

//   await client.publish([localTracks[0], localTracks[1]]);
// };

// let hadleUserPublished = async (user, mediaType) => {
//   console.log("join the publish");
//   remoteUsers[user.uid] = user;

//   await client.subscribe(user, mediaType);

//   let player = document.getElementById(`user-container-${user.uid}`);
//   if (player === null) {
//     player = `<div class="video__container" id="user-container-${user.uid}">
//                 <div class="video-player" id="user-${user.uid}"></div>
//             </div>`;

//     document
//       .getElementById("streams__container")
//       .insertAdjacentHTML("beforeend", player);
//     document
//       .getElementById(`user-container-${user.uid}`)
//       .addEventListener("click", expandVideoFrame);
//   }

//   if (displayFrame.style.display) {
//     let videoFrames = document.getElementById(`user-conatainer-${user.uid}`);
//     player.style.height = "100px";
//     player.style.width = "100px";
//   }
//   if (mediaType === "video") {
//     user.videoTrack.play(`user-${user.uid}`);
//   }

//   if (mediaType === "audio") {
//     user.audioTrack.play(`user-${user.uid}`);
//   }
// };

// let handleUserLeft = async (user) => {
//   delete remoteUsers[user.id];
//   document.getElementById(`user-container-${user - id}`).remove();

//   if (userIdInDisplayFrame === user.id) {
//     displayFrame.style.display = null;

//     let videoFrames = document.getElementById("video__container");

//     for (let i = 0; videoFrames.length > i; i++) {
//       videoFrames[i].style.height = "300px";
//       videoFrames[i].style.width = "300px";
//     }
//   }
// };

// let toggleCamera = async (e) => {
//   let button = e.currentTarget;
//   console.log("Toggle camera called. Muted:", localTracks[1]?.muted);

//   if (localTracks[1]) {
//     if (localTracks[1].muted) {
//       console.log("Unmuting camera...");
//       await localTracks[1].setMuted(false);
//       button.classList.add("active");
//     } else {
//       console.log("Muting camera...");
//       await localTracks[1].setMuted(true);
//       button.classList.remove("active");
//     }
//     console.log("Camera status changed. Now muted:", localTracks[1].muted);
//   } else {
//     console.error("Camera track not found.");
//   }
// };

// let toggleMic = async (e) => {
//   let button = e.currentTarget;

//   if (localTracks[0]) {
//     if (localTracks[1].muted) {
//       await localTracks[0].setMuted(false);
//       button.classList.add("active");
//     } else {
//       await localTracks[0].setMuted(true);
//       button.classList.remove("active");
//     }
//   } else {
//     console.error("audio track not found.");
//   }
// };

// let toggleScreen = async (e) => {
//   let screenButton = e.currentTarget;
//   let cameraButton = document.getElementById("camera-btn");

//   if (!sharingScreen) {
//     console.log("screen");

//     sharingScreen = true;
//     screenButton.classList.add("active");
//     cameraButton.classList.remove("active");
//     cameraButton.style.display = "none";

//     loclaScreenTracks = await AgoraRTC.createScreenVideoTrack();

//     document.getElementById(`user-container-${uid}`).remove();
//     displayFrame.style.display = "block";

//     let player = `<div class="video__container" id="user-container-${uid}">
//     <div class="video-player" id="user-${uid}"></div>
//   </div>`;

//     displayFrame.insertAdjacentHTML("beforeend", player);

//     document
//       .getElementById(`user-container-${uid}`)
//       .addEventListener("click", expandVideoFrame);

//     userIdInDisplayFrame = `user-container-${uid}`;

//     loclaScreenTracks.play(`user-${uid}`);

//     await client.unpublish([localTracks[1]]);
//     await client.publish([loclaScreenTracks]);

//     let videoFrames = document.getElementsByClassName("video__container");

//     console.log("screen");
//     for (let i = 0; videoFrames.length > i; i++) {
//       if (videoFrames[i].id != userIdInDisplayFrame) {
//         videoFrames[i].style.height = "100px";
//         videoFrames[i].style.width = "100px";
//       }
//     }
//   } else {
//     sharingScreen = false;
//     cameraButton.style.display = "block";

//     document.getElementById(`user-container-${uid}`).remove();

//     await client.unpublish([loclaScreenTracks]);

//     switchToCamera();
//   }
// };

// let switchToCamera = async () => {
//   let player = `<div class="video__container" id="user-container-${uid}">
//     <div class="video-player" id="user-${uid}"></div>
//   </div>`;

//   displayFrame.insertAdjacentHTML("beforeend", player);

//   await localTracks[0].setMuted(true);
//   await localTracks[1].setMuted(true);

//   document.getElementById("mic-btn").classList.remove("active");
//   document.getElementById("screen-btn").classList.remove("active");

//   localTracks[1].play(`user-${uid}`);

//   await client.publish([localTracks[1]]);
// };

// // await client.publish([localTracks[1]]);
// // localTracks[1].play(`user-${id}`);

// document.getElementById("camera-btn").addEventListener("click", toggleCamera);

// document.getElementById("mic-btn").addEventListener("click", toggleMic);

// document.getElementById("screen-btn").addEventListener("click", toggleScreen);

joinRoomInit(uid);
