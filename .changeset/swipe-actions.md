---
"nami-motion": minor
---

Add `SwipeActions` and `SwipeActionsGroup` to `nami-motion/gestures`: rows reveal actions with a rubber-banded swipe, a full swipe runs the primary action, `onThreshold` reports threshold crossings for haptics, a group keeps one row open at a time, `configureGesture` composes the row pan with parent gestures such as a full-width drawer, and rows with actions expose them to screen readers. The root entry no longer re-exports the gestures entry, so it stays free of react-native-gesture-handler.
