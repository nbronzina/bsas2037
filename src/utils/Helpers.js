// Helpers.js - Funciones auxiliares

/**
 * Crea un sprite placeholder de color sólido
 * @param {Phaser.Scene} scene - La escena de Phaser
 * @param {string} key - Clave del texture
 * @param {number} color - Color hexadecimal (ej: 0xFF0000)
 * @param {number} width - Ancho en píxeles
 * @param {number} height - Alto en píxeles
 */
function createPlaceholderSprite(scene, key, color, width, height) {
  const graphics = scene.add.graphics();
  graphics.fillStyle(color, 1);
  graphics.fillRect(0, 0, width, height);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

/**
 * Calcula la distancia entre dos puntos
 * @param {number} x1 - X del punto 1
 * @param {number} y1 - Y del punto 1
 * @param {number} x2 - X del punto 2
 * @param {number} y2 - Y del punto 2
 * @returns {number} - Distancia
 */
function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Clampea un valor entre min y max
 * @param {number} value - Valor a clampear
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} - Valor clampeado
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Formatea un número con separador de miles
 * @param {number} num - Número a formatear
 * @returns {string} - Número formateado
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Convierte color hex string a número
 * @param {string} hex - Color hex (ej: '#FF0000')
 * @returns {number} - Color como número
 */
function hexToNumber(hex) {
  // CRÍTICO: Null check para evitar crash si hex es undefined
  if (!hex) {
    console.error('hexToNumber: hex is undefined or null');
    return 0x000000;  // Fallback a negro
  }
  return parseInt(hex.replace('#', ''), 16);
}

/**
 * Chequea condiciones de victoria/derrota
 * @returns {Object} - { gameOver: boolean, victory: boolean, victoryType: string, defeatReason: string }
 */
function checkGameOverConditions() {
  const rm = gameState.resourceManager;
  const tm = gameState.timeManager;
  const flags = gameState.flags;

  // Derrota por recursos críticos
  if (rm.get('electricidad') <= 0) {
    return { gameOver: true, victory: false, defeatReason: 'electricidad' };
  }
  if (rm.get('agua') <= 0) {
    return { gameOver: true, victory: false, defeatReason: 'agua' };
  }
  if (rm.get('legitimidad') <= 0) {
    return { gameOver: true, victory: false, defeatReason: 'legitimidad' };
  }

  // Victoria al llegar al día 60
  if (tm.isGameOver()) {
    // Chequear tipo de victoria
    if (flags.includes('victoria_autonomia')) {
      return { gameOver: true, victory: true, victoryType: 'autonomia' };
    } else if (flags.includes('victoria_colectiva')) {
      return { gameOver: true, victory: true, victoryType: 'colectiva' };
    } else if (flags.includes('red_cooperativas')) {
      return { gameOver: true, victory: true, victoryType: 'cooperativas' };
    } else if (rm.get('electricidad') >= 40 && rm.get('agua') >= 40 && rm.get('legitimidad') >= 30) {
      // Victoria por supervivencia básica
      return { gameOver: true, victory: true, victoryType: 'supervivencia' };
    } else {
      // Llegó al día 60 pero con recursos muy bajos (derrota técnica)
      return { gameOver: true, victory: false, defeatReason: 'recursos_criticos' };
    }
  }

  // Juego continúa
  return { gameOver: false };
}

/**
 * Resetea un personaje a su estado inicial
 * @param {Object} char - Objeto de personaje del gameState
 */
function resetCharacter(char) {
  char.available = true;
  char.task = null;
  char.taskId = null;
  char.taskData = null;
  char.daysRemaining = 0;
}
