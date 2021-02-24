

Game.prototype.initializeSoloScreen = function() {
  var self = this;
  this.clearScene(this.scenes["solo"]);

  this.freefalling = [];
  this.pickers = [];
  this.played_words = {};

  this.rocket_letters = [];

  // the qwerty palette
  this.player_palette = this.makeQwertyPalette(this.scenes["solo"], 72, this.width * 1/2, this.height - 118, function(letter) {
    console.log(letter);
  });

  // this.player_palette.letters["A"].disable();

  // the player's board
  this.player_area = new PIXI.Container();
  this.scenes["solo"].addChild(this.player_area);
  this.player_area.position.set(6,756);
  // this.player_area.scale.set(0.5,0.5);

  var play_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  play_mat.width = 500;
  play_mat.height = 750;
  play_mat.anchor.set(0, 1);
  play_mat.position.set(0, 0);
  play_mat.tint = 0x4D4D4D;
  this.player_area.addChild(play_mat);

  // the player's launchpad
  this.launchpad = new Launchpad(this, this.scenes["solo"], 1, this.player_area, 6, 756, 50, 48);

  // the enemy board
  this.enemy_area = new PIXI.Container();
  this.scenes["solo"].addChild(this.enemy_area);
  this.enemy_area.position.set(512,381);
  this.enemy_area.scale.set(0.5,0.5);
  var enemy_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  enemy_mat.width = 500;
  enemy_mat.height = 750;
  enemy_mat.anchor.set(0, 1);
  enemy_mat.position.set(0, 0);
  enemy_mat.tint = 0x4D4D4D;
  this.enemy_area.addChild(enemy_mat);

  // the enemy palette
  this.enemy_palette = this.makeQwertyPalette(this.scenes["solo"], 24, 636, 426, function(letter) {
    console.log(letter);
  });

  this.enemy_wpm = 17;
  this.enemy_last_action = Date.now();
  this.enemy_rerolls = 6;
  this.enemy_short_word = 4;
  this.enemy_long_word = 6;

  this.gravity = 6;
  this.boost = 0.25;
  this.gentle_drop = 0.1;
  this.gentle_limit = 12.5;
  this.boost_limit = -40;

  this.game_phase = "active";
}


Game.prototype.enemyAction = function(rerolls) {
  var word_size = this.enemy_short_word + Math.floor(Math.random() * (1 + this.enemy_long_word - this.enemy_short_word));
  var word_list = Object.keys(this.enemy_words[word_size]);
  var new_word = word_list[Math.floor(Math.random() * word_list.length)];

  var legal_keys = true;
  for (var i = 0; i < new_word.length; i++) {
    if (this.enemy_palette.letters[new_word[i]].interactive == false) legal_keys = false;
  }
  if (legal_keys == false) {
    console.log("Tried to use the word " + new_word + " but it was using disabled keys");
  }

  if ((legal_keys == false || new_word in this.played_words) && rerolls > 0) {
    this.enemyAction(rerolls - 1);
  } else if (!(new_word in this.played_words) && legal_keys == true) {
    var shift = Math.floor(Math.random() *(11 - new_word.length));
    this.addEnemyWord(new_word, shift);
  }
}


Game.prototype.addEnemyWord = function(word, shift) {
  this.played_words[word] = 1;
  console.log("Shift " + shift);
  for (var i = 0; i < word.length; i++) {
    var letter = word[i];

    let rocket_tile = this.makeRocketTile(this.enemy_area, letter, i, shift, 2, 48, 50);

    this.rocket_letters.push(rocket_tile);
  }
}


