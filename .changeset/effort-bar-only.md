---
"nami-motion": minor
---

EffortBar is now only the bar, so you can place it anywhere with your own UX around it. The header and description it used to draw are gone, along with the `title`, `icon`, `badge`, `showHeader`, `showNumber`, `formatNumber`, `showDescription`, `labelStyle`, `numberStyle` and `detailStyle` props; render your own title, level label or description next to the bar instead. `accessibilityLabel` names the adjustable control for screen readers (it defaults to "Effort"). Track, segmented and slider keep their level labels, `levelIcon`, `tabLabel`, `fillColors` and `barHeight`, and `size="compact"` is now the small control on its own.
