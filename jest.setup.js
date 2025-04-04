// Jest setup file
const mockLocalStorage = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

// Mock DOM elements and browser APIs
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock canvas and context
const mockCanvas = {
  getContext: jest.fn().mockReturnValue({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    font: '',
    fillText: jest.fn(),
    measureText: jest.fn().mockReturnValue({ width: 10 })
  }),
  width: 800,
  height: 600,
  style: {}
};

// Mock DOM elements
document.getElementById = jest.fn().mockImplementation((id) => {
  if (id === 'simulationCanvas') return mockCanvas;
  
  // Create mock elements for UI controls
  const element = {
    textContent: '',
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn().mockReturnValue(false)
    },
    style: {},
    disabled: false,
    checked: false,
    value: '0',
    step: '1',
    addEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    onclick: null
  };
  
  // Store references to commonly used elements
  if (id === 'toggleStatsButton') window.toggleStatsButton = element;
  if (id === 'advancedButton') window.advancedButton = element;
  if (id === 'entityCounts') window.entityCountsDiv = element;
  if (id === 'killDeathCounts') window.killDeathCountsDiv = element;
  if (id === 'simulationTimeDisplay') window.simulationTimeDisplay = element;
  if (id === 'avgLifespanDisplay') window.avgLifespanDisplay = element;
  if (id === 'conversionRateDisplay') window.conversionRateDisplay = element;
  if (id === 'avgSpeedDisplay') window.avgSpeedDisplay = element;
  
  return element;
});

document.querySelector = jest.fn().mockImplementation(() => ({
  classList: {
    toggle: jest.fn()
  }
}));

document.querySelectorAll = jest.fn().mockReturnValue([{
  classList: {
    toggle: jest.fn()
  }
}]);

// Mock requestAnimationFrame
window.requestAnimationFrame = jest.fn().mockImplementation(cb => {
  return setTimeout(() => cb(Date.now()), 0);
});

window.cancelAnimationFrame = jest.fn().mockImplementation(id => {
  clearTimeout(id);
});

// Mock entity types
window.ENTITY_TYPES = {
  ROCK: 'rock',
  PAPER: 'paper',
  SCISSORS: 'scissors'
};

// Initialize other required global variables
window.entities = [];
window.stats = { rock: { kills: 0, deaths: 0 }, paper: { kills: 0, deaths: 0 }, scissors: { kills: 0, deaths: 0 } };
window.config = {};
window.initialConfig = {
  ENTITY_SIZE: 9,
  MAX_SPEED: 1,
  CHASE_PRIORITY: 0.5,
  DETECTION_RADIUS_MULTIPLIER: 50,
  WARP_EDGES: true
};
window.sliderConfigMap = {
  'entitySize': 'ENTITY_SIZE',
  'maxSpeed': 'MAX_SPEED',
  'chasePriority': 'CHASE_PRIORITY',
  'detectionRadius': 'DETECTION_RADIUS_MULTIPLIER'
};
window.sliderKeys = Object.keys(window.sliderConfigMap);
window.entityTypeKeys = ['rock', 'paper', 'scissors'];
window.controlElements = {};
window.valueDisplayElements = {};
window.statsVisible = false;

// Silence console errors during tests
console.error = jest.fn();
console.warn = jest.fn();

// Add global.TextEncoder for jsdom environment
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
