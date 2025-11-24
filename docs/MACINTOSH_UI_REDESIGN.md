# Macintosh Classic UI Redesign

## Overview

Complete visual overhaul of Red de Aguante implementing a **Macintosh System 6/7** classic aesthetic from the 80s/90s. The design is timeless but with clear retro-futuristic nods to the early Macintosh computing era.

## Design Philosophy

- **Monochrome palette**: Black, white, and various grays
- **Dot pattern textures**: Characteristic Mac desktop background
- **Striped title bars**: Horizontal black lines on white (System 6/7 signature)
- **3D button effects**: Borders with shadows for depth
- **Clean typography**: Geneva and Chicago fonts (Mac system fonts)
- **Window metaphor**: Floating windows with shadows
- **Minimalist icons**: Simple, clear, functional

## Visual Elements

### Color Palette

```javascript
colors: {
  black: 0x000000,
  white: 0xFFFFFF,
  lightGray: 0xCCCCCC,
  mediumGray: 0x888888,
  darkGray: 0x555555,
  desktopGray: 0x999999,
  shadow: 0x333333
}
```

### Desktop Background

- Base: Medium gray (`0x999999`)
- Texture: Dot pattern every 4 pixels in alternating positions
- Effect: Subtle texture reminiscent of early Mac displays

### Windows

All windows feature:
- White background with 2px black border
- Striped title bar (horizontal black lines on white, 20px height)
- Small square close button in top-left
- Drop shadow (4px offset, 50% opacity)

### Buttons

Mac-style 3D buttons with:
- White background with black border
- Default buttons: 3px border (bolder)
- Regular buttons: 2px border
- Hover: Light gray fill
- Active: Black fill with white text
- Shadow layer for depth

### Typography

- **Font family**: 'Geneva, Chicago, sans-serif'
- **Title text**: 12px bold
- **Body text**: 13-14px normal
- **Small text**: 10-11px for metadata

## Scene-by-Scene Changes

### WelcomeScene

**Before**: Dark blue background with gold accents and glow effects

**After**:
- Desktop background with dot pattern
- Central window (520x500px) with title bar
- Apple logo (🍏) as a nod to Mac
- Game title in black with clean typography
- Mac-style buttons ("Nueva Partida" as default button)
- Save info displayed below buttons
- Credits at bottom of window

### DeskScene

**Before**: Modern UI with colored resource bars and overlapping elements

**After**:
- Desktop background with Mac menu bar at top
- Menu bar: Apple logo + "Red de Aguante" title + system info
- **Resource window** (left side, 140x160px):
  - Striped title bar
  - Black progress bars with white backgrounds
  - Small, compact, non-overlapping
- **Document window** (center-right, 480x420px):
  - Striped title bar with document number
  - White "paper" background
  - Mac-style 3D option buttons
- **Feedback boxes** (top-right corner):
  - Small 70x20px boxes
  - Stack vertically with slide-down animation
  - Non-overlapping
- **Alerts** (top-right):
  - 250x80px Mac dialog boxes
  - OK button for dismissal

**Key fix**: Elements no longer overlap. Resource window on left, document in center, feedback/alerts in top-right corner.

### EndingScene

**Before**: Dark background with colored ending titles and modern layout

**After**:
- Desktop background
- Central ending window (560x520px)
- Striped title bar: "Fin de la semana"
- Ending icon (48px)
- Ending title in black (animated)
- Black separator line
- Description in clean black text
- Resource summary panel (light gray background, 480x40px)
- Statistics in small gray text
- Two Mac buttons: "Jugar de nuevo" (default) and "Menú"

## Technical Implementation

### Shared Components

All scenes share:
```javascript
createMacDesktop(width, height) {
  // Gray background with dot pattern texture
}

createStripedTitleBar(x, y, width, title) {
  // Horizontal black lines on white background
}

createMacButton(x, y, width, height, text, isDefault) {
  // 3D button with shadow and hover effects
}
```

### Animation

Retained from previous version:
- Fade transitions between scenes
- Title scale/alpha animation
- Resource bar sequential reveal
- Button hover/active states

### Accessibility

- High contrast (black on white)
- Clear button states (hover, active)
- Consistent visual hierarchy
- Large click targets

## Files Changed

1. **src/scenes/DeskScene.js** (773 lines)
   - Complete rewrite with Mac aesthetic
   - Fixed overlapping UI elements
   - Moved feedback to top-right corner

2. **src/scenes/WelcomeScene.js** (258 lines)
   - Redesigned with central window
   - Mac-style buttons
   - Striped title bar

3. **src/scenes/EndingScene.js** (450 lines)
   - Ending window with Mac style
   - Resource summary panel
   - Mac buttons

## Design Goals Achieved

✅ **Real PC aesthetic**: Authentic Macintosh System 6/7 look
✅ **No overlapping**: All UI elements properly positioned
✅ **Timeless design**: Classic but not dated
✅ **80s nods**: Striped title bars, monochrome palette, system fonts
✅ **Consistent**: All scenes share same visual language
✅ **Functional**: All gameplay mechanics intact
✅ **Responsive**: Proper hover states and feedback

## Future Enhancements

Potential additions to deepen the Mac aesthetic:

- **Menu bar interaction**: Clickable menu items (File, Edit, etc.)
- **Desktop icons**: Trash, documents on desktop
- **System sounds**: Classic Mac beeps and clicks
- **Watch cursor**: Mac classic wait cursor during loading
- **Desk accessories**: Calculator, notepad as Easter eggs
- **About box**: Classic Mac about dialog with credits

## Inspiration

- Macintosh System 6 (1988)
- Macintosh System 7 (1991)
- HyperCard (1987)
- MacPaint (1984)
- Early Mac GUI conventions

## Result

The game now has a distinctive **retro-futuristic aesthetic** that evokes the optimism and clarity of early personal computing while maintaining modern gameplay. The Macintosh visual language reinforces the game's themes of grassroots technology and community empowerment.

---

**Commits:**
- `adb2d09`: Redesign DeskScene with Macintosh classic UI
- `f01f28f`: Apply Macintosh classic UI to WelcomeScene and EndingScene
