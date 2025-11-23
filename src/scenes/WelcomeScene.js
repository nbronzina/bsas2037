// WelcomeScene.js - Pantalla de bienvenida dentro del canvas

import { createGameLogo } from '../utils/LogoHelper.js';

class WelcomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WelcomeScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Fondo oscuro
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // === LOGO ===
    const centerX = width / 2;
    const centerY = height / 2;

    const logo = createGameLogo(this, centerX, centerY - 80, true);

    // Fade-in animation
    logo.setAlpha(0);
    this.tweens.add({
      targets: logo,
      alpha: 1,
      duration: 1000,
      ease: 'Power2'
    });

    // Subtítulo
    const subtitle = this.add.text(
      centerX,
      centerY + 40,
      'Prototipo de investigación',
      {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#888888'
      }
    ).setOrigin(0.5);

    // Fade-in subtitle
    subtitle.setAlpha(0);
    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 1000,
      delay: 500,
      ease: 'Power2'
    });

    // === BOTÓN COMENZAR ===
    const startText = this.add.text(
      centerX,
      centerY + 120,
      '[ CLICK PARA COMENZAR ]',
      {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#d4a574'
      }
    ).setOrigin(0.5);

    startText.setInteractive({ useHandCursor: true });

    // Animación parpadeo
    this.tweens.add({
      targets: startText,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Click para avanzar
    startText.on('pointerdown', () => {
      console.log('Start button clicked');
      this.startGame();
    });

    // === HINT ===
    const credits = this.add.text(
      centerX,
      height - 40,
      'o presiona cualquier tecla',
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#666666'
      }
    ).setOrigin(0.5);

    // === CRÉDITOS ===

    // Posición base - centrada (igual que MainMenuScene)
    const centerX = width / 2;
    const creditsStartY = height - 100;

    // Línea separadora sutil (igual que MainMenuScene)
    this.add.rectangle(centerX, creditsStartY - 20, width * 0.5, 1, 0x444444)
        .setOrigin(0.5, 0);

    // Desarrollado por
    this.add.text(centerX, creditsStartY, 'Desarrollado por', {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: '#d4a574',
        align: 'center'
    }).setOrigin(0.5);

    // LAB de Mundanidad Forzada
    this.add.text(centerX, creditsStartY + 18, 'LAB de Mundanidad Forzada', {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#cccccc',
        fontStyle: 'bold',
        align: 'center'
    }).setOrigin(0.5);

    // En colaboración con
    this.add.text(centerX, creditsStartY + 38, 'En colaboración con', {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: '#d4a574',
        align: 'center'
    }).setOrigin(0.5);

    // Heated Studio
    this.add.text(centerX, creditsStartY + 56, 'Heated Studio', {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#cccccc',
        fontStyle: 'bold',
        align: 'center'
    }).setOrigin(0.5);

    // Copyright
    this.add.text(centerX, creditsStartY + 80, '© 2025 Todos los derechos reservados', {
        fontFamily: 'Courier New',
        fontSize: '11px',
        color: '#777777',
        align: 'center'
    }).setOrigin(0.5);

    // Cualquier tecla para comenzar
    this.input.keyboard.once('keydown', () => {
      console.log('Key pressed - advancing to menu');
      this.startGame();
    });

    console.log('WelcomeScene created with logo');
  }

  startGame() {
    // Iniciar/resumir audio
    if (gameState.audioManager && gameState.audioManager.audioContext) {
      gameState.audioManager.audioContext.resume().then(() => {
        gameState.audioManager.playMenuTheme();
      });
    }

    // Fade out y cambiar a MainMenu
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenuScene');
    });
  }
}
