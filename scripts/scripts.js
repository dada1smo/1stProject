const canvas = document.getElementById('canvasBoard');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const bigShoulders = 'Big Shoulders Stencil Text';

// globals
const cellSize = 100;
const headerSize = 100;
const cellGap = 4;
const gameGrid = [];
const towers = [];
const towerCost = 100;
const invaders = [];
const invaderPositions = [];
const projectiles = [];
const resources = [];

let numberOfResources = 100;
let frame = 0;
let invaderInterval = 600;
let gameOver = false;
let score = 0;
let winningScore = 400;

// images
const gotinha = new Image();
gotinha.src = 'img/gotinha.png';
const vacina = new Image();
vacina.src = 'img/vacina.png';
const virus = new Image();
virus.src = 'img/virus.png';
const sus = new Image();
sus.src = 'img/sus.png';

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
const controlBar = {
  width: canvas.width,
  height: headerSize,
};
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
  for (let y = headerSize; y < canvas.height; y += cellSize) {
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
    this.width = 60;
    this.height = 60;
    this.power = 10;
    this.speed = 5;
  }
  update() {
    this.x += this.speed;
  }
  draw() {
    ctx.drawImage(vacina, this.x, this.y, this.width, this.height);
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
    ctx.drawImage(gotinha, this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = `20px ${bigShoulders}`;
    ctx.fillText(Math.floor(this.health), this.x + cellSize - 32, this.y + 32);
  }
  update() {
    if (this.shooting) {
      this.timer++;
      if (this.timer % 100 === 0) {
        projectiles.push(
          new Projectile(this.x + cellSize / 4, this.y + cellSize / 4)
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
    ctx.drawImage(virus, this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#DB4747';
    ctx.font = `20px ${bigShoulders}`;
    ctx.fillText(Math.floor(this.health), this.x + cellSize - 8, this.y + 20);
  }
}

function handleInvaders() {
  if (score < winningScore) {
    for (let i = 0; i < invaders.length; i++) {
      invaders[i].update();
      invaders[i].draw();
      if (invaders[i].x < 0) {
        gameOver = true;
      }
      if (invaders[i] && invaders[i].health <= 0) {
        let loot = 30;
        numberOfResources += loot;
        score += 10;
        const invaderIndex = invaderPositions.indexOf(invaders[i].y);
        invaderPositions.splice(invaderIndex, 1);
        invaders.splice(i, 1);
        i--;
      }
    }
    if (frame % invaderInterval === 0 && score < winningScore) {
      let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
      invaders.push(new Invader(verticalPosition));
      invaderPositions.push(verticalPosition);

      if (invaderInterval > 120) {
        invaderInterval -= 50;
      }
    }
  }
}

// resources
class Resource {
  constructor() {
    this.x = Math.random() * (canvas.width - cellSize);
    this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
    this.width = cellSize * 0.5;
    this.height = cellSize * 0.5;
    this.amount = 30;
  }

  draw() {
    ctx.fillStyle = 'purple';
    ctx.drawImage(sus, this.x, this.y, this.width, this.height);
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
  if (gridPositionY < headerSize) return;
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
  ctx.font = `20px ${bigShoulders}`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Doses', 32, 40);
  ctx.font = `40px ${bigShoulders}`;
  ctx.fillStyle = '#EAC462';
  ctx.fillText(`${numberOfResources}`, 32, 80);
  ctx.font = `20px ${bigShoulders}`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Imunizações', 120, 40);
  ctx.font = `40px ${bigShoulders}`;
  ctx.fillStyle = '#EAC462';
  ctx.fillText(`${score}`, 120, 80);

  if (gameOver) {
    ctx.fillStyle = 'black';
    ctx.font = '60px Helvetica';
    ctx.fillText('GAME OVER', 135, 320);
  }

  if (score >= winningScore) {
    ctx.fillStyle = 'black';
    ctx.font = '60px Helvetica';
    ctx.fillText('YOU WON!', 135, 320);
  }
}

let reqAnim;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleGameGrid();
  handleTowers();
  handleProjectiles();
  handleInvaders();
  handleResources();
  handleGameStatus();
  frame++;
  if (!gameOver) {
    reqAnim = requestAnimationFrame(animate);
  }
  if (score >= winningScore) {
    stopAnimation();
  }
}

function stopAnimation() {
  cancelAnimationFrame(reqAnim);
  reqAnim = 0;
}

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

window.addEventListener('scroll', () => {
  canvasPosition = canvas.getBoundingClientRect();
});

const startGameBtn = document.getElementById('startGame');
const pauseGameBtn = document.getElementById('pauseGame');
const reloadGameBtn = document.getElementById('reloadGame');
startGameBtn.onclick = () => {
  animate();
  startGameBtn.setAttribute('class', 'disabled');
  pauseGameBtn.removeAttribute('class', 'disabled');
};
pauseGameBtn.onclick = () => {
  stopAnimation();
  startGameBtn.removeAttribute('class', 'disabled');
  pauseGameBtn.setAttribute('class', 'disabled');
};
reloadGameBtn.onclick = () => {
  location.reload();
};

console.log(numberOfResources);
