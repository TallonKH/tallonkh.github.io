const gpu = new GPU();

const canvasParent = document.getElementById('canvas-parent');
// canvas screen dims
let rect;
let cansw;
let cansh;

// canvas data dims
let canw = 800;
let canh = 800;

let simRes = 0.5;
let simw;
let simh;

let dispRes = 1;
let dispw;
let disph;

const dotCount = 10000;

const blurRadiusOptions = [1, 2, 3];
const blurFactorOptions = [0.05, 0.075, 0.1, 0.125, 0.15, 0.25];
const decayFactorOptions = [0.001, 0.005, 0.01, 0.02];
const searchDistanceOptions = [3, 4];
const searchRadiusOptions = [0, 1, 2];
const searchAngleOptions = [0.2, 0.3, 0.4, 0.5];
const changeAngleOptions = [0.2, 0.3, 0.4, 0.5];
const straightRandomOptions = [0.05, 0.1, 0.2, 0.5];
const inversionOptions = [0, 0, 0, 0, 0, 0, 0, 1];
const args = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const pickRandom = (list) => {
  return list[~~(Math.random() * list.length)];
};

const popRandom = (list) => {
  const i = ~~(Math.random() * list.length);
  const elem = list[i];
  list.splice(i, 1);
  return elem;
};

const scrambleArgs = () => {
  args[0] = pickRandom(blurRadiusOptions);
  args[1] = pickRandom(blurFactorOptions);
  args[2] = pickRandom(decayFactorOptions);
  args[3] = pickRandom(searchDistanceOptions);
  args[4] = pickRandom(searchRadiusOptions);
  args[5] = pickRandom(searchAngleOptions);
  args[6] = pickRandom(changeAngleOptions);
  args[7] = pickRandom(inversionOptions);

  const rgbs = [0, 1, 2];
  const r = popRandom(rgbs);
  const g = popRandom(rgbs);
  const b = popRandom(rgbs);
  args[8] = r | (g << 2) | (b << 4);
};

// function to dispose of most recent sim/disp kernels
let disposalFunc = null;
// most recent simulation kernel
let gridKernel = null;
// most recent simulation kernel
let dotKernel = null;
// most recent display kernel
let dispKernel = null;

// grid/dots are created in setup()
let grid = null;
let dots = null;

const updateDims = () => {
  simw = ~~(canw * simRes);
  simh = ~~(canh * simRes);
  dispw = ~~(canw * dispRes);
  disph = ~~(canh * dispRes);
}
// updateDims();

const onWindowChangeEnd = () => {
  rect = canvasParent.getBoundingClientRect();
  cansw = rect.width;
  cansh = rect.height;

  // console.log("resize end ", canw, canh);
  // do this because the gpu messes up when the canvas isn't square and the inputs are floats 

  // canw = Math.floor(Math.min(canw, canh));
  // canh = canw;

  // updateDims();
  // setup();
}

let windowChangeTimer = null;
const requestWindowChangeEndEvent = () => {
  // call onWindowChangeEnd when window change has stopped
  window.clearTimeout(windowChangeTimer);
  windowChangeTimer = window.setTimeout(() => {
    onWindowChangeEnd();
  }, 200);
}



