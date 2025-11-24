# Plan de Trabajo - Rewrite de Encounters

**Fecha:** 2025-11-24
**Basado en:** ENCOUNTERS_QUALITY_AUDIT.md
**Objetivo:** Elevar encounters tier C/B bajo a tier B/A (14+/20)

---

## Encounters Identificados para Rewrite

| # | ID | Día | Score | Problemas Principales | Esfuerzo |
|---|----|----|-------|----------------------|----------|
| 1 | yani_seguimiento | Variable | 10/20 (C) | Diálogo genérico, trade-off nulo (opción 2 domina), flags no usados, no evoca 2037 | 1.5h |
| 2 | yani_preparacion_final | Variable | 12/20 (B) | "Invierno duro" sin especificar, opción gratis da 75% beneficio, flags sin payoff, no hay evento invierno | 1.5h |
| 3 | crisis_tormenta | ~12 | 13/20 (B) | Diálogo genérico y apresurado, no involucra a Beto, opción 1 claramente peor (doble pérdida), solo 2 opciones | 1.5h |
| 4 | decision_evacuacion | 45-55 | 13/20 (B) | Diálogo vago, opción 2 obviamente mejor (+15 legit gratis), no especifica logística evacuación, solo 2 opciones | 1.5h |
| 5 | marcos_mantenimiento | Variable | 14/20 (B) | Tono transaccional (pagar=beneficio lineal), "posibles problemas" no se materializan, flag no usado, falta detalle técnico | 1h |

**Total estimado:** 7-8h

---

## Priorización de Rewrites

### MUST DO (críticos - hacer sí o sí):

**1. yani_seguimiento** (10/20 - TIER C)
- ❌ Único encounter en tier C
- ❌ Problemas múltiples (autenticidad 2/5, trade-offs 2/5)
- ✅ Parte del arco de Yani (personaje importante)
- 🔴 **PRIORIDAD MÁXIMA**

**2. crisis_tormenta** (13/20 - TIER B bajo)
- ❌ Encounter temprano (día ~12) → establece tono
- ❌ No involucra NPCs cuando debería (Beto ausente)
- ❌ Trade-off roto (opción 1 solo tiene costos)
- 🟠 **PRIORIDAD ALTA**

**3. decision_evacuacion** (13/20 - TIER B bajo)
- ❌ Conditional encounter → afecta endings
- ❌ Opción 2 domina completamente
- ❌ Diálogo muy vago para momento crítico
- 🟠 **PRIORIDAD ALTA**

### SHOULD DO (importantes - hacer si hay tiempo):

**4. yani_preparacion_final** (12/20 - TIER B)
- ⚠️ Cierre del arco de Yani (importante narrativamente)
- ⚠️ Trade-off roto (opción gratis 75% del beneficio)
- ⚠️ Setup sin payoff (invierno nunca llega)
- 🟡 **PRIORIDAD MEDIA**

**5. marcos_mantenimiento** (14/20 - TIER B)
- ⚠️ Encounter menor, no crítico
- ⚠️ Problemas menores de tono
- ⚠️ Trade-off escalera (completo > mínimo > nada)
- 🟢 **PRIORIDAD BAJA**

---

## Orden de Ejecución

Hacer rewrites en este orden (eficiencia narrativa):

### 1. yani_seguimiento (1.5h)
**Razón:** Único tier C, urgente. Arreglar antes de hacer yani_preparacion_final (coherencia de arco).

### 2. yani_preparacion_final (1.5h)
**Razón:** Una vez arreglado yani_seguimiento, completar arco de Yani con cierre fuerte.

### 3. crisis_tormenta (1.5h)
**Razón:** Encounter temprano, establece tono. Importante para primera impresión del jugador.

### 4. decision_evacuacion (1.5h)
**Razón:** Conditional encounter crítico para endings, pero ocurre tarde (solo si 2+ recursos <30%).

### 5. marcos_mantenimiento (1h)
**Razón:** Menor impacto, hacer solo si sobra tiempo. Problemas son de tono, no estructurales.

---

## Ejemplos de Mejoras Aplicadas

### Ejemplo 1: De Cliché a Auténtico

**ANTES (problemático):**
```
Dialogue: "Che boludo, necesitamos arreglar el transformador. Vamos a tomar unos mates y pensarlo, ¿viste?"
```

