

Game.prototype.keyAction = function(letter) {
  let self = this;
  if (this.game_phase == "active" || this.game_phase == "tutorial") {
    if (this.difficulty_level == "BEACON") {
      if (this.player_palette.letters[letter].playable === true && !this.launchpad.full()) {
        this.launchpad.push(this.player_palette, letter);
      } else {
        this.launchpad.flashError();
      }
    } else {
      if (!this.launchpad.full()) {
        let tile = this.launchpad.push(this.player_palette, letter);
        if (this.player_palette.letters[letter].playable === false) {
          tile.broken = true;
          tile.tint = 0xdb5858;
        }
      }
    }
  }
}


Game.prototype.deleteAction = function() {
  if (this.game_phase == "active" || this.game_phase == "tutorial") {
    this.soundEffect("keyboard_click_1", 1.0);
    this.launchpad.pop();
    if (this.game_phase == "tutorial" && this.tutorial_number == 3) {
      this.tutorial35();
    }
  }
}


Game.prototype.rightArrowAction = function() {
  if (this.game_phase == "active" || this.game_phase == "tutorial") {
    if (this.game_phase != "tutorial" || this.tutorial_number >= 2.5) {
      this.launchpad.smallShiftRight();
      if (this.game_phase == "tutorial" && this.tutorial_number == 2.5) {
        this.tutorial_conditions["right"] = 1;
        if (this.tutorial_conditions["right"] != null && this.tutorial_conditions["left"] != null) {
          this.tutorial275();
        }
      }
    }
  }
}


Game.prototype.leftArrowAction = function() {
  if (this.game_phase == "active" || this.game_phase == "tutorial") {
    if (this.game_phase != "tutorial" || this.tutorial_number >= 2.5) {
      this.launchpad.smallShiftLeft();
      if (this.game_phase == "tutorial" && this.tutorial_number == 2.5) {
        this.tutorial_conditions["left"] = 1;
        if (this.tutorial_conditions["right"] != null && this.tutorial_conditions["left"] != null) {
          this.tutorial275();
        }
      }
    }
  }
}


Game.prototype.rightShiftAction = function() {
  if (this.game_phase == "active" || this.game_phase == "tutorial") {
    if (this.game_phase != "tutorial" || this.tutorial_number >= 2.75) {
      this.launchpad.bigShiftRight();
      if (this.game_phase == "tutorial" && this.tutorial_number == 2.75) {
        this.tutorial_conditions["right"] = 1;
        if (this.tutorial_conditions["right"] != null && this.tutorial_conditions["left"] != null) {
          this.tutorial3();
        }
      }
    }
  }
}


Game.prototype.leftShiftAction = function() {
  if (this.game_phase == "active" || this.game_phase == "tutorial") {
    if (this.game_phase != "tutorial" || this.tutorial_number >= 2.75) {
      this.launchpad.bigShiftLeft();
      if (this.game_phase == "tutorial" && this.tutorial_number == 2.75) {
        this.tutorial_conditions["left"] = 1;
        if (this.tutorial_conditions["right"] != null && this.tutorial_conditions["left"] != null) {
          this.tutorial3();
        }
      }
    }
  }
}


Game.prototype.clearAction = function() {
  if (this.game_phase == "active" || this.game_phase == "tutorial") {
    this.soundEffect("keyboard_click_1", 1.0);
    this.launchpad.clear();
    if (this.game_phase == "tutorial" && this.tutorial_number == 3.5) {
      this.tutorial4();
    }
  }
}


Game.prototype.enterAction = function() {
  if (this.game_phase == "active" || this.game_phase == "tutorial") {
    if (this.game_phase != "tutorial" || this.tutorial_number >= 5) {
      this.launchpad.launch(this.player_area);
      if (this.game_phase == "tutorial" && this.tutorial_number == 5) {
        this.tutorial6();
      }
    }
  }
}


Game.prototype.bombAction = function() {
  if (this.game_phase == "active" && this.player_bombs > 0) {
    this.player_bombs -= 1;
    this.explodeArea(this.player_area, 2);
    this.player_palette.setBombs(this.player_bombs);
  }
}


Game.prototype.highScoreKey = function(letter) {
  let self = this;
  if (this.high_score_name_cursor <= 5) {
    this.high_score_name[this.high_score_name_cursor].text = letter;
    this.high_score_name_cursor += 1;
  }
}


Game.prototype.highScoreDelete = function() {
  if (this.high_score_name_cursor > 0) {
    this.high_score_name_cursor -= 1;
    this.high_score_name[this.high_score_name_cursor].text = "";
  }
}


Game.prototype.highScoreEnter = function() {
  var self = this;
  this.high_score_state = "finished";
  let name = "";
  for (var i = 0; i < 6; i++) {
    name += this.high_score_name[i].text;
  }
  this.addHighScore(name, this.new_high_score, function() {
    console.log("hiyo");
    self.initialize1pLobby();
    self.switchScreens("high_score", "1p_lobby");
  })
}


