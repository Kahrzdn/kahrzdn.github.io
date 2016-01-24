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
var layer;
var posspr;
var npc;
var npcs = [];
var delta = 4;

function preload() {

    game.load.image('corona', 'media/star.png');
    game.load.image('tiles', 'media/tileset.png');
    game.load.tilemap('tilemap', 'media/tileset.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('sheet', 'media/tileset.png', 23, 23, 30 * 20);
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#000000';

    videoFrame = game.add.sprite(0, 0);


    map = game.add.tilemap('tilemap');
    game.world.setBounds(0, 0, 10000, 2000);

    posspr = game.add.sprite(450, 30, 'sheet');
    posspr.frame = 179;
    posspr.anchor.setTo(0.5, 0.5);
    //game.physics.enable(posspr);
    //posspr.body.gravity.y = 1000;
    //game.physics.arcade.collide(posspr, map);
    game.camera.follow(posspr);
    map.addTilesetImage('tiles-world1', 'tiles');
    map.setCollision([123, 126, 127, 152, 156, 157, 179, 200]);
    layer = map.create('level1', 600, 40, 21, 21);
    //   layer.scrollFactorX = 0.5;
    //   layer.scrollFactorY = 0.5;
    layer.wrap = false;
    layer.debug = false;

    videoFrame.fixedToCamera = true;
    //layer.scroll = 8;
    var height = 10;
    var lx = 0;
    for (var i = 0; i < 900; i++) {
        var r = Math.random();
        for (var j = 1; j <= height; j++) {
            map.putTile(152, lx, 40 - height + j);
        }
        if (r > 0.9 && height < 20) {
            height++;
            map.putTile(126, lx, 40 - height);
            map.putTile(156, lx, 40 - height + 1);

        }
        else if (r < 0.1 && height > 3) {
            height--;
            map.putTile(200, lx, 40 - height - 2);
            map.putTile(127, lx, 40 - height - 1);
            map.putTile(157, lx, 40 - height);
        }
        else {
            map.putTile(123, lx, 40 - height);
        }
        lx++;
    }
    emitter = game.add.emitter(game.world.centerX, game.world.centerY, 200);

    emitter.fixedToCamera = true;
    var particules = 6;
    var _pArray = [10, 12, 20];

    emitter.makeParticles('sheet', [376, 377, 378, 379, 179]);

    emitter.setRotation(0, 0);
    emitter.setAlpha(0.7, 1);
    emitter.setScale(1, 1, 1, 1);
    emitter.gravity = 1000;

    //	false means don't explode all the sprites at once, but instead release at a rate of one particle per 100ms
    //	The 5000 value is the lifespan of each particle before it's killed
    emitter.start(false, 900, 40);

}

function createNewNPC() {
    if (Math.random() < 0.009) {
        npc = game.add.sprite(950 + game.camera.x, 420, 'sheet');
        npc.frame = 26;
        npc.anchor.setTo(0.5, 0.5);
        game.physics.enable(npc);
        npc.body.collideWorldBounds = true;
        npc.body.bounce.y = 0.2;
        npc.body.gravity.y = 1000;

        //npcs.push(npc);
    }
}

function render() {

    createNewNPC();
    drawVideo();
    blend();
    showCenter();
    drawTiles();

}

function update() {
   // game.physics.arcade.collide(npc, layer);
    if (npc && !npc.dead) {
        game.physics.arcade.collide(emitter, npc, hit, null, this);
        game.physics.arcade.collide(npc, layer, change, null, this);
    }
    game.physics.arcade.collide(emitter, layer, change, null, this);

}

function change(a, b) {
   // console.log("dsd");
}

function hit(a, b) {
    a.frame +=30;
    console.log(a);
    console.log(b);
    console.log("------");

}

function drawTiles() {
    posspr.x += delta;
    if (posspr.x >= game.world.bounds.x+game.world.bounds.width) {
        delta = -Math.abs(delta);
    }
    if (posspr.x <= game.world.bounds.x) {
        delta = Math.abs(delta);
    }

    //layer.position.x=(layer.position.x-1)%21;
    //for (var i=0;i<900;i++) {
    //    map.putTile(209,i%map.layer.width,~~(i/map.layer.width));
    //}


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
    if (c.x && c.y) {
        emitter.x = videoFrame.x + c.x;
        emitter.y = videoFrame.y + c.y;
        // console.log(c.x);
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
