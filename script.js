// 1. CONFIGURATION (6 Images only = 12 Cards)
const cardImages = [
    'img/draco.jpg', 'img/hermione.jpg', 'img/dumbledore.jpg', 
    'img/harry.jpg', 'img/ron.jpg', 'img/voldemort.jpg' 
];
const backCardImage = 'img/cards.jpg'; 



let cards = [...cardImages, ...cardImages]; 
let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let timer;
let timeLeft = 60;
let isFrozen = false;
let spellCharges = { Revelio: 1, Alohomora: 1, Stupefy: 1 };
let isPaused = false;


// 2. WAIT FOR DOM
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('instructionModal');
    const startButton = document.getElementById('startGameButton');
    const gameContainer = document.getElementById('gameContainer');
    const menuBtn = document.getElementById('main-menu-button');
    const mainMenuModal = document.getElementById('mainMenuModal');
    const closeMenuBtn = document.getElementById('close-menu-button');
    const spellMainBtn = document.getElementById('spellbook-main-btn');
const spellsDropdown = document.getElementById('spells-dropdown');

    const music = document.getElementById('background-music'); // Audio element
    const musicBtn = document.getElementById('menu-toggle-music');

    // START GAME CLICK
    if (startButton) {
        startButton.onclick = () => {
            console.log("Starting...");
            modal.classList.add('hidden');
            gameContainer.classList.remove('hidden');

    if (music) {
                music.play().catch(e => console.log("Music waiting for interaction"));
                music.volume = 0.3;
            }
            newGame();
        };
    }

    // MENU CONTROLS
    if (menuBtn) menuBtn.onclick = () => {
    isPaused = true;
    clearInterval(timer);
    mainMenuModal.classList.remove('hidden');
};

    if (closeMenuBtn) closeMenuBtn.onclick = () => mainMenuModal.classList.add('hidden');

    // SPELLBOOK TOGGLE
    if (spellMainBtn) {
    spellMainBtn.onclick = () => {
        spellsDropdown.classList.toggle('show');
    };

    }

    if (musicBtn && music) {
        musicBtn.onclick = () => {
            if (music.paused) {
                music.play();
                musicBtn.textContent = "Music: ON";
            } else {
                music.pause();
                musicBtn.textContent = "Music: OFF";
            }
        };
    }
});

// Palitan ang lumang "function castSpell(spell)" nito:
window.castSpell = function(spell) {
    if (spellCharges[spell] <= 0) return;

    console.log(`Casting ${spell}!`);
    spellCharges[spell]--;

    switch(spell) {
        case 'Revelio':
            // MAGIC: Ipapakita lahat ng cards saglit (2 seconds)
            const cardsToReveal = document.querySelectorAll('.card:not(.matched)');
            cardsToReveal.forEach(c => c.classList.add('flipped'));
            
            // Itatago ulit pagkatapos ng 2 seconds
            setTimeout(() => {
                cardsToReveal.forEach(c => {
                    // Huwag itago kung kasalukuyan itong pinili ng player (flippedCards)
                    if (!flippedCards.includes(c)) {
                        c.classList.remove('flipped');
                    }
                });
            }, 2000);
            break;

        case 'Alohomora':
            // MAGIC: Maghahanap ng isang pair at i-ma-match ito agad
            const unmatched = Array.from(document.querySelectorAll('.card:not(.matched):not(.flipped)'));
            if (unmatched.length >= 2) {
                const firstCard = unmatched[0];
                const partnerCard = unmatched.find(c => c !== firstCard && c.dataset.name === firstCard.dataset.name);
                
                if (partnerCard) {
                    firstCard.classList.add('flipped', 'matched');
                    partnerCard.classList.add('flipped', 'matched');
                    matchedCount += 2;
                    if (matchedCount === cards.length) endGame(true);
                }
            }
            break;

        case 'Stupefy':
            // MAGIC: Patitigilin ang oras
            isFrozen = true;
            const timerEl = document.getElementById('timer-container');
            if(timerEl) timerEl.style.color = '#3498db'; // Gawing asul ang timer habang frozen
            
            setTimeout(() => { 
                isFrozen = false; 
                if(timerEl) timerEl.style.color = ''; // Ibalik sa dati
            }, 7000); // 7 seconds na freeze
            break;
    }

    updateSpellUI();
    // I-hide ang dropdown pagkatapos gumamit ng spell
    const spellsDropdown = document.getElementById('spells-dropdown');
    if (spellsDropdown) spellsDropdown.classList.remove('show');
}



function newGame() {
    document.getElementById('victory').classList.add('hidden');
document.getElementById('game-over').classList.add('hidden');
document.getElementById('gameContainer').classList.remove('hidden');

    clearInterval(timer);
    isPaused = false;
    isFrozen = false;
    const menu = document.getElementById('mainMenuModal');
if (menu) menu.classList.add('hidden');

    matchedCount = 0;
    moves = 0;
    timeLeft = 60;
    flippedCards = [];
    spellCharges = { Revelio: 1, Alohomora: 1, Stupefy: 1 };

    document.getElementById('move-count').textContent = moves;
    document.getElementById('timer').textContent = formatTime(timeLeft);
    updateSpellUI();

    const board = document.getElementById('game-board');
    board.innerHTML = '';

    [...cards].sort(() => Math.random() - 0.5).forEach(img => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.name = img;
        card.innerHTML = `
            <div class="card-front"><img src="${backCardImage}"></div>
            <div class="card-back"><img src="${img}"></div>
        `;
        card.onclick = () => flipCard(card);
        board.appendChild(card);
    });

    startTimer();
}


