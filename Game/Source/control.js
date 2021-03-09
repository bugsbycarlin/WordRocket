

Game.prototype.keyAction = function(letter) {
  if (this.player_palette.letters[letter].interactive == true) {
    this.launchpad.push(this.player_palette, letter);
  } else {
    this.soundEffect("negative");
    this.launchpad.flashError();
    this.player_palette.letters[letter].error = 5;
  }

  if (this.game_phase == "tutorial" && this.tutorial_number == 1) {
    this.tutorial2();
  }
}


Game.prototype.deleteAction = function() {
  this.launchpad.pop();
  if (this.game_phase == "tutorial" && this.tutorial_number == 3) {
    this.tutorial4();
  }
}


Game.prototype.rightArrowAction = function() {
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


Game.prototype.leftArrowAction = function() {
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



Game.prototype.enterAction = function() {
  if (this.game_phase != "tutorial" || this.tutorial_number >= 5) {
    this.launchpad.launch(this.player_area);
    if (this.game_phase == "tutorial" && this.tutorial_number == 5) {
      this.tutorial6();
    }
  }
}



Game.prototype.handleKeyDown = function(ev) {
  // ev.preventDefault();

  if (this.current_scene == "game" && (this.game_phase == "active" || this.game_phase == "tutorial")) {
    // if the launchpad isn't full, we can keep adding letters
    if (!this.launchpad.full()) {
      for (i in lower_array) {
        if (ev.key === lower_array[i] || ev.key === letter_array[i]) {
          this.keyAction(letter_array[i]);
        }
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
}
