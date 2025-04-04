/**
 * Simulation logic for the Rock-Paper-Scissors simulator
 * Handles the main game loop, collision detection, and statistics tracking
 */

// --- Global Variables ---
window.entities = [];
window.entityIdCounter = 0;
window.spatialGrid = [];
window.gridRows = 0;
window.gridCols = 0;
window.simulationRunning = false;
window.isPaused = false;
window.simulationStartTime = null;
window.lastUpdateTime = 0;
window.simulationTimeElapsedMs = 0;
window.animationFrameId = null;
window.statsUpdateIntervalId = null;
window.statsVisible = true;
window.advancedMenuOpen = false;
window.typeSettingsEnabled = false;
window.winnerInfo = { type: null, emoji: null };

// Statistics tracking
window.stats = { rock: { kills: 0, deaths: 0 }, paper: { kills: 0, deaths: 0 }, scissors: { kills: 0, deaths: 0 } };
window.totalConversions = 0;
window.totalConversionsPerType = { rock: 0, paper: 0, scissors: 0 };
window.lifespanSums = { rock: 0, paper: 0, scissors: 0, all: 0 };
window.conversionCounts = { rock: 0, paper: 0, scissors: 0, all: 0 };
window.lastAvgSpeeds = { rock: '0.00', paper: '0.00', scissors: '0.00', all: '0.00' };

// --- Target Finding Algorithms ---

/** Brute-force check against all other entities. */
function findNearby_BruteForce(entity, allEntities, separationCheckDistSq, detectionRadiusMult) {
    const { prey: targetPreyType, predator: targetPredatorType } = entity.getTargets();
    const useInfiniteDetection = (detectionRadiusMult === window.INFINITE_DETECTION_VALUE);
    const detectionRadius = entity.size * detectionRadiusMult;
    const detectionRadiusSq = useInfiniteDetection ? Infinity : detectionRadius * detectionRadius;

    for (const other of allEntities) {
        if (other === entity) continue; // Skip self

        const dx = other.x - entity.x;
        const dy = other.y - entity.y;
        const distSq = dx * dx + dy * dy;

        // Check for prey/predator within detection radius
        if (distSq < detectionRadiusSq) {
            if (other.type === targetPreyType && distSq < entity.minDistPreySq) {
                entity.minDistPreySq = distSq;
                entity.closestPrey = other;
            } else if (other.type === targetPredatorType && distSq < entity.minDistPredatorSq) {
                entity.minDistPredatorSq = distSq;
                entity.closestPredator = other;
            }
        }

        // Check for same-type neighbors for separation
        if (other.type === entity.type && distSq > 0 && distSq < separationCheckDistSq) {
            const dist = Math.sqrt(distSq);
            entity.separateVx -= (dx / dist); // Accumulate separation vector (away from neighbor)
            entity.separateVy -= (dy / dist);
        }
    }
}

/** Spatial grid check against entities in nearby cells (Optimized Mode). */
function findNearby_Grid(entity, separationCheckDistSq) {
    const { prey: targetPreyType, predator: targetPredatorType } = entity.getTargets();
    const entityCol = Math.floor(entity.x / window.OPTIMIZED_SETTINGS.GRID_CELL_SIZE);
    const entityRow = Math.floor(entity.y / window.OPTIMIZED_SETTINGS.GRID_CELL_SIZE);

    // Check entity's cell and 8 neighboring cells
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            const checkRow = entityRow + rowOffset;
            const checkCol = entityCol + colOffset;

            // Ensure the cell is within grid bounds
            if (checkRow >= 0 && checkRow < window.gridRows && checkCol >= 0 && checkCol < window.gridCols) {
                const cell = window.spatialGrid[checkRow][checkCol];
                for (const other of cell) {
                    if (other === entity) continue; // Skip self

                    const dx = other.x - entity.x;
                    const dy = other.y - entity.y;
                    const distSq = dx * dx + dy * dy;

                    // Check for prey/predator (no detection radius check needed in grid mode, implicitly limited)
                    if (other.type === targetPreyType && distSq < entity.minDistPreySq) {
                        entity.minDistPreySq = distSq;
                        entity.closestPrey = other;
                    } else if (other.type === targetPredatorType && distSq < entity.minDistPredatorSq) {
                        entity.minDistPredatorSq = distSq;
                        entity.closestPredator = other;
                    }

                    // Check for same-type neighbors for separation
                    if (other.type === entity.type && distSq > 0 && distSq < separationCheckDistSq) {
                        const dist = Math.sqrt(distSq);
                        entity.separateVx -= (dx / dist);
                        entity.separateVy -= (dy / dist);
                    }
                }
            }
        }
    }
}

