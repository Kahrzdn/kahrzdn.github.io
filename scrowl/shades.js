var colorMap = [
  "#000000",
  "#222",
  "#999999",
  "#ffffff"
]


var levelDefs = [
  { name: "startscreen", numRow: 9, numLanes: 12, seed: 3,maxPairs:17 },
  { name: "1", numRow: 9, numLanes: 12, seed: 11, maxPairs:1 },
  { name: "2", numRow: 9, numLanes: 12, seed: 7,maxPairs:2 },
  { name: "3", numRow: 9, numLanes: 12, seed: 78 ,maxPairs:3 },
  { name: "4", numRow: 9, numLanes: 12, seed: 54 ,maxPairs:3 },
  { name: "4", numRow: 9, numLanes: 12, seed: 55,maxPairs:3  },
  { name: "4", numRow: 9, numLanes: 12, seed: 56 ,maxPairs:4 },
  { name: "4", numRow: 9, numLanes: 12, seed: 57 ,maxPairs:4 },
  { name: "4", numRow: 9, numLanes: 12, seed: 58 ,maxPairs:4 },
  { name: "4", numRow: 9, numLanes: 12, seed: 59 ,maxPairs:4 },
  { name: "4", numRow: 9, numLanes: 12, seed: 54 ,maxPairs:5 },
  { name: "4", numRow: 9, numLanes: 12, seed: 55 ,maxPairs:5 },
  { name: "4", numRow: 9, numLanes: 12, seed: 56 ,maxPairs:5 },
  { name: "4", numRow: 9, numLanes: 12, seed: 57 ,maxPairs:5 },
  { name: "4", numRow: 9, numLanes: 12, seed: 58 ,maxPairs:5 },

  { name: "6", numRow: 5, numLanes: 7 },
  { name: "7", numRow: 6, numLanes: 8 },
]

var levels = [];

var currentLevel = 0;
var wdx;
var wdy;
var ww;
var wh;
const orgMaxColors = 26;
var maxcolors;
var scoreHeight;
var streak = 0;
var score = { matches: 0, moves: 0 };
var gameState = 0;

function setup() {
  ww = windowWidth;
  wh = windowHeight;
  createCanvas(ww, ww);

  levels[0] = createLevel(currentLevel);
}

function createLevel(levelNum) {

  var lanes = constructProblem(levelDefs[levelNum])

  const hue = 0;
  const saturation = 70 + round(random(20));
  for (var i = 4; i <= maxColors; i++) {
    colorMap[i] = color('hsl(' + floor(hue + (360 / maxColors) * i) + ', ' + saturation + '%, ' + (30 + (i * 10) % 70) + '%)');
  }


  var level = { lanes: lanes, score: { matches: 0, moves: 0 } };
  checkLanes(level);
  level.score = { matches: 0, moves: 0 }

  if (level.done) {
    level = createLevel(levelNum);
  }


  return level;
}

function constructProblem(level) {
  const numRow = level.numRow;
  const numLanes = level.numLanes;
  console.log(level)
  if (level.seed) {
    randomSeed(level.seed);
  }

  maxColors = orgMaxColors;
  if (level.maxPairs) {
    maxColors= level.maxPairs+3;
  }
  for (var n = 0; n < 900; n++) {
    
    var lanes = [];
    for (var i = 0; i < numLanes; i++) {
      var lane = [];
      for (var j = 0; j < numRow; j++) {
        lane[j] = { num: 1, color: 1 };
      }
      lanes.push(lane);
    }
    var succes = true;

    if (constructNextMatch(lanes, numRow, numLanes, 4)) {
      break;
    }
    succes = false;
  }

  if (!succes)
    console.log("not possible")

  return lanes;
}

