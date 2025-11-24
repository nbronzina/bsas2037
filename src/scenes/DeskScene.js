/**
 * DeskScene - Estilo Macintosh clásico (System 6/7)
 * Interfaz tipo Mac de los 80s/90s
 */

class DeskScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DeskScene' });

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

  init(data) {
    this.isNewDay = data?.newDay || false;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    gameState.currentScene = this;

    // Fondo estilo escritorio Mac (gris con textura de puntos)
    this.createMacDesktop(width, height);

    if (this.isNewDay || gameState.documentsToday.length === 0) {
      this.setupNewDay();
    }

    // Barra de menú superior (estilo Mac)
    this.createMenuBar();

    // Ventana de documento (estilo Mac clásico)
    this.createDocumentArea();

    // Ventana de recursos (flotante, estilo Mac)
    this.createResourceWindow();

    this.showCurrentDocument();

    this.cameras.main.fadeIn(500);
  }

  // ═══════════════════════════════════════════
  // FONDO ESCRITORIO MAC
  // ═══════════════════════════════════════════

  createMacDesktop(width, height) {
    // Fondo gris claro
    this.add.rectangle(width/2, height/2, width, height, this.colors.desktopGray);

    // Patrón de puntos (estilo textura Mac)
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

  // ═══════════════════════════════════════════
  // BARRA DE MENÚ (estilo Mac)
  // ═══════════════════════════════════════════

  createMenuBar() {
    const width = this.cameras.main.width;

    // Fondo blanco de la barra
    this.add.rectangle(width/2, 10, width, 20, this.colors.white);
    this.add.rectangle(width/2, 20, width, 1, this.colors.black);

    // Manzanita 🍎 (icono de Apple)
    this.add.text(8, 10, '🍏', {
      fontSize: '14px'
    }).setOrigin(0, 0.5);

    // Nombre de la app
    this.add.text(30, 10, 'Red de Aguante', {
      fontSize: '12px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5);

    // Día actual (derecha)
    const dayName = gameState.getDayName();
    this.dayMenuText = this.add.text(width - 160, 10, `Día ${gameState.currentDay} - ${dayName}`, {
      fontSize: '11px',
      color: '#000000',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5);

    // Créditos (extremo derecha)
    this.creditosMenuText = this.add.text(width - 60, 10, `💰${gameState.creditos}`, {
      fontSize: '11px',
      color: '#000000',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5);
  }

  // ═══════════════════════════════════════════
  // VENTANA DE RECURSOS (flotante estilo Mac)
  // ═══════════════════════════════════════════

  createResourceWindow() {
    const x = 20;
    const y = 40;
    const windowWidth = 140;
    const windowHeight = 160;

    // Contenedor de la ventana
    this.resourceWindow = this.add.container(x, y);

    // Sombra de ventana
    const shadow = this.add.rectangle(3, 3, windowWidth, windowHeight, this.colors.shadow, 0.3);
    this.resourceWindow.add(shadow);

    // Fondo de ventana
    const bg = this.add.rectangle(0, 0, windowWidth, windowHeight, this.colors.lightGray);
    bg.setStrokeStyle(2, this.colors.black);
    this.resourceWindow.add(bg);

    // Barra de título rayada (patrón Mac clásico)
    const titleBar = this.add.rectangle(0, -windowHeight/2 + 8, windowWidth - 4, 16, this.colors.white);
    this.resourceWindow.add(titleBar);

    // Líneas horizontales de la barra (patrón Mac)
    const stripeGraphics = this.add.graphics();
    stripeGraphics.lineStyle(1, this.colors.black, 1);
    for (let i = 0; i < 8; i++) {
      const yPos = -windowHeight/2 + i * 2;
      stripeGraphics.moveTo(-windowWidth/2 + 2, yPos);
      stripeGraphics.lineTo(windowWidth/2 - 2, yPos);
    }
    stripeGraphics.strokePath();
    this.resourceWindow.add(stripeGraphics);

    // Texto de título
    const titleText = this.add.text(0, -windowHeight/2 + 8, 'Recursos', {
      fontSize: '11px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
    this.resourceWindow.add(titleText);

    // Botón de cerrar (cuadradito Mac)
    const closeBtn = this.add.rectangle(-windowWidth/2 + 8, -windowHeight/2 + 8, 10, 10, this.colors.white);
    closeBtn.setStrokeStyle(1, this.colors.black);
    this.resourceWindow.add(closeBtn);

    // Recursos
    this.resourceTexts = {};
    this.resourceBars = {};

    const resources = gameState.getResourcesArray();
    const startY = -windowHeight/2 + 35;

    resources.forEach((res, index) => {
      const yPos = startY + index * 28;

      // Label
      this.resourceWindow.add(
        this.add.text(-windowWidth/2 + 10, yPos - 8, `${res.icon} ${res.key}`, {
          fontSize: '10px',
          color: '#000000',
          fontFamily: 'Courier New'
        }).setOrigin(0)
      );

      // Barra de progreso (estilo Mac - rectángulo con borde)
      const barBg = this.add.rectangle(-windowWidth/2 + 10, yPos + 5, 110, 8, this.colors.white);
      barBg.setOrigin(0, 0.5);
      barBg.setStrokeStyle(1, this.colors.black);
      this.resourceWindow.add(barBg);

      // Relleno de barra (negro sólido estilo Mac)
      const barWidth = (res.value / 100) * 108;
      const bar = this.add.rectangle(-windowWidth/2 + 11, yPos + 5, barWidth, 6, this.colors.black);
      bar.setOrigin(0, 0.5);
      this.resourceWindow.add(bar);
      this.resourceBars[res.key] = bar;

      // Valor en texto
      const valueText = this.add.text(windowWidth/2 - 10, yPos + 5, `${res.value}%`, {
        fontSize: '9px',
        color: '#000000',
        fontFamily: 'Courier New'
      }).setOrigin(1, 0.5);
      this.resourceWindow.add(valueText);
      this.resourceTexts[res.key] = valueText;
    });

    this.resourceWindow.setDepth(10);
  }

  updateResourceWindow() {
    const resources = gameState.getResourcesArray();

    resources.forEach(res => {
      // Actualizar barra
      if (this.resourceBars[res.key]) {
        const newWidth = (res.value / 100) * 108;
        this.tweens.add({
          targets: this.resourceBars[res.key],
          displayWidth: newWidth,
          duration: 300,
          ease: 'Linear'
        });
      }

      // Actualizar texto
      if (this.resourceTexts[res.key]) {
        this.resourceTexts[res.key].setText(`${res.value}%`);
      }
    });

    // Actualizar créditos en menú
    if (this.creditosMenuText) {
      this.creditosMenuText.setText(`💰${gameState.creditos}`);
    }

    this.checkCriticalAlerts();
  }

  // ═══════════════════════════════════════════
  // ALERTAS (estilo notificación Mac System 7)
  // ═══════════════════════════════════════════

  checkCriticalAlerts() {
    const criticals = gameState.getCriticalResources();

    if (criticals.length > 0 && !this.alertShown) {
      this.showMacAlert(criticals);
      this.alertShown = true;
    }
  }

  showMacAlert(criticals) {
    const width = this.cameras.main.width;
    const alertWidth = 250;
    const alertHeight = 80;

    const x = width - alertWidth/2 - 20;
    const y = 60;

    const alert = this.add.container(x, y).setDepth(100);

    // Sombra
    const shadow = this.add.rectangle(3, 3, alertWidth, alertHeight, this.colors.shadow, 0.4);
    alert.add(shadow);

    // Fondo blanco
    const bg = this.add.rectangle(0, 0, alertWidth, alertHeight, this.colors.white);
    bg.setStrokeStyle(3, this.colors.black);
    alert.add(bg);

    // Icono de alerta (⚠️)
    alert.add(this.add.text(-alertWidth/2 + 15, 0, '⚠️', {
      fontSize: '28px'
    }).setOrigin(0, 0.5));

    // Texto
    const names = criticals.map(c => c.name).join(', ');
    alert.add(this.add.text(-alertWidth/2 + 50, -10, 'ALERTA:', {
      fontSize: '12px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5));

    alert.add(this.add.text(-alertWidth/2 + 50, 10, names + '\nen crítico', {
      fontSize: '10px',
      color: '#000000',
      fontFamily: 'Courier New',
      lineSpacing: 2
    }).setOrigin(0, 0.5));

    // Desaparecer después de 3s
    this.tweens.add({
      targets: alert,
      alpha: 0,
      duration: 500,
      delay: 3000,
      onComplete: () => alert.destroy()
    });
  }

  // ═══════════════════════════════════════════
  // VENTANA DE DOCUMENTO (estilo Mac clásico)
  // ═══════════════════════════════════════════

  createDocumentArea() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.documentContainer = this.add.container(width/2 + 50, height/2 + 10);
  }

  showCurrentDocument() {
    this.documentContainer.removeAll(true);
    this.alertShown = false;

    const doc = gameState.getCurrentDocument();

    if (!doc) {
      this.showEndOfDay();
      return;
    }

    this.renderMacDocument(doc);
  }

  renderMacDocument(doc) {
    const npc = gameState.getNPC(doc.sender);
    const windowWidth = 480;
    const windowHeight = 420;

    // Sombra de ventana
    const shadow = this.add.rectangle(4, 4, windowWidth, windowHeight, this.colors.shadow, 0.4);
    this.documentContainer.add(shadow);

    // Fondo de ventana (blanco)
    const bg = this.add.rectangle(0, 0, windowWidth, windowHeight, this.colors.white);
    bg.setStrokeStyle(3, this.colors.black);
    this.documentContainer.add(bg);

    // Barra de título rayada
    const titleBarHeight = 18;
    const titleBar = this.add.rectangle(0, -windowHeight/2 + titleBarHeight/2, windowWidth - 6, titleBarHeight, this.colors.white);
    this.documentContainer.add(titleBar);

    // Líneas de la barra de título
    const stripes = this.add.graphics();
    stripes.lineStyle(1, this.colors.black, 0.3);
    for (let i = 0; i < 9; i++) {
      const yPos = -windowHeight/2 + i * 2;
      stripes.moveTo(-windowWidth/2 + 3, yPos);
      stripes.lineTo(windowWidth/2 - 3, yPos);
    }
    stripes.strokePath();
    this.documentContainer.add(stripes);

    // Título de ventana
    const docTitle = `${npc?.emoji || '📄'} ${doc.title} - ${npc?.name || doc.sender}`;
    this.documentContainer.add(this.add.text(0, -windowHeight/2 + titleBarHeight/2, docTitle, {
      fontSize: '11px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5));

    // Botón cerrar
    const closeBox = this.add.rectangle(-windowWidth/2 + 10, -windowHeight/2 + titleBarHeight/2, 12, 12, this.colors.white);
    closeBox.setStrokeStyle(1, this.colors.black);
    this.documentContainer.add(closeBox);

    // Tipo de documento (badge en esquina)
    const typeIcons = {
      'solicitud': '📝',
      'propuesta': '💡',
      'queja': '📢',
      'urgente': '🚨',
      'info': 'ℹ️'
    };
    const typeIcon = typeIcons[doc.type] || '📄';
    this.documentContainer.add(this.add.text(windowWidth/2 - 25, -windowHeight/2 + titleBarHeight/2, typeIcon, {
      fontSize: '14px'
    }).setOrigin(0.5));

    // Línea separadora bajo título
    this.documentContainer.add(
      this.add.rectangle(0, -windowHeight/2 + titleBarHeight + 1, windowWidth - 6, 1, this.colors.black)
    );

    // Contenido del documento (área de scroll simulada)
    const contentY = -windowHeight/2 + 50;
    const content = this.add.text(0, contentY, doc.content, {
      fontSize: '13px',
      color: '#000000',
      wordWrap: { width: windowWidth - 50 },
      align: 'left',
      lineSpacing: 6,
      fontFamily: 'Courier New'
    }).setOrigin(0.5, 0);
    this.documentContainer.add(content);

    // Opciones como botones Mac
    this.createMacButtons(doc, windowWidth, windowHeight);
  }

  createMacButtons(doc, windowWidth, windowHeight) {
    const buttonHeight = 30;
    const spacing = 10;
    const startY = windowHeight/2 - 40 - (doc.options.length * (buttonHeight + spacing));

    doc.options.forEach((option, index) => {
      const yPos = startY + index * (buttonHeight + spacing);

      // Botón estilo Mac (3D simple)
      const btnWidth = windowWidth - 80;

      // Sombra del botón (abajo y derecha)
      const btnShadow = this.add.rectangle(2, yPos + 2, btnWidth, buttonHeight, this.colors.darkGray);
      this.documentContainer.add(btnShadow);

      // Botón principal
      const btn = this.add.rectangle(0, yPos, btnWidth, buttonHeight, this.colors.lightGray);
      btn.setStrokeStyle(2, this.colors.black);
      btn.setInteractive({ useHandCursor: true });
      this.documentContainer.add(btn);

      // Highlight superior (efecto 3D)
      const highlight = this.add.rectangle(0, yPos - buttonHeight/2 + 2, btnWidth - 4, 3, this.colors.white, 0.8);
      this.documentContainer.add(highlight);

      // Texto del botón
      const btnText = this.add.text(0, yPos, option.text, {
        fontSize: '12px',
        color: '#000000',
        fontStyle: 'bold',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);
      this.documentContainer.add(btnText);

      // Preview (más pequeño, abajo del texto)
      if (option.preview) {
        const preview = this.add.text(0, yPos + 10, option.preview, {
          fontSize: '9px',
          color: '#555555',
          fontFamily: 'Courier New'
        }).setOrigin(0.5, 0);
        this.documentContainer.add(preview);
      }

      // Eventos
      btn.on('pointerover', () => {
        btn.setFillStyle(this.colors.mediumGray);
      });

      btn.on('pointerout', () => {
        btn.setFillStyle(this.colors.lightGray);
      });

      btn.on('pointerdown', () => {
        // Efecto "presionado"
        btn.setFillStyle(this.colors.darkGray);
        btnText.setColor('#ffffff');
        this.time.delayedCall(100, () => {
          this.selectOption(doc, index, option);
        });
      });
    });
  }

  // ═══════════════════════════════════════════
  // FEEDBACK VISUAL (esquina superior derecha)
  // ═══════════════════════════════════════════

  selectOption(doc, index, option) {
    // Deshabilitar botones
    this.documentContainer.each(child => {
      if (child.input) {
        child.disableInteractive();
      }
    });

    // Procesar
    const result = gameState.documentManager.processDecision(doc, index);

    if (gameState.saveManager) {
      gameState.saveManager.save();
    }

    // Feedback en esquina superior derecha
    this.showMacFeedback(option.consequences);

    this.updateResourceWindow();

    // Respuesta en dialog Mac
    this.showMacDialog(result.response, () => {
      gameState.advanceToNextDocument();

      if (gameState.isAnyZero()) {
        this.triggerGameOver();
        return;
      }

      this.showCurrentDocument();
    });
  }

  showMacFeedback(consequences) {
    if (!consequences) return;

    const width = this.cameras.main.width;
    const startX = width - 100;
    let yOffset = 0;

    Object.entries(consequences).forEach(([key, value]) => {
      if (value === 0) return;

      const icon = gameState.resourceIcons[key] || '💰';
      const sign = value > 0 ? '+' : '';
      const textColor = value > 0 ? '#000000' : '#000000';

      // Pequeño cuadro blanco con borde
      const boxWidth = 70;
      const boxHeight = 20;
      const yPos = 30 + yOffset;

      const box = this.add.container(startX, yPos).setDepth(90);

      // Fondo
      const bg = this.add.rectangle(0, 0, boxWidth, boxHeight, this.colors.white);
      bg.setStrokeStyle(1, this.colors.black);
      box.add(bg);

      // Texto
      const text = this.add.text(0, 0, `${icon} ${sign}${value}`, {
        fontSize: '11px',
        color: textColor,
        fontStyle: 'bold',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);
      box.add(text);

      // Animación: baja y desaparece
      box.setAlpha(0);
      this.tweens.add({
        targets: box,
        alpha: 1,
        y: yPos + 10,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          this.tweens.add({
            targets: box,
            alpha: 0,
            duration: 300,
            delay: 1500,
            onComplete: () => box.destroy()
          });
        }
      });

      yOffset += 25;
    });
  }

  showMacDialog(responseText, callback) {
    if (!responseText) {
      callback();
      return;
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const dialogWidth = 400;
    const dialogHeight = 140;

    const dialog = this.add.container(width/2, height/2).setDepth(200);

    // Sombra
    const shadow = this.add.rectangle(4, 4, dialogWidth, dialogHeight, this.colors.shadow, 0.5);
    dialog.add(shadow);

    // Fondo blanco
    const bg = this.add.rectangle(0, 0, dialogWidth, dialogHeight, this.colors.white);
    bg.setStrokeStyle(4, this.colors.black);
    dialog.add(bg);

    // Icono
    dialog.add(this.add.text(-dialogWidth/2 + 30, -20, '💬', {
      fontSize: '32px'
    }).setOrigin(0.5));

    // Texto
    const text = this.add.text(-dialogWidth/2 + 60, -20, responseText, {
      fontSize: '12px',
      color: '#000000',
      wordWrap: { width: dialogWidth - 90 },
      align: 'left',
      lineSpacing: 4,
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5);
    dialog.add(text);

    // Botón OK (estilo Mac)
    const btnOK = this.add.rectangle(0, dialogHeight/2 - 25, 80, 28, this.colors.lightGray);
    btnOK.setStrokeStyle(2, this.colors.black);
    btnOK.setInteractive({ useHandCursor: true });
    dialog.add(btnOK);

    const btnText = this.add.text(0, dialogHeight/2 - 25, 'OK', {
      fontSize: '12px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
    dialog.add(btnText);

    btnOK.on('pointerover', () => btnOK.setFillStyle(this.colors.mediumGray));
    btnOK.on('pointerout', () => btnOK.setFillStyle(this.colors.lightGray));
    btnOK.on('pointerdown', () => {
      btnOK.setFillStyle(this.colors.darkGray);
      btnText.setColor('#ffffff');
      this.time.delayedCall(100, () => {
        dialog.destroy();
        callback();
      });
    });

    // Fade in
    dialog.setAlpha(0);
    this.tweens.add({
      targets: dialog,
      alpha: 1,
      duration: 200
    });
  }

  // ═══════════════════════════════════════════
  // FIN DEL DÍA (Dialog Mac)
  // ═══════════════════════════════════════════

  showEndOfDay() {
    this.documentContainer.removeAll(true);

    const windowWidth = 380;
    const windowHeight = 240;

    // Sombra
    const shadow = this.add.rectangle(4, 4, windowWidth, windowHeight, this.colors.shadow, 0.4);
    this.documentContainer.add(shadow);

    // Ventana blanca
    const bg = this.add.rectangle(0, 0, windowWidth, windowHeight, this.colors.white);
    bg.setStrokeStyle(3, this.colors.black);
    this.documentContainer.add(bg);

    // Barra de título
    const titleBar = this.add.rectangle(0, -windowHeight/2 + 9, windowWidth - 6, 18, this.colors.white);
    this.documentContainer.add(titleBar);

    const stripes = this.add.graphics();
    stripes.lineStyle(1, this.colors.black, 0.3);
    for (let i = 0; i < 9; i++) {
      const yPos = -windowHeight/2 + i * 2;
      stripes.moveTo(-windowWidth/2 + 3, yPos);
      stripes.lineTo(windowWidth/2 - 3, yPos);
    }
    stripes.strokePath();
    this.documentContainer.add(stripes);

    this.documentContainer.add(this.add.text(0, -windowHeight/2 + 9, 'Fin del Día', {
      fontSize: '11px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5));

    // Icono
    this.documentContainer.add(this.add.text(0, -50, '🌙', {
      fontSize: '48px'
    }).setOrigin(0.5));

    // Resumen
    const docsCompleted = gameState.documentsToday.length;
    const status = gameState.getResourceStatus();

    let statusText = status.critical > 0 ? '⚠️ Estado crítico' :
                     status.healthy === 4 ? '✅ Excelente' : '➡️ Estable';

    this.documentContainer.add(this.add.text(0, 20, `Documentos procesados: ${docsCompleted}\n\n${statusText}`, {
      fontSize: '12px',
      color: '#000000',
      align: 'center',
      lineSpacing: 4,
      fontFamily: 'Courier New'
    }).setOrigin(0.5));

    // Botón
    const isLastDay = gameState.isLastDay();
    const btnText = isLastDay ? 'Ver Resultado' : 'Continuar';

    const btn = this.add.rectangle(0, windowHeight/2 - 30, 120, 30, this.colors.lightGray);
    btn.setStrokeStyle(2, this.colors.black);
    btn.setInteractive({ useHandCursor: true });
    this.documentContainer.add(btn);

    const label = this.add.text(0, windowHeight/2 - 30, btnText, {
      fontSize: '12px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
    this.documentContainer.add(label);

    btn.on('pointerover', () => btn.setFillStyle(this.colors.mediumGray));
    btn.on('pointerout', () => btn.setFillStyle(this.colors.lightGray));
    btn.on('pointerdown', () => {
      if (isLastDay) {
        this.triggerEnding();
      } else {
        this.advanceToNextDay();
      }
    });
  }

  advanceToNextDay() {
    gameState.currentDay++;

    if (gameState.saveManager) {
      gameState.saveManager.save();
    }

    this.cameras.main.fadeOut(600, 153, 153, 153);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.restart({ newDay: true });
    });
  }

  triggerEnding() {
    this.cameras.main.fadeOut(800, 153, 153, 153);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('EndingScene');
    });
  }

  triggerGameOver() {
    let failedResource = '';
    Object.entries(gameState.resources).forEach(([key, value]) => {
      if (value <= 0) failedResource = key;
    });

    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('EndingScene', {
        gameOver: true,
        failedResource: failedResource
      });
    });
  }

  setupNewDay() {
    if (gameState.currentDay > 1) {
      gameState.documentManager.applyDayDecay(gameState.currentDay);
    }

    gameState.documentsToday = gameState.documentManager.getDocumentsForDay(gameState.currentDay);
    gameState.currentDocumentIndex = 0;
  }
}

if (typeof window !== 'undefined') {
  window.DeskScene = DeskScene;
}
