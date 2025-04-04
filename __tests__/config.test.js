/**
 * Tests for config.js
 */
const fs = require('fs');
const path = require('path');

// Read the config.js file content
const configPath = path.join(__dirname, '..', 'config.js');
const configContent = fs.readFileSync(configPath, 'utf8');

// Execute the config.js content to set up the window.config and window.initialConfig
eval(configContent);

describe('Config Module', () => {
  test('config object should be defined', () => {
    expect(window.config).toBeDefined();
    expect(window.initialConfig).toBeDefined();
  });

  test('config should have essential properties', () => {
    expect(window.config).toHaveProperty('ENTITY_SIZE');
    expect(window.config).toHaveProperty('MAX_SPEED');
    expect(window.config).toHaveProperty('CHASE_PRIORITY');
    expect(window.config).toHaveProperty('DETECTION_RADIUS_MULTIPLIER');
    expect(window.config).toHaveProperty('WARP_EDGES');
  });

  test('initialConfig should match config initially', () => {
    // Check a few key properties to ensure they match
    expect(window.initialConfig.ENTITY_SIZE).toBe(window.config.ENTITY_SIZE);
    expect(window.initialConfig.MAX_SPEED).toBe(window.config.MAX_SPEED);
    expect(window.initialConfig.CHASE_PRIORITY).toBe(window.config.CHASE_PRIORITY);
  });

  test('sliderConfigMap should map UI controls to config properties', () => {
    expect(window.sliderConfigMap).toBeDefined();
    expect(window.sliderConfigMap.entitySize).toBe('ENTITY_SIZE');
    expect(window.sliderConfigMap.maxSpeed).toBe('MAX_SPEED');
    expect(window.sliderConfigMap.chasePriority).toBe('CHASE_PRIORITY');
  });
});
