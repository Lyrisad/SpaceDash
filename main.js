// Set up canvas to fill the entire screen
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let obstacleImage1 = new Image();
obstacleImage1.src = "sprites/Daco.png"; // Adjust path if necessary

let obstacleImage2 = new Image();
obstacleImage2.src = "sprites/Rock.png"; // Adjust path if necessary
// Make sure this path is correct
let playerImage = new Image();
playerImage.src =
  "sprites/kisspng-spaceshiptwo-spacecraft-sprite-spaceshipone-portab-space-war-google-playampaposde-uygulamalar-5bd6a481273989.3786541515407934731607.png"; // Make sure this path is correct
let backgroundImage = new Image();
backgroundImage.src = "sprites/background.jpg"; // Make sure this path is correct

// Game variables
let playerLane = 1; // Target lane: 0 (left), 1 (middle), 2 (right)
let playerX = canvas.width / 3; // Current X position
const laneWidth = canvas.width / 3;
const playerWidth = laneWidth * 0.3; // 30% of the lane width
const playerHeight = canvas.height * 0.1; // 10% of the canvas height
const playerSpeed = 50; // Speed of player movement
let isGameOver = false;

// Obstacle variables
let obstacles = [];
const obstacleWidth = laneWidth * 0.3; // 30% of the lane width
const obstacleHeight = canvas.height * 0.2; // 5% of the canvas height
let obstacleSpeed = canvas.height * 0.005; // Relative to canvas height
let obstacleSpawnRate = 100; // Frames until a new obstacle spawns
const maxObstacleSpeed = 40;
const maxSpawnRate = 15;
let frameCount = 0;

let score = 0;
let scoreIncrement = 1;
let scoreInterval = 100; // Frames interval for score increment
let lastScoreIncrementFrame = 0;

// Create an audio element for the background music
let bgMusic = new Audio("music/music.mp3");
bgMusic.loop = true; // Set the music to loop

// Function to start playing background music
function startBackgroundMusic() {
  bgMusic.play().catch((error) => console.log("Error playing music:", error));
}

// Function to stop playing background music
function stopBackgroundMusic() {
  bgMusic.pause();
  bgMusic.currentTime = 0; // Reset the music to the start
}

function drawGameOver() {
  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.shadowColor = "black";
  ctx.shadowBlur = 7;
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  ctx.fillText(
    `Final Score: ${score}`,
    canvas.width / 2,
    canvas.height / 2 + 50
  );
}

// Function to draw the score
function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.shadowColor = "black";
  ctx.shadowBlur = 7;

  // Calculate text width for right alignment
  const text = `Score: ${score}`;
  const textWidth = ctx.measureText(text).width;

  // Draw text aligned to the top right
  ctx.fillText(text, canvas.width - textWidth - 20, 40);
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  playerX = playerLane * (canvas.width / 3) + (laneWidth - playerWidth) / 2;
});

// Function to move obstacles
function moveObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].y += obstacleSpeed;

    // Check if the obstacle has passed the player's position
    if (
      obstacles[i].y > canvas.height - playerHeight - 10 &&
      !obstacles[i].scoreCounted
    ) {
      score += scoreIncrement;
      obstacles[i].scoreCounted = true; // Mark obstacle as scored
    }
  }

  // Remove obstacles that are off the screen
  obstacles = obstacles.filter((obstacle) => obstacle.y <= canvas.height);
}

function spawnObstacle() {
  const lane = Math.floor(Math.random() * 3);
  const x = lane * laneWidth + (laneWidth - obstacleWidth) / 2;
  const y = -obstacleHeight;
  const rotation = 0; // Starting rotation angle

  const obstacle = { x, y, lane, rotation };
  obstacles.push(obstacle);
}

