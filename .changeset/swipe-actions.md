---
"nami-motion": minor
---

Add `SwipeActions` and `SwipeActionsGroup` to `nami-motion/gestures`: rows reveal actions with a rubber-banded swipe, a full swipe runs the primary action, `onThreshold` reports threshold crossings for haptics, and a group keeps one row open at a time. The root entry no longer re-exports the gestures entry, so it stays free of react-native-gesture-handler.
