/**
 * WindowsUI - Utilidades para crear UI estilo Windows 95/98
 * Funciones reutilizables para mantener consistencia visual
 */

const WIN95_COLORS = {
  desktop: 0x008080,          // Teal del escritorio
  titleBarActive: 0x000080,   // Azul oscuro barra título
  titleBarInactive: 0x808080, // Gris para ventanas inactivas
  titleBarGradient: 0x1084d0, // Azul más claro para degradado
  window: 0xc0c0c0,           // Gris de ventanas
  buttonFace: 0xc0c0c0,       // Gris de botones
  buttonHighlight: 0xffffff,  // Borde superior/izquierdo (luz)
  buttonShadow: 0x808080,     // Borde inferior/derecho (sombra)
  buttonDarkShadow: 0x000000, // Sombra más oscura
  text: 0x000000,
  textInactive: 0x808080,
  textHighlight: 0xffffff,
  highlightBg: 0x000080,      // Fondo de selección
  menuBar: 0xc0c0c0,
  black: 0x000000,
  white: 0xffffff
};

class WindowsUI {
  constructor(scene) {
    this.scene = scene;
    this.colors = WIN95_COLORS;
  }

  /**
   * Crea un borde 3D biselado (efecto elevado o hundido)
   */
  create3DBorder(container, x, y, width, height, raised = true) {
    const offset = 2;

    if (raised) {
      // Borde superior (blanco - luz)
      const topLight = this.scene.add.rectangle(
        x - width/2, y - height/2,
        width, offset,
        this.colors.buttonHighlight
      ).setOrigin(0, 0);
      container.add(topLight);

      // Borde izquierdo (blanco - luz)
      const leftLight = this.scene.add.rectangle(
        x - width/2, y - height/2,
        offset, height,
        this.colors.buttonHighlight
      ).setOrigin(0, 0);
      container.add(leftLight);

      // Borde inferior (sombra oscura)
      const bottomShadow = this.scene.add.rectangle(
        x - width/2, y + height/2 - offset,
        width, offset,
        this.colors.buttonDarkShadow
      ).setOrigin(0, 0);
      container.add(bottomShadow);

      // Borde derecho (sombra oscura)
      const rightShadow = this.scene.add.rectangle(
        x + width/2 - offset, y - height/2,
        offset, height,
        this.colors.buttonDarkShadow
      ).setOrigin(0, 0);
      container.add(rightShadow);

      // Sombra intermedia inferior
      const bottomMidShadow = this.scene.add.rectangle(
        x - width/2 + offset, y + height/2 - offset * 2,
        width - offset * 2, offset,
        this.colors.buttonShadow
      ).setOrigin(0, 0);
      container.add(bottomMidShadow);

      // Sombra intermedia derecha
      const rightMidShadow = this.scene.add.rectangle(
        x + width/2 - offset * 2, y - height/2 + offset,
        offset, height - offset * 2,
        this.colors.buttonShadow
      ).setOrigin(0, 0);
      container.add(rightMidShadow);
    } else {
      // Borde hundido (invertido)
      const topShadow = this.scene.add.rectangle(
        x - width/2, y - height/2,
        width, offset,
        this.colors.buttonDarkShadow
      ).setOrigin(0, 0);
      container.add(topShadow);

      const leftShadow = this.scene.add.rectangle(
        x - width/2, y - height/2,
        offset, height,
        this.colors.buttonDarkShadow
      ).setOrigin(0, 0);
      container.add(leftShadow);

      const bottomLight = this.scene.add.rectangle(
        x - width/2, y + height/2 - offset,
        width, offset,
        this.colors.buttonHighlight
      ).setOrigin(0, 0);
      container.add(bottomLight);

      const rightLight = this.scene.add.rectangle(
        x + width/2 - offset, y - height/2,
        offset, height,
        this.colors.buttonHighlight
      ).setOrigin(0, 0);
      container.add(rightLight);
    }
  }

