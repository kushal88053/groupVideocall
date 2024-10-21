const APP_ID = "97f3ce4bb6a24afba91a0229da432666";
let uid = sessionStorage.getItem("uid");
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

let displayName = urlParams.get("name");

if (!displayName) {
  window.location = "/";
}

let localTracks = [];
let remoteUsers = {};

let localScreenTracks;
let sharingScreen = false;
let init = async () => {
  token = await fetchTokenRTM(uid);

  console.log("get the token", token);

  rtmClient = await AgoraRTM.createInstance(APP_ID);
  await rtmClient.login({ uid, token });

  await rtmClient.addOrUpdateLocalUserAttributes({ name: displayName });
  channel = rtmClient.createChannel(roomId);
  await channel.join();

  channel.on("MemberJoined", hadleMemberJoined);
  channel.on("MemberLeft", handleMemberLeft);
  channel.on("ChannelMessage", handleChannelMessage);

  getMembers();
  addBotMessageToDom(`welcome to the room ${displayName}  👋`);
  // client.on("MessageFromPeer", handleMessageFromPeer);
};

let handleChannelMessage = async (messageData, MemberId) => {
  console.log("A new Message was recieved");

  let data = JSON.parse(messageData.text);
  console.log("Message :", data);

  if (data.type === "chat") {
    addMessageToDom(data.displayName, data.message);
  }

  if (data.type === "user_left") {
    document.getElementById(`user-container-${data.uid}`).remove();
  }
};

let addMessageToDom = (name, message, from = false) => {
  let messagesWrapper = document.getElementById("messages");

  // Apply 'message__right' class if 'from' is true
  let alignmentClass = from ? "message__right" : "";

  let currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  let newMessage = `<div class="message__wrapper ${alignmentClass}">
                      <div class="message__body">
                          <strong class="message__author">${name}</strong>
                          <p class="message__text">${message}</p>
                                                    <span class="message__time">${currentTime}</span> 

                      </div>
                  </div>`;

  messagesWrapper.insertAdjacentHTML("beforeend", newMessage);

  let lastMessage = document.querySelector(
    "#messages .message__wrapper:last-child"
  );
  if (lastMessage) {
    lastMessage.scrollIntoView();
  }
};

let addBotMessageToDom = (message) => {
  let messagesWrapper = document.getElementById("messages");

  // Apply 'message__right' class if 'from' is true

  let currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  let botIcon = '<i class="fas fa-robot message__bot-icon"></i>';

  let newMessage = `<div class="message__wrapper">
                      <div class="message__body_bot">
                         <strong class="message__author__bot">${botIcon} meeting bot </strong>
                         <span class="message__time_">${currentTime}</span> 
                          <p class="message__text">${message}                 
</p>

                      </div>
                  </div>`;

  messagesWrapper.insertAdjacentHTML("beforeend", newMessage);

  let lastMessage = document.querySelector(
    "#messages .message__wrapper:last-child"
  );
  if (lastMessage) {
    lastMessage.scrollIntoView();
  }
};

let handleMemberLeft = async (MemberId) => {
  removeMemberFromDom(MemberId);
  let member = await channel.getMembers();
  updateMemberTotal(member);

  let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ["name"]);
  addBotMessageToDom(`Welcome to the room ${name}! 👋`);
};

let removeMemberFromDom = async (MemberId) => {
  let membersWrapper = document.getElementById(`member__${MemberId}__wrapper`);
  let name =
    membersWrapper.getElementsByClassName("member_name")[0].textContent;
  addBotMessageToDom(`${name} has left the room.`);
  membersWrapper.remove();
};

let getMembers = async () => {
  let members = await channel.getMembers();
  updateMemberTotal(members);
  for (let i = 0; i < members.length; i++) {
    addMemberToDom(members[i]);
  }
};
let leaveChannel = async () => {
  await channel.leave();
  await rtmClient.logout();
};

window.addEventListener("beforeunload", leaveChannel);

