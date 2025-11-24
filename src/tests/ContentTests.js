// ContentTests.js - Tests para el contenido del juego

function runContentTests(runner) {

  runner.suite('Encounters');

  runner.test('encounters data loaded', (t) => {
    t.assertNotNull(gameState.encounterManager, 'encounterManager should exist');
    t.assertNotNull(gameState.encounterManager.encounters, 'encounters should exist');
  });

  runner.test('encounters have required structure', (t) => {
    const encounters = gameState.encounterManager?.encounters || [];

    if (encounters.length === 0) {
      throw new Error('No encounters loaded');
    }

    const requiredProps = ['id', 'title', 'description', 'options'];

    encounters.slice(0, 5).forEach(enc => { // Test first 5
      requiredProps.forEach(prop => {
        t.assertHasProperty(enc, prop, `Encounter should have ${prop}`);
      });

      t.assert(enc.options.length >= 2, 'Encounter should have at least 2 options');
    });
  });

  runner.test('encounter options have text', (t) => {
    const encounters = gameState.encounterManager?.encounters || [];

    encounters.slice(0, 5).forEach(enc => {
      enc.options.forEach(opt => {
        t.assertHasProperty(opt, 'text', 'Option should have text');
      });
    });
  });

  // ═══════════════════════════════════════════

  runner.suite('Random Events');

  runner.test('randomEventManager exists', (t) => {
    t.assertNotNull(gameState.randomEventManager, 'randomEventManager should exist');
  });

  runner.test('random events loaded', (t) => {
    const rem = gameState.randomEventManager;
    t.assertNotNull(rem.events, 'events should exist');
    t.assert(rem.events.length >= 10, 'Should have at least 10 random events');
  });

  // ═══════════════════════════════════════════

  runner.suite('Achievements');

  runner.test('achievementManager exists', (t) => {
    t.assertNotNull(gameState.achievementManager, 'achievementManager should exist');
  });

  runner.test('achievements loaded', (t) => {
    const am = gameState.achievementManager;
    t.assertNotNull(am.achievements, 'achievements should exist');
    t.assert(Object.keys(am.achievements).length >= 15, 'Should have at least 15 achievements');
  });

  runner.test('achievements have required properties', (t) => {
    const am = gameState.achievementManager;
    const requiredProps = ['id', 'name', 'description'];

    Object.values(am.achievements).slice(0, 5).forEach(ach => {
      requiredProps.forEach(prop => {
        t.assertHasProperty(ach, prop, `Achievement should have ${prop}`);
      });
    });
  });

  // ═══════════════════════════════════════════

  runner.suite('Memoria Colectiva');

  runner.test('memoriaColectiva exists', (t) => {
    t.assertNotNull(gameState.memoriaColectiva, 'memoriaColectiva should exist');
  });

  runner.test('memoria has fragments array', (t) => {
    const mc = gameState.memoriaColectiva;
    t.assertNotNull(mc.fragments, 'fragments should exist');
    t.assert(Array.isArray(mc.fragments), 'fragments should be array');
  });

  // ═══════════════════════════════════════════

  runner.suite('NPC Arcs');

  runner.test('NPCs have arc data', (t) => {
    const nm = gameState.npcManager;

    Object.values(nm.npcs).forEach(npc => {
      t.assertHasProperty(npc, 'arcStage', `${npc.name} should have arcStage`);
      t.assertInRange(npc.arcStage, 1, 3, `${npc.name} arcStage should be 1-3`);
    });
  });
}

if (typeof window !== 'undefined') {
  window.runContentTests = runContentTests;
}
