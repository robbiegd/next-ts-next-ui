export interface SoundDefinition {
  key: string;
  label: string;
  description: string;
  loop?: boolean;
}

/** Every game event that can play a sound. Each has a bundled default in
 * /public/sounds and can be overridden from the admin panel. */
export const SOUND_REGISTRY: SoundDefinition[] = [
  {
    key: 'theme',
    label: 'Theme music',
    description: 'Background music for the lobby and between rounds',
    loop: true
  },
  {
    key: 'faceoff',
    label: 'Face Off sting',
    description: 'Plays when a new Face Off round starts'
  },
  {
    key: 'buzz-in',
    label: 'Buzz in',
    description: 'Plays when a player hits their buzzer first'
  },
  {
    key: 'reveal',
    label: 'Correct answer',
    description: 'The board ding when an answer flips over'
  },
  {
    key: 'strike',
    label: 'Wrong answer',
    description: 'The dreaded strike buzzer (big red X)'
  },
  {
    key: 'steal',
    label: 'Steal opportunity',
    description: 'Plays when the other team gets a chance to steal'
  },
  {
    key: 'fastmoney',
    label: 'Fast Money',
    description: 'Plays when the Fast Money round begins'
  },
  {
    key: 'applause',
    label: 'Applause',
    description: 'Round win, steal win, and end of game celebration'
  },
  {
    key: 'tick',
    label: 'Timer tick',
    description: 'Fast Money countdown tick'
  }
];

export const SOUND_KEYS = new Set(SOUND_REGISTRY.map((sound) => sound.key));
