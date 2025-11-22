// main.js - Entry point del juego

// Inicializar managers
const resourceManager = new ResourceManager();
const timeManager = new TimeManager();
const saveManager = new SaveManager();

// Estado global del juego
const gameState = {
  resourceManager: resourceManager,  // Manager de recursos
  timeManager: timeManager,          // Manager de tiempo
  saveManager: saveManager,          // Manager de guardado
  flags: [],
  characters: {
    valeria: { name: 'Valeria', available: true, task: null, daysRemaining: 0 },
    beto: { name: 'Beto', available: true, task: null, daysRemaining: 0 },
    yani: { name: 'Yani', available: true, task: null, daysRemaining: 0 }
  },
  infrastructure: {
    transformadorA: 90,
    transformadorB: 40,
    perforacion1: 100
  },
  tutorialShown: {
    movement: false,
    interact: false,
    encounter: false
  }
};

// Configuración de Phaser
const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: 'game-container',
  backgroundColor: '#000000',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MapScene, EncounterScene, ManagementScene, EndGameScene]
};

// Inicializar juego
const game = new Phaser.Game(config);

// Hacer gameState accesible globalmente
window.gameState = gameState;

// Intentar cargar partida guardada al inicio
window.addEventListener('load', () => {
  if (gameState.saveManager.hasSavedGame()) {
    const saveInfo = gameState.saveManager.getSaveInfo();
    console.log(`Partida guardada encontrada (Día ${saveInfo.day}, ${saveInfo.date})`);
    console.log('Se cargará automáticamente. Presiona ESC para nueva partida.');

    // Cargar automáticamente después de 2 segundos
    setTimeout(() => {
      gameState.saveManager.load();
    }, 2000);
  }

  // Iniciar autoguardado
  gameState.saveManager.startAutoSave();
});
