// SettingsScene.js - Pantalla de configuración de audio

class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(data = {}) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Guardar escena de origen para volver
    this.returnScene = data.returnScene || 'MainMenuScene';

    // Fondo semi-transparente
    this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.9);

    // Panel principal (AUMENTADO para mejor espaciado de botones)
    const panelWidth = 600;
    const panelHeight = 550;
    const panel = this.add.rectangle(width/2, height/2, panelWidth, panelHeight, 0x2d2d2d);
    panel.setStrokeStyle(3, 0xffd700);

    // Título
    this.add.text(width/2, height/2 - 220, 'CONFIGURACIÓN', {
      fontFamily: 'Courier New',
      fontSize: '32px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtítulo
    this.add.text(width/2, height/2 - 180, 'Controles de Audio', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // === VOLUMEN MASTER ===
    const masterY = height/2 - 120;
    this.add.text(width/2 - 250, masterY, '🔊 Volumen General', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#ffffff'
    });

    this.masterVolumeText = this.add.text(width/2 + 200, masterY, `${Math.round(gameState.audioManager.volume * 100)}%`, {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#ffd700'
    }).setOrigin(1, 0);

    this.createSlider(
      width/2 - 250,
      masterY + 30,
      400,
      gameState.audioManager.volume,
      (value) => {
        gameState.audioManager.setVolume(value);
        this.masterVolumeText.setText(`${Math.round(value * 100)}%`);
      }
    );

    // === VOLUMEN MÚSICA ===
    const musicY = height/2 - 30;
    this.add.text(width/2 - 250, musicY, '🎵 Volumen Música', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#ffffff'
    });

    this.musicVolumeText = this.add.text(width/2 + 200, musicY, `${Math.round(gameState.audioManager.musicVolume * 100)}%`, {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#ffd700'
    }).setOrigin(1, 0);

    this.createSlider(
      width/2 - 250,
      musicY + 30,
      400,
      gameState.audioManager.musicVolume,
      (value) => {
        gameState.audioManager.setMusicVolume(value);
        this.musicVolumeText.setText(`${Math.round(value * 100)}%`);
      }
    );

    // === VOLUMEN SFX ===
    const sfxY = height/2 + 60;
    this.add.text(width/2 - 250, sfxY, '🔔 Volumen Efectos', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#ffffff'
    });

    this.sfxVolumeText = this.add.text(width/2 + 200, sfxY, `${Math.round(gameState.audioManager.sfxVolume * 100)}%`, {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#ffd700'
    }).setOrigin(1, 0);

    this.createSlider(
      width/2 - 250,
      sfxY + 30,
      400,
      gameState.audioManager.sfxVolume,
      (value) => {
        gameState.audioManager.setSfxVolume(value);
        this.sfxVolumeText.setText(`${Math.round(value * 100)}%`);
      }
    );

    // === BOTONES (reposicionados para evitar solapamiento) ===
    const buttonsY = height/2 + 160;
    const muteIcon = gameState.audioManager.muted ? '🔇' : '🔊';
    const muteText = gameState.audioManager.muted ? 'Dessilenciar' : 'Silenciar Todo';

    // Botón Silenciar (izquierda)
    this.muteButton = this.createButton(
      width/2 - 130,
      buttonsY,
      `${muteIcon} ${muteText}`,
      () => this.toggleMute(),
      0x555555,
      220
    );

    // Botón Test SFX (derecha, misma fila)
    this.createButton(
      width/2 + 120,
      buttonsY,
      '🔔 Test SFX',
      () => {
        gameState.audioManager.playConfirmSound();
      },
      0x444444,
      180
    );

    // Botón Cerrar (centrado abajo, con mejor espaciado)
    this.createButton(
      width/2,
      height/2 + 240,
      'Cerrar',
      () => this.closeSettings(),
      0x444444,
      300
    );

    // Tecla ESC para cerrar
    this.input.keyboard.on('keydown-ESC', () => {
      this.closeSettings();
    });
  }

  /**
   * Crear un slider interactivo
   */
  createSlider(x, y, width, initialValue, onChange) {
    const height = 8;

    // Track (fondo del slider)
    const track = this.add.rectangle(x + width/2, y, width, height, 0x555555);
    track.setOrigin(0.5, 0);

    // Fill (parte llena del slider)
    const fillWidth = width * initialValue;
    const fill = this.add.rectangle(x, y, fillWidth, height, 0xffd700);
    fill.setOrigin(0, 0);

    // Handle (círculo arrastrable)
    const handleX = x + (width * initialValue);
    const handle = this.add.circle(handleX, y + height/2, 12, 0xffd700);
    handle.setStrokeStyle(2, 0xffffff);
    handle.setInteractive({ draggable: true });

    // Drag events
    handle.on('drag', (pointer, dragX) => {
      // Limitar movimiento al track
      const clampedX = Phaser.Math.Clamp(dragX, x, x + width);
      handle.x = clampedX;

      // Actualizar fill
      const newFillWidth = clampedX - x;
      fill.width = newFillWidth;

      // Calcular valor (0-1)
      const value = (clampedX - x) / width;
      onChange(value);
    });

    // Click en el track para mover el handle
    track.setInteractive();
    track.on('pointerdown', (pointer) => {
      const clampedX = Phaser.Math.Clamp(pointer.x, x, x + width);
      handle.x = clampedX;

      // Actualizar fill
      const newFillWidth = clampedX - x;
      fill.width = newFillWidth;

      // Calcular valor (0-1)
      const value = (clampedX - x) / width;
      onChange(value);
    });

    return { track, fill, handle };
  }

  /**
   * Crear un botón interactivo
   */
  createButton(x, y, text, onClick, color = 0x444444, width = 300) {
    const button = this.add.rectangle(x, y, width, 50, color);
    button.setStrokeStyle(2, 0xffd700);
    button.setInteractive();

    const buttonText = this.add.text(x, y, text, {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Hover effect
    button.on('pointerover', () => {
      button.setFillStyle(0x666666);
      buttonText.setColor('#ffd700');
    });

    button.on('pointerout', () => {
      button.setFillStyle(color);
      buttonText.setColor('#ffffff');
    });

    // Click
    button.on('pointerdown', () => {
      gameState.audioManager?.playConfirmSound();
      onClick();
    });

    return { button, text: buttonText };
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    const isMuted = gameState.audioManager.toggleMute();

    // Actualizar texto del botón
    const muteIcon = isMuted ? '🔇' : '🔊';
    const muteText = isMuted ? 'Dessilenciar' : 'Silenciar Todo';
    this.muteButton.text.setText(`${muteIcon} ${muteText}`);

    if (!isMuted) {
      gameState.audioManager.playConfirmSound();
    }
  }

  /**
   * Cerrar configuración
   */
  closeSettings() {
    gameState.audioManager?.playConfirmSound();
    this.scene.stop();
    this.scene.resume(this.returnScene);
  }
}
