# Encounters → Victory Flags Mapping

Este documento mapea qué encounters deben setear qué flags para habilitar los 8 finales diferenciados.

## 📋 Estado de Implementación

| Encounter ID | Día | Flags a Agregar | Tipo | Status |
|--------------|-----|-----------------|------|--------|
| `segunda_asamblea` | 15 | `rechazo_alianza`, `alianza_matanza` | ✅ Existe | ⚠️ Modificar |
| `encuentro_yani` | 7 | `yani_aliada`, `yani_rechazada` | ✅ Existe | ⚠️ Modificar |
| **`donacion_externa`** | 22 | `rechazo_ayuda_externa_1`, `ayuda_aceptada` | ❌ No existe | 🔨 Crear |
| **`inspeccion_municipal`** | 25 | `ayuda_municipal`, `autonomia_perdida`, `autonomia_mantenida_1` | ❌ No existe | 🔨 Crear |
| `decision_expansion` | 28 | `expansion_red`, `cooperativa_mixta`, `union_red_vecina` | ✅ Existe | ⚠️ Modificar |
| `crisis_agua` | 20 | `racionamiento_agua` (ya existe), agregar counter | ✅ Existe | ⚠️ Modificar |
| `crisis_final` | 55 | `decision_autonomia_final`, `dependencia_aceptada` | ✅ Existe | ⚠️ Modificar |
| **`decision_evacuacion`** | 45-55 | `evacuacion_organizada` | ❌ No existe | 🔨 Crear (condicional) |

---

## 🔧 MODIFICACIONES REQUERIDAS

### 1. segunda_asamblea (DÍA 15)

**Status:** ✅ Ya existe, ⚠️ Modificar flags

**Archivo:** `data/encounters.json`

**Cambios:**

**Opción 1: Aceptar alianza**
```json
"flags": ["alianza_matanza", "union_red_vecina"]
```

**Opción 2: Rechazar**
```json
"flags": ["rechazo_alianza", "rechazo_ayuda_externa_1", "autonomia_mantenida_1"]
```

---

### 2. encuentro_yani (DÍA 7)

**Status:** ✅ Ya existe, ⚠️ Modificar flags

**Cambios:**

**Opción 1: Conectar dispensario**
```json
"flags": ["yani_aliada"]
// Mantener como está
```

**Opción 3: Explicar que no hay capacidad**
```json
"flags": ["yani_rechazada", "personas_perdidas"]
// Agregar tracking de NPC alejado
```

---

### 3. decision_expansion (DÍA 28)

**Status:** ✅ Ya existe, ⚠️ Modificar flags

**Cambios:**

**Opción 1: Aceptar y expandir**
```json
"flags": ["expansion_red", "union_red_vecina"]
```

**Opción 3: Cooperativa mixta**
```json
"flags": ["cooperativa_mixta", "union_red_vecina"]
```

---

### 4. crisis_agua (DÍA 20)

**Status:** ✅ Ya existe, ⚠️ Agregar counter

**Cambios:**

**Opción 1: Racionar agua**
```json
"flags": ["racionamiento_agua"],
"counters": { "decisiones_duras": 1 }
// Agregar counter para decisiones pragmáticas
```

**Opción 2: Comprar agua**
```json
"counters": { "decisiones_cooperativas": 1 }
```

---

### 5. crisis_final (DÍA 55)

**Status:** ✅ Ya existe, ⚠️ Revisar flags

**Cambios:** Verificar que opciones setean flags apropiados para finales.

---

## 🔨 ENCOUNTERS NUEVOS A CREAR

### 6. donacion_externa (DÍA 22) ⭐ CRÍTICO

**Propósito:** Primer test de autonomía. Oferta de ayuda condicionada.

**Archivo:** Agregar a `data/encounters.json`

