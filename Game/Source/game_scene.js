

Game.prototype.initializeSinglePlayerScene = function() {
  this.level = 1;
  this.score = 0;

  this.reset();
}

Game.prototype.reset = function() {
  var self = this;
  var scene = this.scenes["game"];
  this.clearScene(scene);

  this.freefalling = [];
  this.pickers = [];
  this.played_words = {};

  this.rocket_letters = [];

  if (!this.tutorial) {
    this.pickDefense(6, 10);
  }

  if (this.device_type == "browser") {
    this.resetBoardBrowser();
  } else if (this.device_type == "iPad") {
    this.resetBoardiPad();
  } else if (this.device_type == "iPhone") {
    this.resetBoardiPhone();
  }

  if (this.tutorial) {
    this.tutorial1();
  } else {
    this.game_phase = "pre_game";

    setTimeout(function() {
      self.start_time = Date.now();
      self.game_phase = "countdown";
      if (annoying) self.soundEffect("countdown");
    }, 1200);
  }
}


Game.prototype.resetBoardBrowser = function() {
  var self = this;
  var scene = this.scenes["game"];

  var background = new PIXI.Sprite(PIXI.Texture.from("Art/background_fourth_draft_1280.png"));
  background.anchor.set(0, 0);
  scene.addChild(background);

  this.player_palette = this.makeKeyboard({
    parent: scene, x: 467, y: 807,
    defense: this.player_defense, 
    action: function(letter) {

      if (self.game_phase == "tutorial" && self.tutorial_number == 1) {
        self.tutorial_screen.tutorial_text.text = self.tutorial_1_snide_click_responses[Math.min(6, self.tutorial_1_snide_clicks)];
        self.tutorial_1_snide_clicks += 1
      }

      if (letter_array.includes(letter)) {
        self.keyAction(letter);
      }

      if (letter === "RShift") {
        self.rightShiftAction();
      }

      if (letter === "LShift") {
        self.leftShiftAction();
      }

      if (letter === "Escape") {
        self.clearAction();
      }

      if (letter === "Backspace") {
        self.deleteAction();
      }

      if (letter === "ArrowRight") {
        self.rightArrowAction();
      }

      if (letter === "ArrowLeft") {
        self.leftArrowAction();
      }

      if (letter === "Enter") {
        self.enterAction();
      }
    }
  });

  // this.player_palette = this.makeQwertyPalette({
  //   parent: scene,
  //   key_size: 35,
  //   key_margin: 6,
  //   x: this.width * 1/2 - 240, y: this.height - 158,
  //   add_special_keys: false,
  //   hide_mat: true,
  //   action: function(letter) {}
  // });

  // the enemy palette
  // this.enemy_palette = this.makeQwertyPalette({
  //   parent:scene,
  //   key_size: 20,
  //   key_margin: 2,
  //   x: this.width * 1/2 + 80, y: 396,
  //   add_special_keys: false,
  //   action: function(letter) {}
  // });
  this.enemy_palette = this.makeKeyboard({
    parent: scene, x: 1062.5, y: 472,
    defense: this.enemy_defense, 
    action: function(letter) {
    }
  });
  this.enemy_palette.scale.set(0.3125, 0.3125);

  // the player's board
  this.player_area = new PIXI.Container();
  scene.addChild(this.player_area);
  this.player_area.position.set(this.width * 1/2 - 370,520);
  this.player_area.scale.set(0.65,0.65);

  this.player_live_area = new PIXI.Container();
  scene.addChild(this.player_live_area);
  this.player_live_area.position.set(this.player_area.x, this.player_area.y);
  this.player_live_area.scale.set(this.player_area.scale.x, this.player_area.scale.y);

  var play_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  play_mat.width = 50 * board_width;
  play_mat.height = 700;
  play_mat.anchor.set(0, 1);
  play_mat.position.set(0, -50);
  let color_scale = Math.max(0,(1.0 - this.level/26));
  console.log(color_scale);
  play_mat.tint = 0x303889; //dark sky  // make this black for terrifying effect on a nasty level
  //play_mat.tint = PIXI.utils.rgb2hex([117 * color_scale/ 255, 211 * color_scale / 255, 254 * color_scale / 255]);
  this.player_area.addChild(play_mat);

  // the player's launchpad
  this.launchpad = new Launchpad(this, this.player_area, 1, 0, 0, 50, 48, false);

  // silly mouse buttons
  for (let i = 0; i < 3; i++) {
    let mouse_button = new PIXI.Sprite(PIXI.Texture.from("Art/mouse_button.png"));
    mouse_button.anchor.set(0, 0);
    mouse_button.position.set(962.5 + 39.25*i, 741);
    scene.addChild(mouse_button);

    mouse_button.interactive = true;
    mouse_button.buttonMode = true;
    mouse_button.button_pressed = false;
    mouse_button.on("pointerdown", function() {
      if (self.keyboard_sounds) self.soundEffect("keyboard_click_1", 1.0);
      if (mouse_button.button_pressed != true) {
        mouse_button.button_pressed = true;
        // let old_y = mouse_button.position.y;
        mouse_button.position.y += 3;
        setTimeout(function() {
          mouse_button.button_pressed = false;
          mouse_button.position.y -= 3;
        }, 50);
      }
    });
  }

  // the enemy board
  this.enemy_area = new PIXI.Container();
  scene.addChild(this.enemy_area);
  this.enemy_area.position.set(this.width * 1/2 + 325,340);
  this.enemy_area.scale.set(0.325,0.325);


  this.enemy_live_area = new PIXI.Container();
  scene.addChild(this.enemy_live_area);
  this.enemy_live_area.position.set(this.enemy_area.x, this.enemy_area.y);
  this.enemy_live_area.scale.set(this.enemy_area.scale.x, this.enemy_area.scale.y);

  var enemy_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  enemy_mat.width = 50 * board_width;
  enemy_mat.height = 700;
  enemy_mat.anchor.set(0, 1);
  enemy_mat.position.set(0, -50);
  enemy_mat.tint = 0x303889;

  this.enemy_area.addChild(enemy_mat);
  var enemy_pad_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  enemy_pad_mat.width = 50 * board_width;
  enemy_pad_mat.height = 50;
  enemy_pad_mat.anchor.set(0, 1);
  enemy_pad_mat.position.set(0, 0);
  enemy_pad_mat.tint = 0x000000; //0x2c3130;
  this.enemy_area.addChild(enemy_pad_mat);

  for (var p = 0; p < 2; p++) {
    let area = this.player_area;
    if (p == 1) area = this.enemy_area;
    for(var i = 0; i < 2 + Math.floor(Math.random() * 4); i++) {
      let num = 1 + Math.floor(Math.random() * 3)
      let cloud = new PIXI.Sprite(PIXI.Texture.from("Art/cloud_" + num + ".png"));
      cloud.anchor.set(0.5, 0.5);
      cloud.position.set(96 + Math.floor(Math.random() * 320), -200 - i * (150 + Math.floor(Math.random()*50)))
      cloud.scale.set(1/0.65, 1/0.65);
      cloud.alpha = 0.3 + Math.floor(Math.random() * 4) / 10.0;
      cloud.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      area.addChild(cloud);
    }

    for (var i = 0; i < 2; i++) {
      let rock_wall = new PIXI.Container();
      // rock_wall.anchor.set(1 - i, 1);
      //rock_wall.position.set(((i == 0 ? -8 : 6) + board_width*32*i)/.65, 0)
      rock_wall.scale.set(1/0.65, 1/0.65);
      area.addChild(rock_wall);
      for (var m = 1; m < 5; m++) {
        for (var n = 1; n < 16; n++) {
          let tile = PIXI.Sprite.from(PIXI.Texture.WHITE);
          c = (30 + Math.floor(Math.random() * 30)) / 255.0;
          // c = (30 + 5 * (m + n) % 30) / 255.0;
          tile.tint = PIXI.utils.rgb2hex([c,c,c]);
          tile.width = 32;
          tile.height = 32;
          shift = i == 0 ? 0 : (board_width + 4) * 32;
          tile.position.set(shift - 32 * m, 0 - 32 * n);
          rock_wall.addChild(tile);
        }
      }
      rock_wall.cacheAsBitmap = true;
    }
  }

  // level and score
  this.level_label = new PIXI.Text("Level", {fontFamily: "Bebas Neue", fontSize: 10, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.level_label.anchor.set(0.5,0.5);
  this.level_label.position.set(203, 180);
  this.level_label.scale.set(2,2);
  this.level_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  scene.addChild(this.level_label);

  this.level_text_box = new PIXI.Text(this.level, {fontFamily: "Bebas Neue", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.level_text_box.anchor.set(0.5,0.5);
  this.level_text_box.position.set(203, 215);
  this.level_text_box.scale.set(2,2);
  this.level_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  scene.addChild(this.level_text_box);

  this.score_label = new PIXI.Text("Score", {fontFamily: "Bebas Neue", fontSize: 10, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.score_label.anchor.set(0.5,0.5);
  this.score_label.position.set(728, 180);
  this.score_label.scale.set(2,2);
  this.score_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  scene.addChild(this.score_label);

  this.score_text_box = new PIXI.Text(this.score, {fontFamily: "Bebas Neue", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.score_text_box.anchor.set(0.5,0.5);
  this.score_text_box.position.set(728, 215);
  this.score_text_box.scale.set(2,2);
  this.score_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  scene.addChild(this.score_text_box);

  this.setEnemyDifficulty(this.level, 2);

  this.enemy_last_action = Date.now();

  this.gravity = 6;
  this.boost = 0.25;
  this.gentle_drop = 0.1;
  this.gentle_limit = 12.5;
  this.boost_limit = -40;

  for (var i = 0; i < board_width; i++) {
    this.launchpad.cursors[i].visible = false;
  }

  this.countdown_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.countdown_text.anchor.set(0.5,0.5);
  this.countdown_text.position.set(475, 203);
  this.countdown_text.scale.set(4,4);
  this.countdown_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  scene.addChild(this.countdown_text);

  // 129,39 sheen
  // let player_sheen = new PIXI.Sprite(PIXI.Texture.from("Art/sheen.png"));
  // player_sheen.anchor.set(0, 0);
  // player_sheen.position.set(129, 39);
  // player_sheen.alpha = 0.15;
  // scene.addChild(player_sheen);

  let player_monitor_mask = new PIXI.Graphics();
  player_monitor_mask.beginFill(0xFF3300);
  player_monitor_mask.drawRect(129, 39, 669, 504);
  player_monitor_mask.endFill();
  this.player_area.mask = player_monitor_mask;

  // let enemy_sheen = new PIXI.Sprite(PIXI.Texture.from("Art/sheen.png"));
  // enemy_sheen.anchor.set(0, 0);
  // enemy_sheen.position.set(894, 98);
  // enemy_sheen.scale.set(0.5, 0.5);
  // enemy_sheen.alpha = 0.15;
  // scene.addChild(enemy_sheen);

  let enemy_monitor_mask = new PIXI.Graphics();
  enemy_monitor_mask.beginFill(0xFF3300);
  enemy_monitor_mask.drawRect(894, 98, 334, 251);
  enemy_monitor_mask.endFill();
  this.enemy_area.mask = enemy_monitor_mask;
}


// Game.prototype.resetBoardiPad = function() {
//   var self = this;
//   var scene = this.scenes["game"];

//   this.player_palette = this.makeQwertyPalette({
//     parent: scene,
//     key_size: 60,
//     key_margin: 9,
//     x: 0, y: this.height - 216,
//     add_special_keys: true,
//     action: function(letter) {
//       self.keyAction(letter);
//     }
//   });

//   // the player's board
//   this.player_area = new PIXI.Container();
//   scene.addChild(this.player_area);
//   this.player_area.position.set(6,756);
//   // this.player_area.scale.set(0.5,0.5);

//   var play_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   play_mat.width = 500;
//   play_mat.height = 700;
//   play_mat.anchor.set(0, 1);
//   play_mat.position.set(0, -50);
//   play_mat.tint = 0x4D4D4D;
//   this.player_area.addChild(play_mat);

//   var pad_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   pad_mat.width = 500;
//   pad_mat.height = 50;
//   pad_mat.anchor.set(0, 1);
//   pad_mat.position.set(0, 0);
//   pad_mat.tint = 0xCCCCCC;
//   this.player_area.addChild(pad_mat);

//   // the player's launchpad
//   this.launchpad = new Launchpad(this, this.player_area, 1, 0, 0, 50, 48, false);

//   // the enemy board
//   this.enemy_area = new PIXI.Container();
//   scene.addChild(this.enemy_area);
//   this.enemy_area.position.set(512,381);
//   this.enemy_area.scale.set(0.5,0.5);

//   // the enemy palette
//   this.enemy_palette = this.makeQwertyPalette({
//     parent: this.enemy_area,
//     key_size: 42,
//     key_margin: 7,
//     x: 1, y: 24,
//     add_special_keys: false,
//     action: function(letter) {}
//   });

//   var enemy_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   enemy_mat.width = 500;
//   enemy_mat.height = 700;
//   enemy_mat.anchor.set(0, 1);
//   enemy_mat.position.set(0, -50);
//   enemy_mat.tint = 0x4D4D4D;
//   this.enemy_area.addChild(enemy_mat);
//   var enemy_pad_math = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   enemy_pad_math.width = 500;
//   enemy_pad_math.height = 50;
//   enemy_pad_math.anchor.set(0, 1);
//   enemy_pad_math.position.set(0, 0);
//   enemy_pad_math.tint = 0xCCCCCC;
//   this.enemy_area.addChild(enemy_pad_math);

//   // level and score
//   this.level_label = new PIXI.Text("Level", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.level_label.anchor.set(0.5,0.5);
//   this.level_label.position.set(640, 512);
//   scene.addChild(this.level_label);

//   this.level_text_box = new PIXI.Text(this.level, {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.level_text_box.anchor.set(0.5,0.5);
//   this.level_text_box.position.set(640, 542);
//   scene.addChild(this.level_text_box);

//   this.opponent_label = new PIXI.Text("Opponent", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.opponent_label.anchor.set(0.5,0.5);
//   this.opponent_label.position.set(640, 592);
//   scene.addChild(this.opponent_label);

//   this.opponent_text_box = new PIXI.Text(character_names[(this.level - 1) % 26], {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.opponent_text_box.anchor.set(0.5,0.5);
//   this.opponent_text_box.position.set(640, 622);
//   scene.addChild(this.opponent_text_box);

//   this.score_label = new PIXI.Text("Score", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.score_label.anchor.set(0.5,0.5);
//   this.score_label.position.set(640, 672);
//   scene.addChild(this.score_label);

//   this.score_text_box = new PIXI.Text(this.score, {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.score_text_box.anchor.set(0.5,0.5);
//   this.score_text_box.position.set(640, 702);
//   scene.addChild(this.score_text_box);

//   this.setEnemyDifficulty(this.level, 1);

//   this.enemy_last_action = Date.now();

//   this.gravity = 6;
//   this.boost = 0.25;
//   this.gentle_drop = 0.1;
//   this.gentle_limit = 12.5;
//   this.boost_limit = -40;

//   for (var i = 0; i < board_width; i++) {
//     this.launchpad.cursors[i].visible = false;
//   }

//   this.countdown_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.countdown_text.anchor.set(0.5,0.5);
//   this.countdown_text.position.set(this.width * 1/2, this.height * 1/2);
//   scene.addChild(this.countdown_text);
// }



// Game.prototype.resetBoardiPhone = function() {
//   var self = this;
//   var scene = this.scenes["game"];

//   // it's a tiny piece of paper. 50 and 7.5
//   // 
//   this.player_palette = this.makeTallQwertyPalette({
//     parent: scene,
//     key_size: 60,
//     key_margin: 4,
//     side_margin: 2,
//     vertical_margin: 10,
//     x: 0, y: this.height - 394,
//     add_special_keys: true,
//     action: function(letter) {self.keyAction(letter);}
//   });

//   // the player's board
//   this.player_area = new PIXI.Container();
//   scene.addChild(this.player_area);
//   this.player_area.position.set(2,677);
//   this.player_area.scale.set(0.90,0.90);

//   var play_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   play_mat.width = 500;
//   play_mat.height = 700;
//   play_mat.anchor.set(0, 1);
//   play_mat.position.set(0, -50);
//   play_mat.tint = 0x4D4D4D;
//   this.player_area.addChild(play_mat);

//   var pad_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   pad_mat.width = 500;
//   pad_mat.height = 50;
//   pad_mat.anchor.set(0, 1);
//   pad_mat.position.set(0, 0);
//   pad_mat.tint = 0xCCCCCC;
//   this.player_area.addChild(pad_mat);

//   // the player's launchpad
//   this.launchpad = new Launchpad(this, this.player_area, 1, 0, 0, 50, 48, false);


//   // the enemy board
//   this.enemy_area = new PIXI.Container();
//   scene.addChild(this.enemy_area);
//   this.enemy_area.position.set(454,278);
//   this.enemy_area.scale.set(0.368,0.368);

//   // the enemy palette
//   this.enemy_palette = this.makeTallQwertyPalette({
//     parent: this.enemy_area,
//     key_size: 42,
//     key_margin: 7,
//     side_margin: 2,
//     vertical_margin: 11,
//     x: 1, y: 24, 
//     add_special_keys: false,
//     action: function(letter) {}
//   });

//   var enemy_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   enemy_mat.width = 500;
//   enemy_mat.height = 700;
//   enemy_mat.anchor.set(0, 1);
//   enemy_mat.position.set(0, -50);
//   enemy_mat.tint = 0x4D4D4D;
//   this.enemy_area.addChild(enemy_mat);
//   // var enemy_pad_math = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   // enemy_pad_math.width = 500;
//   // enemy_pad_math.height = 50;
//   // enemy_pad_math.anchor.set(0, 1);
//   // enemy_pad_math.position.set(0, 0);
//   // enemy_pad_math.tint = 0xCCCCCC;
//   // this.enemy_area.addChild(enemy_pad_math);

//    // level and score
//   this.level_label = new PIXI.Text("Level", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.level_label.anchor.set(0.5,0.5);
//   this.level_label.position.set(160, 60);
//   scene.addChild(this.level_label);

//   this.level_text_box = new PIXI.Text(this.level, {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.level_text_box.anchor.set(0.5,0.5);
//   this.level_text_box.position.set(160, 90);
//   scene.addChild(this.level_text_box);

//   this.opponent_label = new PIXI.Text("Opponent", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.opponent_label.anchor.set(0.5,0.5);
//   this.opponent_label.position.set(320, 60);
//   scene.addChild(this.opponent_label);

//   this.opponent_text_box = new PIXI.Text(character_names[(this.level - 1) % 26], {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.opponent_text_box.anchor.set(0.5,0.5);
//   this.opponent_text_box.position.set(320, 90);
//   scene.addChild(this.opponent_text_box);

//   this.score_label = new PIXI.Text("Score", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.score_label.anchor.set(0.5,0.5);
//   this.score_label.position.set(480, 60);
//   scene.addChild(this.score_label);

//   this.score_text_box = new PIXI.Text(this.score, {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.score_text_box.anchor.set(0.5,0.5);
//   this.score_text_box.position.set(480, 90);
//   scene.addChild(this.score_text_box);

//   this.setEnemyDifficulty(this.level, 1);

//   this.enemy_last_action = Date.now();

//   this.gravity = 6;
//   this.boost = 0.25;
//   this.gentle_drop = 0.1;
//   this.gentle_limit = 12.5;
//   this.boost_limit = -40;

//   for (var i = 0; i < board_width; i++) {
//     this.launchpad.cursors[i].visible = false;
//   }

//   this.countdown_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.countdown_text.anchor.set(0.5,0.5);
//   this.countdown_text.position.set(this.width * 1/2, this.height * 1/2);
//   scene.addChild(this.countdown_text);
// }



Game.prototype.setEnemyDifficulty = function(level, scale) {
  this.enemy_wpm = 10 + 1.25 * scale * level;
  this.enemy_rerolls = 4 + scale * level;
  this.enemy_short_word = Math.min(6,4 + Math.floor(level / 4));
  this.enemy_long_word = Math.min(4,5 + Math.floor(level / 3));
}


Game.prototype.pickDefense = function(number, retries) {
  shuffleArray(shuffle_letters);
  let player_picks = shuffle_letters.slice(0, number/2);
  let enemy_picks = shuffle_letters.slice(number/2 + 1, number + 1);

  if (number < 4) {
    this.player_defense = player_picks;
    this.enemy_defense = enemy_picks;

    // for (var i = 0; i < this.enemy_defense.length; i++) {
    //   this.enemy_palette.letters[this.enemy_defense[i]].tint = 0x63bff5;
    // }
    // for (var i = 0; i < this.player_defense.length; i++) {
    //   this.player_palette.letters[this.player_defense[i]].tint = 0x63bff5;
    // }
    return;
  }

  let score_1 = 0;
  let score_2 = 0;
  for (var i = 0; i < number/2; i++) {
    score_1 += letter_values[player_picks[i]];
    score_2 += letter_values[enemy_picks[i]];
  }
  if ((score_1 / score_2 > 1.5 || score_1 / score_2 < 1/1.5) && retries > 0) {
    this.pickDefense(number, retries - 1);
  } else {
    this.player_defense = player_picks;
    this.enemy_defense = enemy_picks;

    // for (var i = 0; i < this.enemy_defense.length; i++) {
    //   this.enemy_palette.letters[this.enemy_defense[i]].tint = 0x63bff5;
    // }
    // for (var i = 0; i < this.player_defense.length; i++) {
    //   this.player_palette.letters[this.player_defense[i]].tint = 0x63bff5;
    // }
  }
}


Game.prototype.disabledTime = function(letter) {
  if (["A", "E", "I", "O", "U"].includes(letter)) {
    return 1000;
  } else {
    return 2000;
  }
}


Game.prototype.enemyAction = function(rerolls, targeting = true) {
  var best_word = null;
  var best_shift = null;

  for (var i = 0; i < rerolls; i++) {
    var word_size = this.enemy_short_word + Math.floor(Math.random() * (1 + this.enemy_long_word - this.enemy_short_word));
    var word_list = this.enemy_words[word_size];
    var candidate_word = word_list[Math.floor(Math.random() * word_list.length)];
    var candidate_shift = Math.floor(Math.random() *(board_width + 1 - candidate_word.length));

    var legal_keys = true;
    for (var j = 0; j < candidate_word.length; j++) {
      if (this.enemy_palette.letters[candidate_word[j]].interactive == false) legal_keys = false;
    }

    var legit = (legal_keys && !(candidate_word in this.played_words));

    if (legit) {
      if (best_word == null) {
        best_word = candidate_word;
        best_shift = candidate_shift;
      }

      var targeted = false;
      for (var j = 0; j < this.player_defense.length; j++) {
        if (candidate_word.includes(this.player_defense[j]) && this.player_palette.letters[this.player_defense[j]].interactive == true) {
          targeted = true;
        }
      }

      if (targeting && targeted) {
        best_word = candidate_word;
        best_shift = candidate_shift;
        break;
      }
    }
  }

  if (best_word != null) {
    this.addEnemyWord(best_word, best_shift);
    if (this.game_phase == "tutorial" && this.tutorial_number == 8) {
      this.tutorial9();
    }
  }
}


Game.prototype.addEnemyWord = function(word, shift) {
  this.played_words[word] = 1;
  for (var i = 0; i < word.length; i++) {
    var letter = word[i];

    let rocket_tile = this.makeRocketTile(this.enemy_area, letter, word.length, i, shift, 2, 48, 50);

    this.rocket_letters.push(rocket_tile);
  }
}


Game.prototype.checkEndCondition = function() {
  var self = this;
  if (this.game_phase == "active") {
    let player_dead = true;
    for (var i = 0; i < this.player_defense.length; i++) {
      if (this.player_palette.letters[this.player_defense[i]].interactive === true) {
        player_dead = false;
      }
    }
    if (this.player_defense.length == 0) player_dead = false;

    let enemy_dead = true;
    for (var i = 0; i < this.enemy_defense.length; i++) {
      if (this.enemy_palette.letters[this.enemy_defense[i]].interactive === true) {
        enemy_dead = false;
      }
    }
    if (this.enemy_defense.length == 0) enemy_dead = false;


    if (enemy_dead === true || player_dead === true) {
      if (player_dead == true) { //regardless of whether enemy is dead
        this.countdown_text.text = "GAME OVER";
        this.stopMusic();
        this.soundEffect("game_over");
      } else if (enemy_dead == true) {
        this.countdown_text.text = "VICTORY!";
        this.level += 1;
        setTimeout(function() {self.reset()}, 4000);
      }

      this.game_phase = "gameover";

      let size = this.launchpad.wordSize();
      for (var i = 0; i < size; i++) {
        this.launchpad.pop();
      }

      for (var i = 0; i < this.rocket_letters.length; i++) {
        let rocket = this.rocket_letters[i];
        rocket.status = "falling";
        rocket.vx = -10 + Math.random() * 20;
        rocket.vy = -4 - Math.random() * 14;
        this.freefalling.push(rocket);
      }
      
      //this.fadeMusic(1500);
      
    }
  }
}


Game.prototype.singlePlayerUpdate = function(diff) {
  var self = this;
  var scene = this.scenes["game"];

  let fractional = diff / (1000/30.0);

  if (this.game_phase == "tutorial") {
    this.tutorial_screen.tutorial_text.hover();
  }

  if (this.game_phase == "countdown") {
    let time_remaining = (2400 - (Date.now() - this.start_time)) / 800;
    this.countdown_text.text = Math.ceil(time_remaining).toString();
    if (time_remaining <= 0) {
      this.enemy_palette.cacheAsBitmap = true;
      this.countdown_text.text = "GO";
      this.game_phase = "active";
      setTimeout(function() {self.countdown_text.text = "";}, 1600);
      for (var i = 0; i < board_width; i++) {
        this.launchpad.cursors[i].visible = true;
      }
      if (annoying) this.setMusic("action_song");
    }
  }

  for (let item of [scene, this.player_area, this.enemy_area]) {
    if (item.shake != null) {
      if (item.permanent_x == null) item.permanent_x = item.position.x;
      if (item.permanent_y == null) item.permanent_y = item.position.y;
      item.position.set(item.permanent_x - 3 + Math.random() * 6, item.permanent_y - 3 + Math.random() * 6)
      //item.shake -= 1;
      if (Date.now() - item.shake >= 150) {
        item.shake = null;
        item.position.set(item.permanent_x, item.permanent_y)
      }
    }
  }

  this.launchpad.checkError();

  for (var i = 0; i < this.freefalling.length; i++) {
    var item = this.freefalling[i];
    item.position.x += item.vx * fractional;
    item.position.y += item.vy * fractional;
    item.vy += this.gravity * fractional;

    if (item.position.y > this.height * 1.25) {
      if (item.parent != null) {
        item.parent.removeChild(item);
      }
      item.status = "dead";
    }
  }

  var new_freefalling = [];
  for (var i = 0; i < this.freefalling.length; i++) {
    var item = this.freefalling[i];
    if (item.status != "dead") {
      new_freefalling.push(item);
    }
  }
  this.freefalling = new_freefalling;


  if (this.game_phase != "active" && (this.game_phase != "tutorial" || this.tutorial_number < 5)) {
    return;
  }

  if (this.game_phase != "tutorial" || this.tutorial_number >= 8) {
    if (Date.now() - this.enemy_last_action > 60000/this.enemy_wpm) {
      this.enemyAction(this.enemy_rerolls, this.game_phase != "tutorial");
      this.enemy_last_action = Date.now() - 0.2 * (60000/this.enemy_wpm) + 0.4 * Math.random() * 60000/this.enemy_wpm;
    }
  }

  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];
    // rocket.angle = 0;
    if (rocket.status === "rocket") {
      rocket.position.y += rocket.vy * fractional;
      rocket.vy -= this.boost * fractional;
      if (rocket.vy < this.boost_limit) rocket.vy = this.boost_limit;
    } else if (rocket.status === "descent") {
      rocket.position.y += rocket.vy * fractional;
      rocket.vy += this.gentle_drop * fractional;
      if (rocket.vy > this.gentle_limit) rocket.vy = this.gentle_limit;
      // rocket.angle = 5 * Math.sin((Date.now() - rocket.start_time) / 400)
    }
  }

  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];
    if (rocket.status === "rocket" && rocket.position.y < -780) {
      let y = rocket.position.y;
      let x = rocket.position.x;
      rocket.fire_sprite.visible = false;
      rocket.parachute_sprite.visible = true;
      rocket.vy = 0;
      if (rocket.player == 1) {
        this.player_area.removeChild(rocket);
        this.enemy_area.addChild(rocket);
        rocket.parent = this.enemy_area;
        if (this.game_phase == "tutorial" && this.tutorial_number == 6) this.tutorial7();
      } else if (rocket.player == 2) {
        this.enemy_area.removeChild(rocket);
        this.player_area.addChild(rocket);
        rocket.parent = this.player_area;
        if (this.game_phase == "tutorial" && this.tutorial_number == 9) this.tutorial10();
      }
      rocket.position.set(x, y);
      rocket.status = "descent";
    }
  }


  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket_1 = this.rocket_letters[i];
    for (var j = 0; j < this.rocket_letters.length; j++) {
      var rocket_2 = this.rocket_letters[j];
      if (rocket_1.column == rocket_2.column && rocket_1.parent == rocket_2.parent) {
        if (rocket_1.status == "rocket" && rocket_2.status == "descent"
          && rocket_1.position.y < rocket_2.position.y) {
          // blooie
          // this.soundEffect("fart");
          if (Math.random() * 100 < 50) {
            this.soundEffect("explosion_1");
          } else {
            this.soundEffect("explosion_2");
          }

          if (use_scores) {
            let v_1 = rocket_1.value;
            let v_2 = rocket_2.value;
            rocket_1.value -= v_2;
            rocket_2.value -= v_1;

            if (rocket_1.value <= 0) {
              rocket_1.status = "falling";
              rocket_1.vx = -10 + Math.random() * 20;
              rocket_1.vy = -4 - Math.random() * 14;
              this.freefalling.push(rocket_1);
            } else {
              rocket_1.value_text.text = rocket_1.value;
            }
            if (rocket_2.value <= 0) {
              rocket_2.status = "falling";
              rocket_2.vx = -10 + Math.random() * 20;
              rocket_2.vy = -4 - Math.random() * 14;
              this.freefalling.push(rocket_2);
            } else {
              rocket_2.value_text.text = rocket_2.value;
            }
          } else {
            rocket_1.status = "falling";
            rocket_1.vx = -10 + Math.random() * 20;
            rocket_1.vy = -4 - Math.random() * 14;
            this.freefalling.push(rocket_1);
          
            rocket_2.status = "falling";
            rocket_2.vx = -10 + Math.random() * 20;
            rocket_2.vy = -4 - Math.random() * 14;
            this.freefalling.push(rocket_2);

            let explosion_parent = this.enemy_area;
            if (rocket_1.parent == this.player_area) {
              explosion_parent = this.player_area;
            }
            let explosion = self.makeExplosion(explosion_parent, 
              (rocket_1.x + rocket_2.x) / 2,
              (rocket_1.y + rocket_2.y) / 2,
            1, 1, function() {explosion_parent.removeChild(explosion)});
          }

          if (rocket_1.player == 1) {
            this.player_area.shake = Date.now();
          } else if (rocket_1.player == 2) {
            this.enemy_area.shake = Date.now();
          }
        }
      }
    }
  }


  for (var i = 0; i < this.rocket_letters.length; i++) {
    let rocket = this.rocket_letters[i];
    let disabled_letter = rocket.letter;

    if (rocket.status == "descent" && rocket.y > 0) {

      rocket.status = "final_burn";
      rocket.vy = 0;
      rocket.vx = 0;
      let target_x = 0;
      let target_y = 0;
      let old_x = rocket.x;
      let old_y = rocket.y;
      if (rocket.player == 1) {
        this.enemy_area.removeChild(rocket);
        this.enemy_live_area.addChild(rocket);
        rocket.position.set(old_x,old_y);
        target_x = (this.enemy_palette.letters[disabled_letter].x * this.enemy_palette.scale.x + this.enemy_palette.position.x - this.enemy_area.position.x) / this.enemy_area.scale.x;
        target_y = (this.enemy_palette.letters[disabled_letter].y * this.enemy_palette.scale.y + this.enemy_palette.position.y - this.enemy_area.position.y) / this.enemy_area.scale.y;
        if (this.game_phase == "tutorial" && this.tutorial_number == 7) this.tutorial8();
      } else if (rocket.player == 2) {
        this.player_area.removeChild(rocket);
        this.player_live_area.addChild(rocket);
        rocket.position.set(old_x,old_y);
        target_x = (this.player_palette.letters[disabled_letter].x * this.player_palette.scale.x + this.player_palette.position.x - this.player_area.position.x) / this.player_area.scale.x;
        target_y = (this.player_palette.letters[disabled_letter].y * this.player_palette.scale.y + this.player_palette.position.y - this.player_area.position.y) / this.player_area.scale.y;
        if (this.game_phase == "tutorial" && this.tutorial_number == 10) this.tutorial11();
      }
      let angle = Math.atan2(target_y - rocket.y, target_x - rocket.x) + Math.PI / 2;
      rocket.parachute_sprite.visible = false;
      new TWEEN.Tween(rocket)
        .to({rotation: angle})
        .duration(100)
        .easing(TWEEN.Easing.Quartic.Out)
        .onComplete(function() {rocket.fire_sprite.visible = true; self.soundEffect("rocket");})
        .chain(new TWEEN.Tween(rocket.position)
          .to({y: target_y, x: target_x})
          .duration(300)
          .easing(TWEEN.Easing.Quadratic.In)
          .onComplete(function() {

              rocket.status = "falling";
              self.freefalling.push(rocket);
              rocket.vx = -10 + Math.random() * 20;
              rocket.vy = -4 - Math.random() * 14;
              if (rocket.player == 1) {
                if (self.enemy_palette.letters[disabled_letter].interactive == true) {
                  self.enemy_palette.letters[disabled_letter].disable();
                  self.soundEffect("explosion_3");
                  
                  let fire = self.makeFire(self.enemy_live_area, 
                    target_x,
                    target_y - 24,
                    0.4, 0.33);
                  fire.visible = false;

                  let explosion = self.makeExplosion(self.enemy_live_area, 
                    target_x,
                    target_y,
                  1/2, 1/2, function() {fire.visible = true; self.enemy_live_area.removeChild(explosion)});


                  if (!self.enemy_defense.includes(disabled_letter)) {
                    self.score += rocket.score_value;
                    self.score_text_box.text = self.score;
                    setTimeout(function() {
                      self.enemy_live_area.removeChild(fire);
                      self.enemy_palette.letters[disabled_letter].enable()
                    }, self.disabledTime(disabled_letter));
                  } else {
                    self.score += Math.floor(Math.pow(rocket.score_value, 1.5));
                    self.score_text_box.text = self.score;
                    self.checkEndCondition();
                  }
                }
              } else {
                if (self.player_palette.letters[disabled_letter].interactive == true) {
                  self.player_palette.letters[disabled_letter].disable();
                  scene.shake = Date.now();
                  self.soundEffect("explosion_3");
                  
                  let fire = self.makeFire(self.player_palette.letters[disabled_letter], 
                    0,
                    -24,
                    0.3, 0.25);
                  fire.visible = false;

                  let explosion = self.makeExplosion(self.player_palette.letters[disabled_letter], 
                    0,
                    0,
                  1, 1, function() {fire.visible = true; self.player_palette.letters[disabled_letter].removeChild(explosion);});

                  if (!self.player_defense.includes(disabled_letter)) {
                      setTimeout(function() {
                      self.player_palette.letters[disabled_letter].removeChild(fire);
                      self.player_palette.letters[disabled_letter].enable()
                    }, self.disabledTime(disabled_letter));
                  } else {
                    self.checkEndCondition();
                  }   
                }
              }

          })
        )
        .start()
    }
  }

  var new_rocket_letters = [];
  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];

    if (rocket.status != "dead" && rocket.status != "falling") {
      new_rocket_letters.push(rocket);
    }
  }
  this.rocket_letters = new_rocket_letters;
  // var new_rocket_letters = [];
  // for (var i = 0; i < this.rocket_letters.length; i++) {
  //   var rocket = this.rocket_letters[i];
  //   if (rocket.status != "dead") {
  //     new_freefalling.push(item);
  //   }
  // }
  // this.freefalling = new_freefalling;
}


