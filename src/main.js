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
  scene: [MainMenuScene, IntroScene, InfoScene, MapScene, EncounterScene, ManagementScene, EndGameScene],
  callbacks: {
    preBoot: function (game) {
      console.log('Phaser: preBoot');
    },
    postBoot: function (game) {
      console.log('Phaser: postBoot');
      console.log('Active scene:', game.scene.scenes[0].scene.key);

      // Remove loading message
      const loadingMsg = document.getElementById('loading-message');
      if (loadingMsg) {
        loadingMsg.remove();
        console.log('Loading message removed');
      }
    }
  }
};

// Verificar que el contenedor existe
const container = document.getElementById('game-container');
if (!container) {
  console.error('ERROR: game-container div not found!');
} else {
  console.log('game-container found:', container);
}

// Inicializar juego
console.log('Initializing Phaser game...');
console.log('Scene configuration:', config.scene);
let game;
try {
  game = new Phaser.Game(config);
  console.log('Phaser game initialized:', game);
} catch (error) {
  console.error('ERROR initializing Phaser:', error);
  throw error;
}

// Hacer gameState accesible globalmente
window.gameState = gameState;
window.game = game;

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
