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

    // Tutorial shown flag
    this.tutorialShown = false;

    // Paleta de colores mejorada (16-bit style)
    this.SPRITE_COLORS = {
      // Jugador (Valeria)
      PLAYER: 0x0066ff,        // Azul brillante
      PLAYER_LIGHT: 0x3399ff,  // Azul claro (cabeza)
      PLAYER_BORDER: 0xffffff, // Borde blanco

      // Beto (naranja - electricidad)
      NPC: 0xff6600,           // Naranja
      NPC_LIGHT: 0xffaa00,     // Naranja claro (cabeza)
      NPC_BORDER: 0xffff00,    // Borde amarillo

      // Yani (verde - salud)
      YANI: 0x44aa44,
      YANI_LIGHT: 0x66cc66,
      YANI_BORDER: 0x88ee88,

      // Marcos (azul - agua)
      MARCOS: 0x3366cc,
      MARCOS_LIGHT: 0x5588ee,
      MARCOS_BORDER: 0x77aaff,

      // Estructuras
      STRUCTURE: 0x666666,     // Gris oscuro
      STRUCTURE_ROOF: 0x8b4513,// Marrón (techo)
      HUERTA: 0x44aa44,        // Verde
      HUERTA_DARK: 0x2d6a2d,   // Verde oscuro (borde)
      PLANT: '#66cc66',        // Verde claro (plantas)
      SHADOW: 0x000000,        // Negro (sombras)
      BORDER: 0x000000,        // Negro (bordes generales)
      TEXT_BG: '#000000',      // Fondo de labels (string para Phaser text)
      TEXT_COLOR: '#ffffff',   // Texto blanco
      LABEL_BG: '#000000'      // Fondo de etiquetas (string para Phaser text)
    };
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

  // === MÉTODOS HELPER PARA SPRITES MEJORADOS (16-BIT STYLE) ===

  createLabeledPlayer(x, y, name) {
    // SOLUCIÓN SIMPLIFICADA: Usar sprite de física + elementos visuales separados
    // Esto evita problemas con containers y física en Phaser

    // 1. Crear sprite invisible para física
    const player = this.physics.add.sprite(x, y, null);
    player.setSize(16, 24);
    player.body.setSize(16, 24);
    player.setVisible(false);  // Sprite base invisible
    player.setDepth(10);

    // 2. Crear elementos visuales
    const visuals = this.add.container(0, 0);

    const shadow = this.add.ellipse(0, 12, 16, 6, this.SPRITE_COLORS.SHADOW, 0.3);
    const body = this.add.rectangle(0, 5, 12, 18, this.SPRITE_COLORS.PLAYER);
    body.setStrokeStyle(2, this.SPRITE_COLORS.PLAYER_BORDER);
    const head = this.add.circle(0, -5, 6, this.SPRITE_COLORS.PLAYER_LIGHT);
    head.setStrokeStyle(2, this.SPRITE_COLORS.PLAYER_BORDER);
    const label = this.add.text(0, -18, name.toUpperCase(), {
      fontFamily: 'Courier New',
      fontSize: '11px',
      color: this.SPRITE_COLORS.TEXT_COLOR,
      backgroundColor: this.SPRITE_COLORS.LABEL_BG,
      padding: { x: 3, y: 2 }
    }).setOrigin(0.5, 1);

    visuals.add([shadow, body, head, label]);
    visuals.setDepth(10);

    // 3. Guardar referencia al container visual
    player.visuals = visuals;

    // 4. Sincronizar visuals con player (se hará en update)
    visuals.x = player.x;
    visuals.y = player.y;

    return player;
  }

  createLabeledNPC(x, y, name) {
    // MISMA SOLUCIÓN QUE EL JUGADOR: Sprite invisible + visuals separados

    // 1. Crear sprite invisible para física (NPCs no se mueven pero pueden tener physics para detección)
    const npc = this.add.sprite(x, y, null);
    npc.setVisible(false);  // Sprite base invisible
    npc.setDepth(10);

    // 2. Crear elementos visuales
    const visuals = this.add.container(0, 0);

    const shadow = this.add.ellipse(0, 12, 16, 6, this.SPRITE_COLORS.SHADOW, 0.3);

    // Cuerpo naranja (diferente del jugador)
    const body = this.add.rectangle(0, 5, 12, 18, this.SPRITE_COLORS.NPC);
    body.setStrokeStyle(2, this.SPRITE_COLORS.NPC_BORDER);

    // Cabeza naranja
    const head = this.add.circle(0, -5, 6, this.SPRITE_COLORS.NPC_LIGHT);
    head.setStrokeStyle(2, this.SPRITE_COLORS.NPC_BORDER);

    // Label con nombre
    const label = this.add.text(0, -18, name.toUpperCase(), {
      fontFamily: 'Courier New',
      fontSize: '11px',
      color: this.SPRITE_COLORS.TEXT_COLOR,
      backgroundColor: this.SPRITE_COLORS.LABEL_BG,
      padding: { x: 3, y: 2 }
    }).setOrigin(0.5, 1);

    // Indicador de interacción (!)
    const indicator = this.add.text(0, -28, '!', {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: COLORS.cooperativa,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    visuals.add([shadow, body, head, label, indicator]);
    visuals.setDepth(10);

    // 3. Guardar referencia al container visual
    npc.visuals = visuals;

    // Guardar referencia al indicador para animaciones
    npc.indicator = indicator;

    // 4. Sincronizar visuals con NPC (se hará en update)
    visuals.x = npc.x;
    visuals.y = npc.y;

    return npc;
  }

  createLabeledStructure(x, y, width, height, label, baseColor) {
    const container = this.add.container(x, y);

    // Sombra
    const shadow = this.add.rectangle(2, 2, width, height, this.SPRITE_COLORS.SHADOW, 0.2);
    shadow.setOrigin(0.5, 0.5);

    // Base del edificio (centrada en 0,0 del container)
    const base = this.add.rectangle(0, 0, width, height, baseColor);
    base.setOrigin(0.5, 0.5);  // CRÍTICO: centrado perfecto
    base.setStrokeStyle(3, this.SPRITE_COLORS.BORDER);

    // Techo triangular CENTRADO sobre el edificio
    const roofHeight = 18;
    const roof = this.add.triangle(
      0,                          // X = 0 (centro horizontal)
      -(height/2 + roofHeight/2), // Y = arriba del edificio
      -width/2, roofHeight/2,     // Punto inferior izquierdo
      width/2, roofHeight/2,      // Punto inferior derecho
      0, -roofHeight/2,           // Punto superior (punta del techo)
      this.SPRITE_COLORS.STRUCTURE_ROOF
    );
    roof.setStrokeStyle(2, this.SPRITE_COLORS.BORDER);

    // Label CENTRADO debajo del edificio
    const text = this.add.text(0, height / 2 + 12, label, {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: this.SPRITE_COLORS.TEXT_COLOR,
      backgroundColor: this.SPRITE_COLORS.LABEL_BG,
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5, 0);

    container.add([shadow, base, roof, text]);
    container.setDepth(5);
    container.setScrollFactor(1);

    return container;
  }

  create() {
    // Cargar datos JSON
    this.dialogues = this.cache.json.get('dialogues');
    this.encounters = this.cache.json.get('encounters');

    // Crear el mapa del mundo
    this.createWorldMap();

    // Crear jugador
    this.createPlayer();

    // Crear NPCs base (Beto)
    this.createNPCs();

    // NUEVO: Crear Marcos desde el inicio (personal base)
    console.log('Creating Marcos (base staff)...');
    const marcos = this.createMarcosNPC();
    this.npcs.push(marcos);

    // NUEVO: Crear Yani desde el inicio (personal base)
    console.log('Creating Yani (base staff)...');
    const yani = this.createYaniNPC();
    if (yani) {
      this.npcs.push(yani);
      console.log('✓ Yani added to NPCs array');
    } else {
      console.error('ERROR: Failed to create Yani!');
    }

    console.log('=== TOTAL NPCs at start:', this.npcs.length, '===');
    console.log('NPC names:', this.npcs.map(npc => npc.npcData?.name));

    // Configurar controles
    this.setupControls();

    // Configurar cámara
    this.setupCamera();

    // Crear sistema de diálogos
    this.createDialogueSystem();

    // UI de debug
    this.createDebugUI();

    // UI de audio (solo botón de mute)
    this.createAudioControls();

    // PANEL UNIFICADO LATERAL DERECHO (reemplaza recursos, tiempo, controles, leyenda)
    this.createUnifiedRightPanel();

    // Tutorial overlay (solo la primera vez)
    if (!this.tutorialShown) {
      this.createTutorialOverlay();
    }

    // Iniciar música del mapa
    gameState.audioManager.playMapTheme();

    // Iniciar auto-guardado (solo una vez, cuando comienza el gameplay)
    if (!gameState.saveManager.autoSaveTimer) {
      gameState.saveManager.startAutoSave();
      console.log('Auto-guardado iniciado');
    }

    // Listener para cuando la escena se resume (vuelve desde ManagementScene u otras)
    this.events.on('resume', () => {
      console.log('MapScene resumed - checking music state');

      // CRÍTICO: Solo restaurar si NO está sonando (evita duplicación)
      if (gameState.audioManager) {
        if (gameState.audioManager.currentMusic !== 'map' || !gameState.audioManager.isPlaying) {
          console.log('Restoring map music');
          gameState.audioManager.playMapTheme();
        } else {
          console.log('Map music already playing, skipping');
        }
      }
    });

    // === DEBUG COMPLETO: MapScene ===
    console.log('=== MAPSCENE DEBUG ===');
    console.log('Player:', !!this.player, this.player?.constructor?.name);
    console.log('Player.visuals:', !!this.player?.visuals);
    console.log('Player.setVelocity:', typeof this.player?.setVelocity);
    console.log('Player position:', this.player?.x, this.player?.y);

    console.log('NPCs count:', this.npcs?.length);
    if (this.npcs && this.npcs.length > 0) {
      this.npcs.forEach((npc, i) => {
        console.log(`NPC ${i} (${npc.npcData?.name}):`,
          'exists:', !!npc,
          'type:', npc?.constructor?.name,
          'visuals:', !!npc.visuals,
          'indicator:', !!npc.indicator,
          'position:', npc.x, npc.y
        );
      });
    }

    console.log('Legend created:', 'in Phaser scene');
    console.log('Tutorial shown:', this.tutorialShown);
    console.log('Controls panel:', !!this.controlsPanel);
    console.log('======================');
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
    console.log('=== CREATING BUILDINGS ===');

    // Edificio 1: Cooperativa (Beto - electricidad)
    const coop = this.createLabeledStructure(
      9.5 * this.tileSize,
      10 * this.tileSize,
      80,
      60,
      'COOPERATIVA',
      this.SPRITE_COLORS.STRUCTURE
    );
    console.log('✓ Cooperativa created');

    // Edificio 2: Depósito
    const deposito = this.createLabeledStructure(
      22.5 * this.tileSize,
      23 * this.tileSize,
      60,
      45,
      'DEPÓSITO',
      this.SPRITE_COLORS.STRUCTURE
    );
    console.log('✓ Depósito created');

    // Edificio 3: DISPENSARIO (Yani - salud)
    const dispensario = this.createLabeledStructure(
      18 * this.tileSize,
      10 * this.tileSize,
      70,
      50,
      'DISPENSARIO',
      this.SPRITE_COLORS.STRUCTURE
    );
    console.log('✓ Dispensario created');

    // Edificio 4: TALLER (Marcos - agua)
    const taller = this.createLabeledStructure(
      23 * this.tileSize,
      17 * this.tileSize,
      65,
      55,
      'TALLER',
      this.SPRITE_COLORS.STRUCTURE
    );
    console.log('✓ Taller created');

    console.log('=== 4 BUILDINGS CREATED ===');
  }

  createPlayer() {
    // Crear sprite de Valeria en el centro del mapa
    const startX = this.mapWidth * this.tileSize / 2;
    const startY = this.mapHeight * this.tileSize / 2;

    // Usar el nuevo sprite mejorado con label (física ya habilitada dentro)
    this.player = this.createLabeledPlayer(startX, startY, 'VALERIA');

    // Colisión con paredes
    this.physics.add.collider(this.player, this.wallTiles);
  }

  createNPCs() {
    // Crear Beto cerca del edificio de la cooperativa usando sprite mejorado
    const beto = this.createLabeledNPC(
      12 * this.tileSize,
      18 * this.tileSize,
      'BETO'
    );

    // Datos del NPC
    beto.npcData = {
      name: 'Beto',
      dialogue: 'beto_saludo',
      timesSpokenTo: 0
    };

    this.npcs.push(beto);

    // El indicador "!" ya está incluido en createLabeledNPC
    // Solo necesitamos guardarlo para animaciones
  }

  createYaniNPC() {
    console.log('=== CREATING YANI (VERDE - SALUD) ===');

    // Ubicación: Cerca del dispensario
    const yaniX = 19 * this.tileSize;
    const yaniY = 11.5 * this.tileSize;

    console.log('Yani position:', yaniX, yaniY);

    // Sprite invisible para física
    const yani = this.physics.add.sprite(yaniX, yaniY, null);
    yani.setSize(16, 24);
    yani.setVisible(false);
    yani.setDepth(10);

    // Container visual VERDE
    const visuals = this.add.container(0, 0);

    // Sombra
    const shadow = this.add.ellipse(0, 12, 16, 6, this.SPRITE_COLORS.SHADOW, 0.3);

    // Cuerpo VERDE
    const body = this.add.rectangle(0, 5, 12, 18, this.SPRITE_COLORS.YANI);
    body.setStrokeStyle(2, this.SPRITE_COLORS.YANI_BORDER);

    // Cabeza VERDE CLARO
    const head = this.add.circle(0, -5, 6, this.SPRITE_COLORS.YANI_LIGHT);
    head.setStrokeStyle(2, this.SPRITE_COLORS.YANI_BORDER);

    // Indicador (verde)
    const indicator = this.add.text(0, -25, '!', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#44aa44',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    indicator.setVisible(false);

    // Label
    const label = this.add.text(0, -35, 'YANI', {
      fontFamily: 'Courier New',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 3, y: 2 }
    }).setOrigin(0.5, 1);

    visuals.add([shadow, body, head, indicator, label]);
    visuals.setDepth(10);

    yani.visuals = visuals;
    yani.indicator = indicator;

    visuals.x = yani.x;
    visuals.y = yani.y;

    // Datos del NPC
    yani.npcData = {
      name: 'Yani',
      role: 'Enfermera del barrio',
      encounterId: 'encuentro_yani',
      timesSpokenTo: 0,
      available: true
    };

    console.log('✓ Yani created successfully');
    console.log('  - Position:', yaniX, yaniY);
    console.log('  - EncounterId:', yani.npcData.encounterId);
    return yani;
  }

  createMarcosNPC() {
    console.log('=== CREATING MARCOS (AZUL - AGUA) ===');

    // Ubicación: Cerca del taller
    const marcosX = 24 * this.tileSize;
    const marcosY = 18.5 * this.tileSize;

    console.log('Marcos position:', marcosX, marcosY);

    // Sprite invisible para física
    const marcos = this.physics.add.sprite(marcosX, marcosY, null);
    marcos.setSize(16, 24);
    marcos.setVisible(false);
    marcos.setDepth(10);

    // Container visual AZUL
    const visuals = this.add.container(0, 0);

    // Sombra
    const shadow = this.add.ellipse(0, 12, 16, 6, this.SPRITE_COLORS.SHADOW, 0.3);

    // Cuerpo AZUL
    const body = this.add.rectangle(0, 5, 12, 18, this.SPRITE_COLORS.MARCOS);
    body.setStrokeStyle(2, this.SPRITE_COLORS.MARCOS_BORDER);

    // Cabeza AZUL CLARO
    const head = this.add.circle(0, -5, 6, this.SPRITE_COLORS.MARCOS_LIGHT);
    head.setStrokeStyle(2, this.SPRITE_COLORS.MARCOS_BORDER);

    // Indicador (azul)
    const indicator = this.add.text(0, -25, '!', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#3366cc',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    indicator.setVisible(false);

    // Label
    const label = this.add.text(0, -35, 'MARCOS', {
      fontFamily: 'Courier New',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 3, y: 2 }
    }).setOrigin(0.5, 1);

    visuals.add([shadow, body, head, indicator, label]);
    visuals.setDepth(10);

    marcos.visuals = visuals;
    marcos.indicator = indicator;

    visuals.x = marcos.x;
    visuals.y = marcos.y;

    // Datos del NPC
    marcos.npcData = {
      name: 'Marcos',
      role: 'Técnico de agua',
      encounterId: 'encuentro_marcos_1',
      timesSpokenTo: 0,
      available: true
    };

    console.log('✓ Marcos created successfully');
    console.log('  - Position:', marcosX, marcosY);
    console.log('  - EncounterId:', marcos.npcData.encounterId);
    return marcos;
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

  createUnifiedRightPanel() {
    // Panel lateral derecho unificado: RECURSOS + TIEMPO + CONTROLES
    const panelX = GAME_CONFIG.width - 230;
    const panelY = 10;
    const panelWidth = 220;
    const panelHeight = GAME_CONFIG.height - 20;

    const panel = this.add.container(panelX, panelY);
    panel.setDepth(1000);
    panel.setScrollFactor(0);

    // Fondo único del panel
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x2a2a2a, 0.95);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(3, 0xd4a574);
    panel.add(bg);

    let currentY = 15;

    // === RECURSOS ===
    const recursosTitle = this.add.text(panelWidth / 2, currentY, 'RECURSOS', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#d4a574',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5, 0);
    panel.add(recursosTitle);

    currentY += 35;

    // Textos de recursos
    this.resourceTexts = {};
    const resourceKeys = ['creditos', 'electricidad', 'agua', 'legitimidad', 'autonomia'];
    const resourceIcons = {
      creditos: '$',
      electricidad: '⚡',
      agua: '💧',
      legitimidad: '👥',
      autonomia: '✊'
    };

    resourceKeys.forEach(key => {
      const text = this.add.text(20, currentY, `${resourceIcons[key]} 100`, {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: '#cccccc'
      }).setOrigin(0, 0);
      panel.add(text);
      this.resourceTexts[key] = text;
      currentY += 22;
    });

    currentY += 15;

    // Separador
    const sep1 = this.add.rectangle(15, currentY, panelWidth - 30, 2, 0x555555);
    sep1.setOrigin(0, 0);
    panel.add(sep1);

    currentY += 20;

    // === TIEMPO ===
    const tiempoTitle = this.add.text(panelWidth / 2, currentY, 'TIEMPO', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#d4a574',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5, 0);
    panel.add(tiempoTitle);

    currentY += 30;

    this.dayText = this.add.text(20, currentY, 'Día 1 / 60', {
      fontFamily: 'Courier New',
      fontSize: '15px',
      color: '#cccccc',
      fontStyle: 'bold'
    }).setOrigin(0, 0);
    panel.add(this.dayText);

    currentY += 30;

    // Barra de progreso
    const progressBg = this.add.rectangle(20, currentY, panelWidth - 40, 12, 0x333333);
    progressBg.setOrigin(0, 0);
    progressBg.setStrokeStyle(2, 0x555555);
    panel.add(progressBg);

    this.progressBar = this.add.rectangle(20, currentY, 10, 12, 0xd4a574);
    this.progressBar.setOrigin(0, 0);
    panel.add(this.progressBar);

    currentY += 25;

    // Separador
    const sep2 = this.add.rectangle(15, currentY, panelWidth - 30, 2, 0x555555);
    sep2.setOrigin(0, 0);
    panel.add(sep2);

    currentY += 20;

    // === CONTROLES ===
    const controlesTitle = this.add.text(panelWidth / 2, currentY, 'CONTROLES', {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: '#d4a574',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5, 0);
    panel.add(controlesTitle);

    currentY += 25;

    const controls = [
      '[W] ↑  Mover arriba',
      '[A] ←  Mover izq.',
      '[S] ↓  Mover abajo',
      '[D] →  Mover der.',
      '',
      '[↑↓] Navegar',
      '',
      '[ENTER] Interactuar',
      '[SPACE] Avanzar día',
      '[TAB] Gestión',
      '[ESC] Menú'
    ];

    controls.forEach(ctrl => {
      if (ctrl) {
        const text = this.add.text(20, currentY, ctrl, {
          fontFamily: 'Courier New',
          fontSize: '11px',
          color: '#aaaaaa'
        }).setOrigin(0, 0);
        panel.add(text);
        currentY += 17;
      } else {
        currentY += 8;
      }
    });

    this.unifiedPanel = panel;
  }

  updateUnifiedPanel() {
    // Actualizar recursos en el panel unificado
    if (this.resourceTexts && gameState.resourceManager) {
      const rm = gameState.resourceManager;
      const icons = {
        creditos: '$',
        electricidad: '⚡',
        agua: '💧',
        legitimidad: '👥',
        autonomia: '✊'
      };

      this.resourceTexts.creditos?.setText(`${icons.creditos} ${formatNumber(rm.get('creditos'))}`);
      this.resourceTexts.electricidad?.setText(`${icons.electricidad} ${rm.get('electricidad')}%`);
      this.resourceTexts.agua?.setText(`${icons.agua} ${rm.get('agua')}%`);
      this.resourceTexts.legitimidad?.setText(`${icons.legitimidad} ${rm.get('legitimidad')}%`);
      this.resourceTexts.autonomia?.setText(`${icons.autonomia} ${rm.get('autonomia')}%`);

      // Cambiar colores si está bajo
      this.resourceTexts.electricidad?.setColor(
        rm.get('electricidad') < 30 ? COLORS.emergencia : '#cccccc'
      );
      this.resourceTexts.agua?.setColor(
        rm.get('agua') < 30 ? COLORS.emergencia : '#cccccc'
      );
    }

    // Actualizar día
    if (this.dayText && gameState.timeManager) {
      const currentDay = gameState.timeManager.currentDay || 1;
      const maxDays = GAME_CONFIG.maxDays || 60;
      this.dayText.setText(`Día ${currentDay} / ${maxDays}`);

      // Actualizar barra de progreso
      if (this.progressBar) {
        const maxWidth = 180;
        const progress = (currentDay / maxDays) * maxWidth;
        this.progressBar.width = Math.max(10, progress);

        // Color de la barra según progreso
        if (currentDay > maxDays * 0.8) {
          this.progressBar.setFillStyle(0xff6600);  // Naranja (cerca del final)
        } else {
          this.progressBar.setFillStyle(0xd4a574);  // Terracota (normal)
        }
      }
    }
  }

  createTutorialOverlay() {
    // Overlay de tutorial que aparece solo la primera vez
    const centerX = GAME_CONFIG.width / 2;
    const centerY = GAME_CONFIG.height / 2;

    // Contenedor del tutorial
    const tutorial = this.add.container(centerX, centerY);

    // Fondo oscuro semi-transparente
    const bg = this.add.rectangle(0, 0, 400, 240, 0x000000, 0.92);
    bg.setStrokeStyle(3, hexToNumber(COLORS.cooperativa));

    // Título
    const title = this.add.text(0, -95, 'CONTROLES', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: COLORS.cooperativa,
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // Texto de controles
    const controls = this.add.text(0, -50,
      'WASD / Flechas: Mover\n\n' +
      'ENTER: Hablar con NPCs\n' +
      'TAB: Gestión de recursos\n' +
      'SPACE: Avanzar día\n' +
      'ESC: Menú principal\n' +
      'M: Silenciar audio',
      {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 6
      }
    ).setOrigin(0.5);

    // Hint para cerrar
    const hint = this.add.text(0, 90, 'Presiona cualquier tecla para comenzar', {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: COLORS.cooperativa,
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Efecto de parpadeo en el hint
    this.tweens.add({
      targets: hint,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    tutorial.add([bg, title, controls, hint]);
    tutorial.setDepth(2000);
    tutorial.setScrollFactor(0);

    // Cerrar con cualquier tecla
    this.input.keyboard.once('keydown', () => {
      tutorial.destroy();
      this.tutorialShown = true;
    });

    // También cerrar con click
    this.input.once('pointerdown', () => {
      tutorial.destroy();
      this.tutorialShown = true;
    });
  }

  advanceTime(days = 1) {
    console.log('=== ADVANCING TIME ===');
    console.log('From day:', gameState.timeManager.getCurrentDay());

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

    // Actualizar panel unificado (incluye tiempo)
    this.updateUnifiedPanel();

    // Chequear game over
    if (tm.isGameOver()) {
      this.handleGameOver();
    }

    console.log('Advanced to day:', tm.getCurrentDay());
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

    // Sincronizar visuals del jugador con posición del player
    if (this.player.visuals) {
      this.player.visuals.x = this.player.x;
      this.player.visuals.y = this.player.y;
    }

    // Sincronizar visuals de todos los NPCs
    if (this.npcs && this.npcs.length > 0) {
      this.npcs.forEach(npc => {
        if (npc && npc.visuals) {
          npc.visuals.x = npc.x;
          npc.visuals.y = npc.y;
        }
      });
    }

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

    // Actualizar panel unificado
    this.updateUnifiedPanel();

    // Actualizar UI de debug
    this.updateDebugUI();

    // Chequear game over (defeat por recursos)
    this.handleGameOver();
  }

  handleDebugInput() {
    // Protección: solo habilitar debug keys si GAME_CONFIG.debug = true
    if (!GAME_CONFIG.debug) {
      return;
    }

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
    console.log('=== NPC INTERACTION ===');
    console.log('NPC name:', npc.npcData.name);
    console.log('NPC encounterId:', npc.npcData.encounterId);
    console.log('NPC dialogue:', npc.npcData.dialogue);

    // Sonido de interacción
    gameState.audioManager.playInteractSound();

    // Detener al jugador
    this.player.setVelocity(0, 0);

    // NUEVO: Si el NPC tiene encounterId, lanzar encuentro en vez de diálogo
    if (npc.npcData.encounterId) {
      console.log('Launching encounter:', npc.npcData.encounterId);
      this.launchEncounter(npc.npcData.encounterId);
      return;
    }

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
      if (this.nearbyNPC.npcData.timesSpokenTo >= 2 && !gameState.flags.includes('primera_asamblea_completed')) {
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

    // Marcar flag de que se completó
    gameState.flags.push(`${encounterId}_completed`);
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
