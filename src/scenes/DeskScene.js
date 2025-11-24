/**
 * DeskScene - Pantalla principal del escritorio (MEJORADA)
 * UI pulida con animaciones y feedback visual
 */

class DeskScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DeskScene' });

    // Colores del tema
    this.colors = {
      background: 0x1a1a2e,
      panel: 0x16213e,
      panelLight: 0x1f4068,
      accent: 0xffd700,
      accentHover: 0xffed4a,
      text: 0xffffff,
      textMuted: 0x888888,
      success: 0x4CAF50,
      warning: 0xFF9800,
      danger: 0xF44336,
      info: 0x2196F3
    };
  }

  init(data) {
    this.isNewDay = data?.newDay || false;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    gameState.currentScene = this;

    // Fondo con gradiente simulado
    this.createBackground(width, height);

    // Si es nuevo día, setup
    if (this.isNewDay || gameState.documentsToday.length === 0) {
      this.setupNewDay();
    }

    // UI Components
    this.createHeader();
    this.createResourceBar();
    this.createDocumentArea();
    this.createFooter();

    // Alertas de recursos críticos
    this.checkCriticalAlerts();

    // Mostrar documento actual
    this.showCurrentDocument();

    // Fade in
    this.cameras.main.fadeIn(500);
  }

  // ═══════════════════════════════════════════
  // FONDO MEJORADO
  // ═══════════════════════════════════════════

  createBackground(width, height) {
    // Fondo base
    this.add.rectangle(width/2, height/2, width, height, this.colors.background);

    // Patrón sutil (líneas)
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0xffffff, 0.03);

    for (let i = 0; i < width; i += 40) {
      graphics.moveTo(i, 0);
      graphics.lineTo(i, height);
    }
    for (let i = 0; i < height; i += 40) {
      graphics.moveTo(0, i);
      graphics.lineTo(width, i);
    }
    graphics.strokePath();
  }

  // ═══════════════════════════════════════════
  // HEADER MEJORADO
  // ═══════════════════════════════════════════

  createHeader() {
    const width = this.cameras.main.width;

    // Panel header
    this.add.rectangle(width/2, 35, width - 20, 60, this.colors.panel)
      .setStrokeStyle(1, this.colors.accent, 0.3);

    // Día con icono
    const dayName = gameState.getDayName();
    const dayIcon = this.getDayIcon(gameState.currentDay);

    this.dayText = this.add.text(30, 35, `${dayIcon} DÍA ${gameState.currentDay} - ${dayName.toUpperCase()}`, {
      fontSize: '20px',
      color: '#ffd700',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5);

    // Créditos con icono
    this.creditosText = this.add.text(width - 30, 35, `💰 ${gameState.creditos}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Courier New'
    }).setOrigin(1, 0.5);
  }

  getDayIcon(day) {
    const icons = ['📅', '📆', '🗓️', '📋', '📊', '🌅', '🌄'];
    return icons[day - 1] || '📅';
  }

  // ═══════════════════════════════════════════
  // BARRA DE RECURSOS MEJORADA
  // ═══════════════════════════════════════════

  createResourceBar() {
    const width = this.cameras.main.width;
    const y = 95;

    // Panel
    this.add.rectangle(width/2, y, width - 20, 50, this.colors.panel)
      .setStrokeStyle(1, this.colors.accent, 0.3);

    const resources = gameState.getResourcesArray();
    const spacing = (width - 80) / resources.length;

    this.resourceBars = {};
    this.resourceTexts = {};

    resources.forEach((res, index) => {
      const x = 60 + spacing * index;

      // Fondo de barra
      this.add.rectangle(x + 30, y, 80, 30, 0x333333, 0.5)
        .setOrigin(0, 0.5);

      // Barra de progreso
      const barWidth = (res.value / 100) * 76;
      const barColor = this.getResourceColor(res.value);

      const bar = this.add.rectangle(x + 32, y, barWidth, 26, barColor)
        .setOrigin(0, 0.5);

      this.resourceBars[res.key] = bar;

      // Icono
      this.add.text(x, y, res.icon, {
        fontSize: '20px'
      }).setOrigin(0.5);

      // Valor
      const text = this.add.text(x + 70, y, `${res.value}%`, {
        fontSize: '14px',
        color: res.value < 20 ? '#ff5555' : '#ffffff',
        fontStyle: res.value < 20 ? 'bold' : 'normal',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);

      this.resourceTexts[res.key] = text;
    });
  }

  getResourceColor(value) {
    if (value >= 50) return this.colors.success;
    if (value >= 20) return this.colors.warning;
    return this.colors.danger;
  }

  updateResourceBar() {
    const resources = gameState.getResourcesArray();

    resources.forEach(res => {
      // Actualizar barra
      if (this.resourceBars[res.key]) {
        const newWidth = (res.value / 100) * 76;
        const newColor = this.getResourceColor(res.value);

        // Animación de cambio
        this.tweens.add({
          targets: this.resourceBars[res.key],
          displayWidth: newWidth,
          duration: 300,
          ease: 'Power2'
        });

        this.resourceBars[res.key].setFillStyle(newColor);
      }

      // Actualizar texto
      if (this.resourceTexts[res.key]) {
        this.resourceTexts[res.key].setText(`${res.value}%`);
        this.resourceTexts[res.key].setColor(res.value < 20 ? '#ff5555' : '#ffffff');
        this.resourceTexts[res.key].setFontStyle(res.value < 20 ? 'bold' : 'normal');
      }
    });

    // Créditos
    if (this.creditosText) {
      this.creditosText.setText(`💰 ${gameState.creditos}`);
      this.creditosText.setColor(gameState.creditos < 0 ? '#ff5555' : '#ffffff');
    }

    // Verificar alertas
    this.checkCriticalAlerts();
  }

  // ═══════════════════════════════════════════
  // ALERTAS DE RECURSOS CRÍTICOS
  // ═══════════════════════════════════════════

  checkCriticalAlerts() {
    const criticals = gameState.getCriticalResources();

    if (criticals.length > 0 && !this.alertShown) {
      this.showCriticalAlert(criticals);
      this.alertShown = true;
    }
  }

  showCriticalAlert(criticals) {
    const width = this.cameras.main.width;

    const icons = criticals.map(c => c.icon).join(' ');
    const names = criticals.map(c => c.name).join(', ');

    // Banner de alerta
    const banner = this.add.rectangle(width/2, 140, width - 40, 35, this.colors.danger, 0.9)
      .setStrokeStyle(2, 0xff0000);

    const alertText = this.add.text(width/2, 140, `⚠️ ALERTA: ${icons} ${names} en estado crítico`, {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Parpadeo
    this.tweens.add({
      targets: [banner, alertText],
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.tweens.add({
          targets: [banner, alertText],
          alpha: 0,
          duration: 500,
          delay: 2000,
          onComplete: () => {
            banner.destroy();
            alertText.destroy();
          }
        });
      }
    });
  }

  // ═══════════════════════════════════════════
  // ÁREA DE DOCUMENTO MEJORADA
  // ═══════════════════════════════════════════

  createDocumentArea() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.documentContainer = this.add.container(width/2, height/2 + 20);
  }

  showCurrentDocument() {
    this.documentContainer.removeAll(true);
    this.alertShown = false;

    const doc = gameState.getCurrentDocument();

    if (!doc) {
      this.showEndOfDay();
      return;
    }

    this.renderDocument(doc);
    this.updateFooter();
  }

  renderDocument(doc) {
    const npc = gameState.getNPC(doc.sender);
    const panelWidth = 620;
    const panelHeight = 360;

    // Panel principal con sombra
    const shadow = this.add.rectangle(4, 4, panelWidth, panelHeight, 0x000000, 0.3);
    this.documentContainer.add(shadow);

    const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, this.colors.panel);
    panel.setStrokeStyle(2, this.colors.accent, 0.5);
    this.documentContainer.add(panel);

    // Header del documento con color por tipo
    const typeColors = {
      'solicitud': 0x2196F3,
      'propuesta': 0x4CAF50,
      'queja': 0xFF9800,
      'urgente': 0xF44336,
      'info': 0x9E9E9E
    };

    const headerColor = typeColors[doc.type] || 0x666666;
    const header = this.add.rectangle(0, -panelHeight/2 + 30, panelWidth - 4, 56, headerColor);
    this.documentContainer.add(header);

    // Icono de tipo
    const typeIcons = {
      'solicitud': '📝',
      'propuesta': '💡',
      'queja': '📢',
      'urgente': '🚨',
      'info': 'ℹ️'
    };

    const typeIcon = typeIcons[doc.type] || '📄';

    // Título
    const title = this.add.text(0, -panelHeight/2 + 30, `${typeIcon} ${doc.title.toUpperCase()}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
    this.documentContainer.add(title);

    // Remitente
    const senderText = this.add.text(-panelWidth/2 + 25, -panelHeight/2 + 70,
      `${npc?.emoji || '📄'} De: ${npc?.name || doc.sender} (${npc?.role || ''})`, {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'Courier New'
    });
    this.documentContainer.add(senderText);

    // Línea divisoria
    const divider = this.add.rectangle(0, -panelHeight/2 + 90, panelWidth - 60, 1, 0xffffff, 0.2);
    this.documentContainer.add(divider);

    // Contenido
    const content = this.add.text(0, -20, doc.content, {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: panelWidth - 80 },
      align: 'left',
      lineSpacing: 8,
      fontFamily: 'Courier New'
    }).setOrigin(0.5, 0.5);
    this.documentContainer.add(content);

    // Opciones
    this.createOptions(doc, panelWidth, panelHeight);
  }

  createOptions(doc, panelWidth, panelHeight) {
    const optionHeight = 45;
    const spacing = 55;
    const startY = panelHeight/2 - 30 - (doc.options.length - 1) * spacing / 2;

    doc.options.forEach((option, index) => {
      const y = startY + index * spacing - 60;

      // Botón con efecto
      const btn = this.add.rectangle(0, y, panelWidth - 60, optionHeight, this.colors.panelLight);
      btn.setStrokeStyle(1, this.colors.accent, 0.3);
      btn.setInteractive({ useHandCursor: true });
      this.documentContainer.add(btn);

      // Texto del botón
      const btnText = this.add.text(-panelWidth/2 + 50, y, option.text, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Courier New'
      }).setOrigin(0, 0.5);
      this.documentContainer.add(btnText);

      // Preview de consecuencias
      if (option.preview) {
        const preview = this.add.text(panelWidth/2 - 50, y, option.preview, {
          fontSize: '14px',
          color: '#aaaaaa',
          fontFamily: 'Courier New'
        }).setOrigin(1, 0.5);
        this.documentContainer.add(preview);
      }

      // Eventos hover
      btn.on('pointerover', () => {
        btn.setFillStyle(this.colors.accent, 0.3);
        btn.setStrokeStyle(2, this.colors.accent);
        btnText.setColor('#ffd700');
      });

      btn.on('pointerout', () => {
        btn.setFillStyle(this.colors.panelLight);
        btn.setStrokeStyle(1, this.colors.accent, 0.3);
        btnText.setColor('#ffffff');
      });

      btn.on('pointerdown', () => {
        this.selectOption(doc, index, option);
      });
    });
  }

  // ═══════════════════════════════════════════
  // FEEDBACK VISUAL AL DECIDIR
  // ═══════════════════════════════════════════

  selectOption(doc, index, option) {
    // Desactivar inputs
    this.input.enabled = false;

    // Flash de confirmación
    this.cameras.main.flash(100, 255, 215, 0, false);

    // Procesar decisión
    const result = gameState.documentManager.processDecision(doc, index);

    // Auto-save
    if (gameState.saveManager) {
      gameState.saveManager.save();
    }

    // Mostrar cambios en recursos con animación
    this.showResourceChanges(option.consequences);

    // Actualizar barra
    this.updateResourceBar();

    // Mostrar respuesta
    this.showResponse(result.response, () => {
      gameState.advanceToNextDocument();

      // Check game over
      if (gameState.isAnyZero()) {
        this.triggerGameOver();
        return;
      }

      this.input.enabled = true;
      this.showCurrentDocument();
    });
  }

  showResourceChanges(consequences) {
    if (!consequences) return;

    const width = this.cameras.main.width;
    let yOffset = 0;

    Object.entries(consequences).forEach(([key, value]) => {
      if (value === 0) return;

      const icon = gameState.resourceIcons[key] || '💰';
      const sign = value > 0 ? '+' : '';
      const color = value > 0 ? '#4CAF50' : '#F44336';

      const text = this.add.text(width/2, 160 + yOffset, `${icon} ${sign}${value}`, {
        fontSize: '24px',
        color: color,
        fontStyle: 'bold',
        fontFamily: 'Courier New'
      }).setOrigin(0.5).setAlpha(0);

      // Animación de aparición y desvanecimiento
      this.tweens.add({
        targets: text,
        alpha: 1,
        y: 140 + yOffset,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          this.tweens.add({
            targets: text,
            alpha: 0,
            y: 120 + yOffset,
            duration: 500,
            delay: 500,
            onComplete: () => text.destroy()
          });
        }
      });

      yOffset += 30;
    });
  }

  showResponse(responseText, callback) {
    if (!responseText) {
      callback();
      return;
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Overlay oscuro
    const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0)
      .setDepth(100)
      .setInteractive();

    // Panel de respuesta
    const panel = this.add.rectangle(width/2, height/2, 500, 150, this.colors.panel, 0)
      .setStrokeStyle(2, this.colors.accent)
      .setDepth(101);

    // Texto
    const response = this.add.text(width/2, height/2 - 10, responseText, {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 450 },
      align: 'center',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setDepth(102).setAlpha(0);

    const continueText = this.add.text(width/2, height/2 + 50, '▶ Click para continuar', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setDepth(102).setAlpha(0);

    // Animación de entrada
    this.tweens.add({
      targets: overlay,
      alpha: 0.8,
      duration: 200
    });

    this.tweens.add({
      targets: [panel, response, continueText],
      alpha: 1,
      duration: 300,
      delay: 100
    });

    // Click para cerrar
    overlay.once('pointerdown', () => {
      this.tweens.add({
        targets: [overlay, panel, response, continueText],
        alpha: 0,
        duration: 200,
        onComplete: () => {
          overlay.destroy();
          panel.destroy();
          response.destroy();
          continueText.destroy();
          callback();
        }
      });
    });
  }

  // ═══════════════════════════════════════════
  // FIN DEL DÍA MEJORADO
  // ═══════════════════════════════════════════

  showEndOfDay() {
    this.documentContainer.removeAll(true);

    const panelWidth = 500;
    const panelHeight = 320;

    // Panel con sombra
    const shadow = this.add.rectangle(4, 4, panelWidth, panelHeight, 0x000000, 0.3);
    this.documentContainer.add(shadow);

    const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, this.colors.panel);
    panel.setStrokeStyle(2, this.colors.accent);
    this.documentContainer.add(panel);

    // Icono grande
    const icon = this.add.text(0, -100, '🌙', {
      fontSize: '48px'
    }).setOrigin(0.5);
    this.documentContainer.add(icon);

    // Título
    const title = this.add.text(0, -50, 'FIN DEL DÍA', {
      fontSize: '28px',
      color: '#ffd700',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
    this.documentContainer.add(title);

    // Resumen
    const docsCompleted = gameState.documentsToday.length;
    const status = gameState.getResourceStatus();

    let statusText = '📊 Estado de la red: ';
    if (status.critical > 0) {
      statusText += '⚠️ Crítico';
    } else if (status.healthy === 4) {
      statusText += '✅ Excelente';
    } else {
      statusText += '➡️ Estable';
    }

    const summary = this.add.text(0, 20, `📄 Documentos procesados: ${docsCompleted}\n\n${statusText}`, {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8,
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
    this.documentContainer.add(summary);

    // Botón
    const isLastDay = gameState.isLastDay();
    const btnText = isLastDay ? '📊 Ver Resultado Final' : `▶ Avanzar a ${gameState.dayNames[gameState.currentDay]}`;

    const btn = this.add.rectangle(0, 100, 280, 50, this.colors.accent);
    btn.setInteractive({ useHandCursor: true });
    this.documentContainer.add(btn);

    const btnLabel = this.add.text(0, 100, btnText, {
      fontSize: '16px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
    this.documentContainer.add(btnLabel);

    btn.on('pointerover', () => btn.setFillStyle(this.colors.accentHover));
    btn.on('pointerout', () => btn.setFillStyle(this.colors.accent));

    btn.on('pointerdown', () => {
      if (isLastDay) {
        this.triggerEnding();
      } else {
        this.advanceToNextDay();
      }
    });
  }

  // ═══════════════════════════════════════════
  // TRANSICIONES MEJORADAS
  // ═══════════════════════════════════════════

  advanceToNextDay() {
    gameState.currentDay++;

    if (gameState.saveManager) {
      gameState.saveManager.save();
    }

    // Transición suave
    this.cameras.main.fadeOut(800, 0, 0, 0);

    // Mostrar texto de transición
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const dayText = this.add.text(width/2, height/2, gameState.getDayName().toUpperCase(), {
      fontSize: '48px',
      color: '#ffd700',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setAlpha(0).setDepth(200);

    this.tweens.add({
      targets: dayText,
      alpha: 1,
      duration: 400,
      yoyo: true,
      hold: 300
    });

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.restart({ newDay: true });
    });
  }

  triggerEnding() {
    this.cameras.main.fadeOut(1200, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('EndingScene');
    });
  }

  triggerGameOver() {
    let failedResource = '';
    Object.entries(gameState.resources).forEach(([key, value]) => {
      if (value <= 0) failedResource = key;
    });

    // Shake de cámara
    this.cameras.main.shake(500, 0.02);

    this.time.delayedCall(600, () => {
      this.cameras.main.fadeOut(1000, 50, 0, 0);

      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('EndingScene', {
          gameOver: true,
          failedResource: failedResource
        });
      });
    });
  }

  // ═══════════════════════════════════════════
  // FOOTER MEJORADO
  // ═══════════════════════════════════════════

  createFooter() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Panel
    this.add.rectangle(width/2, height - 30, width - 20, 50, this.colors.panel)
      .setStrokeStyle(1, this.colors.accent, 0.3);

    // Documentos restantes
    this.remainingText = this.add.text(30, height - 30, '', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5);

    // Día actual
    this.dayProgressText = this.add.text(width - 30, height - 30, '', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Courier New'
    }).setOrigin(1, 0.5);

    this.updateFooter();
  }

  updateFooter() {
    const remaining = gameState.getRemainingDocuments();

    if (remaining > 0) {
      this.remainingText.setText(`📬 ${remaining} documento${remaining > 1 ? 's' : ''} pendiente${remaining > 1 ? 's' : ''}`);
    } else {
      this.remainingText.setText('📭 Bandeja vacía');
    }

    this.dayProgressText.setText(`Semana: ${gameState.currentDay}/7`);
  }

  // ═══════════════════════════════════════════
  // SETUP
  // ═══════════════════════════════════════════

  setupNewDay() {
    if (gameState.currentDay > 1) {
      gameState.documentManager.applyDayDecay(gameState.currentDay);
    }

    gameState.documentsToday = gameState.documentManager.getDocumentsForDay(gameState.currentDay);
    gameState.currentDocumentIndex = 0;

    console.log(`📅 Day ${gameState.currentDay}: ${gameState.documentsToday.length} documents`);
  }
}

if (typeof window !== 'undefined') {
  window.DeskScene = DeskScene;
}
