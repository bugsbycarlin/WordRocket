
run_speeds = {
  0: {
    type: "static",
    animation_speed: 0.1,
    ground_speed: 0,
  },
  1: {
    type: "slow_run",
    animation_speed: 0.30,
    ground_speed: 2.4 * 0.75,
  },
  2: {
    type: "slow_run",
    animation_speed: 0.40,
    ground_speed: 2.4,
  },
  3: {
    type: "slow_run",
    animation_speed: 0.50,
    ground_speed: 2.4 * 1.25,
  },
  4: {
    type: "fast_run",
    animation_speed: 0.30,
    ground_speed: 5.77 * 0.75,
  },
  5: {
    type: "fast_run",
    animation_speed: 0.40,
    ground_speed: 5.77,
  },
  6: {
    type: "fast_run",
    animation_speed: 0.50,
    ground_speed: 5.77 * 1.25,
  },
  7: {
    type: "fast_run",
    animation_speed: 0.50,
    ground_speed: 5.77 * 1.25,
  },
}

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
  terminal: 0.1,
}

Game.prototype.makeRunner = function(parent, color, scale, x, y, speed, get_up) {
  var self = this;

  let runner = new PIXI.Container();
  runner.position.set(x, y);
  runner.scale.set(scale, scale);
  parent.addChild(runner);

  runner.states = ["combat_fall", "combat_punch", "combat_ready", "combat_rise", "fast_run", "slow_run", "jump", "static", "terminal"];
  runner.current_state = "static";

  runner.lx = 0;
  runner.ly = 0;
  runner.ly_floor = 0;
  runner.speed = speed;
  runner.ground_speed = 0;
  runner.get_up = get_up;
  runner.last_speed_change = this.markTime();
  runner.changeSpeed();

  runner.sprites = {};
  runner.states.forEach((state) => {
    let sheet = PIXI.Loader.shared.resources["Art/Runner/" + color + "_runner_" + state + ".json"].spritesheet;
    let sprite = new PIXI.AnimatedSprite(sheet.animations[state]);
    // this anchor is set to the feet
    sprite.anchor.set(0.5,0.71);
    sprite.visible = false;
    sprite.scaleMode = PIXI.SCALE_MODES.NEAREST;

    runner.sprites[state] = sprite;
    runner.addChild(sprite);
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
    zap_sprite.position.set(15 * Math.cos(zap_sprite.angle * Math.PI / 180), -55 + 30 * Math.sin(zap_sprite.angle * Math.PI / 180));
    damage_sprite.addChild(zap_sprite);
  }

  // Add event listeners to change the run speed.
  // We do it this way so there isn't a sudden frame jump.
  runner.sprites["slow_run"].onLoop = function() { self.changeSpeed(); }
  runner.sprites["fast_run"].onLoop = function() { self.changeSpeed(); }

  runner.sprites[runner.current_state].visible = true;
  runner.sprites[runner.current_state].animationSpeed = runner_animation_speeds[runner.current_state]; 
  runner.sprites[runner.current_state].play();

  runner.sprites["combat_fall"].onLoop = function() {
    runner.sprites["combat_fall"].gotoAndStop(26);
    if (runner.get_up) {
      delay(function() {
        runner.setState("combat_rise");
        runner.sprites["combat_rise"].onLoop = function() {
          runner.setState("static");
        }
      }, 500);
      runner.next_state = null;
      runner.last_state = null;
    }
  }

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

  runner.changeSpeed = function() {
    let speed_marker = Math.ceil(runner.speed);
    let speed_option = run_speeds[speed_marker];

    runner.setState(speed_option.type);
    runner.sprites[runner.current_state].animationSpeed = speed_option.animation_speed;
    runner.ground_speed = speed_option.ground_speed;
  }

  return runner;
}