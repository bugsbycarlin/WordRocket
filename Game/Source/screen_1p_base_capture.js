

Game.prototype.initialize1pBaseCapture = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];
  this.clearScreen(screen);

  this.freefalling = [];

  this.resetBase();

  this.base_player_letters = [];
  this.base_enemy_letters = [];

  this.game_phase = "pre_game";

  this.gravity = 3.8;
  this.boost = 0.18;
  this.gentle_drop = 0.05;
  this.gentle_limit = 6;
  this.boost_limit = -25;

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

      self.gameplayKeyDown(letter);
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

  this.player_palette.setBombs(this.player_bombs);
  this.enemy_palette.setBombs(this.enemy_bombs);

  // the player's board
  this.player_area = new PIXI.Container();
  screen.addChild(this.player_area);
  this.player_area.position.set(this.width * 1/2 - 370 - 32,520);

  this.player_live_area = new PIXI.Container();
  screen.addChild(this.player_live_area);
  this.player_live_area.position.set(this.player_area.x, this.player_area.y);
  this.player_live_area.scale.set(this.player_area.scale.x, this.player_area.scale.y);



  // the player's launchpad
  // this.launchpad = new Launchpad(this, this.player_area, 1, 0, 0, 32, 32, false);

  // this.spelling_help = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 20, fill: 0xFFFFFF, letterSpacing: 12, align: "left"});
  // this.spelling_help.position.set(6, -64);
  // this.spelling_help.alpha = 0.4;
  // if (this.difficulty_level != "EASY") {
  //   this.spelling_help.visible = false;
  // }
  // this.player_area.addChild(this.spelling_help);

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

  // var enemy_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  // enemy_mat.width = 32 * board_width;
  // enemy_mat.height = 32 * 14;
  // enemy_mat.anchor.set(0, 1);
  // enemy_mat.position.set(0, -32);
  // enemy_mat.tint = 0x303889;

  //this.enemy_area.addChild(enemy_mat);

  // var enemy_pad_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  // enemy_pad_mat.width = 32 * board_width;
  // enemy_pad_mat.height = 32;
  // enemy_pad_mat.anchor.set(0, 1);
  // enemy_pad_mat.position.set(0, 0);
  // enemy_pad_mat.tint = 0x000000; //0x2c3130;
  // this.enemy_area.addChild(enemy_pad_mat);

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

    area.layers = [];
    for (let i = 0; i < 13; i++) {
      let c = new PIXI.Container();
      area.addChild(c);
      area.layers.push(c);
    }
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

  // this.setEnemyDifficulty(this.level);

  // this.enemy_last_action = this.markTime();

  // this.gravity = 3.8;
  // this.boost = 0.18;
  // this.gentle_drop = 0.05;
  // this.gentle_limit = 6;
  // this.boost_limit = -25;

  // for (var i = 0; i < board_width; i++) {
  //   this.launchpad.cursors[i].visible = false;
  // }

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

  this.base_player_cursor = new PIXI.Sprite(PIXI.Texture.from("Art/american_cursor_draft_3.png"));
  let bpc = this.base_player_cursor;
  bpc.anchor.set(0.5,0.5);
  let corner = corners[0];
  bpc.x_tile = corner < 2 ? 0 : 13;
  bpc.y_tile = corner == 1 || corner == 2 ? 12 : 0;
  bpc.angle = corner == 0 || corner == 1 ? 0 : 180;
  bpc.position.set(32 * bpc.x_tile + 16, -13 * 32 + 32 * bpc.y_tile + 16);
  this.player_area.addChild(bpc);

  this.base_enemy_cursor = new PIXI.Sprite(PIXI.Texture.from("Art/soviet_cursor_draft_3.png"));
  let bec = this.base_enemy_cursor;
  bec.anchor.set(0.5,0.5);
  corner = corners[1];
  bec.x_tile = corner < 2 ? 0 : 13;
  bec.y_tile = corner == 1 || corner == 2 ? 12 : 0;
  bec.angle = corner == 0 || corner == 1 ? 0 : 180;
  bec.position.set(32 * bec.x_tile + 16, -13 * 32 + 32 * bec.y_tile + 16);
  this.player_area.addChild(bec);
}

