

lc_origin = {};
lc_origin.x = 268;
lc_origin.y = 344;

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

  this.game_phase = "pre_game";

  this.launch_code_typing = "";

  this.launchCodeSetDifficulty(this.level);
  this.resetRace();
  this.drawMouseCord(this.mouse_tester.x, this.mouse_tester.y);

  this.shakers = [screen, this.player_area, this.enemy_area, this.opponent_image, this.code_prompt];

  delay(function() {
    self.paused = false;
    self.pause_time = 0;
    self.start_time = self.markTime();
    self.game_phase = "countdown";
    self.setMusic("action_song_3");

    self.player_runner.speed = 6;
    self.changeRunnerSpeed(self.player_runner, self.player_level);
    self.player_runner.last_speed_change = self.markTime();

    self.enemy_runner.speed = 6;
    self.changeRunnerSpeed(self.enemy_runner, self.enemy_level);
    self.enemy_runner.last_speed_change = self.markTime();
  }, 1200);
}


Game.prototype.launchCodeSetDifficulty = function(level) {
  this.enemy_runner.max_speed = 3 + Math.max(4, Math.floor(level / 5));
  this.enemy_runner.min_speed = 1 + Math.max(3, Math.floor(level / 5));
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

  let area = this.player_area;

  let player_monitor_mask = new PIXI.Graphics();
  player_monitor_mask.beginFill(0xFF3300);
  player_monitor_mask.drawRect(129, 39, 669, 504);
  player_monitor_mask.endFill();
  this.player_area.mask = player_monitor_mask;

  this.parallax_level_bg = new PIXI.Container();
  this.parallax_level_bg.position.set(0, 0); // shift it so y = 0 matches the player's origin.
  area.addChild(this.parallax_level_bg);
  for (var i = 0; i < 4; i++) {
    let bg = new PIXI.Sprite(PIXI.Texture.from("Art/Level/parallax_background.png"));
    bg.anchor.set(0, 0);
    bg.scale.set(2, 2);
    bg.position.set(2560 * i, -960);
    bg.scaleMode = PIXI.SCALE_MODES.NEAREST;
    this.parallax_level_bg.addChild(bg);
  }

  this.makeLevelsAndPlayers();

  this.makeCodePanel();

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
  this.intro_overlay.rope.position.set(268 + 510, 200);
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
}


