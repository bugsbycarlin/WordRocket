
var cutscene_transition_speed = 1200;
var offscreen_width = 1536;
var offscreen_height = 1152;

Game.prototype.initializeCutscene = function(name = "intro") {
  let self = this;
  let screen = this.screens["cutscene"];
  this.clearScreen(screen);

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x000000;
  // slow moving desaturated background
  // let background = new PIXI.Sprite(PIXI.Texture.from("Art/Cutscenes/word_rockets_image_1280.png"));
  // background.width = this.width * 1.5;
  // background.height = this.height * 1.5;
  // let colorMatrix = new PIXI.filters.ColorMatrixFilter();
  // background.filters = [colorMatrix];
  // colorMatrix.desaturate();
  // colorMatrix.brightness(0.25, true);
  // let tween = new TWEEN.Tween(background.position)
  //   .to({x: -300, y: 100})
  //   .duration(100000)
  //   .start();
  screen.addChild(background);

  this.cutscene_pages = [];
  
  this.cutscene_container = new PIXI.Container();
  screen.addChild(this.cutscene_container);

  let cutscene_name = name;
  this.cutscene_items = scenes[cutscene_name];

  this.cutscene_state = "ready";
  this.cutscene_pagenum = 0;

  this.sequence_num = 0;

  let x = 0;
  let y = 0;
  let last_page = null;
  for (let i = 0; i < this.cutscene_items.length; i++) {
    let page = new PIXI.Container();
    page.position.set(x, y);
    page.appears = [];
    page.disappears = [];
    page.sequence_max = 0;
    page.next = null;
    this.cutscene_container.addChild(page);
    this.cutscene_pages.push(page);

    let items = this.cutscene_items[i];
    
    for (let j = 0; j < items.length; j++) {
      let item = items[j];

      let artifact = null;
      if ("button" in item) {
        // {button: "Next", x: this.width - 90, y: this.height - 50, swipe_x: 1, swipe_y: -1}
        // Speech bubble version
        page.next = this.comicBubble(page, item.button, this.width - item.x, this.height - item.y);

        // page.next.interactive = true;
        // page.next.buttonMode = true;

        page.transition_x = -x;
        page.transition_y = -y;
        
        x += item.swipe_x * offscreen_width;
        y += item.swipe_y * offscreen_height;
        // page.next.on("pointerdown", function() {
        //   self.gotoCutscenePage(i+1);
        // });
        artifact = page.next;
      } else if ("square" in item) {
        let square = PIXI.Sprite.from(PIXI.Texture.WHITE);
        square.anchor.set(0.5, 0.5);
        square.position.set(item.x, item.y);
        square.width = item.w;
        square.height = item.h;
        page.addChild(square);
        artifact = square;
      } else if ("text" in item) {
        let size = 36;
        if ("size" in item) size = item.size;
        artifact = this.comicBubble(page, item.text, item.x, item.y, size);
      } else if ("image" in item) {
        let image = new PIXI.Sprite(PIXI.Texture.from("Art/Cutscenes/" + item.image));
        image.anchor.set(0.5, 0.5);
        image.position.set(item.x, item.y);
        page.addChild(image);
        artifact = image;
      }

      if ("drift" in item) {
        if (item.drift != "scale") {
          let x_d = 0;
          let y_d = 0;
          if (item.drift == "left") x_d = -100;
          if (item.drift == "right") x_d = 100;
          if (item.drift == "up") y_d = -100;
          if (item.drift == "down") y_d = 100;
          let x = artifact.x;
          let y = artifact.y;
          artifact.tween = new TWEEN.Tween(artifact.position)
            .to({x: x + x_d, y: y + y_d})
            .duration(60000)
            .start();
        } else {
          let s_x = artifact.scale.x;
          let s_y = artifact.scale.y;
          artifact.tween = new TWEEN.Tween(artifact.scale)
            .to({x: 1.1 * s_x, y: 1.1 * s_y})
            .duration(60000)
            .start();
        }
      }

      if ("appears" in item) {
        artifact.appears = item.appears;
        page.appears.push(artifact);
        page.sequence_max = Math.max(page.sequence_max, item.appears)
        artifact.visible = false;
        artifact.shaking = false;
        artifact.permanent_x = artifact.position.x;
        artifact.permanent_y = artifact.position.y;
      }

      if ("disappears" in item) {
        artifact.disappears = item.disappears;
        page.disappears.push(artifact);
        page.sequence_max = Math.max(page.sequence_max, item.disappears)
      }
    }

    if (page.sequence_max > 0 && page.next != null) page.next.visible = false;

    last_page = page;
  }

  screen.interactive = true;
  screen.buttonMode = true;
  screen.on("pointerdown", function() {
    self.gotoCutscenePage(self.cutscene_pagenum + 1);
  });

  this.setMusic("cutscene_song");
}


