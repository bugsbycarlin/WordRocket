
Game.prototype.initializeHighScoreScene = function(new_score) {
  let self = this;
  let scene = this.scenes["high_score_scene"];
  this.clearScene(scene);

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x000000;
  scene.addChild(background);

  this.new_high_score = new_score;

  this.high_score_state = "entry";

  this.high_score_palette = this.makeKeyboard({
    player: 1,
    parent: scene, x: this.width / 2, y: this.height * 5/6,
    defense: null, 
    action: function(letter) {

      if (self.high_score_state == "entry") {
        if (letter_array.includes(letter)) {
          self.highScoreKey(letter_array[i]);
        }

        if (letter === "Backspace") {
          self.highScoreDelete();
        }
    
        if (letter === "Enter") {
          self.highScoreEnter();
        }
      }
    }
  });

  // this.high_score_launchpad = new Launchpad(this, scene, 1, this.width / 2, this.height * 2 / 6, 32, 32, false);
  // this.high_score_launchpad.pad.mask = null;

  // let derp = new PIXI.Text("DESIGN, ART, PROGRAMMING", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  // derp.anchor.set(0.5,0.5);
  // derp.position.set(this.width / 2, 250);
  // scene.addChild(derp);

  let score_text = new PIXI.Text(this.new_high_score + " POINTS", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  score_text.anchor.set(0.5,0.5);
  score_text.position.set(this.width / 2, this.height * 1/5);
  scene.addChild(score_text);

  // let name_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  // name_text.anchor.set(0.5,0.5);
  // name_text.position.set(this.width / 2, this.height * 2/6);
  // scene.addChild(name_text);

  this.high_score_name = [];
  this.high_score_name_cursor = 0;

  for (var i = 0; i < 6; i++) {
    var cursor = PIXI.Sprite.from(PIXI.Texture.WHITE);
    cursor.width = 70 - 3;
    cursor.height = 2;
    cursor.anchor.set(0, 0.5);
    cursor.position.set(this.width / 2 + 70 * (i - 3), this.height * 8/16);
    cursor.tint = 0x3cb0f3;
    cursor.alpha = (12 - i) / (12 + 4);
    scene.addChild(cursor);

    let letter = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 60, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
    letter.anchor.set(0.5, 0.5);
    letter.position.set(this.width / 2 + 70 * (i - 3) + 35, this.height * 8/16 - 40);
    scene.addChild(letter);
    this.high_score_name.push(letter);
  }

  // let sound_derp = new PIXI.Text("SOUND", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  // sound_derp.anchor.set(0.5,0.5);
  // sound_derp.position.set(this.width / 2, 450);
  // scene.addChild(sound_derp);

  // let open_thang = new PIXI.Text("FREESOUND.ORG", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  // open_thang.anchor.set(0.5,0.5);
  // open_thang.position.set(this.width / 2, 490);
  // scene.addChild(open_thang);

  // let music_derp = new PIXI.Text("MUSIC", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  // music_derp.anchor.set(0.5,0.5);
  // music_derp.position.set(this.width / 2, 650);
  // scene.addChild(music_derp);

  // let fes_thang = new PIXI.Text("FESLIYAN STUDIOS", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  // fes_thang.anchor.set(0.5,0.5);
  // fes_thang.position.set(this.width / 2, 690);
  // scene.addChild(fes_thang);


  // var left_shark = new PIXI.Sprite(PIXI.Texture.from("Art/rocket_super_pixelated_finless_american_large_2.png"));
  // // left_shark.anchor.set(0.5, 0.5);
  // left_shark.position.set(this.width * 1/8, this.height / 2);
  // left_shark.angle = -20;
  // left_shark.scale.set(2, 2);
  // left_shark.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // left_shark.anchor.set(0.5, 0.5);
  // scene.addChild(left_shark);
  // this.left_shark_tween = new TWEEN.Tween(left_shark)
  //   .to({angle: 20})
  //   .repeat(Infinity)
  //   .yoyo(true)
  //   .duration(500)
  //   .easing(TWEEN.Easing.Quartic.InOut)
  //   .start()


  // var right_shark = new PIXI.Sprite(PIXI.Texture.from("Art/rocket_super_pixelated_finless_large.png"));
  // // right_shark.anchor.set(0.5, 0.5);
  // right_shark.position.set(this.width * 7/8, this.height / 2);
  // right_shark.anchor.set(0.5, 0.5);
  // right_shark.scale.set(2, 2);
  // right_shark.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // scene.addChild(right_shark);
  // this.right_shark_tween = new TWEEN.Tween(right_shark)
  //   .to({angle: 359})
  //   .repeat(Infinity)
  //   .duration(2000)
  //   .start()


  // let back_button = new PIXI.Text("OK, WHATEVS", {fontFamily: "Press Start 2P", fontSize: 15, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  // back_button.anchor.set(0.5,0.5);
  // back_button.position.set(this.width - 150, this.height - 40);
  // scene.addChild(back_button);
  // back_button.interactive = true;
  // back_button.buttonMode = true;
  // back_button.on("pointertap", function() {
  //   self.left_shark_tween.stop();
  //   self.right_shark_tween.stop();
  //   self.initializeTitleScreen();
  //   self.animateSceneSwitch("high_score_scene", "title");
  // });
}



