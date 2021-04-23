const body2 = document.getElementById("body2");
const can = document.getElementById("can");
can.addEventListener("dragover", (e) => {
  e.preventDefault();
});

can.addEventListener("dragenter", (e) => {
  can.classList.add("dragover");
  e.preventDefault();
});

can.addEventListener("dragleave", (e) => {
  can.classList.remove("dragover");
  e.preventDefault();
});

const ctx = can.getContext("2d");
let originalData = null;

const loadImage = (src) => {
  const img = new Image();
  img.onload = () => {
    can.width = img.width;
    can.height = img.height;
    // const scale = Math.min(can.width, can.height) / Math.max(img.width, img.height);
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, can.width, can.height);
    can.style.width = null;
    can.style.height = null;
    originalData = ctx.getImageData(0, 0, img.width, img.height);

    // document.getElementById("upload-icon").style.display = "none";
    document.getElementById("no-image-warning").style.display = "none";
    settings.forEach((elem) => elem.disabled = false);

    requestRedraw();
  };
  img.src = src;
};

const imgInput = document.getElementById("img-input");

can.addEventListener("drop", (e) => {
  can.classList.remove("dragover");
  if (e.dataTransfer.items) {
    const item = e.dataTransfer.items[0];
    if (item.kind === "file") {
      const file = item.getAsFile();
      loadImage(URL.createObjectURL(file));
    }
  }
  e.preventDefault();
});

can.addEventListener("click", (e) => {
  imgInput.click();
});

imgInput.addEventListener("change", (e) => {
  loadImage(URL.createObjectURL(e.target.files[0]));
});

const loadingMessage = document.getElementById("loading");

let minThreshold = 50;
let maxThreshold = 255;
let thresholdType = 6;
let sortType = 4;
let sortDirection = "vertical";
let sortFlipDirection = false;
let sortChance = 0.95;

let redrawQueued = false;
let redrawCooldownActive = false;
const redraw = () => {
  if (originalData === null) {
    redrawQueued = false;
    return;
  }
  loadingMessage.style.display = "none";

  const w = originalData.width;
  const h = originalData.height;

  const ogRaw = originalData.data;
  const editedData = new ImageData(w, h);
  const raw = editedData.data;
  raw.set(ogRaw);

  const thresholdFunc = (color) => {
    return color[thresholdType] >= (minThreshold / 255) && color[thresholdType] <= (maxThreshold / 255);
  }

  const getColor = (x, y) => {
    const i = (x + (y * w)) << 2;
    red = raw[i + 0] / 255;
    grn = raw[i + 1] / 255;
    blu = raw[i + 2] / 255;
    opa = raw[i + 3] / 255;
    const hsl = rgb_hsl(red, grn, blu);
    return [red, grn, blu, opa, hsl[0], hsl[1], hsl[2]];
  }

  const colorValFunc = (color) => {
    return sortFlipDirection ? -color[sortType] : color[sortType];
  }

  if (sortDirection === "horizontal") {
    for (let y = 0; y < h; y++) {
      if(Math.random() > sortChance){
        continue;
      }
      let xMin = 0;
      let xMax = 0;
      let currentlyValid = false;
      let x = 0;
      let intervalColors = [];
      let intervalVals = [];
      while (x <= w) {

        let color;
        if (x < w) {
          color = getColor(x, y);
        }

        if (x < w && thresholdFunc(color) && (sortChance === 1 || Math.random() < sortChance)) {
          currentlyValid = true;

          const colorVal = colorValFunc(color);
          const intervalIndex = sortedIndex(intervalVals, colorVal);
          intervalVals.splice(intervalIndex, 0, colorVal);
          intervalColors.splice(intervalIndex, 0, color);
        } else {
          // at end of an interval
          xMax = x;

          // if the interval was valid
          if (currentlyValid) {
            let j = 0;
            for (let x2 = xMin; x2 < xMax; x2++) {
              const i = (x2 + (y * w)) << 2;
              const color = intervalColors[j];
              raw[i + 0] = color[0] * 255;
              raw[i + 1] = color[1] * 255;
              raw[i + 2] = color[2] * 255;
              // raw[i + 3] = color[3] * 255;
              j++;
            }
          }
          xMin = x + 1;
          currentlyValid = false;
          intervalColors = [];
          intervalVals = [];
        }
        x++;
      }
    }
  } else if (sortDirection === "vertical") {
    for (let x = 0; x < w; x++) {
      let yMin = 0;
      let yMax = 0;
      let currentlyValid = false;
      let y = 0;
      let intervalColors = [];
      let intervalVals = [];
      while (y <= h) {

        let color;
        if (y < h) {
          color = getColor(x, y);
        }

        if (y < h && thresholdFunc(color) && (sortChance === 1 || Math.random() < sortChance)) {
          currentlyValid = true;

          const colorVal = colorValFunc(color);
          const intervalIndex = sortedIndex(intervalVals, colorVal);
          intervalVals.splice(intervalIndex, 0, colorVal);
          intervalColors.splice(intervalIndex, 0, color);
        } else {
          // at end of an interval
          yMax = y;

          // if the interval was valid
          if (currentlyValid) {
            let j = 0;
            for (let y2 = yMin; y2 < yMax; y2++) {
              const i = (x + (y2 * w)) << 2;
              const color = intervalColors[j];
              raw[i + 0] = color[0] * 255;
              raw[i + 1] = color[1] * 255;
              raw[i + 2] = color[2] * 255;
              // raw[i + 3] = color[3] * 255;
              j++;
            }
          }
          yMin = y + 1;
          currentlyValid = false;
          intervalColors = [];
          intervalVals = [];
        }
        y++;
      }
    }
  }

  ctx.putImageData(editedData, 0, 0);
  redrawQueued = false;
  redrawCooldownActive = true;
  window.setTimeout(() => {
    redrawCooldownActive = false;
    if (redrawQueued) {
      window.requestAnimationFrame(redraw);
    }
  }, 200);
}

