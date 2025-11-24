# Test Plan - Sistema de Arcos Narrativos de NPCs

**Fecha:** 2025-11-24
**Sistema:** Character Arc Narrative System
**Versión:** 1.0
**Alcance:** Progresión temporal, triggers, paths, persistencia, rejugabilidad

---

## Resumen Ejecutivo

Este plan de testing valida el **Sistema de Arcos Narrativos** implementado para los 3 NPCs principales (Beto, Yani, Marcos). El sistema debe:

1. ✅ Progresar arcos basado en **tiempo** (días 1-20 → Stage 1, 21-40 → Stage 2, 41-60 → Stage 3)
2. ✅ Permitir **progresión temprana** vía triggers de encounters
3. ✅ Ramificar en **8 paths diferentes** en Act 3 según decisiones del jugador
4. ✅ Mostrar **73+ diálogos contextuales** únicos
5. ✅ Persistir correctamente en **save/load**
6. ✅ Generar **rejugabilidad** (diferentes runs → diferentes paths)

---

## Test 1: Progresión Temporal Base

**Objetivo:** Verificar que los arcos progresan automáticamente según el día actual.

### Escenario 1.1: Act 1 → Act 2 (Día 21)

**Pasos:**
1. Iniciar nuevo juego
2. Verificar que Beto, Yani, Marcos tienen `arc.stage = 1`
3. Avanzar al día 21 usando debug key `T`
4. Verificar en console log: `Beto: Arc progressed 1 → 2`
5. Hablar con Beto/Yani/Marcos en el mapa
6. **Resultado Esperado:** Diálogos de Act 2 (ej: Beto habla de expansión, Yani menciona cansancio, Marcos propone ideas)

**Criterios de Éxito:**
- Console log muestra progresión correcta
- `gameState.characters.beto.arc.stage === 2`
- `gameState.characters.yani.arc.stage === 2`
- `gameState.characters.marcos.arc.stage === 2`
- Diálogos cambian a variantes de Act 2

---

### Escenario 1.2: Act 2 → Act 3 (Día 41)

**Pasos:**
1. Continuar del escenario anterior
2. Avanzar al día 41
3. Verificar progresión a `stage = 3`
4. Hablar con NPCs
5. **Resultado Esperado:** Diálogos de Act 3 (más maduros, reflexivos, o desesperanzados según path)

**Criterios de Éxito:**
- `arc.stage === 3` para todos los NPCs
- Diálogos de Act 3 se muestran
- Si no hay triggers específicos, usan diálogos "default" de Act 3

---

## Test 2: Progresión por Triggers (Early Unlocking)

**Objetivo:** Verificar que encounters clave pueden adelantar la progresión de arco.

### Escenario 2.1: Marcos - Progresión Temprana (Día 29)

**Pasos:**
1. Nuevo juego
2. Avanzar al día 29
3. Completar encounter `marcos_primera_voz`
4. Elegir **Opción 1**: "Apoyar su propuesta completamente"
5. Verificar console log: `Arc trigger added: marcos.arc.triggers[] += "marcos_primera_voz"`
6. Verificar console log: `Arc trigger added: marcos.arc.triggers[] += "marcos_apoyado"`
7. Verificar: `marcos arc updated to stage 2, path: lider`
8. **Resultado Esperado:** Marcos avanza a Stage 2 inmediatamente (antes del día 21)

**Criterios de Éxito:**
- `gameState.characters.marcos.arc.stage === 2` (en día 29, antes de lo normal)
- `gameState.characters.marcos.arc.triggers` contiene `["marcos_primera_voz", "marcos_apoyado"]`
- `gameState.characters.marcos.arc.path === null` (path se setea en Act 3)

---

### Escenario 2.2: Beto - Path Idealista (Día 30)

**Pasos:**
1. Nuevo juego
2. Avanzar al día 30
3. Completar encounter `beto_propone_expansion`
4. Elegir **Opción 1**: "Apoyar la visión de Beto"
5. Verificar arcTriggers se aplican:
   - `beto_propone_expansion` → Force stage 2
   - `beto_idealista_activado` → Set path 'idealista' cuando llegue a stage 3
6. Avanzar al día 41 (cuando temporal force stage 3)
7. **Resultado Esperado:** Beto entra en path "idealista" automáticamente

