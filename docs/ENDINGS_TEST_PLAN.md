# ENDINGS TEST PLAN - Red de Aguante

## 📋 Objetivo

Este documento proporciona guías paso a paso para alcanzar cada uno de los 8 finales del juego y verificar que funcionan correctamente.

**Estado:** 🔨 En implementación
**Versión:** 1.0
**Fecha:** 2025-11-23

---

## 🎯 LOS 8 FINALES

### VICTORIAS (5 finales)
1. ⭐⭐⭐ **Utopía en Ruinas** - Mejor final
2. ⭐⭐ **Red que Se Expande** - Victoria cooperativa
3. ⭐ **Supervivencia Amarga** - Victoria con costo social
4. ⚠️ **Dependencia Inevitable** - Victoria ambigua
5. 🏆 **Resistencia Heroica** - Final secreto positivo

### DERROTAS (3 finales)
6. 🟡 **Éxodo Pacífico** - Derrota digna
7. 🔴 **Colapso Caótico** - Derrota mala
8. 💔 **Traición del Sistema** - Derrota especial

---

## 🧪 TESTING METHODOLOGY

### Setup General
1. Abrir `index.html` en navegador
2. Iniciar nueva partida
3. Tener consola de desarrollador abierta (F12) para ver logs de flags y counters

### Verificación de Flags
En día 60, verificar en consola:
```javascript
console.log('Flags finales:', gameState.flags);
console.log('Counters finales:', gameState.decisionCounters);
console.log('Recursos finales:', {
  electricidad: gameState.resourceManager.get('electricidad'),
  agua: gameState.resourceManager.get('agua'),
  legitimidad: gameState.resourceManager.get('legitimidad'),
  autonomia: gameState.resourceManager.get('autonomia')
});
```

---

## 🏆 VICTORIA #1: UTOPÍA EN RUINAS (Mejor Final)

### Condiciones Necesarias
- ✅ Día 60 alcanzado
- ✅ Flag: `autonomia_mantenida`
- ✅ Flag: `comunidad_fuerte` (legitimidad >75%)
- ✅ Flag: `cooperacion_alta` (>5 decisiones cooperativas)
- ✅ Al menos 3 recursos >60%

### Paso a Paso

| Día | Encounter | Opción a Elegir | Flags/Counters Esperados |
|-----|-----------|-----------------|--------------------------|
| 3 | primera_asamblea | **Opción 4**: Organizar rifa comunitaria | +legitimidad |
| 7 | encuentro_yani | **Opción 1**: Conectar dispensario | `yani_aliada`, `decisiones_cooperativas: 1` |
| 15 | segunda_asamblea | **Opción 2**: Rechazar alianza | `autonomia_mantenida_1`, `ayudas_rechazadas: 1` |
| 20 | crisis_agua | **Opción 2**: Comprar agua embotellada | `decisiones_cooperativas: 2` |
| 22 | donacion_externa | **Opción 2**: Rechazar donación | `rechazo_ayuda_externa_1`, `autonomia_mantenida_1`, `ayudas_rechazadas: 2` |
| 25 | inspeccion_municipal | **Opción 2**: Resistir inspección | `rechazo_ayuda_externa_2`, `autonomia_mantenida_2`, `ayudas_rechazadas: 3` |
| 28 | decision_expansion | **Opción 1**: Aceptar y expandir red | `expansion_red`, `decisiones_cooperativas: 3` |
| 38-40 | sudestada_chica | **Fase 2 Opción 1**: Priorizar dispensario | `decisiones_cooperativas: 4` |
| 55 | crisis_final | **Opción 1**: Confiar en red autónoma | `victoria_autonomia`, `decisiones_cooperativas: 5` |

### Gestión de Recursos
- Priorizar tareas de legitimidad cada 5-7 días
- Mantener electricidad y agua >60% mediante reparaciones preventivas
- Evitar decisiones que cuesten autonomía

### Verificación en Día 60
**Flags esperados:**
- `autonomia_mantenida` ✓ (generado automáticamente)
- `comunidad_fuerte` ✓ (legitimidad >75%)
- `cooperacion_alta` ✓ (>5 decisiones cooperativas)
- `yani_aliada`, `expansion_red`, `victoria_autonomia`

**Ending esperado:** `victoryType: 'utopia_ruinas'`

**Mensaje:** "UTOPÍA EN RUINAS - Lo lograron. Sin rendirse, sin claudicar..."

---

## 🏆 VICTORIA #2: RED QUE SE EXPANDE