function constructNextMatch(matrix, numRow, numLanes, color) {

  if (color > maxColors) {
    return true;
  }

  var spot = [{}, {}];
  if (!tryfindTwinSpot(matrix, numRow, numLanes, spot)) {
    // logMatrix(matrix)
    return false;
  }
  insertTiles(matrix, spot, color);
  shiftTiles(matrix, numRow, numLanes, spot);
  color = color + 1;
  return constructNextMatch(matrix, numRow, numLanes, color);
}

function tryfindTwinSpot(lanes, numRow, numLanes, spot) {
  var spotList = [];
  for (var x = 0; x < numLanes; x++) {
    for (var y = 0; y < numRow; y++) {
      if (lanes[x][y].num == 1) {
        if (x + 1 < numLanes && lanes[x + 1][y].num == 1) {
          spotList.push([{ x: x, y: y }, { x: x + 1, y: y }]);
        }
        if (y + 1 < numRow && lanes[x][y + 1].num == 1) {
          spotList.push([{ x: x, y: y }, { x: x, y: y + 1 }]);
        }
      }
    }
  }

  if (spotList.length == 0)
    return false;

  const spotCand = spotList[floor(random(spotList.length))];
  spot[0] = spotCand[0];
  spot[1] = spotCand[1];
  return true;
}

function insertTiles(lanes, spot, color) {
  lanes[spot[0].x][spot[0].y] = { color: color, num: color };
  lanes[spot[1].x][spot[1].y] = { color: color, num: color };
}

function shiftTiles(lanes, numRow, numLanes, spot) {
  //spot is vertical, so move horz aka interlane
  if (spot[0].x == spot[1].x) {
    arrayRotateRowNum(lanes, spot[0].y, floor(1 + random(numRow - 2)));
    return;
  }
  if (spot[0].y == spot[1].y) {
    arrayRotateColNum(lanes[spot[0].x], floor(1 + random(numLanes - 2)));
    return;
  }
}

function logMatrix(lanes) {
  var n = 0;
  console.log("vvvvvvvvvvvvvvvvvvvvvvvv")
  for (var i = 0; i < lanes[0].length; i++) {
    var str = "";
    for (var j = 0; j < lanes.length; j++) {
      str += " " + String(lanes[j][i].num).padStart(2, '0');;
    }
    console.log(n + str)
    n++;
  }
  console.log("^^^^^^^^^^^^^^^^^^^^^^^^")
  console.log("              ")
}


function removeColor(level) {
  for (var i = 0; i < level.lanes.length; i++) {
    var lane = level.lanes[i];
    for (var j = 0; j < lane.length; j++) {
      if (lane[j].color > 2) {
        lane[j].color = 2;
        return;
      }
    }
  }

}

function refillColor(level) {
  for (var i = 0; i < level.lanes.length; i++) {
    var lane = level.lanes[i];
    for (var j = 0; j < lane.length; j++) {
      if (lane[j].color == 2) {
        lane[j].color = lane[j].num;
        return;
      }
    }
  }
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
};

function drawStartScreen() {
  drawLevel(levels[currentLevel]);
  fill(255);
  stroke(0);
  textSize(window.innerWidth / 5);
  var t1 = "SHADES";
  text(t1, window.innerWidth / 2 - textWidth(t1) / 2, window.innerHeight / 2);

}

function drawEndLevel(level) {
  fill(255);
  stroke(0);
  textSize(window.innerWidth / 15);
  var t1 = "🌈 Score " + round(100 * level.score.matches / level.score.moves) + "%";
  text(t1, window.innerWidth / 2 - textWidth(t1) / 2, window.innerHeight / 2);
  var t2 = "↻ Retake ";
  text(t2, window.innerWidth / 4 - textWidth(t2) / 2, 3 * window.innerHeight / 4);
  var t3 = "Next Level ➡️";
  text(t3, 3 * window.innerWidth / 4 - textWidth(t3) / 2, 3 * window.innerHeight / 4);
}


