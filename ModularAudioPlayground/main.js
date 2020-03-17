var rootDiv;
var viewport;
var wind;
var base1;
var base2;
var base3;
var laser;
var emitter;
var target1;
var target2;
var crash;
var beat;
var playerPos = new NPoint();

var emitObj;
var target1Obj;
var target2Obj;
var stageChanger;

var stageNum = 0;
var levelNum = 0;

$(function () {
    main();
});

function setupElements() {
    rootDiv.style.display = "block";
    viewport = new Viewport({
        "minZoomFactor": 1,
        "maxZoomFactor": 1,
        "pannable": false,
        "zoomSensitivity": 1,
        "panSensitivity": 0.5,
        "zoomCenter": "center"
    });
    viewport.background.color = "#1a1a1a"
    rootDiv.appendChild(viewport.container);

    viewport.onTick = function (deltaT, tickMultiplier, overflow) {
        updateVols();
    }
    viewport.setupLoop();
}

function addVPObjs() {
    centerMarker = new CenterMarker(viewport, new NPoint(0, 0));
    viewport.registerObj(centerMarker);

    infoObj = new InfoObj(viewport, new NPoint(-500, 0));
    viewport.registerObj(infoObj);

    stageObj = new StageChanger(viewport, new NPoint(-500, -300));
    viewport.registerObj(stageObj);

    levelObj = new LevelChanger(viewport, new NPoint(-500, -150));
    viewport.registerObj(levelObj);

    emitObj = new LaserEmitter(viewport, new NPoint(0, 200));
    viewport.registerObj(emitObj);

    target1Obj = new LaserTarget(viewport, new NPoint(400, 50));
    target1Obj.num = 1;
    viewport.registerObj(target1Obj);

    target2Obj = new LaserTarget(viewport, new NPoint(600, 100));
    target2Obj.num = 2;
    viewport.registerObj(target2Obj);
}

function main() {
    rootDiv = document.getElementById("rootDiv");
    rootDiv.style.display = "none";

    const startButton = document.getElementById("startbutt");
    startButton.onclick = function () {
        startButton.remove();

        setupElements();
        addVPObjs();

        base1Vol = 1;

        base2Vol = 0;
        base3Vol = 0;
        laserVol = 0;
        emitterVol = 0;
        target1Vol = 0;
        target2Vol = 0;
        crashVol = 0;
        beatVol = 0;

        wind.play();
        base1.play();

        base2.play();
        base3.play();
        laser.play();
        emitter.play();
        target1.play();
        target2.play();
        crash.play();
        beat.play();

        updateVols();
    }

    wind = document.getElementById("wind");
    base1 = document.getElementById("base1");
    base2 = document.getElementById("base2");
    base3 = document.getElementById("base3");
    laser = document.getElementById("laser");
    emitter = document.getElementById("emitter");
    target1 = document.getElementById("target1");
    target2 = document.getElementById("target2");
    crash = document.getElementById("crash");
    beat = document.getElementById("beat");
}

let tick = 0;

function updateVols() {
    tick++;
    viewport.queueRedraw();
    target1Obj.active = emitObj.active && target1Obj.position.distToSegment(emitObj.position, emitObj.position.add2(5000, 0)) < 25;
    target2Obj.active = emitObj.active && target2Obj.position.distToSegment(emitObj.position, emitObj.position.add2(5000, 0)) < 25;

    playerPos = viewport.mousePos;
    const distM = clamp(Math.pow(playerPos.length() / document.body.scrollWidth * 2, 4), 0, 1);
    const distL = clamp(Math.pow(playerPos.distToSegment(emitObj.position, emitObj.position.add2(5000, 0)) / document.body.scrollWidth * 8, 2), 0, 0.9);
    const distLE = clamp(Math.pow(NPoint.dist(playerPos, emitObj.position) / document.body.scrollHeight * 6, 2), 0, 0.95);
    const distT1 = clamp(Math.pow(NPoint.dist(playerPos, target1Obj.position) / document.body.scrollHeight * 3, 2), 0, 0.9);
    const distT2 = clamp(Math.pow(NPoint.dist(playerPos, target2Obj.position) / document.body.scrollHeight * 3, 2), 0, 0.9);

    target1Vol = target1Obj.active ? (1 - distT1) : 0;
    target2Vol = target2Obj.active ? (1 - distT2) : 0;

    wind.volume = clamp(distM, 0.2, 1);
    base1.volume = clamp(base1Vol * (1 - distM), 0.1, 1);
    base2.volume = clamp(base2Vol * (1 - distM), 0, 1);
    base3.volume = clamp(base3Vol * (1 - distM), 0, 1);
    laser.volume = clamp((1 - distL) * laserVol, 0, 1);
    emitter.volume = clamp((1 - distLE) * emitterVol, 0, 1);
    target1.volume = clamp(target1Vol, 0, 1);
    target2.volume = clamp(target2Vol, 0, 1);
    crash.volume = clamp(crashVol, 0, 0.8);
    beat.volume = clamp(beatVol * (1 - distM), 0, 1);

    const tracks = [base1, base2, base3, laser, emitter, target1, target2, crash, beat];
    let oof = false;
    for(const trck of tracks){
        if (Math.abs(trck.currentTime - wind.currentTime) > 0.02) {
            console.log(Math.abs(trck.currentTime - wind.currentTime));
            oof = true;
            break;
        }
    }
    
    if(oof && !wind.paused){
        wind.pause();
        for(trck of tracks){
            trck.pause();
            trck.currentTime = wind.currentTime;
        }
        setTimeout(resumeAll, 100);
    }
}

function resumeAll(){
    wind.play();
    base1.play();
    base2.play();
    base3.play();
    laser.play();
    emitter.play();
    target1.play();
    target2.play();
    crash.play();
    beat.play();
}