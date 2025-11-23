// InfoScene.js - Información sobre el proyecto (con scroll)

class InfoScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InfoScene' });
  }

  create() {
    // Fondo gris oscuro
    this.add.rectangle(
      0,
      0,
      GAME_CONFIG.width,
      GAME_CONFIG.height,
      0x1a1a1a,
      1
    ).setOrigin(0, 0);

    // Título (fijo)
    this.add.text(
      GAME_CONFIG.width / 2,
      40,
      'SOBRE ESTE PROYECTO',
      {
        fontSize: '20px',
        color: '#d4a574',
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // === CONTENEDOR DE SCROLL ===

    // Definir área de scroll
    this.scrollAreaTop = 90;
    this.scrollAreaBottom = GAME_CONFIG.height - 80; // Espacio para botón VOLVER
    this.scrollAreaHeight = this.scrollAreaBottom - this.scrollAreaTop;

    // Crear contenedor para el contenido scrolleable
    this.scrollContainer = this.add.container(0, 0);

    // Contenido principal (más grande para legibilidad)
    const infoText = `'Red de Aguante' es un prototipo interactivo
de design fiction desarrollado por el LAB de
Mundanidad Forzada en colaboración con
Heated Studio.

METODOLOGÍA

El LAB trabaja con:
· Economías informales como punto de partida
· Restricciones de recursos como material
· Adaptación cotidiana como diseño
· Futuros desde contextos latinoamericanos

CONTEXTO

Este ejercicio parte de prácticas reales
de autogestión en barrios populares
argentinos: recuperación de infraestructura,
redes comunitarias, economías solidarias.

No especula sobre tecnologías futuras.
Sistematiza lo que ya existe.

POSICIONAMIENTO

Este NO es:
· Gamificación de la pobreza
· Romantización de la precariedad
· Solución tecnológica

Esto ES:
· Herramienta de investigación
· Metodología de futuros desde el sur
· Reconocimiento de prácticas existentes

CRÉDITOS

Desarrollo: LAB de Mundanidad Forzada
Colaboración: Heated Studio
Implementación técnica: Claude (Anthropic)
Framework: Phaser 3

LAB de Mundanidad Forzada es un colectivo
de investigación que desarrolla metodologías
de design fiction desde contextos
latinoamericanos.

Argentina · México · Brasil · Colombia`;

    this.contentText = this.add.text(
      40,
      this.scrollAreaTop,
      infoText,
      {
        fontSize: '13px',
        color: '#cccccc',
        fontFamily: 'Courier New',
        lineSpacing: 8,
        wordWrap: { width: 720 }
      }
    ).setOrigin(0, 0);

    // Agregar texto al contenedor
    this.scrollContainer.add(this.contentText);

    // Calcular altura total del contenido
    this.contentHeight = this.contentText.height;
    this.maxScroll = Math.max(0, this.contentHeight - this.scrollAreaHeight);

    // Posición de scroll actual
    this.scrollY = 0;

    // Crear máscara para ocultar contenido fuera del área visible
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, this.scrollAreaTop, GAME_CONFIG.width, this.scrollAreaHeight);
    const mask = maskShape.createGeometryMask();
    this.scrollContainer.setMask(mask);

    // === INDICADORES DE SCROLL ===

    // Indicador "más abajo" (visible solo si hay contenido oculto)
    this.scrollIndicatorDown = this.add.text(
      GAME_CONFIG.width - 40,
      this.scrollAreaBottom - 30,
      '↓ MÁS',
      {
        fontSize: '12px',
        color: '#d4a574',
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(1, 0);

    // Indicador "más arriba"
    this.scrollIndicatorUp = this.add.text(
      GAME_CONFIG.width - 40,
      this.scrollAreaTop + 10,
      '↑ MÁS',
      {
        fontSize: '12px',
        color: '#d4a574',
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(1, 0);

    this.scrollIndicatorUp.setVisible(false);

    // Barra de scroll visual
    this.createScrollbar();

    // Botón volver (fijo)
    const backButton = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height - 40,
      '[ VOLVER ]',
      {
        fontSize: '16px',
        color: '#888888',
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    backButton.setInteractive({ useHandCursor: true });

    backButton.on('pointerover', () => {
      backButton.setColor('#d4a574');
    });

    backButton.on('pointerout', () => {
      backButton.setColor('#888888');
    });

    backButton.on('pointerdown', () => {
      gameState.audioManager.playConfirmSound();
      this.scene.start('MainMenuScene');
    });

    // === CONTROLES DE SCROLL ===

    // Mouse wheel
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      this.scroll(deltaY * 0.5);
    });

    // Flechas del teclado
    this.cursors = this.input.keyboard.createCursorKeys();

    // Teclas adicionales
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.pageDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PAGE_DOWN);
    this.pageUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PAGE_UP);

    // ESC y ENTER para volver
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MainMenuScene');
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('MainMenuScene');
    });

    // Actualizar indicadores
    this.updateScrollIndicators();
  }

  update() {
    // Scroll con flechas (continuo mientras se presiona)
    if (this.cursors.up.isDown) {
      this.scroll(-3);
    } else if (this.cursors.down.isDown) {
      this.scroll(3);
    }

    // Scroll con SPACE / PAGE DOWN (una vez por presión)
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
        Phaser.Input.Keyboard.JustDown(this.pageDownKey)) {
      this.scroll(this.scrollAreaHeight * 0.8); // Avanzar casi una pantalla
    }

    if (Phaser.Input.Keyboard.JustDown(this.pageUpKey)) {
      this.scroll(-this.scrollAreaHeight * 0.8); // Retroceder casi una pantalla
    }
  }

  scroll(delta) {
    // Aplicar scroll
    this.scrollY += delta;

    // Limitar scroll (no pasar del inicio ni del final)
    this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScroll);

    // Actualizar posición del texto (smooth)
    this.contentText.y = this.scrollAreaTop - this.scrollY;

    // Actualizar indicadores
    this.updateScrollIndicators();

    // Actualizar scrollbar
    this.updateScrollbar();
  }

  updateScrollIndicators() {
    // Mostrar/ocultar indicadores según posición de scroll
    const atTop = this.scrollY <= 0;
    const atBottom = this.scrollY >= this.maxScroll;

    this.scrollIndicatorUp.setVisible(!atTop && this.maxScroll > 0);
    this.scrollIndicatorDown.setVisible(!atBottom && this.maxScroll > 0);

    // Parpadeo sutil del indicador inferior cuando hay contenido
    if (this.scrollIndicatorDown.visible) {
      this.tweens.add({
        targets: this.scrollIndicatorDown,
        alpha: 0.4,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    }
  }

  createScrollbar() {
    if (this.maxScroll <= 0) return; // No hay scroll necesario

    const scrollbarX = GAME_CONFIG.width - 15;
    const scrollbarY = this.scrollAreaTop;
    const scrollbarHeight = this.scrollAreaHeight;
    const scrollbarWidth = 4;

    // Fondo de la scrollbar (track)
    this.scrollbarTrack = this.add.rectangle(
      scrollbarX,
      scrollbarY,
      scrollbarWidth,
      scrollbarHeight,
      0x333333,
      0.5
    ).setOrigin(0.5, 0);

    // Thumb de la scrollbar (parte que se mueve)
    const thumbHeight = Math.max(
      30,
      (this.scrollAreaHeight / (this.contentHeight + this.scrollAreaHeight)) * scrollbarHeight
    );

    this.scrollbarThumb = this.add.rectangle(
      scrollbarX,
      scrollbarY,
      scrollbarWidth + 2,
      thumbHeight,
      0xd4a574, // Terracota
      0.8
    ).setOrigin(0.5, 0);
  }

  updateScrollbar() {
    if (!this.scrollbarThumb || this.maxScroll <= 0) return;

    const scrollPercentage = this.scrollY / this.maxScroll;
    const maxThumbY = this.scrollAreaHeight - this.scrollbarThumb.height;

    this.scrollbarThumb.y = this.scrollAreaTop + (scrollPercentage * maxThumbY);
  }

  shutdown() {
    // Cleanup keyboard listeners
    this.input.keyboard.off('keydown-ESC');
    this.input.keyboard.off('keydown-ENTER');
  }
}