  /**
   * Crea un botón estilo Windows 95
   */
  createButton(x, y, width, height, text, isDefault = false) {
    const container = this.scene.add.container(x, y);

    // Fondo del botón
    const bg = this.scene.add.rectangle(0, 0, width, height, this.colors.buttonFace);
    container.add(bg);

    // Bordes 3D
    this.create3DBorder(container, 0, 0, width, height, true);

    // Texto del botón
    const label = this.scene.add.text(0, 0, text, {
      fontSize: isDefault ? '14px' : '13px',
      color: '#000000',
      fontStyle: isDefault ? 'bold' : 'normal',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    container.add(label);

    // Si es botón por defecto, agregar borde negro extra
    if (isDefault) {
      const defaultBorder = this.scene.add.rectangle(0, 0, width + 4, height + 4, 0x000000)
        .setStrokeStyle(1, this.colors.black);
      container.add(defaultBorder);
      container.sendToBack(defaultBorder);
    }

    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    // Estado para tracking
    container.setData('pressed', false);
    container.setData('bg', bg);
    container.setData('label', label);

    return container;
  }

  /**
   * Agregar efectos de hover y click a un botón
   */
  addButtonEffects(button) {
    const bg = button.getData('bg');
    const label = button.getData('label');
    const originalX = label.x;
    const originalY = label.y;

    button.on('pointerdown', () => {
      button.setData('pressed', true);
      // Efecto de presionado: texto se mueve 1px abajo-derecha
      label.setPosition(originalX + 1, originalY + 1);
      // Bordes se invierten visualmente (simular hundido)
      bg.setFillStyle(this.colors.buttonShadow);
    });

    button.on('pointerup', () => {
      if (button.getData('pressed')) {
        label.setPosition(originalX, originalY);
        bg.setFillStyle(this.colors.buttonFace);
        button.setData('pressed', false);
      }
    });

    button.on('pointerout', () => {
      if (button.getData('pressed')) {
        label.setPosition(originalX, originalY);
        bg.setFillStyle(this.colors.buttonFace);
        button.setData('pressed', false);
      }
    });

    return button;
  }

  /**
   * Crea barra de título estilo Windows 95
   */
  createTitleBar(container, x, y, width, title, active = true, showButtons = true) {
    const titleHeight = 18;

    // Fondo de la barra (degradado simplificado con dos colores)
    const titleBg1 = this.scene.add.rectangle(
      x - width/2, y - titleHeight/2,
      width * 0.7, titleHeight,
      active ? this.colors.titleBarActive : this.colors.titleBarInactive
    ).setOrigin(0, 0);
    container.add(titleBg1);

    const titleBg2 = this.scene.add.rectangle(
      x - width/2 + width * 0.7, y - titleHeight/2,
      width * 0.3, titleHeight,
      active ? this.colors.titleBarGradient : this.colors.buttonShadow
    ).setOrigin(0, 0);
    container.add(titleBg2);

    // Texto del título
    const titleText = this.scene.add.text(x - width/2 + 4, y, title, {
      fontSize: '11px',
      color: active ? '#FFFFFF' : '#C0C0C0',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0, 0.5);
    container.add(titleText);

    if (showButtons) {
      const btnSize = 14;
      const btnSpacing = 2;
      const btnY = y;
      let btnX = x + width/2 - btnSize - 4;

      // Botón cerrar (X)
      const closeBtn = this.scene.add.container(btnX, btnY);
      const closeBg = this.scene.add.rectangle(0, 0, btnSize, btnSize, this.colors.buttonFace);
      closeBtn.add(closeBg);
      this.create3DBorder(closeBtn, 0, 0, btnSize, btnSize, true);
      const closeX = this.scene.add.text(0, 0, '×', {
        fontSize: '14px',
        color: '#000000',
        fontStyle: 'bold',
        fontFamily: 'MS Sans Serif, Arial, sans-serif'
      }).setOrigin(0.5);
      closeBtn.add(closeX);
      closeBtn.setSize(btnSize, btnSize);
      closeBtn.setData('type', 'close');
      container.add(closeBtn);

      btnX -= btnSize + btnSpacing;

      // Botón maximizar (□)
      const maxBtn = this.scene.add.container(btnX, btnY);
      const maxBg = this.scene.add.rectangle(0, 0, btnSize, btnSize, this.colors.buttonFace);
      maxBtn.add(maxBg);
      this.create3DBorder(maxBtn, 0, 0, btnSize, btnSize, true);
      const maxIcon = this.scene.add.text(0, -1, '□', {
        fontSize: '12px',
        color: '#000000',
        fontFamily: 'MS Sans Serif, Arial, sans-serif'
      }).setOrigin(0.5);
      maxBtn.add(maxIcon);
      maxBtn.setSize(btnSize, btnSize);
      maxBtn.setData('type', 'maximize');
      container.add(maxBtn);

      btnX -= btnSize + btnSpacing;

      // Botón minimizar (_)
      const minBtn = this.scene.add.container(btnX, btnY);
      const minBg = this.scene.add.rectangle(0, 0, btnSize, btnSize, this.colors.buttonFace);
      minBtn.add(minBg);
      this.create3DBorder(minBtn, 0, 0, btnSize, btnSize, true);
      const minIcon = this.scene.add.text(0, 0, '_', {
        fontSize: '12px',
        color: '#000000',
        fontStyle: 'bold',
        fontFamily: 'MS Sans Serif, Arial, sans-serif'
      }).setOrigin(0.5);
      minBtn.add(minIcon);
      minBtn.setSize(btnSize, btnSize);
      minBtn.setData('type', 'minimize');
      container.add(minBtn);

      return { titleText, closeBtn, maxBtn, minBtn };
    }

    return { titleText };
  }

  /**
   * Crea una ventana completa estilo Windows 95
   */
  createWindow(x, y, width, height, title, hasMenuBar = false) {
    const container = this.scene.add.container(x, y);
    const titleBarHeight = 18;
    const menuBarHeight = hasMenuBar ? 18 : 0;
    const contentY = -height/2 + titleBarHeight + menuBarHeight;

    // Borde exterior negro
    const outerBorder = this.scene.add.rectangle(0, 0, width + 4, height + 4, this.colors.black);
    container.add(outerBorder);

    // Fondo de la ventana
    const windowBg = this.scene.add.rectangle(0, 0, width, height, this.colors.window);
    container.add(windowBg);

    // Barra de título
    const titleBar = this.createTitleBar(
      container,
      0,
      -height/2 + titleBarHeight/2 + 2,
      width - 4,
      title,
      true,
      true
    );

    // Barra de menú (si se solicita)
    if (hasMenuBar) {
      const menuY = -height/2 + titleBarHeight + menuBarHeight/2 + 2;
      const menuBg = this.scene.add.rectangle(
        -width/2 + 2, menuY - menuBarHeight/2,
        width - 4, menuBarHeight,
        this.colors.menuBar
      ).setOrigin(0, 0);
      container.add(menuBg);

      // Línea separadora bajo el menú
      const menuSeparator = this.scene.add.rectangle(
        0, menuY + menuBarHeight/2,
        width - 4, 1,
        this.colors.buttonShadow
      );
      container.add(menuSeparator);
    }

    // Área de contenido
    const contentArea = this.scene.add.container(0, contentY + (height - titleBarHeight - menuBarHeight)/2);
    container.add(contentArea);

    container.setSize(width, height);
    container.setData('titleBar', titleBar);
    container.setData('contentArea', contentArea);
    container.setData('windowBg', windowBg);

    return container;
  }

  /**
   * Crea un icono del escritorio
   */
  createDesktopIcon(x, y, emoji, label) {
    const container = this.scene.add.container(x, y);
    const iconSize = 32;

    // Emoji/icono
    const icon = this.scene.add.text(0, -15, emoji, {
      fontSize: '32px'
    }).setOrigin(0.5);
    container.add(icon);

    // Etiqueta
    const text = this.scene.add.text(0, 25, label, {
      fontSize: '11px',
      color: '#FFFFFF',
      align: 'center',
      fontFamily: 'MS Sans Serif, Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    container.add(text);

    container.setSize(64, 64);
    container.setInteractive({ useHandCursor: true });

    // Efecto de selección
    let selectionBg = null;

    container.on('pointerover', () => {
      if (!selectionBg) {
        selectionBg = this.scene.add.rectangle(0, 0, 64, 64, this.colors.highlightBg, 0.3);
        selectionBg.setStrokeStyle(1, this.colors.highlightBg, 0.8);
        container.add(selectionBg);
        container.sendToBack(selectionBg);
      }
    });

    container.on('pointerout', () => {
      if (selectionBg) {
        selectionBg.destroy();
        selectionBg = null;
      }
    });

    return container;
  }

  /**
   * Crea barra de tareas de Windows 95
   */
  createTaskbar(width, height) {
    const taskbarHeight = 28;
    const container = this.scene.add.container(width/2, height - taskbarHeight/2);
    container.setDepth(1000);

    // Fondo de la barra de tareas
    const bg = this.scene.add.rectangle(0, 0, width, taskbarHeight, this.colors.buttonFace);
    container.add(bg);

    // Borde superior
    const topBorder = this.scene.add.rectangle(
      -width/2, -taskbarHeight/2,
      width, 2,
      this.colors.buttonHighlight
    ).setOrigin(0, 0);
    container.add(topBorder);

    // Botón Inicio
    const startBtn = this.createButton(-width/2 + 60, 0, 54, 22, '🪟 Inicio', false);
    this.addButtonEffects(startBtn);
    container.add(startBtn);

    // Separador después del botón Inicio
    const separator1 = this.scene.add.rectangle(
      -width/2 + 120, -taskbarHeight/2 + 4,
      2, taskbarHeight - 8,
      this.colors.buttonShadow
    ).setOrigin(0, 0);
    container.add(separator1);

    // System tray (derecha)
    const trayX = width/2 - 140;
    const trayWidth = 130;

    // Separador antes del system tray
    const separator2 = this.scene.add.rectangle(
      trayX - 5, -taskbarHeight/2 + 4,
      2, taskbarHeight - 8,
      this.colors.buttonShadow
    ).setOrigin(0, 0);
    container.add(separator2);

    // Área del system tray
    const trayBg = this.scene.add.rectangle(
      trayX, -taskbarHeight/2 + 2,
      trayWidth, taskbarHeight - 4,
      this.colors.window
    ).setOrigin(0, 0);
    container.add(trayBg);

    // Borde hundido del tray
    this.create3DBorder(container, trayX + trayWidth/2, 0, trayWidth, taskbarHeight - 4, false);

    container.setData('startBtn', startBtn);
    container.setData('trayX', trayX);
    container.setData('trayWidth', trayWidth);

    return container;
  }
}

// Export para uso global
if (typeof window !== 'undefined') {
  window.WindowsUI = WindowsUI;
  window.WIN95_COLORS = WIN95_COLORS;
}
