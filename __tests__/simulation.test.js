describe('Simulation Module', () => {
  let originalNow;
  
  beforeAll(() => {
    // Mock Date.now for consistent testing
    originalNow = Date.now;
    Date.now = jest.fn().mockReturnValue(1000);
  });
  
  afterAll(() => {
    // Restore original Date.now
    Date.now = originalNow;
  });
  
  beforeEach(() => {
    // Reset simulation state
    window.entities = [];
    window.entityIdCounter = 0;
    window.simulationRunning = false;
    window.isPaused = false;
    window.simulationStartTime = null;
    window.lastUpdateTime = 0;
    window.simulationTimeElapsedMs = 0;
    window.stats = { rock: { kills: 0, deaths: 0 }, paper: { kills: 0, deaths: 0 }, scissors: { kills: 0, deaths: 0 } };
  });

  test('initializeEntities should create the correct number of entities', () => {
    const initializeEntities = require('../simulation').initializeEntities;
    
    // Call the function with specific counts
    initializeEntities(10, 20, 30);
    
    // Check that the correct number of entities were created
    expect(window.entities.length).toBe(60);
    
    // Count entities by type
    const rockCount = window.entities.filter(e => e.type === 'rock').length;
    const paperCount = window.entities.filter(e => e.type === 'paper').length;
    const scissorsCount = window.entities.filter(e => e.type === 'scissors').length;
    
    expect(rockCount).toBe(10);
    expect(paperCount).toBe(20);
    expect(scissorsCount).toBe(30);
  });

  test('startSimulation should initialize simulation state correctly', () => {
    const startSimulation = require('../simulation').startSimulation;
    
    // Call the function
    startSimulation(5, 5, 5);
    
    // Check that simulation state was initialized correctly
    expect(window.simulationRunning).toBe(true);
    expect(window.isPaused).toBe(false);
    expect(window.simulationStartTime).toBe(1000);
    expect(window.lastUpdateTime).toBe(1000);
    expect(window.entities.length).toBe(15);
  });

  test('pauseResumeSimulation should toggle pause state', () => {
    const pauseResumeSimulation = require('../simulation').pauseResumeSimulation;
    
    // Setup initial state
    window.simulationRunning = true;
    window.isPaused = false;
    window.simulationStartTime = 1000;
    window.lastUpdateTime = 1000;
    
    // Pause the simulation
    pauseResumeSimulation();
    
    // Check that simulation is paused
    expect(window.isPaused).toBe(true);
    
    // Resume the simulation
    pauseResumeSimulation();
    
    // Check that simulation is resumed
    expect(window.isPaused).toBe(false);
  });

  test('resetSimulation should clear simulation state', () => {
    const resetSimulation = require('../simulation').resetSimulation;
    
    // Setup initial state
    window.entities = [{ id: 1 }, { id: 2 }, { id: 3 }];
    window.simulationRunning = true;
    window.isPaused = true;
    window.simulationStartTime = 1000;
    window.simulationTimeElapsedMs = 5000;
    
    // Reset the simulation
    resetSimulation();
    
    // Check that simulation state was cleared
    expect(window.entities.length).toBe(0);
    expect(window.simulationRunning).toBe(false);
    expect(window.isPaused).toBe(false);
    expect(window.simulationStartTime).toBe(null);
    expect(window.simulationTimeElapsedMs).toBe(0);
  });
});
