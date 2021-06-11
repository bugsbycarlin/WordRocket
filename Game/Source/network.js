
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

class Network {
  constructor(game) {
    this.database = firebase.database();
    this.game = game;
  }


  googleSignIn() {
    var self = this;
    var provider = new firebase.auth.GoogleAuthProvider();
    console.log(provider);
    firebase.auth()
      .signInWithPopup(provider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */

        var credential = result.credential;
        var token = credential.accessToken;
        var user = result.user;

        self.game.auth_user = user;
        self.uid = user.uid;

        self.game.sign_in_button.text = "SIGN-OUT";
      }).catch((error) => {
        console.log("Error with google sign in!")
        console.log(error);
      });
  }


  anonymousSignIn(callback) {
    console.log("Using anonymous sign in");
    var self = this;
    firebase.auth().signInAnonymously()
      .then(() => {
        callback();
      })
      .catch((error) => {
        console.log("Error with anonymous sign in!")
        console.log(error);
      });

  }


  signOut() {
    var self = this;
    firebase.auth().signOut().then(() => {
      self.game.sign_in_button.text = "SIGN-IN";
      self.game.auth_user = null;
      self.uid = null;
    }).catch((error) => {
      console.log("Error signing out!");
      console.log(error);
    });
  }


  getGlobalHighScores(yes_callback) {
    var self = this;
    this.database.ref("/high_scores/global").once("value").then((result) => {
      if (result.exists()) {
        console.log(result.val());
        yes_callback(result.val());
      } else {
        console.log("Could not look up global high scores");
      }
    }).catch((error) => {
      console.log("Error looking up global high scores.");
      console.log(error);
    });;
  }


  getIndividualHighScores(yes_callback) {
    var self = this;
    if (this.uid == null) {
      console.log("Skipping getting individual high scores because not signed in");
      let x = {}
      yes_callback(x);
      return;
    }
    this.database.ref("/high_scores/individual/" + this.uid).once("value").then((result) => {
      if (result.exists()) {
        console.log(result.val());
        yes_callback(result.val());
      } else {
        console.log("Could not look up individual high scores");
      }
    }).catch((error) => {
      console.log("Error looking up individual high scores.");
      console.log(error);
    });;
  }


  saveIndividualHighScores(scores, callback, error_callback = null) {
    var self = this;
    if (this.uid == null) {
      console.log("Skipping saving individual high scores because not signed in");
      return;
    }
    
    var connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", (test) => {
      if (test.val() === true) {
        this.database.ref("high_scores/individual/" + this.uid).update(scores, (error) => {
          if (error) {
            console.log("Failed to save individual high scores to the cloud.");
            console.log(error);
            if (error_callback != null) {
              error_callback();
            }
          } else {
            console.log("Saved individual high scores to the cloud.");
            callback();
          }
        });
      } else {
        console.log("Not connected to the internet!");
        if (error_callback != null) {
          console.log("here");
          error_callback();
        }
      }
    });
  }


  saveGlobalHighScores(scores, callback, error_callback = null) {
    var self = this;

    //let can_save = true;
    // ["story", "mixed", "wr", "bc", "lc"].forEach((mode) => {
    //   ["easy", "medium", "hard", "beacon"].forEach((difficulty) => {
    //     for (var i = 0; i < 50; i++) {
    //       if (scores[mode][difficulty][i] == null || scores[mode][difficulty][i].score < 5000 - 100 * i) {
    //         console.log("High scores does not have element " + i);
    //         can_save = false;
    //       }
    //     }
    //   });
    // });
    
    // if(!can_save) {
    //   return;
    // }
    // var connectedRef = firebase.database().ref(".info/connected");
    // connectedRef.on("value", (healthCheck) => {
    //   if (healthCheck.val() === true) {
        this.database.ref("high_scores/global").update(scores, (error) => {
          if (error) {
            console.log("Failed to save global high scores to the cloud.");
            console.log(error);
            if (error_callback != null) {
              error_callback();
            }
          } else {
            console.log("Saved global high scores to the cloud.");
            callback();
          }
        });
    //   } else {
    //     console.log(healthCheck);
    //     console.log("Not connected to the internet!");
    //     if (error_callback != null) {
    //       console.log("here");
    //       error_callback();
    //     }
    //   }
    // });
    
  }

  // I used this to seed the global high scores.
  // testCall() {
  //   var self = this;

  //   if (this.uid == null) {
  //     console.log("can't make call if not signed in");
  //     return;
  //   }

  //   ["easy", "medium", "hard", "beacon"].forEach((difficulty) => {
  //     let high_scores = {}
  //     for (var i = 0; i < 50; i++) {
  //       let name = ""
  //       for(var j = 0; j < 8; j++) {
  //         let t = namez[Math.floor(Math.random() * namez.length)].split(" ")[0];
  //         if(t.length <= 6) name = t.toUpperCase();
  //       }
  //       high_scores[i] = {
  //         name: name,
  //         score: 5500 - 100 * i - Math.floor(Math.random() * 30),
  //         uid: self.generateGameCode() + self.generateGameCode() + self.generateGameCode() + self.generateGameCode(),
  //       }
  //     }
  //     this.database.ref("high_scores/global/" + difficulty).update(high_scores);
  //   });
  // }


  generateGameCode() {
    
    var name = "";
    for (var i = 0; i < 5; i++) {
      name += alphabet.charAt(Math.floor(Math.random() * alphabet.length));

    }
    return name;
  }


  createNewGame(game_type, tries_left, callback) {
    var self = this;
    var game_code = this.generateGameCode();
  }


  joinGame(game_code, yes_callback, no_callback) {
    var self = this;
  }


  quickPlayGame(tries_left, yes_callback, no_callback) {
    var self = this;
  }


  setWatch() {
    this.ref_state_change = this.database.ref("games/" + game.game_code);
    // this.watch = this.ref_state_change.on("value", (snapshot) => {game.updateFromMulti(snapshot)});
  }


  stopWatch() {
    if (this.watch) {
      this.ref_state_change.off("value", this.watch);
      this.watch = null;
    }
  }


  finishGame(code, player, winner) {
    var sheet = {}

    // if (this.game.state.game_type != "code_coop") {
    //   if (player == 1 && player == winner) {
    //     sheet["player_1_state"] = "win";
    //     sheet["player_2_state"] = "ended";
    //     sheet["volley_state"] = "ended";
    //   } else if (player == 2 && player == winner) {
    //     sheet["player_2_state"] = "win";
    //     sheet["player_1_state"] = "ended";
    //     sheet["volley_state"] = "ended";
    //   }
    //   // } else if (player == 1) {
    //   //   sheet["player_1_state"] = "ended";
    //   // } else if (player == 2) {
    //   //   sheet["player_2_state"] = "ended";
    //   // }
    //   if (this.game.state.game_type == "quick_open") {
    //     sheet["game_type"] = "quick_closed";
    //   }
    // } else {
    //   sheet["player_2_state"] = "ended";
    //   sheet["player_1_state"] = "ended";
    //   sheet["volley_state"] = "changeywee";
    // }

    this.database.ref("games/" + code).update(sheet);
  }


  leaveGame(code, player) {
    var sheet = {}
    // if (player == 1) {
    //   console.log("Player 1 leaving the game");
    //   sheet["player_1_state"] = "quit";
    // } else if (player == 2) {
    //   console.log("Player 2 leaving the game");
    //   sheet["player_2_state"] = "quit";
    // }
    // if (this.game.state.game_type == "quick_open") {
    //   sheet["game_type"] = "quick_closed";
    // }
    this.database.ref("games/" + code).update(sheet);
  }


  update(sheet) {
    this.database.ref("games/" + this.game.game_code).update(sheet);
  }
}

