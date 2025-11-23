# Auditoría de Tareas - Red de Aguante

**Fecha:** 2025-11-23
**Objetivo:** Identificar tareas subóptimas y rebalancear rewards vs costs

---

## Metodología de Evaluación

### Métricas:
1. **Cost**: Recursos gastados al asignar
2. **Duration**: Días que tarda la tarea
3. **Reward**: Recursos ganados al completar
4. **Decay Loss**: Recursos perdidos por decay durante la tarea
5. **Net Benefit**: Reward - (Cost + Decay Loss)
6. **Efficiency**: Net Benefit / Duration (beneficio por día)

### Decay Rates (sistema balanceado actual):
```
Electricidad: -0.9/día
Agua: -0.8/día
Legitimidad: -0.8/día
Autonomía: +0.5/día (crece pasivamente)
Créditos: -20/día
```

### Cálculo Break-even:
Para que una tarea valga la pena:

**Reward >= Cost + (Decay × Duration) + Buffer (10-20%)**

Ejemplo:
- Tarea dura 3 días
- Electricidad decae -0.9/día × 3 = -2.7% durante la tarea
- Créditos decaen -20/día × 3 = -60 durante la tarea
- Si cost = 250 créditos y reward = +18% electricidad
- Net: +18% - 2.7% = +15.3% electricidad, cost real = 250 + 60 = 310 créditos
- **Resultado:** ✅ Balanceada (reward supera decay con buffer)

---

## Tarea 1: Reparar Transformador B

### Datos Actuales:
```json
{
  "id": "reparar_transformador_b",
  "name": "Reparar Transformador B",
  "duration": 2,
  "cost": { "creditos": 1200 },
  "result": {
    "infrastructure": { "transformadorB": 30 }
  }
}
```

### Análisis:

| Métrica | Valor | Evaluación |
|---------|-------|------------|
| Cost | -1200 créditos | Alto |
| Duration | 2 días | Media |
| Reward | +30 infrastructure (NO recurso directo) | ⚠️ |
| Decay Loss | -40 créditos (20×2) | - |
| Total Cost Real | 1240 créditos | Muy alto |
| Net Benefit | Solo infrastructure, sin recurso | ❌ |
| Efficiency | N/A | - |

### Degradación durante tarea:
- Créditos decaen: -20 × 2 = -40 durante tarea
- **Costo real: 1200 + 40 = 1240 créditos**
- Reward: Solo mejora infrastructure, **NO aumenta recursos directos**

### Problema Crítico:
❌ **TRAMPA ECONÓMICA**
- Gasta 1240 créditos
- Solo mejora infrastructure (beneficio indirecto/futuro incierto)
- No recupera recursos inmediatos
- Jugador queda más pobre después de tarea

### Conclusión:
- [x] 🚫 **TRAMPA** (nunca vale la pena en early/mid game)

### Recomendación:
**REDISEÑAR** - Debe dar reward directo en electricidad además de infrastructure, o reducir costo drásticamente.

---

## Tarea 2: Buscar Materiales

### Datos Actuales:
```json
{
  "id": "buscar_materiales",
  "name": "Buscar Materiales",
  "duration": 3,
  "cost": {},
  "result": {
    "resources": { "creditos": 800 }
  }
}
```

### Análisis:

| Métrica | Valor | Evaluación |
|---------|-------|------------|
| Cost | 0 créditos | Gratis! |
| Duration | 3 días | Media |
| Reward | +800 créditos | Alto |
| Decay Loss | -60 créditos (20×3) | - |
| Net Benefit | 800 - 60 = **740 créditos** | ✅✅✅ |
| Efficiency | 740 / 3 = **247 créditos/día** | Altísima |

### Degradación durante tarea:
- Créditos decaen: -20 × 3 = -60
- **Net real: 800 - 60 = 740 créditos**

### Problema Crítico:
✅✅✅ **DEMASIADO BUENA**
- Gratis (sin cost)
- Alta reward (800 créditos)
- Alta efficiency (247/día)
- **Domina todas las otras tareas económicas**
- No hay trade-off ni decisión interesante

### Conclusión:
- [x] ⚠️ **DESBALANCEADA** (demasiado fuerte, sin cost)

