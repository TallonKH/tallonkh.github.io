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
    }

    recalc(partEditors){
        for(const shape of this.allShapes){
            this.forget(shape);
        }
        this.allShapes = [];

        for (const partEditor of partEditors) {
            const shape = new ResultShape(this, partEditor);
            this.registerObj(shape);
            this.allShapes.push(shape);
        }
    }
}