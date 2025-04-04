/**
 * Tests for stats.js
 */
const fs = require('fs');
const path = require('path');

// Read the stats.js file content
const statsPath = path.join(__dirname, '..', 'stats.js');
const statsContent = fs.readFileSync(statsPath, 'utf8');

// Set up necessary window properties before evaluating stats.js
window.entities = [];
window.stats = {
  rock: { kills: 0, deaths: 0 },
  paper: { kills: 0, deaths: 0 },
  scissors: { kills: 0, deaths: 0 }
};
window.ENTITY_TYPES = {
  ROCK: 'rock',
  PAPER: 'paper',
  SCISSORS: 'scissors'
};
window.statsVisible = true;
window.simulationTimeElapsedMs = 0;
window.totalConversions = 0;
window.totalConversionsPerType = { rock: 0, paper: 0, scissors: 0 };
window.conversionCounts = { all: 0, rock: 0, paper: 0, scissors: 0 };
window.lifespanSums = { all: 0, rock: 0, paper: 0, scissors: 0 };
window.lastAvgSpeeds = { all: '0.00', rock: '0.00', paper: '0.00', scissors: '0.00' };
window.winnerInfo = { type: null, emoji: '' };
window.advancedMenuOpen = false;

// Mock DOM elements
window.entityCountsDiv = document.createElement('div');
window.killDeathCountsDiv = document.createElement('div');
window.simulationTimeDisplay = document.createElement('div');
window.avgLifespanDisplay = document.createElement('div');
window.conversionRateDisplay = document.createElement('div');
window.avgSpeedDisplay = document.createElement('div');
window.resetButton = document.createElement('button');
window.pauseResumeButton = document.createElement('button');
window.exportButton = document.createElement('button');

// Execute the stats.js content
eval(statsContent);

describe('Stats Module', () => {
  beforeEach(() => {
    // Reset stats before each test
    window.stats = {
      rock: { kills: 0, deaths: 0 },
      paper: { kills: 0, deaths: 0 },
      scissors: { kills: 0, deaths: 0 }
    };
    window.entities = [];
    window.simulationTimeElapsedMs = 0;
    window.totalConversions = 0;
    window.totalConversionsPerType = { rock: 0, paper: 0, scissors: 0 };
    window.conversionCounts = { all: 0, rock: 0, paper: 0, scissors: 0 };
    window.lifespanSums = { all: 0, rock: 0, paper: 0, scissors: 0 };
    window.lastAvgSpeeds = { all: '0.00', rock: '0.00', paper: '0.00', scissors: '0.00' };
    window.winnerInfo = { type: null, emoji: '' };
    window.statsVisible = true;
    window.advancedMenuOpen = false;
  });
  
  test('formatKDR should handle zero deaths correctly', () => {
    const kdr = formatKDR(5, 0);
    expect(kdr).toBe('INF (5/0)');
  });
  
  test('formatKDR should calculate ratio correctly', () => {
    const kdr = formatKDR(10, 5);
    expect(kdr).toBe('2.00 (10/5)');
  });
  
  test('formatElapsedTime should format time correctly', () => {
    expect(formatElapsedTime(0)).toBe('0.0s');
    expect(formatElapsedTime(1500)).toBe('1.5s');
    expect(formatElapsedTime(65000)).toBe('1:05');
    expect(formatElapsedTime(3665000)).toBe('1:01:05');
  });
  
  test('updateStatsDisplay should update DOM elements', () => {
    // Add some entities
    window.entities = [
      { type: 'rock', getCurrentSpeed: () => 2 },
      { type: 'rock', getCurrentSpeed: () => 3 },
      { type: 'paper', getCurrentSpeed: () => 1.5 }
    ];
    
    // Set some stats
    window.stats.rock.kills = 5;
    window.stats.rock.deaths = 2;
    window.simulationTimeElapsedMs = 10000;
    
    // Call the function
    updateStatsDisplay();
    
    // Check that DOM elements were updated
    expect(window.entityCountsDiv.textContent).toContain('⛰️ 2');
    expect(window.entityCountsDiv.textContent).toContain('📄 1');
    expect(window.killDeathCountsDiv.textContent).toContain('2.50 (5/2)');
  });
  
  test('stats visibility should be controlled by statsVisible flag', () => {
    // Set up entities and stats
    window.entities = [{ type: 'rock', getCurrentSpeed: () => 2 }];
    
    // Test with stats visible
    window.statsVisible = true;
    window.advancedMenuOpen = false;
    updateStatsDisplay();
    expect(window.avgLifespanDisplay.classList.contains('stats-hidden')).toBe(false);
    
    // Test with stats hidden
    window.statsVisible = false;
    updateStatsDisplay();
    expect(window.avgLifespanDisplay.classList.contains('stats-hidden')).toBe(true);
    
    // Entity counts should always be visible
    expect(window.entityCountsDiv.classList.contains('stats-hidden')).toBe(false);
  });
});
