# Plan de Testing - Sistema de Eventos Aleatorios

**Versión**: 1.0
**Fecha**: 2025-11-24
**Sistema**: Random Events System

---

## Objetivo

Verificar que el sistema de eventos aleatorios funciona correctamente, cumple con las especificaciones de diseño, y no introduce bugs en el juego existente.

---

## 1. Tests Funcionales Básicos

### TEST 1.1: Inicialización del Sistema

**Objetivo**: Verificar que RandomEventManager se inicializa correctamente

**Pasos**:
1. Iniciar nuevo juego
2. Abrir consola de desarrollador
3. Ejecutar: `gameState.randomEventManager`

**Resultado Esperado**:
- RandomEventManager existe
- Tiene 15 eventos cargados
- `eventHistory` está vacío
- `lastEventDay` es -10
- `pendingEvent` es null

**Comando de Debug**:
```javascript
console.log('Events:', gameState.randomEventManager.events.length);
console.log('History:', gameState.randomEventManager.eventHistory);
console.log('Last event day:', gameState.randomEventManager.lastEventDay);
```

---

### TEST 1.2: Eventos por Tipo

**Objetivo**: Verificar distribución correcta de eventos

**Pasos**:
1. Ejecutar en consola:
```javascript
const events = gameState.randomEventManager.events;
const crisis = events.filter(e => e.type === 'crisis');
const opportunities = events.filter(e => e.type === 'opportunity');
const neutral = events.filter(e => e.type === 'neutral');
console.log('Crisis:', crisis.length, '- Oportunidades:', opportunities.length, '- Neutral:', neutral.length);
```

**Resultado Esperado**:
- Crisis: 6 eventos
- Oportunidades: 5 eventos
- Neutral: 4 eventos
- Total: 15 eventos

---

## 2. Tests de Mecánicas de Probabilidad

### TEST 2.1: Zona de Exclusión (Días 1-5)

**Objetivo**: Verificar que NO aparecen eventos en días 1-5

**Pasos**:
1. Nuevo juego
2. Avanzar días 1-5 observando consola
3. Verificar que no se triggerea ningún evento

**Resultado Esperado**:
- No eventos aleatorios en días 1-5
- Solo eventos scripteados del TimeManager

**Comando de Debug**:
```javascript
// Forzar probabilidad 100% para testear
gameState.randomEventManager.checkForEvent(3); // Debería retornar null
```

---

### TEST 2.2: Zona de Exclusión (Días 55-60)

**Objetivo**: Verificar que NO aparecen eventos en días 55-60

**Pasos**:
1. Cargar partida en día 54
2. Avanzar días 55-60
3. Verificar que no se triggerea ningún evento

**Resultado Esperado**:
- No eventos aleatorios en días 55-60

**Comando para Avanzar Rápido**:
```javascript
gameState.timeManager.currentDay = 54;
```

---

### TEST 2.3: Cooldown de 3 Días

**Objetivo**: Verificar que hay mínimo 3 días entre eventos

**Pasos**:
1. Forzar un evento en día 10
2. Intentar forzar otro evento en días 11, 12, 13
3. Verificar que solo funciona desde día 13 en adelante

**Resultado Esperado**:
- Día 11: No evento (cooldown)
- Día 12: No evento (cooldown)
- Día 13: Puede haber evento (cooldown cumplido)

**Comando de Debug**:
```javascript
gameState.randomEventManager.lastEventDay = 10;
gameState.randomEventManager.checkForEvent(11); // null
gameState.randomEventManager.checkForEvent(12); // null
gameState.randomEventManager.checkForEvent(13); // puede retornar evento
```

---

### TEST 2.4: Frecuencia de Eventos (4-6 por run)

**Objetivo**: Verificar que en un run completo aparecen ~4-6 eventos

**Pasos**:
1. Jugar un run completo de 60 días (puede ser acelerado)
2. Al final, revisar historial

**Resultado Esperado**:
- Entre 4 y 6 eventos triggereados
- No más de 8 eventos
- No menos de 2 eventos

**Comando de Debug**:
```javascript
console.log('Total events:', gameState.randomEventManager.eventHistory.length);
console.log('Event history:', gameState.randomEventManager.eventHistory);
```

