class LaserEmitter extends VPObject {
    constructor(viewport, position, {} = {}) {
        super(viewport, {
            "mouseListening": true,
            "position": position
        })
        this.size = 25;
        this.color = "#aaa";
        this.active = false;
    }

    draw(ctx) {
        ctx.lineCap = "round";
        const l = 25;
        if (this.held || (this.mouseOverlapping && !this.vp.mouseDown)) {
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#ec5";
            this.strokeCircle(ctx, 1.1);
        }

        ctx.strokeStyle = "#f55";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.position.x + l, this.position.y);
        ctx.lineTo(this.position.x - 0.5 * l, this.position.y - 0.866 * l);
        ctx.lineTo(this.position.x - 0.5 * l, this.position.y + 0.866 * l);
        ctx.lineTo(this.position.x + l, this.position.y);
        ctx.stroke();

        if (this.active) {
            ctx.lineWidth = 8;
            ctx.strokeStyle = "#ff4422";
            this.strokeLine(ctx, this.position, this.position.add2(5000, 0));
        }

        ctx.textAlign = "center";
        ctx.fillStyle = "#ff6644";
        ctx.font = "20px Arial";
        ctx.fillText("Laser Emitter", this.position.x, this.position.y - 50);
        ctx.fillStyle = "#ff9988";
        ctx.font = "14px Arial";
        ctx.fillText("(click to toggle, or drag to move!)", this.position.x, this.position.y - 35);
    }

    isMouseBlockingOverlap() {
        return true;
    }

    isMouseBlockingPress() {
        return true;
    }

    onDragStarted() {
        super.onDragStarted();
        this.suggestCursor("grabbing");
        this.dragInitialPosition = this.position;
        this.zSubOrder = 1;
    }

    onDragged() {
        super.onDragged();
        this.position = this.dragInitialPosition.addp(this.vp.mousePos.subtractp(this.vp.mouseDownPos));
    }

    onDragEnded() {
        super.onDragEnded();
        this.unsuggestCursor("grabbing");
        this.zSubOrder = 0;
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
        this.active = !this.active;
        laserVol = this.active ? 1 : 0;
        emitterVol = this.active ? 1 : 0;
    }
}