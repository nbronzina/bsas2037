/**
 * main.js - Entry point (Versión Escritorio)
 * Versión simplificada sin mapa ni managers complejos
 */

// ═══════════════════════════════════════════
// PHASER CONFIGURATION
// ═══════════════════════════════════════════

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#1a1a1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },
  scene: [WelcomeScene, DeskScene, EndingScene],
  callbacks: {
    preBoot: function (game) {
      console.log('🎮 Phaser preBoot - Red de Aguante (Desk Version)');
    },
    postBoot: function (game) {
      console.log('✅ Phaser postBoot - Game ready');
    }
  }
};

// ═══════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════

window.addEventListener('DOMContentLoaded', () => {
  console.log('🔄 Loading documents...');

  // Fetch documents data
  fetch('data/documents.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`📄 Loaded ${data.documents.length} documents`);

      // Initialize DocumentManager
      gameState.documentManager = new DocumentManager();
      gameState.documentManager.loadDocuments(data.documents);

      console.log('📋 DocumentManager initialized');

      // Initialize SaveManager
      gameState.saveManager = new SaveManager();

      // Cargar settings si hay
      const settings = gameState.saveManager.loadSettings();
      // Aplicar settings si hay AudioManager, etc.

      console.log('💾 SaveManager initialized');

      // Create Phaser game
      const game = new Phaser.Game(config);
      window.game = game;

      console.log('🎮 Game started - Red de Aguante (Escritorio)');
    })
    .catch(error => {
      console.error('❌ Error loading documents:', error);
      document.getElementById('game-container').innerHTML =
        `<div style="color: white; padding: 20px; font-family: monospace;">
          <h2>Error al cargar el juego</h2>
          <p>No se pudieron cargar los documentos.</p>
          <p style="color: #ff5555;">${error.message}</p>
          <p>Por favor, verifica que el archivo data/documents.json existe.</p>
        </div>`;
    });
});

// ═══════════════════════════════════════════
// DEBUG MODE TOGGLE (F3)
// ═══════════════════════════════════════════

document.addEventListener('keydown', (e) => {
  // F3 para toggle debug mode
  if (e.key === 'F3') {
    e.preventDefault();
    gameState.debugMode = !gameState.debugMode;
    console.log(`🔧 Debug mode: ${gameState.debugMode ? 'ON' : 'OFF'}`);

    if (gameState.debugMode) {
      console.log('📊 === GAME STATE ===');
      console.log('Day:', gameState.currentDay, '/', gameState.maxDays);
      console.log('Resources:', gameState.resources);
      console.log('Créditos:', gameState.creditos);
      console.log('Documents today:', gameState.documentsToday.length);
      console.log('Current index:', gameState.currentDocumentIndex);
      console.log('Completed:', gameState.completedDocuments.length);
      console.log('Flags:', gameState.flags);
      console.log('====================');
    }
  }

  // F4 para log de documento actual (solo en debug mode)
  if (e.key === 'F4' && gameState.debugMode) {
    e.preventDefault();
    const doc = gameState.getCurrentDocument();
    if (doc) {
      console.log('📄 === CURRENT DOCUMENT ===');
      console.log('ID:', doc.id);
      console.log('Sender:', doc.sender);
      console.log('Title:', doc.title);
      console.log('Type:', doc.type);
      console.log('Options:', doc.options.length);
      console.log('===========================');
    } else {
      console.log('No document active');
    }
  }
});

// ═══════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.PhaserConfig = config;
}
