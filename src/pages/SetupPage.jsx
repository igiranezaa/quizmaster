// src/pages/SetupPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../state/quizContext";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";
import HistoryPanel from "../components/HistoryPanel";
import { fetchCategories, fetchQuestions } from "../lib/opentdb";

function applyTheme(isDark) {
  const root = document.documentElement;
  if (isDark) root.classList.add("dark");
  else root.classList.remove("dark");
  localStorage.setItem("quizmaster_theme", isDark ? "dark" : "light");
}

export default function SetupPage() {
  const navigate = useNavigate();

  const {
    settings,
    setSettings,
    categories,
    setCategories,
    setQuestions,
    setCurrentIndex,
    setSelectedAnswer,
    setAnswersLog,
    setScore,
    loading,
    setLoading,
    error,
    setError,
    history,
  } = useQuiz();

  // init theme + default timer fields if missing
  useEffect(() => {
    const savedTheme = localStorage.getItem("quizmaster_theme");
    const isDark = savedTheme === "dark";
    applyTheme(isDark);

    // safe defaults (won't break if your context doesn't define these yet)
    setSettings((s) => ({
      ...s,
      darkMode: typeof s.darkMode === "boolean" ? s.darkMode : isDark,
      timerEnabled: typeof s.timerEnabled === "boolean" ? s.timerEnabled : false,
      timerSeconds: Number.isFinite(s.timerSeconds) ? s.timerSeconds : 20,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadCats() {
      try {
        setError("");
        setLoading(true);
        const cats = await fetchCategories();
        if (mounted) setCategories(cats);
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load categories.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (!categories.length) loadCats();
    return () => {
      mounted = false;
    };
  }, [categories.length, setCategories, setError, setLoading]);

  async function startQuiz(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);

      // reset quiz state
      setQuestions([]);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setAnswersLog([]);
      setScore(0);

      const qs = await fetchQuestions(settings);

      // IMPORTANT: guard empty results
      if (!qs || qs.length === 0) {
        throw new Error(
          "No questions found for those settings. Try changing category/difficulty/amount."
        );
      }

      setQuestions(qs);
      navigate("/quiz");
    } catch (e2) {
      setError(e2.message || "Failed to start quiz.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Start a Quiz
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Choose a topic, difficulty, and number of questions.
            </p>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
            onClick={() => {
              const next = !settings.darkMode;
              setSettings((s) => ({ ...s, darkMode: next }));
              applyTheme(next);
            }}
          >
            {settings.darkMode ? "Light" : "Dark"}
          </button>
        </div>

        <div className="mt-5">
          <ErrorMessage message={error} />
        </div>

        <form className="mt-5 grid gap-4" onSubmit={startQuiz}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Topic
            </span>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              value={settings.category}
              onChange={(e) =>
                setSettings((s) => ({ ...s, category: e.target.value }))
              }
              disabled={loading}
            >
              <option value="">Any Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Difficulty
              </span>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                value={settings.difficulty}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, difficulty: e.target.value }))
                }
                disabled={loading}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Questions
              </span>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                value={settings.amount}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, amount: Number(e.target.value) }))
                }
                disabled={loading}
              >
                {[5, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Optional timer */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Optional Timer
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  If enabled, each question will have a countdown timer.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={!!settings.timerEnabled}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      timerEnabled: e.target.checked,
                    }))
                  }
                />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Enable
                </span>
              </label>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Seconds per question
                </span>
                <select
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  value={settings.timerSeconds ?? 20}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      timerSeconds: Number(e.target.value),
                    }))
                  }
                  disabled={loading || !settings.timerEnabled}
                >
                  {[10, 15, 20, 30, 45, 60].map((n) => (
                    <option key={n} value={n}>
                      {n} seconds
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Quiz"}
          </button>

          {loading && (
            <div className="pt-2">
              <Loader label="Preparing quiz..." />
            </div>
          )}
        </form>
      </div>

      <HistoryPanel history={history} />
    </div>
  );
}