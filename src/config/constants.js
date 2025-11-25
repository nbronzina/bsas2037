/**
 * Configuración y constantes del juego "Red de Aguante"
 * Buenos Aires 2037 - Clima extremo y gestión de recursos
 */

const GAME_CONFIG = {
  // ═══════════════════════════════════════════
  // DÍAS Y TIEMPO
  // ═══════════════════════════════════════════
  TOTAL_DAYS: 7,
  FIRST_DAY: 1,
  LAST_DAY: 7,

  // ═══════════════════════════════════════════
  // RECURSOS
  // ═══════════════════════════════════════════
  RESOURCE_MIN: 0,
  RESOURCE_MAX: 100,
  RESOURCE_CRITICAL: 20,
  RESOURCE_HEALTHY: 50,
  STARTING_RESOURCES: 60,

  // Créditos
  STARTING_CREDITS: 100,
  MIN_CREDITS: -100,
  MAX_CREDITS: 999,

  // ═══════════════════════════════════════════
  // UI Y TIMING
  // ═══════════════════════════════════════════
  WINDOW_TRANSITION_MS: 300,
  AUTOSAVE_INTERVAL_MS: 30000,
  NOTIFICATION_DURATION_MS: 3000,
  DECISION_FEEDBACK_DELAY_MS: 300,

  // Dimensiones de ventanas
  EMAIL_WINDOW_WIDTH: 700,
  EMAIL_WINDOW_HEIGHT: 500,
  EMAIL_LIST_WIDTH: 220,
  EMAIL_CONTENT_WIDTH: 380,

  // ═══════════════════════════════════════════
  // COLORES WINDOWS 95
  // ═══════════════════════════════════════════
  COLORS: {
    DESKTOP: 0x008080,
    TITLE_BAR: 0x000080,
    TITLE_BAR_ACTIVE: 0x000080,
    TITLE_BAR_INACTIVE: 0x808080,
    WINDOW_BG: 0xc0c0c0,
    BUTTON_FACE: 0xc0c0c0,
    BUTTON_HIGHLIGHT: 0xffffff,
    BUTTON_SHADOW: 0x808080,
    BUTTON_DARK_SHADOW: 0x000000,
    TEXT: 0x000000,
    TEXT_DISABLED: 0x808080,
    LINK: 0x0000ff,
    HIGHLIGHT_BG: 0x000080,
    HIGHLIGHT_TEXT: 0xffffff,
    WHITE: 0xffffff,
    BLACK: 0x000000
  },

  // ═══════════════════════════════════════════
  // PROFUNDIDADES (Z-INDEX)
  // ═══════════════════════════════════════════
  DEPTH: {
    BACKGROUND: 0,
    ICONS: 10,
    TASKBAR: 50,
    WINDOWS: 100,
    ACTIVE_WINDOW: 500,
    TOOLTIPS: 800,
    NOTIFICATIONS: 900,
    MODALS: 1000,
    OVERLAYS: 2000
  },

  // ═══════════════════════════════════════════
  // TEMPERATURAS BUENOS AIRES 2037
  // ═══════════════════════════════════════════
  TEMPERATURES: [42, 38, 41, 39, 43, 37, 40],

  // ═══════════════════════════════════════════
  // HORAS FICTICIAS POR DÍA
  // ═══════════════════════════════════════════
  TIMES: ['09:24', '14:32', '12:18', '15:47', '10:56', '16:23', '11:09'],

  // ═══════════════════════════════════════════
  // NOMBRES DE DÍAS
  // ═══════════════════════════════════════════
  DAY_NAMES: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  SHORT_DAY_NAMES: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],

  // ═══════════════════════════════════════════
  // ICONOS DE RECURSOS
  // ═══════════════════════════════════════════
  RESOURCE_ICONS: {
    electricidad: '⚡',
    agua: '💧',
    legitimidad: '🤝',
    autonomia: '🏴',
    creditos: '💰'
  },

  RESOURCE_NAMES: {
    electricidad: 'Electricidad',
    agua: 'Agua',
    legitimidad: 'Legitimidad',
    autonomia: 'Autonomía',
    creditos: 'Créditos'
  },

  // ═══════════════════════════════════════════
  // CONFIGURACIÓN DE SAVE
  // ═══════════════════════════════════════════
  SAVE_VERSION: 2,
  SAVE_KEY: 'redDeAguante_v2_save',
  SETTINGS_KEY: 'redDeAguante_v2_settings',

  // ═══════════════════════════════════════════
  // CONFIGURACIÓN DE AUDIO
  // ═══════════════════════════════════════════
  DEFAULT_MUSIC_VOLUME: 0.5,
  DEFAULT_SFX_VOLUME: 0.7,

  // ═══════════════════════════════════════════
  // LÍMITES DE TEXTO
  // ═══════════════════════════════════════════
  EMAIL_TITLE_MAX_LENGTH: 18,
  MAX_EMAILS_TO_SHOW: 3,
  MAX_READ_EMAILS_SHOWN: 5
};

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.GAME_CONFIG = GAME_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME_CONFIG;
}