### Condiciones Necesarias
- ✅ Día 60 alcanzado
- ✅ Flag: `union_red_vecina`
- ✅ Flag: `autonomia_parcial`
- ✅ NO Flag: `ayuda_municipal`
- ✅ Electricidad y agua ≥50%

### Paso a Paso

| Día | Encounter | Opción a Elegir | Flags/Counters Esperados |
|-----|-----------|-----------------|--------------------------|
| 15 | segunda_asamblea | **Opción 1**: Aceptar alianza con La Matanza | `alianza_matanza`, `union_red_vecina`, `ayudas_aceptadas: 1` |
| 22 | donacion_externa | **Opción 3**: Negociar términos (req. 40% legitimidad) | `autonomia_parcial`, `ayudas_aceptadas: 2` |
| 25 | inspeccion_municipal | **Opción 2**: Resistir inspección | `rechazo_ayuda_externa_2`, `autonomia_mantenida_2` |
| 28 | decision_expansion | **Opción 3**: Cooperativa mixta | `cooperativa_mixta`, `union_red_vecina` |

### Gestión de Recursos
- Mantener legitimidad >40% para poder negociar (día 22)
- Balance entre electricidad y agua >50%
- OK aceptar ayudas si no comprometen autonomía total

### Verificación en Día 60
**Flags esperados:**
- `union_red_vecina` ✓
- `autonomia_parcial` ✓
- NO `ayuda_municipal`

**Ending esperado:** `victoryType: 'red_expande'`

**Mensaje:** "LA RED SE EXPANDE - Ya no están solos..."

---

## 🏆 VICTORIA #3: SUPERVIVENCIA AMARGA

### Condiciones Necesarias
- ✅ Día 60 alcanzado
- ✅ Flag: `decisiones_duras` (>3 counter)
- ✅ Flag: `personas_perdidas`
- ✅ Recursos >30% pero legitimidad <50%

### Paso a Paso

| Día | Encounter | Opción a Elegir | Flags/Counters Esperados |
|-----|-----------|-----------------|--------------------------|
| 7 | encuentro_yani | **Opción 3**: Explicar que no hay capacidad | `yani_rechazada`, `personas_perdidas`, `decisiones_duras: 1` |
| 20 | crisis_agua | **Opción 1**: Racionar agua | `racionamiento_agua`, `decisiones_duras: 2` |
| 38-40 | sudestada_fase2 | **Opción 2**: Proteger Transformador A | `decisiones_duras: 3` |
| - | Múltiples | Tomar decisiones pragmáticas que prioricen infraestructura | `decisiones_duras: 4+` |

### Gestión de Recursos
- Priorizar infraestructura sobre personas
- Dejar legitimidad bajar a <50%
- Mantener electricidad y agua >30% mediante decisiones duras

### Verificación en Día 60
**Flags esperados:**
- `decisiones_duras` ✓ (generado si counter >3)
- `personas_perdidas` ✓
- Legitimidad <50%

**Ending esperado:** `victoryType: 'supervivencia_amarga'`

**Mensaje:** "SUPERVIVENCIA AMARGA - Sobrevivieron. Pero a qué costo..."

---

## 🏆 VICTORIA #4: DEPENDENCIA INEVITABLE

### Condiciones Necesarias
- ✅ Día 60 alcanzado
- ✅ Flag: `ayuda_municipal`
- ✅ Flag: `autonomia_perdida` (autonomía <30%)

### Paso a Paso

| Día | Encounter | Opción a Elegir | Flags/Counters Esperados |
|-----|-----------|-----------------|--------------------------|
| 22 | donacion_externa | **Opción 1**: Aceptar donación y supervisión | `ayuda_externa_aceptada`, cost autonomía: -10% |
| 25 | inspeccion_municipal | **Opción 1**: Cooperar totalmente con inspección | `ayuda_municipal`, `autonomia_perdida`, autonomía: -30% |
| - | Varios | Aceptar ayudas que cuesten autonomía | Autonomía <30% |

### Gestión de Recursos
- Aceptar todas las ayudas externas ofrecidas
- Dejar autonomía caer <30%
- Recursos pueden estar bien gracias a ayudas

### Verificación en Día 60
**Flags esperados:**
- `ayuda_municipal` ✓
- `autonomia_perdida` ✓
- Autonomía <30%

**Ending esperado:** `victoryType: 'dependencia_inevitable'`

**Mensaje:** "DEPENDENCIA INEVITABLE - Sobrevivieron bajo tutela del estado..."

---

## 🏆 VICTORIA #5: RESISTENCIA HEROICA (Final Secreto)

