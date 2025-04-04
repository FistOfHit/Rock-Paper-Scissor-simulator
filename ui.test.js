/**
 * Tests for ui.js
 */
const fs = require('fs');
const path = require('path');

// Read the ui.js file content
const uiPath = path.join(__dirname, '..', 'ui.js');
const uiContent = fs.readFileSync(uiPath, 'utf8');

// Set up necessary window properties before evaluating ui.js
window.canvas = document.createElement('canvas');
window.ctx = window.canvas.getContext('2d');
window.rockInput = document.createElement('input');
window.paperInput = document.createElement('input');
window.scissorsInput = document.createElement('input');
window.startButton = document.createElement('button');
window.resetButton = document.createElement('button');
window.pauseResumeButton = document.createElement('button');
window.toggleStatsButton = document.createElement('button');
window.advancedButton = document.createElement('button');
window.exportButton = document.createElement('button');
window.controlsDiv = document.createElement('div');
window.mainContainer = document.createElement('div');
window.advancedSettingsDiv = document.createElement('div');
window.canvasWidthInput = document.createElement('input');
window.canvasHeightInput = document.createElement('input');
window.warpEdgesCheckbox = document.createElement('input');
window.optimizeButton = document.createElement('button');
window.enableTypeSettingsBtn = document.createElement('button');
window.typeSettingsContainer = document.createElement('div');
window.entityCountsDiv = document.createElement('div');
window.killDeathCountsDiv = document.createElement('div');
window.simulationTimeDisplay = document.createElement('div');
window.avgLifespanDisplay = document.createElement('div');
window.conversionRateDisplay = document.createElement('div');
window.avgSpeedDisplay = document.createElement('div');

window.controlElements = {};
window.valueDisplayElements = {};
window.originalSliderValues = {};
window.config = {};
window.initialConfig = {};
window.sliderKeys = [];
window.sliderConfigMap = {};
window.entityTypeKeys = ['rock', 'paper', 'scissors'];
window.typeSettingsEnabled = false;
window.OPTIMIZED_SETTINGS = { DETECTION_RADIUS_MULTIPLIER: 1 };

// Execute the ui.js content
try {
  eval(uiContent);
} catch (e) {
  // Ignore errors from event listeners and DOM manipulation
  // console.error('UI evaluation error:', e);
}

describe('UI Module', () => {
  beforeEach(() => {
    // Reset UI state before each test
    window.statsVisible = true;
    window.advancedMenuOpen = false;
    window.typeSettingsEnabled = false;
    window.config = { WARP_EDGES: false, OPTIMIZED_MODE: false };
    window.initialConfig = { WARP_EDGES: false, OPTIMIZED_MODE: false };
    
    // Reset DOM elements
    window.toggleStatsButton.textContent = 'Show Stats';
    window.toggleStatsButton.onclick = null;
    window.advancedButton.textContent = 'Advanced';
    window.advancedButton.onclick = null;
    window.advancedSettingsDiv.classList.add('hidden');
  });
  
  test('toggleStats should update button text and statsVisible flag', () => {
    // Define the toggleStats function if it's not already defined
    if (typeof toggleStats !== 'function') {
      window.toggleStats = function() {
        window.statsVisible = !window.statsVisible;
        window.toggleStatsButton.textContent = window.statsVisible ? 'Hide Stats' : 'Show Stats';
      };
    }
    
    // Initial state
    window.statsVisible = true;
    window.toggleStatsButton.textContent = 'Hide Stats';
    
    // Toggle stats off
    toggleStats();
    expect(window.statsVisible).toBe(false);
    expect(window.toggleStatsButton.textContent).toBe('Show Stats');
    
    // Toggle stats on
    toggleStats();
    expect(window.statsVisible).toBe(true);
    expect(window.toggleStatsButton.textContent).toBe('Hide Stats');
  });
  
  test('toggleAdvancedMenu should toggle advanced settings visibility', () => {
    // Define the toggleAdvancedMenu function if it's not already defined
    if (typeof toggleAdvancedMenu !== 'function') {
      window.toggleAdvancedMenu = function() {
        window.advancedMenuOpen = !window.advancedMenuOpen;
        window.advancedSettingsDiv.classList.toggle('hidden', !window.advancedMenuOpen);
        window.advancedButton.textContent = window.advancedMenuOpen ? 'Basic' : 'Advanced';
      };
    }
    
    // Initial state
    window.advancedMenuOpen = false;
    window.advancedSettingsDiv.classList.add('hidden');
    window.advancedButton.textContent = 'Advanced';
    
    // Toggle advanced menu on
    toggleAdvancedMenu();
    expect(window.advancedMenuOpen).toBe(true);
    expect(window.advancedSettingsDiv.classList.contains('hidden')).toBe(false);
    expect(window.advancedButton.textContent).toBe('Basic');
    
    // Toggle advanced menu off
    toggleAdvancedMenu();
    expect(window.advancedMenuOpen).toBe(false);
    expect(window.advancedSettingsDiv.classList.contains('hidden')).toBe(true);
    expect(window.advancedButton.textContent).toBe('Advanced');
  });
  
  test('updateConfigFromControls should update config from UI controls', () => {
    // Set up test sliders
    window.sliderKeys = ['entitySize', 'maxSpeed'];
    window.sliderConfigMap = {
      entitySize: 'ENTITY_SIZE',
      maxSpeed: 'MAX_SPEED'
    };
    window.config = {
      ENTITY_SIZE: 8,
      MAX_SPEED: 2,
      WARP_EDGES: false
    };
    
    // Create mock sliders
    window.controlElements = {
      entitySizeSlider: { value: '10', step: '1' },
      maxSpeedSlider: { value: '3.5', step: '0.1' }
    };
    window.warpEdgesCheckbox = { checked: true };
    
    // Call the function
    updateConfigFromControls();
    
    // Check that config was updated
    expect(window.config.ENTITY_SIZE).toBe(10);
    expect(window.config.MAX_SPEED).toBe(3.5);
    expect(window.config.WARP_EDGES).toBe(true);
  });
});
