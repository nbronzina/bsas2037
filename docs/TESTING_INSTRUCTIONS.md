# Testing Instructions - Red de Aguante

## Running Automated Tests

### From Browser Console

1. Open the game in browser
2. Press **F3** to enable debug mode
3. Press **F5** to run all tests
4. Or type in console:

```javascript
// Run all tests
runAllTests();

// Run quick tests only
runQuickTest();

// Run playtest simulation only
const sim = new PlaytestSimulation();
sim.simulateFullGame();

// View QA checklist
qaChecklist.printChecklist();
```

## Manual Testing Checklist

### Before Each Test Session

1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Enable debug mode (F3)

### Core Gameplay (30 min)

- [ ] Start new game
- [ ] Complete tutorial
- [ ] Interact with all 4 NPCs
- [ ] Assign at least one task
- [ ] Advance to day 10
- [ ] Save game
- [ ] Reload and load save
- [ ] Continue to day 30
- [ ] Check NPC arcs evolved
- [ ] Continue to day 60
- [ ] Verify ending triggered

### Stress Testing (15 min)

- [ ] Rapidly click all buttons
- [ ] Open/close all menus repeatedly
- [ ] Spam advance day button
- [ ] Check for memory growth in dev tools
- [ ] Monitor FPS throughout

### Edge Cases (15 min)

- [ ] Let all resources hit 0
- [ ] Let all resources hit 100
- [ ] Skip all optional events
- [ ] Choose all negative options
- [ ] Choose all positive options

### Accessibility (10 min)

- [ ] Navigate entire game with keyboard only
- [ ] Enable high contrast, check readability
- [ ] Change text size, verify no overlaps
- [ ] ESC pauses from all screens

### Audio (5 min)

- [ ] Music plays on start
- [ ] Music changes between scenes
- [ ] SFX on button clicks
- [ ] Volume sliders work
- [ ] Mute works

## Keyboard Shortcuts for Testing

- **F3** - Toggle debug mode (enables performance monitor)
- **F4** - Log performance stats to console (when in debug mode)
- **F5** - Run full test suite (when in debug mode)
- **ESC** - Pause game
- **TAB** - Navigate focusable elements
- **ENTER** - Activate focused element

## Performance Monitoring

When debug mode is enabled (F3):
- FPS counter appears in top-left corner
- Memory usage displayed (if browser supports it)
- Object count per scene shown
- Color-coded FPS: Green (>55), Yellow (>30), Red (<30)

## Reporting Bugs

Use the template in `BUG_TRACKING.md`

Include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS
- Console errors (if any)
- Screenshot (if visual bug)

## Test Coverage

### Unit Tests
- GameState initialization
- Resource Manager (set, get, modify, clamp)
- Time Manager (day tracking)
- NPC Manager (properties, trust)
- Content (encounters, events, achievements)
- Systems (save/load, audio, tutorial, accessibility)

### Integration Tests
- Day advance → resource decay
- Task assignment → NPC interaction
- Encounter triggers → consequence application
- Achievement unlock → notification display
- Ending calculation

### Simulation Tests
- Full 60-day playthrough
- Random event triggering
- Resource crisis detection
- Game over conditions

## Success Criteria

✅ All unit tests pass
✅ Simulation completes 60 days without errors
✅ QA checklist 100% completed
✅ 0 critical bugs
✅ 0 high priority bugs
✅ FPS stable >30 throughout playthrough
✅ No memory leaks detected
