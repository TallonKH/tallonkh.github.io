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
    leftViewport.partChangeListeners.add(function (e) {
        rightViewport.recalc([leftViewport]);
    });
}