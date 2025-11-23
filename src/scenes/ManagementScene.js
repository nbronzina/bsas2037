// ManagementScene.js - Gestión de base (REFACTORIZADO)

class ManagementScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ManagementScene' });
    this.tasks = null;
    this.selectedCharacter = null;
  }

  preload() {
    // Cargar tasks.json
    if (!this.cache.json.has('tasks')) {
      this.load.json('tasks', 'data/tasks.json');
    }
  }

  create() {
    console.log('ManagementScene started');

    // Cargar datos
    this.tasks = this.cache.json.get('tasks');

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // === FONDO ===
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // === BORDE PRINCIPAL ===
    const mainBorder = this.add.rectangle(width / 2, height / 2, width - 40, height - 40);
    mainBorder.setStrokeStyle(3, 0xd4a574);
    mainBorder.setFillStyle(0x1a1a1a, 0);

    // === HEADER ===
    const headerY = 35;

    this.add.text(width / 2, headerY, 'GESTIÓN DE BASE', {
      fontFamily: 'Courier New',
      fontSize: '26px',
      color: '#d4a574',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Indicador de día en header
    const currentDay = gameState.timeManager?.getCurrentDay() || gameState.currentDay || 1;
    this.add.text(width / 2, headerY + 30, `Día ${currentDay} / 60`, {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);

    // === LÍNEA DIVISORIA HEADER ===
    this.add.rectangle(width / 2, 85, width - 80, 2, 0xd4a574);

    // === SECCIÓN IZQUIERDA: INFRAESTRUCTURA ===
    const leftX = 50;
    const leftWidth = 310;

    this.add.text(leftX, 105, 'INFRAESTRUCTURA', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#d4a574',
      fontStyle: 'bold'
    }).setOrigin(0);

    // Borde sección izquierda
    const leftBorder = this.add.rectangle(leftX + leftWidth / 2, 295, leftWidth, 340);
    leftBorder.setStrokeStyle(2, 0xd4a574);
    leftBorder.setFillStyle(0x2a3a4a, 0.3);

    // Infraestructura (usando datos reales)
    this.createInfrastructureDisplay(leftX + 15, 140);

    // === SECCIÓN DERECHA: PERSONAJES ===
    const rightX = leftX + leftWidth + 40;
    const rightWidth = 350;

    this.add.text(rightX, 105, 'PERSONAJES', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#d4a574',
      fontStyle: 'bold'
    }).setOrigin(0);

    // Borde sección derecha
    const rightBorder = this.add.rectangle(rightX + rightWidth / 2, 295, rightWidth, 340);
    rightBorder.setStrokeStyle(2, 0xd4a574);
    rightBorder.setFillStyle(0x2a3a4a, 0.3);

    // CRÍTICO: Crear cards de TODOS los personajes (incluir Marcos)
    this.createCharacterCards(rightX + 15, 140);

    // === BOTONES INFERIORES ===
    const buttonsY = 515;
    const buttonSpacing = 180;

    // Botón Avanzar Día (izquierda)
    const advanceButton = this.add.text(
      width / 2 - buttonSpacing,
      buttonsY,
      `[ Avanzar al Día ${currentDay + 1} ]`,
      {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#000000',
        backgroundColor: '#ffaa00',
        padding: { x: 16, y: 8 }
      }
    ).setOrigin(0.5);

    // Click removido - usar solo teclado (SPACE para avanzar día)

    // Botón Volver al Mapa (derecha)
    const returnButton = this.add.text(
      width / 2 + buttonSpacing,
      buttonsY,
      '[ Volver al Mapa ]',
      {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#cc0000',
        padding: { x: 16, y: 8 }
      }
    ).setOrigin(0.5);

    // Click removido - usar solo teclado (TAB o ESC para volver)

    // === INSTRUCCIÓN INFERIOR (única, no duplicada) ===
    this.add.text(width / 2, 555, '[TAB o ESC para volver]', {
      fontFamily: 'Courier New',
      fontSize: '11px',
      color: '#666666'
    }).setOrigin(0.5);

    // === KEYBOARD INPUT ===
    this.input.keyboard.on('keydown-TAB', () => {
      console.log('TAB pressed - closing management');
      this.closeManagement();
    });

    this.input.keyboard.on('keydown-ESC', () => {
      console.log('ESC pressed - closing management');
      this.closeManagement();
    });

    console.log('ManagementScene created');
  }

  createCharacterCards(startX, startY) {
    console.log('Creating character cards');

    // CRÍTICO: Lista completa de personajes incluyendo Marcos
    const characters = [
      { name: 'VALERIA', color: '#0066ff', key: 'valeria' },
      { name: 'BETO', color: '#ff6600', key: 'beto' },
      { name: 'YANI', color: '#44aa44', key: 'yani' },
      { name: 'MARCOS', color: '#3366cc', key: 'marcos' }  // ← AGREGADO
    ];

    const cardHeight = 68;
    const cardSpacing = 8;

    characters.forEach((char, index) => {
      const cardY = startY + (index * (cardHeight + cardSpacing));
      this.createCharacterCard(char.name, char.color, char.key, startX, cardY);
    });
  }

  createCharacterCard(characterName, color, charKey, x, y) {
    const cardWidth = 310;
    const cardHeight = 68;

    // Fondo de card
    const cardBg = this.add.rectangle(x + cardWidth / 2, y + cardHeight / 2, cardWidth, cardHeight);
    cardBg.setStrokeStyle(2, parseInt(color.replace('#', '0x')));
    cardBg.setFillStyle(0x2a2a2a, 0.5);

    // Nombre del personaje
    this.add.text(x + 8, y + 6, characterName, {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: color,
      fontStyle: 'bold'
    }).setOrigin(0);

    // Estado (simplificado)
    const stateText = this.getCharacterState(charKey);

    this.add.text(x + 8, y + 25, stateText, {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: stateText.includes('Tarea') ? '#ffaa00' : '#00ff00'
    }).setOrigin(0);

    // Botón Asignar Tarea
    const assignButton = this.add.text(
      x + 8,
      y + 44,
      '[ Asignar Tarea ]',
      {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#000000',
        backgroundColor: '#ffaa00',
        padding: { x: 8, y: 4 }
      }
    ).setOrigin(0);

    // Click removido - usar solo teclado (números 1-3)
  }

  getCharacterState(charKey) {
    // Obtener estado real del personaje
    const char = gameState.characters?.[charKey];

    if (!char) {
      return 'Estado: N/A';
    }

    if (!char.available && char.daysRemaining > 0) {
      const taskName = char.task || 'Desconocida';
      return `Tarea: ${taskName} (${char.daysRemaining} días)`;
    }

    return 'Estado: Disponible';
  }

  createInfrastructureDisplay(x, y) {
    console.log('Creating infrastructure display');

    // Obtener estado real de infraestructura
    const infrastructure = [
      {
        name: 'Transformador A',
        health: gameState.infrastructure?.transformadorA || 90,
        color: 0x00ff00
      },
      {
        name: 'Transformador B',
        health: gameState.infrastructure?.transformadorB || 40,
        color: 0x0088ff
      },
      {
        name: 'Perforación 1',
        health: gameState.infrastructure?.perforacion1 || 100,
        color: 0x00ff00
      }
    ];

    const itemHeight = 60;

    infrastructure.forEach((item, index) => {
      const itemY = y + (index * itemHeight);

      // Nombre
      this.add.text(x, itemY, item.name, {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0);

      // Barra de salud
      const barWidth = 200;
      const barHeight = 20;
      const barY = itemY + 25;

      // Fondo gris
      this.add.rectangle(x + barWidth / 2, barY, barWidth, barHeight, 0x333333);

      // Barra de progreso
      const healthWidth = (item.health / 100) * barWidth;
      this.add.rectangle(x + healthWidth / 2, barY, healthWidth, barHeight, item.color);

      // Borde
      const barBorder = this.add.rectangle(x + barWidth / 2, barY, barWidth, barHeight);
      barBorder.setStrokeStyle(2, 0x666666);
      barBorder.setFillStyle(0x000000, 0);

      // Porcentaje
      this.add.text(x + barWidth + 15, barY, `${item.health}%`, {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0, 0.5);
    });
  }

  closeManagement() {
    console.log('Closing ManagementScene');

    // Limpiar keyboard listeners
    this.input.keyboard.off('keydown-TAB');
    this.input.keyboard.off('keydown-ESC');

    // Volver al mapa
    this.scene.resume('MapScene');
    this.scene.stop('ManagementScene');
  }

  advanceDay() {
    console.log('=== ADVANCING DAY FROM MANAGEMENT ===');

    // Avanzar tiempo
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

    // Procesar eventos triggerados
    this.pendingEncounter = null;
    for (const event of triggeredEvents) {
      if (event.type === 'encounter') {
        this.pendingEncounter = event.id;
      }
    }

    // Chequear game over
    this.checkGameOver();

    // Guardar
    gameState.saveManager.save();

    // Si hay encuentro pendiente, cerrar y lanzarlo
    if (this.pendingEncounter) {
      const encounterId = this.pendingEncounter;
      this.scene.stop('ManagementScene');
      this.scene.resume('MapScene');

      this.time.delayedCall(100, () => {
        this.scene.get('MapScene').launchEncounter(encounterId);
      });
    } else {
      // Reiniciar escena para actualizar UI
      this.scene.restart();
    }
  }

  checkGameOver() {
    const gameOverCheck = checkGameOverConditions();

    if (gameOverCheck.gameOver) {
      this.scene.stop();

      if (this.scene.isActive('MapScene')) {
        this.scene.stop('MapScene');
      }

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

    if (!task) {
      char.available = true;
      char.task = null;
      char.taskData = null;
      char.daysRemaining = 0;
      return;
    }

    // Aplicar resultados de la tarea
    if (task.result) {
      if (task.result.resources) {
        gameState.resourceManager.applyChanges(task.result.resources);
      }

      if (task.result.infrastructure) {
        for (const [key, value] of Object.entries(task.result.infrastructure)) {
          gameState.infrastructure[key] = clamp(
            gameState.infrastructure[key] + value,
            0,
            100
          );
        }
      }

      console.log(`${char.name}: ${task.result.message}`);
    }

    // Liberar personaje
    char.available = true;
    char.task = null;
    char.taskData = null;
    char.daysRemaining = 0;
  }

  openTaskAssignment(charKey) {
    console.log('Opening task assignment for:', charKey);

    const char = gameState.characters[charKey];

    if (!char) {
      console.error('Character not found:', charKey);
      return;
    }

    // Verificar si ya tiene tarea asignada
    if (!char.available) {
      console.log('Character is busy with task');
      return;
    }

    this.selectedCharacter = charKey;

    // Crear overlay oscuro
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    overlay.setOrigin(0.5);
    overlay.setDepth(1000);

    // Panel de tareas
    const panelWidth = 600;
    const panelHeight = 500;
    const panel = this.add.rectangle(400, 300, panelWidth, panelHeight, 0x1a1a1a);
    panel.setStrokeStyle(3, 0xd4a574);
    panel.setDepth(1001);

    // Título
    const title = this.add.text(400, 80, `ASIGNAR TAREA - ${char.name.toUpperCase()}`, {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#d4a574',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1002);

    // Crear lista de tareas
    const tasksStartY = 120;
    const taskSpacing = 70;
    let taskIndex = 0;

    const taskElements = [overlay, panel, title];

    // Obtener tareas del cache
    const tasks = this.tasks || {};

    Object.values(tasks).forEach((task, index) => {
      const taskY = tasksStartY + (index * taskSpacing);

      // Verificar si se cumplen los requisitos
      const canAfford = this.checkTaskRequirements(task);
      const taskColor = canAfford ? '#ffffff' : '#666666';

      // Nombre de tarea
      const taskName = this.add.text(120, taskY, task.name, {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: taskColor,
        fontStyle: 'bold'
      }).setOrigin(0).setDepth(1002);

      // Duración y costo
      let costText = `${task.duration}d`;
      if (task.cost && task.cost.creditos) {
        costText += ` | $${task.cost.creditos}`;
      }

      const taskInfo = this.add.text(120, taskY + 20, costText, {
        fontFamily: 'Courier New',
        fontSize: '11px',
        color: '#888888'
      }).setOrigin(0).setDepth(1002);

      // Botón Asignar
      const assignBtn = this.add.text(500, taskY + 10, '[ Asignar ]', {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: canAfford ? '#000000' : '#444444',
        backgroundColor: canAfford ? '#ffaa00' : '#333333',
        padding: { x: 12, y: 5 }
      }).setOrigin(0.5).setDepth(1002);

      // Click removido - usar solo teclado (números 1-9 según índice de tarea)

      taskElements.push(taskName, taskInfo, assignBtn);
    });

    // Botón Cerrar
    const closeBtn = this.add.text(400, 520, '[ Cancelar ]', {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#cc0000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setDepth(1002);

    // Click removido - usar solo teclado (ESC para cancelar)

    taskElements.push(closeBtn);
  }

  checkTaskRequirements(task) {
    // Verificar si se tienen los recursos necesarios
    if (!task.requirements) {
      return true;
    }

    if (task.requirements.creditos) {
      const currentCredits = gameState.resourceManager.get('creditos');
      if (currentCredits < task.requirements.creditos) {
        return false;
      }
    }

    return true;
  }

  assignTaskToCharacter(charKey, task) {
    console.log('Assigning task:', task.id, 'to', charKey);

    const char = gameState.characters[charKey];

    if (!char) {
      console.error('Character not found:', charKey);
      return;
    }

    // Descontar costos
    if (task.cost) {
      if (task.cost.creditos) {
        gameState.resourceManager.modify('creditos', -task.cost.creditos);
      }
    }

    // Asignar tarea al personaje
    char.available = false;
    char.task = task.name;
    char.taskId = task.id;
    char.taskData = task; // CRÍTICO: guardar datos completos de la tarea
    char.daysRemaining = task.duration;

    console.log('Task assigned successfully:', char);

    // Guardar automáticamente
    gameState.saveManager.save();
  }

  shutdown() {
    // Cleanup keyboard listeners
    this.input.keyboard.off('keydown-TAB');
    this.input.keyboard.off('keydown-ESC');
  }
}