Game.prototype.pressKey = function(palette, key) {
  if (key in palette.keys) {
    let keyboard_key = palette.keys[key];
    let click_sound = "keyboard_click_" + ((key.charCodeAt(0) % 5)+1).toString();
    this.soundEffect(click_sound, 1.0);
    if (keyboard_key.key_pressed != true) {
      keyboard_key.key_pressed = true;
      // let old_y = keyboard_key.position.y;
      keyboard_key.position.y += 3;
      let old_tint = keyboard_key.tint;
      keyboard_key.tint = 0xDDDDDD;
      setTimeout(function() {
        keyboard_key.key_pressed = false;
        keyboard_key.position.y -= 3;
        keyboard_key.tint = old_tint;
      }, 50);
    }
  }
}


Game.prototype.gameplayKeyDown = function(key) {
  if (!this.paused) {
    this.pressKey(this.player_palette, key);

    if (this.game_phase == "tutorial" && this.tutorial_number == 1) {
      this.tutorial2();
    }

    for (i in lower_array) {
      if (key === lower_array[i] || key === letter_array[i]) {
        this.keyAction(letter_array[i]);
      }
    }

    if (key === "Backspace" || key === "Delete") {
      this.deleteAction();
    }

    if (key === "ArrowRight") {
      this.rightArrowAction();
    }

    if (key === "ArrowLeft") {
      this.leftArrowAction();
    }

    if (key === "RShift") {
      this.rightShiftAction();
    }

    if (key === "LShift") {
      this.leftShiftAction();
    }

    if (key === "Escape") {
      this.clearAction();
    }

    if (key === " ") {
      this.bombAction();
    }

    if (key === "Enter") {
      this.enterAction();
    }
  }

  if (key === "Tab" && (this.game_phase == "active" || this.game_phase == "countdown")) {
    if (this.paused) {
      this.resume();
    } else {
      this.pause();
    }
    // this.checkEndCondition(true); // for testing, switch to this to make tab force gameovers.
  }

  if (this.paused && key === "Escape") {
    document.getElementById("countdown").hold_up = null;
    this.game_phase = "none";
    this.resume();
    this.initialize1pLobby();
    this.switchScreens("1p_game", "1p_lobby");
  }
}


Game.prototype.handleKeyDown = function(ev) {
  if (ev.key == "Tab") {
    ev.preventDefault();
  }

  if(this.current_screen == "1p_game") {

    let key = ev.key;
    if (key == "Shift") {
      if (ev.code == "ShiftLeft") key = "LShift";
      if (ev.code == "ShiftRight") key = "RShift";
    }

    this.gameplayKeyDown(key);

  } else if (this.current_screen == "1p_lobby") {
    if (ev.key === "ArrowRight") {
      this.option_markers[this.difficulty_choice].tint = 0xFFFFFF;
      this.difficulty_choice = (this.difficulty_choice + 1) % 4;
      this.option_markers[this.difficulty_choice].tint = 0x75d3fe;
      this.option_info.setPartial(this.option_info_values[this.difficulty_choice].toUpperCase());
      this.updateHighScoreDisplay();
    } else if (ev.key === "ArrowLeft") {
      this.option_markers[this.difficulty_choice].tint = 0xFFFFFF;
      this.difficulty_choice = (this.difficulty_choice + 3) % 4;
      this.option_markers[this.difficulty_choice].tint = 0x75d3fe;
      this.option_info.setPartial(this.option_info_values[this.difficulty_choice].toUpperCase());
      this.updateHighScoreDisplay();
    } else if (ev.key === "Enter") {
      this.difficulty_level = this.option_values[this.difficulty_choice];
      localStorage.setItem("word_rockets_difficulty_level", this.difficulty_level);
      this.initialize1pGame();
      this.switchScreens("1p_lobby", "1p_game");
    } else if (ev.key == "Escape") {
      this.initializeTitle();
      this.switchScreens("1p_lobby", "title");
    }
  } else if (this.current_screen == "credits") {
    if (ev.key == "Escape") {
      this.left_shark_tween.stop();
      this.right_shark_tween.stop();
      this.initializeTitle();
      this.switchScreens("credits", "title");
    }
  } else if (this.current_screen == "high_score") {
    let key = ev.key;
    if (key == "Shift") {
      if (ev.code == "ShiftLeft") key = "LShift";
      if (ev.code == "ShiftRight") key = "RShift";
    }

    this.pressKey(this.high_score_palette, key);

    if (this.high_score_state == "entry") {
      for (i in lower_array) {
        if (ev.key === lower_array[i] || ev.key === letter_array[i]) {
          this.highScoreKey(letter_array[i]);
        }
      }

      if (ev.key === "Backspace" || ev.key === "Delete") {
        this.highScoreDelete();
      }

      if (ev.key === "Enter") {
        this.highScoreEnter();
      }
    }
  }
}