// --- Collision Handling ---

/** Resolves interaction between two entities (predation/conversion). */
function resolveCollision(a, b) {
    const typeA = a.type;
    const typeB = b.type;
    if (typeA === typeB) return; // No interaction between same types

    // Determine predator and prey based on RPS rules
    const winMap = { 
        [window.ENTITY_TYPES.ROCK]: window.ENTITY_TYPES.SCISSORS, 
        [window.ENTITY_TYPES.PAPER]: window.ENTITY_TYPES.ROCK, 
        [window.ENTITY_TYPES.SCISSORS]: window.ENTITY_TYPES.PAPER 
    };
    let predator = null, prey = null;
    let predatorType = null, preyType = null;

    if (winMap[typeA] === typeB) { 
        predator = a; prey = b; predatorType = typeA; preyType = typeB; 
    }
    else if (winMap[typeB] === typeA) { 
        predator = b; prey = a; predatorType = typeB; preyType = typeA; 
    }
    else { return; } // Should not happen with standard RPS types

    // Get the correct predation radius (global or type-specific)
    const useTypeSettings = window.typeSettingsEnabled;
    const predationMultiplier = useTypeSettings
        ? parseFloat(window.controlElements[`predationRadiusSlider_${predatorType}`]?.value ?? window.config.PREDATION_RADIUS_MULTIPLIER)
        : window.config.PREDATION_RADIUS_MULTIPLIER;
    const predationRadius = predator.size * predationMultiplier; // Based on PREDATOR's size
    const predationRadiusSq = predationRadius * predationRadius;

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distSq = dx * dx + dy * dy;

    // Check if distance is within predation radius for conversion
    if (distSq < predationRadiusSq) {
        // Update kill/death stats
        window.stats[predatorType].kills++;
        window.stats[preyType].deaths++;
        window.totalConversionsPerType[predatorType]++; // Increment conversions attributed to the predator type

        // Track lifespan of the converted entity (based on its original type)
        if (prey.deathTime === null) { // Only record lifespan once per "life"
            prey.deathTime = Date.now();
            const lifespan = prey.deathTime - prey.birthTime;
            if (lifespan > 0) {
                const originalPreyType = prey.originalType;
                window.lifespanSums[originalPreyType] += lifespan;
                window.conversionCounts[originalPreyType]++;
                window.lifespanSums.all += lifespan;
                window.conversionCounts.all++;
                window.totalConversions++; // Overall conversion counter
            }
        }

        // Convert the prey entity
        prey.type = predatorType;
        prey.originalType = predatorType; // Update original type after conversion
        prey.birthTime = Date.now(); // Reset birth time for the new life
        prey.deathTime = null; // Reset death time
    }
}

/** Brute-force collision check (O(n^2)). */
function handleCollisions_BruteForce(entitiesToCheck) {
    for (let i = 0; i < entitiesToCheck.length; i++) {
        for (let j = i + 1; j < entitiesToCheck.length; j++) {
            const entityA = entitiesToCheck[i];
            const entityB = entitiesToCheck[j];
            // Use combined size for basic collision check before resolving interaction
            const collisionDistSq = Math.pow(entityA.size + entityB.size, 2);
            const dx = entityB.x - entityA.x;
            const dy = entityB.y - entityA.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < collisionDistSq) {
                resolveCollision(entityA, entityB);
            }
        }
    }
}

