const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
const uservideo = new Map();
myVideo.muted = true;

backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

const user = prompt("Enter your name");
var currentPeer;
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

function create_meeting()
{
  location.href = "/room";
};
function leave_meeting()
{
  peer.destroy();
  location.href = "/";
};

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream,1);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream,1);
        currentPeer=call.peerConnection
      });
    });

    socket.on("user-connected", (userId,userName) => {
      messages.innerHTML =
      messages.innerHTML +
      `<div class="message">
          <b>
          <span> ${
             userName+" joined"
          }</span> </b>
      </div>`;
      connectToNewUser(userId, stream);
    });

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream,userId);
    currentPeer=call.peerConnection
  });
};
const disconnectToUser = (userId, stream) => {
  console.log(videoGrid)
  videoGrid.remove(uservideo.get(userId));
  console.log(videoGrid)
  
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream,userId) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
    uservideo.set(userId,video)
  });
  console.log(videoGrid)
};


let screenStream;
let isScreenShare=false;
let screenShare =document.getElementById("shareScreen");
screenShare.addEventListener('click', (e) => {
  console.log(isScreenShare);
  if(!isScreenShare)
  {
    html = `<i class="fas fa-desktop"></i>`;
    screenShare.innerHTML = html;
    screenShare.classList.toggle("background__red");
    navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor:"always"
      },
      audio: true
    }).then((stream) => {
      screenStream=stream;
      let videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = function () {
        stopScreenShare();
      }
      let sender = currentPeer.getSenders().find(function (s) {
        return s.track.kind == videoTrack.kind;
      })
      sender.replaceTrack(videoTrack);
      isScreenShare=true;
    }).catch((err) => {
      console.log("unable to get display media"+err)
    })
  }
  else
  {
    html = `<i class="fas fa-desktop"></i>`;
    screenShare.innerHTML = html;
    screenShare.classList.toggle("background__red");
    screenStream.getVideoTracks().forEach(track => track.stop());    
    let videoTrack = myVideoStream.getVideoTracks()[0];
    var sender = currentPeer.getSenders().find(function (s) {
      return s.track.kind == videoTrack.kind;
    })
    sender.replaceTrack(videoTrack)
    isScreenShare=false;
  }
})

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

let leavecall
text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});
function stopScreenShare() {
  let videoTrack = myVideoStream.getVideoTracks()[0];
  html = `<i class="fas fa-desktop"></i>`;
  screenShare.innerHTML = html;
  screenShare.classList.toggle("background__red");
  var sender = currentPeer.getSenders().find(function (s) {
    return s.track.kind == videoTrack.kind;
  })
  sender.replaceTrack(videoTrack)
}


stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});