**Criterios de Éxito:**
- Día 30: `arc.stage === 2`, `arc.triggers` contiene `["beto_propone_expansion", "beto_idealista_activado"]`
- Día 41: `arc.stage === 3`, `arc.path === "idealista"`
- Diálogos de Beto Idealista se muestran (ej: "Conectamos con dos barrios más. La red está creciendo, loco.")

---

### Escenario 2.3: Yani - Path Burnout (Día 35)

**Pasos:**
1. Nuevo juego
2. Avanzar al día 35
3. Completar encounter `yani_al_limite`
4. Elegir **Opción 2**: "Presionar para que aguante"
5. Verificar: `yani_revelacion` + `yani_burnout` flags
6. Avanzar al día 41
7. **Resultado Esperado:** Yani entra en path "burnout"

**Criterios de Éxito:**
- Día 35: `arc.stage === 2`, triggers = `["yani_revelacion", "yani_burnout"]`
- Día 41: `arc.stage === 3`, `arc.path === "burnout"`
- Diálogos de Yani Burnout (ej: "No sé si puedo seguir así...")

---

## Test 3: Paths Diferenciados en Act 3

**Objetivo:** Verificar que cada NPC tiene múltiples paths y los diálogos son únicos.

### Test 3.1: Beto - 2 Paths

**Path A: Idealista**
- Trigger: `beto_idealista_activado`
- Diálogo esperado: "Conectamos con dos barrios más. La red está creciendo, loco."

**Path B: Pragmático**
- Trigger: `beto_desalentado`
- Diálogo esperado: "Bueno, al menos mantuvimos todo funcionando. No es poco."

**Pasos:**
1. **Run 1:** Día 30 → Opción 1 de beto_propone_expansion → Avanzar a día 45 → Verificar path idealista
2. **Run 2:** Día 30 → Opción 2 de beto_propone_expansion → Avanzar a día 45 → Verificar path pragmatico

**Criterios de Éxito:**
- Diálogos son diferentes entre runs
- `arc.path` se setea correctamente

---

### Test 3.2: Yani - 3 Paths

**Path A: Balanceada**
- Trigger: `yani_tomo_descanso`
- Diálogo esperado: "Ahora pongo límites. Aprendí a cuidarme para poder cuidar."

**Path B: Burnout**
- Trigger: `yani_burnout`
- Diálogo esperado: "Estoy cansada... no sé si puedo seguir así."

**Path C: Comunitaria**
- Trigger: `yani_equipo_salud`
- Diálogo esperado: "Ya no estoy sola. El equipo de promotores cambió todo."

**Pasos:**
1. **Run 1:** Día 35 → Opción 1 → Path balanceada
2. **Run 2:** Día 35 → Opción 2 → Path burnout
3. **Run 3:** Día 35 → Opción 3 → Path comunitaria

**Criterios de Éxito:**
- 3 paths diferentes generan diálogos únicos
- Flags se setean correctamente

---

### Test 3.3: Marcos - 3 Paths

**Path A: Líder**
- Trigger: `marcos_apoyado`
- Diálogo esperado: "Ahora coordino el sistema hídrico de 3 barrios. Nunca pensé que iba a llegar a esto."

**Path B: Callado (default)**
- No trigger específico
- Diálogo esperado: "El agua sigue fluyendo. Hago mi trabajo."

**Path C: Retraído**
- Trigger: `marcos_ignorado`
- Diálogo esperado: "Ya no propongo nada. Solo arreglo lo que se rompe."

**Pasos:**
1. **Run 1:** Día 29 → Opción 1 → Path líder
2. **Run 2:** Día 29 → Opción 3 → Path callado (default)
3. **Run 3:** Día 29 → Opción 2 → Path retraído

**Criterios de Éxito:**
- 3 paths diferentes
- Diálogos únicos por path

---

## Test 4: Persistencia (Save/Load)

**Objetivo:** Verificar que arc state persiste correctamente entre sesiones.

### Escenario 4.1: Guardar en Act 2, Cargar y Verificar

**Pasos:**
1. Nuevo juego
2. Avanzar al día 30
3. Completar `beto_propone_expansion` (Opción 1 - idealista)
4. Verificar: `beto.arc.stage === 2`, `beto.arc.triggers` contiene flags
5. Presionar **F8** (guardar)
6. Refrescar página
7. Presionar **F9** (cargar)
8. Verificar en console: Arc state restaurado
9. Verificar: `gameState.characters.beto.arc.stage === 2`
10. Verificar: `gameState.characters.beto.arc.triggers` contiene `["beto_propone_expansion", "beto_idealista_activado"]`

