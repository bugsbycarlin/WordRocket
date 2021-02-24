

Game.prototype.initializeSoloScreen = function() {
  var self = this;
  this.clearScene(this.scenes["solo"]);

  this.launchpad = [];
  this.launchpad_shift = 0;
  this.launchpad_cursor = 0;
  this.freefalling = [];
  this.pickers = [];
  this.played_words = {};
  this.played_words["SMASH"] = 1;
  this.played_words["BRONCO"] = 1;
  this.played_words["JUMP"] = 1;

  this.rocket_letters = [];

  // the main palette
  this.player_palette = this.makeQwertyPalette(this.scenes["solo"], 72, this.width * 1/2, this.height - 118, function(letter) {
    console.log(letter);
  });

  var player_area = PIXI.Sprite.from(PIXI.Texture.WHITE);
  player_area.width = 500;
  player_area.height = 750;
  player_area.anchor.set(0, 0);
  player_area.position.set(10, 10);
  player_area.tint = 0xDDDDDD;
  this.scenes["solo"].addChild(player_area);

  var enemy_area = PIXI.Sprite.from(PIXI.Texture.WHITE);
  enemy_area.width = 240;
  enemy_area.height = 360;
  enemy_area.anchor.set(0, 0);
  enemy_area.position.set(520, 10);
  enemy_area.tint = 0xDDDDDD;
  this.scenes["solo"].addChild(enemy_area);

  // for (var i = 0; i < 10; i++) {
  //   //makeButton(parent, x, y, text, text_size, text_spacing, text_color, backing_width, backing_height, backing_color, action) {
  //   this.makeButton(this.scenes["solo"], 11 + 50 * i + 24, 710 + 24, "A", 48, 6, 0x000000, 48, 48, 0xFFFFFF, function() {});
  // }

  // the enemy palette
  this.enemy_palette = this.makeQwertyPalette(this.scenes["solo"], 24, 640, 415, function(letter) {
    console.log(letter);
  });

  // cursor markers
  this.cursors = [];
  for (var i = 0; i < 10; i++) {
    var cursor = PIXI.Sprite.from(PIXI.Texture.WHITE);
    this.cursors[i] = cursor;
    cursor.width = 48;
    cursor.height = 3;
    cursor.anchor.set(0.5, 0.5);
    cursor.position.set(11 + 50 * (this.launchpad_cursor + this.launchpad_shift + i) + 24, 710 + 49);
    cursor.tint = 0x3cb0f3;
    cursor.alpha = (10 - i) / 15;
    this.scenes["solo"].addChild(cursor);
  }

  // cursor cover patch
  var cover_patch = PIXI.Sprite.from(PIXI.Texture.WHITE);
  cover_patch.width = 400;
  cover_patch.height = 50;
  cover_patch.anchor.set(0, 0);
  cover_patch.position.set(510, 760-48);
  cover_patch.tint = 0xFFFFFF;
  this.scenes["solo"].addChild(cover_patch);

  // red underline of course
  this.red_underlines = [];
  for (var i = 0; i < 10; i++) {
    this.red_underlines[i] = new PIXI.Sprite(PIXI.Texture.from("Art/underline.png"));
    this.red_underlines[i].anchor.set(0.5, 0.5);
    this.red_underlines[i].scale.set(1,0.5);
    this.red_underlines[i].position.set(11 + 50 * (this.launchpad_cursor + this.launchpad_shift + i) + 24, 766)
    this.scenes["solo"].addChild(this.red_underlines[i]);
    this.red_underlines[i].visible = false;
  }

  this.underline_text = new PIXI.Text("TOO SHORT", {fontFamily: "Bebas Neue", fontSize: 24, fill: 0xc16363, letterSpacing: 6, align: "center"});
  this.underline_text.position.set(260, 786);
  this.underline_text.anchor.set(0.5,0.5);
  this.scenes["solo"].addChild(this.underline_text);
  this.underline_text.visible = false;
}

