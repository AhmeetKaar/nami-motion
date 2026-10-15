import { Canvas, Path, Skia, useClock } from "@shopify/react-native-skia";
import { useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import {
  type SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

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
  variant?: "wave" | "bars";
  height?: number;
  barWidth?: number;
  barGap?: number;
  barInterval?: number;
};

type WaveLayerPathProps = {
  layer: WaveLayer;
  width: number;
  height: number;
  level: SharedValue<number>;
  clock: SharedValue<number>;
  color: string;
};

function WaveLayerPath({
  layer,
  width,
  height,
  level,
  clock,
  color,
}: WaveLayerPathProps) {
  const path = useDerivedValue(() => {
    const middle = height / 2;
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

function VoiceBars({
  level,
  clock,
  width,
  height,
  color,
  barWidth,
  barGap,
  barInterval,
}: {
  level: SharedValue<number>;
  clock: SharedValue<number>;
  width: number;
  height: number;
  color: string;
  barWidth: number;
  barGap: number;
  barInterval: number;
}) {
  const count = Math.max(1, Math.floor((width + barGap) / (barWidth + barGap)));
  const history = useSharedValue<number[]>([]);

  useAnimatedReaction(
    () => Math.floor(clock.value / barInterval),
    (tick, previous) => {
      if (tick === previous) return;
      const next = history.value.slice(-(count - 1));
      next.push(level.value);
      history.value = next;
    },
  );

  const path = useDerivedValue(() => {
    const next = Skia.Path.Make();
    const values = history.value;
    const middle = height / 2;
    for (let i = 0; i < count; i += 1) {
      const value = values[values.length - count + i] ?? 0;
      const barHeight = Math.max(barWidth, value * (height - 2));
      const x = i * (barWidth + barGap);
      next.addRRect(
        Skia.RRectXY(Skia.XYWHRect(x, middle - barHeight / 2, barWidth, barHeight), barWidth / 2, barWidth / 2),
      );
    }
    return next;
  });

  return <Path path={path} color={color} />;
}

export function VoiceWave({
  level,
  colors,
  variant = "wave",
  height = WAVE_HEIGHT,
  barWidth = 3,
  barGap = 2,
  barInterval = 70,
}: VoiceWaveProps) {
  const [width, setWidth] = useState(0);
  const clock = useClock();

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={{ flex: 1, height }} onLayout={handleLayout}>
      {width > 0 && (
        <Canvas style={{ width, height }}>
          {variant === "bars" ? (
            <VoiceBars
              level={level}
              clock={clock}
              width={width}
              height={height}
              color={colors[2]}
              barWidth={barWidth}
              barGap={barGap}
              barInterval={barInterval}
            />
          ) : (
            LAYERS.map((layer, index) => (
              <WaveLayerPath
                key={index}
                layer={layer}
                width={width}
                height={height}
                level={level}
                clock={clock}
                color={colors[index]}
              />
            ))
          )}
        </Canvas>
      )}
    </View>
  );
}
