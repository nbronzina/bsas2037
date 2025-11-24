/**
 * AchievementNotification - Toast-style notification for unlocked achievements
 *
 * Animates in from right, displays for 4 seconds, then slides out
 */

class AchievementNotification extends Phaser.GameObjects.Container {
  constructor(scene, achievement) {
    // Start off-screen to the right
    super(scene, scene.cameras.main.width + 200, 100);

    this.scene = scene;
    this.achievement = achievement;

    this.createNotification();

    // Add to scene
    scene.add.existing(this);
    this.setDepth(10000); // Always on top
    this.setScrollFactor(0); // Fixed position

    // Animate in
    this.animateIn();
  }

  createNotification() {
    const width = 350;
    const height = 100;

    // Background con sombra
    const shadow = this.scene.add.rectangle(5, 5, width, height, 0x000000, 0.3);
    this.add(shadow);

    // Background principal
    const bg = this.scene.add.rectangle(0, 0, width, height, 0x2d2d2d, 0.95);
    bg.setStrokeStyle(3, 0xffd700); // Golden border
    this.add(bg);

    // Icon grande a la izquierda
    const icon = this.scene.add.text(-140, 0, this.achievement.icon, {
      fontSize: '48px'
    }).setOrigin(0.5);
    this.add(icon);

    // Header "Logro Desbloqueado"
    const header = this.scene.add.text(-80, -25, '🏆 Logro Desbloqueado', {
      fontSize: '14px',
      color: '#ffd700',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5);
    this.add(header);

    // Achievement title
    const title = this.scene.add.text(-80, 0, this.achievement.title, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5);
    this.add(title);

    // Rarity stars
    let stars = '';
    for (let i = 0; i < this.achievement.rarity; i++) {
      stars += '⭐';
    }

    const rarityText = this.scene.add.text(-80, 20, stars, {
      fontSize: '12px'
    }).setOrigin(0, 0.5);
    this.add(rarityText);

    // Points
    const pointsText = this.scene.add.text(140, 20, `+${this.achievement.points} pts`, {
      fontSize: '14px',
      color: '#ffd700',
      fontFamily: 'Courier New'
    }).setOrigin(1, 0.5);
    this.add(pointsText);
  }

  animateIn() {
    const targetX = this.scene.cameras.main.width - 190;

    // Slide in from right with bounce
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Stay visible for 4 seconds
        this.scene.time.delayedCall(4000, () => {
          this.animateOut();
        });
      }
    });

    // Optional: Play sound effect
    // if (gameState.audioManager) {
    //   gameState.audioManager.playAchievementUnlock();
    // }
  }

  animateOut() {
    // Slide out to the right
    this.scene.tweens.add({
      targets: this,
      x: this.scene.cameras.main.width + 200,
      duration: 500,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.destroy();
      }
    });
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.AchievementNotification = AchievementNotification;
}
