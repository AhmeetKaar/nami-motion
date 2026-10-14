import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { moodstone, type MotionPalette, type MotionPaletteSet } from "./palette";

const MotionPaletteContext = createContext<MotionPaletteSet | null>(null);

export type MotionThemeProviderProps = {
  palette?: Partial<MotionPalette> | { light?: Partial<MotionPalette>; dark?: Partial<MotionPalette> };
  children?: ReactNode;
};

function isPaletteSet(
  palette: MotionThemeProviderProps["palette"],
): palette is { light?: Partial<MotionPalette>; dark?: Partial<MotionPalette> } {
  return !!palette && ("light" in palette || "dark" in palette);
}

export function MotionThemeProvider({ palette, children }: MotionThemeProviderProps) {
  const value = useMemo<MotionPaletteSet>(() => {
    if (!palette) return moodstone;
    if (isPaletteSet(palette)) {
      return {
        light: { ...moodstone.light, ...palette.light },
        dark: { ...moodstone.dark, ...palette.dark },
      };
    }
    return {
      light: { ...moodstone.light, ...palette },
      dark: { ...moodstone.dark, ...palette },
    };
  }, [palette]);

  return <MotionPaletteContext.Provider value={value}>{children}</MotionPaletteContext.Provider>;
}

export function useMotionPalette(override?: Partial<MotionPalette>): MotionPalette {
  const set = useContext(MotionPaletteContext) ?? moodstone;
  const scheme = useColorScheme();
  const base = scheme === "dark" ? set.dark : set.light;
  return useMemo(() => (override ? { ...base, ...override } : base), [base, override]);
}
