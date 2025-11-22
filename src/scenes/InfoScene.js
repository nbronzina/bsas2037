// InfoScene.js - Información sobre el proyecto

class InfoScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InfoScene' });
  }

  create() {
    // Fondo gris oscuro
    this.add.rectangle(
      0,
      0,
      GAME_CONFIG.width,
      GAME_CONFIG.height,
      0x1a1a1a,
      1
    ).setOrigin(0, 0);

    // Título
    this.add.text(
      GAME_CONFIG.width / 2,
      40,
      'SOBRE ESTE PROYECTO',
      {
        fontSize: '20px',
        color: '#d4a574',
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Contenido principal
    const infoText = `'Red de Aguante' es un prototipo interactivo
de design fiction desarrollado por el LAB de
Mundanidad Forzada en colaboración con
Heated Studio.

METODOLOGÍA

El LAB trabaja con:
· Economías informales como punto de partida
· Restricciones de recursos como material
· Adaptación cotidiana como diseño
· Futuros desde contextos latinoamericanos

CONTEXTO

Este ejercicio parte de prácticas reales
de autogestión en barrios populares
argentinos: recuperación de infraestructura,
redes comunitarias, economías solidarias.

No especula sobre tecnologías futuras.
Sistematiza lo que ya existe.

POSICIONAMIENTO

Este NO es:
· Gamificación de la pobreza
· Romantización de la precariedad
· Solución tecnológica

Esto ES:
· Herramienta de investigación
· Metodología de futuros desde el sur
· Reconocimiento de prácticas existentes

CRÉDITOS

Desarrollo: LAB de Mundanidad Forzada
Colaboración: Heated Studio
Implementación técnica: Claude (Anthropic)
Framework: Phaser 3

LAB de Mundanidad Forzada es un colectivo
de investigación que desarrolla metodologías
de design fiction desde contextos
latinoamericanos.

Argentina · México · Brasil · Colombia`;

    this.add.text(
      40,
      90,
      infoText,
      {
        fontSize: '11px',
        color: '#cccccc',
        fontFamily: 'Courier New',
        lineSpacing: 6,
        wordWrap: { width: 720 }
      }
    ).setOrigin(0, 0);

    // Botón volver
    const backButton = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height - 40,
      '[ VOLVER ]',
      {
        fontSize: '14px',
        color: '#888888',
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    backButton.setInteractive({ useHandCursor: true });

    backButton.on('pointerover', () => {
      backButton.setColor('#d4a574');
    });

    backButton.on('pointerout', () => {
      backButton.setColor('#888888');
    });

    backButton.on('pointerdown', () => {
      gameState.audioManager.playConfirmSound();
      this.scene.start('MainMenuScene');
    });

    // ESC para volver
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MainMenuScene');
    });

    // ENTER para volver
    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('MainMenuScene');
    });
  }
}
