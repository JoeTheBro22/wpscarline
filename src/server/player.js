let canvas = { width: 1280, height: 720 };

class Player {
	constructor(id, client) {
        this.id = id;
        this.client = client;
        this.playerUpdatePack = [];
        this.type = '';
        this.name = '';
        this.called = false;
    }

    getInitPack() {
        let pack = {
            id: this.id,
            type: this.type,
            name: this.name,
            called: this.called,
        };
        return pack;
    }
}

module.exports = {
	Player
}