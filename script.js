const WIDTH = 1100;
const HEIGHT = 760;
const TEAL = "#147f83";
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
      drawCtx.fillStyle = TEAL;
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
  drawCtx.fillStyle = TEAL;
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
  redTurtle.lineWidth = 6;
  await redTurtle.bubbleText("HAPPY", 550, 72, 78, 850);
  await redTurtle.bubbleText("BIRTHDAY", 550, 150, 70, 950);
  await redTurtle.bubbleText("DAD", 550, 226, 82, 800);

  redTurtle.lineWidth = 4;
  await drawHeart(redTurtle, 170, 128, 3.2);
  await drawHeart(redTurtle, 930, 130, 3);
  await redTurtle.polyline(
    [
      [235, 70],
      [207, 50],
      [226, 92],
      [190, 92],
    ],
    120,
  );
  await redTurtle.polyline(
    [
      [880, 70],
      [910, 48],
      [890, 92],
      [928, 92],
    ],
    120,
  );
}

async function drawBlueLayer() {
  blueTurtle.lineWidth = 5;

  await blueTurtle.polyline(
    [
      [85, 628],
      [168, 590],
      [265, 612],
      [365, 585],
      [492, 620],
      [632, 596],
      [766, 624],
      [908, 592],
      [1015, 628],
    ],
    170,
  );
  await blueTurtle.polyline(
    [
      [110, 662],
      [254, 638],
      [396, 660],
      [544, 636],
      [710, 664],
      [870, 642],
      [1015, 668],
    ],
    150,
  );

  await drawFather();
  await drawSon();

  blueTurtle.lineWidth = 4;
  await blueTurtle.polyline(
    [
      [95, 442],
      [205, 380],
      [292, 410],
      [392, 338],
      [502, 388],
      [610, 320],
      [745, 394],
      [855, 348],
      [1010, 412],
    ],
    130,
  );
  await blueTurtle.polyline(
    [
      [75, 484],
      [212, 450],
      [330, 472],
      [470, 432],
      [610, 460],
      [756, 426],
      [914, 476],
      [1030, 444],
    ],
    120,
  );

  await drawCloud(240, 315, 52);
  await drawCloud(820, 300, 58);

  blueTurtle.lineWidth = 3;
  for (let x = 115; x <= 995; x += 34) {
    await blueTurtle.polyline(
      [
        [x, 536],
        [x + 14, 500],
        [x + 28, 536],
        [x + 5, 520],
        [x + 23, 520],
      ],
      42,
    );
  }
}

async function drawFather() {
  blueTurtle.lineWidth = 6;
  await blueTurtle.circle(410, 410, 34, 760);
  await blueTurtle.polyline(
    [
      [410, 444],
      [406, 516],
      [372, 604],
    ],
    170,
  );
  await blueTurtle.polyline(
    [
      [406, 516],
      [445, 604],
    ],
    170,
  );
  await blueTurtle.polyline(
    [
      [407, 468],
      [350, 512],
    ],
    150,
  );
  await blueTurtle.polyline(
    [
      [407, 468],
      [474, 510],
    ],
    150,
  );
  blueTurtle.lineWidth = 3.5;
  await blueTurtle.polyline(
    [
      [393, 410],
      [404, 417],
      [421, 410],
    ],
    80,
  );
}

async function drawSon() {
  blueTurtle.lineWidth = 6;
  await blueTurtle.circle(604, 430, 27, 660);
  await blueTurtle.polyline(
    [
      [604, 457],
      [606, 542],
      [566, 620],
    ],
    160,
  );
  await blueTurtle.polyline(
    [
      [606, 542],
      [650, 620],
    ],
    160,
  );
  await blueTurtle.polyline(
    [
      [568, 490],
      [642, 518],
    ],
    170,
  );
  await blueTurtle.polyline(
    [
      [646, 490],
      [560, 520],
    ],
    170,
  );
  blueTurtle.lineWidth = 3.5;
  await blueTurtle.polyline(
    [
      [591, 431],
      [603, 438],
      [616, 431],
    ],
    80,
  );
  await blueTurtle.polyline(
    [
      [580, 474],
      [628, 474],
    ],
    80,
  );
}

async function drawCloud(cx, cy, size) {
  await blueTurtle.circle(cx - size * 0.5, cy, size * 0.32, 360, Math.PI, Math.PI * 2);
  await blueTurtle.circle(cx, cy - size * 0.1, size * 0.42, 420, Math.PI, Math.PI * 2);
  await blueTurtle.circle(cx + size * 0.55, cy, size * 0.34, 360, Math.PI, Math.PI * 2);
  await blueTurtle.polyline(
    [
      [cx - size * 0.9, cy],
      [cx + size * 0.92, cy],
    ],
    120,
  );
}

async function runAnimation() {
  setupCanvas(drawingCanvas, drawCtx);
  setupCanvas(cursorCanvas, cursorCtx);
  clearDrawing();

  redTurtle = new Turtle(RED, 120, 70, 0);
  blueTurtle = new Turtle(BLUE, 120, 650, 0);
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
