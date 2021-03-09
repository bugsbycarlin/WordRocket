
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

class Multiplayer {
  constructor(game) {
    this.database = firebase.database();
    this.game = game;
  }


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

        self.game.sign_in_button.disable();
        self.game.sign_in_button.visible = false;
        self.game.sign_out_button.enable();
        self.game.sign_out_button.visible = true;
        // ...
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
      self.game.sign_out_button.disable();
      self.game.sign_out_button.visible = false;
      self.game.sign_in_button.enable();
      self.game.sign_in_button.visible = true;
      self.game.auth_user = null;
    }).catch((error) => {
      console.log("Error signing out!");
      console.log(error);
    });
  }
}

