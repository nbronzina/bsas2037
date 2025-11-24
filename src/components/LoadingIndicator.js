// LoadingIndicator.js - Indicador de carga animado

class LoadingIndicator extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text = 'Cargando...') {
    super(scene, x, y);

    // Spinner (círculo rotando)
    this.spinner = scene.add.arc(0, 0, 20, 0, 270, false, 0xffd700);
    this.spinner.setStrokeStyle(4, 0xffd700);
    this.add(this.spinner);

    // Texto
    this.loadingText = scene.add.text(0, 40, text, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
    this.add(this.loadingText);

    // Animación de rotación
    scene.tweens.add({
      targets: this.spinner,
      angle: 360,
      duration: 1000,
      repeat: -1,
      ease: 'Linear'
    });

    this.setDepth(10000);
    scene.add.existing(this);
  }

  setText(text) {
    this.loadingText.setText(text);
  }

  show() {
    this.setVisible(true);
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 200
    });
  }

  hide(callback) {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.setVisible(false);
        if (callback) callback();
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.LoadingIndicator = LoadingIndicator;
}
