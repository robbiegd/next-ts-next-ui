import { CHARACTERS } from '@/lib/data/characters';
import {
  type Character,
  type Complexity,
  type Experience,
  type HostageCounts,
  type SuggestInput,
  type SuggestResult,
  type Tier
} from '@/lib/types/wizard';

function getAllowedTiers(experience: Experience, complexity: Complexity): Tier[] {
  if (experience === 'first-time') {
    if (complexity === 'chaos') {
      return ['beginner', 'intermediate'];
    }
    return ['beginner'];
  }

  if (experience === 'some-experience') {
    if (complexity === 'simple') {
      return ['beginner'];
    }
    if (complexity === 'mix') {
      return ['beginner', 'intermediate'];
    }
    return ['beginner', 'intermediate', 'advanced'];
  }

  // know-it
  if (complexity === 'simple') {
    return ['beginner', 'intermediate'];
  }
  if (complexity === 'mix') {
    return ['beginner', 'intermediate', 'advanced'];
  }
  return ['beginner', 'intermediate', 'advanced'];
}

function getGreyBudget(tiers: Tier[], playerCount: number, includeGrey: boolean): number {
  if (!includeGrey) {
    return 0;
  }
  if (tiers.includes('advanced')) {
    return playerCount > 20 ? 4 : 2;
  }
  if (tiers.includes('intermediate')) {
    return playerCount > 15 ? 2 : 1;
  }
  return 0;
}

export function getHostageCounts(playerCount: number): HostageCounts {
  if (playerCount <= 10) {
    return [1, 1, 1];
  }
  if (playerCount <= 21) {
    return [2, 1, 1];
  }
  return [3, 2, 1];
}

export function getRoundTiming(experience: Experience): string {
  if (experience === 'first-time') {
    return '3 min · 2 min · 1 min';
  }
  if (experience === 'some-experience') {
    return '2 min · 90 sec · 1 min';
  }
  return '90 sec · 60 sec · 45 sec';
}

function stableHash(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    const code = value.codePointAt(index) ?? 0;
    hash = (hash << 5) - hash + code;
    hash = Math.trunc(hash);
  }
  return Math.abs(hash);
}

function stableShuffle<T extends { id: string }>(items: T[], seed: number): T[] {
  return [...items].sort((a, b) => {
    const hashA = stableHash(a.id + seed.toString());
    const hashB = stableHash(b.id + seed.toString());
    return hashA - hashB;
  });
}

function pickCharacters(pool: Character[], count: number, seed: number): Character[] {
  const shuffled = stableShuffle(pool, seed);
  return shuffled.slice(0, count);
}

export function suggest(input: SuggestInput): SuggestResult {
  const { playerCount, experience, complexity, includeGrey, includeBackup } = input;

  const allowedTiers = getAllowedTiers(experience, complexity);
  const greyBudget = getGreyBudget(allowedTiers, playerCount, includeGrey);

  const totalCards = playerCount + 1;
  const available = totalCards - 2; // subtract president + bomber

  // Separate primaries from candidates
  const primaries = CHARACTERS.filter((character) => character.isPrimary);
  const candidates = CHARACTERS.filter(
    (character) =>
      !character.isPrimary &&
      allowedTiers.includes(character.tier) &&
      (includeBackup || !character.isBackup)
  );

  // Split by team
  const blueCandidates = candidates.filter((character) => character.team === 'blue');
  const redCandidates = candidates.filter((character) => character.team === 'red');
  const greyCandidates = candidates.filter((character) => character.team === 'grey');

  // Handle paired characters (marshal + fugitive must both be included or excluded)
  const pairedIds = new Set<string>();

  // Calculate slot budget — grey capped at budget, remaining split evenly blue/red
  const greySlots = Math.min(greyBudget, greyCandidates.length, Math.floor(available * 0.25));

  // Always include Gambler (grey/beginner) for odd player counts regardless of grey preference
  let forcedGrey: Character[] = [];
  const gambler = CHARACTERS.find((character) => character.id === 'gambler');
  if (playerCount % 2 !== 0 && gambler) {
    forcedGrey = [gambler];
  }

  const greyForcedCount = forcedGrey.length;
  const adjustedGreySlots = Math.max(greySlots, greyForcedCount);
  const remainingForTeams = available - adjustedGreySlots;
  const blueSlots = Math.ceil(remainingForTeams / 2);
  const redSlots = remainingForTeams - blueSlots;

  const seed = playerCount;

  // Check if marshal/fugitive pair can fit — needs 1 blue slot + 1 red slot
  const marshalCharacter = blueCandidates.find((character) => character.id === 'marshal');
  const fugitiveCharacter = redCandidates.find((character) => character.id === 'fugitive');
  const canIncludePair =
    marshalCharacter !== undefined &&
    fugitiveCharacter !== undefined &&
    blueSlots >= 1 &&
    redSlots >= 1;

  let selectedBlue: Character[] = [];
  let selectedRed: Character[] = [];
  let selectedGrey: Character[] = [...forcedGrey];

  if (canIncludePair && stableHash('pair' + seed.toString()) % 3 !== 0) {
    // Include the pair, reduce remaining slots by 1 each
    pairedIds.add('marshal');
    pairedIds.add('fugitive');
    selectedBlue = [
      marshalCharacter,
      ...pickCharacters(
        blueCandidates.filter((character) => !pairedIds.has(character.id)),
        blueSlots - 1,
        seed
      )
    ];
    selectedRed = [
      fugitiveCharacter,
      ...pickCharacters(
        redCandidates.filter((character) => !pairedIds.has(character.id)),
        redSlots - 1,
        seed
      )
    ];
  } else {
    selectedBlue = pickCharacters(
      blueCandidates.filter((character) => !pairedIds.has(character.id)),
      blueSlots,
      seed
    );
    selectedRed = pickCharacters(
      redCandidates.filter((character) => !pairedIds.has(character.id)),
      redSlots,
      seed
    );
  }

  // Fill grey slots (avoiding duplicates already in forcedGrey)
  const forcedGreyIds = new Set(forcedGrey.map((character) => character.id));
  const additionalGreyNeeded = adjustedGreySlots - greyForcedCount;
  if (additionalGreyNeeded > 0) {
    const additionalGrey = pickCharacters(
      greyCandidates.filter((character) => !forcedGreyIds.has(character.id)),
      additionalGreyNeeded,
      seed
    );
    selectedGrey = [...forcedGrey, ...additionalGrey];
  }

  const characters: Character[] = [...primaries, ...selectedBlue, ...selectedRed, ...selectedGrey];

  return {
    characters,
    totalCards,
    buriedCount: 1,
    hostagesPerRound: getHostageCounts(playerCount),
    colorSharingAllowed: playerCount >= 11,
    roundTimingSuggestion: getRoundTiming(experience)
  };
}
