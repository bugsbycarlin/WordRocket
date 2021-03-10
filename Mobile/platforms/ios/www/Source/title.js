

Game.prototype.initializeTitleScreen = function() {  
  var self = this;

  let size = 80;
  for (var i = 0; i < "WORD ROCKETS".length; i++) {
    let letter = "WORD ROCKETS"[i];
    if (i < 4) {
      let x = this.width * 1/2 - 8 * size/2 + i * size;
      let y = this.height * 1/4 - 1.5*size + size/4 * i;
      this.makeParachute(this.scenes["title"], x, y - size, 0.5, 0.5);
      this.makeTile(this.scenes["title"], x, y, letter, size, size, size, 0xEFEFEF, "", function(){});
    } else if (i > 4) {
      let x = this.width * 1/2 - 14 * size/2 + i * size;
      let y = this.height * 1/4 - 0.5*size + size/4 * i;
      // let fire = this.makeFire(this.scenes["title"], x, y + size * 0.8, 0.4, -0.3);
      this.makeTile(this.scenes["title"], x, y, letter, size, size, size, 0xEFEFEF, "", function(){});
    }
  }

  var single_player_test = new PIXI.Text("[SINGLE PLAYER TEST]", {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 10, align: "center"});
  single_player_test.position.set(this.width * 1/2, this.height * 5/8);
  single_player_test.anchor.set(0.5,0.5);
  this.scenes["title"].addChild(single_player_test);

  this.makeButton(
    this.scenes["title"],
    this.width * 1/2, this.height * 12/16,
    "TUTORIAL", 44, 6, 0x000000,
    224, 80, 0x71d07d,
    function() {
      self.tutorial = true;
      self.singlePlayerGame();
    }
  );

  this.makeButton(
    this.scenes["title"],
    this.width * 1/2, this.height * 14/16,
    "PLAY", 44, 6, 0xFFFFFF,
    224, 80, 0xdb5858,
    function() {
      self.tutorial = false;
      self.singlePlayerGame();
    }
  );
}