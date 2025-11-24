// AccessibilityManager.js - Gestión de configuraciones de accesibilidad

class AccessibilityManager {
  constructor() {
    this.settings = {
      highContrast: false,
      textSize: 'normal', // 'normal', 'large', 'xlarge'
      reduceMotion: false,
      screenReaderMode: false
    };

    this.textSizeMultipliers = {
      'normal': 1.0,
      'large': 1.25,
      'xlarge': 1.5
    };

    this.loadSettings();
  }

  // ═══════════════════════════════════════════
  // HIGH CONTRAST MODE
  // ═══════════════════════════════════════════

  setHighContrast(enabled) {
    this.settings.highContrast = enabled;
    this.saveSettings();
    this.notifySettingsChanged();
  }

  isHighContrast() {
    return this.settings.highContrast;
  }

  // Obtener colores según modo
  getColors() {
    if (this.settings.highContrast) {
      return {
        // Fondo muy oscuro, texto muy claro
        background: 0x000000,
        backgroundHex: '#000000',

        // Texto principal en blanco puro
        text: 0xFFFFFF,
        textHex: '#FFFFFF',

        // Colores de énfasis con alto contraste
        primary: 0xFFFF00,      // Amarillo brillante
        primaryHex: '#FFFF00',

        secondary: 0x00FFFF,    // Cyan brillante
        secondaryHex: '#00FFFF',

        // Estados
        success: 0x00FF00,      // Verde brillante
        successHex: '#00FF00',

        warning: 0xFF0000,      // Rojo brillante
        warningHex: '#FF0000',

        // UI elements
        panelBg: 0x1a1a1a,
        panelBgHex: '#1a1a1a',

        border: 0xFFFFFF,
        borderHex: '#FFFFFF',

        // Recursos (colores distinguibles)
        electricidad: 0xFFFF00,  // Amarillo
        agua: 0x00FFFF,          // Cyan
        legitimidad: 0x00FF00,   // Verde
        autonomia: 0xFF00FF,     // Magenta
        creditos: 0xFFFFFF       // Blanco
      };
    } else {
      return {
        // Modo normal
        background: 0x1a1a1a,
        backgroundHex: '#1a1a1a',

        text: 0xFFFFFF,
        textHex: '#FFFFFF',

        primary: 0xffd700,
        primaryHex: '#ffd700',

        secondary: 0x2196F3,
        secondaryHex: '#2196F3',

        success: 0x4CAF50,
        successHex: '#4CAF50',

        warning: 0xFF5252,
        warningHex: '#FF5252',

        panelBg: 0x2d2d2d,
        panelBgHex: '#2d2d2d',

        border: 0x666666,
        borderHex: '#666666',

        electricidad: 0xffd700,
        agua: 0x2196F3,
        legitimidad: 0x4CAF50,
        autonomia: 0x9C27B0,
        creditos: 0xFFFFFF
      };
    }
  }

  // ═══════════════════════════════════════════
  // TEXT SIZE
  // ═══════════════════════════════════════════

  setTextSize(size) {
    if (['normal', 'large', 'xlarge'].includes(size)) {
      this.settings.textSize = size;
      this.saveSettings();
      this.notifySettingsChanged();
    }
  }

  getTextSize() {
    return this.settings.textSize;
  }

  // Calcular tamaño de fuente ajustado
  getFontSize(baseSize) {
    const multiplier = this.textSizeMultipliers[this.settings.textSize] || 1.0;

    // Si baseSize es string (ej: '16px'), extraer número
    if (typeof baseSize === 'string') {
      const numericSize = parseInt(baseSize, 10);
      return `${Math.round(numericSize * multiplier)}px`;
    }

    // Si es número, retornar número
    return Math.round(baseSize * multiplier);
  }

  // Obtener config de texto con tamaño ajustado
  getTextConfig(baseConfig) {
    return {
      ...baseConfig,
      fontSize: this.getFontSize(baseConfig.fontSize || '16px')
    };
  }

  // ═══════════════════════════════════════════
  // REDUCE MOTION
  // ═══════════════════════════════════════════

  setReduceMotion(enabled) {
    this.settings.reduceMotion = enabled;
    this.saveSettings();
    this.notifySettingsChanged();
  }

  shouldReduceMotion() {
    return this.settings.reduceMotion;
  }

  // Obtener duración de animación (reducida si reduce motion activo)
  getAnimationDuration(baseDuration) {
    if (this.settings.reduceMotion) {
      return Math.min(baseDuration, 100); // Máximo 100ms si reduce motion
    }
    return baseDuration;
  }

  // ═══════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════

  saveSettings() {
    try {
      localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Could not save accessibility settings:', e);
    }
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('accessibilitySettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (e) {
      console.warn('Could not load accessibility settings:', e);
    }
  }

  // ═══════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════

  notifySettingsChanged() {
    // Dispatch event para que scenes puedan actualizar
    window.dispatchEvent(new CustomEvent('accessibilityChanged', {
      detail: this.settings
    }));

    console.log('♿ Accessibility settings changed:', this.settings);
  }

  // ═══════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════

  // Obtener todas las configuraciones
  getSettings() {
    return { ...this.settings };
  }

  // Resetear a valores por defecto
  resetToDefaults() {
    this.settings = {
      highContrast: false,
      textSize: 'normal',
      reduceMotion: false,
      screenReaderMode: false
    };
    this.saveSettings();
    this.notifySettingsChanged();
  }
}

if (typeof window !== 'undefined') {
  window.AccessibilityManager = AccessibilityManager;
}