---

## 3. Tests de Precondiciones

### TEST 3.1: Precondición de Recursos (Electricidad)

**Objetivo**: Verificar que "Apagón Sorpresivo" solo aparece si electricidad < 40%

**Pasos**:
1. Día 15, setear electricidad a 50%
2. Verificar que Apagón NO es elegible
3. Setear electricidad a 35%
4. Verificar que Apagón SÍ es elegible

**Resultado Esperado**:
- Con electricidad > 40%: evento no elegible
- Con electricidad < 40%: evento elegible

**Comandos de Debug**:
```javascript
gameState.resourceManager.electricidad = 50;
gameState.timeManager.currentDay = 15;
const eligible1 = gameState.randomEventManager.getEligibleEvents(15);
console.log('Apagón elegible con 50%?', eligible1.find(e => e.id === 'evento_apagon_sorpresa'));

gameState.resourceManager.electricidad = 35;
const eligible2 = gameState.randomEventManager.getEligibleEvents(15);
console.log('Apagón elegible con 35%?', eligible2.find(e => e.id === 'evento_apagon_sorpresa'));
```

---

### TEST 3.2: Precondición de Flags (notFlags)

**Objetivo**: Verificar que eventos no aparecen si tienen flags bloqueantes

**Pasos**:
1. Día 15, verificar "Apagón" es elegible
2. Agregar flag 'apagon_reciente'
3. Verificar que ya NO es elegible

**Resultado Esperado**:
- Sin flag: evento elegible
- Con flag: evento no elegible

**Comandos de Debug**:
```javascript
gameState.timeManager.currentDay = 15;
gameState.resourceManager.electricidad = 30;

// Sin flag
const eligible1 = gameState.randomEventManager.getEligibleEvents(15);
console.log('Elegible sin flag?', !!eligible1.find(e => e.id === 'evento_apagon_sorpresa'));

// Con flag
gameState.randomEventManager.activeFlags.add('apagon_reciente');
const eligible2 = gameState.randomEventManager.getEligibleEvents(15);
console.log('Elegible con flag?', !!eligible2.find(e => e.id === 'evento_apagon_sorpresa'));
```

---

### TEST 3.3: Precondición de Rango de Días

**Objetivo**: Verificar que eventos respetan minDay y maxDay

**Pasos**:
1. Verificar "Excedente de Energía" (minDay: 25, maxDay: 50)
2. Día 20: No debe ser elegible
3. Día 30: Debe ser elegible (si cumple otros requisitos)
4. Día 55: No debe ser elegible

**Comandos de Debug**:
```javascript
gameState.resourceManager.electricidad = 75; // Cumple requisito
gameState.randomEventManager.activeFlags.clear(); // Sin flags

gameState.timeManager.currentDay = 20;
const eligible1 = gameState.randomEventManager.getEligibleEvents(20);
console.log('Excedente día 20?', !!eligible1.find(e => e.id === 'evento_excedente_energia'));

gameState.timeManager.currentDay = 30;
const eligible2 = gameState.randomEventManager.getEligibleEvents(30);
console.log('Excedente día 30?', !!eligible2.find(e => e.id === 'evento_excedente_energia'));

gameState.timeManager.currentDay = 55;
const eligible3 = gameState.randomEventManager.getEligibleEvents(55);
console.log('Excedente día 55?', !!eligible3.find(e => e.id === 'evento_excedente_energia'));
```

---

## 4. Tests de UI y UX

### TEST 4.1: Visualización de Evento Crisis

**Objetivo**: Verificar que eventos de crisis se muestran correctamente

**Pasos**:
1. Forzar evento "Apagón Sorpresivo"
2. Verificar:
   - Panel rojo (crisis)
   - Icono ⚡💥
   - Título "Apagón Sorpresivo"
   - Descripción completa
   - 3 opciones visibles
   - Botones funcionan con teclado (1, 2, 3)

**Comandos de Debug**:
```javascript
const evento = gameState.randomEventManager.getEventById('evento_apagon_sorpresa');
gameState.randomEventManager.triggerEvent(evento);
// Avanzar día para que se muestre
```