Game.prototype.gotoCutscenePage = function(page_num) {
  var self = this;
  if (this.cutscene_state != "ready") {
    return;
  }

  if (this.sequence_num < this.cutscene_pages[this.cutscene_pagenum].sequence_max) {
    this.sequence_num += 1;

    let something_appeared = false;
    for (let j = 0; j < this.cutscene_pages[this.cutscene_pagenum].appears.length; j++) {
      let artifact = this.cutscene_pages[this.cutscene_pagenum].appears[j];
      if (this.sequence_num == artifact.appears) {
        artifact.visible = true;
        artifact.shaking = true;
        delay(function() {
          self.cutscene_pages[self.cutscene_pagenum].appears[j].shaking = false;
        }, 100);
        something_appeared = true;
      }
    }

    if (something_appeared) this.soundEffect("punch_" + Math.ceil(Math.random() * 6));
    
    for (let j = 0; j < this.cutscene_pages[this.cutscene_pagenum].disappears.length; j++) {
      if (this.sequence_num == this.cutscene_pages[this.cutscene_pagenum].disappears[j].disappears) {
        this.cutscene_pages[this.cutscene_pagenum].disappears[j].visible = false;
      }
    }

    if (this.sequence_num >= this.cutscene_pages[this.cutscene_pagenum].sequence_max) {
      this.cutscene_pages[this.cutscene_pagenum].next.visible = true;
    }

    return;
  }

  this.soundEffect("swipe");
  
  if (page_num >= this.cutscene_items.length) {
    //console.log("running over the end of the cutscene. don't do that. use the scene end button instead.");
    this.endCutscene();
    return;
  }

  this.cutscene_state = "transitioning";
  for (let p = 0; p < this.cutscene_items.length; p++) {
    if (p != page_num - 1 && p != page_num) {
      this.cutscene_pages[p].visible = false;
    } else {
      this.cutscene_pages[p].visible = true;
    }
    if (this.cutscene_pages[p].next != null) {
      this.cutscene_pages[p].next.interactive = false;
      this.cutscene_pages[p].next.visible = false;
    }
  }

  this.sequence_num = 0;
  for (let j = 0; j < this.cutscene_pages[page_num].appears.length; j++) {
    this.cutscene_pages[page_num].appears[j].visible = false;
  }

  // let m_x = this.cutscene_container.x;
  // let m_y = this.cutscene_container.y;
  let t_x = this.cutscene_pages[page_num].transition_x;
  let t_y = this.cutscene_pages[page_num].transition_y;
  let tween = new TWEEN.Tween(this.cutscene_container.position)
    .to({x: t_x, y: t_y})
    .duration(cutscene_transition_speed)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(function() {
      delay(function() {
        for (var p = 0; p < self.cutscene_items.length; p++) {
          if (self.cutscene_pages[p].next != null) {
            self.cutscene_pages[p].next.interactive = true;
            if (self.cutscene_pages[p].sequence_max == 0) {
              self.cutscene_pages[p].next.visible = true;
            }
          }
        }
        self.cutscene_state = "ready";
        self.cutscene_pagenum = self.cutscene_pagenum + 1;
      }, 200)})
    .start();
}


Game.prototype.endCutscene = function() {
  if (this.cutscene_state != "ready") {
    return;
  }
  this.cutscene_state = "transitioning";
  for (var p = 0; p < this.cutscene_items.length; p++) {
    if (p != this.cutscene_pagenum) {
      this.cutscene_pages[p].visible = false;
    }
    this.cutscene_pages[p].next.interactive = false;
    this.cutscene_pages[p].next.visible = false;
  }
  this.fadeMusic(0);

  // for now, it just goes directly into the game
  this.initialize1pGame();
  this.switchScreens("cutscene", "1p_game");
}


Game.prototype.cutsceneUpdate = function(diff) {
  var self = this;
  var screen = this.screens["cutscene"];

  if (this.cutscene_pages != null && this.cutscene_pages.length > 0) {
    for (let j = 0; j < this.cutscene_pages[this.cutscene_pagenum].appears.length; j++) {
      let artifact = this.cutscene_pages[this.cutscene_pagenum].appears[j];
      if (artifact.shaking) {
        artifact.position.set(
          artifact.permanent_x - 2 + Math.floor(Math.random() * 4),
          artifact.permanent_y - 2 + Math.floor(Math.random() * 4)
        );
      } else {
        artifact.position.set(artifact.permanent_x, artifact.permanent_y);
      }
    }
  }
}



