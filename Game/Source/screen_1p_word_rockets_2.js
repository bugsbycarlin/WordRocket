

Game.prototype.initialize1pWordRockets = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  this.clearScreen(screen);

  this.freefalling = [];
  this.pickers = [];
  this.played_words = {};
  this.bombs = [];

  this.shakers = [];

  this.rocket_letters = [];

  // this.level = 18;

  // this.pickDefense(6, 10);

  this.bomb_spawn_last = self.markTime();
  this.bomb_spawn_next = bomb_spawn_interval * (0.8 + 0.4 * Math.random());

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

  // var far_background = new PIXI.Sprite(PIXI.Texture.from("Art/game_far_background.png"));
  // far_background.anchor.set(0, 0);
  // screen.addChild(far_background);


  // the player's board
  this.player_area = new PIXI.Container();
  screen.addChild(this.player_area);
  this.player_area.position.set(0, 0);

  // this.player_live_area = new PIXI.Container();
  // screen.addChild(this.player_live_area);
  // this.player_live_area.position.set(this.player_area.x, this.player_area.y);
  // this.player_live_area.scale.set(this.player_area.scale.x, this.player_area.scale.y);

  // var play_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  // play_mat.width = 32 * board_width;
  // play_mat.height = 32 * 14;
  // play_mat.anchor.set(0, 1);
  // play_mat.position.set(0, -32);
  // play_mat.tint = 0x303889;
  // // play_mat.visible = false;
  // this.player_area.addChild(play_mat);

  // the player's launchpad
  //this.launchpad = new Launchpad(this, this.player_area, 1, 0, 0, 32, 32, false);

  

  for (let i = 0; i < 2; i++) {
    let rock_wall = new PIXI.Container();
    this.player_area.addChild(rock_wall);
    for (let m = 0; m < 52; m++) {
      for (let n = 0; n < 30; n++) {
        let tile = PIXI.Sprite.from(PIXI.Texture.WHITE);
        c = (30 + Math.floor(Math.random() * 30)) / 255.0;
        tile.tint = PIXI.utils.rgb2hex([c,c,c]);
        tile.width = 32;
        tile.height = 32;
        shift = i == 0 ? 0 : (board_width + 4) * 32;
        tile.position.set(32 * m, 32 * n);
        rock_wall.addChild(tile);
      }
    }
    rock_wall.cacheAsBitmap = true;
    console.log("this happened");
  }
  console.log("yo done");

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




