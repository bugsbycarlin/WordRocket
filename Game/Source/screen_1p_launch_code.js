

Game.prototype.initialize1pLaunchCode = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];
  this.clearScreen(screen);

  this.freefalling = [];
  this.shakers = [];

  this.game_phase = "pre_game";

  // Enemy speeds
  // 1200, 600 is pretty hard to play against.
  // 1800, 900 is inhuman
  // 3000, 1500 is impossible
  // 900, 450: 3 - 6, and many of the games were *very* close.
  // 500, 250: pretty fun
  // 100, 100: nice and easy.
  // this.enemy_move_speed = 900 + 100 * this.level;
  // this.enemy_typing_speed = 400 + 50 * this.level;
  // this.enemy_phase = "moving"; // moving, typing

  this.resetRace();

  delay(function() {
    self.paused = false;
    self.pause_time = 0;
    self.start_time = self.markTime();
    self.game_phase = "countdown";
    self.soundEffect("countdown");
  }, 1200);
}


Game.prototype.resetRace = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];

  let placeholder = new PIXI.Text("LAUNCH CODE", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
  placeholder.scaleMode = PIXI.SCALE_MODES.NEAREST;
  placeholder.anchor.set(0.5,0.5);
  placeholder.position.set(this.width / 2, this.height - 320);
  screen.addChild(placeholder);

  placeholder.interactive = true;
  placeholder.buttonMode = true;
  placeholder.on("pointerdown", function() {
    self.game_phase = "gameover";

    self.announcement.text = "GAME OVER";
    self.stopMusic();
    //this.soundEffect("game_over");
    // delay(function() {
    //   self.initialize1pLobby();
    //   self.switchScreens("1p_launch_code", "1p_lobby");
    // }, 500);
    delay(function() {
      self.nextFlow();
    }, 500);
  });

  this.mouse_cord = new PIXI.Container();
  screen.addChild(this.mouse_cord);

  this.announcement = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0x000000, letterSpacing: 3, align: "center"});
  this.announcement.anchor.set(0.5,0.5);
  this.announcement.position.set(470, 78);
  this.announcement.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.announcement.style.lineHeight = 36;
  screen.addChild(this.announcement);

  this.mouse_tester = new PIXI.Container();
  this.mouse_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/mouse.png"));
  this.mouse_sprite.anchor.set(0.5,0.5);
  this.mouse_tester.position.set(1084, 826);
  screen.addChild(this.mouse_tester);
  this.mouse_tester.addChild(this.mouse_sprite);

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
}


Game.prototype.launchCodeKeyDown = function(key) {
  let player = 0;
  if (!this.paused) {
    this.pressKey(this.player_palette, key);

    // if (key === "ArrowRight") {
    //   this.baseCaptureMoveCursor("right", player);
    // }

    // if (key === "ArrowLeft") {
    //   this.baseCaptureMoveCursor("left", player);
    // }

    // if (key === "ArrowUp") {
    //   this.baseCaptureMoveCursor("up", player);
    // }

    // if (key === "ArrowDown") {
    //   this.baseCaptureMoveCursor("down", player);
    // }

    // for (i in lower_array) {
    //   if (key === lower_array[i] || key === letter_array[i]) {
    //     if(this.player_palette.letters[letter_array[i]].playable === true) {
    //       this.baseCaptureAddLetter(letter_array[i], player);
    //     }
    //   }
    // }

    // if (key === "Backspace" || key === "Delete") {
    //   this.baseCaptureDeleteAction(player);
    // }

    // if (key === "Escape") {
    //   this.baseCaptureClearWord(player);
    // }

    // if (key === "Enter") {
    //   this.baseCaptureEnterAction(player);
    // }
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
    this.switchScreens("1p_launch_code", "1p_lobby");
  }
}


Game.prototype.launchCodeUpdateDisplayInfo = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];

  if (this.game_phase == "countdown" && !this.paused) {
    let time_remaining = (2400 - (this.timeSince(this.start_time))) / 800;
    this.announcement.text = Math.ceil(time_remaining).toString();
    if (time_remaining <= 0) {
      
      this.game_phase = "active";
      this.last_play = this.markTime();

      // TO DO: different song
      this.setMusic("action_song_3");

      this.announcement.text = "GO";
      delay(function() {self.announcement.text = "";}, 1600);
    }
  }
}


Game.prototype.singlePlayerLaunchCodeUpdate = function(diff) {
  var self = this;
  var screen = this.screens["1p_launch_code"];

  let fractional = diff / (1000/30.0);

  // if (this.game_phase == "tutorial") {
  //   this.tutorial_screen.tutorial_text.hover();
  // }

  this.launchCodeUpdateDisplayInfo();
  this.shakeDamage();
  this.freeeeeFreeeeeFalling(fractional);

  // Skip the rest if we aren't in active gameplay
  if (this.game_phase != "active") {
    return;
  }

  // this.baseCaptureEnemyAction();  
}