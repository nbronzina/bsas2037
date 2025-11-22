// ManagementScene.js - Gestión de base

class ManagementScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ManagementScene' });
    this.tasks = null;
    this.selectedCharacter = null;
    this.characterPanels = [];
  }

  preload() {
    // Cargar tasks.json
    if (!this.cache.json.has('tasks')) {
      this.load.json('tasks', 'data/tasks.json');
    }
  }

  create() {
    // Cargar datos
    this.tasks = this.cache.json.get('tasks');

    // Fondo oscuro
    this.add.rectangle(
      0,
      0,
      GAME_CONFIG.width,
      GAME_CONFIG.height,
      0x000000,
      0.9
    ).setOrigin(0, 0);

    // Crear UI
    this.createManagementUI();

    // Configurar controles
    this.setupControls();
  }

  createManagementUI() {
    // Título
    this.add.text(
      GAME_CONFIG.width / 2,
      20,
      'GESTIÓN DE BASE',
      {
        fontSize: '24px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5, 0);

    // Panel de infraestructura (izquierda)
    this.createInfrastructurePanel();

    // Panel de personajes (centro-derecha)
    this.createCharactersPanel();

    // Botones de acción (abajo)
    this.createActionButtons();
  }

  createInfrastructurePanel() {
    const panelX = 20;
    const panelY = 60;
    const panelWidth = 250;
    const panelHeight = 200;

    // Fondo
    const bg = this.add.rectangle(
      panelX,
      panelY,
      panelWidth,
      panelHeight,
      hexToNumber(COLORS.panel),
      0.95
    );
    bg.setOrigin(0, 0);

    const border = this.add.rectangle(
      panelX,
      panelY,
      panelWidth,
      panelHeight
    );
    border.setOrigin(0, 0);
    border.setStrokeStyle(2, hexToNumber(COLORS.cooperativa));
    border.isFilled = false;

    // Título
    this.add.text(
      panelX + 10,
      panelY + 10,
      'INFRAESTRUCTURA',
      {
        fontSize: '14px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    );

    // Estado de infraestructura
    this.infrastructureTexts = {};
    let yPos = panelY + 40;

    const infra = gameState.infrastructure;
    const items = [
      { key: 'transformadorA', label: 'Transformador A', value: infra.transformadorA },
      { key: 'transformadorB', label: 'Transformador B', value: infra.transformadorB },
      { key: 'perforacion1', label: 'Perforación 1', value: infra.perforacion1 }
    ];

    for (const item of items) {
      // Nombre
      this.add.text(
        panelX + 10,
        yPos,
        item.label,
        {
          fontSize: '12px',
          color: COLORS.texto,
          fontFamily: 'Courier New'
        }
      );

      // Barra de salud
      const barWidth = 150;
      const barHeight = 10;
      const barX = panelX + 10;
      const barY = yPos + 18;

      // Fondo de barra
      this.add.rectangle(
        barX,
        barY,
        barWidth,
        barHeight,
        hexToNumber(COLORS.textoOscuro),
        1
      ).setOrigin(0, 0);

      // Relleno de barra
      const fillWidth = (item.value / 100) * barWidth;
      const fillColor = item.value < 30 ? COLORS.emergencia : item.value < 60 ? COLORS.agua : COLORS.exito;

      const fill = this.add.rectangle(
        barX,
        barY,
        fillWidth,
        barHeight,
        hexToNumber(fillColor),
        1
      ).setOrigin(0, 0);

      // Texto de porcentaje
      const percentText = this.add.text(
        barX + barWidth + 5,
        barY,
        `${item.value}%`,
        {
          fontSize: '11px',
          color: COLORS.texto,
          fontFamily: 'Courier New'
        }
      );

      this.infrastructureTexts[item.key] = { fill, percentText };

      yPos += 50;
    }
  }

  createCharactersPanel() {
    const startX = 290;
    const startY = 60;
    const panelWidth = 490;
    const panelHeight = 400;

    // Fondo
    const bg = this.add.rectangle(
      startX,
      startY,
      panelWidth,
      panelHeight,
      hexToNumber(COLORS.panel),
      0.95
    );
    bg.setOrigin(0, 0);

    const border = this.add.rectangle(
      startX,
      startY,
      panelWidth,
      panelHeight
    );
    border.setOrigin(0, 0);
    border.setStrokeStyle(2, hexToNumber(COLORS.cooperativa));
    border.isFilled = false;

    // Título
    this.add.text(
      startX + 10,
      startY + 10,
      'PERSONAJES',
      {
        fontSize: '14px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    );

    // Crear panel para cada personaje
    const characters = ['valeria', 'beto', 'yani'];
    let yPos = startY + 40;

    for (const charKey of characters) {
      this.createCharacterPanel(startX + 10, yPos, charKey);
      yPos += 120;
    }
  }

  createCharacterPanel(x, y, charKey) {
    const char = gameState.characters[charKey];
    const panelWidth = 470;
    const panelHeight = 110;

    // Fondo del personaje
    const bg = this.add.rectangle(
      x,
      y,
      panelWidth,
      panelHeight,
      hexToNumber(COLORS.textoOscuro),
      0.5
    );
    bg.setOrigin(0, 0);

    const border = this.add.rectangle(
      x,
      y,
      panelWidth,
      panelHeight
    );
    border.setOrigin(0, 0);
    border.setStrokeStyle(2, hexToNumber(COLORS.cooperativa), 0.5);
    border.isFilled = false;

    // Nombre del personaje
    this.add.text(
      x + 10,
      y + 10,
      char.name.toUpperCase(),
      {
        fontSize: '14px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    );

    // Estado
    const statusText = this.add.text(
      x + 10,
      y + 30,
      char.available ? 'Disponible' : `Ocupado (${char.daysRemaining} días)`,
      {
        fontSize: '12px',
        color: char.available ? COLORS.exito : COLORS.emergencia,
        fontFamily: 'Courier New'
      }
    );

    // Tarea actual
    const taskText = this.add.text(
      x + 10,
      y + 50,
      char.task ? `Tarea: ${char.task}` : 'Sin tarea asignada',
      {
        fontSize: '11px',
        color: COLORS.texto,
        fontFamily: 'Courier New'
      }
    );

    // Botón para asignar tarea
    const btnX = x + 10;
    const btnY = y + 75;
    const btnWidth = 150;
    const btnHeight = 25;

    const btnBg = this.add.rectangle(
      btnX,
      btnY,
      btnWidth,
      btnHeight,
      hexToNumber(COLORS.cooperativa),
      char.available ? 1 : 0.3
    );
    btnBg.setOrigin(0, 0);

    const btnText = this.add.text(
      btnX + btnWidth / 2,
      btnY + btnHeight / 2,
      'Asignar Tarea',
      {
        fontSize: '12px',
        color: COLORS.textoOscuro,
        fontFamily: 'Courier New'
      }
    ).setOrigin(0.5);

    if (char.available) {
      btnBg.setInteractive({ useHandCursor: true });
      btnBg.on('pointerover', () => {
        btnBg.setAlpha(0.8);
      });
      btnBg.on('pointerout', () => {
        btnBg.setAlpha(1);
      });
      btnBg.on('pointerdown', () => {
        this.showTaskSelection(charKey);
      });
    }

    // Guardar referencias
    this.characterPanels.push({
      charKey,
      statusText,
      taskText,
      btnBg,
      btnText
    });
  }

  showTaskSelection(charKey) {
    // Crear modal de selección de tareas
    const modalWidth = 500;
    const modalHeight = 400;
    const modalX = (GAME_CONFIG.width - modalWidth) / 2;
    const modalY = (GAME_CONFIG.height - modalHeight) / 2;

    // Overlay oscuro
    const overlay = this.add.rectangle(
      0,
      0,
      GAME_CONFIG.width,
      GAME_CONFIG.height,
      0x000000,
      0.7
    );
    overlay.setOrigin(0, 0);
    overlay.setDepth(100);

    // Modal
    const modalBg = this.add.rectangle(
      modalX,
      modalY,
      modalWidth,
      modalHeight,
      hexToNumber(COLORS.panel),
      1
    );
    modalBg.setOrigin(0, 0);
    modalBg.setDepth(101);

    const modalBorder = this.add.rectangle(
      modalX,
      modalY,
      modalWidth,
      modalHeight
    );
    modalBorder.setOrigin(0, 0);
    modalBorder.setStrokeStyle(3, hexToNumber(COLORS.cooperativa));
    modalBorder.isFilled = false;
    modalBorder.setDepth(101);

    // Título
    const title = this.add.text(
      modalX + modalWidth / 2,
      modalY + 20,
      `Asignar tarea a ${gameState.characters[charKey].name}`,
      {
        fontSize: '16px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5, 0);
    title.setDepth(102);

    // Listar tareas
    const taskList = Object.values(this.tasks);
    let yPos = modalY + 60;
    const taskButtons = [];

    for (const task of taskList) {
      const taskBtnY = yPos;
      const canAfford = this.canAffordTask(task);

      // Fondo de tarea
      const taskBg = this.add.rectangle(
        modalX + 20,
        taskBtnY,
        modalWidth - 40,
        50,
        hexToNumber(COLORS.textoOscuro),
        canAfford ? 0.5 : 0.3
      );
      taskBg.setOrigin(0, 0);
      taskBg.setDepth(101);

      // Nombre de tarea
      const taskName = this.add.text(
        modalX + 30,
        taskBtnY + 5,
        task.name,
        {
          fontSize: '12px',
          color: canAfford ? COLORS.texto : COLORS.chapa,
          fontFamily: 'Courier New',
          fontStyle: 'bold'
        }
      );
      taskName.setDepth(102);

      // Duración y costo
      let costStr = `${task.duration} días`;
      if (task.cost && Object.keys(task.cost).length > 0) {
        for (const [resource, amount] of Object.entries(task.cost)) {
          costStr += ` | ${RESOURCE_ICONS[resource]} -${amount}`;
        }
      }

      const taskCost = this.add.text(
        modalX + 30,
        taskBtnY + 25,
        costStr,
        {
          fontSize: '10px',
          color: canAfford ? COLORS.cooperativa : COLORS.emergencia,
          fontFamily: 'Courier New'
        }
      );
      taskCost.setDepth(102);

      if (canAfford) {
        taskBg.setInteractive({ useHandCursor: true });
        taskBg.on('pointerover', () => taskBg.setAlpha(0.8));
        taskBg.on('pointerout', () => taskBg.setAlpha(0.5));
        taskBg.on('pointerdown', () => {
          this.assignTask(charKey, task);
          // Cerrar modal
          overlay.destroy();
          modalBg.destroy();
          modalBorder.destroy();
          title.destroy();
          taskButtons.forEach(btn => {
            btn.bg.destroy();
            btn.name.destroy();
            btn.cost.destroy();
          });
          closeBtn.destroy();
          closeBtnText.destroy();
        });
      }

      taskButtons.push({ bg: taskBg, name: taskName, cost: taskCost });
      yPos += 55;
    }

    // Botón cerrar
    const closeBtn = this.add.rectangle(
      modalX + modalWidth / 2 - 50,
      modalY + modalHeight - 40,
      100,
      30,
      hexToNumber(COLORS.emergencia),
      1
    );
    closeBtn.setOrigin(0, 0);
    closeBtn.setDepth(101);
    closeBtn.setInteractive({ useHandCursor: true });

    const closeBtnText = this.add.text(
      modalX + modalWidth / 2,
      modalY + modalHeight - 25,
      'Cerrar',
      {
        fontSize: '12px',
        color: COLORS.texto,
        fontFamily: 'Courier New'
      }
    ).setOrigin(0.5);
    closeBtnText.setDepth(102);

    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      modalBg.destroy();
      modalBorder.destroy();
      title.destroy();
      taskButtons.forEach(btn => {
        btn.bg.destroy();
        btn.name.destroy();
        btn.cost.destroy();
      });
      closeBtn.destroy();
      closeBtnText.destroy();
    });
  }

  canAffordTask(task) {
    if (!task.requirements || Object.keys(task.requirements).length === 0) {
      return true;
    }

    for (const [resource, amount] of Object.entries(task.requirements)) {
      if (gameState.resourceManager.get(resource) < amount) {
        return false;
      }
    }
    return true;
  }

  assignTask(charKey, task) {
    const char = gameState.characters[charKey];

    // Pagar costo
    if (task.cost && Object.keys(task.cost).length > 0) {
      gameState.resourceManager.pay(task.cost);
    }

    // Asignar tarea
    char.available = false;
    char.task = task.name;
    char.taskData = task;
    char.daysRemaining = task.duration;

    // Actualizar UI
    this.scene.restart();
  }

  createActionButtons() {
    const btnY = GAME_CONFIG.height - 60;

    // Botón avanzar tiempo
    const advanceBtn = this.add.rectangle(
      GAME_CONFIG.width / 2 - 120,
      btnY,
      200,
      40,
      hexToNumber(COLORS.cooperativa),
      1
    );
    advanceBtn.setOrigin(0, 0);
    advanceBtn.setInteractive({ useHandCursor: true });

    const advanceBtnText = this.add.text(
      GAME_CONFIG.width / 2 - 20,
      btnY + 20,
      'Avanzar 1 Día',
      {
        fontSize: '14px',
        color: COLORS.textoOscuro,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    advanceBtn.on('pointerover', () => advanceBtn.setAlpha(0.8));
    advanceBtn.on('pointerout', () => advanceBtn.setAlpha(1));
    advanceBtn.on('pointerdown', () => {
      this.advanceTime();
    });

    // Botón volver al mapa
    const backBtn = this.add.rectangle(
      GAME_CONFIG.width / 2 + 100,
      btnY,
      160,
      40,
      hexToNumber(COLORS.emergencia),
      1
    );
    backBtn.setOrigin(0, 0);
    backBtn.setInteractive({ useHandCursor: true });

    const backBtnText = this.add.text(
      GAME_CONFIG.width / 2 + 180,
      btnY + 20,
      'Volver al Mapa',
      {
        fontSize: '14px',
        color: COLORS.texto,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    backBtn.on('pointerover', () => backBtn.setAlpha(0.8));
    backBtn.on('pointerout', () => backBtn.setAlpha(1));
    backBtn.on('pointerdown', () => {
      this.scene.stop('ManagementScene');
      this.scene.resume('MapScene');
    });
  }

  advanceTime() {
    // Avanzar 1 día en el tiempo
    const triggeredEvents = gameState.timeManager.advanceDays(1);

    // Procesar tareas de personajes
    for (const charKey in gameState.characters) {
      const char = gameState.characters[charKey];

      if (!char.available && char.daysRemaining > 0) {
        char.daysRemaining--;

        // Si la tarea se completó
        if (char.daysRemaining === 0) {
          this.completeTask(charKey);
        }
      }
    }

    // Procesar eventos triggereados del TimeManager
    for (const event of triggeredEvents) {
      if (event.type === 'encounter') {
        // Guardar para lanzar después
        this.pendingEncounter = event.id;
      }
    }

    // Chequear game over antes de reiniciar
    this.checkGameOver();

    // Guardar después de avanzar tiempo
    gameState.saveManager.save();

    // Reiniciar escena para actualizar UI
    this.scene.restart();
  }

  checkGameOver() {
    const gameOverCheck = checkGameOverConditions();

    if (gameOverCheck.gameOver) {
      // Cerrar esta escena
      this.scene.stop();

      // Parar MapScene si está corriendo
      if (this.scene.isActive('MapScene')) {
        this.scene.stop('MapScene');
      }

      // Lanzar EndGameScene
      this.scene.launch('EndGameScene', {
        victory: gameOverCheck.victory,
        victoryType: gameOverCheck.victoryType,
        defeatReason: gameOverCheck.defeatReason
      });
    }
  }

  completeTask(charKey) {
    const char = gameState.characters[charKey];
    const task = char.taskData;

    if (!task) return;

    // Aplicar resultados de la tarea
    if (task.result) {
      // Aplicar cambios a recursos
      if (task.result.resources) {
        gameState.resourceManager.applyChanges(task.result.resources);
      }

      // Aplicar cambios a infraestructura
      if (task.result.infrastructure) {
        for (const [key, value] of Object.entries(task.result.infrastructure)) {
          gameState.infrastructure[key] = clamp(
            gameState.infrastructure[key] + value,
            0,
            100
          );
        }
      }

      // Mostrar mensaje (por ahora solo log)
      console.log(`${char.name}: ${task.result.message}`);
    }

    // Liberar personaje
    char.available = true;
    char.task = null;
    char.taskData = null;
    char.daysRemaining = 0;
  }

  setupControls() {
    // ESC para volver
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop('ManagementScene');
      this.scene.resume('MapScene');
    });
  }

  update() {
    // Si hay un encuentro pendiente, lanzarlo
    if (this.pendingEncounter) {
      const encounterId = this.pendingEncounter;
      this.pendingEncounter = null;

      // Volver al mapa y lanzar encuentro
      this.scene.stop('ManagementScene');
      this.scene.resume('MapScene');

      // Triggear el encuentro en MapScene
      setTimeout(() => {
        this.scene.get('MapScene').launchEncounter(encounterId);
      }, 100);
    }
  }
}