scenes = {
  intro: [
    [
      {image: "1988.png", x: 600, y: 440},
      {text: "1988", x: 180, y: 160, drift: "right"},
      {text: "Crazy time to live in Berlin.", x: 890, y: 720, drift: "left"},
      {button: "Next", x: 90, y: 50, swipe_x: 1, swipe_y: -1}
    ],
    [
      {image: "fight_image.png", x: 690, y: 480},
      {text: "Tensions were high at the first \nWorld Nerd Games.", x: 360, y: 160, drift: "right"},
      {text: "The opening ceremonies were chaos.", x: 810, y: 810, drift: "left"},
      {button: "Next", x: 90, y: 50, swipe_x: 0, swipe_y: 1}
    ],
    [
      {image: "lab_image.png", x: 640, y: 410, drift: "up"},
      {text: "The US and USSR flouted the rules, fielding \nteams of elite professionals.", x: 630, y: 760, drift: "down"},
      {button: "Next", x: 90, y: 50, swipe_x: 1, swipe_y: 0}
    ],
    [
      {image: "games_image.png", x: 660, y: 510},
      {text: "Mathletes and chess masters competed alongside \ncube solvers and tetris champions.", x: 590, y: 200, drift: "up"},
      {text: "But one computer game had us all in thrall.", x: 730, y: 790, drift: "down"},
      {button: "Next", x: 90, y: 50, swipe_x: -1, swipe_y: 1}
    ],
    [
      {image: "word_rockets.png", x: 640, y: 480, drift: "scale"},
      {text: "Mavis Bennett's \"Word Rockets\" used \nadvanced LASER technology...", x: 420, y: 60},
      {text: "to give digital objects physical form.", x: 810, y: 460},
      {text: "My class was addicted.", x: 1000, y: 660},
      {button: "Next", x: 90, y: 50, swipe_x: 1, swipe_y: 0}
    ],
    [
      {text: "But just before the games began...", x: 640, y: 480},
      {button: "Next", x: 90, y: 50, swipe_x: 0, swipe_y: 1}
    ],
    [
      {image: "building_image.png", x: 660, y: 450, drift: "right"},
      {text: "An accident!", x: 360, y: 180, drift: "up"},
      {text: "The US team was killed in a training exercise \nwhen their computers launched streams of \nchemical names, causing an explosion.", x: 720, y: 760, drift: "down"},
      {button: "Next", x: 90, y: 50, swipe_x: 1, swipe_y: 0}
    ],
    [
      {image: "putzen_class_image.png", x: 660, y: 450},
      {text: "Our teacher, Mr Putzen, brought our entire \nclass to the training facility...", x: 480, y: 120, drift: "down"},
      {text: "and offered us as last minute replacements.", x: 800, y: 800, drift: "up"},
      {button: "Next", x: 90, y: 50, swipe_x: 0, swipe_y: 1}
    ],
    [
      {image: "us_vs_them.png", x: 620, y: 450},
      {text: "So we went up against the Russians. \nThey were bigger, they were stronger, \nthey were really good typists...", x: 430, y: 120},
      {text: "But god damnit*, we were Americans.", x: 850, y: 750, drift: "left"},
      {text: "*Sorry, Mom", x: 200, y: 900},
      {button: "Ready?", x: 120, y: 50, swipe_x: 0, swipe_y: 1}
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  old_man: [
    [
      {disappears: 1, text: "Moskva...", x: 640, y: 480},
      {appears: 1, disappears: 8, image: "zhukov.png", x: 690, y: 420},
      {appears: 1, disappears: 4, text: "You are obsessed with this *game*, \nGeorgy. It is unhealthy.", size: 24, x: 960, y: 150},
      {appears: 2, disappears: 4, text: "It is the perfect combination of strategy and combat. \nThe Americans will use this to raise an unstoppable \ngeneral staff. I must go to the competition.", size: 24, x: 510, y: 800},
      {appears: 3, disappears: 4, text: "I must destroy them.", size: 24, x: 850, y: 880},
      // {appears: 8, button: "Next", x: 90, y: 50, swipe_x: 1, swipe_y: -1},
      {appears: 5, disappears: 8, text: "But you're too old.", size: 24, x: 990, y: 180},
      {appears: 6, disappears: 8, text: "The fuck I am.", size: 24, x: 510, y: 800},
      {appears: 7, disappears: 8, text: "Look at my high score.", size: 24, x: 850, y: 840},
      {appears: 8, disappears: 9, text: "Berlin...", x: 640, y: 480},
      {appears: 9, image:"zhukov_2a.png", x: 255, y: 520},
      {appears: 9, text: "For the Base Capture portion of the \ncompetition, the USSR selects...", size: 24, x: 320, y: 100},
      {appears: 10, text: "Moskva High student Georgy Zhukov.", size: 24, x: 640, y: 860},
      {appears: 10, image:"zhukov_2b.png", x: 640, y: 450},
      {appears: 11, image:"zhukov_2c.png", x: 1000, y: 545},
      {appears: 12, button: "Ready?", x: 120, y: 50, swipe_x: 1, swipe_y: 0},
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------  
  blippin: [
    [
      ["square", 620, 450, 1080, 620],
      ["text", "Wog wog wog", 430, 120],
      ["text", "Wheedle doo!", 850, 750],
      ["exit_to_game", "Go", 0, 1],
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  bloppin: [
    [
      ["square", 620, 450, 1080, 620],
      ["text", "Sing the praises of wigs", 430, 120],
      ["text", "Wala dee frickin da", 850, 750],
      ["next", "Next", 1, 0],
    ],
    [
      ["square", 600, 440, 720, 380],
      ["text", "I am a wiggy wiggy wiggy wiggy wig", 700, 160],
      ["text", "now let me go.", 890, 720],
      ["next", "Go", 1, -1],
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  flappin: [

  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  pippin: [

  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  end: [

  ],
}