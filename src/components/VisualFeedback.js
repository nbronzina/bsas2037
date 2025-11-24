// VisualFeedback.js - Sistema de feedback visual para el juego

class VisualFeedback {

  // Mostrar cambio de recurso (+/- flotante)
  static showResourceChange(scene, x, y, amount, resourceType = null) {
    const sign = amount > 0 ? '+' : '';
    const color = amount > 0 ? '#4CAF50' : '#FF5252';

    // Icono del recurso (opcional)
    let prefix = '';
    if (resourceType) {
      const icons = {
        electricidad: '⚡',
        agua: '💧',
        legitimidad: '🤝',
        autonomia: '🏴',
        creditos: '💰'
      };
      prefix = icons[resourceType] || '';
    }

    const text = scene.add.text(x, y, `${prefix}${sign}${amount}`, {
      fontSize: '20px',
      color: color,
      fontStyle: 'bold',
      fontFamily: 'Courier New',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(9999);

    // Animación: subir y desaparecer
    scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
      }
    });

    return text;
  }

  // Alerta de crisis (recurso crítico)
  static showCrisisAlert(scene, resourceName) {
    const width = scene.cameras.main.width;

    // Flash rojo
    scene.cameras.main.flash(400, 255, 50, 50, true);

    // Shake leve
    scene.cameras.main.shake(300, 0.008);

    // Texto de alerta
    const alertText = scene.add.text(width / 2, 100, `⚠️ ${resourceName.toUpperCase()} CRÍTICO`, {
      fontSize: '28px',
      color: '#FF5252',
      fontStyle: 'bold',
      fontFamily: 'Courier New',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(9999).setAlpha(0);

    // Animación entrada
    scene.tweens.add({
      targets: alertText,
      alpha: 1,
      duration: 200,
      onComplete: () => {
        // Pulsar
        scene.tweens.add({
          targets: alertText,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 200,
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            // Fade out
            scene.tweens.add({
              targets: alertText,
              alpha: 0,
              y: alertText.y - 30,
              duration: 800,
              delay: 1500,
              onComplete: () => alertText.destroy()
            });
          }
        });
      }
    });

    // SFX
    if (gameState.audioManager) {
      gameState.audioManager.playAlertSound();
    }

    return alertText;
  }

  // Transición de nuevo día
  static showDayTransition(scene, dayNumber, callback) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;

    // Overlay negro
    const overlay = scene.add.rectangle(
      width / 2, height / 2,
      width, height,
      0x000000, 0
    ).setDepth(10000);

    // Fade to black
    scene.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 400,
      onComplete: () => {
        // Texto del día
        const dayText = scene.add.text(width / 2, height / 2, `DÍA ${dayNumber}`, {
          fontSize: '48px',
          color: '#ffd700',
          fontStyle: 'bold',
          fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(10001).setAlpha(0);

        // Subtexto según día
        let subtitle = '';
        if (dayNumber === 1) subtitle = 'Comienza la autogestión';
        else if (dayNumber === 30) subtitle = 'Mitad del camino';
        else if (dayNumber === 60) subtitle = 'El día final';
        else if (dayNumber % 7 === 0) subtitle = 'Día de asamblea';

        const subtitleText = scene.add.text(width / 2, height / 2 + 50, subtitle, {
          fontSize: '20px',
          color: '#ffffff',
          fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(10001).setAlpha(0);

        // Fade in texto
        scene.tweens.add({
          targets: [dayText, subtitleText],
          alpha: 1,
          duration: 400,
          onComplete: () => {
            // Esperar y fade out
            scene.time.delayedCall(1200, () => {
              scene.tweens.add({
                targets: [overlay, dayText, subtitleText],
                alpha: 0,
                duration: 400,
                onComplete: () => {
                  overlay.destroy();
                  dayText.destroy();
                  subtitleText.destroy();
                  if (callback) callback();
                }
              });
            });
          }
        });
      }
    });

    // SFX
    if (gameState.audioManager) {
      gameState.audioManager.playTimeAdvanceSound();
    }
  }

  // Notificación de éxito
  static showSuccess(scene, message, x, y) {
    const successText = scene.add.text(x, y, `✅ ${message}`, {
      fontSize: '16px',
      color: '#4CAF50',
      fontFamily: 'Courier New',
      backgroundColor: '#1a1a1a',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setDepth(9999).setAlpha(0);

    // Pop in
    successText.setScale(0.5);
    scene.tweens.add({
      targets: successText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Fade out después de 2 segundos
        scene.time.delayedCall(2000, () => {
          scene.tweens.add({
            targets: successText,
            alpha: 0,
            y: y - 20,
            duration: 500,
            onComplete: () => successText.destroy()
          });
        });
      }
    });

    if (gameState.audioManager) {
      gameState.audioManager.playConfirmSound();
    }

    return successText;
  }

  // Highlight de elemento (para tutorial o énfasis)
  static highlightElement(scene, element, duration = 2000) {
    const bounds = element.getBounds();

    // Crear overlay con hueco
    const overlay = scene.add.graphics().setDepth(9998);
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, scene.cameras.main.width, scene.cameras.main.height);

    // Limpiar área del elemento
    overlay.fillStyle(0x000000, 0);
    overlay.fillRect(bounds.x - 10, bounds.y - 10, bounds.width + 20, bounds.height + 20);

    // Borde brillante
    const border = scene.add.rectangle(
      bounds.centerX, bounds.centerY,
      bounds.width + 20, bounds.height + 20,
      0x000000, 0
    ).setStrokeStyle(3, 0xffd700).setDepth(9999);

    // Pulsar borde
    scene.tweens.add({
      targets: border,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Auto-remover después de duration
    scene.time.delayedCall(duration, () => {
      scene.tweens.add({
        targets: [overlay, border],
        alpha: 0,
        duration: 300,
        onComplete: () => {
          overlay.destroy();
          border.destroy();
        }
      });
    });

    return { overlay, border };
  }

  // Partículas de celebración
  static showCelebration(scene, x, y, count = 20) {
    const colors = [0xffd700, 0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4];

    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particle = scene.add.circle(x, y, Phaser.Math.Between(3, 8), color)
        .setDepth(9999);

      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = Phaser.Math.Between(80, 150);
      const targetX = x + Math.cos(angle) * speed;
      const targetY = y + Math.sin(angle) * speed - 50; // Sesgo hacia arriba

      scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: Phaser.Math.Between(800, 1200),
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }
}

if (typeof window !== 'undefined') {
  window.VisualFeedback = VisualFeedback;
}
