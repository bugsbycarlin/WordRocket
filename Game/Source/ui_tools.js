
Game.prototype.makeTutorialScreen = function(parent, fade_in_time, box_left, box_top, box_right, box_bottom, text, text_x, text_y) {

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

  let tutorial_text = new PIXI.Text(text, {fontFamily: "Bebas Neue", fontSize: 30, fill: 0xFFFFFF, letterSpacing: 6, align: "center"});
  tutorial_text.anchor.set(0.5,0.5);
  tutorial_text.position.set(text_x, text_y);
  tutorial_screen.addChild(tutorial_text);
  tutorial_text.permanent_x = text_x;
  tutorial_text.permanent_y = text_y;
  tutorial_text.start_time = Date.now();
  tutorial_text.alpha = 0
  tutorial_text.hover = function() {
    tutorial_text.position.set(tutorial_text.permanent_x, tutorial_text.permanent_y + 20 * Math.sin((Date.now() - tutorial_text.start_time) / 400))
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


Game.prototype.makeRocketTile = function(parent, letter, word_length, letter_number, shift, player, inner_size, outer_size) {
  var self = this;
  let rocket_tile = new PIXI.Container();
  parent.addChild(rocket_tile);
  let gap = outer_size - inner_size;
  let start_y = inner_size / 2 - outer_size;
  let start_x = gap / 2 + outer_size * (letter_number + shift) + inner_size / 2;

  rocket_tile.position.set(start_x, start_y);
  rocket_tile.vy = 0;

  let fire_sprite = this.makeFire(rocket_tile, 0, 48, 0.2, -0.2);
  fire_sprite.visible = false;

  let parachute_sprite = this.makeParachute(rocket_tile, 0, -50, 0.3, 0.3);
  parachute_sprite.visible = false;

  var tile = this.makeTile(rocket_tile, 0, 0, letter, inner_size, inner_size, inner_size, 0xFFFFFF, "", function() {});
  rocket_tile.fire_sprite = fire_sprite;
  rocket_tile.parachute_sprite = parachute_sprite;
  rocket_tile.start_time = Date.now() - Math.floor(Math.random() * 300);
  rocket_tile.parent = parent;
  rocket_tile.value_text = tile.value_text;

  rocket_tile.status = "load";

  new TWEEN.Tween(rocket_tile.position)
    .to({y: start_y - inner_size})
    .duration(400)
    .onComplete(function() {fire_sprite.visible = true; rocket_tile.status = "rocket"; self.soundEffect("rocket");})
    .start()

  rocket_tile.column = letter_number + shift;
  rocket_tile.player = player;
  rocket_tile.letter = letter;
  rocket_tile.value = letter_values[letter];
  rocket_tile.score_value = Math.floor(Math.pow(word_length, 1.5));

  return rocket_tile;
}


Game.prototype.makeFire = function(parent, x, y, xScale, yScale) {
  var sheet = PIXI.Loader.shared.resources["Art/fire.json"].spritesheet;
  let fire_sprite = new PIXI.AnimatedSprite(sheet.animations["fire"]);
  fire_sprite.anchor.set(0.5,0.5);
  fire_sprite.position.set(x, y);
  parent.addChild(fire_sprite);
  fire_sprite.animationSpeed = 0.5; 
  fire_sprite.scale.set(xScale, yScale);
  fire_sprite.play();
  return fire_sprite;
}


Game.prototype.makeParachute = function(parent, x, y, xScale, yScale) {
  let parachute_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/parachute_v1.png"));
  parachute_sprite.anchor.set(0.5, 0.5);
  parachute_sprite.scale.set(xScale, yScale);
  parachute_sprite.position.set(x, y);
  parent.addChild(parachute_sprite);
  return parachute_sprite;
}


Game.prototype.makeExplosion = function(parent, x, y, xScale, yScale, action) {
  var sheet = PIXI.Loader.shared.resources["Art/explosion.json"].spritesheet;
  let explosion_sprite = new PIXI.AnimatedSprite(sheet.animations["explosion"]);
  explosion_sprite.anchor.set(0.5,0.5);
  explosion_sprite.position.set(x, y);
  parent.addChild(explosion_sprite);
  explosion_sprite.animationSpeed = 0.5; 
  explosion_sprite.scale.set(xScale, yScale);
  explosion_sprite.play();
  explosion_sprite.loop = false;
  explosion_sprite.onComplete = function() {
    action();
  }
  return explosion_sprite;
}


Game.prototype.makeTile = function(parent, x, y, text, text_size, backing_width, backing_height, backing_color, value, action) {
  var button = this.makeButton(parent, x, y, text, text_size, 6, 0x000000, backing_width, backing_height, backing_color, action);
  return button;
}


Game.prototype.makeButton = function(parent, x, y, text, text_size, text_spacing, text_color, backing_width, backing_height, backing_color, action) {
  var button = new PIXI.Container();
  parent.addChild(button);
  button.position.set(x, y);
  // var button_image = new PIXI.Sprite(PIXI.Texture.from("Art/" + backing_color + "_button_backing.png"));
  // button_image.anchor.set(0.5,0.5);
  button.backing = PIXI.Sprite.from(PIXI.Texture.WHITE);
  button.backing.width = backing_width;
  button.backing.height = backing_height;
  button.backing.anchor.set(0.5, 0.5);
  button.backing.tint = backing_color;

  button.text = new PIXI.Text(text, {fontFamily: "Bebas Neue", fontSize: text_size, fill: text_color, letterSpacing: text_spacing, align: "center"});
  button.text.anchor.set(0.5,0.42);
  // button.text = new PIXI.Sprite(PIXI.Texture.from("Art/test_q.png"));
  // button.text.anchor.set(0.5, 0.5);

  // button.fronting = PIXI.Sprite.from(PIXI.Texture.WHITE);
  // button.fronting.width = backing_width;
  // button.fronting.height = backing_height;
  // button.fronting.anchor.set(0.5, 0.5);
  // button.fronting.alpha = 0.7;
  button.addChild(button.backing);
  button.addChild(button.text);
  // button.addChild(button.fronting)
  // button.fronting.visible = false;

  button.interactive = true;
  button.buttonMode = true;
  button.hitArea = button.backing.hitArea;
  // button.action = action;
  button.on("pointerdown", action);

  button.disable = function() {
    // this.fronting.visible = true;
    this.interactive = false;
  }

  button.enable = function() {
    // this.fronting.visible = false;
    this.interactive = true;
  }

  return button;
}


Game.prototype.makeLetterPalette = function(parent, x, y, action) {
  var palette = new PIXI.Container();
  parent.addChild(palette);
  palette.position.set(x, y);

  palette.letters = [];

  var mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  mat.width = 13 * 80;
  mat.height = 160;
  mat.anchor.set(0.5, 0.5);
  mat.position.set(-80, 0);
  mat.tint = 0xCCCCCC;
  palette.addChild(mat)

  var letters = [];
  var size = 80;
  letters[0] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
  letters[1] = ["N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

  for (var h = 0; h < 2; h++) {
    for (var i = 0; i < 13; i++) {
      let letter = letters[h][i];
      var button = this.makeButton(
        palette,
        -7*size + i*size, (h == 0 ? -size/2 : size/2),
        letter, size, 6, 0x000000,
        size, size, ((i+h) % 2 == 0 ? 0xF0F0F0 : 0xFFFFFF),
        //((i+h) % 2 == 0 ? 0xf1e594 : 0xFFFFFF)
        function() {
          if (action != null) {
            new TWEEN.Tween(this)
              .to({rotation: Math.PI / 20.0}).duration(70).yoyo(true).repeat(1)
              .chain(new TWEEN.Tween(this)
                .to({rotation: Math.PI / -20.0}).duration(70).yoyo(true).repeat(1)
                )
              .start()
            action(letter);
          }
        }
      );
      palette.letters.push(button);
    }
  }
  return palette;
}


Game.prototype.makeKey = function(parent, x, y, size, letter, type, action) {
  var key_button = new PIXI.Sprite(PIXI.Texture.from("Art/Keys/" + type + "_" + letter + ".png"));
  key_button.anchor.set(0.5, 0.5);
  key_button.position.set(x, y);
  key_button.tint = 0xFFFFFF;
  if (size != 60) key_button.scale.set(size / 60, size / 60);
  parent.addChild(key_button);

  key_button.interactive = true;
  key_button.buttonMode = true;
  key_button.on("pointerdown", action);

  key_button.action = action;

  key_button.disable = function() {
    this.interactive = false;
  }

  key_button.enable = function() {
    this.interactive = true;
  }

  return key_button;
}


Game.prototype.makeTallQwertyPalette = function(options) {
  let self = this;

  let parent = options.parent;
  let key_size = options.key_size;
  let key_margin = options.key_margin == null ? 10 : options.key_margin;
  let side_margin = options.side_margin == null ? key_margin : options.side_margin;
  let vertical_margin = options.vertical_margin == null ? key_margin : options.vertical_margin;
  let add_special_keys = options.add_special_keys == null ? false : options.add_special_keys;
  let x = options.x == null ? 0 : options.x;
  let y = options.y == null ? 0 : options.y;
  let action = options.action == null ? function(){} : options.action;

  let palette = new PIXI.Container();
  parent.addChild(palette);
  palette.position.set(x, y);
  palette.letters = {};
  palette.error = 0;

  let letters = [];
  letters[0] = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
  letters[1] = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
  letters[2] = ["Z", "X", "C", "V", "B", "N", "M"];

  let mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
  mat.width = 10 * key_size + 9 * key_margin + 2 * side_margin;
  mat.height = 4 * 1.5 * key_size + 3 * vertical_margin + 2 * side_margin;
  if (!add_special_keys) mat.height -= (vertical_margin + 1.5 * key_size);
  mat.anchor.set(0.0, 0.0);
  mat.position.set(0, 0);
  mat.tint = 0xDDDDDD;
  palette.addChild(mat);
  palette.mat = mat;

  for (var h = 0; h < letters.length; h++) {
    for (var i = 0; i < letters[h].length; i++) {
      let letter = letters[h][i];
      let v_align = h;
      if (h == 2) v_align = 3;
      let button = this.makeKey(
        palette,
        side_margin + key_size / 2 + i * (key_size + key_margin) + (v_align/2 * (key_size+key_margin)), side_margin + 1.5 * key_size / 2 + h * (1.5 * key_size + vertical_margin),
        key_size, letter, "tall_key", function() { action(letter); },
      );

      palette.letters[letter] = button;
    }
  }

  palette.flashError = function(){
    palette.error = 5;
    palette.mat.tint = 0xdb5858;
  }

  // Special keys
  if (add_special_keys) {
    palette.left_button = this.makeKey(
      palette,
      side_margin + key_size / 2 - (key_size + key_margin) + (3/2 * (key_size+key_margin)), side_margin + 1.5 * key_size / 2 + 2 * (1.5 * key_size + vertical_margin),
      key_size, "left", "tall_key", function() {self.leftArrowAction();}
    );

    palette.right_button = this.makeKey(
      palette,
      side_margin + key_size / 2 + 7 * (key_size + key_margin) + (3/2 * (key_size+key_margin)), side_margin + 1.5 * key_size / 2 + 2 * (1.5 * key_size + vertical_margin),
      key_size, "right", "tall_key", function() {self.rightArrowAction();}
    );

    palette.del = this.makeKey(
      palette,
      side_margin + key_size / 2 + (3/2 * (key_size+key_margin)), side_margin + 1.5 * key_size / 2 + 3 * (1.5 * key_size + vertical_margin),
      key_size, "del", "tall_key", function() {self.deleteAction();}
    );

    palette.enter_button = this.makeKey(
      palette,
      side_margin + key_size / 2 + 6 * (key_size + key_margin) + (3/2 * (key_size+key_margin)), side_margin + 1.5 * key_size / 2 + 3 * (1.5 * key_size + vertical_margin),
      key_size, "enter", "tall_key", function() {self.enterAction();}
    );
  }

  return palette;
}



Game.prototype.makeKeyboard = function(options) {
  let self = this;

  let parent = options.parent;
  let x = options.x == null ? 0 : options.x;
  let y = options.y == null ? 0 : options.y;
  let defense = options.defense == null ? [] : options.defense;
  let action = options.action == null ? function(){} : options.action;

  let keyboard = new PIXI.Container();
  parent.addChild(keyboard);
  keyboard.position.set(x, y);
  keyboard.letters = {};
  keyboard.keys = {};
  keyboard.error = 0;

  let keys = [];
  keys[0] = ["Escape_1_esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-_1_minus", "=_1_equals", "Backspace_2_backspace"];
  keys[1] = ["Tab_1.5_tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[_1_leftbracket", "]_1_rightbracket", "\\_1.5_backslash"];
  keys[2] = ["CapsLock_2_capslock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";_1_semicolon", "'_1_quote", "Enter_2_enter"];
  keys[3] = ["LShift_2.5_shift", "Z", "X", "C", "V", "B", "N", "M", ",_1_comma", "._1_period", "/_1_forwardslash", "RShift_2.5_shift"];
  keys[4] = ["Control_1.5_ctrl", "Alt_1_alt", "Meta_1.5_cmd", " _6_spacebar", "Fn_1_fn", "ArrowLeft_1_left", "ArrowUp_1_up", "ArrowDown_1_down", "ArrowRight_1_right"];

  let background = new PIXI.Sprite(PIXI.Texture.from("Art/keyboard_background.png"));
  background.anchor.set(0.5, 0.5);
  keyboard.addChild(background);
  keyboard.background = background;

  for (var h = 0; h < keys.length; h++) {
    var k_x = -310 + 10;
    var k_y = -115 + 25 + 42 * h;
    for (var i = 0; i < keys[h].length; i++) {
      let info = keys[h][i];
      
      let letter = info;
      let size = 1;
      let filename = "key_" + letter;
      if (info.includes("_")) {
        let s = info.split("_");
        letter = s[0];
        size = parseFloat(s[1]);
        filename = "key_" + s[2];
      }

      if (defense.includes(letter)) filename = "blue_" + filename;

      let button = this.makeNiceKey(
        keyboard,
        k_x + size * 20, k_y, filename, size, function() { 
          self.pressKey(letter);
          action(letter);
        },
      );

      k_x += 40 * size;

      keyboard.keys[letter] = button;
      if (letter_array.includes(letter)) {
        keyboard.keys[letter.toLowerCase()] = button;
        keyboard.letters[letter] = button;
      }
    }
  }

  keyboard.flashError = function(){
    keyboard.error = 5;
    // if (keyboard.mat != null) {
    //   keyboard.mat.tint = 0xdb5858;
    // }
  }

  return keyboard;
}

Game.prototype.makeNiceKey = function(parent, x, y, filename, size, action) {
  var key_button = new PIXI.Sprite(PIXI.Texture.from("Art/NiceKeys/" + filename + ".png"));
  key_button.anchor.set(0.5, 0.5);
  key_button.position.set(x, y);
  parent.addChild(key_button);

  key_button.interactive = true;
  key_button.buttonMode = true;
  key_button.on("pointerdown", action);

  key_button.action = action;

  key_button.disable = function() {
    this.interactive = false;
  }

  key_button.enable = function() {
    this.interactive = true;
  }

  return key_button;
}


Game.prototype.makeQwertyPalette = function(options) {
  let self = this;

  let parent = options.parent;
  let key_size = options.key_size;
  let key_margin = options.key_margin == null ? 10 : options.key_margin;
  let x = options.x == null ? 0 : options.x;
  let y = options.y == null ? 0 : options.y;
  let add_special_keys = options.add_special_keys == null ? false : options.add_special_keys;
  let hide_mat = options.hide_mat == null ? false : options.hide_mat;
  let action = options.action == null ? function(){} : options.action;

  let palette = new PIXI.Container();
  parent.addChild(palette);
  palette.position.set(x, y);
  palette.letters = {};
  palette.error = 0;

  let letters = [];
  letters[0] = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
  letters[1] = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
  letters[2] = ["Z", "X", "C", "V", "B", "N", "M"];

  if (!hide_mat) {
    let mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
    mat.width = (11 * (key_size + key_margin)) + key_margin;
    if (add_special_keys == false) mat.width = (10 * (key_size + key_margin)) + key_margin;
    mat.height = (3 * (key_size + key_margin)) + key_margin;
    console.log(mat.width);
    console.log(mat.height);
    console.log("wogs");
    mat.anchor.set(0.0, 0.0);
    mat.position.set(0, 0);
    mat.tint = 0xDDDDDD;
    palette.addChild(mat);
    palette.mat = mat;
  } else {
    palette.mat = null;
  }

  for (var h = 0; h < letters.length; h++) {
    for (var i = 0; i < letters[h].length; i++) {
      let letter = letters[h][i];
      let button = this.makeKey(
        palette,
        key_margin + key_size / 2 + i * (key_size + key_margin) + (h/2 * key_size), key_margin + key_size / 2 + h * (key_size + key_margin),
        key_size, letter, "key", function() { action(letter); },
      );

      palette.letters[letter] = button;
    }
  }


  palette.flashError = function(){
    palette.error = 5;
    if (palette.mat != null) {
      palette.mat.tint = 0xdb5858;
    }
  }

  // Special keys
  if (add_special_keys) {

    palette.del = this.makeKey(
      palette,
      key_margin + key_size / 2 + 10 * (key_size + key_margin), key_margin + key_size / 2,
      key_size, "del", "key", function() {self.deleteAction();}
    );

    palette.enter_button = this.makeKey(
      palette,
      key_margin + key_size / 2 + 9 * (key_size + key_margin) + (1/2 * key_size) + key_size / 2 - 10, key_margin + key_size / 2 + (key_size + key_margin),
      key_size, "enter", "key", function() {self.enterAction();}
    );

    palette.left_button = this.makeKey(
      palette,
      key_margin + key_size / 2 + 8 * (key_size + key_margin) + (2/2 * key_size) + key_margin, key_margin + key_size / 2 + 2 * (key_size + key_margin),
      key_size, "left", "key", function() {self.leftArrowAction();}
    );

    palette.right_button = this.makeKey(
      palette,
      key_margin + key_size / 2 + 9 * (key_size + key_margin) + (2/2 * key_size) + key_margin, key_margin + key_size / 2 + 2 * (key_size + key_margin),
      key_size, "right", "key", function() {self.rightArrowAction();}
    );
  }

  return palette;
}


Game.prototype.makeOptionChooser = function(parent, x, y, options, option_name, button_to_enable) {
  var self = this;
  this.choosers[option_name] = {};
  this.choices[option_name] = -1;
  this.choice_strings[option_name] = options;

  var option_text = new PIXI.Text(option_name, {fontFamily: "Bebas Neue", fontSize: 48, fill: 0x000000, letterSpacing: 6, align: "center"});
  option_text.anchor.set(0.5,0.5);
  option_text.position.set(x, y);
  parent.addChild(option_text);
  
  var option_marker = new PIXI.Sprite(PIXI.Texture.from("Art/blue_check.png"));
  option_marker.anchor.set(0.5, 0.5);
  option_marker.position.set(x - 160, y);
  option_marker.visible = false;
  parent.addChild(option_marker);

  var left_most_x = x;
  for (var i = 0; i < options.length; i++) {
    let choice_num = i;
    if (x - 10 * (1 + options[i].length) - 20 < left_most_x) {
      left_most_x = x - 10 * (1 + options[i].length) - 20;
    }
    this.makeButton(
      parent,
      x, y + (i+1) * 64,
      options[i], 36, 6, 0x3cb0f3,
      20 * (1 + options[i].length), 60, 0xFFFFFF,
      function() {
        self.choices[option_name] = options[choice_num];
        self.resetOptionsText();
        if (option_marker.visible == false) {
          option_marker.visible = true;
          option_marker.position.y = y + (choice_num+1) * 64;
          option_marker.position.x = left_most_x;
        } else {
          var tween = new TWEEN.Tween(option_marker.position)
            .to({y: y + (choice_num+1) * 64})
            .duration(200)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
        }
        for (const [key,value] of Object.entries(self.choices)) {
          let enable = true;
          if (value == -1) {
            enable = false;
          }
          if (enable) {
            button_to_enable.enable();
          } else {
            button_to_enable.disable();
          }
        }
      }
    );
  }
}


Game.prototype.animateSceneSwitch = function(old_scene, new_scene) {
  var self = this;
  console.log("switching from " + old_scene + " to " + new_scene);
  var direction = -1;
  if (new_scene == "title" || old_scene == "gameplay") direction = 1;
  this.scenes[new_scene].position.x = direction * -1 * this.width;
  for (var i = 0; i < this.scenes.length; i++) {
    if (this.scenes[i] == new_scene || this.scenes[i] == old_scene) {
      this.scenes[i].visible = true;
    } else {
      this.scenes[i].visible = false;
      this.clearScene(this.scenes[i]);
    }
  }
  var tween_1 = new TWEEN.Tween(this.scenes[old_scene].position)
    .to({x: direction * this.width})
    .duration(1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(function() {self.clearScene(self.scenes[old_scene]);})
    .start();
  var tween_2 = new TWEEN.Tween(this.scenes[new_scene].position)
    .to({x: 0})
    .duration(1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .start();
  this.current_scene = new_scene;
}



Game.prototype.initializeAlertBox = function() {
  this.alertBox.position.set(this.width / 2, this.height / 2);
  this.alertBox.visible = false;

  this.alertMask.position.set(this.width / 2, this.height / 2);
  this.alertMask.visible = false;
  this.alertMask.interactive = true;
  this.alertMask.buttonMode = true;
  this.alertMask.on("pointertap", function() {
  });


  var mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
  mask.width = this.width;
  mask.height = this.height;
  mask.anchor.set(0.5, 0.5);
  mask.alpha = 0.2;
  mask.tint = 0x000000;
  this.alertMask.addChild(mask);

  var outline = PIXI.Sprite.from(PIXI.Texture.WHITE);
  outline.width = this.width * 2/5;
  outline.height = this.height * 2/5;
  outline.anchor.set(0.5, 0.5);
  outline.position.set(-1, -1);
  outline.tint = 0xDDDDDD;
  this.alertBox.addChild(outline);

  for (var i = 0; i < 4; i++) {
    var backingGrey = PIXI.Sprite.from(PIXI.Texture.WHITE);
    backingGrey.width = this.width * 2/5;
    backingGrey.height = this.height * 2/5;
    backingGrey.anchor.set(0.5, 0.5);
    backingGrey.position.set(4 - i, 4 - i);
    backingGrey.tint = PIXI.utils.rgb2hex([0.8 - 0.1*i, 0.8 - 0.1*i, 0.8 - 0.1*i]);
    this.alertBox.addChild(backingGrey);
  }

  var backingWhite = PIXI.Sprite.from(PIXI.Texture.WHITE);
  backingWhite.width = this.width * 2/5;
  backingWhite.height = this.height * 2/5;
  backingWhite.anchor.set(0.5, 0.5);
  backingWhite.position.set(0,0);
  backingWhite.tint = 0xFFFFFF;
  this.alertBox.addChild(backingWhite);

  this.alertBox.alertText = new PIXI.Text("EH. OKAY.", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.alertBox.alertText.anchor.set(0.5,0.5);
  this.alertBox.alertText.position.set(0, 0);
  this.alertBox.addChild(this.alertBox.alertText);

  this.alertBox.interactive = true;
  this.alertBox.buttonMode = true;
}


Game.prototype.showAlert = function(text, action) {
  var self = this;
  this.alertBox.alertText.text = text;
  this.alertBox.on("pointertap", function() {
    action();
    self.alertBox.visible = false
    self.alertMask.visible = false
  });
  this.alertBox.visible = true;
  this.alertMask.visible = true;
  new TWEEN.Tween(this.alertBox)
    .to({rotation: Math.PI / 60.0})
    .duration(70)
    .yoyo(true)
    .repeat(3)
    .start()
}



