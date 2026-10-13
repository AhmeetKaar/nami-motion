import Link from 'next/link';
import { catalog } from '@/lib/catalog';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-16">
      <section className="flex flex-col items-start gap-4">
        <p className="rounded-full border px-3 py-1 text-xs text-fd-muted-foreground">
          React Native · Expo · Reanimated 4
        </p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Production animations for chat-first apps
        </h1>
        <p className="max-w-2xl text-fd-muted-foreground">
          Shimmers, skeletons, thinking traces, voice waves, progress rings and
          drawer reveals, extracted from a shipping AI app. Install the
          package or copy the source.
        </p>
        <div className="flex gap-3">
          <Link
            href="/docs"
            className="rounded-full bg-fd-primary px-5 py-2 text-sm font-medium text-fd-primary-foreground"
          >
            Get started
          </Link>
          <code className="rounded-full border px-5 py-2 text-sm">npm install nami-motion</code>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.map((entry) => (
          <Link
            key={entry.slug}
            href={`/docs/components/${entry.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border bg-fd-card transition-colors hover:bg-fd-accent"
          >
            <div className="flex aspect-[4/5] items-center justify-center bg-fd-muted text-sm text-fd-muted-foreground">
              {entry.status === 'soon' ? 'In development' : entry.entry}
            </div>
            <div className="flex flex-col gap-1 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{entry.name}</h2>
                <span className="text-xs text-fd-muted-foreground">{entry.category}</span>
              </div>
              <p className="text-sm text-fd-muted-foreground">{entry.summary}</p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
