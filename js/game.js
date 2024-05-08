'use strict'

const RESET = '🐵'
const WIN = '🙊'
const LOSE = '🙉'

const EMPTY = ' '
const MINE = '💣'
const MARK = '🍌'
const LIFE = '🐒'

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
}

var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  // How many seconds passed
  secsPassed: 0,
}

var gGameBoard
var gCellContent

var gElTable = document.querySelector('.board-container')
var gElResetBtn = document.querySelector('.restart-btn')
var gElLifeContainer = document.querySelector('.life-container')
var gElRulesContainer = document.querySelector('.rules-container')
var gElRulesContainerBtn = document.querySelector('.rules-btn')

var gIntervalId
var gCounts = 0
var isFirstClick = true
var gLifes = []
// var gElTdMines = document.querySelector('.board')

function startGame() {
  gElRulesContainer.innerHTML = ''
  gElRulesContainer.classList.remove('rules-container')
  gElRulesContainerBtn.innerHTML = ''
  gGame.isOn = true
}

function onInit() {
  gLifes = [LIFE, LIFE, LIFE]

  gLevel.LIFES = 3

  gGame.shownCount = 0

  gGame.markedCount = 0

  gCounts = 0

  gGame.isOn = true

  isFirstClick = true

  gGameBoard = buildBoard()

  onSetLevel(gLevel)

  gElTable.classList.remove('win-container')

  gElResetBtn.innerHTML = RESET

  gElLifeContainer.innerHTML = gLifes

  setMinesNegsCount(gGameBoard)

  startTimer()

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

  gGame.isOn = true
  gElTable.classList.remove('lose-container')
  gElTable.classList.remove('win-container')
  gElResetBtn.innerHTML = RESET

  gElLifeContainer.innerHTML = gLifes
  gLevel.LIFES = 3

  renderBoard(gGameBoard)
}

function createNewMine() {
  var emptyCell = getEmptyMinesCells(gGameBoard)
  if (emptyCell !== null) {
    var randomIdx = getRandomIntInclusive(0, emptyCell.length - 1)
    var selectedCell = emptyCell[randomIdx]

    gGameBoard[selectedCell.row][selectedCell.col].isMine = true
    console.log('New mine created at:', selectedCell)
  }
}

function onCellClicked(elCell, i, j) {
  var cell = gGameBoard[i][j]
  if (!gGame.isOn) return

  if (isFirstClick && cell.isMine) {
    cell.isMine = false
    isFirstClick = false
    createNewMine()
  }

  isFirstClick = false

  if (cell.isMine) {
    gCellContent = MINE
    cell.isShown = true

    gLevel.LIFES--
    gCounts++
    gLifes.pop()
    console.log(gLifes)
    gElLifeContainer.innerHTML = gLifes

    elCell.innerHTML = MINE
    elCell.classList.add('selected2')

    if (gLevel.LIFES === 0 && gLifes.length === 0) {
      revealMines()
      gGame.isOn = false

      gElTable.classList.add('lose-container')
      gElResetBtn.innerHTML = LOSE
      endTimer()

      alert('You Lose...')
      alert('Click On The Monkey To RESET!')
    }
  } else if (!cell.isShown && !cell.isMarked && !cell.isMine) {
    expandShown(gGameBoard, elCell, i, j)

    // cell.isShown = true
    // gGame.shownCount++
    // gCounts++

    // gCellContent = cell.minesAroundCount
    // elCell.innerHTML = cell.minesAroundCount
    // elCell.classList.add('selected')
  }

  if (gCounts === gLevel.SIZE * gLevel.SIZE) {
    gElTable.classList.add('win-container')
    gElResetBtn.innerHTML = WIN

    alert('You Won!')
    alert('Click On The Monkey To RESET!')

    endTimer()
    gGame.isOn = false
  }
}

function revealMines() {
  for (var i = 0; i < gGameBoard.length; i++) {
    for (var j = 0; j < gGameBoard[i].length; j++) {
      var cell = gGameBoard[i][j]

      if (cell.isMine && !cell.isShown) {
        var elCell = document.querySelector(`.cell-${i}-${j}`)

        elCell.innerHTML = MINE
        elCell.classList.add('selected2')
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

  if (cell.isShown && cell.isMine) return

  gGame.markedCount++

  if (cell.isMine) {
    cell.isMine = false
    console.log('Mark a Bomb')
  }

  if (!cell.isShown && gGame.markedCount <= gLevel.MINES + gLevel.BMARK) {
    cell.isMarked = true
    gCounts++

    elCell.innerHTML = MARK
    elCell.classList.add('marked')
  } else {
    alert('You Use all the mark you have + Bonuses...')
    return
  }

  return false
}

// Neg Overall Count
function setMinesNegsCount(board) {
  var counter = 0

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (board[i][j].isMine) continue

      var mineCount = countNegMines(board, i, j)
      board[i][j].minesAroundCount = mineCount
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

        if (!currCell.isMine && !currCell.isShown) {
          currCell.isShown = true
          gGame.shownCount++
          gCounts++

          const elNeighbor = document.querySelector(`.cell-${row}-${col}`)
          elNeighbor.innerHTML = currCell.minesAroundCount
          elNeighbor.classList.add('selected')
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
  console.log(mineCells)
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
  var elMinutesContainer = document.querySelector('.min')
  var elSecondContainer = document.querySelector('.sec')
  var startTime = Date.now()

  gIntervalId = setInterval(() => {
    var elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
    var minutes = Math.floor(elapsedSeconds / 60)
    var seconds = elapsedSeconds % 60

    elMinutesContainer.innerText = minutes
    elSecondContainer.innerText = seconds
  }, 1000)
}

function endTimer() {
  clearInterval(gIntervalId)
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
