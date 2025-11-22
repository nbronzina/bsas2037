# Red de Aguante - Buenos Aires 2037

## Descripción
RPG de gestión territorial ambientado en Buenos Aires 2037. Jugás como Valeria "La Tana" Acosta, delegada de infraestructura eléctrica de Villa Soldati durante una temporada de sudestadas permanentes.

## Estado del Proyecto: MVP en Desarrollo

### Fases Completadas
- ✅ **FASE 0**: Setup básico - Ventana de juego 800x600px funcionando
- ✅ **FASE 1**: Movimiento básico - Valeria camina por mapa de Villa Soldati con colisiones
- ✅ **FASE 2**: Sistema de diálogos - NPC Beto con diálogos funcionales
- ✅ **FASE 3**: Sistema de recursos - ResourceManager + UI de 5 recursos (créditos, electricidad, agua, legitimidad, autonomía)

### Próximas Fases
- ⏳ **FASE 4**: Encuentros/Asambleas (EN PROGRESO)
- ⏳ **FASE 5**: Sistema de tiempo
- ⏳ **FASE 6**: Gestión de base
- ⏳ **FASE 7**: Integración MVP
- ⏳ **FASE 8**: Pulido básico

### Cómo Testear (Ahora mismo)
1. Abrir `index.html` en un navegador
2. Usar **WASD** o **Flechas** para mover a Valeria (cuadrado rojo)
3. Acercarse a Beto (cuadrado azul) y presionar **ENTER** para hablar
4. Ver panel de recursos en esquina superior derecha
5. **DEBUG**: Presionar **1/2** para modificar créditos, **3/4** para electricidad

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
