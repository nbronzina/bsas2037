/**
 * WelcomeScene - Pantalla de inicio (Versión Escritorio)
 */

class WelcomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WelcomeScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo
    this.add.rectangle(width/2, height/2, width, height, 0x1a1a1a);

    // Título
    this.add.text(width/2, 150, 'RED DE AGUANTE', {
      fontSize: '48px',
      color: '#ffd700',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Subtítulo
    this.add.text(width/2, 210, 'Buenos Aires, 2037', {
      fontSize: '20px',
      color: '#888888',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Descripción breve
    this.add.text(width/2, height/2, 'Una semana gestionando una red autogestionada.\n\nCada documento requiere una decisión.\nCada decisión tiene consecuencias.', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8,
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Botón Nueva Partida
    const newGameBtn = this.add.text(width/2, height - 150, '[ Nueva Partida ]', {
      fontSize: '24px',
      color: '#ffd700',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    newGameBtn.on('pointerover', () => newGameBtn.setColor('#ffffff'));
    newGameBtn.on('pointerout', () => newGameBtn.setColor('#ffd700'));
    newGameBtn.on('pointerdown', () => this.startNewGame());

    // Botón Continuar (si hay save)
    const saveInfo = gameState.saveManager?.getSaveInfo();

    if (saveInfo) {
      const continueY = height - 120;

      const continueBtn = this.add.text(width/2, continueY, '[ Continuar ]', {
        fontSize: '20px',
        color: '#888888',
        fontFamily: 'Courier New'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      // Info del save
      this.add.text(width/2, continueY + 30, `Día ${saveInfo.day} (${saveInfo.dayName}) • ${saveInfo.timeAgo}`, {
        fontSize: '12px',
        color: '#555555',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);

      continueBtn.on('pointerover', () => continueBtn.setColor('#ffffff'));
      continueBtn.on('pointerout', () => continueBtn.setColor('#888888'));
      continueBtn.on('pointerdown', () => this.continueGame());
    }

    // Créditos
    this.add.text(width/2, height - 30, 'LAB de Mundanidad Forzada × Heated Studio', {
      fontSize: '12px',
      color: '#555555',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Fade in
    this.cameras.main.fadeIn(500);
  }

  startNewGame() {
    gameState.reset();

    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('DeskScene', { newDay: true });
    });
  }

  continueGame() {
    const loaded = gameState.saveManager?.load();

    if (loaded) {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Si hay documentos pendientes del día, no es newDay
        const hasDocsToday = gameState.documentsToday.length > 0 &&
                            gameState.currentDocumentIndex < gameState.documentsToday.length;
        this.scene.start('DeskScene', { newDay: !hasDocsToday });
      });
    } else {
      // Si falla, iniciar nueva partida
      this.startNewGame();
    }
  }
}

if (typeof window !== 'undefined') {
  window.WelcomeScene = WelcomeScene;
}
