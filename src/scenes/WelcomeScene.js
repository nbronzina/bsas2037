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
    if (this.hasSaveData()) {
      const continueBtn = this.add.text(width/2, height - 100, '[ Continuar ]', {
        fontSize: '20px',
        color: '#888888',
        fontFamily: 'Courier New'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

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

  hasSaveData() {
    return localStorage.getItem('redDeAguante_desk_save') !== null;
  }

  startNewGame() {
    gameState.reset();

    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('DeskScene', { newDay: true });
    });
  }

  continueGame() {
    // Load save data
    const saved = localStorage.getItem('redDeAguante_desk_save');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        gameState.currentDay = data.currentDay || 1;
        gameState.resources = data.resources || gameState.resources;
        gameState.creditos = data.creditos || 100;
        gameState.completedDocuments = data.completedDocuments || [];
        gameState.flags = data.flags || {};
      } catch (e) {
        console.error('Error loading save:', e);
      }
    }

    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('DeskScene', { newDay: true });
    });
  }
}

if (typeof window !== 'undefined') {
  window.WelcomeScene = WelcomeScene;
}
