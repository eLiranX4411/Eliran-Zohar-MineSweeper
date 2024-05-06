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
  isFirstClick: true,
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
var gElTable = document.querySelector('.board-container')

function onInit() {
  gGame.shownCount = 0

  gGame.isOn = true

  gGameBoard = buildBoard()

  onSetLevel(gLevel)

  gElTable.classList.remove('win-container')

  setMinesNegsCount(gGameBoard)

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
  gElTable.classList.remove('clean-container')

  renderBoard(gGameBoard)
}

function onCellClicked(elCell, i, j) {
  var cell = gGameBoard[i][j]
  if (!gGame.isOn) return

  if (cell.isMine) {
    gCellContent = MINE
    cell.isShown = true

    elCell.innerHTML = MINE
    elCell.classList.add('selected2')

    gGame.isOn = false
    gElTable.classList.add('clean-container')
    alert('You Lose...')
  } else if (!cell.isShown && !cell.isMarked && !cell.isMine) {
    cell.isShown = true
    gGame.shownCount++

    gCellContent = cell.minesAroundCount
    elCell.innerHTML = cell.minesAroundCount
    elCell.classList.add('selected')
  }

  if (gGame.shownCount === gLevel.SIZE * gLevel.SIZE) {
    gElTable.classList.add('win-container')
    alert('You Win The Game!!!')
    alert('Click On The Monkey To RESET!')
    gGame.isOn = false
  }
}

function onCellMarked(event, i, j) {
  event.preventDefault()
  var elCell = event.target
  var cell = gGameBoard[i][j]

  if (cell.isShown && cell.isMine) return

  if (cell.isMine) {
    cell.isMine = false
    console.log('Mark a Bomb')
  }

  if (!cell.isShown) {
    cell.isMarked = true
    gGame.markedCount++
    gGame.shownCount++

    elCell.innerHTML = MARK
    elCell.classList.add('marked')
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

function checkGameOver() {}

function expandShown(board, elCell, i, j) {}

// ------------------------------------------------------

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/*
  // Random select gLevel.MINES number of cells from the emptyCells array
  // const mineCells = []

  // for (var k = 0; k < gLevel.MINES; k++) {
  //   var randomIdx = Math.floor(Math.random() * emptyCells.length)
  //   mineCells.push(emptyCells[randomIdx])
  //   emptyCells.splice(randomIdx, 1) // Remove the random cell from emptyCells accroding the gLevel.Mines num
  // }

  // for (var l = 0; l < mineCells.length; l++) {
  //   var mineCell = mineCells[l]
  //   board[mineCell.row][mineCell.col].isMine = true // Make the cutted cells .isMine True
  // }
    // return emptyCells[getRandomIntInclusive(0, emptyCells.length - 1)]

*/
