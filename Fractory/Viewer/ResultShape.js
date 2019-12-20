class ResultShape extends VPObject {
    constructor(vp, partEditor, {
        depth = 5
    } = {}) {
        super(vp, {
            "mouseListening": false,
            "zOrder": 8
        });

        this.partEditor = partEditor;
        this.maxDepth = depth;
        this.nodeLists = [];
        this.lines = [];
    }

    isOverlapping(point) {
        return false;
    }

    isMouseBlocking(self) {
        return true;
    }

    getShapeData() {
        return {
            "lineCount": this.partEditor.links.size,
            "maxDepth": this.maxDepth,
        }
    }

    recalcColors() {
        for (const line of this.lines) {
            line.color = this.partEditor.colorFunc({
                ...line,
                ...this.getShapeData()
            });
        }
    }

    recalcWidths() {
        for (const line of this.lines) {
            line.width = this.partEditor.widthFunc({
                ...line,
                ...this.getShapeData()
            });
        }
    }

    recalcGeometry() {
        this.nodeLists = this.partEditor.separateNodes();
        this.lines = [];
        this.calcPartGeometry(new NPoint(), 0, 1, this.maxDepth);
        this.recalcColors();
        this.recalcWidths();
    }

    draw(ctx) {
        // ctx.globalCompositeOperation = this.vp.blendMode;
        ctx.lineCap = "round";
        for (const line of this.lines) {
            ctx.lineWidth = line.width * this.vp.zoomFactor;
            ctx.strokeStyle = line.color;
            this.strokeLine(ctx, line.aPos.multiply1(100), line.bPos.multiply1(100));
        }
    }

    calcPartGeometry(srcPos, srcRot, srcScale, depthCounter) {
        if (depthCounter <= 0) {
            return;
        }

        for (const rootNode of this.nodeLists[1]) {
            const rott = srcRot + rootNode.rotation;
            const scal = srcScale / rootNode.scale;

            let i = 0;
            for (const seg of this.partEditor.links) {
                let posA = seg.nodeA.dPosition.subtractp(rootNode.dPosition).rotate(rott).multiply1(scal).addp(srcPos);
                let posB = seg.nodeB.dPosition.subtractp(rootNode.dPosition).rotate(rott).multiply1(scal).addp(srcPos);

                const line = {
                    "depth": depthCounter,
                    "lineIndex": i++,
                    "srcRot": srcRot,
                    "brnRot": rott,
                    "srcScale": scal,
                    "rootPos": srcPos,
                    "aPos": posA,
                    "bPos": posB
                }
                this.lines.push(line);
            }
            for (const branchNode of this.nodeLists[2]) {
                const posR = branchNode.dPosition.subtractp(rootNode.dPosition).rotate(rott).multiply1(scal).addp(srcPos);
                this.calcPartGeometry(posR, rott - branchNode.rotation, scal * branchNode.scale, depthCounter - 1);
            }
        }
    }
}