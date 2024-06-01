const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const LIMIT_LEFT = 50;
const LIMIT_RIGHT = WIDTH - 50;
const START_X = WIDTH / 2;
const START_Y = 50;
const STEP_SIZE = 2; // Adjust step size to make the path move slower
const INITIAL_SIDEWAYS_INCREMENT = 1;
const JACKPOT_ZONE_HEIGHT = 50;
const FPS = 30;
const FREEZE_FRAME_DURATION = 1000; // 1 second in milliseconds

let path = [{ x: START_X, y: START_Y }];
let score = 0;
let totalScore = 0;
let lives = 5;
let running = false;
let gameOver = false;
let sidewaysIncrement = INITIAL_SIDEWAYS_INCREMENT;

// Colors
const WHITE = '#FFFFFF';
const BLACK = '#000000';
const RED = '#FF0000';
const GREEN = '#00FF00';
const BRIGHT_GREEN = '#00FF00';

// Extract parameters from URL (for future use)
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        name: params.get('name'),
        email: params.get('email')
    };
}

// Button event listeners
document.getElementById('start-button').addEventListener('click', () => {
    if (!gameOver) {
        running = true;
    }
});
document.getElementById('stop-button').addEventListener('click', () => {
    if (running) {
        endLife();
    }
});
document.getElementById('reset-button').addEventListener('click', () => {
    resetGame();
});

function drawLimits() {
    ctx.fillStyle = RED;
    ctx.fillRect(0, 0, LIMIT_LEFT, HEIGHT);
    ctx.fillRect(LIMIT_RIGHT, 0, WIDTH - LIMIT_RIGHT, HEIGHT);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(LIMIT_LEFT, 0);
    ctx.lineTo(LIMIT_LEFT, HEIGHT);
    ctx.moveTo(LIMIT_RIGHT, 0);
    ctx.lineTo(LIMIT_RIGHT, HEIGHT);
    ctx.stroke();
}

function drawIndicators() {
    ctx.fillStyle = WHITE;
    ctx.font = '20px Arial';
    ctx.fillText('-100', LIMIT_LEFT - 45, HEIGHT / 2);
    ctx.fillText('-100', LIMIT_RIGHT + 8, HEIGHT / 2);
}

function drawPath() {
    if (path.length > 1) {
        ctx.strokeStyle = GREEN;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
    }
}

function drawJackpotZone() {
    ctx.fillStyle = BRIGHT_GREEN;
    ctx.fillRect(0, HEIGHT - JACKPOT_ZONE_HEIGHT, WIDTH, JACKPOT_ZONE_HEIGHT);
    ctx.fillStyle = BLACK;
    ctx.font = '24px Arial';
    ctx.fillText('Jackpot! (+1000)', WIDTH / 2 - 80, HEIGHT - JACKPOT_ZONE_HEIGHT / 2 + 10);
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('total-score').textContent = `Total Score: ${totalScore}`;
    document.getElementById('lives').textContent = `Lives: ${lives}`;
}

function checkLimits() {
    const lastPoint = path[path.length - 1];
    return LIMIT_LEFT <= lastPoint.x && lastPoint.x <= LIMIT_RIGHT;
}

function randomWalk() {
    const lastPoint = path[path.length - 1];
    const newY = lastPoint.y + STEP_SIZE;
    sidewaysIncrement = INITIAL_SIDEWAYS_INCREMENT + (newY / 20);
    const sideVariation = (Math.random() < 0.5 ? -1 : 1) * sidewaysIncrement;
    const newX = lastPoint.x + sideVariation;
    path.push({ x: newX, y: newY });
    score += 1;
    updateScore();
    if (newY >= HEIGHT - JACKPOT_ZONE_HEIGHT) {
        totalScore += 1000; // Award 500 points for reaching the jackpot
        endLife();
    }
}

function endLife() {
    running = false;
    totalScore += score; // Add current run score to total score
    if (!checkLimits()) {
        totalScore -= 100; // Subtract 100 points if the path touches the limit
    }
    score = 0;
    updateScore();

    // Freeze frame before resetting
    setTimeout(() => {
        lives -= 1;
        if (lives <= 0) {
            gameOver = true;
            document.getElementById('start-button').disabled = true;
            document.getElementById('game-over').style.display = 'block';
            document.getElementById('final-score').textContent = `Your final total score is ${totalScore}.`;
        }
        path = [{ x: START_X, y: START_Y }];
        drawInitialCanvas();
    }, FREEZE_FRAME_DURATION);
}

function resetGame() {
    path = [{ x: START_X, y: START_Y }];
    score = 0;
    totalScore = 0;
    lives = 5;
    running = false;
    gameOver = false;
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('start-button').disabled = false;
    updateScore();
    drawInitialCanvas();
}

function drawInitialCanvas() {
    ctx.fillStyle = WHITE;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawLimits();
    drawIndicators();
    drawJackpotZone();
    drawPath();
    updateScore();
}

function gameLoop() {
    drawInitialCanvas();

    if (running) {
        randomWalk();
        if (!checkLimits()) {
            endLife();
        }
    }

    requestAnimationFrame(gameLoop);
}

// Start the game loop
drawInitialCanvas();  // Draw the initial state
requestAnimationFrame(gameLoop);