### Recomendación:
**AJUSTAR** - Agregar cost (ej: 150 créditos) o reducir reward a 500-600, o aumentar duration a 4-5 días.

---

## Tarea 3: Reunión Vecinal

### Datos Actuales:
```json
{
  "id": "reunion_vecinal",
  "name": "Reunión Vecinal",
  "duration": 1,
  "cost": {},
  "result": {
    "resources": { "legitimidad": 15 }
  }
}
```

### Análisis:

| Métrica | Valor | Evaluación |
|---------|-------|------------|
| Cost | 0 créditos | Gratis! |
| Duration | 1 día | Rápida |
| Reward | +15% legitimidad | Alto |
| Decay Loss | -0.8% legitimidad (0.8×1) | Mínimo |
| Net Benefit | 15 - 0.8 = **14.2%** | ✅✅ |
| Efficiency | 14.2 / 1 = **14.2%/día** | Muy alta |

### Degradación durante tarea:
- Legitimidad decae: -0.8 × 1 = -0.8%
- **Net real: 15 - 0.8 = 14.2% legitimidad**

### Problema:
✅ **MUY EFICIENTE**
- Gratis
- Rápida (1 día)
- Alto reward neto
- No hay cost ni trade-off

### Conclusión:
- [x] ⚠️ **DESBALANCEADA** (demasiado eficiente, sin cost)

### Recomendación:
**AJUSTAR** - Agregar cost (ej: 100-200 créditos) para balancear vs otras tareas.

---

## Tarea 4: Mantenimiento de Red

### Datos Actuales:
```json
{
  "id": "mantenimiento_red",
  "name": "Mantenimiento de Red",
  "duration": 2,
  "cost": { "creditos": 500 },
  "result": {
    "resources": { "electricidad": 10 }
  }
}
```

### Análisis:

| Métrica | Valor | Evaluación |
|---------|-------|------------|
| Cost | -500 créditos | Medio |
| Duration | 2 días | Media |
| Reward | +10% electricidad | Bajo |
| Decay Loss (elec) | -1.8% electricidad (0.9×2) | - |
| Decay Loss (cred) | -40 créditos (20×2) | - |
| Net Benefit (elec) | 10 - 1.8 = **8.2%** | ⚠️ |
| Total Cost Real | 500 + 40 = **540 créditos** | - |
| Efficiency | 8.2% / 2 = **4.1%/día** | Media |
| Cost/Benefit | 540₡ por 8.2% electricidad | Caro |

### Degradación durante tarea:
- Electricidad decae: -0.9 × 2 = -1.8%
- Créditos decaen: -20 × 2 = -40
- **Net electricidad: 10 - 1.8 = 8.2%**
- **Costo real: 540 créditos**

### Problema:
⚠️ **REWARD MUY BAJO**
- Cuesta 540 créditos reales
- Solo da +8.2% neto de electricidad
- Ratio costo/beneficio: 65.8 créditos por 1% electricidad
- Comparado con decay diario (-0.9%), esto cubre ~9 días de decay
- **Es útil pero reward debería ser mayor**

### Conclusión:
- [x] ⚠️ **SUBÓPTIMA** (reward insuficiente para cost)

### Recomendación:
**AJUSTAR REWARD** - Aumentar a +18-20% electricidad para justificar cost de 540₡.

---

## Tarea 5: Reparar Perforación

### Datos Actuales:
```json
{
  "id": "reparar_perforacion",
  "name": "Reparar Perforación",
  "duration": 3,
  "cost": { "creditos": 1500 },
  "result": {
    "resources": { "agua": 20 },
    "infrastructure": { "perforacion1": 30 }
  }
}
```

### Análisis:

| Métrica | Valor | Evaluación |
|---------|-------|------------|
| Cost | -1500 créditos | Muy alto |
| Duration | 3 días | Media |
| Reward | +20% agua + infra | Medio |
| Decay Loss (agua) | -2.4% agua (0.8×3) | - |
| Decay Loss (cred) | -60 créditos (20×3) | - |
| Net Benefit (agua) | 20 - 2.4 = **17.6%** | ⚠️ |
| Total Cost Real | 1500 + 60 = **1560 créditos** | Muy alto |
| Efficiency | 17.6% / 3 = **5.9%/día** | Media |
| Cost/Benefit | 1560₡ por 17.6% agua | **MUY CARO** |

