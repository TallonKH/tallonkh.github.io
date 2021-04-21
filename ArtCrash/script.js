const can = document.getElementById("can");
const ctx = can.getContext("2d");
can.width = 512;
can.height = 512;

const defaultDrawFunc = (ctx, brush) => drawImage(ctx, brush, mousePos, 0);
const dataManipFunc = (ctx, scale, func) => {
  const ds = scale >> 1;
  const dx = mousePos[0] - ds;
  const dy = mousePos[1] - ds;
  const imageData = ctx.getImageData(dx, dy, scale, scale);
  func(imageData);
  ctx.putImageData(imageData, dx, dy);
}
const brushes = [{
    name: "Cursor",
    iconDrawing: true,
    iconPath: "./images/cursor.png",
    scale: 0.5,
    img: null,
    toolbarButton: null,
    drawFunc: defaultDrawFunc,
  },
  {
    name: "Wheel",
    iconDrawing: true,
    iconPath: "./images/wheel.png",
    scale: 0.6,
    img: null,
    toolbarButton: null,
    drawFunc: (ctx, imgDat) => drawImage(ctx, imgDat, mousePos, time * 20),
  },
  {
    name: "Shift",
    iconDrawing: false,
    iconPath: "./images/shift.png",
    scale: 200,
    img: null,
    toolbarButton: null,
    drawFunc: (ctx, brushDat) => dataManipFunc(ctx, brushDat.scale, (data) => {
      const raw = data.data;
      for (let i = 0; i < raw.length - 4; i++) {
        raw[i] = raw[i + 4];
        raw[i + 1] = raw[i + 5];
        raw[i + 2] = raw[i + 6];
        raw[i + 3] = raw[i + 7];
      }
    }),
  },
  {
    name: "Sort",
    iconDrawing: false,
    iconPath: "./images/sort.png",
    scale: 200,
    img: null,
    toolbarButton: null,
    drawFunc: (ctx, brushDat) => dataManipFunc(ctx, brushDat.scale, (data) => {
      const raw = data.data;
      for (let x = 0; x < data.width; x++) {
        for (let y = 0; y < data.height - 1; y++) {
          const i1 = (x + y * data.width) * 4;
          const i2 = i1 + data.width * 4;

          const hsl1 = rgb_hsl(raw[i1] / 255, raw[i1 + 1] / 255, raw[i1 + 2] / 255);
          const hsl2 = rgb_hsl(raw[i2] / 255, raw[i2 + 1] / 255, raw[i2 + 2] / 255);

          if (hsl1[0] < hsl2[0]) {
            const r1 = raw[i1];
            const g1 = raw[i1 + 1];
            const b1 = raw[i1 + 2];
            raw[i1] = raw[i2];
            raw[i1 + 1] = raw[i2 + 1];
            raw[i1 + 2] = raw[i2 + 2];
            raw[i2] = r1;
            raw[i2 + 1] = g1;
            raw[i2 + 2] = b1;
          }
        }
      }
    }),
  },
  {
    name: "Canvas",
    iconDrawing: false,
    iconPath: "./images/missing.png",
    scale: 1,
    img: can,
    toolbarButton: null,
    drawFunc: defaultDrawFunc,
  },
];

let activeImage = 0;

let mouseIn = false;
can.addEventListener("mouseenter", (e) => {
  mouseIn = true;
});

can.addEventListener("mouseleave", (e) => {
  mouseIn = false;
});

const eToMousePos = (e) => [
  ~~((e.offsetX / displayDims[0]) * can.width),
  ~~((e.offsetY / displayDims[1]) * can.height)
];

let displayDims = null;
new ResizeObserver((es) => {
  const e = es[0];
  displayDims = [e.contentRect.width, e.contentRect.height];
}).observe(can);

drawImage = (ctx, imgDat, position, rotation) => {
  const img = imgDat.img;
  const width = ~~(img.width * imgDat.scale);
  const height = ~~(img.height * imgDat.scale);

  ctx.setTransform(1, 0, 0, 1, position[0], position[1]); // sets scale and origin
  ctx.rotate(rotation);
  ctx.drawImage(img,
    0, 0,
    img.width, img.height,
    -(width >> 1), -(height >> 1),
    width, height);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

let drawSize = 1;
let mousePos = null;
can.addEventListener("mousemove", (e) => {
  mousePos = eToMousePos(e);

  if (mouseDown) {
    const imgDat = brushes[activeImage];
    imgDat.drawFunc(ctx, imgDat);
  }

  lastMousePos = mousePos;
});

let time = 0;
window.setInterval((e) => {
  time += 0.033;
}, 33);

let mouseDown = false;
let mouseDownPos = null;
can.addEventListener("mousedown", (e) => {
  mouseDown = true;
  mouseDownPos = eToMousePos(e);
});

document.addEventListener("mouseup", (e) => {
  mouseDown = false;
});


const toolbar = document.getElementById("brushes");
for (let i = 0; i < brushes.length; i++) {
  const brush = brushes[i];
  // iconDrawing = it draws its icon
  if (brush.iconPath !== null && brush.iconDrawing) {
    const img = new Image();
    img.onload = () => {
      brush.img = img;
    }
    // img.crossOrigin = "data";
    img.src = brush.iconPath;
  }

  const button = document.createElement("div");
  brush.toolbarButton = button;
  button.className = "toolbar-item";
  button.addEventListener("click", (e) => {
    brushes[activeImage].toolbarButton.classList.remove("selected");
    activeImage = i;
    button.classList.add("selected");
  });
  const buttonIcon = document.createElement("img");
  if (brush.iconPath !== null) {
    buttonIcon.src = brush.iconPath;
  }
  button.appendChild(buttonIcon);
  toolbar.appendChild(button);
}

rgb_hsl = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  let s;
  let l = (max + min) / 2;
  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}