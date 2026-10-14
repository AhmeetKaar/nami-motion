import { IconTerminal2 } from "@tabler/icons-react";
import type { ReactNode } from "react";

type TerminalWindowProps = {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function TerminalWindow({ title, meta, children, className = "", bodyClassName = "p-4" }: TerminalWindowProps) {
  return (
    <div className={`overflow-hidden rounded-md border border-line bg-panel ${className}`}>
      <div className="flex h-8.5 items-center justify-between gap-4 border-b border-line bg-panel-2 px-3 font-mono text-[12px] text-dim">
        <span className="flex items-center gap-2 truncate">
          <IconTerminal2 size={14} className="shrink-0" />
          {title}
        </span>
        {meta}
      </div>
      <div className={`font-mono text-[13px] leading-relaxed ${bodyClassName}`}>{children}</div>
    </div>
  );
}
