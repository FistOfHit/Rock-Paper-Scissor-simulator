/**
 * UI handling and event listeners for the Rock-Paper-Scissors simulator
 */

// --- DOM Element References ---
window.canvas = null;
window.ctx = null;
window.rockInput = null;
window.paperInput = null;
window.scissorsInput = null;
window.startButton = null;
window.resetButton = null;
window.pauseResumeButton = null;
window.toggleStatsButton = null;
window.advancedButton = null;
window.exportButton = null;
window.controlsDiv = null;
window.mainContainer = null;
window.advancedSettingsDiv = null;
window.canvasWidthInput = null;
window.canvasHeightInput = null;
window.warpEdgesCheckbox = null;
window.optimizeButton = null;
window.enableTypeSettingsBtn = null;
window.typeSettingsContainer = null;
window.entityCountsDiv = null;
window.killDeathCountsDiv = null;
window.simulationTimeDisplay = null;
window.avgLifespanDisplay = null;
window.conversionRateDisplay = null;
window.avgSpeedDisplay = null;

// Storage for control elements and value displays
window.controlElements = {};
window.valueDisplayElements = {};
window.originalSliderValues = {};

// --- UI Control Handling & Updates ---

/** Reads values from global sliders/checkboxes and updates the main config object. */
function updateConfigFromControls() {
    // Only update global config if type-specific settings are NOT enabled
    if (!window.typeSettingsEnabled) {
        window.sliderKeys.forEach(key => {
            const configKey = window.sliderConfigMap[key];
            const slider = window.controlElements[`${key}Slider`];
            if (slider && window.config.hasOwnProperty(configKey)) {
                // Don't update detection radius if optimized mode is on (it's overridden)
                if (!(key === 'detectionRadius' && window.config.OPTIMIZED_MODE)) {
                     const step = parseFloat(slider.step);
                     window.config[configKey] = (step < 1) ? parseFloat(slider.value) : parseInt(slider.value);
                }
            }
        });
    }
    // Always update non-slider global configs
    if (window.warpEdgesCheckbox) window.config.WARP_EDGES = window.warpEdgesCheckbox.checked;
    // OPTIMIZED_MODE is updated directly in its event listener
}

/** Sets the initial values of all control elements based on initialConfig. */
function initializeControls() {
    // Initialize global sliders/checkboxes
    window.sliderKeys.forEach(key => {
        const slider = window.controlElements[`${key}Slider`];
        const configKey = window.sliderConfigMap[key];
        if (slider && window.initialConfig.hasOwnProperty(configKey)) {
            slider.value = window.initialConfig[configKey];
            updateSliderDisplay(slider);
        }
    });
    if (window.warpEdgesCheckbox) window.warpEdgesCheckbox.checked = window.initialConfig.WARP_EDGES;
    if (window.optimizeButton) window.optimizeButton.classList.toggle('active', window.initialConfig.OPTIMIZED_MODE);

    // Initialize type-specific sliders to match global defaults initially
    window.entityTypeKeys.forEach(type => {
        window.sliderKeys.forEach(key => {
            const globalSlider = window.controlElements[`${key}Slider`];
            const typeSlider = window.controlElements[`${key}Slider_${type}`];
            if (globalSlider && typeSlider) {
                typeSlider.value = globalSlider.value;
                updateSliderDisplay(typeSlider);
                typeSlider.disabled = true; // Start disabled
            }
        });
    });

    // Apply initial optimization state (disables detection radius if needed)
    applyOptimizationSettings(window.config.OPTIMIZED_MODE, true); // True because simulation isn't running
}

