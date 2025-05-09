let move_speed = 3, grativy = 0.5;
let bird = document.querySelector('.bird');
let img = document.getElementById('bird-1');
let sound_point = new Audio('audio/point.mp3');
let sound_die = new Audio('audio/jumpscare.mp3');
let backgroundMusic = new Audio('audio/cursed.mp3');
backgroundMusic.loop = true;

// Music button functionality
const musicBtn = document.getElementById('music-btn');
let isMuted = false;

function toggleMusic() {
    if (isMuted) {
        backgroundMusic.play();
        musicBtn.textContent = '🔊';
        musicBtn.classList.remove('muted');
    } else {
        backgroundMusic.pause();
        musicBtn.textContent = '🔇';
        musicBtn.classList.add('muted');
    }
    isMuted = !isMuted;
}

musicBtn.addEventListener('click', toggleMusic);

// getting bird element properties
let bird_props = bird.getBoundingClientRect();

// This method returns DOMReact -> top, right, bottom, left, x, y, width and height
let background = document.querySelector('.background').getBoundingClientRect();

let score_val = document.querySelector('.score_val');
let message = document.querySelector('.message');
let score_title = document.querySelector('.score_title');

let game_state = 'Start';
img.style.display = 'none';
message.classList.add('messageStyle');

// --- Welcome Modal & Leaderboard Logic ---
let playerName = '';
const modal = document.getElementById('welcome-modal');
const playerNameInput = document.getElementById('player-name');
const startGameBtn = document.getElementById('start-game-btn');
const leaderboardList = document.getElementById('leaderboard-list');

function getLeaderboard() {
    return JSON.parse(localStorage.getItem('flappy_leaderboard') || '[]');
}
function saveLeaderboard(lb) {
    localStorage.setItem('flappy_leaderboard', JSON.stringify(lb));
}
function updateLeaderboardDisplay() {
    const lb = getLeaderboard();
    leaderboardList.innerHTML = '';
    lb.slice(0, 5).forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(li);
    });
}
function showModal() {
    modal.style.display = 'flex';
    updateLeaderboardDisplay();
}
function hideModal() {
    modal.style.display = 'none';
}
playerNameInput.addEventListener('input', () => {
    startGameBtn.disabled = playerNameInput.value.trim().length === 0;
});
startGameBtn.addEventListener('click', () => {
    playerName = playerNameInput.value.trim().substring(0, 12);
    if (playerName) {
        hideModal();
        document.getElementById('player-name-display').textContent = playerName;
        document.getElementById('player-name-display').style.display = 'block';
        startFlappyGame();
    }
});

// --- Welcome Screen Logic ---
const welcomeScreen = document.getElementById('welcome-screen');
const openNameModalBtn = document.getElementById('open-name-modal-btn');

function showWelcomeScreen() {
    welcomeScreen.style.display = 'flex';
    modal.style.display = 'none';
}
function hideWelcomeScreen() {
    welcomeScreen.style.display = 'none';
}
openNameModalBtn.addEventListener('click', () => {
    hideWelcomeScreen();
    showModal();
});

// --- Leaderboard Modal Logic ---
const leaderboardModal = document.getElementById('leaderboard-modal');
const openLeaderboardBtn = document.getElementById('open-leaderboard-btn');
const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');

function isWelcomeScreenVisible() {
    return welcomeScreen.style.display !== 'none';
}

openLeaderboardBtn.addEventListener('click', () => {
    leaderboardModal.style.display = 'flex';
    updateLeaderboardDisplay();
});
closeLeaderboardBtn.addEventListener('click', () => {
    leaderboardModal.style.display = 'none';
});
// Hide leaderboard modal on outside click
leaderboardModal.addEventListener('click', (e) => {
    if (e.target === leaderboardModal) leaderboardModal.style.display = 'none';
});
// --- End Leaderboard Modal Logic ---

// --- Flappy Bird Game Logic ---
function startFlappyGame() {
    img.style.display = 'none';
    message.classList.add('messageStyle');
    game_state = 'Start';
    document.addEventListener('keydown', gameStartHandler);
    backgroundMusic.play().catch(error => {
        console.log("Audio play failed:", error);
    });
}
function gameStartHandler(e) {
    if(e.key == 'Enter' && game_state != 'Play'){
        document.querySelectorAll('.pipe_sprite').forEach((e) => {
            e.remove();
        });
        img.style.display = 'block';
        bird.style.top = '40vh';
        game_state = 'Play';
        message.innerHTML = '';
        score_title.innerHTML = 'Score : ';
        score_val.innerHTML = '0';
        message.classList.remove('messageStyle');
        play();
    }
}

