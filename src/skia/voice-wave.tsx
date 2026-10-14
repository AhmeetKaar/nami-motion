import { Canvas, Path, Skia, useClock } from "@shopify/react-native-skia";
import { useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { type SharedValue, useDerivedValue } from "react-native-reanimated";

const WAVE_HEIGHT = 32;
const SAMPLE_STEP = 2;
const MIN_AMPLITUDE = 1.5;
const EDGE_PADDING = 2;

type WaveLayer = {
  frequency: number;
  speed: number;
  phase: number;
  amplitude: number;
  strokeWidth: number;
  opacity: number;
};

const LAYERS: WaveLayer[] = [
  {
    frequency: 1.1,
    speed: 0.0024,
    phase: 2.6,
    amplitude: 0.55,
    strokeWidth: 1.5,
    opacity: 0.45,
  },
  {
    frequency: 2.3,
    speed: -0.0031,
    phase: 1.4,
    amplitude: 0.75,
    strokeWidth: 1.5,
    opacity: 0.6,
  },
  {
    frequency: 1.6,
    speed: 0.0042,
    phase: 0,
    amplitude: 1,
    strokeWidth: 2,
    opacity: 1,
  },
];

export type VoiceWaveProps = {
  level: SharedValue<number>;
  colors: [string, string, string];
};

type WaveLayerPathProps = {
  layer: WaveLayer;
  width: number;
  level: SharedValue<number>;
  clock: SharedValue<number>;
  color: string;
};

function WaveLayerPath({
  layer,
  width,
  level,
  clock,
  color,
}: WaveLayerPathProps) {
  const path = useDerivedValue(() => {
    const middle = WAVE_HEIGHT / 2;
    const reach = middle - EDGE_PADDING;
    const amplitude =
      (MIN_AMPLITUDE + level.value * (reach - MIN_AMPLITUDE)) * layer.amplitude;
    const offset = clock.value * layer.speed + layer.phase;
    const next = Skia.Path.Make();

    for (let x = 0; x <= width; x += SAMPLE_STEP) {
      const progress = x / width;
      const envelope = Math.sin(Math.PI * progress);
      const y =
        middle +
        amplitude *
          envelope *
          Math.sin(2 * Math.PI * layer.frequency * progress + offset);

      if (x === 0) {
        next.moveTo(x, y);
      } else {
        next.lineTo(x, y);
      }
    }

    return next;
  });

  return (
    <Path
      path={path}
      style="stroke"
      strokeWidth={layer.strokeWidth}
      strokeCap="round"
      strokeJoin="round"
      color={color}
      opacity={layer.opacity}
    />
  );
}

export function VoiceWave({ level, colors }: VoiceWaveProps) {
  const [width, setWidth] = useState(0);
  const clock = useClock();

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={{ flex: 1, height: WAVE_HEIGHT }} onLayout={handleLayout}>
      {width > 0 && (
        <Canvas style={{ width, height: WAVE_HEIGHT }}>
          {LAYERS.map((layer, index) => (
            <WaveLayerPath
              key={index}
              layer={layer}
              width={width}
              level={level}
              clock={clock}
              color={colors[index]}
            />
          ))}
        </Canvas>
      )}
    </View>
  );
}