/** Resets sliders in a given scope ('global' or specific type) to their default values. */
function resetSlidersToDefaults(scope) {
    let keysToReset = window.sliderKeys;
    let typeSuffix = '';

    if (scope === 'global') {
        // Reset global sliders
    } else if (window.entityTypeKeys.includes(scope)) {
        // Reset sliders for a specific type
        typeSuffix = `_${scope}`;
    } else {
        return; // Invalid scope
    }

    keysToReset.forEach(key => {
        // Skip resetting detection radius if scope is global and optimized mode is on
        if (scope === 'global' && key === 'detectionRadius' && window.config.OPTIMIZED_MODE) {
            return;
        }

        const controlElement = window.controlElements[`${key}Slider${typeSuffix}`];
        const configKey = window.sliderConfigMap[key];

        if (controlElement && controlElement.type === 'range' && window.initialConfig.hasOwnProperty(configKey)) {
            controlElement.value = window.initialConfig[configKey];
            updateSliderDisplay(controlElement);
            // Trigger input event for consistency if needed by other logic, though not strictly necessary here
            // controlElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });

    // If global scope was reset, update the main config object
    if (scope === 'global') {
        updateConfigFromControls();
    }
}

/** Applies UI changes and config updates based on optimized mode state. */
function applyOptimizationSettings(isOptimized, enableMasterControls) {
    const globalDetectionSlider = window.controlElements['detectionRadiusSlider'];
    const globalDetectionValue = window.valueDisplayElements['detectionRadiusValue'];

    if (isOptimized) {
        // Store original value if not already stored (only first time enabling)
        if (globalDetectionSlider && window.originalSliderValues.detectionRadius === undefined) {
            window.originalSliderValues.detectionRadius = globalDetectionSlider.value;
        }
        // Disable global detection slider and clear its value display
        if (globalDetectionSlider) globalDetectionSlider.disabled = true;
        if (globalDetectionValue) globalDetectionValue.textContent = ''; // Indicate it's inactive
         // Set config value (though entity update will override)
        window.config.DETECTION_RADIUS_MULTIPLIER = window.OPTIMIZED_SETTINGS.DETECTION_RADIUS_MULTIPLIER;

    } else {
        // Restore original value if it was stored
        if (globalDetectionSlider && window.originalSliderValues.detectionRadius !== undefined) {
            let restoredValue = parseInt(window.originalSliderValues.detectionRadius);
            window.config.DETECTION_RADIUS_MULTIPLIER = restoredValue; // Update config
            globalDetectionSlider.value = restoredValue;
            updateSliderDisplay(globalDetectionSlider); // Update display
        }
        window.originalSliderValues = {}; // Clear stored value
        // Re-enable global detection slider if master controls allow and type settings off
        if (globalDetectionSlider) {
            globalDetectionSlider.disabled = !(enableMasterControls && !window.typeSettingsEnabled);
        }
    }

    // Update Optimize button appearance
    if (window.optimizeButton) {
        window.optimizeButton.disabled = !enableMasterControls;
        window.optimizeButton.textContent = isOptimized ? 'Disable Perf Mode' : 'Enable Perf Mode';
        window.optimizeButton.classList.toggle('active', isOptimized);
    }

    // Update type-specific detection sliders
    window.entityTypeKeys.forEach(type => {
        const typeControl = window.controlElements[`detectionRadiusSlider_${type}`];
        const typeValueSpan = window.valueDisplayElements[`detectionRadiusValue_${type}`];
        if (typeControl) {
            typeControl.disabled = isOptimized || !window.typeSettingsEnabled || !enableMasterControls;
            if (isOptimized && typeValueSpan) {
                typeValueSpan.textContent = ''; // Clear value display when optimized
            } else if (!isOptimized && window.typeSettingsEnabled && enableMasterControls && typeValueSpan) {
                updateSliderDisplay(typeControl); // Restore display if needed
            }
        }
    });
}

/** Enables or disables type-specific settings UI and behavior. */
function toggleTypeSettings(forceState = null, enableMasterControls = false) {
    const newState = (forceState !== null) ? forceState : !window.typeSettingsEnabled;
    window.typeSettingsEnabled = newState;

    if (window.enableTypeSettingsBtn) {
        window.enableTypeSettingsBtn.textContent = window.typeSettingsEnabled ? 'Disable Type-Specific Settings' : 'Enable Type-Specific Settings';
        window.enableTypeSettingsBtn.classList.toggle('active', window.typeSettingsEnabled);
    }
    if (window.typeSettingsContainer) {
        window.typeSettingsContainer.classList.toggle('hidden', !window.typeSettingsEnabled);
    }

    // Enable/disable global vs type-specific controls
    document.querySelectorAll('.global-setting').forEach(el => el.classList.toggle('global-setting-disabled', window.typeSettingsEnabled));

    // Global controls (sliders, checkboxes, optimize button)
    window.sliderKeys.forEach(key => {
         const control = window.controlElements[`${key}Slider`];
         if (control) control.disabled = window.typeSettingsEnabled || !enableMasterControls || (key === 'detectionRadius' && window.config.OPTIMIZED_MODE);
    });
    if(window.warpEdgesCheckbox) window.warpEdgesCheckbox.disabled = window.typeSettingsEnabled || !enableMasterControls;
    if(window.optimizeButton) window.optimizeButton.disabled = window.typeSettingsEnabled || !enableMasterControls;
    if(window.canvasWidthInput) window.canvasWidthInput.disabled = window.typeSettingsEnabled || !enableMasterControls;
    if(window.canvasHeightInput) window.canvasHeightInput.disabled = window.typeSettingsEnabled || !enableMasterControls;


    // Type-specific controls
    window.entityTypeKeys.forEach(type => {
        window.sliderKeys.forEach(key => {
            const typeControl = window.controlElements[`${key}Slider_${type}`];
            if (typeControl) {
                // If just enabling type settings, copy current global value to type-specific
                if (window.typeSettingsEnabled && forceState !== false) { // Check forceState to avoid copying on disable
                     const globalControl = window.controlElements[`${key}Slider`];
                     if(globalControl) {
                         typeControl.value = globalControl.value;
                         updateSliderDisplay(typeControl);
                     }
                }
                const isDetection = key === 'detectionRadius';
                typeControl.disabled = !window.typeSettingsEnabled || !enableMasterControls || (isDetection && window.config.OPTIMIZED_MODE);
                // Ensure display is correct after enabling/disabling
                 updateSliderDisplay(typeControl);
                 // Clear detection radius display if optimized
                 if(isDetection && window.config.OPTIMIZED_MODE && window.valueDisplayElements[`${key}Value_${type}`]) {
                     window.valueDisplayElements[`${key}Value_${type}`].textContent = '';
                 }
            }
        });
         // Enable/disable reset buttons for types
         const resetButton = document.getElementById(`reset${type.charAt(0).toUpperCase() + type.slice(1)}DefaultsButton`);
         if(resetButton) resetButton.disabled = !window.typeSettingsEnabled || !enableMasterControls;
    });

     // Enable/disable global reset button
     const globalResetButton = document.getElementById('resetGlobalDefaultsButton');
     if(globalResetButton) globalResetButton.disabled = window.typeSettingsEnabled || !enableMasterControls;


    // If disabling type settings, update the main config from the (now active) global controls
    if (!window.typeSettingsEnabled) {
        updateConfigFromControls();
        // Re-apply optimization settings to correctly enable/disable global detection slider
        applyOptimizationSettings(window.config.OPTIMIZED_MODE, enableMasterControls);
    } else {
         // Ensure global detection slider is disabled when type settings are on
         if(window.controlElements['detectionRadiusSlider']) window.controlElements['detectionRadiusSlider'].disabled = true;
    }
}

/** Enables or disables most interactive controls based on simulation state. */
function setControlsEnabled(enabled) {
    // Initial count inputs
    window.rockInput.disabled = !enabled;
    window.paperInput.disabled = !enabled;
    window.scissorsInput.disabled = !enabled;
    // Advanced panel controls
    window.advancedButton.disabled = !enabled;
    window.enableTypeSettingsBtn.disabled = !enabled;
    if(window.canvasWidthInput) window.canvasWidthInput.disabled = window.typeSettingsEnabled || !enabled; // Respect typeSettingsEnabled state
    if(window.canvasHeightInput) window.canvasHeightInput.disabled = window.typeSettingsEnabled || !enabled;
     // Global sliders/checkboxes/buttons within advanced panel
     window.sliderKeys.forEach(key => {
         const control = window.controlElements[`${key}Slider`];
         // Enable only if master 'enabled' is true AND type settings are off
         if (control) control.disabled = !enabled || window.typeSettingsEnabled || (key === 'detectionRadius' && window.config.OPTIMIZED_MODE);
     });
     if(window.warpEdgesCheckbox) window.warpEdgesCheckbox.disabled = !enabled || window.typeSettingsEnabled;
     if(window.optimizeButton) window.optimizeButton.disabled = !enabled || window.typeSettingsEnabled;
     const globalResetButton = document.getElementById('resetGlobalDefaultsButton');
     if(globalResetButton) globalResetButton.disabled = !enabled || window.typeSettingsEnabled;

     // Type-specific sliders and reset buttons
     window.entityTypeKeys.forEach(type => {
         window.sliderKeys.forEach(key => {
             const typeControl = window.controlElements[`${key}Slider_${type}`];
             // Enable only if master 'enabled' is true AND type settings are on
             if (typeControl) {
                 const isDetection = key === 'detectionRadius';
                 typeControl.disabled = !enabled || !window.typeSettingsEnabled || (isDetection && window.config.OPTIMIZED_MODE);
             }
         });
         const resetButton = document.getElementById(`reset${type.charAt(0).toUpperCase() + type.slice(1)}DefaultsButton`);
         if(resetButton) resetButton.disabled = !enabled || !window.typeSettingsEnabled;
     });

    // Special cases: Start/Reset buttons are handled separately
    window.startButton.disabled = !enabled;
    window.resetButton.disabled = enabled; // Reset is only enabled when simulation is running/ended
}

/** Updates the displayed value for a slider. */
function updateSliderDisplay(sliderElement) {
    if (!sliderElement) return;
    
    // Extract base key and type suffix from slider ID
    let baseKey = sliderElement.id.replace('Slider', '');
    let typeSuffix = '';
    
    const typeMatch = baseKey.match(/_(rock|paper|scissors)$/);
    if (typeMatch) {
        typeSuffix = typeMatch[0];
        baseKey = baseKey.replace(typeSuffix, '');
    }
    const valueElementId = `${baseKey}Value${typeSuffix}`;
    const valueElement = window.valueDisplayElements[valueElementId]; // Use stored reference
    if (valueElement) {
        valueElement.textContent = formatValue(baseKey, sliderElement.value);
    }
}

/** Formats a slider value for display based on the slider type. */
function formatValue(key, value) {
    switch (key) {
        case 'entitySize':
        case 'detectionRadius':
            return parseInt(value).toString();
        case 'maxSpeed':
        case 'chasingSpeedMultiplier':
        case 'fleeingSpeedMultiplier':
        case 'separationDistance':
        case 'separationStrength':
        case 'predationRadius':
            return parseFloat(value).toFixed(1);
        case 'chasePriority':
        case 'jiggle':
            return parseFloat(value).toFixed(2);
        default:
            return value;
    }
}

/** Resizes the canvas based on available space or user input. */
function resizeCanvas() {
    if (!window.canvasWidthInput || !window.canvasHeightInput || !window.controlsDiv || !window.mainContainer || !window.entityCountsDiv || !window.canvas || !window.advancedSettingsDiv) {
        console.warn("ResizeCanvas elements missing."); return;
    }
    let targetWidth = parseInt(window.canvasWidthInput.value) || 0;
    let targetHeight = parseInt(window.canvasHeightInput.value) || 0;
    let useDefaultSquare = !(targetWidth > 0 && targetHeight > 0);
    let finalWidth, finalHeight;

    if (useDefaultSquare) {
        // Calculate available space for default square canvas
        const controlsHeight = window.controlsDiv.offsetHeight;
        const titleElement = window.mainContainer.querySelector('h1');
        const titleHeight = titleElement ? titleElement.offsetHeight : 30;
        const verticalPadding = 2 * 10; // Padding top/bottom of main-container
        const exportButtonHeight = (window.exportButton && !window.exportButton.classList.contains('hidden')) ? window.exportButton.offsetHeight + 4 : 0;
        const countsHeight = (window.entityCountsDiv && !window.entityCountsDiv.classList.contains('stats-hidden')) ? window.entityCountsDiv.scrollHeight + 4 : 0;
        const extraVerticalGap = 2 * 10; // Gaps between elements

        const availableHeightForCanvas = window.innerHeight - controlsHeight - titleHeight - countsHeight - exportButtonHeight - verticalPadding - extraVerticalGap;
        const availableWidthForCanvas = window.mainContainer.clientWidth; // Width within the container
        const sideLength = Math.max(100, Math.floor(Math.min(availableWidthForCanvas, availableHeightForCanvas)));

        finalWidth = sideLength; finalHeight = sideLength;
        // Update placeholders if they were blank
        if (!window.canvasWidthInput.value) window.canvasWidthInput.placeholder = finalWidth;
        if (!window.canvasHeightInput.value) window.canvasHeightInput.placeholder = finalHeight;
    } else {
        // Use user-defined dimensions
        finalWidth = Math.max(100, targetWidth);
        finalHeight = Math.max(100, targetHeight);
    }

    window.canvas.width = finalWidth;
    window.canvas.height = finalHeight;

    // Show/hide canvas based on advanced settings visibility
    window.canvas.style.display = window.advancedSettingsDiv.classList.contains('hidden') ? 'block' : 'none';

    // Redraw canvas content if simulation is not running (static state)
    if (!window.simulationRunning) {
        window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
        if (window.entities.length > 0) {
            window.entities.forEach(entity => entity.draw(window.ctx));
        }
        if (window.winnerInfo.type !== null) {
            drawWinnerMessage(window.ctx, window.winnerInfo);
        }
    }

    // Update spatial grid if using optimized mode and running
    if (window.config.OPTIMIZED_MODE && window.simulationRunning) {
        updateSpatialGrid(window.entities);
    }
}

// --- Tooltip Handling ---
function setupTooltips() {
    let currentTooltip = null;
    window.advancedSettingsDiv.addEventListener('mouseover', (event) => {
        const targetElement = event.target.closest('label[data-tooltip-target], button[data-tooltip-target]');
        if (targetElement) {
            const tooltipId = targetElement.dataset.tooltipTarget;
            const tooltip = document.getElementById(tooltipId);
            if (tooltip) {
                if (currentTooltip && currentTooltip !== tooltip) {
                    currentTooltip.classList.remove('visible'); // Hide previous tooltip
                }
                // Position tooltip relative to mouse pointer
                const offsetX = 15; const offsetY = 10;
                tooltip.style.left = `${event.clientX + offsetX}px`;
                tooltip.style.top = `${event.clientY + offsetY}px`;
                tooltip.style.bottom = 'auto'; // Reset bottom positioning
                tooltip.style.transform = 'none'; // Reset transform
                tooltip.classList.add('visible');
                currentTooltip = tooltip;

                // Adjust position if tooltip goes off-screen
                const tooltipRect = tooltip.getBoundingClientRect();
                if (tooltipRect.bottom > window.innerHeight) {
                    tooltip.style.top = 'auto';
                    tooltip.style.bottom = `${window.innerHeight - event.clientY + offsetY}px`;
                }
                if (tooltipRect.right > window.innerWidth) {
                    tooltip.style.left = `${event.clientX - tooltipRect.width - offsetX}px`; // Move to left of cursor
                }
            }
        }
    });
    // Hide tooltip on mouseout from the trigger element
    window.advancedSettingsDiv.addEventListener('mouseout', (event) => {
        const targetElement = event.target.closest('label[data-tooltip-target], button[data-tooltip-target]');
        if (targetElement && currentTooltip && currentTooltip.id === targetElement.dataset.tooltipTarget) {
            currentTooltip.classList.remove('visible');
            currentTooltip = null;
        }
    });
    // Hide tooltip if mouse leaves the entire advanced settings area
    window.advancedSettingsDiv.addEventListener('mouseleave', () => {
        if (currentTooltip) {
            currentTooltip.classList.remove('visible');
            currentTooltip = null;
        }
    });
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Main action buttons
    window.startButton.addEventListener('click', startSimulation);
    window.resetButton.addEventListener('click', resetSimulation);
    window.pauseResumeButton?.addEventListener('click', togglePause);
    window.toggleStatsButton?.addEventListener('click', () => {
        window.statsVisible = !window.statsVisible;
        window.toggleStatsButton.textContent = window.statsVisible ? 'Hide Stats' : 'Show Stats';
        window.toggleStatsButton.classList.toggle('active', window.statsVisible); // 'active' means shown
        updateStatsDisplay(); // Update visibility of stats lines
    });
    
    // Connect export button to export functionality
    window.exportButton?.addEventListener('click', handleExportButtonClick);

    // Advanced Settings panel toggle
    window.advancedButton.addEventListener('click', () => {
        const isHidden = window.advancedSettingsDiv.classList.toggle('hidden');
        window.advancedMenuOpen = !isHidden;
        window.advancedButton.textContent = isHidden ? 'Advanced' : 'Hide Adv.';
        // Disable/enable stats toggle button based on panel visibility
        if (window.toggleStatsButton) window.toggleStatsButton.disabled = window.advancedMenuOpen;
        // Pause button should be disabled if advanced menu is open OR simulation not running
        if (window.pauseResumeButton) window.pauseResumeButton.disabled = window.advancedMenuOpen || !window.simulationRunning;
        updateStatsDisplay(); // Update stats visibility
        resizeCanvas(); // Adjust canvas size/visibility
    });

    // Advanced Settings controls
    window.enableTypeSettingsBtn?.addEventListener('click', () => toggleTypeSettings(null, !window.simulationRunning)); // Pass current control enable state
    window.optimizeButton?.addEventListener('click', () => {
        window.config.OPTIMIZED_MODE = !window.config.OPTIMIZED_MODE;
        applyOptimizationSettings(window.config.OPTIMIZED_MODE, !window.simulationRunning); // Pass current control enable state
        if (window.config.OPTIMIZED_MODE && window.simulationRunning) {
            updateSpatialGrid(window.entities); // Rebuild grid immediately if enabling mid-simulation
        }
    });
    window.canvasWidthInput?.addEventListener('input', resizeCanvas);
    window.canvasHeightInput?.addEventListener('input', resizeCanvas);
    window.canvasWidthInput?.addEventListener('change', resizeCanvas); // Handle pasting/manual entry commit
    window.canvasHeightInput?.addEventListener('change', resizeCanvas);
    window.warpEdgesCheckbox?.addEventListener('change', e => { window.config.WARP_EDGES = e.target.checked; });

    // Slider input listeners (update display and config if global)
    window.advancedSettingsDiv.querySelectorAll('input[type="range"]').forEach(slider => {
        slider.addEventListener('input', (event) => {
            const currentSlider = event.target;
            updateSliderDisplay(currentSlider); // Update the associated value display

            // If it's a global slider and type settings are off, update the main config
            const isTypeSpecific = currentSlider.id.match(/_(rock|paper|scissors)$/);
            if (!window.typeSettingsEnabled && !isTypeSpecific) {
                updateConfigFromControls(); // Update the relevant part of the config object
            }
        });
    });

    // Reset default buttons
    const resetGlobalBtn = document.getElementById('resetGlobalDefaultsButton');
    if (resetGlobalBtn) resetGlobalBtn.addEventListener('click', () => resetSlidersToDefaults('global'));
    window.entityTypeKeys.forEach(type => {
        const btnId = `reset${type.charAt(0).toUpperCase() + type.slice(1)}DefaultsButton`;
        const btn = document.getElementById(btnId);
        if (btn) btn.addEventListener('click', () => resetSlidersToDefaults(type));
    });

    // Window resize listener (debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 100); // Debounce resize events
    });
}

// --- Initial Page Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Get essential elements
    window.canvas = document.getElementById('simulationCanvas');
    if (!window.canvas || !window.canvas.getContext) { alert("Canvas not supported or not found!"); return; }
    window.ctx = window.canvas.getContext('2d');

    // Get references to all interactive elements and display areas
    // Main Controls
    window.rockInput = document.getElementById('rocks');
    window.paperInput = document.getElementById('papers');
    window.scissorsInput = document.getElementById('scissors');
    window.startButton = document.getElementById('startButton');
    window.resetButton = document.getElementById('resetButton');
    window.pauseResumeButton = document.getElementById('pauseResumeButton');
    window.toggleStatsButton = document.getElementById('toggleStatsButton');
    window.advancedButton = document.getElementById('advancedButton');
    window.exportButton = document.getElementById('exportButton');
    window.controlsDiv = document.getElementById('controls');
    window.mainContainer = document.querySelector('.main-container');

    // Advanced Settings
    window.advancedSettingsDiv = document.getElementById('advancedSettings');
    window.canvasWidthInput = document.getElementById('canvasWidth');
    window.canvasHeightInput = document.getElementById('canvasHeight');
    window.warpEdgesCheckbox = document.getElementById('warpEdgesCheckbox');
    window.optimizeButton = document.getElementById('optimizeButton');
    window.enableTypeSettingsBtn = document.getElementById('enableTypeSettingsBtn');
    window.typeSettingsContainer = document.getElementById('typeSettingsContainer');

    // Stats Display
    window.entityCountsDiv = document.getElementById('entityCounts');
    window.killDeathCountsDiv = document.getElementById('killDeathCounts');
    window.simulationTimeDisplay = document.getElementById('simulationTimeDisplay');
    window.avgLifespanDisplay = document.getElementById('avgLifespanDisplay');
    window.conversionRateDisplay = document.getElementById('conversionRateDisplay');
    window.avgSpeedDisplay = document.getElementById('avgSpeedDisplay');

    // Populate control/value element storage for easy access
    // Global Sliders & Values
    window.sliderKeys.forEach(key => {
        const sliderId = `${key}Slider`;
        const valueId = `${key}Value`;
        const sliderEl = document.getElementById(sliderId);
        const valueEl = document.getElementById(valueId);
        if (sliderEl) window.controlElements[sliderId] = sliderEl;
        if (valueEl) window.valueDisplayElements[valueId] = valueEl;
    });
    // Type-Specific Sliders & Values
    window.entityTypeKeys.forEach(type => {
        window.sliderKeys.forEach(key => {
            const sliderId = `${key}Slider_${type}`;
            const valueId = `${key}Value_${type}`;
            const sliderEl = document.getElementById(sliderId);
            const valueEl = document.getElementById(valueId);
            if (sliderEl) window.controlElements[sliderId] = sliderEl;
            if (valueEl) window.valueDisplayElements[valueId] = valueEl;
        });
    });


    // Initial UI State Setup
    window.resetButton.classList.add('hidden');
    window.advancedSettingsDiv.classList.add('hidden');
    window.canvas.style.display = 'block';
    if (window.exportButton) window.exportButton.classList.add('hidden');
    if (window.pauseResumeButton) window.pauseResumeButton.disabled = true;
    if (window.toggleStatsButton) {
         window.toggleStatsButton.textContent = window.statsVisible ? 'Hide Stats' : 'Show Stats';
         window.toggleStatsButton.classList.toggle('active', window.statsVisible);
    }
    updateStatsDisplay(); // Apply initial stats visibility and clear text

    // Final Setup Steps
    initializeControls(); // Set initial slider values etc.
    setupEventListeners(); // Attach event listeners
    setupTooltips(); // Initialize tooltips
    resizeCanvas(); // Initial canvas size calculation
});

// Make functions available globally
window.updateConfigFromControls = updateConfigFromControls;
window.initializeControls = initializeControls;
window.resetSlidersToDefaults = resetSlidersToDefaults;
window.applyOptimizationSettings = applyOptimizationSettings;
window.toggleTypeSettings = toggleTypeSettings;
window.setControlsEnabled = setControlsEnabled;
window.updateSliderDisplay = updateSliderDisplay;
window.formatValue = formatValue;
window.resizeCanvas = resizeCanvas;
window.setupTooltips = setupTooltips;
window.setupEventListeners = setupEventListeners;
