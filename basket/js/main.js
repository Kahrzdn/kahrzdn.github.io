'use strict';


// Put variables in global scope to make them available to the browser console.
var video = document.querySelector('video');
var constraints = window.constraints = {
    audio: false,
    video: true
};
var errorElement = document.querySelector('#errorMsg');
var nav = ( navigator.mediaDevices.getUserMedia ||
navigator.mediaDevices.webkitGetUserMedia ||
navigator.mediaDevices.mozGetUserMedia ||
navigator.mediaDevices.msGetUserMedia);

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'phaser', {
    preload: preload,
    create: create,
    render: render,
    update: update
});

var emitter;
var videoFrame;
var videoTexture;
var map;
var fingers = [];
var ball;
var netl;
var netr;
var delta = 4;
var score = 0;
var scoreText;
var fingerNum = 35;
var fx;

function preload() {

    game.load.image('basketball', 'media/basketball.png');
    game.load.image('netl', 'media/netl.png');
    game.load.image('netr', 'media/netr.png');

    game.load.image('finger', 'media/finger.png');
    game.load.physics("sprite_physics", "media/shapes.json");
    game.load.bitmapFont('gem', 'media/gem.png', 'media/gem.xml');
}

function create() {
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 1000;
    game.physics.p2.restitution = 1.01;

    game.stage.backgroundColor = '#000000';

    videoFrame = game.add.sprite(0, 0);
    //var greyFilter = new PIXI.GreyFilter();

// set the filter
    //videoFrame.filters = [greyFilter];

    game.world.setBounds(0, 0, game.camera.width, game.camera.height);


    scoreText = game.add.bitmapText(200, 200, 'gem', "SCORE: " + score, 48);
    startLevel();
}

function startLevel() {
    createBall();
    createFingers();
    createNet();

}

function createBall() {
    ball = game.add.sprite(game.camera.width / 2, game.camera.height / 2, 'basketball');
    ball.anchor.setTo(0.5, 0.5);
    game.physics.p2.enable(ball);
    ball.body.setCircle(40);
    ball.body.collideWorldBounds = true;
    ball.body.mass = 100;
    ball.body.fixedRotation = false;
    ball.body.gravity.y = 1000;

    ball.body.velocity.x = 2000 * (Math.random() - 0.5);
    ball.body.velocity.y = 1000;

    ball.scale.setTo(0.1, 0.1);
}

function createFingers() {
    for (var i = 0; i < fingerNum; i++) {
        var finger = game.add.sprite(i * (game.camera.width) / fingerNum, 70 * Math.sin(10 * i / fingerNum) + game.camera.height, 'finger');
        var col = Phaser.Color.HSLtoRGB(0, 255, 256 * i / fingerNum);

        finger.tint = col.r * 256 * 256 + col.g * 256 + col.b;
        finger.anchor.setTo(0, 0);
        finger.scale.setTo(1, 1);
        game.physics.p2.enable(finger);
        finger.body.static = true;
        finger.body.clearShapes();

        // Add our PhysicsEditor bounding shape
        finger.body.loadPolygon("sprite_physics", "finger");

        fingers.push(finger);
    }
}

function createNet() {
    netl = game.add.sprite(0, game.camera.height / 4, 'netl');
    netl.position.x = netl.width / 2;
    game.physics.p2.enable(netl);
    netl.body.static = true;
    netl.body.clearShapes();
    netl.body.loadPolygon("sprite_physics", "netl");

    netr = game.add.sprite(game.camera.width, game.camera.height / 4, 'netr');
    netr.position.x = game.camera.width - netr.width / 4;
    game.physics.p2.enable(netr);
    netr.body.static = true;
    netr.body.clearShapes();
    netr.body.loadPolygon("sprite_physics", "netr");

}

function render() {
    drawVideo();
    blend();
    updateMovement();
    scoreText.x = game.camera.x + 10;
    scoreText.y = 0;
    scoreText.text = "SCORE: " + score;

}

function update() {
    updateFingers();
    fingers[0].body.x = game.input.activePointer.position.x;
    fingers[0].body.y = game.input.activePointer.position.y;
    game.physics.arcade.collide(ball, fingers);
    //netr.anchor.x = 1;

}


function change(a, b) {
    // console.log("dsd");
}

function addToFinger(index, value) {
    fingers[index].body.y = Math.max(game.camera.height - fingers[index].height * 0.5, fingers[index].body.y - 190 * value);

}

function updateFingers() {
    for (var i = 0; i < fingers.length; i++) {
        fingers[i].body.y = Math.min(game.camera.height + 50, fingers[i].body.y + 2);

    }
}


