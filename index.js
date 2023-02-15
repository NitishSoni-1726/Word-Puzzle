const loading = document.querySelector(".loading");
const letters = document.querySelectorAll(".letters");
const puzzleNumberContent = document.querySelector(".puzzle-no");
const puzzleNumber = document.querySelector(".number");
const lost = document.querySelector(".you-loose");
const won = document.querySelector(".you-won");
const puzzleWord = document.querySelector(".correct-word");
const wonButton = document.querySelector("#won-play-again");
const lostButton = document.querySelector("#lost-play-button");
const game = document.querySelector(".game");
const validWordContent = document.querySelector(".valid-word");
const WORD_LENGTH = 5;

wonButton.addEventListener("click", refresh);
lostButton.addEventListener("click", refresh);

//when you hit play again button
function refresh() {
  lost.classList.add("display-none");
  won.classList.add("display-none");
  location.reload();
}

// to check the number of times the letters are repeated
function repetedLetters(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letters = array[i];
    if (obj[letters]) {
      obj[letters]++;
    } else {
      obj[letters] = 1;
    }
  }
  return obj;
}

//initialise function to fetch the word first
async function init() {
  const word = await fetch(
    "https://words.dev-apis.com/word-of-the-day?random=1"
  );
  const processingResponse = await word.json();
  const fetchedWord = processingResponse.word.toUpperCase();
  const fetchedWordParts = fetchedWord.split("");
  puzzleNumber.innerText = processingResponse.puzzleNumber;
  console.log(processingResponse);
  loading.classList.add("display-none");
  puzzleNumberContent.classList.add("display-block");
  puzzleWord.innerText = processingResponse.word.toUpperCase();

  document.addEventListener("keydown", keyPress);

  // what action to take on key press
  function keyPress(event) {
    let action = event.key;
    if (action === "Enter") {
      submit();
    } else if (action === "Backspace") {
      clear();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    }
  }
  // action if key press is an letter
  function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
  }
  let currentGuess = "";
  let currentRow = 0;
  let rounds = 6;
  // function to add typed letter to the div
  function addLetter(letter) {
    if (currentGuess.length < WORD_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    letters[WORD_LENGTH * currentRow + currentGuess.length - 1].innerText =
      letter;
  }

  //function when we click enter after guessing word
  async function submit() {
    validWordContent.classList.remove("display-block");
    if (currentGuess.length !== WORD_LENGTH) {
      return;
    }
    loading.classList.remove("display-none");
    // to check if enterted word is a valid word or not
    const validateWord = await fetch(
      "https://words.dev-apis.com/validate-word",
      {
        method: "POST",
        body: JSON.stringify({ word: currentGuess }),
      }
    );
    loading.classList.add("display-none");

    const validateWordObject = await validateWord.json();
    const validWord = validateWordObject.validWord;

    if (!validWord) {
      markInvalidWord();
      return;
    }
    // if all letters are in the right place you win
    if (currentGuess === fetchedWord) {
      game.classList.add("display-none");
      won.classList.add("display-block");
    }
    //if letters are in correct place then it turns green
    const guessPart = currentGuess.split("");
    const map = repetedLetters(fetchedWordParts);
    for (let i = 0; i < guessPart.length; i++) {
      if (guessPart[i] === fetchedWordParts[i]) {
        letters[currentRow * WORD_LENGTH + i].classList.add("correct");
        map[guessPart[i]]--;
      }
    }

    // if letter is present in the word but in different place it turns orange else if letters aren't present the opacity turns to 80%
    for (let i = 0; i < guessPart.length; i++) {
      if (guessPart[i] === fetchedWordParts[i]) {
      } else if (
        fetchedWordParts.includes(guessPart[i]) &&
        map[guessPart[i]] > 0
      ) {
        letters[currentRow * WORD_LENGTH + i].classList.add("letter-present");
      } else {
        letters[currentRow * WORD_LENGTH + i].classList.add(
          "letter-not-present"
        );
      }
    }
    // to shift to the next row or the next guess
    currentRow++;
    currentGuess = "";
    // if a certain no of guess are over you loose
    if (currentRow === rounds) {
      game.classList.add("display-none");
      lost.classList.add("display-block");
    }

    // if a word is not valid it displays invalidword
    function markInvalidWord() {
      validWordContent.classList.add("display-block");
    }
  }

  // function to clear the last entered letter using backspace
  function clear() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[WORD_LENGTH * currentRow + currentGuess.length].innerText = "";
  }
}

init();
