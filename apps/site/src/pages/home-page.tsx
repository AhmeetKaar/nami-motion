import { IconArrowRight } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { CodeBlock } from "../components/code-block";
import { DemoVideo } from "../components/demo-video";
import { components, type ComponentDoc } from "../data/components";

const INSTALL = "npx expo install nami-motion react-native-reanimated react-native-worklets react-native-gesture-handler";
const OPTIONAL = "npx expo install @shopify/react-native-skia expo-linear-gradient";

const FILTERS: Array<{ id: "all" | ComponentDoc["category"]; label: string }> = [
  { id: "all", label: "all" },
  { id: "chat", label: "chat" },
  { id: "feedback", label: "feedback" },
  { id: "text", label: "text" },
  { id: "gestures", label: "gestures" },
];

function ComponentCard({ doc, index }: { doc: ComponentDoc; index: number }) {
  return (
    <li>
      <Link
        to={`/components/${doc.slug}`}
        className="group block overflow-hidden rounded-md border border-line bg-panel transition-colors hover:border-accent focus-visible:border-accent focus-visible:outline-none"
      >
        <div className="flex h-8.5 items-center justify-between border-b border-line bg-panel-2 px-3 font-mono text-[12px] text-dim">
          <span>
            <span className="text-accent">{String(index + 1).padStart(2, "0")}</span> {doc.slug}.tsx
          </span>
          <span>{doc.entry.replace("nami-motion/", "")}</span>
        </div>
        <div className="aspect-[9/8] overflow-hidden bg-stage">
          <DemoVideo slug={doc.slug} title={doc.name} mode="hover" />
        </div>
        <div className="flex flex-col gap-1 p-4">
          <h3 className="flex items-center justify-between font-semibold">
            {doc.name}
            <IconArrowRight size={16} className="text-dim transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
          </h3>
          <p className="text-[14px] text-dim">{doc.summary}</p>
        </div>
      </Link>
    </li>
  );
}

export function HomePage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const visible = useMemo(
    () => (filter === "all" ? components : components.filter((doc) => doc.category === filter)),
    [filter],
  );

  return (
    <>
      <section className="container-page pt-32 pb-16 md:pt-40">
        <p className="mb-4 font-mono text-[13px] text-dim">
          <span className="text-accent">$</span> npm view nami-motion
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          Motion for React Native chat apps<span className="caret" aria-hidden />
        </h1>
        <p className="mt-6 max-w-2xl text-dim">
          Shimmer text, thinking traces, voice waves, progress rings, swipe actions and more. Every component takes colors,
          labels and icons as props, respects reduced motion, and ships with a recording, the install command and a prompt you
          can hand to your coding agent.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#components" className="btn btn-accent">
            browse components
          </a>
          <a href="#install" className="btn">
            install
          </a>
        </div>
      </section>

      <section id="components" className="container-page scroll-mt-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label mb-2">// components</p>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{visible.length} components</h2>
          </div>
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
                className="rounded border border-transparent px-2.5 py-1 font-mono text-[12px] text-dim transition-colors hover:text-fg aria-pressed:border-line aria-pressed:bg-panel aria-pressed:text-fg"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((doc) => (
            <ComponentCard key={doc.slug} doc={doc} index={components.indexOf(doc)} />
          ))}
        </ul>
      </section>

      <section id="install" className="container-page mt-24 scroll-mt-20">
        <p className="label mb-2">// install</p>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl">Get started</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <CodeBlock title="core.sh" code={INSTALL} prompt />
          <CodeBlock title="skia-and-gradient.sh" code={OPTIONAL} prompt />
        </div>
        <ul className="mt-6 grid gap-2 font-mono text-[13px] text-dim">
          <li>
            <span className="text-accent">→</span> import from the entry you need:{" "}
            <span className="text-fg">nami-motion/text · feedback · chat · gestures · gradient · skia</span>
          </li>
          <li>
            <span className="text-accent">→</span> Skia and gradient entries need their optional peers; the root entry never pulls
            them in.
          </li>
          <li>
            <span className="text-accent">→</span> Expo SDK 55, React Native 0.83+, Reanimated 4.2+, Worklets 0.7+.
          </li>
        </ul>
      </section>
    </>
  );
}
