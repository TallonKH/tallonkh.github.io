class CenterMarker extends VPObject {
    constructor(viewport, position, {} = {}) {
        super(viewport, {
            "mouseListening": false,
            "position": position
        })
        this.size = 5;
    }

    draw(ctx) {
        ctx.textAlign = "center";
        ctx.font = "15px Arial";
        ctx.fillStyle = "#fff";
        ctx.fillText("Level Center", 0, -25);
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#fff";
        this.fillCircle(ctx);
        ctx.lineWidth = 2;
        this.strokeCircle(ctx, 3);
    }
}