'use client';

export interface SoundManifestEntry {
  key: string;
  label: string;
  description: string;
  loop?: boolean;
  custom: boolean;
  fileName: string | null;
  url: string;
}

/**
 * Plays game sounds. Sources come from the sound manifest — either bundled
 * defaults in /public/sounds or admin-uploaded overrides served from the DB.
 * Browsers require a user gesture before audio can start, so call `unlock()`
 * from a click handler (the board page shows an "enable sound" button).
 */
export class SoundPlayer {
  private readonly manifest = new Map<string, SoundManifestEntry>();
  private readonly buffers = new Map<string, HTMLAudioElement>();
  private themeAudio: HTMLAudioElement | null = null;
  private unlocked = false;
  enabled = true;

  async loadManifest(): Promise<SoundManifestEntry[]> {
    const response = await fetch('/api/sounds');
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as { sounds: SoundManifestEntry[] };
    this.manifest.clear();
    for (const sound of data.sounds) {
      this.manifest.set(sound.key, sound);
    }
    this.buffers.clear();
    return data.sounds;
  }

  unlock() {
    this.unlocked = true;
  }

  isUnlocked() {
    return this.unlocked;
  }

  play(key: string) {
    if (!this.enabled || !this.unlocked) {
      return;
    }
    const entry = this.manifest.get(key);
    if (!entry) {
      return;
    }

    if (entry.loop) {
      this.toggleTheme(entry);
      return;
    }

    let audio = this.buffers.get(key);
    if (!audio) {
      audio = new Audio(entry.url);
      this.buffers.set(key, audio);
    }
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }

  private toggleTheme(entry: SoundManifestEntry) {
    if (this.themeAudio && !this.themeAudio.paused) {
      this.themeAudio.pause();
      this.themeAudio.currentTime = 0;
      return;
    }
    if (!this.themeAudio) {
      this.themeAudio = new Audio(entry.url);
      this.themeAudio.loop = true;
      this.themeAudio.volume = 0.6;
    }
    void this.themeAudio.play().catch(() => undefined);
  }

  stopTheme() {
    this.themeAudio?.pause();
  }
}
