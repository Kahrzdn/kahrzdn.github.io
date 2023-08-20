import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import {
  TrackballControls
} from 'three/addons/controls/TrackballControls.js';
import {
  RoundedBoxGeometry
} from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

let container, stats;
let camera, controls, scene, renderer;
let pickingTexture, pickingScene;
let highlightBox;

const pickingData = [];

const pointer = new THREE.Vector2();
const offset = new THREE.Vector3(10, 10, 10);
const clearColor = new THREE.Color();

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

//test

var levels = [{
    lanes:

      [
        [0, 3, 4, 1, 2, 0, 1],
        [0, 1, 1, 2, 3, 3, 1],
        [2, 3, 4, 1, 2, 4, 2],
        [0, 1, 3, 3, 4, 3, 1],
        [0, 1, 2, 3, 4, 2, 1]
      ]


  },
  {
    lanes: [
      [0, 1, 2, 0, 0, 2, 1, 2],
      [0, 0, 0, 0, 0, 2, 1, 2],
      [0, 1, 2, 0, 0, 2, 1, 2]
    ]
  },
]

var currentLevel = 0;
var wdx;
var wdy;

init();
animate();

function applyId(geometry, id) {

  const position = geometry.attributes.position;
  const array = new Int16Array(position.count);
  array.fill(id);

  const bufferAttribute = new THREE.Int16BufferAttribute(array, 1, false);
  bufferAttribute.gpuType = THREE.IntType;
  geometry.setAttribute('id', bufferAttribute);

}

function applyVertexColors(geometry, color) {

  const position = geometry.attributes.position;
  const colors = [];

  for (let i = 0; i < position.count; i++) {

    colors.push(color.r, color.g, color.b);

  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

}

function init() {



  container = document.getElementById('container');

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 1000;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  scene.add(new THREE.AmbientLight(0xcccccc));

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(0, 500, 2000);
  scene.add(light);

  const defaultMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    flatShading: true,
    vertexColors: true,
    shininess: 0
  });

  // set up the picking texture to use a 32 bit integer so we can write and read integer ids from it
  pickingScene = new THREE.Scene();
  pickingTexture = new THREE.WebGLRenderTarget(1, 1, {

    type: THREE.IntType,
    format: THREE.RGBAIntegerFormat,
    internalFormat: 'RGBA32I',

  });
  const pickingMaterial = new THREE.ShaderMaterial({

    glslVersion: THREE.GLSL3,

    vertexShader: /* glsl */ `
						attribute int id;
						flat varying int vid;
						void main() {

							vid = id;
							gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

						}
					`,

    fragmentShader: /* glsl */ `
						layout(location = 0) out int out_id;
						flat varying int vid;

						void main() {

							out_id = vid;

						}
					`,

  });


  var r = Math.floor(Math.random() * 6);


  const geometries = [];
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const color = new THREE.Color();

  levels[0] = createLevel(geometries,matrix,quaternion,color,3 + r, 3 + (6 - r), 30 + Math.floor(Math.random()*70));


  for (let i = 0; i < 5; i++) {

    const geometry = new RoundedBoxGeometry(1, 1, 1, 7, 0.2);

    const position = new THREE.Vector3();
    position.x = Math.random() * 10000 - 5000;
    position.y = Math.random() * 6000 - 3000;
    position.z = Math.random() * 8000 - 4000;

    const rotation = new THREE.Euler();
    rotation.x = Math.random() * 2 * Math.PI;
    rotation.y = Math.random() * 2 * Math.PI;
    rotation.z = Math.random() * 2 * Math.PI;

    const scale = new THREE.Vector3();
    scale.x = Math.random() * 200 + 100;
    scale.y = Math.random() * 200 + 100;
    scale.z = Math.random() * 200 + 100;

    quaternion.setFromEuler(rotation);
    matrix.compose(position, quaternion, scale);

    geometry.applyMatrix4(matrix);

    // give the geometry's vertices a random color to be displayed and an integer
    // identifier as a vertex attribute so boxes can be identified after being merged.
    applyVertexColors(geometry, color.setHex(Math.random() * 0xffffff));
    applyId(geometry, i);

    geometries.push(geometry);

    /*pickingData[ i ] = {

    	position: position,
    	rotation: rotation,
    	scale: scale

    };*/

  }

  const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
  scene.add(new THREE.Mesh(mergedGeometry, defaultMaterial));
  pickingScene.add(new THREE.Mesh(mergedGeometry, pickingMaterial));

  highlightBox = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshLambertMaterial({
      color: 0xffff00
    })
  );
  scene.add(highlightBox);

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  controls = new TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  stats = new Stats();
  container.appendChild(stats.dom);

  renderer.domElement.addEventListener('pointermove', onPointerMove);

}

//

function onPointerMove(e) {

  pointer.x = e.clientX;
  pointer.y = e.clientY;

}

function animate() {

  requestAnimationFrame(animate);

  render();
  stats.update();

}

