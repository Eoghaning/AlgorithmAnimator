let array = [];
let originalArray = [];
let animationSpeed = 560;
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

let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

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
    } catch (e) {}
}

function playCompareSound() {
    playBeep(400, 0.05, 'sine');
}

function playSwapSound() {
    playBeep(600, 0.08, 'square');
}

function playSortedSound() {
    playBeep(800, 0.15, 'sine');
    setTimeout(() => playBeep(1000, 0.15, 'sine'), 100);
}

function playFoundSound() {
    playBeep(523, 0.1, 'sine');
    setTimeout(() => playBeep(659, 0.1, 'sine'), 100);
    setTimeout(() => playBeep(784, 0.15, 'sine'), 200);
}

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

function resetStatistics() {
    comparisons = 0;
    swaps = 0;
    currentStep = 0;
    isRunning = false;
    isPaused = false;
    isSorted = false;
    const compEl = document.getElementById('comparisons');
    const swapsEl = document.getElementById('swaps');
    const stepEl = document.getElementById('currentStep');
    const statusEl = document.getElementById('status');
    if (compEl) compEl.textContent = '0';
    if (swapsEl) swapsEl.textContent = '0';
    if (stepEl) stepEl.textContent = '0';
    if (statusEl) statusEl.textContent = 'Ready';
    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.disabled = false;
}

function resetSearchStatistics() {
    comparisons = 0;
    currentStep = 0;
    low = 0;
    high = array.length - 1;
    mid = 0;
    isRunning = false;
    isPaused = false;
    searchTarget = null;
    const ids = ['comparisons', 'currentStep', 'low', 'high', 'mid', 'status'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'high') el.textContent = array.length - 1;
            else if (id === 'mid') el.textContent = '-';
            else el.textContent = '0';
        }
    });
    const statusEl = document.getElementById('status');
    if (statusEl) statusEl.textContent = 'Ready';
}

function updateStatistics() {
    const compEl = document.getElementById('comparisons');
    const swapsEl = document.getElementById('swaps');
    const stepEl = document.getElementById('currentStep');
    if (compEl) compEl.textContent = comparisons;
    if (swapsEl) swapsEl.textContent = swaps;
    if (stepEl) stepEl.textContent = currentStep;
}

function updateSearchStatistics() {
    const ids = ['comparisons', 'currentStep', 'low', 'high', 'mid'];
    const values = [comparisons, currentStep, low, high, mid >= 0 ? mid : '-'];
    ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.textContent = values[i];
    });
}

function updateSpeed() {
    const speedInput = document.getElementById('speed');
    const value = parseInt(speedInput.value);
    animationSpeed = Math.floor(840 - ((value - 1) / 99) * 420);
}

function startSort() {
    initAudio();
    if (isSorted) {
        array = [...originalArray];
        isSorted = false;
        comparisons = 0;
        swaps = 0;
        currentStep = 0;
        renderArray();
    }
    if (!isRunning) {
        isRunning = true;
        isPaused = false;
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = 'Sorting...';
        bubbleSortAnimation();
    } else if (isPaused) {
        isPaused = false;
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = 'Sorting...';
    }
}

function pauseSort() {
    if (isRunning && !isPaused) {
        isPaused = true;
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = 'Paused';
    }
}

function startSearch() {
    initAudio();
    const targetInput = document.getElementById('searchTarget');
    searchTarget = parseInt(targetInput.value);
    if (isNaN(searchTarget)) {
        searchTarget = array[Math.floor(Math.random() * array.length)];
        document.getElementById('searchTarget').value = searchTarget;
    }
    if (!isRunning) {
        isRunning = true;
        isPaused = false;
        low = 0;
        high = array.length - 1;
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = 'Searching...';
        binarySearchAnimation();
    } else if (isPaused) {
        isPaused = false;
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = 'Searching...';
    }
}

function pauseSearch() {
    if (isRunning && !isPaused) {
        isPaused = true;
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = 'Paused';
    }
}

async function bubbleSortAnimation() {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (isPaused) await waitForResume();
            if (!isRunning) return;
            
            let bars = document.querySelectorAll('.array-bar');
            bars[j].classList.add('comparing');
            bars[j + 1].classList.add('comparing');
            playCompareSound();
            comparisons++;
            currentStep++;
            updateStatistics();
            await sleep(animationSpeed);
            
            if (array[j] > array[j + 1]) {
                bars = document.querySelectorAll('.array-bar');
                bars[j].classList.remove('comparing');
                bars[j + 1].classList.remove('comparing');
                bars[j].classList.add('swapping');
                bars[j + 1].classList.add('swapping');
                playSwapSound();
                
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
                swaps++;
                updateStatistics();
                await sleep(animationSpeed);
                
                renderArray();
                bars = document.querySelectorAll('.array-bar');
                bars[j].classList.remove('swapping');
                bars[j + 1].classList.remove('swapping');
            } else {
                bars = document.querySelectorAll('.array-bar');
                bars[j].classList.remove('comparing');
                bars[j + 1].classList.remove('comparing');
            }
        }
        
        bars = document.querySelectorAll('.array-bar');
        bars[n - i - 1].classList.add('sorted');
        await sleep(animationSpeed / 2);
    }
    
    isSorted = true;
    renderArray();
    document.querySelectorAll('.array-bar').forEach(bar => bar.classList.add('sorted'));
    playSortedSound();
    document.getElementById('status').textContent = 'Sorted!';
    isRunning = false;
}

async function binarySearchAnimation() {
    const bars = document.querySelectorAll('.array-bar');
    while (low <= high) {
        if (isPaused) await waitForResume();
        if (!isRunning) return;
        
        mid = Math.floor((low + high) / 2);
        playCompareSound();
        comparisons++;
        currentStep++;
        
        bars.forEach(bar => bar.classList.remove('comparing', 'found'));
        for (let i = low; i <= high; i++) {
            bars[i].classList.add('comparing');
        }
        
        updateSearchStatistics();
        await sleep(animationSpeed);
        
        if (array[mid] === searchTarget) {
            bars[mid].classList.remove('comparing');
            bars[mid].classList.add('found');
            playFoundSound();
            document.getElementById('status').textContent = 'Found at ' + mid + '!';
            isRunning = false;
            return;
        } else if (array[mid] < searchTarget) {
            for (let i = low; i <= high; i++) {
                bars[i].classList.remove('comparing');
            }
            low = mid + 1;
        } else {
            for (let i = low; i <= high; i++) {
                bars[i].classList.remove('comparing');
            }
            high = mid - 1;
        }
        updateSearchStatistics();
    }
    document.getElementById('status').textContent = 'Not in array!';
    isRunning = false;
}

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

function clearAllTimeouts() {
    if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const arrayContainer = document.getElementById('arrayContainer');
    if (arrayContainer) {
        const pageName = window.location.pathname.split('/').pop();
        if (pageName.includes('search')) {
            generateSortedArray();
        } else {
            generateRandomArray();
        }
    }
});