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
}

var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
}

var gGameBoard
var gCellContent

function onInit() {
  gGame.isOn = true

  gGameBoard = buildBoard()

  onSetLevel(gLevel)

  setMinesNegsCount(gGameBoard)

  renderBoard(gGameBoard)
}

function addMine() {
  var emptyMineCell = getEmptyMinesCell(gGameBoard)
  if (emptyMineCell === null) return

  gGameBoard[emptyMineCell.row][emptyMineCell.col].isMine = true

  renderCell(emptyMineCell, MINE)
}

function getEmptyMinesCell(board) {
  const emptyCells = []

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      var cell = board[i][j]
      if (!cell.isMine) {
        emptyCells.push({ row: i, col: j }) // Push to all the board that isMine = false
      }
    }
  }

  // Random select gLevel.MINES number of cells from the emptyCells array
  // console.log(emptyCells)
  const mineCells = []

  for (var k = 0; k < gLevel.MINES; k++) {
    var randomIdx = Math.floor(Math.random() * emptyCells.length)
    mineCells.push(emptyCells[randomIdx])
    emptyCells.splice(randomIdx, 1) // Remove the random cell from emptyCells accroding the gLevel.Mines num
  }
  // console.log(emptyCells)

  for (var l = 0; l < mineCells.length; l++) {
    var mineCell = mineCells[l]
    board[mineCell.row][mineCell.col].isMine = true // Make the cutted cells .isMine True
    // console.log(mineCells[l])
  }

  console.log(mineCells)
  if (!emptyCells.length) return null
  return emptyCells[getRandomIntInclusive(0, emptyCells.length - 1)]
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

function onCellClicked(elCell, i, j) {
  var cell = gGameBoard[i][j]
  cell.isShown = true

  if (cell.isMine) {
    gCellContent = MINE

    elCell.innerHTML = MINE
    elCell.classList.add('selected2')

    alert('Boom!')
  } else {
    gCellContent = cell.minesAroundCount

    elCell.innerHTML = cell.minesAroundCount
  }

  elCell.classList.add('selected')
}

function renderBoard(board) {
  var strHTML = ''

  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += '<tr>'

    for (var j = 0; j < gLevel.SIZE; j++) {
      const cell = board[i][j]

      // gCellContent = cell.isMine ? MINE : countNegMines(board, i, j)
      // if (gCellContent === 0) gCellContent = EMPTY
      gCellContent = EMPTY
      const className = `cell-${i}-${j}`
      strHTML += `<td class="cell ${className}" onclick="onCellClicked(this, ${i}, ${j})">${gCellContent}</td>`
    }
    strHTML += '</tr>'
  }
  const elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
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
  // console.log(counter) overall counter of minesAroundCount
  return counter
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

function onCellMarked(elCell) {}

function checkGameOver() {}

function expandShown(board, elCell, i, j) {}

function onSetLevel(level) {
  gLevel = level

  var elMinesCounter = document.querySelector('.mine-count')
  elMinesCounter.innerText = gLevel.MINES

  gGameBoard = buildBoard()
  getEmptyMinesCell(gGameBoard)
  renderBoard(gGameBoard)
}

function renderCell(location, value) {
  const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
  elCell.innerHTML = value
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
