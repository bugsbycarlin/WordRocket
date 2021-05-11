

Game.prototype.initializeTitle = function() {  
  var self = this;
  let screen = this.screens["title"];

  let blue_bg = PIXI.Sprite.from(PIXI.Texture.WHITE);
  blue_bg.width = 1280;
  blue_bg.height = 960;
  blue_bg.tint = 0x313b87;
  screen.addChild(blue_bg);

  // ! flags
  let right_flag = new PIXI.Sprite(PIXI.Texture.from("Art/Title/flag_soviet.png"));
  right_flag.anchor.set(0.5,0.5);
  right_flag.scale.set(3,3);
  right_flag.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  right_flag.position.set(790, this.height - 710);
  screen.addChild(right_flag);

  let left_flag = new PIXI.Sprite(PIXI.Texture.from("Art/Title/flag_american.png"));
  left_flag.anchor.set(0.5,0.5);
  left_flag.scale.set(-3,3);
  left_flag.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  left_flag.position.set(485, this.height - 710);
  screen.addChild(left_flag);

  // ! brandenburg
  let brandenburg = new PIXI.Sprite(PIXI.Texture.from("Art/Title/brandenburg.png"));
  brandenburg.tint = 0x212b67;
  brandenburg.scale.set(6,6);
  brandenburg.anchor.set(0.5,0.5);
  brandenburg.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  brandenburg.position.set(this.width / 2, this.height - 520);
  screen.addChild(brandenburg);

  // ! wall
  // pure color
  // let wall = PIXI.Sprite.from(PIXI.Texture.WHITE);
  // wall.width = 1280;
  // wall.height = 150;
  // wall.position.set(0,650);
  // wall.tint = 0x2c3674;
  // screen.addChild(wall);
  // texture
  // let wall = new PIXI.Sprite(PIXI.Texture.from("Art/Title/wall_texture_pixelated.png"));
  // wall.position.set(0, 650);
  // wall.scale.set(1,0.70);
  // wall.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // screen.addChild(wall);

  // ! players
  let right_player = new PIXI.Sprite(PIXI.Texture.from("Art/Title/player.png"));
  right_player.tint = 0x111b57;
  right_player.scale.set(4,4);
  right_player.anchor.set(0.5,0.5);
  right_player.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  right_player.position.set(this.width / 2 + 314, this.height - 192);
  screen.addChild(right_player);

  let left_player = new PIXI.Sprite(PIXI.Texture.from("Art/Title/player.png"));
  left_player.tint = 0x111b57;
  left_player.scale.set(-4,4);
  left_player.anchor.set(0.5,0.5);
  left_player.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  left_player.position.set(this.width / 2 - 314, this.height - 192);
  screen.addChild(left_player);

  // ! word
  let title_word = new PIXI.Sprite(PIXI.Texture.from("Art/Title/title_word.png"));
  title_word.anchor.set(0,0);
  title_word.position.set(320, 208);
  screen.addChild(title_word);

  // ! rockets
  for (var i = 0; i < 7; i++) {
    let x = 546 + 64 * i;
    let y = 498;
    let fire = this.makeFire(screen, x - 2, y + 43, 0.32*1.25, 0.24*1.25);
    fire.animationSpeed = 0.2;
  }
  let title_rockets = new PIXI.Sprite(PIXI.Texture.from("Art/Title/title_rockets.png"));
  title_rockets.anchor.set(0,0);
  title_rockets.position.set(512, 336);
  screen.addChild(title_rockets);

  // ! buttons
  let tutorial_button = new PIXI.Text("TUTORIAL", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
  tutorial_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  tutorial_button.anchor.set(0.5,0.5);
  tutorial_button.position.set(this.width / 2, this.height - 320);
  screen.addChild(tutorial_button);
  tutorial_button.interactive = true;
  tutorial_button.buttonMode = true;
  tutorial_button.on("pointerdown", function() {
    self.tutorial = true;
    self.difficulty_level = "EASY";
    if (self.network.uid == null) {
      self.network.anonymousSignIn(function() {});
    }
    self.initialize1pGame();
    self.blendHighScores(function() {});
    self.switchScreens("title", "1p_game");
  });

  let new_game_button = new PIXI.Text("NEW GAME", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
  new_game_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  new_game_button.anchor.set(0.5,0.5);
  new_game_button.position.set(this.width / 2, this.height - 280);
  screen.addChild(new_game_button);
  new_game_button.interactive = true;
  new_game_button.buttonMode = true;
  new_game_button.on("pointerdown", function() {
    self.tutorial = false;
    if (self.network.uid == null) {
      self.network.anonymousSignIn(function() {});
    }
    self.initialize1pLobby();
    self.blendHighScores(self.updateHighScoreDisplay());
    self.switchScreens("title", "1p_lobby");
    // self.initializeCutscene();
    // self.switchScreens("title", "cutscene");
  });

  let multi_button = new PIXI.Text("INTERNET", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
  multi_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  multi_button.anchor.set(0.5,0.5);
  multi_button.position.set(this.width / 2, this.height - 240);
  screen.addChild(multi_button);
  multi_button.interactive = true;
  multi_button.buttonMode = true;
  multi_button.on("pointerdown", function() {
    // TO DO: multiplayer
    self.blendHighScores(function() {});
    self.initializeHighScore(10300);
    self.switchScreens("title", "high_score");
  });

  // ! black bars
  let top_bar = PIXI.Sprite.from(PIXI.Texture.WHITE);
  top_bar.width = 1280;
  top_bar.height = 80;
  top_bar.tint = 0x000000;
  screen.addChild(top_bar);

  let bottom_bar = PIXI.Sprite.from(PIXI.Texture.WHITE);
  bottom_bar.width = 1280;
  bottom_bar.height = 80;
  bottom_bar.position.set(0,880);
  bottom_bar.tint = 0x000000;
  screen.addChild(bottom_bar);

  // all settings.
  // music on/off, sound on/off, keyboard layout, credits, sign in/out
  let gear_button = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/gear_button.png"));
  gear_button.tint = 0x404040;
  gear_button.position.set(15, this.height - 65);
  gear_button.scale.set(0.5, 0.5);
  screen.addChild(gear_button);

  let settings = false;

  let left_side = -750;

  let settings_panel = new PIXI.Container();
  settings_panel.position.set(left_side, this.height - 65);
  screen.addChild(settings_panel);

  let settings_mask = new PIXI.Graphics();
  settings_mask.beginFill(0x000000);
  settings_mask.drawRect(70, this.height - 200, -1 * left_side, this.height);
  settings_mask.endFill();
  settings_panel.mask = settings_mask;

  gear_button.interactive = true;
  gear_button.buttonMode = true;
  gear_button.on("pointerdown", function() {
    if (settings == false) {
      settings = true;
      var tween = new TWEEN.Tween(settings_panel.position)
        .to({x: 80})
        .duration(300)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    } else {
      settings = false;
      var tween = new TWEEN.Tween(settings_panel.position)
        .to({x: left_side})
        .duration(300)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    }
  });

  let music_button_container = new PIXI.Container();
  music_button_container.position.set(0, 0);
  music_button_container.scale.set(0.5, 0.5);
  settings_panel.addChild(music_button_container);

  let music_button = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/music_button.png"));
  music_button.tint = 0x404040;
  music_button_container.addChild(music_button);

  let music_button_no_bar = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/no_bar.png"));
  music_button_no_bar.tint = 0x404040;
  music_button_no_bar.visible = !use_music;
  music_button_container.addChild(music_button_no_bar);

  music_button.interactive = true;
  music_button.buttonMode = true;
  music_button.on("pointerdown", function() {
    use_music = !use_music;
    music_button_no_bar.visible = !use_music;
  });


  let sound_button_container = new PIXI.Container();
  sound_button_container.position.set(50, 0);
  sound_button_container.scale.set(0.5, 0.5);
  settings_panel.addChild(sound_button_container);

  let sound_button = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/sound_button.png"));
  sound_button.tint = 0x404040;
  sound_button_container.addChild(sound_button);

  let sound_button_no_bar = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/no_bar.png"));
  sound_button_no_bar.tint = 0x404040;
  sound_button_no_bar.visible = !use_sound;
  sound_button_container.addChild(sound_button_no_bar);

  sound_button.interactive = true;
  sound_button.buttonMode = true;
  sound_button.on("pointerdown", function() {
    use_sound = !use_sound;
    sound_button_no_bar.visible = !use_sound;
  });

  let bar_one = PIXI.Sprite.from(PIXI.Texture.WHITE);
  bar_one.width = 1;
  bar_one.height = 50;
  bar_one.position.set(104,0);
  bar_one.tint = 0x404040;
  settings_panel.addChild(bar_one);

  let keyboard_button_container = new PIXI.Container();
  keyboard_button_container.position.set(122, 0);
  settings_panel.addChild(keyboard_button_container);

  let keyboard_icon = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/keyboard_icon.png"));
  keyboard_icon.scale.set(0.5, 0.5);
  keyboard_icon.anchor.set(0, 0);
  keyboard_icon.tint = 0x404040;
  keyboard_button_container.addChild(keyboard_icon);

  let keyboard_button_text = new PIXI.Text(this.keyboard_mode, {fontFamily: "Press Start 2P", fontSize: 18, fill: 0x404040, letterSpacing: 2, align: "center"});
  keyboard_button_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
  keyboard_button_text.anchor.set(0.0,0);
  keyboard_button_text.position.set(100, 15);
  keyboard_button_container.addChild(keyboard_button_text);

  keyboard_button_container.interactive = true;
  keyboard_button_container.buttonMode = true;
  keyboard_button_container.on("pointerdown", function() {
    self.keyboard_mode = self.keyboard_mode == "QWERTY" ? "DVORAK" : "QWERTY";
    keyboard_button_text.text = self.keyboard_mode;
  });

  let bar_two = PIXI.Sprite.from(PIXI.Texture.WHITE);
  bar_two.width = 1;
  bar_two.height = 50;
  bar_two.position.set(360,0);
  bar_two.tint = 0x404040;
  settings_panel.addChild(bar_two);

  let credits_button = new PIXI.Text("CREDITS", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0x404040, letterSpacing: 2, align: "center"});
  credits_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  credits_button.anchor.set(0,0);
  credits_button.position.set(380, 15);
  settings_panel.addChild(credits_button);

  credits_button.interactive = true;
  credits_button.buttonMode = true;
  credits_button.on("pointerdown", function() {
    self.initializeCredits();
    self.switchScreens("title", "credits");
  });

  // sign-in is off to the right so it's always visible.
  let mu = firebase.auth().currentUser;
  if (mu != null && mu.uid != null) {
    this.auth_user = mu;
    this.network.uid = mu.uid;
  }

  this.sign_in_button = new PIXI.Text(this.auth_user == null ? "SIGN-IN" : "SIGN-OUT", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0x404040, letterSpacing: 2, align: "center"});
  this.sign_in_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.sign_in_button.anchor.set(0,0);
  this.sign_in_button.position.set(this.width - 180, this.height - 50);
  screen.addChild(this.sign_in_button);

  this.sign_in_button.interactive = true;
  this.sign_in_button.buttonMode = true;
  this.sign_in_button.on("pointerdown", function() {
    if (self.auth_user == null) {
      self.network.googleSignIn();
    } else {
      self.network.signOut();
    }
  });

}