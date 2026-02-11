import { Outlet, Link, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">
            QuizMaster
          </Link>
          <div className="text-sm text-slate-500">
            {location.pathname === "/" && "Setup"}
            {location.pathname === "/quiz" && "Quiz"}
            {location.pathname === "/results" && "Results"}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="py-8 text-center text-sm text-slate-500">
        Built with React + OpenTDB
      </footer>
    </div>
  );
}
