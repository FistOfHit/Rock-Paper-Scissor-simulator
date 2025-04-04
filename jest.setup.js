require('@testing-library/jest-dom');

// Mock browser environment
global.window = {
  // Mock essential window properties and methods
  config: {},
  initialConfig: {},
  entities: [],
  stats: {
    rock: { kills: 0, deaths: 0 },
    paper: { kills: 0, deaths: 0 },
    scissors: { kills: 0, deaths: 0 }
  },
  ENTITY_TYPES: {
    ROCK: 'rock',
    PAPER: 'paper',
    SCISSORS: 'scissors'
  },
  statsVisible: true,
  simulationTimeElapsedMs: 0,
  totalConversions: 0,
  totalConversionsPerType: { rock: 0, paper: 0, scissors: 0 },
  conversionCounts: { all: 0, rock: 0, paper: 0, scissors: 0 },
  lifespanSums: { all: 0, rock: 0, paper: 0, scissors: 0 },
  lastAvgSpeeds: { all: '0.00', rock: '0.00', paper: '0.00', scissors: '0.00' },
  winnerInfo: { type: null, emoji: '' },
  advancedMenuOpen: false
};

// Mock DOM elements
document = {
  getElementById: jest.fn().mockImplementation(() => ({
    addEventListener: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn().mockReturnValue(false)
    },
    style: {},
    textContent: '',
    value: '',
    checked: false
  })),
  createElement: jest.fn().mockImplementation(() => ({
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn()
    },
    style: {},
    textContent: '',
    appendChild: jest.fn()
  })),
  querySelectorAll: jest.fn().mockReturnValue([]),
  querySelector: jest.fn().mockReturnValue(null)
};

// Mock canvas and context
const mockContext = {
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  fillText: jest.fn(),
  measureText: jest.fn().mockReturnValue({ width: 10 }),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1
};

global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);

// Mock Math.random for deterministic tests
const originalRandom = Math.random;
global.mockRandom = (value) => {
  Math.random = () => value;
};
global.resetRandom = () => {
  Math.random = originalRandom;
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 0));
global.cancelAnimationFrame = jest.fn();
