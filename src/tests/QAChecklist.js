// QAChecklist.js - Checklist interactivo de QA

class QAChecklist {
  constructor() {
    this.checks = [];
    this.results = {};
  }

  generateChecklist() {
    this.checks = [
      // Core Gameplay
      { category: 'Core Gameplay', item: 'Resources decay each day', status: 'pending' },
      { category: 'Core Gameplay', item: 'Resources clamped 0-100', status: 'pending' },
      { category: 'Core Gameplay', item: 'Day counter works (1-60)', status: 'pending' },
      { category: 'Core Gameplay', item: 'NPCs are interactable', status: 'pending' },
      { category: 'Core Gameplay', item: 'Tasks can be assigned', status: 'pending' },
      { category: 'Core Gameplay', item: 'Tasks complete after duration', status: 'pending' },

      // Content
      { category: 'Content', item: 'All 20 scripted encounters work', status: 'pending' },
      { category: 'Content', item: 'Random events trigger correctly', status: 'pending' },
      { category: 'Content', item: 'NPC arcs evolve over time', status: 'pending' },
      { category: 'Content', item: 'Achievements unlock correctly', status: 'pending' },
      { category: 'Content', item: 'Memoria colectiva records events', status: 'pending' },
      { category: 'Content', item: 'All 8 endings are reachable', status: 'pending' },

      // Systems
      { category: 'Systems', item: 'Save works', status: 'pending' },
      { category: 'Systems', item: 'Load works', status: 'pending' },
      { category: 'Systems', item: 'Tutorial appears on first play', status: 'pending' },
      { category: 'Systems', item: 'Tutorial can be skipped', status: 'pending' },
      { category: 'Systems', item: 'Music plays', status: 'pending' },
      { category: 'Systems', item: 'SFX play on interactions', status: 'pending' },
      { category: 'Systems', item: 'Volume controls work', status: 'pending' },

      // Visual
      { category: 'Visual', item: 'Scene transitions smooth', status: 'pending' },
      { category: 'Visual', item: 'Button hover effects work', status: 'pending' },
      { category: 'Visual', item: 'Resource change feedback shows', status: 'pending' },
      { category: 'Visual', item: 'Achievement notifications appear', status: 'pending' },
      { category: 'Visual', item: 'No visual glitches', status: 'pending' },

      // Accessibility
      { category: 'Accessibility', item: 'ESC pauses game', status: 'pending' },
      { category: 'Accessibility', item: 'Tab navigation works', status: 'pending' },
      { category: 'Accessibility', item: 'High contrast mode works', status: 'pending' },
      { category: 'Accessibility', item: 'Text size options work', status: 'pending' },

      // Performance
      { category: 'Performance', item: 'FPS stable >30', status: 'pending' },
      { category: 'Performance', item: 'No memory leaks', status: 'pending' },
      { category: 'Performance', item: 'Load time <5 seconds', status: 'pending' },

      // Critical
      { category: 'Critical', item: 'No crashes during 60-day run', status: 'pending' },
      { category: 'Critical', item: 'No soft-locks', status: 'pending' },
      { category: 'Critical', item: 'All scenes accessible', status: 'pending' }
    ];

    return this.checks;
  }

  markComplete(index, passed) {
    if (this.checks[index]) {
      this.checks[index].status = passed ? 'passed' : 'failed';
    }
  }

  printChecklist() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║          QA CHECKLIST - RED DE AGUANTE             ║');
    console.log('╚════════════════════════════════════════════════════╝');

    let currentCategory = '';

    this.checks.forEach((check, index) => {
      if (check.category !== currentCategory) {
        currentCategory = check.category;
        console.log(`\n📋 ${currentCategory}`);
        console.log('─'.repeat(40));
      }

      const icon = check.status === 'passed' ? '✅' :
                   check.status === 'failed' ? '❌' : '⬜';

      console.log(`  ${icon} ${check.item}`);
    });

    const passed = this.checks.filter(c => c.status === 'passed').length;
    const failed = this.checks.filter(c => c.status === 'failed').length;
    const pending = this.checks.filter(c => c.status === 'pending').length;

    console.log('\n' + '═'.repeat(50));
    console.log(`Summary: ✅ ${passed} passed | ❌ ${failed} failed | ⬜ ${pending} pending`);
    console.log('═'.repeat(50) + '\n');
  }

  exportToMarkdown() {
    let md = '# QA Checklist - Red de Aguante\n\n';

    let currentCategory = '';

    this.checks.forEach(check => {
      if (check.category !== currentCategory) {
        currentCategory = check.category;
        md += `\n## ${currentCategory}\n\n`;
      }

      const checkbox = check.status === 'passed' ? '[x]' :
                       check.status === 'failed' ? '[!]' : '[ ]';

      md += `- ${checkbox} ${check.item}\n`;
    });

    return md;
  }
}

if (typeof window !== 'undefined') {
  window.QAChecklist = QAChecklist;

  // Create global instance
  window.qaChecklist = new QAChecklist();
  window.qaChecklist.generateChecklist();
}
