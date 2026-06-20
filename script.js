const WIDTH = 1100;
const HEIGHT = 760;
const TEAL = "#147f83";
const WHITE = "#ffffff";
const RED = "#ec3434";
const BLUE = "#184fd4";

const intro = document.querySelector("#intro");
const stage = document.querySelector("#stage");
const playButton = document.querySelector("#playButton");
const drawingCanvas = document.querySelector("#drawingCanvas");
const cursorCanvas = document.querySelector("#cursorCanvas");
const drawCtx = drawingCanvas.getContext("2d");
const cursorCtx = cursorCanvas.getContext("2d");

let redTurtle;
let blueTurtle;
let animationStarted = false;

class Turtle {
  constructor(color, x, y, heading = 0) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.heading = heading;
    this.visible = true;
    this.lineWidth = 5;
  }

  async moveTo(x, y, { draw = false, duration = 360 } = {}) {
    const startX = this.x;
    const startY = this.y;
    const dx = x - startX;
    const dy = y - startY;
    this.heading = Math.atan2(dy, dx);

    if (draw) {
      drawCtx.save();
      drawCtx.strokeStyle = this.color;
      drawCtx.lineWidth = this.lineWidth;
      drawCtx.lineCap = "round";
      drawCtx.lineJoin = "round";
      drawCtx.beginPath();
      drawCtx.moveTo(startX, startY);
      drawCtx.restore();
    }

    await tween(duration, (progress) => {
      const nextX = startX + dx * progress;
      const nextY = startY + dy * progress;

      if (draw) {
        drawCtx.save();
        drawCtx.strokeStyle = this.color;
        drawCtx.lineWidth = this.lineWidth;
        drawCtx.lineCap = "round";
        drawCtx.lineJoin = "round";
        drawCtx.lineTo(nextX, nextY);
        drawCtx.stroke();
        drawCtx.restore();
      }

      this.x = nextX;
      this.y = nextY;
      renderCursors();
    });
  }

  async polyline(points, durationPerSegment = 210) {
    if (!points.length) return;
    await this.moveTo(points[0][0], points[0][1], { duration: 280 });
    for (let i = 1; i < points.length; i += 1) {
      await this.moveTo(points[i][0], points[i][1], {
        draw: true,
        duration: durationPerSegment,
      });
    }
  }

  async circle(cx, cy, radius, duration = 900, start = 0, end = Math.PI * 2) {
    const startX = cx + Math.cos(start) * radius;
    const startY = cy + Math.sin(start) * radius;
    await this.moveTo(startX, startY, { duration: 260 });

    let previousX = startX;
    let previousY = startY;
    await tween(duration, (progress) => {
      const angle = start + (end - start) * progress;
      const nextX = cx + Math.cos(angle) * radius;
      const nextY = cy + Math.sin(angle) * radius;
      this.heading = angle + Math.PI / 2;

      drawCtx.save();
      drawCtx.strokeStyle = this.color;
      drawCtx.lineWidth = this.lineWidth;
      drawCtx.lineCap = "round";
      drawCtx.lineJoin = "round";
      drawCtx.beginPath();
      drawCtx.moveTo(previousX, previousY);
      drawCtx.lineTo(nextX, nextY);
      drawCtx.stroke();
      drawCtx.restore();

      previousX = nextX;
      previousY = nextY;
      this.x = nextX;
      this.y = nextY;
      renderCursors();
    });
  }

  async bubbleText(text, x, y, size, duration = 900) {
    await this.moveTo(x, y - size * 0.28, { duration: 320 });
    await tween(duration, (progress) => {
      drawCtx.save();
      drawCtx.font = `900 ${size}px Impact, Arial Black, sans-serif`;
      drawCtx.textAlign = "center";
      drawCtx.textBaseline = "middle";
      drawCtx.lineJoin = "round";
      drawCtx.strokeStyle = this.color;
      drawCtx.lineWidth = Math.max(5, size * 0.11);
      drawCtx.fillStyle = WHITE;
      drawCtx.globalAlpha = progress;
      drawCtx.strokeText(text, x, y);
      drawCtx.fillText(text, x, y);
      drawCtx.restore();

      this.x = x + (measureText(text, size) / 2) * progress;
      this.y = y - size * 0.35;
      this.heading = 0;
      renderCursors();
    });
  }
}

function measureText(text, size) {
  drawCtx.save();
  drawCtx.font = `900 ${size}px Impact, Arial Black, sans-serif`;
  const width = drawCtx.measureText(text).width;
  drawCtx.restore();
  return width;
}

function tween(duration, onFrame) {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const tick = (now) => {
      const raw = Math.min(1, (now - startedAt) / duration);
      const eased = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      onFrame(eased);

      if (raw < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });
}

