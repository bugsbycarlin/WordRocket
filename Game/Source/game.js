'use strict';

var use_music = false;
var use_sound = true;
var use_scores = false;
var log_performance = true;

var first_screen = "1p_base_capture";
// var first_screen = "intro";
// var first_screen = "title";
// var first_screen = "cutscene";

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

    this.basicInit();

    this.loadWords();

    this.auth_user = null;
    this.network = new Network(this);

    document.addEventListener("keydown", function(ev) {self.handleKeyDown(ev)}, false);
    document.addEventListener("mousemove", function(ev) {self.handleMouseMove(ev)}, false);
    document.addEventListener("mousedown", function(ev) {self.handleMouseDown(ev)}, false);

    this.keyboard_mode = "QWERTY";

    this.paused = false;
    this.pause_time = 0;

    this.freefalling = [];
    this.shakers = [];

    this.gravity = 3.8;
    this.boost = 0.18;
    this.gentle_drop = 0.05;
    this.gentle_limit = 6;
    this.boost_limit = -25;

    this.difficulty_level = localStorage.getItem("word_rockets_difficulty_level");
    if (this.difficulty_level == null) {
      this.difficulty_level = "EASY";
      this.difficulty_choice = 0;
    } else {
      this.difficulty_choice = Math.max(0, ["EASY", "MEDIUM", "HARD", "BEACON"].indexOf(this.difficulty_level));
    }

    this.loadLocalHighScores();

    this.initializeScreens();
    this.initializeAlertBox();
    this.initializeAnimations();

    // this.current_screen = "cutscene";

    // This is how you add an event listener for multiplayer sudden quits
    // window.addEventListener("unload", function(ev) {
    //   if (self.game_code != "" && self.player > 0) {
    //     self.network.leaveGame(self.game_code, self.player)
    //     self.resetTitle();
    //   }
    // })
  }


  basicInit() {
    var self = this;

    this.width = 1280;
    this.height = 960;

    // Create the pixi application
    pixi = new PIXI.Application(this.width, this.height, {antialias: true});
    document.getElementById("mainDiv").appendChild(pixi.view);
    pixi.renderer.backgroundColor = 0xFFFFFF;
    pixi.renderer.resize(this.width,this.height);
    pixi.renderer.backgroundColor = 0x000000;
    console.log("Renderer: " + PIXI.RENDERER_TYPE[pixi.renderer.type]);


    // Set up rendering and tweening loop
    let ticker = PIXI.Ticker.shared;
    ticker.autoStart = false;
    ticker.stop();

    let fps_counter = 0;
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
          //There were 3000 milliseconds, so divide fps_counter by 3
          //console.log("FPS: " + fps_counter / 3);
          //self.trackPrint(["update", "tween", "animate"]);
          fps_counter = 0;
          last_performance_update = now;
        }
      }

      requestAnimationFrame(animate);
    }
    animate(0);
  }


  //
  // Tracking functions, useful for testing the timing of things.
  //
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


  initializeAnimations() {
    var self = this;
    if (!PIXI.Loader.shared.resources["Art/intro.png"]) {
      PIXI.Loader.shared.add("Art/intro.png").load(function() {
        if (!PIXI.Loader.shared.resources["Art/fire.json"]) {
          PIXI.Loader.shared.add("Art/fire.json").load(function() {
            if (!PIXI.Loader.shared.resources["Art/explosion.json"]) {
              PIXI.Loader.shared.add("Art/explosion.json").load(function() {
                if (!PIXI.Loader.shared.resources["Art/electric.json"]) {
                  PIXI.Loader.shared.add("Art/electric.json").load(function() {
                    if (!PIXI.Loader.shared.resources["Art/smoke.json"]) {
                      PIXI.Loader.shared.add("Art/smoke.json").load(function() {

                        if (first_screen == "intro") {
                          self.initializeIntro();
                        } else if (first_screen == "title") {
                          self.initializeTitle();
                        } else if (first_screen == "1p_base_capture") {
                          self.resetGame();
                          // self.score = 999455;
                          self.initialize1pBaseCapture();
                        } else if (first_screen == "cutscene") {
                          self.initializeCutscene("old_man");
                        }
                      });
                    }
                  });
                }
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
    this.long_spelling_prediction = {};

    this.starting_dictionaries = [];
    this.ending_dictionaries = [];
    this.short_starting_dictionaries = [];
    this.short_ending_dictionaries = [];
    this.bridge_word_dictionaries = [];
    for (let i = 0; i < letter_array.length; i++) {
      this.starting_dictionaries[letter_array[i]] = [];
      this.ending_dictionaries[letter_array[i]] = [];
      this.short_starting_dictionaries[letter_array[i]] = [];
      this.short_ending_dictionaries[letter_array[i]] = [];
      for (let j = 0; j < letter_array.length; j++)
      this.bridge_word_dictionaries[letter_array[i]+letter_array[j]] = [];
    }

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
        if (word != null && word.length >= 2) {

          self.addPredictiveSpelling(word.toUpperCase());

          self.legal_words[word.toUpperCase()] = 1;
          
          if (parts_of_speech.includes("v")) {
            self.special_dictionaries["verbs"][word.toUpperCase()] = 1;
          }

          let first = word.toUpperCase()[0];
          let last = word.toUpperCase()[word.length - 1];
          if (word.length >= 2 && word.length <= 9) self.starting_dictionaries[first].push(word.toUpperCase());
          if (word.length >= 2 && word.length <= 9) self.ending_dictionaries[last].push(word.toUpperCase());
          if (word.length >= 2 && word.length < 4) self.short_starting_dictionaries[first].push(word.toUpperCase());
          if (word.length >= 2 && word.length < 4) self.short_ending_dictionaries[last].push(word.toUpperCase());
          if (word.length >= 3 && word.length <= 6) self.bridge_word_dictionaries[first+last].push(word.toUpperCase());    
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
      if (!(slice in this.long_spelling_prediction) || word.length > this.long_spelling_prediction[slice].length && word.length <= 12) {
        this.long_spelling_prediction[slice] = word;
      } 
    }
  }


  resetGame() {
    this.level = 1;
    this.score = 0;

    this.player_bombs = 0;
    this.enemy_bombs = 0;

    console.log(this.difficulty_level);
  }


  update(diff) {
    if (this.current_screen == "1p_game") {
      this.singlePlayerGameUpdate(diff);
    } else if (this.current_screen == "1p_base_capture") {
      this.singlePlayerBaseCaptureUpdate(diff);
    } else if(this.current_screen == "1p_lobby") {
      this.singlePlayerLobbyUpdate(diff);
    } else if (this.current_screen == "cutscene") {
      this.cutsceneUpdate(diff);
    } else if (this.current_screen == "intro") {
      this.introUpdate(diff);
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
    this.network.getGlobalHighScores(function(value) {
      self.cloud_high_scores["global"] = value
      self.network.getIndividualHighScores(function(value) {
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
        self.network.saveIndividualHighScores(self.high_scores["individual"], function() {});

        callback();

        console.log("done blending local and cloud high scores");
      })
    });
  }

 
  addHighScore(name, score, callback, error_callback = null) {
    var self = this;
    console.log(name);
    console.log(score);
    console.log(error_callback);
    let diff = this.difficulty_level.toLowerCase();
    addDedupeSort(this.high_scores["individual"][diff], [{name: name, score: score}]);
    localStorage.setItem("word_rockets_high_scores", JSON.stringify(this.high_scores));

    let low_high = this.high_scores["global"][diff][9];
    console.log(low_high);
    console.log(this.high_scores["global"][diff]);
    console.log(this.high_scores["global"][diff][9]);
    if (low_high == null || low_high.score < score) {
      addDedupeSort(this.high_scores["global"][diff], [{name: name, score: score, uid: this.network.uid}]);
      console.log("hoss");
      console.log(this.high_scores);
      this.network.saveGlobalHighScores(this.high_scores["global"], function() {
        self.network.saveIndividualHighScores(self.high_scores["individual"], function() {
          callback();
        }, function() {
          console.log(error_callback);
          if (error_callback != null) {
            console.log("here too");
            error_callback();
          }
        });
      }, function() {
        console.log(error_callback);
        if (error_callback != null) {
          console.log("here too");
          error_callback();
        }
      });
    } else {
      this.network.saveIndividualHighScores(this.high_scores["individual"], function() {
        callback();
      }, function() {
        console.log(error_callback);
        if (error_callback != null) {
          console.log("here too");
          error_callback();
        }
      });
    }
  }
}
