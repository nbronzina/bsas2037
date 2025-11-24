// PerformanceMonitor.js - Monitor de rendimiento (FPS, memoria, objetos)

class PerformanceMonitor {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.enabled = config.enabled !== false;
    this.showFPS = config.showFPS !== false;
    this.showMemory = config.showMemory || false;
    this.logInterval = config.logInterval || 5000; // Log cada 5 segundos

    this.fpsHistory = [];
    this.maxHistoryLength = 60;

    this.uiElements = {};

    if (this.enabled) {
      this.createUI();
      this.startMonitoring();
    }
  }

  // ═══════════════════════════════════════════
  // UI
  // ═══════════════════════════════════════════

  createUI() {
    const x = 10;
    const y = 10;

    // Background panel
    this.uiElements.bg = this.scene.add.rectangle(x + 60, y + 25, 130, 60, 0x000000, 0.7)
      .setOrigin(0.5)
      .setDepth(99999)
      .setScrollFactor(0);

    // FPS Text
    if (this.showFPS) {
      this.uiElements.fpsText = this.scene.add.text(x, y, 'FPS: --', {
        fontSize: '14px',
        color: '#00ff00',
        fontFamily: 'monospace'
      })
        .setDepth(100000)
        .setScrollFactor(0);
    }

    // Memory Text (si está disponible)
    if (this.showMemory && window.performance && window.performance.memory) {
      this.uiElements.memoryText = this.scene.add.text(x, y + 18, 'MEM: --', {
        fontSize: '14px',
        color: '#00ffff',
        fontFamily: 'monospace'
      })
        .setDepth(100000)
        .setScrollFactor(0);
    }

    // Objects count
    this.uiElements.objectsText = this.scene.add.text(x, y + 36, 'OBJ: --', {
      fontSize: '14px',
      color: '#ffff00',
      fontFamily: 'monospace'
    })
      .setDepth(100000)
      .setScrollFactor(0);
  }

  // ═══════════════════════════════════════════
  // MONITORING
  // ═══════════════════════════════════════════

  startMonitoring() {
    // Update loop
    this.scene.events.on('update', this.update, this);

    // Periodic logging
    this.logTimer = this.scene.time.addEvent({
      delay: this.logInterval,
      callback: this.logPerformance,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    if (!this.enabled) return;

    const fps = Math.round(this.scene.game.loop.actualFps);

    // Track FPS history
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.maxHistoryLength) {
      this.fpsHistory.shift();
    }

    // Update FPS display
    if (this.uiElements.fpsText) {
      const color = fps >= 55 ? '#00ff00' : fps >= 30 ? '#ffff00' : '#ff0000';
      this.uiElements.fpsText.setText(`FPS: ${fps}`);
      this.uiElements.fpsText.setColor(color);
    }

    // Update Memory display
    if (this.uiElements.memoryText && window.performance && window.performance.memory) {
      const usedMB = Math.round(window.performance.memory.usedJSHeapSize / 1048576);
      this.uiElements.memoryText.setText(`MEM: ${usedMB}MB`);
    }

    // Update Objects count
    if (this.uiElements.objectsText) {
      const objectCount = this.scene.children.list.length;
      this.uiElements.objectsText.setText(`OBJ: ${objectCount}`);
    }
  }

  // ═══════════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════════

  getAverageFPS() {
    if (this.fpsHistory.length === 0) return 0;

    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  getMinFPS() {
    if (this.fpsHistory.length === 0) return 0;
    return Math.min(...this.fpsHistory);
  }

  getMaxFPS() {
    if (this.fpsHistory.length === 0) return 0;
    return Math.max(...this.fpsHistory);
  }

  getStats() {
    return {
      currentFPS: Math.round(this.scene.game.loop.actualFps),
      averageFPS: this.getAverageFPS(),
      minFPS: this.getMinFPS(),
      maxFPS: this.getMaxFPS(),
      objectCount: this.scene.children.list.length,
      memory: window.performance && window.performance.memory
        ? Math.round(window.performance.memory.usedJSHeapSize / 1048576)
        : null
    };
  }

  logPerformance() {
    if (!gameState.debugMode) return;

    const stats = this.getStats();
    console.log(`📊 Performance: FPS ${stats.currentFPS} (avg: ${stats.averageFPS}, min: ${stats.minFPS}) | Objects: ${stats.objectCount}${stats.memory ? ` | Memory: ${stats.memory}MB` : ''}`);
  }

  // ═══════════════════════════════════════════
  // TOGGLE
  // ═══════════════════════════════════════════

  setEnabled(enabled) {
    this.enabled = enabled;

    // Toggle visibility
    Object.values(this.uiElements).forEach(el => {
      if (el && el.setVisible) {
        el.setVisible(enabled);
      }
    });
  }

  toggle() {
    this.setEnabled(!this.enabled);
  }

  // ═══════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════

  destroy() {
    this.scene.events.off('update', this.update, this);

    if (this.logTimer) {
      this.logTimer.remove();
    }

    Object.values(this.uiElements).forEach(el => {
      if (el && el.destroy) {
        el.destroy();
      }
    });

    this.uiElements = {};
    this.fpsHistory = [];
  }
}

if (typeof window !== 'undefined') {
  window.PerformanceMonitor = PerformanceMonitor;
}
