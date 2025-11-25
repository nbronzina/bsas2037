/**
 * EndingScene - Estilo Windows 95/98
 * Pantalla de resultado final con 8 endings (4 normales + 4 especiales)
 */

class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' });
    this.windowsUI = null;
  }

  init(data) {
    this.gameOver = data?.gameOver || false;
    this.failedResource = data?.failedResource || null;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Inicializar WindowsUI
    this.windowsUI = new WindowsUI(this);

    // Calcular ending
    const ending = this.calculateEnding();

    // Audio según el resultado
    if (gameState.audioManager) {
      // Detener música de fondo
      gameState.audioManager.stopMusic();

      // Sonido según el tipo de ending
      this.time.delayedCall(500, () => {
        if (ending.id === 'collapse') {
          gameState.audioManager.playDefeatSound();
        } else if (ending.id === 'success' || ending.id === 'community') {
          gameState.audioManager.playVictorySound();
        } else if (ending.id === 'crisis') {
          gameState.audioManager.playAlertSound();
        }
      });
    }

    // Fondo teal del escritorio Windows 95
    this.add.rectangle(width/2, height/2, width, height, WIN95_COLORS.desktop);

    // Mostrar ventana de ending
    this.showEndingWindow(width, height, ending);

    // Fade in
    this.cameras.main.fadeIn(1000);
  }

  // ═══════════════════════════════════════════
  // CÁLCULO DE ENDING
  // ═══════════════════════════════════════════

  calculateEnding() {
    // Game over por recurso a 0
    if (this.gameOver && this.failedResource) {
      return this.getCollapseEnding(this.failedResource);
    }

    const status = gameState.getResourceStatus();
    const resources = gameState.resources;

    // Verificar endings especiales primero
    const specialEnding = this.checkSpecialEndings(resources, status);
    if (specialEnding) return specialEnding;

    // Endings normales por estado de recursos
    if (status.healthy === 4) {
      return this.getSuccessEnding(resources);
    }

    if (status.critical >= 2) {
      return this.getCrisisEnding(resources);
    }

    if (status.critical === 1) {
      return this.getStruggleEnding(resources);
    }

    return this.getBalanceEnding(resources);
  }

  // ═══════════════════════════════════════════
  // ENDINGS ESPECIALES
  // ═══════════════════════════════════════════

  checkSpecialEndings(resources, status) {
    // Ending: Autarquía (autonomía muy alta, otros bajos)
    if (resources.autonomia >= 80 && status.average < 50) {
      return {
        id: 'autarky',
        title: 'AUTARQUÍA',
        icon: '🏴',
        subtitle: 'Independientes pero aislados',
        description: 'La red mantuvo su independencia a toda costa. No dependemos de nadie, pero el precio fue alto.\n\nLa comunidad está orgullosa de su autonomía, aunque algunos recursos escasean. El futuro es incierto, pero es nuestro.'
      };
    }

    // Ending: Institucionalización (legitimidad alta, autonomía baja)
    if (resources.legitimidad >= 80 && resources.autonomia < 30) {
      return {
        id: 'institutional',
        title: 'INSTITUCIONALIZACIÓN',
        icon: '🏛️',
        subtitle: 'Reconocidos pero dependientes',
        description: 'La red ganó reconocimiento oficial. El municipio nos ve como modelo.\n\nPero con el reconocimiento vinieron las regulaciones. Ya no somos tan libres de hacer las cosas a nuestra manera.'
      };
    }

    // Ending: Abundancia técnica (electricidad y agua altas)
    if (resources.electricidad >= 80 && resources.agua >= 80) {
      return {
        id: 'technical',
        title: 'ABUNDANCIA TÉCNICA',
        icon: '⚙️',
        subtitle: 'Infraestructura sólida',
        description: 'La infraestructura de la red es impecable. Electricidad estable, agua limpia.\n\nBeto y Marcos están orgullosos. Aunque la comunidad a veces se queja de que priorizamos cables y caños sobre personas.'
      };
    }

    // Ending: Comunidad fuerte (legitimidad alta, otros ok)
    if (resources.legitimidad >= 80 && status.average >= 50) {
      return {
        id: 'community',
        title: 'COMUNIDAD FUERTE',
        icon: '🤝',
        subtitle: 'Unidos en la adversidad',
        description: 'La confianza en la red nunca fue tan alta. Los vecinos se sienten parte de algo.\n\nHay problemas, claro. Pero se resuelven en asamblea, hablando, como debe ser.'
      };
    }

    return null; // Sin ending especial
  }

  // ═══════════════════════════════════════════
  // ENDINGS NORMALES
  // ═══════════════════════════════════════════

  getSuccessEnding(resources) {
    return {
      id: 'success',
      title: 'RED CONSOLIDADA',
      icon: '🏆',
      subtitle: 'Una semana para recordar',
      description: 'Todos los recursos están en buen estado. La semana fue un éxito.\n\nNo significa que no hubo problemas, pero se manejaron bien. La comunidad confía en la gestión y mira el futuro con optimismo.\n\nEl trabajo colectivo dio sus frutos. Seguimos adelante.'
    };
  }

  getBalanceEnding(resources) {
    const lowest = gameState.getLowestResource();

    return {
      id: 'balance',
      title: 'EQUILIBRIO FRÁGIL',
      icon: '⚖️',
      subtitle: 'Ni bien ni mal',
      description: `La semana termina en un equilibrio precario.\n\nLos recursos están estables, aunque ${lowest.icon} ${gameState.getResourceName(lowest.key)} preocupa un poco. La comunidad mantiene la confianza, pero hay tensiones latentes.\n\nNo es un triunfo, pero tampoco un fracaso. El trabajo continúa.`
    };
  }

  getStruggleEnding(resources) {
    const critical = gameState.getCriticalResources()[0];

    return {
      id: 'struggle',
      title: 'RESISTIENDO',
      icon: '⚠️',
      subtitle: 'Sobrevivimos, apenas',
      description: `La semana fue dura. ${critical.icon} ${critical.name} está en estado crítico.\n\nLa comunidad aguanta, pero hay preocupación. Si la próxima semana no mejoramos, vamos a tener problemas serios.\n\nHay que tomar decisiones difíciles pronto.`
    };
  }

  getCrisisEnding(resources) {
    const criticals = gameState.getCriticalResources();
    const criticalNames = criticals.map(c => c.icon).join(' ');

    return {
      id: 'crisis',
      title: 'CRISIS',
      icon: '🔥',
      subtitle: 'Al borde del colapso',
      description: `Múltiples recursos en estado crítico: ${criticalNames}\n\nLa red está al límite. La gente empieza a dudar. Algunos hablan de abandonar el proyecto.\n\nSe necesitan cambios urgentes. No hay margen para más errores.`
    };
  }

  getCollapseEnding(failedResource) {
    const resourceName = gameState.getResourceName(failedResource);
    const icon = gameState.resourceIcons[failedResource];

    const descriptions = {
      electricidad: 'Sin electricidad, los sistemas de la red colapsaron. Los alimentos se pudrieron, la comunicación se cortó, el caos se instaló.\n\nLa gente tuvo que dispersarse. El sueño de la autogestión murió en la oscuridad.',
      agua: 'Sin agua, no hay vida posible. Los vecinos tuvieron que abandonar el barrio en busca de fuentes.\n\nLa red se disolvió. Años de trabajo comunitario, perdidos por falta de planificación.',
      legitimidad: 'La comunidad perdió toda confianza en la gestión. Una asamblea de emergencia votó disolver la coordinación.\n\nLa red existe técnicamente, pero sin legitimidad no hay gobierno posible. El caos se instaló.',
      autonomia: 'La dependencia externa se volvió total. El municipio intervino la red "por el bien de los vecinos".\n\nTécnicamente seguimos funcionando, pero ya no somos una red autogestionada. Somos un programa municipal más.'
    };

    return {
      id: 'collapse',
      title: 'COLAPSO',
      icon: '💀',
      subtitle: `${icon} ${resourceName} llegó a cero`,
      description: descriptions[failedResource] || 'La red no sobrevivió la semana.'
    };
  }

  // ═══════════════════════════════════════════
  // MOSTRAR ENDING
  // ═══════════════════════════════════════════

  showEndingWindow(width, height, ending) {
    const windowWidth = 560;
    const windowHeight = 520;
    const windowX = width / 2;
    const windowY = height / 2;

    // Crear ventana Windows 95
    const endingWindow = this.windowsUI.createWindow(
      windowX,
      windowY,
      windowWidth,
      windowHeight,
      '📊 Informe Semanal - Red de Aguante',
      false
    );

    const contentArea = endingWindow.getData('contentArea');

    // Contenido
    this.showEndingContent(contentArea, ending);

    // Botones
    this.createButtons(contentArea);
  }

  showEndingContent(contentArea, ending) {
    let currentY = -210;

    // Icono grande
    const icon = this.add.text(0, currentY, ending.icon, {
      fontSize: '48px'
    }).setOrigin(0.5);
    contentArea.add(icon);
    currentY += 70;

    // Título
    const titleText = this.add.text(0, currentY, ending.title, {
      fontSize: '22px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5).setScale(0.8).setAlpha(0);
    contentArea.add(titleText);

    // Animación del título
    this.tweens.add({
      targets: titleText,
      scale: { from: 0.8, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 800,
      ease: 'Back.easeOut'
    });
    currentY += 35;

    // Subtítulo
    if (ending.subtitle) {
      const subtitle = this.add.text(0, currentY, ending.subtitle, {
        fontSize: '12px',
        color: '#555555',
        fontStyle: 'italic',
        fontFamily: 'MS Sans Serif, Arial, sans-serif'
      }).setOrigin(0.5);
      contentArea.add(subtitle);
      currentY += 25;
    }


    // Línea separadora
    const separator = this.add.rectangle(0, currentY, 400, 1, WIN95_COLORS.buttonShadow);
    contentArea.add(separator);
    currentY += 20;

    // Descripción
    const desc = this.add.text(0, currentY, ending.description, {
      fontSize: '12px',
      color: '#000000',
      wordWrap: { width: 480 },
      align: 'center',
      lineSpacing: 5,
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5, 0);
    contentArea.add(desc);
    currentY += desc.height + 25;

    // Panel de recursos finales
    this.showFinalResources(contentArea, currentY);
    currentY += 55;

    // Estadísticas
    this.showStats(contentArea, currentY);
  }

  showFinalResources(contentArea, y) {
    // Fondo del panel
    const panel = this.add.rectangle(0, y, 480, 40, WIN95_COLORS.window);
    this.windowsUI.create3DBorder(contentArea, 0, y, 480, 40, false);
    contentArea.add(panel);

    // Recursos
    const resources = gameState.getResourcesArray();
    const spacing = 480 / (resources.length + 1);

    resources.forEach((res, index) => {
      const x = -240 + spacing * (index + 1);
      const color = res.value < 20 ? '#FF0000' : res.value >= 50 ? '#008000' : '#000000';

      const resText = this.add.text(x, y, `${res.icon} ${res.value}%`, {
        fontSize: '12px',
        color: color,
        fontStyle: 'bold',
        fontFamily: 'MS Sans Serif, Arial, sans-serif'
      }).setOrigin(0.5).setAlpha(0);
      contentArea.add(resText);

      // Animación secuencial
      this.tweens.add({
        targets: resText,
        alpha: 1,
        duration: 400,
        delay: index * 150,
        ease: 'Power2'
      });
    });
  }

  showStats(contentArea, y) {
    const docsCompleted = gameState.completedDocuments.length;
    const daysPlayed = gameState.currentDay;

    const stats = this.add.text(0, y, `📄 ${docsCompleted} decisiones  •  📅 ${daysPlayed} días  •  💰 ${gameState.creditos} créditos`, {
      fontSize: '11px',
      color: '#555555',
      fontFamily: 'MS Sans Serif, Arial, sans-serif'
    }).setOrigin(0.5);
    contentArea.add(stats);
  }

  createButtons(contentArea) {
    const y = 200;

    // Jugar de nuevo
    const playAgain = this.windowsUI.createButton(-80, y, 150, 28, 'Jugar de nuevo', true);
    this.windowsUI.addButtonEffects(playAgain);
    playAgain.on('pointerdown', () => {
      if (gameState.audioManager) {
        gameState.audioManager.playConfirmSound();
      }
      gameState.reset();
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('WelcomeScene');
      });
    });
    contentArea.add(playAgain);

    // Volver al menú
    const menu = this.windowsUI.createButton(80, y, 100, 28, 'Menú', false);
    this.windowsUI.addButtonEffects(menu);
    menu.on('pointerdown', () => {
      if (gameState.audioManager) {
        gameState.audioManager.playConfirmSound();
      }
      gameState.reset();
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('WelcomeScene');
      });
    });
    contentArea.add(menu);
  }
}

if (typeof window !== 'undefined') {
  window.EndingScene = EndingScene;
}
