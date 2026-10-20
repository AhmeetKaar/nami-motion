import { type SharedValue, useFrameCallback, useSharedValue } from "react-native-reanimated";

export function useMotionClock(running: boolean, initial = 0): SharedValue<number> {
  const clock = useSharedValue(initial);
  useFrameCallback((info) => {
    clock.value += info.timeSincePreviousFrame ?? 0;
  }, running);
  return clock;
}
