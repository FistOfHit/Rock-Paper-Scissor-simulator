/**
 * Tests for simulation.js
 */
const fs = require('fs');
const path = require('path');

// Read the simulation.js file content
const simulationPath = path.join(__dirname, '..', 'simulation.js');
const simulationContent = fs.readFileSync(simulationPath, 'utf8');

// Set up necessary window properties before evaluating simulation.js
window.canvas = document.createElement('canvas');
window.ctx = window.canvas.getContext('2d');
window.entities = [];
window.config = {
  ENTITY_SIZE: 8,
  MAX_SPEED: 2,
  CHASE_PRIORITY: 0.5,
  CHASING_SPEED_MULTIPLIER: 1.5,
  FLEEING_SPEED_MULTIPLIER: 1.5,
  JIGGLE_FACTOR: 0.2,
  DETECTION_RADIUS_MULTIPLIER: 5,
  WARP_EDGES: true,
  OPTIMIZED_MODE: false
};
window.ENTITY_TYPES = {
  ROCK: 'rock',
  PAPER: 'paper',
  SCISSORS: 'scissors'
};
window.stats = {
  rock: { kills: 0, deaths: 0 },
  paper: { kills: 0, deaths: 0 },
  scissors: { kills: 0, deaths: 0 }
};
window.simulationRunning = false;
window.isPaused = false;
window.simulationStartTime = null;
window.lastUpdateTime = null;
window.simulationTimeElapsedMs = 0;
window.totalConversions = 0;
window.totalConversionsPerType = { rock: 0, paper: 0, scissors: 0 };
window.conversionCounts = { all: 0, rock: 0, paper: 0, scissors: 0 };
window.lifespanSums = { all: 0, rock: 0, paper: 0, scissors: 0 };
window.winnerInfo = { type: null, emoji: '' };

// Mock Entity class
window.Entity = class Entity {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = window.config.ENTITY_SIZE;
    this.vx = 0;
    this.vy = 0;
    this.birthTime = Date.now();
  }
  
  update() {}
  draw() {}
  distanceTo() { return 10; }
  isPredatorOf(other) {
    if (this.type === window.ENTITY_TYPES.ROCK) return other.type === window.ENTITY_TYPES.SCISSORS;
    if (this.type === window.ENTITY_TYPES.PAPER) return other.type === window.ENTITY_TYPES.ROCK;
    if (this.type === window.ENTITY_TYPES.SCISSORS) return other.type === window.ENTITY_TYPES.PAPER;
    return false;
  }
  isPreyFor(other) {
    return other.isPredatorOf(this);
  }
  convertTo(newType) {
    this.type = newType;
  }
  getCurrentSpeed() { return 2; }
};

// Execute the simulation.js content
try {
  eval(simulationContent);
} catch (e) {
  // Ignore errors from animation frames and timing functions
  // console.error('Simulation evaluation error:', e);
}

describe('Simulation Module', () => {
  beforeEach(() => {
    // Reset simulation state before each test
    window.entities = [];
    window.simulationRunning = false;
    window.isPaused = false;
    window.simulationStartTime = null;
    window.lastUpdateTime = null;
    window.simulationTimeElapsedMs = 0;
    window.totalConversions = 0;
    window.totalConversionsPerType = { rock: 0, paper: 0, scissors: 0 };
    window.conversionCounts = { all: 0, rock: 0, paper: 0, scissors: 0 };
    window.lifespanSums = { all: 0, rock: 0, paper: 0, scissors: 0 };
    window.winnerInfo = { type: null, emoji: '' };
    window.stats = {
      rock: { kills: 0, deaths: 0 },
      paper: { kills: 0, deaths: 0 },
      scissors: { kills: 0, deaths: 0 }
    };
    
    // Mock canvas dimensions
    window.canvas.width = 500;
    window.canvas.height = 500;
    
    // Mock Date.now for deterministic tests
    const originalNow = Date.now;
    Date.now = jest.fn().mockReturnValue(1000);
    
    // Restore original Date.now after tests
    afterAll(() => {
      Date.now = originalNow;
    });
  });
  
  test('initializeEntities should create the correct number of entities', () => {
    // Call the function with specific counts
    initializeEntities(10, 15, 20);
    
    // Check that the correct number of entities were created
    expect(window.entities.length).toBe(45);
    
    // Check that the correct number of each type was created
    const rockCount = window.entities.filter(e => e.type === window.ENTITY_TYPES.ROCK).length;
    const paperCount = window.entities.filter(e => e.type === window.ENTITY_TYPES.PAPER).length;
    const scissorsCount = window.entities.filter(e => e.type === window.ENTITY_TYPES.SCISSORS).length;
    
    expect(rockCount).toBe(10);
    expect(paperCount).toBe(15);
    expect(scissorsCount).toBe(20);
  });
  
  test('startSimulation should initialize simulation state correctly', () => {
    // Call the function
    startSimulation(5, 5, 5);
    
    // Check that simulation state was initialized correctly
    expect(window.simulationRunning).toBe(true);
    expect(window.isPaused).toBe(false);
    expect(window.simulationStartTime).toBe(1000);
    expect(window.lastUpdateTime).toBe(1000);
    expect(window.simulationTimeElapsedMs).toBe(0);
    expect(window.entities.length).toBe(15);
    expect(window.stats.rock.kills).toBe(0);
    expect(window.stats.rock.deaths).toBe(0);
  });
  
  test('pauseResumeSimulation should toggle pause state', () => {
    // Start simulation
    startSimulation(5, 5, 5);
    expect(window.isPaused).toBe(false);
    
    // Pause simulation
    pauseResumeSimulation();
    expect(window.isPaused).toBe(true);
    
    // Resume simulation
    pauseResumeSimulation();
    expect(window.isPaused).toBe(false);
  });
  
  test('resetSimulation should clear simulation state', () => {
    // Start simulation
    startSimulation(5, 5, 5);
    
    // Reset simulation
    resetSimulation();
    
    // Check that simulation state was reset
    expect(window.simulationRunning).toBe(false);
    expect(window.isPaused).toBe(false);
    expect(window.entities.length).toBe(0);
    expect(window.simulationTimeElapsedMs).toBe(0);
    expect(window.totalConversions).toBe(0);
  });
});
