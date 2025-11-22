// EncounterScene.js - Sistema de encuentros/asambleas

class EncounterScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EncounterScene' });
    this.encounterData = null;
    this.selectedOption = null;
    this.showingResult = false;
    this.optionButtons = [];
    this.hoveredOption = null;
  }

  init(data) {
    // Recibir data del encuentro desde MapScene
    this.encounterData = data.encounter;
    this.showingResult = false;
  }

  preload() {
    // Cargar encounters.json si no está cargado
    if (!this.cache.json.has('encounters')) {
      this.load.json('encounters', 'data/encounters.json');
    }
  }

  create() {
    // Fondo oscuro
    this.add.rectangle(
      0,
      0,
      GAME_CONFIG.width,
      GAME_CONFIG.height,
      0x000000,
      0.95
    ).setOrigin(0, 0);

    // Crear UI del encuentro
    this.createEncounterUI();

    // Configurar controles
    this.setupControls();

    // Iniciar música de encuentro
    gameState.audioManager.playEncounterTheme();
  }

  createEncounterUI() {
    // Panel principal
    const panelWidth = 700;
    const panelHeight = 500;
    const panelX = (GAME_CONFIG.width - panelWidth) / 2;
    const panelY = (GAME_CONFIG.height - panelHeight) / 2;

    // Fondo del panel
    const bg = this.add.rectangle(
      panelX,
      panelY,
      panelWidth,
      panelHeight,
      hexToNumber(COLORS.panel),
      1
    );
    bg.setOrigin(0, 0);

    const border = this.add.rectangle(
      panelX,
      panelY,
      panelWidth,
      panelHeight
    );
    border.setOrigin(0, 0);
    border.setStrokeStyle(3, hexToNumber(COLORS.cooperativa));
    border.isFilled = false;

    // Título
    this.titleText = this.add.text(
      panelX + panelWidth / 2,
      panelY + 30,
      this.encounterData.title.toUpperCase(),
      {
        fontSize: '24px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    );
    this.titleText.setOrigin(0.5, 0);

    // Contexto
    this.contextText = this.add.text(
      panelX + 30,
      panelY + 80,
      this.encounterData.context,
      {
        fontSize: '14px',
        color: COLORS.texto,
        fontFamily: 'Courier New',
        wordWrap: { width: panelWidth - 60 }
      }
    );

    // Opciones
    this.createOptions(panelX, panelY + 150, panelWidth);

    // Instrucciones
    this.instructionsText = this.add.text(
      panelX + panelWidth / 2,
      panelY + panelHeight - 30,
      'Usá números 1-4 o hacé click para elegir',
      {
        fontSize: '12px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New'
      }
    );
    this.instructionsText.setOrigin(0.5, 0);
  }

  createOptions(startX, startY, panelWidth) {
    const optionHeight = 70;
    const optionSpacing = 10;

    this.encounterData.options.forEach((option, index) => {
      const y = startY + (index * (optionHeight + optionSpacing));

      // Contenedor de opción
      const optionContainer = this.add.container(0, 0);

      // Fondo de la opción
      const optionBg = this.add.rectangle(
        startX + 30,
        y,
        panelWidth - 60,
        optionHeight,
        hexToNumber(COLORS.textoOscuro),
        0.5
      );
      optionBg.setOrigin(0, 0);

      // Borde
      const optionBorder = this.add.rectangle(
        startX + 30,
        y,
        panelWidth - 60,
        optionHeight
      );
      optionBorder.setOrigin(0, 0);
      optionBorder.setStrokeStyle(2, hexToNumber(COLORS.cooperativa), 0.5);
      optionBorder.isFilled = false;

      // Número de opción
      const numberText = this.add.text(
        startX + 45,
        y + 10,
        `${option.id}.`,
        {
          fontSize: '16px',
          color: COLORS.cooperativa,
          fontFamily: 'Courier New',
          fontStyle: 'bold'
        }
      );

      // Texto de la opción
      const optionText = this.add.text(
        startX + 70,
        y + 10,
        option.text,
        {
          fontSize: '14px',
          color: COLORS.texto,
          fontFamily: 'Courier New',
          wordWrap: { width: panelWidth - 130 }
        }
      );

      // Texto de costo/consecuencias
      const costText = this.getCostText(option);
      const costDisplay = this.add.text(
        startX + 70,
        y + 40,
        costText,
        {
          fontSize: '11px',
          color: COLORS.cooperativa,
          fontFamily: 'Courier New'
        }
      );

      // Verificar si puede pagar
      const canAfford = this.canAffordOption(option);
      if (!canAfford) {
        optionBg.setAlpha(0.3);
        optionText.setColor(COLORS.chapa);
        costDisplay.setText('❌ ' + costText);
        costDisplay.setColor(COLORS.emergencia);
      }

      // Hacer interactivo
      optionBg.setInteractive({ useHandCursor: true });
      optionBorder.setInteractive({ useHandCursor: true });

      optionBg.on('pointerover', () => {
        if (canAfford && !this.showingResult) {
          optionBorder.setStrokeStyle(2, hexToNumber(COLORS.cooperativa), 1);
          optionBg.setAlpha(0.8);
          this.hoveredOption = index;
        }
      });

      optionBg.on('pointerout', () => {
        if (!this.showingResult) {
          optionBorder.setStrokeStyle(2, hexToNumber(COLORS.cooperativa), 0.5);
          optionBg.setAlpha(0.5);
          this.hoveredOption = null;
        }
      });

      optionBg.on('pointerdown', () => {
        if (canAfford && !this.showingResult) {
          this.selectOption(option);
        }
      });

      optionContainer.add([optionBg, optionBorder, numberText, optionText, costDisplay]);

      this.optionButtons.push({
        container: optionContainer,
        bg: optionBg,
        border: optionBorder,
        option: option,
        canAfford: canAfford,
        index: index
      });
    });
  }

  getCostText(option) {
    const parts = [];

    // Costos
    if (option.cost && Object.keys(option.cost).length > 0) {
      for (const [resource, amount] of Object.entries(option.cost)) {
        const icon = RESOURCE_ICONS[resource] || '';
        parts.push(`${icon} -${amount}`);
      }
    }

    // Beneficios (de result.changes)
    if (option.result && option.result.changes) {
      for (const [resource, amount] of Object.entries(option.result.changes)) {
        if (amount > 0) {
          const icon = RESOURCE_ICONS[resource] || '';
          parts.push(`${icon} +${amount}`);
        }
      }
    }

    return parts.length > 0 ? parts.join(' | ') : 'Sin costo';
  }

  canAffordOption(option) {
    // Verificar requirements
    if (option.requirements && Object.keys(option.requirements).length > 0) {
      for (const [resource, amount] of Object.entries(option.requirements)) {
        if (gameState.resourceManager.get(resource) < amount) {
          return false;
        }
      }
    }

    // Verificar cost
    if (option.cost && Object.keys(option.cost).length > 0) {
      for (const [resource, amount] of Object.entries(option.cost)) {
        if (gameState.resourceManager.get(resource) < amount) {
          return false;
        }
      }
    }

    return true;
  }

  selectOption(option) {
    // Sonido de confirmación
    gameState.audioManager.playConfirmSound();

    this.selectedOption = option;
    this.showingResult = true;

    // Aplicar costos
    if (option.cost) {
      gameState.resourceManager.pay(option.cost);
    }

    // Aplicar cambios
    if (option.result && option.result.changes) {
      gameState.resourceManager.applyChanges(option.result.changes);
    }

    // Aplicar flags
    if (option.result && option.result.flags) {
      option.result.flags.forEach(flag => {
        if (!gameState.flags.includes(flag)) {
          gameState.flags.push(flag);
        }
      });
    }

    // Mostrar resultado
    this.showResult(option);
  }

  showResult(option) {
    // Ocultar opciones
    this.optionButtons.forEach(btn => {
      btn.container.setAlpha(0);
    });

    // Ocultar instrucciones
    this.instructionsText.setVisible(false);

    // Mostrar mensaje de resultado
    const resultText = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      option.result.message,
      {
        fontSize: '16px',
        color: COLORS.texto,
        fontFamily: 'Courier New',
        align: 'center',
        wordWrap: { width: 600 }
      }
    );
    resultText.setOrigin(0.5);

    // Botón de continuar
    const continueText = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 + 100,
      '[Presioná ENTER para continuar]',
      {
        fontSize: '14px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New'
      }
    );
    continueText.setOrigin(0.5);

    // Animar
    this.tweens.add({
      targets: continueText,
      alpha: { from: 0.5, to: 1 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  setupControls() {
    // Teclas numéricas para elegir opciones
    this.input.keyboard.on('keydown-ONE', () => this.handleNumberKey(0));
    this.input.keyboard.on('keydown-TWO', () => this.handleNumberKey(1));
    this.input.keyboard.on('keydown-THREE', () => this.handleNumberKey(2));
    this.input.keyboard.on('keydown-FOUR', () => this.handleNumberKey(3));

    // ENTER para continuar después de resultado
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  handleNumberKey(index) {
    if (this.showingResult) return;

    if (index < this.optionButtons.length) {
      const btn = this.optionButtons[index];
      if (btn.canAfford) {
        this.selectOption(btn.option);
      }
    }
  }

  update() {
    // Si está mostrando resultado y presiona ENTER, volver al mapa
    if (this.showingResult && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      // Guardar después de completar encuentro
      gameState.saveManager.save();

      this.scene.stop('EncounterScene');
      this.scene.resume('MapScene');
    }
  }
}