let sendMessage = async (e) => {
  e.preventDefault();

  let message = e.target.message.value;
  channel.sendMessage({
    text: JSON.stringify({
      type: "chat",
      message: message,
      displayName: displayName,
    }),
  });
  addMessageToDom("you", message, true);
  e.target.reset();
};
let messageForm = document.getElementById("message__form");
messageForm.addEventListener("submit", sendMessage);

let hadleMemberJoined = async (MemberId) => {
  console.log("A new member has joined the room :", MemberId);

  let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ["name"]);

  addMemberToDom(MemberId);
  let member = await channel.getMembers();
  addBotMessageToDom(`new user  ${name} join the room `);
  updateMemberTotal(member);
};

let addMemberToDom = async (MemberId) => {
  console.log("addtodom");

  let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ["name"]);

  let membersWrapper = document.getElementById("member__list");
  let memberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
  <span class="green__icon"></span>
  <p class="member_name">${name}</p>
</div>`;

  membersWrapper.insertAdjacentHTML("beforeend", memberItem);
};

let updateMemberTotal = async (members) => {
  let total = document.getElementById("members__count");
  total.innerText = members.length;
};

let joinRoomInit = async (uid) => {
  console.log("room");

  let rtcToken = await fetchToken(uid, roomId);
  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  await client.join(APP_ID, roomId, rtcToken, uid);

  client.on("user-published", hadleUserPublished);
  client.on("user-left", handleUserLeft);
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks(
    {},
    {
      encoderConfig: {
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080, max: 1080 },
      },
    }
  );
  //
};

let leaveStream = async (e) => {
  e.preventDefault();

  document.getElementById("join-btn").style.display = "block";
  document.getElementById("leave-btn").style.display = "none";

  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  await client.unpublish([localTracks[0], localTracks[1]]);

  if (localScreenTracks) {
    await client.unpublish([localScreenTracks]);
  }

  document.getElementById(`user-container-${uid}`).remove();

  if (userIdInDisplayFrame === `user-container-${uid}`) {
    displayFrame.style.display = null;

    for (let i = 0; videoFrames.length > i; i++) {
      videoFrames[i].style.height = "300px";
      videoFrames[i].style.width = "300px";
    }
  }

  channel.sendMessage({
    text: JSON.stringify({ type: "user_left", uid: uid }),
  });

  leaveChannel();

  let membersWrapper = document.getElementById("member__list");
  membersWrapper.innerHTML = "";
  let total = document.getElementById("members__count");
  total.innerText = 0;
};

let joinStream = async () => {
  init();
  document.getElementById("join-btn").style.display = "none";
  document.getElementById("leave-btn").style.display = "block";

  let player = `<div class="video__container" id="user-container-${uid}">
  <div class="video-player" id="user-${uid}"></div>
