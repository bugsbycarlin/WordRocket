
run_speeds = {
  0: {
    type: "static",
    animation_speed: 0.1,
    ground_speed: 0,
  },
  1: {
    type: "slow_run",
    animation_speed: 0.30,
    ground_speed: 2.4 * 0.75,
  },
  2: {
    type: "slow_run",
    animation_speed: 0.40,
    ground_speed: 2.4,
  },
  3: {
    type: "slow_run",
    animation_speed: 0.50,
    ground_speed: 2.4 * 1.25,
  },
  4: {
    type: "fast_run",
    animation_speed: 0.30,
    ground_speed: 5.77 * 0.75,
  },
  5: {
    type: "fast_run",
    animation_speed: 0.40,
    ground_speed: 5.77,
  },
  6: {
    type: "fast_run",
    animation_speed: 0.50,
    ground_speed: 5.77 * 1.25,
  },
  7: {
    type: "fast_run",
    animation_speed: 0.50,
    ground_speed: 5.77 * 1.25,
  },
}

/////
// Run speed notes
  // this seems to be right for slow run at 0.4 animationSpeed
  //this.run_ground_speed = 2.4;

  // fast run seems like ground 7 and animationSpeed 0.5 is okay.
  // same ground 5.77 and animationSpeed 0.4.
  // 0.31, 4.52.

  // let's say every word you add increases the dude's speed by 1
  // on a scale in [slow 0.3, slow 0.4, slow 0.5, fast 0.3, fast 0.4, fast 0.5]
  // and there's a decay that's faster at higher difficulties.
  // let's default it to decay once every 2 seconds.
  // also, the change can only happen on the foot marks, so it's not so jarring.
/////

