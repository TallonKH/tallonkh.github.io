class PartEditor extends Viewport {
    constructor({} = {}) {
        super({
            "minZoomFactor": 0.25,
            "maxZoomFactor": 2,
            "pannable": true,
            "zoomSensitivity": 1,
            "panSensitivity": 0.5,
            "zoomCenter": "mouse"
        });

        // this.grabbedObj = null;
        // this.mouseLink = null;
        this.links = new Set();
        this.linkPairCodes = new Set();
        this.nodes = new Set();
        this.partChangeListeners = new Set();

        this.setupNodes();
        this.colorFunc = function (nvars) {
            return colorLerp(
                colorLerp("#CE4257", "#F3A712", Math.cos(nvars["srcRot"]) / 2 + 0.5) || "#CE4257",
                colorLerp("#5544C4", "#76E6B3", Math.cos(nvars["brnRot"]) / 2 + 0.5) || "#76E6B3",
                nvars["depth"] / nvars["maxDepth"]);
        };
        this.widthFunc = function (nvars) {
            return 4;
        };;

        this.background.color = "#1a1a1a";

        IVPNode.globalInit(this);
    }

    setupNodes() {
        const radius = 3;
        this.nodeGrid = new Array(radius * 2 + 1);
        for (let ix = -radius; ix <= radius; ix++) {

            const row = new Array(radius * 2 + 1);
            this.nodeGrid[ix + radius] = row;

            for (let iy = -radius; iy <= radius; iy++) {
                const node = new IVPNode(this, new NPoint(ix, iy));
                node.position = new NPoint(ix * 100, iy * 100);
                this.nodes.add(node);
                row[iy + radius] = node;
                this.registerObj(node);
            }
        }
    }

    randomShape(){
        Array.from(this.links).forEach(s => s.destroyLink());
        this.nodes.forEach(function(node){
            node.nodeState = 0
            node.rotation = 0;
        });

        const grabbedNodes = randSample(
            Array.from(this.nodes), 
            3 + Math.floor(Math.random() * 4));
        
        grabbedNodes.forEach(function(node){
            node.nodeState = 2;
            node.rotation = Math.random() * Math.PI * 2;
            node.rotators.forEach(r => r.recalcEndpoint());
        });
        grabbedNodes[0].nodeState = 1;
        this.nodes.forEach(node => node.nodeStateChanged());


        const linkCount = 1 + Math.floor(Math.random() * 4);
        const linkNodesA = randSample(Array.from(this.nodes), linkCount);
        const linkNodesB = randSample(Array.from(this.nodes), linkCount);
        for(let i=0; i<linkCount; i++){
            IVPNode.makeLink(this, linkNodesA[i], linkNodesB[i]);
        }
    }

    postOnMouseMove() {
        super.postOnMouseMove();
        this.queueRedraw();
        // console.log(this.mouseOverObjIds);
        // console.log(this.mouseOverObjIdsSorted);
    }

    separateNodes() {
        const result = [
            [],
            [],
            []
        ];
        for (const node of this.nodes) {
            if (node.nodeState == 3) {
                result[1].push(node);
                result[2].push(node);
            } else {
                result[node.nodeState].push(node);
            }
        }
        return result;
    }

    clearShape() {
        this.forgetAll()
        this.links = new Set();
        this.nodes = new Set();
        this.setupNodes();
        this.partChanged();
    }

    onNodeChanged(node) {
        this.partChanged();
    }

    onLinkMade(link) {
        this.partChanged();
    }

    onLinkDestroyed(link) {
        this.partChanged();
    }

    partChanged() {
        for (const func of this.partChangeListeners) {
            func();
        }
    }
}