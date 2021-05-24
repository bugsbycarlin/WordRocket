
var run_clock_when_winning = true;

Game.prototype.initialize1pBaseCapture = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];
  this.clearScreen(screen);

  this.freefalling = [];
  this.played_words = {};

  this.base_letters = [];

  this.base_letters[0] = [];
  this.base_letters[1] = [];

  this.played_squares = [];

  this.game_phase = "pre_game";

  // Enemy speeds
  // 1200, 600 is pretty hard to play against.
  // 1800, 900 is inhuman
  // 3000, 1500 is impossible
  // 900, 450: 3 - 6, and many of the games were *very* close.
  this.enemy_move_speed = 900;
  this.enemy_typing_speed = 450;
  this.enemy_phase = "moving"; // moving, typing

  this.play_clock = 15;
  this.last_play = this.markTime();
  this.speed_play = false;

  this.gravity = 3.8;
  this.boost = 0.18;
  this.gentle_drop = 0.05;
  this.gentle_limit = 6;
  this.boost_limit = -25;

  this.can_play_word = [];
  this.word_to_play = [];
  this.can_play_word[0] = false;
  this.word_to_play[0] = "";
  this.can_play_word[1] = false;
  this.word_to_play[1] = "";

  this.tile_score = [];
  this.tile_score[0] = 0;
  this.tile_score[1] = 0;

  this.resetBase();

  delay(function() {
    self.paused = false;
    self.pause_time = 0;
    self.start_time = self.markTime();
    self.game_phase = "countdown";
    self.soundEffect("countdown");
  }, 1200);
}


