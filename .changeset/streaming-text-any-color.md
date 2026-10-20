---
"react-native-ai-animations": patch
---

StreamingText fades each arriving chunk with a nested Text `opacity` instead of a color alpha, so named, hsl() and rgba() colors fade too and any source alpha is kept. A `color` in `textStyle` now wins over the palette text color and also colors the default caret. `withAlpha` parses every color React Native accepts and multiplies the source alpha, so the other components handle named and hsl() palette colors as well.
