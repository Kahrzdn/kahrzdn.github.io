const colorMap = [
  "#000000",
  "#be1e2d",
  "#ffde17",
  "#ffffff",
  "#21409a"
/* rainbow
  "#ff0000",
  "#ffa500",
  "#ffff00",
  "#008000",
  "#0000ff",
  "#4b0082",
  "#ee82ee"
 */]

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
}

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

function drawBrick(px, py, dy, colNum) {
  col = colorMap[colNum];
  noStroke();
  fill(col);
  rect(px * wdx + 1, py * wdy + dy + 1, wdx - 2, wdy - 2);
}

function draw() {
  background(255);
  drawLevel(levels[currentLevel])
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

}

var mousepos = { x: -1, y: -1 }
function arrayRotate(arr, reverse) {
  if (reverse) arr.unshift(arr.pop());
  else arr.push(arr.shift());
  return arr;
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