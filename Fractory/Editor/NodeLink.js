class NodeLink extends VPObject {
    constructor(nodeA, nodeB, {} = {}) {
        super(nodeA.vp, {
            "mouseListening": true,
            "zOrder": 6
        });

        this.nodeA = nodeA;
        this.nodeB = nodeB;
        this.thickness = 8;
        this.pairCode = undefined;
    }

    isOverlapping(point) {
        if (this.nodeB == "mouse") {
            return false;
        }
        return point.distToSegmentSquared(this.nodeA.position, this.nodeB.position) < Math.pow(this.thickness * 2, 2);
    }

    isMouseBlockingOverlap() {
        return true;
    }

    isMouseBlockingPress() {
        return true;
    }


    recalcPairCode() {
        this.pairCode = JSON.stringify([Math.min(this.nodeA.uuid, this.nodeB.uuid), Math.max(this.nodeA.uuid, this.nodeB.uuid)]);
        return this.pairCode;
    }

    onMouseEntered() {
        super.onMouseEntered();
        this.suggestCursor("pointer");
    }

    onMouseExited() {
        super.onMouseExited();
        this.unsuggestCursor("pointer");
    }

    onClicked() {
        super.onClicked();
        this.destroyLink();
    }

    destroyLink() {
        this.vp.forget(this);
        this.vp.links.delete(this);
        this.vp.linkPairCodes.delete(this.pairCode);
        this.nodeA.links.delete(this);
        if (this.nodeB instanceof IVPNode) {
            this.nodeB.links.delete(this);
        }
        this.vp.onLinkDestroyed(this);
    }

    draw(ctx) {
        let posA = this.nodeA.position;
        let posB;
        switch (this.nodeB) {
            case "mouse":
                posB = this.vp.mousePos;
                break;
            default:
                posB = this.nodeB.position;
                break;
        }

        ctx.lineCap = "round";
        ctx.lineWidth = this.thickness;// * this.vp.zoomFactor;
        ctx.strokeStyle = "#666666"
        this.strokeLine(ctx, posA, posB);
    };
}