**Criterios de Éxito:**
- Arc stage persiste
- Arc triggers persiste
- Arc path persiste (si ya estaba seteado)
- Diálogos post-load son correctos

---

### Escenario 4.2: Guardar en Act 3 con Path, Cargar

**Pasos:**
1. Continuar del escenario anterior
2. Avanzar al día 45
3. Verificar: `beto.arc.path === "idealista"`
4. Guardar (F8)
5. Recargar página
6. Cargar (F9)
7. Verificar: `beto.arc.path === "idealista"`
8. Hablar con Beto
9. **Resultado Esperado:** Diálogo de Beto Idealista se muestra correctamente

**Criterios de Éxito:**
- Path persiste post-load
- Diálogos contextuales funcionan correctamente

---

## Test 5: Diálogos Contextuales

**Objetivo:** Verificar que los 73+ diálogos únicos se muestran correctamente.

### Test 5.1: Variación de Diálogos por Stage

**Pasos:**
1. Nuevo juego
2. **Día 5:** Hablar con Beto 5 veces (anotar diálogos) - **Act 1 esperado**
3. **Día 25:** Hablar con Beto 5 veces (anotar diálogos) - **Act 2 esperado**
4. **Día 50:** Hablar con Beto 5 veces (anotar diálogos) - **Act 3 esperado**
5. Verificar que diálogos son diferentes entre stages
6. Verificar variación aleatoria dentro de cada stage

**Criterios de Éxito:**
- Diálogos de Act 1 son pragmáticos, técnicos ("Transformadores al 70%...")
- Diálogos de Act 2 mencionan expansión, visión ("Estuve pensando... podríamos ayudar a otros barrios")
- Diálogos de Act 3 reflejan el path (idealista vs pragmatico)
- Aleatoriedad funciona (no siempre el mismo diálogo)

---

### Test 5.2: Diálogos de Valeria (Líder Estable)

**Objetivo:** Verificar que Valeria tiene diálogos pero NO tiene paths (siempre estable).

**Pasos:**
1. Hablar con Valeria en días 10, 30, 50
2. Verificar que diálogos progresan (Act 1 → 2 → 3)
3. Verificar que NO hay branching (no hay paths)

**Criterios de Éxito:**
- Valeria tiene 9 diálogos (3 por stage)
- No tiene paths
- Diálogos reflejan su rol como líder estable

---

## Test 6: Rejugabilidad

**Objetivo:** Verificar que diferentes runs generan experiencias narrativas únicas.

### Escenario 6.1: Run Completo - Paths Idealistas

**Pasos:**
1. Nuevo juego
2. **Día 29:** marcos_primera_voz → Opción 1 (apoyar)
3. **Día 30:** beto_propone_expansion → Opción 1 (apoyar visión)
4. **Día 35:** yani_al_limite → Opción 3 (equipo de promotores)
5. Avanzar al día 55
6. Anotar diálogos finales de los 3 NPCs

**Resultado Esperado:**
- Marcos: Líder confiado
- Beto: Idealista territorial
- Yani: Cuidadora comunitaria
- Narrativa general: Empoderamiento colectivo

---

### Escenario 6.2: Run Completo - Paths Pesimistas

**Pasos:**
1. Nuevo juego
2. **Día 29:** marcos_primera_voz → Opción 2 (cuestionar)
3. **Día 30:** beto_propone_expansion → Opción 2 (rechazar)
4. **Día 35:** yani_al_limite → Opción 2 (presionar)
5. Avanzar al día 55
6. Anotar diálogos finales

**Resultado Esperado:**
- Marcos: Retraído, solo hace lo mínimo
- Beto: Desalentado, perdió la visión
- Yani: Burnout, al límite
- Narrativa general: Desgaste y supervivencia

**Criterios de Éxito:**
- Experiencia narrativa completamente diferente entre runs
- Diálogos reflejan las consecuencias de decisiones pasadas
- Rejugabilidad aumentada significativamente

---

## Test 7: Integración con Sistema Existente

**Objetivo:** Verificar que arc system NO rompe funcionalidad existente.

