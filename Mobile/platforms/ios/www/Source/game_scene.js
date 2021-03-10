

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
    this.pickDefense(6, 10);

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

  var background = new PIXI.Sprite(PIXI.Texture.from("Art/background_4_3_rough.png"));
  background.anchor.set(0, 0);
  scene.addChild(background);

  this.player_palette = this.makeQwertyPalette(scene, 35, this.width * 1/2, this.height - 80, false, function(letter) {
  });

  // the enemy palette
  this.enemy_palette = this.makeQwertyPalette(scene, 24, this.width * 1/2 + 180, 426, false, function(letter) {
  });

  // the player's board
  this.player_area = new PIXI.Container();
  scene.addChild(this.player_area);
  this.player_area.position.set(this.width * 1/2 - 300,530);
  this.player_area.scale.set(0.7,0.7);

  // var play_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  // play_mat.width = 500;
  // play_mat.height = 700;
  // play_mat.anchor.set(0, 1);
  // play_mat.position.set(0, -50);
  // play_mat.tint = 0x4D4D4D;
  // this.player_area.addChild(play_mat);

  var pad_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  pad_mat.width = 500;
  pad_mat.height = 50;
  pad_mat.anchor.set(0, 1);
  pad_mat.position.set(0, 0);
  pad_mat.tint = 0xCCCCCC;
  this.player_area.addChild(pad_mat);

  // the player's launchpad
  this.launchpad = new Launchpad(this, this.player_area, 1, 0, 0, 50, 48, false);

  // the enemy board
  this.enemy_area = new PIXI.Container();
  scene.addChild(this.enemy_area);
  this.enemy_area.position.set(this.width * 1/2 + 60,380);
  this.enemy_area.scale.set(0.5,0.5);
  // var enemy_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  // enemy_mat.width = 500;
  // enemy_mat.height = 700;
  // enemy_mat.anchor.set(0, 1);
  // enemy_mat.position.set(0, -50);
  // enemy_mat.tint = 0x4D4D4D;
  // this.enemy_area.addChild(enemy_mat);
  var enemy_pad_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  enemy_pad_mat.width = 500;
  enemy_pad_mat.height = 50;
  enemy_pad_mat.anchor.set(0, 1);
  enemy_pad_mat.position.set(0, 0);
  enemy_pad_mat.tint = 0xCCCCCC;
  this.enemy_area.addChild(enemy_pad_mat);

  // level and score
  this.level_label = new PIXI.Text("Level", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.level_label.anchor.set(0.5,0.5);
  this.level_label.position.set(920, 40);
  scene.addChild(this.level_label);

  this.level_text_box = new PIXI.Text(this.level, {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.level_text_box.anchor.set(0.5,0.5);
  this.level_text_box.position.set(920, 70);
  scene.addChild(this.level_text_box);

  this.opponent_label = new PIXI.Text("Opponent", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.opponent_label.anchor.set(0.5,0.5);
  this.opponent_label.position.set(920, 130);
  scene.addChild(this.opponent_label);

  this.opponent_text_box = new PIXI.Text(character_names[(this.level - 1) % 26], {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.opponent_text_box.anchor.set(0.5,0.5);
  this.opponent_text_box.position.set(920, 180);
  scene.addChild(this.opponent_text_box);

  this.score_label = new PIXI.Text("Score", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.score_label.anchor.set(0.5,0.5);
  this.score_label.position.set(920, 240);
  scene.addChild(this.score_label);

  this.score_text_box = new PIXI.Text(this.score, {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.score_text_box.anchor.set(0.5,0.5);
  this.score_text_box.position.set(920, 270);
  scene.addChild(this.score_text_box);

  this.setEnemyDifficulty(this.level);

  this.enemy_last_action = Date.now();

  this.gravity = 6;
  this.boost = 0.25;
  this.gentle_drop = 0.1;
  this.gentle_limit = 12.5;
  this.boost_limit = -40;

  for (var i = 0; i < 10; i++) {
    this.launchpad.cursors[i].visible = false;
  }

  this.countdown_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.countdown_text.anchor.set(0.5,0.5);
  this.countdown_text.position.set(this.width * 1/2, this.height * 1/2);
  scene.addChild(this.countdown_text);
}


// Game.prototype.resetBoardTestiPad = function() {
//   var self = this;
//   var scene = this.scenes["game"];

//   var add_special_keys = true;
//   this.player_palette = this.makeQwertyPalette(scene, 64, this.width * 1/2, this.height - 118, add_special_keys, function(letter) {
//     if (add_special_keys && !self.launchpad.full()) {
//       self.keyAction(letter);
//     }
//   });

//   // the enemy palette
//   this.enemy_palette = this.makeQwertyPalette(scene, 24, 636, 426, false, function(letter) {
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

//   this.setEnemyDifficulty(this.level);

//   this.enemy_last_action = Date.now();

//   this.gravity = 6;
//   this.boost = 0.25;
//   this.gentle_drop = 0.1;
//   this.gentle_limit = 12.5;
//   this.boost_limit = -40;

//   for (var i = 0; i < 10; i++) {
//     this.launchpad.cursors[i].visible = false;
//   }

//   this.countdown_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.countdown_text.anchor.set(0.5,0.5);
//   this.countdown_text.position.set(this.width * 1/2, this.height * 1/2);
//   scene.addChild(this.countdown_text);
// }


Game.prototype.resetBoardiPad = function() {
  var self = this;
  var scene = this.scenes["game"];

  var add_special_keys = true;
  this.player_palette = this.makeQwertyPalette(scene, 64, this.width * 1/2, this.height - 118, add_special_keys, function(letter) {
    if (add_special_keys && !self.launchpad.full()) {
      self.keyAction(letter);
    }
  });

  // the enemy palette
  this.enemy_palette = this.makeQwertyPalette(scene, 24, 636, 426, false, function(letter) {
  });
  this.enemy_palette.cacheAsBitmap = true;

  // the player's board
  this.player_area = new PIXI.Container();
  scene.addChild(this.player_area);
  this.player_area.position.set(6,756);
  // this.player_area.scale.set(0.5,0.5);

  var play_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  play_mat.width = 500;
  play_mat.height = 700;
  play_mat.anchor.set(0, 1);
  play_mat.position.set(0, -50);
  play_mat.tint = 0x4D4D4D;
  this.player_area.addChild(play_mat);

  var pad_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  pad_mat.width = 500;
  pad_mat.height = 50;
  pad_mat.anchor.set(0, 1);
  pad_mat.position.set(0, 0);
  pad_mat.tint = 0xCCCCCC;
  this.player_area.addChild(pad_mat);

  // the player's launchpad
  this.launchpad = new Launchpad(this, this.player_area, 1, 0, 0, 50, 48, false);

  // the enemy board
  this.enemy_area = new PIXI.Container();
  scene.addChild(this.enemy_area);
  this.enemy_area.position.set(512,381);
  this.enemy_area.scale.set(0.5,0.5);
  var enemy_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  enemy_mat.width = 500;
  enemy_mat.height = 700;
  enemy_mat.anchor.set(0, 1);
  enemy_mat.position.set(0, -50);
  enemy_mat.tint = 0x4D4D4D;
  this.enemy_area.addChild(enemy_mat);
  var enemy_pad_math = PIXI.Sprite.from(PIXI.Texture.WHITE);
  enemy_pad_math.width = 500;
  enemy_pad_math.height = 50;
  enemy_pad_math.anchor.set(0, 1);
  enemy_pad_math.position.set(0, 0);
  enemy_pad_math.tint = 0xCCCCCC;
  this.enemy_area.addChild(enemy_pad_math);

  // level and score
  this.level_label = new PIXI.Text("Level", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.level_label.anchor.set(0.5,0.5);
  this.level_label.position.set(640, 512);
  scene.addChild(this.level_label);

  this.level_text_box = new PIXI.Text(this.level, {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.level_text_box.anchor.set(0.5,0.5);
  this.level_text_box.position.set(640, 542);
  scene.addChild(this.level_text_box);

  this.opponent_label = new PIXI.Text("Opponent", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.opponent_label.anchor.set(0.5,0.5);
  this.opponent_label.position.set(640, 592);
  scene.addChild(this.opponent_label);

  this.opponent_text_box = new PIXI.Text(character_names[(this.level - 1) % 26], {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.opponent_text_box.anchor.set(0.5,0.5);
  this.opponent_text_box.position.set(640, 622);
  scene.addChild(this.opponent_text_box);

  this.score_label = new PIXI.Text("Score", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.score_label.anchor.set(0.5,0.5);
  this.score_label.position.set(640, 672);
  scene.addChild(this.score_label);

  this.score_text_box = new PIXI.Text(this.score, {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.score_text_box.anchor.set(0.5,0.5);
  this.score_text_box.position.set(640, 702);
  scene.addChild(this.score_text_box);

  this.setEnemyDifficulty(this.level);

  this.enemy_last_action = Date.now();

  this.gravity = 6;
  this.boost = 0.25;
  this.gentle_drop = 0.1;
  this.gentle_limit = 12.5;
  this.boost_limit = -40;

  for (var i = 0; i < 10; i++) {
    this.launchpad.cursors[i].visible = false;
  }

  this.countdown_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.countdown_text.anchor.set(0.5,0.5);
  this.countdown_text.position.set(this.width * 1/2, this.height * 1/2);
  scene.addChild(this.countdown_text);
}



Game.prototype.resetBoardiPhone = function() {
  var self = this;
  var scene = this.scenes["game"];

  // the qwerty palette
  // var add_special_keys = device.platform == "iOS";
  var add_special_keys = true;
  this.player_palette = this.makeQwertyPalette(scene, 68, this.width * 1/2, this.height - 118, add_special_keys, function(letter) {
    if (add_special_keys && !self.launchpad.full()) {
      self.keyAction(letter);
    }
  });

  // the enemy palette
  this.enemy_palette = this.makeQwertyPalette(scene, 24, 636, 426, false, function(letter) {
  });

  // the player's board
  this.player_area = new PIXI.Container();
  scene.addChild(this.player_area);
  this.player_area.position.set(6,756);
  // this.player_area.scale.set(0.5,0.5);

  var play_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  play_mat.width = 500;
  play_mat.height = 700;
  play_mat.anchor.set(0, 1);
  play_mat.position.set(0, -50);
  play_mat.tint = 0x4D4D4D;
  this.player_area.addChild(play_mat);

  var pad_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  pad_mat.width = 500;
  pad_mat.height = 50;
  pad_mat.anchor.set(0, 1);
  pad_mat.position.set(0, 0);
  pad_mat.tint = 0xCCCCCC;
  this.player_area.addChild(pad_mat);

  // the player's launchpad
  this.launchpad = new Launchpad(this, this.player_area, 1, 0, 0, 50, 48, false);

  // the enemy board
  this.enemy_area = new PIXI.Container();
  scene.addChild(this.enemy_area);
  this.enemy_area.position.set(512,381);
  this.enemy_area.scale.set(0.5,0.5);
  var enemy_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  enemy_mat.width = 500;
  enemy_mat.height = 700;
  enemy_mat.anchor.set(0, 1);
  enemy_mat.position.set(0, -50);
  enemy_mat.tint = 0x4D4D4D;
  this.enemy_area.addChild(enemy_mat);
  var enemy_pad_math = PIXI.Sprite.from(PIXI.Texture.WHITE);
  enemy_pad_math.width = 500;
  enemy_pad_math.height = 50;
  enemy_pad_math.anchor.set(0, 1);
  enemy_pad_math.position.set(0, 0);
  enemy_pad_math.tint = 0xCCCCCC;
  this.enemy_area.addChild(enemy_pad_math);

  // level and score
  this.level_label = new PIXI.Text("Level", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.level_label.anchor.set(0.5,0.5);
  this.level_label.position.set(640, 512);
  scene.addChild(this.level_label);

  this.level_text_box = new PIXI.Text(this.level, {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.level_text_box.anchor.set(0.5,0.5);
  this.level_text_box.position.set(640, 542);
  scene.addChild(this.level_text_box);

  this.opponent_label = new PIXI.Text("Opponent", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.opponent_label.anchor.set(0.5,0.5);
  this.opponent_label.position.set(640, 592);
  scene.addChild(this.opponent_label);

  this.opponent_text_box = new PIXI.Text(character_names[(this.level - 1) % 26], {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.opponent_text_box.anchor.set(0.5,0.5);
  this.opponent_text_box.position.set(640, 622);
  scene.addChild(this.opponent_text_box);

  this.score_label = new PIXI.Text("Score", {fontFamily: "Bebas Neue", fontSize: 15, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.score_label.anchor.set(0.5,0.5);
  this.score_label.position.set(640, 672);
  scene.addChild(this.score_label);

  this.score_text_box = new PIXI.Text(this.score, {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.score_text_box.anchor.set(0.5,0.5);
  this.score_text_box.position.set(640, 702);
  scene.addChild(this.score_text_box);

  this.setEnemyDifficulty(this.level);

  this.enemy_last_action = Date.now();

  this.gravity = 6;
  this.boost = 0.25;
  this.gentle_drop = 0.1;
  this.gentle_limit = 12.5;
  this.boost_limit = -40;

  for (var i = 0; i < 10; i++) {
    this.launchpad.cursors[i].visible = false;
  }

  this.countdown_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.countdown_text.anchor.set(0.5,0.5);
  this.countdown_text.position.set(this.width * 1/2, this.height * 1/2);
  scene.addChild(this.countdown_text);
}



Game.prototype.setEnemyDifficulty = function(level) {
  this.enemy_wpm = 10 + 2.5 * level;
  this.enemy_rerolls = 4 + 2 * level;
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

    for (var i = 0; i < this.enemy_defense.length; i++) {
      this.enemy_palette.letters[this.enemy_defense[i]].backing.tint = 0x63bff5;
    }
    for (var i = 0; i < this.player_defense.length; i++) {
      this.player_palette.letters[this.player_defense[i]].backing.tint = 0x63bff5;
    }
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

    for (var i = 0; i < this.enemy_defense.length; i++) {
      this.enemy_palette.letters[this.enemy_defense[i]].backing.tint = 0x63bff5;
    }
    for (var i = 0; i < this.player_defense.length; i++) {
      this.player_palette.letters[this.player_defense[i]].backing.tint = 0x63bff5;
    }
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
    var candidate_shift = Math.floor(Math.random() *(11 - candidate_word.length));

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

Game.prototype.testSinglePlayerUpdate = function() {
  var self = this;
  var scene = this.scenes["game"];

  if (this.game_phase == "countdown") {
    let time_remaining = (2400 - (Date.now() - this.start_time)) / 800;
    this.countdown_text.text = Math.ceil(time_remaining).toString();
    if (time_remaining <= 0) {
      this.enemy_palette.cacheAsBitmap = true;
      this.countdown_text.text = "GO";
      this.game_phase = "active";
      setTimeout(function() {self.countdown_text.text = "";}, 1600);
      for (var i = 0; i < 10; i++) {
        this.launchpad.cursors[i].visible = true;
      }
      if (annoying) this.setMusic("action_song");
    }
  }
}


Game.prototype.singlePlayerUpdate = function() {
  var self = this;
  var scene = this.scenes["game"];


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
      for (var i = 0; i < 10; i++) {
        this.launchpad.cursors[i].visible = true;
      }
      if (annoying) this.setMusic("action_song");
    }
  }

  for (let item of [scene, this.player_area, this.enemy_area]) {
    if (item.shake > 0) {
      if (item.permanent_x == null) item.permanent_x = item.position.x;
      if (item.permanent_y == null) item.permanent_y = item.position.y;
      item.position.set(item.permanent_x - 3 + Math.random() * 6, item.permanent_y - 3 + Math.random() * 6)
      item.shake -= 1;
      if (item.shake <= 0) {
        item.position.set(item.permanent_x, item.permanent_y)
      }
    }
  }

  if (this.launchpad.error > 0) {
    for (item of this.launchpad.tiles) {
      item.backing.tint = 0xdb5858;
    }
    this.launchpad.error -= 1;
    if (this.launchpad.error <= 0) {
      for (item of this.launchpad.tiles) {
        item.backing.tint = 0xFFFFFF;
      }
    }
  }

  for (var i = 0; i < letter_array.length; i++) {
    var letter = letter_array[i];
    if (this.player_palette.letters[letter].error > 0) {
      // this.player_palette.letters[letter].fronting.tint = 0xdb5858;
      this.player_palette.letters[letter].error -= 1;
      // if (this.player_palette.letters[letter].error <= 0) {
      //   this.player_palette.letters[letter].fronting.tint = 0xFFFFFF;
      // }
    }
  }

  for (var i = 0; i < this.freefalling.length; i++) {
    var item = this.freefalling[i];
    item.position.x += item.vx;
    item.position.y += item.vy;
    item.vy += this.gravity;
    // if (this.game_phase == "gameover" && item.parent == null)
    // { 
    //   console.log("STEVE HOLT");
    //   console.log(item);
    // }
    if (item.position.y > this.height * 1.25) {
      if (item.parent != null) item.parent.removeChild(item);
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
      rocket.position.y += rocket.vy;
      rocket.vy -= this.boost;
      if (rocket.vy < this.boost_limit) rocket.vy = this.boost_limit;
    } else if (rocket.status === "descent") {
      rocket.position.y += rocket.vy;
      rocket.vy += this.gentle_drop;
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
          }

          if (rocket_1.player == 1) {
            this.player_area.shake = 5;
          } else if (rocket_1.player == 2) {
            this.enemy_area.shake = 5;
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
      if (rocket.player == 1) {
        target_x = (this.enemy_palette.letters[disabled_letter].x + this.enemy_palette.position.x - this.enemy_area.position.x) / this.enemy_area.scale.x;
        target_y = (this.enemy_palette.letters[disabled_letter].y + this.enemy_palette.position.y - this.enemy_area.position.y) / this.enemy_area.scale.y;
        if (this.game_phase == "tutorial" && this.tutorial_number == 7) this.tutorial8();
      } else if (rocket.player == 2) {
        target_x = (this.player_palette.letters[disabled_letter].x + this.player_palette.position.x - this.player_area.position.x) / this.player_area.scale.x;
        target_y = (this.player_palette.letters[disabled_letter].y + this.player_palette.position.y - this.player_area.position.y) / this.player_area.scale.y;
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
          .duration(200)
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
                  
                  let fire = self.makeFire(self.scenes["game"], 
                    self.enemy_palette.letters[disabled_letter].x + self.enemy_palette.position.x,
                    self.enemy_palette.letters[disabled_letter].y + self.enemy_palette.position.y - 8,
                    0.1, 0.25/3);
                  fire.visible = false;

                  let explosion = self.makeExplosion(self.scenes["game"], 
                    self.enemy_palette.letters[disabled_letter].x + self.enemy_palette.position.x,
                    self.enemy_palette.letters[disabled_letter].y + self.enemy_palette.position.y,
                  0.3, 0.3, function() {fire.visible = true; self.scenes["game"].removeChild(explosion)});


                  if (!self.enemy_defense.includes(disabled_letter)) {
                    self.score += rocket.score_value;
                    self.score_text_box.text = self.score;
                    setTimeout(function() {
                      self.scenes["game"].removeChild(fire);
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
                  scene.shake = 5;
                  self.soundEffect("explosion_3");
                  
                  let fire = self.makeFire(self.scenes["game"], 
                    self.player_palette.letters[disabled_letter].x + self.player_palette.position.x,
                    self.player_palette.letters[disabled_letter].y + self.player_palette.position.y - 24,
                    0.3, 0.25);
                  fire.visible = false;

                  let explosion = self.makeExplosion(self.scenes["game"], 
                    self.player_palette.letters[disabled_letter].x + self.player_palette.position.x,
                    self.player_palette.letters[disabled_letter].y + self.player_palette.position.y,
                  1, 1, function() {fire.visible = true; self.scenes["game"].removeChild(explosion);});

                  if (!self.player_defense.includes(disabled_letter)) {
                      setTimeout(function() {
                      self.scenes["game"].removeChild(fire);
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


