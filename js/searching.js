/**
 * Searching Algorithms for Algorithm Animator
 */

async function startSearch() {
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
        updateStatText('status', 'Searching...');
        
        const path = window.location.pathname.toLowerCase();
        if (path.includes('binary-search')) {
            await binarySearchAnimation();
        } else if (path.includes('linear-search')) {
            await linearSearchAnimation();
        } else {
            // Default
            await binarySearchAnimation();
        }
    } else if (isPaused) {
        isPaused = false;
        updateStatText('status', 'Searching...');
    }
}

function pauseSearch() {
    if (isRunning && !isPaused) {
        isPaused = true;
        updateStatText('status', 'Paused');
    }
}

/**
 * Binary Search Implementation
 */
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
            bars.forEach(bar => bar.classList.remove('comparing'));
            bars[mid].classList.add('found');
            playFoundSound();
            updateStatText('status', `Found at index ${mid}!`);
            isRunning = false;
            return;
        } else if (array[mid] < searchTarget) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
        updateSearchStatistics();
    }
    updateStatText('status', 'Not found in array!');
    isRunning = false;
}

/**
 * Linear Search Implementation
 */
async function linearSearchAnimation() {
    const bars = document.querySelectorAll('.array-bar');
    for (let i = 0; i < array.length; i++) {
        if (isPaused) await waitForResume();
        if (!isRunning) return;
        
        bars[i].classList.add('comparing');
        playCompareSound();
        comparisons++;
        currentStep++;
        updateSearchStatistics();
        await sleep(animationSpeed);
        
        if (array[i] === searchTarget) {
            bars[i].classList.remove('comparing');
            bars[i].classList.add('found');
            playFoundSound();
            updateStatText('status', `Found at index ${i}!`);
            isRunning = false;
            return;
        }
        bars[i].classList.remove('comparing');
    }
    updateStatText('status', 'Not found in array!');
    isRunning = false;
}
