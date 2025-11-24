// RunAllTests.js - Ejecutor principal de tests

async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     RED DE AGUANTE - FINAL QA TEST SUITE           ║');
  console.log('╚════════════════════════════════════════════════════╝');

  const runner = new TestRunner();

  // Run all test suites
  try {
    runGameStateTests(runner);
    runContentTests(runner);
    runSystemTests(runner);
    runIntegrationTests(runner);
  } catch (error) {
    console.error('Error loading test suites:', error);
  }

  // Execute tests
  const results = await runner.run();

  // Run playtest simulation if unit tests pass
  if (results.failed === 0) {
    console.log('\n📌 Unit tests passed. Running playtest simulation...\n');

    const simulation = new PlaytestSimulation();
    const simResults = await simulation.simulateFullGame({ maxDays: 60 });

    if (simResults.success) {
      console.log('\n✅ ALL TESTS AND SIMULATION PASSED!');
      console.log('🚀 MVP IS READY FOR DEPLOY!\n');
    } else {
      console.log('\n⚠️  Simulation encountered errors. Review before deploy.\n');
    }
  } else {
    console.log('\n❌ Unit tests failed. Fix issues before running simulation.\n');
  }

  return results;
}

// Keyboard shortcut to run tests
document.addEventListener('keydown', (e) => {
  // F5 to run tests (in debug mode)
  if (e.key === 'F5' && gameState.debugMode) {
    e.preventDefault();
    runAllTests();
  }
});

// Export for console access
if (typeof window !== 'undefined') {
  window.runAllTests = runAllTests;
  window.runQuickTest = () => {
    const runner = new TestRunner();
    runGameStateTests(runner);
    return runner.run();
  };
}
