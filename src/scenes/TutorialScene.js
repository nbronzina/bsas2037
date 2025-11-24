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

    // Tutorial panel
    const panelWidth = 600;
    const panelHeight = 400;
    const panel = this.add.rectangle(width/2, height/2, panelWidth, panelHeight, 0x2d2d2d);
    panel.setStrokeStyle(3, 0xffd700);

    // Valeria avatar (si aplica)
    if (tutorialData.showValeria) {
      const avatar = this.add.text(width/2 - 240, height/2 - 150, '👩', {
        fontSize: '48px'
      });
    }

    // Title
    if (tutorialData.title) {
      this.add.text(width/2, height/2 - 140, tutorialData.title, {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffd700',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }

    // Dialogue text
    const dialogue = this.add.text(width/2, height/2 - 50, tutorialData.dialogue, {
      fontFamily: 'Courier New',
      fontSize: '15px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: panelWidth - 100 },
      lineSpacing: 6
    }).setOrigin(0.5, 0);

    // Buttons
    this.createButtons(width, height, stepFlag);
  }

  createButtons(width, height, stepFlag) {
    const buttonY = height/2 + 140;

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

    // Skip button (solo en ciertos tutoriales)
    if (this.tutorialData.showSkip) {
      const skipButton = this.add.text(width/2, buttonY + 50, 'Saltear tutorial completo', {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#888888'
      }).setOrigin(0.5).setInteractive();

      skipButton.on('pointerdown', () => {
        gameState.audioManager?.playConfirmSound();
        this.skipAllTutorials();
      });

      skipButton.on('pointerover', () => {
        skipButton.setColor('#ffffff');
      });

      skipButton.on('pointerout', () => {
        skipButton.setColor('#888888');
      });
    }
  }

  completeTutorial() {
    this.scene.stop();
    if (this.onComplete) {
      this.onComplete();
    }
  }

  skipAllTutorials() {
    gameState.tutorialManager?.skipAll();
    this.scene.stop();
    if (this.onComplete) {
      this.onComplete();
    }
  }
}

if (typeof window !== 'undefined') {
  window.TutorialScene = TutorialScene;
}
