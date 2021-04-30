
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
}


Game.prototype.cutsceneUpdate = function(diff) {
  var self = this;
  var scene = this.scenes["cutscene"];
}
