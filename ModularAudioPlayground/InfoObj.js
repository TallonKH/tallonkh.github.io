class InfoObj extends VPObject {
    constructor(viewport, position, {} = {}) {
        super(viewport, {
            "mouseListening": false,
            "position": position
        })
    }

    draw(ctx) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#ccc";
        ctx.font = "20px Courier New";
        ctx.fillText("Time: " + wind.currentTime.toFixed(2) + " / " + wind.duration.toFixed(2), this.position.x - 50, this.position.y - 20);
        
        ctx.textAlign = "right";
        ctx.font = "15px Courier New";
        const d = 15;
        ctx.fillStyle = colorLerp("#00bb44", "#dd0000", wind.volume);
        ctx.fillText("wind: " + wind.volume.toFixed(2), this.position.x, this.position.y);
        ctx.fillStyle = colorLerp("#00bb44", "#dd0000", base1.volume);
        ctx.fillText("level1: " + base1.volume.toFixed(2), this.position.x, this.position.y + 1*d);
        ctx.fillStyle = colorLerp("#00bb44", "#dd0000", base2.volume);
        ctx.fillText("level2: " + base2.volume.toFixed(2), this.position.x, this.position.y + 2*d);
        ctx.fillStyle = colorLerp("#00bb44", "#dd0000", base3.volume);
        ctx.fillText("level3: " + base3.volume.toFixed(2), this.position.x, this.position.y + 3*d);
        ctx.fillStyle = colorLerp("#00bb44", "#dd0000", laser.volume);
        ctx.fillText("laser: " + laser.volume.toFixed(2), this.position.x, this.position.y + 4*d);
        ctx.fillStyle = colorLerp("#00bb44", "#dd0000", emitter.volume);
        ctx.fillText("emitter: " + emitter.volume.toFixed(2), this.position.x, this.position.y + 5*d);
        ctx.fillStyle = colorLerp("#00bb44", "#dd0000", target1.volume);
        ctx.fillText("target1: " + target1.volume.toFixed(2), this.position.x, this.position.y + 6*d);
        ctx.fillStyle = colorLerp("#00bb44", "#dd0000", target2.volume);
        ctx.fillText("target2: " + target2.volume.toFixed(2), this.position.x, this.position.y + 7*d);
        ctx.fillStyle = colorLerp("#00bb44", "#dd0000", beat.volume);
        ctx.fillText("beat: " + beat.volume.toFixed(2), this.position.x, this.position.y + 9*d);
        ctx.fillStyle = colorLerp("#00bb44", "#dd0000", crash.volume);
        ctx.fillText("crash: " + crash.volume.toFixed(2), this.position.x, this.position.y + 8*d);
    }
}