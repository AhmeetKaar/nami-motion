export type PropRow = string[];

export type ComponentDoc = {
  slug: string;
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
  }
];
