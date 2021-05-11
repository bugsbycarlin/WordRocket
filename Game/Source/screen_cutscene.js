
var cutscene_transition_speed = 1300;

Game.prototype.initializeCutscene = function() {
  let self = this;
  let screen = this.screens["cutscene"];
  this.clearScreen(screen);

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x000000;
  screen.addChild(background);

  // let cutscene_test = new PIXI.Sprite(PIXI.Texture.from("Art/Cutscenes/cutscene_test.png"));
  // cutscene_test.anchor.set(0,0);
  // cutscene_test.position.set(0,0);
  // screen.addChild(cutscene_test);

  // this.comicBubble(screen, "Using advanced LASER technology...", 400, 50);
  // this.comicBubble(screen, "game objects were given physical form.", 800, this.height - 150);

  // this.comicBubble(screen, "Continue", this.width - 140, this.height - 50);
  
  let main_container = new PIXI.Container();
  screen.addChild(main_container);

  let x = 0;
  let y = 0;
  let scene_items = scenes["intro"];
  let last_container = null;
  let containers = [];
  for (let i = 0; i < scene_items.length; i++) {
    let container = new PIXI.Container();
    container.position.set(x, y);
    main_container.addChild(container);
    containers.push(container);

    let items = scene_items[i];
    for (var j = 0; j < items.length; j++) {
      let item = items[j];
      console.log(item);
      if (item[0] == "next") {
        // Speech bubble version
        container.next = this.comicBubble(container, "Next", this.width - 90, this.height - 50);
        
        // Arrow version
        // container.next = new PIXI.Container();
        // let outer_arrow = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/arrow2.png"));
        // outer_arrow.anchor.set(0.5, 0.5)
        // outer_arrow.scale.set(1.17, 1.22)
        // outer_arrow.tint = 0x000000;
        // outer_arrow.position.set(-2,0);
        // container.next.addChild(outer_arrow);
        // let inner_arrow = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/arrow2.png"));
        // inner_arrow.anchor.set(0.5, 0.5)
        // container.next.addChild(inner_arrow);
        // container.next.position.set(this.width - 65, this.height - 60);
        // container.next.rotation = Math.atan2(item[3], item[2]);
        // container.addChild(container.next);

        container.next.interactive = true;
        container.next.buttonMode = true;
        
        x += item[2] * offscreen_width;
        y += item[3] * offscreen_height;
        container.next.on("pointerdown", function() {
          for (var p = 0; p < scene_items.length; p++) {
            if (p != i && p != i + 1) {
              containers[p].visible = false;
            } else {
              containers[p].visible = true;
            }
            containers[p].next.interactive = false;
            containers[p].next.visible = false;
          }
          let m_x = main_container.x;
          let m_y = main_container.y;
          let tween = new TWEEN.Tween(main_container.position)
            .to({x: m_x - item[2] * offscreen_width, y: m_y - item[3] * offscreen_height})
            .duration(cutscene_transition_speed)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onComplete(function() {
              delay(function() {
                for (var p = 0; p < scene_items.length; p++) {
                  containers[p].next.interactive = true;
                  containers[p].next.visible = true;
                }
              }, 200)})
            .start();
        });
      } else if (item[0] == "square") {
        let square = PIXI.Sprite.from(PIXI.Texture.WHITE);
        square.anchor.set(0.5, 0.5);
        square.position.set(item[1], item[2]);
        square.width = item[3];
        square.height = item[4];
        container.addChild(square);
      } else if (item[0] == "text") {
        let text = this.comicBubble(container, item[1], item[2], item[3]);
      } else if (item[0] == "image") {
        let image = new PIXI.Sprite(PIXI.Texture.from("Art/Cutscenes/" + item[1]));
        image.anchor.set(0.5, 0.5);
        image.position.set(item[2], item[3]);
        container.addChild(image);
      }
    }

    last_container = container;
  }
}


Game.prototype.cutsceneUpdate = function(diff) {
  var self = this;
  var screen = this.screens["cutscene"];
}

offscreen_width = 1536;
offscreen_height = 1152;

scenes = {
  intro: [
    [
      ["image", "1988_image.png", 500, 420, 720, 380],
      ["text", "1988", 180, 160],
      ["next", "Continue", 1, -1],
    ],
    [
      ["image", "fight_image_v3.png", 690, 480, 1024, 620], // x, y, w, h
      ["text", "Tensions are high at the first \nWorld Nerd Games\nin Berlin.", 360, 120],
      ["next", "Continue", 0, 1],
    ],
    [
      ["image", "lab_image.png", 640, 410, 1080, 410],
      ["text", "The US and USSR flout the rules to \nassemble teams of elite players.", 630, 760],
      ["next", "Continue", 1, 0],
    ],
    [
      ["image", "games_image.png", 660, 510, 1080, 510],
      ["text", "Mathletes and chess masters compete alongside \ncube solvers and tetris champions.", 590, 200],
      ["text", "But one computer game has everyone in thrall.", 730, 790],
      ["next", "Continue", -1, 1],
    ],
    [
      ["image", "word_rockets_image_1280.png", 640, 480, 1280, 960],
      ["text", "Using advanced LASER technology...", 420, 60],
      ["text", "Word Rockets gives digital objects physical form.", 730, 830],
      // ["text", "Word Rockets gives digital objects physical form.", 690, 480],
      // ["text", "Players literally destroy each other's keyboards.", 780, 830],
      ["next", "Continue", 1, 0],
    ],
    [
      ["text", "But just before the games begin...", 640, 480],
      ["next", "Continue", 0, 1],
    ],
    [
      ["image", "building_image.png", 660, 450, 1080, 620],
      ["text", "An accident!", 240, 120],
      ["text", "The US team is killed in a training exercise \nwhen their computers launch streams of \nchemical names, causing an explosion.", 720, 760],
      ["next", "Continue", 1, 0],
    ],
    [
      ["image", "putzen_class_image.png", 660, 450, 1080, 620],
      ["text", "west berlin high school teacher \nWaldemar Putzen emerges in the chaos...", 440, 120],
      ["text", "and offers his class as last minute replacements.", 740, 800],
      ["next", "Continue", 0, 1],
    ],
  ]
}