// main.js - Entry point del juego

// Inicializar managers
const resourceManager = new ResourceManager();
const timeManager = new TimeManager();
const saveManager = new SaveManager();
const audioManager = new AudioManager();

// Estado global del juego
const gameState = {
  resourceManager: resourceManager,  // Manager de recursos
  timeManager: timeManager,          // Manager de tiempo
  saveManager: saveManager,          // Manager de guardado
  audioManager: audioManager,        // Manager de audio
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
  scene: [MainMenuScene, IntroScene, InfoScene, MapScene, EncounterScene, ManagementScene, EndGameScene]
};

// Inicializar juego
console.log('Initializing Phaser game...');
console.log('Scene configuration:', config.scene);
const game = new Phaser.Game(config);
console.log('Phaser game initialized');

// Hacer gameState accesible globalmente
window.gameState = gameState;

// Setup inicial
window.addEventListener('load', () => {
  // Iniciar autoguardado
  gameState.saveManager.startAutoSave();

  // Reanudar audio context con primer click (requerido por navegadores)
  document.addEventListener('click', () => {
    gameState.audioManager.resume();
  }, { once: true });

  // Log si hay partida guardada (para info del usuario)
  if (gameState.saveManager.hasSavedGame()) {
    const saveInfo = gameState.saveManager.getSaveInfo();
    console.log(`Partida guardada encontrada (Día ${saveInfo.day})`);
  }
});
