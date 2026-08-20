/**
 * Validador de climate_events.json
 *
 * Verifica:
 * - JSON válido
 * - IDs únicos
 * - Tipos correctos
 * - Condiciones sintácticamente válidas
 * - Balance de consecuencias razonable
 */

const fs = require('fs');
const path = require('path');

const eventFile = path.join(__dirname, '../data/climate_events.json');

console.log('🔍 Validando climate_events.json...\n');

try {
  // 1. Leer y parsear JSON
  const content = fs.readFileSync(eventFile, 'utf-8');
  const data = JSON.parse(content);

  console.log('✅ JSON válido');

  const events = data.events;
  console.log(`📊 Total eventos: ${events.length}`);
  console.log(`   Meta esperado: ${data._meta.total_events}\n`);

  // 2. Verificar IDs únicos
  const ids = new Set();
  const duplicates = [];

  events.forEach(event => {
    if (ids.has(event.id)) {
      duplicates.push(event.id);
    }
    ids.add(event.id);
  });

  if (duplicates.length > 0) {
    console.error('❌ IDs duplicados encontrados:', duplicates);
    process.exit(1);
  }
  console.log('✅ Todos los IDs son únicos');

  // 3. Verificar tipos de eventos
  const validTypes = ['scheduled', 'conditional', 'random'];
  const typeCount = { scheduled: 0, conditional: 0, random: 0 };
  const invalidTypes = [];

  events.forEach(event => {
    if (!validTypes.includes(event.type)) {
      invalidTypes.push({ id: event.id, type: event.type });
    } else {
      typeCount[event.type]++;
    }
  });

  if (invalidTypes.length > 0) {
    console.error('❌ Tipos inválidos encontrados:', invalidTypes);
    process.exit(1);
  }

  console.log('✅ Tipos válidos');
  console.log(`   - Scheduled: ${typeCount.scheduled}`);
  console.log(`   - Conditional: ${typeCount.conditional}`);
  console.log(`   - Random: ${typeCount.random}`);

  // 4. Validar estructura según tipo
  const structureErrors = [];

  events.forEach(event => {
    // Scheduled debe tener 'day'
    if (event.type === 'scheduled' && typeof event.day !== 'number') {
      structureErrors.push({ id: event.id, error: 'Scheduled event sin campo "day"' });
    }

    // Conditional debe tener 'condition'
    if (event.type === 'conditional' && !event.condition) {
      structureErrors.push({ id: event.id, error: 'Conditional event sin campo "condition"' });
    }

    // Random debe tener 'days' array
    if (event.type === 'random' && !Array.isArray(event.days)) {
      structureErrors.push({ id: event.id, error: 'Random event sin campo "days" array' });
    }

    // Todos deben tener title, description, options
    if (!event.title) {
      structureErrors.push({ id: event.id, error: 'Sin campo "title"' });
    }
    if (!event.description) {
      structureErrors.push({ id: event.id, error: 'Sin campo "description"' });
    }
    if (!Array.isArray(event.options) || event.options.length === 0) {
      structureErrors.push({ id: event.id, error: 'Sin opciones válidas' });
    }
  });

  if (structureErrors.length > 0) {
    console.error('❌ Errores de estructura:');
    structureErrors.forEach(e => console.error(`   ${e.id}: ${e.error}`));
    process.exit(1);
  }
  console.log('✅ Estructura correcta para todos los eventos');

  // 5. Validar condiciones (sintaxis básica)
  const conditionErrors = [];

  events.forEach(event => {
    if (event.type === 'conditional') {
      const cond = event.condition;

      // Validar que tenga operadores reconocidos o sea un flag
      const hasOperator = /<|>|<=|>=|==|!=|&&/.test(cond);
      const isFlag = cond.includes('flag:');

      if (!hasOperator && !isFlag) {
        conditionErrors.push({ id: event.id, condition: cond });
      }
    }
  });

  if (conditionErrors.length > 0) {
    console.error('❌ Condiciones con sintaxis sospechosa:');
    conditionErrors.forEach(e => console.error(`   ${e.id}: "${e.condition}"`));
    console.warn('⚠️  Revisar manualmente estas condiciones');
  } else {
    console.log('✅ Sintaxis de condiciones OK');
  }

  // 6. Verificar balance de consecuencias
  const balanceWarnings = [];

  events.forEach(event => {
    event.options.forEach((option, idx) => {
      if (option.consequences) {
        Object.entries(option.consequences).forEach(([resource, value]) => {
          // Advertir si un cambio es > 50 o < -50
          if (Math.abs(value) > 50) {
            balanceWarnings.push({
              id: event.id,
              option: idx,
              resource,
              value
            });
          }
        });
      }
    });
  });

  if (balanceWarnings.length > 0) {
    console.warn('\n⚠️  Cambios de recursos muy grandes detectados:');
    balanceWarnings.forEach(w => {
      console.warn(`   ${w.id} (opción ${w.option}): ${w.resource} ${w.value > 0 ? '+' : ''}${w.value}`);
    });
    console.warn('   Revisar que sea intencional\n');
  } else {
    console.log('✅ Balance de consecuencias razonable');
  }

  // 7. Verificar que no haya más de 3 eventos scheduled por día
  const dayCount = {};
  events.filter(e => e.type === 'scheduled').forEach(e => {
    dayCount[e.day] = (dayCount[e.day] || 0) + 1;
  });

  const overloadedDays = Object.entries(dayCount).filter(([day, count]) => count > 2);
  if (overloadedDays.length > 0) {
    console.warn('\n⚠️  Días con >2 eventos scheduled:');
    overloadedDays.forEach(([day, count]) => console.warn(`   Día ${day}: ${count} eventos`));
    console.warn('   Riesgo de saturación\n');
  } else {
    console.log('✅ Distribución de eventos por día OK');
  }

  // Resumen final
  console.log('\n' + '='.repeat(50));
  console.log('📋 RESUMEN');
  console.log('='.repeat(50));
  console.log(`Total eventos:        ${events.length}`);
  console.log(`  - Scheduled:        ${typeCount.scheduled}`);
  console.log(`  - Conditional:      ${typeCount.conditional}`);
  console.log(`  - Random:           ${typeCount.random}`);
  console.log('');
  console.log('Estado:               ✅ VÁLIDO');

  if (balanceWarnings.length > 0 || conditionErrors.length > 0 || overloadedDays.length > 0) {
    console.log('Advertencias:         ⚠️  Revisar warnings arriba');
  } else {
    console.log('Advertencias:         Ninguna');
  }

  console.log('='.repeat(50) + '\n');

} catch (error) {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
}
