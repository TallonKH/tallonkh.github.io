var droot;
var horizSplit;
var leftHalf;
var rightHalf;
var editor;
var shape;
var colorFuncQueue = [];
var widthFuncQueue = [];
var shiftDown = false;
var ctrlDown = false;

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
    
    const node0 = editor.nodeGrid[3][3];
    const node1 = editor.nodeGrid[2][2];
    const node2 = editor.nodeGrid[4][2];
    node0.nodeState = 1;
    node1.nodeState = 2;
    node2.nodeState = 2;
    node0.nodeStateChanged();
    node1.nodeStateChanged();
    node2.nodeStateChanged();
    IVPNode.makeLink(editor, node0, node1);
    IVPNode.makeLink(editor, node0, node2);
    // editor.randomShape();
    viewer.zoomFactor = 2;
});

function setupElements() {
    helpButton.onclick = e => window.open("./Tutorial/Tutorial.html");
    photoButton.onclick = function () {
        const name = prompt("Screenshot taken. What would you like to name it?")
        if (name) {
            saveCanvas(viewer.canvas, name);
        }
    }
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
    switch (e.which) {
        case 16:
            shiftDown = true;
            break;
        case 17:
            ctrlDown = true;
            break;
        case 32:
            if (ctrlDown) {
                editor.randomShape();
            } else {
                if (shiftDown) {
                    if (colorFuncQueue.length > 0) {
                        editor.colorFunc = colorFuncQueue.pop();
                        editor.widthFunc = widthFuncQueue.pop();
                        shape.recalcColors();
                        shape.recalcWidths();
                        viewer.queueRedraw();
                    }
                } else {
                    scrambleColors();
                }
            }
            break;
    }
});

document.addEventListener("keyup", function (e) {
    switch (e.which) {
        case 16:
            shiftDown = false;
            break;
        case 17:
            ctrlDown = false;
            break;
    }
});

function scrambleColors() {
    if (colorFuncQueue.length > 24) {
        colorFuncQueue.shift();
        widthFuncQueue.shift();
    }
    colorFuncQueue.push(editor.colorFunc);
    widthFuncQueue.push(editor.widthFunc);
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