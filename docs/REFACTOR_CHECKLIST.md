# Checklist de Refactor - Escritorio

## ═══════════════════════════════════════════════════════
## FASE 0: PREPARACIÓN ✅
## ═══════════════════════════════════════════════════════

### Backup
- [x] Tag v1.0-mapa creado
- [ ] Tag pusheado a remote
- [x] Documentación de versión anterior (V1_MAP_VERSION.md)

### Diseño
- [x] DESK_DESIGN.md completo
- [x] Estructura de Document definida
- [x] Estructura de GameState definida
- [x] Configuración de días definida
- [x] Endings definidos (3-4)

### Rama
- [ ] Rama refactor/escritorio creada
- [ ] Commit inicial de documentación

### Inventario
- [x] Lista de archivos a mantener
- [x] Lista de archivos a adaptar
- [x] Lista de archivos a eliminar
- [x] Lista de archivos nuevos

### Listo para Fase 1
- [ ] Todos los items anteriores ✅
- [ ] Entendimiento claro del nuevo flujo
- [ ] Sin dependencias bloqueantes

---

## ═══════════════════════════════════════════════════════
## FASE 1: CORE ESCRITORIO (CRÍTICA)
## ═══════════════════════════════════════════════════════

### 1.1 GameState Simplificado
- [ ] Adaptar `src/main.js` con nuevo gameState
  - [ ] currentDay (1-7)
  - [ ] dayNames array
  - [ ] resources (electricidad, agua, legitimidad, autonomia)
  - [ ] creditos
  - [ ] documentsToday array
  - [ ] currentDocumentIndex
  - [ ] completedDocuments array
  - [ ] flags object
- [ ] Eliminar referencias a sistemas viejos (tasks, encounters, achievements)

### 1.2 DocumentManager
- [ ] Crear `src/managers/DocumentManager.js`
  - [ ] loadDocuments() - cargar desde JSON
  - [ ] getDocumentsForDay(day) - documentos fijos + aleatorios
  - [ ] checkConditions(doc) - verificar si doc puede aparecer
  - [ ] applyConsequences(option) - aplicar efectos de decisión
  - [ ] setFlag(flag) - activar flags narrativos

### 1.3 Documentos Básicos
- [ ] Crear `data/documents.json`
  - [ ] Día 1: 2 docs intro (sin decay)
  - [ ] Día 2: 1 doc fijo + pool aleatorio
  - [ ] Día 3: 1 doc fijo + pool aleatorio
  - [ ] Día 4: 1 doc fijo + pool aleatorio
  - [ ] Día 5: 2 docs asamblea
  - [ ] Día 6: 1 doc fin de semana
  - [ ] Día 7: 2 docs cierre
  - [ ] Pool de 10-15 docs aleatorios

### 1.4 DeskScene Básico
- [ ] Crear `src/scenes/DeskScene.js`
  - [ ] create() - setup inicial
  - [ ] showDocument(docIndex) - mostrar doc actual
  - [ ] handleDecision(option) - procesar decisión
  - [ ] updateResourceDisplay() - actualizar recursos
  - [ ] endDay() - terminar día
  - [ ] UI básica (título, recursos, bandeja)

### 1.5 DocumentCard Component
- [ ] Crear `src/components/DocumentCard.js`
  - [ ] Render de documento (sender, title, content)
  - [ ] Render de opciones (texto + preview)
  - [ ] Botones interactivos
  - [ ] Animación de entrada/salida

### 1.6 Index.html
- [ ] Actualizar `index.html`
  - [ ] Agregar DocumentManager.js
  - [ ] Agregar DeskScene.js
  - [ ] Agregar DocumentCard.js
  - [ ] Comentar/quitar scripts no usados

### 1.7 Testing Básico
- [ ] Puede iniciar juego
- [ ] Aparece primer documento
- [ ] Puede tomar decisión
- [ ] Recursos cambian correctamente
- [ ] Avanza al siguiente documento
- [ ] Puede terminar día 1

---

## ═══════════════════════════════════════════════════════
## FASE 2: FUNCIONALIDAD COMPLETA
## ═══════════════════════════════════════════════════════

### 2.1 TimeManager Adaptado
- [ ] Modificar `src/managers/TimeManager.js`
  - [ ] maxDays = 7
  - [ ] dayNames array
  - [ ] advanceDay() adaptado
  - [ ] getCurrentDayName()

### 2.2 ResourceManager Simplificado
- [ ] Modificar `src/managers/ResourceManager.js`
  - [ ] applyDecay() con decay fijo (5 puntos)
  - [ ] Usar decayMultiplier de config de día
  - [ ] Eliminar métodos de tareas (si existen)

### 2.3 DayEndScene
- [ ] Crear `src/scenes/DayEndScene.js`
  - [ ] Resumen de decisiones del día
  - [ ] Cambios en recursos
  - [ ] Preview de mañana
  - [ ] Botón "Continuar al [día siguiente]"
  - [ ] Aplicar decay al avanzar

### 2.4 ResourceDisplay Component
- [ ] Crear `src/components/ResourceDisplay.js`
  - [ ] Display compacto de 4 recursos + créditos
  - [ ] Iconos/emojis
  - [ ] Animación de cambio
  - [ ] Color coding (verde/amarillo/rojo)

### 2.5 EndGameScene Reducido
- [ ] Modificar `src/scenes/EndGameScene.js`
  - [ ] Reducir a 3-4 endings
  - [ ] Cálculo simplificado basado en recursos
  - [ ] ending_success (todos ≥50%)
  - [ ] ending_balance (promedio 30-50%)
  - [ ] ending_crisis (alguno <20%)
  - [ ] ending_collapse (alguno =0)

