// IntroScene.js - Introducción narrativa (formato: notas de investigación)

class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
    this.currentScreen = 0;
    this.screens = [];
  }

  create() {
    // NUEVO: Track scene
    gameState.currentScene = this;

    // Definir pantallas de introducción
    this.screens = [
      // Pantalla 1: Identificación del prototipo
      {
        title: 'PROTOTIPO DE INVESTIGACIÓN',
        subtitle: 'LAB de Mundanidad Forzada',
        body: `Este ejercicio explora futuros posibles
desde contextos latinoamericanos.

No predice. No prescribe.
Observa lo que ya está aquí.`
      },

      // Pantalla 2: Punto de partida metodológico
      {
        title: 'PUNTO DE PARTIDA',
        subtitle: null,
        body: `Buenos Aires, como muchas ciudades
latinoamericanas, opera en economías
híbridas: formal/informal.

Sus habitantes ya practican autogestión
de servicios ante fallas del Estado
y el mercado.

¿Qué pasa cuando esto se vuelve norma?`
      },

      // Pantalla 3: Contexto específico
      {
        title: 'ESCENARIO: Villa Soldati, Buenos Aires',
        subtitle: null,
        body: `Una asamblea barrial autogestiona
infraestructura básica:

· Transformadores eléctricos recuperados
· Perforación de agua no autorizada
· Red de distribución comunitaria

No es utopía.
Es lo que ya existe en muchos barrios,
sistematizado.`
      },

      // Pantalla 4: Mecánica del ejercicio
      {
        title: 'EL EJERCICIO',
        subtitle: null,
        body: `60 días manteniendo:
· Agua corriente
· Electricidad
· Alimentación colectiva

Con:
· Infraestructura precaria
· Recursos limitados
· Presiones externas

Las decisiones no son 'buenas' o 'malas'.
Son negociaciones constantes.`
      },

      // Pantalla 5: Posicionamiento crítico
      {
        title: null,
        subtitle: null,
        body: `Este prototipo usa restricciones reales
como material de diseño.

La mundanidad forzada no es estética.
Es metodología.


DÍA 1`
      }
    ];

    // Crear pantalla inicial
    this.showScreen(0);

    // Configurar controles
    this.setupControls();
  }

  showScreen(index) {
    // Limpiar pantalla anterior
    this.children.removeAll();

    const screen = this.screens[index];

    // Fondo negro
    this.add.rectangle(
      0,
      0,
      GAME_CONFIG.width,
      GAME_CONFIG.height,
      0x000000,
      1
    ).setOrigin(0, 0);

    let currentY = 100;

    // Título (si existe)
    if (screen.title) {
      this.add.text(
        GAME_CONFIG.width / 2,
        currentY,
        screen.title,
        {
          fontSize: '18px',
          color: '#d4a574', // Terracota
          fontFamily: 'Courier New',
          fontStyle: 'bold',
          align: 'center'
        }
      ).setOrigin(0.5);

      currentY += 40;
    }

    // Subtítulo (si existe)
    if (screen.subtitle) {
      this.add.text(
        GAME_CONFIG.width / 2,
        currentY,
        screen.subtitle,
        {
          fontSize: '12px',
          color: '#888888',
          fontFamily: 'Courier New',
          align: 'center'
        }
      ).setOrigin(0.5);

      currentY += 50;
    } else if (screen.title) {
      currentY += 30;
    }

    // Cuerpo del texto
    this.add.text(
      GAME_CONFIG.width / 2,
      currentY,
      screen.body,
      {
        fontSize: '14px',
        color: '#cccccc',
        fontFamily: 'Courier New',
        align: 'center',
        lineSpacing: 8,
        wordWrap: { width: 600 }
      }
    ).setOrigin(0.5, 0);

    // Indicador de progreso
    const progressText = `${index + 1} / ${this.screens.length}`;
    this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height - 80,
      progressText,
      {
        fontSize: '11px',
        color: '#555555',
        fontFamily: 'Courier New'
      }
    ).setOrigin(0.5);

    // Instrucción
    const instruction = index < this.screens.length - 1
      ? '[ENTER] continuar'
      : '[ENTER] iniciar ejercicio';

    this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height - 50,
      instruction,
      {
        fontSize: '12px',
        color: '#888888',
        fontFamily: 'Courier New'
      }
    ).setOrigin(0.5);

    this.currentScreen = index;
  }

  setupControls() {
    // ENTER para avanzar
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // SPACE como alternativa
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // ESC para saltar intro (volver a menú)
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MainMenuScene');
    });
  }

  update() {
    // Avanzar con ENTER o SPACE
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) ||
        Phaser.Input.Keyboard.JustDown(this.spaceKey)) {

      gameState.audioManager.playConfirmSound();

      if (this.currentScreen < this.screens.length - 1) {
        // Siguiente pantalla
        this.showScreen(this.currentScreen + 1);
      } else {
        // Última pantalla: ir al juego
        this.startGame();
      }
    }
  }

  startGame() {
    // Ir directamente al mapa (sin tutorial por ahora)
    this.scene.start('MapScene');
  }

  shutdown() {
    // Cleanup keyboard listeners
    this.input.keyboard.off('keydown-ESC');
  }
}
