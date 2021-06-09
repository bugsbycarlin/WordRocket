
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





  this.score = 0;





  
  this.cutscene_container = new PIXI.Container();
  screen.addChild(this.cutscene_container);

  let cutscene_name = name;
  this.cutscene_items = scenes[cutscene_name];

  this.cutscene_state = "ready";
  this.cutscene_pagenum = 0;
  this.cutscene_name = name;

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
        if ("next_screen" in item) {
          this.cutscene_next_screen = item.next_screen; // last one is default
          page.next.on("pointerdown", function() {
            self.cutscene_next_screen = item.next_screen; // but you could have two and click one
            self.gotoCutscenePage(i+1);
          });
        }
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
      } else if ("tournament_board" in item) {
        let image = new PIXI.Sprite(PIXI.Texture.from("Art/Cutscenes/wng_computer_games_tournament.png"));
        image.anchor.set(0.5, 0.5);
        image.position.set(640, 480);
        page.addChild(image);
        page.next.visible = false;

        this.tournament_board = new PIXI.Container();
        this.tournament_board.boards = [];
        this.tournament_board.complete = false;
        this.tournament_board.usa = null;
        this.tournament_board.above = null;
        artifact = this.tournament_board;
        page.addChild(this.tournament_board);

        this.tournament_board.usa_position = 9 - parseInt(name.replace("c", ""));
        let usa_position = this.tournament_board.usa_position;
        this.tournament_board.above_position = this.tournament_board.usa_position - 1;
        console.log("usa position " + usa_position);

        let country_list = ["USSR", "FRA", "GBR", "POL", "JPN", "CSK", "NOR"];
        country_list.splice(usa_position, 0, "USA");
        for (let i = 0; i < country_list.length; i++) {
          let board = new PIXI.Container();
          board.position.set(640, 480 - 110 + 55 * i)
          this.tournament_board.addChild(board)
          this.tournament_board.boards.push(board);
          
          let shadow_square = PIXI.Sprite.from(PIXI.Texture.WHITE);
          shadow_square.anchor.set(0.5, 0.5);
          shadow_square.position.set(3, 3);
          shadow_square.width = 400;
          shadow_square.height = 50;
          shadow_square.alpha = 0.3;
          shadow_square.tint = 0x000000;
          board.addChild(shadow_square);

          let black_square = PIXI.Sprite.from(PIXI.Texture.WHITE);
          black_square.anchor.set(0.5, 0.5);
          black_square.position.set(0, 0);
          black_square.width = 402;
          black_square.height = 52;
          black_square.tint = 0x000000;
          board.addChild(black_square);

          let square = PIXI.Sprite.from(PIXI.Texture.WHITE);
          square.anchor.set(0.5, 0.5);
          square.position.set(0, 0);
          square.width = 400;
          square.height = 50;
          board.addChild(square);

          let text = new PIXI.Text((i+1) + ".      " + country_list[i], {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "left"});
          text.anchor.set(0,0.5);
          text.position.set(-190, 4);
          // text.text += country_list[i] == "USSR" ? "     " : "      ";
          // text.text += this.score;
          board.addChild(text);
          board.text = text;

          let flag = new PIXI.Sprite(PIXI.Texture.from("Art/Cutscenes/flag_" + country_list[i] + ".png"));
          flag.anchor.set(0.5, 0.5);
          flag.position.set(-128, 1);
          flag.scale.set(0.9, 0.9);
          board.addChild(flag);

          let score = Math.floor((this.score) * Math.pow(1.1, usa_position - i));
          if (i > usa_position) {
            score = Math.floor((this.score) / Math.pow(1.1, i - usa_position));
          }
          //score = Math.max(score, 100 * (9 - i));
          if (i == usa_position) score = this.score;
          let score_text = new PIXI.Text(score, {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "right"});
          score_text.anchor.set(1,0.5);
          score_text.position.set(190, 4);
          board.addChild(score_text);

          if (i == usa_position) this.tournament_board.usa = board;
          if (i == this.tournament_board.above_position) {
            this.tournament_board.above = board;
            this.tournament_board.above_country = country_list[i];
          }

        }
  //     {text: "       USSR       ", x: 640, y: 480 - 100},
  //     {text: "       FRA        ", x: 640, y: 480 - 45},
  //     {text: "       GBR        ", x: 640, y: 480 + 10},
  //     {text: "       USA        ", x: 640, y: 480 + 65},
  //     {text: "       POL        ", x: 640, y: 480 + 120},
  //     {text: "       JPN        ", x: 640, y: 480 + 175},
  //     {text: "       CSK        ", x: 640, y: 480 + 230},
  //     {text: "       NOR        ", x: 640, y: 480 + 285},
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

  console.log("about to set music");
  if (name != "c8") {
    this.setMusic("cutscene_song");
  } else {
    this.setMusic("final_song");
  }
}