Game.prototype.makeCodePanel = function() {
  let self = this;
  var screen = this.screens["1p_launch_code"];

  this.code_panel = new PIXI.Container();
  this.code_panel.position.set(129 + 356, 39 + 237 - 100);
  this.code_panel.backing = PIXI.Sprite.from(PIXI.Texture.WHITE);
  this.code_panel.backing.tint = 0x222222;
  this.code_panel.backing.width = 469;
  this.code_panel.backing.height = 40;
  this.code_panel.backing.anchor.set(0.5, 0.5);
  this.code_panel.addChild(this.code_panel.backing);
  code_panel_label = new PIXI.Text("Enter Code", {fontFamily: "Press Start 2P", fontSize: 14, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  code_panel_label.anchor.set(0.5,0.5);
  code_panel_label.position.set(0, -20);
  code_panel_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.code_panel.addChild(code_panel_label);
  screen.addChild(this.code_panel);
  this.code_prompt = this.makePrompt(this.code_panel, -200, 0, this.chooseLaunchCode(), true,
    function() {
      self.code_prompt.parent_chunk.setState("opening");
      self.player_runner.setState("static");
      self.game_phase = "active";
      new TWEEN.Tween(self.code_panel)
        .to({alpha: 0})
        .duration(200)
        .start();
    });
  let measure = new PIXI.TextMetrics.measureText(this.code_prompt.remaining_text.text, this.code_prompt.remaining_text.style);
  this.code_prompt.position.set(-1 * measure.width / 2, 0);
  this.code_panel.backing.width = measure.width + 40;
  this.code_panel.visible = false;
}


Game.prototype.makeLevelsAndPlayers = function() {
  let self = this;
  var screen = this.screens["1p_launch_code"];

    let list = this.launchCodeMakeLevelList(50);
  this.level = [];
  this.runner = [];
  this.level[1] = this.launchCodeMakeLevel(list, "red");
  this.level[0] = this.launchCodeMakeLevel(list, "blue");

  this.runner[0] = this.level[0].runner;
  this.runner[1] = this.level[1].runner;

  this.level[1].scale.set(0.6666, 0.6666);

  // this.enemy_level = new PIXI.Container();
  // this.enemy_level.position.set(0, 150); // shift it so y = 0 matches the player's origin.
  // this.enemy_level.ground_speed = 0;
  // this.enemy_level.scale.set(0.6666, 0.6666);
  // area.addChild(this.enemy_level);

  // this.player_level = new PIXI.Container();
  // this.player_level.position.set(0, 150); // shift it so y = 0 matches the player's origin.
  // this.player_level.ground_speed = 0;
  // area.addChild(this.player_level);



  // this.enemy_runner = this.makeRunner(area, "red", 1, lc_origin.x, lc_origin.y - 67);
  // this.enemy_runner.lx = 0;
  // this.enemy_runner.ly = 0;
  // this.enemy_runner.ly_floor = 0;
  // this.enemy_runner.speed = 6;
  // this.enemy_runner.get_up = true;
  // this.changeRunnerSpeed(this.enemy_runner, this.enemy_level);
  // this.enemy_runner.last_speed_change = this.markTime();

  // this.player_runner = this.makeRunner(area, "blue", 1.5, lc_origin.x, lc_origin.y);
  // this.player_runner.lx = 0;
  // this.player_runner.ly = 0;
  // this.player_runner.ly_floor = 0;
  // this.player_runner.speed = 6;
  // this.player_runner.get_up = true;
  // this.changeRunnerSpeed(this.player_runner, this.player_level);
  // this.player_runner.last_speed_change = this.markTime();

  // Add event listeners to change the run speed.
  // We do it this way so there isn't a sudden frame jump.
  // this.enemy_runner.sprites["slow_run"].onLoop = function() { self.changeRunnerSpeed(self.enemy_runner, self.enemy_level); }
  // this.enemy_runner.sprites["fast_run"].onLoop = function() { self.changeRunnerSpeed(self.enemy_runner, self.enemy_level); }
  // this.player_runner.sprites["slow_run"].onLoop = function() { self.changeRunnerSpeed(self.player_runner, self.player_level); }
  // this.player_runner.sprites["fast_run"].onLoop = function() { self.changeRunnerSpeed(self.player_runner, self.player_level); }

}


// chunk_types = ["box", "door", "flat", "rise"];
// chunk_types = ["box", "door", "flat", "rise", "flat", "guard"];
// chunk_types = ["flat", "box", "door", "guard", "rise", "box", "door", "guard", "rise"];
chunk_types = ["flat", "flat", "box"];
Game.prototype.launchCodeMakeLevelList = function(size) {
  
  let list = [];
  for (let i = 0; i < size; i++) {
    let chunk_type = "flat";
    if (i == size - 1) {
      chunk_type = "end";
    } else if (i < 7 || i % 2 == 1 || i % 2 == 2 || i > size - 5) {
      // flat is good.
    } else {
      shuffleArray(chunk_types);
      chunk_type = chunk_types[0];
    }
    list.push(chunk_type);
  }
  console.log(list);
  return list;
}


Game.prototype.launchCodeMakeLevel = function(list, player_color) {
  let level = new PIXI.Container();
  level.position.set(2000, 150); // shift it so y = 0 matches the player's origin.
  this.player_area.addChild(level);

  level.items = [];
  let height = 0;
  for (let i = 0; i < list.length; i++) {
    // size of each chunk is 167*2 = 334.
    let chunk_type = list[i];
    console.log(chunk_type);
    let chunk = null;
    if (chunk_type != "door") {
      chunk = new PIXI.Sprite(PIXI.Texture.from("Art/Level/level_" + (chunk_type == "guard" ? "flat" : chunk_type) + ".png"));
    } else if (chunk_type == "door") {
      let sheet = PIXI.Loader.shared.resources["Art/Level/level_door_animated.json"].spritesheet;
      chunk = new PIXI.Container();
      chunk.door_closed = new PIXI.AnimatedSprite(sheet.animations["closed"]);
      chunk.door_open = new PIXI.AnimatedSprite(sheet.animations["open"]);
      chunk.door_opening = new PIXI.AnimatedSprite(sheet.animations["opening"]);
      chunk.door_opening.animationSpeed = 0.8;
      chunk.door_opening.loop = false;
      chunk.addChild(chunk.door_closed);
      chunk.addChild(chunk.door_open);
      chunk.addChild(chunk.door_opening);
      chunk.setState = function(state) {
        if (state == "opening") {
          chunk.door_state = "opening";
          chunk.door_closed.visible = false;
          chunk.door_open.visible = false;
          chunk.door_opening.visible = true;
          chunk.door_opening.play();
          chunk.door_opening.onComplete = function() {
            chunk.setState("open");
          }
        } else if (state == "open") {
          chunk.door_state = "open";
          chunk.door_closed.visible = false;
          chunk.door_open.visible = true;
          chunk.door_opening.visible = false;
        } else if (state == "closed") {
          chunk.door_state = "closed";
          chunk.door_closed.visible = true;
          chunk.door_open.visible = false;
          chunk.door_opening.visible = false;
        }
      }
      chunk.setState("closed");
    }

    chunk.anchor.set(0.5, 0.5);
    chunk.scale.set(2, 2);
    chunk.scaleMode = PIXI.SCALE_MODES.NEAREST;
    chunk.position.set(334 * i, height);
    chunk.level_height = height;
    chunk.chunk_type = chunk_type;
    level.addChild(chunk);
    level.items.push(chunk);

    if (chunk_type == "guard") {
      let guard = this.makeRunner(level, "grey", 1.5, 334 * i + 167, 194 + height, 0, false);
      guard.scale.set(-1.5, 1.5);
      guard.setState("static")
      chunk.guard = guard;
    }

    if (chunk_type == "rise") height -= 100;
  }

  level.runner = this.makeRunner(area, player_color, 1.5, lc_origin.x, lc_origin.y, 6, true);

  return level;
}


Game.prototype.chooseLaunchCode = function(length = 5) {
  let code = "";
  let letter = letter_array[Math.floor(Math.random() * 26)];
  let dict_1 = this.short_starting_dictionaries[letter];
  let dict_2 = this.starting_dictionaries[letter];
  for (let i = 0; i < length; i++) {
    let dict = i % 2 == 0 ? dict_1 : dict_2;
    let word = dict[Math.floor(Math.random() * dict.length)].toLowerCase();
    word = word[0].toUpperCase() + word.substring(1);
    code += " " + word;
  }
  code = code.substring(1);
  return code;
}


Game.prototype.launchCodeGameOver = function(win = false) {
  let self = this;
  
  this.game_phase = "gameover";
  this.stopMusic();

  if (win == true) {
    this.announcement.text = "YOU WIN!";
    this.soundEffect("victory");
    flicker(this.announcement, 500, 0xFFFFFF, 0x67d8ef);
    delay(function() {
      self.nextFlow();
    }, 4000);
  } else {
    this.announcement.text = "YOU LOSE";
    this.stopMusic();
    this.soundEffect("game_over");
    this.gameOverScreen(4000);
  }
}


Game.prototype.runnerJump = function(runner, level) {
  let self = this;

  if (runner.current_state != "jump"
    && runner.current_state != "combat_punch") {
    this.launchCodeSetTyping("");
    runner.last_state = runner.current_state;
    runner.setState("jump");
    runner.jump_initial_floor = runner.ly_floor;
    //runner.speed = Math.max(runner.speed, 3);
    //level.ground_speed = Math.max(level.ground_speed, run_speeds[3].ground_speed);
    runner.speed = Math.max(runner.speed, 4);
    level.ground_speed = Math.max(level.ground_speed, run_speeds[4].ground_speed);
    runner.sprites["jump"].onLoop = function() {
      console.log("JUMP DISMISSED");
      runner.setState(runner.last_state);
      if (runner.last_state == "static") {
        runner.speed = 2;
        level.ground_speed = run_speeds[2].ground_speed;
        runner.setState("slow_run");
      }
      runner.last_state = null;
      runner.ly = runner.ly_floor;
    }
    runner.sprites["jump"].onFrameChange = function() {
      if (this.currentFrame >= 2 && this.currentFrame <= 27) {
        let t = this.currentFrame - 2;
        runner.ly = 0.8 * ((t - 12)*(t - 12) - 144) + runner.jump_initial_floor;
        if (runner.ly > runner.ly_floor) {
          runner.ly = runner.ly_floor;
          console.log("Calling calling");
          runner.sprites["jump"].onLoop(); // end the jump
        }
      } else if (this.currentFrame < 2) {
        console.log("be 3");
        runner.ly = runner.jump_initial_floor;
      } else if (this.currentFrame > 27) {
        console.log("be 2");
        runner.ly = runner.ly_floor;
      }
    }
  }
}


Game.prototype.runnerDamage = function(runner, level) {
  let self = this;

  if (runner.current_state != "damage") {
    runner.setState("damage");
    runner.old_base_height = runner.base_height;
    runner.speed = -1 * 6;
    level.ground_speed = -1 * run_speeds[6].ground_speed;

    runner.sprites["damage"].onLoop = function() {
      runner.setState("static");
      runner.speed = 0;
      level.ground_speed = 0;
      runner.ly = runner.ly_floor;
    }
    runner.sprites["damage"].onFrameChange = function() {
      let t = this.currentFrame;
      runner.ly = 2.5 * ((t - 4)*(t - 4) - 16) + runner.ly_floor;
    }
  }
}


Game.prototype.runnerPunch = function() {
  let self = this;

  // the first fist extends about 95 pixels. the second fist is about 75.

  if (this.player_runner.current_state != "combat_punch"
    && this.player_runner.current_state != "jump") {
    this.launchCodeSetTyping("");
    this.player_runner.setState("combat_punch");
    let last_speed = this.player_runner.speed;
    this.player_runner.speed = 0;
    this.player_level.ground_speed = run_speeds[0].ground_speed;
    this.player_runner.sprites["combat_punch"].onFrameChange = function() {
      let t = this.currentFrame;
      if (t == 9) {
        self.player_runner.lx += 30;
      }

      // test for punching guards
      let x = self.player_runner.lx + lc_origin.x;
      for (let i = 0; i < self.player_level.items.length; i++) {
        let chunk = self.player_level.items[i];
        if (chunk.chunk_type == "guard" && x >= chunk.position.x && x <= chunk.position.x + 334) {
          console.log("testing the guard");
          console.log(t);
          console.log(t in punch_positions);
          if (t in punch_positions) console.log(punch_positions[t]);
          console.log(chunk.position.x - x);
          if (t in punch_positions && x >= chunk.position.x - punch_positions[t] - 5 && x <= chunk.position.x) {
              if (chunk.guard.current_state == "combat_punch") {
                let t2 = chunk.guard.sprites["combat_punch"].currentFrame;
                if (t2 in punch_positions && x >= chunk.position.x - punch_positions[t2] - 25 && x <= chunk.position.x) { // 25 here is for the fact that the head moves in on punch frames, so there's a more generous buffer
                  self.runnerKnockout(self.player_runner, true);
                }
              }
              self.runnerKnockout(chunk.guard, false);
          }
        }
      }
    }
    this.player_runner.sprites["combat_punch"].onLoop = function() {
      //self.player_runner.setState(self.player_runner.last_state);
      self.player_runner.speed = Math.min(2, last_speed);
      self.changeRunnerSpeed(self.player_runner, self.player_level);
      self.player_runner.last_state = null;
    }
  }
}


Game.prototype.runnerTerminal = function(chunk) {
  console.log("Runner terminal");
  this.launchCodeSetTyping("");
  this.player_runner.setState("terminal");
  this.player_runner.speed = 0;
  this.player_runner.ly = this.player_runner.ly_floor;
  this.player_level.ground_speed = run_speeds[0].ground_speed;
  this.code_panel.visible = true;
  this.code_panel.alpha = 1;
  this.code_prompt.setText(this.chooseLaunchCode());
  let measure = new PIXI.TextMetrics.measureText(this.code_prompt.remaining_text.text, this.code_prompt.remaining_text.style);
  this.code_prompt.position.set(-1 * measure.width / 2, 0);
  this.code_panel.backing.width = measure.width + 40;
  this.code_prompt.parent_chunk = chunk;
  this.game_phase = "terminal";
}


Game.prototype.runnerFinalTerminal = function(chunk) {
  let self = this;

  this.launchCodeSetTyping("");
  this.player_runner.setState("terminal");
  this.player_runner.speed = 0;
  this.player_runner.ly = this.player_runner.ly_floor;
  this.player_level.ground_speed = run_speeds[0].ground_speed;
  this.code_prompt.prior_text.style.fontSize = 12;
  this.code_prompt.typing_text.style.fontSize = 12;
  this.code_prompt.remaining_text.style.fontSize = 12;
  this.code_panel.visible = true;
  this.code_panel.alpha = 1;
  this.code_prompt.setText(this.chooseLaunchCode(8));
  let measure = new PIXI.TextMetrics.measureText(this.code_prompt.remaining_text.text, this.code_prompt.remaining_text.style);
  this.code_prompt.position.set(-1 * measure.width / 2, 0);
  this.code_panel.backing.width = measure.width + 40;
  this.code_prompt.parent_chunk = chunk;
  this.code_prompt.finished_callback = function() {
    self.launchCodeGameOver(true);
    new TWEEN.Tween(self.code_panel)
      .to({alpha: 0})
      .duration(200)
      .start();
  };
  this.game_phase = "terminal";
  // set level ending callback when the panel is finished
}


Game.prototype.runnerKnockout = function(player, extra) {
  let self = this;

  // the first fist extends about 95 pixels. the second fist is about 75.

  if (player.current_state != "combat_fall") {
    if (extra) {
      this.launchCodeSetTyping("");
      this.player_level.ground_speed = run_speeds[0].ground_speed;
    }
    player.setState("combat_fall");
    player.speed = 0;
    

    let vy = -24;
    player.sprites["combat_fall"].onFrameChange = function() {
      player.ly += vy;
      vy += 4;
      if (player.ly < player.ly_floor) {
        player.lx -= 5;
      } else {
        player.ly = player.ly_floor;
        vy = 0;
      }
    }
    // remember to drop the player towards the ground if jumping
  }
}


Game.prototype.launchCodeSetTyping = function(new_typing) {
  this.launch_code_typing = new_typing;

  let prompt = null;
  if (this.game_phase == "active") {
    prompt = this.run_prompt;
  } else {
    prompt = this.code_prompt;
  }

  prompt.typing = this.launch_code_typing;
  prompt.checkCorrectness();
  prompt.setPosition();
}


Game.prototype.launchCodeAdvance = function() {
  this.launch_code_typing = "";

  let prompt = null;
  if (this.game_phase == "active") {
    prompt = this.run_prompt;
  } else {
    prompt = this.code_prompt;
  }

  prompt.checkCorrectness();

  if (prompt.typing.length > 0) {
    let complete = prompt.complete;
    //this.run_label.tint = complete == true ? 0x3cb0f3 : 0xdb5858;
    //this.run_label.position.y = this.run_label.fixed_y + 2;
    //this.run_label.press_count = 6;
    prompt.advance();
    if (this.game_phase == "active") {
      if (complete) {
        this.player_runner.speed += 0.5;
        if (this.player_runner.speed >= 7) {
          this.player_runner.speed = 7;
        }
        this.player_runner.last_speed_change = this.markTime();
        if (this.player_runner.current_state == "static") this.changeRunnerSpeed(this.player_runner, this.player_level);
      } else {
        this.player_runner.speed -= 1.5;
        if (this.player_runner.speed <= 0) {
          this.player_runner.speed = 0;
          this.changeRunnerSpeed(this.player_runner, this.player_level); // immediately stop if we get to zero
        }
      }
    } else if (this.game_phase == "terminal") {

    }
  }
}


Game.prototype.launchCodeKeyDown = function(key) {
  let player = 0;
  if (!this.paused && this.game_phase == "active"
    && this.player_runner.current_state != "combat_fall"
    && this.player_runner.current_state != "combat_rise") {

    this.pressKey(this.player_palette, key);

    if (key === "ArrowUp") {
      console.log("I will try jumping");
      this.runnerJump(this.player_runner, this.player_level);
    }

    if (key === "Enter") {
      this.runnerPunch();
    }

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
  }

  if (!this.paused && this.game_phase == "terminal") {

    this.pressKey(this.player_palette, key);

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
  }

  if (key === "Tab" && (this.game_phase == "active" || this.game_phase == "countdown" || this.game_phase == "terminal")) {
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


Game.prototype.launchUpdateEnemyRunner = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];

  let last_x = this.enemy_runner.lx + lc_origin.x;

  this.enemy_runner.lx += this.enemy_level.ground_speed;
  this.enemy_runner.position.set(lc_origin.x + (this.enemy_runner.lx - this.player_runner.lx) * 0.6666, lc_origin.y - 67 + 0.6666 * (this.enemy_runner.ly - this.player_runner.ly))

  let enemy_x = this.enemy_runner.lx + lc_origin.x;

  for (let i = 0; i < this.enemy_level.items.length; i++) {
    let chunk = this.enemy_level.items[i];

    if (enemy_x > chunk.position.x - 167 && enemy_x < chunk.position.x + 167) {
      chunk.tint = 0x44FF44;
    } else {
      chunk.tint = 0xFFFFFF;
    }

    if (chunk.chunk_type == "box" 
      && last_x <= chunk.position.x && enemy_x >= chunk.position.x
      && (this.enemy_runner.current_state != "jump" || this.enemy_runner.ly > chunk.position.y - 70)) {
      this.runnerDamage(this.enemy_runner, this.enemy_level);
    }

  }
}


Game.prototype.launchUpdateRunner = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];

  let last_x = this.player_runner.lx + lc_origin.x;

  this.player_runner.lx += this.player_level.ground_speed;
  this.player_level.position.set(-1 * this.player_runner.lx, 251 - this.player_runner.ly);
  this.intro_overlay.position.set(-1 * this.player_runner.lx, -this.player_runner.ly);
  this.parallax_level_bg.position.set(-0.25 * this.player_runner.lx, -0.25 * this.player_runner.ly)
  this.enemy_level.position.set(-0.6666 * this.player_runner.lx, 151 + 67 - 0.6666 * this.player_runner.ly);
  

  let player_x = this.player_runner.lx + lc_origin.x;



  for (let i = 0; i < this.player_level.items.length; i++) {
    let chunk = this.player_level.items[i];
    if (player_x > chunk.position.x - 167 && player_x < chunk.position.x + 167) {
      chunk.tint = 0x44FF44;
    } else {
      chunk.tint = 0xFFFFFF;
    }

    if (chunk.chunk_type == "box" 
      && last_x <= chunk.position.x && player_x >= chunk.position.x
      && (this.player_runner.current_state != "jump" || this.player_runner.ly > chunk.position.y - 70)) {
      this.runnerDamage(this.player_runner, this.player_level);
    }

    if (chunk.chunk_type == "rise" 
      && last_x <= chunk.position.x && player_x >= chunk.position.x) {
      if (this.player_runner.current_state != "jump" || this.player_runner.ly > chunk.position.y - 85) {
        this.runnerDamage(this.player_runner, this.player_level);
      } else if (this.player_runner.current_state == "jump") {
        this.player_runner.ly_floor = chunk.level_height - 100;
      }
    }

    if (chunk.chunk_type == "door" && chunk.door_state == "closed"
      && this.game_phase == "active"
      && last_x <= chunk.position.x - 50 && player_x >= chunk.position.x - 50) {
      this.player_runner.lx = chunk.position.x - 50 - lc_origin.x;
      this.runnerTerminal(chunk);
    }

    if (chunk.chunk_type == "end"
      && this.game_phase == "active"
      && last_x <= chunk.position.x - 75 && player_x >= chunk.position.x - 75) {
      this.player_runner.lx = chunk.position.x - 75 - lc_origin.x;
      this.runnerFinalTerminal(chunk);
    }

    if (chunk.chunk_type == "guard" 
      && last_x <= chunk.position.x - 334 && player_x >= chunk.position.x - 334
      && chunk.guard.current_state == "static") {
      chunk.guard.setState("combat_ready");
      chunk.guard.lastReady = this.markTime() - 300;
    } else if (chunk.chunk_type == "guard"
      && last_x >= chunk.position.x + 40
      && chunk.guard.current_state == "combat_ready") {
      chunk.guard.setState("static");
      chunk.guard.scale.set(1.5, 1.5);
    }

    if (chunk.chunk_type == "guard" 
      && player_x >= chunk.position.x - 167 && player_x <= chunk.position.x
      && this.player_runner.current_state != "combat_punch"
      && chunk.guard.current_state == "combat_ready"
      && chunk.guard.lastReady != null && this.timeSince(chunk.guard.lastReady) > 500) {
      chunk.guard.setState("combat_punch");
      chunk.guard.sprites["combat_punch"].onLoop = function() {  // oh, I may be creating a lot of functions.
        //self.player_runner.setState(self.player_runner.last_state);
        chunk.guard.setState("combat_ready");
        chunk.guard.lastReady = self.markTime();
      }
      chunk.guard.sprites["combat_punch"].onFrameChange = function() {
        let t = this.currentFrame;
        let x = self.player_runner.lx + lc_origin.x;
        if (t in punch_positions && x >= chunk.position.x - punch_positions[t] - 5 && x <= chunk.position.x) {
            console.log("KNOCKOUT!");
            if (self.player_runner.current_state == "combat_punch") {
              let t2 = self.player_runner.sprites["combat_punch"].currentFrame;
              if (t2 in punch_positions && x >= chunk.position.x - punch_positions[t2] - 25 && x <= chunk.position.x) { // 25 here is for the fact that the head moves in on punch frames, so there's a more generous buffer
                self.runnerKnockout(chunk.guard, false);
              }
            }
            self.runnerKnockout(self.player_runner, true);
        }
      }
    } 
  }
}

