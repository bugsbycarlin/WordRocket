
class Launchpad {
  constructor(game, parent, player, x, y, outer_size, inner_size, use_picker = false) {
    this.tiles = [];
    this.shift = 0;
    this.cursor = 0;

    this.game = game;
    this.parent = parent;

    this.pad = new PIXI.Container();
    this.parent.addChild(this.pad);
    this.pad.position.set(x, y);

    this.outer_size = outer_size;
    this.inner_size = inner_size;
    this.gap = this.outer_size - this.inner_size;

    this.use_picker = use_picker;

    this.x = x;
    this.y = y;

    this.can_play = false;

    this.picker_speed = 200;

    this.player = player;

    this.pad_mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
    this.pad_mat.width = this.outer_size * board_width;
    this.pad_mat.height = this.outer_size;
    this.pad_mat.anchor.set(0, 1);
    this.pad_mat.position.set(0, 0);
    this.pad_mat.tint = 0x2c3130;
    this.parent.addChild(this.pad_mat);

    // cursor markers
    this.cursors = [];
    for (var i = 0; i < board_width; i++) {
      var cursor = PIXI.Sprite.from(PIXI.Texture.WHITE);
      this.cursors[i] = cursor;
      cursor.width = 48;
      cursor.height = 4;
      cursor.anchor.set(0.5, 0.5);
      cursor.position.set(this.xi(this.cursor + this.shift + i), 4);
      cursor.tint = 0x3cb0f3;
      cursor.alpha = (board_width - i) / (board_width + 4);
      this.pad.addChild(cursor);
    }

    // mask to prevent overflow
    let launchpad_mask = new PIXI.Graphics();
    launchpad_mask.beginFill(0xFF3300);
    launchpad_mask.drawRect(this.parent.x + this.x, this.parent.y + this.y - 50, this.parent.scale.x * this.outer_size * board_width, this.parent.scale.y * 250);
    launchpad_mask.endFill();
    this.pad.mask = launchpad_mask;


    // red underline of course
    this.red_underlines = [];
    for (var i = 0; i < board_width; i++) {
      this.red_underlines[i] = new PIXI.Sprite(PIXI.Texture.from("Art/underline.png"));
      this.red_underlines[i].anchor.set(0.5, 0.5);
      this.red_underlines[i].scale.set(1,0.5);
      this.red_underlines[i].position.set(this.xi(this.cursor + this.shift + i), 6)
      this.pad.addChild(this.red_underlines[i]);
      this.red_underlines[i].visible = false;
    }

    this.underline_text = new PIXI.Text("TOO SHORT", {fontFamily: "Bebas Neue", fontSize: 24, fill: 0xc16363, letterSpacing: 6, align: "center"});
    this.underline_text.position.set(5 * this.outer_size, 26);
    this.underline_text.anchor.set(0.5,0.5);
    this.pad.addChild(this.underline_text);
    this.underline_text.visible = false;
  }


  wordSize() {
    return this.tiles.length;
  }


  word() {
    var word = "";
    for (var i = 0; i < this.tiles.length; i++) {
      //word += this.tiles[i].text.text;
      word += this.tiles[i].text;
    }
    return word;
  }


  flashError = function(){
    this.error = Date.now();
    this.pad_mat.tint = 0xdb5858;
  }


  checkError = function(){
    if (this.error != null) {
      if (Date.now() - this.error >= 150) {
        this.error = null;
        this.pad_mat.tint = 0x2c3130;
      }
    }
  }


  full() {
    // return this.wordSize() + this.shift >= board_width;
    return this.wordSize() >= board_width;
  }


  xi(number) {
    //return this.x + this.gap / 2 + this.outer_size * (number) + this.inner_size / 2;
    return this.gap / 2 + this.outer_size * (number) + this.inner_size / 2;
  }


