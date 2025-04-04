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
    const toggleStats = require('../ui').toggleStats;
    
    // Initial state
    expect(window.statsVisible).toBe(false);
    
    // Toggle stats on
    toggleStats();
    
    // Check that statsVisible is now true
    expect(window.statsVisible).toBe(true);
    expect(window.toggleStatsButton.textContent).toBe('Hide Stats');
    expect(window.updateStatsDisplay).toHaveBeenCalled();
    
    // Toggle stats off
    toggleStats();
    
    // Check that statsVisible is now false
    expect(window.statsVisible).toBe(false);
    expect(window.toggleStatsButton.textContent).toBe('Show Stats');
    expect(window.updateStatsDisplay).toHaveBeenCalledTimes(2);
  });

  test('toggleAdvancedMenu should toggle advanced settings visibility', () => {
    const toggleAdvancedMenu = require('../ui').toggleAdvancedMenu;
    
    // Initial state
    expect(window.advancedMenuOpen).toBe(false);
    
    // Toggle advanced menu on
    toggleAdvancedMenu();
    
    // Check that advancedMenuOpen is now true
    expect(window.advancedMenuOpen).toBe(true);
    expect(window.advancedButton.textContent).toBe('Basic');
    expect(window.updateStatsDisplay).toHaveBeenCalled();
    
    // Toggle advanced menu off
    toggleAdvancedMenu();
    
    // Check that advancedMenuOpen is now false
    expect(window.advancedMenuOpen).toBe(false);
    expect(window.advancedButton.textContent).toBe('Advanced');
    expect(window.updateStatsDisplay).toHaveBeenCalledTimes(2);
  });

  test('updateConfigFromControls should update config from UI controls', () => {
    const updateConfigFromControls = require('../ui').updateConfigFromControls;
    
    // Setup mock sliders
    window.typeSettingsEnabled = false;
    window.controlElements = {
      entitySizeSlider: { value: '10', step: '1' },
      maxSpeedSlider: { value: '2.5', step: '0.1' }
    };
    window.warpEdgesCheckbox = { checked: false };
    
    // Call the function
    updateConfigFromControls();
    
    // Check that config was updated
    expect(window.config.ENTITY_SIZE).toBe(10);
    expect(window.config.MAX_SPEED).toBe(2.5);
    expect(window.config.WARP_EDGES).toBe(false);
  });
});