/** Spatial grid based collision check (Optimized Mode). */
function handleCollisions_Grid() {
    let checkedPairs = new Set(); // Avoid checking the same pair twice

    for (let r = 0; r < window.gridRows; r++) {
        for (let c = 0; c < window.gridCols; c++) {
            const cellEntities = window.spatialGrid[r][c];

            // 1. Check collisions within the current cell
            for (let i = 0; i < cellEntities.length; i++) {
                for (let j = i + 1; j < cellEntities.length; j++) {
                    const entityA = cellEntities[i];
                    const entityB = cellEntities[j];
                    const pairId = entityA.id < entityB.id ? `${entityA.id}-${entityB.id}` : `${entityB.id}-${entityA.id}`;
                    if (checkedPairs.has(pairId)) continue;

                    const collisionDistSq = Math.pow(entityA.size + entityB.size, 2);
                    const dx = entityB.x - entityA.x;
                    const dy = entityB.y - entityA.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < collisionDistSq) {
                        resolveCollision(entityA, entityB);
                    }
                    checkedPairs.add(pairId);
                }
            }

            // 2. Check collisions with neighboring cells (only check forward/down to avoid duplicates)
            const neighbourOffsets = [
                { dr: 0, dc: 1 }, // Right
                { dr: 1, dc: 1 }, // Bottom-Right
                { dr: 1, dc: 0 }, // Bottom
                { dr: 1, dc: -1 } // Bottom-Left
            ];

            for (const offset of neighbourOffsets) {
                const nr = r + offset.dr;
                const nc = c + offset.dc;

                if (nr >= 0 && nr < window.gridRows && nc >= 0 && nc < window.gridCols) {
                    const neighbourCellEntities = window.spatialGrid[nr][nc];
                    for (const entityA of cellEntities) {
                        for (const entityB of neighbourCellEntities) {
                            const pairId = entityA.id < entityB.id ? `${entityA.id}-${entityB.id}` : `${entityB.id}-${entityA.id}`;
                            if (checkedPairs.has(pairId)) continue;

                            const collisionDistSq = Math.pow(entityA.size + entityB.size, 2);
                            const dx = entityB.x - entityA.x;
                            const dy = entityB.y - entityA.y;
                            const distSq = dx * dx + dy * dy;
                            if (distSq < collisionDistSq) {
                                resolveCollision(entityA, entityB);
                            }
                            checkedPairs.add(pairId);
                        }
                    }
                }
            }
        }
    }
}

// --- Spatial Grid Update ---
/** Rebuilds the spatial grid based on current entity positions. */
function updateSpatialGrid(entitiesToGrid) {
    if (!window.canvas || window.canvas.width <= 0 || window.canvas.height <= 0) {
        window.gridCols = 0; window.gridRows = 0; window.spatialGrid = []; return;
    }
    window.gridCols = Math.max(1, Math.ceil(window.canvas.width / window.OPTIMIZED_SETTINGS.GRID_CELL_SIZE));
    window.gridRows = Math.max(1, Math.ceil(window.canvas.height / window.OPTIMIZED_SETTINGS.GRID_CELL_SIZE));
    // Initialize grid as 2D array of empty arrays
    window.spatialGrid = Array.from({ length: window.gridRows }, () =>
        Array.from({ length: window.gridCols }, () => [])
    );

    for (const entity of entitiesToGrid) {
        // Clamp coordinates to grid bounds
        const col = Math.max(0, Math.min(window.gridCols - 1, Math.floor(entity.x / window.OPTIMIZED_SETTINGS.GRID_CELL_SIZE)));
        const row = Math.max(0, Math.min(window.gridRows - 1, Math.floor(entity.y / window.OPTIMIZED_SETTINGS.GRID_CELL_SIZE)));
        // Add entity to the corresponding cell
        if (window.spatialGrid[row]?.[col]) { // Check if cell exists before pushing
            window.spatialGrid[row][col].push(entity);
        } else {
            // This case should ideally not happen with clamping, but good for debugging
            console.warn(`Attempted to place entity in invalid grid cell: [${row}][${col}]`);
        }
    }
}

