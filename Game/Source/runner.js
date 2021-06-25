
runner_animation_speeds = {
  combat_fall: 0.35,
  combat_punch: 0.4,
  combat_ready: 0.13,
  combat_rise: 0.35,
  fast_run: 0.4,
  slow_run: 0.4,
  jump: 0.4,
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
    sprite.anchor.set(0.5,0.5);
    sprite.visible = false;
    sprite.scaleMode = PIXI.SCALE_MODES.NEAREST;

    runner.sprites[state] = sprite;
    runner.addChild(sprite);
  });

  runner.sprites[runner.current_state].visible = true;
  runner.sprites[runner.current_state].animationSpeed = runner_animation_speeds[runner.current_state]; 
  runner.sprites[runner.current_state].play();

  runner.setState = function(new_state) {
    runner.states.forEach((state) => {
      if (new_state == state) {
        runner.sprites[runner.current_state].stop();
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