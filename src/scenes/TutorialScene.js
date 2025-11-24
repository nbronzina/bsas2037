// TutorialScene.js - Pantalla modal de tutorial con Valeria

class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialScene' });
  }

  create(data) {
    const { stepFlag, tutorialData, onComplete } = data;
    this.onComplete = onComplete;
    this.tutorialData = tutorialData;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background overlay
    this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.85);

    // Tutorial panel (AUMENTADO para mejor distribución)
    const panelWidth = 600;
    const panelHeight = 480;
    const panel = this.add.rectangle(width/2, height/2, panelWidth, panelHeight, 0x2d2d2d);
    panel.setStrokeStyle(3, 0xffd700);

    // Valeria avatar (si aplica) - centrado arriba
    if (tutorialData.showValeria) {
      const avatar = this.add.text(width/2, height/2 - 200, '👩', {
        fontSize: '48px'
      }).setOrigin(0.5);
    }

    // Title - debajo del avatar
    if (tutorialData.title) {
      this.add.text(width/2, height/2 - 140, tutorialData.title, {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffd700',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }

    // Dialogue text - centrado verticalmente con más espacio
    const dialogue = this.add.text(width/2, height/2 - 80, tutorialData.dialogue, {
      fontFamily: 'Courier New',
      fontSize: '15px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: panelWidth - 120 },
      lineSpacing: 6
    }).setOrigin(0.5, 0);

    // Buttons - más abajo para evitar overlap
    this.createButtons(width, height, stepFlag);
  }

  createButtons(width, height, stepFlag) {
    const buttonY = height/2 + 180;

    // Main button (Continuar / Entendido)
    const mainButton = this.add.text(width/2, buttonY, this.tutorialData.buttonText || 'Continuar', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#000000',
      backgroundColor: '#ffd700',
      padding: { x: 30, y: 12 }
    }).setOrigin(0.5).setInteractive();

    mainButton.on('pointerdown', () => {
      gameState.audioManager?.playConfirmSound();
      this.completeTutorial();
    });

    mainButton.on('pointerover', () => {
      mainButton.setScale(1.05);
    });

    mainButton.on('pointerout', () => {
      mainButton.setScale(1.0);
    });
  }

  completeTutorial() {
    this.scene.stop();
    if (this.onComplete) {
      this.onComplete();
    }
  }
}

if (typeof window !== 'undefined') {
  window.TutorialScene = TutorialScene;
}
