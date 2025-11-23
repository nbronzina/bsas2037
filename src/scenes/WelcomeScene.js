// WelcomeScene.js - Pantalla de bienvenida dentro del canvas

class WelcomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WelcomeScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Fondo oscuro
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Título grande
    this.add.text(width / 2, height * 0.35, 'RED DE AGUANTE', {
      fontFamily: 'Courier New',
      fontSize: '48px',
      color: '#d4a574',
      fontStyle: 'bold',
      letterSpacing: 6
    }).setOrigin(0.5);

    // Subtítulo
    this.add.text(width / 2, height * 0.45, 'Prototipo de investigación', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5);

    // Call to action con animación pulse
    const clickText = this.add.text(width / 2, height * 0.60, '[ CLICK PARA COMENZAR ]', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#d4a574',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Animación pulse
    this.tweens.add({
      targets: clickText,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Hint
    this.add.text(width / 2, height * 0.66, 'o presiona cualquier tecla', {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: '#666666'
    }).setOrigin(0.5);

    // Créditos
    const creditsY = height - 80;
    this.add.text(width / 2, creditsY, 'LAB de Mundanidad Forzada', {
      fontFamily: 'Courier New',
      fontSize: '13px',
      color: '#999999',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, creditsY + 20, 'en colaboración con', {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: '#777777'
    }).setOrigin(0.5);

    this.add.text(width / 2, creditsY + 38, 'Heated Studio', {
      fontFamily: 'Courier New',
      fontSize: '13px',
      color: '#999999',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, creditsY + 60, '© 2025 Todos los derechos reservados', {
      fontFamily: 'Courier New',
      fontSize: '11px',
      color: '#666666'
    }).setOrigin(0.5);

    // Click para comenzar
    this.input.once('pointerdown', () => this.startGame());

    // Cualquier tecla para comenzar
    this.input.keyboard.once('keydown', () => this.startGame());
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