### Degradación durante tarea:
- Agua decae: -0.8 × 3 = -2.4%
- Créditos decaen: -20 × 3 = -60
- **Net agua: 20 - 2.4 = 17.6%**
- **Costo real: 1560 créditos**

### Problema Crítico:
❌ **EXTREMADAMENTE CARA**
- Costo: 1560 créditos (78 días de ingreso pasivo!)
- Reward neto: Solo 17.6% agua
- Ratio: 88.6 créditos por 1% agua
- **Con "buscar_materiales" (740₡ neto) necesitas hacerla 2+ veces para pagar esta tarea**
- Solo justificable en late game con mucho dinero

### Conclusión:
- [x] ❌ **TRAMPA ECONÓMICA** (reward no justifica cost en 95% de casos)

### Recomendación:
**REDISEÑAR** - Reducir cost a 400-500₡ o aumentar reward a 30-35% agua.

---

## Tarea 6: Descansar

### Datos Actuales:
```json
{
  "id": "descansar",
  "name": "Descansar",
  "duration": 1,
  "cost": {},
  "result": {
    "resources": { "legitimidad": 5 }
  }
}
```

### Análisis:

| Métrica | Valor | Evaluación |
|---------|-------|------------|
| Cost | 0 créditos | Gratis |
| Duration | 1 día | Rápida |
| Reward | +5% legitimidad | Muy bajo |
| Decay Loss | -0.8% legitimidad | - |
| Net Benefit | 5 - 0.8 = **4.2%** | Bajo |
| Efficiency | 4.2% / 1 = **4.2%/día** | Baja |

### Degradación durante tarea:
- Legitimidad decae: -0.8 × 1 = -0.8%
- **Net: 5 - 0.8 = 4.2% legitimidad**

### Problema:
⚠️ **DOMINADA POR REUNIÓN VECINAL**
- "Reunión Vecinal": 1 día, gratis, +14.2% neto
- "Descansar": 1 día, gratis, +4.2% neto
- **Reunión es 3.4x mejor en TODO**
- No hay razón para usar "Descansar" jamás

### Conclusión:
- [x] 🚫 **INÚTIL** (dominada completamente por otra tarea)

### Recomendación:
**ELIMINAR** o **REDISEÑAR** con reward diferente (ej: +autonomía en vez de legitimidad).

---

## Resumen Comparativo

| Tarea | Cost (₡) | Duration | Main Reward | Decay Loss | Net | Efficiency | Status |
|-------|----------|----------|-------------|------------|-----|------------|--------|
| **Transf. B** | 1200 | 2d | Infra only | -40₡ | 0 recursos | N/A | 🚫 TRAMPA |
| **Materiales** | 0 | 3d | +800₡ | -60₡ | +740₡ | 247₡/d | ⚠️ OP |
| **Reunión** | 0 | 1d | +15% leg | -0.8% | +14.2% | 14.2/d | ⚠️ OP |
| **Mant. Red** | 500 | 2d | +10% elec | -1.8%/-40₡ | +8.2% | 4.1/d | ⚠️ DÉBIL |
| **Perforación** | 1500 | 3d | +20% agua | -2.4%/-60₡ | +17.6% | 5.9/d | ❌ CARO |
| **Descansar** | 0 | 1d | +5% leg | -0.8% | +4.2% | 4.2/d | 🚫 INÚTIL |

### Problemas Críticos Identificados:

1. **🚫 TRAMPAS (nunca usar):**
   - "Reparar Transformador B": 1200₡ sin reward de recursos
   - "Descansar": Dominada por Reunión Vecinal

2. **❌ SUBÓPTIMAS (reward << cost):**
   - "Reparar Perforación": 1560₡ por 17.6% agua (muy caro)
   - "Mantenimiento Red": 540₡ por 8.2% electricidad (reward bajo)

3. **⚠️ OVERPOWERED (sin cost/trade-off):**
   - "Buscar Materiales": Gratis, 740₡ neto (domina economía)
   - "Reunión Vecinal": Gratis, 14.2% legitimidad (sin decisión)

