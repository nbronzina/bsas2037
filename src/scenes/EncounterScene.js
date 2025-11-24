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
    console.log('=== ENCOUNTER SCENE INIT ===');
    console.log('Encounter data:', data);

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
    console.log('=== ENCOUNTER SCENE CREATE ===');
    console.log('Encounter ID:', this.encounterData?.id);

    // CRÍTICO: Limpiar handlers anteriores
    if (this.input.keyboard) {
      this.input.keyboard.removeAllKeys();
      this.input.keyboard.removeAllListeners();
      console.log('Previous keyboard handlers cleared');
    }

    // CRÍTICO: Limpiar botones anteriores si existen
    if (this.optionButtons && this.optionButtons.length > 0) {
      this.optionButtons.forEach(btn => {
        if (btn.bg) btn.bg.removeAllListeners();
        if (btn.border) btn.border.removeAllListeners();
      });
      this.optionButtons = [];
      console.log('Previous option buttons cleared');
    }

    // Resetear estado
    this.showingResult = false;
    this.selectedOption = null;
    this.hoveredOption = null;

    // NUEVO: Tutorial encounter (primera vez que ocurre)
    if (!gameState.tutorialFlags.tutorial_encounter_visto && !gameState.tutorialFlags.tutorial_skipped) {
      gameState.tutorialManager?.show('tutorial_encounter_visto', {
        title: 'Evento Importante',
        dialogue: `EVENTO IMPORTANTE

Ocurrió algo que requiere tu decisión.

Lee con atención: cada opción tiene consecuencias diferentes. Algunas afectan recursos, otras abren nuevas posibilidades.

No hay una respuesta "correcta". Elegí según tus valores.`,
        buttonText: 'Ver Evento',
        showValeria: true
      });
    }

    // NUEVO: Track scene
    gameState.currentScene = this;

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

    // Configurar controles (DESPUÉS de crear UI)
    this.setupControls();

    // Iniciar música de encuentro
    gameState.audioManager.playEncounterTheme();

    console.log('Encounter scene ready');
  }

  createEncounterUI() {
    // Panel principal - AUMENTADO para mejor legibilidad
    const panelWidth = 750;
    const panelHeight = 620;  // Aumentado de 550 a 620 para contextos largos
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

    // Título - con más espacio superior y wordWrap más amplio
    this.titleText = this.add.text(
      panelX + panelWidth / 2,
      panelY + 40,  // Aumentado de 30 a 40 para más espacio desde el borde
      this.encounterData.title.toUpperCase(),
      {
        fontSize: '18px',  // Reducido de 20px a 18px para asegurar que cabe
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        fontStyle: 'bold',
        wordWrap: { width: panelWidth - 60 },  // Aumentado de 80 a 60 para más ancho
        align: 'center'
      }
    );
    this.titleText.setOrigin(0.5, 0);

    // Calcular posición de contexto dinámicamente basado en altura del título
    const titleHeight = this.titleText.height;
    const contextStartY = panelY + 40 + titleHeight + 15;  // 15px de margen después del título

    // Contexto
    this.contextText = this.add.text(
      panelX + 30,
      contextStartY,
      this.encounterData.context,
      {
        fontSize: '13px',  // Reducido de 14px a 13px para mejor ajuste
        color: COLORS.texto,
        fontFamily: 'Courier New',
        wordWrap: { width: panelWidth - 60 },
        lineSpacing: 3
      }
    );

    // Calcular posición de opciones dinámicamente basado en altura del contexto
    const contextHeight = this.contextText.height;
    const contextEndY = contextStartY + contextHeight;
    const optionsStartY = contextEndY + 20;  // 20px de margen entre contexto y opciones

    // Opciones
    this.createOptions(panelX, optionsStartY, panelWidth);

    // Instrucciones
    this.instructionsText = this.add.text(
      panelX + panelWidth / 2,
      panelY + panelHeight - 30,
      'Usá números 1-4 para elegir',
      {
        fontSize: '12px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New'
      }
    );
    this.instructionsText.setOrigin(0.5, 0);
  }

  createOptions(startX, startY, panelWidth) {
    const optionHeight = 75;
    const optionSpacing = 8;

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
          fontSize: '14px',  // Reducido de 16px a 14px
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
          fontSize: '13px',
          color: COLORS.texto,
          fontFamily: 'Courier New',
          wordWrap: { width: panelWidth - 140 }
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

      // Click removido - usar solo teclado (números 1-4)

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
    console.log('=== SELECT OPTION ===');
    console.log('Option ID:', option.id);
    console.log('Option text:', option.text);
    console.log('Option message:', option.result.message);

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
          console.log('✓ Flag seteado:', flag);
        }
      });
    }

    // Aplicar arc triggers (Sistema de Arcos Narrativos)
    if (option.result && option.result.arcTriggers) {
      console.log('=== APPLYING ARC TRIGGERS ===');
      option.result.arcTriggers.forEach(trigger => {
        const { character, flag } = trigger;

        if (!character || !flag) {
          console.warn('Invalid arc trigger format:', trigger);
          return;
        }

        // Verificar que el personaje existe
        if (!gameState.characters[character]) {
          console.warn(`Character ${character} not found for arc trigger`);
          return;
        }

        // Agregar flag al array de triggers del arco del personaje
        if (!gameState.characters[character].arc.triggers.includes(flag)) {
          gameState.characters[character].arc.triggers.push(flag);
          console.log(`✓ Arc trigger added: ${character}.arc.triggers[] += "${flag}"`);

          // Forzar actualización inmediata de arco (útil para cambios intra-día)
          gameState.timeManager.updateNPCArcs();
          console.log(`  → ${character} arc updated to stage ${gameState.characters[character].arc.stage}, path: ${gameState.characters[character].arc.path || 'none'}`);
        }
      });
    }

    // Aplicar counters para victory conditions
    if (option.result && option.result.counters) {
      for (const [counter, value] of Object.entries(option.result.counters)) {
        if (gameState.decisionCounters.hasOwnProperty(counter)) {
          gameState.decisionCounters[counter] += value;
          console.log(`✓ Counter actualizado: ${counter} = ${gameState.decisionCounters[counter]}`);
        }
      }
    }

    // Track assembly attendance (asambleas)
    if (this.encounterId && this.encounterId.includes('asamblea')) {
      gameState.achievementManager.trackAssemblyAttended();
    }

    // Check decision-based achievements
    gameState.achievementManager.checkDecisionAchievements();

    // Mostrar resultado
    this.showResult(option);
  }

  showResult(option) {
    console.log('=== SHOW RESULT ===');
    console.log('Result message:', option.result.message);

    // Ocultar opciones
    this.optionButtons.forEach(btn => {
      btn.container.setAlpha(0);
    });

    // Ocultar instrucciones
    this.instructionsText.setVisible(false);

    // CRÍTICO: Mostrar mensaje de ESTE resultado específico
    const resultText = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      option.result.message,
      {
        fontSize: '14px',  // Reducido de 16px a 14px
        color: COLORS.texto,
        fontFamily: 'Courier New',
        align: 'center',
        wordWrap: { width: 650 },
        lineSpacing: 4
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

    console.log('Result displayed');
  }

  setupControls() {
    console.log('=== SETTING UP CONTROLS ===');
    console.log('Number of options:', this.encounterData.options.length);

    // CRÍTICO: Remover TODOS los handlers anteriores antes de crear nuevos
    this.input.keyboard.removeAllKeys();
    this.input.keyboard.removeAllListeners();

    // CRÍTICO: Usar addKey + once en lugar de on() para evitar acumulación
    // Crear handlers con closures para capturar índice correcto

    const oneKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    const twoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    const threeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    const fourKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);

    // CRÍTICO: Usar on() con bind() para evitar closure issues
    oneKey.on('down', () => {
      console.log('KEY 1 pressed');
      this.handleNumberKey(0);
    });

    twoKey.on('down', () => {
      console.log('KEY 2 pressed');
      this.handleNumberKey(1);
    });

    threeKey.on('down', () => {
      console.log('KEY 3 pressed');
      this.handleNumberKey(2);
    });

    fourKey.on('down', () => {
      console.log('KEY 4 pressed');
      this.handleNumberKey(3);
    });

    // ENTER para continuar después de resultado
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    console.log('Controls configured');
  }

  handleNumberKey(index) {
    console.log('=== HANDLE NUMBER KEY ===');
    console.log('Index:', index);
    console.log('Showing result:', this.showingResult);

    if (this.showingResult) {
      console.log('Already showing result, ignoring key');
      return;
    }

    if (index < this.optionButtons.length) {
      const btn = this.optionButtons[index];
      console.log('Button found:', btn.option.text);
      console.log('Can afford:', btn.canAfford);

      if (btn.canAfford) {
        this.selectOption(btn.option);
      } else {
        console.log('Cannot afford this option');
      }
    } else {
      console.log('Index out of range');
    }
  }

  update() {
    // Si está mostrando resultado y presiona ENTER, volver al mapa
    if (this.showingResult && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      console.log('=== ENCOUNTER COMPLETE ===');
      console.log('Encounter ID:', this.encounterData.id);

      // Guardar después de completar encuentro
      gameState.saveManager.save();

      // CRÍTICO: Limpiar handlers antes de cerrar
      this.input.keyboard.removeAllKeys();
      this.input.keyboard.removeAllListeners();
      console.log('Handlers cleaned up');

      // NUEVO: Fade out before closing
      SceneTransitions.fadeOut(this, 300, () => {
        console.log('Stopping EncounterScene...');
        this.scene.stop('EncounterScene');

        console.log('Resuming MapScene...');
        this.scene.resume('MapScene');
      });

      console.log('=== ENCOUNTER CLOSED ===');
    }
  }
}
