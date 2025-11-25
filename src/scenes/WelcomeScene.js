/**
 * WelcomeScene - Estilo Windows 95/98
 * Pantalla de inicio con estética Windows clásica
 */

class WelcomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WelcomeScene' });
    this.windowsUI = null;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Inicializar WindowsUI
    this.windowsUI = new WindowsUI(this);

    // Iniciar música de menú
    if (gameState.audioManager && gameState.audioManager.currentMusic !== 'menu') {
      gameState.audioManager.playMenuTheme();
    }

    // Fondo estilo escritorio Windows 95 (teal)
    this.add.rectangle(width/2, height/2, width, height, WIN95_COLORS.desktop);

    // Ventana de bienvenida
    this.createWelcomeDialog(width, height);

    // Fade in
    this.cameras.main.fadeIn(800);
  }

  createWelcomeDialog(screenWidth, screenHeight) {
    const windowWidth = 480;
    const windowHeight = 420;
    const windowX = screenWidth / 2;
    const windowY = screenHeight / 2;

    // Crear ventana principal
    const window = this.windowsUI.createWindow(
      windowX,
      windowY,
      windowWidth,
      windowHeight,
      'Red de Aguante - Bienvenido',
      false
    );

    // Obtener área de contenido
    const contentArea = window.getData('contentArea');
    const contentWidth = windowWidth - 40;
    let currentY = -180;

    // Logo/icono
    const logo = this.add.text(0, currentY, '🖥️', {
      fontSize: '48px'
    }).setOrigin(0.5);
    contentArea.add(logo);
    currentY += 70;

    // Título del juego
    const title = this.add.text(0, currentY, 'RED DE AGUANTE', {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    contentArea.add(title);
    currentY += 35;

    // Subtítulo
    const subtitle = this.add.text(0, currentY, 'Buenos Aires, futuro cercano', {
      fontSize: '12px',
      color: '#000080',
      fontStyle: 'italic',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    contentArea.add(subtitle);
    currentY += 28;

    // Línea separadora
    const separator = this.add.rectangle(0, currentY, contentWidth - 80, 2, WIN95_COLORS.buttonShadow);
    contentArea.add(separator);
    currentY += 25;

    // Descripción
    const desc = this.add.text(0, currentY, 'Una semana gestionando una red\nautogestionada.', {
      fontSize: '13px',
      color: '#000000',
      align: 'center',
      lineSpacing: 6,
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    contentArea.add(desc);
    currentY += 60;

    // Botones
    this.createButtons(contentArea, currentY);

    // Créditos al fondo
    currentY = 160;
    const credits = this.add.text(0, currentY, 'LAB de Mundanidad Forzada × Heated Studio', {
      fontSize: '10px',
      color: '#555555',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    contentArea.add(credits);

    // Año
    const year = this.add.text(0, currentY + 15, '2025', {
      fontSize: '9px',
      color: '#888888',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    contentArea.add(year);

    // Hacer funcional el botón cerrar
    const titleBar = window.getData('titleBar');
    if (titleBar && titleBar.closeBtn) {
      titleBar.closeBtn.setInteractive({ useHandCursor: true });
      titleBar.closeBtn.on('pointerdown', () => {
        // No hacer nada - es la pantalla principal
      });
    }
  }

  createButtons(container, startY) {
    const saveInfo = gameState.saveManager?.getSaveInfo();
    let currentY = startY;

    // Botón Nueva Partida
    const newGameBtn = this.windowsUI.createButton(0, currentY, 200, 28, 'Nueva Partida', true);
    this.windowsUI.addButtonEffects(newGameBtn);
    newGameBtn.on('pointerdown', () => this.startNewGame());
    container.add(newGameBtn);
    currentY += 38;

    // Botón Continuar (si hay save)
    if (saveInfo) {
      const continueBtn = this.windowsUI.createButton(0, currentY, 200, 26, 'Continuar', false);
      this.windowsUI.addButtonEffects(continueBtn);
      continueBtn.on('pointerdown', () => this.continueGame());
      container.add(continueBtn);
      currentY += 32;

      // Info del save
      const saveText = this.add.text(0, currentY, `${saveInfo.dayName} - ${saveInfo.timeAgo}`, {
        fontSize: '10px',
        color: '#555555',
        fontFamily: 'MS Sans Serif, Arial, sans-serif'
      }).setOrigin(0.5);
      container.add(saveText);
      currentY += 28;
    }

    // Botón Info
    const infoBtn = this.windowsUI.createButton(0, currentY, 200, 26, 'Info', false);
    this.windowsUI.addButtonEffects(infoBtn);
    infoBtn.on('pointerdown', () => this.showInfoPanel());
    container.add(infoBtn);
  }

  showInfoPanel() {
    // Sonido
    if (gameState.audioManager) {
      gameState.audioManager.playConfirmSound();
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const panelWidth = 500;
    const panelHeight = 500;

    // Overlay
    const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.6)
      .setDepth(100)
      .setInteractive();

    // Ventana de info
    const infoWindow = this.windowsUI.createWindow(
      width/2,
      height/2,
      panelWidth,
      panelHeight,
      'Sobre Red de Aguante',
      false
    );
    infoWindow.setDepth(101);

    const contentArea = infoWindow.getData('contentArea');
    let currentY = -210;

    // Texto principal - Párrafo 1
    const para1 = this.add.text(0, currentY,
      'Red de Aguante es un prototipo de juego interactivo\n' +
      'desarrollado como colaboración entre LAB de Mundanidad\n' +
      'Forzada y Heated Studio.', {
      fontSize: '11px',
      color: '#000000',
      align: 'center',
      lineSpacing: 3,
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5, 0);
    contentArea.add(para1);
    currentY += 46; // 3 lines * ~15px + 8px

    // Párrafo 2
    const para2 = this.add.text(0, currentY,
      'El juego explora temas de resiliencia comunitaria y\n' +
      'gestión de recursos en un futuro cercano de Buenos\n' +
      'Aires afectado por el cambio climático.', {
      fontSize: '11px',
      color: '#000000',
      align: 'center',
      lineSpacing: 3,
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5, 0);
    contentArea.add(para2);
    currentY += 46; // 3 lines * ~15px + 8px

    // Párrafo 3
    const para3 = this.add.text(0, currentY,
      'A través de metodologías de diseño ficción, el proyecto\n' +
      'imagina cómo las comunidades autogestionadas podrían\n' +
      'organizarse frente a la crisis de infraestructura urbana.', {
      fontSize: '11px',
      color: '#000000',
      align: 'center',
      lineSpacing: 3,
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5, 0);
    contentArea.add(para3);
    currentY += 54; // 3 lines * ~15px + 16px

    // Separador
    const sep1 = this.add.rectangle(0, currentY, panelWidth - 60, 1, WIN95_COLORS.buttonShadow);
    contentArea.add(sep1);
    currentY += 12;

    // Diseño y concepto
    const designLabel = this.add.text(0, currentY, 'Diseño y concepto:', {
      fontSize: '11px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    contentArea.add(designLabel);
    currentY += 18;

    const nicolasLink = this.createClickableLink(0, currentY, 'Nicolás Bronzina', 'https://www.nicolasbronzina.com/');
    contentArea.add(nicolasLink);
    currentY += 24;

    // Desarrollo
    const devLabel = this.add.text(0, currentY, 'Desarrollo:', {
      fontSize: '11px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    contentArea.add(devLabel);
    currentY += 18;

    // LAB × Heated Studio en una sola línea
    const devText = this.add.text(-5, currentY, 'LAB de Mundanidad Forzada × ', {
      fontSize: '11px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(1, 0.5);
    contentArea.add(devText);

    const heatedLink = this.createClickableLink(5, currentY, 'Heated Studio', 'https://www.heated.studio/');
    heatedLink.setOrigin(0, 0.5);
    contentArea.add(heatedLink);
    currentY += 24;

    // Stack técnico
    const stackLabel = this.add.text(0, currentY, 'Stack técnico:', {
      fontSize: '11px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    contentArea.add(stackLabel);
    currentY += 18;

    const stackText = '• Claude Code (Anthropic) - desarrollo asistido por IA\n' +
      '• Claude 3.5/4 Sonnet - diseño de narrativa y sistemas\n' +
      '• Phaser 3 - motor de juego\n' +
      '• JavaScript vanilla';

    const stack = this.add.text(0, currentY, stackText, {
      fontSize: '10px',
      color: '#000000',
      align: 'left',
      lineSpacing: 4,
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5, 0);
    contentArea.add(stack);
    currentY += 72;

    // Año
    const yearText = this.add.text(0, currentY, '2025', {
      fontSize: '10px',
      color: '#555555',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    contentArea.add(yearText);

    // Botón Cerrar
    const closeBtn = this.windowsUI.createButton(0, 215, 100, 26, 'Cerrar', false);
    this.windowsUI.addButtonEffects(closeBtn);
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      infoWindow.destroy();
    });
    contentArea.add(closeBtn);

    // Hacer funcional el botón X de la ventana
    const titleBar = infoWindow.getData('titleBar');
    if (titleBar && titleBar.closeBtn) {
      titleBar.closeBtn.setInteractive({ useHandCursor: true });
      titleBar.closeBtn.on('pointerdown', () => {
        overlay.destroy();
        infoWindow.destroy();
      });
    }
  }

  createClickableLink(x, y, text, url) {
    const link = this.add.text(x, y, text, {
      fontSize: '11px',
      color: '#0000FF',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    link.on('pointerover', () => {
      link.setColor('#0000AA');
      link.setStyle({ textDecoration: 'underline' });
    });

    link.on('pointerout', () => {
      link.setColor('#0000FF');
      link.setStyle({ textDecoration: 'none' });
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
    // Sonido
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
    // Sonido
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