// Function to spawn a new obstacle
function spawnObstacle() {
  const lane = Math.floor(Math.random() * 3);
  const x = lane * laneWidth + (laneWidth - obstacleWidth) / 2;
  const y = -obstacleHeight;
  const rotation = 0; // Starting rotation angle

  // Randomly choose one of the two images for the obstacle
  const image = Math.random() < 0.5 ? obstacleImage1 : obstacleImage2;

  const obstacle = { x, y, lane, rotation, image, scoreCounted: false };
  obstacles.push(obstacle);
}
// Function to draw obstacles
function drawObstacles() {
  obstacles.forEach((obstacle) => {
    // Save the current context
    ctx.save();

    // Move to the center of the obstacle for rotation
    ctx.translate(
      obstacle.x + obstacleWidth / 2,
      obstacle.y + obstacleHeight / 2
    );

    // Rotate the obstacle
    ctx.rotate(obstacle.rotation);

    // Draw the obstacle image, adjusted so the rotation happens around the center
    ctx.drawImage(
      obstacle.image,
      -obstacleWidth / 2,
      -obstacleHeight / 2,
      obstacleWidth,
      obstacleHeight
    );

    // Restore the context to its original state
    ctx.restore();

    // Update the rotation for the next frame
    obstacle.rotation += 0.05; // Adjust this value for faster/slower rotation
  });
}

// Function to check for collisions
function checkCollision() {
  const playerRect = {
    x: playerX,
    y: canvas.height - playerHeight - 10,
    width: playerWidth,
    height: playerHeight,
  };

  for (let obstacle of obstacles) {
    const obstacleRect = {
      x: obstacle.x,
      y: obstacle.y,
      width: obstacleWidth,
      height: obstacleHeight,
    };

    if (rectIntersect(playerRect, obstacleRect)) {
      // Handle collision: end game
      isGameOver = true;
    }
  }
}
// Utility function to check if rectangles intersect
function rectIntersect(rect1, rect2) {
  return !(
    rect2.x > rect1.x + rect1.width ||
    rect2.x + rect2.width < rect1.x ||
    rect2.y > rect1.y + rect1.height ||
    rect2.y + rect2.height < rect1.y
  );
}

// Function to draw player
function drawPlayer() {
  ctx.drawImage(
    playerImage,
    playerX,
    canvas.height - playerHeight - 10,
    playerWidth,
    playerHeight
  );
}

// Handle key presses for lane changes
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" && playerLane > 0) {
    playerLane--;
  } else if (event.key === "ArrowRight" && playerLane < 2) {
    playerLane++;
  }
});

// Function to update player position
function updatePlayerPosition() {
  let targetX = playerLane * laneWidth + (laneWidth - playerWidth) / 2;
  if (playerX < targetX) {
    playerX = Math.min(playerX + playerSpeed, targetX); // Move right
  } else if (playerX > targetX) {
    playerX = Math.max(playerX - playerSpeed, targetX); // Move left
  }
}

// Game loop
function gameLoop() {
  if (!isGameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    frameCount++;
    if (frameCount >= obstacleSpawnRate) {
      spawnObstacle();
      frameCount = 0;

      // Decrease the obstacle spawn rate gradually but do not let it go below maxSpawnRate
      obstacleSpawnRate = Math.max(obstacleSpawnRate - 2, maxSpawnRate);

      // Increase the obstacle speed gradually but do not let it exceed maxObstacleSpeed
      obstacleSpeed = Math.min(obstacleSpeed + 0.5, maxObstacleSpeed);
    }

    // Increment score
    if (frameCount - lastScoreIncrementFrame >= scoreInterval) {
      score += scoreIncrement;
      lastScoreIncrementFrame = frameCount;
    }

    moveObstacles();
    updatePlayerPosition();
    drawPlayer();
    drawObstacles();
    checkCollision();
    drawScore(); // Draw the score
    startBackgroundMusic(); // Start playing background music
    requestAnimationFrame(gameLoop);
  } else {
    drawGameOver();
    stopBackgroundMusic();
  }
}
gameLoop();
