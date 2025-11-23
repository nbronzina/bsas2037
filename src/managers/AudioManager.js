// AudioManager.js - Sistema de audio 8-bit con Web Audio API

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    // Configuración
    this.volume = 0.7;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.8;
    this.muted = false;

    // Música activa
    this.currentMusic = null;
    this.musicNodes = [];
    this.isPlaying = false;
    this.musicTimeout = null;  // Track setTimeout para cancelar loops

    // Cargar configuración guardada
    this.loadSettings();

    // Inicializar contexto de audio
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Crear nodos de ganancia
      this.masterGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();

      // Conectar cadena de audio
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      // Aplicar volúmenes
      this.updateVolumes();

      console.log('AudioManager inicializado');
    } catch (error) {
      console.error('Error al inicializar Web Audio API:', error);
    }
  }

  // === GESTIÓN DE CONFIGURACIÓN ===

  loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('audio_settings') || '{}');
      this.volume = settings.volume ?? 0.7;
      this.musicVolume = settings.musicVolume ?? 0.5;
      this.sfxVolume = settings.sfxVolume ?? 0.8;
      this.muted = settings.muted ?? false;
    } catch (error) {
      console.error('Error al cargar configuración de audio:', error);
    }
  }

  saveSettings() {
    try {
      const settings = {
        volume: this.volume,
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume,
        muted: this.muted
      };
      localStorage.setItem('audio_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error al guardar configuración de audio:', error);
    }
  }

  updateVolumes() {
    if (!this.masterGain) return;

    const masterVolume = this.muted ? 0 : this.volume;
    this.masterGain.gain.value = masterVolume;
    this.musicGain.gain.value = this.musicVolume;
    this.sfxGain.gain.value = this.sfxVolume;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
    this.saveSettings();
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
    this.saveSettings();
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
    this.saveSettings();
  }

  toggleMute() {
    this.muted = !this.muted;
    this.updateVolumes();
    this.saveSettings();
    return this.muted;
  }

  // === UTILIDADES DE AUDIO ===

  /**
   * Crear un oscilador
   */
  createOscillator(type, frequency, startTime, duration, gain = 0.3) {
    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    oscGain.gain.value = 0;
    oscGain.gain.setValueAtTime(0, startTime);
    oscGain.gain.linearRampToValueAtTime(gain, startTime + 0.01);
    oscGain.gain.setValueAtTime(gain, startTime + duration - 0.05);
    oscGain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(oscGain);

    return { osc, gain: oscGain };
  }

  /**
   * Crear un ruido blanco (para percusión)
   */
  createNoise(startTime, duration, gain = 0.3) {
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.value = 0;
    noiseGain.gain.setValueAtTime(0, startTime);
    noiseGain.gain.linearRampToValueAtTime(gain, startTime + 0.01);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    noise.connect(filter);
    filter.connect(noiseGain);

    return { source: noise, gain: noiseGain };
  }

  // === EFECTOS DE SONIDO ===

  /**
   * Sonido de caminar (blip corto)
   */
  playWalkSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const { osc, gain } = this.createOscillator('square', 100, now, 0.05, 0.1);

    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Sonido de interacción con NPC (beep)
   */
  playInteractSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const { osc, gain } = this.createOscillator('square', 440, now, 0.1, 0.3);

    // Vibrato sutil
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(550, now + 0.05);
    osc.frequency.linearRampToValueAtTime(440, now + 0.1);

    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Sonido de confirmación (asignar tarea, seleccionar opción)
   */
  playConfirmSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Dos tonos ascendentes
    const { osc: osc1, gain: gain1 } = this.createOscillator('square', 523, now, 0.08, 0.2);
    const { osc: osc2, gain: gain2 } = this.createOscillator('square', 659, now + 0.08, 0.08, 0.2);

    gain1.connect(this.sfxGain);
    gain2.connect(this.sfxGain);

    osc1.start(now);
    osc1.stop(now + 0.08);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.16);
  }

  /**
   * Sonido de alerta (recursos bajos)
   */
  playAlertSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Tres beeps urgentes
    for (let i = 0; i < 3; i++) {
      const startTime = now + (i * 0.15);
      const { osc, gain } = this.createOscillator('sawtooth', 800, startTime, 0.1, 0.3);

      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + 0.1);
    }
  }

  /**
   * Sonido de victoria
   */
  playVictorySound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const notes = [523, 659, 784, 1047]; // C, E, G, C (arpeggio mayor)

    notes.forEach((freq, i) => {
      const startTime = now + (i * 0.15);
      const { osc, gain } = this.createOscillator('square', freq, startTime, 0.3, 0.25);

      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });

    // Acorde final
    const finalTime = now + 0.6;
    [523, 659, 784].forEach(freq => {
      const { osc, gain } = this.createOscillator('triangle', freq, finalTime, 0.8, 0.15);
      gain.connect(this.sfxGain);
      osc.start(finalTime);
      osc.stop(finalTime + 0.8);
    });
  }

  /**
   * Sonido de derrota
   */
  playDefeatSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const notes = [392, 349, 311, 262]; // G, F, D#, C (descenso cromático)

    notes.forEach((freq, i) => {
      const startTime = now + (i * 0.2);
      const { osc, gain } = this.createOscillator('sawtooth', freq, startTime, 0.4, 0.3);

      // Pitch bend down
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, startTime + 0.4);

      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  /**
   * Sonido de avance de tiempo
   */
  playTimeAdvanceSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Sweep ascendente
    const { osc, gain } = this.createOscillator('sine', 200, now, 0.3, 0.2);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);

    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // === MÚSICA ===

  /**
   * Detener música actual
   */
  stopMusic() {
    console.log('stopMusic() called - currentMusic:', this.currentMusic, 'isPlaying:', this.isPlaying);

    // CRÍTICO: Cancelar timeout pendiente para evitar loops duplicados
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
      console.log('Music timeout cleared');
    }

    this.musicNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // Ignorar errores de nodos ya detenidos
      }
    });
    this.musicNodes = [];
    this.currentMusic = null;
    this.isPlaying = false;

    console.log('Music stopped');
  }

  /**
   * Tema principal del mapa (post-apocalíptico, tenso)
   */
  playMapTheme() {
    console.log('playMapTheme() called - currentMusic:', this.currentMusic, 'isPlaying:', this.isPlaying);

    // CRÍTICO: Si ya está sonando, salir inmediatamente
    if (!this.audioContext) return;
    if (this.currentMusic === 'map' && this.isPlaying) {
      console.log('Map music already playing - SKIPPING');
      return;
    }

    console.log('Stopping any previous music');
    this.stopMusic();

    this.currentMusic = 'map';
    this.isPlaying = true;
    console.log('Starting map music');

    this.playMapThemeLoop();
  }

  playMapThemeLoop() {
    if (this.currentMusic !== 'map') return;

    const now = this.audioContext.currentTime;
    const tempo = 120; // BPM
    const beatDuration = 60 / tempo;
    const barDuration = beatDuration * 4;
    const totalDuration = barDuration * 8; // 8 compases

    // Bajo (patrón repetitivo oscuro)
    const bassPattern = [
      { note: 'A2', beat: 0, duration: 1 },
      { note: 'A2', beat: 1, duration: 0.5 },
      { note: 'A2', beat: 2, duration: 1 },
      { note: 'G2', beat: 3.5, duration: 0.5 },
      { note: 'A2', beat: 4, duration: 1 },
      { note: 'A2', beat: 5, duration: 0.5 },
      { note: 'F2', beat: 6, duration: 1 },
      { note: 'G2', beat: 7, duration: 1 }
    ];

    bassPattern.forEach(note => {
      const freq = this.noteToFreq(note.note);
      const startTime = now + (note.beat * beatDuration);
      const duration = note.duration * beatDuration;

      const { osc, gain } = this.createOscillator('triangle', freq, startTime, duration, 0.15);
      gain.connect(this.musicGain);
      osc.start(startTime);
      osc.stop(startTime + duration);

      this.musicNodes.push(osc);
    });

    // Arpegio (atmósfera tensa)
    const arpPattern = [
      { note: 'A3', beat: 0 }, { note: 'C4', beat: 0.5 }, { note: 'E4', beat: 1 },
      { note: 'A3', beat: 2 }, { note: 'C4', beat: 2.5 }, { note: 'E4', beat: 3 },
      { note: 'G3', beat: 4 }, { note: 'B3', beat: 4.5 }, { note: 'D4', beat: 5 },
      { note: 'F3', beat: 6 }, { note: 'A3', beat: 6.5 }, { note: 'C4', beat: 7 }
    ];

    for (let bar = 0; bar < 8; bar++) {
      arpPattern.forEach(note => {
        const freq = this.noteToFreq(note.note);
        const startTime = now + (bar * barDuration) + (note.beat * beatDuration);
        const duration = beatDuration * 0.4;

        const { osc, gain } = this.createOscillator('square', freq, startTime, duration, 0.08);
        gain.connect(this.musicGain);
        osc.start(startTime);
        osc.stop(startTime + duration);

        this.musicNodes.push(osc);
      });
    }

    // Percusión (kick y hi-hat)
    for (let beat = 0; beat < 32; beat++) {
      const startTime = now + (beat * beatDuration);

      // Kick en tiempos 0, 2
      if (beat % 4 === 0 || beat % 4 === 2) {
        const { source, gain } = this.createNoise(startTime, 0.1, 0.15);
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150;

        gain.connect(filter);
        filter.connect(this.musicGain);
        source.start(startTime);

        this.musicNodes.push(source);
      }

      // Hi-hat en contratiempos
      if (beat % 2 === 1) {
        const { source, gain } = this.createNoise(startTime, 0.05, 0.05);
        gain.connect(this.musicGain);
        source.start(startTime);

        this.musicNodes.push(source);
      }
    }

    // Loop recursivo (CRÍTICO: guardar timeout para poder cancelarlo)
    this.musicTimeout = setTimeout(() => {
      this.playMapThemeLoop();
    }, totalDuration * 1000);
  }

  /**
   * Tema de gestión (más relajado)
   */
  playManagementTheme() {
    if (!this.audioContext) return;
    if (this.currentMusic === 'management' && this.isPlaying) return;

    this.stopMusic();
    this.currentMusic = 'management';
    this.isPlaying = true;

    this.playManagementThemeLoop();
  }

  playManagementThemeLoop() {
    if (this.currentMusic !== 'management') return;

    const now = this.audioContext.currentTime;
    const tempo = 90; // BPM más lento
    const beatDuration = 60 / tempo;
    const barDuration = beatDuration * 4;
    const totalDuration = barDuration * 8;

    // Melodía (más melódica y esperanzadora)
    const melody = [
      { note: 'C4', beat: 0, duration: 1 },
      { note: 'E4', beat: 1, duration: 1 },
      { note: 'G4', beat: 2, duration: 1 },
      { note: 'C5', beat: 3, duration: 1 },
      { note: 'B4', beat: 4, duration: 0.5 },
      { note: 'A4', beat: 4.5, duration: 0.5 },
      { note: 'G4', beat: 5, duration: 2 }
    ];

    for (let bar = 0; bar < 4; bar++) {
      melody.forEach(note => {
        const freq = this.noteToFreq(note.note);
        const startTime = now + (bar * barDuration * 2) + (note.beat * beatDuration);
        const duration = note.duration * beatDuration;

        const { osc, gain } = this.createOscillator('sine', freq, startTime, duration, 0.12);
        gain.connect(this.musicGain);
        osc.start(startTime);
        osc.stop(startTime + duration);

        this.musicNodes.push(osc);
      });
    }

    // Acordes de acompañamiento
    const chords = [
      { notes: ['C3', 'E3', 'G3'], beat: 0, duration: 2 },
      { notes: ['A2', 'C3', 'E3'], beat: 2, duration: 2 },
      { notes: ['F3', 'A3', 'C4'], beat: 4, duration: 2 },
      { notes: ['G3', 'B3', 'D4'], beat: 6, duration: 2 }
    ];

    for (let bar = 0; bar < 8; bar++) {
      chords.forEach(chord => {
        chord.notes.forEach(note => {
          const freq = this.noteToFreq(note);
          const startTime = now + (bar * barDuration) + (chord.beat * beatDuration);
          const duration = chord.duration * beatDuration;

          const { osc, gain } = this.createOscillator('triangle', freq, startTime, duration, 0.06);
          gain.connect(this.musicGain);
          osc.start(startTime);
          osc.stop(startTime + duration);

          this.musicNodes.push(osc);
        });
      });
    }

    // Loop recursivo (guardar timeout)
    this.musicTimeout = setTimeout(() => {
      this.playManagementThemeLoop();
    }, totalDuration * 1000);
  }

  /**
   * Tema de encuentro (dramático)
   */
  playEncounterTheme() {
    if (!this.audioContext) return;
    if (this.currentMusic === 'encounter' && this.isPlaying) return;

    this.stopMusic();
    this.currentMusic = 'encounter';
    this.isPlaying = true;

    this.playEncounterThemeLoop();
  }

  playEncounterThemeLoop() {
    if (this.currentMusic !== 'encounter') return;

    const now = this.audioContext.currentTime;
    const tempo = 140; // BPM rápido, urgente
    const beatDuration = 60 / tempo;
    const barDuration = beatDuration * 4;
    const totalDuration = barDuration * 8;

    // Bajo intenso
    const bassPattern = [
      { note: 'D2', beat: 0 }, { note: 'D2', beat: 0.5 },
      { note: 'D2', beat: 1 }, { note: 'D2', beat: 1.5 },
      { note: 'C2', beat: 2 }, { note: 'C2', beat: 2.5 },
      { note: 'D2', beat: 3 }, { note: 'E2', beat: 3.5 }
    ];

    for (let bar = 0; bar < 8; bar++) {
      bassPattern.forEach(note => {
        const freq = this.noteToFreq(note.note);
        const startTime = now + (bar * barDuration) + (note.beat * beatDuration);
        const duration = beatDuration * 0.4;

        const { osc, gain } = this.createOscillator('sawtooth', freq, startTime, duration, 0.2);
        gain.connect(this.musicGain);
        osc.start(startTime);
        osc.stop(startTime + duration);

        this.musicNodes.push(osc);
      });
    }

    // Stabs (acordes cortos dramáticos)
    const stabs = [
      { notes: ['D4', 'F4', 'A4'], beat: 0 },
      { notes: ['C4', 'E4', 'G4'], beat: 2 },
      { notes: ['D4', 'F4', 'A4'], beat: 4 },
      { notes: ['E4', 'G4', 'B4'], beat: 6 }
    ];

    for (let bar = 0; bar < 8; bar++) {
      stabs.forEach(stab => {
        stab.notes.forEach(note => {
          const freq = this.noteToFreq(note);
          const startTime = now + (bar * barDuration) + (stab.beat * beatDuration);
          const duration = beatDuration * 0.2;

          const { osc, gain } = this.createOscillator('square', freq, startTime, duration, 0.15);
          gain.connect(this.musicGain);
          osc.start(startTime);
          osc.stop(startTime + duration);

          this.musicNodes.push(osc);
        });
      });
    }

    // Loop recursivo (guardar timeout)
    this.musicTimeout = setTimeout(() => {
      this.playEncounterThemeLoop();
    }, totalDuration * 1000);
  }

  /**
   * Tema del menú principal (ambiente minimalista, introductorio)
   */
  playMenuTheme() {
    if (!this.audioContext) return;
    if (this.currentMusic === 'menu' && this.isPlaying) return;

    this.stopMusic();
    this.currentMusic = 'menu';
    this.isPlaying = true;

    this.playMenuThemeLoop();
  }

  playMenuThemeLoop() {
    if (this.currentMusic !== 'menu') return;

    const now = this.audioContext.currentTime;
    const tempo = 90; // BPM más lento, contemplativo
    const beatDuration = 60 / tempo;
    const barDuration = beatDuration * 4;
    const totalDuration = barDuration * 8; // 8 compases

    // Bajo simple y espaciado
    const bassPattern = [
      { note: 'C2', beat: 0, duration: 2 },
      { note: 'F2', beat: 4, duration: 2 },
      { note: 'G2', beat: 8, duration: 2 },
      { note: 'C2', beat: 12, duration: 2 },
      { note: 'A#1', beat: 16, duration: 2 },
      { note: 'F2', beat: 20, duration: 2 },
      { note: 'G2', beat: 24, duration: 2 },
      { note: 'C2', beat: 28, duration: 2 }
    ];

    bassPattern.forEach(note => {
      const freq = this.noteToFreq(note.note);
      const startTime = now + (note.beat * beatDuration);
      const duration = note.duration * beatDuration;

      const { osc, gain } = this.createOscillator('sine', freq, startTime, duration, 0.12);
      gain.connect(this.musicGain);
      osc.start(startTime);
      osc.stop(startTime + duration);

      this.musicNodes.push(osc);
    });

    // Melodía etérea y espaciada (ambiente contemplativo)
    const melodyPattern = [
      { note: 'C4', beat: 1, duration: 1.5 },
      { note: 'E4', beat: 3, duration: 1.5 },
      { note: 'G4', beat: 5, duration: 1.5 },
      { note: 'F4', beat: 7, duration: 1.5 },
      { note: 'E4', beat: 9, duration: 2 },
      { note: 'D4', beat: 13, duration: 1.5 },
      { note: 'C4', beat: 17, duration: 2 },
      { note: 'G3', beat: 21, duration: 1.5 },
      { note: 'A#3', beat: 23, duration: 1.5 },
      { note: 'C4', beat: 25, duration: 2 }
    ];

    melodyPattern.forEach(note => {
      const freq = this.noteToFreq(note.note);
      const startTime = now + (note.beat * beatDuration);
      const duration = note.duration * beatDuration;

      const { osc, gain } = this.createOscillator('triangle', freq, startTime, duration, 0.08);
      gain.connect(this.musicGain);
      osc.start(startTime);
      osc.stop(startTime + duration);

      this.musicNodes.push(osc);
    });

    // Pad atmosférico (acordes suaves y largos)
    const padChords = [
      { notes: ['C3', 'E3', 'G3'], beat: 0, duration: 8 },
      { notes: ['F3', 'A3', 'C4'], beat: 8, duration: 8 },
      { notes: ['G3', 'B3', 'D4'], beat: 16, duration: 8 },
      { notes: ['C3', 'E3', 'G3'], beat: 24, duration: 8 }
    ];

    padChords.forEach(chord => {
      chord.notes.forEach(note => {
        const freq = this.noteToFreq(note);
        const startTime = now + (chord.beat * beatDuration);
        const duration = chord.duration * beatDuration;

        const { osc, gain } = this.createOscillator('sine', freq, startTime, duration, 0.04);
        gain.connect(this.musicGain);
        osc.start(startTime);
        osc.stop(startTime + duration);

        this.musicNodes.push(osc);
      });
    });

    // Percusión muy sutil (solo en algunos tiempos)
    const kickBeats = [0, 8, 16, 24];
    kickBeats.forEach(beat => {
      const startTime = now + (beat * beatDuration);
      const { source, gain } = this.createNoise(startTime, 0.08, 0.08);
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 120;

      gain.connect(filter);
      filter.connect(this.musicGain);
      source.start(startTime);

      this.musicNodes.push(source);
    });

    // Loop recursivo (guardar timeout)
    this.musicTimeout = setTimeout(() => {
      this.playMenuThemeLoop();
    }, totalDuration * 1000);
  }

  /**
   * Convertir nota musical a frecuencia
   */
  noteToFreq(note) {
    const notes = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };

    const noteName = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));

    const semitone = notes[noteName];
    const A4 = 440;
    const n = (octave - 4) * 12 + semitone - 9; // Distancia desde A4

    return A4 * Math.pow(2, n / 12);
  }

  /**
   * Reanudar contexto de audio (para Chrome que requiere interacción del usuario)
   */
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}
