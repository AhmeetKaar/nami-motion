---
"nami-motion": minor
---

ThinkingBlock can expand in place: `expandable` makes the header toggle a body with a left rail and the full reasoning (paragraphs fade in as they stream), with a rotating chevron when no `trailingIcon` is given. Control it with `expanded` / `defaultExpanded` / `onExpandedChange`, or replace the body with `renderBody`. `colors` is now optional and falls back to the palette; `onPress` keeps working for apps that open their own sheet.
