'use strict'

const RESET = '🐵'
const WIN = '🙊'
const LOSE = '🙉'
const SAFE = '🐒'

const EMPTY = ' '
const MINE = '💣'
const MARK = '🍌'
const LIFE = '🐒'
const HINT = '🔦'

var gElTable = document.querySelector('.board-container')
var gElResetBtn = document.querySelector('.restart-btn')
var gElLifeContainer = document.querySelector('.life-container')
var gElHintContainer = document.querySelector('.hint-container')
var gElRulesContainer = document.querySelector('.rules-container')
var gElRulesContainerBtn = document.querySelector('.rules-btn')
var gElMinutesContainer = document.querySelector('.min')
var gElSecondContainer = document.querySelector('.sec')
var gElSafeClickContainer = document.querySelector('.safe-click-container')

var gGameBoard
var gCellContent
var gIntervalId
var gSafeClickCooldown
var gHintsCooldown
var gCounts = 0
var isFirstClick = true
var gLifes = []
var gHints = []
var gAudio = new Audio('sounds/SOUND_BY_ELIRAN_ZOHAR.wav')
var gGameCounter = 0

var gBoard = {
  minesAroundCount: 0,
  isShown: false,
  isMine: false,
  isMarked: false,
}

var gLevel = {
  LEVEL: 'Easy',
  SIZE: 4,
  MINES: 2,
  BMARK: 2,
  LIFES: 3,
  HINTS: 3,
}

var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  safeClicks: 3,
}

function rulesStartGame() {
  gGame.isOn = true
  gGameCounter = 1
  gElRulesContainer.innerHTML = ''
  gElRulesContainer.classList.remove('rules-container')
  gElRulesContainerBtn.innerHTML = ''
}

function onInit() {
  playSoundBackGround()

  playStart()

  gGameBoard = buildBoard()

  if (gLevel.LEVEL === 'Easy') {
    gLevel.LIFES = 2
    gLifes = [LIFE, LIFE]
    gElLifeContainer.innerHTML = gLifes
  } else {
    gLevel.LIFES = 3
    gLifes = [LIFE, LIFE, LIFE]
    gElLifeContainer.innerHTML = gLifes
  }

  if (gLevel.LEVEL === 'Easy') {
    gLevel.HINTS = 0
    gHints = []
    gElHintContainer.innerHTML = `No Hints in This Level...`
  } else {
    gLevel.HINTS = 3
    gHints = [HINT, HINT, HINT]
    gElHintContainer.innerHTML = `Mine Hint: ${gHints}`
  }

  if (gLevel.LEVEL === 'Easy') {
    gGame.safeClicks = 1
    gElSafeClickContainer.innerText = `${gGame.safeClicks} Safe Click`
  } else {
    gGame.safeClicks = 3
    gElSafeClickContainer.innerText = `${gGame.safeClicks} Safe Click`
  }

  onSetLevel(gLevel)

  gGame.shownCount = 0
  gGame.markedCount = 0
  gGame.secsPassed = 0
  gGame.BMARK = 2
  gCounts = 0

  gCounts = 0
  if (gGameCounter === 1) {
    gGame.isOn = true // - Gamesistrue
  } else {
    gGame.isOn = false // - Gamesistrue
  }

  isFirstClick = true

  gElTable.classList.remove('win-container')
  gElSafeClickContainer.innerText = `${gGame.safeClicks} Safe Click`
  gElResetBtn.innerHTML = RESET
  gElLifeContainer.innerHTML = gLifes

  setMinesNegsCount(gGameBoard)
  endTimer()
  renderBoard(gGameBoard)
}

function buildBoard() {
  const board = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    board.push([])
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = { ...gBoard }
    }
  }
  return board
}

function renderBoard(board) {
  var strHTML = ''

  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += '<tr>'

    for (var j = 0; j < gLevel.SIZE; j++) {
      // const cell = board[i][j]

      gCellContent = EMPTY

      const className = `cell-${i}-${j}`
      strHTML += `<td class="cell ${className}" oncontextmenu="return onCellMarked(event, ${i}, ${j})" onclick="onCellClicked(this, ${i}, ${j})">${gCellContent}</td>`
    }
    strHTML += '</tr>'
  }
  const elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