```json
"donacion_externa": {
  "id": "donacion_externa",
  "title": "Donación Externa",
  "context": "Una ONG internacional ofrece donar 2000 créditos y un transformador. A cambio, piden 'supervisar' el uso de fondos y tener un representante en las asambleas.",
  "options": [
    {
      "id": 1,
      "text": "Aceptar donación y supervisión",
      "cost": { "autonomia": 10 },
      "requirements": {},
      "result": {
        "changes": { "creditos": 2000, "electricidad": 15 },
        "message": "Aceptaron la donación. Los recursos ayudan, pero ahora hay un representante externo en las asambleas.",
        "flags": ["ayuda_externa_aceptada"],
        "counters": { "ayudas_aceptadas": 1 }
      }
    },
    {
      "id": 2,
      "text": "Rechazar donación condicionada",
      "cost": {},
      "requirements": {},
      "result": {
        "changes": { "legitimidad": 10, "autonomia": 5 },
        "message": "Rechazaron la ayuda condicionada. Es más difícil, pero mantienen el control total de las decisiones.",
        "flags": ["rechazo_ayuda_externa_1", "autonomia_mantenida_1"],
        "counters": { "ayudas_rechazadas": 1 }
      }
    },
    {
      "id": 3,
      "text": "Negociar términos (requiere 40% legitimidad)",
      "cost": {},
      "requirements": { "legitimidad": 40 },
      "result": {
        "changes": { "creditos": 1000, "legitimidad": 5 },
        "message": "Negociaron un acuerdo intermedio. Aceptan recursos pero sin supervisión directa.",
        "flags": ["autonomia_parcial"],
        "counters": { "ayudas_aceptadas": 1 }
      }
    }
  ]
}
```

---

### 7. inspeccion_municipal (DÍA 25) ⭐ CRÍTICO

**Propósito:** Decisión clave de autonomía vs ayuda estatal. Puede llevar a final "Traición del Sistema".

**Archivo:** Agregar a `data/encounters.json`

```json
"inspeccion_municipal": {
  "id": "inspeccion_municipal",
  "title": "INSPECCIÓN MUNICIPAL",
  "context": "Un inspector del municipio llegó a la red. Dice que necesitan 'regularizar' la situación. Ofrece subsidios y materiales, pero a cambio de supervisión oficial permanente.",
  "options": [
    {
      "id": 1,
      "text": "Cooperar totalmente con inspección",
      "cost": {},
      "requirements": {},
      "result": {
        "changes": { "legitimidad": 20, "autonomia": -30, "creditos": 1500 },
        "message": "El municipio ahora supervisa la red. Tienen 'respaldo oficial' y subsidios mensuales, pero perdieron autonomía total.",
        "flags": ["ayuda_municipal", "autonomia_perdida"],
        "counters": { "ayudas_aceptadas": 1 }
      }
    },
    {
      "id": 2,
      "text": "Resistir la inspección",
      "cost": {},
      "requirements": {},
      "result": {
        "changes": { "legitimidad": -10, "autonomia": 15 },
        "message": "El inspector se fue enojado. Mantuvieron la independencia pero quedan marcados por el municipio.",
        "flags": ["rechazo_ayuda_externa_2", "autonomia_mantenida_2"],
        "counters": { "ayudas_rechazadas": 1 }
      }
    },
    {
      "id": 3,
      "text": "Negociar términos (requiere 50% legitimidad)",
      "cost": {},
      "requirements": { "legitimidad": 50 },
      "result": {
        "changes": { "legitimidad": 5, "autonomia": -10, "creditos": 800 },
        "message": "Lograron un acuerdo intermedio. Algo de supervisión, algo de autonomía. Un balance frágil.",
        "flags": ["autonomia_parcial", "ayuda_municipal_parcial"],
        "counters": { "ayudas_aceptadas": 1 }
      }
    }
  ]
}
```

**IMPORTANTE:** Si jugador elige opción 1, existe 30% chance de encounter adicional "inspeccion_cierre" en días 35-45 que setea flag `inspeccion_cerro_red` → Final "Traición del Sistema".

---

### 8. decision_evacuacion (DÍA 45-55, CONDICIONAL)

**Propósito:** Opción de evacuación organizada si recursos están críticos. Permite final "Éxodo Pacífico" en vez de "Colapso Caótico".

**Trigger:** Solo aparece si al menos 2 recursos <30% en día 45-55.

**Archivo:** Agregar a `data/encounters.json`