nav(constraints)
    .then(function (stream) {
        var videoTracks = stream.getVideoTracks();
        initialize();
        console.log('Got stream with constraints:', constraints);
        console.log('Using video device: ' + videoTracks[0].label);

        stream.onended = function () {
            console.log('Stream ended');
        };
        window.stream = stream; // make variable available to browser console
        video.srcObject = stream;
    })
    .catch(function (error) {
        if (error.name === 'ConstraintNotSatisfiedError') {
            errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
                constraints.video.width.exact + ' px is not supported by your device.');
        } else if (error.name === 'PermissionDeniedError') {
            errorMsg('Permissions have not been granted to use your camera and ' +
                'microphone, you need to allow the page access to your devices in ' +
                'order for the demo to work.');
        }
        errorMsg('getUserMedia error: ' + error.name, error);
    });

function errorMsg(msg, error) {
    errorElement.innerHTML += '<p>' + msg + '</p>';
    if (typeof error !== 'undefined') {
        console.error(error);
    }
}

var lastImageData;
var canvasSource = document.getElementById("canvas-source");
var canvasBlended = document.getElementById("canvas-blended");
var canvasVideo = document.getElementById("canvas-video");
canvasSource.width = 100;
canvasSource.height = 100;
canvasBlended.width = 100;
canvasBlended.height = 100;
canvasVideo.width = window.innerWidth;
canvasVideo.height = window.innerHeight;
var contextSource = canvasSource.getContext('2d');
var contextBlended = canvasBlended.getContext('2d');
var contextVideo = canvasVideo.getContext('2d');

// mirror video
contextSource.translate(canvasSource.width, 0);
contextSource.scale(-1, 1);
contextVideo.translate(canvasVideo.width, 0);
contextVideo.scale(-1, 1);
var c = 5;

function initialize() {
    start();
}

function start() {
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


function drawVideo() {
    contextSource.drawImage(video, 0, 0, canvasSource.width, canvasSource.height);//video.width, video.height);
    contextVideo.drawImage(video, 0, 0, canvasVideo.width, canvasVideo.height);//video.width, video.height);
    videoTexture = PIXI.Texture.fromCanvas(canvasVideo);
    videoFrame.loadTexture(videoTexture);
}

function blend() {
    var width = canvasSource.width;
    var height = canvasSource.height;
    // get webcam image data
    var sourceData = contextSource.getImageData(0, 0, width, height);
    // create an image if the previous image doesn’t exist
    if (!lastImageData) lastImageData = contextSource.getImageData(0, 0, width, height);
    // create a ImageData instance to receive the blended result
    var blendedData = contextSource.createImageData(width, height);
    //var diffData = contextSource.createImageData(width, height);
    // blend the 2 images
    differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
    // draw the result in a canvas
    contextBlended.putImageData(blendedData, 0, 0);
    //contextVideo.putImageData(diffData, 0, 0);
    lastImageData = sourceData;
}

function fastAbs(value) {
    // funky bitwise, equal Math.abs
    return (value ^ (value >> 31)) - (value >> 31);
}

function threshold(value) {
    //return (value > 0x15) ? 0xFF : 0;

    return (value > 0x15) ? value : 0;
}


function updateMovement() {
    var cols = computeColumns(contextBlended.getImageData(0, 0, canvasSource.width, canvasSource.height), fingerNum);
    for (var i = 0; i < cols.length; i++) {

        addToFinger(i, cols[i]);
    }
}
function computeColumns(img_data, colNum) {

    var sum = 0;
    var cols = new Array(colNum);
    for (var i = 0; i < colNum; i++) {
        cols[i] = 0;
    }
    var colIndex;
    var i = 0;
    //console.log(img_data.width * img_data.height);
    while (i < img_data.width * img_data.height) {
        if (img_data.data[4 * i] > 0) {
            sum += img_data.data[4 * i];
            colIndex = Math.floor(colNum * (i % img_data.width) / img_data.width);
            cols[colIndex] += img_data.data[4 * i];
        }
        i += 1;
    }
    if (sum != 0) {
        for (var i = 0; i < colNum; i++) {
            cols[i] = cols[i] / sum;

        }
        var avg = Math.min(sum / colNum,0.1);
        var topSum = 0;
        for (var i = 0; i < colNum; i++) {
            if (cols[i] >= avg) {
                topSum += cols[i];
            }
            else {
                cols[i] = 0;
            }
        }
        if (topSum!=0) {
            for (var i = 0; i < colNum; i++) {
                cols[i] = cols[i] / topSum;
                if (isNaN(cols[i])) {
                    console.log(topSum);
                }

            }
        }

    }
    return cols;
}

function differenceAccuracy(target, data1, data2) {
    if (data1.length != data2.length) return null;
    var i = 0;
    while (i < (data1.length * 0.25)) {
        var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
        var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;
        //var diff = threshold(fastAbs(average1 - average2));
        var diff = threshold(fastAbs(average1 - average2));

        target[4 * i] = diff;
        target[4 * i + 1] = diff;
        target[4 * i + 2] = diff;
        target[4 * i + 3] = 0xFF;
        i += 1;
    }
}
