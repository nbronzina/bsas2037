// KeyboardNavigationManager.js - Sistema de navegación por teclado

class KeyboardNavigationManager {
  constructor(scene) {
    this.scene = scene;
    this.focusableElements = [];
    this.currentFocusIndex = -1;
    this.isEnabled = true;

    this.setupKeyboardListeners();
  }

  setupKeyboardListeners() {
    // TAB - Navegar al siguiente elemento
    this.tabHandler = (event) => {
      if (!this.isEnabled) return;
      event.preventDefault();

      if (event.shiftKey) {
        this.focusPrevious();
      } else {
        this.focusNext();
      }
    };
    this.scene.input.keyboard.on('keydown-TAB', this.tabHandler);

    // ENTER / SPACE - Activar elemento
    this.enterHandler = () => {
      if (!this.isEnabled) return;
      this.activateCurrent();
    };
    this.scene.input.keyboard.on('keydown-ENTER', this.enterHandler);

    this.spaceHandler = () => {
      if (!this.isEnabled) return;
      this.activateCurrent();
    };
    this.scene.input.keyboard.on('keydown-SPACE', this.spaceHandler);

    // Arrow keys para navegación
    this.upHandler = () => {
      if (!this.isEnabled) return;
      this.focusPrevious();
    };
    this.scene.input.keyboard.on('keydown-UP', this.upHandler);

    this.downHandler = () => {
      if (!this.isEnabled) return;
      this.focusNext();
    };
    this.scene.input.keyboard.on('keydown-DOWN', this.downHandler);

    this.leftHandler = () => {
      if (!this.isEnabled) return;
      this.focusPrevious();
    };
    this.scene.input.keyboard.on('keydown-LEFT', this.leftHandler);

    this.rightHandler = () => {
      if (!this.isEnabled) return;
      this.focusNext();
    };
    this.scene.input.keyboard.on('keydown-RIGHT', this.rightHandler);
  }

  // Registrar elemento focuseable
  registerFocusable(element, config = {}) {
    const focusableEntry = {
      element: element,
      onFocus: config.onFocus || null,
      onBlur: config.onBlur || null,
      onActivate: config.onActivate || null,
      label: config.label || 'Button'
    };

    this.focusableElements.push(focusableEntry);

    // Retornar índice para referencia
    return this.focusableElements.length - 1;
  }

  // Limpiar elementos registrados
  clearFocusables() {
    this.focusableElements = [];
    this.currentFocusIndex = -1;
  }

  // Navegar al siguiente elemento
  focusNext() {
    if (this.focusableElements.length === 0) return;

    // Blur actual
    if (this.currentFocusIndex >= 0) {
      this.blurCurrent();
    }

    // Mover al siguiente
    this.currentFocusIndex++;
    if (this.currentFocusIndex >= this.focusableElements.length) {
      this.currentFocusIndex = 0;
    }

    this.focusCurrent();
  }

  // Navegar al elemento anterior
  focusPrevious() {
    if (this.focusableElements.length === 0) return;

    // Blur actual
    if (this.currentFocusIndex >= 0) {
      this.blurCurrent();
    }

    // Mover al anterior
    this.currentFocusIndex--;
    if (this.currentFocusIndex < 0) {
      this.currentFocusIndex = this.focusableElements.length - 1;
    }

    this.focusCurrent();
  }

  // Focus en elemento actual
  focusCurrent() {
    if (this.currentFocusIndex < 0 || this.currentFocusIndex >= this.focusableElements.length) {
      return;
    }

    const entry = this.focusableElements[this.currentFocusIndex];

    // Visual focus indicator
    this.showFocusIndicator(entry.element);

    // Callback custom
    if (entry.onFocus) {
      entry.onFocus(entry.element);
    }

    // Audio feedback
    if (gameState.audioManager) {
      gameState.audioManager.playConfirmSound();
    }

    // Anunciar para screen readers (si implementado)
    this.announceForScreenReader(entry.label);
  }

  // Quitar focus del elemento actual
  blurCurrent() {
    if (this.currentFocusIndex < 0 || this.currentFocusIndex >= this.focusableElements.length) {
      return;
    }

    const entry = this.focusableElements[this.currentFocusIndex];

    // Remover visual indicator
    this.hideFocusIndicator(entry.element);

    // Callback custom
    if (entry.onBlur) {
      entry.onBlur(entry.element);
    }
  }

  // Activar elemento actual (enter/space)
  activateCurrent() {
    if (this.currentFocusIndex < 0 || this.currentFocusIndex >= this.focusableElements.length) {
      return;
    }

    const entry = this.focusableElements[this.currentFocusIndex];

    // Audio feedback
    if (gameState.audioManager) {
      gameState.audioManager.playConfirmSound();
    }

    // Callback de activación
    if (entry.onActivate) {
      entry.onActivate(entry.element);
    }

    // También simular click si el elemento tiene evento pointerdown
    if (entry.element.emit) {
      entry.element.emit('pointerdown');
    }
  }

  // Mostrar indicador de focus
  showFocusIndicator(element) {
    // Guardar estado original
    if (!element._originalStroke) {
      element._originalStroke = {
        width: element.strokeWidth || 0,
        color: element.strokeColor || 0xffffff
      };
    }

    // Aplicar borde de focus
    if (element.setStrokeStyle) {
      const colors = gameState.accessibilityManager.getColors();
      element.setStrokeStyle(3, colors.primary);
    }

    // Scale up ligeramente
    if (!gameState.accessibilityManager.shouldReduceMotion()) {
      this.scene.tweens.add({
        targets: element,
        scaleX: (element.scaleX || 1) * 1.05,
        scaleY: (element.scaleY || 1) * 1.05,
        duration: 100
      });
    }
  }

  // Ocultar indicador de focus
  hideFocusIndicator(element) {
    // Restaurar borde original
    if (element._originalStroke && element.setStrokeStyle) {
      element.setStrokeStyle(
        element._originalStroke.width,
        element._originalStroke.color
      );
    }

    // Restaurar scale
    if (!gameState.accessibilityManager.shouldReduceMotion()) {
      this.scene.tweens.add({
        targets: element,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    }
  }

  // Anunciar para screen readers (básico)
  announceForScreenReader(text) {
    // Crear elemento aria-live para anuncios
    let announcer = document.getElementById('screen-reader-announcer');

    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'screen-reader-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.cssText = 'position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;';
      document.body.appendChild(announcer);
    }

    // Actualizar texto
    announcer.textContent = text;
  }

  // Enable/disable
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Destruir
  destroy() {
    if (this.tabHandler) this.scene.input.keyboard.off('keydown-TAB', this.tabHandler);
    if (this.enterHandler) this.scene.input.keyboard.off('keydown-ENTER', this.enterHandler);
    if (this.spaceHandler) this.scene.input.keyboard.off('keydown-SPACE', this.spaceHandler);
    if (this.upHandler) this.scene.input.keyboard.off('keydown-UP', this.upHandler);
    if (this.downHandler) this.scene.input.keyboard.off('keydown-DOWN', this.downHandler);
    if (this.leftHandler) this.scene.input.keyboard.off('keydown-LEFT', this.leftHandler);
    if (this.rightHandler) this.scene.input.keyboard.off('keydown-RIGHT', this.rightHandler);

    this.clearFocusables();
  }
}

if (typeof window !== 'undefined') {
  window.KeyboardNavigationManager = KeyboardNavigationManager;
}
