function init() {
  const baseGridW = 16;
  const baseGridH = 16;
  const totalTiles = baseGridH * baseGridW;
  const minesNeeded = 40;
  const msBoard = document.getElementById('minesweeper');
  const mineCount = document.getElementById('minecount');
  const allTiles = document.getElementsByTagName('li');
  const minutesLabel = document.getElementById('minutes');
  const secondsLabel = document.getElementById('seconds');
  const compass = {
    n: -baseGridH,
    ne: -baseGridH + 1,
    e: 1,
    se: baseGridH + 1,
    s: baseGridH,
    sw: baseGridH - 1,
    w: -1,
    nw: -baseGridH - 1
  };
  let mineCountValue;
  let minesPlaced = [];
  let tiles;
  let totalSeconds;
  let time;
  // let counter = 200;

  function pad(val, padLength) {
    const valString = val + '';
    if (padLength - valString.length === 1 )  {
      return '0' + valString;
    } else if ( padLength - valString.length === 2 ) {
      return '00' + valString;
    } else {
      return valString;
    }
  }

  function resetClock() {
    totalSeconds = 0;
    minutesLabel.innerHTML = pad('0', 2);
    secondsLabel.innerHTML = pad('0', 2);
  }

  function setSmiley() {
    const smiley = document.getElementById('smileyFace');
    smiley.setAttribute('src', 'images/smiley.jpg');
  }

  function setFrowney() {
    const frowney = document.getElementById('smileyFace');
    frowney.setAttribute('src', 'images/frowney.jpg');
  }

  function gameReset() {
    msBoard.innerHTML = '';
    makeTiles();
    minesPlaced = [];
    placeMines();
    setSmiley();
    mineCount.innerHTML = pad(minesNeeded, 3);
    clearInterval(time);
    resetClock();
  }

  // Set event listener for new game;
  function restartListener() {
    const newGame = document.getElementById('newGame');
    newGame.addEventListener('click', gameReset);
  }

  function playSound(sound) {
    let audio;
    switch(sound) {
      case 'boomSound':
        audio = new Audio('audio/explosion_sound.mp3');
        break;
      case 'tileSound':
        audio = new Audio('audio/click_sound.mp3');
        break;
      case 'flag':
        audio = new Audio('audio/flag_sound.mp3');
        break;
      case 'tada':
        audio = new Audio('audio/tada.mp3');
        break;
      default:
        break;
    }
    audio.play();
  }

  function setTime() {
    ++totalSeconds;
    secondsLabel.innerHTML = pad(totalSeconds%60, 2);
    minutesLabel.innerHTML = pad(parseInt(totalSeconds/60), 2);
  }

  function timerDisplay() {
    totalSeconds = 0;
    time = setInterval(setTime, 1000);
  }

  // Place mines in random locations on the board and record position in an array
  function placeMines() {
    while (minesPlaced.length < minesNeeded) {
      const mineIndex = Math.floor(Math.random() * totalTiles);
      if (!minesPlaced.includes(mineIndex)) {
        minesPlaced.push(mineIndex);
      }
    }
  }

  function numberColor(minesTouched, tileElement) {
    // console.log(tileClasses);
    switch (minesTouched) {
      case 1:
        tileElement.setAttribute('class', 'midBlue');
        break;
      case 2:
        tileElement.setAttribute('class', 'green');
        break;
      case 3:
        tileElement.setAttribute('class', 'tile red');
        break;
      case 4:
        tileElement.setAttribute('class', 'tile darkBlue');
        break;
      case 5:
        tileElement.setAttribute('class', 'tile darkRed');
        break;
      case 6:
        tileElement.setAttribute('class', 'tile aqua');
        break;
      case 7:
        tileElement.setAttribute('class', 'tile black');
        break;
      case 8:
        tileElement.setAttribute('class', 'tile midGrey');
        break;
      default:
        break;
    }
  }

  function callWinnerModal() {
    const modal = document.getElementById('winnerModal');
    const span = document.getElementsByClassName('close')[0];
    const winningTimeEl = document.getElementById('winningSeconds');
    winningTimeEl.innerHTML = totalSeconds;
    modal.style.display = 'block';
    span.onclick = function() {
      modal.style.display = 'none';
    };
    window.onclick = function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };
  }

  function countCheckedTiles() {
    if ((totalTiles - minesNeeded) === document.querySelectorAll('[data-checked]').length+1) {
      clearInterval(time);
      disableTiles();
      playSound('tada');
      return callWinnerModal();
    }
  }

  // Create an array of the 8 tiles around the original tile clicked
  function getTileArray(centreTile) {
    if (tiles[centreTile].getAttribute('data-checked')) return false;
    // Check for win
    countCheckedTiles();

    // Prevent being checked as the center again
    tiles[centreTile].setAttribute('data-checked', true);
    tiles[centreTile].style.backgroundColor = '#eee';

    // Uncomment the setTimeout() function if you need to visibly show how it works
    // Also uncomment the 'let counter = 200' on line 26
    // setTimeout(function(){
    //   tiles[centreTile].style.backgroundColor = 'orange';
    // }, counter+= 200);

    // Loop through to get the possible indices
    const possibleIndices = Object.keys(compass).map(function(direction) {
      const index = centreTile + compass[direction];
      if (
        index >= 0 &&
        index < totalTiles &&
        ((centreTile % baseGridH) - (index%baseGridH) < baseGridH-1) &&
        ((index%baseGridH) - (centreTile % baseGridH) < baseGridH-1) &&
        // Ignore any which have been checked as center
        !tiles[index].getAttribute('data-checked')
      ) {
        return index;
      }
    }).filter(function(x) {
      return typeof x !== 'undefined';
    });

    const numberOfMinesTouching = possibleIndices.map(function(index) {
      if (minesPlaced.includes(index)) return index;
    }).filter(function(x) {
      return typeof x !== 'undefined';
    }).length;

    if (numberOfMinesTouching > 0) {
      const numberedTile = tiles[centreTile];
      numberedTile.innerHTML = numberOfMinesTouching;
      numberColor(numberOfMinesTouching, numberedTile);
    } else {
      return possibleIndices.forEach(getTileArray);
    }
  }

  function greyMines(indexNum) {
    let tile;
    for (let i = 0; i < minesPlaced.length; i++) {
      if ( minesPlaced[i] !== indexNum ) {
        tile = minesPlaced[i];
        allTiles[tile].setAttribute('class', 'tile greyMine');
      }
    }
  }

  // Removes all event listeners from tiles on win or loss
  function disableTiles() {
    for (let i = 0; i < allTiles.length; i++) {
      allTiles[i].removeEventListener('click', logTile);
      allTiles[i].removeEventListener('contextmenu', setFlag);
    }
  }

  // Access index of tile being clicked
  function logTile(e) {
    e.preventDefault();
    const tile = this;
    if (document.querySelectorAll('[data-checked]').length === 0) {
      timerDisplay();
    }
    if (minesPlaced.includes(tiles.indexOf(tile))) {
      // Stop timer
      clearInterval(time);
      tile.setAttribute('class', 'tile redMine');
      // Call function to set all other mines grey
      greyMines(tiles.indexOf(tile));
      playSound('boomSound');
      setFrowney();
      // Remove click event listener from other tiles
      disableTiles();
    } else {
      let tileValue = tile.getAttribute('data-value');
      tileValue = parseInt(tileValue);
      // console.log('The tile clicked was number: ' + tileValue);
      playSound('tileSound');
      getTileArray(tileValue);
    }
  }

  function reduceFlagCount() {
    mineCountValue = parseInt(mineCount.innerHTML);
    mineCountValue = mineCountValue - 1;
    if (mineCountValue >= 0) {
      mineCount.innerHTML = pad(mineCountValue, 3);
    }
  }

  function increaseFlagCount() {
    mineCountValue = parseInt(mineCount.innerHTML);
    mineCountValue = mineCountValue + 1;
    if (mineCountValue >= 0) {
      mineCount.innerHTML = pad(mineCountValue, 3);
    }
  }

  // Set the flag icon on right-click
  function setFlag(e) {
    e.preventDefault();
    if (mineCountValue === 0) return false;
    if (this.getAttribute('class') === 'tile flag'){
      // console.log('yes');
      this.setAttribute('class', 'tile');
      if (parseInt(mineCount.innerHTML) < 40){
        increaseFlagCount();
      }
      return false;
    } else {
      this.setAttribute('class', 'tile flag');
      reduceFlagCount();
      playSound('flag');
      return false;
    }
  }

  // Add event listener for click event on each tile
  function addListener() {
    tiles = document.getElementsByClassName('tile');
    tiles = [].slice.call(tiles);
    for (let i = 0; i < tiles.length; i++) {
      tiles[i].addEventListener('click', logTile);
      tiles[i].addEventListener('contextmenu', setFlag, false);
    }
  }

  // Create tiles on board
  function makeTiles() {
    const msBoard = document.getElementById('minesweeper');
    for (let i = 0; i < totalTiles; i++) {
      const tile = document.createElement('li');
      tile.setAttribute('class', 'tile');
      tile.setAttribute('data-value', i);
      msBoard.appendChild(tile);
    }
    addListener();
  }

  makeTiles();
  mineCount.innerHTML = pad(minesNeeded, 3);
  placeMines();
  restartListener();
}

document.addEventListener('DOMContentLoaded', init, false);
