var colorMap = [
  "#020202",
  "#000000",
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
var score = { current: 10, max: 10 };

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

  /* var lanes = [];
   var c = 4;
   for (var i = 0; i < numRow; i++) {
     var lane = [];
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
         c = 4;
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
   lanes = m;
   */
  var checkRows = [];
  for (let i = 0; i < numRow; i++) {
    checkRows[i] = { check: false };
  }
  var level = { lanes: lanes, checkRows, score: { current: round(maxColors / 4), max: round(maxColors / 2) } };
  console.log(level.score)
  checkLanes(level);
  console.log(level.score)
  level.score.current = 0;//round(maxColors / 4);

  if (level.done) {
    level = createLevel(numRow, numLanes);
  }


  return level;
}

function constructProblem(numRow, numLanes) {
  const orgMaxColors = maxColors;
  for (var n = 0; n < 900; n++) {
    maxColors = orgMaxColors;
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

      console.log("maxcolors " + maxColors)
    }
    succes = false;
  }

  if (!succes)
    console.log("not possible")

  return lanes;
}

function constructNextMatch(matrix, numRow, numLanes, color) {

  if (color > maxColors) {
    console.log("success")
    return true;
  }

  var spot = [{}, {}];
  if (!tryfindTwinSpot(matrix, numRow, numLanes, spot)) {
    //maxColors = color - 1;
    console.log(color + "give up")
    logMatrix(matrix)
    return false;
  }
  // logMatrix(matrix);
  // console.log(spot);
  insertTiles(matrix, spot, color);
  // logMatrix(matrix);
  shiftTiles(matrix, numRow, numLanes, spot);
  color = color + 1;
  //console.log("next:" + color)
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
  //hmmmm
  console.log("spooky spot");
  console.log(spot)
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
  scoreHeight = window.innerHeight*0.95  ;
  wdy = (window.innerHeight*0.9) / level.lanes[0].length;
  for (var i = 0; i < level.lanes.length; i++) {
    if (lanePosX == i)
      drawLane(i, level.lanes.length, laneDX, laneDY, level.lanes[i], level.checkRows)
    else
      drawLane(i, level.lanes.length, laneDX, 0, level.lanes[i], level.checkRows);
  }
  drawScore(level.score);
}

function drawScore(score) {
  for (var i = 0; i < score.max; i++) {
    var x = 3 + i * window.innerWidth / score.max;
    var y = scoreHeight;
    noFill();
    stroke(0, 0, 0, 80);
    rect(x + 0.04 * window.innerWidth / score.max, y + 0.04 * window.innerWidth / score.max, 0.8 * window.innerWidth / score.max, 0.02 * window.innerWidth);
    stroke(colorMap[3]);
    rect(x + 0.0 * window.innerWidth / score.max, y, 0.8 * window.innerWidth / score.max, 0.02 * window.innerWidth);

    if (score.current >  i) {
      fill(0, 0, 0, 80);
      rect(x + 0.04 * window.innerWidth / score.max, y + 0.04 * window.innerWidth / score.max, 0.8 * window.innerWidth / score.max, 0.02 * window.innerWidth);
      fill(colorMap[3]);
      rect(x + 0.0 * window.innerWidth / score.max, y, 0.8 * window.innerWidth / score.max, 0.02 * window.innerWidth);
    }
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
  var doneCheck = true;

  var sl = "";
  for (var i = 0; i < lanes.length; i++) {
    var prev = lanes[i][0].num
    for (var j = 1; j < lanes[i].length; j++) {
      var cell = lanes[i][j].num;
      if (cell > 1) {
        if (prev == cell) {
          console.log(cell)
          lanes[i][j - 1] = { color: 1, num: 1 };
          lanes[i][j] = { color: 1, num: 1 };
          level.score.current+=2;
          console.log("1: +2 "+i + " "+ j + " "+ level.score.current);
          refillColor(level);
          refillColor(level);
          refillColor(level);

        }
        else {
          doneCheck = false;
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
          console.log(cell)
          lanes[i - 1][j] = { color: 1, num: 1 };
          lanes[i][j] = { color: 1, num: 1 };
          level.score.current+=2;
          console.log("2: +2 "+i + " "+ j + " "+ level.score.current);

          refillColor(level);
          refillColor(level);
          refillColor(level);
        }
        else {
          doneCheck = false;
        }

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


  if (deltaX!=0 || deltaY!=0) {
    levels[currentLevel].score.current--;
    console.log(levels[currentLevel].score.current)
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

  console.log(levels[currentLevel])
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
