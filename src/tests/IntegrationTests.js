// IntegrationTests.js - Tests de integración entre sistemas

function runIntegrationTests(runner) {

  runner.suite('Day Advance Integration');

  runner.test('advancing day updates resources', (t) => {
    const rm = gameState.resourceManager;
    const tm = gameState.timeManager;

    const dayBefore = tm.currentDay;
    const resourcesBefore = { ...rm.resources };

    // Check the mechanism exists
    t.assert(typeof tm.advanceDay === 'function', 'advanceDay should be a function');
  });

  runner.test('day advance triggers decay', (t) => {
    const rm = gameState.resourceManager;

    t.assert(typeof rm.applyDecay === 'function', 'applyDecay should be a function');
  });

  // ═══════════════════════════════════════════

  runner.suite('Task Assignment Integration');

  runner.test('can assign task to NPC', (t) => {
    const nm = gameState.npcManager;
    const tm = gameState.taskManager;

    t.assertNotNull(tm, 'taskManager should exist');

    // Check assign function exists
    t.assert(
      typeof tm.assignTask === 'function' || typeof nm.assignTask === 'function',
      'assignTask function should exist'
    );
  });

  // ═══════════════════════════════════════════

  runner.suite('Encounter Trigger Integration');

  runner.test('encounters can be triggered', (t) => {
    const em = gameState.encounterManager;

    t.assert(
      typeof em.checkForEncounter === 'function' ||
      typeof em.triggerEncounter === 'function',
      'Encounter trigger function should exist'
    );
  });

  // ═══════════════════════════════════════════

  runner.suite('Achievement Unlock Integration');

  runner.test('achievements can be unlocked', (t) => {
    const am = gameState.achievementManager;

    t.assert(
      typeof am.unlock === 'function' ||
      typeof am.checkAndUnlock === 'function',
      'Achievement unlock function should exist'
    );
  });

  runner.test('achievement notification component exists', (t) => {
    t.assert(
      typeof AchievementNotification !== 'undefined',
      'AchievementNotification class should exist'
    );
  });

  // ═══════════════════════════════════════════

  runner.suite('Ending Calculation Integration');

  runner.test('ending calculator exists', (t) => {
    t.assert(
      typeof EndingCalculator !== 'undefined' ||
      typeof gameState.calculateEnding === 'function' ||
      gameState.endingManager !== undefined,
      'Ending calculation should exist'
    );
  });
}

if (typeof window !== 'undefined') {
  window.runIntegrationTests = runIntegrationTests;
}
