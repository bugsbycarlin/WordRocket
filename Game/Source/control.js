

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
    if (this.keyboard_sounds) this.soundEffect("keyboard_click_1", 1.0);
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
    if (this.keyboard_sounds) this.soundEffect("keyboard_click_1", 1.0);
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


Game.prototype.pressKey = function(key) {
  if (key in this.player_palette.keys) {
    let keyboard_key = this.player_palette.keys[key];
    let click_sound = "keyboard_click_" + ((key.charCodeAt(0) % 5)+1).toString();
    if (this.keyboard_sounds) this.soundEffect(click_sound, 1.0);
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



Game.prototype.handleKeyDown = function(ev) {
  // Don't always need to do this.
  // ev.preventDefault();

  if(this.current_scene == "game") {

    let key = ev.key;
    if (key == "Shift") {
      if (ev.code == "ShiftLeft") key = "LShift";
      if (ev.code == "ShiftRight") key = "RShift";
    }
    this.pressKey(key);

    if (this.game_phase == "tutorial" && this.tutorial_number == 1) {
      this.tutorial2();
    }

    for (i in lower_array) {
      if (ev.key === lower_array[i] || ev.key === letter_array[i]) {
        this.keyAction(letter_array[i]);
      }
    }

    if (ev.key === "Backspace" || ev.key === "Delete") {
      this.deleteAction();
    }

    if (ev.key === "ArrowRight") {
      this.rightArrowAction();
    }

    if (ev.key === "ArrowLeft") {
      this.leftArrowAction();
    }

    if (ev.code === "ShiftRight") {
      this.rightShiftAction();
    }

    if (ev.code === "ShiftLeft") {
      this.leftShiftAction();
    }

    if (ev.key === "Escape") {
      this.clearAction();
    }


    if (ev.key === "Enter") {
      this.enterAction();
    }
  } else if (this.current_scene == "setup_single") {
    if (ev.key === "ArrowRight") {
      this.option_markers[this.option_choice].tint = 0xFFFFFF;
      this.option_choice = (this.option_choice + 1) % 4;
      this.option_markers[this.option_choice].tint = 0x75d3fe;
      this.option_info.setPartial(this.option_info_values[this.option_choice]);

    } else if (ev.key === "ArrowLeft") {
      this.option_markers[this.option_choice].tint = 0xFFFFFF;
      this.option_choice = (this.option_choice + 3) % 4;
      this.option_markers[this.option_choice].tint = 0x75d3fe;
      this.option_info.setPartial(this.option_info_values[this.option_choice]);
    } else if (ev.key === "Enter") {
      this.difficulty_level = this.option_values[this.option_choice];
      this.initializeSinglePlayerScene();
      this.animateSceneSwitch("setup_single", "game");
    }
  }
}
