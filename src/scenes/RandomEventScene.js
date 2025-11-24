/**
 * RandomEventScene - Pantalla de visualización de eventos aleatorios
 *
 * Muestra eventos procedurales con:
 * - Panel central con color según tipo (crisis/opportunity/neutral)
 * - Icono, título y descripción del evento
 * - 2-3 opciones de decisión con preview de consecuencias
 * - Mensaje de resultado después de elegir
 * - Pausa MapScene mientras está activo
 */

class RandomEventScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RandomEventScene' });
    this.currentEvent = null;
    this.selectedOption = null;
    this.showingResult = false;
  }

  /**
   * Inicializa la escena con el evento a mostrar
   * @param {object} data - { event: eventObject }
   */
  init(data) {
    this.currentEvent = data.event;
    this.selectedOption = null;
    this.showingResult = false;

    console.log('RandomEventScene: Displaying event:', this.currentEvent.title);
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background semi-transparente
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

    // Determinar color según tipo de evento
    const typeColors = {
      'crisis': { bg: 0x4a1a1a, border: 0xff4444, text: '#ff6b6b' },
      'opportunity': { bg: 0x1a3a1a, border: 0x44ff44, text: '#4ecdc4' },
      'neutral': { bg: 0x1a1a3a, border: 0x4444ff, text: '#a29bfe' }
    };

    const colors = typeColors[this.currentEvent.type] || typeColors['neutral'];

    // Panel principal del evento - AUMENTADO para acomodar contenido
    const panelWidth = Math.min(750, width - 80);
    const panelHeight = Math.min(650, height - 60);
    const panelX = width / 2;
    const panelY = height / 2;

    // Sombra del panel
    const shadow = this.add.rectangle(panelX + 5, panelY + 5, panelWidth, panelHeight, 0x000000, 0.5);

    // Fondo del panel
    const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, colors.bg, 0.95);
    panel.setStrokeStyle(4, colors.border);

    // Header con tipo de evento
    const typeLabels = {
      'crisis': '⚠️ CRISIS',
      'opportunity': '✨ OPORTUNIDAD',
      'neutral': '📘 EVENTO'
    };

    const typeLabel = typeLabels[this.currentEvent.type] || '📘 EVENTO';

    this.add.text(panelX, panelY - panelHeight / 2 + 25, typeLabel, {
      fontSize: '16px',
      color: colors.text,
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Icono del evento (grande)
    this.add.text(panelX, panelY - panelHeight / 2 + 65, this.currentEvent.icon, {
      fontSize: '40px'
    }).setOrigin(0.5);

    // Título del evento
    this.add.text(panelX, panelY - panelHeight / 2 + 115, this.currentEvent.title, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Courier New',
      wordWrap: { width: panelWidth - 100 }
    }).setOrigin(0.5);

    // Descripción del evento
    this.add.text(panelX, panelY - panelHeight / 2 + 150, this.currentEvent.description, {
      fontSize: '13px',
      color: '#cccccc',
      fontFamily: 'Courier New',
      wordWrap: { width: panelWidth - 100 },
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5, 0);

    // Opciones de decisión
    this.createOptions(panelX, panelY, panelWidth, panelHeight, colors);

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-ONE', () => {
      if (!this.showingResult) this.selectOption(0);
    });
    this.input.keyboard.on('keydown-TWO', () => {
      if (!this.showingResult) this.selectOption(1);
    });
    this.input.keyboard.on('keydown-THREE', () => {
      if (!this.showingResult && this.currentEvent.options.length > 2) this.selectOption(2);
    });
  }

  /**
   * Crea los botones de opciones
   */
  createOptions(panelX, panelY, panelWidth, panelHeight, colors) {
    const optionsStartY = panelY + 20;
    const optionHeight = 70;
    const optionSpacing = 8;

    this.currentEvent.options.forEach((option, index) => {
      const optionY = optionsStartY + (index * (optionHeight + optionSpacing));

      // Background de la opción
      const optionBg = this.add.rectangle(
        panelX,
        optionY,
        panelWidth - 80,
        optionHeight,
        0x2d2d2d,
        0.9
      );
      optionBg.setStrokeStyle(2, 0x555555);
      optionBg.setInteractive({ useHandCursor: true });

      // Número de opción
      const numberCircle = this.add.circle(panelX - panelWidth / 2 + 60, optionY, 16, 0x444444);
      numberCircle.setStrokeStyle(2, colors.border);

      const numberText = this.add.text(panelX - panelWidth / 2 + 60, optionY, `${index + 1}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);

      // Texto de la opción
      const optionText = this.add.text(panelX - panelWidth / 2 + 90, optionY - 12, option.text, {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: 'Courier New',
        wordWrap: { width: panelWidth - 200 }
      }).setOrigin(0, 0.5);

      // Preview de consecuencias
      const consequences = this.formatConsequences(option.consequences);
      const consequencesText = this.add.text(panelX - panelWidth / 2 + 90, optionY + 15, consequences, {
        fontSize: '10px',
        color: '#999999',
        fontFamily: 'Courier New',
        wordWrap: { width: panelWidth - 200 }
      }).setOrigin(0, 0.5);

      // Interactividad
      optionBg.on('pointerover', () => {
        optionBg.setFillStyle(0x3d3d3d, 0.9);
        optionBg.setStrokeStyle(3, colors.border);
      });

      optionBg.on('pointerout', () => {
        optionBg.setFillStyle(0x2d2d2d, 0.9);
        optionBg.setStrokeStyle(2, 0x555555);
      });

      optionBg.on('pointerdown', () => {
        gameState.audioManager?.playConfirmSound();
        this.selectOption(index);
      });
    });
  }

  /**
   * Formatea las consecuencias de una opción para mostrar
   * @param {object} consequences - Objeto de consecuencias
   * @returns {string} - Texto formateado
   */
  formatConsequences(consequences) {
    const parts = [];

    if (consequences.resources) {
      const r = consequences.resources;
      if (r.creditos) parts.push(`${r.creditos > 0 ? '+' : ''}${r.creditos}₡`);
      if (r.electricidad) parts.push(`${r.electricidad > 0 ? '+' : ''}${r.electricidad}⚡`);
      if (r.agua) parts.push(`${r.agua > 0 ? '+' : ''}${r.agua}💧`);
      if (r.moral) parts.push(`${r.moral > 0 ? '+' : ''}${r.moral}❤️`);
    }

    if (parts.length === 0) {
      return 'Sin impacto inmediato en recursos';
    }

    return parts.join(' • ');
  }

  /**
   * Procesa la selección de una opción
   * @param {number} optionIndex - Índice de la opción elegida
   */
  selectOption(optionIndex) {
    if (this.showingResult) return;

    const option = this.currentEvent.options[optionIndex];
    if (!option) return;

    this.selectedOption = option;
    this.showingResult = true;

    console.log('RandomEventScene: Option selected:', option.text);

    // Aplicar consecuencias
    if (gameState && gameState.randomEventManager) {
      gameState.randomEventManager.applyConsequences(option.consequences);

      // Registrar el evento en el historial
      const currentDay = gameState.timeManager ? gameState.timeManager.currentDay : 0;
      gameState.randomEventManager.recordEventResult(
        this.currentEvent.id,
        option.id,
        currentDay
      );
    }

    // Mostrar resultado
    this.showResult(option.resultMessage);
  }

  /**
   * Muestra el mensaje de resultado
   * @param {string} message - Mensaje de resultado
   */
  showResult(message) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Limpiar la escena
    this.children.removeAll();

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

    // Panel de resultado - AUMENTADO
    const panelWidth = Math.min(700, width - 80);
    const panelHeight = Math.min(450, height - 120);
    const panelX = width / 2;
    const panelY = height / 2;

    // Sombra
    this.add.rectangle(panelX + 5, panelY + 5, panelWidth, panelHeight, 0x000000, 0.5);

    // Fondo
    const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x2d2d2d, 0.95);
    panel.setStrokeStyle(3, 0xffd700);

    // Título "Resultado"
    this.add.text(panelX, panelY - panelHeight / 2 + 35, '📊 RESULTADO', {
      fontSize: '18px',
      color: '#ffd700',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Icono del evento
    this.add.text(panelX, panelY - panelHeight / 2 + 80, this.currentEvent.icon, {
      fontSize: '36px'
    }).setOrigin(0.5);

    // Mensaje de resultado
    this.add.text(panelX, panelY - 20, message, {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: 'Courier New',
      wordWrap: { width: panelWidth - 100 },
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);

    // Preview de cambios aplicados
    const changesText = this.formatChangesApplied(this.selectedOption.consequences);
    this.add.text(panelX, panelY + 80, changesText, {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: 'Courier New',
      align: 'center',
      wordWrap: { width: panelWidth - 100 }
    }).setOrigin(0.5);

    // Botón continuar
    const continueButton = this.add.text(panelX, panelY + panelHeight / 2 - 40, 'CONTINUAR [ENTER]', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
    continueButton.setInteractive({ useHandCursor: true });

    continueButton.on('pointerover', () => {
      continueButton.setColor('#ffd700');
    });

    continueButton.on('pointerout', () => {
      continueButton.setColor('#ffffff');
    });

    continueButton.on('pointerdown', () => {
      gameState.audioManager?.playConfirmSound();
      this.closeEvent();
    });

    // Keyboard shortcut
    this.input.keyboard.once('keydown-ENTER', () => {
      gameState.audioManager?.playConfirmSound();
      this.closeEvent();
    });

    this.input.keyboard.once('keydown-SPACE', () => {
      gameState.audioManager?.playConfirmSound();
      this.closeEvent();
    });
  }

  /**
   * Formatea los cambios aplicados para mostrar
   * @param {object} consequences - Consecuencias aplicadas
   * @returns {string} - Texto formateado
   */
  formatChangesApplied(consequences) {
    const parts = [];

    if (consequences.resources) {
      const r = consequences.resources;
      if (r.creditos) parts.push(`Créditos: ${r.creditos > 0 ? '+' : ''}${r.creditos}`);
      if (r.electricidad) parts.push(`Electricidad: ${r.electricidad > 0 ? '+' : ''}${r.electricidad}`);
      if (r.agua) parts.push(`Agua: ${r.agua > 0 ? '+' : ''}${r.agua}`);
      if (r.moral) parts.push(`Moral: ${r.moral > 0 ? '+' : ''}${r.moral}`);
    }

    if (parts.length === 0) {
      return '';
    }

    return '✓ ' + parts.join(' • ');
  }

  /**
   * Cierra el evento y vuelve al juego
   */
  closeEvent() {
    console.log('RandomEventScene: Closing event');

    // Resumir MapScene
    this.scene.resume('MapScene');

    // Cerrar esta escena
    this.scene.stop();
  }

  update() {
    // No special update logic needed
  }

  shutdown() {
    console.log('RandomEventScene shutdown');

    // Cleanup completo usando CleanupManager
    CleanupManager.cleanupScene(this);

    // Cleanup keyboard listeners específicos
    this.input.keyboard.off('keydown-ONE');
    this.input.keyboard.off('keydown-TWO');
    this.input.keyboard.off('keydown-THREE');
    this.input.keyboard.off('keydown-ENTER');
    this.input.keyboard.off('keydown-SPACE');
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.RandomEventScene = RandomEventScene;
}
