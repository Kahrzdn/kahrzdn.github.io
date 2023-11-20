const colorMap = [
  "#222222",
  "#000000",
  "#999999",
  "#ffde17",
  "#21409a",
  "#ff0000",
  "#ffa500",
  "#ffff00",
  "#008000",
  "#0000ff",
  "#4b0082",
  "#ee82ee"
]

//test

var levels = []

var currentLevel = 0;
var wdx;
var wdy;
var ww;
var wh;
var maxColors = 26;

function setup() {
  ww = windowWidth;
  wh = windowHeight;
  createCanvas(ww, ww);

  levels[0] = createLevel(6, 8);
}

function createLevel(numRow, numLanes) {
  const hue = 0;
  const saturation = 70 + round(random(20));
  for (var i = 3; i <= maxColors; i++) {
    colorMap[i] = color('hsl(' + floor(hue + (360 / maxColors) * i) + ', ' + saturation + '%, ' + (30+(i*10)%70) + '%)');
  }

  var lanes = [];
  var c = 3;
  for (var i = 0; i < numRow; i++) {
    lane = [];
    for (var j = 0; j < numLanes; j++) {
      lane[j] = {};
    }
    for (j = 0; j < numLanes; j += 2) {
      lane[j].color = c;
      lane[j].num = c;
      lane[j + 1].color = c;
      lane[j + 1].num = c;
      c++;
      if (c > maxColors)
        c = 3;
    }

    lanes.push(shuffle(lane));
  }
  //  transpose lanes;
  lanes = lanes.reduce((prev, next) =>
    next.map((item, i) =>
      (prev[i] || []).concat(next[i])
    ), []);
  for (var i = 0; i < lanes.length; i++) {
    lanes[i] = arrayRotateColNum(lanes[i], floor(random(lanes[i].length)));
  }
  var checkRows = [];
  for (let i = 0; i < numRow; i++) {
    checkRows[i] = { check: false };
  }
  var level = { lanes: lanes, checkRows }
  checkLanes(level);
  if (level.done) {
    level = createLevel(numRow, numLanes);
  }
  return level;
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
  wdy = window.innerHeight / level.lanes[0].length;
  for (var i = 0; i < level.lanes.length; i++) {
    if (lanePosX == i)
      drawLane(i, level.lanes.length, laneDX, laneDY, level.lanes[i], level.checkRows)
    else
      drawLane(i, level.lanes.length, laneDX, 0, level.lanes[i], level.checkRows);
  }
}

function drawLane(place, lanesNum, dx, dy, lane, checkRows) {
  for (var i = 0; i < lane.length; i++) {
    var ddx = 0;
    if (i == lanePosY) {
      ddx = dx;
    }
    drawBrick(place, i, ddx, dy, lane[i], checkRows[i]);
    if (dy > 0) {
      drawBrick(place, i, 0, -lane.length * wdy + dy, lane[i], checkRows[i])
    }
    if (dy < 0) {
      drawBrick(place, i, 0, lane.length * wdy + dy, lane[i], checkRows[i])
    }
    if (ddx > 0) {
      drawBrick(place, i, -lanesNum * wdx + ddx, 0, lane[i], checkRows[i])
    }
    if (ddx < 0) {
      drawBrick(place, i, lanesNum * wdx + ddx, 0, lane[i], checkRows[i])
    }

  }
}

function drawBrick(px, py, dx, dy, cell, checkRow) {
  col = color(colorMap[cell.color]);
  noStroke();
  if (checkRow.check) {
    console.log(checkRow);
    const checkDur = new Date().getTime() - checkRow.time;
    angle = 0 - checkDur / 100 - 0.5 * py - 2 * px;
    if (angle > -3 * PI || angle < -5 * PI)
      angle = -3 * PI;

    const fy = wdy * sin(angle) / 8;

    const fx = wdx * (1 + cos(angle)) / 4;
    const indentx = -0.5
    const indenty = 1

    fill(col);

    const x1 = +indentx + px * wdx + dx + fx;
    const y1 = +indenty + py * wdy + dy + fy;
    const x2 = -indentx + px * wdx + dx - fx + wdx;
    const y2 = +indenty + py * wdy + dy - fy;
    const x3 = -indentx + px * wdx + dx - fx + wdx;
    const y3 = -indenty + py * wdy + dy + fy + wdy;
    const x4 = +indentx + px * wdx + dx + fx;
    const y4 = -indenty + py * wdy + dy - fy + wdy;
    quad(x1, y1, x2, y2, x3, y3, x4, y4);

  }
  else {
    fill(col);
    rect(px * wdx + dx + 2, py * wdy + dy + 2, wdx - 4, wdy - 4);
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

function arrayRotateRowNum(arr, num) {
  for (var i = 0; i < num; i++) {
    arr = arrayRotateRow(arr, false);
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
  var doneCheck = true;

  var sl = "";
  for (var i = 0; i < lanes.length; i++) {
    var prev = lanes[i][0].num
    for (var j = 1; j < lanes[i].length; j++) {
      var cell = lanes[i][j].num;
      if (cell > 1)
        doneCheck = false;
      if (cell > 1 && prev == cell) {
        console.log(cell)
        lanes[i][j - 1] = { color: 1, num: 1 };
        lanes[i][j] = { color: 1, num: 1 };
        refillColor(level);
        refillColor(level);
        refillColor(level);

      }
      prev = cell;
    }
  }
  for (var j = 0; j < lanes[0].length; j++) {
    var prev = lanes[0][j].num
    for (var i = 1; i < lanes.length; i++) {
      var cell = lanes[i][j].num;
      if (cell > 1 && prev == cell) {
        console.log(cell)
        lanes[i - 1][j] = { color: 1, num: 1 };
        lanes[i][j] = { color: 1, num: 1 };
        refillColor(level);
        refillColor(level);
        refillColor(level);

      }

      prev = cell;
    }
  }

  level.done = doneCheck;

}


var laneDX = 0;
var laneDY = 0;
var lanePosX = 0;
var lanePosY = 0;

function touchStarted() {
  mousepos.x = mouseX;
  mousepos.y = mouseY;
  resizeCanvas(windowWidth, windowHeight);
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
  removeColor(levels[currentLevel]);
  removeColor(levels[currentLevel]);
  if (levels[currentLevel].done) {
    levels[currentLevel] = createLevel(6, 8);

    return;
  }
  var deltaX = round((mouseX - mousepos.x) / wdx);
  const deltaY = round((mouseY - mousepos.y) / wdy);



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
  console.log(levels[currentLevel])
}

function touchHandler(event) {
  if (event.touches.length > 1) {
    //the event is multi-touch
    //you can then prevent the behavior
    event.preventDefault()
  }
}

/*
function mousePressed(event) {
  if (mouseX > 0 && mouseX < 10 && mouseY > 0 && mouseY < 10) {
    let fs = fullscreen();
    fullscreen(!fs);
  }
  return false;
}*/

document.ontouchmove = function (event) {
  event.preventDefault();
};