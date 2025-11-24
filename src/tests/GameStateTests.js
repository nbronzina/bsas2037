// GameStateTests.js - Tests para el estado del juego

function runGameStateTests(runner) {

  runner.suite('GameState Initialization');

  runner.test('gameState exists', (t) => {
    t.assertNotNull(gameState, 'gameState should exist');
  });

  runner.test('resourceManager exists', (t) => {
    t.assertNotNull(gameState.resourceManager, 'resourceManager should exist');
  });

  runner.test('timeManager exists', (t) => {
    t.assertNotNull(gameState.timeManager, 'timeManager should exist');
  });

  runner.test('npcManager exists', (t) => {
    t.assertNotNull(gameState.npcManager, 'npcManager should exist');
  });

  runner.test('saveManager exists', (t) => {
    t.assertNotNull(gameState.saveManager, 'saveManager should exist');
  });

  // ═══════════════════════════════════════════

  runner.suite('Resource Manager');

  runner.test('initial resources are valid', (t) => {
    const rm = gameState.resourceManager;
    t.assertNotNull(rm.resources, 'resources object should exist');

    ['electricidad', 'agua', 'legitimidad', 'autonomia'].forEach(res => {
      t.assertHasProperty(rm.resources, res, `Should have ${res}`);
      t.assertInRange(rm.resources[res], 0, 100, `${res} should be 0-100`);
    });
  });

  runner.test('resource set clamps values', (t) => {
    const rm = gameState.resourceManager;
    const original = rm.get('electricidad');

    rm.set('electricidad', 150);
    t.assertEqual(rm.get('electricidad'), 100, 'Should clamp to 100');

    rm.set('electricidad', -50);
    t.assertEqual(rm.get('electricidad'), 0, 'Should clamp to 0');

    rm.set('electricidad', original); // Restore
  });

  runner.test('resource modify works', (t) => {
    const rm = gameState.resourceManager;
    const original = rm.get('agua');

    rm.set('agua', 50);
    rm.modify('agua', 10);
    t.assertEqual(rm.get('agua'), 60, 'Should add 10');

    rm.modify('agua', -20);
    t.assertEqual(rm.get('agua'), 40, 'Should subtract 20');

    rm.set('agua', original); // Restore
  });

  // ═══════════════════════════════════════════

  runner.suite('Time Manager');

  runner.test('initial day is valid', (t) => {
    const tm = gameState.timeManager;
    t.assertNotNull(tm.currentDay, 'currentDay should exist');
    t.assertInRange(tm.currentDay, 1, 60, 'Day should be 1-60');
  });

  runner.test('max days is 60', (t) => {
    const tm = gameState.timeManager;
    t.assertEqual(tm.maxDays || 60, 60, 'Max days should be 60');
  });

  // ═══════════════════════════════════════════

  runner.suite('NPC Manager');

  runner.test('has 4 NPCs', (t) => {
    const nm = gameState.npcManager;
    t.assertNotNull(nm.npcs, 'npcs should exist');
    t.assertEqual(Object.keys(nm.npcs).length, 4, 'Should have 4 NPCs');
  });

  runner.test('all NPCs have required properties', (t) => {
    const nm = gameState.npcManager;
    const requiredProps = ['name', 'specialty', 'trust'];

    Object.values(nm.npcs).forEach(npc => {
      requiredProps.forEach(prop => {
        t.assertHasProperty(npc, prop, `NPC should have ${prop}`);
      });
    });
  });

  runner.test('NPC trust is in valid range', (t) => {
    const nm = gameState.npcManager;

    Object.values(nm.npcs).forEach(npc => {
      t.assertInRange(npc.trust, 0, 100, `${npc.name} trust should be 0-100`);
    });
  });
}

if (typeof window !== 'undefined') {
  window.runGameStateTests = runGameStateTests;
}
