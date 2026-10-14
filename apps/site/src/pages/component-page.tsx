import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router";
import { CodeBlock } from "../components/code-block";
import { CopyButton } from "../components/copy-button";
import { DemoVideo } from "../components/demo-video";
import { TerminalWindow } from "../components/terminal-window";
import { components, type PropRow } from "../data/components";

function Code({ value }: { value: string }) {
  if (value === "—") return <span className="text-dim">—</span>;
  return <code className="rounded bg-panel-2 px-1 py-0.5 font-mono text-[12px]">{value.replace(/`/g, "")}</code>;
}

function PropsTable({ rows, head }: { rows: PropRow[]; head: string[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-line bg-panel">
      <table className="w-full min-w-[560px] border-collapse text-left text-[14px]">
        <thead className="bg-panel-2 font-mono text-[12px] text-dim">
          <tr>
            {head.map((cell) => (
              <th key={cell} scope="col" className="px-3 py-2 font-normal">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-t border-line align-top">
              <td className="px-3 py-2 font-mono text-[13px] text-accent">{row[0]}</td>
              {row.slice(1, -1).map((cell, index) => (
                <td key={index} className="px-3 py-2">
                  <Code value={cell} />
                </td>
              ))}
              <td className="px-3 py-2 text-dim">{row[row.length - 1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ComponentPage() {
  const { slug } = useParams();
  const index = components.findIndex((doc) => doc.slug === slug);
  const doc = components[index];

  useEffect(() => {
    if (doc) document.title = `${doc.name} — nami-motion`;
    window.scrollTo(0, 0);
  }, [doc]);

  if (!doc) return <Navigate to="/" replace />;

  const previous = components[(index - 1 + components.length) % components.length];
  const next = components[(index + 1) % components.length];

  return (
    <article className="container-page pt-28 md:pt-32">
      <Link to="/" className="mb-8 inline-flex items-center gap-1.5 font-mono text-[13px] text-dim hover:text-fg">
        <IconArrowLeft size={14} />
        cd ..
      </Link>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <TerminalWindow title={`${doc.slug}.mp4`} meta={<span>10s</span>} bodyClassName="">
            <div className="aspect-[9/19.5] bg-panel-2">
              <DemoVideo slug={doc.slug} title={doc.name} mode="autoplay" />
            </div>
          </TerminalWindow>
        </div>

        <div className="min-w-0">
          <p className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[13px]">
            <span className="text-accent">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-dim">// {doc.entry}</span>
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{doc.name}</h1>
          <p className="mt-4 max-w-2xl text-dim">{doc.summary}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <span className="tag">{doc.category}</span>
            {doc.requires.map((item) => (
              <span key={item} className="tag">
                {item}
              </span>
            ))}
          </div>

          <section className="mt-10">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="label">prompt</h2>
              <CopyButton text={doc.prompt} label="copy prompt" copiedLabel="prompt copied" accent />
            </div>
            <TerminalWindow title="prompt.md" bodyClassName="">
              <pre className="max-h-64 overflow-auto p-4 text-[12.5px] leading-relaxed whitespace-pre-wrap text-dim">{doc.prompt}</pre>
            </TerminalWindow>
          </section>

          <section className="mt-10">
            <h2 className="label mb-3">install</h2>
            <CodeBlock title="install.sh" code={doc.install} prompt />
          </section>

          <section className="mt-10">
            <h2 className="label mb-3">usage</h2>
            <CodeBlock title={`${doc.slug}.tsx`} code={doc.usage} />
            {doc.notes ? (
              <div className="mt-4 space-y-3 text-[14px] text-dim">
                {doc.notes.split(/\n{2,}/).map((paragraph) => (
                  <p key={paragraph}>{paragraph.replace(/`/g, "")}</p>
                ))}
              </div>
            ) : null}
          </section>

          <section className="mt-10">
            <h2 className="label mb-3">props</h2>
            <PropsTable rows={doc.props} head={["prop", "type", "default", "description"]} />
            {doc.subProps ? (
              <div className="mt-6">
                <h3 className="mb-3 font-mono text-[13px] text-fg">{doc.subProps.title}</h3>
                <PropsTable rows={doc.subProps.rows} head={["field", "type", "description"]} />
              </div>
            ) : null}
          </section>

          <nav aria-label="Other components" className="mt-14 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
            <Link to={`/components/${previous.slug}`} className="btn justify-between">
              <IconArrowLeft size={14} />
              {previous.name}
            </Link>
            <Link to={`/components/${next.slug}`} className="btn justify-between">
              {next.name}
              <IconArrowRight size={14} />
            </Link>
          </nav>
        </div>
      </div>
    </article>
  );
}
