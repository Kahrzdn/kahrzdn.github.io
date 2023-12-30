var colorMap = [
  "#2f2f2f",
  "#020202",
  "#999999",
  "#ffffff"
]

var levels = []

var currentLevel = 0;
var wdx;
var wdy;
var ww;
var wh;
var maxColors = 26;
var scoreHeight;
var score = { current: 10, max: 20, row: [] };

function setup() {
  ww = windowWidth;
  wh = windowHeight;
  createCanvas(ww, ww);

  levels[0] = createLevel(6, 8);
}

function createLevel(numRow, numLanes) {
  var lanes = constructProblem(numRow, numLanes)

  const hue = 0;
  const saturation = 70 + round(random(20));
  for (var i = 4; i <= maxColors; i++) {
    colorMap[i] = color('hsl(' + floor(hue + (360 / maxColors) * i) + ', ' + saturation + '%, ' + (30 + (i * 10) % 70) + '%)');
  }

  var level = { lanes: lanes, score: { current: 0, max: 12 } };

  return level;
}

function constructProblem(numRow, numLanes) {
  var lanes = [];
  for (var i = 0; i < numLanes; i++) {
    var lane = [];
    for (var j = 0; j < numRow; j++) {
      lane[j] = { num: 1, color: 1 };
    }
    lanes.push(lane);
  }

  return lanes;
}


function insertTiles(lanes, spot, color) {
  lanes[spot[0].x][spot[0].y] = { color: color, num: color };
  lanes[spot[1].x][spot[1].y] = { color: color, num: color };
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

function drawLevel(level) {
  wdx = window.innerWidth / level.lanes.length;
  scoreHeight = window.innerHeight * 0.96;
  wdy = (window.innerHeight * 0.95) / level.lanes[0].length;
  for (var i = 0; i < level.lanes.length; i++) {
    if (lanePosX == i)
      drawLane(i, level.lanes.length, laneDX, laneDY, level.lanes[i])
    else
      drawLane(i, level.lanes.length, laneDX, 0, level.lanes[i]);
  }
  drawScore(level.score);
}

function drawScore(score) {
  
}

function drawLane(place, lanesNum, dx, dy, lane) {
  for (var i = 0; i < lane.length; i++) {
    var ddx = 0;
    if (i == lanePosY) {
      ddx = dx;
    }
    drawCell(place, i, ddx, dy, lane[i]);
  }
}

function drawCell(px, py, dx, dy, cell) {
  col = color(colorMap[cell.color]);
  noStroke();
  fill(col);
  rect(px * wdx + dx + 2, py * wdy + dy + 2, wdx - 4, wdy - 4, 5);
  drawSymbol(px, py, dx, dy, cell.symbol);
}

function drawSymbol(px, py, dx, dy, symbol) {
  //rocket
  if (symbol.rocket) {
    drawArrow(symbol.direction)0

  }
}


function draw() {

  resizeCanvas(windowWidth, windowHeight);
  background(colorMap[0]);
  drawLevel(levels[currentLevel])
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
  const deltaX = round((laneDX) / wdx);
  const deltaY = round((laneDY) / wdy);

  if (deltaY == 0 && deltaX == 0)
    return;


}

function touchEnded() {
  //removeColor(levels[currentLevel]);
  //removeColor(levels[currentLevel]);

  const deltaX = round((mouseX - mousepos.x) / wdx);
  const deltaY = round((mouseY - mousepos.y) / wdy);


  if (deltaX != 0 || deltaY != 0) {
    levels[currentLevel].score.current -= 2;
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

  if (levels[currentLevel].done) {
    levels[currentLevel] = createLevel(6, 8);

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
