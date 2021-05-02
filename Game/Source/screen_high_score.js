
Game.prototype.initializeHighScore = function(new_score) {
  let self = this;
  let screen = this.screens["high_score"];
  this.clearScreen(screen);

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x000000;
  screen.addChild(background);

  this.new_high_score = new_score;

  this.high_score_state = "entry";

  this.high_score_palette = this.makeKeyboard({
    player: 1,
    parent: screen, x: this.width / 2, y: this.height * 5/6,
    defense: null, 
    action: function(letter) {

      if (self.high_score_state == "entry") {
        if (letter_array.includes(letter)) {
          self.highScoreKey(letter);
        }

        if (letter === "Backspace") {
          self.highScoreDelete();
        }
    
        if (letter === "Enter") {
          self.highScoreEnter();
        }
      }
    }
  });

  let score_text = new PIXI.Text(this.new_high_score + " POINTS", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  score_text.anchor.set(0.5,0.5);
  score_text.position.set(this.width / 2, this.height * 1/5);
  screen.addChild(score_text);

  this.high_score_name = [];
  this.high_score_name_cursor = 0;

  for (var i = 0; i < 6; i++) {
    var cursor = PIXI.Sprite.from(PIXI.Texture.WHITE);
    cursor.width = 70 - 3;
    cursor.height = 2;
    cursor.anchor.set(0, 0.5);
    cursor.position.set(this.width / 2 + 70 * (i - 3), this.height * 8/16);
    cursor.tint = 0x3cb0f3;
    cursor.alpha = (12 - i) / (12 + 4);
    screen.addChild(cursor);

    let letter = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 60, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
    letter.anchor.set(0.5, 0.5);
    letter.position.set(this.width / 2 + 70 * (i - 3) + 35, this.height * 8/16 - 40);
    screen.addChild(letter);
    this.high_score_name.push(letter);
  }
}



