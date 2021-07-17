

course_origin = {};
course_origin.x = 268;
course_origin.y = 375;



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

  // NO NO NO NO NO NO NO
  this.level = 20;

  this.freefalling = [];
  this.shakers = [];

  this.game_phase = "pre_game";

  this.launch_code_typing = "";

  this.word_count = 0;
  this.correct_word_count = 0;

  let difficulty_multiplier = this.difficulty_level == "EASY" ? 1 :
    this.difficulty_level == "MEDIUM" ? 2 :
    this.difficulty_level == "HARD" ? 3 : 5;

  console.log(this.level);
  this.launchCodeSetDifficulty1(this.level);

  this.resetRace();
  this.drawMouseCord(this.mouse_tester.x, this.mouse_tester.y);

  this.launchCodeSetDifficulty2(this.level, difficulty_multiplier); // must come after level creation so it can set player attributes

  this.shakers = [screen, this.player_area, this.enemy_area, this.opponent_image, this.code_prompt];

  delay(function() {
    self.paused = false;
    self.pause_time = 0;
    self.start_time = self.markTime();
    self.game_phase = "countdown";
    self.setMusic("action_song_3");

    self.runner[0].speed = 6;
    self.runner[0].changeSpeed();
    self.runner[0].last_speed_change = self.markTime();

    self.runner[1].speed = 6;
    self.runner[1].changeSpeed();
    self.runner[1].last_speed_change = self.markTime();
  }, 1200);

  setInterval(function() {
    let minutes_elapsed = self.timeSince(self.start_time) / 60000;
    let wpm = self.correct_word_count / minutes_elapsed;
    let accuracy = self.correct_word_count/self.word_count;
    console.log("WPM: " + wpm);
    console.log("Accuracy: " + accuracy);
  }, 3000)
}


Game.prototype.launchCodeSetDifficulty1 = function(level) {
  this.chunk_types = ["flat", "flat", "flat", "flat", "flat", "flat", "flat", "flat", "rise", "box"];
  if (level > 1) {
    this.chunk_types[0] = "guard";
  }
  if (level > 3) {
    this.chunk_types[1] = "door";
  }
  if (level > 6) {
    this.chunk_types[2] = "guard";
    this.chunk_types[3] = "door";
  }
  if (level > 9) {
    this.chunk_types[4] = "box";
    this.chunk_types[5] = "rise";
  }
  this.launch_code_course_length = Math.floor((30 + 5 * level) * (0.75 + 0.5 * Math.random()));
  this.code_panel_difficulty = Math.min(12, Math.floor(level / 2));
}


