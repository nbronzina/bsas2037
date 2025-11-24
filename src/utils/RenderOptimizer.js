// RenderOptimizer.js - Utilidades para optimizar renderizado

class RenderOptimizer {

  // ═══════════════════════════════════════════
  // VISIBILITY CULLING
  // ═══════════════════════════════════════════

  // Ocultar objetos fuera de viewport
  static cullOffscreen(scene, objects, padding = 50) {
    const camera = scene.cameras.main;
    const bounds = camera.worldView;

    const cullBounds = {
      left: bounds.x - padding,
      right: bounds.x + bounds.width + padding,
      top: bounds.y - padding,
      bottom: bounds.y + bounds.height + padding
    };

    let culledCount = 0;

    objects.forEach(obj => {
      if (!obj || !obj.x || !obj.y) return;

      const isVisible = obj.x >= cullBounds.left &&
                       obj.x <= cullBounds.right &&
                       obj.y >= cullBounds.top &&
                       obj.y <= cullBounds.bottom;

      if (obj.visible !== isVisible) {
        obj.setVisible(isVisible);
        if (!isVisible) culledCount++;
      }
    });

    return culledCount;
  }

  // ═══════════════════════════════════════════
  // BATCH RENDERING
  // ═══════════════════════════════════════════

  // Agrupar sprites similares para batch rendering
  static optimizeForBatching(scene, sprites, textureKey) {
    // Ordenar sprites por textura para mejor batching
    sprites.sort((a, b) => {
      if (a.texture.key === textureKey) return -1;
      if (b.texture.key === textureKey) return 1;
      return 0;
    });
  }

  // ═══════════════════════════════════════════
  // REDUCE DRAW CALLS
  // ═══════════════════════════════════════════

  // Convertir múltiples objetos estáticos en una textura
  static bakeToTexture(scene, objects, key, width, height) {
    // Crear render texture
    const rt = scene.add.renderTexture(0, 0, width, height);

    // Dibujar todos los objetos
    objects.forEach(obj => {
      rt.draw(obj, obj.x, obj.y);
    });

    // Guardar como textura
    rt.saveTexture(key);

    // Destruir objetos originales
    objects.forEach(obj => {
      if (obj.destroy) obj.destroy();
    });

    // Retornar sprite con textura baked
    const bakedSprite = scene.add.sprite(width/2, height/2, key);

    rt.destroy();

    return bakedSprite;
  }

  // ═══════════════════════════════════════════
  // TEXT OPTIMIZATION
  // ═══════════════════════════════════════════

  // Cache texto que no cambia frecuentemente
  static cacheText(scene, textObject, key) {
    // Convertir texto a textura para mejor rendimiento
    const bounds = textObject.getBounds();

    const rt = scene.add.renderTexture(0, 0, bounds.width + 10, bounds.height + 10);
    rt.draw(textObject, 5, 5);
    rt.saveTexture(key);

    const cachedSprite = scene.add.sprite(textObject.x, textObject.y, key);
    cachedSprite.setOrigin(textObject.originX, textObject.originY);

    textObject.destroy();
    rt.destroy();

    return cachedSprite;
  }

  // ═══════════════════════════════════════════
  // PARTICLE OPTIMIZATION
  // ═══════════════════════════════════════════

  // Limitar partículas activas
  static limitParticles(emitter, maxParticles = 100) {
    if (emitter.getAliveParticleCount && emitter.getAliveParticleCount() > maxParticles) {
      emitter.killAll();
    }
  }

  // ═══════════════════════════════════════════
  // ANIMATION OPTIMIZATION
  // ═══════════════════════════════════════════

  // Pausar animaciones fuera de vista
  static pauseOffscreenAnimations(scene, animatedObjects) {
    const camera = scene.cameras.main;
    const bounds = camera.worldView;

    animatedObjects.forEach(obj => {
      if (!obj.anims) return;

      const isInView = Phaser.Geom.Rectangle.Contains(bounds, obj.x, obj.y);

      if (isInView && obj.anims.isPaused) {
        obj.anims.resume();
      } else if (!isInView && !obj.anims.isPaused) {
        obj.anims.pause();
      }
    });
  }

  // ═══════════════════════════════════════════
  // REDUCE MOTION
  // ═══════════════════════════════════════════

  // Reducir animaciones si reduce motion está activo
  static applyReduceMotion(scene, config = {}) {
    if (!gameState.accessibilityManager?.shouldReduceMotion()) {
      return false;
    }

    // Reducir FPS de animaciones
    if (config.animations) {
      config.animations.forEach(anim => {
        anim.frameRate = Math.min(anim.frameRate, 10);
      });
    }

    // Desactivar partículas
    if (config.particles) {
      config.particles.forEach(emitter => {
        emitter.stop();
      });
    }

    return true;
  }
}

if (typeof window !== 'undefined') {
  window.RenderOptimizer = RenderOptimizer;
}
