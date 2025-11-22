// MainMenuScene.js - Menú principal (diseño austero, documento de trabajo)

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    // Fondo gris oscuro con textura sutil
    this.add.rectangle(
      0,
      0,
      GAME_CONFIG.width,
      GAME_CONFIG.height,
      0x1a1a1a,
      1
    ).setOrigin(0, 0);

    // Textura de papel/fotocopia (líneas sutiles)
    this.createPaperTexture();

    // === ENCABEZADO ===

    const titleY = 80;

    // Título principal
    this.add.text(
      GAME_CONFIG.width / 2,
      titleY,
      'RED DE AGUANTE',
      {
        fontSize: '42px',
        color: '#d4a574', // Terracota
        fontFamily: 'Courier New',
        fontStyle: 'bold',
        letterSpacing: 2
      }
    ).setOrigin(0.5);

    // Subtítulo
    this.add.text(
      GAME_CONFIG.width / 2,
      titleY + 50,
      'Prototipo de investigación',
      {
        fontSize: '14px',
        color: '#888888',
        fontFamily: 'Courier New'
      }
    ).setOrigin(0.5);

    // Contexto
    this.add.text(
      GAME_CONFIG.width / 2,
      titleY + 75,
      'Buenos Aires, escenario especulativo',
      {
        fontSize: '12px',
        color: '#666666',
        fontFamily: 'Courier New'
      }
    ).setOrigin(0.5);

    // === BOTONES ===

    const buttonY = 240;
    const buttonSpacing = 60;

    // Verificar si hay sesión guardada
    const hasSave = gameState.saveManager.hasSavedGame();

    // Botón INICIAR
    this.createButton(
      GAME_CONFIG.width / 2,
      buttonY,
      hasSave ? '[ NUEVA PARTIDA ]' : '[ INICIAR ]',
      () => this.startNewGame()
    );

    // Botón CONTINUAR (solo si hay save)
    if (hasSave) {
      const saveInfo = gameState.saveManager.getSaveInfo();
      this.createButton(
        GAME_CONFIG.width / 2,
        buttonY + buttonSpacing,
        `[ CONTINUAR ] (Día ${saveInfo.day})`,
        () => this.continueGame()
      );
    }

    // Botón INFO
    this.createButton(
      GAME_CONFIG.width / 2,
      buttonY + (hasSave ? buttonSpacing * 2 : buttonSpacing),
      '[ INFO ]',
      () => this.showInfo()
    );

    // === CRÉDITOS ===

    const creditsY = 420;

    const creditsText = `Desarrollado por
LAB de Mundanidad Forzada

En colaboración con
Heated Studio

___

LAB de Mundanidad Forzada:
Research collective developing design fiction
methodologies from Latin American contexts.
We work with informal economies, resource
constraints, and everyday adaptation as
design materials.

Futures research beyond institutional frameworks.
Argentina · México · Brasil · Colombia`;

    this.add.text(
      20,
      creditsY,
      creditsText,
      {
        fontSize: '10px',
        color: '#555555',
        fontFamily: 'Courier New',
        lineSpacing: 4,
        align: 'left'
      }
    ).setOrigin(0, 0);

    // === CONTROLES ===

    // ESC para info
    this.input.keyboard.on('keydown-ESC', () => {
      this.showInfo();
    });

    // ENTER para iniciar
    this.input.keyboard.on('keydown-ENTER', () => {
      if (hasSave) {
        this.continueGame();
      } else {
        this.startNewGame();
      }
    });
  }

  createPaperTexture() {
    // Crear textura de líneas horizontales sutiles (papel rayado)
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x2a2a2a, 0.3);

    for (let y = 0; y < GAME_CONFIG.height; y += 20) {
      graphics.lineBetween(0, y, GAME_CONFIG.width, y);
    }

    graphics.setDepth(-1);
  }

  createButton(x, y, text, callback) {
    // Texto del botón
    const btnText = this.add.text(x, y, text, {
      fontSize: '16px',
      color: '#cccccc',
      fontFamily: 'Courier New',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    btnText.setInteractive({ useHandCursor: true });

    // Hover effect
    btnText.on('pointerover', () => {
      btnText.setColor('#d4a574'); // Terracota
      btnText.setScale(1.05);
    });

    btnText.on('pointerout', () => {
      btnText.setColor('#cccccc');
      btnText.setScale(1);
    });

    btnText.on('pointerdown', () => {
      gameState.audioManager.playConfirmSound();
      callback();
    });

    return btnText;
  }

  startNewGame() {
    // Confirmar si hay save
    if (gameState.saveManager.hasSavedGame()) {
      const confirm = window.confirm(
        'Iniciar nueva partida borrará la sesión guardada.\n¿Continuar?'
      );

      if (!confirm) return;

      // Borrar save
      gameState.saveManager.deleteSave();
    }

    // Resetear estado
    this.resetGameState();

    // Ir a introducción
    this.scene.start('IntroScene');
  }

  continueGame() {
    // Cargar partida
    gameState.saveManager.load();

    // Ir directo al mapa
    this.scene.start('MapScene');
  }

  showInfo() {
    this.scene.start('InfoScene');
  }

  resetGameState() {
    // Resetear recursos
    gameState.resourceManager.reset();

    // Resetear tiempo
    gameState.timeManager.reset();

    // Resetear flags
    gameState.flags = [];

    // Resetear personajes
    for (const char in gameState.characters) {
      gameState.characters[char].available = true;
      gameState.characters[char].task = null;
      gameState.characters[char].daysRemaining = 0;
    }

    // Resetear infraestructura
    gameState.infrastructure.transformadorA = 90;
    gameState.infrastructure.transformadorB = 40;
    gameState.infrastructure.perforacion1 = 100;
  }
}
