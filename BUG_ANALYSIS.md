# Análisis de Bug: Navegación de Escenas en Phaser 3

## Resumen del Problema

**Bug**: Los botones de navegación en `EndGameScene` y `ThanksScene` no cambiaban la escena visualmente, aunque el audio cambiaba correctamente.

**Síntoma**: Al hacer clic en botones como "Volver a inicio" o "Terminar", se escuchaba la música del menú pero la pantalla se quedaba mostrando la escena anterior.

---

## Causa Raíz

El bug ocurría cuando una escena intentaba detener **TODAS** las escenas activas (incluyéndose a sí misma) antes de hacer `scene.start()`:

```javascript
// ❌ CÓDIGO PROBLEMÁTICO
goToMenu() {
  // Detener TODAS las escenas activas (incluyendo la actual)
  this.scene.manager.scenes.forEach(scene => {
    if (scene.scene.isActive()) {
      this.scene.stop(scene.scene.key);  // ← Esto incluye ThanksScene misma
    }
  });

  // Intentar iniciar nueva escena
  this.scene.start('MainMenuScene');  // ← No funciona porque la escena ejecutante fue detenida
}
```

**Por qué falla**:
1. El código se ejecuta en ThanksScene
2. El `forEach` detiene ThanksScene cuando encuentra que está activa
3. Una vez detenida, el contexto de ejecución se invalida
4. El `scene.start()` no puede completarse correctamente
5. Resultado: audio cambia (se ejecutó antes) pero visual no cambia

---

## Ejemplos de Código Problemático vs. Correcto

### ❌ EndGameScene (TODAVÍA TIENE EL BUG)

**Ubicación**: `src/scenes/EndGameScene.js` líneas 318-333

```javascript
// Click handler - Ir a ThanksScene
backToMenuButton.on('pointerdown', () => {
  console.log('=== BACK TO MENU BUTTON CLICKED ===');
  this.resetGameState();
  console.log('Stopping all scenes and navigating to ThanksScene');

  // ❌ PROBLEMA: Detiene TODAS las escenas
  this.scene.manager.scenes.forEach(scene => {
    if (scene.scene.isActive()) {
      console.log('Stopping scene:', scene.scene.key);
      this.scene.stop(scene.scene.key);  // Detiene EndGameScene misma
    }
  });

  // Esta línea puede no ejecutarse correctamente
  this.scene.start('ThanksScene');
});
```

**Estado actual**: Este código PARECE funcionar porque EndGameScene → ThanksScene funciona, pero solo por suerte o timing. Debería ser corregido.

---

### ✅ ThanksScene (CORREGIDO)

**Ubicación**: `src/scenes/ThanksScene.js` líneas 158-163

```javascript
// ✅ SOLUCIÓN CORRECTA
goToMenu() {
  console.log('=== GOING TO MAIN MENU ===');

  // Simplemente iniciar MainMenuScene - Phaser maneja la transición automáticamente
  this.scene.start('MainMenuScene');
}
```

**Por qué funciona**: Phaser maneja la transición de escenas automáticamente. No necesitas detener la escena actual manualmente.

---

### ✅ MainMenuScene (CORRECTO)

**Ubicación**: `src/scenes/MainMenuScene.js` líneas 184-201

```javascript
startNewGame() {
  // Resetear estado
  this.resetGameState();

  // ✅ Simplemente ir a la siguiente escena
  this.scene.start('IntroScene');
}

continueGame() {
  // Cargar partida
  gameState.saveManager.load();

  // ✅ Simplemente ir al mapa
  this.scene.start('MapScene');
}

showInfo() {
  // ✅ Simplemente ir a InfoScene
  this.scene.start('InfoScene');
}
```

---

### ✅ WelcomeScene (CORRECTO)

**Ubicación**: `src/scenes/WelcomeScene.js` líneas 141-154

```javascript
startGame() {
  // Iniciar/resumir audio
  if (gameState.audioManager && gameState.audioManager.audioContext) {
    gameState.audioManager.audioContext.resume().then(() => {
      gameState.audioManager.playMenuTheme();
    });
  }

  // ✅ Fade out y cambiar a MainMenu
  this.cameras.main.fadeOut(300, 0, 0, 0);
  this.cameras.main.once('camerafadeoutcomplete', () => {
    this.scene.start('MainMenuScene');  // Directo, sin detener escenas
  });
}
```

---

### ✅ IntroScene (CORRECTO)

**Ubicación**: `src/scenes/IntroScene.js` línea 227-229

```javascript
startGame() {
  // ✅ Ir directamente al mapa
  this.scene.start('MapScene');
}
```

---

