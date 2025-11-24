// ThanksScene.js - Pantalla de agradecimiento y créditos finales

class ThanksScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ThanksScene' });
  }

  create() {
    const centerX = GAME_CONFIG.width / 2;
    const centerY = GAME_CONFIG.height / 2;

    // Fondo oscuro
    this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x1a1a1a, 1).setOrigin(0, 0);

    // Título principal
    this.add.text(centerX, 60, 'GRACIAS POR JUGAR', {
      fontFamily: 'Courier New',
      fontSize: '32px',
      color: '#d4a574',
      fontStyle: 'bold',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Separador
    this.add.rectangle(centerX, 110, 400, 2, 0x555555).setOrigin(0.5);

    // Mensaje principal
    const mainMessage = `'Red de Aguante' es un prototipo de investigación
del LAB de Mundanidad Forzada.

Este juego explora futuros posibles desde contextos
latinoamericanos, usando restricciones reales
como material de diseño.

No predice. No prescribe.
Observa lo que ya está aquí.`;

    this.add.text(centerX, 160, mainMessage, {
      fontFamily: 'Courier New',
      fontSize: '15px',
      color: '#cccccc',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5, 0);

    // Separador
    this.add.rectangle(centerX, 340, 400, 2, 0x555555).setOrigin(0.5);

    // Créditos
    this.add.text(centerX, 370, 'CRÉDITOS', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#d4a574',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const credits = `Desarrollo: LAB de Mundanidad Forzada
Colaboración: Heated Studio
Implementación técnica: Claude (Anthropic)
Framework: Phaser 3`;

    this.add.text(centerX, 410, credits, {
      fontFamily: 'Courier New',
      fontSize: '13px',
      color: '#aaaaaa',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5, 0);

    // Separador
    this.add.rectangle(centerX, 500, 400, 2, 0x555555).setOrigin(0.5);

    // Botones
    const buttonY = 540;

    // Botón "Volver a inicio"
    const menuButton = this.add.text(
      centerX - 120,
      buttonY,
      '[ Volver a inicio ]',
      {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#d4a574',
        backgroundColor: '#000000',
        padding: { x: 12, y: 6 }
      }
    ).setOrigin(0.5);

    menuButton.setDepth(100);
    menuButton.setInteractive({ useHandCursor: true });

    menuButton.on('pointerover', () => {
      menuButton.setColor('#ffffff');
      menuButton.setScale(1.05);
    });

    menuButton.on('pointerout', () => {
      menuButton.setColor('#d4a574');
      menuButton.setScale(1);
    });

    menuButton.on('pointerdown', () => {
      console.log('Going to MainMenuScene from ThanksScene');
      this.goToMenu();
    });

    // Botón "Cerrar"
    const closeButton = this.add.text(
      centerX + 120,
      buttonY,
      '[ Cerrar ]',
      {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#d4a574',
        backgroundColor: '#000000',
        padding: { x: 12, y: 6 }
      }
    ).setOrigin(0.5);

    closeButton.setDepth(100);
    closeButton.setInteractive({ useHandCursor: true });

    closeButton.on('pointerover', () => {
      closeButton.setColor('#ffffff');
      closeButton.setScale(1.05);
    });

    closeButton.on('pointerout', () => {
      closeButton.setColor('#d4a574');
      closeButton.setScale(1);
    });

    closeButton.on('pointerdown', () => {
      console.log('Closing game from ThanksScene');
      window.close();
      // Si no se puede cerrar, volver a WelcomeScene
      this.time.delayedCall(100, () => {
        this.goToWelcome();
      });
    });

    // Copyright
    this.add.text(centerX, GAME_CONFIG.height - 30, '© 2025 LAB de Mundanidad Forzada · Todos los derechos reservados', {
      fontFamily: 'Courier New',
      fontSize: '10px',
      color: '#555555',
      align: 'center'
    }).setOrigin(0.5);

    // ENTER para volver al menú
    this.input.keyboard.on('keydown-ENTER', () => {
      this.goToMenu();
    });
  }

  goToMenu() {
    console.log('=== GOING TO MAIN MENU ===');

    // Detener todas las escenas activas
    this.scene.manager.scenes.forEach(scene => {
      if (scene.scene.isActive()) {
        console.log('Stopping scene:', scene.scene.key);
        this.scene.stop(scene.scene.key);
      }
    });

    // Iniciar MainMenuScene
    this.scene.start('MainMenuScene');
  }

  goToWelcome() {
    console.log('=== GOING TO WELCOME SCENE ===');

    // Detener todas las escenas activas
    this.scene.manager.scenes.forEach(scene => {
      if (scene.scene.isActive()) {
        console.log('Stopping scene:', scene.scene.key);
        this.scene.stop(scene.scene.key);
      }
    });

    // Iniciar WelcomeScene
    this.scene.start('WelcomeScene');
  }

  shutdown() {
    // Cleanup keyboard listeners
    this.input.keyboard.off('keydown-ENTER');
  }
}