```json
"decision_evacuacion": {
  "id": "decision_evacuacion",
  "title": "¿Evacuar o Resistir?",
  "context": "La situación es crítica. Varios recursos están al límite. Marcos propone organizar una evacuación ordenada antes de que sea demasiado tarde. ¿Qué hacen?",
  "options": [
    {
      "id": 1,
      "text": "Organizar evacuación ordenada",
      "cost": {},
      "requirements": {},
      "result": {
        "changes": {},
        "message": "Decidieron retirarse con dignidad. Las familias se reubicarán ordenadamente en otros barrios. A veces retirarse es también resistir.",
        "flags": ["evacuacion_organizada"],
        "gameOver": true,
        "victory": false
      }
    },
    {
      "id": 2,
      "text": "Resistir hasta el final",
      "cost": {},
      "requirements": {},
      "result": {
        "changes": { "legitimidad": 15 },
        "message": "Decidieron aguantar. Pase lo que pase, no se van a rendir. La comunidad está unida en la resistencia.",
        "flags": ["resistencia_final"],
        "counters": { "decisiones_cooperativas": 1 }
      }
    }
  ]
}
```

---

## 📊 COUNTERS SYSTEM

Además de flags booleanos, necesitamos implementar counters para decisiones acumulativas:

**Agregar a gameState:**
```javascript
gameState.decisionCounters = {
  decisiones_cooperativas: 0,  // Cuenta decisiones que priorizan comunidad
  decisiones_duras: 0,          // Cuenta decisiones pragmáticas con costo social
  ayudas_rechazadas: 0,         // Cuenta ayudas externas rechazadas
  ayudas_aceptadas: 0           // Cuenta ayudas externas aceptadas
};
```

**Cómo usar en encounters:**
```json
"result": {
  "changes": { ... },
  "message": "...",
  "flags": ["flag_name"],
  "counters": { "decisiones_cooperativas": 1 }
}
```

---

## 🎯 FLAGS GENERADOS AUTOMÁTICAMENTE

Algunos flags se generan automáticamente basados en estado del juego:

### Al llegar a día 60:

```javascript
// Si legitimidad promedio últimos 10 días >75%
if (avgLegitimidad > 75) {
  gameState.flags.push('comunidad_fuerte');
}

// Si todos los NPCs siguen activos
if (todosNPCsActivos()) {
  gameState.flags.push('comunidad_unida');
}

// Si rechazaron TODAS las ayudas externas
if (gameState.decisionCounters.ayudas_rechazadas >= 3 &&
    gameState.decisionCounters.ayudas_aceptadas === 0) {
  gameState.flags.push('rechazo_total_ayuda');
}

// Si tomaron >5 decisiones cooperativas
if (gameState.decisionCounters.decisiones_cooperativas > 5) {
  gameState.flags.push('cooperacion_alta');
}

// Si tomaron >3 decisiones duras
if (gameState.decisionCounters.decisiones_duras > 3) {
  gameState.flags.push('decisiones_duras');
}

// Si autonomía mantenida en TODOS los encounters críticos
if (gameState.flags.includes('autonomia_mantenida_1') &&
    gameState.flags.includes('autonomia_mantenida_2') &&
    !gameState.flags.includes('ayuda_municipal')) {
  gameState.flags.push('autonomia_mantenida');
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Encounters Existentes a Modificar:
- [ ] `segunda_asamblea` - Agregar flags de autonomía
- [ ] `encuentro_yani` - Agregar flag `personas_perdidas`
- [ ] `decision_expansion` - Agregar `union_red_vecina`
- [ ] `crisis_agua` - Agregar counter `decisiones_duras`
- [ ] `sudestada_chica_fase2` - Agregar counters
- [ ] `crisis_final` - Revisar flags finales

### Encounters Nuevos a Crear:
- [ ] `donacion_externa` (día 22)
- [ ] `inspeccion_municipal` (día 25)
- [ ] `inspeccion_cierre` (día 35-45, condicional)
- [ ] `decision_evacuacion` (día 45-55, condicional)

### Sistema:
- [ ] Agregar `gameState.decisionCounters`
- [ ] Implementar counters en EncounterScene
- [ ] Implementar flags automáticos en TimeManager (día 60)
- [ ] Refactorizar EndGameScene.determineEnding()

---

**Versión:** 1.0
**Fecha:** 2025-11-23
**Prioridad:** 🔴 ALTA
