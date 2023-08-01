const colorMap = [
  "#000000",
  "#be1e2d",
  "#ffde17",
  "#ffffff",
  "#21409a",
  "#ff0000",
  "#ffa500",
  "#ffff00",
  "#008000",
  "#0000ff",
  "#4b0082",
  "#ee82ee"
]

var levels = [{
  lanes:

    [[0, 3, 4, 1, 2, 0, 1],
    [0, 1, 1, 2, 3, 3, 1],
    [2, 3, 4, 1, 2, 4, 2],
    [0, 1, 3, 3, 4, 3, 1],
    [0, 1, 2, 3, 4, 2, 1]
    ]


},
{
  lanes:
    [[0, 1, 2, 0, 0, 2, 1, 2],
    [0, 0, 0, 0, 0, 2, 1, 2],
    [0, 1, 2, 0, 0, 2, 1, 2]]
},
]

var currentLevel = 0;
var wdx;
var wdy;

function setup() {
  createCanvas(windowWidth, windowHeight);
  levels[0] = createLevel(3 + floor(random(5)), 3 + floor(random(7)), 30 + floor(random(70)));
}

function createLevel(numRow, numLanes, complexity) {
  console.log("nr:" + numRow + " nl:" + numLanes + " c:" + complexity);
  var lanes = [];
  for (var i = 0; i < numRow; i++) {
    var lane = [];

    if (random(100) > complexity) {
      //mono
      lane = Array(numLanes).fill(floor(random(numLanes)))
    }
    else {
      lane = shuffle([...Array(numLanes).keys()]);
    }
    lanes.push(lane);
  }
  //  transpose lanes;
  lanes = lanes.reduce((prev, next) =>
    next.map((item, i) =>
      (prev[i] || []).concat(next[i])
    ), []);
  for (var i = 0; i < lanes.length; i++) {
    lanes[i] = arrayRotateNum(lanes[i], floor(random(lanes[i].length)));
  }
  return { lanes: lanes };
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
};

function drawLevel(level) {
  wdx = windowWidth / level.lanes.length;
  wdy = windowHeight / level.lanes[0].length;
  for (var i = 0; i < level.lanes.length; i++) {
    if (lanePos == i)
      drawLane(i, laneDY, level.lanes[i])
    else
      drawLane(i, 0, level.lanes[i]);
  }
}

function drawLane(place, dy, lane) {
  for (var i = 0; i < lane.length; i++) {
    drawBrick(place, i, dy, lane[i]);
  }
}

function drawBrick(px, py, dy, colorNum) {
  col = color(colorMap[colorNum]);
  noStroke();
  fill(col);
  rect(px * wdx + 2, py * wdy + dy + 2, wdx - 4, wdy - 4);
}

function draw() {
  background(245);
  drawLevel(levels[currentLevel])
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

}

var mousepos = { x: -1, y: -1 }

function arrayRotateNum(arr, num) {
  for (var i = 0; i < num; i++) {
    arr = arrayRotate(arr, false);
  }
  return arr;
}

function arrayRotate(arr, reverse) {
  if (reverse) arr.unshift(arr.pop());
  else arr.push(arr.shift());
  return arr;
}

function checkLanes(level) {

}


var laneDY = 0;
var lanePos = 0;

function touchStarted() {
  mousepos.x = mouseX;
  mousepos.y = mouseY;
  let fs = fullscreen();
  if (!fs) fullscreen(!fs);
}

function touchMoved() {
  laneDY = mouseY - mousepos.y;
  lanePos = floor(mousepos.x / wdx);
  const deltaY = round((mouseY - mousepos.y) / wdy);

  console.log("dssd" + lanePos)
  if (deltaY == 0)
    return;


}

function touchEnded() {
  const deltaY = round((mouseY - mousepos.y) / wdy);

  console.log("dssd" + lanePos)
  if (deltaY < 0) {
    for (var i = 0; i < -deltaY; i++) {
      arrayRotate(levels[currentLevel].lanes[lanePos], false);
    }
  }
  if (deltaY > 0) {
    for (var i = 0; i < deltaY; i++) {
      arrayRotate(levels[currentLevel].lanes[lanePos], true);
    }
  }
  laneDY = 0;
  checkLanes(levels[currentLevel]);
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