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
  completedEncounters: [],           // Array de encounters completados (para debugging/redundancia)
  characters: {
    valeria: { name: 'Valeria', available: true, task: null, taskId: null, taskData: null, daysRemaining: 0 },
    beto: { name: 'Beto', available: true, task: null, taskId: null, taskData: null, daysRemaining: 0 },
    yani: { name: 'Yani', available: true, task: null, taskId: null, taskData: null, daysRemaining: 0 },
    marcos: { name: 'Marcos', available: true, task: null, taskId: null, taskData: null, daysRemaining: 0 }
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
console.log('🎮 Canvas size configured:', GAME_CONFIG.width, 'x', GAME_CONFIG.height);

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: 'game-container',
  backgroundColor: '#000000',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,           // Mantiene aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH,  // Centra el canvas
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    min: {
      width: GAME_CONFIG.width * 0.5,   // Mínimo 50% del tamaño
      height: GAME_CONFIG.height * 0.5
    },
    max: {
      width: GAME_CONFIG.width * 2,      // Máximo 200% del tamaño
      height: GAME_CONFIG.height * 2
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [WelcomeScene, MainMenuScene, IntroScene, InfoScene, MapScene, EncounterScene, ManagementScene, PauseScene, EndGameScene],
  callbacks: {
    preBoot: function (game) {
      console.log('Phaser: preBoot');
    },
    postBoot: function (game) {
      console.log('Phaser: postBoot');
      console.log('Active scene:', game.scene.scenes[0].scene.key);
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
  // Log si hay partida guardada (para info del usuario)
  if (gameState.saveManager.hasSavedGame()) {
    const saveInfo = gameState.saveManager.getSaveInfo();
    console.log(`Partida guardada encontrada (Día ${saveInfo.day})`);
  }
});