function pick() {

  // render the picking scene off-screen
  // set the view offset to represent just a single pixel under the mouse
  const dpr = window.devicePixelRatio;
  camera.setViewOffset(
    renderer.domElement.width, renderer.domElement.height,
    Math.floor(pointer.x * dpr), Math.floor(pointer.y * dpr),
    1, 1
  );

  // render the scene
  renderer.setRenderTarget(pickingTexture);

  // clear the background to - 1 meaning no item was hit
  clearColor.setRGB(-1, -1, -1);
  renderer.setClearColor(clearColor);
  renderer.render(pickingScene, camera);

  // clear the view offset so rendering returns to normal
  camera.clearViewOffset();

  // create buffer for reading single pixel
  const pixelBuffer = new Int32Array(4);

  // read the pixel
  renderer.readRenderTargetPixels(pickingTexture, 0, 0, 1, 1, pixelBuffer);

  const id = pixelBuffer[0];
  if (id !== -1) {

    // move our highlightBox so that it surrounds the picked object
    const data = pickingData[id];
    highlightBox.position.copy(data.position);
    highlightBox.rotation.copy(data.rotation);
    highlightBox.scale.copy(data.scale).add(offset);
    highlightBox.visible = true;

  } else {

    highlightBox.visible = false;

  }

}

function render() {

  controls.update();

  pick();

  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

}




function createLevel(geometries, matrix, quaternion, color, numRow, numLanes, complexity) {
  console.log("nr:" + numRow + " nl:" + numLanes + " c:" + complexity);
  var lanes = [];
  for (var i = 0; i < numRow; i++) {
    var lane = [];

    if (Math.random() * 100 > complexity) {
      //mono
      lane = Array(numLanes).fill(Math.floor(Math.random() * numLanes))
    } else {
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
    lanes[i] = arrayRotateNum(lanes[i], Math.floor(Math.random() * lanes[i].length));
  }

  let c = 0;
  for (let i = 0; i < lanes.length; i++) {
    for (let j = 0; j < lanes[i].length; j++) {

      const geometry = new RoundedBoxGeometry(1, 1, 1, 7, 0.2);

      const position = new THREE.Vector3();
      position.x = (i - lanes.length / 2 + 0.5) * 1100;
      position.y = (j - lanes[i].length / 2 + 0.5) * 1100;
      position.z = -4000;

      const rotation = new THREE.Euler();
      rotation.x = 0;
      rotation.y = 0;;
      rotation.z = 0;;

      const scale = new THREE.Vector3();
      scale.x = 1000;
      scale.y = 1000;
      scale.z = 1000;

      quaternion.setFromEuler(rotation);
      matrix.compose(position, quaternion, scale);

      geometry.applyMatrix4(matrix);

      // give the geometry's vertices a random color to be displayed and an integer
      // identifier as a vertex attribute so boxes can be identified after being merged.
      applyVertexColors(geometry,  color.setHex(parseInt(colorMap[lanes[i][j]].substring(1),16)));//;color.setHex(Math.random() * 0xffffff));
      applyId(geometry, i);

      geometries.push(geometry);

      pickingData[c] = {

        position: position,
        rotation: rotation,
        scale: scale

      };
      c++;

    }
  }
  return {
    lanes: lanes,
    checkRows: Array(numRow).fill(false)
  };
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
};

function drawLevel(level) {
  wdx = windowWidth / level.lanes.length;
  wdy = windowHeight / level.lanes[0].length;
  for (var i = 0; i < level.lanes.length; i++) {
    if (lanePos == i)
      drawLane(i, laneDY, level.lanes[i], level.checkRows)
    else
      drawLane(i, 0, level.lanes[i], level.checkRows);
  }
}

function drawLane(place, dy, lane, checkRows) {
  for (var i = 0; i < lane.length; i++) {
    console.log(checkRows[i]);
    drawBrick(place, i, dy, lane[i], checkRows[i]);
  }
}

function drawBrick(px, py, dy, colorNum, check) {
  col = color(colorMap[colorNum]);
  noStroke();
  if (check) {
    fill(sin(py + -px / 4 + frameCount / 10) * 128 + 128);
    rect(px * wdx, py * wdy + dy, wdx, wdy);
  }
  fill(col);
  rect(px * wdx + 2, py * wdy + dy + 2, wdx - 4, wdy - 4);
}

function draw() {
  background(245);
  resizeCanvas(windowWidth, windowHeight);
  drawLevel(levels[currentLevel])
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

}

var mousepos = {
  x: -1,
  y: -1
}

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
  var lanes = level.lanes;
  var doneCheck = true;
  for (var i = 0; i < lanes[0].length; i++) {
    var checkRow = Array(lanes.length).fill(0);
    for (var j = 0; j < lanes.length; j++) {
      checkRow[lanes[j][i]]++;
    }
    check = true;
    for (var j = 0; j < lanes.length; j++) {
      if (![0, 1, lanes.length].includes(checkRow[j])) {
        check = false;
      }
    }
    level.checkRows[i] = check;
    doneCheck = doneCheck & check;
  }
  level.done = doneCheck;
}


var laneDY = 0;
var lanePos = 0;

function touchStarted() {
  mousepos.x = mouseX;
  mousepos.y = mouseY;
  resizeCanvas(windowWidth, windowHeight);
}

function touchMoved() {
  laneDY = mouseY - mousepos.y;
  lanePos = Math.floor(mousepos.x / wdx);
  const deltaY = Math.round((mouseY - mousepos.y) / wdy);

  console.log("dssd" + lanePos)
  if (deltaY == 0)
    return;


}

function touchEnded() {
  if (levels[currentLevel].done) {
    var r = floor(Math.random() * 8);
    levels[currentLevel] = createLevel(3 + r, 3 + (8 - r), 30 + Math.floor(Math.random() * 70));

    return;
  }
  const deltaY = Math.round((mouseY - mousepos.y) / wdy);

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