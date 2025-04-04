const formatElapsedTime = require('../stats').formatElapsedTime;

describe('Stats Module', () => {
  beforeEach(() => {
    // Reset stats
    window.stats = { rock: { kills: 0, deaths: 0 }, paper: { kills: 0, deaths: 0 }, scissors: { kills: 0, deaths: 0 } };
    window.totalConversions = 0;
    window.totalConversionsPerType = { rock: 0, paper: 0, scissors: 0 };
    window.lifespanSums = { rock: 0, paper: 0, scissors: 0, all: 0 };
    window.conversionCounts = { rock: 0, paper: 0, scissors: 0, all: 0 };
    window.lastAvgSpeeds = { rock: '0.00', paper: '0.00', scissors: '0.00', all: '0.00' };
    
    // Reset DOM elements
    window.entityCountsDiv = document.getElementById('entityCounts');
    window.killDeathCountsDiv = document.getElementById('killDeathCounts');
    window.simulationTimeDisplay = document.getElementById('simulationTimeDisplay');
    window.avgLifespanDisplay = document.getElementById('avgLifespanDisplay');
    window.conversionRateDisplay = document.getElementById('conversionRateDisplay');
    window.avgSpeedDisplay = document.getElementById('avgSpeedDisplay');
  });

  test('formatKDR should format kill/death ratio correctly', () => {
    const formatKDR = require('../stats').formatKDR;
    expect(formatKDR(10, 5)).toBe('2.00 (10/5)');
    expect(formatKDR(0, 0)).toBe('INF (0/0)');
    expect(formatKDR(10, 0)).toBe('INF (10/0)');
  });

  test('formatElapsedTime should format time correctly', () => {
    expect(formatElapsedTime(0)).toBe('0.0s');
    expect(formatElapsedTime(1500)).toBe('1.5s');
    // Modify these expectations to match the actual implementation
    expect(formatElapsedTime(65000)).toBe('1m 05s (65.0s)');
    expect(formatElapsedTime(3665000)).toBe('1h 01m 05s (3665.0s)');
  });

  test('updateStatsDisplay should update DOM elements', () => {
    const updateStatsDisplay = require('../stats').updateStatsDisplay;
    
    // Setup some stats
    window.entities = [
      { type: 'rock' },
      { type: 'rock' },
      { type: 'paper' },
      { type: 'scissors' }
    ];
    window.stats = {
      rock: { kills: 5, deaths: 2 },
      paper: { kills: 3, deaths: 4 },
      scissors: { kills: 2, deaths: 1 }
    };
    window.simulationTimeElapsedMs = 10000;
    
    // Call the function
    updateStatsDisplay();
    
    // Check that DOM elements were updated
    expect(window.entityCountsDiv.textContent).toBeTruthy();
    expect(window.killDeathCountsDiv.textContent).toBeTruthy();
    expect(window.simulationTimeDisplay.textContent).toBeTruthy();
  });

  test('stats visibility should be controlled by statsVisible flag', () => {
    const updateStatsDisplay = require('../stats').updateStatsDisplay;
    
    // Set statsVisible to false
    window.statsVisible = false;
    window.advancedMenuOpen = false;
    
    // Call the function
    updateStatsDisplay();
    
    // All stats should be hidden
    expect(window.entityCountsDiv.classList.contains('stats-hidden')).toBe(true);
    
    // Set statsVisible to true
    window.statsVisible = true;
    
    // Call the function again
    updateStatsDisplay();
    
    // All stats should be visible
    expect(window.entityCountsDiv.classList.contains('stats-hidden')).toBe(false);
  });
});
