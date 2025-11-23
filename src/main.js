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

  // === PANEL DE CONTROLES - FEEDBACK VISUAL ===
  // Listener global para resaltar controles cuando se presionan
  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    let selector = null;

    // Mapeo de teclas a elementos del panel
    if (key === 'w') {
      selector = '[data-key="w"]';
    } else if (key === 'a') {
      selector = '[data-key="a"]';
    } else if (key === 's') {
      selector = '[data-key="s"]';
    } else if (key === 'd') {
      selector = '[data-key="d"]';
    } else if (key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') {
      selector = '[data-key="arrow"]';
    } else if (key === 'enter') {
      selector = '[data-key="enter"]';
    } else if (key === ' ') { // Space
      selector = '[data-key="space"]';
    } else if (key === 'tab') {
      selector = '[data-key="tab"]';
    } else if (key === 'escape') {
      selector = '[data-key="esc"]';
    }

    // Aplicar resaltado visual
    if (selector) {
      const element = document.querySelector(selector);
      if (element) {
        element.classList.add('active');
        setTimeout(() => {
          element.classList.remove('active');
        }, 250);
      }
    }
  });
  // === FIN PANEL DE CONTROLES ===

  // NO iniciar autoguardado aquí - se inicia en MapScene cuando empieza gameplay
  // (Esto previene que se cree un save mientras el usuario está en menús)

  // Log si hay partida guardada (para info del usuario)
  if (gameState.saveManager.hasSavedGame()) {
    const saveInfo = gameState.saveManager.getSaveInfo();
    console.log(`Partida guardada encontrada (Día ${saveInfo.day})`);
  }
});