const requestRedraw = () => {
  if (redrawQueued) {
    return;
  }

  loadingMessage.style.display = "inherit";
  redrawQueued = true;
  if (!redrawCooldownActive) {
    window.requestAnimationFrame(redraw);
  }
}

const settings = [
  [
    document.getElementById("threshold-slider-min"),
    document.getElementById("threshold-slider-max"),
    document.getElementById("sort-flip"),
    document.getElementById("sort-direction"),
    document.getElementById("random-slider"),
  ],
  Array.from(document.getElementsByName("threshold-radio")),
  Array.from(document.getElementsByName("sort-radio")),
].flat();

const minThresholdSlider = document.getElementById("threshold-slider-min");
minThresholdSlider.value = minThreshold;
minThresholdSlider.addEventListener("input", (e) => {
  minThreshold = parseInt(e.target.value);
  maxThreshold = Math.max(minThreshold, maxThreshold);
  maxThresholdSlider.value = maxThreshold;
  requestRedraw();
});
const maxThresholdSlider = document.getElementById("threshold-slider-max");
maxThresholdSlider.value = maxThreshold;
maxThresholdSlider.addEventListener("input", (e) => {
  maxThreshold = parseInt(e.target.value);
  minThreshold = Math.min(minThreshold, maxThreshold);
  minThresholdSlider.value = minThreshold;
  requestRedraw();
});

const sortFlipCheckbox = document.getElementById("sort-flip");
sortFlipCheckbox.checked = sortFlipDirection;
sortFlipCheckbox.addEventListener("input", (e) => {
  sortFlipDirection = e.target.checked;
  requestRedraw();
});
const sortDirectionCheckbox = document.getElementById("sort-direction");
sortDirectionCheckbox.checked = sortDirection === "vertical";
sortDirectionCheckbox.addEventListener("input", (e) => {
  sortDirection = e.target.checked ? "vertical" : "horizontal";
  requestRedraw();
});

const randomSlider = document.getElementById("random-slider");
randomSlider.value = Math.pow(sortChance * 1000, 2);
randomSlider.addEventListener("input", (e) => {
  sortChance = Math.sqrt(parseInt(e.target.value) / 1000);
  requestRedraw();
});

document.getElementsByName("threshold-radio").forEach((elem) => {
  elem.addEventListener("change", () => {
    if (elem.checked) {
      thresholdType = parseInt(elem.value);
      requestRedraw();
    }
  });
});

document.getElementsByName("sort-radio").forEach((elem) => {
  elem.addEventListener("change", () => {
    if (elem.checked) {
      sortType = parseInt(elem.value);
      requestRedraw();
    }
  });
});

settings.forEach((elem) => elem.disabled = true);

const rgb_hsl = (r, g, b) => {
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

sortedIndex = (array, value) => {
  var low = 0,
    high = array.length;

  while (low < high) {
    var mid = (low + high) >>> 1;
    if (array[mid] < value) low = mid + 1;
    else high = mid;
  }
  return low;
}