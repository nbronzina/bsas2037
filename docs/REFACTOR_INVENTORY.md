# Inventario de Refactor - Red de Aguante

## ✅ MANTENER (reutilizar sin cambios)

Estos archivos se mantienen tal cual porque funcionan independientemente del tipo de gameplay.

| Archivo | Uso | Notas |
|---------|-----|-------|
| `src/managers/AudioManager.js` | Sistema de audio | ✅ Sin cambios |
| `src/managers/AccessibilityManager.js` | Accesibilidad | ✅ Sin cambios |
| `src/managers/KeyboardNavigationManager.js` | Navegación teclado | ✅ Sin cambios |
| `src/scenes/WelcomeScene.js` | Pantalla inicial | ✅ Sin cambios |
| `src/scenes/SettingsScene.js` | Configuración | ✅ Sin cambios |
| `src/scenes/PauseScene.js` | Pausa | ✅ Sin cambios |
| `src/scenes/ThanksScene.js` | Pantalla final créditos | ✅ Sin cambios |
| `src/utils/SceneTransitions.js` | Transiciones | ✅ Sin cambios |
| `src/utils/Constants.js` | Constantes | ✅ Sin cambios |
| `src/utils/Helpers.js` | Utilidades | ✅ Sin cambios |
| `src/utils/LogoHelper.js` | Logo | ✅ Sin cambios |
| `src/components/AnimatedButton.js` | Botones | ✅ Sin cambios |
| `src/components/VisualFeedback.js` | Feedback visual | ✅ Sin cambios |
| `src/components/LoadingIndicator.js` | Loading | ✅ Sin cambios |
| `src/components/Tooltip.js` | Tooltips | ✅ Sin cambios |
| `src/utils/ObjectPool.js` | Performance | ✅ Sin cambios |
| `src/utils/CleanupManager.js` | Performance | ✅ Sin cambios |
| `src/utils/PerformanceMonitor.js` | Performance | ✅ Sin cambios |
| `src/utils/LazyLoader.js` | Performance | ✅ Sin cambios |
| `src/utils/RenderOptimizer.js` | Performance | ✅ Sin cambios |

---

## ⚠️ ADAPTAR (reescribir parcialmente)

Estos archivos necesitan modificaciones para la versión escritorio.

### `src/managers/ResourceManager.js`
**Cambios:**
- ✅ Mantener: `get()`, `set()`, `modify()`, clamping (0-100)
- ⚠️ Simplificar: `applyDecay()` - ahora decay fijo (5 puntos) en vez de porcentaje
- ❌ Eliminar: Métodos relacionados con tareas (si existen)

**Prioridad:** Media

### `src/managers/TimeManager.js`
**Cambios:**
- ⚠️ Cambiar: `maxDays = 7` (en vez de 60)
- ⚠️ Agregar: `dayNames` array con nombres de días de la semana
- ✅ Mantener: `currentDay`, `advanceDay()`

**Prioridad:** Alta

### `src/managers/SaveManager.js`
**Cambios:**
- ✅ Mantener: Estructura básica de save/load
- ⚠️ Adaptar: Nuevo `gameState` simplificado
- ❌ Eliminar: Referencias a tasks, NPC positions, achievements

**Prioridad:** Media

### `src/scenes/EndGameScene.js`
**Cambios:**
- ⚠️ Reducir: De 8 endings a 3-4
- ⚠️ Simplificar: Cálculo de ending basado solo en recursos finales
- ✅ Mantener: Estructura visual básica

**Prioridad:** Alta

### `src/scenes/IntroScene.js`
**Cambios:**
- ⚠️ Simplificar: De tutorial de 5 pasos a intro de 2-3 pantallas
- ❌ Eliminar: Referencias a exploración de mapa
- ⚠️ Ajustar: Texto para explicar sistema de escritorio

**Prioridad:** Alta

### `src/scenes/MainMenuScene.js`
**Cambios:**
- ✅ Mantener: Estructura básica (Nueva Partida, Continuar, Configuración)
- ⚠️ Ajustar: Transiciones a `DeskScene` en vez de `MapScene`

**Prioridad:** Media

### `src/main.js`
**Cambios:**
- ⚠️ Reescribir: `gameState` completamente nuevo
- ⚠️ Actualizar: Lista de scenes en Phaser config
- ❌ Eliminar: Managers no usados

**Prioridad:** CRÍTICA

### `index.html`
**Cambios:**
- ❌ Quitar: Scripts de archivos eliminados
- ⚠️ Agregar: Scripts de archivos nuevos

**Prioridad:** CRÍTICA

---

## ❌ ELIMINAR/IGNORAR (no cargar)

Estos archivos no se usan en la versión escritorio. Se mantienen en el repo pero no se cargan en `index.html`.

### Scenes (no cargar)
- ❌ `src/scenes/MapScene.js` - Reemplazado por `DeskScene.js`
- ❌ `src/scenes/ManagementScene.js` - Ya no hay tareas
- ❌ `src/scenes/EncounterScene.js` - Integrado en `DeskScene.js`
- ❌ `src/scenes/RandomEventScene.js` - Integrado en documentos
- ❌ `src/scenes/AchievementsScene.js` - Simplificación
- ❌ `src/scenes/ArchivoComunitarioScene.js` - Simplificación