Game.prototype.soloUpdate = function() {
  // TO DO gravity goes a nice place
  var gravity = 6;
  for (var i = 0; i < this.freefalling.length; i++) {
    var item = this.freefalling[i];
    item.position.x += item.vx;
    item.position.y += item.vy;
    item.vy += gravity;
    if (item.position.y > this.height * 1.25) {
      this.scenes["solo"].removeChild(item);
      item.dead = true;
    }
  }

  var new_freefalling = [];
  for (var i = 0; i < this.freefalling.length; i++) {
    var item = this.freefalling[i];
    if (item.dead != true) {
      new_freefalling.push(item);
    }
  }
  this.freefalling = new_freefalling;

  // TO DO boost goes a nice place
  var boost = 0.25;
  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];
    if (rocket.status == "rocket") {
      rocket.position.y += rocket.vy;
      rocket.vy -= boost;
      if (rocket.vy < -40) rocket.vy = -40;
    }
  }

  // var new_rocket_letters = [];
  // for (var i = 0; i < this.rocket_letters.length; i++) {
  //   var rocket = this.rocket_letters[i];
  //   if (rocket.status != "dead") {
  //     new_freefalling.push(item);
  //   }
  // }
  // this.freefalling = new_freefalling;
}


Game.prototype.launchLaunchLaunch = function() {
  this.checkWord();
  if (this.legal == true) {
    var word = this.launchpadWord();
    this.played_words[word] = 1;
    for (var i = 0; i < this.launchpad.length; i++) {
      var pad_item = this.launchpad[i];
      var letter = pad_item.text.text;

      let rocket_tile = new PIXI.Container();
      this.scenes["solo"].addChild(rocket_tile);
      rocket_tile.position.set(pad_item.x, pad_item.y);
      rocket_tile.vy = 0;

      var sheet = PIXI.Loader.shared.resources["Art/fire.json"].spritesheet;
      let fire_sprite = new PIXI.AnimatedSprite(sheet.animations["fire"]);
      fire_sprite.anchor.set(0.5,0.5);
      fire_sprite.position.set(0, 48);
      rocket_tile.addChild(fire_sprite);
      fire_sprite.animationSpeed = 0.5; 
      fire_sprite.scale.set(0.2, -0.2)
      fire_sprite.play();
      fire_sprite.visible = false;

      var tile = this.makeTile(rocket_tile, 0, 0, letter, 48, 48, 48, 0xFFFFFF, letter_values[letter], function() {});

      rocket_tile.status = "load";

      new TWEEN.Tween(rocket_tile.position)
        .to({y: 710 + 24 - 48, x: 11 + 50 * (i + this.launchpad_shift) + 24})
        .duration(400)
        .onComplete(function() {fire_sprite.visible = true; rocket_tile.status = "rocket"})
        .start()

      rocket_tile.column = i + this.launchpad_shift;

      this.rocket_letters.push(rocket_tile);


      this.scenes["solo"].removeChild(pad_item);
    }

    this.launchpad = [];
    this.launchpad_cursor = 0;


  }
}


Game.prototype.pushLaunchpad = function(letter) {
  var target_x = 11 + 50 * (this.launchpad_cursor + this.launchpad_shift) + 24;
  var target_y = 710 + 24;
  var start_x = this.player_palette.letters[letter].position.x + this.player_palette.position.x;
  var start_y = this.player_palette.letters[letter].position.y + this.player_palette.position.y;
  var tile = this.makeTile(this.scenes["solo"], start_x, start_y, letter, 48, 48, 48, 0xFFFFFF, letter_values[letter], function() {});
  this.launchpad.push(tile);
  this.launchpad_cursor += 1;

  var picker = new PIXI.Sprite(PIXI.Texture.from("Art/picker_v1.png"));
  picker.position.set(24, 0);
  picker.anchor.set(1, 0.5);
  // this.pickers.push(picker);
  tile.addChild(picker);

  this.checkWord();

  if (Math.abs(target_x - start_x) < Math.abs(target_y - start_y)) {
    var diff = start_y - Math.abs(start_x - target_x);
    var first = Math.sqrt(2)*Math.abs(start_x - target_x);
    var second = Math.abs(diff - target_y);
    new TWEEN.Tween(tile.position)
      .to({x: target_x, y: diff})
      .duration(200 * first / (first + second))
      .chain(new TWEEN.Tween(tile.position)
        .to({y: target_y})
        .duration(200 * second / (first + second))
        .chain(new TWEEN.Tween(picker.position)
          .to({x: -1 * target_x})
          .duration(100)
          .onComplete(function() {tile.removeChild(picker)})
        )
      )
      .start()
  } else {
    var diff = start_x - Math.abs(start_y - target_y) * (target_x < start_x ? 1 : -1);
    var first = Math.sqrt(2)*Math.abs(start_y - target_y);
    var second = Math.abs(diff - target_x);
    new TWEEN.Tween(tile.position)
      .to({x: diff, y: target_y})
      .duration(200 * first / (first + second))
      .chain(new TWEEN.Tween(tile.position)
        .to({x: target_x})
        .duration(200 * second / (first + second))
        .chain(new TWEEN.Tween(picker.position)
          .to({x: -1 * target_x})
          .duration(100)
          .onComplete(function() {tile.removeChild(picker)})
        )
      )
      .start()
  }
}


