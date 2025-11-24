/**
 * WelcomeScene - Pantalla de inicio (MEJORADA)
 * UI pulida con efectos visuales
 */

class WelcomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WelcomeScene' });

    this.colors = {
      background: 0x1a1a2e,
      accent: 0xffd700,
      text: 0xffffff,
      textMuted: 0x888888
    };
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo
    this.add.rectangle(width/2, height/2, width, height, this.colors.background);

    // Patrón de fondo
    this.createBackgroundPattern(width, height);

    // Logo/Título con efecto
    this.createTitle(width);

    // Descripción
    this.createDescription(width, height);

    // Botones
    this.createButtons(width, height);

    // Créditos
    this.add.text(width/2, height - 25, 'LAB de Mundanidad Forzada × Heated Studio', {
      fontSize: '12px',
      color: '#444444',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Fade in
    this.cameras.main.fadeIn(800);
  }

  createBackgroundPattern(width, height) {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0xffffff, 0.02);

    for (let i = 0; i < width; i += 50) {
      graphics.moveTo(i, 0);
      graphics.lineTo(i, height);
    }
    graphics.strokePath();
  }

  createTitle(width) {
    // Efecto de brillo detrás del título
    const glow = this.add.rectangle(width/2, 130, 500, 80, 0xffd700, 0.1);

    this.tweens.add({
      targets: glow,
      alpha: 0.05,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });

    // Título principal
    const title = this.add.text(width/2, 120, 'RED DE AGUANTE', {
      fontSize: '52px',
      color: '#ffd700',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Subtítulo
    this.add.text(width/2, 175, 'Buenos Aires, 2037', {
      fontSize: '20px',
      color: '#888888',
      fontStyle: 'italic',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Línea decorativa
    this.add.rectangle(width/2, 205, 200, 2, 0xffd700, 0.5);
  }

  createDescription(width, height) {
    const descText = 'Una semana gestionando una red autogestionada.\n\n' +
      '📄 Cada documento requiere una decisión\n' +
      '⚡ Cada decisión tiene consecuencias\n' +
      '🤝 Tu comunidad depende de vos';

    this.add.text(width/2, height/2 - 20, descText, {
      fontSize: '16px',
      color: '#cccccc',
      align: 'center',
      lineSpacing: 10,
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
  }

  createButtons(width, height) {
    // Nueva Partida
    const newGameBtn = this.createButton(width/2, height - 140, '[ Nueva Partida ]', 24, '#ffd700');
    newGameBtn.on('pointerdown', () => this.startNewGame());

    // Continuar (si hay save)
    const saveInfo = gameState.saveManager?.getSaveInfo();

    if (saveInfo) {
      const continueBtn = this.createButton(width/2, height - 95, '[ Continuar ]', 18, '#888888');
      continueBtn.on('pointerdown', () => this.continueGame());

      // Info del save
      this.add.text(width/2, height - 70, `${saveInfo.dayName} • ${saveInfo.timeAgo}`, {
        fontSize: '12px',
        color: '#555555',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);
    }
  }

  createButton(x, y, text, size, color) {
    const btn = this.add.text(x, y, text, {
      fontSize: `${size}px`,
      color: color,
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      btn.setColor('#ffffff');
      btn.setScale(1.05);
    });

    btn.on('pointerout', () => {
      btn.setColor(color);
      btn.setScale(1);
    });

    return btn;
  }

  startNewGame() {
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
