

Game.prototype.makeTutorialScreen = function(parent, fade_in_time, box_left, box_top, box_right, box_bottom, text, text_x, text_y) {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  let tutorial_screen = new PIXI.Container();
  parent.addChild(tutorial_screen);

  let right_mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
  right_mask.anchor.set(0, 0.5);
  right_mask.height = this.height;
  right_mask.width = this.width - box_right;
  right_mask.position.set(box_right, this.height / 2)
  right_mask.alpha = 0.0;
  right_mask.tint = 0x000000;
  tutorial_screen.addChild(right_mask);
  new TWEEN.Tween(right_mask)
    .to({alpha: 0.6})
    .duration(fade_in_time)
    .start()

  let left_mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
  left_mask.anchor.set(1, 0.5);
  left_mask.height = this.height;
  left_mask.width = box_left;
  left_mask.position.set(box_left, this.height / 2)
  left_mask.alpha = 0.0;
  left_mask.tint = 0x000000;
  tutorial_screen.addChild(left_mask);
  new TWEEN.Tween(left_mask)
    .to({alpha: 0.6})
    .duration(fade_in_time)
    .start()

  let bottom_mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
  bottom_mask.anchor.set(0, 0);
  bottom_mask.height = this.height - box_bottom;
  bottom_mask.width = box_right - box_left;
  bottom_mask.position.set(box_left, box_bottom)
  bottom_mask.alpha = 0.0;
  bottom_mask.tint = 0x000000;
  tutorial_screen.addChild(bottom_mask);
  new TWEEN.Tween(bottom_mask)
    .to({alpha: 0.6})
    .duration(fade_in_time)
    .start()

  let top_mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
  top_mask.anchor.set(0, 1);
  top_mask.height = box_top;
  top_mask.width = box_right - box_left;
  top_mask.position.set(box_left, box_top)
  top_mask.alpha = 0.0;
  top_mask.tint = 0x000000;
  tutorial_screen.addChild(top_mask);
  new TWEEN.Tween(top_mask)
    .to({alpha: 0.6})
    .duration(fade_in_time)
    .start()

  let tutorial_text = new PIXI.Text(text, {fontFamily: "Bebas Neue", fontSize: 30, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  tutorial_text.anchor.set(0.5,0.5);
  tutorial_text.position.set(text_x, text_y);
  tutorial_screen.addChild(tutorial_text);
  tutorial_text.permanent_x = text_x;
  tutorial_text.permanent_y = text_y;
  tutorial_text.start_time = this.markTime();
  tutorial_text.alpha = 0
  tutorial_text.hover = function() {
    tutorial_text.position.set(tutorial_text.permanent_x, tutorial_text.permanent_y + 20 * Math.sin((self.timeSince(tutorial_text.start_time)) / 400));
  }
  tutorial_screen.tutorial_text = tutorial_text;
  new TWEEN.Tween(tutorial_text)
    .to({alpha: 1})
    .duration(fade_in_time)
    .start()

  tutorial_screen.fade = function(fade_out_time) {
    new TWEEN.Tween(tutorial_screen)
      .to({alpha: 0.0})
      .duration(fade_out_time)
      .onComplete(function() {
        parent.removeChild(tutorial_screen);
      })
      .start()
  }

  return tutorial_screen;
}


Game.prototype.tutorial1 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  this.game_phase = "tutorial";
  this.tutorial_number = 1;

  this.tutorial_screen = this.makeTutorialScreen(screen, 2000, 80, 656, 856, 953, "HERE IS A KEYBOARD. PLEASE START TYPING.", this.width / 2, 620);

  this.tutorial_1_snide_clicks = 0;
  this.tutorial_1_snide_click_responses = [
    "NO, USE YOUR ACTUAL KEYBOARD, KID.",
    "STUBBORN!",
    "HEY, START TYPING ON KEYS.",
    "ACTUAL KEYS.",
    "HEY! LOOK DOWN. LOOK. DOWN.",
    "PRESS K. JUST DO IT.",
    "FINE, I GIVE UP.",
  ]

  for (var i = 0; i < 10; i++) {
    this.launchpad.cursors[i].visible = true;
  }
}


Game.prototype.tutorial2 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 1.5;
  this.tutorial_screen.tutorial_text.text = "GOOD.";

  delay(function() {
    self.tutorial_screen.fade(500);
    self.tutorial_number = 2;
    self.tutorial_screen = self.makeTutorialScreen(screen, 500, 264, 479, 675, 535, "THIS IS THE LAUNCHPAD.", self.width / 2, 600);
  }, 2000);


  delay(function() {
    self.tutorial_screen.tutorial_text.text = "A WORD APPEARS HERE AS YOU TYPE.";
  }, 5000);

  delay(function() {
    self.tutorial_conditions = {};
    self.tutorial_number = 2.5;
    self.tutorial_screen.tutorial_text.text = "PRESS THE LEFT AND RIGHT KEYS TO MOVE YOUR WORD A BIT.";
  }, 8000);
}


Game.prototype.tutorial275 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  this.tutorial_conditions = {};
  this.tutorial_number = 2.75;
  this.tutorial_screen.tutorial_text.text = "PRESS LEFT AND RIGHT SHIFT TO MOVE YOUR WORD ALL THE WAY TO THE SIDES.";
}


Game.prototype.tutorial3 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 3;
  this.tutorial_screen.tutorial_text.text = "PRESS DELETE OR BACKSPACE TO DELETE A LETTER.";
}