// function to create a new kernel (only needed upon resize)
const setup = () => {
  // toss out the previous kernels
  if (disposalFunc !== null) {
    disposalFunc();
  }
  let disposed = false;

  // create a new grid data
  grid = new Array(simw);
  for (let x = 0; x < simw; x++) {
    const col = new Array(simh);
    grid[x] = col;
    for (let y = 0; y < simh; y++) {
      // flatGrid[x + y * simw] = Math.min(x / simw, y / simh);
      col[y] = 0;
      // col[y] = Math.pow(Math.random(), 5);
    }
  }

  dots = new Array(dotCount);
  for (let i = 0; i < dotCount; i++) {
    dots[i] = [
      simw / 2, // x
      simh / 2, // y
      Math.random() * Math.PI * 2 // rotation
    ];
  }


  // create a new simulation kernel for the grid
  gridKernel = gpu.createKernel(function (grid1D, w, h, args) {
    const x = this.thread.x;
    const y = this.thread.y;

    const yw = y * w;

    const center = grid1D[x + yw];

    let sum = 0;
    let count = 0;

    const blurRadius = args[0];
    for (let ox = Math.max(0, x - blurRadius); ox <= Math.min(w - 1, x + blurRadius); ox++) {
      for (let oy = Math.max(0, y - blurRadius); oy <= Math.min(h - 1, y + blurRadius); oy++) {
        sum += grid1D[ox + oy * w];
        count++;
      }
    }

    const blurFactor = args[1];
    const decayFactor = args[2];

    return Math.max(0, ((sum / count) * blurFactor) + (center * (1 - blurFactor)) - decayFactor);
  }, {
    output: [simw, simh],
    tactic: 'speed'
  });


  // create a new simulation kernel for the dots
  dotKernel = gpu.createKernel(function (grid, dots, simw, simh, args) {
    const i = this.thread.x;

    const x = dots[i][0];
    const y = dots[i][1];

    let rot = dots[i][2];
    const dx = Math.cos(rot);
    const dy = Math.sin(rot);

    // {
    //   const searchDistMin = 1;
    //   const searchDistMax = 1;
    //   let bestAngle = rot;
    //   let bestVal = 0;
    //   for (let r = searchDistMin; r <= searchDistMax; r++) {
    //     const deltaAngle = 1 / (3.14159 * r);
    //     for (let angle = rot - 1; angle <= rot + 1; angle += deltaAngle) {
    //       const val = grid[Math.floor(x + Math.cos(angle) * r)][Math.floor(y + Math.sin(angle) * r)];
    //       if(val > bestVal){
    //         bestAngle = angle;
    //         bestVal = val;
    //       }
    //     }
    //   }
    //   rot = bestAngle;
    // }

    const searchDistance = args[3];
    const searchRadius = args[4];
    const searchAngle = args[5];

    let valAhead = 0; {
      const cx = x + dx * searchDistance;
      const cy = y + dy * searchDistance;
      const minX = Math.max(0, cx - searchRadius);
      const maxX = Math.min(simw - 1, cx + searchRadius);
      const minY = Math.max(0, cy - searchRadius);
      const maxY = Math.min(simh - 1, cy + searchRadius);
      for (let sx = minX; sx <= maxX; sx++) {
        for (let sy = minY; sy <= maxY; sy++) {
          valAhead += grid[Math.floor(sx)][Math.floor(sy)];
        }
      }
    }
    let valLeft = 0; {
      const cx = x + Math.cos(rot - searchAngle) * searchDistance;
      const cy = y + Math.sin(rot - searchAngle) * searchDistance;
      const minX = Math.max(0, cx - searchRadius);
      const maxX = Math.min(simw - 1, cx + searchRadius);
      const minY = Math.max(0, cy - searchRadius);
      const maxY = Math.min(simh - 1, cy + searchRadius);
      for (let sx = minX; sx <= maxX; sx++) {
        for (let sy = minY; sy <= maxY; sy++) {
          valLeft += grid[Math.floor(sx)][Math.floor(sy)];
        }
      }
    }
    let valRight = 0; {
      const cx = x + Math.cos(rot + searchAngle) * searchDistance;
      const cy = y + Math.sin(rot + searchAngle) * searchDistance;
      const minX = Math.max(0, cx - searchRadius);
      const maxX = Math.min(simw - 1, cx + searchRadius);
      const minY = Math.max(0, cy - searchRadius);
      const maxY = Math.min(simh - 1, cy + searchRadius);
      for (let sx = minX; sx <= maxX; sx++) {
        for (let sy = minY; sy <= maxY; sy++) {
          valRight += grid[Math.floor(sx)][Math.floor(sy)];
        }
      }
    }

    if (valAhead < valLeft || valAhead < valRight) {
      const changeAngle = args[6];
      const invert = args[7];
      rot += (Math.random() * 0.5 + 0.5) * (((invert === 0) ? (valLeft > valRight) : (valLeft < valRight)) ? -changeAngle : changeAngle);
    } else {
      const straightRandom = args[7];
      rot += Math.random() * straightRandom - (straightRandom / 2);
    }

    // edge bounce
    if (x <= 1 || y <= 1 || x >= simw - 1 || y >= simh - 1) {
      return [Math.min(simw - 1, Math.max(1, x - dx)), Math.min(simh - 1, Math.max(1, y - dy)), Math.random() * 6.283185];
    } else {
      if (rot > 6.2831) {
        rot -= 6.2831;
      } else if (rot < 0) {
        rot += 6.2831;
      }
      return [x + dx, y + dy, rot];
    }
  }, {
    output: [dotCount],
    tactic: 'speed'
  });

  // create a new display kernel
  dispKernel = gpu.createKernel(function (grid, simw, simh, args) {
    const x = this.thread.x;
    const y = this.thread.y;
    const dispw = this.output.x;
    const disph = this.output.y;

    const pixel = grid[(x * simw / dispw) + Math.floor(y * simh / disph) * simw];
    const peak = Math.max(0, 10 * (pixel - 0.9));
    const mid = Math.max(0, 3 * (pixel - 0.66));

    const r = (args[8] & 0b000011);
    const g = (args[8] & 0b001100) >> 2;
    const b = (args[8] & 0b110000) >> 4;
    this.color(
      (r === 0) ? pixel : (r === 1 ? mid : peak),
      (g === 0) ? pixel : (g === 1 ? mid : peak),
      (b === 0) ? pixel : (b === 1 ? mid : peak),
      1
    );
  }, {
    output: [dispw, disph],
    tactic: 'speed',
    optimizeFloatMemory: true,
  }).setGraphical(true);

  canvasParent.appendChild(dispKernel.canvas);
  dispKernel.canvas.className = "display";
  dispKernel.canvas.style.width = "100vmin";
  dispKernel.canvas.style.height = "100vmin";

  dispKernel.canvas.addEventListener("click", (e) => {
    e.preventDefault();
    const x = ~~Math.max(0, Math.min((1 - (e.clientY - rect.top) / cansh) * simw, simw - 1));
    const y = ~~Math.max(0, Math.min(((e.clientX - rect.left) / cansw) * simh, simh - 1));
    
    if(e.shiftKey){
      for (let n = 0; n < dotCount; n++) {
        dots[n] = [
          x,
          y,
          Math.random() * 6.28318
        ];
      }
    }else{
      for (let n = 0; n < dotCount * 0.1; n++) {
        const i = ~~(Math.random() * dotCount);
        dots[i] = [
          x,
          y,
          Math.random() * 6.28318
        ];
      }
    }
  });

  disposalFunc = () => {
    canvasParent.removeChild(dispKernel.canvas);
    disposed = true;
  };
}

const updateSim = () => {
  updatePending = false;

  if (grid === null || dots === null) {
    return;
  }

  if (dispKernel !== null) {
    dispKernel(grid, simw, simh, args);
  }

  if (dotKernel !== null) {
    dots = dotKernel(grid, dots, simw, simh, args);
  }
  let dot;
  for (let i = 0; i < dotCount; i++) {
    dot = dots[i];
    grid[~~dot[0]][~~dot[1]] = 1;
  }
  if (gridKernel !== null) {
    grid = gridKernel(grid, simw, simh, args);
  }
}

let updatePending = false;

window.setInterval(() => {
  if (!updatePending) {
    updatePending = true;
    window.requestAnimationFrame(updateSim);
  }
}, ~~(1000 / 60));

document.addEventListener("keypress", (e) => {
  if (e.key === " ") {
    scrambleArgs();
    e.preventDefault();
  }
});

// window change on scroll
document.addEventListener("scroll", requestWindowChangeEndEvent)
// window change on resize
new ResizeObserver(requestWindowChangeEndEvent).observe(canvasParent);

scrambleArgs();
updateDims();
setup();