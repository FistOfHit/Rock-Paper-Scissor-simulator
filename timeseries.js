/**
 * TimeseriesData class for tracking simulation metrics over time
 * Collects data at 1-second intervals during simulation
 */
class TimeseriesData {
    constructor() {
        // Timestamps for each data point
        this.timestamps = [];
        this.simulationStartTime = null;

        // Entity counts per type and total
        this.entityCounts = {
            rock: [],
            paper: [],
            scissors: [],
            total: []
        };

        // Kill counts per type and total
        this.killCounts = {
            rock: [],
            paper: [],
            scissors: [],
            total: []
        };

        // Death counts per type and total
        this.deathCounts = {
            rock: [],
            paper: [],
            scissors: [],
            total: []
        };

        // Kill/Death Ratios per type
        this.kdr = {
            rock: [],
            paper: [],
            scissors: []
        };

        // Average lifespans per type and overall
        this.avgLifespans = {
            rock: [],
            paper: [],
            scissors: [],
            all: []
        };

        // Conversion rates per type and overall
        this.conversionRates = {
            rock: [],
            paper: [],
            scissors: [],
            all: []
        };

        // Internal tracking
        this.collectionInterval = null;
        this.isCollecting = false;
    }

    /**
     * Start collecting timeseries data
     * @param {number} startTime - Simulation start time in milliseconds
     */
    startCollection(startTime) {
        if (this.isCollecting) return;

        this.reset();
        this.simulationStartTime = startTime;
        this.isCollecting = true;

        // Set up 1-second polling interval
        this.collectionInterval = setInterval(() => {
            this.collectDataPoint();
        }, 1000);
    }

    /**
     * Stop collecting timeseries data
     */
    stopCollection() {
        if (!this.isCollecting) return;

        clearInterval(this.collectionInterval);
        this.collectionInterval = null;
        this.isCollecting = false;

        // Collect one final data point to ensure we have the end state
        this.collectDataPoint();
    }

