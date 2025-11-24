// main.js - Entry point del juego

// Inicializar managers
const resourceManager = new ResourceManager();
const timeManager = new TimeManager();
const saveManager = new SaveManager();
const audioManager = new AudioManager();
const achievementManager = new AchievementManager();
const randomEventManager = new RandomEventManager();
const memoriaColectivaManager = new MemoriaColectivaManager();

// Estado global del juego
const gameState = {
  resourceManager: resourceManager,  // Manager de recursos
  timeManager: timeManager,          // Manager de tiempo
  saveManager: saveManager,          // Manager de guardado
  audioManager: audioManager,        // Manager de audio
  achievementManager: achievementManager, // Manager de achievements
  randomEventManager: randomEventManager, // Manager de eventos aleatorios
  memoriaColectiva: memoriaColectivaManager, // Manager de memoria colectiva
  flags: [],
  completedEncounters: [],           // Array de encounters completados (para debugging/redundancia)
  decisionCounters: {                // Contadores de decisiones para finales diferenciados
    decisiones_cooperativas: 0,      // Decisiones que priorizan comunidad
    decisiones_duras: 0,              // Decisiones pragmáticas con costo social
    ayudas_rechazadas: 0,             // Ayudas externas rechazadas
    ayudas_aceptadas: 0               // Ayudas externas aceptadas
  },
  characters: {
    valeria: {
      name: 'Valeria',
      available: true,
      task: null,
      taskId: null,
      taskData: null,
      daysRemaining: 0,
      arc: {
        stage: 1,
        path: null,
        triggers: [],
        lastInteraction: 0,
        relationshipScore: 0
      }
    },
    beto: {
      name: 'Beto',
      available: true,
      task: null,
      taskId: null,
      taskData: null,
      daysRemaining: 0,
      arc: {
        stage: 1,
        path: null,
        triggers: [],
        lastInteraction: 0,
        relationshipScore: 0
      }
    },
    yani: {
      name: 'Yani',
      available: true,
      task: null,
      taskId: null,
      taskData: null,
      daysRemaining: 0,
      arc: {
        stage: 1,
        path: null,
        triggers: [],
        lastInteraction: 0,
        relationshipScore: 0
      }
    },
    marcos: {
      name: 'Marcos',
      available: true,
      task: null,
      taskId: null,
      taskData: null,
      daysRemaining: 0,
      arc: {
        stage: 1,
        path: null,
        triggers: [],
        lastInteraction: 0,
        relationshipScore: 0
      }
    }
  },
  infrastructure: { ...INITIAL_INFRASTRUCTURE },
  tutorialShown: {
    movement: false,
    interact: false,
    encounter: false
  },
  tutorialFlags: {
    tutorial_skipped: false,
    tutorial_recursos_visto: false,
    tutorial_npcs_visto: false,
    tutorial_tareas_visto: false,
    tutorial_dia1_completo: false,
    tutorial_encounter_visto: false,
    tutorial_asamblea_vista: false,

    // Tooltips
    tooltip_recursos_hover: false,
    tooltip_management_hover: false,
    tooltip_archivo_hover: false,
    tooltip_npc_ocupado: false,
    tooltip_creditos_negativos: false,
    tooltip_recurso_critico: false
  },
  tutorialManager: null,
  currentScene: null  // Track active scene for visual feedback
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
  scene: [WelcomeScene, MainMenuScene, IntroScene, InfoScene, MapScene, EncounterScene, ManagementScene, PauseScene, EndGameScene, ThanksScene, TutorialScene, SettingsScene, AchievementsScene, RandomEventScene, ArchivoComunitarioScene],
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
