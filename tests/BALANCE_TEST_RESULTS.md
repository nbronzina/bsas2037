# BALANCE TEST RESULTS - Sistema de Decay Diario

**Fecha:** 2025-11-23
**Commit:** e60fd77
**Tester:** Pendiente testing manual
**Estado:** ⏳ PENDIENTE VALIDACIÓN

---

## 📋 RESUMEN EJECUTIVO

Este documento registra los resultados de testing del nuevo sistema de decay diario balanceado implementado en `TimeManager.js`.

**Hipótesis a validar:**
- ✅ Sin tareas → Game over día 75-80
- ✅ Con 3-4 tareas → Victoria posible (recursos 40-60%)
- ✅ Con 6+ tareas → Victoria cómoda (recursos >70%)

---

## 🧪 TEST 1: ESCENARIO PASIVO (Sin Tareas)

### Objetivo
Verificar que sin intervención del jugador, el juego termina en game over entre día 75-80.

### Pasos de Testing
1. Iniciar nueva partida (borrar localStorage si es necesario)
2. Avanzar días usando SPACE **sin asignar ninguna tarea**
3. Observar decay de recursos cada 10 días
4. Registrar día exacto de game over
5. Registrar razón de game over (electricidad, agua, legitimidad)

### Valores Esperados (Modelo Teórico)

| Día | Electricidad | Agua | Legitimidad | Créditos | Estado |
|-----|--------------|------|-------------|----------|--------|
| 1   | 70.0%        | 65.0%| 75.0%       | 2000     | OK     |
| 10  | 61.9%        | 57.8%| 67.8%       | 1800     | OK     |
| 20  | 52.9%        | 49.0%| 59.0%       | 1620     | OK     |
| 30  | 43.9%        | 41.0%| 51.0%       | 1420     | ADVERTENCIA |
| 40  | 34.9%        | 33.0%| 43.0%       | 1240     | CRÍTICO |
| 50  | 25.9%        | 25.0%| 35.0%       | 1040     | CRÍTICO |
| 60  | 16.9%        | 17.0%| 27.0%       | 860      | VICTORIA POSIBLE |
| 70  | 7.9%         | 9.0% | 19.0%       | 660      | MUY CRÍTICO |
| 78  | 0.7%         | 2.6% | 12.6%       | 500      | GAME OVER |

**Nota:** Eventos discretos (días 5, 12, 22, 32, 45) pueden alterar estos valores.

### Resultados Reales

**Estado:** ⏳ PENDIENTE

```
Día de game over: ___
Recurso que llegó a 0: ___________
Recursos finales:
  - Electricidad: ___%
  - Agua: ___%
  - Legitimidad: ___%
  - Autonomía: ___%
  - Créditos: $____

¿Cumple objetivo (día 75-80)? [ ] SÍ  [ ] NO

Observaciones:
_________________________________________________________________
_________________________________________________________________
```

---

## 🧪 TEST 2: ESCENARIO BALANCEADO (3-4 Tareas)

### Objetivo
Verificar que con gestión moderada, la victoria es alcanzable pero requiere planificación.

### Pasos de Testing
1. Iniciar nueva partida
2. Asignar exactamente **3-4 tareas** durante los 60 días
3. Estrategia sugerida:
   - Día 7: Mantenimiento Red (Beto) - +10% electricidad
   - Día 20: Reparar Perforación (Marcos) - +20% agua
   - Día 35: Reunión Vecinal (Yani) - +15% legitimidad
   - (Opcional día 50): Reparar Transformador B - +30% electricidad
4. Alcanzar día 60
5. Verificar victoria con recursos 40-60%

### Valores Esperados (Con Tareas)

| Día | Acción | Electricidad | Agua | Legitimidad | Créditos |
|-----|--------|--------------|------|-------------|----------|
| 1   | -      | 70.0%        | 65.0%| 75.0%       | 2000     |
| 7   | Mant. Red (+10⚡) | 75.1% | 59.4%| 69.4%       | 1360     |
| 20  | Rep. Perforación (+20💧) | 63.4% | 72.0%| 59.0%       | 860      |
| 35  | Reunión Vecinal (+15🤝) | 50.0% | 60.0%| 62.0%       | 560      |
| 50  | Rep. Transf. B (+30⚡) | 53.5% | 48.0%| 50.0%       | 260      |
| 60  | FIN    | 44.5%        | 40.0%| 42.0%       | 60       |

