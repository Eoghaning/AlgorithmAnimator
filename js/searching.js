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
        } else if (path.includes('exponential-search')) {
            await exponentialSearchAnimation();
        } else {
            await linearSearchAnimation();
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

async function binarySearchAnimation(l = 0, h = array.length - 1) {
    low = l;
    high = h;
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
            if (bars[i]) bars[i].classList.add('comparing');
        }
        
        updateSearchStatistics();
        await sleep(animationSpeed);
        
        if (array[mid] === searchTarget) {
            bars.forEach(bar => bar.classList.remove('comparing'));
            if (bars[mid]) bars[mid].classList.add('found');
            playFoundSound();
            updateStatText('status', `Found at index ${mid}!`);
            isRunning = false;
            return true;
        } else if (array[mid] < searchTarget) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
        updateSearchStatistics();
    }
    
    if (l === 0 && h === array.length - 1) {
        updateStatText('status', 'Not found in array!');
        isRunning = false;
    }
    return false;
}

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

async function exponentialSearchAnimation() {
    const n = array.length;
    const bars = document.querySelectorAll('.array-bar');
    
    if (array[0] === searchTarget) {
        bars[0].classList.add('found');
        playFoundSound();
        updateStatText('status', 'Found at index 0!');
        isRunning = false;
        return;
    }
    
    let i = 1;
    while (i < n && array[i] <= searchTarget) {
        if (isPaused) await waitForResume();
        if (!isRunning) return;
        
        bars.forEach(bar => bar.classList.remove('comparing'));
        bars[i].classList.add('comparing');
        playCompareSound();
        comparisons++;
        currentStep++;
        
        low = 0;
        high = i;
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
        
        i = i * 2;
    }
    
    updateStatText('status', 'Switching to binary search...');
    await sleep(animationSpeed);
    
    const result = await binarySearchAnimation(i / 2, Math.min(i, n - 1));
    if (!result && isRunning) {
        updateStatText('status', 'Not found in array!');
        isRunning = false;
    }
}