function onSetLevel(level) {
  gLevel = level
  var elMinesCounter = document.querySelector('.mine-count')
  elMinesCounter.innerText = gLevel.MINES

  gGameBoard = buildBoard()
  addMines(gGameBoard)
  setMinesNegsCount(gGameBoard)

  if (gGameCounter === 1) {
    gGame.isOn = true // - Gamesistrue
  } else {
    gGame.isOn = false // - Gamesistrue
  }

  gElTable.classList.remove('lose-container')
  gElTable.classList.remove('win-container')
  gElResetBtn.innerHTML = RESET

  if (gLevel.LEVEL === 'Easy') {
    gLevel.LIFES = 2
    gLifes = [LIFE, LIFE]
    gElLifeContainer.innerHTML = gLifes
  } else {
    gLevel.LIFES = 3
    gLifes = [LIFE, LIFE, LIFE]
    gElLifeContainer.innerHTML = gLifes
  }

  if (gLevel.LEVEL === 'Easy') {
    gLevel.HINTS = 0
    gHints = []
    gElHintContainer.innerHTML = `No Hints in This Level...`
  } else {
    gLevel.HINTS = 3
    gHints = [HINT, HINT, HINT]
    gElHintContainer.innerHTML = `Mine Hint: ${gHints}`
  }

  if (gLevel.LEVEL === 'Easy') {
    gGame.safeClicks = 1
    gElSafeClickContainer.innerText = `${gGame.safeClicks} Safe Click`
  } else {
    gGame.safeClicks = 3
    gElSafeClickContainer.innerText = `${gGame.safeClicks} Safe Click`
  }

  gGame.BMARK = gGame.BMARK
  gGame.secsPassed = 0
  gElSafeClickContainer.innerText = `${gGame.safeClicks} Safe Click`

  gGame.shownCount = 0
  gGame.markedCount = 0
  gCounts = 0

  renderBoard(gGameBoard)
}

function createNewMine() {
  var emptyCell = getEmptyMinesCells(gGameBoard)
  if (emptyCell !== null) {
    var randomIdx = getRandomIntInclusive(0, emptyCell.length - 1)
    var selectedCell = emptyCell[randomIdx]

    gGameBoard[selectedCell.row][selectedCell.col].isMine = true
    // console.log('New mine created at:', selectedCell)
  }
}

function onHintMine() {
  if (gLevel.HINTS === 0) {
    gElHintContainer.innerHTML = `No More Hints..`
    return
  }

  if (!gGame.isOn) {
    return
  }

  if (gHintsCooldown) {
    return
  }

  gHintsCooldown = true

  gLevel.HINTS--
  gHints.pop()
  gElHintContainer.innerHTML = `Mine Hint: ${gHints}`

  var marked = false

  for (var i = 0; i < gGameBoard.length; i++) {
    for (var j = 0; j < gGameBoard[i].length; j++) {
      var cell = gGameBoard[i][j]

      if (cell.isMine === true && !cell.isShown && !marked && !cell.isMarked) {
        var elCell = document.querySelector(`.cell-${i}-${j}`)

        elCell.innerHTML = MINE
        elCell.classList.add('selected-hint')
        marked = true

        setTimeout(() => {
          elCell.innerHTML = EMPTY
          elCell.classList.remove('selected-hint')
          marked = false
        }, 1000)
      }
    }
  }
  setTimeout(() => {
    gHintsCooldown = false
  }, 3000)

  return
}

function safeClick() {
  if (gGame.safeClicks === 0) {
    gElSafeClickContainer.innerText = `No More Safe Clicks..`
    return
  }

  if (gGame.isOn === false) {
    return
  }

  if (gSafeClickCooldown) {
    return
  }

  gSafeClickCooldown = true

  gGame.safeClicks--
  gElSafeClickContainer.innerText = `${gGame.safeClicks} Safe Click`

  var marked = false

  for (var i = 0; i < gGameBoard.length; i++) {
    for (var j = 0; j < gGameBoard[i].length; j++) {
      var cell = gGameBoard[i][j]

      if (!cell.isMine && !cell.isShown && !marked && !cell.isMarked) {
        var elCell = document.querySelector(`.cell-${i}-${j}`)

        elCell.innerHTML = SAFE
        elCell.classList.add('selected-safe')
        marked = true

        setTimeout(() => {
          elCell.innerHTML = EMPTY
          elCell.classList.remove('selected-safe')
          marked = false
        }, 500)
      }
    }
  }
  setTimeout(() => {
    gSafeClickCooldown = false
  }, 3000)
}