**Problemas:**
- Uso forzado de "che boludo"
- Mate como cliché
- "¿viste?" muletilla repetitiva

**DESPUÉS (mejorado):**
```
Dialogue: "Mirá, el transformador B está por fundirse. Si esperamos mucho más, nos quedamos sin luz en todo el sector. Hay que decidir ahora."
```

**Mejoras:**
- Lenguaje natural y directo
- Enfoque en el problema específico
- Urgencia clara sin artificialidad

---

### Ejemplo 2: De Opción Dominante a Trade-off Real

**ANTES (problemático):**
```json
Opción 1: "Reparar bien" → +30 elec, -100 créditos
Opción 2: "Reparar barato" → +15 elec, -200 créditos
Opción 3: "No reparar" → Sin efecto
```
**Problema:** Opción 1 domina (más beneficio, menos costo)

**DESPUÉS (mejorado):**
```json
Opción 1: "Reparación profesional"
  → +30 elec, -400 créditos, 5 días espera
  Trade-off: Mejor resultado, pero caro y lento

Opción 2: "Reparación comunitaria"
  → +20 elec, -150 créditos, -5 legitimidad (pedir favores)
  Trade-off: Barato pero costo social

Opción 3: "Parche temporal"
  → +10 elec inmediato, flag "parche_temporal" (problema futuro)
  Trade-off: Rápido pero no soluciona raíz
```

**Mejora:** Cada opción tiene pros/cons únicos, no hay dominancia

---

### Ejemplo 3: De Consecuencia Ilógica a Coherente

**ANTES (problemático):**
```json
Opción: "Organizar evento comunitario"
Consequences: { "electricidad": +15 }
```
**Problema:** ¿Por qué un evento da electricidad? No tiene sentido.

**DESPUÉS (mejorado):**
```json
Opción: "Organizar evento comunitario"
Consequences: {
  "legitimidad": +12,
  "autonomia": +5,
  "creditos": -100
}
```

**Mejora:** Consecuencias lógicas (evento mejora moral y cohesión, cuesta dinero)

---

### Ejemplo 4: De Vago a Específico (2037)

**ANTES (problemático):**
```
Dialogue: "Hay problemas con la tecnología. Todo está roto."
```

**Problema:** Demasiado genérico, no evoca 2037 específicamente

**DESPUÉS (mejorado):**
```
Dialogue: "Los sensores del sistema de distribución están fallando. Sin telemetría, no sabemos qué sector está perdiendo agua hasta que alguien se queja."
```

**Mejora:**
- Tecnología específica (sensores, telemetría)
- Problema concreto y visualizable
- Evoca futuro cercano sin ser ciencia ficción

---

## Estrategia de Priorización (si hay límite de tiempo)

### Minimum Viable Rewrites (3 horas)

Si solo hay 3h disponibles, hacer estos 3:

1. **yani_seguimiento** - 1.5h (CRÍTICO - único tier C)
2. **crisis_tormenta** - 1h (IMPORTANTE - temprano, establece tono)
3. **decision_evacuacion** - 30min (ajustes rápidos, conditional importante)

Esto asegura que:
- ✅ No hay encounters tier C
- ✅ Primera impresión (día 12) está pulida
- ✅ Conditional encounter crítico está arreglado

---

## Checklist Pre-Rewrite

Antes de empezar cada rewrite, verificar:

- [ ] Leí audit completo del encounter
- [ ] Identifiqué 3 problemas específicos a resolver
- [ ] Revisé otros diálogos del mismo NPC (voice consistency)
- [ ] Revisé encuentros tier A como referencia
- [ ] Tengo claro qué flags setea y si se usan después
- [ ] Revisé balance de recursos (decay rates actuales)

---

## Próximos Pasos

1. ✅ Audit completo (DONE - ENCOUNTERS_QUALITY_AUDIT.md)
2. ✅ Plan de trabajo (DONE - este documento)
3. ⏳ Reescribir encounter #1: yani_seguimiento
4. [ ] Reescribir encounter #2: yani_preparacion_final
5. [ ] Reescribir encounter #3: crisis_tormenta
6. [ ] Reescribir encounter #4: decision_evacuacion
7. [ ] Reescribir encounter #5: marcos_mantenimiento
8. [ ] Crear REWRITE_CHANGELOG.md
9. [ ] Testing in-game
10. [ ] Commit y push

**Estado:** Ready to start rewrites
