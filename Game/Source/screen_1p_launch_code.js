

Game.prototype.initialize1pLaunchCode = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];
  this.clearScreen(screen);

  this.freefalling = [];
  this.shakers = [];

  this.game_phase = "pre_game";


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

  var far_background = new PIXI.Sprite(PIXI.Texture.from("Art/game_far_background.png"));
  far_background.anchor.set(0, 0);
  screen.addChild(far_background);

  // the enemy board
  this.enemy_area = new PIXI.Container();
  screen.addChild(this.enemy_area);
  this.enemy_area.position.set(this.width * 1/2 + 325 - 16,340);
  this.enemy_area.scale.set(0.5,0.5);

  this.enemy_live_area = new PIXI.Container();
  screen.addChild(this.enemy_live_area);
  //this.enemy_live_area.position.set(this.enemy_area.x, this.enemy_area.y);
  //this.enemy_live_area.scale.set(this.enemy_area.scale.x, this.enemy_area.scale.y);

  this.enemy_palette = this.makeKeyboard({
    player: 2,
    parent: screen, x: 1062.5, y: 472,
    defense: this.enemy_defense, 
    action: function(letter) {
    }
  });
  this.enemy_palette.scale.set(0.3125, 0.3125);

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

      self.baseCaptureKeyDown(letter);
    }
  });

  // the player's board
  this.player_area = new PIXI.Container();
  screen.addChild(this.player_area);
  this.player_area.position.set(129, 39);

  this.player_live_area = new PIXI.Container();
  screen.addChild(this.player_live_area);
  this.player_live_area.position.set(this.player_area.x, this.player_area.y);
  this.player_live_area.scale.set(this.player_area.scale.x, this.player_area.scale.y);

  let area = this.player_area;

  let player_monitor_mask = new PIXI.Graphics();
  player_monitor_mask.beginFill(0xFF3300);
  player_monitor_mask.drawRect(129, 39, 669, 504);
  player_monitor_mask.endFill();
  this.player_area.mask = player_monitor_mask;


  // Test bands for the level
  let top_level_band = PIXI.Sprite.from(PIXI.Texture.WHITE);
  top_level_band.tint = 0x282b2f;
  top_level_band.width = 669;
  top_level_band.height = 200;
  top_level_band.anchor.set(0, 0)
  top_level_band.position.set(0, 0);
  area.addChild(top_level_band);

  let top_level = new PIXI.Sprite(PIXI.Texture.from("Art/Level/launch_code_level_sketch_2.png"));
  top_level.anchor.set(0, 0)
  top_level.position.set(0, 0);
  top_level.scale.set(2,2);
  area.addChild(top_level);  

  let bottom_level_band = PIXI.Sprite.from(PIXI.Texture.WHITE);
  bottom_level_band.tint = 0x33373d;
  bottom_level_band.width = 669;
  bottom_level_band.height = 200;
  bottom_level_band.anchor.set(0, 0)
  bottom_level_band.position.set(0, 200);
  area.addChild(bottom_level_band);

  let bottom_level = new PIXI.Sprite(PIXI.Texture.from("Art/Level/launch_code_level_sketch_2.png"));
  bottom_level.anchor.set(0, 0)
  bottom_level.position.set(0, 200);
  bottom_level.scale.set(2,2);
  area.addChild(bottom_level);  

  let writing_band = PIXI.Sprite.from(PIXI.Texture.WHITE);
  writing_band.tint = 0x282b2f;
  writing_band.width = 669;
  writing_band.height = 100;
  writing_band.anchor.set(0, 0)
  writing_band.position.set(0, 404);
  area.addChild(writing_band);


  this.run_prompt = new PIXI.Text("RUN: alphabetical order is best...", {fontFamily: "Press Start 2P", fontSize: 20, fill: 0x000000, letterSpacing: 3, align: "left"});
  this.run_prompt.anchor.set(0,0);
  this.run_prompt.position.set(10, 404 + 10);
  area.addChild(this.run_prompt);

  this.jump_prompt = new PIXI.Text("JMP: seven purple towers swayed in the...", {fontFamily: "Press Start 2P", fontSize: 20, fill: 0x000000, letterSpacing: 3, align: "left"});
  this.jump_prompt.anchor.set(0,0);
  this.jump_prompt.position.set(10, 404 + 40);
  area.addChild(this.jump_prompt);

  // this.hit_prompt = new PIXI.Text("HIT: never have I seen so many different...", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0x000000, letterSpacing: 3, align: "left"});
  // this.hit_prompt.anchor.set(0,0);
  // this.hit_prompt.position.set(10, 404 + 50);
  // area.addChild(this.hit_prompt);

  this.act_prompt = new PIXI.Text("ACT: harriman paused and thought for a moment...", {fontFamily: "Press Start 2P", fontSize: 20, fill: 0x000000, letterSpacing: 3, align: "left"});
  this.act_prompt.anchor.set(0,0);
  this.act_prompt.position.set(10, 404 + 70);
  area.addChild(this.act_prompt);

  
  let test_guard = this.makeRunner(area, "grey", 1.5, 268 + 100, 194);
  test_guard.scale.set(-1.5, 1.5);
  test_guard.setState("combat_fall")

  this.player_runner = this.makeRunner(area, "blue", 1.5, 268, 194 + 200);
  this.enemy_runner = this.makeRunner(area, "red", 1.5, 268, 194);



  this.announcement = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0x000000, letterSpacing: 3, align: "center"});
  this.announcement.anchor.set(0.5,0.5);
  this.announcement.position.set(470, 78);
  this.announcement.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.announcement.style.lineHeight = 36;
  screen.addChild(this.announcement);


  var screen_cover_background = new PIXI.Sprite(PIXI.Texture.from("Art/game_screen_cover_background.png"));
  screen_cover_background.anchor.set(0, 0);
  screen.addChild(screen_cover_background);


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


Game.prototype.launchCodeGameOver = function(key) {
  let self = this;
  this.game_phase = "gameover";

  this.announcement.text = "GAME OVER";
  this.stopMusic();
  this.soundEffect("game_over");
  delay(function() {
    self.nextFlow();
  }, 500);
}


Game.prototype.cycleRunnerPoses = function(runner) {
  let items = runner.states;
  const currentIndex = items.indexOf(runner.current_state);
  const nextIndex = (currentIndex + 1) % items.length;
  runner.setState(items[nextIndex]);
}


Game.prototype.launchCodeKeyDown = function(key) {
  let player = 0;
  if (!this.paused) {

    //this.pressKey(this.player_palette, key);

    if (key === "a") {
      this.cycleRunnerPoses(this.player_runner);
    }


    if (key === "m") {
      this.cycleRunnerPoses(this.enemy_runner);
    }

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

      // this.setMusic("action_song_3");

      this.announcement.text = "GO";
      delay(function() {self.announcement.text = "";}, 1600);

      // delay(function() {
      //   self.launchCodeGameOver();
      // }, 2000);
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