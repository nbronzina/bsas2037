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
 * SISTEMA DE 8 FINALES DIFERENCIADOS
 * @returns {Object} - { gameOver: boolean, victory: boolean, victoryType: string, defeatReason: string }
 */
function checkGameOverConditions() {
  const rm = gameState.resourceManager;
  const tm = gameState.timeManager;
  const flags = gameState.flags;
  const counters = gameState.decisionCounters;
  const currentDay = tm.getCurrentDay();

  // === PRIORIDAD 1: DERROTAS ESPECIALES ===

  // 8. TRAICIÓN DEL SISTEMA (ayuda municipal + cierre administrativo)
  if (flags.includes('ayuda_municipal') && flags.includes('inspeccion_cerro_red')) {
    return { gameOver: true, victory: false, defeatReason: 'traicion_sistema' };
  }

  // 7. COLAPSO CAÓTICO (recursos = 0 antes de día 40)
  if (currentDay < 40) {
    let recursosEnCero = 0;
    if (rm.get('electricidad') <= 0) recursosEnCero++;
    if (rm.get('agua') <= 0) recursosEnCero++;

    if (recursosEnCero >= 2) {
      return { gameOver: true, victory: false, defeatReason: 'colapso_caotico' };
    }
  }

  // Derrotas por recursos críticos individuales (cualquier día)
  if (rm.get('electricidad') <= 0) {
    return { gameOver: true, victory: false, defeatReason: 'electricidad' };
  }
  if (rm.get('agua') <= 0) {
    return { gameOver: true, victory: false, defeatReason: 'agua' };
  }
  if (rm.get('legitimidad') <= 0) {
    return { gameOver: true, victory: false, defeatReason: 'legitimidad' };
  }

  // 6. ÉXODO PACÍFICO (evacuación organizada entre días 40-59)
  if (flags.includes('evacuacion_organizada')) {
    return { gameOver: true, victory: false, defeatReason: 'exodo_pacifico' };
  }

  // === PRIORIDAD 2: VICTORIAS AL LLEGAR A DÍA 60 ===
  if (tm.isGameOver()) {
    // Generar flags automáticos basados en estado final
    generateAutomaticFlags();

    // 1. UTOPÍA EN RUINAS (Mejor Final)
    if (
      flags.includes('autonomia_mantenida') &&
      flags.includes('comunidad_fuerte') &&
      flags.includes('cooperacion_alta')
    ) {
      return { gameOver: true, victory: true, victoryType: 'utopia_ruinas' };
    }

    // 5. RESISTENCIA HEROICA (Final Secreto Positivo)
    if (
      flags.includes('rechazo_total_ayuda') &&
      flags.includes('comunidad_unida') &&
      rm.get('legitimidad') > 70 &&
      (rm.get('electricidad') < 40 || rm.get('agua') < 40)
    ) {
      return { gameOver: true, victory: true, victoryType: 'resistencia_heroica' };
    }

    // 2. RED QUE SE EXPANDE
    if (
      flags.includes('union_red_vecina') &&
      flags.includes('autonomia_parcial') &&
      !flags.includes('ayuda_municipal') &&
      rm.get('electricidad') >= 50 && rm.get('agua') >= 50
    ) {
      return { gameOver: true, victory: true, victoryType: 'red_expande' };
    }

    // 4. DEPENDENCIA INEVITABLE (Victoria ambigua)
    if (
      flags.includes('ayuda_municipal') &&
      flags.includes('autonomia_perdida')
    ) {
      return { gameOver: true, victory: true, victoryType: 'dependencia_inevitable' };
    }

    // 3. SUPERVIVENCIA AMARGA
    if (
      flags.includes('decisiones_duras') &&
      flags.includes('personas_perdidas') &&
      rm.get('electricidad') > 30 && rm.get('agua') > 30 &&
      rm.get('legitimidad') < 50
    ) {
      return { gameOver: true, victory: true, victoryType: 'supervivencia_amarga' };
    }

    // VICTORIA ESTÁNDAR (fallback si recursos OK)
    if (rm.get('electricidad') >= 40 && rm.get('agua') >= 40 && rm.get('legitimidad') >= 30) {
      return { gameOver: true, victory: true, victoryType: 'supervivencia' };
    }

    // DERROTA por recursos críticos en día 60
    return { gameOver: true, victory: false, defeatReason: 'recursos_criticos' };
  }

  // Juego continúa
  return { gameOver: false };
}

/**
 * Genera flags automáticos basados en el estado final del juego
 * Llamado en día 60 para determinar condiciones de victoria
 */
function generateAutomaticFlags() {
  const rm = gameState.resourceManager;
  const flags = gameState.flags;
  const counters = gameState.decisionCounters;

  console.log('=== GENERANDO FLAGS AUTOMÁTICOS DÍA 60 ===');

  // Flag: comunidad_fuerte (legitimidad >75% en promedio últimos 10 días)
  // Por ahora simplificado: legitimidad >75% en día 60
  if (rm.get('legitimidad') > 75) {
    if (!flags.includes('comunidad_fuerte')) {
      flags.push('comunidad_fuerte');
      console.log('✓ Flag generado: comunidad_fuerte');
    }
  }

  // Flag: comunidad_unida (0 NPCs perdidos + >5 decisiones cooperativas)
  if (!flags.includes('personas_perdidas') && counters.decisiones_cooperativas > 5) {
    if (!flags.includes('comunidad_unida')) {
      flags.push('comunidad_unida');
      console.log('✓ Flag generado: comunidad_unida');
    }
  }

  // Flag: rechazo_total_ayuda (rechazaron TODAS las ayudas)
  if (counters.ayudas_rechazadas >= 3 && counters.ayudas_aceptadas === 0) {
    if (!flags.includes('rechazo_total_ayuda')) {
      flags.push('rechazo_total_ayuda');
      console.log('✓ Flag generado: rechazo_total_ayuda');
    }
  }

  // Flag: cooperacion_alta (>5 decisiones cooperativas)
  if (counters.decisiones_cooperativas > 5) {
    if (!flags.includes('cooperacion_alta')) {
      flags.push('cooperacion_alta');
      console.log('✓ Flag generado: cooperacion_alta');
    }
  }

  // Flag: decisiones_duras (>3 decisiones pragmáticas duras)
  if (counters.decisiones_duras > 3) {
    if (!flags.includes('decisiones_duras')) {
      flags.push('decisiones_duras');
      console.log('✓ Flag generado: decisiones_duras');
    }
  }

  // Flag: autonomia_mantenida (autonomía en TODOS los encounters críticos)
  if (
    flags.includes('autonomia_mantenida_1') &&
    flags.includes('autonomia_mantenida_2') &&
    !flags.includes('ayuda_municipal')
  ) {
    if (!flags.includes('autonomia_mantenida')) {
      flags.push('autonomia_mantenida');
      console.log('✓ Flag generado: autonomia_mantenida');
    }
  }

  console.log('Flags finales:', flags);
  console.log('Counters finales:', counters);
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
