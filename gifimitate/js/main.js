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

    create: create,
    render: render,
    update: update
});

var videoFrame;
var videoTexture;

function create() {
    videoFrame = game.add.sprite(0, 0);
}

function render() {
    drawVideo();
}

function update() {

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
canvasVideo.width = window.innerWidth/2;
canvasVideo.height = window.innerHeight/2;
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

var dlName = "dance.gif";
var sup1;
var encoder;

function handleFiles() {
    var selectedFile = document.getElementById('file-upload').files[0];
        var reader = new FileReader();
        dlName = selectedFile.name;
        reader.onload = function (e) {
            $( ".jsgif" ).remove();

            var elem = document.createElement("img");
            elem.id = "blah1";
            $(".sourcegif").append(elem);

            $('#blah1')
                .attr('src', e.target.result)
                .width(150)
                .height(200);
            sup1 = new SuperGif({ gif: document.getElementById('blah1') } );
            sup1.load();
        };

        reader.readAsDataURL(selectedFile);
}

function recordGifStart() {
    encoder = new GIFEncoder ();
    encoder.setRepeat (0); //auto-loop
    encoder.setDelay (100);
    console.log (encoder.start ());
    sup1.pause();
    sup1.move_to(0);
}

function recordFrame() {
    var context = contextVideo;//canvas.getContext('2d');
    encoder.addFrame(context);
    sup1.move_relative(1);
}

function recordGifEnd() {
    encoder.finish();
    document.getElementById('gifimage').src = 'data:image/gif;base64,'+encode64(encoder.stream().getData());
    document.getElementById('giflink').href = 'data:image/gif;base64,'+encode64(encoder.stream().getData());
    document.getElementById('giflink').download = dlName;
    sup1.play();
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
    contextSource.drawImage(video, canvasSource.width, 0, canvasSource.width, canvasSource.height);//video.width, video.height);
    contextVideo.drawImage(video, 0, 0, canvasVideo.width, canvasVideo.height);//video.width, video.height);
    videoTexture = PIXI.Texture.fromCanvas(canvasVideo);
    videoFrame.loadTexture(videoTexture);
}