### ✅ PauseScene (CORRECTO)

**Ubicación**: `src/scenes/PauseScene.js` líneas 270-274

```javascript
yesButton.on('pointerdown', () => {
  // ✅ Detiene solo las escenas específicas necesarias
  this.scene.stop('PauseScene');
  this.scene.stop('MapScene');
  this.scene.start('MainMenuScene');
});
```

**Nota importante**: PauseScene detiene escenas ESPECÍFICAS (no TODAS), y no se detiene a sí misma en el forEach. Esto funciona correctamente.

---

## Patrón Correcto de Navegación

### Regla Simple
```javascript
// ✅ SIEMPRE usa esto para navegación de escenas:
this.scene.start('NombreDeLaEscena');

// ❌ NUNCA hagas esto:
this.scene.manager.scenes.forEach(scene => {
  if (scene.scene.isActive()) {
    this.scene.stop(scene.scene.key);  // ← Puede detener la escena actual
  }
});
this.scene.start('NombreDeLaEscena');
```

### Casos Especiales

**Si necesitas detener una escena específica antes de iniciar otra:**
```javascript
// ✅ Detén escenas ESPECÍFICAS, no TODAS
this.scene.stop('MapScene');
this.scene.stop('EncounterScene');
this.scene.start('MainMenuScene');
```

**Si necesitas hacer cleanup antes de cambiar de escena:**
```javascript
// ✅ Usa el método shutdown() de Phaser
shutdown() {
  // Cleanup se ejecuta automáticamente cuando la escena se detiene
  this.input.keyboard.off('keydown-ENTER');
  this.input.keyboard.off('keydown-ESC');
}

// En tu handler de navegación:
buttonClick() {
  this.scene.start('OtraEscena');  // shutdown() se llama automáticamente
}
```

---

## Archivos que Requieren Corrección

### 🔴 CRÍTICO: EndGameScene.js

**Líneas problemáticas**:
- Líneas 323-329 (botón "Volver a inicio")
- Líneas 371-377 (botón "Terminar")
- Líneas 390-396 (atajo ENTER)

**Corrección recomendada**:
```javascript
// ANTES (líneas 318-333)
backToMenuButton.on('pointerdown', () => {
  console.log('=== BACK TO MENU BUTTON CLICKED ===');
  this.resetGameState();
  console.log('Stopping all scenes and navigating to ThanksScene');

  this.scene.manager.scenes.forEach(scene => {
    if (scene.scene.isActive()) {
      console.log('Stopping scene:', scene.scene.key);
      this.scene.stop(scene.scene.key);
    }
  });

  this.scene.start('ThanksScene');
});

// DESPUÉS (recomendado)
backToMenuButton.on('pointerdown', () => {
  console.log('=== BACK TO MENU BUTTON CLICKED ===');
  this.resetGameState();
  console.log('Navigating to ThanksScene');

  // Simplemente ir a ThanksScene
  this.scene.start('ThanksScene');
});
```

**Aplicar el mismo cambio a**:
- exitButton.on('pointerdown') (líneas 366-381)
- keyboard ENTER handler (líneas 386-400)

---

## Por Qué Algunas Veces "Funciona"

El código problemático puede parecer funcionar a veces debido a:

1. **Timing**: Si el `scene.start()` se ejecuta antes de que el `scene.stop()` complete
2. **Orden de ejecución**: El forEach puede no llegar a detener la escena actual antes de que `scene.start()` se ejecute
3. **Estado de Phaser**: Dependiendo del estado interno de Phaser, puede manejar la transición de diferentes formas

**Pero no es confiable**: No deberías depender de este comportamiento. El código correcto funciona 100% del tiempo.

---

## Historial del Bug

### Intentos de Solución en EndGameScene

1. **Commit e309b04**: Agregado depth layering
   - No resolvió el problema (el issue no era z-index)

2. **Commit 8aa520c**: Agregado `scene.stop('EndGameScene')` antes de `scene.start()`
   - No resolvió el problema (detener la escena actual sigue siendo problemático)

3. **Commit 433c051**: Detener TODAS las escenas antes de start
   - No resolvió el problema (empeoró el issue)
   - Usuario reportó: "Sigue sin arreglarse"

4. **Commit 099a293**: Creación de ThanksScene como solución alternativa
   - Evitó el problema en EndGameScene pero lo reprodujo en ThanksScene
   - Usuario reportó: "aparece la pantalla del juego como antes"

5. **Commit 7d6b8f5**: Corrección en ThanksScene (remover detención manual de escenas)
   - ✅ RESOLVIÓ el problema en ThanksScene
   - ⚠️ EndGameScene todavía tiene el código problemático

---

