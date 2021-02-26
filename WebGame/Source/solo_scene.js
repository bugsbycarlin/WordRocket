
annoying = true;
use_scores = false;

Game.prototype.initializeSoloScreen = function() {
  this.level = 1;
  this.score = 0;

  this.resetBoard();
}

Game.prototype.resetBoard = function() {
  var self = this;
  this.clearScene(this.scenes["solo"]);

  this.freefalling = [];
  this.pickers = [];
  this.played_words = {};

  this.rocket_letters = [];

  this.pickDefense(6, 10);

  // the qwerty palette
  this.player_palette = this.makeQwertyPalette(this.scenes["solo"], 72, this.width * 1/2, this.height - 118, function(letter) {
    console.log(letter);
  });

  for (var i = 0; i < this.player_defense.length; i++) {
    this.player_palette.letters[this.player_defense[i]].backing.tint = 0x63bff5;
  }


  // the enemy palette
  this.enemy_palette = this.makeQwertyPalette(this.scenes["solo"], 24, 636, 426, function(letter) {
  });

  for (var i = 0; i < this.enemy_defense.length; i++) {
    this.enemy_palette.letters[this.enemy_defense[i]].backing.tint = 0x63bff5;
  }


  // the player's board
  this.player_area = new PIXI.Container();
  this.scenes["solo"].addChild(this.player_area);
  this.player_area.position.set(6,756);
  // this.player_area.scale.set(0.5,0.5);

  var play_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  play_mat.width = 500;
  play_mat.height = 700;
  play_mat.anchor.set(0, 1);
  play_mat.position.set(0, -50);
  play_mat.tint = 0x4D4D4D;
  this.player_area.addChild(play_mat);

  var pad_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  pad_mat.width = 500;
  pad_mat.height = 50;
  pad_mat.anchor.set(0, 1);
  pad_mat.position.set(0, 0);
  pad_mat.tint = 0xCCCCCC;
  this.player_area.addChild(pad_mat);

  // the player's launchpad
  this.launchpad = new Launchpad(this, this.scenes["solo"], 1, this.player_area, 6, 756, 50, 48);

  // the enemy board
  this.enemy_area = new PIXI.Container();
  this.scenes["solo"].addChild(this.enemy_area);
  this.enemy_area.position.set(512,381);
  this.enemy_area.scale.set(0.5,0.5);
  var enemy_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  enemy_mat.width = 500;
  enemy_mat.height = 700;
  enemy_mat.anchor.set(0, 1);
  enemy_mat.position.set(0, -50);
  enemy_mat.tint = 0x4D4D4D;
  this.enemy_area.addChild(enemy_mat);
  var enemy_pad_math = PIXI.Sprite.from(PIXI.Texture.WHITE);
  enemy_pad_math.width = 500;
  enemy_pad_math.height = 50;
  enemy_pad_math.anchor.set(0, 1);
  enemy_pad_math.position.set(0, 0);
  enemy_pad_math.tint = 0xCCCCCC;
  this.enemy_area.addChild(enemy_pad_math);

  this.enemy_wpm = 20;
  this.enemy_last_action = Date.now();
  this.enemy_rerolls = 6;
  this.enemy_short_word = 4;
  this.enemy_long_word = 6;

  this.gravity = 6;
  this.boost = 0.25;
  this.gentle_drop = 0.1;
  this.gentle_limit = 12.5;
  this.boost_limit = -40;

  this.game_phase = "pre_game";

  for (var i = 0; i < 10; i++) {
    this.launchpad.cursors[i].visible = false;
  }

  this.countdown_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.countdown_text.anchor.set(0.5,0.5);
  this.countdown_text.position.set(this.width * 1/2, this.height * 1/2);
  this.scenes["solo"].addChild(this.countdown_text);

  setTimeout(function() {
    self.start_time = Date.now();
    self.game_phase = "countdown";
    if (annoying) self.soundEffect("countdown");
  }, 1200);
}


