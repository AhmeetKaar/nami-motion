export type CatalogEntry = {
  slug: string;
  name: string;
  summary: string;
  category: 'text' | 'feedback' | 'chat' | 'gestures';
  entry: string;
  requires: string[];
  status: 'ready' | 'soon';
};

export const catalog: CatalogEntry[] = [
  {
    "slug": "shimmer-text",
    "name": "Shimmer Text",
    "summary": "A light band sweeping across text while a response is being generated.",
    "category": "text",
    "entry": "nami-motion/text",
    "requires": [
      "reanimated"
    ],
    "status": "ready"
  },
  {
    "slug": "skeleton",
    "name": "Skeleton",
    "summary": "Pulsing placeholder bar for content that is still loading.",
    "category": "feedback",
    "entry": "nami-motion/feedback",
    "requires": [
      "reanimated"
    ],
    "status": "ready"
  },
  {
    "slug": "shimmer-band",
    "name": "Shimmer Band",
    "summary": "Gradient band sweeping over a surface, for image and card placeholders.",
    "category": "feedback",
    "entry": "nami-motion/gradient",
    "requires": [
      "reanimated",
      "expo-linear-gradient"
    ],
    "status": "ready"
  },
  {
    "slug": "status-row",
    "name": "Status Row",
    "summary": "Pulsing loading state with your logo and a status label.",
    "category": "chat",
    "entry": "nami-motion/chat",
    "requires": [
      "reanimated"
    ],
    "status": "ready"
  },
  {
    "slug": "thinking-block",
    "name": "Thinking Block",
    "summary": "Reasoning trace that shimmers while streaming and settles into an elapsed-time summary.",
    "category": "chat",
    "entry": "nami-motion/chat",
    "requires": [
      "reanimated"
    ],
    "status": "ready"
  },
  {
    "slug": "voice-wave",
    "name": "Voice Wave",
    "summary": "Three-layer Skia waveform driven by live microphone level.",
    "category": "chat",
    "entry": "nami-motion/skia",
    "requires": [
      "reanimated",
      "skia"
    ],
    "status": "ready"
  },
  {
    "slug": "remaining-ring",
    "name": "Remaining Ring",
    "summary": "Animated progress ring for quotas, timers and recording limits.",
    "category": "feedback",
    "entry": "nami-motion/skia",
    "requires": [
      "reanimated",
      "skia"
    ],
    "status": "ready"
  },
  {
    "slug": "matrix-orb",
    "name": "Matrix Orb",
    "summary": "Dot-matrix shader orb with idle, listening and thinking states.",
    "category": "feedback",
    "entry": "nami-motion/skia",
    "requires": [
      "reanimated",
      "skia"
    ],
    "status": "ready"
  },
  {
    "slug": "drawer-reveal",
    "name": "Drawer Reveal",
    "summary": "Fades and slides drawer content in sync with the drawer's open progress.",
    "category": "gestures",
    "entry": "nami-motion/gestures",
    "requires": [
      "reanimated"
    ],
    "status": "ready"
  },
  {
    "slug": "swipe-actions",
    "name": "Swipe Actions",
    "summary": "List rows that reveal actions with a rubber-banded swipe.",
    "category": "gestures",
    "entry": "nami-motion/gestures",
    "requires": [
      "reanimated",
      "gesture-handler"
    ],
    "status": "ready"
  },
  {
    "slug": "streaming-markdown",
    "name": "Streaming Markdown",
    "summary": "Markdown that fades in word by word as tokens arrive, without layout jumps.",
    "category": "chat",
    "entry": "nami-motion/chat",
    "requires": [
      "reanimated"
    ],
    "status": "soon"
  }
];
