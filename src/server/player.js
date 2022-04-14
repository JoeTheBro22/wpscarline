class Player {
	constructor(id, client) {
        this.id = id;
        this.client = client;
        this.playerUpdatePack = [];
        this.type = '';
        this.name = '';
        this.called = false;
        this.timer = 0;
        this.late = false;
    }
    update(dt){
        if(this.called != false){
            this.timer += dt;
            if(this.timer > 300*1000){ // 300 = 5 minutes; tweak this if u think it's too long
                this.late = true;
            }
        }
    }
    getInitPack() {
        let pack = {
            id: this.id,
            type: this.type,
            name: this.name,
            called: this.called,
            late: this.late,
        };
        return pack;
    }
    exportPack() {
        let exportPack = {
            id: this.id,
            type: this.type,
            name: this.name,
            called: this.called,
            late: this.late,
        }
        return exportPack;
    }
}

module.exports = {
	Player
}