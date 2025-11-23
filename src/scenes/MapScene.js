// MapScene.js - Escena principal de exploración

class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapScene' });
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.interactKey = null;
    this.mapWidth = GAME_CONFIG.mapWidth;
    this.mapHeight = GAME_CONFIG.mapHeight;
    this.tileSize = GAME_CONFIG.tileSize;

    // Sistema de diálogos
    this.dialogues = null;
    this.dialogueBox = null;
    this.isDialogueActive = false;
    this.npcs = [];
    this.nearbyNPC = null;
  }

  preload() {
    // Cargar data JSON
    this.load.json('dialogues', 'data/dialogues.json');
    this.load.json('encounters', 'data/encounters.json');

    // Crear sprites placeholder usando la función helper
    this.createPlaceholderSprites();
  }

  createPlaceholderSprites() {
    // Sprites de personajes
    createPlaceholderSprite(this, 'valeria', 0xFF0000, this.tileSize, this.tileSize); // Rojo
    createPlaceholderSprite(this, 'beto', 0x0000FF, this.tileSize, this.tileSize);    // Azul
    createPlaceholderSprite(this, 'yani', 0x00FF00, this.tileSize, this.tileSize);    // Verde
    createPlaceholderSprite(this, 'npc_generic', 0xFFFF00, this.tileSize, this.tileSize); // Amarillo

    // Sprites de tiles
    createPlaceholderSprite(this, 'piso_tierra', hexToNumber(COLORS.tierra), this.tileSize, this.tileSize);
    createPlaceholderSprite(this, 'pared_chapa', hexToNumber(COLORS.chapa), this.tileSize, this.tileSize);
    createPlaceholderSprite(this, 'pared_ladrillo', hexToNumber(COLORS.ladrillo), this.tileSize, this.tileSize);
    createPlaceholderSprite(this, 'puerta', hexToNumber(COLORS.verde), this.tileSize, this.tileSize);
  }

  create() {
    // Cargar datos JSON
    this.dialogues = this.cache.json.get('dialogues');
    this.encounters = this.cache.json.get('encounters');

    // Crear el mapa del mundo
    this.createWorldMap();

    // Crear jugador
    this.createPlayer();

    // Crear NPCs
    this.createNPCs();

    // Configurar controles
    this.setupControls();

    // Configurar cámara
    this.setupCamera();

    // Crear sistema de diálogos
    this.createDialogueSystem();

    // UI de debug
    this.createDebugUI();

    // UI de recursos
    this.createResourcesUI();

    // UI de tiempo
    this.createTimeUI();

    // UI de audio
    this.createAudioControls();

    // Iniciar música del mapa
    gameState.audioManager.playMapTheme();

    // Iniciar auto-guardado (solo una vez, cuando comienza el gameplay)
    if (!gameState.saveManager.autoSaveTimer) {
      gameState.saveManager.startAutoSave();
      console.log('Auto-guardado iniciado');
    }
  }

  createWorldMap() {
    // Grupo de tiles del suelo (no tienen colisión)
    this.groundTiles = this.add.group();

    // Grupo de tiles de paredes (tienen colisión)
    this.wallTiles = this.physics.add.staticGroup();

    // Crear mapa simple de Villa Soldati
    // Llenar todo con piso de tierra
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const tile = this.add.image(
          x * this.tileSize + this.tileSize / 2,
          y * this.tileSize + this.tileSize / 2,
          'piso_tierra'
        );
        this.groundTiles.add(tile);
      }
    }

    // Crear paredes en el borde del mapa
    for (let x = 0; x < this.mapWidth; x++) {
      // Pared superior
      const topWall = this.wallTiles.create(
        x * this.tileSize + this.tileSize / 2,
        0 * this.tileSize + this.tileSize / 2,
        'pared_chapa'
      );
      topWall.setImmovable(true);

      // Pared inferior
      const bottomWall = this.wallTiles.create(
        x * this.tileSize + this.tileSize / 2,
        (this.mapHeight - 1) * this.tileSize + this.tileSize / 2,
        'pared_chapa'
      );
      bottomWall.setImmovable(true);
    }

    for (let y = 1; y < this.mapHeight - 1; y++) {
      // Pared izquierda
      const leftWall = this.wallTiles.create(
        0 * this.tileSize + this.tileSize / 2,
        y * this.tileSize + this.tileSize / 2,
        'pared_chapa'
      );
      leftWall.setImmovable(true);

      // Pared derecha
      const rightWall = this.wallTiles.create(
        (this.mapWidth - 1) * this.tileSize + this.tileSize / 2,
        y * this.tileSize + this.tileSize / 2,
        'pared_chapa'
      );
      rightWall.setImmovable(true);
    }

    // Crear algunas estructuras internas (edificios, etc.)
    this.createBuildings();
  }

  createBuildings() {
    // Edificio 1: Casa de la cooperativa (10x10 tiles)
    for (let y = 5; y < 15; y++) {
      for (let x = 5; x < 15; x++) {
        // Solo paredes en el perímetro
        if (x === 5 || x === 14 || y === 5 || y === 14) {
          const wall = this.wallTiles.create(
            x * this.tileSize + this.tileSize / 2,
            y * this.tileSize + this.tileSize / 2,
            'pared_ladrillo'
          );
          wall.setImmovable(true);
        }
      }
    }

    // Puerta del edificio 1
    const puerta1 = this.add.image(
      10 * this.tileSize + this.tileSize / 2,
      14 * this.tileSize + this.tileSize / 2,
      'puerta'
    );

    // Edificio 2: Más pequeño (6x6 tiles)
    for (let y = 20; y < 26; y++) {
      for (let x = 20; x < 26; x++) {
        if (x === 20 || x === 25 || y === 20 || y === 25) {
          const wall = this.wallTiles.create(
            x * this.tileSize + this.tileSize / 2,
            y * this.tileSize + this.tileSize / 2,
            'pared_chapa'
          );
          wall.setImmovable(true);
        }
      }
    }
  }

  createPlayer() {
    // Crear sprite de Valeria en el centro del mapa
    const startX = this.mapWidth * this.tileSize / 2;
    const startY = this.mapHeight * this.tileSize / 2;

    this.player = this.physics.add.sprite(startX, startY, 'valeria');
    this.player.setCollideWorldBounds(false); // Usaremos las paredes en vez de bounds

    // Configurar física
    this.player.body.setSize(this.tileSize - 2, this.tileSize - 2); // Un poco más chico para mejor movimiento
    this.player.setDepth(10); // Asegurar que el jugador esté por encima de tiles

    // Colisión con paredes
    this.physics.add.collider(this.player, this.wallTiles);
  }

  createNPCs() {
    // Crear Beto cerca del edificio de la cooperativa
    const beto = this.add.sprite(
      12 * this.tileSize,
      18 * this.tileSize,
      'beto'
    );
    beto.setDepth(10);
    beto.npcData = {
      name: 'Beto',
      dialogue: 'beto_saludo',
      timesSpokenTo: 0
    };
    this.npcs.push(beto);

    // Indicador visual de que es interactivo
    const betoIndicator = this.add.text(
      beto.x,
      beto.y - this.tileSize,
      '!',
      {
        fontSize: '12px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New'
      }
    ).setOrigin(0.5);
    betoIndicator.setDepth(11);
    beto.indicator = betoIndicator;
  }

  createDialogueSystem() {
    // No crear la caja aún, solo preparar el sistema
    // La caja se creará cuando se active un diálogo
  }

  setupControls() {
    // Flechas
    this.cursors = this.input.keyboard.createCursorKeys();

    // WASD
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // Tecla de interacción (ENTER)
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // Tecla de gestión (TAB)
    this.managementKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
  }

  setupCamera() {
    // Configurar cámara para seguir al jugador
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Establecer bounds de la cámara
    this.cameras.main.setBounds(
      0,
      0,
      this.mapWidth * this.tileSize,
      this.mapHeight * this.tileSize
    );

    // Zoom opcional (descomentar si querés zoom)
    // this.cameras.main.setZoom(2);
  }

  createDebugUI() {
    // Texto fijo en la pantalla (no se mueve con la cámara)
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',  // Semi-transparente en vez de negro sólido
      padding: { x: 5, y: 5 },
      fontFamily: 'Courier New'
    });
    this.debugText.setScrollFactor(0); // Fijar en pantalla
    this.debugText.setDepth(100); // Por encima de todo
    this.debugText.setVisible(false);  // OCULTO por defecto - solo visible cuando hay texto
  }

  createResourcesUI() {
    // Panel de recursos en la esquina superior derecha
    const panelWidth = 200;
    const panelHeight = 140;
    const panelX = GAME_CONFIG.width - panelWidth - 10;
    const panelY = 10;

    // Fondo del panel (NO en contenedor - posición absoluta)
    const bg = this.add.rectangle(
      panelX,
      panelY,
      panelWidth,
      panelHeight,
      hexToNumber(COLORS.panel),
      0.95  // Más opaco para mejor visibilidad
    );
    bg.setOrigin(0, 0);
    bg.setScrollFactor(0);
    bg.setDepth(98);

    const border = this.add.rectangle(
      panelX,
      panelY,
      panelWidth,
      panelHeight
    );
    border.setOrigin(0, 0);
    border.setStrokeStyle(2, hexToNumber(COLORS.cooperativa));
    border.isFilled = false;
    border.setScrollFactor(0);
    border.setDepth(98);

    // Título
    const title = this.add.text(
      panelX + 10,
      panelY + 5,
      'RECURSOS',
      {
        fontSize: '12px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    );
    title.setScrollFactor(0);
    title.setDepth(99);

    // Textos de recursos (se actualizarán cada frame)
    this.resourceTexts = {};
    const startY = panelY + 25;
    const lineHeight = 20;
    let index = 0;

    const resourceKeys = ['creditos', 'electricidad', 'agua', 'legitimidad', 'autonomia'];

    for (const key of resourceKeys) {
      const text = this.add.text(
        panelX + 10,
        startY + (index * lineHeight),
        '',
        {
          fontSize: '11px',
          color: COLORS.texto,
          fontFamily: 'Courier New'
        }
      );
      text.setScrollFactor(0);
      text.setDepth(99);

      this.resourceTexts[key] = text;
      index++;
    }

    // Actualizar valores iniciales
    this.updateResourcesUI();
  }

  updateResourcesUI() {
    const rm = gameState.resourceManager;
    const icons = RESOURCE_ICONS;

    // Actualizar cada recurso
    this.resourceTexts.creditos.setText(
      `${icons.creditos} ${formatNumber(rm.get('creditos'))}`
    );

    this.resourceTexts.electricidad.setText(
      `${icons.electricidad} ${rm.get('electricidad')}%`
    );

    this.resourceTexts.agua.setText(
      `${icons.agua} ${rm.get('agua')}%`
    );

    this.resourceTexts.legitimidad.setText(
      `${icons.legitimidad} ${rm.get('legitimidad')}%`
    );

    this.resourceTexts.autonomia.setText(
      `${icons.autonomia} ${rm.get('autonomia')}%`
    );

    // Cambiar color si está bajo
    this.resourceTexts.electricidad.setColor(
      rm.get('electricidad') < 30 ? COLORS.emergencia : COLORS.texto
    );

    this.resourceTexts.agua.setColor(
      rm.get('agua') < 30 ? COLORS.emergencia : COLORS.texto
    );

    this.resourceTexts.legitimidad.setColor(
      rm.get('legitimidad') < 20 ? COLORS.emergencia : COLORS.texto
    );

    // Alerta de sonido si recursos críticos (solo una vez)
    if (!this.criticalAlertPlayed) {
      if (rm.get('electricidad') < 20 || rm.get('agua') < 20 || rm.get('legitimidad') < 15) {
        gameState.audioManager.playAlertSound();
        this.criticalAlertPlayed = true;

        // Reset después de 10 segundos para que pueda volver a alertar
        setTimeout(() => {
          this.criticalAlertPlayed = false;
        }, 10000);
      }
    }
  }

  createTimeUI() {
    // Panel de tiempo debajo del panel de recursos
    const panelWidth = 200;
    const panelHeight = 80;
    const panelX = GAME_CONFIG.width - panelWidth - 10;
    const panelY = 160; // Debajo del panel de recursos

    // Contenedor
    this.timePanel = this.add.container(0, 0);
    this.timePanel.setScrollFactor(0);
    this.timePanel.setDepth(99);

    // Fondo
    const bg = this.add.rectangle(
      panelX,
      panelY,
      panelWidth,
      panelHeight,
      hexToNumber(COLORS.panel),
      0.9
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
    const title = this.add.text(
      panelX + 10,
      panelY + 5,
      'TIEMPO',
      {
        fontSize: '12px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    );

    // Texto de día actual
    this.dayText = this.add.text(
      panelX + 10,
      panelY + 25,
      '',
      {
        fontSize: '12px',  // Reducido de 14px a 12px para mejor proporción
        color: COLORS.texto,
        fontFamily: 'Courier New'
      }
    );

    // Barra de progreso
    this.progressBar = this.add.rectangle(
      panelX + 10,
      panelY + 55,
      panelWidth - 20,
      10,
      hexToNumber(COLORS.textoOscuro),
      1
    );
    this.progressBar.setOrigin(0, 0);

    this.progressBarFill = this.add.rectangle(
      panelX + 10,
      panelY + 55,
      0,
      10,
      hexToNumber(COLORS.cooperativa),
      1
    );
    this.progressBarFill.setOrigin(0, 0);

    // Agregar al contenedor
    this.timePanel.add([bg, border, title, this.dayText, this.progressBar, this.progressBarFill]);

    // Actualizar valores iniciales
    this.updateTimeUI();
  }

  updateTimeUI() {
    const tm = gameState.timeManager;
    const day = tm.getCurrentDay();
    const maxDays = tm.maxDays;
    const progress = tm.getProgress();

    this.dayText.setText(`Día ${day} / ${maxDays}`);

    // Actualizar barra de progreso
    const maxWidth = 180;
    const fillWidth = (progress / 100) * maxWidth;
    this.progressBarFill.width = fillWidth;

    // Cambiar color si está cerca del final
    if (progress > 80) {
      this.progressBarFill.setFillStyle(hexToNumber(COLORS.emergencia));
    } else if (progress > 60) {
      this.progressBarFill.setFillStyle(hexToNumber(COLORS.agua));
    } else {
      this.progressBarFill.setFillStyle(hexToNumber(COLORS.cooperativa));
    }
  }

  createAudioControls() {
    // Controles de audio en esquina inferior izquierda
    const btnSize = 32;
    const btnX = 10;
    const btnY = GAME_CONFIG.height - btnSize - 10;

    // Botón de mute/unmute
    this.muteButton = this.add.rectangle(btnX, btnY, btnSize, btnSize, hexToNumber(COLORS.panel), 0.9);
    this.muteButton.setOrigin(0, 0);
    this.muteButton.setScrollFactor(0);
    this.muteButton.setDepth(100);
    this.muteButton.setInteractive({ useHandCursor: true });

    this.muteButtonText = this.add.text(
      btnX + btnSize / 2,
      btnY + btnSize / 2,
      gameState.audioManager.muted ? '🔇' : '🔊',
      {
        fontSize: '18px',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);
    this.muteButtonText.setScrollFactor(0);
    this.muteButtonText.setDepth(101);

    this.muteButton.on('pointerover', () => {
      this.muteButton.setAlpha(0.7);
    });

    this.muteButton.on('pointerout', () => {
      this.muteButton.setAlpha(1);
    });

    this.muteButton.on('pointerdown', () => {
      const muted = gameState.audioManager.toggleMute();
      this.muteButtonText.setText(muted ? '🔇' : '🔊');
      gameState.audioManager.playConfirmSound();
    });

    // Tecla M para mutear
    this.input.keyboard.on('keydown-M', () => {
      const muted = gameState.audioManager.toggleMute();
      this.muteButtonText.setText(muted ? '🔇' : '🔊');
    });
  }

  advanceTime(days = 1) {
    // Sonido de avance de tiempo
    gameState.audioManager.playTimeAdvanceSound();

    const tm = gameState.timeManager;
    const triggeredEvents = tm.advanceDays(days);

    // Procesar eventos triggerados
    for (const event of triggeredEvents) {
      if (event.type === 'encounter') {
        // Lanzar encuentro
        setTimeout(() => {
          this.launchEncounter(event.id);
        }, 500);
      } else if (event.type === 'event') {
        // Mostrar notificación de evento
        console.log(`Evento: ${event.id}`);
      }
    }

    // Actualizar UI
    this.updateTimeUI();

    // Chequear game over
    if (tm.isGameOver()) {
      this.handleGameOver();
    }
  }

  handleGameOver() {
    const gameOverCheck = checkGameOverConditions();

    if (gameOverCheck.gameOver) {
      // Pausar esta escena
      this.scene.pause();

      // Lanzar EndGameScene
      this.scene.launch('EndGameScene', {
        victory: gameOverCheck.victory,
        victoryType: gameOverCheck.victoryType,
        defeatReason: gameOverCheck.defeatReason
      });
    }
  }

  update() {
    if (!this.player) return;

    // Si hay diálogo activo, manejar eso en vez de movimiento
    if (this.isDialogueActive) {
      this.handleDialogueInput();
      return;
    }

    // Movimiento del jugador
    const speed = 100; // píxeles por segundo
    let velocityX = 0;
    let velocityY = 0;

    // Detectar input
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocityY = speed;
    }

    // Normalizar velocidad diagonal
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707; // Math.sqrt(2) / 2
      velocityY *= 0.707;
    }

    // Aplicar velocidad
    this.player.setVelocity(velocityX, velocityY);

    // Detectar NPCs cercanos
    this.checkNearbyNPCs();

    // Detectar interacción con ENTER
    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.nearbyNPC) {
      this.startDialogue(this.nearbyNPC);
    }

    // Detectar TAB para abrir gestión
    if (Phaser.Input.Keyboard.JustDown(this.managementKey)) {
      this.openManagementScene();
    }

    // Debug: modificar recursos con teclas numéricas (solo para testeo)
    this.handleDebugInput();

    // Actualizar UIs
    this.updateResourcesUI();
    this.updateDebugUI();

    // Chequear game over (defeat por recursos)
    this.handleGameOver();
  }

  handleDebugInput() {
    // [1] Quitar créditos
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('ONE'))) {
      gameState.resourceManager.modify('creditos', -500);
    }
    // [2] Agregar créditos
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('TWO'))) {
      gameState.resourceManager.modify('creditos', 500);
    }
    // [3] Bajar electricidad
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('THREE'))) {
      gameState.resourceManager.modify('electricidad', -10);
    }
    // [4] Subir electricidad
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('FOUR'))) {
      gameState.resourceManager.modify('electricidad', 10);
    }
    // [E] Lanzar encuentro "Primera Asamblea" (debug)
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('E'))) {
      this.launchEncounter('primera_asamblea');
    }
    // [T] Avanzar 1 día (debug)
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('T'))) {
      this.advanceTime(1);
    }
    // [F5] Guardar partida
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('F5'))) {
      gameState.saveManager.save();
      console.log('Partida guardada manualmente');
    }
    // [F9] Cargar partida
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('F9'))) {
      if (gameState.saveManager.load()) {
        this.scene.restart();
        console.log('Partida cargada');
      }
    }
  }

  updateDebugUI() {
    const tileX = Math.floor(this.player.x / this.tileSize);
    const tileY = Math.floor(this.player.y / this.tileSize);

    const lines = [
      'FASE 6: GESTIÓN DE BASE',
      `Posición: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `Día: ${gameState.timeManager.getCurrentDay()}`,
      ''
    ];

    if (this.nearbyNPC) {
      lines.push(`Cerca de: ${this.nearbyNPC.npcData.name}`);
      lines.push('Presioná ENTER para hablar');
    } else {
      lines.push('WASD/Flechas: Mover');
      lines.push('TAB: Gestión de Base');
      lines.push('Acercate a Beto (cuadrado azul)');
    }

    lines.push('');
    lines.push('DEBUG: T=+1día E=Asamblea 1/2=💰');

    this.debugText.setText(lines);
  }

  // Sistema de diálogos

  checkNearbyNPCs() {
    this.nearbyNPC = null;

    for (const npc of this.npcs) {
      const dist = distance(this.player.x, this.player.y, npc.x, npc.y);

      if (dist < 32) { // Distancia de interacción
        this.nearbyNPC = npc;
        // Hacer parpadear el indicador
        npc.indicator.setAlpha(0.5 + Math.sin(this.time.now / 200) * 0.5);
        break;
      } else {
        npc.indicator.setAlpha(1);
      }
    }
  }

  startDialogue(npc) {
    // Sonido de interacción
    gameState.audioManager.playInteractSound();

    // Detener al jugador
    this.player.setVelocity(0, 0);

    // Activar estado de diálogo
    this.isDialogueActive = true;

    // Obtener el diálogo correcto
    let dialogueKey = npc.npcData.dialogue;

    // Si ya hablamos con este NPC, usar diálogo alternativo si existe
    if (npc.npcData.timesSpokenTo > 0 && this.dialogues['beto_segunda_vez']) {
      dialogueKey = 'beto_segunda_vez';
    }

    const dialogue = this.dialogues[dialogueKey];

    if (!dialogue) {
      console.error(`Diálogo no encontrado: ${dialogueKey}`);
      this.isDialogueActive = false;
      return;
    }

    // Crear la caja de diálogo
    this.createDialogueBox(dialogue);

    // Incrementar contador
    npc.npcData.timesSpokenTo++;

    // Mostrar primera línea
    this.currentDialogue = dialogue;
    this.currentLineIndex = 0;
    this.showDialogueLine();
  }

  createDialogueBox(dialogue) {
    // Destruir caja anterior si existe
    if (this.dialogueBox) {
      this.dialogueBox.destroy();
    }

    // Crear contenedor
    this.dialogueBox = this.add.container(0, 0);
    this.dialogueBox.setScrollFactor(0);
    this.dialogueBox.setDepth(200);

    // Fondo de la caja (parte inferior de la pantalla)
    const boxHeight = 120;
    const boxY = GAME_CONFIG.height - boxHeight;

    const bg = this.add.rectangle(
      0,
      boxY,
      GAME_CONFIG.width,
      boxHeight,
      hexToNumber(COLORS.panel),
      0.95
    );
    bg.setOrigin(0, 0);

    const border = this.add.rectangle(
      0,
      boxY,
      GAME_CONFIG.width,
      boxHeight
    );
    border.setOrigin(0, 0);
    border.setStrokeStyle(2, hexToNumber(COLORS.cooperativa));
    border.isFilled = false;

    // Texto del speaker
    this.dialogueSpeakerText = this.add.text(
      20,
      boxY + 10,
      dialogue.speaker,
      {
        fontSize: '16px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    );

    // Texto del diálogo
    this.dialogueLineText = this.add.text(
      20,
      boxY + 35,
      '',
      {
        fontSize: '14px',
        color: COLORS.texto,
        fontFamily: 'Courier New',
        wordWrap: { width: GAME_CONFIG.width - 40 }
      }
    );

    // Indicador de continuar
    this.dialogueContinueText = this.add.text(
      GAME_CONFIG.width - 80,
      boxY + boxHeight - 25,
      '[ENTER ▶]',
      {
        fontSize: '12px',
        color: COLORS.cooperativa,
        fontFamily: 'Courier New'
      }
    );

    // Agregar todo al contenedor
    this.dialogueBox.add([bg, border, this.dialogueSpeakerText, this.dialogueLineText, this.dialogueContinueText]);
  }

  showDialogueLine() {
    if (!this.currentDialogue || !this.currentDialogue.lines) return;

    const line = this.currentDialogue.lines[this.currentLineIndex];
    this.dialogueLineText.setText(line);

    // Si es la última línea, cambiar el indicador
    if (this.currentLineIndex >= this.currentDialogue.lines.length - 1) {
      this.dialogueContinueText.setText('[ENTER ✓]');
    }
  }

  handleDialogueInput() {
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.advanceDialogue();
    }
  }

  advanceDialogue() {
    this.currentLineIndex++;

    if (this.currentLineIndex < this.currentDialogue.lines.length) {
      // Mostrar siguiente línea
      this.showDialogueLine();
    } else {
      // Terminar diálogo
      this.closeDialogue();
    }
  }

  closeDialogue() {
    this.isDialogueActive = false;
    this.currentDialogue = null;
    this.currentLineIndex = 0;

    if (this.dialogueBox) {
      this.dialogueBox.destroy();
      this.dialogueBox = null;
    }

    // Después de cerrar el diálogo, verificar si hay un encuentro pendiente
    // (por ejemplo, hablar con Beto 2 veces triggea Primera Asamblea)
    if (this.nearbyNPC && this.nearbyNPC.npcData.name === 'Beto') {
      if (this.nearbyNPC.npcData.timesSpokenTo >= 2 && !gameState.flags.includes('primera_asamblea_completada')) {
        // Lanzar Primera Asamblea
        setTimeout(() => {
          this.launchEncounter('primera_asamblea');
        }, 500);
      }
    }
  }

  // Sistema de encuentros

  launchEncounter(encounterId) {
    if (!this.encounters[encounterId]) {
      console.error(`Encuentro no encontrado: ${encounterId}`);
      return;
    }

    // Pausar MapScene
    this.scene.pause();

    // Lanzar EncounterScene
    this.scene.launch('EncounterScene', {
      encounter: this.encounters[encounterId]
    });

    // Marcar flag de que se lanzó
    gameState.flags.push(`${encounterId}_launched`);
  }

  // Sistema de gestión

  openManagementScene() {
    // Detener al jugador
    this.player.setVelocity(0, 0);

    // Pausar MapScene
    this.scene.pause();

    // Lanzar ManagementScene
    this.scene.launch('ManagementScene');
  }
}