### 2.6 Testing Funcionalidad
- [ ] Puede jugar 7 días completos
- [ ] Decay se aplica correctamente
- [ ] DayEndScene aparece al terminar día
- [ ] Recursos se muestran correctamente
- [ ] Ending correcto según recursos

---

## ═══════════════════════════════════════════════════════
## FASE 3: POLISH & INTEGRATION
## ═══════════════════════════════════════════════════════

### 3.1 IntroScene Simplificado
- [ ] Modificar `src/scenes/IntroScene.js`
  - [ ] Intro de 2-3 pantallas
  - [ ] Explicar sistema de escritorio
  - [ ] Sin referencia a mapa o exploración
  - [ ] Transición a DeskScene

### 3.2 SaveManager Adaptado
- [ ] Modificar `src/managers/SaveManager.js`
  - [ ] Guardar nuevo gameState
  - [ ] Eliminar referencias a tasks, NPC positions
  - [ ] Guardar documentsToday, completedDocuments
  - [ ] Guardar flags

### 3.3 Documentos Completos
- [ ] Completar `data/documents.json`
  - [ ] 21-28 documentos totales
  - [ ] Al menos 2 docs por NPC (Beto, Yani, Marcos, Valeria)
  - [ ] Variedad de tipos (solicitud, queja, propuesta, urgente, info)
  - [ ] Algunos con spawnsDocument
  - [ ] Algunos con conditions
  - [ ] Algunos con setsFlag

### 3.4 MainMenuScene Adaptado
- [ ] Modificar `src/scenes/MainMenuScene.js`
  - [ ] Botón "Nueva Partida" → IntroScene
  - [ ] Botón "Continuar" → DeskScene
  - [ ] Verificar save correcto

### 3.5 Visual Polish
- [ ] Transiciones suaves entre documentos
- [ ] Animación de recursos cambiando
- [ ] Feedback visual al tomar decisión
- [ ] Sound effects (usar AudioManager)
- [ ] Estilo visual consistente

### 3.6 Testing Completo
- [ ] Tutorial funciona
- [ ] Save/Load funciona
- [ ] Audio funciona
- [ ] Accessibility funciona
- [ ] Performance OK
- [ ] 7 días completos sin errores
- [ ] Todos los endings alcanzables

---

## ═══════════════════════════════════════════════════════
## FASE 4: TESTING & QA (Opcional)
## ═══════════════════════════════════════════════════════

### 4.1 Tests Básicos
- [ ] Crear tests para DocumentManager
- [ ] Crear tests para DeskScene
- [ ] Crear tests para endings

### 4.2 Playtest
- [ ] Playtest completo 7 días
- [ ] Verificar cada ending
- [ ] Verificar documentos aleatorios
- [ ] Verificar flags y conditions

---

## ═══════════════════════════════════════════════════════
## CHECKLIST DE CALIDAD
## ═══════════════════════════════════════════════════════

### Jugabilidad
- [ ] Partida completa en 15-25 minutos
- [ ] Decisiones claras y comprensibles
- [ ] Preview de consecuencias visible
- [ ] Feedback inmediato de recursos
- [ ] Sin confusión sobre qué hacer

### Narrativa
- [ ] Contexto claro desde el inicio
- [ ] NPCs con personalidades distintas
- [ ] Arco narrativo coherente en 7 días
- [ ] Endings significativos

### Técnico
- [ ] Sin errores en consola
- [ ] Rendimiento estable
- [ ] Save/Load sin bugs
- [ ] Accessibility funcional
- [ ] Audio sin glitches

### UX
- [ ] UI clara y legible
- [ ] Navegación intuitiva
- [ ] Sin elementos confusos
- [ ] Controles responsivos

---

## ═══════════════════════════════════════════════════════
## MÉTRICAS DE ÉXITO
## ═══════════════════════════════════════════════════════

### Must Have
- [x] ✅ Backup de v1.0-mapa existe
- [ ] ✅ Partida completa 7 días funciona
- [ ] ✅ 3-4 endings implementados
- [ ] ✅ Save/Load funciona
- [ ] ✅ 21+ documentos creados

### Should Have
- [ ] ✅ DayEndScene con resumen
- [ ] ✅ Visual polish (transiciones, animaciones)
- [ ] ✅ Audio integrado
- [ ] ✅ Accessibility completa

### Nice to Have
- [ ] ✅ Test suite básico
- [ ] ✅ 28+ documentos con variedad
- [ ] ✅ Flags narrativos complejos
- [ ] ✅ Easter eggs o sorpresas

---

## 📊 PROGRESO GENERAL

| Fase | Estado | Completado |
|------|--------|------------|
| Fase 0: Preparación | 🟡 En progreso | 80% |
| Fase 1: Core Escritorio | ⬜ Pendiente | 0% |
| Fase 2: Funcionalidad Completa | ⬜ Pendiente | 0% |
| Fase 3: Polish & Integration | ⬜ Pendiente | 0% |
| Fase 4: Testing & QA | ⬜ Pendiente | 0% |

---

## ✅ FASE 0 COMPLETA CUANDO:
- [x] Tag v1.0-mapa creado ✅
- [x] 4 documentos de diseño creados ✅
- [ ] Rama refactor/escritorio creada
- [ ] Commit inicial pusheado
- [ ] Entendimiento claro del plan

**Estado:** 80% - Listo para crear rama y commit inicial