Game.prototype.baseCaptureKeyDown = function(key) {
  console.log("bananas");
  if (!this.paused) {
    this.pressKey(this.player_palette, key);

    if (key === "ArrowRight") {
      this.baseCaptureMoveCursor("right");
    }

    if (key === "ArrowLeft") {
      this.baseCaptureMoveCursor("left");
    }

    if (key === "ArrowUp") {
      this.baseCaptureMoveCursor("up");
    }

    if (key === "ArrowDown") {
      this.baseCaptureMoveCursor("down");
    }



    for (i in lower_array) {
      if (key === lower_array[i] || key === letter_array[i]) {
        this.baseCaptureAddLetter(letter_array[i]);
      }
    }

    if (key === "Backspace" || key === "Delete") {
      this.baseCaptureDeleteAction();
    }

    

    // if (key === "RShift") {
    //   this.rightShiftAction();
    // }

    // if (key === "LShift") {
    //   this.leftShiftAction();
    // }

    if (key === "Escape") {
      this.baseCaptureClearWord();
    }

    // if (key === " ") {
    //   this.bombAction();
    // }

    if (key === "Enter") {
      this.baseCaptureEnterAction();
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


Game.prototype.baseCaptureClearWord = function() {
  for (let i = 0; i < this.base_player_letters.length; i++) {
    let dead_tile = this.base_player_letters[i];
    // this.player_area.removeChild(dead_tile);
    dead_tile.vx = -10 + Math.random() * 20;
    dead_tile.vy = -4 - Math.random() * 14;
    this.freefalling.push(dead_tile);
  }
  this.base_player_letters = [];
}


Game.prototype.baseCaptureDeleteAction = function() {
  if (this.base_player_letters.length == 0) {
    return;
  }

  let tile = this.base_player_letters.pop();
  tile.vx = -10 + Math.random() * 20;
  tile.vy = -4 - Math.random() * 14;
  this.freefalling.push(tile);

  if (this.base_player_cursor.angle == 180) {
    for (let i = 0; i < this.base_player_letters.length; i++) {
      let old_tile = this.base_player_letters[i];
      old_tile.x_tile += 1;
      let x = 32 * this.base_player_cursor.x_tile + 16 - (this.base_player_letters.length - i) * 32;
      if (this.baseCaptureBoard[this.base_player_cursor.x_tile][this.base_player_cursor.y_tile] != "") {
        x -= 32;
      }

      new TWEEN.Tween(old_tile)
        .to({x: x + 32})
        .duration(150)
        .easing(TWEEN.Easing.Quartic.Out)
        .start();
    }
  } else if (this.base_player_cursor.angle == 180 || this.base_player_cursor.angle == -90) {
    for (let i = 0; i < this.base_player_letters.length; i++) {
      let old_tile = this.base_player_letters[i];
      old_tile.y_tile += 1;
      let y = 16 - 13 * 32 + 32 * this.base_player_cursor.y_tile - (this.base_player_letters.length - i) * 32;
      if (this.baseCaptureBoard[this.base_player_cursor.x_tile][this.base_player_cursor.y_tile] != "") {
        y -= 32;
      }

      new TWEEN.Tween(old_tile)
        .to({y: y + 32})
        .duration(150)
        .easing(TWEEN.Easing.Quartic.Out)
        .start();
    }
  }
}


Game.prototype.baseCaptureAddLetter = function(letter) {

  if (this.base_player_cursor.angle == 180 && this.base_player_letters.length > this.base_player_cursor.x_tile) {
    return;
  }
  if (this.base_player_cursor.angle == -90 && this.base_player_letters.length > this.base_player_cursor.y_tile) {
    return;
  }
  if (this.base_player_cursor.angle == 0 && this.base_player_letters.length + this.base_player_cursor.x_tile >= 14) {
    return;
  }
  if (this.base_player_cursor.angle == 90 && this.base_player_letters.length + this.base_player_cursor.y_tile >= 13) {
    return;
  }

  let tile = game.makePixelatedLetterTile(this.player_area, letter, "white");
  tile.text = letter;
  tile.parent = this.player_area;
  tile.tint = 0x000000;
  if (this.base_player_cursor.angle == 180) {
    tile.position.set(32 * this.base_player_cursor.x_tile + 16, 16 - 13 * 32 + 32 * this.base_player_cursor.y_tile);
    tile.x_tile = this.base_player_cursor.x_tile;
    tile.y_tile = this.base_player_cursor.y_tile;
    if (this.baseCaptureBoard[this.base_player_cursor.x_tile][this.base_player_cursor.y_tile] != "") {
      tile.x_tile -= 1;
      tile.position.x -= 32;
    }

    for (let i = 0; i < this.base_player_letters.length; i++) {
      let old_tile = this.base_player_letters[i];
      old_tile.x_tile -= 1;
      let x = tile.position.x - 32 * (this.base_player_letters.length - i);
      new TWEEN.Tween(old_tile)
        .to({x: x})
        .duration(150)
        .easing(TWEEN.Easing.Quartic.Out)
        .start();
    }
  } else if (this.base_player_cursor.angle == -90) {
    tile.position.set(32 * this.base_player_cursor.x_tile + 16, 16 - 13 * 32 + 32 * this.base_player_cursor.y_tile);
    tile.x_tile = this.base_player_cursor.x_tile;
    tile.y_tile = this.base_player_cursor.y_tile;
    if (this.baseCaptureBoard[this.base_player_cursor.x_tile][this.base_player_cursor.y_tile] != "") {
      tile.y_tile -= 1;
      tile.position.y -= 32;
    }

    for (let i = 0; i < this.base_player_letters.length; i++) {
      let old_tile = this.base_player_letters[i];
      old_tile.y_tile -= 1;
      //let y = 16 - 13 * 32 + 32 * (this.base_player_cursor.y_tile + i + 1 - this.base_player_letters.length);
      let y = tile.position.y - 32 * (this.base_player_letters.length - i);
      new TWEEN.Tween(old_tile)
        .to({y: y})
        .duration(150)
        .easing(TWEEN.Easing.Quartic.Out)
        .start();
    }
  } else if (this.base_player_cursor.angle == 0) {
    tile.position.set(
      32 * this.base_player_cursor.x_tile + 16 + this.base_player_letters.length * 32,
      16 - 13 * 32 + 32 * this.base_player_cursor.y_tile
    );
    tile.x_tile = this.base_player_cursor.x_tile + this.base_player_letters.length;
    tile.y_tile = this.base_player_cursor.y_tile;
    if (this.baseCaptureBoard[this.base_player_cursor.x_tile][this.base_player_cursor.y_tile] != "") {
      tile.x_tile += 1;
      tile.position.x += 32;
    }
  } else if (this.base_player_cursor.angle == 90) {
    tile.position.set(
      32 * this.base_player_cursor.x_tile + 16,
      16 - 13 * 32 + 32 * this.base_player_cursor.y_tile + 32 * this.base_player_letters.length
    );
    tile.x_tile = this.base_player_cursor.x_tile;
    tile.y_tile = this.base_player_cursor.y_tile + this.base_player_letters.length;
    if (this.baseCaptureBoard[this.base_player_cursor.x_tile][this.base_player_cursor.y_tile] != "") {
      tile.y_tile += 1;
      tile.position.y += 32;
    }
  }

  this.base_player_letters.push(tile);

  console.log("wong");
  console.log(this.base_player_letters.length);
}


Game.prototype.baseCaptureEnterAction = function() {
  //let team = (Math.random() > 0.5) ? "american" : "soviet";
  for (let i = 0; i < this.base_player_letters.length; i++) {
    let old_tile = this.base_player_letters[i];

    console.log(old_tile.y_tile);
    console.log(this.player_area.layers);
    let building = this.makeLetterBuilding(this.player_area.layers[old_tile.y_tile], old_tile.x, old_tile.y, old_tile.text, "american");
    this.baseCaptureBoard[old_tile.x_tile][old_tile.y_tile] = building;
  }

  // TO DO: maybe don't delete in this way. maybe just proper delete.
  this.baseCaptureClearWord();
}


Game.prototype.baseCaptureMoveCursor = function(direction) {
  if (this.base_player_letters.length > 0) {
    //return;
    this.baseCaptureClearWord();
  }

  let self = this;
  let bpc = this.base_player_cursor;
  if (direction == "up" && bpc.y_tile > 0 && this.baseCaptureBoard[bpc.x_tile][bpc.y_tile - 1] != "") {
    bpc.y_tile -= 1;
  } else if (direction == "down" && bpc.y_tile < 12 && this.baseCaptureBoard[bpc.x_tile][bpc.y_tile + 1] != "") {
    bpc.y_tile += 1;
  } else if (direction == "left" && bpc.x_tile > 0 && this.baseCaptureBoard[bpc.x_tile - 1][bpc.y_tile] != "") {
    bpc.x_tile -= 1;
  } else if (direction == "right" && bpc.x_tile < 13 && this.baseCaptureBoard[bpc.x_tile + 1][bpc.y_tile] != "") {
    bpc.x_tile += 1;
  }

  // TO DO:
  // make this choose intelligently
  if (direction == "up") {
    bpc.angle = -90;
  } else if (direction == "down") {
    bpc.angle = 90;
  } else if (direction == "left") {
    bpc.angle = 180;
  } else if (direction == "right") {
    bpc.angle = 0;
  }

  new TWEEN.Tween(bpc)
    .to({x: 32 * bpc.x_tile + 16, y: 16 - 13 * 32 + 32 * bpc.y_tile})
    .duration(150)
    .easing(TWEEN.Easing.Quartic.Out)
    .start();
}


Game.prototype.singlePlayerBaseCaptureUpdate = function(diff) {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  let fractional = diff / (1000/30.0);

  // if (this.game_phase == "tutorial") {
  //   this.tutorial_screen.tutorial_text.hover();
  // }

  // this.spellingHelp();
  // this.updateAnnouncement();
  // this.shakeDamage();
  // this.launchpad.checkError();
  this.freeeeeFreeeeeFalling(fractional);
  // this.coolHotKeys();

  // // Skip the rest if we aren't in active gameplay
  // if (this.game_phase != "active" && (this.game_phase != "tutorial" || this.tutorial_number < 5)) {
  //   return;
  // }

  // this.enemyAction();  
  // this.spawnBomb();
  // this.boostRockets(fractional);
  // this.checkBombCollisions();
  // this.checkRocketScreenChange();
  // this.checkRocketCollisions();
  // this.checkRocketAttacks();
  // this.cleanRockets();
}