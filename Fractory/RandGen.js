function getRandPalette() {
    const five = getRand(allPalettes).slice();
    return [popRand(five), popRand(five), popRand(five), popRand(five)];
}

function randComponentGetter(coordGetter) {
    const choice = Math.random() > 0.5;
    return function (nvars) {
        const coord = coordGetter(nvars);
        return choice ? coord.x : coord.y;
    }
}

function randCoordGetter() {
    const options = [
        nvars => nvars["rootPos"],
        nvars => nvars["aPos"],
        nvars => nvars["bPos"],
    ]
    return getRand(options);
}

function randInfModifierGetter(infSource) {
    const tau = Math.PI / 2;
    const options = [
        inf => Math.abs(Math.atan(Math.log(Math.abs(inf)) || 0)) / tau,
        inf => Math.sign(inf) / 2 + 0.5,
        inf => Math.abs(Math.round(inf)) % 2,
        inf => Math.abs(Math.cos(inf)),
    ];
    const selection = getRand(options);
    return nvars => selection(infSource(nvars));
}

function randAlphaFunc() {
    const tau = Math.PI / 2;
    const coordInput = randInfModifierGetter(randComponentGetter(randCoordGetter()));
    const options = [
        nvars => nvars["depth"] / nvars["maxDepth"],
        nvars => nvars["depth"] % 2,
        nvars => nvars["lineIndex"] / nvars["lineCount"],
        nvars => nvars["lineIndex"] % 2,
        nvars => Math.cos(nvars["srcRot"]) / 2 + 0.5,
        nvars => Math.cos(nvars["brnRot"]) / 2 + 0.5,
        nvars => Math.abs(Math.atan(nvars["srcScale"])) / tau,
        nvars => coordInput(nvars),
    ];
    return getRand(options);
}

function randInterpolater() {
    const options = [
        colorLerp,
        hslLerp
    ];
    return getRand(options);
}

function getRandColorFunc() {
    const [c1, c2, c3, c4] = getRandPalette();
    const var1 = randAlphaFunc();
    const var2 = randAlphaFunc();
    const var3 = randAlphaFunc();
    const interpC = randInterpolater();
    const interpL = randInterpolater();
    const interpR = randInterpolater();
    return function (nvars) {
        return interpC(
            interpL(c1, c2, var1(nvars)) || c1,
            interpR(c3, c4, var2(nvars)) || c2,
            var3(nvars)
        ) || c3;
    }
}


var widthGen = gaussianGenerator(4, 4);
var widthGen2 = gaussianGenerator(2, 4);

function getRandWidthFunc() {
    const upperWidth = clamp(widthGen(), 0.5, 16);
    const lowerWidth = clamp(widthGen2(), 0.5, upperWidth);

    return function (nvars) {
        return lerp(upperWidth, lowerWidth, nvars["depth"] / nvars["maxDepth"]);
    }
}