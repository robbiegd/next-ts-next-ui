import { type Character } from '@/lib/types/wizard';

export const CHARACTERS: readonly Character[] = [
  // ── BEGINNER ──────────────────────────────────────────────────────────────

  {
    id: 'president',
    name: 'President',
    team: 'blue',
    tier: 'beginner',
    ability: 'Blue Team wins if you are NOT in the same room as the Bomber at game end.',
    isPrimary: true
  },
  {
    id: 'bomber',
    name: 'Bomber',
    team: 'red',
    tier: 'beginner',
    ability: 'Red Team wins if you ARE in the same room as the President at game end.',
    isPrimary: true
  },
  {
    id: 'blueAgent',
    name: 'Agent',
    team: 'blue',
    tier: 'beginner',
    ability:
      'Once per round, privately reveal your card to force another player to card share with you.',
    isPrimary: false
  },
  {
    id: 'ambassador',
    name: 'Ambassador',
    team: 'blue',
    tier: 'beginner',
    ability: 'You are immune to all powers. You may freely move between rooms at any time.',
    isPrimary: false
  },
  {
    id: 'blueHunter',
    name: 'Hunter',
    team: 'blue',
    tier: 'beginner',
    ability: 'If a player uses a power on you, they must give you their card.',
    isPrimary: false
  },
  {
    id: 'blueMedic',
    name: 'Medic',
    team: 'blue',
    tier: 'beginner',
    ability: 'Any player who card shares with you has all conditions removed.',
    isPrimary: false
  },
  {
    id: 'blueEnlisted',
    name: 'Enlisted',
    team: 'blue',
    tier: 'beginner',
    ability: 'You may publicly reveal your card to automatically become a hostage this round.',
    isPrimary: false
  },
  {
    id: 'blueSpy',
    name: 'Spy',
    team: 'blue',
    tier: 'beginner',
    ability: 'Your card appears red, but you are on the Blue Team.',
    isPrimary: false
  },
  {
    id: 'redAgent',
    name: 'Agent',
    team: 'red',
    tier: 'beginner',
    ability:
      'Once per round, privately reveal your card to force another player to card share with you.',
    isPrimary: false
  },
  {
    id: 'redCleaner',
    name: 'Cleaner',
    team: 'red',
    tier: 'beginner',
    ability: 'Any player who card shares with you has all conditions removed.',
    isPrimary: false
  },
  {
    id: 'redEnlisted',
    name: 'Enlisted',
    team: 'red',
    tier: 'beginner',
    ability: 'You may publicly reveal your card to automatically become a hostage this round.',
    isPrimary: false
  },
  {
    id: 'redSpy',
    name: 'Spy',
    team: 'red',
    tier: 'beginner',
    ability: 'Your card appears blue, but you are on the Red Team.',
    isPrimary: false
  },
  {
    id: 'redUsurper',
    name: 'Usurper',
    team: 'red',
    tier: 'beginner',
    ability: 'You may publicly reveal your card to automatically become the room leader.',
    isPrimary: false
  },
  {
    id: 'blueUsurper',
    name: 'Usurper',
    team: 'blue',
    tier: 'beginner',
    ability: 'You may publicly reveal your card to automatically become the room leader.',
    isPrimary: false
  },
  {
    id: 'gambler',
    name: 'Gambler',
    team: 'grey',
    tier: 'beginner',
    ability:
      'Before cards are revealed, publicly announce which team will win. You win individually if correct.',
    isPrimary: false
  },
  {
    id: 'survivor',
    name: 'Survivor',
    team: 'grey',
    tier: 'beginner',
    ability: 'You win if you are NOT in the same room as the Bomber at game end.',
    isPrimary: false
  },

  // ── INTERMEDIATE ──────────────────────────────────────────────────────────

  {
    id: 'doctor',
    name: 'Doctor',
    team: 'blue',
    tier: 'intermediate',
    ability: "Once per round, you may privately look at any other player's card.",
    isPrimary: false
  },
  {
    id: 'engineer',
    name: 'Engineer',
    team: 'red',
    tier: 'intermediate',
    ability: 'Red Team wins if you card share with the Bomber before the game ends.',
    isPrimary: false
  },
  {
    id: 'sniper',
    name: 'Sniper',
    team: 'red',
    tier: 'intermediate',
    ability:
      'Publicly name one player before reveals. If that player is the President, Red Team wins.',
    isPrimary: false
  },
  {
    id: 'target',
    name: 'Target',
    team: 'blue',
    tier: 'intermediate',
    ability: 'Blue Team wins if you end the game in the opposite room from the President.',
    isPrimary: false
  },
  {
    id: 'intern',
    name: 'Intern',
    team: 'blue',
    tier: 'intermediate',
    ability: 'You are on Blue Team. At game end, you win only if the President also wins.',
    isPrimary: false,
    isBackup: true
  },
  {
    id: 'angel',
    name: 'Angel',
    team: 'grey',
    tier: 'intermediate',
    ability: 'You win if you end the game in the same room as the President.',
    isPrimary: false
  },
  {
    id: 'demon',
    name: 'Demon',
    team: 'grey',
    tier: 'intermediate',
    ability: 'You win if you end the game in the same room as the Bomber.',
    isPrimary: false
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    team: 'grey',
    tier: 'intermediate',
    ability: 'You win if you have been in both rooms at least once during the game.',
    isPrimary: false
  },
  {
    id: 'marshal',
    name: 'Marshal',
    team: 'blue',
    tier: 'intermediate',
    ability: 'If you card share with the Fugitive, the game ends immediately — Blue Team wins.',
    isPrimary: false,
    requiresPair: 'fugitive'
  },
  {
    id: 'fugitive',
    name: 'Fugitive',
    team: 'red',
    tier: 'intermediate',
    ability: 'If you card share with the Marshal, the game ends immediately — Red Team wins.',
    isPrimary: false,
    requiresPair: 'marshal'
  },
  {
    id: 'ninja',
    name: 'Ninja',
    team: 'grey',
    tier: 'intermediate',
    ability:
      'During any round but the last, you may publicly reveal and remove one opponent from your room.',
    isPrimary: false
  },
  {
    id: 'security',
    name: 'Security',
    team: 'blue',
    tier: 'intermediate',
    ability:
      'You may publicly reveal your card to prevent one player in your room from being chosen as a hostage.',
    isPrimary: false
  },
  {
    id: 'bouncer',
    name: 'Bouncer',
    team: 'red',
    tier: 'intermediate',
    ability:
      'Once per game, publicly reveal to block one player from entering your room as a hostage.',
    isPrimary: false
  },
  {
    id: 'bornLeader',
    name: 'Born Leader',
    team: 'blue',
    tier: 'intermediate',
    ability:
      'You are always the room leader. Other players cannot become leader while you are present.',
    isPrimary: false
  },
  {
    id: 'witness',
    name: 'Witness',
    team: 'blue',
    tier: 'intermediate',
    ability: 'If you card share with the One-Armed Man, the game ends immediately — Red Team wins.',
    isPrimary: false,
    isBackup: true
  },
  {
    id: 'president-daughter',
    name: "President's Daughter",
    team: 'blue',
    tier: 'intermediate',
    ability: 'If the President is buried, you become the President.',
    isPrimary: false,
    isBackup: true
  },

  // ── ADVANCED ──────────────────────────────────────────────────────────────

  {
    id: 'vampire',
    name: 'Vampire',
    team: 'grey',
    tier: 'advanced',
    ability:
      'Any player from the opposing team who card shares with you gains the "seduced" condition and must obey you.',
    isPrimary: false
  },
  {
    id: 'werewolf',
    name: 'Werewolf',
    team: 'grey',
    tier: 'advanced',
    ability:
      'Players who card share with you gain the "bitten" condition and must answer your questions truthfully.',
    isPrimary: false
  },
  {
    id: 'conspirator',
    name: 'Conspirator',
    team: 'red',
    tier: 'advanced',
    ability:
      'Any player who card shares with a member of the opposing team gains the "traitor" condition, switching teams.',
    isPrimary: false
  },
  {
    id: 'cultLeader',
    name: 'Cult Leader',
    team: 'grey',
    tier: 'advanced',
    ability:
      'Players who card share with you become "cultists." You win if you have the most followers at game end.',
    isPrimary: false
  },
  {
    id: 'piper',
    name: 'Piper',
    team: 'grey',
    tier: 'advanced',
    ability:
      'Players who card share with you gain the "piped" condition. You lose if any piped player is separated from you at game end.',
    isPrimary: false
  },
  {
    id: 'bodySnatcher',
    name: 'Body Snatcher',
    team: 'grey',
    tier: 'advanced',
    ability:
      "Once per game, secretly swap your card with another player's card and assume their allegiance.",
    isPrimary: false
  },
  {
    id: 'identityThief',
    name: 'Identity Thief',
    team: 'grey',
    tier: 'advanced',
    ability:
      "You start with another player's card; they have yours. You win if the player whose card you hold achieves their win condition.",
    isPrimary: false
  },
  {
    id: 'drBoom',
    name: 'Dr. Boom',
    team: 'red',
    tier: 'advanced',
    ability: 'If you card share with the President, the game ends immediately — Red Team wins.',
    isPrimary: false
  },
  {
    id: 'centipede',
    name: 'Centipede',
    team: 'grey',
    tier: 'advanced',
    ability:
      'Players who card share with you become "attached." You win if 3+ attached players end the game in your room.',
    isPrimary: false
  },
  {
    id: 'hypnotist',
    name: 'Hypnotist',
    team: 'red',
    tier: 'advanced',
    ability:
      'Players who card share with you gain the "hypnotized" condition and must roleplay as a character you suggest.',
    isPrimary: false
  }
] as const;

export const CHARACTERS_BY_ID: Record<string, Character> = Object.fromEntries(
  CHARACTERS.map((character) => [character.id, character])
);

export const PRIMARY_IDS = ['president', 'bomber'] as const;