Game.prototype.pickDefense = function(number, retries) {
  shuffleArray(shuffle_letters);
  let player_picks = shuffle_letters.slice(0, number/2);
  let enemy_picks = shuffle_letters.slice(number/2 + 1, number + 1);

  let score_1 = 0;
  let score_2 = 0;
  for (var i = 0; i < number/2; i++) {
    score_1 += letter_values[player_picks[i]];
    score_2 += letter_values[enemy_picks[i]];
  }
  if ((score_1 / score_2 > 1.5 || score_1 / score_2 < 1/1.5) && retries > 0) {
    this.pickDefense(number, retries - 1);
  } else {
    this.player_defense = player_picks;
    this.enemy_defense = enemy_picks;
  }

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


Game.prototype.checkEndCondition = function() {
  var self = this;
  if (this.game_phase == "active") {
    console.log("checking end condition");
    let player_dead = true;
    for (var i = 0; i < this.player_defense.length; i++) {
      console.log(this.player_defense[i]);
      console.log(this.player_palette.letters[this.player_defense[i]]);
      console.log(this.player_palette.letters[this.player_defense[i]].interactive);
      if (this.player_palette.letters[this.player_defense[i]].interactive === true) {
        player_dead = false;
      }
    }

    let enemy_dead = true;
    for (var i = 0; i < this.enemy_defense.length; i++) {
      if (this.enemy_palette.letters[this.enemy_defense[i]].interactive === true) {
        enemy_dead = false;
      }
    }


    if (enemy_dead === true || player_dead === true) {
      if (enemy_dead == true && player_dead == true) {
        this.countdown_text.text = "DRAW!";
      } else if (player_dead == true) {
        this.countdown_text.text = "GAME OVER";
      } else if (enemy_dead == true) {
        this.countdown_text.text = "VICTORY!";
      }

      this.game_phase = "gameover";

      let size = this.launchpad.wordSize();
      for (var i = 0; i < size; i++) {
        this.launchpad.pop();
      }

      for (var i = 0; i < this.rocket_letters.length; i++) {
        let rocket = this.rocket_letters[i];
        rocket.status = "falling";
        rocket.vx = -10 + Math.random() * 20;
        rocket.vy = -4 - Math.random() * 14;
        this.freefalling.push(rocket);
      }
      
      this.fadeMusic(1500);
      setTimeout(function() {self.reset()}, 4000);
    }
  }
}


Game.prototype.reset = function() {
  this.music.pause();
  this.music.currentTime = 0;
  this.resetBoard();
}


Game.prototype.soloUpdate = function() {
  var self = this;
  var scene = this.scenes["solo"];

  if (this.game_phase == "countdown") {
    let time_remaining = (2400 - (Date.now() - this.start_time)) / 800;
    console.log(Math.ceil(time_remaining).toString());
    this.countdown_text.text = Math.ceil(time_remaining).toString();
    if (time_remaining <= 0) {
      this.countdown_text.text = "GO";
      this.game_phase = "active";
      setTimeout(function() {self.countdown_text.text = "";}, 1600);
      for (var i = 0; i < 10; i++) {
        this.launchpad.cursors[i].visible = true;
      }
      if (annoying) this.setMusic("action_song");
    }
  }

  for (let item of [scene, this.player_area, this.enemy_area]) {
    if (item.shake > 0) {
      if (item.permanent_x == null) item.permanent_x = item.position.x;
      if (item.permanent_y == null) item.permanent_y = item.position.y;
      item.position.set(item.permanent_x - 3 + Math.random() * 6, item.permanent_y - 3 + Math.random() * 6)
      item.shake -= 1;
      if (item.shake <= 0) {
        item.position.set(item.permanent_x, item.permanent_y)
      }
    }
  }

  if (this.launchpad.error > 0) {
    for (item of this.launchpad.tiles) {
      item.backing.tint = 0xdb5858;
    }
    this.launchpad.error -= 1;
    if (this.launchpad.error <= 0) {
      for (item of this.launchpad.tiles) {
        item.backing.tint = 0xFFFFFF;
      }
    }
  }

  for (var i = 0; i < letter_array.length; i++) {
    var letter = letter_array[i];
    if (this.player_palette.letters[letter].error > 0) {
      this.player_palette.letters[letter].fronting.tint = 0xdb5858;
      this.player_palette.letters[letter].error -= 1;
      if (this.player_palette.letters[letter].error <= 0) {
        this.player_palette.letters[letter].fronting.tint = 0xFFFFFF;
      }
    }
  }

  for (var i = 0; i < this.freefalling.length; i++) {
    var item = this.freefalling[i];
    item.position.x += item.vx;
    item.position.y += item.vy;
    item.vy += this.gravity;
    // if (this.game_phase == "gameover" && item.parent == null)
    // { 
    //   console.log("STEVE HOLT");
    //   console.log(item);
    // }
    if (item.position.y > this.height * 1.25) {
      if (item.parent != null) item.parent.removeChild(item);
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

  if (this.game_phase != "active") {
    return;
  }

  if (Date.now() - this.enemy_last_action > 60000/this.enemy_wpm) {
    this.enemyAction(this.enemy_rerolls);
    this.enemy_last_action = Date.now() - 0.2 * (60000/this.enemy_wpm) + 0.4 * Math.random() * 60000/this.enemy_wpm;
  }

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
        rocket.parent = this.enemy_area;
      } else if (rocket.player == 2) {
        this.enemy_area.removeChild(rocket);
        this.player_area.addChild(rocket);
        rocket.parent = this.player_area;
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
          // this.soundEffect("fart");
          if (Math.random() * 100 < 50) {
            this.soundEffect("explosion_1");
          } else {
            this.soundEffect("explosion_2");
          }

          if (use_scores) {
            let v_1 = rocket_1.value;
            let v_2 = rocket_2.value;
            rocket_1.value -= v_2;
            rocket_2.value -= v_1;

            if (rocket_1.value <= 0) {
              rocket_1.status = "falling";
              rocket_1.vx = -10 + Math.random() * 20;
              rocket_1.vy = -4 - Math.random() * 14;
              this.freefalling.push(rocket_1);
            } else {
              rocket_1.value_text.text = rocket_1.value;
            }
            if (rocket_2.value <= 0) {
              rocket_2.status = "falling";
              rocket_2.vx = -10 + Math.random() * 20;
              rocket_2.vy = -4 - Math.random() * 14;
              this.freefalling.push(rocket_2);
            } else {
              rocket_2.value_text.text = rocket_2.value;
            }
          } else {
            rocket_1.status = "falling";
            rocket_1.vx = -10 + Math.random() * 20;
            rocket_1.vy = -4 - Math.random() * 14;
            this.freefalling.push(rocket_1);
          
            rocket_2.status = "falling";
            rocket_2.vx = -10 + Math.random() * 20;
            rocket_2.vy = -4 - Math.random() * 14;
            this.freefalling.push(rocket_2);
          }

          if (rocket_1.player == 1) {
            this.player_area.shake = 5;
          } else if (rocket_1.player == 2) {
            this.enemy_area.shake = 5;
          }
        }
      }
    }
  }


  for (var i = 0; i < this.rocket_letters.length; i++) {
    let rocket = this.rocket_letters[i];
    let disabled_letter = rocket.letter;

    if (rocket.status == "descent" && rocket.y > 0) {

      rocket.status = "final_burn";
      rocket.vy = 0;
      rocket.vx = 0;
      let target_x = 0;
      let target_y = 0;
      if (rocket.player == 1) {
        target_x = (this.enemy_palette.letters[disabled_letter].x + this.enemy_palette.position.x - this.enemy_area.position.x) / this.enemy_area.scale.x;
        target_y = (this.enemy_palette.letters[disabled_letter].y + this.enemy_palette.position.y - this.enemy_area.position.y) / this.enemy_area.scale.y;
      } else if (rocket.player == 2) {
        target_x = (this.player_palette.letters[disabled_letter].x + this.player_palette.position.x - this.player_area.position.x) / this.player_area.scale.x;
        target_y = (this.player_palette.letters[disabled_letter].y + this.player_palette.position.y - this.player_area.position.y) / this.player_area.scale.y;
      }
      let angle = Math.atan2(target_y - rocket.y, target_x - rocket.x) + Math.PI / 2;
      rocket.parachute_sprite.visible = false;
      new TWEEN.Tween(rocket)
        .to({rotation: angle})
        .duration(100)
        .easing(TWEEN.Easing.Quartic.Out)
        .onComplete(function() {rocket.fire_sprite.visible = true; self.soundEffect("rocket");})
        .chain(new TWEEN.Tween(rocket.position)
          .to({y: target_y, x: target_x})
          .duration(200)
          .easing(TWEEN.Easing.Quadratic.In)
          .onComplete(function() {

              rocket.status = "falling";
              self.freefalling.push(rocket);
              rocket.vx = -10 + Math.random() * 20;
              rocket.vy = -4 - Math.random() * 14;
              if (rocket.player == 1) {
                if (self.enemy_palette.letters[disabled_letter].interactive == true) {
                  self.enemy_palette.letters[disabled_letter].disable();
                  self.soundEffect("explosion_3");
                  
                  let fire = self.makeFire(self.scenes["solo"], 
                    self.enemy_palette.letters[disabled_letter].x + self.enemy_palette.position.x,
                    self.enemy_palette.letters[disabled_letter].y + self.enemy_palette.position.y - 8,
                    0.1, 0.25/3);
                  fire.visible = false;

                  explosion = self.makeExplosion(self.scenes["solo"], 
                    self.enemy_palette.letters[disabled_letter].x + self.enemy_palette.position.x,
                    self.enemy_palette.letters[disabled_letter].y + self.enemy_palette.position.y,
                  0.3, 0.3, function() {fire.visible = true; self.scenes["solo"].removeChild(explosion)});


                  if (!self.enemy_defense.includes(disabled_letter)) {
                    setTimeout(function() {
                      self.scenes["solo"].removeChild(fire);
                      self.enemy_palette.letters[disabled_letter].enable()
                    }, 5000);
                  } else {
                    self.checkEndCondition();
                  }
                }
              } else {
                if (self.player_palette.letters[disabled_letter].interactive == true) {
                  self.player_palette.letters[disabled_letter].disable();
                  scene.shake = 5;
                  self.soundEffect("explosion_3");
                  
                  let fire = self.makeFire(self.scenes["solo"], 
                    self.player_palette.letters[disabled_letter].x + self.player_palette.position.x,
                    self.player_palette.letters[disabled_letter].y + self.player_palette.position.y - 24,
                    0.3, 0.25);
                  fire.visible = false;

                  let explosion = self.makeExplosion(self.scenes["solo"], 
                    self.player_palette.letters[disabled_letter].x + self.player_palette.position.x,
                    self.player_palette.letters[disabled_letter].y + self.player_palette.position.y,
                  1, 1, function() {fire.visible = true; self.scenes["solo"].removeChild(explosion);});

                  if (!self.player_defense.includes(disabled_letter)) {
                      setTimeout(function() {
                      self.scenes["solo"].removeChild(fire);
                      self.player_palette.letters[disabled_letter].enable()
                    }, 5000);
                  } else {
                    self.checkEndCondition();
                  }   
                }
              }

          })
        )
        .start()
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


