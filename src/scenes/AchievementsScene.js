/**
 * AchievementsScene - Pantalla de visualización de logros
 *
 * Muestra todos los 20 achievements organizados por categoría
 * Indica cuáles están unlocked vs locked
 * Muestra stats globales (X/20, puntos)
 */

class AchievementsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AchievementsScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Title
    this.add.text(width / 2, 50, '🏆 LOGROS', {
      fontSize: '32px',
      color: '#ffd700',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Stats globales
    const stats = gameState.achievementManager.getStats();
    const statsText = `${stats.unlocked}/${stats.total} desbloqueados (${stats.percentage}%) • ${stats.points}/${stats.maxPoints} puntos`;
    this.add.text(width / 2, 90, statsText, {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Scrollable content container
    this.createScrollableContent();

    // Back button
    const backButton = this.add.text(50, height - 50, '← Volver al Menú', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5).setInteractive();

    backButton.on('pointerdown', () => {
      this.scene.start('MapScene'); // Volver al juego
    });

    backButton.on('pointerover', () => {
      backButton.setColor('#ffd700');
    });

    backButton.on('pointerout', () => {
      backButton.setColor('#ffffff');
    });

    // Keyboard shortcut
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MapScene');
    });
  }

  createScrollableContent() {
    const width = this.cameras.main.width;

    // Group achievements by category
    const categories = {
      'historia': { title: '📖 HISTORIA', color: '#ff6b6b' },
      'personajes': { title: '👥 PERSONAJES', color: '#4ecdc4' },
      'gestion': { title: '📈 GESTIÓN', color: '#45b7d1' },
      'decisiones': { title: '🔀 DECISIONES', color: '#f9ca24' },
      'secretos': { title: '🔍 SECRETOS', color: '#a29bfe' }
    };

    let yOffset = 140;

    Object.entries(categories).forEach(([categoryKey, categoryInfo]) => {
      const achievements = gameState.achievementManager.getByCategory(categoryKey);

      if (achievements.length === 0) return;

      // Category header
      this.add.text(50, yOffset, categoryInfo.title, {
        fontSize: '20px',
        color: categoryInfo.color,
        fontStyle: 'bold',
        fontFamily: 'Courier New'
      });

      yOffset += 40;

      // Achievements in category
      achievements.forEach(ach => {
        this.createAchievementItem(ach, 50, yOffset, width - 100);
        yOffset += 85;
      });

      yOffset += 10; // Space between categories
    });
  }

  createAchievementItem(achievement, x, y, width) {
    const unlocked = achievement.unlocked;

    // Background card
    const bgColor = unlocked ? 0x2d2d2d : 0x1a1a1a;
    const borderColor = unlocked ? 0xffd700 : 0x444444;

    const bg = this.add.rectangle(x + width / 2, y + 35, width, 75, bgColor, 0.9);
    bg.setStrokeStyle(2, borderColor);

    // Icon (large, left side)
    const icon = this.add.text(x + 20, y + 35, unlocked ? achievement.icon : '🔒', {
      fontSize: '40px'
    }).setOrigin(0, 0.5);

    // Title
    const title = this.add.text(x + 80, y + 15, unlocked ? achievement.title : '???', {
      fontSize: '18px',
      color: unlocked ? '#ffffff' : '#666666',
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5);

    // Description
    const desc = unlocked ? achievement.description : 'Logro secreto - Desbloquealo para ver más detalles';
    const description = this.add.text(x + 80, y + 42, desc, {
      fontSize: '12px',
      color: unlocked ? '#aaaaaa' : '#444444',
      fontFamily: 'Courier New',
      wordWrap: { width: width - 200 }
    }).setOrigin(0, 0.5);

    // Rarity stars (top right)
    let stars = '';
    for (let i = 0; i < achievement.rarity; i++) {
      stars += '⭐';
    }
    const rarityText = this.add.text(x + width - 20, y + 15, stars, {
      fontSize: '14px'
    }).setOrigin(1, 0.5);

    // Points (bottom right)
    const pointsText = this.add.text(x + width - 20, y + 50, `${achievement.points} pts`, {
      fontSize: '14px',
      color: unlocked ? '#ffd700' : '#666666',
      fontFamily: 'Courier New'
    }).setOrigin(1, 0.5);

    // Unlock date (if unlocked)
    if (unlocked && achievement.unlockedAt) {
      const date = new Date(achievement.unlockedAt);
      const dateStr = date.toLocaleDateString('es-AR');
      const unlockDate = this.add.text(x + 80, y + 60, `Desbloqueado: ${dateStr}`, {
        fontSize: '10px',
        color: '#777777',
        fontFamily: 'Courier New'
      }).setOrigin(0, 0.5);
    }
  }

  update() {
    // No special update logic needed
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.AchievementsScene = AchievementsScene;
}
