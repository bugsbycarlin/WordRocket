

Game.prototype.keyAction = function(letter) {
  let self = this;
  if (this.current_scene == "game" && (this.game_phase == "active" || this.game_phase == "tutorial")) {
    if (this.player_palette.letters[letter].interactive == true && !this.launchpad.full()) {

      let previous_tint = this.player_palette.letters[letter].tint;
      this.player_palette.letters[letter].tint = 0xBBBBBB;
      setTimeout(function() { self.player_palette.letters[letter].tint = previous_tint; }, 100);

      let click_sound = "keyboard_click_" + ((letter.charCodeAt(0) % 5)+1).toString();
      console.log(click_sound);
      if (this.keyboard_sounds) this.soundEffect(click_sound, 1.0);
      this.launchpad.push(this.player_palette, letter);
    } else {
      this.soundEffect("negative");
      this.player_palette.flashError();
    }

    if (this.game_phase == "tutorial" && this.tutorial_number == 1) {
      this.tutorial2();
    }
  }
}


Game.prototype.deleteAction = function() {
  if (this.current_scene == "game" && (this.game_phase == "active" || this.game_phase == "tutorial")) {
    if (this.keyboard_sounds) this.soundEffect("keyboard_click_1", 1.0);
    this.launchpad.pop();
    if (this.game_phase == "tutorial" && this.tutorial_number == 3) {
      this.tutorial4();
    }
  }
}


Game.prototype.rightArrowAction = function() {
  if (this.current_scene == "game" && (this.game_phase == "active" || this.game_phase == "tutorial")) {
    if (this.game_phase != "tutorial" || this.tutorial_number >= 2.5) {
      this.launchpad.shiftRight();
      if (this.game_phase == "tutorial") {
        if (this.tutorial_number == 2.5) {
          this.tutorial_number = 2.75
        } else if (this.tutorial_number == 2.75) {
          this.tutorial3();
        }
      }
    }
  }
}


Game.prototype.leftArrowAction = function() {
  if (this.current_scene == "game" && (this.game_phase == "active" || this.game_phase == "tutorial")) {
    if (this.game_phase != "tutorial" || this.tutorial_number >= 2.5) {
      this.launchpad.shiftLeft();
      if (this.game_phase == "tutorial") {
        if (this.tutorial_number == 2.5) {
          this.tutorial_number = 2.75
        } else if (this.tutorial_number == 2.75) {
          this.tutorial3();
        }
      }
    }
  }
}



Game.prototype.enterAction = function() {
  if (this.current_scene == "game" && (this.game_phase == "active" || this.game_phase == "tutorial")) {
    if (this.game_phase != "tutorial" || this.tutorial_number >= 5) {
      this.launchpad.launch(this.player_area);
      if (this.game_phase == "tutorial" && this.tutorial_number == 5) {
        this.tutorial6();
      }
    }
  }
}



Game.prototype.handleKeyDown = function(ev) {
  // ev.preventDefault();
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

  if (ev.key === "Enter") {
    this.enterAction();
  }
}
