import { IconCheck, IconGitBranch } from "@tabler/icons-react";
import { components } from "../data/components";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-panel font-mono text-[12px] text-dim">
      <div className="container-page flex flex-col gap-1 py-3 sm:h-9 sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-fg">
            <IconGitBranch size={13} />
            main
          </span>
          <span className="flex items-center gap-1">
            <IconCheck size={13} className="text-ok" />
            {components.length} components
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">React Native</span>
          <span className="hidden sm:inline">Reanimated</span>
          <span>MIT · Ahmet Kar</span>
        </div>
      </div>
    </footer>
  );
}
