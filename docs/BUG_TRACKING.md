# Bug Tracking - Red de Aguante MVP

## Formato de Reporte

```
### [SEVERITY] Bug Title

**ID:** BUG-XXX
**Status:** Open / In Progress / Fixed / Won't Fix
**Found:** YYYY-MM-DD
**Fixed:** YYYY-MM-DD (if applicable)

**Description:**
Brief description of the bug.

**Steps to Reproduce:**
1. Step one
2. Step two
3. ...

**Expected Behavior:**
What should happen.

**Actual Behavior:**
What actually happens.

**Screenshots/Logs:**
(if applicable)

**Fix:**
(description of fix when resolved)
```

## Severity Levels

- 🔴 **CRITICAL**: Crashes, data loss, blocks progression
- 🟠 **HIGH**: Major feature broken, workaround difficult
- 🟡 **MEDIUM**: Feature partially broken, workaround exists
- 🟢 **LOW**: Minor issue, cosmetic, edge case

---

## Open Bugs

*(Add bugs found during testing here)*

---

## Fixed Bugs

### [LOW] SettingsScene Button Overlap
**ID:** BUG-001
**Status:** Fixed
**Found:** 2025-11-24
**Fixed:** 2025-11-24

**Description:**
Test SFX button and Cerrar button overlapping in audio configuration.

**Fix:**
Increased panel height and repositioned buttons side-by-side with proper spacing.

---

### [MEDIUM] SettingsScene Return Bug
**ID:** BUG-002
**Status:** Fixed
**Found:** 2025-11-24
**Fixed:** 2025-11-24

**Description:**
Game froze when returning from SettingsScene to MainMenuScene.

**Fix:**
Changed closeSettings() to use `this.returnScene` directly instead of hardcoding scene names.

---

### [LOW] MainMenuScene Button Layout Overlap
**ID:** BUG-003
**Status:** Fixed
**Found:** 2025-11-24
**Fixed:** 2025-11-24

**Description:**
"Continuar" button pushed other buttons down, overlapping with footer.

**Fix:**
Implemented dynamic button positioning and spacing based on save existence.

---

### [LOW] SettingsScene Label Collision
**ID:** BUG-004
**Status:** Fixed
**Found:** 2025-11-24
**Fixed:** 2025-11-24

**Description:**
"Reducir Animaciones" text too long, colliding with left panel border.

**Fix:**
Split label into two lines with multiline support and proper alignment.

---

## Won't Fix

*(Bugs that are intentional or out of scope)*

---

## Testing Notes

- All bugs found during Phase 3 implementation have been fixed
- Test suite created to prevent regression
- Playtest simulation available for automated testing
