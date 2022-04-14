let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

var HOST = location.origin.replace(/^http/, 'ws')
const ws = new WebSocket(HOST);
ws.binaryType = "arraybuffer"

var players = {};

let selfId = "";
let menu = document.querySelector(".menu");
let userButton = document.getElementById("userbutton");
let adminButton = document.getElementById("adminbutton");
let modButton = document.getElementById("modbutton");
let sniperButton = document.getElementById("sniperbutton");
let sniperDiv = document.getElementById("sniper");
let nameInput = document.getElementById("nameInput");
let callInput = document.getElementById("callInput");
let moderatorDiv = document.getElementById("moderator");
let dismissText = document.getElementById("dismisstext");
//let dismissButton = document.getElementById("dismissButton");

let savedname = localStorage.getItem("carlineusername");// other sources might have taken the localstorage id name or username
if (savedname != undefined) {
  document.getElementById("nameInput").value = savedname;
}

const callsound = new Audio();
callsound.src = '/call.mp3';
callsound.loop = false;
callsound.volume = 1;

document.addEventListener('visibilitychange', function() {
	if(document.hidden){
    ws.send(msgpack.encode({ offTask: selfId }));
    alert('please stay on tab :(');
  }
});

ws.addEventListener("message", function (data) {
    let message = msgpack.decode(new Uint8Array(data.data));
    if (message.pi) {
      for (let i in message.pi) {
        players[message.pi[i].id] = new Player(message.pi[i]);
      }
    }
    if (message.l) {
      delete players[message.l];
    }
    if (message.called) {
      for(let i in players){
        if(players[i].name == message.name){
          if(message.type == 'moderator' && players[o].called != 'dismissed'){
            players[i].called = 'dismissed';
          } else if(message.type == 'admin' && players[i].called != true){
            players[i].called = true;
          }
        }
      }
    }
    if (message.late) {
      if(players[message.late]){
        players[message.late].late = true;
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
let dismissed = false;
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
      if(players[i].type != 'admin' && players[i].type != 'moderator' && players[i].type != 'sniper'){
        if(players[i].called == 'dismissed'){
          if(!dismissed){
            callsound.play();// seperate sound effect?
            dismissed = true;
          }
          ctx.fillText("You are dismissed! Feel free to close this tab.", canvas.width/2, canvas.height/2);
        } else if(players[i].called){
          if(!called){
            callsound.play();
            called = true;
          }
          if(players[i].late == true){
            ctx.fillText("You are late! Please report to a moderator immediately.", canvas.width/2, canvas.height/2);
          } else {
            ctx.fillText("You were called!", canvas.width/2, canvas.height/2);
          }
        } else {
          ctx.fillText("You haven't been called ... sit tight!", canvas.width/2, canvas.height/2);
        }
      } else if(players[i].type == 'admin') {
        let pdisplay = '';
        for(let j in players){
          if(players[j].name != 'Admin' && players[j].name != 'Moderator' && players[j].name != 'Mod2' && players[j].called != true && players[j].called != 'dismissed'){
            pdisplay = pdisplay + players[j].name + ', ';
          }
        }
        dismissText.innerHTML = "Available Students: " + pdisplay;
      } else if(players[i].type == 'moderator'){
        let pdisplay = '';
        for(let j in players){
          if(players[j].name != 'Admin' && players[j].name != 'Moderator' && players[j].name != 'Mod2' && players[j].called == true){
            pdisplay = pdisplay + players[j].name + ', ';
          }
        }
        dismissText.innerHTML = "Called Students: " + pdisplay;
        //ctx.fillText(, canvas.width/2, canvas.height/2, canvas.width-20);
      } else if(players[i].type == 'sniper'){
        let pdisplay = '';
        for(let j in players){
          if(players[j].late && players[j].type != 'admin' && players[j].type != 'moderator' && players[j].type != 'sniper'){
            pdisplay = pdisplay + players[j].name + ', ';
          }
        }
        ctx.fillText("Late Students: " + pdisplay, canvas.width/2, canvas.height/2);
      }
    }
  }
}

userButton.onclick = () => {
  ws.send(msgpack.encode({ begin: true, type: 'user', name: nameInput.value }))
  localStorage.setItem("carlineusername", document.getElementById("nameInput").value);
  userButton.style.display = "none";
  adminButton.style.display = "none";
  modButton.style.display = "none";
  sniperButton.style.display = "none";
  menu.style.display = "none";
}

adminButton.onclick = () => {
  if(nameInput.value == 'Admin'){// we can update the password when we get an email from staff
    ws.send(msgpack.encode({ begin: true, type: 'admin', name: nameInput.value }))
    localStorage.setItem("carlineusername", document.getElementById("nameInput").value);
    userButton.style.display = "none";
    adminButton.style.display = "none";
    modButton.style.display = "none";
    sniperButton.style.display = "none";
    menu.style.display = "none";
    callInput.style.display = "";
    moderatorDiv.style.display = "";
  }
}

modButton.onclick = () => {
  if(nameInput.value == 'Moderator'){
    ws.send(msgpack.encode({ begin: true, type: 'moderator', name: nameInput.value }))
    localStorage.setItem("carlineusername", document.getElementById("nameInput").value);
    userButton.style.display = "none";
    modButton.style.display = "none";
    sniperButton.style.display = "none";
    adminButton.style.display = "none";
    menu.style.display = "none";
    callInput.style.display = "";
    moderatorDiv.style.display = "";
  }
}

sniperButton.onclick = () => {
  if(nameInput.value == 'Mod2'){
    ws.send(msgpack.encode({ begin: true, type: 'sniper', name: nameInput.value }))
    localStorage.setItem("carlineusername", document.getElementById("nameInput").value);
    userButton.style.display = "none";
    modButton.style.display = "none";
    sniperButton.style.display = "none";
    adminButton.style.display = "none";
    menu.style.display = "none";
    callInput.style.display = "none";
    moderatorDiv.style.display = "none";
    sniperDiv.style.display = "";
    //lateText.style.display = "none"; to do: make lateText render with html instead of on canvas (bc its better resolution)
    //canvas.style.display = "none";
  }
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
        let type = null;
        for (let i in players) {
          if (players[i].id == selfId) {
            type = players[i].type;
          }
        }
        ws.send(msgpack.encode({ call: message, type: type }));
      }
      document.getElementById("callInput").value = "";
    }
  }
}