function onCellClicked(elCell, i, j) {
  var cell = gGameBoard[i][j]
  if (!gGame.isOn) return

  // console.table(gGameBoard)
  // console.log(cell)

  playHit()

  if (isFirstClick) {
    startTimer()
  }

  if (isFirstClick && cell.isMine) {
    cell.isMine = false
    isFirstClick = false
    createNewMine()
  }

  isFirstClick = false

  if (cell.isMarked) return

  if (cell.isMine) {
    if (cell.isMine === cell.isShown) {
      return
    }
    playMine()
    gCellContent = MINE
    cell.isShown = true

    gLevel.LIFES--
    gLifes.pop()
    gElLifeContainer.innerHTML = gLifes

    elCell.innerHTML = MINE
    elCell.classList.add('mine')

    if (gLevel.LIFES === 0 && gLifes.length === 0) {
      revealMines()
      gGame.isOn = false

      gElTable.classList.add('lose-container')
      gElResetBtn.innerHTML = LOSE
      playLose()
      endTimer()

      alert('You Lose...')
      alert('Click On The Monkey To RESET!')
    }
  } else if (!cell.isShown && !cell.isMarked && !cell.isMine) {
    cell.isShown = true
    gCounts++
    elCell.classList.add('selected')
    elCell.innerHTML = cell.minesAroundCount

    if (cell.minesAroundCount === 0) {
      expandShown(gGameBoard, elCell, i, j)
    }
  }

  if (gCounts === gLevel.SIZE * gLevel.SIZE) {
    gElTable.classList.add('win-container')
    gElResetBtn.innerHTML = WIN

    playWin()
    alert('You Won!')
    alert('Click On The Monkey To RESET!')

    endTimer()
    gGame.isOn = false
  }
  console.log('gCounts Click:', gCounts)
}

function revealMines() {
  for (var i = 0; i < gGameBoard.length; i++) {
    for (var j = 0; j < gGameBoard[i].length; j++) {
      var cell = gGameBoard[i][j]

      if (cell.isMine && !cell.isShown) {
        var elCell = document.querySelector(`.cell-${i}-${j}`)

        elCell.innerHTML = MINE
        elCell.classList.add('mine')
        cell.isShown = true
      }
    }
  }
}

function onCellMarked(event, i, j) {
  event.preventDefault()
  var elCell = event.target
  var cell = gGameBoard[i][j]

  if (!gGame.isOn) return

  if (cell.isShown) return

  if (cell.isMarked) {
    // console.log('UnMark')
    if (cell.isMine) {
      cell.isMine = true
    }
    gGame.markedCount--
    gCounts--
    cell.isMarked = false
    elCell.innerHTML = EMPTY
    elCell.classList.remove('marked')

    return
  } else if (gGame.markedCount <= gLevel.MINES + gLevel.BMARK - 1) {
    // console.log('Mark')
    if (cell.isMine) {
      // gCounts++
      console.log('Mark a Mine')
    }
    gGame.markedCount++
    gCounts++
    cell.isMarked = true
    // cell.isMine = true
    elCell.innerHTML = MARK
    elCell.classList.add('marked')
  }

  if (cell.isShown && cell.isMine) return

  if (gCounts === gLevel.SIZE * gLevel.SIZE) {
    gElTable.classList.add('win-container')
    gElResetBtn.innerHTML = WIN

    alert('You Won!')
    alert('Click On The Monkey To RESET!')

    endTimer()
    playWin()
    gGame.isOn = false
  }
  console.log('gCounts Mark:', gCounts)
  // console.log('gGame.markedCount:', gGame.markedCount)
  return false
}

function setMinesNegsCount(board) {
  var counter = 0

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (board[i][j].isMine) continue

      var mineCount = countNegMines(board, i, j)
      if (board[i][j].minesAroundCount !== mineCount) {
        board[i][j].minesAroundCount = mineCount
      }
      if (mineCount === 0 && board[i][j].minesAroundCount === 0) {
        board[i][j].minesAroundCount = 0
      }
      counter += mineCount
    }
  }
  return counter
}

