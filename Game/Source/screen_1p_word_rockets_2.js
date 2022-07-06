

Game.prototype.initialize1pWordRockets = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  this.clearScreen(screen);

  this.freefalling = [];
  this.played_words = {};

  this.shakers = [];

  this.rocket_letters = [];

  this.wpm_history = [];
  this.calculated_wpm = 0;
  this.display_wpm = 0;

  this.resetBoard();

  if (this.tutorial) {
    this.tutorial1();
  } else {
    this.game_phase = "pre_game";

    delay(function() {
      self.paused = false;
      self.pause_time = 0;
      self.start_time = self.markTime();
      self.game_phase = "countdown";
      self.soundEffect("countdown");
    }, 1200);
  }
}


Game.prototype.resetBoard = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  this.game_board = new PIXI.Container();
  screen.addChild(this.game_board);
  this.game_board.scale.set(2, 2);
  
  var far_background = new PIXI.Sprite(PIXI.Texture.from("Art/Word_Rockets/placeholder_map.png"));
  far_background.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  far_background.anchor.set(0, 0);
  this.game_board.addChild(far_background);



  // the player's launchpad
  this.launchpad = new Launchpad(this, this.game_board, 1, 0, 0, 32, 32, false);
}

Game.prototype.updateDisplayInfo = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
}




Game.prototype.shakeDamage = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  // for (let item of [screen, this.player_area, this.enemy_area]) {
  for (let item of this.shakers) {
    if (item.shake != null) {
      if (item.permanent_x == null) item.permanent_x = item.position.x;
      if (item.permanent_y == null) item.permanent_y = item.position.y;
      item.position.set(item.permanent_x - 3 + Math.random() * 6, item.permanent_y - 3 + Math.random() * 6)
      if (this.timeSince(item.shake) >= 150) {
        item.shake = null;
        item.position.set(item.permanent_x, item.permanent_y)
      }
    }
  }
}


Game.prototype.freeeeeFreeeeeFalling = function(fractional) {
  var self = this;
  var screen = this.screens[this.current_screen];

  for (let i = 0; i < this.freefalling.length; i++) {
    let item = this.freefalling[i];
    item.position.x += item.vx * fractional;
    item.position.y += item.vy * fractional;
    if (item.type != "ember") {
      item.vy += this.gravity * fractional;
    } else {
      item.alpha *= 0.97;
      item.vy += this.gentle_drop * fractional;
      if (item.vy > this.gentle_limit) item.vy = this.gentle_limit;
    }

    // TODO: this needs to be 200 for the player areas and 960 for the screen in total.
    if (item.position.y > 960 || item.alpha < 0.04) {
      if (item.parent != null) {
        item.parent.removeChild(item);
      }
      item.status = "dead";
    }
  }

  let new_freefalling = [];
  for (let i = 0; i < this.freefalling.length; i++) {
    let item = this.freefalling[i];
    if (item.status != "dead") {
      new_freefalling.push(item);
    }
  }
  this.freefalling = new_freefalling;
}



Game.prototype.singlePlayerGameUpdate = function(diff) {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  let fractional = diff / (1000/30.0);

  if (this.game_phase == "tutorial") {
    this.tutorial_screen.tutorial_text.hover();
  }

  // this.spellingHelp();
  // this.updateDisplayInfo();
  // this.shakeDamage();
  // this.launchpad.checkError();
  // this.freeeeeFreeeeeFalling(fractional);
  // this.coolHotKeys();

  // // Skip the rest if we aren't in active gameplay
  // if (this.game_phase != "active" && (this.game_phase != "tutorial" || this.tutorial_number < 5)) {
  //   return;
  // }

  // this.enemyAction();  
  // this.spawnBomb();
  // this.boostRockets(fractional);
  // this.checkBombCollisions();
  // this.checkRocketScreenChange();
  // this.checkRocketCollisions();
  // this.checkRocketAttacks();
  // this.cleanRockets();
}