4. **Falta de diversidad:**
   - No hay tareas para **autonomía**
   - No hay tareas híbridas (múltiples rewards)
   - No hay tareas largas (5+ días) con alto impacto
   - Duraciones limitadas: 1, 2, 3 días (no hay variedad)

5. **Sin trade-offs interesantes:**
   - Tareas gratis siempre mejores
   - Tareas caras nunca valen la pena
   - No hay decisiones estratégicas reales

---

## Principios de Diseño de Tareas Balanceadas

### 1. Reward Mínimo (Break-even)
Para tarea de duración D días en recurso R:

**Reward mínimo = (Decay_R × D) + Buffer (15-25%)**

Si tiene cost en créditos C:
**Reward debe justificar: Cost_real = C + (Decay_creditos × D)**

**Ejemplo:**
- Tarea Electricidad: 3 días, cost 250₡
- Decay electricidad: -0.9/día × 3 = -2.7%
- Decay créditos: -20/día × 3 = -60₡
- Cost real: 250 + 60 = 310₡
- **Reward mínimo:** 2.7% + 25% buffer = **18-20% electricidad**
- **Justificación:** Jugador gasta 310₡ para ganar 15-17% neto electricidad

### 2. Trade-offs Interesantes

**Tareas Cortas (1-2 días):**
- Menor reward absoluto
- **Mayor efficiency** (reward/día)
- Útiles para emergencias
- Cost bajo (100-200₡)

**Tareas Medias (3-4 días):**
- Balance estándar
- Mayoría de las tareas
- Cost medio (200-300₡)

**Tareas Largas (5+ días):**
- Mayor reward absoluto
- Menor efficiency
- Útiles para planificación a largo plazo
- Cost alto (400-500₡) pero justificado

### 3. Costos Significativos
**Todas las tareas deben costar algo** (decisión real):
- Créditos siempre (mínimo 100-150₡)
- Excepción: 1 tarea inicial "tutorial" gratis
- Costo ~10-20% del reward en términos económicos

### 4. Diversidad de Opciones
Debe haber:
- ✅ 1-2 tareas por recurso principal (electricidad, agua, legitimidad)
- ✅ 1 tarea económica (genera créditos)
- ✅ 1 tarea de autonomía
- ✅ 1-2 tareas híbridas (múltiples rewards)
- ✅ Duraciones variadas: 2, 3, 4, 5 días

### 5. No "Dominancia Estricta"
Ninguna tarea debe ser estrictamente mejor que otra en TODOS los aspectos:

❌ **MAL (dominancia):**
- Tarea A: 200₡, 2 días, +15% recurso
- Tarea B: 200₡, 2 días, +10% recurso
- → B es inútil

✅ **BIEN (trade-offs):**
- Tarea A: 200₡, 2 días, +12% electricidad
- Tarea B: 250₡, 3 días, +20% electricidad
- → A es más rápida/eficiente, B da más reward absoluto

### 6. Considerar Contexto de Uso

Cada tarea debe tener al menos 1 escenario donde sea óptima:

- **Emergencia** (recurso <30%): Tarea rápida aunque menos eficiente
- **Económica** (sin créditos): Tarea que genera dinero
- **Estabilidad** (todos >60%): Tareas de long-term investment
- **Crisis múltiple**: Tareas híbridas que mejoran varios recursos

---

## Valores Balanceados Propuestos (NUEVOS)

### Tarea 1: Mantenimiento Eléctrico (Standard)
```json
{
  "id": "electricidad_mantenimiento",
  "name": "Mantenimiento Eléctrico",
  "type": "electricidad",
  "description": "Reparar y mantener la red eléctrica del barrio. Mejora la infraestructura energética.",
  "duration": 3,
  "cost": {
    "creditos": -250
  },
  "reward": {
    "electricidad": 18
  }
}
```

**Justificación:**
- Duration: 3 días (media)
- Cost: 250₡ + decay 60₡ = **310₡ real**
- Decay electricidad: -0.9 × 3 = -2.7%
- Reward: +18%
- **Net: 18 - 2.7 = +15.3% electricidad**
- Efficiency: 15.3 / 3 = **5.1%/día**
- Cost/benefit: 310₡ por 15.3% = **20₡ por 1%**
- **Conclusión:** ✅ Balanceada, ratio razonable

---