### Condiciones Necesarias
- ✅ Día 60 alcanzado
- ✅ Flag: `rechazo_total_ayuda`
- ✅ Flag: `comunidad_unida` (0 NPCs perdidos + >5 decisiones cooperativas)
- ✅ Legitimidad >70%
- ✅ Electricidad o agua <40% (recursos bajos pero moral alta)

### Paso a Paso

| Día | Encounter | Opción a Elegir | Flags/Counters Esperados |
|-----|-----------|-----------------|--------------------------|
| 7 | encuentro_yani | **Opción 1**: Conectar dispensario | `yani_aliada`, `decisiones_cooperativas: 1` |
| 15 | segunda_asamblea | **Opción 2**: Rechazar alianza | `autonomia_mantenida_1`, `ayudas_rechazadas: 1` |
| 20 | crisis_agua | **Opción 2**: Comprar agua | `decisiones_cooperativas: 2` |
| 22 | donacion_externa | **Opción 2**: Rechazar donación | `rechazo_ayuda_externa_1`, `ayudas_rechazadas: 2` |
| 25 | inspeccion_municipal | **Opción 2**: Resistir inspección | `rechazo_ayuda_externa_2`, `ayudas_rechazadas: 3` |
| 28 | decision_expansion | **Opción 2**: Rechazar | `ayudas_rechazadas: 3` (mantener rechazo total) |
| 38-40 | sudestada_fase2 | **Opción 1**: Priorizar dispensario | `decisiones_cooperativas: 3` |
| - | Múltiples | Priorizar comunidad siempre | `decisiones_cooperativas: 6+` |

### Gestión de Recursos
- **CRÍTICO:** Rechazar TODAS las ayudas externas (ayudas_rechazadas ≥3, ayudas_aceptadas = 0)
- Priorizar legitimidad >70% (tareas de reunión vecinal)
- Deliberadamente dejar electricidad o agua <40% pero no llegar a 0
- NUNCA rechazar pedidos de NPCs (mantener 0 personas_perdidas)

### Verificación en Día 60
**Flags esperados:**
- `rechazo_total_ayuda` ✓ (generado si ayudas_rechazadas ≥3 y ayudas_aceptadas = 0)
- `comunidad_unida` ✓ (generado si NO personas_perdidas y >5 decisiones cooperativas)
- `cooperacion_alta` ✓

**Ending esperado:** `victoryType: 'resistencia_heroica'`

**Mensaje:** "RESISTENCIA HEROICA 🏆 - Contra todo pronóstico, resistieron..."

---

## 💔 DERROTA #6: ÉXODO PACÍFICO

### Condiciones Necesarias
- ✅ Día 40-59
- ✅ Flag: `evacuacion_organizada`
- ✅ Recursos críticos (<30%)

### Paso a Paso

1. **Gestión de recursos mala pero controlada** hasta día 45-50
2. Dejar que 2+ recursos caigan <30%
3. **Día 45-55:** Encounter `decision_evacuacion` debería aparecer (condicional)
4. **Opción 1:** Organizar evacuación ordenada

### Verificación
**Flag esperado:** `evacuacion_organizada` ✓

**Ending esperado:** `defeatReason: 'exodo_pacifico'`

**Mensaje:** "ÉXODO PACÍFICO 🟡 - La red no resistió. Pero se disolvió con dignidad..."

**NOTA:** Este encounter es **condicional** y solo aparece si recursos están críticos. Si no aparece, agregar lógica condicional en TimeManager.

---

## 💔 DERROTA #7: COLAPSO CAÓTICO

### Condiciones Necesarias
- ✅ Día <40
- ✅ Al menos 2 recursos = 0 simultáneamente

### Paso a Paso

1. **Día 1-39:** Gestión pésima de recursos
2. No hacer tareas de reparación
3. No resolver crisis de agua/electricidad
4. Dejar que electricidad y agua lleguen a 0% antes de día 40

### Verificación
**Ending esperado:** `defeatReason: 'colapso_caotico'`

**Mensaje:** "COLAPSO CAÓTICO 🔴 - Todo se desmoronó demasiado rápido..."

---

## 💔 DERROTA #8: TRAICIÓN DEL SISTEMA

### Condiciones Necesarias
- ✅ Flag: `ayuda_municipal`
- ✅ Flag: `inspeccion_cerro_red`
- ✅ Día <50

### Paso a Paso

| Día | Encounter | Opción a Elegir | Flags Esperados |
|-----|-----------|-----------------|-----------------|
| 25 | inspeccion_municipal | **Opción 1**: Cooperar totalmente | `ayuda_municipal`, `autonomia_perdida` |
| 35-45 | **inspeccion_cierre** (condicional) | Encounter especial | `inspeccion_cerro_red` |