function drawLevel(level) {
  wdx = window.innerWidth / level.lanes.length;
  scoreHeight = window.innerHeight * 0.96;
  wdy = (window.innerHeight) / level.lanes[0].length;
  for (var i = 0; i < level.lanes.length; i++) {
    if (lanePosX == i)
      drawLane(i, level.lanes.length, laneDX, laneDY, level.lanes[i])
    else
      drawLane(i, level.lanes.length, laneDX, 0, level.lanes[i]);
  }
//  drawScore(level.score);
}

function drawScore(score) {
  var pct = 100;
  if (score.moves > 0) {
    pct = score.matches / score.moves;
  }
  for (var i = 0; i < score.max; i++) {
    var x = 3 + i * window.innerWidth * pct;
    var y = scoreHeight;

    if (score.current > i) {
      fill(0, 0, 0, 80);
      rect(x + 0.06 * window.innerWidth / score.max, y + 0.06 * window.innerWidth / score.max, 0.8 * window.innerWidth / score.max, 0.02 * window.innerWidth, 2);
      fill(colorMap[4 + (i % (maxColors - 4))]);
      rect(x + 0.0 * window.innerWidth / score.max, y, 0.8 * window.innerWidth / score.max, 0.02 * window.innerWidth, 2);
    }
  }
}

function drawLane(place, lanesNum, dx, dy, lane) {
  for (var i = 0; i < lane.length; i++) {
    var ddx = 0;
    if (i == lanePosY) {
      ddx = dx;
    }
    drawBrick(place, i, ddx, dy, lane[i]);
    if (dy > 0) {
      drawBrick(place, i, 0, -lane.length * wdy + dy, lane[i])
    }
    if (dy < 0) {
      drawBrick(place, i, 0, lane.length * wdy + dy, lane[i])
    }
    if (ddx > 0) {
      drawBrick(place, i, -lanesNum * wdx + ddx, 0, lane[i])
    }
    if (ddx < 0) {
      drawBrick(place, i, lanesNum * wdx + ddx, 0, lane[i])
    }
  }
}

function drawBrick(px, py, dx, dy, cell) {
  col = color(colorMap[cell.color]);
  noStroke();
  fill(col);
  rect(px * wdx + dx + 2, py * wdy + dy + 2, wdx - 4, wdy - 4, 5);


}