### Tarea 2: Gestión de Agua (Standard)
```json
{
  "id": "agua_gestion",
  "name": "Gestión de Agua Potable",
  "type": "agua",
  "description": "Mantener sistema de agua potable y distribución. Asegura acceso a agua limpia.",
  "duration": 3,
  "cost": {
    "creditos": -250
  },
  "reward": {
    "agua": 16
  }
}
```

**Justificación:**
- Cost real: 250 + 60 = **310₡**
- Decay agua: -0.8 × 3 = -2.4%
- Reward: +16%
- **Net: 16 - 2.4 = +13.6% agua**
- Efficiency: 13.6 / 3 = **4.5%/día**
- Similar a electricidad, balanceada ✅

---

### Tarea 3: Atención Médica (Rápida - Emergencia)
```json
{
  "id": "salud_atencion",
  "name": "Atención Médica",
  "type": "legitimidad",
  "description": "Atender necesidades de salud urgentes del barrio. Tarea rápida para emergencias.",
  "duration": 2,
  "cost": {
    "creditos": -200
  },
  "reward": {
    "legitimidad": 12
  }
}
```

**Justificación:**
- Duration **CORTA**: 2 días (útil para emergencias)
- Cost real: 200 + 40 = **240₡**
- Decay legitimidad: -0.8 × 2 = -1.6%
- Reward: +12%
- **Net: 12 - 1.6 = +10.4% legitimidad**
- Efficiency: 10.4 / 2 = **5.2%/día** ← **MÁS EFICIENTE** que medias
- **Trade-off:** Reward absoluto menor pero más rápida
- **Use case:** Legitimidad <30%, necesitas fix urgente
- Balanceada ✅

---

### Tarea 4: Gestión de Alimentos (Económica)
```json
{
  "id": "comida_gestion",
  "name": "Gestión de Alimentos",
  "type": "creditos",
  "description": "Organizar distribución de alimentos y recursos. Genera ingresos para la red.",
  "duration": 2,
  "cost": {
    "creditos": -150
  },
  "reward": {
    "creditos": 500
  }
}
```

**Justificación:**
- **Tarea de CRÉDITOS** (única que genera dinero)
- Cost: 150₡
- Decay: -20 × 2 = -40₡
- Reward: +500₡
- **Net: 500 - 150 - 40 = +310₡**
- Efficiency: 310 / 2 = **155₡/día**
- **Trade-off:** No mejora otros recursos, solo económica
- **Use case:** Sin créditos, necesitas financiar otras tareas
- Balanceada ✅ (vs materiales anterior: 247/día gratis → esta 155/día con cost)

---

### Tarea 5: Apoyo Comunitario (Híbrida)
```json
{
  "id": "apoyo_comunitario",
  "name": "Apoyo Comunitario",
  "type": "hibrida",
  "description": "Fortalecer lazos y moral del barrio. Mejora legitimidad y autonomía simultáneamente.",
  "duration": 2,
  "cost": {
    "creditos": -200
  },
  "reward": {
    "legitimidad": 10,
    "autonomia": 5
  }
}
```

**Justificación:**
- **Tarea HÍBRIDA** (múltiples rewards)
- Cost real: 200 + 40 = **240₡**
- Legitimidad: +10% - 1.6% decay = **+8.4% neto**
- Autonomía: +5% + 1.0% decay = **+6.0% neto** (autonomía crece pasivamente)
- **Trade-off:** Reward dividido, pero mejora 2 recursos
- **Use case:** Ambos recursos bajos, necesitas boost dual
- Balanceada ✅

---

### Tarea 6: Infraestructura Mayor (Larga - Alto Impacto)
```json
{
  "id": "infraestructura_mayor",
  "name": "Reparación de Infraestructura Crítica",
  "type": "mayor",
  "description": "Reparación mayor de sistemas esenciales. Inversión grande con alto retorno.",
  "duration": 5,
  "cost": {
    "creditos": -400,
    "electricidad": -5
  },
  "reward": {
    "electricidad": 30,
    "agua": 15
  }
}
```

