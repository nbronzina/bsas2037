/**
 * DeskScene - Escritorio Windows 95/98
 * Simula un escritorio completo con iconos, ventanas y barra de tareas
 */

class DeskScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DeskScene' });
    this.windowsUI = null;
    this.taskbar = null;
    this.desktopIcons = {};
    this.emailWindow = null;
    this.currentEmailIndex = 0;
    this.openWindows = new Map();
    this.taskbarWindowButtons = [];
    this.processingDecision = false; // Prevenir múltiples clicks
  }

  init(data) {
    this.isNewDay = data?.newDay || false;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    gameState.currentScene = this;

    // Inicializar WindowsUI
    this.windowsUI = new WindowsUI(this);

    // Iniciar música
    if (gameState.audioManager && gameState.audioManager.currentMusic !== 'management') {
      gameState.audioManager.playManagementTheme();
    }

    // Verificar inicio del juego
    if (this.isNewDay || gameState.documentsToday.length === 0) {
      this.setupNewDay();
    }

    // Fondo teal del escritorio
    this.add.rectangle(width/2, height/2, width, height, WIN95_COLORS.desktop);

    // Crear iconos del escritorio
    this.createDesktopIcons(width, height);

    // Crear barra de tareas
    this.createTaskbar(width, height);

    // Abrir Bandeja de Entrada automáticamente
    this.time.delayedCall(300, () => {
      this.openInbox();
    });

    // AGREGADO: Activar auto-save cada 30 segundos
    if (gameState.saveManager && !gameState.saveManager.autoSaveInterval) {
      gameState.saveManager.enableAutoSave(30000);
      console.log('💾 Auto-save activado en DeskScene');
    }

    // AGREGADO: Registrar shutdown handler para cleanup
    this.events.once('shutdown', this.shutdown, this);

    this.cameras.main.fadeIn(500);
  }

  // ═══════════════════════════════════════════
  // SETUP DEL DÍA
  // ═══════════════════════════════════════════

  setupNewDay() {
    console.log('🌅 setupNewDay called');

    // CORREGIDO: Incrementar día basado en si ya había documentos del día anterior
    // Esto distingue correctamente entre:
    //
    // CASO 1 - Inicio de juego:
    //   - currentDay = 1, documentsToday = [] (vacío)
    //   - NO incrementa → se queda en día 1
    //   - Carga documentos del día 1 (d1_intro, d1_generador)
    //
    // CASO 2 - Avanzar de día:
    //   - currentDay = 1, documentsToday = [d1_intro, d1_generador] (ya completados)
    //   - SÍ incrementa → avanza a día 2
    //   - Carga documentos del día 2 (d2_agua, etc.)
    //
    // CASO 3 - Cargar partida guardada:
    //   - isNewDay = false → setupNewDay() no se llama
    //   - Usa los documentos ya cargados del save
    if (gameState.documentsToday.length > 0) {
      gameState.currentDay++;
      console.log('  ✓ Day incremented to:', gameState.currentDay);
    } else {
      console.log('  ✗ Day NOT incremented (starting at day', gameState.currentDay, ')');
    }

    if (gameState.documentManager) {
      gameState.documentsToday = gameState.documentManager.getDocumentsForDay(gameState.currentDay);
      gameState.currentDocumentIndex = 0;

      console.log(`📅 Day ${gameState.currentDay}: ${gameState.documentsToday.length} documents`);
      gameState.documentsToday.forEach((doc, i) => {
        console.log(`  ${i}: ${doc.id} - ${doc.title}`);
      });

      // Aplicar decay del día anterior
      if (gameState.currentDay > 1) {
        gameState.applyResourceDecay();
        this.updateResourceDisplay();
      }

      // Guardar recursos al inicio del día para comparar al final
      this.dayStartResources = { ...gameState.resources };
    } else {
      console.error('DocumentManager not initialized!');
    }
  }

  // ═══════════════════════════════════════════
  // ICONOS DEL ESCRITORIO
  // ═══════════════════════════════════════════

  createDesktopIcons(width, height) {
    const iconX = 40;
    let iconY = 30;
    const iconSpacing = 80;

    // Icono: Bandeja de Entrada
    const inboxIcon = this.windowsUI.createDesktopIcon(iconX, iconY, '📧', 'Bandeja\nde Entrada');
    inboxIcon.on('pointerdown', () => this.openInbox());
    this.add.existing(inboxIcon);
    this.desktopIcons.inbox = inboxIcon;

    // Animar icono con badge si hay emails nuevos
    this.animateEmailIcon();

    iconY += iconSpacing;

    // Icono: Estado de la Red
    const statusIcon = this.windowsUI.createDesktopIcon(iconX, iconY, '📊', 'Estado\nde la Red');
    statusIcon.on('pointerdown', () => this.openStatus());
    this.add.existing(statusIcon);
    this.desktopIcons.status = statusIcon;
    iconY += iconSpacing;

    // Icono: Historial
    const historyIcon = this.windowsUI.createDesktopIcon(iconX, iconY, '📋', 'Historial');
    historyIcon.on('pointerdown', () => this.openHistory());
    this.add.existing(historyIcon);
    this.desktopIcons.history = historyIcon;
    iconY += iconSpacing;

    // Icono: Papelera (con easter egg)
    const trashIcon = this.windowsUI.createDesktopIcon(iconX, iconY, '🗑️', 'Papelera');
    trashIcon.on('pointerdown', () => this.openTrash());
    this.add.existing(trashIcon);
    this.desktopIcons.trash = trashIcon;
    this.trashClickCount = 0;
  }

  animateEmailIcon() {
    if (!this.desktopIcons.inbox) return;

    const unreadCount = gameState.documentsToday.length - gameState.currentDocumentIndex;

    // Limpiar badge anterior si existe
    if (this.emailBadge) {
      this.emailBadge.destroy();
      this.emailBadgeText.destroy();
    }

    // Si hay emails sin leer, mostrar badge y animar
    if (unreadCount > 0) {
      const icon = this.desktopIcons.inbox;
      const iconX = 40;
      const iconY = 30;

      // Badge rojo con número
      this.emailBadge = this.add.circle(iconX + 25, iconY - 25, 12, 0xff0000);
      this.emailBadge.setDepth(20);

      this.emailBadgeText = this.add.text(iconX + 25, iconY - 25, unreadCount.toString(), {
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'MS Sans Serif, Arial, sans-serif'
      }).setOrigin(0.5).setDepth(21);

      // Animación de bounce
      this.tweens.add({
        targets: icon,
        y: iconY - 8,
        duration: 200,
        yoyo: true,
        repeat: 1,
        ease: 'Sine.easeInOut'
      });

      // Pulse del badge
      this.tweens.add({
        targets: [this.emailBadge, this.emailBadgeText],
        scale: { from: 1.2, to: 1 },
        duration: 400,
        ease: 'Back.easeOut'
      });
    }
  }

  // ═══════════════════════════════════════════
  // BARRA DE TAREAS
  // ═══════════════════════════════════════════

  createTaskbar(width, height) {
    this.taskbar = this.windowsUI.createTaskbar(width, height);

    // Agregar info de recursos y reloj al system tray
    this.updateTaskbarTray();

    // Botón Inicio no hace nada por ahora
    const startBtn = this.taskbar.getData('startBtn');
    startBtn.removeAllListeners();
    this.windowsUI.addButtonEffects(startBtn);
  }

  updateTaskbarTray() {
    if (!this.taskbar) return;

    const trayX = this.taskbar.getData('trayX');

    // Limpiar tray anterior si existe
    if (this.trayContent) {
      this.trayContent.destroy();
    }

    this.trayContent = this.add.container(0, 0);
    this.taskbar.add(this.trayContent);

    const trayY = 0;

    // Temperatura, día y hora: 🌡️ 38°C  Dom  14:32
    const temp = this.getGameTemp();
    const dayName = gameState.getShortDayName(); // Usar nombre corto para que quepa
    const time = this.getGameTime();

    const trayText = `🌡️ ${temp}°C  ${dayName}  ${time}`;

    const clockText = this.add.text(trayX + 10, trayY, trayText, {
      fontSize: '11px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0, 0.5);
    this.trayContent.add(clockText);
  }

  getGameTime() {
    // Horarios para cada día de la semana
    const times = {
      1: '09:24',  // Lunes mañana
      2: '14:32',  // Martes tarde
      3: '12:18',  // Miércoles mediodía
      4: '15:47',  // Jueves tarde
      5: '10:56',  // Viernes mañana
      6: '16:23',  // Sábado tarde
      7: '11:09'   // Domingo mañana
    };
    return times[gameState.currentDay] || '12:00';
  }

  getGameTemp() {
    // Buenos Aires 2037, ola de calor
    const temps = [42, 38, 41, 39, 43, 37, 40];
    return temps[gameState.currentDay - 1] || 40;
  }

  updateResourceDisplay() {
    this.updateTaskbarTray();
  }

  // ═══════════════════════════════════════════
  // WINDOW MANAGEMENT - TASKBAR TRACKING
  // ═══════════════════════════════════════════

  registerWindow(id, title, windowObject) {
    this.openWindows.set(id, {
      title: title,
      window: windowObject,
      minimized: false
    });
    this.updateTaskbarWindows();
  }

  unregisterWindow(id) {
    this.openWindows.delete(id);
    this.updateTaskbarWindows();
  }

  updateTaskbarWindows() {
    // Limpiar botones viejos
    this.taskbarWindowButtons.forEach(btn => {
      if (btn.bg) btn.bg.destroy();
      if (btn.text) btn.text.destroy();
      if (btn.border) btn.border.destroy();
    });
    this.taskbarWindowButtons = [];

    let x = 133; // Después del botón Inicio + separador

    this.openWindows.forEach((winData, id) => {
      const btn = this.createTaskbarWindowButton(x, winData, id);
      this.taskbarWindowButtons.push(btn);
      x += 160;
    });
  }

  createTaskbarWindowButton(x, winData, id) {
    const y = this.cameras.main.height - 15;

    // Fondo del botón
    const bg = this.add.rectangle(x, y, 150, 24,
      winData.minimized ? WIN95_COLORS.buttonFace : WIN95_COLORS.highlightBg
    ).setInteractive({ useHandCursor: true });

    // Texto
    const text = this.add.text(x, y, winData.title, {
      fontSize: '12px',
      color: winData.minimized ? '#000000' : '#ffffff',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);

    // Borde 3D
    const border = this.add.rectangle(x, y, 150, 24)
      .setStrokeStyle(2, winData.minimized ? 0xffffff : 0x000000)
      .setFillStyle(0x000000, 0);

    // Click para minimizar/restaurar
    bg.on('pointerdown', () => {
      if (winData.minimized) {
        winData.window.setVisible(true);
        winData.window.setDepth(1000);
        winData.minimized = false;
      } else {
        winData.window.setVisible(false);
        winData.minimized = true;
      }
      this.updateTaskbarWindows();
    });

    return { bg, text, border };
  }

  // ═══════════════════════════════════════════
  // BANDEJA DE ENTRADA (OUTLOOK EXPRESS STYLE)
  // ═══════════════════════════════════════════

  openInbox() {
    // Si ya está abierta, solo traerla al frente
    if (this.emailWindow && this.emailWindow.active) {
      this.emailWindow.setDepth(1000);

      // Si estaba minimizada, restaurarla
      const winData = this.openWindows.get('inbox');
      if (winData && winData.minimized) {
        this.emailWindow.setVisible(true);
        winData.minimized = false;
        this.updateTaskbarWindows();
      }

      // CORREGIDO: Actualizar contenido para mostrar el documento actual
      // Esto previene el glitch cuando se avanza al siguiente documento
      console.log('🔄 Inbox ya existe, actualizando contenido para doc índice:', gameState.currentDocumentIndex);
      this.showEmail(gameState.currentDocumentIndex);

      return;
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const windowWidth = 700;
    const windowHeight = 500;

    // Crear ventana de email
    this.emailWindow = this.windowsUI.createWindow(
      width/2,
      height/2 - 20,
      windowWidth,
      windowHeight,
      '📧 Bandeja de Entrada',
      true
    );
    this.emailWindow.setDepth(10);

    // Registrar ventana en taskbar
    this.registerWindow('inbox', '📧 Bandeja', this.emailWindow);

    const contentArea = this.emailWindow.getData('contentArea');

    // Layout tipo Outlook Express: lista a la izquierda, contenido a la derecha
    this.createEmailListPanel(contentArea, windowWidth, windowHeight);
    this.createEmailContentPanel(contentArea, windowWidth, windowHeight);

    // Mostrar primer documento
    this.showEmail(gameState.currentDocumentIndex);

    // Botón cerrar funcional
    const titleBar = this.emailWindow.getData('titleBar');
    if (titleBar && titleBar.closeBtn) {
      titleBar.closeBtn.setInteractive({ useHandCursor: true });
      titleBar.closeBtn.on('pointerdown', () => {
        this.unregisterWindow('inbox');
        this.emailWindow.destroy();
        this.emailWindow = null;
      });
    }
  }

  createEmailListPanel(container, windowWidth, windowHeight) {
    const listWidth = 220;
    const listHeight = windowHeight - 80;
    const listX = -windowWidth/2 + listWidth/2 + 20;
    const listY = -20;

    // Panel de lista
    const listBg = this.add.rectangle(listX, listY, listWidth, listHeight, WIN95_COLORS.white);
    this.windowsUI.create3DBorder(container, listX, listY, listWidth, listHeight, false);
    container.add(listBg);

    // Lista de documentos (scrollable container)
    this.emailListContainer = this.add.container(listX, listY - listHeight/2 + 10);
    container.add(this.emailListContainer);

    let currentY = 0;

    // Sección: Mensajes nuevos
    const newMessagesHeader = this.add.text(-listWidth/2 + 10, currentY, '📨 Mensajes', {
      fontSize: '11px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0, 0.5);
    this.emailListContainer.add(newMessagesHeader);
    currentY += 25;

    // Mensajes sin leer
    const unreadDocs = gameState.documentsToday.slice(gameState.currentDocumentIndex);

    if (unreadDocs.length === 0) {
      const noNew = this.add.text(-listWidth/2 + 20, currentY, '(Sin mensajes nuevos)', {
        fontSize: '10px',
        color: '#808080',
        fontStyle: 'italic',
        fontFamily: 'MS Sans Serif, Arial, sans-serif'
      }).setOrigin(0, 0.5);
      this.emailListContainer.add(noNew);
      currentY += 25;
    } else {
      unreadDocs.forEach((doc, idx) => {
        const globalIndex = gameState.currentDocumentIndex + idx;
        this.addEmailItem(doc, globalIndex, currentY, listWidth, true);
        currentY += 35;
      });
    }

    currentY += 10;

    // Sección: Leídos
    const readCount = gameState.readDocuments.length;
    const leidosHeader = this.add.text(-listWidth/2 + 10, currentY, `📁 Leídos (${readCount})`, {
      fontSize: '11px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0, 0.5)
    .setInteractive({ useHandCursor: true });
    this.emailListContainer.add(leidosHeader);

    // Toggle para expandir/colapsar
    this.leidosExpanded = this.leidosExpanded || false;
    leidosHeader.on('pointerdown', () => {
      this.leidosExpanded = !this.leidosExpanded;
      this.refreshEmailSidebar();
    });

    currentY += 25;

    // Mostrar emails leídos si está expandido
    if (this.leidosExpanded && gameState.readDocuments.length > 0) {
      // Mostrar últimos 5 leídos
      const recentRead = gameState.readDocuments.slice(-5).reverse();
      recentRead.forEach(doc => {
        this.addReadEmailItem(doc, currentY, listWidth);
        currentY += 35;
      });
    }
  }

  addEmailItem(doc, index, itemY, listWidth, isUnread) {
    const itemHeight = 32;
    const isCurrent = index === gameState.currentDocumentIndex;

    // Fondo de item (si es el actual, resaltar)
    if (isCurrent) {
      const highlight = this.add.rectangle(0, itemY, listWidth - 10, itemHeight, WIN95_COLORS.highlightBg);
      this.emailListContainer.add(highlight);
    }

    // Icono + punto azul si no leído
    const icon = this.add.text(-listWidth/2 + 10, itemY, '📧', {
      fontSize: '12px'
    }).setOrigin(0, 0.5);
    this.emailListContainer.add(icon);

    if (isUnread) {
      const blueDot = this.add.circle(-listWidth/2 + 5, itemY, 3, 0x0000ff);
      this.emailListContainer.add(blueDot);
    }

    // Info del email
    const npc = gameState.getNPC(doc.sender);
    const sender = npc?.name || doc.sender;
    const textColor = isCurrent ? '#FFFFFF' : '#000000';

    const senderText = this.add.text(-listWidth/2 + 30, itemY - 8, sender, {
      fontSize: '11px',
      color: textColor,
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0, 0.5);
    this.emailListContainer.add(senderText);

    const titlePreview = doc.title.length > 18 ? doc.title.substring(0, 18) + '...' : doc.title;
    const subjectText = this.add.text(-listWidth/2 + 30, itemY + 6, titlePreview, {
      fontSize: '10px',
      color: textColor,
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0, 0.5);
    this.emailListContainer.add(subjectText);

    // Hacer clickeable
    const clickArea = this.add.rectangle(0, itemY, listWidth - 10, itemHeight, 0xFFFFFF, 0.01)
      .setInteractive({ useHandCursor: true });
    this.emailListContainer.add(clickArea);

    clickArea.on('pointerdown', () => {
      if (index === gameState.currentDocumentIndex) {
        this.showEmail(index);
      }
    });
  }

  addReadEmailItem(doc, itemY, listWidth) {
    const itemHeight = 32;

    // Icono (sin punto azul - ya leído)
    const icon = this.add.text(-listWidth/2 + 15, itemY, '📧', {
      fontSize: '12px'
    }).setOrigin(0, 0.5);
    this.emailListContainer.add(icon);

    // Info del email en gris
    const npc = gameState.getNPC(doc.sender);
    const sender = npc?.name || doc.sender;

    const senderText = this.add.text(-listWidth/2 + 35, itemY - 8, sender, {
      fontSize: '10px',
      color: '#808080',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0, 0.5);
    this.emailListContainer.add(senderText);

    const titlePreview = doc.title.length > 18 ? doc.title.substring(0, 18) + '...' : doc.title;
    const subjectText = this.add.text(-listWidth/2 + 35, itemY + 6, titlePreview, {
      fontSize: '9px',
      color: '#999999',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0, 0.5);
    this.emailListContainer.add(subjectText);

    // Hacer clickeable para ver en modo solo lectura
    const clickArea = this.add.rectangle(0, itemY, listWidth - 10, itemHeight, 0xFFFFFF, 0.01)
      .setInteractive({ useHandCursor: true });
    this.emailListContainer.add(clickArea);

    clickArea.on('pointerdown', () => {
      this.showReadDocument(doc);
    });
  }

  refreshEmailSidebar() {
    // Recrear sidebar completo
    if (this.emailListContainer) {
      this.emailListContainer.destroy();
    }
    const windowWidth = 700;
    const windowHeight = 500;
    const contentArea = this.emailWindow.getData('contentArea');
    this.createEmailListPanel(contentArea, windowWidth, windowHeight);
  }

  showReadDocument(doc) {
    // Mostrar documento en modo solo lectura (sin botones de respuesta)
    if (this.emailContentContainer) {
      this.emailContentContainer.removeAll(true);
    }

    let currentY = -180;

    // Badge: Decidiste
    const badge = this.add.text(0, currentY, `✅ Decidiste: "${doc.chosenOption.text}"`, {
      fontSize: '11px',
      color: '#008000',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif',
      backgroundColor: '#d0ffd0',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);
    this.emailContentContainer.add(badge);
    currentY += 30;

    // De:
    const npc = gameState.getNPC(doc.sender);
    const fromText = this.add.text(0, currentY, `De: ${npc?.name || doc.sender}`, {
      fontSize: '12px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    this.emailContentContainer.add(fromText);
    currentY += 25;

    // Asunto
    const subjectText = this.add.text(0, currentY, doc.title, {
      fontSize: '13px',
      color: '#000080',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    this.emailContentContainer.add(subjectText);
    currentY += 30;

    // Separador
    const sep = this.add.rectangle(0, currentY, 360, 1, WIN95_COLORS.buttonShadow);
    this.emailContentContainer.add(sep);
    currentY += 20;

    // Contenido
    const content = this.add.text(0, currentY, doc.content, {
      fontSize: '11px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif',
      wordWrap: { width: 360 },
      align: 'left',
      lineSpacing: 5
    }).setOrigin(0.5, 0);
    this.emailContentContainer.add(content);
  }

  createEmailContentPanel(container, windowWidth, windowHeight) {
    const contentWidth = windowWidth - 280;
    const contentHeight = windowHeight - 80;
    const contentX = windowWidth/2 - contentWidth/2 - 20;
    const contentY = -20;

    // Panel de contenido
    const contentBg = this.add.rectangle(contentX, contentY, contentWidth, contentHeight, WIN95_COLORS.white);
    this.windowsUI.create3DBorder(container, contentX, contentY, contentWidth, contentHeight, false);
    container.add(contentBg);

    // Contenedor para el email actual
    this.emailContentContainer = this.add.container(contentX, contentY);
    container.add(this.emailContentContainer);
  }

  showEmail(index) {
    console.log('📋 showEmail called for index:', index);

    // Limpiar contenido anterior
    this.emailContentContainer.removeAll(true);

    const doc = gameState.documentsToday[index];
    if (!doc) {
      console.log('No document at index:', index);
      return;
    }

    const contentWidth = 380;
    let currentY = -200;

    // Header del email
    const npc = gameState.getNPC(doc.sender);
    const sender = npc?.name || doc.sender;

    // De:
    const fromLabel = this.add.text(-contentWidth/2 + 10, currentY, 'De:', {
      fontSize: '11px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0, 0.5);
    this.emailContentContainer.add(fromLabel);

    const fromValue = this.add.text(-contentWidth/2 + 60, currentY, sender, {
      fontSize: '11px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0, 0.5);
    this.emailContentContainer.add(fromValue);
    currentY += 20;

    // Para:
    const toLabel = this.add.text(-contentWidth/2 + 10, currentY, 'Para:', {
      fontSize: '11px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0, 0.5);
    this.emailContentContainer.add(toLabel);

    const toValue = this.add.text(-contentWidth/2 + 60, currentY, 'Coordinación', {
      fontSize: '11px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0, 0.5);
    this.emailContentContainer.add(toValue);
    currentY += 20;

    // Asunto:
    const subjectLabel = this.add.text(-contentWidth/2 + 10, currentY, 'Asunto:', {
      fontSize: '11px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0, 0.5);
    this.emailContentContainer.add(subjectLabel);

    const subjectValue = this.add.text(-contentWidth/2 + 60, currentY, doc.title, {
      fontSize: '11px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif',
      wordWrap: { width: contentWidth - 70 }
    }).setOrigin(0, 0.5);
    this.emailContentContainer.add(subjectValue);
    currentY += 25;

    // Separador
    const separator = this.add.rectangle(0, currentY, contentWidth - 20, 1, WIN95_COLORS.buttonShadow);
    this.emailContentContainer.add(separator);
    currentY += 20;

    // Cuerpo del mensaje
    const bodyText = this.add.text(0, currentY, doc.content, {
      fontSize: '12px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif',
      wordWrap: { width: contentWidth - 40 },
      align: 'left',
      lineSpacing: 5
    }).setOrigin(0.5, 0);
    this.emailContentContainer.add(bodyText);
    currentY += bodyText.height + 30;

    // Botones de respuesta
    doc.options.forEach((option, optIndex) => {
      const btn = this.windowsUI.createButton(0, currentY, 300, 26, option.text, false);
      this.windowsUI.addButtonEffects(btn);
      btn.on('pointerdown', () => {
        this.selectOption(doc, optIndex, option);
      });
      this.emailContentContainer.add(btn);
      currentY += 35;
    });
  }

  // ═══════════════════════════════════════════
  // SELECCIÓN DE OPCIÓN
  // ═══════════════════════════════════════════

  selectOption(doc, index, option) {
    console.log('🔵 selectOption called:', doc.id, 'option:', index);

    // CORREGIDO: Prevenir múltiples clicks en el mismo botón
    if (this.processingDecision) {
      console.warn('⚠️ Decisión ya en proceso, ignorando click');
      return;
    }
    this.processingDecision = true;

    // Guardar estado ANTES de aplicar cambios
    this.previousResources = { ...gameState.resources };

    // Procesar decisión
    const result = gameState.documentManager.processDecision(doc, index);
    console.log('📊 processDecision result:', result);

    // CORREGIDO: Validar que processDecision tuvo éxito
    if (!result) {
      console.error('❌ selectOption: processDecision failed, aborting');
      this.processingDecision = false;
      return;
    }

    // Registrar en historial y documentos leídos
    gameState.addReadDocument(doc, option);
    gameState.recordDecision(doc, option);

    gameState.currentDocumentIndex++;
    console.log('📈 Index incremented to:', gameState.currentDocumentIndex);
    console.log('📄 Total docs today:', gameState.documentsToday.length);

    // Actualizar recursos
    this.updateResourceDisplay();

    // CORREGIDO: Actualizar lista lateral para reflejar cambios
    if (this.refreshEmailSidebar) {
      this.refreshEmailSidebar();
    }

    // Guardar progreso
    if (gameState.saveManager) {
      gameState.saveManager.save();
    }

    // Mostrar feedback de decisión con antes/después
    this.time.delayedCall(300, () => {
      console.log('⏰ Showing decision feedback');
      this.showDecisionFeedback(option, result.response, () => {
        console.log('✅ Decision feedback callback executed');

        // CORREGIDO: Resetear flag para permitir siguiente decisión
        this.processingDecision = false;

        // Verificar game over
        const failed = gameState.checkResourceFailure();
        if (failed) {
          console.log('💀 Game over:', failed);
          this.cameras.main.fadeOut(500);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('EndingScene', {
              gameOver: true,
              failedResource: failed
            });
          });
          return;
        }

        // Verificar recursos críticos y mostrar notificaciones
        this.checkCriticalResources();

        // Siguiente documento o fin de día
        if (gameState.currentDocumentIndex < gameState.documentsToday.length) {
          console.log('➡️ Next document');
          this.openInbox();
        } else {
          console.log('📅 End of day');
          this.showEndOfDay();
        }
      });
    });
  }

  showResponse(response, callback) {
    console.log('💬 showResponse:', response);

    if (!response) {
      console.log('  No response, calling callback');
      callback();
      return;
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const dialogWidth = 400;
    const dialogHeight = 160;

    // Overlay
    const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.5)
      .setDepth(100)
      .setInteractive();

    // Ventana de respuesta
    const responseWindow = this.windowsUI.createWindow(
      width/2,
      height/2,
      dialogWidth,
      dialogHeight,
      'Respuesta',
      false
    );
    responseWindow.setDepth(101);

    const contentArea = responseWindow.getData('contentArea');

    // Texto de respuesta
    const text = this.add.text(0, -20, response, {
      fontSize: '12px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif',
      wordWrap: { width: dialogWidth - 60 },
      align: 'center',
      lineSpacing: 5
    }).setOrigin(0.5);
    contentArea.add(text);

    // Botón OK
    const okBtn = this.windowsUI.createButton(0, 50, 80, 26, 'OK', true);
    this.windowsUI.addButtonEffects(okBtn);
    okBtn.on('pointerdown', () => {
      console.log('🖱️ OK button clicked');
      overlay.destroy();
      responseWindow.destroy();
      callback();
    });
    contentArea.add(okBtn);

    // Botón X también cierra
    const titleBar = responseWindow.getData('titleBar');
    if (titleBar && titleBar.closeBtn) {
      titleBar.closeBtn.setInteractive({ useHandCursor: true });
      titleBar.closeBtn.on('pointerdown', () => {
        console.log('🖱️ Close button clicked');
        overlay.destroy();
        responseWindow.destroy();
        callback();
      });
    }
  }

  showDecisionFeedback(option, npcResponse, callback) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Overlay
    const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.5)
      .setDepth(100)
      .setInteractive();

    // Ventana de feedback
    const feedbackWindow = this.windowsUI.createWindow(
      width/2,
      height/2,
      440,
      380,
      '✅ Decisión registrada',
      false
    );
    feedbackWindow.setDepth(101);

    const contentArea = feedbackWindow.getData('contentArea');
    let y = -150;

    // Respuesta del NPC
    if (npcResponse) {
      const responseText = this.add.text(0, y, npcResponse, {
        fontSize: '13px',
        color: '#000000',
        fontFamily: 'MS Sans Serif, Arial, sans-serif',
        wordWrap: { width: 380 },
        align: 'center',
        lineSpacing: 4
      }).setOrigin(0.5);
      contentArea.add(responseText);
      y += responseText.height + 20;
    }

    // Título cambios
    const changesTitle = this.add.text(0, y, 'CAMBIOS EN LA RED:', {
      fontSize: '13px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    contentArea.add(changesTitle);
    y += 25;

    // Mostrar cada cambio con antes/después
    let hasChanges = false;
    if (option.consequences) {
      Object.entries(option.consequences).forEach(([key, value]) => {
        if (value === 0) return;
        hasChanges = true;

        const icons = {
          electricidad: '⚡',
          agua: '💧',
          legitimidad: '🤝',
          autonomia: '🏴'
        };
        const names = {
          electricidad: 'Electricidad',
          agua: 'Agua',
          legitimidad: 'Legitimidad',
          autonomia: 'Autonomía'
        };

        const icon = icons[key] || '💰';
        const name = names[key] || key;
        const oldVal = this.previousResources[key];
        const newVal = gameState.resources[key];
        const sign = value > 0 ? '+' : '';
        const color = value > 0 ? '#008000' : '#800000';

        const changeText = this.add.text(0, y,
          `${icon} ${name}: ${oldVal} → ${newVal} (${sign}${value})`, {
          fontSize: '12px',
          color: color,
          fontFamily: 'MS Sans Serif, Arial, sans-serif'
        }).setOrigin(0.5);
        contentArea.add(changeText);

        y += 22;
      });
    }

    if (!hasChanges) {
      const noChangeText = this.add.text(0, y, 'Sin cambios en los recursos', {
        fontSize: '12px',
        color: '#808080',
        fontFamily: 'MS Sans Serif, Arial, sans-serif',
        fontStyle: 'italic'
      }).setOrigin(0.5);
      contentArea.add(noChangeText);
      y += 22;
    }

    // Botón continuar
    const continueBtn = this.windowsUI.createButton(0, 130, 200, 30, 'Siguiente documento', true);
    this.windowsUI.addButtonEffects(continueBtn);
    continueBtn.on('pointerdown', () => {
      overlay.destroy();
      feedbackWindow.destroy();
      callback();
    });
    contentArea.add(continueBtn);

    // Botón X también cierra
    const titleBar = feedbackWindow.getData('titleBar');
    if (titleBar && titleBar.closeBtn) {
      titleBar.closeBtn.setInteractive({ useHandCursor: true });
      titleBar.closeBtn.on('pointerdown', () => {
        overlay.destroy();
        feedbackWindow.destroy();
        callback();
      });
    }
  }

  // ═══════════════════════════════════════════
  // VENTANA DE ESTADO
  // ═══════════════════════════════════════════

  openStatus() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const windowWidth = 400;
    const windowHeight = 350;

    const statusWindow = this.windowsUI.createWindow(
      width/2 + 50,
      height/2,
      windowWidth,
      windowHeight,
      '📊 Estado de la Red',
      false
    );
    statusWindow.setDepth(15);

    const contentArea = statusWindow.getData('contentArea');
    let currentY = -130;

    // Título
    const title = this.add.text(0, currentY, 'ESTADO ACTUAL', {
      fontSize: '14px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    contentArea.add(title);
    currentY += 30;

    // Recursos
    const resources = gameState.getResourcesArray();
    resources.forEach(res => {
      const label = this.add.text(-150, currentY, `${res.icon} ${res.key}:`, {
        fontSize: '12px',
        color: '#000000',
        fontFamily: 'MS Sans Serif, Arial, sans-serif'
      }).setOrigin(0, 0.5);
      contentArea.add(label);

      const value = this.add.text(100, currentY, `${res.value}%`, {
        fontSize: '12px',
        color: res.value < 20 ? '#FF0000' : res.value < 50 ? '#FFA500' : '#008000',
        fontStyle: 'bold',
        fontFamily: 'MS Sans Serif, Arial, sans-serif'
      }).setOrigin(1, 0.5);
      contentArea.add(value);

      // Barra de progreso
      const barWidth = 120;
      const barBg = this.add.rectangle(50, currentY, barWidth, 14, WIN95_COLORS.white);
      this.windowsUI.create3DBorder(contentArea, 50, currentY, barWidth, 14, false);
      contentArea.add(barBg);

      const fillWidth = (res.value / 100) * (barWidth - 4);
      const barFill = this.add.rectangle(50 - barWidth/2 + 2 + fillWidth/2, currentY, fillWidth, 10, WIN95_COLORS.highlightBg);
      contentArea.add(barFill);

      // Zona de hover para tooltip
      const hoverZone = this.add.rectangle(0, currentY, 300, 30, 0x000000, 0)
        .setInteractive({ useHandCursor: true });
      contentArea.add(hoverZone);

      let tooltip = null;

      hoverZone.on('pointerover', () => {
        tooltip = this.createResourceTooltip(width/2 + 50, height/2 + currentY - 60, res);
      });

      hoverZone.on('pointerout', () => {
        if (tooltip) {
          tooltip.destroy();
          tooltip = null;
        }
      });

      currentY += 35;
    });

    currentY += 10;

    // Separador
    const sep = this.add.rectangle(0, currentY, windowWidth - 60, 1, WIN95_COLORS.buttonShadow);
    contentArea.add(sep);
    currentY += 20;

    // Día actual
    const dayText = this.add.text(0, currentY, `Día: ${gameState.getDayName()} (${gameState.currentDay}/${gameState.maxDays})`, {
      fontSize: '11px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    contentArea.add(dayText);

    // Botón Cerrar
    const closeBtn = this.windowsUI.createButton(0, 130, 100, 26, 'Cerrar', false);
    this.windowsUI.addButtonEffects(closeBtn);
    closeBtn.on('pointerdown', () => {
      statusWindow.destroy();
    });
    contentArea.add(closeBtn);

    // Botón X
    const titleBar = statusWindow.getData('titleBar');
    if (titleBar && titleBar.closeBtn) {
      titleBar.closeBtn.setInteractive({ useHandCursor: true });
      titleBar.closeBtn.on('pointerdown', () => {
        statusWindow.destroy();
      });
    }
  }

  // ═══════════════════════════════════════════
  // HISTORIAL DE DECISIONES
  // ═══════════════════════════════════════════

  openHistory() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const historyWindow = this.windowsUI.createWindow(
      width/2 - 50,
      height/2,
      520,
      480,
      '📋 Historial de Decisiones',
      false
    );
    historyWindow.setDepth(15);

    const contentArea = historyWindow.getData('contentArea');
    let currentY = -210;

    // Título
    const title = this.add.text(0, currentY, 'DECISIONES TOMADAS', {
      fontSize: '14px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    contentArea.add(title);
    currentY += 30;

    if (gameState.decisionHistory.length === 0) {
      const noHistory = this.add.text(0, currentY, 'Aún no has tomado ninguna decisión.', {
        fontSize: '12px',
        color: '#808080',
        fontStyle: 'italic',
        fontFamily: 'MS Sans Serif, Arial, sans-serif'
      }).setOrigin(0.5);
      contentArea.add(noHistory);
    } else {
      // Agrupar por día
      const byDay = {};
      gameState.decisionHistory.forEach(dec => {
        if (!byDay[dec.day]) byDay[dec.day] = [];
        byDay[dec.day].push(dec);
      });

      // Mostrar decisiones agrupadas por día
      Object.entries(byDay).forEach(([day, decisions]) => {
        // Header del día
        const dayHeader = this.add.text(-230, currentY, `DÍA ${day} - ${decisions[0].dayName.toUpperCase()}`, {
          fontSize: '12px',
          color: '#000080',
          fontStyle: 'bold',
          fontFamily: 'MS Sans Serif, Arial, sans-serif'
        }).setOrigin(0, 0.5);
        contentArea.add(dayHeader);
        currentY += 18;

        // Línea separadora
        const sep = this.add.rectangle(0, currentY, 460, 1, WIN95_COLORS.buttonShadow);
        contentArea.add(sep);
        currentY += 12;

        // Lista de decisiones
        decisions.forEach(dec => {
          // Título del documento
          const docTitle = this.add.text(-225, currentY, `• ${dec.docTitle}`, {
            fontSize: '11px',
            color: '#000000',
            fontFamily: 'MS Sans Serif, Arial, sans-serif'
          }).setOrigin(0, 0.5);
          contentArea.add(docTitle);
          currentY += 15;

          // Decisión tomada (indentada)
          const decisionText = this.add.text(-215, currentY, `→ "${dec.chosenOption}"`, {
            fontSize: '10px',
            color: '#404040',
            fontStyle: 'italic',
            fontFamily: 'MS Sans Serif, Arial, sans-serif'
          }).setOrigin(0, 0.5);
          contentArea.add(decisionText);
          currentY += 14;

          // Consecuencias
          if (dec.consequences) {
            const conseqText = this.formatConsequences(dec.consequences);
            if (conseqText) {
              const consequences = this.add.text(160, currentY - 14, conseqText, {
                fontSize: '9px',
                color: '#808080',
                fontFamily: 'MS Sans Serif, Arial, sans-serif'
              }).setOrigin(0, 0.5);
              contentArea.add(consequences);
            }
          }

          currentY += 6;
        });

        currentY += 10;
      });
    }

    // Botón Cerrar
    const closeBtn = this.windowsUI.createButton(0, 200, 100, 26, 'Cerrar', false);
    this.windowsUI.addButtonEffects(closeBtn);
    closeBtn.on('pointerdown', () => {
      historyWindow.destroy();
    });
    contentArea.add(closeBtn);

    // Botón X
    const titleBar = historyWindow.getData('titleBar');
    if (titleBar && titleBar.closeBtn) {
      titleBar.closeBtn.setInteractive({ useHandCursor: true });
      titleBar.closeBtn.on('pointerdown', () => {
        historyWindow.destroy();
      });
    }
  }

  formatConsequences(consequences) {
    if (!consequences) return '';
    const parts = [];
    Object.entries(consequences).forEach(([key, val]) => {
      if (val === 0) return;
      const icons = {
        electricidad: '⚡',
        agua: '💧',
        legitimidad: '🤝',
        autonomia: '🏴'
      };
      const icon = icons[key] || '💰';
      const sign = val > 0 ? '+' : '';
      parts.push(`${sign}${val}${icon}`);
    });
    return parts.join(' ');
  }

  // ═══════════════════════════════════════════
  // TOOLTIPS
  // ═══════════════════════════════════════════

  createResourceTooltip(x, y, resource) {
    const container = this.add.container(x, y);
    container.setDepth(200);

    // Fondo con borde
    const bg = this.add.rectangle(0, 0, 200, 95, 0xffffcc);
    bg.setStrokeStyle(1, 0x000000);
    container.add(bg);

    // Título
    const title = this.add.text(0, -32, resource.name, {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    container.add(title);

    // Estado
    let status, statusColor;
    if (resource.value >= 50) {
      status = '🟢 Saludable';
      statusColor = '#008000';
    } else if (resource.value >= 20) {
      status = '🟡 Cuidado';
      statusColor = '#808000';
    } else {
      status = '🔴 Crítico';
      statusColor = '#800000';
    }

    const statusText = this.add.text(0, -12, status, {
      fontSize: '11px',
      color: statusColor,
      fontFamily: 'MS Sans Serif, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(statusText);

    // Descripción
    const descriptions = {
      electricidad: 'Energía para servicios\nbásicos de la red',
      agua: 'Agua potable para\nla comunidad',
      legitimidad: 'Confianza de\nlos vecinos',
      autonomia: 'Independencia de\nautoridades externas'
    };

    const desc = this.add.text(0, 20, descriptions[resource.key] || '', {
      fontSize: '10px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif',
      align: 'center',
      lineSpacing: 2
    }).setOrigin(0.5);
    container.add(desc);

    return container;
  }

  // ═══════════════════════════════════════════
  // NOTIFICACIONES
  // ═══════════════════════════════════════════

  showNotification(title, message, type = 'warning') {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const notifWindow = this.windowsUI.createWindow(
      width - 180,
      height - 140,
      320,
      160,
      title,
      false
    );
    notifWindow.setDepth(2000);

    const contentArea = notifWindow.getData('contentArea');

    // Icono según tipo
    const icons = {
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️',
      success: '✅'
    };

    const icon = this.add.text(0, -35, icons[type] || icons.warning, {
      fontSize: '32px'
    }).setOrigin(0.5);
    contentArea.add(icon);

    const msgText = this.add.text(0, 15, message, {
      fontSize: '12px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif',
      wordWrap: { width: 280 },
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);
    contentArea.add(msgText);

    // Auto-cerrar después de 3 segundos con fade
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: notifWindow,
        alpha: 0,
        duration: 500,
        onComplete: () => notifWindow.destroy()
      });
    });

    return notifWindow;
  }

  checkCriticalResources() {
    if (!this.notifiedCriticals) {
      this.notifiedCriticals = [];
    }

    const resources = gameState.getResourcesArray();
    resources.forEach(res => {
      if (res.value < 20 && !this.notifiedCriticals.includes(res.key)) {
        this.showNotification(
          '⚠️ Red de Aguante',
          `¡Alerta!\n\n${res.icon} ${res.name} bajó a ${res.value}%\n\nEstado crítico`,
          'warning'
        );
        this.notifiedCriticals.push(res.key);
      }

      // Reset notification if resource recovers
      if (res.value >= 30 && this.notifiedCriticals.includes(res.key)) {
        const index = this.notifiedCriticals.indexOf(res.key);
        this.notifiedCriticals.splice(index, 1);
      }
    });
  }

  // ═══════════════════════════════════════════
  // PAPELERA (EASTER EGG)
  // ═══════════════════════════════════════════

  openTrash() {
    this.trashClickCount = (this.trashClickCount || 0) + 1;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Overlay
    const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.4)
      .setDepth(100)
      .setInteractive();

    let message = '';
    let title = '🗑️ Papelera';

    if (this.trashClickCount >= 10) {
      message = '"¿Por qué seguís clickeando acá?"\n\n' +
        'La papelera sigue vacía.\n\n' +
        '(Igual que tus esperanzas de\nencontrar algo interesante)\n\n' +
        '🤷‍♂️';
      this.trashClickCount = 0;
    } else if (this.trashClickCount >= 5) {
      message = 'Sigue vacía.\n\n' +
        'En serio.\n\n' +
        'No hay nada acá.\n\n' +
        `(Intentos: ${this.trashClickCount}/10)`;
    } else {
      message = 'La papelera está vacía.';
    }

    const trashWindow = this.windowsUI.createWindow(
      width/2,
      height/2,
      320,
      220,
      title,
      false
    );
    trashWindow.setDepth(101);

    const contentArea = trashWindow.getData('contentArea');

    // Mensaje
    const msgText = this.add.text(0, -30, message, {
      fontSize: '12px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5);
    contentArea.add(msgText);

    // Botón OK
    const okBtn = this.windowsUI.createButton(0, 60, 80, 26, 'OK', true);
    this.windowsUI.addButtonEffects(okBtn);
    okBtn.on('pointerdown', () => {
      overlay.destroy();
      trashWindow.destroy();
    });
    contentArea.add(okBtn);

    // Botón X también cierra
    const titleBar = trashWindow.getData('titleBar');
    if (titleBar && titleBar.closeBtn) {
      titleBar.closeBtn.setInteractive({ useHandCursor: true });
      titleBar.closeBtn.on('pointerdown', () => {
        overlay.destroy();
        trashWindow.destroy();
      });
    }
  }

  // ═══════════════════════════════════════════
  // FIN DE DÍA
  // ═══════════════════════════════════════════

  showEndOfDay() {
    // Cerrar ventana de inbox si está abierta
    if (this.emailWindow) {
      this.emailWindow.destroy();
      this.emailWindow = null;
    }

    // Verificar si es el último día
    if (gameState.currentDay >= gameState.maxDays) {
      this.cameras.main.fadeOut(800);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('EndingScene');
      });
      return;
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Resumen del día con cambios
    const summaryWindow = this.windowsUI.createWindow(
      width/2,
      height/2,
      500,
      460,
      `📊 Resumen del Día - ${gameState.getDayName()}`,
      false
    );
    summaryWindow.setDepth(100);

    const contentArea = summaryWindow.getData('contentArea');
    let y = -190;

    // Decisiones tomadas
    const docsCompleted = gameState.documentsToday.length;
    const decisionsText = this.add.text(0, y, `DECISIONES TOMADAS: ${docsCompleted}`, {
      fontSize: '14px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    contentArea.add(decisionsText);
    y += 30;

    // Lista de documentos procesados
    const docsToShow = Math.min(3, gameState.documentsToday.length);
    for (let i = 0; i < docsToShow; i++) {
      const doc = gameState.documentsToday[i];
      const docText = this.add.text(0, y, `• ${doc.title}`, {
        fontSize: '11px',
        color: '#000000',
        fontFamily: 'MS Sans Serif, Arial, sans-serif'
      }).setOrigin(0.5);
      contentArea.add(docText);
      y += 18;
    }

    if (gameState.documentsToday.length > 3) {
      const moreText = this.add.text(0, y, `... y ${gameState.documentsToday.length - 3} más`, {
        fontSize: '11px',
        color: '#808080',
        fontFamily: 'MS Sans Serif, Arial, sans-serif',
        fontStyle: 'italic'
      }).setOrigin(0.5);
      contentArea.add(moreText);
      y += 18;
    }

    y += 15;

    // Separador
    const sep = this.add.rectangle(0, y, 450, 1, WIN95_COLORS.buttonShadow);
    contentArea.add(sep);
    y += 20;

    // Cambios en la red
    const changesTitle = this.add.text(0, y, 'CAMBIOS EN LA RED:', {
      fontSize: '14px',
      color: '#000000',
      fontFamily: 'MS Sans Serif, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    contentArea.add(changesTitle);
    y += 25;

    // Calcular y mostrar cambios
    const changes = this.calculateDayChanges();
    let hasChanges = false;

    Object.entries(changes).forEach(([key, change]) => {
      if (change === 0) return;
      hasChanges = true;

      const icons = {
        electricidad: '⚡',
        agua: '💧',
        legitimidad: '🤝',
        autonomia: '🏴'
      };
      const names = {
        electricidad: 'Electricidad',
        agua: 'Agua',
        legitimidad: 'Legitimidad',
        autonomia: 'Autonomía'
      };

      const icon = icons[key];
      const name = names[key];
      const sign = change > 0 ? '+' : '';
      const color = change > 0 ? '#008000' : '#800000';

      const changeText = this.add.text(0, y, `${icon} ${name}: ${sign}${change}`, {
        fontSize: '12px',
        color: color,
        fontFamily: 'MS Sans Serif, Arial, sans-serif'
      }).setOrigin(0.5);
      contentArea.add(changeText);
      y += 20;
    });

    if (!hasChanges) {
      const noChangeText = this.add.text(0, y, 'Sin cambios netos', {
        fontSize: '12px',
        color: '#808080',
        fontFamily: 'MS Sans Serif, Arial, sans-serif',
        fontStyle: 'italic'
      }).setOrigin(0.5);
      contentArea.add(noChangeText);
      y += 20;
    }

    y += 15;

    // Estado general
    const criticalCount = Object.values(gameState.resources).filter(v => v < 20).length;
    const healthyCount = Object.values(gameState.resources).filter(v => v >= 50).length;

    let statusText = 'ESTADO GENERAL: ';
    let statusColor = '#000000';
    let statusIcon = '';

    if (criticalCount > 0) {
      statusText += '🔴 Crítico';
      statusColor = '#800000';
      statusIcon = '⚠️';
    } else if (healthyCount === 4) {
      statusText += '🟢 Excelente';
      statusColor = '#008000';
      statusIcon = '✓';
    } else {
      statusText += '🟡 Estable';
      statusColor = '#808000';
      statusIcon = '~';
    }

    const statusDisplay = this.add.text(0, y, statusText, {
      fontSize: '13px',
      color: statusColor,
      fontFamily: 'MS Sans Serif, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    contentArea.add(statusDisplay);
    y += 30;

    // Botón continuar
    const isLastDay = gameState.currentDay >= gameState.maxDays - 1;
    const btnText = isLastDay ? `Continuar a ${gameState.dayNames[gameState.currentDay + 1]}` : `Continuar a ${gameState.dayNames[gameState.currentDay + 1]}`;

    const continueBtn = this.windowsUI.createButton(0, 170, 200, 32, btnText, true);
    this.windowsUI.addButtonEffects(continueBtn);
    continueBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(600);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.restart({ newDay: true });
      });
    });
    contentArea.add(continueBtn);
  }

  calculateDayChanges() {
    const changes = {};
    if (this.dayStartResources) {
      Object.keys(gameState.resources).forEach(key => {
        changes[key] = gameState.resources[key] - this.dayStartResources[key];
      });
    }
    return changes;
  }

  // ═══════════════════════════════════════════
  // CLEANUP / SHUTDOWN
  // ═══════════════════════════════════════════

  /**
   * CORREGIDO: Método shutdown para prevenir memory leaks
   * Se llama automáticamente cuando la escena se destruye o cambia
   */
  shutdown() {
    console.log('🧹 DeskScene shutdown - Cleaning up...');

    // 1. Desactivar auto-save
    if (gameState.saveManager) {
      gameState.saveManager.disableAutoSave();
    }

    // 2. Limpiar ventanas abiertas
    if (this.openWindows) {
      this.openWindows.clear();
    }

    // 3. Limpiar referencias a objetos grandes
    this.emailWindow = null;
    this.taskbarWindowButtons = [];
    this.desktopIcons = {};
    this.emailBadge = null;
    this.emailBadgeText = null;
    this.trayContent = null;
    this.emailListContainer = null;
    this.emailContentContainer = null;
    this.dayStartResources = null;
    this.previousResources = null;

    // 4. Limpiar notifiedCriticals para que se puedan volver a mostrar
    this.notifiedCriticals = [];

    // 5. Desregistrar eventos globales si hay
    // (Los eventos de Phaser se limpian automáticamente, pero por si hay custom)
    this.events.off('shutdown', this.shutdown, this);

    console.log('✅ DeskScene cleanup complete');
  }
}

if (typeof window !== 'undefined') {
  window.DeskScene = DeskScene;
}
