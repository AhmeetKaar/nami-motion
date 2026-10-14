import { Route, Routes } from "react-router";
import { Footer } from "./components/footer";
import { SiteHeader } from "./components/site-header";
import { ComponentPage } from "./pages/component-page";
import { HomePage } from "./pages/home-page";

export function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/components/:slug" element={<ComponentPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