Game.prototype.tutorial35 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 3.5;
  this.tutorial_screen.tutorial_text.text = "PRESS ESCAPE TO DELETE THE WHOLE WORD.";
}


Game.prototype.tutorial4 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 4;
  this.tutorial_screen.tutorial_text.text = "YOUR WORD MUST BE IN THE ENGLISH DICTIONARY.";

  delay(function() {
    self.tutorial_screen.tutorial_text.text = "IT CAN'T BE TOO SHORT, AND YOU CAN'T PLAY A WORD TWICE.";
  }, 4000);

  delay(function() {
    self.tutorial_screen.tutorial_text.text = "IF YOUR WORD IS INVALID, A RED MARKER WILL APPEAR UNDERNEATH.";
  }, 8000);

  delay(function() {
    self.tutorial_number = 4.2;
    self.tutorial_screen.tutorial_text.text = "IF YOUR WORD IS VALID, YOU CAN LAUNCH IT AT THE SOVIET COMPUTER.";
  }, 12000);

  delay(function() {
    self.tutorial5();
  }, 16000);
}


Game.prototype.tutorial5 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 5;
  this.tutorial_screen.tutorial_text.text = "GO AHEAD. MAKE A WORD AND PRESS ENTER TO LAUNCH IT.";
}


Game.prototype.tutorial6 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 6;

  delay(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(screen, 250, 260, 30, 671, 531, "IT FLIES UP HERE...", 480, 275);
  }, 500);
}


Game.prototype.tutorial7 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  console.log("I am in tutorial 7");
  
  this.tutorial_number = 7;

  self.tutorial_screen.fade(250);
  self.tutorial_screen = self.makeTutorialScreen(screen, 250, 958, 92, 1168, 348, "COMES DOWN HERE...", 700+350, 200+152);
}


Game.prototype.tutorial8 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  console.log("I am in tutorial 8");
  
  this.tutorial_number = 8;
  this.enemy_last_action = this.markTime();

  self.tutorial_screen.fade(250);
  self.tutorial_screen = self.makeTutorialScreen(screen, 250, 867, 394, 1259, 548, "AND CRASHES INTO THE SOVIET'S KEYBOARD,\nTEMPORARILY DISABLING SOME KEYS.", 430+520, 500+66);
}


Game.prototype.tutorial9 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  console.log("I am in tutorial 9");
  
  this.tutorial_number = 9;

  self.tutorial_screen.fade(250);
  self.tutorial_screen = self.makeTutorialScreen(screen, 250, 958, 92, 1168, 348, "THE SOVIET WILL FIRE ROCKETS...", 700+250, 200+152);
}


Game.prototype.tutorial10 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 10;

  delay(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(screen, 250, 260, 30, 671, 531, "WHICH COME DOWN ON YOU!", 470, 275);
  }, 500);
}


Game.prototype.tutorial11 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 11;

  delay(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(screen, 250, 80, 656, 856, 953, "WHEN KEYS ARE DAMAGED, THEY'RE TEMPORARILY UNABLE TO MAKE ROCKETS.", self.width / 2, 620);
  }, 500);

  delay(function() {
    self.tutorial12();
  }, 4000);
}


Game.prototype.tutorial12 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  console.log("I am in tutorial 12");
  
  this.tutorial_number = 12;

  self.tutorial_screen.tutorial_text.text = "YOU HAVE 3 BLUE KEYS TO DEFEND.";

  delay(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(screen, 250, 867, 394, 1259, 548, "AND SO DOES THE SOVIET.", self.width / 2 + 50, 580);
  }, 4000);


  delay(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(screen, 250, 80, 656, 856, 953, "WHEN BLUE KEYS ARE HIT, THEY'RE PERMANENTLY DAMAGED.", self.width / 2, 620);
  }, 8000);


  delay(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(screen, 250, 264, 479, 675, 535, "HEY, GO GO GO! MAKE SOME WORDS!", self.width / 2, 600);
  }, 12000);


  delay(function() {
    self.tutorial_screen.tutorial_text.text = "DESTROY THE SOVIET'S BLUE KEYS BEFORE THEY DESTROY YOURS!";
  }, 16000); 


  delay(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(screen, 250, 0, 0, 0, 0, "OKAY. YOU GET THE IDEA, RIGHT?", self.width / 2, 600);
  }, 20000);


  delay(function() {
    self.tutorial_screen.tutorial_text.text = "TIME TO RESET AND PLAY FOR REAL. READY?";
  }, 24000);


  delay(function() {
    self.tutorial = false;
    self.initialize1pWordRockets();
  }, 28000); 
}



////
////
////
////


Game.prototype.bc_tutorial1 = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];
  this.game_phase = "tutorial";
  this.tutorial_number = 1;

  this.tutorial_screen = this.makeTutorialScreen(screen, 2000, 80, 0, 860, 585, "WELCOME TO BASE CAPTURE!", this.width / 2, 620);


  delay(function() {
    self.tutorial_screen.tutorial_text.text = "IN THIS GAME, YOU WILL BUILD A BASE OUT OF \nCROSSWORD PUZZLE STYLE WORDS.";
  }, 4000);

  delay(function() {
    self.tutorial_screen.tutorial_text.text = "PLEASE START TYPING TO MAKE YOUR FIRST WORD.";
  }, 8000);
}