function expandShown(board, elCell, i, j) {
  for (var row = i - 1; row <= i + 1; row++) {
    for (var col = j - 1; col <= j + 1; col++) {
      if (row >= 0 && row < board.length && col >= 0 && col < board[0].length) {
        const currCell = board[row][col]

        if (!currCell.isMine && !currCell.isShown && !currCell.isMarked) {
          currCell.isShown = true
          gGame.shownCount++
          gCounts++

          const elNeighbor = document.querySelector(`.cell-${row}-${col}`)
          elNeighbor.innerHTML = currCell.minesAroundCount
          elNeighbor.classList.add('selected')
          if (currCell.minesAroundCount === 0) {
            elCell.innerHTML = EMPTY
            elNeighbor.innerHTML = EMPTY
            expandShown(board, elNeighbor, row, col)
          }
        }
      }
    }
  }
}

// Neg Loop
function countNegMines(board, row, col) {
  var minesCounter = 0

  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i >= board.length) continue

    for (var j = col - 1; j <= col + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      if (i === row && j === col) continue

      var currCell = board[i][j]
      if (currCell.isMine) minesCounter++
    }
  }
  return minesCounter
}

function addMines(board) {
  var emptyMineCell = getEmptyMinesCells(gGameBoard)
  if (emptyMineCell === null) return
  const mineCells = []

  for (var i = 0; i < gLevel.MINES; i++) {
    var randomIdx = Math.floor(Math.random() * emptyMineCell.length)
    mineCells.push(emptyMineCell[randomIdx])
    emptyMineCell.splice(randomIdx, 1) // Remove the random cell from emptyCells accroding the gLevel.Mines num
  }

  for (var j = 0; j < mineCells.length; j++) {
    var mineCell = mineCells[j]
    board[mineCell.row][mineCell.col].isMine = true // Make the cutted cells .isMine True
  }
  return emptyMineCell[getRandomIntInclusive(0, emptyMineCell.length - 1)]
}

function getEmptyMinesCells(board) {
  const emptyCells = []

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      var cell = board[i][j]
      if (!cell.isMine) {
        emptyCells.push({ row: i, col: j }) // Push to all the board that isMine = false
      }
    }
  }
  if (!emptyCells.length) return null
  return emptyCells
}

function startTimer() {
  var startTime = Date.now()

  gIntervalId = setInterval(() => {
    var elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
    var minutes = Math.floor(elapsedSeconds / 60)
    var seconds = elapsedSeconds % 60

    gElMinutesContainer.innerText = minutes
    gElSecondContainer.innerText = seconds
    gGame.secsPassed++
  }, 100)
}

function endTimer() {
  clearInterval(gIntervalId)
  gElMinutesContainer.innerText = 0
  gElSecondContainer.innerText = 0
}

playSoundBackGround()
function playSoundBackGround() {
  if (gAudio && !gAudio.paused) {
    return
  }

  if (gAudio) {
    gAudio.pause()
    gAudio.currentTime = 0
  }

  gAudio = new Audio('sounds/SOUND_BY_ELIRAN_ZOHAR.wav')
  gAudio.volume = 0.2
  gAudio.loop = true
  gAudio.play()
}

function playStart() {
  var audio = new Audio('sounds/START.wav')
  audio.volume = 0.3
  audio.play()
}

function playHit() {
  var audio = new Audio('sounds/HIT.wav')
  audio.volume = 0.3
  audio.play()
}

function playMine() {
  var audio = new Audio('sounds/MINE.wav')
  audio.volume = 0.3
  audio.play()
}

function playLose() {
  var audio = new Audio('sounds/LOSE.wav')
  audio.volume = 0.5
  audio.play()
}

function playWin() {
  var audio = new Audio('sounds/WIN.wav')
  audio.volume = 0.5
  audio.play()
}

// ------------------------------------------------------

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function renderCell(location, value) {
  const cellSelector = '.' + getClassName(location)
  const elCell = document.querySelector(cellSelector)
  elCell.innerHTML = value
}
