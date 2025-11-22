# Red de Aguante - Buenos Aires 2037

## Descripción
RPG de gestión territorial ambientado en Buenos Aires 2037. Jugás como Valeria "La Tana" Acosta, delegada de infraestructura eléctrica de Villa Soldati durante una temporada de sudestadas permanentes.

## Estado del Proyecto: MVP en Desarrollo

### Fases Completadas (5/8)
- ✅ **FASE 0**: Setup básico
- ✅ **FASE 1**: Movimiento básico
- ✅ **FASE 2**: Sistema de diálogos
- ✅ **FASE 3**: Sistema de recursos
- ✅ **FASE 4**: Encuentros/Asambleas
- ✅ **FASE 5**: Sistema de tiempo ⭐

### Próximas Fases
- ⏳ **FASE 6**: Gestión de base
- ⏳ **FASE 7**: Integración MVP
- ⏳ **FASE 8**: Pulido básico

### Características Implementadas
- Mapa de Villa Soldati (50x50 tiles) con colisiones
- NPC Beto con múltiples diálogos
- 5 recursos: créditos, electricidad, agua, legitimidad, autonomía
- 3 encuentros (Primera Asamblea, Crisis Tormenta, Segunda Asamblea)
- Sistema de tiempo con eventos programados (días 1-60)
- UI completa: recursos, tiempo, diálogos, encuentros

### Cómo Testear
1. Abrir `index.html` en navegador
2. **WASD/Flechas**: Mover a Valeria (cuadrado rojo)
3. **ENTER** cerca de Beto: Hablar (al 2da vez triggea asamblea)
4. Ver paneles de UI en la derecha

**Controles de Debug:**
- **T**: Avanzar 1 día (auto-triggea encuentros en días 3, 10, 15)
- **E**: Lanzar "Primera Asamblea" directamente
- **1/2**: ±500 créditos | **3/4**: ±10% electricidad

## Cómo Jugar (Una vez completo)

### Controles de Exploración
- **WASD** o **Flechas**: Mover a Valeria
- **ENTER/ESPACIO**: Interactuar con NPC/objeto
- **ESC**: Menú de pausa
- **TAB**: Ver recursos/inventario

### Controles de Diálogos
- **ENTER/ESPACIO**: Avanzar texto

### Controles de Encuentros
- **1, 2, 3, 4**: Elegir opción
- **Flechas ↑↓**: Navegar opciones
- **ENTER**: Confirmar

## Instalación Local

1. Clonar el repositorio
2. Abrir `index.html` en un navegador moderno
3. No requiere servidor web para desarrollo

## Stack Técnico
- **Framework**: Phaser 3.80.1
- **Lenguaje**: JavaScript ES6+
- **No build tools**: Todo vanilla JS

## Estructura del Proyecto
```
/red-de-aguante
  /assets        - Sprites, tiles, audio
  /src
    /scenes      - Escenas del juego
    /managers    - Gestión de recursos, tiempo, guardado
    /utils       - Constantes y helpers
  /data          - JSON de diálogos, encuentros, personajes
  index.html     - Entry point
```

## Créditos
- **Diseño y Desarrollo**: [Tu nombre]
- **Framework**: Phaser 3 (https://phaser.io)

## Licencia
[Por definir]