### Managers (no cargar)
- ❌ `src/managers/NPCManager.js` - NPCs ya no tienen sprites/posiciones
- ❌ `src/managers/TaskManager.js` - No hay sistema de tareas
- ❌ `src/managers/EncounterManager.js` - Reemplazado por `DocumentManager.js`
- ❌ `src/managers/RandomEventManager.js` - Integrado en `DocumentManager.js`
- ❌ `src/managers/AchievementManager.js` - Simplificación (opcional futuro)
- ❌ `src/managers/MemoriaColectivaManager.js` - Simplificación (opcional futuro)
- ❌ `src/managers/TutorialManager.js` - Simplificación

### Components (no cargar)
- ❌ `src/components/NPC.js` - No hay sprites de NPCs
- ❌ `src/components/AchievementNotification.js` - No hay achievements por ahora
- ❌ `src/ui/ControlsPanel.js` - No aplica a escritorio

### Tests (rehacer después)
- ❌ `src/tests/*` - Toda la test suite necesita reescribirse para nueva estructura

### Data (no usar)
- ❌ `data/encounters.json` - Reemplazado por `documents.json`
- ❌ `data/achievements.json` - No hay achievements por ahora

---

## 🆕 CREAR (nuevo)

Estos archivos no existen y hay que crearlos desde cero.

### Scenes
| Archivo | Propósito | Prioridad |
|---------|-----------|-----------|
| `src/scenes/DeskScene.js` | Pantalla principal con escritorio y documentos | CRÍTICA |
| `src/scenes/DayEndScene.js` | Resumen al final de cada día (nuevo) | Alta |

### Components
| Archivo | Propósito | Prioridad |
|---------|-----------|-----------|
| `src/components/DocumentCard.js` | Visualización de documento con opciones | CRÍTICA |
| `src/components/ResourceDisplay.js` | Display compacto de recursos | Alta |

### Managers
| Archivo | Propósito | Prioridad |
|---------|-----------|-----------|
| `src/managers/DocumentManager.js` | Pool y selección de documentos | CRÍTICA |

### Data
| Archivo | Propósito | Prioridad |
|---------|-----------|-----------|
| `data/documents.json` | 21-28 documentos (3-4 por día) | CRÍTICA |
| `data/dayConfigs.json` | Configuración de cada día (opcional) | Media |

---

## 📊 Resumen de Impacto

### Archivos por Acción

| Acción | Cantidad | Porcentaje |
|--------|----------|------------|
| ✅ Mantener | 20 archivos | ~40% |
| ⚠️ Adaptar | 8 archivos | ~16% |
| ❌ Eliminar | 16 archivos | ~32% |
| 🆕 Crear | 6 archivos | ~12% |

### Prioridades

| Prioridad | Archivos |
|-----------|----------|
| **CRÍTICA** | 4 archivos (main.js, index.html, DeskScene.js, DocumentManager.js, documents.json) |
| **Alta** | 5 archivos (TimeManager, EndGameScene, IntroScene, DayEndScene, ResourceDisplay) |
| **Media** | 3 archivos (ResourceManager, SaveManager, MainMenuScene) |

---

## 🎯 Orden de Implementación Sugerido

### Fase 1: Core Escritorio (CRÍTICA)
1. ⚠️ Adaptar `src/main.js` con nuevo `gameState`
2. 🆕 Crear `src/managers/DocumentManager.js`
3. 🆕 Crear `data/documents.json` (al menos 7 docs, 1 por día)
4. 🆕 Crear `src/scenes/DeskScene.js` (básico)
5. 🆕 Crear `src/components/DocumentCard.js`
6. ⚠️ Actualizar `index.html` con nuevos scripts

### Fase 2: Funcionalidad Completa (Alta)
7. ⚠️ Adaptar `src/managers/TimeManager.js` (7 días)
8. ⚠️ Simplificar `src/managers/ResourceManager.js` (decay)
9. 🆕 Crear `src/scenes/DayEndScene.js`
10. 🆕 Crear `src/components/ResourceDisplay.js`
11. ⚠️ Reducir `src/scenes/EndGameScene.js` (3-4 endings)

### Fase 3: Polish & Integration (Media)
12. ⚠️ Adaptar `src/scenes/IntroScene.js`
13. ⚠️ Adaptar `src/managers/SaveManager.js`
14. 🆕 Completar `data/documents.json` (21-28 docs)
15. ⚠️ Ajustar `src/scenes/MainMenuScene.js`

---

## 📝 Notas de Implementación

### Mantener Compatibilidad
- ✅ Todos los archivos de utils y performance se mantienen
- ✅ Accessibility completo se mantiene
- ✅ Audio system se mantiene
- ✅ Visual polish se mantiene

### Simplificación Radical
- ❌ No hay mapa ni sprites
- ❌ No hay sistema de tareas
- ❌ No hay achievements (por ahora)
- ❌ No hay memoria colectiva (por ahora)

### Foco en Narrativa
- ✅ Documentos como vehículo narrativo principal
- ✅ Decisiones claras con preview de consecuencias
- ✅ Feedback inmediato de recursos
- ✅ Experiencia lineal por días

---

## ⚠️ Riesgos

1. **Pérdida de features**: Achievements y Memoria Colectiva son populares
   - Mitigation: Considerar agregar en versión futura
2. **Menos rejugabilidad**: Solo 7 días vs 60
   - Mitigation: Múltiples endings + variedad en documentos aleatorios
3. **NPCs menos desarrollados**: No hay interacción directa
   - Mitigation: Personalidades fuertes en texto de documentos

---

## ✅ Ventajas

1. **Código más simple**: ~40% menos archivos
2. **Más rápido de iterar**: Agregar documentos es fácil
3. **Más accesible**: Menos curva de aprendizaje
4. **Mejor rendimiento**: Menos managers activos
5. **Partidas cortas**: 15-25 min es perfecto para casual
