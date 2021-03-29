

Game.prototype.initializeTitleScreen = function() {  
  var self = this;


  let blue_bg = PIXI.Sprite.from(PIXI.Texture.WHITE);
  blue_bg.width = 1280;
  blue_bg.height = 960;
  blue_bg.tint = 0x313b87;
  this.scenes["title"].addChild(blue_bg);

  let rock_wall = new PIXI.Container();
  this.scenes["title"].addChild(rock_wall);
  for (var m = 0; m < 20; m++) {
    for (var n = 0; n < 15; n++) {
      if (m < 4 || m > 15) {
        let tile = PIXI.Sprite.from(PIXI.Texture.WHITE);
        c = (30 + Math.floor(Math.random() * 30)) / 255.0;
        // c = (30 + 5 * (m + n) % 30) / 255.0;
        tile.tint = PIXI.utils.rgb2hex([c,c,c]);
        tile.width = 64;
        tile.height = 64;
        //shift = i == 0 ? 0 : (board_width + 4) * 32;
        tile.position.set(64 * m, 64 * n);
        rock_wall.addChild(tile);
      } else if (n == 14) {
        let tile = PIXI.Sprite.from(PIXI.Texture.WHITE);
        c = 70 / 255.0;
        tile.tint = PIXI.utils.rgb2hex([c,c,c]);
        tile.width = 64;
        tile.height = 64;
        tile.position.set(64 * m, 64 * n);
        rock_wall.addChild(tile);
      }
    }
  }
  rock_wall.cacheAsBitmap = true;


  let bbg = new PIXI.Sprite(PIXI.Texture.from("Art/pixelated_bbg.png"));
  bbg.tint = 0x212b67;
  bbg.scale.set(4,4);
  bbg.anchor.set(0.5,0.5);
  bbg.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  bbg.position.set(this.width / 2, this.height - 290);
  this.scenes["title"].addChild(bbg);

  let right_player = new PIXI.Sprite(PIXI.Texture.from("Art/player_pixelated_v2.png"));
  right_player.tint = 0x111b57;
  right_player.scale.set(4,4);
  right_player.anchor.set(0.5,0.5);
  right_player.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  right_player.position.set(this.width / 2 + 250, this.height - 130);
  this.scenes["title"].addChild(right_player);

  let left_player = new PIXI.Sprite(PIXI.Texture.from("Art/player_pixelated_v2.png"));
  left_player.tint = 0x111b57;
  left_player.scale.set(-4,4);
  left_player.anchor.set(0.5,0.5);
  left_player.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  left_player.position.set(this.width / 2 - 250, this.height - 130);
  this.scenes["title"].addChild(left_player);

  //let size = 80;
  // for (var i = 0; i < 4; i++) {
  //   let x = 240 + 80 * i + 40;
  //   let y = 80 + 40;
  //   //let parachute = this.makePixelatedParachute(this.scenes["title"], x, y - size, 2.5, 2.5);
  // }
  let title_word = new PIXI.Sprite(PIXI.Texture.from("Art/title_word_v5.png"));
  title_word.anchor.set(0,0);
  title_word.position.set(320 + 32, 80);
  this.scenes["title"].addChild(title_word);

  for (var i = 0; i < 7; i++) {
    let x = 512 + 64 * i - 2;
    let y = 370;
    //let fire = this.makePixelatedFire(this.scenes["title"], x, y + 64 * 0.8, 1.5, 1.2);
    let fire = this.makeFire(this.scenes["title"], x, y + 52, 0.35, -0.18);
    fire.animationSpeed = 0.35; 
  }
  let title_rockets = new PIXI.Sprite(PIXI.Texture.from("Art/title_rockets_v5.png"));
  title_rockets.anchor.set(0,0);
  title_rockets.position.set(512 - 32, 320 - 112);
  this.scenes["title"].addChild(title_rockets);


  let tutorial_button = new PIXI.Sprite(PIXI.Texture.from("Art/tutorial_button.png"));
  tutorial_button.anchor.set(0,0);
  tutorial_button.position.set(6 * 80, this.height - 4 * 80);
  this.scenes["title"].addChild(tutorial_button);
  tutorial_button.interactive = true;
  tutorial_button.buttonMode = true;
  tutorial_button.on("pointerdown", function() {
    self.tutorial = true;
    self.singlePlayerGame();
  });

  let new_game_button = new PIXI.Sprite(PIXI.Texture.from("Art/new_game_button.png"));
  new_game_button.anchor.set(0,0);
  new_game_button.position.set(6 * 80, this.height - 3 * 80);
  this.scenes["title"].addChild(new_game_button);
  new_game_button.interactive = true;
  new_game_button.buttonMode = true;
  new_game_button.on("pointerdown", function() {
    self.tutorial = false;
    self.singlePlayerGame();
  });

  // this.makeButton(
  //   this.scenes["title"],
  //   this.width * 1/2, this.height * 12/16,
  //   "TUTORIAL", 44, 6, 0x000000,
  //   224, 80, 0x71d07d,
  //   function() {
  //     self.tutorial = true;
  //     self.singlePlayerGame();
  //   }
  // );

  // this.makeButton(
  //   this.scenes["title"],
  //   this.width * 1/2, this.height * 14/16,
  //   "PLAY", 44, 6, 0xFFFFFF,
  //   224, 80, 0xdb5858,
  //   function() {
  //     self.tutorial = false;
  //     self.singlePlayerGame();
  //   }
  // );
}