punch_positions = {
  7: 70,
  8: 88,
  9: 88,
  10: 80,
  11: 70,
  15: 36,
  16: 64,
  17: 80,
  18: 86,
  19: 88,
  20: 78,
  21: 70,
  22: 58,
}


Game.prototype.launchCodeMakeEmbers = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];

  if (this.timeSince(this.start_time) < 3000) {
    // let alternator = Math.floor(this.timeSince(this.start_time) / 107.14);
    let quantity = 14 + Math.floor(Math.random() * 14);
    let adjustment = this.timeSince(this.start_time) <= 20*107.14 ? 20 * Math.sin(0.5 * this.timeSince(this.start_time) * 2 * Math.PI / 107.14) : 0;

    for (var i = 0; i < quantity; i++) {
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
      ember.position.set(268 + this.player_runner.lx + jitter_x, 250 + adjustment + jitter_y);
      this.intro_overlay.addChild(ember);
      this.freefalling.push(ember);
    }
  }
}


Game.prototype.launchCodeDecayPlayerRunnerSpeed = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];

  if (this.timeSince(this.player_runner.last_speed_change) > 1000 && this.player_runner.speed > 0) {
    this.player_runner.speed -= 0.5;
    if (this.player_runner.speed <= 0) {
      this.player_runner.speed = 0;
      this.changeRunnerSpeed(this.player_runner, this.player_level); // immediately stop if we get to zero
    }
    this.player_runner.last_speed_change = this.markTime();
    console.log(this.player_runner.speed);
  }
}


