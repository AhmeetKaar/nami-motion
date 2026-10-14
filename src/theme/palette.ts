export type MotionPalette = {
  background: string;
  card: string;
  surface: string;
  raised: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentContrast: string;
  success: string;
  danger: string;
};

export type MotionPaletteSet = {
  light: MotionPalette;
  dark: MotionPalette;
};

export const moodstone: MotionPaletteSet = {
  light: {
    background: "#F3F4F5",
    card: "#FFFFFF",
    surface: "#E6EAEC",
    raised: "#D5DCDF",
    text: "#1A2023",
    textSecondary: "#6D7A7F",
    textTertiary: "#A3AEB2",
    accent: "#1F8A70",
    accentContrast: "#FFFFFF",
    success: "#1F8A70",
    danger: "#D63A2F",
  },
  dark: {
    background: "#0B0E10",
    card: "#141A1D",
    surface: "#1B2327",
    raised: "#2A353A",
    text: "#EEF2F3",
    textSecondary: "#7D8A8F",
    textTertiary: "#4F5B60",
    accent: "#5FC7B0",
    accentContrast: "#0B0E10",
    success: "#5FC7B0",
    danger: "#F2705B",
  },
};

export const moodstoneSwatches = {
  sand: "#F5D48A",
  sun: "#FFD447",
  tangerine: "#FF9F43",
  blossom: "#F48FB1",
  coral: "#F2705B",
  ember: "#D63A2F",
  lilac: "#C9B8F0",
  sky: "#3FC1F5",
  plum: "#9B59B6",
  lime: "#C5D94A",
  mint: "#5FC7B0",
  pine: "#1F8A70",
} as const;