    /**
     * Reset all data collections
     */
    reset() {
        this.timestamps = [];
        this.simulationStartTime = null;

        // Reset all data arrays
        for (const type of ['rock', 'paper', 'scissors', 'total']) {
            this.entityCounts[type] = [];
            this.killCounts[type] = [];
            this.deathCounts[type] = [];
        }

        for (const type of ['rock', 'paper', 'scissors']) {
            this.kdr[type] = [];
        }

        for (const type of ['rock', 'paper', 'scissors', 'all']) {
            this.avgLifespans[type] = [];
            this.conversionRates[type] = [];
        }

        this.isCollecting = false;
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
            this.collectionInterval = null;
        }
    }

    /**
     * Collect a single data point from the current simulation state
     */
    collectDataPoint() {
        if (!this.isCollecting || !window.simulationRunning) return;

        const now = Date.now();
        const elapsedSeconds = (now - this.simulationStartTime) / 1000;
        this.timestamps.push(elapsedSeconds);

        // Collect entity counts
        const counts = window.entities.reduce((acc, entity) => {
            acc[entity.type] = (acc[entity.type] || 0) + 1;
            return acc;
        }, {});

        const rockCount = counts[window.ENTITY_TYPES.ROCK] || 0;
        const paperCount = counts[window.ENTITY_TYPES.PAPER] || 0;
        const scissorsCount = counts[window.ENTITY_TYPES.SCISSORS] || 0;
        const totalCount = rockCount + paperCount + scissorsCount;

        this.entityCounts.rock.push(rockCount);
        this.entityCounts.paper.push(paperCount);
        this.entityCounts.scissors.push(scissorsCount);
        this.entityCounts.total.push(totalCount);

        // Collect kill and death counts
        const rockKills = window.stats.rock.kills;
        const paperKills = window.stats.paper.kills;
        const scissorsKills = window.stats.scissors.kills;
        const totalKills = rockKills + paperKills + scissorsKills;

        this.killCounts.rock.push(rockKills);
        this.killCounts.paper.push(paperKills);
        this.killCounts.scissors.push(scissorsKills);
        this.killCounts.total.push(totalKills);

        const rockDeaths = window.stats.rock.deaths;
        const paperDeaths = window.stats.paper.deaths;
        const scissorsDeaths = window.stats.scissors.deaths;
        const totalDeaths = rockDeaths + paperDeaths + scissorsDeaths;

        this.deathCounts.rock.push(rockDeaths);
        this.deathCounts.paper.push(paperDeaths);
        this.deathCounts.scissors.push(scissorsDeaths);
        this.deathCounts.total.push(totalDeaths);

        // Calculate and collect KDR
        const rockKDR = rockDeaths === 0 ? rockKills : rockKills / rockDeaths;
        const paperKDR = paperDeaths === 0 ? paperKills : paperKills / paperDeaths;
        const scissorsKDR = scissorsDeaths === 0 ? scissorsKills : scissorsKills / scissorsDeaths;

        this.kdr.rock.push(rockKDR);
        this.kdr.paper.push(paperKDR);
        this.kdr.scissors.push(scissorsKDR);

        // Collect average lifespans
        const avgLifespanRock = window.conversionCounts.rock > 0 ? window.lifespanSums.rock / window.conversionCounts.rock / 1000 : 0;
        const avgLifespanPaper = window.conversionCounts.paper > 0 ? window.lifespanSums.paper / window.conversionCounts.paper / 1000 : 0;
        const avgLifespanScissors = window.conversionCounts.scissors > 0 ? window.lifespanSums.scissors / window.conversionCounts.scissors / 1000 : 0;
        const avgLifespanAll = window.conversionCounts.all > 0 ? window.lifespanSums.all / window.conversionCounts.all / 1000 : 0;

        this.avgLifespans.rock.push(avgLifespanRock);
        this.avgLifespans.paper.push(avgLifespanPaper);
        this.avgLifespans.scissors.push(avgLifespanScissors);
        this.avgLifespans.all.push(avgLifespanAll);

        // Calculate and collect conversion rates (conversions per second)
        const cpsRock = elapsedSeconds > 0 ? window.totalConversionsPerType.rock / elapsedSeconds : 0;
        const cpsPaper = elapsedSeconds > 0 ? window.totalConversionsPerType.paper / elapsedSeconds : 0;
        const cpsScissors = elapsedSeconds > 0 ? window.totalConversionsPerType.scissors / elapsedSeconds : 0;
        const cpsAll = elapsedSeconds > 0 ? window.totalConversions / elapsedSeconds : 0;

        this.conversionRates.rock.push(cpsRock);
        this.conversionRates.paper.push(cpsPaper);
        this.conversionRates.scissors.push(cpsScissors);
        this.conversionRates.all.push(cpsAll);
    }

    /**
     * Convert timeseries data to CSV format
     * @returns {string} CSV formatted string with headers and data
     */
    toCSV() {
        // Create headers
        const headers = [
            'Time(s)',
            'RockCount', 'PaperCount', 'ScissorsCount', 'TotalCount',
            'RockKills', 'PaperKills', 'ScissorsKills', 'TotalKills',
            'RockDeaths', 'PaperDeaths', 'ScissorsDeaths', 'TotalDeaths',
            'RockKDR', 'PaperKDR', 'ScissorsKDR',
            'RockLifespan', 'PaperLifespan', 'ScissorsLifespan', 'OverallLifespan',
            'RockConvRate', 'PaperConvRate', 'ScissorsConvRate', 'OverallConvRate'
        ];

        // Start with headers
        let csvContent = headers.join(',') + '\n';

        // Add data rows
        for (let i = 0; i < this.timestamps.length; i++) {
            const row = [
                this.timestamps[i].toFixed(1),
                this.entityCounts.rock[i],
                this.entityCounts.paper[i],
                this.entityCounts.scissors[i],
                this.entityCounts.total[i],
                this.killCounts.rock[i],
                this.killCounts.paper[i],
                this.killCounts.scissors[i],
                this.killCounts.total[i],
                this.deathCounts.rock[i],
                this.deathCounts.paper[i],
                this.deathCounts.scissors[i],
                this.deathCounts.total[i],
                this.kdr.rock[i].toFixed(2),
                this.kdr.paper[i].toFixed(2),
                this.kdr.scissors[i].toFixed(2),
                this.avgLifespans.rock[i].toFixed(2),
                this.avgLifespans.paper[i].toFixed(2),
                this.avgLifespans.scissors[i].toFixed(2),
                this.avgLifespans.all[i].toFixed(2),
                this.conversionRates.rock[i].toFixed(2),
                this.conversionRates.paper[i].toFixed(2),
                this.conversionRates.scissors[i].toFixed(2),
                this.conversionRates.all[i].toFixed(2)
            ];

            csvContent += row.join(',') + '\n';
        }

        return csvContent;
    }
}

// Create a global instance for use throughout the application
window.timeseriesData = new TimeseriesData();
