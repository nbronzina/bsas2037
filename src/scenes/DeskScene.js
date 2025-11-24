/**
 * DeskScene - Estilo Windows 95 / Mac OS System 7
 * Interfaz retro de escritorio con documentos
 */

class DeskScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DeskScene' });

    // Paleta Windows 95 / Mac OS clásica
    this.colors = {
      black: 0x000000,
      white: 0xFFFFFF,
      windowGray: 0xC0C0C0,      // Gris claro ventanas
      darkGray: 0x808080,         // Gris oscuro bordes
      veryDarkGray: 0x404040,     // Muy oscuro para sombras
      desktopTeal: 0x008080,      // Verde azulado escritorio (Windows 95)
      titleBarBlue: 0x000080      // Azul barra de título activa
    };
  }

  init(data) {
    this.isNewDay = data?.newDay || false;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    gameState.currentScene = this;

    // Iniciar música de gestión/escritorio
    if (gameState.audioManager && gameState.audioManager.currentMusic !== 'management') {
      gameState.audioManager.playManagementTheme();
    }

    // Fondo estilo escritorio retro
    this.createRetroDesktop(width, height);

    if (this.isNewDay || gameState.documentsToday.length === 0) {
      this.setupNewDay();
    }

    // Barra superior con info del juego
    this.createTopBar(width);

    // Barra de recursos horizontal
    this.createResourceBar(width);

    // Ventana de documento central
    this.createDocumentArea(width, height);

    this.showCurrentDocument();

    this.cameras.main.fadeIn(500);
  }

  // ═══════════════════════════════════════════
  // SETUP
  // ═══════════════════════════════════════════

  setupNewDay() {
    console.log('🌅 setupNewDay called');

    // Avanzar al siguiente día
    // El primer día no incrementar (ya está en 1)
    if (gameState.documentsToday.length > 0) {
      gameState.currentDay++;
      console.log('  Day incremented to:', gameState.currentDay);
    }

    // Obtener documentos para el día actual
    if (gameState.documentManager) {
      gameState.documentsToday = gameState.documentManager.getDocumentsForDay(gameState.currentDay);
      gameState.currentDocumentIndex = 0;

      console.log(`📅 Day ${gameState.currentDay}: ${gameState.documentsToday.length} documents`);
      gameState.documentsToday.forEach((doc, i) => {
        console.log(`  ${i}: ${doc.id} - ${doc.title}`);
      });
    } else {
      console.error('DocumentManager not initialized!');
    }
  }

  // ═══════════════════════════════════════════
  // FONDO ESCRITORIO
  // ═══════════════════════════════════════════

  createRetroDesktop(width, height) {
    // Fondo teal/verde azulado (Windows 95 style)
    this.add.rectangle(width/2, height/2, width, height, this.colors.desktopTeal);

    // Patrón opcional de puntos sutil
    const graphics = this.add.graphics();
    graphics.fillStyle(this.colors.darkGray, 0.1);
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        if ((x + y) % 8 === 0) {
          graphics.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  // ═══════════════════════════════════════════
  // BARRA SUPERIOR (info del juego)
  // ═══════════════════════════════════════════

  createTopBar(width) {
    const barHeight = 24;

    // Fondo de barra
    this.add.rectangle(width/2, barHeight/2, width, barHeight, this.colors.windowGray);

    // Borde inferior
    this.add.rectangle(width/2, barHeight, width, 2, this.colors.darkGray);

    // Nombre del juego (izquierda)
    this.add.text(10, barHeight/2, 'Red de Aguante', {
      fontSize: '14px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0, 0.5);

    // Día actual (centro-derecha)
    const dayName = gameState.getDayName();
    this.dayText = this.add.text(width - 200, barHeight/2, `Día ${gameState.currentDay} - ${dayName}`, {
      fontSize: '12px',
      color: '#000000',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0, 0.5);

    // Créditos (extremo derecha)
    this.creditosText = this.add.text(width - 80, barHeight/2, `💰 ${gameState.creditos}`, {
      fontSize: '12px',
      color: '#000000',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0, 0.5);
  }

  // ═══════════════════════════════════════════
  // BARRA DE RECURSOS HORIZONTAL
  // ═══════════════════════════════════════════

  createResourceBar(width) {
    const barY = 50;
    const barHeight = 60;
    const padding = 20;

    // Contenedor de recursos
    this.resourceContainer = this.add.container(width/2, barY);

    // Fondo con bordes biselados
    const barWidth = width - padding * 2;
    const bg = this.createBeveledPanel(0, 0, barWidth, barHeight);
    this.resourceContainer.add(bg);

    // Recursos en línea horizontal
    const resources = gameState.getResourcesArray();
    const spacing = (barWidth - 40) / resources.length;
    const startX = -barWidth/2 + 20;

    this.resourceTexts = {};
    this.resourceBars = {};

    resources.forEach((res, index) => {
      const x = startX + spacing * index + spacing/2;
      const barWidth = spacing - 20;

      // Icono + nombre
      const label = this.add.text(x, -15, `${res.icon} ${res.key}`, {
        fontSize: '10px',
        color: '#000000',
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0.5, 0.5);
      this.resourceContainer.add(label);

      // Barra de progreso
      const barBg = this.add.rectangle(x, 5, barWidth, 12, 0xFFFFFF);
      barBg.setStrokeStyle(1, this.colors.black);
      this.resourceContainer.add(barBg);

      // Relleno de barra
      const fillWidth = (res.value / 100) * (barWidth - 2);
      const barFill = this.add.rectangle(x - barWidth/2 + 1, 5, fillWidth, 10, this.colors.titleBarBlue);
      barFill.setOrigin(0, 0.5);
      this.resourceContainer.add(barFill);
      this.resourceBars[res.key] = { bar: barFill, maxWidth: barWidth - 2, x: x - barWidth/2 + 1 };

      // Valor en porcentaje
      const valueText = this.add.text(x, 18, `${res.value}%`, {
        fontSize: '9px',
        color: '#000000',
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0.5, 0.5);
      this.resourceContainer.add(valueText);
      this.resourceTexts[res.key] = valueText;
    });

    this.resourceContainer.setDepth(5);
  }

  updateResourceBar() {
    const resources = gameState.getResourcesArray();

    resources.forEach(res => {
      // Actualizar barra
      if (this.resourceBars[res.key]) {
        const { bar, maxWidth, x } = this.resourceBars[res.key];
        const newWidth = (res.value / 100) * maxWidth;

        this.tweens.add({
          targets: bar,
          width: newWidth,
          duration: 400,
          ease: 'Power2'
        });
      }

      // Actualizar texto
      if (this.resourceTexts[res.key]) {
        this.resourceTexts[res.key].setText(`${res.value}%`);
      }
    });

    // Actualizar créditos
    if (this.creditosText) {
      this.creditosText.setText(`💰 ${gameState.creditos}`);
    }

    this.checkCriticalAlerts();
  }

  // ═══════════════════════════════════════════
  // ALERTAS (esquina superior derecha)
  // ═══════════════════════════════════════════

  checkCriticalAlerts() {
    const criticals = gameState.getCriticalResources();

    if (criticals.length > 0 && !this.alertShown) {
      this.showAlert(criticals);
      this.alertShown = true;
    }
  }

  showAlert(criticals) {
    const width = this.cameras.main.width;
    const alertWidth = 250;
    const alertHeight = 80;

    // Sonido de alerta
    if (gameState.audioManager) {
      gameState.audioManager.playAlertSound();
    }

    const x = width - alertWidth/2 - 20;
    const y = 140;

    const alert = this.add.container(x, y).setDepth(30);

    // Panel biselado
    const panel = this.createBeveledPanel(0, 0, alertWidth, alertHeight);
    alert.add(panel);

    // Icono de alerta
    alert.add(this.add.text(-alertWidth/2 + 15, 0, '⚠️', {
      fontSize: '28px'
    }).setOrigin(0, 0.5));

    // Texto
    const names = criticals.map(c => c.name).join(', ');
    alert.add(this.add.text(-alertWidth/2 + 50, -10, 'ALERTA:', {
      fontSize: '12px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0, 0.5));

    alert.add(this.add.text(-alertWidth/2 + 50, 10, `${names}\nEn estado crítico!`, {
      fontSize: '11px',
      color: '#000000',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 3
    }).setOrigin(0, 0.5));

    // Botón OK
    const okBtn = this.createButton(-alertWidth/2 + alertWidth - 50, alertHeight/2 - 20, 40, 22, 'OK');
    alert.add(okBtn);
    okBtn.setInteractive({ useHandCursor: true });
    okBtn.on('pointerdown', () => {
      alert.destroy();
    });

    // Auto-cerrar después de 5 segundos
    this.time.delayedCall(5000, () => {
      if (alert.active) {
        alert.destroy();
      }
    });
  }

  // ═══════════════════════════════════════════
  // VENTANA DE DOCUMENTO
  // ═══════════════════════════════════════════

  createDocumentArea(width, height) {
    this.documentContainer = this.add.container(width/2, height/2 + 20);
    this.documentContainer.setDepth(10);
  }

  showCurrentDocument() {
    console.log('📋 showCurrentDocument called');
    console.log('  Current index:', gameState.currentDocumentIndex);
    console.log('  Total docs:', gameState.documentsToday.length);

    this.documentContainer.removeAll(true);
    this.alertShown = false;

    const doc = gameState.getCurrentDocument();
    console.log('  Document:', doc ? doc.id : 'null');

    if (!doc) {
      console.log('📅 No more documents, showing end of day');
      this.showEndOfDay();
      return;
    }

    console.log('📄 Rendering document:', doc.id);
    this.renderDocument(doc);
  }

  renderDocument(doc) {
    const npc = gameState.getNPC(doc.sender);
    const windowWidth = 500;
    const windowHeight = 440;

    // Panel biselado de ventana
    const panel = this.createBeveledPanel(0, 0, windowWidth, windowHeight);
    this.documentContainer.add(panel);

    // Barra de título (azul oscuro con texto blanco)
    const titleBar = this.add.rectangle(0, -windowHeight/2 + 12, windowWidth - 6, 20, this.colors.titleBarBlue);
    this.documentContainer.add(titleBar);

    // Título centrado (emoji + título + nombre)
    const typeIcons = {
      'solicitud': '📝',
      'propuesta': '💡',
      'queja': '📢',
      'urgente': '🚨',
      'info': 'ℹ️'
    };
    const typeIcon = typeIcons[doc.type] || '📄';
    const title = `${typeIcon} ${doc.title} - ${npc?.name || doc.sender}`;

    this.documentContainer.add(this.add.text(0, -windowHeight/2 + 12, title, {
      fontSize: '12px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5));

    // Línea separadora
    this.documentContainer.add(
      this.add.rectangle(0, -windowHeight/2 + 23, windowWidth - 6, 1, this.colors.darkGray)
    );

    // Contenido del documento
    const contentY = -windowHeight/2 + 50;
    const content = this.add.text(0, contentY, doc.content, {
      fontSize: '13px',
      color: '#000000',
      wordWrap: { width: windowWidth - 60 },
      align: 'left',
      lineSpacing: 6,
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5, 0);
    this.documentContainer.add(content);

    // Botones de opciones
    this.createOptionButtons(doc, windowWidth, windowHeight);
  }

  createOptionButtons(doc, windowWidth, windowHeight) {
    const buttonHeight = 32;
    const spacing = 10;
    const startY = windowHeight/2 - 50 - (doc.options.length * (buttonHeight + spacing));

    doc.options.forEach((option, index) => {
      const yPos = startY + index * (buttonHeight + spacing);

      // Botón principal (SIN EMOJIS)
      const btnWidth = windowWidth - 100;
      const btn = this.createButton(0, yPos, btnWidth, buttonHeight, option.text);
      this.documentContainer.add(btn);

      btn.setInteractive({ useHandCursor: true });

      // Preview de consecuencias (CON emojis)
      if (option.preview) {
        const preview = this.add.text(0, yPos + buttonHeight/2 + 5, option.preview, {
          fontSize: '9px',
          color: '#666666',
          fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5, 0);
        this.documentContainer.add(preview);
      }

      // Eventos
      btn.on('pointerover', () => {
        btn.list[0].setFillStyle(0xE0E0E0); // Highlight
      });

      btn.on('pointerout', () => {
        btn.list[0].setFillStyle(this.colors.windowGray);
      });

      btn.on('pointerdown', () => {
        // Sonido de confirmación
        if (gameState.audioManager) {
          gameState.audioManager.playConfirmSound();
        }

        // Efecto presionado
        btn.list[0].setFillStyle(this.colors.darkGray);
        btn.list[1].setColor('#FFFFFF');

        this.time.delayedCall(100, () => {
          this.selectOption(doc, index, option);
        });
      });
    });
  }

  selectOption(doc, index, option) {
    console.log('🔵 selectOption called:', doc.id, 'option:', index);

    // Deshabilitar todos los botones
    this.documentContainer.each(child => {
      if (child.input) {
        child.disableInteractive();
      }
    });

    // Procesar opción usando DocumentManager
    const result = gameState.documentManager.processDecision(doc, index);
    console.log('📊 processDecision result:', result);

    gameState.currentDocumentIndex++;
    console.log('📈 Index incremented to:', gameState.currentDocumentIndex);
    console.log('📄 Total docs today:', gameState.documentsToday.length);

    // Mostrar feedback visual
    this.showFeedback(option.consequences);

    // Actualizar recursos
    this.updateResourceBar();

    // Guardar progreso
    if (gameState.saveManager) {
      gameState.saveManager.save();
    }

    // Mostrar respuesta del NPC
    this.time.delayedCall(800, () => {
      console.log('⏰ Delayed call executed, showing response');
      this.showResponse(result.response, () => {
        console.log('✅ Response callback executed');

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

        console.log('➡️ Calling showCurrentDocument()');
        this.showCurrentDocument();
      });
    });
  }

  // ═══════════════════════════════════════════
  // FEEDBACK VISUAL
  // ═══════════════════════════════════════════

  showFeedback(consequences) {
    if (!consequences) return;

    // Determinar si es positivo o negativo y reproducir sonido
    const total = Object.values(consequences).reduce((sum, val) => sum + val, 0);
    if (gameState.audioManager) {
      if (total > 0) {
        gameState.audioManager.playConfirmSound();
      } else if (total < 0) {
        gameState.audioManager.playAlertSound();
      }
    }

    const width = this.cameras.main.width;
    const startX = width - 100;
    let yOffset = 0;

    Object.entries(consequences).forEach(([key, value]) => {
      if (value === 0) return;

      const icon = gameState.resourceIcons[key] || '💰';
      const sign = value > 0 ? '+' : '';
      const yPos = 140 + yOffset;

      const box = this.add.container(startX, yPos).setDepth(20);

      // Panel pequeño
      const panel = this.createBeveledPanel(0, 0, 80, 24);
      box.add(panel);

      // Texto con emoji
      const text = this.add.text(0, 0, `${icon} ${sign}${value}`, {
        fontSize: '11px',
        color: '#000000',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0.5);
      box.add(text);

      // Animación
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

      yOffset += 30;
    });
  }

  showResponse(response, callback) {
    console.log('💬 showResponse called with:', response);
    console.log('  Callback type:', typeof callback);

    if (!response) {
      console.log('  No response, calling callback immediately');
      callback();
      return;
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const dialogWidth = 400;
    const dialogHeight = 140;

    const dialog = this.add.container(width/2, height/2).setDepth(40);

    // Overlay oscuro
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.5);
    overlay.setOrigin(0.5);
    overlay.setInteractive();
    dialog.add(overlay);

    // Panel de diálogo
    const panel = this.createBeveledPanel(0, 0, dialogWidth, dialogHeight);
    dialog.add(panel);

    // Barra de título
    const titleBar = this.add.rectangle(0, -dialogHeight/2 + 10, dialogWidth - 6, 16, this.colors.titleBarBlue);
    dialog.add(titleBar);

    dialog.add(this.add.text(0, -dialogHeight/2 + 10, 'Respuesta', {
      fontSize: '11px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5));

    // Texto de respuesta
    dialog.add(this.add.text(0, 0, response, {
      fontSize: '12px',
      color: '#000000',
      wordWrap: { width: dialogWidth - 40 },
      align: 'center',
      lineSpacing: 5,
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5));

    // Botón OK
    const okBtn = this.createButton(0, dialogHeight/2 - 25, 80, 24, 'OK');
    dialog.add(okBtn);
    okBtn.setInteractive({ useHandCursor: true });
    okBtn.on('pointerdown', () => {
      console.log('🖱️ OK button clicked');
      dialog.destroy();
      callback();
    });

    // Click en overlay también cierra
    overlay.on('pointerdown', () => {
      console.log('🖱️ Overlay clicked');
      dialog.destroy();
      callback();
    });
  }

  // ═══════════════════════════════════════════
  // FIN DE DÍA
  // ═══════════════════════════════════════════

  showEndOfDay() {
    // Verificar si es el último día
    if (gameState.currentDay >= gameState.maxDays) {
      this.cameras.main.fadeOut(800);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('EndingScene');
      });
      return;
    }

    // Diálogo de fin de día
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const dialog = this.add.container(width/2, height/2).setDepth(40);

    const dialogWidth = 350;
    const dialogHeight = 120;

    const panel = this.createBeveledPanel(0, 0, dialogWidth, dialogHeight);
    dialog.add(panel);

    // Barra de título
    const titleBar = this.add.rectangle(0, -dialogHeight/2 + 10, dialogWidth - 6, 16, this.colors.titleBarBlue);
    dialog.add(titleBar);

    dialog.add(this.add.text(0, -dialogHeight/2 + 10, 'Fin del día', {
      fontSize: '11px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5));

    // Mensaje
    const dayName = gameState.getDayName();
    dialog.add(this.add.text(0, 0, `Terminaste el ${dayName}.\n\nLos recursos se ajustan...`, {
      fontSize: '12px',
      color: '#000000',
      align: 'center',
      lineSpacing: 6,
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5));

    // Auto-continuar después de 2 segundos
    this.time.delayedCall(2000, () => {
      dialog.destroy();

      // Decay de recursos
      gameState.applyResourceDecay();
      this.updateResourceBar();

      // Verificar game over
      const failed = gameState.checkResourceFailure();
      if (failed) {
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('EndingScene', {
            gameOver: true,
            failedResource: failed
          });
        });
        return;
      }

      // Siguiente día
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('DeskScene', { newDay: true });
      });
    });
  }

  // ═══════════════════════════════════════════
  // HELPERS - ESTILO WINDOWS 95
  // ═══════════════════════════════════════════

  /**
   * Crear panel con bordes biselados (efecto 3D)
   */
  createBeveledPanel(x, y, width, height) {
    const container = this.add.container(x, y);

    // Fondo gris
    const bg = this.add.rectangle(0, 0, width, height, this.colors.windowGray);
    container.add(bg);

    // Borde blanco (luz arriba-izquierda)
    const topLight = this.add.rectangle(-width/2, -height/2, width, 2, this.colors.white);
    topLight.setOrigin(0, 0);
    container.add(topLight);

    const leftLight = this.add.rectangle(-width/2, -height/2, 2, height, this.colors.white);
    leftLight.setOrigin(0, 0);
    container.add(leftLight);

    // Borde oscuro (sombra abajo-derecha)
    const bottomShadow = this.add.rectangle(-width/2, height/2 - 2, width, 2, this.colors.veryDarkGray);
    bottomShadow.setOrigin(0, 0);
    container.add(bottomShadow);

    const rightShadow = this.add.rectangle(width/2 - 2, -height/2, 2, height, this.colors.veryDarkGray);
    rightShadow.setOrigin(0, 0);
    container.add(rightShadow);

    // Borde medio (gris oscuro)
    const bottomMid = this.add.rectangle(-width/2, height/2 - 4, width, 2, this.colors.darkGray);
    bottomMid.setOrigin(0, 0);
    container.add(bottomMid);

    const rightMid = this.add.rectangle(width/2 - 4, -height/2, 2, height, this.colors.darkGray);
    rightMid.setOrigin(0, 0);
    container.add(rightMid);

    return container;
  }

  /**
   * Crear botón con estilo Windows 95
   */
  createButton(x, y, width, height, text) {
    const container = this.add.container(x, y);

    // Fondo gris
    const bg = this.add.rectangle(0, 0, width, height, this.colors.windowGray);
    container.add(bg);

    // Bordes biselados
    const topLight = this.add.rectangle(-width/2, -height/2, width - 2, 2, this.colors.white);
    topLight.setOrigin(0, 0);
    container.add(topLight);

    const leftLight = this.add.rectangle(-width/2, -height/2, 2, height - 2, this.colors.white);
    leftLight.setOrigin(0, 0);
    container.add(leftLight);

    const bottomShadow = this.add.rectangle(-width/2 + 2, height/2 - 2, width - 2, 2, this.colors.veryDarkGray);
    bottomShadow.setOrigin(0, 0);
    container.add(bottomShadow);

    const rightShadow = this.add.rectangle(width/2 - 2, -height/2 + 2, 2, height - 2, this.colors.veryDarkGray);
    rightShadow.setOrigin(0, 0);
    container.add(rightShadow);

    // Texto (SIN emojis)
    const label = this.add.text(0, 0, text, {
      fontSize: '12px',
      color: '#000000',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(width, height);
    return container;
  }
}

if (typeof window !== 'undefined') {
  window.DeskScene = DeskScene;
}
