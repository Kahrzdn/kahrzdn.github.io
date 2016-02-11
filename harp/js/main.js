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
    },
    false,false);

var emitter;
var videoFrame;
var videoTexture;
var map;
var layer;
var posspr;
var npcs = [];
var delta = 4;
var score = 0;
var scoreText;
var tileW;
var tileH;
var laneW=200;
var tSize = 21;
var dropSpots = [];
var fx;

function preload() {

    game.load.image('corona', 'media/star.png');
    game.load.image('tiles', 'media/tileset.png');
    game.load.tilemap('tilemap', 'media/tileset.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('sheet', 'media/tileset.png', 23, 23, 30 * 20);
    game.load.bitmapFont('gem', 'media/gem.png', 'media/gem.xml');
    game.load.audio('sfx', 'media/fx_mixdown.ogg');
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#000000';

    videoFrame = game.add.sprite(0, 0);

    fx = game.add.audio('sfx');
    fx.allowMultiple = true;
    fx.addMarker('ping', 10, 1.0);

    map = game.add.tilemap('tilemap');
    game.world.setBounds(0, 0, laneW*tSize, game.camera.height+tSize*2);

    tileW = Math.round(game.camera.width/tSize);
    tileH = Math.round(game.camera.height/tSize);

    posspr = game.add.sprite(450, 30, 'sheet');
    posspr.frame = 179;
    posspr.anchor.setTo(0.5, 0.5);
    game.camera.follow(posspr);
    map.addTilesetImage('tiles-world1', 'tiles');
    map.setCollision([123, 126, 127, 152, 156, 157, 179, 200]);
    layer = map.create('level1', 600, 40, 21, 21);
    layer.wrap = false;
    layer.debug = false;

    videoFrame.fixedToCamera = true;
    //layer.scroll = 8;
    var height = 10;
    var lx = 0;
    for (var i = 0; i < laneW; i++) {
        var r = Math.random();
        for (var j = 1; j <= height; j++) {
            map.putTile(152, lx, tileH - height + j);
        }
        if (r > 0.9 && height < tileH/2) {
            height++;
            map.putTile(126, lx, tileH - height);
            map.putTile(156, lx, tileH - height + 1);

        }
        else if (r < 0.1 && height > 3) {
            height--;
            map.putTile(200, lx, tileH - height - 2);
            map.putTile(127, lx, tileH - height - 1);
            map.putTile(157, lx, tileH - height);
        }
        else {
            map.putTile(123, lx, tileH - height);
            dropSpots.push(lx);
        }
        lx++;
    }
    scoreText = game.add.bitmapText(200, 200, 'gem', "SCORE: "+score, 48);
    //scoreText.fixToCamera = true;
    emitter = game.add.emitter(game.world.centerX, game.world.centerY   );

    emitter.fixedToCamera = true;

    emitter.makeParticles('sheet', [376, 377, 378, 379, 179]);

    emitter.setRotation(0, 0);
    emitter.setAlpha(0.7, 1);
    emitter.setScale(1, 1, 1, 1);
    emitter.gravity = 1000;

    //	false means don't explode all the sprites at once, but instead release at a rate of one particle per 100ms
    //	The 5000 value is the lifespan of each particle before it's killed
   // emitter.start(false, 900, 40);
    startLevel();
}

function startLevel() {
    console.log("startLevel");
    emitter.kill();
    emitter._quantity = 0;
    emitter.start(false, 900, 40);
    score = 0;
    createNPCs();
}
function createNPCs() {
    console.log("cleanUp");
    for (var i=0;i<npcs.length;i++) {
        npcs[i].destroy();
    }
    console.log("CreateNew");
    for(var i =0;i<dropSpots.length;i++){
        if (Math.random() < 0.2) {
            createNewNPC(dropSpots[i] * 21, (tileH/2-1) * 21);
        }
    }
    console.log("start");
}

function createNewNPC(x, y) {
    var npc = game.add.sprite(x, y, 'sheet');
    npc.type = game.rnd.integerInRange(0,6);
    var frames = [];
    if (npc.type<=4) {
        for (var i = 0; i < 11; i++) {
            frames.push(i + 19 + 30 * npc.type);
        }
    }
    else if (npc.type==5) {
        for (var i = 15*30+20; i < 15*30+20+4; i++) {
            frames.push(i);
        }
    }
    else if (npc.type==6) {
        for (var i = 15*30+25; i < 15*30+25+3; i++) {
            frames.push(i);
        }
    }

    npc.animations.add('loop',frames,5+game.rnd.integerInRange(0,10),true,true);
//    npc.frame = 29;
    npc.play('loop');
    npc.anchor.setTo(0, 1);
    game.physics.enable(npc);
    npc.body.collideWorldBounds = false;
    npc.body.bounce.y = 0.2;
    npc.body.gravity.y = 1000;
    npc.body.velocity.x= 100*(Math.random()-0.5);
    npc.lives = npc.type+1;
    npc.scale.setTo(1, 1);

    npcs.push(npc);
}

function render() {
    drawVideo();
    blend();
    showCenter();
    drawTiles();
    scoreText.x = game.camera.x+10;
    scoreText.y = 0;
    scoreText.text = "SCORE: "+score;

}

function update() {
    // game.physics.arcade.collide(npc, layer);
    //if (npc && !npc.dead) {
    game.physics.arcade.collide(emitter, npcs, hit, null, this);
    game.physics.arcade.collide(npcs, layer, change, null, this);
    //}
    game.physics.arcade.collide(emitter, layer, hitGround, null, this);

}



function change(a, b) {
    // console.log("dsd");
}

function hitGround(a, b) {
    a.scale.set(1,1);
    a.alpha = 0.6;

}

function hit(a, b) {
    var t = new Date().getTime();
    if (true || !a.hittime || t - a.hittime > 100) {
        var emitElem = b;
        emitElem.kill();
        var npc = a;
        npc.hittime = t;
        npc.scale.setTo(npc.scale.x+0.2, npc.scale.y+0.2);
        npc.lives--;
        score+=1;
        if (npc.lives<0){
            var index = npcs.indexOf(npc);
            if (index > -1) {
                npcs.splice(index, 1);
                score+=10;
            }
            fx.play('ping');

        }
        //console.log(a);
        //console.log(b);
        //console.log("------");
    }

}

function drawTiles() {
    posspr.x += delta;
    if (posspr.x >= game.world.bounds.x + game.world.bounds.width) {
        delta = -Math.abs(delta);
    }
    if (posspr.x <= game.world.bounds.x) {
        delta = Math.abs(delta);
        startLevel();
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
   // console.log(c.x);
   if (c.x && c.y && c.x !== 0 && c.y !== 0) {
        emitter.on = true;
        emitter.x = videoFrame.x + c.x;
        emitter.y = videoFrame.y + c.y;

//        console.log(c.x);
    }
    else {
        emitter.on = false;
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
