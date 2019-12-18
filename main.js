var droot;
var mainSplit;
var leftHalf;
var rightHalf;
var leftViewport;

const mainSplitterArgs = {
    direction: 'horizontal',
    gutterSize: 4,
}

$(function () {
    setupElements();
    // droot.appendChild(viewport.container);
});

function setupElements() {
    droot = document.getElementById("mainContainer")
    leftHalf = document.getElementById("leftHalf")
    rightHalf = document.getElementById("rightHalf")
    mainSplit = Split(["#leftHalf", "#rightHalf"], mainSplitterArgs);
    mainSplit.gutterSize = 2;

    leftViewport = new PartEditor();
    leftHalf.appendChild(leftViewport.container);

    rightViewport = new ResultViewer();
    rightHalf.appendChild(rightViewport.container);
    rightViewport.linkedPartEditors = [leftViewport];
    leftViewport.partChangeListeners.add(function (e) {
        rightViewport.recalc();
    });
}

function requestColorPalette(callback, ...statics) {
    statics = statics.slice(0, Math.min(statics.length, 5));
    while (statics.length < 5) {
        statics.push("N");
    }
    const data = {
        model: "default",
        input: statics
    }

    const http = new XMLHttpRequest();
    http.tmieout = 200;
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var palette = JSON.parse(http.responseText).result;
            callback(palette);
        }
    }

    http.open("POST", "http://colormind.io/api/", true);
    http.send(JSON.stringify(data));
}