Game.prototype.soloUpdate = function() {
  var self = this;

  if (this.game_phase != "active") {
    return;
  }

  if (Date.now() - this.enemy_last_action > 60000/this.enemy_wpm) {
    this.enemyAction(this.enemy_rerolls);
    this.enemy_last_action = Date.now() - 0.2 * (60000/this.enemy_wpm) + 0.4 * Math.random() * 60000/this.enemy_wpm;
  }
  for (var i = 0; i < this.freefalling.length; i++) {
    var item = this.freefalling[i];
    item.position.x += item.vx;
    item.position.y += item.vy;
    item.vy += this.gravity;
    if (item.position.y > this.height * 1.25) {
      item.parent.removeChild(item);
      item.status = "dead";
    }
  }

  var new_freefalling = [];
  for (var i = 0; i < this.freefalling.length; i++) {
    var item = this.freefalling[i];
    if (item.status != "dead") {
      new_freefalling.push(item);
    }
  }
  this.freefalling = new_freefalling;

  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];
    // rocket.angle = 0;
    if (rocket.status === "rocket") {
      rocket.position.y += rocket.vy;
      rocket.vy -= this.boost;
      if (rocket.vy < this.boost_limit) rocket.vy = this.boost_limit;
    } else if (rocket.status === "descent") {
      rocket.position.y += rocket.vy;
      rocket.vy += this.gentle_drop;
      if (rocket.vy > this.gentle_limit) rocket.vy = this.gentle_limit;
      // rocket.angle = 5 * Math.sin((Date.now() - rocket.start_time) / 400)
    }
  }

  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];
    if (rocket.status === "rocket" && rocket.position.y < -780) {
      console.log("switching");
      let y = rocket.position.y;
      let x = rocket.position.x;
      rocket.fire_sprite.visible = false;
      rocket.parachute_sprite.visible = true;
      rocket.vy = 0;
      if (rocket.player == 1) {
        this.player_area.removeChild(rocket);
        this.enemy_area.addChild(rocket);
      } else if (rocket.player == 2) {
        this.enemy_area.removeChild(rocket);
        this.player_area.addChild(rocket);
      }
      rocket.position.set(x, y);
      rocket.status = "descent";
    }
  }

  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket_1 = this.rocket_letters[i];
    for (var j = 0; j < this.rocket_letters.length; j++) {
      var rocket_2 = this.rocket_letters[j];
      if (rocket_1.column == rocket_2.column && rocket_1.parent == rocket_2.parent) {
        if (rocket_1.status == "rocket" && rocket_2.status == "descent"
          && rocket_1.position.y < rocket_2.position.y) {
          // blooie
          rocket_1.status = "falling";
          rocket_1.vx = -10 + Math.random() * 20;
          rocket_1.vy = -4 - Math.random() * 14;
          this.freefalling.push(rocket_1);
          rocket_2.status = "falling";
          rocket_2.vx = -10 + Math.random() * 20;
          rocket_2.vy = -4 - Math.random() * 14;
          this.freefalling.push(rocket_2);
        }
      }
    }
  }


  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];

    if (rocket.status == "descent" && rocket.y > 0) {
      rocket.status = "falling";
      this.freefalling.push(rocket);
      rocket.vx = -10 + Math.random() * 20;
      rocket.vy = -4 - Math.random() * 14;
      if (rocket.player == 1) {
        let disabled_letter = rocket.letter;
        if (this.enemy_palette.letters[disabled_letter].interactive == true) {
          this.enemy_palette.letters[disabled_letter].disable();
          
          let fire = this.makeFire(this.scenes["solo"], 
            this.enemy_palette.letters[disabled_letter].x + this.enemy_palette.position.x,
            this.enemy_palette.letters[disabled_letter].y + this.enemy_palette.position.y - 12,
            0.1, 0.25/3);
          setTimeout(function() {
            self.scenes["solo"].removeChild(fire);
            self.enemy_palette.letters[disabled_letter].enable()
          }, 5000);
        }
      } else {
        let disabled_letter = rocket.letter;
        if (this.player_palette.letters[disabled_letter].interactive == true) {
          this.player_palette.letters[disabled_letter].disable();
          
          let fire = this.makeFire(this.scenes["solo"], 
            this.player_palette.letters[disabled_letter].x + this.player_palette.position.x,
            this.player_palette.letters[disabled_letter].y + this.player_palette.position.y - 36,
            0.3, 0.25);
          setTimeout(function() {
            self.scenes["solo"].removeChild(fire);
            self.player_palette.letters[disabled_letter].enable()
          }, 5000);
        }
      }
    }
  }

  var new_rocket_letters = [];
  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];

    if (rocket.status != "dead" && rocket.status != "falling") {
      new_rocket_letters.push(rocket);
    }
  }
  this.rocket_letters = new_rocket_letters;
  // var new_rocket_letters = [];
  // for (var i = 0; i < this.rocket_letters.length; i++) {
  //   var rocket = this.rocket_letters[i];
  //   if (rocket.status != "dead") {
  //     new_freefalling.push(item);
  //   }
  // }
  // this.freefalling = new_freefalling;
}


