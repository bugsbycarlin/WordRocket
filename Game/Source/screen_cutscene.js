
var cutscene_transition_speed = 1200;
var offscreen_width = 1536;
var offscreen_height = 1152;

Game.prototype.initializeCutscene = function() {
  let self = this;
  let screen = this.screens["cutscene"];
  this.clearScreen(screen);

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x000000;
  screen.addChild(background);

  this.cutscene_pages = [];
  
  this.cutscene_container = new PIXI.Container();
  screen.addChild(this.cutscene_container);

  let cutscene_name = "intro";
  this.cutscene_items = scenes[cutscene_name];

  this.cutscene_state = "ready";
  this.cutscene_pagenum = 0;

  let x = 0;
  let y = 0;
  let last_page = null;
  for (let i = 0; i < this.cutscene_items.length; i++) {
    let page = new PIXI.Container();
    page.position.set(x, y);
    this.cutscene_container.addChild(page);
    this.cutscene_pages.push(page);

    let items = this.cutscene_items[i];
    for (let j = 0; j < items.length; j++) {
      let item = items[j];
      console.log(item);
      if (item[0] == "next") {
        // Speech bubble version
        page.next = this.comicBubble(page, item[1], this.width - 90, this.height - 50);
        
        // Arrow version
        // page.next = new PIXI.Container();
        // let outer_arrow = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/arrow2.png"));
        // outer_arrow.anchor.set(0.5, 0.5)
        // outer_arrow.scale.set(1.17, 1.22)
        // outer_arrow.tint = 0x000000;
        // outer_arrow.position.set(-2,0);
        // page.next.addChild(outer_arrow);
        // let inner_arrow = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/arrow2.png"));
        // inner_arrow.anchor.set(0.5, 0.5)
        // page.next.addChild(inner_arrow);
        // page.next.position.set(this.width - 65, this.height - 60);
        // page.next.rotation = Math.atan2(item[3], item[2]);
        // page.addChild(page.next);

        page.next.interactive = true;
        page.next.buttonMode = true;

        page.transition_x = -x;
        page.transition_y = -y;
        
        x += item[2] * offscreen_width;
        y += item[3] * offscreen_height;
        page.next.on("pointerdown", function() {
          self.gotoCutscenePage(i+1);
        });
      } else if (item[0] == "exit_to_game") {
        // Speech bubble version
        page.next = this.comicBubble(page, item[1], this.width - 120, this.height - 50);

        page.next.interactive = true;
        page.next.buttonMode = true;

        page.transition_x = -x;
        page.transition_y = -y;
        
        x += item[2] * offscreen_width;
        y += item[3] * offscreen_height;
        page.next.on("pointerdown", function() {
          self.endCutscene();
        });
      } else if (item[0] == "square") {
        let square = PIXI.Sprite.from(PIXI.Texture.WHITE);
        square.anchor.set(0.5, 0.5);
        square.position.set(item[1], item[2]);
        square.width = item[3];
        square.height = item[4];
        page.addChild(square);
      } else if (item[0] == "text") {
        let text = this.comicBubble(page, item[1], item[2], item[3]);
      } else if (item[0] == "image") {
        let image = new PIXI.Sprite(PIXI.Texture.from("Art/Cutscenes/" + item[1]));
        image.anchor.set(0.5, 0.5);
        image.position.set(item[2], item[3]);
        page.addChild(image);
      }
    }

    last_page = page;
  }

  this.setMusic("cutscene_song");
}


Game.prototype.gotoCutscenePage = function(page_num) {
  var self = this;
  if (this.cutscene_state != "ready") {
    return;
  }
  if (page_num >= this.cutscene_items.length) {
    console.log("running over the end of the cutscene. don't do that. use the scene end button instead.");
    return;
  }
  this.cutscene_state = "transitioning";
  for (var p = 0; p < this.cutscene_items.length; p++) {
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
            self.cutscene_pages[p].next.visible = true;
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
}



scenes = {
  intro: [
    [
      ["image", "1988_v2_1080.png", 600, 440, 720, 380],
      ["text", "1988", 180, 160],
      ["text", "Crazy time to live in Berlin.", 890, 720],
      ["next", "Next", 1, -1],
    ],
    [
      ["image", "fight_image_v3.png", 690, 480, 1024, 620], // x, y, w, h
      ["text", "Tensions were high at the first \nWorld Nerd Games.", 360, 160],
      ["text", "The opening ceremonies were chaos.", 810, 810],
      ["next", "Next", 0, 1],
    ],
    [
      ["image", "lab_image.png", 640, 410, 1080, 410],
      ["text", "The US and USSR flouted the rules, fielding \nteams of elite professionals.", 630, 760],
      ["next", "Next", 1, 0],
    ],
    [
      ["image", "games_image.png", 660, 510, 1080, 510],
      ["text", "Mathletes and chess masters competed alongside \ncube solvers and tetris champions.", 590, 200],
      ["text", "But one computer game had us all in thrall.", 730, 790],
      ["next", "Next", -1, 1],
    ],
    [
      ["image", "word_rockets_image_1280.png", 640, 480, 1280, 960],
      ["text", "Mavis Bennett's \"Word Rockets\" used \nadvanced LASER technology...", 420, 60],
      ["text", "to give digital objects physical form.", 810, 460],
      ["text", "My class was addicted.", 1000, 660],
      ["next", "Next", 1, 0],
    ],
    [
      ["text", "But just before the games began...", 640, 480],
      ["next", "Next", 0, 1],
    ],
    [
      ["image", "building_image.png", 660, 450, 1080, 620],
      ["text", "An accident!", 240, 120],
      ["text", "The US team was killed in a training exercise \nwhen their computers launched streams of \nchemical names, causing an explosion.", 720, 760],
      ["next", "Next", 1, 0],
    ],
    [
      ["image", "putzen_class_image.png", 660, 450, 1080, 620],
      ["text", "Our teacher, Mr Putzen, brought our entire \nclass to the training facility...", 480, 120],
      ["text", "and offered us as last minute replacements.", 800, 800],
      ["next", "Next", 0, 1],
    ],
    [
      ["image", "us_vs_them_v3.png", 620, 450, 1080, 620],
      ["text", "So we went up against the Russians. \nThey were bigger, they were stronger, \nthey were really good typists...", 430, 120],
      ["text", "But god damnit*, we were Americans.", 850, 750],
      ["text", "*Sorry, Mom", 200, 900],
      ["exit_to_game", "Ready?", 0, 1],
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