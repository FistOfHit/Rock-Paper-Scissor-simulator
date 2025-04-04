/**
 * Statistics tracking and display for the Rock-Paper-Scissors simulator
 */

// --- Stats Update & Display ---

/** Calculates current average speeds and triggers the main stats display update. */
function updateStatsDisplayOnInterval() {
    if (!window.simulationStartTime) return; // Don't update if simulation hasn't started

    // Calculate current average speeds (even if paused, reflects frozen state)
    let speedSums = { rock: 0, paper: 0, scissors: 0, all: 0 };
    let speedCounts = { rock: 0, paper: 0, scissors: 0, all: 0 };
    window.entities.forEach(entity => {
        const speed = entity.getCurrentSpeed();
        speedSums[entity.type] += speed;
        speedCounts[entity.type]++;
        speedSums.all += speed;
        speedCounts.all++;
    });
    const currentAvgSpeeds = {
        rock: speedCounts.rock > 0 ? (speedSums.rock / speedCounts.rock).toFixed(2) : '0.00',
        paper: speedCounts.paper > 0 ? (speedSums.paper / speedCounts.paper).toFixed(2) : '0.00',
        scissors: speedCounts.scissors > 0 ? (speedSums.scissors / speedCounts.scissors).toFixed(2) : '0.00',
        all: speedCounts.all > 0 ? (speedSums.all / speedCounts.all).toFixed(2) : '0.00'
    };
    // Store the latest calculated speeds if not paused, otherwise keep showing the last known speeds
    if (!window.isPaused) {
        window.lastAvgSpeeds = currentAvgSpeeds;
    }

    updateStatsDisplay(); // Update display using latest data (or frozen data if paused)
    
    // Collect timeseries data point if simulation is running and not paused
    if (window.simulationRunning && !window.isPaused && window.timeseriesData && window.timeseriesData.isCollecting) {
        window.timeseriesData.collectDataPoint();
    }
}

