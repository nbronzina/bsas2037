// LogoHelper.js - Shared logo component for WelcomeScene and MainMenuScene

function createGameLogo(scene, x, y, animated = true) {
  const logoContainer = scene.add.container(x, y);

  // === ICONOS DE RECURSOS ===
  const iconY = -60;
  const iconSpacing = 50;

  // Icono Electricidad (rayo naranja)
  const iconElectric = scene.add.text(
    -iconSpacing, iconY, '⚡',
    { fontSize: '32px', color: '#ff6600' }
  ).setOrigin(0.5);

  // Icono Agua (gota azul)
  const iconWater = scene.add.text(
    0, iconY, '💧',
    { fontSize: '32px', color: '#3366cc' }
  ).setOrigin(0.5);

  // Icono Salud (corazón verde)
  const iconHealth = scene.add.text(
    iconSpacing, iconY, '❤️',
    { fontSize: '32px', color: '#44aa44' }
  ).setOrigin(0.5);

  // === BOX ===
  const boxWidth = 320;
  const boxHeight = 100;

  const boxBg = scene.add.rectangle(0, 0, boxWidth, boxHeight, 0x000000, 0.8);
  const boxBorder = scene.add.rectangle(0, 0, boxWidth, boxHeight);
  boxBorder.setStrokeStyle(3, 0xd4a574);
  boxBorder.setFillStyle(0x000000, 0);

  // === TEXTO ===
  const textLine1 = scene.add.text(
    0, -15, 'R E D    D E',
    {
      fontFamily: 'Courier New',
      fontSize: '28px',
      color: '#d4a574',
      fontStyle: 'bold',
      letterSpacing: 4
    }
  ).setOrigin(0.5);

  const textLine2 = scene.add.text(
    0, 20, 'A G U A N T E',
    {
      fontFamily: 'Courier New',
      fontSize: '28px',
      color: '#d4a574',
      fontStyle: 'bold',
      letterSpacing: 4
    }
  ).setOrigin(0.5);

  // CRÍTICO: Agregar en orden correcto (box primero, iconos último para que estén adelante)
  logoContainer.add([
    boxBg,           // 1. Fondo negro (atrás)
    boxBorder,       // 2. Borde dorado
    textLine1,       // 3. Texto línea 1
    textLine2,       // 4. Texto línea 2
    iconElectric,    // 5. Iconos (adelante de todo)
    iconWater,       // 6.
    iconHealth       // 7.
  ]);

  // Animaciones opcionales
  if (animated) {
    scene.tweens.add({
      targets: [iconElectric, iconWater, iconHealth],
      scale: { from: 1, to: 1.1 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  return logoContainer;
}