Game.prototype.popLaunchpad = function() {
  if (this.launchpad.length > 0) {
    var dead_tile = this.launchpad.pop();
    this.launchpad_cursor -= 1;
    //TODO instead of deleting the child, put it somewhere nice!
    //this.scenes["solo"].removeChild(dead_tile);
    dead_tile.vx = -10 + Math.random() * 20;
    dead_tile.vy = -4 - Math.random() * 14;
    this.freefalling.push(dead_tile);

    this.checkWord();
  }
}


Game.prototype.launchpadWord = function() {
  var word = "";
  for (var i = 0; i < this.launchpad.length; i++) {
    word += this.launchpad[i].text.text;
  }
  return word;
}


Game.prototype.shiftLaunchpadRight = function() {
  if (this.launchpad.length + this.launchpad_shift < 10) {
    this.launchpad_shift += 1;
    for (var i = 0; i < this.launchpad.length; i++) {
      item = this.launchpad[i];
      var x = 11 + 50 * (i + this.launchpad_shift) + 24;
      var tween = new TWEEN.Tween(item.position)
        .to({x: x})
        .duration(200)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start();
    }

    for (var i = 0; i < 10; i++) {
      var cursor = this.cursors[i];
      var x = 11 + 50 * (i - 1 + this.launchpad_shift) + 24;
      var tween = new TWEEN.Tween(cursor.position)
        .to({x: x + 50})
        .duration(200)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start();
    }

    this.checkWord();
  }
}


Game.prototype.shiftLaunchpadLeft = function() {
  if (this.launchpad_shift > 0) {
    this.launchpad_shift -= 1;
    for (var i = 0; i < this.launchpad.length; i++) {
      item = this.launchpad[i];
      var x = 11 + 50 * (i + this.launchpad_shift) + 24;
      var tween = new TWEEN.Tween(item.position)
        .to({x: x})
        .duration(200)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start();
    }

    for (var i = 0; i < 10; i++) {
      var cursor = this.cursors[i];
      var x = 11 + 50 * (i - 1 + this.launchpad_shift) + 24;
      var tween = new TWEEN.Tween(cursor.position)
        .to({x: x + 50})
        .duration(200)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start();
    }

    this.checkWord();
  }
}


Game.prototype.checkWord = function() {
  var word = this.launchpadWord();

  this.legal = true;

  if (word.length > 0 && word.length <= 3) {
    this.legal = false;
    this.underline_text.text = "TOO SHORT";
  }

  if (word.length > 3 && !(word in this.legal_words)) {
    this.legal = false;
    this.underline_text.text = "NOT A WORD";
  }

  if (word.length > 3 && (word in this.played_words)) {
    this.legal = false;
    this.underline_text.text = "ALREADY PLAYED";
  }

  if (this.legal) {
    this.underline_text.visible = false;
    for (var i = 0; i < 10; i++) {
      this.red_underlines[i].visible = false;
    }
  } else {
    this.underline_text.visible = true;
    for (var i = 0; i < 10; i++) {
      if (i >= this.launchpad_shift && i < this.launchpad_shift + this.launchpad.length) {
        this.red_underlines[i].visible = true;
      } else {
        this.red_underlines[i].visible = false;
      }
    }
  }
}



