'use strict';

var annoying = true;
var use_scores = false;
var silence = false;
var log_performance = true;

var performance_result = null;

var pixi = null;
var game = null;

function initialize() {
  game = new Game();
}

WebFont.load({
  google: {
    families: ['Bebas Neue']
  }
});


var firebaseConfig = {
  apiKey: "AIzaSyBlhNihmc39kLoWKY-MlG49ItSGJcpXSfQ",
  authDomain: "wordvolley-ccdb6.firebaseapp.com",
  projectId: "wordvolley-ccdb6",
  databaseURL: "https://wordvolley-ccdb6-default-rtdb.firebaseio.com",
  storageBucket: "wordvolley-ccdb6.appspot.com",
  messagingSenderId: "591926001792",
  appId: "1:591926001792:web:d6078dc492a6156604e665",
  measurementId: "G-FB1JPHYKJN",
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();


class Game {
  constructor() {

    var self = this;

    this.tracking = {};

    this.setDeviceAndFormat();

    document.addEventListener("keydown", function(ev) {self.handleKeyDown(ev)}, false);
    this.loadWords();

    this.multiplayer = new Multiplayer(this);

    this.resetTitle();

    this.initializeScenes();
    this.initializeAlertBox();
    this.intializeAnimations();

    this.current_scene = "title";

    window.addEventListener("unload", function(ev) {
      if (self.game_code != "" && self.player > 0) {
        self.multiplayer.leaveGame(self.game_code, self.player)
        self.resetTitle();
      }
    })
  }


  setDeviceAndFormat() {
    var self = this;
    console.log("browser test device");
    console.log(device);
    if (device == null && detectMobileBrowser() == false) {
      // Normal browser game. Proceed normally.
      console.log("I am a normal browser device");
      this.width = 1280;
      this.height = 960;
      this.device_type = "browser";
      this.keyboard_sounds = true;
      this.fps = 30;
      //  document.getElementById("mainDiv").style.width = 1024;
      // document.getElementById("mainDiv").style.marginLeft = -512;
    } else if (device != null && (device.platform == "iOS" || device.platform == "browser")) {
      // iOS device. Must choose best aspect ratio.
      if (device.platform != "browser") {
        screen.orientation.lock("portrait-primary");
      }
      this.fps = 45;
      if (navigator.userAgent.indexOf("iPhone") > 0) {
        var physicalScreenWidth = window.screen.width * window.devicePixelRatio;
        var physicalScreenHeight = window.screen.height * window.devicePixelRatio;
        //alert("Width: " + window.screen.width + "*" + window.devicePixelRatio + "=" + physicalScreenWidth);
        //alert("Height: " + window.screen.height + "*" + window.devicePixelRatio + "=" + physicalScreenHeight);
        // this should work out to 1136x640 on my iphone 5s. I need to try one of mom's old devices though.
        this.width = physicalScreenWidth;
        this.height = physicalScreenHeight;
        this.device_type = "iPhone";
        this.keyboard_sounds = true;
      } else if (navigator.userAgent.indexOf("iPad") > 0) {
        this.width = 768;
        this.height = 1024;
        this.device_type = "iPad";
        this.keyboard_sounds = true;
      } else {
        // this.width = 768;
        // this.height = 1024;
        // this.device_type = "iPad";
        this.width = 640;
        this.height = 1136;
        this.device_type = "iPhone";
        this.keyboard_sounds = true;
      }
      
      
      // alert("Width: " + window.screen.width + "*" + window.devicePixelRatio + "=" + physicalScreenWidth);
      // alert("Height: " + window.screen.height + "*" + window.devicePixelRatio + "=" + physicalScreenHeight);
    } else if (detectMobileBrowser() == true) {
      // Mobile browser. Warn that this game is not playable and offer a link to the app.
      this.width = 768;
      this.height = 1024;
      this.device_type = "mobile_browser";
    }

    // Create the pixi application
    pixi = new PIXI.Application(this.width, this.height, {antialias: true});
    document.getElementById("mainDiv").appendChild(pixi.view);
    pixi.renderer.backgroundColor = 0xFFFFFF;
    pixi.renderer.resize(this.width,this.height);
    console.log("Renderer: " + PIXI.RENDERER_TYPE[pixi.renderer.type]);

    if (this.device_type == "iPhone") {
      pixi.stage.scale.set(1/window.devicePixelRatio, 1/window.devicePixelRatio);
    }



    // setTimeout(function() {
    //   // Game loop
    //   while(true) {
    //     let now = Date.now();
    //     let time = now - game_loop_start;
    //     if (now - last_frame >= 1000 / self.fps) {
    //       fps_counter += 1;
    //       last_frame = now;

    //       self.trackStart("update");
    //       self.update();
    //       self.trackStop("update");

    //       self.trackStart("tween");
    //       TWEEN.update(time);
    //       self.trackStop("tween");

    //       self.trackStart("animate");
    //       ticker.update(time);
    //       pixi.renderer.render(pixi.stage);
    //       self.trackStop("animate");

    //       if (now - last_performance_update > 6000 && log_performance) {
    //         // There were 6000 milliseconds, so divide FPS by 6
    //         console.log("FPS: " + fps_counter / 6);
    //         fps_counter = 0;
    //         last_performance_update = now;
    //         self.trackPrint(["update", "tween", "animate"]);
    //       }
    //     }
    //   }
    // }, 5000);


    // Set up rendering and tweening loop
    
    let ticker = PIXI.Ticker.shared;
    ticker.autoStart = false;
    ticker.stop();

    let fps_counter = 0;
    // let game_loop_start = 0;
    let last_frame = 0;
    let last_performance_update = 0;

    function animate(now) {
      self.trackStart("tween");
      TWEEN.update(now);
      self.trackStop("tween");

      if (now - last_frame >= 1000 / self.fps) {
        fps_counter += 1;
        last_frame = now;

        self.trackStart("update");
        self.update();
        self.trackStop("update");

        self.trackStart("animate");
        ticker.update(now);
        pixi.renderer.render(pixi.stage);
        self.trackStop("animate");

        if (now - last_performance_update > 3000 && log_performance) {
          // There were 3000 milliseconds, so divide fps_counter by 3
          console.log("FPS: " + fps_counter / 3);
          fps_counter = 0;
          last_performance_update = now;
          self.trackPrint(["update", "tween", "animate"]);
        }
      }
      requestAnimationFrame(animate);
    }
    animate(0);

  }

  trackStart(label) {
    if (!(label in this.tracking)) {
      this.tracking[label] = {
        start: 0,
        total: 0
      }
    }
    this.tracking[label].start = Date.now();
  }


  trackStop(label) {
    if (this.tracking[label].start == -1) {
      console.log("ERROR! Tracking for " + label + " stopped without having started.")
    }
    this.tracking[label].total += Date.now() - this.tracking[label].start;
    this.tracking[label].start = -1
  }


  trackPrint(labels) {
    var sum_of_totals = 0;
    for (var label of labels) {
      sum_of_totals += this.tracking[label].total;
    }
    for (var label of labels) {
      var fraction = this.tracking[label].total / sum_of_totals;
      console.log(label + ": " + Math.round(fraction * 100).toFixed(2) + "%");
    }
  }


  intializeAnimations() {
    var self = this;
    if (!PIXI.Loader.shared.resources["Art/fire.json"]) {
      PIXI.Loader.shared.add("Art/fire.json").load(function() {
        self.initializeTitleScreen();

        if (!PIXI.Loader.shared.resources["Art/explosion.json"]) {
          PIXI.Loader.shared.add("Art/explosion.json").load(function() {
          });
        }
      });
    }
  }


  initializeScenes() {
    var self = this;
    this.scenes = [];

    this.scenes["title"] = new PIXI.Container();
    pixi.stage.addChild(this.scenes["title"]);
    this.scenes["game"] = new PIXI.Container();
    this.scenes["game"].position.x = this.width;
    pixi.stage.addChild(this.scenes["game"]);


    this.alertMask = new PIXI.Container();
    pixi.stage.addChild(this.alertMask);
    this.alertBox = new PIXI.Container();
    pixi.stage.addChild(this.alertBox);
  }


  loadWords() {
    var self = this;
    this.legal_words = {};
    let enemy_word_dict = {};
    for (var i = 0; i <= 10; i++) {
      enemy_word_dict[i] = {};
    }

    var request = new XMLHttpRequest();
    request.open("GET", "Dada/legal_words.txt.gz", true);
    request.responseType = "arraybuffer";
    request.onload = function(e) {

      var word_list = new TextDecoder("utf-8").decode(
        new Zlib.Gunzip(
          new Uint8Array(this.response)
        ).decompress()
      );
      word_list = word_list.split(/\n/);
      for (var i = 0; i < word_list.length; i++) {
        var thing = word_list[i].split(",");
        var word = thing[0];
        var common = thing[1];
        if (word != null && word.length >= 3) {
          self.legal_words[word.toUpperCase()] = 1;
        }
        if (word != null && word.length <= 10) {
          enemy_word_dict[word.length][word.toUpperCase()] = 1;
        }
      }

      self.enemy_words = {};
      for (var i = 0; i <= 10; i++) {
        self.enemy_words[i] = Object.keys(enemy_word_dict[i]);
      }

    };
    request.send();
  }


  singlePlayerGame() {
    this.player = 1;

    var self = this;

    self.initializeSinglePlayerScene();
    self.animateSceneSwitch("title", "game");
  }


  resetTitle() {
    this.player = 0;
    this.state  = {};
    this.choosers = {};
    this.choices = {
      "GAME_TYPE": -1,
      "DIFFICULTY": -1,
    };
    this.choice_strings = {};
    this.game_code = "";
    this.start_time = Date.now();
    this.game_code_letter_choice = 0;
    this.multiplayer.stopWatch();
  }


  clearScene(scene) {
    console.log("here i am cleaning");
    while(scene.children[0]) {
      let x = scene.removeChild(scene.children[0]);
      x.destroy();
    }
  }


  // render() {
  //   pixi.renderer.render(pixi.stage);
  // }


  update() {
    if (this.current_scene == "game") {
      this.singlePlayerUpdate();
    }
  }


  soundEffect(effect_name, volume = 0.6) {
    if (!silence) {
      var sound_effect = document.getElementById(effect_name);
      sound_effect.volume = volume;
      sound_effect.play();
    }
  }


  setMusic(music_name) {
    if (!silence) {
      var self = this;
      this.music = document.getElementById(music_name);
      this.music.loop = true;
      this.music.volume = 0.6;
      this.music.play();
    }
  }


  stopMusic() {
    if (this.music != null) {
      this.music.pause();
      this.music.currentTime = 0;
    }
  }


  fadeMusic(delay) {
    if (this.music != null) {
      var self = this;
      for (let i = 0; i < 14; i++) {
        setTimeout(function() {self.music.volume = (13 - i) / 20;}, delay + 50 * i);
      }
    }
  }
}
