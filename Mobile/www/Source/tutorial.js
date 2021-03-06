


Game.prototype.tutorial1 = function() {
  var self = this;
  var scene = this.scenes["game"];
  this.game_phase = "tutorial";
  this.tutorial_number = 1;

  this.pickDefense(0,0);

  this.tutorial_screen = this.makeTutorialScreen(scene, 2000, 20, this.player_palette.position.y - 108, 748, this.player_palette.position.y + 108, "HERE IS A KEYBOARD. PLEASE START TYPING.", this.width / 2, 660);

  this.tutorial_1_snide_clicks = 0;
  this.tutorial_1_snide_click_responses = [
    "NO, USE YOUR REAL KEYBOARD, JERK.",
    "OOF, STUBBORN.",
    "HEY, START TYPING ON KEYS.",
    "ACTUAL KEYS.",
    "HEY! LOOK DOWN. LOOK. DOWN.",
    "PRESS K. JUST DO IT.",
    "FINE, I GIVE UP.",
  ]

  for (var i = 0; i < 26; i++) {
    this.player_palette.letters[letter_array[i]].inner_action = function(letter) {
      if (self.game_phase == "tutorial" && self.tutorial_number == 1) {
        self.tutorial_screen.tutorial_text.text = self.tutorial_1_snide_click_responses[Math.min(6, self.tutorial_1_snide_clicks)];
        self.tutorial_1_snide_clicks += 1
      }
    }
  }

  for (var i = 0; i < 10; i++) {
    this.launchpad.cursors[i].visible = true;
  }
}


Game.prototype.tutorial2 = function() {
  var self = this;
  var scene = this.scenes["game"];
  
  this.tutorial_number = 1.5;
  this.tutorial_screen.tutorial_text.text = "Good.";

  setTimeout(function() {
    self.tutorial_screen.fade(500);
    self.tutorial_number = 2;
    self.tutorial_screen = self.makeTutorialScreen(scene, 500, 5, 700, 505, 810, "THIS IS THE LAUNCHPAD.", self.width / 2, 560);

    setTimeout(function() {
      self.tutorial_number = 2.5;
      self.tutorial_screen.tutorial_text.text = "PRESS THE LEFT AND RIGHT KEYS\nTO MOVE THE WORD.";
    }, 2500);

  }, 2000);
}


Game.prototype.tutorial3 = function() {
  var self = this;
  var scene = this.scenes["game"];
  
  this.tutorial_number = 3;
  this.tutorial_screen.tutorial_text.text = "PRESS DELETE OR BACKSPACE\nTO DELETE A LETTER.";
}


Game.prototype.tutorial4 = function() {
  var self = this;
  var scene = this.scenes["game"];
  
  this.tutorial_number = 4;
  this.tutorial_screen.tutorial_text.text = "IF THE WORD IS NOT IN THE ENGLISH DICTIONARY\nOR IT'S TOO SHORT, OR WAS ALREADY PLAYED,\nA LITTLE RED MARKER WILL APPEAR.";

  setTimeout(function() {
    self.tutorial_number = 4.2;
    self.tutorial_screen.tutorial_text.text = "IF THE WORD IS VALID, YOU CAN LAUNCH IT.";
  }, 4000);

  setTimeout(function() {
    self.tutorial5();
  }, 7000);
}


Game.prototype.tutorial5 = function() {
  var self = this;
  var scene = this.scenes["game"];
  
  this.tutorial_number = 5;
  this.tutorial_screen.tutorial_text.text = "GO AHEAD. MAKE A WORD\nAND PRESS ENTER TO LAUNCH IT.";
}


Game.prototype.tutorial6 = function() {
  var self = this;
  var scene = this.scenes["game"];
  
  this.tutorial_number = 6;

  setTimeout(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(scene, 250, 5, 5, 505, 705, "IT FLIES UP HERE,", 255, 275);
  }, 500);
}


Game.prototype.tutorial7 = function() {
  var self = this;
  var scene = this.scenes["game"];
  console.log("I am in tutorial 7");
  
  this.tutorial_number = 7;

  self.tutorial_screen.fade(250);
  self.tutorial_screen = self.makeTutorialScreen(scene, 250, 510, 5, 760, 355, "COMES DOWN HERE,", 600, 200);
}


Game.prototype.tutorial8 = function() {
  var self = this;
  var scene = this.scenes["game"];
  console.log("I am in tutorial 8");
  
  this.tutorial_number = 8;
  this.enemy_last_action = Date.now();

  self.tutorial_screen.fade(250);
  self.tutorial_screen = self.makeTutorialScreen(scene, 250, 510, 390, 760, 460, "AND CRASHES INTO THE SOVIET'S KEYBOARD,\nTEMPORARILY DISABLING SOME KEYS.", 380, 530);
}


Game.prototype.tutorial9 = function() {
  var self = this;
  var scene = this.scenes["game"];
  console.log("I am in tutorial 9");
  
  this.tutorial_number = 9;

  self.tutorial_screen.fade(250);
  self.tutorial_screen = self.makeTutorialScreen(scene, 250, 510, 5, 760, 355, "THE SOVIET WILL FIRE ROCKETS", 380, 200);
}


Game.prototype.tutorial10 = function() {
  var self = this;
  var scene = this.scenes["game"];
  
  this.tutorial_number = 10;

  setTimeout(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(scene, 250, 5, 5, 505, 705, "WHICH COME DOWN ON YOU!", 255, 275);
  }, 500);
}


Game.prototype.tutorial11 = function() {
  var self = this;
  var scene = this.scenes["game"];
  
  this.tutorial_number = 11;

  this.pickDefense(6, 10);

  setTimeout(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(scene, 250, 20, self.player_palette.position.y - 108, 748, self.player_palette.position.y + 108, "YOU HAVE 3 BLUE KEYS TO DEFEND", self.width / 2, 660);
  }, 500);

  setTimeout(function() {
    self.tutorial12();
  }, 3000);
}


Game.prototype.tutorial12 = function() {
  var self = this;
  var scene = this.scenes["game"];
  console.log("I am in tutorial 12");
  
  this.tutorial_number = 12;

  self.tutorial_screen.fade(250);
  self.tutorial_screen = self.makeTutorialScreen(scene, 250, 510, 390, 760, 460, "AND SO DOES THE SOVIET.", 380, 530);

  setTimeout(function() {
    self.tutorial_screen.tutorial_text.text = "WHEN BLUE KEYS ARE HIT,\nTHEY'RE PERMANENTLY DISABLED.";
  }, 3000);


  setTimeout(function() {
    self.tutorial_screen.tutorial_text.text = "TAKE OUT HIS THREE KEYS\nBEFORE HE GETS YOURS.";
  }, 6000); 


  setTimeout(function() {
    self.tutorial_screen.tutorial_text.text = "OKAY, READY?";
  }, 9000);


  setTimeout(function() {
    // for (var i = 0; i < letter_array.length; i++) {
    //   var letter = letter_array[i];
    //   self.player_palette.letters[letter].enable();
    //   self.enemy_palette.letters[letter].enable();
    // }
    // self.tutorial_screen.fade()
    // self.start_time = Date.now();
    // self.game_phase = "countdown";
    // if (annoying) self.soundEffect("countdown");
    self.tutorial = false;
    self.resetBoard();
  }, 12000); 
}






