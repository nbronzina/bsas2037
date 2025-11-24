// SceneTransitions.js - Utilidades para transiciones visuales entre escenas

class SceneTransitions {
  // Fade out de escena actual
  static fadeOut(scene, duration = 500, callback) {
    const camera = scene.cameras.main;
    camera.fadeOut(duration, 0, 0, 0);

    camera.once('camerafadeoutcomplete', () => {
      if (callback) callback();
    });
  }

  // Fade in de escena
  static fadeIn(scene, duration = 500, callback) {
    const camera = scene.cameras.main;
    camera.fadeIn(duration, 0, 0, 0);

    if (callback) {
      camera.once('camerafadeincomplete', callback);
    }
  }

  // Transición completa entre escenas
  static fadeToScene(currentScene, targetSceneKey, data = {}, duration = 500) {
    this.fadeOut(currentScene, duration, () => {
      currentScene.scene.start(targetSceneKey, data);
    });
  }

  // Slide in desde dirección
  static slideIn(element, direction = 'left', duration = 300, ease = 'Power2') {
    const scene = element.scene;
    const width = scene.cameras.main.width;
    const startX = direction === 'left' ? -200 : width + 200;
    const targetX = element.x;

    element.x = startX;
    element.alpha = 0;

    scene.tweens.add({
      targets: element,
      x: targetX,
      alpha: 1,
      duration: duration,
      ease: ease
    });
  }

  // Slide out hacia dirección
  static slideOut(element, direction = 'left', duration = 300, callback) {
    const scene = element.scene;
    const width = scene.cameras.main.width;
    const targetX = direction === 'left' ? -200 : width + 200;

    scene.tweens.add({
      targets: element,
      x: targetX,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: callback
    });
  }

  // Pulse scale (para destacar elementos)
  static pulseScale(element, scale = 1.1, duration = 200) {
    const scene = element.scene;

    scene.tweens.add({
      targets: element,
      scaleX: scale,
      scaleY: scale,
      duration: duration,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  // Shake (para alertas/errores)
  static shake(element, intensity = 5, duration = 300) {
    const scene = element.scene;
    const originalX = element.x;

    scene.tweens.add({
      targets: element,
      x: originalX + intensity,
      duration: duration / 8,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        element.x = originalX;
      }
    });
  }

  // Pop in (aparecer con bounce)
  static popIn(element, duration = 400) {
    const scene = element.scene;

    element.setScale(0);
    element.setAlpha(1);

    scene.tweens.add({
      targets: element,
      scaleX: 1,
      scaleY: 1,
      duration: duration,
      ease: 'Back.easeOut'
    });
  }

  // Pop out (desaparecer con shrink)
  static popOut(element, duration = 300, callback) {
    const scene = element.scene;

    scene.tweens.add({
      targets: element,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: duration,
      ease: 'Back.easeIn',
      onComplete: callback
    });
  }

  // Float up and fade (para texto +/-)
  static floatUpAndFade(element, distance = 50, duration = 1000) {
    const scene = element.scene;
    const startY = element.y;

    scene.tweens.add({
      targets: element,
      y: startY - distance,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: () => {
        element.destroy();
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.SceneTransitions = SceneTransitions;
}
