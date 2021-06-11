

Game.prototype.initialize1pWordRockets = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  this.clearScreen(screen);

  this.freefalling = [];
  this.pickers = [];
  this.played_words = {};
  this.bombs = [];

  this.shakers = [];

  this.rocket_letters = [];

  this.pickDefense(6, 10);

  this.bomb_spawn_last = self.markTime();
  this.bomb_spawn_next = bomb_spawn_interval * (0.8 + 0.4 * Math.random());

  this.wpm_history = [];
  this.calculated_wpm = 0;
  this.display_wpm = 0;

  this.resetBoard();

  if (this.tutorial) {
    this.tutorial1();
  } else {
    this.game_phase = "pre_game";

    delay(function() {
      self.paused = false;
      self.pause_time = 0;
      self.start_time = self.markTime();
      self.game_phase = "countdown";
      self.soundEffect("countdown");
    }, 1200);
  }
}


Game.prototype.resetBoard = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  var far_background = new PIXI.Sprite(PIXI.Texture.from("Art/game_far_background.png"));
  far_background.anchor.set(0, 0);
  screen.addChild(far_background);

  this.enemy_palette = this.makeKeyboard({
    player: 2,
    parent: screen, x: 1062.5, y: 472,
    defense: this.enemy_defense, 
    action: function(letter) {
    }
  });
  this.enemy_palette.scale.set(0.3125, 0.3125);

  // the enemy board
  this.enemy_area = new PIXI.Container();
  screen.addChild(this.enemy_area);
  this.enemy_area.position.set(this.width * 1/2 + 325,340);
  this.enemy_area.scale.set(0.5,0.5);

  this.enemy_live_area = new PIXI.Container();
  screen.addChild(this.enemy_live_area);
  this.enemy_live_area.position.set(this.enemy_area.x, this.enemy_area.y);
  this.enemy_live_area.scale.set(this.enemy_area.scale.x, this.enemy_area.scale.y);

  // var enemy_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  // enemy_mat.width = 32 * board_width;
  // enemy_mat.height = 32 * 14;
  // enemy_mat.anchor.set(0, 1);
  // enemy_mat.position.set(0, -32);
  // enemy_mat.tint = 0x303889;
  // this.enemy_area.addChild(enemy_mat);

  var enemy_pad_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  enemy_pad_mat.width = 32 * board_width;
  enemy_pad_mat.height = 32;
  enemy_pad_mat.anchor.set(0, 1);
  enemy_pad_mat.position.set(0, 0);
  enemy_pad_mat.tint = 0x000000; //0x2c3130;
  this.enemy_area.addChild(enemy_pad_mat);


  if(this.opponent_name != null) {
    let name = "";
    if (this.opponent_name == "zh") {
      name = "zhukov";
    }
    this.opponent_image = new PIXI.Sprite(PIXI.Texture.from("Art/Opponents/" + name + ".png"));
    this.opponent_image.anchor.set(0.5, 0.5);
    this.opponent_image.position.set(1100, 304);
    this.opponent_image.alpha = 0.7;
  } else {
    this.opponent_image = new PIXI.Container();
  }
  screen.addChild(this.opponent_image);

  var near_background = new PIXI.Sprite(PIXI.Texture.from("Art/game_near_background.png"));
  near_background.anchor.set(0, 0);
  screen.addChild(near_background);

  this.mouse_cord = new PIXI.Container();
  screen.addChild(this.mouse_cord);


  this.player_palette = this.makeKeyboard({
    player: 1,
    parent: screen, x: 467, y: 807,
    defense: this.player_defense, 
    action: function(letter) {

      if (self.game_phase == "tutorial" && self.tutorial_number == 1) {
        self.tutorial_screen.tutorial_text.text = self.tutorial_1_snide_click_responses[Math.min(6, self.tutorial_1_snide_clicks)];
        self.tutorial_1_snide_clicks += 1
      }

      self.gameplayKeyDown(letter);
    }
  });

  

  // the player's board
  this.player_area = new PIXI.Container();
  screen.addChild(this.player_area);
  this.player_area.position.set(this.width * 1/2 - 370,520);

  this.player_live_area = new PIXI.Container();
  screen.addChild(this.player_live_area);
  this.player_live_area.position.set(this.player_area.x, this.player_area.y);
  this.player_live_area.scale.set(this.player_area.scale.x, this.player_area.scale.y);

  // var play_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  // play_mat.width = 32 * board_width;
  // play_mat.height = 32 * 14;
  // play_mat.anchor.set(0, 1);
  // play_mat.position.set(0, -32);
  // play_mat.tint = 0x303889;
  // // play_mat.visible = false;
  // this.player_area.addChild(play_mat);

  // the player's launchpad
  this.launchpad = new Launchpad(this, this.player_area, 1, 0, 0, 32, 32, false);

  for (var p = 0; p < 2; p++) {
    // let area = this.player_area;
    // if (p == 1) area = this.enemy_area;
    // for(var i = 0; i < 2 + Math.floor(Math.random() * 4); i++) {
    //   let num = 1 + Math.floor(Math.random() * 3)
    //   let cloud = new PIXI.Sprite(PIXI.Texture.from("Art/cloud_" + num + ".png"));
    //   cloud.anchor.set(0.5, 0.5);
    //   cloud.position.set(62 + Math.floor(Math.random() * 200), -125 - i * (100 + Math.floor(Math.random()*32)))
    //   cloud.alpha = 0.3 + Math.floor(Math.random() * 4) / 10.0;
    //   cloud.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    //   area.addChild(cloud);
    // }
    let area = this.player_area;
    if (p == 1) area = this.enemy_area;
    let sky = new PIXI.Sprite(PIXI.Texture.from("Art/sky.png"));
    sky.anchor.set(0,1);
    sky.position.set(-32, 0);
    area.addChild(sky);
    // sky.visible = false;

    for (let i = 0; i < 50; i++) {
      let tree = new PIXI.Sprite(PIXI.Texture.from("Art/tree_" + Math.ceil(Math.random() * 2) + "_no_shadow.png"))
      tree.anchor.set(0.5, 0.95);
      tree.position.set(Math.random() * 32 * 12, -29);
      tree.scale.set(0.5, 0.5);
      area.addChild(tree);
      tree.type = "tree";
    }

    let ground = new PIXI.Sprite(PIXI.Texture.from("Art/launch_ground.png"));
    ground.anchor.set(0,0);
    ground.position.set(0, -32);
    area.addChild(ground);

    for (let i = 0; i < 2; i++) {
      let rock_wall = new PIXI.Container();
      area.addChild(rock_wall);
      for (let m = 1; m < 5; m++) {
        for (let n = 1; n < 16; n++) {
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

  this.spelling_help = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 20, fill: 0xFFFFFF, letterSpacing: 12, align: "left"});
  this.spelling_help.position.set(6, -64);
  this.spelling_help.alpha = 0.4;
  if (this.difficulty_level != "EASY") {
    this.spelling_help.visible = false;
  }
  this.player_area.addChild(this.spelling_help);

  // level and score
  this.level_label = new PIXI.Text("Level", {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.level_label.anchor.set(0.5,0.5);
  this.level_label.position.set(203, 180);
  this.level_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.level_label);

  this.level_text_box = new PIXI.Text(this.level, {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.level_text_box.anchor.set(0.5,0.5);
  this.level_text_box.position.set(203, 215);
  this.level_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.level_text_box);

  this.score_label = new PIXI.Text("Score", {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.score_label.anchor.set(0.5,0.5);
  this.score_label.position.set(720, 180);
  this.score_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.score_label);

  this.score_text_box = new PIXI.Text(this.score, {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.score_text_box.anchor.set(0.5,0.5);
  this.score_text_box.position.set(720, 215);
  this.score_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.score_text_box);

  this.target_letter_label = new PIXI.Text("Target", {
    fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.target_letter_label.anchor.set(0.5,0.5);
  this.target_letter_label.position.set(203, 344);
  this.target_letter_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.target_letter_label);

  this.target_score_text_box = new PIXI.Text(this.enemy_defense.join(","), {
    fontFamily: "Press Start 2P", fontSize: 18, fill: 0x3cb0f3, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.target_score_text_box.anchor.set(0.5,0.5);
  this.target_score_text_box.position.set(203, 377);
  this.target_score_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.target_score_text_box);


  this.wpm_label = new PIXI.Text("WPM", {
    fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.wpm_label.anchor.set(0.5,0.5);
  this.wpm_label.position.set(720, 344);
  this.wpm_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.wpm_label);

  this.wpm_text_box = new PIXI.Text(this.play_clock, {
    fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.wpm_text_box.anchor.set(0.5,0.5);
  this.wpm_text_box.position.set(720, 377);
  this.wpm_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.wpm_text_box);

  this.setEnemyDifficulty(this.level);

  this.enemy_last_action = this.markTime();

  for (var i = 0; i < board_width; i++) {
    this.launchpad.cursors[i].visible = false;
  }

  this.announcement = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.announcement.anchor.set(0.5,0.5);
  this.announcement.position.set(470, 203);
  this.announcement.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.announcement.style.lineHeight = 36;
  screen.addChild(this.announcement);


  this.escape_to_quit = new PIXI.Text("PRESS ESC TO QUIT", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.escape_to_quit.anchor.set(0.5,0.5);
  this.escape_to_quit.position.set(470, 303);
  this.escape_to_quit.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.escape_to_quit.style.lineHeight = 36;
  this.escape_to_quit.visible = false;
  screen.addChild(this.escape_to_quit);

  let player_monitor_mask = new PIXI.Graphics();
  player_monitor_mask.beginFill(0xFF3300);
  player_monitor_mask.drawRect(129, 39, 669, 504);
  player_monitor_mask.endFill();
  this.player_area.mask = player_monitor_mask;

  let enemy_monitor_mask = new PIXI.Graphics();
  enemy_monitor_mask.beginFill(0xFF3300);
  enemy_monitor_mask.drawRect(894, 98, 334, 251);
  enemy_monitor_mask.endFill();
  this.enemy_area.mask = enemy_monitor_mask;

  this.mouse_tester = new PIXI.Container();
  this.mouse_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/mouse.png"));
  this.mouse_sprite.anchor.set(0.5,0.5);
  this.mouse_tester.position.set(1084, 826);
  screen.addChild(this.mouse_tester);
  this.mouse_tester.addChild(this.mouse_sprite);

    // silly mouse buttons
  this.mouse_tester.buttons = [];
  for (let i = 0; i < 3; i++) {
    let mouse_button = new PIXI.Sprite(PIXI.Texture.from("Art/mouse_button.png"));
    mouse_button.anchor.set(0, 0);
    mouse_button.position.set(1022.5 + 39.25*i - 1084, 748 - 826);
    this.mouse_tester.addChild(mouse_button);
    this.mouse_tester.buttons.push(mouse_button);

    mouse_button.interactive = true;
    mouse_button.buttonMode = true;
    mouse_button.button_pressed = false;
    mouse_button.on("pointerdown", function() {
      self.soundEffect("keyboard_click_1", 1.0);
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

  this.drawMouseCord(this.mouse_tester.x, this.mouse_tester.y);

  this.player_palette.setBombs(this.player_bombs);
  this.enemy_palette.setBombs(this.enemy_bombs);

  this.shakers = [screen, this.player_area, this.enemy_area, this.opponent_image];
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
    scale = 0.8;
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
  var screen = this.screens["1p_word_rockets"];

  if (this.difficulty_level == "EASY") {
    this.spelling_help.position.set(this.launchpad.cursors[0].x - 10, -64);
    let word = this.launchpad.word();
    if (word in this.spelling_prediction) {
      this.spelling_help.text = this.spelling_prediction[word].slice(0, board_width - this.launchpad.shift);
    } else {
      this.spelling_help.text = "";
    }
  }
}


Game.prototype.updateDisplayInfo = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  if (this.game_phase == "countdown" && !this.paused) {
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
      if ((this.difficulty_level == "EASY" && (this.level == 13 || this.level == 14))
        || (this.difficulty_level != "EASY" && (this.level == 19 || this.level == 20 || this.level == 21))) {
        this.setMusic("putzen_song");
      } else {
        this.setMusic("action_song_1");
      }
    }
  }

  if (this.game_phase == "active" && this.level_type == "special") {
    let time_remaining = (special_level_duration - (this.timeSince(this.special_level_time))) / 1000;
    let text = this.level_condition.replace("numbers_and_shapes", "numbers\nand shapes").toUpperCase();
    this.announcement.text = "ONLY " + text + "!\n" + Math.ceil(time_remaining).toString();
    if (time_remaining <= 0) {
      this.level_type = "normal";
      this.announcement.text = "";
      this.announcement.style.fontSize = 36;
    }
  }

  let popping_wpm = true;
  while(popping_wpm) {
    if (this.wpm_history.length > 0 && this.timeSince(this.wpm_history[0][1]) > 60000) {
      this.wpm_history.shift();
    } else {
      popping_wpm = false;
    }
  }

  this.calculated_wpm = this.wpm_history.length;
  if (this.display_wpm < this.calculated_wpm) this.display_wpm += 1;
  if (this.display_wpm > this.calculated_wpm) this.display_wpm -= 1;

  this.wpm_text_box.text = this.display_wpm;
  if (this.display_wpm > 35) {
      this.wpm_text_box.style.fill = 0xdb5858;
  } else {
    this.wpm_text_box.style.fill = 0xFFFFFF;
  }
}




Game.prototype.shakeDamage = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  // for (let item of [screen, this.player_area, this.enemy_area]) {
  for (let item of this.shakers) {
    if (item.shake != null) {
      if (item.permanent_x == null) item.permanent_x = item.position.x;
      if (item.permanent_y == null) item.permanent_y = item.position.y;
      item.position.set(item.permanent_x - 3 + Math.random() * 6, item.permanent_y - 3 + Math.random() * 6)
      if (this.timeSince(item.shake) >= 150) {
        item.shake = null;
        item.position.set(item.permanent_x, item.permanent_y)
      }
    }
  }
}


Game.prototype.freeeeeFreeeeeFalling = function(fractional) {
  var self = this;
  var screen = this.screens[this.current_screen];

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

    // TODO: this needs to be 200 for the player areas and 960 for the screen in total.
    if (item.position.y > 960 || item.alpha < 0.04) {
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
  var screen = this.screens["1p_word_rockets"];

  for (let i = 0; i < letter_array.length; i++) {
    let letter = letter_array[i];
    let key = this.player_palette.letters[letter];
    if (key.playable == false && !this.player_defense.includes(letter)) {
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
    this.score += 1;
    this.score_text_box.text = this.score;
  }

  if (this.game_phase == "active" && this.enemy_bombs > 0) {
    let closest_player_rocket_y = -1000;
    let enemy_rocket_count = 0;
    let player_rocket_count = 0;
    for (var i = 0; i < this.rocket_letters.length; i++) {
      var rocket = this.rocket_letters[i];
      if (rocket.player == 1 && rocket.parent == this.enemy_area) {
        player_rocket_count += 1;
        if (rocket.status == "descent" && rocket.y > closest_player_rocket_y) {
          closest_player_rocket_y = rocket.y;
        }
      } else if (rocket.player == 2 && rocket.parent == this.enemy_area) {
        enemy_rocket_count += 1;
      }
    }
    if (player_rocket_count > 15) {
      if (enemy_rocket_count / player_rocket_count < 0.5 || closest_player_rocket_y > -50) {
        this.enemy_bombs -= 1;
        this.explodeArea(this.enemy_area, 1);
        this.enemy_palette.setBombs(this.enemy_bombs);
      }
    }
  }

  if (this.game_phase == "active" && this.level_type == "special") {
    let probability = Math.min(1, (13 + 0.5 * this.level) / 25);
    if (Math.random() < probability) {
      let words = Object.keys(this.special_dictionaries[this.level_condition]);
      let best_word = null;
      for (var i = 0; i < this.enemy_rerolls; i++) {
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


Game.prototype.spawnBomb = function() {
  if (this.timeSince(this.bomb_spawn_last) > this.bomb_spawn_next) {
    console.log("spawning bomb");
    this.bomb_spawn_last = this.markTime();
    this.bomb_spawn_next = bomb_spawn_interval * (0.8 + 0.4 * Math.random());
    let area = this.player_area;
    if (Math.random() > 0.7) area = this.enemy_area;
    let column = Math.floor(Math.random() * board_width);
    let bomb = this.makeBomb(area, 32 * column + 16, -1 * (80 + 32 * Math.floor(Math.random() * 8)), 0.5, 0.5);
    bomb.column = column;
    bomb.status = "available";
    this.bombs.push(bomb);
  }
}


Game.prototype.explodeArea = function(area, player_number) {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];
    if (rocket.player == player_number && rocket.parent == area) {
      if (Math.random() * 100 < 50) {
        this.soundEffect("explosion_1");
      } else {
        this.soundEffect("explosion_2");
      }
      
      rocket.status = "falling";
      rocket.vx = -10 + Math.random() * 20;
      rocket.vy = -4 - Math.random() * 14;
      this.freefalling.push(rocket);

      for (var j = 0; j < 5; j++) {
        let explosion = self.makeExplosion(area, 
        rocket.x - 100 + 200 * Math.random(), rocket.y - 100 + 200 * Math.random(),
        1, 1, function() {area.removeChild(explosion)});
      }
          
      area.shake = this.markTime();
    }
  }
}


Game.prototype.checkEndCondition = function(bypass = false) {
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


    if (enemy_dead === true || player_dead === true || bypass === true) {
      this.announcement.style.fontSize = 36;
      if (player_dead === true || bypass === true) { //regardless of whether enemy is dead
        this.announcement.text = "GAME OVER";
        this.stopMusic();
        this.soundEffect("game_over");
        delay(function() {
          let low_high = self.high_scores["individual"][self.getModeName()][self.difficulty_level.toLowerCase()][9];
          if (low_high == null || low_high.score < self.score) {
            self.initializeHighScore(self.score);
            self.switchScreens("1p_word_rockets", "high_score");
          } else {
            self.initialize1pLobby();
            self.switchScreens("1p_word_rockets", "1p_lobby");
          }
        }, 4000);
      } else if (enemy_dead == true) {
        this.announcement.text = "VICTORY!";
        // this.level += 1;
        // delay(function() {self.initialize1pWordRockets();}, 4000);
        delay(function() {
          self.nextFlow();
        }, 4000);
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
  var screen = this.screens["1p_word_rockets"];

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


Game.prototype.checkBombCollisions = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];
    for (var j = 0; j < this.bombs.length; j++) {
      var bomb = this.bombs[j];
      if (rocket.column == bomb.column && rocket.parent == bomb.parent && bomb.status != "taken") {
        if ((rocket.status == "rocket" && rocket.position.y < bomb.position.y) 
         || (rocket.status == "descent" && rocket.position.y > bomb.position.y))
        {
          // gatcha
          bomb.status = "taken";
          if (rocket.player == 1) {
            this.player_bombs = Math.min(3, this.player_bombs + 1);
            this.player_palette.setBombs(this.player_bombs);
          } else if (rocket.player == 2) {
            this.enemy_bombs = Math.min(3, this.enemy_bombs + 1);
            this.enemy_palette.setBombs(this.enemy_bombs);
          }
        }
      }
    }
  }

  let new_bombs = [];
  for (var i = 0; i < this.bombs.length; i++) {
    var bomb = this.bombs[i];

    if (bomb.status != "taken") {
      new_bombs.push(bomb);
    } else {
      bomb.parent.removeChild(bomb);
    }
  }
  this.bombs = new_bombs;

  }


Game.prototype.checkRocketScreenChange = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

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
  var screen = this.screens["1p_word_rockets"];

  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket_1 = this.rocket_letters[i];
    for (var j = 0; j < this.rocket_letters.length; j++) {
      var rocket_2 = this.rocket_letters[j];
      if (rocket_1.column == rocket_2.column && rocket_1.parent == rocket_2.parent) {
        if ((rocket_1.status == "rocket" || rocket_1.status == "load") && rocket_2.status == "descent"
          && rocket_1.position.y < rocket_2.position.y) {
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
            this.player_area.shake = this.markTime();
          } else if (rocket_1.player == 2) {
            this.enemy_area.shake = this.markTime();
          }
        }
      }
    }
  }
}


Game.prototype.checkRocketAttacks = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

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
                    self.swearing();
                    self.score += Math.floor(Math.pow(rocket.score_value, 1.5));
                    self.score_text_box.text = self.score;
                    self.checkEndCondition();
                  }
                }
              } else {
                if (self.player_palette.letters[disabled_letter].playable === true) {
                  self.player_palette.letters[disabled_letter].disable();
                  self.player_palette.letters[disabled_letter].playable = false;
                  screen.shake = self.markTime();
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
  var screen = this.screens["1p_word_rockets"];

  let new_rocket_letters = [];
  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];

    if (rocket.status != "dead" && rocket.status != "falling") {
      new_rocket_letters.push(rocket);
    }
  }
  this.rocket_letters = new_rocket_letters;
}


Game.prototype.singlePlayerGameUpdate = function(diff) {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  let fractional = diff / (1000/30.0);

  if (this.game_phase == "tutorial") {
    this.tutorial_screen.tutorial_text.hover();
  }

  this.spellingHelp();
  this.updateDisplayInfo();
  this.shakeDamage();
  this.launchpad.checkError();
  this.freeeeeFreeeeeFalling(fractional);
  this.coolHotKeys();

  // Skip the rest if we aren't in active gameplay
  if (this.game_phase != "active" && (this.game_phase != "tutorial" || this.tutorial_number < 5)) {
    return;
  }

  this.enemyAction();  
  this.spawnBomb();
  this.boostRockets(fractional);
  this.checkBombCollisions();
  this.checkRocketScreenChange();
  this.checkRocketCollisions();
  this.checkRocketAttacks();
  this.cleanRockets();
}




