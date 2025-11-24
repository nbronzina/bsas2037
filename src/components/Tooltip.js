// Tooltip.js - Tooltip flotante contextual

class Tooltip extends Phaser.GameObjects.Container {
  constructor(scene, target, text, position = 'top') {
    super(scene, target.x, target.y);

    this.scene = scene;
    this.target = target;

    // Background
    const bg = scene.add.rectangle(0, 0, 250, 80, 0x2d2d2d, 0.95);
    bg.setStrokeStyle(2, 0xffd700);
    this.add(bg);

    // Text
    const tooltipText = scene.add.text(0, 0, text, {
      fontFamily: 'Courier New',
      fontSize: '13px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 230 }
    }).setOrigin(0.5);
    this.add(tooltipText);

    // Position based on parameter
    this.positionTooltip(target, position);

    // Add to scene
    scene.add.existing(this);
    this.setDepth(9999);

    // Auto-hide after 5 seconds
    scene.time.delayedCall(5000, () => {
      this.fadeOut();
    });
  }

  positionTooltip(target, position) {
    const offset = 60;

    switch(position) {
      case 'top':
        this.x = target.x;
        this.y = target.y - offset;
        break;
      case 'bottom':
        this.x = target.x;
        this.y = target.y + offset;
        break;
      case 'left':
        this.x = target.x - offset - 50;
        this.y = target.y;
        break;
      case 'right':
        this.x = target.x + offset + 50;
        this.y = target.y;
        break;
    }
  }

  fadeOut() {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.destroy();
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.Tooltip = Tooltip;
}
