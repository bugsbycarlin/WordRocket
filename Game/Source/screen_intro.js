

Game.prototype.initializeIntro = function() {
  let self = this;
  let screen = this.screens["intro"];
  this.clearScreen(screen);

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x000000;
  screen.addChild(background);

  this.intro_started = false;

  let image = new PIXI.Sprite(PIXI.Texture.from("Art/intro.png"));
  image.anchor.set(0.5, 0.5);
  image.position.set(this.width / 2, this.height / 2);
  image.alpha = 0;
  // image.scale.set(4, 4);
  // image.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(image);

  this.intro_voxels = [];

  // console.log(PIXI.extract.webGL.pixels(image));
  let pixels = pixi.renderer.extract.pixels(image);
  let total = 0;
  console.log(pixels.length);
  for (var i = 0; i < pixels.length; i += 4) {
    let alpha = pixels[i + 3];
    if (alpha > 0) {
      let voxel = PIXI.Sprite.from(PIXI.Texture.WHITE);
      voxel.width = 4;
      voxel.height = 4;
      voxel.tint = 0xFFFFFF;
      voxel.white = false;
      if (pixels[i] == 255 && pixels[i+1] == 255 && pixels[i+2] == 255) {
        total += 1;
        voxel.white = true;
      }
      let row = (i/4 - (i/4 % 128)) / 128;
      let col = i/4 % 128;
      voxel.tint = PIXI.utils.rgb2hex([pixels[i] / 256, pixels[i + 1] / 256, pixels[i + 2] / 256]);
      screen.addChild(voxel);
      let angle = Math.floor(Math.random() * 360);
      voxel.orig_x = this.width / 2 + 4 * col - 256;
      voxel.orig_y = this.height / 2 + 4 * row - 64;
      voxel.x_dir = Math.cos(angle * (180 / Math.PI));
      voxel.y_dir = Math.sin(angle * (180 / Math.PI));
      voxel.position.set(voxel.orig_x + 1000 * voxel.x_dir, voxel.orig_y + 1000 * voxel.y_dir);
      this.intro_voxels.push(voxel);
    }

  }
  console.log(total);

  // use this if it's necessary to click to start the intro
  // background.interactive = true;
  // background.buttonMode = true;
  // background.on("pointerdown", function() {
  // });


  self.intro_started = true;
  self.intro_start_time = self.markTime();

  self.soundEffect("intro");

  delay(function() {
    self.initializeTitle();
    self.fadeScreens("intro", "title");
  }, 4500);
}


Game.prototype.introUpdate = function(diff) {
  var self = this;
  var screen = this.screens["intro"];

  if (this.intro_voxels != null && this.intro_started == true) {
    let t = this.timeSince(this.intro_start_time);
    let param = 1;
    if (t <= 1300) {
      param = Math.min(1,Math.pow(t / 1300, 2));
    } else if (t <= 1800) {
      param = 1 + Math.max(0,0.001 * Math.sin((t - 200) / 20));
    } else if (t <= 2000) {
      param = 1;
    } else if (t > 2000) {
      param = Math.min(1,Math.pow((4000 - t) / 2000, 2));
    }

    // if (t <= 1500) {
    //   param = Math.min(1,Math.pow(t / 1500, 2));
    // } else if (t <= 1500) {
    //   // param = 1 + 0.002 * Math.sin(t / 500);
    //   param = 1;
    // } else if (t > 2000) {
    //   param = Math.min(1,Math.pow((4000 - t) / 2000, 3));
    // }

    // if (t <= 2000) {
    //   param = Math.min(1,Math.pow(t / 2000, 3));
    //   if (param > 0.95) param = 1;
    // } else if (t > 2000) {
    //   param = Math.min(1,Math.pow((4000 - t) / 2000, 3));
    // }

    for (var i = 0; i < this.intro_voxels.length; i++) {
      let voxel = this.intro_voxels[i];
      // if (voxel.white == false || t > 2000) {
      //   voxel.x = voxel.orig_x + 1000 * (1 - param) * voxel.x_dir;
      //   voxel.y = voxel.orig_y + 1000 * (1 - param) * voxel.y_dir;
      // } else {
      //   voxel.x = voxel.orig_x;
      //   voxel.y = voxel.orig_y;
      //   voxel.alpha = (t / 2000);
      // }
      voxel.x = voxel.orig_x + 1000 * (1 - param) * voxel.x_dir;
      voxel.y = voxel.orig_y + 1000 * (1 - param) * voxel.y_dir;
    }
    
  }
}