### Test 7.1: Encounters Previos Funcionan

**Pasos:**
1. Completar encounters existentes (primera_asamblea, crisis_tormenta, etc.)
2. Verificar que NO hay errores en console
3. Verificar que flags y counters siguen funcionando
4. Verificar que recursos se modifican correctamente

**Criterios de Éxito:**
- No hay errores de consola
- Funcionalidad previa intacta

---

### Test 7.2: Task System Compatible

**Pasos:**
1. Asignar tareas a Beto/Yani/Marcos
2. Verificar que tareas funcionan normalmente
3. Verificar que diálogos de NPC asignados a tareas siguen funcionando

**Criterios de Éxito:**
- Task assignment funciona
- NPCs ocupados no crashean el diálogo

---

## Test 8: Edge Cases

### Test 8.1: Flags Duplicados

**Pasos:**
1. Forzar situación donde el mismo flag se intenta agregar dos veces
2. Verificar que no hay duplicados en `arc.triggers[]`

**Criterio de Éxito:**
- Array no tiene duplicados (código ya verifica con `.includes()`)

---

### Test 8.2: Character No Existe

**Pasos:**
1. Modificar temporalmente encounters.json para tener arcTrigger de character "invalid"
2. Completar encounter
3. Verificar console warning: `Character invalid not found for arc trigger`

**Criterio de Éxito:**
- No crashea
- Warning claro en console

---

### Test 8.3: Missing Arc Object

**Pasos:**
1. Temporalmente eliminar `arc` de `gameState.characters.beto`
2. Intentar hablar con Beto
3. Verificar: Warning en console

**Criterio de Éxito:**
- No crashea
- Fallback message mostrado

---

## Checklist de Testing Completo

- [ ] **Test 1.1:** Progresión temporal Día 21 (Act 1 → 2)
- [ ] **Test 1.2:** Progresión temporal Día 41 (Act 2 → 3)
- [ ] **Test 2.1:** Marcos progresión temprana (Día 29)
- [ ] **Test 2.2:** Beto path idealista (Día 30)
- [ ] **Test 2.3:** Yani path burnout (Día 35)
- [ ] **Test 3.1:** Beto 2 paths diferentes
- [ ] **Test 3.2:** Yani 3 paths diferentes
- [ ] **Test 3.3:** Marcos 3 paths diferentes
- [ ] **Test 4.1:** Save/Load Act 2
- [ ] **Test 4.2:** Save/Load Act 3 con path
- [ ] **Test 5.1:** Variación de diálogos por stage
- [ ] **Test 5.2:** Diálogos de Valeria
- [ ] **Test 6.1:** Run completo paths idealistas
- [ ] **Test 6.2:** Run completo paths pesimistas
- [ ] **Test 7.1:** Encounters previos funcionan
- [ ] **Test 7.2:** Task system compatible
- [ ] **Test 8.1:** Flags duplicados manejados
- [ ] **Test 8.2:** Character inválido manejado
- [ ] **Test 8.3:** Missing arc object manejado

---

## Bugs Conocidos / Limitaciones

1. **Performance:** `updateNPCArcs()` se ejecuta cada día. Con 4 characters es trivial, pero escala mal si hubiera 50+ NPCs.
2. **Diálogos Aleatorios:** No hay garantía de no-repetición. Si un NPC tiene 5 diálogos, podrías ver el mismo 2 veces seguidas (baja probabilidad).
3. **Path Conflicts:** Si un player triggerea dos flags incompatibles del mismo NPC (ej: `beto_idealista_activado` Y `beto_desalentado`), el sistema usa el primero que encuentra. Esto no debería pasar en encounters bien diseñados.

---

## Próximos Pasos (Post-Testing)

1. ✅ Ejecutar todos los tests del checklist
2. ✅ Documentar bugs encontrados
3. ✅ Ajustar balance de costs si es necesario
4. ✅ Crear PR con toda la implementación
5. 🔄 Iterar basado en feedback de usuarios
6. 🔄 (Opcional) Añadir más diálogos si hay tiempo
7. 🔄 (Opcional) Implementar sistema de "memoria" (NPCs recuerdan conversaciones previas)

---

**Fecha de última actualización:** 2025-11-24
**Autor:** Claude (AI Assistant)
**Estado:** Ready for Testing
