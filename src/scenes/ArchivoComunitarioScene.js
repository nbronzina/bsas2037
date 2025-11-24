/**
 * ArchivoComunitarioScene - Pantalla de visualización de la Memoria Colectiva
 *
 * Muestra todos los fragmentos de memoria desbloqueados en una timeline
 * consultable. Los fragmentos están ordenados por día y color-coded
 * por categoría.
 *
 * Características:
 * - Timeline vertical con todos los fragmentos
 * - Click en fragmento para ver detalle completo
 * - Color-coding por categoría
 * - Stats de completación
 * - Navegación con teclado (ESC para volver)
 */

class ArchivoComunitarioScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ArchivoComunitarioScene' });
    this.currentView = 'timeline'; // 'timeline' o 'detail'
    this.selectedFragment = null;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Title
    this.add.text(width / 2, 40, '📖 ARCHIVO COMUNITARIO', {
      fontSize: '28px',
      color: '#ffd700',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Stats
    const stats = gameState.memoriaColectiva.getStats();
    const statsText = `${stats.totalUnlocked} fragmentos • ${stats.completionPercentage}% completo`;

    this.add.text(width / 2, 75, statsText, {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Create timeline
    this.createTimeline(width, height);

    // Back button
    this.backButton = this.add.text(50, height - 50, '← Volver', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5).setInteractive();

    this.backButton.on('pointerdown', () => {
      gameState.audioManager?.playConfirmSound();
      this.closeArchive();
    });

    this.backButton.on('pointerover', () => {
      this.backButton.setColor('#ffd700');
    });

    this.backButton.on('pointerout', () => {
      this.backButton.setColor('#ffffff');
    });

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.currentView === 'detail') {
        this.showTimeline();
      } else {
        this.closeArchive();
      }
    });
  }

  createTimeline(width, height) {
    const fragmentos = gameState.memoriaColectiva.getAllFragments();

    if (fragmentos.length === 0) {
      this.add.text(width / 2, height / 2, 'Aún no hay fragmentos de memoria.\nLos momentos importantes se registrarán automáticamente.', {
        fontSize: '18px',
        color: '#666666',
        fontFamily: 'Courier New',
        align: 'center'
      }).setOrigin(0.5);
      return;
    }

    let yOffset = 120;
    const itemHeight = 100;
    const marginBottom = 120;

    fragmentos.forEach((fragmento, index) => {
      this.createFragmentItem(fragmento, 80, yOffset, width - 160);
      yOffset += itemHeight + 10;
    });

    // If content is too long, show hint
    if (yOffset > height - marginBottom) {
      this.add.text(width / 2, height - 30, '(Desplaza con mouse para ver más)', {
        fontSize: '12px',
        color: '#666666',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);
    }
  }

  createFragmentItem(fragmento, x, y, itemWidth) {
    // Background - Aumentado para mejor legibilidad
    const bg = this.add.rectangle(x + itemWidth / 2, y + 50, itemWidth, 95, 0x2d2d2d, 0.8);
    bg.setStrokeStyle(2, this.getCategoryColor(fragmento.category));
    bg.setInteractive({ useHandCursor: true });

    // Icon
    const icon = this.add.text(x + 15, y + 50, fragmento.icon, {
      fontSize: '28px'
    }).setOrigin(0, 0.5);

    // Day label
    const dayLabel = this.add.text(x + 55, y + 20, `Día ${fragmento.day}`, {
      fontSize: '11px',
      color: '#888888',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5);

    // Title
    const title = this.add.text(x + 55, y + 40, fragmento.title, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Courier New',
      wordWrap: { width: itemWidth - 180 }
    }).setOrigin(0, 0.5);

    // Short text
    const shortText = this.add.text(x + 55, y + 65, fragmento.shortText, {
      fontSize: '12px',
      color: '#aaaaaa',
      fontFamily: 'Courier New',
      wordWrap: { width: itemWidth - 180 }
    }).setOrigin(0, 0.5);

    // Category badge
    const categoryLabel = this.getCategoryLabel(fragmento.category);
    const badge = this.add.text(x + itemWidth - 15, y + 25, categoryLabel, {
      fontSize: '10px',
      color: '#ffffff',
      backgroundColor: this.getCategoryColorHex(fragmento.category),
      padding: { x: 6, y: 3 },
      fontFamily: 'Courier New'
    }).setOrigin(1, 0.5);

    // Interactivity
    bg.on('pointerdown', () => {
      gameState.audioManager?.playConfirmSound();
      this.showFragmentDetail(fragmento);
    });

    bg.on('pointerover', () => {
      bg.setFillStyle(0x3d3d3d, 0.9);
      title.setColor('#ffd700');
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x2d2d2d, 0.8);
      title.setColor('#ffffff');
    });
  }

  showFragmentDetail(fragmento) {
    // Clear scene
    this.children.removeAll();
    this.currentView = 'detail';
    this.selectedFragment = fragmento;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Panel - AUMENTADO para mejor legibilidad
    const panelWidth = Math.min(750, width - 80);
    const panelHeight = Math.min(620, height - 80);
    const panel = this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x2d2d2d);
    panel.setStrokeStyle(3, this.getCategoryColor(fragmento.category));

    // Icon large
    this.add.text(width / 2, height / 2 - 270, fragmento.icon, {
      fontSize: '56px'
    }).setOrigin(0.5);

    // Day & category
    const meta = `Día ${fragmento.day} • ${this.getCategoryLabel(fragmento.category)}`;
    this.add.text(width / 2, height / 2 - 200, meta, {
      fontSize: '13px',
      color: '#888888',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Title
    this.add.text(width / 2, height / 2 - 175, fragmento.title, {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Courier New',
      wordWrap: { width: panelWidth - 120 }
    }).setOrigin(0.5);

    // Long text
    this.add.text(width / 2, height / 2 - 120, fragmento.longText, {
      fontSize: '14px',
      color: '#cccccc',
      align: 'center',
      fontFamily: 'Courier New',
      wordWrap: { width: panelWidth - 120 },
      lineSpacing: 4
    }).setOrigin(0.5, 0);

    // Narrator (if not collective voice)
    if (fragmento.narrator && fragmento.narrator !== 'colectiva') {
      const narratorName = this.getNarratorName(fragmento.narrator);
      this.add.text(width / 2, height / 2 + 230, `— ${narratorName}`, {
        fontSize: '13px',
        color: '#888888',
        fontStyle: 'italic',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);
    } else {
      this.add.text(width / 2, height / 2 + 230, '— Voz Colectiva', {
        fontSize: '13px',
        color: '#888888',
        fontStyle: 'italic',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);
    }

    // Back button
    this.backButton = this.add.text(width / 2, height / 2 + 270, '← Volver al archivo', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setInteractive();

    this.backButton.on('pointerdown', () => {
      gameState.audioManager?.playConfirmSound();
      this.showTimeline();
    });

    this.backButton.on('pointerover', () => {
      this.backButton.setColor('#ffd700');
    });

    this.backButton.on('pointerout', () => {
      this.backButton.setColor('#ffffff');
    });
  }

  showTimeline() {
    this.currentView = 'timeline';
    this.selectedFragment = null;
    this.scene.restart();
  }

  closeArchive() {
    this.scene.stop();
    this.scene.resume('MapScene');
  }

  getCategoryLabel(category) {
    const labels = {
      'hito': 'HITO',
      'decision': 'DECISIÓN',
      'npc': 'PERSONAJE',
      'crisis': 'CRISIS',
      'logro': 'LOGRO',
      'evento': 'EVENTO'
    };
    return labels[category] || 'MEMORIA';
  }

  getCategoryColor(category) {
    const colors = {
      'hito': 0xffd700,
      'decision': 0x2196F3,
      'npc': 0x9C27B0,
      'crisis': 0xFF5252,
      'logro': 0x4CAF50,
      'evento': 0xFF9800
    };
    return colors[category] || 0x666666;
  }

  getCategoryColorHex(category) {
    const colors = {
      'hito': '#ffd700',
      'decision': '#2196F3',
      'npc': '#9C27B0',
      'crisis': '#FF5252',
      'logro': '#4CAF50',
      'evento': '#FF9800'
    };
    return colors[category] || '#666666';
  }

  getNarratorName(narrator) {
    const names = {
      'beto': 'Beto',
      'yani': 'Yani',
      'marcos': 'Marcos',
      'valeria': 'Valeria'
    };
    return names[narrator] || narrator;
  }

  update() {
    // No special update logic needed
  }

  shutdown() {
    console.log('ArchivoComunitarioScene shutdown');

    // Cleanup completo usando CleanupManager
    CleanupManager.cleanupScene(this);

    // Cleanup keyboard listeners específicos
    this.input.keyboard.off('keydown-ESC');
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.ArchivoComunitarioScene = ArchivoComunitarioScene;
}
