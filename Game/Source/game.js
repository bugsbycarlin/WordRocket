'use strict';

// var annoying = true;
// var silence = true;
var use_music = false;
var use_sound = true;
var use_scores = false;
var log_performance = true;

var performance_result = null;

var pixi = null;
var game = null;

function initialize() {
  game = new Game();
}

WebFont.load({
  google: {
    families: ['Bebas Neue', 'Press Start 2P', 'Bangers']
  }
});


var firebaseConfig = {
  apiKey: "AIzaSyCMdtQRBtOTeljFIiQs6ehicZXG8i-pk84",
  authDomain: "word-rockets.firebaseapp.com",
  databaseURL: "https://word-rockets-default-rtdb.firebaseio.com",
  projectId: "word-rockets",
  storageBucket: "word-rockets.appspot.com",
  messagingSenderId: "648323787326",
  appId: "1:648323787326:web:730fc5295f830f1fab7f6f",
  measurementId: "G-K6HHV5T2WN"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    console.log("I AM USARIO");
    console.log(user);
  } else {
    // No user is signed in.
    console.log("i am nobs");
  }
});


class Game {
  constructor() {

    var self = this;

    this.tracking = {};

    this.setDeviceAndFormat();

    document.addEventListener("keydown", function(ev) {self.handleKeyDown(ev)}, false);
    this.loadWords();

    this.auth_user = null;
    this.multiplayer = new Multiplayer(this);

    this.keyboard_mode = "QWERTY";

    this.paused = false;
    this.pause_time = 0;

    this.difficulty_level = localStorage.getItem("word_rockets_difficulty_level");
    if (this.difficulty_level == null) {
      this.difficulty_level = "EASY";
      this.difficulty_choice = 0;
    } else {
      this.difficulty_choice = Math.max(0, ["EASY", "MEDIUM", "HARD", "BEACON"].indexOf(this.difficulty_level));
    }

    this.loadLocalHighScores();
    this.lhs = [];
    this.ghs = [];

    //this.resetTitle();

    this.initializeScenes();
    this.initializeAlertBox();
    this.intializeAnimations();

    this.current_scene = "title";

    // window.addEventListener("unload", function(ev) {
    //   if (self.game_code != "" && self.player > 0) {
    //     self.multiplayer.leaveGame(self.game_code, self.player)
    //     self.resetTitle();
    //   }
    // })
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
      // this.keyboard_sounds = true;
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
        // this.keyboard_sounds = true;
      } else if (navigator.userAgent.indexOf("iPad") > 0) {
        this.width = 768;
        this.height = 1024;
        this.device_type = "iPad";
        // this.keyboard_sounds = true;
      } else {
        // this.width = 768;
        // this.height = 1024;
        // this.device_type = "iPad";
        this.width = 640;
        this.height = 1136;
        this.device_type = "iPhone";
        // this.keyboard_sounds = true;
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

    // Set up rendering and tweening loop
    
    let ticker = PIXI.Ticker.shared;
    ticker.autoStart = false;
    ticker.stop();

    let fps_counter = 0;
    // let game_loop_start = 0;
    let last_frame = 0;
    let last_performance_update = 0;

    function animate(now) {
      
      fps_counter += 1;
      let diff = now - last_frame;
      last_frame = now

      if (!self.paused == true) {
        self.trackStart("tween");
        TWEEN.update(now);
        self.trackStop("tween");

        self.trackStart("update");
        self.update(diff);
        self.trackStop("update");

        self.trackStart("animate");
        ticker.update(now);
        pixi.renderer.render(pixi.stage);
        self.trackStop("animate");

        if (now - last_performance_update > 3000 && log_performance) {
          // There were 3000 milliseconds, so divide fps_counter by 3
          // console.log("FPS: " + fps_counter / 3);
          // self.trackPrint(["update", "tween", "animate"]);
          fps_counter = 0;
          last_performance_update = now;
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
            if (!PIXI.Loader.shared.resources["Art/electric.json"]) {
              PIXI.Loader.shared.add("Art/electric.json").load(function() {
              });
            }
          });
        }  
      });
    }
  }


  loadWords() {
    var self = this;
    let request;

    this.special_dictionaries = {
      "animals": {},
      "plants": {},
      "foods": {},
      "colors": {},
      "numbers_and_shapes": {},
    };

    for (const [special_key, special_dict] of Object.entries(this.special_dictionaries)) {
      request = new XMLHttpRequest();
      console.log(special_key);
      request.open("GET", "Dada/" + special_key + "_words.txt.gz", true);
      request.responseType = "arraybuffer";
      request.onload = function(e) {
        let word_list = new TextDecoder("utf-8").decode(
          new Zlib.Gunzip(
            new Uint8Array(this.response)
          ).decompress()
        );
        word_list = word_list.split(/\n/);

        for (let i = 0; i < word_list.length; i++) {
          let word = word_list[i];

          if (word != null && word.length >= 3) {
            special_dict[word.toUpperCase()] = 1;
          }
        }
      }
      request.send();
    }

    this.special_dictionaries["verbs"] = {};

    this.special_levels = Object.keys(this.special_dictionaries);
    shuffleArray(this.special_levels);

    this.legal_words = {};
    let enemy_word_dict = {};
    for (let i = 0; i <= board_width; i++) {
      enemy_word_dict[i] = {};
    }

    this.spelling_prediction = {};

    request = new XMLHttpRequest();
    request.open("GET", "Dada/legal_words.txt.gz", true);
    request.responseType = "arraybuffer";
    request.onload = function(e) {

      let word_list = new TextDecoder("utf-8").decode(
        new Zlib.Gunzip(
          new Uint8Array(this.response)
        ).decompress()
      );
      word_list = word_list.split(/\n/);
      for (let i = 0; i < word_list.length; i++) {
        let thing = word_list[i].split(",");
        let word = thing[0];
        let common = thing[1];
        let parts_of_speech = thing[2];
        if (word != null && word.length >= 3) {
          self.addPredictiveSpelling(word.toUpperCase());
          self.legal_words[word.toUpperCase()] = 1;
          if (parts_of_speech.includes("v")) {
            self.special_dictionaries["verbs"][word.toUpperCase()] = 1;
          }
        }
        if (word != null && word.length <= board_width) {
          enemy_word_dict[word.length][word.toUpperCase()] = 1;
        }
      }

      self.enemy_words = {};
      for (let i = 0; i <= board_width; i++) {
        self.enemy_words[i] = Object.keys(enemy_word_dict[i]);
      }

    };
    request.send();
  }


  addPredictiveSpelling(word) {
    for (var i = 0; i < word.length; i++) {
      let slice = word.slice(0, i+1);
      if (!(slice in this.spelling_prediction) || word.length < this.spelling_prediction[slice].length) {
        this.spelling_prediction[slice] = word;
      }
    }
  }


  update(diff) {
    if (this.current_scene == "game") {
      this.singlePlayerUpdate(diff);
    } else if(this.current_scene == "setup_single") {
      this.setupSingleUpdate(diff);
    } else if (this.current_scene == "cutscene") {
      this.cutsceneUpdate(diff);
    }
  }


  soundEffect(effect_name, volume = 0.6) {
    if (use_sound) {
      var sound_effect = document.getElementById(effect_name);
      sound_effect.volume = volume;
      sound_effect.play();
    }
  }


  setMusic(music_name) {
    if (use_music) {
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

  pause() {
    this.paused = true;
    this.pause_moment = Date.now();
    this.paused_tweens = [];
    let tweens = TWEEN.getAll();
    for (var i = 0; i < tweens.length; i++) {
      var tween = tweens[i];
      tween.pause();
      this.paused_tweens.push(tween);
    }
    if (this.music != null) {
      this.music.pause();
    }
    let countdown_sound = document.getElementById("countdown");
    if (countdown_sound.paused == false) {
      countdown_sound.hold_up = true;
      countdown_sound.pause();
    }
    this.prev_announcement_text = this.announcement.text;
    this.announcement.text = "PAUSED";
    this.escape_to_quit.visible = true;
    pauseAllDelays();

  }

  resume() {
    this.paused = false;
    this.pause_time += Date.now() - this.pause_moment;
    for (var i = 0; i < this.paused_tweens.length; i++) {
      var tween = this.paused_tweens[i];
      tween.resume();
    }
    this.paused_tweens = [];
    if (this.music != null) {
      this.music.play();
    }
    let countdown_sound = document.getElementById("countdown");
    if (countdown_sound.hold_up == true) {
      countdown_sound.hold_up = null;
      countdown_sound.play();
    }
    this.announcement.text = this.prev_announcement_text;
    this.escape_to_quit.visible = false;
    resumeAllDelays();
  }

  markTime() {
    return Date.now() - this.pause_time;
  }

  timeSince(mark) {
    return this.markTime() - mark;
  }


  loadLocalHighScores() {
    var self = this;
    this.high_scores = JSON.parse(localStorage.getItem("word_rockets_high_scores"));
    if (this.high_scores == null) this.high_scores = {};

    ["individual", "global"].forEach((val) => {
      if (self.high_scores[val] == null) self.high_scores[val] = {};
      ["easy", "medium", "hard", "beacon"].forEach((val2) => {
        if (self.high_scores[val][val2] == null) self.high_scores[val][val2] = [];
      });
    })
  }


  blendHighScores(callback) {
    var self = this;
    // load in cloud
    this.cloud_high_scores = {};
    this.multiplayer.getGlobalHighScores(function(value) {
      self.cloud_high_scores["global"] = value
      self.multiplayer.getIndividualHighScores(function(value) {
        self.cloud_high_scores["individual"] = value

        console.log(self.cloud_high_scores["global"]);
        console.log(self.cloud_high_scores["individual"]);

        ["individual", "global"].forEach((val) => {
          if (self.cloud_high_scores[val] == null) self.cloud_high_scores[val] = {};
          ["easy", "medium", "hard", "beacon"].forEach((val2) => {
            if (self.cloud_high_scores[val][val2] == null) self.cloud_high_scores[val][val2] = [];
          });
        })

        // blend scores
        // I think I can skip global blending, just straight overwriting.
        self.high_scores["global"] = self.cloud_high_scores["global"];
        ["easy", "medium", "hard", "beacon"].forEach((val) => {
          addDedupeSort(self.high_scores["individual"][val], self.cloud_high_scores["individual"][val]);
        });

        // save all scores locally, and save individual scores to the cloud
        localStorage.setItem("word_rockets_high_scores", JSON.stringify(this.high_scores));
        self.multiplayer.saveIndividualHighScores(self.high_scores["individual"], function() {});

        callback();

        console.log("done blending local and cloud high scores");
      })
    });
  }

 
  addHighScore(name, score, callback) {
    var self = this;
    console.log(name);
    console.log(score);
    let diff = this.difficulty_level.toLowerCase();
    addDedupeSort(this.high_scores["individual"][diff], [{name: name, score: score}]);
    localStorage.setItem("word_rockets_high_scores", JSON.stringify(this.high_scores));

    let low_high = this.high_scores["global"][diff][9];
    console.log(low_high);
    console.log(this.high_scores["global"][diff]);
    console.log(this.high_scores["global"][diff][9]);
    if (low_high == null || low_high.score < score) {
      addDedupeSort(this.high_scores["global"][diff], [{name: name, score: score, uid: this.multiplayer.uid}]);
      console.log("hoss");
      console.log(this.high_scores);
      this.multiplayer.saveGlobalHighScores(this.high_scores["global"], function() {
        self.multiplayer.saveIndividualHighScores(self.high_scores["individual"], function() {
          callback();
        });
      });
    } else {
      this.multiplayer.saveIndividualHighScores(this.high_scores["individual"], function() {
      callback();
    });
    }
  }
}
