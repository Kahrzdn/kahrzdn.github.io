'use strict';


// Put variables in global scope to make them available to the browser console.
var video = document.querySelector ('video');

var constraints = window.constraints = {
    audio: false,
    video: {
        optional: [{
            sourceId: "camera 2"
        }]
    }
}
;
var errorElement = document.querySelector ('#errorMsg');
var nav = ( navigator.mediaDevices.getUserMedia ||
navigator.mediaDevices.webkitGetUserMedia ||
navigator.mediaDevices.mozGetUserMedia ||
navigator.mediaDevices.msGetUserMedia);

var game = new Phaser.Game (window.innerWidth/2, window.innerHeight/2, Phaser.CANVAS, 'phaser', {

    create: create,
    render: render,
    update: update
});

var videoFrame;
var videoTexture;

function create() {
    videoFrame = game.add.sprite (0, 0);
}

function render() {
    drawVideo ();
}

function update() {

}


$ ("#downloadinfo").hide ();
$ ("#start").show ();
$ ("#next").hide ();
$ ("#finish").hide ();

nav (constraints)
    .then (function (stream) {
        var videoTracks = stream.getVideoTracks ();
        console.log ('Got stream with constraints:', constraints);
        console.log ('Using video device: ' + videoTracks[0].label);
        setTimeout (function () {

            canvasVideo.width = Math.min (window.innerWidth/2.2, window.innerWidth/2);
            canvasVideo.height = (video.videoHeight/video.videoWidth)*Math.min (window.innerWidth/2.2, window.innerWidth/2);
            var contextVideo = canvasVideo.getContext ('2d');
        }, 1000);

        stream.onended = function () {
            console.log ('Stream ended');
        };
        stream.onactive = function () {
            canvasVideo.width = video.videoWidth;
            canvasVideo.height = video.videoHeight;

        };
        window.stream = stream; // make variable available to browser console
        video.srcObject = stream;
    })
    .catch (function (error) {
        if(error.name === 'ConstraintNotSatisfiedError'){
            errorMsg ('The resolution ' + constraints.video.width.exact + 'x' +
                constraints.video.width.exact + ' px is not supported by your device.');
        } else if(error.name === 'PermissionDeniedError'){
            errorMsg ('Permissions have not been granted to use your camera and ' +
                'microphone, you need to allow the page access to your devices in ' +
                'order for the demo to work.');
        }
        errorMsg ('getUserMedia error: ' + error.name, error);
    });

function errorMsg(msg, error) {
    errorElement.innerHTML += '<p>' + msg + '</p>';
    if(typeof error !== 'undefined'){
        console.error (error);
    }
}

var canvasVideo = document.getElementById ("canvas-video");
canvasVideo.width = window.innerWidth/2;
canvasVideo.height = window.innerHeight/2;
var contextVideo = canvasVideo.getContext ('2d');

// mirror video

//contextVideo.translate(canvasVideo.width, 0);
//contextVideo.scale(-1, 1);
var c = 5;


var dlName = "GIFchoice.gif";
var encoder;

function handleFiles() {
    var selectedFile = document.getElementById ('file-upload').files[0];
    var reader = new FileReader ();
    dlName = selectedFile.name;
    reader.onload = function (e) {
        $ (".jsgif").remove ();

        var elem = document.createElement ("img");
        elem.id = "blah1";
        $ (".sourcegif").append (elem);

        $ ('#blah1')
            .attr ('src', e.target.result)
            .width (150)
            .height (200);
    };

    reader.readAsDataURL (selectedFile);
}

function recordGifStart() {
    encoder = new GIFEncoder ();
    encoder.setRepeat (0); //auto-loop
    encoder.setDelay (33);
    console.log (encoder.start ());
    $ ("#start").hide ();
    $ ("#next").show ();
    $ ("#finish").show ();


}

function recordFrame() {
    var context = contextVideo;//canvas.getContext('2d');
    encoder.addFrame (context);

}

function recordGifEnd() {
    encoder.finish ();
    document.getElementById ('gifimage').src
    $ ("#downloadinfo").show ();
    document.getElementById ('gifimage').src = 'data:image/gif;base64,' + encode64 (encoder.stream ().getData ());
    document.getElementById ('giflink').href = 'data:image/gif;base64,' + encode64 (encoder.stream ().getData ());
    document.getElementById ('giflink').download = dlName;
    $ ("#start").show ();
    $ ("#next").hide ();
    $ ("#finish").hide ();

}
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout (callback, 1000/60);
        };
}) ();


function drawVideo() {
    contextVideo.drawImage (video, 0, 0, window.innerWidth/2, (video.videoHeight/video.videoWidth)*window.innerWidth/2);//, 200,200);//canvasVideo.width, canvasVideo.height);//video.width, video.height);
    videoTexture = PIXI.Texture.fromCanvas (canvasVideo);
    videoFrame.loadTexture (videoTexture);
}