// --- Main Game Loop ---
function gameLoop() {
    const now = Date.now();

    // Only update simulation state if not paused
    if (!window.isPaused) {
        const deltaTime = now - window.lastUpdateTime; // Time since last actual update
        window.simulationTimeElapsedMs += deltaTime; // Add to internal simulation timer
        window.lastUpdateTime = now; // Update last time for next frame calculation

        if (window.config.OPTIMIZED_MODE && window.simulationRunning) {
            updateSpatialGrid(window.entities); // Update grid before entity updates
        }

        if (window.simulationRunning) {
            // Update all entities
            window.entities.forEach(entity => {
                entity.update(); // Update position, velocity, targets etc.
            });

            // Handle collisions/interactions
            if (window.config.OPTIMIZED_MODE) {
                handleCollisions_Grid();
            } else {
                handleCollisions_BruteForce(window.entities);
            }
        }
    }
    // If paused, simulationTimeElapsedMs and entity states remain frozen

    // Drawing always happens based on current entity state (frozen if paused)
    window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
    window.entities.forEach(entity => entity.draw(window.ctx));
    if (window.winnerInfo.type !== null) {
        drawWinnerMessage(window.ctx, window.winnerInfo); // Draw winner message if game ended
    }

    // Keep requesting frames if the simulation is "running" (could be paused)
    // The loop needs to run to handle potential resume and redraw the canvas
    if (window.simulationRunning) {
        window.animationFrameId = requestAnimationFrame(gameLoop);
    } else {
        // Simulation explicitly stopped (reset or natural end)
        if (window.animationFrameId) cancelAnimationFrame(window.animationFrameId);
        window.animationFrameId = null;
        // Ensure stats display final correct time if stopped
        if (window.simulationStartTime) window.lastUpdateTime = Date.now();
        updateStatsDisplay(); // Final stats update
    }
}

/** Checks if only one type of entity remains. */
function isSimulationEnd() {
    if (window.entities.length === 0) return true; // End if no entities left
    const firstType = window.entities[0].type;
    return window.entities.every(e => e.type === firstType); // End if all remaining entities are the same type
}

/** Draws the winner message overlay on the canvas. */
function drawWinnerMessage(ctx, winner) {
    const centerX = window.canvas.width / 2;
    const centerY = window.canvas.height / 2;
    const textFontSize = Math.max(16, Math.min(48, window.canvas.width / 12)); // Responsive font size
    const emojiFontSize = textFontSize * 1.2;

    // Draw text with shadow
    ctx.font = `${textFontSize}px 'Press Start 2P'`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 5;
    ctx.fillText(`${winner.type} Wins!`, centerX, centerY - textFontSize * 0.6);

    // Draw emoji with shadow
    ctx.font = `${emojiFontSize}px 'Press Start 2P'`;
    ctx.fillText(winner.emoji, centerX, centerY + textFontSize * 0.6);
    ctx.shadowBlur = 0; // Reset shadow
}

// --- Simulation Control (Start/Stop/Reset/Pause) ---