### Verificación
**Flags esperados:**
- `ayuda_municipal` ✓
- `inspeccion_cerro_red` ✓

**Ending esperado:** `defeatReason: 'traicion_sistema'`

**Mensaje:** "TRAICIÓN DEL SISTEMA 💔 - Confiaron en el estado. El estado les falló..."

**NOTA:** El encounter `inspeccion_cierre` debe crearse y tener 30% chance de aparecer si jugador eligió opción 1 en `inspeccion_municipal`.

---

## 🔧 PENDIENTE: ENCOUNTERS CONDICIONALES

### 1. decision_evacuacion
**Status:** ✅ Creado en encounters.json
**Trigger:** Días 45-55 si al menos 2 recursos <30%
**Implementación pendiente:** Lógica condicional en TimeManager

```javascript
// En TimeManager.checkEvents() o MapScene
if (currentDay >= 45 && currentDay <= 55) {
  const recursosEnCrisis = 0;
  if (rm.get('electricidad') < 30) recursosEnCrisis++;
  if (rm.get('agua') < 30) recursosEnCrisis++;
  if (rm.get('legitimidad') < 30) recursosEnCrisis++;

  if (recursosEnCrisis >= 2 && !wasEncounterCompleted('decision_evacuacion')) {
    triggerEncounter('decision_evacuacion');
  }
}
```

### 2. inspeccion_cierre
**Status:** ❌ No creado aún
**Trigger:** Días 35-45 si flag `ayuda_municipal` existe, 30% chance
**Implementación pendiente:** Crear encounter + lógica condicional

```json
"inspeccion_cierre": {
  "id": "inspeccion_cierre",
  "title": "Cierre Administrativo",
  "context": "El inspector volvió. Encontró 'irregularidades'. Tienen orden de cerrar la red.",
  "options": [
    {
      "id": 1,
      "text": "Aceptar el cierre",
      "result": {
        "message": "La red fue desmantelada. El municipio se llevó todo.",
        "flags": ["inspeccion_cerro_red"]
      }
    }
  ]
}
```

---

## ✅ CHECKLIST DE TESTING

### Fase 1: Testing de Victorias
- [ ] **Utopía en Ruinas** - Playthrough completo día 1-60
- [ ] **Red que Se Expande** - Playthrough completo
- [ ] **Supervivencia Amarga** - Playthrough completo
- [ ] **Dependencia Inevitable** - Playthrough completo
- [ ] **Resistencia Heroica** - Playthrough completo (verificar flags automáticos)

### Fase 2: Testing de Derrotas
- [ ] **Éxodo Pacífico** - Verificar encounter condicional
- [ ] **Colapso Caótico** - Verificar antes de día 40
- [ ] **Traición del Sistema** - Crear encounter `inspeccion_cierre`

### Fase 3: Testing de Flags Automáticos
- [ ] `comunidad_fuerte` generado si legitimidad >75%
- [ ] `comunidad_unida` generado correctamente
- [ ] `rechazo_total_ayuda` generado si ayudas_rechazadas ≥3 y aceptadas = 0
- [ ] `cooperacion_alta` generado si >5 decisiones cooperativas
- [ ] `decisiones_duras` generado si >3 decisiones duras
- [ ] `autonomia_mantenida` generado si todas las condiciones se cumplen

### Fase 4: Balance Testing
- [ ] ¿Es posible llegar a cada final?
- [ ] ¿Los finales son alcanzables sin suerte/RNG extremo?
- [ ] ¿Los mensajes son claros y narrativamente satisfactorios?

---

## 📊 NOTAS DE BALANCE

### Recursos Recomendados para Testing
- **Utopía:** Electricidad 65%, Agua 60%, Legitimidad 80%, Autonomía 60%
- **Resistencia Heroica:** Electricidad 35%, Agua 38%, Legitimidad 75%, Autonomía 55%
- **Supervivencia Amarga:** Electricidad 50%, Agua 45%, Legitimidad 35%, Autonomía 40%

### Counters Típicos
- **Playthrough cooperativo:** decisiones_cooperativas: 8-12, decisiones_duras: 0-2
- **Playthrough pragmático:** decisiones_cooperativas: 2-4, decisiones_duras: 6-10
- **Playthrough autónomo:** ayudas_rechazadas: 3-5, ayudas_aceptadas: 0-1

---

**Versión:** 1.0
**Última actualización:** 2025-11-23
**Prioridad:** 🔴 ALTA - Testing crítico antes de release
