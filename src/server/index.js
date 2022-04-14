const express = require('express');
const WebSocket = require('ws');
const uuid = require("uuid");
const path = require("path");
const msgpack = require("msgpack-lite");
const app = express();
const wss = new WebSocket.Server({ noServer: true });

app.use(express.static("src/client"));

let players = {};

const nano = function () {
	const hrtime = process.hrtime();
	return +hrtime[0] * 1e9 + +hrtime[1];
};
const ms = () => nano() * (1 / 1e9) * 1000;

app.get("/", function (req, res) {
	res.sendFile("index.html");
});
let id = 1;

const { Player } = require("./player");

wss.on("connection", ws => {
	ws.binaryType = "arraybuffer"

	//Setting clientId to id
	const clientId = id;
  
	//Updating id for next player join
    id++;
    if(id > 9999){
        id = 0;
    }

	//Create new player
	const player = new Player(clientId, ws);
	players[clientId] = player;

	players[clientId].client.send(msgpack.encode({ si: clientId }));

	ws.on('close', () => {
		//Send all clients the id of the player leaving
		for (let i of Object.keys(players)) {
			players[i].client.send(msgpack.encode({ l: clientId }))
		}

		//Delete player from players list
		delete players[clientId];
	})

	ws.on('message', data => {
		let d = msgpack.decode(new Uint8Array(data));
		
		if(d.begin) {
			player.type = d.type;
			player.name = d.name;
			// this point onward should be in begin
			let playerInitPack = [];
			//Get all player init pack and push to player init array
			for (let i of Object.keys(players)) {
				playerInitPack.push(players[i].getInitPack());
			}

			//Send player array to all players
			let newPlayerPack = [];
			newPlayerPack.push(players[clientId].getInitPack());

			for (let i of Object.keys(players)) {
				//player init
				if (players[i].id != clientId) {
					players[i].client.send(msgpack.encode({ pi: newPlayerPack }));
				}
			}

			players[clientId].client.send(msgpack.encode({ pi: playerInitPack }));
		}
		if (d.call) {
			for (let i of Object.keys(players)) {
				players[i].called = true;
				players[i].client.send(msgpack.encode({ called: true, type: d.type, name: d.call}));
			}
		}

		if(d.offTask){
			// todo: make offtask message asign things in database or display other info idk
		}
	})
})

//Connection to server:
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT);

server.on('upgrade', (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, socket => {
		wss.emit('connection', socket, request);
	});
});

let lastTime = Date.now();
let playerPack = [];

//Get all player init pack and push to player init array
for (let i of Object.keys(players)) {
	playerInitPack.push(players[i].getInitPack());
}

function mainLoop() {
	let time = Date.now();
	let delta = time - lastTime;
	lastTime = time;
	for(let i in players){
		players[i].update(delta);
		if(players[i].late){
			for(let j in players){
				players[j].client.send(msgpack.encode({ late: players[i].id}));
			}
		}
	}

	//Reset player pack array
	playerPack = [];
}

setInterval(() => {
	let time = ms();
	mainLoop();
	let timeTaken = ms() - time;
	if (timeTaken > 250) {
		console.log("An update took " + timeTaken + "ms");
	}
}, 1000 / 30);

console.log("App Available at localhost:" + PORT);