// 星空粒子背景动画 - 基于提供的HTML示例重写
export function initBackgroundAnimation(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;

  let dotsNum = 120; // 点的数量
  let radius = 1; // 圆的半径，连接线宽度的一半
  let fillStyle = 'rgba(255,255,255,0.5)'; // 点的颜色
  let lineWidth = radius * 2;
  let connection = 120; // 连线最大距离
  let followLength = 80; // 鼠标跟随距离

  let dots = [];
  let animationFrame = null;
  let mouseX = null;
  let mouseY = null;

  function addCanvasSize() { // 改变画布尺寸
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    dots = [];
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    initDots(dotsNum);
    moveDots();
  }

  function mouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function mouseOut(e) {
    mouseX = null;
    mouseY = null;
  }

  function mouseClick() {
    for (const dot of dots) dot.elastic();
  }

  class Dot {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.speedX = Math.random() * 1.2 - 0.6; // 从 2-1 降低到 1.2-0.6
      this.speedY = Math.random() * 1.2 - 0.6; // 从 2-1 降低到 1.2-0.6
      this.follow = false;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
    move() {
      if (this.x >= width || this.x <= 0) this.speedX = -this.speedX;
      if (this.y >= height || this.y <= 0) this.speedY = -this.speedY;
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.speedX >= 0.8) this.speedX -= 0.02; // 降低衰减速度，从1改为0.8，从--改为-=0.02
      if (this.speedX <= -0.8) this.speedX += 0.02; // 降低衰减速度，从-1改为-0.8，从++改为+=0.02
      if (this.speedY >= 0.8) this.speedY -= 0.02; // 降低衰减速度，从1改为0.8，从--改为-=0.02
      if (this.speedY <= -0.8) this.speedY += 0.02; // 降低衰减速度，从-1改为-0.8，从++改为+=0.02
      this.correct();
      this.connectMouse();
      this.draw();
    }
    correct() { // 根据鼠标的位置修正
      if (!mouseX || !mouseY) return;
      let lengthX = mouseX - this.x;
      let lengthY = mouseY - this.y;
      const distance = Math.sqrt(lengthX ** 2 + lengthY ** 2);
      if (distance <= followLength) this.follow = true;
      else if (this.follow === true && distance > followLength && distance <= followLength + 8) {
        let proportion = followLength / distance;
        lengthX *= proportion;
        lengthY *= proportion;
        this.x = mouseX - lengthX;
        this.y = mouseY - lengthY;
      } else this.follow = false;
    }
    connectMouse() { // 点与鼠标连线
      if (mouseX && mouseY) {
        let lengthX = mouseX - this.x;
        let lengthY = mouseY - this.y;
        const distance = Math.sqrt(lengthX ** 2 + lengthY ** 2);
        if (distance <= connection) {
          const opacity = (1 - distance / connection) * 0.5;
          ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
          ctx.closePath();
        }
      }
    }
    elastic() { // 鼠标点击后的弹射
      if (!mouseX || !mouseY) return;
      let lengthX = mouseX - this.x;
      let lengthY = mouseY - this.y;
      const distance = Math.sqrt(lengthX ** 2 + lengthY ** 2);
      if (distance >= connection) return;
      const rate = 1 - distance / connection; // 距离越小此值约接近1
      this.speedX = 20 * rate * -lengthX / distance; // 从40降低到20
      this.speedY = 20 * rate * -lengthY / distance; // 从40降低到20
    }
  }

  function initDots(num) { // 初始化粒子
    ctx.fillStyle = fillStyle;
    ctx.lineWidth = lineWidth;
    for (let i = 0; i < num; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const dot = new Dot(x, y);
      dot.draw();
      dots.push(dot);
    }
  }

  function moveDots() { // 移动并建立点与点之间的连接线
    ctx.clearRect(0, 0, width, height);
    for (const dot of dots) {
      dot.move();
    }
    for (let i = 0; i < dots.length; i++) {
      for (let j = i; j < dots.length; j++) {
        const distance = Math.sqrt((dots[i].x - dots[j].x) ** 2 + (dots[i].y - dots[j].y) ** 2);
        if (distance <= connection) {
          const opacity = (1 - distance / connection) * 0.5;
          ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
          ctx.closePath();
        }
      }
    }
    animationFrame = window.requestAnimationFrame(moveDots);
  }

  addCanvasSize();

  initDots(dotsNum);
  moveDots();

  document.addEventListener('mousemove', mouseMove);
  document.addEventListener('mouseout', mouseOut);
  document.addEventListener('click', mouseClick);
  window.addEventListener('resize', addCanvasSize);
}

// 网格背景动画
export function initGridAnimation(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const gridSize = 50;
  let offset = 0;

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // 垂直线
    for (let x = offset; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // 水平线
    for (let y = offset; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    offset += 0.5;
    if (offset >= gridSize) offset = 0;

    requestAnimationFrame(drawGrid);
  }

  drawGrid();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}