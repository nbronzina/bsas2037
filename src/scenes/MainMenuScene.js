// MainMenuScene.js - Menú principal (diseño austero, documento de trabajo)

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    console.log('MainMenuScene.create() called');

    // Iniciar música del menú (solo si no está sonando ya)
    // La pantalla de bienvenida ya inicia la música, pero si regresas de InfoScene
    // o de otra escena, esto asegura que la música del menú esté sonando
    if (gameState.audioManager.currentMusic !== 'menu') {
      gameState.audioManager.playMenuTheme();
    }

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

    const titleY = 60;

    // Título principal (MUCHO MÁS GRANDE)
    this.add.text(
      GAME_CONFIG.width / 2,
      titleY,
      'RED DE AGUANTE',
      {
        fontSize: '78px',
        color: '#d4a574', // Terracota
        fontFamily: 'Courier New',
        fontStyle: 'bold',
        letterSpacing: 3
      }
    ).setOrigin(0.5);

    // Subtítulo (más grande)
    this.add.text(
      GAME_CONFIG.width / 2,
      titleY + 90,
      'Prototipo de investigación',
      {
        fontSize: '24px',
        color: '#888888',
        fontFamily: 'Courier New'
      }
    ).setOrigin(0.5);

    // Contexto
    this.add.text(
      GAME_CONFIG.width / 2,
      titleY + 120,
      'Buenos Aires, escenario especulativo',
      {
        fontSize: '16px',
        color: '#666666',
        fontFamily: 'Courier New'
      }
    ).setOrigin(0.5);

    // === BOTONES ===

    const buttonY = 260;
    const buttonSpacing = 70;

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

    const creditsY = 455;
    const creditsX = 35;

    // Desarrollado por
    this.add.text(
      creditsX,
      creditsY,
      'Desarrollado por',
      {
        fontSize: '17px',
        color: '#d4a574', // Terracota
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0, 0);

    // LAB de Mundanidad Forzada
    this.add.text(
      creditsX,
      creditsY + 24,
      'LAB de Mundanidad Forzada',
      {
        fontSize: '17px',
        color: '#cccccc',
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0, 0);

    // En colaboración con
    this.add.text(
      creditsX,
      creditsY + 48,
      'En colaboración con',
      {
        fontSize: '16px',
        color: '#d4a574',
        fontFamily: 'Courier New'
      }
    ).setOrigin(0, 0);

    // Heated Studio
    this.add.text(
      creditsX,
      creditsY + 70,
      'Heated Studio',
      {
        fontSize: '17px',
        color: '#cccccc',
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0, 0);

    // Separador
    this.add.text(
      creditsX,
      creditsY + 94,
      '___',
      {
        fontSize: '14px',
        color: '#555555',
        fontFamily: 'Courier New'
      }
    ).setOrigin(0, 0);

    // Descripción
    const descText = `LAB de Mundanidad Forzada: Research collective
developing design fiction methodologies from
Latin American contexts.

Futures research beyond institutional frameworks.
Argentina · México · Brasil · Colombia`;

    this.add.text(
      creditsX,
      creditsY + 112,
      descText,
      {
        fontSize: '14px',
        color: '#999999',
        fontFamily: 'Courier New',
        lineSpacing: 10
      }
    ).setOrigin(0, 0);

    // Copyright
    this.add.text(
      creditsX,
      creditsY + 260,  // Movido de 192 a 260 para evitar solapamiento con descripción
      '© 2025 LAB de Mundanidad Forzada & Heated Studio\nTodos los derechos reservados',
      {
        fontSize: '13px',
        color: '#777777',
        fontFamily: 'Courier New',
        lineSpacing: 10
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
    // Texto del botón (MUCHO MÁS GRANDE)
    const btnText = this.add.text(x, y, text, {
      fontSize: '30px',
      color: '#cccccc',
      fontFamily: 'Courier New',
      fontStyle: 'bold',
      letterSpacing: 1
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
