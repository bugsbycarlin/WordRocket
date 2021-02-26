
class Launchpad {
  constructor(game, parent, player, play_area, x, y, outer_size, inner_size) {
    this.tiles = [];
    this.shift = 0;
    this.cursor = 0;

    this.game = game;
    this.parent = parent;
    this.play_area = play_area;

    this.outer_size = outer_size;
    this.inner_size = inner_size;
    this.gap = this.outer_size - this.inner_size;

    this.x = x;
    this.y = y;

    this.can_play = false;

    this.picker_speed = 400;

    this.player = player;


    // cursor markers
    this.cursors = [];
    for (var i = 0; i < 10; i++) {
      var cursor = PIXI.Sprite.from(PIXI.Texture.WHITE);
      this.cursors[i] = cursor;
      cursor.width = 48;
      cursor.height = 4;
      cursor.anchor.set(0.5, 0.5);
      cursor.position.set(this.xi(this.cursor + this.shift + i), this.y + 4);
      cursor.tint = 0x3cb0f3;
      cursor.alpha = (10 - i) / 15;
      this.parent.addChild(cursor);
    }

    // cursor cover patch
    var cover_patch = PIXI.Sprite.from(PIXI.Texture.WHITE);
    cover_patch.width = this.outer_size * 10;
    cover_patch.height = this.outer_size;
    cover_patch.anchor.set(0, 0);
    cover_patch.position.set(this.x + this.outer_size * 10, this.y - this.inner_size / 2);
    cover_patch.tint = 0xFFFFFF;
    this.parent.addChild(cover_patch);

    // red underline of course
    this.red_underlines = [];
    for (var i = 0; i < 10; i++) {
      this.red_underlines[i] = new PIXI.Sprite(PIXI.Texture.from("Art/underline.png"));
      this.red_underlines[i].anchor.set(0.5, 0.5);
      this.red_underlines[i].scale.set(1,0.5);
      this.red_underlines[i].position.set(this.xi(this.cursor + this.shift + i), this.y + 6)
      this.parent.addChild(this.red_underlines[i]);
      this.red_underlines[i].visible = false;
    }

    this.underline_text = new PIXI.Text("TOO SHORT", {fontFamily: "Bebas Neue", fontSize: 24, fill: 0xc16363, letterSpacing: 6, align: "center"});
    this.underline_text.position.set(this.x + 5 * this.outer_size, this.y + 26);
    this.underline_text.anchor.set(0.5,0.5);
    this.parent.addChild(this.underline_text);
    this.underline_text.visible = false;
  }


  wordSize() {
    return this.tiles.length;
  }


  word() {
    var word = "";
    for (var i = 0; i < this.tiles.length; i++) {
      word += this.tiles[i].text.text;
    }
    return word;
  }


  full() {
    return this.wordSize() + this.shift >= 10;
  }


  xi(number) {
    return this.x + this.gap / 2 + this.outer_size * (number) + this.inner_size / 2;
  }


  push(palette, letter) {
    var target_x = this.xi(this.cursor + this.shift);
    var target_y = this.y - this.outer_size + this.inner_size / 2;

    // these will be wrong
    var start_x = palette.letters[letter].position.x + palette.position.x;
    var start_y = palette.letters[letter].position.y + palette.position.y;

    var tile = game.makeTile(this.parent, start_x, start_y, letter, this.inner_size, this.inner_size, this.inner_size, 0xFFFFFF, letter_values[letter], function() {});
    tile.parent = this.parent;
    this.tiles.push(tile);
    this.cursor += 1;

    var picker = new PIXI.Sprite(PIXI.Texture.from("Art/picker_v1.png"));
    picker.position.set(24, 0);
    picker.anchor.set(1, 0.5);
    tile.addChild(picker);
    tile.parent = this.parent;

    this.checkWord();

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



  shiftRight = function() {
    if (!this.full()) {
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

      for (var i = 0; i < 10; i++) {
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


  shiftLeft = function() {
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

      for (var i = 0; i < 10; i++) {
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


  checkWord = function() {
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
      for (var i = 0; i < 10; i++) {
        this.red_underlines[i].visible = false;
      }
    } else {
      this.underline_text.visible = true;
      for (var i = 0; i < 10; i++) {
        if (i >= this.shift && i < this.shift + this.wordSize()) {
          this.red_underlines[i].visible = true;
        } else {
          this.red_underlines[i].visible = false;
        }
      }
    }
  }


  flashError = function() {
    this.error = 5;
  }


  launch = function(area) {
    this.checkWord();
    var word = this.word();
    if (this.can_play == true) {
      game.played_words[word] = 1;
      for (var i = 0; i < this.tiles.length; i++) {
        var pad_item = this.tiles[i];
        var letter = pad_item.text.text;

        let rocket_tile = game.makeRocketTile(area, letter, i, this.shift, this.player, this.inner_size, this.outer_size)

        game.rocket_letters.push(rocket_tile);

        this.parent.removeChild(pad_item);
      }

      this.tiles = [];
      this.cursor = 0;
    }
  }
}