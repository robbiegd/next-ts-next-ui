// Generates placeholder game-show sound effects as WAV files in public/sounds.
// These stand in for real Family Feud sounds until custom ones are uploaded
// via the admin panel. Run with: node scripts/generate-sounds.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SAMPLE_RATE = 44_100;
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'public', 'sounds');
mkdirSync(outDir, { recursive: true });

function toWav(samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (const [index, sample] of samples.entries()) {
    const clamped = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.round(clamped * 32_767), 44 + index * 2);
  }
  return buffer;
}

function seconds(duration) {
  return Math.floor(duration * SAMPLE_RATE);
}

function silence(duration) {
  return new Float64Array(seconds(duration));
}

function envelope(t, duration, attack = 0.01, release = 0.08) {
  if (t < attack) return t / attack;
  if (t > duration - release) return Math.max(0, (duration - t) / release);
  return 1;
}

function tone({ freq, duration, type = 'sine', gain = 0.6, attack, release, slide = 0 }) {
  const out = new Float64Array(seconds(duration));
  for (let index = 0; index < out.length; index++) {
    const t = index / SAMPLE_RATE;
    const f = freq + slide * (t / duration);
    const phase = 2 * Math.PI * (freq * t + (slide * t * t) / (2 * duration));
    let value;
    switch (type) {
      case 'square': {
        value = Math.sign(Math.sin(phase));
        break;
      }
      case 'saw': {
        value = 2 * ((f * t) % 1) - 1;
        break;
      }
      case 'triangle': {
        value = 2 * Math.abs(2 * ((f * t) % 1) - 1) - 1;
        break;
      }
      default: {
        value = Math.sin(phase);
      }
    }
    out[index] = value * gain * envelope(t, duration, attack, release);
  }
  return out;
}

function noise({ duration, gain = 0.5, attack = 0.01, release = 0.1 }) {
  const out = new Float64Array(seconds(duration));
  let last = 0;
  for (let index = 0; index < out.length; index++) {
    const t = index / SAMPLE_RATE;
    // Pink-ish noise via simple lowpass of white noise
    last = 0.96 * last + 0.04 * (Math.random() * 2 - 1);
    out[index] = last * 8 * gain * envelope(t, duration, attack, release);
  }
  return out;
}

function concat(...parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Float64Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function mix(...parts) {
  const total = Math.max(...parts.map((part) => part.length));
  const out = new Float64Array(total);
  for (const part of parts) {
    for (const [index, sample] of part.entries()) out[index] += sample;
  }
  return out;
}

function write(name, samples) {
  writeFileSync(join(outDir, `${name}.wav`), toWav(samples));
  console.log(`wrote ${name}.wav (${(samples.length / SAMPLE_RATE).toFixed(2)}s)`);
}

// reveal — the classic double "ding"
write(
  'reveal',
  concat(
    mix(
      tone({ freq: 880, duration: 0.18, gain: 0.5, release: 0.12 }),
      tone({ freq: 1760, duration: 0.18, gain: 0.2, release: 0.12 })
    ),
    silence(0.03),
    mix(
      tone({ freq: 1174.66, duration: 0.45, gain: 0.5, release: 0.35 }),
      tone({ freq: 2349.32, duration: 0.45, gain: 0.18, release: 0.35 })
    )
  )
);

// strike — the harsh wrong-answer buzzer
write(
  'strike',
  mix(
    tone({ freq: 130, duration: 0.75, type: 'saw', gain: 0.45, release: 0.15 }),
    tone({ freq: 97, duration: 0.75, type: 'square', gain: 0.28, release: 0.15 })
  )
);

// buzz-in — quick two-note chirp when a player buzzes
write(
  'buzz-in',
  concat(
    tone({ freq: 523.25, duration: 0.12, type: 'square', gain: 0.35 }),
    tone({ freq: 783.99, duration: 0.28, type: 'square', gain: 0.35, release: 0.2 })
  )
);

// faceoff — rising sweep into a hit
write(
  'faceoff',
  concat(
    tone({ freq: 220, duration: 0.5, slide: 660, gain: 0.4, release: 0.05 }),
    mix(
      tone({ freq: 659.25, duration: 0.4, gain: 0.45, release: 0.3 }),
      tone({ freq: 987.77, duration: 0.4, gain: 0.3, release: 0.3 })
    )
  )
);

// steal — dramatic minor sting
write(
  'steal',
  concat(
    tone({ freq: 440, duration: 0.22, gain: 0.45 }),
    tone({ freq: 415.3, duration: 0.22, gain: 0.45 }),
    mix(
      tone({ freq: 392, duration: 0.7, gain: 0.45, release: 0.5 }),
      tone({ freq: 466.16, duration: 0.7, gain: 0.3, release: 0.5 })
    )
  )
);

// fastmoney — fanfare arpeggio
const fanfareNotes = [523.25, 659.25, 783.99, 1046.5];
write(
  'fastmoney',
  concat(
    ...fanfareNotes.map((freq) => tone({ freq, duration: 0.16, gain: 0.45, release: 0.05 })),
    mix(
      tone({ freq: 1046.5, duration: 0.7, gain: 0.4, release: 0.5 }),
      tone({ freq: 1318.51, duration: 0.7, gain: 0.28, release: 0.5 })
    )
  )
);

// applause — shaped noise bursts
write(
  'applause',
  mix(
    noise({ duration: 2.4, gain: 0.5, attack: 0.15, release: 1 }),
    noise({ duration: 1.2, gain: 0.3, attack: 0.05, release: 0.6 })
  )
);

// tick — short click for the fast money timer
write('tick', tone({ freq: 1500, duration: 0.05, type: 'triangle', gain: 0.4, release: 0.03 }));

// theme — short upbeat loop
const themeNotes = [
  [261.63, 0.22],
  [329.63, 0.22],
  [392, 0.22],
  [523.25, 0.32],
  [392, 0.22],
  [440, 0.22],
  [493.88, 0.22],
  [523.25, 0.44]
];
write(
  'theme',
  concat(
    ...themeNotes.map(([freq, duration]) =>
      mix(
        tone({ freq, duration, gain: 0.32, release: 0.08 }),
        tone({ freq: freq / 2, duration, type: 'triangle', gain: 0.22, release: 0.08 })
      )
    )
  )
);
