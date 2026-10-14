---
"nami-motion": minor
---

StatusRow animates label changes (the old label drifts up and out, the new one rises in) and shimmers its label by default instead of pulsing the whole row (`effect="pulse"` keeps the old look). New props: `history` shows finished steps with check marks and a connector line, `variant="card"` turns the row into a bordered tool card with a trailing activity indicator, plus `trailing`, `historyIcon`, `colors` and `style`.