</div>`;

  document
    .getElementById("streams__container")
    .insertAdjacentHTML("beforeend", player);

  document
    .getElementById(`user-container-${uid}`)
    .addEventListener("click", expandVideoFrame);
  localTracks[1].play(`user-${uid}`);

  await client.publish([localTracks[0], localTracks[1]]);
};

let hadleUserPublished = async (user, mediaType) => {
  console.log("join the publish");
  remoteUsers[user.uid] = user;

  await client.subscribe(user, mediaType);

  let player = document.getElementById(`user-container-${user.uid}`);
  if (player === null) {
    player = `<div class="video__container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
            </div>`;

    document
      .getElementById("streams__container")
      .insertAdjacentHTML("beforeend", player);
    document
      .getElementById(`user-container-${user.uid}`)
      .addEventListener("click", expandVideoFrame);
  }

  if (displayFrame.style.display) {
    let videoFrames = document.getElementById(`user-conatainer-${user.uid}`);
    player.style.height = "100px";
    player.style.width = "100px";
  }
  if (mediaType === "video") {
    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play(`user-${user.uid}`);
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.id];
  let item = document.getElementById(`user-container-${user.id}`);

  if (item) {
    item.remove();
  }

  if (userIdInDisplayFrame === user.id) {
    displayFrame.style.display = null;

    let videoFrames = document.getElementById("video__container");

    for (let i = 0; videoFrames.length > i; i++) {
      videoFrames[i].style.height = "300px";
      videoFrames[i].style.width = "300px";
    }
  }
};

let toggleCamera = async (e) => {
  console.log("camera");

  let button = e.currentTarget;
  console.log("Toggle camera called. Muted:", localTracks[1]?.muted);

  if (localTracks[1]) {
    if (localTracks[1].muted) {
      console.log("Unmuting camera...");
      await localTracks[1].setMuted(false);
      button.classList.add("active");
    } else {
      console.log("Muting camera...");
      await localTracks[1].setMuted(true);
      button.classList.remove("active");
    }
    console.log("Camera status changed. Now muted:", localTracks[1].muted);
  } else {
    console.error("Camera track not found.");
  }
};

let toggleMic = async (e) => {
  console.log("mic");
  let button = e.currentTarget;
  console.log("mic");
  if (localTracks[0]) {
    if (localTracks[1].muted) {
      await localTracks[0].setMuted(false);
      button.classList.add("active");
    } else {
      await localTracks[0].setMuted(true);
      button.classList.remove("active");
    }
  } else {
    console.error("audio track not found.");
  }
};

let toggleScreen = async (e) => {
  let screenButton = e.currentTarget;
  let cameraButton = document.getElementById("camera-btn");

  if (!sharingScreen) {
    console.log("screen");

    sharingScreen = true;
    screenButton.classList.add("active");
    cameraButton.classList.remove("active");
    cameraButton.style.display = "none";

    localScreenTracks = await AgoraRTC.createScreenVideoTrack();

    document.getElementById(`user-container-${uid}`).remove();
    displayFrame.style.display = "block";

    let player = `<div class="video__container" id="user-container-${uid}">
    <div class="video-player" id="user-${uid}"></div>
  </div>`;

    displayFrame.insertAdjacentHTML("beforeend", player);

    document
      .getElementById(`user-container-${uid}`)
      .addEventListener("click", expandVideoFrame);

    userIdInDisplayFrame = `user-container-${uid}`;

    localScreenTracks.play(`user-${uid}`);

    await client.unpublish([localTracks[1]]);
    await client.publish([localScreenTracks]);

    let videoFrames = document.getElementsByClassName("video__container");

    console.log("screen");
    for (let i = 0; videoFrames.length > i; i++) {
      if (videoFrames[i].id != userIdInDisplayFrame) {
        videoFrames[i].style.height = "100px";
        videoFrames[i].style.width = "100px";
      }
    }
  } else {
    sharingScreen = false;
    cameraButton.style.display = "block";

    document.getElementById(`user-container-${uid}`).remove();

    await client.unpublish([localScreenTracks]);

    switchToCamera();
  }
};

let switchToCamera = async () => {
  let player = `<div class="video__container" id="user-container-${uid}">
    <div class="video-player" id="user-${uid}"></div>
  </div>`;

  displayFrame.insertAdjacentHTML("beforeend", player);

  await localTracks[0].setMuted(true);
  await localTracks[1].setMuted(true);

  document.getElementById("mic-btn").classList.remove("active");
  document.getElementById("screen-btn").classList.remove("active");

  localTracks[1].play(`user-${uid}`);

  await client.publish([localTracks[1]]);
};

// await client.publish([localTracks[1]]);
// localTracks[1].play(`user-${id}`);

document.getElementById("camera-btn").addEventListener("click", toggleCamera);

document.getElementById("mic-btn").addEventListener("click", toggleMic);

document.getElementById("screen-btn").addEventListener("click", toggleScreen);

document.getElementById("join-btn").addEventListener("click", joinStream);

document.getElementById("leave-btn").addEventListener("click", leaveStream);

joinRoomInit(uid);