Game.prototype.resetBase = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  var background = new PIXI.Sprite(PIXI.Texture.from("Art/game_background.png"));
  background.anchor.set(0, 0);
  screen.addChild(background);

  this.player_palette = this.makeKeyboard({
    player: 1,
    parent: screen, x: 467, y: 807,
    defense: this.player_defense, 
    action: function(letter) {

      if (self.game_phase == "tutorial" && self.tutorial_number == 1) {
        self.tutorial_screen.tutorial_text.text = self.tutorial_1_snide_click_responses[Math.min(6, self.tutorial_1_snide_clicks)];
        self.tutorial_1_snide_clicks += 1
      }

      self.baseCaptureKeyDown(letter);
    }
  });

  this.enemy_palette = this.makeKeyboard({
    player: 2,
    parent: screen, x: 1062.5, y: 472,
    defense: this.enemy_defense, 
    action: function(letter) {
    }
  });
  this.enemy_palette.scale.set(0.3125, 0.3125);

  // the player's board
  this.player_area = new PIXI.Container();
  screen.addChild(this.player_area);
  this.player_area.position.set(this.width * 1/2 - 370 - 32,520);

  this.player_live_area = new PIXI.Container();
  screen.addChild(this.player_live_area);
  this.player_live_area.position.set(this.player_area.x, this.player_area.y);
  this.player_live_area.scale.set(this.player_area.scale.x, this.player_area.scale.y);

  // silly mouse buttons
  for (let i = 0; i < 3; i++) {
    let mouse_button = new PIXI.Sprite(PIXI.Texture.from("Art/mouse_button.png"));
    mouse_button.anchor.set(0, 0);
    mouse_button.position.set(962.5 + 39.25*i, 741);
    screen.addChild(mouse_button);

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

  // the enemy board
  this.enemy_area = new PIXI.Container();
  screen.addChild(this.enemy_area);
  this.enemy_area.position.set(this.width * 1/2 + 325 - 16,340);
  this.enemy_area.scale.set(0.5,0.5);

  this.enemy_live_area = new PIXI.Container();
  screen.addChild(this.enemy_live_area);
  this.enemy_live_area.position.set(this.enemy_area.x, this.enemy_area.y);
  this.enemy_live_area.scale.set(this.enemy_area.scale.x, this.enemy_area.scale.y);

  for (var p = 0; p < 2; p++) {
    let area = this.player_area;
    if (p == 1) area = this.enemy_area;

    // Sky and Ground
    let sky = new PIXI.Sprite(PIXI.Texture.from("Art/base_sky.png"));
    sky.anchor.set(0,1);
    sky.position.set(0, -13 * 32);
    area.addChild(sky);

    let ground = new PIXI.Sprite(PIXI.Texture.from("Art/base_ground.png"));
    ground.anchor.set(0,1);
    ground.position.set(0, 0);
    area.addChild(ground);

    // Rock Wall
    for (var i = 0; i < 2; i++) {
      let rock_wall = new PIXI.Container();
      area.addChild(rock_wall);
      for (var m = 1; m < 4; m++) {
        for (var n = 1; n < 16; n++) {
          let tile = PIXI.Sprite.from(PIXI.Texture.WHITE);
          c = (30 + Math.floor(Math.random() * 30)) / 255.0;
          tile.tint = PIXI.utils.rgb2hex([c,c,c]);
          tile.width = 32;
          tile.height = 32;
          shift = i == 0 ? 0 : (board_width + 5) * 32;
          tile.position.set(shift - 32 * m, 0 - 32 * n);
          rock_wall.addChild(tile);
        }
      }
      rock_wall.cacheAsBitmap = true;
    }

    // Board lines
    for (let i = 0; i < 13; i++) {
      let vertical = PIXI.Sprite.from(PIXI.Texture.WHITE);
      vertical.tint = 0x000000;
      vertical.width = 4;
      vertical.height = 13 * 32 - 4;
      vertical.position.set(32 * (i + 1) - 2, -13 * 32 + 2);
      vertical.alpha = 0.05;
      area.addChild(vertical);

      if (i != 0) {
        let horizontal = PIXI.Sprite.from(PIXI.Texture.WHITE);
        horizontal.tint = 0x000000;
        horizontal.height = 4;
        horizontal.width = 14 * 32 - 4;
        horizontal.position.set(2, 32 * (i - 13) - 2);
        horizontal.alpha = 0.05;
        area.addChild(horizontal);
      }
    }
  }

  this.player_area.layers = [];
  for (let i = 0; i < 13; i++) {
    let c = new PIXI.Container();
    this.player_area.addChild(c);
    this.player_area.layers.push(c);
  }

  this.baseCaptureBoard = [];
  for (let x = 0; x < 14; x++) {
    this.baseCaptureBoard[x] = [];
    for (let y = 0; y < 13; y++) {
      this.baseCaptureBoard[x][y] = "";
    }
  }

  // level and score
  this.level_label = new PIXI.Text("Level", {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.level_label.anchor.set(0.5,0.5);
  this.level_label.position.set(189, 184);
  this.level_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.level_label);

  this.level_text_box = new PIXI.Text(this.level, {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.level_text_box.anchor.set(0.5,0.5);
  this.level_text_box.position.set(189, 217);
  this.level_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.level_text_box);

  this.tile_score_label = new PIXI.Text("Tiles", {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.tile_score_label.anchor.set(0.5,0.5);
  this.tile_score_label.position.set(189, 344);
  this.tile_score_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.tile_score_label);

  this.player_tile_score_text_box = new PIXI.Text(this.tile_score[0], {fontFamily: "Press Start 2P", fontSize: 18, fill: 0x75a3cc, letterSpacing: 3, align: "center"});
  this.player_tile_score_text_box.anchor.set(0.5,0.5);
  this.player_tile_score_text_box.position.set(189, 377);
  this.player_tile_score_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.player_tile_score_text_box);

  this.dash_label = new PIXI.Text("-", {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.dash_label.anchor.set(0.5,0.5);
  this.dash_label.position.set(189, 409);
  this.dash_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.dash_label);

  this.enemy_tile_score_text_box = new PIXI.Text(this.tile_score[1], {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xb1ac90, letterSpacing: 3, align: "center"});
  this.enemy_tile_score_text_box.anchor.set(0.5,0.5);
  this.enemy_tile_score_text_box.position.set(189, 441);
  this.enemy_tile_score_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.enemy_tile_score_text_box);

  this.score_label = new PIXI.Text("Score", {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.score_label.anchor.set(0.5,0.5);
  this.score_label.position.set(735, 184);
  this.score_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.score_label);

  this.score_text_box = new PIXI.Text(this.score, {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.score_text_box.anchor.set(0.5,0.5);
  this.score_text_box.position.set(735, 217);
  this.score_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.score_text_box);

  this.play_clock_label = new PIXI.Text("Clock", {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.play_clock_label.anchor.set(0.5,0.5);
  this.play_clock_label.position.set(735, 344);
  this.play_clock_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.play_clock_label);
  this.play_clock_label.visible = false;

  this.play_clock_text_box = new PIXI.Text(this.play_clock, {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.play_clock_text_box.anchor.set(0.5,0.5);
  this.play_clock_text_box.position.set(735, 377);
  this.play_clock_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.play_clock_text_box);
  this.play_clock_text_box.visible = false;


  var guy = new PIXI.Sprite(PIXI.Texture.from("Art/soviet_guy_draft_2.png"));
  guy.anchor.set(0.5, 0.5);
  guy.scale.set(3,3);
  guy.position.set(1100, 299);
  screen.addChild(guy);

  this.announcement = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0x000000, letterSpacing: 3, align: "center"});
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

  let corners = [0, 1, 2, 3]; // bottom left, top left, top right, bottom right
  shuffleArray(corners);

  this.cursor = [];
  this.cursor[0] = new PIXI.Sprite(PIXI.Texture.from("Art/american_cursor_draft_3.png"));
  let pc = this.cursor[0];
  pc.anchor.set(0.5,0.5);
  let corner = corners[0];
  pc.x_tile = corner < 2 ? 0 : 13;
  pc.y_tile = corner == 1 || corner == 2 ? 12 : 0;
  pc.angle = corner < 2 ? 0 : 180;
  pc.position.set(32 * pc.x_tile + 16, -13 * 32 + 32 * pc.y_tile + 16);
  this.player_area.addChild(pc);
  pc.visible = false;

  this.cursor[1] = new PIXI.Sprite(PIXI.Texture.from("Art/soviet_cursor_draft_3.png"));
  let ec = this.cursor[1];
  ec.anchor.set(0.5,0.5);
  corner = corners[1];
  ec.x_tile = corner < 2 ? 0 : 13;
  ec.y_tile = corner == 1 || corner == 2 ? 12 : 0;
  ec.angle = corner < 2 ? 0 : 180;
  ec.position.set(32 * ec.x_tile + 16, -13 * 32 + 32 * ec.y_tile + 16);
  this.player_area.addChild(ec);
  if (corner == 0) ec.favor = ["down", "right"];
  if (corner == 1) ec.favor = ["up", "right"];
  if (corner == 2) ec.favor = ["up", "left"];
  if (corner == 3) ec.favor = ["down", "left"];
  console.log(ec.favor);
  ec.visible = false;
}

Game.prototype.baseCaptureKeyDown = function(key) {
  let player = 0;
  if (!this.paused) {
    this.pressKey(this.player_palette, key);

    if (key === "ArrowRight") {
      this.baseCaptureMoveCursor("right", player);
    }

    if (key === "ArrowLeft") {
      this.baseCaptureMoveCursor("left", player);
    }

    if (key === "ArrowUp") {
      this.baseCaptureMoveCursor("up", player);
    }

    if (key === "ArrowDown") {
      this.baseCaptureMoveCursor("down", player);
    }

    for (i in lower_array) {
      if (key === lower_array[i] || key === letter_array[i]) {
        this.baseCaptureAddLetter(letter_array[i], player);
      }
    }

    if (key === "Backspace" || key === "Delete") {
      this.baseCaptureDeleteAction(player);
    }

    if (key === "Escape") {
      this.baseCaptureClearWord(player);
    }

    if (key === "Enter") {
      this.baseCaptureEnterAction(player);
    }
  }

  if (key === "Tab" && (this.game_phase == "active" || this.game_phase == "countdown")) {
    if (this.paused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  if (this.paused && key === "Escape") {
    document.getElementById("countdown").hold_up = null;
    this.game_phase = "none";
    this.resume();
    this.initialize1pLobby();
    this.switchScreens("1p_base_capture", "1p_lobby");
  }
}


Game.prototype.baseCaptureClearWord = function(player) {
  if (this.game_phase != "active") {
    return;
  }
  for (let i = 0; i < this.base_letters[player].length; i++) {
    let dead_tile = this.base_letters[player][i];
    // this.player_area.removeChild(dead_tile);
    dead_tile.vx = -10 + Math.random() * 20;
    dead_tile.vy = -4 - Math.random() * 14;
    this.freefalling.push(dead_tile);
  }
  this.base_letters[player] = [];
}


Game.prototype.baseCaptureDeleteAction = function(player) {
  if (this.game_phase != "active") {
    return;
  }
  if (this.base_letters[player].length == 0) {
    return;
  }

  let tile = this.base_letters[player].pop();
  tile.vx = -10 + Math.random() * 20;
  tile.vy = -4 - Math.random() * 14;
  this.freefalling.push(tile);

  let mod = this.baseCaptureBoard[this.cursor[player].x_tile][this.cursor[player].y_tile] != "" ? 1 : 0;

  if (this.cursor[player].angle == 180) {
    for (let i = 0; i < this.base_letters[player].length; i++) {
      let old_tile = this.base_letters[player][i];
      old_tile.x_tile += 1;
      let x = 32 * (this.cursor[player].x_tile - mod) + 16 - (this.base_letters[player].length - i) * 32;

      new TWEEN.Tween(old_tile)
        .to({x: x + 32})
        .duration(150)
        .easing(TWEEN.Easing.Quartic.Out)
        .start();
    }
  } else if (this.cursor[player].angle == 180 || this.cursor[player].angle == -90) {
    for (let i = 0; i < this.base_letters[player].length; i++) {
      let old_tile = this.base_letters[player][i];
      old_tile.y_tile += 1;
      let y = 16 - 13 * 32 + 32 * (this.cursor[player].y_tile - this.base_letters[player].length + i - mod);

      new TWEEN.Tween(old_tile)
        .to({y: y + 32})
        .duration(150)
        .easing(TWEEN.Easing.Quartic.Out)
        .start();
    }
  }

  this.baseCaptureCheckWord(player);
}


Game.prototype.baseCaptureEnterAction = function(player) {
  var self = this;

  if (this.game_phase != "active") {
    return;
  }
  if (this.can_play_word[player] == false) {
    return;
  }

  // Oops, explode the word because it blocks something
  let fail_word = false;
  for (let i = 0; i < this.base_letters[player].length; i++) {
    let old_tile = this.base_letters[player][i];
    if (this.baseCaptureBoard[old_tile.x_tile][old_tile.y_tile] != "") {
      fail_word = true;
    }
  }
  if (fail_word) {
    this.baseCaptureClearWord(player);
    return;
  }

  let team = (player == 0) ? "american" : "soviet";
  for (let i = 0; i < this.base_letters[player].length; i++) {
    let old_tile = this.base_letters[player][i];

    // x and y might be in the middle of moving, so we need to use the fixed values
    let x = 32 * old_tile.x_tile + 16
    let y = -13 * 32 + 32 * old_tile.y_tile + 16
    let building = this.makeLetterBuilding(this.player_area.layers[old_tile.y_tile], x, y, old_tile.text, team);
    building.x_tile = old_tile.x_tile;
    building.y_tile = old_tile.y_tile;
    this.baseCaptureBoard[old_tile.x_tile][old_tile.y_tile] = building;

    this.played_squares.push([old_tile.x_tile, old_tile.y_tile]);
  }

  // Add tile scores
  this.tile_score[player] += this.base_letters[player].length;
  if (player == 1) {
    this.enemy_tile_score_text_box.text = this.tile_score[player];
    // Update the other player's word validity
    this.baseCaptureCheckWord(0);
  } else if (player == 0) {
    this.player_tile_score_text_box.text = this.tile_score[player];

    // Add to player score. Note here that you get credit for the whole word.
    this.score += 10 * this.word_to_play[player].length;
    this.score_text_box.text = this.score;
    // Update the other player's word validity
    this.baseCaptureCheckWord(1);
  }
  if (this.tile_score[player] >= 50 && this.speed_play == false) {
    // Speed it up!
    this.speed_play = true;
    this.announcement.text = "SPEED IT UP!";
    this.last_play = this.markTime();
    delay(function() {
      self.announcement.text = "";
    }, 2000);
  }

  this.last_play = this.markTime();

  this.played_words[this.word_to_play[player]] = 1;

  // TO DO: maybe don't delete in this way. maybe just proper delete.
  this.baseCaptureClearWord(player);
}


Game.prototype.baseCaptureMoveCursor = function(direction, player) {
  if (this.game_phase != "active") {
    return;
  }
  if (this.base_letters[player].length > 0) {
    //return;
    this.baseCaptureClearWord(player);
  }

  let self = this;
  let cursor = this.cursor[player];
  if (direction == "up" && cursor.y_tile > 0 && this.baseCaptureBoard[cursor.x_tile][cursor.y_tile - 1] != "") {
    cursor.y_tile -= 1;
  } else if (direction == "down" && cursor.y_tile < 12 && this.baseCaptureBoard[cursor.x_tile][cursor.y_tile + 1] != "") {
    cursor.y_tile += 1;
  } else if (direction == "left" && cursor.x_tile > 0 && this.baseCaptureBoard[cursor.x_tile - 1][cursor.y_tile] != "") {
    cursor.x_tile -= 1;
  } else if (direction == "right" && cursor.x_tile < 13 && this.baseCaptureBoard[cursor.x_tile + 1][cursor.y_tile] != "") {
    cursor.x_tile += 1;
  }

  // TO DO:
  // make this choose intelligently
  if (direction == "up") {
    cursor.angle = -90;
  } else if (direction == "down") {
    cursor.angle = 90;
  } else if (direction == "left") {
    cursor.angle = 180;
  } else if (direction == "right") {
    cursor.angle = 0;
  }

  new TWEEN.Tween(cursor)
    .to({x: 32 * cursor.x_tile + 16, y: 16 - 13 * 32 + 32 * cursor.y_tile})
    .duration(150)
    .easing(TWEEN.Easing.Quartic.Out)
    .start();
}


Game.prototype.baseCaptureJumpCursor = function(player, x, y, direction = -1) {
  if (this.game_phase != "active") {
    return;
  }
  if (this.base_letters[player].length > 0) {
    //return;
    this.baseCaptureClearWord(player);
  }

  let self = this;
  let cursor = this.cursor[player];
  cursor.x_tile = x;
  cursor.y_tile = y;

  if (direction == -1) {
    direction = ["up", "down", "left", "right"][Math.floor(Math.random() * 4)];
  }
  if (direction == "up") {
    cursor.angle = -90;
  } else if (direction == "down") {
    cursor.angle = 90;
  } else if (direction == "left") {
    cursor.angle = 180;
  } else if (direction == "right") {
    cursor.angle = 0;
  }

  new TWEEN.Tween(cursor)
    .to({x: 32 * cursor.x_tile + 16, y: 16 - 13 * 32 + 32 * cursor.y_tile})
    .duration(150)
    .easing(TWEEN.Easing.Quartic.Out)
    .start();
}


Game.prototype.baseCaptureAddLetter = function(letter, player) {
  if (this.game_phase != "active") {
    return;
  }
  let bpc = this.cursor[player];
  let letters = this.base_letters[player];
  let mod = this.baseCaptureBoard[bpc.x_tile][bpc.y_tile] != "" ? 1 : 0;

  // Bail out if we'd hit the edges of the board
  if (bpc.angle == 180 && letters.length + mod > bpc.x_tile) {
    return;
  }
  if (bpc.angle == -90 && letters.length + mod > bpc.y_tile) {
    return;
  }
  if (bpc.angle == 0 && letters.length + bpc.x_tile + mod >= 14) {
    return;
  }
  if (bpc.angle == 90 && letters.length + bpc.y_tile + mod >= 13) {
    return;
  }

  // Bail out if we'd hit another tile
  if (bpc.angle == 0 && this.baseCaptureBoard[bpc.x_tile + letters.length + mod][bpc.y_tile] != "") {
    return;
  }
  if (bpc.angle == 180 && this.baseCaptureBoard[bpc.x_tile - letters.length - mod][bpc.y_tile] != "") {
    return;
  }
  if (bpc.angle == -90 && this.baseCaptureBoard[bpc.x_tile][bpc.y_tile - letters.length - mod] != "") {
    return;
  }
  if (bpc.angle == 90 && this.baseCaptureBoard[bpc.x_tile][bpc.y_tile + letters.length + mod] != "") {
    return;
  }

  // Okay, we're good. Make the tile
  let tile = game.makePixelatedLetterTile(this.player_area, letter, "white");
  tile.text = letter;
  tile.parent = this.player_area;
  tile.tint = 0x000000;

  // Place the tile and adjust existing tiles
  if (bpc.angle == 0) {
    tile.position.set(
      32 * (bpc.x_tile + mod) + 16 + letters.length * 32,
      16 - 13 * 32 + 32 * bpc.y_tile
    );
    tile.x_tile = bpc.x_tile + letters.length + mod;
    tile.y_tile = bpc.y_tile;
  } else if (bpc.angle == 90) {
    tile.position.set(
      32 * bpc.x_tile + 16,
      16 - 13 * 32 + 32 * (bpc.y_tile + letters.length + mod)
    );
    tile.x_tile = bpc.x_tile;
    tile.y_tile = bpc.y_tile + letters.length + mod;
  } else if (bpc.angle == 180) {
    tile.position.set(
      32 * (bpc.x_tile - mod) + 16,
      16 - 13 * 32 + 32 * bpc.y_tile
    );
    tile.x_tile = bpc.x_tile - mod;
    tile.y_tile = bpc.y_tile;

    for (let i = 0; i < letters.length; i++) {
      let old_tile = letters[i];
      old_tile.x_tile -= 1;
      let x = tile.position.x - 32 * (letters.length - i);
      new TWEEN.Tween(old_tile)
        .to({x: x})
        .duration(150)
        .easing(TWEEN.Easing.Quartic.Out)
        .start();
    }
  } else if (bpc.angle == -90) {
    tile.position.set(
      32 * bpc.x_tile + 16,
      16 - 13 * 32 + 32 * (bpc.y_tile - mod));
    tile.x_tile = bpc.x_tile;
    tile.y_tile = bpc.y_tile - mod;

    for (let i = 0; i < letters.length; i++) {
      let old_tile = letters[i];
      old_tile.y_tile -= 1;
      let y = tile.position.y - 32 * (letters.length - i);
      new TWEEN.Tween(old_tile)
        .to({y: y})
        .duration(150)
        .easing(TWEEN.Easing.Quartic.Out)
        .start();
    }
  }

  // Add the tile to the list of tiles.
  letters.push(tile);

  // Now check the word and color it accordingly.
  this.baseCaptureCheckWord(player);
}


Game.prototype.baseCaptureCheckWord = function(player) {
  this.can_play_word[player] = false;
  this.word_to_play[player] = "";
  let letters = this.base_letters[player];
  let bpc = this.cursor[player]

  if (letters.length == 0) {
    return;
  }

  // Check the word itself
  let word = this.baseCaptureConstructWord(letters, bpc.angle);

  this.word_to_play[player] = word;
  this.can_play_word[player] = this.baseCaptureLegalWord(word);

  // Check perpendicular words
  let perpendicular = bpc.angle == 180 || bpc.angle == 0 ? 90 : 0;
  for (let i = 0; i < letters.length; i++) {
    let perpendicular_word = this.baseCaptureConstructWord([letters[i]], perpendicular);
    if (perpendicular_word.length >= 2) {
      if (!this.baseCaptureLegalWord(perpendicular_word)) {
        console.log("fails on the perpendicular");
        this.can_play_word[player] = false;
      }
    }
  }

  if (this.can_play_word[player]) {
    for (let i = 0; i < letters.length; i++) {
      letter = letters[i];
      letter.tint = 0x000000;
    }
  } else {
    for (let i = 0; i < letters.length; i++) {
      letter = letters[i];
      letter.tint = 0xdb5858;
    }
  }
}



Game.prototype.baseCaptureConstructWord = function(word_list, angle) {
  // Get the word. It's everything in this.base_player_letters plus everything touching it in either direction.
  let word = [];
  for (let i = 0; i < word_list.length; i++) {
    letter = word_list[i];
    word.push(letter.text);
  }

  // Add horizontal stuff
  if (angle == 180 || angle == 0) {
    let x = word_list[0].x_tile - 1;
    let y = word_list[0].y_tile;
    let more_letters = true;
    while (x >= 0 && more_letters) {
      if (this.baseCaptureBoard[x][y] != "") { 
        word.unshift(this.baseCaptureBoard[x][y].text);
        x -= 1;
      } else {
        more_letters = false;
      }
    }

    x = word_list[word_list.length - 1].x_tile + 1;
    more_letters = true;
    while (x < 14 && more_letters) {
      if (this.baseCaptureBoard[x][y] != "") { 
        word.push(this.baseCaptureBoard[x][y].text);
        x += 1;
      } else {
        more_letters = false;
      }
    }
  } else if (angle == 90 || angle == -90) {
    // Or add vertical stuff
    let x = word_list[0].x_tile;
    let y = word_list[0].y_tile - 1;
    let more_letters = true;
    while (y >= 0 && more_letters) {
      if (this.baseCaptureBoard[x][y] != "") { 
        word.unshift(this.baseCaptureBoard[x][y].text);
        y -= 1;
      } else {
        more_letters = false;
      }
    }

    y = word_list[word_list.length - 1].y_tile + 1;
    more_letters = true;
    while (y < 13 && more_letters) {
      if (this.baseCaptureBoard[x][y] != "") { 
        word.push(this.baseCaptureBoard[x][y].text);
        y += 1;
      } else {
        more_letters = false;
      }
    }
  }

  word = word.join("");

  return word;
}


Game.prototype.baseCaptureLegalWord = function(word) {
  if (word.length < 2) {
    return false;
  }

  if (!(word in this.legal_words)) {
    return false;
  }
  
  if (word in this.played_words) {
    return false;
  }

  return true;
}


Game.prototype.baseCaptureUpdateCountdown = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  if (this.game_phase == "countdown" && !this.paused) {
    let time_remaining = (2400 - (this.timeSince(this.start_time))) / 800;
    this.announcement.text = Math.ceil(time_remaining).toString();
    if (time_remaining <= 0) {
      
      this.game_phase = "active";
      this.last_play = this.markTime();

      this.setMusic("action_song_2");

      this.announcement.text = "GO";
      delay(function() {self.announcement.text = "";}, 1600);

      for (var i = 0; i < board_width; i++) {
        this.cursor[0].visible = true;
        this.cursor[1].visible = true;
      }
    }
  }
}


Game.prototype.baseCaptureUpdatePlayClock = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  if (this.game_phase == "active" && !this.paused && this.speed_play == true) {
    this.play_clock_label.visible = true;
    this.play_clock_text_box.visible = true;
    let time_remaining = (this.play_clock*1000 - (this.timeSince(this.last_play))) / 1000;
    this.play_clock_text_box.text = Math.ceil(time_remaining).toString();
    // Green: 0x71d07d
    // Yellow: 0xf3db3c
    // Red: 0xdb5858
    if (time_remaining > 10) {
      this.play_clock_text_box.style.fill = 0x71d07d;
    } else if (time_remaining > 5) {
      this.play_clock_text_box.style.fill = 0xf3db3c;
    } else {
      this.play_clock_text_box.style.fill = 0xdb5858;
    }
    if (time_remaining <= 0) {
      this.game_phase = "gameover";

      this.announcement.style.fontSize = 36;

      if (this.tile_score[0] < this.tile_score[1]) {
        this.announcement.text = "GAME OVER";
        this.stopMusic();
        this.soundEffect("game_over");
        delay(function() {
          let low_high = self.high_scores["individual"][self.difficulty_level.toLowerCase()][9];
          if (low_high == null || low_high.score < self.score) {
            self.initializeHighScore(self.score);
            self.switchScreens("1p_base_capture", "high_score");
          } else {
            self.initialize1pLobby();
            self.switchScreens("1p_base_capture", "1p_lobby");
          }
        }, 4000);
      } else {
        this.announcement.text = "VICTORY!";
        this.level += 1;
        delay(function() {self.initialize1pBaseCapture();}, 4000);
      }

    }
  } else {
    this.play_clock_label.visible = false;
    this.play_clock_text_box.visible = false;
  }
}


Game.prototype.baseCaptureInBounds = function(x, y) {
  return (x >= 0 && x < 14 && y >= 0 && y < 13);
}


Game.prototype.baseCaptureEnemyAction = function() {
  if (this.game_phase != "active") {
    return;
  }

  ////////////
  // STRATEGY
  //
  // First, if the cursor is over an empty spot, it's the beginning of the game,
  // the AI should immediately play a big word.
  //
  // Otherwise, the AI should move. Most of the time, it should move in the same
  // direction as the previous move. Some of the time, it should change direction.
  // A tiny amount of the time, it should leap around the board.
  //
  // If the AI is winning by 10 points and has more than 50, it should keep moving but mostly
  // not play, in order to run out the clock.
  //
  // After moving, the AI will be facing in a particular direction.
  // It should now attempt a word.
  // If the immediate next tile is filled or a wall, do nothing.
  // If the immediate preceding tile is filled, but there is some space ahead,
  // The candidate word should be drawn from the predictive spelling dictionary,
  // plus the suffixes "s", "er", "ers", and "ed".
  // If the immediate preceding tile is not filled, and a short distance ahead there
  // is another filled tile, the candidate word should be drawn from the bridge word
  // dictionary. If the bridge word dictionary fails, or there is not a filled tile
  // ahead, or there is a wall ahead, the AI should attempt to select a word of the
  // appropriate size. (For example, if there is clear space for 10 tiles to the wall,
  // the AI should target roughly 11 character words. However, if there is a wall just
  // one space away, the AI should look for 2 character words.)
  // 


  if (this.enemy_phase == "moving") {
    if(this.timeSince(this.enemy_last_action) <= 60000/this.enemy_move_speed) {
      return;
    } else {
      this.enemy_last_action = this.timeSince(0.2 * (60000/this.enemy_move_speed) - 0.4 * Math.random() * 60000/this.enemy_move_speed);
    }

    let tiles = null;
    let word = null;
    if (this.baseCaptureBoard[this.cursor[1].x_tile][this.cursor[1].y_tile] == "") {
      // We're at the beginning of the game. Make a big word right away.
      let word_size = 5 + Math.floor(Math.random() * 7);
      let word_list = this.enemy_words[word_size];
      word = word_list[Math.floor(Math.random() * word_list.length)];

      tiles = this.baseCaptureWordList(word, this.cursor[1].x_tile, this.cursor[1].y_tile, this.cursor[1].angle)
    } else {
      // Move, probably in the same direction as before, with a tiny chance of jumping around the board
      // and a larger chance of just changing direction.
      let dice = Math.random();
      if (dice <= 0.7) {
        let direction = "right";
        if (this.cursor[1].angle == 180) direction = "left";
        if (this.cursor[1].angle == 90) direction = "down";
        if (this.cursor[1].angle == -90) direction = "up";
        this.baseCaptureMoveCursor(direction, 1);
      } else if (dice <= 0.75) {
        // Jump to another occupied board tile
        let spot = this.played_squares[Math.floor(Math.random() * this.played_squares.length)];
        this.baseCaptureJumpCursor(1, spot[0], spot[1]);
      } else {
        let move_set = [];
        if (this.cursor[1].x_tile > 0) move_set.push("left");
        if (this.cursor[1].x_tile < 13) move_set.push("right");
        if (this.cursor[1].y_tile > 0) move_set.push("up");
        if (this.cursor[1].y_tile < 12) move_set.push("down");
        move_set.push(this.cursor[1].favor[0]);
        move_set.push(this.cursor[1].favor[1]);
        let direction = move_set[Math.floor(Math.random() * move_set.length)];
        this.baseCaptureMoveCursor(direction, 1);
      }

      let angle = this.cursor[1].angle;
      let x_tile = this.cursor[1].x_tile;
      let y_tile = this.cursor[1].y_tile;
      let main_letter = this.baseCaptureBoard[x_tile][y_tile].text;
      let x_adj = 0;
      let y_adj = 0;

      if (angle == 0) x_adj = 1;
      if (angle == 180) x_adj = -1;
      if (angle == 90) y_adj = 1;
      if (angle == -90) y_adj = -1;

      let forward_room = 0;
      let m = 1;
      let terminus_is_letter = false;
      while (m > 0 && this.baseCaptureInBounds(x_tile + m * x_adj, y_tile + m * y_adj)) {
        if (this.baseCaptureBoard[x_tile + m * x_adj][y_tile + m * y_adj] == "") {
          forward_room += 1;
          m += 1;
        } else {
          terminus_is_letter = true;
          m = -100;
        }
      }

      let common_case = false;

      //console.log("Room is " + forward_room + ", terminus_is_letter is " + terminus_is_letter);
      // if (terminus_is_letter && forward_room > 0 && forward_room <= 5) {
      //   let a = !this.baseCaptureInBounds(x_tile - x_adj, y_tile - y_adj);
      //   let b = this.baseCaptureBoard[x_tile - x_adj][y_tile - y_adj] == "";
      //   let c = !this.baseCaptureInBounds(x_tile + (forward_room+1) * x_adj, y_tile + (forward_room+1) * y_adj);
      //   let d = this.baseCaptureBoard[x_tile + (forward_room+1) * x_adj][y_tile + (forward_room+1) * y_adj];
      //   // console.log(forward_room + "," + a + ","
      //   //   + b + ","
      //   //   + c + ","
      //   //   + d)
      //   console.log(d);
      // }
      
      // Now we need to determine what kind of move we can make.
      if (!this.baseCaptureInBounds(x_tile + x_adj, y_tile + y_adj)
        || this.baseCaptureBoard[x_tile + x_adj][y_tile + y_adj] != "") {
        // Here, the tile ahead is taken or we are at a wall. Do nothing.
      } else if (this.baseCaptureInBounds(x_tile - x_adj, y_tile - y_adj)
        && this.baseCaptureBoard[x_tile - x_adj][y_tile - y_adj] != "") {
        // Since the tile opposite us is taken, we're either playing a prefix (180 or -90) or a suffix (0 or 90).
        existing_word = this.baseCaptureConstructWord([this.baseCaptureBoard[x_tile][y_tile]], angle);

        if (angle == 180 || angle == -90) {
          // Here we could play a prefix. Try prefixes.
          let prefixes = ["RE", "PRE", "DE", "ANTI", "BE", "DIS",
            "EXTRA", "IN", "INTRA", "INTER", "OUT", "BI", "TRI", 
            "OVER", "POST", "PRO", "SUB", "TRANS", "UN", "UNDER"];
          shuffleArray(prefixes);
          for (let i = 0; i < prefixes.length; i++) {
            let prefix = prefixes[i];
            if ((prefix + existing_word) in this.legal_words) {
              word = prefix;
              tiles = this.baseCaptureWordList(word, x_tile + x_adj, y_tile + y_adj, angle)
              if (tiles != null) {
                break;
              }
            } 
          }
        } else {
          // Here we could play a suffix or an autocomplete.
          let suffixes = ["ERS", "ING", "INGLY", "ESQUE", "ION", "FUL", "ISH",
            "INGS", "EST", "IEST", "IER", "NESS", "MENT", "TY", "ITY", "SHIP",
            "IVE", "LESS", "Y", "S", "ES", "ER", "ED", "EN", ];
          shuffleArray(suffixes);
          for (let i = 0; i < suffixes.length; i++) {
            let suffix = suffixes[i];
            if ((existing_word + suffix) in this.legal_words) {
              word = suffix;
              tiles = this.baseCaptureWordList(word, x_tile + x_adj, y_tile + y_adj, angle)
              if (tiles != null) {
                break;
              }
            } 
          }

          if (tiles == null) {
            if (existing_word in this.long_spelling_prediction) {
              word = this.long_spelling_prediction[existing_word].slice(existing_word.length);

              if (word.length > 0) {
                tiles = this.baseCaptureWordList(word, x_tile + x_adj, y_tile + y_adj, angle);
              }
            }
          }
        }
      } else if (terminus_is_letter && forward_room > 0 && forward_room <= 5
        && (!this.baseCaptureInBounds(x_tile - x_adj, y_tile - y_adj) || this.baseCaptureBoard[x_tile - x_adj][y_tile - y_adj] == "")
        && (!this.baseCaptureInBounds(x_tile + (forward_room+2) * x_adj, y_tile + (forward_room+2) * y_adj) 
              || this.baseCaptureBoard[x_tile + (forward_room+2) * x_adj][y_tile + (forward_room+2) * y_adj] == "")) {
        // There is a gap of five letters or less!
        // We can try for a bridge word. Note that if this fails, we still want to hit the common case.
        console.log("BRIDGE WORD!");


        let bridge_letter = this.baseCaptureBoard[x_tile + (forward_room+1) * x_adj][y_tile + (forward_room+1) * y_adj].text;
        let desired_length = forward_room + 2;
        let d = this.bridge_word_dictionaries[main_letter + bridge_letter];
        // NOTE: because of angles, it may be necessary to swap the main and bridge letters.
        if (angle == 180 || angle == -90) d = this.bridge_word_dictionaries[bridge_letter + main_letter];
        //console.log(main_letter + bridge_letter);
        //console.log(d);
        let candidate_word = null;
        // Not every pair has words in it! This was an actual bug I thankfully triggered pretty quickly.
        if (d.length > 0) {
          for (let z = 0; z < 20; z++) {
            let w = d[Math.floor(Math.random() * d.length)];
            if (w.length == desired_length) {
              candidate_word = w;
              break;
            }
          }
        }

        if (candidate_word != null) {
          word = candidate_word.slice(1,-1);
          tiles = this.baseCaptureWordList(word, x_tile + x_adj, y_tile + y_adj, angle)
        } else {
          console.log("I failed to form a bridge word");
          common_case = true;
        }
      } else {
        // hit the common case.
        common_case = true;
      }

      if (common_case) {
        // This is the last and most common case. We're free to play ahead a certain distance, and will use it.

        let d = null;
        let tries = 20;
        if (forward_room >= 3) {
          if (angle == 0 || angle == 90) {
            d = this.starting_dictionaries[main_letter];
          } else {
            d = this.ending_dictionaries[main_letter];
          }
        } else {
          tries = 40;
          if (angle == 0 || angle == 90) {
            console.log("SHORT START");
            d = this.short_starting_dictionaries[main_letter];
          } else {
            console.log("SHORT END");
            d = this.short_ending_dictionaries[main_letter];
          }
        }

        for (let z = 0; z < tries; z++) {
          let w = d[Math.floor(Math.random() * d.length)];
          if (w.length < forward_room + 1) {
            if (angle == 0 || angle == 90) word = w.slice(1);
            if (angle == 180 || angle == -90) word = w.slice(0,-1);
            tiles = this.baseCaptureWordList(word, x_tile + x_adj, y_tile + y_adj, angle)
            if (forward_room < 4) {
              console.log("FOUND A SHORT");
              console.log(w);
            }
            break;
          }
        }
      }
    }


    // Now play what we've got

    if (tiles != null) {
      if(this.tile_score[1] >= 50 && this.tile_score[1] - this.tile_score[0] >= 10) {
        // Probably best not to play. Run the clock and let the player beat themselves.
        if (run_clock_when_winning) {
          if (Math.random() < 0.7) {
            return;
          }
        }
      }

      let angle = this.cursor[1].angle;
      let full_word = this.baseCaptureConstructWord(tiles, angle);

      this.can_play_word[1] = this.baseCaptureLegalWord(full_word);

      // Check perpendicular words
      let perpendicular = angle == 180 || angle == 0 ? 90 : 0;
      for (let i = 0; i < tiles.length; i++) {
        let perpendicular_word = this.baseCaptureConstructWord([tiles[i]], perpendicular);
        if (perpendicular_word.length >= 2) {
          if (!this.baseCaptureLegalWord(perpendicular_word)) {
            this.can_play_word[1] = false;
          }
        }
      }

      if (this.can_play_word[1] == true) {
        this.enemy_phase = "typing";
        this.enemy_typing_mark = 0;

        this.enemy_word = "";
        for (let i = 0; i < tiles.length; i++) {
          this.enemy_word += tiles[i].text;
        }
      }
    }

  } else if (this.enemy_phase == "typing") {
    if(this.timeSince(this.enemy_last_action) <= 60000/this.enemy_typing_speed) {
      return;
    } else {
      this.enemy_last_action = this.timeSince(0.2 * (60000/this.enemy_typing_speed) - 0.4 * Math.random() * 60000/this.enemy_typing_speed);
    }

    if (this.enemy_typing_mark < this.enemy_word.length) {
      this.baseCaptureAddLetter(this.enemy_word[this.enemy_typing_mark], 1);
      this.enemy_typing_mark += 1;
    } else {
      this.baseCaptureEnterAction(1);
      this.enemy_phase = "moving";
      this.enemy_typing_mark = 0;
      this.can_play_word[1] = false;
      this.enemy_word = "";
    }
  }
}


Game.prototype.baseCaptureWordList = function(word, x_tile, y_tile, angle) {
  let tiles = [];
  for (let i = 0; i < word.length; i++) {
    let x = 0;
    let y = 0;
    if (angle == 0) {
      x = x_tile + i;
      y = y_tile;
    }
    if (angle == 180) {
      x = x_tile + i + 1 - word.length;
      y = y_tile;
    }
    if (angle == 90) {
      x = x_tile;
      y = y_tile + i;
    }
    if (angle == -90) {
      x = x_tile;
      y = y_tile + i + 1 - word.length;
    }
    if (x < 0 || y < 0 || x > 13 || y > 12) {
      // bad list
      return null;
    } else {
      tiles.push({
        x_tile: x,
        y_tile: y,
        text: word[i]
      });
    }
  }
  return tiles;
}


Game.prototype.singlePlayerBaseCaptureUpdate = function(diff) {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  let fractional = diff / (1000/30.0);

  // if (this.game_phase == "tutorial") {
  //   this.tutorial_screen.tutorial_text.hover();
  // }

  // this.spellingHelp();
  this.baseCaptureUpdateCountdown();
  // this.shakeDamage();
  // this.launchpad.checkError();
  this.freeeeeFreeeeeFalling(fractional);
  // this.coolHotKeys();

  // Skip the rest if we aren't in active gameplay
  if (this.game_phase != "active") {
    return;
  }

  this.baseCaptureUpdatePlayClock();
  this.baseCaptureEnemyAction();  
  // this.spawnBomb();
  // this.boostRockets(fractional);
  // this.checkBombCollisions();
  // this.checkRocketScreenChange();
  // this.checkRocketCollisions();
  // this.checkRocketAttacks();
  // this.cleanRockets();
}