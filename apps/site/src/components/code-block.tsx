import { TerminalWindow } from "./terminal-window";
import { CopyButton } from "./copy-button";

type CodeBlockProps = {
  title: string;
  code: string;
  prompt?: boolean;
};

export function CodeBlock({ title, code, prompt = false }: CodeBlockProps) {
  return (
    <TerminalWindow title={title} meta={<CopyButton text={code} />} bodyClassName="">
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code>
          {prompt ? <span className="text-accent">$ </span> : null}
          {code}
        </code>
      </pre>
    </TerminalWindow>
  );
}