  push(palette, letter) {
    var target_x = this.xi(this.cursor + this.shift);
    var target_y = this.y - this.outer_size + this.inner_size / 2;

    // these will be wrong
    var start_x = (palette.letters[letter].position.x + palette.position.x - this.parent.position.x) / this.parent.scale.x;
    var start_y = (palette.letters[letter].position.y + palette.position.y - this.parent.position.y) / this.parent.scale.y;

    var tile = game.makePixelatedTile(this.parent, start_x, start_y, letter, this.inner_size, this.inner_size, this.inner_size, 0xFFFFFF, "", function() {});
    // var tile = game.makeTile(this.parent, target_x, target_y, letter, this.inner_size, this.inner_size, this.inner_size, 0xFFFFFF, "", function() {});
    tile.text = letter;
    tile.parent = this.parent;
    this.tiles.push(tile);
    this.cursor += 1;
    tile.parent = this.parent;

    this.checkWord();

    if (!this.use_picker) {
      tile.position.set(-100, target_y);
      new TWEEN.Tween(tile.position)
        .to({x: target_x})
        .duration(this.picker_speed)
        .start()
    } else {
      var picker = new PIXI.Sprite(PIXI.Texture.from("Art/picker_v1.png"));
      picker.position.set(24, 0);
      picker.anchor.set(1, 0.5);
      tile.addChild(picker);

      if (Math.abs(target_x - start_x) < Math.abs(target_y - start_y)) {
        var diff = start_y - Math.abs(start_x - target_x);
        var first = Math.sqrt(2)*Math.abs(start_x - target_x);
        var second = Math.abs(diff - target_y);
        new TWEEN.Tween(tile.position)
          .to({x: target_x, y: diff})
          .duration(this.picker_speed * first / (first + second))
          .chain(new TWEEN.Tween(tile.position)
            .to({y: target_y})
            .duration(this.picker_speed * second / (first + second))
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
          .duration(this.picker_speed * first / (first + second))
          .chain(new TWEEN.Tween(tile.position)
            .to({x: target_x})
            .duration(this.picker_speed * second / (first + second))
            .chain(new TWEEN.Tween(picker.position)
              .to({x: -1 * target_x})
              .duration(100)
              .onComplete(function() {tile.removeChild(picker)})
            )
          )
          .start()
      }
    }

    if (this.wordSize() + this.shift > board_width) {
      this.shiftLeft();
    }
  }


  pop() {
    if (this.wordSize() > 0) {
      var dead_tile = this.tiles.pop();
      this.cursor -= 1;
      dead_tile.vx = -10 + Math.random() * 20;
      dead_tile.vy = -4 - Math.random() * 14;
      game.freefalling.push(dead_tile);

      this.checkWord();
    }
  }



  shiftRight(){
    if (!(this.wordSize() + this.shift >= board_width)) {
      this.shift += 1;
      for (var i = 0; i < this.tiles.length; i++) {
        var item = this.tiles[i];
        var x = this.xi(i + this.shift);
        var tween = new TWEEN.Tween(item.position)
          .to({x: x})
          .duration(200)
          .easing(TWEEN.Easing.Cubic.InOut)
          .start();
      }

      for (var i = 0; i < board_width; i++) {
        var cursor = this.cursors[i];
        var x = this.xi(i + this.shift);
        var tween = new TWEEN.Tween(cursor.position)
          .to({x: x})
          .duration(200)
          .easing(TWEEN.Easing.Cubic.InOut)
          .start();
      }

      this.checkWord();
    }
  }


  shiftLeft(){
    if (this.shift > 0) {
      this.shift -= 1;
      for (var i = 0; i < this.tiles.length; i++) {
        var item = this.tiles[i];
        var x = this.xi(i + this.shift);
        var tween = new TWEEN.Tween(item.position)
          .to({x: x})
          .duration(200)
          .easing(TWEEN.Easing.Cubic.InOut)
          .start();
      }

      for (var i = 0; i < board_width; i++) {
        var cursor = this.cursors[i];
        var x = this.xi(i + this.shift);
        var tween = new TWEEN.Tween(cursor.position)
          .to({x: x})
          .duration(200)
          .easing(TWEEN.Easing.Cubic.InOut)
          .start();
      }

      this.checkWord();
    }
  }


  checkWord(){
    var word = this.word();

    this.can_play = true;

    if (word.length > 0 && word.length <= 3) {
      this.can_play = false;
      this.underline_text.text = "TOO SHORT";
    }

    if (word.length > 3 && !(word in game.legal_words)) {
      this.can_play = false;
      this.underline_text.text = "NOT A WORD";
    }

    if (word.length > 3 && (word in game.played_words)) {
      this.can_play = false;
      this.underline_text.text = "ALREADY PLAYED";
    }

    if (this.can_play) {
      this.underline_text.visible = false;
      for (var i = 0; i < board_width; i++) {
        this.red_underlines[i].visible = false;
      }
    } else {
      this.underline_text.visible = true;
      for (var i = 0; i < board_width; i++) {
        if (i >= this.shift && i < this.shift + this.wordSize()) {
          this.red_underlines[i].visible = true;
        } else {
          this.red_underlines[i].visible = false;
        }
      }
    }
  }



  launch(area) {
    this.checkWord();
    var word = this.word();
    if (this.can_play == true) {
      game.played_words[word] = 1;
      for (var i = 0; i < this.tiles.length; i++) {
        var pad_item = this.tiles[i];
        // var letter = pad_item.text.text;
        var letter = pad_item.text;

        let rocket_tile = game.makeRocketTile(area, letter, word.length, i, this.shift, this.player, this.inner_size, this.outer_size)

        game.rocket_letters.push(rocket_tile);

        this.parent.removeChild(pad_item);
      }

      this.tiles = [];
      this.cursor = 0;
    }
  }
}
