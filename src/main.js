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
  // === PANTALLA DE BIENVENIDA ===
  const overlay = document.getElementById('welcome-overlay');
  let hasStarted = false; // Prevenir múltiples ejecuciones

  function startExperience() {
    if (hasStarted) return;
    hasStarted = true;

    console.log('Iniciando experiencia...');

    // Iniciar/resumir AudioContext
    if (gameState.audioManager.audioContext) {
      gameState.audioManager.audioContext.resume().then(() => {
        console.log('AudioContext resumed');

        // Iniciar música del menú
        gameState.audioManager.playMenuTheme();
        console.log('Menu music started');
      });
    }

    // Fade out del overlay
    overlay.style.transition = 'opacity 0.3s ease-out';
    overlay.style.opacity = '0';

    // Remover del DOM después del fade
    setTimeout(() => {
      overlay.remove();
      console.log('Welcome overlay removed');
    }, 300);
  }

  // Click en cualquier parte del overlay
  overlay.addEventListener('click', startExperience);

  // Cualquier tecla
  document.addEventListener('keydown', function handleFirstKeydown(e) {
    startExperience();
    document.removeEventListener('keydown', handleFirstKeydown);
  });

  // === FIN PANTALLA DE BIENVENIDA ===

  // NO iniciar autoguardado aquí - se inicia en MapScene cuando empieza gameplay
  // (Esto previene que se cree un save mientras el usuario está en menús)

  // Log si hay partida guardada (para info del usuario)
  if (gameState.saveManager.hasSavedGame()) {
    const saveInfo = gameState.saveManager.getSaveInfo();
    console.log(`Partida guardada encontrada (Día ${saveInfo.day})`);
  }
});
