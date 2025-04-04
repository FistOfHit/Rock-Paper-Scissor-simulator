/**
 * Tests for entity.js
 */
const fs = require('fs');
const path = require('path');

// Read the entity.js file content
const entityPath = path.join(__dirname, '..', 'entity.js');
const entityContent = fs.readFileSync(entityPath, 'utf8');

// Set up necessary window properties before evaluating entity.js
window.config = {
  ENTITY_SIZE: 8,
  MAX_SPEED: 2,
  CHASE_PRIORITY: 0.5,
  CHASING_SPEED_MULTIPLIER: 1.5,
  FLEEING_SPEED_MULTIPLIER: 1.5,
  JIGGLE_FACTOR: 0.2,
  DETECTION_RADIUS_MULTIPLIER: 5,
  WARP_EDGES: true
};

// Execute the entity.js content
eval(entityContent);

describe('Entity Module', () => {
  let rockEntity, paperEntity, scissorsEntity;
  
  beforeEach(() => {
    // Create test entities
    rockEntity = new Entity(100, 100, window.ENTITY_TYPES.ROCK);
    paperEntity = new Entity(200, 200, window.ENTITY_TYPES.PAPER);
    scissorsEntity = new Entity(300, 300, window.ENTITY_TYPES.SCISSORS);
  });
  
  test('Entity constructor should create entities with correct properties', () => {
    expect(rockEntity.x).toBe(100);
    expect(rockEntity.y).toBe(100);
    expect(rockEntity.type).toBe(window.ENTITY_TYPES.ROCK);
    expect(rockEntity.size).toBe(window.config.ENTITY_SIZE);
    expect(rockEntity.vx).toBeDefined();
    expect(rockEntity.vy).toBeDefined();
  });
  
  test('Entity should have correct prey and predator relationships', () => {
    // Rock beats scissors
    expect(rockEntity.isPreyFor(scissorsEntity)).toBe(false);
    expect(rockEntity.isPredatorOf(scissorsEntity)).toBe(true);
    
    // Paper beats rock
    expect(paperEntity.isPreyFor(rockEntity)).toBe(false);
    expect(paperEntity.isPredatorOf(rockEntity)).toBe(true);
    
    // Scissors beats paper
    expect(scissorsEntity.isPreyFor(paperEntity)).toBe(false);
    expect(scissorsEntity.isPredatorOf(paperEntity)).toBe(true);
  });
  
  test('Entity should calculate distance correctly', () => {
    // Distance between (100,100) and (200,200) should be sqrt(20000) = 141.42...
    const distance = rockEntity.distanceTo(paperEntity);
    expect(distance).toBeCloseTo(141.42, 1);
  });
  
  test('Entity should convert to the correct type when caught', () => {
    // Rock catches scissors, scissors becomes rock
    scissorsEntity.convertTo(rockEntity.type);
    expect(scissorsEntity.type).toBe(window.ENTITY_TYPES.ROCK);
    
    // Paper catches rock, rock becomes paper
    rockEntity.convertTo(paperEntity.type);
    expect(rockEntity.type).toBe(window.ENTITY_TYPES.PAPER);
  });
});
