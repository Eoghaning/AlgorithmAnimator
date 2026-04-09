/**
 * Core Logic for Algorithm Animator
 * Contains global state, audio context, and UI utility functions.
 */

let array = [];
let originalArray = [];
let animationSpeed = 100; // Default speed
let isRunning = false;
let isPaused = false;
let animationTimeout = null;

let comparisons = 0;
let swaps = 0;
let currentStep = 0;
let isSorted = false;

let searchTarget = null;
let low = 0;
let high = 0;
let mid = 0;

// Audio Context for sound effects
let audioContext = null;

/**
 * Initializes the AudioContext on user interaction
 */
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

/**
 * Plays a beep sound
 */
function playBeep(frequency, duration, type) {
    try {
        const ctx = initAudio();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
        // Silently fail if audio is blocked or unavailable
    }
}

// Pre-defined sounds for specific actions
const playCompareSound = () => playBeep(400, 0.05, 'sine');
const playSwapSound = () => playBeep(600, 0.08, 'square');
const playSortedSound = () => {
    playBeep(800, 0.15, 'sine');
    setTimeout(() => playBeep(1000, 0.15, 'sine'), 100);
};
const playFoundSound = () => {
    playBeep(523, 0.1, 'sine');
    setTimeout(() => playBeep(659, 0.1, 'sine'), 100);
    setTimeout(() => playBeep(784, 0.15, 'sine'), 200);
};

/**
 * Generates a new random array for sorting
 */
function generateRandomArray() {
    const sizeInput = document.getElementById('arraySize');
    const size = parseInt(sizeInput.value) || 15;
    array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 100) + 5);
    }
    originalArray = [...array];
    resetStatistics();
    renderArray();
}

/**
 * Generates a sorted array for searching
 */
function generateSortedArray() {
    const sizeInput = document.getElementById('arraySize');
    const size = parseInt(sizeInput.value) || 15;
    array = [];
    for (let i = 0; i < size; i++) {
        array.push((i + 1) * 5);
    }
    originalArray = [...array];
    resetSearchStatistics();
    renderSearchArray();
}

/**
 * Resets the current array to its original state
 */
function resetArray() {
    array = [...originalArray];
    resetStatistics();
    isSorted = false;
    renderArray();
}

function resetSearch() {
    array = [...originalArray];
    resetSearchStatistics();
    renderSearchArray();
}

function resizeArray() {
    generateRandomArray();
}

function resizeSearchArray() {
    generateSortedArray();
}

/**
 * Renders the array as vertical bars
 */
function renderArray() {
    const container = document.getElementById('arrayContainer');
    if (!container) return;
    container.innerHTML = '';
    const maxValue = Math.max(...array);
    const containerHeight = 350;
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'array-bar';
        bar.style.height = ((value / maxValue) * containerHeight) + 'px';
        bar.style.width = Math.max(20, Math.min(50, 600 / array.length)) + 'px';
        const label = document.createElement('span');
        label.textContent = value;
        bar.appendChild(label);
        container.appendChild(bar);
    });
}

function renderSearchArray() {
    const container = document.getElementById('arrayContainer');
    if (!container) return;
    container.innerHTML = '';
    const maxValue = Math.max(...array);
    const containerHeight = 350;
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'array-bar';
        bar.style.height = ((value / maxValue) * containerHeight) + 'px';
        bar.style.width = Math.max(30, Math.min(60, 500 / array.length)) + 'px';
        bar.dataset.index = index;
        const label = document.createElement('span');
        label.textContent = value;
        bar.appendChild(label);
        container.appendChild(bar);
    });
}

/**
 * Resets UI statistics for sorting
 */
function resetStatistics() {
    comparisons = 0;
    swaps = 0;
    currentStep = 0;
    isRunning = false;
    isPaused = false;
    isSorted = false;
    
    updateStatText('comparisons', '0');
    updateStatText('swaps', '0');
    updateStatText('currentStep', '0');
    updateStatText('status', 'Ready');
    
    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.disabled = false;
    
    if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }
}

/**
 * Resets UI statistics for searching
 */
function resetSearchStatistics() {
    comparisons = 0;
    currentStep = 0;
    low = 0;
    high = array.length - 1;
    mid = 0;
    isRunning = false;
    isPaused = false;
    searchTarget = null;
    
    updateStatText('comparisons', '0');
    updateStatText('currentStep', '0');
    updateStatText('low', '0');
    updateStatText('high', array.length - 1);
    updateStatText('mid', '-');
    updateStatText('status', 'Ready');
    
    if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }
}

function updateStatText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function updateStatistics() {
    updateStatText('comparisons', comparisons);
    updateStatText('swaps', swaps);
    updateStatText('currentStep', currentStep);
}

function updateSearchStatistics() {
    updateStatText('comparisons', comparisons);
    updateStatText('currentStep', currentStep);
    updateStatText('low', low);
    updateStatText('high', high);
    updateStatText('mid', mid >= 0 ? mid : '-');
}

/**
 * Helper for pausing animations
 */
function sleep(ms) {
    return new Promise(resolve => {
        animationTimeout = setTimeout(resolve, ms);
    });
}

function waitForResume() {
    return new Promise(resolve => {
        const checkResume = () => {
            if (!isPaused) {
                resolve();
            } else {
                setTimeout(checkResume, 100);
            }
        };
        checkResume();
    });
}

/**
 * Updates the animation speed based on UI selection
 */
function setSpeed(level) {
    const buttons = document.querySelectorAll('.speed-btn');
    if (buttons.length > 0) {
        buttons.forEach(btn => btn.classList.remove('selected'));
        if (buttons[level - 1]) buttons[level - 1].classList.add('selected');
    }
    const speeds = [500, 300, 100, 75, 30];
    animationSpeed = speeds[level - 1] || 100;
}

/**
 * Auto-initialization on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    const arrayContainer = document.getElementById('arrayContainer');
    if (arrayContainer) {
        const pageName = window.location.pathname.toLowerCase();
        if (pageName.includes('search')) {
            generateSortedArray();
        } else {
            generateRandomArray();
        }
    }
});
