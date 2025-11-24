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

    // Título principal - ajustado
    this.add.text(centerX, 50, 'GRACIAS POR JUGAR', {
      fontFamily: 'Courier New',
      fontSize: '28px',
      color: '#d4a574',
      fontStyle: 'bold',
      letterSpacing: 3
    }).setOrigin(0.5);

    // Separador
    this.add.rectangle(centerX, 95, 500, 2, 0x555555).setOrigin(0.5);

    // Mensaje principal - ajustado tamaño
    const mainMessage = `'Red de Aguante' es un prototipo de investigación
del LAB de Mundanidad Forzada.

Este juego explora futuros posibles desde contextos
latinoamericanos, usando restricciones reales
como material de diseño.

No predice. No prescribe.
Observa lo que ya está aquí.`;

    this.add.text(centerX, 130, mainMessage, {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: '#cccccc',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5, 0);

    // Separador
    this.add.rectangle(centerX, 335, 500, 2, 0x555555).setOrigin(0.5);

    // Créditos - ajustado
    this.add.text(centerX, 360, 'CRÉDITOS', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#d4a574',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const credits = `Desarrollo: LAB de Mundanidad Forzada
Colaboración: Heated Studio
Implementación técnica: Claude (Anthropic)
Framework: Phaser 3`;

    this.add.text(centerX, 395, credits, {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: '#aaaaaa',
      align: 'center',
      lineSpacing: 5
    }).setOrigin(0.5, 0);

    // Separador
    this.add.rectangle(centerX, 490, 500, 2, 0x555555).setOrigin(0.5);

    // Botón único - centrado
    const buttonY = 525;

    // Botón "Volver a inicio" (único)
    const menuButton = this.add.text(
      centerX,
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

    // Copyright - con más espacio
    this.add.text(centerX, GAME_CONFIG.height - 20, '© 2025 LAB de Mundanidad Forzada · Todos los derechos reservados', {
      fontFamily: 'Courier New',
      fontSize: '9px',
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

    // DEBUG: Verificar qué escenas están activas/pausadas ANTES
    console.log('Scenes BEFORE transition:');
    this.scene.manager.scenes.forEach(scene => {
      const status = scene.scene.isActive() ? 'active' : scene.scene.isPaused() ? 'paused' : 'stopped';
      console.log(`  - ${scene.scene.key}: ${status}`);
    });

    // SOLUCIÓN: Detener explícitamente las escenas del juego que puedan estar pausadas/activas
    // MapScene usa scene.launch() entonces queda pausada en el fondo
    this.scene.stop('MapScene');
    this.scene.stop('EndGameScene');
    this.scene.stop('ThanksScene');

    // Ahora iniciar MainMenuScene
    this.scene.start('MainMenuScene');

    // DEBUG: Verificar qué escenas están activas DESPUÉS (con delay)
    setTimeout(() => {
      console.log('Scenes AFTER transition:');
      this.scene.manager.scenes.forEach(scene => {
        const status = scene.scene.isActive() ? 'active' : scene.scene.isPaused() ? 'paused' : 'stopped';
        console.log(`  - ${scene.scene.key}: ${status}`);
      });
    }, 100);
  }

  shutdown() {
    // Cleanup keyboard listeners
    this.input.keyboard.off('keydown-ENTER');
  }
}