Game.prototype.initialize1pLaunchCode = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];
  this.clearScreen(screen);

  this.freefalling = [];
  this.shakers = [];

  // this.game_phase = "pre_game";

  this.resetRace();

  delay(function() {
    self.paused = false;
    self.pause_time = 0;
    self.start_time = self.markTime();
    self.game_phase = "countdown";
    //self.soundEffect("countdown");
    self.setMusic("action_song_3");

    self.player_runner.speed = 6;
    self.changeRunnerSpeed();
    self.player_runner.last_speed_change = self.markTime();
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

  this.player_level = new PIXI.Container();
  this.player_level.position.set(0, 100);
  this.player_level.ground_speed = 0;
  area.addChild(this.player_level);

  this.launchCodeMakeLevel(this.player_level, 75);

  let writing_band = PIXI.Sprite.from(PIXI.Texture.WHITE);
  writing_band.tint = 0x43474d;
  // writing_band.tint = 0xFFFFFF;
  writing_band.width = 669;
  writing_band.height = 60;
  writing_band.anchor.set(0, 0)
  writing_band.position.set(0, 444);
  area.addChild(writing_band);

  shuffleArray(this.typing_prompts);
  this.run_prompt = this.makePrompt(area, 10, 474, this.typing_prompts[0]);
  this.run_prompt.visible = false;

  this.player_runner = this.makeRunner(area, "blue", 1.5, 268, 194 + 150);
  this.enemy_runner = this.makeRunner(area, "red", 1.5, 268, 194);
  this.enemy_runner.visible = false;

  this.player_runner.lx = 0;
  this.player_runner.ly = 0;
  this.enemy_runner.lx = 0;
  this.enemy_runner.ly = 0;

  this.player_runner.speed = 0;
  this.enemy_runner.speed = 0;

  this.player_runner.base_height = 0;

  this.player_runner.speed = 6;
  this.changeRunnerSpeed();
  this.player_runner.last_speed_change = this.markTime();

  // this.player_runner.setState("damage");

  // Add event listeners to change the run speed.
  // We do it this way so there isn't a sudden frame jump.
  // this.player_runner.sprites["static"].onFrameChange = function() { self.changeRunnerSpeed(); }
  this.player_runner.sprites["slow_run"].onLoop = function() { self.changeRunnerSpeed(); }
  this.player_runner.sprites["fast_run"].onLoop = function() { self.changeRunnerSpeed(); }

  this.intro_overlay = new PIXI.Container();
  this.intro_overlay.position.set(0, 0);
  area.addChild(this.intro_overlay);
  this.intro_overlay.background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  this.intro_overlay.background.tint = 0x000000;
  this.intro_overlay.background.width = 1280*3;
  this.intro_overlay.background.height = 960;
  this.intro_overlay.background.position.set(0,-100);
  this.intro_overlay.addChild(this.intro_overlay.background);

  this.intro_overlay.rope = new PIXI.Sprite(PIXI.Texture.from("Art/complete_rope_v4.png"));
  this.intro_overlay.rope.position.set(268 + 510, 100);
  this.intro_overlay.addChild(this.intro_overlay.rope);
  let rope_mask = new PIXI.Graphics();
  rope_mask.beginFill(0xFF3300);
  rope_mask.drawRect(394, 0, 500, 800);
  rope_mask.endFill();
  this.intro_overlay.rope.mask = rope_mask;

  var screen_cover_background = new PIXI.Sprite(PIXI.Texture.from("Art/game_screen_cover_background.png"));
  screen_cover_background.anchor.set(0, 0);
  screen.addChild(screen_cover_background);

  this.announcement = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.announcement.anchor.set(0.5,0.5);
  this.announcement.position.set(470, 78);
  this.announcement.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.announcement.style.lineHeight = 36;

  screen.addChild(this.announcement);

  this.instructions_text = new PIXI.Text("Type to keep running! \nUp to jump! Enter to punch!", {
    fontFamily: "Press Start 2P", fontSize: 14, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.instructions_text.anchor.set(0.5,0.5);
  this.instructions_text.position.set(470, 510);
  this.instructions_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(this.instructions_text);

  this.escape_to_quit = new PIXI.Text("PRESS ESC TO QUIT", {
    fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.escape_to_quit.anchor.set(0.5,0.5);
  this.escape_to_quit.position.set(470, 303);
  this.escape_to_quit.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.escape_to_quit.style.lineHeight = 36;
  this.escape_to_quit.visible = false;
  screen.addChild(this.escape_to_quit);




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

  this.launch_code_typing = "";

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


Game.prototype.changeRunnerSpeed = function() {
  let self = this;

  let speed_marker = Math.ceil(this.player_runner.speed);
  let speed_option = run_speeds[speed_marker];

  this.player_runner.setState(speed_option.type);
  this.player_runner.sprites[this.player_runner.current_state].animationSpeed = speed_option.animation_speed;
  this.player_level.ground_speed = speed_option.ground_speed;

  //this.player_runner.last_speed_change = this.markTime();
}


Game.prototype.tryJumping = function() {
  let self = this;

  if (this.player_runner.next_state != null
    && this.player_runner.next_state == "jump"
    && this.player_runner.current_state != "jump"
    && this.player_runner.current_state != "combat_punch") {
    this.launchCodeSetTyping("");
    this.player_runner.last_state = this.player_runner.current_state;
    this.player_runner.setState("jump");
    this.player_runner.old_base_height = this.player_runner.base_height;
    //this.player_runner.speed = Math.max(this.player_runner.speed, 3);
    //this.player_level.ground_speed = Math.max(this.player_level.ground_speed, run_speeds[3].ground_speed);
    this.player_runner.speed = Math.max(this.player_runner.speed, 4);
    this.player_level.ground_speed = Math.max(this.player_level.ground_speed, run_speeds[4].ground_speed);
    this.player_runner.sprites["jump"].onLoop = function() {
      self.player_runner.setState(self.player_runner.last_state);
      if (self.player_runner.last_state == "static") {
        self.player_runner.speed = 2;
        self.player_level.ground_speed = run_speeds[2].ground_speed;
        self.player_runner.setState("slow_run");
      }
      self.player_runner.next_state = null;
      self.player_runner.last_state = null;
    }
    this.player_runner.sprites["jump"].onFrameChange = function() {
      if (this.currentFrame >= 2 && this.currentFrame <= 27) {
        let t = this.currentFrame - 2;
        self.player_runner.ly = 0.8 * ((t - 12)*(t - 12) - 144) + self.player_runner.old_base_height;
        if (self.player_runner.ly > self.player_runner.base_height) {
          console.log(self.player_runner.ly);
          console.log(self.player_runner.base_height);
          self.player_runner.ly = self.player_runner.base_height;
          self.player_runner.sprites["jump"].onLoop(); // end the jump
        }
      } else {
        self.player_runner.ly = self.player_runner.base_height;
        console.log("Setting final height: " + self.player_runner.base_height);
      }
    }
  }
}


Game.prototype.tryPunching = function() {
  let self = this;

  // the first fist extends about 95 pixels. the second fist is about 75.

  if (this.player_runner.next_state != null
    && this.player_runner.next_state == "combat_punch"
    && this.player_runner.current_state != "combat_punch"
    && this.player_runner.current_state != "jump") {
    this.launchCodeSetTyping("");
    this.player_runner.setState("combat_punch");
    let last_speed = this.player_runner.speed;
    this.player_runner.speed = 0;
    this.player_level.ground_speed = run_speeds[0].ground_speed;
    this.player_runner.sprites["combat_punch"].onLoop = function() {
      //self.player_runner.setState(self.player_runner.last_state);
      self.player_runner.speed = Math.min(2, last_speed);
      self.changeRunnerSpeed();
      self.player_runner.next_state = null;
      self.player_runner.last_state = null;
    }
  }
}


Game.prototype.tryReverseJumping = function() {
  let self = this;


  if (this.player_runner.current_state != "damage") {
    this.player_runner.setState("damage");
    this.player_runner.old_base_height = this.player_runner.base_height;
    this.player_runner.speed = -1 * 6;
    this.player_level.ground_speed = -1 * run_speeds[6].ground_speed;

    this.player_runner.sprites["damage"].onLoop = function() {
      self.player_runner.setState("static");
      self.player_runner.speed = 0;
      self.player_level.ground_speed = 0;
      self.player_runner.ly = self.player_runner.old_base_height;
    }
    this.player_runner.sprites["damage"].onFrameChange = function() {
      let t = this.currentFrame;
      self.player_runner.ly = 2.5 * ((t - 4)*(t - 4) - 16) + self.player_runner.old_base_height;
      console.log(self.player_runner.ly);
    }
  }
}



Game.prototype.launchCodeSetTyping = function(new_typing) {
  this.launch_code_typing = new_typing;

  this.run_prompt.typing = this.launch_code_typing;
  this.run_prompt.checkCorrectness();
  this.run_prompt.setPosition();
}


Game.prototype.launchCodeAdvance = function() {
  this.launch_code_typing = "";

  this.run_prompt.checkCorrectness();

  if (this.run_prompt.typing.length > 0) {
    let complete = this.run_prompt.complete;
    //this.run_label.tint = complete == true ? 0x3cb0f3 : 0xdb5858;
    //this.run_label.position.y = this.run_label.fixed_y + 2;
    //this.run_label.press_count = 6;
    this.run_prompt.advance();
    if (complete) {
      this.player_runner.speed += 0.5;
      if (this.player_runner.speed >= 7) {
        this.player_runner.speed = 7;
      }
      this.player_runner.last_speed_change = this.markTime();
      if (this.player_runner.current_state == "static") this.changeRunnerSpeed();
    } else {
      this.player_runner.speed -= 1.5;
      if (this.player_runner.speed <= 0) {
        this.player_runner.speed = 0;
        this.changeRunnerSpeed(); // immediately stop if we get to zero
      }
    }
  }
}


Game.prototype.launchCodeKeyDown = function(key) {
  let player = 0;
  if (!this.paused && this.game_phase == "active") {

    this.pressKey(this.player_palette, key);

    // if (key === "a") {
    //   this.cycleRunnerPoses(this.player_runner);
    // }

    // if (key === "ArrowRight") {
    //   this.run_ground_speed *= 1.05;
    //   console.log("Animation: " + this.player_runner.sprites[this.player_runner.current_state].animationSpeed);
    //   console.log("Ground: " + this.run_ground_speed);
    // }

    // if (key === "ArrowLeft") {
    //   this.run_ground_speed /= 1.05;
    //   console.log("Animation: " + this.player_runner.sprites[this.player_runner.current_state].animationSpeed);
    //   console.log("Ground: " + this.run_ground_speed);
    // }

    if (key === "ArrowUp") {
      console.log("I will try jumping");
      this.player_runner.next_state = "jump";
      this.tryJumping();
    }

    if (key === "Enter") {
      this.player_runner.next_state = "combat_punch";
      this.tryPunching();
    }

    // if (key === "ArrowDown") {
    //   this.player_runner.sprites[this.player_runner.current_state].animationSpeed /= 1.05;
    //   console.log("Animation: " + this.player_runner.sprites[this.player_runner.current_state].animationSpeed);
    //   console.log("Ground: " + this.run_ground_speed);
    // }

    for (i in lower_array) {
      if (key === lower_array[i]) {
        this.launchCodeSetTyping(this.launch_code_typing + lower_array[i]);
      } else if (key === letter_array[i]) {
        this.launchCodeSetTyping(this.launch_code_typing + letter_array[i]);
      }
      // for uppercase version
      // if (key === lower_array[i] || key === letter_array[i]) {
      //   this.launchCodeSetTyping(this.launch_code_typing + letter_array[i]);
      // }
    }

    if (key === "'") {
      this.launchCodeSetTyping(this.launch_code_typing + "'");
    }

    if (key === " ") {
      this.launchCodeAdvance();
    }

    if (key === "Backspace" || key === "Delete") {
      if (this.launch_code_typing.length > 0) {
        let new_typing = this.launch_code_typing.slice(0, this.launch_code_typing.length - 1)
        this.launchCodeSetTyping(new_typing);
      }
    }

    if (key === "Escape") {
      this.launchCodeSetTyping("");
    }

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

      this.instructions_text.visible = false;
      this.run_prompt.visible = true;

      this.announcement.style.fill = 0xFFFFFF;
      this.announcement.text = "GO";
      delay(function() {self.announcement.text = "";}, 1600);

      new TWEEN.Tween(this.intro_overlay.background)
        .to({alpha: 0})
        .duration(150)
        // .easing(TWEEN.Easing.Quartic.Out)
        .start();
    }
  }
}


// Game.prototype.unpressButtons = function() {
//   if (this.run_label.press_count > 0) {
//     this.run_label.press_count -= 1;
//     if (this.run_label.press_count == 0) {
//       this.run_label.position.y = this.run_label.fixed_y;
//       this.run_label.tint = 0xFFFFFF;
//     }
//   }
//   if (this.jump_label.press_count > 0) {
//     this.jump_label.press_count -= 1;
//     if (this.jump_label.press_count == 0) {
//       this.jump_label.position.y = this.jump_label.fixed_y;
//       this.jump_label.tint = 0xFFFFFF;
//     }
//   }
//   if (this.act_label.press_count > 0) {
//     this.act_label.press_count -= 1;
//     if (this.act_label.press_count == 0) {
//       this.act_label.position.y = this.act_label.fixed_y;
//       this.act_label.tint = 0xFFFFFF;
//     }
//   }
// }


// chunk_types = ["box", "door", "flat", "rise"];
// chunk_types = ["box", "door", "flat", "rise", "flat", "guard"];
chunk_types = ["flat", "box", "door", "guard", "rise", "flat"];
Game.prototype.launchCodeMakeLevel = function(level_parent, size) {
  level_parent.items = [];
  let height = 50;
  for (let i = 0; i < size; i++) {
    // size of each chunk is 167*2 = 334.
    let chunk_type = "flat";
    if (i < 6 || i % 2 == 1 || i > size - 5) {
      // flat is good.
    } else {
      shuffleArray(chunk_types);
      chunk_type = chunk_types[0];
    }
    let chunk = new PIXI.Sprite(PIXI.Texture.from("Art/Level/level_" + (chunk_type == "guard" ? "flat" : chunk_type) + ".png"));
    chunk.scale.set(2, 2);
    chunk.scaleMode = PIXI.SCALE_MODES.NEAREST;
    chunk.position.set(334 * i, height);
    chunk.level_height = height;
    chunk.chunk_type = chunk_type;
    level_parent.addChild(chunk);
    level_parent.items.push(chunk);

    if (chunk_type == "guard") {
      let guard = this.makeRunner(level_parent, "grey", 1.5, 334 * i + 167, 144);
      guard.scale.set(-1.5, 1.5);
      guard.setState("combat_ready")
      chunk.guard = guard;
    }

    if (chunk_type == "rise") height -= 100;
  }
}


Game.prototype.launchCodeMoveAndCheckRunner = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];

  let last_x = this.player_runner.lx + 268;

  this.player_runner.lx += this.player_level.ground_speed;
  this.player_level.position.set(-1 * this.player_runner.lx, 100 - this.player_runner.ly);
  this.intro_overlay.position.set(-1 * this.player_runner.lx, 100 - this.player_runner.ly);

  let player_x = this.player_runner.lx + 268;



  for (let i = 0; i < this.player_level.items.length; i++) {
    let chunk = this.player_level.items[i];
    if (player_x > chunk.position.x && player_x < chunk.position.x + 334) {
      chunk.tint = 0x44FF44;
      //this.player_runner.base_height = chunk.level_height;
    } else {
      chunk.tint = 0xFFFFFF;
    }

    if (chunk.chunk_type == "box" 
      && last_x <= chunk.position.x + 167 && player_x >= chunk.position.x + 167
      && (this.player_runner.current_state != "jump" || this.player_runner.ly > chunk.position.y - 70)) {
      this.tryReverseJumping();
    }

    if (chunk.chunk_type == "rise" 
      && last_x <= chunk.position.x + 167 && player_x >= chunk.position.x + 167) {
      if (this.player_runner.current_state != "jump" || this.player_runner.ly > chunk.position.y - 100) {
        this.tryReverseJumping();
      } else if (this.player_runner.current_state == "jump") {
        this.player_runner.base_height = chunk.level_height - 100;
        console.log("adjusting base height: " + this.player_runner.base_height);
      } 
    }
      
  }
}


Game.prototype.launchCodeMakeEmbers = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];

  if (this.timeSince(this.start_time) < 3000) {
    console.log("here");
    // let alternator = Math.floor(this.timeSince(this.start_time) / 107.14);
    let quantity = 14 + Math.floor(Math.random() * 14);
    let adjustment = this.timeSince(this.start_time) <= 20*107.14 ? 20 * Math.sin(0.5 * this.timeSince(this.start_time) * 2 * Math.PI / 107.14) : 0;

    for (var i = 0; i < quantity; i++) {
      console.log("many here");
      let ember = PIXI.Sprite.from(PIXI.Texture.WHITE);
        
      if (Math.random() > 0.6) ember.tint = fire_colors[Math.floor(Math.random()*fire_colors.length)];
      ember.width = 4;
      ember.height = 4;
      ember.vx = -6 + Math.random() * 12;
      ember.vy = -9 + Math.random() * 12;
      ember.type = "ember";
      ember.parent = this.intro_overlay;
      let jitter_x = -2 + Math.random() * 4;
      let jitter_y = -2 + Math.random() * 4;
      // ember.position.set(-this.player_runner.lx, -this.player_runner.ly);
      ember.position.set(268 + this.player_runner.lx + jitter_x, 150 + adjustment + jitter_y);
      this.intro_overlay.addChild(ember);
      this.freefalling.push(ember);
    }
  }
}


Game.prototype.launchCodeDecayRunnerSpeed = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];

  if (this.timeSince(this.player_runner.last_speed_change) > 1000 && this.player_runner.speed > 0) {
    this.player_runner.speed -= 0.5;
    if (this.player_runner.speed <= 0) {
      this.player_runner.speed = 0;
      this.changeRunnerSpeed(); // immediately stop if we get to zero
    }
    this.player_runner.last_speed_change = this.markTime();
    console.log(this.player_runner.speed);
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
  this.launchCodeMakeEmbers();
  this.shakeDamage();
  this.freeeeeFreeeeeFalling(fractional);
  //this.unpressButtons();

  this.launchCodeMoveAndCheckRunner();

  // Skip the rest if we aren't in active gameplay
  if (this.game_phase != "active") {
    return;
  }

  this.launchCodeDecayRunnerSpeed();
}