Game.prototype.launchCodeChangeEnemyRunnerSpeed = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];

  if (this.timeSince(this.enemy_runner.last_speed_change) > 1000) {

    let last_speed = this.enemy_runner.speed;
    if (this.enemy_runner.speed < this.enemy_runner.min_speed) {
      this.enemy_runner.speed += 1;
    } else if (this.enemy_runner.speed > this.enemy_runner.max_speed) {
      this.enemy_runner.speed -= 1;
    } else {
      let dice = Math.random();
      if (dice <= 0.25) this.enemy_runner.speed -= 1;
      if (dice >= 0.75) this.enemy_runner.speed += 1;
      if (dice > 0.4 && dice < 0.5) this.runnerJump(this.enemy_runner, this.enemy_level);
    }
    this.enemy_runner.speed = Math.min(7, Math.max(0, this.enemy_runner.speed));

    if (last_speed != this.enemy_runner.speed && (last_speed == 0 || this.enemy_runner.speed == 0)) {
      this.changeRunnerSpeed(this.enemy_runner, this.enemy_level);
    }

    this.enemy_runner.last_speed_change = this.markTime();
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

  if (this.code_prompt.shake == null) {
    this.code_prompt.remaining_text.style.fill = 0xFFFFFF;
  }

  this.launchUpdateRunner();
  this.launchUpdateEnemyRunner();

  // Skip the rest if we aren't in active gameplay
  if (this.game_phase != "active") {
    return;
  }

  this.launchCodeDecayPlayerRunnerSpeed();
  this.launchCodeChangeEnemyRunnerSpeed();
}