/** Updates all stats display text content and visibility. */
function updateStatsDisplay() {
    // --- Calculate Current Counts & KDR ---
    const counts = window.entities.reduce((acc, entity) => {
        acc[entity.type] = (acc[entity.type] || 0) + 1; return acc;
    }, {});
    const rockCount = counts[window.ENTITY_TYPES.ROCK] || 0;
    const paperCount = counts[window.ENTITY_TYPES.PAPER] || 0;
    const scissorsCount = counts[window.ENTITY_TYPES.SCISSORS] || 0;
    let countText = `⛰️ ${rockCount} | 📄 ${paperCount} | ✂️ ${scissorsCount}`;
    const rockKDR = formatKDR(window.stats.rock.kills, window.stats.rock.deaths);
    const paperKDR = formatKDR(window.stats.paper.kills, window.stats.paper.deaths);
    const scissorsKDR = formatKDR(window.stats.scissors.kills, window.stats.scissors.deaths);
    let kdText = `KDR: ⛰️ ${rockKDR} | 📄 ${paperKDR} | ✂️ ${scissorsKDR}`;

    // --- Check for Winner ---
    // Only check if running, not paused, and no winner declared yet
    if (window.simulationRunning && !window.isPaused && window.winnerInfo.type === null && isSimulationEnd() && window.entities.length > 0) {
        const winnerType = window.entities[0].type;
        let winnerEmoji = '', winnerName = '';
        switch (winnerType) {
            case window.ENTITY_TYPES.ROCK: winnerEmoji = '⛰️'; winnerName = 'Rock'; break;
            case window.ENTITY_TYPES.PAPER: winnerEmoji = '📄'; winnerName = 'Paper'; break;
            case window.ENTITY_TYPES.SCISSORS: winnerEmoji = '✂️'; winnerName = 'Scissors'; break;
        }
        countText += ` --- ${winnerEmoji} Wins!`;
        window.winnerInfo = { type: winnerName, emoji: winnerEmoji };
        window.simulationRunning = false; // Stop the simulation logic
        window.resetButton.disabled = false; // Enable reset button
        if (window.pauseResumeButton) window.pauseResumeButton.disabled = true; // Disable pause when game ends
        window.lastUpdateTime = Date.now(); // Record exact end time for stats
        if (window.exportButton) window.exportButton.classList.remove('hidden'); // Show export button
        
        // Stop timeseries data collection when simulation ends naturally
        if (window.timeseriesData) {
            window.timeseriesData.stopCollection();
        }

        // Stop the stats update interval when simulation ends naturally
        if (window.statsUpdateIntervalId) { clearInterval(window.statsUpdateIntervalId); window.statsUpdateIntervalId = null; }
    }

    // --- Calculate Time, Lifespan, Conversion Rate, Speed ---
    let timeText = 'Time: 0.0s';
    let lifespanText = 'Avg Lifespan (s):\nAll: 0.00 | ⛰️: 0.00 | 📄: 0.00 | ✂️: 0.00';
    let conversionText = 'Conversions/sec:\nAll: 0.00 | ⛰️: 0.00 | 📄: 0.00 | ✂️: 0.00';
    let speedText = `Avg Speed:\nAll: ${window.lastAvgSpeeds.all} | ⛰️: ${window.lastAvgSpeeds.rock} | 📄: ${window.lastAvgSpeeds.paper} | ✂️: ${window.lastAvgSpeeds.scissors}`;

    if (window.simulationTimeElapsedMs >= 0 && window.simulationStartTime) { // Check if simulation has started/run
        const elapsedSeconds = window.simulationTimeElapsedMs / 1000;
        timeText = `Time: ${formatElapsedTime(window.simulationTimeElapsedMs)}`;

        // Calculate overall and per-type Conversions Per Second (CPS)
        const cpsAll = elapsedSeconds > 0 ? (window.totalConversions / elapsedSeconds) : 0;
        const cpsRock = elapsedSeconds > 0 ? (window.totalConversionsPerType.rock / elapsedSeconds) : 0;
        const cpsPaper = elapsedSeconds > 0 ? (window.totalConversionsPerType.paper / elapsedSeconds) : 0;
        const cpsScissors = elapsedSeconds > 0 ? (window.totalConversionsPerType.scissors / elapsedSeconds) : 0;
        conversionText = `Conversions/sec:\nAll: ${cpsAll.toFixed(2)} | ⛰️: ${cpsRock.toFixed(2)} | 📄: ${cpsPaper.toFixed(2)} | ✂️: ${cpsScissors.toFixed(2)}`;

        // Calculate per-type and overall average lifespan
        const avgLifespanAll = window.conversionCounts.all > 0 ? (window.lifespanSums.all / window.conversionCounts.all / 1000).toFixed(2) : '0.00';
        const avgLifespanRock = window.conversionCounts.rock > 0 ? (window.lifespanSums.rock / window.conversionCounts.rock / 1000).toFixed(2) : '0.00';
        const avgLifespanPaper = window.conversionCounts.paper > 0 ? (window.lifespanSums.paper / window.conversionCounts.paper / 1000).toFixed(2) : '0.00';
        const avgLifespanScissors = window.conversionCounts.scissors > 0 ? (window.lifespanSums.scissors / window.conversionCounts.scissors / 1000).toFixed(2) : '0.00';
        lifespanText = `Avg Lifespan (s):\nAll: ${avgLifespanAll} | ⛰️: ${avgLifespanRock} | 📄: ${avgLifespanPaper} | ✂️: ${avgLifespanScissors}`;
    }

    // --- Update DOM Elements ---
    if(window.entityCountsDiv) window.entityCountsDiv.textContent = countText;
    if(window.killDeathCountsDiv) window.killDeathCountsDiv.textContent = kdText;
    if(window.simulationTimeDisplay) window.simulationTimeDisplay.textContent = timeText;
    if(window.avgLifespanDisplay) window.avgLifespanDisplay.textContent = lifespanText;
    if(window.conversionRateDisplay) window.conversionRateDisplay.textContent = conversionText;
    if(window.avgSpeedDisplay) window.avgSpeedDisplay.textContent = speedText;


    // --- Apply Visibility ---
    const allStatsElements = [window.entityCountsDiv, window.killDeathCountsDiv, window.simulationTimeDisplay, window.avgLifespanDisplay, window.conversionRateDisplay, window.avgSpeedDisplay];
    if (window.advancedMenuOpen) {
        // Hide ALL stats if advanced menu is open
        allStatsElements.forEach(el => { if (el) el.classList.add('stats-hidden'); });
    } else {
        // Apply visibility based on statsVisible (counts always visible when adv menu closed)
        allStatsElements.forEach(el => {
            if (el) {
                if (el.id === 'entityCounts') {
                    el.classList.remove('stats-hidden'); // Always show counts
                } else if (window.statsVisible) {
                    el.classList.remove('stats-hidden'); // Show other stats if toggled on
                } else {
                    el.classList.add('stats-hidden'); // Hide other stats if toggled off
                }
            }
        });
    }
}

/** Formats Kill/Death Ratio string. */
function formatKDR(kills, deaths) {
    if (deaths === 0) {
        return `INF (${kills}/0)`;
    }
    return `${(kills / deaths).toFixed(2)} (${kills}/${deaths})`;
}

/** Formats elapsed time in milliseconds into a human-readable string (h:mm:ss or m:ss or s.s). */
function formatElapsedTime(ms) {
    if (ms <= 0) return '0.0s';
    const totalSecondsFloat = ms / 1000;
    const hours = Math.floor(totalSecondsFloat / 3600);
    const minutes = Math.floor((totalSecondsFloat % 3600) / 60);
    const seconds = totalSecondsFloat % 60;
    const totalSecondsFormatted = totalSecondsFloat.toFixed(1);

    let timeString = '';
    if (hours > 0) {
        timeString += `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toFixed(0).padStart(2, '0')}s (${totalSecondsFormatted}s)`;
    } else if (minutes > 0) {
        timeString += `${minutes}m ${seconds.toFixed(0).padStart(2, '0')}s (${totalSecondsFormatted}s)`;
    } else {
        timeString += `${seconds.toFixed(1)}s`;
    }
    return timeString;
}

// Make functions available globally
window.updateStatsDisplayOnInterval = updateStatsDisplayOnInterval;
window.updateStatsDisplay = updateStatsDisplay;
window.formatKDR = formatKDR;
window.formatElapsedTime = formatElapsedTime;
