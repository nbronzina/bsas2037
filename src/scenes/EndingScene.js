/**
 * EndingScene - Pantalla de resultado final (Versión Escritorio)
 */

class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' });
  }

  init(data) {
    this.gameOver = data?.gameOver || false;
    this.failedResource = data?.failedResource || null;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo
    this.add.rectangle(width/2, height/2, width, height, 0x1a1a1a);

    // Calcular ending
    const ending = this.calculateEnding();

    // Mostrar ending
    this.showEnding(ending);

    // Fade in
    this.cameras.main.fadeIn(1000);
  }

  calculateEnding() {
    // Game over por recurso a 0
    if (this.gameOver) {
      return {
        id: 'collapse',
        title: '💀 COLAPSO',
        description: `La red no sobrevivió la semana.\n\nEl recurso de ${this.failedResource} llegó a cero, causando una crisis irreversible.\n\nLa comunidad tendrá que empezar de nuevo.`,
        color: '#ff5555'
      };
    }

    // Calcular promedio de recursos
    const resources = Object.values(gameState.resources);
    const average = resources.reduce((a, b) => a + b, 0) / resources.length;
    const min = Math.min(...resources);
    const allAbove50 = resources.every(r => r >= 50);

    if (allAbove50) {
      return {
        id: 'success',
        title: '🏆 RED CONSOLIDADA',
        description: 'La semana termina con la red fortalecida.\n\nTodos los recursos están en buen estado. La comunidad confía en la gestión y mira el futuro con optimismo.\n\nEl trabajo colectivo dio sus frutos.',
        color: '#4CAF50'
      };
    }

    if (min < 20) {
      return {
        id: 'crisis',
        title: '⚠️ CRISIS LATENTE',
        description: 'La semana termina con problemas serios.\n\nAlgunos recursos están en estado crítico. La comunidad está preocupada y habrá que tomar decisiones difíciles la próxima semana.\n\nEl camino sigue siendo incierto.',
        color: '#FF9800'
      };
    }

    return {
      id: 'balance',
      title: '⚖️ EQUILIBRIO FRÁGIL',
      description: 'La semana termina en un equilibrio precario.\n\nLos recursos están estables pero no sobran. La comunidad mantiene la confianza, aunque hay tensiones latentes.\n\nEl trabajo continúa.',
      color: '#2196F3'
    };
  }

  showEnding(ending) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Título
    this.add.text(width/2, 100, ending.title, {
      fontSize: '36px',
      color: ending.color,
      fontStyle: 'bold',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Descripción
    this.add.text(width/2, height/2 - 50, ending.description, {
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: 600 },
      align: 'center',
      lineSpacing: 8,
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Resumen de recursos
    const resources = gameState.getResourcesArray();
    const resourceText = resources.map(r => `${r.icon} ${r.key}: ${r.value}%`).join('   ');

    this.add.text(width/2, height - 180, resourceText, {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Créditos finales
    this.add.text(width/2, height - 150, `💰 Créditos: ${gameState.creditos}`, {
      fontSize: '16px',
      color: gameState.creditos < 0 ? '#ff5555' : '#aaaaaa',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Botón jugar de nuevo
    const btn = this.add.text(width/2, height - 80, '[ Jugar de nuevo ]', {
      fontSize: '20px',
      color: '#ffd700',
      fontFamily: 'Courier New'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#ffd700'));
    btn.on('pointerdown', () => {
      gameState.reset();
      this.scene.start('WelcomeScene');
    });
  }
}

if (typeof window !== 'undefined') {
  window.EndingScene = EndingScene;
}
