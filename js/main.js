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
var canvasDiff = document.getElementById("canvas-diff");

var contextSource = canvasSource.getContext('2d');
var contextBlended = canvasBlended.getContext('2d');
var contextDiff = canvasDiff.getContext('2d');

// mirror video
contextSource.translate(canvasSource.width, 0);
contextSource.scale(-1, 1);

var c = 5;

function initialize() {
    //$('.introduction').fadeOut();
    //$('.allow').fadeOut();
    //$('.loading').delay(300).fadeIn();
    start();
}

function start() {
    update();
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
//  checkAreas();
    requestAnimFrame(update);
}

function drawVideo() {
    contextSource.drawImage(video, 0, 0, canvasSource.width, canvasSource.height);//video.width, video.height);
    console.log(video);
    console.log(canvasSource.width);
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
    var diffData = contextSource.createImageData(width, height);
    // blend the 2 images
    differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
    // draw the result in a canvas
    contextBlended.putImageData(blendedData, 0, 0);
    contextDiff.putImageData(diffData, 0, 0);
    // store the current webcam image
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
    var context = contextBlended;
    context.beginPath();
    context.arc(c.x, c.y, 10, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();
}

function computeCenter(img_data) {
    var i = 0;
    var sum_x = 0;
    var sum_y = 0;
    var n = 0;
    while (i < img_data.width * img_data.height) {
        if (img_data.data[4 * i] > 0) {
            n = n + 1;
            sum_x = sum_x + (i % img_data.width);
            sum_y = sum_y + Math.floor(i / img_data.width);
        }
        ++i;
    }
    return {x: sum_x / n, y: sum_y / n};
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
        ++i;
    }
}

//function checkAreas() {
//  var data;
//  for (var h = 0; h < hotSpots.length; h++) {
//    var blendedData = contextBlended.getImageData(hotSpots[h].x, hotSpots[h].y, hotSpots[h].width, hotSpots[h].height);
//    var i = 0;
//    var average = 0;
//    while (i < (blendedData.data.length * 0.25)) {
//      // make an average between the color channel
//      average += (blendedData.data[i * 4] + blendedData.data[i * 4 + 1] + blendedData.data[i * 4 + 2]) / 3;
//      ++i;
//    }
//    // calculate an average between the color values of the spot area
//    average = Math.round(average / (blendedData.data.length * 0.25));
//    if (average > 10) {
//      // over a small limit, consider that a movement is detected
//      data = {confidence: average, spot: hotSpots[h]};
//      $(data.spot.el).trigger('motion', data);
//    }
//  }
//}

//function getCoords() {
//  $('#hotSpots').children().each(function (i, el) {
//    var ratio = $("#canvas-highlights").width() / $('video').width();
//    hotSpots[i] = {
//      x:      this.offsetLeft / ratio,
//      y:      this.offsetTop / ratio,
//      width:  this.scrollWidth / ratio,
//      height: this.scrollHeight / ratio,
//      el:     el
//    };
//  });
//  if (OUTLINES) highlightHotSpots();
//}

//$(window).on('start resize', getCoords);

//function highlightHotSpots() {
//  var canvas = $("#canvas-highlights")[0];
//  var ctx = canvas.getContext('2d');
//  canvas.width = canvas.width;
//  hotSpots.forEach(function (o, i) {
//    ctx.strokeStyle = 'rgba(0,255,0,0.6)';
//    ctx.lineWidth = 1;
//    ctx.strokeRect(o.x, o.y, o.width, o.height);
//  });
//}
