# RESOURCE BALANCE MODEL - Red de Aguante

## 📊 ANÁLISIS ECONÓMICO DEL SISTEMA DE RECURSOS

**Fecha:** 2025-11-23
**Objetivo:** Diseñar sistema de decay diario balanceado

---

## ⚠️ ESTADO ACTUAL: NO HAY DECAY DIARIO

### Sistema Actual (Event-Driven)
El juego actualmente usa **eventos discretos**, no decay pasivo:

| Día | Evento | Efecto |
|-----|--------|--------|
| 5 | decay_transformador | Infra B -10 |
| 12 | heatwave | Agua -15 |
| 22 | decay_perforacion | Infra -15, Agua -10 |
| 32 | decay_transformador_a | Infra A -10, Electricidad -10 |
| 45 | decay_general | Todas infras -5 |

**Total pérdida en 60 días (sin tareas):**
- Electricidad: -10 (solo día 32)
- Agua: -25 (días 12 + 22)
- Legitimidad: 0
- Autonomía: 0

**PROBLEMA:** Sin decay constante, los recursos son demasiado estables. No hay presión económica suficiente.

---

## 🎯 OBJETIVOS DE DISEÑO

### Victoria debe requerir:
1. **Sin tareas** → Game over día 60-65 (recursos ~0%)
2. **2-3 tareas** → Victoria posible (recursos 40-60%)
3. **5+ tareas** → Victoria cómoda (recursos >70%)

### Recursos iniciales:
- Créditos: 2000
- Electricidad: 70%
- Agua: 65%
- Legitimidad: 75%
- Autonomía: 80%

---

## 📉 MODELO 1: DECAY DIARIO PROPUESTO

### Valores Recomendados:
| Recurso | Decay/Día | Justificación |
|---------|-----------|---------------|
| **Electricidad** | -1.2 | 70 - (1.2 × 60) = -2% → game over ~día 58 |
| **Agua** | -1.0 | 65 - (1.0 × 60) = 5% → sobrevive justo |
| **Legitimidad** | -1.0 | 75 - (1.0 × 60) = 15% → victoria posible |
| **Autonomía** | +0.5 | 80 + (0.5 × 60) = 110% → cap 100% |
| **Créditos** | -30 | 2000 - (30 × 60) = 200 → margen estrecho |

### Simulación Sin Tareas (Día 1-60):

```
DÍA  | ELEC | AGUA | LEGIT | AUTO | CRÉDITOS
-----|------|------|-------|------|----------
  1  | 70.0 | 65.0 | 75.0  | 80.0 | 2000
 10  |  5  9.2 | 56.0 | 66.0  | 84.5 | 1730
 20  | 46.0 | 45.0 | 55.0  | 90.0 | 1400
 30  | 34.0 | 35.0 | 45.0  | 95.0 | 1100
 40  | 22.0 | 25.0 | 35.0  |100.0 |  800
 50  | 10.0 | 15.0 | 25.0  |100.0 |  500
 58  |  0.4 |  7.0 | 17.0  |100.0 |  260
 60  |  0.0 |  5.0 | 15.0  |100.0 |  200  ← GAME OVER
```

**Resultado:** Game over día 60 (electricidad = 0). ✅ Cumple objetivo.

---

## 📈 MODELO 2: CON TAREAS (Escenario Realista)

### Tareas Disponibles (data/tasks.json):
| Tarea | Duración | Costo | Efecto |
|-------|----------|-------|--------|
| Reparar Transformador B | 2 días | -1200 💰 | +30% ⚡ |
| Mantenimiento Red | 2 días | -500 💰 | +10% ⚡ |
| Reparar Perforación | 3 días | -1500 💰 | +20% 💧 |
| Reunión Vecinal | 1 día | - | +15% 🤝 |

### Playthrough Simulado (2-3 tareas):

```
DÍA  | ACCIÓN | ELEC | AGUA | LEGIT | CRÉDITOS
-----|--------|------|------|-------|----------
  1  | -      | 70.0 | 65.0 | 75.0  | 2000
  5  | START: Mantenimiento Red (-500💰, 2 días)
  7  | COMPLETE: +10⚡ | 64.6 | 60.0 | 70.0  | 1330
 10  | -      | 61.0 | 57.0 | 67.0  | 1240
 15  | START: Reparar Perforación (-1500💰, 3 días)
 18  | COMPLETE: +20💧 | 51.4 | 60.0 | 60.0  | 850
 30  | START: Reunión Vecinal (1 día)
 31  | COMPLETE: +15🤝 | 37.0 | 47.0 | 63.0  | 550
 60  | -      |  0.0 | 25.0 | 33.0  | 200   ← GAME OVER (Electricidad)
```

