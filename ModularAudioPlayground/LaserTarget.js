class LaserTarget extends VPObject {
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
        const l = 15;
        if (this.held || (this.mouseOverlapping && !this.vp.mouseDown)) {
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#ec5";
            this.strokeCircle(ctx, 1.1);
        }
        
        ctx.strokeStyle = this.active ? "#4488a5" : "#224477";
        ctx.lineWidth = this.active ? 6 : 4;
        const fac = 0.5;
        ctx.beginPath();
        ctx.moveTo(this.position.x + l, this.position.y + l * fac);
        ctx.lineTo(this.position.x + l, this.position.y - l * fac);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.position.x - l, this.position.y + l * fac);
        ctx.lineTo(this.position.x - l, this.position.y - l * fac);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.position.x + l * fac, this.position.y + l);
        ctx.lineTo(this.position.x - l * fac, this.position.y + l);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.position.x + l * fac, this.position.y - l);
        ctx.lineTo(this.position.x - l * fac, this.position.y - l);
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillStyle = "#5566c7";
        ctx.font = "20px Arial";
        ctx.fillText("Laser Target " + this.num, this.position.x, this.position.y - 50);
        ctx.fillStyle = "#556699";
        ctx.font = "14px Arial";
        ctx.fillText("(drag to move!)", this.position.x, this.position.y - 35);
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
}