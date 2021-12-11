const canvas = document.getElementById('canvasBoard');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// globals
const cellSize = 100;
const gameGrid = [];
const towers = [];
const towerCost = 100;
let numberOfResources = 300;
const invaders = [];
const invaderPositions = [];
let frame = 0;

const mouse = {
  x: 0,
  y: 0,
  width: 0.1,
  height: 0.1,
};

let canvasPosition = canvas.getBoundingClientRect();

canvas.addEventListener('mousemove', function (e) {
  mouse.x = e.x - canvasPosition.left;
  mouse.y = e.y - canvasPosition.top;
});

canvas.addEventListener('mouseleave', function () {
  mouse.x = undefined;
  mouse.y = undefined;
});

// board
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
  }

  draw() {
    if (mouse.x && mouse.y && collision(this, mouse)) {
      ctx.strokeStyle = 'black';
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

function createGrid() {
  for (let y = 0; y < canvas.height; y += cellSize) {
    for (let x = 0; x < canvas.width; x += cellSize) {
      gameGrid.push(new Cell(x, y));
    }
  }
}
createGrid();

function handleGameGrid() {
  for (let i = 0; i < gameGrid.length; i++) {
    gameGrid[i].draw();
  }
}

// towers
class Tower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
    this.shooting = false;
    this.health = 100;
    this.projectiles = [];
    this.timer = 0;
  }

  draw() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = 'red';
    ctx.font = '20px Helvetica';
    ctx.fillText(
      Math.floor(this.health),
      this.x + cellSize / 2,
      this.y + cellSize / 2
    );
  }
}

function handleTowers() {
  for (let i = 0; i < towers.length; i++) {
    towers[i].draw();
  }
}

// invaders
class Invader {
  constructor(verticalPosition) {
    this.x = canvas.width;
    this.y = verticalPosition;
    this.width = cellSize;
    this.height = cellSize;
    this.speed = Math.random() * 0.2 + 0.4;
    this.movement = this.speed;
    this.health = 100;
    this.maxHealth = this.health;
  }

  update() {
    this.x -= this.movement;
  }
  draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = 'red';
    ctx.font = '20px Helvetica';
    ctx.fillText(
      Math.floor(this.health),
      this.x + cellSize / 2,
      this.y + cellSize / 2
    );
  }
}

function handleInvaders() {
  for (let i = 0; i < invaders.length; i++) {
    invaders[i].update();
    invaders[i].draw();
  }
  if (frame % 100 === 0) {
    let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
    invaders.push(new Invader(verticalPosition));
    invaderPositions.push(verticalPosition);
  }
}

canvas.addEventListener('click', function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize);
  const gridPositionY = mouse.y - (mouse.y % cellSize);
  for (let i = 0; i < towers.length; i++) {
    if (towers[i].x === gridPositionX && towers[i].y === gridPositionY) return;
  }
  const towerCost = 100;
  if (numberOfResources >= towerCost) {
    towers.push(new Tower(gridPositionX, gridPositionY));
    numberOfResources -= towerCost;
  }
});

// helpers
function handleGameStatus() {
  ctx.fillStyle = 'black';
  ctx.font = '20px Helvetica';
  ctx.fillText(`Resources: ${numberOfResources}`, 0, 60);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleGameGrid();
  handleTowers();
  handleInvaders();
  handleGameStatus();
  frame++;
  requestAnimationFrame(animate);
}
animate();

function collision(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
}
