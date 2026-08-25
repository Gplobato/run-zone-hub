// Web Audio API Cash Register / Cha-Ching Synthesizer & Notification System

class SoundService {
  private audioCtx: AudioContext | null = null;

  private initCtx() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  // Play realistic cash register / cha-ching sound
  playCashRegister() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // 1. Mechanical Clink (drawer pull)
      const noiseBuffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 0.05, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = this.audioCtx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(1200, now);
      noiseFilter.Q.setValueAtTime(3, now);
      const noiseGain = this.audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.audioCtx.destination);
      noise.start(now);

      // 2. High Bell 1 (E6 - 1318.5 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(1318.51, now + 0.04);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.setValueAtTime(0.6, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now + 0.04);
      osc1.stop(now + 0.9);

      // 3. High Bell 2 (B6 - 1975.5 Hz)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1975.53, now + 0.08);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.5, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 1.2);

      // 4. Gold Coin Ring (Harmonic Shimmer - 2637 Hz)
      const osc3 = this.audioCtx.createOscillator();
      const gain3 = this.audioCtx.createGain();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(2637.02, now + 0.12);
      gain3.gain.setValueAtTime(0, now);
      gain3.gain.setValueAtTime(0.4, now + 0.12);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc3.connect(gain3);
      gain3.connect(this.audioCtx.destination);
      osc3.start(now + 0.12);
      osc3.stop(now + 1.5);

      // Trigger phone vibration if supported
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([150, 80, 200]);
      }
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  // Play Pix Generated Sound (Gentle Chime)
  playPixChime() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15); // D6
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.6);

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(100);
      }
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  // Request browser notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }
    if (Notification.permission === "granted") return true;
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }

  // Send System Notification (Lockscreen & Status bar)
  sendNotification(title: string, options?: NotificationOptions) {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        const notif = new Notification(title, {
          icon: "/favicon.svg",
          badge: "/favicon.svg",
          vibrate: [200, 100, 200],
          ...options,
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (e) {
        console.warn("System notification error:", e);
      }
    }
  }
}

export const soundService = new SoundService();
