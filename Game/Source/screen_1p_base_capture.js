

Game.prototype.initialize1pBaseCapture = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];
  this.clearScreen(screen);

  this.freefalling = [];
  this.played_words = {};

  this.resetBase();

  this.base_letters = [];

  this.base_letters[0] = [];
  this.base_letters[1] = [];

  this.game_phase = "pre_game";

  this.enemy_play_speed = 1200;
  this.enemy_guess_power = 20;
  this.enemy_phase = "moving"; // moving, typing

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

  delay(function() {
    self.paused = false;
    self.pause_time = 0;
    self.start_time = self.markTime();
    self.game_phase = "countdown";
    self.soundEffect("countdown");
    self.setMusic("action_song_2");
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
  this.level_label.position.set(189, 180);
  this.level_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.level_label);

  this.level_text_box = new PIXI.Text(this.level, {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.level_text_box.anchor.set(0.5,0.5);
  this.level_text_box.position.set(189, 215);
  this.level_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.level_text_box);

  this.score_label = new PIXI.Text("Score", {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.score_label.anchor.set(0.5,0.5);
  this.score_label.position.set(735, 180);
  this.score_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.score_label);

  this.score_text_box = new PIXI.Text(this.score, {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.score_text_box.anchor.set(0.5,0.5);
  this.score_text_box.position.set(735, 215);
  this.score_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.score_text_box);

  var guy = new PIXI.Sprite(PIXI.Texture.from("Art/soviet_guy_draft_2.png"));
  guy.anchor.set(0.5, 0.5);
  guy.scale.set(3,3);
  guy.position.set(1100, 299);
  screen.addChild(guy);

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

  let corners = [0, 1, 2, 3];
  shuffleArray(corners);

  this.cursor = [];
  this.cursor[0] = new PIXI.Sprite(PIXI.Texture.from("Art/american_cursor_draft_3.png"));
  let pc = this.cursor[0];
  pc.anchor.set(0.5,0.5);
  let corner = corners[0];
  pc.x_tile = corner < 2 ? 0 : 13;
  pc.y_tile = corner == 1 || corner == 2 ? 12 : 0;
  pc.angle = corner == 0 || corner == 1 ? 0 : 180;
  pc.position.set(32 * pc.x_tile + 16, -13 * 32 + 32 * pc.y_tile + 16);
  this.player_area.addChild(pc);
  pc.visible = false;

  this.cursor[1] = new PIXI.Sprite(PIXI.Texture.from("Art/soviet_cursor_draft_3.png"));
  let ec = this.cursor[1];
  ec.anchor.set(0.5,0.5);
  corner = corners[1];
  ec.x_tile = corner < 2 ? 0 : 13;
  ec.y_tile = corner == 1 || corner == 2 ? 12 : 0;
  ec.angle = corner == 0 || corner == 1 ? 0 : 180;
  ec.position.set(32 * ec.x_tile + 16, -13 * 32 + 32 * ec.y_tile + 16);
  this.player_area.addChild(ec);
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
  if (this.game_phase != "active") {
    return;
  }
  if (this.can_play_word[player] == false) {
    return;
  }

  let team = (player == 0) ? "american" : "soviet";
  for (let i = 0; i < this.base_letters[player].length; i++) {
    let old_tile = this.base_letters[player][i];

    console.log(old_tile.y_tile);
    console.log(this.player_area.layers);
    let building = this.makeLetterBuilding(this.player_area.layers[old_tile.y_tile], old_tile.x, old_tile.y, old_tile.text, team);
    this.baseCaptureBoard[old_tile.x_tile][old_tile.y_tile] = building;
  }

  this.played_words[this.word_to_play] = 1;

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


Game.prototype.baseCaptureUpdateAnnouncement = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  if (this.game_phase == "countdown" && !this.paused) {
    let time_remaining = (2400 - (this.timeSince(this.start_time))) / 800;
    this.announcement.text = Math.ceil(time_remaining).toString();
    if (time_remaining <= 0) {
      
      this.game_phase = "active";

      this.announcement.text = "GO";
      delay(function() {self.announcement.text = "";}, 1600);

      for (var i = 0; i < board_width; i++) {
        this.cursor[0].visible = true;
        this.cursor[1].visible = true;
      }
      
    }
  }
}


Game.prototype.baseCaptureEnemyAction = function() {
  if(this.timeSince(this.enemy_last_action) <= 60000/this.enemy_play_speed) {
    return;
  } else {
    // console.log(this.timeSince(this.enemy_last_action));
    this.enemy_last_action = this.timeSince(0.2 * (60000/this.enemy_play_speed) - 0.4 * Math.random() * 60000/this.enemy_play_speed);
  }

  if (this.enemy_phase == "moving") {
    // Make a random move
    let move_set = [];
    if (this.cursor[1].x_tile > 0) move_set.push("left");
    if (this.cursor[1].x_tile < 13) move_set.push("right");
    if (this.cursor[1].y_tile > 0) move_set.push("up");
    if (this.cursor[1].y_tile < 12) move_set.push("down");
    let direction = move_set[Math.floor(Math.random() * (move_set.length + 1))];
    this.baseCaptureMoveCursor(direction, 1);

    // Check if we're on a letter tile
    let main_letter = "";
    if (this.baseCaptureBoard[this.cursor[1].x_tile][this.cursor[1].y_tile] != "") {
      main_letter = this.baseCaptureBoard[this.cursor[1].x_tile][this.cursor[1].y_tile].text;
    }

    let cursor_angle = this.cursor[1].angle;

    // Search for a word whose beginning or end matches the current letter
    // (or any word if there's no current letter)
    // TO DO: test that it doesn't violate space constraints!!!!!!
    let candidate_word = "";
    for (let i = 0; i < this.enemy_guess_power; i++) {
      let word_size = 2 + Math.floor(Math.random() * 6);
      let word_list = this.enemy_words[word_size];
      let word = word_list[Math.floor(Math.random() * word_list.length)];

      if (main_letter == "") {
        candidate_word = word;
      } else if (cursor_angle == 0 || cursor_angle == 90) {
        if (word[0] == main_letter) {
          candidate_word = word;
        }
      } else if (cursor_angle == 180 || cursor_angle == -90) {
        if (word[word.length - 1] == main_letter) {
          candidate_word = word;
        }
      }
    }

    // If we have a word,
    if (candidate_word != "") {
      let start_x = this.cursor[1].x_tile;
      let start_y = this.cursor[1].y_tile;
      
      // Build a tile collection for it so we can test that collection.
      let tiles = [];
      let bad_tiles = false;
      for (let i = 0; i < candidate_word.length; i++) {
        let x = 0;
        let y = 0;
        if (cursor_angle == 0) {
          x = this.cursor[1].x_tile + i;
          y = this.cursor[1].y_tile;
        }
        if (cursor_angle == 180) {
          x = this.cursor[1].x_tile + i + 1 - candidate_word.length;
          y = this.cursor[1].y_tile;
        }
        if (cursor_angle == 90) {
          x = this.cursor[1].x_tile;
          y = this.cursor[1].y_tile + i;
        }
        if (cursor_angle == -90) {
          x = this.cursor[1].x_tile;
          y = this.cursor[1].y_tile + i + 1 - candidate_word.length;
        }
        
        let do_it = true;
        if (main_letter != "" && i == 0 && (cursor_angle == 0 || cursor_angle == 90)) do_it = false;
        if (main_letter != "" && i == candidate_word.length - 1 && (cursor_angle == 180 || cursor_angle == -90)) do_it = false;
        if (do_it) {
          tiles.push({
            x_tile: x,
            y_tile: y,
            text: candidate_word[i]
          });
        }
        if (x < 0 || y < 0 || x > 13 || y > 12) bad_tiles = true;
      }

      if (!bad_tiles) {
        let word = this.baseCaptureConstructWord(tiles, cursor_angle);

        this.can_play_word[1] = this.baseCaptureLegalWord(word);

        // Check perpendicular words
        let perpendicular = cursor_angle == 180 || cursor_angle == 0 ? 90 : 0;
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
    }
  } else if (this.enemy_phase == "typing") {
    //console.log(this.word_to_play[1]);
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


Game.prototype.singlePlayerBaseCaptureUpdate = function(diff) {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  let fractional = diff / (1000/30.0);

  // if (this.game_phase == "tutorial") {
  //   this.tutorial_screen.tutorial_text.hover();
  // }

  // this.spellingHelp();
  this.baseCaptureUpdateAnnouncement();
  // this.shakeDamage();
  // this.launchpad.checkError();
  this.freeeeeFreeeeeFalling(fractional);
  // this.coolHotKeys();

  // Skip the rest if we aren't in active gameplay
  if (this.game_phase != "active") {
    return;
  }

  this.baseCaptureEnemyAction();  
  // this.spawnBomb();
  // this.boostRockets(fractional);
  // this.checkBombCollisions();
  // this.checkRocketScreenChange();
  // this.checkRocketCollisions();
  // this.checkRocketAttacks();
  // this.cleanRockets();
}