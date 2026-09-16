/**
 * Deterministic gradients used as placeholder artwork and avatars. Real Spotify
 * artwork replaces these once a track/playlist has an `artworkUrl`.
 */

const HUE_PAIRS = 12;

function hashString(seed: string) {
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

export type Gradient = {
  from: string;
  to: string;
  /** Value usable with React Native's `experimental_backgroundImage`. */
  backgroundImage: string;
};

export function gradientFromSeed(seed: string, angle = 135): Gradient {
  const hash = hashString(seed);
  const hue = (hash % HUE_PAIRS) * (360 / HUE_PAIRS);
  const from = `hsl(${hue}, 68%, 58%)`;
  const to = `hsl(${(hue + 48) % 360}, 72%, 34%)`;

  return { from, to, backgroundImage: `linear-gradient(${angle}deg, ${from}, ${to})` };
}

/** A gradient derived from an explicit color, used for user-chosen accents. */
export function gradientFromColor(color: string, angle = 135): Gradient {
  return {
    from: color,
    to: color,
    backgroundImage: `linear-gradient(${angle}deg, ${color}, ${color}00)`,
  };
}
