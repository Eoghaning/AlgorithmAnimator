/**
 * Sorting Algorithms for Algorithm Animator
 */

async function startSort() {
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
        updateStatText('status', 'Sorting...');
        
        const path = window.location.pathname.toLowerCase();
        if (path.includes('bubble-sort')) {
            await bubbleSortAnimation();
        } else if (path.includes('selection-sort')) {
            await selectionSortAnimation();
        } else if (path.includes('insertion-sort')) {
            await insertionSortAnimation();
        } else if (path.includes('quick-sort')) {
            await quickSortAnimation(0, array.length - 1);
            finalizeSort();
        } else {
            // Default or placeholder for other algorithms
            await bubbleSortAnimation();
        }
    } else if (isPaused) {
        isPaused = false;
        updateStatText('status', 'Sorting...');
    }
}

function pauseSort() {
    if (isRunning && !isPaused) {
        isPaused = true;
        updateStatText('status', 'Paused');
    }
}

/**
 * Quick Sort Implementation
 */
async function quickSortAnimation(start, end) {
    if (start >= end) return;
    
    let pivotIndex = await partition(start, end);
    if (!isRunning) return;
    
    await quickSortAnimation(start, pivotIndex - 1);
    await quickSortAnimation(pivotIndex + 1, end);
}

async function partition(start, end) {
    const pivotValue = array[end];
    let pivotIndex = start;
    
    let bars = document.querySelectorAll('.array-bar');
    bars[end].classList.add('swapping'); // Pivot bar
    
    for (let i = start; i < end; i++) {
        if (isPaused) await waitForResume();
        if (!isRunning) return;
        
        bars = document.querySelectorAll('.array-bar');
        bars[i].classList.add('comparing');
        playCompareSound();
        comparisons++;
        currentStep++;
        updateStatistics();
        await sleep(animationSpeed);
        
        if (array[i] < pivotValue) {
            [array[i], array[pivotIndex]] = [array[pivotIndex], array[i]];
            swaps++;
            updateStatistics();
            renderArray();
            pivotIndex++;
        }
        
        bars = document.querySelectorAll('.array-bar');
        if (bars[i]) bars[i].classList.remove('comparing');
    }
    
    [array[pivotIndex], array[end]] = [array[end], array[pivotIndex]];
    swaps++;
    updateStatistics();
    renderArray();
    await sleep(animationSpeed);
    
    return pivotIndex;
}

/**
 * Bubble Sort Implementation
 */
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
                bars[j].classList.remove('comparing');
                bars[j + 1].classList.remove('comparing');
                bars[j].classList.add('swapping');
                bars[j + 1].classList.add('swapping');
                playSwapSound();
                
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                swaps++;
                updateStatistics();
                await sleep(animationSpeed);
                
                renderArray();
                bars = document.querySelectorAll('.array-bar');
                bars[j].classList.remove('swapping');
                bars[j + 1].classList.remove('swapping');
            } else {
                bars[j].classList.remove('comparing');
                bars[j + 1].classList.remove('comparing');
            }
        }
        document.querySelectorAll('.array-bar')[n - i - 1].classList.add('sorted');
    }
    finalizeSort();
}

/**
 * Selection Sort Implementation
 */
async function selectionSortAnimation() {
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        let bars = document.querySelectorAll('.array-bar');
        bars[i].classList.add('comparing');
        
        for (let j = i + 1; j < n; j++) {
            if (isPaused) await waitForResume();
            if (!isRunning) return;
            
            bars[j].classList.add('comparing');
            playCompareSound();
            comparisons++;
            currentStep++;
            updateStatistics();
            await sleep(animationSpeed);
            
            if (array[j] < array[minIdx]) {
                bars[minIdx].classList.remove('comparing');
                minIdx = j;
                bars[minIdx].classList.add('comparing');
            } else {
                bars[j].classList.remove('comparing');
            }
        }
        
        if (minIdx !== i) {
            bars[i].classList.add('swapping');
            bars[minIdx].classList.add('swapping');
            playSwapSound();
            [array[i], array[minIdx]] = [array[minIdx], array[i]];
            swaps++;
            updateStatistics();
            await sleep(animationSpeed);
            renderArray();
        }
        
        document.querySelectorAll('.array-bar')[i].classList.add('sorted');
    }
    finalizeSort();
}

/**
 * Insertion Sort Implementation
 */
async function insertionSortAnimation() {
    const n = array.length;
    for (let i = 1; i < n; i++) {
        let key = array[i];
        let j = i - 1;
        
        let bars = document.querySelectorAll('.array-bar');
        bars[i].classList.add('swapping');
        
        while (j >= 0 && array[j] > key) {
            if (isPaused) await waitForResume();
            if (!isRunning) return;
            
            bars = document.querySelectorAll('.array-bar');
            bars[j].classList.add('comparing');
            playCompareSound();
            comparisons++;
            currentStep++;
            updateStatistics();
            await sleep(animationSpeed);
            
            array[j + 1] = array[j];
            swaps++;
            renderArray();
            bars = document.querySelectorAll('.array-bar');
            bars[j].classList.remove('comparing');
            j = j - 1;
        }
        array[j + 1] = key;
        renderArray();
        await sleep(animationSpeed);
    }
    finalizeSort();
}

function finalizeSort() {
    isSorted = true;
    renderArray();
    document.querySelectorAll('.array-bar').forEach(bar => bar.classList.add('sorted'));
    playSortedSound();
    updateStatText('status', 'Sorted!');
    isRunning = false;
}
