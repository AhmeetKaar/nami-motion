import { IconBrandGithub } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import { ThemeToggle } from "./theme-toggle";

const REPO_URL = "https://github.com/AhmeetKaar/nami-motion";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors ${
        scrolled ? "border-line bg-bg/90 backdrop-blur" : "border-transparent"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="font-mono text-[15px] font-semibold" aria-label="nami-motion home">
          <span className="text-accent">~/</span>
          nami-motion
        </Link>

        <nav aria-label="Main" className="flex h-full items-center">
          <NavLink
            to="/"
            end
            className="hidden h-full items-center border-b-2 border-transparent px-3 font-mono text-[13px] text-dim transition-colors hover:text-fg aria-[current=page]:border-accent aria-[current=page]:text-fg sm:flex"
          >
            components
          </NavLink>
          <a
            href="/#install"
            className="hidden h-full items-center border-b-2 border-transparent px-3 font-mono text-[13px] text-dim transition-colors hover:text-fg sm:flex"
          >
            install
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="grid size-9 place-items-center rounded text-dim transition-colors hover:bg-panel-2 hover:text-fg"
          >
            <IconBrandGithub size={18} stroke={1.75} />
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