---

### TEST 4.2: Visualización de Evento Oportunidad

**Objetivo**: Verificar que oportunidades se muestran en verde

**Pasos**:
1. Forzar evento "Donación Inesperada"
2. Verificar panel verde
3. Verificar icono 🎁📦

**Comandos de Debug**:
```javascript
const evento = gameState.randomEventManager.getEventById('evento_donacion_inesperada');
gameState.randomEventManager.triggerEvent(evento);
```

---

### TEST 4.3: Visualización de Evento Neutral

**Objetivo**: Verificar que eventos neutrales se muestran en azul

**Pasos**:
1. Forzar evento "Mural de los Niños"
2. Verificar panel azul
3. Verificar icono 🎨👧👦

---

### TEST 4.4: Mensaje de Resultado

**Objetivo**: Verificar que después de elegir opción se muestra resultado

**Pasos**:
1. Disparar cualquier evento
2. Elegir opción 1
3. Verificar:
   - Panel de resultado aparece
   - Mensaje de resultado correcto
   - Resumen de recursos modificados
   - Botón "CONTINUAR" funciona
   - ENTER cierra el panel

---

## 5. Tests de Consecuencias

### TEST 5.1: Aplicación de Recursos

**Objetivo**: Verificar que recursos se modifican correctamente

**Pasos**:
1. Anotar créditos actuales
2. Forzar "Apagón Sorpresivo"
3. Elegir opción 1 (Reparación urgente -500₡)
4. Verificar que créditos bajaron 500
5. Verificar que electricidad subió 15

**Comandos de Debug**:
```javascript
const creditosAntes = gameState.resourceManager.creditos;
const elecAntes = gameState.resourceManager.electricidad;

// Después de elegir
const creditosDespues = gameState.resourceManager.creditos;
const elecDespues = gameState.resourceManager.electricidad;

console.log('Créditos:', creditosAntes, '->', creditosDespues, '(esperado: -500)');
console.log('Electricidad:', elecAntes, '->', elecDespues, '(esperado: +15)');
```

---

### TEST 5.2: Aplicación de Flags

**Objetivo**: Verificar que flags se setean correctamente

**Pasos**:
1. Forzar "Apagón Sorpresivo"
2. Elegir opción 1
3. Verificar que flags se agregaron:
   - `apagon_sorpresa_reparado`
   - `apagon_reciente`

**Comandos de Debug**:
```javascript
console.log('Flags activos:', Array.from(gameState.randomEventManager.activeFlags));
// Debería incluir: ['apagon_sorpresa_reparado', 'apagon_reciente']
```

---

### TEST 5.3: Aplicación de Achievements

**Objetivo**: Verificar que algunos eventos desbloquean logros

**Pasos**:
1. Forzar evento "Periodista Cobertura"
2. Elegir opción 1 (Cobertura completa)
3. Verificar que se desbloquea achievement `achievement_vocero_comunidad`

**Comandos de Debug**:
```javascript
console.log('Achievement desbloqueado?',
  gameState.achievementManager.isUnlocked('achievement_vocero_comunidad')
);
```

---

## 6. Tests de Persistencia

### TEST 6.1: Guardar/Cargar con Evento Activo

**Objetivo**: Verificar que evento pendiente se guarda y carga

**Pasos**:
1. Forzar evento pendiente
2. Guardar juego (ESC > Guardar)
3. Recargar página
4. Cargar juego
5. Verificar que el evento se muestra

**Resultado Esperado**:
- Evento pendiente se restaura
- Se muestra RandomEventScene automáticamente

---

### TEST 6.2: Guardar/Cargar Historial

**Objetivo**: Verificar que historial de eventos se preserva

**Pasos**:
1. Triggerar 2-3 eventos y completarlos
2. Guardar juego
3. Recargar página
4. Cargar juego
5. Verificar historial

**Comandos de Debug**:
```javascript
console.log('Event history:', gameState.randomEventManager.eventHistory);
console.log('Last event day:', gameState.randomEventManager.lastEventDay);
```

---

### TEST 6.3: Guardar/Cargar Flags

