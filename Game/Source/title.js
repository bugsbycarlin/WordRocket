

Game.prototype.initializeTitleScreen = function() {  
  var self = this;

  let blue_bg = PIXI.Sprite.from(PIXI.Texture.WHITE);
  blue_bg.width = 1280;
  blue_bg.height = 960;
  blue_bg.tint = 0x313b87;
  this.scenes["title"].addChild(blue_bg);

  // ! flags
  let right_flag = new PIXI.Sprite(PIXI.Texture.from("Art/flag_soviet_first_draft_pixelated_v3.png"));
  right_flag.anchor.set(0.5,0.5);
  right_flag.scale.set(3,3);
  right_flag.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  right_flag.position.set(790, this.height - 710);
  this.scenes["title"].addChild(right_flag);

  let left_flag = new PIXI.Sprite(PIXI.Texture.from("Art/flag_american_first_draft_pixelated_v3.png"));
  left_flag.anchor.set(0.5,0.5);
  left_flag.scale.set(-3,3);
  left_flag.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  left_flag.position.set(485, this.height - 710);
  this.scenes["title"].addChild(left_flag);

  // ! brandenburg
  let brandenburg = new PIXI.Sprite(PIXI.Texture.from("Art/pixelated_bbg.png"));
  brandenburg.tint = 0x212b67;
  brandenburg.scale.set(6,6);
  brandenburg.anchor.set(0.5,0.5);
  brandenburg.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  brandenburg.position.set(this.width / 2, this.height - 520);
  this.scenes["title"].addChild(brandenburg);

  // ! players
  let right_player = new PIXI.Sprite(PIXI.Texture.from("Art/player_pixelated_v2.png"));
  right_player.tint = 0x111b57;
  right_player.scale.set(4,4);
  right_player.anchor.set(0.5,0.5);
  right_player.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  right_player.position.set(this.width / 2 + 314, this.height - 192);
  this.scenes["title"].addChild(right_player);

  let left_player = new PIXI.Sprite(PIXI.Texture.from("Art/player_pixelated_v2.png"));
  left_player.tint = 0x111b57;
  left_player.scale.set(-4,4);
  left_player.anchor.set(0.5,0.5);
  left_player.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  left_player.position.set(this.width / 2 - 314, this.height - 192);
  this.scenes["title"].addChild(left_player);

  // ! word
  let title_word = new PIXI.Sprite(PIXI.Texture.from("Art/title_word_v5.png"));
  title_word.anchor.set(0,0);
  title_word.position.set(320, 208);
  this.scenes["title"].addChild(title_word);

  // ! rockets
  for (var i = 0; i < 7; i++) {
    let x = 546 + 64 * i;
    let y = 498;
    let fire = this.makeFire(this.scenes["title"], x - 2, y + 43, 0.32*1.25, 0.24*1.25);
    fire.animationSpeed = 0.2;
  }
  let title_rockets = new PIXI.Sprite(PIXI.Texture.from("Art/title_rockets_v5.png"));
  title_rockets.anchor.set(0,0);
  title_rockets.position.set(512, 336);
  this.scenes["title"].addChild(title_rockets);

  // ! buttons
  let tutorial_button = new PIXI.Text("TUTORIAL", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
  tutorial_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  tutorial_button.anchor.set(0.5,0.5);
  tutorial_button.position.set(this.width / 2, this.height - 320);
  this.scenes["title"].addChild(tutorial_button);
  tutorial_button.interactive = true;
  tutorial_button.buttonMode = true;
  tutorial_button.on("pointerdown", function() {
    self.tutorial = true;
    self.difficulty_level = "EASY";
    self.initializeSinglePlayerScene();
    self.animateSceneSwitch("title", "game");
  });

  let new_game_button = new PIXI.Text("NEW GAME", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
  new_game_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  new_game_button.anchor.set(0.5,0.5);
  new_game_button.position.set(this.width / 2, this.height - 280);
  this.scenes["title"].addChild(new_game_button);
  new_game_button.interactive = true;
  new_game_button.buttonMode = true;
  new_game_button.on("pointerdown", function() {
    self.tutorial = false;
    self.initializeSetupSingleScene();
    self.animateSceneSwitch("title", "setup_single");
  });

  let multi_button = new PIXI.Text("INTERNET", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
  multi_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  multi_button.anchor.set(0.5,0.5);
  multi_button.position.set(this.width / 2, this.height - 240);
  this.scenes["title"].addChild(multi_button);
  multi_button.interactive = true;
  multi_button.buttonMode = true;
  multi_button.on("pointerdown", function() {
    // TO DO: multiplayer
  });

  // ! black bars
  let top_bar = PIXI.Sprite.from(PIXI.Texture.WHITE);
  top_bar.width = 1280;
  top_bar.height = 80;
  top_bar.tint = 0x000000;
  this.scenes["title"].addChild(top_bar);

  let bottom_bar = PIXI.Sprite.from(PIXI.Texture.WHITE);
  bottom_bar.width = 1280;
  bottom_bar.height = 80;
  bottom_bar.position.set(0,880);
  bottom_bar.tint = 0x000000;
  this.scenes["title"].addChild(bottom_bar);
}