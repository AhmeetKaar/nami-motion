export type PropRow = string[];

export type ComponentDoc = {
  slug: string;
  media?: string;
  name: string;
  summary: string;
  category: "text" | "feedback" | "chat" | "gestures";
  entry: string;
  requires: string[];
  install: string;
  usage: string;
  notes: string;
  props: PropRow[];
  subProps: { title: string; rows: PropRow[] } | null;
  prompt: string;
};

export const components: ComponentDoc[] = [
  {
    "slug": "shimmer-text",
    "name": "Shimmer Text",
    "summary": "A light band sweeping across text while a response is being generated.",
    "category": "text",
    "entry": "nami-motion/text",
    "requires": [
      "reanimated"
    ],
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets",
    "usage": "import { ShimmerText } from 'nami-motion/text';\n\n<ShimmerText text=\"Thinking\" activeColor=\"#FFFFFF\" mutedColor=\"#6B6B6B\" />",
    "notes": "",
    "props": [
      [
        "text",
        "`string`",
        "\u2014",
        "Text to render"
      ],
      [
        "activeColor",
        "`string`",
        "\u2014",
        "Color of the moving highlight"
      ],
      [
        "mutedColor",
        "`string`",
        "\u2014",
        "Base text color"
      ],
      [
        "textStyle",
        "`StyleProp<TextStyle>`",
        "{ fontSize: 14, fontWeight: \"500\", lineHeight: 20 }",
        "Typography"
      ],
      [
        "duration",
        "`number`",
        "1400",
        "Sweep duration in ms"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Shimmer Text animation from the nami-motion package to my Expo / React Native app.\n\nWhat it is: A light band sweeping across text while a response is being generated.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets\n2. Import it from \"nami-motion/text\" (not from the package root unless it is exported there).\n3. Use it like this, adapting names to my code:\n\nimport { ShimmerText } from 'nami-motion/text';\n\n<ShimmerText text=\"Thinking\" activeColor=\"#FFFFFF\" mutedColor=\"#6B6B6B\" />\n\n4. Pass every color, label, icon and font from my existing theme and i18n setup as props; the component has no theme of its own.\n5. Keep reduced motion working: the component already falls back to a static state when the OS setting is on, so do not add extra animation around it.\n"
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
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets",
    "usage": "import { Skeleton } from 'nami-motion/feedback';\n\n<Skeleton color=\"#2A2A2A\" width=\"60%\" height={14} />",
    "notes": "",
    "props": [
      [
        "color",
        "`string`",
        "\u2014",
        "Surface color"
      ],
      [
        "width",
        "`DimensionValue`",
        "\"100%\"",
        "Width"
      ],
      [
        "height",
        "`number`",
        "12",
        "Height"
      ],
      [
        "borderRadius",
        "`number`",
        "6",
        "Corner radius"
      ],
      [
        "duration",
        "`number`",
        "1000",
        "Pulse duration in ms"
      ],
      [
        "style",
        "`StyleProp<ViewStyle>`",
        "\u2014",
        "Extra style"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Skeleton animation from the nami-motion package to my Expo / React Native app.\n\nWhat it is: Pulsing placeholder bar for content that is still loading.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets\n2. Import it from \"nami-motion/feedback\" (not from the package root unless it is exported there).\n3. Use it like this, adapting names to my code:\n\nimport { Skeleton } from 'nami-motion/feedback';\n\n<Skeleton color=\"#2A2A2A\" width=\"60%\" height={14} />\n\n4. Pass every color, label, icon and font from my existing theme and i18n setup as props; the component has no theme of its own.\n5. Keep reduced motion working: the component already falls back to a static state when the OS setting is on, so do not add extra animation around it.\n"
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
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets expo-linear-gradient",
    "usage": "import { ShimmerBand } from 'nami-motion/gradient';\n\n<ShimmerBand backgroundColor=\"#1C1C1C\" highlightColor=\"#FFFFFF\" style={{ height: 240, borderRadius: 20 }} />",
    "notes": "",
    "props": [
      [
        "backgroundColor",
        "`string`",
        "\u2014",
        "Surface color"
      ],
      [
        "highlightColor",
        "`string`",
        "\u2014",
        "Band color"
      ],
      [
        "highlightOpacity",
        "`number`",
        "0.1",
        "Band opacity"
      ],
      [
        "bandRatio",
        "`number`",
        "0.6",
        "Band width relative to the surface"
      ],
      [
        "duration",
        "`number`",
        "1400",
        "Sweep duration in ms"
      ],
      [
        "style",
        "`StyleProp<ViewStyle>`",
        "\u2014",
        "Surface style"
      ],
      [
        "children",
        "`ReactNode`",
        "\u2014",
        "Content rendered above the band"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Shimmer Band animation from the nami-motion package to my Expo / React Native app.\n\nWhat it is: Gradient band sweeping over a surface, for image and card placeholders.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets expo-linear-gradient\n2. Import it from \"nami-motion/gradient\" (not from the package root unless it is exported there).\n3. Use it like this, adapting names to my code:\n\nimport { ShimmerBand } from 'nami-motion/gradient';\n\n<ShimmerBand backgroundColor=\"#1C1C1C\" highlightColor=\"#FFFFFF\" style={{ height: 240, borderRadius: 20 }} />\n\n4. Pass every color, label, icon and font from my existing theme and i18n setup as props; the component has no theme of its own.\n5. Keep reduced motion working: the component already falls back to a static state when the OS setting is on, so do not add extra animation around it.\n"
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
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets",
    "usage": "import { StatusRow } from 'nami-motion/chat';\n\n<StatusRow label=\"Searching the web\" color=\"#A1A1A1\" icon={<Logo />} />",
    "notes": "",
    "props": [
      [
        "label",
        "`string`",
        "\u2014",
        "Status text"
      ],
      [
        "color",
        "`string`",
        "\u2014",
        "Label color"
      ],
      [
        "icon",
        "`ReactNode`",
        "\u2014",
        "Leading logo or icon"
      ],
      [
        "iconSize",
        "`number`",
        "16",
        "Icon box size"
      ],
      [
        "labelStyle",
        "`StyleProp<TextStyle>`",
        "{ fontSize: 16, lineHeight: 24 }",
        "Typography"
      ],
      [
        "duration",
        "`number`",
        "700",
        "Pulse duration in ms"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Status Row animation from the nami-motion package to my Expo / React Native app.\n\nWhat it is: Pulsing loading state with your logo and a status label.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets\n2. Import it from \"nami-motion/chat\" (not from the package root unless it is exported there).\n3. Use it like this, adapting names to my code:\n\nimport { StatusRow } from 'nami-motion/chat';\n\n<StatusRow label=\"Searching the web\" color=\"#A1A1A1\" icon={<Logo />} />\n\n4. Pass every color, label, icon and font from my existing theme and i18n setup as props; the component has no theme of its own.\n5. Keep reduced motion working: the component already falls back to a static state when the OS setting is on, so do not add extra animation around it.\n"
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
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets",
    "usage": "import { ThinkingBlock } from 'nami-motion/chat';\n\n<ThinkingBlock\n  reasoning={reasoning}\n  isStreaming={streaming}\n  thinkingLabel=\"Thinking\"\n  formatDoneLabel={(s) => (s ? `Thought for ${s}s` : \"Thought\")}\n  colors={{ text: \"#FFF\", textSecondary: \"#A1A1A1\", textTertiary: \"#6B6B6B\", pressed: \"#222\" }}\n  onPress={openReasoning}\n/>",
    "notes": "",
    "props": [
      [
        "reasoning",
        "`string`",
        "\u2014",
        "Reasoning text so far"
      ],
      [
        "isStreaming",
        "`boolean`",
        "\u2014",
        "Shimmers while true"
      ],
      [
        "thinkingLabel",
        "`string`",
        "\u2014",
        "Label while streaming"
      ],
      [
        "formatDoneLabel",
        "`(seconds: number | null) => string`",
        "\u2014",
        "Label once finished"
      ],
      [
        "colors",
        "`ThinkingBlockColors`",
        "\u2014",
        "text, textSecondary, textTertiary, pressed"
      ],
      [
        "textStyle",
        "`StyleProp<TextStyle>`",
        "{ fontSize: 14, fontWeight: \"500\", lineHeight: 20 }",
        "Typography"
      ],
      [
        "renderIcon",
        "`(active: boolean) => ReactNode`",
        "\u2014",
        "Leading icon"
      ],
      [
        "trailingIcon",
        "`ReactNode`",
        "\u2014",
        "Trailing chevron"
      ],
      [
        "onPress",
        "`() => void`",
        "\u2014",
        "Open the full trace"
      ],
      [
        "onPressIn",
        "`(event) => void`",
        "\u2014",
        "Haptics hook"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Thinking Block animation from the nami-motion package to my Expo / React Native app.\n\nWhat it is: Reasoning trace that shimmers while streaming and settles into an elapsed-time summary.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets\n2. Import it from \"nami-motion/chat\" (not from the package root unless it is exported there).\n3. Use it like this, adapting names to my code:\n\nimport { ThinkingBlock } from 'nami-motion/chat';\n\n<ThinkingBlock\n  reasoning={reasoning}\n  isStreaming={streaming}\n  thinkingLabel=\"Thinking\"\n  formatDoneLabel={(s) => (s ? `Thought for ${s}s` : \"Thought\")}\n  colors={{ text: \"#FFF\", textSecondary: \"#A1A1A1\", textTertiary: \"#6B6B6B\", pressed: \"#222\" }}\n  onPress={openReasoning}\n/>\n\n4. Pass every color, label, icon and font from my existing theme and i18n setup as props; the component has no theme of its own.\n5. Keep reduced motion working: the component already falls back to a static state when the OS setting is on, so do not add extra animation around it.\n"
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
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets @shopify/react-native-skia",
    "usage": "import { VoiceWave } from 'nami-motion/skia';\n\nconst level = useSharedValue(0);\n\n<VoiceWave level={level} colors={[\"#7C5CFF\", \"#4CC9F0\", \"#F72585\"]} />",
    "notes": "",
    "props": [
      [
        "level",
        "`SharedValue<number>`",
        "\u2014",
        "Normalized input level 0-1"
      ],
      [
        "colors",
        "`[string, string, string]`",
        "\u2014",
        "One color per wave layer"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Voice Wave animation from the nami-motion package to my Expo / React Native app.\n\nWhat it is: Three-layer Skia waveform driven by live microphone level.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets @shopify/react-native-skia\n2. Import it from \"nami-motion/skia\" (not from the package root unless it is exported there).\n3. Use it like this, adapting names to my code:\n\nimport { VoiceWave } from 'nami-motion/skia';\n\nconst level = useSharedValue(0);\n\n<VoiceWave level={level} colors={[\"#7C5CFF\", \"#4CC9F0\", \"#F72585\"]} />\n\n4. Pass every color, label, icon and font from my existing theme and i18n setup as props; the component has no theme of its own.\n5. Keep reduced motion working: the component already falls back to a static state when the OS setting is on, so do not add extra animation around it.\n"
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
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets @shopify/react-native-skia",
    "usage": "import { RemainingRing } from 'nami-motion/skia';\n\n<RemainingRing size={28} progress={0.4} trackColor=\"#333\" color=\"#FFF\" />",
    "notes": "",
    "props": [
      [
        "size",
        "`number`",
        "\u2014",
        "Diameter"
      ],
      [
        "progress",
        "`number`",
        "\u2014",
        "0-1"
      ],
      [
        "trackColor",
        "`string`",
        "\u2014",
        "Track color"
      ],
      [
        "color",
        "`string`",
        "\u2014",
        "Progress color"
      ],
      [
        "strokeWidth",
        "`number`",
        "2.5",
        "Stroke width"
      ],
      [
        "duration",
        "`number`",
        "200",
        "Transition in ms"
      ],
      [
        "children",
        "`ReactNode`",
        "\u2014",
        "Centered content"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Remaining Ring animation from the nami-motion package to my Expo / React Native app.\n\nWhat it is: Animated progress ring for quotas, timers and recording limits.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets @shopify/react-native-skia\n2. Import it from \"nami-motion/skia\" (not from the package root unless it is exported there).\n3. Use it like this, adapting names to my code:\n\nimport { RemainingRing } from 'nami-motion/skia';\n\n<RemainingRing size={28} progress={0.4} trackColor=\"#333\" color=\"#FFF\" />\n\n4. Pass every color, label, icon and font from my existing theme and i18n setup as props; the component has no theme of its own.\n5. Keep reduced motion working: the component already falls back to a static state when the OS setting is on, so do not add extra animation around it.\n"
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
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets @shopify/react-native-skia",
    "usage": "import { MatrixOrb } from 'nami-motion/skia';\n\n<MatrixOrb state=\"thinking\" size={120} color=\"#FFFFFF\" />",
    "notes": "",
    "props": [
      [
        "state",
        "`\"idle\"",
        "\"idle\"",
        "\"thinking\"`",
        "\"idle\"",
        "Animation state"
      ],
      [
        "level",
        "`number`",
        "\u2014",
        "Input level while listening"
      ],
      [
        "size",
        "`number`",
        "240",
        "Diameter"
      ],
      [
        "cover",
        "`boolean`",
        "false",
        "Fill the parent instead of size"
      ],
      [
        "color",
        "`string`",
        "\"#FFFFFF\"",
        "Dot color"
      ],
      [
        "dots",
        "`number`",
        "11",
        "Grid density"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Matrix Orb animation from the nami-motion package to my Expo / React Native app.\n\nWhat it is: Dot-matrix shader orb with idle, listening and thinking states.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets @shopify/react-native-skia\n2. Import it from \"nami-motion/skia\" (not from the package root unless it is exported there).\n3. Use it like this, adapting names to my code:\n\nimport { MatrixOrb } from 'nami-motion/skia';\n\n<MatrixOrb state=\"thinking\" size={120} color=\"#FFFFFF\" />\n\n4. Pass every color, label, icon and font from my existing theme and i18n setup as props; the component has no theme of its own.\n5. Keep reduced motion working: the component already falls back to a static state when the OS setting is on, so do not add extra animation around it.\n"
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
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets",
    "usage": "import { DrawerReveal } from 'nami-motion/gestures';\n\nconst progress = useDrawerProgress();\n\n<DrawerReveal progress={progress}>{content}</DrawerReveal>",
    "notes": "",
    "props": [
      [
        "progress",
        "`SharedValue<number>`",
        "\u2014",
        "Drawer open progress 0-1"
      ],
      [
        "offset",
        "`number`",
        "20",
        "Slide distance"
      ],
      [
        "onDetachedChange",
        "`(detached: boolean) => void`",
        "\u2014",
        "Called when the drawer fully opens or closes"
      ],
      [
        "style",
        "`StyleProp<ViewStyle>`",
        "\u2014",
        "Container style"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Drawer Reveal animation from the nami-motion package to my Expo / React Native app.\n\nWhat it is: Fades and slides drawer content in sync with the drawer's open progress.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets\n2. Import it from \"nami-motion/gestures\" (not from the package root unless it is exported there).\n3. Use it like this, adapting names to my code:\n\nimport { DrawerReveal } from 'nami-motion/gestures';\n\nconst progress = useDrawerProgress();\n\n<DrawerReveal progress={progress}>{content}</DrawerReveal>\n\n4. Pass every color, label, icon and font from my existing theme and i18n setup as props; the component has no theme of its own.\n5. Keep reduced motion working: the component already falls back to a static state when the OS setting is on, so do not add extra animation around it.\n"
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
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets react-native-gesture-handler",
    "usage": "import { SwipeActions, SwipeActionsGroup } from 'nami-motion/gestures';\nimport * as Haptics from 'expo-haptics';\n\n<SwipeActionsGroup>\n  {chats.map((chat) => (\n    <SwipeActions\n      key={chat.id}\n      leftActions={[\n        { key: 'pin', accessibilityLabel: 'Pin', backgroundColor: '#FF9F0A', onPress: () => pin(chat.id), children: <PinIcon /> },\n      ]}\n      rightActions={[\n        { key: 'delete', accessibilityLabel: 'Delete', backgroundColor: '#FF3B30', onPress: () => remove(chat.id), children: <TrashIcon /> },\n        { key: 'archive', accessibilityLabel: 'Archive', backgroundColor: '#8E8E93', onPress: () => archive(chat.id), children: <ArchiveIcon /> },\n      ]}\n      onThreshold={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}\n      contentStyle={{ backgroundColor: colors.surface }}\n    >\n      <ChatRow chat={chat} />\n    </SwipeActions>\n  ))}\n</SwipeActionsGroup>",
    "notes": "Your app root must be wrapped in `GestureHandlerRootView`.\n\nThe first action of each side is the primary one: it sits at the outer edge and, when `fullSwipe` is on, expands to fill the row once the swipe passes `fullSwipeThreshold`. Releasing past the threshold runs it. Swiping beyond the open width without a full swipe rubber-bands.\n\nRows inside a `SwipeActionsGroup` keep only one row open at a time. Tapping an open row closes it. Every action is also exposed as an accessibility action, so screen reader users get the same options without swiping. With reduce motion on, rows snap open and closed without springs.\n\nGive the content a background color with `contentStyle`, otherwise the actions show through it.\n\nInside a navigator that also listens to horizontal swipes, such as a drawer opened from anywhere on the screen, block it from the rows with configureGesture. Callbacks you add there must be worklets. Rows with actions are a single accessibility element, so screen reader users reach the actions through the actions rotor.",
    "props": [
      [
        "leftActions",
        "`SwipeAction[]`",
        "[]",
        "Actions revealed by swiping right; the first one is primary"
      ],
      [
        "rightActions",
        "`SwipeAction[]`",
        "[]",
        "Actions revealed by swiping left; the first one is primary"
      ],
      [
        "actionWidth",
        "`number`",
        "80",
        "Width of each action when the row rests open"
      ],
      [
        "fullSwipe",
        "`boolean`",
        "true",
        "Allow a full swipe to run the primary action"
      ],
      [
        "fullSwipeThreshold",
        "`number`",
        "0.6",
        "Fraction of the row width a full swipe must pass"
      ],
      [
        "closeOnActionPress",
        "`boolean`",
        "true",
        "Close the row after an action is tapped"
      ],
      [
        "onThreshold",
        "`(side, crossed) => void`",
        "\u2014",
        "Called when a swipe crosses the full-swipe threshold in either direction; use it for haptics"
      ],
      [
        "onOpenChange",
        "`(side | null) => void`",
        "\u2014",
        "Called when the row settles open on a side or closes"
      ],
      [
        "configureGesture",
        "`(gesture: PanGesture) => PanGesture`",
        "\u2014",
        "Compose the row pan with parent gestures, e.g. `gesture.blocksExternalGesture(drawerGestureRef)` when a drawer listens to full-width swipes"
      ],
      [
        "style",
        "`StyleProp<ViewStyle>`",
        "\u2014",
        "Row container style"
      ],
      [
        "contentStyle",
        "`StyleProp<ViewStyle>`",
        "\u2014",
        "Style of the sliding content"
      ],
      [
        "ref",
        "`Ref<SwipeActionsHandle>`",
        "\u2014",
        "Exposes `open(side)` and `close()`"
      ]
    ],
    "subProps": {
      "title": "SwipeAction",
      "rows": [
        [
          "key",
          "`string`",
          "Unique key, also the accessibility action name"
        ],
        [
          "accessibilityLabel",
          "`string`",
          "Label for the button and the accessibility action"
        ],
        [
          "backgroundColor",
          "`string`",
          "Action background"
        ],
        [
          "onPress",
          "`() => void`",
          "Runs on tap, full swipe or accessibility action"
        ],
        [
          "children",
          "`ReactNode`",
          "Icon or label rendered in the action"
        ]
      ]
    },
    "prompt": "Add the Swipe Actions animation from the nami-motion package to my Expo / React Native app.\n\nWhat it is: List rows that reveal actions with a rubber-banded swipe.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets react-native-gesture-handler\n2. Import it from \"nami-motion/gestures\" (not from the package root unless it is exported there).\n3. Use it like this, adapting names to my code:\n\nimport { SwipeActions, SwipeActionsGroup } from 'nami-motion/gestures';\nimport * as Haptics from 'expo-haptics';\n\n<SwipeActionsGroup>\n  {chats.map((chat) => (\n    <SwipeActions\n      key={chat.id}\n      leftActions={[\n        { key: 'pin', accessibilityLabel: 'Pin', backgroundColor: '#FF9F0A', onPress: () => pin(chat.id), children: <PinIcon /> },\n      ]}\n      rightActions={[\n        { key: 'delete', accessibilityLabel: 'Delete', backgroundColor: '#FF3B30', onPress: () => remove(chat.id), children: <TrashIcon /> },\n        { key: 'archive', accessibilityLabel: 'Archive', backgroundColor: '#8E8E93', onPress: () => archive(chat.id), children: <ArchiveIcon /> },\n      ]}\n      onThreshold={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}\n      contentStyle={{ backgroundColor: colors.surface }}\n    >\n      <ChatRow chat={chat} />\n    </SwipeActions>\n  ))}\n</SwipeActionsGroup>\n\n4. Pass every color, label, icon and font from my existing theme and i18n setup as props; the component has no theme of its own.\n5. Keep reduced motion working: the component already falls back to a static state when the OS setting is on, so do not add extra animation around it.\n\nNotes:\nYour app root must be wrapped in `GestureHandlerRootView`.\n\nThe first action of each side is the primary one: it sits at the outer edge and, when `fullSwipe` is on, expands to fill the row once the swipe passes `fullSwipeThreshold`. Releasing past the threshold runs it. Swiping beyond the open width without a full swipe rubber-bands.\n\nRows inside a `SwipeActionsGroup` keep only one row open at a time. Tapping an open row closes it. Every action is also exposed as an accessibility action, so screen reader users get the same options without swiping. With reduce motion on, rows snap open and closed without springs.\n\nGive the content a background color with `contentStyle`, otherwise the actions show through it.\nInside a navigator that also listens to horizontal swipes, such as a drawer opened from anywhere on the screen, block it from the rows with configureGesture. Callbacks you add there must be worklets. Rows with actions are a single accessibility element, so screen reader users reach the actions through the actions rotor.\n"
  },
  {
    "slug": "source-chips",
    "media": "status-row",
    "name": "Source Chips",
    "summary": "Source pills that stagger in while the assistant reads, with swappable icons.",
    "category": "chat",
    "entry": "nami-motion/chat",
    "requires": [
      "reanimated"
    ],
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets",
    "usage": "import { SourceChips } from 'nami-motion/chat';\nimport { Image } from 'expo-image';\n\n<SourceChips\n  sources={citations.map((c) => ({ key: c.url, label: domain(c.url) }))}\n  renderIcon={(source) => <Image source={{ uri: favicon(source.key) }} style={{ width: 16, height: 16, borderRadius: 8 }} />}\n/>",
    "notes": "Icons are optional. Each source can carry its own `icon`, `renderIcon` builds one from the source, and without either a letter avatar is drawn. Set `showIcons={false}` for text-only pills.\n\nPair it with StatusRow while the assistant searches; set `stagger={0}` when the list is already complete.",
    "props": [
      [
        "sources",
        "`SourceChipItem[]`",
        "—",
        "{ key, label, icon? } for each source"
      ],
      [
        "renderIcon",
        "`(source) => ReactNode`",
        "letter avatar",
        "Builds an icon when a source has none"
      ],
      [
        "showIcons",
        "`boolean`",
        "`true`",
        "Hide icons entirely"
      ],
      [
        "stagger",
        "`number`",
        "`220`",
        "Delay between chips in ms"
      ],
      [
        "colors",
        "`Partial<MotionPalette>`",
        "theme",
        "Per-component palette override"
      ],
      [
        "style",
        "`StyleProp<ViewStyle>`",
        "—",
        "Container style"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Source Chips component from the nami-motion package to my Expo / React Native app.\n\nWhat it is: Source pills that stagger in while the assistant reads, with swappable icons.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets\n2. Import it from \"nami-motion/chat\".\n3. Use it like this, adapting names to my code:\n\nimport { SourceChips } from 'nami-motion/chat';\nimport { Image } from 'expo-image';\n\n<SourceChips\n  sources={citations.map((c) => ({ key: c.url, label: domain(c.url) }))}\n  renderIcon={(source) => <Image source={{ uri: favicon(source.key) }} style={{ width: 16, height: 16, borderRadius: 8 }} />}\n/>\n\n4. Colors default to the Moodstone palette and follow the system color scheme. Map my theme once with MotionThemeProvider (or pass a `colors` override per component) instead of hardcoding hex values; pass icons from my icon set.\n5. Keep reduced motion working: entry animations are skipped when the OS setting is on, so do not add extra animation around it.\n\nNotes:\nIcons are optional. Each source can carry its own `icon`, `renderIcon` builds one from the source, and without either a letter avatar is drawn. Set `showIcons={false}` for text-only pills.\n\nPair it with StatusRow while the assistant searches; set `stagger={0}` when the list is already complete.\n"
  },
  {
    "slug": "source-badge",
    "media": "shimmer-text",
    "name": "Source Badge",
    "summary": "An inline citation pill that sits on the text baseline inside a streaming answer.",
    "category": "chat",
    "entry": "nami-motion/chat",
    "requires": [
      "reanimated"
    ],
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets",
    "usage": "import { SourceBadge } from 'nami-motion/chat';\n\n<Text>\n  Small models match larger ones on reasoning.{' '}\n  <SourceBadge label=\"arxiv.org\" onPress={() => openSource(url)} />\n</Text>",
    "notes": "Render it inside a Text as an inline view. `baselineOffset` nudges it down to sit on the line; raise it for larger body text.",
    "props": [
      [
        "label",
        "`string`",
        "—",
        "Domain or short source name"
      ],
      [
        "icon",
        "`ReactNode`",
        "—",
        "Optional favicon"
      ],
      [
        "onPress",
        "`() => void`",
        "—",
        "Makes the badge a link"
      ],
      [
        "baselineOffset",
        "`number`",
        "`3`",
        "Vertical nudge inside text"
      ],
      [
        "colors",
        "`Partial<MotionPalette>`",
        "theme",
        "Per-component palette override"
      ],
      [
        "style",
        "`StyleProp<ViewStyle>`",
        "—",
        "Container style"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Source Badge component from the nami-motion package to my Expo / React Native app.\n\nWhat it is: An inline citation pill that sits on the text baseline inside a streaming answer.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets\n2. Import it from \"nami-motion/chat\".\n3. Use it like this, adapting names to my code:\n\nimport { SourceBadge } from 'nami-motion/chat';\n\n<Text>\n  Small models match larger ones on reasoning.{' '}\n  <SourceBadge label=\"arxiv.org\" onPress={() => openSource(url)} />\n</Text>\n\n4. Colors default to the Moodstone palette and follow the system color scheme. Map my theme once with MotionThemeProvider (or pass a `colors` override per component) instead of hardcoding hex values; pass icons from my icon set.\n5. Keep reduced motion working: entry animations are skipped when the OS setting is on, so do not add extra animation around it.\n\nNotes:\nRender it inside a Text as an inline view. `baselineOffset` nudges it down to sit on the line; raise it for larger body text.\n"
  },
  {
    "slug": "message-actions",
    "media": "shimmer-text",
    "name": "Message Actions",
    "summary": "Copy, rate, retry and speak buttons that fade in once an answer completes.",
    "category": "chat",
    "entry": "nami-motion/chat",
    "requires": [
      "reanimated"
    ],
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets",
    "usage": "import { MessageActions } from 'nami-motion/chat';\n\n<MessageActions\n  actions={[\n    { key: 'copy', accessibilityLabel: 'Copy', icon: <CopyIcon />, onPress: copy },\n    { key: 'retry', accessibilityLabel: 'Regenerate', icon: <RetryIcon />, onPress: retry },\n  ]}\n/>",
    "notes": "Icons are yours; swap one for a spinner or a check mark to show progress. Buttons stagger in with `stagger` ms between them after `delay`.",
    "props": [
      [
        "actions",
        "`MessageAction[]`",
        "—",
        "{ key, icon, accessibilityLabel, onPress?, disabled? }"
      ],
      [
        "delay",
        "`number`",
        "`0`",
        "Delay before the first button"
      ],
      [
        "stagger",
        "`number`",
        "`50`",
        "Delay between buttons"
      ],
      [
        "hitSize",
        "`number`",
        "`32`",
        "Touch target size"
      ],
      [
        "colors",
        "`Partial<MotionPalette>`",
        "theme",
        "Per-component palette override"
      ],
      [
        "style",
        "`StyleProp<ViewStyle>`",
        "—",
        "Container style"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Message Actions component from the nami-motion package to my Expo / React Native app.\n\nWhat it is: Copy, rate, retry and speak buttons that fade in once an answer completes.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets\n2. Import it from \"nami-motion/chat\".\n3. Use it like this, adapting names to my code:\n\nimport { MessageActions } from 'nami-motion/chat';\n\n<MessageActions\n  actions={[\n    { key: 'copy', accessibilityLabel: 'Copy', icon: <CopyIcon />, onPress: copy },\n    { key: 'retry', accessibilityLabel: 'Regenerate', icon: <RetryIcon />, onPress: retry },\n  ]}\n/>\n\n4. Colors default to the Moodstone palette and follow the system color scheme. Map my theme once with MotionThemeProvider (or pass a `colors` override per component) instead of hardcoding hex values; pass icons from my icon set.\n5. Keep reduced motion working: entry animations are skipped when the OS setting is on, so do not add extra animation around it.\n\nNotes:\nIcons are yours; swap one for a spinner or a check mark to show progress. Buttons stagger in with `stagger` ms between them after `delay`.\n"
  },
  {
    "slug": "follow-up-chips",
    "media": "shimmer-text",
    "name": "Follow-up Chips",
    "summary": "Suggested next questions that rise in one by one under an answer.",
    "category": "chat",
    "entry": "nami-motion/chat",
    "requires": [
      "reanimated"
    ],
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets",
    "usage": "import { FollowUpChips } from 'nami-motion/chat';\n\n<FollowUpChips\n  delay={350}\n  items={suggestions.map((label) => ({ key: label, label }))}\n  onPress={(item) => send(item.label)}\n/>",
    "notes": "Chips wrap onto new lines. Start them after the action row with `delay`.",
    "props": [
      [
        "items",
        "`FollowUpItem[]`",
        "—",
        "{ key, label, icon? }"
      ],
      [
        "onPress",
        "`(item) => void`",
        "—",
        "Called with the tapped chip"
      ],
      [
        "delay",
        "`number`",
        "`0`",
        "Delay before the first chip"
      ],
      [
        "stagger",
        "`number`",
        "`120`",
        "Delay between chips"
      ],
      [
        "colors",
        "`Partial<MotionPalette>`",
        "theme",
        "Per-component palette override"
      ],
      [
        "style",
        "`StyleProp<ViewStyle>`",
        "—",
        "Container style"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Follow-up Chips component from the nami-motion package to my Expo / React Native app.\n\nWhat it is: Suggested next questions that rise in one by one under an answer.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets\n2. Import it from \"nami-motion/chat\".\n3. Use it like this, adapting names to my code:\n\nimport { FollowUpChips } from 'nami-motion/chat';\n\n<FollowUpChips\n  delay={350}\n  items={suggestions.map((label) => ({ key: label, label }))}\n  onPress={(item) => send(item.label)}\n/>\n\n4. Colors default to the Moodstone palette and follow the system color scheme. Map my theme once with MotionThemeProvider (or pass a `colors` override per component) instead of hardcoding hex values; pass icons from my icon set.\n5. Keep reduced motion working: entry animations are skipped when the OS setting is on, so do not add extra animation around it.\n\nNotes:\nChips wrap onto new lines. Start them after the action row with `delay`.\n"
  },
  {
    "slug": "thinking-trace",
    "media": "thinking-block",
    "name": "Thinking Trace",
    "summary": "A tabbed trace (steps, reasoning, search, code) that opens under a thinking block.",
    "category": "chat",
    "entry": "nami-motion/chat",
    "requires": [
      "reanimated"
    ],
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets",
    "usage": "import { ThinkingTrace, TraceSteps } from 'nami-motion/chat';\n\n<ThinkingTrace\n  contentHeight={120}\n  tabs={[\n    { key: 'steps', label: 'Steps', content: <TraceSteps steps={steps} /> },\n    { key: 'reasoning', label: 'Reasoning', content: <Text>{reasoning}</Text> },\n  ]}\n/>",
    "notes": "Tabs are data: show only the ones you have. It is uncontrolled by default; pass `selectedKey` and `onSelect` to drive it. TraceSteps draws a connected timeline with done, active and pending dots or your own icons.",
    "props": [
      [
        "tabs",
        "`ThinkingTraceTab[]`",
        "—",
        "{ key, label, content }"
      ],
      [
        "selectedKey",
        "`string`",
        "—",
        "Controlled tab"
      ],
      [
        "defaultKey",
        "`string`",
        "first tab",
        "Initial tab when uncontrolled"
      ],
      [
        "onSelect",
        "`(key) => void`",
        "—",
        "Tab change callback"
      ],
      [
        "contentHeight",
        "`number`",
        "auto",
        "Fixed panel height"
      ],
      [
        "colors",
        "`Partial<MotionPalette>`",
        "theme",
        "Per-component palette override"
      ],
      [
        "style",
        "`StyleProp<ViewStyle>`",
        "—",
        "Container style"
      ]
    ],
    "subProps": {
      "title": "TraceSteps",
      "rows": [
        [
          "steps",
          "`TraceStep[]`",
          "{ key, label, detail?, status?: 'done' | 'active' | 'pending', icon? }"
        ],
        [
          "colors",
          "`Partial<MotionPalette>`",
          "Palette override"
        ]
      ]
    },
    "prompt": "Add the Thinking Trace component from the nami-motion package to my Expo / React Native app.\n\nWhat it is: A tabbed trace (steps, reasoning, search, code) that opens under a thinking block.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets\n2. Import it from \"nami-motion/chat\".\n3. Use it like this, adapting names to my code:\n\nimport { ThinkingTrace, TraceSteps } from 'nami-motion/chat';\n\n<ThinkingTrace\n  contentHeight={120}\n  tabs={[\n    { key: 'steps', label: 'Steps', content: <TraceSteps steps={steps} /> },\n    { key: 'reasoning', label: 'Reasoning', content: <Text>{reasoning}</Text> },\n  ]}\n/>\n\n4. Colors default to the Moodstone palette and follow the system color scheme. Map my theme once with MotionThemeProvider (or pass a `colors` override per component) instead of hardcoding hex values; pass icons from my icon set.\n5. Keep reduced motion working: entry animations are skipped when the OS setting is on, so do not add extra animation around it.\n\nNotes:\nTabs are data: show only the ones you have. It is uncontrolled by default; pass `selectedKey` and `onSelect` to drive it. TraceSteps draws a connected timeline with done, active and pending dots or your own icons.\n"
  },
  {
    "slug": "generating-image",
    "media": "shimmer-band",
    "name": "Generating Image",
    "summary": "A shimmering title and placeholder that resolve into the generated image.",
    "category": "feedback",
    "entry": "nami-motion/gradient",
    "requires": [
      "reanimated",
      "expo-linear-gradient"
    ],
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets expo-linear-gradient",
    "usage": "import { GeneratingImage } from 'nami-motion/gradient';\nimport { Image } from 'expo-image';\n\n<GeneratingImage generating={!url} label=\"Creating image\" doneLabel=\"Image created\" width={240} height={240}>\n  <Image source={{ uri: url }} style={{ flex: 1 }} />\n</GeneratingImage>",
    "notes": "Title and band share the same tempo (`duration`). Put an elapsed timer next to the title with `labelAccessory`.",
    "props": [
      [
        "generating",
        "`boolean`",
        "—",
        "Shimmer while true, children when false"
      ],
      [
        "label",
        "`string`",
        "—",
        "Title while generating"
      ],
      [
        "doneLabel",
        "`string`",
        "—",
        "Title after completion"
      ],
      [
        "width / height",
        "`DimensionValue`",
        "`220`",
        "Placeholder size"
      ],
      [
        "aspectRatio / maxHeight",
        "`number`",
        "—",
        "Size from width, capped in height"
      ],
      [
        "placeholderIcon",
        "`ReactNode`",
        "—",
        "Centered in the band"
      ],
      [
        "labelAccessory",
        "`ReactNode`",
        "—",
        "Next to the title, e.g. elapsed time"
      ],
      [
        "duration",
        "`number`",
        "`1400`",
        "Sweep duration in ms"
      ],
      [
        "colors",
        "`Partial<MotionPalette>`",
        "theme",
        "Per-component palette override"
      ],
      [
        "style",
        "`StyleProp<ViewStyle>`",
        "—",
        "Container style"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Generating Image component from the nami-motion package to my Expo / React Native app.\n\nWhat it is: A shimmering title and placeholder that resolve into the generated image.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets expo-linear-gradient\n2. Import it from \"nami-motion/gradient\".\n3. Use it like this, adapting names to my code:\n\nimport { GeneratingImage } from 'nami-motion/gradient';\nimport { Image } from 'expo-image';\n\n<GeneratingImage generating={!url} label=\"Creating image\" doneLabel=\"Image created\" width={240} height={240}>\n  <Image source={{ uri: url }} style={{ flex: 1 }} />\n</GeneratingImage>\n\n4. Colors default to the Moodstone palette and follow the system color scheme. Map my theme once with MotionThemeProvider (or pass a `colors` override per component) instead of hardcoding hex values; pass icons from my icon set.\n5. Keep reduced motion working: entry animations are skipped when the OS setting is on, so do not add extra animation around it.\n\nNotes:\nTitle and band share the same tempo (`duration`). Put an elapsed timer next to the title with `labelAccessory`.\n"
  },
  {
    "slug": "dictation-bar",
    "media": "voice-wave",
    "name": "Dictation Bar",
    "summary": "A recording bar with a live wave, timer, cancel and confirm, plus an optional time-limit ring.",
    "category": "chat",
    "entry": "nami-motion/skia",
    "requires": [
      "reanimated",
      "skia"
    ],
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets @shopify/react-native-skia",
    "usage": "import { DictationBar } from 'nami-motion/skia';\n\n<DictationBar\n  level={level}\n  elapsedSeconds={seconds}\n  limitProgress={seconds / 120}\n  onCancel={cancel}\n  onConfirm={confirm}\n/>",
    "notes": "Feed `level` (0..1) from your recorder metering. `limitProgress` wraps the confirm button in a ring that turns to the danger color past `limitWarningAt`. Use `caption` for states like Transcribing and `disabled` while it runs.",
    "props": [
      [
        "level",
        "`SharedValue<number>`",
        "—",
        "Input level 0..1"
      ],
      [
        "elapsedSeconds",
        "`number`",
        "—",
        "Shown as m:ss"
      ],
      [
        "onCancel / onConfirm",
        "`() => void`",
        "—",
        "Button handlers"
      ],
      [
        "cancelIcon / confirmIcon",
        "`ReactNode`",
        "drawn glyphs",
        "Your icons"
      ],
      [
        "caption",
        "`string`",
        "timer",
        "Replaces the timer"
      ],
      [
        "limitProgress",
        "`number`",
        "—",
        "0..1, shows the limit ring"
      ],
      [
        "limitWarningAt",
        "`number`",
        "`0.85`",
        "Ring turns danger"
      ],
      [
        "disabled",
        "`boolean`",
        "`false`",
        "Dims both buttons"
      ],
      [
        "waveColors",
        "`[string, string, string]`",
        "Moodstone",
        "Wave layer colors"
      ],
      [
        "colors",
        "`Partial<MotionPalette>`",
        "theme",
        "Per-component palette override"
      ],
      [
        "style",
        "`StyleProp<ViewStyle>`",
        "—",
        "Container style"
      ]
    ],
    "subProps": null,
    "prompt": "Add the Dictation Bar component from the nami-motion package to my Expo / React Native app.\n\nWhat it is: A recording bar with a live wave, timer, cancel and confirm, plus an optional time-limit ring.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets @shopify/react-native-skia\n2. Import it from \"nami-motion/skia\".\n3. Use it like this, adapting names to my code:\n\nimport { DictationBar } from 'nami-motion/skia';\n\n<DictationBar\n  level={level}\n  elapsedSeconds={seconds}\n  limitProgress={seconds / 120}\n  onCancel={cancel}\n  onConfirm={confirm}\n/>\n\n4. Colors default to the Moodstone palette and follow the system color scheme. Map my theme once with MotionThemeProvider (or pass a `colors` override per component) instead of hardcoding hex values; pass icons from my icon set.\n5. Keep reduced motion working: entry animations are skipped when the OS setting is on, so do not add extra animation around it.\n\nNotes:\nFeed `level` (0..1) from your recorder metering. `limitProgress` wraps the confirm button in a ring that turns to the danger color past `limitWarningAt`. Use `caption` for states like Transcribing and `disabled` while it runs.\n"
  },
  {
    "slug": "attachments",
    "media": "remaining-ring",
    "name": "Attachments",
    "summary": "Composer attachments that spring in, show upload progress and spring out on removal.",
    "category": "chat",
    "entry": "nami-motion/skia",
    "requires": [
      "reanimated",
      "skia"
    ],
    "install": "npx expo install nami-motion react-native-reanimated react-native-worklets @shopify/react-native-skia",
    "usage": "import { AttachmentTile, AttachmentTray } from 'nami-motion/skia';\nimport { Image } from 'expo-image';\n\n<AttachmentTray\n  items={pending}\n  keyExtractor={(item) => item.id}\n  renderItem={(item) => (\n    <AttachmentTile\n      kind={item.isImage ? 'image' : 'file'}\n      name={item.name}\n      uploading={item.status === 'uploading'}\n      preview={<Image source={{ uri: item.uri }} style={{ flex: 1 }} />}\n      onRemove={() => remove(item.id)}\n    />\n  )}\n/>",
    "notes": "Give `progress` (0..1) for a ring, or just `uploading` for a spinner when you have no byte count. Set `scroll={false}` on the tray when you already wrap it in your own ScrollView.",
    "props": [
      [
        "items",
        "`T[]`",
        "—",
        "Tray items"
      ],
      [
        "keyExtractor",
        "`(item) => string`",
        "—",
        "Stable key for enter and exit"
      ],
      [
        "renderItem",
        "`(item) => ReactNode`",
        "—",
        "Usually an AttachmentTile"
      ],
      [
        "scroll",
        "`boolean`",
        "`true`",
        "Wrap in a horizontal ScrollView"
      ],
      [
        "gap",
        "`number`",
        "`12`",
        "Space between tiles"
      ]
    ],
    "subProps": {
      "title": "AttachmentTile",
      "rows": [
        [
          "kind",
          "`'image' | 'file'`",
          "Square preview or file card"
        ],
        [
          "name",
          "`string`",
          "File name and accessibility label"
        ],
        [
          "progress",
          "`number`",
          "0..1 ring"
        ],
        [
          "uploading",
          "`boolean`",
          "Spinner without progress"
        ],
        [
          "detail",
          "`string`",
          "Second line on file cards"
        ],
        [
          "preview",
          "`ReactNode`",
          "Image content"
        ],
        [
          "fileIcon / fileColor",
          "`ReactNode` / `string`",
          "File badge"
        ],
        [
          "onRemove",
          "`() => void`",
          "Shows the remove button"
        ],
        [
          "size",
          "`number`",
          "Tile size, default 64"
        ]
      ]
    },
    "prompt": "Add the Attachments component from the nami-motion package to my Expo / React Native app.\n\nWhat it is: Composer attachments that spring in, show upload progress and spring out on removal.\n\n1. Install the package and its peers with:\n   npx expo install nami-motion react-native-reanimated react-native-worklets @shopify/react-native-skia\n2. Import it from \"nami-motion/skia\".\n3. Use it like this, adapting names to my code:\n\nimport { AttachmentTile, AttachmentTray } from 'nami-motion/skia';\nimport { Image } from 'expo-image';\n\n<AttachmentTray\n  items={pending}\n  keyExtractor={(item) => item.id}\n  renderItem={(item) => (\n    <AttachmentTile\n      kind={item.isImage ? 'image' : 'file'}\n      name={item.name}\n      uploading={item.status === 'uploading'}\n      preview={<Image source={{ uri: item.uri }} style={{ flex: 1 }} />}\n      onRemove={() => remove(item.id)}\n    />\n  )}\n/>\n\n4. Colors default to the Moodstone palette and follow the system color scheme. Map my theme once with MotionThemeProvider (or pass a `colors` override per component) instead of hardcoding hex values; pass icons from my icon set.\n5. Keep reduced motion working: entry animations are skipped when the OS setting is on, so do not add extra animation around it.\n\nNotes:\nGive `progress` (0..1) for a ring, or just `uploading` for a spinner when you have no byte count. Set `scroll={false}` on the tray when you already wrap it in your own ScrollView.\n"
  }
];
