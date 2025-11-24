// TestRunner.js - Framework de testing para Red de Aguante

class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
    this.currentSuite = 'default';
  }

  // ═══════════════════════════════════════════
  // TEST REGISTRATION
  // ═══════════════════════════════════════════

  suite(name) {
    this.currentSuite = name;
    console.log(`\n📋 Test Suite: ${name}`);
    console.log('─'.repeat(40));
  }

  test(name, testFn) {
    this.tests.push({
      name: name,
      suite: this.currentSuite,
      fn: testFn
    });
  }

  // ═══════════════════════════════════════════
  // ASSERTIONS
  // ═══════════════════════════════════════════

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  assertNotNull(value, message) {
    if (value === null || value === undefined) {
      throw new Error(message || 'Value is null or undefined');
    }
  }

  assertInRange(value, min, max, message) {
    if (value < min || value > max) {
      throw new Error(message || `Value ${value} not in range [${min}, ${max}]`);
    }
  }

  assertArrayLength(array, length, message) {
    if (!Array.isArray(array) || array.length !== length) {
      throw new Error(message || `Expected array length ${length}, got ${array?.length}`);
    }
  }

  assertHasProperty(obj, prop, message) {
    if (!obj || !obj.hasOwnProperty(prop)) {
      throw new Error(message || `Object missing property: ${prop}`);
    }
  }

  // ═══════════════════════════════════════════
  // RUN TESTS
  // ═══════════════════════════════════════════

  async run() {
    console.log('\n🧪 RUNNING TESTS...\n');
    console.log('═'.repeat(50));

    const startTime = Date.now();

    for (const test of this.tests) {
      try {
        await test.fn(this);
        this.results.passed++;
        console.log(`  ✅ ${test.name}`);
      } catch (error) {
        this.results.failed++;
        this.results.errors.push({
          test: test.name,
          suite: test.suite,
          error: error.message
        });
        console.log(`  ❌ ${test.name}`);
        console.log(`     └─ ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;

    this.printSummary(duration);

    return this.results;
  }

  printSummary(duration) {
    console.log('\n' + '═'.repeat(50));
    console.log('📊 TEST RESULTS');
    console.log('─'.repeat(50));
    console.log(`  ✅ Passed:  ${this.results.passed}`);
    console.log(`  ❌ Failed:  ${this.results.failed}`);
    console.log(`  ⏭️  Skipped: ${this.results.skipped}`);
    console.log(`  ⏱️  Time:    ${duration}ms`);
    console.log('─'.repeat(50));

    if (this.results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED!');
    } else {
      console.log('⚠️  SOME TESTS FAILED');
      console.log('\nFailed tests:');
      this.results.errors.forEach(err => {
        console.log(`  • [${err.suite}] ${err.test}: ${err.error}`);
      });
    }

    console.log('═'.repeat(50) + '\n');
  }

  // ═══════════════════════════════════════════
  // RESET
  // ═══════════════════════════════════════════

  reset() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
    this.currentSuite = 'default';
  }
}

if (typeof window !== 'undefined') {
  window.TestRunner = TestRunner;
}
