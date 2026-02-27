// src/components/Layout.jsx
import { Outlet, Link, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  function getPageLabel() {
    if (location.pathname === "/") return "Setup";
    if (location.pathname === "/quiz") return "Quiz";
    if (location.pathname === "/results") return "Results";
    return "";
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          
          <Link
            to="/"
            className="text-lg font-bold tracking-tight hover:opacity-80"
          >
            QuizMaster
          </Link>

          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {getPageLabel()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Built with React + Tailwind + OpenTDB API
      </footer>
    </div>
  );
}