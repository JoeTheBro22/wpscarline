class Player{
  constructor(initPack){
    this.id = initPack.id;
    this.type = initPack.type;
    this.name = initPack.name;
    this.called = initPack.called;
    this.playerUpdatePack = [];
    this.late = false;
  }
}