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

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'phaser', {preload: preload, create: create, render: render});

var emitter;
var videoFrame;
var videoTexture;

function preload() {

    game.load.image('corona', 'media/star.png');

}

function create() {

    game.stage.backgroundColor = '#000000';

    videoFrame = game.add.sprite(0, 0);
    emitter = game.add.emitter(game.world.centerX, game.world.centerY, 200);

    emitter.makeParticles('corona');

    emitter.setRotation(0, 0);
    emitter.setAlpha(0.3, 0.8);
    emitter.setScale(0,.2,0,.2);
    emitter.gravity = 1000;

    //	false means don't explode all the sprites at once, but instead release at a rate of one particle per 100ms
    //	The 5000 value is the lifespan of each particle before it's killed
    emitter.start(false, 900, 40);


}

function render() {
    update();
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

function update() {
    drawVideo();
    blend();
    showCenter();
}

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
    if (c.x && c.y) {
        emitter.x = c.x;
        emitter.y = c.y;
        console.log(c.x);
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
        i+=1;
    }
    return {x: (canvasVideo.width/canvasSource.width)*sum_x / n, y: (canvasVideo.height/canvasSource.height)*sum_y / n};
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
        i+=1;
    }
}