## Lecciones Aprendidas

### 1. Confía en Phaser
Phaser maneja las transiciones de escenas automáticamente. No necesitas microgestionar el ciclo de vida de las escenas.

### 2. KISS (Keep It Simple)
```javascript
// Simple y funciona
this.scene.start('OtraEscena');

// Complejo y problemático
this.scene.manager.scenes.forEach(scene => {
  if (scene.scene.isActive()) {
    this.scene.stop(scene.scene.key);
  }
});
this.scene.start('OtraEscena');
```

### 3. Usa shutdown() para cleanup
No intentes limpiar manualmente antes de cambiar de escena. Usa el método `shutdown()` que Phaser llama automáticamente.

### 4. Si algo funciona en otras escenas, úsalo
WelcomeScene, IntroScene, MainMenuScene todas usan `scene.start()` directamente. Ese es el patrón correcto.

---

## Recomendaciones

### Inmediato
1. ✅ Corregir EndGameScene.js (3 ubicaciones)
2. ⚠️ Revisar si hay otras escenas con el mismo patrón problemático

### A Futuro
1. Documentar el patrón correcto en comentarios o docs
2. Code review para nuevas escenas que verifique navegación correcta
3. Considerar crear una función helper para navegación si es necesario

---

## Conclusión

**El bug**: Detener la escena actual antes de hacer `scene.start()` causa que la transición falle.

**La solución**: Usar `this.scene.start('NombreDeLaEscena')` directamente. Phaser maneja todo lo demás.

**Estado actual**:
- ✅ ThanksScene: Corregido
- ✅ WelcomeScene: Correcto desde el inicio
- ✅ IntroScene: Correcto desde el inicio
- ✅ MainMenuScene: Correcto desde el inicio
- ✅ PauseScene: Correcto (detiene escenas específicas)
- ❌ EndGameScene: **Requiere corrección**

---

## ACTUALIZACIÓN: Bug Adicional Descubierto

### Bug #2: MapScene Permanece Visible (scene.launch vs scene.start)

**Fecha**: 2025-01-24 (mismo día, descubierto después del análisis inicial)

**Síntoma**: Después de arreglar ThanksScene, el botón "Volver a inicio" llevaba a MainMenuScene (audio correcto) pero **visualmente se seguía viendo la pantalla del juego**.

**Causa Raíz Diferente**:

MapScene usa `scene.launch()` en lugar de `scene.start()` para EndGameScene:

```javascript
// En MapScene.js línea 1346-1349
this.scene.pause();  // ← Pausa MapScene pero NO la detiene
this.scene.launch('EndGameScene', {  // ← Lanza en paralelo, MapScene sigue existiendo
  victory: gameOverCheck.victory,
  // ...
});
```

**Diferencia crítica**:
- `scene.start(key)` → Detiene la escena actual e inicia la nueva
- `scene.launch(key)` → Inicia una nueva escena SIN detener la actual (escenas paralelas)
- `scene.pause()` → Pausa la escena pero sigue renderizada en el fondo

**Flujo del bug**:
1. MapScene pausada (no activa, pero renderizada)
2. EndGameScene lanzada sobre MapScene
3. ThanksScene iniciada (detiene EndGameScene, MapScene sigue pausada)
4. MainMenuScene iniciada (detiene ThanksScene, **MapScene sigue pausada y visible**)

**Resultado**: MainMenuScene está activa (audio funciona) pero MapScene se ve debajo.

**Solución**:

En ThanksScene, detener EXPLÍCITAMENTE las escenas del juego antes de ir al menú:

```javascript
goToMenu() {
  // Detener escenas del juego que puedan estar pausadas/activas
  this.scene.stop('MapScene');        // ← CRÍTICO: Detener escena pausada
  this.scene.stop('EndGameScene');
  this.scene.stop('ThanksScene');

  // Ahora sí iniciar MainMenuScene
  this.scene.start('MainMenuScene');
}
```

**Por qué funciona**:
- `scene.stop()` en una escena pausada la detiene completamente
- Se limpia el fondo antes de mostrar MainMenuScene
- Ahora MainMenuScene es la ÚNICA escena visible

**Lección adicional**:
- Cuando uses `scene.launch()`, recuerda que la escena original sigue existiendo
- Si pausas una escena, necesitas detenerla explícitamente después
- `scene.start()` NO detiene escenas pausadas de otras escenas

---

**Fecha de análisis**: 2025-01-24
**Analizado por**: Claude (Anthropic)
**Archivos revisados**: 6+ escenas
**Commits relacionados**: e309b04, 8aa520c, 433c051, 099a293, 7d6b8f5, a13b160, [próximo]
