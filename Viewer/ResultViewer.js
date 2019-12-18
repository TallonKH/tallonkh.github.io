var widthGen = gaussianGenerator(4, 4);
var widthGen2 = gaussianGenerator(2, 4);

class ResultViewer extends Viewport {
    constructor({} = {}) {
        super({
            "minZoomFactor": 0.25,
            "maxZoomFactor": 4,
            "pannable": true,
            "zoomSensitivity": 1,
            "panSensitivity": 0.5,
            "zoomCenter": "mouse"
        });
        this.allShapes = [];

        this.backgroundColor = "#1a1a1a"
        this.colors = ["#fc3d60", "#4dff7c", "#3d73fc", "#fca63d", "#1a1a1a"];
        this.colorAlg = _ => "#ffffff";
        this.lineWidthAlg = _ => 2;
        this.linkedPartEditors;
    }

    keyPressed(code) {
        const self = this;
        switch (code) {
            case 32:
                requestColorPalette(function (colors) {
                    console.log(colors);

                    self.colors = colors.map(a => rgbToHex(a[0], a[1], a[2]));
                    self.colorAlg = getRandomColorAlg();

                    const upperWidth = clamp(widthGen(), 0.5, 16);
                    const lowerWidth = clamp(widthGen2(), 0.5, upperWidth);
                    self.lineWidthAlg = function (factor) {
                        return lerp(upperWidth, lowerWidth, factor);
                    }

                    self.recalc();
                }, randomRgb());
                break;
        }
    }

    recalc() {
        for (const shape of this.allShapes) {
            this.forget(shape);
        }
        this.allShapes = [];

        for (const partEditor of this.linkedPartEditors) {
            const shape = new ResultShape(this, partEditor);
            shape.recalc();
            this.registerObj(shape);
            this.allShapes.push(shape);
        }
    }
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
        inf => Math.round(inf) % 2,
        inf => Math.abs(Math.cos(inf)),
    ];
    const selection = getRand(options);
    return nvars => selection(infSource(nvars));
}

function rand01Getter() {
    const tau = Math.PI / 2;
    const coordInput = randInfModifierGetter(randComponentGetter(randCoordGetter()));
    const options = [
        nvars => nvars["depth"] / nvars["maxDepth"],
        nvars => nvars["index"] / nvars["indices"],
        nvars => nvars["depth"] % 2,
        nvars => nvars["index"] % 2,
        nvars => Math.cos(nvars["srcRot"]) / 2 + 0.5,
        nvars => Math.cos(nvars["brnRot"]) / 2 + 0.5,
        nvars => Math.atan(nvars["srcScale"]) / tau,
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

function getRandomColorAlg() {
    const var1 = rand01Getter();
    const var2 = rand01Getter();
    const var3 = rand01Getter();
    const interpC = randInterpolater();
    const interpL = randInterpolater();
    const interpR = randInterpolater();
    return function (nvars) {
        return interpC(
            interpL(
                this.colors[0],
                this.colors[1],
                var1(nvars)),
            interpR(
                this.colors[2],
                this.colors[3],
                var2(nvars)),
            var3(nvars));
    }
}