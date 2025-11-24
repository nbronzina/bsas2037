// AnimatedButton.js - Botón con animaciones hover/click

class AnimatedButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text, config = {}) {
    super(scene, x, y);

    this.scene = scene;
    this.isEnabled = true;
    this.config = {
      width: config.width || 200,
      height: config.height || 50,
      fontSize: config.fontSize || '18px',
      textColor: config.textColor || '#ffffff',
      bgColor: config.bgColor || 0x333333,
      hoverBgColor: config.hoverBgColor || 0x444444,
      hoverTextColor: config.hoverTextColor || '#ffd700',
      borderColor: config.borderColor || 0x666666,
      hoverBorderColor: config.hoverBorderColor || 0xffd700,
      borderWidth: config.borderWidth || 2,
      onClick: config.onClick || null,
      fontFamily: config.fontFamily || 'Courier New',
      ...config
    };

    // Background
    this.bg = scene.add.rectangle(0, 0, this.config.width, this.config.height, this.config.bgColor);
    this.bg.setStrokeStyle(this.config.borderWidth, this.config.borderColor);
    this.add(this.bg);

    // Text
    this.textElement = scene.add.text(0, 0, text, {
      fontSize: this.config.fontSize,
      color: this.config.textColor,
      fontFamily: this.config.fontFamily
    }).setOrigin(0.5);
    this.add(this.textElement);

    // Make interactive
    this.setSize(this.config.width, this.config.height);
    this.setInteractive({ useHandCursor: true });

    // Event handlers
    this.on('pointerover', () => this.onHover());
    this.on('pointerout', () => this.onHoverOut());
    this.on('pointerdown', () => this.onPress());
    this.on('pointerup', () => this.onRelease());

    scene.add.existing(this);
  }

  onHover() {
    if (!this.isEnabled) return;

    // Scale up
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Power2'
    });

    // Change colors
    this.bg.setFillStyle(this.config.hoverBgColor);
    this.bg.setStrokeStyle(this.config.borderWidth, this.config.hoverBorderColor);
    this.textElement.setColor(this.config.hoverTextColor);
  }

  onHoverOut() {
    if (!this.isEnabled) return;

    // Scale back
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 100,
      ease: 'Power2'
    });

    // Reset colors
    this.bg.setFillStyle(this.config.bgColor);
    this.bg.setStrokeStyle(this.config.borderWidth, this.config.borderColor);
    this.textElement.setColor(this.config.textColor);
  }

  onPress() {
    if (!this.isEnabled) return;

    // Play click SFX
    if (gameState.audioManager) {
      gameState.audioManager.playConfirmSound();
    }

    // Scale down (pressed effect)
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 50,
      ease: 'Power2'
    });
  }

  onRelease() {
    if (!this.isEnabled) return;

    // Scale back to hover state
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 50,
      ease: 'Power2'
    });

    // Execute callback
    if (this.config.onClick) {
      this.config.onClick();
    }
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    this.alpha = enabled ? 1.0 : 0.5;

    if (enabled) {
      this.setInteractive({ useHandCursor: true });
    } else {
      this.disableInteractive();
    }
  }

  setText(text) {
    this.textElement.setText(text);
  }
}

if (typeof window !== 'undefined') {
  window.AnimatedButton = AnimatedButton;
}
