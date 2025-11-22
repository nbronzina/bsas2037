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
  return parseInt(hex.replace('#', ''), 16);
}