**Objetivo**: Verificar que flags de eventos se preservan

**Pasos**:
1. Completar evento que setea flags
2. Guardar juego
3. Recargar página
4. Cargar juego
5. Verificar que flags siguen activos

**Comandos de Debug**:
```javascript
console.log('Active flags:', Array.from(gameState.randomEventManager.activeFlags));
```

---

## 7. Tests de Integración

### TEST 7.1: No Interferencia con Encuentros Scripteados

**Objetivo**: Verificar que eventos aleatorios no rompen encuentros programados

**Pasos**:
1. Día 3: Verificar que "primera_asamblea" se triggerea normalmente
2. Si hay evento aleatorio el mismo día, verificar que ambos funcionan
3. Completar ambos sin errores

**Resultado Esperado**:
- Encuentros scripteados tienen prioridad
- Eventos aleatorios pueden coexistir
- No hay conflictos de UI

---

### TEST 7.2: Pausa/Reanudación de MapScene

**Objetivo**: Verificar que MapScene se pausa correctamente

**Pasos**:
1. Estar en MapScene
2. Triggerar evento aleatorio
3. Verificar que MapScene está pausada (jugador no se puede mover)
4. Completar evento
5. Verificar que MapScene se reanuda

**Resultado Esperado**:
- MapScene se pausa al mostrar evento
- Jugador no puede moverse durante evento
- MapScene se reanuda al cerrar evento

---

### TEST 7.3: Balance Económico

**Objetivo**: Verificar que eventos no rompen la economía del juego

**Pasos**:
1. Jugar run completo anotando:
   - Créditos iniciales
   - Créditos finales
   - Cuánto se ganó/perdió por eventos
2. Verificar que es posible ganar el juego incluso con eventos negativos

**Resultado Esperado**:
- Eventos crisis cuestan en promedio ~450₡
- Eventos oportunidad generan en promedio ~300₡
- Balance total: ligeramente negativo pero manejable
- Victoria posible con buena gestión

---

## 8. Tests de Edge Cases

### TEST 8.1: Múltiples Eventos Elegibles

**Objetivo**: Verificar weighted random selection

**Pasos**:
1. Setear estado donde múltiples eventos son elegibles
2. Forzar checkForEvent múltiples veces
3. Verificar que selección varía

**Comandos de Debug**:
```javascript
// Setear estado ideal
gameState.timeManager.currentDay = 25;
gameState.resourceManager.electricidad = 35;
gameState.resourceManager.agua = 40;
gameState.resourceManager.moral = 45;
gameState.randomEventManager.activeFlags.clear();

// Ver eventos elegibles
const eligible = gameState.randomEventManager.getEligibleEvents(25);
console.log('Eventos elegibles:', eligible.map(e => e.title));

// Forzar selección
for (let i = 0; i < 10; i++) {
  const selected = gameState.randomEventManager.selectEventByWeight(eligible);
  console.log('Selected:', selected.title);
}
```

---

### TEST 8.2: Recursos Negativos

**Objetivo**: Verificar que recursos no bajan de 0

**Pasos**:
1. Setear créditos a 100
2. Forzar evento que cuesta 500₡
3. Elegir opción costosa
4. Verificar que créditos quedan en 0 (no -400)

**Comandos de Debug**:
```javascript
gameState.resourceManager.creditos = 100;
// Después de evento
console.log('Créditos:', gameState.resourceManager.creditos); // Debe ser >= 0
```

---

### TEST 8.3: Recursos sobre 100%

**Objetivo**: Verificar que recursos no suben de 100%

**Pasos**:
1. Setear electricidad a 95%
2. Forzar evento que da +20 electricidad
3. Verificar que electricidad queda en 100% (no 115%)

**Comandos de Debug**:
```javascript
gameState.resourceManager.electricidad = 95;
// Después de evento
console.log('Electricidad:', gameState.resourceManager.electricidad); // Debe ser <= 100
```

---

## 9. Tests de Todos los Eventos

### Checklist: Verificar cada evento individualmente

Para cada uno de los 15 eventos, verificar:

