class RotArrow extends VPObject {
    constructor(node, inverted, {} = {}) {
        super(node.vp, {
            "mouseListening": true,
            "zOrder": 8
        });
        this.node = node;
        this.inverted = inverted;
        this.endpoint;
        this.recalcEndpoint();
    }

    isMouseBlockingOverlap() {
        return true;
    }

    isMouseBlockingPress() {
        return true;
    }


    recalcEndpoint() {
        const scal = this.node.scale * 25 * (this.inverted ? -0.75 : 1);
        this.endpoint = this.node.position.add2(
            Math.sin(this.node.rotation) * scal,
            Math.cos(this.node.rotation) * scal
        )
    }

    isOverlapping(point) {
        return this.endpoint.subtractp(point).lengthSquared() < Math.pow(this.size * 1.5, 2);
    }

    onMouseEntered() {
        super.onMouseEntered();
        this.suggestCursor("grab");
    }

    onMouseExited() {
        super.onMouseExited();
        this.unsuggestCursor("grab");
    }

    onDragStarted() {
        super.onDragStarted();
        this.suggestCursor("grabbing");
    };

    onDragEnded() {
        super.onDragEnded();
        this.unsuggestCursor("grabbing");
        this.vp.queueRedraw();
    };

    onDragged() {
        super.onDragged();

        let angle = -(this.vp.mousePos.subtractp(this.node.position).getAngle() + Math.PI / 2);
        if (!this.inverted) {
            angle = Math.PI + angle;
        }
        if (!this.vp.altDown) {
            angle = Math.round(angle / Math.PI * 8) / 8 * Math.PI;
        }
        this.node.rotation = angle;

        if (this.vp.shiftDown) {
            let scal = this.node.position.subtractp(this.vp.mousePos).length();
            this.node.scale = clamp(scal / 25, 0.25, 16);
            if (!this.vp.altDown) {
                if (this.node.scale <= 4) {
                    this.node.scale = Math.pow(2, Math.round(Math.log2(this.node.scale)));
                } else {
                    this.node.scale = Math.round(this.node.scale / 2) * 2;
                }
            }
        }

        this.recalcEndpoint();
        this.vp.onNodeChanged(this.node);
    };

    draw(ctx) {
        const rotation = this.node.rotation;
        const tipLength = 12.5;
        const rotCW = rotation + Math.PI * 0.75;
        const tipCW = this.endpoint.add2(
            Math.sin(rotCW) * tipLength,
            Math.cos(rotCW) * tipLength
        )
        const rotCCW = rotation - Math.PI * 0.75;
        const tipCCW = this.endpoint.add2(
            Math.sin(rotCCW) * tipLength,
            Math.cos(rotCCW) * tipLength
        )

        // ctx.strokeStyle = this.vp.backgroundColor;
        // this.strokeLine(ctx, this.node.position, this.endpoint);
        ctx.lineCap = "round";

        if (this.mouseOverlapping || this.dragged) {
            ctx.lineWidth = 12 * this.vp.zoomFactor;
            ctx.strokeStyle = "#eeeeee"
            this.strokeLine(ctx, this.endpoint, tipCW);
            this.strokeLine(ctx, this.endpoint, tipCCW);
        }

        ctx.strokeStyle = this.inverted ? IVPNode.nodeStateColors[1] : IVPNode.nodeStateColors[2];
        ctx.lineWidth = 2 * this.vp.zoomFactor;
        this.strokeLine(ctx, this.node.position, this.endpoint);
        ctx.lineWidth = 6 * this.vp.zoomFactor;
        this.strokeLine(ctx, this.endpoint, tipCW);
        this.strokeLine(ctx, this.endpoint, tipCCW);
    }
}