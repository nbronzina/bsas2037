// SystemTests.js - Tests para los sistemas del juego

function runSystemTests(runner) {

  runner.suite('Save/Load System');

  runner.test('saveManager exists', (t) => {
    t.assertNotNull(gameState.saveManager, 'saveManager should exist');
  });

  runner.test('can save game', (t) => {
    const sm = gameState.saveManager;

    // Attempt save
    const result = sm.save();
    t.assert(result !== false, 'Save should not return false');

    // Check localStorage
    const saved = localStorage.getItem('redDeAguante_save');
    t.assertNotNull(saved, 'Save data should exist in localStorage');
  });

  runner.test('can load game', (t) => {
    const sm = gameState.saveManager;

    // First save
    sm.save();

    // Load
    const result = sm.load();
    t.assert(result !== false, 'Load should not return false');
  });

  runner.test('save data has required fields', (t) => {
    const saved = localStorage.getItem('redDeAguante_save');

    if (!saved) {
      gameState.saveManager.save();
    }

    const data = JSON.parse(localStorage.getItem('redDeAguante_save'));

    t.assertHasProperty(data, 'resources', 'Save should have resources');
    t.assertHasProperty(data, 'day', 'Save should have day');
    t.assertHasProperty(data, 'npcs', 'Save should have npcs');
  });

  // ═══════════════════════════════════════════

  runner.suite('Audio System');

  runner.test('audioManager exists', (t) => {
    t.assertNotNull(gameState.audioManager, 'audioManager should exist');
  });

  runner.test('audio preferences persist', (t) => {
    const am = gameState.audioManager;

    const originalVolume = am.musicVolume;
    am.setMusicVolume(0.3);
    am.savePreferences();

    // Reload preferences
    am.loadPreferences();
    t.assertEqual(am.musicVolume, 0.3, 'Volume should persist');

    // Restore
    am.setMusicVolume(originalVolume);
  });

  // ═══════════════════════════════════════════

  runner.suite('Tutorial System');

  runner.test('tutorialFlags exist', (t) => {
    t.assertNotNull(gameState.tutorialFlags, 'tutorialFlags should exist');
  });

  runner.test('tutorial flags have expected keys', (t) => {
    const flags = gameState.tutorialFlags;
    const expectedKeys = ['tutorial_skipped', 'tutorial_recursos_visto'];

    expectedKeys.forEach(key => {
      t.assertHasProperty(flags, key, `Should have flag: ${key}`);
    });
  });

  // ═══════════════════════════════════════════

  runner.suite('Accessibility System');

  runner.test('accessibilityManager exists', (t) => {
    t.assertNotNull(gameState.accessibilityManager, 'accessibilityManager should exist');
  });

  runner.test('accessibility settings persist', (t) => {
    const am = gameState.accessibilityManager;

    const original = am.isHighContrast();
    am.setHighContrast(true);

    // Check it's set
    t.assertEqual(am.isHighContrast(), true, 'High contrast should be true');

    // Restore
    am.setHighContrast(original);
  });

  runner.test('text size scaling works', (t) => {
    const am = gameState.accessibilityManager;

    const normal = am.getFontSize(16);
    am.setTextSize('large');
    const large = am.getFontSize(16);

    t.assert(large > normal, 'Large should be bigger than normal');

    // Restore
    am.setTextSize('normal');
  });
}

if (typeof window !== 'undefined') {
  window.runSystemTests = runSystemTests;
}
