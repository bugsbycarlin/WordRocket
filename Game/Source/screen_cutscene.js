
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
  for (var i = 0; i < scene_items.length; i++) {
    let container = new PIXI.Container();
    container.position.set(x, y);
    main_container.addChild(container);
    console.log("hey");

    let items = scene_items[i];
    for (var j = 0; j < items.length; j++) {
      let item = items[j];
      console.log(item);
      if (item[0] == "next") {
        container.next = this.comicBubble(container, item[1], this.width - 140, this.height - 50);
        container.next.interactive = true;
        container.next.buttonMode = true;
        x += item[2] * offscreen_width;
        y += item[3] * offscreen_height;
        container.next.on("pointerdown", function() {
          let m_x = main_container.x;
          let m_y = main_container.y;
          let tween = new TWEEN.Tween(main_container.position)
            .to({x: m_x - item[2] * offscreen_width, y: m_y - item[3] * offscreen_height})
            .duration(2000)
            .easing(TWEEN.Easing.Cubic.InOut)
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
      ["square", 500, 420, 720, 380],
      ["text", "1988", 180, 160],
      ["next", "Continue", 1, -1],
    ],
    [
      ["square", 780, 640, 940, 525],
      ["text", "Tensions are high at the first\nWorld Computer Games\nin Berlin.", 360, 180],
      ["next", "Continue", 0, 1],
    ],
    [
      ["square", 640, 410, 1080, 410],
      ["text", "The US and USSR flout the rules to\nassemble teams of elite players.", 630, 760],
      ["next", "Continue", 1, 0],
    ],
    [
      ["square", 640, 410, 1080, 410],
      ["text", "Athletes compete head to head at hot new games like Tetris and Street Fighter.", 630, 200],
      ["text", "But one game has left the competition in thrall.", 630, 760],
      ["next", "Continue", -1, 1],
    ],
    [
      ["square", 690, 490, 1024, 768],
      ["text", "Using advanced LASER technology...", 300, 70],
      ["text", "Word Rockets gives digital objects physical form", 630, 830],
      ["next", "Continue", 1, 0],
    ]
  ]
}