const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');

function showGameOverScreen() {
    gameOverScreen.style.display = 'flex';
}

function hideGameOverScreen() {
    gameOverScreen.style.display = 'none';
}

restartBtn.addEventListener('click', () => {
    hideGameOverScreen();
    showWelcomeScreen();
});

function endGameAndShowLeaderboard(finalScore) {
    // Save to leaderboard
    let lb = getLeaderboard();
    lb.push({ name: playerName, score: finalScore });
    lb = lb.sort((a, b) => b.score - a.score).slice(0, 10);
    saveLeaderboard(lb);
    updateLeaderboardDisplay();
    showGameOverScreen();
}

function play(){
    function move(){
        if(game_state != 'Play') return;

        let pipe_sprite = document.querySelectorAll('.pipe_sprite');
        pipe_sprite.forEach((element) => {
            let pipe_sprite_props = element.getBoundingClientRect();
            bird_props = bird.getBoundingClientRect();

            if(pipe_sprite_props.right <= 0){
                element.remove();
            }else{
                if(bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width && bird_props.left + bird_props.width > pipe_sprite_props.left && bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height && bird_props.top + bird_props.height > pipe_sprite_props.top){
                    game_state = 'End';
                    img.style.display = 'none';
                    sound_die.play();
                    endGameAndShowLeaderboard(score_val.innerHTML);
                    return;
                }else{
                    if(pipe_sprite_props.right < bird_props.left && pipe_sprite_props.right + move_speed >= bird_props.left && element.increase_score == '1'){
                        score_val.innerHTML =+ score_val.innerHTML + 1;
                        sound_point.play();
                    }
                    element.style.left = pipe_sprite_props.left - move_speed + 'px';
                }
            }
        });
        requestAnimationFrame(move);
    }
    requestAnimationFrame(move);

    let bird_dy = 0;
    function apply_gravity(){
        if(game_state != 'Play') return;
        bird_dy = bird_dy + grativy;
        document.addEventListener('keydown', (e) => {
            if(e.key == 'ArrowUp' || e.key == ' '){
                e.preventDefault();
                img.src = 'zendaya2.png';
                bird_dy = -7.6;
            }
        });

        document.addEventListener('keyup', (e) => {
            if(e.key == 'ArrowUp' || e.key == ' '){
                e.preventDefault();
                img.src = 'zendaya1.png';
            }
        });

        if(bird_props.top <= 0 || bird_props.bottom >= background.bottom){
            game_state = 'End';
            img.style.display = 'none';
            endGameAndShowLeaderboard(score_val.innerHTML);
            return;
        }
        bird.style.top = bird_props.top + bird_dy + 'px';
        bird_props = bird.getBoundingClientRect();
        requestAnimationFrame(apply_gravity);
    }
    requestAnimationFrame(apply_gravity);

    let pipe_seperation = 0;

    let pipe_gap = 35;

    function create_pipe(){
        if(game_state != 'Play') return;

        if(pipe_seperation > 115){
            pipe_seperation = 0;

            let pipe_posi = Math.floor(Math.random() * 43) + 8;
            let pipe_sprite_inv = document.createElement('div');
            pipe_sprite_inv.className = 'pipe_sprite';
            pipe_sprite_inv.style.top = pipe_posi - 70 + 'vh';
            pipe_sprite_inv.style.left = '100vw';

            document.body.appendChild(pipe_sprite_inv);
            let pipe_sprite = document.createElement('div');
            pipe_sprite.className = 'pipe_sprite';
            pipe_sprite.style.top = pipe_posi + pipe_gap + 'vh';
            pipe_sprite.style.left = '100vw';
            pipe_sprite.increase_score = '1';

            document.body.appendChild(pipe_sprite);
        }
        pipe_seperation++;
        requestAnimationFrame(create_pipe);
    }
    requestAnimationFrame(create_pipe);
}

// Music button and background music logic removed