Game.prototype.launchCodeSetDifficulty2 = function(level, difficulty_multiplier) {
  this.runner[1].max_speed = 3 + Math.max(3, Math.floor(level / 5));
  this.runner[1].min_speed = 1 + Math.max(2, Math.floor(level / 5));
  this.runner[1].jump_probability = Math.min(1, 0.4 + level * 0.05);
  this.runner[1].punch_probability = Math.min(1, 0.4 + level * 0.05);
  this.runner[1].terminal_delay = Math.max(3500, 6000 - 300 * level);
  this.runner[1].speed_change_time = Math.max(300, 1000 - 100 * level);

  this.runner[0].decay_time = Math.max(600, 1000 - 30 * level);
  this.runner[0].typing_boost = Math.max(0.4, 1.5 - level * 0.1);
  console.log(level);
  console.log(Math.max(0.35, 1.5 - level * 0.1));
  console.log(this.runner[0].typing_boost);
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

  this.parallax_course_bg = new PIXI.Container();
  this.parallax_course_bg.position.set(0, 0); // shift it so y = 0 matches the player's origin.
  area.addChild(this.parallax_course_bg);
  for (var i = 0; i < 4; i++) {
    let bg = new PIXI.Sprite(PIXI.Texture.from("Art/Course/parallax_background.png"));
    bg.anchor.set(0, 0);
    bg.scale.set(1.5, 1.5);
    bg.position.set(1280 * 1.5 * i, -480 * 1.5);
    bg.scaleMode = PIXI.SCALE_MODES.NEAREST;
    this.parallax_course_bg.addChild(bg);
  }

  this.makeCoursesAndPlayers();

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

  this.intro_overlay.rope = new PIXI.Sprite(PIXI.Texture.from("Art/wick.png"));
  this.intro_overlay.rope.position.set(268, 200);
  this.intro_overlay.addChild(this.intro_overlay.rope);
  let rope_mask = new PIXI.Graphics();
  rope_mask.beginFill(0xFF3300);
  rope_mask.drawRect(394, 0, 500, 800);
  rope_mask.endFill();
  this.intro_overlay.rope.mask = rope_mask;

  // this.intro_overlay.visible = false;

  var screen_cover_background = new PIXI.Sprite(PIXI.Texture.from("Art/game_screen_cover_background.png"));
  screen_cover_background.anchor.set(0, 0);
  screen.addChild(screen_cover_background);

  this.announcement = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 3, align: "center"});
  this.announcement.anchor.set(0.5,0.5);
  this.announcement.position.set(470, 78);
  this.announcement.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.announcement.style.lineHeight = 36;
  screen.addChild(this.announcement);

  this.runner_arrow = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/arrow_pixelated.png"));
  this.runner_arrow.visible = false;
  this.runner_arrow.anchor.set(0.5, 0.5);
  this.runner_arrow.scale.set(0.5, 0.5);
  screen.addChild(this.runner_arrow);

  this.mini_runner = new PIXI.Sprite(PIXI.Texture.from("Art/mini_runner.png"));
  this.mini_runner.visible = false;
  this.mini_runner.anchor.set(0.5, 0.5);
  screen.addChild(this.mini_runner);

  this.runner_text = new PIXI.Text("0", {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.runner_text.visible = false;
  this.runner_text.anchor.set(0.5, 0.5);
  screen.addChild(this.runner_text);

  this.score_label = new PIXI.Text("Score", {
    fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.score_label.anchor.set(0.5,0.5);
  this.score_label.position.set(204, 62);
  this.score_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.score_label.visible = false;
  screen.addChild(this.score_label);

  this.score_text_box = new PIXI.Text(this.score, {
    fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.score_text_box.anchor.set(0.5,0.5);
  this.score_text_box.position.set(204, 87);
  this.score_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.score_text_box.visible = false;
  screen.addChild(this.score_text_box);

  this.level_label = new PIXI.Text("Level", {
    fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.level_label.anchor.set(0.5,0.5);
  this.level_label.position.set(742, 62);
  this.level_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.level_label.visible = false;
  screen.addChild(this.level_label);

  this.level_text_box = new PIXI.Text(this.level, {
    fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.level_text_box.anchor.set(0.5,0.5);
  this.level_text_box.position.set(742, 87);
  this.level_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.level_text_box.visible = false;
  screen.addChild(this.level_text_box);

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
      self.runner[0].setState("static");
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


Game.prototype.makeCoursesAndPlayers = function() {
  let self = this;
  var screen = this.screens["1p_launch_code"];

  let list = this.launchCodeMakeCourseList(this.launch_code_course_length);
  this.course = [];
  this.runner = [];
  this.course[1] = this.launchCodeMakeCourse(1, list, course_origin.x, course_origin.y - 60, "red");
  this.course[0] = this.launchCodeMakeCourse(0, list, course_origin.x, course_origin.y, "blue");

  this.runner[0] = this.course[0].runner;
  this.runner[1] = this.course[1].runner;

  this.course[1].scale.set(0.6666, 0.6666);
}


// chunk_types = ["box", "door", "flat", "rise"];
// chunk_types = ["box", "door", "flat", "rise", "flat", "guard"];
// chunk_types = ["flat", "box", "door", "guard", "rise", "box", "door", "guard", "rise"];
//chunk_types = ["guard"];
Game.prototype.launchCodeMakeCourseList = function(size) {
  
  let list = [];
  for (let i = 0; i < size; i++) {
    let chunk_type = "flat";
    if (i == size - 1) {
      chunk_type = "end";
    } else if (i < 8 || i % 3 != 0 || i > size - 5) {
      // flat is good.
    } else {
      shuffleArray(this.chunk_types);
      chunk_type = this.chunk_types[0];
    }
    list.push(chunk_type);
  }
  return list;
}


Game.prototype.launchCodeMakeCourse = function(player_number, list, origin_x, origin_y, player_color) {
  let course = new PIXI.Container();
  course.player_number = player_number;
  course.ox = origin_x;
  course.oy = origin_y;
  course.position.set(course.ox, course.oy); // shift it so y = 0 matches the player's origin.
  this.player_area.addChild(course);

  course.items = [];
  let height = 0;
  for (let i = 0; i < list.length; i++) {
    // size of each chunk is 167*2 = 334.
    let chunk_type = list[i];
    let chunk = null;
    if (chunk_type != "door") {
      chunk = new PIXI.Sprite(PIXI.Texture.from("Art/Course/" + (chunk_type == "guard" ? "flat" : chunk_type) + ".png"));
      chunk.anchor.set(0, 1);
    } else if (chunk_type == "door") {
      let sheet = PIXI.Loader.shared.resources["Art/Course/door_animated.json"].spritesheet;
      chunk = new PIXI.Container();
      chunk.door_closed = new PIXI.AnimatedSprite(sheet.animations["closed"]);
      chunk.door_open = new PIXI.AnimatedSprite(sheet.animations["open"]);
      chunk.door_opening = new PIXI.AnimatedSprite(sheet.animations["opening"]);
      chunk.door_closed.anchor.set(0, 1);
      chunk.door_open.anchor.set(0, 1);
      chunk.door_opening.anchor.set(0, 1);
      chunk.door_closed.alpha = 0.5;
      chunk.door_open.alpha = 0.5;
      chunk.door_opening.alpha = 0.5;
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

    if (chunk.chunk_type == "end") chunk.alpha = 0.5;

    chunk.scale.set(2, 2);
    chunk.scaleMode = PIXI.SCALE_MODES.NEAREST;
    chunk.position.set(334 * i, height + 8);
    chunk.lx = 334 * i;
    chunk.ly = height;
    chunk.chunk_type = chunk_type;
    course.addChild(chunk);
    course.items.push(chunk);

    if (chunk_type == "guard") {
      let guard = this.makeRunner(course, "grey", 1.5, 334 * i + 167, 0, 0, false);
      guard.lx = 334 * i + 167;
      guard.scale.set(-1.5, 1.5);
      guard.setState("static")
      chunk.guard = guard;
    }

    if (chunk_type == "rise") height -= 100;
  }

  course.runner = this.makeRunner(course, player_color, 1.5, 0, 0, 0, true);

  return course;
}


Game.prototype.chooseLaunchCode = function(length = 5, difficulty = 0) {
  let code = "";
  let letter = letter_array[Math.floor(Math.random() * 26)];
  let dict_1 = this.short_starting_dictionaries[letter];
  let dict_2 = this.starting_dictionaries[letter];
  // let word_list = this.enemy_words[word_size];
  for (let i = 0; i < length; i++) {
    let dict = i % 2 == 0 ? dict_1 : dict_2;
    let word = dict[Math.floor(Math.random() * dict.length)].toLowerCase();
    for (let j = 0; j < 10; j++) {
      if (word.length > 3 + difficulty / 2) word = dict[Math.floor(Math.random() * dict.length)].toLowerCase();
    }
    word = word[0].toUpperCase() + word.substring(1);
    code += " " + word;
  }
  code = code.substring(1);
  return code;
}


Game.prototype.launchCodeGameOver = function(win = false) {
  let self = this;
  
  this.game_phase = "gameover";

  this.score = Math.floor(this.score);

  if (win == true) {
    this.announcement.text = "YOU WIN!";
    this.soundEffect("victory");
    this.score += 500;
    this.score_text_box.text = this.score;
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


Game.prototype.launchCodeTerminal = function(chunk, runner, player_number) {
  runner.setState("terminal");
  runner.last_speed = 0;
  runner.speed = 0;
  runner.ground_speed = 0;
  runner.ly = runner.ly_floor;

  if (player_number == 0) {
    this.launchCodeSetTyping("");
    this.code_panel.visible = true;
    this.code_panel.alpha = 1;
    this.code_prompt.setText(this.chooseLaunchCode(5, this.code_panel_difficulty));
    let measure = new PIXI.TextMetrics.measureText(this.code_prompt.remaining_text.text, this.code_prompt.remaining_text.style);
    this.code_prompt.position.set(-1 * measure.width / 2, 0);
    this.code_panel.backing.width = measure.width + 40;
    this.code_prompt.parent_chunk = chunk;

    this.game_phase = "terminal";
  } else {
    runner.terminal_chunk = chunk;
    runner.terminal_time = this.markTime();
    runner.current_terminal_delay = runner.terminal_delay * (0.8 + 0.4 * Math.random());
    runner.final_terminal = false;
  }
}


Game.prototype.launchCodeFinalTerminal = function(chunk, runner, player_number) {
  let self = this;

  runner.setState("terminal");
  runner.speed = 0;
  runner.ground_speed = 0;
  runner.ly = runner.ly_floor;

  if (player_number == 0) {
    this.launchCodeSetTyping("");
    // this.code_prompt.prior_text.style.fontSize = 12;
    // this.code_prompt.typing_text.style.fontSize = 12;
    // this.code_prompt.remaining_text.style.fontSize = 12;
    this.code_panel.position.x -= 50;
    this.code_panel.visible = true;
    this.code_panel.alpha = 1;
    this.code_prompt.setText(this.chooseLaunchCode(7, this.code_panel_difficulty));
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
  } else {
    runner.terminal_chunk = chunk;
    runner.terminal_time = this.markTime();
    runner.current_terminal_delay = runner.terminal_delay * 1.5 * (0.8 + 0.4 * Math.random());
    runner.final_terminal = true;
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
      this.word_count += 1;
      if (complete) {
        this.correct_word_count += 1;
        this.runner[0].speed += this.runner[0].typing_boost;
        if (this.runner[0].speed >= 7) {
          this.runner[0].speed = 7;
        }
        this.runner[0].last_speed_change = this.markTime();
        if (this.runner[0].current_state == "static") this.runner[0].changeSpeed();
      } else {
        this.runner[0].speed -= 1.5;
        if (this.runner[0].speed <= 0) {
          this.runner[0].speed = 0;
          this.runner[0].changeSpeed(); // immediately stop if we get to zero
        }
      }
    } else if (this.game_phase == "terminal") {

    }
  }
}


Game.prototype.launchCodeKeyDown = function(key) {
  let player = 0;
  if (!this.paused && this.game_phase == "active"
    && this.runner[0].current_state != "combat_fall"
    && this.runner[0].current_state != "combat_rise") {

    this.pressKey(this.player_palette, key);

    if (key === "ArrowUp") {
      //this.launchCodeSetTyping("");
      this.runner[0].jump();
    }

    if (key === "Enter") {
      let target = null;
      for (let i = 0; i < this.course[0].items.length; i++) {
        let chunk = this.course[0].items[i];
        if (chunk.chunk_type == "guard" 
          && this.runner[0].lx >= chunk.position.x && this.runner[0].lx <= chunk.position.x + 334) {
          target = chunk.guard;
        }
      }
      this.runner[0].punch(target, true);
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

      this.score_label.visible = true;
      this.score_text_box.visible = true;
      this.level_label.visible = true;
      this.level_text_box.visible = true;
      delay(function() {self.announcement.text = "";}, 1600);

      new TWEEN.Tween(this.intro_overlay.background)
        .to({alpha: 0})
        .duration(150)
        // .easing(TWEEN.Easing.Quartic.Out)
        .start();
    }
  }

  if (this.game_phase == "active") {
    // Add to the score
    if (this.runner[0].lx > this.runner[0].last_x) {
      this.score += 0.1;
      if (this.runner[0].lx > this.runner[1].lx) {
        this.score += 0.1;
      }
      if (this.runner[0].speed >= 6) {
        this.score += 0.1;
      }
      this.score_text_box.text = Math.floor(this.score);
    }
  }

  if (this.runner[0].lx > this.runner[1].lx + 400) {
    this.runner_arrow.visible = true;
    this.runner_arrow.angle = 180;
    this.runner_arrow.position.set(160, 234);
    this.runner_arrow.tint = 0x71d07d;
    this.mini_runner.visible = true;
    this.mini_runner.position.set(190, 235);
    this.runner_text.visible = true;
    this.runner_text.position.set(235, 236);
    this.runner_text.tint = 0x71d07d;
    this.runner_text.text = Math.floor((this.runner[0].lx - this.runner[1].lx) / 100);
  } else if (this.runner[0].lx + 600 < this.runner[1].lx) {
    this.runner_arrow.visible = true;
    this.runner_arrow.angle = 0;
    this.runner_arrow.position.set(775, 234);
    this.runner_arrow.tint = 0xdb5858;
    this.mini_runner.visible = true;
    this.mini_runner.position.set(745, 235);
    this.runner_text.visible = true;
    this.runner_text.position.set(700, 238);
    this.runner_text.tint = 0xdb5858;
    this.runner_text.text = Math.floor((this.runner[1].lx - this.runner[0].lx) / 100);
  } else {
    this.runner_arrow.visible = false;
    this.runner_text.visible = false;
    this.mini_runner.visible = false;
  }

  if (this.game_phase != "active" && this.game_phase != "terminal") {
    this.runner_arrow.visible = false;
    this.runner_text.visible = false;
    this.mini_runner.visible = false;
  }
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
      ember.position.set(268 + this.runner[0].lx + jitter_x, 250 + adjustment + jitter_y);
      this.intro_overlay.addChild(ember);
      this.freefalling.push(ember);
    }
  }
}


Game.prototype.launchCodeDecayPlayerRunnerSpeed = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];

  if (this.timeSince(this.runner[0].last_speed_change) > this.runner[0].decay_time && this.runner[0].speed > 0) {
    this.runner[0].speed -= 0.5;
    if (this.runner[0].speed <= 0) {
      this.runner[0].speed = 0;
      this.runner[0].changeSpeed(); // immediately stop if we get to zero
    }
    this.runner[0].last_speed_change = this.markTime();
  }
}


Game.prototype.launchCodeEnemyAction = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];

  let runner = this.course[1].runner;
  let last_x = runner.last_x;
  let x = runner.lx;

  if (runner.current_state == "combat_punch"
    || runner.current_state == "combat_fall"
    || runner.current_state == "combat_rise"
    || runner.current_state == "jump"
    || runner.current_state == "damage") {
    return;
  }

  if (runner.current_state == "terminal") {
    if (runner.terminal_time != null && this.timeSince(runner.terminal_time) > runner.current_terminal_delay) {
      if (runner.final_terminal == false) {
        runner.terminal_chunk.setState("opening");
        runner.speed = 2;
        runner.changeSpeed();
        runner.terminal_time = null;
      } else {
        self.launchCodeGameOver(false);
        runner.terminal_time = null;
      }
    }
    return;
  }

  // Jump over boxes and rises.
  //////
  for (let i = 0; i < this.course[1].items.length; i++) {
    let chunk = this.course[1].items[i];

    if ((chunk.chunk_type == "rise" || chunk.chunk_type == "box")
      && x >= chunk.position.x && x <= chunk.position.x + 167 && runner.current_state != "jump"
      && this.timeSince(runner.last_choice) > 500) {
      runner.last_choice = this.markTime();
      let dice = Math.random();
      if (dice <= runner.jump_probability) {
        runner.jump();
      }
    }
  }
  ///////


  // Punch out that guard!
  //////
  for (let i = 0; i < this.course[1].items.length; i++) {
    let chunk = this.course[1].items[i];

    if (chunk.chunk_type == "guard"
      && runner.current_state != "combat_punch"
      && chunk.guard.current_state != "combat_fall"
      && x >= chunk.position.x && x <= chunk.position.x + 167
      && this.timeSince(runner.last_choice) > 400) {
      runner.last_choice = this.markTime();
      let dice = Math.random();
      if (dice <= runner.punch_probability) {
        runner.punch(chunk.guard, true);
      }
    }
  }
  ///////


  // Speed changes
  if (this.timeSince(runner.last_speed_change) > runner.speed_change_time) {

    let last_speed = runner.speed;
    if (runner.speed < runner.min_speed) {
      runner.speed += 1;
    } else if (runner.speed > runner.max_speed) {
      runner.speed -= 1;
    } else if (runner.speed == 0) {
      if (Math.random() < 0.75) runner.speed += 1;
    } else {
      let dice = Math.random();
      if (dice <= 0.2) runner.speed -= 1;
      if (dice >= 0.7) runner.speed += 1;
      if (runner.jump_probability < 0.75 && dice > 0.49 && dice < 0.54) runner.jump();
    }
    runner.speed = Math.min(7, Math.max(0, runner.speed));

    if (last_speed != runner.speed && (last_speed == 0 || runner.speed == 0)) {
      runner.changeSpeed();
    }

    runner.last_speed_change = this.markTime();
  }
}


Game.prototype.launchCodeUpdateCourse = function(course) {
  var self = this;
  var screen = this.screens["1p_launch_code"];

  let runner = course.runner;

  runner.last_x = runner.lx;
  runner.lx += runner.ground_speed;
  runner.position.set(runner.lx, runner.ly);
  course.position.set(course.ox - course.scale.x * runner.lx, course.oy - course.scale.y * runner.ly);

  let last_x = runner.last_x;
  let x = runner.lx;

  for (let i = 0; i < course.items.length; i++) {
    let chunk = course.items[i];

    if (x > chunk.position.x && x < chunk.position.x + 334) {
      chunk.tint = 0x44FF44;
    } else {
      chunk.tint = 0xFFFFFF;
    }

    if (chunk.chunk_type == "box" 
      && last_x <= chunk.position.x + 167 && x >= chunk.position.x + 167
      && (runner.current_state != "jump" || runner.ly > chunk.position.y - 70)) {
      runner.damage();
    }

    if (chunk.chunk_type == "rise" 
      && last_x <= chunk.position.x + 167 && x >= chunk.position.x + 167) {
      if (runner.current_state != "jump" || runner.ly > chunk.position.y - 85) {
        runner.damage();
      } else if (runner.current_state == "jump") {
        runner.ly_floor = chunk.ly - 100;
      }
    }

    if (chunk.chunk_type == "door" && chunk.door_state == "closed"
      && runner.current_state != "terminal"
      && last_x <= chunk.position.x + 167 - 50 && x >= chunk.position.x + 167 - 50) {
      runner.lx = chunk.position.x + 167 - 50;
      this.launchCodeTerminal(chunk, runner, course.player_number);
    }

    if (chunk.chunk_type == "end"
      && runner.current_state != "terminal"
      && last_x <= chunk.position.x + 167 - 75 && x >= chunk.position.x + 167 - 75) {
      runner.lx = chunk.position.x + 167 - 75;
      this.launchCodeFinalTerminal(chunk, runner, course.player_number);
    }

    if (chunk.chunk_type == "guard" 
      && x >= chunk.position.x - 167 && x <= chunk.position.x + 167 + 10
      && chunk.guard.current_state == "static") {
      chunk.guard.setState("combat_ready");
      chunk.guard.lastReady = this.markTime() - 300;
    } else if (chunk.chunk_type == "guard"
      && x >= chunk.position.x + 167 + 40
      && chunk.guard.current_state == "combat_ready") {
      chunk.guard.setState("static");
      chunk.guard.scale.set(1.5, 1.5); // turn the beat cop around
    }

    if (chunk.chunk_type == "guard" 
      && x >= chunk.position.x && x <= chunk.position.x + 167 + 10
      && chunk.guard.current_state == "combat_ready"
      && chunk.guard.lastReady != null && this.timeSince(chunk.guard.lastReady) > 500) {
      chunk.guard.punch(runner, false);
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
  this.launchCodeMakeEmbers();
  this.shakeDamage();
  this.freeeeeFreeeeeFalling(fractional);

  if (this.code_prompt.shake == null) {
    this.code_prompt.remaining_text.style.fill = 0xFFFFFF;
  }

  if (this.runner[0].current_state == "combat_fall") {
    this.launchCodeSetTyping("");
  }

  this.launchCodeUpdateCourse(this.course[0]);
  this.launchCodeUpdateCourse(this.course[1]);
  this.course[1].position.y = this.course[1].oy - this.course[1].scale.y * this.course[0].runner.ly //this.course[0].position.y - 80;
  this.course[1].position.x -= 0.6666 * (this.course[0].runner.lx - this.course[1].runner.lx)
  this.intro_overlay.position.set(-1 * this.runner[0].lx, 0);
  this.parallax_course_bg.position.set(-0.25 * this.runner[0].lx, -0.25 * this.runner[0].ly)

  // Skip the rest if we aren't in active gameplay
  if (this.game_phase != "active" && this.game_phase != "terminal") {
    return;
  }

  this.launchCodeEnemyAction();
  this.launchCodeDecayPlayerRunnerSpeed();
}