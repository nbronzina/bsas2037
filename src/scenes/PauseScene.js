// PauseScene.js - Menú de pausa (ESC)

class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    console.log('PauseScene.create() called');

    const { width, height } = GAME_CONFIG;
    const centerX = width / 2;
    const colors = gameState.accessibilityManager.getColors();
    const a11y = gameState.accessibilityManager;

    // NUEVO: Keyboard navigation
    this.keyboardNav = new KeyboardNavigationManager(this);

    // Overlay oscuro semi-transparente
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.75);
    overlay.setOrigin(0, 0);
    overlay.setInteractive();

    // Panel central del menú
    const panelWidth = 380;
    const panelHeight = 400;
    const panelX = centerX;
    const panelY = height / 2;

    // Fondo del panel
    const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, colors.panelBg);
    panel.setStrokeStyle(3, colors.primary);

    // Título
    this.add.text(centerX, panelY - 135, '⏸️ PAUSA', {
      fontFamily: 'Courier New',
      fontSize: a11y.getFontSize('28px'),
      color: colors.primaryHex,
      fontStyle: 'bold',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Separador
    this.add.rectangle(centerX, panelY - 105, panelWidth - 60, 2, colors.border);

    // Botones
    const buttonStartY = panelY - 65;
    const buttonSpacing = 50;

    this.createButton(centerX, buttonStartY, '[ CONTINUAR ]', () => this.resumeGame());
    this.createButton(centerX, buttonStartY + buttonSpacing, '[ GUARDAR PARTIDA ]', () => this.saveGame());

    // Botón cargar con info del save
    const hasSave = gameState.saveManager.hasSavedGame();
    let loadButtonText = '[ CARGAR PARTIDA ]';
    let loadButtonColor = '#ffffff';

    if (hasSave) {
      const saveInfo = gameState.saveManager.getSaveInfo();
      loadButtonText = `[ CARGAR PARTIDA ] (Día ${saveInfo.day})`;
      loadButtonColor = '#44aa44';
    } else {
      loadButtonColor = '#666666';
    }

    this.createButton(centerX, buttonStartY + buttonSpacing * 2, loadButtonText, () => this.loadGame(), loadButtonColor, hasSave);

    // Info del save (si existe)
    if (hasSave) {
      const saveInfo = gameState.saveManager.getSaveInfo();
      this.add.text(centerX, buttonStartY + buttonSpacing * 2 + 22, `${saveInfo.date}`, {
        fontFamily: 'Courier New',
        fontSize: '9px',
        color: '#888888'
      }).setOrigin(0.5);
    }

    // Botón CONFIGURACIÓN
    this.createButton(centerX, buttonStartY + buttonSpacing * 3, '[ CONFIGURACIÓN ]', () => this.showSettings());

    // Separador antes de opciones de salida
    this.add.rectangle(centerX, buttonStartY + buttonSpacing * 3.8, panelWidth - 100, 1, 0x333333);

    this.createButton(centerX, buttonStartY + buttonSpacing * 4.4, '[ MENÚ PRINCIPAL ]', () => this.returnToMenu(), '#ffaa00');
    this.createButton(centerX, buttonStartY + buttonSpacing * 5.2, '[ SALIR ]', () => this.exitGame(), '#ff6600');

    // NUEVO: Hint de controles de teclado
    this.add.text(centerX, height - 30, 'ESC continuar • ↑↓ navegar • ENTER seleccionar', {
      fontFamily: 'Courier New',
      fontSize: a11y.getFontSize('12px'),
      color: '#888888'
    }).setOrigin(0.5);

    // Listener para ESC
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // NUEVO: Focus inicial en primer botón
    this.time.delayedCall(100, () => {
      this.keyboardNav.focusNext();
    });
  }

  update() {
    // Cerrar con ESC
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.resumeGame();
    }
  }

  createButton(x, y, text, callback, color = '#ffffff', enabled = true) {
    const colors = gameState.accessibilityManager.getColors();
    const a11y = gameState.accessibilityManager;

    const button = this.add.text(x, y, text, {
      fontFamily: 'Courier New',
      fontSize: a11y.getFontSize('16px'),
      color: enabled ? color : '#666666',
      backgroundColor: colors.panelBgHex,
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5);

    if (enabled) {
      button.setInteractive({ useHandCursor: true });

      // Hover
      button.on('pointerover', () => {
        button.setColor(colors.primaryHex);
        button.setScale(1.05);
      });

      button.on('pointerout', () => {
        button.setColor(color);
        button.setScale(1);
      });

      // Click
      button.on('pointerdown', () => {
        gameState.audioManager?.playConfirmSound();
        callback();
      });

      // NUEVO: Registrar para keyboard navigation
      this.keyboardNav.registerFocusable(button, {
        label: text.replace(/\[|\]/g, '').trim(),
        onFocus: () => {
          button.setColor(colors.primaryHex);
          button.setScale(1.05);
        },
        onBlur: () => {
          button.setColor(color);
          button.setScale(1);
        },
        onActivate: callback
      });
    }

    return button;
  }

  resumeGame() {
    console.log('Resuming game...');
    this.scene.stop('PauseScene');
    this.scene.resume('MapScene');
  }

  saveGame() {
    console.log('Saving game...');
    const success = gameState.saveManager.save();

    if (success) {
      // Obtener info del save para mostrar
      const saveInfo = gameState.saveManager.getSaveInfo();

      // Mostrar feedback visual
      const feedback = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 155, `✓ Partida guardada (Día ${saveInfo.day})`, {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: '#44aa44',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Fade out después de 1.5 segundos
      this.tweens.add({
        targets: feedback,
        alpha: { from: 1, to: 0 },
        duration: 1000,
        delay: 1500,
        onComplete: () => feedback.destroy()
      });
    } else {
      // Mostrar error
      const feedback = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 155, '✗ Error al guardar', {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: '#ff0000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: feedback,
        alpha: { from: 1, to: 0 },
        duration: 1000,
        delay: 1500,
        onComplete: () => feedback.destroy()
      });
    }
  }

  showSettings() {
    console.log('Opening settings...');
    this.scene.pause();
    this.scene.launch('SettingsScene', { returnScene: 'PauseScene' });
  }

  loadGame() {
    console.log('Loading game...');

    if (!gameState.saveManager.hasSavedGame()) {
      // No hay partida guardada
      const feedback = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 155, '✗ No hay partida guardada', {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: '#ff6600',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: feedback,
        alpha: { from: 1, to: 0 },
        duration: 1000,
        delay: 1500,
        onComplete: () => feedback.destroy()
      });
      return;
    }

    // Obtener info antes de cargar
    const saveInfo = gameState.saveManager.getSaveInfo();
    console.log('Loading save from:', saveInfo);

    const success = gameState.saveManager.load();

    if (success) {
      // Mostrar qué se cargó
      const feedback = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 155, `✓ Partida cargada: Día ${saveInfo.day}`, {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: '#44aa44',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Esperar 1 segundo antes de reiniciar para que el usuario vea el mensaje
      this.time.delayedCall(1000, () => {
        console.log('Restarting MapScene with loaded data...');
        this.scene.stop('PauseScene');
        this.scene.stop('MapScene');
        this.scene.start('MapScene');
      });
    } else {
      // Error al cargar
      const feedback = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 155, '✗ Error al cargar partida', {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: '#ff0000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: feedback,
        alpha: { from: 1, to: 0 },
        duration: 1000,
        delay: 1500,
        onComplete: () => feedback.destroy()
      });
    }
  }

  returnToMenu() {
    console.log('Returning to main menu...');

    // Confirmar antes de salir
    const confirmText = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 160, '¿Salir al menú? (Se perderá progreso no guardado)', {
      fontFamily: 'Courier New',
      fontSize: '13px',
      color: '#ffaa00',
      fontStyle: 'bold',
      backgroundColor: '#1a1a1a',
      padding: { x: 15, y: 8 },
      wordWrap: { width: 500 },
      align: 'center'
    }).setOrigin(0.5);

    const yesButton = this.add.text(GAME_CONFIG.width / 2 - 60, GAME_CONFIG.height / 2 + 190, '[ SÍ ]', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#cc0000',
      padding: { x: 15, y: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const noButton = this.add.text(GAME_CONFIG.width / 2 + 60, GAME_CONFIG.height / 2 + 190, '[ NO ]', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#2a2a2a',
      padding: { x: 15, y: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    yesButton.on('pointerover', () => yesButton.setScale(1.05));
    yesButton.on('pointerout', () => yesButton.setScale(1));
    noButton.on('pointerover', () => noButton.setScale(1.05));
    noButton.on('pointerout', () => noButton.setScale(1));

    yesButton.on('pointerdown', () => {
      gameState.audioManager?.playConfirmSound();
      this.scene.stop('PauseScene');
      this.scene.stop('MapScene');
      this.scene.start('MainMenuScene');
    });

    noButton.on('pointerdown', () => {
      gameState.audioManager?.playConfirmSound();
      confirmText.destroy();
      yesButton.destroy();
      noButton.destroy();
    });
  }

  exitGame() {
    console.log('Exiting game...');

    // Confirmar antes de salir
    const confirmText = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 160, '¿Cerrar el juego? (Se perderá progreso no guardado)', {
      fontFamily: 'Courier New',
      fontSize: '13px',
      color: '#ff6600',
      fontStyle: 'bold',
      backgroundColor: '#1a1a1a',
      padding: { x: 15, y: 8 },
      wordWrap: { width: 500 },
      align: 'center'
    }).setOrigin(0.5);

    const yesButton = this.add.text(GAME_CONFIG.width / 2 - 60, GAME_CONFIG.height / 2 + 190, '[ SÍ ]', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#cc0000',
      padding: { x: 15, y: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const noButton = this.add.text(GAME_CONFIG.width / 2 + 60, GAME_CONFIG.height / 2 + 190, '[ NO ]', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#2a2a2a',
      padding: { x: 15, y: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    yesButton.on('pointerover', () => yesButton.setScale(1.05));
    yesButton.on('pointerout', () => yesButton.setScale(1));
    noButton.on('pointerover', () => noButton.setScale(1.05));
    noButton.on('pointerout', () => noButton.setScale(1));

    yesButton.on('pointerdown', () => {
      gameState.audioManager?.playConfirmSound();
      // Cerrar el juego (en navegador web esto solo puede cerrar la pestaña si fue abierta por script)
      // Para un juego web, típicamente redirige a una página de salida o cierra el canvas
      window.close();
      // Si window.close() no funciona (navegador no permite), volver al menú principal
      this.time.delayedCall(100, () => {
        this.scene.stop('PauseScene');
        this.scene.stop('MapScene');
        this.scene.start('MainMenuScene');
      });
    });

    noButton.on('pointerdown', () => {
      gameState.audioManager?.playConfirmSound();
      confirmText.destroy();
      yesButton.destroy();
      noButton.destroy();
    });
  }

  shutdown() {
    // Cleanup keyboard listeners
    if (this.escKey) {
      this.input.keyboard.removeKey(this.escKey);
    }

    // NUEVO: Cleanup keyboard navigation
    if (this.keyboardNav) {
      this.keyboardNav.destroy();
    }
  }
}
