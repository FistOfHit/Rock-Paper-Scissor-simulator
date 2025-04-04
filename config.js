// Fix for global variables issue
window.ENTITY_TYPES = {
    ROCK: 'rock',
    PAPER: 'paper',
    SCISSORS: 'scissors'
};

// Default configuration values
window.initialConfig = {
    // Entity properties
    ENTITY_SIZE: 9,
    MAX_SPEED: 1,
    CHASE_PRIORITY: 0.5,
    CHASING_SPEED_MULTIPLIER: 1.0,
    FLEEING_SPEED_MULTIPLIER: 1.0,
    JIGGLE_FACTOR: 0.2,
    SEPARATION_DISTANCE_MULTIPLIER: 0.1,
    SEPARATION_STRENGTH: 1.0,
    DETECTION_RADIUS_MULTIPLIER: 50,
    PREDATION_RADIUS_MULTIPLIER: 1.0,
    
    // Environment settings
    WARP_EDGES: true,
    OPTIMIZED_MODE: false
};

// Special value for infinite detection radius
window.INFINITE_DETECTION_VALUE = 101;

// Optimization settings
window.OPTIMIZED_SETTINGS = {
    DETECTION_RADIUS_MULTIPLIER: 10, // Fixed detection radius in optimized mode
    GRID_CELL_SIZE: 50 // Size of spatial grid cells
};

// Font size multiplier for emoji rendering
window.EMOJI_FONT_SIZE_MULTIPLIER = 1.5;

// Update interval for stats display (ms)
window.STATS_UPDATE_INTERVAL = 250;

// Mapping from slider keys to config properties
window.sliderConfigMap = {
    'entitySize': 'ENTITY_SIZE',
    'maxSpeed': 'MAX_SPEED',
    'chasePriority': 'CHASE_PRIORITY',
    'chasingSpeedMultiplier': 'CHASING_SPEED_MULTIPLIER',
    'fleeingSpeedMultiplier': 'FLEEING_SPEED_MULTIPLIER',
    'jiggle': 'JIGGLE_FACTOR',
    'separationDistance': 'SEPARATION_DISTANCE_MULTIPLIER',
    'separationStrength': 'SEPARATION_STRENGTH',
    'detectionRadius': 'DETECTION_RADIUS_MULTIPLIER',
    'predationRadius': 'PREDATION_RADIUS_MULTIPLIER'
};

// List of all slider keys for iteration
window.sliderKeys = Object.keys(window.sliderConfigMap);

// List of entity types for iteration
window.entityTypeKeys = ['rock', 'paper', 'scissors'];

// Create a copy of the initial config for the active config
window.config = { ...window.initialConfig };
