const testUtils = require('./test-utils');
const { Entity } = testUtils;

describe('Entity Module', () => {
  let rockEntity, paperEntity, scissorsEntity;
  
  beforeEach(() => {
    // Create test entities
    rockEntity = new Entity(100, 100, window.ENTITY_TYPES.ROCK);
    paperEntity = new Entity(200, 200, window.ENTITY_TYPES.PAPER);
    scissorsEntity = new Entity(300, 300, window.ENTITY_TYPES.SCISSORS);
  });

  test('Entity constructor should create entities with correct properties', () => {
    expect(rockEntity.type).toBe(window.ENTITY_TYPES.ROCK);
    expect(rockEntity.x).toBe(100);
    expect(rockEntity.y).toBe(100);
    
    expect(paperEntity.type).toBe(window.ENTITY_TYPES.PAPER);
    expect(paperEntity.x).toBe(200);
    expect(paperEntity.y).toBe(200);
    
    expect(scissorsEntity.type).toBe(window.ENTITY_TYPES.SCISSORS);
    expect(scissorsEntity.x).toBe(300);
    expect(scissorsEntity.y).toBe(300);
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
