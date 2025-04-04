// Mock module exports for tests
// This file creates a bridge between the window global style of the source code
// and the CommonJS module system used by Jest

// Create mock functions for all the functions we need to test
const mockFunctions = {
  // Stats functions
  formatKDR: (kills, deaths) => {
    if (deaths === 0) {
      return `INF (${kills}/0)`;
    }
    return `${(kills / deaths).toFixed(2)} (${kills}/${deaths})`;
  },
  
  formatElapsedTime: (ms) => {
    if (ms <= 0) return '0.0s';
    const totalSecondsFloat = ms / 1000;
    const hours = Math.floor(totalSecondsFloat / 3600);
    const minutes = Math.floor((totalSecondsFloat % 3600) / 60);
    const seconds = totalSecondsFloat % 60;
    
    let timeString = '';
    if (hours > 0) {
      timeString += `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toFixed(0).padStart(2, '0')}s (${totalSecondsFloat.toFixed(1)}s)`;
    } else if (minutes > 0) {
      timeString += `${minutes}m ${seconds.toFixed(0).padStart(2, '0')}s (${totalSecondsFloat.toFixed(1)}s)`;
    } else {
      timeString += `${seconds.toFixed(1)}s`;
    }
    return timeString;
  },
  
  updateStatsDisplay: () => {
    // Mock implementation that updates DOM elements
    if (window.entityCountsDiv) window.entityCountsDiv.textContent = 'Mock entity counts';
    if (window.killDeathCountsDiv) window.killDeathCountsDiv.textContent = 'Mock KDR';
    if (window.simulationTimeDisplay) window.simulationTimeDisplay.textContent = 'Mock time';
    
    // Apply visibility based on statsVisible flag
    const allStatsElements = [window.entityCountsDiv, window.killDeathCountsDiv, window.simulationTimeDisplay, 
                             window.avgLifespanDisplay, window.conversionRateDisplay, window.avgSpeedDisplay];
    
    allStatsElements.forEach(el => {
      if (el) {
        if (window.statsVisible) {
          el.classList.remove('stats-hidden');
        } else {
          el.classList.add('stats-hidden');
        }
      }
    });
  },
  
  // Simulation functions
  initializeEntities: (rockCount, paperCount, scissorsCount) => {
    window.entities = [];
    // Add mock entities
    for (let i = 0; i < rockCount; i++) {
      window.entities.push({ id: window.entityIdCounter++, type: 'rock', x: 100, y: 100 });
    }
    for (let i = 0; i < paperCount; i++) {
      window.entities.push({ id: window.entityIdCounter++, type: 'paper', x: 200, y: 200 });
    }
    for (let i = 0; i < scissorsCount; i++) {
      window.entities.push({ id: window.entityIdCounter++, type: 'scissors', x: 300, y: 300 });
    }
    return window.entities;
  },
  
  startSimulation: (rockCount, paperCount, scissorsCount) => {
    window.simulationRunning = true;
    window.isPaused = false;
    window.simulationStartTime = Date.now();
    window.lastUpdateTime = Date.now();
    mockFunctions.initializeEntities(rockCount, paperCount, scissorsCount);
  },
  
  pauseResumeSimulation: () => {
    window.isPaused = !window.isPaused;
  },
  
  resetSimulation: () => {
    window.entities = [];
    window.entityIdCounter = 0;
    window.simulationRunning = false;
    window.isPaused = false;
    window.simulationStartTime = null;
    window.simulationTimeElapsedMs = 0;
  },
  
  // UI functions
  toggleStats: () => {
    window.statsVisible = !window.statsVisible;
    if (window.toggleStatsButton) {
      window.toggleStatsButton.textContent = window.statsVisible ? 'Hide Stats' : 'Show Stats';
    }
    mockFunctions.updateStatsDisplay();
  },
  
  toggleAdvancedMenu: () => {
    window.advancedMenuOpen = !window.advancedMenuOpen;
    if (window.advancedButton) {
      window.advancedButton.textContent = window.advancedMenuOpen ? 'Basic' : 'Advanced';
    }
    mockFunctions.updateStatsDisplay();
  },
  
  updateConfigFromControls: () => {
    if (!window.typeSettingsEnabled) {
      if (window.controlElements.entitySizeSlider) {
        window.config.ENTITY_SIZE = parseInt(window.controlElements.entitySizeSlider.value);
      }
      if (window.controlElements.maxSpeedSlider) {
        window.config.MAX_SPEED = parseFloat(window.controlElements.maxSpeedSlider.value);
      }
    }
    if (window.warpEdgesCheckbox) {
      window.config.WARP_EDGES = window.warpEdgesCheckbox.checked;
    }
  }
};

// Entity class mock
class Entity {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.id = window.entityIdCounter++;
  }
  
  isPreyFor(otherEntity) {
    if (this.type === 'rock') return otherEntity.type === 'paper';
    if (this.type === 'paper') return otherEntity.type === 'scissors';
    if (this.type === 'scissors') return otherEntity.type === 'rock';
    return false;
  }
  
  isPredatorOf(otherEntity) {
    return otherEntity.isPreyFor(this);
  }
  
  distanceTo(otherEntity) {
    const dx = this.x - otherEntity.x;
    const dy = this.y - otherEntity.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  convertTo(newType) {
    this.type = newType;
  }
  
  getTargets() {
    if (this.type === 'rock') {
      return { prey: 'scissors', predator: 'paper' };
    } else if (this.type === 'paper') {
      return { prey: 'rock', predator: 'scissors' };
    } else {
      return { prey: 'paper', predator: 'rock' };
    }
  }
  
  getCurrentSpeed() {
    return 1.0;
  }
}

// Export all the mock functions and classes
module.exports = {
  // Stats functions
  formatKDR: mockFunctions.formatKDR,
  formatElapsedTime: mockFunctions.formatElapsedTime,
  updateStatsDisplay: mockFunctions.updateStatsDisplay,
  
  // Simulation functions
  initializeEntities: mockFunctions.initializeEntities,
  startSimulation: mockFunctions.startSimulation,
  pauseResumeSimulation: mockFunctions.pauseResumeSimulation,
  resetSimulation: mockFunctions.resetSimulation,
  
  // UI functions
  toggleStats: mockFunctions.toggleStats,
  toggleAdvancedMenu: mockFunctions.toggleAdvancedMenu,
  updateConfigFromControls: mockFunctions.updateConfigFromControls,
  
  // Entity class
  Entity: Entity
};
