

Game.prototype.initializeSinglePlayerScene = function() {
  this.level = 14;
  this.score = 0;

  console.log(this.difficulty_level);

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

  this.pickDefense(6, 10);

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

    delay(function() {
      self.paused = false;
      self.pause_time = 0;
      // STEVE HOLT
      // self.start_time = Date.now();
      self.start_time = self.markTime();
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
    player: 1,
    parent: scene, x: 467, y: 807,
    defense: this.player_defense, 
    action: function(letter) {

      if (self.game_phase == "tutorial" && self.tutorial_number == 1) {
        self.tutorial_screen.tutorial_text.text = self.tutorial_1_snide_click_responses[Math.min(6, self.tutorial_1_snide_clicks)];
        self.tutorial_1_snide_clicks += 1
      }

      if (!self.paused) {
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
    }
  });

  this.enemy_palette = this.makeKeyboard({
    player: 2,
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

  this.player_live_area = new PIXI.Container();
  scene.addChild(this.player_live_area);
  this.player_live_area.position.set(this.player_area.x, this.player_area.y);
  this.player_live_area.scale.set(this.player_area.scale.x, this.player_area.scale.y);

  var play_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  play_mat.width = 32 * board_width;
  play_mat.height = 32 * 14;
  play_mat.anchor.set(0, 1);
  play_mat.position.set(0, -32);
  play_mat.tint = 0x303889;
  this.player_area.addChild(play_mat);

  // the player's launchpad
  this.launchpad = new Launchpad(this, this.player_area, 1, 0, 0, 32, 32, false);

  this.spelling_help = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 20, fill: 0xFFFFFF, letterSpacing: 12, align: "left"});
  this.spelling_help.position.set(6, -64);
  this.spelling_help.alpha = 0.4;
  if (this.difficulty_level != "EASY") {
    this.spelling_help.visible = false;
  }
  this.player_area.addChild(this.spelling_help);

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
        mouse_button.position.y += 3;
        delay(function() {
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
  this.enemy_area.scale.set(0.5,0.5);


  this.enemy_live_area = new PIXI.Container();
  scene.addChild(this.enemy_live_area);
  this.enemy_live_area.position.set(this.enemy_area.x, this.enemy_area.y);
  this.enemy_live_area.scale.set(this.enemy_area.scale.x, this.enemy_area.scale.y);

  var enemy_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  enemy_mat.width = 32 * board_width;
  enemy_mat.height = 32 * 14;
  enemy_mat.anchor.set(0, 1);
  enemy_mat.position.set(0, -32);
  enemy_mat.tint = 0x303889;

  this.enemy_area.addChild(enemy_mat);
  var enemy_pad_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  enemy_pad_mat.width = 32 * board_width;
  enemy_pad_mat.height = 32;
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
      cloud.position.set(62 + Math.floor(Math.random() * 200), -125 - i * (100 + Math.floor(Math.random()*32)))
      cloud.alpha = 0.3 + Math.floor(Math.random() * 4) / 10.0;
      cloud.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      area.addChild(cloud);
    }

    for (var i = 0; i < 2; i++) {
      let rock_wall = new PIXI.Container();
      area.addChild(rock_wall);
      for (var m = 1; m < 5; m++) {
        for (var n = 1; n < 16; n++) {
          let tile = PIXI.Sprite.from(PIXI.Texture.WHITE);
          c = (30 + Math.floor(Math.random() * 30)) / 255.0;
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
  this.level_label = new PIXI.Text("Level", {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.level_label.anchor.set(0.5,0.5);
  this.level_label.position.set(203, 180);
  this.level_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  scene.addChild(this.level_label);

  this.level_text_box = new PIXI.Text(this.level, {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.level_text_box.anchor.set(0.5,0.5);
  this.level_text_box.position.set(203, 215);
  this.level_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  scene.addChild(this.level_text_box);

  this.score_label = new PIXI.Text("Score", {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.score_label.anchor.set(0.5,0.5);
  this.score_label.position.set(720, 180);
  this.score_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  scene.addChild(this.score_label);

  this.score_text_box = new PIXI.Text(this.score, {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.score_text_box.anchor.set(0.5,0.5);
  this.score_text_box.position.set(720, 215);
  this.score_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  scene.addChild(this.score_text_box);

  this.setEnemyDifficulty(this.level);

  // STEVE HOLT
  // this.enemy_last_action = Date.now();
  this.enemy_last_action = this.markTime();

  this.gravity = 3.8;
  this.boost = 0.18;
  this.gentle_drop = 0.05;
  this.gentle_limit = 6;
  this.boost_limit = -25;

  for (var i = 0; i < board_width; i++) {
    this.launchpad.cursors[i].visible = false;
  }

  this.announcement = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.announcement.anchor.set(0.5,0.5);
  this.announcement.position.set(470, 203);
  this.announcement.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.announcement.style.lineHeight = 36;
  scene.addChild(this.announcement);

  // this.press_enter_text = new PIXI.Text("TRY AGAIN?", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  // this.press_enter_text.anchor.set(0.5,0.5);
  // this.press_enter_text.position.set(470, 403);
  // this.press_enter_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // scene.addChild(this.press_enter_text);
  // this.press_enter_text.visible = false;

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


Game.prototype.setEnemyDifficulty = function(level) {
  let capped_level = Math.min(level, 26);
  let scale;
  let min_word;
  let med_word;
  let max_word;
  if (this.difficulty_level == "EASY") {
    scale = 0.7;
    min_word = 4;
    med_word = 5;
    max_word = 8;
  } else if (this.difficulty_level == "MEDIUM") {
    // scale = 1.25;
    scale = 0.9;
    min_word = 4;
    med_word = 7;
    max_word = 9;
    console.log("medium");
  } else if (this.difficulty_level == "HARD") {
    scale = 1.2;
    min_word = 4;
    med_word = 9;
    max_word = 12;
  } else if (this.difficulty_level == "BEACON") {
    scale = 2;
    min_word = 4;
    med_word = 10;
    max_word = 12;
  }
  this.enemy_wpm = 10 + 1.25 * scale * capped_level;
  this.enemy_rerolls = 4 + scale * capped_level / 2;

  console.log("WPM is " + this.enemy_wpm);

  this.enemy_short_word = min_word
  this.enemy_long_word = Math.min(max_word, med_word + Math.floor((max_word - med_word) * capped_level / 17));

  this.level_type = "normal";
  if (this.difficulty_level != "EASY" &&(level + 1) % 4 == 0) {
    this.level_type = "special";
    this.level_condition = this.special_levels[Math.floor((level % 24) / 4)]
  }
}


Game.prototype.pickDefense = function(number, retries) {
  shuffleArray(shuffle_letters);
  let player_picks = shuffle_letters.slice(0, number/2);
  let enemy_picks = shuffle_letters.slice(number/2 + 1, number + 1);

  if (number < 4) {
    this.player_defense = player_picks;
    this.enemy_defense = enemy_picks;

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
  }
}


Game.prototype.disabledTime = function(letter) {
  if (this.difficulty_level != "BEACON") {
    if (["A", "E", "I", "O", "U"].includes(letter)) {
      return 2000;
    } else {
      return 3000;
    }
  } else {
    if (["A", "E", "I", "O", "U"].includes(letter)) {
      return 1000;
    } else {
      return 2000;
    }
  }
}


Game.prototype.spellingHelp = function() {
  var self = this;
  var scene = this.scenes["game"];

  if (this.difficulty_level == "EASY") {
    this.spelling_help.position.set(this.launchpad.cursors[0].x - 10, -64);
    let word = this.launchpad.word();
    if (word in this.spelling_prediction) {
      this.spelling_help.text = this.spelling_prediction[word].slice(0, board_width - this.launchpad.shift);
    } else {
      this.spelling_help.text = "";
    }
    // this.spelling_help.visible = true;
  }
}


Game.prototype.updateAnnouncement = function() {
  var self = this;
  var scene = this.scenes["game"];

  if (this.game_phase == "countdown") {
    // STEVE HOLT
    // let time_remaining = (2400 - (Date.now() - this.start_time)) / 800;
    let time_remaining = (2400 - (this.timeSince(this.start_time))) / 800;
    this.announcement.text = Math.ceil(time_remaining).toString();
    if (time_remaining <= 0) {
      
      this.game_phase = "active";

      if (this.level_type == "special") {
        this.special_level_time = this.markTime();
        let text = this.level_condition.replace("numbers_and_shapes", "numbers\nand shapes").toUpperCase();
        this.announcement.text = "ONLY " + text + "!";
        this.announcement.style.fontSize = 24;
      } else {
        this.announcement.text = "GO";
        delay(function() {self.announcement.text = "";}, 1600);
      }

      
      for (var i = 0; i < board_width; i++) {
        this.launchpad.cursors[i].visible = true;
      }
      if (annoying) this.setMusic("action_song");
    }
  }

  if (this.game_phase == "active" && this.level_type == "special") {
    let time_remaining = (30000 - (this.timeSince(this.special_level_time))) / 1000;
    let text = this.level_condition.replace("numbers_and_shapes", "numbers\nand shapes").toUpperCase();
    this.announcement.text = "ONLY " + text + "!\n" + Math.ceil(time_remaining).toString();
    if (time_remaining <= 0) {
      this.level_type = "normal";
      this.announcement.text = "";
      this.announcement.style.fontSize = 36;
    }
  }
}




Game.prototype.shakeDamage = function() {
  var self = this;
  var scene = this.scenes["game"];

  for (let item of [scene, this.player_area, this.enemy_area]) {
    if (item.shake != null) {
      if (item.permanent_x == null) item.permanent_x = item.position.x;
      if (item.permanent_y == null) item.permanent_y = item.position.y;
      item.position.set(item.permanent_x - 3 + Math.random() * 6, item.permanent_y - 3 + Math.random() * 6)
      // STEVE HOLT
      //if (Date.now() - item.shake >= 150) {
      if (this.timeSince(item.shake) >= 150) {
        item.shake = null;
        item.position.set(item.permanent_x, item.permanent_y)
      }
    }
  }
}


Game.prototype.freeeeeFreeeeeFalling = function(fractional) {
  var self = this;
  var scene = this.scenes["game"];

  for (let i = 0; i < this.freefalling.length; i++) {
    let item = this.freefalling[i];
    item.position.x += item.vx * fractional;
    item.position.y += item.vy * fractional;
    if (item.type != "ember") {
      item.vy += this.gravity * fractional;
    } else {
      item.alpha *= 0.97;
      item.vy += this.gentle_drop * fractional;
      if (item.vy > this.gentle_limit) item.vy = this.gentle_limit;
    }

    if (item.position.y > 200 || item.alpha < 0.04) {
      if (item.parent != null) {
        item.parent.removeChild(item);
      }
      item.status = "dead";
    }
  }

  let new_freefalling = [];
  for (let i = 0; i < this.freefalling.length; i++) {
    let item = this.freefalling[i];
    if (item.status != "dead") {
      new_freefalling.push(item);
    }
  }
  this.freefalling = new_freefalling;
}


Game.prototype.coolHotKeys = function() {
  var self = this;
  var scene = this.scenes["game"];

  for (let i = 0; i < letter_array.length; i++) {
    let letter = letter_array[i];
    let key = this.player_palette.letters[letter];
    if (key.playable == false && !this.player_defense.includes(letter)) {
      // STEVE HOLD
      //let v = Date.now() - key.disable_time - this.disabledTime(letter);
      let v = this.timeSince(key.disable_time + this.disabledTime(letter));
      if (v > -500) {
        let portion = Math.min(1,(v + 500) / 500);
        key.tint = PIXI.utils.rgb2hex([portion * 0.7 + 0.3, portion * 0.7 + 0.3, portion * 0.7 + 0.3]);
      }      
    }

    key = this.enemy_palette.letters[letter];
    if (key.playable == false && !this.enemy_defense.includes(letter)) {
      let v = this.timeSince(key.disable_time + this.disabledTime(letter));
      if (v > -500) {
        let portion = Math.min(1,(v + 500) / 500);
        key.tint = PIXI.utils.rgb2hex([portion * 0.7 + 0.3, portion * 0.7 + 0.3, portion * 0.7 + 0.3]);
      }      
    }
  }
}


Game.prototype.enemyAction = function() {
  // guard
  if (this.game_phase == "tutorial" && this.tutorial_number < 8) {
    return;
  }

  if(this.timeSince(this.enemy_last_action) <= 60000/this.enemy_wpm) {
    return;
  } else {
    console.log(this.timeSince(this.enemy_last_action));
    this.enemy_last_action = this.timeSince(0.2 * (60000/this.enemy_wpm) - 0.4 * Math.random() * 60000/this.enemy_wpm);
  }

  if (this.game_phase == "active" && this.level_type == "special") {
    let probability = Math.min(1, (10 + 0.5 * this.level) / 25);
    if (Math.random() > probability) {
      let words = Object.keys(this.special_dictionaries[this.level_condition]);
      let best_word = null;
      for (var i = 0; i < this.enemy_rerolls / 2; i++) {
        let candidate_word = words[Math.floor(Math.random() * words.length)];
        if (candidate_word.length <= this.enemy_long_word) {
          if (best_word == null) best_word = candidate_word;
          for (let j = 0; j < this.player_defense.length; j++) {
            if (candidate_word.includes(this.player_defense[j]) && this.player_palette.letters[this.player_defense[j]].playable == true) {
              best_word = candidate_word;
            }
          }
        }
      }
      if (best_word != null) {
        let shift = Math.floor(Math.random() * (board_width + 1 - best_word.length));
        this.addEnemyWord(best_word, shift);
      }
    }

    // don't do the other thing
    return;
  }

  let targeting = this.game_phase != "tutorial";
  let rerolls = this.enemy_rerolls;

  let best_word = null;
  let best_shift = null;

  for (let i = 0; i < rerolls; i++) {
    let word_size = this.enemy_short_word + Math.floor(Math.random() * (1 + this.enemy_long_word - this.enemy_short_word));
    let word_list = this.enemy_words[word_size];
    let candidate_word = word_list[Math.floor(Math.random() * word_list.length)];

    let legal_keys = true;
    for (let j = 0; j < candidate_word.length; j++) {
      if (this.enemy_palette.letters[candidate_word[j]].playable == false) legal_keys = false;
    }

    let legit = (legal_keys && !(candidate_word in this.played_words));

    if (legit) {
      if (best_word == null) {
        best_word = candidate_word;
      }

      let targeted = false;
      for (let j = 0; j < this.player_defense.length; j++) {
        if (candidate_word.includes(this.player_defense[j]) && this.player_palette.letters[this.player_defense[j]].playable == true) {
          targeted = true;
        }
      }

      if (targeting && targeted) {
        best_word = candidate_word;
        break;
      }
    }
  }

  if (best_word != null) {
    let shift = Math.floor(Math.random() * (board_width + 1 - best_word.length));
    this.addEnemyWord(best_word, shift);
    if (this.game_phase == "tutorial" && this.tutorial_number == 8) {
      this.tutorial9();
    }
  }
}


Game.prototype.addEnemyWord = function(word, shift) {
  this.played_words[word] = 1;
  for (var i = 0; i < word.length; i++) {
    var letter = word[i];

    let rocket_tile = this.makeRocketTile(this.enemy_area, letter, word.length, i, shift, 2, 32, 32);

    this.rocket_letters.push(rocket_tile);
  }
}


Game.prototype.checkEndCondition = function() {
  var self = this;
  if (this.game_phase == "active") {
    let player_dead = true;
    for (var i = 0; i < this.player_defense.length; i++) {
      if (this.player_palette.letters[this.player_defense[i]].playable === true) {
        player_dead = false;
      }
    }
    if (this.player_defense.length == 0) player_dead = false;

    let enemy_dead = true;
    for (var i = 0; i < this.enemy_defense.length; i++) {
      if (this.enemy_palette.letters[this.enemy_defense[i]].playable === true) {
        enemy_dead = false;
      }
    }
    if (this.enemy_defense.length == 0) enemy_dead = false;


    if (enemy_dead === true || player_dead === true) {
      this.announcement.style.fontSize = 36;
      if (player_dead == true) { //regardless of whether enemy is dead
        this.announcement.text = "GAME OVER";
        // this.press_enter_text.visible = true;
        this.stopMusic();
        this.soundEffect("game_over");
        delay(function() {
          self.initializeSetupSingleScene();
          self.animateSceneSwitch("game", "setup_single");
        }, 4000);
      } else if (enemy_dead == true) {
        this.announcement.text = "VICTORY!";
        this.level += 1;
        delay(function() {self.reset();}, 4000);
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
    }
  }
}


Game.prototype.boostRockets = function(fractional) {
  var self = this;
  var scene = this.scenes["game"];

  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];
    if (rocket.status === "rocket") {
      rocket.position.y += rocket.vy * fractional;
      rocket.vy -= this.boost * fractional;
      if (rocket.vy < this.boost_limit) rocket.vy = this.boost_limit;

      rocket.fire_sprite.position.set(
        rocket.fire_sprite.original_x - 1 + 2 * Math.random(),
        rocket.fire_sprite.original_y - 1 + 2 * Math.random());

      if (Math.random() * 100 > Math.min(-0.6 * rocket.y, 95)) {
        // drop an ember
        let ember = PIXI.Sprite.from(PIXI.Texture.WHITE);
        
        ember.tint = fire_colors[Math.floor(Math.random()*fire_colors.length)];
        ember.width = 4;
        ember.height = 4;
        ember.vx = -1 + Math.floor(Math.random() * 2);
        ember.vy = 0;
        ember.type = "ember";
        ember.parent = rocket.parent;
        ember.position.set(rocket.x - 16 + Math.floor(Math.random() * 32), rocket.y + 30);
        rocket.parent.addChild(ember);
        this.freefalling.push(ember);
      }
    } else if (rocket.status === "descent") {
      rocket.position.y += rocket.vy * fractional;
      rocket.vy += this.gentle_drop * fractional;
      if (rocket.vy > this.gentle_limit) rocket.vy = this.gentle_limit;
    }
  }
}


Game.prototype.checkRocketScreenChange = function() {
  var self = this;
  var scene = this.scenes["game"];

  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];
    if (rocket.status === "rocket" && rocket.position.y < -16 * 32) {
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
}


Game.prototype.checkRocketCollisions = function() {
  var self = this;
  var scene = this.scenes["game"];

  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket_1 = this.rocket_letters[i];
    for (var j = 0; j < this.rocket_letters.length; j++) {
      var rocket_2 = this.rocket_letters[j];
      if (rocket_1.column == rocket_2.column && rocket_1.parent == rocket_2.parent) {
        if ((rocket_1.status == "rocket" || rocket_1.status == "load") && rocket_2.status == "descent"
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
            // STEVE HOLT
            //this.player_area.shake = Date.now();
            this.player_area.shake = this.markTime();
          } else if (rocket_1.player == 2) {
            // STEVE HOLT
            //this.enemy_area.shake = Date.now();
            this.enemy_area.shake = this.markTime();
          }
        }
      }
    }
  }
}


Game.prototype.checkRocketAttacks = function() {
  var self = this;
  var scene = this.scenes["game"];

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
          .duration(200)
          .easing(TWEEN.Easing.Quadratic.In)
          .onComplete(function() {

              rocket.status = "falling";
              self.freefalling.push(rocket);
              rocket.vx = -10 + Math.random() * 20;
              rocket.vy = -4 - Math.random() * 14;
              if (rocket.player == 1) {
                if (self.enemy_palette.letters[disabled_letter].playable === true) {
                  self.enemy_palette.letters[disabled_letter].disable();
                  self.enemy_palette.letters[disabled_letter].playable = false;
                  self.soundEffect("explosion_3");

                  let electric = self.makeElectric(self.enemy_live_area, 
                    target_x,
                    target_y,
                    0.75, 0.75);

                  let explosion = self.makeExplosion(self.enemy_live_area, 
                    target_x,
                    target_y,
                  0.3125, 0.3125, function() {electric.visible = true; self.enemy_live_area.removeChild(explosion)});

                  self.enemy_palette.letters[disabled_letter].tint = 0x4c4c4c;
                  self.enemy_palette.letters[disabled_letter].angle = -10 + 20 * Math.random();

                  if (!self.enemy_defense.includes(disabled_letter)) {
                    self.score += rocket.score_value;
                    self.score_text_box.text = self.score;
                    delay(function() {
                      self.enemy_live_area.removeChild(electric);
                      self.enemy_palette.letters[disabled_letter].enable();
                      self.enemy_palette.letters[disabled_letter].playable = true;
                      self.enemy_palette.letters[disabled_letter].tint = 0xFFFFFF;
                      self.enemy_palette.letters[disabled_letter].angle = 0;
                    }, self.disabledTime(disabled_letter));
                  } else {
                    self.score += Math.floor(Math.pow(rocket.score_value, 1.5));
                    self.score_text_box.text = self.score;
                    self.checkEndCondition();
                  }
                }
              } else {
                if (self.player_palette.letters[disabled_letter].playable === true) {
                  self.player_palette.letters[disabled_letter].disable();
                  self.player_palette.letters[disabled_letter].playable = false;
                  // STEVE HOLT
                  // scene.shake = Date.now();
                  scene.shake = self.markTime();
                  self.soundEffect("explosion_3");

                  let electric = self.makeElectric(self.player_palette.letters[disabled_letter], 
                    0,
                    0,
                    1.5, 1.5);

                  self.player_palette.letters[disabled_letter].tint = 0x4c4c4c;
                  self.player_palette.letters[disabled_letter].angle = -10 + 20 * Math.random();

                  let explosion = self.makeExplosion(self.player_palette, 
                    self.player_palette.letters[disabled_letter].x,
                    self.player_palette.letters[disabled_letter].y,
                  1, 1, function() {electric.visible = true; self.player_palette.removeChild(explosion);});

                  if (!self.player_defense.includes(disabled_letter)) {
                    delay(function() {
                      self.player_palette.letters[disabled_letter].enable()
                      self.player_palette.letters[disabled_letter].playable = true;
                      self.player_palette.letters[disabled_letter].tint = 0xFFFFFF;
                      self.player_palette.letters[disabled_letter].angle = 0;
                      self.player_palette.letters[disabled_letter].removeChild(electric);
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
}


Game.prototype.cleanRockets = function() {
  var self = this;
  var scene = this.scenes["game"];

  var new_rocket_letters = [];
  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];

    if (rocket.status != "dead" && rocket.status != "falling") {
      new_rocket_letters.push(rocket);
    }
  }
  this.rocket_letters = new_rocket_letters;
}


Game.prototype.singlePlayerUpdate = function(diff) {
  var self = this;
  var scene = this.scenes["game"];

  let fractional = diff / (1000/30.0);

  if (this.game_phase == "tutorial") {
    this.tutorial_screen.tutorial_text.hover();
  }

  this.spellingHelp();
  this.updateAnnouncement();
  this.shakeDamage();
  this.launchpad.checkError();
  this.freeeeeFreeeeeFalling(fractional);
  this.coolHotKeys();

  // Skip the rest if we aren't in active gameplay
  if (this.game_phase != "active" && (this.game_phase != "tutorial" || this.tutorial_number < 5)) {
    return;
  }

  this.enemyAction();  
  this.boostRockets(fractional);
  this.checkRocketScreenChange();
  this.checkRocketCollisions();
  this.checkRocketAttacks();
  this.cleanRockets();
}




