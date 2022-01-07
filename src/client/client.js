let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

var HOST = location.origin.replace(/^http/, 'ws')
const ws = new WebSocket(HOST);
ws.binaryType = "arraybuffer"

var players = {};

var renderPosX = canvas.width/2;
var renderPosY = canvas.height/2;

let selfId = "";

let menu = document.querySelector(".menu");
let userButton = document.getElementById("userbutton");
let adminButton = document.getElementById("adminbutton");
let nameInput = document.getElementById("nameInput");
let callInput = document.getElementById("callInput");

let savedname = localStorage.getItem("carlineusername");// other sources might have taken the localstorage id name or username
if (savedname != undefined) {
  document.getElementById("nameInput").value = savedname;
}

const callsound = new Audio();
callsound.src = '/call.mp3';
callsound.loop = false;
callsound.volume = 1;

ws.addEventListener("message", function (data) {
    let message = msgpack.decode(new Uint8Array(data.data));
    if (message.pi) {
      for (let i in message.pi) {
        players[message.pi[i].id] = new Player(message.pi[i]);
      }
    }
    if (message.called) {
      for (let i in players) {
        if (players[i].id == selfId) {
          players[i].called = true;
        }
      }
    }
    if (message.si) {
      Resize();
      requestAnimationFrame(renderGame);
      selfId = message.si;
    }
    requestAnimationFrame(renderGame);
});

let called = false;
function renderGame() {
  //bg
  ctx.fillStyle = "#BFBFBF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i in players) {
    if (players[i].id == selfId) {
      ctx.textAlign = "center";
      ctx.fillStyle = '#808080';
      ctx.font = ctx.font.replace(/\d+px/, "42px");
      ctx.beginPath();
      ctx.fontSize = 42;
      if(players[i].type != 'admin'){
        if(players[i].called){
          if(!called){
            callsound.play();
            called = true;
          }
          ctx.fillText("You were called!", canvas.width/2, canvas.height/2);
        } else {
          ctx.fillText("You haven't been called ... sit tight!", canvas.width/2, canvas.height/2);
        }
      } else {
        canvas.style.display = "none";
      }
    }
  }
}

userButton.onclick = () => {
  ws.send(msgpack.encode({ begin: true, type: 'user', name: nameInput.value }))
  localStorage.setItem("carlineusername", document.getElementById("nameInput").value);
  userButton.style.display = "none";
  adminButton.style.display = "none";
  menu.style.display = "none";
}

adminButton.onclick = () => {
  ws.send(msgpack.encode({ begin: true, type: 'admin', name: nameInput.value }))
  localStorage.setItem("carlineusername", document.getElementById("nameInput").value);
  userButton.style.display = "none";
  adminButton.style.display = "none";
  menu.style.display = "none";
  callInput.style.display = "";
}

function Init() {
  //menu.style.display = 'none';
  
}

function Resize() {
  let scale = window.innerWidth / canvas.width;
  if (window.innerHeight / canvas.height < window.innerWidth / canvas.width) {
    scale = window.innerHeight / canvas.height;
  }
  canvas.style.transform = "scale(" + scale + ")";
  canvas.style.left = 1 / 2 * (window.innerWidth - canvas.width) + "px";
  canvas.style.top = 1 / 2 * (window.innerHeight - canvas.height) + "px";
}
Resize();

window.addEventListener('resize', function () {
  Resize();
});

// calling others with admin
document.onkeydown = function (e) {
  if (e.keyCode == 13 && !e.repeat) {
    // if we press enter and are not focused on another input, focus on this one
    if (document.activeElement.nodeName.toLowerCase() != "input") {
      document.getElementById("callInput").focus();
    }
    else {
      let message = document.getElementById("callInput").value;
      if (message.length > 0) {
        ws.send(msgpack.encode({ call: message }));
      }
      document.getElementById("callInput").value = "";
    }
  }
}