
Game.prototype.initializeCutscene = function() {
  let self = this;
  let scene = this.scenes["cutscene"];
  this.clearScene(scene);

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x000000;
  scene.addChild(background);

  let cutscene_test = new PIXI.Sprite(PIXI.Texture.from("Art/Cutscenes/cutscene_test.png"));
  cutscene_test.anchor.set(0,0);
  cutscene_test.position.set(0,0);
  scene.addChild(cutscene_test);

  this.comicBubble(scene, "Using advanced LASER technology...", 400, 50);
  this.comicBubble(scene, "game objects were given physical form.", 800, this.height - 150);

  this.comicBubble(scene, "Continue", this.width - 140, this.height - 50);

  // let background = new PIXI.Sprite(PIXI.Texture.from("Art/setup_background_v2.png"));
  // background.anchor.set(0, 0);
  // scene.addChild(background);

  // let center_x = 640;

  // let difficulty_label = new PIXI.Text("Difficulty", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "center"});
  // difficulty_label.anchor.set(0.5,0.5);
  // difficulty_label.position.set(center_x,125);
  // scene.addChild(difficulty_label);

  // this.option_info = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "left", wordWrap: true, wordWrapWidth: 900});
  // this.option_info.anchor.set(0,0);
  // this.option_info.position.set(180,265);
  // this.option_info.partial_value = 0;
  // this.option_info.partial_text = "";
  // this.option_info.updatePartial = function() {
  //   this.partial_value += 0.35;
  //   if (this.partial_value > this.partial_text.length + 1) {
  //     this.partial_value = this.partial_text.length + 1;
  //   } else {
  //     this.text = this.partial_text.slice(0, Math.floor(this.partial_value));
  //   }
  // }
  // this.option_info.setPartial = function(new_str) {
  //   this.partial_value = 0;
  //   this.partial_text = new_str;
  // }
  // scene.addChild(this.option_info);

  // console.log(this.option_values.length);
  // this.option_markers = [];
  // for (let i = 0; i < this.option_values.length; i++) {
  //   let option = this.option_values[i];
  //   console.log(option);

  //   this.option_markers[i] = new PIXI.Text(option, {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "center"});
  //   this.option_markers[i].anchor.set(0.5,0.5);
  //   this.option_markers[i].position.set(center_x - 400 + 250 * i,200);
  //   if (i == this.difficulty_choice) {
  //     this.option_markers[i].tint = 0x75d3fe;
  //     this.option_info.setPartial(this.option_info_values[i].toUpperCase());
  //   }
  //   this.option_markers[i].interactive = true;
  //   this.option_markers[i].buttonMode = true;
  //   this.option_markers[i].on("pointertap", function() {
  //     self.option_markers[self.difficulty_choice].tint = 0xFFFFFF;
  //     self.difficulty_choice = i;
  //     self.option_markers[self.difficulty_choice].tint = 0x75d3fe;
  //     self.option_info.setPartial(self.option_info_values[self.difficulty_choice].toUpperCase());
  //   });
  //   scene.addChild(this.option_markers[i]);
  // }


  // let local_high_scores_label = new PIXI.Text("Local Best", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  // local_high_scores_label.anchor.set(0,0.5);
  // local_high_scores_label.position.set(228,450);
  // scene.addChild(local_high_scores_label);

  // for (let i = 1; i <= 9; i++) {
  //   let lhs = new PIXI.Text(i + ".------ --------", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  //   lhs.anchor.set(0,0.5);
  //   lhs.position.set(180,490 + 24*(i-1));
  //   scene.addChild(lhs);
  // }


  // let global_high_scores_label = new PIXI.Text("Global Best", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "right"});
  // global_high_scores_label.anchor.set(1,0.5);
  // global_high_scores_label.position.set(1074,450);
  // scene.addChild(global_high_scores_label);

  // for (let i = 1; i <= 9; i++) {
  //   let ghs = new PIXI.Text(i + ".------ --------", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  //   ghs.anchor.set(0,0.5);
  //   ghs.position.set(703,490 + 24*(i-1));
  //   scene.addChild(ghs);
  // }

  // let go_button = new PIXI.Text("GO?", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  // go_button.anchor.set(0.5,0.5);
  // go_button.position.set(center_x - 10,810);
  // scene.addChild(go_button);
  // go_button.interactive = true;
  // go_button.buttonMode = true;
  // go_button.on("pointertap", function() {
  //   self.difficulty_level = self.option_values[self.difficulty_choice];
  //   self.initializeSinglePlayerScene();
  //   self.animateSceneSwitch("setup_single", "game");
  // });
}


Game.prototype.cutsceneUpdate = function(diff) {
  var self = this;
  var scene = this.scenes["cutscene"];
}
