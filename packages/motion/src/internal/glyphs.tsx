import { View } from "react-native";

export function CrossGlyph({ size, color }: { size: number; color: string }) {
  const bar = { position: "absolute" as const, width: size, height: Math.max(1.5, size * 0.14), borderRadius: size, backgroundColor: color };
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View style={[bar, { transform: [{ rotate: "45deg" }] }]} />
      <View style={[bar, { transform: [{ rotate: "-45deg" }] }]} />
    </View>
  );
}

export function CheckGlyph({ size, color }: { size: number; color: string }) {
  const stroke = Math.max(1.5, size * 0.14);
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: size * 0.36,
          height: size * 0.7,
          marginTop: -size * 0.12,
          borderRightWidth: stroke,
          borderBottomWidth: stroke,
          borderColor: color,
          transform: [{ rotate: "45deg" }],
        }}
      />
    </View>
  );
}
