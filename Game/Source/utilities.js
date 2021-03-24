
// My colors
// Blue: 0x3cb0f3
// Yellow: 0xf3db3c
// Red: 0xdb5858
// Green: 0x71d07d

const board_width = 12;

const letter_values = {
  "A": 1, "B": 2, "C": 1, "D": 1, "E": 1, "F": 2, "G": 1,
  "H": 2, "I": 1, "J": 3, "K": 2, "L": 1, "M": 1, "N": 1,
  "O": 1, "P": 1, "Q": 4, "R": 1, "S": 1, "T": 1, "U": 2,
  "V": 3, "W": 2, "X": 3, "Y": 2, "Z": 4,
}


var character_names = [
  "ALFIE", "BERT", "CALLIE", "DENZEL", "EMMA", "FATIMA",
  "GRETA", "HAKEEM", "INEZ", "JIN", "KRISHNA", "LIAN",
  "MARCUS", "NAOMI", "OMAR", "PABLO", "QUARREN", "RIYA",
  "SOPHIE", "TANIEL", "UBA", "VIJAY", "WINTER", "XAVIER",
  "YAIR", "ZHANG",
];

const letter_array = Object.keys(letter_values);
const lower_array = [];
for (i in letter_array) {
  lower_array.push(letter_array[i].toLowerCase());
}
const shuffle_letters = [];
for (i in letter_array) {
  shuffle_letters.push(letter_array[i]);
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}


function detectMobileBrowser() {
  const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
  ];

  return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
  });
}


// randomCode() {
//   var characters = "abcdefghijklmnopqrstuvwxyz";
//   var word = "";
//   for (var i = 0; i < 4; i++) {
//     word += characters.charAt(Math.floor(Math.random() * characters.length));

//   }
//   return word;
// }