Game.prototype.gotoCutscenePage = function(page_num) {
  var self = this;
  if (this.cutscene_state != "ready") {
    return;
  }

  console.log(this.cutscene_name)
  console.log(this.tournament_board.visible)
  console.log(this.tournament_board.complete)
  if (this.cutscene_name != "c1" && this.tournament_board.visible == true && this.tournament_board.complete == false) {
    this.tournament_board.complete = true;
    this.cutscene_state = "transitioning";

    let y1 = this.tournament_board.usa.position.y;
    let y2 = this.tournament_board.above.position.y;
    let tween = new TWEEN.Tween(this.tournament_board.usa.position)
      .to({y: y2})
      .duration(500)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onComplete(function() {
        self.cutscene_state = "ready";
      })
      .start();
    let tween2 = new TWEEN.Tween(this.tournament_board.above.position)
      .to({y: y1})
      .duration(500)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onComplete(function() {
      })
      .start();
    delay(function() {
      self.tournament_board.usa.text.text = (self.tournament_board.above_position+1) + ".      " + "USA";
      self.tournament_board.above.text.text = (self.tournament_board.usa_position+1) + ".      " + self.tournament_board.above_country;
    }, 250);
    // delay(function() {
    //   self.tournament_board.parent.next.visible = true;
    // }, 1000)

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

  //this.soundEffect("swipe");
  
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
  
  this.nextFlow();

  // if (this.cutscene_next_screen != "title") {
  //   this.fadeMusic(0);
  // }

  // this.initializeScreen(this.cutscene_next_screen);
  // if (this.cutscene_next_screen != "title") {
  //   this.switchScreens("cutscene", this.cutscene_next_screen);
  // } else {
  //   this.fadeScreens("cutscene", this.cutscene_next_screen, true);
  // }
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
  // c1: [
  //   [
  //     {image: "wng_computer_games_tournament.png", x: 640, y: 480, w: 1200, h: 660},
  //     {text: "       USSR       ", x: 640, y: 480 - 100},
  //     {text: "       FRA        ", x: 640, y: 480 - 45},
  //     {text: "       GBR        ", x: 640, y: 480 + 10},
  //     {text: "       USA        ", x: 640, y: 480 + 65},
  //     {text: "       JPN        ", x: 640, y: 480 + 175},
  //     {text: "       CSK        ", x: 640, y: 480 + 230},
  //     {text: "       NOR        ", x: 640, y: 480 + 285},
  //   ],
  // ],
  c8: [
    [
      {button: "Next", x: 90, y: 50, swipe_x: 1, swipe_y: 0},
      {tournament_board: "okay!"}
      
    ],
    [
      {image: "1988.png", x: 600, y: 440},
      {text: "1988", x: 180, y: 160, drift: "right"},
      {text: "Crazy time to live in Berlin.", x: 890, y: 720, drift: "left"},
      {button: "Next", x: 90, y: 50, swipe_x: 1, swipe_y: -1}
    ],
  ],
}
nonscenes = {
  c1: [
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
  c2: [
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
  c3: [
    [
      {disappears: 1, text: "More stuff...", x: 640, y: 480},
      {appears: 1, square: "yep", x: 690, y: 420, w: 800, h: 600},
      {appears: 1, text: "This is a blank cutscene.", size: 24, x: 960, y: 150},
      {appears: 1, button: "Ready?", x: 120, y: 50, swipe_x: 1, swipe_y: 0},
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  c4: [
    [
      {disappears: 1, text: "More stuff...", x: 640, y: 480},
      {appears: 1, square: "yep", x: 690, y: 420, w: 800, h: 600},
      {appears: 1, text: "This is a blank cutscene.", size: 24, x: 960, y: 150},
      {appears: 1, button: "Ready?", x: 120, y: 50, swipe_x: 1, swipe_y: 0},
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  c5: [
    [
      {disappears: 1, text: "More stuff...", x: 640, y: 480},
      {appears: 1, square: "yep", x: 690, y: 420, w: 800, h: 600},
      {appears: 1, text: "This is a blank cutscene.", size: 24, x: 960, y: 150},
      {appears: 1, button: "Ready?", x: 120, y: 50, swipe_x: 1, swipe_y: 0},
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  c6: [
    [
      {disappears: 1, text: "More stuff...", x: 640, y: 480},
      {appears: 1, square: "yep", x: 690, y: 420, w: 800, h: 600},
      {appears: 1, text: "This is a blank cutscene.", size: 24, x: 960, y: 150},
      {appears: 1, button: "Ready?", x: 120, y: 50, swipe_x: 1, swipe_y: 0},
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  c7: [
    [
      {disappears: 1, text: "More stuff...", x: 640, y: 480},
      {appears: 1, square: "yep", x: 690, y: 420, w: 800, h: 600},
      {appears: 1, text: "This is a blank cutscene.", size: 24, x: 960, y: 150},
      {appears: 1, button: "Ready?", x: 120, y: 50, swipe_x: 1, swipe_y: 0},
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  c8: [
    [
      {disappears: 1, text: "More stuff...", x: 640, y: 480},
      {appears: 1, square: "yep", x: 690, y: 420, w: 800, h: 600},
      {appears: 1, text: "This is a blank cutscene.", size: 24, x: 960, y: 150},
      {appears: 1, button: "Ready?", x: 120, y: 50, swipe_x: 1, swipe_y: 0},
    ],
  ],
}