function setupCanvas(canvas, context) {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = WIDTH * ratio;
  canvas.height = HEIGHT * ratio;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function clearDrawing() {
  drawCtx.clearRect(0, 0, WIDTH, HEIGHT);
  drawCtx.fillStyle = WHITE;
  drawCtx.fillRect(0, 0, WIDTH, HEIGHT);
}

function renderCursors() {
  cursorCtx.clearRect(0, 0, WIDTH, HEIGHT);
  [redTurtle, blueTurtle].forEach((turtle) => {
    if (turtle?.visible) {
      drawClassicTurtle(cursorCtx, turtle.x, turtle.y, turtle.heading, turtle.color);
    }
  });
}

function drawClassicTurtle(ctx, x, y, heading, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = color;
  ctx.shadowColor = "rgba(0, 35, 38, 0.28)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(17, 0, 7, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  drawFlipper(ctx, -5, -10, -18, -19, -9, -3);
  drawFlipper(ctx, -5, 10, -18, 19, -9, 3);
  drawFlipper(ctx, 8, -9, 17, -17, 8, -2);
  drawFlipper(ctx, 8, 9, 17, 17, 8, 2);

  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.lineTo(-26, -6);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-26, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(19, -2, 1.2, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.restore();
}

function drawFlipper(ctx, x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

async function drawHeart(turtle, cx, cy, size) {
  const points = [];
  for (let i = 0; i <= 64; i += 1) {
    const t = (Math.PI * 2 * i) / 64;
    const x = cx + size * 16 * Math.pow(Math.sin(t), 3);
    const y =
      cy -
      size *
        (13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t));
    points.push([x, y]);
  }
  await turtle.polyline(points, 28);
}

async function drawRedLayer() {
  redTurtle.lineWidth = 7;
  await redTurtle.bubbleText("HAPPY", 550, 62, 82, 850);
  await redTurtle.bubbleText("BIRTHDAY", 550, 145, 74, 950);
  await redTurtle.bubbleText("DAD", 550, 232, 92, 800);

  redTurtle.lineWidth = 4;
  await drawHeart(redTurtle, 173, 92, 3.7);
  await drawHeart(redTurtle, 930, 92, 3.4);
  await drawHeart(redTurtle, 344, 250, 2.4);
  await drawHeart(redTurtle, 765, 247, 2.2);
  await redTurtle.polyline(
    [
      [220, 140],
      [185, 118],
      [222, 164],
      [180, 162],
    ],
    120,
  );
  await redTurtle.polyline(
    [
      [888, 140],
      [925, 118],
      [886, 164],
      [930, 162],
    ],
    120,
  );
}

async function drawBlueLayer() {
  blueTurtle.lineWidth = 3.2;

  await drawCloud(150, 238, 74);
  await drawCloud(225, 352, 54);
  await drawCloud(885, 250, 64);
  await drawCloud(720, 334, 36);

  blueTurtle.lineWidth = 3;
  await blueTurtle.polyline(
    [
      [20, 442],
      [150, 402],
      [272, 388],
      [385, 418],
      [520, 372],
      [657, 405],
      [775, 332],
      [902, 348],
      [1080, 318],
    ],
    115,
  );
  await blueTurtle.polyline(
    [
      [18, 482],
      [160, 444],
      [290, 434],
      [410, 462],
      [560, 420],
      [700, 450],
      [835, 392],
      [985, 420],
      [1090, 388],
    ],
    105,
  );

  blueTurtle.lineWidth = 2.7;
  await blueTurtle.polyline(
    [
      [690, 370],
      [735, 300],
      [785, 312],
      [838, 360],
      [904, 326],
      [1015, 360],
      [1090, 356],
    ],
    90,
  );
  await blueTurtle.polyline(
    [
      [740, 318],
      [724, 362],
      [706, 398],
      [783, 315],
      [790, 365],
      [824, 402],
    ],
    70,
  );

  await drawForestTexture();

  blueTurtle.lineWidth = 4;
  await drawRockLedge();
  await drawFather();
  await drawSon();
}

async function drawFather() {
  blueTurtle.lineWidth = 4.2;
  await blueTurtle.circle(460, 310, 30, 620);
  await blueTurtle.polyline(
    [
      [434, 292],
      [447, 278],
      [470, 276],
      [489, 292],
      [488, 318],
      [472, 334],
      [448, 333],
      [435, 316],
      [434, 292],
    ],
    64,
  );
  blueTurtle.lineWidth = 3.4;
  await blueTurtle.polyline(
    [
      [435, 354],
      [398, 392],
      [390, 482],
      [424, 512],
      [510, 510],
      [545, 480],
      [524, 392],
      [492, 354],
      [435, 354],
    ],
    84,
  );
  await blueTurtle.polyline(
    [
      [412, 400],
      [440, 455],
      [466, 494],
      [496, 450],
      [508, 400],
    ],
    78,
  );
  await blueTurtle.polyline(
    [
      [430, 510],
      [420, 604],
      [402, 710],
      [446, 710],
      [464, 608],
      [486, 710],
      [530, 710],
      [512, 606],
      [506, 510],
    ],
    86,
  );
  await blueTurtle.polyline(
    [
      [420, 720],
      [446, 720],
      [456, 708],
      [406, 708],
      [530, 720],
      [486, 720],
      [478, 708],
      [538, 708],
    ],
    60,
  );
  await blueTurtle.polyline([[448, 310], [457, 315], [472, 310]], 45);
  await blueTurtle.polyline([[450, 332], [462, 338], [478, 332]], 45);
}

async function drawSon() {
  blueTurtle.lineWidth = 4.2;
  await blueTurtle.circle(595, 320, 28, 620);
  await blueTurtle.polyline(
    [
      [570, 300],
      [582, 286],
      [606, 286],
      [622, 302],
      [621, 326],
      [606, 342],
      [582, 340],
      [569, 324],
      [570, 300],
    ],
    64,
  );
  blueTurtle.lineWidth = 3.4;
  await blueTurtle.polyline(
    [
      [545, 362],
      [528, 420],
      [540, 494],
      [642, 494],
      [656, 420],
      [638, 362],
      [545, 362],
    ],
    82,
  );
  await blueTurtle.polyline(
    [
      [540, 416],
      [586, 456],
      [654, 420],
    ],
    86,
  );
  await blueTurtle.polyline(
    [
      [650, 416],
      [598, 456],
      [534, 425],
    ],
    86,
  );
  await blueTurtle.polyline(
    [
      [558, 494],
      [552, 596],
      [522, 720],
      [570, 720],
      [592, 598],
      [616, 720],
      [666, 720],
      [638, 596],
      [626, 494],
    ],
    88,
  );
  await blueTurtle.polyline(
    [
      [530, 730],
      [570, 730],
      [582, 718],
      [520, 718],
      [666, 730],
      [616, 730],
      [606, 718],
      [682, 718],
    ],
    60,
  );
  await blueTurtle.polyline([[582, 320], [594, 326], [608, 320]], 45);
  await blueTurtle.polyline([[584, 342], [596, 347], [610, 342]], 45);
}

async function drawCloud(cx, cy, size) {
  const points = [];
  const lobes = [
    [-0.9, 0.1, 0.34],
    [-0.52, -0.18, 0.42],
    [-0.1, -0.28, 0.5],
    [0.38, -0.18, 0.42],
    [0.78, 0.05, 0.36],
  ];
  lobes.forEach(([ox, oy, radius], index) => {
    for (let i = 0; i <= 10; i += 1) {
      const angle = Math.PI + (Math.PI * i) / 10;
      points.push([
        cx + ox * size + Math.cos(angle) * radius * size,
        cy + oy * size + Math.sin(angle) * radius * size,
      ]);
    }
    if (index < lobes.length - 1) {
      const next = lobes[index + 1];
      points.push([cx + next[0] * size - next[2] * size, cy + next[1] * size]);
    }
  });
  points.push([cx + size * 1.08, cy + size * 0.12], [cx - size * 1.05, cy + size * 0.18]);
  await blueTurtle.polyline(points, 32);
}

async function drawForestTexture() {
  blueTurtle.lineWidth = 2.2;
  for (let row = 0; row < 5; row += 1) {
    const y = 494 + row * 42;
    const offset = row % 2 ? 18 : 0;
    for (let x = 40 + offset; x <= 1060; x += 38) {
      await blueTurtle.polyline(
        [
          [x, y + 24],
          [x + 10, y],
          [x + 20, y + 24],
          [x + 5, y + 14],
          [x + 17, y + 14],
        ],
        18,
      );
    }
  }
}

async function drawRockLedge() {
  blueTurtle.lineWidth = 3;
  await blueTurtle.polyline(
    [
      [48, 705],
      [90, 590],
      [180, 572],
      [260, 604],
      [354, 610],
      [470, 646],
      [620, 630],
      [792, 654],
      [930, 646],
      [1010, 690],
    ],
    78,
  );
  const cracks = [
    [[78, 690], [118, 652], [142, 612]],
    [[154, 592], [206, 618], [270, 620]],
    [[260, 646], [300, 616], [342, 612]],
    [[410, 666], [446, 638], [480, 648]],
    [[708, 658], [746, 630], [782, 648]],
    [[840, 680], [878, 650], [922, 658]],
  ];
  for (const crack of cracks) {
    await blueTurtle.polyline(crack, 48);
  }
}

async function runAnimation() {
  setupCanvas(drawingCanvas, drawCtx);
  setupCanvas(cursorCanvas, cursorCtx);
  clearDrawing();

  redTurtle = new Turtle(RED, 120, 70, 0);
  blueTurtle = new Turtle(BLUE, 60, 250, 0);
  renderCursors();

  await drawRedLayer();
  await drawBlueLayer();

  await Promise.all([
    redTurtle.moveTo(1030, 712, { duration: 520 }),
    blueTurtle.moveTo(70, 712, { duration: 520 }),
  ]);
  renderCursors();
}

playButton.addEventListener("click", async () => {
  if (animationStarted) return;
  animationStarted = true;
  intro.hidden = true;
  stage.hidden = false;
  await runAnimation();
});

window.addEventListener("resize", () => {
  renderCursors();
});