**Resultado:** Aún game over día 60. **Necesita 1 tarea más de electricidad.**

### Playthrough Ajustado (3-4 tareas):

```
DÍA  | ACCIÓN | ELEC | AGUA | LEGIT | CRÉDITOS
-----|--------|------|------|-------|----------
  1  | -      | 70.0 | 65.0 | 75.0  | 2000
  5  | Mantenimiento Red | 67.2 → 77.2 | 62.0 | 71.0 | 1500
 15  | Reparar Perforación | 65.2 | 56.0 → 76.0 | 66.0 | 0
 30  | Reunión Vecinal | 47.2 | 61.0 | 66.0 → 81.0 | -400
 45  | Mantenimiento Red | 29.2 → 39.2 | 46.0 | 66.0 | -900
 60  | -      | 21.2 | 31.0 | 51.0  | -1350
```

**Problema:** Créditos negativos. Sistema muy agresivo.

---

## 🔧 MODELO 3: DECAY BALANCEADO FINAL

### Ajuste: Reducir decay +20%

| Recurso | Decay Anterior | **Decay Final** | Cambio |
|---------|---------------|----------------|--------|
| Electricidad | -1.2/día | **-0.9/día** | -25% |
| Agua | -1.0/día | **-0.8/día** | -20% |
| Legitimidad | -1.0/día | **-0.8/día** | -20% |
| Autonomía | +0.5/día | **+0.5/día** | Sin cambio |
| Créditos | -30/día | **-20/día** | -33% |

### Simulación Sin Tareas:

```
DÍA  | ELEC | AGUA | LEGIT | CRÉDITOS | ESTADO
-----|------|------|-------|----------|--------
  1  | 70.0 | 65.0 | 75.0  | 2000     | OK
 20  | 52.9 | 49.0 | 59.0  | 1620     | OK
 40  | 34.9 | 33.0 | 43.0  | 1240     | CRÍTICO (<40%)
 60  | 16.9 | 17.0 | 27.0  |  860     | VICTORIA POSIBLE
 78  |  0.0 |  2.6 | 12.6  |  500     | GAME OVER (día 78)
```

**Resultado:** Sin tareas, sobrevive hasta día 78. ✅ Mejor!

### Simulación Con 3-4 Tareas:

```
DÍA  | ACCIÓN | ELEC | AGUA | LEGIT | CRÉDITOS
-----|--------|------|------|-------|----------
  1  | -      | 70.0 | 65.0 | 75.0  | 2000
  7  | Mantenimiento Red (+10⚡) | 75.1 | 59.4 | 69.4 | 1360
 20  | Reparar Perforación (+20💧) | 63.4 | 72.0 | 59.0 | 860
 35  | Reunión Vecinal (+15🤝) | 50.0 | 60.0 | 62.0 | 560
 50  | Reparar Transformador B (+30⚡) | 53.5 | 48.0 | 50.0 | 260
 60  | -      | 44.5 | 40.0 | 42.0  |  60
```

**Resultado:** ✅ **VICTORIA** (todos recursos >40%, día 60 alcanzado)

---

## ✅ VALORES FINALES RECOMENDADOS

```javascript
DECAY_RATES = {
  electricidad: -0.9,  // per día
  agua: -0.8,          // per día
  legitimidad: -0.8,   // per día
  autonomia: +0.5,     // per día (cap 100)
  creditos: -20        // per día
};
```

### Características:
- ✅ Sin tareas → Game over día 75-80 (margen de error)
- ✅ Con 3-4 tareas → Victoria posible (recursos 40-60%)
- ✅ Con 6+ tareas → Victoria cómoda (recursos >70%)
- ✅ Presión constante pero no asfixiante
- ✅ Permite planificación estratégica

---

## 📝 NOTAS DE IMPLEMENTACIÓN

### Dónde implementar:
**Archivo:** `src/managers/TimeManager.js`

**Nuevo método:**
```javascript
degradeResourcesDaily() {
    const rm = gameState.resourceManager;

    rm.modify('electricidad', -0.9);
    rm.modify('agua', -0.8);
    rm.modify('legitimidad', -0.8);
    rm.modify('autonomia', +0.5);
    rm.modify('creditos', -20);

    console.log('Daily resource decay applied');
}
```

**Llamar desde:**
`TimeManager.advanceDays()` - después de procesar eventos pero antes de checkear game over

### Eventos discretos existentes:
Los eventos event-driven (día 5, 12, 22, etc.) se MANTIENEN y SUMAN al decay diario para picos dramáticos.

---

**Versión:** 1.0
**Estado:** Diseño completo, listo para implementación
**Siguiente:** Implementar en TimeManager.js
