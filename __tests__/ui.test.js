const testUtils = require('./test-utils');

describe('UI Module', () => {
  beforeEach(() => {
    // Reset window state
    window.statsVisible = false;
    window.advancedMenuOpen = false;
    window.config = { ...window.initialConfig };
    
    // Reset DOM elements
    window.toggleStatsButton = document.getElementById('toggleStatsButton');
    window.advancedButton = document.getElementById('advancedButton');
    window.advancedSettingsDiv = document.getElementById('advancedSettings');
    
    // Mock functions
    window.updateStatsDisplay = jest.fn();
  });

  test('toggleStats should update button text and statsVisible flag', () => {
    // Initial state
    expect(window.statsVisible).toBe(false);
    
    // Toggle stats on
    testUtils.toggleStats();
    
    // Check that statsVisible is now true
    expect(window.statsVisible).toBe(true);
    expect(window.toggleStatsButton.textContent).toBe('Hide Stats');
    
    // Toggle stats off
    testUtils.toggleStats();
    
    // Check that statsVisible is now false
    expect(window.statsVisible).toBe(false);
    expect(window.toggleStatsButton.textContent).toBe('Show Stats');
  });

  test('toggleAdvancedMenu should toggle advanced settings visibility', () => {
    // Initial state
    expect(window.advancedMenuOpen).toBe(false);
    
    // Toggle advanced menu on
    testUtils.toggleAdvancedMenu();
    
    // Check that advancedMenuOpen is now true
    expect(window.advancedMenuOpen).toBe(true);
    expect(window.advancedButton.textContent).toBe('Basic');
    
    // Toggle advanced menu off
    testUtils.toggleAdvancedMenu();
    
    // Check that advancedMenuOpen is now false
    expect(window.advancedMenuOpen).toBe(false);
    expect(window.advancedButton.textContent).toBe('Advanced');
  });

  test('updateConfigFromControls should update config from UI controls', () => {
    // Setup mock sliders
    window.typeSettingsEnabled = false;
    window.controlElements = {
      entitySizeSlider: { value: '10', step: '1' },
      maxSpeedSlider: { value: '2.5', step: '0.1' }
    };
    window.warpEdgesCheckbox = { checked: false };
    
    // Call the function
    testUtils.updateConfigFromControls();
    
    // Check that config was updated
    expect(window.config.ENTITY_SIZE).toBe(10);
    expect(window.config.MAX_SPEED).toBe(2.5);
    expect(window.config.WARP_EDGES).toBe(false);
  });
});