**Resultado esperado:** ✅ VICTORIA (todos recursos >30-40%)

### Resultados Reales

**Estado:** ⏳ PENDIENTE

```
¿Alcanzó día 60? [ ] SÍ  [ ] NO

Recursos finales:
  - Electricidad: ___%  (Objetivo: 40-60%)
  - Agua: ___%          (Objetivo: 40-60%)
  - Legitimidad: ___%   (Objetivo: 40-60%)
  - Autonomía: ___%
  - Créditos: $____

Tareas asignadas durante el playthrough:
1. _________________________ (Día ___, Personaje: ___)
2. _________________________ (Día ___, Personaje: ___)
3. _________________________ (Día ___, Personaje: ___)
4. _________________________ (Día ___, Personaje: ___)

¿Cumple objetivo (victoria con recursos 40-60%)? [ ] SÍ  [ ] NO

Observaciones:
_________________________________________________________________
_________________________________________________________________
```

---

## 🧪 TEST 3: ESCENARIO ÓPTIMO (6+ Tareas)

### Objetivo
Verificar que con gestión óptima, la victoria es cómoda pero no trivial.

### Pasos de Testing
1. Iniciar nueva partida
2. Asignar **6+ tareas** estratégicamente
3. Priorizar tareas que restauran electricidad y agua
4. Usar tareas de legitimidad cuando sea necesario
5. Alcanzar día 60 con recursos >70%

### Estrategia Sugerida
```
Día 5:  Mantenimiento Red (Beto)          → +10% ⚡
Día 12: Reparar Transformador B (Beto)    → +30% ⚡
Día 20: Reparar Perforación (Marcos)      → +20% 💧
Día 30: Mantenimiento Red (Beto)          → +10% ⚡
Día 38: Reunión Vecinal (Yani)            → +15% 🤝
Día 48: Limpiar Tanque (Marcos)           → +15% 💧
```

### Valores Esperados

**Resultado esperado:** ✅ VICTORIA con recursos >70%

### Resultados Reales

**Estado:** ⏳ PENDIENTE

```
¿Alcanzó día 60? [ ] SÍ  [ ] NO

Recursos finales:
  - Electricidad: ___%  (Objetivo: >70%)
  - Agua: ___%          (Objetivo: >70%)
  - Legitimidad: ___%   (Objetivo: >70%)
  - Autonomía: ___%
  - Créditos: $____

Número de tareas asignadas: ___

¿Cumple objetivo (victoria cómoda >70%)? [ ] SÍ  [ ] NO

¿La victoria fue trivial o requirió planificación? _______________

Observaciones:
_________________________________________________________________
_________________________________________________________________
```

---

## 🧪 TEST 4: VERIFICACIÓN DE LOGS (Debug)

### Objetivo
Verificar que los logs de decay se imprimen correctamente en consola.

### Pasos
1. Abrir consola del navegador (F12)
2. Iniciar nueva partida
3. Avanzar días 1-5 (debe imprimir logs cada día)
4. Verificar formato de logs en días 10, 20, 30

### Formato Esperado
```
[Day 1] Daily resource decay applied:
  ⚡ Electricidad: 70.0% → 69.1% (-0.9)
  💧 Agua: 65.0% → 64.2% (-0.8)
  🤝 Legitimidad: 75.0% → 74.2% (-0.8)
  🏴 Autonomía: 80.0% → 80.5% (+0.5)
  💰 Créditos: $2000 → $1980 (-20)
```

### Resultados Reales

**Estado:** ⏳ PENDIENTE

```
¿Los logs se imprimen correctamente? [ ] SÍ  [ ] NO

¿Los valores de decay son correctos? [ ] SÍ  [ ] NO

Captura de logs del día 1:
_________________________________________________________________
_________________________________________________________________

Observaciones:
_________________________________________________________________
```

---

## 🧪 TEST 5: INTERACCIÓN CON EVENTOS DISCRETOS

