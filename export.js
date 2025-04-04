/**
 * Export functionality for the Rock-Paper-Scissors simulator
 * Handles exporting simulation data to CSV and JSON formats
 */

/**
 * Generate a timestamp-based filename
 * @param {string} prefix - Prefix for the filename
 * @param {string} extension - File extension (without dot)
 * @returns {string} Formatted filename with timestamp
 */
function generateFilename(prefix, extension) {
    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, '')
        .replace('T', '_');
    return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Trigger a file download in the browser
 * @param {string} content - Content to download
 * @param {string} filename - Name of the file
 * @param {string} type - MIME type of the file
 */
function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Export timeseries data as CSV
 */
function exportTimeseriesCSV() {
    if (!window.timeseriesData) return;
    
    const csvContent = window.timeseriesData.toCSV();
    const filename = generateFilename('rps_simulation_data', 'csv');
    downloadFile(csvContent, filename, 'text/csv');
    
    return filename;
}

/**
 * Collect all simulation parameters and results for JSON export
 * @returns {Object} Simulation parameters and results
 */
function collectSimulationParameters() {
    // Basic simulation info
    const simulationInfo = {
        timestamp: new Date().toISOString(),
        duration: window.simulationTimeElapsedMs / 1000,
        result: window.winnerInfo.type ? `${window.winnerInfo.type} wins` : 'No winner'
    };
    
    // Initial entity counts
    const initialCounts = {
        rock: parseInt(document.getElementById('rocks').value) || 0,
        paper: parseInt(document.getElementById('papers').value) || 0,
        scissors: parseInt(document.getElementById('scissors').value) || 0
    };
    
    // Canvas settings
    const canvasSettings = {
        width: window.canvas.width,
        height: window.canvas.height,
        customSize: !!(parseInt(document.getElementById('canvasWidth').value) && 
                      parseInt(document.getElementById('canvasHeight').value))
    };
    
    // Global configuration
    const globalConfig = { ...window.config };
    
    // Type-specific settings (if enabled)
    const typeSpecificEnabled = window.typeSettingsEnabled;
    const typeSpecificSettings = {};
    
    if (typeSpecificEnabled) {
        for (const type of ['rock', 'paper', 'scissors']) {
            typeSpecificSettings[type] = {};
            for (const key of window.sliderKeys) {
                const slider = document.getElementById(`${key}Slider_${type}`);
                if (slider) {
                    typeSpecificSettings[type][key] = parseFloat(slider.value);
                }
            }
        }
    }
    
    // Final statistics
    const finalStats = {
        entityCounts: {
            rock: window.entities.filter(e => e.type === window.ENTITY_TYPES.ROCK).length,
            paper: window.entities.filter(e => e.type === window.ENTITY_TYPES.PAPER).length,
            scissors: window.entities.filter(e => e.type === window.ENTITY_TYPES.SCISSORS).length
        },
        kills: { ...window.stats.rock.kills, ...window.stats.paper.kills, ...window.stats.scissors.kills },
        deaths: { ...window.stats.rock.deaths, ...window.stats.paper.deaths, ...window.stats.scissors.deaths },
        totalConversions: window.totalConversions,
        conversionsByType: { ...window.totalConversionsPerType },
        avgLifespans: {
            rock: window.conversionCounts.rock > 0 ? window.lifespanSums.rock / window.conversionCounts.rock / 1000 : 0,
            paper: window.conversionCounts.paper > 0 ? window.lifespanSums.paper / window.conversionCounts.paper / 1000 : 0,
            scissors: window.conversionCounts.scissors > 0 ? window.lifespanSums.scissors / window.conversionCounts.scissors / 1000 : 0,
            all: window.conversionCounts.all > 0 ? window.lifespanSums.all / window.conversionCounts.all / 1000 : 0
        }
    };
    
    // Combine all parameters
    return {
        simulationInfo,
        initialCounts,
        canvasSettings,
        globalConfig,
        typeSpecificEnabled,
        typeSpecificSettings,
        finalStats
    };
}

/**
 * Export simulation parameters as JSON
 */
function exportSimulationParametersJSON() {
    const parameters = collectSimulationParameters();
    const jsonContent = JSON.stringify(parameters, null, '\t');
    const filename = generateFilename('rps_simulation_params', 'json');
    downloadFile(jsonContent, filename, 'application/json');
    
    return filename;
}

/**
 * Export both CSV and JSON files when export button is clicked
 */
function handleExportButtonClick() {
    const csvFilename = exportTimeseriesCSV();
    const jsonFilename = exportSimulationParametersJSON();
    
    console.log(`Exported data to ${csvFilename} and ${jsonFilename}`);
    alert(`Exported:\n- Timeseries data: ${csvFilename}\n- Simulation parameters: ${jsonFilename}`);
}

// Make functions available globally
window.generateFilename = generateFilename;
window.downloadFile = downloadFile;
window.exportTimeseriesCSV = exportTimeseriesCSV;
window.collectSimulationParameters = collectSimulationParameters;
window.exportSimulationParametersJSON = exportSimulationParametersJSON;
window.handleExportButtonClick = handleExportButtonClick;
