class ResultShape extends VPObject {
    constructor(vp, partEditor, depth = 4, {} = {}) {
        super(vp, {
            "mouseListening": false,
            "zOrder": 8
        });
        this.partEditor = partEditor;
        this.nodeLists = partEditor.separateNodes();
        this.maxDepth = 5;
    }

    isOverlapping(point) {
        return false;
    }

    isMouseBlocking(self) {
        return true;
    }

    draw(ctx) {
        this.drawPart(ctx, new NPoint(), 0, 1, this.maxDepth);
        // this.drawPart(ctx, this.rootNode, new Set(), new Set(), new NPoint(), 1, 1, 5);
    }

    drawPart(ctx, srcPos, srcRot, srcScale, depthCounter) {
        if (depthCounter <= 0) {
            return;
        }

        ctx.lineCap = "round";
        const a = colorLerp("#4dff7c", "#fca63d", depthCounter / this.maxDepth);
        const b = colorLerp("#3d73fc", "#fc3d60", depthCounter / this.maxDepth);
        ctx.strokeStyle = colorLerp(a, b, Math.cos(srcRot / 3) / 2 + 0.5);
        ctx.lineWidth = 1 * this.vp.zoomFactor;

        for (const rootNode of this.nodeLists[1]) {
            const rott = srcRot + rootNode.rotation;
            const scal = srcScale / rootNode.scale;
            for (const seg of this.partEditor.links) {
                let posA = seg.nodeA.dPosition.subtractp(rootNode.dPosition).rotate(rott).multiply1(scal).addp(srcPos);
                let posB = seg.nodeB.dPosition.subtractp(rootNode.dPosition).rotate(rott).multiply1(scal).addp(srcPos);

                this.strokeLine(ctx, posA.multiply1(100), posB.multiply1(100));
            }
            for (const branchNode of this.nodeLists[2]) {
                const posR = branchNode.dPosition.subtractp(rootNode.dPosition).rotate(rott).multiply1(scal).addp(srcPos);
                this.drawPart(ctx, posR, rott - branchNode.rotation, scal * branchNode.scale, depthCounter - 1);
            }
        }
    }

    // drawPart(vp, ctx, rootNode, node, drawnLinks, drawnNodes, srcPos, srcRot, srcScale, depthCounter) {
    //     if (depthCounter <= 0) {
    //         return;
    //     }
    //     ctx.lineCap = "round";
    //     drawnNodes.add(rootNode);
    //     for (const seg of node.links) {
    //         if (!drawnLinks.has(seg)) {
    //             drawnLinks.add(seg);
    //             let otherNode = (seg.nodeA == node) ? seg.nodeB : seg.nodeA;

    //             let posA = node.dPosition.subtractp(rootNode.dPosition).multiply1(srcScale).addp(srcPos);
    //             let posB = otherNode.dPosition.subtractp(rootNode.dPosition).multiply1(srcScale).addp(srcPos);
    //             ctx.strokeStyle = "black";
    //             ctx.lineWidth = 5 * vp.zoomFactor;
    //             this.strokeLine(vp, ctx, posA.multiply1(100), posB.multiply1(100));
    //             if (!drawnNodes.has(otherNode)) {
    //                 this.drawPart(vp, ctx, rootNode, otherNode, drawnLinks, drawnNodes, srcPos, srcRot, srcScale, depthCounter);
    //                 if (otherNode.nodeState == 2) {
    //                     this.drawPart(vp, ctx, rootNode, rootNode, new Set(), new Set(), posB, otherNode.rotation, srcScale * otherNode.scale, depthCounter - 1);
    //                 }
    //             }
    //         }
    //     }
    // }
}
IVPNode.nodeStates = ["Plain", "Root", "Branch", "Both"]