function draw() {

  resizeCanvas(windowWidth, windowHeight);
  background(colorMap[0]);
  switch (gameState) {
    //game start screen
    case 0:
      drawStartScreen();
      break;
    //level start screen
    case 1:

    //level screen
    case 2:
      drawLevel(levels[currentLevel])
      break;
    //level end screen
    case 3:
      drawEndLevel(levels[currentLevel])
      break;
    default:
      console.log("unexpected gameState");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

}

var mousepos = { x: -1, y: -1 }

function arrayRotateColNum(arr, num) {
  for (var i = 0; i < num; i++) {
    arr = arrayRotateCol(arr, false);
  }
  return arr;
}

function arrayRotateCol(arr, reverse) {
  if (reverse) arr.unshift(arr.pop());
  else arr.push(arr.shift());
  return arr;
}

function arrayRotateRowNum(arr, row, num) {
  for (var i = 0; i < num; i++) {
    arr = arrayRotateRow(arr, row, false);
  }
  return arr;
}

function arrayRotateRow(arr, row, reverse) {
  if (reverse) {
    var prev = arr[arr.length - 1][row];
    for (var i = 0; i < arr.length; i++) {
      var t = arr[i][row];
      arr[i][row] = prev;
      prev = t;
    }
  }
  else {
    var prev = arr[0][row];
    for (var i = arr.length - 1; i >= 0; i--) {
      var t = arr[i][row];
      arr[i][row] = prev;
      prev = t;
    }
  }

  return arr;
}


function checkLanes(level) {

  var lanes = level.lanes;
  console.log("before")
  //logMatrix(lanes);

  for (var i = 0; i < lanes.length; i++) {
    var prev = lanes[i][0].num
    for (var j = 1; j < lanes[i].length; j++) {
      var cell = lanes[i][j].num;
      if (cell > 1) {
        if (prev == cell) {
          level.score.matches++;
          lanes[i][j - 1] = { color: 1, num: 1 };
          lanes[i][j] = { color: 1, num: 1 };
          refillColor(level);
          refillColor(level);
          refillColor(level);
        }
      }

      prev = cell;
    }
  }
  for (var j = 0; j < lanes[0].length; j++) {
    var prev = lanes[0][j].num
    for (var i = 1; i < lanes.length; i++) {
      var cell = lanes[i][j].num;
      if (cell > 1) {
        if (prev == cell) {
          level.score.matches++;
          lanes[i - 1][j] = { color: 1, num: 1 };
          lanes[i][j] = { color: 1, num: 1 };
          refillColor(level);
          refillColor(level);
          refillColor(level);
        }
      }

      prev = cell;
    }
  }


  for (var i = 0; i < level.lanes.length; i++) {
    var lane = level.lanes[i];
    for (var j = 0; j < lane.length; j++) {
      if (lane[j].num > 1) {
        level.done = false;
        return;
      }
    }
  }
  console.log("after")
  //logMatrix(lanes);
  level.done = true;
  return
}


var laneDX = 0;
var laneDY = 0;
var lanePosX = 0;
var lanePosY = 0;

function touchStarted(ev) {
  mousepos.x = mouseX;
  mousepos.y = mouseY;

  resizeCanvas(windowWidth, windowHeight);
  ev.preventDefault();


}

function touchMoved() {
  laneDX = mouseX - mousepos.x;
  laneDY = mouseY - mousepos.y;
  if (abs(laneDX) > abs(laneDY)) {
    laneDY = 0;
  }
  else {
    laneDX = 0;
  }



  lanePosX = floor(mousepos.x / wdx);
  lanePosY = floor(mousepos.y / wdy);
}


function touchEnded() {
  const deltaX = round((mouseX - mousepos.x) / wdx);
  const deltaY = round((mouseY - mousepos.y) / wdy);

  if (gameState == 0) {
    currentLevel = 1;
    levels[currentLevel] = createLevel(currentLevel);
    gameState = 2;
    return;
  }

  if (gameState == 3) {
    if (mouseX / window.innerWidth > 0.5) {
      if (levelDefs[currentLevel + 1]) {
        currentLevel++;
      }
    }

    levels[currentLevel] = createLevel(currentLevel);

    gameState = 2;
    return;
  }

  if (deltaX != 0 || deltaY != 0) {
    levels[currentLevel].score.moves++;
  }

  if (abs(deltaX) > abs(deltaY)) {
    if (deltaX < 0) {
      for (var i = 0; i < -deltaX; i++) {
        arrayRotateRow(levels[currentLevel].lanes, lanePosY, false);
      }
    }
    if (deltaX > 0) {
      for (var i = 0; i < deltaX; i++) {
        arrayRotateRow(levels[currentLevel].lanes, lanePosY, true);
      }
    }
  }
  else {
    if (deltaY < 0) {
      for (var i = 0; i < -deltaY; i++) {
        arrayRotateCol(levels[currentLevel].lanes[lanePosX], false);
      }
    }
    if (deltaY > 0) {
      for (var i = 0; i < deltaY; i++) {
        arrayRotateCol(levels[currentLevel].lanes[lanePosX], true);
      }

    }
  }
  laneDX = 0;
  laneDY = 0;
  checkLanes(levels[currentLevel]);
  console.log(levels[currentLevel].done)
  if (levels[currentLevel].done) {
    if (gameState == 2) {
      gameState = 3;
    }
    return;
  }
}

function touchHandler(event) {
  if (event.touches.length > 1) {
    event.preventDefault()
  }
}


document.ontouchmove = function (event) {
  event.preventDefault();
};
