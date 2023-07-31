const colorMap = [{r:80,g:80,b:80},{r:140,g:140,b:140},{r:200,g:200,b:200}]

var levels = [{lanes:
  [[0,1,2,0,0,2,0,2],
  [1,2,0,0,2,1,2,0],
  [2,0,0,2,1,2,0,1]]},
  {lanes:
    [[0,1,2,0,0,2,1,2],
    [0,0,0,0,0,2,1,2],
    [0,1,2,0,0,2,1,2]]},
]

var currentLevel=0;
var wdx;
var wdy;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function drawLevel(level) {
  wdx=windowWidth/level.lanes.length;
  wdy=windowHeight/level.lanes[0].length;
  if (lanePos==0)
     drawLane(0,laneDY,level.lanes[0])
  else 
     drawLane(0,0,level.lanes[0]);

  if (lanePos==1)
     drawLane(1,laneDY,level.lanes[1]);
  else 
     drawLane(1,0,level.lanes[1]);

  if (lanePos==2)
     drawLane(2,laneDY,level.lanes[2]);
  else 
     drawLane(2,0,level.lanes[2]);

}

function drawLane(place,dy,lane) {
  for(var i=0;i<lane.length;i++){
    drawBrick(place,i,dy,lane[i]);
  }
}

function drawBrick(px,py,dy,colNum){
  col=colorMap[colNum];
  fill(col.r,col.g,col.b)
  rect(px*wdx,py*wdy+dy,wdx,wdy);
}
  
function draw() {
  background(0);
  drawLevel(levels[currentLevel])
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

}

var mousepos = {x:-1,y:-1}
function arrayRotate(arr, reverse) {
  if (reverse) arr.unshift(arr.pop());
  else arr.push(arr.shift());
  return arr;
}

var laneDY=0;
var lanePos =0;

function touchStarted() {
  mousepos.x=mouseX;
  mousepos.y=mouseY; 
}

function touchMoved () {
  laneDY = mouseY-mousepos.y;
  lanePos = floor(mousepos.x/wdx);
}

function touchEnded() {
  const deltaY = round((mouseY-mousepos.y)/wdy);

  console.log("dssd"+lanePos)
  if (deltaY<0) {
    for(var i = 0;i<-deltaY;i++) {
      arrayRotate(levels[currentLevel].lanes[lanePos],false);  
    }
  }
  if (deltaY>0) {
    for(var i = 0;i<deltaY;i++) {
      arrayRotate(levels[currentLevel].lanes[lanePos],true);  
    }
  }
  laneDY=0;
} 

document.ontouchmove = function(event) {
  event.preventDefault();
};