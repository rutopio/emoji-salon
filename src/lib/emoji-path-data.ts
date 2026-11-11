/** Per-emoji SVG path data served from public/data/emoji.
 * Keep the compact d/f/c keys stable: they are the preprocessed asset format. */
export interface EmojiPathData {
  /** SVG path commands, one string per drawn element. */
  d: string[];
  /** Original fill for each path, in the same order as d. */
  f: string[];
  /** Distinct editable fills, in first-seen order; palette indices refer here. */
  c: string[];
}