/** Starts a new simulation. */
function startSimulation() {
    if (window.simulationRunning) return; // Prevent starting if already running
    if (window.animationFrameId) { cancelAnimationFrame(window.animationFrameId); window.animationFrameId = null; }

    window.winnerInfo = { type: null, emoji: null }; // Reset winner
    updateConfigFromControls(); // Apply latest global settings

    // Ensure advanced settings are closed
    if (!window.advancedSettingsDiv.classList.contains('hidden')) {
        window.advancedSettingsDiv.classList.add('hidden');
        window.advancedButton.textContent = 'Advanced';
        window.advancedMenuOpen = false;
        updateStatsDisplay(); // Re-apply stats visibility
    }
    window.canvas.style.display = 'block'; // Ensure canvas is visible
    if (window.exportButton) window.exportButton.classList.add('hidden'); // Hide export button

    // Reset statistics
    window.simulationStartTime = Date.now();
    window.lastUpdateTime = window.simulationStartTime;
    window.simulationTimeElapsedMs = 0;
    window.totalConversions = 0;
    window.totalConversionsPerType = { rock: 0, paper: 0, scissors: 0 };
    window.lifespanSums = { rock: 0, paper: 0, scissors: 0, all: 0 };
    window.conversionCounts = { rock: 0, paper: 0, scissors: 0, all: 0 };
    window.lastAvgSpeeds = { rock: '0.00', paper: '0.00', scissors: '0.00', all: '0.00' };
    window.stats = { rock: { kills: 0, deaths: 0 }, paper: { kills: 0, deaths: 0 }, scissors: { kills: 0, deaths: 0 } };
    window.isPaused = false; // Ensure simulation starts unpaused

    // Start timeseries data collection
    if (window.timeseriesData) {
        window.timeseriesData.startCollection(window.simulationStartTime);
    }

    resizeCanvas(); // Resize canvas BEFORE spawning entities

    // Get initial entity counts
    const numRocks = parseInt(window.rockInput.value) || 0;
    const numPapers = parseInt(window.paperInput.value) || 0;
    const numScissors = parseInt(window.scissorsInput.value) || 0;
    if (numRocks < 0 || numPapers < 0 || numScissors < 0 || (numRocks + numPapers + numScissors === 0)) {
        console.warn("Invalid entity counts. Cannot start.");
        alert("Please enter valid (non-negative) numbers for entities.");
        return;
    }

    // Create entities
    window.entities = [];
    window.entityIdCounter = 0;
    const padding = window.config.ENTITY_SIZE * 2; // Padding from canvas edges
    const spawnWidth = Math.max(0, window.canvas.width - padding);
    const spawnHeight = Math.max(0, window.canvas.height - padding);
    const offsetX = padding / 2;
    const offsetY = padding / 2;
    for (let i = 0; i < numRocks; i++) { 
        window.entities.push(new window.Entity(Math.random() * spawnWidth + offsetX, Math.random() * spawnHeight + offsetY, window.ENTITY_TYPES.ROCK)); 
    }
    for (let i = 0; i < numPapers; i++) { 
        window.entities.push(new window.Entity(Math.random() * spawnWidth + offsetX, Math.random() * spawnHeight + offsetY, window.ENTITY_TYPES.PAPER)); 
    }
    for (let i = 0; i < numScissors; i++) { 
        window.entities.push(new window.Entity(Math.random() * spawnWidth + offsetX, Math.random() * spawnHeight + offsetY, window.ENTITY_TYPES.SCISSORS)); 
    }

    if (window.config.OPTIMIZED_MODE) { updateSpatialGrid(window.entities); }

    // Update UI state: Disable most controls, enable Pause/Stats
    setControlsEnabled(false); // Disable most inputs/sliders/buttons
    if (window.toggleStatsButton) window.toggleStatsButton.disabled = false;
    if (window.pauseResumeButton) {
        window.pauseResumeButton.disabled = false;
        window.pauseResumeButton.textContent = 'Pause';
        window.pauseResumeButton.classList.remove('active');
    }
    window.startButton.classList.add('hidden');
    window.resetButton.classList.remove('hidden');
    window.resetButton.disabled = false; // Reset should be available immediately

    window.simulationRunning = true;

    // Start stats update interval
    if (window.statsUpdateIntervalId) clearInterval(window.statsUpdateIntervalId);
    window.statsUpdateIntervalId = setInterval(updateStatsDisplayOnInterval, window.STATS_UPDATE_INTERVAL);

    gameLoop(); // Start the main game loop

    // Scroll canvas into view smoothly
    setTimeout(() => { if (window.canvas) { window.canvas.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, 100);
}

/** Stops the simulation and re-enables controls. */
function stopSimulation() {
    window.simulationRunning = false;
    window.isPaused = false; // Ensure not left in paused state visually/logically
    if (window.animationFrameId) { cancelAnimationFrame(window.animationFrameId); window.animationFrameId = null; }
    if (window.statsUpdateIntervalId) { clearInterval(window.statsUpdateIntervalId); window.statsUpdateIntervalId = null; }
    
    // Stop timeseries data collection
    if (window.timeseriesData) {
        window.timeseriesData.stopCollection();
    }

    // Re-enable controls
    setControlsEnabled(true);
    if (window.pauseResumeButton) { // Explicitly disable pause button
        window.pauseResumeButton.disabled = true;
        window.pauseResumeButton.textContent = 'Pause';
        window.pauseResumeButton.classList.remove('active');
    }
    window.startButton.classList.remove('hidden');
    window.resetButton.classList.add('hidden');

    // Update stats one last time to show final values
    updateStatsDisplay();
}

/** Resets the simulation state and UI completely. */
function resetSimulation() {
    stopSimulation(); // Stops loops, clears intervals, enables controls

    // Clear game state
    window.entities = [];
    window.stats = { rock: { kills: 0, deaths: 0 }, paper: { kills: 0, deaths: 0 }, scissors: { kills: 0, deaths: 0 } };
    window.winnerInfo = { type: null, emoji: null };
    window.spatialGrid = [];

    // Reset statistics tracking state
    window.simulationStartTime = null;
    window.lastUpdateTime = 0;
    window.simulationTimeElapsedMs = 0;
    window.totalConversions = 0;
    window.totalConversionsPerType = { rock: 0, paper: 0, scissors: 0 };
    window.lifespanSums = { rock: 0, paper: 0, scissors: 0, all: 0 };
    window.conversionCounts = { rock: 0, paper: 0, scissors: 0, all: 0 };
    window.lastAvgSpeeds = { rock: '0.00', paper: '0.00', scissors: '0.00', all: '0.00' };
    
    // Reset timeseries data
    if (window.timeseriesData) {
        window.timeseriesData.reset();
    }

    // Reset UI elements
    if (window.typeSettingsEnabled) { toggleTypeSettings(false, true); } // Disable type settings if active
    if (window.exportButton) window.exportButton.classList.add('hidden');

    // Clear stats displays and apply visibility rules
    [window.entityCountsDiv, window.killDeathCountsDiv, window.simulationTimeDisplay, window.avgLifespanDisplay, window.conversionRateDisplay, window.avgSpeedDisplay].forEach(el => {
        if (el) el.textContent = '';
    });
    updateStatsDisplay(); // Clears text and applies visibility

    // Clear canvas
    window.canvas.style.display = 'block'; // Ensure visible
    if (window.canvas.width > 0 && window.canvas.height > 0) {
        window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
    }

    // Ensure advanced settings panel is hidden
    if (!window.advancedSettingsDiv.classList.contains('hidden')) {
        window.advancedSettingsDiv.classList.add('hidden');
        window.advancedButton.textContent = 'Advanced';
        window.advancedMenuOpen = false;
    }
    resizeCanvas(); // Recalculate canvas size
}

/** Toggles the pause state of the simulation. */
function togglePause() {
    if (!window.simulationRunning) return; // Should not be callable if not running
    window.isPaused = !window.isPaused;
    window.pauseResumeButton.textContent = window.isPaused ? 'Resume' : 'Pause';
    window.pauseResumeButton.classList.toggle('active', window.isPaused);

    if (!window.isPaused) {
        // When resuming, update lastUpdateTime to now to prevent calculating pause duration
        window.lastUpdateTime = Date.now();
        // Ensure game loop continues if it somehow stopped during pause (shouldn't happen with current logic)
        if (window.animationFrameId === null && window.simulationRunning) {
           window.animationFrameId = requestAnimationFrame(gameLoop);
        }
    }
    // Note: Advanced button remains disabled while paused/running
}

// Make functions available globally
window.findNearby_BruteForce = findNearby_BruteForce;
window.findNearby_Grid = findNearby_Grid;
window.resolveCollision = resolveCollision;
window.handleCollisions_BruteForce = handleCollisions_BruteForce;
window.handleCollisions_Grid = handleCollisions_Grid;
window.updateSpatialGrid = updateSpatialGrid;
window.gameLoop = gameLoop;
window.isSimulationEnd = isSimulationEnd;
window.drawWinnerMessage = drawWinnerMessage;
window.startSimulation = startSimulation;
window.stopSimulation = stopSimulation;
window.resetSimulation = resetSimulation;
window.togglePause = togglePause;
