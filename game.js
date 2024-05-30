const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const LIMIT_LEFT = 300;
const LIMIT_RIGHT = 500;
const START_X = (LIMIT_LEFT + LIMIT_RIGHT) / 2;
const START_Y = 50;
const STEP_SIZE = 5;
const INITIAL_SIDEWAYS_INCREMENT = 1;
const JACKPOT_ZONE_HEIGHT = 50;
const FPS = 30;

let path = [{ x: START_X, y: START_Y }];
let score = 0;
let running = false;
let sidewaysIncrement = INITIAL_SIDEWAYS_INCREMENT;

// Colors
const WHITE = '#FFFFFF';
const BLACK = '#000000';
const RED = '#FF0000';
const GREEN = '#00FF00';
const BRIGHT_GREEN = '#00FF00';

// Google Form URL and entry ID
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/your_google_form_id/viewform";
const SCORE_ENTRY_ID = "entry.your_entry_id";

// Extract parameters from URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        name: params.get('name'),
        email: params.get('email')
    };
}

// Event listeners for controls
document.addEventListener('keydown', (event) => {
    if (event.key === 'r') {  // Reset game
        path = [{ x: START_X, y: START_Y }];
        score = 0;
        running = false;
        document.getElementById('game-over').style.display = 'none';
    } else if (event.key === 's') {  // Start game
        running = true;
    } else if (event.key === 'e') {  // End game
        running = false;
    }
});

function drawLimits() {
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(LIMIT_LEFT, 0);
    ctx.lineTo(LIMIT_LEFT, HEIGHT);
    ctx.moveTo(LIMIT_RIGHT, 0);
    ctx.lineTo(LIMIT_RIGHT, HEIGHT);
    ctx.stroke();
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
    ctx.fillText('Jackpot!', WIDTH / 2 - 50, HEIGHT - JACKPOT_ZONE_HEIGHT / 2 + 10);
}

function displayScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
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
    if (newY >= HEIGHT - JACKPOT_ZONE_HEIGHT) {
        running = false;
        submitScore(score);
    }
}

function submitScore(score) {
    const params = getQueryParams();
    const formUrl = `${GOOGLE_FORM_URL}?${SCORE_ENTRY_ID}=${score}&entry.name=${params.name}&entry.email=${params.email}`;
    window.location.href = formUrl;
}

function gameLoop() {
    ctx.fillStyle = WHITE;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawLimits();
    drawPath();
    drawJackpotZone();
    displayScore();

    if (running) {
        randomWalk();
        if (!checkLimits()) {
            running = false;
            document.getElementById('game-over').style.display = 'block';
            document.getElementById('final-score').textContent = `Your final score is ${score}.`;
        }
    }

    requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);
