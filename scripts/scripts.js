const canvas = document.getElementById('canvasBoard');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// globals
const cellSize = 100;
const cellGap = 4;
const gameGrid = [];
const towers = [];
const towerCost = 100;
let numberOfResources = 300;
const invaders = [];
const invaderPositions = [];
const invaderInterval = 600;
let frame = 0;
let gameOver = false;
let score = 0;
let winningScore = 100;
const projectiles = [];
const resources = [];

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
    if (
      mouse.x &&
      mouse.y &&
      mouse.x < cellSize * 4 &&
      collision(this, mouse)
    ) {
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

// projectiles
class Projectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.power = 20;
    this.speed = 5;
  }
  update() {
    this.x += this.speed;
  }
  draw() {
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    ctx.fill();
  }
}

function handleProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].update();
    projectiles[i].draw();

    for (let j = 0; j < invaders.length; j++) {
      if (
        invaders[j] &&
        projectiles[i] &&
        collision(projectiles[i], invaders[j])
      ) {
        invaders[j].health -= projectiles[i].power;
        projectiles.splice(i, 1);
        i--;
      }
    }

    if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
      projectiles.splice(i, 1);
      i--;
    }
  }
}

// towers
class Tower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize - cellGap * 2;
    this.height = cellSize - cellGap * 2;
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
  update() {
    if (this.shooting) {
      this.timer++;
      if (this.timer % 100 === 0) {
        projectiles.push(
          new Projectile(this.x + cellSize / 2, this.y + cellSize / 2)
        );
      }
    } else {
      this.timer = 0;
    }
  }
}

function handleTowers() {
  for (let i = 0; i < towers.length; i++) {
    towers[i].draw();
    towers[i].update();
    if (invaderPositions.indexOf(towers[i].y - cellGap) !== -1) {
      towers[i].shooting = true;
    } else towers[i].shooting = false;

    for (let j = 0; j < invaders.length; j++) {
      if (towers[i] && collision(towers[i], invaders[j])) {
        invaders[j].movement = 0;
        towers[i].health -= 0.1;
      }
      if (towers[i] && towers[i].health <= 0) {
        towers.splice(i, 1);
        i--;
        invaders[j].movement = invaders[j].speed;
      }
    }
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
    if (invaders[i].x < 0) {
      gameOver = true;
    }
    if (invaders[i] && invaders[i].health <= 0) {
      let loot = invaders[i].maxHealth;
      numberOfResources += loot;
      score += 10;
      const invaderIndex = invaderPositions.indexOf(invaders[i].y);
      invaderPositions.splice(invaderIndex, 1);
      invaders.splice(i, 1);
      i--;
    }
  }
  if (frame % invaderInterval === 0) {
    let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
    invaders.push(new Invader(verticalPosition));
    invaderPositions.push(verticalPosition);

    if (invaderInterval < 120) {
      invaderInterval -= 50;
    }
  }
}

// resources
const amounts = [20, 30, 40];
class Resource {
  constructor() {
    this.x = Math.random() * (canvas.width - cellSize);
    this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
    this.width = cellSize * 0.6;
    this.height = cellSize * 0.6;
    this.amount = amounts[Math.floor(Math.random() * amounts.length)];
  }

  draw() {
    ctx.fillStyle = 'purple';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = 'black';
    ctx.font = '20px Helvetica';
    ctx.fillText(this.amount, this.x + 15, this.y + 25);
  }
}

function handleResources() {
  if (frame % 200 === 0 && score < winningScore) {
    resources.push(new Resource());
  }
  for (let i = 0; i < resources.length; i++) {
    resources[i].draw();
    if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
      numberOfResources += resources[i].amount;
      resources.splice(i, 1);
      i--;
    }
  }
}

canvas.addEventListener('click', function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
  const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
  for (let i = 0; i < towers.length; i++) {
    if (towers[i].x === gridPositionX && towers[i].y === gridPositionY) return;
  }
  const towerCost = 100;
  if (numberOfResources >= towerCost && mouse.x < cellSize * 4) {
    towers.push(new Tower(gridPositionX, gridPositionY));
    numberOfResources -= towerCost;
  }
});

// helpers
function handleGameStatus() {
  ctx.fillStyle = 'black';
  ctx.font = '20px Helvetica';
  ctx.fillText(`Resources: ${numberOfResources}`, 0, 60);
  ctx.fillStyle = 'black';
  ctx.font = '20px Helvetica';
  ctx.fillText(`Score: ${score}`, 200, 60);

  if (gameOver) {
    ctx.fillStyle = 'black';
    ctx.font = '60px Helvetica';
    ctx.fillText('GAME OVER', 135, 320);
  }

  if (score >= winningScore && invaders.length === 0) {
    ctx.fillStyle = 'black';
    ctx.font = '60px Helvetica';
    ctx.fillText('YOU WON!', 135, 320);
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleGameGrid();
  handleTowers();
  handleProjectiles();
  handleInvaders();
  handleResources();
  handleGameStatus();
  frame++;
  if (!gameOver && score < winningScore) {
    requestAnimationFrame(animate);
  }
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

window.addEventListener('resize', () => {
  canvasPosition = canvas.getBoundingClientRect();
});

console.log(towers);
console.log(invaders);