### Objetivo
Verificar que el decay diario se SUMA correctamente a los eventos discretos programados.

### Eventos Discretos Programados
- **Día 5:** decay_transformador → transformadorB -10
- **Día 12:** heatwave → agua -15
- **Día 22:** decay_perforacion → perforacion1 -15, agua -10
- **Día 32:** decay_transformador_a → transformadorA -10, electricidad -10
- **Día 45:** decay_general → todas infras -5

### Pasos
1. Iniciar nueva partida sin tareas
2. Observar recursos en días 5, 12, 22, 32, 45
3. Verificar que el decay diario Y los eventos se apliquen

### Ejemplo Día 12 (Heatwave)
**Esperado:**
- Decay diario: agua -0.8
- Evento heatwave: agua -15
- **Total día 12: agua -15.8**

### Resultados Reales

**Estado:** ⏳ PENDIENTE

```
Día 5:
  - Agua antes: ___%, después: ___% (esperado: decay -0.8 normal)

Día 12:
  - Agua antes: ___%, después: ___% (esperado: decay -15.8 por heatwave)

Día 22:
  - Agua antes: ___%, después: ___% (esperado: decay -10.8)

Día 32:
  - Electricidad antes: ___%, después: ___% (esperado: decay -10.9)

Día 45:
  - Infraestructura antes/después: _______________________

¿Los eventos discretos se suman correctamente al decay? [ ] SÍ  [ ] NO

Observaciones:
_________________________________________________________________
```

---

## 📊 ANÁLISIS DE RESULTADOS

### Comparación Modelo vs Realidad

| Métrica | Modelo Teórico | Resultado Real | Diferencia |
|---------|----------------|----------------|------------|
| Día game over (sin tareas) | 78 | ___ | ___ |
| Victoria posible (3-4 tareas) | ✅ SÍ | ___ | ___ |
| Recursos finales (3-4 tareas) | 40-60% | ___% | ___ |
| Victoria cómoda (6+ tareas) | ✅ SÍ | ___ | ___ |
| Recursos finales (6+ tareas) | >70% | ___% | ___ |

### ✅ Criterios de Aprobación

El balance se considera **APROBADO** si:
- [ ] Test 1: Game over ocurre día 70-85 (margen ±5 días del objetivo 78)
- [ ] Test 2: Victoria alcanzable con 3-4 tareas (recursos >30%)
- [ ] Test 3: Victoria con 6+ tareas (recursos >60%)
- [ ] Test 4: Logs se imprimen correctamente
- [ ] Test 5: Eventos discretos se suman al decay diario

### ❌ Si el balance NO cumple:

**Ajustes posibles:**
- Si game over muy temprano (día <70): Reducir decay 10-15%
- Si game over muy tardío (día >85): Aumentar decay 10-15%
- Si victoria muy fácil con 3 tareas: Aumentar decay 5-10%
- Si victoria imposible con 6 tareas: Reducir decay 15-20%

---

## 🐛 BUGS Y PROBLEMAS ENCONTRADOS

### Bug #1
**Descripción:** ___________________________________________________
**Severidad:** [ ] CRÍTICO  [ ] ALTO  [ ] MEDIO  [ ] BAJO
**Reproducible:** [ ] SÍ  [ ] NO
**Pasos para reproducir:** _________________________________________
**Fix propuesto:** _________________________________________________

---

## ✅ CONCLUSIÓN Y PRÓXIMOS PASOS

**Estado final:** ⏳ PENDIENTE TESTING

### Checklist de Validación
- [ ] Test 1 completado y aprobado
- [ ] Test 2 completado y aprobado
- [ ] Test 3 completado y aprobado
- [ ] Test 4 completado y aprobado
- [ ] Test 5 completado y aprobado
- [ ] Bugs críticos resueltos
- [ ] Balance aprobado para producción

### Acción Requerida
```
PRÓXIMO PASO: Ejecutar testing manual según plan de tests 1-5.
Registrar resultados en este documento y determinar si se requieren ajustes.
```

---

**Última actualización:** 2025-11-23
**Próxima revisión:** Después de completar tests manuales
