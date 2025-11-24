// PlaytestSimulation.js - Simulación de playthrough completo

class PlaytestSimulation {
  constructor() {
    this.log = [];
    this.errors = [];
    this.stats = {
      daysPlayed: 0,
      encountersTriggered: 0,
      tasksAssigned: 0,
      achievementsUnlocked: 0,
      resourceCrises: 0
    };
  }

  // ═══════════════════════════════════════════
  // SIMULATE FULL GAME
  // ═══════════════════════════════════════════

  async simulateFullGame(options = {}) {
    console.log('\n🎮 STARTING PLAYTEST SIMULATION...\n');
    console.log('═'.repeat(50));

    const maxDays = options.maxDays || 60;
    const speed = options.speed || 'fast'; // fast, normal

    // Reset game state for simulation
    this.resetForSimulation();

    for (let day = 1; day <= maxDays; day++) {
      try {
        await this.simulateDay(day);
        this.stats.daysPlayed = day;

        // Check for game over conditions
        if (this.checkGameOver()) {
          this.log.push(`Day ${day}: GAME OVER`);
          break;
        }

        // Progress indicator
        if (day % 10 === 0) {
          console.log(`  📅 Day ${day}/60 completed`);
        }

        // Small delay for fast mode
        if (speed === 'normal') {
          await this.delay(100);
        }

      } catch (error) {
        this.errors.push({
          day: day,
          error: error.message,
          stack: error.stack
        });
        console.log(`  ❌ Error on day ${day}: ${error.message}`);
      }
    }

    this.printSimulationReport();

    return {
      success: this.errors.length === 0,
      stats: this.stats,
      errors: this.errors,
      log: this.log
    };
  }

  // ═══════════════════════════════════════════
  // SIMULATE SINGLE DAY
  // ═══════════════════════════════════════════

  async simulateDay(day) {
    // 1. Check for scripted encounters
    const encounter = this.checkForEncounter(day);
    if (encounter) {
      this.handleEncounter(encounter);
      this.stats.encountersTriggered++;
    }

    // 2. Check for random events
    const randomEvent = this.checkForRandomEvent(day);
    if (randomEvent) {
      this.handleRandomEvent(randomEvent);
    }

    // 3. Simulate player decisions (random for testing)
    this.simulatePlayerDecisions(day);

    // 4. Apply decay
    this.applyDecay();

    // 5. Check achievements
    this.checkAchievements();

    // 6. Check for crises
    if (this.checkResourceCrisis()) {
      this.stats.resourceCrises++;
    }

    // 7. Advance day
    if (gameState.timeManager) {
      gameState.timeManager.currentDay = day + 1;
    }
  }

  checkForEncounter(day) {
    const em = gameState.encounterManager;
    if (!em || !em.encounters) return null;

    return em.encounters.find(e => e.day === day);
  }

  handleEncounter(encounter) {
    // Simulate choosing first option (for testing)
    const option = encounter.options[0];

    if (option && option.consequences) {
      this.applyConsequences(option.consequences);
    }

    this.log.push(`Encounter: ${encounter.title} - chose option 1`);
  }

  checkForRandomEvent(day) {
    // Skip first and last days
    if (day < 6 || day > 54) return null;

    // Random chance
    if (Math.random() > 0.15) return null;

    const rem = gameState.randomEventManager;
    if (!rem || !rem.events) return null;

    return rem.events[Math.floor(Math.random() * rem.events.length)];
  }

  handleRandomEvent(event) {
    // Simulate choosing first option
    const option = event.options?.[0];

    if (option && option.consequences) {
      this.applyConsequences(option.consequences);
    }

    this.log.push(`Random Event: ${event.title || event.id}`);
  }

  simulatePlayerDecisions(day) {
    // Randomly assign tasks
    if (Math.random() > 0.7) {
      this.stats.tasksAssigned++;
    }
  }

  applyConsequences(consequences) {
    const rm = gameState.resourceManager;
    if (!rm) return;

    if (consequences.resources) {
      Object.entries(consequences.resources).forEach(([key, value]) => {
        if (rm.resources && rm.resources.hasOwnProperty(key)) {
          rm.modify(key, value);
        }
      });
    }
  }

  applyDecay() {
    const rm = gameState.resourceManager;
    if (!rm || typeof rm.applyDecay !== 'function') return;

    rm.applyDecay();
  }

  checkAchievements() {
    const am = gameState.achievementManager;
    if (!am || typeof am.checkAll !== 'function') return;

    const unlocked = am.checkAll();
    if (unlocked && unlocked.length > 0) {
      this.stats.achievementsUnlocked += unlocked.length;
    }
  }

  checkResourceCrisis() {
    const rm = gameState.resourceManager;
    if (!rm || !rm.resources) return false;

    return Object.values(rm.resources).some(val => val < 20);
  }

  checkGameOver() {
    const rm = gameState.resourceManager;
    if (!rm || !rm.resources) return false;

    // Game over if any resource hits 0
    return Object.values(rm.resources).some(val => val <= 0);
  }

  // ═══════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════

  resetForSimulation() {
    // Reset to day 1 with default resources
    if (gameState.timeManager) {
      gameState.timeManager.currentDay = 1;
    }

    if (gameState.resourceManager) {
      gameState.resourceManager.resources = {
        electricidad: 60,
        agua: 60,
        legitimidad: 60,
        autonomia: 60,
        creditos: 100
      };
    }

    this.log = [];
    this.errors = [];
    this.stats = {
      daysPlayed: 0,
      encountersTriggered: 0,
      tasksAssigned: 0,
      achievementsUnlocked: 0,
      resourceCrises: 0
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printSimulationReport() {
    console.log('\n' + '═'.repeat(50));
    console.log('📊 PLAYTEST SIMULATION REPORT');
    console.log('─'.repeat(50));
    console.log(`  📅 Days Played: ${this.stats.daysPlayed}/60`);
    console.log(`  🎭 Encounters: ${this.stats.encountersTriggered}`);
    console.log(`  📋 Tasks Assigned: ${this.stats.tasksAssigned}`);
    console.log(`  🏆 Achievements: ${this.stats.achievementsUnlocked}`);
    console.log(`  ⚠️  Resource Crises: ${this.stats.resourceCrises}`);
    console.log(`  ❌ Errors: ${this.errors.length}`);
    console.log('─'.repeat(50));

    if (this.errors.length > 0) {
      console.log('\nErrors encountered:');
      this.errors.forEach(err => {
        console.log(`  Day ${err.day}: ${err.error}`);
      });
    }

    if (this.stats.daysPlayed >= 60) {
      console.log('\n🎉 SIMULATION COMPLETED SUCCESSFULLY!');
    } else {
      console.log(`\n⚠️  Simulation ended early on day ${this.stats.daysPlayed}`);
    }

    console.log('═'.repeat(50) + '\n');
  }
}

if (typeof window !== 'undefined') {
  window.PlaytestSimulation = PlaytestSimulation;
}
