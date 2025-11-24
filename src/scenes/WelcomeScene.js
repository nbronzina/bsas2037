/**
 * WelcomeScene - Estilo Macintosh clásico (System 6/7)
 * Pantalla de inicio con estética Mac de los 80s/90s
 */

class WelcomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WelcomeScene' });

    // Paleta Macintosh clásica (monocromática con grises)
    this.colors = {
      black: 0x000000,
      white: 0xFFFFFF,
      lightGray: 0xCCCCCC,
      mediumGray: 0x888888,
      darkGray: 0x555555,
      desktopGray: 0x999999,
      shadow: 0x333333
    };
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Iniciar música de menú
    if (gameState.audioManager && gameState.audioManager.currentMusic !== 'menu') {
      gameState.audioManager.playMenuTheme();
    }

    // Fondo estilo escritorio Mac (gris con textura de puntos)
    this.createMacDesktop(width, height);

    // Ventana central de bienvenida
    this.createWelcomeWindow(width, height);

    // Fade in
    this.cameras.main.fadeIn(800);
  }

  createMacDesktop(width, height) {
    // Fondo gris del desktop
    this.add.rectangle(width/2, height/2, width, height, this.colors.desktopGray);

    // Textura de puntos (patrón característico de Mac)
    const graphics = this.add.graphics();
    graphics.fillStyle(this.colors.mediumGray, 0.3);
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        if ((x + y) % 8 === 0) {
          graphics.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  createWelcomeWindow(width, height) {
    const windowWidth = 520;
    const windowHeight = 500;
    const windowX = width / 2;
    const windowY = height / 2;

    // Sombra de la ventana
    this.add.rectangle(windowX + 4, windowY + 4, windowWidth, windowHeight, this.colors.shadow, 0.5);

    // Fondo blanco de la ventana
    this.add.rectangle(windowX, windowY, windowWidth, windowHeight, this.colors.white)
      .setStrokeStyle(2, this.colors.black);

    // Barra de título con rayas (estilo Mac System 6/7)
    this.createStripedTitleBar(windowX, windowY - windowHeight/2 + 10, windowWidth, 'Red de Aguante');

    // Contenido de la ventana
    this.createWindowContent(windowX, windowY);

    // Botones
    this.createMacButtons(windowX, windowY + windowHeight/2 - 80);

    // Créditos en la ventana
    this.add.text(windowX, windowY + windowHeight/2 - 25, 'LAB de Mundanidad Forzada × Heated Studio', {
      fontSize: '10px',
      color: '#555555',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5);
  }

  createStripedTitleBar(x, y, width, title) {
    const barHeight = 20;

    // Fondo blanco
    this.add.rectangle(x, y, width - 4, barHeight, this.colors.white);

    // Rayas horizontales (patrón Mac clásico)
    const graphics = this.add.graphics();
    graphics.fillStyle(this.colors.black, 1);
    for (let i = 0; i < barHeight; i += 2) {
      graphics.fillRect(x - width/2 + 2, y - barHeight/2 + i, width - 4, 1);
    }

    // Título centrado
    this.add.text(x, y, title, {
      fontSize: '12px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5);

    // Botón de cerrar (cuadrado en la esquina)
    const closeBtn = this.add.rectangle(x - width/2 + 15, y, 12, 12, this.colors.white)
      .setStrokeStyle(1, this.colors.black);
  }

  createWindowContent(centerX, centerY) {
    // Logo (Apple para guiño a Mac)
    this.add.text(centerX, centerY - 160, '🍏', {
      fontSize: '48px'
    }).setOrigin(0.5);

    // Título del juego
    this.add.text(centerX, centerY - 100, 'RED DE AGUANTE', {
      fontSize: '28px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5);

    // Subtítulo
    this.add.text(centerX, centerY - 70, 'Buenos Aires, 2037', {
      fontSize: '14px',
      color: '#555555',
      fontStyle: 'italic',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5);

    // Línea separadora
    this.add.rectangle(centerX, centerY - 50, 300, 1, this.colors.black);

    // Descripción
    const descText = 'Una semana gestionando una red autogestionada.\n\n' +
      '📄 Cada documento requiere una decisión\n' +
      '⚡ Cada decisión tiene consecuencias\n' +
      '🤝 Tu comunidad depende de vos';

    this.add.text(centerX, centerY + 10, descText, {
      fontSize: '14px',
      color: '#000000',
      align: 'center',
      lineSpacing: 8,
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5);
  }

  createMacButtons(centerX, baseY) {
    const saveInfo = gameState.saveManager?.getSaveInfo();

    // Botón: Nueva Partida (principal)
    const newGameBtn = this.createMacButton(
      centerX,
      baseY,
      220,
      32,
      'Nueva Partida',
      true
    );
    newGameBtn.on('pointerdown', () => this.startNewGame());

    // Botón: Continuar (si hay save)
    if (saveInfo) {
      const continueBtn = this.createMacButton(
        centerX,
        baseY + 45,
        220,
        28,
        'Continuar',
        false
      );
      continueBtn.on('pointerdown', () => this.continueGame());

      // Info del save
      this.add.text(centerX, baseY + 80, `${saveInfo.dayName} • ${saveInfo.timeAgo}`, {
        fontSize: '11px',
        color: '#555555',
        fontFamily: 'Geneva, Chicago, sans-serif'
      }).setOrigin(0.5);
    }
  }

  createMacButton(x, y, width, height, text, isDefault) {
    const container = this.add.container(x, y);

    // Borde exterior (sombra)
    const shadow = this.add.rectangle(0, 0, width, height, this.colors.shadow)
      .setStrokeStyle(2, this.colors.black);

    // Fondo del botón
    const bg = this.add.rectangle(0, 0, width - 2, height - 2, this.colors.white)
      .setStrokeStyle(isDefault ? 3 : 2, this.colors.black);

    // Texto del botón
    const label = this.add.text(0, 0, text, {
      fontSize: isDefault ? '16px' : '14px',
      color: '#000000',
      fontStyle: isDefault ? 'bold' : 'normal',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5);

    container.add([shadow, bg, label]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    // Efectos hover
    container.on('pointerover', () => {
      bg.setFillStyle(this.colors.lightGray);
    });

    container.on('pointerout', () => {
      bg.setFillStyle(this.colors.white);
    });

    container.on('pointerdown', () => {
      bg.setFillStyle(this.colors.black);
      label.setColor('#FFFFFF');
    });

    container.on('pointerup', () => {
      bg.setFillStyle(this.colors.white);
      label.setColor('#000000');
    });

    return container;
  }

  startNewGame() {
    // Sonido de confirmación
    if (gameState.audioManager) {
      gameState.audioManager.playConfirmSound();
    }

    gameState.reset();

    if (gameState.saveManager) {
      gameState.saveManager.deleteSave();
    }

    this.cameras.main.fadeOut(600);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('DeskScene', { newDay: true });
    });
  }

  continueGame() {
    // Sonido de confirmación
    if (gameState.audioManager) {
      gameState.audioManager.playConfirmSound();
    }

    if (gameState.saveManager?.load()) {
      this.cameras.main.fadeOut(600);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        const hasDocsToday = gameState.documentsToday.length > 0 &&
          gameState.currentDocumentIndex < gameState.documentsToday.length;
        this.scene.start('DeskScene', { newDay: !hasDocsToday });
      });
    } else {
      this.startNewGame();
    }
  }
}

if (typeof window !== 'undefined') {
  window.WelcomeScene = WelcomeScene;
}
