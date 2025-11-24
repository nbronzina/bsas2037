// MainMenuScene.js - Menú principal (diseño austero, documento de trabajo)

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    console.log('MainMenuScene.create() called');

    // NUEVO: Track scene
    gameState.currentScene = this;

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

    // === LOGO ===
    const centerX = GAME_CONFIG.width / 2;

    createGameLogo(this, centerX, 120, true);

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

    // Botón CONFIGURACIÓN
    this.createButton(
      GAME_CONFIG.width / 2,
      buttonY + (hasSave ? buttonSpacing * 3 : buttonSpacing * 2),
      '[ CONFIGURACIÓN ]',
      () => this.showSettings()
    );

    // === CRÉDITOS ===

    // Posición base - centrada
    const creditsStartY = GAME_CONFIG.height - 100;

    // Línea separadora sutil
    this.add.rectangle(centerX, creditsStartY - 20, GAME_CONFIG.width * 0.5, 1, 0x444444)
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

    console.log('MainMenuScene created with logo');
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
      fontSize: '20px',  // Reducido de 30px a 20px
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

  showSettings() {
    this.scene.pause();
    this.scene.launch('SettingsScene', { returnScene: 'MainMenuScene' });
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
      resetCharacter(gameState.characters[char]);
    }

    // Resetear infraestructura
    gameState.infrastructure = { ...INITIAL_INFRASTRUCTURE };
  }

  shutdown() {
    // Cleanup keyboard listeners
    this.input.keyboard.off('keydown-ESC');
    this.input.keyboard.off('keydown-ENTER');
  }
}
