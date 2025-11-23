// ControlsPanel.js - Panel de controles integrado en el canvas

class ControlsPanel {
  constructor(scene, x = null, y = null) {
    this.scene = scene;

    // Nueva posición: centrado verticalmente en el lado derecho
    const panelHeight = 280;  // Altura del panel
    const defaultX = scene.cameras.main.width - 220;  // 20px margen desde derecha
    const defaultY = (scene.cameras.main.height - panelHeight) / 2;  // Centrado vertical perfecto

    this.x = x !== null ? x : defaultX;
    this.y = y !== null ? y : defaultY;

    this.create();
  }

  create() {
    const panelWidth = 200;
    const panelHeight = 280;

    // Contenedor
    this.container = this.scene.add.container(this.x, this.y);
    this.container.setDepth(1000);
    this.container.setScrollFactor(0);  // Fijo en pantalla

    // Fondo
    const bg = this.scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x2a2a2a);
    bg.setOrigin(0, 0);
    bg.setAlpha(0.95);
    this.container.add(bg);

    // Borde
    const border = this.scene.add.rectangle(0, 0, panelWidth, panelHeight);
    border.setOrigin(0, 0);
    border.setStrokeStyle(2, 0xd4a574);
    border.isFilled = false;
    this.container.add(border);

    // Título
    const title = this.scene.add.text(panelWidth / 2, 12, 'CONTROLES', {
      fontFamily: 'Courier New',
      fontSize: '13px',
      color: '#d4a574',
      fontStyle: 'bold',
      letterSpacing: 2
    });
    title.setOrigin(0.5, 0);
    this.container.add(title);

    // Línea separadora
    const line = this.scene.add.rectangle(10, 30, panelWidth - 20, 1, 0x555555);
    line.setOrigin(0, 0);
    this.container.add(line);

    // Controles
    const controls = [
      '[W] ↑  Mover arriba',
      '[A] ←  Mover izq.',
      '[S] ↓  Mover abajo',
      '[D] →  Mover der.',
      '',
      '[↑↓] Navegar',
      '',
      '[ENTER] Seleccionar',
      '[SPACE] Avanzar',
      '[TAB] Gestión',
      '[ESC] Menú'
    ];

    let yPos = 40;
    controls.forEach(text => {
      if (text) {
        const controlText = this.scene.add.text(10, yPos, text, {
          fontFamily: 'Courier New',
          fontSize: '11px',
          color: '#cccccc'
        });
        controlText.setOrigin(0, 0);
        this.container.add(controlText);
      }
      yPos += text ? 18 : 10;
    });
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
    }
  }

  setVisible(visible) {
    if (this.container) {
      this.container.setVisible(visible);
    }
  }
}
