
runner_animation_speeds = {
  combat_fall: 0.35,
  combat_punch: 0.4,
  combat_ready: 0.13,
  combat_rise: 0.35,
  fast_run: 0.4,
  slow_run: 0.4,
  jump: 0.5,
  reverse_jump: 0.6,
  damage: 0.4,
  static: 0.1,
}

Game.prototype.makeRunner = function(parent, color, scale, x, y) {
  var self = this;

  let runner = new PIXI.Container();
  runner.position.set(x, y);
  runner.scale.set(scale, scale);
  parent.addChild(runner);

  runner.states = ["combat_fall", "combat_punch", "combat_ready", "combat_rise", "fast_run", "slow_run", "jump", "static"];
  runner.current_state = "static";

  runner.sprites = {};
  runner.states.forEach((state) => {
    let sheet = PIXI.Loader.shared.resources["Art/Runner/" + color + "_runner_" + state + ".json"].spritesheet;
    let sprite = new PIXI.AnimatedSprite(sheet.animations[state]);
    sprite.anchor.set(0.5,0.71);
    sprite.visible = false;
    sprite.scaleMode = PIXI.SCALE_MODES.NEAREST;

    runner.sprites[state] = sprite;
    runner.addChild(sprite);

    // if (state == "fast_run") {
    //   sprite.onFrameChange = function() {
    //     console.log(this.currentFrame);
    //   }
    // }
  });

  runner.states.push("damage");
  let sheet = PIXI.Loader.shared.resources["Art/Runner/" + color + "_runner_combat_rise.json"].spritesheet;
  let damage_sprite = new PIXI.AnimatedSprite(sheet.animations["damage"]);
  damage_sprite.anchor.set(0.5,0.71);
  damage_sprite.visible = false;
  damage_sprite.scaleMode = PIXI.SCALE_MODES.NEAREST;

  runner.sprites["damage"] = damage_sprite;
  runner.addChild(damage_sprite);

  for (var i = 0; i < 4; i++) {
    let zap_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/zappy.png"));
    zap_sprite.anchor.set(0.5, 0.5);
    zap_sprite.scale.set(1, 1);
    zap_sprite.angle = 90 * i - 45 + Math.floor(Math.random() * 90);
    //zap_sprite.position.set(25 * Math.cos(zap_sprite.angle * 180 / Math.PI), -85 + 50 * Math.sin(zap_sprite.angle * 180 / Math.PI));
    zap_sprite.position.set(15 * Math.cos(zap_sprite.angle * Math.PI / 180), -55 + 30 * Math.sin(zap_sprite.angle * Math.PI / 180));
    damage_sprite.addChild(zap_sprite);
  }

  runner.sprites[runner.current_state].visible = true;
  runner.sprites[runner.current_state].animationSpeed = runner_animation_speeds[runner.current_state]; 
  runner.sprites[runner.current_state].play();

  runner.setState = function(new_state) {
    runner.states.forEach((state) => {
      if (new_state == state) {
        runner.sprites[runner.current_state].gotoAndStop(0);
        runner.sprites[runner.current_state].visible = false;

        runner.current_state = new_state;
        runner.sprites[runner.current_state].visible = true;
        runner.sprites[runner.current_state].animationSpeed = runner_animation_speeds[runner.current_state]; 
        runner.sprites[runner.current_state].play();
      } else {
        runner.sprites[state].visible = false;
      }
    });
  }

  return runner;
}