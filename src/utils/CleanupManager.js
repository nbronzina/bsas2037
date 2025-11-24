// CleanupManager.js - Sistema de limpieza automática de scenes

class CleanupManager {

  // ═══════════════════════════════════════════
  // SCENE CLEANUP
  // ═══════════════════════════════════════════

  static cleanupScene(scene) {
    console.log(`🧹 Cleaning up scene: ${scene.scene.key}`);

    const stats = {
      tweensKilled: 0,
      timersRemoved: 0,
      listenersRemoved: 0
    };

    // 1. Stop all tweens
    if (scene.tweens) {
      stats.tweensKilled = scene.tweens.killAll();
    }

    // 2. Clear all timers
    if (scene.time) {
      const events = scene.time.removeAllEvents();
      stats.timersRemoved = events ? events.length : 0;
    }

    // 3. Remove input listeners
    if (scene.input) {
      scene.input.removeAllListeners();
      stats.listenersRemoved++;
    }

    // 4. Keyboard listeners
    if (scene.input && scene.input.keyboard) {
      scene.input.keyboard.removeAllListeners();
      stats.listenersRemoved++;
    }

    console.log(`🧹 Cleanup stats:`, stats);

    return stats;
  }

  // ═══════════════════════════════════════════
  // OBJECT CLEANUP
  // ═══════════════════════════════════════════

  static destroyChildren(container) {
    if (!container || !container.list) return 0;

    let count = 0;

    while (container.list.length > 0) {
      const child = container.list[0];
      if (child.destroy) {
        child.destroy();
        count++;
      }
    }

    return count;
  }

  static destroyArray(array) {
    if (!array || !Array.isArray(array)) return 0;

    let count = 0;

    array.forEach(obj => {
      if (obj && obj.destroy) {
        obj.destroy();
        count++;
      }
    });

    array.length = 0;

    return count;
  }

  // ═══════════════════════════════════════════
  // TWEEN CLEANUP
  // ═══════════════════════════════════════════

  static killTweensFor(scene, target) {
    if (!scene || !scene.tweens || !target) return 0;

    const tweens = scene.tweens.getTweensOf(target);

    tweens.forEach(tween => {
      tween.stop();
      tween.remove();
    });

    return tweens.length;
  }

  static killAllTweens(scene) {
    if (!scene || !scene.tweens) return 0;

    return scene.tweens.killAll();
  }

  // ═══════════════════════════════════════════
  // TIMER CLEANUP
  // ═══════════════════════════════════════════

  static clearTimers(scene) {
    if (!scene || !scene.time) return 0;

    const events = scene.time.removeAllEvents();
    return events ? events.length : 0;
  }

  // ═══════════════════════════════════════════
  // AUDIO CLEANUP
  // ═══════════════════════════════════════════

  static stopAllSounds(scene) {
    if (!scene || !scene.sound) return;

    scene.sound.stopAll();
  }

  // ═══════════════════════════════════════════
  // FULL CLEANUP
  // ═══════════════════════════════════════════

  static fullCleanup(scene, options = {}) {
    const results = {
      scene: scene.scene.key,
      timestamp: Date.now()
    };

    // Scene cleanup
    results.sceneStats = this.cleanupScene(scene);

    // Object pools (si existen)
    if (options.objectPool && scene.objectPool) {
      scene.objectPool.destroyAll();
      results.poolsDestroyed = true;
    }

    // Custom arrays (si se proveen)
    if (options.arrays) {
      results.arraysCleared = 0;
      options.arrays.forEach(arr => {
        results.arraysCleared += this.destroyArray(arr);
      });
    }

    // Audio
    if (options.stopAudio) {
      this.stopAllSounds(scene);
      results.audioStopped = true;
    }

    console.log(`🧹 Full cleanup complete:`, results);

    return results;
  }
}

if (typeof window !== 'undefined') {
  window.CleanupManager = CleanupManager;
}
