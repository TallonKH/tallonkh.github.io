class LevelChanger extends VPObject {
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
        
        if ((this.mouseOverlapping && !this.vp.mouseDown)) {
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#ec5";
            this.strokeCircle(ctx, 1.1);
        }
        ctx.fillStyle = ["#8800bb", "#ba00aa", "#cc0088"][levelNum];
        this.fillCircle(ctx);

        ctx.textAlign = "center";
        ctx.fillStyle = "#eee";
        ctx.font = "30px Courier New";
        ctx.fillText("Level: " + (levelNum + 1), this.position.x, this.position.y - 50);
        ctx.fillStyle = "#ccc";
        ctx.font = "14px Courier New";
        ctx.fillText("(click to change level!)", this.position.x, this.position.y - 32);

    }

    isMouseBlockingOverlap() {
        return true;
    }

    isMouseBlockingPress() {
        return true;
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
        levelNum = (levelNum+1) % 3;
        base2Vol = levelNum > 0;
        base3Vol = levelNum > 1;
    }
}