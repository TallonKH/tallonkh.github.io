var droot;
var horizSplit;
var leftHalf;
var rightHalf;
var editor;
var shape;

const horizSplitterArgs = {
    direction: "horizontal",
    gutterSize: 4,
}

const toolbarSplitterArgs = {
    direction: "vertical",
    gutterSize: 2,
}

$(function () {
    setupElements();
});

function setupElements() {
    helpButton.onclick = e => window.open("./Tutorial/Tutorial.html");
    photoButton.onclick = e => saveCanvas(viewer.canvas, "Fractal");
    trashButton.onclick = e => editor.clearShape();
    scrambleButton.onclick = scrambleColors;

    droot = document.getElementById("mainContainer");

    leftHalf = document.getElementById("leftHalf");
    rightHalf = document.getElementById("rightHalf");
    horizSplit = Split(["#leftHalf", "#rightHalf"], horizSplitterArgs);

    editor = new PartEditor();
    leftHalf.appendChild(editor.container);

    viewer = new ResultViewer();
    rightHalf.appendChild(viewer.container);

    shape = new ResultShape(viewer, editor, depth = 5);

    viewer.registerObj(shape);
    editor.partChangeListeners.add(function (e) {
        shape.recalcGeometry();
    });
}

document.addEventListener("keydown", function (e) {
    if (e.which == 32) {
        scrambleColors();
    }
});

function scrambleColors() {
    editor.colorFunc = getRandColorFunc();
    editor.widthFunc = getRandWidthFunc();
    shape.recalcColors();
    shape.recalcWidths();
    viewer.queueRedraw();
}

/*
function requestNewPalette(callback, ...statics) {
    statics = statics.slice(0, Math.min(statics.length, 5));
    while (statics.length < 5) {
        statics.push("N");
    }
    const data = {
        model: "default",
        input: statics
    }

    const http = new XMLHttpRequest();
    http.timeout = 200;
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var palette = JSON.parse(http.responseText).result;
            callback(palette);
        }
    }

    http.open("POST", "http://colormind.io/api/", true);
    http.send(JSON.stringify(data));
}
*/