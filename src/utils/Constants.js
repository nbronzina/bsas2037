// Constants.js - Constantes globales del juego

const COLORS = {
  // Cielo y ambiente
  sky: '#8B7355',          // Gris-amarillento (contaminación)

  // Agua
  riachuelo: '#4A3C28',    // Marrón oscuro
  rioPlata: '#5C6B73',     // Gris-verde

  // Sur CABA (Villa Soldati)
  tierra: '#8B6914',       // Ocre
  chapa: '#6C757D',        // Gris metal
  ladrillo: '#A0522D',     // Rojo ladrillo
  verde: '#556B2F',        // Verde desteñido

  // UI
  cooperativa: '#FFB347',  // Naranja cálido (banderas)
  emergencia: '#DC143C',   // Rojo alerta
  exito: '#32CD32',        // Verde éxito
  texto: '#FFFFFF',        // Blanco texto
  textoOscuro: '#212529',  // Negro/gris oscuro
  panel: '#2C3E50',        // Azul oscuro UI

  // Recursos
  creditos: '#FFD700',     // Dorado
  electricidad: '#FFA500', // Naranja
  agua: '#4682B4',         // Azul
  legitimidad: '#9370DB',  // Púrpura
  autonomia: '#228B22'     // Verde bosque
};

const GAME_CONFIG = {
  width: 900,
  height: 540,
  tileSize: 16,
  mapWidth: 50,
  mapHeight: 50,
  maxDays: 60,
  startDay: 1,
  debug: false  // Set to true para habilitar debug keys en producción
};

const RESOURCE_ICONS = {
  creditos: '💰',
  electricidad: '⚡',
  agua: '💧',
  legitimidad: '🤝',
  autonomia: '🔗'
};

const CONTROLS = {
  interact: 'ENTER',
  menu: 'TAB',
  pause: 'ESC'
};
