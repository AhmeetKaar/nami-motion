import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { moodstone, type MotionPalette, type MotionPaletteSet } from "./palette";

type MotionThemeValue = {
  palettes: MotionPaletteSet;
  colorScheme?: "light" | "dark";
};

const MotionPaletteContext = createContext<MotionThemeValue | null>(null);

export type MotionThemeProviderProps = {
  palette?: Partial<MotionPalette> | { light?: Partial<MotionPalette>; dark?: Partial<MotionPalette> };
  colorScheme?: "light" | "dark";
  children?: ReactNode;
};

function isPaletteSet(
  palette: MotionThemeProviderProps["palette"],
): palette is { light?: Partial<MotionPalette>; dark?: Partial<MotionPalette> } {
  return !!palette && ("light" in palette || "dark" in palette);
}

export function MotionThemeProvider({ palette, colorScheme, children }: MotionThemeProviderProps) {
  const value = useMemo<MotionThemeValue>(() => {
    if (!palette) return { palettes: moodstone, colorScheme };
    if (isPaletteSet(palette)) {
      return {
        palettes: {
          light: { ...moodstone.light, ...palette.light },
          dark: { ...moodstone.dark, ...palette.dark },
        },
        colorScheme,
      };
    }
    return {
      palettes: {
        light: { ...moodstone.light, ...palette },
        dark: { ...moodstone.dark, ...palette },
      },
      colorScheme,
    };
  }, [palette, colorScheme]);

  return <MotionPaletteContext.Provider value={value}>{children}</MotionPaletteContext.Provider>;
}

export function useMotionPalette(override?: Partial<MotionPalette>): MotionPalette {
  const value = useContext(MotionPaletteContext);
  const systemScheme = useColorScheme();
  const scheme = value?.colorScheme ?? (systemScheme === "dark" ? "dark" : "light");
  const base = (value?.palettes ?? moodstone)[scheme];
  return useMemo(() => (override ? { ...base, ...override } : base), [base, override]);
}
