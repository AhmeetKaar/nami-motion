---
"nami-motion": minor
---

MediaGenerating takes a `size` prop (`"1024x1024"`, `"1024x1536"`, `"1536x1024"`) that sets the frame ratio; `aspectRatio` still overrides it, and the frame keeps its ratio when `maxHeight` caps it.