**CRISIS**:
- [ ] ⚡ Apagón Sorpresivo
- [ ] 💧 Contaminación del Agua
- [ ] 🤒 Brote de Enfermedad
- [ ] 🚨 Robo en el Almacén
- [ ] ⛈️ Tormenta Severa
- [ ] 👥 Conflicto Vecinal

**OPORTUNIDADES**:
- [ ] 🎁 Donación Inesperada
- [ ] 👩‍🔧 Nuevo Miembro Técnico (Paula)
- [ ] 📰 Periodista Cobertura
- [ ] ☀️ Excedente de Energía
- [ ] 🎓 Taller Universitario

**NEUTRAL**:
- [ ] 🤝 Visita de Cooperativa
- [ ] 🎉 Aniversario del Barrio
- [ ] 🎨 Mural de los Niños
- [ ] 📻 Radio Comunitaria

**Para cada evento verificar**:
1. Se muestra correctamente
2. Icono correcto
3. Descripción clara
4. Todas las opciones funcionan
5. Consecuencias se aplican correctamente
6. Mensaje de resultado apropiado
7. Flags se setean correctamente

---

## 10. Comandos Útiles de Debug

### Forzar Evento Específico

```javascript
// Forzar cualquier evento por ID
const evento = gameState.randomEventManager.getEventById('evento_apagon_sorpresa');
gameState.randomEventManager.triggerEvent(evento);
```

### Ver Estado Completo

```javascript
const stats = gameState.randomEventManager.getStats();
console.log('Random Event System Stats:', stats);
```

### Limpiar Flags

```javascript
// Limpiar todos los flags de eventos
gameState.randomEventManager.activeFlags.clear();
```

### Resetear Cooldown

```javascript
// Permitir eventos inmediatamente
gameState.randomEventManager.lastEventDay = -10;
```

### Setear Recursos Ideales

```javascript
// Estado para testear eventos específicos
gameState.resourceManager.creditos = 2000;
gameState.resourceManager.electricidad = 50;
gameState.resourceManager.agua = 50;
gameState.resourceManager.moral = 50;
gameState.timeManager.currentDay = 25;
```

---

## Criterios de Aceptación

Para considerar el sistema APROBADO, debe cumplir:

✅ **Funcionales**:
- [x] 15 eventos cargados correctamente
- [ ] Probabilidad de ~20% diaria funciona
- [ ] Cooldown de 3 días funciona
- [ ] Zonas de exclusión funcionan (días 1-5, 55-60)
- [ ] Frecuencia total: 4-6 eventos por run

✅ **Precondiciones**:
- [ ] Condiciones de recursos funcionan
- [ ] Condiciones de flags funcionan
- [ ] Condiciones de días funcionan
- [ ] Weighted random selection funciona

✅ **UI/UX**:
- [ ] Eventos se muestran correctamente
- [ ] Colores apropiados por tipo
- [ ] Botones funcionan (click y teclado)
- [ ] Mensaje de resultado se muestra
- [ ] MapScene se pausa/reanuda correctamente

✅ **Consecuencias**:
- [ ] Recursos se modifican correctamente
- [ ] Flags se setean correctamente
- [ ] Achievements se desbloquean cuando corresponde
- [ ] No se rompe balance económico

✅ **Persistencia**:
- [ ] Eventos se guardan/cargan correctamente
- [ ] Historial se preserva
- [ ] Flags se preservan
- [ ] Evento pendiente se restaura

✅ **Integración**:
- [ ] No interfiere con encuentros scripteados
- [ ] No causa errores de consola
- [ ] No afecta performance del juego

---

## Reporte de Bugs

Si encuentras bugs, reportar con este formato:

**Bug ID**: RANDOMEVENT-XXX
**Severidad**: [Crítico / Alto / Medio / Bajo]
**Descripción**: [Qué pasó]
**Pasos para Reproducir**: [Lista de pasos]
**Resultado Esperado**: [Qué debería pasar]
**Resultado Actual**: [Qué pasó realmente]
**Consola**: [Errores de consola si hay]

---

**ESTADO FINAL DEL TEST**: [ ] APROBADO / [ ] RECHAZADO

**Testeador**: ________________
**Fecha**: ________________
**Notas**: ________________
