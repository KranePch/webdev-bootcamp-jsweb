// Start Scene
const startGameScene = document.getElementById("start-game");
const startButton = document.getElementById("start-button");

// Game Play Scene
const playGameScene = document.getElementById("play-game");
const questionDisplay = document.getElementById("question");
const answerButtonList = document.getElementById("answer-button")
const counter = document.getElementById("counter");
const restartGameButton = document.getElementById("restartgame-button");

// End Scene
const endGameScene = document.getElementById("end-game");
const endMessageDisplay = document.getElementById("end-message");
const restartEndGameButton = document.getElementById("restart-button");
const spriteImage = document.getElementById('sprite');

// Global Variables
const LIMIT_FETCH = 386;
let answerName = '';
let urlSprite = '';
let state = '';
let answerList = [];
let counterNumber = 10;

// Function
const endGamePlay = (displayedText) => {
  endMessageDisplay.innerText = displayedText;
  spriteImage.src = urlSprite;

  playGameScene.classList.add("hidden");
  playGameScene.classList.remove("play-center");
  endGameScene.classList.remove("hidden");

  localStorage.clear();
  state = '';
  answerList = [];
  counterNumber = 10;
}

const generateAnswerList = () => {
  for (let i = 0; i < 26; i++) {
    let letter = String.fromCharCode('A'.charCodeAt(0) + i);
    let button = document.createElement('button');

    button.innerText = letter

    if (answerList.includes(letter.toLocaleLowerCase())) {
      button.disabled = true;
    }

    button.addEventListener('click', (event) => {
      let currentLetter = event.target.innerText.toLowerCase();
      // console.log(currentLetter);
      let currentQuestion = questionDisplay.innerText.split('');

      for (let i = 0; i < answerName.length; i++) {
        if (currentLetter === answerName[i]) {
          // console.log('found at: ', i);
          currentQuestion[i] = currentLetter;
        }
      }

      currentAnswerQuestion = currentQuestion.join('');
      localStorage.setItem('question', currentAnswerQuestion);

      questionDisplay.innerText = currentQuestion.join('');

      event.target.disabled = true;

      let counterNumber = counter.innerText - 1; 
      counter.innerText = counterNumber;

      answerList.push(currentLetter);

      localStorage.setItem('counter', counterNumber);
      localStorage.setItem('answerList', JSON.stringify(answerList));

      if (currentAnswerQuestion === answerName) {
        endGamePlay('You win!');
      }
      else if (counterNumber == 0) {
        endGamePlay('Game Over. It is ' + answerName);
      }
    })
    answerButtonList.appendChild(button);

  }
}

const startGamePlay = async () => {
  try {
    if (state === 'playing') {

      answerName = localStorage.getItem('answerName');
      urlSprite = localStorage.getItem('sprite');
      let selectedAnswer = localStorage.getItem('question');

      questionDisplay.innerText = selectedAnswer;
      answerButtonList.innerHTML = ''; 

      counterNumber = localStorage.getItem('counter');
      counter.innerText = counterNumber;

      let answerListText = localStorage.getItem('answerList');

      if (answerListText) {
        answerList = JSON.parse(answerListText);
      }

      generateAnswerList();
      return false;
    }
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${LIMIT_FETCH}&offset=0`);

    if (!response.ok) {
      throw new Error('Cannot fetch data');
    }

    const responseJson = await response.json();
    const randomIndex = Math.floor(Math.random() * responseJson.results.length);
    let selectedName = responseJson.results[randomIndex].name

    answerName = selectedName;
    state = 'playing';

    selectedName = selectedName.replace(/./g, '_');

    questionDisplay.innerText = selectedName;

    console.log(answerName);
    counter.innerText = counterNumber;
    answerButtonList.innerHTML = '';

    // most latency time
    urlSprite = await getUrlSprite(responseJson.results[randomIndex].url);
    console.log(urlSprite);

    // save state
    localStorage.setItem('answerName', answerName);
    localStorage.setItem('sprite', urlSprite);
    localStorage.setItem('state', state);
    localStorage.setItem('question', selectedName);
    localStorage.setItem('counter', counter.innerText);

    generateAnswerList();
  }
  catch (e) {
    console.log('error: ', e);
  }
}

const getUrlSprite = async (pokemonUrl) => {
  try {
    const response = await fetch(pokemonUrl);
    const pokemonUrlResponseJson = await response.json()

    let pokemonFormsUrl = pokemonUrlResponseJson.forms[0].url;
    const responseForms = await fetch(pokemonFormsUrl);
    const formsUrlResponseJson = await responseForms.json();

    return formsUrlResponseJson.sprites.front_default;
  }
  catch (e) {
    console.log(e);
  }
}

// Button Click Handler
startButton.addEventListener("click", function () {
  startGameScene.classList.add("hidden");

  playGameScene.classList.remove("hidden");
  playGameScene.classList.add("play-center");
  startGamePlay();
});

restartGameButton.addEventListener("click", function () {
  playGameScene.classList.add("hidden");
  playGameScene.classList.remove("play-center");

  startGameScene.classList.remove("hidden");
  localStorage.clear();
  state = '';
  answerList = [];
})

restartEndGameButton.addEventListener("click", function () {
  endGameScene.classList.add("hidden");

  playGameScene.classList.remove("hidden");
  playGameScene.classList.add("play-center");
  startGamePlay();
})

window.onload = () => {
  state = localStorage.getItem('state');
  if (state === 'playing') {
    startButton.click();
  }
}
