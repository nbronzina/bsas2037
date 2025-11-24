// SettingsScene.js - Pantalla de configuración (Audio + Accesibilidad)

class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(data = {}) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const colors = gameState.accessibilityManager.getColors();
    const a11y = gameState.accessibilityManager;

    // Guardar escena de origen para volver
    this.returnScene = data.returnScene || 'MainMenuScene';

    // NUEVO: Keyboard navigation
    this.keyboardNav = new KeyboardNavigationManager(this);

    // Fondo semi-transparente
    this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.9);

    // Panel principal (AUMENTADO para accesibilidad)
    const panelWidth = 600;
    const panelHeight = 700;
    const panel = this.add.rectangle(width/2, height/2, panelWidth, panelHeight, colors.panelBg);
    panel.setStrokeStyle(3, colors.primary);

    // Título
    this.add.text(width/2, 50, '⚙️ CONFIGURACIÓN', {
      fontFamily: 'Courier New',
      fontSize: a11y.getFontSize('28px'),
      color: colors.primaryHex,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    let yPos = 100;
    const sectionSpacing = 35;
    const itemSpacing = 55;

    // ═══════════════════════════════════════════
    // SECCIÓN: AUDIO
    // ═══════════════════════════════════════════

    this.add.text(width/2, yPos, '🔊 AUDIO', {
      fontFamily: 'Courier New',
      fontSize: a11y.getFontSize('20px'),
      color: colors.primaryHex,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    yPos += sectionSpacing;

    // Volumen Música
    this.createSlider(width/2, yPos, 'Música',
      gameState.audioManager?.musicVolume || 0.5,
      (value) => {
        if (gameState.audioManager) {
          gameState.audioManager.setMusicVolume(value);
        }
      }
    );
    yPos += itemSpacing;

    // Volumen SFX
    this.createSlider(width/2, yPos, 'Efectos',
      gameState.audioManager?.sfxVolume || 0.7,
      (value) => {
        if (gameState.audioManager) {
          gameState.audioManager.setSfxVolume(value);
        }
      }
    );
    yPos += itemSpacing + 20;

    // ═══════════════════════════════════════════
    // SECCIÓN: ACCESIBILIDAD
    // ═══════════════════════════════════════════

    this.add.text(width/2, yPos, '♿ ACCESIBILIDAD', {
      fontFamily: 'Courier New',
      fontSize: a11y.getFontSize('20px'),
      color: colors.primaryHex,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    yPos += sectionSpacing;

    // Alto Contraste
    this.createToggle(width/2, yPos, 'Alto Contraste',
      a11y.isHighContrast(),
      (enabled) => {
        a11y.setHighContrast(enabled);
        // Reiniciar scene para aplicar cambios
        this.time.delayedCall(100, () => {
          this.scene.restart();
        });
      }
    );
    yPos += itemSpacing;

    // Tamaño de Texto
    this.createTextSizeSelector(width/2, yPos);
    yPos += itemSpacing;

    // Reducir Animaciones
    this.createToggle(width/2, yPos, 'Reducir\nAnimaciones',
      a11y.shouldReduceMotion(),
      (enabled) => {
        a11y.setReduceMotion(enabled);
      }
    );
    yPos += itemSpacing + 30;

    // ═══════════════════════════════════════════
    // BOTONES
    // ═══════════════════════════════════════════

    // Botón Test SFX
    const testButton = this.add.text(width/2 - 100, yPos, '🔔 Test SFX', {
      fontFamily: 'Courier New',
      fontSize: a11y.getFontSize('16px'),
      color: colors.textHex,
      backgroundColor: colors.panelBgHex,
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    testButton.on('pointerover', () => {
      testButton.setColor(colors.primaryHex);
      testButton.setScale(1.05);
    });

    testButton.on('pointerout', () => {
      testButton.setColor(colors.textHex);
      testButton.setScale(1);
    });

    testButton.on('pointerdown', () => {
      gameState.audioManager?.playConfirmSound();
    });

    this.keyboardNav.registerFocusable(testButton, {
      label: 'Test de sonido',
      onFocus: () => {
        testButton.setColor(colors.primaryHex);
        testButton.setScale(1.05);
      },
      onBlur: () => {
        testButton.setColor(colors.textHex);
        testButton.setScale(1);
      },
      onActivate: () => {
        gameState.audioManager?.playConfirmSound();
      }
    });

    // Botón Volver
    const backButton = this.add.text(width/2 + 100, yPos, '← Volver', {
      fontFamily: 'Courier New',
      fontSize: a11y.getFontSize('16px'),
      color: colors.textHex,
      backgroundColor: colors.panelBgHex,
      padding: { x: 25, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backButton.on('pointerover', () => {
      backButton.setColor(colors.primaryHex);
      backButton.setScale(1.05);
    });

    backButton.on('pointerout', () => {
      backButton.setColor(colors.textHex);
      backButton.setScale(1);
    });

    backButton.on('pointerdown', () => {
      this.closeSettings();
    });

    this.keyboardNav.registerFocusable(backButton, {
      label: 'Volver',
      onFocus: () => {
        backButton.setColor(colors.primaryHex);
        backButton.setScale(1.05);
      },
      onBlur: () => {
        backButton.setColor(colors.textHex);
        backButton.setScale(1);
      },
      onActivate: () => this.closeSettings()
    });

    // Hint de controles
    this.add.text(width/2, height - 20, 'ESC volver • TAB navegar • ENTER seleccionar', {
      fontFamily: 'Courier New',
      fontSize: a11y.getFontSize('12px'),
      color: '#888888'
    }).setOrigin(0.5);

    // Focus inicial
    this.time.delayedCall(100, () => {
      this.keyboardNav.focusNext();
    });

    // ESC para cerrar
    this.input.keyboard.on('keydown-ESC', () => {
      this.closeSettings();
    });
  }

  createSlider(x, y, label, initialValue, onChange) {
    const colors = gameState.accessibilityManager.getColors();
    const a11y = gameState.accessibilityManager;

    const sliderWidth = 200;
    const sliderX = x;

    // Label
    this.add.text(sliderX - 120, y, label, {
      fontFamily: 'Courier New',
      fontSize: a11y.getFontSize('16px'),
      color: colors.textHex
    }).setOrigin(1, 0.5);

    // Slider background
    const sliderBg = this.add.rectangle(sliderX + 30, y, sliderWidth, 8, colors.border);

    // Slider fill
    const fillWidth = initialValue * sliderWidth;
    const sliderFill = this.add.rectangle(
      sliderX + 30 - sliderWidth/2 + fillWidth/2,
      y,
      fillWidth,
      8,
      colors.primary
    ).setOrigin(0.5);

    // Handle
    const handle = this.add.circle(
      sliderX + 30 - sliderWidth/2 + initialValue * sliderWidth,
      y,
      12,
      colors.text
    ).setInteractive({ useHandCursor: true, draggable: true });

    // Value text
    const valueText = this.add.text(sliderX + 160, y, `${Math.round(initialValue * 100)}%`, {
      fontFamily: 'Courier New',
      fontSize: a11y.getFontSize('14px'),
      color: colors.textHex
    }).setOrigin(0, 0.5);

    // Drag handling
    this.input.on('drag', (pointer, gameObject, dragX) => {
      if (gameObject !== handle) return;

      const minX = sliderX + 30 - sliderWidth/2;
      const maxX = sliderX + 30 + sliderWidth/2;
      const newX = Phaser.Math.Clamp(dragX, minX, maxX);

      handle.x = newX;

      const value = (newX - minX) / sliderWidth;

      // Update fill
      sliderFill.width = value * sliderWidth;
      sliderFill.x = minX + (value * sliderWidth) / 2;

      // Update text
      valueText.setText(`${Math.round(value * 100)}%`);

      // Callback
      onChange(value);
    });

    // Keyboard support
    this.keyboardNav.registerFocusable(handle, {
      label: `${label}: ${Math.round(initialValue * 100)}%`,
      onActivate: () => {
        // Toggle between 0, 50, 100 on activate
        const currentValue = (handle.x - (sliderX + 30 - sliderWidth/2)) / sliderWidth;
        let newValue;
        if (currentValue < 0.25) newValue = 0.5;
        else if (currentValue < 0.75) newValue = 1.0;
        else newValue = 0;

        handle.x = sliderX + 30 - sliderWidth/2 + newValue * sliderWidth;
        sliderFill.width = newValue * sliderWidth;
        sliderFill.x = sliderX + 30 - sliderWidth/2 + (newValue * sliderWidth) / 2;
        valueText.setText(`${Math.round(newValue * 100)}%`);
        onChange(newValue);
      }
    });
  }

  createToggle(x, y, label, initialState, onChange) {
    const colors = gameState.accessibilityManager.getColors();
    const a11y = gameState.accessibilityManager;

    let isEnabled = initialState;

    // Label (con soporte para multilinea)
    this.add.text(x - 120, y, label, {
      fontFamily: 'Courier New',
      fontSize: a11y.getFontSize('16px'),
      color: colors.textHex,
      align: 'right',
      lineSpacing: 2
    }).setOrigin(1, 0.5);

    // Toggle background
    const toggleBg = this.add.rectangle(x + 50, y, 60, 30,
      isEnabled ? colors.success : colors.border
    ).setInteractive({ useHandCursor: true });

    // Toggle circle
    const toggleCircle = this.add.circle(
      isEnabled ? x + 65 : x + 35,
      y,
      12,
      colors.text
    );

    // Status text
    const statusText = this.add.text(x + 100, y, isEnabled ? 'ON' : 'OFF', {
      fontFamily: 'Courier New',
      fontSize: a11y.getFontSize('14px'),
      color: isEnabled ? colors.successHex : colors.textHex
    }).setOrigin(0, 0.5);

    // Click handler
    const toggle = () => {
      isEnabled = !isEnabled;

      toggleBg.setFillStyle(isEnabled ? colors.success : colors.border);

      // Animate circle movement
      if (!a11y.shouldReduceMotion()) {
        this.tweens.add({
          targets: toggleCircle,
          x: isEnabled ? x + 65 : x + 35,
          duration: 200,
          ease: 'Power2'
        });
      } else {
        toggleCircle.x = isEnabled ? x + 65 : x + 35;
      }

      statusText.setText(isEnabled ? 'ON' : 'OFF');
      statusText.setColor(isEnabled ? colors.successHex : colors.textHex);

      if (gameState.audioManager) {
        gameState.audioManager.playConfirmSound();
      }

      onChange(isEnabled);
    };

    toggleBg.on('pointerdown', toggle);

    // Keyboard support
    this.keyboardNav.registerFocusable(toggleBg, {
      label: `${label}: ${isEnabled ? 'activado' : 'desactivado'}`,
      onActivate: toggle
    });
  }

  createTextSizeSelector(x, y) {
    const colors = gameState.accessibilityManager.getColors();
    const a11y = gameState.accessibilityManager;
    const currentSize = a11y.getTextSize();

    // Label
    this.add.text(x - 120, y, 'Tamaño Texto', {
      fontFamily: 'Courier New',
      fontSize: a11y.getFontSize('16px'),
      color: colors.textHex
    }).setOrigin(1, 0.5);

    const sizes = [
      { key: 'normal', label: 'Normal' },
      { key: 'large', label: 'Grande' },
      { key: 'xlarge', label: 'XL' }
    ];

    sizes.forEach((size, index) => {
      const btnX = x + 20 + (index * 80);
      const isSelected = currentSize === size.key;

      const btn = this.add.text(btnX, y, size.label, {
        fontFamily: 'Courier New',
        fontSize: a11y.getFontSize('14px'),
        color: isSelected ? colors.primaryHex : colors.textHex,
        backgroundColor: isSelected ? colors.panelBgHex : 'transparent',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => {
        btn.setColor(colors.primaryHex);
      });

      btn.on('pointerout', () => {
        btn.setColor(isSelected ? colors.primaryHex : colors.textHex);
      });

      btn.on('pointerdown', () => {
        a11y.setTextSize(size.key);
        this.time.delayedCall(100, () => {
          this.scene.restart();
        });
      });

      this.keyboardNav.registerFocusable(btn, {
        label: `Tamaño de texto: ${size.label}`,
        onFocus: () => {
          btn.setColor(colors.primaryHex);
        },
        onBlur: () => {
          btn.setColor(isSelected ? colors.primaryHex : colors.textHex);
        },
        onActivate: () => {
          a11y.setTextSize(size.key);
          this.time.delayedCall(100, () => {
            this.scene.restart();
          });
        }
      });
    });
  }

  closeSettings() {
    if (gameState.audioManager) {
      gameState.audioManager.playConfirmSound();
    }

    this.scene.stop();

    // Volver a la scene anterior (cualquiera que haya sido)
    this.scene.resume(this.returnScene);
  }

  shutdown() {
    if (this.keyboardNav) {
      this.keyboardNav.destroy();
    }

    this.input.keyboard.off('keydown-ESC');
  }
}

if (typeof window !== 'undefined') {
  window.SettingsScene = SettingsScene;
}