**Justificación:**
- Duration **LARGA**: 5 días (planificación necesaria)
- Cost: 400₡ + 5% electricidad
- Decay: -20 × 5 = -100₡
- **Cost real: 400 + 100 = 500₡ + 5% electricidad**
- Electricidad: +30% - 5% cost - 4.5% decay = **+20.5% neto**
- Agua: +15% - 4.0% decay = **+11% neto**
- Efficiency electricidad: 20.5 / 5 = **4.1%/día** (menor que cortas)
- **Trade-off:** Requiere inversión y tiempo, pero gran impacto absoluto
- **Use case:** Mid/late game, múltiples recursos críticos, tienes capital
- Balanceada ✅

---

## Resumen de Propuesta (NUEVOS VALORES)

| Tarea | Type | Cost (₡) | Duration | Main Reward | Net Benefit | Efficiency | Use Case |
|-------|------|----------|----------|-------------|-------------|------------|----------|
| Electricidad | Standard | 250 | 3d | +18% elec | +15.3% | 5.1%/d | Standard electricidad |
| Agua | Standard | 250 | 3d | +16% agua | +13.6% | 4.5%/d | Standard agua |
| Salud | Rápida | 200 | 2d | +12% leg | +10.4% | 5.2%/d | 🚨 Emergencia legitimidad |
| Alimentos | Económica | 150 | 2d | +500₡ | +310₡ | 155₡/d | 💰 Generar créditos |
| Apoyo | Híbrida | 200 | 2d | +10%leg/+5%aut | +8.4%/+6% | 4.2%/d | 🤝 Dual boost |
| Infra Mayor | Larga | 400+5%⚡ | 5d | +30%⚡/+15%💧 | +20.5%/+11% | 4.1%/d | 🏗️ Gran inversión |

### Verificación de Diversidad:

✅ **Recursos cubiertos:**
- Electricidad: Tarea 1, Tarea 6
- Agua: Tarea 2, Tarea 6
- Legitimidad: Tarea 3, Tarea 5
- Autonomía: Tarea 5
- Créditos: Tarea 4

✅ **Duraciones variadas:**
- 2 días: Tarea 3, 4, 5 (rápidas/eficientes)
- 3 días: Tarea 1, 2 (standard)
- 5 días: Tarea 6 (larga/alto impacto)

✅ **Tipos diversos:**
- Standard: Electricidad, Agua
- Rápida: Salud
- Económica: Alimentos
- Híbrida: Apoyo
- Mayor: Infraestructura

✅ **No hay dominancia estricta:**
- Todas tienen trade-offs únicos
- Cada una es óptima en al menos 1 escenario
- Ninguna es estrictamente mejor que otra en TODO

✅ **Todos los costos significativos:**
- Mínimo: 150₡ (Alimentos)
- Máximo: 500₡ equivalente (Infra Mayor)
- No hay tareas gratis (elimina trivialidad)

---

## Comparación: Actual vs Propuesto

### Antes (Sistema Actual - DESBALANCEADO):
```
❌ 2 tareas TRAMPA (Transformador B, Descansar)
❌ 2 tareas OVERPOWERED (Materiales gratis, Reunión gratis)
❌ 2 tareas subóptimas (Perforación cara, Mant. Red débil)
❌ 0 diversidad real (no autonomía, no híbridas, no largas)
❌ Decisiones triviales (siempre usar las gratis)
```

### Después (Sistema Propuesto - BALANCEADO):
```
✅ 6 tareas BALANCEADAS (todas útiles en su contexto)
✅ Diversidad completa (todos recursos, duraciones, tipos)
✅ Trade-offs interesantes (rápida vs alta reward, económica vs recursos)
✅ Decisiones estratégicas (según situación, no hay "siempre mejor")
✅ Todas cuestan algo (decisión real, no trivial)
```

---

## Conclusión

### Estado Actual:
❌ **SISTEMA ROTO**
- 33% de tareas son trampas inútiles
- 33% son overpowered sin trade-off
- 33% son subóptimas (reward << cost)
- 0% de decisiones estratégicas interesantes

### Estado Propuesto:
✅ **SISTEMA BALANCEADO**
- 100% de tareas útiles en algún contexto
- Diversidad completa de recursos, duraciones, tipos
- Trade-offs claros y decisiones estratégicas
- Integrado con nuevo sistema de decay diario

**Prioridad:** CRÍTICA
**Siguiente paso:** Implementar valores nuevos en `data/tasks.json`
