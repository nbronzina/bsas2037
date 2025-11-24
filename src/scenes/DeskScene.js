/**
 * DeskScene - Pantalla principal del escritorio
 * Aquí el jugador lee documentos y toma decisiones
 */

class DeskScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DeskScene' });
  }

  init(data) {
    this.isNewDay = data?.newDay || false;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    gameState.currentScene = this;

    this.add.rectangle(width/2, height/2, width, height, 0x2d2d2d);

    if (this.isNewDay || gameState.documentsToday.length === 0) {
      this.setupNewDay();
    }

    this.createHeader();
    this.createResourceBar();
    this.createDocumentArea();
    this.createFooter();
    this.showCurrentDocument();

    this.cameras.main.fadeIn(500);
  }

  setupNewDay() {
    if (gameState.currentDay > 1) {
      gameState.documentManager.applyDayDecay(gameState.currentDay);
    }

    gameState.documentsToday = gameState.documentManager.getDocumentsForDay(gameState.currentDay);
    gameState.currentDocumentIndex = 0;

    console.log(`📅 Day ${gameState.currentDay}: ${gameState.documentsToday.length} documents`);
  }

  createHeader() {
    const width = this.cameras.main.width;

    this.add.rectangle(width/2, 30, width, 60, 0x1a1a1a);

    const dayName = gameState.getDayName();
    this.dayText = this.add.text(20, 30, `DÍA ${gameState.currentDay} - ${dayName.toUpperCase()}`, {
      fontSize: '20px',
      color: '#ffd700',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5);

    this.creditosText = this.add.text(width - 20, 30, `💰 ${gameState.creditos}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Courier New'
    }).setOrigin(1, 0.5);
  }

  createResourceBar() {
    const width = this.cameras.main.width;
    const y = 80;

    this.add.rectangle(width/2, y, width, 40, 0x333333);

    const resources = gameState.getResourcesArray();
    const spacing = width / (resources.length + 1);

    this.resourceTexts = {};

    resources.forEach((res, index) => {
      const x = spacing * (index + 1);

      const text = this.add.text(x, y, `${res.icon} ${res.value}%`, {
        fontSize: '16px',
        color: res.value < 20 ? '#ff5555' : '#ffffff',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);

      this.resourceTexts[res.key] = text;
    });
  }

  updateResourceBar() {
    const resources = gameState.getResourcesArray();

    resources.forEach(res => {
      if (this.resourceTexts[res.key]) {
        this.resourceTexts[res.key].setText(`${res.icon} ${res.value}%`);
        this.resourceTexts[res.key].setColor(res.value < 20 ? '#ff5555' : '#ffffff');
      }
    });

    if (this.creditosText) {
      this.creditosText.setText(`💰 ${gameState.creditos}`);
      this.creditosText.setColor(gameState.creditos < 0 ? '#ff5555' : '#ffffff');
    }
  }

  createDocumentArea() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.documentContainer = this.add.container(width/2, height/2 - 30);
  }

  showCurrentDocument() {
    this.documentContainer.removeAll(true);

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
    const panelWidth = 600;
    const panelHeight = 380;

    const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x404040);
    panel.setStrokeStyle(2, 0xffd700);
    this.documentContainer.add(panel);

    const typeColors = {
      'solicitud': 0x2196F3,
      'propuesta': 0x4CAF50,
      'queja': 0xFF9800,
      'urgente': 0xF44336,
      'info': 0x9E9E9E
    };

    const headerBg = this.add.rectangle(0, -panelHeight/2 + 25, panelWidth, 50, typeColors[doc.type] || 0x666666);
    this.documentContainer.add(headerBg);

    const title = this.add.text(0, -panelHeight/2 + 25, doc.title.toUpperCase(), {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
    this.documentContainer.add(title);

    const senderText = this.add.text(-panelWidth/2 + 20, -panelHeight/2 + 60,
      `${npc?.emoji || '📄'} De: ${npc?.name || doc.sender} (${npc?.role || ''})`, {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'Courier New'
    });
    this.documentContainer.add(senderText);

    const content = this.add.text(0, -30, doc.content, {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: panelWidth - 60 },
      align: 'left',
      lineSpacing: 6,
      fontFamily: 'Courier New'
    }).setOrigin(0.5, 0.5);
    this.documentContainer.add(content);

    this.createOptions(doc, panelWidth, panelHeight);
  }

  createOptions(doc, panelWidth, panelHeight) {
    const startY = panelHeight/2 - 80;
    const optionSpacing = 50;

    doc.options.forEach((option, index) => {
      const y = startY - (doc.options.length - 1 - index) * optionSpacing;

      const btn = this.add.rectangle(0, y, panelWidth - 80, 40, 0x555555);
      btn.setStrokeStyle(1, 0x888888);
      btn.setInteractive({ useHandCursor: true });
      this.documentContainer.add(btn);

      const btnText = this.add.text(-panelWidth/2 + 60, y, option.text, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Courier New'
      }).setOrigin(0, 0.5);
      this.documentContainer.add(btnText);

      if (option.preview) {
        const preview = this.add.text(panelWidth/2 - 60, y, option.preview, {
          fontSize: '14px',
          color: '#aaaaaa',
          fontFamily: 'Courier New'
        }).setOrigin(1, 0.5);
        this.documentContainer.add(preview);
      }

      btn.on('pointerover', () => {
        btn.setFillStyle(0x666666);
        btn.setStrokeStyle(2, 0xffd700);
      });

      btn.on('pointerout', () => {
        btn.setFillStyle(0x555555);
        btn.setStrokeStyle(1, 0x888888);
      });

      btn.on('pointerdown', () => {
        this.selectOption(doc, index, option);
      });
    });
  }

  selectOption(doc, index, option) {
    const result = gameState.documentManager.processDecision(doc, index);

    this.updateResourceBar();

    // Auto-guardar después de cada decisión
    if (gameState.saveManager) {
      gameState.saveManager.save();
    }

    this.showResponse(result.response, () => {
      gameState.advanceToNextDocument();

      if (gameState.isAnyZero()) {
        this.triggerGameOver();
        return;
      }

      this.showCurrentDocument();
    });
  }

  showResponse(responseText, callback) {
    if (!responseText) {
      callback();
      return;
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7);
    overlay.setDepth(100);

    const response = this.add.text(width/2, height/2, responseText, {
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: 500 },
      align: 'center',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setDepth(101);

    const continueText = this.add.text(width/2, height/2 + 80, '[ Click para continuar ]', {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setDepth(101);

    overlay.setInteractive();
    overlay.once('pointerdown', () => {
      overlay.destroy();
      response.destroy();
      continueText.destroy();
      callback();
    });
  }

  showEndOfDay() {
    this.documentContainer.removeAll(true);

    const panelWidth = 500;
    const panelHeight = 300;

    const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x404040);
    panel.setStrokeStyle(2, 0xffd700);
    this.documentContainer.add(panel);

    const title = this.add.text(0, -80, '📋 FIN DEL DÍA', {
      fontSize: '24px',
      color: '#ffd700',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
    this.documentContainer.add(title);

    const docsCompleted = gameState.documentsToday.length;
    const summary = this.add.text(0, 0, `Documentos procesados: ${docsCompleted}\n\nLos recursos se ajustarán para mañana.`, {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
    this.documentContainer.add(summary);

    const isLastDay = gameState.isLastDay();
    const btnText = isLastDay ? 'Ver Resultado Final' : `Avanzar a ${gameState.dayNames[gameState.currentDay]}`;

    const btn = this.add.rectangle(0, 80, 250, 45, 0xffd700);
    btn.setInteractive({ useHandCursor: true });
    this.documentContainer.add(btn);

    const btnLabel = this.add.text(0, 80, btnText, {
      fontSize: '16px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
    this.documentContainer.add(btnLabel);

    btn.on('pointerover', () => btn.setFillStyle(0xffed4a));
    btn.on('pointerout', () => btn.setFillStyle(0xffd700));

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

    // Guardar al cambiar de día
    if (gameState.saveManager) {
      gameState.saveManager.save();
    }

    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.restart({ newDay: true });
    });
  }

  createFooter() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.rectangle(width/2, height - 30, width, 60, 0x1a1a1a);

    this.remainingText = this.add.text(20, height - 30, '', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5);

    this.updateFooter();
  }

  updateFooter() {
    const remaining = gameState.getRemainingDocuments();
    if (remaining > 0) {
      this.remainingText.setText(`📬 ${remaining} documento${remaining > 1 ? 's' : ''} en la bandeja`);
    } else {
      this.remainingText.setText('📭 Bandeja vacía');
    }
  }

  triggerEnding() {
    this.cameras.main.fadeOut(1000, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('EndingScene');
    });
  }

  triggerGameOver() {
    let failedResource = '';
    Object.entries(gameState.resources).forEach(([key, value]) => {
      if (value <= 0) failedResource = key;
    });

    this.cameras.main.fadeOut(1000, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('EndingScene', {
        gameOver: true,
        failedResource: failedResource
      });
    });
  }
}

if (typeof window !== 'undefined') {
  window.DeskScene = DeskScene;
}
