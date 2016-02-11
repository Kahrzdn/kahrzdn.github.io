/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

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
var delta = 4;
var score = 0;
var scoreText;
var fingerNum = 35;
var fx;

function preload() {

    game.load.image('basketball', 'media/basketball.png');
    game.load.image('finger', 'media/finger.png');

    game.load.image('tiles', 'media/tileset.png');
    game.load.tilemap('tilemap', 'media/tileset.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('sheet', 'media/tileset.png', 23, 23, 30 * 20);
    game.load.bitmapFont('gem', 'media/gem.png', 'media/gem.xml');
    game.load.audio('sfx', 'media/fx_mixdown.ogg');
    game.load.physics("sprite_physics", "media/fingerph.json");
}

function create() {
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 1000;
    game.physics.p2.restitution = 0.8;

    game.stage.backgroundColor = '#000000';

    videoFrame = game.add.sprite(0, 0);

    fx = game.add.audio('sfx');
    fx.allowMultiple = true;
    fx.addMarker('ping', 10, 1.0);

    map = game.add.tilemap('tilemap');
    game.world.setBounds(0, 0, game.camera.width, game.camera.height);


    scoreText = game.add.bitmapText(200, 200, 'gem', "SCORE: " + score, 48);
    //scoreText.fixToCamera = true;
    emitter = game.add.emitter(game.world.centerX, game.world.centerY);


    //	false means don't explode all the sprites at once, but instead release at a rate of one particle per 100ms
    //	The 5000 value is the lifespan of each particle before it's killed
    // emitter.start(false, 900, 40);
    startLevel();
}

function startLevel() {
    createBall(200, 200);
    createFingers()

}

function createBall(x, y) {
    ball = game.add.sprite(x, y, 'basketball');

    //ball.animations.add('loop',frames,5+game.rnd.integerInRange(0,10),true,true);
//    npc.frame = 29;
    // ball.play('loop');
    ball.anchor.setTo(0.5, 0.5);
    //var body = game.physics.
    game.physics.p2.enable(ball);
    ball.body.setCircle(40);
    ball.body.collideWorldBounds = true;
    ball.body.fixedRotation = false;
    //ball.body.bounce.y = 1.0;
    ball.body.gravity.y = 1000;
    //  ball.body.angularVelocity = -450;
// ball.rotation = 10;

    ball.body.velocity.x = 100 * (Math.random() - 0.5);
    //ball.lives = ball.type + 1;
    ball.scale.setTo(0.1, 0.1);
}

function createFingers() {
    for (var i = 0; i < fingerNum; i++) {
        var finger = game.add.sprite(i * (game.camera.width) / fingerNum, 70 * Math.sin(10 * i / fingerNum) + game.camera.height, 'finger');

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
function render() {
    drawVideo();
    blend();
    showCenter();
    drawFingers();
    scoreText.x = game.camera.x + 10;
    scoreText.y = 0;
    scoreText.text = "SCORE: " + score;

}

function update() {
    updateFingers();

//    console.log(game.input.activePointer.position);

    fingers[0].body.x = game.input.activePointer.position.x;

    fingers[0].body.y = game.input.activePointer.position.y;

    game.physics.arcade.collide(ball, fingers);
    //if (npc && !npc.dead) {
    //game.physics.arcade.collide(emitter, npcs, hit, null, this);
    //game.physics.arcade.collide(npcs, layer, change, null, this);
    //}
    //game.physics.arcade.collide(emitter, layer, hitGround, null, this);
//
}


function change(a, b) {
    // console.log("dsd");
}

function addToFinger(x) {
    for (var i = 0; i < fingers.length; i++) {
        if (x >= fingers[i].body.x && x <= fingers[i].body.x + fingers[i].width) {
            fingers[i].body.y = Math.max(game.camera.height-fingers[i].height*0.5,fingers[i].body.y-20);
        }
    }
}

function updateFingers() {
    for (var i = 0; i < fingers.length; i++) {
        fingers[i].body.y = Math.min(game.camera.height+50, fingers[i].body.y+1);

    }
}

function drawFingers() {


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
    return (value > 0x15) ? 0xFF : 0;
}

function showCenter() {
    var c = computeCenter(contextBlended.getImageData(0, 0, canvasSource.width, canvasSource.height));
    // console.log(c.x);
    if (c.x && c.y && c.x !== 0 && c.y !== 0) {
        addToFinger(c.x);

        console.log(c.x);
    }
    else {
    }

}

function computeCenter(img_data) {
    var i = 0;
    var sum_x = 0;
    var sum_y = 0;
    var n = 0;
    //console.log(img_data.width * img_data.height);
    while (i < img_data.width * img_data.height) {
        if (img_data.data[4 * i] > 0) {
            n = n + 1;
            sum_x = sum_x + (i % img_data.width);
            sum_y = sum_y + Math.floor(i / img_data.width);
        }
        i += 1;
    }
    return {
        x: (canvasVideo.width / canvasSource.width) * sum_x / n,
        y: (canvasVideo.height / canvasSource.height) * sum_y / n
    };
}

function differenceAccuracy(target, data1, data2) {
    if (data1.length != data2.length) return null;
    var i = 0;
    while (i < (data1.length * 0.25)) {
        var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
        var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;
        var diff = threshold(fastAbs(average1 - average2));
        target[4 * i] = diff;
        target[4 * i + 1] = diff;
        target[4 * i + 2] = diff;
        target[4 * i + 3] = 0xFF;
        i += 1;
    }
}
