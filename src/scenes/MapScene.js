// MapScene.js - Escena principal de exploración

// HUD Panel Layout Constants
const HUD_PANEL = {
  width: 220,
  margin: 230,  // Distance from right edge
  padding: 10,
  bgColor: 0x2a2a2a,
  bgAlpha: 0.95,
  borderColor: 0xd4a574,
  borderWidth: 3
};

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

    // Sistema de diálogos (legacy - loaded but not used)
    this.dialogues = null;
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

      // Actualizar panel unificado y tareas activas
      this.updateUnifiedPanel();
      this.updateActiveTasksDisplay();
      console.log('✓ Panel and tasks updated after resume');
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

    // Datos del NPC (ACTUALIZADO: igual formato que Yani/Marcos)
    beto.npcData = {
      name: 'Beto',
      role: 'Electricista del barrio',
      encounterId: 'primera_asamblea',
      timesSpokenTo: 0,
      available: true
    };

    // Ocultar indicador de exclamación (igual que Yani y Marcos)
    beto.indicator.setVisible(false);

    this.npcs.push(beto);
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

    // Tecla de pausa (ESC)
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Tecla de avance de tiempo (SPACE)
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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
    const panelX = GAME_CONFIG.width - HUD_PANEL.margin;
    const panelY = HUD_PANEL.padding;
    const panelWidth = HUD_PANEL.width;
    const panelHeight = GAME_CONFIG.height - (HUD_PANEL.padding * 2);

    const panel = this.add.container(panelX, panelY);
    panel.setDepth(1000);
    panel.setScrollFactor(0);

    // Fondo único del panel
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, HUD_PANEL.bgColor, HUD_PANEL.bgAlpha);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(HUD_PANEL.borderWidth, HUD_PANEL.borderColor);
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

    currentY += 28;  // Reducido de 35 → 28 (ahorro 7px)

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
      currentY += 18;  // Reducido de 22 → 18 (ahorro 4px × 5 = 20px)
    });

    currentY += 10;  // Reducido de 15 → 10 (ahorro 5px)

    // Separador
    const sep1 = this.add.rectangle(15, currentY, panelWidth - 30, 2, 0x555555);
    sep1.setOrigin(0, 0);
    panel.add(sep1);

    currentY += 15;  // Reducido de 20 → 15

    // === TIEMPO ===
    const tiempoTitle = this.add.text(panelWidth / 2, currentY, 'TIEMPO', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#d4a574',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5, 0);
    panel.add(tiempoTitle);

    currentY += 25;  // Reducido de 30 → 25

    this.dayText = this.add.text(20, currentY, 'Día 1 / 60', {
      fontFamily: 'Courier New',
      fontSize: '15px',
      color: '#cccccc',
      fontStyle: 'bold'
    }).setOrigin(0, 0);
    panel.add(this.dayText);

    currentY += 25;  // Reducido de 30 → 25

    // Barra de progreso
    const progressBg = this.add.rectangle(20, currentY, panelWidth - 40, 12, 0x333333);
    progressBg.setOrigin(0, 0);
    progressBg.setStrokeStyle(2, 0x555555);
    panel.add(progressBg);

    this.progressBar = this.add.rectangle(20, currentY, 10, 12, 0xd4a574);
    this.progressBar.setOrigin(0, 0);
    panel.add(this.progressBar);

    currentY += 20;  // Reducido de 25 → 20

    // Separador
    const sep2 = this.add.rectangle(15, currentY, panelWidth - 30, 2, 0x555555);
    sep2.setOrigin(0, 0);
    panel.add(sep2);

    currentY += 15;  // Reducido de 20 → 15

    // === TAREAS ACTIVAS ===
    const tareasTitle = this.add.text(panelWidth / 2, currentY, 'TAREAS ACTIVAS', {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: '#d4a574',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5, 0);
    panel.add(tareasTitle);

    currentY += 22;  // Reducido de 25 → 22

    // Contenedor para tareas (se llena dinámicamente)
    this.tasksContainerY = currentY;
    this.tasksElements = [];

    // Reservar espacio para ~4 líneas de tareas
    currentY += 70;  // Reducido de 80 → 70

    // Separador
    const sep3 = this.add.rectangle(15, currentY, panelWidth - 30, 2, 0x555555);
    sep3.setOrigin(0, 0);
    panel.add(sep3);

    currentY += 15;  // Reducido de 20 → 15

    // === CONTROLES ===
    const controlesTitle = this.add.text(panelWidth / 2, currentY, 'CONTROLES', {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: '#d4a574',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5, 0);
    panel.add(controlesTitle);

    currentY += 22;  // Reducido de 25 → 22

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

        // Guardar referencia al texto de TAB para el badge
        if (ctrl === '[TAB] Gestión') {
          this.tabControlText = text;
          this.tabControlY = currentY;

          // Crear badge de notificación (inicialmente invisible)
          this.managementBadge = this.add.text(
            140,
            currentY - 2,
            '(!)',
            {
              fontFamily: 'Courier New',
              fontSize: '12px',
              color: '#ff6600',
              fontStyle: 'bold'
            }
          ).setOrigin(0, 0);
          this.managementBadge.setVisible(false);
          panel.add(this.managementBadge);

          // Animación de parpadeo
          this.badgeTween = this.tweens.add({
            targets: this.managementBadge,
            alpha: { from: 1, to: 0.3 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            paused: true
          });
        }

        currentY += 15;  // Reducido de 17 → 15
      } else {
        currentY += 6;  // Reducido de 8 → 6
      }
    });

    this.unifiedPanel = panel;

    // Actualizar tareas activas inmediatamente
    this.updateActiveTasksDisplay();
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

  updateActiveTasksDisplay() {
    console.log('Updating active tasks display');

    // Limpiar elementos previos
    if (this.tasksElements) {
      this.tasksElements.forEach(elem => {
        if (elem && elem.destroy) elem.destroy();
      });
      this.tasksElements = [];
    }

    if (!this.unifiedPanel || !this.tasksContainerY) {
      console.log('No unified panel or tasks container Y position');
      return;
    }

    const panelX = GAME_CONFIG.width - 230;
    let currentY = this.tasksContainerY;

    // MOCK temporal hasta que TaskManager esté implementado
    // TODO: Reemplazar con gameState.taskManager?.getActiveTasks() cuando exista
    const mockTasks = this.getMockActiveTasks();

    if (mockTasks.length === 0) {
      // Sin tareas activas
      const noTasksText = this.add.text(
        20,
        currentY,
        '(Sin tareas)',
        {
          fontFamily: 'Courier New',
          fontSize: '11px',
          color: '#666666'
        }
      ).setOrigin(0, 0);
      noTasksText.setScrollFactor(0);
      noTasksText.setDepth(1000);
      this.unifiedPanel.add(noTasksText);
      this.tasksElements.push(noTasksText);
      currentY += 20;
    } else {
      // Mostrar cada tarea (máximo 3)
      mockTasks.slice(0, 3).forEach((task, index) => {
        const taskLine = this.createTaskLine(task, currentY);
        if (taskLine) {
          this.unifiedPanel.add(taskLine);
          this.tasksElements.push(taskLine);
          currentY += 18;
        }
      });
    }

    // Mostrar NPCs sin asignar (CON WORD WRAP para evitar cortes)
    const unassignedNPCs = this.getUnassignedNPCs(mockTasks);
    if (unassignedNPCs.length > 0) {
      const unassignedText = this.add.text(
        20,
        currentY,
        `(Libres: ${unassignedNPCs.join(', ')})`,
        {
          fontFamily: 'Courier New',
          fontSize: '10px',
          color: '#888888',
          wordWrap: { width: 180 }  // CRÍTICO: Word wrap para textos largos
        }
      ).setOrigin(0, 0);
      unassignedText.setScrollFactor(0);
      unassignedText.setDepth(1000);
      this.unifiedPanel.add(unassignedText);
      this.tasksElements.push(unassignedText);
    }

    // Actualizar badge de notificación
    this.updateManagementBadge(mockTasks);

    console.log('✓ Tasks display updated');
  }

  createTaskLine(task, y) {
    // Iconos según tipo de tarea
    const taskIcons = {
      'electricidad': '⚡',
      'agua': '💧',
      'salud': '❤️',
      'comida': '🌾',
      'moral': '😊'
    };

    const icon = taskIcons[task.type] || '•';
    const daysLeft = task.daysRemaining || 0;

    // Color según urgencia
    let color = '#ffffff';
    if (daysLeft === 1) {
      color = '#ffaa00'; // Naranja - último día
    } else if (daysLeft === 0) {
      color = '#ff0000'; // Rojo - completa hoy
    }

    // FORMATO COMPACTO: "Beto→⚡2d" (sin espacios ni paréntesis)
    const text = this.add.text(
      20,
      y,
      `${task.npcName}→${icon}${daysLeft}d`,
      {
        fontFamily: 'Courier New',
        fontSize: '11px',
        color: color
      }
    ).setOrigin(0, 0);
    text.setScrollFactor(0);
    text.setDepth(1000);

    return text;
  }

  getUnassignedNPCs(activeTasks) {
    // Obtener NPCs que no tienen tareas asignadas
    const allNPCs = ['Beto', 'Yani', 'Marcos'];
    const assignedNPCs = activeTasks.map(task => task.npcName);

    return allNPCs.filter(npc => !assignedNPCs.includes(npc));
  }

  getMockActiveTasks() {
    // MOCK temporal - TODO: Reemplazar con gameState.taskManager.getActiveTasks()
    // Devuelve array de tareas activas con formato:
    // { npcName: 'Beto', type: 'electricidad', daysRemaining: 2 }

    // Por ahora devolvemos tareas de ejemplo según el día
    const currentDay = gameState.timeManager?.currentDay || 1;

    if (currentDay < 3) {
      return [];
    } else if (currentDay < 10) {
      return [
        { npcName: 'Beto', type: 'electricidad', daysRemaining: 2 },
        { npcName: 'Marcos', type: 'agua', daysRemaining: 1 }
      ];
    } else {
      return [
        { npcName: 'Beto', type: 'electricidad', daysRemaining: 3 },
        { npcName: 'Yani', type: 'salud', daysRemaining: 2 },
        { npcName: 'Marcos', type: 'agua', daysRemaining: 0 }
      ];
    }
  }

  updateManagementBadge(activeTasks) {
    if (!this.managementBadge || !this.badgeTween) {
      return;
    }

    // Mostrar badge si:
    // - Hay tareas que terminan hoy o mañana (urgentes)
    // - Hay NPCs sin asignar
    // - Recursos críticos

    const urgentTasks = activeTasks.filter(task => task.daysRemaining <= 1);
    const unassignedNPCs = this.getUnassignedNPCs(activeTasks);

    const hasUrgent = urgentTasks.length > 0;
    const hasUnassigned = unassignedNPCs.length > 0;
    const hasLowResources = gameState.resourceManager?.get('creditos') < 500;

    const shouldShow = hasUrgent || hasUnassigned || hasLowResources;

    if (shouldShow) {
      this.managementBadge.setVisible(true);
      this.badgeTween.resume();
    } else {
      this.managementBadge.setVisible(false);
      this.badgeTween.pause();
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
        this.time.delayedCall(500, () => {
          this.launchEncounter(event.id);
        });
      } else if (event.type === 'event') {
        // Mostrar notificación de evento
        console.log(`Evento: ${event.id}`);
      }
    }

    // Actualizar panel unificado (incluye tiempo)
    this.updateUnifiedPanel();

    // Actualizar tareas activas
    this.updateActiveTasksDisplay();

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

    // CRÍTICO: Checkear cierre de diálogo simple
    if (this.activeSimpleDialogue) {
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        console.log('ENTER pressed - closing simple dialogue');

        // Detener animación
        if (this.activeSimpleDialogue.tween) {
          this.activeSimpleDialogue.tween.stop();
        }

        // Destruir elementos
        this.activeSimpleDialogue.elements.forEach(element => {
          if (element && element.destroy) {
            element.destroy();
          }
        });

        // Limpiar flag
        this.activeSimpleDialogue = null;

        console.log('✓ Simple dialogue closed');
        return; // No procesar más input este frame
      }
    }

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

    // Detectar ESC para abrir pausa
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.openPauseMenu();
    }

    // Detectar SPACE para avanzar día
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.advanceTime(1);
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

    if (this.nearbyNPC?.npcData?.name) {
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
    console.log('EncounterId:', npc.npcData.encounterId);
    console.log('Current day:', gameState.timeManager.getCurrentDay());
    console.log('Times spoken:', npc.npcData.timesSpokenTo);

    // Sonido de interacción
    gameState.audioManager.playInteractSound();

    // Detener al jugador
    this.player.setVelocity(0, 0);

    const npcName = npc.npcData.name;
    const encounterId = npc.npcData.encounterId;
    const currentDay = gameState.timeManager.getCurrentDay();

    // Incrementar contador de conversaciones
    npc.npcData.timesSpokenTo++;

    // CRÍTICO: Verificar si es encuentro programado en TimeManager
    const scheduledEvent = gameState.timeManager.scheduledEvents.find(
      event => event.id === encounterId && event.type === 'encounter'
    );

    if (scheduledEvent) {
      console.log('This is a scheduled encounter for day:', scheduledEvent.day);

      // FASE 1: Primera conversación (presentación casual)
      if (npc.npcData.timesSpokenTo === 1) {
        console.log('PHASE 1: First time talking - showing introduction dialogue');
        this.showIntroductionDialogue(npc);
        return;
      }

      // FASE 2: Antes del día del evento (diálogo pre-evento)
      if (currentDay < scheduledEvent.day) {
        console.log('PHASE 2: Before scheduled day - showing pre-event dialogue');
        this.showPreEventDialogue(npc, scheduledEvent.day);
        return;
      }

      // FASE 3: Día del evento - TimeManager lo maneja, dar contexto
      if (currentDay === scheduledEvent.day && !scheduledEvent.triggered) {
        console.log('PHASE 3: Event day arrived - showing event context dialogue');
        this.showEventContextDialogue(npc);
        return;
      }

      // FASE 4: Después del evento (post-evento)
      if (scheduledEvent.triggered || gameState.completedEncounters.includes(encounterId)) {
        console.log('PHASE 4: Event completed - showing post-event dialogue');
        this.showPostEventDialogue(npc);
        return;
      }
    }

    // Para encuentros NO programados, lanzar inmediatamente
    if (encounterId && !scheduledEvent) {
      console.log('Launching non-scheduled encounter:', encounterId);
      this.launchEncounter(encounterId);
      return;
    }

    // Fallback: diálogo genérico
    console.log('Showing generic fallback dialogue');
    this.showGenericDialogue(npc);
  }

  // ===================================================================
  // SISTEMA DE DIÁLOGOS CONTEXTUALES (4 FASES)
  // ===================================================================

  showIntroductionDialogue(npc) {
    console.log('=== SHOWING INTRODUCTION DIALOGUE ===');

    const introductions = {
      'Beto': {
        name: 'BETO',
        message: 'Valeria, todo bien? Yo me encargo de mantener la red eléctrica del barrio. Si necesitás algo, avisame.',
        color: '#ff6600'
      },
      'Yani': {
        name: 'YANI',
        message: 'Hola Valeria! Soy Yani, la enfermera del dispensario. Acá atendemos a toda la comunidad. Cualquier cosa de salud, estoy acá.',
        color: '#44aa44'
      },
      'Marcos': {
        name: 'MARCOS',
        message: 'Che Valeria, qué tal? Soy Marcos, me ocupo del sistema de agua. Las perforaciones, los tanques, todo eso. Avisame si ves algo raro.',
        color: '#3366cc'
      }
    };

    const intro = introductions[npc.npcData.name];

    if (intro) {
      this.showSimpleDialogue(intro.name, intro.message, intro.color);
    }
  }

  showPreEventDialogue(npc, scheduledDay) {
    console.log('=== SHOWING PRE-EVENT DIALOGUE ===');
    console.log('Scheduled day:', scheduledDay);
    console.log('Days until event:', scheduledDay - gameState.timeManager.getCurrentDay());

    const currentDay = gameState.timeManager.getCurrentDay();
    const daysUntil = scheduledDay - currentDay;

    const preEventDialogues = {
      'Beto': {
        name: 'BETO',
        message: daysUntil > 1
          ? `El transformador B está fallando cada vez más. Vamos a tener que discutirlo en la próxima asamblea del día ${scheduledDay}.`
          : `Mañana tenemos que decidir qué hacer con el transformador. Es urgente, Valeria.`,
        color: '#ff6600'
      },
      'Yani': {
        name: 'YANI',
        message: daysUntil > 1
          ? `El dispensario necesita más electricidad para la heladera de medicamentos. Voy a plantear el tema pronto.`
          : `Mañana tengo que hablar con vos sobre el tema del dispensario. Es importante.`,
        color: '#44aa44'
      },
      'Marcos': {
        name: 'MARCOS',
        message: daysUntil > 1
          ? `La perforación 1 está dando problemas. Si sigue así, vamos a tener que tomar una decisión pronto.`
          : `Mañana tenemos que hablar del tema del agua. La situación está complicada.`,
        color: '#3366cc'
      }
    };

    const dialogue = preEventDialogues[npc.npcData.name];

    if (dialogue) {
      this.showSimpleDialogue(dialogue.name, dialogue.message, dialogue.color);
    }
  }

  showEventContextDialogue(npc) {
    console.log('=== SHOWING EVENT CONTEXT DIALOGUE ===');

    const eventContexts = {
      'Beto': {
        name: 'BETO',
        message: 'Es el momento de decidir sobre el transformador. La asamblea va a empezar cuando avances el día.',
        color: '#ff6600'
      },
      'Yani': {
        name: 'YANI',
        message: 'Valeria, necesito hablarte sobre el dispensario hoy. Es urgente por los medicamentos.',
        color: '#44aa44'
      },
      'Marcos': {
        name: 'MARCOS',
        message: 'Che, tenemos que hablar del agua hoy sí o sí. La perforación está crítica.',
        color: '#3366cc'
      }
    };

    const context = eventContexts[npc.npcData.name];

    if (context) {
      this.showSimpleDialogue(context.name, context.message, context.color);
    }
  }

  showPostEventDialogue(npc) {
    console.log('=== SHOWING POST-EVENT DIALOGUE ===');

    const postEventDialogues = {
      'Beto': {
        name: 'BETO',
        message: 'Buena decisión con el transformador, Valeria. La red está funcionando mejor ahora.',
        color: '#ff6600'
      },
      'Yani': {
        name: 'YANI',
        message: 'Gracias por resolver lo del dispensario. Los medicamentos están seguros ahora.',
        color: '#44aa44'
      },
      'Marcos': {
        name: 'MARCOS',
        message: 'Gracias por la ayuda con la perforación. El agua está fluyendo bien de nuevo.',
        color: '#3366cc'
      }
    };

    const dialogue = postEventDialogues[npc.npcData.name];

    if (dialogue) {
      this.showSimpleDialogue(dialogue.name, dialogue.message, dialogue.color);
    }
  }

  showGenericDialogue(npc) {
    console.log('=== SHOWING GENERIC DIALOGUE ===');

    const genericDialogues = {
      'Beto': {
        name: 'BETO',
        message: 'Todo tranquilo por acá. La red está funcionando bien.',
        color: '#ff6600'
      },
      'Yani': {
        name: 'YANI',
        message: 'Por suerte no hay emergencias hoy. El dispensario está funcionando bien.',
        color: '#44aa44'
      },
      'Marcos': {
        name: 'MARCOS',
        message: 'El sistema de agua está estable. Todo bajo control.',
        color: '#3366cc'
      }
    };

    const dialogue = genericDialogues[npc.npcData.name];

    if (dialogue) {
      this.showSimpleDialogue(dialogue.name, dialogue.message, dialogue.color);
    }
  }

  showSimpleDialogue(npcName, message, color = '#d4a574') {
    console.log('=== SHOWING SIMPLE DIALOGUE ===');
    console.log('NPC:', npcName);
    console.log('Message:', message);

    // Guardar elementos para destruir
    const dialogueElements = [];

    // Overlay oscuro
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      650, 220,
      0x000000, 0.95
    );
    overlay.setDepth(2000);
    overlay.setScrollFactor(0);
    dialogueElements.push(overlay);

    // Borde con color del NPC
    const borderColor = parseInt(color.replace('#', '0x'));
    const border = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      650, 220
    );
    border.setStrokeStyle(3, borderColor);
    border.setFillStyle(0x000000, 0);
    border.setDepth(2001);
    border.setScrollFactor(0);
    dialogueElements.push(border);

    // Nombre del NPC
    const nameText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 70,
      npcName,
      {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: color,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    nameText.setDepth(2002);
    nameText.setScrollFactor(0);
    dialogueElements.push(nameText);

    // Mensaje
    const dialogueText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 10,
      message,
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 550 }
      }
    ).setOrigin(0.5);
    dialogueText.setDepth(2002);
    dialogueText.setScrollFactor(0);
    dialogueElements.push(dialogueText);

    // Instrucción
    const closeText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 80,
      '[Presioná ENTER para cerrar]',
      {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#888888'
      }
    ).setOrigin(0.5);
    closeText.setDepth(2002);
    closeText.setScrollFactor(0);
    dialogueElements.push(closeText);

    // Animación parpadeo
    const blinkTween = this.tweens.add({
      targets: closeText,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // CRÍTICO: Flag de diálogo activo
    this.activeSimpleDialogue = {
      elements: dialogueElements,
      tween: blinkTween
    };

    console.log('✓ Simple dialogue created and active');
  }

  // ===================================================================
  // OLD DIALOGUE METHODS REMOVED - Now using showSimpleDialogue() for all NPCs
  // ===================================================================

  // Sistema de encuentros

  launchEncounter(encounterId) {
    console.log('=== LAUNCHING ENCOUNTER ===');
    console.log('Encounter ID:', encounterId);

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

    // CRÍTICO: Marcar como completado (usar ambos sistemas para compatibilidad)
    if (!gameState.completedEncounters.includes(encounterId)) {
      gameState.completedEncounters.push(encounterId);
      console.log('✓ Encounter added to completedEncounters:', encounterId);
    }

    // También mantener flag para compatibilidad con código existente
    const flagName = `${encounterId}_completed`;
    if (!gameState.flags.includes(flagName)) {
      gameState.flags.push(flagName);
      console.log('✓ Flag added:', flagName);
    }
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

  openPauseMenu() {
    // Detener al jugador
    this.player.setVelocity(0, 0);

    // Pausar MapScene
    this.scene.pause();

    // Lanzar PauseScene
    this.scene.launch('PauseScene');
  }

  shutdown() {
    // Cleanup keyboard listeners
    this.input.keyboard.off('keydown-M');
  }
}