// ... (retain formatTime, startTimer, flipCard, checkMatch, updateSpellUI, endGame, and window.castSpell from previous version)

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        if (!isPaused && !isFrozen) {
            timeLeft--;
            document.getElementById('timer').textContent = formatTime(timeLeft);
            if (timeLeft <= 0) endGame(false);
        }
    }, 1000);
}


function flipCard(card) {
    if (card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length === 2) return;
    card.classList.add('flipped');
    flippedCards.push(card);
    if (flippedCards.length === 2) {
        moves++;
        document.getElementById('move-count').textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const [c1, c2] = flippedCards;
    if (c1.dataset.name === c2.dataset.name) {
        c1.classList.add('matched');
        c2.classList.add('matched');
        matchedCount += 2;
        flippedCards = [];
        if (matchedCount === cards.length) endGame(true);
    } else {
        setTimeout(() => {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

function updateSpellUI() {
    for (let s in spellCharges) {
        const btn = document.getElementById(`btn-${s}`);
        if (btn) {
            btn.textContent = `${s} (${spellCharges[s]})`;
            btn.disabled = spellCharges[s] <= 0;
        }
    }
}

function formatTime(s) {
    return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
}

function endGame(win) {
    clearInterval(timer);

    // Get player name
    const playerNameInput = document.getElementById('player-name');
    const playerName = playerNameInput ? playerNameInput.value.trim() || "Player" : "Player";

    const nameDisplay = document.getElementById('player-name-display');
    if (nameDisplay) nameDisplay.textContent = playerName;

    if (win) {
        const timeUsed = 60 - timeLeft;

        // Save best time
        saveBestTime(timeUsed);

        // Show best time
        showBestTime();

        document.getElementById('final-time').textContent = formatTime(timeUsed);

        // Show victory modal
        document.getElementById('victory').classList.remove('hidden');
        document.getElementById('gameContainer').classList.add('hidden');

        // Launch confetti
        launchConfetti();

        // Save leaderboard
        saveLeaderboard(playerName, timeUsed);
    } else {
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('gameContainer').classList.add('hidden');
    }
}

// Confetti launch with proper overflow and position
function launchConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.classList.add('confetti-container');
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px'; // start above screen
        confetti.style.width = `${Math.random() * 6 + 4}px`;
        confetti.style.height = confetti.style.width;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confettiContainer.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(() => confetti.remove(), 5000);
    }

    // Remove container after all confetti
    setTimeout(() => confettiContainer.remove(), 5000);
}

// Best Time Functions
function saveBestTime(seconds) {
    const best = parseInt(localStorage.getItem('bestTime'), 10);

    if (!best || seconds < best) {
        localStorage.setItem('bestTime', seconds);

        const el = document.getElementById('best-time');
        if (el) el.classList.add('new-record'); // glow for new record
    }
}

function showBestTime() {
    const best = parseInt(localStorage.getItem('bestTime'), 10);
    if (best) {
        document.getElementById('best-time').textContent =
            `Fastest Time: ${formatTime(best)}`;
    }
}


function pauseGame() {
    clearInterval(timer);
    isPaused = true;
}

function resumeGame() {
    if (!isPaused) return;
    isPaused = false;
    startTimer();
    document.getElementById('mainMenuModal').classList.add('hidden');
}


function quitGame() {
    location.reload();
}



function saveLeaderboard(name, time) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name, time });
    leaderboard.sort((a, b) => a.time - b.time);
    leaderboard = leaderboard.slice(0, 5); // Top 5 only
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    showLeaderboard();
}

function showLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const lbEl = document.getElementById('leaderboard');
    if (!lbEl) return;

    lbEl.innerHTML = '<h3>🏆 Top 5 Fastest Times</h3>';
    leaderboard.forEach((entry, i) => {
        const p = document.createElement('p');
        p.innerHTML = `<span class="player-name">${entry.name}</span> - ${formatTime(entry.time)}`;
        lbEl.appendChild(p);
    });
}


function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        if (!isPaused && !isFrozen) {
            timeLeft--;
            document.getElementById('timer').textContent = formatTime(timeLeft);
            
            // TWIST: Dementor Attack Visuals (Lalabas lang mula 15s hanggang 10s)
            if (timeLeft <= 15 && timeLeft > 10) {
                document.body.classList.add('dementor-attack');
            } else {
                // Babalik sa dati kapag 10s na pababa o kapag higit sa 15s
                document.body.classList.remove('dementor-attack');
            }

            if (timeLeft <= 0) {
                document.body.classList.remove('dementor-attack'); // Siguradong malinis ang screen sa Game Over
                endGame(false);
            }
        }
    }, 1000);
}

