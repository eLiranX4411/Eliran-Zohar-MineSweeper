'use strict'

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomColor() {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

//------------------------------------------------------------------------------------------------------------------------

function makeId(length = 6) {
  var txt = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return txt
}

//------------------------------------------------------------------------------------------------------------------------

function createMat(ROWS, COLS) {
  const mat = []
  for (var i = 0; i < ROWS; i++) {
    const row = []
    for (var j = 0; j < COLS; j++) {
      row.push('')
    }
    mat.push(row)
  }
  return mat
}

//------------------------------------------------------------------------------------------------------------------------

function shuffleNums(nums) {
  for (var i = nums.length - 1; i > 0; i--) {
    var randomIdx = Math.floor(Math.random() * (i + 1))
    var temp = nums[i]
    nums[i] = nums[randomIdx]
    nums[randomIdx] = temp
  }
}

//------------------------------------------------------------------------------------------------------------------------

function buildSizedBoard() {
  const size = 10
  const board = []

  for (var i = 0; i < size; i++) {
    board.push([])

    for (var j = 0; j < size; j++) {
      board[i][j] = FOOD

      if (i === 0 || i === size - 1 || j === 0 || j === size - 1 || (j === 3 && i > 4 && i < size - 2)) {
        board[i][j] = WALL
      }
    }
  }
  return board
}

//------------------------------------------------------------------------------------------------------------------------

// Class Name Inside and not from a function
function renderBoard(board) {
  var strHTML = ''
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < board[0].length; j++) {
      const cell = board[i][j]
      const className = `cell cell-${i}-${j}`

      strHTML += `<td class="${className}">${cell}</td>`
    }
    strHTML += '</tr>'
  }
  const elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

// With Class Name
function renderCell(location, value) {
  const cellSelector = '.' + getClassName(location)
  const elCell = document.querySelector(cellSelector)
  elCell.innerHTML = value
}

function getClassName(position) {
  const cellClass = `cell-${position.i}-${position.j}`
  return cellClass
}

//------------------------------------------------------------------------------------------------------------------------

function onCellClicked(num) {
  if (num === gCounter) {
    var el = document.getElementsByClassName(num)[0]
    console.log(el.classList.add('selected'))
    gCounter++
  }
  if (gCounter === gDifficult.row * gDifficult.row + 1) {
    alert(`You win! in time ${Date.now()}`)
    renderBoard()
  }
}

//------------------------------------------------------------------------------------------------------------------------

function updateScore(diff) {
  // DONE: update model
  if (!diff) {
    gGame.score = 0
  } else {
    gGame.score += diff
  }
  // DONE and dom
  document.querySelector('span.score').innerText = gGame.score
}

//------------------------------------------------------------------------------------------------------------------------

function gameOver() {
  clearInterval(gIntervalId)
  var elTable = document.querySelector('.board-container')
  var elModal = document.querySelector('.modal')

  clearInterval(gIntervalGhosts)
  renderCell(gPacman.location, '🪦')
  gGame.isOn = false

  elModal.classList.remove('display')
  elTable.classList.add('display')
}

//------------------------------------------------------------------------------------------------------------------------

function getEmptyCell(board) {
  const emptyCells = []
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      var cell = gBoard[i][j]
      if (cell === FOOD) {
        emptyCells.push({ i, j })
      }
    }
  }
  if (!emptyCells.length) return null
  return emptyCells[getRandomIntInclusive(0, emptyCells.length - 1)]
}

//------------------------------------------------------------------------------------------------------------------------

function addSomething() {
  var emptyCell = getEmptyCell(gBoard)
  if (emptyCell === null) return

  gBoard[emptyCell.i][emptyCell.j] = CHERRY

  renderCell(emptyCell, CHERRY)
}

//------------------------------------------------------------------------------------------------------------------------

function getMoveDiff() {
  const randNum = getRandomIntInclusive(1, 4)

  switch (randNum) {
    case 1:
      return { i: 0, j: 1 }
    case 2:
      return { i: 1, j: 0 }
    case 3:
      return { i: 0, j: -1 }
    case 4:
      return { i: -1, j: 0 }
  }
}

function getNextLocation(eventKeyboard) {
  // console.log('eventKeyboard:', eventKeyboard)
  const nextLocation = {
    i: gPacman.location.i,
    j: gPacman.location.j,
  }
  // DONE: figure out nextLocation
  switch (eventKeyboard) {
    case 'ArrowUp':
      nextLocation.i--
      break
    case 'ArrowRight':
      nextLocation.j++
      break
    case 'ArrowDown':
      nextLocation.i++
      break
    case 'ArrowLeft':
      nextLocation.j--
      break
  }
  return nextLocation
}

function handleKey(event) {
  const i = gGamerPos.i
  const j = gGamerPos.j

  switch (event.key) {
    case 'ArrowLeft':
      moveTo(i, j - 1)
      break
    case 'ArrowRight':
      moveTo(i, j + 1)
      break
    case 'ArrowUp':
      moveTo(i - 1, j)
      break
    case 'ArrowDown':
      moveTo(i + 1, j)
      break
  }
}

//------------------------------------------------------------------------------------------------------------------------

function getGhostHTML(ghost) {
  if (gPacman.isSuper) return `<span style="background-color: ${ghost.superColor}">${GHOST}</span>`
  else return `<span style="background-color: ${ghost.color}">${GHOST}</span>`
}

//------------------------------------------------------------------------------------------------------------------------

function displayNegCount() {
  var counter = 0

  for (var i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue

    for (var j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {
      if (j < 0 || j >= gBoard[0].length) continue
      if (i === gGamerPos.i && j === gGamerPos.j) continue

      var currCell = gBoard[i][j]
      if (currCell.gameElement === BALL) counter++
    }
  }
  document.querySelector('.neg-balls').innerText = counter
}

//------------------------------------------------------------------------------------------------------------------------

var gAudio = new Audio('sounds/________.mp3')
function playSoundExample() {
  if (gAudio && !gAudio.paused) {
    return
  }

  if (gAudio) {
    gAudio.pause()
    gAudio.currentTime = 0
  }

  gAudio = new Audio('sounds/______.mp3')
  gAudio.volume = 0.1
  gAudio.loop = true
  gAudio.play()
}

//------------------------------------------------------------------------------------------------------------------------

function Sound() {
  var audio = new Audio('sounds/______.mp3')
  audio.volume = 0.2
  audio.play()
}
