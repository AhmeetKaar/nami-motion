import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useCopy } from "../hooks/use-copy";

type CopyButtonProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
  accent?: boolean;
};

export function CopyButton({ text, label = "copy", copiedLabel = "copied", accent = false }: CopyButtonProps) {
  const { copied, copy } = useCopy();

  return (
    <button type="button" onClick={() => copy(text)} className={`btn ${accent ? "btn-accent" : ""}`} aria-live="polite">
      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      {copied ? copiedLabel : label}
    </button>
  );
}
