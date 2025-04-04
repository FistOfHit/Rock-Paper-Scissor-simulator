/**
 * Entity class for the Rock-Paper-Scissors simulator
 * Represents a single entity (rock, paper, or scissors) in the simulation
 */
class Entity {
    /**
     * Create a new entity
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {string} type - Entity type (rock, paper, scissors)
     */
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.id = window.entityIdCounter++;
        this.originalType = type; // Track original type for lifespan stats
        this.birthTime = Date.now();
        this.deathTime = null; // Used for lifespan calculation

        // Initial velocity based on global config (type-specific applied in update)
        const angle = Math.random() * Math.PI * 2;
        const initialMaxSpeed = window.config.MAX_SPEED;
        this.vx = Math.cos(angle) * initialMaxSpeed;
        this.vy = Math.sin(angle) * initialMaxSpeed;

        // Size based on global config (type-specific applied in update)
        this.size = window.config.ENTITY_SIZE;
        this.emojiSize = this.size * window.EMOJI_FONT_SIZE_MULTIPLIER;

        // State for target finding
        this.closestPrey = null;
        this.closestPredator = null;
        this.minDistPreySq = Infinity;
        this.minDistPredatorSq = Infinity;
        this.separateVx = 0; // Separation velocity components
        this.separateVy = 0;
    }

    /** Returns the prey and predator types for this entity. */
    getTargets() {
        switch (this.type) {
            case window.ENTITY_TYPES.ROCK: return { prey: window.ENTITY_TYPES.SCISSORS, predator: window.ENTITY_TYPES.PAPER };
            case window.ENTITY_TYPES.PAPER: return { prey: window.ENTITY_TYPES.ROCK, predator: window.ENTITY_TYPES.SCISSORS };
            case window.ENTITY_TYPES.SCISSORS: return { prey: window.ENTITY_TYPES.PAPER, predator: window.ENTITY_TYPES.ROCK };
            default: return { prey: null, predator: null };
        }
    }

    /** Gets the current applicable settings (global or type-specific). */
    getCurrentSettings() {
        const settings = {};
        const useTypeSettings = window.typeSettingsEnabled;
        const type = this.type;

        window.sliderKeys.forEach(key => {
            const configKey = window.sliderConfigMap[key];
            let value;
            if (useTypeSettings) {
                const typeControl = window.controlElements[`${key}Slider_${type}`];
                value = typeControl ? parseFloat(typeControl.value) : window.config[configKey];
            } else {
                value = window.config[configKey];
            }
            // Handle optimized mode override for detection radius
            if (key === 'detectionRadius' && window.config.OPTIMIZED_MODE) {
                value = window.OPTIMIZED_SETTINGS.DETECTION_RADIUS_MULTIPLIER;
            }
            settings[configKey] = value;
        });
        // Add non-slider configs needed within update
        settings.WARP_EDGES = window.config.WARP_EDGES;
        settings.OPTIMIZED_MODE = window.config.OPTIMIZED_MODE;

        return settings;
    }

    /** Updates entity state: finds targets, calculates movement, handles boundaries. */
    update() {
        const settings = this.getCurrentSettings();

        // Update size based on current settings
        this.size = settings.ENTITY_SIZE;
        this.emojiSize = this.size * window.EMOJI_FONT_SIZE_MULTIPLIER;

        const separationCheckDist = this.size * settings.SEPARATION_DISTANCE_MULTIPLIER;
        const separationCheckDistSq = separationCheckDist * separationCheckDist;

        // Reset target finding state for this frame
        this.closestPrey = null;
        this.closestPredator = null;
        this.minDistPreySq = Infinity;
        this.minDistPredatorSq = Infinity;
        this.separateVx = 0;
        this.separateVy = 0;

        // Find nearby entities using the appropriate algorithm
        if (settings.OPTIMIZED_MODE) {
            findNearby_Grid(this, separationCheckDistSq);
        } else {
            findNearby_BruteForce(this, window.entities, separationCheckDistSq, settings.DETECTION_RADIUS_MULTIPLIER);
        }

        const { prey: targetPreyType, predator: targetPredatorType } = this.getTargets();
        let desiredVx = 0, desiredVy = 0;
        let currentSpeed = settings.MAX_SPEED;
        const foundPrey = this.closestPrey !== null;
        const foundPredator = this.closestPredator !== null;

        // --- Calculate Steering Vectors ---
        let preyVx = 0, preyVy = 0;
        if (foundPrey) {
            const dx = this.closestPrey.x - this.x;
            const dy = this.closestPrey.y - this.y;
            const dist = Math.sqrt(this.minDistPreySq);
            if (dist > 0) { preyVx = dx / dist; preyVy = dy / dist; }
        }

        let predatorVx = 0, predatorVy = 0;
        if (foundPredator) {
            const dx = this.x - this.closestPredator.x;
            const dy = this.y - this.closestPredator.y;
            const dist = Math.sqrt(this.minDistPredatorSq);
            if (dist > 0) { predatorVx = dx / dist; predatorVy = dy / dist; }
        }

        // --- Combine Behaviors ---
        if (!foundPrey && !foundPredator) {
            // Wander behavior if no targets nearby
            if (Math.abs(this.vx) < 0.01 && Math.abs(this.vy) < 0.01) { // Start moving if stopped
                const angle = Math.random() * Math.PI * 2;
                desiredVx = Math.cos(angle); desiredVy = Math.sin(angle);
            } else { // Gently change direction
                const angle = Math.atan2(this.vy, this.vx);
                const change = (Math.random() - 0.5) * 0.5; // Small random turn
                const newAngle = angle + change;
                desiredVx = Math.cos(newAngle); desiredVy = Math.sin(newAngle);
            }
            // Apply separation force even when wandering
            desiredVx += this.separateVx * settings.SEPARATION_STRENGTH;
            desiredVy += this.separateVy * settings.SEPARATION_STRENGTH;
        } else {
            // Combine chase, flee, and separation forces based on priority
            const chaseWeight = settings.CHASE_PRIORITY;
            const fleeWeight = 1.0 - chaseWeight;
            desiredVx = (preyVx * chaseWeight) + (predatorVx * fleeWeight) + (this.separateVx * settings.SEPARATION_STRENGTH);
            desiredVy = (preyVy * chaseWeight) + (predatorVy * fleeWeight) + (this.separateVy * settings.SEPARATION_STRENGTH);

            // Apply jiggle (random wobble)
            desiredVx += (Math.random() - 0.5) * settings.JIGGLE_FACTOR;
            desiredVy += (Math.random() - 0.5) * settings.JIGGLE_FACTOR;

            // Apply speed multipliers
            if (foundPredator) { currentSpeed *= settings.FLEEING_SPEED_MULTIPLIER; }
            else if (foundPrey) { currentSpeed *= settings.CHASING_SPEED_MULTIPLIER; }
        }

        // --- Apply Velocity ---
        const desiredMag = Math.sqrt(desiredVx * desiredVx + desiredVy * desiredVy);
        if (desiredMag > 0.01) { // Normalize and scale desired velocity
            const normVx = desiredVx / desiredMag;
            const normVy = desiredVy / desiredMag;
            this.vx = normVx * currentSpeed;
            this.vy = normVy * currentSpeed;
        } else if (!foundPrey && !foundPredator) {
            // If desired velocity is near zero (e.g., balanced forces), maintain some movement
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * currentSpeed;
            this.vy = Math.sin(angle) * currentSpeed;
        }

        // --- Update Position ---
        this.x += this.vx;
        this.y += this.vy;

        // --- Handle Boundaries (Warp or Bounce) ---
        if (settings.WARP_EDGES) {
            if (this.x < 0) this.x = window.canvas.width; else if (this.x > window.canvas.width) this.x = 0;
            if (this.y < 0) this.y = window.canvas.height; else if (this.y > window.canvas.height) this.y = 0;
        } else {
            const r = this.size; // Use current size for boundary check
            let bounced = false;
            if (this.x < r) { this.x = r; this.vx *= -1; bounced = true; }
            else if (this.x > window.canvas.width - r) { this.x = window.canvas.width - r; this.vx *= -1; bounced = true; }
            if (this.y < r) { this.y = r; this.vy *= -1; bounced = true; }
            else if (this.y > window.canvas.height - r) { this.y = window.canvas.height - r; this.vy *= -1; bounced = true; }

            // Ensure speed is maintained after bounce
            if (bounced) {
                const mag = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (mag > 0) {
                    this.vx = (this.vx / mag) * currentSpeed;
                    this.vy = (this.vy / mag) * currentSpeed;
                }
            }
        }
    }

    /** Draws the entity's emoji on the canvas. */
    draw(ctx) {
        // Ensure emojiSize is up-to-date if size changed
        this.emojiSize = this.size * window.EMOJI_FONT_SIZE_MULTIPLIER;
        ctx.font = `${this.emojiSize}px 'Press Start 2P'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.getEmoji(), this.x, this.y);
    }

    /** Returns the emoji corresponding to the entity's type. */
    getEmoji() {
        switch (this.type) {
            case window.ENTITY_TYPES.ROCK: return '⛰️';
            case window.ENTITY_TYPES.PAPER: return '📄';
            case window.ENTITY_TYPES.SCISSORS: return '✂️';
            default: return '?';
        }
    }

    /** Calculates the current magnitude of the entity's velocity. */
    getCurrentSpeed() {
        return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    }
}

// Make Entity available globally
window.Entity = Entity;
