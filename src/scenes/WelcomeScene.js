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
    const windowHeight = 560;
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
    this.createMacButtons(windowX, windowY + windowHeight/2 - 120);

    // Créditos al fondo (FUERA de los botones)
    this.add.text(windowX, windowY + windowHeight/2 - 30, 'LAB de Mundanidad Forzada × Heated Studio', {
      fontSize: '10px',
      color: '#555555',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5);

    // Año
    this.add.text(windowX, windowY + windowHeight/2 - 15, '2025', {
      fontSize: '9px',
      color: '#888888',
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
    this.add.text(centerX, centerY - 180, '🍏', {
      fontSize: '48px'
    }).setOrigin(0.5);

    // Título del juego
    this.add.text(centerX, centerY - 120, 'RED DE AGUANTE', {
      fontSize: '28px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5);

    // Subtítulo
    this.add.text(centerX, centerY - 90, 'Un futuro cercano de Buenos Aires', {
      fontSize: '14px',
      color: '#555555',
      fontStyle: 'italic',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5);

    // Línea separadora
    this.add.rectangle(centerX, centerY - 65, 300, 1, this.colors.black);

    // Descripción
    const descText = 'Una semana gestionando una red\nautogestionada.';

    this.add.text(centerX, centerY - 30, descText, {
      fontSize: '14px',
      color: '#000000',
      align: 'center',
      lineSpacing: 8,
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5);
  }

  createMacButtons(centerX, baseY) {
    const saveInfo = gameState.saveManager?.getSaveInfo();
    let currentY = baseY;

    // Botón: Nueva Partida (principal)
    const newGameBtn = this.createMacButton(
      centerX,
      currentY,
      220,
      32,
      'Nueva Partida',
      true
    );
    newGameBtn.on('pointerdown', () => this.startNewGame());
    currentY += 45;

    // Botón: Continuar (si hay save)
    if (saveInfo) {
      const continueBtn = this.createMacButton(
        centerX,
        currentY,
        220,
        28,
        'Continuar',
        false
      );
      continueBtn.on('pointerdown', () => this.continueGame());
      currentY += 35;

      // Info del save (debajo del botón Continuar)
      this.add.text(centerX, currentY, `${saveInfo.dayName} - ${saveInfo.timeAgo}`, {
        fontSize: '11px',
        color: '#555555',
        fontFamily: 'Geneva, Chicago, sans-serif'
      }).setOrigin(0.5);
      currentY += 30;
    }

    // Botón: Info
    const infoBtn = this.createMacButton(
      centerX,
      currentY,
      220,
      28,
      'Info',
      false
    );
    infoBtn.on('pointerdown', () => this.showInfoPanel());
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

  showInfoPanel() {
    // Sonido de confirmación
    if (gameState.audioManager) {
      gameState.audioManager.playConfirmSound();
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const panelWidth = 500;
    const panelHeight = 500;

    // Overlay oscuro
    const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7)
      .setDepth(100)
      .setInteractive();

    // Panel de información
    const panelX = width / 2;
    const panelY = height / 2;

    // Sombra
    const shadow = this.add.rectangle(panelX + 4, panelY + 4, panelWidth, panelHeight, this.colors.shadow, 0.5)
      .setDepth(101);

    // Fondo blanco
    const bg = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, this.colors.white)
      .setStrokeStyle(2, this.colors.black)
      .setDepth(101);

    // Barra de título
    this.createStripedTitleBar(panelX, panelY - panelHeight/2 + 10, panelWidth, 'Sobre Red de Aguante');

    // Contenido del panel (con scroll simulado)
    const contentY = panelY - panelHeight/2 + 50;
    let currentY = contentY;

    // Texto principal
    const mainText = 'Red de Aguante es un prototipo de juego interactivo desarrollado como\n' +
      'colaboración entre LAB de Mundanidad Forzada y Heated Studio.\n\n' +
      'El juego explora temas de resiliencia comunitaria y gestión de recursos\n' +
      'en un futuro cercano de Buenos Aires afectado por el cambio climático.\n\n' +
      'A través de metodologías de diseño ficción, el proyecto imagina cómo\n' +
      'las comunidades autogestionadas podrían organizarse frente a la crisis\n' +
      'de infraestructura urbana.';

    const mainTextObj = this.add.text(panelX, currentY, mainText, {
      fontSize: '12px',
      color: '#000000',
      align: 'left',
      lineSpacing: 5,
      fontFamily: 'Geneva, Chicago, sans-serif',
      wordWrap: { width: panelWidth - 60 }
    }).setOrigin(0.5, 0).setDepth(102);
    currentY += 180;

    // Línea separadora
    this.add.rectangle(panelX, currentY, panelWidth - 40, 1, this.colors.black).setDepth(102);
    currentY += 20;

    // Diseño y concepto
    this.add.text(panelX, currentY, 'Diseño y concepto:', {
      fontSize: '12px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5).setDepth(102);
    currentY += 20;

    const nicolasLink = this.createClickableLink(panelX, currentY, 'Nicolás Bronzina', 'https://www.nicolasbronzina.com/');
    nicolasLink.setDepth(102);
    currentY += 25;

    // Desarrollo
    this.add.text(panelX, currentY, 'Desarrollo:', {
      fontSize: '12px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5).setDepth(102);
    currentY += 20;

    this.add.text(panelX, currentY, 'LAB de Mundanidad Forzada × ', {
      fontSize: '12px',
      color: '#000000',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(1, 0.5).setDepth(102).setX(panelX - 40);

    const heatedLink = this.createClickableLink(panelX + 40, currentY, 'Heated Studio', 'https://www.heated.studio/');
    heatedLink.setDepth(102).setOrigin(0, 0.5);
    currentY += 30;

    // Stack técnico
    this.add.text(panelX, currentY, 'Stack técnico:', {
      fontSize: '12px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5).setDepth(102);
    currentY += 20;

    const stackText = '• Claude Code (Anthropic) para desarrollo asistido por IA\n' +
      '• Claude 3.5/4 Sonnet para diseño de narrativa y sistemas\n' +
      '• Phaser 3 como motor de juego\n' +
      '• JavaScript vanilla';

    this.add.text(panelX, currentY, stackText, {
      fontSize: '11px',
      color: '#000000',
      align: 'left',
      lineSpacing: 5,
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5, 0).setDepth(102);
    currentY += 90;

    // Año
    this.add.text(panelX, currentY, '2025', {
      fontSize: '11px',
      color: '#555555',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5).setDepth(102);

    // Botón Cerrar
    const closeBtn = this.createMacButton(panelX, panelY + panelHeight/2 - 35, 120, 28, 'Cerrar', false);
    closeBtn.setDepth(102);
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      shadow.destroy();
      bg.destroy();
      mainTextObj.destroy();
      nicolasLink.destroy();
      heatedLink.destroy();
      closeBtn.destroy();
      // Destruir todos los textos del panel
      this.children.list.filter(child => child.depth === 102).forEach(child => child.destroy());
    });
  }

  createClickableLink(x, y, text, url) {
    const link = this.add.text(x, y, text, {
      fontSize: '12px',
      color: '#4a9eff',
      fontFamily: 'Geneva, Chicago, sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    link.on('pointerover', () => {
      link.setColor('#6db3ff');
    });

    link.on('pointerout', () => {
      link.setColor('#4a9eff');
    });

    link.on('pointerdown', () => {
      if (gameState.audioManager) {
        gameState.audioManager.playConfirmSound();
      }
      window.open(url, '_blank');
    });

    return link;
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
